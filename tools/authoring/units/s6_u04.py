import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u04")
C = "B1-B2"

L(1, "Abrir e conduzir uma reunião", "Welkom allemaal. Op de agenda staat… Laten we beginnen.",
  ["Usar as fórmulas para abrir e conduzir uma reunião"],
  vocab=[V("v-notulen","notulen","ata","noun","de"),
         V("v-rondvraag","rondvraag","ponto «outros assuntos»","noun","de"), V("v-actiepunt","actiepunt","tarefa a cumprir (ação)","noun","het")],
  ex=[("Welkom allemaal, laten we beginnen.","Bem-vindos todos, vamos começar."),("Wie maakt de notulen?","Quem faz a ata?"),("Zijn er nog punten voor de rondvraag?","Há mais algum ponto para «outros assuntos»?"),("Dit is een actiepunt voor Lisa.","Esta é uma tarefa para a Lisa.")],
  gram=[G("g-vergadering-verloop","Estrutura típica","**Opening** → **notulen vorige keer** (aprovação da ata) → **agendapunten** → **rondvraag** (cada um pode dizer algo) → **sluiting**. Fórmulas: *Op de agenda staat…*, *Het volgende punt is…*, *Dan sluit ik de vergadering.*",
    [("Dan gaan we naar punt drie.","Então passamos ao ponto três.")])],
  review=["v-voorzitter","v-vergadering","v-agenda-punt","v-agenda"],
  cefr=C, exs=[
    MA([("voorzitter","presidente da reunião"),("notulen","ata"),("rondvraag","outros assuntos"),("actiepunt","tarefa")], "Reuniões.", ["v-voorzitter","v-notulen","v-rondvraag","v-actiepunt"]),
    TR("pt-nl","Quem faz a ata?", ["Wie maakt de notulen","Wie notuleert"], "notulen maken.", ["v-notulen"]),
    TR("pt-nl","Então passamos ao ponto três.", ["Dan gaan we naar punt drie","Dan gaan we door naar punt drie"], "naar punt.", []),
    TR("nl-pt","Zijn er nog punten voor de rondvraag?", ["Há mais algum ponto para «outros assuntos»","Há mais alguma questão para os outros assuntos"], "rondvraag.", ["v-rondvraag"]),
    MC("Ordem habitual:", ["*opening → notulen → agendapunten → rondvraag → sluiting","rondvraag → opening → sluiting|Trocado.","sluiting → agendapunten|Trocado."], "Estrutura.", ["v-rondvraag"]),
    AR("actiepunt","a tarefa","het", "Het punt.", ["v-actiepunt"]),
    FE(["Wie","maakt","vandaag","de","notuul?"], 4, "notulen", "A palavra é sempre plural: de notulen.", ["v-notulen"]),
    LI("Dan sluit ik nu de vergadering. Bedankt allemaal!", ["Dan sluit ik nu de vergadering(.) Bedankt allemaal"], "Então dou por encerrada a reunião. Obrigado a todos!", "sluiten.", ["v-voorzitter"]),
    WO("Bem-vindos todos, vamos começar.", ["Welkom","allemaal,","laten","we","beginnen"], "laten we.", ["v-voorzitter"]),
    FB("De ___ opent de vergadering om negen uur.", ["voorzitter"], "Quem preside.", ["v-voorzitter"], choices=["voorzitter","notulen","rondvraag"], tr="O presidente abre a reunião às nove."),
  ], diff=5, mins=7)

L(2, "Participar ativamente", "Ik wil graag iets toevoegen. Mag ik een voorstel doen?",
  ["Contribuir numa reunião: acrescentar, propor e pedir clarificação"],
  vocab=[V("v-toevoegen","toevoegen","acrescentar","verb"), V("v-een-voorstel-doen","een voorstel doen","fazer uma proposta","expression"),
         V("v-verduidelijken","verduidelijken","clarificar","verb"), V("v-samenvattend","samenvattend","resumindo","adverb")],
  ex=[("Ik wil graag iets toevoegen.","Gostaria de acrescentar algo."),("Mag ik een voorstel doen?","Posso fazer uma proposta?"),("Kun je dat verduidelijken?","Podes clarificar isso?"),("Samenvattend: we beginnen in maart.","Resumindo: começamos em março.")],
  review=["v-aanvullen","v-reageren-op","v-voorstellen-idee"],
  cefr=C, exs=[
    MA([("toevoegen","acrescentar"),("een voorstel doen","fazer uma proposta"),("verduidelijken","clarificar"),("samenvattend","resumindo")], "Participar.", ["v-toevoegen","v-een-voorstel-doen","v-verduidelijken","v-samenvattend"]),
    TR("pt-nl","Gostaria de acrescentar algo.", ["Ik wil graag iets toevoegen","Ik zou graag iets willen toevoegen"], "toevoegen.", ["v-toevoegen"]),
    TR("pt-nl","Posso fazer uma proposta?", ["Mag ik een voorstel doen"], "een voorstel doen.", ["v-een-voorstel-doen"]),
    TR("nl-pt","Kun je dat verduidelijken?", ["Podes clarificar isso","Podes esclarecer isso","Consegues explicar melhor"], "verduidelijken.", ["v-verduidelijken"]),
    FE(["Mag","ik","een","voorstel","maken?"], 4, "doen", "Colocação: een voorstel doen.", ["v-een-voorstel-doen"]),
    CJ("toevoegen","ik","Ik heb nog een punt ___.", ["toegevoegd"], "Separável: toe-ge-voegd.", ["v-toevoegen"], tense="passado-perfeito"),
    DL([("Voorzitter","Zijn er nog opmerkingen over het budget?","Mais observações sobre o orçamento?"),("Inês","")], ["*Ja, ik wil graag iets toevoegen: we zijn de reiskosten vergeten.","Nee, ja.|Confuso.","Ik ben het budget.|Sem sentido."], "Acrescentar.", ["v-toevoegen"]),
    LI("Samenvattend kunnen we zeggen dat het project op schema ligt.", ["Samenvattend kunnen we zeggen dat het project op schema ligt"], "Resumindo, podemos dizer que o projeto está dentro do prazo.", "op schema liggen.", ["v-samenvattend"]),
    MC("«Het project ligt op schema» significa…", ["*O projeto está dentro do prazo","O projeto está atrasado|Isso é «achter op schema».","O projeto acabou|Não."], "Expressão.", []),
    FB("Mag ik daar nog iets aan ___?", ["toevoegen"], "Acrescentar.", ["v-toevoegen"], choices=["toevoegen","verduidelijken","samenvatten"], tr="Posso acrescentar ainda algo a isso?"),
  ], diff=5, mins=7)

L(3, "Preparar uma apresentação", "Ik ga het hebben over… Eerst… dan… tot slot…",
  ["Estruturar o início de uma apresentação"],
  vocab=[V("v-presentatie","presentatie","apresentação","noun","de"), V("v-dia","dia","diapositivo","noun","de",note="plural: dia's"),
         V("v-onderwerp-presentatie","ik ga het hebben over","vou falar sobre","expression"), V("v-indeling","indeling","estrutura|organização","noun","de")],
  ex=[("Vandaag ga ik het hebben over ons nieuwe product.","Hoje vou falar sobre o nosso novo produto."),("Mijn presentatie bestaat uit drie delen.","A minha apresentação tem três partes."),("Op deze dia ziet u de cijfers.","Neste diapositivo vê os números."),("Eerst vertel ik iets over de achtergrond.","Primeiro conto algo sobre o contexto.")],
  review=["v-ten-eerste","v-tot-slot","v-achtergrond"],
  cefr=C, exs=[
    MA([("presentatie","apresentação"),("dia","diapositivo"),("ik ga het hebben over","vou falar sobre"),("indeling","estrutura")], "Apresentação.", ["v-presentatie","v-dia","v-onderwerp-presentatie","v-indeling"]),
    TR("pt-nl","Hoje vou falar sobre o nosso novo produto.", ["Vandaag ga ik het hebben over ons nieuwe product"], "het hebben over.", ["v-onderwerp-presentatie"]),
    TR("pt-nl","A minha apresentação tem três partes.", ["Mijn presentatie bestaat uit drie delen","Mijn presentatie heeft drie delen"], "bestaan uit.", ["v-presentatie"]),
    TR("nl-pt","Op deze dia ziet u de cijfers.", ["Neste diapositivo vê os números","Neste slide pode ver os números"], "dia.", ["v-dia"]),
    WO("Primeiro conto algo sobre o contexto.", ["Eerst","vertel","ik","iets","over","de","achtergrond"], "Inversão.", ["v-achtergrond"]),
    FE(["Mijn","presentatie","bestaat","van","drie","delen."], 3, "uit", "bestaan uit.", ["v-presentatie"]),
    AR("indeling","a estrutura","de", "-ing → de.", ["v-indeling"]),
    MC("Boa frase de abertura:", ["*Goedemorgen. Vandaag ga ik het hebben over onze resultaten van dit jaar.","Eh… nou… ja.|Pouco preparado.","Kortom, bedankt.|É fecho."], "Abertura clara.", ["v-onderwerp-presentatie"]),
    LI("Mijn presentatie duurt ongeveer tien minuten.", ["Mijn presentatie duurt ongeveer tien minuten"], "A minha apresentação dura cerca de dez minutos.", "duren.", ["v-presentatie"]),
    SW("Escreva a abertura de uma apresentação (3 frases): saudação, tema e estrutura.", ["Goedemiddag allemaal. Vandaag ga ik het hebben over de verhuizing van ons kantoor. Eerst vertel ik waarom we verhuizen, daarna laat ik de nieuwe locatie zien en tot slot is er tijd voor vragen."], ["Saudação", "**Ik ga het hebben over**", "Estrutura com **eerst/daarna/tot slot**"], 30, "Abertura.", ["v-onderwerp-presentatie","v-indeling"]),
  ], diff=5, mins=7)

L(4, "Apresentar resultados", "Zoals u ziet… De grafiek laat zien dat… Dit betekent dat…",
  ["Descrever gráficos e explicar resultados"],
  vocab=[V("v-grafiek","grafiek","gráfico","noun","de"), V("v-opvallend","opvallend","notável|que salta à vista","adjective"), V("v-resultaat","resultaat","resultado","noun","het")],
  ex=[("Zoals u ziet, zijn de cijfers gestegen.","Como vê, os números subiram."),("De grafiek laat zien dat de verkoop daalt.","O gráfico mostra que as vendas estão a descer."),("Opvallend is dat jongeren meer kopen.","É notável que os jovens comprem mais."),("Dit betekent dat we moeten investeren.","Isto significa que temos de investir.")],
  review=["v-laten-zien","v-stijgen","v-dalen","v-toename","v-afname","v-procent"],
  cefr=C, exs=[
    MA([("grafiek","gráfico"),("laten zien","mostrar"),("opvallend","notável"),("resultaat","resultado")], "Resultados.", ["v-grafiek","v-laten-zien","v-opvallend","v-resultaat"]),
    TR("pt-nl","Como vê, os números subiram.", ["Zoals u ziet(,) zijn de cijfers gestegen","Zoals jullie zien(,) zijn de cijfers gestegen"], "zoals u ziet + inversão.", ["v-laten-zien"]),
    TR("pt-nl","O gráfico mostra que as vendas estão a descer.", ["De grafiek laat zien dat de verkoop daalt","De grafiek toont dat de verkoop daalt"], "laten zien dat.", ["v-grafiek"]),
    TR("nl-pt","Opvallend is dat jongeren meer kopen.", ["É notável que os jovens comprem mais","O que salta à vista é que os jovens compram mais"], "opvallend.", ["v-opvallend"]),
    MC("Qual é a ordem correta?", ["*De grafiek laat zien dat de verkoop flink is gedaald.","De grafiek laat zien dat de verkoop is gedaald flink.|Subordinada: dat de verkoop flink gedaald is."], "Subordinada: dat de verkoop flink gedaald is.", ["v-grafiek"]),
    AR("resultaat","o resultado","het", "Het resultaat.", ["v-resultaat"]),
    MC("Uma linha que sobe no gráfico indica…", ["*een stijging / toename","een daling|Ao contrário.","geen verandering|Não."], "Descrever tendências.", ["v-grafiek"]),
    LI("In het derde kwartaal zien we een sterke daling.", ["In het derde kwartaal zien we een sterke daling"], "No terceiro trimestre vemos uma forte descida.", "daling.", ["v-dalen"]),
    FB("Zoals u ziet, zijn de ___ dit jaar beter dan vorig jaar.", ["resultaten"], "Plural.", ["v-resultaat"], choices=["resultaten","resultaat","grafiek"], tr="Como vê, os resultados este ano são melhores do que no ano passado."),
    SW("Descreva um gráfico imaginário sobre o número de ciclistas na sua cidade (2010–2024) em 3 frases.", ["De grafiek laat zien dat het aantal fietsers tussen 2010 en 2024 sterk is gestegen. Opvallend is de daling in 2020, tijdens corona. Dit betekent dat de stad meer fietspaden nodig heeft."], ["**De grafiek laat zien dat…**", "Uma tendência e um ponto notável", "Conclusão (**dit betekent dat**)"], 30, "Descrever dados.", ["v-grafiek","v-opvallend"]),
  ], diff=5, mins=8)

L(5, "Concluir e responder a perguntas", "Dan rond ik af. Zijn er nog vragen? Goede vraag!",
  ["Fechar uma apresentação e lidar com perguntas"],
  vocab=[V("v-afronden","afronden","concluir|terminar","verb"), V("v-goede-vraag","goede vraag","boa pergunta","expression"),
         V("v-uitzoeken","uitzoeken","averiguar|descobrir","verb")],
  ex=[("Dan rond ik af.","Então vou concluir."),("Zijn er nog vragen?","Há perguntas?"),("Goede vraag! Dat weet ik niet precies.","Boa pergunta! Não sei exatamente."),("Ik zoek het voor u uit.","Vou averiguar isso para si.")],
  review=["v-daar-kom-ik-op-terug","v-kortom","v-samenvattend","v-presentatie"],
  cefr=C, exs=[
    MA([("afronden","concluir"),("goede vraag","boa pergunta"),("daar kom ik later op terug","volto a isso depois"),("uitzoeken","averiguar")], "Concluir.", ["v-afronden","v-goede-vraag","v-daar-kom-ik-op-terug","v-uitzoeken"]),
    TR("pt-nl","Então vou concluir.", ["Dan rond ik af","Dan ga ik afronden"], "afronden.", ["v-afronden"]),
    TR("pt-nl","Vou averiguar isso para si.", ["Ik zoek het voor u uit","Ik ga het voor u uitzoeken"], "uitzoeken.", ["v-uitzoeken"]),
    TR("nl-pt","Daar kom ik later op terug.", ["Volto a isso mais tarde","Mais tarde volto a esse ponto"], "terugkomen op.", ["v-daar-kom-ik-op-terug"]),
    MC("Fazem-lhe uma pergunta e não sabe a resposta. Diz…", ["*Goede vraag. Dat weet ik niet precies, maar ik zoek het voor u uit.","Dat is een domme vraag.|Rude.","Geen idee, volgende!|Pouco profissional."], "Honestidade + seguimento.", ["v-uitzoeken"]),
    FE(["Ik","uitzoek","het","voor","u."], 1, "zoek … uit", "Separável: Ik zoek het voor u uit.", ["v-uitzoeken"]),
    DL([("Publiek","Hoeveel kost het nieuwe systeem precies?","Quanto custa exatamente o novo sistema?"),("Presentator","")], ["*Goede vraag. De precieze kosten heb ik niet bij me, maar ik mail ze u morgen.","Dat zeg ik niet.|Pouco profissional.","Veel.|Vago."], "Responder bem.", ["v-goede-vraag"]),
    LI("Dank u wel voor uw aandacht. Zijn er nog vragen?", ["Dank u wel voor uw aandacht(.) Zijn er nog vragen","Dank u voor uw aandacht(.) Zijn er nog vragen"], "Muito obrigado pela vossa atenção. Há perguntas?", "Fecho.", ["v-afronden"]),
    WO("Há perguntas?", ["Zijn","er","nog","vragen?"], "Fórmula.", []),
    SW("Escreva o fecho de uma apresentação (3 frases): resumo, agradecimento e convite a perguntas.", ["Dan rond ik af. Kortom: het nieuwe systeem bespaart tijd en geld. Dank u wel voor uw aandacht, zijn er nog vragen?"], ["**Dan rond ik af**", "Resumo com **kortom**", "Agradecimento + perguntas"], 25, "Fecho.", ["v-afronden"]),
  ], diff=5, mins=7)

W()
