import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u06")
C = "A1"
# Lições extra (11–16): mais países, os países de língua portuguesa, femininos de nacionalidade e distâncias.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(11, "Mais países da Europa", "Italië en Europa.",
  ["Nomear mais países europeus"],
  vocab=[V("v-italie","Italië","Itália","noun"), V("v-europa","Europa","Europa","noun")],
  ex=[("Italië is een land in Europa.","A Itália é um país da Europa."),("Nederland en Portugal zijn allebei in Europa.","Os Países Baixos e Portugal ficam os dois na Europa.")],
  review=["v-land","v-spanje","v-frankrijk","v-duitsland","v-belgie","v-engeland"],
  cefr=C, exs=[
    MA([("Italië","Itália"),("Spanje","Espanha"),("Duitsland","Alemanha"),("België","Bélgica")], "Países.", ["v-italie","v-spanje","v-duitsland","v-belgie"]),
    MC("Qual país faz fronteira com os Países Baixos?", ["*België","Italië|Não faz fronteira.","Spanje|Não."], "Geografia.", ["v-belgie"]),
    TR("pt-nl","A Itália é um país da Europa.", ["Italië is een land in Europa(.)"], "land in.", ["v-italie","v-europa"]),
    TR("nl-pt","Frankrijk is een groot land.", ["A França é um país grande(.)"], "groot land.", ["v-frankrijk","v-land"]),
    FB("Rome is de hoofdstad van ___.", ["Italië"], "Capital.", ["v-italie","v-hoofdstad"], choices=["Italië","Spanje","Duitsland"], tr="Roma é a capital de Itália."),
    LI("Ik woon in Europa.", ["Ik woon in Europa(.)"], "Moro na Europa.", "Ouvir.", ["v-europa"]),
    MC("Berlijn is de hoofdstad van…", ["*Duitsland","Frankrijk|Paris.","België|Bruxelas."], "Capitais.", ["v-duitsland","v-hoofdstad"]),
    WO("Portugal fica na Europa.", ["Portugal","is","in","Europa."], "Ordem.", ["v-europa"]),
  ], diff=1, mins=4)

L(12, "Países onde se fala português", "Angola, Kaapverdië, Mozambique.",
  ["Falar dos países de língua portuguesa"],
  vocab=[V("v-angola","Angola","Angola","noun"), V("v-kaapverdie","Kaapverdië","Cabo Verde","noun"),
         V("v-mozambique","Mozambique","Moçambique","noun"), V("v-afrika","Afrika","África","noun")],
  ex=[("In Angola spreken ze Portugees.","Em Angola fala-se português."),("Kaapverdië is een land in Afrika.","Cabo Verde é um país de África.")],
  review=["v-brazilie","v-portugees-taal","v-spreken"],
  cefr=C, exs=[
    MA([("Kaapverdië","Cabo Verde"),("Mozambique","Moçambique"),("Angola","Angola"),("Brazilië","Brasil")], "Países lusófonos.", ["v-kaapverdie","v-mozambique","v-angola","v-brazilie"]),
    MC("Em que continente fica Moçambique?", ["*Afrika","Europa|Não.","Zuid-Amerika|O Brasil fica lá."], "Geografia.", ["v-mozambique","v-afrika"]),
    TR("pt-nl","Em Angola fala-se português.", ["In Angola spreken ze Portugees(.)","In Angola spreekt men Portugees(.)"], "spreken ze.", ["v-angola","v-portugees-taal"]),
    TR("nl-pt","Kaapverdië is klein.", ["Cabo Verde é pequeno(.)"], "klein.", ["v-kaapverdie","v-klein"]),
    FB("In Brazilië spreken ze ___.", ["Portugees"], "Língua.", ["v-portugees-taal"], choices=["Portugees","Spaans","Engels"], tr="No Brasil fala-se português."),
    LI("Mijn collega komt uit Kaapverdië.", ["Mijn collega komt uit Kaapverdië(.)"], "O meu colega é de Cabo Verde.", "Ouvir.", ["v-kaapverdie"]),
    DL([("Buurvrouw","Spreek je Portugees? Kom je uit Brazilië?","Falas português? És do Brasil?"),("Jij","","")], ["*Nee, ik kom uit Mozambique.","Ja, ik kom uit Engeland.|Não faz sentido.","Ik ben moe.|Não."], "Responder.", ["v-mozambique"]),
    WO("Moçambique fica em África.", ["Mozambique","is","in","Afrika."], "Ordem.", ["v-mozambique","v-afrika"]),
  ], diff=1, mins=4)

L(13, "Português e portuguesa", "Hij is Portugees, zij is Portugese.",
  ["Usar a forma feminina das nacionalidades"],
  vocab=[X("v-portugese","Portugese","portuguesa","noun"), X("v-nederlandse-vrouw","Nederlandse","neerlandesa","noun"),
         X("v-braziliaanse","Braziliaanse","brasileira","noun")],
  ex=[("Hij is Portugees en zij is Portugese.","Ele é português e ela é portuguesa."),("Mijn vriendin is Nederlandse.","A minha amiga é neerlandesa.")],
  gram=[G("g-s1u06c-1","Nacionalidade no feminino","Muitas nacionalidades têm uma forma feminina em **-e** ou **-se**: Portugees → **Portugese**, Nederlander → **Nederlandse**, Braziliaan → **Braziliaanse**, Belg → **Belgische**. Tal como as profissões, diz-se sem artigo: *Zij is Nederlandse*.")],
  review=["v-portugees","v-nederlander","v-braziliaans","v-belg"],
  cefr=C, exs=[
    MA([("Portugees","português"),("Portugese","portuguesa"),("Nederlander","neerlandês"),("Nederlandse","neerlandesa")], "Masculino e feminino.", ["v-portugees","v-portugese","v-nederlander","v-nederlandse-vrouw"]),
    MC("A Ana é de Lisboa. «Ana is…»", ["*Portugese","Portugees|É a forma masculina.","Portugal|É o país."], "Feminino.", ["v-portugese"]),
    MC("A Sanne é dos Países Baixos. «Sanne is…»", ["*Nederlandse","Nederlander|Masculino.","Nederland|É o país."], "Feminino.", ["v-nederlandse-vrouw"]),
    TR("pt-nl","Ela é brasileira.", ["Zij is Braziliaanse(.)","Ze is Braziliaanse(.)"], "Braziliaanse.", ["v-braziliaanse"]),
    TR("pt-nl","Ele é neerlandês e ela é portuguesa.", ["Hij is Nederlander en zij is Portugese(.)","Hij is Nederlander en ze is Portugese(.)"], "Dois géneros.", ["v-nederlander","v-portugese"]),
    FB("Mijn moeder is ___. Ze komt uit Porto.", ["Portugese"], "Feminino.", ["v-portugese"], choices=["Portugese","Portugees","Portugal"], tr="A minha mãe é portuguesa. É do Porto."),
    FE(["Zij","is","Portugees."], 2, "Portugese.", "Mulher: Portugese.", ["v-portugese"]),
    LI("Mijn vriendin is Nederlandse.", ["Mijn vriendin is Nederlandse(.)"], "A minha amiga é neerlandesa.", "Ouvir.", ["v-nederlandse-vrouw"]),
  ], diff=2, mins=4)

L(14, "Que línguas falas bem?", "Ik spreek goed Engels.",
  ["Dizer quão bem falas uma língua"],
  vocab=[],
  ex=[("Ik spreek goed Engels en een beetje Nederlands.","Falo bem inglês e um pouco de neerlandês."),("Spreek je Frans? — Nee, helaas niet.","Falas francês? — Não, infelizmente não.")],
  review=["v-spreken","v-engels","v-frans","v-een-beetje","v-goed","v-helaas","v-taal"],
  cefr=C, exs=[
    MA([("goed","bem"),("een beetje","um pouco"),("helaas niet","infelizmente não"),("taal","língua")], "Quão bem?", ["v-goed","v-een-beetje","v-helaas","v-taal"]),
    TR("pt-nl","Falo bem inglês.", ["Ik spreek goed Engels(.)"], "goed antes da língua.", ["v-spreken","v-engels"]),
    TR("pt-nl","Falo inglês e um pouco de neerlandês.", ["Ik spreek Engels en een beetje Nederlands(.)"], "een beetje.", ["v-een-beetje","v-nederlands"]),
    TR("pt-nl","Falas francês?", ["Spreek jij Frans?","Spreek je Frans?"], "Pergunta: spreek jij (sem -t).", ["v-frans"]),
    CJ("spreken","hij","Hij ___ Spaans.", ["spreekt"], "hij spreekt.", ["v-spreken"]),
    CJ("spreken","wij","Wij ___ Portugees.", ["spreken"], "wij spreken.", ["v-spreken"]),
    DL([("Collega","Spreek je Duits?","Falas alemão?"),("Jij","","")], ["*Nee, helaas niet. Wel Engels.","Ja, ik kom uit Duitsland.|Não respondeste sobre a língua.","Duits is een land.|Não."], "Responder.", ["v-helaas"]),
    LI("Welke talen spreek je?", ["Welke talen spreek je(?)","Welke talen spreek jij(?)"], "Que línguas falas?", "Pergunta.", ["v-taal","v-spreken"]),
  ], diff=2, mins=4)

L(15, "Perto ou longe?", "Ver weg en dichtbij.",
  ["Dizer se um lugar fica perto ou longe"],
  vocab=[X("v-ver-weg","ver weg","longe, muito longe")],
  ex=[("Portugal is ver weg.","Portugal fica muito longe."),("België is dichtbij.","A Bélgica fica perto."),("Is Utrecht ver van Amsterdam? — Nee, het is dichtbij.","Utrecht fica longe de Amesterdão? — Não, fica perto.")],
  review=["v-ver","v-dichtbij","v-van","v-stad","v-dorp"],
  cefr=C, exs=[
    MA([("ver weg","muito longe"),("dichtbij","perto"),("stad","cidade"),("dorp","aldeia")], "Distâncias.", ["v-ver-weg","v-dichtbij","v-stad","v-dorp"]),
    MC("De Amesterdão, qual fica mais perto?", ["*België","Kaapverdië|Muito longe.","Brazilië|Muito longe."], "Lógica.", ["v-dichtbij"]),
    TR("pt-nl","Portugal fica muito longe.", ["Portugal is ver weg(.)","Portugal is heel ver(.)"], "ver weg.", ["v-ver-weg"]),
    TR("pt-nl","A cidade fica perto.", ["De stad is dichtbij(.)"], "dichtbij.", ["v-dichtbij","v-stad"]),
    FB("Is het dorp ___ van hier? — Nee, het is dichtbij.", ["ver"], "ver van = longe de.", ["v-ver","v-van"], choices=["ver","dichtbij","weg"], tr="A aldeia fica longe daqui? — Não, fica perto."),
    LI("Mijn dorp is ver weg, in Portugal.", ["Mijn dorp is ver weg(,) in Portugal(.)"], "A minha aldeia fica muito longe, em Portugal.", "Ouvir.", ["v-ver-weg","v-dorp"]),
    DL([("Buurman","Is Porto ver van Lissabon?","O Porto fica longe de Lisboa?"),("Jij","","")], ["*Een beetje: ongeveer drie uur met de trein.","Ja, het is in Afrika.|Não.","Nee, het is een land.|Não."], "Responder (a frase usa «ongeveer» = cerca de).", ["v-ver"]),
    WO("A Bélgica fica perto.", ["België","is","dichtbij."], "Ordem.", ["v-dichtbij"]),
  ], diff=2, mins=4)

L(16, "Prática: de onde é a turma?", "Een internationale klas.",
  ["Compreender e escrever sobre pessoas de vários países"],
  vocab=[],
  ex=[("(Fictício) In mijn klas zijn veel nationaliteiten: Joana is Portugese, Ahmed komt uit Marokko en Lisa is Duitse.","Na minha turma há muitas nacionalidades: a Joana é portuguesa, o Ahmed é de Marrocos e a Lisa é alemã.")],
  review=["v-portugese","v-angola","v-kaapverdie","v-europa","v-spreken","v-ver-weg","v-een-beetje"],
  cefr=C, exs=[
    MC("(Fictício) «Joana komt uit Angola. Ze spreekt Portugees en een beetje Nederlands.» Que línguas fala a Joana?", ["*português e um pouco de neerlandês","só neerlandês|Não.","espanhol|Não."], "Compreensão.", ["v-angola","v-een-beetje"]),
    MC("(Fictício) «Pedro is Braziliaan. Zijn vrouw is Nederlandse.» De onde é a mulher do Pedro?", ["*dos Países Baixos","do Brasil|É o Pedro.","de Portugal|Não."], "Compreensão.", ["v-nederlandse-vrouw"]),
    TR("pt-nl","Sou de Cabo Verde, mas moro nos Países Baixos.", ["Ik kom uit Kaapverdië(,) maar ik woon in Nederland(.)"], "maar.", ["v-kaapverdie"]),
    LI("Ze komt uit Mozambique en spreekt Portugees.", ["Ze komt uit Mozambique en spreekt Portugees(.)","Zij komt uit Mozambique en spreekt Portugees(.)"], "Ela é de Moçambique e fala português.", "Ouvir.", ["v-mozambique"]),
    BS("Ela é portuguesa e fala inglês.", ["Ze","is","Portugese","en","spreekt","Engels."], ["Ze is Portugese en spreekt Engels."], "Duas informações.", ["v-portugese","v-engels"]),
    FB("Mijn land is ___ weg, maar ik ben blij hier.", ["ver"], "ver weg.", ["v-ver-weg"], choices=["ver","dicht","goed"], tr="O meu país fica longe, mas estou contente aqui."),
    DL([("Docent","Waar kom je vandaan en welke talen spreek je?","De onde és e que línguas falas?"),("Jij","","")], ["*Ik kom uit Portugal. Ik spreek Portugees, Engels en een beetje Nederlands.","Ik ben moe.|Não responde.","Portugal is ver weg.|Só uma parte."], "Resposta completa.", ["v-spreken"]),
    SW("Escreva 3 frases: de onde é, que nacionalidade tem e que línguas fala.", ["Ik kom uit Portugal. Ik ben Portugese. Ik spreek Portugees, Engels en een beetje Nederlands."], ["Origem","Nacionalidade","Línguas"], 12, "Escrever.", ["v-portugese","v-spreken"]),
  ], diff=2, mins=5)

W()
