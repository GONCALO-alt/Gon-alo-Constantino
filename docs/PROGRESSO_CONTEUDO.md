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
| 3 Viver nos Países Baixos | 0/16 | 0 | 700 |
| 4 Comunicação independente | 0/16 | 0 | 700 |
| 5 Fluência prática | 0/16 | 0 | 700 |
| 6 Neerlandês avançado | 0/16 | 0 | 600 |
| 7 Domínio e utilização real | 0/15 | 0 | 500 |

Todo o conteúdo foi redigido com IA e **não foi revisto por um falante nativo**.
