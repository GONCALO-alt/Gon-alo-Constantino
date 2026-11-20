# LiveVerse

Rede social de criadores com simulador de lives. Abre `index.html` diretamente no navegador; não precisa de servidor nem de instalação.

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
- **GTA VI**: jogo disponível em lives, eventos, publicações e Explorar, com reações próprias no chat (fugas, estrelas de procurado, assaltos, «WASTED»), uma live fictícia a decorrer, um evento agendado e um clip.
- **Notificações** simuladas: 30 e 5 minutos antes, evento em direto, 1.000 interessados, tendência, comunidade à espera, conquistas, respostas.

O estado (perfil, publicações, eventos, lives, clips, notificações) fica guardado no `localStorage` do navegador.

## Desenvolvimento

O código está em `src/` (CSS, HTML e JavaScript sem dependências). Para gerar `index.html`:

```bash
node liveverse/build.mjs
```
