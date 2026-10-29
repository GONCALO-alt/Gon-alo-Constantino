import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u03")
C = "A2"

L(1, "Pedir direções com educação", "Pardon, weet u waar … is? Hoe kom ik bij…?",
  ["Pedir direções de forma educada"],
  vocab=[V("v-hoe-kom-ik","hoe kom ik bij","como chego a","expression"), V("v-de-weg-vragen","de weg vragen","pedir direções","expression"),
         V("v-in-de-buurt","in de buurt","perto|nas redondezas","expression"), V("v-ergens","ergens","em algum lado","adverb")],
  ex=[("Pardon, weet u waar het museum is?","Desculpe, sabe onde é o museu?"),("Hoe kom ik bij het station?","Como chego à estação?"),("Is er een apotheek in de buurt?","Há uma farmácia aqui perto?")],
  gram=[G("g-weet-u-waar","Perguntas indiretas","Mais educado do que «Waar is…?» é **Weet u waar … is?** Repare: na pergunta indireta o **verbo vai para o fim**: *Weet u waar het station **is**?* (Veremos mais sobre isto nas orações subordinadas.)",
    [("Weet jij waar de wc is?","Sabes onde é a casa de banho?")],
    "Em português «Sabe onde é o museu?» mantém a ordem; em neerlandês o verbo vai para o fim da pergunta indireta.")],
  review=["v-pardon","v-waar","v-weten","v-zoeken"],
  cefr=C, exs=[
    MA([("hoe kom ik bij","como chego a"),("in de buurt","perto"),("ergens","em algum lado"),("de weg vragen","pedir direções")], "Pedir direções.", ["v-hoe-kom-ik","v-in-de-buurt","v-ergens","v-de-weg-vragen"]),
    TR("pt-nl","Como chego à estação?", ["Hoe kom ik bij het station"], "hoe kom ik bij.", ["v-hoe-kom-ik"]),
    TR("pt-nl","Há uma farmácia aqui perto?", ["Is er een apotheek in de buurt","Is er hier een apotheek in de buurt"], "in de buurt.", ["v-in-de-buurt"]),
    WO("Desculpe, sabe onde é o museu?", ["Pardon,","weet","u","waar","het","museum","is?"], "Pergunta indireta: verbo no fim.", ["v-weten"]),
    FE(["Weet","u","waar","de","stations","is?"], 4, "station", "Um só: «het station» (singular): weet u waar het station is?", ["v-weten"]),
    TR("nl-pt","Is hier ergens een supermarkt?", ["Há um supermercado aqui (em algum lado|por perto)"], "ergens = em algum lado.", ["v-ergens"]),
    LI("Kunt u mij de weg wijzen?", ["Kunt u mij de weg wijzen"], "Pode indicar-me o caminho?", "de weg wijzen = indicar o caminho.", ["v-de-weg-vragen"]),
    DL([("Turista","Pardon, hoe kom ik bij de markt?","Desculpe, como chego ao mercado?"),("Senhor","")], ["*Dat is niet ver. Hier rechtdoor en dan links.","Ik ben de markt.|Não faz sentido.","Ja, graag.|Não responde."], "Indicar o caminho.", ["v-hoe-kom-ik"]),
    FB("Is er een bank ___ de buurt?", ["in"], "in de buurt.", ["v-in-de-buurt"], choices=["in","op","bij"], tr="Há um banco aqui perto?"),
    MC("A forma mais educada:", ["*Pardon, weet u waar het postkantoor is?","Waar postkantoor?|Seco e incompleto.","Hé, waar is het postkantoor?|«Hé» soa brusco."], "Pardon + weet u…", ["v-weten"]),
  ], diff=2, mins=6)

L(2, "Dar direções", "Ga rechtdoor, neem de tweede straat links, steek over.",
  ["Dar instruções de caminho com o imperativo"],
  vocab=[V("v-oversteken","oversteken","atravessar","verb",note="Steek de straat over."), V("v-kruispunt","kruispunt","cruzamento","noun","het"),
         V("v-hoek","hoek","esquina","noun","de"), V("v-brug","brug","ponte","noun","de","bruggen"), V("v-langs","langs","ao longo de|por","preposition")],
  ex=[("Ga rechtdoor tot het kruispunt.","Vá em frente até ao cruzamento."),("Steek de brug over.","Atravesse a ponte."),("Het is op de hoek.","É na esquina."),("Loop langs de gracht.","Siga ao longo do canal.")],
  review=["v-rechtdoor","v-linksaf","v-rechtsaf","v-tweede","v-straat"],
  cefr=C, exs=[
    MA([("oversteken","atravessar"),("kruispunt","cruzamento"),("hoek","esquina"),("brug","ponte"),("langs","ao longo de")], "Direções.", ["v-oversteken","v-kruispunt","v-hoek","v-brug","v-langs"]),
    WO("Atravesse a rua.", ["Steek","de","straat","over"], "Separável no imperativo.", ["v-oversteken"]),
    TR("pt-nl","Vá em frente até ao cruzamento.", ["Ga rechtdoor tot het kruispunt","Loop rechtdoor tot het kruispunt"], "tot = até.", ["v-kruispunt"]),
    TR("nl-pt","Neem de tweede straat links.", ["Apanhe a segunda rua à esquerda","Vire na segunda rua à esquerda"], "Instrução comum.", ["v-tweede"]),
    TR("nl-pt","Het café is op de hoek.", ["O café é na esquina","O café fica na esquina"], "op de hoek.", ["v-hoek"]),
    AR("kruispunt","o cruzamento","het", "«Het kruispunt».", ["v-kruispunt"]),
    FE(["Oversteek","de","brug."], 0, "Steek … over", "Imperativo separável: steek de brug over.", ["v-oversteken"]),
    LI("Loop langs de gracht tot de brug.", ["Loop langs de gracht tot de brug"], "Siga ao longo do canal até à ponte.", "langs.", ["v-langs","v-brug"]),
    FB("Bij het stoplicht slaat u ___ .", ["rechtsaf","linksaf"], "Virar à direita/esquerda.", ["v-rechtsaf"], choices=["rechtsaf","rechtdoor af","oversteek"], tr="No semáforo vire à direita."),
    CO("dialogue","Na rua", "Turist: Pardon, hoe kom ik bij het Rijksmuseum?\nMeneer: Ga hier rechtdoor tot de brug. Steek de brug over en sla dan linksaf. Het museum is aan het einde van de straat, aan de rechterkant.\nTurist: Is het ver?\nMeneer: Nee, tien minuten lopen.",
       [("O que faz depois da ponte?", ["*Vira à esquerda","Vira à direita","Volta para trás"]),("De que lado está o museu?", ["*À direita","À esquerda","Em frente à ponte"]),("Quanto tempo a pé?", ["*Dez minutos","Uma hora","Dois minutos"])],
       "aan de rechterkant = do lado direito.", ["v-oversteken","v-brug"]),
  ], diff=2, mins=6)

L(3, "Pontos de referência", "tegenover, naast, voorbij, aan het einde van.",
  ["Usar pontos de referência para localizar lugares"],
  vocab=[V("v-voorbij","voorbij","depois de (passar)|para lá de","preposition",note="voorbij de kerk = depois de passar a igreja"), V("v-einde","einde","fim","noun","het"),
         V("v-kerk","kerk","igreja","noun","de","kerken"), V("v-plein","plein","praça","noun","het","pleinen"), V("v-kant","kant","lado","noun","de",note="aan de linkerkant = do lado esquerdo")],
  ex=[("Het is voorbij de kerk.","É depois da igreja."),("Aan het einde van de straat.","No fim da rua."),("Het hotel staat aan het plein.","O hotel fica na praça."),("Aan de linkerkant.","Do lado esquerdo.")],
  review=["v-tegenover","v-naast","v-tussen","v-achter"],
  cefr=C, exs=[
    MA([("voorbij","depois de"),("einde","fim"),("kerk","igreja"),("plein","praça"),("kant","lado")], "Referências.", ["v-voorbij","v-einde","v-kerk","v-plein","v-kant"]),
    AR("plein","a praça","het", "«Het plein».", ["v-plein"]),
    AR("einde","o fim","het", "«Het einde».", ["v-einde"]),
    TR("pt-nl","no fim da rua", ["aan het einde van de straat","aan het eind van de straat"], "aan het einde van.", ["v-einde"]),
    TR("nl-pt","De bakker is tegenover de kerk.", ["A padaria (é|fica) em frente da igreja"], "tegenover.", ["v-kerk","v-tegenover"]),
    TR("pt-nl","do lado direito", ["aan de rechterkant"], "rechter + kant.", ["v-kant"]),
    FE(["Het","hotel","is","op","het","einde","van","de","straat."], 3, "aan", "aan het einde van.", ["v-einde"]),
    LI("Het station is voorbij het plein.", ["Het station is voorbij het plein"], "A estação é depois da praça.", "voorbij.", ["v-voorbij","v-plein"]),
    FB("De apotheek is ___ de bank en de bakker.", ["tussen"], "tussen … en.", ["v-tussen"], choices=["tussen","voorbij","einde"], tr="A farmácia fica entre o banco e a padaria."),
    WO("O museu fica do lado esquerdo.", ["Het","museum","is","aan","de","linkerkant"], "aan de linkerkant.", ["v-kant"]),
  ], diff=2, mins=5)

L(4, "Distâncias e tempo", "Hoe ver is het? Tien minuten lopen, vijf minuten met de fiets.",
  ["Perguntar e indicar distâncias"],
  vocab=[V("v-hoe-ver","hoe ver","a que distância","expression"), V("v-lopen-afstand","lopen","andar a pé","verb",note="tien minuten lopen = dez minutos a pé"),
         V("v-kilometer","kilometer","quilómetro","noun","de"), V("v-meter","meter","metro (medida)","noun","de"), V("v-ongeveer2","zo'n","cerca de|uns","determiner",note="zo'n tien minuten = uns dez minutos")],
  ex=[("Hoe ver is het?","A que distância fica?"),("Het is tien minuten lopen.","São dez minutos a pé."),("Het is zo'n twee kilometer.","São uns dois quilómetros."),("Na honderd meter.","Daqui a cem metros.")],
  review=["v-ver","v-dichtbij","v-minuut","v-fiets"],
  cefr=C, exs=[
    MA([("hoe ver","a que distância"),("kilometer","quilómetro"),("meter","metro"),("zo'n","cerca de")], "Distâncias.", ["v-hoe-ver","v-kilometer","v-meter","v-ongeveer2"]),
    TR("pt-nl","A que distância fica?", ["Hoe ver is het"], "hoe ver.", ["v-hoe-ver"]),
    TR("pt-nl","São dez minutos a pé.", ["Het is tien minuten lopen"], "tempo + lopen.", ["v-lopen-afstand"]),
    TR("nl-pt","Het is zo'n twee kilometer.", ["São uns dois quilómetros","É a cerca de dois quilómetros"], "zo'n = cerca de.", ["v-ongeveer2","v-kilometer"]),
    FE(["Het","is","tien","minuten","te","lopen."], 4, "(retirar)", "Expressão: tien minuten lopen (sem «te»).", ["v-lopen-afstand"]),
    MC("Quanto é «een kwartier fietsen»?", ["*15 minutos de bicicleta","1 quilómetro|Não.","Uma hora|kwartier = quarto de hora."], "kwartier = 15 min.", ["v-fiets"]),
    LI("Na tweehonderd meter is het rechts.", ["Na tweehonderd meter is het rechts"], "Daqui a duzentos metros é à direita.", "na = depois de.", ["v-meter"]),
    DL([("Ana","Is het ver naar het strand?","A praia é longe?"),("Tom","")], ["*Nee, vijf minuten met de fiets.","Ja, op de hoek.|Contraditório.","Het is vijf uur.|Responde à hora."], "Distância em tempo.", ["v-hoe-ver"]),
    FB("Het is ___ ver: twintig kilometer!", ["te"], "te ver = longe demais.", ["v-ver"], choices=["te","zo'n","heel graag"], tr="É longe demais: vinte quilómetros!"),
    WO("O hotel fica a uns cinco minutos daqui.", ["Het","hotel","is","zo'n","vijf","minuten","hiervandaan"], "hiervandaan = daqui.", ["v-ongeveer2"]),
  ], diff=2, mins=5)

L(5, "Perdido na cidade", "Revisão: pedir, dar e confirmar direções.",
  ["Resolver uma situação de orientação completa"],
  ex=[("Sorry, ik ben de weg kwijt. Kunt u mij helpen?","Desculpe, perdi-me. Pode ajudar-me?")],
  review=["v-hoe-kom-ik","v-oversteken","v-kruispunt","v-hoek","v-voorbij","v-hoe-ver","v-in-de-buurt","v-brug"],
  cefr=C, exs=[
    TR("nl-pt","Ik ben de weg kwijt.", ["Perdi-me","Estou perdid[o|a]"], "de weg kwijt zijn = estar perdido.", ["v-de-weg-vragen"]),
    TR("pt-nl","Como chego à praça?", ["Hoe kom ik bij het plein"], "bij het plein.", ["v-hoe-kom-ik","v-plein"]),
    WO("Atravesse a ponte e vire à direita.", ["Steek","de","brug","over","en","sla","rechtsaf"], "Dois imperativos.", ["v-oversteken","v-rechtsaf"]),
    MC("«Het is voorbij de kerk, aan de linkerkant.» Onde fica?", ["*Depois da igreja, do lado esquerdo","Antes da igreja, à direita|voorbij = depois.","Dentro da igreja|Não."], "voorbij + linkerkant.", ["v-voorbij","v-kant"]),
    FE(["Weten","u","waar","de","apotheek","is?"], 0, "Weet", "Com «u»: weet u…?", ["v-weten"]),
    LI("Neem de eerste straat rechts en dan is het op de hoek.", ["Neem de eerste straat rechts en dan is het op de hoek"], "Apanhe a primeira rua à direita e depois é na esquina.", "Direções encadeadas.", ["v-hoek"]),
    CO("dialogue","Perdida", "Ana: Sorry, ik ben de weg kwijt. Weet u waar de Nieuwstraat is?\nVrouw: De Nieuwstraat? Ga hier rechtdoor tot het kruispunt. Steek over en neem de tweede straat links. Dat is de Nieuwstraat.\nAna: Is het ver?\nVrouw: Nee hoor, vijf minuten lopen.\nAna: Hartelijk bedankt!",
       [("O que faz no cruzamento?", ["*Atravessa","Vira à direita","Pára"]),("Que rua apanha depois?", ["*A segunda à esquerda","A primeira à direita","A segunda à direita"])],
       "hartelijk bedankt = muito obrigado.", ["v-oversteken","v-kruispunt"]),
    MA([("Ik ben de weg kwijt.","Perdi-me."),("Hoe ver is het?","A que distância fica?"),("Steek over.","Atravesse."),("Op de hoek.","Na esquina.")], "Frases úteis.", ["v-hoe-ver","v-oversteken","v-hoek"]),
    FB("Het restaurant is ___ het einde van de straat.", ["aan"], "aan het einde.", ["v-einde"], choices=["aan","op","in"], tr="O restaurante fica no fim da rua."),
    SW("Explique a um turista como chegar da estação à sua rua (3–4 instruções).", ["Ga rechtdoor(.) Neem de tweede straat links(.) Steek de brug over(.) Mijn straat is aan de rechterkant"],
       ["Imperativos (ga, neem, steek … over, sla … af)","Pelo menos uma referência (brug, kerk, hoek…)","Partículas dos separáveis no fim"], 10, "Compare com o modelo.", ["v-oversteken"]),
  ], diff=3, mins=7)

W()
