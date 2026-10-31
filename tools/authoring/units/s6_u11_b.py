import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u11")
C = "B1-B2"
# Lições de aprofundamento (10–25): orações relativas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Waardoor, waarop, waaraan", "Het probleem waaraan ik werk.",
  ["Usar waar + preposição como relativo para coisas"],
  vocab=[X("v-waardoor-rel","waardoor","por causa do qual|o que fez com que","adverb"), X("v-waarop-rel","waarop","em que|sobre o qual","adverb"),
         X("v-waaraan-rel","waaraan","no qual|a que","adverb")],
  ex=[("Het project waaraan ik werk, is bijna klaar.","O projeto em que trabalho está quase pronto."),("De dag waarop we elkaar ontmoetten, regende het.","No dia em que nos conhecemos, chovia."),("Er was een storing, waardoor de trein niet reed.","Houve uma avaria, por causa da qual o comboio não circulou.")],
  review=["v-waarin","v-waarover","v-waarmee-kan-ik-u-helpen"],
  gram=[G("g-waar-prep","Waar + preposição","Para **coisas**, o relativo com preposição é **waar + preposição**: *werken aan → het project **waaraan** ik werk*; *wachten op → de bus **waarop** ik wacht*. Pode separar-se: *het project **waar** ik **aan** werk*. Para **pessoas** usa-se **prep + wie**: *de collega **met wie** ik werk*.",
    [("Dit is de pen waarmee ik schrijf.","Esta é a caneta com que escrevo."),("Het onderwerp waar ik over schrijf…","O tema sobre o qual escrevo…")])],
  cefr=C, exs=[
    MA([("waardoor","por causa do qual"),("waarop","em que (dia)"),("waaraan","no qual"),("waarin","dentro do qual")], "Waar + prep.", ["v-waardoor-rel","v-waarop-rel","v-waaraan-rel","v-waarin"]),
    MC("«Werken aan» → het project ___ ik werk:", ["*waaraan","waarop|Outra preposição.","die|Falta a preposição."], "Preposição do verbo.", ["v-waaraan-rel"]),
    MC("«Wachten op» → de bus ___ ik wacht:", ["*waarop","waaraan|Não.","waardoor|Não."], "wachten op.", ["v-waarop-rel"]),
    TR("pt-nl","O projeto em que trabalho está quase pronto.", ["Het project waaraan ik werk, is bijna klaar","Het project waar ik aan werk, is bijna klaar","Het project waaraan ik werk is bijna klaar"], "waaraan.", ["v-waaraan-rel"]),
    TR("pt-nl","No dia em que nos conhecemos, chovia.", ["De dag waarop we elkaar ontmoetten, regende het","Op de dag dat we elkaar ontmoetten, regende het"], "waarop / dat.", ["v-waarop-rel"]),
    FB("Er was file, ___ ik te laat kwam.", ["waardoor"], "Causa.", ["v-waardoor-rel"], choices=["waardoor","waarop","waaraan"], tr="Havia trânsito, por causa do qual cheguei atrasado."),
    FE(["Het","project","waarop","ik","werk,","is","klaar."], 2, "waaraan", "werken aan → waaraan.", ["v-waaraan-rel"]),
    LI("Dat is precies het punt waarop ik doelde.", ["Dat is precies het punt waarop ik doelde"], "É precisamente o ponto a que me referia.", "doelen op.", ["v-waarop-rel"]),
    WO("O projeto em que trabalho.", ["Het","project","waaraan","ik","werk"], "Ordem.", ["v-waaraan-rel"]),
  ], diff=5, mins=6)

L(11, "Iets wat, niets wat, het mooiste wat", "Het mooiste wat ik ooit zag.",
  ["Usar wat depois de pronomes indefinidos e superlativos"],
  vocab=[X("v-iets-wat","iets wat","algo que"), X("v-niets-wat","niets wat","nada que"),
         X("v-het-mooiste-wat","het mooiste wat","a coisa mais bonita que")],
  ex=[("Is er iets wat ik kan doen?","Há alguma coisa que eu possa fazer?"),("Er is niets wat hij niet weet.","Não há nada que ele não saiba."),("Dat is het mooiste wat ik ooit heb gezien.","É a coisa mais bonita que já vi.")],
  review=["v-alles-wat","v-het-enige","v-wat-rel"],
  gram=[G("g-wat-na-iets","Wat depois de iets, niets, alles, superlativo","Depois de **iets, niets, alles, veel, weinig** e de um **superlativo neutro** (*het mooiste, het enige*), o relativo é **wat** (não *dat*): *alles **wat** je zegt*, *het enige **wat** ik wil*. Em linguagem cuidada também se vê *dat* depois de *iets/niets*, mas *wat* é o mais seguro.",
    [("Alles wat glimt, is geen goud.","Nem tudo o que brilha é ouro."),("Het enige wat telt, is gezondheid.","A única coisa que conta é a saúde.")])],
  cefr=C, exs=[
    MA([("iets wat","algo que"),("niets wat","nada que"),("het mooiste wat","o mais bonito que"),("alles wat","tudo o que")], "Wat.", ["v-iets-wat","v-niets-wat","v-het-mooiste-wat","v-alles-wat"]),
    MC("Het enige ___ ik wil, is rust.", ["*wat","die|Não.","dat|Menos aceite aqui."], "Superlativo neutro → wat.", ["v-het-enige"]),
    TR("pt-nl","Há alguma coisa que eu possa fazer?", ["Is er iets wat ik kan doen","Is er iets wat ik kan doen?","Kan ik iets doen"], "iets wat.", ["v-iets-wat"]),
    TR("pt-nl","É a coisa mais bonita que já vi.", ["Dat is het mooiste wat ik ooit heb gezien","Dat is het mooiste wat ik ooit gezien heb"], "het mooiste wat.", ["v-het-mooiste-wat"]),
    FB("Er is niets ___ hij niet weet.", ["wat"], "niets wat.", ["v-niets-wat"], choices=["wat","die","waar"], tr="Não há nada que ele não saiba."),
    FE(["Alles","die","je","zegt,","klopt."], 1, "wat", "alles wat.", ["v-alles-wat"]),
    LI("Alles wat glimt, is geen goud.", ["Alles wat glimt, is geen goud","Alles wat glimt is geen goud"], "Nem tudo o que brilha é ouro.", "Provérbio.", ["v-alles-wat"]),
    DL([("Vriend","Mijn moeder ligt in het ziekenhuis.","A minha mãe está no hospital."),("Jij","","")], ["*Wat naar. Is er iets wat ik voor je kan doen?","Het mooiste wat…|Desajustado.","Niets wat.|Frio."], "Oferecer ajuda.", ["v-iets-wat"]),
    WO("Tudo o que dizes.", ["Alles","wat","je","zegt"], "Ordem.", ["v-alles-wat"]),
  ], diff=4, mins=5)

L(12, "Wat que retoma a frase toda", "Hij kwam te laat, wat ik jammer vond.",
  ["Usar wat para comentar uma oração inteira"],
  vocab=[X("v-wat-me-opviel","wat me opviel, was…","o que me chamou a atenção foi…"), X("v-wat-ik-jammer-vind","…, wat ik jammer vind","…, o que acho uma pena")],
  ex=[("Hij kwam niet, wat ik erg jammer vond.","Ele não veio, o que achei uma grande pena."),("Wat me opviel, was hoe stil het was.","O que me chamou a atenção foi o silêncio."),("Het regende de hele week, wat niemand verwacht had.","Choveu a semana toda, o que ninguém esperava.")],
  review=["v-wat-rel","v-opvallend"],
  cefr=C, exs=[
    MA([("wat me opviel, was…","o que me chamou a atenção foi…"),("…, wat ik jammer vind","…, o que acho uma pena"),("wat (relativo)","o que"),("opvallend","notável")], "Wat frasal.", ["v-wat-me-opviel","v-wat-ik-jammer-vind","v-wat-rel","v-opvallend"]),
    MC("«Ze is geslaagd, ___ iedereen blij maakte.»", ["*wat","die|Retoma a frase toda → wat.","dat|Não."], "Retoma a oração.", ["v-wat-rel"]),
    TR("pt-nl","Ele não veio, o que achei uma pena.", ["Hij kwam niet, wat ik jammer vond","Hij is niet gekomen, wat ik jammer vond"], "wat.", ["v-wat-ik-jammer-vind"]),
    TR("pt-nl","O que me chamou a atenção foi o silêncio.", ["Wat me opviel, was de stilte","Wat mij opviel, was de stilte","Wat me opviel was de stilte"], "Construção com wat.", ["v-wat-me-opviel"]),
    FB("Het regende, ___ niemand verwacht had.", ["wat"], "Retoma a frase.", ["v-wat-rel"], choices=["wat","die","dat"], tr="Choveu, o que ninguém esperava."),
    FE(["De","trein","was","op","tijd,","die","zelden","gebeurt."], 5, "wat", "Retoma a frase toda: wat.", ["v-wat-rel"]),
    LI("Wat me het meest verbaasde, was de vriendelijkheid van de mensen.", ["Wat me het meest verbaasde, was de vriendelijkheid van de mensen","Wat me het meest verbaasde was de vriendelijkheid van de mensen"], "O que mais me surpreendeu foi a simpatia das pessoas.", "Uso.", ["v-wat-me-opviel"]),
    SW("Escreva 3 frases sobre a sua primeira semana num sítio novo usando «Wat me opviel, was…» e «…, wat ik … vond».", ["Wat me opviel, was dat iedereen fietst. Mijn buren brachten een taart, wat ik heel lief vond. Het regende elke dag, wat ik minder leuk vond."], ["wat me opviel","…, wat …","3 frases"], 20, "Produção.", ["v-wat-me-opviel"]),
    WO("O que me chamou a atenção foi…", ["Wat","me","opviel,","was"], "Ordem.", ["v-wat-me-opviel"]),
  ], diff=5, mins=5)

L(13, "Preposição + wie (pessoas)", "De vrouw aan wie ik het vroeg.",
  ["Usar preposição + wie para pessoas"],
  vocab=[X("v-aan-wie","aan wie","a quem"), X("v-voor-wie","voor wie","para quem"), X("v-van-wie","van wie","de quem")],
  ex=[("De vrouw aan wie ik de weg vroeg, was erg vriendelijk.","A mulher a quem perguntei o caminho foi muito simpática."),("De collega voor wie ik dit doe, is ziek.","O colega para quem faço isto está doente."),("De man van wie ik de fiets kocht, woont hier.","O homem de quem comprei a bicicleta vive aqui.")],
  review=["v-met-wie","v-wie-rel"],
  cefr=C, exs=[
    MA([("aan wie","a quem"),("voor wie","para quem"),("van wie","de quem"),("met wie","com quem")], "Prep + wie.", ["v-aan-wie","v-voor-wie","v-van-wie","v-met-wie"]),
    MC("Para pessoas, depois de preposição usa-se…", ["*wie","wat|Para coisas/frases.","die|Sem preposição."], "Regra.", ["v-wie-rel"]),
    MC("«De vriend ___ ik op vakantie ging»", ["*met wie","waarmee|Para coisas (coloquialmente às vezes ouve-se).","die mee|Não."], "Pessoa.", ["v-met-wie"]),
    TR("pt-nl","O colega para quem faço isto está doente.", ["De collega voor wie ik dit doe, is ziek","De collega voor wie ik dit doe is ziek"], "voor wie.", ["v-voor-wie"]),
    TR("pt-nl","O homem de quem comprei a bicicleta.", ["De man van wie ik de fiets kocht","De man van wie ik de fiets heb gekocht"], "van wie.", ["v-van-wie"]),
    FB("De vrouw ___ wie ik de weg vroeg, was aardig.", ["aan"], "vragen aan.", ["v-aan-wie"], choices=["aan","van","met"], tr="A mulher a quem perguntei o caminho foi simpática."),
    FE(["De","buurman","met","die","ik","praatte,","is","verhuisd."], 3, "wie", "Prep + pessoa: wie.", ["v-met-wie"]),
    LI("Is dat de docent van wie je zoveel geleerd hebt?", ["Is dat de docent van wie je zoveel geleerd hebt","Is dat de docent van wie je zoveel geleerd hebt?"], "É esse o professor com quem aprendeste tanto?", "van wie.", ["v-van-wie"]),
    WO("A pessoa a quem escrevi.", ["De","persoon","aan","wie","ik","schreef"], "Ordem.", ["v-aan-wie"]),
  ], diff=5, mins=5)

L(14, "Waar = onde", "De stad waar ik geboren ben.",
  ["Usar waar como relativo de lugar"],
  vocab=[N("v-geboorteplaats","geboorteplaats","terra natal|local de nascimento","de"), X("v-waar-ik-geboren-ben","waar ik geboren ben","onde nasci")],
  ex=[("Braga is de stad waar ik geboren ben.","Braga é a cidade onde nasci."),("Mijn geboorteplaats ligt in het noorden.","A minha terra natal fica no norte."),("Het café waar we elkaar ontmoetten, bestaat niet meer.","O café onde nos conhecemos já não existe.")],
  review=["v-waarin"],
  cefr=C, exs=[
    MA([("geboorteplaats","terra natal"),("waar ik geboren ben","onde nasci"),("waarin","dentro do qual"),("waar","onde")], "Lugar.", ["v-geboorteplaats","v-waar-ik-geboren-ben","v-waarin","v-waar-ik-geboren-ben"]),
    TR("pt-nl","Braga é a cidade onde nasci.", ["Braga is de stad waar ik geboren ben","Braga is de stad waar ik ben geboren"], "waar.", ["v-waar-ik-geboren-ben"]),
    TR("pt-nl","A minha terra natal fica no norte.", ["Mijn geboorteplaats ligt in het noorden"], "liggen.", ["v-geboorteplaats"]),
    MC("«Het huis waar ik woon» = «het huis ___ ik woon»", ["*waarin","waarop|Não.","waarmee|Não."], "Equivalência.", ["v-waarin"]),
    FB("Het café ___ we elkaar ontmoetten, is dicht.", ["waar"], "Lugar.", ["v-waar-ik-geboren-ben"], choices=["waar","wat","die"], tr="O café onde nos conhecemos está fechado."),
    FE(["Dat","is","de","stad","wat","ik","geboren","ben."], 4, "waar", "Lugar: waar.", ["v-waar-ik-geboren-ben"]),
    SW("Escreva 3 frases sobre a sua terra natal usando «waar».", ["Mijn geboorteplaats is Viseu. Het is een stad waar het in de zomer heel warm is. Er is een plein waar ik als kind altijd speelde."], ["waar como relativo","3 frases"], 20, "Produção.", ["v-geboorteplaats"]),
    LI("Ik ga terug naar de plek waar alles begon.", ["Ik ga terug naar de plek waar alles begon"], "Volto ao sítio onde tudo começou.", "Uso.", ["v-waar-ik-geboren-ben"]),
    WO("A cidade onde nasci.", ["De","stad","waar","ik","geboren","ben"], "Ordem.", ["v-waar-ik-geboren-ben"]),
  ], diff=4, mins=5)

L(15, "Particípio em vez de relativa", "De pas geopende bakkerij.",
  ["Reconhecer particípios usados como adjetivo em vez de relativas"],
  vocab=[X("v-pas-geopend","pas geopend","recém-aberto","adjective"), X("v-zelfgemaakt","zelfgemaakt","feito em casa|caseiro","adjective")],
  ex=[("De pas geopende bakkerij is erg populair.","A padaria recém-aberta é muito popular."),("Ze bracht zelfgemaakte soep mee.","Ela trouxe sopa feita em casa."),("Het gisteren gekochte brood is al op.","O pão comprado ontem já acabou.")],
  review=["v-betrekkelijk"],
  gram=[G("g-deelwoord-bijv","Particípio como adjetivo","Em vez de uma relativa, a escrita usa muitas vezes um **particípio** antes do nome: *de bakkerij **die pas geopend is*** → *de **pas geopende** bakkerij*. O particípio recebe **-e** como um adjetivo (exceto com *het*-palavras indefinidas: *een zelfgemaakt cadeau*).",
    [("de gestolen fiets","a bicicleta roubada"),("een goed verzorgde tuin","um jardim bem tratado")])],
  cefr=C, exs=[
    MA([("pas geopend","recém-aberto"),("zelfgemaakt","feito em casa"),("gestolen","roubado"),("betrekkelijke bijzin","oração relativa")], "Particípios.", ["v-pas-geopend","v-zelfgemaakt","v-betrekkelijk","v-pas-geopend"]),
    MC("«De fiets die gestolen is» = …", ["*de gestolen fiets","de stelen fiets|Não.","de gestolene fiets|Forma antiga."], "Particípio.", ["v-pas-geopend"]),
    TR("pt-nl","Ela trouxe sopa feita em casa.", ["Ze bracht zelfgemaakte soep mee","Zij bracht zelfgemaakte soep mee","Ze nam zelfgemaakte soep mee"], "-e: de soep.", ["v-zelfgemaakt"]),
    TR("pt-nl","A padaria recém-aberta é popular.", ["De pas geopende bakkerij is populair","De pas geopende bakkerij is erg populair"], "-e.", ["v-pas-geopend"]),
    FB("Hij gaf me een ___ cadeau.", ["zelfgemaakt"], "het cadeau, indefinido: sem -e.", ["v-zelfgemaakt"], choices=["zelfgemaakt","zelfgemaakte","zelf gemaakt"], tr="Ele deu-me um presente feito por ele."),
    FE(["De","pas","geopend","winkel","is","druk."], 2, "geopende", "de winkel → -e.", ["v-pas-geopend"]),
    MC("Este estilo (particípio antes do nome) é mais comum…", ["*na escrita formal e nas notícias","na conversa entre amigos|Menos.","em mensagens curtas|Não."], "Registo.", ["v-pas-geopend"]),
    LI("De onlangs gerenoveerde bibliotheek is weer open.", ["De onlangs gerenoveerde bibliotheek is weer open"], "A biblioteca recentemente renovada está outra vez aberta.", "Notícia.", ["v-pas-geopend"]),
    WO("O pão comprado ontem.", ["Het","gisteren","gekochte","brood"], "Ordem.", ["v-pas-geopend"]),
  ], diff=5, mins=5)

L(16, "Formal: hetgeen e datgene wat", "Datgene wat u zoekt…",
  ["Reconhecer relativos formais"],
  vocab=[X("v-hetgeen","hetgeen","o que (formal)","pronoun"), X("v-datgene-wat","datgene wat","aquilo que (formal)")],
  ex=[("Hij vertelde het niet, hetgeen mij verbaasde.","Ele não contou, o que me surpreendeu."),("Datgene wat u zoekt, vindt u op pagina 3.","Aquilo que procura encontra na página 3.")],
  review=["v-wat-rel","v-formeel"],
  cefr=C, exs=[
    MA([("hetgeen","o que (formal)"),("datgene wat","aquilo que"),("wat","o que"),("formeel","formal")], "Formal.", ["v-hetgeen","v-datgene-wat","v-wat-rel","v-formeel"]),
    MC("Equivalente simples de «hetgeen»:", ["*wat","die|Não.","waar|Não."], "Simplificar.", ["v-hetgeen"]),
    MC("Equivalente simples de «datgene wat»:", ["*wat / dat wat","die|Não.","iets|Não."], "Simplificar.", ["v-datgene-wat"]),
    TR("nl-pt","Datgene wat u zoekt, vindt u op pagina 3.", ["Aquilo que procura encontra na página 3","O que procura está na página 3"], "Formal.", ["v-datgene-wat"]),
    TR("nl-pt","Hij vertelde het niet, hetgeen mij verbaasde.", ["Ele não contou, o que me surpreendeu","Ele não o disse, o que me espantou"], "Formal.", ["v-hetgeen"]),
    FB("De prijzen stijgen, ___ tot onrust leidt.", ["hetgeen"], "Formal: retoma a frase.", ["v-hetgeen"], choices=["hetgeen","die","datgene"], tr="Os preços sobem, o que leva a inquietação."),
    MC("Num e-mail a um amigo, «hetgeen» soa…", ["*demasiado formal","natural|Não.","rude|Não."], "Registo.", ["v-hetgeen"]),
    SW("Reescreva de forma simples: «Datgene wat in de vergadering besproken is, dient vertrouwelijk te blijven.»", ["Wat in de vergadering besproken is, moet geheim blijven."], ["Sem datgene","Sem dienen"], 6, "Simplificar.", ["v-datgene-wat"]),
    LI("Hij zei niets, hetgeen veelzeggend was.", ["Hij zei niets, hetgeen veelzeggend was","Hij zei niets hetgeen veelzeggend was"], "Ele não disse nada, o que foi revelador.", "Formal.", ["v-hetgeen"]),
  ], diff=5, mins=5)

L(17, "Possessivo relativo: wiens e wier", "De schrijver wiens boek…",
  ["Reconhecer wiens e wier em textos formais"],
  vocab=[X("v-wiens","wiens","cujo (de um homem)","pronoun"), X("v-wier","wier","cujo (de uma mulher/plural)","pronoun")],
  ex=[("De schrijver wiens boek ik las, komt naar Utrecht.","O escritor cujo livro li vem a Utrecht."),("De zangeres wier stem iedereen kent…","A cantora cuja voz todos conhecem…"),("De man van wie de auto gestolen is…","O homem a quem roubaram o carro… (forma mais comum)")],
  review=["v-van-wie"],
  gram=[G("g-wiens-wier","Wiens / wier","Formais e escritos: **wiens** = cujo, quando o possuidor é um **homem** (ou *het*-palavra masculina); **wier** = cujo, quando o possuidor é uma **mulher** ou está no **plural**. Na fala, prefere-se **van wie**: *de man van wie de auto…*.",
    [("De buurman wiens hond blaft…","O vizinho cujo cão ladra…"),("De ouders wier kinderen…","Os pais cujos filhos…")])],
  cefr=C, exs=[
    MA([("wiens","cujo (homem)"),("wier","cujo (mulher/plural)"),("van wie","de quem"),("cujo","wiens/wier")], "Possessivo.", ["v-wiens","v-wier","v-van-wie","v-wiens"]),
    MC("De zangeres ___ stem iedereen kent:", ["*wier","wiens|Possuidor feminino → wier.","die|Não."], "Feminino.", ["v-wier"]),
    MC("De schrijver ___ boek ik las:", ["*wiens","wier|Masculino → wiens.","wat|Não."], "Masculino.", ["v-wiens"]),
    MC("Na conversa, o mais natural é…", ["*de man van wie de auto gestolen is","de man wiens auto gestolen is|Correto mas formal.","de man die zijn auto gestolen is|Erro comum."], "Registo.", ["v-van-wie"]),
    TR("nl-pt","De schrijver wiens boek ik las, komt naar Utrecht.", ["O escritor cujo livro li vem a Utrecht","O escritor de quem li o livro vem a Utrecht"], "wiens.", ["v-wiens"]),
    FB("De ouders ___ kinderen hier op school zitten, krijgen een brief.", ["wier"], "Plural → wier.", ["v-wier"], choices=["wier","wiens","die"], tr="Os pais cujos filhos andam nesta escola recebem uma carta."),
    FE(["De","vrouw","wiens","fiets","gestolen","is,","doet","aangifte."], 2, "wier", "Possuidor feminino: wier.", ["v-wier"]),
    LI("De kunstenaar wiens werk hier hangt, is Portugees.", ["De kunstenaar wiens werk hier hangt, is Portugees","De kunstenaar wiens werk hier hangt is Portugees"], "O artista cuja obra está aqui exposta é português.", "Formal.", ["v-wiens"]),
    WO("O vizinho cujo cão ladra.", ["De","buurman","wiens","hond","blaft"], "Ordem.", ["v-wiens"]),
  ], diff=5, mins=5)

L(18, "Definir com relativas", "Een … is iemand die…",
  ["Definir pessoas e coisas como num dicionário"],
  vocab=[X("v-iemand-die","iemand die…","alguém que…"), X("v-iets-waarmee","iets waarmee je…","algo com que se…")],
  ex=[("Een bakker is iemand die brood bakt.","Um padeiro é alguém que faz pão."),("Een schaar is iets waarmee je knipt.","Uma tesoura é algo com que se corta."),("Een bibliotheek is een plek waar je boeken leent.","Uma biblioteca é um sítio onde se requisitam livros.")],
  review=["v-omschrijven","v-kenmerk"],
  cefr=C, exs=[
    MA([("iemand die…","alguém que…"),("iets waarmee je…","algo com que se…"),("omschrijven","descrever|definir"),("kenmerk","característica")], "Definir.", ["v-iemand-die","v-iets-waarmee","v-omschrijven","v-kenmerk"]),
    MC("«Een tandarts is iemand ___ tanden behandelt.»", ["*die","wie|Sem preposição: die.","wat|Não."], "iemand die.", ["v-iemand-die"]),
    MC("«Een sleutel is iets ___ je een deur opent.»", ["*waarmee","wat|Falta a preposição.","met wie|Para pessoas."], "iets waarmee.", ["v-iets-waarmee"]),
    TR("pt-nl","Um padeiro é alguém que faz pão.", ["Een bakker is iemand die brood bakt"], "iemand die.", ["v-iemand-die"]),
    TR("pt-nl","Uma tesoura é algo com que se corta.", ["Een schaar is iets waarmee je knipt","Een schaar is iets waarmee je snijdt"], "waarmee.", ["v-iets-waarmee"]),
    FB("Een verpleegkundige is iemand ___ voor patiënten zorgt.", ["die"], "iemand die.", ["v-iemand-die"], choices=["die","wie","wat"], tr="Um enfermeiro é alguém que cuida de doentes."),
    FE(["Een","pen","is","iets","wat","je","mee","schrijft."], 4, "waar", "iets waar … mee (= waarmee).", ["v-iets-waarmee"]),
    SW("Defina três palavras como num dicionário, usando «iemand die», «iets waarmee» e «een plek waar».", ["Een kapper is iemand die haar knipt. Een paraplu is iets waarmee je droog blijft in de regen. Een station is een plek waar treinen stoppen."], ["iemand die","iets waarmee","een plek waar"], 25, "Definições.", ["v-iemand-die","v-iets-waarmee"]),
    LI("Een duizendpoot is iemand die van alles kan.", ["Een duizendpoot is iemand die van alles kan"], "Um faz-tudo é alguém que sabe fazer de tudo.", "Revisão.", ["v-iemand-die","v-duizendpoot"]),
  ], diff=4, mins=5)

L(19, "Objetos do dia a dia", "Een blikopener is iets waarmee je…",
  ["Descrever objetos pela sua função"],
  vocab=[N("v-apparaat","apparaat","aparelho","het","apparaten"), N("v-blikopener","blikopener","abre-latas","de"),
         N("v-kurkentrekker","kurkentrekker","saca-rolhas","de"), N("v-afstandsbediening","afstandsbediening","comando (à distância)","de")],
  ex=[("Een blikopener is iets waarmee je een blik opent.","Um abre-latas é algo com que se abre uma lata."),("Waar is de afstandsbediening?","Onde está o comando?"),("Dit apparaat maakt koffie.","Este aparelho faz café.")],
  review=["v-iets-waarmee","v-oplader"],
  cefr=C, exs=[
    MA([("apparaat","aparelho"),("blikopener","abre-latas"),("kurkentrekker","saca-rolhas"),("afstandsbediening","comando")], "Objetos.", ["v-apparaat","v-blikopener","v-kurkentrekker","v-afstandsbediening"]),
    AR("apparaat", "aparelho", "het", "Het apparaat.", ["v-apparaat"]),
    MC("«Iets waarmee je een fles wijn opent»:", ["*een kurkentrekker","een blikopener|Latas.","een oplader|Não."], "Função.", ["v-kurkentrekker"]),
    MC("«Iets waarmee je de tv aan- en uitzet»:", ["*een afstandsbediening","een apparaat|Vago.","een blikopener|Não."], "Função.", ["v-afstandsbediening"]),
    TR("pt-nl","Onde está o comando?", ["Waar is de afstandsbediening","Waar is de afstandsbediening?"], "afstandsbediening.", ["v-afstandsbediening"]),
    TR("pt-nl","Um abre-latas é algo com que se abre uma lata.", ["Een blikopener is iets waarmee je een blik opent","Een blikopener is iets waarmee je blikken opent"], "waarmee.", ["v-blikopener"]),
    FB("Heb je een ___? Mijn telefoon is bijna leeg.", ["oplader"], "Carregador.", ["v-oplader"], choices=["oplader","blikopener","apparaat"], tr="Tens um carregador? O meu telemóvel está quase sem bateria."),
    FE(["De","apparaat","is","kapot."], 0, "Het", "het apparaat.", ["v-apparaat"]),
    LI("Ik kan de kurkentrekker nergens vinden.", ["Ik kan de kurkentrekker nergens vinden"], "Não encontro o saca-rolhas em lado nenhum.", "Uso.", ["v-kurkentrekker"]),
  ], diff=3, mins=5)

L(20, "Na cozinha: para que serve?", "Een vergiet gebruik je om…",
  ["Descrever utensílios de cozinha com relativas e om … te"],
  vocab=[N("v-vergiet","vergiet","escorredor","het","vergieten"), N("v-schaar","schaar","tesoura","de","scharen"),
         N("v-garde","garde","batedor de varas","de")],
  ex=[("Een vergiet gebruik je om pasta af te gieten.","Um escorredor usa-se para escorrer massa."),("Met een schaar knip je papier.","Com uma tesoura cortas papel."),("Klop de eieren met een garde.","Bate os ovos com um batedor.")],
  review=["v-iets-waarmee","v-keuken"],
  cefr=C, exs=[
    MA([("vergiet","escorredor"),("schaar","tesoura"),("garde","batedor"),("keuken","cozinha")], "Cozinha.", ["v-vergiet","v-schaar","v-garde","v-keuken"]),
    AR("vergiet", "escorredor", "het", "Het vergiet.", ["v-vergiet"]),
    MC("«Iets waarmee je eieren klopt»:", ["*een garde","een vergiet|Não.","een schaar|Não."], "Função.", ["v-garde"]),
    TR("pt-nl","Um escorredor usa-se para escorrer massa.", ["Een vergiet gebruik je om pasta af te gieten","Je gebruikt een vergiet om pasta af te gieten"], "om … te.", ["v-vergiet"]),
    TR("pt-nl","Bate os ovos com um batedor.", ["Klop de eieren met een garde"], "Imperativo.", ["v-garde"]),
    FB("Mag ik even de ___? Ik wil dit lint doorknippen.", ["schaar"], "Tesoura.", ["v-schaar"], choices=["schaar","garde","vergiet"], tr="Dás-me a tesoura? Quero cortar esta fita."),
    FE(["De","vergiet","staat","in","de","kast."], 0, "Het", "het vergiet.", ["v-vergiet"]),
    LI("Giet de aardappelen af in het vergiet.", ["Giet de aardappelen af in het vergiet"], "Escorre as batatas no escorredor.", "Receita.", ["v-vergiet"]),
    WO("Com uma tesoura cortas papel.", ["Met","een","schaar","knip","je","papier"], "Inversão.", ["v-schaar"]),
  ], diff=3, mins=5)

L(21, "Invenções neerlandesas", "De uitvinder die de microscoop verbeterde.",
  ["Descrever invenções e inventores com relativas"],
  vocab=[N("v-uitvinding","uitvinding","invenção","de","uitvindingen"), N("v-uitvinder","uitvinder","inventor","de","uitvinders")],
  ex=[("Antoni van Leeuwenhoek was een onderzoeker die met zelfgemaakte microscopen bacteriën zag.","Antoni van Leeuwenhoek foi um investigador que viu bactérias com microscópios feitos por ele."),("De bluetooth-technologie is een uitvinding waaraan ook Nederlandse ingenieurs werkten.","A tecnologia bluetooth é uma invenção na qual também trabalharam engenheiros neerlandeses.")],
  review=["v-zelfgemaakt","v-waaraan-rel","v-ontdekken"],
  cefr=C, exs=[
    MA([("uitvinding","invenção"),("uitvinder","inventor"),("ontdekken","descobrir"),("zelfgemaakt","feito pelo próprio")], "Invenções.", ["v-uitvinding","v-uitvinder","v-ontdekken","v-zelfgemaakt"]),
    MC("«Uitvinden» vs. «ontdekken»:", ["*criar algo novo vs. encontrar algo que já existia","iguais|Não.","ontdekken = criar|É o contrário."], "Nuance.", ["v-uitvinding","v-ontdekken"]),
    CO("text","Een bekende onderzoeker","Antoni van Leeuwenhoek (1632–1723) was een lakenhandelaar uit Delft die in zijn vrije tijd lenzen sleep. Met zijn zelfgemaakte microscopen zag hij als een van de eersten piepkleine levende wezens, die hij «diertjes» noemde. Hij wordt daarom vaak de vader van de microbiologie genoemd.",
       [("Qual era a profissão dele?", ["*Comerciante de tecidos","Médico","Professor"]),("O que fazia no tempo livre?", ["*Polia lentes","Pintava","Navegava"]),("Porque é conhecido?", ["*Pai da microbiologia","Inventou o telescópio","Fundou Delft"])],
       "Texto factual (história da ciência).", ["v-uitvinder","v-zelfgemaakt"]),
    TR("pt-nl","Foi um investigador que viu bactérias.", ["Hij was een onderzoeker die bacteriën zag","Het was een onderzoeker die bacteriën zag"], "die.", ["v-uitvinder"]),
    FB("Welke ___ vind jij het belangrijkst: het wiel of internet?", ["uitvinding"], "Invenção.", ["v-uitvinding"], choices=["uitvinding","uitvinder","ontdekking"], tr="Que invenção achas mais importante: a roda ou a internet?"),
    FE(["Hij","was","een","uitvinder","wie","veel","patenten","had."], 4, "die", "Sem preposição: die.", ["v-uitvinder"]),
    SW("Escreva 3 frases sobre uma invenção que usa todos os dias, com pelo menos duas relativas.", ["De fiets is een uitvinding die ik elke dag gebruik. Het is een vervoermiddel waarmee je snel en goedkoop door de stad komt. De uitvinder, die in de negentiende eeuw leefde, kon niet weten hoe populair hij zou worden."], ["2 relativas","Invenção concreta"], 30, "Produção.", ["v-uitvinding"]),
    LI("Het is een uitvinding waar we niet meer zonder kunnen.", ["Het is een uitvinding waar we niet meer zonder kunnen"], "É uma invenção sem a qual já não conseguimos viver.", "waar … zonder.", ["v-uitvinding"]),
  ], diff=4, mins=6)

L(22, "Relativa ou «dat» conjunção?", "Het feit dat… / Het boek dat…",
  ["Distinguir dat relativo de dat conjunção"],
  vocab=[X("v-het-feit-dat","het feit dat…","o facto de…")],
  ex=[("Het feit dat hij niet belde, maakte me ongerust.","O facto de ele não ter ligado deixou-me preocupado."),("Het boek dat ik las, was spannend.","O livro que li era emocionante."),("Ik weet dat het boek spannend is.","Sei que o livro é emocionante.")],
  review=["v-dat-rel"],
  gram=[G("g-dat-twee","Dois «dat»","**Dat relativo** refere-se a um nome *het* e faz parte da oração: *het boek **dat** ik las* (o livro que li — «dat» é o objeto). **Dat conjunção** introduz uma oração completa: *Ik weet **dat** het boek goed is.* Truque: se puderes trocar por *welk* (o qual), é relativo; com *de*-palavras o relativo seria *die*.",
    [("Het huis dat we kochten…","A casa que comprámos… (relativo)"),("Het nieuws dat de school sluit…","A notícia de que a escola fecha… (conjunção)")])],
  cefr=C, exs=[
    MA([("het feit dat…","o facto de…"),("dat (relativo)","que (refere um nome het)"),("dat (conjunção)","que (introduz oração)"),("die (relativo)","que (nome de)")], "Dois dat.", ["v-het-feit-dat","v-dat-rel","v-het-feit-dat","v-die-rel"]),
    MC("«Het boek dat ik las» — «dat» é…", ["*relativo","conjunção|Refere-se a «het boek».","demonstrativo|Não."], "Identificar.", ["v-dat-rel"]),
    MC("«Ik hoop dat je komt» — «dat» é…", ["*conjunção","relativo|Não há nome antes.","demonstrativo|Não."], "Identificar.", ["v-het-feit-dat"]),
    MC("«Het nieuws dat de school sluit» — «dat» é…", ["*conjunção (apresenta o conteúdo da notícia)","relativo|A escola não é objeto de «nieuws».","pronome|Não."], "Caso difícil.", ["v-het-feit-dat"]),
    TR("pt-nl","O facto de ele não ter ligado preocupou-me.", ["Het feit dat hij niet belde, maakte me ongerust","Het feit dat hij niet heeft gebeld, maakte me ongerust"], "het feit dat.", ["v-het-feit-dat"]),
    FB("De film ___ we gisteren zagen, was saai.", ["die"], "de film → die.", ["v-die-rel"], choices=["die","dat","wat"], tr="O filme que vimos ontem era aborrecido."),
    FE(["Het","boek","die","je","me","gaf,","is","prachtig."], 2, "dat", "het boek → dat.", ["v-dat-rel"]),
    LI("Het feit dat je het probeert, is al heel wat.", ["Het feit dat je het probeert, is al heel wat","Het feit dat je het probeert is al heel wat"], "O facto de tentares já é muito.", "Uso.", ["v-het-feit-dat"]),
    WO("O livro que li.", ["Het","boek","dat","ik","las"], "Ordem.", ["v-dat-rel"]),
  ], diff=5, mins=6)

L(23, "Vírgulas e relativas explicativas", "Mijn zus, die in Gent woont, …",
  ["Pontuar relativas explicativas e restritivas"],
  vocab=[X("v-tussen-kommas","tussen komma's","entre vírgulas")],
  ex=[("Mijn zus, die in Gent woont, komt morgen.","A minha irmã, que vive em Gent, vem amanhã."),("De studenten die geslaagd zijn, krijgen een diploma.","Os estudantes que passaram recebem um diploma.")],
  review=["v-beperkend","v-uitbreidend","v-komma"],
  cefr=C, exs=[
    MA([("tussen komma's","entre vírgulas"),("beperkend","restritiva"),("uitbreidend","explicativa"),("komma","vírgula")], "Pontuação.", ["v-tussen-kommas","v-beperkend","v-uitbreidend","v-komma"]),
    MC("«Mijn moeder, die in Porto woont, …» — a relativa é…", ["*explicativa (só tenho uma mãe)","restritiva|Não há outras mães.","um erro|Não."], "Explicativa.", ["v-uitbreidend"]),
    MC("«De studenten die geslaagd zijn, krijgen een diploma.» Sem vírgulas antes de «die» porque…", ["*só os que passaram recebem (restritiva)","todos passaram|Isso seria com vírgulas.","é um erro|Não."], "Restritiva.", ["v-beperkend"]),
    MC("Com vírgulas: «De studenten, die geslaagd zijn, krijgen een diploma.» significa…", ["*todos os estudantes passaram e recebem","só alguns recebem|Isso é sem vírgulas.","ninguém recebe|Não."], "Diferença de sentido.", ["v-uitbreidend"]),
    TR("pt-nl","A minha irmã, que vive em Gent, vem amanhã.", ["Mijn zus, die in Gent woont, komt morgen"], "Explicativa.", ["v-tussen-kommas"]),
    FB("Een explicativa staat ___ komma's.", ["tussen"], "Expressão.", ["v-tussen-kommas"], choices=["tussen","met","zonder"], tr="Uma explicativa fica entre vírgulas."),
    LI("Amsterdam, dat de hoofdstad is, is niet de regeringszetel.", ["Amsterdam, dat de hoofdstad is, is niet de regeringszetel","Amsterdam dat de hoofdstad is is niet de regeringszetel"], "Amesterdão, que é a capital, não é a sede do governo.", "Facto.", ["v-tussen-kommas"]),
    SW("Escreva duas frases sobre a sua família: uma com relativa explicativa (com vírgulas) e uma com restritiva (sem vírgulas).", ["Mijn vader, die gepensioneerd is, woont in Coimbra. De neven die in Nederland wonen, zie ik vaak."], ["Explicativa com vírgulas","Restritiva sem vírgulas"], 20, "Produção.", ["v-tussen-kommas"]),
  ], diff=5, mins=6)

L(24, "Tipos de pessoas", "Het type mens dat…",
  ["Descrever pessoas e categorias com relativas"],
  vocab=[X("v-het-type-mens","het type mens dat…","o tipo de pessoa que…"), X("v-het-soort","het soort … dat","o tipo de … que")],
  ex=[("Hij is het type mens dat altijd helpt.","Ele é o tipo de pessoa que ajuda sempre."),("Dat is het soort film dat ik graag zie.","É o tipo de filme que gosto de ver.")],
  review=["v-iemand-die","v-kenmerk"],
  cefr=C, exs=[
    MA([("het type mens dat…","o tipo de pessoa que…"),("het soort … dat","o tipo de … que"),("iemand die…","alguém que…"),("kenmerk","característica")], "Tipos.", ["v-het-type-mens","v-het-soort","v-iemand-die","v-kenmerk"]),
    MC("«Het type mens ___ altijd te laat komt.»", ["*dat","die|«het type» é het-palavra.","wat|Não."], "Concordância com «het type».", ["v-het-type-mens"]),
    TR("pt-nl","Ele é o tipo de pessoa que ajuda sempre.", ["Hij is het type mens dat altijd helpt","Hij is het soort mens dat altijd helpt"], "dat.", ["v-het-type-mens"]),
    TR("pt-nl","É o tipo de filme que gosto de ver.", ["Dat is het soort film dat ik graag zie","Dat is het soort film dat ik graag kijk"], "dat.", ["v-het-soort"]),
    FB("Zij is het soort collega ___ je altijd kunt vertrouwen.", ["dat"], "Concordância com «het soort» (coloquialmente também se ouve «die»).", ["v-het-soort"], choices=["dat","wat","waar"], tr="Ela é o tipo de colega em quem podes sempre confiar."),
    SW("Descreva-se a si mesmo em 3 frases: «Ik ben het type mens dat…», «Ik ben iemand die…», «Ik hou van het soort … dat…».", ["Ik ben het type mens dat vroeg opstaat. Ik ben iemand die graag nieuwe talen leert. Ik hou van het soort muziek dat je rustig maakt."], ["3 estruturas","Concordância"], 25, "Autorretrato.", ["v-het-type-mens","v-het-soort"]),
    LI("Ik ben niet het type mens dat snel opgeeft.", ["Ik ben niet het type mens dat snel opgeeft"], "Não sou o tipo de pessoa que desiste facilmente.", "Uso.", ["v-het-type-mens"]),
    WO("O tipo de pessoa que ajuda.", ["Het","type","mens","dat","helpt"], "Ordem.", ["v-het-type-mens"]),
  ], diff=4, mins=5)

L(25, "Prática: adivinhas", "Raad eens wat het is!",
  ["Usar relativas para criar e resolver adivinhas"],
  vocab=[N("v-raadsel","raadsel","adivinha|enigma","het","raadsels")],
  ex=[("Ik heb een raadsel voor je.","Tenho uma adivinha para ti.")],
  review=["v-iemand-die","v-iets-waarmee","v-waaraan-rel","v-iets-wat","v-wat-me-opviel","v-aan-wie","v-waar-ik-geboren-ben","v-het-feit-dat"],
  cefr=C, exs=[
    AR("raadsel", "adivinha", "het", "Het raadsel.", ["v-raadsel"]),
    MC("Raadsel: «Het is iets waarmee je door de regen fietst zonder nat te worden, maar wat je vaak vergeet.»", ["*een regenjas / poncho","een paraplu|Difícil a pedalar…","een schaar|Não."], "Adivinha.", ["v-iets-waarmee"]),
    MC("Raadsel: «Het is iemand die je haar knipt.»", ["*een kapper","een bakker|Não.","een tandarts|Não."], "Adivinha.", ["v-iemand-die"]),
    MC("Raadsel: «Het is een plek waar je treinen ziet en kaartjes koopt.»", ["*een station","een bibliotheek|Não.","een haven|Barcos."], "Adivinha.", ["v-waar-ik-geboren-ben"]),
    FB("Het is het enige ___ ik altijd bij me heb: mijn telefoon.", ["wat"], "Revisão.", ["v-iets-wat"], choices=["wat","dat","die"], tr="É a única coisa que tenho sempre comigo: o meu telemóvel."),
    FE(["De","collega","aan","die","ik","het","vroeg,","wist","het","niet."], 3, "wie", "Revisão: prep + wie.", ["v-aan-wie"]),
    TR("pt-nl","Tenho uma adivinha para ti.", ["Ik heb een raadsel voor je","Ik heb een raadsel voor jou"], "raadsel.", ["v-raadsel"]),
    SW("Invente duas adivinhas com relativas (uma de uma pessoa, uma de um objeto) e dê a solução.", ["1. Het is iemand die brieven en pakketjes bezorgt. (een postbode)\n2. Het is iets waarmee je de deur opent, en wat je altijd kwijt bent. (een sleutel)"], ["Relativa de pessoa","Relativa de objeto","Solução"], 30, "Adivinhas.", ["v-raadsel"]),
  ], diff=4, mins=6)

W()
