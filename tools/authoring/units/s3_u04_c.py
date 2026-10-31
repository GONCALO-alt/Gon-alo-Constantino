import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u04")
C = "A2"
# Lições extra (10–15): biblioteca, mercado semanal, piscina, turismo e passear na cidade.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Na biblioteca", "Boeken lenen en inleveren.",
  ["Requisitar e devolver livros"],
  vocab=[N("v-bibliotheekpas","bibliotheekpas","cartão da biblioteca","de"), X("v-inleveren","inleveren","entregar, devolver","verb")],
  ex=[("Met mijn bibliotheekpas leen ik drie boeken.","Com o cartão da biblioteca requisito três livros."),("Je moet de boeken binnen drie weken inleveren.","Tens de devolver os livros no prazo de três semanas.")],
  review=["v-bibliotheek","v-lenen","v-boek"],
  cefr=C, exs=[
    MA([("bibliotheekpas","cartão da biblioteca"),("lenen","requisitar"),("inleveren","devolver"),("bibliotheek","biblioteca")], "Biblioteca.", ["v-bibliotheekpas","v-lenen","v-inleveren","v-bibliotheek"]),
    MC("«Te laat inleveren» pode significar…", ["*pagar uma pequena multa","ganhar pontos|Não.","não poder entrar nunca|Exagero."], "Regras.", ["v-inleveren"]),
    TR("pt-nl","Quero requisitar este livro.", ["Ik wil dit boek lenen(.)","Ik wil graag dit boek lenen(.)"], "lenen.", ["v-lenen"]),
    TR("pt-nl","Tenho de devolver os livros.", ["Ik moet de boeken inleveren(.)"], "inleveren.", ["v-inleveren"]),
    FB("Zonder ___ kun je geen boeken lenen.", ["bibliotheekpas"], "Cartão.", ["v-bibliotheekpas"], choices=["bibliotheekpas","inleveren","boek"], tr="Sem cartão da biblioteca não podes requisitar livros."),
    MC("Qual é a ordem correta?", ["*Ik lever de boeken morgen in.","Ik inlever de boeken morgen.|Separável."], "Separável.", ["v-inleveren"]),
    LI("De bibliotheek heeft ook boeken in makkelijk Nederlands.", ["De bibliotheek heeft ook boeken in makkelijk Nederlands(.)"], "A biblioteca também tem livros em neerlandês fácil.", "Ouvir.", ["v-bibliotheek"]),
    DL([("Bibliothecaris","Wilt u deze boeken lenen?","Quer requisitar estes livros?"),("Jij","","")], ["*Ja, graag. Hier is mijn bibliotheekpas.","Nee, ik ben boek.|Não.","Inleveren.|Incompleto."], "Requisitar.", ["v-bibliotheekpas"]),
  ], diff=2, mins=4)

L(11, "O mercado semanal", "Op de weekmarkt.",
  ["Comprar no mercado de rua"],
  vocab=[N("v-weekmarkt","weekmarkt","mercado semanal","de")],
  ex=[("Op zaterdag is er weekmarkt op het plein.","Ao sábado há mercado semanal na praça."),("Wat kost een kilo appels? — Twee euro.","Quanto custa um quilo de maçãs? — Dois euros.")],
  review=["v-markt","v-plein","v-kilo","v-goedkoop"],
  cefr=C, exs=[
    MA([("weekmarkt","mercado semanal"),("plein","praça"),("kilo","quilo"),("goedkoop","barato")], "Mercado.", ["v-weekmarkt","v-plein","v-kilo","v-goedkoop"]),
    TR("pt-nl","Ao sábado há mercado na praça.", ["Op zaterdag is er markt op het plein(.)","Zaterdag is er weekmarkt op het plein(.)","Op zaterdag is er weekmarkt op het plein(.)"], "er is.", ["v-weekmarkt","v-plein"]),
    TR("pt-nl","Quanto custa um quilo de tomates?", ["Wat kost een kilo tomaten?","Hoeveel kost een kilo tomaten?"], "kilo.", ["v-kilo"]),
    FB("Groente op de markt is vaak ___ dan in de supermarkt.", ["goedkoper"], "Comparativo.", ["v-goedkoop"], choices=["goedkoper","goedkoop","goedkoopst"], tr="Os legumes no mercado são muitas vezes mais baratos do que no supermercado."),
    DL([("Marktkoopman","Wat mag het zijn?","O que vai ser?"),("Jij","","")], ["*Een kilo aardappels en een pond tomaten, alstublieft.","Ik ben markt.|Não.","Weekmarkt.|Não."], "Pedir.", ["v-kilo"]),
    LI("Drie zakken voor vijf euro!", ["Drie zakken voor vijf euro(!)","3 zakken voor 5 euro(!)"], "Três sacos por cinco euros!", "Pregão.", ["v-weekmarkt"]),
    MC("No mercado neerlandês é comum…", ["*o vendedor apregoar preços em voz alta","regatear muito|Pouco comum.","pagar só em ouro|Não."], "Cultura.", ["v-weekmarkt"]),
    AR("weekmarkt", "mercado semanal", "de", "de markt.", ["v-weekmarkt"]),
  ], diff=2, mins=4)

L(12, "Na piscina", "Naar het zwembad.",
  ["Ir à piscina e perceber os horários"],
  vocab=[N("v-zwembad","zwembad","piscina","het","zwembaden")],
  ex=[("Het zwembad is open van zeven tot tien.","A piscina está aberta das sete às dez."),("Op woensdag is er banenzwemmen.","À quarta há natação em pistas.")],
  review=["v-zwemmen","v-openingstijden","v-gesloten"],
  cefr=C, exs=[
    MA([("zwembad","piscina"),("zwemmen","nadar"),("openingstijden","horário"),("gesloten","fechado")], "Piscina.", ["v-zwembad","v-zwemmen","v-openingstijden","v-gesloten"]),
    AR("zwembad", "piscina", "het", "het bad.", ["v-zwembad"]),
    TR("pt-nl","Vou à piscina.", ["Ik ga naar het zwembad(.)","Ik ga zwemmen(.)"], "naar het zwembad.", ["v-zwembad"]),
    TR("pt-nl","A piscina está fechada ao domingo.", ["Het zwembad is op zondag gesloten(.)","Op zondag is het zwembad gesloten(.)","Het zwembad is zondag dicht(.)"], "gesloten.", ["v-gesloten"]),
    FB("Wat zijn de ___ van het zwembad?", ["openingstijden"], "Horário.", ["v-openingstijden"], choices=["openingstijden","koopavond","gesloten"], tr="Qual é o horário da piscina?"),
    MC("Muitas crianças neerlandesas fazem o «zwemdiploma» porque…", ["*há muita água (canais, rios) e é importante saber nadar","é obrigatório para ter bicicleta|Não.","é um desporto olímpico|Não é a razão."], "Cultura.", ["v-zwembad"]),
    LI("Het zwembad gaat om negen uur open.", ["Het zwembad gaat om negen uur open(.)"], "A piscina abre às nove.", "Ouvir.", ["v-zwembad"]),
    WO("Vou à piscina.", ["Ik","ga","naar","het","zwembad."], "Ordem.", ["v-zwembad"]),
  ], diff=2, mins=4)

L(13, "Turismo na cidade", "Het VVV en een stadswandeling.",
  ["Pedir informação turística"],
  vocab=[X("v-vvv","VVV","posto de turismo"), N("v-stadswandeling","stadswandeling","passeio a pé pela cidade","de")],
  ex=[("Bij het VVV kun je een plattegrond halen.","No posto de turismo podes ir buscar uma planta."),("Er is een stadswandeling om twee uur.","Há uma visita a pé às duas.")],
  review=["v-museum","v-rondvaart","v-bezoeken","v-centrum"],
  cefr=C, exs=[
    MA([("VVV","posto de turismo"),("stadswandeling","passeio a pé"),("rondvaart","passeio de barco"),("bezoeken","visitar")], "Turismo.", ["v-vvv","v-stadswandeling","v-rondvaart","v-bezoeken"]),
    TR("pt-nl","Onde é o posto de turismo?", ["Waar is het VVV?","Waar is de VVV?"], "VVV.", ["v-vvv"]),
    TR("pt-nl","Queremos visitar o museu.", ["We willen het museum bezoeken(.)","Wij willen het museum bezoeken(.)"], "bezoeken.", ["v-bezoeken","v-museum"]),
    FB("In Amsterdam maken veel toeristen een ___ door de grachten.", ["rondvaart"], "Passeio de barco.", ["v-rondvaart"], choices=["rondvaart","stadswandeling","VVV"], tr="Em Amesterdão muitos turistas fazem um passeio de barco pelos canais."),
    DL([("VVV-medewerker","Kan ik u helpen?","Posso ajudar?"),("Jij","","")], ["*Ja, wat kun je hier in één dag bezoeken?","Ik ben toerist.|Incompleto.","Nee, VVV.|Não."], "Pedir sugestões.", ["v-bezoeken"]),
    LI("De stadswandeling duurt anderhalf uur.", ["De stadswandeling duurt anderhalf uur(.)"], "O passeio a pé dura uma hora e meia.", "Ouvir.", ["v-stadswandeling"]),
    MC("O que NÃO encontras normalmente no VVV?", ["*consultas médicas|Não.","mapas","informação sobre museus"], "Lógica.", ["v-vvv"]),
    AR("stadswandeling", "passeio a pé", "de", "-ing → de.", ["v-stadswandeling"]),
  ], diff=2, mins=4)

L(14, "Noite de compras", "De koopavond.",
  ["Falar de horários especiais das lojas"],
  vocab=[],
  ex=[("Op donderdag is het koopavond: de winkels zijn tot negen uur open.","À quinta há abertura noturna: as lojas estão abertas até às nove."),("Op zondag zijn veel winkels pas om twaalf uur open.","Ao domingo muitas lojas só abrem ao meio-dia.")],
  review=["v-koopavond","v-openingstijden","v-gesloten","v-winkelcentrum","v-alleen"],
  cefr=C, exs=[
    MC("«Koopavond» é…", ["*uma noite por semana em que as lojas fecham mais tarde","uma promoção de comida|Não.","um feriado|Não."], "Conceito.", ["v-koopavond"]),
    TR("pt-nl","As lojas estão abertas até às nove.", ["De winkels zijn tot negen uur open(.)","De winkels zijn open tot negen uur(.)"], "tot.", ["v-openingstijden"]),
    TR("pt-nl","Ao domingo a loja está fechada.", ["Op zondag is de winkel gesloten(.)","De winkel is op zondag gesloten(.)","Op zondag is de winkel dicht(.)"], "gesloten.", ["v-gesloten"]),
    FB("Het winkelcentrum is ___ op zondag open van twaalf tot vijf.", ["alleen"], "Só.", ["v-alleen"], choices=["alleen","nooit","koop"], tr="O centro comercial ao domingo só está aberto das doze às cinco."),
    LI("Donderdag is het koopavond in het centrum.", ["Donderdag is het koopavond in het centrum(.)"], "Na quinta há abertura noturna no centro.", "Ouvir.", ["v-koopavond"]),
    MC("A frase «Pas om twaalf uur open» significa…", ["*só abre ao meio-dia","abriu ao meio-dia e já fechou|Não.","está sempre aberto|Não."], "pas = só (tempo).", ["v-openingstijden"]),
    DL([("Vriend","Gaan we vanavond winkelen?","Vamos às compras esta noite?"),("Jij","","")], ["*Ja, het is donderdag, dus koopavond!","Nee, gesloten is leuk.|Não.","Ik ben koopavond.|Não."], "Responder.", ["v-koopavond"]),
    WO("A loja está fechada.", ["De","winkel","is","gesloten."], "Ordem.", ["v-gesloten"]),
  ], diff=2, mins=4)

L(15, "Prática: um dia livre na cidade", "Een dagje uit in de stad.",
  ["Planear um dia na cidade"],
  vocab=[],
  ex=[("(Fictício) 's Ochtends gaan we naar de weekmarkt. 's Middags maken we een stadswandeling en bezoeken we het museum. 's Avonds eten we in het centrum.","De manhã vamos ao mercado…")],
  review=["v-weekmarkt","v-stadswandeling","v-museum","v-bibliotheek","v-zwembad","v-vvv","v-centrum"],
  cefr=C, exs=[
    MC("(Fictício) «'s Middags maken we een stadswandeling.» O que fazem à tarde?", ["*um passeio a pé","nadam|Não.","vão à biblioteca|Não."], "Compreensão.", ["v-stadswandeling"]),
    MC("(Fictício) «Het museum is op maandag gesloten.» Quando NÃO podes ir ao museu?", ["*à segunda","ao sábado|Não.","nunca|Não."], "Compreensão.", ["v-gesloten"]),
    TR("pt-nl","De manhã vamos ao mercado.", ["'s Ochtends gaan we naar de markt(.)","'s Ochtends gaan we naar de weekmarkt(.)"], "Inversão.", ["v-weekmarkt"]),
    TR("pt-nl","Visitamos o museu à tarde.", ["We bezoeken 's middags het museum(.)","'s Middags bezoeken we het museum(.)"], "bezoeken.", ["v-bezoeken","v-museum"]),
    LI("Bij het VVV kun je kaartjes voor de rondvaart kopen.", ["Bij het VVV kun je kaartjes voor de rondvaart kopen(.)"], "No posto de turismo podes comprar bilhetes para o passeio de barco.", "Ouvir.", ["v-vvv","v-rondvaart"]),
    BS("Depois jantamos no centro.", ["Daarna","eten","we","in","het","centrum."], ["Daarna eten we in het centrum."], "Inversão.", ["v-centrum"]),
    DL([("Vriendin","Wat zullen we zaterdag doen?","O que fazemos no sábado?"),("Jij","","")], ["*Eerst naar de markt en dan een rondvaart. Leuk?","Gesloten.|Não.","Ik ben zaterdag.|Não."], "Propor.", ["v-rondvaart"]),
    SW("Planeie um sábado na sua cidade (4 frases: manhã, tarde, noite, onde).", ["'s Ochtends ga ik naar de bibliotheek. Daarna koop ik groente op de weekmarkt. 's Middags zwem ik in het zwembad. 's Avonds eet ik met vrienden in het centrum."], ["Manhã/tarde/noite","Lugares"], 20, "Escrever.", ["v-weekmarkt"]),
  ], diff=2, mins=5)

W()
