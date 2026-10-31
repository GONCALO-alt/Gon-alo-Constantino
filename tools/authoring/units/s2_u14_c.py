import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u14")
C = "A1-A2"
# Lições extra (10–15): treino de frequência, preposições de lugar e tempo e verbos com preposição.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Normalmente e raramente", "Meestal en zelden.",
  ["Usar meestal e zelden com a ordem certa"],
  vocab=[],
  ex=[("Meestal fiets ik naar mijn werk.","Normalmente vou de bicicleta para o trabalho."),("Ik eet zelden vlees.","Raramente como carne.")],
  review=["v-meestal","v-zelden","v-keer","v-elke"],
  cefr=C, exs=[
    MA([("meestal","normalmente"),("zelden","raramente"),("elke dag","todos os dias"),("soms","às vezes")], "Frequência.", ["v-meestal","v-zelden","v-elke-dag","v-soms"]),
    MC("Qual é a ordem correta?", ["*Meestal drink ik thee.","Meestal ik drink thee.|Inversão."], "Inversão.", ["v-meestal"]),
    MC("Qual é a ordem correta?", ["*Ik ben zelden ziek.","Ik zelden ben ziek.|Advérbio depois do verbo."], "Posição.", ["v-zelden"]),
    TR("pt-nl","Raramente como carne.", ["Ik eet zelden vlees(.)"], "zelden.", ["v-zelden"]),
    TR("pt-nl","Normalmente trabalho em casa.", ["Meestal werk ik thuis(.)","Ik werk meestal thuis(.)"], "meestal.", ["v-meestal"]),
    FB("Ik sport drie ___ per week.", ["keer"], "vezes.", ["v-keer"], choices=["keer","keren","tijd"], tr="Faço desporto três vezes por semana."),
    LI("Meestal ben ik om zes uur thuis.", ["Meestal ben ik om zes uur thuis(.)"], "Normalmente estou em casa às seis.", "Ouvir.", ["v-meestal"]),
    WO("Ele raramente está doente.", ["Hij","is","zelden","ziek."], "Ordem.", ["v-zelden"]),
  ], diff=2, mins=4)

L(11, "Onde fica? Treino", "Aan, bij, tussen, tegenover.",
  ["Usar as preposições de lugar com precisão"],
  vocab=[],
  ex=[("De foto hangt aan de muur.","A fotografia está pendurada na parede."),("De bakker is tegenover de bank.","A padaria fica em frente ao banco."),("Ik woon tussen het station en het park.","Moro entre a estação e o parque.")],
  review=["v-aan","v-bij","v-tussen","v-tegenover","v-muur","v-naast","v-op","v-onder"],
  cefr=C, exs=[
    MA([("aan de muur","na parede"),("tegenover","em frente de"),("tussen","entre"),("bij","junto a, em casa de")], "Lugar.", ["v-aan","v-tegenover","v-tussen","v-bij"]),
    MC("Um quadro na parede:", ["*aan de muur","op de muur|Pendurado: aan.","in de muur|Não."], "aan.", ["v-aan","v-muur"]),
    MC("«Ik ben bij mijn moeder» significa…", ["*Estou em casa da minha mãe.","Estou ao lado da minha mãe na rua.|«bij» com pessoas = em casa de.","Estou dentro da minha mãe.|Não."], "bij.", ["v-bij"]),
    TR("pt-nl","A padaria fica em frente à estação.", ["De bakker is tegenover het station(.)","De bakkerij is tegenover het station(.)"], "tegenover.", ["v-tegenover"]),
    TR("pt-nl","A mesa está entre o sofá e a janela.", ["De tafel staat tussen de bank en het raam(.)"], "tussen.", ["v-tussen"]),
    FB("De klok hangt ___ de muur.", ["aan"], "Pendurado.", ["v-aan"], choices=["aan","op","in"], tr="O relógio está pendurado na parede."),
    FB("Vanavond eet ik ___ mijn ouders.", ["bij"], "Em casa de.", ["v-bij"], choices=["bij","aan","tussen"], tr="Esta noite janto em casa dos meus pais."),
    LI("Het café is tussen de bank en de apotheek.", ["Het café is tussen de bank en de apotheek(.)"], "O café fica entre o banco e a farmácia.", "Ouvir.", ["v-tussen"]),
  ], diff=2, mins=4)

L(12, "Quando? Treino", "Na, voor, sinds, tot, tijdens.",
  ["Usar preposições de tempo"],
  vocab=[],
  ex=[("Na het werk ga ik sporten.","Depois do trabalho vou fazer desporto."),("Ik woon sinds 2020 in Nederland.","Moro nos Países Baixos desde 2020."),("Tijdens de les praten we Nederlands.","Durante a aula falamos neerlandês.")],
  review=["v-na","v-voor-tijd","v-sinds","v-tot","v-tijdens"],
  cefr=C, exs=[
    MA([("na","depois de"),("voor","antes de"),("sinds","desde"),("tijdens","durante")], "Tempo.", ["v-na","v-voor-tijd","v-sinds","v-tijdens"]),
    MC("«Moro aqui desde 2019» =", ["*Ik woon hier sinds 2019.","Ik woon hier tot 2019.|«tot» = até.","Ik woon hier na 2019.|Não."], "sinds.", ["v-sinds"]),
    TR("pt-nl","Depois do trabalho vou para casa.", ["Na het werk ga ik naar huis(.)"], "na + inversão.", ["v-na"]),
    TR("pt-nl","Durante a aula não falamos inglês.", ["Tijdens de les spreken we geen Engels(.)","Tijdens de les praten we geen Engels(.)"], "tijdens.", ["v-tijdens"]),
    FB("Ik werk van negen ___ vijf.", ["tot"], "até.", ["v-tot"], choices=["tot","sinds","na"], tr="Trabalho das nove às cinco."),
    FB("Was je handen ___ het eten.", ["voor"], "antes de.", ["v-voor-tijd"], choices=["voor","na","tijdens"], tr="Lava as mãos antes de comer."),
    MC("Qual é a ordem correta?", ["*Na de les drink ik koffie.","Na de les ik drink koffie.|Inversão."], "Inversão.", ["v-na"]),
    LI("Ik leer sinds een jaar Nederlands.", ["Ik leer sinds een jaar Nederlands(.)"], "Aprendo neerlandês há um ano.", "sinds = há (com presente).", ["v-sinds"]),
  ], diff=2, mins=4)

L(13, "Esperar por, olhar para", "Wachten op, kijken naar.",
  ["Usar verbos com preposição fixa"],
  vocab=[],
  ex=[("Ik wacht op de bus.","Estou à espera do autocarro."),("We kijken naar een film.","Estamos a ver um filme.")],
  gram=[G("g-s2u14c-1","Preposição fixa","Muitos verbos levam uma preposição que não corresponde ao português: **wachten op** (esperar por), **kijken naar** (olhar para / ver), **luisteren naar** (ouvir). Aprende-os como um bloco.")],
  review=["v-wachten-op","v-kijken-naar","v-luisteren"],
  cefr=C, exs=[
    MC("«Estou à espera da Ana» =", ["*Ik wacht op Ana.","Ik wacht voor Ana.|Preposição: op.","Ik wacht Ana.|Falta op."], "wachten op.", ["v-wachten-op"]),
    MC("«Ouço música» =", ["*Ik luister naar muziek.","Ik luister muziek.|Falta naar.","Ik luister op muziek.|Não."], "luisteren naar.", ["v-luisteren"]),
    TR("pt-nl","Estou à espera do comboio.", ["Ik wacht op de trein(.)"], "wachten op.", ["v-wachten-op"]),
    TR("pt-nl","Olha para mim!", ["Kijk naar mij(!)","Kijk naar me(!)"], "kijken naar.", ["v-kijken-naar"]),
    FB("We luisteren ___ de radio.", ["naar"], "luisteren naar.", ["v-luisteren"], choices=["naar","op","aan"], tr="Ouvimos a rádio."),
    FB("Wacht je ___ mij?", ["op"], "wachten op.", ["v-wachten-op"], choices=["op","naar","voor"], tr="Esperas por mim?"),
    FE(["Ik","wacht","naar","de","bus."], 2, "op", "wachten op.", ["v-wachten-op"]),
    LI("Ik kijk naar het nieuws.", ["Ik kijk naar het nieuws(.)"], "Vejo as notícias.", "Ouvir.", ["v-kijken-naar"]),
  ], diff=2, mins=4)

L(14, "Pensar em, falar de, cuidar de", "Denken aan, praten over, zorgen voor.",
  ["Usar mais verbos com preposição"],
  vocab=[],
  ex=[("Ik denk vaak aan Portugal.","Penso muitas vezes em Portugal."),("We praten over het weer.","Falamos do tempo."),("Zij zorgt voor haar moeder.","Ela cuida da mãe.")],
  review=["v-denken-aan","v-praten-over","v-zorgen-voor","v-houden-van"],
  cefr=C, exs=[
    MA([("denken aan","pensar em"),("praten over","falar de/sobre"),("zorgen voor","cuidar de"),("houden van","gostar de, amar")], "Verbos + preposição.", ["v-denken-aan","v-praten-over","v-zorgen-voor","v-houden-van"]),
    MC("«Penso em ti» =", ["*Ik denk aan jou.","Ik denk over jou.|Para «pensar em alguém»: aan.","Ik denk in jou.|Calco do português."], "denken aan.", ["v-denken-aan"]),
    TR("pt-nl","Falamos do tempo.", ["We praten over het weer(.)","Wij praten over het weer(.)"], "praten over.", ["v-praten-over"]),
    TR("pt-nl","Ela cuida dos filhos.", ["Ze zorgt voor de kinderen(.)","Zij zorgt voor haar kinderen(.)","Ze zorgt voor haar kinderen(.)"], "zorgen voor.", ["v-zorgen-voor"]),
    FB("Ik hou ___ chocolade!", ["van"], "houden van.", ["v-houden-van"], choices=["van","aan","voor"], tr="Adoro chocolate!"),
    FE(["Ik","denk","in","mijn","familie."], 2, "aan", "denken aan.", ["v-denken-aan"]),
    LI("Waar praten jullie over?", ["Waar praten jullie over(?)"], "Estão a falar de quê?", "waar … over.", ["v-praten-over"]),
    DL([("Collega","Wie zorgt voor je kat tijdens de vakantie?","Quem cuida do teu gato nas férias?"),("Jij","","")], ["*Mijn buurvrouw zorgt voor hem.","Ik denk aan de kat.|Não responde.","De kat praat.|Não."], "Responder.", ["v-zorgen-voor"]),
  ], diff=2, mins=4)

L(15, "Prática: um dia com preposições", "Waar, wanneer en waarop?",
  ["Combinar lugar, tempo e verbos com preposição num texto"],
  vocab=[],
  ex=[("(Fictício) Na het werk wacht ik op de bus tegenover het station. Thuis kijk ik naar het nieuws en denk ik aan mijn familie.","Depois do trabalho espero o autocarro em frente à estação…")],
  review=["v-na","v-wachten-op","v-tegenover","v-kijken-naar","v-denken-aan","v-meestal","v-sinds"],
  cefr=C, exs=[
    MC("(Fictício) «Na het werk wacht ik op de bus tegenover het station.» Onde espera?", ["*em frente à estação","dentro da estação|Não.","ao lado do trabalho|Não."], "Compreensão.", ["v-tegenover"]),
    MC("(Fictício) «Ik woon sinds drie jaar in Delft.» Há quanto tempo mora em Delft?", ["*há três anos","durante três anos no passado|Ainda mora lá.","daqui a três anos|Não."], "Compreensão.", ["v-sinds"]),
    TR("pt-nl","Depois do jantar ouço música.", ["Na het eten luister ik naar muziek(.)","Na het avondeten luister ik naar muziek(.)"], "na + luisteren naar.", ["v-na","v-luisteren"]),
    TR("pt-nl","Normalmente penso na minha família ao domingo.", ["Meestal denk ik op zondag aan mijn familie(.)","Op zondag denk ik meestal aan mijn familie(.)"], "denken aan.", ["v-meestal","v-denken-aan"]),
    LI("Tijdens de vakantie zorgt mijn broer voor de planten.", ["Tijdens de vakantie zorgt mijn broer voor de planten(.)"], "Durante as férias o meu irmão cuida das plantas.", "Ouvir.", ["v-tijdens","v-zorgen-voor"]),
    FE(["We","kijken","op","een","film."], 2, "naar", "kijken naar.", ["v-kijken-naar"]),
    BS("Espero pela minha amiga junto ao café.", ["Ik","wacht","op","mijn","vriendin","bij","het","café."], ["Ik wacht op mijn vriendin bij het café."], "wachten op + bij.", ["v-wachten-op","v-bij"]),
    SW("Escreva 4 frases sobre a sua tarde (use na, tijdens, wachten op, kijken naar).", ["Na het werk wacht ik op de tram. Thuis kijk ik naar het nieuws. Tijdens het eten praten we over de dag. Daarna lees ik een boek."], ["Preposições de tempo","Verbos com preposição"], 20, "Escrever.", ["v-na","v-wachten-op"]),
  ], diff=2, mins=5)

W()
