# Motorista TVDE — Simulador em primeira pessoa

Jogo 3D de simulação de motorista TVDE (estilo Uber) na cidade fictícia de **Porto Azul**.
O carro conduz sozinho; tu és o motorista: gere o telemóvel, aceita viagens, conversa com os passageiros,
toma decisões e gere o dinheiro e o dia de trabalho.

Feito com **Three.js** (WebGL), sem passo de compilação. Funciona no computador e no telemóvel.

## Como jogar

O jogo usa módulos JavaScript, por isso tem de ser servido por HTTP (não abre com duplo clique):

```bash
cd tvde-simulador
python3 -m http.server 8000
# abrir http://localhost:8000
```

Também pode ser publicado tal como está em qualquer alojamento estático (Netlify, GitHub Pages…).

### Controlos

| Ação | Rato / toque | Teclado |
|---|---|---|
| Olhar à volta (e para o passageiro) | arrastar no ecrã | ← → |
| Olhar em frente | duplo toque | C |
| Abrir/fechar telemóvel | botão 📱 | P |
| Ação principal (iniciar/terminar viagem, ficar online) | botão verde | Espaço |
| Responder ao passageiro | tocar na resposta | 1–4 |
| Ficar online/offline | app RIDO Driver | O |
| Mudar de estação de rádio | botão 📻 | R |
| Pausa | ❚❚ | Esc |

## O que existe

- **Primeira pessoa** dentro do carro: tablier, volante que roda com as curvas, mãos do condutor, painel de
  instrumentos e ecrã central com GPS a funcionar, retrovisor interior com imagem real, espelhos laterais,
  limpa-vidros e gotas de chuva no para-brisas.
- **Cidade 3D** com 64 quarteirões: centro de negócios, bairros residenciais, restaurantes, hotéis, zona de
  vida noturna, estação de comboios, centro comercial, hospital, universidade, parque, postos de combustível e aeroporto
  (com aviões a descolar). Semáforos funcionais, trânsito que os respeita, peões, candeeiros.
- **Ciclo dia/noite** e **meteorologia** (céu limpo, nublado, chuva, nevoeiro): janelas acendem-se à noite,
  estradas molhadas, faróis.
- **Telemóvel** com a app RIDO Driver: online/offline, pedidos com 15 s para aceitar, foto/avaliação do passageiro,
  recolha, destino, distâncias, tempo e valor; navegação; mensagens; ganhos do dia/semana/totais; histórico de
  viagens; notificações; conta e reputação; terminar sessão. Apps de Mapa (zonas de procura), Carteira, Garagem,
  Objetivos e Definições.
- **Viagens completas**: pedido → condução automática até à recolha → passageiro anda até ao carro e entra →
  iniciar viagem → conversas e situações → destino → pagamento → avaliação e gorjeta → histórico.
- **10 personalidades** de passageiros e mais de 40 situações com escolhas: conversas, pedidos especiais, paragens,
  mudanças de destino, passageiros mal-educados, atrasados, cancelamentos, estradas cortadas, ambulâncias,
  pneu furado, operação STOP, objetos esquecidos, oferta de pagamento por fora…
- **Economia**: saldo inicial de 100 €, tarifas com preço dinâmico, comissão de 25 %, gorjetas, bónus,
  combustível/eletricidade, lavagem, revisão, multas, custos diários e histórico financeiro.
- **Tempo**: o dia começa às 06:00 e termina, no máximo, às 02:00; podes terminar quando quiseres e ver o resumo do dia.
  Velocidade do tempo ×1, ×2, ×4. Pausas para descansar (o cansaço afeta as avaliações).
- **Progressão**: níveis, reputação por escalões, objetivos diários, desafio semanal, 20 conquistas e
  4 veículos para desbloquear (RIDO X, Comfort, Green e Black).
- **Rádio** com 4 estações: música gerada em tempo real (pop, jazz, guitarra portuguesa) e um noticiário falado
  com trânsito, eventos, meteorologia e preços dos combustíveis. Alguns passageiros gostam, outros não.
- **Eventos na cidade** (futebol no Estádio do Mar, concertos, festa na Vila Velha, cruzeiros, congressos) com picos
  de procura e preço dinâmico na zona.
- **Trânsito vivo**: horas de ponta, autocarros com paragens, obras diárias que cortam ruas, buzinas quando há filas.
- **Novos bairros**: Vila Velha com calçada e castelo do outro lado do rio, Ponte Atlântica e praia com bares e palmeiras.
- **Clientes habituais** que se lembram de ti e têm histórias em vários capítulos; **viagens partilhadas** com dois passageiros.
- **Combustível com preço diário** diferente em cada posto; **despesas pessoais** (comida, renda, contas) e **mealheiro**
  com objetivos de poupança.
- **Sons da cidade**: gaivotas e ondas, sinos, sirenes, música dos bares, multidão no estádio, obras.
- **Gravação automática** no navegador: ao voltar continuas exatamente onde ficaste (incluindo a viagem em curso).

## Estrutura do código

```
js/
  config.js          constantes, veículos, mapa de bairros
  main.js            arranque, ciclo principal, menus, resumo do dia
  world/             cidade, estradas e rotas, céu/meteorologia, trânsito, peões, modelos humanos
  car/               interior do carro em 1.ª pessoa e condução automática
  game/              estado e economia, viagens, passageiros, diálogos, progressão
  ui/                HUD, telemóvel, mapa GPS
lib/                 Three.js 0.170 (incluído para funcionar sem internet)
```

Para acrescentar conteúdo: novos diálogos/situações em `js/game/dialogues.js`, novos veículos em
`js/config.js` e novos objetivos/conquistas em `js/game/economy.js`.
