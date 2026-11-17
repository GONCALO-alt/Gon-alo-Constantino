# 📚 Estudo com Amigos

Salas de estudo online: estudas ao mesmo tempo que os teus amigos, cada um na sua casa.

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
- **Cacifo** 🎨: avatares e molduras ganhos a estudar.

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
