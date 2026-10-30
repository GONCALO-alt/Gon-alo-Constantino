import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u12")
C = "B2"

L(1, "Simulação: comprar casa", "Bezichtiging, bod, hypotheek, notaris",
  ["Percorrer o processo de compra de uma casa"],
  vocab=[V("v-notaris","notaris","notário","noun","de"), V("v-koopovereenkomst","koopovereenkomst","contrato-promessa de compra","noun","de"), V("v-bouwkundige-keuring","bouwkundige keuring","inspeção técnica (casa)","noun","de"),
         V("v-overbieden","overbieden","oferecer acima do preço pedido","verb")],
  ex=[("We hebben een bezichtiging om drie uur.","Temos uma visita às três."),("In de Randstad wordt vaak overboden.","No Randstad oferece-se muitas vezes acima do preço."),("Laat altijd een bouwkundige keuring doen.","Faz sempre uma inspeção técnica."),("De overdracht is bij de notaris.","A escritura é no notário.")],
  gram=[G("g-huis-kopen","O processo","1) **Bezichtiging** (visita) → 2) **bod** (oferta; em zonas procuradas, *overbieden*) → 3) **koopovereenkomst** (com 3 dias de reflexão) → 4) **bouwkundige keuring** e **hypotheek** → 5) **overdracht** no **notaris**. Um **makelaar** pode ajudar.",
    [("We hebben een voorbehoud van financiering.","Temos uma cláusula de financiamento (a compra depende do empréstimo).")])],
  review=["v-overdracht","v-bod","v-hypotheek","v-bezichtiging","v-makelaar"],
  cefr=C, exs=[
    MA([("notaris","notário"),("overdracht","escritura"),("koopovereenkomst","contrato-promessa"),("bouwkundige keuring","inspeção técnica"),("overbieden","oferecer acima")], "Comprar casa.", ["v-notaris","v-overdracht","v-koopovereenkomst","v-bouwkundige-keuring","v-overbieden"]),
    MC("Ordem do processo:", ["*bezichtiging → bod → koopovereenkomst → overdracht bij de notaris","notaris → bod → bezichtiging|Trocado.","overdracht → bezichtiging|Trocado."], "Processo.", ["v-overdracht"]),
    TR("pt-nl","Faz sempre uma inspeção técnica.", ["Laat altijd een bouwkundige keuring doen","Laat altijd een bouwkundige keuring uitvoeren"], "laten doen.", ["v-bouwkundige-keuring"]),
    TR("nl-pt","In de Randstad wordt vaak overboden.", ["No Randstad oferece-se muitas vezes acima do preço pedido"], "overbieden.", ["v-overbieden"]),
    DL([("Makelaar","De vraagprijs is 425.000 euro. Er zijn al drie biedingen.","O preço pedido é 425 000 euros. Já há três ofertas."),("Koper","")], ["*Dan doen we een bod van 440.000, onder voorbehoud van financiering en een bouwkundige keuring.","Ik koop het voor 100.000.|Irrealista.","Wat is een bod?|Fora de contexto."], "Oferta realista com condições.", ["v-bod","v-bouwkundige-keuring"]),
    AR("koopovereenkomst","o contrato-promessa","de", "De overeenkomst.", ["v-koopovereenkomst"]),
    FE(["De","overdracht","is","bij","het","notaris."], 4, "de", "de notaris.", ["v-notaris"]),
    LI("Na het tekenen van de koopovereenkomst heb je drie dagen bedenktijd.", ["Na het tekenen van de koopovereenkomst heb je drie dagen bedenktijd"], "Depois de assinar o contrato-promessa tens três dias para pensar.", "bedenktijd = período de reflexão.", ["v-koopovereenkomst"]),
    CO("text","Huis gekocht!", "Na vijftien bezichtigingen hebben Pedro en Sanne eindelijk een huis gekocht. Ze moesten 15.000 euro overbieden. De bouwkundige keuring liet zien dat het dak binnen vijf jaar vervangen moet worden. Daarom hebben ze met de verkoper afgesproken dat de prijs 5.000 euro lager wordt. De overdracht bij de notaris is op 1 juni.",
       [("Quanto ofereceram acima do pedido?", ["*15 000 euros","5 000 euros","Nada"]),("O que revelou a inspeção?", ["*O telhado tem de ser substituído em 5 anos","Problemas de humidade","Nada"]),("Quando é a escritura?", ["*1 de junho","Daqui a cinco anos","Amanhã"])],
       "Negociaram uma redução depois da inspeção.", ["v-overbieden","v-bouwkundige-keuring","v-overdracht"]),
    SW("Escreva um e-mail ao makelaar (3–4 frases) a fazer uma oferta com duas condições.", ["Beste heer Jansen,\nNa de bezichtiging van gisteren willen we graag een bod doen van 395.000 euro. Ons bod is onder voorbehoud van financiering en een bouwkundige keuring. We horen graag van u.\nMet vriendelijke groet,\nPedro en Sanne"], ["**een bod doen**", "Duas condições (**onder voorbehoud van**)", "Registo formal"], 40, "Oferta formal.", ["v-bod"]),
  ], diff=5, mins=8)

L(2, "Simulação: no hospital", "Opname, specialist, onderzoek, ontslag uit het ziekenhuis",
  ["Lidar com uma ida ao hospital do início ao fim"],
  vocab=[V("v-opname","opname","internamento","noun","de"), V("v-spoedeisende-hulp","spoedeisende hulp","urgências","noun","de",note="abrev. SEH"), V("v-uitslag","uitslag","resultado (de exames)","noun","de"),
         V("v-nazorg","nazorg","acompanhamento pós-tratamento","noun","de")],
  ex=[("Hij ligt op de spoedeisende hulp.","Ele está nas urgências."),("De opname duurt drie dagen.","O internamento dura três dias."),("Wanneer krijg ik de uitslag?","Quando recebo o resultado?"),("De huisarts regelt de nazorg.","O médico de família trata do acompanhamento.")],
  review=["v-specialist","v-ziekenhuis","v-doorverwijzing","v-onderzoeken-arts","v-klachten"],
  cefr=C, exs=[
    MA([("opname","internamento"),("specialist","especialista"),("spoedeisende hulp","urgências"),("uitslag","resultado"),("nazorg","acompanhamento")], "Hospital.", ["v-opname","v-specialist","v-spoedeisende-hulp","v-uitslag","v-nazorg"]),
    TR("pt-nl","Quando recebo o resultado?", ["Wanneer krijg ik de uitslag","Wanneer hoor ik de uitslag"], "uitslag.", ["v-uitslag"]),
    TR("nl-pt","De opname duurt drie dagen.", ["O internamento dura três dias"], "opname.", ["v-opname"]),
    MC("Nos Países Baixos, para ir às urgências (SEH) sem ser emergência grave, normalmente…", ["*liga-se primeiro ao huisarts ou à huisartsenpost","vai-se diretamente sempre|Só em emergências.","liga-se ao 112 por qualquer coisa|Só para emergências."], "Sistema de saúde.", ["v-spoedeisende-hulp"]),
    CO("dialogue","Op de afdeling", "Verpleegkundige: Goedemorgen, meneer Costa. Hoe heeft u geslapen?\nCosta: Redelijk, maar ik heb nog pijn in mijn zij.\nVerpleegkundige: Ik geef u zo een pijnstiller. De specialist komt om tien uur langs met de uitslag van de scan.\nCosta: Weet u al wanneer ik naar huis mag?\nVerpleegkundige: Als de uitslag goed is, waarschijnlijk morgen. Uw huisarts krijgt dan een brief voor de nazorg.",
       [("Como dormiu o Sr. Costa?", ["*Razoavelmente, mas com dores","Muito bem","Não dormiu"]),("A que horas vem o especialista?", ["*Às dez","Às duas","Amanhã"]),("Quando pode ir para casa?", ["*Provavelmente amanhã, se o resultado for bom","Hoje","Daqui a uma semana"])],
       "zij = lado (do corpo); afdeling = enfermaria.", ["v-specialist","v-uitslag","v-nazorg"]),
    FE(["Wanneer","krijgt","ik","de","uitslag","van","het","bloedonderzoek?"], 1, "krijg", "ik → krijg (sem -t).", ["v-uitslag"]),
    AR("specialist","o especialista","de", "De specialist.", ["v-specialist"]),
    LI("De specialist bespreekt morgen de uitslag met u.", ["De specialist bespreekt morgen de uitslag met u"], "O especialista discute amanhã o resultado consigo.", "bespreken.", ["v-specialist","v-uitslag"]),
    FB("Na de operatie regelt de huisarts de ___.", ["nazorg"], "Acompanhamento.", ["v-nazorg"], choices=["nazorg","opname","uitslag"], tr="Depois da operação, o médico de família trata do acompanhamento."),
    DL([("Verpleegkundige","Heeft u nog vragen voordat u naar huis gaat?","Tem mais perguntas antes de ir para casa?"),("Patiënt","")], ["*Ja, mag ik meteen weer sporten, en wanneer moet ik terugkomen voor controle?","Nee, doei.|Pouco útil.","Ik ben de nazorg.|Sem sentido."], "Perguntas úteis.", ["v-nazorg","v-controle"]),
  ], diff=5, mins=8)

L(3, "Simulação: problema com o senhorio", "Van melding tot Huurcommissie",
  ["Resolver um problema de habitação passo a passo"],
  vocab=[V("v-gebrek","gebrek","defeito","noun","het","gebreken"), V("v-huurcommissie","Huurcommissie","comissão de arrendamento","noun","de"),
         V("v-huurverlaging","huurverlaging","redução da renda","noun","de"), V("v-melding-maken","een melding maken","comunicar (oficialmente)","expression")],
  ex=[("Ik heb een melding gemaakt van de schimmel.","Comuniquei o problema do bolor."),("Een lekkend dak is een ernstig gebrek.","Um telhado com infiltrações é um defeito grave."),("De Huurcommissie kan een huurverlaging geven.","A Huurcommissie pode conceder uma redução da renda."),("Bewaar alle e-mails als bewijs.","Guarda todos os e-mails como prova.")],
  review=["v-verhuurder","v-schimmel","v-in-gebreke-stellen","v-bewijs"],
  cefr=C, exs=[
    MA([("gebrek","defeito"),("Huurcommissie","comissão de arrendamento"),("huurverlaging","redução da renda"),("een melding maken","comunicar")], "Habitação.", ["v-gebrek","v-huurcommissie","v-huurverlaging","v-melding-maken"]),
    MC("Ordem dos passos:", ["*melding maken → schriftelijk in gebreke stellen → Huurcommissie","Huurcommissie → melding|Trocado.","huur niet betalen|Arriscado e não recomendado."], "Processo.", ["v-melding-maken"]),
    MC("Deixar de pagar a renda por causa de um defeito é…", ["*arriscado: o senhorio pode avançar contra si; use os passos oficiais","sempre permitido|Não.","obrigatório|Não."], "Prudência.", ["v-huurcommissie"]),
    TR("pt-nl","Comuniquei o problema do bolor.", ["Ik heb een melding gemaakt van de schimmel","Ik heb de schimmel gemeld"], "melding maken.", ["v-melding-maken"]),
    TR("nl-pt","De Huurcommissie kan een huurverlaging geven.", ["A Huurcommissie pode conceder uma redução da renda","A comissão de arrendamento pode dar uma redução da renda"], "huurverlaging.", ["v-huurverlaging"]),
    AR("gebrek","o defeito","het", "Het gebrek.", ["v-gebrek"]),
    FE(["Ik","heb","een","melding","gedaan","van","de","lekkage."], 4, "gemaakt", "Colocação: een melding maken.", ["v-melding-maken"]),
    LI("Bewaar alle foto's en e-mails als bewijs.", ["Bewaar alle foto's en e-mails als bewijs"], "Guarda todas as fotos e e-mails como prova.", "bewijs.", ["v-bewijs"]),
    CO("text","Stappenplan bij gebreken", "1. Meld het gebrek bij je verhuurder, liefst per e-mail, en maak foto's.\n2. Geef de verhuurder een redelijke termijn, bijvoorbeeld zes weken.\n3. Gebeurt er niets? Stel de verhuurder schriftelijk in gebreke.\n4. Daarna kun je naar de Huurcommissie. Die kan bepalen dat je tijdelijk minder huur betaalt tot het gebrek is opgelost.",
       [("Como se deve comunicar o defeito?", ["*De preferência por e-mail, com fotos","Só por telefone","Não é preciso"]),("O que pode decidir a Huurcommissie?", ["*Uma renda temporariamente mais baixa","Despejar o senhorio","Vender a casa"])],
       "termijn = prazo.", ["v-huurcommissie","v-gebrek"]),
    SW("Escreva o e-mail do passo 1 (3–4 frases) ao senhorio sobre bolor na casa de banho.", ["Beste meneer De Groot,\nHierbij meld ik dat er sinds twee weken schimmel op het plafond van de badkamer zit. In de bijlage vindt u foto's. Wilt u dit binnen zes weken laten oplossen?\nMet vriendelijke groet,\nInês Pereira"], ["Descreve o defeito com data", "Menciona provas", "Prazo", "Registo formal"], 40, "Comunicação formal.", ["v-melding-maken","v-gebrek"]),
  ], diff=5, mins=8)

L(4, "Simulação: acidente de trânsito", "Schadeformulier, getuigen, verzekering",
  ["Lidar com um pequeno acidente e o seguro"],
  vocab=[V("v-verzekering","verzekering","seguro","noun","de"), V("v-aansprakelijk","aansprakelijk","responsável (legalmente)","adjective")],
  ex=[("Ik heb een kleine aanrijding gehad.","Tive uma pequena colisão."),("We vullen samen het schadeformulier in.","Preenchemos juntos a declaração amigável."),("Mijn verzekering betaalt de schade.","O meu seguro paga os danos."),("Wie is aansprakelijk?","Quem é responsável?")],
  review=["v-schadeformulier","v-aanrijding","v-getuige","v-politie","v-ongeval","v-invullen"],
  cefr=C, exs=[
    MA([("aanrijding","colisão"),("schadeformulier","declaração amigável"),("verzekering","seguro"),("aansprakelijk","responsável")], "Acidente.", ["v-aanrijding","v-schadeformulier","v-verzekering","v-aansprakelijk"]),
    TR("pt-nl","Tive uma pequena colisão.", ["Ik heb een kleine aanrijding gehad","Ik had een kleine aanrijding"], "aanrijding.", ["v-aanrijding"]),
    TR("pt-nl","Quem é responsável?", ["Wie is aansprakelijk","Wie is er aansprakelijk"], "aansprakelijk.", ["v-aansprakelijk"]),
    TR("nl-pt","We vullen samen het schadeformulier in.", ["Preenchemos juntos a declaração amigável","Preenchemos juntos o formulário de danos"], "invullen.", ["v-schadeformulier"]),
    AR("schadeformulier","a declaração amigável","het", "Het formulier.", ["v-schadeformulier"]),
    DL([("Andere bestuurder","U reed zomaar door rood!","Passou no vermelho!"),("Rui","")], ["*Volgens mij was het oranje. Laten we rustig het schadeformulier invullen en de getuige vragen wat hij zag.","Nee, u bent dom!|Agressivo.","Ik ga weg.|Ilegal e errado."], "Calma + procedimento.", ["v-schadeformulier","v-getuige"]),
    FE(["Ik","heb","een","kleine","aanrijding","gekregen."], 5, "gehad", "een aanrijding hebben → gehad.", ["v-aanrijding"]),
    LI("Neem de gegevens van de andere bestuurder en eventuele getuigen.", ["Neem de gegevens van de andere bestuurder en eventuele getuigen"], "Anota os dados do outro condutor e de eventuais testemunhas.", "gegevens.", ["v-getuige"]),
    MC("Num acidente entre um carro e um ciclista nos Países Baixos…", ["*o automobilista é, em regra, (parcialmente) responsável pelos danos do ciclista","o ciclista paga sempre tudo|Não.","ninguém é responsável|Não."], "Regra conhecida (art. 185 WVW).", ["v-aansprakelijk"]),
    FB("Mijn ___ dekt alleen schade aan anderen.", ["verzekering"], "Seguro.", ["v-verzekering"], choices=["verzekering","aanrijding","schadeformulier"], tr="O meu seguro só cobre danos a terceiros."),
  ], diff=5, mins=8)

L(5, "Simulação: organizar um evento", "Locatie, catering, uitnodigingen, draaiboek",
  ["Planear e comunicar a organização de um evento"],
  vocab=[V("v-locatie","locatie","local","noun","de"), V("v-catering","catering","catering","noun","de"),
         V("v-draaiboek","draaiboek","guião (plano detalhado)","noun","het"), V("v-deelnemer","deelnemer","participante","noun","de")],
  ex=[("We zoeken een locatie voor honderd personen.","Procuramos um local para cem pessoas."),("De catering verzorgt de lunch.","O catering trata do almoço."),("Staat alles in het draaiboek?","Está tudo no guião?"),("Al vijftig deelnemers hebben zich aangemeld.","Já se inscreveram cinquenta participantes.")],
  review=["v-aanmelden","v-reserveren","v-uitnodiging","v-begroting","v-plannen"],
  cefr=C, exs=[
    MA([("locatie","local"),("catering","catering"),("draaiboek","guião"),("zich aanmelden","inscrever-se"),("deelnemer","participante")], "Evento.", ["v-locatie","v-catering","v-draaiboek","v-aanmelden","v-deelnemer"]),
    TR("pt-nl","Procuramos um local para cem pessoas.", ["We zoeken een locatie voor honderd personen","Wij zoeken een locatie voor 100 personen","We zoeken een locatie voor 100 personen"], "locatie.", ["v-locatie"]),
    TR("nl-pt","Al vijftig deelnemers hebben zich aangemeld.", ["Já se inscreveram cinquenta participantes","Cinquenta participantes já se inscreveram"], "zich aanmelden.", ["v-aanmelden"]),
    AR("draaiboek","o guião","het", "Het boek.", ["v-draaiboek"]),
    CO("text","Draaiboek personeelsfeest", "09.30 – Ontvangst met koffie in de foyer (catering: Smaakvol)\n10.00 – Welkomstwoord door de directeur\n10.30 – Workshops in drie groepen (zie lijst deelnemers)\n12.30 – Lunch\n14.00 – Fietstocht langs de rivier (bij regen: pubquiz binnen)\n17.00 – Borrel en afsluiting\nContactpersoon op de dag: Ana Silva, 06-12345678",
       [("O que acontece às 10h?", ["*Discurso de boas-vindas do diretor","Almoço","Passeio de bicicleta"]),("O que acontece se chover às 14h?", ["*Um quiz dentro de portas","Cancela-se tudo","Passeio de barco"]),("Quem é a pessoa de contacto?", ["*Ana Silva","O diretor","A empresa de catering"])],
       "Um draaiboek detalha horários e responsáveis.", ["v-draaiboek","v-catering"]),
    FE(["Al","vijftig","deelnemers","heeft","zich","aangemeld."], 3, "hebben", "Plural: hebben.", ["v-deelnemer"]),
    LI("Vergeet niet je aan te melden vóór vrijdag.", ["Vergeet niet je aan te melden vóór vrijdag","Vergeet niet je aan te melden voor vrijdag"], "Não te esqueças de te inscrever antes de sexta.", "aanmelden.", ["v-aanmelden"]),
    FB("De ___ verzorgt de koffie en de lunch.", ["catering"], "Catering.", ["v-catering"], choices=["catering","locatie","deelnemer"], tr="O catering trata do café e do almoço."),
    SW("Escreva um convite curto (4 frases) para o evento do draaiboek, com data, local, programa e inscrição.", ["Beste collega's,\nOp vrijdag 14 juni organiseren we ons jaarlijkse personeelsfeest in Restaurant De Rivier. Het programma bestaat uit workshops, een lunch en een fietstocht. Meld je vóór 1 juni aan via het formulier op intranet.\nTot dan!"], ["Data e local", "Programa", "Inscrição com prazo"], 40, "Convite.", ["v-aanmelden","v-locatie"]),
  ], diff=5, mins=8)

W()
