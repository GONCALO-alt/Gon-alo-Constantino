# LiveVerse

Rede social de criadores com simulador de lives, com um tema escuro e roxo de plataforma de streaming. Ícone em `icon.svg` (e `icon-512.png`, `icon-192.png`, `icon-64.png`). Abre `index.html` diretamente no navegador; não precisa de servidor nem de instalação.

**Tudo o que é audiência é fictício:** seguidores, espectadores, reações, presentes, popularidade, verificações, rankings e métricas são simulados pela própria app e estão identificados como tal.

## O que tem

- **Perfil de streamer**: foto, banner, nome, @utilizador, biografia, categoria, jogos favoritos, selo de verificação fictício, seguidores, a seguir, lives simuladas, visualizações, nível de carreira com XP, cor do perfil, agenda semanal de lives e publicação fixada. Separadores: Publicações (com Reposts, Gostos e Guardados), Sobre, Lives, Eventos, Clips e Conquistas.
- **Publicações**: texto, anúncio de jogo, anúncio de live, evento, sondagem, conquista, fotografia e clip. Gostar, responder, repostar, guardar, fixar, hashtags clicáveis, visualizações simuladas, data e hora, e publicação agendada.
- **Eventos**: editor com título, descrição, jogo, data, hora, modo, nível de audiência, capa (predefinida ou imagem tua), contagem decrescente e lembretes. Publicar coloca o evento no perfil, no feed e na página de Eventos. Os interessados fictícios crescem com o tempo; aparece «A começar em breve» e o botão «Começar live» quando chega a hora. Editar, cancelar, repor e eliminar.
- **Página de eventos**: próximos, em direto, anteriores, os meus, recomendados e calendário mensal.
- **Estúdio de live**: audiência, chat, presentes, sondagens, raids e marcos simulados. Painel «O que acabou de acontecer?» com 9 botões e 26 acontecimentos em 5 categorias, mais um acontecimento personalizado. As reações no chat dependem do jogo e do acontecimento; animação no ecrã, aumento de interação, novos seguidores, momento viral, cronologia e clip automático opcional.
- **Clips e cronologia**: «Criar clip» em qualquer momento da cronologia (também depois da live). Cartões com título, jogo, streamer, tipo, popularidade, gostos, comentários, partilhar e adicionar ao perfil. Podes anexar a tua própria media a um clip.
- **Menu**: no computador, menu lateral agrupado (Descobrir, Social, Criador, Conta) com relógio em tempo real e botão «Criar» (publicação, agendar live, entrar em direto). No telemóvel, barra de topo com hora, pesquisa, mensagens e notificações, barra inferior com botão central «Criar» e um menu completo em folha.
- **Hora em tempo real**: relógio ao segundo; os tempos relativos («há 2 min») e as contagens decrescentes atualizam-se sozinhos.
- **Explorar**: pesquisa de contas, hashtags, eventos, clips e publicações; filtro por jogo; secções Em direto, Categorias, Criadores em destaque, Tendências, Clips populares e Próximos eventos.
- **Mensagens diretas**: conversas com contas fictícias que escrevem «a escrever…» e respondem conforme o que escreves (raids, lives, colaborações). Também te enviam mensagens de vez em quando. Podes enviar publicações, eventos e clips por mensagem.
- **Moderação do chat**: fixar, apagar, silenciar 5 min e banir mensagens; AutoMod contra spam; modo lento, só subscritores e só emojis; lista de palavras bloqueadas; lista de banidos; estatísticas. Aparecem trolls fictícios no chat para moderares.
- **Chat sempre visível durante a live**: no estúdio, o chat fica fixo ao lado do ecrã enquanto desces até às reações; no telemóvel, o vídeo fica preso no topo com o chat por cima («Chat no ecrã»). Nas outras páginas aparece um chat flutuante com reações rápidas, que podes minimizar.
- **Gerir contas**: muda o nome, @utilizador, bio, categoria, jogos, seguidores, cor e selo das contas da simulação, cria contas novas ou apaga contas (em Explorar, no menu ou no perfil de cada conta).
- **Microfone**: o chat fictício ouve o que dizes e reage (ri-se das piadas, responde a perguntas, cumprimenta, consola-te, agradece). O botão fica no painel do estúdio, nunca no ecrã da live. No artifact usa a capacidade `dictation` da plataforma; aberto localmente no Chrome usa o reconhecimento de voz do navegador; sem microfone, há um campo para escreveres o que disseste.
- **Sons e alertas**: sons sintetizados para presentes, seguidores, raids, marcos, momentos virais e metas, com volume; alertas animados no ecrã da live.
- **Metas de presentes**: barra no ecrã («Troco de skin 1.820 / 5.000»), metas predefinidas ou personalizadas e celebração quando se atinge.
- **Momentos aleatórios**: surpresas durante a live (streamer fictício no chat, live caiu, 100 subs, desafio, troll, animal na câmara, música com direitos, patrocínio, lanche, raid) com duas escolhas e efeitos diferentes.
- **Câmara e jogo a sério**: liga a tua câmara (cara no ecrã inteiro ou no canto) e mostra o ecrã do jogo; grava a live (ecrã + câmara) e transfere o vídeo. Funciona no site do Cloudflare ou no Chrome; dentro do Claude o navegador bloqueia a câmara e o ecrã. O vídeo nunca sai do teu navegador.
- **Contador no ecrã**: como os overlays dos streamers, o total de seguidores numa caixa branca com o ícone, a subir em tempo real. Liga/desliga em Controlos.
- **Live na vertical**: escolhe Horizontal (16:9) ou Vertical (9:16), antes ou durante a live.
- **Live limpa e sem emojis**: o ecrã só tem a imagem, o tempo de live e os espetadores; alertas e animações usam ícones simples.
- **Audiência realista** (por omissão): os espetadores dependem dos teus seguidores, da hora (mais à noite), da popularidade do jogo, de fazeres live no horário da tua agenda, de vires de um evento e do tempo de live. Um canal novo começa com 0 a 3 espetadores; chat, presentes, seguidores, habituais, raids e momentos surpresa são proporcionais. O estúdio mostra uma estimativa antes de entrares em direto. A audiência «Livre» (até 1.000 … 1.000.000) continua disponível.
- **O chat obedece ao microfone**: «digam olá», «escrevam GG», «mandem corações» põem muita gente a escrever isso; «estão-me a ouvir?» recebe vários «sim». As frases ditadas aos pedaços são juntas antes de o chat reagir.
- **Contador de streamer**: espetadores em cima (branco com contorno preto) e seguidores numa caixa branca com algarismos que rodam um a um.
- **Ecrã inteiro também no telemóvel**: com o telemóvel de pé, o ecrã inteiro roda para horizontal (vídeo, seguidores e chat lado a lado).
- **Ecrã inteiro com seguidores e chat**: vídeo na horizontal, painel de seguidores (total, espetadores, próxima meta, últimos seguidores) e chat ao lado; no telemóvel tenta rodar para horizontal.
- **Acabamento profissional**: Gestor de transmissão offline com pré-visualização e Informação da transmissão (título, categoria, etiquetas); mais definições recolhidas; clipes como numa plataforma de streaming (duração, visualizações, data); lista suspensa de notificações no sino com ícones; mensagens diretas chamadas Sussurros; calendário compacto.
- **Editar a transmissão**: muda o título, a categoria e as etiquetas durante a live (botão no título ou em Ações rápidas).
- **Câmara nas cenas**: na cena Conversa a tua câmara ocupa o ecrã com uma faixa «Conversa com o chat»; em A começar, Volto já e Fim aparece desfocada por trás.
- **Emotes do canal**: carrega imagens tuas e dá-lhes um código; aparecem no seletor de emotes e os espetadores fictícios usam-nos no chat.
- **Sem erros na live**: sem momentos que fingem problemas (live caiu, direitos de autor) e a simulação continua mesmo que algo falhe.
- **Live limpa e profissional**: pré-visualização sóbria sem fonte de vídeo, sem faixas grandes no ecrã, alertas discretos, chat sem mensagens de sistema repetitivas (seguidores, marcos e presentes pequenos vão para a Atividade) e ações rápidas em quadrados escuros uniformes.
- **Canal e gestor de transmissão**: o perfil é um cabeçalho de canal (banner com OFFLINE/EM DIRETO, avatar, seguidores, Personalizar canal/Painel do criador ou Seguir/Subscrever); o estúdio é um gestor de transmissão com feed de Atividade, Ações rápidas em quadrados coloridos (câmara, jogo, gravar, formato, microfone, momentos, marcador, sondagem, raid, anunciar, modo de chat, ecrã inteiro) e Chat da transmissão. Distintivos do chat em quadrado, eventos com barra roxa e leitor com barra de controlos.
- **Layout de plataforma de streaming no computador**: barra de topo (Seguidos, Procurar, ⋮, pesquisa, atividade, mensagens, Transmitir, menu do avatar), barra lateral só com canais seguidos e recomendados (recolhível), destaque na página inicial, «Canais em direto de que achamos que vais gostar», categorias com capas, página Procurar com Categorias e Canais em direto, página de categoria, canal com Seguir/Subscrever, «Sobre», «Chat da transmissão» e pontos do canal (com baú de bónus).
- **Estilo de plataforma de streaming**: página inicial com separadores «A seguir · Em direto · Clipes · Publicações», categorias e cartões de live (miniatura com «Em direto», espetadores, câmara do streamer, título, jogo e etiquetas). Página de canal para ver as lives das outras contas: vídeo com tempo de live e espetadores, botões Clipe, partilhar e definições, ❤️ seguir, 🔔, «Oferecer subscrição» e «Subscrever», top 3 de presentes, recompensa por ver 10 minutos, boas-vindas, bot do canal, «Mais mensagens abaixo», emotes e ecrã inteiro com chat por cima. Barra de baixo do telemóvel: Início, Procurar, +, Atividade, Perfil.
- **Live limpa**: durante a live só ficam o ecrã, o chat, os espectadores e os seguidores. As views e os seguidores sobem com números a rolar, «+N» a saltar e um gráfico em tempo real. O resto (estatísticas, reações completas, sondagens, metas, cronologia, moderação) está no botão «Controlos». O botão «Ecrã inteiro» deixa só o ecrã, as reações rápidas e o chat.
- **Começa do zero**: o canal arranca com 0 seguidores; há metas de seguidores (1, 5, 10, 25, 50, 100…) celebradas na live e uma cena «Seguidores» com o contador em grande e os últimos seguidores.
- **Agendar a qualquer hora**: qualquer dia e hora (ao minuto), com atalhos «daqui a 15 min», «30 min», «1 h», «2 h», «hoje às 21:00», «amanhã a esta hora» e «sábado às 16:00».
- **Cenas como no OBS**: «A começar» (contagem de 20 s quando entras em direto), «Jogo», «Conversa» (o chat faz-te perguntas), «Volto já» (os espectadores esperam) e «Fim». Também podes terminar com uma raid para outra conta.
- **Avatar na live**: a tua foto (ou outra imagem) num canto do ecrã; mexe-se quando falas ao microfone e faz caras conforme o momento (😂 😱 🤯 😭).
- **Presentes lidos em voz alta**: presentes grandes trazem mensagem e são lidos por uma voz (capacidade tts no artifact; voz do navegador quando aberto localmente).
- **Hype train**: muitos presentes seguidos lançam um comboio com níveis, tempo e barra no ecrã.
- **Espectadores habituais**: moderadores, VIP e subscritores com meses, que te cumprimentam, se lembram da última live e dos teus clips, e renovam subscrições.
- **Som de multidão** nos grandes momentos e **modo teatro** em ecrã inteiro, só com o ecrã, as cenas, as reações e o chat.
- **GTA VI**: jogo disponível em lives, eventos, publicações e Explorar, com reações próprias no chat (fugas, estrelas de procurado, assaltos, «WASTED»), uma live fictícia a decorrer, um evento agendado e um clip.
- **Notificações** simuladas: 30 e 5 minutos antes, evento em direto, 1.000 interessados, tendência, comunidade à espera, conquistas, respostas.

O estado (perfil, publicações, eventos, lives, clips, notificações) fica guardado no `localStorage` do navegador.

## Publicar no Cloudflare Pages

A pasta `dist/` já tem tudo o que é preciso: a página completa, os ícones, o manifesto (para instalar no telemóvel) e o ficheiro `_headers` com as permissões do microfone.

**Opção 1 — arrastar e largar (mais fácil)**
1. No painel do Cloudflare, vai a **Workers & Pages → Criar → Pages → Carregar ativos** (Upload assets).
2. Dá um nome ao projeto (por exemplo `liveverse`).
3. Arrasta o ficheiro `liveverse-cloudflare.zip` (ou o conteúdo da pasta `liveverse/dist`) e carrega em **Implementar**.

**Opção 2 — ligado ao GitHub (atualiza sozinho a cada commit)**
1. **Workers & Pages → Criar → Pages → Ligar ao Git** e escolhe este repositório e o ramo.
2. Diretório raiz: `liveverse` · Comando de compilação: `node build.mjs` · Diretório de saída: `dist`.

**Opção 3 — linha de comandos**
```bash
cd liveverse && node build.mjs && npx wrangler pages deploy
```

Fora do Claude, o microfone usa o reconhecimento de voz do navegador (Chrome ou Edge, em https) e a leitura em voz alta usa a voz do sistema. Os dados ficam guardados no navegador de quem usa o site.

## Desenvolvimento

O código está em `src/` (CSS, HTML e JavaScript sem dependências). Para gerar `index.html` (artifact) e `dist/` (Cloudflare):

```bash
node liveverse/build.mjs
```
