# Motion Studio AI — Fase 2

## Diagnóstico

O VÉRTICE 01 conserva marca, legibilidade e consistência técnica. A estrutura
se repete entre as cenas: título no alto, lata em pose quase sempre central e
assinatura no rodapé. As mudanças de pose e cor distinguem os cortes, mas com
pouca alteração da relação entre texto, produto e câmera. A Fase 2 experimenta
três gramáticas diferentes antes de definir o tratamento de VÉRTICE 02.

## Referências

A sessão recebeu o pedido de análise, mas não localizou arquivos ou links de
referência. O modelo de análise está na skill `motion-direction`. Os princípios
abaixo são hipóteses de direção testadas em materiais originais. A análise de
timecodes e das decisões estéticas das referências está pendente.

## Direção a partir do roteiro

O agente recebe texto livre e resolve a direção como parte do briefing.
Identifique os verbos e os contrastes. Se houver voz, gere ou importe a faixa
primeiro e ancore os beats a palavras e intervalos reais. Determine leitura
por comprimento de frase e complexidade visual. Ajuste o tempo na prévia.
Para formato alternativo, redesenhe a composição antes de escolher movimentos.

| Roteiro e tempo | Direção visual |
| --- | --- |
| A · “Muda o ritmo” · 0–1,3 s | Texto dominante no alto à esquerda. Máscaras e stagger de caracteres diferenciam o verbo do complemento. O raio ocupa o espaço negativo na diagonal, com click inicial. Preserve cerca de meio segundo de leitura após a entrada do complemento. |
| A · 1,3–3,0 s | O raio se compacta em losango e se torna uma abertura. Bézier de ataque tardio, trilha de poses em subintervalos, whoosh na antecipação e impacto no preenchimento. A forma vira o campo de cor seguinte. |
| A · “Acorda” · 3,0–5,0 s | A cor troca de função, a palavra avança em perspectiva e a assinatura acompanha um arco. Janela de leitura de cerca de 1,5 s após o stagger. |
| B · “18 horas de extração” · 0–2,2 s | Número dominante à esquerda, lata à direita e escala temporal na base. O giro e a aproximação carregam a lata até o lado oposto, com desfoque do fundo e whoosh. O número permanece à vista enquanto a escala de enquadramento muda. |
| B · “O tempo faz o sabor” · 2,2–5,0 s | A lata retorna à direita, contrai e recupera a profundidade. Spring com amortecimento e assentamento no impacto. O espaço aberto à esquerda recebe a relação causal em duas linhas. |
| C · “Do rascunho ao sinal verde” · 0–1,2 s | Mostre um quadro e um item na fila. O click cadencia a entrada. Dê tempo de identificar origem e destinos. |
| C · 1,2–2,4 s | O mesmo card expande e o centro cede espaço para revelar um gráfico estilizado. Click em 1,34 s. Entrada dos dados por stagger e contraste. |
| C · 2,4–5,0 s | O gráfico recolhe enquanto o card percorre um arco para “Aprovados”. Whoosh, impacto de assentamento e confirmação verde. Leitura do estado final por mais de um segundo. |

## Ferramentas

| Ferramenta | Decisão |
| --- | --- |
| Remotion 4.0.547 e skills oficiais | Mantidos no pipeline existente. Render offline, progressão por frame, Studio e QA. Uso sujeito aos termos do Remotion. |
| SVG e CSS estático | Formas correspondentes, máscaras, trajetória tipográfica e perspectiva são suficientes para os testes e passam pelo mesmo Chromium. |
| Three.js 0.187.0 | Dependência MIT já usada na Fase 1. Continua disponível. Os testes de perspectiva usam CPU e CSS, sem cena WebGL nova. |
| GSAP | Curvas e springs do Remotion atendem aos protótipos. Introduzir uma segunda timeline exigiria seek explícito e revisão da GSAP Standard License antes de adotar. |
| React Three Fiber | MIT. Só se justifica para cenas WebGL mais complexas. Dependências de React, Three, recursos gráficos e render consistente exigem teste no host. |
| Flubber e opentype.js | Ambos MIT. Correspondência de vértices é suficiente para a arte original. Morphs arbitrários de fontes exigem normalização de contorno e revisão da licença da fonte. |
| Playwright | Apache-2.0. Remotion já executa os renders em navegador e FFmpeg permite examinar cada frame. Avaliar para instrumentação de layouts e interações futuras. |
| FFmpeg e Flite | Usados localmente para mídia, detecção de silêncio e voz inglesa com tempo derivado dos fonemas. Sem uso de API. |
| WhisperX e ElevenLabs | WhisperX é BSD-2-Clause e adicionaria modelos, Python e dependências de inferência. ElevenLabs continua no adaptador já testado apenas com mocks, condicionado ao orçamento autorizado. |
| Blender | 4.3.2 disponível, GPL. Manter como opção offline para cenas 3D que requeiram materiais e câmera física. Não necessário para os experimentos. |

Sem novas dependências do npm ou instalação de sistema. Libflite e a voz
inglesa SLT são opcionais e já estavam disponíveis no Linux deste trabalho.
A ferramenta local usa a ABI da biblioteca compartilhada. As trilhas dos
testes são sintetizadas com semente fixa e coexistem com a mixagem da Fase 1.

## Reprodução

A composição `Promo` e o master VÉRTICE 01 continuam no motor anterior.
Os três IDs da Fase 2 são `TypeMorph`, `ProductMotion` e `InterfaceMotion`.
Cada estudo tem direção dedicada e layout nativo. O padrão é 60 FPS.
`--props='{"format":"wide","fps":30}'` altera os metadados e a composição;
opções de aspecto são `vertical`, `wide` e `square`.

```sh
python3 scripts/pro-audio.py
mkdir -p out/fase2
npx remotion render src/index.tsx TypeMorph out/fase2/TypeMorph.mp4 --scale=0.5 --color-space=bt709
npx remotion still src/index.tsx TypeMorph /tmp/type-impact.png --frame=169 --scale=0.5
npx remotion render src/index.tsx TypeMorph /tmp/type-transition.mp4 --frames=125-175 --scale=0.5
python3 scripts/pro-check.py
python3 scripts/pro-voice.py roteiro-en.txt voz.wav palavras.json
python3 scripts/audio.py cues palavras.json legendas.json --fps 60
```

O QA das prévias espera metade da resolução nativa. A saída de 60 FPS vai de
0 a 299 em cada estudo de 5 s. Uma produção de 15 s terá 900 frames de 0 a 899.
O navegador empacotado falhou no download. O teste usou Chromium 156 local,
DejaVu Sans e CPU. Compare PNGs com as mesmas versões e instalação de fontes
se a repetição produzir hashes diferentes. Codecs e timestamps de contêiner
podem introduzir diferenças binárias independentes dos pixels.

## Limites

- Morph usa contornos poligonais com vértices correspondentes. Não existe
  conversor genérico entre glifos, modelos 3D ou caminhos arbitrários.
- A lata explora perspectiva CSS. Não há modelagem física, profundidade de
  campo óptica nem iluminação por PBR. O blur de movimento é amostrado
  deterministicamente na trilha da forma, com espaçamento de um frame.
- O agente faz a interpretação criativa. A biblioteca não oferece geração
  automática de um layout profissional arbitrário a partir de uma única frase.
- Voz de referência e takes em português exigem timestamps importados do
  provedor/alinhador ou gravação fornecida. A voz local SLT é inglesa.
  Detecção de silêncio e RMS por palavra são medidas acústicas. A ênfase semântica pede revisão humana.
- Nenhum dos três testes usa narração. Cliques, whooshes, ambiência e impactos
  são originais. A análise objetiva de sincronização cobre marcos declarados.
- A produção e o master VÉRTICE 02 aguardam aprovação dos experimentos.

## Resultados da avaliação

| Estudo | Prévia | Pico | Leitura e continuidade observadas |
| --- | --- | --- | --- |
| A | 540 × 960 | −10,5 dBFS | O raio se torna matriz da mudança de cor. A pausa antes da abertura separa as duas frases. O arco funciona como assinatura, com peso secundário. |
| B | 960 × 540 | −11,0 dBFS | A travessia desloca o foco e abre o espaço da mensagem final. O título foi afastado da borda após a primeira inspeção. |
| C | 540 × 540 | −9,4 dBFS | O card preserva identidade entre fila, gráfico e aprovação. A posição final foi corrigida para preservar o cabeçalho e a confirmação. |

Cada prévia tem 5,000 s, 300 frames, 60 FPS, H.264 BT.709 e AAC. O QA do
motor decodificou o conteúdo e mediu nove âncoras de click e impacto, com
desvio de 0 ms dentro da resolução do teste. Não houve frames pretos ou
clipping detectados. O QA de mídia não substitui revisão de ritmo e som.
Foram inspecionados 18 frames nos quadros finais, além de duas amostras a
30 FPS de B em vertical e C em horizontal. A revisão artística foi visual
por amostragem, com sincronismo sonoro medido por correlação.

Renders independentes do frame 169 (A), 129 (B) e 166 (C) produziram PNGs
idênticos em seus pares. A verificação é amostral e no mesmo ambiente.
O teste Flite produziu WAV de 3,170 s, oito palavras temporizadas, RMS de
palavra, pausas e duas legendas em 60 FPS. O VÉRTICE 01 manteve seu SHA-256.
