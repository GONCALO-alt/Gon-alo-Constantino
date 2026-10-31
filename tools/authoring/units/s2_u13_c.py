import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u13")
C = "A1-A2"
# Lições extra (10–15): mais desporto e lazer, sair, convidar, preferências e frequência.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Ténis e dança", "Tennissen en dansen.",
  ["Falar de mais atividades de lazer"],
  vocab=[X("v-tennissen","tennissen","jogar ténis","verb"), X("v-dansen","dansen","dançar","verb")],
  ex=[("Op woensdag tennis ik met een collega.","À quarta jogo ténis com um colega."),("Ze danst graag salsa.","Ela gosta de dançar salsa.")],
  review=["v-sporten","v-zwemmen","v-hardlopen","v-hobby"],
  cefr=C, exs=[
    MA([("tennissen","jogar ténis"),("dansen","dançar"),("zwemmen","nadar"),("hardlopen","correr")], "Atividades.", ["v-tennissen","v-dansen","v-zwemmen","v-hardlopen"]),
    CJ("tennissen","ik","Ik ___ op woensdag.", ["tennis"], "ik tennis.", ["v-tennissen"]),
    CJ("dansen","zij","Zij ___ graag.", ["danst"], "zij danst.", ["v-dansen"]),
    TR("pt-nl","Ela gosta de dançar.", ["Ze danst graag(.)","Zij danst graag(.)"], "graag.", ["v-dansen"]),
    TR("pt-nl","Jogo ténis com uma amiga.", ["Ik tennis met een vriendin(.)"], "tennissen.", ["v-tennissen"]),
    FB("Mijn hobby is ___. Ik zwem drie keer per week.", ["zwemmen"], "Natação.", ["v-zwemmen","v-hobby"], choices=["zwemmen","dansen","tennissen"], tr="O meu passatempo é nadar. Nado três vezes por semana."),
    LI("Op zaterdag gaan we dansen.", ["Op zaterdag gaan we dansen(.)"], "Ao sábado vamos dançar.", "Ouvir.", ["v-dansen"]),
    WO("Gosto de dançar.", ["Ik","dans","graag."], "Ordem.", ["v-dansen"]),
  ], diff=2, mins=4)

L(11, "Sair", "Uit eten en op stap.",
  ["Falar de sair para jantar ou à noite"],
  vocab=[X("v-uit-eten","uit eten gaan","ir jantar fora"), X("v-op-stap","op stap gaan","sair (à noite)")],
  ex=[("Vanavond gaan we uit eten.","Esta noite vamos jantar fora."),("Op vrijdag gaan we met vrienden op stap.","À sexta saímos com amigos.")],
  review=["v-vanavond","v-bioscoop","v-film","v-meegaan"],
  cefr=C, exs=[
    MA([("uit eten gaan","jantar fora"),("op stap gaan","sair à noite"),("naar de bioscoop","ao cinema"),("vanavond","esta noite")], "Sair.", ["v-uit-eten","v-op-stap","v-bioscoop","v-vanavond"]),
    TR("pt-nl","Esta noite vamos jantar fora.", ["Vanavond gaan we uit eten(.)","We gaan vanavond uit eten(.)"], "uit eten.", ["v-uit-eten","v-vanavond"]),
    TR("pt-nl","Vamos ao cinema?", ["Gaan we naar de bioscoop?","Zullen we naar de bioscoop gaan?"], "bioscoop.", ["v-bioscoop"]),
    FB("Ga je ___? We gaan naar een concert.", ["mee"], "meegaan.", ["v-meegaan"], choices=["mee","uit","op"], tr="Vens connosco? Vamos a um concerto."),
    DL([("Vriend","Gaan we vanavond op stap?","Saímos esta noite?"),("Jij","","")], ["*Leuk! Hoe laat?","Ik ben stap.|Não.","Nee, ik ben vanavond.|Não."], "Aceitar.", ["v-op-stap"]),
    LI("Zaterdag gaan we uit eten in een Indonesisch restaurant.", ["Zaterdag gaan we uit eten in een Indonesisch restaurant(.)"], "No sábado vamos jantar fora a um restaurante indonésio.", "Ouvir.", ["v-uit-eten"]),
    MC("Nos Países Baixos é muito comum a comida…", ["*indonésia (por razões históricas)","japonesa apenas|Existe, mas a indonésia é tradicional.","nenhuma estrangeira|Não."], "Cultura.", ["v-uit-eten"]),
    WO("Saímos esta noite.", ["Vanavond","gaan","we","op","stap."], "Inversão.", ["v-op-stap"]),
  ], diff=2, mins=4)

L(12, "Apetece-te?", "Heb je zin in een film?",
  ["Convidar e responder a convites"],
  vocab=[],
  ex=[("Heb je zin in een film? — Ja, leuk!","Apetece-te ver um filme? — Sim, boa!"),("Ik heb geen zin, ik ben moe.","Não me apetece, estou cansado.")],
  review=["v-zin-hebben","v-meegaan","v-film","v-concert"],
  cefr=C, exs=[
    MC("«Heb je zin in koffie?» significa…", ["*Apetece-te um café?","Gostas de café em geral?|«zin hebben» é vontade agora.","Tens café?|Não."], "zin hebben.", ["v-zin-hebben"]),
    TR("pt-nl","Apetece-te um filme?", ["Heb je zin in een film?","Heb jij zin in een film?"], "zin in.", ["v-zin-hebben","v-film"]),
    TR("pt-nl","Não me apetece.", ["Ik heb geen zin(.)"], "geen zin.", ["v-zin-hebben"]),
    FB("Ik heb ___ in een ijsje!", ["zin"], "Vontade.", ["v-zin-hebben"], choices=["zin","graag","liever"], tr="Apetece-me um gelado!"),
    DL([("Collega","Ga je mee naar het concert?","Vens ao concerto?"),("Jij","","")], ["*Ja, daar heb ik zin in!","Ja, ik heb geen zin.|Contraditório.","Concert is muziek.|Não."], "Aceitar.", ["v-zin-hebben"]),
    DL([("Vriendin","Zullen we gaan zwemmen?","Vamos nadar?"),("Jij","","")], ["*Sorry, ik heb vandaag geen zin. Morgen misschien?","Nee.|Seco.","Zwemmen is water.|Não."], "Recusar com simpatia.", ["v-zin-hebben"]),
    LI("Ik heb zo'n zin in vakantie!", ["Ik heb zo'n zin in vakantie(!)"], "Estou com tanta vontade de férias!", "Ouvir.", ["v-zin-hebben"]),
    WO("Não me apetece.", ["Ik","heb","geen","zin."], "Ordem.", ["v-zin-hebben"]),
  ], diff=2, mins=4)

L(13, "Prefiro…", "Liever en het liefst.",
  ["Dizer o que preferes e o que mais gostas"],
  vocab=[],
  ex=[("Ik zwem graag, maar ik fiets liever.","Gosto de nadar, mas prefiro andar de bicicleta."),("Het liefst lees ik een boek.","O que mais gosto é de ler um livro.")],
  review=["v-graag-verb","v-liever","v-het-liefst"],
  cefr=C, exs=[
    MA([("graag","gostar de"),("liever","preferir"),("het liefst","gostar mais de tudo"),("hobby","passatempo")], "Escala.", ["v-graag-verb","v-liever","v-het-liefst","v-hobby"]),
    MC("Do menos para o mais:", ["*graag → liever → het liefst","het liefst → graag → liever|Não.","liever → graag → het liefst|Não."], "Escala.", ["v-liever","v-het-liefst"]),
    TR("pt-nl","Prefiro ver um filme.", ["Ik kijk liever een film(.)"], "liever.", ["v-liever"]),
    TR("pt-nl","O que mais gosto é de nadar.", ["Het liefst zwem ik(.)","Ik zwem het liefst(.)"], "het liefst.", ["v-het-liefst"]),
    FB("Koffie of thee? — Ik drink ___ thee.", ["liever"], "Preferir.", ["v-liever"], choices=["liever","het liefst","graag"], tr="Café ou chá? — Prefiro chá."),
    MC("Qual é a ordem correta?", ["*Het liefst lees ik.","Het liefst ik lees.|Inversão."], "Inversão.", ["v-het-liefst"]),
    LI("Ik wandel graag, maar ik fiets liever.", ["Ik wandel graag(,) maar ik fiets liever(.)"], "Gosto de caminhar, mas prefiro andar de bicicleta.", "Ouvir.", ["v-liever"]),
    WO("Prefiro chá.", ["Ik","drink","liever","thee."], "Ordem.", ["v-liever"]),
  ], diff=2, mins=4)

L(14, "Com que frequência?", "Hoe vaak sport je?",
  ["Perguntar e dizer com que frequência fazes algo"],
  vocab=[X("v-hoe-vaak","hoe vaak?","com que frequência? / quantas vezes?")],
  ex=[("Hoe vaak ga je naar de sportschool? — Twee keer per week.","Quantas vezes vais ao ginásio? — Duas vezes por semana."),("Ik ga één keer per maand naar de bioscoop.","Vou uma vez por mês ao cinema.")],
  review=["v-sportschool","v-vaak","v-soms","v-nooit"],
  cefr=C, exs=[
    MA([("hoe vaak?","com que frequência?"),("vaak","muitas vezes"),("soms","às vezes"),("nooit","nunca")], "Frequência.", ["v-hoe-vaak","v-vaak","v-soms","v-nooit"]),
    TR("pt-nl","Com que frequência vais ao ginásio?", ["Hoe vaak ga je naar de sportschool?","Hoe vaak ga jij naar de sportschool?"], "hoe vaak.", ["v-hoe-vaak","v-sportschool"]),
    TR("pt-nl","Uma vez por mês.", ["Een keer per maand(.)","Eén keer per maand(.)"], "keer per maand.", ["v-hoe-vaak"]),
    DL([("Collega","Hoe vaak zwem je?","Quantas vezes nadas?"),("Jij","","")], ["*Twee keer per week, op maandag en donderdag.","Om acht uur.|Não.","In het zwembad.|Não responde à frequência."], "Frequência.", ["v-hoe-vaak"]),
    FB("Ik ga ___ naar de film; misschien twee keer per jaar.", ["zelden"], "Raramente.", ["v-hoe-vaak"], choices=["zelden","vaak","altijd"], tr="Raramente vou ao cinema; talvez duas vezes por ano."),
    LI("Hoe vaak per week sport je?", ["Hoe vaak per week sport je(?)"], "Quantas vezes por semana fazes desporto?", "Ouvir.", ["v-hoe-vaak"]),
    MC("«Drie keer per week» =", ["*três vezes por semana","três semanas|Não.","de três em três semanas|Não."], "Expressão.", ["v-hoe-vaak"]),
    WO("Com que frequência nadas?", ["Hoe","vaak","zwem","je?"], "Ordem.", ["v-hoe-vaak"]),
  ], diff=2, mins=4)

L(15, "Prática: o meu fim de semana", "Mijn vrije tijd.",
  ["Descrever os teus tempos livres"],
  vocab=[],
  ex=[("(Fictício) In het weekend slaap ik uit. Op zaterdag tennis ik en 's avonds gaan we uit eten.","Ao fim de semana durmo até tarde…")],
  review=["v-vrije-tijd","v-tennissen","v-uit-eten","v-liever","v-zin-hebben","v-hoe-vaak"],
  cefr=C, exs=[
    MC("(Fictício) «Op zaterdag tennist Tom en op zondag fietst hij.» O que faz ao domingo?", ["*anda de bicicleta","joga ténis|Ao sábado.","nada|Não."], "Compreensão.", ["v-tennissen"]),
    MC("(Fictício) «Hij gaat liever naar een concert dan naar de bioscoop.» O que prefere?", ["*concertos","cinema|Não.","ténis|Não."], "Compreensão.", ["v-liever"]),
    TR("pt-nl","Nos tempos livres leio e caminho.", ["In mijn vrije tijd lees en wandel ik(.)","In mijn vrije tijd lees ik en wandel ik(.)"], "vrije tijd.", ["v-vrije-tijd"]),
    LI("Wat doe je in je vrije tijd?", ["Wat doe je in je vrije tijd(?)","Wat doe jij in je vrije tijd(?)"], "O que fazes nos tempos livres?", "Ouvir.", ["v-vrije-tijd"]),
    BS("Ao sábado vamos jantar fora.", ["Op","zaterdag","gaan","we","uit","eten."], ["Op zaterdag gaan we uit eten."], "Inversão.", ["v-uit-eten"]),
    DL([("Nieuwe buurvrouw","Wat zijn je hobby's?","Quais são os teus passatempos?"),("Jij","","")], ["*Ik dans graag en ik speel gitaar.","Ik heb geen zin.|Não responde.","Twee keer.|Incompleto."], "Responder.", ["v-hobby"]),
    FB("Heb je ___ in een wandeling?", ["zin"], "zin in.", ["v-zin-hebben"], choices=["zin","liever","vaak"], tr="Apetece-te uma caminhada?"),
    SW("Escreva 4 frases sobre o seu fim de semana ideal (use graag/liever e uma frequência).", ["In het weekend slaap ik graag uit. Op zaterdag zwem ik. Ik ga liever naar een concert dan naar de bioscoop. Eén keer per maand gaan we uit eten."], ["graag / liever","Frequência"], 20, "Escrever.", ["v-liever","v-hoe-vaak"]),
  ], diff=2, mins=5)

W()
