import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u10")
C = "A1"
# Lições extra (11–16): mais treino de de/het com regras úteis e prática intensiva de artigos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(11, "Diminutivos: sempre het", "Het koekje, het meisje.",
  ["Saber que todas as palavras em -je são het"],
  vocab=[N("v-koekje","koekje","bolacha","het","koekjes")],
  ex=[("Het koekje is lekker.","A bolacha é boa."),("Het meisje en de jongen.","A rapariga e o rapaz.")],
  gram=[G("g-s1u10c-1","-je → het","Todas as palavras terminadas em **-je** (diminutivos) são **het**, mesmo que a palavra base seja *de*: *de tas* → **het tasje**; *het huis* → **het huisje**. Por isso *het meisje* (a rapariga) é *het*.")],
  review=["v-meisje","v-huisje","v-jongen"],
  cefr=C, exs=[
    AR("koekje", "bolacha", "het", "-je → het.", ["v-koekje"]),
    AR("meisje", "rapariga", "het", "-je → het.", ["v-meisje"]),
    AR("jongen", "rapaz", "de", "de jongen.", ["v-jongen"]),
    AR("huisje", "casinha", "het", "-je → het.", ["v-huisje"]),
    MC("«de tas» → diminutivo:", ["*het tasje","de tasje|Os diminutivos são sempre het.","het tas|Falta -je."], "Regra.", ["v-koekje"]),
    TR("pt-nl","A rapariga come uma bolacha.", ["Het meisje eet een koekje(.)"], "het meisje.", ["v-meisje","v-koekje"]),
    FE(["De","koekje","is","lekker."], 0, "Het", "-je → het.", ["v-koekje"]),
    LI("Het meisje heeft een koekje.", ["Het meisje heeft een koekje(.)"], "A rapariga tem uma bolacha.", "Ouvir.", ["v-meisje","v-koekje"]),
  ], diff=2, mins=4)

L(12, "Terminações que ajudam", "-ing e -heid: de; ge- e -ment: het.",
  ["Usar terminações para adivinhar o artigo"],
  vocab=[],
  ex=[("de woning, de vrijheid, de informatie","-ing, -heid, -tie → de"),("het gebouw, het document","ge-, -ment → muitas vezes het")],
  gram=[G("g-s1u10c-2","Pistas de terminação","Quase sempre **de**: -ing (*woning*), -heid (*vrijheid*), -tie (*informatie*), pessoas (*leraar*). Muitas vezes **het**: ge- (*gebouw*), -ment (*document*), diminutivos -je. Não são regras perfeitas — aprende o artigo com cada palavra.")],
  review=["v-woning","v-vrijheid","v-informatie","v-gebouw","v-document","v-leraar"],
  cefr=C, exs=[
    AR("woning", "habitação", "de", "-ing → de.", ["v-woning"]),
    AR("vrijheid", "liberdade", "de", "-heid → de.", ["v-vrijheid"]),
    AR("gebouw", "edifício", "het", "ge- → het.", ["v-gebouw"]),
    AR("document", "documento", "het", "-ment → het.", ["v-document"]),
    AR("informatie", "informação", "de", "-tie → de.", ["v-informatie"]),
    MC("Uma palavra nova termina em «-heid». Artigo provável:", ["*de","het|-heid é quase sempre de.","sem artigo|Não."], "Pista.", ["v-vrijheid"]),
    MC("Uma palavra nova começa por «ge-». Artigo provável:", ["*het","de|ge- costuma ser het.","een|«een» serve para os dois."], "Pista.", ["v-gebouw"]),
    FE(["Het","informatie","is","op","papier."], 0, "De", "-tie → de.", ["v-informatie"]),
  ], diff=2, mins=4)

L(13, "Lugares da cidade com artigo", "Het station, het ziekenhuis, de supermarkt.",
  ["Usar o artigo certo com lugares conhecidos"],
  vocab=[],
  ex=[("Het station is daar.","A estação é ali."),("De supermarkt is dichtbij.","O supermercado fica perto.")],
  review=["v-station","v-ziekenhuis","v-supermarkt","v-restaurant","v-gebouw","v-straat"],
  cefr=C, exs=[
    AR("station", "estação", "het", "het station.", ["v-station"]),
    AR("ziekenhuis", "hospital", "het", "het ziekenhuis (het huis).", ["v-ziekenhuis"]),
    AR("supermarkt", "supermercado", "de", "de supermarkt (de markt).", ["v-supermarkt"]),
    AR("restaurant", "restaurante", "het", "het restaurant.", ["v-restaurant"]),
    AR("straat", "rua", "de", "de straat.", ["v-straat"]),
    MC("Nas palavras compostas, o artigo vem da…", ["*última parte: het ziekenhuis (het huis)","primeira parte: de ziekenhuis (de zieke)|Não.","sempre het|Não."], "Compostos.", ["v-ziekenhuis"]),
    TR("pt-nl","O hospital fica perto.", ["Het ziekenhuis is dichtbij(.)"], "het ziekenhuis.", ["v-ziekenhuis","v-dichtbij"]),
    LI("Het restaurant is naast het station.", ["Het restaurant is naast het station(.)"], "O restaurante fica ao lado da estação.", "Ouvir.", ["v-restaurant","v-station"]),
  ], diff=2, mins=4)

L(14, "Comida com artigo", "De appel, het ei, het brood.",
  ["Praticar artigos com comida e bebida"],
  vocab=[],
  ex=[("Het brood en de melk.","O pão e o leite."),("Ik eet een appel en een ei.","Como uma maçã e um ovo.")],
  review=["v-appel","v-ei","v-brood","v-melk","v-koffie","v-water","v-wijn","v-eten"],
  cefr=C, exs=[
    AR("brood", "pão", "het", "het brood.", ["v-brood"]),
    AR("melk", "leite", "de", "de melk.", ["v-melk"]),
    AR("ei", "ovo", "het", "het ei.", ["v-ei"]),
    AR("appel", "maçã", "de", "de appel.", ["v-appel"]),
    AR("water", "água", "het", "het water.", ["v-water"]),
    TR("pt-nl","O pão e o leite.", ["Het brood en de melk(.)"], "Dois artigos.", ["v-brood","v-melk"]),
    MC("No plural, todas as palavras usam…", ["*de: de appels, de eieren","het: het appels|No plural é sempre de.","nenhum artigo|Não."], "Plural = de.", ["v-de"]),
    LI("Het eten is lekker.", ["Het eten is lekker(.)"], "A comida está boa.", "het eten.", ["v-eten"]),
  ], diff=2, mins=4)

L(15, "Een ou één?", "Een appel, één appel.",
  ["Distinguir o artigo «een» do número «één»"],
  vocab=[],
  ex=[("Ik heb een broer.","Tenho um irmão."),("Ik heb maar één broer, niet twee.","Tenho só um irmão, não dois.")],
  gram=[G("g-s1u10c-3","een / één","**een** (artigo, «um/uma») pronuncia-se fraco, quase «ân». **één** (número 1) pronuncia-se «ein» e leva acentos quando é preciso distinguir. *Een* serve para palavras **de** e **het**: *een tas, een huis*.")],
  review=["v-een","v-een-num"],
  cefr=C, exs=[
    MC("«Tenho só UM filho, não dois.»", ["*Ik heb maar één kind.","Ik heb maar een kind.|Também se lê, mas para insistir no número escreve-se één.","Ik heb het kind.|Não."], "Número.", ["v-een-num"]),
    MC("«een» serve para…", ["*palavras de e het","só palavras de|Não.","só palavras het|Não."], "Artigo indefinido.", ["v-een"]),
    MC("No plural, «een» …", ["*desaparece: appels","fica: een appels|Não existe.","vira één|Não."], "Plural sem artigo.", ["v-een"]),
    TR("pt-nl","Tenho um carro.", ["Ik heb een auto(.)"], "een.", ["v-een","v-auto"]),
    TR("pt-nl","Um rapaz e uma rapariga.", ["Een jongen en een meisje(.)"], "een para os dois.", ["v-jongen","v-meisje"]),
    FB("Ik lees ___ krant. (um jornal)", ["een"], "Artigo.", ["v-een","v-krant"], choices=["een","het","één"], tr="Leio um jornal."),
    LI("Een appel en één ei.", ["Een appel en één ei(.)","Een appel en een ei(.)"], "Uma maçã e um (só) ovo.", "Ouvir a diferença.", ["v-een-num"]),
    WO("Tenho uma maçã.", ["Ik","heb","een","appel."], "Ordem.", ["v-appel"]),
  ], diff=2, mins=4)

L(16, "Prática: de, het ou een?", "Lidwoordentraining.",
  ["Escolher depressa o artigo certo"],
  vocab=[],
  ex=[("De leraar leest de krant in het restaurant.","O professor lê o jornal no restaurante.")],
  review=["v-de","v-het","v-een","v-leraar","v-krant","v-restaurant","v-koekje","v-auto"],
  cefr=C, exs=[
    AR("leraar", "professor", "de", "Pessoas: de.", ["v-leraar"]),
    AR("krant", "jornal", "de", "de krant.", ["v-krant"]),
    AR("auto", "carro", "de", "de auto.", ["v-auto"]),
    AR("document", "documento", "het", "-ment → het.", ["v-document"]),
    FE(["Het","leraar","is","aardig."], 0, "De", "Pessoas: de.", ["v-leraar"]),
    FE(["De","gebouw","is","groot."], 0, "Het", "ge- → het.", ["v-gebouw"]),
    TR("pt-nl","O professor lê o jornal.", ["De leraar leest de krant(.)"], "Dois de.", ["v-leraar","v-krant"]),
    LI("Het meisje en de jongen eten een appel.", ["Het meisje en de jongen eten een appel(.)"], "A rapariga e o rapaz comem uma maçã.", "Ouvir.", ["v-meisje","v-jongen"]),
  ], diff=2, mins=4)

W()
