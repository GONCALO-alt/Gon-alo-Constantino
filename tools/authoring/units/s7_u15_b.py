import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u15")
C = "B2"
# Lições de aprofundamento (10–29): cinco projetos práticos em etapas (blogue, jantar, candidatura, podcast, portefólio).
# Todos os nomes, empresas e dados são fictícios.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

# ---------- Projeto A: um blogue sobre a vida nos Países Baixos ----------

L(10, "Projeto A (1): o tema do blogue", "Een blogbericht.",
  ["Escolher tema e público para um texto de blogue"],
  vocab=[N("v-blogbericht","blogbericht","publicação de blogue","het","blogberichten")],
  ex=[("In mijn eerste blogbericht vertel ik over mijn verhuizing.","Na minha primeira publicação falo da mudança."),("Mijn doelgroep: Portugezen die naar Nederland willen verhuizen.","O meu público: portugueses que querem mudar-se para os Países Baixos.")],
  review=["v-doelgroep","v-lezer"],
  cefr=C, exs=[
    MA([("blogbericht","publicação de blogue"),("doelgroep","público-alvo"),("lezer","leitor"),("pakkend","cativante")], "Blogue.", ["v-blogbericht","v-doelgroep","v-lezer","v-pakkend"]),
    AR("blogbericht", "publicação de blogue", "het", "het bericht.", ["v-blogbericht"]),
    MC("Doelgroep: recém-chegados. Que tema serve melhor?", ["*«Vijf dingen die ik graag eerder had geweten over de huisarts»","«De geschiedenis van de Gouden Eeuw in detail»|Interessante, mas menos útil para eles.","«Mijn favoriete Portugese voetbalclub»|Fora do tema."], "Tema e público.", ["v-doelgroep"]),
    TR("pt-nl","Na minha primeira publicação falo da mudança.", ["In mijn eerste blogbericht vertel ik over mijn verhuizing","In mijn eerste blogbericht schrijf ik over mijn verhuizing"], "Inversão.", ["v-blogbericht"]),
    FB("Voor wie schrijf je? Bepaal eerst je ___.", ["doelgroep"], "Público.", ["v-doelgroep"], choices=["doelgroep","blogbericht","lezer"], tr="Para quem escreves? Define primeiro o teu público."),
    FE(["De","blogbericht","is","gisteren","geplaatst."], 0, "Het", "het bericht.", ["v-blogbericht"]),
    SW("Escreva 3 ideias de título para o seu blogue e diga para que doelgroep é.", ["1. Fietsen in de regen: overleven als Portugees\n2. Gezellig is geen vertaling waard\n3. Mijn eerste jaar in Utrecht\nDoelgroep: Portugezen die net in Nederland wonen."], ["3 títulos","Doelgroep"], 30, "Planear.", ["v-blogbericht","v-doelgroep"]),
    LI("Mijn blog is bedoeld voor nieuwkomers.", ["Mijn blog is bedoeld voor nieuwkomers"], "O meu blogue destina-se a recém-chegados.", "Ouvir.", ["v-doelgroep","v-nieuwkomer"]),
  ], diff=4, mins=6)

L(11, "Projeto A (2): título e primeiro parágrafo", "Publiceren.",
  ["Escrever um título cativante e uma abertura forte"],
  vocab=[X("v-publiceren","publiceren","publicar","verb")],
  ex=[("Ik publiceer elke zondag een nieuw bericht.","Publico um texto novo todos os domingos."),("Een pakkende titel trekt lezers.","Um título cativante atrai leitores.")],
  review=["v-kop-pakkend","v-pakkend","v-de-lezer-aanspreken"],
  cefr=C, exs=[
    MA([("publiceren","publicar"),("pakkende titel","título cativante"),("de lezer aanspreken","dirigir-se ao leitor"),("blogbericht","publicação")], "Escrever.", ["v-publiceren","v-kop-pakkend","v-de-lezer-aanspreken","v-blogbericht"]),
    MC("Qual título é mais pakkend?", ["*Waarom ik na drie jaar nog steeds verdwaal in de supermarkt","Over de supermarkt|Vago.","Tekst nummer 4|Sem interesse."], "Título.", ["v-kop-pakkend"]),
    MC("Uma boa primeira frase:", ["*Herken je dat? Je staat bij de kassa en de caissière vraagt: «Bonnetje erbij?»","In deze tekst ga ik schrijven over een onderwerp.|Aborrecida.","Hallo.|Vazia."], "Abertura.", ["v-de-lezer-aanspreken"]),
    TR("pt-nl","Publico um texto novo todos os domingos.", ["Ik publiceer elke zondag een nieuw bericht","Elke zondag publiceer ik een nieuw bericht","Ik publiceer elke zondag een nieuw blogbericht"], "publiceren.", ["v-publiceren"]),
    FB("Het artikel is vorige week ___.", ["gepubliceerd"], "Particípio.", ["v-publiceren"], choices=["gepubliceerd","gepubliceert","publiceerd"], tr="O artigo foi publicado na semana passada."),
    FE(["Zij","publiceren","elke","week","een","blog."], 1, "publiceert", "Singular: publiceert.", ["v-publiceren"]),
    SW("Escreva o título e o primeiro parágrafo (3–4 frases) de um blogbericht sobre uma surpresa cultural nos Países Baixos.", ["Waarom niemand mij uitnodigde voor het avondeten\n\nIn mijn eerste maand in Nederland zat ik om half zes bij een collega op de bank. Plotseling stond ze op: «Wij gaan eten.» Ik bleef zitten, zij bleef staan. Pas later begreep ik dat het een vriendelijk teken was om te vertrekken."], ["Título cativante","Abertura com cena concreta"], 50, "Escrever.", ["v-kop-pakkend","v-publiceren"]),
    LI("Klik op «publiceren» als je tevreden bent.", ["Klik op «publiceren» als je tevreden bent","Klik op publiceren als je tevreden bent"], "Clica em «publicar» quando estiveres satisfeito.", "Ouvir.", ["v-publiceren"]),
  ], diff=4, mins=6)

L(12, "Projeto A (3): imagens e apresentação", "Opmaak en onderschrift.",
  ["Cuidar da apresentação: fotos, legendas e estrutura"],
  vocab=[N("v-opmaak","opmaak","formatação, paginação","de"), N("v-onderschrift","onderschrift","legenda (de imagem)","het","onderschriften")],
  ex=[("Een rustige opmaak maakt de tekst leesbaar.","Uma formatação sóbria torna o texto legível."),("Onder elke foto staat een kort onderschrift.","Por baixo de cada foto há uma legenda curta.")],
  review=["v-foto","v-tussenkopje","v-alinea"],
  cefr=C, exs=[
    MA([("opmaak","formatação"),("onderschrift","legenda"),("tussenkopje","subtítulo"),("alinea","parágrafo")], "Apresentação.", ["v-opmaak","v-onderschrift","v-tussenkopje","v-alinea"]),
    AR("onderschrift", "legenda", "het", "het schrift.", ["v-onderschrift"]),
    MC("Bom onderschrift para uma foto de bicicletas num canal:", ["*Spitsuur in Utrecht: meer fietsen dan mensen, lijkt het wel.","Foto.|Vazio.","IMG_2045|Nome de ficheiro."], "Legenda.", ["v-onderschrift"]),
    TR("pt-nl","Por baixo de cada foto há uma legenda.", ["Onder elke foto staat een onderschrift"], "staan.", ["v-onderschrift"]),
    FB("Gebruik ___ om een lange tekst op te delen.", ["tussenkopjes"], "Subtítulos.", ["v-tussenkopje"], choices=["tussenkopjes","onderschriften","foto's"], tr="Usa subtítulos para dividir um texto longo."),
    FE(["Het","opmaak","van","de","site","is","rustig."], 0, "De", "de opmaak.", ["v-opmaak"]),
    LI("Korte alinea's lezen prettiger op een telefoon.", ["Korte alinea's lezen prettiger op een telefoon"], "Parágrafos curtos leem-se melhor num telemóvel.", "Dica.", ["v-alinea"]),
    SW("Escreva legendas (onderschriften) para três fotos imaginárias do seu bairro.", ["1. De markt op zaterdag: hier koop ik mijn kaas.\n2. Mijn buurman Henk en zijn eeuwige tuinkabouter.\n3. Zonsondergang boven de gracht, om tien uur 's avonds in juni."], ["3 legendas","Concretas"], 30, "Legendas.", ["v-onderschrift"]),
  ], diff=3, mins=5)

L(13, "Projeto A (4): reações dos leitores", "Reageren op een bijdrage.",
  ["Responder a comentários com tato"],
  vocab=[N("v-bijdrage","bijdrage","contribuição, publicação","de","bijdragen")],
  ex=[("Bedankt voor je bijdrage aan de discussie!","Obrigado pelo teu contributo para a discussão!"),("Een lezer reageerde kritisch op mijn bijdrage.","Um leitor reagiu de forma crítica ao meu texto.")],
  review=["v-reactie","v-lezer","v-omgaan-met-kritiek"],
  cefr=C, exs=[
    MA([("bijdrage","contribuição"),("reactie","comentário"),("lezer","leitor"),("kritiek","crítica")], "Comentários.", ["v-bijdrage","v-reactie","v-lezer"]),
    MC("Comentário: «Je generaliseert; niet alle Nederlanders eten om zes uur.» Melhor resposta:", ["*Goed punt, dank je! Ik bedoelde «veel Nederlanders» — ik pas het aan.","Jij snapt het niet.|Defensivo.","(apagar o comentário)|Evita o diálogo."], "Responder com tato.", ["v-reactie","v-bijdrage"]),
    TR("pt-nl","Obrigado pelo teu contributo!", ["Bedankt voor je bijdrage!","Bedankt voor je bijdrage","Dank voor je bijdrage!"], "bijdrage.", ["v-bijdrage"]),
    TR("pt-nl","Um leitor reagiu ao meu texto.", ["Een lezer reageerde op mijn tekst","Een lezer heeft op mijn tekst gereageerd","Een lezer reageerde op mijn bijdrage"], "reageren op.", ["v-reactie"]),
    FB("Wat leuk dat je ___ op mijn verhaal!", ["reageert"], "reageren op.", ["v-reactie"], choices=["reageert","reactie","reageer"], tr="Que bom que reages à minha história!"),
    FE(["Ik","reageerde","aan","zijn","bericht."], 2, "op", "reageren op.", ["v-reactie"]),
    LI("Dank voor je reactie; daar had ik nog niet aan gedacht.", ["Dank voor je reactie; daar had ik nog niet aan gedacht","Dank voor je reactie, daar had ik nog niet aan gedacht"], "Obrigado pelo comentário; ainda não tinha pensado nisso.", "Resposta.", ["v-reactie"]),
    AR("bijdrage", "contribuição", "de", "de bijdrage.", ["v-bijdrage"]),
  ], diff=4, mins=5)

# ---------- Projeto B: um jantar português para os vizinhos ----------

L(14, "Projeto B (1): o convite", "Een aperitief en een uitnodiging.",
  ["Convidar vizinhos para um jantar"],
  vocab=[N("v-aperitief","aperitief","aperitivo","het")],
  ex=[("We beginnen om zes uur met een aperitief.","Começamos às seis com um aperitivo."),("Graag nodigen we jullie uit voor een Portugees diner.","Temos o gosto de vos convidar para um jantar português.")],
  review=["v-uitnodiging","v-gastvrij","v-buren"],
  cefr=C, exs=[
    MA([("aperitief","aperitivo"),("uitnodiging","convite"),("gastvrij","hospitaleiro"),("buren","vizinhos")], "Convite.", ["v-aperitief","v-uitnodiging","v-gastvrij","v-buren"]),
    AR("aperitief", "aperitivo", "het", "het aperitief.", ["v-aperitief"]),
    MC("Nos Países Baixos, um convite costuma indicar…", ["*dia, hora de início e muitas vezes de fim","nada — aparece-se quando se quer|Raro.","só o dia|Pouco."], "Costume.", ["v-uitnodiging"]),
    TR("pt-nl","Começamos às seis com um aperitivo.", ["We beginnen om zes uur met een aperitief","Om zes uur beginnen we met een aperitief"], "beginnen met.", ["v-aperitief"]),
    FB("Wil je even laten weten of je komt? Graag vóór 1 juni een ___.", ["reactie"], "Resposta.", ["v-reactie"], choices=["reactie","aperitief","uitnodiging"], tr="Podes dizer-me se vens? De preferência responde antes de 1 de junho."),
    FE(["Wij","nodigen","jullie","graag","op","voor","een","diner."], 4, "uit", "uitnodigen voor.", ["v-uitnodiging"]),
    SW("Escreva o convite (50–70 palavras): jantar português no sábado, 18h–22h, aperitivo, pedir para avisar sobre dieetwensen e confirmar presença.", ["Beste buren,\n\nGraag nodigen we jullie uit voor een Portugees diner op zaterdag 14 juni, van 18.00 tot 22.00 uur, bij ons thuis (nr. 8). We beginnen met een aperitief in de tuin. Hebben jullie dieetwensen of allergieën? Laat het ons even weten. Wil je vóór 7 juni laten weten of je komt?\n\nHartelijke groet,\nJoana en Miguel"], ["Data e horas","Dieetwensen","Confirmação"], 60, "Convite (fictício).", ["v-uitnodiging","v-aperitief"]),
    LI("Wat gezellig, we komen graag!", ["Wat gezellig, we komen graag","Wat gezellig we komen graag","Wat gezellig, we komen graag!"], "Que bom, vamos com todo o gosto!", "Resposta.", ["v-gezellig"]),
  ], diff=4, mins=6)

L(15, "Projeto B (2): restrições alimentares", "Allergieën en dieetwensen.",
  ["Perguntar por alergias e adaptar o menu"],
  vocab=[],
  ex=[("Is er iemand met een allergie?","Há alguém com alguma alergia?"),("Mijn buurvrouw is allergisch voor noten.","A minha vizinha é alérgica a frutos secos.")],
  review=["v-allergie","v-dieetwensen","v-vegetarisch"],
  cefr=C, exs=[
    MA([("allergie","alergia"),("dieetwensen","restrições alimentares"),("vegetarisch","vegetariano"),("allergisch voor","alérgico a")], "Dieta.", ["v-allergie","v-dieetwensen","v-vegetarisch"]),
    MC("«Allergisch» usa-se com…", ["*voor (allergisch voor noten)","op|Não.","met|Não."], "Preposição.", ["v-allergie"]),
    TR("pt-nl","Há alguém com alguma alergia?", ["Is er iemand met een allergie?","Heeft iemand een allergie?","Is er iemand met een allergie"], "allergie.", ["v-allergie"]),
    TR("pt-nl","Ela é alérgica a frutos secos.", ["Ze is allergisch voor noten","Zij is allergisch voor noten"], "allergisch voor.", ["v-allergie"]),
    FB("Voor de ___ gasten maak ik een groentegerecht.", ["vegetarische"], "Adjetivo com -e.", ["v-vegetarisch"], choices=["vegetarische","vegetarisch","vegetariër"], tr="Para os convidados vegetarianos faço um prato de legumes."),
    FE(["Hij","is","allergisch","op","gluten."], 3, "voor", "allergisch voor.", ["v-allergie"]),
    DL([("Buurman","Ik eet geen vis, is dat een probleem?","Não como peixe, é um problema?"),("Jij","","")], ["*Helemaal niet! Ik maak voor jou een variant met kip.","Jammer, dan geen eten.|Pouco hospitaleiro.","Vis is gezond!|Ignora o pedido."], "Adaptar.", ["v-dieetwensen"]),
    LI("Houd je rekening met mijn glutenallergie?", ["Houd je rekening met mijn glutenallergie","Houd je rekening met mijn glutenallergie?"], "Tens em conta a minha alergia ao glúten?", "Pedido.", ["v-allergie"]),
  ], diff=3, mins=5)

L(16, "Projeto B (3): a receita", "De ingrediënten.",
  ["Explicar uma receita portuguesa em neerlandês"],
  vocab=[N("v-ingredienten","ingrediënten","ingredientes","de")],
  ex=[("Voor caldo verde heb je deze ingrediënten nodig: aardappelen, boerenkool, knoflook en chouriço.","Para o caldo verde precisas destes ingredientes: batatas, couve, alho e chouriço."),("Snijd de kool in heel dunne reepjes.","Corta a couve em tiras muito finas.")],
  review=["v-recept","v-koken","v-gerecht"],
  cefr=C, exs=[
    MA([("ingrediënten","ingredientes"),("recept","receita"),("gerecht","prato"),("koken","cozinhar")], "Cozinha.", ["v-ingredienten","v-recept","v-gerecht","v-koken"]),
    MC("Numa receita, os verbos aparecem geralmente…", ["*no imperativo: «Snijd», «Bak», «Roer»","no passado|Não.","no futuro|Não."], "Estilo.", ["v-recept"]),
    TR("pt-nl","Corta a couve em tiras finas.", ["Snijd de kool in dunne reepjes","Snijd de kool in fijne reepjes"], "Imperativo.", ["v-recept"]),
    TR("pt-nl","Precisas destes ingredientes.", ["Je hebt deze ingrediënten nodig"], "nodig hebben.", ["v-ingredienten"]),
    FB("___ de aardappelen twintig minuten in water met zout.", ["Kook"], "Imperativo.", ["v-koken"], choices=["Kook","Koken","Kookt"], tr="Coze as batatas vinte minutos em água com sal."),
    FE(["Snijdt","de","ui","in","stukjes."], 0, "Snijd", "Imperativo: radical (snijd).", ["v-recept"]),
    SW("Escreva uma receita portuguesa simples em 5 passos (imperativo).", ["Pastéis de bacalhau (voor 4 personen)\n1. Week de bacalhau een dag in koud water.\n2. Kook de vis en de aardappelen.\n3. Pureer de aardappelen en meng ze met de vis, ei en peterselie.\n4. Maak met twee lepels kleine ovale balletjes.\n5. Bak ze goudbruin in hete olie."], ["5 passos","Imperativo","Ingredientes"], 50, "Receita.", ["v-ingredienten","v-recept"]),
    LI("Roer de soep af en toe door.", ["Roer de soep af en toe door"], "Mexe a sopa de vez em quando.", "Instrução.", ["v-recept"]),
  ], diff=4, mins=6)

L(17, "Projeto B (4): à mesa", "De tafelschikking.",
  ["Receber e conversar à mesa sobre a cultura portuguesa"],
  vocab=[N("v-tafelschikking","tafelschikking","disposição dos lugares à mesa","de")],
  ex=[("Ik heb de tafelschikking zo gemaakt dat iedereen nieuwe mensen leert kennen.","Organizei os lugares para que todos conheçam pessoas novas."),("In Portugal duurt een diner vaak een paar uur.","Em Portugal um jantar dura muitas vezes algumas horas.")],
  review=["v-gastvrij","v-proosten","v-gezellig"],
  cefr=C, exs=[
    MA([("tafelschikking","lugares à mesa"),("proosten op","brindar a"),("gastvrij","hospitaleiro"),("gezellig","acolhedor")], "À mesa.", ["v-tafelschikking","v-proosten","v-gastvrij","v-gezellig"]),
    MC("Brinde em neerlandês:", ["*Proost! Op een gezellige avond!","Eet smakelijk!|Isso é «bom apetite».","Gezondheid!|Isso diz-se depois de um espirro."], "Brindar.", ["v-proosten"]),
    TR("pt-nl","Em Portugal um jantar dura muitas vezes algumas horas.", ["In Portugal duurt een diner vaak een paar uur","In Portugal duurt een diner vaak een aantal uur"], "duren.", ["v-tafelschikking"]),
    TR("pt-nl","Bom apetite!", ["Eet smakelijk!","Eet smakelijk","Smakelijk eten!"], "Expressão.", ["v-gezellig"]),
    FB("Laten we ___ op de nieuwe buren!", ["proosten"], "Brindar.", ["v-proosten"], choices=["proosten","tafelschikking","koken"], tr="Vamos brindar aos novos vizinhos!"),
    FE(["Het","tafelschikking","is","klaar."], 0, "De", "de schikking.", ["v-tafelschikking"]),
    DL([("Buurvrouw","Wat is dit? Het is heerlijk!","O que é isto? Está delicioso!"),("Jij","","")], ["*Dat is arroz de pato, rijst met eend. In Portugal eten we dat vaak op zondag met de familie.","Eten.|Não explica.","Weet ik niet.|Estranho, és o anfitrião."], "Explicar a cultura.", ["v-gerecht"]),
    LI("Wat een gastvrije avond; bedankt voor alles!", ["Wat een gastvrije avond; bedankt voor alles","Wat een gastvrije avond, bedankt voor alles","Wat een gastvrije avond; bedankt voor alles!"], "Que noite tão acolhedora; obrigado por tudo!", "Agradecimento.", ["v-gastvrij"]),
  ], diff=4, mins=5)

# ---------- Projeto C: candidatura ao emprego de sonho ----------

L(18, "Projeto C (1): analisar a vaga", "De functie-eisen.",
  ["Ler um anúncio de emprego e comparar com o teu perfil"],
  vocab=[N("v-functie-eisen","functie-eisen","requisitos da função","de")],
  ex=[("Ik voldoe aan bijna alle functie-eisen.","Cumpro quase todos os requisitos da função."),("Een van de eisen is een rijbewijs B.","Um dos requisitos é carta de condução B.")],
  review=["v-werkervaring","v-vacature","v-cv"],
  cefr=C, exs=[
    MA([("functie-eisen","requisitos"),("werkervaring","experiência profissional"),("vacature","vaga"),("cv","currículo")], "Vaga.", ["v-functie-eisen","v-werkervaring","v-vacature","v-cv"]),
    MC("«Je voldoet aan de functie-eisen» significa…", ["*cumpres os requisitos","exiges um salário|Não.","recusas a vaga|Não."], "Expressão.", ["v-functie-eisen"]),
    MC("Anúncio: «Je hebt minimaal drie jaar werkervaring.» Tens dois anos. O que fazes?", ["*Candidatas-te e mostras outra experiência relevante","Mentes no CV|Nunca.","Desistes sempre|Às vezes vale a pena tentar."], "Estratégia.", ["v-werkervaring"]),
    TR("pt-nl","Cumpro quase todos os requisitos.", ["Ik voldoe aan bijna alle functie-eisen","Ik voldoe aan bijna alle eisen"], "voldoen aan.", ["v-functie-eisen"]),
    FB("Ik heb vijf jaar ___ in de zorg.", ["werkervaring"], "Experiência.", ["v-werkervaring"], choices=["werkervaring","functie-eisen","vacature"], tr="Tenho cinco anos de experiência na área da saúde."),
    FE(["Ik","voldoe","op","alle","eisen."], 2, "aan", "voldoen aan.", ["v-functie-eisen"]),
    LI("Wij zoeken een enthousiaste collega met goede kennis van het Nederlands.", ["Wij zoeken een enthousiaste collega met goede kennis van het Nederlands","We zoeken een enthousiaste collega met goede kennis van het Nederlands"], "Procuramos um colega entusiasta com bons conhecimentos de neerlandês.", "Anúncio (fictício).", ["v-vacature"]),
    WO("Cumpro os requisitos.", ["Ik","voldoe","aan","de","eisen"], "Ordem.", ["v-functie-eisen"]),
  ], diff=4, mins=5)

L(19, "Projeto C (2): a carta de motivação", "Ik herken me in…",
  ["Escrever uma carta de motivação personalizada"],
  vocab=[X("v-zich-herkennen-in","zich herkennen in","identificar-se com","verb")],
  ex=[("Ik herken me goed in de kernwaarden van uw organisatie.","Identifico-me bem com os valores da vossa organização."),("Mijn ervaring sluit goed aan bij deze functie.","A minha experiência adequa-se bem a esta função.")],
  review=["v-motivatiebrief","v-aansluiten-bij","v-kernwaarden"],
  cefr=C, exs=[
    MA([("zich herkennen in","identificar-se com"),("aansluiten bij","adequar-se a"),("motivatiebrief","carta de motivação"),("kernwaarden","valores")], "Carta.", ["v-zich-herkennen-in","v-aansluiten-bij","v-motivatiebrief","v-kernwaarden"]),
    MC("Uma boa carta de motivação…", ["*liga exemplos concretos da tua experiência aos requisitos da vaga","repete o CV inteiro|Não.","é igual para todas as empresas|Perde força."], "Qualidade.", ["v-motivatiebrief"]),
    TR("pt-nl","Identifico-me com os valores da organização.", ["Ik herken me in de kernwaarden van de organisatie","Ik herken mij in de kernwaarden van de organisatie"], "Reflexivo.", ["v-zich-herkennen-in"]),
    TR("pt-nl","A minha experiência adequa-se bem a esta função.", ["Mijn ervaring sluit goed aan bij deze functie"], "aansluiten bij.", ["v-aansluiten-bij"]),
    FB("Ik ___ me helemaal in jullie aanpak.", ["herken"], "Presente.", ["v-zich-herkennen-in"], choices=["herken","herkent","herkennen"], tr="Identifico-me totalmente com a vossa abordagem."),
    FE(["Mijn","opleiding","sluit","goed","aan","met","de","functie."], 5, "bij", "aansluiten bij.", ["v-aansluiten-bij"]),
    SW("Escreva o parágrafo central (60–80 palavras) de uma carta de motivação: uma experiência concreta e porque se adequa à vaga.", ["In mijn huidige functie als teamleider in een hotel in Lissabon heb ik geleerd om onder druk rustig te blijven. Vorig jaar organiseerde ik met mijn team een congres voor 300 gasten. Dankzij een goede planning verliep alles soepel. Deze ervaring sluit goed aan bij uw vacature, waarin u vraagt om iemand die evenementen zelfstandig kan organiseren. Bovendien herken ik me in uw kernwaarde «gastvrijheid»."], ["Exemplo concreto","Ligação à vaga"], 70, "Carta (fictícia).", ["v-zich-herkennen-in","v-aansluiten-bij"]),
    LI("Met veel enthousiasme reageer ik op uw vacature.", ["Met veel enthousiasme reageer ik op uw vacature"], "É com muito entusiasmo que respondo ao vosso anúncio.", "Abertura.", ["v-motivatiebrief"]),
  ], diff=5, mins=7)

L(20, "Projeto C (3): o que te distingue", "Onderscheidend zijn.",
  ["Explicar o que te torna diferente dos outros candidatos"],
  vocab=[X("v-onderscheidend","onderscheidend","distintivo, que se destaca","adjective")],
  ex=[("Wat maakt jou onderscheidend ten opzichte van andere kandidaten?","O que te distingue dos outros candidatos?"),("Mijn talenkennis is onderscheidend: ik spreek vier talen.","O meu conhecimento de línguas distingue-me: falo quatro línguas.")],
  review=["v-elevator-pitch","v-toegevoegde-waarde","v-sterke-punten"],
  cefr=C, exs=[
    MA([("onderscheidend","distintivo"),("toegevoegde waarde","valor acrescentado"),("elevator pitch","apresentação de 30 segundos"),("sterke punten","pontos fortes")], "Destacar-se.", ["v-onderscheidend","v-toegevoegde-waarde","v-elevator-pitch","v-sterke-punten"]),
    MC("«Wat is jouw toegevoegde waarde?» Melhor resposta:", ["*Ik spreek Portugees en Nederlands, dus ik kan de Braziliaanse en Portugese klanten direct helpen.","Ik ben aardig.|Pouco concreto.","Geen idee.|Não."], "Concreto.", ["v-toegevoegde-waarde"]),
    TR("pt-nl","O que te distingue dos outros?", ["Wat maakt jou onderscheidend?","Wat maakt je onderscheidend ten opzichte van anderen?","Wat onderscheidt jou van anderen?"], "onderscheidend.", ["v-onderscheidend"]),
    TR("pt-nl","O meu ponto forte é a comunicação.", ["Mijn sterke punt is communicatie","Communicatie is mijn sterke punt"], "sterk punt.", ["v-sterke-punten"]),
    FB("Een ___ pitch duurt hooguit een halve minuut.", ["goede"], "Adjetivo com -e.", ["v-elevator-pitch"], choices=["goede","goed","goeds"], tr="Uma boa apresentação dura no máximo meio minuto."),
    FE(["Zijn","ervaring","is","echt","onderscheidende."], 4, "onderscheidend.", "Predicativo: sem -e.", ["v-onderscheidend"]),
    SW("Escreva a sua elevator pitch (3–4 frases, 30 segundos).", ["Ik ben Tiago, logistiek planner met zes jaar ervaring in de haven van Sines. Ik ben goed in het oplossen van problemen onder tijdsdruk. Wat mij onderscheidend maakt, is dat ik de Portugese en Nederlandse werkcultuur allebei ken. Ik zoek een functie waarin ik die brug kan slaan."], ["Quem és","Ponto forte","O que te distingue","O que procuras"], 45, "Pitch (fictícia).", ["v-elevator-pitch","v-onderscheidend"]),
    LI("Wat mij onderscheidend maakt, is mijn internationale ervaring.", ["Wat mij onderscheidend maakt, is mijn internationale ervaring","Wat mij onderscheidend maakt is mijn internationale ervaring"], "O que me distingue é a minha experiência internacional.", "Ouvir.", ["v-onderscheidend"]),
  ], diff=5, mins=6)

L(21, "Projeto C (4): entrevista simulada", "Een proefgesprek.",
  ["Praticar uma entrevista completa"],
  vocab=[N("v-proefgesprek","proefgesprek","entrevista de treino","het")],
  ex=[("Een vriendin speelt de werkgever tijdens het proefgesprek.","Uma amiga faz de empregadora na entrevista de treino.")],
  review=["v-salarisindicatie","v-sollicitatiegesprek","v-valkuil"],
  cefr=C, exs=[
    AR("proefgesprek", "entrevista de treino", "het", "het gesprek.", ["v-proefgesprek"]),
    DL([("Interviewer","Vertel eens iets over jezelf.","Fale-me um pouco de si."),("Jij","","")], ["*Ik ben logistiek planner met zes jaar ervaring. Ik werk graag in een team en los graag puzzels op.","Ik ben geboren in 1990 en ik heb een kat en…|Pouco relevante.","Wat wilt u weten?|Evita a pergunta."], "Abertura.", ["v-proefgesprek"]),
    DL([("Interviewer","Wat is uw grootste valkuil?","Qual é o seu maior ponto fraco?"),("Jij","","")], ["*Ik wil soms alles zelf doen. Ik heb geleerd om eerder taken te delegeren.","Ik heb geen valkuilen.|Pouco credível.","Ik ben te perfect.|Cliché."], "Valkuil + aprendizagem.", ["v-valkuil"]),
    DL([("Interviewer","Wat zijn uw salarisverwachtingen?","Quais são as suas expectativas salariais?"),("Jij","","")], ["*Op basis van mijn ervaring denk ik aan een bedrag rond de vacature-indicatie, ongeveer 3.600 euro bruto per maand.","Zoveel mogelijk!|Pouco profissional.","Maakt niet uit.|Desvaloriza-te."], "Salário (valor fictício).", ["v-salarisindicatie"]),
    TR("pt-nl","Posso fazer uma pergunta sobre a equipa?", ["Mag ik een vraag stellen over het team?","Mag ik een vraag stellen over het team","Mag ik iets vragen over het team?"], "Pergunta final.", ["v-sollicitatiegesprek"]),
    FE(["Ik","heb","geleerd","om","taken","te","delegeert."], 6, "delegeren.", "om … te + infinitivo.", ["v-valkuil"]),
    LI("Heeft u zelf nog vragen voor ons?", ["Heeft u zelf nog vragen voor ons","Heeft u zelf nog vragen voor ons?"], "Tem ainda perguntas para nós?", "Fecho da entrevista.", ["v-sollicitatiegesprek"]),
    MC("Depois do proefgesprek, pede-se…", ["*feedback concreto: o que correu bem e o que melhorar","só um elogio|Pouco útil.","nada|Perdes a aprendizagem."], "Aprender.", ["v-proefgesprek","v-feedback-vragen"]),
  ], diff=5, mins=7)

# ---------- Projeto D: um episódio de podcast ----------

L(22, "Projeto D (1): preparar o episódio", "De presentator leidt in.",
  ["Preparar a introdução de um episódio de podcast"],
  vocab=[N("v-presentator","presentator","apresentador","de","presentatoren"), X("v-inleiden","inleiden","introduzir (um tema/convidado)","verb")],
  ex=[("De presentator leidt het onderwerp kort in.","O apresentador introduz o tema brevemente."),("Vandaag te gast: een Portugese bakker in Rotterdam.","Hoje como convidado: um padeiro português em Roterdão.")],
  review=["v-podcast","v-gast","v-draaiboek"],
  cefr=C, exs=[
    MA([("presentator","apresentador"),("inleiden","introduzir"),("gast","convidado"),("draaiboek","guião")], "Podcast.", ["v-presentator","v-inleiden","v-gast","v-draaiboek"]),
    MC("Uma boa introdução de podcast tem…", ["*tema, convidado e porque é interessante — em 30 segundos","cinco minutos de música|Demasiado.","nenhuma apresentação|Confuso."], "Introdução.", ["v-inleiden"]),
    TR("pt-nl","O apresentador introduz o tema.", ["De presentator leidt het onderwerp in","De presentator leidt het thema in"], "Separável.", ["v-inleiden","v-presentator"]),
    TR("pt-nl","Hoje temos um convidado especial.", ["Vandaag hebben we een speciale gast","Vandaag is er een speciale gast"], "gast.", ["v-gast"]),
    FB("Ik zal de volgende spreker even ___.", ["inleiden"], "Infinitivo.", ["v-inleiden"], choices=["inleiden","inleidt","ingeleid"], tr="Vou introduzir brevemente o próximo orador."),
    FE(["De","presentator","leiden","de","gast","in."], 2, "leidt", "Singular: leidt.", ["v-inleiden"]),
    SW("Escreva a introdução (3–4 frases) de um episódio de podcast sobre portugueses que trabalham nos Países Baixos.", ["Welkom bij Tussen Twee Landen, de podcast over Portugezen in Nederland. Ik ben jullie presentator, Rita. Vandaag is mijn gast Paulo, die tien jaar geleden een bakkerij begon in Rotterdam. We praten over heimwee, Hollandse klanten en het geheim van een goede pastel de nata."], ["Boas-vindas","Apresentador","Convidado","Tema"], 45, "Introdução (fictícia).", ["v-presentator","v-inleiden"]),
    LI("Welkom bij een nieuwe aflevering. Vandaag te gast: Paulo.", ["Welkom bij een nieuwe aflevering. Vandaag te gast: Paulo","Welkom bij een nieuwe aflevering vandaag te gast Paulo","Welkom bij een nieuwe aflevering. Vandaag te gast Paulo"], "Bem-vindos a um novo episódio. Hoje como convidado: Paulo.", "Abertura.", ["v-gast","v-aflevering"]),
  ], diff=4, mins=6)

L(23, "Projeto D (2): entrevistar", "Iemand aan het woord laten.",
  ["Conduzir uma entrevista: perguntas abertas e seguimento"],
  vocab=[X("v-aan-het-woord-laten","iemand aan het woord laten","dar a palavra a alguém","verb"), N("v-open-vraag","open vraag","pergunta aberta","de","open vragen")],
  ex=[("Een goede interviewer laat de gast vooral aan het woord.","Um bom entrevistador deixa sobretudo o convidado falar."),("Hoe bedoel je precies?","Como assim, exatamente?")],
  review=["v-doorvragen","v-geinterviewde"],
  cefr=C, exs=[
    MA([("iemand aan het woord laten","dar a palavra"),("doorvragen","fazer perguntas de seguimento"),("geïnterviewde","entrevistado"),("open vraag","pergunta aberta")], "Entrevistar.", ["v-aan-het-woord-laten","v-doorvragen","v-geinterviewde","v-open-vraag"]),
    MC("Qual é uma pergunta aberta?", ["*Hoe was je eerste winter hier?","Was je eerste winter koud?|Responde-se com sim/não.","Ben je Portugees?|Fechada."], "Pergunta aberta.", ["v-open-vraag"]),
    MC("O convidado diz «Het was moeilijk.» Boa pergunta de seguimento:", ["*Wat vond je het moeilijkst?","Oké, volgende vraag.|Perde a história.","Echt?|Pouco."], "Doorvragen.", ["v-doorvragen"]),
    TR("pt-nl","Deixa o convidado falar.", ["Laat de gast aan het woord","Laat de gast praten"], "aan het woord laten.", ["v-aan-het-woord-laten"]),
    FB("Goed dat je even ___; zo kwam het mooiste verhaal eruit.", ["doorvroeg"], "Passado: doorvroeg.", ["v-doorvragen"], choices=["doorvroeg","doorvraagde","doorgevraagd"], tr="Ainda bem que fizeste mais perguntas; assim saiu a melhor história."),
    FE(["De","presentator","laat","de","gast","op","het","woord."], 5, "aan", "aan het woord laten.", ["v-aan-het-woord-laten"]),
    LI("Kun je daar iets meer over vertellen?", ["Kun je daar iets meer over vertellen","Kun je daar iets meer over vertellen?"], "Podes contar um pouco mais sobre isso?", "Pergunta de seguimento.", ["v-doorvragen"]),
    WO("Deixa-o falar.", ["Laat","hem","aan","het","woord"], "Ordem.", ["v-aan-het-woord-laten"]),
  ], diff=4, mins=5)

L(24, "Projeto D (3): gravar e editar", "Opnemen en montage.",
  ["Falar do processo técnico de gravar e editar"],
  vocab=[N("v-montage","montage","edição, montagem (áudio/vídeo)","de"), X("v-terugluisteren","terugluisteren","voltar a ouvir (uma gravação)","verb")],
  ex=[("Na de opname begint de montage.","Depois da gravação começa a edição."),("Luister de aflevering terug voordat je hem publiceert.","Volta a ouvir o episódio antes de o publicares.")],
  review=["v-opname","v-achtergrondgeluid","v-publiceren"],
  cefr=C, exs=[
    MA([("montage","edição"),("terugluisteren","voltar a ouvir"),("opname","gravação"),("achtergrondgeluid","ruído de fundo")], "Técnica.", ["v-montage","v-terugluisteren","v-opname","v-achtergrondgeluid"]),
    MC("Antes de gravar, o mais importante é…", ["*um sítio silencioso, sem ruído de fundo","música alta|Não.","um microfone caro|Ajuda, mas o silêncio importa mais."], "Gravar.", ["v-achtergrondgeluid"]),
    TR("pt-nl","Depois da gravação começa a edição.", ["Na de opname begint de montage"], "montage.", ["v-montage"]),
    TR("pt-nl","Volta a ouvir o episódio.", ["Luister de aflevering terug","Luister de aflevering nog eens terug"], "Separável.", ["v-terugluisteren"]),
    FB("Tijdens de ___ haal ik de lange stiltes eruit.", ["montage"], "Edição.", ["v-montage"], choices=["montage","opname","aflevering"], tr="Durante a edição tiro os silêncios longos."),
    FE(["Hij","luister","de","opname","terug."], 1, "luistert", "Singular: luistert.", ["v-terugluisteren"]),
    LI("Er staat nog veel achtergrondgeluid op de opname.", ["Er staat nog veel achtergrondgeluid op de opname"], "A gravação ainda tem muito ruído de fundo.", "Ouvir.", ["v-achtergrondgeluid"]),
    WO("Volta a ouvir.", ["Luister","het","terug"], "Separável.", ["v-terugluisteren"]),
  ], diff=4, mins=5)

L(25, "Projeto D (4): publicar e ouvir opiniões", "Luisteraars en feedback.",
  ["Pedir e usar feedback dos ouvintes"],
  vocab=[N("v-shownotes","shownotes","notas do episódio","de")],
  ex=[("In de shownotes staan de links die we noemen.","Nas notas do episódio estão as ligações que mencionamos."),("Luisteraars kunnen ons tips sturen.","Os ouvintes podem enviar-nos sugestões.")],
  review=["v-luisteraar","v-feedback-vragen","v-aflevering","v-abonneren"],
  cefr=C, exs=[
    MA([("shownotes","notas do episódio"),("luisteraar","ouvinte"),("om feedback vragen","pedir feedback"),("zich abonneren op","subscrever")], "Publicar.", ["v-shownotes","v-luisteraar","v-feedback-vragen","v-abonneren"]),
    MC("Que informação pões nas shownotes?", ["*tema, convidado e ligações mencionadas","o guião inteiro palavra a palavra|Demasiado.","nada|Perdes a oportunidade."], "Conteúdo.", ["v-shownotes"]),
    TR("pt-nl","Os ouvintes podem enviar-nos sugestões.", ["Luisteraars kunnen ons tips sturen","Luisteraars kunnen ons tips geven"], "luisteraar.", ["v-luisteraar"]),
    TR("pt-nl","Subscreve para não perderes nenhum episódio.", ["Abonneer je, dan mis je geen aflevering","Abonneer je zodat je geen aflevering mist"], "abonneren.", ["v-abonneren"]),
    FB("Wat vonden jullie ervan? We ___ graag om feedback.", ["vragen"], "om feedback vragen.", ["v-feedback-vragen"], choices=["vragen","geven","stellen"], tr="O que acharam? Gostamos de pedir feedback."),
    FE(["Veel","luisteraars","stuurde","een","reactie."], 2, "stuurden", "Plural: stuurden.", ["v-luisteraar"]),
    LI("Bedankt voor het luisteren, en tot de volgende aflevering!", ["Bedankt voor het luisteren, en tot de volgende aflevering","Bedankt voor het luisteren en tot de volgende aflevering","Bedankt voor het luisteren, en tot de volgende aflevering!"], "Obrigado por ouvirem, e até ao próximo episódio!", "Fecho.", ["v-aflevering"]),
    SW("Escreva o fecho do episódio (2–3 frases): agradecer ao convidado e aos ouvintes e pedir feedback.", ["Paulo, heel erg bedankt dat je te gast was. En jij, luisteraar, bedankt voor het luisteren! Heb je tips of vragen? Stuur ons een berichtje; we horen graag van je."], ["Agradecer","Pedir feedback"], 30, "Fecho.", ["v-luisteraar"]),
  ], diff=4, mins=5)

# ---------- Projeto E: o portefólio final ----------

L(26, "Projeto E (1): o portefólio", "Een portfolio samenstellen.",
  ["Reunir os teus melhores trabalhos num portefólio"],
  vocab=[N("v-portfolio","portfolio","portefólio","het","portfolio's")],
  ex=[("In mijn portfolio verzamel ik mijn beste teksten en opnames.","No meu portefólio reúno os meus melhores textos e gravações."),("Bij elk stuk schrijf ik waarom ik het heb gekozen.","Em cada trabalho escrevo porque o escolhi.")],
  review=["v-zelfreflectie","v-leerproces"],
  cefr=C, exs=[
    MA([("portfolio","portefólio"),("zelfreflectie","autorreflexão"),("leerproces","processo de aprendizagem"),("samenstellen","compor")], "Portefólio.", ["v-portfolio","v-zelfreflectie","v-leerproces"]),
    AR("portfolio", "portefólio", "het", "het portfolio.", ["v-portfolio"]),
    MC("O que pôr no portefólio?", ["*Textos e gravações de várias fases, com uma breve reflexão","Só o melhor texto|Mostra pouco o progresso.","Todos os exercícios|Demasiado."], "Seleção.", ["v-portfolio"]),
    TR("pt-nl","No meu portefólio reúno os meus melhores textos.", ["In mijn portfolio verzamel ik mijn beste teksten"], "Inversão.", ["v-portfolio"]),
    FB("Bij elk stuk schrijf ik een korte ___: wat ging goed, wat kan beter?", ["zelfreflectie"], "Reflexão.", ["v-zelfreflectie"], choices=["zelfreflectie","portfolio","opmaak"], tr="Em cada trabalho escrevo uma breve reflexão: o que correu bem, o que pode melhorar?"),
    FE(["De","portfolio","laat","mijn","groei","zien."], 0, "Het", "het portfolio.", ["v-portfolio"]),
    SW("Escolha 3 trabalhos deste curso para o portefólio e diga numa frase porque escolheu cada um.", ["1. Mijn motivatiebrief: hierin gebruik ik voor het eerst formele zinnen zonder hulp.\n2. Mijn blogbericht: ik ben trots op de humor.\n3. Mijn podcastinleiding: hier hoor je dat mijn uitspraak beter is geworden."], ["3 trabalhos","Razão"], 40, "Seleção.", ["v-portfolio"]),
    LI("Kijk eens hoeveel ik in een jaar ben gegroeid.", ["Kijk eens hoeveel ik in een jaar ben gegroeid","Kijk eens hoeveel ik in één jaar ben gegroeid"], "Olha quanto cresci num ano.", "Ouvir.", ["v-groeien"]),
  ], diff=3, mins=6)

L(27, "Projeto E (2): objetivos de aprendizagem", "Leerdoelen formuleren.",
  ["Formular objetivos de aprendizagem concretos"],
  vocab=[N("v-leerdoel","leerdoel","objetivo de aprendizagem","het","leerdoelen")],
  ex=[("Mijn leerdoel: over drie maanden kan ik een vergadering in het Nederlands voorzitten.","O meu objetivo: daqui a três meses consigo presidir a uma reunião em neerlandês."),("Een goed leerdoel is concreet en haalbaar.","Um bom objetivo é concreto e alcançável.")],
  review=["v-haalbaar","v-taalniveau","v-ik-kan"],
  cefr=C, exs=[
    MA([("leerdoel","objetivo de aprendizagem"),("haalbaar","alcançável"),("taalniveau","nível de língua"),("ik kan…","consigo…")], "Objetivos.", ["v-leerdoel","v-haalbaar","v-taalniveau","v-ik-kan"]),
    MC("Qual leerdoel é melhor?", ["*Over twee maanden kan ik zonder hulp met de huisarts bellen.","Ik wil beter Nederlands.|Vago.","Ik wil alles perfect kunnen.|Irrealista."], "Concreto e alcançável.", ["v-leerdoel","v-haalbaar"]),
    AR("leerdoel", "objetivo de aprendizagem", "het", "het doel.", ["v-leerdoel"]),
    TR("pt-nl","Um bom objetivo é concreto e alcançável.", ["Een goed leerdoel is concreet en haalbaar"], "haalbaar.", ["v-leerdoel"]),
    FB("Mijn ___ is nu B2; ik wil naar C1.", ["taalniveau"], "Nível.", ["v-taalniveau"], choices=["taalniveau","leerdoel","portfolio"], tr="O meu nível agora é B2; quero chegar a C1."),
    FE(["Mijn","leerdoelen","is","haalbaar."], 2, "zijn", "Plural: zijn.", ["v-leerdoel"]),
    SW("Formule três leerdoelen concretos para os próximos seis meses (com «Over … kan ik …»).", ["1. Over een maand kan ik een klacht telefonisch afhandelen.\n2. Over drie maanden kan ik een krantenartikel zonder woordenboek begrijpen.\n3. Over zes maanden kan ik een presentatie van tien minuten geven op mijn werk."], ["3 objetivos","Prazos","Concretos"], 45, "Objetivos.", ["v-leerdoel"]),
    LI("Over drie maanden kan ik zonder ondertitels naar het journaal kijken.", ["Over drie maanden kan ik zonder ondertitels naar het journaal kijken","Over drie maanden kan ik zonder ondertiteling naar het journaal kijken"], "Daqui a três meses consigo ver o telejornal sem legendas.", "Objetivo.", ["v-leerdoel"]),
  ], diff=4, mins=6)

L(28, "Projeto E (3): os próximos passos", "De vervolgstap.",
  ["Planear como continuar a aprender depois do curso"],
  vocab=[N("v-vervolgstap","vervolgstap","próximo passo","de","vervolgstappen")],
  ex=[("Een logische vervolgstap is een cursus op C1-niveau.","Um próximo passo lógico é um curso de nível C1."),("Ik blijf oefenen door elke dag de krant te lezen.","Continuo a praticar lendo o jornal todos os dias.")],
  review=["v-blijven-oefenen","v-staatsexamen","v-vrijwilliger"],
  cefr=C, exs=[
    MA([("vervolgstap","próximo passo"),("blijven oefenen","continuar a praticar"),("staatsexamen NT2","exame estatal NT2"),("vrijwilliger","voluntário")], "Continuar.", ["v-vervolgstap","v-blijven-oefenen","v-staatsexamen","v-vrijwilliger"]),
    MC("Formas de continuar a praticar depois do curso:", ["*voluntariado, ler notícias, podcasts, conversar com colegas","parar e esperar|Perdes nível.","só rever listas de palavras|Pouco variado."], "Ideias.", ["v-blijven-oefenen"]),
    TR("pt-nl","Um próximo passo lógico é um curso C1.", ["Een logische vervolgstap is een cursus op C1-niveau","Een logische vervolgstap is een C1-cursus"], "vervolgstap.", ["v-vervolgstap"]),
    TR("pt-nl","Continuo a praticar todos os dias.", ["Ik blijf elke dag oefenen","Ik blijf iedere dag oefenen"], "blijven + inf.", ["v-blijven-oefenen"]),
    FB("Als ___ in de bibliotheek spreek ik elke week Nederlands.", ["vrijwilliger"], "Voluntário.", ["v-vrijwilliger"], choices=["vrijwilliger","vervolgstap","presentator"], tr="Como voluntário na biblioteca falo neerlandês todas as semanas."),
    MC("Qual está correta?", ["*Ik blijf elke dag oefenen.","Ik blijf elke dag te oefenen.|Depois de «blijven» não se usa «te»."], "blijven + infinitivo sem te.", ["v-blijven-oefenen"]),
    LI("Wat is voor jou de volgende stap?", ["Wat is voor jou de volgende stap","Wat is voor jou de volgende stap?"], "Qual é para ti o próximo passo?", "Pergunta.", ["v-vervolgstap"]),
    SW("Descreva em 3–4 frases os seus próximos passos com o neerlandês.", ["Na deze cursus wil ik het staatsexamen NT2 programma II doen. Daarnaast word ik vrijwilliger bij een taalcafé, zodat ik elke week blijf praten. Ook lees ik elke ochtend het nieuws in het Nederlands. Over een jaar wil ik met een C1-cursus beginnen."], ["Exame/curso","Prática semanal","Prazo"], 45, "Plano.", ["v-vervolgstap"]),
  ], diff=4, mins=6)

L(29, "Projeto final: a minha viagem com o neerlandês", "Mijn taalreis.",
  ["Escrever e apresentar uma reflexão final sobre todo o percurso"],
  vocab=[N("v-taalreis","taalreis","percurso linguístico (metáfora)","de")],
  ex=[("Mijn taalreis begon met «Hallo, ik heet…» en eindigt — voorlopig — hier.","A minha viagem pela língua começou com «Olá, chamo-me…» e termina — por agora — aqui.")],
  review=["v-terugblikken","v-vooruitkijken","v-trots-dat","v-dankbaar","v-mijlpaal-bereikt"],
  cefr=C, exs=[
    MA([("taalreis","percurso linguístico"),("terugblikken","olhar para trás"),("vooruitkijken","olhar para a frente"),("dankbaar","grato")], "Reflexão.", ["v-taalreis","v-terugblikken","v-vooruitkijken","v-dankbaar"]),
    TR("pt-nl","Tenho orgulho de conseguir falar neerlandês no trabalho.", ["Ik ben er trots op dat ik op mijn werk Nederlands kan spreken","Ik ben er trots op dat ik Nederlands kan spreken op mijn werk"], "trots op dat.", ["v-trots-dat"]),
    TR("pt-nl","Atingi um marco importante.", ["Ik heb een belangrijke mijlpaal bereikt"], "mijlpaal.", ["v-mijlpaal-bereikt"]),
    FB("Als ik ___, zie ik hoeveel ik heb geleerd.", ["terugblik"], "Separável na subordinada: terugblik.", ["v-terugblikken"], choices=["terugblik","blik terug","terugblikken"], tr="Quando olho para trás, vejo quanto aprendi."),
    FE(["Ik","ben","heel","dankbare","voor","alle","hulp."], 3, "dankbaar", "Predicativo: sem -e.", ["v-dankbaar"]),
    SW("Escreva a sua reflexão final (130–160 palavras): como começou, momentos difíceis, de que tem orgulho, a quem está grato e o que vem a seguir.", ["Mijn taalreis begon drie jaar geleden met een simpel «Hallo, ik heet Ana». Ik weet nog hoe zenuwachtig ik was toen ik voor het eerst de huisarts moest bellen. De moeilijkste momenten waren de vergaderingen op mijn werk: iedereen praatte snel en door elkaar. Toch gaf ik niet op. Ik ben er trots op dat ik nu zelf een vergadering kan leiden en dat mijn collega's soms vergeten dat Nederlands niet mijn moedertaal is. Ik ben dankbaar voor mijn buurvrouw Ineke, die altijd geduldig mijn fouten verbeterde. Als ik terugblik, zie ik vooral veel kleine stappen. Als ik vooruitkijk, zie ik nog een paar grote: het staatsexamen en daarna C1. De reis is dus nog niet voorbij."], ["Início","Dificuldade","Orgulho","Gratidão","Futuro"], 140, "Reflexão final (exemplo fictício).", ["v-taalreis","v-terugblikken","v-vooruitkijken"]),
    LI("De reis is nog niet voorbij, maar ik heb al een lange weg afgelegd.", ["De reis is nog niet voorbij, maar ik heb al een lange weg afgelegd","De reis is nog niet voorbij maar ik heb al een lange weg afgelegd"], "A viagem ainda não acabou, mas já percorri um longo caminho.", "Fecho.", ["v-taalreis"]),
  ], diff=5, mins=8)

W()
