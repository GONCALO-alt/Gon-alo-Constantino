import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u09")
C = "A1"
# Lições extra (11–16): objetos do dia a dia, perguntar onde estão as coisas, demonstrativos.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(11, "Na mochila", "Mijn rugzak en mijn laptop.",
  ["Dizer o que tens na mochila"],
  vocab=[N("v-rugzak","rugzak","mochila","de","rugzakken"), N("v-laptop","laptop","portátil","de","laptops")],
  ex=[("In mijn rugzak zit mijn laptop.","Na minha mochila está o meu portátil."),("Mijn sleutels zijn in mijn tas.","As minhas chaves estão na minha mala.")],
  review=["v-tas","v-sleutel","v-telefoon","v-portemonnee","v-paspoort"],
  cefr=C, exs=[
    MA([("rugzak","mochila"),("laptop","portátil"),("portemonnee","carteira"),("sleutel","chave")], "Objetos.", ["v-rugzak","v-laptop","v-portemonnee","v-sleutel"]),
    AR("rugzak", "mochila", "de", "de rugzak.", ["v-rugzak"]),
    AR("paspoort", "passaporte", "het", "het paspoort.", ["v-paspoort"]),
    TR("pt-nl","O meu portátil está na mochila.", ["Mijn laptop is in mijn rugzak(.)","Mijn laptop zit in mijn rugzak(.)","Mijn laptop is in de rugzak(.)"], "in.", ["v-laptop","v-rugzak"]),
    TR("nl-pt","Mijn telefoon is in mijn tas.", ["O meu telemóvel está na minha mala(.)","O meu telefone está na minha mala(.)"], "in mijn tas.", ["v-telefoon","v-tas"]),
    FB("Mijn ___ en mijn paspoort zijn in mijn tas.", ["portemonnee"], "Carteira.", ["v-portemonnee"], choices=["portemonnee","tafel","klok"], tr="A minha carteira e o meu passaporte estão na mala."),
    LI("Mijn laptop is in de rugzak.", ["Mijn laptop is in de rugzak(.)"], "O meu portátil está na mochila.", "Ouvir.", ["v-laptop","v-rugzak"]),
    WO("A chave está na mala.", ["De","sleutel","is","in","de","tas."], "Ordem.", ["v-sleutel","v-tas"]),
  ], diff=1, mins=4)

L(12, "Onde está a chave?", "Waar is mijn sleutel? Hier is hij!",
  ["Perguntar onde estão as coisas e responder"],
  vocab=[X("v-waar-is","waar is…?","onde está…?"), X("v-hier-is","hier is…","aqui está…")],
  ex=[("Waar is mijn sleutel? — Hier is hij, op de tafel.","Onde está a minha chave? — Aqui está ela, em cima da mesa."),("Waar is mijn bril? — Naast de computer.","Onde estão os meus óculos? — Ao lado do computador.")],
  gram=[G("g-s1u09c-1","Hij e het para coisas","Para uma coisa **de** usa-se **hij**: *De sleutel? Hier is **hij**.* Para uma coisa **het** usa-se **het**: *Het paspoort? Hier is **het**.*")],
  review=["v-op","v-onder","v-naast","v-achter","v-bril","v-weg"],
  cefr=C, exs=[
    MA([("op","em cima de"),("onder","debaixo de"),("naast","ao lado de"),("achter","atrás de")], "Lugar.", ["v-op","v-onder","v-naast","v-achter"]),
    MC("«De sleutel? Hier is ___.»", ["*hij","het|«sleutel» é palavra de.","zij|Não."], "de → hij.", ["v-hier-is","v-sleutel"]),
    MC("«Het paspoort? Hier is ___.»", ["*het","hij|«paspoort» é palavra het.","ze|Não."], "het → het.", ["v-paspoort"]),
    TR("pt-nl","Onde está o meu telemóvel?", ["Waar is mijn telefoon?","Waar is mijn telefoon"], "waar is.", ["v-waar-is","v-telefoon"]),
    TR("pt-nl","Está debaixo da mesa.", ["Hij is onder de tafel(.)","Het is onder de tafel(.)"], "onder.", ["v-onder","v-tafel"]),
    FB("Mijn bril? Hij ligt ___ de computer.", ["naast"], "Ao lado.", ["v-naast"], choices=["naast","weg","deze"], tr="Os meus óculos? Estão ao lado do computador."),
    DL([("Partner","Waar is mijn portemonnee?","Onde está a minha carteira?"),("Jij","","")], ["*Hier is hij, op de tafel!","Hier is het, op de tafel!|portemonnee é palavra de → hij.","Ik ben hier.|Não."], "Responder.", ["v-hier-is"]),
    LI("Mijn sleutel is weg!", ["Mijn sleutel is weg(!)"], "A minha chave desapareceu!", "weg = desaparecido.", ["v-weg","v-sleutel"]),
  ], diff=2, mins=4)

L(13, "À mesa: copos e guardanapos", "Een beker en een servet.",
  ["Pedir e pôr objetos na mesa"],
  vocab=[N("v-beker","beker","caneca, copo (de plástico)","de","bekers"), N("v-servet","servet","guardanapo","het","servetten")],
  ex=[("Mag ik een servet, alstublieft?","Pode dar-me um guardanapo, por favor?"),("De beker staat naast het bord.","A caneca está ao lado do prato.")],
  review=["v-bord","v-glas","v-mes","v-vork","v-lepel","v-tafel"],
  cefr=C, exs=[
    MA([("beker","caneca"),("servet","guardanapo"),("glas","copo (de vidro)"),("lepel","colher")], "À mesa.", ["v-beker","v-servet","v-glas","v-lepel"]),
    AR("servet", "guardanapo", "het", "het servet.", ["v-servet"]),
    AR("beker", "caneca", "de", "de beker.", ["v-beker"]),
    TR("pt-nl","Pode dar-me um guardanapo, por favor?", ["Mag ik een servet(,) alstublieft?","Mag ik een servet(,) alsjeblieft?"], "mag ik.", ["v-servet"]),
    TR("nl-pt","Het mes ligt naast het bord.", ["A faca está ao lado do prato(.)"], "naast.", ["v-mes","v-bord"]),
    FB("Ik drink koffie uit een ___.", ["beker"], "Caneca.", ["v-beker"], choices=["beker","bord","vork"], tr="Bebo café de uma caneca."),
    MC("Para comer sopa precisas de…", ["*een lepel","een mes|É para cortar.","een servet|É para limpar."], "Lógica.", ["v-lepel"]),
    LI("De vork en het mes.", ["De vork en het mes(.)"], "O garfo e a faca.", "Ouvir.", ["v-vork","v-mes"]),
  ], diff=1, mins=4)

L(14, "Este e aquele", "Deze, die, dit, dat.",
  ["Escolher o demonstrativo certo para palavras de e het"],
  vocab=[],
  ex=[("Deze tas is mooi, maar die tas is mooier.","Esta mala é bonita, mas aquela é mais bonita."),("Dit glas is schoon. Dat glas niet.","Este copo está limpo. Aquele não.")],
  gram=[G("g-s1u09c-2","Deze / die / dit / dat","Palavras **de** e plurais: **deze** (este) / **die** (aquele). Palavras **het** no singular: **dit** (este) / **dat** (aquele). *deze tas, die tas; dit glas, dat glas; deze glazen.*")],
  review=["v-deze","v-die","v-dat"],
  cefr=C, exs=[
    MC("«___ tas» (esta mala)", ["*Deze","Dit|«tas» é palavra de.","Dat|«tas» é de e queres «esta»."], "de-palavra.", ["v-deze","v-tas"]),
    MC("«___ glas» (este copo)", ["*Dit","Deze|«glas» é palavra het.","Die|Isso é «aquele» para palavras de."], "het-palavra.", ["v-glas"]),
    MC("«___ boeken» (aqueles livros)", ["*Die","Dat|No plural usa-se deze/die.","Dit|No plural usa-se deze/die."], "Plural.", ["v-die"]),
    FB("___ computer is nieuw. (este)", ["Deze"], "de computer.", ["v-deze","v-computer"], choices=["Deze","Dit","Dat"], tr="Este computador é novo."),
    FB("___ paspoort is van mij. (aquele)", ["Dat"], "het paspoort.", ["v-dat","v-paspoort"], choices=["Dat","Die","Deze"], tr="Aquele passaporte é meu."),
    FE(["Dit","tas","is","van","mijn","zus."], 0, "Deze", "de tas → deze.", ["v-deze","v-tas"]),
    TR("pt-nl","Este copo e aquele prato.", ["Dit glas en dat bord(.)"], "Dois het.", ["v-glas","v-bord","v-dat"]),
    LI("Is deze sleutel van jou?", ["Is deze sleutel van jou(?)"], "Esta chave é tua?", "Ouvir.", ["v-deze","v-sleutel"]),
  ], diff=2, mins=4)

L(15, "Na escola: o material", "Potlood, gum en papier.",
  ["Nomear o material escolar e pedir emprestado"],
  vocab=[N("v-gum","gum","borracha","de","gummen")],
  ex=[("Mag ik je gum even?","Emprestas-me a borracha?"),("Ik schrijf met een potlood in mijn schrift.","Escrevo com um lápis no caderno.")],
  review=["v-potlood","v-schrift","v-papier","v-pen","v-schrijven"],
  cefr=C, exs=[
    MA([("gum","borracha"),("potlood","lápis"),("schrift","caderno"),("pen","caneta")], "Material.", ["v-gum","v-potlood","v-schrift","v-pen"]),
    AR("potlood", "lápis", "het", "het potlood.", ["v-potlood"]),
    AR("gum", "borracha", "de", "de gum.", ["v-gum"]),
    TR("pt-nl","Emprestas-me a borracha?", ["Mag ik je gum (even)?","Mag ik jouw gum (even)?"], "mag ik.", ["v-gum"]),
    TR("pt-nl","Escrevo com uma caneta.", ["Ik schrijf met een pen(.)"], "met.", ["v-pen","v-schrijven"]),
    FB("Ik schrijf in mijn ___.", ["schrift"], "Caderno.", ["v-schrift"], choices=["schrift","gum","klok"], tr="Escrevo no meu caderno."),
    MC("Erraste a lápis. Precisas de…", ["*een gum","een vork|Não.","een paspoort|Não."], "Lógica.", ["v-gum"]),
    LI("Heb je een pen voor mij?", ["Heb je een pen voor mij(?)"], "Tens uma caneta para mim?", "Ouvir.", ["v-pen"]),
  ], diff=1, mins=4)

L(16, "Prática: o que está em cima da mesa?", "Op tafel ligt…",
  ["Descrever onde estão vários objetos"],
  vocab=[],
  ex=[("(Fictício) Op tafel ligt een laptop. Naast de laptop staat een beker. Onder de tafel staat mijn rugzak.","Em cima da mesa está um portátil…")],
  review=["v-op","v-naast","v-onder","v-laptop","v-beker","v-rugzak","v-waar-is","v-deze"],
  cefr=C, exs=[
    MC("(Fictício) «Op tafel ligt een laptop. Naast de laptop staat een beker. Onder de tafel staat mijn rugzak.» Onde está a mochila?", ["*debaixo da mesa","em cima da mesa|É o portátil.","ao lado do portátil|É a caneca."], "Compreensão.", ["v-onder","v-rugzak"]),
    MC("No mesmo texto: o que está ao lado do portátil?", ["*a caneca","a mochila|Não.","a chave|Não."], "Compreensão.", ["v-beker"]),
    TR("pt-nl","A caneca está ao lado do portátil.", ["De beker staat naast de laptop(.)","De beker is naast de laptop(.)"], "naast.", ["v-beker","v-naast"]),
    TR("pt-nl","Onde está a minha mochila?", ["Waar is mijn rugzak?","Waar is mijn rugzak"], "waar is.", ["v-waar-is","v-rugzak"]),
    LI("Het potlood ligt onder het papier.", ["Het potlood ligt onder het papier(.)"], "O lápis está debaixo do papel.", "Ouvir.", ["v-potlood","v-papier"]),
    BS("Os meus óculos estão atrás do computador.", ["Mijn","bril","is","achter","de","computer."], ["Mijn bril is achter de computer."], "achter.", ["v-bril","v-achter"]),
    DL([("Collega","Waar is de klok?","Onde está o relógio?"),("Jij","","")], ["*Daar, naast de deur.","Het is tien uur.|Pergunta onde, não que horas são.","Deze klok.|Incompleto."], "Responder.", ["v-klok"]),
    SW("Descreva a sua secretária em 3 frases (o que está onde).", ["Op mijn tafel ligt mijn laptop. Naast de laptop staat een beker koffie. Mijn telefoon ligt onder het papier."], ["3 objetos","Preposições"], 12, "Descrever.", ["v-op","v-naast"]),
  ], diff=2, mins=5)

W()
