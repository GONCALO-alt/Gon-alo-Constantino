import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u01")
C = "B1-B2"

L(1, "Estrutura de um argumento", "stelling, argument, onderbouwing",
  ["Construir um argumento com tese, razão e fundamentação"],
  vocab=[V("v-stelling","stelling","tese|afirmação","noun","de"), V("v-onderbouwen","onderbouwen","fundamentar","verb"),
         V("v-standpunt-innemen","een standpunt innemen","tomar uma posição","expression"), V("v-overtuigen","overtuigen","convencer","verb"),
         V("v-redenering","redenering","raciocínio","noun","de")],
  ex=[("Mijn stelling is dat de stad autovrij moet worden.","A minha tese é que a cidade deve ficar sem carros."),("Kun je dat onderbouwen?","Consegues fundamentar isso?"),("Ik neem een duidelijk standpunt in.","Tomo uma posição clara."),("Zijn redenering klopt niet.","O raciocínio dele não está certo.")],
  gram=[G("g-argument-structuur","Tese → argumento → fundamentação","1) **Stelling**: *Ik vind dat…* / *Mijn stelling is dat…* 2) **Argument**: *…omdat…* 3) **Onderbouwing**: dados, exemplos, fontes: *Uit onderzoek blijkt dat…* / *Zo…*",
    [("Uit onderzoek blijkt dat fietsers gezonder zijn.","A investigação mostra que os ciclistas são mais saudáveis.")])],
  review=["v-argument","v-omdat","v-volgens"],
  cefr=C, exs=[
    MA([("stelling","tese"),("onderbouwen","fundamentar"),("een standpunt innemen","tomar uma posição"),("overtuigen","convencer"),("redenering","raciocínio")], "Argumentar.", ["v-stelling","v-onderbouwen","v-standpunt-innemen","v-overtuigen","v-redenering"]),
    TR("pt-nl","Consegues fundamentar isso?", ["Kun je dat onderbouwen","Kan je dat onderbouwen","Kun jij dat onderbouwen"], "onderbouwen.", ["v-onderbouwen"]),
    TR("nl-pt","Zijn redenering klopt niet.", ["O raciocínio dele não está certo","O raciocínio dele não faz sentido","O raciocínio dele está errado"], "redenering.", ["v-redenering"]),
    WO("A minha tese é que a cidade deve ficar sem carros.", ["Mijn","stelling","is","dat","de","stad","autovrij","moet","worden"], "Verbos no fim.", ["v-stelling"]),
    TR("pt-nl","A investigação mostra que os ciclistas são mais saudáveis.", ["Uit onderzoek blijkt dat fietsers gezonder zijn"], "uit … blijkt dat.", ["v-onderbouwen"]),
    AR("stelling","a tese","de", "-ing → de.", ["v-stelling"]),
    FE(["Hij","heeft","mij","overtuigt."], 3, "overtuigd", "Particípio: overtuigd (prefixo over-, sem ge-; termina em -d).", ["v-overtuigen"]),
    MC("Qual é uma fundamentação (onderbouwing)?", ["*Uit cijfers van het CBS blijkt dat 30% van de mensen thuiswerkt.","Ik vind thuiswerken leuk.|Opinião.","Thuiswerken is goed.|Tese."], "Dados.", ["v-onderbouwen"]),
    LI("Uit onderzoek blijkt dat de meeste mensen het eens zijn.", ["Uit onderzoek blijkt dat de meeste mensen het eens zijn"], "A investigação mostra que a maioria concorda.", "blijken.", ["v-onderbouwen"]),
    SW("Escreva tese + argumento + fundamentação sobre «Er moeten meer fietspaden komen».", ["Ik vind dat er meer fietspaden moeten komen. Fietsen is namelijk gezond en goed voor het milieu. Uit onderzoek blijkt bovendien dat goede fietspaden het aantal ongelukken verminderen."], ["Tese com **ik vind dat**", "Argumento", "Fundamentação (**uit onderzoek blijkt…**)"], 30, "Argumento completo.", ["v-stelling","v-onderbouwen"]),
  ], diff=5, mins=8)

L(2, "Responder a objeções", "Je zou kunnen zeggen dat… maar… Dat is een goed punt, alleen…",
  ["Antecipar e responder a contra-argumentos"],
  vocab=[V("v-tegenargument","tegenargument","contra-argumento","noun","het"), V("v-weerleggen","weerleggen","refutar","verb"),
         V("v-toegeven","toegeven","admitir|conceder","verb",note="Ik geef toe dat…"), V("v-alleen-conj","alleen","só que","conjunction",note="Dat klopt, alleen…")],
  ex=[("Een tegenargument is dat het duur is.","Um contra-argumento é que é caro."),("Ik geef toe dat het niet perfect is.","Admito que não é perfeito."),("Dat argument kun je makkelijk weerleggen.","Esse argumento refuta-se facilmente."),("Dat klopt, alleen is het niet het hele verhaal.","É verdade, só que não é a história toda.")],
  gram=[G("g-concessie","Conceder e contrariar","**Ik geef toe dat… maar…** / **Je zou kunnen zeggen dat…, maar…** / **Dat is waar, alleen…** Depois de **alleen** (= só que) segue-se inversão: *…, alleen **is het** te duur.*",
    [("Natuurlijk kost het geld, maar op lange termijn bespaar je.","Claro que custa dinheiro, mas a longo prazo poupa-se.")])],
  review=["v-dat-is-waar","v-een-punt","v-aan-de-ene-kant"],
  cefr=C, exs=[
    MA([("tegenargument","contra-argumento"),("weerleggen","refutar"),("toegeven","admitir"),("alleen","só que")], "Objeções.", ["v-tegenargument","v-weerleggen","v-toegeven","v-alleen-conj"]),
    WO("Admito que não é perfeito.", ["Ik","geef","toe","dat","het","niet","perfect","is"], "toegeven + dat.", ["v-toegeven"]),
    TR("pt-nl","Um contra-argumento é que é caro.", ["Een tegenargument is dat het duur is"], "het tegenargument.", ["v-tegenargument"]),
    TR("nl-pt","Dat klopt, alleen is het niet het hele verhaal.", ["É verdade, só que não é a história toda","Está certo, mas não é a história toda"], "alleen + inversão.", ["v-alleen-conj"]),
    AR("tegenargument","o contra-argumento","het", "Het argument.", ["v-tegenargument"]),
    FE(["Ik","toegeef","dat","je","gelijk","hebt."], 1, "geef … toe", "Separável: Ik geef toe dat…", ["v-toegeven"]),
    MC("Qual resposta reconhece o contra-argumento e responde?", ["*Natuurlijk kost het geld, maar op lange termijn bespaar je.","Dat is onzin.|Rejeita sem argumentar.","Ja, het is duur, dus je hebt gelijk.|Desiste do argumento."], "Conceder + contrariar.", ["v-toegeven"]),
    LI("Je zou kunnen zeggen dat het te laat is, maar dat ben ik niet met je eens.", ["Je zou kunnen zeggen dat het te laat is(,) maar dat ben ik niet met je eens"], "Podia dizer-se que é tarde demais, mas não concordo contigo.", "Antecipar.", ["v-tegenargument"]),
    FB("Dat argument is makkelijk te ___.", ["weerleggen"], "Refutar.", ["v-weerleggen"], choices=["weerleggen","toegeven","onderbouwen"], tr="Esse argumento é fácil de refutar."),
    SW("Responda ao contra-argumento «Thuiswerken is eenzaam» defendendo o teletrabalho.", ["Ik geef toe dat thuiswerken soms eenzaam kan zijn, maar je kunt dat oplossen door twee dagen per week naar kantoor te gaan. Bovendien bespaar je veel reistijd."], ["**Ik geef toe dat… maar…**", "Solução ou resposta concreta", "Argumento adicional"], 30, "Refutação.", ["v-toegeven","v-tegenargument"]),
  ], diff=5, mins=8)

L(3, "Tomar a palavra num debate", "Mag ik hier iets op zeggen? Ik wil graag reageren op…",
  ["Pedir a palavra, interromper e reagir com correção"],
  vocab=[V("v-reageren-op","reageren op","reagir a","expression"), V("v-het-woord","het woord geven/krijgen","dar/ter a palavra","expression"),
         V("v-aanvullen","aanvullen","complementar","verb"), V("v-terugkomen-op","terugkomen op","voltar a (um ponto)","expression")],
  ex=[("Mag ik hier iets op zeggen?","Posso dizer algo sobre isto?"),("Ik wil graag reageren op wat Mark zei.","Gostaria de reagir ao que o Mark disse."),("Mag ik even aanvullen?","Posso só acrescentar?"),("Ik wil nog even terugkomen op het eerste punt.","Queria voltar ao primeiro ponto.")],
  review=["v-onderbreken","v-laat-me-uitpraten","v-sorry"],
  cefr=C, exs=[
    MA([("reageren op","reagir a"),("het woord krijgen","ter a palavra"),("aanvullen","complementar"),("terugkomen op","voltar a")], "Debate.", ["v-reageren-op","v-het-woord","v-aanvullen","v-terugkomen-op"]),
    TR("pt-nl","Posso dizer algo sobre isto?", ["Mag ik hier iets op zeggen","Mag ik daar iets op zeggen"], "hier … op.", ["v-reageren-op"]),
    TR("pt-nl","Gostaria de reagir ao que o Mark disse.", ["Ik wil graag reageren op wat Mark zei","Ik zou graag willen reageren op wat Mark zei","Ik wil graag reageren op wat Mark heeft gezegd"], "reageren op.", ["v-reageren-op"]),
    TR("nl-pt","Ik wil nog even terugkomen op het eerste punt.", ["Queria voltar ao primeiro ponto","Gostaria de voltar ao primeiro ponto"], "terugkomen op.", ["v-terugkomen-op"]),
    FE(["Ik","wil","graag","reageren","aan","wat","je","zei."], 4, "op", "reageren op.", ["v-reageren-op"]),
    MC("O moderador diz «U heeft het woord». Significa…", ["*Pode falar.","Tem uma palavra nova.|Literal.","Tem de se calar.|Ao contrário."], "het woord hebben.", ["v-het-woord"]),
    DL([("Moderator","Dank u, mevrouw Bos. Nog reacties?","Obrigado, Sra. Bos. Mais reações?"),("Pedro","")], ["*Ja, mag ik daar iets aan aanvullen?","Stil!|Inadequado.","Ik heb het woord.|Presunçoso."], "Pedir a palavra.", ["v-aanvullen"]),
    LI("Sorry dat ik u onderbreek, maar dat klopt niet helemaal.", ["Sorry dat ik u onderbreek(,) maar dat klopt niet helemaal"], "Desculpe interromper, mas isso não está totalmente certo.", "Interromper com educação.", ["v-onderbreken"]),
    WO("Posso só acrescentar?", ["Mag","ik","even","aanvullen?"], "aanvullen.", ["v-aanvullen"]),
    FB("Ik kom straks nog even ___ dat punt terug.", ["op"], "terugkomen op.", ["v-terugkomen-op"], choices=["op","aan","naar"], tr="Mais tarde volto a esse ponto."),
  ], diff=5, mins=7)

L(4, "Falácias e argumentos fracos", "Dat is een drogreden! Iedereen doet het, dus…",
  ["Reconhecer argumentos fracos e responder-lhes"],
  vocab=[V("v-drogreden","drogreden","falácia","noun","de"), V("v-generalisatie","generalisatie","generalização","noun","de"),
         V("v-op-de-persoon","op de persoon spelen","atacar a pessoa (e não o argumento)","expression"), V("v-bewijs","bewijs","prova","noun","het")],
  ex=[("Dat is een drogreden.","Isso é uma falácia."),("«Iedereen doet het» is geen bewijs.","«Toda a gente faz» não é prova."),("Je speelt op de persoon.","Estás a atacar a pessoa."),("Heb je daar bewijs voor?","Tens prova disso?")],
  review=["v-generaliseren","v-argument","v-onderbouwen"],
  cefr=C, exs=[
    MA([("drogreden","falácia"),("generalisatie","generalização"),("op de persoon spelen","atacar a pessoa"),("bewijs","prova")], "Argumentos fracos.", ["v-drogreden","v-generalisatie","v-op-de-persoon","v-bewijs"]),
    MC("«Jij hebt geen kinderen, dus jouw mening over scholen telt niet.» É…", ["*op de persoon spelen","een goed argument|Ataca a pessoa.","een bewijs|Não."], "Ad hominem.", ["v-op-de-persoon"]),
    MC("«Alle jongeren zitten de hele dag op hun telefoon.» É…", ["*een generalisatie","een feit|Não para todos.","een bewijs|Não."], "Generalização.", ["v-generalisatie"]),
    MC("«Iedereen koopt deze telefoon, dus hij is de beste.» É…", ["*een drogreden (populariteit ≠ kwaliteit)","een sterk argument|Não.","een compromis|Não."], "Falácia de popularidade.", ["v-drogreden"]),
    TR("pt-nl","Tens prova disso?", ["Heb je daar bewijs voor","Heb jij daar bewijs voor","Heb je daar bewijzen voor"], "bewijs voor.", ["v-bewijs"]),
    TR("nl-pt","Je speelt op de persoon.", ["Estás a atacar a pessoa","Estás a atacar-me pessoalmente"], "Expressão.", ["v-op-de-persoon"]),
    AR("bewijs","a prova","het", "Het bewijs.", ["v-bewijs"]),
    FE(["Dat","is","geen","bewijs","van","je","stelling."], 4, "voor", "bewijs voor.", ["v-bewijs"]),
    LI("Dat is een generalisatie, niet iedereen is zo.", ["Dat is een generalisatie(,) niet iedereen is zo"], "Isso é uma generalização, nem todos são assim.", "generalisatie.", ["v-generalisatie"]),
    SW("Responda com calma à falácia: «Je bent buitenlander, dus je begrijpt de Nederlandse politiek niet.»", ["Je speelt nu op de persoon. Waar ik vandaan kom, zegt niets over mijn argumenten. Laten we het over de inhoud hebben."], ["Identificou a falácia", "Resposta calma", "Volta ao conteúdo"], 20, "Responder a falácias.", ["v-op-de-persoon","v-drogreden"]),
  ], diff=5, mins=7)

L(5, "Debate completo", "Een debat over de vierdaagse werkweek.",
  ["Seguir e participar num debate estruturado"],
  vocab=[V("v-vierdaagse-werkweek","vierdaagse werkweek","semana de quatro dias","noun","de"), V("v-productiviteit","productiviteit","produtividade","noun","de"),
         V("v-voorstander","voorstander","defensor","noun","de"), V("v-tegenstander","tegenstander","opositor","noun","de")],
  ex=[("Ik ben voorstander van een vierdaagse werkweek.","Sou defensor da semana de quatro dias."),("Tegenstanders zeggen dat het te duur is.","Os opositores dizem que é caro demais."),("De productiviteit stijgt.","A produtividade aumenta."),("Wat zijn de gevolgen?","Quais são as consequências?")],
  review=["v-stelling","v-tegenargument","v-toegeven","v-kortom"],
  cefr=C, exs=[
    MA([("vierdaagse werkweek","semana de 4 dias"),("productiviteit","produtividade"),("voorstander","defensor"),("tegenstander","opositor")], "Debate.", ["v-vierdaagse-werkweek","v-productiviteit","v-voorstander","v-tegenstander"]),
    CO("dialogue","Debat: de vierdaagse werkweek", "Moderator: De stelling is: iedereen moet vier dagen per week werken. Sanne, u bent voorstander.\nSanne: Ja. Uit proeven in IJsland en Engeland blijkt dat de productiviteit gelijk blijft of zelfs stijgt. Mensen zijn minder gestrest.\nRob: Ik geef toe dat dat voor kantoorbanen kan werken. Maar in de zorg of in een supermarkt heb je gewoon meer mensen nodig. En die zijn er niet.\nSanne: Dat is een goed punt, alleen hoeft het niet overal tegelijk. Je kunt beginnen waar het kan.\nRob: Dan is het dus geen regel voor iedereen. Daar ben ik het mee eens.",
       [("Que argumento usa a Sanne?", ["*Testes mostram que a produtividade se mantém ou sobe","É mais barato","Toda a gente quer"]),("Qual é a objeção do Rob?", ["*Na saúde e nos supermercados falta pessoal","Os trabalhadores ficam preguiçosos","É ilegal"]),("Onde acabam por concordar?", ["*Começar onde for possível, sem regra para todos","Que é má ideia","Que deve ser obrigatório já"])],
       "proef = teste/experiência; tegelijk = ao mesmo tempo.", ["v-voorstander","v-productiviteit","v-toegeven"]),
    TR("pt-nl","Sou defensor da semana de quatro dias.", ["Ik ben voorstander van een vierdaagse werkweek","Ik ben een voorstander van de vierdaagse werkweek","Ik ben voorstander van de vierdaagse werkweek"], "voorstander van.", ["v-voorstander"]),
    TR("nl-pt","Tegenstanders zeggen dat het te duur is.", ["Os opositores dizem que é caro demais","Os opositores dizem que é demasiado caro"], "tegenstander.", ["v-tegenstander"]),
    FE(["Ik","ben","voorstander","voor","dit","plan."], 3, "van", "voorstander van.", ["v-voorstander"]),
    AR("productiviteit","a produtividade","de", "-iteit → de.", ["v-productiviteit"]),
    MC("No debate, «Dat is een goed punt, alleen…» serve para…", ["*conceder e depois contrariar","concordar totalmente|Há um «alleen».","mudar de tema|Não."], "Concessão.", ["v-alleen-conj"]),
    LI("De productiviteit blijft gelijk of stijgt zelfs.", ["De productiviteit blijft gelijk of stijgt zelfs"], "A produtividade mantém-se igual ou até sobe.", "productiviteit.", ["v-productiviteit"]),
    WO("Quais são as consequências?", ["Wat","zijn","de","gevolgen?"], "gevolgen.", []),
    SW("Escreva a sua intervenção (5 frases) num debate sobre a semana de 4 dias: posição, argumento com fundamentação, concessão e conclusão.", ["Ik ben voorstander van een vierdaagse werkweek. Mensen zijn dan minder gestrest en uit onderzoek blijkt dat de productiviteit niet daalt. Ik geef toe dat het in de zorg moeilijk is. Daar zou je kunnen beginnen met kleinere stappen. Kortom: waar het kan, moeten we het proberen."], ["Posição", "Argumento + fundamentação", "**Ik geef toe dat…**", "Conclusão"], 50, "Intervenção em debate.", ["v-voorstander","v-toegeven"]),
  ], diff=5, mins=9)

W()
