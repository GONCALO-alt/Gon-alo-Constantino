import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u16")
C = "B1-B2"
# Lições de aprofundamento (10–25): inferir, interpretar e rever a Secção 6.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Ler nas entrelinhas", "Het is hier een beetje koud…",
  ["Perceber pedidos e críticas indiretas"],
  vocab=[X("v-wat-bedoelt-hij-eigenlijk","wat bedoelt hij eigenlijk?","o que quer ele dizer, afinal?")],
  ex=[("«Het is hier een beetje koud» kan betekenen: doe het raam dicht.","«Está um bocadinho frio aqui» pode significar: fecha a janela."),("Je moet soms tussen de regels door lezen.","Às vezes tens de ler nas entrelinhas.")],
  review=["v-tussen-de-regels","v-impliciet","v-expliciet","v-suggereren"],
  cefr=C, exs=[
    MA([("tussen de regels door lezen","ler nas entrelinhas"),("impliciet","implícito"),("expliciet","explícito"),("suggereren","sugerir")], "Inferir.", ["v-tussen-de-regels","v-impliciet","v-expliciet","v-suggereren"]),
    MC("Colega: «Goh, de printer is wéér leeg.» O que quer provavelmente?", ["*que alguém ponha papel/tinta (talvez tu)","informar só por informar|Pouco provável.","comprar uma impressora|Não."], "Pedido implícito.", ["v-impliciet"]),
    MC("Anfitrião às 23h30: «Nou, het is alweer laat, hè?»", ["*sugere que está na hora de ir embora","quer mais café|Não.","pergunta as horas|Não."], "Sugestão.", ["v-suggereren"]),
    TR("pt-nl","Às vezes tens de ler nas entrelinhas.", ["Soms moet je tussen de regels door lezen","Je moet soms tussen de regels door lezen"], "Expressão.", ["v-tussen-de-regels"]),
    TR("pt-nl","O que quer ele dizer, afinal?", ["Wat bedoelt hij eigenlijk","Wat bedoelt hij eigenlijk?"], "Pergunta.", ["v-wat-bedoelt-hij-eigenlijk"]),
    FB("Ze zei het niet letterlijk; het was ___.", ["impliciet"], "Implícito.", ["v-impliciet"], choices=["impliciet","expliciet","letterlijk"], tr="Ela não o disse literalmente; foi implícito."),
    FE(["Ze","zegt","het","niet","expliciete."], 4, "expliciet.", "Advérbio: sem -e.", ["v-expliciet"]),
    MC("Os neerlandeses são em geral mais diretos do que os portugueses, mas…", ["*também usam indiretas em situações delicadas","nunca usam indiretas|Generalização.","só falam por indiretas|Não."], "Nuance cultural.", ["v-tussen-de-regels"]),
    LI("Wat er niet gezegd wordt, is soms belangrijker.", ["Wat er niet gezegd wordt, is soms belangrijker","Wat er niet gezegd wordt is soms belangrijker"], "O que não é dito às vezes é mais importante.", "Reflexão.", ["v-tussen-de-regels"]),
  ], diff=5, mins=5)

L(11, "Ironia", "Lekker weertje, hè?",
  ["Reconhecer ironia na conversa"],
  vocab=[X("v-ironisch-bedoeld","ironisch bedoeld","dito com ironia"), X("v-het-was-niet-serieus","het was niet serieus bedoeld","não era a sério")],
  ex=[("«Lekker weertje, hè?» zei hij, terwijl het stortregende.","«Que tempinho bom, hein?», disse ele, enquanto chovia a potes."),("Dat was ironisch bedoeld!","Isso foi dito com ironia!"),("Sorry, het was niet serieus bedoeld.","Desculpa, não era a sério.")],
  review=["v-ironisch","v-sarcastisch"],
  cefr=C, exs=[
    MA([("ironisch bedoeld","dito com ironia"),("het was niet serieus bedoeld","não era a sério"),("ironie","ironia"),("sarcastisch","sarcástico")], "Ironia.", ["v-ironisch-bedoeld","v-het-was-niet-serieus","v-sarcastisch"]),
    MC("Chove a potes. Alguém diz: «Wat een heerlijk zomerweer!» É…", ["*ironia","um elogio sincero|Não.","uma previsão|Não."], "Contexto.", ["v-ironisch-bedoeld"]),
    MC("Colega chega 1h atrasado. O chefe: «Zo, goedemiddag!» (às 10h). Significa…", ["*crítica irónica ao atraso","cumprimento normal|Não, são 10h.","convite para almoçar|Não."], "Ironia.", ["v-ironisch-bedoeld"]),
    TR("pt-nl","Isso foi dito com ironia!", ["Dat was ironisch bedoeld","Dat was ironisch bedoeld!"], "Expressão.", ["v-ironisch-bedoeld"]),
    TR("pt-nl","Não era a sério.", ["Het was niet serieus bedoeld","Het was niet serieus"], "Expressão.", ["v-het-was-niet-serieus"]),
    FB("Hij bedoelde het ___; hij vond het eigenlijk vreselijk.", ["ironisch"], "Ironia.", ["v-ironisch-bedoeld"], choices=["ironisch","serieus","letterlijk"], tr="Ele disse-o com ironia; na verdade achou horrível."),
    FE(["Het","was","niet","serieuze","bedoeld."], 3, "serieus", "Advérbio: sem -e.", ["v-het-was-niet-serieus"]),
    DL([("Collega","Nou, geweldig: de trein heeft wéér vertraging.","Ora, fantástico: o comboio está outra vez atrasado."),("Jij","","")], ["*Haha, ja, echt «geweldig». Elke week hetzelfde!","Fijn dat je blij bent!|Não percebeu a ironia.","Ironie.|Incompleto."], "Perceber e responder.", ["v-ironisch-bedoeld"]),
    LI("Op internet is ironie moeilijk te herkennen.", ["Op internet is ironie moeilijk te herkennen"], "Na internet a ironia é difícil de reconhecer.", "Reflexão.", []),
  ], diff=4, mins=5)

L(12, "Dizer menos do que se pensa", "Niet verkeerd!",
  ["Perceber o «understatement» neerlandês"],
  vocab=[X("v-niet-verkeerd","niet verkeerd","nada mau|muito bom"), X("v-niet-onaardig","niet onaardig","nada mau (formal)"),
         N("v-understatement","understatement","eufemismo|atenuação","het")],
  ex=[("Dat salaris is niet verkeerd!","Esse salário não é nada mau!"),("Het resultaat was niet onaardig.","O resultado foi bastante bom."),("«Het valt wel mee» is vaak een understatement.","«Não é assim tão mau» é muitas vezes uma atenuação.")],
  review=["v-wel-meevallen","v-best-wel"],
  cefr=C, exs=[
    MA([("niet verkeerd","nada mau"),("niet onaardig","nada mau (formal)"),("understatement","atenuação"),("het valt wel mee","não é tão mau")], "Atenuação.", ["v-niet-verkeerd","v-niet-onaardig","v-understatement","v-wel-meevallen"]),
    MC("«Dat uitzicht is niet verkeerd» numa vista fantástica significa…", ["*a vista é muito boa (atenuação)","a vista não está errada|Literal.","a vista é feia|Não."], "Understatement.", ["v-niet-verkeerd"]),
    TR("pt-nl","Esse salário não é nada mau!", ["Dat salaris is niet verkeerd","Dat salaris is niet verkeerd!","Dat salaris is niet slecht"], "niet verkeerd.", ["v-niet-verkeerd"]),
    TR("nl-pt","Het resultaat was niet onaardig.", ["O resultado foi bastante bom","O resultado não foi nada mau"], "Atenuação.", ["v-niet-onaardig"]),
    FB("Een eigen tuin in Amsterdam? Dat is niet ___!", ["verkeerd"], "Atenuação.", ["v-niet-verkeerd"], choices=["verkeerd","goed","slecht"], tr="Um jardim próprio em Amesterdão? Nada mau!"),
    FE(["Dat","is","niet","verkeerde!"], 3, "verkeerd!", "Predicativo: sem -e.", ["v-niet-verkeerd"]),
    MC("Em PT, «nada mau» também pode ser…", ["*um elogio discreto, como em NL","sempre uma crítica|Não.","sempre um insulto|Não."], "Comparação.", ["v-understatement"]),
    LI("Vijftig kilometer gefietst? Niet verkeerd voor een beginner!", ["Vijftig kilometer gefietst? Niet verkeerd voor een beginner","Vijftig kilometer gefietst? Niet verkeerd voor een beginner!","50 kilometer gefietst? Niet verkeerd voor een beginner"], "Cinquenta quilómetros de bicicleta? Nada mau para um principiante!", "Elogio.", ["v-niet-verkeerd"]),
    WO("Nada mau!", ["Niet","verkeerd!"], "Expressão.", ["v-niet-verkeerd"]),
  ], diff=4, mins=5)

L(13, "O tom de um e-mail", "Kortaf of hartelijk?",
  ["Interpretar o tom de mensagens escritas"],
  vocab=[X("v-kortaf","kortaf","seco|brusco","adjective"), X("v-hartelijk","hartelijk","caloroso|cordial","adjective")],
  ex=[("Zijn mail was nogal kortaf: «Zie bijlage.»","O e-mail dele foi bastante seco: «Ver anexo.»"),("Ze schreef een hartelijk bericht.","Ela escreveu uma mensagem calorosa.")],
  review=["v-afstandelijk","v-toon","v-joviaal"],
  cefr=C, exs=[
    MA([("kortaf","seco"),("hartelijk","caloroso"),("afstandelijk","distante"),("joviaal","jovial")], "Tom.", ["v-kortaf","v-hartelijk","v-afstandelijk","v-joviaal"]),
    MC("«Zie bijlage. Gr.» — o tom é…", ["*kortaf (pode ser só pressa)","hartelijk|Não.","emocionado|Não."], "Interpretar.", ["v-kortaf"]),
    MC("Um e-mail curto de um colega neerlandês…", ["*não é necessariamente rude; pode ser só eficiência","é sempre um insulto|Não.","significa que está zangado|Não necessariamente."], "Nuance cultural.", ["v-kortaf"]),
    TR("pt-nl","Ela escreveu uma mensagem calorosa.", ["Ze schreef een hartelijk bericht","Zij schreef een hartelijk bericht"], "het bericht → sem -e.", ["v-hartelijk"]),
    TR("pt-nl","O e-mail dele foi seco.", ["Zijn mail was kortaf","Zijn e-mail was kortaf"], "kortaf.", ["v-kortaf"]),
    FB("Bedankt voor je ___ welkom!", ["hartelijke"], "Com possessivo («je»), o adjetivo leva -e.", ["v-hartelijk"], choices=["hartelijke","kortaf","afstandelijke"], tr="Obrigado pelas tuas calorosas boas-vindas!"),
    FE(["Zijn","toon","was","erg","kortaffe."], 4, "kortaf.", "Predicativo: sem -e.", ["v-kortaf"]),
    SW("Reescreva este e-mail seco num tom mais caloroso (2–3 frases): «Rapport ontvangen. Fouten in p. 3. Graag aanpassen.»", ["Hoi Tom, bedankt voor het rapport! Op pagina 3 zag ik nog een paar kleine foutjes. Zou je die nog even willen aanpassen? Groetjes, Ana"], ["Saudação","Agradecimento","Pedido suave"], 25, "Ajustar o tom.", ["v-hartelijk"]),
    LI("Ik bedoelde het niet afstandelijk; ik had gewoon haast.", ["Ik bedoelde het niet afstandelijk; ik had gewoon haast","Ik bedoelde het niet afstandelijk, ik had gewoon haast"], "Não quis ser distante; só estava com pressa.", "Esclarecer.", ["v-afstandelijk"]),
  ], diff=4, mins=5)

L(14, "Intenções escondidas", "Waar zinspeelt hij op?",
  ["Detetar alusões e intenções não ditas"],
  vocab=[X("v-zinspelen-op","zinspelen op","aludir a|insinuar","verb"), X("v-verborgen-agenda","een verborgen agenda","segundas intenções")],
  ex=[("Waar zinspeelt hij op?","A que é que ele está a aludir?"),("Ik heb het gevoel dat hij een verborgen agenda heeft.","Tenho a sensação de que ele tem segundas intenções.")],
  review=["v-hint","v-bedoeling","v-reactie-interpreteren"],
  cefr=C, exs=[
    MA([("zinspelen op","aludir a"),("een verborgen agenda","segundas intenções"),("hint","dica|indireta"),("interpreteren","interpretar")], "Intenções.", ["v-zinspelen-op","v-verborgen-agenda","v-hint","v-reactie-interpreteren"]),
    MC("Colega: «Sommige mensen vinden het blijkbaar normaal om altijd te laat te komen.» Está a…", ["*zinspelen op alguém (indireta)","elogiar|Não.","perguntar as horas|Não."], "Alusão.", ["v-zinspelen-op"]),
    TR("pt-nl","A que é que ele está a aludir?", ["Waar zinspeelt hij op","Waar zinspeelt hij op?","Waarop zinspeelt hij"], "zinspelen op.", ["v-zinspelen-op"]),
    TR("pt-nl","Ele tem segundas intenções.", ["Hij heeft een verborgen agenda"], "Expressão.", ["v-verborgen-agenda"]),
    FB("Ze gaf een duidelijke ___: ze wil graag mee.", ["hint"], "Dica.", ["v-hint"], choices=["hint","agenda","bedoeling"], tr="Ela deu uma dica clara: quer muito ir também."),
    FE(["Waar","zinspeelt","jij","op?"], 1, "zinspeel", "Inversão com jij: sem -t.", ["v-zinspelen-op"]),
    DL([("Buurman","Jouw tuin is wel érg groen… mijn heg wordt nooit zo mooi.","O teu jardim está muito verde… a minha sebe nunca fica assim."),("Jij","","")], ["*Zinspeel je op mijn sproeier? Ik geef je graag mijn tips!","Dank je!|Pode não ter percebido a indireta.","Verborgen agenda!|Agressivo."], "Responder com humor.", ["v-zinspelen-op"]),
    LI("Zeg het maar gewoon, je hoeft er niet omheen te draaien.", ["Zeg het maar gewoon, je hoeft er niet omheen te draaien","Zeg het maar gewoon je hoeft er niet omheen te draaien"], "Diz lá diretamente, não precisas de andar com rodeios.", "Pedir franqueza.", ["v-zinspelen-op"]),
  ], diff=5, mins=5)

L(15, "Humor neerlandês", "Een woordgrap, droge humor.",
  ["Perceber jogos de palavras e humor seco"],
  vocab=[N("v-woordgrap","woordgrap","trocadilho","de","woordgrappen"), N("v-geintje","geintje","brincadeira","het","geintjes")],
  ex=[("Dat was een slechte woordgrap!","Esse foi um trocadilho mau!"),("Het was maar een geintje.","Era só uma brincadeira."),("Hij heeft een droge humor: hij lacht nooit om zijn eigen grappen.","Ele tem um humor seco: nunca se ri das próprias piadas.")],
  review=["v-droge-humor","v-een-grapje","v-grap-maken"],
  cefr=C, exs=[
    MA([("woordgrap","trocadilho"),("geintje","brincadeira"),("droge humor","humor seco"),("een grap maken","fazer uma piada")], "Humor.", ["v-woordgrap","v-geintje","v-droge-humor","v-grap-maken"]),
    MC("«Waarom gaat een fiets nooit alleen naar een feest? Omdat hij twee-wielig is.» Joga com…", ["*«tweewieler»/«twee-wielig» (som)","nada|Não.","um nome próprio|Não."], "Trocadilho (fraco, de propósito).", ["v-woordgrap"]),
    TR("pt-nl","Era só uma brincadeira.", ["Het was maar een geintje","Het was maar een grapje"], "geintje.", ["v-geintje"]),
    TR("pt-nl","Ele tem um humor seco.", ["Hij heeft droge humor","Hij heeft een droge humor"], "droge humor.", ["v-droge-humor"]),
    AR("geintje", "brincadeira", "het", "Diminutivo → het.", ["v-geintje"]),
    FB("Sorry, het was maar een ___.", ["geintje"], "Brincadeira.", ["v-geintje"], choices=["geintje","woordgrap","humor"], tr="Desculpa, era só uma brincadeira."),
    FE(["De","geintje","was","niet","zo","leuk."], 0, "Het", "het geintje.", ["v-geintje"]),
    LI("Neem het niet zo serieus, het was een geintje!", ["Neem het niet zo serieus, het was een geintje","Neem het niet zo serieus, het was een geintje!"], "Não leves tão a sério, era uma brincadeira!", "Desdramatizar.", ["v-geintje"]),
    MC("Humor seco (droge humor) é…", ["*dizer algo engraçado com cara séria","rir muito alto|Não.","não ter humor|Não."], "Definição.", ["v-droge-humor"]),
  ], diff=4, mins=5)

L(16, "Emoções na voz", "Hij klonk geïrriteerd.",
  ["Interpretar emoções pelo tom de voz"],
  vocab=[X("v-klinken","klinken","soar","verb"), X("v-gespannen","gespannen","tenso","adjective")],
  ex=[("Hij klonk geïrriteerd aan de telefoon.","Ele parecia irritado ao telefone."),("Ze klonk opgelucht toen ze het nieuws hoorde.","Ela pareceu aliviada quando ouviu a notícia."),("De sfeer was gespannen.","O ambiente estava tenso.")],
  review=["v-opgelucht","v-geirriteerd","v-teleurgesteld"],
  cefr=C, exs=[
    MA([("klinken","soar"),("gespannen","tenso"),("opgelucht","aliviado"),("geïrriteerd","irritado")], "Emoções.", ["v-klinken","v-gespannen","v-opgelucht","v-geirriteerd"]),
    MC("Uma voz rápida, curta, com suspiros… soa provavelmente…", ["*geïrriteerd","opgelucht|Não.","ontspannen|Não."], "Inferir.", ["v-geirriteerd"]),
    TR("pt-nl","Ele parecia irritado ao telefone.", ["Hij klonk geïrriteerd aan de telefoon","Hij klonk geirriteerd aan de telefoon","Hij klonk geïrriteerd door de telefoon"], "klinken.", ["v-klinken"]),
    TR("pt-nl","O ambiente estava tenso.", ["De sfeer was gespannen"], "gespannen.", ["v-gespannen"]),
    FB("Ze ___ opgelucht toen ze het nieuws hoorde.", ["klonk"], "Passado de klinken.", ["v-klinken"], choices=["klonk","klinkte","klinkt"], tr="Ela pareceu aliviada quando ouviu a notícia."),
    FE(["Hij","klinkte","erg","moe."], 1, "klonk", "Passado forte: klonk.", ["v-klinken"]),
    DL([("Collega","Hoe reageerde de klant?","Como reagiu o cliente?"),("Jij","","")], ["*Hij zei dat het goed was, maar hij klonk eerlijk gezegd een beetje teleurgesteld.","Hij klinkte.|Errado.","Gespannen.|Incompleto."], "Relatar com nuance.", ["v-klinken","v-teleurgesteld"]),
    LI("Je klinkt moe; gaat het wel goed met je?", ["Je klinkt moe; gaat het wel goed met je","Je klinkt moe, gaat het wel goed met je","Je klinkt moe; gaat het wel goed met je?"], "Pareces cansado; estás bem?", "Empatia.", ["v-klinken"]),
    WO("Ela pareceu aliviada.", ["Ze","klonk","opgelucht"], "Ordem.", ["v-klinken"]),
  ], diff=4, mins=5)

L(17, "Comparar fontes", "De bronnen spreken elkaar tegen.",
  ["Comparar o que diferentes fontes dizem"],
  vocab=[X("v-elkaar-tegenspreken","elkaar tegenspreken","contradizer-se"), X("v-elkaar-bevestigen","elkaar bevestigen","confirmar-se mutuamente"),
         X("v-onafhankelijke-bron","een onafhankelijke bron","uma fonte independente")],
  ex=[("De twee artikelen spreken elkaar tegen.","Os dois artigos contradizem-se."),("Drie bronnen bevestigen elkaar.","Três fontes confirmam-se mutuamente."),("Zoek een onafhankelijke bron.","Procura uma fonte independente.")],
  review=["v-betrouwbaar-bron","v-eenzijdig","v-perspectief"],
  cefr=C, exs=[
    MA([("elkaar tegenspreken","contradizer-se"),("elkaar bevestigen","confirmar-se"),("een onafhankelijke bron","fonte independente"),("eenzijdig","parcial")], "Fontes.", ["v-elkaar-tegenspreken","v-elkaar-bevestigen","v-onafhankelijke-bron","v-eenzijdig"]),
    CO("text","Twee berichten (fictief)","Bericht A (website van een autofabrikant): «Elektrische auto's zijn in alle opzichten beter voor het milieu.»\nBericht B (onafhankelijk onderzoeksinstituut): «Elektrische auto's stoten tijdens het rijden geen CO2 uit, maar voor de productie van de batterij is veel energie nodig. Over de hele levensduur zijn ze meestal wel schoner.»",
       [("Que fonte é mais independente?", ["*B","A","Iguais"]),("As fontes contradizem-se totalmente?", ["*Não, B é mais matizada","Sim, totalmente","Não falam do mesmo"]),("Porque desconfiar de A?", ["*Tem interesse em vender","É curta","É antiga"])],
       "Comparar fontes.", ["v-onafhankelijke-bron","v-eenzijdig"]),
    TR("pt-nl","Os dois artigos contradizem-se.", ["De twee artikelen spreken elkaar tegen","Beide artikelen spreken elkaar tegen"], "Separável.", ["v-elkaar-tegenspreken"]),
    TR("pt-nl","Procura uma fonte independente.", ["Zoek een onafhankelijke bron"], "onafhankelijke.", ["v-onafhankelijke-bron"]),
    FB("Als drie bronnen elkaar ___, is het waarschijnlijk waar.", ["bevestigen"], "Confirmar.", ["v-elkaar-bevestigen"], choices=["bevestigen","tegenspreken","eenzijdig"], tr="Se três fontes se confirmam, é provavelmente verdade."),
    FE(["De","bronnen","spreekt","elkaar","tegen."], 2, "spreken", "Plural: spreken.", ["v-elkaar-tegenspreken"]),
    LI("Kijk altijd vanuit meerdere perspectieven naar een nieuwsbericht.", ["Kijk altijd vanuit meerdere perspectieven naar een nieuwsbericht"], "Olha sempre para uma notícia de várias perspetivas.", "Dica.", ["v-perspectief"]),
    WO("Contradizem-se.", ["Ze","spreken","elkaar","tegen"], "Separável.", ["v-elkaar-tegenspreken"]),
  ], diff=5, mins=6)

L(18, "Títulos enganadores", "Clickbait!",
  ["Reconhecer títulos sensacionalistas"],
  vocab=[N("v-clickbait","clickbait","isco de cliques","de"), X("v-misleidende-kop","een misleidende kop","um título enganador")],
  ex=[("«Je gelooft nooit wat deze kat deed!» is typische clickbait.","«Nunca vais acreditar no que este gato fez!» é isco de cliques típico."),("De kop was misleidend: het artikel zei iets anders.","O título era enganador: o artigo dizia outra coisa.")],
  review=["v-sensationeel","v-kop-artikel"],
  cefr=C, exs=[
    MA([("clickbait","isco de cliques"),("een misleidende kop","título enganador"),("sensationeel","sensacionalista"),("nepnieuws","notícias falsas")], "Títulos.", ["v-clickbait","v-misleidende-kop","v-sensationeel"]),
    MC("Qual título é clickbait?", ["*Artsen haten deze ene simpele truc!","Gemeente opent nieuw zwembad in Zwolle.|Factual.","Treinstaking op maandag.|Factual."], "Reconhecer.", ["v-clickbait"]),
    MC("Título: «Koffie veroorzaakt kanker!» Artigo: «Een studie bij muizen vond een mogelijk verband bij extreem hoge doses.» O título é…", ["*misleidend","correto|Exagera.","neutro|Não."], "Comparar título e texto.", ["v-misleidende-kop"]),
    TR("pt-nl","O título era enganador.", ["De kop was misleidend","De titel was misleidend"], "misleidend.", ["v-misleidende-kop"]),
    TR("pt-nl","É isco de cliques típico.", ["Het is typische clickbait","Dat is typische clickbait"], "clickbait.", ["v-clickbait"]),
    FB("Lees altijd het hele artikel, niet alleen de ___.", ["kop"], "Título.", ["v-kop-artikel"], choices=["kop","clickbait","bron"], tr="Lê sempre o artigo todo, não só o título."),
    FE(["Die","kop","is","erg","misleidende."], 4, "misleidend.", "Predicativo: sem -e.", ["v-misleidende-kop"]),
    LI("Hoe sensationeler de kop, hoe kritischer je moet lezen.", ["Hoe sensationeler de kop, hoe kritischer je moet lezen"], "Quanto mais sensacionalista o título, mais criticamente deves ler.", "Dica.", ["v-sensationeel"]),
  ], diff=4, mins=5)

L(19, "Linguagem publicitária", "Te mooi om waar te zijn?",
  ["Ler publicidade com espírito crítico"],
  vocab=[N("v-reclame","reclame","publicidade|anúncio","de"), X("v-kleine-lettertjes","de kleine lettertjes","as letras pequeninas"),
         X("v-te-mooi-om-waar","te mooi om waar te zijn","bom demais para ser verdade")],
  ex=[("In de reclame lijkt alles perfect.","Na publicidade tudo parece perfeito."),("Lees altijd de kleine lettertjes.","Lê sempre as letras pequeninas."),("Een gratis vakantie? Dat klinkt te mooi om waar te zijn.","Umas férias grátis? Parece bom demais para ser verdade.")],
  review=["v-gratis"],
  cefr=C, exs=[
    MA([("reclame","publicidade"),("de kleine lettertjes","letras pequeninas"),("te mooi om waar te zijn","bom demais"),("gratis","grátis")], "Publicidade.", ["v-reclame","v-kleine-lettertjes","v-te-mooi-om-waar","v-gratis"]),
    CO("text","Advertentie (fictief)","NU 50% KORTING op alle abonnementen!* Bel snel, want op = op!\n\n*Alleen in de eerste maand. Daarna € 39,99 per maand. Minimale looptijd: 24 maanden. Opzeggen alleen schriftelijk.",
       [("O desconto vale…", ["*só no primeiro mês","sempre","dois anos"]),("Duração mínima?", ["*24 meses","1 mês","Sem mínimo"]),("Como cancelar?", ["*Só por escrito","Por telefone","Online"])],
       "Ler as letras pequeninas.", ["v-kleine-lettertjes"]),
    TR("pt-nl","Lê sempre as letras pequeninas.", ["Lees altijd de kleine lettertjes"], "Expressão.", ["v-kleine-lettertjes"]),
    TR("pt-nl","Parece bom demais para ser verdade.", ["Dat klinkt te mooi om waar te zijn","Het klinkt te mooi om waar te zijn"], "Expressão.", ["v-te-mooi-om-waar"]),
    FB("Pas op: in de kleine ___ staat dat het abonnement twee jaar duurt.", ["lettertjes"], "Expressão.", ["v-kleine-lettertjes"], choices=["lettertjes","letters","reclame"], tr="Atenção: nas letras pequeninas diz que a assinatura dura dois anos."),
    FE(["Dat","klinkt","te","mooi","om","waar","zijn."], 6, "te zijn.", "om … te.", ["v-te-mooi-om-waar"]),
    MC("«Op = op» numa publicidade quer criar…", ["*urgência (acaba-se)","tranquilidade|Não.","dúvida|Não."], "Técnica.", ["v-reclame"]),
    LI("Als iets gratis is, ben jij vaak het product.", ["Als iets gratis is, ben jij vaak het product","Als iets gratis is ben jij vaak het product"], "Se algo é grátis, muitas vezes o produto és tu.", "Reflexão.", ["v-gratis"]),
  ], diff=4, mins=6)

L(20, "Gráficos enganadores", "De as begint niet bij nul!",
  ["Detetar gráficos que exageram diferenças"],
  vocab=[X("v-misleidend","misleidend","enganador","adjective"), X("v-as-niet-bij-nul","de as begint niet bij nul","o eixo não começa em zero")],
  ex=[("Deze grafiek is misleidend: de as begint niet bij nul.","Este gráfico é enganador: o eixo não começa em zero."),("Zo lijkt een klein verschil heel groot.","Assim uma pequena diferença parece enorme.")],
  review=["v-grafiek","v-verticale-as","v-kritisch-lezen"],
  cefr=C, exs=[
    MA([("misleidend","enganador"),("de as begint niet bij nul","o eixo não começa em zero"),("grafiek","gráfico"),("op de verticale as","no eixo vertical")], "Gráficos.", ["v-misleidend","v-as-niet-bij-nul","v-grafiek","v-verticale-as"]),
    MC("Gráfico: vendas de 98 e 100, eixo de 97 a 101. A barra de 100 parece o triplo. É…", ["*misleidend","correto|Exagera.","impossível|Não."], "Detetar.", ["v-as-niet-bij-nul"]),
    TR("pt-nl","Este gráfico é enganador.", ["Deze grafiek is misleidend"], "misleidend.", ["v-misleidend"]),
    TR("pt-nl","O eixo não começa em zero.", ["De as begint niet bij nul"], "Expressão.", ["v-as-niet-bij-nul"]),
    FB("Een ___ grafiek kan een klein verschil groot laten lijken.", ["misleidende"], "de grafiek → -e.", ["v-misleidend"], choices=["misleidende","misleidend","eerlijk"], tr="Um gráfico enganador pode fazer uma pequena diferença parecer grande."),
    FE(["De","as","beginnen","niet","bij","nul."], 2, "begint", "Singular: begint.", ["v-as-niet-bij-nul"]),
    LI("Kijk altijd eerst naar de getallen op de assen.", ["Kijk altijd eerst naar de getallen op de assen"], "Olha sempre primeiro para os números nos eixos.", "Dica.", ["v-verticale-as"]),
    MC("Outra técnica enganadora é…", ["*mostrar só um período que convém","usar cores|Não necessariamente.","pôr título|Não."], "Espírito crítico.", ["v-misleidend"]),
  ], diff=5, mins=5)

L(21, "Promessas políticas", "Vage beloftes.",
  ["Interpretar promessas vagas e concretas"],
  vocab=[N("v-verkiezingsbelofte","verkiezingsbelofte","promessa eleitoral","de","verkiezingsbeloftes"), X("v-vage-belofte","een vage belofte","uma promessa vaga")],
  ex=[("Dat is een typische verkiezingsbelofte.","Essa é uma típica promessa eleitoral."),("«We gaan ons inzetten voor een betere toekomst» is een vage belofte.","«Vamos empenhar-nos por um futuro melhor» é uma promessa vaga.")],
  review=["v-beloven"],
  cefr=C, exs=[
    MA([("verkiezingsbelofte","promessa eleitoral"),("een vage belofte","promessa vaga"),("partij","partido"),("beloven","prometer")], "Política.", ["v-verkiezingsbelofte","v-vage-belofte","v-beloven"]),
    MC("Qual é a promessa mais CONCRETA?", ["*We bouwen vóór 2030 10.000 sociale huurwoningen.","We gaan werken aan betere woningen.|Vaga.","Wonen moet beter.|Vaga."], "Concreto vs. vago.", ["v-vage-belofte"]),
    MC("«We gaan kijken naar mogelijkheden om…» é…", ["*uma formulação vaga (sem compromisso)","um compromisso firme|Não.","uma lei|Não."], "Linguagem política.", ["v-vage-belofte"]),
    TR("pt-nl","É uma promessa vaga.", ["Het is een vage belofte","Dat is een vage belofte"], "vage.", ["v-vage-belofte"]),
    FB("Na de verkiezingen werden veel ___ niet nagekomen.", ["verkiezingsbeloftes"], "Plural.", ["v-verkiezingsbelofte"], choices=["verkiezingsbeloftes","vage","partijen"], tr="Depois das eleições, muitas promessas eleitorais não foram cumpridas."),
    FE(["De","partij","beloofden","lagere","belastingen."], 2, "beloofde", "Singular: beloofde.", ["v-beloven"]),
    SW("Transforme esta promessa vaga numa promessa concreta e verificável: «Wij zetten ons in voor meer groen in de stad.»", ["Wij planten vóór eind 2027 in elke wijk minstens honderd nieuwe bomen."], ["Número","Prazo","Verificável"], 12, "Concretizar.", ["v-vage-belofte"]),
    LI("Een goede belofte is concreet en controleerbaar.", ["Een goede belofte is concreet en controleerbaar"], "Uma boa promessa é concreta e verificável.", "Princípio.", ["v-vage-belofte"]),
  ], diff=5, mins=5)

L(22, "Revisão S6: argumentar", "Overtuigingskracht.",
  ["Rever argumentação, opinião e negociação"],
  vocab=[N("v-overtuigingskracht","overtuigingskracht","poder de persuasão","de")],
  ex=[("Haar betoog had veel overtuigingskracht.","O texto dela tinha muito poder de persuasão.")],
  review=["v-ik-ben-van-mening","v-weliswaar","v-kort-door-de-bocht","v-het-lijkt-erop","v-het-verschil-delen","v-breekpunt","v-daar-zit-wat-in"],
  cefr=C, exs=[
    MA([("weliswaar … maar","é certo que … mas"),("kort door de bocht","simplista"),("het verschil delen","dividir a diferença"),("overtuigingskracht","poder de persuasão")], "Revisão.", ["v-weliswaar","v-kort-door-de-bocht","v-het-verschil-delen","v-overtuigingskracht"]),
    MC("«Alle Nederlanders zijn direct.» Resposta matizada:", ["*Dat is wel erg kort door de bocht; het verschilt per persoon.","Klopt, altijd.|Generaliza.","Weliswaar.|Incompleto."], "Revisão.", ["v-kort-door-de-bocht"]),
    MC("Numa negociação, «Dat is voor mij een breekpunt» indica…", ["*linha vermelha","concordância|Não.","dúvida|Não."], "Revisão.", ["v-breekpunt"]),
    TR("pt-nl","Sou da opinião de que…", ["Ik ben van mening dat","Ik ben van mening dat…"], "Revisão.", ["v-ik-ben-van-mening"]),
    TR("pt-nl","O texto tinha muito poder de persuasão.", ["Het betoog had veel overtuigingskracht","De tekst had veel overtuigingskracht"], "overtuigingskracht.", ["v-overtuigingskracht"]),
    FB("Het is weliswaar duur, ___ het loont.", ["maar"], "weliswaar … maar.", ["v-weliswaar"], choices=["maar","dus","want"], tr="É certo que é caro, mas compensa."),
    FE(["Daar","zit","wat","op."], 3, "in.", "Expressão: daar zit wat in.", ["v-daar-zit-wat-in"]),
    LI("Het lijkt erop dat we het eens worden.", ["Het lijkt erop dat we het eens worden"], "Parece que vamos chegar a acordo.", "Revisão.", ["v-het-lijkt-erop"]),
  ], diff=5, mins=5)

L(23, "Revisão S6: gramática", "Relativas, passiva e discurso indireto.",
  ["Rever as estruturas gramaticais da secção"],
  vocab=[X("v-grammaticaal","grammaticaal","gramaticalmente","adjective")],
  ex=[("Deze zin is grammaticaal correct.","Esta frase está gramaticalmente correta.")],
  review=["v-waaraan-rel","v-iets-wat","v-bekeurd-worden","v-er-wordt-verwacht","v-vroeg-of","v-zei-dat-ik-moest","v-laten-causaal","v-had-willen"],
  cefr=C, exs=[
    MC("Relativa: «Het project ___ ik werk.»", ["*waaraan","waarop|Não.","dat|Falta a preposição."], "Revisão.", ["v-waaraan-rel"]),
    MC("Passiva: «De politie bekeurde hem.» →", ["*Hij werd door de politie bekeurd.","Hij bekeurde door de politie.|Não.","Hij is de politie bekeurd.|Não."], "Revisão.", ["v-bekeurd-worden"]),
    MC("Indireto: «Kom je mee?», vroeg ze. →", ["*Ze vroeg of ik meeging.","Ze vroeg dat ik meeging.|Pergunta → of.","Ze vroeg kom je mee.|Não."], "Revisão.", ["v-vroeg-of"]),
    MC("Duplo infinitivo: «Queria ter vindo.»", ["*Ik had willen komen.","Ik had gewild komen.|Não.","Ik heb komen gewild.|Não."], "Revisão.", ["v-had-willen"]),
    FE(["Er","is","niets","die","ik","niet","weet."], 3, "wat", "niets wat.", ["v-iets-wat"]),
    FE(["Ze","zei","dat","ik","moet","wachten."], 4, "moest", "Passado: moest.", ["v-zei-dat-ik-moest"]),
    TR("pt-nl","Esta frase está gramaticalmente correta.", ["Deze zin is grammaticaal correct","Deze zin is grammaticaal juist"], "grammaticaal.", ["v-grammaticaal"]),
    LI("Ik heb mijn fiets laten repareren, wat best duur was.", ["Ik heb mijn fiets laten repareren, wat best duur was","Ik heb mijn fiets laten repareren wat best duur was"], "Mandei arranjar a bicicleta, o que foi bastante caro.", "Revisão.", ["v-laten-causaal"]),
  ], diff=5, mins=5)

L(24, "Revisão S6: vocabulário", "Woordenschat uitbreiden.",
  ["Rever colocações, expressões e palavras parecidas"],
  vocab=[N("v-woordenschat","woordenschat","vocabulário","de")],
  ex=[("Lezen is de beste manier om je woordenschat uit te breiden.","Ler é a melhor forma de alargar o vocabulário.")],
  review=["v-fout-maken","v-prijs-stellen-op","v-tandje-bijzetten","v-op-de-valreep","v-kwijt-zijn","v-eindelijk","v-haalbaarheid","v-dienen-te"],
  cefr=C, exs=[
    MA([("een fout maken","cometer um erro"),("prijs stellen op","dar valor a"),("een tandje bijzetten","acelerar"),("woordenschat","vocabulário")], "Revisão.", ["v-fout-maken","v-prijs-stellen-op","v-tandje-bijzetten","v-woordenschat"]),
    MC("«Perdi as chaves»:", ["*Ik ben mijn sleutels kwijt.","Ik heb mijn sleutels gemist.|Não.","Ik heb mijn sleutels verloren gegaan.|Não."], "Revisão.", ["v-kwijt-zijn"]),
    MC("Esperaste muito: «___ ben je er!»", ["*Eindelijk","Uiteindelijk|Não.","Ten slotte|Não."], "Revisão.", ["v-eindelijk"]),
    MC("Formal de «U moet betalen»:", ["*U dient te betalen.","U kunt betalen.|Não.","Betaal maar.|Informal."], "Revisão.", ["v-dienen-te"]),
    FE(["Ik","heb","een","grote","fout","gedaan."], 5, "gemaakt.", "een fout maken.", ["v-fout-maken"]),
    TR("pt-nl","Ler alarga o vocabulário.", ["Lezen breidt je woordenschat uit","Lezen vergroot je woordenschat"], "woordenschat.", ["v-woordenschat"]),
    FB("Op de ___ haalden we de trein nog.", ["valreep"], "Revisão.", ["v-op-de-valreep"], choices=["valreep","nippertje","laatste"], tr="Mesmo no último momento ainda apanhámos o comboio."),
    LI("We onderzoeken eerst de haalbaarheid.", ["We onderzoeken eerst de haalbaarheid","Wij onderzoeken eerst de haalbaarheid"], "Primeiro estudamos a viabilidade.", "Revisão.", ["v-haalbaarheid"]),
  ], diff=5, mins=5)

L(25, "Prática final da Secção 6", "Klaar voor B2!",
  ["Combinar as competências da secção num texto e numa conversa"],
  vocab=[],
  ex=[("Na deze sectie ben je klaar voor de volgende stap.","Depois desta secção estás pronto para o próximo passo.")],
  review=["v-klaar-voor","v-tussen-de-regels","v-ironisch-bedoeld","v-niet-verkeerd","v-kortaf","v-onafhankelijke-bron","v-kleine-lettertjes","v-overtuigingskracht","v-zelfvertrouwen"],
  cefr=C, exs=[
    CO("dialogue","Een gesprek op het werk","Lisa: Nou, het rapport van gisteren was niet verkeerd!\nRui: Dank je! Ik twijfelde nog over de conclusie.\nLisa: Die was wel een beetje kort door de bocht. Misschien kun je nog een onafhankelijke bron toevoegen?\nRui: Goed punt. Ik pas het vandaag aan.\nLisa: Super. En sorry dat mijn mail van vanochtend zo kortaf was; ik had haast.",
       [("Como avalia a Lisa o relatório?", ["*Positivamente (understatement)","Muito mal","Não diz"]),("O que sugere?", ["*Acrescentar uma fonte independente","Apagar a conclusão","Começar de novo"]),("Porque pede desculpa?", ["*O e-mail foi seco","Chegou tarde","Perdeu o relatório"])],
       "Revisão de interpretação.", ["v-niet-verkeerd","v-onafhankelijke-bron","v-kortaf"]),
    MC("«Niet verkeerd» da Lisa é…", ["*um elogio","uma crítica|Não.","neutro|É elogio."], "Revisão.", ["v-niet-verkeerd"]),
    TR("pt-nl","Estou pronto para o próximo passo.", ["Ik ben klaar voor de volgende stap"], "klaar voor.", ["v-klaar-voor"]),
    FB("Door veel te oefenen groeit je ___.", ["zelfvertrouwen"], "Autoconfiança.", ["v-zelfvertrouwen"], choices=["zelfvertrouwen","woordenschat","overtuiging"], tr="Praticando muito, a tua autoconfiança cresce."),
    SW("Escreva um texto (cerca de 120 palavras) a refletir sobre o seu percurso em neerlandês até agora: o que aprendeu na Secção 6, o que ainda é difícil e o que quer melhorar na Secção 7. Use pelo menos três estruturas da secção (relativa, passiva, discurso indireto, colocação, expressão).", ["In deze sectie heb ik veel geleerd over argumenteren en nuanceren. Wat ik het nuttigst vond, waren de colocaties: ik maakte vroeger vaak de fout «een beslissing maken». Mijn docent zei altijd dat ik meer tussen de regels door moest lezen, en dat lukt nu beter. Moeilijk blijft de passieve vorm met modale werkwoorden, zoals «had moeten worden gemeld». In de volgende sectie wil ik vooral vloeiender spreken en mijn woordenschat uitbreiden. Ik ben er klaar voor!"], ["3+ estruturas","Reflexão honesta","Objetivos"], 100, "Reflexão final.", ["v-klaar-voor"]),
  ], diff=5, mins=8)

W()
