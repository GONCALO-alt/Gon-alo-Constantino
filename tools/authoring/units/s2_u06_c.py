import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u06")
C = "A1-A2"
# Lições extra (10–15): supermercado à neerlandesa — secções, talho, cartão de cliente, caixa self-service.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "As secções do supermercado", "De zuivel en de groenteafdeling.",
  ["Encontrar as secções no supermercado"],
  vocab=[N("v-zuivel","zuivel","lacticínios","de")],
  ex=[("Melk en yoghurt vind je bij de zuivel.","Leite e iogurte encontras nos lacticínios."),("Waar is de groenteafdeling?","Onde é a secção de legumes?")],
  review=["v-afdeling","v-vinden","v-winkel"],
  cefr=C, exs=[
    MA([("zuivel","lacticínios"),("afdeling","secção"),("groente","legumes"),("fruit","fruta")], "Supermercado.", ["v-zuivel","v-afdeling","v-groente","v-fruit"]),
    MC("Onde encontras iogurte?", ["*bij de zuivel","bij de groente|Não.","bij de kassa|Não."], "Secções.", ["v-zuivel","v-yoghurt"]),
    TR("pt-nl","Onde encontro o leite e o iogurte?", ["Waar vind ik de melk en de yoghurt?","Waar kan ik de melk en de yoghurt vinden?"], "vinden.", ["v-vinden","v-melk"]),
    TR("pt-nl","Nos lacticínios.", ["Bij de zuivel(.)"], "bij.", ["v-zuivel"]),
    FB("Kaas ligt bij de ___.", ["zuivel"], "Lacticínios.", ["v-zuivel"], choices=["zuivel","kassa","groente"], tr="O queijo está nos lacticínios."),
    DL([("Klant","Pardon, waar vind ik de yoghurt?","Desculpe, onde encontro o iogurte?"),("Medewerker","","")], ["*Bij de zuivel, achterin links.","Ik ben yoghurt.|Não.","Bij de kassa betalen.|Não responde."], "Responder.", ["v-zuivel"]),
    LI("De groenteafdeling is bij de ingang.", ["De groenteafdeling is bij de ingang(.)"], "A secção de legumes é junto à entrada.", "Ouvir.", ["v-afdeling"]),
    AR("zuivel", "lacticínios", "de", "de zuivel.", ["v-zuivel"]),
  ], diff=2, mins=4)

L(11, "No talho", "Bij de slager.",
  ["Comprar carne ao balcão"],
  vocab=[N("v-slager","slager","talho; talhante","de","slagers")],
  ex=[("Bij de slager koop ik vlees.","No talho compro carne."),("Vijfhonderd gram kip, alstublieft.","Quinhentos gramas de frango, por favor.")],
  review=["v-vlees","v-kip","v-pond","v-kilo","v-stuk"],
  cefr=C, exs=[
    MA([("slager","talho"),("kip","frango"),("vlees","carne"),("pond","meio quilo")], "No talho.", ["v-slager","v-kip","v-vlees","v-pond"]),
    MC("«Een pond» são…", ["*500 gramas","1 quilo|Isso é een kilo.","100 gramas|Não."], "Medida.", ["v-pond"]),
    TR("pt-nl","Meio quilo de frango, por favor.", ["Een pond kip(,) alstublieft(.)","Vijfhonderd gram kip(,) alstublieft(.)"], "pond.", ["v-pond","v-kip"]),
    TR("pt-nl","No talho compro carne.", ["Bij de slager koop ik vlees(.)","Ik koop vlees bij de slager(.)"], "bij de slager.", ["v-slager"]),
    DL([("Slager","Zeg het maar!","Diga!"),("Jij","","")], ["*Twee stukken kip, alstublieft.","Ik ben slager.|Não.","Tot ziens!|Ainda não."], "Pedir.", ["v-stuk"]),
    DL([("Slager","Mag het ietsje meer zijn?","Pode ser um bocadinho mais?"),("Jij","","")], ["*Ja hoor, geen probleem.","Nee, ik ben vegetarisch.|Confuso: estás a comprar carne.","Proost!|Não."], "Expressão típica do balcão.", ["v-slager"]),
    LI("Een kilo gehakt, alstublieft.", ["Een kilo gehakt(,) alstublieft(.)"], "Um quilo de carne picada, por favor.", "gehakt = carne picada.", ["v-kilo"]),
    FB("Bij de ___ koop ik vlees.", ["slager"], "Talho.", ["v-slager"], choices=["slager","kassa","zuivel"], tr="No talho compro carne."),
  ], diff=2, mins=4)

L(12, "O cartão de cliente", "Heeft u een bonuskaart?",
  ["Responder às perguntas habituais na caixa"],
  vocab=[N("v-klantenkaart","klantenkaart","cartão de cliente","de")],
  ex=[("Heeft u een klantenkaart? — Nee, dank u.","Tem cartão de cliente? — Não, obrigado."),("Wilt u de bon? — Nee, hoeft niet.","Quer o talão? — Não, não é preciso.")],
  review=["v-kassa","v-bon","v-pinnen","v-tasje","v-korting"],
  cefr=C, exs=[
    MA([("klantenkaart","cartão de cliente"),("bon","talão"),("tasje","saco"),("korting","desconto")], "Na caixa.", ["v-klantenkaart","v-bon","v-tasje","v-korting"]),
    MC("Na caixa perguntam «Wilt u een tasje?». Trazes o teu saco:", ["*Nee, dank u, ik heb een tas.","Ja, ik ben tasje.|Não.","Bon, graag.|Não responde."], "Recusar.", ["v-tasje"]),
    TR("pt-nl","Tem cartão de cliente?", ["Heeft u een klantenkaart?","Hebt u een klantenkaart?"], "klantenkaart.", ["v-klantenkaart"]),
    TR("pt-nl","Não, não é preciso.", ["Nee(,) hoeft niet(.)","Nee(,) dat hoeft niet(.)"], "hoeft niet.", ["v-bon"]),
    FB("Met de klantenkaart krijg je ___.", ["korting"], "Desconto.", ["v-korting"], choices=["korting","bon","kassa"], tr="Com o cartão de cliente tens desconto."),
    DL([("Caissière","Wilt u de bon?","Quer o talão?"),("Jij","","")], ["*Nee, hoeft niet. Dank u.","Ja, pinnen klantenkaart.|Confuso.","Tot zo!|Não."], "Responder.", ["v-bon"]),
    LI("Wilt u pinnen of contant betalen?", ["Wilt u pinnen of contant betalen(?)"], "Quer pagar com cartão ou em dinheiro?", "Ouvir.", ["v-contant","v-pinnen"]),
    AR("klantenkaart", "cartão de cliente", "de", "de kaart.", ["v-klantenkaart"]),
  ], diff=2, mins=4)

L(13, "A caixa self-service", "De zelfscankassa.",
  ["Usar uma caixa self-service e pedir ajuda"],
  vocab=[N("v-zelfscankassa","zelfscankassa","caixa self-service","de"), X("v-scannen","scannen","ler (código), digitalizar","verb")],
  ex=[("Ik scan mijn boodschappen zelf.","Passo eu as compras."),("Pardon, de zelfscankassa doet het niet.","Desculpe, a caixa self-service não funciona.")],
  review=["v-helpen","v-kassa","v-pinnen"],
  cefr=C, exs=[
    MA([("zelfscankassa","caixa self-service"),("scannen","passar o código"),("helpen","ajudar"),("pinnen","pagar com cartão")], "Self-service.", ["v-zelfscankassa","v-scannen","v-helpen","v-pinnen"]),
    TR("pt-nl","A caixa não funciona.", ["De kassa doet het niet(.)","De zelfscankassa doet het niet(.)"], "het doet het niet.", ["v-zelfscankassa"]),
    TR("pt-nl","Pode ajudar-me?", ["Kunt u mij helpen?","Kunt u me helpen?","Kun je me helpen?"], "helpen.", ["v-helpen"]),
    CJ("scannen","ik","Ik ___ de melk.", ["scan"], "ik scan (um n).", ["v-scannen"]),
    FB("Het scherm zegt: «___ uw bonuskaart.»", ["Scan"], "Imperativo.", ["v-scannen"], choices=["Scan","Scannen","Gescand"], tr="O ecrã diz: «Passe o seu cartão de cliente.»"),
    DL([("Medewerker","Lukt het met de zelfscankassa?","Está a conseguir com a caixa self-service?"),("Jij","","")], ["*Ja graag, deze fles wil niet scannen.","Nee, ik ben kassa.|Não.","Proost!|Não."], "Pedir ajuda.", ["v-scannen"]),
    LI("Er moet een medewerker komen.", ["Er moet een medewerker komen(.)"], "Tem de vir um funcionário.", "Mensagem comum no ecrã.", ["v-zelfscankassa"]),
    MC("O ecrã diz «Wacht op hulp». Fazes o quê?", ["*Esperas por um funcionário","Vais embora sem pagar|Não!","Pagas noutra loja|Não."], "Compreensão.", ["v-helpen"]),
  ], diff=2, mins=4)

L(14, "Acabou!", "De melk is op.",
  ["Dizer que um produto acabou ou está esgotado"],
  vocab=[X("v-op-zijn","op zijn","ter acabado (comida, produto)"), X("v-uitverkocht","uitverkocht","esgotado","adjective")],
  ex=[("De melk is op. Ik koop nieuwe.","Acabou o leite. Compro mais."),("Sorry, de aardbeien zijn uitverkocht.","Desculpe, os morangos estão esgotados.")],
  review=["v-boodschappen","v-kopen","v-nog"],
  cefr=C, exs=[
    MA([("op zijn","ter acabado"),("uitverkocht","esgotado"),("nog","ainda"),("kopen","comprar")], "Stock.", ["v-op-zijn","v-uitverkocht","v-nog","v-kopen"]),
    MC("Em casa, já não há café. Dizes:", ["*De koffie is op.","De koffie is uitverkocht.|Isso diz-se numa loja.","De koffie is open.|Não."], "op zijn.", ["v-op-zijn"]),
    MC("Na loja já não há pão para vender:", ["*Het brood is uitverkocht.","Het brood is op de tafel.|Não.","Het brood is dicht.|Não."], "uitverkocht.", ["v-uitverkocht"]),
    TR("pt-nl","Acabou o leite.", ["De melk is op(.)"], "op.", ["v-op-zijn"]),
    TR("pt-nl","Os morangos estão esgotados.", ["De aardbeien zijn uitverkocht(.)"], "uitverkocht.", ["v-uitverkocht","v-aardbei"]),
    FB("Er is geen kaas meer; de kaas is ___.", ["op"], "Acabou.", ["v-op-zijn"], choices=["op","uit","dicht"], tr="Já não há queijo; o queijo acabou."),
    LI("De koffie is bijna op.", ["De koffie is bijna op(.)"], "O café está quase a acabar.", "bijna = quase.", ["v-op-zijn"]),
    WO("O pão acabou.", ["Het","brood","is","op."], "Ordem.", ["v-op-zijn"]),
  ], diff=2, mins=4)

L(15, "Prática: as compras da semana", "De boodschappen van de week.",
  ["Fazer as compras do início ao fim"],
  vocab=[],
  ex=[("(Fictício) Lijst: 1 liter melk, 1 pak rijst, 2 kilo aardappels, kaas, 6 eieren.","Lista de compras.")],
  review=["v-liter","v-pak","v-kilo","v-zuivel","v-klantenkaart","v-op-zijn","v-aanbieding"],
  cefr=C, exs=[
    MC("(Fictício) Lista: «1 liter melk, 1 pak rijst, 2 kilo aardappels». Quanto leite compras?", ["*1 litro","2 quilos|É das batatas.","1 pacote|É o arroz."], "Compreensão.", ["v-liter"]),
    MC("«2 voor 3 euro» numa etiqueta significa…", ["*dois por três euros (promoção)","dois euros por três unidades|Ao contrário.","fechado das 2 às 3|Não."], "Promoção.", ["v-aanbieding"]),
    TR("pt-nl","Um pacote de arroz e um litro de leite.", ["Een pak rijst en een liter melk(.)"], "Medidas.", ["v-pak","v-liter"]),
    LI("Kaas is deze week in de aanbieding.", ["Kaas is deze week in de aanbieding(.)"], "O queijo está em promoção esta semana.", "Ouvir.", ["v-aanbieding"]),
    BS("Acabou o leite, por isso compro mais.", ["De","melk","is","op,","dus","ik","koop","nieuwe."], ["De melk is op, dus ik koop nieuwe."], "dus.", ["v-op-zijn"]),
    DL([("Caissière","Dat is dan 23 euro 40. Heeft u een klantenkaart?","São 23,40 €. Tem cartão de cliente?"),("Jij","","")], ["*Ja, hier is hij. Ik pin.","Ja, uitverkocht.|Não.","Tot zo, proost.|Não."], "Pagar.", ["v-klantenkaart","v-pinnen"]),
    FB("Een ___ melk, alstublieft.", ["liter"], "Medida para líquidos.", ["v-liter"], choices=["liter","pond","stuk"], tr="Um litro de leite, por favor."),
    SW("Escreva a sua lista de compras (5 artigos com quantidades).", ["1 liter melk\n1 pak rijst\n2 kilo aardappels\n500 gram kaas\n1 zak appels"], ["5 artigos","Quantidades"], 10, "Lista.", ["v-liter","v-kilo"]),
  ], diff=2, mins=5)

W()
