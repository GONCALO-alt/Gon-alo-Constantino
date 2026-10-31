# DutchPath

Aplicação web para aprender **neerlandês** (padrão dos Países Baixos) a partir do **português europeu**.
Funciona no navegador, em telemóveis, tablets e computadores. O progresso fica guardado apenas no seu dispositivo.

> O nome é configurável (`VITE_APP_NAME`). Os níveis QECR são indicativos — não é uma certificação.
> O conteúdo atual (2276 lições, A1 → B2: 1825 escritas + 451 de revisão geradas a partir delas) foi redigido com apoio de IA e ainda não foi revisto por um falante nativo.

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
- **2276 lições** publicadas: 1825 escritas + 451 de revisão e prática geradas por `tools/authoring/review_gen.py`; 21 071 exercícios, 5131 palavras.
- Versão de ficheiro único: `DutchPath.html` (ou `npm run build:single`).
- **14 tipos de exercício** com correção tolerante (variantes, acentos, gralhas), feedback imediato e explicação; os erros repetem-se no fim da lição.
- Escrita livre com autoavaliação: uma resposta diferente do modelo não é marcada errada automaticamente.
- **Revisão espaçada** (caixas de Leitner configuráveis), palavras difíceis, esquecidas e erros recentes.
- XP, objetivo diário, sequência sem castigos, conquistas, estatísticas.
- Sons: pronúncia com a voz do sistema; depois de cada exercício a resposta certa é lida em neerlandês; nos pares, cada palavra neerlandesa é pronunciada ao tocar; efeitos sonoros (três variações de «certo», errado suave, sons para 3, 5 e 10 respostas certas seguidas, fanfarra de fim de lição e outra para lição sem erros, conquista; vibração curta no telemóvel; volume ajustável) gerados no navegador, sem ficheiros nem serviços externos.
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

- Sem funcionamento offline garantido: o progresso é local, mas o conteúdo ainda não é guardado em cache.
- A pronúncia depende da voz neerlandesa instalada no dispositivo.
- Os dados ficam num só navegador (use «Exportar os meus dados» para cópias de segurança).
- Revisão de conteúdo feita pela linha de comandos e editando JSON (ainda sem editor na app).
