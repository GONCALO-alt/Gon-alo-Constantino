import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u13")
C = "B2"
# Lições de aprofundamento (10–29): revisão temática do curso — de cada tema básico ao registo B2.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)
def F(simple, formal, e, refs): return MC("Qual soa mais formal (B2)?", ["*"+formal, simple+"|Correto, mas mais simples (A2)."], e, refs)

L(10, "Tema: origem e morada", "Afkomstig uit, woonachtig in.",
  ["Rever apresentações e subir o registo"],
  vocab=[X("v-afkomstig-uit","afkomstig uit","originário de","adjective"), X("v-woonachtig-in","woonachtig in","residente em (formal)","adjective")],
  ex=[("Mevrouw Silva is afkomstig uit Braga.","A senhora Silva é originária de Braga."),("Ondergetekende, woonachtig in Leiden, verklaart…","O abaixo-assinado, residente em Leiden, declara…")],
  review=["v-komen-uit","v-wonen"],
  cefr=C, exs=[
    MA([("afkomstig uit","originário de"),("woonachtig in","residente em"),("komen uit","vir de"),("wonen","morar")], "Simples ↔ formal.", ["v-afkomstig-uit","v-woonachtig-in","v-komen-uit","v-wonen"]),
    F("Ik kom uit Portugal.", "Ik ben afkomstig uit Portugal.", "afkomstig uit.", ["v-afkomstig-uit"]),
    F("Hij woont in Delft.", "Hij is woonachtig in Delft.", "woonachtig in (documentos).", ["v-woonachtig-in"]),
    MC("Onde encontras «woonachtig te/in»?", ["*em documentos oficiais e cartas formais","numa conversa no café|Demasiado formal.","em mensagens a amigos|Não."], "Registo.", ["v-woonachtig-in"]),
    TR("pt-nl","A família é originária dos Açores.", ["De familie is afkomstig uit de Azoren","Het gezin is afkomstig van de Azoren","De familie is afkomstig van de Azoren"], "afkomstig uit/van.", ["v-afkomstig-uit"]),
    FB("Ondergetekende, ___ in Gouda, verklaart dat…", ["woonachtig"], "Formal.", ["v-woonachtig-in"], choices=["woonachtig","afkomstig","wonend uit"], tr="O abaixo-assinado, residente em Gouda, declara que…"),
    FE(["Zij","is","afkomstig","naar","Lissabon."], 3, "uit", "afkomstig uit.", ["v-afkomstig-uit"]),
    LI("Ik ben afkomstig uit Coimbra, maar woon al tien jaar in Nederland.", ["Ik ben afkomstig uit Coimbra, maar woon al tien jaar in Nederland","Ik ben afkomstig uit Coimbra maar woon al tien jaar in Nederland"], "Sou originário de Coimbra, mas moro há dez anos nos Países Baixos.", "Apresentação.", ["v-afkomstig-uit"]),
  ], diff=4, mins=5)

L(11, "Tema: família", "Gezinssamenstelling.",
  ["Falar de tipos de família com vocabulário preciso"],
  vocab=[N("v-gezinssamenstelling","gezinssamenstelling","composição do agregado familiar","de"), N("v-eenoudergezin","eenoudergezin","família monoparental","het","eenoudergezinnen"),
         X("v-samenwonen","samenwonen","viver juntos (em união de facto)","verb")],
  ex=[("Vul op het formulier uw gezinssamenstelling in.","Indique no formulário a composição do agregado."),("Zij groeide op in een eenoudergezin.","Ela cresceu numa família monoparental."),("Ze wonen al vijf jaar samen.","Vivem juntos há cinco anos.")],
  review=["v-gezin","v-mantelzorg"],
  cefr=C, exs=[
    MA([("gezinssamenstelling","composição do agregado"),("eenoudergezin","família monoparental"),("samenwonen","viver juntos"),("mantelzorg","cuidados a familiares")], "Família.", ["v-gezinssamenstelling","v-eenoudergezin","v-samenwonen","v-mantelzorg"]),
    AR("eenoudergezin", "família monoparental", "het", "het gezin.", ["v-eenoudergezin"]),
    TR("pt-nl","Vivemos juntos há três anos.", ["We wonen al drie jaar samen","Wij wonen al drie jaar samen"], "Separável.", ["v-samenwonen"]),
    TR("pt-nl","Ela cresceu numa família monoparental.", ["Zij groeide op in een eenoudergezin","Ze is opgegroeid in een eenoudergezin","Ze groeide op in een eenoudergezin"], "opgroeien.", ["v-eenoudergezin"]),
    FB("Bij de toeslag is je ___ belangrijk: hoeveel mensen wonen er in huis?", ["gezinssamenstelling"], "Agregado.", ["v-gezinssamenstelling"], choices=["gezinssamenstelling","mantelzorg","samenwonen"], tr="Para o subsídio conta a composição do agregado: quantas pessoas vivem em casa?"),
    FE(["Ze","woont","sinds","2020","samen","bij","haar","vriend."], 5, "met", "samenwonen met.", ["v-samenwonen"]),
    LI("Ik geef mantelzorg aan mijn vader, die alleen woont.", ["Ik geef mantelzorg aan mijn vader, die alleen woont","Ik geef mantelzorg aan mijn vader die alleen woont"], "Cuido do meu pai, que vive sozinho.", "Ouvir.", ["v-mantelzorg"]),
    WO("Vivem juntos.", ["Ze","wonen","samen"], "Separável.", ["v-samenwonen"]),
  ], diff=4, mins=5)

L(12, "Tema: habitação", "Woonruimte en koopwoning.",
  ["Rever a habitação com termos de anúncios e documentos"],
  vocab=[N("v-woonruimte","woonruimte","espaço habitacional","de"), N("v-koopwoning","koopwoning","casa própria (para comprar)","de","koopwoningen")],
  ex=[("Er is een groot tekort aan betaalbare woonruimte.","Há uma grande falta de habitação acessível."),("Een koopwoning is in de stad bijna onbetaalbaar.","Uma casa para comprar na cidade é quase impagável.")],
  review=["v-huurwoning","v-huishouden","v-huurder"],
  cefr=C, exs=[
    MA([("woonruimte","espaço habitacional"),("koopwoning","casa para comprar"),("huurwoning","casa arrendada"),("huishouden","agregado/lida da casa")], "Habitação.", ["v-woonruimte","v-koopwoning","v-huurwoning","v-huishouden"]),
    F("Ik zoek een huis.", "Ik ben op zoek naar woonruimte.", "woonruimte.", ["v-woonruimte"]),
    MC("Koopwoning vs. huurwoning:", ["*compra-se vs. arrenda-se","iguais|Não.","koopwoning é uma loja|Não."], "Diferença.", ["v-koopwoning","v-huurwoning"]),
    TR("pt-nl","Há falta de habitação acessível.", ["Er is een tekort aan betaalbare woonruimte","Er is gebrek aan betaalbare woonruimte"], "tekort aan.", ["v-woonruimte"]),
    FB("Wij hebben een ___, geen koopwoning; we betalen elke maand huur.", ["huurwoning"], "Arrendada.", ["v-huurwoning"], choices=["huurwoning","koopwoning","woonruimte"], tr="Temos casa arrendada, não comprada; pagamos renda todos os meses."),
    FE(["De","koopwoningen","is","duur","geworden."], 2, "zijn", "Plural: zijn.", ["v-koopwoning"]),
    LI("Woonruimte gezocht voor een rustige werkende vrouw.", ["Woonruimte gezocht voor een rustige werkende vrouw"], "Procura-se casa para uma mulher trabalhadora e calma.", "Anúncio (fictício).", ["v-woonruimte"]),
    TR("nl-pt","Hoeveel personen telt uw huishouden?", ["Quantas pessoas tem o seu agregado?","Quantas pessoas tem o seu agregado familiar?"], "huishouden.", ["v-huishouden"]),
  ], diff=4, mins=5)

L(13, "Tema: compras", "Aanschaffen.",
  ["Rever compras e usar o verbo formal aanschaffen"],
  vocab=[X("v-aanschaffen","aanschaffen","adquirir","verb"), N("v-aanschaf","aanschaf","aquisição","de")],
  ex=[("We hebben een nieuwe wasmachine aangeschaft.","Adquirimos uma máquina de lavar nova."),("De aanschaf van laptops kost de school veel geld.","A aquisição de portáteis custa muito dinheiro à escola.")],
  review=["v-kopen","v-aanbieding","v-duur"],
  cefr=C, exs=[
    MA([("aanschaffen","adquirir"),("aanschaf","aquisição"),("kopen","comprar"),("aanbieding","promoção")], "Compras.", ["v-aanschaffen","v-aanschaf","v-kopen","v-aanbieding"]),
    F("We hebben een nieuwe auto gekocht.", "We hebben een nieuwe auto aangeschaft.", "aanschaffen = compra pensada, de algo duradouro.", ["v-aanschaffen"]),
    MC("O que NÃO se costuma «aanschaffen»?", ["*um gelado|Usa-se «kopen» para compras pequenas.","uma máquina de lavar|Sim.","software para a empresa|Sim."], "Uso.", ["v-aanschaffen"]),
    TR("pt-nl","Adquirimos uma máquina de lavar nova.", ["We hebben een nieuwe wasmachine aangeschaft","Wij hebben een nieuwe wasmachine aangeschaft"], "Particípio: aangeschaft.", ["v-aanschaffen"]),
    FB("De ___ van nieuwe computers is goedgekeurd.", ["aanschaf"], "Substantivo.", ["v-aanschaf"], choices=["aanschaf","aanschaffen","aanbieding"], tr="A aquisição de computadores novos foi aprovada."),
    FE(["We","hebben","een","printer","geaanschaft."], 4, "aangeschaft.", "Separável: aan-ge-schaft.", ["v-aanschaffen"]),
    LI("Is het verstandig om nu een elektrische auto aan te schaffen?", ["Is het verstandig om nu een elektrische auto aan te schaffen","Is het verstandig om nu een elektrische auto aan te schaffen?"], "É sensato comprar agora um carro elétrico?", "Pergunta.", ["v-aanschaffen"]),
    WO("Adquirimos um frigorífico.", ["We","hebben","een","koelkast","aangeschaft"], "Ordem.", ["v-aanschaffen"]),
  ], diff=4, mins=5)

L(14, "Tema: comida", "Eetgewoonten en gerechten.",
  ["Falar de hábitos alimentares com mais precisão"],
  vocab=[N("v-eetgewoonten","eetgewoonten","hábitos alimentares","de"), N("v-gerecht","gerecht","prato (receita)","het","gerechten")],
  ex=[("De eetgewoonten in Nederland verschillen van die in Portugal.","Os hábitos alimentares nos Países Baixos diferem dos de Portugal."),("Bacalhau à Brás is mijn favoriete gerecht.","Bacalhau à Brás é o meu prato preferido.")],
  review=["v-eten","v-koken","v-gezond","v-warm-eten"],
  cefr=C, exs=[
    MA([("eetgewoonten","hábitos alimentares"),("gerecht","prato"),("warm eten","refeição quente"),("gezond","saudável")], "Comida.", ["v-eetgewoonten","v-gerecht","v-warm-eten","v-gezond"]),
    MC("«Gerecht» vs «bord»:", ["*gerecht = o prato (comida); bord = o prato (louça)","iguais|Não.","gerecht = talheres|Isso é «bestek»."], "Falso amigo.", ["v-gerecht"]),
    AR("gerecht", "prato (comida)", "het", "het gerecht.", ["v-gerecht"]),
    TR("pt-nl","Os hábitos alimentares diferem muito.", ["De eetgewoonten verschillen erg","De eetgewoonten verschillen sterk","Eetgewoonten verschillen erg"], "verschillen.", ["v-eetgewoonten"]),
    TR("pt-nl","Em Portugal comemos quente ao almoço.", ["In Portugal eten we 's middags warm","In Portugal eten we warm tussen de middag"], "warm eten.", ["v-warm-eten"]),
    FE(["Dit","is","een","typisch","Portugees","gerechten."], 5, "gerecht.", "Singular: gerecht.", ["v-gerecht"]),
    SW("Compare em 3–4 frases os hábitos alimentares neerlandeses e portugueses.", ["In Nederland eten veel mensen 's middags een boterham, terwijl Portugezen vaak warm lunchen. Het avondeten is in Nederland vroeg, rond zes uur. In Portugal eten we later en nemen we meer tijd. Wel eten beide landen graag vis."], ["Comparação","terwijl / wel"], 45, "Comparar.", ["v-eetgewoonten"]),
    LI("Wat is een typisch Nederlands gerecht? Stamppot, bijvoorbeeld.", ["Wat is een typisch Nederlands gerecht? Stamppot, bijvoorbeeld","Wat is een typisch Nederlands gerecht stamppot bijvoorbeeld"], "Qual é um prato típico neerlandês? Stamppot, por exemplo.", "Ouvir.", ["v-gerecht"]),
  ], diff=4, mins=6)

L(15, "Tema: saúde", "Klachten en kwalen.",
  ["Descrever sintomas com vocabulário médico corrente"],
  vocab=[N("v-kwaal","kwaal","mal, doença (crónica)","de","kwalen")],
  ex=[("Met welke klachten komt u?","Com que queixas vem?"),("Hij heeft al jaren een vervelende kwaal aan zijn rug.","Há anos que tem um problema chato nas costas.")],
  review=["v-klachten","v-ziek","v-huisarts"],
  cefr=C, exs=[
    MA([("kwaal","mal crónico"),("klachten","queixas/sintomas"),("ziek","doente"),("huisarts","médico de família")], "Saúde.", ["v-kwaal","v-klachten","v-ziek","v-huisarts"]),
    F("Wat is er?", "Met welke klachten komt u?", "Pergunta típica do médico.", ["v-klachten"]),
    MC("No médico, «klachten» significa sobretudo…", ["*sintomas/queixas de saúde","reclamações formais|Noutro contexto, sim.","análises|Não."], "Contexto.", ["v-klachten"]),
    TR("pt-nl","Tenho estas queixas há duas semanas.", ["Ik heb deze klachten al twee weken","Ik heb al twee weken last van deze klachten"], "al + tempo.", ["v-klachten"]),
    TR("pt-nl","É um mal antigo.", ["Het is een oude kwaal"], "kwaal.", ["v-kwaal"]),
    FB("Sinds wanneer heeft u deze ___?", ["klachten"], "Queixas.", ["v-klachten"], choices=["klachten","kwalen","ziek"], tr="Desde quando tem estas queixas?"),
    FE(["Ik","heb","last","op","mijn","knie."], 3, "van", "last hebben van.", ["v-klachten"]),
    LI("De klachten worden 's nachts erger.", ["De klachten worden 's nachts erger"], "As queixas pioram à noite.", "Descrever.", ["v-klachten"]),
  ], diff=4, mins=5)

L(16, "Tema: transportes", "Zich verplaatsen.",
  ["Falar de mobilidade com vocabulário mais abstrato"],
  vocab=[X("v-zich-verplaatsen","zich verplaatsen","deslocar-se","verb"), N("v-vervoermiddel","vervoermiddel","meio de transporte","het","vervoermiddelen")],
  ex=[("In de stad verplaats ik me vooral met de fiets.","Na cidade desloco-me sobretudo de bicicleta."),("De fiets is het populairste vervoermiddel.","A bicicleta é o meio de transporte mais popular.")],
  review=["v-forens","v-pendelen","v-ov","v-fiets"],
  cefr=C, exs=[
    MA([("zich verplaatsen","deslocar-se"),("vervoermiddel","meio de transporte"),("forens","pendular"),("pendelen","fazer o trajeto casa-trabalho")], "Mobilidade.", ["v-zich-verplaatsen","v-vervoermiddel","v-forens","v-pendelen"]),
    F("Ik ga met de fiets naar mijn werk.", "Ik verplaats me vooral per fiets.", "zich verplaatsen.", ["v-zich-verplaatsen"]),
    AR("vervoermiddel", "meio de transporte", "het", "het middel.", ["v-vervoermiddel"]),
    TR("pt-nl","Desloco-me sobretudo de bicicleta.", ["Ik verplaats me vooral met de fiets","Ik verplaats mij vooral per fiets","Ik verplaats me vooral per fiets"], "Reflexivo.", ["v-zich-verplaatsen"]),
    TR("pt-nl","Qual é o teu meio de transporte preferido?", ["Wat is je favoriete vervoermiddel?","Wat is jouw favoriete vervoermiddel?","Wat is je favoriete vervoermiddel"], "vervoermiddel.", ["v-vervoermiddel"]),
    FB("Veel ___ reizen elke dag van Almere naar Amsterdam.", ["forensen"], "Plural.", ["v-forens"], choices=["forensen","vervoermiddelen","fietsen"], tr="Muitos pendulares viajam todos os dias de Almere para Amesterdão."),
    FE(["Hoe","verplaats","je","jou","in","de","stad?"], 3, "je", "Reflexivo de jij: je.", ["v-zich-verplaatsen"]),
    LI("Met het ov ben je in een half uur in het centrum.", ["Met het ov ben je in een half uur in het centrum"], "De transportes públicos chegas ao centro em meia hora.", "Ouvir.", ["v-ov"]),
  ], diff=4, mins=5)

L(17, "Tema: o tempo", "Neerslag en weersomstandigheden.",
  ["Usar termos meteorológicos formais"],
  vocab=[N("v-neerslag","neerslag","precipitação","de"), N("v-weersomstandigheden","weersomstandigheden","condições meteorológicas","de")],
  ex=[("Morgen valt er veel neerslag.","Amanhã cai muita precipitação."),("Door de weersomstandigheden is de wedstrijd afgelast.","Devido às condições meteorológicas o jogo foi cancelado.")],
  review=["v-regen","v-buien","v-koud"],
  cefr=C, exs=[
    MA([("neerslag","precipitação"),("weersomstandigheden","condições meteorológicas"),("regen","chuva"),("bui","aguaceiro")], "Tempo.", ["v-neerslag","v-weersomstandigheden","v-regen","v-buien"]),
    F("Het gaat morgen veel regenen.", "Morgen valt er veel neerslag.", "neerslag (boletim).", ["v-neerslag"]),
    MC("«Neerslag» inclui…", ["*chuva, neve e granizo","só nevoeiro|Não.","só vento|Não."], "Definição.", ["v-neerslag"]),
    TR("pt-nl","O jogo foi cancelado devido às condições meteorológicas.", ["De wedstrijd is afgelast door de weersomstandigheden","Door de weersomstandigheden is de wedstrijd afgelast","Vanwege de weersomstandigheden is de wedstrijd afgelast"], "afgelast.", ["v-weersomstandigheden"]),
    FB("Er wordt vannacht 20 millimeter ___ verwacht.", ["neerslag"], "Precipitação.", ["v-neerslag"], choices=["neerslag","regen","weersomstandigheden"], tr="Esperam-se esta noite 20 milímetros de precipitação."),
    FE(["Het","neerslag","valt","vooral","in","het","noorden."], 0, "De", "de neerslag.", ["v-neerslag"]),
    LI("Bij deze weersomstandigheden raden we af om de weg op te gaan.", ["Bij deze weersomstandigheden raden we af om de weg op te gaan"], "Com estas condições meteorológicas desaconselhamos viajar.", "Aviso.", ["v-weersomstandigheden"]),
    WO("Cai muita precipitação.", ["Er","valt","veel","neerslag"], "Ordem.", ["v-neerslag"]),
  ], diff=4, mins=5)

L(18, "Tema: trabalho", "Werkzaam zijn als.",
  ["Descrever a situação profissional em registo formal"],
  vocab=[X("v-werkzaam-als","werkzaam zijn als","trabalhar como (formal)"), N("v-dienstverband","dienstverband","vínculo laboral","het")],
  ex=[("Sinds 2021 ben ik werkzaam als verpleegkundige.","Desde 2021 trabalho como enfermeira."),("Ik heb een vast dienstverband.","Tenho um vínculo efetivo.")],
  review=["v-werk","v-salaris","v-loopbaan","v-werkloos"],
  cefr=C, exs=[
    MA([("werkzaam zijn als","trabalhar como"),("dienstverband","vínculo laboral"),("loopbaan","carreira"),("salaris","salário")], "Trabalho.", ["v-werkzaam-als","v-dienstverband","v-loopbaan","v-salaris"]),
    F("Ik werk als leraar.", "Ik ben werkzaam als leraar.", "werkzaam (CV, carta).", ["v-werkzaam-als"]),
    AR("dienstverband", "vínculo laboral", "het", "het verband.", ["v-dienstverband"]),
    TR("pt-nl","Desde 2021 trabalho como enfermeira.", ["Sinds 2021 ben ik werkzaam als verpleegkundige","Sinds 2021 werk ik als verpleegkundige"], "Inversão.", ["v-werkzaam-als"]),
    TR("pt-nl","Tenho um vínculo efetivo.", ["Ik heb een vast dienstverband","Ik heb een vaste aanstelling"], "vast.", ["v-dienstverband"]),
    FB("Na zijn ontslag was hij een jaar ___.", ["werkloos"], "Sem emprego.", ["v-werkloos"], choices=["werkloos","werkzaam","dienstverband"], tr="Depois do despedimento esteve um ano desempregado."),
    FE(["Zij","is","werkzaam","bij","projectleider."], 3, "als", "werkzaam als (função); werkzaam bij (empresa).", ["v-werkzaam-als"]),
    LI("Ik ben werkzaam bij een ingenieursbureau in Rotterdam.", ["Ik ben werkzaam bij een ingenieursbureau in Rotterdam"], "Trabalho numa empresa de engenharia em Roterdão.", "CV.", ["v-werkzaam-als"]),
  ], diff=4, mins=5)

L(19, "Tema: estudos", "Een diploma behalen.",
  ["Falar do percurso escolar em registo formal"],
  vocab=[X("v-diploma-behalen","een diploma behalen","obter um diploma","verb"), X("v-opleiding-afronden","een opleiding afronden","concluir uma formação","verb")],
  ex=[("In 2018 behaalde ik mijn diploma verpleegkunde.","Em 2018 obtive o diploma de enfermagem."),("Ze heeft haar opleiding met succes afgerond.","Ela concluiu a formação com sucesso.")],
  review=["v-diploma","v-opleiding","v-studeren"],
  cefr=C, exs=[
    MA([("een diploma behalen","obter um diploma"),("een opleiding afronden","concluir uma formação"),("opleiding","formação"),("studeren","estudar")], "Estudos.", ["v-diploma-behalen","v-opleiding-afronden","v-opleiding","v-studeren"]),
    F("Ik heb mijn diploma gekregen.", "Ik heb mijn diploma behaald.", "behalen (formal).", ["v-diploma-behalen"]),
    F("Ik ben klaar met mijn studie.", "Ik heb mijn opleiding afgerond.", "afronden.", ["v-opleiding-afronden"]),
    TR("pt-nl","Em 2018 obtive o diploma.", ["In 2018 behaalde ik mijn diploma","In 2018 heb ik mijn diploma behaald"], "Inversão.", ["v-diploma-behalen"]),
    TR("pt-nl","Ela concluiu a formação com sucesso.", ["Ze heeft haar opleiding met succes afgerond","Zij rondde haar opleiding met succes af"], "afronden.", ["v-opleiding-afronden"]),
    FB("Wanneer heb je je opleiding ___?", ["afgerond"], "Particípio.", ["v-opleiding-afronden"], choices=["afgerond","geafrond","afgeronden"], tr="Quando concluíste a formação?"),
    FE(["Hij","heeft","zijn","diploma","gehaalt."], 4, "gehaald.", "Particípio: gehaald.", ["v-diploma-behalen"]),
    LI("Mijn Portugese diploma is in Nederland erkend.", ["Mijn Portugese diploma is in Nederland erkend"], "O meu diploma português é reconhecido nos Países Baixos.", "Ouvir.", ["v-diploma"]),
  ], diff=4, mins=5)

L(20, "Tema: tempos livres", "Vrijetijdsbesteding.",
  ["Falar de lazer com vocabulário B2"],
  vocab=[N("v-vrijetijdsbesteding","vrijetijdsbesteding","ocupação dos tempos livres","de")],
  ex=[("Wandelen is mijn favoriete vrijetijdsbesteding.","Caminhar é a minha ocupação preferida nos tempos livres."),("Na het werk ontspan ik me met muziek.","Depois do trabalho descontraio com música.")],
  review=["v-hobby","v-zich-ontspannen","v-vakantie"],
  cefr=C, exs=[
    MA([("vrijetijdsbesteding","ocupação dos tempos livres"),("hobby","passatempo"),("zich ontspannen","descontrair"),("vakantie","férias")], "Lazer.", ["v-vrijetijdsbesteding","v-hobby","v-zich-ontspannen","v-vakantie"]),
    F("Mijn hobby is lezen.", "Lezen is mijn favoriete vrijetijdsbesteding.", "vrijetijdsbesteding.", ["v-vrijetijdsbesteding"]),
    TR("pt-nl","Depois do trabalho descontraio com música.", ["Na het werk ontspan ik me met muziek","Na het werk ontspan ik mij met muziek"], "Reflexivo.", ["v-zich-ontspannen"]),
    TR("pt-nl","Qual é a tua ocupação preferida nos tempos livres?", ["Wat is jouw favoriete vrijetijdsbesteding?","Wat is je favoriete vrijetijdsbesteding?","Wat is je favoriete vrijetijdsbesteding"], "vrijetijdsbesteding.", ["v-vrijetijdsbesteding"]),
    FB("Hoe ___ jij je na een drukke dag?", ["ontspan"], "Inversão: ontspan jij.", ["v-zich-ontspannen"], choices=["ontspan","ontspant","ontspannen"], tr="Como descontrais depois de um dia agitado?"),
    FE(["Ik","ontspan","me","met","te","wandelen."], 3, "door", "door te + infinitivo: «door te wandelen».", ["v-zich-ontspannen"]),
    SW("Descreva em 3 frases a sua vrijetijdsbesteding e porque gosta dela.", ["Mijn favoriete vrijetijdsbesteding is tuinieren. Ik ontspan me door met mijn handen in de aarde te werken. Bovendien eet ik in de zomer mijn eigen tomaten."], ["vrijetijdsbesteding","Motivo"], 35, "Escrever.", ["v-vrijetijdsbesteding"]),
    LI("In mijn vrije tijd zing ik in een koor.", ["In mijn vrije tijd zing ik in een koor"], "Nos tempos livres canto num coro.", "Ouvir.", ["v-vrijetijdsbesteding"]),
  ], diff=4, mins=5)

L(21, "Tema: emoções", "Gemoedstoestand.",
  ["Descrever estados emocionais com nuance"],
  vocab=[N("v-gemoedstoestand","gemoedstoestand","estado de espírito","de")],
  ex=[("Zijn gemoedstoestand wisselt sterk.","O estado de espírito dele varia muito."),("Ik was eerst teleurgesteld, maar later opgelucht.","Primeiro fiquei desiludido, mas depois aliviado.")],
  review=["v-teleurgesteld","v-opgelucht","v-boos","v-verdrietig","v-blij"],
  cefr=C, exs=[
    MA([("teleurgesteld","desiludido"),("opgelucht","aliviado"),("verdrietig","triste"),("gemoedstoestand","estado de espírito")], "Emoções.", ["v-teleurgesteld","v-opgelucht","v-verdrietig","v-gemoedstoestand"]),
    MC("O exame correu bem depois de semanas de nervos. Sentes-te…", ["*opgelucht","teleurgesteld|Seria se corresse mal.","boos|Não."], "Contexto.", ["v-opgelucht"]),
    MC("Não ficaste com o emprego que querias. Sentes-te…", ["*teleurgesteld","opgelucht|Não.","verliefd|Não."], "Contexto.", ["v-teleurgesteld"]),
    TR("pt-nl","Primeiro fiquei desiludido, mas depois aliviado.", ["Eerst was ik teleurgesteld, maar later opgelucht","Ik was eerst teleurgesteld, maar later opgelucht"], "Contraste.", ["v-teleurgesteld","v-opgelucht"]),
    FB("Ik ben ___ op mijn broer, want hij heeft mijn fiets kapotgemaakt.", ["boos"], "boos op.", ["v-boos"], choices=["boos","opgelucht","verdrietig"], tr="Estou zangado com o meu irmão, porque me estragou a bicicleta."),
    FE(["Ik","ben","teleurgesteld","op","de","uitslag."], 3, "over", "teleurgesteld over (algo) / in (alguém).", ["v-teleurgesteld"]),
    LI("Haar gemoedstoestand is sinds de verhuizing veel beter.", ["Haar gemoedstoestand is sinds de verhuizing veel beter"], "O estado de espírito dela está muito melhor desde a mudança.", "Ouvir.", ["v-gemoedstoestand"]),
    TR("nl-pt","Ik ben blij én een beetje verdrietig.", ["Estou contente e um pouco triste","Estou feliz e um bocado triste"], "Emoções mistas.", ["v-blij","v-verdrietig"]),
  ], diff=4, mins=5)

L(22, "Tema: opiniões", "Het roerend eens zijn.",
  ["Expressar concordância e opinião com nuance"],
  vocab=[X("v-roerend-eens","het roerend met iemand eens zijn","concordar plenamente"), X("v-naar-mijn-idee","naar mijn idee","na minha opinião")],
  ex=[("Ik ben het roerend met je eens.","Concordo plenamente contigo."),("Naar mijn idee is dat te duur.","Na minha opinião isso é demasiado caro.")],
  review=["v-mening","v-eens","v-oneens","v-standpunt"],
  cefr=C, exs=[
    MA([("het roerend eens zijn","concordar plenamente"),("naar mijn idee","na minha opinião"),("het oneens zijn","discordar"),("standpunt","posição")], "Opinião.", ["v-roerend-eens","v-naar-mijn-idee","v-oneens","v-standpunt"]),
    MC("Do menos para o mais forte:", ["*het deels eens → het eens → het roerend eens","het roerend eens → het eens → het deels eens|Ao contrário.","iguais|Não."], "Graus.", ["v-roerend-eens"]),
    F("Ik vind dat te duur.", "Naar mijn idee is dat te duur.", "naar mijn idee + inversão.", ["v-naar-mijn-idee"]),
    TR("pt-nl","Concordo plenamente contigo.", ["Ik ben het roerend met je eens","Ik ben het helemaal met je eens"], "roerend.", ["v-roerend-eens"]),
    MC("Qual é a ordem correta?", ["*Naar mijn idee is het plan te ambitieus.","Naar mijn idee het plan is te ambitieus.|Inversão depois de «naar mijn idee»."], "V2.", ["v-naar-mijn-idee"]),
    FE(["Ik","ben","het","oneens","van","jou."], 4, "met", "het oneens zijn met.", ["v-oneens"]),
    LI("Daar ben ik het roerend mee eens.", ["Daar ben ik het roerend mee eens"], "Com isso concordo plenamente.", "Ouvir.", ["v-roerend-eens"]),
    WO("Concordo plenamente.", ["Ik","ben","het","roerend","eens"], "Ordem.", ["v-roerend-eens"]),
  ], diff=4, mins=5)

L(23, "Tema: burocracia", "In behandeling nemen.",
  ["Compreender o estado de um pedido"],
  vocab=[X("v-in-behandeling","in behandeling nemen","dar seguimento (a um pedido)","verb")],
  ex=[("Uw aanvraag is in behandeling genomen.","O seu pedido está a ser tratado."),("We nemen uw aanvraag binnen acht weken in behandeling.","Damos seguimento ao seu pedido no prazo de oito semanas.")],
  review=["v-aanvraag-indienen","v-loket","v-gemeente"],
  cefr=C, exs=[
    MA([("in behandeling nemen","dar seguimento"),("een aanvraag indienen","submeter um pedido"),("loket","balcão"),("gemeente","câmara")], "Burocracia.", ["v-in-behandeling","v-aanvraag-indienen","v-loket","v-gemeente"]),
    MC("«Uw aanvraag is in behandeling» significa…", ["*o pedido está a ser analisado","o pedido foi recusado|Não.","o pedido perdeu-se|Não."], "Estado.", ["v-in-behandeling"]),
    TR("pt-nl","O seu pedido está a ser tratado.", ["Uw aanvraag is in behandeling","Uw aanvraag is in behandeling genomen"], "in behandeling.", ["v-in-behandeling"]),
    TR("pt-nl","Submeti o pedido online.", ["Ik heb de aanvraag online ingediend","Ik heb mijn aanvraag online ingediend"], "indienen.", ["v-aanvraag-indienen"]),
    FB("Wij nemen uw klacht zo snel mogelijk in ___.", ["behandeling"], "Expressão.", ["v-in-behandeling"], choices=["behandeling","behandelen","handeling"], tr="Damos seguimento à sua reclamação o mais depressa possível."),
    FE(["Ik","heb","de","aanvraag","ingedient."], 4, "ingediend.", "Particípio: ingediend.", ["v-aanvraag-indienen"]),
    LI("Uw aanvraag is compleet en wordt nu in behandeling genomen.", ["Uw aanvraag is compleet en wordt nu in behandeling genomen"], "O seu pedido está completo e vai agora ser tratado.", "Mensagem oficial.", ["v-in-behandeling"]),
    DL([("Loket","Uw aanvraag is nog in behandeling.","O seu pedido ainda está a ser tratado."),("Jij","","")], ["*Weet u ongeveer wanneer ik een beslissing kan verwachten?","Schiet op!|Indelicado.","Dus het is afgewezen?|Interpretação errada."], "Perguntar prazo.", ["v-in-behandeling"]),
  ], diff=4, mins=5)

L(24, "Tema: notícias", "De berichtgeving.",
  ["Falar da cobertura mediática"],
  vocab=[N("v-berichtgeving","berichtgeving","cobertura noticiosa","de")],
  ex=[("De berichtgeving over het ongeluk was eenzijdig.","A cobertura do acidente foi parcial."),("Ik volg het nieuws via de krant en de radio.","Sigo as notícias pelo jornal e pela rádio.")],
  review=["v-nieuws","v-krant","v-naar-verluidt"],
  cefr=C, exs=[
    MA([("berichtgeving","cobertura noticiosa"),("nieuws","notícias"),("krant","jornal"),("naar verluidt","segundo consta")], "Media.", ["v-berichtgeving","v-nieuws","v-krant","v-naar-verluidt"]),
    TR("pt-nl","A cobertura foi parcial.", ["De berichtgeving was eenzijdig"], "eenzijdig.", ["v-berichtgeving"]),
    TR("pt-nl","Segundo consta, o ministro vai demitir-se.", ["Naar verluidt stapt de minister op","Naar verluidt treedt de minister af"], "Inversão.", ["v-naar-verluidt"]),
    FB("Er was kritiek op de ___ van de omroep.", ["berichtgeving"], "Cobertura.", ["v-berichtgeving"], choices=["berichtgeving","nieuws","krant"], tr="Houve críticas à cobertura da emissora."),
    FE(["Het","berichtgeving","was","objectief."], 0, "De", "de berichtgeving.", ["v-berichtgeving"]),
    MC("Cobertura «eenzijdig» é…", ["*parcial, só mostra um lado","completa|Não.","rápida|Não."], "Vocabulário.", ["v-berichtgeving"]),
    LI("De berichtgeving in de media was overdreven.", ["De berichtgeving in de media was overdreven"], "A cobertura nos media foi exagerada.", "Ouvir.", ["v-berichtgeving"]),
    WO("A cobertura foi boa.", ["De","berichtgeving","was","goed"], "Ordem.", ["v-berichtgeving"]),
  ], diff=4, mins=5)

L(25, "Tema: sociedade", "De samenleving.",
  ["Falar de temas sociais"],
  vocab=[N("v-samenleving","samenleving","sociedade","de")],
  ex=[("De vergrijzing is een uitdaging voor de samenleving.","O envelhecimento é um desafio para a sociedade."),("Vrijwilligers zijn belangrijk voor onze samenleving.","Os voluntários são importantes para a nossa sociedade.")],
  review=["v-vergrijzing","v-maatschappelijk-debat","v-vrijwilliger"],
  cefr=C, exs=[
    MA([("samenleving","sociedade"),("vergrijzing","envelhecimento da população"),("het maatschappelijk debat","o debate público"),("vrijwilliger","voluntário")], "Sociedade.", ["v-samenleving","v-vergrijzing","v-maatschappelijk-debat","v-vrijwilliger"]),
    MC("«Samenleving» e «maatschappij» são…", ["*sinónimos (sociedade)","opostos|Não.","empresa e sociedade comercial|Não aqui."], "Sinónimos.", ["v-samenleving"]),
    TR("pt-nl","O envelhecimento é um desafio para a sociedade.", ["De vergrijzing is een uitdaging voor de samenleving","Vergrijzing is een uitdaging voor de samenleving"], "uitdaging.", ["v-vergrijzing"]),
    TR("pt-nl","Os voluntários são importantes para a sociedade.", ["Vrijwilligers zijn belangrijk voor de samenleving","Vrijwilligers zijn belangrijk voor onze samenleving"], "Plural.", ["v-samenleving"]),
    FB("Door de ___ zijn er meer zorgmedewerkers nodig.", ["vergrijzing"], "Envelhecimento.", ["v-vergrijzing"], choices=["vergrijzing","samenleving","berichtgeving"], tr="Devido ao envelhecimento são precisos mais profissionais de saúde."),
    FE(["Het","samenleving","verandert","snel."], 0, "De", "de samenleving.", ["v-samenleving"]),
    SW("Escreva 3 frases sobre um desafio da sociedade neerlandesa ou portuguesa.", ["Een grote uitdaging voor de samenleving is de vergrijzing. Er zijn steeds meer ouderen en minder jongeren die werken. Daarom moeten we nadenken over de zorg van de toekomst."], ["Desafio","Causa","Consequência"], 40, "Escrever.", ["v-samenleving"]),
    LI("We leven in een snel veranderende samenleving.", ["We leven in een snel veranderende samenleving","Wij leven in een snel veranderende samenleving"], "Vivemos numa sociedade em rápida mudança.", "Ouvir.", ["v-samenleving"]),
  ], diff=4, mins=6)

L(26, "Tema: ambiente", "Milieubewust leven.",
  ["Falar de comportamentos amigos do ambiente"],
  vocab=[X("v-milieubewust","milieubewust","consciente do ambiente","adjective")],
  ex=[("Steeds meer mensen leven milieubewust.","Cada vez mais pessoas vivem de forma consciente do ambiente."),("Met minder vliegen verklein je je ecologische voetafdruk.","Voando menos reduzes a tua pegada ecológica.")],
  review=["v-milieu","v-duurzaamheid","v-klimaatverandering","v-ecologische-voetafdruk"],
  cefr=C, exs=[
    MA([("milieubewust","consciente do ambiente"),("duurzaamheid","sustentabilidade"),("klimaatverandering","alterações climáticas"),("ecologische voetafdruk","pegada ecológica")], "Ambiente.", ["v-milieubewust","v-duurzaamheid","v-klimaatverandering","v-ecologische-voetafdruk"]),
    MC("Comportamento milieubewust:", ["*separar o lixo e usar a bicicleta","deixar as luzes acesas|Não.","voar todos os fins de semana|Não."], "Exemplo.", ["v-milieubewust"]),
    TR("pt-nl","Cada vez mais pessoas vivem de forma consciente do ambiente.", ["Steeds meer mensen leven milieubewust","Er leven steeds meer mensen milieubewust"], "steeds meer.", ["v-milieubewust"]),
    TR("pt-nl","Voando menos reduzes a tua pegada ecológica.", ["Door minder te vliegen verklein je je ecologische voetafdruk","Met minder vliegen verklein je je ecologische voetafdruk"], "door … te.", ["v-ecologische-voetafdruk"]),
    FB("Een ___ consument let op verpakkingen en herkomst.", ["milieubewuste"], "Adjetivo com -e.", ["v-milieubewust"], choices=["milieubewuste","milieubewust","milieu"], tr="Um consumidor consciente presta atenção às embalagens e à origem."),
    FE(["Zij","is","erg","milieubewuste."], 3, "milieubewust.", "Predicativo: sem -e.", ["v-milieubewust"]),
    LI("Klimaatverandering raakt ons allemaal.", ["Klimaatverandering raakt ons allemaal","De klimaatverandering raakt ons allemaal"], "As alterações climáticas afetam-nos a todos.", "Ouvir.", ["v-klimaatverandering"]),
    WO("Ela vive de forma consciente.", ["Ze","leeft","milieubewust"], "Ordem.", ["v-milieubewust"]),
  ], diff=4, mins=5)

L(27, "Tema: cultura neerlandesa", "Nuchterheid en directheid.",
  ["Descrever traços culturais sem estereótipos rígidos"],
  vocab=[N("v-nuchterheid","nuchterheid","sobriedade, pragmatismo","de"), N("v-directheid","directheid","franqueza","de")],
  ex=[("De Nederlandse directheid kan in het begin schrikken zijn.","A franqueza neerlandesa pode assustar ao início."),("Nuchterheid wordt vaak gezien als typisch Nederlands.","O pragmatismo é muitas vezes visto como tipicamente neerlandês.")],
  gram=[G("g-s7u13b-1","Cuidado com generalizações","Ao falar de cultura, usa expressões que matizam: *vaak*, *veel mensen*, *wordt vaak gezien als*, *in mijn ervaring*. Evita «alle Nederlanders zijn…». Isto também é uma competência B2: falar com nuance.")],
  review=["v-gezellig","v-nuanceren"],
  cefr=C, exs=[
    MA([("nuchterheid","pragmatismo"),("directheid","franqueza"),("gezellig","acolhedor"),("nuanceren","matizar")], "Cultura.", ["v-nuchterheid","v-directheid","v-gezellig","v-nuanceren"]),
    F("Alle Nederlanders zijn direct.", "In mijn ervaring zijn veel Nederlanders vrij direct.", "Nuance.", ["v-directheid","v-nuanceren"]),
    TR("pt-nl","A franqueza neerlandesa pode assustar ao início.", ["De Nederlandse directheid kan in het begin schrikken zijn","De Nederlandse directheid kan in het begin even wennen zijn","De Nederlandse directheid kan in het begin schrikken"], "directheid.", ["v-directheid"]),
    TR("pt-nl","Muitas vezes é visto como tipicamente neerlandês.", ["Het wordt vaak gezien als typisch Nederlands"], "Passiva.", ["v-nuchterheid"]),
    FB("Hij reageerde met typisch Hollandse ___: «Doe maar gewoon.»", ["nuchterheid"], "Pragmatismo.", ["v-nuchterheid"], choices=["nuchterheid","directheid","gezelligheid"], tr="Ele reagiu com o típico pragmatismo holandês: «Sê normal.»"),
    FE(["Het","directheid","van","mijn","collega","verraste","me."], 0, "De", "-heid → de.", ["v-directheid"]),
    LI("In mijn ervaring zeggen Nederlanders vaak gewoon wat ze denken.", ["In mijn ervaring zeggen Nederlanders vaak gewoon wat ze denken"], "Na minha experiência os neerlandeses dizem muitas vezes simplesmente o que pensam.", "Nuance.", ["v-directheid"]),
    MC("Todas as palavras em -heid são…", ["*de-woorden","het-woorden|Não.","variáveis|Não."], "Regra.", ["v-directheid","v-nuchterheid"]),
  ], diff=4, mins=5)

L(28, "Reformular", "Iets anders verwoorden.",
  ["Dizer a mesma coisa de outra forma"],
  vocab=[X("v-verwoorden","verwoorden","pôr em palavras","verb"), X("v-formuleren","formuleren","formular","verb")],
  ex=[("Ik weet niet goed hoe ik het moet verwoorden.","Não sei bem como pôr isto em palavras."),("Kun je je vraag anders formuleren?","Podes formular a tua pergunta de outra forma?")],
  review=["v-omschrijven","v-woordenschat"],
  cefr=C, exs=[
    MA([("verwoorden","pôr em palavras"),("formuleren","formular"),("omschrijven","descrever"),("woordenschat","vocabulário")], "Reformular.", ["v-verwoorden","v-formuleren","v-omschrijven","v-woordenschat"]),
    MC("Não sabes a palavra «stofzuiger». A melhor estratégia:", ["*Omschrijven: «een apparaat waarmee je stof van de vloer haalt»","Ficar calado|Não.","Dizer em português mais alto|Não."], "Estratégia.", ["v-omschrijven"]),
    TR("pt-nl","Não sei como pôr isto em palavras.", ["Ik weet niet hoe ik het moet verwoorden","Ik weet niet hoe ik dit moet verwoorden"], "verwoorden.", ["v-verwoorden"]),
    TR("pt-nl","Podes formular isso de outra forma?", ["Kun je dat anders formuleren?","Kun je dat anders formuleren","Kun je het anders formuleren?"], "formuleren.", ["v-formuleren"]),
    FB("Hij heeft het heel mooi ___.", ["verwoord"], "Particípio.", ["v-verwoorden"], choices=["verwoord","verwoordt","geverwoord"], tr="Ele pôs isso em palavras muito bonitas."),
    FE(["Ik","zal","het","anders","formuleert."], 4, "formuleren.", "Depois de zal: infinitivo.", ["v-formuleren"]),
    SW("Reformule de forma mais educada: «Jouw plan is slecht.» (1–2 frases)", ["Ik heb nog een paar twijfels over je plan. Zouden we het samen nog eens kunnen bekijken?"], ["Mais suave","Proposta"], 25, "Reformular.", ["v-formuleren"]),
    LI("Mag ik het even anders verwoorden?", ["Mag ik het even anders verwoorden","Mag ik het even anders verwoorden?"], "Posso dizer de outra maneira?", "Ouvir.", ["v-verwoorden"]),
  ], diff=4, mins=5)

L(29, "Revisão integrada: um texto sobre a tua vida", "Alles samen.",
  ["Escrever um texto pessoal usando o vocabulário B2 revisto"],
  vocab=[],
  ex=[("In dit verhaal beschrijf ik mijn levensloop.","Nesta história descrevo o meu percurso de vida.")],
  review=["v-levensloop","v-afkomstig-uit","v-werkzaam-als","v-diploma-behalen","v-vrijetijdsbesteding","v-zich-verplaatsen","v-samenwonen","v-naar-mijn-idee","v-samenleving"],
  cefr=C, exs=[
    MA([("afkomstig uit","originário de"),("werkzaam als","a trabalhar como"),("een diploma behalen","obter um diploma"),("levensloop","percurso de vida")], "Revisão.", ["v-afkomstig-uit","v-werkzaam-als","v-diploma-behalen","v-levensloop"]),
    F("Ik kom uit Porto en werk als kok.", "Ik ben afkomstig uit Porto en werkzaam als kok.", "Registo.", ["v-afkomstig-uit","v-werkzaam-als"]),
    FB("Sinds 2019 ___ ik samen met mijn partner in Haarlem.", ["woon"], "samenwonen.", ["v-samenwonen"], choices=["woon","woont","wonen"], tr="Desde 2019 vivo com o meu companheiro em Haarlem."),
    MC("Qual é a ordem correta?", ["*Naar mijn idee is de samenleving te individualistisch.","Naar mijn idee de samenleving is te individualistisch.|Inversão."], "V2.", ["v-naar-mijn-idee"]),
    SW("Escreva a sua levensloop (100–130 palavras, fictícia se preferir): origem, estudos, trabalho, mudança para os Países Baixos, tempos livres e uma opinião sobre a sociedade.", ["Ik ben afkomstig uit Viseu, een stad in het binnenland van Portugal. In 2012 behaalde ik mijn diploma als fysiotherapeut. Na een paar jaar werk in Lissabon verhuisde ik in 2017 naar Nederland. Sinds 2019 ben ik werkzaam in een revalidatiecentrum in Arnhem en woon ik samen met mijn partner. Ik verplaats me bijna altijd per fiets, ook als het regent. Mijn favoriete vrijetijdsbesteding is zwemmen. Naar mijn idee is de Nederlandse samenleving erg goed georganiseerd, maar soms wat afstandelijk. Toch voel ik me hier inmiddels thuis."], ["Origem","Estudos","Trabalho","Lazer","Opinião"], 110, "Texto pessoal (exemplo fictício).", ["v-levensloop"]),
  ], diff=5, mins=8)

W()
