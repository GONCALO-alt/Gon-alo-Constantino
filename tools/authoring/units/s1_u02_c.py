import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u02")
C = "A1"
# Lições extra (11–16): mais prática de apresentações, só com vocabulário das unidades 1 e 2.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(11, "Nome próprio", "Mijn voornaam is…",
  ["Dizer o nome próprio e perguntar o nome a alguém formalmente"],
  vocab=[N("v-voornaam","voornaam","nome próprio","de","voornamen"), X("v-hoe-heet-u","hoe heet u?","como se chama (o senhor / a senhora)?")],
  ex=[("Mijn voornaam is Rui.","O meu nome próprio é Rui."),("Goedemiddag. Hoe heet u?","Boa tarde. Como se chama?")],
  review=["v-heten","v-naam","v-mijn","v-hoe"],
  cefr=C, exs=[
    MA([("voornaam","nome próprio"),("naam","nome"),("heten","chamar-se"),("mijn","meu / minha")], "Nomes.", ["v-voornaam","v-naam","v-heten","v-mijn"]),
    MC("Ao balcão, a funcionária pergunta o teu nome. Ela diz:", ["*Hoe heet u?","Hoe heet je?|Também se ouve, mas ao balcão é mais comum «u».","Waar woon je?|Pergunta onde moras."], "Formal: u.", ["v-hoe-heet-u"]),
    TR("pt-nl","Como se chama?", ["Hoe heet u?","Hoe heet u"], "Formal.", ["v-hoe-heet-u"]),
    TR("pt-nl","O meu nome próprio é Ana.", ["Mijn voornaam is Ana(.)"], "voornaam.", ["v-voornaam"]),
    FB("Mijn ___ is Pedro.", ["voornaam"], "Nome próprio.", ["v-voornaam"], choices=["voornaam","vriend","collega"], tr="O meu nome próprio é Pedro."),
    DL([("Receptionist","Goedemorgen. Hoe heet u?","Bom dia. Como se chama?"),("Jij","","")], ["*Goedemorgen. Ik heet Marta Silva.","Doei!|Não responde.","Ik woon in Nederland.|Não é o nome."], "Dizer o nome.", ["v-hoe-heet-u","v-heten"]),
    LI("Mijn voornaam is Inês.", ["Mijn voornaam is Inês(.)","Mijn voornaam is Ines(.)"], "O meu nome próprio é Inês.", "Ouvir.", ["v-voornaam"]),
    WO("Como se chama?", ["Hoe","heet","u?"], "Pergunta: palavra interrogativa + verbo + sujeito.", ["v-hoe-heet-u"]),
  ], diff=1, mins=4)

L(12, "Cidades", "Ik kom uit Porto.",
  ["Dizer de que cidade vens e onde moras"],
  vocab=[V("v-lissabon","Lissabon","Lisboa","noun"), V("v-amsterdam","Amsterdam","Amesterdão","noun"),
         V("v-rotterdam","Rotterdam","Roterdão","noun"), V("v-porto-stad","Porto","Porto","noun")],
  ex=[("Ik kom uit Lissabon.","Sou de Lisboa."),("Ik woon nu in Rotterdam.","Agora moro em Roterdão.")],
  review=["v-komen-uit","v-wonen","v-in","v-nu"],
  cefr=C, exs=[
    MA([("Lissabon","Lisboa"),("Amsterdam","Amesterdão"),("Rotterdam","Roterdão"),("Portugal","Portugal")], "Lugares.", ["v-lissabon","v-amsterdam","v-rotterdam","v-portugal"]),
    MC("«Lissabon» é…", ["*Lisboa","Lisboa e Porto|Só Lisboa.","uma rua de Amesterdão|Não."], "Nome neerlandês de Lisboa.", ["v-lissabon"]),
    TR("pt-nl","Sou de Lisboa.", ["Ik kom uit Lissabon(.)"], "komen uit.", ["v-lissabon","v-komen-uit"]),
    TR("pt-nl","Agora moro em Amesterdão.", ["Nu woon ik in Amsterdam(.)","Ik woon nu in Amsterdam(.)"], "wonen in.", ["v-amsterdam","v-wonen"]),
    FB("Ik kom ___ Porto.", ["uit"], "komen uit.", ["v-komen-uit"], choices=["uit","in","op"], tr="Sou do Porto."),
    FB("Ik woon ___ Rotterdam.", ["in"], "wonen in.", ["v-wonen"], choices=["in","uit","vandaan"], tr="Moro em Roterdão."),
    LI("Ik kom uit Porto, maar ik woon in Amsterdam.", ["Ik kom uit Porto(,) maar ik woon in Amsterdam(.)"], "Sou do Porto, mas moro em Amesterdão.", "Ouvir.", ["v-porto-stad","v-amsterdam","v-maar"]),
    BS("Sou de Lisboa, mas moro em Roterdão.", ["Ik","kom","uit","Lissabon,","maar","ik","woon","in","Rotterdam."], ["Ik kom uit Lissabon, maar ik woon in Rotterdam."], "maar liga as duas frases.", ["v-lissabon","v-rotterdam"]),
  ], diff=1, mins=4)

L(13, "Apresentar a vizinha", "Dit is mijn buurvrouw.",
  ["Apresentar uma pessoa e reagir a uma apresentação"],
  vocab=[N("v-buurvrouw","buurvrouw","vizinha","de","buurvrouwen")],
  ex=[("Dit is mijn buurvrouw, Sanne.","Esta é a minha vizinha, Sanne."),("Aangenaam! Ik ben Tiago.","Muito prazer! Eu sou o Tiago.")],
  review=["v-dit-is","v-vriend","v-vriendin","v-collega","v-aangenaam","v-leuk-je-te-ontmoeten"],
  cefr=C, exs=[
    MA([("buurvrouw","vizinha"),("vriendin","amiga"),("collega","colega"),("vriend","amigo")], "Pessoas.", ["v-buurvrouw","v-vriendin","v-collega","v-vriend"]),
    TR("pt-nl","Esta é a minha vizinha.", ["Dit is mijn buurvrouw(.)"], "dit is + pessoa.", ["v-buurvrouw","v-dit-is"]),
    TR("nl-pt","Dit is mijn collega, Joost.", ["Este é o meu colega(,) Joost(.)","Esta é a minha colega(,) Joost(.)"], "collega serve para homem e mulher.", ["v-collega"]),
    MC("Apresentam-te alguém. NÃO dizes:", ["*Doei!|É despedida.","Aangenaam!","Leuk je te ontmoeten!"], "Reagir.", ["v-aangenaam"]),
    FB("Dit is mijn ___, Sanne. Ze woont hier.", ["buurvrouw"], "Vizinha.", ["v-buurvrouw"], choices=["buurvrouw","naam","student"], tr="Esta é a minha vizinha, Sanne. Ela mora aqui."),
    DL([("Ana","Dit is mijn buurvrouw, Sanne.","Esta é a minha vizinha, Sanne."),("Jij","","")], ["*Hoi Sanne! Leuk je te ontmoeten.","Hoe heet u?|Já disseram o nome.","Graag gedaan.|Não."], "Reagir à apresentação.", ["v-leuk-je-te-ontmoeten"]),
    LI("Dit is mijn vriend Bram.", ["Dit is mijn vriend Bram(.)","Dit is mijn vriend(,) Bram(.)"], "Este é o meu amigo Bram.", "Ouvir.", ["v-vriend","v-dit-is"]),
    WO("Esta é a minha vizinha.", ["Dit","is","mijn","buurvrouw."], "Ordem.", ["v-buurvrouw"]),
  ], diff=1, mins=4)

L(14, "O que fazes?", "Ik ben student. Zij is docent.",
  ["Dizer se és estudante ou professor"],
  vocab=[N("v-docent","docent","professor (curso, universidade)","de","docenten")],
  ex=[("Ik ben student.","Sou estudante."),("Mijn vriendin is docent.","A minha amiga é professora.")],
  gram=[G("g-s1u02c-1","Profissão sem artigo","Em neerlandês, como em português, diz-se a profissão **sem artigo**: *Ik ben student* (sou estudante), *Zij is docent* (ela é professora). A mesma palavra serve para homem e mulher.",
    [("Ik ben docent.","Sou professor."),("Ben jij student?","És estudante?")])],
  review=["v-student","v-zijn","v-collega"],
  cefr=C, exs=[
    MC("Como se diz «Sou estudante»?", ["*Ik ben student.","Ik ben een student.|Com profissões normalmente não se usa «een».","Ik student.|Falta o verbo."], "Sem artigo.", ["v-student"]),
    TR("pt-nl","A minha amiga é professora.", ["Mijn vriendin is docent(.)"], "Sem artigo.", ["v-docent","v-vriendin"]),
    TR("pt-nl","És estudante?", ["Ben jij student?","Ben je student?"], "Pergunta: verbo primeiro.", ["v-student"]),
    FB("Ik ___ docent in Utrecht.", ["ben"], "ik ben.", ["v-zijn"], choices=["ben","is","bent"], tr="Sou professor em Utrecht."),
    FB("Jij ___ student, toch?", ["bent"], "jij bent.", ["v-zijn"], choices=["bent","ben","is"], tr="Tu és estudante, não és?"),
    DL([("Collega","Ben jij ook docent?","Também és professor?"),("Jij","","")], ["*Nee, ik ben student.","Ja, ik kom uit Portugal.|Não responde à pergunta.","Dank je wel.|Não."], "Responder sim/não.", ["v-docent","v-nee"]),
    LI("Ik ben docent en mijn vriend is student.", ["Ik ben docent en mijn vriend is student(.)"], "Sou professor e o meu amigo é estudante.", "Ouvir.", ["v-docent","v-student"]),
    WO("Sou professora.", ["Ik","ben","docent."], "Ordem.", ["v-docent"]),
  ], diff=1, mins=4)

L(15, "Sim ou não?", "Ja, ik woon hier. Nee, ik kom uit Portugal.",
  ["Responder a perguntas simples de sim ou não sobre ti"],
  vocab=[],
  ex=[("Woon jij in Amsterdam? — Ja.","Moras em Amesterdão? — Sim."),("Kom jij uit Nederland? — Nee, ik kom uit Portugal.","És dos Países Baixos? — Não, sou de Portugal.")],
  review=["v-ja","v-nee","v-wonen","v-komen-uit","v-student"],
  cefr=C, exs=[
    MC("«Kom jij uit Nederland?» Tu és de Portugal. Respondes:", ["*Nee, ik kom uit Portugal.","Ja, ik kom uit Portugal.|«Ja» seria «sim, sou dos Países Baixos».","Nee, ik woon in Portugal.|Ele perguntou de onde és."], "Responder com lógica.", ["v-nee","v-komen-uit"]),
    MC("Numa pergunta de sim/não, o verbo vem…", ["*em primeiro lugar: Woon jij…?","no fim: Jij hier woon?|Não.","depois do sujeito: Jij woon…?|Isso é uma afirmação."], "Ordem da pergunta.", ["v-wonen"]),
    TR("pt-nl","Moras em Roterdão?", ["Woon jij in Rotterdam?","Woon je in Rotterdam?"], "Na pergunta, jij woont → woon jij (perde o -t).", ["v-wonen","v-rotterdam"]),
    TR("pt-nl","Não, sou de Portugal.", ["Nee, ik kom uit Portugal(.)"], "nee.", ["v-nee","v-portugal"]),
    FB("___ jij student? — Ja.", ["Ben"], "Pergunta com zijn.", ["v-zijn"], choices=["Ben","Bent","Is"], tr="És estudante? — Sim."),
    LI("Woon jij in Nederland? — Ja, nu wel.", ["Woon jij in Nederland? Ja, nu wel(.)","Woon jij in Nederland ja nu wel"], "Moras nos Países Baixos? — Sim, agora sim.", "Ouvir.", ["v-wonen","v-nederland"]),
    DL([("Buurvrouw","Kom jij uit Lissabon?","És de Lisboa?"),("Jij","","")], ["*Nee, ik kom uit Porto.","Ja, ik kom uit Porto.|Contradiz-se.","Ik ben aangenaam.|Não faz sentido."], "Responder.", ["v-nee"]),
    WO("Moras aqui?", ["Woon","jij","hier?"], "Verbo primeiro.", ["v-wonen"]),
  ], diff=1, mins=4)

L(16, "Prática: apresentação completa", "Hallo, ik ben…",
  ["Apresentar-se em quatro frases: nome, origem, morada e ocupação"],
  vocab=[],
  ex=[("Hallo! Ik heet Carla. Ik kom uit Lissabon, maar ik woon nu in Amsterdam. Ik ben student.","Olá! Chamo-me Carla. Sou de Lisboa, mas agora moro em Amesterdão. Sou estudante.")],
  review=["v-heten","v-komen-uit","v-wonen","v-student","v-docent","v-voornaam","v-lissabon","v-amsterdam"],
  cefr=C, exs=[
    MC("(Texto fictício) «Hallo! Ik heet Carla. Ik kom uit Lissabon, maar ik woon nu in Amsterdam. Ik ben student.» Onde mora a Carla?", ["*em Amesterdão","em Lisboa|É de onde vem.","em Roterdão|Não."], "Compreensão.", ["v-wonen","v-amsterdam"]),
    MC("No mesmo texto: o que faz a Carla?", ["*é estudante","é professora|Não.","é colega|Não."], "Compreensão.", ["v-student"]),
    TR("pt-nl","Chamo-me Rui e sou do Porto.", ["Ik heet Rui en ik kom uit Porto(.)","Mijn naam is Rui en ik kom uit Porto(.)"], "Duas informações.", ["v-heten","v-porto-stad"]),
    TR("pt-nl","Agora moro nos Países Baixos.", ["Nu woon ik in Nederland(.)","Ik woon nu in Nederland(.)"], "nu.", ["v-nu","v-nederland"]),
    LI("Hallo, ik ben Sofia. Ik kom uit Portugal.", ["Hallo(,) ik ben Sofia(.) Ik kom uit Portugal(.)","Hallo ik ben Sofia ik kom uit Portugal"], "Olá, sou a Sofia. Sou de Portugal.", "Ouvir.", ["v-komen-uit"]),
    BS("Sou professora e moro em Roterdão.", ["Ik","ben","docent","en","ik","woon","in","Rotterdam."], ["Ik ben docent en ik woon in Rotterdam."], "en liga duas frases.", ["v-docent","v-rotterdam"]),
    DL([("Nieuwe collega","Hoi! Ik ben Lars. En jij?","Olá! Sou o Lars. E tu?"),("Jij","","")], ["*Hoi Lars! Ik heet Bruno. Ik kom uit Portugal.","Doei Lars!|Despedida.","Graag gedaan.|Não."], "Apresentar-se.", ["v-heten"]),
    SW("Apresente-se em 3–4 frases (nome, de onde é, onde mora, o que faz).", ["Hallo! Ik heet Marta. Ik kom uit Porto, maar ik woon nu in Utrecht. Ik ben student."], ["Nome","Origem","Morada","Ocupação"], 12, "Apresentação.", ["v-heten","v-komen-uit","v-wonen"]),
  ], diff=2, mins=5)

W()
