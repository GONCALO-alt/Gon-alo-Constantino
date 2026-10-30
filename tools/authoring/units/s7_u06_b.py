import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u06")
C = "B2"
# Lições de aprofundamento (10–29): estilos — jornalístico, académico, regional, jurídico.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "O que é notícia?", "Nieuwswaarde en de omgekeerde piramide.",
  ["Perceber a estrutura de uma notícia"],
  vocab=[N("v-nieuwswaarde","nieuwswaarde","valor noticioso","de"), X("v-omgekeerde-piramide","de omgekeerde piramide","a pirâmide invertida")],
  ex=[("Een kat in een boom heeft weinig nieuwswaarde.","Um gato numa árvore tem pouco valor noticioso."),("Volgens de omgekeerde piramide staat het belangrijkste bovenaan.","Segundo a pirâmide invertida, o mais importante vem no topo.")],
  review=["v-lead","v-bericht-nieuws"],
  cefr=C, exs=[
    MA([("nieuwswaarde","valor noticioso"),("de omgekeerde piramide","a pirâmide invertida"),("lead","lead|primeiro parágrafo"),("nieuwsbericht","notícia")], "Notícia.", ["v-nieuwswaarde","v-omgekeerde-piramide","v-lead","v-bericht-nieuws"]),
    MC("Na pirâmide invertida, o último parágrafo contém…", ["*os pormenores menos importantes","a informação principal|Isso é o início.","a opinião do jornalista|Não."], "Estrutura.", ["v-omgekeerde-piramide"]),
    TR("pt-nl","O mais importante vem no topo.", ["Het belangrijkste staat bovenaan","Het belangrijkste komt bovenaan"], "bovenaan.", ["v-omgekeerde-piramide"]),
    TR("pt-nl","Isso tem pouco valor noticioso.", ["Dat heeft weinig nieuwswaarde"], "nieuwswaarde.", ["v-nieuwswaarde"]),
    FB("Hoe groter de ___, hoe hoger het bericht op de voorpagina.", ["nieuwswaarde"], "Valor noticioso.", ["v-nieuwswaarde"], choices=["nieuwswaarde","piramide","lead"], tr="Quanto maior o valor noticioso, mais acima na primeira página."),
    FE(["Het","nieuwswaarde","is","groot."], 0, "De", "de waarde.", ["v-nieuwswaarde"]),
    LI("Waarom zou een redacteur de laatste alinea het eerst schrappen?", ["Waarom zou een redacteur de laatste alinea het eerst schrappen","Waarom zou een redacteur de laatste alinea het eerst schrappen?"], "Porque é que um editor cortaria primeiro o último parágrafo?", "Lógica da pirâmide.", ["v-omgekeerde-piramide"]),
    MC("Resposta à pergunta anterior:", ["*Porque contém o menos importante","Porque é o mais longo|Não necessariamente.","Por acaso|Não."], "Lógica.", ["v-omgekeerde-piramide"]),
  ], diff=4, mins=5)

L(11, "Os cinco W", "Wie, wat, waar, wanneer, waarom (en hoe).",
  ["Verificar se uma notícia responde às perguntas essenciais"],
  vocab=[X("v-vijf-ws","de vijf w's","os cinco W (quem, o quê, onde, quando, porquê)")],
  ex=[("Een goede lead beantwoordt de vijf w's.","Um bom primeiro parágrafo responde aos cinco W."),("Wie, wat, waar, wanneer, waarom, en vaak ook: hoe?","Quem, o quê, onde, quando, porquê, e muitas vezes também: como?")],
  review=["v-lead","v-verslaggever"],
  cefr=C, exs=[
    MA([("de vijf w's","os cinco W"),("lead","primeiro parágrafo"),("verslaggever","repórter"),("nieuwswaarde","valor noticioso")], "Jornalismo.", ["v-vijf-ws","v-lead","v-verslaggever","v-nieuwswaarde"]),
    CO("text","Lead (fictief)","Een 34-jarige fietser uit Amersfoort is zaterdagmiddag lichtgewond geraakt bij een aanrijding met een bestelbus op de Stadsring. De bestuurder van de bus zag de fietser over het hoofd bij het afslaan, meldt de politie.",
       [("Quem?", ["*Um ciclista de 34 anos","Um polícia","Um condutor de autocarro"]),("Quando?", ["*Sábado à tarde","Domingo","Segunda de manhã"]),("Porquê?", ["*O condutor não viu o ciclista ao virar","Estava a chover","O ciclista ia depressa"])],
       "Os cinco W.", ["v-vijf-ws"]),
    TR("pt-nl","Um bom primeiro parágrafo responde aos cinco W.", ["Een goede lead beantwoordt de vijf w's","Een goede lead beantwoordt de vijf W's"], "beantwoorden.", ["v-vijf-ws"]),
    MC("Qual W falta em «Gisteren is in Utrecht een winkel overvallen.»?", ["*wie (quem) e waarom","waar|Está: Utrecht.","wanneer|Está: gisteren."], "Verificar.", ["v-vijf-ws"]),
    FB("De ___ was als eerste ter plaatse.", ["verslaggever"], "Repórter.", ["v-verslaggever"], choices=["verslaggever","lead","lezer"], tr="O repórter foi o primeiro a chegar ao local."),
    FE(["De","lead","beantwoorden","de","vijf","w's."], 2, "beantwoordt", "Singular: beantwoordt.", ["v-vijf-ws"]),
    SW("Escreva uma lead (1–2 frases) para uma notícia inventada sobre o seu bairro, com os cinco W.", ["Op zaterdag 12 april opent burgemeester Dijkhoff om 14.00 uur een nieuwe speeltuin in het Oosterpark, omdat bewoners er drie jaar lang voor hebben gelobbyd."], ["Quem","O quê","Onde","Quando","Porquê"], 25, "Escrever.", ["v-vijf-ws"]),
    LI("Volgens de politie zag de bestuurder de fietser over het hoofd.", ["Volgens de politie zag de bestuurder de fietser over het hoofd"], "Segundo a polícia, o condutor não viu o ciclista.", "Estilo de notícia.", ["v-vijf-ws"]),
  ], diff=4, mins=5)

L(12, "Reportagem: descrever o ambiente", "Een sfeerbeschrijving.",
  ["Reconhecer linguagem descritiva numa reportagem"],
  vocab=[N("v-sfeerbeschrijving","sfeerbeschrijving","descrição do ambiente","de"), X("v-boeiend","boeiend","cativante","adjective")],
  ex=[("De reportage begint met een sfeerbeschrijving van de markt.","A reportagem começa com uma descrição do ambiente do mercado."),("Het was een boeiend verhaal.","Foi uma história cativante.")],
  review=["v-beeldend","v-reportage"],
  cefr=C, exs=[
    MA([("sfeerbeschrijving","descrição do ambiente"),("boeiend","cativante"),("beeldend","vívido|descritivo"),("reportage","reportagem")], "Reportagem.", ["v-sfeerbeschrijving","v-boeiend","v-beeldend","v-reportage"]),
    MC("Qual frase é uma sfeerbeschrijving?", ["*De geur van verse stroopwafels hangt tussen de kramen, kooplui roepen hun prijzen.","De markt is op zaterdag.|Informativa.","Er zijn 80 kramen.|Factual."], "Identificar.", ["v-sfeerbeschrijving"]),
    TR("pt-nl","Foi uma história cativante.", ["Het was een boeiend verhaal"], "het verhaal → sem -e.", ["v-boeiend"]),
    TR("pt-nl","A reportagem começa com uma descrição do ambiente.", ["De reportage begint met een sfeerbeschrijving"], "sfeerbeschrijving.", ["v-sfeerbeschrijving"]),
    FB("De journalist schrijft erg ___: je ziet het voor je.", ["beeldend"], "Vívido.", ["v-beeldend"], choices=["beeldend","boeiend","objectief"], tr="O jornalista escreve de forma muito vívida: vês tudo."),
    FE(["Het","was","een","boeiende","verhaal."], 3, "boeiend", "het verhaal + een → sem -e.", ["v-boeiend"]),
    SW("Escreva uma sfeerbeschrijving de 3 frases de um lugar que conhece bem (um café, uma estação, uma praia).", ["Het is zeven uur 's ochtends op Rotterdam Centraal. Koffiebekers dampen in de handen van slaperige forensen. Boven het gerommel van de treinen klinkt steeds weer dezelfde vriendelijke stem: «Let op, de trein naar Den Haag heeft vijf minuten vertraging.»"], ["Sentidos","Detalhes concretos"], 35, "Descrever.", ["v-sfeerbeschrijving"]),
    LI("Tussen de kramen hangt de geur van verse vis.", ["Tussen de kramen hangt de geur van verse vis"], "Entre as bancas paira o cheiro de peixe fresco.", "Descrição.", ["v-sfeerbeschrijving"]),
  ], diff=4, mins=5)

L(13, "Títulos de jornal", "Telegramstijl.",
  ["Perceber o estilo condensado dos títulos"],
  vocab=[N("v-telegramstijl","telegramstijl","estilo telegráfico","de")],
  ex=[("«Man (45) aangehouden na overval op supermarkt»","«Homem (45) detido após assalto a supermercado»"),("Krantenkoppen zijn vaak in telegramstijl: zonder lidwoorden en hulpwerkwoorden.","Os títulos estão muitas vezes em estilo telegráfico: sem artigos nem verbos auxiliares.")],
  review=["v-krantenkop"],
  cefr=C, exs=[
    MA([("telegramstijl","estilo telegráfico"),("krantenkop","título de jornal"),("pakkende titel","título cativante"),("lead","primeiro parágrafo")], "Títulos.", ["v-telegramstijl","v-krantenkop","v-lead"]),
    MC("«Kabinet akkoord over nieuwe huurwet» por extenso:", ["*Het kabinet is akkoord gegaan met een nieuwe huurwet.","Het kabinet gaat een huurwet akkoord.|Não.","De huurwet is het kabinet.|Não."], "Descomprimir.", ["v-telegramstijl"]),
    MC("«Fietser gewond bij aanrijding» — o que falta?", ["*artigo e verbo auxiliar («Een fietser is gewond geraakt…»)","nada|Falta.","o sujeito|Está."], "Estilo.", ["v-telegramstijl"]),
    TR("pt-nl","Homem detido após assalto.", ["Man aangehouden na overval"], "Telegráfico.", ["v-telegramstijl"]),
    TR("pt-nl","Os títulos são em estilo telegráfico.", ["Krantenkoppen zijn in telegramstijl","Koppen zijn vaak in telegramstijl"], "telegramstijl.", ["v-telegramstijl"]),
    FB("Een ___ moet kort en pakkend zijn.", ["krantenkop"], "Título.", ["v-krantenkop"], choices=["krantenkop","telegramstijl","lead"], tr="Um título de jornal tem de ser curto e cativante."),
    SW("Transforme em título telegráfico: «De gemeente Utrecht heeft besloten dat er vanaf volgend jaar geen auto's meer in het centrum mogen rijden.»", ["Utrecht: binnenstad vanaf volgend jaar autovrij"], ["Curto","Sem artigos/auxiliares"], 5, "Título.", ["v-telegramstijl"]),
    LI("Brand in loods Westpoort, niemand gewond.", ["Brand in loods Westpoort, niemand gewond","Brand in loods Westpoort niemand gewond"], "Incêndio em armazém no Westpoort, sem feridos.", "Título.", ["v-telegramstijl"]),
  ], diff=4, mins=5)

L(14, "Estilo académico (1)", "De onderzoeksvraag.",
  ["Perceber a estrutura de um trabalho académico"],
  vocab=[N("v-onderzoeksvraag","onderzoeksvraag","pergunta de investigação","de"), N("v-literatuuronderzoek","literatuuronderzoek","revisão da literatura","het")],
  ex=[("De onderzoeksvraag luidt: …","A pergunta de investigação é: …"),("In het literatuuronderzoek bespreek ik eerdere studies.","Na revisão da literatura discuto estudos anteriores.")],
  review=["v-hypothese","v-hoofdvraag"],
  cefr=C, exs=[
    MA([("onderzoeksvraag","pergunta de investigação"),("literatuuronderzoek","revisão da literatura"),("hypothese","hipótese"),("scriptie","tese|dissertação")], "Académico.", ["v-onderzoeksvraag","v-literatuuronderzoek","v-hypothese"]),
    AR("literatuuronderzoek", "revisão da literatura", "het", "het onderzoek.", ["v-literatuuronderzoek"]),
    MC("Fórmula académica para apresentar a pergunta:", ["*De onderzoeksvraag luidt: …","Mijn vraag is gewoon: …|Informal.","Hé, ik vroeg me af…|Muito informal."], "Registo.", ["v-onderzoeksvraag"]),
    TR("pt-nl","A pergunta de investigação é…", ["De onderzoeksvraag luidt","De onderzoeksvraag is"], "luiden.", ["v-onderzoeksvraag"]),
    TR("pt-nl","Discuto estudos anteriores.", ["Ik bespreek eerdere studies","Ik bespreek eerder onderzoek"], "bespreken.", ["v-literatuuronderzoek"]),
    FB("Mijn ___ is dat thuiswerken de productiviteit verhoogt.", ["hypothese"], "Hipótese.", ["v-hypothese"], choices=["hypothese","onderzoeksvraag","scriptie"], tr="A minha hipótese é que o teletrabalho aumenta a produtividade."),
    FE(["De","literatuuronderzoek","is","uitgebreid."], 0, "Het", "het onderzoek.", ["v-literatuuronderzoek"]),
    LI("In dit hoofdstuk wordt de methode beschreven.", ["In dit hoofdstuk wordt de methode beschreven"], "Neste capítulo é descrito o método.", "Passiva académica.", ["v-onderzoeksvraag"]),
  ], diff=5, mins=5)

L(15, "Estilo académico (2)", "Voetnoten en een bronnenlijst.",
  ["Citar e referenciar academicamente"],
  vocab=[N("v-voetnoot","voetnoot","nota de rodapé","de","voetnoten"), N("v-bronnenlijst","bronnenlijst","lista de referências","de")],
  ex=[("De bron staat in een voetnoot.","A fonte está numa nota de rodapé."),("Achteraan staat de bronnenlijst.","No fim está a lista de referências.")],
  review=["v-citeren"],
  cefr=C, exs=[
    MA([("voetnoot","nota de rodapé"),("bronnenlijst","lista de referências"),("bronvermelding","referência"),("citeren","citar")], "Referências.", ["v-voetnoot","v-bronnenlijst","v-citeren"]),
    TR("pt-nl","A fonte está numa nota de rodapé.", ["De bron staat in een voetnoot"], "voetnoot.", ["v-voetnoot"]),
    TR("pt-nl","No fim está a lista de referências.", ["Achteraan staat de bronnenlijst","Aan het eind staat de bronnenlijst"], "Inversão.", ["v-bronnenlijst"]),
    MC("Copiar texto sem referir a fonte é…", ["*plágio","citação|Não.","paráfrase|Não."], "Ética.", []),
    FB("Zet alle gebruikte artikelen in de ___.", ["bronnenlijst"], "Lista.", ["v-bronnenlijst"], choices=["bronnenlijst","voetnoot","inleiding"], tr="Põe todos os artigos usados na lista de referências."),
    FE(["Het","voetnoot","staat","onderaan","de","pagina."], 0, "De", "de voetnoot.", ["v-voetnoot"]),
    LI("Vergeet het paginanummer niet bij een letterlijk citaat.", ["Vergeet het paginanummer niet bij een letterlijk citaat"], "Não te esqueças do número da página numa citação literal.", "Dica.", ["v-citeren"]),
    WO("No fim está a lista.", ["Achteraan","staat","de","bronnenlijst"], "Inversão.", ["v-bronnenlijst"]),
  ], diff=4, mins=5)

L(16, "Estilo académico (3)", "Hieruit volgt dat…",
  ["Usar fórmulas académicas para conclusões"],
  vocab=[X("v-hieruit-volgt","hieruit volgt dat…","daqui resulta que…"), X("v-uit-de-resultaten-blijkt","uit de resultaten blijkt dat…","os resultados mostram que…")],
  ex=[("Uit de resultaten blijkt dat de interventie werkt.","Os resultados mostram que a intervenção funciona."),("Hieruit volgt dat meer onderzoek nodig is.","Daqui resulta que é preciso mais investigação.")],
  review=["v-concluderen","v-uit-onderzoek-blijkt","v-voorbarig"],
  cefr=C, exs=[
    MA([("hieruit volgt dat…","daqui resulta que…"),("uit de resultaten blijkt dat…","os resultados mostram…"),("concluderen","concluir"),("voorbarig","precipitado")], "Conclusões.", ["v-hieruit-volgt","v-uit-de-resultaten-blijkt","v-concluderen","v-voorbarig"]),
    MC("Formulação académica PRUDENTE:", ["*De resultaten wijzen erop dat…","Het is 100% bewezen dat…|Exagerado.","Iedereen weet dat…|Não académico."], "Prudência.", ["v-uit-de-resultaten-blijkt"]),
    TR("pt-nl","Os resultados mostram que funciona.", ["Uit de resultaten blijkt dat het werkt"], "blijken.", ["v-uit-de-resultaten-blijkt"]),
    TR("pt-nl","Daqui resulta que é preciso mais investigação.", ["Hieruit volgt dat meer onderzoek nodig is","Hieruit volgt dat er meer onderzoek nodig is"], "Expressão.", ["v-hieruit-volgt"]),
    FB("Op basis van één studie is het te ___ om dat te concluderen.", ["voorbarig"], "Precipitado.", ["v-voorbarig"], choices=["voorbarig","beeldend","zeker"], tr="Com base num só estudo é precipitado concluir isso."),
    FE(["Uit","de","resultaten","blijken","dat","het","werkt."], 3, "blijkt", "Impessoal: blijkt.", ["v-uit-de-resultaten-blijkt"]),
    LI("Er kan worden geconcludeerd dat de hypothese gedeeltelijk klopt.", ["Er kan worden geconcludeerd dat de hypothese gedeeltelijk klopt","Er kan geconcludeerd worden dat de hypothese gedeeltelijk klopt"], "Pode concluir-se que a hipótese está parcialmente correta.", "Passiva académica.", ["v-concluderen"]),
    WO("Daqui resulta que…", ["Hieruit","volgt","dat"], "Ordem.", ["v-hieruit-volgt"]),
  ], diff=5, mins=5)

L(17, "Línguas regionais", "Streektaal en Fries.",
  ["Falar das variedades linguísticas dos Países Baixos"],
  vocab=[N("v-streektaal","streektaal","língua regional","de","streektalen"), N("v-fries","Fries","frísio (língua)","het"),
         X("v-plat-praten","plat praten","falar com sotaque/dialeto forte","verb")],
  ex=[("In Friesland spreken veel mensen Fries.","Na Frísia muita gente fala frísio."),("Het Fries is een officiële taal in Nederland.","O frísio é uma língua oficial nos Países Baixos."),("Mijn opa praat plat Limburgs.","O meu avô fala com sotaque forte do Limburgo.")],
  review=["v-dialect","v-zachte-g"],
  cefr=C, exs=[
    MA([("streektaal","língua regional"),("Fries","frísio"),("plat praten","falar com sotaque forte"),("dialect","dialeto")], "Variedades.", ["v-streektaal","v-fries","v-plat-praten","v-dialect"]),
    MC("O frísio é…", ["*uma língua própria, oficial na província da Frísia","um dialeto de Amesterdão|Não.","inglês antigo|Não."], "Cultura.", ["v-fries"]),
    MC("A «zachte g» é típica…", ["*do sul (Brabante, Limburgo) e da Flandres","do norte|Não.","só de Amesterdão|Não."], "Pronúncia.", ["v-zachte-g"]),
    AR("Fries", "frísio (língua)", "het", "Línguas são het.", ["v-fries"]),
    TR("pt-nl","Na Frísia muita gente fala frísio.", ["In Friesland spreken veel mensen Fries"], "Fries.", ["v-fries"]),
    TR("pt-nl","O meu avô fala com sotaque forte.", ["Mijn opa praat plat","Mijn opa praat erg plat"], "plat praten.", ["v-plat-praten"]),
    FB("Het Limburgs is een erkende ___.", ["streektaal"], "Língua regional.", ["v-streektaal"], choices=["streektaal","dialect","accent"], tr="O limburguês é uma língua regional reconhecida."),
    LI("Aan zijn zachte g hoor je dat hij uit Brabant komt.", ["Aan zijn zachte g hoor je dat hij uit Brabant komt"], "Pelo «g» suave percebes que ele é do Brabante.", "Reconhecer.", ["v-zachte-g"]),
  ], diff=4, mins=5)

L(18, "O neerlandês da Flandres", "Goesting hebben.",
  ["Reconhecer diferenças entre o neerlandês dos Países Baixos e o da Flandres"],
  vocab=[N("v-vlaanderen","Vlaanderen","Flandres","het"), X("v-goesting","goesting hebben (Vlaams)","ter vontade (flamengo)")],
  ex=[("In Vlaanderen spreekt men ook Nederlands.","Na Flandres também se fala neerlandês."),("«Ik heb goesting in een frietje» betekent: ik heb zin in friet.","«Apetece-me umas batatas fritas» (flamengo)."),("Een Vlaming zegt «gij» waar een Nederlander «jij» zegt.","Um flamengo diz «gij» onde um neerlandês diz «jij».")],
  review=[],
  cefr=C, exs=[
    MA([("Vlaanderen","Flandres"),("goesting hebben","ter vontade (Vlaams)"),("Vlaams","flamengo"),("accent","sotaque")], "Flandres.", ["v-vlaanderen","v-goesting"]),
    MC("«Goesting» corresponde no neerlandês dos Países Baixos a…", ["*zin","geld|Não.","tijd|Não."], "Equivalência.", ["v-goesting"]),
    MC("A língua padrão da Flandres é…", ["*o neerlandês (com variantes flamengas)","o francês|Isso é a Valónia.","o alemão|Não."], "Cultura.", []),
    TR("pt-nl","Na Flandres também se fala neerlandês.", ["In Vlaanderen spreekt men ook Nederlands","In Vlaanderen spreken ze ook Nederlands"], "men.", ["v-vlaanderen"]),
    TR("pt-nl","Apetece-me batatas fritas.", ["Ik heb zin in friet","Ik heb goesting in friet","Ik heb zin in patat"], "zin / goesting.", ["v-goesting"]),
    FB("Als ik naar Gent ga, hoor ik een duidelijk Vlaams ___.", ["accent"], "Sotaque.", [], choices=["accent","dialect","Fries"], tr="Quando vou a Gent, ouço um sotaque flamengo claro."),
    FE(["In","Vlaanderen","spreken","men","ook","Nederlands."], 2, "spreekt", "men = singular: spreekt.", ["v-vlaanderen"]),
    LI("Een Nederlander en een Vlaming verstaan elkaar prima.", ["Een Nederlander en een Vlaming verstaan elkaar prima"], "Um neerlandês e um flamengo entendem-se muito bem.", "Facto.", []),
  ], diff=4, mins=5)

L(19, "Linguagem dos jovens", "Straattaal.",
  ["Reconhecer o calão juvenil sem o usar fora de contexto"],
  vocab=[N("v-straattaal","straattaal","calão urbano","de")],
  ex=[("Jongeren in de grote steden gebruiken veel straattaal.","Os jovens nas grandes cidades usam muito calão urbano."),("Straattaal bevat woorden uit het Sranan, Arabisch en Engels.","O calão urbano contém palavras do sranan, árabe e inglês.")],
  review=["v-chill","v-vet","v-ff-zo"],
  cefr=C, exs=[
    MA([("straattaal","calão urbano"),("chill","descontraído"),("vet","fixe"),("joh / man","pá")], "Juventude.", ["v-straattaal","v-chill","v-vet","v-ff-zo"]),
    MC("Usar calão juvenil numa entrevista de emprego…", ["*é inadequado","é recomendado|Não.","é obrigatório|Não."], "Registo.", ["v-straattaal"]),
    MC("Origem de muitas palavras de straattaal:", ["*sranan (Suriname), árabe, inglês","só latim|Não.","português antigo|Não."], "Cultura.", ["v-straattaal"]),
    TR("pt-nl","Os jovens usam muito calão.", ["Jongeren gebruiken veel straattaal"], "straattaal.", ["v-straattaal"]),
    TR("nl-pt","Dat feest was echt vet!", ["Aquela festa foi mesmo fixe!","Essa festa foi mesmo fixe"], "vet.", ["v-vet"]),
    FB("In een sollicitatiebrief gebruik je geen ___.", ["straattaal"], "Calão.", ["v-straattaal"], choices=["straattaal","aanhef","formeel"], tr="Numa carta de candidatura não usas calão."),
    FE(["Het","straattaal","verandert","snel."], 0, "De", "de taal.", ["v-straattaal"]),
    LI("Taal verandert voortdurend, ook door jongeren.", ["Taal verandert voortdurend, ook door jongeren","Taal verandert voortdurend ook door jongeren"], "A língua muda constantemente, também por causa dos jovens.", "Reflexão.", ["v-straattaal"]),
  ], diff=3, mins=4)

L(20, "Linguagem jurídica (1)", "De wet en de rechtbank.",
  ["Perceber vocabulário jurídico básico"],
  vocab=[N("v-rechtbank","rechtbank","tribunal","de","rechtbanken"), N("v-wetsartikel","wetsartikel","artigo de lei","het","wetsartikelen")],
  ex=[("De zaak komt volgende maand voor de rechtbank.","O caso vai a tribunal no próximo mês."),("Volgens wetsartikel 7 mag de huur niet zomaar omhoog.","Segundo o artigo de lei 7, a renda não pode subir sem mais nem menos (exemplo fictício).")],
  review=["v-advocaat","v-boete","v-bepaling"],
  cefr=C, exs=[
    MA([("rechtbank","tribunal"),("wetsartikel","artigo de lei"),("advocaat","advogado"),("bepaling","disposição")], "Jurídico.", ["v-rechtbank","v-wetsartikel","v-advocaat","v-bepaling"]),
    AR("wetsartikel", "artigo de lei", "het", "het artikel.", ["v-wetsartikel"]),
    TR("pt-nl","O caso vai a tribunal.", ["De zaak komt voor de rechtbank"], "voor de rechtbank komen.", ["v-rechtbank"]),
    TR("pt-nl","Contratei um advogado.", ["Ik heb een advocaat in de arm genomen","Ik heb een advocaat genomen","Ik heb een advocaat ingeschakeld"], "Expressão: in de arm nemen.", ["v-advocaat"]),
    MC("«Advocaat» também é…", ["*um licor de ovo neerlandês","um abacate|Isso é avocado.","um fruto|Não."], "Curiosidade.", ["v-advocaat"]),
    FB("Volgens deze ___ is de verhuurder verantwoordelijk voor groot onderhoud.", ["bepaling"], "Disposição.", ["v-bepaling"], choices=["bepaling","rechtbank","advocaat"], tr="Segundo esta disposição, o senhorio é responsável pela manutenção de fundo."),
    FE(["Het","rechtbank","doet","volgende","week","uitspraak."], 0, "De", "de rechtbank.", ["v-rechtbank"]),
    LI("De rechtbank doet over twee weken uitspraak.", ["De rechtbank doet over twee weken uitspraak"], "O tribunal decide daqui a duas semanas.", "uitspraak doen.", ["v-uitspraak"]),
  ], diff=5, mins=5)

L(21, "Linguagem jurídica (2)", "Dagvaarding, vonnis, hoger beroep.",
  ["Perceber as fases de um processo"],
  vocab=[N("v-dagvaarding","dagvaarding","citação judicial","de"), N("v-vonnis","vonnis","sentença","het","vonnissen"),
         X("v-in-hoger-beroep","in hoger beroep gaan","recorrer (para tribunal superior)","verb")],
  ex=[("Hij ontving een dagvaarding.","Ele recebeu uma citação judicial."),("Het vonnis viel in zijn voordeel uit.","A sentença foi-lhe favorável."),("De verdachte gaat in hoger beroep.","O arguido vai recorrer.")],
  review=["v-rechtbank","v-uitspraak"],
  cefr=C, exs=[
    MA([("dagvaarding","citação judicial"),("vonnis","sentença"),("in hoger beroep gaan","recorrer"),("uitspraak","decisão")], "Processo.", ["v-dagvaarding","v-vonnis","v-in-hoger-beroep","v-uitspraak"]),
    AR("vonnis", "sentença", "het", "Het vonnis.", ["v-vonnis"]),
    MC("Ordem habitual:", ["*dagvaarding → zitting → vonnis → (hoger beroep)","vonnis → dagvaarding|Não.","hoger beroep → dagvaarding|Não."], "Sequência.", ["v-dagvaarding"]),
    TR("pt-nl","O arguido vai recorrer.", ["De verdachte gaat in hoger beroep"], "Expressão.", ["v-in-hoger-beroep"]),
    TR("pt-nl","A sentença foi favorável.", ["Het vonnis viel gunstig uit","Het vonnis was gunstig"], "uitvallen.", ["v-vonnis"]),
    FB("Hij ontving een ___ om voor de rechter te verschijnen.", ["dagvaarding"], "Citação.", ["v-dagvaarding"], choices=["dagvaarding","vonnis","boete"], tr="Recebeu uma citação para comparecer perante o juiz."),
    FE(["De","vonnis","is","definitief."], 0, "Het", "het vonnis.", ["v-vonnis"]),
    LI("Tegen dit vonnis kunt u binnen drie maanden in hoger beroep gaan.", ["Tegen dit vonnis kunt u binnen drie maanden in hoger beroep gaan"], "Desta sentença pode recorrer no prazo de três meses.", "Formal (exemplo).", ["v-in-hoger-beroep"]),
  ], diff=5, mins=5)

L(22, "Contratos e condições gerais", "Algemene voorwaarden.",
  ["Ler cláusulas típicas de contratos"],
  vocab=[N("v-algemene-voorwaarden","algemene voorwaarden","condições gerais","de"), X("v-nietig","nietig","nulo (juridicamente)","adjective")],
  ex=[("Op deze overeenkomst zijn onze algemene voorwaarden van toepassing.","A este contrato aplicam-se as nossas condições gerais."),("Een onredelijke bepaling kan nietig zijn.","Uma cláusula abusiva pode ser nula.")],
  review=["v-partijen","v-ondergetekende","v-van-kracht","v-kleine-lettertjes"],
  cefr=C, exs=[
    MA([("algemene voorwaarden","condições gerais"),("nietig","nulo"),("van kracht","em vigor"),("ondergetekende","o abaixo-assinado")], "Contratos.", ["v-algemene-voorwaarden","v-nietig","v-van-kracht","v-ondergetekende"]),
    MC("«Van toepassing zijn» significa…", ["*aplicar-se","ser opcional|Não.","estar proibido|Não."], "Expressão.", ["v-algemene-voorwaarden"]),
    TR("pt-nl","Aplicam-se as condições gerais.", ["De algemene voorwaarden zijn van toepassing"], "van toepassing.", ["v-algemene-voorwaarden"]),
    TR("pt-nl","A cláusula é nula.", ["De bepaling is nietig","Die bepaling is nietig"], "nietig.", ["v-nietig"]),
    FB("De nieuwe regels zijn per 1 januari van ___.", ["kracht"], "Em vigor.", ["v-van-kracht"], choices=["kracht","toepassing","nietig"], tr="As novas regras estão em vigor desde 1 de janeiro."),
    FE(["De","algemene","voorwaarden","is","van","toepassing."], 3, "zijn", "Plural: zijn.", ["v-algemene-voorwaarden"]),
    LI("Ondergetekende verklaart het contract te hebben gelezen.", ["Ondergetekende verklaart het contract te hebben gelezen"], "O abaixo-assinado declara ter lido o contrato.", "Fórmula.", ["v-ondergetekende"]),
    MC("Antes de aceitar algemene voorwaarden online, convém…", ["*ler pelo menos a parte de cancelamento e pagamentos","nunca ler|Arriscado.","aceitar sempre|Não."], "Dica.", ["v-kleine-lettertjes"]),
  ], diff=5, mins=5)

L(23, "Reclamar formalmente", "Een bezwaarschrift indienen.",
  ["Escrever uma reclamação administrativa formal"],
  vocab=[N("v-bezwaarschrift","bezwaarschrift","reclamação formal (administrativa)","het")],
  ex=[("Binnen zes weken kunt u een bezwaarschrift indienen.","No prazo de seis semanas pode apresentar uma reclamação formal."),("Vermeld in uw bezwaarschrift waarom u het niet eens bent met het besluit.","Indique na reclamação porque não concorda com a decisão.")],
  review=["v-bezwaar-maken","v-binnen-zes-weken","v-besluit"],
  cefr=C, exs=[
    MA([("bezwaarschrift","reclamação formal"),("bezwaar maken","reclamar"),("binnen zes weken","no prazo de seis semanas"),("besluit","decisão")], "Reclamar.", ["v-bezwaarschrift","v-bezwaar-maken","v-binnen-zes-weken","v-besluit"]),
    AR("bezwaarschrift", "reclamação formal", "het", "het schrift.", ["v-bezwaarschrift"]),
    TR("pt-nl","Pode apresentar uma reclamação formal.", ["U kunt een bezwaarschrift indienen"], "indienen.", ["v-bezwaarschrift"]),
    TR("pt-nl","Não concordo com a decisão.", ["Ik ben het niet eens met het besluit","Ik ben het oneens met het besluit"], "eens met.", ["v-besluit"]),
    MC("Um bezwaarschrift deve conter…", ["*nome, data, a decisão contestada, os motivos e assinatura","só um insulto|Não.","apenas o nome|Insuficiente."], "Conteúdo.", ["v-bezwaarschrift"]),
    FB("Ik maak ___ tegen het besluit van 3 maart.", ["bezwaar"], "Reclamar.", ["v-bezwaar-maken"], choices=["bezwaar","besluit","beroep"], tr="Reclamo da decisão de 3 de março."),
    FE(["De","bezwaarschrift","moet","ondertekend","zijn."], 0, "Het", "het bezwaarschrift.", ["v-bezwaarschrift"]),
    SW("Escreva o parágrafo central (3–4 frases) de um bezwaarschrift contra uma multa de estacionamento que considera injusta.", ["Hierbij maak ik bezwaar tegen de parkeerboete van 12 mei (kenmerk 2025-4471). Op dat moment had ik een geldige parkeervergunning, die zichtbaar achter de voorruit lag. Als bewijs stuur ik een foto en een kopie van de vergunning mee. Ik verzoek u de boete te vernietigen."], ["Referência","Motivo","Prova","Pedido"], 40, "Reclamação.", ["v-bezwaarschrift"]),
  ], diff=5, mins=6)

L(24, "Traduzir o juridiquês", "Van jargon naar gewone taal.",
  ["Reformular linguagem jurídica em linguagem simples"],
  vocab=[X("v-in-gewone-taal","in gewone taal","em linguagem comum")],
  ex=[("Kunt u dat in gewone taal uitleggen?","Pode explicar isso em linguagem comum?"),("«De verhuurder is nalatig» betekent in gewone taal: de verhuurder doet niet wat hij moet doen.","«O senhorio é negligente» em linguagem comum: o senhorio não faz o que deve.")],
  review=["v-nalatig","v-begrijpelijke-taal"],
  cefr=C, exs=[
    MA([("in gewone taal","em linguagem comum"),("jargon","jargão"),("nalatig","negligente"),("begrijpelijke taal","linguagem clara")], "Simplificar.", ["v-in-gewone-taal","v-nalatig","v-begrijpelijke-taal"]),
    MC("«Huurder dient het gehuurde na afloop van de huurovereenkomst in oorspronkelijke staat op te leveren.» Em linguagem comum:", ["*Als je vertrekt, moet de woning er weer uitzien zoals toen je kwam.","Je mag alles houden.|Não.","Je moet een nieuw huis kopen.|Não."], "Simplificar.", ["v-in-gewone-taal"]),
    TR("pt-nl","Pode explicar em linguagem comum?", ["Kunt u dat in gewone taal uitleggen","Kunt u dat in gewone taal uitleggen?"], "Expressão.", ["v-in-gewone-taal"]),
    TR("pt-nl","O senhorio é negligente.", ["De verhuurder is nalatig"], "nalatig.", ["v-nalatig"]),
    FB("Juridisch ___ is voor veel mensen onbegrijpelijk.", ["jargon"], "Jargão.", [], choices=["jargon","straattaal","dialect"], tr="O jargão jurídico é incompreensível para muita gente."),
    FE(["Het","jargon","zijn","moeilijk."], 2, "is", "Singular: is.", []),
    SW("Explique em linguagem comum (2 frases): «Indien de huurder in gebreke blijft met de betaling van de huurpenningen, is de verhuurder gerechtigd de overeenkomst te ontbinden.»", ["Als je de huur niet betaalt, mag de verhuurder het huurcontract beëindigen. Je kunt dan uit je huis worden gezet."], ["Linguagem simples","Mesmo sentido"], 15, "Simplificar.", ["v-in-gewone-taal"]),
    LI("Het Juridisch Loket legt het je gratis uit.", ["Het Juridisch Loket legt het je gratis uit"], "O Juridisch Loket explica-te gratuitamente.", "Recurso útil.", ["v-juridisch-loket"]),
  ], diff=5, mins=5)

L(25, "Ruturas de estilo", "Een stijlbreuk vermijden.",
  ["Manter um estilo coerente para o público-alvo"],
  vocab=[N("v-stijlbreuk","stijlbreuk","rutura de estilo","de"), X("v-doelgroepgericht","doelgroepgericht","adaptado ao público-alvo","adjective")],
  ex=[("«Geachte heer, effe een vraagje» is een stijlbreuk.","«Exmo. Senhor, uma perguntinha rápida» é uma rutura de estilo."),("Schrijf doelgroepgericht: voor wie is je tekst?","Escreve para o público-alvo: para quem é o teu texto?")],
  review=["v-doelgroep","v-stijl","v-toon"],
  cefr=C, exs=[
    MA([("stijlbreuk","rutura de estilo"),("doelgroepgericht","adaptado ao público"),("doelgroep","público-alvo"),("stijl","estilo")], "Estilo.", ["v-stijlbreuk","v-doelgroepgericht","v-doelgroep","v-stijl"]),
    MC("Qual contém uma stijlbreuk?", ["*Geachte mevrouw, hierbij stuur ik u de offerte. Groetjes en xxx!","Geachte mevrouw, hierbij stuur ik u de offerte. Met vriendelijke groet.|Coerente.","Hoi Lisa, hier de offerte. Groetjes!|Coerente."], "Identificar.", ["v-stijlbreuk"]),
    TR("pt-nl","Escreve para o público-alvo.", ["Schrijf doelgroepgericht","Schrijf voor je doelgroep"], "doelgroepgericht.", ["v-doelgroepgericht"]),
    TR("pt-nl","É uma rutura de estilo.", ["Het is een stijlbreuk","Dat is een stijlbreuk"], "stijlbreuk.", ["v-stijlbreuk"]),
    FB("Een folder voor kinderen moet ___ geschreven zijn.", ["doelgroepgericht"], "Adaptado.", ["v-doelgroepgericht"], choices=["doelgroepgericht","juridisch","formeel"], tr="Um folheto para crianças tem de estar escrito para o público-alvo."),
    FE(["Het","stijlbreuk","viel","meteen","op."], 0, "De", "de breuk.", ["v-stijlbreuk"]),
    LI("Kies één toon en houd die vast.", ["Kies één toon en houd die vast","Kies een toon en houd die vast"], "Escolhe um tom e mantém-no.", "Dica.", ["v-toon"]),
    MC("Um texto para o público geral sobre um tema técnico deve…", ["*evitar jargão e explicar termos","usar o máximo de termos técnicos|Não.","ser em inglês|Não."], "Público.", ["v-doelgroepgericht"]),
  ], diff=4, mins=5)

L(26, "Estilo publicitário", "Een wervende tekst.",
  ["Reconhecer e escrever textos promocionais"],
  vocab=[X("v-wervend","wervend","promocional|apelativo","adjective"), N("v-slogan","slogan","slogan","de","slogans")],
  ex=[("Schrijf een wervende tekst voor de website.","Escreve um texto promocional para o site."),("Een goede slogan blijft hangen.","Um bom slogan fica na memória.")],
  review=["v-reclame","v-doelgroep"],
  cefr=C, exs=[
    MA([("wervend","promocional"),("slogan","slogan"),("reclame","publicidade"),("doelgroep","público-alvo")], "Publicidade.", ["v-wervend","v-slogan","v-reclame","v-doelgroep"]),
    MC("Qual é mais «wervend»?", ["*Ontdek de mooiste fietsroutes van Zeeland!","In Zeeland zijn fietsroutes.|Neutro.","Fietsroutes: zie bijlage.|Seco."], "Identificar.", ["v-wervend"]),
    TR("pt-nl","Escreve um texto promocional.", ["Schrijf een wervende tekst"], "wervend.", ["v-wervend"]),
    TR("pt-nl","Um bom slogan fica na memória.", ["Een goede slogan blijft hangen"], "blijven hangen.", ["v-slogan"]),
    FB("Gebruik in een ___ tekst korte zinnen en de jij-vorm.", ["wervende"], "de tekst → -e.", ["v-wervend"], choices=["wervende","wervend","juridische"], tr="Num texto promocional usa frases curtas e o tratamento por tu."),
    FE(["Die","slogan","blijven","hangen."], 2, "blijft", "Singular: blijft.", ["v-slogan"]),
    SW("Escreva um slogan e 2 frases promocionais para um café português em Utrecht.", ["Slogan: Proef Lissabon, midden in Utrecht.\nKom genieten van onze verse pastéis de nata, nog warm uit de oven. Bij ons voelt elke koffie als een kleine vakantie."], ["Slogan","Tom apelativo"], 25, "Promover.", ["v-slogan","v-wervend"]),
    LI("Probeer het nu: de eerste maand is gratis!", ["Probeer het nu: de eerste maand is gratis","Probeer het nu: de eerste maand is gratis!","Probeer het nu, de eerste maand is gratis"], "Experimenta agora: o primeiro mês é grátis!", "Call to action.", ["v-wervend"]),
  ], diff=4, mins=5)

L(27, "Divulgação científica", "Populairwetenschappelijk schrijven.",
  ["Explicar ciência a um público geral"],
  vocab=[X("v-populairwetenschappelijk","populairwetenschappelijk","de divulgação científica","adjective")],
  ex=[("Een populairwetenschappelijk artikel legt onderzoek uit in begrijpelijke taal.","Um artigo de divulgação científica explica investigação em linguagem compreensível."),("Gebruik vergelijkingen uit het dagelijks leven.","Usa comparações do dia a dia.")],
  review=["v-metafoor","v-cijfers-tot-leven","v-begrijpelijke-taal"],
  cefr=C, exs=[
    MA([("populairwetenschappelijk","de divulgação científica"),("metafoor","metáfora"),("cijfers tot leven brengen","dar vida aos números"),("begrijpelijke taal","linguagem clara")], "Divulgação.", ["v-populairwetenschappelijk","v-metafoor","v-cijfers-tot-leven","v-begrijpelijke-taal"]),
    MC("Versão de divulgação de «De proefpersonen vertoonden een significante afname van cortisol»:", ["*De deelnemers hadden duidelijk minder stresshormoon in hun bloed.","De proefpersonen cortisol.|Não.","Significant!|Vago."], "Simplificar.", ["v-populairwetenschappelijk"]),
    TR("pt-nl","Usa comparações do dia a dia.", ["Gebruik vergelijkingen uit het dagelijks leven","Gebruik vergelijkingen uit het dagelijkse leven"], "Dica.", ["v-populairwetenschappelijk"]),
    TR("pt-nl","Um artigo de divulgação científica.", ["Een populairwetenschappelijk artikel"], "het artikel → sem -e.", ["v-populairwetenschappelijk"]),
    FB("Een cel is als een kleine ___: met muren, een keuken en een afvalverwerking.", ["fabriek"], "Metáfora.", ["v-metafoor"], choices=["fabriek","slogan","vonnis"], tr="Uma célula é como uma pequena fábrica: com paredes, cozinha e tratamento de lixo."),
    FE(["Een","populairwetenschappelijke","boek","is","toegankelijk."], 1, "populairwetenschappelijk", "het boek + een → sem -e.", ["v-populairwetenschappelijk"]),
    SW("Explique em 3 frases, para um público geral, porque os Países Baixos estão em parte abaixo do nível do mar (use uma comparação).", ["Een groot deel van Nederland ligt lager dan de zee, net als een badkuip die naast een zwembad staat. Dijken werken als de rand van die badkuip en houden het water tegen. Pompen en gemalen zorgen ervoor dat het regenwater er weer uit gaat."], ["Comparação","Linguagem clara","Correto"], 35, "Divulgar.", ["v-populairwetenschappelijk"]),
    LI("Stel je een DNA-streng voor als een heel lange ritssluiting.", ["Stel je een DNA-streng voor als een heel lange ritssluiting","Stel je een dna-streng voor als een heel lange ritssluiting"], "Imagina uma cadeia de ADN como um fecho éclair muito comprido.", "Metáfora.", ["v-metafoor"]),
  ], diff=5, mins=6)

L(28, "Carta, e-mail ou mensagem?", "De juiste schrijfstijl kiezen.",
  ["Escolher o formato e o estilo certos"],
  vocab=[N("v-schrijfstijl","schrijfstijl","estilo de escrita","de")],
  ex=[("Pas je schrijfstijl aan het medium aan.","Adapta o teu estilo de escrita ao meio."),("Voor een opzegging stuur je liever een brief of e-mail dan een appje.","Para um cancelamento envia antes uma carta ou e-mail do que uma mensagem.")],
  review=["v-aanhef","v-aanpassen-aan","v-formeel","v-informeel"],
  cefr=C, exs=[
    MA([("schrijfstijl","estilo de escrita"),("aanhef","saudação inicial"),("aanpassen aan","adaptar a"),("formeel","formal")], "Formato.", ["v-schrijfstijl","v-aanhef","v-aanpassen-aan","v-formeel"]),
    MC("Para cancelar um contrato de telemóvel, o melhor formato é…", ["*carta ou e-mail (com confirmação)","mensagem de WhatsApp ao vendedor|Não.","um comentário no Instagram|Não."], "Meio.", ["v-schrijfstijl"]),
    MC("Para avisar um colega de que chegas 5 minutos atrasado:", ["*uma mensagem curta (appje)","uma carta registada|Exagero.","um bezwaarschrift|Não."], "Meio.", ["v-schrijfstijl"]),
    TR("pt-nl","Adapta o estilo ao meio.", ["Pas je schrijfstijl aan het medium aan","Pas je stijl aan het medium aan"], "aanpassen aan.", ["v-schrijfstijl"]),
    FB("De ___ «Beste Jan» is neutraal; «Geachte heer» is formeel.", ["aanhef"], "Saudação.", ["v-aanhef"], choices=["aanhef","schrijfstijl","slogan"], tr="A saudação «Caro Jan» é neutra; «Exmo. Senhor» é formal."),
    FE(["Haar","schrijfstijl","zijn","helder."], 2, "is", "Singular: is.", ["v-schrijfstijl"]),
    LI("Een appje is snel, maar niet geschikt voor officiële zaken.", ["Een appje is snel, maar niet geschikt voor officiële zaken","Een appje is snel maar niet geschikt voor officiële zaken"], "Uma mensagem é rápida, mas não adequada para assuntos oficiais.", "Dica.", ["v-schrijfstijl"]),
    WO("Adapta o teu estilo.", ["Pas","je","stijl","aan"], "Separável.", ["v-aanpassen-aan"]),
  ], diff=3, mins=5)

L(29, "Prática: o mesmo facto em quatro estilos", "Vier stijlen, één gebeurtenis.",
  ["Reescrever o mesmo acontecimento em vários estilos"],
  vocab=[X("v-van-stijl-wisselen","van stijl wisselen","mudar de estilo","verb")],
  ex=[("Een goede schrijver kan moeiteloos van stijl wisselen.","Um bom escritor consegue mudar de estilo sem esforço.")],
  review=["v-telegramstijl","v-sfeerbeschrijving","v-hieruit-volgt","v-straattaal","v-algemene-voorwaarden","v-stijlbreuk","v-wervend"],
  cefr=C, exs=[
    MA([("telegramstijl","estilo telegráfico"),("sfeerbeschrijving","descrição de ambiente"),("hieruit volgt","daqui resulta"),("wervend","promocional")], "Revisão.", ["v-telegramstijl","v-sfeerbeschrijving","v-hieruit-volgt","v-wervend"]),
    MC("«Tram ontspoord in Den Haag, twee lichtgewonden» é…", ["*um título em telegramstijl","académico|Não.","publicitário|Não."], "Revisão.", ["v-telegramstijl"]),
    MC("«Uit de data blijkt dat ontsporingen vaker voorkomen bij hitte» é…", ["*estilo académico","calão|Não.","publicitário|Não."], "Revisão.", ["v-hieruit-volgt"]),
    TR("pt-nl","Consegue mudar de estilo sem esforço.", ["Hij kan moeiteloos van stijl wisselen","Ze kan moeiteloos van stijl wisselen"], "Expressão.", ["v-van-stijl-wisselen"]),
    FE(["Ze","wisselt","makkelijk","van","stijlen."], 4, "stijl.", "Expressão: van stijl wisselen.", ["v-van-stijl-wisselen"]),
    SW("Facto: «Ontem um festival de música em Utrecht reuniu muita gente, apesar da chuva.» Escreva-o em 4 estilos (1–2 frases cada): (1) título telegráfico, (2) reportagem com ambiente, (3) mensagem a um amigo, (4) texto promocional para a próxima edição.", ["1. Duizenden bezoekers trotseren regen op Utrechts muziekfestival\n2. Regendruppels tikken op duizenden paraplu's, maar niemand gaat naar huis: op het grasveld wordt gedanst alsof de zon schijnt.\n3. Hé, gisteren dat festival: kletsnat, maar zó vet!\n4. Regen of zon: volgend jaar is het weer feest! Bestel nu je early-bird-ticket."], ["4 estilos distintos","Sem stijlbreuk dentro de cada um"], 60, "Quatro estilos.", ["v-van-stijl-wisselen"]),
  ], diff=5, mins=7)

W()
