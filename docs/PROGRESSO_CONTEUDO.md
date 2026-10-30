# Progresso da produção de conteúdo

Ponto de retoma para novas sessões. Atualizar no fim de cada lote.

## Como continuar

1. Escrever a próxima unidade em `tools/authoring/units/s<secção>_u<unidade>.py`
   (formato compacto descrito em `tools/authoring/dsl.py`; ver unidades existentes como modelo).
2. `python3 tools/authoring/units/<ficheiro>.py` → gera/funde `content/lessons/<unidade>.json`.
3. `npm run content:validate` e `npx vitest run tests/content-answers.test.ts`.
4. Commit + push por unidade.

Regras: IDs de vocabulário únicos em todo o curso (rever com `reviewVocabulary`/`vocabRefs`);
9–11 exercícios por lição, ≥ 4 tipos; português europeu; neerlandês padrão dos Países Baixos.

## Estratégia

- **1.ª passagem (núcleo):** 5–7 lições por unidade em todas as unidades, por ordem, para que
  o curso fique completo de ponta a ponta.
- **2.ª passagem e seguintes:** acrescentar lições de prática, histórias, compreensão oral e
  revisão a cada unidade até ao número previsto em `content/course.json` (≈ 40 por unidade).

## Estado

| Secção | Unidades com núcleo | Lições | Previstas |
|---|---|---|---|
| 1 Primeiros passos | 15/15 | 79 | 600 |
| 2 A vida quotidiana | 15/15 | 75 | 700 |
| 3 Viver nos Países Baixos | 16/16 | 80 | 700 |
| 4 Comunicação independente | 16/16 | 80 | 700 |
| 5 Fluência prática | 16/16 | 80 | 700 |
| 6 Neerlandês avançado | 16/16 | 80 | 600 |
| 7 Domínio e utilização real | 15/15 | 75 | 500 |

**Total:** 1000 lições publicadas (9939 exercícios, 2322 palavras).
- 549 lições escritas (núcleo: ≥ 5 por unidade em todas as 109 unidades);
- 451 lições de revisão e prática **geradas automaticamente** a partir do vocabulário e das frases
  das lições escritas (`python3 tools/authoring/review_gen.py`): 4 por unidade (5 na Secção 1) —
  «Revisão: vocabulário», «Revisão: frases», «Prática mista», «Desafio da unidade» (e «Revisão rápida»).
  Não copiam exercícios; criam exercícios novos com o mesmo material. Ao voltar a correr o script,
  só as lições geradas são substituídas; as escritas nunca são alteradas.

Próximo passo: lições escritas novas (histórias, compreensão oral, mais prática), começando pela Secção 1.

Todo o conteúdo foi redigido com IA e **não foi revisto por um falante nativo**.
