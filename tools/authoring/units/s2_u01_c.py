import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u01")
C = "A1-A2"
# Lições extra (10–15): mais prática da rotina diária — separáveis, tarefas de casa, à tarde, diário.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "À tarde", "'s Middags werk ik.",
  ["Dizer o que fazes de manhã, à tarde e à noite"],
  vocab=[X("v-s-middags","'s middags","à tarde (depois do almoço)","adverb")],
  ex=[("'s Ochtends werk ik thuis, 's middags ga ik naar kantoor.","De manhã trabalho em casa, à tarde vou para o escritório."),("'s Avonds kook ik.","À noite cozinho.")],
  gram=[G("g-s2u01c-1","'s ochtends / 's middags / 's avonds","Estas expressões começam com **'s** (minúscula, com apóstrofo). Se começam a frase, a maiúscula vai para a palavra seguinte: **'s Ochtends**. Depois delas, o verbo vem logo: *'s Middags **werk** ik.*")],
  review=["v-s-ochtends","v-s-avonds","v-lunchen","v-pauze"],
  cefr=C, exs=[
    MA([("'s ochtends","de manhã"),("'s middags","à tarde"),("'s avonds","à noite"),("pauze","pausa")], "Partes do dia.", ["v-s-ochtends","v-s-middags","v-s-avonds","v-pauze"]),
    MC("Qual é a ordem correta?", ["*'s Middags werk ik thuis.","'s Middags ik werk thuis.|Inversão: verbo antes do sujeito."], "Inversão.", ["v-s-middags"]),
    TR("pt-nl","À tarde trabalho em casa.", ["'s Middags werk ik thuis(.)","Ik werk 's middags thuis(.)"], "'s middags.", ["v-s-middags","v-thuiswerken"]),
    TR("pt-nl","À noite vejo televisão com a minha família.", ["'s Avonds kijk ik tv met mijn familie(.)","Ik kijk 's avonds tv met mijn familie(.)","'s Avonds kijk ik met mijn familie tv(.)"], "tv kijken.", ["v-s-avonds","v-tv-kijken"]),
    FB("___ lunch ik om half één.", ["'s Middags"], "À tarde.", ["v-s-middags","v-lunchen"], choices=["'s Middags","'s Avonds","Morgen"], tr="À tarde almoço ao meio-dia e meia."),
    LI("'s Ochtends drink ik koffie en 's middags thee.", ["'s Ochtends drink ik koffie en 's middags thee(.)"], "De manhã bebo café e à tarde chá.", "Ouvir.", ["v-s-ochtends","v-s-middags"]),
    DL([("Collega","Werk je 's middags thuis?","Trabalhas à tarde em casa?"),("Jij","","")], ["*Nee, 's middags ben ik op kantoor.","Ja, 's nachts.|Não responde.","Ik lunch.|Incompleto."], "Responder.", ["v-s-middags"]),
    WO("À tarde tenho uma pausa.", ["'s Middags","heb","ik","pauze."], "Inversão.", ["v-s-middags","v-pauze"]),
  ], diff=2, mins=4)

L(11, "Verbos separáveis da manhã", "Ik sta om zeven uur op.",
  ["Usar opstaan, wakker worden e uitslapen em frases completas"],
  vocab=[],
  ex=[("Ik sta om zeven uur op.","Levanto-me às sete."),("In het weekend slaap ik uit.","Ao fim de semana durmo até tarde.")],
  gram=[G("g-s2u01c-2","Separáveis","Em *opstaan* e *uitslapen*, a partícula vai para o **fim** da frase: *Ik **sta** om zeven uur **op***. *Ik **slaap** op zondag **uit***. No infinitivo fica junta: *Ik wil uitslapen.*")],
  review=["v-opstaan","v-uitslapen","v-wakker-worden"],
  cefr=C, exs=[
    MC("Qual é a ordem correta?", ["*Ik sta om zeven uur op.","Ik opsta om zeven uur.|Separável: «op» vai para o fim."], "Separável.", ["v-opstaan"]),
    MC("Qual é a ordem correta?", ["*Op zaterdag slaap ik uit.","Op zaterdag uitslaap ik.|«uit» vai para o fim."], "Separável.", ["v-uitslapen"]),
    TR("pt-nl","Levanto-me às seis.", ["Ik sta om zes uur op(.)","Om zes uur sta ik op(.)"], "opstaan.", ["v-opstaan"]),
    TR("pt-nl","Ao domingo durmo até tarde.", ["Op zondag slaap ik uit(.)","Ik slaap op zondag uit(.)","Zondag slaap ik uit(.)"], "uitslapen.", ["v-uitslapen"]),
    FB("Hoe laat sta je ___?", ["op"], "Partícula no fim.", ["v-opstaan"], choices=["op","uit","aan"], tr="A que horas te levantas?"),
    WO("Ela levanta-se às seis.", ["Ze","staat","om","zes","uur","op."], "Partícula no fim.", ["v-opstaan"]),
    LI("Ik word om half zeven wakker.", ["Ik word om half zeven wakker(.)"], "Acordo às seis e meia.", "wakker worden.", ["v-wakker-worden"]),
    FB("Morgen wil ik ___. (dormir até tarde)", ["uitslapen"], "Infinitivo: junto.", ["v-uitslapen"], choices=["uitslapen","slaap uit","uit slapen"], tr="Amanhã quero dormir até tarde."),
  ], diff=2, mins=4)

L(12, "Tarefas de casa", "Stofzuigen en de was doen.",
  ["Falar das tarefas domésticas"],
  vocab=[X("v-stofzuigen","stofzuigen","aspirar","verb"), X("v-de-was-doen","de was doen","lavar a roupa"),
         X("v-bed-opmaken","het bed opmaken","fazer a cama")],
  ex=[("Op zaterdag doe ik de was.","Ao sábado lavo a roupa."),("Wie zuigt er vandaag stof?","Quem aspira hoje?"),("Ik maak elke ochtend mijn bed op.","Faço a cama todas as manhãs.")],
  review=["v-boodschappen","v-koken"],
  cefr=C, exs=[
    MA([("stofzuigen","aspirar"),("de was doen","lavar a roupa"),("het bed opmaken","fazer a cama"),("koken","cozinhar")], "Casa.", ["v-stofzuigen","v-de-was-doen","v-bed-opmaken","v-koken"]),
    TR("pt-nl","Ao sábado lavo a roupa.", ["Op zaterdag doe ik de was(.)","Ik doe op zaterdag de was(.)","Zaterdag doe ik de was(.)"], "de was doen.", ["v-de-was-doen"]),
    TR("pt-nl","Faço a cama.", ["Ik maak het bed op(.)","Ik maak mijn bed op(.)"], "Separável.", ["v-bed-opmaken"]),
    MC("Qual é a ordem correta?", ["*Hij zuigt vandaag stof.","Hij stofzuigt vandaag.|Também se ouve, mas a forma padrão separa: zuigt … stof."], "stofzuigen é separável.", ["v-stofzuigen"]),
    FB("Ik doe de ___ en jij kookt.", ["was"], "de was doen.", ["v-de-was-doen"], choices=["was","bed","stof"], tr="Eu lavo a roupa e tu cozinhas."),
    DL([("Partner","Wat doe jij vandaag in huis?","O que fazes hoje em casa?"),("Jij","","")], ["*Ik zuig stof en ik doe de boodschappen.","Ik ben huis.|Não.","Uitslapen is leuk.|Não responde."], "Dividir tarefas.", ["v-stofzuigen","v-boodschappen"]),
    LI("Elke ochtend maak ik mijn bed op.", ["Elke ochtend maak ik mijn bed op(.)"], "Todas as manhãs faço a cama.", "Ouvir.", ["v-bed-opmaken"]),
    WO("Lavo a roupa.", ["Ik","doe","de","was."], "Ordem.", ["v-de-was-doen"]),
  ], diff=2, mins=4)

L(13, "Trabalhar em casa", "Thuiswerken op dinsdag.",
  ["Descrever um dia de teletrabalho"],
  vocab=[],
  ex=[("Op dinsdag werk ik thuis. Om twaalf uur heb ik pauze.","À terça trabalho em casa. Ao meio-dia tenho pausa."),("Om vijf uur ben ik klaar.","Às cinco acabo.")],
  review=["v-thuiswerken","v-pauze","v-klaar","v-beginnen","v-lunchen","v-werk"],
  cefr=C, exs=[
    MC("«Om vijf uur ben ik klaar» significa…", ["*Às cinco acabo (o trabalho).","Às cinco começo.|Isso é «begin ik».","Às cinco estou pronto para sair de casa.|Aqui: terminei."], "klaar.", ["v-klaar"]),
    TR("pt-nl","À terça trabalho em casa.", ["Op dinsdag werk ik thuis(.)","Dinsdag werk ik thuis(.)","Ik werk op dinsdag thuis(.)"], "thuis werken.", ["v-thuiswerken"]),
    TR("pt-nl","Começo às oito e meia.", ["Ik begin om half negen(.)","Om half negen begin ik(.)"], "half negen = 8h30.", ["v-beginnen"]),
    FB("Om twaalf uur heb ik ___.", ["pauze"], "Pausa.", ["v-pauze"], choices=["pauze","klaar","werk"], tr="Ao meio-dia tenho pausa."),
    CJ("beginnen","hij","Hij ___ om negen uur.", ["begint"], "hij begint.", ["v-beginnen"]),
    LI("Ik werk twee dagen per week thuis.", ["Ik werk twee dagen per week thuis(.)"], "Trabalho dois dias por semana em casa.", "Ouvir.", ["v-thuiswerken"]),
    DL([("Vriend","Werk je vandaag thuis?","Trabalhas hoje em casa?"),("Jij","","")], ["*Ja, maar om vier uur ben ik klaar.","Ja, ik ben pauze.|Não.","Nee, ik slaap uit.|Possível, mas não responde ao trabalho."], "Responder.", ["v-klaar"]),
    WO("Às cinco acabo.", ["Om","vijf","uur","ben","ik","klaar."], "Inversão.", ["v-klaar"]),
  ], diff=2, mins=4)

L(14, "Todas as manhãs, todas as noites", "Elke ochtend, elke avond.",
  ["Falar de hábitos com elke e vaak"],
  vocab=[],
  ex=[("Elke avond kijk ik tv.","Todas as noites vejo televisão."),("Ik sport twee keer per week.","Faço desporto duas vezes por semana.")],
  review=["v-elke-dag","v-vaak","v-soms","v-nooit","v-sporten"],
  cefr=C, exs=[
    MC("«Duas vezes por semana» =", ["*twee keer per week","twee week per keer|Ordem errada.","twee keren week|Não."], "Frequência.", ["v-sporten"]),
    TR("pt-nl","Todas as noites vejo televisão.", ["Elke avond kijk ik tv(.)","Ik kijk elke avond tv(.)"], "elke avond.", ["v-tv-kijken"]),
    TR("pt-nl","Faço desporto duas vezes por semana.", ["Ik sport twee keer per week(.)"], "keer per week.", ["v-sporten"]),
    FB("Ik doe ___ boodschappen op maandag. (sempre)", ["altijd"], "Sempre.", ["v-altijd","v-boodschappen"], choices=["altijd","elke","keer"], tr="Faço sempre as compras à segunda."),
    MC("Qual é a ordem correta?", ["*Soms slaap ik uit.","Soms ik slaap uit.|Inversão depois de «soms»."], "Inversão.", ["v-soms"]),
    LI("Ik ga nooit voor elf uur naar bed.", ["Ik ga nooit voor elf uur naar bed(.)"], "Nunca vou para a cama antes das onze.", "Ouvir.", ["v-nooit","v-naar-bed"]),
    DL([("Collega","Hoe vaak sport je?","Com que frequência fazes desporto?"),("Jij","","")], ["*Drie keer per week.","Om zeven uur.|Isso é «a que horas».","Ja, graag.|Não."], "Frequência.", ["v-sporten"]),
    WO("Todas as manhãs tomo duche.", ["Elke","ochtend","douche","ik."], "Inversão.", ["v-douchen"]),
  ], diff=2, mins=4)

L(15, "Prática: o diário do Bruno", "Een dag uit het leven van Bruno.",
  ["Ler e escrever um texto sobre a rotina"],
  vocab=[],
  ex=[("(Fictício) Bruno staat om zes uur op. Hij doucht en ontbijt. Om zeven uur fietst hij naar zijn werk.","O Bruno levanta-se às seis…")],
  review=["v-opstaan","v-douchen","v-ontbijten","v-s-middags","v-s-avonds","v-naar-bed","v-de-was-doen"],
  cefr=C, exs=[
    MC("(Fictício) «Bruno staat om zes uur op. Hij doucht en ontbijt. Om zeven uur fietst hij naar zijn werk.» O que faz o Bruno às sete?", ["*vai de bicicleta para o trabalho","toma o pequeno-almoço|É antes.","levanta-se|Às seis."], "Compreensão.", ["v-opstaan"]),
    MC("(Fictício) «'s Avonds kookt hij en om elf uur gaat hij naar bed.» A que horas se deita?", ["*às onze","às sete|Não.","às seis|Não."], "Compreensão.", ["v-naar-bed"]),
    TR("pt-nl","Ele toma duche e toma o pequeno-almoço.", ["Hij doucht en ontbijt(.)","Hij doucht en hij ontbijt(.)"], "douchen, ontbijten.", ["v-douchen","v-ontbijten"]),
    TR("pt-nl","À noite ele cozinha.", ["'s Avonds kookt hij(.)","Hij kookt 's avonds(.)"], "Inversão.", ["v-s-avonds","v-koken"]),
    LI("Om half twaalf ga ik naar bed.", ["Om half twaalf ga ik naar bed(.)"], "Às onze e meia vou para a cama.", "Ouvir.", ["v-naar-bed"]),
    BS("Levanto-me às sete e tomo duche.", ["Ik","sta","om","zeven","uur","op","en","ik","douche."], ["Ik sta om zeven uur op en ik douche."], "Separável + en.", ["v-opstaan","v-douchen"]),
    DL([("Vriendin","Wat doe je 's avonds?","O que fazes à noite?"),("Jij","","")], ["*Ik kook en daarna kijk ik tv.","Ik sta op.|É de manhã.","Om zes uur.|Não."], "Responder.", ["v-s-avonds"]),
    SW("Escreva o seu dia em 5 frases (de manhã, à tarde, à noite).", ["Ik sta om zeven uur op. Ik douche en ik ontbijt. 's Middags werk ik op kantoor. 's Avonds kook ik. Om elf uur ga ik naar bed."], ["Manhã","Tarde","Noite","Separáveis"], 25, "Escrever.", ["v-opstaan","v-s-middags"]),
  ], diff=2, mins=5)

W()
