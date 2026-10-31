import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u07")
C = "A2"
# Lições extra (10–15): mais partes do corpo, dores, alergias, tensão arterial, ligar ao médico.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Mais partes do corpo", "Knie, voet, schouder.",
  ["Nomear mais partes do corpo"],
  vocab=[N("v-knie","knie","joelho","de","knieën"), N("v-voet","voet","pé","de","voeten"), N("v-schouder","schouder","ombro","de","schouders"),
         N("v-tand","tand","dente","de","tanden")],
  ex=[("Mijn knie doet pijn.","Dói-me o joelho."),("Ik heb koude voeten.","Tenho os pés frios.")],
  review=["v-hoofd","v-arm","v-hand","v-rug","v-been"],
  cefr=C, exs=[
    MA([("knie","joelho"),("voet","pé"),("schouder","ombro"),("tand","dente")], "Corpo.", ["v-knie","v-voet","v-schouder","v-tand"]),
    MC("Plural de «voet»:", ["*voeten","voets|Não.","voetten|Não."], "Plural.", ["v-voet"]),
    MC("Plural de «knie»:", ["*knieën","knies|Não.","kniejen|Não."], "Trema.", ["v-knie"]),
    TR("pt-nl","Dói-me o ombro.", ["Mijn schouder doet pijn(.)","Ik heb pijn aan mijn schouder(.)"], "pijn doen.", ["v-schouder"]),
    TR("pt-nl","Tenho os pés frios.", ["Ik heb koude voeten(.)"], "koude voeten.", ["v-voet"]),
    FB("Ik poets twee keer per dag mijn ___.", ["tanden"], "Dentes.", ["v-tand"], choices=["tanden","knieën","voeten"], tr="Lavo os dentes duas vezes por dia."),
    LI("Na het hardlopen doet mijn knie pijn.", ["Na het hardlopen doet mijn knie pijn(.)"], "Depois de correr dói-me o joelho.", "Ouvir.", ["v-knie"]),
    AR("knie", "joelho", "de", "de knie.", ["v-knie"]),
  ], diff=2, mins=4)

L(11, "Que dor!", "Hoofdpijn, keelpijn, buikpijn.",
  ["Dizer onde te dói"],
  vocab=[N("v-hoofdpijn","hoofdpijn","dor de cabeça","de"), N("v-keelpijn","keelpijn","dor de garganta","de"), N("v-buikpijn","buikpijn","dor de barriga","de")],
  ex=[("Ik heb hoofdpijn.","Tenho dor de cabeça."),("Mijn keel doet pijn.","Dói-me a garganta.")],
  gram=[G("g-s3u07c-1","Duas formas","**Ik heb hoofdpijn** (substantivo composto) = **Mijn hoofd doet pijn** (verbo *pijn doen*). As duas estão certas. Com *pijn doen*, o sujeito é a parte do corpo: *Mijn rug **doet** pijn*.")],
  review=["v-hoofd","v-keel","v-buik","v-klacht"],
  cefr=C, exs=[
    MA([("hoofdpijn","dor de cabeça"),("keelpijn","dor de garganta"),("buikpijn","dor de barriga"),("klacht","queixa")], "Dores.", ["v-hoofdpijn","v-keelpijn","v-buikpijn","v-klacht"]),
    TR("pt-nl","Tenho dor de cabeça.", ["Ik heb hoofdpijn(.)","Mijn hoofd doet pijn(.)"], "hoofdpijn.", ["v-hoofdpijn"]),
    TR("pt-nl","Dói-me a barriga.", ["Mijn buik doet pijn(.)","Ik heb buikpijn(.)"], "pijn doen.", ["v-buikpijn"]),
    FB("Mijn rug ___ pijn.", ["doet"], "pijn doen.", ["v-rug"], choices=["doet","heeft","is"], tr="Dói-me as costas."),
    MC("Qual está correta?", ["*Mijn ogen doen pijn.","Mijn ogen doet pijn.|Plural: doen.","Ik doe pijn aan mijn ogen.|Significa outra coisa."], "Concordância.", ["v-oog"]),
    DL([("Huisarts","Wat zijn uw klachten?","Quais são as suas queixas?"),("Jij","","")], ["*Ik heb sinds gisteren keelpijn en een beetje koorts.","Ik ben pijn.|Não.","Hoofd.|Incompleto."], "Descrever.", ["v-keelpijn","v-koorts"]),
    LI("Ik heb al drie dagen hoofdpijn.", ["Ik heb al drie dagen hoofdpijn(.)"], "Tenho dor de cabeça há três dias.", "Ouvir.", ["v-hoofdpijn"]),
    WO("Dói-me a garganta.", ["Mijn","keel","doet","pijn."], "Ordem.", ["v-keelpijn"]),
  ], diff=2, mins=4)

L(12, "Alergias", "Hooikoorts en allergie.",
  ["Falar de alergias e da febre dos fenos"],
  vocab=[N("v-hooikoorts","hooikoorts","febre dos fenos (alergia ao pólen)","de"), N("v-allergie","allergie","alergia","de","allergieën")],
  ex=[("In de lente heb ik last van hooikoorts.","Na primavera sofro de febre dos fenos."),("Heeft u allergieën?","Tem alergias?")],
  review=["v-allergisch","v-oog","v-lente"],
  cefr=C, exs=[
    MA([("hooikoorts","febre dos fenos"),("allergie","alergia"),("allergisch voor","alérgico a"),("lente","primavera")], "Alergias.", ["v-hooikoorts","v-allergie","v-allergisch","v-lente"]),
    MC("A hooikoorts é provocada por…", ["*pólen","comida estragada|Não.","frio|Não."], "Facto.", ["v-hooikoorts"]),
    TR("pt-nl","Tem alergias?", ["Heeft u allergieën?","Hebt u allergieën?","Heeft u een allergie?"], "allergieën.", ["v-allergie"]),
    TR("pt-nl","Sou alérgico a gatos.", ["Ik ben allergisch voor katten(.)"], "allergisch voor.", ["v-allergisch"]),
    FB("Ik heb last van ___; mijn ogen jeuken.", ["hooikoorts"], "Febre dos fenos.", ["v-hooikoorts"], choices=["hooikoorts","keelpijn","griep"], tr="Sofro de febre dos fenos; os olhos fazem-me comichão."),
    DL([("Apotheker","Bent u ergens allergisch voor?","É alérgico a alguma coisa?"),("Jij","","")], ["*Ja, voor penicilline.","Ik ben allergie.|Não.","Lente.|Não."], "Informar.", ["v-allergisch"]),
    LI("Ik heb last van mijn ogen door de hooikoorts.", ["Ik heb last van mijn ogen door de hooikoorts(.)"], "Tenho problemas nos olhos por causa da febre dos fenos.", "Ouvir.", ["v-hooikoorts"]),
    AR("allergie", "alergia", "de", "-ie → de.", ["v-allergie"]),
  ], diff=2, mins=4)

L(13, "Na médica de família", "De bloeddruk meten.",
  ["Perceber os exames simples na consulta"],
  vocab=[N("v-bloeddruk","bloeddruk","tensão arterial","de"), X("v-bloed-prikken","bloed prikken","tirar sangue (análises)","verb")],
  ex=[("De huisarts meet mijn bloeddruk.","A médica mede-me a tensão."),("We gaan bloed prikken om het te controleren.","Vamos tirar sangue para verificar.")],
  review=["v-onderzoeken","v-huisarts","v-recept-med","v-rust"],
  cefr=C, exs=[
    MA([("bloeddruk","tensão arterial"),("bloed prikken","tirar sangue"),("onderzoeken","examinar"),("recept","receita")], "Consulta.", ["v-bloeddruk","v-bloed-prikken","v-onderzoeken","v-recept-med"]),
    TR("pt-nl","A médica mede-me a tensão.", ["De huisarts meet mijn bloeddruk(.)","De dokter meet mijn bloeddruk(.)"], "meten.", ["v-bloeddruk"]),
    TR("pt-nl","Tenho de tirar sangue.", ["Ik moet bloed laten prikken(.)","Ik moet bloed prikken(.)"], "bloed prikken.", ["v-bloed-prikken"]),
    FB("De arts gaat mijn longen ___.", ["onderzoeken"], "Examinar.", ["v-onderzoeken"], choices=["onderzoeken","prikken","meten"], tr="O médico vai examinar-me os pulmões."),
    DL([("Huisarts","Ik schrijf een recept voor u uit.","Vou passar-lhe uma receita."),("Jij","","")], ["*Dank u. Hoe vaak moet ik het innemen?","Ik ben recept.|Não.","Bloeddruk.|Não."], "Perguntar.", ["v-recept-med"]),
    LI("Uw bloeddruk is een beetje hoog.", ["Uw bloeddruk is een beetje hoog(.)"], "A sua tensão está um pouco alta.", "Ouvir.", ["v-bloeddruk","v-hoog"]),
    MC("«Neem rust» significa…", ["*Descanse.","Tome um medicamento chamado Rust.|Não.","Faça desporto.|Não."], "Conselho.", ["v-rust"]),
    AR("bloeddruk", "tensão arterial", "de", "de druk.", ["v-bloeddruk"]),
  ], diff=2, mins=4)

L(14, "Ligar para o médico", "De doktersassistente.",
  ["Explicar ao telefone porque precisas de consulta"],
  vocab=[N("v-doktersassistente","doktersassistente","assistente do médico de família","de")],
  ex=[("De doktersassistente stelt eerst een paar vragen.","A assistente faz primeiro algumas perguntas."),("U kunt morgen om 9.10 uur komen.","Pode vir amanhã às 9h10.")],
  gram=[G("g-s3u07c-2","Como funciona","Nos Países Baixos liga-se primeiro para o consultório do **huisarts**. A **doktersassistente** faz perguntas para decidir se precisas de consulta, de um telefonema do médico ou de conselho. Em urgência fora de horas: *huisartsenpost*; em perigo de vida: **112**.")],
  review=["v-huisarts","v-afspraak","v-terugbellen","v-koorts"],
  cefr=C, exs=[
    MC("Quem atende normalmente o telefone no consultório?", ["*de doktersassistente","de huisarts zelf, sempre|Raramente.","de apotheker|Não."], "Sistema.", ["v-doktersassistente"]),
    TR("pt-nl","Preciso de uma consulta hoje.", ["Ik heb vandaag een afspraak nodig(.)","Kan ik vandaag een afspraak krijgen?"], "afspraak nodig.", ["v-afspraak"]),
    TR("pt-nl","O médico liga-lhe de volta.", ["De huisarts belt u terug(.)","De dokter belt u terug(.)"], "terugbellen.", ["v-terugbellen"]),
    DL([("Doktersassistente","Wat zijn de klachten?","Quais são as queixas?"),("Jij","","")], ["*Mijn zoon heeft al drie dagen 39 graden koorts.","Ik ben assistente.|Não.","Morgen.|Não responde."], "Descrever.", ["v-koorts"]),
    DL([("Doktersassistente","Kunt u morgen om tien over negen?","Pode amanhã às nove e dez?"),("Jij","","")], ["*Ja, dat past goed. Dank u.","Nee, ik ben negen.|Não.","Koorts.|Não."], "Aceitar.", ["v-dat-past-goed"]),
    FB("De ___ belt u vanmiddag terug.", ["huisarts"], "Médico.", ["v-huisarts"], choices=["huisarts","kapper","opticien"], tr="O médico liga-lhe de volta esta tarde."),
    LI("Is het spoed of kan het tot morgen wachten?", ["Is het spoed of kan het tot morgen wachten(?)"], "É urgente ou pode esperar até amanhã?", "Pergunta típica.", ["v-spoed"]),
    AR("doktersassistente", "assistente do médico", "de", "Pessoa: de.", ["v-doktersassistente"]),
  ], diff=2, mins=4)

L(15, "Prática: estou doente", "Ik voel me niet lekker.",
  ["Descrever sintomas, ligar para o trabalho e para o médico"],
  vocab=[],
  ex=[("(Fictício) Ik voel me niet lekker. Ik heb hoofdpijn en keelpijn en ik ben een beetje duizelig.","Não me sinto bem…")],
  review=["v-hoofdpijn","v-keelpijn","v-duizelig","v-ziekmelden","v-beterschap","v-doktersassistente"],
  cefr=C, exs=[
    MC("«Ik voel me niet lekker» significa…", ["*Não me sinto bem.","A comida não está boa.|Aqui é saúde.","Não gosto de mim.|Não."], "Expressão.", ["v-ziekmelden"]),
    MC("Um colega está doente. Dizes-lhe:", ["*Beterschap!","Gefeliciteerd!|Não.","Proost!|Não."], "Votos.", ["v-beterschap"]),
    TR("pt-nl","Tenho dor de cabeça e estou tonto.", ["Ik heb hoofdpijn en ik ben duizelig(.)"], "duizelig.", ["v-hoofdpijn","v-duizelig"]),
    TR("pt-nl","Hoje fico de baixa.", ["Ik meld me vandaag ziek(.)","Vandaag meld ik me ziek(.)"], "zich ziekmelden.", ["v-ziekmelden"]),
    LI("Ik heb koorts en ik hoest veel.", ["Ik heb koorts en ik hoest veel(.)"], "Tenho febre e tusso muito.", "Ouvir.", ["v-koorts","v-hoesten"]),
    BS("Dói-me o joelho desde ontem.", ["Mijn","knie","doet","sinds","gisteren","pijn."], ["Mijn knie doet sinds gisteren pijn."], "pijn no fim.", ["v-knie"]),
    DL([("Leidinggevende","Wat is er aan de hand?","O que se passa?"),("Jij","","")], ["*Ik ben ziek: ik heb griep. Ik kom vandaag niet werken.","Beterschap!|É o chefe que diz isso.","Ik ben knie.|Não."], "Avisar o trabalho.", ["v-griep"]),
    SW("Escreva uma mensagem ao chefe a dizer que está doente (sintomas, que não vai, quando avisa de novo).", ["Goedemorgen Mark, ik voel me niet lekker. Ik heb koorts en keelpijn, dus ik meld me vandaag ziek. Morgen laat ik weten hoe het gaat. Groet, Inês"], ["Sintomas","Baixa","Próximo contacto"], 20, "Escrever.", ["v-ziekmelden"]),
  ], diff=2, mins=5)

W()
