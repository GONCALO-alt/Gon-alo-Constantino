# Plano: modo carreira completo

## O que já existe (e fica)
- Jogo em JavaScript simples (sem compilação), Three.js para o 3D, Canvas 2D, áudio sintetizado, gravação em `localStorage`.
- `race.js`: corrida com física real, rivais com ritmo próprio, pneus que gastam, boxes, chuva que muda, danos, bandeiras amarela e azul, safety car, bandeira vermelha, penalizações e repetição.
- `track.js` + `circuits.js`: circuitos reais (F4 a F1) e pistas inventadas (karting).
- `ui.js`: carreira com calendário e dias, oficina, garagem, capacete, patrocinador único, propostas no fim da época, tabela do campeonato e corrida rápida.

## O que muda na estrutura
- Novo ficheiro `js/career.js`, só com regras e simulação (sem ecrã): o **mundo** do automobilismo (pilotos, equipas, campeonatos de todas as categorias, mercado, notícias, rivalidades, patrocinadores, desenvolvimento).
- O `ui.js` mostra o mundo e chama o `career.js`. As carreiras antigas são convertidas automaticamente.

## Etapas
1. **Mundo persistente**: pilotos com idade, talento, capacidade, consistência e jeito para a chuva, que evoluem e envelhecem. Equipas com logótipo, orçamento, competitividade, fiabilidade, desenvolvimento e objetivos. As outras categorias correm em simulação ao mesmo tempo, com campeões e histórico.
2. **Jogador e contratos**: idade, reputação e atributos (ritmo, consistência, chuva, ultrapassagem, físico, técnica). Contratos de 1 a 3 épocas com salário, bónus por vitória e pódio, objetivos e negociação. Propostas conforme o desempenho, transferências, lugares pagos, ficar sem equipa. Superlicença para a F1.
3. **Fim de semana por categoria**: karting com pré-final e final; F4 com corrida 1 (grelha invertida) e corrida 2; F3 e F2 com sprint (grelha invertida) e corrida principal; F1 com sprint nos fins de semana de sprint. Pontuação oficial de cada categoria (pole e volta mais rápida onde contam). Volta de formação, virtual safety car, avarias conforme a fiabilidade, consumo de combustível e simulação de sessões.
4. **Desenvolvimento dos carros**: peças próprias de cada categoria, com custo, benefício e consequências (por exemplo, mais potência gasta mais fiabilidade). As equipas rivais também desenvolvem durante a época.
5. **Vida fora das pistas**: entrevistas, conferências de imprensa depois das corridas, eventos de patrocinadores, reuniões com engenheiros, treino físico, simulador e eventos especiais, com escolhas que mexem na reputação, nos patrocinadores e nas rivalidades.
6. **Patrocinadores**: vários, cada um com logótipo, valor, duração, objetivos e bónus. Aparecem e saem conforme a reputação.
7. **Rivalidades e notícias**: rival no campeonato, colega de equipa, quem luta pelas mesmas posições e jovem talento. Centro de notícias gerado a partir do que acontece na simulação.
8. **Perfil e legado**: estatísticas totais e por categoria, equipas, histórico de contratos, campeões anteriores e Hall of Fame.
