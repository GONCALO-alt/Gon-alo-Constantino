import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u04")
C = "A2"

L(1, "Lugares da cidade", "o centro, o mercado, a biblioteca, a câmara.",
  ["Nomear lugares públicos"],
  vocab=[V("v-centrum","centrum","centro","noun","het"), V("v-markt","markt","mercado","noun","de","markten"), V("v-bibliotheek","bibliotheek","biblioteca","noun","de"),
         V("v-gemeentehuis","gemeentehuis","câmara municipal","noun","het",note="Também «het stadhuis»."), V("v-postkantoor","postkantoor","posto dos correios","noun","het"), V("v-park","park","parque","noun","het","parken")],
  ex=[("Op zaterdag is er markt.","Ao sábado há mercado."),("Ik leen boeken in de bibliotheek.","Requisito livros na biblioteca."),("Het gemeentehuis is in het centrum.","A câmara municipal fica no centro.")],
  review=["v-stad","v-plein","v-kerk"],
  cefr=C, exs=[
    MA([("centrum","centro"),("markt","mercado"),("bibliotheek","biblioteca"),("gemeentehuis","câmara municipal"),("park","parque")], "Cidade.", ["v-centrum","v-markt","v-bibliotheek","v-gemeentehuis","v-park"]),
    AR("centrum","o centro","het", "«Het centrum».", ["v-centrum"]),
    AR("gemeentehuis","a câmara municipal","het", "huis → het.", ["v-gemeentehuis"]),
    AR("bibliotheek","a biblioteca","de", "«De bibliotheek».", ["v-bibliotheek"]),
    TR("pt-nl","Ao sábado há mercado.", ["Op zaterdag is er markt","Op zaterdag is er een markt"], "er is.", ["v-markt"]),
    TR("nl-pt","Het gemeentehuis is in het centrum.", ["A câmara municipal [é|fica] no centro"], "in het centrum.", ["v-gemeentehuis","v-centrum"]),
    FB("Ik leen een boek in de ___.", ["bibliotheek"], "Requisitar livros.", ["v-bibliotheek"], choices=["bibliotheek","markt","park"], tr="Requisito um livro na biblioteca."),
    LI("We wandelen in het park.", ["We wandelen in het park"], "Passeamos no parque.", "het park.", ["v-park"]),
    FE(["Het","postkantoor","zijn","dicht."], 2, "is", "Singular: is.", ["v-postkantoor"]),
    WO("O mercado é na praça.", ["De","markt","is","op","het","plein"], "op het plein.", ["v-markt"]),
  ], diff=2, mins=5)

L(2, "O meu bairro", "de buurt, de buren, het winkelcentrum, rustig of druk.",
  ["Descrever o bairro onde vive"],
  vocab=[V("v-buurt","buurt","bairro|vizinhança","noun","de"), V("v-winkelcentrum","winkelcentrum","centro comercial","noun","het"),
         V("v-speeltuin","speeltuin","parque infantil","noun","de"), V("v-veilig","veilig","seguro","adjective"), V("v-wijk","wijk","bairro (zona)","noun","de")],
  ex=[("Ik woon in een rustige buurt.","Vivo num bairro sossegado."),("Er is een winkelcentrum in de wijk.","Há um centro comercial no bairro."),("De buurt is veilig voor kinderen.","O bairro é seguro para crianças.")],
  review=["v-rustig","v-druk","v-buurman","v-er-is"],
  cefr=C, exs=[
    MA([("buurt","vizinhança"),("winkelcentrum","centro comercial"),("speeltuin","parque infantil"),("veilig","seguro"),("wijk","bairro")], "Bairro.", ["v-buurt","v-winkelcentrum","v-speeltuin","v-veilig","v-wijk"]),
    TR("pt-nl","Vivo num bairro sossegado.", ["Ik woon in een rustige [buurt|wijk]"], "de buurt → rustige.", ["v-buurt","v-rustig"]),
    TR("nl-pt","De buurt is veilig voor kinderen.", ["O bairro é seguro para (as )crianças"], "veilig.", ["v-veilig"]),
    AR("winkelcentrum","o centro comercial","het", "centrum → het.", ["v-winkelcentrum"]),
    FE(["Er","zijn","een","speeltuin","in","mijn","wijk."], 1, "is", "Singular: er is een speeltuin.", ["v-speeltuin"]),
    FB("Mijn buurt is heel ___: er zijn veel winkels en auto's.", ["druk"], "druk = movimentado.", ["v-druk"], choices=["druk","rustig","veilig"], tr="O meu bairro é muito movimentado: há muitas lojas e carros."),
    LI("Wat vind je van je nieuwe buurt?", ["Wat vind je van je nieuwe buurt"], "O que achas do teu novo bairro?", "vinden van.", ["v-buurt"]),
    DL([("Colega","Woon je in een leuke buurt?","Vives num bairro giro?"),("Você","")], ["*Ja, het is rustig en er is een mooi park.","Ja, ik ben de buurt.|Não faz sentido.","Nee, ik heb een buurt.|Não responde."], "Descrição.", ["v-buurt"]),
    WO("No meu bairro há muitas lojas.", ["In","mijn","wijk","zijn","veel","winkels"], "Inversão: zijn (er) veel winkels.", ["v-wijk"]),
    CO("text","O bairro do Pedro", "Pedro woont in een nieuwe wijk aan de rand van Utrecht. Het is er rustig en veilig. Er is een groot park met een speeltuin en een winkelcentrum met een supermarkt. Het centrum is twintig minuten fietsen.",
       [("Onde fica o bairro?", ["*Na periferia de Utrecht","No centro","Noutra cidade"]),("A que distância fica o centro?", ["*20 minutos de bicicleta","5 minutos a pé","Uma hora de comboio"])],
       "aan de rand van = na periferia de.", ["v-wijk","v-veilig"]),
  ], diff=2, mins=5)

L(3, "Horários de abertura", "open, gesloten, openingstijden, koopavond.",
  ["Perceber horários de abertura"],
  vocab=[V("v-gesloten","gesloten","fechado","adjective"), V("v-openingstijden","openingstijden","horário de abertura","noun","de"),
         V("v-koopavond","koopavond","noite de compras","noun","de",note="Um dia por semana as lojas fecham mais tarde (normalmente quinta ou sexta)."), V("v-alleen","alleen","só|sozinho","adverb")],
  ex=[("Op zondag is de winkel gesloten.","Ao domingo a loja está fechada."),("Wat zijn de openingstijden?","Qual é o horário de abertura?"),("Donderdag is het koopavond.","Quinta-feira é dia de compras à noite.")],
  review=["v-open","v-dicht","v-tot","v-van"],
  cefr=C, exs=[
    MA([("gesloten","fechado"),("openingstijden","horário de abertura"),("koopavond","noite de compras"),("alleen","só")], "Horários.", ["v-gesloten","v-openingstijden","v-koopavond","v-alleen"]),
    TR("pt-nl","Ao domingo a loja está fechada.", ["Op zondag is de winkel gesloten","Op zondag is de winkel dicht"], "gesloten/dicht.", ["v-gesloten"]),
    TR("pt-nl","Qual é o horário de abertura?", ["Wat zijn de openingstijden"], "Plural: zijn.", ["v-openingstijden"]),
    TR("nl-pt","Alleen op zaterdag open.", ["Só abre ao sábado","Aberto só ao sábado"], "alleen = só.", ["v-alleen"]),
    MC("Uma loja com «Ma t/m za: 9.00 – 18.00» abre…", ["*De segunda a sábado, das 9 às 18","Só à segunda e ao sábado|t/m = tot en met (até, inclusive).","Ao domingo|Não."], "t/m = até (inclusive).", ["v-openingstijden"]),
    FE(["De","bibliotheek","is","op","maandag","geslot."], 5, "gesloten", "gesloten.", ["v-gesloten"]),
    LI("Is de apotheek vandaag open?", ["Is de apotheek vandaag open"], "A farmácia está aberta hoje?", "open.", ["v-open"]),
    FB("Op ___ zijn de winkels tot negen uur open.", ["koopavond"], "Noite de compras.", ["v-koopavond"], choices=["koopavond","gesloten","maandag"], tr="Na noite de compras as lojas estão abertas até às nove."),
    CO("text","Placa na porta", "Openingstijden Bakkerij Jansen\nMaandag: gesloten\nDinsdag t/m vrijdag: 8.00 – 18.00\nZaterdag: 8.00 – 16.00\nZondag: gesloten",
       [("Em que dias está fechada?", ["*Segunda e domingo","Só domingo","Sábado e domingo"]),("A que horas fecha ao sábado?", ["*Às 16h","Às 18h","Às 8h"])],
       "t/m = até (inclusive).", ["v-openingstijden","v-gesloten"]),
    WO("O museu só está aberto à tarde.", ["Het","museum","is","alleen","'s","middags","open"], "alleen + tempo.", ["v-alleen"]),
  ], diff=2, mins=5)

L(4, "Atividades na cidade", "naar het museum, de dierentuin, het theater, een rondvaart.",
  ["Falar de atividades culturais e de lazer na cidade"],
  vocab=[V("v-museum","museum","museu","noun","het","musea"), V("v-dierentuin","dierentuin","jardim zoológico","noun","de"),
         V("v-theater","theater","teatro","noun","het"), V("v-rondvaart","rondvaart","passeio de barco","noun","de",note="Nos canais: een rondvaart door de grachten."), V("v-bezoeken","bezoeken","visitar","verb")],
  ex=[("We bezoeken het Rijksmuseum.","Visitamos o Rijksmuseum."),("Een rondvaart door de grachten.","Um passeio de barco pelos canais."),("De kinderen willen naar de dierentuin.","As crianças querem ir ao jardim zoológico.")],
  review=["v-gaan","v-willen","v-bioscoop","v-concert"],
  cefr=C, exs=[
    MA([("museum","museu"),("dierentuin","jardim zoológico"),("theater","teatro"),("rondvaart","passeio de barco"),("bezoeken","visitar")], "Lazer.", ["v-museum","v-dierentuin","v-theater","v-rondvaart","v-bezoeken"]),
    MC("Plural de «museum»:", ["*musea (ou museums)","museumen|Não existe.","museums|Também se usa, mas «musea» é a forma clássica."], "museum → musea/museums.", ["v-museum"]),
    TR("pt-nl","Visitamos o museu.", ["We bezoeken het museum","Wij bezoeken het museum","We gaan naar het museum"], "bezoeken.", ["v-bezoeken","v-museum"]),
    TR("nl-pt","Een rondvaart door de grachten.", ["Um passeio de barco pelos canais"], "door = através de.", ["v-rondvaart"]),
    AR("theater","o teatro","het", "«Het theater».", ["v-theater"]),
    CJ("bezoeken","jullie","___ jullie morgen de dierentuin?", ["Bezoeken"], "jullie + infinitivo.", ["v-bezoeken"]),
    FE(["We","gaan","naar","de","museum."], 3, "het", "het museum.", ["v-museum"]),
    LI("Zullen we een rondvaart maken?", ["Zullen we een rondvaart maken"], "Vamos dar um passeio de barco?", "een rondvaart maken.", ["v-rondvaart"]),
    DL([("Eva","Wat zullen we zondag doen?","O que fazemos no domingo?"),("Tom","")], ["*Laten we naar de dierentuin gaan!","Ik ben zondag.|Não responde.","Het museum is gesloten maandag.|Não propõe nada."], "Laten we… = vamos…", ["v-dierentuin"]),
    WO("Quero ver uma peça no teatro.", ["Ik","wil","een","voorstelling","in","het","theater","zien"], "Infinitivo no fim.", ["v-theater"]),
  ], diff=2, mins=5)

L(5, "Um dia na cidade", "Revisão: lugares, direções e horários.",
  ["Planear um dia numa cidade neerlandesa"],
  ex=[("'s Ochtends gaan we naar de markt, 's middags naar het museum en 's avonds naar het theater.","De manhã vamos ao mercado, à tarde ao museu e à noite ao teatro.")],
  review=["v-markt","v-museum","v-centrum","v-gesloten","v-openingstijden","v-rondvaart","v-bezoeken","v-buurt"],
  cefr=C, exs=[
    TR("pt-nl","De manhã vamos ao mercado.", ["'s [Ochtends|ochtends|Morgens|morgens] gaan we naar de markt"], "Inversão.", ["v-markt"]),
    MC("O museu está «gesloten» à segunda. Então…", ["*Não pode visitá-lo à segunda","Está aberto até tarde|gesloten = fechado.","É grátis|Não."], "gesloten = fechado.", ["v-gesloten"]),
    TR("nl-pt","Waar is het centrum?", ["Onde é o centro"], "het centrum.", ["v-centrum"]),
    FE(["We","bezoek","het","museum","morgen."], 1, "bezoeken", "Plural: we bezoeken.", ["v-bezoeken"]),
    LI("Het museum is open van tien tot vijf.", ["Het museum is open van tien tot vijf"], "O museu está aberto das dez às cinco.", "van … tot.", ["v-museum"]),
    CO("text","Um dia em Leiden", "Ana en Pedro gaan een dag naar Leiden. 's Ochtends bezoeken ze de markt op het plein. Daarna lunchen ze in een café aan de gracht. 's Middags gaan ze naar het museum, maar het is gesloten! Dus maken ze een rondvaart door de grachten.",
       [("Onde almoçam?", ["*Num café junto ao canal","No museu","Em casa"]),("Porque não vão ao museu?", ["*Está fechado","É caro","Não gostam"]),("O que fazem em vez disso?", ["*Um passeio de barco","Vão ao zoológico","Voltam para casa"])],
       "Dus = portanto.", ["v-gesloten","v-rondvaart"]),
    MA([("markt","mercado"),("museum","museu"),("bibliotheek","biblioteca"),("park","parque")], "Lugares.", ["v-markt","v-museum","v-bibliotheek","v-park"]),
    WO("Visitamos a cidade a pé.", ["We","bezoeken","de","stad","te","voet"], "te voet = a pé.", ["v-bezoeken"]),
    FB("De winkels zijn op zondag vaak ___.", ["gesloten","dicht"], "fechadas.", ["v-gesloten"], choices=["gesloten","open","koopavond"], tr="Ao domingo as lojas estão muitas vezes fechadas."),
    SW("Planeie um dia numa cidade: três lugares e quando vai a cada um.", ["'s [Ochtends|ochtends] ga ik naar de markt(.) 's [Middags|middags] bezoek ik het museum(.) 's [Avonds|avonds] ga ik naar het theater"],
       ["Três lugares com o artigo certo","Partes do dia ('s ochtends, 's middags, 's avonds)","Inversão depois da expressão de tempo"], 12, "Compare com o modelo.", ["v-bezoeken"]),
  ], diff=2, mins=6)

W()
