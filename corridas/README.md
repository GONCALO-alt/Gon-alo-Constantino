# Grelha de Partida

Jogo de corridas realista, em horizontal, para telemóvel. A carreira começa no karting e sobe à Fórmula 4, Fórmula 3, Fórmula 2 e Fórmula 1.

Abre `index.html` no browser.

- **Circuitos reais na F4, F3, F2 e F1** com o calendário de cada categoria (Melbourne, Xangai, Suzuka com a ponte, Bahrein, Jeddah, Miami, Montreal, Mónaco, Barcelona, Red Bull Ring, Silverstone, Spa, Hungaroring, Zandvoort, Monza, Madrid, Baku, Singapura, Austin, México, Interlagos, Las Vegas, Lusail, Yas Marina, Imola, Mugello, Paul Ricard e Portimão). Os traçados vêm de dados GPS ([bacinger/f1-circuits](https://github.com/bacinger/f1-circuits), licença MIT, ver `LICENSE-circuitos.txt`). O karting continua com pistas inventadas.
- **Modo carreira com calendário:** cada época tem datas, apresentação da época, um dia de oficina antes de cada corrida (só aí se compram peças ou se desenvolve o carro) e o fim de semana de corrida. Época curta ou completa nas definições.
- **Garagem/oficina em 3D** com 6 peças do kart (motor, chassis, pneus, travões, carburador e eixo traseiro).
- **Tabela do campeonato** com classificação de pilotos (vitórias, pódios, poles, diferença para o líder), campeonato de equipas e resultados de cada corrida com cores.
- **Capacete detalhado** em 3D: 14 desenhos, viseiras (escura, clara, espelhada, dourada, azul, arco-íris), acabamento brilhante, mate ou metalizado, número nos lados, nome e bandeira atrás, patrocinador na viseira.
- **Menu principal** com montra 3D do teu carro a rodar, e **corrida rápida** (escolhes carro, equipa, pista, tempo, voltas, posição de partida e rivais) sem mexer na carreira.
- **Volante com ecrã:** no kart, um ecrã tipo MyChron no centro do volante (velocidade, rotações, tempos de volta, diferença); nas fórmulas, um ecrã a cores com mudança, delta, pneus e bandeiras. Luvas nas mãos.
- **Halo** em todas as fórmulas (F4 a F1), rodas com pneus redondos, barbatana, câmara de TV no topo e patrocinadores na asa.
- **Pista com mais vida:** publicidade nas barreiras, marcas de pneus nas travagens, postos de comissários que mostram bandeira amarela ou azul.
- **Engenheiro com voz de homem** (escolhe uma voz masculina em português quando o aparelho tem; se não, engrossa a voz).
- **Câmaras:** primeira pessoa (cockpit com volante, nariz, pneus e halo), atrás do carro, vista de cima e mapa fixo (botão 📷 ou tecla C).
- **Física:** pneus que perdem aderência quando passam do limite, transferência de peso ao travar, carga aerodinâmica que aumenta com a velocidade, relva e gravilha que tiram aderência. Ajudas opcionais: ABS, controlo de tração, direção assistida e trajetória ideal.
- **Comandos:** setas ◀ ▶ ou volante (arrastar em círculo), pedais de acelerar e travar, rádio com o engenheiro. No computador: setas/WASD, espaço trava, R rádio, B box, C câmara, Esc pausa.
- **Corridas:** partida com 5 luzes, qualificação de uma volta (ou simulada), rivais com estratégia, pontos iguais aos da F1 (25-18-15-12-10-8-6-4-2-1).
- **Pneus e boxes:** a partir da Fórmula 3 há macios, médios e duros, que gastam; na F2 e F1 a paragem é obrigatória.
- **Carreira:** nome, nacionalidade, número, capacete personalizável, dinheiro para peças do kart e desenvolvimento do carro, propostas de equipas no fim de cada época.

- **Realismo gráfico:** sombras, relevo nas pistas e colinas à volta, asfalto e corretores com textura, barreiras de blocos (karts) ou rails, muros de pneus e redes (fórmulas), edifícios, postes, árvores e público. Qualidade gráfica baixa, média ou alta.
- **Meteorologia:** chuva que pode começar ou parar a meio, pista que molha e seca, pneus intermédios e de chuva, spray, reflexos e gotas no ecrã.
- **Danos:** a asa da frente e a suspensão estragam-se nas batidas; trocam-se nas boxes.
- **Retrovisores** a mostrar quem vem atrás (fórmulas, qualidade média ou alta).
- **Bandeiras:** amarela (sem ultrapassar), azul (deixar passar), safety car e bandeira vermelha com recomeço da grelha.
- **Treinos livres** antes da qualificação.
- **Repetição** de cada corrida com câmaras de televisão, cockpit ou atrás do carro.
- **Colega de equipa** e ordens de equipa pelo rádio; a relação com a equipa conta.
- **Patrocinadores** com objetivos em cada corrida.
- **Traçados inspirados** em Monza, Algarve (Portimão), Spa e Interlagos (aproximados), além das pistas inventadas.

As equipas e os pilotos são inventados. O 3D usa o Three.js (r128, licença MIT); há uma cópia em `js/vendor/` para quando não há internet.
## Modo carreira

O mundo continua a andar mesmo quando não estás lá (regras em `js/career.js`):

- **Pilotos com vida própria:** cada um tem idade, talento, capacidade, consistência e jeito para a chuva. Os novos evoluem, os veteranos perdem rendimento e retiram-se, e todos os anos entram miúdos no karting. Mudam de equipa, sobem de categoria e podem ficar sem lugar.
- **Equipas:** logótipo, orçamento, competitividade, fiabilidade, capacidade de desenvolvimento e objetivos para a época. Desenvolvem o carro durante a época; o regulamento muda de 4 em 4 anos.
- **Todas as categorias correm ao mesmo tempo:** as que não são a tua são simuladas ronda a ronda, com campeões e classificação de equipas.
- **Progressão difícil:** propostas conforme o lugar no campeonato, as vitórias, a reputação e a idade. Para a F1 precisas de 40 pontos de superlicença e 18 anos. Há lugares pagos nas equipas pequenas e equipas que te dispensam se falhares o objetivo.
- **Contratos:** 1 a 3 épocas, salário por corrida, bónus por vitória e pódio, objetivo, negociação (a equipa pode recusar e retirar a proposta), renovações e transferências.
- **Fim de semana por categoria:** karting com pré-final e final; F4 com corrida 1 (grelha invertida) e corrida 2; F3 e F2 com sprint (grelha invertida) e corrida principal; F1 com sprint em 6 Grandes Prémios. Pontuação oficial de cada categoria, com pole e volta mais rápida onde contam. Cada sessão pode ser conduzida ou simulada.
- **Corrida:** volta de formação, virtual safety car (F1, F2, F3), avarias conforme a fiabilidade do carro, combustível (o modo ataque gasta mais) e penalizações.
- **Desenvolvimento:** karting com motor, chassis, pneus, travões, carburador e eixo; F4 a F2 com motor, aerodinâmica, suspensão, travões e afinações; F1 com unidade de potência, asas, fundo, suspensão, arrefecimento e aerodinâmica. Cada peça tem custo e efeito, e algumas gastam fiabilidade. A equipa dá pontos de desenvolvimento conforme o orçamento.
- **Vida fora das pistas:** ao avançar os dias aparecem treinos, simulador, reuniões com engenheiros, entrevistas, eventos de patrocinadores e eventos especiais, cada um com escolhas. Depois de cada corrida há conferência de imprensa.
- **Patrocinadores:** até 3, com logótipo, valor por corrida, duração, bónus e satisfação. Aparecem com a reputação e saem se ficarem descontentes.
- **Rivalidades:** rival no campeonato, colega de equipa, quem luta pelas mesmas posições e jovem talento, com frente a frente e notícias.
- **Notícias, perfil e legado:** jornal com o que acontece na simulação, perfil com atributos e estatísticas por categoria, histórico de contratos, campeões de cada ano e Hall of Fame.

As carreiras de versões anteriores são convertidas automaticamente.

