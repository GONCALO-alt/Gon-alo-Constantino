# Malta

App para amigos (16–25 anos) conversarem, fazerem vídeochamadas, verem YouTube juntos, mandarem reações e jogarem.

## Correr

```bash
cd malta
npm install
npm start          # http://localhost:3000
```

Abre em dois separadores/telemóveis, cria duas contas e entra na mesma sala (o botão «Copiar código» dá um link direto).
Para a câmara funcionar noutros dispositivos tem de ser servido por **HTTPS** (ou `localhost`).

## O que já faz

- **Contas** com nome + palavra-passe (scrypt). Registo só para quem tem **16 a 25 anos** e aceita as regras.
- **Salas** com código/link, até 8 pessoas (12 com Malta+). O dono pode mudar tema/decoração, fechar a sala só a amigos e expulsar pessoas.
- **Casas**: cada pessoa tem uma sala própria (🏠) com tema e até 8 decorações compradas na loja, opcionalmente só para amigos.
- **Vídeochamada** (WebRTC P2P em malha) com câmara, microfone e **partilha de ecrã**.
- **YouTube juntos** e **Spotify juntos** (fila partilhada, play/pausa/saltos sincronizados; sem sessão Spotify só tocam 30 s).
- **Chat**, **reações** a flutuar e **emotes** que animam o avatar (grátis e pagos).
- **Avatar** personalizável; itens especiais pagos com moedas.
- **Progresso**: XP por conversar, jogar, estar em chamada e ver vídeos; níveis (cada nível dá 50 🪙), 10 emblemas, **streaks** de dias seguidos com cada amigo e ranking entre amigos.
- **Prendas**: oferecer moedas ou itens a amigos, com mensagem; caixa de prendas recebidas.
- **Clips**: o browser grava sempre os últimos ~30 s da sala (vídeos, avatares, reações, marca «malta.») em formato vertical; descarregar ou partilhar (TikTok/Instagram). Nada sai do dispositivo; a sala é avisada.
- **Jogos**: Cartas Loucas (2–6), Impostor (3+), Desenha & Adivinha, Quem é mais provável…, Verdade ou Consequência (versão segura), Quiz geral, Quiz de música e Jogo do Galo. Ganhar dá moedas.
- **Malta FC** (futebol):
  - 360 jogadores fictícios (Bronze, Prata, Ouro, Lenda) de 10 países; plantel inicial de 14.
  - Pacotes: diário grátis, Bronze 100, Prata 250, Ouro 600 e Lenda 1500 moedas, com animação de abertura.
  - Monta o onze em 4 formações; jogadores do mesmo país dão química (bónus).
  - Vender jogadores (ou todos os repetidos) por moedas.
  - Jogo 1 contra 1 numa sala (ou contra a IA): escolhe a tática; em 8 lances, quem ataca escolhe a zona (esquerda/meio/direita) e quem defende tenta adivinhar. A força das equipas conta. Empate → penáltis. Ganhar: 30 🪙 (15 contra a IA).
- **Segurança**:
  - Filtro de palavrões; insultos de ódio dão avisos (3 → 1 h sem chat).
  - Anti-spam (máx. 5 mensagens em 5 s, sem repetições).
  - Bloquear (deixas de ver mensagens/reações/emotes; não pode entrar nas tuas salas nem mandar prendas).
  - Denúncias com motivo e as últimas mensagens anexadas; 3 denúncias de pessoas diferentes em 24 h → 24 h sem chat.
  - Página de moderação em `/admin.html` (arranca com `ADMIN_TOKEN=um-segredo npm start`): arquivar, silenciar, banir.

## Antes de lançar a sério

- **Pagamentos estão em modo demo** (`/api/coins/checkout` credita sem cobrar). Ligar Stripe Checkout (web) e
  compras na app (Apple/Google, obrigatórias em apps nativas) e só creditar no webhook de confirmação.
- **TURN server** (ex. coturn) para chamadas atrás de redes restritivas; para salas maiores, um SFU (LiveKit, mediasoup).
- Base de dados real (Postgres) em vez de `data/users.json`.
- Moderação: filtro de palavras, bloqueio de utilizadores, painel para ver `data/reports.log`, termos e política de privacidade (RGPD).
- A idade é autodeclarada — considerar verificação.
- Versão telemóvel: empacotar como PWA ou com Capacitor / React Native.
