import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u02")
C = "A2"

L(1, "A bicicleta neerlandesa", "o selim, os travões, o cadeado, a luz.",
  ["Nomear as partes da bicicleta e o que precisa"],
  vocab=[V("v-zadel","zadel","selim","noun","het"), V("v-rem","rem","travão","noun","de","remmen"), V("v-slot","slot","cadeado|fechadura","noun","het","sloten"),
         V("v-band","band","pneu","noun","de","banden"), V("v-fietslicht","fietslicht","luz da bicicleta","noun","het",note="À noite é obrigatório ter luzes."), V("v-lek","lek","furado","adjective",note="Ik heb een lekke band = tenho um furo.")],
  ex=[("Mijn band is lek.","Tenho um pneu furado."),("Zet je fiets altijd op slot.","Tranca sempre a bicicleta."),("'s Avonds moet je licht hebben.","À noite tens de ter luz.")],
  gram=[G("g-fiets-cultura","A bicicleta","Há mais bicicletas do que pessoas nos Países Baixos. Regras básicas: luzes à noite, nunca deixar a bicicleta sem cadeado (**op slot zetten**), e **dois cadeados** em cidades grandes. Os roubos são muito comuns.",
    [("Mijn fiets is gestolen!","Roubaram-me a bicicleta!")])],
  review=["v-fiets","v-kapot","v-fietspad"],
  cefr=C, exs=[
    MA([("zadel","selim"),("rem","travão"),("slot","cadeado"),("band","pneu"),("fietslicht","luz")], "A bicicleta.", ["v-zadel","v-rem","v-slot","v-band","v-fietslicht"]),
    AR("zadel","o selim","het", "«Het zadel».", ["v-zadel"]),
    AR("slot","o cadeado","het", "«Het slot».", ["v-slot"]),
    TR("pt-nl","Tenho um pneu furado.", ["Ik heb een lekke band","Mijn band is lek"], "lek → lekke (antes de palavra de).", ["v-lek","v-band"]),
    TR("nl-pt","Zet je fiets altijd op slot.", ["Tranca sempre a (tua )bicicleta","Põe sempre o cadeado na bicicleta"], "op slot zetten = trancar.", ["v-slot"]),
    FE(["Ik","heb","een","lek","band."], 3, "lekke", "Antes de palavra de: lekke.", ["v-lek"]),
    FB("Mijn ___ werkt niet: ik kan niet stoppen!", ["rem"], "rem = travão.", ["v-rem"], choices=["rem","zadel","licht"], tr="O meu travão não funciona: não consigo parar!"),
    LI("Mijn fiets is gestolen!", ["Mijn fiets is gestolen"], "Roubaram-me a bicicleta!", "gestolen = roubado.", ["v-fiets"]),
    MC("O que é obrigatório à noite?", ["*Ter luzes na bicicleta","Andar no passeio|É proibido.","Usar capacete|Não é obrigatório para adultos."], "Licht is verplicht.", ["v-fietslicht"]),
    WO("O selim é alto demais.", ["Het","zadel","is","te","hoog"], "te hoog.", ["v-zadel"]),
  ], diff=2, mins=5)

L(2, "Regras na estrada", "voorrang, het fietspad, de stoep, rechtsaf, linksaf.",
  ["Perceber regras de trânsito básicas para ciclistas"],
  vocab=[V("v-voorrang","voorrang","prioridade","noun","de"), V("v-stoep","stoep","passeio","noun","de"),
         V("v-rechtsaf","rechtsaf","virar à direita","adverb",note="rechtsaf slaan = virar à direita"), V("v-linksaf","linksaf","virar à esquerda","adverb"),
         V("v-stoplicht","stoplicht","semáforo","noun","het"), V("v-verboden","verboden","proibido","adjective")],
  ex=[("Fietsen op de stoep is verboden.","Andar de bicicleta no passeio é proibido."),("Rechts heeft voorrang.","Quem vem da direita tem prioridade."),("Sla bij het stoplicht linksaf.","No semáforo vira à esquerda.")],
  gram=[G("g-voorrang","Prioridade","Regra geral: **verkeer van rechts heeft voorrang** (quem vem da direita tem prioridade), salvo sinais. Ciclistas circulam no **fietspad** quando existe; no **stoep** (passeio) é proibido. Para indicar que vira, estica-se o braço.",
    [("Steek je hand uit.","Estica o braço.")])],
  review=["v-fietspad","v-links","v-rechts","v-rechtdoor"],
  cefr=C, exs=[
    MA([("voorrang","prioridade"),("stoep","passeio"),("stoplicht","semáforo"),("verboden","proibido")], "Trânsito.", ["v-voorrang","v-stoep","v-stoplicht","v-verboden"]),
    MA([("rechtsaf","virar à direita"),("linksaf","virar à esquerda"),("rechtdoor","em frente")], "Direções.", ["v-rechtsaf","v-linksaf","v-rechtdoor"]),
    TR("nl-pt","Fietsen op de stoep is verboden.", ["Andar de bicicleta no passeio é proibido","É proibido andar de bicicleta no passeio"], "verboden.", ["v-stoep","v-verboden"]),
    TR("pt-nl","No semáforo vira à esquerda.", ["Sla bij het stoplicht linksaf","Bij het stoplicht linksaf"], "linksaf slaan.", ["v-linksaf","v-stoplicht"]),
    AR("stoplicht","o semáforo","het", "licht → het stoplicht.", ["v-stoplicht"]),
    MC("Num cruzamento sem sinais, quem tem prioridade?", ["*Quem vem da direita","Quem vem da esquerda|Não: da direita.","O mais rápido|Não."], "Rechts heeft voorrang.", ["v-voorrang"]),
    FE(["Ik","fiets","op","de","stoep","naar","school."], 4, "fietspad", "No passeio é proibido: op het fietspad.", ["v-stoep"]),
    LI("Het stoplicht is rood: stop!", ["Het stoplicht is rood(,) stop"], "O semáforo está vermelho: pára!", "rood = vermelho.", ["v-stoplicht"]),
    FB("Hier heeft de fietser ___.", ["voorrang"], "voorrang = prioridade.", ["v-voorrang"], choices=["voorrang","verboden","stoep"], tr="Aqui o ciclista tem prioridade."),
    WO("Na segunda rua vira à direita.", ["Sla","de","tweede","straat","rechtsaf"], "Imperativo.", ["v-rechtsaf"]),
  ], diff=2, mins=6)

L(3, "Comboio: sprinter e intercity", "Tipos de comboio, reservar lugar, a estação central.",
  ["Distinguir tipos de comboio e perceber a estação"],
  vocab=[V("v-intercity","intercity","comboio rápido (intercidades)","noun","de"), V("v-sprinter","sprinter","comboio regional (para em todas as estações)","noun","de"),
         V("v-centraal-station","Centraal Station","estação central","noun","het"), V("v-stoppen","stoppen","parar","verb"), V("v-plaats","plaats","lugar|sítio","noun","de","plaatsen")],
  ex=[("De intercity stopt niet in Woerden.","O intercidades não para em Woerden."),("Neem de sprinter.","Apanha o regional."),("Is deze plaats vrij?","Este lugar está livre?")],
  review=["v-trein","v-station","v-vrij","v-snel","v-langzaam"],
  cefr=C, exs=[
    MA([("intercity","intercidades"),("sprinter","regional"),("stoppen","parar"),("plaats","lugar")], "Comboios.", ["v-intercity","v-sprinter","v-stoppen","v-plaats"]),
    MC("Quer ir a uma estação pequena entre duas cidades. Que comboio apanha?", ["*De sprinter","De intercity|O intercidades só para nas estações grandes.","Een vliegtuig|É um avião."], "A sprinter para em todas.", ["v-sprinter"]),
    TR("pt-nl","Este lugar está livre?", ["Is deze plaats vrij","Is deze stoel vrij","Is hier vrij"], "de plaats → deze.", ["v-plaats","v-vrij"]),
    TR("nl-pt","De intercity stopt niet in Woerden.", ["O intercidades não para em Woerden"], "stoppen = parar.", ["v-intercity","v-stoppen"]),
    AR("plaats","o lugar","de", "«De plaats».", ["v-plaats"]),
    DL([("Passageiro","Pardon, is deze plaats vrij?","Desculpe, este lugar está livre?"),("Senhora","")], ["*Ja hoor, ga zitten.","Nee, ik ben vrij.|Não faz sentido.","Ja, het is de sprinter.|Não responde."], "«Ja hoor» = sim, claro.", ["v-plaats"]),
    LI("Deze trein stopt op alle stations.", ["Deze trein stopt op alle stations"], "Este comboio para em todas as estações.", "alle = todas.", ["v-stoppen"]),
    FE(["De","sprinter","is","sneller","dan","de","intercity."], 3, "langzamer", "A sprinter para mais vezes: é mais lenta.", ["v-sprinter"]),
    FB("Ik stap uit op Amsterdam ___ .", ["Centraal"], "Amsterdam Centraal.", ["v-centraal-station"], choices=["Centraal","Halte","Perron"], tr="Saio em Amesterdão Central."),
    WO("O intercidades é mais rápido.", ["De","intercity","is","sneller"], "sneller = mais rápido.", ["v-intercity"]),
  ], diff=2, mins=5)

L(4, "Autocarro, elétrico e metro", "de tram, de metro, uitstappen, de chauffeur.",
  ["Usar autocarro, elétrico e metro"],
  vocab=[V("v-tram","tram","elétrico","noun","de","trams"), V("v-metro","metro","metro","noun","de"), V("v-instappen","instappen","entrar (no veículo)","verb"),
         V("v-uitstappen","uitstappen","sair (do veículo)","verb"), V("v-chauffeur","chauffeur","motorista","noun","de")],
  ex=[("Bij welke halte moet ik uitstappen?","Em que paragem tenho de sair?"),("Stap voorin in bij de chauffeur.","Entre pela frente, junto ao motorista."),("De tram rijdt elke tien minuten.","O elétrico passa de dez em dez minutos.")],
  review=["v-halte","v-bus","v-inchecken"],
  cefr=C, exs=[
    MA([("tram","elétrico"),("metro","metro"),("instappen","entrar"),("uitstappen","sair"),("chauffeur","motorista")], "Transportes urbanos.", ["v-tram","v-metro","v-instappen","v-uitstappen","v-chauffeur"]),
    TR("pt-nl","Em que paragem tenho de sair?", ["Bij welke halte moet ik uitstappen","Op welke halte moet ik uitstappen"], "moeten + uitstappen.", ["v-uitstappen","v-halte"]),
    TR("nl-pt","De tram rijdt elke tien minuten.", ["O elétrico passa de dez em dez minutos","O elétrico passa a cada dez minutos"], "elke tien minuten.", ["v-tram"]),
    WO("Saio na próxima paragem.", ["Ik","stap","bij","de","volgende","halte","uit"], "Separável: stap … uit.", ["v-uitstappen","v-volgende"]),
    DL([("Pedro","Gaat deze bus naar het ziekenhuis?","Este autocarro vai para o hospital?"),("Motorista","")], ["*Ja, u moet bij de vierde halte uitstappen.","Ja, ik ben de chauffeur.|Não responde.","Nee, de tram is rood.|Não responde."], "Indicação de paragem.", ["v-uitstappen"]),
    AR("tram","o elétrico","de", "«De tram».", ["v-tram"]),
    FE(["Ik","uitstap","bij","het","museum."], 1, "stap … uit", "Separável: ik stap bij het museum uit.", ["v-uitstappen"]),
    LI("Volgende halte: Centraal Station.", ["Volgende halte(,) Centraal Station"], "Próxima paragem: Estação Central.", "Anúncio típico.", ["v-halte"]),
    FB("Je moet bij de chauffeur ___ .", ["instappen"], "entrar = instappen.", ["v-instappen"], choices=["instappen","uitstappen","stoppen"], tr="Tens de entrar junto ao motorista."),
    CJ("rijden","de metro","De metro ___ elke vijf minuten.", ["rijdt"], "rijden → rijdt.", ["v-metro"]),
  ], diff=2, mins=5)

L(5, "De casa ao trabalho", "Revisão: escolher transporte e descrever o percurso.",
  ["Descrever como vai para o trabalho ou a escola"],
  ex=[("Ik fiets naar het station, neem de intercity en stap in Utrecht over op de tram.","Vou de bicicleta para a estação, apanho o intercidades e em Utrecht mudo para o elétrico.")],
  review=["v-fiets","v-intercity","v-overstappen","v-uitstappen","v-tram","v-voorrang","v-slot","v-inchecken"],
  cefr=C, exs=[
    TR("pt-nl","Vou de bicicleta para a estação.", ["Ik fiets naar het station","Ik ga met de fiets naar het station"], "fietsen naar.", ["v-fiets"]),
    TR("nl-pt","Hoe lang duurt de reis?", ["Quanto tempo demora a viagem","Quanto tempo dura a viagem"], "duren = demorar.", ["v-overstappen"]),
    WO("Saio na Estação Central e vou a pé para o escritório.", ["Ik","stap","uit","op","Centraal","Station","en","loop","naar","kantoor"], "Separável + loop.", ["v-uitstappen"]),
    MC("Qual é a forma mais neerlandesa de ir para o trabalho?", ["*Met de fiets","Met de taxi|É raro e caro.","Met het vliegtuig|Não."], "A bicicleta.", ["v-fiets"]),
    FE(["Ik","zet","mijn","fiets","op","de","slot."], 5, "(retirar)", "Expressão fixa: op slot zetten (sem artigo).", ["v-slot"]),
    LI("Ik ben er over twintig minuten.", ["Ik ben er over twintig minuten"], "Estou aí daqui a vinte minutos.", "over + tempo = daqui a.", ["v-minuut"]),
    CO("text","O percurso do Lukas", "Lukas woont in Haarlem en werkt in Amsterdam. Elke ochtend fietst hij tien minuten naar het station. Hij neemt de sprinter van 7.48 uur. Op Amsterdam Sloterdijk stapt hij over op de tram. Om half negen is hij op zijn werk. Als het hard regent, neemt hij de bus naar het station.",
       [("Como vai Lukas para a estação?", ["*De bicicleta","De autocarro sempre","A pé"]),("Onde muda para o elétrico?", ["*Em Sloterdijk","Em Haarlem","Na Estação Central"]),("O que faz quando chove muito?", ["*Apanha o autocarro para a estação","Fica em casa","Vai de carro"])],
       "als het hard regent = quando chove muito.", ["v-overstappen","v-sprinter"]),
    MA([("met de fiets","de bicicleta"),("met de trein","de comboio"),("te voet","a pé"),("met de auto","de carro")], "Meios de transporte.", ["v-fiets","v-trein","v-auto"]),
    FB("De bus is te laat, dus ik neem de ___.", ["tram","metro","fiets"], "Alternativa de transporte.", ["v-tram"], choices=["tram","halte","zadel"], tr="O autocarro está atrasado, por isso apanho o elétrico."),
    SW("Descreva o seu percurso para o trabalho ou a escola (transportes, tempo, transbordos).", ["Ik fiets naar het station(.) Ik neem de trein en ik stap in Utrecht over(.) De reis duurt een uur"],
       ["Pelo menos dois meios de transporte","Um verbo separável correto (overstappen, uitstappen…)","Quanto tempo demora (duren)"], 10, "Compare com o modelo.", ["v-overstappen"]),
  ], diff=3, mins=7)

W()
