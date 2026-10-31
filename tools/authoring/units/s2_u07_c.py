import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u07")
C = "A1-A2"
# Lições extra (10–15): mais divisões e objetos da casa, eletrodomésticos e descrição completa.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Sótão e cave", "De zolder en de kelder.",
  ["Falar das partes de cima e de baixo da casa"],
  vocab=[N("v-zolder","zolder","sótão","de","zolders"), N("v-kelder","kelder","cave","de","kelders")],
  ex=[("Op de zolder staan oude dozen.","No sótão há caixas velhas."),("Onze fietsen staan in de kelder.","As nossas bicicletas estão na cave.")],
  review=["v-boven","v-beneden","v-trap","v-verdieping"],
  cefr=C, exs=[
    MA([("zolder","sótão"),("kelder","cave"),("trap","escada"),("verdieping","andar")], "Casa.", ["v-zolder","v-kelder","v-trap","v-verdieping"]),
    MC("Onde está o sótão?", ["*boven, onder het dak","beneden|Isso é a cave.","naast de keuken|Não."], "boven / beneden.", ["v-zolder","v-boven"]),
    TR("pt-nl","As bicicletas estão na cave.", ["De fietsen staan in de kelder(.)"], "in de kelder.", ["v-kelder","v-fiets"]),
    TR("pt-nl","No sótão há um quarto.", ["Op de zolder is een kamer(.)","Er is een kamer op de zolder(.)"], "op de zolder.", ["v-zolder","v-er-is"]),
    FB("De slaapkamers zijn ___, de keuken is beneden.", ["boven"], "Em cima.", ["v-boven"], choices=["boven","kelder","trap"], tr="Os quartos são em cima, a cozinha é em baixo."),
    LI("Neem de trap naar de zolder.", ["Neem de trap naar de zolder(.)"], "Sobe a escada até ao sótão.", "Ouvir.", ["v-trap","v-zolder"]),
    AR("kelder", "cave", "de", "de kelder.", ["v-kelder"]),
    WO("O sótão é grande.", ["De","zolder","is","groot."], "Ordem.", ["v-zolder"]),
  ], diff=2, mins=4)

L(11, "Na casa de banho", "Een douche of een bad?",
  ["Descrever a casa de banho"],
  vocab=[N("v-douche","douche","duche (o equipamento)","de","douches"), N("v-bad","bad","banheira","het","baden")],
  ex=[("In de badkamer is een douche, maar geen bad.","Na casa de banho há duche, mas não banheira."),("De wc is apart.","A sanita é numa divisão à parte.")],
  gram=[G("g-s2u07c-1","Badkamer e wc","Em muitas casas neerlandesas a **wc** fica numa divisão separada da **badkamer** (onde estão o duche e o lavatório).")],
  review=["v-badkamer","v-wc","v-spiegel","v-douchen"],
  cefr=C, exs=[
    MA([("douche","duche"),("bad","banheira"),("spiegel","espelho"),("wc","sanita")], "Casa de banho.", ["v-douche","v-bad","v-spiegel","v-wc"]),
    AR("bad", "banheira", "het", "het bad.", ["v-bad"]),
    MC("Numa casa neerlandesa, a wc fica muitas vezes…", ["*numa divisão separada","dentro da cozinha|Não.","no jardim|Não."], "Cultura.", ["v-wc"]),
    TR("pt-nl","Há duche, mas não há banheira.", ["Er is een douche(,) maar geen bad(.)"], "geen.", ["v-douche","v-bad"]),
    TR("nl-pt","De spiegel hangt boven de wastafel.", ["O espelho está por cima do lavatório(.)"], "boven.", ["v-spiegel"]),
    FB("Ik neem 's ochtends een ___.", ["douche"], "Duche.", ["v-douche"], choices=["douche","bad","spiegel"], tr="De manhã tomo um duche."),
    LI("Waar is de wc?", ["Waar is de wc(?)"], "Onde é a casa de banho?", "Pergunta útil.", ["v-wc"]),
    WO("Não há banheira.", ["Er","is","geen","bad."], "Ordem.", ["v-bad"]),
  ], diff=2, mins=4)

L(12, "Eletrodomésticos", "De wasmachine en de vaatwasser.",
  ["Nomear eletrodomésticos e dizer se funcionam"],
  vocab=[N("v-wasmachine","wasmachine","máquina de lavar roupa","de","wasmachines"), N("v-vaatwasser","vaatwasser","máquina de lavar loiça","de","vaatwassers")],
  ex=[("De wasmachine staat in de badkamer.","A máquina de lavar está na casa de banho."),("De vaatwasser doet het niet.","A máquina de lavar loiça não funciona.")],
  review=["v-koelkast","v-oven","v-keuken"],
  cefr=C, exs=[
    MA([("wasmachine","máquina de lavar roupa"),("vaatwasser","máquina de lavar loiça"),("koelkast","frigorífico"),("oven","forno")], "Eletrodomésticos.", ["v-wasmachine","v-vaatwasser","v-koelkast","v-oven"]),
    MC("Para lavar pratos usas…", ["*de vaatwasser","de wasmachine|É para roupa.","de oven|Não."], "Lógica.", ["v-vaatwasser"]),
    TR("pt-nl","A máquina de lavar não funciona.", ["De wasmachine doet het niet(.)","De wasmachine werkt niet(.)"], "doet het niet.", ["v-wasmachine"]),
    TR("pt-nl","Temos uma máquina de lavar loiça.", ["We hebben een vaatwasser(.)","Wij hebben een vaatwasser(.)"], "vaatwasser.", ["v-vaatwasser"]),
    FB("De melk staat in de ___.", ["koelkast"], "Frigorífico.", ["v-koelkast"], choices=["koelkast","wasmachine","vaatwasser"], tr="O leite está no frigorífico."),
    LI("De vaatwasser staat in de keuken.", ["De vaatwasser staat in de keuken(.)"], "A máquina de lavar loiça está na cozinha.", "Ouvir.", ["v-vaatwasser"]),
    DL([("Verhuurder","Is alles in orde in het appartement?","Está tudo bem no apartamento?"),("Jij","","")], ["*Bijna: de wasmachine doet het niet.","Ja, de wasmachine is mooi.|Não informa problema.","Ik ben vaatwasser.|Não."], "Avisar.", ["v-wasmachine"]),
    AR("wasmachine", "máquina de lavar", "de", "de machine.", ["v-wasmachine"]),
  ], diff=2, mins=4)

L(13, "Decorar a sala", "Een plant en een kussen.",
  ["Falar de decoração"],
  vocab=[N("v-plant","plant","planta","de","planten"), N("v-kussen","kussen","almofada","het","kussens")],
  ex=[("Er staat een grote plant naast de bank.","Há uma planta grande ao lado do sofá."),("Op de bank liggen twee kussens.","No sofá estão duas almofadas.")],
  review=["v-bank","v-lamp","v-gordijn","v-woonkamer"],
  cefr=C, exs=[
    MA([("plant","planta"),("kussen","almofada"),("gordijn","cortina"),("bank","sofá")], "Sala.", ["v-plant","v-kussen","v-gordijn","v-bank"]),
    AR("kussen", "almofada", "het", "het kussen.", ["v-kussen"]),
    MC("Repara: «bank» na sala é…", ["*o sofá","o banco (dinheiro)|Também significa isso, mas na sala é o sofá.","a cama|Não."], "Duplo sentido.", ["v-bank"]),
    TR("pt-nl","Há uma planta ao lado do sofá.", ["Er staat een plant naast de bank(.)","Naast de bank staat een plant(.)"], "staan.", ["v-plant","v-bank"]),
    TR("pt-nl","As almofadas são azuis.", ["De kussens zijn blauw(.)"], "Plural.", ["v-kussen"]),
    FB("Er hangen nieuwe ___ voor het raam.", ["gordijnen"], "Plural.", ["v-gordijn"], choices=["gordijnen","planten","kussens"], tr="Há cortinas novas na janela."),
    LI("De woonkamer is licht en gezellig.", ["De woonkamer is licht en gezellig(.)"], "A sala é luminosa e acolhedora.", "Ouvir.", ["v-woonkamer","v-licht"]),
    WO("A planta está na sala.", ["De","plant","staat","in","de","woonkamer."], "Ordem.", ["v-plant"]),
  ], diff=2, mins=4)

L(14, "Espaçoso", "Een ruim huis met een houten vloer.",
  ["Descrever o tamanho e o chão de uma casa"],
  vocab=[X("v-ruim","ruim","espaçoso","adjective"), N("v-vloer","vloer","chão","de","vloeren")],
  ex=[("Het appartement is ruim en licht.","O apartamento é espaçoso e luminoso."),("De vloer in de woonkamer is van hout.","O chão da sala é de madeira.")],
  review=["v-groot","v-klein","v-licht","v-donker","v-appartement"],
  cefr=C, exs=[
    MA([("ruim","espaçoso"),("vloer","chão"),("licht","luminoso"),("donker","escuro")], "Descrever.", ["v-ruim","v-vloer","v-licht","v-donker"]),
    MC("O contrário de «licht» (luminoso):", ["*donker","ruim|Não.","klein|Não."], "Opostos.", ["v-licht","v-donker"]),
    TR("pt-nl","O apartamento é espaçoso.", ["Het appartement is ruim(.)"], "ruim.", ["v-ruim","v-appartement"]),
    TR("pt-nl","O chão é de madeira.", ["De vloer is van hout(.)"], "van hout.", ["v-vloer"]),
    FB("Een ___ appartement met een balkon.", ["ruim"], "Depois de «een» + het-palavra: sem -e.", ["v-ruim"], choices=["ruim","ruime","ruimer"], tr="Um apartamento espaçoso com varanda."),
    FB("De ___ kamer is mijn slaapkamer. (espaçoso)", ["ruime"], "Com «de»: -e.", ["v-ruim"], choices=["ruime","ruim","ruims"], tr="O quarto espaçoso é o meu."),
    LI("Het huis is niet groot, maar wel licht.", ["Het huis is niet groot(,) maar wel licht(.)"], "A casa não é grande, mas é luminosa.", "Ouvir.", ["v-licht"]),
    AR("vloer", "chão", "de", "de vloer.", ["v-vloer"]),
  ], diff=2, mins=4)

L(15, "Prática: a minha casa", "Mijn huis.",
  ["Descrever a tua casa por divisões"],
  vocab=[],
  ex=[("(Fictício) Ik woon in een appartement op de derde verdieping. Er zijn twee slaapkamers, een badkamer met een douche en een kleine keuken.","Moro num apartamento no terceiro andar…")],
  review=["v-er-zijn","v-slaapkamer","v-douche","v-balkon","v-ruim","v-zolder","v-wasmachine"],
  cefr=C, exs=[
    MC("(Fictício) «Ik woon op de derde verdieping, zonder lift.» O que é difícil?", ["*subir as escadas (não há elevador)","encontrar o sofá|Não.","a cave|Não."], "Compreensão.", ["v-verdieping"]),
    MC("(Fictício) «Er zijn twee slaapkamers en een balkon.» Quantos quartos?", ["*dois","um|Não.","três|Não."], "Compreensão.", ["v-er-zijn"]),
    TR("pt-nl","Há dois quartos e uma varanda.", ["Er zijn twee slaapkamers en een balkon(.)"], "er zijn.", ["v-er-zijn","v-balkon"]),
    TR("pt-nl","A cozinha é pequena mas luminosa.", ["De keuken is klein(,) maar licht(.)"], "maar.", ["v-keuken","v-licht"]),
    LI("Mijn slaapkamer is boven, naast de badkamer.", ["Mijn slaapkamer is boven(,) naast de badkamer(.)"], "O meu quarto é em cima, ao lado da casa de banho.", "Ouvir.", ["v-slaapkamer"]),
    BS("Há uma máquina de lavar na cave.", ["Er","staat","een","wasmachine","in","de","kelder."], ["Er staat een wasmachine in de kelder."], "er staat.", ["v-wasmachine","v-kelder"]),
    DL([("Nieuwe collega","Hoe is je nieuwe huis?","Como é a tua casa nova?"),("Jij","","")], ["*Ruim en licht, met een klein balkon.","Ik ben ruim.|Não.","In de kelder.|Não responde."], "Descrever.", ["v-ruim"]),
    SW("Descreva a sua casa em 4–5 frases (divisões, tamanho, o que há).", ["Ik woon in een appartement. Er zijn twee slaapkamers en een woonkamer. De keuken is klein, maar licht. In de badkamer is een douche. We hebben ook een balkon."], ["er is / er zijn","Divisões","Adjetivos"], 25, "Escrever.", ["v-er-zijn"]),
  ], diff=2, mins=5)

W()
