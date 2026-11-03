# DutchPath

Aplicação web para aprender **neerlandês** (padrão dos Países Baixos) a partir do **português europeu**.
Funciona no navegador, em telemóveis, tablets e computadores. O progresso fica guardado apenas no seu dispositivo.

> O nome é configurável (`VITE_APP_NAME`). Os níveis QECR são indicativos — não é uma certificação.
> O conteúdo atual (4098 lições, A1 → B2: 1825 escritas + 2273 de prática e revisão geradas a partir delas) foi redigido com apoio de IA e ainda não foi revisto por um falante nativo.

## Começar

Requisitos: Node.js 22.18 ou mais recente.

```bash
npm install
npm run dev        # compila o conteúdo e abre a app em http://localhost:5173
```

Versão de produção (ficheiros estáticos em `dist/`, prontos para qualquer alojamento estático):

```bash
npm run build
npm run preview
```

## O que já existe

- Curso com **7 secções e 109 unidades** (4.500 lições previstas), A1 → B2.
- **4098 lições** publicadas: 1825 escritas; a seguir a cada uma, uma **lição de prática** sem palavras novas (1822, `tools/authoring/practice_gen.py`); no fim de cada unidade, lições de revisão (451, `tools/authoring/review_gen.py`); 39 275 exercícios, 5131 palavras.
- Versão de ficheiro único: `DutchPath.html` (ou `npm run build:single`).
- **14 tipos de exercício** com correção tolerante (variantes, acentos, gralhas), feedback imediato e explicação; os erros repetem-se no fim da lição.
- Escrita livre com autoavaliação: uma resposta diferente do modelo não é marcada errada automaticamente.
- **Revisão espaçada** (caixas de Leitner configuráveis), palavras difíceis, esquecidas e erros recentes.
- XP, objetivo diário, sequência sem castigos, conquistas, estatísticas.
- Sons: pronúncia com a voz do sistema; depois de cada exercício a resposta certa é lida em neerlandês; nos pares, cada palavra neerlandesa é pronunciada ao tocar; efeitos sonoros (três variações de «certo», errado suave, sons para 3, 5 e 10 respostas certas seguidas, fanfarra de fim de lição e outra para lição sem erros, conquista; vibração curta no telemóvel; volume ajustável) gerados no navegador, sem ficheiros nem serviços externos.
- Ecrã inicial em forma de caminho: estatísticas do dia (nível, sequência, XP, objetivo), faixa colorida da unidade (cor por secção) e as lições em círculos em ziguezague — estrela (lição), haltere (prática), setas (revisão), troféu (desafio) — com «Começar» na lição atual, cadeado nas seguintes, baú no fim e a mascote ao lado. Tocar num círculo mostra o título e o botão para começar ou rever.
- **Mini-jogos** (separador «Jogos») com as palavras das lições já concluídas: Corrida de palavras (60 s, escolher a tradução, pontos extra por respostas seguidas), Memória (virar cartas e juntar neerlandês ↔ português), De of het? (45 s, artigos) e Ouve e toca (ouvir e tocar na palavra). Recordes guardados no dispositivo; sem vidas nem castigos.
- Animações (desligáveis em «Reduzir animações»): exercícios a deslizar, abanão suave ao errar, estrelinhas e mascote a saltar ao acertar, peças e pares animados, barra de progresso com brilho, confettis e números a subir no fim da lição, círculos do caminho a aparecer um a um, mascote a piscar os olhos.
- Ecrã de exercício com peças em relevo, linhas para construir a resposta, botão «Verificar» verde e a mascote Tulpje (uma tulipa) com frases de incentivo em neerlandês e português. As traduções fazem-se com peças (a resposta + palavras a mais da própria lição, já vistas; nas respostas curtas não entram outras expressões curtas que podiam ser sinónimos); quem preferir pode «Usar o teclado». Sem vidas nem castigos.
- Durante a lição, tocar numa palavra neerlandesa mostra a tradução (dicionário feito com o vocabulário do curso, reconhece formas como *werkt* → *werken*). Ao acertar aparece só «Certo!»; ao errar aparecem a resposta certa, o significado e a explicação.
- Leitura em voz alta: em cada lição, uma palavra e uma frase para ler; o reconhecimento de voz do navegador diz que palavras percebeu (Chrome/Safari; sem chaves de API). Pode desligar-se nas Definições.
- **Uso sem internet e instalação no ecrã inicial (PWA):** na versão publicada (https, ex.: Netlify), um service worker (`dist/sw.js`, gerado por `tools/build-sw.ts` no `npm run build`) guarda a app e todas as lições (~11 MB) no dispositivo. Nas atualizações só se descarregam os ficheiros que mudaram. Sem internet, os exercícios de microfone ficam desligados; tudo o resto funciona. O estado e o botão «Instalar» estão em Definições → Usar sem internet.
- Definições: objetivo, áudio (voz, leitura da resposta, efeitos sonoros), navegação livre, acentos, movimento reduzido.
- Privacidade: sem contas nem servidores; exportar, restaurar e apagar todos os dados.

## Testes

```bash
npm test             # 108+ testes: correção, revisão espaçada, progressão, validação,
                     # importação, persistência, migrações, escala (5.000 lições) e interface
npm run typecheck
npm run build && npm run test:e2e   # navegador real (Chromium/Playwright), 360 px e 1280 px
```

## Conteúdo

O conteúdo vive em `content/` (fonte, com estados editoriais) e é compilado para
`public/content/` (só lições publicadas, uma unidade por ficheiro, carregadas a pedido).

```bash
npm run content:validate   # esquema, referências, respostas, duplicados, semelhança
npm run content:stats      # lições por secção e estado
npm run content:build      # compila para public/content
```

Para gerar, importar, rever e publicar novos lotes, ver
[docs/REVISAO_CONTEUDO.md](docs/REVISAO_CONTEUDO.md).

A geração por IA (`tools/generate.ts`) corre **só no computador do autor**, com a
chave `ANTHROPIC_API_KEY` definida no terminal — nunca no frontend nem no repositório.
O modo `--prompt-only` não tem custos.

## Documentação

- [docs/PLANO.md](docs/PLANO.md) — arquitetura, modelo de dados, estratégia para 4.500 lições, testes, custos, riscos e decisões em aberto.
- [docs/REVISAO_CONTEUDO.md](docs/REVISAO_CONTEUDO.md) — fluxo editorial e lista de verificação do revisor.

## Custos

Usar e alojar a aplicação pode ser gratuito (alojamento estático). Os custos possíveis
são a geração de conteúdo por IA (estimativa e alternativas em `docs/PLANO.md`), a
revisão humana e, opcionalmente, áudio gravado ou publicação em lojas de aplicações.

## Limitações conhecidas

- O uso sem internet só existe na versão publicada em https; o ficheiro único `DutchPath.html` já funciona sem internet, mas não se instala como app. Dentro do link do Claude (moldura) não é possível instalar.
- A pronúncia depende da voz neerlandesa instalada no dispositivo.
- Os dados ficam num só navegador (use «Exportar os meus dados» para cópias de segurança).
- Revisão de conteúdo feita pela linha de comandos e editando JSON (ainda sem editor na app).
