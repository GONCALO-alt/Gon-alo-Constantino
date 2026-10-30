import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u09")
C = "B1"

L(1, "Hábitos saudáveis", "gezond eten, genoeg slapen, bewegen",
  ["Falar de hábitos de vida saudáveis"],
  vocab=[V("v-gezond","gezond","saudável","adjective"), V("v-bewegen","bewegen","mexer-se|fazer exercício","verb"),
         V("v-voeding","voeding","alimentação","noun","de"), V("v-ongezond","ongezond","pouco saudável","adjective"),
         V("v-gewoonte-gezond","levensstijl","estilo de vida","noun","de")],
  ex=[("Ik probeer gezonder te eten.","Tento comer de forma mais saudável."),("Je moet elke dag een halfuur bewegen.","Devias mexer-te meia hora por dia."),("Gezonde voeding is belangrijk.","Uma alimentação saudável é importante."),("Hij heeft een ongezonde levensstijl.","Ele tem um estilo de vida pouco saudável.")],
  gram=[G("g-proberen-te","Proberen te + infinitivo","**proberen** + **te** + infinitivo no fim: *Ik probeer gezonder **te eten**.* O mesmo com **beginnen te**, **vergeten te**, **hopen te**.",
    [("Ik probeer elke dag te wandelen.","Tento caminhar todos os dias."),("Vergeet niet water te drinken!","Não te esqueças de beber água!")])],
  review=["v-sporten","v-slapen","v-groente","v-proberen"],
  cefr=C, exs=[
    MA([("gezond","saudável"),("bewegen","mexer-se"),("voeding","alimentação"),("ongezond","pouco saudável"),("levensstijl","estilo de vida")], "Saúde.", ["v-gezond","v-bewegen","v-voeding","v-ongezond","v-gewoonte-gezond"]),
    WO("Tento comer de forma mais saudável.", ["Ik","probeer","gezonder","te","eten"], "proberen te + inf.", ["v-gezond"]),
    TR("pt-nl","Devias mexer-te meia hora por dia.", ["Je moet elke dag een halfuur bewegen","Je zou elke dag een halfuur moeten bewegen","Je moet elke dag een half uur bewegen"], "bewegen.", ["v-bewegen"]),
    TR("nl-pt","Gezonde voeding is belangrijk.", ["Uma alimentação saudável é importante","A alimentação saudável é importante"], "voeding.", ["v-voeding"]),
    FE(["Ik","probeer","elke","dag","wandelen."], 4, "te wandelen", "proberen pede «te»: Ik probeer elke dag te wandelen.", ["v-proberen"]),
    FE(["Hij","heeft","een","ongezond","levensstijl."], 3, "ongezonde", "de levensstijl → een ongezonde.", ["v-ongezond"]),
    AR("voeding","a alimentação","de", "-ing → de.", ["v-voeding"]),
    LI("Vergeet niet genoeg water te drinken!", ["Vergeet niet genoeg water te drinken"], "Não te esqueças de beber água suficiente!", "vergeten te.", ["v-gezond"]),
    MC("Qual é um hábito ongezond?", ["*Elke dag frituren eten","Elke dag fietsen|Saudável.","Acht uur slapen|Saudável."], "ongezond.", ["v-ongezond"]),
    SW("Descreva 2 hábitos saudáveis seus e 1 que quer mudar.", ["Ik fiets elke dag naar mijn werk en ik eet veel groente. Ik probeer minder suiker te eten."], ["Dois hábitos no presente", "**proberen te** + infinitivo", "Comparativo (minder/meer/gezonder)"], 15, "Hábitos.", ["v-gezond","v-bewegen"]),
  ], diff=4, mins=6)

L(2, "Desporto e atividade física", "lid worden van een club, trainen, een blessure",
  ["Falar de desporto, clubes e lesões"],
  vocab=[V("v-trainen","trainen","treinar","verb"), V("v-blessure","blessure","lesão (desportiva)","noun","de"),
         V("v-vereniging","vereniging","clube|associação","noun","de"), V("v-conditie","conditie","forma física","noun","de")],
  ex=[("Ik train twee keer per week.","Treino duas vezes por semana."),("Ze heeft een blessure aan haar knie.","Ela tem uma lesão no joelho."),("Ik ben lid van een hockeyvereniging.","Sou sócio de um clube de hóquei."),("Mijn conditie is slecht.","A minha forma física é má.")],
  review=["v-sporten","v-lid","v-sportschool","v-voetballen"],
  cefr=C, exs=[
    MA([("trainen","treinar"),("blessure","lesão"),("vereniging","clube"),("conditie","forma física")], "Desporto.", ["v-trainen","v-blessure","v-vereniging","v-conditie"]),
    TR("pt-nl","Treino duas vezes por semana.", ["Ik train twee keer per week"], "keer per week.", ["v-trainen"]),
    TR("pt-nl","Ela tem uma lesão no joelho.", ["Ze heeft een blessure aan haar knie","Zij heeft een blessure aan haar knie"], "blessure aan.", ["v-blessure"]),
    TR("nl-pt","Mijn conditie is slecht.", ["A minha forma física é má","Estou em má forma","Estou fora de forma"], "conditie.", ["v-conditie"]),
    AR("vereniging","o clube","de", "-ing → de.", ["v-vereniging"]),
    MC("Nos Países Baixos, o desporto amador organiza-se sobretudo em…", ["*verenigingen (clubes locais com sócios voluntários)","escolas|Não principalmente.","empresas|Não."], "Cultura de clubes.", ["v-vereniging"]),
    FE(["Ik","heb","een","blessure","op","mijn","enkel."], 4, "aan", "blessure aan.", ["v-blessure"]),
    LI("Ik word lid van de tennisvereniging.", ["Ik word lid van de tennisvereniging"], "Vou fazer-me sócio do clube de ténis.", "lid worden van.", ["v-vereniging","v-lid"]),
    FB("Door mijn ___ kan ik drie weken niet trainen.", ["blessure"], "Lesão.", ["v-blessure"], choices=["blessure","conditie","vereniging"], tr="Por causa da lesão não posso treinar durante três semanas."),
    DL([("Vriend","Ga je mee hardlopen?","Vens correr?"),("Rita","")], ["*Graag, maar mijn conditie is niet zo goed. Rustig aan, oké?","Ik ben een blessure.|Não faz sentido.","Ik train de vereniging.|Não faz sentido."], "Aceitar com ressalva.", ["v-conditie"]),
  ], diff=4, mins=6)

L(3, "Stress e bem-estar", "Ik heb het druk. Ik ben gestrest. Een burn-out.",
  ["Falar de stress, cansaço e equilíbrio"],
  vocab=[V("v-gestrest","gestrest","stressado","adjective"), V("v-burn-out","burn-out","esgotamento (burnout)","noun","de"),
         V("v-ontspanning","ontspanning","descontração|relaxamento","noun","de"), V("v-grens","grens","limite","noun","de",note="je grenzen aangeven = impor limites")],
  ex=[("Ik ben de laatste tijd erg gestrest.","Ultimamente ando muito stressado."),("De werkdruk is te hoog.","A pressão no trabalho é demasiado alta."),("Ze zit thuis met een burn-out.","Está em casa com um esgotamento."),("Je moet je grenzen aangeven.","Tens de impor os teus limites.")],
  review=["v-werkdruk","v-druk-adj","v-moe","v-rust","v-zich-ontspannen"],
  cefr=C, exs=[
    MA([("gestrest","stressado"),("burn-out","esgotamento"),("ontspanning","relaxamento"),("grens","limite"),("werkdruk","pressão no trabalho")], "Bem-estar.", ["v-gestrest","v-burn-out","v-ontspanning","v-grens","v-werkdruk"]),
    TR("pt-nl","Ultimamente ando muito stressado.", ["Ik ben de laatste tijd erg gestrest","Ik ben de laatste tijd heel gestrest","De laatste tijd ben ik erg gestrest"], "de laatste tijd.", ["v-gestrest"]),
    TR("pt-nl","A pressão no trabalho é demasiado alta.", ["De werkdruk is te hoog"], "werkdruk.", ["v-werkdruk"]),
    TR("nl-pt","Je moet je grenzen aangeven.", ["Tens de impor os teus limites","Tens de dizer quais são os teus limites"], "grenzen aangeven.", ["v-grens"]),
    AR("ontspanning","o relaxamento","de", "-ing → de.", ["v-ontspanning"]),
    MC("O que se faz nos Países Baixos com sintomas de burn-out?", ["*Falar com o huisarts e com a bedrijfsarts (médico do trabalho)","Ignorar e trabalhar mais|Não.","Ir logo ao hospital|Normalmente não é a primeira via."], "Huisarts/bedrijfsarts.", ["v-burn-out"]),
    FE(["Ik","ben","heel","gestresd."], 3, "gestrest", "Particípio de stressen: gestrest (s → -t).", ["v-gestrest"]),
    LI("Wat doe jij voor ontspanning?", ["Wat doe jij voor ontspanning","Wat doe je voor ontspanning"], "O que fazes para relaxar?", "ontspanning.", ["v-ontspanning"]),
    DL([("Collega","Kun je dit vandaag nog afmaken?","Consegues acabar isto ainda hoje?"),("Inês","")], ["*Eerlijk gezegd lukt dat niet, ik heb al drie deadlines. Kan het morgen?","Ja, natuurlijk, alles!|Não impõe limites.","Ik ben een burn-out.|Errado: ik heb een burn-out."], "Impor limites com educação.", ["v-grens"]),
    SW("O que faz quando está stressado? (2–3 frases)", ["Als ik gestrest ben, ga ik wandelen in het park. Ik zet ook mijn telefoon uit. Ontspanning is voor mij heel belangrijk."], ["**Als ik gestrest ben**, + inversão", "Duas estratégias", "Vocabulário da lição"], 15, "Estratégias pessoais.", ["v-gestrest","v-ontspanning"]),
  ], diff=4, mins=7)

L(4, "Saúde mental e apoio", "de psycholoog, praten helpt, iemand in vertrouwen nemen",
  ["Falar de apoio emocional de forma simples e respeitosa"],
  vocab=[V("v-psycholoog","psycholoog","psicólogo","noun","de"), V("v-somber","somber","em baixo|triste","adjective"),
         V("v-doorverwijzen","doorverwijzen","encaminhar (médico)","verb",note="De huisarts verwijst je door.")],
  ex=[("Ik voel me de laatste tijd somber.","Ultimamente sinto-me em baixo."),("De huisarts heeft me doorverwezen naar een psycholoog.","O médico de família encaminhou-me para um psicólogo."),("Je vrienden kunnen je steun geven.","Os teus amigos podem dar-te apoio."),("Praten helpt.","Falar ajuda.")],
  gram=[G("g-ggz","Onde procurar ajuda","Para apoio psicológico nos Países Baixos começa-se normalmente pelo **huisarts**, que pode **doorverwijzen** para um **psycholoog**. Em situações urgentes há a linha **113** (prevenção do suicídio, também em inglês) e a **Luisterlijn** (escuta).",
    [("Bel 113 of 0800-0113.","Ligue 113 ou 0800-0113.")])],
  review=["v-steun","v-huisarts","v-zich-zorgen-maken","v-praten-over"],
  cefr=C, exs=[
    MA([("psycholoog","psicólogo"),("somber","em baixo"),("steun","apoio"),("doorverwijzen","encaminhar")], "Apoio.", ["v-psycholoog","v-somber","v-steun","v-doorverwijzen"]),
    TR("pt-nl","Ultimamente sinto-me em baixo.", ["Ik voel me de laatste tijd somber","De laatste tijd voel ik me somber","Ik voel mij de laatste tijd somber"], "zich somber voelen.", ["v-somber"]),
    TR("nl-pt","Praten helpt.", ["Falar ajuda","Conversar ajuda"], "Infinitivo como sujeito.", []),
    TR("nl-pt","De huisarts heeft me doorverwezen naar een psycholoog.", ["O médico de família encaminhou-me para um psicólogo"], "doorverwijzen → doorverwezen.", ["v-doorverwijzen"]),
    MC("Primeiro passo habitual para ter um psicólogo comparticipado:", ["*Ir ao huisarts","Ir diretamente ao hospital|Normalmente não.","Ligar para a polícia|Não."], "Doorverwijzing.", ["v-doorverwijzen"]),
    AR("steun","o apoio","de", "De steun.", ["v-steun"]),
    DL([("Vriendin","Ik slaap slecht en ik heb nergens zin in.","Durmo mal e não me apetece nada."),("Ana","")], ["*Wat vervelend. Wil je erover praten? Misschien kan de huisarts ook helpen.","Niet zeuren.|Desvaloriza.","Ik ook, doei.|Não apoia."], "Mostrar apoio.", ["v-steun"]),
    LI("Je bent niet alleen. Er is altijd iemand die luistert.", ["Je bent niet alleen(.) Er is altijd iemand die luistert"], "Não estás sozinho. Há sempre alguém que ouve.", "Frase de apoio.", ["v-steun"]),
    FE(["Ik","voel","mij","de","laatste","tijd","sombere."], 6, "somber", "Predicativo, sem -e: Ik voel me somber.", ["v-somber"]),
    FB("Ik heb veel ___ aan mijn familie.", ["steun"], "steun hebben aan = ter apoio de.", ["v-steun"], choices=["steun","somber","psycholoog"], tr="A minha família dá-me muito apoio."),
  ], diff=4, mins=6)

L(5, "Seguro de saúde e médico", "het eigen risico, de basisverzekering, aanvullend",
  ["Compreender o seguro de saúde neerlandês"],
  vocab=[V("v-basisverzekering","basisverzekering","seguro básico (obrigatório)","noun","de"), V("v-aanvullend","aanvullend","complementar","adjective"),
         V("v-vergoed-worden","vergoed worden","ser comparticipado","expression"), V("v-zorgtoeslag","zorgtoeslag","subsídio para o seguro de saúde","noun","de")],
  ex=[("Iedereen moet een basisverzekering hebben.","Toda a gente tem de ter seguro básico."),("De tandarts zit in de aanvullende verzekering.","O dentista está no seguro complementar."),("Wordt fysiotherapie vergoed?","A fisioterapia é comparticipada?"),("Met een laag inkomen krijg je zorgtoeslag.","Com um rendimento baixo recebes subsídio de saúde.")],
  review=["v-zorgverzekering","v-eigen-risico","v-premie","v-huisarts"],
  cefr=C, exs=[
    MA([("basisverzekering","seguro básico"),("aanvullend","complementar"),("vergoed worden","ser comparticipado"),("zorgtoeslag","subsídio de saúde")], "Seguro.", ["v-basisverzekering","v-aanvullend","v-vergoed-worden","v-zorgtoeslag"]),
    TR("pt-nl","A fisioterapia é comparticipada?", ["Wordt fysiotherapie vergoed","Wordt de fysiotherapie vergoed"], "vergoed worden.", ["v-vergoed-worden"]),
    TR("nl-pt","Iedereen moet een basisverzekering hebben.", ["Toda a gente tem de ter seguro básico","Todos têm de ter um seguro básico"], "basisverzekering.", ["v-basisverzekering"]),
    MC("O «eigen risico» aplica-se ao huisarts?", ["*Não, a consulta do huisarts não conta para o eigen risico","Sim, sempre|Não.","Só ao fim de semana|Não."], "Regra conhecida.", ["v-eigen-risico"]),
    MC("O dentista para adultos está normalmente…", ["*no seguro complementar (aanvullend)","no seguro básico|Para adultos, quase nunca.","grátis|Não."], "Aanvullend.", ["v-aanvullend"]),
    FE(["De","fysiotherapie","wordt","niet","vergoedt."], 4, "vergoed", "Particípio de vergoeden: vergoed (sem -t extra).", ["v-vergoed-worden"]),
    AR("zorgtoeslag","o subsídio de saúde","de", "De toeslag.", ["v-zorgtoeslag"]),
    CO("text","Je zorgverzekering", "In Nederland ben je verplicht een basisverzekering af te sluiten. Die betaalt onder andere de huisarts, het ziekenhuis en medicijnen. Je betaalt elke maand premie en per jaar een eigen risico (in 2025: € 385). Voor de tandarts, fysiotherapie of een bril kun je een aanvullende verzekering nemen. Met een laag inkomen kun je zorgtoeslag aanvragen bij de Belastingdienst.",
       [("O que paga o seguro básico, por exemplo?", ["*Médico de família, hospital e medicamentos","Óculos","Dentista para adultos"]),("Onde se pede a zorgtoeslag?", ["*Na Belastingdienst","No huisarts","No hospital"])],
       "afsluiten = contratar (um seguro).", ["v-basisverzekering","v-zorgtoeslag"]),
    LI("Ik wil een aanvullende verzekering voor de tandarts.", ["Ik wil een aanvullende verzekering voor de tandarts"], "Quero um seguro complementar para o dentista.", "aanvullend.", ["v-aanvullend"]),
    WO("Com um rendimento baixo recebes subsídio de saúde.", ["Met","een","laag","inkomen","krijg","je","zorgtoeslag"], "Inversão.", ["v-zorgtoeslag"]),
  ], diff=4, mins=7)

W()
