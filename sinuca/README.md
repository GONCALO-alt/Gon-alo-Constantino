# Sinuca das Estrelas 🎱

Jogo de sinuca (bola 8) em pixel art, na vertical, feito para telemóvel. Joga-se no browser, sem instalar nada.

**Abrir:** sirva a pasta `sinuca/` (por exemplo `python3 -m http.server` dentro dela) e abra `index.html`.
Também funciona a abrir o ficheiro diretamente; com servidor fica disponível offline e pode ser instalado como app.

## O que tem
- **25 adversários** com personagem própria em pixel art, personalidade, dificuldade (1–10) e frases:
  originais do bairro (Zé do Café, Tia Rosa, Rui Tabelas), famosos internacionais (Taylor Swift, MrBeast, Trump, Shakira,
  Elon Musk, Neymar, Usain Bolt, LeBron James, Lamine Yamal, Mbappé), portugueses (Tony Carreira, Quim Barreiros,
  Cristina Ferreira, Ricardo Araújo Pereira, Marcelo Rebelo de Sousa, José Mourinho, Pepe), **especiais** (MrBeast, Elon,
  Robô Taco 3000) e **lendários** (Cristiano Ronaldo, Lionel Messi, Eusébio, Mestre Sombra). Desbloqueiam-se com vitórias
  ou condições próprias (ou com moedas).
- **Modos:** Partida rápida, 2 Jogadores no mesmo telemóvel, Torneio (3 taças, quartos → meias → final no estádio),
  Sobrevivência (adversários cada vez mais difíceis), 12 Desafios com estrelas, Treino livre.
- **Cenários:** Bar Clássico, Discoteca, Sala VIP, Estádio de Futebol, Sala de Bilhar Luxuosa — todos animados.
- **Personalização:** 10 tacos, 8 mesas, 7 conjuntos de bolas, 7 efeitos ao encaçapar, editor da tua personagem.
- **Progressão:** moedas, níveis/XP, 27 conquistas, recordes, missões diárias + prémio diário, classificação (ranking).
- Animações e reações das personagens, comentador com piadas, música e sons 8-bit sintetizados, ecrãs de vitória/derrota animados.

## Como jogar
Toca/arrasta na mesa para apontar, desliza na barra de força e solta para tacar. ◀ ▶ afinam a mira; o círculo
«Efeito» dá efeito à branca. Regras de bar: encaçapa o teu grupo e depois a 8. Branca na caçapa, não tocar em nada
ou tocar primeiro na bola errada é falta (bola na mão para o adversário).

## Código (`js/`)
`util` utilitários · `data` conteúdo · `sprites` pixel art · `physics` física · `rules` regras · `ai` adversários ·
`progress` perfil e progressão · `audio` som · `scenes` cenários e mesa · `game` partida · `ui` menus · `modes` modos e resultados.

Testes: `node tests/selfplay.test.cjs` (partidas completas IA contra IA).

> Paródia humorística: todas as personagens inspiradas em pessoas reais são caricaturas fictícias,
> sem qualquer ligação, patrocínio ou apoio dessas pessoas.
