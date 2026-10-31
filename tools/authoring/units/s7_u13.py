import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u13")
C = "B2"

L(1, "Revisão: Secções 1 e 2 (A1–A2)", "Básico em contexto: apresentar-se, rotina, compras, casa.",
  ["Rever as bases com frases mais ricas"],
  vocab=[V("v-opfrissen","opfrissen","refrescar (a memória)","verb"),
         V("v-vanzelfsprekend","vanzelfsprekend","evidente|óbvio","adjective"), V("v-automatisch","automatisch","automático","adjective")],
  ex=[("Laten we onze basiskennis even opfrissen.","Vamos refrescar os conhecimentos básicos."),("Dat gaat nu automatisch.","Isso agora sai automaticamente."),("Wat eerst moeilijk was, is nu vanzelfsprekend.","O que antes era difícil agora é óbvio."),("Ik woon sinds drie jaar in Utrecht en werk als verpleegkundige.","Moro em Utrecht há três anos e trabalho como enfermeira.")],
  review=["v-basiskennis","v-wonen","v-werken","v-boodschappen","v-gezin","v-familie"],
  cefr=C, exs=[
    MA([("basiskennis","conhecimentos básicos"),("opfrissen","refrescar"),("vanzelfsprekend","evidente"),("automatisch","automático")], "Revisão.", ["v-basiskennis","v-opfrissen","v-vanzelfsprekend","v-automatisch"]),
    TR("pt-nl","Moro em Utrecht há três anos e trabalho como enfermeira.", ["Ik woon al drie jaar in Utrecht en werk als verpleegkundige","Ik woon sinds drie jaar in Utrecht en werk als verpleegkundige","Ik woon al drie jaar in Utrecht en ik werk als verpleegkundige"], "al + presente; als.", ["v-wonen"]),
    TR("pt-nl","Quanto custam estas maçãs?", ["Hoeveel kosten deze appels","Wat kosten deze appels"], "deze + plural.", ["v-kosten"]),
    AR("appartement","o apartamento","het", "Het appartement.", ["v-appartement"]),
    AR("keuken","a cozinha","de", "De keuken.", ["v-keuken"]),
    CJ("hebben","jij","___ jij broers of zussen?", ["Heb"], "Inversão: heb jij.", ["v-hebben"]),
    FE(["Mijn","zus","woont","in","Porto","en","haar","man","komen","uit","Groningen."], 8, "komt", "Sujeito singular (haar man): komt.", ["v-komen-uit"]),
    LI("Op zaterdag doe ik boodschappen op de markt.", ["Op zaterdag doe ik boodschappen op de markt","Zaterdag doe ik boodschappen op de markt"], "Ao sábado faço compras no mercado.", "Rotina.", ["v-boodschappen"]),
    TR("nl-pt","Dat gaat nu automatisch.", ["Isso agora sai automaticamente","Agora isso é automático"], "automatisch.", ["v-automatisch"]),
    SW("Apresente-se como no início do curso, mas agora com frases ricas (4–5 frases: origem, casa, trabalho, família, rotina).", ["Ik heet Rui en ik kom uit Faro, een stad in het zuiden van Portugal. Sinds drie jaar woon ik met mijn vriendin in een klein appartement in Utrecht. Ik werk als ingenieur bij een bedrijf dat fietspaden ontwerpt. In het weekend doe ik boodschappen op de markt en bel ik mijn ouders."], ["Subordinada (die/dat)", "Inversão (Sinds…, In het weekend…)", "Vocabulário variado"], 50, "Apresentação B2.", ["v-opfrissen"]),
  ], diff=5, mins=7)

L(2, "Revisão: Secções 3 e 4 (A2–B1)", "Vida prática, trabalho, opiniões, modais e subordinadas.",
  ["Rever competências práticas e gramática intermédia"],
  vocab=[V("v-zelfredzaam","zelfredzaam","autónomo (na vida prática)","adjective"), V("v-regelen-zaken","zaken regelen","tratar de assuntos","expression"),
         V("v-toepassen","toepassen","aplicar","verb"), V("v-beheersing","beheersing","domínio","noun","de")],
  ex=[("Ik ben nu zelfredzaam in het Nederlands.","Agora sou autónomo em neerlandês."),("Ik kan alles zelf regelen bij de gemeente.","Consigo tratar de tudo sozinho na câmara."),("Pas de regels toe in je eigen zinnen.","Aplica as regras nas tuas próprias frases."),("Je beheersing van de modale werkwoorden is goed.","O teu domínio dos verbos modais é bom.")],
  review=["v-moeten","v-hoeven","v-omdat","v-solliciteren","v-huurcontract"],
  cefr=C, exs=[
    MA([("zelfredzaam","autónomo"),("zaken regelen","tratar de assuntos"),("toepassen","aplicar"),("beheersing","domínio")], "Revisão.", ["v-zelfredzaam","v-regelen-zaken","v-toepassen","v-beheersing"]),
    FB("Je ___ niet te komen als je ziek bent.", ["hoeft"], "niet hoeven te.", ["v-hoeven"], choices=["hoeft","moet","mag"], tr="Não precisas de vir se estiveres doente."),
    FB("Ik bel je, ___ ik een vraag heb.", ["omdat"], "Verbo no fim → omdat.", ["v-omdat"], choices=["omdat","want","dus"], tr="Ligo-te porque tenho uma pergunta."),
    TR("pt-nl","Consigo tratar de tudo sozinho na câmara.", ["Ik kan alles zelf regelen bij de gemeente"], "regelen.", ["v-regelen-zaken"]),
    TR("pt-nl","Venho candidatar-me à vaga de rececionista.", ["Graag solliciteer ik naar de functie van receptionist","Ik solliciteer naar de functie van receptionist","Graag solliciteer ik naar de vacature van receptionist"], "solliciteren naar.", ["v-solliciteren"]),
    MC("Qual é a ordem correta?", ["*Gisteren moest ik lang wachten bij de huisarts.","Gisteren ik moest lang wachten bij de huisarts.|Inversão."], "Inversão.", ["v-moeten"]),
    MC("Qual é a ordem correta?", ["*Ik weet niet of hij morgen komt.","Ik weet niet of hij komt morgen.|Subordinada: of hij morgen komt."], "Subordinada: of hij morgen komt.", ["v-of-conj"]),
    LI("Kunt u mij vertellen waar ik een parkeervergunning kan aanvragen?", ["Kunt u mij vertellen waar ik een parkeervergunning kan aanvragen"], "Pode dizer-me onde posso pedir um dístico de estacionamento?", "Pergunta indireta.", ["v-aanvragen"]),
    MC("Qual frase usa corretamente um reflexivo?", ["*Ik vergis me, het is dinsdag.","Ik vergis, het is dinsdag.|Falta «me».","Ik vergis mij zelf het.|Agramatical."], "Reflexivo.", ["v-zich-vergissen"]),
    SW("Escreva 3–4 frases sobre o que consegue resolver sozinho agora (câmara, médico, senhorio…), com um modal e uma subordinada.", ["Inmiddels ben ik behoorlijk zelfredzaam. Ik kan zelf een afspraak maken bij de huisarts en ik weet hoe ik een klacht moet indienen bij mijn verhuurder. Als er iets misgaat, hoef ik niet meer meteen een vriend te bellen."], ["Modal", "Subordinada com verbo no fim", "Vocabulário prático"], 45, "Autonomia.", ["v-zelfredzaam"]),
  ], diff=5, mins=7)

L(3, "Revisão: Secção 5 (B1)", "Conversa, cultura, partículas, tempos e escrita coerente.",
  ["Rever fluência prática e partículas"],
  vocab=[V("v-ongedwongen","ongedwongen","descontraído|à vontade","adjective"), V("v-moeiteloos","moeiteloos","sem esforço","adjective"),
         V("v-gesprekspartner","gesprekspartner","interlocutor","noun","de"), V("v-aanvoelen","aanvoelen","sentir|intuir","verb")],
  ex=[("Het gesprek verliep heel ongedwongen.","A conversa decorreu de forma muito descontraída."),("Ze wisselt moeiteloos van taal.","Ela muda de língua sem esforço."),("Luister goed naar je gesprekspartner.","Ouve bem o teu interlocutor."),("Je voelt steeds beter aan wanneer je «toch» gebruikt.","Sentes cada vez melhor quando usar «toch».")],
  review=["v-toch-part","v-even-part","v-meevallen","v-gezelligheid","v-echter"],
  cefr=C, exs=[
    MA([("ongedwongen","descontraído"),("moeiteloos","sem esforço"),("gesprekspartner","interlocutor"),("aanvoelen","intuir")], "Revisão.", ["v-ongedwongen","v-moeiteloos","v-gesprekspartner","v-aanvoelen"]),
    FB("Kun je ___ de deur dichtdoen?", ["even"], "Suavizar.", ["v-even-part"], choices=["even","toch","wel"], tr="Podes fechar a porta um bocadinho?"),
    FB("Je komt ___ ook naar het feest?", ["toch"], "Confirmação.", ["v-toch-part"], choices=["toch","even","maar"], tr="Tu vens à festa, não vens?"),
    FB("Het examen viel ___: het was makkelijker dan ik dacht.", ["mee"], "meevallen.", ["v-meevallen"], choices=["mee","tegen","uit"], tr="O exame correu melhor do que esperava."),
    TR("pt-nl","A conversa decorreu de forma muito descontraída.", ["Het gesprek verliep heel ongedwongen","Het gesprek ging heel ongedwongen"], "ongedwongen.", ["v-ongedwongen"]),
    TR("nl-pt","Ze wisselt moeiteloos van taal.", ["Ela muda de língua sem esforço","Ela troca de língua com facilidade"], "moeiteloos.", ["v-moeiteloos"]),
    FE(["Het","plan","is","goed.","Het","is","echter","dure."], 7, "duur", "Predicativo sem -e: Het is echter duur.", ["v-echter"]),
    LI("Wat gezellig dat jullie er allemaal zijn, hoor!", ["Wat gezellig dat jullie er allemaal zijn(,) hoor"], "Que bom que estejam todos aqui!", "Partículas e cultura.", ["v-gezelligheid"]),
    DL([("Collega","Ik heb het rapport nog niet af, sorry.","Ainda não acabei o relatório, desculpa."),("Ana","")], ["*Geen probleem hoor, morgen is ook prima.","Wat jammer, je bent altijd laat.|Rude.","Toch even maar wel.|Sem sentido."], "Tom natural.", ["v-hoor"]),
    SW("Escreva uma mensagem informal (3 frases) a um amigo, com pelo menos três partículas (even, toch, maar, wel, hoor).", ["Hé, kun je even bellen? Je komt toch zaterdag? Neem maar wat te drinken mee, dan zorg ik wel voor het eten, hoor!"], ["Três partículas bem usadas", "Tom informal", "Sentido coerente"], 25, "Partículas em uso.", ["v-aanvoelen"]),
  ], diff=5, mins=7)

L(4, "Revisão: Secção 6 (B1–B2)", "Argumentação, registos, relativas, passiva, discurso indireto.",
  ["Rever a gramática e as competências avançadas"],
  vocab=[V("v-overzicht","overzicht","visão geral|resumo","noun","het"), V("v-structuur","structuur","estrutura","noun","de"),
         V("v-verfijnen","verfijnen","refinar","verb"), V("v-precisie","precisie","precisão","noun","de")],
  ex=[("Hier is een overzicht van de grammatica.","Aqui está uma visão geral da gramática."),("Je tekst heeft een duidelijke structuur.","O teu texto tem uma estrutura clara."),("Nu gaan we je stijl verfijnen.","Agora vamos refinar o teu estilo."),("Precisie in woordkeus is belangrijk.","A precisão na escolha das palavras é importante.")],
  review=["v-die-rel","v-lijdende-vorm","v-indirecte-rede","v-besluit-nemen","v-betoog"],
  cefr=C, exs=[
    MA([("overzicht","visão geral"),("structuur","estrutura"),("verfijnen","refinar"),("precisie","precisão")], "Revisão.", ["v-overzicht","v-structuur","v-verfijnen","v-precisie"]),
    FB("De vrouw ___ ik gisteren sprak, is mijn nieuwe buurvrouw.", ["die","met wie"], "Relativa.", ["v-die-rel"], choices=["die","dat","wat"], tr="A mulher com quem falei ontem é a minha nova vizinha."),
    FB("De brug ___ volgend jaar gerenoveerd.", ["wordt"], "Passiva.", ["v-lijdende-vorm"], choices=["wordt","is","heeft"], tr="A ponte vai ser renovada no próximo ano."),
    FB("Hij zei dat hij moe ___.", ["was"], "Discurso indireto.", ["v-indirecte-rede"], choices=["was","is","ben"], tr="Ele disse que estava cansado."),
    FB("We moeten nu een besluit ___.", ["nemen"], "Colocação.", ["v-besluit-nemen"], choices=["nemen","maken","doen"], tr="Temos agora de tomar uma decisão."),
    FE(["Het","huis","waar","in","ik","woon,","is","oud."], 2, "waarin", "waar + preposição juntos (ou waar ik in woon).", ["v-waarin"]),
    FE(["Ze","vroeg","dat","ik","mee","wilde."], 2, "of", "Pergunta indireta sim/não → of.", ["v-vroeg-vragen"]),
    TR("pt-nl","Agora vamos refinar o teu estilo.", ["Nu gaan we je stijl verfijnen","Nu gaan we jouw stijl verfijnen"], "verfijnen.", ["v-verfijnen"]),
    LI("Uit dit overzicht blijkt dat je de passieve vorm goed beheerst.", ["Uit dit overzicht blijkt dat je de passieve vorm goed beheerst"], "Esta visão geral mostra que dominas bem a passiva.", "blijken.", ["v-overzicht"]),
    SW("Escreva um parágrafo (4 frases) sobre uma notícia recente usando uma relativa, uma passiva e discurso indireto.", ["Vorige week werd in onze stad een nieuw zwembad geopend. Het zwembad, dat twintig miljoen euro kostte, heeft ook een sauna. De wethouder zei dat het zwembad voor iedereen betaalbaar moest zijn. Daarom is er korting voor kinderen en ouderen."], ["Passiva", "Relativa", "Discurso indireto", "Coerência"], 50, "Gramática B2 integrada.", ["v-precisie"]),
  ], diff=5, mins=8)

L(5, "Revisão final: o percurso completo", "De A1 a B2 — balanço e próximos passos.",
  ["Fazer o balanço do percurso e planear a continuação da aprendizagem"],
  vocab=[V("v-mijlpaal-bereikt","een mijlpaal bereiken","alcançar um marco","expression"), V("v-blijven-oefenen","blijven oefenen","continuar a praticar","expression"),
         V("v-staatsexamen","staatsexamen NT2","exame estatal de neerlandês","noun","het")],
  ex=[("Je hebt een belangrijke mijlpaal bereikt.","Alcançaste um marco importante."),("Blijf elke dag een beetje oefenen.","Continua a praticar um pouco todos os dias."),("Het staatsexamen NT2 programma II is op B2-niveau.","O exame estatal NT2 programa II é de nível B2."),("Wat is je huidige taalniveau?","Qual é o teu nível atual de língua?")],
  review=["v-taalniveau","v-vooruitgang-boeken","v-trots-zijn-op","v-oefening-baart-kunst","v-volhouden"],
  cefr=C, exs=[
    MA([("een mijlpaal bereiken","alcançar um marco"),("blijven oefenen","continuar a praticar"),("staatsexamen NT2","exame estatal"),("taalniveau","nível de língua")], "Balanço.", ["v-mijlpaal-bereikt","v-blijven-oefenen","v-staatsexamen","v-taalniveau"]),
    MC("O Staatsexamen NT2 programa II corresponde a…", ["*B2 (para estudar ou trabalhar a nível superior)","A1|Não.","C2|Não."], "Exame oficial.", ["v-staatsexamen"]),
    MC("Este curso é…", ["*preparação e prática, mas não um certificado oficial","um diploma oficial|Não é.","obrigatório para a naturalização|Não."], "Honestidade.", ["v-staatsexamen"]),
    TR("pt-nl","Alcançaste um marco importante.", ["Je hebt een belangrijke mijlpaal bereikt","Jij hebt een belangrijke mijlpaal bereikt"], "mijlpaal bereiken.", ["v-mijlpaal-bereikt"]),
    TR("pt-nl","Continua a praticar um pouco todos os dias.", ["Blijf elke dag een beetje oefenen","Blijf iedere dag een beetje oefenen"], "blijven + inf.", ["v-blijven-oefenen"]),
    AR("taalniveau","o nível de língua","het", "Het niveau.", ["v-taalniveau"]),
    FE(["Ik","blijf","elke","dag","oefent."], 4, "oefenen", "blijven + infinitivo: Ik blijf elke dag oefenen.", ["v-blijven-oefenen"]),
    LI("Oefening baart kunst, dus blijf volhouden!", ["Oefening baart kunst(,) dus blijf volhouden"], "A prática faz o mestre, por isso não desistas!", "Provérbio.", ["v-oefening-baart-kunst"]),
    CO("text","Hoe nu verder?", "Gefeliciteerd: je hebt alle zeven secties doorlopen! Hoe blijf je je Nederlands verbeteren? Lees elke dag iets: een nieuwsbericht, een column of een roman. Kijk Nederlandse series met Nederlandse ondertiteling. Zoek een taalmaatje of word vrijwilliger. Wil je een officieel diploma? Dan kun je je voorbereiden op het Staatsexamen NT2. En vooral: durf fouten te maken. Iedereen die een taal leert, maakt fouten.",
       [("Que tipo de legendas recomenda?", ["*Em neerlandês","Em português","Nenhumas"]),("Como obter um diploma oficial?", ["*Preparar-se para o Staatsexamen NT2","Terminar esta aplicação","Pedir à câmara"]),("Qual é o conselho final?", ["*Atrever-se a errar","Nunca errar","Parar de estudar"])],
       "taalmaatje = parceiro de conversa.", ["v-staatsexamen","v-blijven-oefenen"]),
    SW("Escreva o seu plano para os próximos 6 meses (4–5 frases): o que vai fazer para continuar a melhorar e qual é o seu objetivo.", ["De komende zes maanden wil ik mijn Nederlands verder verbeteren. Ik ga elke dag een nieuwsbericht lezen en twee keer per week met een taalmaatje praten. Daarnaast kijk ik series met Nederlandse ondertiteling. Mijn doel is om in juni het Staatsexamen NT2 programma II te halen. Ik weet dat ik fouten zal maken, maar oefening baart kunst!"], ["Objetivo concreto", "Pelo menos três ações", "Futuro bem expresso", "Fecho motivador"], 60, "Plano pessoal.", ["v-blijven-oefenen","v-taalniveau"]),
  ], diff=5, mins=8)

W()
