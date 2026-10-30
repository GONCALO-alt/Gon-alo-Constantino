import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u05")
C = "B2"

L(1, "Avaliar a fiabilidade de uma fonte", "Wie heeft het geschreven? Met welk doel? Wanneer?",
  ["Fazer perguntas críticas sobre a origem de um texto"],
  vocab=[V("v-afzender","afzender","remetente|emissor","noun","de"), V("v-belang","belang","interesse (próprio)","noun","het",note="Welk belang heeft de schrijver?"),
         V("v-verouderd","verouderd","desatualizado","adjective"), V("v-controleerbaar","controleerbaar","verificável","adjective")],
  ex=[("Wie is de afzender van dit bericht?","Quem é o emissor desta mensagem?"),("Welk belang heeft dit bedrijf bij het onderzoek?","Que interesse tem esta empresa no estudo?"),("Deze informatie is verouderd.","Esta informação está desatualizada."),("Zijn de cijfers controleerbaar?","Os números são verificáveis?")],
  gram=[G("g-bronkritiek","Crítica das fontes","Pergunte sempre: **Wie** escreveu (afzender)? **Waarom** (doel, belang)? **Wanneer** (actueel of verouderd)? **Waarop** se baseia (bronnen, cijfers controleerbaar)? **Wat ontbreekt** (outros pontos de vista)?",
    [("Het onderzoek werd betaald door de suikerindustrie.","O estudo foi pago pela indústria do açúcar. (conflito de interesses)")])],
  review=["v-bron","v-betrouwbaar-bron","v-eenzijdig","v-nepnieuws"],
  cefr=C, exs=[
    MA([("afzender","emissor"),("belang","interesse"),("verouderd","desatualizado"),("controleerbaar","verificável")], "Crítica das fontes.", ["v-afzender","v-belang","v-verouderd","v-controleerbaar"]),
    MC("«Suiker is gezond, zegt nieuw onderzoek (betaald door een frisdrankfabrikant).» O problema principal é…", ["*het belang van de afzender","de datum|Não é o principal.","de taal|Não."], "Conflito de interesses.", ["v-belang"]),
    MC("Uma notícia de 2009 sobre preços de casas é…", ["*verouderd","controleerbaar|Pode ser, mas o problema é a data.","eenzijdig|Não necessariamente."], "Atualidade.", ["v-verouderd"]),
    TR("pt-nl","Quem é o emissor desta mensagem?", ["Wie is de afzender van dit bericht"], "afzender.", ["v-afzender"]),
    TR("nl-pt","Zijn de cijfers controleerbaar?", ["Os números são verificáveis","Os dados são verificáveis"], "controleerbaar.", ["v-controleerbaar"]),
    AR("belang","o interesse","het", "Het belang.", ["v-belang"]),
    FE(["Deze","informatie","is","verouderde."], 3, "verouderd", "Predicativo sem -e.", ["v-verouderd"]),
    LI("Welk belang heeft de schrijver bij dit verhaal?", ["Welk belang heeft de schrijver bij dit verhaal"], "Que interesse tem o autor nesta história?", "belang bij.", ["v-belang"]),
    MC("Qual é a fonte mais verificável?", ["*Een rapport met een duidelijke bronvermelding en cijfers","Een anoniem bericht op sociale media|Não verificável.","Een gerucht van een buurman|Não."], "Verificabilidade.", ["v-controleerbaar"]),
    SW("Avalie esta fonte em 2–3 frases: «Een blog van een makelaar zegt dat het nu hét moment is om een huis te kopen.»", ["De afzender is een makelaar, dus hij heeft er belang bij dat mensen huizen kopen. Bovendien noemt de blog geen controleerbare cijfers. Ik zou dus ook andere, onafhankelijke bronnen lezen."], ["Identifica o emissor e o interesse", "Verificabilidade", "Conclusão"], 35, "Crítica de fonte.", ["v-afzender","v-belang"]),
  ], diff=5, mins=8)

L(2, "Analisar a argumentação", "Is het argument sterk? Klopt de redenering?",
  ["Avaliar a solidez dos argumentos num texto"],
  vocab=[V("v-overtuigend","overtuigend","convincente","adjective"), V("v-zwak-argument","zwak argument","argumento fraco","expression"),
         V("v-onderbouwd","onderbouwd","fundamentado","adjective"), V("v-conclusie-trekken","een conclusie trekken","tirar uma conclusão","expression")],
  ex=[("Het betoog is niet erg overtuigend.","O texto argumentativo não é muito convincente."),("Dat is een zwak argument.","Isso é um argumento fraco."),("Zijn mening is goed onderbouwd.","A opinião dele está bem fundamentada."),("Je kunt daaruit geen conclusie trekken.","Não se pode tirar uma conclusão disso.")],
  review=["v-argument","v-drogreden","v-generalisatie","v-bewijs"],
  cefr=C, exs=[
    MA([("overtuigend","convincente"),("zwak argument","argumento fraco"),("onderbouwd","fundamentado"),("een conclusie trekken","tirar uma conclusão")], "Avaliar.", ["v-overtuigend","v-zwak-argument","v-onderbouwd","v-conclusie-trekken"]),
    CO("text","Opiniestuk: Verbied vuurwerk", "Vuurwerk moet volledig verboden worden. Elk jaar raken honderden mensen gewond en moeten hulpverleners overuren maken. Bovendien vinden dieren het vreselijk. Iedereen die ik ken is voor een verbod, dus de meeste Nederlanders willen het ook. Tot slot: in andere landen werkt een verbod prima.",
       [("Qual é o argumento mais fraco?", ["*«Toda a gente que conheço é a favor, logo a maioria dos neerlandeses também»","Os feridos","Os animais"]),("Que falta ao último argumento?", ["*Exemplos concretos de países e dados","Nada","Uma piada"]),("O argumento dos feridos seria mais forte com…", ["*números exatos e uma fonte","mais pontos de exclamação","uma opinião pessoal"])],
       "Generalização a partir da experiência pessoal = argumento fraco.", ["v-zwak-argument","v-onderbouwd"]),
    TR("pt-nl","Isso é um argumento fraco.", ["Dat is een zwak argument"], "het argument → zwak.", ["v-zwak-argument"]),
    TR("nl-pt","Zijn mening is goed onderbouwd.", ["A opinião dele está bem fundamentada"], "onderbouwd.", ["v-onderbouwd"]),
    TR("pt-nl","Não se pode tirar uma conclusão disso.", ["Je kunt daaruit geen conclusie trekken","Daaruit kun je geen conclusie trekken"], "conclusie trekken.", ["v-conclusie-trekken"]),
    FE(["Hij","maakte","de","conclusie","dat","het","werkt."], 1, "trok", "een conclusie trekken (trok).", ["v-conclusie-trekken"]),
    FE(["Dat","is","een","zwakke","argument."], 3, "zwak", "het argument → een zwak argument.", ["v-zwak-argument"]),
    LI("Het betoog is overtuigend, want alle argumenten zijn goed onderbouwd.", ["Het betoog is overtuigend(,) want alle argumenten zijn goed onderbouwd"], "O texto é convincente, porque todos os argumentos estão bem fundamentados.", "overtuigend.", ["v-overtuigend"]),
    MC("Qual torna um argumento mais forte?", ["*Controleerbare cijfers uit een onafhankelijke bron","Een uitroepteken|Não.","Herhaling|Não."], "Fundamentação.", ["v-onderbouwd"]),
    SW("Avalie o opiniestuk sobre o fogo de artifício (3 frases): um ponto forte, um ponto fraco e uma sugestão.", ["Een sterk punt is dat de schrijver het aantal gewonden noemt. Het argument dat iedereen die hij kent voor een verbod is, is echter zwak, want dat is een generalisatie. Hij zou zijn betoog overtuigender maken met cijfers uit andere landen."], ["Ponto forte", "Ponto fraco com termo técnico", "Sugestão"], 45, "Análise crítica.", ["v-zwak-argument","v-overtuigend"]),
  ], diff=5, mins=8)

L(3, "Técnicas de persuasão", "framing, emotie, autoriteit, herhaling",
  ["Reconhecer técnicas de persuasão em textos e publicidade"],
  vocab=[V("v-framing","framing","enquadramento (framing)","noun","de"), V("v-inspelen-op","inspelen op","jogar com|aproveitar-se de","expression"), V("v-autoriteit","autoriteit","autoridade","noun","de")],
  ex=[("De advertentie speelt in op angst.","O anúncio joga com o medo."),("Media beïnvloeden onze mening.","Os media influenciam a nossa opinião."),("«Belastingverlichting» is een vorm van framing.","«Alívio fiscal» é uma forma de framing."),("Ze gebruiken een arts als autoriteit.","Usam um médico como figura de autoridade.")],
  review=["v-beinvloeden","v-overtuigen","v-toon","v-suggereren"],
  cefr=C, exs=[
    MA([("framing","enquadramento"),("beïnvloeden","influenciar"),("inspelen op","jogar com"),("autoriteit","autoridade")], "Persuasão.", ["v-framing","v-beinvloeden","v-inspelen-op","v-autoriteit"]),
    MC("«9 van de 10 tandartsen raden deze tandpasta aan.» Que técnica?", ["*Autoriteit","Humor|Não.","Angst|Não."], "Autoridade.", ["v-autoriteit"]),
    MC("«Bescherm uw gezin voordat het te laat is!» Que técnica?", ["*Inspelen op angst","Feiten|Não há factos.","Humor|Não."], "Emoção.", ["v-inspelen-op"]),
    MC("Chamar a um imposto «strafbelasting» (imposto-castigo) é…", ["*framing negativo","neutraal|Não.","een feit|É uma escolha de palavras."], "Framing.", ["v-framing"]),
    TR("pt-nl","Os media influenciam a nossa opinião.", ["Media beïnvloeden onze mening","De media beïnvloeden onze mening"], "beïnvloeden.", ["v-beinvloeden"]),
    TR("nl-pt","De advertentie speelt in op angst.", ["O anúncio joga com o medo","O anúncio aproveita-se do medo"], "inspelen op.", ["v-inspelen-op"]),
    FE(["De","reclame","speelt","in","aan","onze","emoties."], 4, "op", "inspelen op.", ["v-inspelen-op"]),
    LI("Laat je niet beïnvloeden door mooie woorden.", ["Laat je niet beïnvloeden door mooie woorden"], "Não te deixes influenciar por palavras bonitas.", "beïnvloeden.", ["v-beinvloeden"]),
    AR("autoriteit","a autoridade","de", "-iteit → de.", ["v-autoriteit"]),
    SW("Analise o slogan «Echte moeders kiezen voor BioBaby-luiers» (2 frases): que técnica usa e como o faz.", ["De reclame speelt in op het schuldgevoel van ouders: als je dit merk niet koopt, ben je geen 'echte' moeder. Dat is een vorm van emotionele framing."], ["Técnica identificada", "Explicação do mecanismo", "Vocabulário da lição"], 25, "Análise de publicidade.", ["v-framing","v-inspelen-op"]),
  ], diff=5, mins=8)

L(4, "Ler um artigo de opinião", "Columns en opiniestukken in de krant.",
  ["Distinguir tese, argumentos e tom num artigo de opinião"],
  vocab=[V("v-column","column","crónica|coluna de opinião","noun","de"), V("v-standpunt-auteur","de auteur vindt dat","o autor considera que","expression"), V("v-pleiten-voor","pleiten voor","defender|advogar","expression")],
  ex=[("Ze schrijft elke week een column.","Ela escreve uma crónica todas as semanas."),("In zijn opiniestuk pleit hij voor gratis openbaar vervoer.","No artigo de opinião ele defende transportes públicos gratuitos."),("De auteur vindt dat het onderwijs beter moet.","O autor considera que o ensino deve melhorar."),("Waar pleit de schrijver voor?","O que defende o autor?")],
  review=["v-opiniestuk","v-stelling","v-ironisch","v-kritisch","v-subjectief"],
  cefr=C, exs=[
    MA([("column","crónica"),("opiniestuk","artigo de opinião"),("de auteur vindt dat","o autor considera"),("pleiten voor","defender")], "Opinião.", ["v-column","v-opiniestuk","v-standpunt-auteur","v-pleiten-voor"]),
    CO("text","Column: De zegen van de regen", "Iedereen klaagt over het Nederlandse weer. Ik niet. Want wat is er heerlijker dan een regenachtige zondag met een boek en een pot thee? De regen dwingt ons tot rust, iets wat we in deze drukke tijd hard nodig hebben. Natuurlijk, een fietstocht in een stortbui is geen pretje. Maar zonder regen geen groene weilanden, geen tulpen en geen gezellige cafés vol natte jassen. Ik pleit dus voor meer waardering voor ons grijze klimaat. Of, zoals mijn oma altijd zei: 'Wie niet tegen een beetje water kan, moet in de woestijn gaan wonen.'",
       [("Qual é a tese da crónica?", ["*Devíamos valorizar mais o clima chuvoso neerlandês","A chuva é perigosa","Devíamos mudar para o deserto"]),("Que concessão faz o autor?", ["*Pedalar debaixo de um aguaceiro não tem graça","A chuva é sempre boa","As túlipas não precisam de água"]),("Qual é o tom?", ["*Ligeiro e humorístico","Muito sério e científico","Zangado"])],
       "stortbui = aguaceiro; geen pretje = não tem graça.", ["v-column","v-pleiten-voor"]),
    TR("pt-nl","O que defende o autor?", ["Waar pleit de schrijver voor","Waar pleit de auteur voor"], "pleiten voor.", ["v-pleiten-voor"]),
    TR("nl-pt","Ze schrijft elke week een column.", ["Ela escreve uma crónica todas as semanas","Ela escreve uma coluna todas as semanas"], "column.", ["v-column"]),
    AR("opiniestuk","o artigo de opinião","het", "Het stuk.", ["v-opiniestuk"]),
    FE(["De","schrijver","pleit","van","meer","groen","in","de","stad."], 3, "voor", "pleiten voor.", ["v-pleiten-voor"]),
    MC("Uma column distingue-se de uma notícia porque…", ["*é pessoal e subjetiva","é sempre neutra|Não.","não tem autor|Tem."], "Género.", ["v-column"]),
    LI("In haar opiniestuk pleit ze voor een kortere werkweek.", ["In haar opiniestuk pleit ze voor een kortere werkweek"], "No seu artigo de opinião ela defende uma semana de trabalho mais curta.", "pleiten.", ["v-pleiten-voor"]),
    FB("De auteur ___ dat de regering te weinig doet.", ["vindt"], "Opinião do autor.", ["v-standpunt-auteur"], choices=["vindt","pleit","weet"], tr="O autor considera que o governo faz pouco."),
    SW("Resuma a crónica sobre a chuva em 2–3 frases: tese, um argumento e o tom.", ["De schrijver pleit voor meer waardering voor het Nederlandse regenweer. Volgens hem zorgt regen voor rust en voor een groen land. De toon is luchtig en humoristisch."], ["Tese com **pleiten voor**", "Um argumento", "Tom"], 35, "Resumo crítico.", ["v-pleiten-voor","v-column"]),
  ], diff=5, mins=8)

L(5, "Escrever uma reação crítica", "Een ingezonden brief of reactie op een artikel.",
  ["Responder por escrito a um artigo com argumentos próprios"],
  vocab=[V("v-ingezonden-brief","ingezonden brief","carta do leitor","noun","de"), V("v-reageren-artikel","naar aanleiding van uw artikel","a propósito do seu artigo","expression"),
         V("v-ten-onrechte","ten onrechte","injustamente|erradamente","adverb"), V("v-voorbijgaan-aan","voorbijgaan aan","ignorar|passar ao lado de","expression")],
  ex=[("Ik schrijf een ingezonden brief naar de krant.","Escrevo uma carta do leitor para o jornal."),("Naar aanleiding van uw artikel van 3 mei wil ik reageren.","A propósito do seu artigo de 3 de maio, quero reagir."),("De schrijver stelt ten onrechte dat…","O autor afirma erradamente que…"),("Het artikel gaat voorbij aan de gevolgen voor ouderen.","O artigo ignora as consequências para os idosos.")],
  review=["v-naar-aanleiding-van","v-tegenargument","v-onderbouwd"],
  cefr=C, exs=[
    MA([("ingezonden brief","carta do leitor"),("naar aanleiding van uw artikel","a propósito do seu artigo"),("ten onrechte","erradamente"),("voorbijgaan aan","ignorar")], "Reação.", ["v-ingezonden-brief","v-reageren-artikel","v-ten-onrechte","v-voorbijgaan-aan"]),
    TR("pt-nl","O autor afirma erradamente que tudo é caro.", ["De schrijver stelt ten onrechte dat alles duur is","De auteur stelt ten onrechte dat alles duur is"], "ten onrechte.", ["v-ten-onrechte"]),
    TR("nl-pt","Het artikel gaat voorbij aan de gevolgen voor ouderen.", ["O artigo ignora as consequências para os idosos","O artigo passa ao lado das consequências para os idosos"], "voorbijgaan aan.", ["v-voorbijgaan-aan"]),
    FE(["Het","artikel","gaat","voorbij","van","de","gevolgen."], 4, "aan", "voorbijgaan aan.", ["v-voorbijgaan-aan"]),
    AR("ingezonden brief","a carta do leitor","de", "De brief.", ["v-ingezonden-brief"]),
    MC("Uma boa carta do leitor…", ["*refere o artigo, apresenta o ponto de vista com argumentos e é curta","insulta o jornalista|Não é publicada.","não menciona o artigo|Fica sem contexto."], "Género.", ["v-ingezonden-brief"]),
    LI("Naar aanleiding van uw artikel wil ik graag het volgende opmerken.", ["Naar aanleiding van uw artikel wil ik graag het volgende opmerken"], "A propósito do seu artigo, gostaria de observar o seguinte.", "Abertura.", ["v-reageren-artikel"]),
    FB("De journalist stelt ___ dat fietsers altijd door rood rijden.", ["ten onrechte"], "Injustamente.", ["v-ten-onrechte"], choices=["ten onrechte","terecht","ongetwijfeld"], tr="O jornalista afirma injustamente que os ciclistas passam sempre no vermelho."),
    WO("Escrevo uma carta do leitor para o jornal.", ["Ik","schrijf","een","ingezonden","brief","naar","de","krant"], "naar de krant.", ["v-ingezonden-brief"]),
    SW("Escreva uma carta do leitor (5–6 frases) a reagir a um artigo que defende «Alle winkels moeten op zondag dicht».", ["Naar aanleiding van uw artikel van 12 maart wil ik graag reageren. De schrijver stelt ten onrechte dat niemand op zondag wil winkelen. Hij gaat voorbij aan mensen die doordeweeks lange dagen werken. Bovendien zijn veel studenten blij met een zondagsbaantje. Ik pleit daarom voor een vrije keuze per winkel.\nMet vriendelijke groet,\nA. Monteiro, Leiden"], ["Referência ao artigo", "**ten onrechte / voorbijgaan aan**", "Dois argumentos", "Posição final"], 70, "Carta do leitor.", ["v-ingezonden-brief","v-ten-onrechte"]),
  ], diff=5, mins=8)

W()
