import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u02")
C = "B2"
# Lições de aprofundamento (10–29): sociedade, política e atualidade neerlandesas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "O parlamento", "Een motie in de Tweede Kamer.",
  ["Perceber o vocabulário básico do parlamento"],
  vocab=[N("v-eerste-kamer","Eerste Kamer","Senado (Câmara Alta)","de"), N("v-kamerlid","Kamerlid","deputado(a)","het","Kamerleden"),
         N("v-motie","motie","moção","de","moties")],
  ex=[("De Tweede Kamer heeft 150 zetels.","A Câmara Baixa tem 150 lugares."),("De Eerste Kamer controleert de wetten.","O Senado controla as leis."),("Een Kamerlid diende een motie in.","Um deputado apresentou uma moção.")],
  review=["v-tweede-kamer","v-partij"],
  cefr=C, exs=[
    MA([("Eerste Kamer","Senado"),("Kamerlid","deputado"),("motie","moção"),("Tweede Kamer","Câmara Baixa")], "Parlamento.", ["v-eerste-kamer","v-kamerlid","v-motie","v-tweede-kamer"]),
    MC("Qual câmara é eleita diretamente pelos cidadãos?", ["*a Tweede Kamer","a Eerste Kamer|É eleita pelos conselhos provinciais.","nenhuma|Não."], "Sistema.", ["v-tweede-kamer","v-eerste-kamer"]),
    AR("Kamerlid", "deputado", "het", "het lid → het Kamerlid.", ["v-kamerlid"]),
    TR("pt-nl","Um deputado apresentou uma moção.", ["Een Kamerlid diende een motie in","Een Kamerlid heeft een motie ingediend"], "indienen.", ["v-motie"]),
    TR("pt-nl","A Câmara Baixa tem 150 lugares.", ["De Tweede Kamer heeft 150 zetels","De Tweede Kamer heeft honderdvijftig zetels"], "zetels.", ["v-tweede-kamer"]),
    FB("De ___ werd met een grote meerderheid aangenomen.", ["motie"], "Moção.", ["v-motie"], choices=["motie","kamer","partij"], tr="A moção foi aprovada por larga maioria."),
    FE(["Het","Kamerlid","dienden","een","motie","in."], 2, "diende", "Singular: diende.", ["v-motie"]),
    LI("Een meerderheid van de Kamer steunt de motie.", ["Een meerderheid van de Kamer steunt de motie"], "Uma maioria da Câmara apoia a moção.", "Notícia.", ["v-motie"]),
  ], diff=5, mins=5)

L(11, "Votar", "Je stempas en een geldig identiteitsbewijs.",
  ["Perceber como se vota nos Países Baixos"],
  vocab=[N("v-stembureau","stembureau","assembleia de voto","het","stembureaus"), N("v-stempas","stempas","cartão de eleitor","de"),
         N("v-kieslijst","kieslijst","lista eleitoral","de","kieslijsten")],
  ex=[("Neem je stempas en een geldig identiteitsbewijs mee naar het stembureau.","Leva o cartão de eleitor e um documento de identificação válido à assembleia de voto."),("Op de kieslijst staan alle kandidaten.","Na lista eleitoral estão todos os candidatos."),("Als EU-burger mag je stemmen bij de gemeenteraadsverkiezingen.","Como cidadão da UE podes votar nas eleições municipais.")],
  review=["v-verkiezingen","v-stemmen"],
  cefr=C, exs=[
    MA([("stembureau","assembleia de voto"),("stempas","cartão de eleitor"),("kieslijst","lista eleitoral"),("verkiezingen","eleições")], "Votar.", ["v-stembureau","v-stempas","v-kieslijst","v-verkiezingen"]),
    AR("stembureau", "assembleia de voto", "het", "het bureau → het stembureau.", ["v-stembureau"]),
    MC("Um cidadão português que vive nos Países Baixos pode votar…", ["*nas eleições municipais e europeias","nas eleições para a Tweede Kamer|Só com nacionalidade neerlandesa.","em nenhumas|Não."], "Direitos (cidadão UE).", ["v-verkiezingen"]),
    TR("pt-nl","Leva o cartão de eleitor.", ["Neem je stempas mee","Neem je stempas mee!"], "meenemen.", ["v-stempas"]),
    TR("pt-nl","Na lista estão todos os candidatos.", ["Op de kieslijst staan alle kandidaten"], "kieslijst.", ["v-kieslijst"]),
    FB("Zonder ___ kun je niet stemmen.", ["stempas"], "Cartão de eleitor.", ["v-stempas"], choices=["stempas","kieslijst","stembureau"], tr="Sem cartão de eleitor não podes votar."),
    FE(["De","stembureau","is","open","tot","21.00","uur."], 0, "Het", "het stembureau.", ["v-stembureau"]),
    LI("Vergeet niet je identiteitsbewijs mee te nemen.", ["Vergeet niet je identiteitsbewijs mee te nemen"], "Não te esqueças de levar o documento de identificação.", "Lembrete.", ["v-stempas"]),
  ], diff=4, mins=5)

L(12, "Formar governo", "De formatie duurt lang.",
  ["Perceber como se forma um governo de coligação"],
  vocab=[N("v-formatie","formatie","formação (do governo)","de"), N("v-regeerakkoord","regeerakkoord","acordo de governo","het"),
         N("v-oppositie","oppositie","oposição","de")],
  ex=[("De formatie duurde maanden.","A formação do governo durou meses."),("In het regeerakkoord staan de plannen van het kabinet.","No acordo de governo estão os planos do executivo."),("De oppositie is kritisch.","A oposição é crítica.")],
  review=["v-coalitie","v-kabinet","v-minister-president"],
  cefr=C, exs=[
    MA([("formatie","formação do governo"),("regeerakkoord","acordo de governo"),("oppositie","oposição"),("coalitie","coligação")], "Governo.", ["v-formatie","v-regeerakkoord","v-oppositie","v-coalitie"]),
    MC("Porque é que a formação demora nos Países Baixos?", ["*Nenhum partido tem maioria; é preciso uma coligação","Porque o rei escolhe|Não.","Porque há poucas eleições|Não."], "Sistema.", ["v-formatie"]),
    AR("regeerakkoord", "acordo de governo", "het", "het akkoord.", ["v-regeerakkoord"]),
    TR("pt-nl","A formação do governo durou meses.", ["De formatie duurde maanden","De formatie heeft maanden geduurd"], "formatie.", ["v-formatie"]),
    TR("pt-nl","A oposição é crítica.", ["De oppositie is kritisch"], "oppositie.", ["v-oppositie"]),
    FB("In het ___ staan de afspraken tussen de coalitiepartijen.", ["regeerakkoord"], "Acordo.", ["v-regeerakkoord"], choices=["regeerakkoord","oppositie","kabinet"], tr="No acordo de governo estão os compromissos entre os partidos da coligação."),
    FE(["De","oppositie","stemden","tegen."], 2, "stemde", "Singular: stemde.", ["v-oppositie"]),
    LI("Na een lange formatie werd het nieuwe kabinet beëdigd.", ["Na een lange formatie werd het nieuwe kabinet beëdigd","Na een lange formatie werd het nieuwe kabinet beedigd"], "Depois de uma longa formação, o novo governo tomou posse.", "Notícia.", ["v-formatie","v-kabinet"]),
  ], diff=5, mins=5)

L(13, "Política local", "De wethouder en de gemeenteraad.",
  ["Participar na política do município"],
  vocab=[N("v-wethouder","wethouder","vereador (com pelouro)","de","wethouders"), N("v-raadslid","raadslid","membro da assembleia municipal","het","raadsleden"),
         N("v-inspraak","inspraak","participação pública","de")],
  ex=[("De wethouder van wonen presenteert het plan.","O vereador da habitação apresenta o plano."),("Ik heb een raadslid gemaild over de speeltuin.","Escrevi a um membro da assembleia sobre o parque infantil."),("Bewoners hebben inspraak in het nieuwe plan.","Os moradores participam no novo plano.")],
  review=["v-burgemeester"],
  cefr=C, exs=[
    MA([("wethouder","vereador"),("raadslid","membro da assembleia"),("inspraak","participação pública"),("gemeenteraad","assembleia municipal")], "Local.", ["v-wethouder","v-raadslid","v-inspraak"]),
    AR("raadslid", "membro da assembleia", "het", "het lid.", ["v-raadslid"]),
    MC("Quem é nomeado (e não eleito diretamente)?", ["*de burgemeester","de wethouder|Escolhido pela assembleia.","het raadslid|Eleito."], "Sistema.", ["v-burgemeester"]),
    TR("pt-nl","Os moradores participam no plano.", ["Bewoners hebben inspraak in het plan","De bewoners hebben inspraak in het plan"], "inspraak.", ["v-inspraak"]),
    TR("pt-nl","Escrevi a um membro da assembleia.", ["Ik heb een raadslid gemaild","Ik heb een raadslid een mail gestuurd"], "raadslid.", ["v-raadslid"]),
    FB("Tijdens de ___avond kunnen bewoners hun mening geven.", ["inspraak"], "Composto.", ["v-inspraak"], choices=["inspraak","raadslid","wethouder"], tr="Na sessão de participação pública os moradores podem dar a opinião."),
    FE(["De","wethouders","van","verkeer","is","ziek."], 1, "wethouder", "Singular: is.", ["v-wethouder"]),
    LI("Wilt u inspreken tijdens de raadsvergadering?", ["Wilt u inspreken tijdens de raadsvergadering","Wilt u inspreken tijdens de raadsvergadering?"], "Quer intervir na reunião da assembleia?", "Participação.", ["v-inspraak"]),
  ], diff=5, mins=5)

L(14, "Níveis de governo", "Rijksoverheid, provincie, gemeente.",
  ["Distinguir os níveis da administração pública"],
  vocab=[N("v-rijksoverheid","rijksoverheid","governo central","de"), N("v-ministerie","ministerie","ministério","het","ministeries")],
  ex=[("De rijksoverheid gaat over defensie en onderwijs.","O governo central trata da defesa e da educação."),("Het ministerie van Onderwijs maakt nieuwe regels.","O Ministério da Educação faz novas regras."),("Nederland heeft twaalf provincies.","Os Países Baixos têm doze províncias.")],
  review=["v-provincie","v-waterschap","v-gemeente"],
  cefr=C, exs=[
    MA([("rijksoverheid","governo central"),("ministerie","ministério"),("provincie","província"),("waterschap","autoridade da água")], "Níveis.", ["v-rijksoverheid","v-ministerie","v-provincie","v-waterschap"]),
    MC("Quem cuida dos diques e da gestão da água a nível regional?", ["*het waterschap","de gemeente|Em parte, mas o waterschap é o principal.","het ministerie|Nível nacional."], "Instituições.", ["v-waterschap"]),
    MC("Quem trata do teu passaporte e da recolha de lixo?", ["*de gemeente","de provincie|Não.","het waterschap|Não."], "Instituições.", ["v-gemeente"]),
    AR("ministerie", "ministério", "het", "Het ministerie.", ["v-ministerie"]),
    TR("pt-nl","O governo central trata da defesa.", ["De rijksoverheid gaat over defensie"], "gaan over.", ["v-rijksoverheid"]),
    FB("Nederland heeft twaalf ___.", ["provincies"], "Plural.", ["v-provincie"], choices=["provincies","gemeentes","ministeries"], tr="Os Países Baixos têm doze províncias."),
    FE(["De","ministerie","heeft","een","nieuw","plan."], 0, "Het", "het ministerie.", ["v-ministerie"]),
    LI("Ook voor het waterschap zijn er verkiezingen.", ["Ook voor het waterschap zijn er verkiezingen"], "Também há eleições para a autoridade da água.", "Facto.", ["v-waterschap"]),
  ], diff=4, mins=5)

L(15, "Debate: habitação", "Scheefwonen en middenhuur.",
  ["Discutir o mercado de habitação com vocabulário específico"],
  vocab=[N("v-middenhuur","middenhuur","renda média","de"), N("v-woningcorporatie","woningcorporatie","associação de habitação social","de","woningcorporaties"),
         X("v-scheefwonen","scheefwonen","viver em habitação social com rendimento demasiado alto","verb")],
  ex=[("Er zijn te weinig woningen in de middenhuur.","Há poucas casas com renda média."),("De woningcorporatie verhuurt sociale huurwoningen.","A associação de habitação arrenda casas sociais."),("Wie scheefwoont, verdient eigenlijk te veel voor een sociale huurwoning.","Quem «vive torto» ganha demasiado para uma habitação social.")],
  review=["v-woningnood","v-starter","v-huurprijs"],
  cefr=C, exs=[
    MA([("middenhuur","renda média"),("woningcorporatie","associação de habitação"),("scheefwonen","viver em casa social sem precisar"),("woningnood","falta de habitação")], "Habitação.", ["v-middenhuur","v-woningcorporatie","v-scheefwonen","v-woningnood"]),
    MC("O argumento contra «scheefwonen» é…", ["*ocupa casas sociais de quem precisa","é ilegal|Não necessariamente.","é demasiado caro|Não."], "Debate.", ["v-scheefwonen"]),
    TR("pt-nl","Há poucas casas com renda média.", ["Er zijn te weinig woningen in de middenhuur","Er zijn te weinig middenhuurwoningen"], "middenhuur.", ["v-middenhuur"]),
    TR("pt-nl","A associação arrenda casas sociais.", ["De woningcorporatie verhuurt sociale huurwoningen"], "woningcorporatie.", ["v-woningcorporatie"]),
    FB("Starters vallen vaak tussen sociale huur en koop: ze zoeken ___.", ["middenhuur"], "Renda média.", ["v-middenhuur"], choices=["middenhuur","scheefwonen","corporatie"], tr="Quem procura a primeira casa fica muitas vezes entre a renda social e a compra: procura renda média."),
    FE(["De","woningcorporatie","verhuren","veel","huizen."], 2, "verhuurt", "Singular: verhuurt.", ["v-woningcorporatie"]),
    SW("Dê a sua opinião (4–5 frases) sobre uma solução para a falta de habitação. Use pelo menos dois termos da lição.", ["Volgens mij moet er vooral meer middenhuur komen. Woningcorporaties bouwen sociale woningen, maar starters met een gemiddeld inkomen vallen ertussenin. Scheefwonen is een probleem, maar mensen kunnen nergens anders heen. Daarom moet de overheid investeren in betaalbare huurwoningen voor middeninkomens."], ["Opinião","2+ termos","Argumento"], 40, "Debate.", ["v-middenhuur"]),
  ], diff=5, mins=6)

L(16, "Debate: migração", "Asielzoekers, statushouders, arbeidsmigranten.",
  ["Usar termos precisos ao falar de migração"],
  vocab=[N("v-asielzoeker","asielzoeker","requerente de asilo","de","asielzoekers"), N("v-statushouder","statushouder","refugiado com autorização de residência","de","statushouders"),
         N("v-arbeidsmigrant","arbeidsmigrant","migrante laboral","de","arbeidsmigranten")],
  ex=[("Een asielzoeker wacht op een beslissing over zijn aanvraag.","Um requerente de asilo espera uma decisão sobre o seu pedido."),("Een statushouder mag in Nederland blijven.","Um refugiado reconhecido pode ficar nos Países Baixos."),("Veel arbeidsmigranten werken in de land- en tuinbouw.","Muitos migrantes laborais trabalham na agricultura e horticultura.")],
  review=["v-inburgering","v-integratie","v-gevoelig"],
  cefr=C, exs=[
    MA([("asielzoeker","requerente de asilo"),("statushouder","refugiado reconhecido"),("arbeidsmigrant","migrante laboral"),("inburgering","integração (cívica)")], "Migração.", ["v-asielzoeker","v-statushouder","v-arbeidsmigrant","v-inburgering"]),
    MC("Um português que vem trabalhar numa estufa em Westland é…", ["*een arbeidsmigrant (cidadão UE)","een asielzoeker|Não.","een statushouder|Não."], "Precisão.", ["v-arbeidsmigrant"]),
    MC("Porque é importante usar o termo certo?", ["*Os estatutos têm direitos e situações diferentes","É igual|Não.","Por moda|Não."], "Precisão.", ["v-statushouder"]),
    TR("pt-nl","Um requerente de asilo espera uma decisão.", ["Een asielzoeker wacht op een beslissing","Een asielzoeker wacht op een besluit"], "wachten op.", ["v-asielzoeker"]),
    TR("pt-nl","Muitos migrantes laborais trabalham na agricultura.", ["Veel arbeidsmigranten werken in de landbouw","Veel arbeidsmigranten werken in de land- en tuinbouw"], "arbeidsmigranten.", ["v-arbeidsmigrant"]),
    FB("Een ___ heeft een verblijfsvergunning en zoekt een woning.", ["statushouder"], "Refugiado reconhecido.", ["v-statushouder"], choices=["statushouder","asielzoeker","toerist"], tr="Um refugiado reconhecido tem autorização de residência e procura casa."),
    FE(["Veel","arbeidsmigranten","werkt","in","de","kassen."], 2, "werken", "Plural: werken.", ["v-arbeidsmigrant"]),
    LI("Migratie is een gevoelig onderwerp; probeer genuanceerd te blijven.", ["Migratie is een gevoelig onderwerp; probeer genuanceerd te blijven","Migratie is een gevoelig onderwerp, probeer genuanceerd te blijven"], "A migração é um tema sensível; tenta manter a nuance.", "Dica.", ["v-gevoelig"]),
  ], diff=5, mins=5)

L(17, "Finanças públicas", "Bezuinigen of investeren?",
  ["Falar do orçamento do Estado"],
  vocab=[N("v-begrotingstekort","begrotingstekort","défice orçamental","het"), N("v-staatsschuld","staatsschuld","dívida pública","de")],
  ex=[("Het begrotingstekort is gegroeid.","O défice orçamental aumentou."),("De staatsschuld moet omlaag, vindt de minister.","A dívida pública tem de baixar, acha o ministro."),("De regering wil bezuinigen op subsidies.","O governo quer cortar em subsídios.")],
  review=["v-begroting","v-bezuinigen","v-inflatie"],
  cefr=C, exs=[
    MA([("begrotingstekort","défice orçamental"),("staatsschuld","dívida pública"),("bezuinigen","cortar despesas"),("begroting","orçamento")], "Finanças.", ["v-begrotingstekort","v-staatsschuld","v-bezuinigen","v-begroting"]),
    AR("begrotingstekort", "défice orçamental", "het", "het tekort.", ["v-begrotingstekort"]),
    MC("«Bezuinigen op onderwijs» significa…", ["*cortar despesas na educação","investir na educação|É o contrário.","privatizar|Não."], "Sentido.", ["v-bezuinigen"]),
    TR("pt-nl","O défice orçamental aumentou.", ["Het begrotingstekort is gegroeid","Het begrotingstekort is gestegen"], "is + particípio.", ["v-begrotingstekort"]),
    TR("pt-nl","O governo quer cortar em subsídios.", ["De regering wil bezuinigen op subsidies","Het kabinet wil bezuinigen op subsidies"], "bezuinigen op.", ["v-bezuinigen"]),
    FB("De regering wil ___ op cultuur.", ["bezuinigen"], "Cortar.", ["v-bezuinigen"], choices=["bezuinigen","investeren","begroting"], tr="O governo quer cortar na cultura."),
    FE(["De","staatsschuld","zijn","gestegen."], 2, "is", "Singular: is.", ["v-staatsschuld"]),
    LI("Op Prinsjesdag presenteert het kabinet de begroting.", ["Op Prinsjesdag presenteert het kabinet de begroting"], "No Prinsjesdag o governo apresenta o orçamento.", "Cultura política.", ["v-begroting","v-prinsjesdag"]),
  ], diff=5, mins=5)

L(18, "Impostos e subsídios", "Btw, inkomstenbelasting en toeslagen.",
  ["Perceber os impostos e subsídios principais"],
  vocab=[N("v-btw","btw","IVA","de"), N("v-inkomstenbelasting","inkomstenbelasting","imposto sobre o rendimento","de"),
         N("v-toeslagen","toeslagen","subsídios (renda, saúde, filhos)","de")],
  ex=[("Op de meeste producten zit btw.","A maioria dos produtos tem IVA."),("Elk voorjaar doe je aangifte inkomstenbelasting.","Todas as primaveras fazes a declaração de IRS."),("Met een laag inkomen kun je toeslagen aanvragen.","Com rendimentos baixos podes pedir subsídios.")],
  review=["v-belasting","v-belastingdienst"],
  cefr=C, exs=[
    MA([("btw","IVA"),("inkomstenbelasting","imposto sobre o rendimento"),("toeslagen","subsídios"),("belasting","imposto")], "Impostos.", ["v-btw","v-inkomstenbelasting","v-toeslagen","v-belasting"]),
    MC("Exemplos de toeslagen:", ["*huurtoeslag, zorgtoeslag, kinderopvangtoeslag","btw, accijns|Isso são impostos.","salaris, bonus|Não."], "Tipos.", ["v-toeslagen"]),
    TR("pt-nl","Faço a declaração de IRS na primavera.", ["Ik doe in het voorjaar aangifte inkomstenbelasting","Ik doe mijn belastingaangifte in het voorjaar"], "aangifte doen.", ["v-inkomstenbelasting"]),
    TR("pt-nl","Com rendimentos baixos podes pedir subsídios.", ["Met een laag inkomen kun je toeslagen aanvragen"], "aanvragen.", ["v-toeslagen"]),
    FB("Is de prijs inclusief ___?", ["btw"], "IVA.", ["v-btw"], choices=["btw","toeslag","aangifte"], tr="O preço inclui IVA?"),
    FE(["Ik","heb","zorgtoeslagen","aangevraagd","voor","één","maand."], 2, "zorgtoeslag", "Singular: zorgtoeslag.", ["v-toeslagen"]),
    LI("Controleer elk jaar of je nog recht hebt op toeslagen.", ["Controleer elk jaar of je nog recht hebt op toeslagen"], "Verifica todos os anos se ainda tens direito a subsídios.", "Dica (informação geral).", ["v-toeslagen"]),
    DL([("Collega","Ik snap niks van die belastingaangifte.","Não percebo nada da declaração de impostos."),("Jij","","")], ["*Ik ook niet altijd. Er zijn gratis spreekuren in de bibliotheek waar ze je helpen.","Btw!|Sem sentido.","Toeslagen.|Incompleto."], "Ajudar.", ["v-inkomstenbelasting"]),
  ], diff=4, mins=5)

L(19, "Trabalho e sindicatos", "De vakbond wil een loonsverhoging.",
  ["Falar de relações laborais"],
  vocab=[N("v-vakbond","vakbond","sindicato","de","vakbonden"), N("v-flexwerker","flexwerker","trabalhador precário/temporário","de","flexwerkers")],
  ex=[("De vakbond onderhandelt over een nieuwe cao.","O sindicato negoceia um novo contrato coletivo."),("Steeds meer mensen zijn flexwerker.","Cada vez mais pessoas são trabalhadores temporários."),("De vakbond dreigt met een staking.","O sindicato ameaça com uma greve.")],
  review=["v-staking","v-loonsverhoging"],
  cefr=C, exs=[
    MA([("vakbond","sindicato"),("flexwerker","trabalhador temporário"),("cao","contrato coletivo"),("staking","greve")], "Trabalho.", ["v-vakbond","v-flexwerker","v-staking"]),
    TR("pt-nl","O sindicato negoceia um novo contrato coletivo.", ["De vakbond onderhandelt over een nieuwe cao"], "onderhandelen over.", ["v-vakbond"]),
    TR("pt-nl","Cada vez mais pessoas são trabalhadores temporários.", ["Steeds meer mensen zijn flexwerker","Steeds meer mensen werken flexibel"], "flexwerker.", ["v-flexwerker"]),
    MC("Um «flexwerker» tem normalmente…", ["*um contrato temporário ou sem horas fixas","um contrato fixo|Não.","nenhum trabalho|Não."], "Definição.", ["v-flexwerker"]),
    FB("De ___ eist vier procent meer loon.", ["vakbond"], "Sindicato.", ["v-vakbond"], choices=["vakbond","flexwerker","cao"], tr="O sindicato exige quatro por cento mais de salário."),
    FE(["De","vakbonden","dreigt","met","een","staking."], 2, "dreigen", "Plural: dreigen.", ["v-vakbond"]),
    LI("Het personeel van de NS legt morgen het werk neer.", ["Het personeel van de NS legt morgen het werk neer"], "O pessoal da NS faz greve amanhã.", "Notícia: het werk neerleggen = fazer greve.", ["v-staking"]),
    SW("Explique em 3 frases a um amigo português o que é uma «cao» e para que serve um sindicato.", ["Een cao is een afspraak tussen werkgevers en vakbonden over loon en arbeidsvoorwaarden. Hij geldt voor een hele sector, bijvoorbeeld de zorg. De vakbond onderhandelt namens de werknemers en kan zo nodig een staking organiseren."], ["Definição","Função do sindicato"], 30, "Explicar.", ["v-vakbond"]),
  ], diff=5, mins=5)

L(20, "Ambiente e agricultura", "De stikstofcrisis.",
  ["Perceber o debate sobre azoto e natureza"],
  vocab=[N("v-stikstof","stikstof","azoto","de"), N("v-natuurgebied","natuurgebied","área natural protegida","het","natuurgebieden")],
  ex=[("Te veel stikstof schaadt de natuur.","Demasiado azoto prejudica a natureza."),("Rond kwetsbare natuurgebieden gelden strengere regels.","À volta de áreas naturais vulneráveis aplicam-se regras mais rigorosas."),("Boeren protesteerden met trekkers in Den Haag.","Os agricultores protestaram com tratores em Haia.")],
  review=["v-klimaatverandering","v-uitstoot","v-duurzaam"],
  cefr=C, exs=[
    MA([("stikstof","azoto"),("natuurgebied","área natural"),("uitstoot","emissões"),("duurzaam","sustentável")], "Ambiente.", ["v-stikstof","v-natuurgebied","v-uitstoot","v-duurzaam"]),
    AR("natuurgebied", "área natural", "het", "het gebied.", ["v-natuurgebied"]),
    MC("O debate sobre stikstof opõe sobretudo…", ["*proteção da natureza vs. agricultura e construção","futebol vs. cultura|Não.","Norte vs. Sul|Não."], "Contexto.", ["v-stikstof"]),
    TR("pt-nl","Demasiado azoto prejudica a natureza.", ["Te veel stikstof schaadt de natuur","Te veel stikstof is slecht voor de natuur"], "schaden.", ["v-stikstof"]),
    TR("pt-nl","Os agricultores protestaram.", ["De boeren protesteerden","Boeren hebben geprotesteerd"], "Passado.", ["v-stikstof"]),
    FB("Rond het ___ mag niet meer gebouwd worden.", ["natuurgebied"], "Área natural.", ["v-natuurgebied"], choices=["natuurgebied","stikstof","uitstoot"], tr="À volta da área natural já não se pode construir."),
    FE(["De","natuurgebied","is","kwetsbaar."], 0, "Het", "het natuurgebied.", ["v-natuurgebied"]),
    LI("Er moet een balans komen tussen landbouw en natuur.", ["Er moet een balans komen tussen landbouw en natuur"], "Tem de haver equilíbrio entre agricultura e natureza.", "Opinião equilibrada.", ["v-stikstof"]),
  ], diff=5, mins=5)

L(21, "Tecnologia e riscos", "Een datalek bij de gemeente.",
  ["Falar de riscos digitais"],
  vocab=[N("v-datalek","datalek","fuga de dados","het","datalekken"), N("v-algoritme","algoritme","algoritmo","het","algoritmes"),
         N("v-desinformatie","desinformatie","desinformação","de")],
  ex=[("Bij een datalek kwamen gegevens van klanten op straat.","Numa fuga de dados, os dados de clientes ficaram expostos."),("Een algoritme bepaalt welke berichten je ziet.","Um algoritmo decide que mensagens vês."),("Desinformatie verspreidt zich snel online.","A desinformação espalha-se depressa online.")],
  review=["v-privacy","v-kunstmatige-intelligentie","v-nepnieuws"],
  cefr=C, exs=[
    MA([("datalek","fuga de dados"),("algoritme","algoritmo"),("desinformatie","desinformação"),("privacy","privacidade")], "Digital.", ["v-datalek","v-algoritme","v-desinformatie","v-privacy"]),
    AR("algoritme", "algoritmo", "het", "Het algoritme.", ["v-algoritme"]),
    AR("datalek", "fuga de dados", "het", "het lek.", ["v-datalek"]),
    TR("pt-nl","Um algoritmo decide o que vês.", ["Een algoritme bepaalt wat je ziet"], "bepalen.", ["v-algoritme"]),
    TR("pt-nl","A desinformação espalha-se depressa.", ["Desinformatie verspreidt zich snel"], "zich verspreiden.", ["v-desinformatie"]),
    FB("Door een ___ lagen duizenden adressen op straat.", ["datalek"], "Fuga de dados.", ["v-datalek"], choices=["datalek","algoritme","privacy"], tr="Por causa de uma fuga de dados, milhares de moradas ficaram expostas."),
    FE(["De","algoritme","is","niet","neutraal."], 0, "Het", "het algoritme.", ["v-algoritme"]),
    LI("Algoritmes kunnen discrimineren als ze slecht ontworpen zijn.", ["Algoritmes kunnen discrimineren als ze slecht ontworpen zijn"], "Os algoritmos podem discriminar se forem mal concebidos.", "Debate.", ["v-algoritme"]),
  ], diff=5, mins=5)

L(22, "Saúde e custos", "De zorgpremie stijgt.",
  ["Falar do sistema de saúde e dos custos"],
  vocab=[N("v-zorgpremie","zorgpremie","prémio do seguro de saúde","de")],
  ex=[("De zorgpremie stijgt volgend jaar weer.","O prémio do seguro de saúde volta a subir no próximo ano."),("Het eigen risico moet je eerst zelf betalen.","A franquia tens de pagar primeiro tu."),("In november kun je overstappen naar een andere verzekeraar.","Em novembro podes mudar de seguradora.")],
  review=["v-eigen-risico","v-zorgverzekering","v-overstappen-verzekering"],
  cefr=C, exs=[
    MA([("zorgpremie","prémio do seguro"),("eigen risico","franquia"),("zorgverzekering","seguro de saúde"),("overstappen naar","mudar para")], "Saúde.", ["v-zorgpremie","v-eigen-risico","v-zorgverzekering","v-overstappen-verzekering"]),
    MC("O seguro de saúde básico nos Países Baixos é…", ["*obrigatório para quem vive e trabalha cá","opcional|Não.","gratuito|Paga-se prémio."], "Sistema.", ["v-zorgverzekering"]),
    TR("pt-nl","O prémio sobe no próximo ano.", ["De zorgpremie stijgt volgend jaar","Volgend jaar stijgt de zorgpremie"], "zorgpremie.", ["v-zorgpremie"]),
    TR("pt-nl","Em novembro podes mudar de seguradora.", ["In november kun je overstappen naar een andere verzekeraar","In november kun je overstappen"], "overstappen.", ["v-overstappen-verzekering"]),
    FB("Eerst betaal je het eigen ___ zelf.", ["risico"], "Franquia.", ["v-eigen-risico"], choices=["risico","premie","toeslag"], tr="Primeiro pagas tu a franquia."),
    FE(["De","zorgpremies","stijgt","weer."], 2, "stijgen", "Plural: stijgen.", ["v-zorgpremie"]),
    LI("Met een laag inkomen kun je zorgtoeslag krijgen.", ["Met een laag inkomen kun je zorgtoeslag krijgen"], "Com rendimentos baixos podes receber subsídio de saúde.", "Informação geral.", ["v-toeslagen"]),
    DL([("Vriend","Moet ik echt een zorgverzekering nemen? Ik ben nooit ziek.","Tenho mesmo de fazer seguro de saúde? Nunca estou doente."),("Jij","","")], ["*Ja, de basisverzekering is verplicht als je hier woont of werkt. Kijk wel of je zorgtoeslag kunt krijgen.","Nee hoor.|Errado.","Eigen risico.|Incompleto."], "Informar.", ["v-zorgverzekering"]),
  ], diff=4, mins=5)

L(23, "Educação", "Studieschuld en de basisbeurs.",
  ["Falar do financiamento dos estudos e da falta de professores"],
  vocab=[N("v-studieschuld","studieschuld","dívida de estudos","de"), N("v-basisbeurs","basisbeurs","bolsa básica (estudantes)","de")],
  ex=[("Veel studenten hebben een flinke studieschuld.","Muitos estudantes têm uma dívida de estudos considerável."),("De basisbeurs is opnieuw ingevoerd.","A bolsa básica foi reintroduzida."),("Door het lerarentekort zijn klassen groter.","Por causa da falta de professores as turmas são maiores.")],
  review=["v-lerarentekort","v-afschaffing"],
  cefr=C, exs=[
    MA([("studieschuld","dívida de estudos"),("basisbeurs","bolsa básica"),("lerarentekort","falta de professores"),("afschaffing","abolição")], "Educação.", ["v-studieschuld","v-basisbeurs","v-lerarentekort","v-afschaffing"]),
    TR("pt-nl","Muitos estudantes têm dívida de estudos.", ["Veel studenten hebben een studieschuld","Veel studenten hebben studieschuld"], "studieschuld.", ["v-studieschuld"]),
    TR("pt-nl","A bolsa foi reintroduzida.", ["De basisbeurs is opnieuw ingevoerd","De basisbeurs is weer ingevoerd"], "Passiva.", ["v-basisbeurs"]),
    MC("Debate: a afschaffing da basisbeurs (2015) levou a…", ["*mais dívida para muitos estudantes","mais bolsas|Não.","propinas grátis|Não."], "Contexto.", ["v-studieschuld","v-afschaffing"]),
    FB("Door het ___ zitten er nu dertig kinderen in de klas.", ["lerarentekort"], "Falta de professores.", ["v-lerarentekort"], choices=["lerarentekort","studieschuld","basisbeurs"], tr="Por causa da falta de professores há agora trinta crianças na turma."),
    FE(["Mijn","studieschuld","zijn","hoog."], 2, "is", "Singular: is.", ["v-studieschuld"]),
    LI("Studeren mag geen luxe zijn.", ["Studeren mag geen luxe zijn"], "Estudar não pode ser um luxo.", "Opinião.", ["v-studieschuld"]),
    SW("Dê a sua opinião em 3–4 frases: o ensino superior deve ser gratuito?", ["Ik vind dat hoger onderwijs zo goedkoop mogelijk moet zijn. Een grote studieschuld kan jongeren afschrikken. Aan de andere kant profiteren afgestudeerden later van een hoger inkomen. Een basisbeurs voor iedereen lijkt me een eerlijk compromis."], ["Opinião","Contra-argumento","Conclusão"], 35, "Opinião.", ["v-studieschuld","v-basisbeurs"]),
  ], diff=4, mins=5)

L(24, "Mobilidade", "Een kilometerheffing?",
  ["Discutir transportes e mobilidade"],
  vocab=[N("v-kilometerheffing","kilometerheffing","taxa por quilómetro","de")],
  ex=[("Met een kilometerheffing betaal je per gereden kilometer.","Com uma taxa por quilómetro pagas por cada quilómetro conduzido."),("In de spits is de trein overvol.","Na hora de ponta o comboio está a abarrotar."),("Het ov is duur, vinden veel reizigers.","Os transportes públicos são caros, acham muitos passageiros.")],
  review=["v-spits","v-ov","v-file"],
  cefr=C, exs=[
    MA([("kilometerheffing","taxa por km"),("spits","hora de ponta"),("ov","transportes públicos"),("file","fila de trânsito")], "Mobilidade.", ["v-kilometerheffing","v-spits","v-ov","v-file"]),
    MC("Argumento a favor da kilometerheffing:", ["*quem conduz mais, paga mais","é mais barato para todos|Não necessariamente.","acaba com os carros|Não."], "Debate.", ["v-kilometerheffing"]),
    TR("pt-nl","Na hora de ponta o comboio está cheio.", ["In de spits is de trein overvol","In de spits is de trein vol"], "spits.", ["v-spits"]),
    TR("pt-nl","Pagas por cada quilómetro.", ["Je betaalt per gereden kilometer","Je betaalt per kilometer"], "per.", ["v-kilometerheffing"]),
    FB("Ik vermijd de ___ en vertrek om half tien.", ["spits"], "Hora de ponta.", ["v-spits"], choices=["spits","file","ov"], tr="Evito a hora de ponta e saio às nove e meia."),
    FE(["De","ov","is","duur."], 0, "Het", "het ov.", ["v-ov"]),
    LI("Thuiswerken op vrijdag zorgt voor minder files.", ["Thuiswerken op vrijdag zorgt voor minder files"], "Trabalhar de casa à sexta leva a menos filas.", "Tendência.", ["v-file"]),
    SW("Opinião (3–4 frases): os transportes públicos deviam ser gratuitos nas cidades?", ["Gratis ov in de stad lijkt me een goed idee. Er komen dan minder auto's in het centrum en de lucht wordt schoner. Wel moet de overheid zorgen voor genoeg treinen en bussen, anders worden ze overvol. Misschien kan het eerst in de daluren."], ["Opinião","Condição","Proposta"], 35, "Opinião.", ["v-ov"]),
  ], diff=4, mins=5)

L(25, "Os media", "Hoor en wederhoor.",
  ["Perceber o papel dos media e princípios jornalísticos"],
  vocab=[N("v-publieke-omroep","publieke omroep","serviço público de rádio e televisão","de"), X("v-hoor-en-wederhoor","hoor en wederhoor","ouvir as duas partes (princípio jornalístico)")],
  ex=[("De NOS is onderdeel van de publieke omroep.","A NOS faz parte do serviço público de rádio e televisão."),("Een goede journalist past hoor en wederhoor toe.","Um bom jornalista ouve as duas partes.")],
  review=["v-talkshow","v-actualiteit","v-onafhankelijke-bron"],
  cefr=C, exs=[
    MA([("publieke omroep","serviço público de média"),("hoor en wederhoor","ouvir as duas partes"),("talkshow","talk-show"),("actualiteit","atualidade")], "Media.", ["v-publieke-omroep","v-hoor-en-wederhoor","v-talkshow","v-actualiteit"]),
    MC("«Hoor en wederhoor» significa que o jornalista…", ["*dá a palavra às duas partes de um conflito","ouve rádio|Não.","só ouve uma fonte|Não."], "Princípio.", ["v-hoor-en-wederhoor"]),
    TR("pt-nl","Um bom jornalista ouve as duas partes.", ["Een goede journalist past hoor en wederhoor toe","Een goede journalist doet aan hoor en wederhoor"], "Expressão.", ["v-hoor-en-wederhoor"]),
    TR("pt-nl","A NOS faz parte do serviço público.", ["De NOS is onderdeel van de publieke omroep","De NOS hoort bij de publieke omroep"], "publieke omroep.", ["v-publieke-omroep"]),
    FB("In het artikel ontbreekt ___ en wederhoor: de andere partij komt niet aan het woord.", ["hoor"], "Expressão.", ["v-hoor-en-wederhoor"], choices=["hoor","luister","zie"], tr="No artigo falta ouvir as duas partes: a outra parte não tem voz."),
    FE(["Het","publieke","omroep","maakt","nieuwsprogramma's."], 0, "De", "de omroep.", ["v-publieke-omroep"]),
    LI("Het NOS Journaal is om acht uur 's avonds.", ["Het NOS Journaal is om acht uur 's avonds","Het NOS-journaal is om acht uur 's avonds"], "O telejornal da NOS é às oito da noite.", "Cultura.", ["v-publieke-omroep"]),
    MC("Uma boa forma de seguir a atualidade em neerlandês fácil:", ["*NOS Jeugdjournaal ou notícias em linguagem simples","só redes sociais|Arriscado.","não ler nada|Não."], "Dica.", ["v-actualiteit"]),
  ], diff=4, mins=5)

L(26, "Temas sensíveis", "Een taboe doorbreken.",
  ["Falar de temas sensíveis com tato"],
  vocab=[X("v-maatschappelijk-debat","het maatschappelijk debat","o debate público"), X("v-taboe-doorbreken","een taboe doorbreken","quebrar um tabu")],
  ex=[("Het maatschappelijk debat over euthanasie is in Nederland al lang open.","O debate público sobre a eutanásia está aberto há muito nos Países Baixos."),("Met haar boek doorbrak ze een taboe.","Com o livro dela quebrou um tabu.")],
  review=["v-taboe","v-gevoelig","v-polarisatie","v-draagvlak"],
  cefr=C, exs=[
    MA([("het maatschappelijk debat","o debate público"),("een taboe doorbreken","quebrar um tabu"),("gevoelig","sensível"),("draagvlak","apoio social")], "Debate.", ["v-maatschappelijk-debat","v-taboe-doorbreken","v-gevoelig","v-draagvlak"]),
    TR("pt-nl","Ela quebrou um tabu.", ["Ze doorbrak een taboe","Zij heeft een taboe doorbroken"], "doorbreken (inseparável).", ["v-taboe-doorbreken"]),
    TR("pt-nl","O debate público está aberto.", ["Het maatschappelijk debat is open","Het maatschappelijke debat is open"], "Expressão.", ["v-maatschappelijk-debat"]),
    MC("«Doorbreken» aqui é inseparável porque…", ["*o acento está em «-bre-» (door-BRE-ken)","é sempre separável|Não.","não tem particípio|Não."], "Acento.", ["v-taboe-doorbreken"]),
    FB("Zonder breed ___ komt de wet er niet.", ["draagvlak"], "Apoio social.", ["v-draagvlak"], choices=["draagvlak","taboe","debat"], tr="Sem amplo apoio social a lei não passa."),
    FE(["Ze","heeft","een","taboe","doorgebroken."], 4, "doorbroken.", "Inseparável: doorbroken.", ["v-taboe-doorbreken"]),
    LI("Over geld praten is in Nederland nog steeds een beetje taboe.", ["Over geld praten is in Nederland nog steeds een beetje taboe"], "Falar de dinheiro nos Países Baixos ainda é um bocadinho tabu.", "Cultura (observação geral).", ["v-taboe"]),
    DL([("Collega","Waarom praten we eigenlijk nooit over salarissen?","Porque é que nunca falamos de salários?"),("Jij","","")], ["*Goede vraag. Misschien is het tijd om dat taboe te doorbreken; transparantie helpt tegen ongelijkheid.","Taboe!|Incompleto.","Debat.|Incompleto."], "Discutir com tato.", ["v-taboe-doorbreken"]),
  ], diff=5, mins=5)

L(27, "Ler notícias políticas", "De minister treedt af.",
  ["Perceber notícias sobre crises políticas"],
  vocab=[N("v-kamerdebat","Kamerdebat","debate parlamentar","het","Kamerdebatten"), X("v-aftreden","aftreden","demitir-se (cargo político)","verb")],
  ex=[("Na een fel Kamerdebat trad de minister af.","Depois de um debate parlamentar aceso, o ministro demitiu-se."),("De oppositie eist dat hij aftreedt.","A oposição exige que ele se demita.")],
  review=["v-motie","v-oppositie","v-ontslag-nemen"],
  cefr=C, exs=[
    MA([("Kamerdebat","debate parlamentar"),("aftreden","demitir-se (político)"),("ontslag nemen","demitir-se (emprego)"),("motie","moção")], "Crise.", ["v-kamerdebat","v-aftreden","v-ontslag-nemen","v-motie"]),
    MC("«Aftreden» usa-se sobretudo para…", ["*cargos políticos (ministros, presidentes)","empregados de loja|Usa-se «ontslag nemen».","alunos|Não."], "Registo.", ["v-aftreden"]),
    CO("text","Nieuwsbericht (fictief)","Minister Jansen is vanavond afgetreden. Tijdens een urenlang Kamerdebat werd duidelijk dat ze de Kamer onjuist had geïnformeerd over de kosten van een nieuw ICT-systeem. Een motie van wantrouwen kreeg steun van een meerderheid. De minister-president noemde het besluit «begrijpelijk en moedig».",
       [("Porque se demitiu?", ["*Informou mal o parlamento","Estava doente","Perdeu eleições"]),("O que teve maioria?", ["*Uma moção de censura","O sistema informático","O orçamento"]),("Como reagiu o primeiro-ministro?", ["*Chamou a decisão compreensível e corajosa","Ficou zangado","Não reagiu"])],
       "Notícia fictícia.", ["v-aftreden","v-kamerdebat","v-motie"]),
    TR("pt-nl","O ministro demitiu-se.", ["De minister is afgetreden","De minister trad af"], "aftreden.", ["v-aftreden"]),
    FB("De oppositie eist dat de staatssecretaris ___.", ["aftreedt"], "Subordinada: verbo junto no fim.", ["v-aftreden"], choices=["aftreedt","treedt af","aftreden"], tr="A oposição exige que o secretário de Estado se demita."),
    FE(["De","minister","is","afgetreedt."], 3, "afgetreden.", "Particípio forte: afgetreden.", ["v-aftreden"]),
    AR("Kamerdebat", "debate parlamentar", "het", "het debat.", ["v-kamerdebat"]),
    LI("Een motie van wantrouwen is een zwaar middel.", ["Een motie van wantrouwen is een zwaar middel"], "Uma moção de censura é um instrumento pesado.", "Vocabulário político.", ["v-motie"]),
  ], diff=5, mins=6)

L(28, "Falar sobre o voto", "Ik ben een zwevende kiezer.",
  ["Falar das próprias escolhas políticas com discrição"],
  vocab=[X("v-zwevende-kiezer","zwevende kiezer","eleitor indeciso"), X("v-stemmen-op","stemmen op","votar em","verb")],
  ex=[("Ik ben een zwevende kiezer: ik twijfel nog.","Sou um eleitor indeciso: ainda tenho dúvidas."),("Op wie ga je stemmen?","Em quem vais votar?"),("Dat houd ik liever voor mezelf.","Prefiro guardar isso para mim.")],
  review=["v-verkiezingen","v-stemmen"],
  cefr=C, exs=[
    MA([("zwevende kiezer","eleitor indeciso"),("stemmen op","votar em"),("verkiezingen","eleições"),("stemmen","votar")], "Voto.", ["v-zwevende-kiezer","v-stemmen-op","v-verkiezingen","v-stemmen"]),
    MC("Perguntaram-lhe em quem vota e prefere não dizer:", ["*Dat houd ik liever voor mezelf.","Gaat je niks aan!|Rude.","Weet ik niet, dom.|Não."], "Discrição.", ["v-stemmen-op"]),
    TR("pt-nl","Em quem vais votar?", ["Op wie ga je stemmen","Op wie ga je stemmen?","Op wie stem je"], "stemmen op.", ["v-stemmen-op"]),
    TR("pt-nl","Sou um eleitor indeciso.", ["Ik ben een zwevende kiezer"], "Expressão.", ["v-zwevende-kiezer"]),
    FB("Veel ___ kiezers beslissen pas in het stemhokje.", ["zwevende"], "de kiezer → -e.", ["v-zwevende-kiezer"], choices=["zwevende","zwevend","stemmende"], tr="Muitos eleitores indecisos só decidem na cabine de voto."),
    FE(["Ik","stem","aan","een","kleine","partij."], 2, "op", "stemmen op.", ["v-stemmen-op"]),
    LI("Met een stemwijzer kun je partijstandpunten vergelijken.", ["Met een stemwijzer kun je partijstandpunten vergelijken"], "Com um guia de voto podes comparar posições dos partidos.", "Dica.", ["v-zwevende-kiezer"]),
    DL([("Collega","Ga jij stemmen bij de gemeenteraadsverkiezingen?","Vais votar nas eleições municipais?"),("Jij","","")], ["*Ja, als EU-burger mag dat. Ik ben nog een zwevende kiezer; ik ga eerst de stemwijzer invullen.","Nee, verboden.|Errado para cidadão UE.","Op wie?|Não responde."], "Informar e decidir.", ["v-zwevende-kiezer"]),
  ], diff=4, mins=5)

L(29, "Prática: acompanhar a atualidade", "Het nieuws van de week.",
  ["Resumir e comentar notícias da semana"],
  vocab=[X("v-nieuws-van-de-week","het nieuws van de week","as notícias da semana")],
  ex=[("Laten we het nieuws van de week bespreken.","Vamos discutir as notícias da semana.")],
  review=["v-formatie","v-wethouder","v-middenhuur","v-statushouder","v-begrotingstekort","v-vakbond","v-stikstof","v-datalek","v-hoor-en-wederhoor","v-aftreden"],
  cefr=C, exs=[
    CO("text","Weekoverzicht (fictief)","Maandag: de vakbond kondigde acties aan in het openbaar vervoer. Woensdag: de gemeente Utrecht maakte bekend dat er 2.000 middenhuurwoningen bij komen. Donderdag: bij een zorgverzekeraar vond een datalek plaats. Vrijdag: na weken onderhandelen presenteerden de coalitiepartijen een nieuw regeerakkoord.",
       [("O que anunciou o sindicato?", ["*Ações nos transportes públicos","Uma greve na saúde","Nada"]),("O que anunciou Utrecht?", ["*2.000 casas de renda média","Novas estradas","Um estádio"]),("O que aconteceu na sexta?", ["*Apresentaram um acordo de governo","O ministro demitiu-se","Houve eleições"])],
       "Resumo semanal fictício.", ["v-nieuws-van-de-week","v-vakbond","v-middenhuur","v-datalek","v-regeerakkoord"]),
    MA([("formatie","formação do governo"),("wethouder","vereador"),("stikstof","azoto"),("aftreden","demitir-se")], "Revisão.", ["v-formatie","v-wethouder","v-stikstof","v-aftreden"]),
    TR("pt-nl","Vamos discutir as notícias da semana.", ["Laten we het nieuws van de week bespreken"], "Expressão.", ["v-nieuws-van-de-week"]),
    FE(["De","vakbond","kondigden","acties","aan."], 2, "kondigde", "Singular: kondigde.", ["v-vakbond"]),
    MC("Uma notícia que só cita o ministério e não a outra parte falha em…", ["*hoor en wederhoor","btw|Não.","formatie|Não."], "Revisão.", ["v-hoor-en-wederhoor"]),
    SW("Escolha uma notícia real ou inventada desta semana (dos Países Baixos ou de Portugal). Resuma-a em 3 frases e dê a sua opinião em 2 frases, usando vocabulário da unidade.", ["Deze week maakte de gemeente bekend dat er meer middenhuurwoningen komen. Volgens de wethouder moeten vooral starters en leraren hiervan profiteren. De woningcorporaties zijn positief, maar zeggen dat het niet genoeg is. Ik vind het een goede stap, maar het probleem is groot. Zonder meer bouwgrond blijft de woningnood bestaan."], ["Resumo","Opinião","Vocabulário da unidade"], 60, "Atualidade.", ["v-nieuws-van-de-week"]),
  ], diff=5, mins=8)

W()
