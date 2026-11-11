# -*- coding: utf-8 -*-
"""
F1 2026 — TUDO O QUE ACONTECEU ATÉ AO BRASIL
Guião do documentário (português de Portugal).

Cada cena tem um tipo visual e uma lista de linhas (narração, legenda no ecrã).
Legenda:  ""   -> mantém a anterior
          "!X" -> impacto (vermelho, tremor, câmara lenta)
          "A|B"-> duas linhas
Só constam factos confirmados em fontes (Formula1.com, FIA e imprensa
especializada). Onde as fontes divergem, o texto evita o pormenor.
"""

# Cores das equipas
C = {
    "MER": (39, 244, 210), "FER": (232, 0, 45), "MCL": (255, 128, 0),
    "RBR": (54, 113, 198), "RB": (102, 146, 255), "ALP": (0, 147, 204),
    "HAA": (182, 186, 189), "WIL": (100, 196, 255), "AUD": (245, 5, 55),
    "AST": (34, 153, 113), "CAD": (212, 175, 55),
}

# Pilotos -> equipa
P = {
    "Antonelli": "MER", "Russell": "MER", "Leclerc": "FER", "Hamilton": "FER",
    "Norris": "MCL", "Piastri": "MCL", "Verstappen": "RBR", "Hadjar": "RBR",
    "Lawson": "RB", "Lindblad": "RB", "Gasly": "ALP", "Colapinto": "ALP",
    "Bearman": "HAA", "Ocon": "HAA", "Sainz": "WIL", "Albon": "WIL",
    "Hulkenberg": "AUD", "Bortoleto": "AUD", "Alonso": "AST", "Stroll": "AST",
    "Perez": "CAD", "Bottas": "CAD",
}

SCENES = [
# ------------------------------------------------------------------ ABERTURA
{"type": "cold", "accent": "MER", "lines": [
    ("Vinte anos. Sessenta e oito dias.", "20 ANOS|68 DIAS"),
    ("Nunca ninguém tinha sido campeão do mundo de Fórmula 1 tão novo.", "!NUNCA ANTES"),
    ("Mas antes da coroa houve tudo o resto.", "ANTES DA COROA..."),
    ("Uma revolução técnica. Duas corridas canceladas. Uma guerra dentro da mesma garagem.", "UMA REVOLUÇÃO"),
    ("O regresso de Lewis Hamilton ao lugar mais alto do pódio. Um Max Verstappen que se recusou a desaparecer.", "HAMILTON|VERSTAPPEN"),
    ("E uma McLaren campeã que, de repente, teve de recomeçar do zero.", "MCLAREN"),
    ("Dezanove Grandes Prémios. Da Austrália ao Brasil.", "19 GRANDES PRÉMIOS"),
    ("Isto é tudo o que aconteceu.", "!TUDO"),
]},
{"type": "title", "lines": [
    ("", "F1 2026|TUDO O QUE ACONTECEU ATÉ AO BRASIL"),
]},

# ------------------------------------------------------------------ REGRAS
{"type": "chapter", "num": "I", "title": "A NOVA ERA", "lines": [
    ("Para perceber 2026, é preciso começar antes do primeiro semáforo.", ""),
]},
{"type": "rules", "lines": [
    ("Este foi o ano da maior mudança de regras da história recente da Fórmula 1.", "!NOVAS REGRAS"),
    ("Os motores passaram a dividir a potência quase meio a meio: metade vinda do motor de combustão, metade vinda da parte elétrica.", "@split"),
    ("O MGU-H desapareceu. Em compensação, o MGU-K quase triplicou, de cento e vinte para trezentos e cinquenta quilowatts.", "@kw"),
    ("Todos os carros passaram a usar combustível sustentável avançado.", "COMBUSTÍVEL|SUSTENTÁVEL"),
    ("Os carros ficaram mais curtos, mais estreitos e mais leves: o peso mínimo desceu para setecentos e sessenta e oito quilos, sem combustível.", "@kg"),
    ("E o DRS acabou. No seu lugar chegou a aerodinâmica ativa: asas dianteira e traseira que mudam de ângulo durante a volta.", "@aero"),
    ("Para ultrapassar, os pilotos ganharam o modo de ultrapassagem, com energia extra, e um botão de impulso para usar a bateria quando quiserem.", "@overtake"),
    ("Resultado: gerir a energia tornou-se tão importante como travar tarde. E as corridas mudaram de natureza.", "GERIR ENERGIA"),
]},
{"type": "grid", "lines": [
    ("A grelha também mudou. A Sauber transformou-se na Audi, com Hulkenberg e Bortoleto.", "AUDI"),
    ("A Cadillac entrou como décima primeira equipa, com dois veteranos: Sergio Pérez e Valtteri Bottas.", "CADILLAC"),
    ("Isack Hadjar subiu à Red Bull para fazer equipa com Verstappen, e Arvid Lindblad foi o único estreante, na Racing Bulls.", "HADJAR|LINDBLAD"),
    ("Vinte e dois carros. Onze equipas. E Lando Norris a defender o título de campeão do mundo.", "22 CARROS|11 EQUIPAS"),
]},
{"type": "controversy", "title": "A POLÉMICA DO MOTOR", "lines": [
    ("Antes de a época começar, rebentou a primeira polémica.", "!POLÉMICA"),
    ("Ferrari, Audi e Honda suspeitavam que a Mercedes tinha encontrado uma forma de, com o motor quente, ultrapassar a taxa de compressão máxima de dezasseis para um, que só era medida a frio.", "FACTO|SUSPEITA DOS RIVAIS"),
    ("A Mercedes garantiu sempre que o motor era legal e que tinha consultado a FIA durante todo o desenvolvimento.", "MERCEDES:|“É LEGAL”"),
    ("A FIA acabou por mudar a regra: a partir de um de junho, a compressão passou a ser medida também a quente.", "FACTO|NOVA MEDIÇÃO A 1 DE JUNHO"),
    ("Os rivais estimavam o ganho em cerca de treze cavalos. A Mercedes contestou esses números, e Toto Wolff chegou a chamar-lhe uma tempestade num copo de água.", "OPINIÃO|“TEMPESTADE NUM COPO DE ÁGUA”"),
]},

# ------------------------------------------------------------------ CORRIDAS
{"type": "chapter", "num": "II", "title": "O DOMÍNIO PRATEADO", "lines": [
    ("Melbourne. Oito de março. Começa a nova era.", ""),
]},
{"type": "race", "rnd": 1, "gp": "AUSTRÁLIA", "circuit": "ALBERT PARK", "date": "8 MARÇO",
 "flag": [(0, 40, 104), (255, 255, 255), (200, 16, 46)],
 "podium": ["Russell", "Antonelli", "Leclerc"], "lines": [
    ("O drama começou antes da partida. Oscar Piastri, na corrida de casa, despistou-se a caminho da grelha e nem chegou a alinhar.", "!PIASTRI FORA"),
    ("Nico Hulkenberg também foi retirado mesmo antes da corrida. Só vinte carros partiram.", "SÓ 20 CARROS"),
    ("A Ferrari arrancou muito bem e Charles Leclerc andou na luta pela frente.", "FERRARI NA FRENTE"),
    ("Mas o momento decisivo veio com o safety car virtual. A Mercedes parou os dois carros em sequência; a Ferrari não aproveitou da mesma forma e perdeu o controlo da corrida.", "!O ERRO DA FERRARI"),
    ("George Russell venceu, com Kimi Antonelli a menos de três segundos. Uma dobradinha da Mercedes logo na primeira corrida, com Leclerc em terceiro.", "DOBRADINHA|MERCEDES"),
    ("Hamilton foi quarto, Norris quinto. E o estreante Lindblad marcou pontos logo à primeira, em oitavo.", "LINDBLAD P8"),
]},
{"type": "race", "rnd": 2, "gp": "CHINA", "circuit": "XANGAI", "date": "15 MARÇO",
 "flag": [(222, 41, 16), (255, 222, 0), (222, 41, 16)],
 "podium": ["Antonelli", "Russell", "Hamilton"], "lines": [
    ("Em Xangai, a primeira bomba: as duas McLaren não alinharam. Problemas elétricos diferentes, ambos ligados à unidade motriz Mercedes.", "!McLAREN|NÃO ALINHA"),
    ("Com outros dois carros de fora, apenas dezoito partiram.", ""),
    ("Russell já tinha vencido a corrida sprint de sábado. Mas domingo foi de Antonelli.", "SPRINT: RUSSELL"),
    ("Partiu da pole, perdeu a liderança para Hamilton na partida, recuperou-a e controlou até ao fim.", "ANTONELLI"),
    ("Primeira vitória da carreira, aos dezanove anos. Só Verstappen tinha vencido mais novo.", "!PRIMEIRA VITÓRIA"),
    ("E Hamilton subiu, finalmente, ao pódio com a Ferrari.", "1.º PÓDIO|HAMILTON FERRARI"),
]},
{"type": "news", "title": "CANCELADOS", "lines": [
    ("Dias depois, a notícia: por causa do conflito no Médio Oriente, os Grandes Prémios do Bahrein e da Arábia Saudita foram cancelados, sem substitutos.", "!BAHREIN|ARÁBIA SAUDITA"),
    ("O calendário encolheu para vinte e duas corridas, com cinco semanas de pausa entre o Japão e Miami.", "22 CORRIDAS"),
]},
{"type": "race", "rnd": 3, "gp": "JAPÃO", "circuit": "SUZUKA", "date": "29 MARÇO",
 "flag": [(255, 255, 255), (188, 0, 45), (255, 255, 255)],
 "podium": ["Antonelli", "Piastri", "Leclerc"], "lines": [
    ("Em Suzuka, Antonelli voltou a fazer a pole, mas arrancou mal e caiu para sexto.", "DE P1 A P6"),
    ("A corrida virou com um acidente de Oliver Bearman na curva Spoon. O safety car baralhou tudo, e Antonelli voltou à frente.", "!SAFETY CAR"),
    ("Venceu com treze segundos de vantagem sobre Piastri, que finalmente terminou uma corrida e foi segundo. Leclerc fechou o pódio.", "PIASTRI P2"),
    ("Antonelli tornou-se o mais jovem de sempre a vencer duas corridas e o mais jovem líder do campeonato.", "!LÍDER|AOS 19 ANOS"),
]},
{"type": "race", "rnd": 4, "gp": "MIAMI", "circuit": "MIAMI INTERNATIONAL AUTODROME", "date": "3 MAIO",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Norris", "Piastri"], "lines": [
    ("Depois de cinco semanas, Miami. No sábado, Norris venceu a sprint: a primeira vitória da McLaren em 2026.", "SPRINT: NORRIS"),
    ("Hadjar foi desclassificado da qualificação: o fundo do Red Bull excedia em dois milímetros o permitido.", "!HADJAR|DESCLASSIFICADO"),
    ("A ameaça de tempestade antecipou a partida em três horas, mas a chuva quase não apareceu.", "+3 HORAS"),
    ("Leclerc liderou no início, mas fez um pião. Perdeu o quarto lugar para Russell e, na linha de meta, o quinto para Verstappen. Os dois acabaram penalizados.", "PIÃO DE LECLERC"),
    ("À frente, Antonelli resistiu a Norris por pouco mais de três segundos. Terceira vitória seguida e vinte pontos de vantagem sobre Russell.", "3 SEGUIDAS"),
]},
{"type": "race", "rnd": 5, "gp": "CANADÁ", "circuit": "GILLES VILLENEUVE", "date": "24 MAIO",
 "flag": [(216, 6, 33), (255, 255, 255), (216, 6, 33)],
 "podium": ["Antonelli", "Hamilton", "Verstappen"], "lines": [
    ("Em Montreal, a guerra interna da Mercedes explodiu.", "!MERCEDES|CONTRA MERCEDES"),
    ("Na sprint, Russell e Antonelli tocaram-se. Antonelli foi para a relva e exigiu, pela rádio, um castigo para o colega.", "TOQUE NA SPRINT"),
    ("Toto Wolff respondeu-lhe para se concentrar na condução e não em queixas pela rádio.", "“CONCENTRA-TE|NA CONDUÇÃO”"),
    ("No domingo, voltaram a lutar roda com roda, até que Russell abandonou na liderança, com um problema na unidade motriz.", "!RUSSELL ABANDONA"),
    ("Norris também desistiu, depois de uma aposta nos pneus que correu mal.", "NORRIS FORA"),
    ("Antonelli venceu a quarta seguida. Hamilton foi segundo, o melhor resultado até então pela Ferrari, e Verstappen conquistou o primeiro pódio do ano.", "HAMILTON P2|VERSTAPPEN P3"),
    ("A vantagem subiu para quarenta e três pontos. E a Mercedes criou novas regras internas sobre como os dois podiam lutar.", "+43"),
]},
{"type": "race", "rnd": 6, "gp": "MÓNACO", "circuit": "MONTE CARLO", "date": "7 JUNHO",
 "flag": [(206, 17, 38), (255, 255, 255), (206, 17, 38)],
 "podium": ["Antonelli", "Hamilton", "Hadjar"], "lines": [
    ("No Mónaco, a primeira corrida com a nova medição da compressão dos motores, Verstappen ficou de fora logo na primeira volta.", "!VERSTAPPEN|1.ª VOLTA"),
    ("Lance Stroll bateu na última curva e trouxe o safety car. No recomeço, Leclerc bateu no mesmo sítio, em casa, e queixou-se dos travões.", "LECLERC|EM CASA"),
    ("A seguir, o asfalto começou a desfazer-se nessa curva e a corrida foi interrompida com bandeira vermelha a dez voltas do fim.", "!BANDEIRA VERMELHA"),
    ("Antonelli liderou todas as voltas e resistiu ao recomeço. Hamilton segundo, Hadjar terceiro.", ""),
    ("Quinta vitória seguida. O vencedor mais novo de sempre no Mónaco, e o primeiro triunfo da Mercedes no Principado desde 2019.", "5 SEGUIDAS"),
]},
{"type": "race", "rnd": 7, "gp": "BARCELONA", "circuit": "CATALUNHA", "date": "14 JUNHO",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Hamilton", "Russell", "Norris"], "lines": [
    ("Barcelona. E, finalmente, aconteceu.", ""),
    ("A Ferrari apostou em três paragens e acertou no momento do safety car virtual.", "3 PARAGENS"),
    ("Antonelli desistiu já perto do fim, quando lutava pelo segundo lugar. Acabava a série invicta da Mercedes.", "!ANTONELLI|ABANDONA"),
    ("E Lewis Hamilton venceu. A primeira vitória com a Ferrari, a primeira desde a Bélgica de 2024, e a centésima sexta da carreira.", "!HAMILTON|VENCE PELA FERRARI"),
    ("Russell foi segundo, Norris terceiro, Verstappen quarto. E a Alpine pôs os dois carros nos pontos.", "VITÓRIA 106"),
]},
{"type": "race", "rnd": 8, "gp": "ÁUSTRIA", "circuit": "RED BULL RING", "date": "28 JUNHO",
 "flag": [(237, 41, 57), (255, 255, 255), (237, 41, 57)],
 "podium": ["Russell", "Verstappen", "Antonelli"], "lines": [
    ("Na Áustria, Russell respondeu. Pole position e vitória, com Verstappen a pouco mais de um segundo e meio.", "RUSSELL"),
    ("Mas a história do dia foi outra: Verstappen contra Hamilton, outra vez.", "!VERSTAPPEN|vs HAMILTON"),
    ("Durante a luta, Verstappen disse pela rádio que era uma penalização clara. Os comissários analisaram e não tomaram qualquer medida.", "FACTO|SEM PENALIZAÇÃO"),
    ("Para Hamilton, era Verstappen quem devia ter recuado. Opiniões opostas, sem castigo.", "OPINIÃO|“ELE É QUE DEVIA RECUAR”"),
    ("Hamilton foi quinto, Leclerc só oitavo. Em casa da Red Bull, a Ferrari teve um dia para esquecer.", "FERRARI EM BAIXO"),
]},
{"type": "race", "rnd": 9, "gp": "GRÃ-BRETANHA", "circuit": "SILVERSTONE", "date": "5 JULHO",
 "flag": [(1, 33, 105), (255, 255, 255), (200, 16, 46)],
 "podium": ["Leclerc", "Russell", "Hamilton"], "lines": [
    ("Em Silverstone, Antonelli venceu a sprint. Mas o domingo foi da Ferrari.", "SPRINT: ANTONELLI"),
    ("Charles Leclerc ganhou a primeira corrida desde 2024. Foi a ducentésima quinquagésima vitória da história da Ferrari.", "!LECLERC|VITÓRIA 250 DA FERRARI"),
    ("Mas o final ficou manchado. Depois de um acidente tardio de Verstappen, apareceu a mensagem de que o safety car ia sair nessa volta.", "“SAFETY CAR|NESTA VOLTA”"),
    ("A FIA anulou-a oito segundos depois e explicou que tinha sido um erro de software. A corrida acabou atrás do safety car, com assobios nas bancadas.", "!ERRO DE SOFTWARE"),
    ("Russell ficou a menos de meio segundo. E Antonelli, com problemas de fiabilidade, terminou em décimo sexto. A vantagem caiu para vinte e cinco pontos.", "+25"),
]},
{"type": "race", "rnd": 10, "gp": "BÉLGICA", "circuit": "SPA-FRANCORCHAMPS", "date": "19 JULHO",
 "flag": [(0, 0, 0), (253, 218, 36), (239, 51, 64)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("Spa. Primeira volta. Russell tenta por fora, toca em Hamilton e acaba na gravilha. Fim de corrida.", "!RUSSELL FORA"),
    ("Os comissários consideraram Hamilton totalmente responsável, mas reduziram a penalização para cinco segundos, por ser a primeira volta.", "FACTO|5 SEGUNDOS"),
    ("Hamilton e o chefe da Ferrari, Fred Vasseur, discordaram da decisão. Hamilton disse que se considerou azarado.", "OPINIÃO|“AZARADO”"),
    ("Houve ainda uma saída insegura nas boxes, em que um mecânico foi derrubado. A Ferrari levou uma multa.", "MULTA"),
    ("Antonelli recuperou a liderança depois de um recomeço e bateu Leclerc por menos de dois segundos. Sexta vitória do ano.", "6 VITÓRIAS"),
]},
{"type": "race", "rnd": 11, "gp": "HUNGRIA", "circuit": "HUNGARORING", "date": "26 JULHO",
 "flag": [(206, 41, 57), (255, 255, 255), (71, 112, 80)],
 "podium": ["Norris", "Verstappen", "Antonelli"], "lines": [
    ("Antes das férias, a McLaren acordou.", ""),
    ("Norris partiu da pole. Piastri chocou com o Williams de Carlos Sainz na curva dois, o que abriu caminho a Norris na estratégia de paragens.", "PIASTRI|vs SAINZ"),
    ("Piastri acabaria por desistir com uma avaria na caixa de velocidades.", "PIASTRI ABANDONA"),
    ("Norris venceu pela primeira vez em 2026, quinze segundos à frente de Verstappen.", "!NORRIS|FINALMENTE"),
    ("Antonelli foi terceiro e reforçou a liderança. Hamilton perdeu um lugar com uma penalização de cinco segundos.", ""),
]},
{"type": "midseason", "lines": [
    ("Nas férias de verão, o retrato era claro: a Mercedes dominava, a Ferrari ganhava às vezes, a McLaren e a Red Bull tentavam encontrar-se.", "META DA ÉPOCA"),
    ("Lá atrás, a Aston Martin, com motor Honda, chegou à pausa com um único ponto, conquistado por Alonso no Mónaco.", "ASTON MARTIN|1 PONTO"),
    ("E a Cadillac ainda não tinha pontuado, com nove desistências em onze corridas.", "CADILLAC|0 PONTOS"),
]},
{"type": "race", "rnd": 12, "gp": "PAÍSES BAIXOS", "circuit": "ZANDVOORT", "date": "23 AGOSTO",
 "flag": [(174, 28, 40), (255, 255, 255), (33, 70, 139)],
 "podium": ["Norris", "Antonelli", "Russell"], "lines": [
    ("Zandvoort recebeu o último Grande Prémio dos Países Baixos. Russell venceu a sprint.", "A ÚLTIMA VEZ"),
    ("No domingo, a última curva inclinada estava molhada. Verstappen, em casa, perdeu o carro no fim da primeira volta e bateu com violência.", "!VERSTAPPEN|ACIDENTE"),
    ("Saiu pelo próprio pé e admitiu que foi demasiado agressivo no acelerador. Bandeira vermelha.", "BANDEIRA VERMELHA"),
    ("No recomeço, Norris passou Antonelli e Hamilton na mesma volta e venceu com onze segundos e meio de vantagem.", "NORRIS|2 SEGUIDAS"),
    ("Antonelli segundo, Russell terceiro. A liderança subiu para cinquenta e nove pontos.", "+59"),
]},
{"type": "race", "rnd": 13, "gp": "ITÁLIA", "circuit": "MONZA", "date": "6 SETEMBRO",
 "flag": [(0, 146, 70), (255, 255, 255), (206, 43, 55)],
 "podium": ["Antonelli", "Russell", "Verstappen"], "lines": [
    ("Monza. O italiano de dezanove anos partia em décimo nono, depois de uma penalização por troca de componentes do motor.", "!P19"),
    ("Leclerc, a grande esperança da Ferrari, bateu na Parabolica logo na primeira volta.", "LECLERC FORA"),
    ("E Antonelli subiu, carro a carro, até passar Russell na travagem para a Ascari e ficar com a liderança.", "DE P19 A P1"),
    ("Venceu com quase quatro segundos de vantagem. O primeiro italiano a vencer em Monza desde Ludovico Scarfiotti, em 1966.", "!PRIMEIRO DESDE|1966"),
    ("E a segunda vitória a partir mais de trás na história da Fórmula 1, só atrás de John Watson em Long Beach, em 1983.", "2.ª MAIOR|RECUPERAÇÃO"),
]},
{"type": "race", "rnd": 14, "gp": "ESPANHA", "circuit": "MADRING · MADRID", "date": "13 SETEMBRO",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Antonelli", "Verstappen", "Norris"], "lines": [
    ("Madrid voltou a receber a Fórmula 1 pela primeira vez em quarenta e cinco anos, num circuito novo.", "MADRID|45 ANOS DEPOIS"),
    ("Norris partiu da pole e liderava. Mas o safety car virtual chegou dois segundos tarde demais para ele, e Antonelli parou no momento certo.", "!2 SEGUNDOS"),
    ("Antonelli venceu, Verstappen foi segundo, Norris terceiro. Hamilton desistiu na sétima volta, com uma falha nos travões.", "HAMILTON|TRAVÕES"),
    ("Muitos críticos chamaram-lhe uma corrida esquecível. Mas para o campeonato não foi: a vantagem chegou aos oitenta e um pontos.", "+81"),
]},
{"type": "race", "rnd": 15, "gp": "AZERBAIJÃO", "circuit": "BAKU", "date": "26 SETEMBRO",
 "flag": [(0, 181, 226), (239, 51, 64), (80, 158, 47)],
 "podium": ["Russell", "Verstappen", "Hadjar"], "lines": [
    ("Em Baku, Russell partiu da pole e liderou do princípio ao fim.", "LUZES À BANDEIRA"),
    ("Dois períodos de safety car deram a Verstappen a oportunidade de atacar até à última curva.", "!VERSTAPPEN ATACA"),
    ("Russell ganhou por cento e noventa e seis milésimas. Hadjar completou o pódio da Red Bull.", "0,196 s"),
    ("Seis pilotos desistiram, incluindo as duas McLaren, que saíram de Baku sem pontos.", "McLAREN|ZERO PONTOS"),
    ("Antonelli, depois de partir do meio do pelotão, recuperou até quinto. A vantagem desceu para sessenta e seis pontos.", "+66"),
]},
{"type": "race", "rnd": 16, "gp": "SINGAPURA", "circuit": "MARINA BAY", "date": "11 OUTUBRO",
 "flag": [(239, 51, 64), (255, 255, 255), (239, 51, 64)],
 "podium": ["Verstappen", "Leclerc", "Antonelli"], "lines": [
    ("Em Singapura, Verstappen fez o fim de semana perfeito.", "!VERSTAPPEN"),
    ("Venceu a sprint, numa corrida molhada em que Russell bateu quando liderava.", "SPRINT:|RUSSELL BATE"),
    ("No domingo, fez a pole e liderou todas as voltas. A primeira vitória de sempre em Singapura.", "1.ª VEZ|EM SINGAPURA"),
    ("Hamilton ficou em pista com pneus usados durante um safety car virtual, caiu de terceiro para sexto e pediu desculpa à equipa.", "!“DESCULPEM”"),
    ("Leclerc foi segundo, Antonelli terceiro. O título estava cada vez mais perto.", ""),
]},
{"type": "race", "rnd": 17, "gp": "ESTADOS UNIDOS", "circuit": "AUSTIN", "date": "25 OUTUBRO",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("Em Austin, Antonelli fez aquela que Toto Wolff chamou a melhor corrida da sua carreira.", "“A MELHOR”"),
    ("Uma só paragem, no fim da volta vinte e quatro, e um domínio total. Leclerc a treze segundos, Verstappen terceiro.", "1 PARAGEM"),
    ("Hamilton foi quarto, Norris quinto. O título ficava a um passo.", "A UM PASSO"),
]},
{"type": "race", "rnd": 18, "gp": "MÉXICO", "circuit": "HERMANOS RODRÍGUEZ", "date": "1 NOVEMBRO",
 "flag": [(0, 104, 71), (255, 255, 255), (206, 17, 38)],
 "podium": ["Verstappen", "Hamilton", "Antonelli"], "lines": [
    ("Cidade do México. Antonelli chegava com cento e vinte e três pontos de vantagem sobre Russell. Bastava-lhe o nono lugar.", "BASTA P9"),
    ("A corrida foi um caos. Valtteri Bottas teve um acidente forte na primeira curva e a corrida foi interrompida com bandeira vermelha.", "!BANDEIRA VERMELHA"),
    ("Seguiu-se uma partida parada, mais safety cars, e uma colisão entre Piastri e Lindblad, que valeu a Piastri dez segundos de penalização.", "PIASTRI|PENALIZADO"),
    ("As duas Alpine também foram castigadas por desrespeitarem bandeiras amarelas.", "BANDEIRAS|AMARELAS"),
    ("Verstappen ganhou por oito décimas a Hamilton. E Antonelli, terceiro, cruzou a meta como campeão do mundo.", "!CAMPEÃO|DO MUNDO"),
]},
{"type": "champion", "lines": [
    ("Kimi Antonelli. Vinte anos e sessenta e oito dias.", "KIMI ANTONELLI"),
    ("O campeão mais novo de sempre, mais novo do que Sebastian Vettel em 2010.", "!O MAIS NOVO|DE SEMPRE"),
    ("O primeiro italiano campeão desde Alberto Ascari, em 1953.", "1.º ITALIANO|DESDE 1953"),
    ("E o primeiro título de pilotos da Mercedes desde Hamilton, em 2020. Conquistado na segunda época na Fórmula 1, com quatro corridas por disputar.", "MERCEDES|DESDE 2020"),
]},

# ------------------------------------------------------------------ BRASIL
{"type": "chapter", "num": "III", "title": "INTERLAGOS", "lines": [
    ("O campeão estava decidido. Mas o Brasil ainda tinha uma história para contar.", ""),
]},
{"type": "race", "rnd": 19, "gp": "BRASIL", "circuit": "INTERLAGOS", "date": "8 NOVEMBRO",
 "flag": [(0, 156, 59), (255, 223, 0), (0, 39, 118)],
 "podium": ["Norris", "Verstappen", "Hadjar"], "long": True, "lines": [
    ("Sábado. A chuva atrasou a qualificação durante quase hora e meia.", "!CHUVA"),
    ("Quando finalmente se correu, Norris foi o rei do molhado: pole position, a terceira seguida em Interlagos, com Russell a dois décimos e Antonelli em terceiro.", "POLE|NORRIS"),
    ("Hamilton e Verstappen caíram na Q2, e ainda tinham penalizações por trocas de motor. As duas Ferrari foram castigadas com dez lugares por usarem o quinto motor de combustão.", "PENALIZAÇÕES"),
    ("Hamilton partiu de vigésimo. Verstappen, de vigésimo primeiro.", "!P20 · P21"),
    ("Domingo. Setenta e uma voltas. A pista começou húmida, foi secando, e no fim voltou a chover.", "71 VOLTAS"),
    ("Norris geriu tudo da frente, sem erros, num dia sem safety car e sem acidentes.", "SEM ERROS"),
    ("E lá de trás veio Verstappen. Carro a carro, ultrapassagem a ultrapassagem, de vigésimo primeiro até ao segundo lugar.", "!DE P21 A P2"),
    ("Hadjar completou o pódio para a Red Bull, a vinte e quatro segundos. Russell foi quarto e Antonelli quinto: segundo os relatos, deixou passar o colega de equipa.", "HADJAR P3"),
    ("Hamilton, na sua corrida número quatrocentos, recuperou de vigésimo para nono, apesar de um pião, mas terminou com uma volta de atraso.", "HAMILTON|400 CORRIDAS"),
    ("Norris venceu com catorze segundos e meio de vantagem, a terceira vitória do ano.", "!NORRIS VENCE"),
    ("E com os pontos de Russell e Antonelli, a Mercedes garantiu o título de construtores. O nono da sua história.", "MERCEDES|CAMPEÃ"),
    ("Verstappen aumentou a vantagem no segundo lugar do campeonato de dois para dezassete pontos.", "+17"),
]},

# ------------------------------------------------------------------ EQUIPAS
{"type": "chapter", "num": "IV", "title": "QUEM GANHOU E QUEM PERDEU", "lines": [
    ("Dezanove corridas depois, o que ficou de cada equipa?", ""),
]},
{"type": "teams", "lines": [
    ("Mercedes: a melhor leitura das novas regras. Doze vitórias em dezanove Grandes Prémios e os dois títulos garantidos, apesar das falhas de fiabilidade e da tensão entre os pilotos.", "@MER"),
    ("Ferrari: segunda entre as equipas, com as vitórias de Hamilton em Barcelona e de Leclerc em Silverstone. Mas os erros de estratégia, da Austrália a Singapura, custaram caro.", "@FER"),
    ("Red Bull: sem dominar, Verstappen venceu em Singapura e no México e foi a voz mais constante do ano. Hadjar subiu três vezes ao pódio.", "@RBR"),
    ("McLaren: a campeã do mundo começou com duas corridas sem Piastri e uma dupla ausência na China. Norris venceu três vezes, mas a equipa ainda luta pelo terceiro lugar.", "@MCL"),
    ("Racing Bulls é a melhor do resto, com mais de cem pontos. Lindblad pontuou na estreia.", "@RB"),
    ("A Alpine, agora com motor Mercedes, é sexta, com Gasly e Colapinto a pontuar com regularidade.", "@ALP"),
    ("A Haas e a Audi lutam pelo sétimo lugar. A Williams tem um ano difícil.", "@HAA"),
    ("A Aston Martin, com a Honda, viveu um ano muito difícil, com apenas sete pontos. E a Cadillac, estreante, ainda procura o primeiro ponto.", "@AST"),
]},

# ------------------------------------------------------------------ CLASSIFICAÇÃO
{"type": "chapter", "num": "V", "title": "ONDE ESTAMOS", "lines": [
    ("Onze de novembro de 2026. Faltam três corridas: Las Vegas, Catar e Abu Dhabi.", ""),
]},
{"type": "standings", "kind": "drivers", "lines": [
    ("Antonelli é campeão com trezentos e noventa pontos.", "@show"),
    ("Mas a luta pelo vice-campeonato está em aberto. Verstappen tem duzentos e setenta e nove. Russell duzentos e sessenta e dois. Hamilton, apenas um ponto atrás.", "@vice"),
    ("Leclerc soma duzentos e quarenta e nove e Norris duzentos e quarenta e seis.", ""),
    ("Com setenta e cinco pontos ainda em jogo, estes cinco pilotos, separados por trinta e três pontos, ainda podem acabar em segundo.", "!75 PONTOS|EM JOGO"),
]},
{"type": "standings", "kind": "teams", "lines": [
    ("Nos construtores, a Mercedes já é campeã, com seiscentos e cinquenta e dois pontos. A Ferrari segue em segundo, com mais de quinhentos.", "@show"),
    ("A grande batalha é pelo terceiro lugar: Red Bull com quatrocentos e quinze, McLaren a dezassete pontos.", "@fight"),
    ("E lá atrás, Aston Martin e Cadillac lutam para não ficar em último.", ""),
]},
{"type": "outro", "lines": [
    ("Uma época de novas regras, novos rostos e velhas rivalidades.", "NOVAS REGRAS"),
    ("Um campeão de vinte anos. Um sete vezes campeão que voltou a vencer. Um Verstappen que nunca deixou de lutar.", "UM CAMPEÃO|DE 20 ANOS"),
    ("O título já tem dono. Mas ainda há três corridas para escrever o último capítulo.", "!3 CORRIDAS"),
    ("Isto foi a Fórmula 1 em 2026. Até ao Brasil.", "F1 2026"),
]},
]

# Classificações em 11/11/2026 (após GP do Brasil, ronda 19 de 22).
# Fonte: tabelas pós-Brasil (GPFans, Crash.net, Wikipedia). Leclerc 249 (algumas fontes: 251).
DRIVERS = [("Antonelli", 390), ("Verstappen", 279), ("Russell", 262), ("Hamilton", 261),
           ("Leclerc", 249), ("Norris", 246), ("Piastri", 152)]
TEAMS = [("MERCEDES", "MER", 652), ("FERRARI", "FER", 512), ("RED BULL", "RBR", 415),
         ("McLAREN", "MCL", 398), ("RACING BULLS", "RB", 112), ("ALPINE", "ALP", 69),
         ("HAAS", "HAA", 31), ("AUDI", "AUD", 28), ("WILLIAMS", "WIL", 12),
         ("ASTON MARTIN", "AST", 7), ("CADILLAC", "CAD", 0)]

# Vencedores (para o gráfico da época)
WINNERS = ["Russell", "Antonelli", "Antonelli", "Antonelli", "Antonelli", "Antonelli",
           "Hamilton", "Russell", "Leclerc", "Antonelli", "Norris", "Norris", "Antonelli",
           "Antonelli", "Russell", "Verstappen", "Antonelli", "Verstappen", "Norris"]

# Vantagem de Antonelli confirmada em reportagens (ronda -> pontos)
LEAD = {4: 20, 5: 43, 9: 25, 12: 59, 14: 81, 15: 66, 17: None, 18: 123}
