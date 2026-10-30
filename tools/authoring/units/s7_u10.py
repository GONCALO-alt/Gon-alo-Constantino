import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u10")
C = "B2"

L(1, "Vocabulário de gestão", "doelstelling, planning, budget, evaluatie, stakeholder",
  ["Usar vocabulário de gestão de projetos"],
  vocab=[V("v-doelstelling","doelstelling","objetivo","noun","de"), V("v-evaluatie","evaluatie","avaliação","noun","de"), V("v-belanghebbende","belanghebbende","parte interessada","noun","de"),
         V("v-mijlpaal","mijlpaal","marco|etapa importante","noun","de")],
  ex=[("Wat is de doelstelling van het project?","Qual é o objetivo do projeto?"),("De begroting is overschreden.","O orçamento foi ultrapassado."),("Na afloop volgt een evaluatie.","No fim segue-se uma avaliação."),("We hebben een belangrijke mijlpaal bereikt.","Alcançámos um marco importante.")],
  review=["v-begroting","v-agenda","v-deadline-halen","v-resultaat"],
  cefr=C, exs=[
    MA([("doelstelling","objetivo"),("begroting","orçamento"),("evaluatie","avaliação"),("belanghebbende","parte interessada"),("mijlpaal","marco")], "Gestão.", ["v-doelstelling","v-begroting","v-evaluatie","v-belanghebbende","v-mijlpaal"]),
    TR("pt-nl","Qual é o objetivo do projeto?", ["Wat is de doelstelling van het project","Wat is het doel van het project"], "doelstelling.", ["v-doelstelling"]),
    TR("nl-pt","De begroting is overschreden.", ["O orçamento foi ultrapassado","O orçamento foi excedido"], "overschrijden.", ["v-begroting"]),
    TR("pt-nl","Alcançámos um marco importante.", ["We hebben een belangrijke mijlpaal bereikt","Wij hebben een belangrijke mijlpaal bereikt"], "mijlpaal bereiken.", ["v-mijlpaal"]),
    AR("begroting","o orçamento","de", "-ing → de.", ["v-begroting"]),
    FE(["We","hebben","de","mijlpaal","bereikd."], 4, "bereikt", "Particípio de bereiken: bereikt (k → -t).", ["v-mijlpaal"]),
    MC("Uma «belanghebbende» num projeto é…", ["*alguém afetado ou interessado no resultado","o orçamento|Não.","o prazo|Não."], "Stakeholder.", ["v-belanghebbende"]),
    LI("Na afloop van het project volgt een evaluatie met alle belanghebbenden.", ["Na afloop van het project volgt een evaluatie met alle belanghebbenden"], "No fim do projeto segue-se uma avaliação com todas as partes interessadas.", "evaluatie.", ["v-evaluatie"]),
    FB("De ___ voor volgend jaar is nog niet goedgekeurd.", ["begroting"], "Orçamento.", ["v-begroting"], choices=["begroting","mijlpaal","evaluatie"], tr="O orçamento para o próximo ano ainda não foi aprovado."),
    WO("No fim segue-se uma avaliação.", ["Na","afloop","volgt","een","evaluatie"], "Inversão.", ["v-evaluatie"]),
  ], diff=5, mins=7)

L(2, "Vocabulário académico", "scriptie, promotor, bronvermelding, plagiaat",
  ["Usar vocabulário do ensino superior"],
  vocab=[V("v-scriptie","scriptie","tese|dissertação","noun","de"), V("v-scriptiebegeleider","scriptiebegeleider","orientador","noun","de"),
         V("v-bronvermelding","bronvermelding","referência bibliográfica","noun","de"), V("v-plagiaat","plagiaat","plágio","noun","het"),
         V("v-tentamen","tentamen","exame (universidade)","noun","het")],
  ex=[("Ik schrijf mijn scriptie over migratie.","Estou a escrever a tese sobre migração."),("Mijn scriptiebegeleider geeft goede feedback.","O meu orientador dá bom feedback."),("Vergeet de bronvermelding niet.","Não te esqueças das referências."),("Plagiaat wordt streng bestraft.","O plágio é severamente punido.")],
  review=["v-universiteit","v-literatuur","v-onderzoek","v-hypothese"],
  cefr=C, exs=[
    MA([("scriptie","tese"),("scriptiebegeleider","orientador"),("bronvermelding","referências"),("plagiaat","plágio"),("tentamen","exame")], "Universidade.", ["v-scriptie","v-scriptiebegeleider","v-bronvermelding","v-plagiaat","v-tentamen"]),
    TR("pt-nl","Estou a escrever a tese sobre migração.", ["Ik schrijf mijn scriptie over migratie","Ik ben mijn scriptie over migratie aan het schrijven"], "scriptie.", ["v-scriptie"]),
    TR("nl-pt","Plagiaat wordt streng bestraft.", ["O plágio é severamente punido","O plágio é castigado com rigor"], "Passiva.", ["v-plagiaat"]),
    AR("plagiaat","o plágio","het", "Het plagiaat.", ["v-plagiaat"]),
    AR("tentamen","o exame","het", "Het tentamen.", ["v-tentamen"]),
    MC("Copiar um parágrafo sem bronvermelding é…", ["*plagiaat","een citaat|Só com referência.","een samenvatting|Não."], "Plágio.", ["v-plagiaat"]),
    FE(["Ik","heb","niet","genoeg","geleert","voor","het","tentamen."], 4, "geleerd", "Particípio de leren: geleerd (r → -d).", ["v-tentamen"]),
    LI("Mijn scriptiebegeleider wil volgende week het eerste hoofdstuk zien.", ["Mijn scriptiebegeleider wil volgende week het eerste hoofdstuk zien"], "O meu orientador quer ver o primeiro capítulo na próxima semana.", "hoofdstuk = capítulo.", ["v-scriptiebegeleider"]),
    FB("Zonder ___ is het citaat plagiaat.", ["bronvermelding"], "Referência.", ["v-bronvermelding"], choices=["bronvermelding","scriptie","tentamen"], tr="Sem referência, a citação é plágio."),
    WO("Não te esqueças das referências.", ["Vergeet","de","bronvermelding","niet"], "Imperativo.", ["v-bronvermelding"]),
  ], diff=5, mins=7)

L(3, "Vocabulário financeiro e jurídico de trabalho", "loonstrook, brutoloon, cao, ontslag, WW",
  ["Compreender documentos de trabalho: recibo de vencimento, contrato, despedimento"],
  vocab=[V("v-loonstrook","loonstrook","recibo de vencimento","noun","de"), V("v-loonheffing","loonheffing","retenção na fonte (imposto)","noun","de"),
         V("v-ontslag","ontslag","despedimento|demissão","noun","het"), V("v-ww-uitkering","WW-uitkering","subsídio de desemprego","noun","de"),
         V("v-cao","cao","convenção coletiva","noun","de")],
  ex=[("Op je loonstrook zie je je brutoloon en nettoloon.","No recibo de vencimento vês o salário bruto e líquido."),("Er wordt loonheffing ingehouden.","É retido imposto na fonte."),("Hij heeft ontslag genomen.","Ele demitiu-se."),("Na ontslag kun je een WW-uitkering aanvragen.","Depois do despedimento podes pedir subsídio de desemprego.")],
  gram=[G("g-ontslag","Ontslag nemen / krijgen","**ontslag nemen** = demitir-se (por iniciativa própria). **ontslag krijgen** / **ontslagen worden** = ser despedido. A **WW** (desemprego) é pedida ao **UWV**. A **cao** define salários e regras de um setor.",
    [("Ze is ontslagen wegens een reorganisatie.","Foi despedida devido a uma reorganização.")])],
  review=["v-bruto","v-netto","v-salaris","v-vakantiegeld"],
  cefr=C, exs=[
    MA([("loonstrook","recibo de vencimento"),("loonheffing","retenção na fonte"),("ontslag","despedimento"),("WW-uitkering","subsídio de desemprego"),("cao","convenção coletiva")], "Trabalho.", ["v-loonstrook","v-loonheffing","v-ontslag","v-ww-uitkering","v-cao"]),
    MC("«Ik heb ontslag genomen» significa…", ["*Demiti-me","Fui despedido|Isso é «ik ben ontslagen».","Tirei férias|Não."], "Diferença.", ["v-ontslag"]),
    TR("pt-nl","Ele demitiu-se.", ["Hij heeft ontslag genomen"], "ontslag nemen.", ["v-ontslag"]),
    TR("pt-nl","Foi despedida devido a uma reorganização.", ["Ze is ontslagen wegens een reorganisatie","Zij is ontslagen wegens een reorganisatie","Ze is ontslagen vanwege een reorganisatie"], "Passiva.", ["v-ontslag"]),
    TR("nl-pt","Op je loonstrook zie je je brutoloon en nettoloon.", ["No recibo de vencimento vês o salário bruto e líquido","No recibo vês o teu salário bruto e líquido"], "loonstrook.", ["v-loonstrook"]),
    AR("ontslag","o despedimento","het", "Het ontslag.", ["v-ontslag"]),
    MC("Onde se pede a WW-uitkering?", ["*No UWV","Na gemeente|Não para a WW.","No huisarts|Não."], "Instituição.", ["v-ww-uitkering"]),
    FE(["Hij","heeft","ontslag","gekregen,","want","hij","had","zelf","een","nieuwe","baan","gevonden."], 3, "genomen", "Quem sai por iniciativa própria «neemt ontslag».", ["v-ontslag"]),
    LI("Volgens de cao krijg je dit jaar drie procent loonsverhoging.", ["Volgens de cao krijg je dit jaar drie procent loonsverhoging","Volgens de cao krijg je dit jaar 3 procent loonsverhoging"], "Segundo a convenção coletiva, este ano tens um aumento de três por cento.", "cao.", ["v-cao"]),
    FB("Op je ___ staat hoeveel belasting je betaalt.", ["loonstrook"], "Recibo.", ["v-loonstrook"], choices=["loonstrook","cao","ontslag"], tr="No recibo de vencimento está quanto imposto pagas."),
  ], diff=5, mins=8)

L(4, "Comunicação de empresa", "missie, visie, kernwaarden, klanttevredenheid",
  ["Compreender e usar vocabulário corporativo"],
  vocab=[V("v-missie","missie","missão","noun","de"), V("v-visie","visie","visão","noun","de"),
         V("v-kernwaarden","kernwaarden","valores fundamentais","noun","de"), V("v-klanttevredenheid","klanttevredenheid","satisfação do cliente","noun","de")],
  ex=[("Onze missie is duurzame mobiliteit voor iedereen.","A nossa missão é mobilidade sustentável para todos."),("De visie beschrijft waar we over tien jaar staan.","A visão descreve onde estaremos daqui a dez anos."),("Onze kernwaarden zijn betrouwbaar, open en innovatief.","Os nossos valores fundamentais são fiabilidade, abertura e inovação."),("De klanttevredenheid is gestegen naar 8,4.","A satisfação do cliente subiu para 8,4.")],
  review=["v-betrouwbaar","v-doelstelling","v-resultaatgericht"],
  cefr=C, exs=[
    MA([("missie","missão"),("visie","visão"),("kernwaarden","valores fundamentais"),("klanttevredenheid","satisfação do cliente")], "Empresa.", ["v-missie","v-visie","v-kernwaarden","v-klanttevredenheid"]),
    MC("A «visie» de uma empresa descreve…", ["*onde a empresa quer estar no futuro","o salário dos funcionários|Não.","o horário|Não."], "Visão.", ["v-visie"]),
    TR("pt-nl","A satisfação do cliente subiu.", ["De klanttevredenheid is gestegen","De klanttevredenheid steeg"], "stijgen.", ["v-klanttevredenheid"]),
    TR("nl-pt","Onze missie is duurzame mobiliteit voor iedereen.", ["A nossa missão é mobilidade sustentável para todos"], "missie.", ["v-missie"]),
    FE(["Onze","kernwaarden","is","openheid","en","respect."], 2, "zijn", "Plural: zijn.", ["v-kernwaarden"]),
    CO("text","Over ons", "Bij GroenBouw geloven we dat iedereen recht heeft op een betaalbaar en duurzaam huis. Dat is onze missie. Onze visie: in 2035 bouwen we alleen nog energieneutrale woningen. Onze kernwaarden – vakmanschap, eerlijkheid en zorg voor de omgeving – zie je terug in alles wat we doen. Niet voor niets geven klanten ons gemiddeld een 8,6.",
       [("Qual é a missão?", ["*Casa acessível e sustentável para todos","Ser a maior empresa do país","Construir escritórios"]),("Qual é a visão para 2035?", ["*Só construir casas energeticamente neutras","Abrir em Portugal","Duplicar os preços"]),("Que nota dão os clientes?", ["*8,6 em média","6,8","10"])],
       "energieneutraal = energeticamente neutro.", ["v-missie","v-visie","v-kernwaarden"]),
    AR("visie","a visão","de", "De visie.", ["v-visie"]),
    LI("Klanttevredenheid staat bij ons voorop.", ["Klanttevredenheid staat bij ons voorop"], "Para nós, a satisfação do cliente está em primeiro lugar.", "voorop staan.", ["v-klanttevredenheid"]),
    SW("Escreva a missão e três valores fundamentais (2–3 frases) para uma escola de línguas imaginária.", ["Onze missie is dat iedere nieuwkomer zich binnen een jaar zelfstandig kan redden in het Nederlands. Onze kernwaarden zijn geduld, plezier en respect voor elke achtergrond."], ["**missie**", "Três **kernwaarden**", "Registo corporativo"], 30, "Texto corporativo.", ["v-missie","v-kernwaarden"]),
    FB("Een van onze ___ is duurzaamheid.", ["kernwaarden"], "Valores.", ["v-kernwaarden"], choices=["kernwaarden","missie","visie"], tr="Um dos nossos valores fundamentais é a sustentabilidade."),
  ], diff=5, mins=7)

L(5, "Linguagem técnica e explicação simples", "Jargon vermijden. In gewone taal betekent dat…",
  ["Explicar conceitos técnicos em linguagem simples"],
  vocab=[V("v-jargon","jargon","jargão","noun","het"), V("v-vakterm","vakterm","termo técnico","noun","de"),
         V("v-in-gewone-taal","in gewone taal","em linguagem corrente","expression"), V("v-uitleggen-eenvoudig","eenvoudig uitleggen","explicar de forma simples","expression")],
  ex=[("Vermijd jargon als je met klanten praat.","Evita o jargão quando falas com clientes."),("Dat is een vakterm uit de geneeskunde.","É um termo técnico da medicina."),("In gewone taal betekent dat: je moet meer rusten.","Em linguagem corrente isso significa: tens de descansar mais."),("Kun je dat eenvoudig uitleggen?","Consegues explicar isso de forma simples?")],
  review=["v-uitleggen","v-andere-woorden","v-een-soort"],
  cefr=C, exs=[
    MA([("jargon","jargão"),("vakterm","termo técnico"),("in gewone taal","em linguagem corrente"),("eenvoudig uitleggen","explicar de forma simples")], "Explicar.", ["v-jargon","v-vakterm","v-in-gewone-taal","v-uitleggen-eenvoudig"]),
    MC("Explicação simples de «hypotheekrenteaftrek»:", ["*Je mag de rente die je voor je huis betaalt van je belasting aftrekken.","Hypotheekrenteaftrek is de aftrek van hypotheekrente.|Circular.","Het is een fiscale faciliteit conform artikel 3.120.|Jargão."], "Simplificar.", ["v-in-gewone-taal"]),
    TR("pt-nl","Consegues explicar isso de forma simples?", ["Kun je dat eenvoudig uitleggen","Kan je dat eenvoudig uitleggen","Kun je dat in gewone taal uitleggen"], "eenvoudig uitleggen.", ["v-uitleggen-eenvoudig"]),
    TR("nl-pt","Vermijd jargon als je met klanten praat.", ["Evita o jargão quando falas com clientes"], "jargon.", ["v-jargon"]),
    AR("jargon","o jargão","het", "Het jargon.", ["v-jargon"]),
    FE(["In","gewoon","taal","betekent","dat:","je","moet","rusten."], 1, "gewone", "de taal → gewone.", ["v-in-gewone-taal"]),
    LI("In gewone taal betekent dat: je contract stopt over een maand.", ["In gewone taal betekent dat(:) je contract stopt over een maand","In gewone taal betekent dat(,) je contract stopt over een maand"], "Em linguagem corrente: o teu contrato acaba daqui a um mês.", "Simplificar.", ["v-in-gewone-taal"]),
    MC("Uma boa técnica para explicar um termo técnico é…", ["*dar um exemplo do dia a dia","usar mais termos técnicos|Não.","falar mais depressa|Não."], "Exemplo.", ["v-uitleggen-eenvoudig"]),
    FB("Een arts moet ___ vermijden bij patiënten.", ["jargon","vaktermen"], "Jargão.", ["v-jargon"], choices=["jargon","gewone taal","voorbeelden"], tr="Um médico deve evitar jargão com os doentes."),
    SW("Explique em linguagem simples (2–3 frases) um termo técnico da sua área profissional ou de estudos.", ["In mijn vak gebruiken we het woord 'cashflow'. In gewone taal betekent dat: hoeveel geld er in een bepaalde periode binnenkomt en weer uitgaat. Het is een soort huishoudboekje van een bedrijf."], ["Termo técnico", "**in gewone taal**", "Comparação/exemplo do dia a dia"], 35, "Explicação simples.", ["v-in-gewone-taal","v-vakterm"]),
  ], diff=5, mins=7)

W()
