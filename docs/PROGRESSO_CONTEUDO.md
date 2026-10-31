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

| Secção | Unidades | Lições publicadas | Previstas |
|---|---|---|---|
| 1 Primeiros passos | 15/15 | 413 | 600 |
| 2 A vida quotidiana | 15/15 | 390 | 700 |
| 3 Viver nos Países Baixos | 16/16 | 416 | 700 |
| 4 Comunicação independente | 16/16 | 631 | 700 |
| 5 Fluência prática | 16/16 | 704 | 704 |
| 6 Neerlandês avançado | 16/16 | 736 | 736 |
| 7 Domínio e utilização real | 15/15 | 808 | 808 |

**Total:** 4098 lições publicadas (39 275 exercícios, 5131 palavras).
- 1825 lições escritas;
- 1822 **lições de prática**, uma a seguir a cada lição escrita (`python3 tools/authoring/practice_gen.py`):
  antes de aparecerem palavras novas, o aluno treina só as palavras e frases da lição que acabou de fazer
  (e algumas da anterior). Não ensinam nada de novo: todas as palavras mostradas, incluindo as opções
  erradas, já foram ensinadas. Ficam na posição «ordem + 0,5» (a lição 3 é seguida da prática 3,5), por isso
  as lições escritas, os IDs e o progresso dos alunos não mudam. Voltar a correr o script substitui-as;
- 451 lições de revisão e prática **geradas automaticamente** a partir do vocabulário e das frases
  das lições escritas (`python3 tools/authoring/review_gen.py`): 4 por unidade (5 na Secção 1) —
  «Revisão: vocabulário», «Revisão: frases», «Prática mista», «Desafio da unidade» (e «Revisão rápida»).
  Não copiam exercícios; criam exercícios novos com o mesmo material. Ao voltar a correr o script,
  só as lições geradas são substituídas; as escritas nunca são alteradas.

**Última ronda (+1000 lições escritas, concentradas nas secções finais):** Secção 4 +204,
Secção 5 +240, Secção 6 +256, Secção 7 +300. Ficheiros `tools/authoring/units/sX_uYY_b.py`
(lições 10 em diante de cada unidade). Temas da Secção 7: escrita avançada, registos, expressões
idiomáticas, revisão gramatical, vocabulário profissional, fala rápida e sotaques, simulações da
vida real, revisão temática, prática de exame e projetos.

Controlo de qualidade aplicado a esta ronda:
- `node tools/cli.ts validate` sem erros; nenhuma lição nova repete exercícios de outras lições
  (os avisos de semelhança que restam são entre lições antigas e as lições de revisão geradas);
- os exercícios «encontrar o erro» corrigem sempre uma única palavra; erros de ordem das palavras
  passaram a escolha da frase correta (incluindo 88 exercícios antigos com resposta ambígua);
- textos, nomes, empresas e números dos exemplos são fictícios e estão assinalados como tal.

**Ronda seguinte (+276 lições escritas nas Secções 1–3, A1–A2):** 6 lições a mais em cada uma
das 46 unidades (ficheiros `tools/authoring/units/sX_uYY_c.py`). Mais prática onde quem começa mais
precisa: pronúncia, números, perguntas e negação (S1); rotina, comida, compras, casa e tempo (S2);
transportes, saúde, câmara municipal, casa, correio, banco, viagens e registo formal (S3). Cada
unidade da Secção 1 e 2 termina com uma revisão; nenhuma lição nova repete exercícios existentes e
o vocabulário novo só aparece depois de ensinado.

Próximo passo: revisão por um falante nativo.

Todo o conteúdo foi redigido com IA e **não foi revisto por um falante nativo**.
