# Motion Studio AI

## Do briefing ao vídeo

Abra este diretório no Codex ou no Claude Code. O agente é o intérprete do
briefing em linguagem natural. O renderizador recebe um plano JSON e pode ser
executado sem LLM, credenciais ou internet após instalar as dependências e o
navegador. Um novo projeto pode exigir novos componentes React para representar
o produto e o tratamento visual.

Exemplo de instrução para o agente

> Crie um teaser vertical de 15 s para a vela Bruma. Use a imagem e a trilha que
> forneci. Abra com a textura da cera, destaque a duração e encerre com
> “Conheça Bruma”. Evite chamadas pagas. Gere e inspecione a prévia antes do master.

1. Resuma público, promessa, CTA, duração e restrições. Identifique fontes e direitos.
2. Copie `projects/demo.json` como ponto de partida. Planeje cortes e áudio no
   mesmo FPS. Desenvolva o tratamento visual conforme o briefing.
3. Valide o plano, abra o Studio ou gere a prévia. Revise legibilidade, ritmo,
   contraste, transições, cadência das legendas e mixagem.
4. Renderize o master. Confira o QA, examine a folha de contato e reproduza a
   prévia com som. Registre os frames inspecionados e as pendências reais.

## Instalação e comandos

Requisitos Node.js 22+, npm, Python 3.10+, FFmpeg, FFprobe e Chromium compatível
com Remotion. A CLI pode baixar o navegador do Remotion quando não se indica
um Chromium local. Ative uma pasta de cache gravável se o ambiente exigir.

```sh
npm ci
npm run typecheck
python3 scripts/demo-audio.py
python3 scripts/studio.py validate projects/demo.json
npm run studio
# Opcional no Linux com Chromium instalado:
export STUDIO_CHROMIUM=/usr/bin/chromium
python3 scripts/studio.py preview projects/demo.json out/draft.mp4
python3 scripts/studio.py render projects/demo.json out/vertice.mp4
python3 scripts/studio.py qa projects/demo.json out/vertice.mp4
python3 scripts/studio.py review projects/demo.json out/vertice.mp4
```

A saída de `review` fica em `out/revisao/` ao usar o caminho acima.
`qa` exige o master na resolução definida no plano. A prévia usa meia
resolução. O master usa H.264, AAC quando há faixas e BT.709.

## Contrato do plano

- `width`, `height`, `fps`, `frames` definem o canvas vertical 9:16. As
  coordenadas de arte usam 1080 × 1920 e são escalonadas com o canvas.
- `brand` define nome, selo, paleta e fonte. `scenes` cobre todo o filme em
  intervalos contíguos, com frame inicial inclusivo. Cada cena define linhas,
  detalhe/CTA, tratamento e transição. A lata da demonstração está em
  `src/product.tsx`. Tratamentos novos podem importar esse componente ou
  substituí-lo por arte adequada ao seu projeto.
- `assets` registra caminho relativo a `public/`, crédito e licença.
  A chave opcional `scene.artwork` exibe PNG, JPEG ou WebP do manifesto.
  Mantenha referências privadas e materiais sem liberação fora de `public/`.
- `tracks` posiciona narração, música e efeitos no frame desejado e define o
  ganho linear de cada faixa. Abaixe a música durante a fala ao preparar o
  arquivo ou divida a faixa em stems. O QA verifica o pico da mixagem renderizada.
- `captions` recebe `text`, `from` e `frames` para cada trecho.
  `sync` lista cortes com sinal acústico de referência em uma faixa audível.
  A checagem procura o mesmo trecho no master com tolerância de um frame. Use
  a faixa de referência primeiro em `tracks` se houver camadas sobrepostas.
- `depth: true` ativa projeção de partículas pela câmera Three.js em CPU.
  A lata é desenhada em CSS. Materiais WebGL e importação de modelos 3D
  precisam de um componente adicional e teste no host de render.

O QA usa FFprobe e decodificação integral com FFmpeg. A checagem DOM durante a
renderização examina texto e elementos marcados com `data-qa-bounds`.
Decorações podem sangrar nas bordas. O detector não substitui a revisão de
oclusões, alinhamento semântico, composição e ritmo. Marque elementos críticos
quando criar cenas e confira os pontos de passagem na prévia.

## Áudio

```sh
python3 scripts/audio.py prepare material.wav public/voz.wav --denoise
node scripts/eleven.mjs narrar roteiro.txt voz.json ID_DA_VOZ
python3 scripts/audio.py cues voz.json legendas.json --mp3 voz.mp3 --fps 30
node scripts/eleven.mjs transcrever material.wav transcricao.json
python3 scripts/audio.py cues transcricao.json legendas.json --fps 30 --offset 0
```

`prepare` aplica filtro passa-altas, redução espectral de ruído opcional,
normalização de loudness e limitação de pico. `cues` converte alinhamento por
caractere ou timestamps de palavras em grupos de até quatro palavras.
Revise as quebras e a ortografia e incorpore o array em `captions`. A
narração decodificada pode passar por `prepare` antes de ser cadastrada.
Trilha e efeitos podem ser locais e licenciados, gravados ou sintetizados, como
no exemplo `scripts/demo-audio.py`.

A chave fica somente em `ELEVENLABS_API_KEY`. O adaptador consulta
`.audio-cache/` antes de qualquer rede. Para um cache miss, obtenha do usuário
autorização para uma chamada e registre o orçamento de créditos ou dinheiro
conforme a tarifa vigente da conta, incluindo possíveis arredondamentos.
Só então configure `ELEVEN_APPROVED_OPERATION` (`narrar` ou `transcrever`),
`ELEVEN_APPROVED_UNITS` (caracteres ou segundos arredondados para cima) e
`ELEVEN_APPROVAL_ID` (identificador exclusivo da aprovação). O ID é consumido
antes do POST. O teto de unidades limita o tamanho da solicitação. A conversão
para preço depende do plano e do orçamento configurado no provedor. Não
reaproveite uma autorização após erro de rede, nem compartilhe cache, transcrição
ou credenciais. Para mídia de terceiros, confirme permissão de envio ao provedor.

## Código e documentação oficial

`src/model.ts` define o contrato. `src/index.tsx` monta as sequências e valida
geometria. `src/motion.tsx` contém animações de texto e transições.
`src/product.tsx` contém a lata. `src/depth.tsx` contém a projeção Three.js.
`scripts/studio.py` coordena validação, render e revisão.

Skills oficiais em `.agents/skills/`, apontadas também por `.claude/skills/`.
Origem fixada em `a3f4098a2afd0e13f6a6f8c8760e275f75457ea9`.
Consulte os termos do Remotion aplicáveis à sua equipe antes de usar
comercialmente. [Agent Skills](https://www.remotion.dev/docs/agents/skills) ·
[Renderização](https://www.remotion.dev/docs/cli/render) ·
[Licença do Remotion](https://www.remotion.dev/docs/license) ·
[ElevenLabs API](https://elevenlabs.io/docs/api-reference/introduction)
