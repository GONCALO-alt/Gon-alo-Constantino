# 🐟 Shoalmates

*Study as a school.* Salas de estudo online: estudas ao mesmo tempo que os teus amigos, cada um na sua casa.

**Porquê "Shoalmates"?** Em inglês, *shoal* é um grupo de peixes que nada junto (um cardume) e *schoolmates* são os colegas de escola. Shoalmates junta as duas coisas: os teus colegas de cardume. O ícone (`public/icons/icon.svg`) são três peixes a nadar em roda, e a moeda da app são as escamas 🐟.

## 🤖 Chat com o tutor (a parte principal)
A app abre no **Chat**, um tutor de IA que ajuda a estudar qualquer disciplina. **Não é preciso estar numa sala**: as salas são para estudar com os amigos, depois.
- Explica a matéria passo a passo. Nos trabalhos de casa dá pistas e mostra o raciocínio, em vez de dar só a resposta.
- Faz quizzes, resumos e planos, e aceita **fotos** do caderno ou do livro (📷).
- Usa o plano de estudo (ano, disciplinas, dificuldades, próximo teste) para personalizar as respostas e as sugestões rápidas.
- As respostas aparecem enquanto a IA escreve e vêm na língua da app.
- A conversa fica guardada só no browser. Há um botão "Nova conversa".
- Segurança: nunca pede dados pessoais, volta sempre ao estudo e, se o aluno disser que não está bem, sugere falar com um adulto de confiança e a linha SOS Criança 116 111.
- Custos: cada pessoa tem `AI_TUTOR_DAILY` mensagens grátis por dia (40 por defeito). O Premium tira esse limite.

## Menu
A app tem **6 secções**. As que juntam várias páginas mostram separadores por baixo do título:

| Secção | O que tem |
|---|---|
| 🤖 **Chat** | Tutor · Modo exame · Corrigir resposta (é aqui que a app abre) |
| 🗓️ **O meu plano** | O plano semanal criado com o questionário |
| 👥 **Turma** | Sala · Foco · Chat da sala · Duelos · Apontamentos · Calendário · Liga |
| 👤 **Perfil** | Perfil · Notas · Relatório · Medalhas · Loja |
| ⭐ **Premium** | Preços dos planos |
| ⚙️ **Definições** | Língua, plano, som, tema, sala e dados |

- Sem sala, os separadores da Turma aparecem com 🔒 e só a "Sala" (criar/entrar) está aberta.
- Cada secção lembra-se do último separador onde estavas.
- O botão **＋ Adicionar** leva diretamente a qualquer coisa: perguntar ao tutor, criar ou entrar numa sala, sessão de foco, apontamento, pergunta, perguntas com IA, teste ou mensagem.
- No telemóvel há uma barra em baixo com Chat, Plano, ＋, Turma e Perfil. O ☰ em cima abre o menu completo, com o Premium e as Definições.

## Primeira vez: o questionário e o plano de estudo 🗓️
Quando alguém abre o Shoalmates pela primeira vez, responde a 10 perguntas rápidas:
1. Língua
2. Nome
3. Ano de escolaridade
4. Disciplinas (já vêm sugeridas conforme o ano)
5. Disciplinas mais difíceis
6. Objetivo
7. Tempo por dia
8. Dias da semana
9. Melhor hora para estudar
10. Próximo teste (opcional)

Com as respostas, a app monta um **plano semanal** (menu **O meu plano**):
- As disciplinas difíceis têm o triplo do tempo.
- Nos 3 dias antes de um teste, o primeiro bloco do dia é para esse teste.
- Cada bloco tem um botão "Começar", que abre o temporizador com os minutos certos, e uma caixa "Feito".
- O plano mostra também dicas que dependem das respostas.

O plano é gerado sem IA e sem internet (`public/plan.js`). As respostas ficam só no browser: não se pede morada, escola nem contactos. Para refazer: **O meu plano → Refazer perguntas**, ou nas Definições.

## Planos Premium ⭐
O menu **Premium** mostra os preços, com opção mensal ou anual:

| Plano | Mensal | Anual | O que tem |
|---|---|---|---|
| Grátis | 0 € | 0 € | Tutor (40 mensagens/dia), salas, foco, duelos, plano, notas, 1 exame/semana e 2 correções/dia para experimentar |
| Premium | 2,99 € | 24,99 € (poupa 30%) | Tutor sem limite e com **voz**, **modo exame** e **correção de respostas** sem limite, IA da sala ilimitada |
| Família | 4,99 € | 39,99 € | Premium para até 4 irmãos e relatório semanal por email aos pais |
| Escola | 1 € por aluno por ano | | Painel do professor e salas para todas as turmas |

A página compara o Premium com um explicador (15 a 25 € por hora contra 2,99 € por mês).

**Os pagamentos ainda não estão ativos.** O Premium já funciona através de **passes assinados pelo servidor** (`premium.js`), que não dá para falsificar. Há três formas de ganhar um passe:
- 🎁 **7 dias grátis** depois de criar o plano de estudo, uma vez por pessoa;
- 🔥 **30 dias de chama acesa** na sala dão 7 dias de Premium;
- 👥 **Premium da turma**: com 5 pessoas Premium na mesma sala, a sala inteira fica com IA ilimitada.

Quando se chega a um limite (tutor, exame, correção, IA da sala ou voz), aparece uma janela "Isto é Premium" com o teste grátis e os planos. Nunca bloqueia o essencial. O Premium não dá escamas nem vantagens nos duelos.

Para cobrar a sério é preciso um adulto com conta num serviço de pagamentos (por exemplo, Stripe), e só um adulto pode subscrever. Em produção, define `PREMIUM_SECRET`. Se não estiver definido, o servidor cria um em `DATA_DIR/secret.txt`.

## Ferramentas de estudo
- **Chat › Tutor**: o tutor de IA. Com Premium, também se pode falar com ele (🎙️) e ouvir as respostas (🔊).
- **Chat › Modo exame**: exames de treino ao estilo dos exames nacionais, com escolha de disciplina, número de perguntas e tempo. No fim mostra a nota em % e em valores, com cada resposta explicada, e guarda o histórico.
- **Chat › Corrigir resposta**: escreves ou fotografas uma resposta de desenvolvimento e recebes nota de 0 a 100, o que está bem, o que falta, uma resposta modelo e uma dica.
- **Perfil › Notas**: registas as notas dos testes (em 20, 100 ou 5) e vês um gráfico por disciplina e a média **antes e depois** de usares o Shoalmates.
- **Perfil › Relatório**: um relatório da semana para os pais, com minutos de foco, dias com estudo, plano cumprido, respostas certas, próximos testes e notas. Pode copiar-se ou partilhar-se. As conversas com o tutor nunca aparecem no relatório.

## Línguas 🌍
O Shoalmates está em **Português, English, Español e Français**. Na primeira vez, a app adivinha a língua pelo browser. Pode mudar-se no questionário ou nas Definições, e a página muda logo, sem recarregar.
- Todos os textos estão em `public/i18n.js`. Para acrescentar uma língua, copia o bloco `en`, traduz e junta-a a `LANGS`. Há um teste que avisa se faltar alguma frase.
- O servidor envia códigos (por exemplo, `room_full` ou `joined`) em vez de frases, por isso cada pessoa vê as mensagens da sala na sua própria língua.
- A IA responde na língua de quem faz o pedido.

## Loja de medalhas e escamas 🐟
As **escamas** ganham-se a estudar: 1 por minuto de foco, 20 por duelo ganho, 5 por apontamento, 3 por pergunta e 25 por conquista. Quem chega recebe 50 de boas-vindas. Com elas compram-se **12 medalhas** (de 40 a 1500 escamas), que aparecem ao lado do teu nome nas salas. Não há dinheiro real nem caixas surpresa: sabes sempre o que compras.

## Pôr online
### Render (o mais fácil)
O ficheiro `render.yaml` na raiz do repositório já tem tudo.
1. Um **adulto** cria conta em https://render.com e liga o GitHub.
2. **New → Blueprint**, escolhe este repositório e carrega em **Apply**.
3. Quando pedir `ANTHROPIC_API_KEY`, cola a chave (ou deixa vazio para ter a app sem IA).
4. Em poucos minutos a app fica num endereço como `https://shoalmates.onrender.com`. Partilha esse link com a turma.

O plano `starter` (cerca de 7 $/mês) mantém a app sempre ligada e guarda as salas num disco. No plano grátis a app adormece quando ninguém a usa e as salas apagam-se quando reinicia. Para usar o grátis, muda `plan: free` e tira o bloco `disk` do `render.yaml`.

### Outros serviços
Há um `Dockerfile` para Fly.io, Railway, etc. Define `PORT`, `DATA_DIR` (pasta com disco permanente) e, se quiseres IA, `ANTHROPIC_API_KEY`.

### No telemóvel
Depois de estar online, abre o link no telemóvel e escolhe **"Adicionar ao ecrã principal"**. O Shoalmates fica com o ícone dos peixes, como uma app.

## O que faz

## O que faz

**Estudar juntos**
- **Salas com código** (6 letras): só entra quem tem o código. As salas ficam guardadas.
- **Foco partilhado**: temporizador igual para todos (15/25/45/60 min + 5 min de pausa). Quem sai da página fica como *distraído* e não ganha os minutos.
- **Reações ao vivo** (🔥💪👏🤯😴☕) para animar os amigos sem escrever.
- **Sons da sala**: chuva, café, lo-fi ou biblioteca. Toda a sala ouve o mesmo ambiente, cada um com o seu volume. Os sons são gerados no browser, sem ficheiros.
- **Chat** com filtro de asneiras e botão para denunciar.
- **Apontamentos partilhados**.
- **Calendário de testes** da turma, com aviso quando faltam 3 dias ou menos.

**Jogos**
- **Duelo clássico**: 15 s por pergunta, mais pontos para quem responde mais depressa.
- **Duelo de eliminação**: perguntas cada vez mais difíceis e quem erra sai. Cada jogador tem um ✂️ 50/50 e pode 🙋 perguntar à sala uma vez.
- **Chama da sala** 🔥: um dia conta quando a sala estuda 15 min × o número de pessoas que entraram nesse dia. Quem estuda a dobrar salva um amigo.
- **Ligas semanais** 🥉🥈🥇💠💎: todas as segundas-feiras, as melhores salas de cada liga sobem e as que não estudaram descem.
- **16 conquistas** 🏅, algumas desbloqueiam avatares e molduras especiais.
- **Perfil** 🎨: avatares e molduras ganhos a estudar, estatísticas e previsão de nota.

**IA** (corre no servidor, ver abaixo)
- 📷 **Foto → perguntas**: tira uma foto ao livro ou ao caderno (ou cola texto) e a IA cria 8 perguntas para o duelo.
- 🤖 **"Porque é que errei?"**: explicação curta quando falhas uma pergunta.
- 📄 **Resumo automático**: junta os apontamentos de todos num resumo de 1 página.
- 🔮 **Previsão de nota**: estima a tua percentagem no teste a partir das respostas nos duelos, com pontos fortes, o que melhorar e um plano.

## Como pôr a correr
Precisas do [Node.js](https://nodejs.org) 22 ou mais recente.

```bash
cd estudo-com-amigos
npm install
npm start
```

Abre http://localhost:3000. Para testar com "dois amigos", abre outra janela anónima e entra com o código da sala.

## Ligar a IA
A IA corre **dentro do teu servidor**: não é preciso abrir o site do Claude. O servidor fala diretamente com a API da Anthropic.

1. Um **adulto** cria uma conta em https://console.anthropic.com, carrega créditos e cria uma chave de API. As contas da API são só para maiores de 18.
2. Copia `.env.example` para `.env` e cola a chave em `ANTHROPIC_API_KEY=`.
3. `npm start`. No terminal deve aparecer "🤖 IA ligada".

A chave fica só no servidor (o browser nunca a vê) e o `.env` nunca vai para o GitHub.

**Custos:** cada pedido gasta poucos cêntimos. Para controlar a despesa, cada sala tem `AI_WEEKLY_LIMIT` pedidos de IA grátis por semana (30 por defeito). As explicações de erros não contam para o limite e ficam guardadas em cache. Uma sala com `"premium": true` em `data/rooms.json` não tem limite. É aí que entra o plano pago.

**Testar sem chave:** `npm run dev:ai-teste` liga a IA em modo de teste, com respostas falsas e sem custos.

## Demo sem servidor
`DEMO-abre-me.html` (no zip) ou `npm run demo`, que gera `dist/demo-offline.html`, abre a app diretamente no browser. O Rui e a Eva são amigos simulados e a IA dá respostas de exemplo. Serve para mostrar a app a alguém sem a pôr online.

## Testes
`npm test`

## Ficheiros
| Ficheiro | O que é |
|---|---|
| `server.js` | Servidor (Express + Socket.IO): site e tempo real |
| `rooms.js` | Regras: foco, chama, ligas, calendário, duelos, quota de IA |
| `handlers.js` | Eventos em tempo real (o que acontece quando alguém clica) |
| `premium.js` | Passes Premium assinados (teste grátis, chama, turma) |
| `public/extras.js` | Premium, voz, modo exame, correção, notas e relatório |
| `ai.js` | IA: perguntas, explicações, resumo, previsão de nota (API da Anthropic) |
| `public/app.js` | O site |
| `public/sounds.js` | Sons de foco gerados no browser |
| `public/cosmetics.js` | Avatares, molduras, conquistas e medalhas |
| `public/i18n.js` | Traduções (PT, EN, ES, FR) |
| `public/plan.js` | Gerador do plano de estudo |
| `demo/` | Demo que corre só no browser (servidor falso + bots) |
| `data/rooms.json` | Onde as salas ficam guardadas (criado automaticamente) |

## Limitações (por agora)
- Os minutos, conquistas e cosméticos de cada pessoa ficam guardados **no browser dela**, porque ainda não há contas.
- Para os amigos entrarem de casa, a app tem de estar **online** (Render, Railway, Fly.io…), numa conta de um adulto.
