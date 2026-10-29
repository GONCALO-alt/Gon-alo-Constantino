# Fluxo de produção e revisão de conteúdo

Nenhuma lição chega ao aluno sem passar por uma pessoa. A validação automática
apanha erros de **estrutura**; não garante que o neerlandês ou o português estão certos.

## Estados

```
draft ──► approved ──► published
  │           │             │
  └─► rejected ◄┘           └─► draft (despublicar para corrigir)
```

Um rascunho nunca passa diretamente a publicado.

## Passo a passo

```bash
# 1. Gerar um lote (ou escrever lições à mão no mesmo formato)
export ANTHROPIC_API_KEY=...            # só no seu terminal; nunca no repositório
node tools/generate.ts --unit s1-u03 --from 1 --count 5
#    sem custos: --prompt-only escreve os pedidos em content/drafts/prompts/

# 2. Importar como rascunho (idempotente; rejeita o lote inteiro se houver erros)
npm run content:import -- content/drafts/s1-u03-l001-005.json

# 3. Validar (esquema, referências, respostas, duplicados, semelhança)
npm run content:validate

# 4. Rever cada lição
npm run content:review -- list --status draft
npm run content:review -- show s1-u03-l001
#    corrigir diretamente em content/lessons/s1-u03.json, se necessário

# 5. Aprovar ou rejeitar
npm run content:review -- approve s1-u03-l001 s1-u03-l002 --note "revisto por X"
npm run content:review -- reject s1-u03-l003 --note "exemplo pouco natural"

# 6. Publicar e compilar
npm run content:review -- publish --unit s1-u03
npm run content:build
```

Se o gerador falhar a meio, volte a correr o mesmo comando: as lições já geradas
são mantidas e não são duplicadas.

## Lista de verificação do revisor

**Neerlandês**
- [ ] Frases naturais, como um falante dos Países Baixos as diria.
- [ ] Artigos de/het corretos; plurais corretos.
- [ ] Ordem das palavras correta (verbo em 2.ª posição; fim da oração subordinada).
- [ ] Registo (je/u) coerente com a situação.

**Português**
- [ ] Português europeu (não brasileiro): «autocarro», «estás», «chamo-me»…
- [ ] Traduções idiomáticas, não decalques.

**Exercícios**
- [ ] Todas as respostas corretas razoáveis estão aceites (variantes `[a|b]` e `(opcional)`).
- [ ] As opções erradas são mesmo erradas e têm feedback útil.
- [ ] As explicações estão corretas e não inventam regras («sem exceções» só se for verdade).
- [ ] A lição dura 3–8 minutos e reutiliza vocabulário anterior.

**Pedagogia**
- [ ] Os objetivos correspondem aos exercícios.
- [ ] Novidades introduzidas aos poucos; nada é pedido antes de ser ensinado.

## Atualizar uma lição publicada

1. `npm run content:review -- unpublish s1-u01-l002` (volta a rascunho)
2. Corrigir e **aumentar `version`**.
3. Aprovar, publicar e compilar.

O progresso dos alunos mantém-se (está ligado ao ID, que nunca muda). Nunca
reutilize um ID de lição ou de vocabulário apagado.
