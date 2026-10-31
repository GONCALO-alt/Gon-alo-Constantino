import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u03")
C = "A1-A2"
# Lições extra (10–15): datas, festas neerlandesas, marcar na agenda, planear um mês.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Que dia é hoje?", "Welke dag is het vandaag?",
  ["Perguntar e dizer o dia da semana e a data"],
  vocab=[X("v-welke-dag","welke dag is het?","que dia é hoje?"), X("v-de-hoeveelste","de hoeveelste is het?","a quantos estamos?")],
  ex=[("Welke dag is het vandaag? — Het is woensdag.","Que dia é hoje? — É quarta-feira."),("De hoeveelste is het? — Het is de twaalfde.","A quantos estamos? — Estamos a doze.")],
  review=["v-dag","v-vandaag","v-woensdag","v-datum"],
  cefr=C, exs=[
    MA([("welke dag is het?","que dia é hoje?"),("de hoeveelste is het?","a quantos estamos?"),("datum","data"),("vandaag","hoje")], "Datas.", ["v-welke-dag","v-de-hoeveelste","v-datum","v-vandaag"]),
    MC("Resposta a «De hoeveelste is het?»:", ["*Het is de vijfde.","Het is vrijdag.|Isso responde a «welke dag».","Het is vijf uur.|Isso é a hora."], "Data.", ["v-de-hoeveelste"]),
    TR("pt-nl","Que dia é hoje?", ["Welke dag is het vandaag?","Welke dag is het?"], "Expressão.", ["v-welke-dag"]),
    TR("pt-nl","Hoje é sexta-feira.", ["Het is vandaag vrijdag(.)","Vandaag is het vrijdag(.)","Het is vrijdag(.)"], "vrijdag.", ["v-vrijdag"]),
    FB("Gisteren was het dinsdag, dus vandaag is het ___.", ["woensdag"], "Sequência.", ["v-woensdag"], choices=["woensdag","maandag","donderdag"], tr="Ontem foi terça, por isso hoje é quarta."),
    LI("Het is vandaag donderdag de tiende.", ["Het is vandaag donderdag de tiende(.)","Het is vandaag donderdag 10(.)"], "Hoje é quinta-feira, dia dez.", "Ouvir.", ["v-donderdag"]),
    DL([("Collega","De hoeveelste is het vandaag?","A quantos estamos?"),("Jij","","")], ["*De zesentwintigste.","Maandag.|Não diz a data.","Om tien uur.|Não."], "Responder com a data.", ["v-de-hoeveelste"]),
    WO("Que dia é hoje?", ["Welke","dag","is","het","vandaag?"], "Ordem.", ["v-welke-dag"]),
  ], diff=2, mins=4)

L(11, "Escrever e dizer datas", "Op 3 mei.",
  ["Escrever e ler datas à neerlandesa"],
  vocab=[],
  ex=[("Mijn verjaardag is op 3 mei.","O meu aniversário é a 3 de maio."),("Op 25 december is het Kerstmis.","A 25 de dezembro é Natal.")],
  gram=[G("g-s2u03c-1","Datas","Escreve-se **3 mei** (sem «de», mês com minúscula) e diz-se *drie mei*. Para «no dia» usa-se **op**: *op 3 mei*. Por escrito: **3-5-2026** ou **03-05-2026** (dia-mês-ano, como em Portugal).")],
  review=["v-mei","v-december","v-verjaardag","v-kerst"],
  cefr=C, exs=[
    MC("«A 3 de maio» =", ["*op 3 mei","in 3 mei|Para dias usa-se op.","op 3 van mei|Sem «van»."], "Data.", ["v-mei"]),
    MC("Os meses escrevem-se…", ["*com minúscula: januari","com maiúscula: Januari|Não.","em abreviatura obrigatória|Não."], "Ortografia.", ["v-januari"]),
    TR("pt-nl","O meu aniversário é a 12 de junho.", ["Mijn verjaardag is op 12 juni(.)","Mijn verjaardag is op twaalf juni(.)"], "op + data.", ["v-verjaardag","v-juni"]),
    TR("pt-nl","Em agosto estou de férias.", ["In augustus ben ik op vakantie(.)","In augustus heb ik vakantie(.)"], "in + mês.", ["v-augustus","v-op-vakantie"]),
    FB("___ 1 januari is het Nieuwjaar.", ["Op"], "op + data.", ["v-januari"], choices=["Op","In","Om"], tr="A 1 de janeiro é Ano Novo."),
    FB("___ maart is het nog koud.", ["In"], "in + mês.", ["v-maart"], choices=["In","Op","Om"], tr="Em março ainda está frio."),
    LI("De afspraak is op vijftien oktober.", ["De afspraak is op vijftien oktober(.)","De afspraak is op 15 oktober(.)"], "A consulta é a 15 de outubro.", "Ouvir.", ["v-oktober","v-afspraak"]),
    MC("«07-11» numa carta neerlandesa é…", ["*7 de novembro","11 de julho|Dia vem primeiro.","julho de 2011|Não."], "Formato.", ["v-november"]),
  ], diff=2, mins=4)

L(12, "Festas neerlandesas", "Sinterklaas en Nieuwjaar.",
  ["Conhecer as principais festas do calendário neerlandês"],
  vocab=[X("v-sinterklaas","Sinterklaas","São Nicolau (festa de 5 de dezembro)","noun"), X("v-nieuwjaar","Nieuwjaar","Ano Novo","noun")],
  ex=[("Op 5 december vieren we Sinterklaas.","A 5 de dezembro celebramos o São Nicolau."),("Gelukkig Nieuwjaar!","Feliz Ano Novo!")],
  gram=[G("g-s2u03c-2","O calendário","**Sinterklaas** (5 de dezembro): troca de prendas, sobretudo para crianças. **Kerstmis** (25–26 de dezembro). **Koningsdag** (27 de abril): o dia do rei, tudo cor de laranja. **Nieuwjaar** (1 de janeiro).")],
  review=["v-koningsdag","v-kerst","v-feestdag","v-december","v-april"],
  cefr=C, exs=[
    MA([("Sinterklaas","5 de dezembro"),("Koningsdag","27 de abril"),("Kerstmis","25 de dezembro"),("Nieuwjaar","1 de janeiro")], "Calendário.", ["v-sinterklaas","v-koningsdag","v-kerst","v-nieuwjaar"]),
    MC("No Koningsdag, as pessoas vestem-se de…", ["*cor de laranja","verde|Não.","vermelho|Não."], "Cultura.", ["v-koningsdag"]),
    MC("A festa de Sinterklaas é sobretudo para…", ["*as crianças, com prendas","os turistas|Não.","os estudantes no verão|Não."], "Cultura.", ["v-sinterklaas"]),
    TR("pt-nl","Feliz Ano Novo!", ["Gelukkig Nieuwjaar(!)","Gelukkig nieuwjaar(!)"], "Votos.", ["v-nieuwjaar"]),
    TR("nl-pt","Op 27 april is het Koningsdag.", ["A 27 de abril é o Dia do Rei(.)","No dia 27 de abril é o Koningsdag(.)"], "Koningsdag.", ["v-koningsdag"]),
    FB("Op 5 december vieren we ___.", ["Sinterklaas"], "Festa.", ["v-sinterklaas"], choices=["Sinterklaas","Koningsdag","Nieuwjaar"], tr="A 5 de dezembro celebramos o São Nicolau."),
    LI("Is Tweede Kerstdag ook een vrije dag?", ["Is Tweede Kerstdag ook een vrije dag(?)"], "O segundo dia de Natal (26/12) também é feriado?", "Ouvir.", ["v-kerst","v-vrij"]),
    DL([("Collega","Wat doe je met Kerstmis?","O que fazes no Natal?"),("Jij","","")], ["*Ik ga naar mijn familie in Portugal.","Op 5 december.|Não responde.","Gelukkig Nieuwjaar!|Data errada."], "Responder.", ["v-kerst"]),
  ], diff=2, mins=4)

L(13, "Marcar na agenda", "Kun je op donderdag?",
  ["Propor um dia e responder se dá jeito"],
  vocab=[X("v-dat-past-goed","dat past goed","dá jeito, está bem"), X("v-dan-kan-ik-niet","dan kan ik niet","nesse dia/hora não posso")],
  ex=[("Kun je op donderdag? — Dat past goed.","Podes na quinta? — Dá jeito."),("Vrijdag? Dan kan ik niet, sorry.","Sexta? Nesse dia não posso, desculpa.")],
  review=["v-kunnen","v-passen","v-afspraak","v-agenda","v-vrij"],
  cefr=C, exs=[
    MA([("dat past goed","dá jeito"),("dan kan ik niet","não posso nesse dia"),("agenda","agenda"),("vrij","livre")], "Agenda.", ["v-dat-past-goed","v-dan-kan-ik-niet","v-agenda","v-vrij"]),
    MC("Tens a sexta livre. A resposta a «Kun je vrijdag?»:", ["*Ja, dat past goed.","Dan kan ik niet.|Estás livre.","Ik ben vrijdag.|Não."], "Aceitar.", ["v-dat-past-goed"]),
    TR("pt-nl","Podes na quinta?", ["Kun je op donderdag?","Kun je donderdag?","Kan je op donderdag?"], "kunnen.", ["v-kunnen","v-donderdag"]),
    TR("pt-nl","Na segunda não posso.", ["Maandag kan ik niet(.)","Op maandag kan ik niet(.)","Ik kan maandag niet(.)"], "kan ik niet.", ["v-dan-kan-ik-niet"]),
    FB("Woensdag ben ik ___. Dan kan ik wel.", ["vrij"], "Livre.", ["v-vrij"], choices=["vrij","dicht","laat"], tr="Na quarta estou livre. Nesse dia posso."),
    DL([("Tandarts","Past dinsdag om tien uur?","Dá jeito terça às dez?"),("Jij","","")], ["*Dan kan ik niet. Kan het ook om twee uur?","Dat past goed, maandag.|Contraditório.","Agenda.|Não."], "Propor outra hora.", ["v-dan-kan-ik-niet"]),
    LI("Ik kijk even in mijn agenda.", ["Ik kijk even in mijn agenda(.)"], "Vou só ver a minha agenda.", "Ouvir.", ["v-agenda"]),
    CJ("kunnen","jij","___ jij morgen?", ["Kun","Kan"], "Pergunta: kun jij / kan jij.", ["v-kunnen"]),
  ], diff=2, mins=4)

L(14, "Uma semana de folga", "Een vrije dag en vakantie.",
  ["Falar de dias livres e férias"],
  vocab=[N("v-werkdag","werkdag","dia útil, dia de trabalho","de","werkdagen")],
  ex=[("Maandag is mijn vrije dag.","A segunda é o meu dia de folga."),("In juli heb ik drie weken vakantie.","Em julho tenho três semanas de férias.")],
  review=["v-vrij","v-week","v-maand","v-volgende","v-vorige"],
  cefr=C, exs=[
    MA([("werkdag","dia de trabalho"),("vrije dag","dia de folga"),("volgende week","a próxima semana"),("vorige maand","o mês passado")], "Tempo.", ["v-werkdag","v-vrij","v-volgende","v-vorige"]),
    TR("pt-nl","Para a semana tenho férias.", ["Volgende week heb ik vakantie(.)","Ik heb volgende week vakantie(.)"], "volgende week.", ["v-volgende"]),
    TR("pt-nl","No mês passado estive em Portugal.", ["Vorige maand was ik in Portugal(.)"], "vorige maand + was.", ["v-vorige","v-maand"]),
    FB("Ik werk vier dagen per week; vrijdag is mijn ___ dag.", ["vrije"], "vrije dag.", ["v-vrij"], choices=["vrije","werk","volgende"], tr="Trabalho quatro dias por semana; a sexta é o meu dia livre."),
    MC("«Volgende week» é…", ["*a próxima semana","a semana passada|Isso é vorige week.","esta semana|Isso é deze week."], "Tempo.", ["v-volgende"]),
    LI("Een werkdag duurt acht uur.", ["Een werkdag duurt acht uur(.)"], "Um dia de trabalho dura oito horas.", "Ouvir.", ["v-werkdag"]),
    DL([("Collega","Wanneer heb je vakantie?","Quando tens férias?"),("Jij","","")], ["*In augustus, twee weken.","Op werkdag.|Não.","Vorige week morgen.|Não faz sentido."], "Responder.", ["v-augustus"]),
    WO("Para a semana trabalho.", ["Volgende","week","werk","ik."], "Inversão.", ["v-volgende"]),
  ], diff=2, mins=4)

L(15, "Prática: o meu mês", "Mijn maand in de agenda.",
  ["Ler uma agenda e escrever planos com datas"],
  vocab=[],
  ex=[("(Fictício) 3 mei: tandarts · 12 mei: verjaardag Ana · 27 april: Koningsdag","Agenda.")],
  review=["v-afspraak","v-agenda","v-de-hoeveelste","v-dat-past-goed","v-sinterklaas","v-volgende"],
  cefr=C, exs=[
    MC("(Fictício) Na agenda: «3 mei: tandarts». O que há a 3 de maio?", ["*uma consulta no dentista","um aniversário|Isso é a 12.","um feriado|Não."], "Compreensão.", ["v-afspraak"]),
    MC("(Fictício) «12 mei: verjaardag Ana». O que dizes à Ana nesse dia?", ["*Gefeliciteerd!","Gelukkig Nieuwjaar!|Não.","Sorry dat ik te laat ben.|Não."], "Contexto.", ["v-gefeliciteerd"]),
    TR("pt-nl","A 3 de maio tenho consulta.", ["Op 3 mei heb ik een afspraak(.)","Ik heb op 3 mei een afspraak(.)"], "op + data.", ["v-afspraak","v-mei"]),
    TR("pt-nl","No próximo mês vou a Portugal.", ["Volgende maand ga ik naar Portugal(.)","Ik ga volgende maand naar Portugal(.)"], "volgende maand.", ["v-volgende","v-maand"]),
    LI("Op vrijdag de achtste heb ik een vrije dag.", ["Op vrijdag de achtste heb ik een vrije dag(.)","Op vrijdag 8 heb ik een vrije dag(.)"], "Na sexta, dia 8, tenho um dia de folga.", "Ouvir.", ["v-vrij"]),
    BS("Na quinta às duas tenho uma consulta.", ["Op","donderdag","om","twee","uur","heb","ik","een","afspraak."], ["Op donderdag om twee uur heb ik een afspraak."], "Inversão.", ["v-afspraak"]),
    DL([("Vriendin","Kun je op de twintigste?","Podes no dia 20?"),("Jij","","")], ["*Ja, dat past goed!","Het is de twintigste.|Não responde.","Volgende maand vorige.|Não."], "Aceitar.", ["v-dat-past-goed"]),
    SW("Escreva 3 compromissos do seu próximo mês, com data (op …).", ["Op 2 juni heb ik een afspraak bij de huisarts. Op 14 juni is de verjaardag van mijn moeder. Op 28 juni ga ik naar Portugal."], ["3 datas","op + data"], 20, "Escrever.", ["v-afspraak"]),
  ], diff=2, mins=5)

W()
