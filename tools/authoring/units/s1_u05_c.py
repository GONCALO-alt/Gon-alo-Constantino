import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u05")
C = "A1"
# Lições extra (11–16): mais prática de pronomes, do verbo zijn e de adjetivos para descrever pessoas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(11, "Onde estão?", "Op het werk, op vakantie, thuis.",
  ["Dizer onde estão as pessoas"],
  vocab=[X("v-op-het-werk","op het werk","no trabalho"), X("v-op-vakantie","op vakantie","de férias")],
  ex=[("Mijn vriendin is op het werk.","A minha amiga está no trabalho."),("Wij zijn op vakantie in Portugal.","Estamos de férias em Portugal."),("Is hij thuis? — Nee, hij is op het werk.","Ele está em casa? — Não, está no trabalho.")],
  review=["v-thuis","v-hier","v-daar"],
  cefr=C, exs=[
    MA([("op het werk","no trabalho"),("op vakantie","de férias"),("thuis","em casa"),("hier","aqui")], "Lugares.", ["v-op-het-werk","v-op-vakantie","v-thuis","v-hier"]),
    MC("«Ze is op vakantie» significa…", ["*Ela está de férias.","Ela está no trabalho.|Isso é «op het werk».","Ela está em casa.|Isso é «thuis»."], "op vakantie.", ["v-op-vakantie"]),
    TR("pt-nl","Ele está no trabalho.", ["Hij is op het werk(.)"], "op het werk.", ["v-op-het-werk","v-hij"]),
    TR("pt-nl","Estamos de férias.", ["Wij zijn op vakantie(.)","We zijn op vakantie(.)"], "wij/we zijn.", ["v-op-vakantie","v-wij"]),
    FB("Jullie ___ thuis, toch?", ["zijn"], "jullie zijn.", ["v-jullie"], choices=["zijn","is","bent"], tr="Vocês estão em casa, não estão?"),
    DL([("Collega","Waar is Sanne?","Onde está a Sanne?"),("Jij","","")], ["*Ze is op vakantie in Spanje.","Ze is moe vakantie.|Não faz sentido.","Ik ben Sanne.|Não."], "Responder onde está.", ["v-op-vakantie"]),
    LI("Mijn man is op het werk.", ["Mijn man is op het werk(.)"], "O meu marido está no trabalho.", "Ouvir.", ["v-op-het-werk"]),
    WO("Ela está de férias.", ["Ze","is","op","vakantie."], "Ordem.", ["v-op-vakantie"]),
  ], diff=1, mins=4)

L(12, "Descrever os amigos", "Slim, aardig en allebei.",
  ["Descrever duas pessoas ao mesmo tempo"],
  vocab=[X("v-slim","slim","inteligente, esperto","adjective"), X("v-allebei","allebei","os dois, ambos","pronoun")],
  ex=[("Mijn vriend is slim en aardig.","O meu amigo é inteligente e simpático."),("Ze zijn allebei jong.","São os dois jovens.")],
  review=["v-aardig","v-jong","v-lang","v-mooi"],
  cefr=C, exs=[
    MA([("slim","inteligente"),("aardig","simpático"),("jong","jovem"),("lang","alto")], "Adjetivos.", ["v-slim","v-aardig","v-jong","v-lang"]),
    MC("«Ze zijn allebei aardig» significa…", ["*Os dois são simpáticos.","Ela é simpática.|«zijn» e «allebei» indicam duas pessoas.","Ninguém é simpático.|Não."], "allebei.", ["v-allebei"]),
    TR("pt-nl","Ela é inteligente.", ["Zij is slim(.)","Ze is slim(.)"], "slim.", ["v-slim"]),
    TR("pt-nl","São os dois altos.", ["Ze zijn allebei lang(.)","Zij zijn allebei lang(.)"], "allebei depois do verbo.", ["v-allebei","v-lang"]),
    FB("Mijn collega's zijn ___ aardig.", ["allebei"], "Os dois.", ["v-allebei"], choices=["allebei","slim","heel"], tr="Os meus colegas são os dois simpáticos."),
    FE(["Mijn","vrienden","is","slim."], 2, "zijn", "Plural: zijn.", ["v-slim"]),
    LI("Hij is jong en heel slim.", ["Hij is jong en heel slim(.)"], "Ele é jovem e muito inteligente.", "Ouvir.", ["v-slim","v-jong"]),
    WO("Os dois são simpáticos.", ["Ze","zijn","allebei","aardig."], "Ordem.", ["v-allebei"]),
  ], diff=1, mins=4)

L(13, "Todas as formas de «zijn»", "Ik ben, jij bent, hij is…",
  ["Conjugar «zijn» com todos os pronomes"],
  vocab=[],
  ex=[("Ik ben moe, maar jij bent blij.","Eu estou cansado, mas tu estás contente."),("Zijn jullie thuis?","Vocês estão em casa?")],
  gram=[G("g-s1u05c-1","Zijn (ser / estar)","ik **ben** · jij/je **bent** (mas: **ben jij?**) · u **bent** · hij/zij/het **is** · wij/we **zijn** · jullie **zijn** · zij/ze **zijn**.",
    [("Bent u ziek?","Está doente?"),("Ben jij moe?","Estás cansado?")])],
  review=["v-zijn","v-ik","v-jij","v-hij","v-wij","v-jullie"],
  cefr=C, exs=[
    CJ("zijn","ik","Ik ___ moe.", ["ben"], "ik ben.", ["v-zijn"]),
    CJ("zijn","jij","Jij ___ blij.", ["bent"], "jij bent.", ["v-zijn"]),
    CJ("zijn","hij","Hij ___ ziek.", ["is"], "hij is.", ["v-zijn"]),
    CJ("zijn","wij","Wij ___ niet thuis.", ["zijn"], "wij zijn.", ["v-zijn"]),
    CJ("zijn","jij","___ jij moe?", ["Ben"], "Na pergunta: ben jij (sem -t).", ["v-zijn"]),
    MC("Qual está correta?", ["*Bent u ziek?","Is u ziek?|Com «u»: bent.","Ben u ziek?|Com «u»: bent."], "u bent.", ["v-u"]),
    FE(["Jullie","is","heel","aardig."], 1, "zijn", "jullie zijn.", ["v-jullie"]),
    LI("Ik ben moe, maar jij bent blij.", ["Ik ben moe(,) maar jij bent blij(.)"], "Eu estou cansado, mas tu estás contente.", "Ouvir.", ["v-moe","v-blij"]),
  ], diff=2, mins=5)

L(14, "Pronomes curtos", "Je, ze, we.",
  ["Reconhecer as formas átonas je, ze, we na fala"],
  vocab=[],
  ex=[("We zijn thuis.","Estamos em casa."),("Ze is ziek.","Ela está doente."),("Ben je moe?","Estás cansado?")],
  review=["v-jij","v-zij","v-wij","v-je-jouw"],
  cefr=C, exs=[
    MA([("je","jij"),("ze","zij"),("we","wij"),("u","(sem forma curta)")], "Forma curta ↔ forma forte.", ["v-jij","v-zij","v-wij","v-u"]),
    MC("Quando se usa a forma forte «jij»?", ["*para dar ênfase ou contraste: «Jij bent moe, ik niet.»","sempre, a forma curta é errada|As formas curtas são normais.","só por escrito|Não."], "Ênfase.", ["v-jij"]),
    MC("«Ze zijn thuis» pode significar…", ["*Eles/elas estão em casa.","Ela está em casa.|Com «zijn» é plural.","Nós estamos em casa.|Isso é «we»."], "ze + zijn = plural.", ["v-zij"]),
    TR("nl-pt","Ben je ziek?", ["Estás doente(?)","Tu estás doente(?)"], "je = jij.", ["v-jij","v-ziek"]),
    TR("pt-nl","Estamos aqui.", ["We zijn hier(.)","Wij zijn hier(.)"], "we = wij.", ["v-wij","v-hier"]),
    LI("Ze is op het werk.", ["Ze is op het werk(.)","Zij is op het werk(.)"], "Ela está no trabalho.", "Forma curta.", ["v-zij","v-op-het-werk"]),
    LI("We zijn moe.", ["We zijn moe(.)","Wij zijn moe(.)"], "Estamos cansados.", "Forma curta.", ["v-wij","v-moe"]),
    FB("Jij bent moe, maar ___ niet.", ["ik"], "Contraste.", ["v-ik"], choices=["ik","je","we"], tr="Tu estás cansado, mas eu não."),
  ], diff=2, mins=4)

L(15, "Muito, mesmo, nada", "Heel, echt, niet.",
  ["Intensificar e negar adjetivos"],
  vocab=[],
  ex=[("Het is heel makkelijk.","É muito fácil."),("Hij is echt aardig.","Ele é mesmo simpático."),("Het is niet moeilijk.","Não é difícil.")],
  review=["v-heel","v-echt","v-niet","v-moeilijk","v-makkelijk","v-druk"],
  cefr=C, exs=[
    MA([("heel","muito"),("echt","mesmo, realmente"),("niet","não"),("ook niet","também não")], "Intensificar e negar.", ["v-heel","v-echt","v-niet","v-ook-niet"]),
    MC("Onde fica «niet» com um adjetivo?", ["*antes do adjetivo: het is niet moeilijk","no início: niet het is moeilijk|Não.","no fim: het is moeilijk niet|Não."], "Posição.", ["v-niet"]),
    TR("pt-nl","É muito fácil.", ["Het is heel makkelijk(.)"], "heel + adjetivo.", ["v-heel","v-makkelijk"]),
    TR("pt-nl","Não é difícil.", ["Het is niet moeilijk(.)"], "niet + adjetivo.", ["v-niet","v-moeilijk"]),
    TR("pt-nl","Ela está mesmo cansada.", ["Ze is echt moe(.)","Zij is echt moe(.)"], "echt.", ["v-echt","v-moe"]),
    FB("Ik ben moe. — Ik ___ niet.", ["ook"], "também não: ook niet.", ["v-ook-niet"], choices=["ook","heel","echt"], tr="Estou cansado. — Eu também não."),
    MC("Qual é a ordem correta?", ["*Het is niet moeilijk.","Het niet is moeilijk.|«niet» vem depois do verbo, antes do adjetivo."], "Posição de niet.", ["v-niet"]),
    LI("Het is heel druk hier.", ["Het is heel druk hier(.)"], "Está muito movimentado aqui.", "Ouvir.", ["v-druk","v-heel"]),
  ], diff=2, mins=4)

L(16, "Prática: a minha turma", "Wie is wie?",
  ["Compreender e escrever uma pequena descrição de pessoas"],
  vocab=[],
  ex=[("(Fictício) Dit is Lotte. Ze is jong en heel slim. Ze is vandaag niet hier, ze is ziek.","Esta é a Lotte. É jovem e muito inteligente. Hoje não está cá, está doente.")],
  review=["v-slim","v-allebei","v-ziek","v-op-vakantie","v-aardig","v-druk"],
  cefr=C, exs=[
    MC("(Texto fictício) «Dit is Lotte. Ze is jong en heel slim. Ze is vandaag niet hier, ze is ziek.» Porque não está a Lotte?", ["*Está doente.","Está de férias.|Não diz isso.","Está no trabalho.|Não."], "Compreensão.", ["v-ziek"]),
    MC("(Texto fictício) «Tom en Ali zijn allebei aardig. Tom is lang, Ali niet.» Quem é alto?", ["*O Tom","O Ali|«Ali niet».","Os dois|Só o Tom."], "Compreensão.", ["v-allebei","v-lang"]),
    TR("pt-nl","Ele é simpático, mas está cansado.", ["Hij is aardig(,) maar hij is moe(.)","Hij is aardig(,) maar moe(.)"], "maar.", ["v-aardig","v-moe"]),
    TR("pt-nl","Vocês estão de férias?", ["Zijn jullie op vakantie?","Zijn jullie op vakantie"], "Pergunta.", ["v-jullie","v-op-vakantie"]),
    LI("Ze zijn allebei heel aardig.", ["Ze zijn allebei heel aardig(.)","Zij zijn allebei heel aardig(.)"], "São os dois muito simpáticos.", "Ouvir.", ["v-allebei"]),
    BS("Ela é jovem, mas muito inteligente.", ["Ze","is","jong,","maar","heel","slim."], ["Ze is jong, maar heel slim."], "maar.", ["v-slim","v-jong"]),
    DL([("Docent","Waar is Pedro?","Onde está o Pedro?"),("Jij","","")], ["*Hij is ziek, hij is thuis.","Hij is slim.|Não diz onde está.","Ik ben Pedro.|Não."], "Responder.", ["v-ziek","v-thuis"]),
    SW("Descreva duas pessoas que conhece (2–3 frases: como são, onde estão).", ["Mijn vriend Rui is lang en heel aardig. Mijn collega Eva is slim. Ze zijn allebei op het werk."], ["Duas pessoas","Adjetivos","Onde estão"], 12, "Descrever.", ["v-slim","v-allebei"]),
  ], diff=2, mins=5)

W()
