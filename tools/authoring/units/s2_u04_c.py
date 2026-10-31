import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u04")
C = "A1-A2"
# Lições extra (10–15): mais comida e bebida — fruta, legumes, frigorífico, pão neerlandês, sabores.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Mais fruta", "Aardbeien, druiven en een peer.",
  ["Nomear mais frutos e dizer quais preferes"],
  vocab=[N("v-aardbei","aardbei","morango","de","aardbeien"), N("v-druif","druif","uva","de","druiven"), N("v-peer","peer","pera","de","peren")],
  ex=[("Ik eet graag aardbeien.","Gosto de comer morangos."),("Een kilo druiven, alstublieft.","Um quilo de uvas, por favor.")],
  review=["v-fruit","v-banaan","v-sinaasappel","v-appel"],
  cefr=C, exs=[
    MA([("aardbei","morango"),("druif","uva"),("peer","pera"),("sinaasappel","laranja")], "Fruta.", ["v-aardbei","v-druif","v-peer","v-sinaasappel"]),
    MC("Plural de «aardbei»:", ["*aardbeien","aardbeis|Não.","aardbeiden|Não."], "Plural -en.", ["v-aardbei"]),
    MC("Plural de «druif»:", ["*druiven","druifen|f → v antes de -en.","druifs|Não."], "f → v.", ["v-druif"]),
    TR("pt-nl","Gosto de comer morangos.", ["Ik eet graag aardbeien(.)"], "graag.", ["v-aardbei","v-graag-verb"]),
    TR("pt-nl","Uma pera e uma banana, por favor.", ["Een peer en een banaan(,) alstublieft(.)"], "een.", ["v-peer","v-banaan"]),
    FB("In de zomer eet ik veel ___.", ["aardbeien"], "Plural.", ["v-aardbei"], choices=["aardbeien","aardbei","aardbeis"], tr="No verão como muitos morangos."),
    LI("Ik neem een kilo druiven.", ["Ik neem een kilo druiven(.)"], "Levo um quilo de uvas.", "Ouvir.", ["v-druif"]),
    AR("peer", "pera", "de", "de peer.", ["v-peer"]),
  ], diff=1, mins=4)

L(11, "Mais legumes", "Wortels, sla en komkommer.",
  ["Nomear legumes para uma salada"],
  vocab=[N("v-wortel","wortel","cenoura","de","wortels"), N("v-sla","sla","alface","de"), N("v-komkommer","komkommer","pepino","de","komkommers")],
  ex=[("In de salade zitten sla, tomaat en komkommer.","Na salada há alface, tomate e pepino."),("Konijnen eten graag wortels.","Os coelhos gostam de cenouras.")],
  review=["v-groente","v-tomaat","v-ui","v-aardappel"],
  cefr=C, exs=[
    MA([("wortel","cenoura"),("sla","alface"),("komkommer","pepino"),("ui","cebola")], "Legumes.", ["v-wortel","v-sla","v-komkommer","v-ui"]),
    MC("Para uma salada NÃO precisas de…", ["*een aardappel cru|Normalmente não se come crua.","sla","komkommer"], "Lógica.", ["v-sla","v-komkommer"]),
    TR("pt-nl","Na salada há alface e tomate.", ["In de salade zitten sla en tomaat(.)","In de salade zit sla en tomaat(.)"], "zitten in.", ["v-sla","v-tomaat"]),
    TR("nl-pt","Ik eet elke dag groente.", ["Como legumes todos os dias(.)"], "groente.", ["v-groente"]),
    FB("Twee ___ en een ui, alstublieft.", ["wortels"], "Plural.", ["v-wortel"], choices=["wortels","wortel","wortelen"], tr="Duas cenouras e uma cebola, por favor."),
    LI("Ik maak een salade met komkommer.", ["Ik maak een salade met komkommer(.)"], "Faço uma salada com pepino.", "Ouvir.", ["v-komkommer"]),
    AR("sla", "alface", "de", "de sla.", ["v-sla"]),
    WO("Como legumes.", ["Ik","eet","groente."], "Ordem.", ["v-groente"]),
  ], diff=1, mins=4)

L(12, "No frigorífico", "Yoghurt, ham en kaas.",
  ["Dizer o que há no frigorífico"],
  vocab=[N("v-yoghurt","yoghurt","iogurte","de"), N("v-ham","ham","fiambre","de")],
  ex=[("In de koelkast staan melk, yoghurt en kaas.","No frigorífico há leite, iogurte e queijo."),("Er is geen ham meer.","Já não há fiambre.")],
  review=["v-koelkast","v-kaas","v-melk","v-boter"],
  cefr=C, exs=[
    MA([("yoghurt","iogurte"),("ham","fiambre"),("boter","manteiga"),("kaas","queijo")], "Frigorífico.", ["v-yoghurt","v-ham","v-boter","v-kaas"]),
    TR("pt-nl","No frigorífico há iogurte.", ["In de koelkast staat yoghurt(.)","Er is yoghurt in de koelkast(.)","In de koelkast is yoghurt(.)"], "koelkast.", ["v-yoghurt","v-koelkast"]),
    TR("pt-nl","Já não há queijo.", ["Er is geen kaas meer(.)"], "geen … meer.", ["v-kaas","v-niet-meer"]),
    FB("Een broodje ___ en kaas, alstublieft.", ["ham"], "Fiambre.", ["v-ham","v-broodje"], choices=["ham","yoghurt","sap"], tr="Uma sandes de fiambre e queijo, por favor."),
    MC("O que NÃO se guarda normalmente no frigorífico?", ["*een pak rijst seco|Arroz cru fica no armário.","yoghurt","boter"], "Lógica.", ["v-koelkast"]),
    LI("Is er nog melk in de koelkast?", ["Is er nog melk in de koelkast(?)"], "Ainda há leite no frigorífico?", "Ouvir.", ["v-melk"]),
    DL([("Partner","Wat is er nog in de koelkast?","O que ainda há no frigorífico?"),("Jij","","")], ["*Kaas, ham en een beetje yoghurt.","De koelkast is wit.|Não responde.","Ik heb dorst.|Não."], "Responder.", ["v-yoghurt"]),
    WO("Não há fiambre.", ["Er","is","geen","ham."], "Ordem.", ["v-ham"]),
  ], diff=1, mins=4)

L(13, "O pão à neerlandesa", "Pindakaas en hagelslag.",
  ["Conhecer o que os neerlandeses põem no pão"],
  vocab=[N("v-pindakaas","pindakaas","manteiga de amendoim","de"), N("v-honing","honing","mel","de")],
  ex=[("Veel kinderen eten brood met hagelslag of pindakaas.","Muitas crianças comem pão com granulado de chocolate ou manteiga de amendoim."),("Ik doe honing op mijn brood.","Ponho mel no pão.")],
  review=["v-hagelslag","v-brood","v-boter","v-kaas"],
  cefr=C, exs=[
    MA([("pindakaas","manteiga de amendoim"),("hagelslag","granulado de chocolate"),("honing","mel"),("boter","manteiga")], "No pão.", ["v-pindakaas","v-hagelslag","v-honing","v-boter"]),
    MC("«Pindakaas» tem queijo?", ["*Não — é manteiga de amendoim, apesar do nome","Sim, é queijo com amendoim|Falso amigo do nome.","É um queijo picante|Não."], "Nome enganador.", ["v-pindakaas"]),
    MC("Para muitos neerlandeses, o almoço típico é…", ["*pão com queijo, fiambre ou pindakaas","uma refeição quente de três pratos|Isso é mais o jantar.","só fruta|Não."], "Cultura.", ["v-brood"]),
    TR("pt-nl","Ponho mel no pão.", ["Ik doe honing op mijn brood(.)","Ik doe honing op brood(.)"], "op brood.", ["v-honing","v-brood"]),
    TR("pt-nl","Pão com queijo, por favor.", ["Brood met kaas(,) alstublieft(.)","Een broodje kaas(,) alstublieft(.)"], "met.", ["v-brood","v-kaas"]),
    FB("Mijn zoon eet brood met ___. (granulado)", ["hagelslag"], "Hagelslag.", ["v-hagelslag"], choices=["hagelslag","honing","ham"], tr="O meu filho come pão com granulado."),
    LI("Ik eet graag brood met pindakaas.", ["Ik eet graag brood met pindakaas(.)"], "Gosto de pão com manteiga de amendoim.", "Ouvir.", ["v-pindakaas"]),
    AR("honing", "mel", "de", "de honing.", ["v-honing"]),
  ], diff=1, mins=4)

L(14, "Que sabor tem?", "Het smaakt lekker.",
  ["Dizer como sabe a comida"],
  vocab=[X("v-smaken","smaken","saber (a)","verb")],
  ex=[("Het smaakt lekker!","Sabe bem!"),("De soep smaakt een beetje zout.","A sopa está um pouco salgada."),("Hoe smaakt het?","Que tal está?")],
  review=["v-lekker","v-vies","v-zoet","v-zout","v-zuur"],
  cefr=C, exs=[
    MA([("lekker","bom (sabor)"),("vies","nojento, mau"),("zoet","doce"),("zout","salgado")], "Sabores.", ["v-lekker","v-vies","v-zoet","v-zout"]),
    MC("O empregado pergunta «Smaakt het?». Está ótimo. Respondes:", ["*Ja, heel lekker!","Ja, heel vies!|Isso seria mau.","Ja, smaken.|Não."], "Elogiar.", ["v-smaken","v-lekker"]),
    TR("pt-nl","Sabe bem!", ["Het smaakt lekker(!)","Het is lekker(!)"], "smaken.", ["v-smaken"]),
    TR("pt-nl","A sopa está um pouco doce.", ["De soep smaakt een beetje zoet(.)","De soep is een beetje zoet(.)"], "zoet.", ["v-zoet"]),
    CJ("smaken","het","Het ___ goed.", ["smaakt"], "het smaakt.", ["v-smaken"]),
    FB("Deze melk is oud; hij smaakt ___.", ["zuur"], "Azedo.", ["v-zuur"], choices=["zuur","zoet","lekker"], tr="Este leite é velho; sabe a azedo."),
    LI("Hoe smaakt de kip?", ["Hoe smaakt de kip(?)"], "Que tal está o frango?", "Ouvir.", ["v-smaken","v-kip"]),
    DL([("Gastvrouw","Smaakt het?","Está bom?"),("Jij","","")], ["*Heerlijk, dank je wel!","Nee, vies.|Rude.","Ik ben vegetarisch.|Não responde."], "Responder com educação.", ["v-smaken"]),
  ], diff=2, mins=4)

L(15, "Prática: o que comes num dia", "Mijn eten op een dag.",
  ["Descrever o que comes e bebes ao longo do dia"],
  vocab=[],
  ex=[("(Fictício) 's Ochtends eet ik yoghurt met fruit. 's Middags eet ik een broodje kaas. 's Avonds eet ik vlees of vis met groente.","De manhã como iogurte com fruta…")],
  review=["v-yoghurt","v-aardbei","v-pindakaas","v-sla","v-smaken","v-vegetarisch","v-sap"],
  cefr=C, exs=[
    MC("(Fictício) «'s Ochtends eet Lisa yoghurt met aardbeien.» O que come a Lisa de manhã?", ["*iogurte com morangos","pão com mel|Não.","salada|Não."], "Compreensão.", ["v-yoghurt","v-aardbei"]),
    MC("(Fictício) «Ze eet geen vlees; ze is vegetarisch.» O que NÃO come?", ["*carne","legumes|Come.","fruta|Come."], "Compreensão.", ["v-vegetarisch","v-vlees"]),
    TR("pt-nl","De manhã bebo sumo de laranja.", ["'s Ochtends drink ik sinaasappelsap(.)","Ik drink 's ochtends sinaasappelsap(.)","'s Ochtends drink ik jus d'orange(.)"], "sinaasappelsap.", ["v-sap","v-sinaasappel"]),
    TR("pt-nl","Não como carne.", ["Ik eet geen vlees(.)"], "geen.", ["v-vlees"]),
    LI("'s Avonds eet ik rijst met kip en groente.", ["'s Avonds eet ik rijst met kip en groente(.)"], "À noite como arroz com frango e legumes.", "Ouvir.", ["v-kip","v-groente"]),
    BS("Gosto de comer fruta.", ["Ik","eet","graag","fruit."], ["Ik eet graag fruit."], "graag.", ["v-fruit"]),
    DL([("Collega","Wat eet je als lunch?","O que comes ao almoço?"),("Jij","","")], ["*Meestal een broodje kaas en een appel.","Om twaalf uur.|É a hora.","Lekker!|Não responde."], "Responder.", ["v-broodje"]),
    SW("Escreva o que comeu ontem ou come normalmente (manhã, tarde, noite).", ["'s Ochtends eet ik brood met honing. 's Middags eet ik een salade met komkommer en tomaat. 's Avonds eet ik vis met aardappels."], ["3 refeições","Alimentos novos"], 20, "Escrever.", ["v-honing","v-komkommer"]),
  ], diff=2, mins=5)

W()
