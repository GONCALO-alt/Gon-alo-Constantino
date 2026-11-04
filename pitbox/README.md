# Pit Box — Professional Pit Stop Simulator

Simulador de mecânico de pit stop para telemóvel: 3D, primeira pessoa, ecrã vertical (com opção horizontal).
Corre no browser do telemóvel, sem instalar nada, e pode ser adicionado ao ecrã inicial como uma app.

## Como jogar no telemóvel

**Opção 1: pelo link publicado (a mais simples)**
Abre o link da página Pit Box no telemóvel, com a tua conta Claude. A página é privada: para outra pessoa jogar,
partilha-a no menu Partilhar da página.

**Opção 2: a partir deste repositório, na mesma rede Wi-Fi**
```bash
cd pitbox
python3 -m http.server 8080
```
No telemóvel, abre `http://<IP-do-computador>:8080` no Chrome (Android) ou Safari (iPhone).
Para instalar: menu do browser › *Adicionar ao ecrã principal*. Abre em ecrã inteiro com o ícone do pneu.

**Opção 3: ficheiro único**
```bash
python3 pitbox/build.py        # cria pitbox/dist/pitbox.html
```
Envia `dist/pitbox.html` para o telemóvel e abre-o no browser. Precisa de internet para carregar o motor 3D (Three.js).

Também pode ser alojado em qualquer serviço de páginas estáticas (GitHub Pages, Netlify) apontando para a pasta `pitbox/`.

## Como testar (lista rápida)
1. Toca uma vez no ecrã: o som só começa depois do primeiro toque (regra dos browsers).
2. Menu › **📻 Rádio**: escolhe a voz do engenheiro (♂ marca vozes masculinas) e carrega em *Testar*.
3. **Corrida rápida** › F1 › Fácil. Na garagem, abre **🔧 Ferramentas** e faz as três verificações.
4. Quando ouvires "BOX, BOX!": *Ir buscar o pneu* › escolhe o composto pedido › toca em *Levar* até à box ›
   *Pegar na pistola* › arrasta até à marca › desaperta, espera pelos colegas, aperta na zona verde › sinal verde.
5. Lê o relatório: atributos, análise de onde perdeste tempo, equipamento.
6. Repete em **Profissional** para jogar sem ajudas.

No computador: Espaço = gatilho/ação, D = sentido da pistola, setas = deslizar.

## O que o jogo tem
- **Garagem**: equipa sentada a ver a corrida numa TV com transmissão 3D no traçado real (13 circuitos), rádio,
  e painel com **Ferramentas** (pressão do ar, teste da pistola, mangueira, manutenção), **Carro** (posição, diferenças,
  desgaste e temperatura dos pneus), **Equipa** (funções e número de mecânicos por categoria) e **Operação**.
- **Chamada e preparação**: "Carro a entrar na próxima volta", "BOX, BOX! PIT STOP!", ir buscar o composto certo
  (há dois carrinhos), levá-lo para a box, pegar na pistola e posicionar-se na marca.
- **Pit stop por categoria**: F1/F2/F3 como pistoleiro (colegas tiram e põem a roda, conta o teu tempo de reação);
  F4 e GT3 com duas rodas e trabalho completo (GT3 com reabastecimento).
- **Meteorologia**: seco, calor, frio, pista molhada, chuva (gotas, trovoada, asfalto molhado) e noite (holofotes).
  Muda os compostos (intermédios, chuva), o trabalho e pode provocar mudanças de pneus à última hora.
- **Imprevistos justos**: a pistola encrava mais se estiver gasta ou não for testada; uma porca apertada demais numa
  paragem fica presa na seguinte; pressão de ar errada enfraquece ou descontrola a pistola; fugas de ar só aparecem
  se não inspecionares a mangueira; falhas de rádio, colegas que falham o encaixe, carro fora da marca.
  Quando a pistola encrava podes insistir no gatilho ou trocar para a pistola de reserva.
- **Dificuldades**: Fácil, Médio, Difícil e **Profissional** (sem textos de passo, sem zonas verdes, sem destaques).
- **Rádio com várias vozes**: engenheiro, chefe de equipa, estratega, mecânicos e piloto.
- **Relatório profissional**: tempo, melhor pessoal, média, erros, rapidez, precisão, coordenação, consistência,
  avaliação do chefe de equipa e análise passo a passo do tempo perdido.
- **Progressão**: carreira com épocas e propostas de equipas, atributos que evoluem, níveis, personalização
  (fatos, luvas, botas, capacete, pistolas) e Oficina para manutenção do equipamento.

## Estrutura do código
`index.html` carrega os sistemas em `src/` (cada um independente, com estado global partilhado):

| Ficheiro | Sistema |
|---|---|
| `core.js` | utilitários |
| `data.js`, `tracks.js` | categorias, dificuldades, equipas, circuitos, cosméticos, traçados reais |
| `profile.js` | perfil e gravação (`localStorage`, chave `pitbox.v1`) |
| `audio.js` | som sintetizado (motores, pistola, chuva, público) |
| `radio.js` | vozes do rádio e mensagens |
| `world.js`, `player.js` | mundo 3D, carros, rodas, mecânicos, mãos e pistola |
| `weather.js` | meteorologia |
| `gear.js` | ferramentas, manutenção e painel da garagem |
| `skills.js` | atributos e análise da paragem |
| `tv.js` | transmissão da corrida na TV |
| `camera.js` | câmara e animações |
| `ui.js` | menus e ecrãs |
| `race.js` | fases da corrida e passos do pit stop |
| `result.js` | relatório, estatísticas, carreira |
| `main.js` | ciclo principal e arranque |

`build.py` junta tudo num único HTML (`dist/pitbox.html`) ou na versão publicada (`--artifact`).

## Porque web (Three.js) e não Unity
Abre em qualquer telemóvel por um link, sem loja nem compilação, e cada versão nova fica disponível de imediato.
A lógica (dados, regras, progressão) está separada da apresentação 3D, o que facilita uma migração futura se for preciso.

## Plano por etapas
- **Versão 1** — feita: menu, garagem 3D, TV, rádio, chamada, primeira pessoa, troca de roda, cronómetro, erros, relatório.
- **Versão 2** — feita: várias posições (pistoleiro, duas rodas), cinco categorias, meteorologia, ferramentas e manutenção, mais animações.
- **Versão 3** — em parte: carreira com épocas, equipas e propostas. Falta: academia de mecânicos, contratos com duração e salário, transferências entre categorias com negociação.
- **Versão 4** — por fazer: rankings e rivais, repetições 3D com câmara lenta e ângulos, garagens que evoluem com a equipa, campeonato especial de pit stops com medalhas.

## Créditos
Traçados reais: [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) (MIT), ver `THIRD_PARTY_LICENSES.md`.
Equipas fictícias inspiradas em equipas reais; nomes e marcas reais não são usados.
