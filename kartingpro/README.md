# KARTING PRO

**TRAIN. IMPROVE. RACE.** Treinador pessoal para pilotos de karting: cronómetro de voltas, treino de reflexos e de
concentração, diário de kartódromo, estatísticas, desafios diários e níveis. Funciona no telemóvel, sem conta, e os
dados ficam guardados só no dispositivo.

## Executar

Precisa apenas de Python 3 (ou de qualquer servidor de ficheiros estáticos).

```bash
cd kartingpro
python3 -m http.server 8080
```
Abre `http://localhost:8080` no computador.

## Instalar no telemóvel (PWA)

1. Com o computador e o telemóvel na mesma rede Wi-Fi, corre o comando acima e vê o IP do computador
   (por exemplo `192.168.1.20`).
2. No telemóvel abre `http://192.168.1.20:8080`.
3. **Android (Chrome):** menu ⋮ › *Instalar app* ou *Adicionar ao ecrã principal*.
   **iPhone (Safari):** botão Partilhar › *Adicionar ao ecrã principal*.
4. Abre o KARTING PRO pelo ícone: abre em ecrã inteiro, na vertical.

Para funcionar sem rede e com GPS, o browser exige HTTPS (exceto `localhost`). A forma mais simples é publicar a pasta
`kartingpro/` num serviço de páginas estáticas com HTTPS (GitHub Pages, Netlify, Cloudflare Pages). Depois da primeira
visita, a app abre mesmo sem rede.

**Ficheiro único:** `python3 build.py` cria `dist/karting-pro.html`, que abre em qualquer browser (sem instalação nem
modo offline).

## Testar

```bash
node tests/stopwatch.test.js     # testes do motor do cronómetro
```

Lista de verificação no telemóvel:
1. Cria o perfil (nome, kart, kartódromo).
2. **Cronómetro**: escolhe "Volta mínima: Sem", toca em INICIAR e depois em VOLTA várias vezes. Confirma a melhor volta
   destacada, a média, o Δ para a melhor e o desvio. Toca em *Anular* logo a seguir a uma volta para a apagar.
3. Fecha a app a meio da sessão e volta a abrir: a sessão continua com as mesmas voltas e o tempo continuou a contar.
4. Mantém premido TERMINAR: a sessão é guardada e abre o detalhe. Toca numa volta para a invalidar; edita o diário.
5. **Treino**: faz a reação à luz (5 tentativas) e um exercício de concentração; vê o resultado e a evolução.
6. **Diário**: cria uma entrada manual (melhor volta no formato `0:58.912`) e vê o dia marcado no calendário.
7. **Estatísticas**: muda entre 7, 30, 90 dias e Tudo; toca nos gráficos para ver os valores; abre "Ver dados em tabela".
8. **Perfil** (avatar no topo): edita os dados, vê níveis e recompensas, exporta CSV/JSON e importa a cópia.

## Precisão do cronómetro
- Cada volta é calculada a partir do instante exato do toque (`event.timeStamp`, alta resolução), não da hora a que o
  ecrã é redesenhado. Se o ecrã congelar ou a app for para segundo plano, os tempos continuam certos.
- O estado da sessão (instantes de início, pausas e voltas) é guardado a cada toque, por isso sobrevive a fechar a app.
- A *volta mínima* ignora toques duplos; *Anular* remove uma volta marcada por engano.
- O ecrã fica ligado durante a sessão (quando o browser o permite). Teclas Espaço/Enter também marcam a volta,
  útil com um teclado ou botão Bluetooth.
- **GPS (experimental):** calibra a linha de meta (Perfil › GPS) e liga "voltas automáticas" no cronómetro.
  O GPS de um telemóvel erra tipicamente 3–10 m e atualiza cerca de 1 vez por segundo (a 60 km/h, 0,2–0,6 s por volta):
  serve para contar voltas, não substitui o botão VOLTA.

## Funcionalidades
- **Início:** perfil, nível e XP, sessões, melhor volta, reação média, sequência de dias, última sessão,
  desafios do dia, evolução e acesso rápido ao cronómetro.
- **Cronómetro:** INICIAR, VOLTA, PAUSAR/RETOMAR, TERMINAR (manter premido); tempo atual, última, melhor, média, voltas,
  Δ para a melhor, desvio; volta de saída opcional; sessões anteriores, detalhe, invalidar voltas, notas, comparação de
  duas sessões, eliminar, exportar.
- **Treino:** reflexos (reação à luz, reação a sinais, reação visual) e concentração (memória, atenção,
  identificação rápida de bandeiras, concentração sustentada de 90 s). Resultados guardados com melhor, média, acertos,
  erros, precisão e evolução.
- **Diário:** calendário com dias de karting e de treino; circuito, data, kart, voltas, melhor volta, média,
  meteorologia, pista, sensações, o que correu bem e o que melhorar; editar e consultar.
- **Estatísticas:** filtros de período; melhor volta e média por sessão (por circuito), sessões por semana, evolução dos
  reflexos, precisão dos exercícios, recordes pessoais e comparação com o período anterior.
- **Progressão:** 5 níveis (Rookie, Amateur, Advanced, Pro, Elite), XP por sessões, diário completo, exercícios e
  desafios; 3 desafios por dia; sequência de dias; recompensas. Para não incentivar excesso de treino, os exercícios só
  dão XP até 6 por dia.

## Privacidade
Sem conta e sem servidor. Nada é enviado para lado nenhum; os dados ficam no armazenamento local do browser.
Exporta uma cópia de segurança (Perfil › Exportar › JSON) e importa-a noutro telemóvel se precisares.

## Estrutura do código
| Pasta / ficheiro | Responsabilidade |
|---|---|
| `src/core/util.js` | formatação de tempos e datas, estatística, fonte de tempo |
| `src/core/store.js` | dados locais, exportação CSV/JSON, importação, ponto de ligação para sincronização (`KP.sync`) |
| `src/core/progress.js` | XP, níveis, desafios diários, sequência, recompensas |
| `src/features/stopwatch.js` | motor do cronómetro (lógica pura, testada em `tests/`) |
| `src/features/gps.js` | calibração da linha de meta e deteção de passagens |
| `src/ui/components.js` | ícones, bandeiras, folhas, avisos, gráficos, calendário |
| `src/ui/app.js` | navegação e páginas |
| `src/views/*.js` | Início, Cronómetro, Sessões, Treino, Diário, Estatísticas, Perfil |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e funcionamento sem rede |

**Sincronização futura:** cada registo tem `id`, `updatedAt` e os apagados ficam marcados (`deleted`), por isso juntar
dados de vários dispositivos é uma questão de registar um adaptador (`KP.sync.register({pull, push})`) para o serviço
escolhido. A importação de cópias já usa a mesma lógica de junção.
