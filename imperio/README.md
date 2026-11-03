# Império Mundial

Jogo de estratégia arcade, na vertical, para telemóvel. Escolhes qualquer país do mundo e fazes crescer o teu império.

Abre `index.html` no browser (não precisa de servidor nem de instalação).

## Como se joga

- **Conquista aos poucos:** cada país está dividido em províncias. Declaras guerra e atacas uma província de cada vez, a partir das províncias que já tens na fronteira (ou por mar, com -20%).
- **Alianças:** os países começam em blocos (Aliança Atlântica, Pacto Euroasiático, Liga Árabe, Mercosul…). Se atacares um país, os aliados dele juntam-se à guerra contra ti. Os teus aliados também te podem ajudar.
- **Diplomacia:** propõe alianças, envia presentes para melhorar relações, propõe a paz. O inimigo também pode pedir a paz quando está a perder.
- **Economia:** cada província dá rendimento. Usa o dinheiro para recrutar tropas e para melhorar Economia, Indústria Militar e Defesa.
- **Ataque aéreo:** enfraquece a guarnição de qualquer província inimiga, mesmo sem fronteira.
- Capitais têm mais defesa; quando caem, o inimigo perde moral. Um país é anexado quando perde a última província.
- O jogo guarda-se sozinho no browser a cada 15 dias de jogo.

## Ficheiros

- `index.html` — página e estilos
- `game.js` — regras, IA, desenho do mapa e animações
- `data.js` — mapa em quadradinhos (gerado)
- `tools/build-map.mjs` — gera o `data.js` a partir do Natural Earth (`world-atlas`)
