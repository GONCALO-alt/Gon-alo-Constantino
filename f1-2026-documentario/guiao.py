# -*- coding: utf-8 -*-
"""
F1 2026 — TUDO O QUE ACONTECEU ATÉ AO BRASIL
Guião do documentário (português do Brasil).

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
    ("Nunca ninguém tinha sido campeão mundial de Fórmula 1 tão jovem.", "!NUNCA ANTES"),
    ("Mas, antes da coroa, aconteceu de tudo.", "ANTES DA COROA..."),
    ("Uma revolução técnica. Duas corridas canceladas. Uma guerra dentro da mesma garagem.", "UMA REVOLUÇÃO"),
    ("A volta de Lewis Hamilton ao lugar mais alto do pódio. Um Max Verstappen que se recusou a desaparecer.", "HAMILTON|VERSTAPPEN"),
    ("E uma McLaren campeã que, de repente, teve que recomeçar do zero.", "McLAREN"),
    ("Dezenove Grandes Prêmios. Da Austrália ao Brasil.", "19 GRANDES PRÊMIOS"),
    ("Isto é tudo o que aconteceu.", "!TUDO"),
]},
{"type": "title", "lines": [
    ("", "F1 2026|TUDO O QUE ACONTECEU ATÉ O BRASIL"),
]},

# ------------------------------------------------------------------ REGRAS
{"type": "chapter", "num": "I", "title": "A NOVA ERA", "lines": [
    ("Para entender 2026, é preciso começar antes da primeira largada.", ""),
]},
{"type": "rules", "lines": [
    ("Este foi o ano da maior mudança de regulamento da história recente da Fórmula 1.", "!NOVAS REGRAS"),
    ("Os motores passaram a dividir a potência quase meio a meio: metade vinda do motor a combustão, metade vinda da parte elétrica.", "@split"),
    ("O MGU-H desapareceu. Em compensação, o MGU-K quase triplicou, de cento e vinte para trezentos e cinquenta quilowatts.", "@kw"),
    ("Todos os carros passaram a usar combustível sustentável avançado.", "COMBUSTÍVEL|SUSTENTÁVEL"),
    ("Os carros ficaram mais curtos, mais estreitos e mais leves: o peso mínimo caiu para setecentos e sessenta e oito quilos, sem combustível.", "@kg"),
    ("E o DRS acabou. No lugar dele chegou a aerodinâmica ativa: asas dianteira e traseira que mudam de ângulo durante a volta.", "@aero"),
    ("Para ultrapassar, os pilotos ganharam o modo de ultrapassagem, com energia extra, e um botão de impulso para usar a bateria quando quiserem.", "@overtake"),
    ("Resultado: administrar a energia ficou tão importante quanto frear tarde. E as corridas mudaram de cara.", "GESTÃO DE ENERGIA"),
]},
{"type": "grid", "lines": [
    ("O grid também mudou. A Sauber virou Audi, com Hulkenberg e Bortoleto.", "AUDI"),
    ("A Cadillac estreou como a décima primeira equipe, com dois veteranos: Sergio Pérez e Valtteri Bottas.", "CADILLAC"),
    ("Isack Hadjar foi promovido à Red Bull para ser companheiro de Verstappen, e Arvid Lindblad foi o único estreante, na Racing Bulls.", "HADJAR|LINDBLAD"),
    ("Vinte e dois carros. Onze equipes. E Lando Norris defendendo o título de campeão mundial.", "22 CARROS|11 EQUIPES"),
]},
{"type": "controversy", "title": "A POLÊMICA DO MOTOR", "lines": [
    ("Antes mesmo de a temporada começar, estourou a primeira polêmica.", "!POLÊMICA"),
    ("Ferrari, Audi e Honda suspeitavam que a Mercedes tinha encontrado um jeito de, com o motor quente, passar da taxa de compressão máxima de dezesseis para um, que só era medida a frio.", "FATO|SUSPEITA DOS RIVAIS"),
    ("A Mercedes sempre garantiu que o motor era legal e que tinha consultado a FIA durante todo o desenvolvimento.", "MERCEDES:|“É LEGAL”"),
    ("A FIA acabou mudando a regra: a partir de primeiro de junho, a compressão passou a ser medida também a quente.", "FATO|NOVA MEDIÇÃO EM 1º DE JUNHO"),
    ("Os rivais estimavam o ganho em cerca de treze cavalos. A Mercedes contestou esses números, e Toto Wolff chegou a chamar tudo de tempestade em copo d'água.", "OPINIÃO|“TEMPESTADE EM COPO D'ÁGUA”"),
]},

# ------------------------------------------------------------------ CORRIDAS
{"type": "chapter", "num": "II", "title": "O DOMÍNIO PRATEADO", "lines": [
    ("Melbourne. Oito de março. Começa a nova era.", ""),
]},
{"type": "race", "rnd": 1, "gp": "AUSTRÁLIA", "circuit": "ALBERT PARK", "date": "8 DE MARÇO",
 "flag": [(0, 40, 104), (255, 255, 255), (200, 16, 46)],
 "podium": ["Russell", "Antonelli", "Leclerc"], "lines": [
    ("O drama começou antes da largada. Oscar Piastri, correndo em casa, bateu a caminho do grid e nem chegou a largar.", "!PIASTRI FORA"),
    ("Nico Hulkenberg também foi retirado pouco antes da corrida. Só vinte carros largaram.", "SÓ 20 CARROS"),
    ("A Ferrari largou muito bem e Charles Leclerc brigou lá na frente.", "FERRARI NA FRENTE"),
    ("Mas o momento decisivo veio com o safety car virtual. A Mercedes parou os dois carros em sequência; a Ferrari não aproveitou do mesmo jeito e perdeu o controle da corrida.", "!O ERRO DA FERRARI"),
    ("George Russell venceu, com Kimi Antonelli a menos de três segundos. Uma dobradinha da Mercedes logo na primeira corrida, com Leclerc em terceiro.", "DOBRADINHA|MERCEDES"),
    ("Hamilton foi quarto, Norris quinto. E o estreante Lindblad pontuou logo de cara, em oitavo.", "LINDBLAD P8"),
]},
{"type": "race", "rnd": 2, "gp": "CHINA", "circuit": "XANGAI", "date": "15 DE MARÇO",
 "flag": [(222, 41, 16), (255, 222, 0), (222, 41, 16)],
 "podium": ["Antonelli", "Russell", "Hamilton"], "lines": [
    ("Em Xangai, a primeira bomba: as duas McLaren não largaram. Problemas elétricos diferentes, os dois ligados à unidade de potência Mercedes.", "!McLAREN|NÃO LARGA"),
    ("Com outros dois carros fora, apenas dezoito largaram.", ""),
    ("Russell já tinha vencido a corrida sprint de sábado. Mas o domingo foi de Antonelli.", "SPRINT: RUSSELL"),
    ("Ele largou na pole, perdeu a liderança para Hamilton na largada, recuperou a ponta e controlou até o fim.", "ANTONELLI"),
    ("Primeira vitória da carreira, aos dezenove anos. Só Verstappen tinha vencido mais jovem.", "!PRIMEIRA VITÓRIA"),
    ("E Hamilton, finalmente, subiu ao pódio com a Ferrari.", "1º PÓDIO|HAMILTON FERRARI"),
]},
{"type": "news", "title": "CANCELADOS", "lines": [
    ("Dias depois, a notícia: por causa do conflito no Oriente Médio, os Grandes Prêmios do Bahrein e da Arábia Saudita foram cancelados, sem substitutos.", "!BAHREIN|ARÁBIA SAUDITA"),
    ("O calendário encolheu para vinte e duas corridas, com cinco semanas de pausa entre o Japão e Miami.", "22 CORRIDAS"),
]},
{"type": "race", "rnd": 3, "gp": "JAPÃO", "circuit": "SUZUKA", "date": "29 DE MARÇO",
 "flag": [(255, 255, 255), (188, 0, 45), (255, 255, 255)],
 "podium": ["Antonelli", "Piastri", "Leclerc"], "lines": [
    ("Em Suzuka, Antonelli fez a pole de novo, mas largou mal e caiu para sexto.", "DE P1 A P6"),
    ("A corrida virou com uma batida de Oliver Bearman na curva Spoon. O safety car embaralhou tudo, e Antonelli voltou para a frente.", "!SAFETY CAR"),
    ("Venceu com treze segundos de vantagem sobre Piastri, que finalmente completou uma corrida e foi segundo. Leclerc fechou o pódio.", "PIASTRI P2"),
    ("Antonelli se tornou o mais jovem da história a vencer duas corridas e o líder de campeonato mais jovem de todos os tempos.", "!LÍDER|AOS 19 ANOS"),
]},
{"type": "race", "rnd": 4, "gp": "MIAMI", "circuit": "MIAMI INTERNATIONAL AUTODROME", "date": "3 DE MAIO",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Norris", "Piastri"], "lines": [
    ("Depois de cinco semanas, Miami. No sábado, Norris venceu a sprint: a primeira vitória da McLaren em 2026.", "SPRINT: NORRIS"),
    ("Hadjar foi desclassificado do treino classificatório: o assoalho da Red Bull passava dois milímetros do permitido.", "!HADJAR|DESCLASSIFICADO"),
    ("A ameaça de tempestade adiantou a largada em três horas, mas a chuva quase não apareceu.", "3 HORAS ANTES"),
    ("Leclerc liderou no começo, mas rodou. Perdeu o quarto lugar para Russell e, na linha de chegada, o quinto para Verstappen. Os dois acabaram punidos.", "LECLERC RODA"),
    ("Na frente, Antonelli segurou Norris por pouco mais de três segundos. Terceira vitória seguida e vinte pontos de vantagem sobre Russell.", "3 SEGUIDAS"),
]},
{"type": "race", "rnd": 5, "gp": "CANADÁ", "circuit": "GILLES VILLENEUVE", "date": "24 DE MAIO",
 "flag": [(216, 6, 33), (255, 255, 255), (216, 6, 33)],
 "podium": ["Antonelli", "Hamilton", "Verstappen"], "lines": [
    ("Em Montreal, a guerra interna da Mercedes explodiu.", "!MERCEDES|CONTRA MERCEDES"),
    ("Na sprint, Russell e Antonelli se tocaram. Antonelli foi parar na grama e exigiu, pelo rádio, uma punição para o companheiro.", "TOQUE NA SPRINT"),
    ("Toto Wolff respondeu mandando ele se concentrar na pilotagem, e não em reclamações pelo rádio.", "“CONCENTRE-SE|NA PILOTAGEM”"),
    ("No domingo, os dois voltaram a brigar roda a roda, até que Russell abandonou na liderança, com um problema na unidade de potência.", "!RUSSELL ABANDONA"),
    ("Norris também abandonou, depois de uma aposta de pneus que deu errado.", "NORRIS FORA"),
    ("Antonelli venceu a quarta seguida. Hamilton foi segundo, seu melhor resultado pela Ferrari até então, e Verstappen conquistou o primeiro pódio do ano.", "HAMILTON P2|VERSTAPPEN P3"),
    ("A vantagem subiu para quarenta e três pontos. E a Mercedes criou novas regras internas sobre como os dois podiam disputar posição.", "+43"),
]},
{"type": "race", "rnd": 6, "gp": "MÔNACO", "circuit": "MONTE CARLO", "date": "7 DE JUNHO",
 "flag": [(206, 17, 38), (255, 255, 255), (206, 17, 38)],
 "podium": ["Antonelli", "Hamilton", "Hadjar"], "lines": [
    ("Em Mônaco, a primeira corrida com a nova medição da compressão dos motores, Verstappen ficou de fora logo na primeira volta.", "!VERSTAPPEN|1ª VOLTA"),
    ("Lance Stroll bateu na última curva e trouxe o safety car. Na relargada, Leclerc bateu no mesmo lugar, correndo em casa, e reclamou dos freios.", "LECLERC|EM CASA"),
    ("Em seguida, o asfalto começou a se desmanchar naquela curva, e a corrida foi interrompida com bandeira vermelha a dez voltas do fim.", "!BANDEIRA VERMELHA"),
    ("Antonelli liderou todas as voltas e segurou a relargada. Hamilton em segundo, Hadjar em terceiro.", ""),
    ("Quinta vitória seguida. O vencedor mais jovem da história em Mônaco, e o primeiro triunfo da Mercedes no Principado desde 2019.", "5 SEGUIDAS"),
]},
{"type": "race", "rnd": 7, "gp": "BARCELONA", "circuit": "CATALUNHA", "date": "14 DE JUNHO",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Hamilton", "Russell", "Norris"], "lines": [
    ("Barcelona. E, finalmente, aconteceu.", ""),
    ("A Ferrari apostou em três paradas e acertou o momento do safety car virtual.", "3 PARADAS"),
    ("Antonelli abandonou já perto do fim, quando brigava pelo segundo lugar. Acabava a invencibilidade da Mercedes.", "!ANTONELLI|ABANDONA"),
    ("E Lewis Hamilton venceu. A primeira vitória com a Ferrari, a primeira desde a Bélgica de 2024, e a centésima sexta da carreira.", "!HAMILTON|VENCE PELA FERRARI"),
    ("Russell foi segundo, Norris terceiro, Verstappen quarto. E a Alpine colocou os dois carros nos pontos.", "VITÓRIA 106"),
]},
{"type": "race", "rnd": 8, "gp": "ÁUSTRIA", "circuit": "RED BULL RING", "date": "28 DE JUNHO",
 "flag": [(237, 41, 57), (255, 255, 255), (237, 41, 57)],
 "podium": ["Russell", "Verstappen", "Antonelli"], "lines": [
    ("Na Áustria, Russell deu a resposta. Pole position e vitória, com Verstappen a pouco mais de um segundo e meio.", "RUSSELL"),
    ("Mas a história do dia foi outra: Verstappen contra Hamilton, mais uma vez.", "!VERSTAPPEN|x HAMILTON"),
    ("Durante a briga, Verstappen disse pelo rádio que era uma punição clara. Os comissários analisaram e não tomaram nenhuma medida.", "FATO|SEM PUNIÇÃO"),
    ("Para Hamilton, quem devia ter tirado o pé era Verstappen. Opiniões opostas, nenhuma punição.", "OPINIÃO|“ELE É QUE DEVIA RECUAR”"),
    ("Hamilton foi quinto, Leclerc só oitavo. Na casa da Red Bull, a Ferrari teve um dia para esquecer.", "FERRARI EM BAIXA"),
]},
{"type": "race", "rnd": 9, "gp": "GRÃ-BRETANHA", "circuit": "SILVERSTONE", "date": "5 DE JULHO",
 "flag": [(1, 33, 105), (255, 255, 255), (200, 16, 46)],
 "podium": ["Leclerc", "Russell", "Hamilton"], "lines": [
    ("Em Silverstone, Antonelli venceu a sprint. Mas o domingo foi da Ferrari.", "SPRINT: ANTONELLI"),
    ("Charles Leclerc venceu pela primeira vez desde 2024. Foi a vitória de número duzentos e cinquenta da história da Ferrari.", "!LECLERC|VITÓRIA 250 DA FERRARI"),
    ("Mas o final ficou manchado. Depois de uma batida de Verstappen no fim da prova, apareceu a mensagem de que o safety car ia entrar naquela volta.", "“SAFETY CAR|NESTA VOLTA”"),
    ("A FIA anulou a mensagem oito segundos depois e explicou que tinha sido um erro de software. A corrida terminou atrás do safety car, com vaias nas arquibancadas.", "!ERRO DE SOFTWARE"),
    ("Russell ficou a menos de meio segundo. E Antonelli, com problemas de confiabilidade, terminou em décimo sexto. A vantagem caiu para vinte e cinco pontos.", "+25"),
]},
{"type": "race", "rnd": 10, "gp": "BÉLGICA", "circuit": "SPA-FRANCORCHAMPS", "date": "19 DE JULHO",
 "flag": [(0, 0, 0), (253, 218, 36), (239, 51, 64)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("Spa. Primeira volta. Russell tenta por fora, toca em Hamilton e para na brita. Fim de corrida.", "!RUSSELL FORA"),
    ("Os comissários consideraram Hamilton o único culpado, mas reduziram a punição para cinco segundos, por ser a primeira volta.", "FATO|5 SEGUNDOS"),
    ("Hamilton e o chefe de equipe da Ferrari, Fred Vasseur, discordaram da decisão. Hamilton disse que se sentiu azarado.", "OPINIÃO|“AZARADO”"),
    ("Ainda houve uma liberação insegura nos boxes, em que um mecânico foi derrubado. A Ferrari levou uma multa.", "MULTA"),
    ("Antonelli recuperou a liderança depois de uma relargada e bateu Leclerc por menos de dois segundos. Sexta vitória no ano.", "6 VITÓRIAS"),
]},
{"type": "race", "rnd": 11, "gp": "HUNGRIA", "circuit": "HUNGARORING", "date": "26 DE JULHO",
 "flag": [(206, 41, 57), (255, 255, 255), (71, 112, 80)],
 "podium": ["Norris", "Verstappen", "Antonelli"], "lines": [
    ("Antes das férias, a McLaren acordou.", ""),
    ("Norris largou na pole. Piastri bateu na Williams de Carlos Sainz na curva dois, o que abriu o caminho para Norris na estratégia de paradas.", "PIASTRI|x SAINZ"),
    ("Piastri acabaria abandonando com uma falha no câmbio.", "PIASTRI ABANDONA"),
    ("Norris venceu pela primeira vez em 2026, quinze segundos à frente de Verstappen.", "!NORRIS|FINALMENTE"),
    ("Antonelli foi terceiro e ampliou a liderança. Hamilton perdeu uma posição com uma punição de cinco segundos.", ""),
]},
{"type": "midseason", "lines": [
    ("Nas férias de verão, o retrato era claro: a Mercedes dominava, a Ferrari vencia de vez em quando, e McLaren e Red Bull tentavam se encontrar.", "RAIO-X DA TEMPORADA"),
    ("Lá atrás, a Aston Martin, com motor Honda, chegou à pausa com um único ponto, conquistado por Alonso em Mônaco.", "ASTON MARTIN|1 PONTO"),
    ("E a Cadillac ainda não tinha pontuado, com nove abandonos em onze corridas.", "CADILLAC|0 PONTOS"),
]},
{"type": "race", "rnd": 12, "gp": "HOLANDA", "circuit": "ZANDVOORT", "date": "23 DE AGOSTO",
 "flag": [(174, 28, 40), (255, 255, 255), (33, 70, 139)],
 "podium": ["Norris", "Antonelli", "Russell"], "lines": [
    ("Zandvoort recebeu o último Grande Prêmio da Holanda. Russell venceu a sprint.", "A ÚLTIMA VEZ"),
    ("No domingo, a última curva inclinada estava molhada. Verstappen, em casa, perdeu o carro no fim da primeira volta e bateu forte.", "!VERSTAPPEN|BATE"),
    ("Saiu andando do carro e admitiu que foi agressivo demais no acelerador. Bandeira vermelha.", "BANDEIRA VERMELHA"),
    ("Na relargada, Norris passou Antonelli e Hamilton na mesma volta e venceu com onze segundos e meio de vantagem.", "NORRIS|2 SEGUIDAS"),
    ("Antonelli em segundo, Russell em terceiro. A liderança subiu para cinquenta e nove pontos.", "+59"),
]},
{"type": "race", "rnd": 13, "gp": "ITÁLIA", "circuit": "MONZA", "date": "6 DE SETEMBRO",
 "flag": [(0, 146, 70), (255, 255, 255), (206, 43, 55)],
 "podium": ["Antonelli", "Russell", "Verstappen"], "lines": [
    ("Monza. O italiano de dezenove anos largava em décimo nono, depois de uma punição por troca de componentes do motor.", "!P19"),
    ("Leclerc, a grande esperança da Ferrari, bateu na Parabólica logo na primeira volta.", "LECLERC FORA"),
    ("E Antonelli foi subindo, carro a carro, até passar Russell na freada para a Ascari e assumir a liderança.", "DE P19 A P1"),
    ("Venceu com quase quatro segundos de vantagem. O primeiro italiano a vencer em Monza desde Ludovico Scarfiotti, em 1966.", "!PRIMEIRO DESDE|1966"),
    ("E a segunda vitória largando mais de trás na história da Fórmula 1, atrás apenas de John Watson em Long Beach, em 1983.", "2ª MAIOR|RECUPERAÇÃO"),
]},
{"type": "race", "rnd": 14, "gp": "ESPANHA", "circuit": "MADRING · MADRI", "date": "13 DE SETEMBRO",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Antonelli", "Verstappen", "Norris"], "lines": [
    ("Madri voltou a receber a Fórmula 1 pela primeira vez em quarenta e cinco anos, num circuito novo.", "MADRI|45 ANOS DEPOIS"),
    ("Norris largou na pole e liderava. Mas o safety car virtual chegou dois segundos tarde demais para ele, e Antonelli parou na hora certa.", "!2 SEGUNDOS"),
    ("Antonelli venceu, Verstappen foi segundo, Norris terceiro. Hamilton abandonou na sétima volta, com uma falha nos freios.", "HAMILTON|FREIOS"),
    ("Muitos críticos chamaram a prova de esquecível. Mas não para o campeonato: a vantagem chegou a oitenta e um pontos.", "+81"),
]},
{"type": "race", "rnd": 15, "gp": "AZERBAIJÃO", "circuit": "BAKU", "date": "26 DE SETEMBRO",
 "flag": [(0, 181, 226), (239, 51, 64), (80, 158, 47)],
 "podium": ["Russell", "Verstappen", "Hadjar"], "lines": [
    ("Em Baku, Russell largou na pole e liderou de ponta a ponta.", "DE PONTA A PONTA"),
    ("Dois períodos de safety car deram a Verstappen a chance de atacar até a última curva.", "!VERSTAPPEN ATACA"),
    ("Russell venceu por cento e noventa e seis milésimos. Hadjar completou o pódio para a Red Bull.", "0,196 s"),
    ("Seis pilotos abandonaram, incluindo os dois da McLaren, que saíram de Baku sem pontos.", "McLAREN|ZERO PONTOS"),
    ("Antonelli, depois de largar no meio do pelotão, se recuperou até o quinto lugar. A vantagem caiu para sessenta e seis pontos.", "+66"),
]},
{"type": "race", "rnd": 16, "gp": "SINGAPURA", "circuit": "MARINA BAY", "date": "11 DE OUTUBRO",
 "flag": [(239, 51, 64), (255, 255, 255), (239, 51, 64)],
 "podium": ["Verstappen", "Leclerc", "Antonelli"], "lines": [
    ("Em Singapura, Verstappen fez o fim de semana perfeito.", "!VERSTAPPEN"),
    ("Venceu a sprint, numa corrida molhada em que Russell bateu quando liderava.", "SPRINT:|RUSSELL BATE"),
    ("No domingo, fez a pole e liderou todas as voltas. A primeira vitória da carreira em Singapura.", "1ª VEZ|EM SINGAPURA"),
    ("Hamilton ficou na pista com pneus usados durante um safety car virtual, caiu de terceiro para sexto e pediu desculpas à equipe.", "!“DESCULPA, PESSOAL”"),
    ("Leclerc foi segundo, Antonelli terceiro. O título estava cada vez mais perto.", ""),
]},
{"type": "race", "rnd": 17, "gp": "ESTADOS UNIDOS", "circuit": "AUSTIN", "date": "25 DE OUTUBRO",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("Em Austin, Antonelli fez aquela que Toto Wolff chamou de a melhor corrida da carreira dele.", "“A MELHOR”"),
    ("Uma única parada, no fim da volta vinte e quatro, e domínio total. Leclerc a treze segundos, Verstappen em terceiro.", "1 PARADA"),
    ("Hamilton foi quarto, Norris quinto. O título estava a um passo.", "A UM PASSO"),
]},
{"type": "race", "rnd": 18, "gp": "MÉXICO", "circuit": "HERMANOS RODRÍGUEZ", "date": "1º DE NOVEMBRO",
 "flag": [(0, 104, 71), (255, 255, 255), (206, 17, 38)],
 "podium": ["Verstappen", "Hamilton", "Antonelli"], "lines": [
    ("Cidade do México. Antonelli chegava com cento e vinte e três pontos de vantagem sobre Russell. Bastava o nono lugar.", "BASTA P9"),
    ("A corrida foi um caos. Valtteri Bottas sofreu uma batida forte na primeira curva, e a prova foi interrompida com bandeira vermelha.", "!BANDEIRA VERMELHA"),
    ("Depois vieram uma relargada parada, mais safety cars e uma colisão entre Piastri e Lindblad, que rendeu a Piastri dez segundos de punição.", "PIASTRI|PUNIDO"),
    ("Os dois carros da Alpine também foram punidos por desrespeitar bandeiras amarelas.", "BANDEIRAS|AMARELAS"),
    ("Verstappen venceu por oito décimos sobre Hamilton. E Antonelli, em terceiro, cruzou a linha de chegada como campeão mundial.", "!CAMPEÃO|MUNDIAL"),
]},
{"type": "champion", "lines": [
    ("Kimi Antonelli. Vinte anos e sessenta e oito dias.", "KIMI ANTONELLI"),
    ("O campeão mais jovem da história, mais jovem que Sebastian Vettel em 2010.", "!O MAIS JOVEM|DA HISTÓRIA"),
    ("O primeiro italiano campeão desde Alberto Ascari, em 1953.", "1º ITALIANO|DESDE 1953"),
    ("E o primeiro título de pilotos da Mercedes desde Hamilton, em 2020. Conquistado na segunda temporada dele na Fórmula 1, com quatro corridas de antecedência.", "MERCEDES|DESDE 2020"),
]},

# ------------------------------------------------------------------ BRASIL
{"type": "chapter", "num": "III", "title": "INTERLAGOS", "lines": [
    ("O campeão estava definido. Mas o Brasil ainda tinha uma história para contar.", ""),
]},
{"type": "race", "rnd": 19, "gp": "BRASIL", "circuit": "INTERLAGOS", "date": "8 DE NOVEMBRO",
 "flag": [(0, 156, 59), (255, 223, 0), (0, 39, 118)],
 "podium": ["Norris", "Verstappen", "Hadjar"], "long": True, "lines": [
    ("Sábado. A chuva atrasou o treino classificatório em quase uma hora e meia.", "!CHUVA"),
    ("Quando a sessão finalmente aconteceu, Norris foi o rei da pista molhada: pole position, a terceira seguida em Interlagos, com Russell a dois décimos e Antonelli em terceiro.", "POLE|NORRIS"),
    ("Hamilton e Verstappen caíram no Q2 e ainda tinham punições por troca de motor. As duas Ferrari foram punidas com dez posições por usarem o quinto motor a combustão.", "PUNIÇÕES"),
    ("Hamilton largou em vigésimo. Verstappen, em vigésimo primeiro.", "!P20 · P21"),
    ("Domingo. Setenta e uma voltas. A pista começou úmida, foi secando, e no fim voltou a chover.", "71 VOLTAS"),
    ("Norris administrou tudo lá da frente, sem erros, num dia sem safety car e sem batidas.", "SEM ERROS"),
    ("E lá de trás veio Verstappen. Carro a carro, ultrapassagem a ultrapassagem, do vigésimo primeiro ao segundo lugar.", "!DE P21 A P2"),
    ("Hadjar completou o pódio para a Red Bull, a vinte e quatro segundos. Russell foi quarto e Antonelli quinto: segundo os relatos, ele deixou o companheiro passar.", "HADJAR P3"),
    ("Hamilton, na sua corrida de número quatrocentos, se recuperou de vigésimo para nono, apesar de uma rodada, mas terminou uma volta atrás.", "HAMILTON|400 CORRIDAS"),
    ("Norris venceu com catorze segundos e meio de vantagem, a terceira vitória dele no ano.", "!NORRIS VENCE"),
    ("E com os pontos de Russell e Antonelli, a Mercedes garantiu o título de construtores. O nono da sua história.", "MERCEDES|CAMPEÃ"),
    ("Verstappen ampliou a vantagem no segundo lugar do campeonato de dois para dezessete pontos.", "+17"),
]},

# ------------------------------------------------------------------ EQUIPES
{"type": "chapter", "num": "IV", "title": "QUEM GANHOU E QUEM PERDEU", "lines": [
    ("Dezenove corridas depois, qual é o balanço de cada equipe?", ""),
]},
{"type": "teams", "lines": [
    ("Mercedes: a melhor leitura do novo regulamento. Doze vitórias em dezenove Grandes Prêmios e os dois títulos garantidos, apesar das falhas de confiabilidade e da tensão entre os pilotos.", "@MER"),
    ("Ferrari: segunda entre as equipes, com as vitórias de Hamilton em Barcelona e de Leclerc em Silverstone. Mas os erros de estratégia, da Austrália a Singapura, custaram caro.", "@FER"),
    ("Red Bull: sem dominar, Verstappen venceu em Singapura e no México e foi a voz mais constante do ano. Hadjar subiu três vezes ao pódio.", "@RBR"),
    ("McLaren: a campeã mundial começou com duas corridas sem Piastri e as duas ausências na China. Norris venceu três vezes, mas a equipe ainda briga pelo terceiro lugar.", "@MCL"),
    ("A Racing Bulls é a melhor do resto, com mais de cem pontos. Lindblad pontuou na estreia.", "@RB"),
    ("A Alpine, agora com motor Mercedes, é a sexta, com Gasly e Colapinto pontuando com regularidade.", "@ALP"),
    ("Haas e Audi brigam pelo sétimo lugar. A Williams vive um ano difícil.", "@HAA"),
    ("A Aston Martin, com a Honda, teve um ano muito difícil, com apenas sete pontos. E a Cadillac, estreante, ainda busca o primeiro ponto.", "@AST"),
]},

# ------------------------------------------------------------------ CLASSIFICAÇÃO
{"type": "chapter", "num": "V", "title": "ONDE ESTAMOS", "lines": [
    ("Onze de novembro de 2026. Faltam três corridas: Las Vegas, Catar e Abu Dhabi.", ""),
]},
{"type": "standings", "kind": "drivers", "lines": [
    ("Antonelli é campeão com trezentos e noventa pontos.", "@show"),
    ("Mas a briga pelo vice-campeonato está aberta. Verstappen tem duzentos e setenta e nove. Russell, duzentos e sessenta e dois. Hamilton, apenas um ponto atrás.", "@vice"),
    ("Leclerc soma duzentos e quarenta e nove, e Norris, duzentos e quarenta e seis.", ""),
    ("Com setenta e cinco pontos ainda em jogo, esses cinco pilotos, separados por trinta e três pontos, ainda podem terminar em segundo.", "!75 PONTOS|EM JOGO"),
]},
{"type": "standings", "kind": "teams", "lines": [
    ("Entre os construtores, a Mercedes já é campeã, com seiscentos e cinquenta e dois pontos. A Ferrari vem em segundo, com mais de quinhentos.", "@show"),
    ("A grande batalha é pelo terceiro lugar: Red Bull com quatrocentos e quinze, McLaren dezessete pontos atrás.", "@fight"),
    ("E lá atrás, Aston Martin e Cadillac lutam para não terminar em último.", ""),
]},
{"type": "outro", "lines": [
    ("Uma temporada de regras novas, rostos novos e velhas rivalidades.", "NOVAS REGRAS"),
    ("Um campeão de vinte anos. Um heptacampeão que voltou a vencer. Um Verstappen que nunca parou de lutar.", "UM CAMPEÃO|DE 20 ANOS"),
    ("O título já tem dono. Mas ainda faltam três corridas para escrever o último capítulo.", "!3 CORRIDAS"),
    ("Essa foi a Fórmula 1 em 2026. Até o Brasil.", "F1 2026"),
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
