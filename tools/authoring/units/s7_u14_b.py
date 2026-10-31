import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u14")
C = "B2"
# Lições de aprofundamento (10–29): prática de exame (leitura, audição, escrita, oral). Textos fictícios.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

T1 = ("(Texto fictício) Steeds meer Nederlanders werken een of twee dagen per week thuis. Werkgevers zien voordelen: "
      "minder files en lagere kosten voor kantoorruimte. Toch maken sommige managers zich zorgen. Zij vrezen dat het "
      "contact tussen collega's minder wordt en dat nieuwe medewerkers zich minder snel thuis voelen. Daarom kiezen veel "
      "bedrijven voor een middenweg: thuiswerken mag, maar op vaste dagen is iedereen op kantoor.")

L(10, "Leitura: a ideia principal", "Intensief lezen.",
  ["Encontrar a ideia principal de um texto curto"],
  vocab=[X("v-intensief-lezen","intensief lezen","leitura atenta (palavra a palavra)")],
  ex=[("Lees de tekst eerst globaal en daarna intensief.","Lê o texto primeiro de forma global e depois com atenção."),(T1,"(Texto sobre teletrabalho.)")],
  review=["v-hoofdgedachte","v-globaal-lezen","v-kernzin"],
  cefr=C, exs=[
    MA([("intensief lezen","leitura atenta"),("globaal lezen","leitura global"),("hoofdgedachte","ideia principal"),("kernzin","frase-chave")], "Leitura.", ["v-intensief-lezen","v-globaal-lezen","v-hoofdgedachte","v-kernzin"]),
    MC("Lê o texto do exemplo. Qual é a hoofdgedachte?", ["*Thuiswerken heeft voor- en nadelen; veel bedrijven kiezen een middenweg.","Thuiswerken is verboden.|O texto não diz isso.","Er zijn minder files in Nederland.|É só um pormenor."], "Ideia principal.", ["v-hoofdgedachte"]),
    MC("Porque se preocupam alguns gestores (texto)?", ["*Temem menos contacto entre colegas.","Temem custos mais altos.|O texto diz o contrário.","Não confiam nos computadores.|Não está no texto."], "Pormenor.", ["v-intensief-lezen"]),
    MC("Que palavra do texto marca a mudança de perspetiva?", ["*Toch","Steeds|Não.","Daarom|Marca a conclusão."], "Palavra-sinal.", ["v-kernzin"]),
    TR("pt-nl","Lê primeiro o texto de forma global.", ["Lees de tekst eerst globaal","Lees eerst de tekst globaal"], "globaal lezen.", ["v-globaal-lezen"]),
    FB("De ___ van een alinea staat vaak in de eerste zin.", ["kernzin"], "Frase-chave.", ["v-kernzin"], choices=["kernzin","hoofdgedachte","slotzin"], tr="A frase-chave de um parágrafo está muitas vezes na primeira frase."),
    FE(["De","hoofdgedachte","staan","meestal","in","de","inleiding","of","het","slot."], 2, "staat", "Singular: staat.", ["v-hoofdgedachte"]),
    LI("Lees de vraag goed voordat je de tekst leest.", ["Lees de vraag goed voordat je de tekst leest"], "Lê bem a pergunta antes de leres o texto.", "Dica.", ["v-intensief-lezen"]),
  ], diff=5, mins=6)

L(11, "Leitura: procurar informação", "Tussenkopjes gebruiken.",
  ["Encontrar depressa informação num texto longo"],
  vocab=[N("v-tussenkopje","tussenkopje","subtítulo (dentro de um texto)","het","tussenkopjes")],
  ex=[("Gebruik de tussenkopjes om snel de juiste alinea te vinden.","Usa os subtítulos para encontrar depressa o parágrafo certo.")],
  review=["v-zoekend-lezen","v-alinea","v-kernwoorden"],
  cefr=C, exs=[
    MA([("tussenkopje","subtítulo"),("zoekend lezen","leitura de pesquisa"),("alinea","parágrafo"),("kernwoorden","palavras-chave")], "Leitura.", ["v-tussenkopje","v-zoekend-lezen","v-alinea","v-kernwoorden"]),
    MC("Pergunta: «Hoeveel kost een abonnement voor studenten?» Que tussenkopje lês primeiro?", ["*Prijzen en kortingen","Geschiedenis van de club|Não.","Contact|Talvez depois."], "Zoekend lezen.", ["v-tussenkopje","v-zoekend-lezen"]),
    MC("Ao procurar uma data num texto longo, deves…", ["*procurar números e palavras-chave, sem ler tudo","ler tudo palavra a palavra|Demora demasiado.","adivinhar|Não."], "Estratégia.", ["v-zoekend-lezen"]),
    AR("tussenkopje", "subtítulo", "het", "-je → het.", ["v-tussenkopje"]),
    TR("pt-nl","Usa os subtítulos.", ["Gebruik de tussenkopjes"], "Imperativo.", ["v-tussenkopje"]),
    FB("Onderstreep de ___ in de vraag en zoek ze in de tekst.", ["kernwoorden"], "Palavras-chave.", ["v-kernwoorden"], choices=["kernwoorden","tussenkopjes","alinea's"], tr="Sublinha as palavras-chave da pergunta e procura-as no texto."),
    FE(["In","welk","alinea","staat","de","prijs?"], 1, "welke", "de alinea → welke.", ["v-alinea"]),
    LI("Het antwoord staat in de derde alinea, onder het tussenkopje Openingstijden.", ["Het antwoord staat in de derde alinea, onder het tussenkopje Openingstijden","Het antwoord staat in de derde alinea onder het tussenkopje openingstijden"], "A resposta está no terceiro parágrafo, sob o subtítulo Horário.", "Ouvir.", ["v-tussenkopje"]),
  ], diff=4, mins=5)

L(12, "Leitura: palavras-sinal", "Signaalwoorden.",
  ["Usar palavras-sinal para perceber a estrutura"],
  vocab=[N("v-signaalwoord","signaalwoord","palavra-sinal (conector)","het","signaalwoorden")],
  ex=[("«Maar» en «toch» zijn signaalwoorden van tegenstelling.","«Maar» e «toch» são palavras-sinal de contraste."),("«Ten eerste» en «bovendien» geven een opsomming aan.","«Ten eerste» e «bovendien» indicam uma enumeração.")],
  review=["v-opsomming","v-tegenstelling","v-conclusie"],
  cefr=C, exs=[
    MA([("toch","contraste"),("bovendien","enumeração"),("daarom","conclusão"),("bijvoorbeeld","exemplo")], "Signaalwoorden.", ["v-signaalwoord","v-tegenstelling","v-opsomming","v-conclusie"]),
    MC("«Kortom» anuncia…", ["*uma conclusão/resumo","um contraste|Não.","um exemplo|Não."], "Signaalwoord.", ["v-signaalwoord","v-conclusie"]),
    MC("«Daarentegen» indica…", ["*contraste","causa|Não.","tempo|Não."], "Signaalwoord.", ["v-tegenstelling"]),
    AR("signaalwoord", "palavra-sinal", "het", "het woord.", ["v-signaalwoord"]),
    FB("Het plan is goedkoop. ___ is het snel uit te voeren.", ["Bovendien"], "Acrescentar.", ["v-opsomming"], choices=["Bovendien","Toch","Kortom"], tr="O plano é barato. Além disso, executa-se depressa."),
    FB("Het regende hard. ___ gingen we wandelen.", ["Toch"], "Contraste.", ["v-tegenstelling"], choices=["Toch","Daarom","Bovendien"], tr="Chovia muito. Mesmo assim fomos passear."),
    MC("Qual frase usa o signaalwoord corretamente?", ["*Het was duur. Daarom kochten we het niet.","Het was duur. Toch kochten we het niet.|«Toch» indicaria contraste; aqui é consequência."], "Consequência vs contraste.", ["v-signaalwoord"]),
    LI("Ten eerste is het goedkoop, ten tweede is het goed voor het milieu.", ["Ten eerste is het goedkoop, ten tweede is het goed voor het milieu","Ten eerste is het goedkoop ten tweede is het goed voor het milieu"], "Em primeiro lugar é barato, em segundo é bom para o ambiente.", "Enumeração.", ["v-opsomming"]),
  ], diff=4, mins=5)

L(13, "Leitura: causa e efeito", "Oorzaak en gevolg.",
  ["Reconhecer relações de causa e consequência"],
  vocab=[X("v-oorzaak-en-gevolg","oorzaak en gevolg","causa e efeito")],
  ex=[("Door de storm vielen veel bomen om.","Por causa da tempestade caíram muitas árvores."),("Als gevolg van de staking reden er geen treinen.","Em consequência da greve não houve comboios.")],
  review=["v-oorzaak","v-gevolg","v-als-gevolg-van"],
  cefr=C, exs=[
    MA([("oorzaak","causa"),("gevolg","consequência"),("als gevolg van","em consequência de"),("oorzaak en gevolg","causa e efeito")], "Causa.", ["v-oorzaak","v-gevolg","v-als-gevolg-van","v-oorzaak-en-gevolg"]),
    MC("«Door de staking reden er geen treinen.» A causa é…", ["*a greve","os comboios|São a consequência.","não há causa|Há."], "Causa.", ["v-oorzaak"]),
    MC("Qual palavra introduz uma consequência?", ["*waardoor","omdat|Introduz causa.","hoewel|Concessão."], "Conector.", ["v-gevolg"]),
    TR("pt-nl","Em consequência da greve não houve comboios.", ["Als gevolg van de staking reden er geen treinen"], "als gevolg van.", ["v-als-gevolg-van"]),
    FB("Het was glad, ___ er veel ongelukken gebeurden.", ["waardoor"], "Consequência (subordinada).", ["v-gevolg"], choices=["waardoor","omdat","want"], tr="Estava escorregadio, o que fez com que houvesse muitos acidentes."),
    FE(["Als","gevolg","door","de","storm","viel","de","stroom","uit."], 2, "van", "als gevolg van.", ["v-als-gevolg-van"]),
    LI("De oorzaak van het probleem is nog niet bekend.", ["De oorzaak van het probleem is nog niet bekend"], "A causa do problema ainda não é conhecida.", "Ouvir.", ["v-oorzaak"]),
    TR("nl-pt","Wat is oorzaak en wat is gevolg?", ["O que é causa e o que é efeito?","O que é causa e o que é consequência?"], "Pergunta de exame.", ["v-oorzaak-en-gevolg"]),
  ], diff=4, mins=5)

L(14, "Leitura: armadilhas na escolha múltipla", "Afleiders wegstrepen.",
  ["Eliminar opções erradas em perguntas de escolha múltipla"],
  vocab=[N("v-afleider","afleider","distrator (opção errada plausível)","de","afleiders"), X("v-wegstrepen","wegstrepen","riscar, eliminar","verb")],
  ex=[("Een afleider lijkt op het goede antwoord, maar klopt net niet.","Um distrator parece a resposta certa, mas não está bem."),("Streep eerst de antwoorden weg die zeker fout zijn.","Elimina primeiro as respostas que estão certamente erradas.")],
  review=["v-meerkeuzevraag","v-valkuil"],
  cefr=C, exs=[
    MA([("afleider","distrator"),("wegstrepen","eliminar"),("meerkeuzevraag","pergunta de escolha múltipla"),("valkuil","armadilha")], "Exame.", ["v-afleider","v-wegstrepen","v-meerkeuzevraag","v-valkuil"]),
    MC("Uma armadilha típica: a opção usa as mesmas palavras do texto, mas…", ["*diz algo que o texto não afirma","é sempre a certa|Não.","é mais curta|Irrelevante."], "Afleider.", ["v-afleider"]),
    MC("Texto: «Veel, maar niet alle bedrijven bieden thuiswerken aan.» Qual opção é afleider?", ["*Alle bedrijven bieden thuiswerken aan.","Een deel van de bedrijven biedt thuiswerken aan.|Esta afirmação está de acordo com o texto; não é o distrator."], "«alle» vs «veel».", ["v-afleider"]),
    TR("pt-nl","Elimina primeiro as respostas erradas.", ["Streep eerst de foute antwoorden weg","Streep eerst de verkeerde antwoorden weg"], "Separável.", ["v-wegstrepen"]),
    FB("Woorden als «altijd» en «nooit» zijn vaak een ___.", ["valkuil"], "Armadilha.", ["v-valkuil"], choices=["valkuil","kernzin","tussenkopje"], tr="Palavras como «sempre» e «nunca» são muitas vezes uma armadilha."),
    FE(["Ik","heb","twee","antwoorden","weggestreepd."], 4, "weggestreept.", "streep → -t (kofschip).", ["v-wegstrepen"]),
    LI("Let op: het langste antwoord is niet altijd het goede.", ["Let op: het langste antwoord is niet altijd het goede","Let op het langste antwoord is niet altijd het goede"], "Atenção: a resposta mais longa nem sempre é a certa.", "Dica.", ["v-afleider"]),
    WO("Elimina as respostas.", ["Streep","de","antwoorden","weg"], "Separável.", ["v-wegstrepen"]),
  ], diff=4, mins=5)

L(15, "Leitura: objetivo do texto", "Het tekstdoel.",
  ["Identificar se um texto informa, convence, diverte ou incentiva a agir"],
  vocab=[N("v-tekstdoel","tekstdoel","objetivo do texto","het")],
  ex=[("Het tekstdoel van een reclame is overtuigen.","O objetivo de um anúncio é convencer."),("Een handleiding wil je activeren: je moet iets doen.","Um manual quer que ages: tens de fazer algo.")],
  review=["v-betoog","v-overtuigen","v-drogreden"],
  cefr=C, exs=[
    MA([("informeren","informar"),("overtuigen","convencer"),("amuseren","divertir"),("activeren","levar a agir")], "Tekstdoelen.", ["v-tekstdoel","v-overtuigen"]),
    MC("Uma notícia sobre um acidente: tekstdoel?", ["*informeren","amuseren|Não.","activeren|Não."], "Objetivo.", ["v-tekstdoel"]),
    MC("Um betoog contra o fogo de artifício: tekstdoel?", ["*overtuigen","informeren apenas|Tem opinião.","amuseren|Não."], "Objetivo.", ["v-betoog","v-tekstdoel"]),
    MC("Uma receita: tekstdoel?", ["*activeren (instruir para agir)","overtuigen|Não.","amuseren|Não."], "Objetivo.", ["v-tekstdoel"]),
    MC("«Iedereen doet het, dus het is goed.» é um exemplo de…", ["*drogreden","bom argumento|Não.","conclusão neutra|Não."], "Falácia.", ["v-drogreden"]),
    AR("tekstdoel", "objetivo do texto", "het", "het doel.", ["v-tekstdoel"]),
    FE(["Het","tekstdoel","van","dit","artikel","zijn","informeren."], 5, "is", "Singular: is.", ["v-tekstdoel"]),
    LI("Wat wil de schrijver met deze tekst bereiken?", ["Wat wil de schrijver met deze tekst bereiken","Wat wil de schrijver met deze tekst bereiken?"], "O que quer o autor alcançar com este texto?", "Pergunta de exame.", ["v-tekstdoel"]),
  ], diff=4, mins=5)

L(16, "Audição: os pontos principais", "Hoofdpunten noteren.",
  ["Anotar os pontos principais enquanto ouves"],
  vocab=[N("v-hoofdpunten","hoofdpunten","pontos principais","de")],
  ex=[("Noteer tijdens het luisteren alleen de hoofdpunten.","Enquanto ouves, anota só os pontos principais.")],
  review=["v-aantekeningen","v-fragment","v-spreker"],
  cefr=C, exs=[
    MA([("hoofdpunten","pontos principais"),("aantekeningen","apontamentos"),("fragment","excerto"),("spreker","orador")], "Audição.", ["v-hoofdpunten","v-aantekeningen","v-fragment","v-spreker"]),
    MC("Ao ouvir um excerto, deves anotar…", ["*palavras-chave e números","frases completas|Demora demasiado.","nada|Arriscado."], "Estratégia.", ["v-hoofdpunten","v-aantekeningen"]),
    LI("De gemeente gaat drie dingen doen: meer fietspaden aanleggen, het parkeren duurder maken en de bus vaker laten rijden.", ["De gemeente gaat drie dingen doen: meer fietspaden aanleggen, het parkeren duurder maken en de bus vaker laten rijden","De gemeente gaat drie dingen doen meer fietspaden aanleggen het parkeren duurder maken en de bus vaker laten rijden"], "A câmara vai fazer três coisas: mais ciclovias, estacionamento mais caro e mais autocarros.", "Excerto (fictício).", ["v-hoofdpunten"]),
    MC("Do excerto acima, qual NÃO é um hoofdpunt?", ["*Gratis parkeren in het centrum|O contrário: mais caro.","Meer fietspaden|É.","Vaker de bus|É."], "Compreensão.", ["v-hoofdpunten"]),
    TR("pt-nl","Anota só os pontos principais.", ["Noteer alleen de hoofdpunten","Schrijf alleen de hoofdpunten op"], "hoofdpunten.", ["v-hoofdpunten"]),
    FB("Na het ___ krijg je twee vragen.", ["fragment"], "Excerto.", ["v-fragment"], choices=["fragment","hoofdpunt","spreker"], tr="Depois do excerto recebes duas perguntas."),
    FE(["De","spreker","noemen","drie","hoofdpunten."], 2, "noemt", "Singular: noemt.", ["v-spreker"]),
    LI("Kort samengevat: we moeten minder auto rijden.", ["Kort samengevat: we moeten minder auto rijden","Kort samengevat we moeten minder auto rijden"], "Resumindo: temos de andar menos de carro.", "Sinal de conclusão.", ["v-hoofdpunten"]),
  ], diff=4, mins=5)

L(17, "Audição: a intenção do falante", "Intentie en toon.",
  ["Perceber a intenção por trás do que se diz"],
  vocab=[N("v-intentie","intentie","intenção","de","intenties")],
  ex=[("Wat is de intentie van de spreker: waarschuwen of geruststellen?","Qual é a intenção do orador: avisar ou tranquilizar?")],
  review=["v-toon","v-ironie","v-bedoelen-spreker"],
  cefr=C, exs=[
    MA([("intentie","intenção"),("toon","tom"),("ironie","ironia"),("wat bedoelt de spreker?","o que quer dizer o orador?")], "Intenção.", ["v-intentie","v-toon","v-ironie","v-bedoelen-spreker"]),
    MC("«Je kunt natuurlijk ook gewoon op tijd komen…» A intenção é…", ["*criticar de forma indireta","elogiar|Não.","informar o horário|Não."], "Intenção.", ["v-intentie"]),
    MC("«Maakt u zich geen zorgen, het is een kleine ingreep.» A intenção é…", ["*tranquilizar","avisar de perigo|Não.","vender algo|Não."], "Intenção.", ["v-intentie"]),
    MC("«Ik zou daar maar niet te lang wachten.» A intenção é…", ["*aconselhar/avisar","convidar|Não.","agradecer|Não."], "Intenção.", ["v-intentie"]),
    TR("pt-nl","Qual é a intenção do orador?", ["Wat is de intentie van de spreker?","Wat is de intentie van de spreker","Wat bedoelt de spreker?"], "intentie.", ["v-intentie"]),
    FB("Aan zijn ___ hoorde ik dat hij boos was.", ["toon"], "Tom.", ["v-toon"], choices=["toon","intentie","ironie"], tr="Pelo tom percebi que ele estava zangado."),
    FE(["Het","intentie","was","goed."], 0, "De", "de intentie.", ["v-intentie"]),
    LI("Nou, dat heb je weer handig gedaan.", ["Nou, dat heb je weer handig gedaan","Nou dat heb je weer handig gedaan"], "Pois, fizeste isso com muito jeito (ironia).", "Ironia.", ["v-ironie"]),
  ], diff=5, mins=5)

L(18, "Audição: números e tendências", "Een stijgende lijn.",
  ["Compreender dados e tendências ditos oralmente"],
  vocab=[X("v-stijgende-lijn","een stijgende lijn","uma tendência de subida")],
  ex=[("Het aantal fietsers laat een stijgende lijn zien.","O número de ciclistas mostra uma tendência de subida."),("In 2020 bereikte het aantal een dieptepunt.","Em 2020 o número atingiu um mínimo.")],
  review=["v-stijgen","v-dalen","v-piek","v-dieptepunt","v-grafiek"],
  cefr=C, exs=[
    MA([("een stijgende lijn","tendência de subida"),("piek","pico"),("dieptepunt","ponto mais baixo"),("dalen","descer")], "Tendências.", ["v-stijgende-lijn","v-piek","v-dieptepunt","v-dalen"]),
    LI("Tussen 2015 en 2019 steeg het aantal bezoekers van 2000 naar 5000.", ["Tussen 2015 en 2019 steeg het aantal bezoekers van 2000 naar 5000","Tussen 2015 en 2019 steeg het aantal bezoekers van tweeduizend naar vijfduizend"], "Entre 2015 e 2019 o número de visitantes subiu de 2000 para 5000.", "Dados (fictícios).", ["v-stijgen"]),
    MC("No excerto acima, a tendência é…", ["*een stijgende lijn","een dalende lijn|Não.","stabiel|Não."], "Compreensão.", ["v-stijgende-lijn"]),
    TR("pt-nl","Em 2020 o número atingiu um mínimo.", ["In 2020 bereikte het aantal een dieptepunt","In 2020 bereikte het aantal zijn dieptepunt"], "dieptepunt.", ["v-dieptepunt"]),
    FB("Het aantal werklozen is vorig jaar ___.", ["gedaald"], "Particípio.", ["v-dalen"], choices=["gedaald","gedaalt","gestegen"], tr="O número de desempregados desceu no ano passado."),
    FE(["De","prijzen","zijn","flink","gestijgd."], 4, "gestegen.", "Particípio irregular: gestegen.", ["v-stijgen"]),
    LI("In juli was er een piek; daarna daalde het aantal weer.", ["In juli was er een piek; daarna daalde het aantal weer","In juli was er een piek, daarna daalde het aantal weer"], "Em julho houve um pico; depois o número voltou a descer.", "Tendência.", ["v-piek"]),
    WO("Mostra uma tendência de subida.", ["Het","laat","een","stijgende","lijn","zien"], "Ordem.", ["v-stijgende-lijn"]),
  ], diff=4, mins=5)

L(19, "Escrita: planear antes de escrever", "Een kladversie.",
  ["Planear um texto e escrever um rascunho"],
  vocab=[N("v-kladversie","kladversie","rascunho","de")],
  ex=[("Schrijf eerst een korte kladversie met je hoofdpunten.","Escreve primeiro um rascunho curto com os pontos principais.")],
  review=["v-opdracht","v-woordenaantal","v-hoofdpunten"],
  cefr=C, exs=[
    MA([("kladversie","rascunho"),("opdracht","enunciado/tarefa"),("aantal woorden","número de palavras"),("hoofdpunten","pontos principais")], "Escrita.", ["v-kladversie","v-opdracht","v-woordenaantal","v-hoofdpunten"]),
    MC("Primeiro passo numa tarefa de escrita:", ["*Ler a opdracht e sublinhar o que tens de incluir","Começar logo a escrever|Arriscas esquecer partes.","Contar palavras|Depois."], "Ordem.", ["v-opdracht"]),
    TR("pt-nl","Escreve primeiro um rascunho.", ["Schrijf eerst een kladversie","Maak eerst een kladversie"], "kladversie.", ["v-kladversie"]),
    TR("pt-nl","Lê bem a tarefa.", ["Lees de opdracht goed","Lees de opdracht goed door"], "opdracht.", ["v-opdracht"]),
    FB("Let op het ___: niet te kort en niet te lang.", ["aantal woorden"], "Limite.", ["v-woordenaantal"], choices=["aantal woorden","tussenkopje","kladversie"], tr="Atenção ao número de palavras: nem curto nem longo demais."),
    FE(["In","de","opdracht","staan","vier","punt","die","je","moet","noemen."], 5, "punten", "Plural: punten.", ["v-opdracht"]),
    SW("Opdracht: escreva ao vizinho a pedir que não faça barulho depois das 22h (3 pontos: problema, pedido, proposta). Faça primeiro uma kladversie com 3 tópicos e depois o texto (50–70 palavras).", ["Klad: muziek na 22.00 / zachter na 22.00 / nummer uitwisselen\n\nBeste buurman,\nDe laatste weken hoor ik vaak tot laat harde muziek. Ik moet vroeg op voor mijn werk. Zou u na tien uur de muziek wat zachter willen zetten? Als het eens een feestje wordt, laat het me gerust weten; dan ruilen we telefoonnummers.\nGroeten, Inês (nr. 12)"], ["Kladversie","3 pontos","Tom simpático"], 60, "Planear (fictício).", ["v-kladversie"]),
    LI("Neem vijf minuten om je tekst te plannen.", ["Neem vijf minuten om je tekst te plannen","Neem 5 minuten om je tekst te plannen"], "Reserva cinco minutos para planear o texto.", "Dica.", ["v-kladversie"]),
  ], diff=4, mins=7)

L(20, "Escrita: rever o texto", "Herlezen en controleren.",
  ["Reler e corrigir o próprio texto"],
  vocab=[X("v-herlezen","herlezen","reler","verb"), N("v-spellingscontrole","spellingscontrole","verificação ortográfica","de")],
  ex=[("Herlees je tekst altijd voordat je hem inlevert.","Relê sempre o texto antes de o entregar."),("De spellingscontrole vindt niet alle fouten.","A verificação ortográfica não encontra todos os erros.")],
  review=["v-nakijken","v-foutloos"],
  cefr=C, exs=[
    MA([("herlezen","reler"),("spellingscontrole","verificação ortográfica"),("nakijken","rever/corrigir"),("foutloos","sem erros")], "Rever.", ["v-herlezen","v-spellingscontrole","v-nakijken","v-foutloos"]),
    MC("Ao reler, verifica sobretudo…", ["*verbo em 2.º lugar, verbo no fim das subordinadas, de/het e -d/-t","só a letra bonita|Não.","nada|Não."], "Lista de controlo.", ["v-herlezen"]),
    MC("Porque é que a verificação ortográfica não basta?", ["*«Hij word» não é detetado se a palavra existe noutra forma","Porque não funciona em neerlandês|Funciona.","Porque corrige demais|Não é o problema."], "Limite.", ["v-spellingscontrole"]),
    TR("pt-nl","Relê sempre o texto.", ["Herlees je tekst altijd","Lees je tekst altijd nog een keer"], "herlezen.", ["v-herlezen"]),
    FE(["Hij","word","morgen","dertig."], 1, "wordt", "hij wordt.", ["v-spellingscontrole"]),
    FE(["Ik","heb","de","tekst","herleest."], 4, "herlezen.", "Particípio: herlezen.", ["v-herlezen"]),
    FE(["Gisteren","antwoorde","ik","op","zijn","mail."], 1, "antwoordde", "Passado: antwoord + de.", ["v-nakijken"]),
    LI("Kijk vooral de werkwoorden goed na.", ["Kijk vooral de werkwoorden goed na"], "Verifica sobretudo bem os verbos.", "Dica.", ["v-nakijken"]),
  ], diff=4, mins=5)

L(21, "Escrita: cumprir a tarefa", "Nagaan of alles erin staat.",
  ["Verificar se o texto responde a todos os pontos pedidos"],
  vocab=[X("v-nagaan","nagaan","verificar, confirmar","verb")],
  ex=[("Ga na of je alle punten uit de opdracht hebt genoemd.","Verifica se mencionaste todos os pontos da tarefa.")],
  review=["v-aanhef","v-afsluiting","v-beoordelingscriteria"],
  cefr=C, exs=[
    MA([("nagaan","verificar"),("aanhef","saudação inicial"),("afsluiting","fecho"),("beoordelingscriteria","critérios de avaliação")], "Tarefa.", ["v-nagaan","v-aanhef","v-afsluiting","v-beoordelingscriteria"]),
    MC("A tarefa pede 3 pontos e tu escreveste 2 muito bem. Resultado provável:", ["*perdes pontos por não cumprir a tarefa","nota máxima|Não cumpre.","não faz diferença|Faz."], "Critério.", ["v-beoordelingscriteria"]),
    MC("Aanhef adequada a uma empresa sem nome de contacto:", ["*Geachte heer/mevrouw,","Hoi!|Informal.","Lieve allemaal,|Informal."], "Aanhef.", ["v-aanhef"]),
    TR("pt-nl","Verifica se mencionaste todos os pontos.", ["Ga na of je alle punten hebt genoemd","Ga na of je alle punten genoemd hebt"], "nagaan.", ["v-nagaan"]),
    FB("Een formele brief sluit je af met «Met vriendelijke ___».", ["groet"], "Afsluiting.", ["v-afsluiting"], choices=["groet","groeten","groetjes"], tr="Uma carta formal termina com «Com os melhores cumprimentos»."),
    FE(["Ik","ben","nagegaan","of","alles","klopt."], 1, "heb", "nagaan: «ik heb nagegaan» (verbo transitivo).", ["v-nagaan"]),
    LI("Ik ga even na of de gegevens kloppen.", ["Ik ga even na of de gegevens kloppen"], "Vou só verificar se os dados estão certos.", "Ouvir.", ["v-nagaan"]),
    WO("Verifica tudo.", ["Ga","alles","na"], "Separável.", ["v-nagaan"]),
  ], diff=4, mins=5)

L(22, "Escrita: texto de opinião", "Inleiding, middenstuk en slot.",
  ["Estruturar um texto de opinião curto"],
  vocab=[N("v-alinea-indeling","alinea-indeling","divisão em parágrafos","de")],
  ex=[("Een goede alinea-indeling maakt je tekst overzichtelijk.","Uma boa divisão em parágrafos torna o texto claro.")],
  review=["v-inleiding","v-middenstuk","v-slot-tekst","v-stelling","v-onderbouwen"],
  cefr=C, exs=[
    MA([("inleiding","introdução"),("middenstuk","desenvolvimento"),("alinea-indeling","divisão em parágrafos"),("stelling","tese")], "Estrutura.", ["v-inleiding","v-middenstuk","v-alinea-indeling","v-stelling"]),
    MC("Onde pões a tua opinião principal?", ["*na inleiding, e repetes no slot","só no meio|Pouco claro.","em lado nenhum|Não."], "Estrutura.", ["v-inleiding","v-stelling"]),
    MC("No middenstuk, cada parágrafo deve ter…", ["*um argumento, com exemplo","três temas diferentes|Confuso.","só uma frase|Pouco desenvolvido."], "Parágrafo.", ["v-middenstuk","v-onderbouwen"]),
    TR("pt-nl","Fundamenta a tua opinião com exemplos.", ["Onderbouw je mening met voorbeelden","Onderbouw jouw mening met voorbeelden"], "onderbouwen.", ["v-onderbouwen"]),
    FB("Mijn ___ is: de supermarkt moet op zondag dicht.", ["stelling"], "Tese.", ["v-stelling"], choices=["stelling","inleiding","alinea-indeling"], tr="A minha tese é: o supermercado deve fechar ao domingo."),
    FE(["Ten","slotte","wil","ik","benadrukt","dat","dit","belangrijk","is."], 4, "benadrukken", "Depois de willen: infinitivo.", ["v-slot-tekst"]),
    SW("Stelling: «Iedereen in Nederland moet Nederlands leren.» Escreva 100–120 palavras: inleiding (opinião), 2 argumentos com exemplos, slot.", ["Volgens mij is het belangrijk dat iedereen die in Nederland woont Nederlands leert. Ten eerste is de taal de sleutel tot werk. Veel vacatures vragen om Nederlands, ook als het werk zelf praktisch is. Ten tweede maakt de taal sociaal contact makkelijker. Wie met de buren kan praten, voelt zich sneller thuis. Natuurlijk is het niet voor iedereen even makkelijk; ouderen of mensen met weinig tijd hebben extra hulp nodig. Daarom vind ik dat cursussen betaalbaar moeten zijn. Kortom: Nederlands leren is niet alleen een plicht, maar vooral een kans."], ["Inleiding","2 argumentos","Nuance","Slot"], 110, "Texto de opinião.", ["v-alinea-indeling"]),
  ], diff=5, mins=8)

L(23, "Oral: o que é avaliado", "Spreekvaardigheid.",
  ["Conhecer os critérios típicos de uma prova oral"],
  vocab=[N("v-spreekvaardigheid","spreekvaardigheid","expressão oral","de")],
  ex=[("Bij spreekvaardigheid let men op inhoud, woordenschat, grammatica en uitspraak.","Na expressão oral avalia-se conteúdo, vocabulário, gramática e pronúncia.")],
  review=["v-uitspraak","v-vloeiend","v-woordenschat","v-spreektijd"],
  cefr=C, exs=[
    MA([("spreekvaardigheid","expressão oral"),("uitspraak","pronúncia"),("vloeiend","fluente"),("woordenschat","vocabulário")], "Oral.", ["v-spreekvaardigheid","v-uitspraak","v-vloeiend","v-woordenschat"]),
    MC("Numa prova oral, é melhor…", ["*responder à pergunta toda, mesmo com pequenos erros","falar pouco para não errar|Perdes pontos de conteúdo.","decorar um texto que não responde|Não."], "Estratégia.", ["v-spreekvaardigheid"]),
    MC("Ficaste sem a palavra «oplader». Dizes:", ["*Ik bedoel dat ding waarmee je je telefoon oplaadt.","(silêncio)|Perdes tempo.","Charger!|Evita mudar de língua."], "Compensar.", ["v-spreekvaardigheid","v-omschrijven"]),
    TR("pt-nl","A minha pronúncia melhorou muito.", ["Mijn uitspraak is veel beter geworden","Mijn uitspraak is flink verbeterd"], "uitspraak.", ["v-uitspraak"]),
    FB("Probeer ___ te praten, zonder lange pauzes.", ["vloeiend"], "Fluente.", ["v-vloeiend"], choices=["vloeiend","foutloos","snel"], tr="Tenta falar de forma fluente, sem pausas longas."),
    FE(["Het","spreekvaardigheid","is","mijn","sterkste","onderdeel."], 0, "De", "-heid → de.", ["v-spreekvaardigheid"]),
    LI("U heeft twee minuten spreektijd. U mag beginnen.", ["U heeft twee minuten spreektijd. U mag beginnen","U heeft twee minuten spreektijd u mag beginnen"], "Tem dois minutos para falar. Pode começar.", "Instrução de exame.", ["v-spreektijd"]),
    SW("Responda (oral ou escrito, 4–5 frases): «Vertel over een moment waarop je trots was.»", ["Ik was erg trots toen ik mijn eerste sollicitatiegesprek in het Nederlands had. Ik was zenuwachtig, maar ik had me goed voorbereid. Ik kon alle vragen beantwoorden en heb zelfs een grapje gemaakt. Een week later kreeg ik de baan. Toen wist ik: mijn Nederlands is echt goed genoeg."], ["Situação","Sentimento","Resultado"], 50, "Resposta oral.", ["v-spreekvaardigheid"]),
  ], diff=4, mins=6)

L(24, "Oral: dar conselhos", "Advies geven.",
  ["Dar conselhos de forma clara e educada"],
  vocab=[X("v-advies-geven","advies geven","aconselhar","verb"), X("v-afraden","afraden","desaconselhar","verb")],
  ex=[("Als ik jou was, zou ik eerst met je leidinggevende praten.","Se eu fosse a ti, falava primeiro com o teu chefe."),("Ik zou je aanraden om op tijd te beginnen.","Aconselhava-te a começar a tempo.")],
  review=["v-aanraden"],
  cefr=C, exs=[
    MA([("advies geven","aconselhar"),("aanraden","recomendar"),("afraden","desaconselhar"),("als ik jou was","se eu fosse a ti")], "Conselhos.", ["v-advies-geven","v-aanraden","v-afraden"]),
    MC("Pergunta de exame: «Uw vriend wil naar Nederland verhuizen. Geef advies.» Melhor início:", ["*Als ik jou was, zou ik eerst een cursus Nederlands volgen.","Je moet!|Demasiado brusco.","Weet ik niet.|Não cumpre."], "Conselho.", ["v-advies-geven"]),
    TR("pt-nl","Se eu fosse a ti, falava com o chefe.", ["Als ik jou was, zou ik met de baas praten","Als ik jou was, zou ik met je leidinggevende praten","Als ik jou was zou ik met de baas praten"], "zou + inf.", ["v-advies-geven"]),
    TR("pt-nl","Desaconselho-te a comprar agora.", ["Ik raad je af om nu te kopen","Ik raad je aan om nu niet te kopen"], "afraden.", ["v-afraden"]),
    FB("Ik zou je ___ om een makelaar te nemen.", ["aanraden"], "Recomendar.", ["v-aanraden"], choices=["aanraden","afraden","advies"], tr="Recomendava-te contratar um agente."),
    FE(["Als","ik","jou","was,","zal","ik","het","doen."], 4, "zou", "Irreal: zou.", ["v-advies-geven"]),
    LI("Mijn advies is: begin klein en bouw het langzaam op.", ["Mijn advies is: begin klein en bouw het langzaam op","Mijn advies is begin klein en bouw het langzaam op"], "O meu conselho: começa pequeno e vai construindo.", "Ouvir.", ["v-advies-geven"]),
    WO("Aconselho-te isso.", ["Ik","raad","je","dat","aan"], "Separável.", ["v-aanraden"]),
  ], diff=4, mins=5)

L(25, "Oral: comparar e escolher", "Voor- en nadelen afwegen.",
  ["Comparar duas opções e justificar a escolha"],
  vocab=[X("v-tegen-elkaar-afwegen","tegen elkaar afwegen","pesar uma contra a outra","verb")],
  ex=[("Als je de voor- en nadelen tegen elkaar afweegt, is de trein beter.","Se pesares as vantagens e desvantagens, o comboio é melhor."),("Ik kies voor optie A, omdat die goedkoper is.","Escolho a opção A porque é mais barata.")],
  review=["v-voor-en-nadelen","v-afwegen","v-voordeel","v-nadeel"],
  cefr=C, exs=[
    MA([("tegen elkaar afwegen","pesar"),("voordeel","vantagem"),("nadeel","desvantagem"),("de voor- en nadelen","os prós e contras")], "Comparar.", ["v-tegen-elkaar-afwegen","v-voordeel","v-nadeel","v-voor-en-nadelen"]),
    MC("Tarefa: «Kies tussen een cursus online of in een klaslokaal. Leg uit waarom.» Boa estrutura:", ["*escolha → 2 razões → 1 desvantagem da opção escolhida → conclusão","só «online»|Falta justificar.","listar tudo sem escolher|Não cumpre."], "Estrutura.", ["v-tegen-elkaar-afwegen"]),
    TR("pt-nl","Escolho a opção A porque é mais barata.", ["Ik kies voor optie A, omdat die goedkoper is","Ik kies optie A, omdat die goedkoper is","Ik kies voor optie A omdat die goedkoper is"], "kiezen voor.", ["v-voordeel"]),
    TR("pt-nl","Uma desvantagem é que demora mais.", ["Een nadeel is dat het langer duurt"], "nadeel.", ["v-nadeel"]),
    FB("Het grootste ___ van online leren is de flexibiliteit.", ["voordeel"], "Vantagem.", ["v-voordeel"], choices=["voordeel","nadeel","afweging"], tr="A maior vantagem de aprender online é a flexibilidade."),
    FE(["Ik","kies","in","de","trein,","want","die","is","sneller."], 2, "voor", "kiezen voor.", ["v-tegen-elkaar-afwegen"]),
    LI("Alles tegen elkaar afwegend, kies ik toch voor de fiets.", ["Alles tegen elkaar afwegend, kies ik toch voor de fiets","Alles tegen elkaar afwegend kies ik toch voor de fiets"], "Pesando tudo, escolho mesmo assim a bicicleta.", "Conclusão.", ["v-tegen-elkaar-afwegen"]),
    SW("Compare (4–5 frases): viver no centro da cidade ou numa aldeia. Escolha e justifique.", ["Wonen in het centrum heeft als voordeel dat alles dichtbij is. Een nadeel is dat het duur en druk is. In een dorp is het rustiger en goedkoper, maar je hebt vaak een auto nodig. Als ik alles tegen elkaar afweeg, kies ik voor een dorp, omdat ik rust belangrijker vind dan gemak."], ["2 opções","Vantagem/desvantagem","Escolha"], 50, "Comparar.", ["v-tegen-elkaar-afwegen"]),
  ], diff=4, mins=6)

L(26, "Gerir o tempo no exame", "Tijdsdruk.",
  ["Distribuir bem o tempo numa prova"],
  vocab=[N("v-tijdsdruk","tijdsdruk","pressão do tempo","de"), X("v-tijd-indelen","je tijd indelen","distribuir o tempo","verb")],
  ex=[("Onder tijdsdruk maak je sneller fouten.","Sob pressão do tempo erras mais depressa."),("Deel je tijd goed in: blijf niet te lang hangen bij één vraag.","Distribui bem o tempo: não fiques preso numa pergunta.")],
  review=["v-examenvraag","v-de-draad-kwijt"],
  cefr=C, exs=[
    MA([("tijdsdruk","pressão do tempo"),("je tijd indelen","distribuir o tempo"),("examenvraag","pergunta de exame"),("de draad kwijt zijn","perder o fio")], "Tempo.", ["v-tijdsdruk","v-tijd-indelen","v-examenvraag","v-de-draad-kwijt"]),
    MC("Uma pergunta está a demorar demasiado. O que fazes?", ["*Marcas, passas à seguinte e voltas no fim","Ficas até a resolver|Perdes tempo para as outras.","Desistes do exame|Não."], "Estratégia.", ["v-tijd-indelen"]),
    TR("pt-nl","Distribui bem o tempo.", ["Deel je tijd goed in","Verdeel je tijd goed"], "Separável.", ["v-tijd-indelen"]),
    TR("pt-nl","Sob pressão erro mais.", ["Onder tijdsdruk maak ik meer fouten","Onder druk maak ik meer fouten"], "tijdsdruk.", ["v-tijdsdruk"]),
    FB("Ik ___ mijn tijd altijd slecht in.", ["deel"], "Separável.", ["v-tijd-indelen"], choices=["deel","indeel","delen"], tr="Distribuo sempre mal o meu tempo."),
    FE(["Hij","heeft","zijn","tijd","slecht","ingedeelt."], 5, "ingedeeld.", "Particípio: ingedeeld.", ["v-tijd-indelen"]),
    LI("U heeft nog tien minuten.", ["U heeft nog tien minuten","U heeft nog 10 minuten"], "Ainda tem dez minutos.", "Aviso.", ["v-tijdsdruk"]),
    WO("Distribui o tempo.", ["Deel","je","tijd","in"], "Separável.", ["v-tijd-indelen"]),
  ], diff=3, mins=5)

L(27, "Nervos no exame", "Examenvrees.",
  ["Falar de ansiedade e estratégias para a controlar"],
  vocab=[N("v-examenvrees","examenvrees","ansiedade de exame","de")],
  ex=[("Veel mensen hebben last van examenvrees.","Muitas pessoas sofrem de ansiedade de exame."),("Rustig ademhalen helpt als je zenuwachtig bent.","Respirar calmamente ajuda quando estás nervoso.")],
  review=["v-zenuwachtig","v-rustig-ademhalen","v-zelfvertrouwen","v-rustig-blijven"],
  cefr=C, exs=[
    MA([("examenvrees","ansiedade de exame"),("zenuwachtig","nervoso"),("rustig ademhalen","respirar calmamente"),("zelfvertrouwen","autoconfiança")], "Nervos.", ["v-examenvrees","v-zenuwachtig","v-rustig-ademhalen","v-zelfvertrouwen"]),
    MC("Uma estratégia útil contra examenvrees:", ["*fazer oefenexamens em condições reais antes","não dormir na véspera|Piora.","não comer nada|Piora."], "Estratégia.", ["v-examenvrees"]),
    TR("pt-nl","Muitas pessoas sofrem de ansiedade de exame.", ["Veel mensen hebben last van examenvrees"], "last hebben van.", ["v-examenvrees"]),
    TR("pt-nl","Respira calmamente e começa.", ["Adem rustig en begin","Haal rustig adem en begin"], "Imperativo.", ["v-rustig-ademhalen"]),
    FB("Door goed te oefenen krijg je meer ___.", ["zelfvertrouwen"], "Confiança.", ["v-zelfvertrouwen"], choices=["zelfvertrouwen","examenvrees","tijdsdruk"], tr="Praticando bem ganhas mais confiança."),
    FE(["Ik","ben","heel","zenuwachtige."], 3, "zenuwachtig.", "Predicativo: sem -e.", ["v-zenuwachtig"]),
    LI("Een beetje spanning is normaal en helpt je zelfs om scherp te blijven.", ["Een beetje spanning is normaal en helpt je zelfs om scherp te blijven"], "Um pouco de tensão é normal e até te ajuda a ficar atento.", "Perspetiva.", ["v-examenvrees"]),
    MC("Branco total numa pergunta oral. Dizes:", ["*Mag ik even nadenken?","(sair da sala)|Não.","Ik weet niks.|Desistes cedo."], "Ganhar tempo.", ["v-rustig-blijven"]),
  ], diff=3, mins=5)

L(28, "Exame de treino", "Een oefenexamen.",
  ["Fazer um pequeno exame de treino misto"],
  vocab=[N("v-oefenexamen","oefenexamen","exame de treino","het","oefenexamens"), X("v-gokken","gokken","adivinhar (ao acaso)","verb")],
  ex=[("Maak een paar oefenexamens voordat je het echte examen doet.","Faz alguns exames de treino antes do exame verdadeiro."),("Weet je het niet? Streep weg en gok dan.","Não sabes? Elimina e depois arrisca.")],
  review=["v-afleider","v-signaalwoord","v-hoofdpunten","v-intentie"],
  cefr=C, exs=[
    AR("oefenexamen", "exame de treino", "het", "het examen.", ["v-oefenexamen"]),
    MC("(Leitura) «Hoewel de prijzen stegen, kochten meer mensen een fiets.» O que aconteceu?", ["*As vendas subiram apesar dos preços.","As vendas desceram.|«meer mensen» = mais.","Os preços desceram.|«stegen» = subiram."], "Hoewel = concessão.", ["v-signaalwoord"]),
    MC("(Vocabulário) «aanschaffen» =", ["*adquirir","alugar|Não.","vender|Não."], "Revisão.", ["v-oefenexamen"]),
    FB("(Gramática) Ik weet niet of hij morgen ___.", ["komt"], "Verbo no fim.", ["v-oefenexamen"], choices=["komt","kom","komen"], tr="Não sei se ele vem amanhã."),
    FE(["De","resultaten","van","het","onderzoek","is","duidelijk."], 5, "zijn", "Sujeito plural: resultaten → zijn.", ["v-oefenexamen"]),
    LI("Voor de duidelijkheid: het examen begint om negen uur precies.", ["Voor de duidelijkheid: het examen begint om negen uur precies","Voor de duidelijkheid het examen begint om negen uur precies","Voor de duidelijkheid: het examen begint om 9 uur precies"], "Para que fique claro: o exame começa às nove em ponto.", "(Audição)", ["v-hoofdpunten"]),
    MC("Não sabes a resposta numa pergunta sem penalização. Fazes:", ["*Eliminas o que puderes e gokt","Deixas em branco|Perdes a hipótese.","Escolhes sempre a A|Sem critério."], "Estratégia.", ["v-gokken","v-afleider"]),
    TR("pt-nl","Faço um exame de treino todas as semanas.", ["Ik maak elke week een oefenexamen","Elke week maak ik een oefenexamen","Ik doe elke week een oefenexamen"], "oefenexamen.", ["v-oefenexamen"]),
  ], diff=5, mins=6)

L(29, "Teste final integrado", "De eindtoets.",
  ["Testar leitura, audição, gramática e escrita em conjunto"],
  vocab=[N("v-eindtoets","eindtoets","teste final","de")],
  ex=[("Deze eindtoets combineert alle vaardigheden.","Este teste final combina todas as competências.")],
  review=["v-leesvaardigheid","v-luistervaardigheid","v-schrijfvaardigheid","v-spreekvaardigheid","v-tekstdoel","v-oorzaak-en-gevolg"],
  cefr=C, exs=[
    MA([("leesvaardigheid","leitura"),("luistervaardigheid","audição"),("schrijfvaardigheid","escrita"),("spreekvaardigheid","oral")], "As quatro competências.", ["v-leesvaardigheid","v-luistervaardigheid","v-schrijfvaardigheid","v-spreekvaardigheid"]),
    MC("(Leitura) «Doordat de bibliotheek langer open is, komen er meer studenten.» Oorzaak?", ["*O horário mais longo","Os estudantes|São o efeito.","Não há causa|Há."], "Causa.", ["v-oorzaak-en-gevolg"]),
    MC("(Leitura) Um folheto: «Meld je vandaag nog aan en krijg 20% korting!» Tekstdoel?", ["*activeren/overtuigen","informeren neutro|Tem apelo.","amuseren|Não."], "Objetivo.", ["v-tekstdoel"]),
    LI("Wegens werkzaamheden rijden er dit weekend geen treinen tussen Utrecht en Arnhem.", ["Wegens werkzaamheden rijden er dit weekend geen treinen tussen Utrecht en Arnhem"], "Devido a obras não há comboios entre Utrecht e Arnhem este fim de semana.", "(Audição)", ["v-luistervaardigheid"]),
    FE(["Wegens","de","werkzaamheden","rijdt","er","geen","treinen."], 3, "rijden", "Sujeito plural (treinen): rijden.", ["v-eindtoets"]),
    FB("Hij zei dat hij het niet had ___ doen.", ["kunnen"], "Duplo infinitivo.", ["v-eindtoets"], choices=["kunnen","gekund","kan"], tr="Ele disse que não o tinha podido fazer."),
    SW("(Escrita) Escreva um e-mail formal (60–80 palavras) à escola de línguas: terminou o curso B2, agradece, pede um certificado e pergunta se há um curso C1.", ["Geachte heer, mevrouw,\n\nAfgelopen vrijdag heb ik de cursus Nederlands op B2-niveau afgerond. Ik wil u hartelijk bedanken voor de goede lessen en de prettige begeleiding. Graag ontvang ik een certificaat van deelname. Daarnaast wil ik graag weten of u ook een cursus op C1-niveau aanbiedt, en zo ja, wanneer die begint.\n\nMet vriendelijke groet,\nCarla Ferreira"], ["Agradecimento","Pedido","Pergunta","Registo formal"], 70, "Escrita (fictícia).", ["v-eindtoets"]),
  ], diff=5, mins=8)

W()
