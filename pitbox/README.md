# Pit Box

Jogo mobile (vertical, 3D, primeira pessoa) de mecânico de pit stop. Um único ficheiro HTML com Three.js, sons sintetizados (Web Audio) e voz do rádio (síntese de voz do browser). O progresso fica guardado no `localStorage`.

Abrir `index.html` num browser (ou servir a pasta) e jogar na vertical. No computador: Espaço = gatilho/ação, D = sentido da pistola, setas = deslizar.

## O que já existe
- Menu, modo carreira (épocas de 8 rondas, propostas de equipas, subida F4 → F3 → F2 → F1, ramo GT3), corrida rápida.
- Garagem com TV em direto, rádio e informação da próxima operação; chamada "PIT STOP!" e corrida até à box.
- Troca de pneus por passos: pegar na pistola, desapertar (manter), retirar (deslizar), encaixar (toque no verde), mudar sentido, apertar (binário), PRONTO.
- F1/F2/F3: 1 roda. F4 e GT3: 2 rodas (GT3 com reabastecimento).
- Imprevistos: pistola encravada, porca presa, sentido errado, roda desalinhada, manta presa, detritos, carro fora da marca, atraso de um colega.
- 3 dificuldades, cronómetro que nunca pára, penalizações, avaliação S–D, XP, créditos, níveis.
- Personalização (fatos, luvas, capacete, pistola) e estatísticas com recordes e gráfico de evolução.

## Estrutura do código (`index.html`)
Dados (categorias, equipas, cosméticos) → perfil/gravação → áudio → rádio → mundo 3D (pista, garagem, carros, mecânicos) → lógica da corrida e da paragem (`buildSteps`, `nextStep`) → ecrãs.
