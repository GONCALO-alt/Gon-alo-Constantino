import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u15")
C = "B1-B2"
# Lições de aprofundamento (10–25): escrita avançada.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "A pergunta central", "Hoofdvraag en deelvragen.",
  ["Formular a pergunta central e subperguntas de um texto"],
  vocab=[N("v-hoofdvraag","hoofdvraag","pergunta central","de","hoofdvragen"), N("v-deelvraag","deelvraag","subpergunta","de","deelvragen")],
  ex=[("De hoofdvraag van mijn tekst is: moet thuiswerken een recht worden?","A pergunta central do meu texto é: o teletrabalho deve ser um direito?"),("Ik beantwoord eerst drie deelvragen.","Primeiro respondo a três subperguntas.")],
  review=["v-betoog","v-schrijfplan"],
  cefr=C, exs=[
    MA([("hoofdvraag","pergunta central"),("deelvraag","subpergunta"),("betoog","texto argumentativo"),("schrijfplan","plano de escrita")], "Planear.", ["v-hoofdvraag","v-deelvraag","v-betoog","v-schrijfplan"]),
    MC("Hoofdvraag: «Is fietsen in de stad veilig genoeg?» Uma boa deelvraag:", ["*Hoeveel fietsongelukken gebeuren er per jaar in de stad?","Wat is je lievelingskleur?|Irrelevante.","Is fietsen leuk?|Vaga."], "Relevância.", ["v-deelvraag"]),
    TR("pt-nl","A pergunta central é…", ["De hoofdvraag is","De centrale vraag is"], "hoofdvraag.", ["v-hoofdvraag"]),
    TR("pt-nl","Primeiro respondo a três subperguntas.", ["Ik beantwoord eerst drie deelvragen","Eerst beantwoord ik drie deelvragen"], "deelvragen.", ["v-deelvraag"]),
    FB("Elke ___ helpt om de hoofdvraag te beantwoorden.", ["deelvraag"], "Subpergunta.", ["v-deelvraag"], choices=["deelvraag","hoofdvraag","betoog"], tr="Cada subpergunta ajuda a responder à pergunta central."),
    FE(["De","hoofdvragen","van","mijn","tekst","is","duidelijk."], 1, "hoofdvraag", "Singular: is.", ["v-hoofdvraag"]),
    SW("Escolha um tema e escreva uma hoofdvraag e três deelvragen.", ["Hoofdvraag: Moeten supermarkten op zondag open zijn?\nDeelvragen: 1. Wat vinden winkelmedewerkers ervan? 2. Wat zijn de voordelen voor klanten? 3. Wat betekent het voor kleine winkels?"], ["1 hoofdvraag","3 deelvragen relevantes"], 25, "Planear.", ["v-hoofdvraag","v-deelvraag"]),
    LI("Een goede hoofdvraag is concreet en te beantwoorden.", ["Een goede hoofdvraag is concreet en te beantwoorden"], "Uma boa pergunta central é concreta e tem resposta possível.", "Dica.", ["v-hoofdvraag"]),
  ], diff=4, mins=5)

L(11, "Começar bem", "Een pakkende opening.",
  ["Usar técnicas para abrir um texto"],
  vocab=[X("v-pakkende-opening","een pakkende opening","uma abertura cativante"), X("v-prikkelende-vraag","een prikkelende vraag","uma pergunta provocadora")],
  ex=[("Begin je tekst met een pakkende opening.","Começa o teu texto com uma abertura cativante."),("Wist u dat de gemiddelde Nederlander meer fietsen heeft dan auto's? — Zo'n prikkelende vraag trekt de aandacht.","Sabia que o neerlandês médio tem mais bicicletas do que carros? — Uma pergunta provocadora assim chama a atenção.")],
  review=["v-anekdote","v-retorische-vraag","v-inleiding"],
  cefr=C, exs=[
    MA([("een pakkende opening","abertura cativante"),("een prikkelende vraag","pergunta provocadora"),("anekdote","episódio"),("retorische vraag","pergunta retórica")], "Abertura.", ["v-pakkende-opening","v-prikkelende-vraag","v-anekdote","v-retorische-vraag"]),
    MC("Qual é a abertura mais cativante para um texto sobre solidão?", ["*Vorige week sprak ik een man van tachtig die al drie dagen met niemand had gepraat.","In deze tekst ga ik het hebben over eenzaamheid.|Fraca.","Eenzaamheid is een woord.|Fraca."], "Anedota.", ["v-anekdote","v-pakkende-opening"]),
    TR("pt-nl","Começa com uma abertura cativante.", ["Begin met een pakkende opening","Begin je tekst met een pakkende opening"], "pakkende.", ["v-pakkende-opening"]),
    TR("pt-nl","Uma pergunta provocadora chama a atenção.", ["Een prikkelende vraag trekt de aandacht"], "de aandacht trekken.", ["v-prikkelende-vraag"]),
    FB("Een goede inleiding trekt de ___ van de lezer.", ["aandacht"], "Colocação.", ["v-pakkende-opening"], choices=["aandacht","opening","vraag"], tr="Uma boa introdução prende a atenção do leitor."),
    FE(["Begin","met","een","pakkend","opening."], 3, "pakkende", "de opening → -e.", ["v-pakkende-opening"]),
    SW("Escreva três aberturas diferentes (uma anedota, uma pergunta provocadora, um facto surpreendente — marque se for fictício) para um texto sobre «telemóveis nas escolas».", ["1. Gisteren zag ik twaalf leerlingen aan één tafel, allemaal met hun hoofd boven een scherm.\n2. Wat zou er gebeuren als we een week lang alle telefoons op school zouden verbieden?\n3. (Fictief) Op mijn oude school keek een leerling gemiddeld vijftig keer per dag op zijn telefoon."], ["3 técnicas","Ligação ao tema"], 40, "Aberturas.", ["v-pakkende-opening"]),
    LI("Wist u dat Nederland meer fietsen dan inwoners telt?", ["Wist u dat Nederland meer fietsen dan inwoners telt","Wist u dat Nederland meer fietsen dan inwoners telt?"], "Sabia que os Países Baixos têm mais bicicletas do que habitantes?", "Abertura com facto (frequentemente citado).", ["v-prikkelende-vraag"]),
  ], diff=4, mins=6)

L(12, "Terminar bem", "Een vooruitblik en een oproep.",
  ["Usar técnicas para concluir um texto"],
  vocab=[N("v-vooruitblik","vooruitblik","perspetiva futura","de"), X("v-afsluiten-met","afsluiten met","terminar com","verb")],
  ex=[("Sluit je tekst af met een duidelijke conclusie.","Termina o texto com uma conclusão clara."),("Een vooruitblik laat zien wat er in de toekomst kan gebeuren.","Uma perspetiva futura mostra o que pode acontecer no futuro.")],
  review=["v-kortom","v-concluderend","v-ik-roep-u-op"],
  cefr=C, exs=[
    MA([("vooruitblik","perspetiva futura"),("afsluiten met","terminar com"),("kortom","em suma"),("concluderend","concluindo")], "Conclusão.", ["v-vooruitblik","v-afsluiten-met","v-kortom","v-concluderend"]),
    MC("Qual NÃO é uma boa forma de concluir?", ["*Introduzir um argumento completamente novo","Resumir os argumentos|Boa.","Fazer um apelo|Boa."], "Conclusão.", ["v-afsluiten-met"]),
    TR("pt-nl","Termina o texto com uma conclusão clara.", ["Sluit je tekst af met een duidelijke conclusie"], "afsluiten met.", ["v-afsluiten-met"]),
    TR("pt-nl","Uma perspetiva futura.", ["Een vooruitblik"], "vooruitblik.", ["v-vooruitblik"]),
    FB("Ik sluit ___ met een oproep aan de lezer.", ["af"], "Separável.", ["v-afsluiten-met"], choices=["af","op","uit"], tr="Termino com um apelo ao leitor."),
    FE(["Kortom,","het","plan","is","goed","en","noodzakelijke."], 6, "noodzakelijk.", "Predicativo: sem -e.", ["v-kortom"]),
    SW("Escreva uma conclusão (3–4 frases) para um texto sobre «mais espaços verdes na cidade»: resumo + perspetiva futura + apelo.", ["Kortom: meer groen maakt de stad koeler, gezonder en gezelliger. Als we nu investeren, kunnen onze kinderen over twintig jaar in een echte tuinstad wonen. Ik roep de gemeente daarom op om elk leeg pleintje groen te maken."], ["Resumo","Vooruitblik","Apelo"], 35, "Conclusão.", ["v-vooruitblik","v-afsluiten-met"]),
    LI("Als we niets doen, wordt het probleem alleen maar groter.", ["Als we niets doen, wordt het probleem alleen maar groter","Als we niets doen wordt het probleem alleen maar groter"], "Se não fizermos nada, o problema só fica maior.", "Vooruitblik negativo.", ["v-vooruitblik"]),
  ], diff=4, mins=5)

L(13, "Ligar parágrafos", "Een goed bruggetje.",
  ["Criar transições entre parágrafos"],
  vocab=[N("v-overgang","overgang","transição","de","overgangen"), N("v-bruggetje","bruggetje","ponte (transição)","het")],
  ex=[("Tussen twee alinea's heb je een goede overgang nodig.","Entre dois parágrafos precisas de uma boa transição."),("«Naast de kosten speelt ook de veiligheid een rol» is een goed bruggetje.","«Além dos custos, também a segurança tem um papel» é uma boa ponte.")],
  review=["v-alinea","v-daarnaast","v-een-ander-punt"],
  cefr=C, exs=[
    MA([("overgang","transição"),("bruggetje","ponte"),("alinea","parágrafo"),("daarnaast","além disso")], "Transições.", ["v-overgang","v-bruggetje","v-alinea","v-daarnaast"]),
    MC("Parágrafo 1 fala de custos; parágrafo 2 de segurança. Melhor início do 2.º:", ["*Naast de kosten is ook de veiligheid belangrijk.","Veiligheid.|Abrupto.","Kortom, de kosten.|Não avança."], "Ponte.", ["v-bruggetje"]),
    AR("bruggetje", "ponte", "het", "Diminutivo → het.", ["v-bruggetje"]),
    TR("pt-nl","Precisas de uma boa transição.", ["Je hebt een goede overgang nodig"], "overgang.", ["v-overgang"]),
    FB("Een goed ___ verbindt twee alinea's.", ["bruggetje"], "Ponte.", ["v-bruggetje"], choices=["bruggetje","overgang","alinea"], tr="Uma boa ponte liga dois parágrafos."),
    FE(["Tussen","twee","alinea's","heb","je","een","goede","overgangen","nodig."], 7, "overgang", "Singular: een goede overgang.", ["v-overgang"]),
    SW("Escreva frases de transição (bruggetjes) entre estes temas: (1) preço → qualidade; (2) vantagens → desvantagens.", ["1. Maar een lage prijs zegt nog niets over de kwaliteit.\n2. Tegenover deze voordelen staan echter ook enkele nadelen."], ["2 transições","Ligam os temas"], 20, "Transições.", ["v-overgang"]),
    LI("Tegenover deze voordelen staan ook nadelen.", ["Tegenover deze voordelen staan ook nadelen"], "Em contrapartida destas vantagens há também desvantagens.", "Transição.", ["v-overgang"]),
  ], diff=4, mins=5)

L(14, "Citar fontes", "Volgens Jansen (2021)…",
  ["Indicar fontes num texto"],
  vocab=[X("v-bron-vermelden","een bron vermelden","indicar uma fonte","verb"), X("v-volgens-auteur-jaar","volgens X (jaar)","segundo X (ano)")],
  ex=[("Vermeld altijd je bronnen.","Indica sempre as tuas fontes."),("Volgens het CBS (2023) fietsen jongeren steeds meer.","Segundo o CBS (2023), os jovens andam cada vez mais de bicicleta. (exemplo de formato)")],
  review=["v-bron","v-citaat"],
  cefr=C, exs=[
    MA([("een bron vermelden","indicar uma fonte"),("volgens X (jaar)","segundo X (ano)"),("bronvermelding","referência bibliográfica"),("citaat","citação")], "Fontes.", ["v-bron-vermelden","v-volgens-auteur-jaar","v-citaat"]),
    MC("Porque se indicam fontes?", ["*Para o leitor poder verificar e para não plagiar","Para o texto ser mais longo|Não.","É só decorativo|Não."], "Ética.", ["v-bron-vermelden"]),
    TR("pt-nl","Indica sempre as tuas fontes.", ["Vermeld altijd je bronnen","Vermeld altijd jouw bronnen"], "vermelden.", ["v-bron-vermelden"]),
    TR("pt-nl","Segundo o autor (2020)…", ["Volgens de auteur (2020)","Volgens de schrijver (2020)"], "Formato.", ["v-volgens-auteur-jaar"]),
    FB("Je moet je bronnen altijd ___.", ["vermelden"], "Indicar.", ["v-bron-vermelden"], choices=["vermelden","vermeld","melden"], tr="Tens de indicar sempre as fontes."),
    FE(["Volgens","de","onderzoekers","heeft","het","aantal","fietsers","gestegen."], 3, "is", "stijgen usa zijn.", ["v-volgens-auteur-jaar"]),
    MC("CBS é…", ["*o instituto de estatística neerlandês","um banco|Não.","um partido|Não."], "Cultura.", ["v-volgens-auteur-jaar"]),
    LI("In de bronvermelding staan alle gebruikte artikelen.", ["In de bronvermelding staan alle gebruikte artikelen"], "Na bibliografia estão todos os artigos usados.", "Uso.", []),
  ], diff=4, mins=5)

L(15, "Carta de reclamação formal", "Betreft: klacht over…",
  ["Estruturar uma carta de reclamação formal"],
  vocab=[X("v-betreft","betreft:","assunto:"), X("v-herhaaldelijk","herhaaldelijk","repetidamente","adverb")],
  ex=[("Betreft: klacht over de levering van 12 maart","Assunto: queixa sobre a entrega de 12 de março"),("Ondanks herhaaldelijk contact is het probleem niet opgelost.","Apesar de contactos repetidos, o problema não foi resolvido.")],
  review=["v-ongenoegen","v-klacht-indienen","v-geachte"],
  cefr=C, exs=[
    MA([("betreft:","assunto:"),("herhaaldelijk","repetidamente"),("ongenoegen","descontentamento"),("een klacht indienen","apresentar queixa")], "Carta.", ["v-betreft","v-herhaaldelijk","v-ongenoegen","v-klacht-indienen"]),
    MC("Ordem de uma carta de reclamação:", ["*Betreft → aanhef → feiten → eis → afsluiting","Afsluiting → feiten|Não.","Eis → betreft → niets|Não."], "Estrutura.", ["v-betreft"]),
    TR("pt-nl","Apesar de contactos repetidos, nada mudou.", ["Ondanks herhaaldelijk contact is er niets veranderd","Ondanks herhaaldelijk contact veranderde er niets"], "herhaaldelijk.", ["v-herhaaldelijk"]),
    TR("pt-nl","Assunto: queixa sobre a entrega.", ["Betreft: klacht over de levering","Betreft: klacht over de bezorging"], "betreft.", ["v-betreft"]),
    FB("Ik heb u ___ gebeld, maar zonder resultaat.", ["herhaaldelijk"], "Repetidamente.", ["v-herhaaldelijk"], choices=["herhaaldelijk","betreft","ongenoegen"], tr="Liguei-lhe repetidamente, mas sem resultado."),
    FE(["Ondanks","herhaaldelijke","contact","is","het","niet","opgelost."], 1, "herhaaldelijk", "het contact → sem -e.", ["v-herhaaldelijk"]),
    CO("text","Klachtbrief (fragment, fictief)","Betreft: klacht over defecte wasmachine, ordernummer 48213\n\nGeachte heer, mevrouw,\n\nOp 2 februari kocht ik bij u een wasmachine. Sinds 15 februari lekt het apparaat. Ondanks herhaaldelijk contact met uw klantenservice is het probleem nog steeds niet opgelost. Hierbij verzoek ik u de wasmachine uiterlijk 15 maart te repareren of te vervangen.",
       [("Qual é o problema?", ["*A máquina perde água","Não liga","Chegou partida"]),("O que já fez o cliente?", ["*Contactou várias vezes","Nada","Foi à loja"]),("O que pede?", ["*Reparação ou substituição até 15/3","Dinheiro de volta","Desconto"])],
       "Carta de reclamação.", ["v-betreft","v-herhaaldelijk"]),
    LI("Hierbij uit ik mijn ongenoegen over de gang van zaken.", ["Hierbij uit ik mijn ongenoegen over de gang van zaken"], "Pela presente manifesto o meu descontentamento com o decorrer dos factos.", "Formal.", ["v-ongenoegen"]),
  ], diff=5, mins=6)

L(16, "Exigir com firmeza", "Indien …, zie ik mij genoodzaakt…",
  ["Formular exigências e consequências numa carta formal"],
  vocab=[X("v-genoodzaakt","zich genoodzaakt zien om … te","ver-se obrigado a"), X("v-uiterlijk-datum","uiterlijk op…","o mais tardar em…")],
  ex=[("Ik verzoek u het bedrag uiterlijk op 1 april terug te storten.","Peço-lhe que devolva o montante o mais tardar a 1 de abril."),("Indien ik niets van u hoor, zie ik mij genoodzaakt juridische stappen te ondernemen.","Se não tiver notícias suas, ver-me-ei obrigado a tomar medidas legais.")],
  review=["v-ik-verzoek-u","v-in-gebreke-stellen","v-indien"],
  cefr=C, exs=[
    MA([("zich genoodzaakt zien","ver-se obrigado"),("uiterlijk op…","o mais tardar em…"),("ik verzoek u…","peço-lhe que…"),("in gebreke stellen","notificar em incumprimento")], "Exigir.", ["v-genoodzaakt","v-uiterlijk-datum","v-ik-verzoek-u","v-in-gebreke-stellen"]),
    MC("«Ik zie mij genoodzaakt…» exprime…", ["*uma consequência séria se não houver resposta","um agradecimento|Não.","uma desculpa|Não."], "Tom.", ["v-genoodzaakt"]),
    TR("pt-nl","Peço-lhe que pague o mais tardar a 1 de abril.", ["Ik verzoek u uiterlijk op 1 april te betalen","Ik verzoek u uiterlijk 1 april te betalen"], "uiterlijk.", ["v-uiterlijk-datum"]),
    TR("nl-pt","Indien ik niets hoor, zie ik mij genoodzaakt juridische stappen te ondernemen.", ["Se não tiver notícias, ver-me-ei obrigado a tomar medidas legais","Caso não receba resposta, ver-me-ei obrigado a avançar juridicamente"], "Formal.", ["v-genoodzaakt"]),
    FB("Indien u niet reageert, zie ik mij ___ een klacht in te dienen.", ["genoodzaakt"], "Formal.", ["v-genoodzaakt"], choices=["genoodzaakt","verplicht","uiterlijk"], tr="Se não responder, ver-me-ei obrigado a apresentar queixa."),
    FE(["Ik","verzoek","u","uiterlijk","1","april","betalen."], 6, "te betalen.", "verzoeken + te.", ["v-ik-verzoek-u"]),
    MC("Antes de usar «juridische stappen», é sensato…", ["*ter tentado resolver e documentado os contactos","ameaçar logo no 1.º e-mail|Agressivo.","não guardar provas|Não."], "Prudência (informação geral, não aconselhamento jurídico).", ["v-genoodzaakt"]),
    LI("Ik verwacht uiterlijk binnen tien werkdagen een reactie.", ["Ik verwacht uiterlijk binnen tien werkdagen een reactie","Ik verwacht uiterlijk binnen 10 werkdagen een reactie"], "Espero uma resposta no prazo máximo de dez dias úteis.", "Prazo.", ["v-uiterlijk-datum"]),
  ], diff=5, mins=6)

L(17, "Resumir: essencial e acessório", "Hoofdzaken en bijzaken.",
  ["Separar o essencial do acessório ao resumir"],
  vocab=[N("v-hoofdzaken","hoofdzaken","o essencial|pontos principais","de"), N("v-bijzaken","bijzaken","pormenores|acessório","de"),
         X("v-weglaten","weglaten","omitir|deixar de fora","verb")],
  ex=[("In een samenvatting staan alleen de hoofdzaken.","Num resumo estão só os pontos principais."),("Bijzaken kun je weglaten.","Os pormenores podes omitir."),("Laat voorbeelden en details weg.","Deixa de fora exemplos e pormenores.")],
  review=["v-samenvatting","v-beknopt","v-schrappen"],
  cefr=C, exs=[
    MA([("hoofdzaken","essencial"),("bijzaken","pormenores"),("weglaten","omitir"),("beknopt","conciso")], "Resumir.", ["v-hoofdzaken","v-bijzaken","v-weglaten","v-beknopt"]),
    MC("Num resumo, o que se deixa de fora?", ["*exemplos, pormenores e repetições","a ideia principal|Não!","a conclusão|Não."], "Resumir.", ["v-weglaten"]),
    TR("pt-nl","Os pormenores podes omitir.", ["Bijzaken kun je weglaten","Je kunt bijzaken weglaten"], "weglaten.", ["v-bijzaken"]),
    TR("pt-nl","Num resumo estão só os pontos principais.", ["In een samenvatting staan alleen de hoofdzaken"], "hoofdzaken.", ["v-hoofdzaken"]),
    FB("Laat de voorbeelden ___; die zijn niet nodig.", ["weg"], "Separável.", ["v-weglaten"], choices=["weg","uit","af"], tr="Deixa de fora os exemplos; não são necessários."),
    FE(["Ik","heb","de","details","weggelaat."], 4, "weggelaten.", "Particípio forte: weggelaten.", ["v-weglaten"]),
    CO("text","Origineel (fragment)","Vorige week dinsdag, op een regenachtige middag, opende in de Utrechtse wijk Lombok een nieuwe bibliotheek. De burgemeester, die zelf in Lombok is opgegroeid, knipte het lint door. De bibliotheek heeft 20.000 boeken, een leescafé en een ruimte voor huiswerkbegeleiding. Volgens de directeur moet het een ontmoetingsplek worden voor de hele wijk.",
       [("Qual é a hoofdzaak?", ["*Abriu uma biblioteca nova em Lombok","Choveu na terça","O presidente cresceu em Lombok"]),("Qual é bijzaak?", ["*Estava a chover","Tem espaço para trabalhos de casa","Deve ser ponto de encontro"]),("Objetivo segundo o diretor?", ["*Ponto de encontro do bairro","Vender livros","Café"])],
       "Distinguir essencial e acessório.", ["v-hoofdzaken","v-bijzaken"]),
    SW("Resuma o texto acima numa só frase (máx. 25 palavras), só com o essencial.", ["In Lombok (Utrecht) is een nieuwe bibliotheek geopend met boeken, een leescafé en huiswerkbegeleiding, bedoeld als ontmoetingsplek voor de wijk."], ["1 frase","Só o essencial"], 12, "Resumo.", ["v-hoofdzaken"]),
  ], diff=5, mins=6)

L(18, "Evitar repetições", "Synoniemen en afwisseling.",
  ["Usar sinónimos e referências para não repetir palavras"],
  vocab=[N("v-synoniem","synoniem","sinónimo","het","synoniemen"), N("v-woordherhaling","woordherhaling","repetição de palavras","de")],
  ex=[("Gebruik een synoniem om woordherhaling te vermijden.","Usa um sinónimo para evitar repetir palavras."),("In plaats van steeds «belangrijk» kun je ook «essentieel» of «cruciaal» schrijven.","Em vez de sempre «importante», podes escrever «essencial» ou «crucial».")],
  review=["v-herhaling","v-variatie","v-afwisselen"],
  cefr=C, exs=[
    MA([("synoniem","sinónimo"),("woordherhaling","repetição de palavras"),("variatie","variação"),("afwisselen","alternar")], "Estilo.", ["v-synoniem","v-woordherhaling","v-variatie","v-afwisselen"]),
    AR("synoniem", "sinónimo", "het", "Het synoniem.", ["v-synoniem"]),
    MC("Sinónimo de «belangrijk» num texto formal:", ["*wezenlijk / essentieel","leuk|Não.","groot|Não exatamente."], "Sinónimos.", ["v-synoniem"]),
    MC("«De gemeente bouwt een brug. De gemeente wil de brug in 2026 openen.» Melhor:", ["*De gemeente bouwt een brug, die ze in 2026 wil openen.","De gemeente… de gemeente…|Repetição.","Zij bouwt het.|Vago."], "Evitar repetição.", ["v-woordherhaling"]),
    TR("pt-nl","Usa um sinónimo.", ["Gebruik een synoniem"], "synoniem.", ["v-synoniem"]),
    FB("Te veel ___ maakt een tekst saai.", ["woordherhaling"], "Repetição.", ["v-woordherhaling"], choices=["woordherhaling","synoniem","variatie"], tr="Demasiada repetição torna um texto aborrecido."),
    FE(["De","synoniem","van","«snel»","is","«vlug»."], 0, "Het", "het synoniem.", ["v-synoniem"]),
    SW("Reescreva sem repetições: «Het museum is mooi. Het museum heeft veel schilderijen. De schilderijen van het museum zijn mooi.»", ["Het museum is prachtig en heeft veel schilderijen, die stuk voor stuk de moeite waard zijn."], ["Sem repetições","Sinónimos/pronomes"], 15, "Reescrever.", ["v-woordherhaling","v-synoniem"]),
    LI("Wissel korte en lange zinnen af.", ["Wissel korte en lange zinnen af"], "Alterna frases curtas e longas.", "Dica.", ["v-afwisselen"]),
  ], diff=4, mins=5)

L(19, "Estilo: tenazes e substantivos", "Tangconstructies vermijden.",
  ["Reconhecer e evitar frases com «tenazes» e excesso de substantivos"],
  vocab=[N("v-tangconstructie","tangconstructie","construção em tenaz","de"), N("v-naamwoordstijl","naamwoordstijl","estilo nominal","de")],
  ex=[("«De door de gemeente vorig jaar aangekondigde maatregelen» is een tangconstructie.","«As pela câmara no ano passado anunciadas medidas» é uma construção em tenaz."),("Beter: «de maatregelen die de gemeente vorig jaar aankondigde».","Melhor: «as medidas que a câmara anunciou no ano passado».")],
  review=["v-leesbaar","v-invoering"],
  gram=[G("g-tang","Tenazes e estilo nominal","Uma **tangconstructie** separa muito duas partes que pertencem juntas (artigo e nome, ou verbo e partícula): *de door de directeur gisteren tijdens de vergadering genomen beslissing*. Desfaz-se com uma relativa. O **naamwoordstijl** usa demasiados nomes em -ing: *Er vindt een verhoging van de huur plaats* → *De huur gaat omhoog.*",
    [("Er wordt overgegaan tot de aanschaf van…","→ We kopen…"),("de door u ingevulde formulieren","→ de formulieren die u heeft ingevuld")])],
  cefr=C, exs=[
    MA([("tangconstructie","construção em tenaz"),("naamwoordstijl","estilo nominal"),("leesbaar","legível"),("invoering","introdução")], "Estilo.", ["v-tangconstructie","v-naamwoordstijl","v-leesbaar","v-invoering"]),
    MC("Mais legível:", ["*de beslissing die de directeur gisteren nam","de door de directeur gisteren genomen beslissing|Tenaz.","de directeur genomen beslissing gisteren|Errado."], "Desfazer a tenaz.", ["v-tangconstructie"]),
    MC("Mais direto que «Er vindt een verhoging van de prijzen plaats»:", ["*De prijzen gaan omhoog.","Er is verhoging.|Vago.","Verhoging vindt plaats.|Igual."], "Verbo em vez de nome.", ["v-naamwoordstijl"]),
    TR("pt-nl","As medidas que a câmara anunciou.", ["De maatregelen die de gemeente aankondigde","De maatregelen die de gemeente heeft aangekondigd"], "Relativa.", ["v-tangconstructie"]),
    FB("Vermijd ___ en schrijf liever met werkwoorden.", ["naamwoordstijl"], "Estilo nominal.", ["v-naamwoordstijl"], choices=["naamwoordstijl","synoniemen","alinea's"], tr="Evita o estilo nominal e escreve antes com verbos."),
    FE(["Een","tangconstructie","maken","een","zin","moeilijk","leesbaar."], 2, "maakt", "Singular: maakt.", ["v-tangconstructie"]),
    SW("Reescreve de forma clara: «Er wordt door de directie overgegaan tot de invoering van een nieuw rooster.»", ["De directie voert een nieuw rooster in."], ["Verbo ativo","Sem -ing","Curto"], 6, "Simplificar.", ["v-naamwoordstijl"]),
    LI("Schrijf zoals je praat, maar dan iets netter.", ["Schrijf zoals je praat, maar dan iets netter","Schrijf zoals je praat maar dan iets netter"], "Escreve como falas, mas um pouco mais cuidado.", "Dica.", ["v-leesbaar"]),
  ], diff=5, mins=6)

L(20, "Registo formal num ensaio", "Men, dient, derhalve?",
  ["Escrever com registo formal adequado sem exagerar"],
  vocab=[X("v-te-formeel","te formeel","demasiado formal"), X("v-zakelijk","zakelijk","objetivo|profissional (estilo)","adjective")],
  ex=[("Een betoog is zakelijk, maar niet stijf.","Um texto argumentativo é objetivo, mas não rígido."),("«Derhalve» is in een opiniestuk vaak te formeel.","«Derhalve» num artigo de opinião é muitas vezes demasiado formal.")],
  review=["v-derhalve","v-men-zegt","v-formeel"],
  cefr=C, exs=[
    MA([("te formeel","demasiado formal"),("zakelijk","objetivo"),("derhalve","por conseguinte"),("formeel","formal")], "Registo.", ["v-te-formeel","v-zakelijk","v-derhalve","v-formeel"]),
    MC("Num ensaio académico, em vez de «je» genérico usa-se melhor…", ["*«men» ou uma construção passiva/impessoal","«jij»|Informal.","«wij allemaal»|Pouco preciso."], "Registo académico.", ["v-men-zegt"]),
    MC("Qual é adequado num artigo de opinião para um jornal?", ["*Daarom vind ik dat…","Derhalve ben ik van mening dat…|Rígido.","Dus ja, ik vind…|Coloquial."], "Equilíbrio.", ["v-zakelijk"]),
    TR("pt-nl","Um texto argumentativo é objetivo, mas não rígido.", ["Een betoog is zakelijk, maar niet stijf","Een betoog is zakelijk maar niet stijf"], "zakelijk.", ["v-zakelijk"]),
    FB("Dat woord is hier ___ formeel; kies iets eenvoudigers.", ["te"], "Demasiado.", ["v-te-formeel"], choices=["te","heel","zo"], tr="Essa palavra aqui é demasiado formal; escolhe algo mais simples."),
    FE(["Een","zakelijke","stijl","is","heldere","en","objectief."], 4, "helder", "Predicativo: sem -e.", ["v-zakelijk"]),
    SW("Reescreva em registo zakelijk (nem coloquial nem burocrático): «Nou, ik vind gewoon dat die regel echt nergens op slaat, snap je?»", ["Ik vind deze regel niet zinvol, omdat hij het probleem niet oplost."], ["Sem coloquialismos","Sem palavras arcaicas","Com razão"], 10, "Registo.", ["v-zakelijk"]),
    LI("Kies woorden die je lezer begrijpt.", ["Kies woorden die je lezer begrijpt"], "Escolhe palavras que o teu leitor perceba.", "Dica.", ["v-zakelijk"]),
  ], diff=4, mins=5)

L(21, "Ortografia difícil: ei/ij e au/ou", "Klein, kleur… ei of ij?",
  ["Memorizar palavras frequentes com ei/ij e au/ou"],
  vocab=[X("v-ei-ij","ei of ij","ei ou ij (mesmo som)"), X("v-au-ou","au of ou","au ou ou (mesmo som)")],
  ex=[("«Ei» en «ij» klinken hetzelfde.","«Ei» e «ij» soam igual."),("Je schrijft «trein» met ei, maar «tijd» met ij.","Escreve-se «trein» com ei, mas «tijd» com ij."),("«Blauw» met au, «koud» met ou.","«Blauw» com au, «koud» com ou.")],
  review=["v-spelling","v-spelfout"],
  cefr=C, exs=[
    MA([("ei of ij","mesmo som /ɛi/"),("au of ou","mesmo som /ʌu/"),("spelling","ortografia"),("spelfout","erro ortográfico")], "Sons.", ["v-ei-ij","v-au-ou","v-spelling","v-spelfout"]),
    MC("Qual está bem escrita?", ["*trein","trijn|Errado.","train|Não."], "Memorizar.", ["v-ei-ij"]),
    MC("Qual está bem escrita?", ["*tijd","teid|Errado.","tyd|Antigo/errado."], "Memorizar.", ["v-ei-ij"]),
    MC("Qual está bem escrita?", ["*koud","kaud|Errado.","kout|Errado."], "Memorizar.", ["v-au-ou"]),
    MC("Qual está bem escrita?", ["*blauw","blouw|Errado.","blaw|Errado."], "Memorizar.", ["v-au-ou"]),
    FB("Ik heb geen ___ (tempo).", ["tijd"], "ij.", ["v-ei-ij"], choices=["tijd","teid","tyd"], tr="Não tenho tempo."),
    FE(["Het","is","vandaag","erg","kaud."], 4, "koud.", "ou.", ["v-au-ou"]),
    FE(["We","nemen","de","trijn","naar","Gent."], 3, "trein", "ei.", ["v-ei-ij"]),
    LI("Mijn vrouw rijdt in een blauwe auto.", ["Mijn vrouw rijdt in een blauwe auto"], "A minha mulher conduz um carro azul.", "Várias grafias.", ["v-au-ou","v-ei-ij"]),
  ], diff=3, mins=5)

L(22, "Maiúsculas: casos especiais", "Pasen, de Tweede Wereldoorlog, het Nederlands.",
  ["Usar maiúsculas em festas, períodos históricos e instituições"],
  vocab=[X("v-tweede-wereldoorlog","de Tweede Wereldoorlog","a Segunda Guerra Mundial")],
  ex=[("Met Pasen gaan we naar oma.","Na Páscoa vamos a casa da avó."),("Mijn opa vertelt vaak over de Tweede Wereldoorlog.","O meu avô fala muitas vezes da Segunda Guerra Mundial."),("De Tweede Kamer stemt vandaag.","A Câmara Baixa vota hoje.")],
  review=["v-pasen","v-hoofdletter","v-feestdag"],
  cefr=C, exs=[
    MA([("Pasen","Páscoa"),("de Tweede Wereldoorlog","a Segunda Guerra Mundial"),("hoofdletter","maiúscula"),("feestdag","feriado")], "Maiúsculas.", ["v-pasen","v-tweede-wereldoorlog","v-hoofdletter","v-feestdag"]),
    MC("Festas como Natal e Páscoa em NL…", ["*escrevem-se com maiúscula: Kerstmis, Pasen","com minúscula|Não.","tanto faz|Não."], "Regra.", ["v-pasen"]),
    MC("Estações e meses:", ["*minúscula: lente, januari","maiúscula: Lente, Januari|Não.","depende|Não."], "Contraste.", ["v-hoofdletter"]),
    TR("pt-nl","Na Páscoa vamos a casa da avó.", ["Met Pasen gaan we naar oma","Met Pasen gaan wij naar oma"], "Pasen.", ["v-pasen"]),
    TR("pt-nl","A Segunda Guerra Mundial.", ["De Tweede Wereldoorlog"], "Maiúsculas.", ["v-tweede-wereldoorlog"]),
    FB("Met ___ eten we chocolade-eieren.", ["Pasen"], "Festa.", ["v-pasen"], choices=["Pasen","Kerstmis","Koningsdag"], tr="Na Páscoa comemos ovos de chocolate."),
    MC("«Het Nederlands» (a língua) e «een Nederlandse kaas» levam…", ["*maiúscula nos dois","só o primeiro|Não.","nenhum|Não."], "Revisão.", ["v-hoofdletter"]),
    LI("Koningsdag is een nationale feestdag.", ["Koningsdag is een nationale feestdag"], "O Dia do Rei é um feriado nacional.", "Maiúscula em Koningsdag.", ["v-feestdag"]),
    WO("Na Páscoa.", ["Met","Pasen"], "Expressão.", ["v-pasen"]),
  ], diff=3, mins=5)

L(23, "Integrar feedback", "Feedback verwerken in een tweede versie.",
  ["Rever um texto a partir de comentários"],
  vocab=[X("v-feedback-verwerken","feedback verwerken","incorporar o feedback","verb"), X("v-tweede-versie","een tweede versie","uma segunda versão")],
  ex=[("Ik heb de feedback van mijn docent verwerkt.","Incorporei o feedback do meu professor."),("De tweede versie is veel beter.","A segunda versão é muito melhor.")],
  review=["v-feedback","v-herschrijven","v-verbeterpunt"],
  cefr=C, exs=[
    MA([("feedback verwerken","incorporar feedback"),("een tweede versie","uma segunda versão"),("herschrijven","reescrever"),("verbeterpunt","ponto a melhorar")], "Rever.", ["v-feedback-verwerken","v-tweede-versie","v-herschrijven","v-verbeterpunt"]),
    TR("pt-nl","Incorporei o feedback.", ["Ik heb de feedback verwerkt"], "verwerken.", ["v-feedback-verwerken"]),
    TR("pt-nl","A segunda versão é muito melhor.", ["De tweede versie is veel beter"], "tweede versie.", ["v-tweede-versie"]),
    MC("Comentário do professor: «Te veel woordherhaling in alinea 2.» O que faz?", ["*substitui repetições por sinónimos ou pronomes","apaga o parágrafo|Excessivo.","ignora|Não."], "Agir.", ["v-feedback-verwerken"]),
    MC("Comentário: «Je conclusie bevat een nieuw argument.» O que faz?", ["*move o argumento para o corpo do texto","acrescenta mais argumentos à conclusão|Não.","tira a conclusão|Não."], "Agir.", ["v-feedback-verwerken"]),
    FB("Ik stuur je morgen een ___ versie.", ["tweede"], "Segunda.", ["v-tweede-versie"], choices=["tweede","twee","tweeë"], tr="Envio-te amanhã uma segunda versão."),
    FE(["Ik","heb","de","feedback","verwerkt","en","een","tweede","versies","geschreven."], 8, "versie", "Singular: een tweede versie.", ["v-tweede-versie"]),
    LI("Bedankt voor je opmerkingen; ik ga ermee aan de slag.", ["Bedankt voor je opmerkingen; ik ga ermee aan de slag","Bedankt voor je opmerkingen, ik ga ermee aan de slag"], "Obrigado pelos comentários; vou trabalhar neles.", "Receber feedback.", ["v-feedback"]),
  ], diff=4, mins=5)

L(24, "Ensaio reflexivo", "Een beschouwing.",
  ["Distinguir texto argumentativo e reflexivo"],
  vocab=[N("v-beschouwing","beschouwing","ensaio reflexivo","de"), X("v-van-verschillende-kanten","van verschillende kanten bekijken","ver de vários ângulos","verb")],
  ex=[("In een beschouwing bekijk je een onderwerp van verschillende kanten.","Num ensaio reflexivo vês um tema de vários ângulos."),("Een betoog wil overtuigen; een beschouwing wil laten nadenken.","Um texto argumentativo quer convencer; um ensaio reflexivo quer fazer pensar.")],
  review=["v-betoog","v-standpunt","v-nuance"],
  cefr=C, exs=[
    MA([("beschouwing","ensaio reflexivo"),("van verschillende kanten bekijken","ver de vários ângulos"),("betoog","texto argumentativo"),("nuance","nuance")], "Tipos de texto.", ["v-beschouwing","v-van-verschillende-kanten","v-betoog","v-nuance"]),
    MC("Diferença principal:", ["*betoog = convencer; beschouwing = refletir e expor várias perspetivas","iguais|Não.","beschouwing = narrativa|Não."], "Tipos.", ["v-beschouwing"]),
    MC("Uma beschouwing termina muitas vezes…", ["*com uma reflexão ou pergunta aberta","com um apelo agressivo|Mais típico de betoog.","sem conclusão|Não."], "Conclusão.", ["v-beschouwing"]),
    TR("pt-nl","Vês o tema de vários ângulos.", ["Je bekijkt het onderwerp van verschillende kanten"], "Expressão.", ["v-van-verschillende-kanten"]),
    FB("Een ___ wil de lezer vooral laten nadenken.", ["beschouwing"], "Ensaio reflexivo.", ["v-beschouwing"], choices=["beschouwing","betoog","klachtbrief"], tr="Um ensaio reflexivo quer sobretudo fazer o leitor pensar."),
    FE(["Een","betoog","wil","de","lezer","overtuigt."], 5, "overtuigen.", "Depois de wil: infinitivo.", ["v-betoog"]),
    SW("Escreva o início de uma beschouwing (4–5 frases) sobre «Wat betekent thuis?», mostrando pelo menos duas perspetivas.", ["Wat betekent «thuis» eigenlijk? Voor sommigen is het de plek waar ze geboren zijn. Voor anderen is thuis waar hun familie of vrienden wonen. Wie verhuist naar een ander land, merkt dat thuis ook iets is wat je langzaam opbouwt. Misschien kun je zelfs op twee plekken tegelijk thuis zijn."], ["2+ perspetivas","Tom reflexivo"], 40, "Ensaio.", ["v-beschouwing","v-van-verschillende-kanten"]),
    LI("Er is niet één juist antwoord op deze vraag.", ["Er is niet één juist antwoord op deze vraag","Er is niet een juist antwoord op deze vraag"], "Não há uma única resposta certa a esta pergunta.", "Tom reflexivo.", ["v-beschouwing"]),
  ], diff=5, mins=6)

L(25, "Prática: o texto argumentativo final", "Van hoofdvraag tot slot.",
  ["Escrever um texto argumentativo completo e revisto"],
  vocab=[X("v-eindversie","de eindversie","a versão final")],
  ex=[("Lever de eindversie vóór vrijdag in.","Entrega a versão final antes de sexta.")],
  review=["v-hoofdvraag","v-pakkende-opening","v-vooruitblik","v-overgang","v-bron-vermelden","v-woordherhaling","v-tangconstructie","v-zakelijk","v-feedback-verwerken"],
  cefr=C, exs=[
    MA([("hoofdvraag","pergunta central"),("pakkende opening","abertura cativante"),("overgang","transição"),("vooruitblik","perspetiva futura")], "Revisão.", ["v-hoofdvraag","v-pakkende-opening","v-overgang","v-vooruitblik"]),
    MC("Checklist final — o que NÃO pertence?", ["*Usar o máximo de palavras difíceis possível","Fontes indicadas|Pertence.","Sem repetições desnecessárias|Pertence."], "Revisão.", ["v-zakelijk"]),
    TR("pt-nl","Entrega a versão final antes de sexta.", ["Lever de eindversie vóór vrijdag in","Lever de eindversie voor vrijdag in"], "inleveren.", ["v-eindversie"]),
    FE(["De","door","mij","geschreven","tekst","zijn","af."], 5, "is", "Singular: is.", ["v-tangconstructie"]),
    SW("Escreva um texto argumentativo (cerca de 150 palavras) sobre: «Moet het Nederlands op de universiteit belangrijker worden dan het Engels?» Inclua: abertura cativante, hoofdvraag, 2 argumentos com transições, 1 contra-argumento, conclusão com vooruitblik. Depois releia com a checklist.", ["Wist je dat op sommige Nederlandse universiteiten bijna alle masteropleidingen in het Engels zijn? Moet het Nederlands weer belangrijker worden? Ik vind van wel.\n\nTen eerste blijven internationale studenten vaker in Nederland als ze de taal leren. Daarnaast is Nederlands nodig om goed mee te doen in de maatschappij, bijvoorbeeld in de zorg.\n\nTegenstanders zeggen dat Engels de taal van de wetenschap is. Dat klopt weliswaar, maar een cursus Nederlands naast een Engelstalige opleiding sluit dat niet uit.\n\nKortom: Engels en Nederlands kunnen samengaan. Als universiteiten nu investeren in taallessen, hebben we over tien jaar meer goed geïntegreerde jonge professionals."], ["Abertura","Hoofdvraag","Argumentos + transições","Contra-argumento","Conclusão + vooruitblik"], 120, "Texto final.", ["v-eindversie"]),
  ], diff=5, mins=8)

W()
