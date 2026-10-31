import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u05")
C = "A1-A2"
# Lições extra (10–15): comida neerlandesa, molhos, loiça, elogiar e um jantar com amigos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Petiscos neerlandeses", "Haring en bitterballen.",
  ["Conhecer petiscos típicos e pedi-los"],
  vocab=[N("v-haring","haring","arenque","de","haringen"), N("v-bitterballen","bitterballen","bolinhas fritas de carne (petisco)","de")],
  ex=[("Op de markt eet ik een haring met ui.","No mercado como um arenque com cebola."),("Bij het bier bestellen we bitterballen.","Com a cerveja pedimos bitterballen.")],
  review=["v-typisch","v-stroopwafel","v-patat"],
  cefr=C, exs=[
    MA([("haring","arenque"),("bitterballen","bolinhas fritas"),("stroopwafel","waffle com caramelo"),("patat","batata frita")], "Petiscos.", ["v-haring","v-bitterballen","v-stroopwafel","v-patat"]),
    MC("Os bitterballen comem-se tipicamente…", ["*no bar, com uma bebida","ao pequeno-almoço|Não.","como sobremesa|Não."], "Cultura.", ["v-bitterballen"]),
    MC("O arenque costuma comer-se…", ["*cru (curado), com cebola","frito com açúcar|Não.","em sopa|Não."], "Cultura.", ["v-haring"]),
    TR("pt-nl","Pedimos bitterballen.", ["We bestellen bitterballen(.)","Wij bestellen bitterballen(.)"], "bestellen.", ["v-bitterballen"]),
    TR("nl-pt","Haring is typisch Nederlands.", ["O arenque é tipicamente neerlandês(.)"], "typisch.", ["v-haring","v-typisch"]),
    FB("Een portie ___ bij het bier, graag.", ["bitterballen"], "Petisco.", ["v-bitterballen"], choices=["bitterballen","haring","soep"], tr="Uma dose de bitterballen com a cerveja, por favor."),
    LI("Wil je een haring proberen?", ["Wil je een haring proberen(?)"], "Queres provar um arenque?", "Ouvir.", ["v-haring"]),
    AR("haring", "arenque", "de", "de haring.", ["v-haring"]),
  ], diff=2, mins=4)

L(11, "Stamppot com salsicha", "Stamppot met rookworst.",
  ["Descrever um prato de inverno típico"],
  vocab=[N("v-rookworst","rookworst","salsicha fumada","de","rookworsten")],
  ex=[("In de winter eten we stamppot met rookworst.","No inverno comemos stamppot com salsicha fumada."),("Stamppot is aardappel met groente.","Stamppot é batata esmagada com legumes.")],
  review=["v-stamppot","v-aardappel","v-groente","v-warm-eten"],
  cefr=C, exs=[
    MC("«Stamppot» é…", ["*puré de batata misturado com legumes","sopa de peixe|Não.","um bolo|Não."], "Prato.", ["v-stamppot"]),
    TR("pt-nl","No inverno comemos stamppot.", ["In de winter eten we stamppot(.)","'s Winters eten we stamppot(.)"], "Inversão.", ["v-stamppot"]),
    TR("pt-nl","Stamppot com salsicha fumada.", ["Stamppot met rookworst(.)"], "met.", ["v-rookworst"]),
    FB("Stamppot is ___ met groente.", ["aardappel"], "Base.", ["v-aardappel"], choices=["aardappel","rijst","vis"], tr="Stamppot é batata com legumes."),
    LI("Ik eet graag stamppot met rookworst.", ["Ik eet graag stamppot met rookworst(.)"], "Gosto de stamppot com salsicha fumada.", "Ouvir.", ["v-rookworst"]),
    MC("Um prato português comparável (batata e couve):", ["*caldo verde","pastel de nata|É doce.","arroz de marisco|Não."], "Comparar.", ["v-stamppot"]),
    DL([("Buurvrouw","Heb je ooit stamppot gegeten?","Já alguma vez comeste stamppot?"),("Jij","","")], ["*Nee, nog niet. Is het lekker?","Ja, op het strand.|Não faz sentido.","Ik ben stamppot.|Não."], "Responder.", ["v-stamppot"]),
    AR("rookworst", "salsicha fumada", "de", "de worst.", ["v-rookworst"]),
  ], diff=2, mins=4)

L(12, "Batatas fritas com…?", "Patat met mayonaise.",
  ["Pedir batatas fritas e molhos"],
  vocab=[N("v-mayonaise","mayonaise","maionese","de")],
  ex=[("Een patat met mayonaise, alstublieft.","Umas batatas fritas com maionese, por favor."),("Met of zonder mayonaise?","Com ou sem maionese?")],
  review=["v-patat","v-peper","v-zout"],
  cefr=C, exs=[
    MC("«Een patatje met» significa…", ["*batatas fritas com maionese","batatas sem nada|«met» = com maionese.","batatas com ketchup|Não, isso tem outro nome."], "Expressão popular.", ["v-patat","v-mayonaise"]),
    TR("pt-nl","Com ou sem maionese?", ["Met of zonder mayonaise?"], "met / zonder.", ["v-mayonaise"]),
    TR("pt-nl","Umas batatas fritas com maionese, por favor.", ["Een patat met mayonaise(,) alstublieft(.)","Een patatje met(,) alstublieft(.)"], "patat.", ["v-patat"]),
    FB("Zonder ___, alstublieft. Ik eet niet zo zout.", ["zout"], "Sal.", ["v-zout"], choices=["zout","peper","patat"], tr="Sem sal, por favor. Não como muito salgado."),
    DL([("Medewerker","Patat met?","Batatas com (maionese)?"),("Jij","","")], ["*Nee, zonder, alstublieft.","Ja, met zout en zonder.|Confuso.","Ik ben patat.|Não."], "Pedir.", ["v-patat"]),
    LI("Een grote patat met mayonaise.", ["Een grote patat met mayonaise(.)"], "Umas batatas grandes com maionese.", "Ouvir.", ["v-mayonaise"]),
    MC("No sul dos Países Baixos e na Bélgica, a batata frita chama-se muitas vezes…", ["*friet","stamppot|Não.","pindakaas|Não."], "Variação regional.", ["v-patat"]),
    WO("Com maionese, por favor.", ["Met","mayonaise,","alstublieft."], "Ordem.", ["v-mayonaise"]),
  ], diff=2, mins=4)

L(13, "Depois do jantar", "De afwas doen.",
  ["Falar de lavar a loiça e arrumar a mesa"],
  vocab=[N("v-afwas","afwas","loiça (para lavar)","de"), X("v-afruimen","de tafel afruimen","levantar a mesa","verb")],
  ex=[("Wie doet de afwas?","Quem lava a loiça?"),("Ik ruim de tafel af en jij doet de afwas.","Eu levanto a mesa e tu lavas a loiça.")],
  review=["v-tafel-dekken","v-pan"],
  cefr=C, exs=[
    MA([("de tafel dekken","pôr a mesa"),("de tafel afruimen","levantar a mesa"),("de afwas doen","lavar a loiça"),("pan","panela")], "Mesa.", ["v-tafel-dekken","v-afruimen","v-afwas","v-pan"]),
    MC("Antes de comer…", ["*dek je de tafel","ruim je de tafel af|Isso é depois.","doe je de afwas|Isso é depois."], "Ordem lógica.", ["v-tafel-dekken"]),
    TR("pt-nl","Quem lava a loiça?", ["Wie doet de afwas?","Wie wast af?"], "de afwas doen.", ["v-afwas"]),
    TR("pt-nl","Eu levanto a mesa.", ["Ik ruim de tafel af(.)"], "Separável.", ["v-afruimen"]),
    MC("Qual é a ordem correta?", ["*Ik ruim de tafel af.","Ik afruim de tafel.|Separável: «af» no fim."], "Separável.", ["v-afruimen"]),
    FB("Na het eten doe ik de ___.", ["afwas"], "Loiça.", ["v-afwas"], choices=["afwas","pan","tafel"], tr="Depois de comer lavo a loiça."),
    LI("Jij kookt, dus ik doe de afwas.", ["Jij kookt(,) dus ik doe de afwas(.)"], "Tu cozinhas, por isso eu lavo a loiça.", "Ouvir.", ["v-afwas"]),
    DL([("Gastheer","Laat maar, ik doe de afwas straks.","Deixa, eu lavo a loiça depois."),("Jij","","")], ["*Nee joh, ik help je even!","Ja, jij bent de afwas.|Não.","Proost!|Não."], "Oferecer ajuda.", ["v-afwas"]),
  ], diff=2, mins=4)

L(14, "Elogiar o anfitrião", "Wat heb je lekker gekookt!",
  ["Elogiar a comida e agradecer o jantar"],
  vocab=[X("v-heerlijk","heerlijk","delicioso","adjective")],
  ex=[("Het was heerlijk!","Estava delicioso!"),("Dank je wel voor het lekkere eten.","Obrigado pela comida tão boa.")],
  review=["v-lekker","v-smaken","v-eet-smakelijk","v-genoeg","v-nog"],
  cefr=C, exs=[
    MA([("heerlijk","delicioso"),("eet smakelijk","bom apetite"),("genoeg","suficiente"),("nog","mais / ainda")], "À mesa.", ["v-heerlijk","v-eet-smakelijk","v-genoeg","v-nog"]),
    MC("Oferecem-te mais e estás satisfeito:", ["*Nee, dank je, ik heb genoeg gehad.","Nee, het is vies.|Rude.","Ja, nog genoeg.|Confuso."], "Recusar com educação.", ["v-genoeg"]),
    TR("pt-nl","Estava delicioso!", ["Het was heerlijk(!)"], "heerlijk.", ["v-heerlijk"]),
    TR("pt-nl","Posso comer mais um pouco?", ["Mag ik nog een beetje?","Mag ik nog wat?"], "nog.", ["v-nog"]),
    FB("Het eten smaakt ___!", ["heerlijk"], "Delicioso.", ["v-heerlijk"], choices=["heerlijk","vies","genoeg"], tr="A comida está deliciosa!"),
    DL([("Gastvrouw","Wil je nog wat soep?","Queres mais sopa?"),("Jij","","")], ["*Graag, het is echt heerlijk!","Nee, smaakt niet.|Rude.","Eet smakelijk.|Diz-se antes de comer."], "Aceitar e elogiar.", ["v-heerlijk"]),
    LI("Dank je wel, het was heerlijk.", ["Dank je wel(,) het was heerlijk(.)"], "Obrigado, estava delicioso.", "Ouvir.", ["v-heerlijk"]),
    WO("Estava delicioso.", ["Het","was","heerlijk."], "Ordem.", ["v-heerlijk"]),
  ], diff=2, mins=4)

L(15, "Prática: um jantar com amigos", "Een etentje.",
  ["Seguir as fases de um jantar em casa de amigos"],
  vocab=[],
  ex=[("(Fictício) Eerst drinken we iets. Dan eten we soep. Daarna stamppot. Als toetje is er een stroopwafel.","Primeiro bebemos alguma coisa…")],
  review=["v-proost","v-eet-smakelijk","v-heerlijk","v-afwas","v-soep","v-stamppot","v-tafel-dekken"],
  cefr=C, exs=[
    MC("Ao levantar o copo dizes:", ["*Proost!","Eet smakelijk!|É antes de comer.","Afwas!|Não."], "Brinde.", ["v-proost"]),
    MC("Antes de começar a comer dizes:", ["*Eet smakelijk!","Proost!|É o brinde.","Het was heerlijk!|É no fim."], "Bom apetite.", ["v-eet-smakelijk"]),
    MC("(Fictício) «Eerst soep, daarna stamppot.» Qual é o prato principal?", ["*stamppot","soep|É a entrada.","stroopwafel|É a sobremesa."], "Compreensão.", ["v-stamppot"]),
    TR("pt-nl","Obrigado pelo jantar!", ["Bedankt voor het eten(!)","Dank je wel voor het eten(!)","Bedankt voor het etentje(!)"], "bedankt voor.", ["v-bedankt"]),
    LI("Zullen we de tafel dekken?", ["Zullen we de tafel dekken(?)"], "Pomos a mesa?", "Ouvir.", ["v-tafel-dekken"]),
    BS("Primeiro comemos sopa, depois stamppot.", ["Eerst","eten","we","soep,","daarna","stamppot."], ["Eerst eten we soep, daarna stamppot."], "Sequência.", ["v-soep"]),
    DL([("Vriend","Wil je nog iets drinken?","Queres beber mais alguma coisa?"),("Jij","","")], ["*Een glaasje water, graag.","Proost, afwas.|Não.","Nee, vies.|Rude."], "Responder.", ["v-nog"]),
    SW("Escreva uma mensagem curta a agradecer um jantar (2–3 frases).", ["Hoi Sanne! Dank je wel voor het etentje. De stamppot was heerlijk. Volgende keer kook ik!"], ["Agradecer","Elogiar"], 12, "Escrever.", ["v-heerlijk"]),
  ], diff=2, mins=5)

W()
