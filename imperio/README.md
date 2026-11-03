# Império Mundial

Jogo de estratégia arcade, na vertical, para telemóvel. Escolhes qualquer país do mundo e fazes crescer o teu império. Cada país aparece no mapa pintado com a sua bandeira; as terras conquistadas passam a ter a bandeira de quem as conquistou.

Abre `index.html` no browser (não precisa de servidor nem de instalação).

## Como se joga

- **Conquista aos poucos:** cada país está dividido em províncias, e as províncias em quadradinhos. Cada batalha ganha conquista os quadradinhos junto à frente; a província só passa para ti quando ficares com quase todos. Se perderes uma batalha, o inimigo recupera alguns quadradinhos. Na paz, cada província ocupada fica com quem tem a maior parte.
- **Alianças:** os países começam em blocos (Aliança Atlântica, Pacto Euroasiático, Liga Árabe, Mercosul…). Se atacares um país, os aliados dele juntam-se à guerra contra ti. Os teus aliados também te podem ajudar.
- **Diplomacia:** propõe alianças, envia presentes para melhorar relações, propõe a paz. O inimigo também pode pedir a paz quando está a perder.
- **Economia:** cada província dá rendimento. Usa o dinheiro para recrutar tropas e para melhorar Economia, Indústria Militar e Defesa.
- **Ataque aéreo:** enfraquece a guarnição de qualquer província inimiga, mesmo sem fronteira.
- Capitais têm mais defesa; quando caem, o inimigo perde moral. Um país é anexado quando perde a última província.
- **Generais:** forma exércitos com um general (Ofensivo, Rápido ou Defensivo). Toca no exército e depois numa província para ele avançar; em modo automático combate sozinho.
- **Tipos de tropas:** soldados, tanques (fortes em planície), navios (desembarques), aviões (bombardeamentos) e mísseis.
- **Terreno:** planície, floresta, montanha, deserto e tundra mudam a defesa e a força dos tanques.
- **Míssil:** devasta uma província inteira, mas o mundo passa a odiar-te.
- **Revoltas:** províncias conquistadas com poucas tropas podem revoltar-se (o Quartel ajuda). Países anexados podem renascer.
- **Edifícios:** Fábrica, Quartel, Porto e Muralha em cada província.
- **Recursos:** petróleo, ouro, comida e ferro dão bónus a quem os controla.
- **Comércio, tributo e espiões:** acordos comerciais, exigir dinheiro ou províncias a países fracos, roubar, sabotar, incitar revoltas ou provocar guerras.
- **Coligações:** se fores demasiado agressivo ou grande, os vizinhos juntam-se contra ti.
- **Acontecimentos:** terramotos, crises, petróleo, golpes de estado, epidemias e colheitas recordes.
- **Música arcade** (botão ♪) e **mapa de guerra** (botão 🔥) com as frentes de combate do mundo.
- O jogo guarda-se sozinho no browser a cada 15 dias de jogo.

## Ficheiros

- `index.html` — página e estilos
- `game.js` — regras, IA, desenho do mapa e animações
- `data.js` — mapa em quadradinhos (gerado)
- `tools/build-map.mjs` — gera o `data.js` (cerca de 209 mil quadrados, 197 países) a partir do Natural Earth (`world-atlas`, escala 1:50m)
