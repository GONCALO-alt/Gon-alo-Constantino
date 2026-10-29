# DutchPath — Plano técnico e pedagógico (Fase 1)

> Estado: Fases 1 e 2 implementadas; Fase 3 implementada na maior parte; Fase 5 testada com dados sintéticos.
> Ver a secção «Estado atual» no fim.

## 1. Diagnóstico do ambiente

- Repositório vazio (sem commits), sem projeto anterior → estrutura criada de raiz.
- Node.js 22 e npm 10 disponíveis; Chromium + Playwright pré-instalados (usados só no teste de navegador).
- Sem chave de API da Anthropic no ambiente → a geração por IA foi construída e testada no modo sem custos (`--prompt-only`), mas **ainda não foi executada contra a API**.

## 2. Arquitetura

**Aplicação web local-first, sem servidor.**

| Camada | Escolha | Porquê |
|---|---|---|
| Interface | React 19 + TypeScript + Vite | Moderno, tipado, compila para ficheiros estáticos baratos de alojar. |
| Navegação | Router por hash próprio (~50 linhas) | Funciona em qualquer alojamento estático, sem dependência extra. |
| Conteúdo | Ficheiros JSON estáticos em `public/content`, um por unidade | Carregamento a pedido; atualizável sem tocar no progresso. |
| Progresso | IndexedDB (biblioteca `idb`, 1 KB) | Persistente, grande capacidade, funciona sem rede. |
| Validação | Zod (esquemas partilhados entre app, ferramentas e testes) | Uma só definição do formato. |
| Ferramentas de autoria | Scripts Node em TypeScript (`tools/`) | Corre com Node 22 sem compilação. |
| Geração IA | SDK oficial da Anthropic, **só em desenvolvimento** | A chave nunca chega ao navegador. |
| Testes | Vitest + Testing Library + fake-indexeddb; Playwright para fumo | Rápidos e reproduzíveis. |

Dependências de execução: `react`, `react-dom`, `zod`, `idb` — nada pago.

### Três tipos de dados, bem separados

1. **Conteúdo incluído no pacote** (`public/content/**`): gerado por `npm run content:build` a partir de `content/`. Só lições `published`. Servido como ficheiros estáticos.
2. **Dados pessoais no navegador** (IndexedDB `dutchpath`): progresso, tentativas, revisões, conquistas, definições. Nunca saem do dispositivo (exceto exportação manual).
3. **Conteúdo de autoria** (`content/`): fonte de verdade com rascunhos, estados e notas editoriais. Nunca é enviado ao aluno.

Não há conteúdo servido remotamente nem chamadas à IA durante as lições.

## 3. Estrutura de pastas

```
content/
  course.json            7 secções, 109 unidades, 4.500 lições previstas
  lessons/<unidade>.json lições de autoria (com estado e proveniência)
  drafts/                lotes gerados por IA (ignorado até importar)
public/content/          conteúdo compilado (gerado; ignorado pelo git)
src/
  domain/                esquemas de conteúdo (schemas.ts) e de progresso (progress.ts)
  engine/                lógica pura: correção, revisão espaçada, progressão, sessão
  data/                  IndexedDB (db.ts, migrações), repositórios de conteúdo e progresso
  services/speech.ts     pronúncia (síntese de voz do sistema)
  ui/                    App, router, estado, ecrãs, exercícios, componentes
  config/app.ts          nome da app (VITE_APP_NAME)
tools/
  cli.ts                 validate · build · stats · import · review
  generate.ts            geração de rascunhos por IA (retomável)
  lib/                   validação, semelhança, compilação, importação, dados sintéticos
tests/                   testes unitários, integração, escala e UI; e2e/smoke.mjs
docs/                    este plano e o guia de revisão de conteúdo
```

## 4. Modelo de dados

### Conteúdo (`src/domain/schemas.ts`)

| Entidade | Identificador estável | Notas |
|---|---|---|
| CourseSection | `s1`…`s7` | título, objetivo, nível QECR, lições previstas |
| CourseUnit | `s1-u01` | temas, pré-requisitos, lições previstas |
| Lesson | `s1-u01-l001` | objetivos, exemplos, gramática, exercícios, dificuldade, minutos, **estado** (`draft/approved/published/rejected`), **versão**, **proveniência** (manual/IA, modelo, lote, revisor) |
| Exercise | `s1-u01-l001-e01` | união discriminada de 14 tipos; enunciado, respostas aceites, explicação, `vocabRefs` |
| AnswerOption | `a`…`f` dentro do exercício | `correct` + feedback específico |
| VocabularyItem | `v-palavra` (único no curso) | definido uma vez na lição que o introduz; reutilizado por ID |
| GrammarNote | `g-tema` | corpo, exemplos e comparação com o português |

IDs nunca são reutilizados. Uma lição corrigida aumenta `version`; o progresso guarda a versão concluída.

### Progresso (`src/domain/progress.ts`, IndexedDB)

| Store | Chave | Conteúdo |
|---|---|---|
| profile | `local` | XP, dias de estudo, tempo total, última lição |
| settings | `local` | objetivo diário, áudio, navegação livre, acentos… |
| lessonProgress | lessonId | concluída em, versão, melhor precisão, vezes |
| attempts | auto | cada resposta (para erros recentes e estatísticas) |
| reviews | itemId | calendário de revisão espaçada (ReviewSchedule) |
| dailyStats | data | XP, lições, respostas por dia |
| achievements | id | conquistas desbloqueadas |
| sessions | auto | histórico de sessões |
| meta | chave | reservado para metadados |

Utilizador único (sem contas): não há autenticação a gerir. Migrações versionadas em `MIGRATIONS` (`src/data/db.ts`), testadas.

## 5. Estratégia para as 7 secções e as 4.500 lições

- **Estrutura completa já definida**: 7 secções → 109 unidades → 4.500 lições previstas (600/700/700/700/700/600/500).
- Unidades sem lições publicadas aparecem como «Em preparação» e **não bloqueiam** as seguintes.
- **Produção em lotes de 5–25 lições por unidade** com `tools/generate.ts`, cada lote:
  1. gerado (ou escrito à mão) → `content/drafts/`;
  2. importado como rascunho (`content:import`, idempotente, valida tudo antes de escrever);
  3. validado (esquema, referências, respostas, duplicados, semelhança);
  4. revisto por uma pessoa → `approved` ou `rejected`;
  5. publicado (`published`) e compilado.
- O gerador recebe o vocabulário já ensinado e as lições existentes da unidade, para **reutilizar vocabulário** e evitar repetições.
- **Ordem recomendada**: completar a Secção 1 unidade a unidade (com revisão humana), depois avançar. Escrever 4.500 lições antes de validar a experiência seria desperdício.

## 6. Exercícios e correção

14 tipos implementados: tradução NL→PT e PT→NL (escrita ou banco de palavras), escolha múltipla, preencher espaços, construir frase, associação, ordenação, encontrar o erro, de/het, conjugação, completar diálogo, compreensão de texto e de diálogo, compreensão auditiva, expressões, escrita curta. A revisão de vocabulário gera exercícios automaticamente.

Correção (`src/engine/answers.ts`, `grading.ts`):
- ignora maiúsculas, espaços e pontuação; normaliza apóstrofos;
- variantes com `[a|b]` e `(opcional)`;
- acentos em falta aceites com aviso (configurável);
- gralhas aceites com aviso em palavras longas, **nunca** em palavras curtas (de/het, een/en) nem em conjugações;
- escrita livre: se for diferente do modelo, o aluno **autoavalia** com uma checklist — não é marcado errado automaticamente;
- os exercícios errados repetem-se no fim da lição; só a 1.ª tentativa conta.

## 7. Revisão espaçada

Caixas de Leitner (`src/engine/srs.ts`), parâmetros em `SRS_CONFIG`: intervalos 10 min → 1 → 3 → 7 → 16 → 35 → 75 → 160 dias; erro desce 2 caixas e volta em 5 min; «quase» mantém a caixa e revê mais cedo; dificuldade do item (1–5) ajusta os intervalos; confiança alta salta uma caixa. Um erro numa lição antecipa a revisão da palavra.

## 8. Motivação sem ansiedade

XP (menos XP ao repetir lições, para não «farmar»), objetivo diário configurável (10/20/30/50), sequência que conta até ontem (estudar hoje continua-a), **melhor sequência e total de dias nunca se perdem**, 13 conquistas, mensagens variadas. Sem vidas, sem castigos, sem compras.

## 9. Estratégia de testes

| Área | Ficheiro |
|---|---|
| Normalização, variantes, gralhas, acentos | `tests/answers.test.ts` |
| Correção dos 14 tipos, escrita livre | `tests/grading.test.ts` |
| Revisão espaçada | `tests/srs.test.ts` |
| Desbloqueio, próxima lição, XP, sequência | `tests/progression.test.ts` |
| Validação, duplicados, semelhança | `tests/content-validation.test.ts` |
| Importação, estados, compilação | `tests/import-build.test.ts` |
| Persistência, reabrir, exportar/apagar, **migrações** | `tests/persistence.test.ts` |
| Carregamento progressivo, falhas de rede, conteúdo corrompido | `tests/content-repo.test.ts` |
| **Escala: 500 / 1.000 / 5.000 lições sintéticas** | `tests/scale.test.ts` |
| Navegação, bloqueios e **cada lição completada pela interface** | `tests/ui.test.tsx` |
| Navegador real, telemóvel 360 px e computador | `tests/e2e/smoke.mjs` |

Os testes de escala medem desempenho; **não validam a qualidade linguística**, que exige revisão humana (ver `REVISAO_CONTEUDO.md`).

Resultados medidos (5.000 lições sintéticas, neste ambiente): validação completa com semelhança ≈ 0,9 s; compilação ≈ 50 ms; índice ≈ 94 KB (sem exercícios); maior unidade ≈ 90 KB; cálculo de desbloqueios ≈ 1,4 ms; leitura de 5.000 registos de progresso ≈ 15 ms.

## 10. Custos previsíveis

| Tipo | Custo | Notas |
|---|---|---|
| Desenvolvimento | 0 € | Ferramentas gratuitas e de código aberto. |
| Alojamento | 0 € a poucos €/mês | Ficheiros estáticos: GitHub Pages, Cloudflare Pages ou Netlify têm escalões gratuitos. Domínio próprio é opcional (~10–15 €/ano). |
| Áudio | 0 € | Síntese de voz do dispositivo. Gravações ou TTS na nuvem são opcionais e pagos. |
| Geração por IA (estimativa) | ≈ US$ 0,15–0,35 por lição com Claude Opus 5.5 (US$ 4 / 20 por milhão de tokens) → **≈ US$ 700–1.600 para 4.500 lições** | Estimativa a confirmar com um piloto de 10 lições (a ferramenta mostra o custo real no fim de cada lote). |
| Alternativas mais baratas | API em lote (−50%); Claude Sonnet 5.5 (cerca de metade do preço); `--prompt-only` com uma subscrição existente (sem custo de API, mais trabalho manual) | Modelos mais baratos podem reduzir a qualidade linguística: comparar num piloto. |
| **Revisão humana** | Normalmente o maior custo | Ex.: 5 min por lição → ~375 h para 4.500 lições. |
| Publicação em lojas (opcional) | Apple ~99 USD/ano; Google ~25 USD uma vez | Só se se quiser uma app nativa no futuro. |

Nenhum serviço pago é chamado quando o aluno usa a aplicação.

## 11. Riscos

- **Qualidade linguística do conteúdo gerado** — mitigação: fluxo obrigatório draft → approved → published, validação automática, revisão por falante nativo.
- **Voz neerlandesa ausente em alguns dispositivos** — a app deteta, avisa e permite saltar exercícios de áudio sem penalização.
- **Dados só num navegador** — perdem-se se o utilizador limpar os dados do site; mitigação: exportar/restaurar cópia de segurança.
- **Funcionamento sem rede** — o progresso funciona sem rede, mas o conteúdo ainda não fica em cache para uso offline (falta um service worker). **Não se promete funcionamento offline** até isso estar implementado e testado.
- **Tamanho do JavaScript** (~123 KB comprimido, Zod incluído) — aceitável; pode ser reduzido mais tarde.

## 12. Decisões a confirmar

1. **Plataforma**: manter aplicação web (instalável mais tarde como PWA) ou avançar para app nativa?
2. **Contas e sincronização entre dispositivos**: só local (atual, custo zero) ou conta remota (exige servidor e custos)?
3. **Geração de conteúdo**: orçamento e modelo (Opus 5.5, Sonnet 5.5, API em lote, ou `--prompt-only`)?
4. **Revisão linguística**: quem revê? As 10 lições de amostra foram escritas com IA e **ainda não foram revistas por um falante nativo**; estão publicadas apenas para demonstração.
5. **Áudio**: síntese do sistema (grátis) ou gravações/TTS na nuvem (pago, melhor qualidade)?
6. **Alojamento**: onde publicar?
7. **Progressão**: desbloqueio sequencial (atual) com «navegação livre» opcional — manter?

## 13. Estado atual

- ✅ Fase 1 (este documento).
- ✅ Fase 2: estrutura, navegação, 7 secções, unidades, lições, progresso, 10 lições de amostra (Secção 1, unidades 1–2, 103 exercícios).
- ✅ Fase 3 (maior parte): 14 tipos de exercício, feedback, mapa, XP, objetivo diário, conquistas, revisão espaçada, estatísticas, definições.
- ✅ Fase 5 (simulada): 500/1.000/5.000 lições sintéticas.
- ⏳ Fase 4: lote inicial de 50 lições (faltam 40) — requer decisão 3 e 4.
- ⏳ A seguir: cache offline (service worker), editor de revisão dentro da app (hoje: CLI + edição do JSON), áudio gravado.
