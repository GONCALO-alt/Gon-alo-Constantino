# -*- coding: utf-8 -*-
"""
F1 2026 — TUDO O QUE ACONTECEU ATÉ AO BRASIL
Guião do documentário (narração em inglês).

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
# ------------------------------------------------------------------ OPENING
{"type": "cold", "accent": "MER", "lines": [
    ("Twenty years. Sixty-eight days.", "20 YEARS|68 DAYS"),
    ("No one had ever become Formula One world champion so young.", "!NEVER BEFORE"),
    ("But before the crown, there was everything else.", "BEFORE THE CROWN..."),
    ("A technical revolution. Two races cancelled. A war inside the same garage.", "A REVOLUTION"),
    ("Lewis Hamilton back on the top step of the podium. A Max Verstappen who refused to fade away.", "HAMILTON|VERSTAPPEN"),
    ("And a champion McLaren that suddenly had to start again from zero.", "McLAREN"),
    ("Nineteen Grands Prix. From Australia to Brazil.", "19 GRANDS PRIX"),
    ("This is everything that happened.", "!EVERYTHING"),
]},
{"type": "title", "lines": [
    ("", "F1 2026|EVERYTHING THAT HAPPENED UP TO BRAZIL"),
]},

# ------------------------------------------------------------------ RULES
{"type": "chapter", "num": "I", "title": "A NEW ERA", "lines": [
    ("To understand 2026, you have to start before the first start.", ""),
]},
{"type": "rules", "lines": [
    ("This was the biggest rule change in Formula One's recent history.", "!NEW RULES"),
    ("Power units now split their output almost fifty-fifty: half from the combustion engine, half from the electrical side.", "@split"),
    ("The MGU-H was gone. In return, the MGU-K almost tripled, from one hundred and twenty to three hundred and fifty kilowatts.", "@kw"),
    ("Every car switched to advanced sustainable fuel.", "SUSTAINABLE|FUEL"),
    ("The cars became shorter, narrower and lighter: the minimum weight dropped to seven hundred and sixty-eight kilograms, without fuel.", "@kg"),
    ("And DRS was gone. In its place came active aerodynamics: front and rear wings that change angle during the lap.", "@aero"),
    ("To overtake, drivers got an overtake mode with extra energy, plus a boost button to deploy the battery whenever they wanted.", "@overtake"),
    ("The result: managing energy became as important as braking late. And the racing changed character.", "ENERGY IS KING"),
]},
{"type": "grid", "lines": [
    ("The grid changed too. Sauber became Audi, with Hulkenberg and Bortoleto.", "AUDI"),
    ("Cadillac arrived as the eleventh team, with two veterans: Sergio Perez and Valtteri Bottas.", "CADILLAC"),
    ("Isack Hadjar was promoted to Red Bull alongside Verstappen, and Arvid Lindblad was the only rookie, at Racing Bulls.", "HADJAR|LINDBLAD"),
    ("Twenty-two cars. Eleven teams. And Lando Norris defending the world title.", "22 CARS|11 TEAMS"),
]},
{"type": "controversy", "title": "THE ENGINE ROW", "lines": [
    ("Before the season even started, the first controversy broke out.", "!CONTROVERSY"),
    ("Ferrari, Audi and Honda suspected Mercedes had found a way, with a hot engine, to exceed the sixteen-to-one maximum compression ratio, which was only measured cold.", "FACT|RIVALS' SUSPICION"),
    ("Mercedes always insisted the engine was legal, and that it had consulted the FIA throughout development.", "MERCEDES:|“IT'S LEGAL”"),
    ("The FIA changed the rule: from the first of June, compression would also be measured hot.", "FACT|NEW HOT TEST FROM 1 JUNE"),
    ("Rivals put the gain at around thirteen horsepower. Mercedes disputed those numbers, and Toto Wolff called it a storm in a teacup.", "OPINION|“A STORM IN A TEACUP”"),
]},

# ------------------------------------------------------------------ RACES
{"type": "chapter", "num": "II", "title": "THE SILVER SURGE", "lines": [
    ("Melbourne. The eighth of March. The new era begins.", ""),
]},
{"type": "race", "rnd": 1, "gp": "AUSTRALIA", "circuit": "ALBERT PARK", "date": "8 MARCH",
 "flag": [(0, 40, 104), (255, 255, 255), (200, 16, 46)],
 "podium": ["Russell", "Antonelli", "Leclerc"], "lines": [
    ("The drama began before the start. Oscar Piastri, at his home race, crashed on the way to the grid and never took the start.", "!PIASTRI OUT"),
    ("Nico Hulkenberg was also withdrawn just before the race. Only twenty cars started.", "ONLY 20 CARS"),
    ("Ferrari got off the line brilliantly, and Charles Leclerc was in the fight at the front.", "FERRARI LEADS"),
    ("But the decisive moment came under the virtual safety car. Mercedes double-stacked both cars; Ferrari didn't make the same call and lost control of the race.", "!FERRARI'S MISTAKE"),
    ("George Russell won, with Kimi Antonelli less than three seconds behind. A Mercedes one-two in the very first race, with Leclerc third.", "MERCEDES|ONE-TWO"),
    ("Hamilton was fourth, Norris fifth. And rookie Lindblad scored on debut, in eighth.", "LINDBLAD P8"),
]},
{"type": "race", "rnd": 2, "gp": "CHINA", "circuit": "SHANGHAI", "date": "15 MARCH",
 "flag": [(222, 41, 16), (255, 222, 0), (222, 41, 16)],
 "podium": ["Antonelli", "Russell", "Hamilton"], "lines": [
    ("In Shanghai, the first bombshell: neither McLaren started. Two different electrical problems, both linked to the Mercedes power unit.", "!McLAREN|DOUBLE DNS"),
    ("With two more cars out, only eighteen took the start.", ""),
    ("Russell had already won Saturday's sprint. But Sunday belonged to Antonelli.", "SPRINT: RUSSELL"),
    ("He started from pole, lost the lead to Hamilton at the start, took it back, and controlled the race to the flag.", "ANTONELLI"),
    ("His first career win, at nineteen. Only Verstappen had won younger.", "!FIRST WIN"),
    ("And Hamilton, at last, stood on the podium for Ferrari.", "HAMILTON'S FIRST|FERRARI PODIUM"),
]},
{"type": "news", "title": "CANCELLED", "lines": [
    ("Days later came the news: because of the conflict in the Middle East, the Bahrain and Saudi Arabian Grands Prix were cancelled, with no replacements.", "!BAHRAIN|SAUDI ARABIA"),
    ("The calendar shrank to twenty-two races, with a five-week gap between Japan and Miami.", "22 RACES"),
]},
{"type": "race", "rnd": 3, "gp": "JAPAN", "circuit": "SUZUKA", "date": "29 MARCH",
 "flag": [(255, 255, 255), (188, 0, 45), (255, 255, 255)],
 "podium": ["Antonelli", "Piastri", "Leclerc"], "lines": [
    ("At Suzuka, Antonelli took pole again, but made a poor start and dropped to sixth.", "P1 TO P6"),
    ("The race turned on Oliver Bearman's crash at Spoon. The safety car shuffled the order, and Antonelli was back in front.", "!SAFETY CAR"),
    ("He won by thirteen seconds from Piastri, who finally finished a race and took second. Leclerc completed the podium.", "PIASTRI P2"),
    ("Antonelli became the youngest ever multiple Grand Prix winner, and the youngest championship leader in history.", "!LEADER|AT 19"),
]},
{"type": "race", "rnd": 4, "gp": "MIAMI", "circuit": "MIAMI INTERNATIONAL AUTODROME", "date": "3 MAY",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Norris", "Piastri"], "lines": [
    ("After five weeks, Miami. On Saturday, Norris won the sprint: McLaren's first victory of 2026.", "SPRINT: NORRIS"),
    ("Hadjar was disqualified from qualifying: his Red Bull's floor was two millimetres outside the rules.", "!HADJAR|DISQUALIFIED"),
    ("The threat of storms moved the start forward by three hours, but the rain barely came.", "3 HOURS EARLY"),
    ("Leclerc led early but spun. He lost fourth to Russell and, on the line, fifth to Verstappen. Both were later penalised.", "LECLERC SPINS"),
    ("Up front, Antonelli held off Norris by just over three seconds. Three wins in a row, and a twenty-point lead over Russell.", "3 IN A ROW"),
]},
{"type": "race", "rnd": 5, "gp": "CANADA", "circuit": "GILLES VILLENEUVE", "date": "24 MAY",
 "flag": [(216, 6, 33), (255, 255, 255), (216, 6, 33)],
 "podium": ["Antonelli", "Hamilton", "Verstappen"], "lines": [
    ("In Montreal, the civil war at Mercedes exploded.", "!MERCEDES|VS MERCEDES"),
    ("In the sprint, Russell and Antonelli made contact. Antonelli was forced onto the grass and demanded, over the radio, a penalty for his team-mate.", "SPRINT CLASH"),
    ("Toto Wolff told him to concentrate on the driving, not on moaning over the radio.", "“CONCENTRATE|ON THE DRIVING”"),
    ("On Sunday they fought wheel to wheel again, until Russell retired from the lead with a power unit problem.", "!RUSSELL RETIRES"),
    ("Norris retired too, after a tyre gamble that backfired.", "NORRIS OUT"),
    ("Antonelli won a fourth in a row. Hamilton was second, his best Ferrari result yet, and Verstappen took his first podium of the year.", "HAMILTON P2|VERSTAPPEN P3"),
    ("The lead grew to forty-three points. And Mercedes drew up new internal rules on how its drivers could race each other.", "+43"),
]},
{"type": "race", "rnd": 6, "gp": "MONACO", "circuit": "MONTE CARLO", "date": "7 JUNE",
 "flag": [(206, 17, 38), (255, 255, 255), (206, 17, 38)],
 "podium": ["Antonelli", "Hamilton", "Hadjar"], "lines": [
    ("In Monaco, the first race under the new compression test, Verstappen was out on the very first lap.", "!VERSTAPPEN|LAP 1"),
    ("Lance Stroll crashed at the final corner and brought out the safety car. At the restart, Leclerc crashed in the same place, at his home race, and blamed his brakes.", "LECLERC|AT HOME"),
    ("Then the track surface began breaking up at that corner, and the race was red-flagged with ten laps to go.", "!RED FLAG"),
    ("Antonelli led every lap and survived the restart. Hamilton second, Hadjar third.", ""),
    ("A fifth straight win. The youngest Monaco winner ever, and Mercedes' first victory in the Principality since 2019.", "5 IN A ROW"),
]},
{"type": "race", "rnd": 7, "gp": "BARCELONA", "circuit": "CATALUNYA", "date": "14 JUNE",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Hamilton", "Russell", "Norris"], "lines": [
    ("Barcelona. And finally, it happened.", ""),
    ("Ferrari went for three stops and nailed the timing of the virtual safety car.", "3 STOPS"),
    ("Antonelli retired late on while fighting for second. Mercedes' unbeaten run was over.", "!ANTONELLI|RETIRES"),
    ("And Lewis Hamilton won. His first victory with Ferrari, his first since Belgium in 2024, and the one hundred and sixth of his career.", "!HAMILTON|WINS FOR FERRARI"),
    ("Russell was second, Norris third, Verstappen fourth. And Alpine got both cars into the points.", "WIN 106"),
]},
{"type": "race", "rnd": 8, "gp": "AUSTRIA", "circuit": "RED BULL RING", "date": "28 JUNE",
 "flag": [(237, 41, 57), (255, 255, 255), (237, 41, 57)],
 "podium": ["Russell", "Verstappen", "Antonelli"], "lines": [
    ("In Austria, Russell hit back. Pole position and victory, with Verstappen just over a second and a half behind.", "RUSSELL"),
    ("But the story of the day was something else: Verstappen against Hamilton, once again.", "!VERSTAPPEN|VS HAMILTON"),
    ("During their fight, Verstappen said on the radio it was a clear penalty. The stewards looked at it and took no further action.", "FACT|NO PENALTY"),
    ("In Hamilton's view, it was Verstappen who should have backed out. Opposing opinions, no punishment.", "OPINION|“HE SHOULD HAVE BACKED OUT”"),
    ("Hamilton was fifth, Leclerc only eighth. At Red Bull's home race, Ferrari had a day to forget.", "FERRARI SLUMP"),
]},
{"type": "race", "rnd": 9, "gp": "GREAT BRITAIN", "circuit": "SILVERSTONE", "date": "5 JULY",
 "flag": [(1, 33, 105), (255, 255, 255), (200, 16, 46)],
 "podium": ["Leclerc", "Russell", "Hamilton"], "lines": [
    ("At Silverstone, Antonelli won the sprint. But Sunday belonged to Ferrari.", "SPRINT: ANTONELLI"),
    ("Charles Leclerc won for the first time since 2024. It was the two hundred and fiftieth victory in Ferrari's history.", "!LECLERC|FERRARI WIN 250"),
    ("But the finish was tarnished. After a late crash for Verstappen, a message appeared saying the safety car would come in that lap.", "“SAFETY CAR|IN THIS LAP”"),
    ("The FIA overruled it eight seconds later and blamed a software error. The race finished behind the safety car, to boos from the grandstands.", "!SOFTWARE ERROR"),
    ("Russell was less than half a second behind. And Antonelli, hit by reliability trouble, finished sixteenth. The lead fell to twenty-five points.", "+25"),
]},
{"type": "race", "rnd": 10, "gp": "BELGIUM", "circuit": "SPA-FRANCORCHAMPS", "date": "19 JULY",
 "flag": [(0, 0, 0), (253, 218, 36), (239, 51, 64)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("Spa. Lap one. Russell goes around the outside, touches Hamilton and ends up in the gravel. Race over.", "!RUSSELL OUT"),
    ("The stewards held Hamilton wholly responsible, but cut the penalty to five seconds because it was the opening lap.", "FACT|5 SECONDS"),
    ("Hamilton and Ferrari team boss Fred Vasseur disagreed with the decision. Hamilton said he felt unlucky.", "OPINION|“UNLUCKY”"),
    ("There was also an unsafe release in the pits, in which a mechanic was knocked over. Ferrari were fined.", "FINE"),
    ("Antonelli retook the lead after a restart and beat Leclerc by under two seconds. His sixth win of the year.", "6 WINS"),
]},
{"type": "race", "rnd": 11, "gp": "HUNGARY", "circuit": "HUNGARORING", "date": "26 JULY",
 "flag": [(206, 41, 57), (255, 255, 255), (71, 112, 80)],
 "podium": ["Norris", "Verstappen", "Antonelli"], "lines": [
    ("Before the summer break, McLaren woke up.", ""),
    ("Norris started from pole. Piastri collided with Carlos Sainz's Williams at turn two, which opened the door for Norris in the pit strategy.", "PIASTRI|VS SAINZ"),
    ("Piastri would later retire with a gearbox failure.", "PIASTRI RETIRES"),
    ("Norris won for the first time in 2026, fifteen seconds clear of Verstappen.", "!NORRIS|AT LAST"),
    ("Antonelli was third and extended his lead. Hamilton lost a place to a five-second penalty.", ""),
]},
{"type": "midseason", "lines": [
    ("At the summer break, the picture was clear: Mercedes dominated, Ferrari won now and then, and McLaren and Red Bull were searching for answers.", "MID-SEASON"),
    ("At the back, Honda-powered Aston Martin reached the break with a single point, scored by Alonso in Monaco.", "ASTON MARTIN|1 POINT"),
    ("And Cadillac had yet to score, with nine retirements in eleven races.", "CADILLAC|0 POINTS"),
]},
{"type": "race", "rnd": 12, "gp": "NETHERLANDS", "circuit": "ZANDVOORT", "date": "23 AUGUST",
 "flag": [(174, 28, 40), (255, 255, 255), (33, 70, 139)],
 "podium": ["Norris", "Antonelli", "Russell"], "lines": [
    ("Zandvoort hosted the final Dutch Grand Prix. Russell won the sprint.", "THE LAST ONE"),
    ("On Sunday, the banked final corner was wet. Verstappen, at home, lost the car at the end of the opening lap and crashed heavily.", "!VERSTAPPEN|CRASHES"),
    ("He walked away and admitted he had been too aggressive on the throttle. Red flag.", "RED FLAG"),
    ("At the restart, Norris passed Antonelli and Hamilton on the same lap and won by eleven and a half seconds.", "NORRIS|BACK TO BACK"),
    ("Antonelli second, Russell third. The lead grew to fifty-nine points.", "+59"),
]},
{"type": "race", "rnd": 13, "gp": "ITALY", "circuit": "MONZA", "date": "6 SEPTEMBER",
 "flag": [(0, 146, 70), (255, 255, 255), (206, 43, 55)],
 "podium": ["Antonelli", "Russell", "Verstappen"], "lines": [
    ("Monza. The nineteen-year-old Italian started nineteenth, after a power unit penalty.", "!P19"),
    ("Leclerc, Ferrari's great hope, crashed at the Parabolica on the very first lap.", "LECLERC OUT"),
    ("And Antonelli climbed, car by car, until he passed Russell on the run to Ascari and took the lead.", "P19 TO P1"),
    ("He won by almost four seconds. The first Italian to win at Monza since Ludovico Scarfiotti, in 1966.", "!FIRST SINCE|1966"),
    ("And the second-lowest grid position for a winner in Formula One history, behind only John Watson at Long Beach in 1983.", "2ND GREATEST|COMEBACK"),
]},
{"type": "race", "rnd": 14, "gp": "SPAIN", "circuit": "MADRING · MADRID", "date": "13 SEPTEMBER",
 "flag": [(170, 21, 27), (241, 191, 0), (170, 21, 27)],
 "podium": ["Antonelli", "Verstappen", "Norris"], "lines": [
    ("Madrid hosted Formula One for the first time in forty-five years, on a brand-new circuit.", "MADRID|45 YEARS ON"),
    ("Norris started from pole and was leading. But the virtual safety car came two seconds too late for him, and Antonelli pitted at exactly the right moment.", "!2 SECONDS"),
    ("Antonelli won, Verstappen was second, Norris third. Hamilton retired on lap seven with a brake failure.", "HAMILTON|BRAKES"),
    ("Many critics called it a forgettable race. Not for the championship: the lead reached eighty-one points.", "+81"),
]},
{"type": "race", "rnd": 15, "gp": "AZERBAIJAN", "circuit": "BAKU", "date": "26 SEPTEMBER",
 "flag": [(0, 181, 226), (239, 51, 64), (80, 158, 47)],
 "podium": ["Russell", "Verstappen", "Hadjar"], "lines": [
    ("In Baku, Russell started from pole and led from lights to flag.", "LIGHTS TO FLAG"),
    ("Two safety car periods gave Verstappen the chance to attack right to the final corner.", "!VERSTAPPEN ATTACKS"),
    ("Russell won by one hundred and ninety-six thousandths of a second. Hadjar completed the podium for Red Bull.", "0.196 s"),
    ("Six drivers retired, including both McLarens, who left Baku without a point.", "McLAREN|ZERO POINTS"),
    ("Antonelli, after starting in the midfield, recovered to fifth. The lead fell to sixty-six points.", "+66"),
]},
{"type": "race", "rnd": 16, "gp": "SINGAPORE", "circuit": "MARINA BAY", "date": "11 OCTOBER",
 "flag": [(239, 51, 64), (255, 255, 255), (239, 51, 64)],
 "podium": ["Verstappen", "Leclerc", "Antonelli"], "lines": [
    ("In Singapore, Verstappen had the perfect weekend.", "!VERSTAPPEN"),
    ("He won the sprint, a wet race in which Russell crashed while leading.", "SPRINT:|RUSSELL CRASHES"),
    ("On Sunday he took pole and led every lap. His first ever win in Singapore.", "FIRST EVER|IN SINGAPORE"),
    ("Hamilton stayed out on old tyres during a virtual safety car, dropped from third to sixth, and apologised to his team.", "!“SORRY, BOYS”"),
    ("Leclerc was second, Antonelli third. The title was getting closer and closer.", ""),
]},
{"type": "race", "rnd": 17, "gp": "UNITED STATES", "circuit": "AUSTIN", "date": "25 OCTOBER",
 "flag": [(178, 34, 52), (255, 255, 255), (60, 59, 110)],
 "podium": ["Antonelli", "Leclerc", "Verstappen"], "lines": [
    ("In Austin, Antonelli delivered what Toto Wolff called the best race of his career so far.", "“THE BEST”"),
    ("A single stop, at the end of lap twenty-four, and total control. Leclerc thirteen seconds back, Verstappen third.", "ONE STOP"),
    ("Hamilton was fourth, Norris fifth. The title was one step away.", "ONE STEP AWAY"),
]},
{"type": "race", "rnd": 18, "gp": "MEXICO", "circuit": "HERMANOS RODRÍGUEZ", "date": "1 NOVEMBER",
 "flag": [(0, 104, 71), (255, 255, 255), (206, 17, 38)],
 "podium": ["Verstappen", "Hamilton", "Antonelli"], "lines": [
    ("Mexico City. Antonelli arrived one hundred and twenty-three points clear of Russell. Ninth place would be enough.", "P9 IS ENOUGH"),
    ("The race was chaos. Valtteri Bottas had a heavy crash at turn one, and the race was red-flagged.", "!RED FLAG"),
    ("Then came a standing restart, more safety cars, and a collision between Piastri and Lindblad that earned Piastri a ten-second penalty.", "PIASTRI|PENALISED"),
    ("Both Alpines were also penalised for ignoring yellow flags.", "YELLOW FLAGS"),
    ("Verstappen beat Hamilton by eight tenths. And Antonelli, in third, crossed the line as world champion.", "!WORLD|CHAMPION"),
]},
{"type": "champion", "lines": [
    ("Kimi Antonelli. Twenty years and sixty-eight days.", "KIMI ANTONELLI"),
    ("The youngest champion in history, younger than Sebastian Vettel in 2010.", "!YOUNGEST|EVER"),
    ("The first Italian champion since Alberto Ascari, in 1953.", "FIRST ITALIAN|SINCE 1953"),
    ("And Mercedes' first drivers' title since Hamilton in 2020. Won in only his second Formula One season, with four races to spare.", "MERCEDES|FIRST SINCE 2020"),
]},

# ------------------------------------------------------------------ BRAZIL
{"type": "chapter", "num": "III", "title": "INTERLAGOS", "lines": [
    ("The champion was decided. But Brazil still had a story to tell.", ""),
]},
{"type": "race", "rnd": 19, "gp": "BRAZIL", "circuit": "INTERLAGOS", "date": "8 NOVEMBER",
 "flag": [(0, 156, 59), (255, 223, 0), (0, 39, 118)],
 "podium": ["Norris", "Verstappen", "Hadjar"], "long": True, "lines": [
    ("Saturday. Rain delayed qualifying by almost an hour and a half.", "!RAIN"),
    ("When it finally ran, Norris was the king of the wet: pole position, his third in a row at Interlagos, with Russell two tenths behind and Antonelli third.", "NORRIS|POLE"),
    ("Hamilton and Verstappen were knocked out in Q2 and also carried engine-change penalties. Both Ferraris took ten-place drops for fitting a fifth combustion engine.", "PENALTIES"),
    ("Hamilton started twentieth. Verstappen, twenty-first.", "!P20 · P21"),
    ("Sunday. Seventy-one laps. The track started damp, dried out, and then the rain returned at the end.", "71 LAPS"),
    ("Norris managed everything from the front, without a mistake, on a day with no safety car and no crashes.", "FLAWLESS"),
    ("And from the back came Verstappen. Car by car, pass after pass, from twenty-first all the way to second.", "!P21 TO P2"),
    ("Hadjar completed the podium for Red Bull, twenty-four seconds back. Russell was fourth and Antonelli fifth; according to reports, he let his team-mate through.", "HADJAR P3"),
    ("Hamilton, in his four hundredth Grand Prix, recovered from twentieth to ninth despite a spin, but finished a lap down.", "HAMILTON|400 RACES"),
    ("Norris won by fourteen and a half seconds, his third victory of the year.", "!NORRIS WINS"),
    ("And with points from Russell and Antonelli, Mercedes clinched the constructors' title. The ninth in their history.", "MERCEDES|CHAMPIONS"),
    ("Verstappen stretched his advantage in second place in the championship from two points to seventeen.", "+17"),
]},

# ------------------------------------------------------------------ TEAMS
{"type": "chapter", "num": "IV", "title": "WINNERS AND LOSERS", "lines": [
    ("Nineteen races in, where does every team stand?", ""),
]},
{"type": "teams", "lines": [
    ("Mercedes: the best reading of the new rules. Twelve wins from nineteen Grands Prix and both titles secured, despite reliability failures and tension between the drivers.", "@MER"),
    ("Ferrari: second among the teams, with wins for Hamilton in Barcelona and Leclerc at Silverstone. But strategy errors, from Australia to Singapore, proved costly.", "@FER"),
    ("Red Bull: without dominating, Verstappen won in Singapore and Mexico and was the most consistent force of the year. Hadjar reached the podium three times.", "@RBR"),
    ("McLaren: the world champions began with two races without Piastri and a double no-show in China. Norris has won three times, but the team is still fighting for third.", "@MCL"),
    ("Racing Bulls are best of the rest, with more than one hundred points. Lindblad scored on debut.", "@RB"),
    ("Alpine, now with Mercedes power, are sixth, with Gasly and Colapinto scoring regularly.", "@ALP"),
    ("Haas and Audi are fighting for seventh. Williams are having a difficult year.", "@HAA"),
    ("Aston Martin, with Honda, have had a very hard season, with only seven points. And newcomers Cadillac are still searching for their first point.", "@AST"),
]},

# ------------------------------------------------------------------ STANDINGS
{"type": "chapter", "num": "V", "title": "WHERE WE STAND", "lines": [
    ("The eleventh of November, 2026. Three races to go: Las Vegas, Qatar and Abu Dhabi.", ""),
]},
{"type": "standings", "kind": "drivers", "lines": [
    ("Antonelli is champion with three hundred and ninety points.", "@show"),
    ("But the fight for runner-up is wide open. Verstappen has two hundred and seventy-nine. Russell, two hundred and sixty-two. Hamilton, just one point behind.", "@vice"),
    ("Leclerc has two hundred and forty-nine, and Norris two hundred and forty-six.", ""),
    ("With seventy-five points still available, these five drivers, separated by thirty-three points, can all still finish second.", "!75 POINTS|STILL AVAILABLE"),
]},
{"type": "standings", "kind": "teams", "lines": [
    ("In the constructors' championship, Mercedes are already champions, with six hundred and fifty-two points. Ferrari are second, with more than five hundred.", "@show"),
    ("The big battle is for third: Red Bull on four hundred and fifteen, McLaren seventeen points behind.", "@fight"),
    ("And at the back, Aston Martin and Cadillac are fighting to avoid last place.", ""),
]},
{"type": "outro", "lines": [
    ("A season of new rules, new faces and old rivalries.", "NEW RULES"),
    ("A twenty-year-old champion. A seven-time champion who won again. A Verstappen who never stopped fighting.", "A 20-YEAR-OLD|CHAMPION"),
    ("The title has its owner. But there are still three races left to write the final chapter.", "!3 RACES TO GO"),
    ("This was Formula One in 2026. Up to Brazil.", "F1 2026"),
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
