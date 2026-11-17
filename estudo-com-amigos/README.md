# 📚 Estudo com Amigos

Salas de estudo online: estudas ao mesmo tempo que os teus amigos, cada um na sua casa.

## O que já faz
- **Salas com código** (6 letras): só entra quem tem o código. As salas ficam guardadas (apontamentos, perguntas e ranking).
- **Foco partilhado**: temporizador igual para todos (15/25/45/60 min + 5 min de pausa). Quem sai da página durante o foco fica como *distraído* e não ganha os minutos.
- **Chat** com filtro de asneiras e botão para denunciar mensagens.
- **Apontamentos partilhados** da sala.
- **Quiz em duelo**: os amigos escrevem perguntas e depois fazem um duelo em tempo real (15 s por pergunta, mais pontos para quem responde mais depressa).
- **Ranking** da sala: minutos de foco, sessões e vitórias em duelos.
- **Cacifo**: avatares e molduras que se desbloqueiam com minutos de foco.

## Como pôr a correr
Precisas do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
cd estudo-com-amigos
npm install
npm start
```

Abre http://localhost:3000. Para testar com "dois amigos", abre outra janela anónima e entra com o código da sala.

Testes: `npm test`

## Ficheiros
| Ficheiro | O que é |
|---|---|
| `server.js` | Servidor (Express + Socket.IO): site e tempo real |
| `rooms.js` | Regras das salas: foco, chat, quiz, duelo, ranking |
| `public/` | O site (HTML, CSS, JavaScript) |
| `public/cosmetics.js` | Lista de avatares e molduras |
| `data/rooms.json` | Onde as salas ficam guardadas (criado automaticamente) |

## Próximos passos
1. **Pôr online**: num serviço como Render, Railway ou Fly.io (a conta tem de ser de um adulto).
2. **Contas a sério**: para os minutos e os cosméticos não ficarem só num browser.
3. **IA**: gerar perguntas a partir de fotos dos apontamentos.
4. **Premium** (com um adulto responsável pelos pagamentos): IA ilimitada, salas maiores e permanentes, cosméticos à venda sem dar vantagem no jogo.
