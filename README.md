# Motion Studio AI

Estúdio de vídeos promocionais verticais com Remotion, React e TypeScript.
Use Codex ou Claude Code para transformar um briefing em um plano de cenas,
alinhar áudio e revisar a composição antes de gerar o master.

## Assistir e baixar

A [página de releases](../../releases) reúne o anúncio VÉRTICE 01, a prévia
animada e as folhas de contato. O master já está pronto em 1080 × 1920,
30 FPS e 15 segundos.

## Instalação

Requisitos deste projeto: Node.js 22+, npm, Python 3.10+, Git, FFmpeg e FFprobe.
Remotion pode baixar um navegador compatível ou usar o Chromium local.

```sh
git clone https://github.com/levibr10876-hash/Hist-rias-teste.git
cd Hist-rias-teste
npm ci
npm run typecheck
sh scripts/install-remotion-skills.sh
npm run studio
```

O instalador baixa as skills oficiais do Remotion na revisão usada neste
projeto e as disponibiliza no Codex e no Claude Code. A skill própria
`motion-studio-ai` já está no repositório.

## Criar um vídeo

1. Abra este diretório no Codex ou no Claude Code. Peça ao agente para ler
   [STUDIO.md](STUDIO.md) e descreva produto, público, duração, estética e CTA.
2. Use [o plano da demonstração](projects/demo.json) como referência. Cadastre
   mídia e créditos no manifesto do plano. Guarde referências privadas fora
   de `public/` e do Git.
3. Valide o plano, gere uma prévia, revise a composição e exporte o master.

```sh
python3 scripts/studio.py validate projects/demo.json
python3 scripts/studio.py preview projects/demo.json out/draft.mp4
python3 scripts/studio.py render projects/demo.json out/vertice.mp4
python3 scripts/studio.py review projects/demo.json out/vertice.mp4
```

A demonstração usa áudio original incluído em `public/demo.wav`.
Para preparar áudio próprio, gerar legendas ou autorizar uma chamada à
ElevenLabs, siga [o guia de áudio](STUDIO.md#áudio). A chave deve ser
fornecida como variável de ambiente no terminal.

Veja [o relatório da Fase 1](RELATORIO.md) para os resultados de QA, a revisão
visual, o diagnóstico do ambiente e os limites das integrações.
