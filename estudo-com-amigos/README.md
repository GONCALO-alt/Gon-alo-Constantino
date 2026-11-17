# 🐟 Cardume

*Estuda em cardume.* Salas de estudo online: estudas ao mesmo tempo que os teus amigos, cada um na sua casa.

Um cardume é um grupo de peixes que nada junto, tal como uma turma a estudar. O ícone (`public/icons/icon.svg`) são três peixes a nadar em roda.

## Menu
- **＋ Adicionar**: cria uma sala, entra numa, começa um foco, partilha um apontamento, escreve uma pergunta, tira uma foto para a IA, marca um teste ou manda uma mensagem, tudo a partir do mesmo sítio.
- **Principal**: Início, Estudar, Chat (com aviso de mensagens novas), Duelos
- **Turma**: Apontamentos, Calendário, Liga
- **Eu**: Loja, Medalhas, Perfil, Definições (som, tema claro/escuro, sair da sala, apagar dados)

No computador o menu fica à esquerda. No telemóvel há uma barra em baixo com o botão ＋ ao centro, e o resto do menu abre em "Mais".

## Loja de medalhas e escamas 🐟
As **escamas** ganham-se a estudar: 1 por minuto de foco, 20 por duelo ganho, 5 por apontamento, 3 por pergunta e 25 por conquista. Quem chega recebe 50 de boas-vindas. Com elas compram-se **12 medalhas** (de 40 a 1500 escamas), que aparecem ao lado do teu nome nas salas. Não há dinheiro real nem caixas surpresa: sabes sempre o que compras.

## Pôr online
### Render (o mais fácil)
O ficheiro `render.yaml` na raiz do repositório já tem tudo.
1. Um **adulto** cria conta em https://render.com e liga o GitHub.
2. **New → Blueprint**, escolhe este repositório e carrega em **Apply**.
3. Quando pedir `ANTHROPIC_API_KEY`, cola a chave (ou deixa vazio para ter a app sem IA).
4. Em poucos minutos a app fica num endereço como `https://cardume.onrender.com`. Partilha esse link com a turma.

O plano `starter` (cerca de 7 $/mês) mantém a app sempre ligada e guarda as salas num disco. No plano grátis a app adormece quando ninguém a usa e as salas apagam-se quando reinicia. Para usar o grátis, muda `plan: free` e tira o bloco `disk` do `render.yaml`.

### Outros serviços
Há um `Dockerfile` para Fly.io, Railway, etc. Define `PORT`, `DATA_DIR` (pasta com disco permanente) e, se quiseres IA, `ANTHROPIC_API_KEY`.

### No telemóvel
Depois de estar online, abre o link no telemóvel e escolhe **"Adicionar ao ecrã principal"**. O Cardume fica com o ícone dos peixes, como uma app.

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
| `ai.js` | IA: perguntas, explicações, resumo, previsão de nota (API da Anthropic) |
| `public/app.js` | O site |
| `public/sounds.js` | Sons de foco gerados no browser |
| `public/cosmetics.js` | Avatares, molduras e conquistas |
| `demo/` | Demo que corre só no browser (servidor falso + bots) |
| `data/rooms.json` | Onde as salas ficam guardadas (criado automaticamente) |

## Limitações (por agora)
- Os minutos, conquistas e cosméticos de cada pessoa ficam guardados **no browser dela**, porque ainda não há contas.
- Para os amigos entrarem de casa, a app tem de estar **online** (Render, Railway, Fly.io…), numa conta de um adulto.
