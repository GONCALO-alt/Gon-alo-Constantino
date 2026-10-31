import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u10")
C = "A1-A2"
# Lições extra (10–15): treino de plurais, posse (van jou, die van mij), animais de estimação e preferidos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Treino de plurais: -en ou -s?", "Boeken, tafels, auto's.",
  ["Escolher depressa entre -en e -s"],
  vocab=[],
  ex=[("een boek, twee boeken","-en"),("een tafel, twee tafels","-s depois de -el"),("een auto, twee auto's","-'s depois de vogal")],
  review=["v-boek","v-tafel","v-auto","v-foto","v-menu","v-meisje"],
  cefr=C, exs=[
    MC("Plural de «tafel»:", ["*tafels","tafelen|-el → -s."], "-el → -s.", ["v-tafel"]),
    MC("Plural de «auto»:", ["*auto's","autos|Depois de vogal longa final: -'s."], "Apóstrofo.", ["v-auto"]),
    MC("Plural de «meisje»:", ["*meisjes","meisjen|-je → -s."], "-je → -s.", ["v-meisje"]),
    MC("Plural de «boek»:", ["*boeken","boeks|Regra geral: -en."], "-en.", ["v-boek"]),
    FB("Ik heb drie ___ van de vakantie. (foto)", ["foto's"], "-'s.", ["v-foto"], choices=["foto's","fotos","fotoën"], tr="Tenho três fotos das férias."),
    FB("Twee ___, alstublieft. (menu)", ["menu's"], "-'s.", ["v-menu"], choices=["menu's","menus","menuen"], tr="Dois menus, por favor."),
    FE(["Ik","heb","twee","auto."], 3, "auto's.", "Plural: auto's.", ["v-auto"]),
    LI("Er staan vier tafels en acht stoelen.", ["Er staan vier tafels en acht stoelen(.)"], "Há quatro mesas e oito cadeiras.", "Ouvir.", ["v-tafel","v-stoel"]),
  ], diff=2, mins=4)

L(11, "Plurais que mudam", "Kinderen, steden, schepen.",
  ["Praticar os plurais irregulares mais frequentes"],
  vocab=[],
  ex=[("Ik heb twee kinderen.","Tenho dois filhos."),("Amsterdam en Utrecht zijn steden.","Amesterdão e Utrecht são cidades.")],
  review=["v-kind","v-ei","v-stad","v-schip","v-lid","v-dag"],
  cefr=C, exs=[
    MA([("kind","kinderen"),("ei","eieren"),("stad","steden"),("schip","schepen")], "Singular → plural.", ["v-kind","v-ei","v-stad","v-schip"]),
    MC("Plural de «dag»:", ["*dagen","dags|Não.","dageren|Não."], "-en; a vogal fica curta: da-gen.", ["v-dag"]),
    MC("Plural de «lid» (membro):", ["*leden","lids|Não.","liden|Muda a vogal: leden."], "Irregular.", ["v-lid"]),
    TR("pt-nl","Tenho três filhos.", ["Ik heb drie kinderen(.)"], "kinderen.", ["v-kind"]),
    TR("pt-nl","Seis ovos, por favor.", ["Zes eieren(,) alstublieft(.)"], "eieren.", ["v-ei"]),
    FB("In de haven liggen veel ___.", ["schepen"], "Navios.", ["v-schip"], choices=["schepen","schips","schipen"], tr="No porto há muitos navios."),
    FE(["Gent","en","Brugge","zijn","mooie","stads."], 5, "steden.", "stad → steden.", ["v-stad"]),
    LI("De club heeft honderd leden.", ["De club heeft honderd leden(.)","De club heeft 100 leden(.)"], "O clube tem cem membros.", "Ouvir.", ["v-lid"]),
  ], diff=2, mins=4)

L(12, "É teu?", "Is dit van jou? Ja, die is van mij.",
  ["Perguntar e dizer a quem pertence uma coisa"],
  vocab=[X("v-van-jou","van jou","teu (é teu)"), X("v-van-hem-haar","van hem / van haar","dele / dela")],
  ex=[("Is deze jas van jou? — Ja, die is van mij.","Este casaco é teu? — Sim, é meu."),("De fiets is van haar.","A bicicleta é dela.")],
  gram=[G("g-s2u10c-1","Van + pronome","Para dizer «é meu/teu/dele» depois de *zijn*: **van mij, van jou, van hem, van haar, van ons, van jullie, van hen**. *Het boek is **van mij**.*")],
  review=["v-van-mij","v-buurman","v-eigen"],
  cefr=C, exs=[
    MA([("van mij","meu"),("van jou","teu"),("van hem","dele"),("van haar","dela")], "Posse.", ["v-van-mij","v-van-jou","v-van-hem-haar","v-van-hem-haar"]),
    TR("pt-nl","Este casaco é teu?", ["Is deze jas van jou?","Is die jas van jou?"], "van jou.", ["v-van-jou"]),
    TR("pt-nl","A bicicleta é dela.", ["De fiets is van haar(.)"], "van haar.", ["v-van-hem-haar"]),
    FB("Die tas is niet van mij, hij is ___ mijn buurman.", ["van"], "van + nome.", ["v-buurman"], choices=["van","bij","met"], tr="Essa mala não é minha, é do meu vizinho."),
    DL([("Collega","Is deze telefoon van jou?","Este telemóvel é teu?"),("Jij","","")], ["*Nee, die is van Sanne.","Ja, van jou.|Confuso.","Ik ben telefoon.|Não."], "Responder.", ["v-van-jou"]),
    LI("Is dit van hem of van haar?", ["Is dit van hem of van haar(?)"], "Isto é dele ou dela?", "Ouvir.", ["v-van-hem-haar"]),
    MC("«Het huis is van ons» =", ["*A casa é nossa.","A casa é deles.|Isso é «van hen».","A casa é tua.|Não."], "van ons.", ["v-van-mij"]),
    WO("É meu.", ["Het","is","van","mij."], "Ordem.", ["v-van-mij"]),
  ], diff=2, mins=4)

L(13, "Animais de estimação", "Heb je een huisdier?",
  ["Falar de animais de estimação"],
  vocab=[N("v-huisdier","huisdier","animal de estimação","het","huisdieren"), N("v-konijn","konijn","coelho","het","konijnen")],
  ex=[("Heb je een huisdier? — Ja, een kat.","Tens um animal de estimação? — Sim, um gato."),("Mijn dochter heeft twee konijnen.","A minha filha tem dois coelhos.")],
  review=["v-hond","v-kat","v-kind"],
  cefr=C, exs=[
    MA([("huisdier","animal de estimação"),("konijn","coelho"),("hond","cão"),("kat","gato")], "Animais.", ["v-huisdier","v-konijn","v-hond","v-kat"]),
    AR("konijn", "coelho", "het", "het konijn.", ["v-konijn"]),
    AR("huisdier", "animal de estimação", "het", "het dier.", ["v-huisdier"]),
    TR("pt-nl","Tens um animal de estimação?", ["Heb je een huisdier?","Heb jij een huisdier?"], "huisdier.", ["v-huisdier"]),
    TR("pt-nl","Tenho dois gatos.", ["Ik heb twee katten(.)"], "kat → katten.", ["v-kat"]),
    FB("Mijn zoon heeft drie ___. (coelhos)", ["konijnen"], "Plural.", ["v-konijn"], choices=["konijnen","konijns","konijn"], tr="O meu filho tem três coelhos."),
    LI("Onze hond heet Max.", ["Onze hond heet Max(.)"], "O nosso cão chama-se Max.", "Ouvir.", ["v-hond"]),
    DL([("Buurvrouw","Wat een lieve hond! Is hij van jou?","Que cão tão querido! É teu?"),("Jij","","")], ["*Ja, hij is van mij. Hij heet Bobby.","Nee, hij is een kat.|Não.","Ik ben huisdier.|Não."], "Responder.", ["v-van-jou"]),
  ], diff=2, mins=4)

L(14, "O meu preferido", "Mijn lievelingseten.",
  ["Dizer qual é a tua comida, cor ou dia preferidos"],
  vocab=[],
  ex=[("Mijn lievelingskleur is blauw.","A minha cor preferida é o azul."),("Wat is jouw lievelingseten? — Bacalhau!","Qual é a tua comida preferida? — Bacalhau!")],
  gram=[G("g-s2u10c-2","Lievelings-","**lievelings-** junta-se ao substantivo numa só palavra: *lievelingskleur* (cor preferida), *lievelingseten* (comida preferida), *lievelingsboek* (livro preferido). O artigo é o do último elemento: *de lievelingskleur*, *het lievelingsboek*.")],
  review=["v-lievelings","v-kleur","v-eten","v-boek"],
  cefr=C, exs=[
    MC("«O meu livro preferido» =", ["*mijn lievelingsboek","mijn lievelings boek|Junta-se numa palavra.","mijn boek lievelings|Não."], "Uma palavra.", ["v-lievelings"]),
    AR("lievelingsboek", "livro preferido", "het", "het boek.", ["v-lievelings"]),
    AR("lievelingskleur", "cor preferida", "de", "de kleur.", ["v-lievelings"]),
    TR("pt-nl","A minha cor preferida é o verde.", ["Mijn lievelingskleur is groen(.)"], "lievelingskleur.", ["v-lievelings","v-groen"]),
    TR("pt-nl","Qual é a tua comida preferida?", ["Wat is jouw lievelingseten?","Wat is je lievelingseten?"], "lievelingseten.", ["v-lievelings"]),
    FB("Vrijdag is mijn ___dag.", ["lievelings"], "Prefixo.", ["v-lievelings"], choices=["lievelings","liefste","lieve"], tr="Sexta é o meu dia preferido."),
    LI("Mijn lievelingsstad is Lissabon.", ["Mijn lievelingsstad is Lissabon(.)"], "A minha cidade preferida é Lisboa.", "Ouvir.", ["v-lievelings","v-lissabon"]),
    SW("Escreva 3 preferidos seus (cor, comida, cidade).", ["Mijn lievelingskleur is rood. Mijn lievelingseten is pizza. Mijn lievelingsstad is Porto."], ["3 frases com lievelings-"], 12, "Escrever.", ["v-lievelings"]),
  ], diff=2, mins=4)

L(15, "Prática: as coisas da família", "Van wie is wat?",
  ["Usar plurais e possessivos num texto"],
  vocab=[],
  ex=[("(Fictício) De rode fiets is van mijn dochter. De twee konijnen zijn van mijn zoon. De auto is van ons.","A bicicleta vermelha é da minha filha…")],
  review=["v-van-jou","v-van-hem-haar","v-huisdier","v-konijn","v-kind","v-lievelings"],
  cefr=C, exs=[
    MC("(Fictício) «De twee konijnen zijn van mijn zoon.» De quem são os coelhos?", ["*do filho","da filha|É a bicicleta.","de todos|Não."], "Compreensão.", ["v-konijn"]),
    MC("(Fictício) «De auto is van ons.» A quem pertence o carro?", ["*a nós","a eles|Seria van hen.","ao vizinho|Não."], "Compreensão.", ["v-van-mij"]),
    TR("pt-nl","A bicicleta vermelha é da minha filha.", ["De rode fiets is van mijn dochter(.)"], "van + pessoa.", ["v-fiets","v-dochter"]),
    TR("pt-nl","Os meus filhos têm um animal de estimação.", ["Mijn kinderen hebben een huisdier(.)"], "kinderen + hebben.", ["v-kind","v-huisdier"]),
    LI("Die schoenen zijn niet van jou, ze zijn van mij!", ["Die schoenen zijn niet van jou(,) ze zijn van mij(!)"], "Esses sapatos não são teus, são meus!", "Ouvir.", ["v-van-jou"]),
    FE(["Mijn","nieuw","fiets","is","rood."], 1, "nieuwe", "Depois de possessivo: sempre -e.", ["v-nieuw"]),
    BS("O cão é nosso.", ["De","hond","is","van","ons."], ["De hond is van ons."], "van ons.", ["v-hond"]),
    SW("Escreva 3 frases sobre objetos da sua família e de quem são.", ["De grote auto is van mijn vader. De kat is van mijn zus. Het oude boek is van mij."], ["van + pessoa","Plurais"], 15, "Escrever.", ["v-van-jou"]),
  ], diff=2, mins=5)

W()
