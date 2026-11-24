import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {mkdir, readFile, writeFile, copyFile, rename, rm, open} from 'node:fs/promises'
import {basename, dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const projectCache = fileURLToPath(new URL('../.audio-cache/', import.meta.url))

export async function eleven({operation, input, output, voice = '', fetcher = fetch,
  env = process.env, cacheDirectory = projectCache}) {
  if (!['narrar', 'transcrever'].includes(operation)) throw Error('Use narrar ou transcrever.')
  const speech = operation === 'narrar'
  const data = await readFile(input)
  const text = speech ? data.toString('utf8').trim() : ''
  if (speech && (!text || !/^[A-Za-z0-9]{1,64}$/.test(voice))) throw Error('Informe texto e ID de voz.')
  const model = speech ? 'eleven_multilingual_v2' : 'scribe_v2'
  const hash = createHash('sha256').update(JSON.stringify([operation, model, voice, 'v1'])).update(data).digest('hex')
  const cache = resolve(cacheDirectory, hash)
  await mkdir(dirname(cache), {recursive: true, mode: 0o700})
  const save = async () => {
    await mkdir(dirname(output), {recursive: true})
    await copyFile(cache, output)
  }
  try {
    await save()
    return 'cache'
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const unitLimit = Number(env.ELEVEN_APPROVED_UNITS)
  const amount = speech ? [...text].length : Math.ceil(Number(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', resolve(input),
  ], {encoding:'utf8'})))
  if (!Number.isSafeInteger(unitLimit) || !(amount > 0 && amount <= unitLimit) ||
      env.ELEVEN_APPROVED_OPERATION !== operation || !env.ELEVENLABS_API_KEY) {
    throw Error('Cache ausente. Requer autorização explícita para uma chamada, limite e chave.')
  }

  // Consume the approval before sending. An uncertain result never triggers a retry.
  const approval = env.ELEVEN_APPROVAL_ID
  if (!approval || !/^[A-Za-z0-9_-]{8,80}$/.test(approval)) throw Error('Informe ID único da autorização.')
  const pending = await open(cache + '.lock', 'wx', 0o600)
  try {
    try {
      await save()
      return 'cache'
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    const used = await open(resolve(cacheDirectory, 'approval-' + approval), 'wx', 0o600)
    await used.close()
    const headers = {'xi-api-key':env.ELEVENLABS_API_KEY}
    let body
    if (speech) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify({text, model_id:model})
    } else {
      body = new FormData()
      body.set('file', new Blob([data]), basename(input))
      body.set('model_id', model)
      body.set('timestamps_granularity','word')
    }
    const endpoint = speech ? 'text-to-speech/' + voice + '/with-timestamps?output_format=mp3_44100_128' : 'speech-to-text'
    const response = await fetcher('https://api.elevenlabs.io/v1/' + endpoint, {
      method:'POST', headers, body, redirect:'error', signal:AbortSignal.timeout(120000),
    })
    if (!response.ok) throw Error('ElevenLabs retornou HTTP ' + response.status)
    const result = await response.json()
    if (speech ? !result.audio_base64 || !result.alignment : !Array.isArray(result.words)) {
      throw Error('Resposta sem áudio/alinhamento ou sem palavras temporizadas.')
    }
    await writeFile(cache + '.tmp', JSON.stringify(result), {mode:0o600})
    await rename(cache + '.tmp', cache)
    await save()
    return 'api'
  } finally {
    await pending.close()
    await rm(cache + '.lock', {force:true})
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [operation, input, output, voice] = process.argv.slice(2)
  eleven({operation,input,output,voice}).then(console.log).catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
}
