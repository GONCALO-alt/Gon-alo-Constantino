import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u02")
C = "A1-A2"
# Lições extra (10–15): mais prática de horas — horário de trabalho, atrasos, 24 horas, duração.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Que horas são? Revisão", "Het is tien over half drie.",
  ["Ler qualquer hora no relógio à neerlandesa"],
  vocab=[],
  ex=[("Het is half vier.","São três e meia."),("Het is tien over half drie.","São duas e quarenta."),("Het is kwart voor zes.","São seis menos um quarto.")],
  gram=[G("g-s2u02c-1","Lembrete","**half vier** = 3h30 (meia hora *antes* das quatro). Entre os minutos 20 e 40 conta-se a partir da meia hora: **vijf voor half vier** = 3h25; **vijf over half vier** = 3h35.")],
  review=["v-half","v-kwart","v-over","v-voor","v-precies"],
  cefr=C, exs=[
    MC("«half acht» =", ["*7h30","8h30|Meia hora antes das oito.","8h00|Não."], "half.", ["v-half"]),
    MC("«tien over half drie» =", ["*2h40","3h10|Conta a partir de half drie (2h30).","2h10|Isso é tien over twee."], "over half.", ["v-over","v-half"]),
    MC("«kwart voor zes» =", ["*5h45","6h15|Isso é kwart over zes.","6h45|Não."], "kwart voor.", ["v-kwart","v-voor"]),
    MC("4h25 diz-se…", ["*vijf voor half vijf","vijfentwintig over vier|Compreende-se, mas não é a forma habitual.","vijf over half vier|Isso é 3h35."], "voor half.", ["v-voor","v-half"]),
    LI("Het is precies negen uur.", ["Het is precies negen uur(.)"], "São nove horas em ponto.", "precies.", ["v-precies"]),
    LI("Het is kwart over elf.", ["Het is kwart over elf(.)"], "São onze e um quarto.", "Ouvir.", ["v-kwart"]),
    TR("pt-nl","São três e meia.", ["Het is half vier(.)"], "half vier.", ["v-half"]),
    FB("Het is ___ over half twee. (1h40)", ["tien"], "1h30 + 10.", ["v-over"], choices=["tien","twintig","vijf"], tr="É uma e quarenta."),
  ], diff=2, mins=4)

L(11, "Horário de trabalho", "Van negen tot vijf.",
  ["Dizer o horário de trabalho ou de abertura"],
  vocab=[X("v-van-tot","van … tot …","das … às …")],
  ex=[("Ik werk van negen tot vijf.","Trabalho das nove às cinco."),("De winkel is open van acht tot zes.","A loja está aberta das oito às seis.")],
  review=["v-werken","v-open","v-dicht","v-middag"],
  cefr=C, exs=[
    MC("«van tien tot vier» =", ["*das 10h às 16h","às 10h e às 4h|Indica um intervalo.","10 minutos para as 4|Não."], "Intervalo.", ["v-van-tot"]),
    TR("pt-nl","Trabalho das nove às cinco.", ["Ik werk van negen tot vijf(.)"], "van … tot.", ["v-van-tot"]),
    TR("pt-nl","A loja está aberta das oito às seis.", ["De winkel is open van acht tot zes(.)","De winkel is van acht tot zes open(.)"], "open.", ["v-van-tot","v-open"]),
    FB("De bakker is open ___ zeven tot vijf.", ["van"], "van … tot.", ["v-van-tot"], choices=["van","om","tot"], tr="A padaria está aberta das sete às cinco."),
    FB("Op zondag is de winkel ___.", ["dicht"], "Fechada.", ["v-dicht"], choices=["dicht","open","laat"], tr="Ao domingo a loja está fechada."),
    LI("Ik werk van half negen tot vijf uur.", ["Ik werk van half negen tot vijf uur(.)","Ik werk van half negen tot vijf(.)"], "Trabalho das oito e meia às cinco.", "Ouvir.", ["v-van-tot"]),
    DL([("Klant","Hoe laat bent u open?","A que horas estão abertos?"),("Medewerker","","")], ["*Van negen tot zes, maandag tot zaterdag.","Om negen.|Falta a hora de fecho.","Ja, open.|Não."], "Horário.", ["v-van-tot"]),
    WO("Trabalho das nove às cinco.", ["Ik","werk","van","negen","tot","vijf."], "Ordem.", ["v-van-tot"]),
  ], diff=2, mins=4)

L(12, "Desculpa o atraso", "Sorry dat ik te laat ben.",
  ["Pedir desculpa por chegar tarde e avisar de um atraso"],
  vocab=[X("v-sorry-te-laat","sorry dat ik te laat ben","desculpa o atraso")],
  ex=[("Sorry dat ik te laat ben! De trein had vertraging.","Desculpa o atraso! O comboio estava atrasado."),("Ik ben tien minuten later.","Chego dez minutos mais tarde.")],
  review=["v-te-laat","v-vertraging","v-later","v-op-tijd","v-minuut"],
  cefr=C, exs=[
    MA([("te laat","atrasado"),("op tijd","a horas"),("vertraging","atraso (transporte)"),("later","mais tarde")], "Pontualidade.", ["v-te-laat","v-op-tijd","v-vertraging","v-later"]),
    MC("Chegas 15 minutos tarde a uma reunião. Dizes:", ["*Sorry dat ik te laat ben.","Ik ben op tijd!|Não estás.","Tot straks!|Não."], "Desculpa.", ["v-sorry-te-laat"]),
    TR("pt-nl","Desculpa o atraso!", ["Sorry dat ik te laat ben(!)"], "Expressão fixa.", ["v-sorry-te-laat"]),
    TR("pt-nl","O comboio está atrasado.", ["De trein heeft vertraging(.)"], "vertraging hebben.", ["v-vertraging"]),
    FB("Ik ben tien minuten ___. Sorry!", ["later"], "Mais tarde.", ["v-later"], choices=["later","vroeg","precies"], tr="Chego dez minutos mais tarde. Desculpa!"),
    DL([("Collega","Waar ben je? We beginnen!","Onde estás? Vamos começar!"),("Jij","","")], ["*Sorry, de bus heeft vertraging. Ik ben er over tien minuten.","Ik ben op tijd.|Não estás lá.","Prima, tot dan.|Não explica."], "Avisar.", ["v-vertraging"]),
    LI("Geen probleem, je bent precies op tijd.", ["Geen probleem(,) je bent precies op tijd(.)"], "Não há problema, chegaste mesmo a horas.", "Ouvir.", ["v-op-tijd"]),
    MC("Nos Países Baixos, chegar 15 minutos tarde a uma reunião de trabalho é visto…", ["*geralmente como pouco profissional, a não ser que avises antes","sempre normal|Não é a norma.","impossível|Acontece."], "Cultura.", ["v-op-tijd"]),
  ], diff=2, mins=4)

L(13, "As 24 horas", "Om 14.30 uur.",
  ["Ler horas em formato de 24 horas"],
  vocab=[],
  ex=[("De trein vertrekt om 14.30 uur.","O comboio parte às 14h30."),("Veertien uur dertig.","Catorze e trinta.")],
  gram=[G("g-s2u02c-2","Formato 24 horas","Em horários oficiais (comboio, cinema, escritório) usa-se o formato 24 h: **14.30 uur** lê-se *veertien uur dertig*. Na conversa, as pessoas preferem: *half drie ('s middags)*.")],
  review=["v-uur","v-half","v-middag"],
  cefr=C, exs=[
    MC("«14.30 uur» na conversa diz-se…", ["*half drie","half vijftien|Na fala não se usa.","dertig over twee|Não é habitual."], "Converter.", ["v-half"]),
    MC("«20.15 uur» =", ["*kwart over acht ('s avonds)","kwart over twee|Não.","kwart voor acht|Não."], "Converter.", ["v-kwart"]),
    LI("De film begint om twintig uur.", ["De film begint om twintig uur(.)","De film begint om 20 uur(.)","De film begint om 20.00 uur(.)"], "O filme começa às 20 horas.", "Ouvir.", ["v-uur"]),
    LI("De trein vertrekt om zeventien uur vijftien.", ["De trein vertrekt om zeventien uur vijftien(.)","De trein vertrekt om 17.15 uur(.)","De trein vertrekt om 17.15(.)"], "O comboio parte às 17h15.", "Ouvir.", ["v-uur"]),
    TR("pt-nl","A reunião é às 15h00.", ["De vergadering is om vijftien uur(.)","De vergadering is om drie uur(.)","De vergadering is om 15.00 uur(.)"], "Formal.", ["v-uur"]),
    MC("«om negen uur 's avonds» =", ["*21h00","9h00|'s avonds = à noite.","19h00|Não."], "Converter.", ["v-s-avonds"]),
    FB("13.00 uur = één uur 's ___", ["middags"], "Tarde.", ["v-s-middags"], choices=["middags","avonds","ochtends"], tr="13h = uma da tarde."),
    DL([("Loket","De bus vertrekt om 18.45 uur.","O autocarro parte às 18h45."),("Jij","","")], ["*Dus om kwart voor zeven. Dank u wel!","Dus om kwart over zes.|Não.","Dus morgen.|Não."], "Confirmar.", ["v-kwart"]),
  ], diff=2, mins=4)

L(14, "Quanto tempo demora?", "Het duurt een half uur.",
  ["Dizer quanto tempo demora uma coisa"],
  vocab=[X("v-duren","duren","durar, demorar","verb"), X("v-anderhalf-uur","anderhalf uur","uma hora e meia"), N("v-kwartier","kwartier","quarto de hora","het")],
  ex=[("Hoe lang duurt de les? — Anderhalf uur.","Quanto tempo dura a aula? — Uma hora e meia."),("Het duurt een kwartier.","Demora um quarto de hora.")],
  review=["v-minuut","v-uur","v-half","v-ongeveer"],
  cefr=C, exs=[
    MA([("een kwartier","15 minutos"),("een half uur","30 minutos"),("anderhalf uur","90 minutos"),("ongeveer","mais ou menos")], "Duração.", ["v-kwartier","v-half","v-anderhalf-uur","v-ongeveer"]),
    AR("kwartier", "quarto de hora", "het", "het kwartier.", ["v-kwartier"]),
    TR("pt-nl","Quanto tempo demora?", ["Hoe lang duurt het?","Hoe lang duurt het"], "hoe lang + duren.", ["v-duren"]),
    TR("pt-nl","Demora uma hora e meia.", ["Het duurt anderhalf uur(.)"], "anderhalf.", ["v-anderhalf-uur","v-duren"]),
    FB("De film ___ twee uur.", ["duurt"], "het duurt.", ["v-duren"], choices=["duurt","duren","duur"], tr="O filme dura duas horas."),
    LI("Met de fiets duurt het ongeveer een kwartier.", ["Met de fiets duurt het ongeveer een kwartier(.)"], "De bicicleta demora mais ou menos um quarto de hora.", "Ouvir.", ["v-kwartier","v-ongeveer"]),
    DL([("Toerist","Hoe lang duurt het naar het station?","Quanto tempo se demora até à estação?"),("Jij","","")], ["*Lopend ongeveer tien minuten.","Om tien uur.|Isso é «a que horas».","Het station is groot.|Não."], "Duração.", ["v-duren"]),
    WO("Demora meia hora.", ["Het","duurt","een","half","uur."], "Ordem.", ["v-duren"]),
  ], diff=2, mins=4)

L(15, "Prática: um dia cheio de horários", "Een vol schema.",
  ["Compreender um horário e responder a perguntas"],
  vocab=[],
  ex=[("(Fictício) 08.30 werk – 12.30 lunch – 17.00 klaar – 19.30 sporten","Horário do dia.")],
  review=["v-van-tot","v-duren","v-kwartier","v-half","v-te-laat","v-op-tijd"],
  cefr=C, exs=[
    MC("(Fictício) «Sanne werkt van half negen tot vijf.» Quantas horas trabalha (sem pausa)?", ["*8,5 horas","9 horas|Das 8h30 às 17h00.","7 horas|Não."], "Cálculo.", ["v-van-tot"]),
    MC("(Fictício) «De les begint om 19.30 uur en duurt anderhalf uur.» A que horas acaba?", ["*às 21h00","às 20h30|Uma hora e meia.","às 21h30|Não."], "Cálculo.", ["v-anderhalf-uur"]),
    LI("Ik begin om kwart over acht.", ["Ik begin om kwart over acht(.)"], "Começo às oito e um quarto.", "Ouvir.", ["v-kwart"]),
    LI("De vergadering duurt een half uur.", ["De vergadering duurt een half uur(.)"], "A reunião dura meia hora.", "Ouvir.", ["v-duren"]),
    TR("pt-nl","Às sete e meia faço desporto.", ["Om half acht sport ik(.)","Ik sport om half acht(.)"], "half acht = 7h30.", ["v-half","v-sporten"]),
    BS("Trabalho das nove às cinco.", ["Ik","werk","van","negen","tot","vijf."], ["Ik werk van negen tot vijf."], "van … tot.", ["v-van-tot"]),
    DL([("Collega","Ben je morgen op tijd?","Amanhã chegas a horas?"),("Jij","","")], ["*Ja, ik ben er om kwart voor negen.","Nee, ik ben kwartier.|Não.","Het duurt.|Não."], "Responder.", ["v-op-tijd"]),
    SW("Escreva o seu horário de amanhã (3–4 frases com horas).", ["Om zeven uur sta ik op. Ik werk van half negen tot vijf. Om half acht kook ik. Het duurt ongeveer een half uur."], ["Horas","van … tot","duren"], 20, "Escrever.", ["v-van-tot","v-duren"]),
  ], diff=2, mins=5)

W()
