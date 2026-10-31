import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u12")
C = "A1-A2"
# Lições extra (10–15): vento e temperatura, gelo, sol, chuva e um boletim meteorológico.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Vento e temperatura", "Veel wind en tien graden.",
  ["Falar do vento e da temperatura"],
  vocab=[N("v-wind","wind","vento","de"), N("v-temperatuur","temperatuur","temperatura","de","temperaturen")],
  ex=[("Er is veel wind vandaag.","Hoje há muito vento."),("De temperatuur is tien graden.","A temperatura é de dez graus.")],
  review=["v-waaien","v-graad","v-koud","v-warm"],
  cefr=C, exs=[
    MA([("wind","vento"),("waaien","ventar"),("temperatuur","temperatura"),("graad","grau")], "Tempo.", ["v-wind","v-waaien","v-temperatuur","v-graad"]),
    MC("«Het waait hard» significa…", ["*Está muito vento.","Está muito calor.|Não.","Chove muito.|Isso é «het regent hard»."], "waaien.", ["v-waaien"]),
    TR("pt-nl","Hoje há muito vento.", ["Er is veel wind vandaag(.)","Het waait hard vandaag(.)","Vandaag is er veel wind(.)"], "wind.", ["v-wind"]),
    TR("pt-nl","Estão quinze graus.", ["Het is vijftien graden(.)","Het is 15 graden(.)"], "graden.", ["v-graad"]),
    FB("De ___ is vandaag twintig graden.", ["temperatuur"], "Temperatura.", ["v-temperatuur"], choices=["temperatuur","wind","regen"], tr="A temperatura hoje é de vinte graus."),
    LI("Met deze wind is fietsen zwaar.", ["Met deze wind is fietsen zwaar(.)"], "Com este vento, andar de bicicleta é difícil.", "Ouvir.", ["v-wind","v-zwaar"]),
    MC("Nos Países Baixos o vento é um problema sobretudo para…", ["*quem anda de bicicleta","quem anda de comboio|Menos.","quem está em casa|Não."], "Vida real.", ["v-wind"]),
    AR("temperatuur", "temperatura", "de", "-uur → de.", ["v-temperatuur"]),
  ], diff=2, mins=4)

L(11, "Gelo e frio", "Het vriest en het is glad.",
  ["Avisar que está a gelar e o chão escorrega"],
  vocab=[X("v-het-vriest","het vriest","está a gelar"), X("v-glad","glad","escorregadio","adjective"), X("v-min-graden","min … graden","… graus negativos")],
  ex=[("Het vriest: het is min vier graden.","Está a gelar: estão quatro graus negativos."),("Pas op, de weg is glad!","Cuidado, a estrada está escorregadia!")],
  review=["v-winter","v-sneeuwen","v-koud"],
  cefr=C, exs=[
    MA([("het vriest","está a gelar"),("glad","escorregadio"),("sneeuwen","nevar"),("min vier graden","-4 °C")], "Inverno.", ["v-het-vriest","v-glad","v-sneeuwen","v-min-graden"]),
    MC("«Min drie graden» =", ["*−3 °C","3 °C|Não.","13 °C|Não."], "Negativo.", ["v-min-graden"]),
    TR("pt-nl","Está a gelar.", ["Het vriest(.)"], "vriezen.", ["v-het-vriest"]),
    TR("pt-nl","Cuidado, está escorregadio!", ["Pas op(,) het is glad(!)"], "glad.", ["v-glad"]),
    FB("De weg is ___, rij langzaam!", ["glad"], "Escorregadio.", ["v-glad"], choices=["glad","warm","zonnig"], tr="A estrada está escorregadia, conduz devagar!"),
    LI("Vannacht vriest het: min vijf graden.", ["Vannacht vriest het(:) min vijf graden(.)","Vannacht vriest het(,) min vijf graden(.)"], "Esta noite gela: cinco graus negativos.", "Ouvir.", ["v-het-vriest"]),
    MC("Quando está muito frio, os canais podem…", ["*gelar, e as pessoas patinam","ferver|Não.","secar|Não."], "Cultura.", ["v-het-vriest"]),
    WO("Está escorregadio.", ["Het","is","glad."], "Ordem.", ["v-glad"]),
  ], diff=2, mins=4)

L(12, "Dias de sol", "Zonnebril en zonnebrand.",
  ["Preparar-te para um dia de sol"],
  vocab=[N("v-zonnebril","zonnebril","óculos de sol","de"), N("v-zonnebrand","zonnebrand","protetor solar","de")],
  ex=[("De zon schijnt: neem je zonnebril mee!","Está sol: leva os óculos de sol!"),("Smeer je in met zonnebrand.","Põe protetor solar.")],
  review=["v-zon","v-schijnen","v-zonnig","v-zomer"],
  cefr=C, exs=[
    MA([("zonnebril","óculos de sol"),("zonnebrand","protetor solar"),("zonnig","soalheiro"),("schijnen","brilhar")], "Verão.", ["v-zonnebril","v-zonnebrand","v-zonnig","v-schijnen"]),
    TR("pt-nl","O sol brilha.", ["De zon schijnt(.)"], "schijnen.", ["v-zon","v-schijnen"]),
    TR("pt-nl","Leva os óculos de sol.", ["Neem je zonnebril mee(.)","Neem jouw zonnebril mee(.)"], "meenemen.", ["v-zonnebril"]),
    FB("Op het strand gebruik ik ___.", ["zonnebrand"], "Protetor.", ["v-zonnebrand"], choices=["zonnebrand","paraplu","sjaal"], tr="Na praia uso protetor solar."),
    LI("Het wordt morgen zonnig en warm.", ["Het wordt morgen zonnig en warm(.)"], "Amanhã vai estar sol e calor.", "Ouvir.", ["v-zonnig","v-worden"]),
    MC("Num dia de sol NÃO precisas de…", ["*een paraplu|É para a chuva.","een zonnebril","zonnebrand"], "Lógica.", ["v-paraplu"]),
    DL([("Vriend","Gaan we naar het strand?","Vamos à praia?"),("Jij","","")], ["*Ja! Ik neem zonnebrand mee.","Nee, het is zonnig.|Contraditório.","Ik ben zonnebril.|Não."], "Responder.", ["v-zonnebrand"]),
    AR("zonnebril", "óculos de sol", "de", "de bril.", ["v-zonnebril"]),
  ], diff=2, mins=4)

L(13, "Dias de chuva", "Mijn regenjas en mijn paraplu.",
  ["Preparar-te para a chuva (e o vento)"],
  vocab=[N("v-regenjas","regenjas","impermeável","de","regenjassen")],
  ex=[("Het regent: ik doe mijn regenjas aan.","Está a chover: visto o impermeável."),("Met deze wind heb je niets aan een paraplu.","Com este vento, um guarda-chuva não serve de nada.")],
  review=["v-regen","v-regenen","v-paraplu","v-nat","v-buien"],
  cefr=C, exs=[
    MA([("regenjas","impermeável"),("paraplu","guarda-chuva"),("nat","molhado"),("bui","aguaceiro")], "Chuva.", ["v-regenjas","v-paraplu","v-nat","v-buien"]),
    MC("Porque é que muitos neerlandeses preferem o impermeável ao guarda-chuva?", ["*Por causa do vento e da bicicleta","Porque o guarda-chuva é proibido|Não.","Porque nunca chove|Não."], "Vida real.", ["v-regenjas"]),
    TR("pt-nl","Está a chover outra vez.", ["Het regent weer(.)","Het regent alweer(.)"], "regenen.", ["v-regenen"]),
    TR("pt-nl","Estou todo molhado.", ["Ik ben helemaal nat(.)"], "nat.", ["v-nat"]),
    FB("Neem je ___ mee, er komen buien!", ["regenjas"], "Impermeável.", ["v-regenjas"], choices=["regenjas","zonnebril","zonnebrand"], tr="Leva o impermeável, vêm aguaceiros!"),
    LI("Vanmiddag zijn er buien.", ["Vanmiddag zijn er buien(.)"], "Esta tarde há aguaceiros.", "Ouvir.", ["v-buien"]),
    DL([("Collega","Je bent helemaal nat!","Estás todo molhado!"),("Jij","","")], ["*Ja, ik had geen regenjas bij me.","Ja, het is zonnig.|Contraditório.","Nat is een kleur.|Não."], "Responder.", ["v-regenjas"]),
    WO("Está a chover.", ["Het","regent."], "Ordem.", ["v-regenen"]),
  ], diff=2, mins=4)

L(14, "Vai ficar…", "Het wordt warmer.",
  ["Descrever mudanças do tempo com worden"],
  vocab=[],
  ex=[("Het wordt morgen warmer.","Amanhã vai ficar mais quente."),("In de herfst wordt het vroeg donker.","No outono escurece cedo.")],
  gram=[G("g-s2u12c-1","Worden = ficar, tornar-se","**worden** indica mudança: *het **wordt** koud* (está a ficar frio). Conjugação: ik word, jij wordt, het **wordt**, wij worden.")],
  review=["v-worden","v-herfst","v-lente","v-donker"],
  cefr=C, exs=[
    MC("«Het wordt koud» significa…", ["*Está a ficar frio.","Está frio.|Isso é «het is koud».","Estava frio.|Não."], "Mudança.", ["v-worden"]),
    CJ("worden","het","Het ___ warmer.", ["wordt"], "het wordt (d + t).", ["v-worden"]),
    CJ("worden","ik","Ik ___ moe van de wind.", ["word"], "ik word.", ["v-worden"]),
    TR("pt-nl","Amanhã vai ficar mais quente.", ["Het wordt morgen warmer(.)","Morgen wordt het warmer(.)"], "worden.", ["v-worden"]),
    TR("pt-nl","No outono escurece cedo.", ["In de herfst wordt het vroeg donker(.)"], "wordt donker.", ["v-herfst","v-donker"]),
    FB("In de lente ___ het weer warmer.", ["wordt"], "Mudança.", ["v-worden","v-lente"], choices=["wordt","is","word"], tr="Na primavera o tempo fica mais quente."),
    LI("Het wordt een mooie dag.", ["Het wordt een mooie dag(.)"], "Vai ser um dia bonito.", "Ouvir.", ["v-worden"]),
    FE(["Het","word","koud."], 1, "wordt", "het wordt.", ["v-worden"]),
  ], diff=2, mins=4)

L(15, "Prática: o boletim meteorológico", "Het weerbericht.",
  ["Perceber um boletim curto e falar do tempo"],
  vocab=[],
  ex=[("(Fictício) Morgen eerst zon, later buien. Veel wind uit het westen. Temperatuur: twaalf graden.","Amanhã primeiro sol, depois aguaceiros…")],
  review=["v-weerbericht","v-wind","v-temperatuur","v-buien","v-zonnig","v-het-vriest","v-regenjas"],
  cefr=C, exs=[
    MC("(Fictício) «Morgen eerst zon, later buien.» Como estará à tarde?", ["*com aguaceiros","só sol|Primeiro.","neve|Não."], "Compreensão.", ["v-buien"]),
    MC("(Fictício) «Temperatuur: min twee.» Que levas?", ["*casaco, gorro e luvas","óculos de sol e protetor|Está a gelar.","nada|Não."], "Inferir.", ["v-min-graden"]),
    LI("Het weerbericht zegt: morgen regen.", ["Het weerbericht zegt(:) morgen regen(.)","Het weerbericht zegt morgen regen(.)"], "O boletim diz: amanhã chuva.", "Ouvir.", ["v-weerbericht"]),
    LI("Het is bewolkt en het waait hard.", ["Het is bewolkt en het waait hard(.)"], "Está nublado e há muito vento.", "Ouvir.", ["v-bewolkt","v-waaien"]),
    TR("pt-nl","Que tempo vai estar amanhã?", ["Wat voor weer wordt het morgen?","Hoe wordt het weer morgen?"], "worden.", ["v-weerbericht","v-worden"]),
    DL([("Buurman","Wat een vreselijk weer, hè?","Que tempo horrível, não?"),("Jij","","")], ["*Ja, maar morgen wordt het beter!","Ja, zonnebril.|Não.","Nee, ik ben weer.|Não."], "Small talk.", ["v-vreselijk"]),
    BS("Amanhã vai estar sol e calor.", ["Morgen","wordt","het","zonnig","en","warm."], ["Morgen wordt het zonnig en warm."], "Inversão.", ["v-zonnig","v-worden"]),
    SW("Escreva o boletim de hoje para a sua cidade (3 frases: céu, temperatura, vento).", ["Vandaag is het bewolkt met af en toe regen. De temperatuur is tien graden. Er is veel wind."], ["Céu","Temperatura","Vento"], 15, "Escrever.", ["v-temperatuur","v-wind"]),
  ], diff=2, mins=5)

W()
