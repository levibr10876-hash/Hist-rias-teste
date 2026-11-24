# Motion Studio AI — Fase 1

## Entrega

VÉRTICE 01 é um anúncio de cold brew fictício com quatro cenas. A lata, a
identidade visual, a trilha e os efeitos foram produzidos para a demonstração.
O vídeo abre no produto, revela o processo de extração, muda a luz na cena de
sabor e encerra com “Experimente Vértice 01”. A trilha usa transientes nos cortes.

| Artefato | Caminho a partir de `/workspace/motion-studio` |
| --- | --- |
| Master | `out/vertice.mp4` |
| Prévia de render 540 × 960 | `out/draft.mp4` |
| Prévia animada do master | `out/revisao/previa.mp4` |
| Folha de contato e índices | `out/revisao/contact-sheet.png`, `out/revisao/frames.json` |
| Passagens de cena e CTA | `out/revisao/cortes.png` |
| Instalação e produção | `STUDIO.md` |

O projeto e suas saídas estão no workspace Linux. O diretório de anexos
designado pelo aplicativo não estava montado nesse ambiente.

## Ambiente e instalação

Debian 13.7, Node.js 24.22.3, npm 11.19.1, Python 3.12.14, Git 2.56.1,
FFmpeg e FFprobe 7.1.5 e Chromium 156 já estavam disponíveis. Havia 7,5 GiB
livres e 9,7 GiB de RAM visível, com limite efetivo de 8 GiB e 2 CPUs por cgroup.
Sem GPU exposta via `/dev/dri`, o render foi feito por CPU com duas instâncias
concorrentes. O cache padrão do npm não era gravável e foi redirecionado para
`/workspace/work/npm`. As ferramentas de sistema foram suficientes.

Instalei no projeto Remotion e CLI 4.0.547, React e React DOM 19.3.1,
TypeScript 7.0.2, Three.js 0.187.0 e os tipos correspondentes. O lockfile
registra as versões. O `npm audit` retornou zero vulnerabilidades conhecidas
na consulta feita durante a implementação.

## Avaliação das extensões

| Repositório e revisão | Inspeção e decisão |
| --- | --- |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) · `a3f4098` | Fonte indicada pela documentação oficial. Inspecionei manifesto, organização e instruções das skills selecionadas. Configurei boas práticas, render e legendas como arquivos locais, sem executar exemplos ou instaladores do repositório. O repositório consultado não continha um arquivo LICENSE na raiz. Consulte os termos Remotion para uso e redistribuição. |
| [iamaanahmad/agents-video-editing-skills](https://github.com/iamaanahmad/agents-video-editing-skills) · `981466b` | MIT. O manifesto declara Node ≥18.3 sem dependências de runtime. O instalador escreve instruções nos diretórios dos agentes e os utilitários Python executam FFmpeg e FFprobe. Cobre partes já implementadas, incluindo legendas, mixagem e QA. Ficou fora do projeto. |
| [henrikkvamme/motion-studio](https://github.com/henrikkvamme/motion-studio) · `9fbc933` | MIT. Scripts Python, FFmpeg e checagem de sincronização em Node. O cliente ElevenLabs também lê segredo de um arquivo da home e pode repetir POST após erros. Implementação local usa autorização de uso único e cache. Ficou fora do projeto. |
| [krzjablonski/promo-video](https://github.com/krzjablonski/promo-video) | URL retornou 404 e o clone retornou “Repository not found”. Código, licença e dependências ficaram sem avaliação. |

A revisão foi de origem, manifesto e caminhos relevantes de execução. O
resultado do npm audit cobre dependências instaladas e avisos conhecidos.

## Arquitetura

Codex e Claude Code usam o mesmo guia `STUDIO.md` via `AGENTS.md` e
`CLAUDE.md`. O agente converte o briefing em um plano de cenas e componentes
quando necessário. Remotion e React compõem o vídeo em frames. Módulos de
tipografia, transições, produto e profundidade podem ser reutilizados em outro
plano. O manifesto registra assets, autoria e licença. Faixas de áudio,
legendas e marcos de corte compartilham a timeline. Three.js projeta pontos
em perspectiva na CPU quando habilitado.

O pipeline de áudio aceita material do usuário, aplica redução de ruído
opcional, loudness e limitação por FFmpeg e permite mixar faixas no plano.
O adaptador ElevenLabs suporta narração com alinhamento e transcrição
temporizada. As respostas ficam em cache local por conteúdo e configuração.
A conversão de resultados em legendas usa FPS e deslocamento em frames.

O CLI valida dependências, intervalos e marcos antes do render. O navegador
verifica a geometria marcada. FFprobe e FFmpeg verificam formato, duração,
decodificação, quadros pretos, pico e posição do áudio. O arquivo final
substitui a saída somente após o QA.

## Evidências e limites

- Master de 15,000 s, 1080 × 1920, 30 FPS e 450 frames. H.264, YUV 4:2:0,
  BT.709 e AAC 48 kHz. O AAC inclui 19 ms de padding, dentro da tolerância
  de um frame. Pico medido de −5,1 dBFS.
- Marcos 105, 219 e 330 com deslocamento medido de 0 ms e correlação 1,00
  na precisão e na janela do teste.
- Inspecionei duas folhas com 24 imagens do master, cobrindo as quatro cenas,
  os cortes, as transições e o CTA. A primeira versão foi revisada e corrigida
  para dar mais espaço ao título da cena macro e exportar em BT.709.
- Testes negativos detectaram arquivo ausente, texto fora da composição,
  atraso artificial de 66 ms, clipping, frames pretos, duração errada e formato
  de pixel integral na primeira versão. Um nome longo também acionou a
  verificação de recorte interno da embalagem.
- Os renders de um segundo com duas faixas e legenda passaram, incluindo uma
  variante com imagem de produto do manifesto. Inspecionei um frame do primeiro
  teste. A preparação local gerou PCM de 48 kHz com redução de ruído.
- Narração, transcrição, conversão de timestamps, cache, teto de unidades e
  consumo único de autorização foram testados com respostas simuladas. Nenhuma
  chamada real à ElevenLabs foi executada. A demonstração tem trilha e efeitos
  originais e não contém locução. O contrato remoto e o custo real dependem de
  teste autorizado e das tarifas da conta.
- A verificação geométrica cobre elementos marcados. O teste de sincronização
  verifica pontos explícitos. A avaliação visual foi por amostragem, sem uma
  avaliação auditiva subjetiva. Ritmo, oclusões e leitura editorial do filme
  exigem revisão humana no uso em produção.
- O ambiente executou o trabalho pelo Codex. A configuração de instruções e
  skills do Claude Code está pronta no projeto, mas o CLI do Claude Code não
  estava instalado aqui para um teste ponta a ponta.
