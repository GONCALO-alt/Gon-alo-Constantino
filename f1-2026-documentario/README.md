# F1 2026 — Tudo o que aconteceu até ao Brasil

Documentário de cerca de 21 minutos, narrado em português do Brasil por uma voz masculina grave, sobre a temporada de Fórmula 1 de 2026, do GP da Austrália (8 de março) ao GP do Brasil (8 de novembro). As classificações são as de 11 de novembro de 2026.

## O que está nesta pasta

| Ficheiro | Para que serve |
|---|---|
| `guiao.py` | Guião completo (pt-BR): cenas, narração, textos no ecrã, pódios e classificações |
| `GUIAO.md` | O mesmo guião em texto corrido, com os tempos de cada cena |
| `F1_2026_ate_ao_Brasil.srt` | Legendas sincronizadas (para YouTube ou outro leitor) |
| `tts.py` | Gera a narração frase a frase (Kokoro, voz `pm_alex`, tom baixado ~3,5 semitons) |
| `musica.py` | Banda sonora original sintetizada, efeitos sonoros e mistura com *ducking* |
| `render.py` | Grafismo animado 1920×1080 a 25 fps (tipografia cinética, pódios, gráficos) |
| `timeline.py`, `legendas.py`, `build.sh` | Linha temporal, legendas e montagem final |

Para gerar o vídeo: `FONTS=<pasta com Anton, Barlow Condensed e Inter em .ttf> KOKORO_DIR=<pasta com kokoro-q8.onnx e voices.npz> ./build.sh`

O modelo `kokoro-q8.onnx` obtém-se juntando as 6 partes do pacote npm `kokoro-q8-shards`. O `voices.npz` faz-se a partir dos ficheiros `voices/*.bin` do pacote npm `kokoro-js`. Também é preciso `pip install kokoro-onnx soundfile` e o `espeak-ng`.

## Estrutura

1. Abertura e título
2. Capítulo I — A nova era: regras de 2026, a grelha e a polémica do motor Mercedes
3. Capítulo II — As 18 corridas da Austrália ao México, mais o cancelamento do Bahrein e da Arábia Saudita, a pausa de verão e o título de Antonelli
4. Capítulo III — O GP do Brasil: qualificação com chuva, penalizações, a corrida e as consequências
5. Capítulo IV — Balanço equipa a equipa
6. Capítulo V — Classificações de pilotos e de construtores a 11/11/2026 e o que ainda está em jogo
7. Fecho e fontes

## Rigor

- Os factos vêm de Formula1.com, FIA e imprensa especializada (The Race, PlanetF1, Sky Sports, Crash.net, GPFans, AP/Reuters).
- Onde as fontes divergiam, o pormenor ficou de fora. Exemplos: o motivo exato do abandono de Verstappen no Mónaco e as causas dos abandonos da McLaren em Baku.
- Nas polémicas, o ecrã separa **FATO** de **OPINIÃO**.
- Pontos de Leclerc: 249 na maioria das tabelas (algumas indicam 251). Ferrari: 512 (uma fonte indica 510). Racing Bulls: 112 (uma fonte indica 114).

## Imagens, música e voz

- **Imagens:** não há imagens reais das corridas. As imagens de TV da F1 pertencem à Formula One Management e não podem ser usadas sem licença. Todo o grafismo é original e gerado por código.
- **Música e efeitos:** compostos por código (`musica.py`), sem material de terceiros.
- **Voz:** narração sintética em pt-BR com o modelo Kokoro-82M (licença Apache-2.0), voz masculina `pm_alex`, tornada mais grave com *pitch shift* e equalização. Os nomes estrangeiros têm grafias fonéticas só para a pronúncia. Para uma versão final com locutor humano, gravar a narração a partir de `GUIAO.md` e substituir a faixa de voz.
- **Fontes tipográficas:** Anton, Barlow Condensed e Inter, todas com licença SIL Open Font License.
