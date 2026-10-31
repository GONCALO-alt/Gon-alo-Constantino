import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u03")
C = "A2"
# Lições extra (10–15): mapas, fundo da rua, pontos cardeais, atravessar, pedir ajuda a estranhos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Com o mapa", "Op de kaart.",
  ["Usar um mapa para te orientares"],
  vocab=[N("v-kaart","kaart","mapa","de","kaarten")],
  ex=[("Kunt u het op de kaart aanwijzen?","Pode indicá-lo no mapa?"),("Volgens de kaart is het hier vlakbij.","Segundo o mapa é aqui perto.")],
  review=["v-in-de-buurt","v-hoe-ver","v-ergens"],
  cefr=C, exs=[
    MA([("kaart","mapa"),("in de buurt","perto, nas redondezas"),("hoe ver?","a que distância?"),("ergens","algures")], "Orientar.", ["v-kaart","v-in-de-buurt","v-hoe-ver","v-ergens"]),
    TR("pt-nl","Pode mostrar no mapa?", ["Kunt u het op de kaart aanwijzen?","Kunt u het op de kaart laten zien?"], "op de kaart.", ["v-kaart"]),
    TR("pt-nl","Há um supermercado aqui perto?", ["Is er een supermarkt in de buurt?","Is hier een supermarkt in de buurt?"], "in de buurt.", ["v-in-de-buurt"]),
    FB("Volgens de ___ moeten we links.", ["kaart"], "Mapa.", ["v-kaart"], choices=["kaart","kerk","brug"], tr="Segundo o mapa temos de ir à esquerda."),
    MC("«kaart» também pode ser…", ["*cartão ou bilhete, conforme o contexto","só mapa|Também cartão (pinpas, OV-chipkaart).","só carta de jogar|Também, mas não só."], "Vários sentidos.", ["v-kaart"]),
    LI("Het museum ligt ergens in het centrum.", ["Het museum ligt ergens in het centrum(.)"], "O museu fica algures no centro.", "Ouvir.", ["v-ergens"]),
    DL([("Toerist","Hoe ver is het naar de markt?","A que distância fica o mercado?"),("Jij","","")], ["*Niet ver: vijf minuten lopen. Kijk, hier op de kaart.","Op de kaart.|Incompleto.","Ik ben ver.|Não."], "Responder.", ["v-hoe-ver"]),
    AR("kaart", "mapa", "de", "de kaart.", ["v-kaart"]),
  ], diff=2, mins=4)

L(11, "Ao fundo da rua", "Aan het eind van de straat.",
  ["Dar direções com fim, esquina e ponte"],
  vocab=[X("v-aan-het-eind","aan het eind van","ao fundo de, no fim de")],
  ex=[("De bakker is aan het eind van de straat.","A padaria fica ao fundo da rua."),("Ga over de brug en dan de hoek om.","Passe a ponte e depois vire a esquina.")],
  review=["v-einde","v-hoek","v-brug","v-voorbij","v-langs"],
  cefr=C, exs=[
    MA([("aan het eind van","ao fundo de"),("hoek","esquina"),("brug","ponte"),("voorbij","depois de, para lá de")], "Direções.", ["v-aan-het-eind","v-hoek","v-brug","v-voorbij"]),
    TR("pt-nl","A farmácia fica ao fundo da rua.", ["De apotheek is aan het eind van de straat(.)"], "aan het eind van.", ["v-aan-het-eind"]),
    TR("pt-nl","Passe a ponte.", ["Ga over de brug(.)"], "over de brug.", ["v-brug"]),
    FB("Het café is op de ___ van de straat.", ["hoek"], "Esquina.", ["v-hoek"], choices=["hoek","brug","kant"], tr="O café fica na esquina da rua."),
    FB("Loop ___ de kerk en dan links.", ["voorbij"], "Passar.", ["v-voorbij","v-kerk"], choices=["voorbij","aan","op"], tr="Passe a igreja e depois à esquerda."),
    LI("Fiets langs het kanaal tot de brug.", ["Fiets langs het kanaal tot de brug(.)"], "Vai de bicicleta ao longo do canal até à ponte.", "Ouvir.", ["v-langs","v-brug"]),
    DL([("Voorbijganger","Pardon, waar is het plein?","Desculpe, onde é a praça?"),("Jij","","")], ["*Aan het eind van deze straat, voorbij de kerk.","Ik ben plein.|Não.","Hoek.|Incompleto."], "Direções.", ["v-plein"]),
    WO("Fica ao fundo da rua.", ["Het","is","aan","het","eind","van","de","straat."], "Ordem.", ["v-aan-het-eind"]),
  ], diff=2, mins=4)

L(12, "Norte e sul", "Noord, zuid, oost, west.",
  ["Usar os pontos cardeais"],
  vocab=[X("v-noord","noord","norte"), X("v-zuid","zuid","sul"), X("v-oost-richting","oost","este"), X("v-west-richting","west","oeste")],
  ex=[("Groningen ligt in het noorden.","Groningen fica no norte."),("Maastricht ligt in het zuiden.","Maastricht fica no sul."),("Amsterdam-Noord","Amesterdão Norte (bairro)")],
  gram=[G("g-s3u03c-1","het noorden, in het zuiden","Para regiões usa-se o substantivo com **het** e **-en**: **in het noorden**, **in het zuiden**, **in het oosten**, **in het westen**. Em nomes de lugares e sinais aparece a forma curta: *Rotterdam-Zuid*, *uitgang Noord*.")],
  review=["v-kant","v-ver"],
  cefr=C, exs=[
    MA([("noord","norte"),("zuid","sul"),("oost","este"),("west","oeste")], "Pontos cardeais.", ["v-noord","v-zuid","v-oost-richting","v-west-richting"]),
    MC("Maastricht fica…", ["*in het zuiden","in het noorden|Groningen é no norte.","in het westen|Não."], "Geografia.", ["v-zuid"]),
    TR("pt-nl","Groningen fica no norte.", ["Groningen ligt in het noorden(.)","Groningen is in het noorden(.)"], "in het noorden.", ["v-noord"]),
    TR("pt-nl","Portugal fica no sul da Europa.", ["Portugal ligt in het zuiden van Europa(.)","Portugal is in het zuiden van Europa(.)"], "in het zuiden van.", ["v-zuid","v-europa"]),
    FB("De zon komt op in het ___.", ["oosten"], "Este.", ["v-oost-richting"], choices=["oosten","westen","noorden"], tr="O sol nasce a este."),
    LI("Neem de uitgang Zuid.", ["Neem de uitgang Zuid(.)","Neem de uitgang zuid(.)"], "Apanhe a saída Sul.", "Na estação.", ["v-zuid"]),
    MC("«Uitgang West» numa estação é…", ["*a saída oeste","o comboio para oeste|Não.","a casa de banho|Não."], "Sinais.", ["v-west-richting"]),
    DL([("Collega","Waar woon je precies?","Onde moras exatamente?"),("Jij","","")], ["*In Utrecht-Oost, vlak bij het park.","In het noord.|Forma errada: in het noorden.","Ik ben west.|Não."], "Responder.", ["v-oost-richting"]),
  ], diff=2, mins=4)

L(13, "Atravessar a rua", "Oversteken bij het zebrapad.",
  ["Atravessar em segurança como peão"],
  vocab=[N("v-zebrapad","zebrapad","passadeira","het","zebrapaden"), N("v-voetganger","voetganger","peão","de","voetgangers")],
  ex=[("Steek over bij het zebrapad.","Atravesse na passadeira."),("Voetgangers hebben voorrang op het zebrapad.","Os peões têm prioridade na passadeira.")],
  review=["v-oversteken","v-stoplicht","v-voorrang"],
  cefr=C, exs=[
    MA([("zebrapad","passadeira"),("voetganger","peão"),("oversteken","atravessar"),("stoplicht","semáforo")], "Atravessar.", ["v-zebrapad","v-voetganger","v-oversteken","v-stoplicht"]),
    AR("zebrapad", "passadeira", "het", "het pad.", ["v-zebrapad"]),
    MC("Antes de atravessar uma ciclovia, deves…", ["*olhar também para as bicicletas (vêm depressa!)","olhar só para os carros|As bicicletas também.","correr sem olhar|Nunca."], "Segurança.", ["v-oversteken"]),
    TR("pt-nl","Atravesse na passadeira.", ["Steek over bij het zebrapad(.)"], "oversteken.", ["v-zebrapad"]),
    TR("pt-nl","Os peões têm prioridade.", ["Voetgangers hebben voorrang(.)"], "voetganger.", ["v-voetganger"]),
    FB("Wacht op het groene licht voordat je ___.", ["oversteekt"], "Subordinada: verbo junto no fim.", ["v-oversteken"], choices=["oversteekt","steekt over","oversteken"], tr="Espera pelo verde antes de atravessares."),
    LI("Kijk eerst links, dan rechts.", ["Kijk eerst links(,) dan rechts(.)"], "Olha primeiro para a esquerda, depois para a direita.", "Ouvir.", ["v-oversteken"]),
    WO("Atravessa aqui.", ["Steek","hier","over."], "Imperativo separável.", ["v-oversteken"]),
  ], diff=2, mins=4)

L(14, "Pedir ajuda a um estranho", "Mag ik u iets vragen?",
  ["Abordar alguém com educação na rua"],
  vocab=[X("v-mag-ik-u-iets-vragen","mag ik u iets vragen?","posso fazer-lhe uma pergunta?")],
  ex=[("Pardon, mag ik u iets vragen? Ik ben de weg kwijt.","Desculpe, posso perguntar-lhe uma coisa? Estou perdido."),("Sorry, ik ben hier ook niet bekend.","Desculpe, também não sou daqui.")],
  review=["v-de-weg-vragen","v-hoe-kom-ik","v-pardon"],
  cefr=C, exs=[
    MA([("mag ik u iets vragen?","posso perguntar?"),("de weg vragen","pedir direções"),("hoe kom ik bij…?","como chego a…?"),("pardon","com licença")], "Abordar.", ["v-mag-ik-u-iets-vragen","v-de-weg-vragen","v-hoe-kom-ik","v-pardon"]),
    MC("Estás perdido. Começas com:", ["*Pardon, mag ik u iets vragen?","Hé, jij!|Brusco.","Ik ben kwijt.|Incompleto."], "Educado.", ["v-mag-ik-u-iets-vragen"]),
    TR("pt-nl","Desculpe, como chego à igreja?", ["Pardon(,) hoe kom ik bij de kerk?","Sorry(,) hoe kom ik bij de kerk?"], "hoe kom ik bij.", ["v-hoe-kom-ik"]),
    TR("pt-nl","Também não sou daqui.", ["Ik ben hier ook niet bekend(.)","Ik woon hier ook niet(.)"], "bekend.", ["v-de-weg-vragen"]),
    DL([("Voorbijganger","Natuurlijk, zeg het maar.","Claro, diga."),("Jij","","")], ["*Hoe kom ik bij de bibliotheek?","Ik ben pardon.|Não.","Tot ziens!|Ainda não."], "Perguntar.", ["v-hoe-kom-ik"]),
    DL([("Voorbijganger","Rechtdoor en dan de tweede links.","Em frente e depois a segunda à esquerda."),("Jij","","")], ["*Dank u wel, heel vriendelijk!","Nee.|Rude.","Ik ben links.|Não."], "Agradecer.", ["v-dank-u-wel"]),
    LI("Pardon, mag ik u iets vragen?", ["Pardon(,) mag ik u iets vragen(?)"], "Desculpe, posso fazer-lhe uma pergunta?", "Ouvir.", ["v-mag-ik-u-iets-vragen"]),
    WO("Posso perguntar-lhe uma coisa?", ["Mag","ik","u","iets","vragen?"], "Ordem.", ["v-mag-ik-u-iets-vragen"]),
  ], diff=2, mins=4)

L(15, "Prática: guiar um turista", "Een toerist helpen.",
  ["Dar direções completas"],
  vocab=[],
  ex=[("(Fictício) Ga rechtdoor tot het plein. Daar ga je linksaf, over de brug. Het museum is aan het eind van de straat, aan de rechterkant.","Siga em frente até à praça…")],
  review=["v-aan-het-eind","v-brug","v-plein","v-kant","v-zebrapad","v-noord","v-kaart"],
  cefr=C, exs=[
    MC("(Fictício) «Het museum is aan het eind van de straat, aan de rechterkant.» Onde fica o museu?", ["*ao fundo da rua, à direita","no início da rua|Não.","do lado esquerdo|Não."], "Compreensão.", ["v-aan-het-eind","v-kant"]),
    MC("(Fictício) «Daar ga je linksaf, over de brug.» O que fazes na praça?", ["*viras à esquerda e passas a ponte","viras à direita|Não.","páras|Não."], "Compreensão.", ["v-brug"]),
    TR("pt-nl","Siga em frente até à praça.", ["Ga rechtdoor tot het plein(.)","Loop rechtdoor tot het plein(.)"], "tot.", ["v-plein"]),
    TR("pt-nl","Fica do lado esquerdo.", ["Het is aan de linkerkant(.)"], "aan de linkerkant.", ["v-kant"]),
    LI("Het is ongeveer tien minuten lopen naar het noorden.", ["Het is ongeveer tien minuten lopen naar het noorden(.)"], "São cerca de dez minutos a pé para norte.", "Ouvir.", ["v-noord"]),
    BS("Passe a ponte e atravesse na passadeira.", ["Ga","over","de","brug","en","steek","over","bij","het","zebrapad."], ["Ga over de brug en steek over bij het zebrapad."], "Imperativos.", ["v-brug","v-zebrapad"]),
    DL([("Toerist","Is het ver?","É longe?"),("Jij","","")], ["*Nee, vijf minuten. Ik wijs het even aan op de kaart.","Ja, in het zuid.|Errado.","Ik ben ver.|Não."], "Responder.", ["v-kaart"]),
    SW("Escreva as direções da sua casa até ao supermercado mais próximo (4 passos).", ["Ga de deur uit en ga linksaf. Loop rechtdoor tot de rotonde. Steek over bij het zebrapad. De supermarkt is aan de rechterkant."], ["4 passos","Imperativo","Preposições"], 20, "Escrever.", ["v-aan-het-eind"]),
  ], diff=2, mins=5)

W()
