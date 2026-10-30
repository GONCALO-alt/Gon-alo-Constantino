import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u15")
C = "B2"

L(1, "Projeto 1: guia da minha cidade", "Een stadsgids schrijven voor nieuwkomers.",
  ["Escrever um guia prático para recém-chegados à sua cidade"],
  vocab=[V("v-stadsgids","stadsgids","guia da cidade","noun","de"), V("v-nieuwkomer","nieuwkomer","recém-chegado","noun","de"),
         V("v-wegwijs","wegwijs maken","orientar|ajudar a orientar-se","expression"), V("v-praktische-tip","praktische tip","dica prática","noun","de")],
  ex=[("Ik schrijf een stadsgids voor nieuwkomers.","Escrevo um guia da cidade para recém-chegados."),("Deze gids maakt je wegwijs in Utrecht.","Este guia ajuda-te a orientar-te em Utrecht."),("Hier zijn tien praktische tips.","Aqui ficam dez dicas práticas."),("Als nieuwkomer is alles even wennen.","Como recém-chegado, tudo exige alguma adaptação.")],
  review=["v-gemeente","v-inschrijven","v-huisarts","v-ov-chipkaart","v-markt"],
  cefr=C, exs=[
    MA([("stadsgids","guia da cidade"),("nieuwkomer","recém-chegado"),("wegwijs maken","orientar"),("praktische tip","dica prática")], "Projeto.", ["v-stadsgids","v-nieuwkomer","v-wegwijs","v-praktische-tip"]),
    TR("pt-nl","Este guia ajuda-te a orientar-te em Utrecht.", ["Deze gids maakt je wegwijs in Utrecht"], "wegwijs maken.", ["v-wegwijs"]),
    TR("nl-pt","Als nieuwkomer is alles even wennen.", ["Como recém-chegado, tudo exige alguma adaptação","Para um recém-chegado, tudo leva algum tempo de habituação"], "even wennen.", ["v-nieuwkomer"]),
    AR("stadsgids","o guia da cidade","de", "De gids.", ["v-stadsgids"]),
    CO("text","Voorbeeld: Welkom in Leiden!", "1. Inschrijven: maak binnen vijf dagen na aankomst een afspraak bij de gemeente. Neem je paspoort en huurcontract mee.\n2. Huisarts: schrijf je zo snel mogelijk in bij een huisarts in je buurt; niet alle praktijken nemen nieuwe patiënten aan.\n3. Vervoer: koop een fiets (tweedehands op Marktplaats) en een OV-chipkaart of betaal met je bankpas.\n4. Markt: op woensdag en zaterdag is er markt langs de Nieuwe Rijn.\n5. Taal: in de bibliotheek is elke dinsdag een gratis taalcafé.",
       [("Com que antecedência se inscreve na câmara?", ["*Nos cinco dias após a chegada","Num mês","Não é preciso"]),("Porque se deve inscrever depressa num médico?", ["*Nem todos os consultórios aceitam novos doentes","É obrigatório em 24h","É grátis só no primeiro mês"]),("Onde é o café de línguas?", ["*Na biblioteca, à terça","Na câmara, à sexta","No mercado"])],
       "Repare: imperativos, conectores e informação concreta.", ["v-stadsgids","v-praktische-tip"]),
    FE(["Schrijf","je","zo","snel","mogelijk","bij","een","huisarts","op."], 8, "in", "inschrijven: Schrijf je … in.", ["v-inschrijven"]),
    MC("Num guia prático, as frases funcionam melhor…", ["*no imperativo, curtas e concretas","muito longas e literárias|Pouco práticas.","só com opiniões|Falta informação."], "Género.", ["v-praktische-tip"]),
    LI("Neem bij de afspraak je paspoort en je huurcontract mee.", ["Neem bij de afspraak je paspoort en je huurcontract mee"], "Leva o passaporte e o contrato de arrendamento para a marcação.", "Imperativo.", ["v-praktische-tip"]),
    SW("PROJETO: Escreva um mini-guia (6–8 pontos) da sua cidade para recém-chegados: registo, médico, transportes, compras, lazer e língua.", ["Welkom in Eindhoven!\n1. Inschrijven: maak een afspraak bij de gemeente via de website.\n2. Huisarts: zoek een praktijk in je wijk en bel om je in te schrijven.\n3. Vervoer: de stad is plat en klein, dus een fiets is ideaal.\n4. Boodschappen: op zaterdag is er een grote markt op het Wilhelminaplein.\n5. Vrije tijd: in de zomer zijn er gratis concerten in het Stadswandelpark.\n6. Taal: elke donderdag is er een taalcafé in de bibliotheek.\n7. Tip: neem altijd een regenjas mee!"], ["Pelo menos 6 pontos", "Imperativos corretos", "Informação concreta", "Separáveis certos"], 80, "Guia da cidade.", ["v-stadsgids","v-nieuwkomer"]),
    FB("Deze gids is speciaal voor ___ in de stad.", ["nieuwkomers"], "Recém-chegados.", ["v-nieuwkomer"], choices=["nieuwkomers","nieuwkomer","nieuwe"], tr="Este guia é especialmente para recém-chegados à cidade."),
  ], diff=5, mins=8)

L(2, "Projeto 2: apresentação sobre Portugal", "Een presentatie geven over je land van herkomst.",
  ["Preparar e escrever uma apresentação sobre Portugal para um público neerlandês"],
  vocab=[V("v-land-van-herkomst","land van herkomst","país de origem","noun","het"), V("v-vergelijking","vergelijking","comparação","noun","de"),
         V("v-weetje","weetje","curiosidade","noun","het"), V("v-erfgoed","erfgoed","património","noun","het")],
  ex=[("Mijn land van herkomst is Portugal.","O meu país de origem é Portugal."),("Een leuk weetje: de oudste boekhandel ter wereld staat in Lissabon.","Uma curiosidade: a livraria mais antiga do mundo fica em Lisboa."),("Fado is cultureel erfgoed.","O fado é património cultural."),("Ik maak een vergelijking met Nederland.","Faço uma comparação com os Países Baixos.")],
  review=["v-portugal","v-traditie","v-presentatie","v-ik-kom-nu-bij","v-net-als"],
  cefr=C, exs=[
    MA([("land van herkomst","país de origem"),("vergelijking","comparação"),("weetje","curiosidade"),("erfgoed","património")], "Projeto.", ["v-land-van-herkomst","v-vergelijking","v-weetje","v-erfgoed"]),
    TR("pt-nl","O fado é património cultural.", ["Fado is cultureel erfgoed","De fado is cultureel erfgoed"], "erfgoed.", ["v-erfgoed"]),
    TR("pt-nl","Faço uma comparação com os Países Baixos.", ["Ik maak een vergelijking met Nederland"], "vergelijking maken.", ["v-vergelijking"]),
    AR("erfgoed","o património","het", "Het erfgoed.", ["v-erfgoed"]),
    AR("weetje","a curiosidade","het", "Diminutivo → het.", ["v-weetje"]),
    MC("Factos sobre Portugal — qual é verdadeiro?", ["*Portugal heeft ongeveer 10 miljoen inwoners.","Portugal heeft 50 miljoen inwoners.|Não.","De hoofdstad van Portugal is Porto.|É Lisboa."], "Cultura geral.", ["v-land-van-herkomst"]),
    FE(["Net","als","Nederland","Portugal","is","een","zeevaardersland."], 3, "is Portugal", "Inversão depois de «Net als Nederland»: is Portugal…", ["v-net-als"]),
    LI("Een leuk weetje: in Portugal eet men bijna vijfhonderd soorten bacalhau-gerechten.", ["Een leuk weetje(:) in Portugal eet men bijna vijfhonderd soorten bacalhau-gerechten","Een leuk weetje(,) in Portugal eet men bijna 500 soorten bacalhau-gerechten"], "Uma curiosidade: em Portugal há quase quinhentas receitas de bacalhau.", "Curiosidade (frase popular).", ["v-weetje"]),
    FB("Mijn land van ___ is Portugal, maar ik woon al tien jaar hier.", ["herkomst"], "Origem.", ["v-land-van-herkomst"], choices=["herkomst","komst","afkomst"], tr="O meu país de origem é Portugal, mas moro aqui há dez anos."),
    SW("PROJETO: Escreva o texto de uma apresentação de 2 minutos (8–10 frases) sobre Portugal: abertura cativante, três temas (ex.: história, comida, cultura), uma comparação com os Países Baixos e um fecho.", ["Wist u dat Nederland en Portugal al eeuwen handelspartners zijn? Vandaag neem ik u mee naar mijn land van herkomst. Eerst iets over de geschiedenis: Portugal was in de vijftiende eeuw een van de grootste zeevaardersnaties ter wereld. Dan kom ik nu bij het eten. Net als in Nederland eten we veel vis, maar bij ons staat bacalhau centraal. Tot slot de cultuur: fado is sinds 2011 immaterieel werelderfgoed van UNESCO. Een groot verschil met Nederland is het weer: wij hebben meer dan 300 zonnige dagen per jaar in de Algarve. Kortom: kom eens langs, u bent van harte welkom!"], ["Abertura cativante", "Três temas com transições", "Uma comparação", "Fecho"], 120, "Apresentação.", ["v-land-van-herkomst","v-vergelijking"]),
    MC("O fado foi declarado património imaterial da UNESCO em…", ["*2011","1990|Não.","2020|Não."], "Facto.", ["v-erfgoed"]),
  ], diff=5, mins=8)

L(3, "Projeto 3: carta à câmara com uma proposta", "Een voorstel doen voor je wijk.",
  ["Escrever uma proposta formal e fundamentada para o bairro"],
  vocab=[V("v-buurtinitiatief","buurtinitiatief","iniciativa de bairro","noun","het"), V("v-subsidie","subsidie","subsídio|apoio financeiro","noun","de"),
         V("v-leefbaarheid","leefbaarheid","qualidade de vida (de um lugar)","noun","de"), V("v-bewoners","bewoners","moradores","noun","de")],
  ex=[("We starten een buurtinitiatief.","Vamos começar uma iniciativa de bairro."),("Kunnen we subsidie aanvragen?","Podemos pedir um apoio financeiro?"),("Het plan verbetert de leefbaarheid van de wijk.","O plano melhora a qualidade de vida do bairro."),("Veel bewoners steunen het idee.","Muitos moradores apoiam a ideia.")],
  review=["v-voorstel","v-gemeente","v-draagvlak","v-begroting","v-indienen"],
  cefr=C, exs=[
    MA([("buurtinitiatief","iniciativa de bairro"),("subsidie","subsídio"),("leefbaarheid","qualidade de vida"),("bewoners","moradores")], "Projeto.", ["v-buurtinitiatief","v-subsidie","v-leefbaarheid","v-bewoners"]),
    TR("pt-nl","Podemos pedir um apoio financeiro?", ["Kunnen we subsidie aanvragen","Kunnen wij subsidie aanvragen","Kunnen we een subsidie aanvragen"], "subsidie aanvragen.", ["v-subsidie"]),
    TR("nl-pt","Het plan verbetert de leefbaarheid van de wijk.", ["O plano melhora a qualidade de vida do bairro"], "leefbaarheid.", ["v-leefbaarheid"]),
    AR("buurtinitiatief","a iniciativa de bairro","het", "Het initiatief.", ["v-buurtinitiatief"]),
    MC("Para uma proposta à câmara, o mais convincente é mostrar…", ["*draagvlak (assinaturas), custos claros e benefícios para o bairro","só a sua opinião|Insuficiente.","que outros bairros são piores|Não é o essencial."], "Fundamentação.", ["v-draagvlak"]),
    FE(["Veel","bewoners","steunt","het","idee."], 2, "steunen", "Plural: steunen.", ["v-bewoners"]),
    LI("Met dit buurtinitiatief willen we de leefbaarheid verbeteren.", ["Met dit buurtinitiatief willen we de leefbaarheid verbeteren"], "Com esta iniciativa de bairro queremos melhorar a qualidade de vida.", "Objetivo.", ["v-buurtinitiatief","v-leefbaarheid"]),
    FB("Al tachtig ___ hebben de petitie getekend.", ["bewoners"], "Moradores.", ["v-bewoners"], choices=["bewoners","subsidie","initiatief"], tr="Já oitenta moradores assinaram a petição."),
    WO("Vamos começar uma iniciativa de bairro.", ["We","starten","een","buurtinitiatief"], "starten.", ["v-buurtinitiatief"]),
    SW("PROJETO: Escreva uma carta formal (8–10 frases) à câmara a propor uma horta comunitária num terreno abandonado do seu bairro: situação, proposta, benefícios, apoio dos moradores, custos e pedido.", ["Aan het college van burgemeester en wethouders\nBetreft: voorstel buurtmoestuin Zuidwijk\n\nGeachte heer/mevrouw,\nIn onze wijk ligt al jaren een braakliggend terrein aan de Lindelaan. Hierbij stellen wij voor om daar een buurtmoestuin aan te leggen. Een moestuin verbetert de leefbaarheid: bewoners leren elkaar kennen, kinderen leren waar groente vandaan komt en de wijk wordt groener. Inmiddels hebben 85 bewoners onze petitie getekend en twintig mensen willen als vrijwilliger meehelpen. De kosten schatten wij op 4.500 euro voor hekken, aarde en gereedschap. Wij verzoeken u om het terrein beschikbaar te stellen en een subsidie toe te kennen. Graag lichten wij ons plan toe in een gesprek.\n\nMet vriendelijke groet,\nNamens Buurtinitiatief Groen Zuid,\nR. Fernandes"], ["Situação", "Proposta", "Benefícios", "Draagvlak com números", "Custos", "Pedido formal"], 130, "Proposta formal.", ["v-buurtinitiatief","v-subsidie","v-leefbaarheid"]),
    MC("«Braakliggend terrein» é…", ["*um terreno abandonado/sem uso","um parque infantil|Não.","um estacionamento|Não."], "Vocabulário.", ["v-leefbaarheid"]),
  ], diff=5, mins=8)

L(4, "Projeto 4: entrevista e retrato", "Iemand interviewen en een portret schrijven.",
  ["Entrevistar alguém e escrever um retrato jornalístico"],
  vocab=[V("v-portret","portret","retrato","noun","het"), V("v-geinterviewde","geïnterviewde","entrevistado","noun","de"),
         V("v-anekdotisch","anekdotisch","anedótico","adjective"), V("v-in-de-schijnwerpers","in de schijnwerpers","em destaque","expression")],
  ex=[("Ik schrijf een portret van mijn buurvrouw.","Escrevo um retrato da minha vizinha."),("De geïnterviewde vertelt open over haar leven.","A entrevistada fala abertamente sobre a sua vida."),("Begin je portret met een anekdote.","Começa o teu retrato com um episódio."),("Deze week staat Fatima in de schijnwerpers.","Esta semana a Fatima está em destaque.")],
  review=["v-levensloop","v-drijfveer","v-citaat","v-aldus"],
  cefr=C, exs=[
    MA([("portret","retrato"),("geïnterviewde","entrevistado"),("anekdotisch","anedótico"),("in de schijnwerpers","em destaque")], "Projeto.", ["v-portret","v-geinterviewde","v-anekdotisch","v-in-de-schijnwerpers"]),
    AR("portret","o retrato","het", "Het portret.", ["v-portret"]),
    TR("pt-nl","Esta semana a Fatima está em destaque.", ["Deze week staat Fatima in de schijnwerpers"], "Inversão.", ["v-in-de-schijnwerpers"]),
    TR("nl-pt","De geïnterviewde vertelt open over haar leven.", ["A entrevistada fala abertamente sobre a sua vida"], "geïnterviewde.", ["v-geinterviewde"]),
    MC("Boas perguntas para uma entrevista-retrato são…", ["*abertas: «Hoe was het om…?», «Wat drijft je?»","só sim/não|Dão respostas curtas.","sobre o salário|Inadequado."], "Técnica.", ["v-geinterviewde"]),
    CO("text","Portret: Fatima (67), de taalcafé-oma", "Elke dinsdagochtend staat de koffie al klaar als de eerste deelnemers binnenkomen. 'Goedemorgen! Hoe was je weekend?' vraagt Fatima, en ze wacht geduldig op het antwoord. Zelf kwam ze in 1978 uit Marokko naar Rotterdam. 'Ik sprak geen woord Nederlands. Mijn buurvrouw heeft me de taal geleerd, met koffie en koekjes.' Nu doet ze hetzelfde voor anderen. 'Iedereen verdient een buurvrouw zoals ik had,' aldus Fatima.",
       [("Quando chegou a Fatima a Roterdão?", ["*Em 1978","Em 2010","Em 1998"]),("Quem lhe ensinou neerlandês?", ["*A vizinha","Uma escola","O marido"]),("Qual é a motivação dela?", ["*Fazer pelos outros o que a vizinha fez por ela","Ganhar dinheiro","Praticar árabe"])],
       "Estrutura: cena → passado → presente → citação final.", ["v-portret","v-anekdotisch"]),
    FE(["Ze","is","in","1978","uit","Marokko","naar","Rotterdam","gekomt."], 8, "gekomen", "Particípio de komen: gekomen.", ["v-portret"]),
    LI("Wat drijft je om dit vrijwilligerswerk te doen?", ["Wat drijft je om dit vrijwilligerswerk te doen"], "O que te motiva a fazer este voluntariado?", "drijven.", ["v-drijfveer"]),
    WO("Escrevo um retrato da minha vizinha.", ["Ik","schrijf","een","portret","van","mijn","buurvrouw"], "portret van.", ["v-portret"]),
    SW("PROJETO: Escreva um retrato curto (8–10 frases) de uma pessoa que admira (real ou imaginária): cena inicial, percurso, motivação e uma citação final.", ["Om half zeven 's ochtends is de bakkerij van Jan al open. De geur van vers brood hangt in de hele straat. Jan (58) begon hier veertig jaar geleden als leerling bij zijn vader. 'Ik wilde eigenlijk piloot worden,' lacht hij. Maar toen zijn vader ziek werd, nam hij de zaak over. Nu bakt hij elke dag meer dan driehonderd broden, en elke vrijdag brengt hij het brood dat over is naar de voedselbank. 'Brood weggooien vind ik zonde,' zegt hij. 'Er is altijd iemand die het nodig heeft.' Voor de buurt is Jan meer dan een bakker: hij is het hart van de straat."], ["Cena inicial", "Percurso no passado", "Motivação", "Citação com aspas", "Fecho"], 120, "Retrato.", ["v-portret"]),
  ], diff=5, mins=8)

L(5, "Projeto final: o meu percurso com o neerlandês", "Een reflectieverslag schrijven.",
  ["Escrever um relatório de reflexão sobre a própria aprendizagem"],
  vocab=[V("v-reflectie","reflectie","reflexão","noun","de"), V("v-leerproces","leerproces","processo de aprendizagem","noun","het"),
         V("v-groeien","groeien","crescer","verb"), V("v-afsluiten","afsluiten","concluir|encerrar","verb"),
         V("v-dankbaar","dankbaar","grato","adjective")],
  ex=[("In deze reflectie kijk ik terug op mijn leerproces.","Nesta reflexão olho para trás para o meu processo de aprendizagem."),("Ik ben enorm gegroeid.","Cresci imenso."),("Met dit project sluit ik de cursus af.","Com este projeto encerro o curso."),("Ik ben dankbaar voor alle hulp.","Estou grato por toda a ajuda.")],
  review=["v-terugblikken","v-keerpunt","v-vooruitgang-boeken","v-achteraf-gezien","v-blijven-oefenen"],
  cefr=C, exs=[
    MA([("reflectie","reflexão"),("leerproces","processo de aprendizagem"),("groeien","crescer"),("afsluiten","concluir"),("dankbaar","grato")], "Reflexão.", ["v-reflectie","v-leerproces","v-groeien","v-afsluiten","v-dankbaar"]),
    TR("pt-nl","Cresci imenso.", ["Ik ben enorm gegroeid","Ik ben heel erg gegroeid"], "groeien → zijn gegroeid.", ["v-groeien"]),
    TR("pt-nl","Com este projeto encerro o curso.", ["Met dit project sluit ik de cursus af","Met dit project rond ik de cursus af"], "afsluiten (separável) + inversão.", ["v-afsluiten"]),
    TR("nl-pt","Ik ben dankbaar voor alle hulp.", ["Estou grato por toda a ajuda","Estou agradecido por toda a ajuda"], "dankbaar voor.", ["v-dankbaar"]),
    AR("leerproces","o processo de aprendizagem","het", "Het proces.", ["v-leerproces"]),
    FE(["Ik","heb","enorm","gegroeid."], 1, "ben", "groeien usa zijn: Ik ben gegroeid.", ["v-groeien"]),
    FE(["Ik","ben","dankbaar","van","de","hulp","van","mijn","docent."], 3, "voor", "dankbaar voor.", ["v-dankbaar"]),
    LI("Achteraf gezien was elke fout een stap vooruit.", ["Achteraf gezien was elke fout een stap vooruit"], "Em retrospetiva, cada erro foi um passo em frente.", "Reflexão.", ["v-achteraf-gezien"]),
    MC("Um bom relatório de reflexão inclui…", ["*o ponto de partida, o que aprendeu, dificuldades, como as superou e próximos passos","só uma lista de palavras|Não.","só elogios ao curso|Não é reflexão."], "Género.", ["v-reflectie"]),
    SW("PROJETO FINAL: Escreva um relatório de reflexão (12–15 frases) sobre o seu percurso com o neerlandês: onde começou, momentos-chave, dificuldades, estratégias que resultaram, o que consegue fazer agora e o seu plano para o futuro.", ["Toen ik begon met Nederlands, kon ik alleen 'hallo' en 'dank je wel' zeggen. Ik woonde net in Rotterdam en voelde me vaak buitengesloten, omdat ik de gesprekken op mijn werk niet kon volgen. Een keerpunt was het moment waarop ik voor het eerst zelf de huisarts belde en alles begreep. De grootste moeilijkheid was voor mij de woordvolgorde: het werkwoord stond altijd op de verkeerde plek. Wat hielp, was elke dag een paar zinnen hardop lezen en mijn fouten opschrijven. Ook het taalcafé in de bibliotheek was heel belangrijk, want daar durfde ik fouten te maken. Inmiddels kan ik vergaderingen volgen, e-mails schrijven aan klanten en mijn mening geven in een discussie. Ik merk dat ik niet meer in mijn hoofd vertaal. Achteraf gezien was elke fout een stap vooruit. Ik ben dankbaar voor mijn collega's, die altijd geduldig bleven. Mijn volgende doel is het Staatsexamen NT2 programma II. Daarna wil ik Nederlandse romans gaan lezen. Kortom: ik ben enorm gegroeid, maar het leerproces gaat gewoon door."], ["Ponto de partida", "Momento-chave", "Dificuldade + estratégia", "O que consegue agora", "Plano futuro", "Variedade gramatical (tempos, subordinadas, conectores)"], 180, "Reflexão final.", ["v-reflectie","v-leerproces","v-groeien"]),
  ], diff=5, mins=8)

W()
