# F1 2026 — Everything That Happened Up To Brazil

Documentário de cerca de 20 minutos, em inglês e narrado por uma voz masculina grave, sobre a temporada de Fórmula 1 de 2026, do GP da Austrália (8 de março) ao GP do Brasil (8 de novembro). As classificações são as de 11 de novembro de 2026.

## O que está nesta pasta

| Ficheiro | Para que serve |
|---|---|
| `guiao.py` | Guião completo (inglês): cenas, narração, textos no ecrã, pódios e classificações |
| `GUIAO.md` | O mesmo guião em texto corrido, com os tempos de cada cena |
| `F1_2026_Up_To_Brazil.srt` | Legendas sincronizadas (para YouTube ou outro leitor) |
| `tts.py` | Gera a narração frase a frase (Kokoro-82M, voz `am_deep`) |
| `musica.py` | Banda sonora original sintetizada, efeitos sonoros e mistura com *ducking* |
| `render.py` | Grafismo animado 1920×1080 a 25 fps (tipografia cinética, pódios, gráficos) |
| `timeline.py`, `legendas.py`, `build.sh` | Linha temporal, legendas e montagem final |

Para gerar o vídeo: `FONTS=<pasta com Anton, Barlow Condensed e Inter em .ttf> KOKORO_DIR=<pasta com kokoro-q8.onnx e voices.npz> ./build.sh`

O modelo `kokoro-q8.onnx` obtém-se juntando as 6 partes do pacote npm `kokoro-q8-shards`. O `voices.npz` faz-se a partir dos ficheiros `voices/*.bin` do pacote npm `kokoro-js`. Também é preciso `pip install kokoro-onnx soundfile` e o `espeak-ng`.

## Estrutura

1. Abertura e título
2. Capítulo I — A New Era: regras de 2026, a grelha e a polémica do motor Mercedes
3. Capítulo II — The Silver Surge: as 18 corridas da Austrália ao México, mais o cancelamento do Bahrein e da Arábia Saudita, a pausa de verão e o título de Antonelli
4. Capítulo III — Interlagos: qualificação com chuva, penalizações, a corrida e as consequências
5. Capítulo IV — Winners and Losers: balanço equipa a equipa
6. Capítulo V — Where We Stand: pilotos e construtores a 11/11/2026 e o que ainda está em jogo
7. Fecho e fontes

## Rigor

- Os factos vêm de Formula1.com, FIA e imprensa especializada (The Race, PlanetF1, Sky Sports, Crash.net, GPFans, AP/Reuters).
- Onde as fontes divergiam, o pormenor ficou de fora. Exemplos: o motivo exato do abandono de Verstappen no Mónaco e as causas dos abandonos da McLaren em Baku.
- Nas polémicas, o ecrã separa **FACT** de **OPINION**.
- Pontos de Leclerc: 249 na maioria das tabelas (algumas indicam 251). Ferrari: 512 (uma fonte indica 510). Racing Bulls: 112 (uma fonte indica 114).

## Imagens, música e voz

- **Imagens:** não há imagens reais das corridas. As imagens de TV da F1 pertencem à Formula One Management e não podem ser usadas sem licença. Todo o grafismo é original e gerado por código.
- **Música e efeitos:** compostos por código (`musica.py`), sem material de terceiros.
- **Voz:** narração sintética com o modelo Kokoro-82M (licença Apache-2.0). A voz `am_deep` mistura os estilos das vozes `am_michael` e `am_onyx`, o que a torna grave sem distorção nem alteração de tom. Para uma versão com locutor humano, gravar a narração a partir de `GUIAO.md` e substituir a faixa de voz.
- **Fontes tipográficas:** Anton, Barlow Condensed e Inter, todas com licença SIL Open Font License.
