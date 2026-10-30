import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s4-u06")
C = "A2-B1"

L(1, "Apresentar-se numa entrevista", "Vertel eens iets over uzelf.",
  ["Responder a «fale-me de si» de forma breve e organizada"],
  vocab=[V("v-vertel-eens","vertel eens","conte lá|fale-me","expression"), V("v-achtergrond","achtergrond","percurso|antecedentes","noun","de"),
         V("v-momenteel","momenteel","atualmente","adverb"), V("v-afgestudeerd","afgestudeerd","licenciado|formado","adjective",note="Ik ben in 2018 afgestudeerd.")],
  ex=[("Vertel eens iets over uzelf.","Fale-me um pouco de si."),("Ik ben in 2018 afgestudeerd in Lissabon.","Formei-me em 2018 em Lisboa."),("Momenteel werk ik als receptionist.","Atualmente trabalho como rececionista."),("Mijn achtergrond is in de horeca.","O meu percurso é na hotelaria e restauração.")],
  gram=[G("g-zelfpresentatie","Estrutura curta","1) Quem é e de onde vem. 2) **Opleiding** (*Ik ben … afgestudeerd*). 3) **Werkervaring** (*Ik heb … jaar gewerkt bij …*). 4) **Momenteel** + o que faz agora. 5) Porque quer esta função. Fale 1–2 minutos.",
    [("Ik heb drie jaar bij een hotel gewerkt.","Trabalhei três anos num hotel.")])],
  review=["v-opleiding","v-werkervaring","v-geboren","v-u"],
  cefr=C, exs=[
    MA([("vertel eens","conte lá"),("achtergrond","percurso"),("momenteel","atualmente"),("afgestudeerd","formado")], "Apresentação.", ["v-vertel-eens","v-achtergrond","v-momenteel","v-afgestudeerd"]),
    TR("nl-pt","Vertel eens iets over uzelf.", ["Fale-me um pouco de si","Fale-me de si","Conte-me algo sobre si"], "uzelf = si próprio (formal).", ["v-vertel-eens"]),
    TR("pt-nl","Atualmente trabalho como rececionista.", ["Momenteel werk ik als receptionist","Ik werk momenteel als receptionist"], "Inversão depois de momenteel.", ["v-momenteel"]),
    WO("Formei-me em 2018 em Lisboa.", ["Ik","ben","in","2018","in","Lissabon","afgestudeerd"], "zijn + afgestudeerd.", ["v-afgestudeerd"]),
    FE(["Momenteel","ik","werk","bij","een","hotel."], 1, "werk", "Depois de «Momenteel» vem o verbo: Momenteel werk ik…", ["v-momenteel"]),
    AR("achtergrond","o percurso","de", "De achtergrond.", ["v-achtergrond"]),
    MC("Qual é a ordem mais clara?", ["*formação → experiência → o que faz agora → motivação","motivação → idade → hobbies|Pouco profissional.","salário → férias → horário|Não é o momento."], "Estrutura.", []),
    LI("Ik heb drie jaar bij een hotel in Porto gewerkt.", ["Ik heb drie jaar bij een hotel in Porto gewerkt"], "Trabalhei três anos num hotel no Porto.", "Perfectum.", ["v-werkervaring"]),
    DL([("Interviewer","Goedemorgen. Vertel eens iets over uzelf.","Bom dia. Fale-me de si."),("Candidato","")], ["*Ik ben Rui, ik kom uit Portugal en ik werk al vijf jaar in de logistiek.","Ik heb geen tijd.|Inadequado.","Vertel eens over u.|Devolve a pergunta."], "Começar pela apresentação.", ["v-vertel-eens"]),
    SW("Escreva 3–4 frases para responder a «Vertel eens iets over uzelf».", ["Ik ben Ana en ik kom uit Coimbra. Ik ben in 2019 afgestudeerd. Ik heb drie jaar bij een bank gewerkt. Momenteel woon ik in Utrecht."], ["Origem", "Formação (**afgestudeerd**)", "Experiência no perfectum", "**Momenteel** com inversão"], 20, "Apresentação estruturada.", ["v-afgestudeerd","v-momenteel"]),
  ], diff=4, mins=8)

L(2, "Perguntas típicas", "Waarom wilt u hier werken? Wat zijn uw zwakke punten?",
  ["Compreender e responder a perguntas típicas de entrevista"],
  vocab=[V("v-sterke-punten","sterke punten","pontos fortes","expression"), V("v-zwakke-punten","zwakke punten","pontos fracos","expression"),
         V("v-uitdaging","uitdaging","desafio","noun","de"), V("v-zich-ontwikkelen","zich ontwikkelen","desenvolver-se","verb")],
  ex=[("Waarom wilt u bij ons werken?","Porque quer trabalhar connosco?"),("Mijn zwakke punt is dat ik soms ongeduldig ben.","O meu ponto fraco é que às vezes sou impaciente."),("Ik zoek een nieuwe uitdaging.","Procuro um novo desafio."),("Ik wil me verder ontwikkelen.","Quero continuar a desenvolver-me.")],
  review=["v-gemotiveerd","v-flexibel","v-nauwkeurig"],
  cefr=C, exs=[
    MA([("sterke punten","pontos fortes"),("zwakke punten","pontos fracos"),("uitdaging","desafio"),("zich ontwikkelen","desenvolver-se")], "Entrevista.", ["v-sterke-punten","v-zwakke-punten","v-uitdaging","v-zich-ontwikkelen"]),
    TR("pt-nl","Procuro um novo desafio.", ["Ik zoek een nieuwe uitdaging","Ik ben op zoek naar een nieuwe uitdaging"], "uitdaging (de) → nieuwe.", ["v-uitdaging"]),
    TR("nl-pt","Waarom wilt u bij ons werken?", ["Porque quer trabalhar connosco","Por que razão quer trabalhar connosco","Porque é que quer trabalhar connosco"], "bij ons.", []),
    WO("Quero continuar a desenvolver-me.", ["Ik","wil","me","verder","ontwikkelen"], "Reflexivo: me antes do infinitivo.", ["v-zich-ontwikkelen"]),
    MC("Boa resposta sobre um ponto fraco:", ["*Ik ben soms te perfectionistisch, maar ik leer prioriteiten te stellen.","Ik heb geen zwakke punten.|Soa pouco sincero.","Ik kom vaak te laat.|Prejudica a candidatura."], "Ponto fraco + o que faz para melhorar.", ["v-zwakke-punten"]),
    FB("Een van mijn ___ punten is dat ik goed kan plannen.", ["sterke"], "sterke punten.", ["v-sterke-punten"], choices=["sterke","zwakke","sterk"], tr="Um dos meus pontos fortes é que sei planear bem."),
    AR("uitdaging","o desafio","de", "-ing → de.", ["v-uitdaging"]),
    LI("Waar ziet u zichzelf over vijf jaar?", ["Waar ziet u zichzelf over vijf jaar"], "Onde se vê daqui a cinco anos?", "over vijf jaar.", []),
    DL([("Interviewer","Waarom heeft u voor deze functie gekozen?","Porque escolheu esta função?"),("Candidata","")], ["*Ik zoek een nieuwe uitdaging en uw bedrijf past goed bij mij.","Omdat ik geld nodig heb.|Pouco profissional.","Ik kies de functie.|Não explica."], "Motivação.", ["v-uitdaging"]),
    FE(["Ik","wil","mij","ontwikkel","verder."], 3, "ontwikkelen", "Depois de «wil» vem o infinitivo no fim: Ik wil me verder ontwikkelen.", ["v-zich-ontwikkelen"]),
  ], diff=4, mins=7)

L(3, "Fazer perguntas ao entrevistador", "Hoe ziet een gewone werkdag eruit? Wanneer hoor ik meer?",
  ["Fazer perguntas pertinentes no fim da entrevista"],
  vocab=[V("v-eruitzien","eruitzien","parecer|ter aspeto","verb",note="Hoe ziet … eruit?"), V("v-inwerken","inwerken","integrar (um novo funcionário)","verb",note="de inwerkperiode = período de integração"),
         V("v-vervolg","vervolg","seguimento|próximos passos","noun","het"), V("v-team","team","equipa","noun","het")],
  ex=[("Hoe ziet een gewone werkdag eruit?","Como é um dia de trabalho normal?"),("Hoe lang duurt de inwerkperiode?","Quanto tempo dura o período de integração?"),("Wat is het vervolg van de procedure?","Quais são os próximos passos do processo?"),("Hoe groot is het team?","Qual é o tamanho da equipa?")],
  review=["v-vraag","v-wanneer","v-hoe"],
  cefr=C, exs=[
    MA([("eruitzien","ter aspeto"),("inwerken","integrar"),("vervolg","próximos passos"),("team","equipa")], "Perguntas.", ["v-eruitzien","v-inwerken","v-vervolg","v-team"]),
    TR("pt-nl","Como é um dia de trabalho normal?", ["Hoe ziet een gewone werkdag eruit","Hoe ziet een normale werkdag eruit"], "Hoe ziet … eruit?", ["v-eruitzien"]),
    TR("pt-nl","Qual é o tamanho da equipa?", ["Hoe groot is het team"], "het team.", ["v-team"]),
    AR("team","a equipa","het", "Het team.", ["v-team"]),
    TR("nl-pt","Wat is het vervolg van de procedure?", ["Quais são os próximos passos (do processo)","Qual é o seguimento do processo"], "vervolg.", ["v-vervolg"]),
    MC("Qual é a pergunta menos adequada numa primeira entrevista?", ["*Hoeveel vakantiedagen krijg ik, en mag ik vaak thuiswerken?","Hoe ziet een werkdag eruit?|Boa pergunta.","Wanneer hoor ik meer?|Boa pergunta."], "Condições discutem-se mais tarde.", []),
    FE(["Hoe","ziet","een","werkdag","uit?"], 4, "eruit", "A expressão é «eruitzien»: Hoe ziet een werkdag eruit?", ["v-eruitzien"]),
    LI("Wanneer hoor ik meer over het vervolg?", ["Wanneer hoor ik meer over het vervolg"], "Quando terei notícias sobre os próximos passos?", "vervolg.", ["v-vervolg"]),
    WO("Quanto tempo dura o período de integração?", ["Hoe","lang","duurt","de","inwerkperiode?"], "duren.", ["v-inwerken"]),
    FB("Heeft u nog ___ voor ons?", ["vragen"], "Pergunta clássica no fim.", [], choices=["vragen","vraag","gevraagd"], tr="Tem mais alguma pergunta para nós?"),
  ], diff=3, mins=6)

L(4, "Falar de salário e condições", "Wat zijn uw salarisverwachtingen? Is er een reiskostenvergoeding?",
  ["Falar de salário e benefícios de forma adequada"],
  vocab=[V("v-salarisverwachting","salarisverwachting","expectativa salarial","noun","de"), V("v-bruto","bruto","bruto","adjective"),
         V("v-netto","netto","líquido","adjective"), V("v-reiskostenvergoeding","reiskostenvergoeding","subsídio de deslocação","noun","de"),
         V("v-vakantiegeld","vakantiegeld","subsídio de férias","noun","het",note="Normalmente 8% do salário bruto anual.")],
  ex=[("Wat zijn uw salarisverwachtingen?","Quais são as suas expectativas salariais?"),("Het salaris is 3000 euro bruto per maand.","O salário é 3000 euros brutos por mês."),("Krijg ik een reiskostenvergoeding?","Recebo subsídio de deslocação?"),("In mei krijg je vakantiegeld.","Em maio recebes o subsídio de férias.")],
  gram=[G("g-salaris-nl","Salário nos Países Baixos","Fala-se quase sempre em valores **bruto per maand**. Em maio paga-se o **vakantiegeld** (cerca de 8% do bruto anual). Muitas empresas têm uma **cao** (convenção coletiva) com tabelas salariais.",
    [("Volgens de cao is het salaris tussen 2800 en 3400 euro.","Segundo a convenção coletiva o salário está entre 2800 e 3400 euros.")],
    "Em Portugal recebem-se 14 salários; nos Países Baixos são 12 + o vakantiegeld (e às vezes um 13.º mês).")],
  review=["v-salaris","v-vast-contract","v-euro"],
  cefr=C, exs=[
    MA([("salarisverwachting","expectativa salarial"),("bruto","bruto"),("netto","líquido"),("reiskostenvergoeding","subsídio de deslocação"),("vakantiegeld","subsídio de férias")], "Salário.", ["v-salarisverwachting","v-bruto","v-netto","v-reiskostenvergoeding","v-vakantiegeld"]),
    TR("nl-pt","Het salaris is 3000 euro bruto per maand.", ["O salário é (de) 3000 euros brutos por mês","O salário é de 3000 euros brutos mensais"], "bruto per maand.", ["v-bruto"]),
    TR("pt-nl","Recebo subsídio de deslocação?", ["Krijg ik een reiskostenvergoeding","Krijg ik reiskostenvergoeding"], "reiskostenvergoeding.", ["v-reiskostenvergoeding"]),
    MC("«Netto» é o salário…", ["*depois de impostos","antes de impostos|Isso é bruto.","por hora|Não."], "netto = líquido.", ["v-netto"]),
    AR("vakantiegeld","o subsídio de férias","het", "Het geld → het vakantiegeld.", ["v-vakantiegeld"]),
    DL([("HR","Wat zijn uw salarisverwachtingen?","Quais são as suas expectativas salariais?"),("Candidato","")], ["*Ik denk aan ongeveer 3200 euro bruto per maand, afhankelijk van de cao.","Zo veel mogelijk!|Pouco profissional.","Netto of bruto?|Responde com outra pergunta sem dar valor."], "Dar um intervalo realista.", ["v-salarisverwachting","v-bruto"]),
    FB("Het salaris is € 2900 ___ per maand.", ["bruto"], "Valor antes de impostos.", ["v-bruto"], choices=["bruto","netto","vakantiegeld"], tr="O salário é 2900 € brutos por mês (antes de impostos)."),
    LI("Is er een reiskostenvergoeding?", ["Is er een reiskostenvergoeding"], "Há subsídio de deslocação?", "reiskostenvergoeding.", ["v-reiskostenvergoeding"]),
    CO("text","Arbeidsvoorwaarden", "Wij bieden:\n– een salaris van € 2.800 – € 3.300 bruto per maand (afhankelijk van ervaring)\n– 8% vakantiegeld en 25 vakantiedagen\n– een reiskostenvergoeding van € 0,23 per kilometer\n– een laptop en de mogelijkheid om twee dagen per week thuis te werken",
       [("Quantos dias de férias?", ["*25","8","23"]),("Quantos dias de teletrabalho por semana?", ["*Dois","Nenhum","Cinco"])],
       "arbeidsvoorwaarden = condições de trabalho.", ["v-vakantiegeld","v-reiskostenvergoeding"]),
    WO("Quais são as suas expectativas salariais?", ["Wat","zijn","uw","salarisverwachtingen?"], "Plural.", ["v-salarisverwachting"]),
  ], diff=4, mins=7)

L(5, "Depois da entrevista", "Bedankt voor het gesprek. Een e-mail de agradecimento e a resposta.",
  ["Agradecer depois da entrevista e reagir a uma proposta ou recusa"],
  vocab=[V("v-aanbod","aanbod","proposta|oferta","noun","het"), V("v-aannemen-baan","een baan aannemen","aceitar um emprego","expression"),
         V("v-proeftijd","proeftijd","período experimental","noun","de"), V("v-ingangsdatum","ingangsdatum","data de início","noun","de")],
  ex=[("Bedankt voor het prettige gesprek.","Obrigado pela agradável entrevista."),("We willen u graag een aanbod doen.","Gostaríamos de lhe fazer uma proposta."),("De proeftijd is een maand.","O período experimental é de um mês."),("Wat is de ingangsdatum?","Qual é a data de início?")],
  review=["v-afwijzing","v-vast-contract","v-met-vriendelijke-groet","v-bedankt"],
  cefr=C, exs=[
    MA([("aanbod","proposta"),("een baan aannemen","aceitar um emprego"),("proeftijd","período experimental"),("ingangsdatum","data de início")], "Depois da entrevista.", ["v-aanbod","v-aannemen-baan","v-proeftijd","v-ingangsdatum"]),
    TR("pt-nl","Obrigado pela agradável entrevista.", ["Bedankt voor het prettige gesprek","Dank u wel voor het prettige gesprek","Dank u voor het prettige gesprek"], "het gesprek → prettige.", []),
    TR("nl-pt","We willen u graag een aanbod doen.", ["Gostaríamos de lhe fazer uma proposta","Queremos fazer-lhe uma proposta"], "een aanbod doen.", ["v-aanbod"]),
    AR("aanbod","a proposta","het", "Het aanbod.", ["v-aanbod"]),
    AR("proeftijd","o período experimental","de", "Composto com «tijd» (de).", ["v-proeftijd"]),
    MC("Como aceitar a proposta?", ["*Ik neem het aanbod graag aan.","Ik neem het aanbod af.|Não existe neste sentido.","Ik heb een aanbod.|Não aceita."], "aannemen.", ["v-aannemen-baan"]),
    FE(["Ik","neem","het","aanbod","graag","op."], 5, "aan", "aannemen: Ik neem het aanbod graag aan.", ["v-aannemen-baan"]),
    LI("De proeftijd is een maand.", ["De proeftijd is een maand","De proeftijd is één maand"], "O período experimental é de um mês.", "proeftijd.", ["v-proeftijd"]),
    DL([("HR","We hebben besloten u de functie aan te bieden.","Decidimos oferecer-lhe a função."),("Pedro","")], ["*Wat fijn! Ik neem het graag aan. Wat is de ingangsdatum?","Jammer.|Não faz sentido — é uma boa notícia.","Ik solliciteer naar de functie.|Já se candidatou."], "Aceitar e perguntar a data.", ["v-aannemen-baan","v-ingangsdatum"]),
    SW("Escreva um e-mail curto (3 frases) a agradecer a entrevista.", ["Beste mevrouw De Boer,\nBedankt voor het prettige gesprek van vandaag. Ik ben nog steeds erg gemotiveerd voor de functie. Ik zie uw reactie graag tegemoet.\nMet vriendelijke groet,\nPedro"], ["Saudação com **Beste** + nome", "**Bedankt voor het gesprek**", "Motivação + fecho formal"], 20, "E-mail de agradecimento.", []),
  ], diff=4, mins=8)

W()
