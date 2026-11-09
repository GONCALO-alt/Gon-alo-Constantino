# Corte Studio — editor de vídeo profissional

Aplicação desktop de edição de vídeo multipista (Electron + React + TypeScript), inspirada no fluxo de trabalho
do CapCut Desktop mas com identidade própria, com **exportação real via FFmpeg até 4K UHD (3840×2160) a 60 FPS**
em H.264 ou H.265/HEVC com áudio AAC.

## Arranque rápido

Requisitos: Node.js 20.11+ (o FFmpeg/FFprobe vêm embutidos via `ffmpeg-static`/`ffprobe-static`).

```bash
cd video-editor
npm install
npm run dev        # modo de desenvolvimento (Vite + Electron com hot reload)
npm run build      # verificação de tipos + build do renderer e do processo principal
npm start          # corre a build de produção
npm run dist       # instalador (electron-builder: NSIS/DMG/AppImage)
npm test           # testes unitários + testes de exportação com o FFmpeg real
npm run test:e2e   # testes ponta-a-ponta da app (Linux sem ecrã: xvfb-run -a npm run test:e2e)
```

Para usar outro FFmpeg (ex. com mais codificadores de GPU): `FFMPEG_PATH=/caminho/ffmpeg FFPROBE_PATH=/caminho/ffprobe npm start`.

## Arquitetura

```
video-editor/
├── shared/               Lógica partilhada (renderer + processo principal + testes)
│   ├── types.ts          Modelo do projeto: média, pistas, clips, keyframes, efeitos, transições
│   ├── expr.ts           Mini-linguagem de expressões f(T): avaliada em JS E convertida para FFmpeg
│   ├── animation.ts      Keyframes (easing), animações de entrada/saída, movimento, transições
│   ├── looks.ts          Correção de cor, filtros (curvas por canal), parâmetros dos efeitos
│   ├── geometry.ts       Tamanho base das camadas (encaixe no canvas, recorte)
│   ├── exportGraph.ts    Gerador do filtergraph FFmpeg a partir do projeto (função pura)
│   └── timeline.ts, defaults.ts, srt.ts
├── electron/             Processo principal (Node)
│   ├── main.ts           Janela, IPC, protocolo media:// com streaming (Range)
│   ├── projects.ts       Biblioteca de projetos, autosave atómico, histórico, recuperação
│   └── ffmpeg/           ffprobe, miniaturas, tira de miniaturas, ondas, proxies,
│                         deteção de codificadores de hardware, executor da exportação
├── src/                  Interface (React)
│   ├── engine/           Compositor WebGL2, leitor (sincronização + Web Audio), texto
│   ├── store/            Estado (zustand + immer) com desfazer/refazer e operações de edição
│   ├── components/       Página inicial, editor, timeline, pré-visualização, inspetor, painéis
│   └── captions/         Whisper (transformers.js) num Web Worker, SRT
└── tests/                Vitest (edição + exportação real) e E2E com Playwright
```

**Garantia "o que vês é o que exportas".** Todas as animações (keyframes, transições, animações de texto,
efeitos de movimento) são descritas uma única vez como expressões de `shared/expr.ts`. A pré-visualização
avalia-as em JavaScript a cada fotograma; a exportação converte exatamente as mesmas expressões para a
sintaxe do FFmpeg (`overlay`, `perspective`, `geq`…). A cor usa as mesmas fórmulas no shader WebGL e no
FFmpeg (`eq`, `colorchannelmixer`, `lutrgb`). Os testes E2E comparam um píxel do preview com o mesmo píxel
do ficheiro exportado (diferença máxima medida: 4/255).

**Exportação.** O projeto é convertido num único `filter_complex`: cada clip é recortado na fonte
(`-ss/-t`), normalizado para o FPS de saída, recortado/escalado com Lanczos, colorido, com efeitos, e
composto com `overlay` sobre um fundo à resolução final. Escala e rotação animadas usam `perspective` com
tamanho fixo (robusto em qualquer versão do FFmpeg); opacidade, fade para preto, desfoque e glitch animados
usam máscaras `geq` 2×2 ampliadas + `blend=multiply`. Os textos são renderizados em PNG à resolução final
(nítidos em 4K). O áudio é misturado com `atempo`, `volume` (keyframes), `afade`, `adelay` e `amix`, com
limitador. No fim, o ficheiro é verificado com `ffprobe` e a resolução/FPS/codec reais são mostrados.

## Funcionalidades

| Área | Implementado |
|---|---|
| Interface | Tema escuro, barra lateral de ferramentas, biblioteca, preview central, timeline, inspetor; painéis adaptáveis à resolução; animações de interface |
| Importação | MP4, MOV, MKV, WebM, AVI, MTS… · PNG, JPG, WebP… · MP3, WAV, AAC, M4A, FLAC, OGG…; vários ficheiros; arrastar e largar (janela, biblioteca ou diretamente numa pista); miniatura, duração, resolução, FPS, codec e tamanho |
| Timeline | Pistas de vídeo/imagem, áudio e texto ilimitadas; sobreposições (camadas); arrastar entre pistas; aparar; dividir; zoom (Ctrl+roda, slider, ajustar); snap a cortes/cursor/marcadores; bloquear, ocultar, silenciar e reordenar pistas; desfazer/refazer (200 passos); copiar/colar/duplicar; ripple delete; marcadores; tiras de miniaturas e formas de onda |
| Vídeo | Crop (com proporções rápidas), escala, posição, rotação, espelhar H/V, velocidade 0,1×–10× (câmara lenta/rápida com áudio sem alteração de tom), congelar fotograma (resolução total), opacidade, volume, brilho/contraste/saturação/temperatura/tonalidade, keyframes com easing para posição/escala/rotação/opacidade/volume, manipulação direta no preview (mover/escalar/rodar) |
| Áudio | Aparar, volume até 200 % com keyframes, fade in/out, silenciar/remover áudio do vídeo, separar áudio para pista própria (ligado ao vídeo), música, sincronização automática por correlação das formas de onda |
| Texto | Fontes embutidas e do sistema, tamanho, cor, negrito/itálico/sublinhado, alinhamento, espaçamento, contorno, sombra, caixa de fundo, 10 animações de entrada/saída, 10 predefinições de títulos animados, legendas |
| Efeitos | Desfocar, nitidez, vinheta, grão, glitch, P&B, sépia, inverter (intensidade individual); 12 filtros cinematográficos com intensidade; 6 efeitos de movimento (tremer, Ken Burns, pulsar, flutuar, balançar) |
| Transições | Fade (preto), dissolver, zoom in/out, deslizar ×4, desfoque, glitch — duração ajustável, aplicar a todos os cortes |
| Pré-visualização | WebGL2 em tempo real com todos os efeitos/transições, play/pausa, fotograma a fotograma, velocidade 0,25×–2×, repetir, ecrã inteiro, captura de fotograma PNG, medidor de nível de áudio |
| Legendas | Geração automática com Whisper local (tiny/base/small), deteção de idioma, divisão em frases curtas sincronizadas, edição de cada frase, estilo global, importação/exportação SRT, incorporadas no vídeo exportado |
| Exportação | 720p, 1080p, 1440p, 4K UHD (proporção do projeto respeitada, ex. 2160×3840 em 9:16); 24/25/30/50/60 FPS; H.264 e H.265/HEVC; bitrate ou CRF; preset de velocidade; AAC 128–320 kbps; codificadores de GPU (NVENC, Quick Sync, AMF, VideoToolbox, VA-API) detetados e testados em tempo real; descodificação por hardware; barra de progresso, ETA, fps de render, cancelar (apaga o ficheiro parcial); verificação final com ffprobe |
| Desempenho | Proxies H.264 automáticos para formatos sem leitura direta (ex. ProRes, HEVC, MPEG-4 em MKV) ou manuais para 4K; exportação usa sempre os originais; pool de elementos de vídeo só para clips próximos do cursor; tiras de miniaturas e ondas virtualizadas |
| Projetos | Biblioteca na página inicial, criar (6 proporções), abrir, guardar, guardar como, renomear, duplicar, apagar, exportar projeto com média (pasta autónoma), autosave ~1 s após cada alteração (escrita atómica), histórico de versões (1/min, 50), recuperação após encerramento inesperado |

## Testes realizados

- `tests/export.test.ts` — gera média com o FFmpeg e exporta um projeto com 10 clips em 4 pistas
  (transições, keyframes, filtros, efeitos, velocidade 2× e 0,5×, texto animado, música com fades):
  confirma **3840×2160, 60 FPS, H.264 + AAC, 540 fotogramas**; HEVC; píxeis de posição/opacidade; cancelamento;
  mistura de áudio para legendas.
- `tests/editing.test.ts` — dividir (com keyframes), colisões entre pistas, separar áudio, congelar fotograma
  (com áudio ligado), ripple delete, transições, volume, coerência JS↔FFmpeg das expressões, SRT.
- `tests/e2e/*.cjs` — conduzem a app Electron real: importar, adicionar clips, texto, transição, filtro, efeito,
  dividir, desfazer/refazer, keyframes, reprodução, autosave, **exportação 4K60 pela interface**, recuperação
  após `SIGKILL`; arrastar/aparar, velocidade, separar áudio, congelar fotograma, SRT, histórico, exportação HEVC,
  e coerência de cor preview ↔ exportação.

## Limitações conhecidas / próximos passos

- **Legendas automáticas**: implementadas com Whisper (transformers.js + ONNX), mas não puderam ser testadas
  ponta-a-ponta no ambiente de desenvolvimento (sem acesso à Hugging Face). Na primeira utilização o modelo
  (40–250 MB) é descarregado; depois funciona offline.
- **Codificadores de GPU**: a deteção e os argumentos estão implementados, mas só os codificadores de software
  (x264/x265) foram testados aqui (sem GPU). Um FFmpeg sem um dado codificador simplesmente não o mostra.
- **Velocidade de exportação**: 4K60 em software é exigente (no teste, 9 s de projeto complexo ≈ 1,5–2 min
  em 4 núcleos). Com NVENC/Quick Sync é muito mais rápido.
- Desfoque e glitch *animados* (transições) são uma mistura com a versão de intensidade máxima — igual no preview
  e na exportação, mas não um desfoque de raio variável verdadeiro.
- Ainda não existem: animação "máquina de escrever" no texto, reprodução invertida, chroma key, efeitos de
  áudio (equalizador/redução de ruído), biblioteca de música incluída, curvas de cor avançadas.
- O preview depende dos codecs do Chromium; ficheiros não suportados usam proxies automaticamente.
- O instalador (`npm run dist`) está configurado mas não foi gerado neste ambiente.
