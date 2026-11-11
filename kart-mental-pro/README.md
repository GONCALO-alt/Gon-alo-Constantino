# KART MENTAL PRO 🏎️

Aplicação de preparação mental e cognitiva para pilotos de karting, feita para iPhone (Safari) e instalável no ecrã principal como app (PWA). Funciona sem internet e guarda tudo no próprio dispositivo — sem contas nem servidores.

## O que tem

- **Início (painel da equipa):** saudação, dias seguidos, progresso dos 21 dias (anel + 21 luzes estilo volante de F1), tempo total, melhor reação, média de reação, precisão, treino de hoje com **COMEÇAR TREINO**, exercício recomendado, desafio do dia e acesso rápido aos 12 exercícios.
- **12 exercícios interativos**, cada um com 3 níveis (Base, Competição, Elite), feedback no fim, comparação com a sessão anterior, recorde pessoal (a roxo, como nos tempos da F1) e botão **Repetir**:
  1. Teste de Reflexos — cor muda ao acaso, tempo em ms, antecipações; no nível Elite há cores-armadilha.
  2. Tabela de Schulte — 5×5, cronómetro automático, erros; Elite em ordem inversa.
  3. Visão Periférica — símbolo central fixo, estímulos em 4/8 posições, precisão e tempo de resposta.
  4. Memória de Cores — sequências que crescem, 2 vidas, maior sequência.
  5. Simulador de Partida — 5 luzes vermelhas, apagam ao fim de um tempo aleatório, falsas partidas.
  6. Seguimento Visual — karts-alvo que se misturam (linear, circular, em oito, ziguezague, aleatório), velocidade a subir.
  7. Cálculo Mental — 4 operações, 4 respostas, tempo limite, 3 níveis.
  8. Teste Stroop — palavra vs. cor da tinta, conflito progressivo.
  9. Encontra as Diferenças — cenas de pista geradas de novo em cada sessão, cronómetro, pontuação por precisão.
  10. Memória de Números — sequências que crescem, recorde.
  11. Memorização de Circuitos — estudar o mapa (curvas, travagens, zona de ultrapassagem), perguntas de memória e sequência completa de curvas. Traçados reais de **Portimão e Estoril** e de **16 circuitos de Fórmula 1** (Mónaco, Monza, Silverstone, Spa, Suzuka, Interlagos, Imola, Barcelona, Zandvoort, Red Bull Ring, Hungaroring, Albert Park, Bahrain, Montreal, Austin, Yas Marina), 3 traçados de karting de treino e **circuitos personalizados** no editor (ex.: a pista onde corres).
  12. Visualização Mental — sessão guiada (3/5/10/15 min) com respiração, volta curva a curva com o kart a andar no mapa, voz opcional e autoavaliação.
- **Programa de 21 dias** (calendário Seg→Dom como pedido), duração estimada, objetivo do dia, progresso, recuperar dias em falta, reiniciar. Adapta-se: o nível de cada exercício sobe com 2 sessões ≥ 80 pontos e desce com 2 abaixo de 45 (no máximo 1 mudança por dia); a 1.ª semana tem 2 exercícios por dia e as seguintes 3, mas se na semana anterior fizeste menos de metade dos dias o plano mantém 2.
  - Sábado: revisão dos 3 exercícios mais fracos **ou** registo de treino real de kart.
  - Domingo: análise da semana (comparação com a anterior, ponto forte e fraco, notas).
- **Estatísticas:** melhor/média de reação, evolução da reação, evolução semanal (minutos e pontuação), evolução por exercício, precisão por exercício, recordes, tempo total, dias concluídos, histórico de sessões e treinos de pista.
- **Extra:** 24 medalhas/conquistas, desafios diários, treino livre e guiado, sons opcionais, lembrete diário (notificação ou evento no Calendário do iPhone), cópia de segurança (exportar/importar).

Todos os resultados vêm do que fazes na app: não há valores inventados.

**Traçados reais:** coordenadas de [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (licença MIT; dados não oficiais, sem ligação à Fórmula 1), convertidas por `tools/import-f1.mjs` para `js/tracks-real.js`. As curvas principais são detetadas automaticamente pela curvatura do traçado e as travagens são estimadas pelo comprimento da reta e pelo tipo de curva — a numeração pode não coincidir com a oficial. Os kartódromos portugueses (como Vila Nova de Paiva) ainda não estão incluídos; por agora, desenha-os no editor de circuitos.

## Pôr a app no iPhone

A app tem de estar publicada num endereço **https** (o iPhone só instala apps web a partir de https).

**Opção mais simples — Netlify Drop (grátis, 2 minutos):**
1. No computador, abre <https://app.netlify.com/drop> e inicia sessão.
2. Arrasta o ficheiro **`KartMentalPro-netlify.zip`** (na raiz do repositório) — ou a pasta `kart-mental-pro` — para a página.
3. O Netlify dá-te um endereço do tipo `https://nome-aleatorio.netlify.app`.

(Alternativa: no Netlify, «Import from Git» deste repositório com **Base directory** = `kart-mental-pro`, sem comando de build.)

**Instalar no ecrã principal:**
1. Abre o endereço no **Safari** do iPhone.
2. Toca em **Partilhar** (quadrado com seta para cima).
3. Escolhe **«Adicionar ao ecrã principal»** → **Adicionar**.
4. Abre a app pelo ícone: fica em ecrã inteiro, sem barras do Safari, e funciona sem internet.

Notas:
- Os dados ficam no iPhone, dentro da app instalada (são separados dos do Safari). Usa **Perfil → Exportar** de vez em quando para guardar uma cópia.
- Para ouvir os sons e a voz, desliga o modo silencioso.
- Lembretes: liga-os em Perfil. O iPhone só mostra notificações de apps web instaladas; para um aviso garantido todos os dias, usa «Adicionar lembrete ao Calendário».

## Testar no computador

```bash
cd kart-mental-pro
python3 -m http.server 8765      # depois abre http://localhost:8765
```

Testes automáticos (com o servidor acima a correr; usam o Playwright):

```bash
node tools/smoke.cjs /tmp   # joga os 12 exercícios num iPhone simulado
node tools/flow.cjs /tmp    # programa guiado, sábado, domingo, cópias, editor de circuitos
```

Depois de alterar ficheiros, `node tools/build.mjs` atualiza a versão do service worker (para os iPhones receberem a atualização) e recria o `.zip`.

## Estrutura

```
kart-mental-pro/
  index.html, manifest.webmanifest, sw.js   app, instalação e uso sem internet
  css/app.css                                tema escuro de competição
  js/core.js        utilitários, armazenamento local, sons, voz, gráficos
  js/data.js        sessões, recordes, níveis adaptativos, estatísticas
  js/circuits.js    circuitos (dados, geometria, desenho)
  js/exercises/     os 12 exercícios (um ficheiro cada)
  js/program.js     programa de 21 dias, desafios diários, conquistas
  js/runner.js      introdução → contagem → exercício → feedback
  js/views.js       ecrãs (início, programa, exercícios, estatísticas, perfil…)
  js/app.js         navegação, ações, boas-vindas, lembretes
```

Sem dependências nem compilação: HTML, CSS e JavaScript simples.
