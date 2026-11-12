# STUDY AI

Assistente pessoal de estudos com inteligência artificial, para estudantes de todos os anos (1.º ano ao ensino superior) e de todas as disciplinas. Explica a matéria, resolve exercícios passo a passo, faz resumos, fichas e testes de preparação, corrige respostas e organiza o tempo de estudo com um plano personalizado.

Aplicação web completa: frontend (React), servidor (Node + Express), base de dados (SQLite), contas com autenticação e ligação ao modelo de IA da Anthropic (Claude). Funciona em telemóveis, tablets e computadores.

**Formas de usar:**

| Versão | Onde corre | IA | Custo |
|---|---|---|---|
| **Cloudflare + Gemini** (recomendada para usar grátis) | site no Cloudflare | Google Gemini (chave gratuita) | 0 € — ver [«Publicar grátis no Cloudflare»](#publicar-grátis-no-cloudflare-com-a-ia-gemini) |
| Netlify + Gemini | site no Netlify | Google Gemini (chave gratuita) | 0 € — ver [«Publicar grátis no Netlify»](#publicar-grátis-no-netlify-com-a-ia-gemini) |
| Servidor próprio (Node) | o seu computador ou um servidor | Claude (API da Anthropic, paga) | o que gastar na API |
| Artefacto no claude.ai | dentro do claude.ai | o Claude da conta de quem abre | incluído na conta claude.ai |

> **A IA só responde depois de configurar uma chave de API** (ver «Ligar a IA» ou as secções «Publicar grátis»). Sem chave, a aplicação funciona na mesma (contas, questionário, plano de estudos, calendário, resumos e flashcards escritos à mão, temporizador, progresso) e mostra claramente que a IA não está ligada. Não há respostas simuladas.

## Começar

Requisitos: **Node.js 22.18 ou mais recente**.

```bash
cd study-ai
npm install
cp .env.example .env      # e escreva a chave em ANTHROPIC_API_KEY (opcional)
npm run dev               # abre em http://localhost:5173
```

Em desenvolvimento correm dois processos: a interface (Vite, porta 5173) e o servidor/API (porta 8787).

Versão de produção (um só servidor que serve a API e a interface):

```bash
npm run build
npm start                 # http://localhost:8787
```

Os dados ficam em `study-ai/data/` (base de dados `study-ai.sqlite` e pasta `uploads/`). Faça cópias de segurança desta pasta.

## Ligar a IA

1. Crie uma chave em <https://console.anthropic.com/> → *API Keys*.
2. Ponha-a no ficheiro `study-ai/.env` (`ANTHROPIC_API_KEY=...`) ou como variável de ambiente no alojamento.
3. Reinicie o servidor. Ao arrancar, o terminal mostra «IA ligada» e os modelos de cada plano.

A chave fica **apenas no servidor**: o navegador nunca a vê. Cada pergunta à IA é um pedido pago à API da Anthropic, faturado a quem é dono da chave — os preços dos planos mostrados na aplicação são só ilustrativos.

### Os três planos

| Plano | Preço (ilustrativo) | Perguntas | Imagens | Ficheiros | Respostas |
|---|---|---|---|---|---|
| Cláudio 5 | 0,00 € | ilimitadas | não | não | simples (esforço `low`, até 6 000 tokens) |
| Cláudio 5.5 | 0,79 € | 20 por dia | 3 por dia | não | detalhadas, passo a passo (`medium`, 16 000) |
| Cláudio 6 | 0,99 € | ilimitadas | ilimitadas | PDF, TXT, MD, CSV | aprofundadas (`high`, 32 000) |

- Todos os planos se escolhem gratuitamente em «Escolhe a tua IA». **Não existe nenhum sistema de pagamentos.**
- Os limites são aplicados **no servidor** (`server/ai/usage.ts`), por estudante, por dia (fuso `APP_TIMEZONE`, por omissão Europe/Lisbon) e por plano. Os valores estão em `shared/plans.ts`.
- Conta como 1 pergunta: cada mensagem no chat, cada resumo, baralho de flashcards ou teste gerado pela IA, e cada correção de respostas abertas. Se a IA falhar, a pergunta não é contada.
- Por omissão os três planos usam o modelo `claude-opus-5-5`; a diferença está no esforço, no tamanho máximo e nas instruções. Para usar outro modelo num plano: `STUDY_AI_MODEL_CLAUDIO_5`, `STUDY_AI_MODEL_CLAUDIO_5_5`, `STUDY_AI_MODEL_CLAUDIO_6`.
- Está ativada a opção `fallbacks: "default"` da API: se o modelo recusar um pedido por razões de segurança, o próprio servidor da Anthropic tenta outro modelo. Pode desligá-la em `server/ai/client.ts` (`supportsServerFallback`).

## O que a aplicação faz

- **Questionário inicial** (9 passos): nome, ano, disciplinas (pré-escolhidas para o ano), dificuldades, facilidades, tempo por dia, dias e hora de estudo, objetivo, forma de aprender e próximos testes. Pode ser alterado em Definições.
- **Plano de estudos automático** (`shared/planner.ts`): horário semanal com sessões por disciplina, mais tempo para as difíceis (e no início do dia), menos para as fáceis, atividades de acordo com a forma de aprender, exercícios de consolidação, objetivos semanais e uma explicação das decisões. Nos 3 dias antes de cada teste do calendário entram revisões, um teste de preparação e uma revisão final. Tudo editável; com a IA ligada, aparece também uma análise personalizada.
- **Chat IA**: respostas em tempo real, Markdown e fórmulas (KaTeX), atalhos (explicar, resolver, resumo, ficha, teste, corrigir, TPC, perguntas, exemplos), disciplina da conversa, anexos conforme o plano (fotografias, PDF, texto, arrastar ou colar), parar resposta, copiar, guardar como resumo, histórico com pesquisa, mudar o nome e apagar.
- **Início**: boas-vindas, plano do dia (marcar como feita, pedir ajuda, temporizador), botão grande para a IA, próximos testes, objetivos do dia e da semana, disciplinas favoritas, perguntas disponíveis.
- **Disciplinas**, **Resumos** (com IA ou escritos à mão, pesquisa, edição, flashcards a partir de um resumo), **Testes e exercícios** (gerador de testes personalizados com correção automática e pela IA, histórico, flashcards com revisão espaçada), **Calendário escolar**, **Modo de estudo** com temporizador, **Progresso** (minutos por dia, por disciplina, sequência, testes, flashcards) e **Definições** (perfil, plano, preferências, palavra-passe, exportar e apagar dados).

## Versão no claude.ai (artefacto)

Há também uma versão que corre como **artefacto do claude.ai**, sem servidor nem chave de API: <https://claude.ai/artifact/T9fiD9f48GKAvBZc6jb2TZ> (privada; partilha-se no menu Partilhar da página).

- É a mesma interface, compilada num só ficheiro (`npm run build:artifact` → `dist-artifact/study-ai.html`).
- Os pedidos `/api/...` são respondidos dentro da página (`src/demo/server.ts`), com o mesmo motor do plano, os mesmos limites dos planos e as mesmas instruções da IA do servidor.
- A IA usa o **Claude da conta de quem abre a página** (capacidade `sample`): Cláudio 5, 5.5 e 6 pedem respostas mais rápidas, normais ou mais completas. A primeira pergunta pede autorização.
- Os dados ficam numa área privada de cada pessoa na base de dados do artefacto (só ela os vê, em qualquer dispositivo); sem essa possibilidade, ficam no navegador.
- Diferenças: sem contas próprias (usa a conta do claude.ai), PDF não são lidos (só imagens e ficheiros de texto), as imagens enviadas ficam só durante a sessão, sem instalação como aplicação.

## Anúncios da própria STUDY AI

A aplicação mostra anúncios **só da própria STUDY AI** (sem publicidade de terceiros nem recolha de dados para publicidade), com a etiqueta «Anúncio · STUDY AI». Aparecem quando são úteis:

| Anúncio | Quando aparece | Onde |
|---|---|---|
| Mudar para o Cláudio 6 | restam 3 perguntas ou menos no Cláudio 5.5 | Chat, Início |
| Gerar teste de preparação | há um teste daqui a 1 a 5 dias | Início, Plano |
| Criar flashcards / teste mais difícil | depois de um teste com nota abaixo de 50 % / 80 % ou mais | resultado do teste |
| Instalar a aplicação | telemóvel sem a app instalada | Início |
| Fazer a primeira pergunta | ainda não usou o chat | Início, Plano, Progresso |
| Experimentar o Cláudio 5.5 (fotografias) | está no Cláudio 5 | Chat, Início |
| Marcar testes no calendário | calendário vazio | Início, Plano |
| Explicações mais aprofundadas (Cláudio 6) | 3 ou mais respostas na mesma conversa, fora do Cláudio 6 | Chat, depois das respostas |
| Flashcards | ainda não tem cartões | Início, Resumos, Testes, Progresso |
| Modo de estudo | ainda não usou o temporizador | Início, Plano, Progresso, Testes |

Regras para não incomodar: no máximo um anúncio por página; o botão ✕ esconde-o durante alguns dias (normalmente 7); cada anúncio aparece num número limitado de dias; a escolha não muda a cada visita no mesmo dia; sem IA ligada não se anunciam funcionalidades de IA. Mudar de plano a partir de um anúncio é gratuito (versão de demonstração). As regras estão em `src/promos.ts` e a memória dos anúncios fica só no dispositivo.

## Usar no telemóvel

A STUDY AI instala-se no telemóvel como uma aplicação (PWA): fica com o ícone amarelo no ecrã principal, abre em ecrã inteiro (sem a barra do navegador) e arranca depressa.

- **Android (Chrome, Edge, Samsung Internet):** botão **Instalar aplicação** no Início, no Menu ou em Definições → «Aplicação no telemóvel».
- **iPhone/iPad (Safari):** Partilhar → **Adicionar ao ecrã principal** (a app mostra estes passos).
- A instalação só funciona quando a aplicação está publicada em **https** (ou em `localhost`).

O que muda no telemóvel:

- Barra de navegação em baixo (Início, Plano, Chat IA, Testes, Menu), que se esconde enquanto escreves.
- Chat em ecrã inteiro, com botão para voltar e seletor compacto da disciplina.
- Plano de estudos um dia de cada vez, com seletor de dias da semana.
- Flashcards com gestos: deslizar para a direita = «Sabia», para a esquerda = «Não sabia».
- Janelas que sobem de baixo, vibração ao concluir sessões, caixas de texto sem zoom no iPhone, respeito pelo entalhe e pela barra de gestos.
- Sem internet, a aplicação abre e mostra «Sem ligação» (os dados e a IA precisam do servidor).

Apps nas lojas (Google Play / App Store) não estão incluídas: podem ser criadas mais tarde a partir desta versão (por exemplo com Capacitor), mas precisam do Android Studio / Xcode e de contas de programador.

## Segurança e dados

- Palavras-passe com `scrypt` e sal aleatório; sessões com token aleatório em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção; na base de dados só fica o hash do token.
- Proteção contra CSRF (cabeçalho obrigatório nos pedidos que alteram dados), limites de tentativas de login e de pedidos à IA, cabeçalhos de segurança (CSP, `X-Frame-Options`, etc.).
- Todas as consultas filtram pelo estudante: ninguém vê os dados de outra conta (há testes automáticos para isto).
- Ficheiros enviados: tipo verificado pelo conteúdo (não só pela extensão), tamanho limitado, guardados fora da pasta pública e servidos só ao dono. Anexos não usados são apagados ao fim de 24 h.
- O estudante pode exportar todos os dados (JSON) e apagar a conta.

## Chave gratuita do Gemini (para o Cloudflare ou o Netlify)

1. Abra <https://aistudio.google.com/> e entre com uma conta Google.
2. Clique em **Get API key** (ou «Obter chave de API») → **Create API key**.
3. Copie a chave (começa por `AIza…`). **Não a partilhe nem a ponha no GitHub.**

Não é preciso cartão de crédito. Enquanto não ativar a faturação no Google Cloud, a chave fica no plano gratuito e **nunca é cobrada**: quando o limite gratuito acaba, a IA responde «atingiu o limite de pedidos» até ao dia seguinte.

**Privacidade e limites (válido para as duas versões gratuitas):**

- No plano gratuito, a Google pode usar as perguntas enviadas para melhorar os seus modelos. A aplicação avisa os estudantes junto do chat e nas Definições. Para escolas ou dados sensíveis, ative a faturação no Google Cloud (deixa de haver esse uso) ou use a versão com servidor próprio.
- Há um número máximo de pedidos à IA por minuto e por dia (muda com o tempo; ver *Rate limits* no AI Studio). É partilhado por **todos** os estudantes do site, porque a chave é uma só. Os limites dos planos Cláudio (20 perguntas/3 imagens no 5.5, etc.) continuam a ser aplicados por estudante.
- O modelo é escolhido automaticamente: «Flash-Lite» no Cláudio 5 (mais pedidos grátis por dia), «Flash» no 5.5 e no 6. O 5.5 e o 6 deixam a IA «pensar» antes de responder (o 6 mais), para respostas mais cuidadas.

## Publicar grátis no Cloudflare (com a IA Gemini)

A interface é servida pelo Cloudflare, a API corre num **Worker** (`cloudflare/worker.ts`) e cada estudante tem o seu **Durable Object** com uma pequena base de dados SQLite só dele. Tudo no plano gratuito, sem cartão de crédito. A configuração está em `study-ai/wrangler.jsonc` — não é preciso criar bases de dados à mão.

### Passo a passo

1. Crie a [chave gratuita do Gemini](#chave-gratuita-do-gemini-para-o-cloudflare-ou-o-netlify).
2. Crie uma conta grátis em <https://dash.cloudflare.com/sign-up>.
3. No painel: **Workers & Pages → Create** (*Create application*) → **Import a repository** → ligue o GitHub e escolha este repositório.
4. Preencha:
   - **Project name:** `study-ai` (recomendado; com outro nome também funciona)
   - **Build command:** deixe vazio (o `wrangler.jsonc` já compila a app)
   - **Deploy command:** `npx wrangler deploy` (o que já vem)
   - **Advanced settings → Path** (pasta do projeto): `study-ai` ← importante (a raiz do repositório é outro projeto)
   - **Branch:** `claude/study-ai-educational-app-luy6ff` ← importante: a branch principal deste repositório é a do DutchPath, que não tem a STUDY AI
5. **Create and deploy**. Ao fim de 1–2 minutos, a app fica em `https://study-ai.<a-sua-conta>.workers.dev`.
6. Ligue a IA: no Worker, **Settings → Variables and Secrets → Add** → tipo **Secret**, nome `GEMINI_API_KEY`, valor = a chave → **Deploy**. (Sem este passo a app funciona, mas o chat explica que a IA não está ligada.)
7. Abra o endereço, crie uma conta e use. No telemóvel: «Adicionar ao ecrã principal».

**Confirmar que é a STUDY AI que está publicada:** abra `https://<o-seu-endereço>/api/health`. Deve aparecer `{"ok":true,"app":"STUDY AI",…}`. A app abre sempre com fundo preto; uma **página branca** (ou o DutchPath) quer dizer que o Cloudflare está a publicar outra coisa — normalmente a branch principal do repositório.

**Corrigir:** no projeto, **Settings → Build**:
- **Branch control → Production branch:** `claude/study-ai-educational-app-luy6ff`
- **Root directory / Path:** `study-ai`
- **Build command:** vazio · **Deploy command:** `npx wrangler deploy`

Guarde e volte a publicar (**Deployments → … → Retry deployment**, ou envie uma alteração para a branch). Cada novo envio para a branch no GitHub volta a publicar automaticamente.

### Variáveis opcionais (Settings → Variables and Secrets)

| Variável | Para quê |
|---|---|
| `GEMINI_MODEL` | Forçar um modelo para todos os planos (ex.: `gemini-2.5-flash`). |
| `GEMINI_MODEL_CLAUDIO_5`, `GEMINI_MODEL_CLAUDIO_5_5`, `GEMINI_MODEL_CLAUDIO_6` | Modelo de um plano específico. |
| `SESSION_SECRET` (como *Secret*) | Segredo das sessões. Se faltar, é criado e guardado automaticamente. |
| `APP_TIMEZONE` | Fuso dos limites diários (por omissão `Europe/Lisbon`). |

### Como funciona e limites

- **Sem limite de 30 s:** ao contrário do Netlify, a resposta da IA pode demorar o que for preciso (até 2 minutos), por isso o Cláudio 6 pode pensar mais.
- **Dados:** cada estudante tem um Durable Object próprio (`user:<id>`), que guarda os dados em SQLite e os mantém em memória enquanto está a ser usado; só grava o que muda. As palavras-passe ficam com `scrypt`; as sessões são cookies assinados (`HttpOnly`, `Secure`). Exportar e apagar a conta funcionam como nas outras versões.
- **Anexos até 4 MB**, guardados em pedaços na base de dados do estudante. O Gemini lê imagens e PDF diretamente.
- **Plano gratuito do Cloudflare:** os ficheiros da app não contam como pedidos; os pedidos à API têm um limite diário generoso (chega para uso pessoal ou de uma turma). Se for ultrapassado, a API recusa pedidos até ao dia seguinte — não há cobranças no plano gratuito.
- Registos de erros: no Worker, **Observability → Logs**.

### Experimentar no computador

```bash
cd study-ai
npm install
echo "GEMINI_API_KEY=AIza..." > .dev.vars   # opcional; o .dev.vars nunca vai para o GitHub
npm run cf:local                            # compila e abre em http://localhost:8787
```

Corre com o mesmo motor do Cloudflare (workerd); os dados ficam na pasta `.wrangler/`.

## Publicar grátis no Netlify (com a IA Gemini)

Alternativa ao Cloudflare: a interface fica no Netlify, a API corre numa **função do Netlify** (`netlify/functions/api.mts`), os dados de cada estudante ficam no **Netlify Blobs** e a IA é o **Google Gemini**.

### Publicar no Netlify

0. Crie a [chave gratuita do Gemini](#chave-gratuita-do-gemini-para-o-cloudflare-ou-o-netlify).

1. Crie uma conta grátis em <https://app.netlify.com/> (pode entrar com o GitHub).
2. **Add new project** (ou *Add new site*) **→ Import an existing project → GitHub** e escolha este repositório.
3. Preencha:
   - **Branch to deploy:** `claude/study-ai-educational-app-luy6ff` ← importante: a branch principal deste repositório é a do DutchPath, que não tem a STUDY AI
   - **Base directory:** `study-ai` ← importante (a raiz do repositório é outro projeto)
   - Os outros campos (*build command* `npm run build`, *publish directory* `dist`, *functions directory*) vêm do `study-ai/netlify.toml` — pode deixá-los como estão.
4. Antes de publicar, em **Environment variables → Add a variable**: `GEMINI_API_KEY` = a chave do Gemini.
   (Se já publicou sem a chave: *Site configuration → Environment variables*, adicione-a e faça **Deploys → Trigger deploy**.)
5. **Deploy**. Ao fim de 1–2 minutos o site fica em `https://<nome>.netlify.app`. Abra-o, crie uma conta e use.

Se der erro («Base directory does not exist» ou o site do DutchPath), corrija num site já criado: **Site configuration → Build & deploy → Continuous deployment** → em *Build settings* **Base directory** = `study-ai`; em *Branches and deploy contexts* **Production branch** = `claude/study-ai-educational-app-luy6ff`. Depois **Deploys → Trigger deploy → Deploy site**. Para confirmar: `https://<nome>.netlify.app/api/health` deve mostrar `"app":"STUDY AI"`.

No telemóvel, abra o endereço no navegador e escolha «Adicionar ao ecrã principal» para a instalar como aplicação.

### Variáveis opcionais

| Variável | Para quê |
|---|---|
| `GEMINI_MODEL` | Forçar um modelo para todos os planos (ex.: `gemini-2.5-flash`). |
| `GEMINI_MODEL_CLAUDIO_5`, `GEMINI_MODEL_CLAUDIO_5_5`, `GEMINI_MODEL_CLAUDIO_6` | Modelo de um plano específico. |
| `SESSION_SECRET` | Segredo das sessões (texto aleatório longo). Se faltar, é criado e guardado automaticamente no Netlify Blobs. |
| `APP_TIMEZONE` | Fuso dos limites diários (por omissão `Europe/Lisbon`). |

### Como funciona e limites

- **Respostas até ~25 segundos:** as funções do Netlify terminam aos 30 s. Se uma resposta for muito longa, é guardada até onde chegou com a nota «A resposta foi cortada. Pede “continua”».
- **Anexos até 4 MB** (limite dos pedidos às funções). O Gemini lê imagens e PDF diretamente.
- **Dados:** cada estudante tem o seu registo no Netlify Blobs (`user/<id>/…`), com escrita protegida contra alterações em simultâneo. Exportar e apagar a conta funcionam como na outra versão.
- Plano gratuito do Netlify: chega para uso pessoal ou de uma turma; se o site exceder os limites mensais, o Netlify suspende-o até ao mês seguinte (não cobra sem autorização).

### Experimentar no computador antes de publicar

```bash
cd study-ai
npm install
echo "GEMINI_API_KEY=AIza..." > .env   # opcional: sem chave, a IA mostra como a ativar
npm run build
npm run netlify:local                  # http://127.0.0.1:8888 (dados só em memória)
```

## Publicar com servidor próprio

A versão com servidor Node (IA Claude) precisa de um servidor com disco persistente (por causa da base de dados SQLite). Para o Cloudflare ou o Netlify, use as versões acima. (O `netlify.toml` da raiz do repositório é da DutchPath; o da STUDY AI é `study-ai/netlify.toml`.)

Opções simples: Render, Railway, Fly.io ou um VPS. Com o `Dockerfile` incluído:

```bash
docker build -t study-ai .
docker run -p 8787:8787 -v study-ai-data:/data -e ANTHROPIC_API_KEY=... study-ai
```

Sem Docker: `npm ci && npm run build && npm start`, com `DATA_DIR` a apontar para um disco persistente. Use sempre https; atrás de um proxy defina `TRUST_PROXY=1`.

## Estrutura

```
study-ai/
  shared/      código comum: planos de IA, disciplinas, datas, motor do plano de estudos, tipos
  server/      API (Express), base de dados SQLite (node:sqlite), autenticação, IA
    ai/        cliente da API da Anthropic, instruções (prompts), limites dos planos
    routes/    estudante (perfil, plano, calendário, progresso), chat e anexos, resumos/flashcards/testes
  core/        a mesma API sem servidor próprio (Cloudflare, Netlify e artefacto do claude.ai) e o cliente do Gemini
  cloudflare/  versão Cloudflare: Worker (contas, sessões) e Durable Objects com SQLite (dados de cada estudante)
  netlify/     versão Netlify: função /api, contas, armazenamento (Netlify Blobs)
  src/         interface React (páginas em src/pages, componentes em src/components)
  tests/       testes automáticos (Vitest) e teste no navegador (Playwright)
```

## Testes

```bash
npm test             # motor do plano + API (contas, isolamento, limites, anexos, chat, testes, flashcards)
npm run typecheck
npm run build && npm run test:e2e   # navegador real, computador e telemóvel; capturas em tests/e2e/screenshots
npm run build && npm run test:e2e:netlify      # o mesmo, na versão Netlify + Gemini
npm run build && npm run test:e2e:cloudflare   # o mesmo, na versão Cloudflare + Gemini
```

Os testes da versão Cloudflare (`tests/cloudflare.test.ts`) correm o Worker e os Durable Objects no motor do Cloudflare (workerd, através do `wrangler dev`), sem conta nem internet — incluindo reiniciar e confirmar que os dados ficaram guardados.

Os testes da integração com a IA usam simuladores locais das APIs da Anthropic (`tests/fake-anthropic.ts`) e do Gemini (`tests/fake-gemini.ts`): verificam os pedidos enviados (modelo, instruções, imagens, documentos, limites) e o streaming, sem chave nem custos. **A aplicação nunca usa os simuladores.**

## Limitações conhecidas

- Não há recuperação de palavra-passe por email (não existe serviço de email configurado).
- Sem pagamentos: os preços são apenas informativos, como pedido.
- SQLite num só servidor: adequado para uma escola ou um grupo de utilizadores; para muitos milhares de utilizadores em simultâneo, migrar para PostgreSQL.
- Ficheiros Word (.docx) não são lidos pela IA: converta para PDF.
- A IA pode cometer erros; a aplicação avisa os estudantes para confirmarem a informação importante.
- O plano de estudos é criado por regras (motor de planeamento), não pela IA, para funcionar sempre e de forma previsível; a IA acrescenta a análise e os conselhos quando está ligada.
