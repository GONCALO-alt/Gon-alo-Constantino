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

- **Contas** com nome + palavra-passe (scrypt). Registo só para quem tem **16 a 25 anos** (data de nascimento).
- **Salas** com código/link, até 8 pessoas (12 com Malta+).
- **Vídeochamada** (WebRTC P2P em malha): câmara, microfone, ligar/desligar; sem câmara mostra o avatar.
- **YouTube juntos**: cola um link, play/pause/saltar fica sincronizado para todos.
- **Chat** e **reações** que flutuam no ecrã. 5 grátis, as outras pagas (verificado no servidor).
- **Avatar** (pele, cabelo, cor, olhos, acessório, roupa, fundo). Itens básicos grátis; os especiais custam moedas.
- **Loja**: moedas (pacotes de 0,99 € a 11,99 €), subscrição **Malta+**, extras (nome dourado/arco-íris, reações gigantes).
- **Jogos**: Jogo do Galo (1v1), Desenha & Adivinha (quadro partilhado, palpites no chat), Quiz relâmpago. Ganhar dá moedas.
- **Amigos** (ver quem está online e entrar na sala deles), **denúncias** e bónus diário.

## Antes de lançar a sério

- **Pagamentos estão em modo demo** (`/api/coins/checkout` credita sem cobrar). Ligar Stripe Checkout (web) e
  compras na app (Apple/Google, obrigatórias em apps nativas) e só creditar no webhook de confirmação.
- **TURN server** (ex. coturn) para chamadas atrás de redes restritivas; para salas maiores, um SFU (LiveKit, mediasoup).
- Base de dados real (Postgres) em vez de `data/users.json`.
- Moderação: filtro de palavras, bloqueio de utilizadores, painel para ver `data/reports.log`, termos e política de privacidade (RGPD).
- A idade é autodeclarada — considerar verificação.
- Versão telemóvel: empacotar como PWA ou com Capacitor / React Native.
