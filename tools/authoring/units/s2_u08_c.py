import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u08")
C = "A1-A2"
# Lições extra (10–15): roupa de inverno, mais peças e cores, tamanhos, trocas e devoluções.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Roupa de inverno", "Een muts, een sjaal en handschoenen.",
  ["Nomear a roupa para o frio"],
  vocab=[N("v-muts","muts","gorro","de","mutsen"), N("v-sjaal","sjaal","cachecol","de","sjaals"), N("v-handschoenen","handschoenen","luvas","de")],
  ex=[("Het is koud: doe je muts en je sjaal om!","Está frio: põe o gorro e o cachecol!"),("Ik draag handschoenen op de fiets.","Uso luvas na bicicleta.")],
  review=["v-jas","v-trui","v-dragen","v-koud"],
  cefr=C, exs=[
    MA([("muts","gorro"),("sjaal","cachecol"),("handschoenen","luvas"),("jas","casaco")], "Inverno.", ["v-muts","v-sjaal","v-handschoenen","v-jas"]),
    MC("Para as mãos usas…", ["*handschoenen","een muts|É para a cabeça.","een sjaal|É para o pescoço."], "Lógica.", ["v-handschoenen"]),
    TR("pt-nl","Uso um gorro e um cachecol.", ["Ik draag een muts en een sjaal(.)"], "dragen.", ["v-muts","v-sjaal","v-dragen"]),
    TR("pt-nl","Está frio, veste um casaco.", ["Het is koud(,) doe een jas aan(.)","Het is koud(,) trek een jas aan(.)","Het is koud(,) draag een jas(.)"], "aandoen / aantrekken.", ["v-jas","v-koud"]),
    FB("Op de fiets draag ik ___ tegen de kou.", ["handschoenen"], "Luvas.", ["v-handschoenen"], choices=["handschoenen","jurk","shirt"], tr="Na bicicleta uso luvas contra o frio."),
    LI("Vergeet je muts niet!", ["Vergeet je muts niet(!)"], "Não te esqueças do gorro!", "Ouvir.", ["v-muts"]),
    AR("sjaal", "cachecol", "de", "de sjaal.", ["v-sjaal"]),
    WO("Uso luvas.", ["Ik","draag","handschoenen."], "Ordem.", ["v-handschoenen"]),
  ], diff=2, mins=4)

L(11, "Saia e meias", "Een rok en sokken.",
  ["Nomear mais peças de roupa"],
  vocab=[N("v-rok","rok","saia","de","rokken"), N("v-sokken","sokken","meias","de")],
  ex=[("Ze draagt een blauwe rok.","Ela usa uma saia azul."),("Mijn sokken zijn nat.","As minhas meias estão molhadas.")],
  review=["v-broek","v-jurk","v-schoen","v-shirt"],
  cefr=C, exs=[
    MA([("rok","saia"),("sokken","meias"),("jurk","vestido"),("broek","calças")], "Roupa.", ["v-rok","v-sokken","v-jurk","v-broek"]),
    MC("«broek» em neerlandês está no…", ["*singular: een broek","plural: twee broeken para umas calças|Uma peça = een broek.","não tem artigo|Tem: de broek."], "Diferença do português.", ["v-broek"]),
    TR("pt-nl","Ela usa uma saia azul.", ["Ze draagt een blauwe rok(.)","Zij draagt een blauwe rok(.)"], "blauwe rok.", ["v-rok"]),
    TR("pt-nl","As minhas meias são brancas.", ["Mijn sokken zijn wit(.)"], "Depois de zijn: sem -e.", ["v-sokken","v-wit"]),
    FB("Een zwarte ___ en een wit shirt.", ["rok"], "Saia.", ["v-rok"], choices=["rok","sokken","schoenen"], tr="Uma saia preta e uma t-shirt branca."),
    LI("Ik zoek warme sokken.", ["Ik zoek warme sokken(.)"], "Procuro meias quentes.", "Ouvir.", ["v-sokken"]),
    AR("rok", "saia", "de", "de rok.", ["v-rok"]),
    WO("Ela usa uma saia.", ["Ze","draagt","een","rok."], "Ordem.", ["v-rok"]),
  ], diff=2, mins=4)

L(12, "Botas e mais cores", "Paarse laarzen.",
  ["Usar mais cores com roupa e calçado"],
  vocab=[N("v-laarzen","laarzen","botas","de"), X("v-paars","paars","roxo","adjective")],
  ex=[("Ik draag in de winter laarzen.","No inverno uso botas."),("Ze heeft een paarse jas.","Ela tem um casaco roxo.")],
  review=["v-kleur","v-geel","v-groen","v-grijs","v-roze","v-oranje"],
  cefr=C, exs=[
    MA([("paars","roxo"),("grijs","cinzento"),("roze","cor-de-rosa"),("oranje","laranja")], "Cores.", ["v-paars","v-grijs","v-roze","v-oranje"]),
    MC("De que cor é a camisola da seleção neerlandesa?", ["*oranje","paars|Não.","groen|Não."], "Cultura.", ["v-oranje"]),
    TR("pt-nl","Ela tem um casaco roxo.", ["Ze heeft een paarse jas(.)","Zij heeft een paarse jas(.)"], "paarse.", ["v-paars","v-jas"]),
    TR("pt-nl","Que cor tem o teu carro?", ["Welke kleur heeft je auto?","Welke kleur heeft jouw auto?","Wat voor kleur heeft je auto?"], "kleur.", ["v-kleur"]),
    FB("Mijn ___ zijn nat van de regen.", ["laarzen"], "Botas.", ["v-laarzen"], choices=["laarzen","kleur","paars"], tr="As minhas botas estão molhadas da chuva."),
    FB("Een ___ trui. (cinzenta)", ["grijze"], "Adjetivo com -e (de trui).", ["v-grijs"], choices=["grijze","grijs","grijzen"], tr="Uma camisola cinzenta."),
    LI("Ik vind die groene laarzen mooi.", ["Ik vind die groene laarzen mooi(.)"], "Acho aquelas botas verdes bonitas.", "Ouvir.", ["v-laarzen","v-groen"]),
    MC("«Roze» com «een jas»:", ["*een roze jas","een rozee jas|«roze» já acaba em -e.","een rozen jas|Não."], "Exceção.", ["v-roze"]),
  ], diff=2, mins=4)

L(13, "Demasiado grande", "Hij is te groot.",
  ["Dizer que uma peça não serve e pedir outro tamanho"],
  vocab=[X("v-een-maat-kleiner","een maat kleiner","um número abaixo")],
  ex=[("Deze broek is te groot. Heeft u een maat kleiner?","Estas calças estão grandes demais. Tem um número abaixo?"),("De schoenen zijn te klein.","Os sapatos são pequenos demais.")],
  review=["v-te","v-maat","v-paskamer","v-passen-kleding"],
  cefr=C, exs=[
    MA([("te groot","grande demais"),("te klein","pequeno demais"),("maat","tamanho"),("paskamer","provador")], "Tamanhos.", ["v-te","v-een-maat-kleiner","v-maat","v-paskamer"]),
    MC("A camisola está larga. Pedes:", ["*een maat kleiner","een maat groter|Isso seria maior ainda.","een andere kleur|Não resolve."], "Tamanho.", ["v-een-maat-kleiner"]),
    TR("pt-nl","É grande demais.", ["Hij is te groot(.)","Het is te groot(.)"], "te.", ["v-te"]),
    TR("pt-nl","Tem um número abaixo?", ["Heeft u een maat kleiner?","Hebt u een maat kleiner?"], "een maat kleiner.", ["v-een-maat-kleiner"]),
    FB("Mag ik deze broek ___?", ["passen"], "Experimentar.", ["v-passen-kleding"], choices=["passen","dragen","ruilen"], tr="Posso experimentar estas calças?"),
    DL([("Verkoper","Past hij goed?","Serve bem?"),("Jij","","")], ["*Nee, hij is te klein. Heeft u een maat groter?","Ja, te klein.|Contraditório.","Hij is paars.|Não responde."], "Pedir outro tamanho.", ["v-te","v-maat"]),
    LI("Welke maat heeft u nodig?", ["Welke maat heeft u nodig(?)","Welke maat hebt u nodig(?)"], "De que tamanho precisa?", "Ouvir.", ["v-maat"]),
    WO("É pequeno demais.", ["Het","is","te","klein."], "Ordem.", ["v-te"]),
  ], diff=2, mins=4)

L(14, "Trocar e devolver", "Ruilen of geld terug?",
  ["Trocar uma peça ou pedir o dinheiro de volta"],
  vocab=[X("v-geld-terug","geld terug","reembolso, o dinheiro de volta")],
  ex=[("Kan ik deze jas ruilen?","Posso trocar este casaco?"),("Ik wil graag mijn geld terug. Hier is de bon.","Queria o meu dinheiro de volta. Aqui está o talão.")],
  review=["v-ruilen","v-bon","v-maat"],
  cefr=C, exs=[
    MA([("ruilen","trocar"),("geld terug","reembolso"),("bon","talão"),("maat","tamanho")], "Devoluções.", ["v-ruilen","v-geld-terug","v-bon","v-maat"]),
    MC("Para trocar ou devolver precisas quase sempre de…", ["*de bon","een paskamer|Não.","een muts|Não."], "Talão.", ["v-bon"]),
    TR("pt-nl","Posso trocar este casaco?", ["Kan ik deze jas ruilen?","Mag ik deze jas ruilen?"], "ruilen.", ["v-ruilen"]),
    TR("pt-nl","Queria o meu dinheiro de volta.", ["Ik wil graag mijn geld terug(.)","Ik wil mijn geld terug(.)"], "geld terug.", ["v-geld-terug"]),
    DL([("Verkoper","Wat is het probleem?","Qual é o problema?"),("Jij","","")], ["*De trui is te klein. Kan ik hem ruilen voor een maat groter?","De trui is paars.|Não explica.","Ik wil een muts.|Não."], "Explicar.", ["v-ruilen"]),
    DL([("Verkoper","Heeft u de bon nog?","Ainda tem o talão?"),("Jij","","")], ["*Ja, hier is hij.","Nee, ik heb geen maat.|Não.","Geld terug!|Brusco."], "Mostrar o talão.", ["v-bon"]),
    LI("U kunt binnen dertig dagen ruilen.", ["U kunt binnen dertig dagen ruilen(.)","U kunt binnen 30 dagen ruilen(.)"], "Pode trocar no prazo de trinta dias.", "Regra de loja (varia).", ["v-ruilen"]),
    WO("Posso trocar isto?", ["Kan","ik","dit","ruilen?"], "Ordem.", ["v-ruilen"]),
  ], diff=2, mins=4)

L(15, "Prática: o que vestes hoje?", "Wat draag je vandaag?",
  ["Descrever a roupa que tens vestida"],
  vocab=[],
  ex=[("(Fictício) Vandaag draag ik een spijkerbroek, een grijze trui en zwarte laarzen.","Hoje visto calças de ganga, uma camisola cinzenta e botas pretas.")],
  review=["v-dragen","v-trui","v-laarzen","v-sjaal","v-rok","v-paars","v-te"],
  cefr=C, exs=[
    MC("(Fictício) «Vandaag draagt Eva een rode jurk en witte schoenen.» De que cor são os sapatos?", ["*brancos","vermelhos|É o vestido.","pretos|Não."], "Compreensão.", ["v-wit"]),
    MC("(Fictício) «Het regent, dus ze draagt laarzen.» Porquê botas?", ["*porque chove","porque está calor|Não.","porque são roxas|Não."], "Compreensão.", ["v-laarzen"]),
    TR("pt-nl","Hoje visto uma camisola verde.", ["Vandaag draag ik een groene trui(.)","Ik draag vandaag een groene trui(.)"], "groene trui.", ["v-trui","v-groen"]),
    LI("Ik draag een zwarte broek en een witte trui.", ["Ik draag een zwarte broek en een witte trui(.)"], "Visto calças pretas e uma camisola branca.", "Ouvir.", ["v-dragen"]),
    BS("Ela usa um cachecol cor-de-rosa.", ["Ze","draagt","een","roze","sjaal."], ["Ze draagt een roze sjaal."], "roze não muda.", ["v-sjaal","v-roze"]),
    DL([("Vriendin","Staat deze jurk me goed?","Este vestido fica-me bem?"),("Jij","","")], ["*Ja, hij staat je heel goed!","Ja, te klein.|Contraditório.","Paars is een kleur.|Não."], "Elogiar.", ["v-staan-goed"]),
    FB("De jas is ___ duur. Ik koop hem niet.", ["te"], "Demasiado.", ["v-te"], choices=["te","een","heel"], tr="O casaco é demasiado caro. Não o compro."),
    SW("Descreva a roupa que tem vestida hoje (3–4 peças com cores).", ["Vandaag draag ik een blauwe broek, een wit shirt, een grijze trui en zwarte schoenen."], ["3–4 peças","Cores com -e"], 15, "Escrever.", ["v-dragen"]),
  ], diff=2, mins=5)

W()
