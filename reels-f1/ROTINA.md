# Rotina diária: Reel de F1

Corre todos os dias às 7:00 (Lisboa) numa sessão nova. Resultado: um Reel vertical de 25–45 s
com voz sintética de um jovem britânico, **tudo em inglês** (fala, texto no ecrã, legendas e legenda do post), publicado na página **Reel F1 do Dia**:
https://claude.ai/artifact/Scaw2w7Ckd9GuBh8ZzxUDw

## 1. Preparar

```bash
git fetch origin claude/kind-meitner-5yd7hc && git checkout claude/kind-meitner-5yd7hc
bash reels-f1/setup.sh          # instala o Piper e a voz inglesa (≈ 1 min)
```

## 2. Buscar o tema do dia

- Ver o calendário e resultados na OpenF1 (`https://api.openf1.org/v1/meetings?year=AAAA`,
  `/sessions`, `/session_result`, `/starting_grid`, `/position`, `/drivers`).
- Pesquisar na web as notícias de F1 das últimas 24–72 h e o que está a ter mais
  visualizações e comentários (vídeos «de último a pódio», polémicas, rádios, penalizações,
  mercado de pilotos, regulamentos).
- Não repetir um tema que já esteja em `reels-f1/guioes/`.
- Confirmar cada número em duas fontes (OpenF1 + uma notícia). Se não der para confirmar, não usar.
- Sem fim de semana de corrida recente, escolher: antevisão do próximo GP, curiosidade
  histórica com data de hoje, estatística da época, ou explicação de uma regra.

## 3. Escrever o guião

Guardar em `reels-f1/guioes/AAAA-MM-DD.json` (ver o exemplo `2026-11-11.json`).

- 4–6 cenas, nesta ordem: `gancho` → `problema`/`contexto` → `virada` → `chamada`.
- Gancho: um número ou facto que choca, falado em menos de 3 s.
- `fala`: frases curtas em inglês britânico, tom de fã jovem, «you» no fim (drop a comment, follow).
  **Escrever os números por extenso na fala** (a voz lê mal algarismos): «twenty-first»,
  «fourteen and a half seconds».
- `ecra`, `detalhe`, `numero`, `rotulo`, `titulo`, `legenda_post` em inglês. Ordinais como «21st → 2nd»
  animam: o primeiro aparece e o segundo conta até ao valor final.
- `analise` e títulos das `fontes` podem ficar em português (são só para o Gonçalo).
- Incluir `"voz": {"modelo": "en_GB-northern_english_male-medium"}`.
- `ecra`: no máximo 8 palavras. `numero` (opcional): o número grande. `detalhe`: 1 linha.
- Campos também obrigatórios: `data`, `data_curta`, `titulo`, `analise`, `legenda_post`,
  `hashtags`, `fontes` (título + URL). `referencias_virais` é opcional.
- Só imagens geradas pelo script: não usar logótipos, fotos ou vídeos da F1 ou de equipas.

## 4. Gerar

```bash
python3 reels-f1/make_reel.py reels-f1/guioes/AAAA-MM-DD.json --out "$SCRATCH/reel"
```

Ver 4–5 fotogramas (ffmpeg `select` + `tile`) para confirmar que nada se sobrepõe.

## 5. Entregar

1. Artifact `read` do URL acima e depois `publish` com `url` = esse URL,
   `file_path` = `$SCRATCH/reel/index.html` e `files` = `reel.mp4` e `capa.jpg` da mesma pasta.
2. `git add reels-f1/guioes/AAAA-MM-DD.json`, commit e `git push -u origin claude/kind-meitner-5yd7hc`.
3. Mensagem final curta: título do Reel, duração e o link da página.
