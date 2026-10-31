import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u08")
C = "A1"
# Lições extra (11–16): mais prática de família, hebben e possessivos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(11, "Marido, mulher e companheiro", "Mijn man, mijn vrouw, mijn partner.",
  ["Falar do companheiro ou da companheira"],
  vocab=[N("v-partner","partner","companheiro(a)","de","partners")],
  ex=[("Mijn man heet Paulo.","O meu marido chama-se Paulo."),("Mijn vrouw is docent.","A minha mulher é professora."),("Ik woon samen met mijn partner.","Vivo com o meu companheiro.")],
  gram=[G("g-s1u08c-1","Man e vrouw","*man* = homem e também **marido**; *vrouw* = mulher e também **esposa**. *Mijn man* = o meu marido. **Partner** serve para casados ou não, de qualquer género.")],
  review=["v-man","v-vrouw","v-getrouwd"],
  cefr=C, exs=[
    MA([("mijn man","o meu marido"),("mijn vrouw","a minha mulher"),("partner","companheiro(a)"),("getrouwd","casado")], "Casal.", ["v-man","v-vrouw","v-partner","v-getrouwd"]),
    MC("«Mijn man is ziek» significa…", ["*O meu marido está doente.","Um homem está doente.|«mijn man» = o meu marido.","Estou doente.|Não."], "man = marido.", ["v-man"]),
    TR("pt-nl","A minha mulher é portuguesa.", ["Mijn vrouw is Portugese(.)"], "vrouw.", ["v-vrouw","v-portugese"]),
    TR("pt-nl","Sou casado.", ["Ik ben getrouwd(.)"], "getrouwd.", ["v-getrouwd"]),
    FB("Mijn ___ en ik zijn niet getrouwd.", ["partner"], "Companheiro.", ["v-partner"], choices=["partner","vader","broer"], tr="O meu companheiro e eu não somos casados."),
    DL([("Collega","En jij, ben jij ook getrouwd?","E tu, também és casado?"),("Jij","","")], ["*Nee, maar ik heb een partner.","Ja, ik ben dertig.|Não responde.","Ik ben student.|Não."], "Responder.", ["v-partner"]),
    LI("Mijn man komt uit Nederland.", ["Mijn man komt uit Nederland(.)"], "O meu marido é dos Países Baixos.", "Ouvir.", ["v-man"]),
    WO("Sou casada.", ["Ik","ben","getrouwd."], "Ordem.", ["v-getrouwd"]),
  ], diff=1, mins=4)

L(12, "Mais velho e mais novo", "Mijn broertje, mijn zusje.",
  ["Falar dos irmãos mais novos e de ser filho único"],
  vocab=[N("v-broertje","broertje","irmão mais novo / irmãozinho","het"), N("v-zusje","zusje","irmã mais nova / irmãzinha","het"),
         X("v-enig-kind","enig kind","filho(a) único(a)")],
  ex=[("Ik heb een broertje van acht.","Tenho um irmão mais novo de oito anos."),("Ik ben enig kind.","Sou filho único.")],
  gram=[G("g-s1u08c-2","Diminutivo -je","**-je** forma o diminutivo: *broer* → **broertje**, *zus* → **zusje**. Todos os diminutivos são palavras **het**. Para irmãos, o diminutivo indica muitas vezes que são **mais novos**.")],
  review=["v-broer","v-zus","v-kind"],
  cefr=C, exs=[
    MA([("broertje","irmão mais novo"),("zusje","irmã mais nova"),("enig kind","filho único"),("broer","irmão")], "Irmãos.", ["v-broertje","v-zusje","v-enig-kind","v-broer"]),
    AR("zusje", "irmã mais nova", "het", "Diminutivo: het.", ["v-zusje"]),
    MC("Não tens irmãos. Dizes:", ["*Ik ben enig kind.","Ik heb een zusje.|Tens uma irmã.","Ik ben een broer.|Não."], "Filho único.", ["v-enig-kind"]),
    TR("pt-nl","Tenho uma irmã mais nova.", ["Ik heb een zusje(.)"], "zusje.", ["v-zusje","v-hebben"]),
    TR("pt-nl","Sou filha única.", ["Ik ben enig kind(.)"], "Igual para rapaz e rapariga.", ["v-enig-kind"]),
    FB("Mijn ___ is zes en mijn broer is twintig.", ["broertje"], "Mais novo.", ["v-broertje"], choices=["broertje","vader","oom"], tr="O meu irmão mais novo tem seis anos e o meu irmão tem vinte."),
    LI("Ik heb een broertje en een zusje.", ["Ik heb een broertje en een zusje(.)"], "Tenho um irmão e uma irmã mais novos.", "Ouvir.", ["v-broertje","v-zusje"]),
    WO("Sou filho único.", ["Ik","ben","enig","kind."], "Ordem.", ["v-enig-kind"]),
  ], diff=2, mins=4)

L(13, "Todas as formas de «hebben»", "Ik heb, jij hebt, hij heeft.",
  ["Conjugar o verbo hebben"],
  vocab=[],
  ex=[("Ik heb twee kinderen.","Tenho dois filhos."),("Heeft zij een broer?","Ela tem um irmão?")],
  gram=[G("g-s1u08c-3","Hebben (ter)","ik **heb** · jij **hebt** (mas: **heb jij?**) · u **hebt/heeft** · hij/zij **heeft** · wij/jullie/zij **hebben**.",
    [("Hebt u kinderen?","Tem filhos?"),("Wij hebben een hond.","Temos um cão.")])],
  review=["v-hebben","v-kind"],
  cefr=C, exs=[
    CJ("hebben","ik","Ik ___ een zus.", ["heb"], "ik heb.", ["v-hebben"]),
    CJ("hebben","hij","Hij ___ drie kinderen.", ["heeft"], "hij heeft (irregular).", ["v-hebben"]),
    CJ("hebben","wij","Wij ___ twee katten.", ["hebben"], "wij hebben.", ["v-hebben"]),
    CJ("hebben","jij","___ jij broers?", ["Heb"], "Pergunta: heb jij.", ["v-hebben"]),
    CJ("hebben","jullie","Jullie ___ een groot huis.", ["hebben"], "jullie hebben.", ["v-hebben"]),
    FE(["Zij","hebt","een","dochter."], 1, "heeft", "zij heeft.", ["v-hebben","v-dochter"]),
    MC("Qual é a frase correta?", ["*Hebt u kinderen?","Heeft jij kinderen?|jij → hebt / heb jij.","Hebben hij kinderen?|hij → heeft."], "Concordância.", ["v-hebben"]),
    LI("Heeft je moeder een zus?", ["Heeft je moeder een zus(?)","Heeft jouw moeder een zus(?)"], "A tua mãe tem uma irmã?", "Ouvir.", ["v-hebben","v-moeder"]),
  ], diff=2, mins=4)

L(14, "Dele, dela, deles", "Zijn, haar, hun.",
  ["Usar os possessivos da 3.ª pessoa"],
  vocab=[],
  ex=[("Tom en zijn zus.","O Tom e a irmã dele."),("Sanne en haar broer.","A Sanne e o irmão dela."),("De kinderen en hun ouders.","As crianças e os pais delas.")],
  gram=[G("g-s1u08c-4","Zijn / haar / hun","O possessivo depende do **dono**, não da coisa: dono masculino → **zijn**; dono feminino → **haar**; vários donos → **hun**. *Zijn moeder* = a mãe dele; *haar vader* = o pai dela.")],
  review=["v-zijn-poss","v-haar","v-hun","v-ons"],
  cefr=C, exs=[
    MC("«A mãe dela» =", ["*haar moeder","zijn moeder|Isso é «a mãe dele».","hun moeder|Isso é «a mãe deles»."], "Dono feminino.", ["v-haar"]),
    MC("«O pai deles» =", ["*hun vader","zijn vader|Dono masculino singular.","ons vader|Isso é «o nosso pai» (e seria «onze»)."], "Vários donos.", ["v-hun"]),
    TR("pt-nl","O Tom e a irmã dele.", ["Tom en zijn zus(.)"], "zijn.", ["v-zijn-poss"]),
    TR("pt-nl","A Sanne e o irmão dela.", ["Sanne en haar broer(.)"], "haar.", ["v-haar"]),
    FB("Lotte en ___ moeder wonen in Delft.", ["haar"], "Dela.", ["v-haar"], choices=["haar","zijn","hun"], tr="A Lotte e a mãe dela moram em Delft."),
    FB("Mijn ouders en ___ hond.", ["hun"], "Deles.", ["v-hun"], choices=["hun","haar","zijn"], tr="Os meus pais e o cão deles."),
    FE(["Pedro","en","haar","vrouw","zijn","hier."], 2, "zijn", "Pedro (dono masculino): zijn vrouw.", ["v-zijn-poss"]),
    LI("Hij woont bij zijn ouders.", ["Hij woont bij zijn ouders(.)"], "Ele mora com os pais.", "Ouvir.", ["v-zijn-poss","v-ouders"]),
  ], diff=2, mins=4)

L(15, "A família alargada", "Schoonmoeder en neef.",
  ["Falar da família por casamento e dos primos"],
  vocab=[N("v-schoonmoeder","schoonmoeder","sogra","de")],
  ex=[("Mijn schoonmoeder woont in Groningen.","A minha sogra mora em Groningen."),("Mijn neef is de zoon van mijn tante.","O meu primo é o filho da minha tia.")],
  gram=[G("g-s1u08c-5","Neef e nicht","Atenção: **neef** = primo **ou** sobrinho; **nicht** = prima **ou** sobrinha. O contexto decide. **Schoon-** indica família por casamento: *schoonmoeder* (sogra), *schoonvader* (sogro).")],
  review=["v-neef","v-nicht","v-oom","v-tante","v-opa","v-oma"],
  cefr=C, exs=[
    MA([("schoonmoeder","sogra"),("neef","primo / sobrinho"),("nicht","prima / sobrinha"),("tante","tia")], "Família.", ["v-schoonmoeder","v-neef","v-nicht","v-tante"]),
    MC("O filho do teu irmão é o teu…", ["*neef","oom|É o tio.","opa|É o avô."], "neef = sobrinho.", ["v-neef"]),
    MC("A mãe do teu marido é a tua…", ["*schoonmoeder","tante|É a tia.","nicht|É a sobrinha/prima."], "Sogra.", ["v-schoonmoeder"]),
    TR("pt-nl","A minha sogra é simpática.", ["Mijn schoonmoeder is aardig(.)"], "schoonmoeder.", ["v-schoonmoeder"]),
    TR("nl-pt","Mijn nicht is de dochter van mijn oom.", ["A minha prima é a filha do meu tio(.)"], "nicht = prima.", ["v-nicht","v-oom"]),
    FB("De vader van mijn moeder is mijn ___.", ["opa"], "Avô.", ["v-opa"], choices=["opa","oom","neef"], tr="O pai da minha mãe é o meu avô."),
    LI("Mijn oma heeft tien kleinkinderen.", ["Mijn oma heeft tien kleinkinderen(.)","Mijn oma heeft 10 kleinkinderen(.)"], "A minha avó tem dez netos.", "kleinkinderen = netos.", ["v-oma"]),
    WO("O meu primo é simpático.", ["Mijn","neef","is","aardig."], "Ordem.", ["v-neef"]),
  ], diff=2, mins=4)

L(16, "Prática: a família da Marta", "Een familiefoto.",
  ["Compreender e escrever uma descrição de família"],
  vocab=[],
  ex=[("(Fictício) Dit is mijn familie. Mijn vader heet Rui en mijn moeder heet Ana. Ik heb een zusje van tien.","Esta é a minha família…")],
  review=["v-familie","v-gezin","v-ouders","v-zusje","v-partner","v-hebben","v-haar","v-zijn-poss"],
  cefr=C, exs=[
    MC("(Fictício) «Marta heeft een zusje van tien en een broer van twintig.» Quem é o mais novo?", ["*a irmã","o irmão|Tem 20.","a Marta|Não sabemos a idade dela, mas a irmã é «zusje»."], "Compreensão.", ["v-zusje"]),
    MC("(Fictício) «Haar ouders wonen in Porto, maar Marta woont met haar partner in Leiden.» Onde moram os pais?", ["*no Porto","em Leiden|É a Marta.","em Lisboa|Não."], "Compreensão.", ["v-ouders","v-partner"]),
    TR("pt-nl","Tenho três irmãos e duas irmãs.", ["Ik heb drie broers en twee zussen(.)"], "Plural: broers.", ["v-broer","v-zus"]),
    TR("pt-nl","Os meus pais moram em Portugal.", ["Mijn ouders wonen in Portugal(.)"], "ouders + wonen.", ["v-ouders"]),
    LI("Ons gezin is klein: mijn vrouw, mijn dochter en ik.", ["Ons gezin is klein(:) mijn vrouw(,) mijn dochter en ik(.)"], "A nossa família é pequena: a minha mulher, a minha filha e eu.", "Ouvir.", ["v-gezin","v-ons"]),
    BS("A minha irmã tem dois filhos.", ["Mijn","zus","heeft","twee","kinderen."], ["Mijn zus heeft twee kinderen."], "heeft.", ["v-zus","v-hebben"]),
    DL([("Collega","Heb je kinderen?","Tens filhos?"),("Jij","","")], ["*Ja, een zoon van vijf.","Ja, ik ben vijf.|Não.","Nee, ik ben getrouwd.|Não responde."], "Responder.", ["v-kind"]),
    SW("Descreva a sua família em 3–4 frases.", ["Mijn familie is groot. Ik heb twee zussen en een broertje. Mijn ouders wonen in Braga. Ik woon met mijn partner in Utrecht."], ["Quantos","Quem","Onde moram"], 15, "Escrever.", ["v-familie"]),
  ], diff=2, mins=5)

W()
