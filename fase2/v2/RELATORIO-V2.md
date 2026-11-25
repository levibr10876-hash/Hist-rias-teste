# Motion Studio AI · revisão 2.1

| Estudo | Causa confirmada | Correção conferida no render |
| --- | --- | --- |
| A | Recorte curto sobre glifos deslocados. Contorno e expansão em fases separadas, com atraso até o aparecimento de “ACORDA”. | Blocos inteiros, marcos correspondentes de contorno, curva contínua de pose e passagem direta da forma para o fundo. O título entra antes de o campo terminar de abrir, e o traço final continua em movimento. |
| B | Uma segunda instância, recortada por elipse, usava escala, posição e pose próprias. A volta desalinhava o macro e os títulos se sobrepunham. | Uma única lata com âncora constante e trilhas contínuas de posição, log de escala e rotação. A saída de “18h” antecede a nova frase. |
| C | Linhas do título tinham cadências distintas. Durante a expansão, o texto da faixa cruzava a capa. Algumas mudanças trocavam o ícone e a largura de uma vez. | Duas entradas foram renderizadas e comparei suas sequências. A simultânea foi escolhida. A composição preserva o cartão na expansão, libera a área do título, mantém a caixa dos controles e encadeia foco, reprodução e confirmação de fila. |

**Validação.** 6 s, 540 × 960, 60 FPS e 360 quadros por vídeo. Comparei
sequências consecutivas com a versão anterior. Nos quadros 106–212 de A,
a contagem de pares de quadros decodificados idênticos caiu de oito para
zero. Nos quadros 90–216 de B, a maior diferença média de luma entre
vizinhos caiu de 42,2 para 10,6 (escala 0–255). Essas métricas sinalizam
mudanças temporais e não medem qualidade artística.

Oito modos tipográficos passaram pela fixture DOM em 68 frames, com duas
fontes, alturas de linha distintas, acentos, marcas combinantes e
descendentes. Validei os cinco modos de grupo, a continuidade C1 das
trilhas e 1.441 amostras do contorno. Um PNG de cada vídeo foi idêntico
entre dois renders independentes. Preservei os WAV e os MP4 antigos
byte a byte. Os 13 marcos de áudio no AAC coincidiram com a faixa de origem
na resolução da medição. Isso mede alinhamento da trilha, não percepção
audiovisual. Picos de −10,1 a −9,4 dBFS, sem clipping detectado.

**Ferramentas.** `scripts/temporal-qa.py` gera sequências, CSV de diferenças
e gráficos de trajetória, velocidade e aceleração. A skill
`motion-direction` registra causas, tratamento e regressões. As evidências
locais estão em `/workspace/work/fase21-audit`.

**Limite.** A inspeção visual foi por trechos consecutivos e amostras de
composição. Não houve reprodução audiovisual contínua para julgar o ritmo
e a mixagem subjetivamente. VÉRTICE 02 permanece fora desta entrega.
