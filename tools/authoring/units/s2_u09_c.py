import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u09")
C = "A1-A2"
# Lições extra (10–15): mais pares de adjetivos e prática intensiva da terminação -e.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Alto, baixo e largo", "Hoog, laag en breed.",
  ["Descrever tamanho e forma"],
  vocab=[X("v-hoog","hoog","alto (coisas)","adjective"), X("v-laag","laag","baixo (coisas)","adjective"), X("v-breed","breed","largo","adjective")],
  ex=[("De toren is hoog.","A torre é alta."),("De tafel is laag.","A mesa é baixa."),("Een brede straat.","Uma rua larga.")],
  gram=[G("g-s2u09c-1","Lang ou hoog?","Para **pessoas** usa-se **lang** (alto): *Hij is lang*. Para **coisas** usa-se **hoog**: *een hoog gebouw*. O contrário de *hoog* é **laag**.")],
  review=["v-lang","v-groot","v-klein","v-dik","v-dun"],
  cefr=C, exs=[
    MA([("hoog","alto (coisa)"),("laag","baixo (coisa)"),("breed","largo"),("lang","alto (pessoa)")], "Tamanho.", ["v-hoog","v-laag","v-breed","v-lang"]),
    MC("«Um prédio alto» =", ["*een hoog gebouw","een lang gebouw|Para coisas: hoog.","een groot gebouw|Grande, não alto."], "hoog.", ["v-hoog"]),
    MC("«Ele é alto» =", ["*Hij is lang.","Hij is hoog.|Para pessoas: lang.","Hij is breed.|Largo."], "lang.", ["v-lang"]),
    TR("pt-nl","A mesa é baixa.", ["De tafel is laag(.)"], "laag.", ["v-laag"]),
    FB("Een ___ straat. (larga)", ["brede"], "de straat → -e; breed → brede.", ["v-breed"], choices=["brede","breed","breedte"], tr="Uma rua larga."),
    FB("Het gebouw is heel ___.", ["hoog"], "Predicativo: sem -e.", ["v-hoog"], choices=["hoog","hoge","lang"], tr="O edifício é muito alto."),
    LI("Het plafond is laag.", ["Het plafond is laag(.)"], "O teto é baixo.", "Ouvir.", ["v-laag"]),
    WO("A torre é alta.", ["De","toren","is","hoog."], "Ordem.", ["v-hoog"]),
  ], diff=2, mins=4)

L(11, "Macio e duro", "Zacht en hard.",
  ["Descrever a textura das coisas"],
  vocab=[X("v-zacht","zacht","macio; baixinho (som)","adjective"), X("v-hard","hard","duro; alto (som); depressa","adjective")],
  ex=[("Het bed is lekker zacht.","A cama é bem macia."),("Praat niet zo hard!","Não fales tão alto!")],
  review=["v-sterk","v-zwak"],
  cefr=C, exs=[
    MA([("zacht","macio"),("hard","duro"),("sterk","forte"),("zwak","fraco")], "Opostos.", ["v-zacht","v-hard","v-sterk","v-zwak"]),
    MC("«Praat niet zo hard» significa…", ["*Não fales tão alto.","Não fales tão duro.|«hard» também é volume.","Fala mais devagar.|Não."], "Sentido de som.", ["v-hard"]),
    MC("«Hij fietst hard» significa…", ["*Ele anda depressa de bicicleta.","Ele anda numa bicicleta dura.|Aqui é velocidade.","Ele anda mal.|Não."], "Sentido de velocidade.", ["v-hard"]),
    TR("pt-nl","A cama é macia.", ["Het bed is zacht(.)"], "zacht.", ["v-zacht"]),
    TR("pt-nl","Fala baixinho, o bebé dorme.", ["Praat zacht(,) de baby slaapt(.)","Praat zachtjes(,) de baby slaapt(.)"], "zacht.", ["v-zacht"]),
    FB("Een ___ kussen. (macia)", ["zacht"], "Een + het-palavra: sem -e.", ["v-zacht","v-kussen"], choices=["zacht","zachte","zachter"], tr="Uma almofada macia."),
    LI("Het brood is hard.", ["Het brood is hard(.)"], "O pão está duro.", "Ouvir.", ["v-hard"]),
    WO("Não fales tão alto.", ["Praat","niet","zo","hard."], "Ordem.", ["v-hard"]),
  ], diff=2, mins=4)

L(12, "Pesado e leve", "Zwaar en licht.",
  ["Descrever o peso das coisas"],
  vocab=[X("v-zwaar","zwaar","pesado; difícil","adjective"), X("v-licht-gewicht","licht","leve","adjective")],
  ex=[("Mijn tas is zwaar.","A minha mala é pesada."),("Deze laptop is heel licht.","Este portátil é muito leve.")],
  gram=[G("g-s2u09c-2","Licht: dois sentidos","**licht** pode ser «leve» (*een lichte tas*) ou «claro, luminoso» (*een lichte kamer*). O contexto decide. **zwaar** também significa «difícil»: *een zware dag*.")],
  review=["v-licht","v-donker"],
  cefr=C, exs=[
    MA([("zwaar","pesado"),("licht","leve / claro"),("donker","escuro"),("dik","grosso")], "Opostos.", ["v-zwaar","v-licht-gewicht","v-donker","v-dik"]),
    MC("«Een zware dag» é…", ["*um dia difícil","um dia pesado (em quilos)|Sentido figurado.","um dia escuro|Não."], "Figurado.", ["v-zwaar"]),
    TR("pt-nl","A minha mala é pesada.", ["Mijn tas is zwaar(.)"], "zwaar.", ["v-zwaar"]),
    TR("pt-nl","Este portátil é leve.", ["Deze laptop is licht(.)"], "licht.", ["v-licht-gewicht"]),
    FB("Een ___ koffer. (pesada)", ["zware"], "de koffer → -e.", ["v-zwaar"], choices=["zware","zwaar","zwaren"], tr="Uma mala de viagem pesada."),
    LI("De doos is niet zwaar, hij is leeg.", ["De doos is niet zwaar(,) hij is leeg(.)"], "A caixa não é pesada, está vazia.", "Ouvir.", ["v-zwaar","v-leeg"]),
    DL([("Buurman","Zal ik je helpen? Die tas is zwaar.","Ajudo-te? Esse saco é pesado."),("Jij","","")], ["*Graag, dank je!","Nee, hij is donker.|Não faz sentido.","Ik ben licht.|Não."], "Aceitar ajuda.", ["v-zwaar"]),
    WO("A caixa é leve.", ["De","doos","is","licht."], "Ordem.", ["v-licht-gewicht"]),
  ], diff=2, mins=4)

L(13, "Com ou sem -e? Treino", "Het nieuwe huis, een nieuw huis.",
  ["Decidir depressa se o adjetivo leva -e"],
  vocab=[],
  ex=[("de nieuwe fiets, een nieuwe fiets","de-palavra: sempre -e"),("het nieuwe huis, een nieuw huis","het-palavra com «een»: sem -e")],
  gram=[G("g-s2u09c-3","Resumo","Antes do nome o adjetivo leva **-e**, **exceto** com palavra **het** no singular depois de **een / geen / sem artigo**: *een nieuw huis*. Depois de *zijn* nunca leva -e: *het huis is nieuw*.")],
  review=["v-nieuw","v-oud","v-schoon","v-vuil","v-belangrijk"],
  cefr=C, exs=[
    MC("«een ___ boek» (novo)", ["*nieuw","nieuwe|het boek + een: sem -e."], "Exceção.", ["v-nieuw"]),
    MC("«het ___ boek» (novo)", ["*nieuwe","nieuw|Com «het»: -e."], "Regra.", ["v-nieuw"]),
    MC("«een ___ fiets» (nova)", ["*nieuwe","nieuw|de fiets: sempre -e."], "de-palavra.", ["v-nieuw"]),
    MC("«De kamer is ___.» (limpo)", ["*schoon","schone|Depois de «is» não há -e."], "Predicativo.", ["v-schoon"]),
    FB("Een ___ vraag. (importante)", ["belangrijke"], "de vraag: -e.", ["v-belangrijk"], choices=["belangrijke","belangrijk"], tr="Uma pergunta importante."),
    FB("Een ___ huis. (velho)", ["oud"], "het huis + een: sem -e.", ["v-oud"], choices=["oud","oude"], tr="Uma casa velha."),
    FE(["Ik","heb","een","vuile","shirt."], 3, "vuil", "het shirt + een: sem -e.", ["v-vuil","v-shirt"]),
    FE(["Dit","is","een","schoon","kamer."], 3, "schone", "de kamer: -e.", ["v-schoon","v-kamer"]),
  ], diff=3, mins=4)

L(14, "Que tipo de…?", "Wat voor fiets heb je?",
  ["Perguntar e descrever com wat voor"],
  vocab=[],
  ex=[("Wat voor fiets heb je? — Een oude, zwarte fiets.","Que tipo de bicicleta tens? — Uma bicicleta velha e preta."),("Wat voor weer is het? — Mooi weer.","Que tempo está? — Bom tempo.")],
  review=["v-wat-voor","v-soort","v-mooi-weer","v-rustig"],
  cefr=C, exs=[
    MC("«Wat voor auto heb je?» pede…", ["*uma descrição (tipo, cor, tamanho)","o preço|Não.","onde está|Não."], "wat voor.", ["v-wat-voor"]),
    TR("pt-nl","Que tipo de casa tens?", ["Wat voor huis heb je?","Wat voor huis heb jij?"], "wat voor.", ["v-wat-voor"]),
    TR("pt-nl","Uma casa pequena e sossegada.", ["Een klein en rustig huis(.)","Een klein, rustig huis(.)"], "het huis + een: sem -e.", ["v-rustig"]),
    DL([("Collega","Wat voor werk doe je?","Que tipo de trabalho fazes?"),("Jij","","")], ["*Ik werk in een groot ziekenhuis.","Om negen uur.|Não.","Ja, werk.|Não."], "Descrever.", ["v-wat-voor"]),
    FB("Wat voor ___ muziek luister je? (tipo)", ["soort"], "soort.", ["v-soort"], choices=["soort","weer","rustig"], tr="Que tipo de música ouves?"),
    LI("Wat voor weer is het vandaag?", ["Wat voor weer is het vandaag(?)"], "Que tempo está hoje?", "Ouvir.", ["v-mooi-weer"]),
    BS("Tenho uma bicicleta velha.", ["Ik","heb","een","oude","fiets."], ["Ik heb een oude fiets."], "de fiets: -e.", ["v-oud"]),
    WO("Que tipo de carro tens?", ["Wat","voor","auto","heb","je?"], "Ordem.", ["v-wat-voor"]),
  ], diff=2, mins=4)

L(15, "Prática: descrever objetos", "Raad het voorwerp!",
  ["Descrever um objeto para alguém adivinhar"],
  vocab=[],
  ex=[("(Fictício) Het is klein, licht en zwart. Je belt ermee. Wat is het? — Een telefoon!","É pequeno, leve e preto. Ligas com ele. O que é? — Um telemóvel!")],
  review=["v-hoog","v-zacht","v-zwaar","v-licht-gewicht","v-breed","v-wat-voor"],
  cefr=C, exs=[
    MC("(Fictício) «Het is zacht, wit en je slaapt erop.» O que é?", ["*een kussen","een tafel|É dura.","een fiets|Não."], "Adivinha.", ["v-zacht","v-kussen"]),
    MC("(Fictício) «Het is groot, zwaar en koud vanbinnen. Er staat melk in.» O que é?", ["*de koelkast","de oven|É quente.","de bank|Não."], "Adivinha.", ["v-zwaar","v-koelkast"]),
    MC("(Fictício) «Het is hoog en oud. Er wonen veel mensen in.» O que é?", ["*een flat / um prédio","een muts|Não.","een appel|Não."], "Adivinha.", ["v-hoog"]),
    TR("pt-nl","É pequeno, leve e preto.", ["Het is klein(,) licht en zwart(.)"], "Predicativo: sem -e.", ["v-licht-gewicht","v-zwart"]),
    LI("Het is een zachte, warme trui.", ["Het is een zachte(,) warme trui(.)"], "É uma camisola macia e quente.", "Ouvir.", ["v-zacht"]),
    BS("Uma mala pesada e larga.", ["Een","zware,","brede","tas."], ["Een zware, brede tas."], "Dois adjetivos com -e.", ["v-zwaar","v-breed"]),
    FE(["Een","zwaar","doos."], 1, "zware", "de doos: -e.", ["v-zwaar"]),
    SW("Descreva um objeto da sua casa sem dizer o nome (3 frases), para alguém adivinhar.", ["Het is groot en zacht. Het staat in de woonkamer. Je zit erop met vrienden. (de bank)"], ["3 adjetivos","Onde está","Para que serve"], 15, "Adivinha.", ["v-zacht"]),
  ], diff=2, mins=5)

W()
