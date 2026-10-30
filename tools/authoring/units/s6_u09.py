import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u09")
C = "B1-B2"

L(1, "Expressões no trabalho", "de kat de bel aanbinden, met de deur in huis vallen, iets op de lange baan schuiven",
  ["Usar expressões idiomáticas frequentes no contexto profissional"],
  vocab=[V("v-deur-in-huis","met de deur in huis vallen","ir direto ao assunto","expression"), V("v-lange-baan","iets op de lange baan schuiven","adiar indefinidamente","expression"),
         V("v-kat-de-bel","de kat de bel aanbinden","ser o primeiro a tocar num assunto delicado","expression"), V("v-knoop-doorhakken","de knoop doorhakken","tomar uma decisão (difícil)","expression")],
  ex=[("Ik val maar meteen met de deur in huis: we moeten bezuinigen.","Vou direto ao assunto: temos de cortar custos."),("Het project is op de lange baan geschoven.","O projeto foi adiado indefinidamente."),("Wie durft de kat de bel aan te binden?","Quem se atreve a tocar no assunto?"),("We moeten nu de knoop doorhakken.","Temos agora de tomar uma decisão.")],
  gram=[G("g-idioom-werkwoord","Expressões com verbo separável","Muitas expressões contêm verbos separáveis — conjugue normalmente: *Ik **hak** de knoop **door**. Ze **heeft** de knoop **doorgehakt**. Wie **bindt** de kat de bel **aan**?*",
    [("Na lang twijfelen hakte ze de knoop door.","Depois de muito hesitar, ela decidiu-se.")])],
  review=["v-besluit","v-vergadering"],
  cefr=C, exs=[
    MA([("met de deur in huis vallen","ir direto ao assunto"),("op de lange baan schuiven","adiar indefinidamente"),("de kat de bel aanbinden","tocar primeiro no assunto delicado"),("de knoop doorhakken","tomar a decisão")], "Trabalho.", ["v-deur-in-huis","v-lange-baan","v-kat-de-bel","v-knoop-doorhakken"]),
    EX("met de deur in huis vallen","cair com a porta dentro de casa","O chefe começa a reunião: «Ik val maar met de deur in huis…». Ele vai…", ["*dizer logo o assunto principal sem rodeios","partir uma porta|Literal.","chegar atrasado|Não."], "Direto.", ["v-deur-in-huis"]),
    EX("de knoop doorhakken","cortar o nó","Depois de semanas a hesitar entre dois empregos, a Sara «hakte de knoop door». Ela…", ["*finalmente decidiu","desistiu dos dois|Não necessariamente.","cortou o cabelo|Literal."], "Decidir.", ["v-knoop-doorhakken"]),
    EX("iets op de lange baan schuiven","empurrar algo para a pista longa","«De renovatie van het station is op de lange baan geschoven.»", ["*Foi adiada sem data","Foi acelerada|Ao contrário.","Foi feita numa pista|Literal."], "Adiar.", ["v-lange-baan"]),
    TR("pt-nl","Depois de muito hesitar, ela decidiu-se.", ["Na lang twijfelen hakte ze de knoop door","Na lang twijfelen heeft ze de knoop doorgehakt"], "Separável no passado: hakte … door.", ["v-knoop-doorhakken"]),
    TR("pt-nl","Temos agora de tomar uma decisão.", ["We moeten nu de knoop doorhakken","We moeten nu een beslissing nemen"], "Expressão.", ["v-knoop-doorhakken"]),
    TR("nl-pt","Wie durft de kat de bel aan te binden?", ["Quem se atreve a tocar no assunto","Quem tem coragem de falar primeiro sobre isso"], "Expressão.", ["v-kat-de-bel"]),
    FE(["We","hebben","de","knoop","doorgehakken."], 4, "doorgehakt", "Particípio: doorgehakt.", ["v-knoop-doorhakken"]),
    LI("Ik val maar meteen met de deur in huis.", ["Ik val maar meteen met de deur in huis"], "Vou direto ao assunto.", "Expressão.", ["v-deur-in-huis"]),
    MC("Qual expressão usaria para anunciar sem rodeios um despedimento coletivo?", ["*Ik val maar met de deur in huis.","De kat uit de boom kijken.|Esperar para ver.","Een eitje.|Fácil."], "Contexto.", ["v-deur-in-huis"]),
  ], diff=5, mins=7)

L(2, "Expressões com dinheiro e esforço", "de eindjes aan elkaar knopen, de handen uit de mouwen steken",
  ["Compreender expressões ligadas a dinheiro e esforço"],
  vocab=[V("v-eindjes","de eindjes aan elkaar knopen","esticar o dinheiro até ao fim do mês","expression"), V("v-handen-uit-de-mouwen","de handen uit de mouwen steken","arregaçar as mangas","expression"),
         V("v-op-rozen","op rozen zitten","estar numa situação ótima","expression"), V("v-tegen-de-lamp","tegen de lamp lopen","ser apanhado","expression")],
  ex=[("Veel gezinnen kunnen de eindjes nauwelijks aan elkaar knopen.","Muitas famílias mal conseguem chegar ao fim do mês."),("Iedereen stak de handen uit de mouwen.","Toda a gente arregaçou as mangas."),("Met die nieuwe baan zit ze op rozen.","Com esse emprego novo ela está ótima."),("De dief liep tegen de lamp.","O ladrão foi apanhado.")],
  review=["v-geld","v-salaris"],
  cefr=C, exs=[
    MA([("de eindjes aan elkaar knopen","chegar ao fim do mês"),("de handen uit de mouwen steken","arregaçar as mangas"),("op rozen zitten","estar ótimo"),("tegen de lamp lopen","ser apanhado")], "Expressões.", ["v-eindjes","v-handen-uit-de-mouwen","v-op-rozen","v-tegen-de-lamp"]),
    EX("de eindjes aan elkaar knopen","atar as pontinhas umas às outras","«Met een minimumloon is het moeilijk om de eindjes aan elkaar te knopen.»", ["*É difícil chegar ao fim do mês com o dinheiro","É difícil fazer nós|Literal.","É fácil poupar|Ao contrário."], "Dinheiro apertado.", ["v-eindjes"]),
    EX("de handen uit de mouwen steken","tirar as mãos das mangas","Depois da inundação, os vizinhos «staken de handen uit de mouwen». Eles…", ["*começaram a trabalhar juntos para ajudar","vestiram camisolas|Literal.","foram embora|Não."], "Esforço.", ["v-handen-uit-de-mouwen"]),
    EX("tegen de lamp lopen","ir contra o candeeiro","«De fraudeur liep na drie jaar tegen de lamp.»", ["*Foi apanhado","Teve um acidente com um candeeiro|Literal.","Ficou rico|Não."], "Ser apanhado.", ["v-tegen-de-lamp"]),
    TR("pt-nl","Toda a gente arregaçou as mangas.", ["Iedereen stak de handen uit de mouwen"], "Passado: stak.", ["v-handen-uit-de-mouwen"]),
    TR("nl-pt","Met die nieuwe baan zit ze op rozen.", ["Com esse emprego novo ela está ótima","Com esse emprego novo está numa situação ótima","Com esse novo emprego está bem na vida"], "op rozen zitten.", ["v-op-rozen"]),
    FE(["Hij","liep","tegen","de","lampje."], 4, "lamp", "A expressão é «tegen de lamp lopen».", ["v-tegen-de-lamp"]),
    LI("Veel studenten kunnen de eindjes nauwelijks aan elkaar knopen.", ["Veel studenten kunnen de eindjes nauwelijks aan elkaar knopen"], "Muitos estudantes mal conseguem chegar ao fim do mês.", "Expressão.", ["v-eindjes"]),
    MC("Qual expressão descreve alguém com um emprego excelente e bem pago?", ["*Hij zit op rozen.","Hij loopt tegen de lamp.|Ser apanhado.","Hij knoopt de eindjes aan elkaar.|Dinheiro apertado."], "Contexto.", ["v-op-rozen"]),
    SW("Use duas expressões desta lição num pequeno texto sobre um estudante (2–3 frases).", ["Mijn neef studeert in Amsterdam en kan de eindjes nauwelijks aan elkaar knopen. Daarom steekt hij in het weekend de handen uit de mouwen in een restaurant."], ["Duas expressões corretas", "Conjugação certa", "Sentido coerente"], 25, "Expressões em contexto.", ["v-eindjes","v-handen-uit-de-mouwen"]),
  ], diff=5, mins=7)

L(3, "Expressões de opinião e discussão", "de spijker op de kop slaan, door de bocht gaan, water bij de wijn doen",
  ["Usar expressões em discussões"],
  vocab=[V("v-spijker-op-de-kop","de spijker op de kop slaan","acertar em cheio","expression"), V("v-water-bij-de-wijn","water bij de wijn doen","ceder|fazer concessões","expression"),
         V("v-door-de-bocht","door de bocht gaan","exagerar|passar das marcas","expression"), V("v-op-een-lijn","op één lijn zitten","estar de acordo","expression")],
  ex=[("Je slaat de spijker op de kop!","Acertaste em cheio!"),("Beide partijen moeten water bij de wijn doen.","Ambas as partes têm de fazer concessões."),("Die opmerking ging echt door de bocht.","Aquele comentário passou mesmo das marcas."),("Gelukkig zitten we op één lijn.","Felizmente estamos de acordo.")],
  review=["v-compromis","v-eens","v-concessie"],
  cefr=C, exs=[
    MA([("de spijker op de kop slaan","acertar em cheio"),("water bij de wijn doen","fazer concessões"),("door de bocht gaan","passar das marcas"),("op één lijn zitten","estar de acordo")], "Discussão.", ["v-spijker-op-de-kop","v-water-bij-de-wijn","v-door-de-bocht","v-op-een-lijn"]),
    EX("water bij de wijn doen","pôr água no vinho","Numa negociação salarial: «Beide partijen moeten water bij de wijn doen.»", ["*Ambos têm de ceder um pouco","Ambos bebem vinho|Literal.","Ninguém cede|Ao contrário."], "Concessões.", ["v-water-bij-de-wijn"]),
    EX("de spijker op de kop slaan","acertar o prego na cabeça","Um colega resume o problema perfeitamente. Diz-lhe…", ["*Je slaat de spijker op de kop!","Je gaat door de bocht!|Exagerar.","Je doet water bij de wijn!|Ceder."], "Acertar.", ["v-spijker-op-de-kop"]),
    EX("door de bocht gaan","sair na curva","«Die grap over zijn uiterlijk ging echt door de bocht.»", ["*A piada passou das marcas","A piada era sobre carros|Literal.","A piada era muito boa|Não."], "Exagero.", ["v-door-de-bocht"]),
    TR("pt-nl","Felizmente estamos de acordo.", ["Gelukkig zitten we op één lijn","Gelukkig zitten wij op één lijn","Gelukkig zijn we het eens"], "op één lijn.", ["v-op-een-lijn"]),
    TR("nl-pt","Je slaat de spijker op de kop!", ["Acertaste em cheio","Acertaste mesmo","É isso mesmo"], "Expressão.", ["v-spijker-op-de-kop"]),
    FE(["We","moeten","bier","bij","de","wijn","doen."], 2, "water", "A expressão é «water bij de wijn doen».", ["v-water-bij-de-wijn"]),
    LI("Volgens mij ging die opmerking te ver, die ging echt door de bocht.", ["Volgens mij ging die opmerking te ver(,) die ging echt door de bocht"], "Na minha opinião aquele comentário foi longe demais, passou mesmo das marcas.", "door de bocht.", ["v-door-de-bocht"]),
    FB("Na een lang gesprek zaten we eindelijk op één ___.", ["lijn"], "Expressão.", ["v-op-een-lijn"], choices=["lijn","weg","punt"], tr="Depois de uma longa conversa finalmente estávamos de acordo."),
    MC("Qual expressão indica concordância?", ["*op één lijn zitten","door de bocht gaan|Exagero.","tegen de lamp lopen|Ser apanhado."], "Acordo.", ["v-op-een-lijn"]),
  ], diff=5, mins=7)

L(4, "Expressões com tempo e sorte", "met de neus in de boter vallen, achter het net vissen, iets uit je duim zuigen",
  ["Compreender expressões de sorte, azar e invenção"],
  vocab=[V("v-neus-in-de-boter","met de neus in de boter vallen","chegar na altura certa (ter sorte)","expression"), V("v-achter-het-net","achter het net vissen","chegar tarde demais (perder a oportunidade)","expression"),
         V("v-uit-je-duim","iets uit je duim zuigen","inventar algo","expression"), V("v-mazzel","mazzel","sorte (coloquial)","noun","de")],
  ex=[("We kwamen net op tijd voor het feest: met de neus in de boter!","Chegámos mesmo a tempo da festa: em cheio!"),("De kaartjes waren uitverkocht, we visten achter het net.","Os bilhetes esgotaram, chegámos tarde demais."),("Dat verhaal heeft hij uit zijn duim gezogen.","Ele inventou essa história."),("Wat een mazzel!","Que sorte!")],
  review=["v-geluk","v-op-tijd"],
  cefr=C, exs=[
    MA([("met de neus in de boter vallen","chegar na altura certa"),("achter het net vissen","chegar tarde demais"),("iets uit je duim zuigen","inventar"),("mazzel","sorte")], "Sorte e azar.", ["v-neus-in-de-boter","v-achter-het-net","v-uit-je-duim","v-mazzel"]),
    EX("achter het net vissen","pescar atrás da rede","Quis comprar a casa, mas já tinha sido vendida. Ele…", ["*viste achter het net (chegou tarde demais)","viel met de neus in de boter|Seria sorte.","zoog het uit zijn duim|Inventar."], "Tarde demais.", ["v-achter-het-net"]),
    EX("met de neus in de boter vallen","cair com o nariz na manteiga","Chega a casa de amigos mesmo quando servem o bolo. Está a…", ["*cair com o nariz na manteiga (sorte de chegar na hora certa)","pescar atrás da rede|Azar.","ser apanhado|Não."], "Sorte.", ["v-neus-in-de-boter"]),
    EX("iets uit je duim zuigen","chupar algo do polegar","«Die cijfers heeft de journalist uit zijn duim gezogen.»", ["*Os números foram inventados","Os números são exatos|Ao contrário.","O jornalista estava doente|Literal."], "Inventar.", ["v-uit-je-duim"]),
    TR("pt-nl","Que sorte!", ["Wat een mazzel","Wat een geluk","Wat een bof"], "mazzel/geluk.", ["v-mazzel"]),
    TR("nl-pt","Dat verhaal heeft hij uit zijn duim gezogen.", ["Ele inventou essa história","Essa história foi inventada por ele"], "Expressão.", ["v-uit-je-duim"]),
    FE(["Hij","heeft","het","uit","zijn","vinger","gezogen."], 5, "duim", "A expressão é «uit je duim zuigen».", ["v-uit-je-duim"]),
    LI("Wat een mazzel dat je er nog een kaartje bij had!", ["Wat een mazzel dat je er nog een kaartje bij had"], "Que sorte teres ainda um bilhete a mais!", "mazzel.", ["v-mazzel"]),
    FB("De aanbieding was al voorbij, dus we visten achter het ___.", ["net"], "Expressão.", ["v-achter-het-net"], choices=["net","water","huis"], tr="A promoção já tinha acabado, por isso chegámos tarde demais."),
    AR("mazzel","a sorte","de", "De mazzel.", ["v-mazzel"]),
  ], diff=5, mins=7)

L(5, "Usar expressões com naturalidade", "Quando usar e quando evitar.",
  ["Integrar expressões idiomáticas de forma natural e adequada"],
  vocab=[V("v-gezegde","gezegde","expressão (feita)","noun","het"), V("v-letterlijk","letterlijk","literal(mente)","adjective"),
         V("v-figuurlijk","figuurlijk","figurado|em sentido figurado","adjective")],
  ex=[("Dat is een bekend gezegde.","É uma expressão conhecida."),("Je moet het niet letterlijk nemen.","Não deves levar isso à letra."),("In figuurlijke zin betekent het iets anders.","Em sentido figurado significa outra coisa."),("Die uitdrukking is een beetje ouderwets.","Essa expressão é um bocado antiquada.")],
  review=["v-ouderwets","v-deur-in-huis","v-knoop-doorhakken","v-water-bij-de-wijn","v-spijker-op-de-kop","v-eindjes"],
  cefr=C, exs=[
    MA([("gezegde","expressão feita"),("letterlijk","literal"),("figuurlijk","figurado"),("ouderwets","antiquado")], "Expressões.", ["v-gezegde","v-letterlijk","v-figuurlijk","v-ouderwets"]),
    MC("Numa entrevista de emprego, qual expressão é adequada?", ["*Ik steek graag de handen uit de mouwen.","Ik zit op rozen.|Inadequado no contexto.","Ik loop vaak tegen de lamp.|Prejudica."], "Contexto profissional.", ["v-handen-uit-de-mouwen"]),
    MC("Qual expressão se adequa a: «O gestor finalmente escolheu o fornecedor»?", ["*Hij heeft de knoop doorgehakt.","Hij viste achter het net.|Tarde demais.","Hij viel met de deur in huis.|Direto."], "Decidir.", ["v-knoop-doorhakken"]),
    MC("Qual se adequa a: «Os dois partidos chegaram a acordo depois de cedências»?", ["*Ze hebben water bij de wijn gedaan.","Ze gingen door de bocht.|Exagero.","Ze zogen het uit hun duim.|Inventar."], "Concessões.", ["v-water-bij-de-wijn"]),
    TR("pt-nl","Não deves levar isso à letra.", ["Je moet het niet letterlijk nemen"], "letterlijk.", ["v-letterlijk"]),
    TR("nl-pt","Die uitdrukking is een beetje ouderwets.", ["Essa expressão é um bocado antiquada","Essa expressão está um pouco fora de moda"], "ouderwets.", ["v-ouderwets"]),
    AR("gezegde","a expressão feita","het", "Het gezegde.", ["v-gezegde"]),
    FE(["Je","slaat","de","spijker","op","het","hoofd!"], 6, "kop", "A expressão é «op de kop».", ["v-spijker-op-de-kop"]),
    LI("Neem het niet letterlijk, het is figuurlijk bedoeld.", ["Neem het niet letterlijk(,) het is figuurlijk bedoeld"], "Não leves à letra, é em sentido figurado.", "letterlijk/figuurlijk.", ["v-letterlijk","v-figuurlijk"]),
    SW("Escreva um pequeno e-mail a um colega sobre uma reunião difícil, usando duas expressões desta unidade.", ["Hoi Sanne, de vergadering was lastig. De directeur viel meteen met de deur in huis: er moet bezuinigd worden. Uiteindelijk hebben beide afdelingen water bij de wijn gedaan. Groet, Rui"], ["Duas expressões adequadas", "Registo neutro de e-mail", "Conjugação certa"], 30, "Expressões em contexto real.", ["v-deur-in-huis","v-water-bij-de-wijn"]),
  ], diff=5, mins=8)

W()
