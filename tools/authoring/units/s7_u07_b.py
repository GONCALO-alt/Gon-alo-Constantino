import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u07")
C = "B2"
# Lições de aprofundamento (10–29): retórica e escrita avançada.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Aliteração e repetição", "Zuinig, zuiver en zorgzaam.",
  ["Usar aliteração e repetição como recursos de estilo"],
  vocab=[N("v-alliteratie","alliteratie","aliteração","de")],
  ex=[("«Zuinig, zuiver en zorgzaam» is een alliteratie.","«Poupado, puro e cuidadoso» é uma aliteração."),("Herhaling maakt een boodschap sterker.","A repetição torna uma mensagem mais forte.")],
  review=["v-herhaling","v-stijlfiguur","v-drieslag"],
  cefr=C, exs=[
    MA([("alliteratie","aliteração"),("herhaling","repetição"),("stijlfiguur","figura de estilo"),("drieslag","tríade")], "Figuras.", ["v-alliteratie","v-herhaling","v-stijlfiguur","v-drieslag"]),
    MC("Qual é uma aliteração?", ["*Met hart en hoofd","Met liefde en verstand|Não repete som.","Heel erg goed|Não."], "Identificar.", ["v-alliteratie"]),
    MC("«Veni, vidi, vici» / «Ik kwam, ik zag, ik overwon» é sobretudo…", ["*uma drieslag","uma aliteração|Não principalmente.","um eufemismo|Não."], "Identificar.", ["v-drieslag"]),
    TR("pt-nl","A repetição torna a mensagem mais forte.", ["Herhaling maakt een boodschap sterker","Herhaling maakt de boodschap sterker"], "Comparativo.", ["v-herhaling"]),
    TR("pt-nl","É uma figura de estilo.", ["Het is een stijlfiguur","Dat is een stijlfiguur"], "stijlfiguur.", ["v-stijlfiguur"]),
    FB("Slogans gebruiken vaak ___: «Koffie, koekjes en kletsen».", ["alliteratie"], "Aliteração.", ["v-alliteratie"], choices=["alliteratie","ironie","climax"], tr="Os slogans usam muitas vezes aliteração."),
    FE(["Het","alliteratie","valt","meteen","op."], 0, "De", "de alliteratie.", ["v-alliteratie"]),
    SW("Crie um slogan com aliteração para uma campanha de bicicletas na cidade.", ["Fiets fit, fris en fijn door de stad!"], ["Aliteração","Curto"], 5, "Criar.", ["v-alliteratie"]),
  ], diff=4, mins=4)

L(11, "Clímax e anticlímax", "Van klein naar groot.",
  ["Construir e reconhecer clímax e anticlímax"],
  vocab=[N("v-climax","climax","clímax","de"), N("v-anticlimax","anticlimax","anticlímax","de")],
  ex=[("Eerst een glimlach, dan een gesprek, toen een vriendschap: een climax.","Primeiro um sorriso, depois uma conversa, depois uma amizade: um clímax."),("Na al die spanning was de afloop een anticlimax.","Depois de toda essa tensão, o desfecho foi um anticlímax.")],
  review=["v-spanning-opbouwen","v-afloop"],
  cefr=C, exs=[
    MA([("climax","clímax"),("anticlimax","anticlímax"),("de spanning opbouwen","criar suspense"),("afloop","desfecho")], "Clímax.", ["v-climax","v-anticlimax","v-spanning-opbouwen","v-afloop"]),
    MC("«Hij verloor zijn baan, zijn huis en… zijn paraplu.» O efeito é…", ["*anticlimax humorístico","climax|Desce no fim.","alliteratie|Não."], "Identificar.", ["v-anticlimax"]),
    TR("pt-nl","O desfecho foi um anticlímax.", ["De afloop was een anticlimax","Het einde was een anticlimax"], "anticlimax.", ["v-anticlimax"]),
    TR("pt-nl","A tensão vai num crescendo até ao clímax.", ["De spanning bouwt op tot een climax","De spanning loopt op tot een climax"], "climax.", ["v-climax"]),
    FB("Het verhaal bouwt langzaam op naar een ___.", ["climax"], "Clímax.", ["v-climax"], choices=["climax","anticlimax","alliteratie"], tr="A história vai crescendo devagar até ao clímax."),
    FE(["De","finale","waren","een","anticlimax."], 2, "was", "Singular: was.", ["v-anticlimax"]),
    LI("Eerst twijfelde ik, toen probeerde ik het, en uiteindelijk werd het mijn passie.", ["Eerst twijfelde ik, toen probeerde ik het, en uiteindelijk werd het mijn passie","Eerst twijfelde ik toen probeerde ik het en uiteindelijk werd het mijn passie"], "Primeiro hesitei, depois experimentei, e no fim tornou-se a minha paixão.", "Clímax.", ["v-climax"]),
    WO("Foi um anticlímax.", ["Het","was","een","anticlimax"], "Ordem.", ["v-anticlimax"]),
  ], diff=4, mins=4)

L(12, "Dirigir-se ao leitor", "Kent u dat gevoel?",
  ["Envolver o leitor diretamente"],
  vocab=[X("v-de-lezer-aanspreken","de lezer aanspreken","dirigir-se ao leitor","verb")],
  ex=[("Kent u dat gevoel? U staat op het perron en de trein is net weg.","Conhece aquela sensação? Está no cais e o comboio acabou de partir."),("Door de lezer aan te spreken, voelt hij zich betrokken.","Dirigindo-se ao leitor, ele sente-se envolvido.")],
  review=["v-retorische-vraag","v-betrekken-bij"],
  cefr=C, exs=[
    MA([("de lezer aanspreken","dirigir-se ao leitor"),("retorische vraag","pergunta retórica"),("betrekken bij","envolver em"),("stijlfiguur","figura de estilo")], "Leitor.", ["v-de-lezer-aanspreken","v-retorische-vraag","v-betrekken-bij","v-stijlfiguur"]),
    MC("Qual frase se dirige ao leitor?", ["*Herkent u dit?","De situatie is herkenbaar.|Impessoal.","Men herkent dit.|Impessoal."], "Identificar.", ["v-de-lezer-aanspreken"]),
    TR("pt-nl","Conhece aquela sensação?", ["Kent u dat gevoel","Kent u dat gevoel?","Ken je dat gevoel"], "Pergunta.", ["v-de-lezer-aanspreken"]),
    TR("pt-nl","O leitor sente-se envolvido.", ["De lezer voelt zich betrokken"], "betrokken.", ["v-betrekken-bij"]),
    FB("Een ___ vraag verwacht geen antwoord.", ["retorische"], "de vraag → -e.", ["v-retorische-vraag"], choices=["retorische","retorisch","directe"], tr="Uma pergunta retórica não espera resposta."),
    FE(["De","lezer","voelen","zich","aangesproken."], 2, "voelt", "Singular: voelt.", ["v-de-lezer-aanspreken"]),
    SW("Escreva 2 frases de abertura de um artigo sobre o custo das casas que se dirijam diretamente ao leitor.", ["Herkent u dit? U werkt fulltime, verdient een goed salaris, en toch kunt u nergens een betaalbaar huis vinden."], ["Dirige-se ao leitor","Ligação ao tema"], 20, "Abertura.", ["v-de-lezer-aanspreken"]),
    LI("Stelt u zich eens voor dat u morgen geen water uit de kraan krijgt.", ["Stelt u zich eens voor dat u morgen geen water uit de kraan krijgt"], "Imagine que amanhã não sai água da torneira.", "Técnica.", ["v-stelt-u-zich-voor"]),
  ], diff=4, mins=4)

L(13, "Hipérbole", "Ik heb het je al duizend keer gezegd!",
  ["Reconhecer exageros retóricos"],
  vocab=[N("v-hyperbool","hyperbool","hipérbole","de")],
  ex=[("«Ik heb het je al duizend keer gezegd» is een hyperbool.","«Já te disse mil vezes» é uma hipérbole."),("In een betoog werkt een hyperbool soms averechts.","Num texto argumentativo uma hipérbole às vezes tem o efeito contrário.")],
  review=["v-overdrijving","v-understatement"],
  cefr=C, exs=[
    MA([("hyperbool","hipérbole"),("overdrijving","exagero"),("understatement","atenuação"),("stijlfiguur","figura de estilo")], "Exagero.", ["v-hyperbool","v-overdrijving","v-understatement","v-stijlfiguur"]),
    MC("Qual é uma hipérbole?", ["*Ik sterf van de honger!","Ik heb een beetje honger.|Literal.","Het valt wel mee.|Atenuação."], "Identificar.", ["v-hyperbool"]),
    MC("O oposto retórico da hipérbole é…", ["*o understatement","a alliteratie|Não.","a climax|Não."], "Contraste.", ["v-understatement"]),
    TR("pt-nl","Já te disse mil vezes!", ["Ik heb het je al duizend keer gezegd","Ik heb het je al duizend keer gezegd!"], "Expressão.", ["v-hyperbool"]),
    FB("«Deze tas weegt een ton» is een ___.", ["hyperbool"], "Hipérbole.", ["v-hyperbool"], choices=["hyperbool","understatement","climax"], tr="«Esta mala pesa uma tonelada» é uma hipérbole."),
    FE(["Het","hyperbool","maakt","de","zin","grappig."], 0, "De", "de hyperbool.", ["v-hyperbool"]),
    LI("Een overdrijving kan je geloofwaardigheid ondermijnen.", ["Een overdrijving kan je geloofwaardigheid ondermijnen"], "Um exagero pode minar a tua credibilidade.", "Aviso.", ["v-overdrijving"]),
    WO("Morro de fome!", ["Ik","sterf","van","de","honger!"], "Ordem.", ["v-hyperbool"]),
  ], diff=4, mins=4)

L(14, "Antítese", "Niet de woorden, maar de daden.",
  ["Usar oposições para dar força a uma ideia"],
  vocab=[N("v-antithese","antithese","antítese","de")],
  ex=[("«Niet de woorden, maar de daden tellen» is een antithese.","«Não são as palavras, mas os atos que contam» é uma antítese."),("Een antithese zet twee tegengestelde ideeën naast elkaar.","Uma antítese põe lado a lado duas ideias opostas.")],
  review=["v-tegenstelling","v-krachtig"],
  cefr=C, exs=[
    MA([("antithese","antítese"),("tegenstelling","oposição"),("krachtig","forte|vigoroso"),("drieslag","tríade")], "Oposição.", ["v-antithese","v-tegenstelling","v-krachtig","v-drieslag"]),
    MC("Qual é uma antítese?", ["*Klein van stuk, groot van hart.","Klein en lief.|Não opõe.","Heel klein.|Não."], "Identificar.", ["v-antithese"]),
    TR("pt-nl","Não são as palavras, mas os atos que contam.", ["Niet de woorden, maar de daden tellen","Niet woorden maar daden tellen"], "Antítese.", ["v-antithese"]),
    TR("pt-nl","É uma frase forte.", ["Het is een krachtige zin","Dat is een krachtige zin"], "krachtig.", ["v-krachtig"]),
    FB("«Wie zaait, zal oogsten» bevat geen ___, maar «rijk aan geld, arm aan tijd» wel.", ["antithese"], "Antítese.", ["v-antithese"], choices=["antithese","alliteratie","hyperbool"], tr="«Quem semeia colhe» não tem antítese, mas «rico em dinheiro, pobre em tempo» tem."),
    FE(["Een","antithese","maken","de","tekst","krachtig."], 2, "maakt", "Singular: maakt.", ["v-antithese"]),
    SW("Escreva uma antítese sobre a vida de imigrante.", ["Ver van huis, maar dicht bij mezelf."], ["Duas ideias opostas","Frase curta"], 5, "Criar.", ["v-antithese"]),
    LI("Rijk aan geld, maar arm aan tijd.", ["Rijk aan geld, maar arm aan tijd","Rijk aan geld maar arm aan tijd"], "Rico em dinheiro, mas pobre em tempo.", "Antítese.", ["v-antithese"]),
  ], diff=4, mins=4)

L(15, "A frase final", "Een sterke slotzin.",
  ["Terminar um texto com impacto"],
  vocab=[N("v-slotzin","slotzin","frase final","de"), X("v-een-punt-maken","een punt maken","defender um ponto|marcar posição")],
  ex=[("Een sterke slotzin blijft hangen.","Uma frase final forte fica na memória."),("Met dit artikel wil ik een punt maken.","Com este artigo quero marcar uma posição.")],
  review=["v-afsluiter","v-kortom"],
  cefr=C, exs=[
    MA([("slotzin","frase final"),("een punt maken","marcar posição"),("afsluiter","remate"),("kortom","em suma")], "Fecho.", ["v-slotzin","v-een-punt-maken","v-afsluiter","v-kortom"]),
    MC("Qual é a slotzin mais forte para um artigo sobre árvores na cidade?", ["*Wie vandaag een boom plant, geeft morgen schaduw.","Dat was mijn artikel.|Fraca.","Bomen zijn groen.|Banal."], "Escolher.", ["v-slotzin"]),
    TR("pt-nl","Uma frase final forte fica na memória.", ["Een sterke slotzin blijft hangen"], "slotzin.", ["v-slotzin"]),
    TR("pt-nl","Quero marcar uma posição.", ["Ik wil een punt maken"], "Expressão.", ["v-een-punt-maken"]),
    FB("Hij wilde met zijn speech een ___ maken.", ["punt"], "Expressão.", ["v-een-punt-maken"], choices=["punt","zin","slot"], tr="Ele queria marcar uma posição com o discurso."),
    FE(["De","slotzin","zijn","het","belangrijkst."], 2, "is", "Singular: is.", ["v-slotzin"]),
    SW("Escreva uma slotzin forte para um texto sobre aprender línguas.", ["Een nieuwe taal leren is niet alleen woorden verzamelen, maar een nieuwe wereld openen."], ["Memorável","Ligada ao tema"], 8, "Criar.", ["v-slotzin"]),
    LI("Laten we niet wachten tot het te laat is.", ["Laten we niet wachten tot het te laat is"], "Não esperemos até ser tarde demais.", "Slotzin com apelo.", ["v-slotzin"]),
  ], diff=4, mins=4)

L(16, "Abrir um artigo de opinião", "Prikkelen vanaf de eerste zin.",
  ["Escrever um título e uma abertura provocadores"],
  vocab=[X("v-prikkelen","prikkelen","estimular|provocar (interesse)","verb")],
  ex=[("Een goede titel prikkelt de nieuwsgierigheid.","Um bom título estimula a curiosidade."),("«Stop met recyclen!» — een titel die prikkelt, met een genuanceerd verhaal erachter.","«Parem de reciclar!» — um título que provoca, com uma história matizada por trás.")],
  review=["v-kop-pakkend","v-pakkende-opening","v-aanleiding"],
  cefr=C, exs=[
    MA([("prikkelen","estimular"),("pakkende titel","título cativante"),("een pakkende opening","abertura cativante"),("aanleiding","motivo|ocasião")], "Abertura.", ["v-prikkelen","v-kop-pakkend","v-pakkende-opening","v-aanleiding"]),
    MC("Um título provocador é aceitável se…", ["*o texto o justificar de forma honesta","enganar o leitor|Isso é clickbait.","não tiver relação|Não."], "Ética.", ["v-prikkelen"]),
    TR("pt-nl","O título estimula a curiosidade.", ["De titel prikkelt de nieuwsgierigheid"], "prikkelen.", ["v-prikkelen"]),
    TR("pt-nl","O motivo deste artigo é…", ["De aanleiding voor dit artikel is","De aanleiding van dit stuk is"], "aanleiding.", ["v-aanleiding"]),
    FB("Een goede opening ___ de lezer om verder te lezen.", ["prikkelt"], "Estimula.", ["v-prikkelen"], choices=["prikkelt","prikkel","geprikkeld"], tr="Uma boa abertura estimula o leitor a continuar."),
    FE(["Die","titel","prikkelen","mij."], 2, "prikkelt", "Singular: prikkelt.", ["v-prikkelen"]),
    SW("Escreva um título provocador e a primeira frase de um artigo de opinião sobre «trabalhar 4 dias por semana».", ["Titel: Werk minder, verdien meer!\nOpening: Het klinkt te mooi om waar te zijn, maar steeds meer bedrijven ontdekken dat een vierdaagse werkweek hun winst juist verhoogt."], ["Título provocador","Abertura ligada"], 25, "Abertura.", ["v-prikkelen"]),
    LI("De aanleiding voor dit stuk is een ervaring van vorige week.", ["De aanleiding voor dit stuk is een ervaring van vorige week"], "O motivo deste texto é uma experiência da semana passada.", "Abertura pessoal.", ["v-aanleiding"]),
  ], diff=4, mins=5)

L(17, "O argumento de peso", "Een zwaarwegend argument.",
  ["Hierarquizar argumentos por importância"],
  vocab=[X("v-zwaarwegend","zwaarwegend","de peso|importante","adjective")],
  ex=[("Het meest zwaarwegende argument bewaar ik voor het eind.","O argumento de maior peso guardo para o fim."),("Veiligheid is voor ons zwaarwegend.","A segurança pesa muito para nós.")],
  review=["v-tegenwerping","v-onderbouwd","v-aantoonbaar"],
  cefr=C, exs=[
    MA([("zwaarwegend","de peso"),("tegenwerping","objeção"),("onderbouwd","fundamentado"),("aantoonbaar","demonstrável")], "Argumentos.", ["v-zwaarwegend","v-tegenwerping","v-onderbouwd","v-aantoonbaar"]),
    MC("Onde colocar o argumento mais forte?", ["*no fim (ou no início), para ficar na memória","no meio, escondido|Perde impacto.","em nota de rodapé|Não."], "Estratégia.", ["v-zwaarwegend"]),
    TR("pt-nl","O argumento de maior peso guardo para o fim.", ["Het meest zwaarwegende argument bewaar ik voor het eind","Het zwaarstwegende argument bewaar ik voor het eind"], "Inversão.", ["v-zwaarwegend"]),
    TR("pt-nl","É um benefício demonstrável.", ["Het is een aantoonbaar voordeel","Dat is een aantoonbaar voordeel"], "aantoonbaar.", ["v-aantoonbaar"]),
    FB("De kosten zijn voor de gemeente een ___ argument.", ["zwaarwegend"], "het argument + een → sem -e.", ["v-zwaarwegend"], choices=["zwaarwegend","zwaarwegende","licht"], tr="Os custos são para a câmara um argumento de peso."),
    FE(["Dat","is","een","zwaarwegende","argument."], 3, "zwaarwegend", "het argument + een → sem -e.", ["v-zwaarwegend"]),
    LI("Een goed onderbouwd argument weegt zwaarder dan een emotioneel argument.", ["Een goed onderbouwd argument weegt zwaarder dan een emotioneel argument"], "Um argumento bem fundamentado pesa mais do que um argumento emocional.", "Princípio.", ["v-onderbouwd"]),
    WO("É um argumento de peso.", ["Het","is","een","zwaarwegend","argument"], "Ordem.", ["v-zwaarwegend"]),
  ], diff=5, mins=4)

L(18, "Uma petição", "Handtekeningen verzamelen.",
  ["Escrever e promover uma petição"],
  vocab=[N("v-petitie","petitie","petição","de","petities"), X("v-handtekeningen-verzamelen","handtekeningen verzamelen","recolher assinaturas","verb")],
  ex=[("We zijn een petitie gestart voor een zebrapad.","Iniciámos uma petição por uma passadeira."),("In een week hebben we 500 handtekeningen verzameld.","Numa semana recolhemos 500 assinaturas.")],
  review=["v-handtekening","v-indienen"],
  cefr=C, exs=[
    MA([("petitie","petição"),("handtekeningen verzamelen","recolher assinaturas"),("handtekening","assinatura"),("indienen","apresentar")], "Petição.", ["v-petitie","v-handtekeningen-verzamelen","v-handtekening","v-indienen"]),
    TR("pt-nl","Iniciámos uma petição.", ["We zijn een petitie gestart","We hebben een petitie gestart","Wij zijn een petitie begonnen"], "starten.", ["v-petitie"]),
    TR("pt-nl","Recolhemos 500 assinaturas.", ["We hebben 500 handtekeningen verzameld","Wij hebben vijfhonderd handtekeningen verzameld"], "verzamelen.", ["v-handtekeningen-verzamelen"]),
    MC("Uma petição eficaz tem…", ["*um pedido concreto e um destinatário claro","só indignação|Fraco.","nenhum objetivo|Não."], "Estrutura.", ["v-petitie"]),
    FB("We bieden de petitie maandag aan de ___ aan.", ["gemeenteraad"], "Assembleia.", ["v-gemeenteraad"], choices=["gemeenteraad","petitie","handtekening"], tr="Entregamos a petição segunda-feira à assembleia municipal."),
    FE(["De","petitie","hebben","1.000","handtekeningen."], 2, "heeft", "Singular: heeft.", ["v-petitie"]),
    SW("Escreva o texto de uma petição curta (3–4 frases): problema, pedido concreto, destinatário.", ["Aan de gemeenteraad van Leiden: Op de Morsweg rijden auto's veel te hard langs de basisschool. Wij vragen u om vóór de zomer een zebrapad en drempels aan te leggen. Teken deze petitie voor een veiliger schoolroute!"], ["Destinatário","Problema","Pedido concreto"], 35, "Petição.", ["v-petitie"]),
    LI("Teken de petitie en deel hem met je buren.", ["Teken de petitie en deel hem met je buren"], "Assina a petição e partilha-a com os vizinhos.", "Apelo.", ["v-petitie"]),
  ], diff=4, mins=5)

L(19, "Requerimento à administração", "Een verzoekschrift aan de gemeente.",
  ["Escrever um requerimento formal"],
  vocab=[N("v-verzoekschrift","verzoekschrift","requerimento","het"), N("v-ambtenaar-gemeente","ambtenaar","funcionário público","de","ambtenaren")],
  ex=[("Ik dien een verzoekschrift in voor een parkeerplaats voor gehandicapten.","Apresento um requerimento para um lugar de estacionamento para deficientes."),("Een ambtenaar behandelt uw verzoek.","Um funcionário trata do seu pedido.")],
  review=["v-indienen","v-verzoeken","v-kenmerk"],
  cefr=C, exs=[
    MA([("verzoekschrift","requerimento"),("ambtenaar","funcionário público"),("indienen","apresentar"),("kenmerk","referência")], "Requerimento.", ["v-verzoekschrift","v-ambtenaar-gemeente","v-indienen","v-kenmerk"]),
    AR("verzoekschrift", "requerimento", "het", "het schrift.", ["v-verzoekschrift"]),
    TR("pt-nl","Apresento um requerimento.", ["Ik dien een verzoekschrift in"], "indienen.", ["v-verzoekschrift"]),
    TR("pt-nl","Um funcionário trata do pedido.", ["Een ambtenaar behandelt het verzoek","Een ambtenaar behandelt uw verzoek"], "ambtenaar.", ["v-ambtenaar-gemeente"]),
    MC("Num verzoekschrift indica-se sempre…", ["*o que se pede e porquê, com documentos de apoio","uma ameaça|Não.","só o nome|Não."], "Conteúdo.", ["v-verzoekschrift"]),
    FB("Vermeld bij correspondentie altijd het ___ van de brief.", ["kenmerk"], "Referência.", ["v-kenmerk"], choices=["kenmerk","verzoek","ambtenaar"], tr="Indique sempre na correspondência a referência da carta."),
    FE(["De","verzoekschrift","is","ontvangen."], 0, "Het", "het verzoekschrift.", ["v-verzoekschrift"]),
    LI("Hierbij verzoek ik u vriendelijk mijn aanvraag opnieuw te beoordelen.", ["Hierbij verzoek ik u vriendelijk mijn aanvraag opnieuw te beoordelen"], "Pela presente peço-lhe amavelmente que reavalie o meu pedido.", "Fórmula.", ["v-verzoeken"]),
  ], diff=5, mins=5)

L(20, "Participação pública escrita", "Een inspraakreactie.",
  ["Responder por escrito a um plano municipal"],
  vocab=[N("v-inspraakreactie","inspraakreactie","contributo na consulta pública","de")],
  ex=[("Tot 1 maart kunt u een inspraakreactie indienen op het bestemmingsplan.","Até 1 de março pode enviar um contributo sobre o plano de ordenamento."),("In mijn zienswijze leg ik uit waarom ik tegen de nieuwe weg ben.","No meu parecer explico porque sou contra a nova estrada.")],
  review=["v-zienswijze","v-inspraak"],
  cefr=C, exs=[
    MA([("inspraakreactie","contributo de consulta pública"),("zienswijze","parecer"),("inspraak","participação pública"),("indienen","apresentar")], "Participação.", ["v-inspraakreactie","v-zienswijze","v-inspraak","v-indienen"]),
    TR("pt-nl","Pode enviar um contributo até 1 de março.", ["Tot 1 maart kunt u een inspraakreactie indienen"], "Inversão.", ["v-inspraakreactie"]),
    TR("pt-nl","No meu parecer explico porquê.", ["In mijn zienswijze leg ik uit waarom","In mijn zienswijze leg ik uit waarom ik tegen ben"], "zienswijze.", ["v-zienswijze"]),
    MC("Um contributo convincente baseia-se em…", ["*consequências concretas para os moradores","«ik vind het gewoon lelijk»|Fraco.","insultos aos vereadores|Não."], "Qualidade.", ["v-inspraakreactie"]),
    FB("Bewoners dienden meer dan honderd ___ in.", ["inspraakreacties"], "Plural.", ["v-inspraakreactie"], choices=["inspraakreacties","zienswijze","petities"], tr="Os moradores enviaram mais de cem contributos."),
    FE(["Mijn","zienswijze","zijn","duidelijk."], 2, "is", "Singular: is.", ["v-zienswijze"]),
    SW("Escreva uma inspraakreactie curta (3–4 frases) contra o corte de árvores numa praça.", ["Geachte leden van de gemeenteraad,\n\nIn het nieuwe plan voor het Stationsplein worden twaalf oude bomen gekapt. Deze bomen geven in de zomer verkoeling en zijn een thuis voor vogels. Ik verzoek u het plan zo aan te passen dat de bomen blijven staan.\n\nMet vriendelijke groet,\nR. Costa"], ["Referência ao plano","Consequência","Pedido"], 40, "Participar.", ["v-inspraakreactie"]),
    LI("Uw reactie wordt meegenomen in de besluitvorming.", ["Uw reactie wordt meegenomen in de besluitvorming"], "A sua reação é tida em conta na decisão.", "Resposta oficial.", ["v-inspraakreactie"]),
  ], diff=5, mins=5)

L(21, "Escrever ao executivo municipal", "Het college van B en W.",
  ["Dirigir-se corretamente ao executivo municipal"],
  vocab=[N("v-college-b-en-w","college van burgemeester en wethouders","executivo municipal (B en W)","het")],
  ex=[("Ik schrijf u als bewoner van de wijk Oost.","Escrevo-vos como morador do bairro Oost."),("Het college van B en W heeft besloten de bibliotheek te sluiten.","O executivo municipal decidiu fechar a biblioteca.")],
  review=["v-wethouder","v-burgemeester","v-geachte"],
  cefr=C, exs=[
    MA([("college van B en W","executivo municipal"),("wethouder","vereador"),("burgemeester","presidente da câmara"),("geachte","exmo.")], "Município.", ["v-college-b-en-w","v-wethouder","v-burgemeester","v-geachte"]),
    AR("college van B en W", "executivo municipal", "het", "het college.", ["v-college-b-en-w"]),
    MC("Saudação adequada a uma carta ao executivo:", ["*Geacht college,","Hoi allemaal,|Informal.","Beste mensen,|Pouco formal."], "Fórmula.", ["v-college-b-en-w"]),
    TR("pt-nl","O executivo decidiu fechar a biblioteca.", ["Het college heeft besloten de bibliotheek te sluiten","Het college van B en W heeft besloten de bibliotheek te sluiten"], "besluiten.", ["v-college-b-en-w"]),
    TR("pt-nl","Escrevo-vos como moradora.", ["Ik schrijf u als bewoner","Ik schrijf u als bewoonster"], "als.", ["v-college-b-en-w"]),
    FB("Geacht ___, hierbij vraag ik uw aandacht voor…", ["college"], "Saudação.", ["v-college-b-en-w"], choices=["college","raad","wethouder"], tr="Exmo. executivo, pela presente chamo a vossa atenção para…"),
    FE(["Het","college","hebben","besloten."], 2, "heeft", "Singular: heeft.", ["v-college-b-en-w"]),
    LI("Ik verzoek het college dringend dit besluit te heroverwegen.", ["Ik verzoek het college dringend dit besluit te heroverwegen"], "Peço urgentemente ao executivo que reconsidere esta decisão.", "Apelo formal.", ["v-college-b-en-w"]),
  ], diff=5, mins=4)

L(22, "Carta de motivação avançada (1)", "Met belangstelling volg ik…",
  ["Abrir uma carta de motivação de forma original"],
  vocab=[X("v-met-belangstelling","met belangstelling","com interesse"), X("v-mijn-drijfveer","mijn drijfveer is…","o que me move é…")],
  ex=[("Al jaren volg ik met belangstelling uw projecten.","Há anos acompanho com interesse os vossos projetos."),("Mijn drijfveer is mensen helpen hun weg te vinden.","O que me move é ajudar as pessoas a encontrar o seu caminho.")],
  review=["v-drijfveer","v-met-interesse","v-motivatiebrief"],
  cefr=C, exs=[
    MA([("met belangstelling","com interesse"),("mijn drijfveer is…","o que me move é…"),("drijfveer","motivação|motor"),("motivatiebrief","carta de motivação")], "Motivação.", ["v-met-belangstelling","v-mijn-drijfveer","v-drijfveer","v-motivatiebrief"]),
    MC("Abertura mais original:", ["*Toen ik als kind mijn opa hielp in zijn tuin, wist ik al dat ik iets met natuur wilde doen.","Hierbij solliciteer ik.|Banal.","Ik heb uw vacature gezien.|Banal."], "Originalidade.", ["v-mijn-drijfveer"]),
    TR("pt-nl","Acompanho com interesse os vossos projetos.", ["Ik volg uw projecten met belangstelling","Met belangstelling volg ik uw projecten"], "met belangstelling.", ["v-met-belangstelling"]),
    TR("pt-nl","O que me move é ajudar pessoas.", ["Mijn drijfveer is mensen helpen","Mijn drijfveer is om mensen te helpen"], "drijfveer.", ["v-mijn-drijfveer"]),
    FB("Al jaren volg ik uw organisatie met ___.", ["belangstelling"], "Interesse.", ["v-met-belangstelling"], choices=["belangstelling","drijfveer","motivatie"], tr="Há anos que acompanho a vossa organização com interesse."),
    FE(["Mijn","drijfveer","zijn","duurzaamheid."], 2, "is", "Singular: is.", ["v-mijn-drijfveer"]),
    SW("Escreva o primeiro parágrafo de uma carta de motivação começando com uma pequena história pessoal (3 frases).", ["Als kind keek ik elke ochtend naar de schepen in de haven van Leixões. Die fascinatie voor logistiek is nooit verdwenen. Daarom volg ik met grote belangstelling de groei van uw bedrijf in de Rotterdamse haven."], ["História pessoal","Ligação à empresa"], 35, "Abertura.", ["v-mijn-drijfveer"]),
    LI("Wat mij in uw organisatie aanspreekt, is de aandacht voor mensen.", ["Wat mij in uw organisatie aanspreekt, is de aandacht voor mensen","Wat mij in uw organisatie aanspreekt is de aandacht voor mensen"], "O que me atrai na vossa organização é a atenção às pessoas.", "Ligação.", ["v-met-belangstelling"]),
  ], diff=5, mins=5)

L(23, "Carta de motivação avançada (2)", "Zelfreflectie.",
  ["Mostrar autoconhecimento e ligação à vaga"],
  vocab=[N("v-zelfreflectie","zelfreflectie","autorreflexão","de")],
  ex=[("Werkgevers waarderen zelfreflectie.","Os empregadores valorizam a autorreflexão."),("Mijn ervaring sluit goed aan bij uw vacature.","A minha experiência encaixa bem na vossa vaga.")],
  review=["v-aansluiten-bij","v-kwaliteit","v-valkuil"],
  cefr=C, exs=[
    MA([("zelfreflectie","autorreflexão"),("aansluiten bij","encaixar em"),("kwaliteit","qualidade"),("valkuil","armadilha")], "Reflexão.", ["v-zelfreflectie","v-aansluiten-bij","v-kwaliteit","v-valkuil"]),
    TR("pt-nl","A minha experiência encaixa bem na vaga.", ["Mijn ervaring sluit goed aan bij de vacature","Mijn ervaring sluit goed aan bij uw vacature"], "aansluiten bij.", ["v-aansluiten-bij"]),
    TR("pt-nl","Os empregadores valorizam a autorreflexão.", ["Werkgevers waarderen zelfreflectie"], "zelfreflectie.", ["v-zelfreflectie"]),
    MC("Mostrar zelfreflectie numa carta é…", ["*mencionar um ponto a melhorar e o que fez para melhorar","dizer que é perfeito|Pouco credível.","criticar ex-colegas|Não."], "Estratégia.", ["v-zelfreflectie"]),
    FB("Mijn opleiding sluit perfect ___ bij deze functie.", ["aan"], "Separável.", ["v-aansluiten-bij"], choices=["aan","op","in"], tr="A minha formação encaixa perfeitamente nesta função."),
    FE(["Mijn","ervaring","sluit","goed","aan","op","de","functie."], 5, "bij", "aansluiten bij.", ["v-aansluiten-bij"]),
    SW("Escreva 2–3 frases de uma carta de motivação que mostrem autorreflexão.", ["In mijn vorige baan merkte ik dat ik te veel zelf wilde doen. Ik heb daarom een cursus coaching gevolgd en leer nu bewust taken te delegeren. Die ervaring wil ik graag inzetten als teamleider bij uw organisatie."], ["Ponto a melhorar","Ação","Ligação à vaga"], 35, "Reflexão.", ["v-zelfreflectie"]),
    LI("Ik ben me bewust van mijn valkuilen en werk daar actief aan.", ["Ik ben me bewust van mijn valkuilen en werk daar actief aan"], "Tenho consciência das minhas armadilhas e trabalho ativamente nelas.", "Reflexão.", ["v-valkuil"]),
  ], diff=5, mins=5)

L(24, "Carta de motivação avançada (3)", "Graag ga ik met u in gesprek.",
  ["Terminar uma carta com um apelo convincente"],
  vocab=[X("v-in-gesprek-gaan","met iemand in gesprek gaan","conversar com alguém (formalmente)","verb")],
  ex=[("Graag ga ik met u in gesprek om mijn motivatie toe te lichten.","Teria todo o gosto em conversar consigo para explicar a minha motivação."),("Ik zie uw reactie met belangstelling tegemoet.","Aguardo com interesse a vossa resposta.")],
  review=["v-tegemoetzien","v-met-vriendelijke-groet"],
  cefr=C, exs=[
    MA([("met iemand in gesprek gaan","conversar com alguém"),("tegemoetzien","aguardar"),("met vriendelijke groet","com os melhores cumprimentos"),("met belangstelling","com interesse")], "Fecho.", ["v-in-gesprek-gaan","v-tegemoetzien","v-met-vriendelijke-groet","v-met-belangstelling"]),
    MC("Fecho mais convincente:", ["*Graag licht ik in een gesprek toe hoe ik uw team kan versterken.","Bel me maar.|Informal.","Ik hoop dat u me kiest, alstublieft.|Suplicante."], "Fecho.", ["v-in-gesprek-gaan"]),
    TR("pt-nl","Teria todo o gosto em conversar consigo.", ["Graag ga ik met u in gesprek","Ik ga graag met u in gesprek"], "Expressão.", ["v-in-gesprek-gaan"]),
    TR("pt-nl","Aguardo com interesse a sua resposta.", ["Ik zie uw reactie met belangstelling tegemoet"], "tegemoetzien.", ["v-tegemoetzien"]),
    FB("Ik zie uw reactie met belangstelling ___.", ["tegemoet"], "Separável.", ["v-tegemoetzien"], choices=["tegemoet","tegen","toe"], tr="Aguardo com interesse a sua resposta."),
    FE(["Graag","gaan","ik","met","u","in","gesprek."], 1, "ga", "ik: ga.", ["v-in-gesprek-gaan"]),
    LI("Graag licht ik mijn motivatie toe in een persoonlijk gesprek.", ["Graag licht ik mijn motivatie toe in een persoonlijk gesprek"], "Teria gosto em explicar a minha motivação numa conversa pessoal.", "Fecho.", ["v-in-gesprek-gaan"]),
    WO("Aguardo a vossa resposta.", ["Ik","zie","uw","reactie","tegemoet"], "Separável.", ["v-tegemoetzien"]),
  ], diff=4, mins=4)

L(25, "Rever: gralhas", "Proeflezen.",
  ["Rever um texto à procura de erros"],
  vocab=[X("v-proeflezen","proeflezen","rever (um texto)","verb"), N("v-tikfout","tikfout","gralha","de","tikfouten")],
  ex=[("Laat je tekst altijd door iemand anders proeflezen.","Pede sempre a outra pessoa que reveja o teu texto."),("Er zit een tikfout in de eerste zin.","Há uma gralha na primeira frase.")],
  review=["v-redigeren","v-spelfout"],
  cefr=C, exs=[
    MA([("proeflezen","rever"),("tikfout","gralha"),("redigeren","editar"),("spelfout","erro ortográfico")], "Rever.", ["v-proeflezen","v-tikfout","v-redigeren","v-spelfout"]),
    MC("Diferença entre tikfout e spelfout:", ["*tikfout = erro de digitação; spelfout = não saber a grafia","iguais|Há nuance.","tikfout é gramatical|Não."], "Nuance.", ["v-tikfout"]),
    TR("pt-nl","Há uma gralha na primeira frase.", ["Er zit een tikfout in de eerste zin","Er staat een tikfout in de eerste zin"], "tikfout.", ["v-tikfout"]),
    TR("pt-nl","Pede a alguém que reveja o texto.", ["Laat iemand je tekst proeflezen","Laat je tekst door iemand proeflezen"], "laten + proeflezen.", ["v-proeflezen"]),
    FE(["Wij","heben","uw","brief","ontvangen."], 1, "hebben", "Gralha: hebben.", ["v-tikfout"]),
    FE(["Met","vriendelijke","groed,","Ana"], 2, "groet,", "Gralha: groet.", ["v-tikfout"]),
    FB("Wie heeft dit rapport ___?", ["geproeflezen"], "Particípio.", ["v-proeflezen"], choices=["geproeflezen","proefgelezen","geproefleest"], tr="Quem reviu este relatório?"),
    LI("Lees je tekst een dag later opnieuw: dan zie je meer fouten.", ["Lees je tekst een dag later opnieuw: dan zie je meer fouten","Lees je tekst een dag later opnieuw, dan zie je meer fouten"], "Relê o texto um dia depois: vês mais erros.", "Dica.", ["v-proeflezen"]),
  ], diff=4, mins=4)

L(26, "Rever: coerência", "Consistent schrijven.",
  ["Garantir coerência de forma e estilo"],
  vocab=[X("v-consistent","consistent","coerente|consistente","adjective"), N("v-spellingcontrole","spellingcontrole","corretor ortográfico","de")],
  ex=[("Schrijf consistent: kies «u» of «je», niet allebei.","Escreve de forma coerente: escolhe «u» ou «je», não ambos."),("De spellingcontrole vindt niet alle fouten.","O corretor ortográfico não encontra todos os erros.")],
  review=["v-samenhang","v-stijlbreuk"],
  cefr=C, exs=[
    MA([("consistent","coerente"),("spellingcontrole","corretor ortográfico"),("samenhang","coesão"),("stijlbreuk","rutura de estilo")], "Coerência.", ["v-consistent","v-spellingcontrole","v-samenhang","v-stijlbreuk"]),
    MC("Erro de consistência:", ["*Usar «u» no 1.º parágrafo e «je» no 2.º","Usar sempre «u»|Coerente.","Usar sempre «je»|Coerente."], "Identificar.", ["v-consistent"]),
    MC("O corretor ortográfico NÃO deteta…", ["*«word» em vez de «wordt» (palavra existente)","«hbeben»|Deteta.","«grooet»|Deteta."], "Limites.", ["v-spellingcontrole"]),
    TR("pt-nl","Escreve de forma coerente.", ["Schrijf consistent"], "consistent.", ["v-consistent"]),
    TR("pt-nl","O corretor não encontra todos os erros.", ["De spellingcontrole vindt niet alle fouten"], "spellingcontrole.", ["v-spellingcontrole"]),
    FB("Gebruik ___ dezelfde term, niet afwisselend «klant» en «cliënt».", ["consistent"], "Advérbio.", ["v-consistent"], choices=["consistent","consistente","samenhang"], tr="Usa consistentemente o mesmo termo, não alternadamente «cliente» e «utente»."),
    FE(["De","spellingcontrole","vinden","geen","fouten."], 2, "vindt", "Singular: vindt.", ["v-spellingcontrole"]),
    LI("Een consistente opmaak oogt professioneel.", ["Een consistente opmaak oogt professioneel"], "Uma formatação coerente parece profissional.", "Dica.", ["v-consistent"]),
  ], diff=4, mins=4)

L(27, "Edição final", "De eindredactie.",
  ["Cortar e polir um texto na edição final"],
  vocab=[N("v-eindredactie","eindredactie","edição final","de")],
  ex=[("Tijdens de eindredactie schrap ik overbodige zinnen.","Na edição final corto frases supérfluas."),("Minder is vaak meer.","Menos é muitas vezes mais.")],
  review=["v-schrappen","v-beknopt","v-herschrijven"],
  cefr=C, exs=[
    MA([("eindredactie","edição final"),("schrappen","cortar"),("beknopt","conciso"),("herschrijven","reescrever")], "Edição.", ["v-eindredactie","v-schrappen","v-beknopt","v-herschrijven"]),
    MC("Na eindredactie corta-se primeiro…", ["*repetições e palavras vazias («eigenlijk», «gewoon»)","a tese|Não!","os exemplos todos|Não necessariamente."], "Estratégia.", ["v-schrappen"]),
    TR("pt-nl","Na edição final corto frases supérfluas.", ["Tijdens de eindredactie schrap ik overbodige zinnen","In de eindredactie schrap ik overbodige zinnen"], "Inversão.", ["v-eindredactie"]),
    TR("pt-nl","Menos é muitas vezes mais.", ["Minder is vaak meer"], "Expressão.", ["v-beknopt"]),
    FB("Schrap alle ___ woorden.", ["overbodige"], "Supérfluas.", ["v-schrappen"], choices=["overbodige","overbodig","belangrijke"], tr="Corta todas as palavras supérfluas."),
    SW("Torne mais concisa (máx. 12 palavras): «Eigenlijk denk ik persoonlijk gewoon dat het in principe misschien wel een redelijk goed idee zou kunnen zijn.»", ["Ik denk dat het een goed idee is."], ["Conciso","Mesmo sentido"], 4, "Cortar.", ["v-schrappen","v-beknopt"]),
    FE(["Zij","doet","de","eindredactie","van","het","tijdschriften."], 6, "tijdschrift.", "het + singular.", ["v-eindredactie"]),
    LI("Elke zin moet iets toevoegen.", ["Elke zin moet iets toevoegen"], "Cada frase tem de acrescentar algo.", "Princípio.", ["v-eindredactie"]),
  ], diff=5, mins=4)

L(28, "Ler em voz alta", "Hardop voorlezen als controle.",
  ["Usar a leitura em voz alta para rever ritmo e clareza"],
  vocab=[X("v-hardop-voorlezen","hardop voorlezen","ler em voz alta","verb"), V("v-ritme","ritme","ritmo","noun","het")],
  ex=[("Lees je tekst hardop voor; dan hoor je lange zinnen meteen.","Lê o texto em voz alta; assim ouves logo as frases longas."),("Waar je adem tekortkomt, is de zin te lang.","Onde te falta o fôlego, a frase é longa demais.")],
  review=["v-leesbaar"],
  cefr=C, exs=[
    MA([("hardop voorlezen","ler em voz alta"),("leesbaar","legível"),("beknopt","conciso"),("redigeren","editar")], "Rever.", ["v-hardop-voorlezen","v-leesbaar","v-beknopt","v-redigeren"]),
    MC("Ler em voz alta ajuda sobretudo a detetar…", ["*frases longas e ritmo estranho","erros de impressão do papel|Não.","a cor da letra|Não."], "Utilidade.", ["v-hardop-voorlezen"]),
    TR("pt-nl","Lê o texto em voz alta.", ["Lees je tekst hardop voor","Lees de tekst hardop voor"], "Separável.", ["v-hardop-voorlezen"]),
    TR("pt-nl","A frase é longa demais.", ["De zin is te lang"], "te lang.", ["v-leesbaar"]),
    FB("Ik heb mijn speech drie keer hardop ___.", ["voorgelezen"], "Particípio separável.", ["v-hardop-voorlezen"], choices=["voorgelezen","gevoorlezen","voorlezen"], tr="Li o meu discurso três vezes em voz alta."),
    FE(["Ik","lees","de","tekst","hardop","op."], 5, "voor.", "voorlezen.", ["v-hardop-voorlezen"]),
    LI("Klinkt het natuurlijk als je het hardop zegt?", ["Klinkt het natuurlijk als je het hardop zegt","Klinkt het natuurlijk als je het hardop zegt?"], "Soa natural quando o dizes em voz alta?", "Pergunta de revisão.", ["v-natuurlijk-klinken"]),
    WO("Lê em voz alta.", ["Lees","het","hardop","voor"], "Separável.", ["v-hardop-voorlezen"]),
  ], diff=3, mins=4)

L(29, "Prática: um artigo de opinião completo", "Van idee tot publicatie.",
  ["Escrever, rever e polir um artigo de opinião B2"],
  vocab=[N("v-publicatie","publicatie","publicação","de")],
  ex=[("Na drie versies was het stuk klaar voor publicatie.","Depois de três versões, o texto estava pronto para publicação.")],
  review=["v-alliteratie","v-antithese","v-de-lezer-aanspreken","v-slotzin","v-zwaarwegend","v-prikkelen","v-proeflezen","v-eindredactie"],
  cefr=C, exs=[
    MA([("antithese","antítese"),("slotzin","frase final"),("proeflezen","rever"),("publicatie","publicação")], "Revisão.", ["v-antithese","v-slotzin","v-proeflezen","v-publicatie"]),
    MC("Ordem de trabalho mais eficaz:", ["*plano → rascunho → herschrijven → eindredactie → proeflezen","proeflezen → plano|Não.","publicar sem rever|Não."], "Processo.", ["v-eindredactie"]),
    TR("pt-nl","O texto está pronto para publicação.", ["Het stuk is klaar voor publicatie","De tekst is klaar voor publicatie"], "publicatie.", ["v-publicatie"]),
    FE(["Het","stuk","zijn","klaar","voor","publicatie."], 2, "is", "Singular: is.", ["v-publicatie"]),
    SW("Escreva um artigo de opinião (cerca de 180 palavras) sobre um tema à escolha. Inclua: título provocador, abertura que se dirige ao leitor, dois argumentos (o mais forte no fim), uma objeção com resposta, pelo menos uma figura de estilo (aliteração, antítese, drieslag) e uma slotzin forte. Depois reveja-o.", ["Titel: Geef de straat terug aan de kinderen\n\nWeet u nog waar u als kind speelde? Waarschijnlijk op straat. Mijn kinderen kunnen dat niet: onze straat is een parkeerplaats geworden.\n\nTen eerste maken minder auto's de wijk veiliger. Ouders durven hun kinderen weer zelf naar school te laten fietsen.\n\nTegenstanders zeggen dat bewoners dan geen parkeerplek meer hebben. Dat klopt weliswaar, maar een buurtgarage op vijf minuten lopen lost dat op.\n\nHet zwaarstwegende argument is echter dit: kinderen die buiten spelen, bewegen meer, maken meer vrienden en leren hun buurt kennen. Spelen, sporten en samen zijn: dat hoort op straat.\n\nNiet de auto, maar het kind verdient de ruimte."], ["Título","Abertura ao leitor","Argumentos hierarquizados","Objeção","Figura de estilo","Slotzin"], 150, "Artigo final.", ["v-publicatie"]),
  ], diff=5, mins=8)

W()
