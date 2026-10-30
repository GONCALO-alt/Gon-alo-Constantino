import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u08")
C = "B2"
# Lições de aprofundamento (10–29): provérbios e expressões avançadas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

import json, glob
_PT={}
for _f in glob.glob(os.path.join(os.path.dirname(__file__),'..','..','..','content','lessons','*.json')):
    for _l in json.load(open(_f))['lessons']:
        for _v in _l['newVocabulary']: _PT[_v['id']]=_v['pt'][0]

def P(n, title, desc, a, b, ex, review, mcs, tr, fb, fe, li, sw=None, diff=4):
    """Lição de expressões: a, b = (id, nl, pt, literal, explicação)."""
    vocab=[X(a[0],a[1],a[2]), X(b[0],b[1],b[2])]
    exs=[
      MA([(a[1],a[2].split('|')[0]),(b[1],b[2].split('|')[0])]+[(r[1],_PT.get(r[0],r[1])) for r in review[:2]], "Expressões.", [a[0],b[0]]+[r[0] for r in review[:2]]),
      EX(a[1], a[3], "O que significa?", ["*"+a[2].split('|')[0], a[4][0], a[4][1]], "Sentido figurado.", [a[0]]),
      EX(b[1], b[3], "O que significa?", ["*"+b[2].split('|')[0], b[4][0], b[4][1]], "Sentido figurado.", [b[0]]),
    ]+mcs+[tr, fb, fe, li]+([sw] if sw else [])
    L(n, title, desc, ["Perceber e usar expressões e provérbios"], vocab=vocab, ex=ex, review=[r[0] for r in review], cefr=C, exs=exs, diff=diff, mins=5)

P(10, "Franqueza e pele grossa", "Het hart op de tong hebben.",
  ("v-hart-op-de-tong","het hart op de tong hebben","dizer tudo o que pensa|ser muito franco","ter o coração na língua",["ser tímido|Não.","estar doente|Literal."]),
  ("v-dikke-huid","een dikke huid hebben","ter pele grossa (não se ofender facilmente)","ter uma pele grossa",["ter frio|Literal.","ser gordo|Literal."]),
  [("Ze heeft het hart op de tong: je weet altijd wat ze denkt.","Ela não tem papas na língua: sabes sempre o que pensa."),("Als politicus heb je een dikke huid nodig.","Como político precisas de pele grossa.")],
  [("v-geen-doekjes","er geen doekjes om winden"),("v-recht-door-zee","recht door zee")],
  [MC("Alguém que «het hart op de tong heeft»…", ["*diz logo o que sente e pensa","esconde tudo|É o contrário.","fala pouco|Não."], "Sentido.", ["v-hart-op-de-tong"])],
  TR("pt-nl","Como político precisas de pele grossa.", ["Als politicus heb je een dikke huid nodig"], "nodig hebben.", ["v-dikke-huid"]),
  FB("Mijn oma heeft het hart op de ___.", ["tong"], "Expressão.", ["v-hart-op-de-tong"], choices=["tong","mond","hand"], tr="A minha avó não tem papas na língua."),
  FE(["Je","heeft","een","dikke","huid","nodig."], 1, "hebt", "je: hebt.", ["v-dikke-huid"]),
  LI("Gelukkig heb ik een dikke huid; kritiek raakt me niet snel.", ["Gelukkig heb ik een dikke huid; kritiek raakt me niet snel","Gelukkig heb ik een dikke huid, kritiek raakt me niet snel"], "Felizmente tenho pele grossa; as críticas não me afetam facilmente.", "Uso.", ["v-dikke-huid"]))

P(11, "Aceitar e o tempo", "Iets voor lief nemen.",
  ("v-voor-lief-nemen","iets voor lief nemen","aceitar algo (com resignação)","tomar algo por querido",["amar alguém|Literal.","recusar|É o contrário."]),
  ("v-de-tijd-vliegt","de tijd vliegt","o tempo voa","o tempo voa",["o tempo para|Não.","há pouco tempo|Não exatamente."]),
  [("Het lawaai van de trein neem ik voor lief: de huur is laag.","Aceito o barulho do comboio: a renda é baixa."),("Wat vliegt de tijd! Je bent al twee jaar hier.","Como o tempo voa! Já estás cá há dois anos.")],
  [("v-nou-eenmaal","nou eenmaal"),("v-voor-je-het-weet","voor je het weet")],
  [MC("«Ik neem de lange reistijd voor lief» significa…", ["*aceito a longa viagem (vale a pena)","adoro viajar|Não exatamente.","recuso a viagem|Não."], "Sentido.", ["v-voor-lief-nemen"])],
  TR("pt-nl","Como o tempo voa!", ["Wat vliegt de tijd","Wat vliegt de tijd!","De tijd vliegt"], "Exclamação.", ["v-de-tijd-vliegt"]),
  FB("Voor zo'n mooi uitzicht neem ik de trappen graag voor ___.", ["lief"], "Expressão.", ["v-voor-lief-nemen"], choices=["lief","liefde","goed"], tr="Por uma vista tão bonita aceito com gosto as escadas."),
  FE(["De","tijd","vliegen","als","je","plezier","hebt."], 2, "vliegt", "Singular: vliegt.", ["v-de-tijd-vliegt"]),
  LI("De tijd vliegt als je het naar je zin hebt.", ["De tijd vliegt als je het naar je zin hebt"], "O tempo voa quando te estás a divertir.", "Provérbio.", ["v-de-tijd-vliegt"]))

P(12, "Ser esperto", "Bij de pinken zijn.",
  ("v-bij-de-pinken","bij de pinken zijn","ser esperto|estar atento","estar ao pé dos dedos mindinhos",["ter dores nas mãos|Literal.","ser distraído|É o contrário."]),
  ("v-kaas-van-het-brood","zich de kaas niet van het brood laten eten","não se deixar passar a perna","não deixar que lhe comam o queijo do pão",["não gostar de queijo|Literal.","ser generoso|Não."]),
  [("Die jongen is goed bij de pinken: hij snapt alles meteen.","Aquele rapaz é muito esperto: percebe tudo logo."),("In de onderhandeling liet ze zich de kaas niet van het brood eten.","Na negociação não se deixou passar a perna.")],
  [("v-onderhandelen","onderhandelen"),("v-afdingen","afdingen")],
  [MC("Numa negociação dura, alguém que «laat zich de kaas niet van het brood eten»…", ["*defende bem os seus interesses","cede em tudo|É o contrário.","sai a meio|Não."], "Sentido.", ["v-kaas-van-het-brood"])],
  TR("pt-nl","Aquele rapaz é muito esperto.", ["Die jongen is goed bij de pinken","Die jongen is erg bij de pinken"], "Expressão.", ["v-bij-de-pinken"]),
  FB("Ze laat zich de kaas niet van het ___ eten.", ["brood"], "Expressão.", ["v-kaas-van-het-brood"], choices=["brood","bord","mes"], tr="Ela não se deixa passar a perna."),
  FE(["Hij","zijn","goed","bij","de","pinken."], 1, "is", "Singular: is.", ["v-bij-de-pinken"]),
  LI("Wees bij de pinken: lees de kleine lettertjes.", ["Wees bij de pinken: lees de kleine lettertjes","Wees bij de pinken, lees de kleine lettertjes"], "Está atento: lê as letras pequeninas.", "Conselho.", ["v-bij-de-pinken"]))

P(13, "Despachar alguém", "Met een kluitje in het riet sturen.",
  ("v-kluitje-in-het-riet","iemand met een kluitje in het riet sturen","despachar alguém com uma desculpa","mandar alguém para o canavial com um torrão",["oferecer flores|Não.","ajudar a sério|É o contrário."]),
  ("v-pontius-naar-pilatus","van Pontius naar Pilatus gestuurd worden","andar de Herodes para Pilatos","ser mandado de Pôncio para Pilatos",["viajar pela Bíblia|Literal.","ser bem atendido|Não."]),
  [("De klantenservice stuurde me met een kluitje in het riet.","O apoio ao cliente despachou-me com uma desculpa."),("Ik werd van Pontius naar Pilatus gestuurd en niemand kon me helpen.","Andei de Herodes para Pilatos e ninguém me conseguiu ajudar.")],
  [("v-pontius-pilatus","van het kastje naar de muur"),("v-klantenservice","klantenservice")],
  [MC("«Van Pontius naar Pilatus» é sinónimo de…", ["*van het kastje naar de muur","eind goed, al goed|Não.","koek en ei|Não."], "Sinónimo.", ["v-pontius-naar-pilatus"])],
  TR("pt-nl","Despacharam-me com uma desculpa.", ["Ze stuurden me met een kluitje in het riet","Ik werd met een kluitje in het riet gestuurd"], "Expressão.", ["v-kluitje-in-het-riet"]),
  FB("Ik werd van Pontius naar ___ gestuurd.", ["Pilatus"], "Expressão.", ["v-pontius-naar-pilatus"], choices=["Pilatus","Herodes","Rome"], tr="Andei de Herodes para Pilatos."),
  FE(["Ze","stuurde","me","met","een","kluitje","in","de","riet."], 7, "het", "het riet.", ["v-kluitje-in-het-riet"]),
  LI("Laat je niet met een kluitje in het riet sturen; vraag om een concrete oplossing.", ["Laat je niet met een kluitje in het riet sturen; vraag om een concrete oplossing","Laat je niet met een kluitje in het riet sturen, vraag om een concrete oplossing"], "Não te deixes despachar; pede uma solução concreta.", "Conselho.", ["v-kluitje-in-het-riet"]))

P(14, "Assumir as consequências", "Wie A zegt, moet ook B zeggen.",
  ("v-wie-a-zegt","wie A zegt, moet ook B zeggen","quem começa tem de ir até ao fim","quem diz A tem de dizer B",["aprender o alfabeto|Literal.","desistir a meio|É o contrário."]),
  ("v-billen-brandt","wie zijn billen brandt, moet op de blaren zitten","quem as faz, paga-as","quem queima o rabo tem de se sentar nas bolhas",["cuidado com o fogo|Literal.","há sempre perdão|Não."]),
  [("Je hebt ja gezegd tegen het project: wie A zegt, moet ook B zeggen.","Disseste sim ao projeto: agora tens de ir até ao fim."),("Hij gokte zijn geld weg; wie zijn billen brandt, moet op de blaren zitten.","Perdeu o dinheiro no jogo; quem as faz, paga-as.")],
  [("v-boontje-komt","boontje komt om zijn loontje"),("v-verantwoordelijkheid","verantwoordelijkheid")],
  [MC("«Wie zijn billen brandt…» e «boontje komt om zijn loontje» falam ambos de…", ["*consequências merecidas","sorte|Não.","comida|Literal."], "Tema.", ["v-billen-brandt"])],
  TR("pt-nl","Quem começa tem de ir até ao fim.", ["Wie A zegt, moet ook B zeggen"], "Provérbio.", ["v-wie-a-zegt"]),
  FB("Wie zijn billen brandt, moet op de ___ zitten.", ["blaren"], "Provérbio.", ["v-billen-brandt"], choices=["blaren","stoel","vingers"], tr="Quem as faz, paga-as."),
  FE(["Wie","A","zegt,","moeten","ook","B","zeggen."], 3, "moet", "Wie = singular: moet.", ["v-wie-a-zegt"]),
  LI("Je hebt het zelf gewild; wie A zegt, moet ook B zeggen.", ["Je hebt het zelf gewild; wie A zegt, moet ook B zeggen","Je hebt het zelf gewild, wie A zegt moet ook B zeggen"], "Foste tu que quiseste; agora vai até ao fim.", "Uso.", ["v-wie-a-zegt"]))

P(15, "Vizinhos e velhos amores", "Beter een goede buur dan een verre vriend.",
  ("v-goede-buur","beter een goede buur dan een verre vriend","mais vale um bom vizinho do que um amigo distante","melhor um bom vizinho do que um amigo longe",["os vizinhos são chatos|Não.","os amigos não importam|Exagero."]),
  ("v-oude-liefde","oude liefde roest niet","amor antigo não enferruja","amor velho não ganha ferrugem",["o amor acaba|É o contrário.","o metal é forte|Literal."]),
  [("Toen ik ziek was, deed mijn buurvrouw boodschappen: beter een goede buur dan een verre vriend.","Quando estive doente, a vizinha fez-me as compras: mais vale um bom vizinho do que um amigo distante."),("Na twintig jaar zijn ze weer samen: oude liefde roest niet.","Ao fim de vinte anos voltaram a estar juntos: amor antigo não enferruja.")],
  [("v-buren","buren"),("v-vriendschap","vriendschap")],
  [MC("Quando se diz «oude liefde roest niet»?", ["*quando um amor ou paixão antiga regressa","quando alguém se divorcia|Não.","quando algo enferruja|Literal."], "Uso.", ["v-oude-liefde"])],
  TR("pt-nl","Amor antigo não enferruja.", ["Oude liefde roest niet"], "Provérbio.", ["v-oude-liefde"]),
  FB("Beter een goede ___ dan een verre vriend.", ["buur"], "Provérbio.", ["v-goede-buur"], choices=["buur","vriend","collega"], tr="Mais vale um bom vizinho do que um amigo distante."),
  FE(["Oude","liefde","roesten","niet."], 2, "roest", "Singular: roest.", ["v-oude-liefde"]),
  LI("Hij speelt na dertig jaar weer gitaar; oude liefde roest niet.", ["Hij speelt na dertig jaar weer gitaar; oude liefde roest niet","Hij speelt na dertig jaar weer gitaar, oude liefde roest niet"], "Ao fim de trinta anos volta a tocar guitarra; amor antigo não enferruja.", "Uso figurado.", ["v-oude-liefde"]))

P(16, "Pressa e finais", "Haastige spoed is zelden goed.",
  ("v-haastige-spoed","haastige spoed is zelden goed","depressa e bem, há pouco quem","pressa apressada raramente é boa",["sê rápido|É o contrário.","o comboio é lento|Não."]),
  ("v-eind-goed-al-goed","eind goed, al goed","bem está o que bem acaba","fim bom, tudo bom",["começar bem é tudo|Não.","acabou mal|Não."]),
  [("Lees het contract rustig; haastige spoed is zelden goed.","Lê o contrato com calma; depressa e bem há pouco quem."),("We waren verdwaald, maar kwamen toch op tijd: eind goed, al goed.","Perdemo-nos, mas chegámos a tempo: bem está o que bem acaba.")],
  [("v-met-een-sisser","met een sisser aflopen"),("v-op-de-valreep","op de valreep")],
  [MC("Contexto ideal para «eind goed, al goed»:", ["*depois de problemas, tudo acaba bem","antes de começar|Não.","quando corre mal|Não."], "Uso.", ["v-eind-goed-al-goed"])],
  TR("pt-nl","Bem está o que bem acaba.", ["Eind goed, al goed","Eind goed al goed"], "Provérbio.", ["v-eind-goed-al-goed"]),
  FB("Haastige ___ is zelden goed.", ["spoed"], "Provérbio.", ["v-haastige-spoed"], choices=["spoed","haast","tijd"], tr="Depressa e bem há pouco quem."),
  FE(["Haastige","spoed","zijn","zelden","goed."], 2, "is", "Singular: is.", ["v-haastige-spoed"]),
  LI("Na alle stress was het feest een succes: eind goed, al goed.", ["Na alle stress was het feest een succes: eind goed, al goed","Na alle stress was het feest een succes, eind goed al goed"], "Depois de todo o stress, a festa foi um êxito: bem está o que bem acaba.", "Uso.", ["v-eind-goed-al-goed"]))

P(17, "Consolar", "Gedeelde smart is halve smart.",
  ("v-gedeelde-smart","gedeelde smart is halve smart","dor partilhada é meia dor","dor partilhada é meia dor",["não fales dos problemas|É o contrário.","a dor duplica|Não."]),
  ("v-achter-de-wolken","achter de wolken schijnt de zon","por trás das nuvens brilha o sol (há esperança)","por trás das nuvens brilha o sol",["vai chover|Literal.","o sol é quente|Literal."]),
  [("Vertel het me maar; gedeelde smart is halve smart.","Conta-me; dor partilhada é meia dor."),("Het is nu zwaar, maar achter de wolken schijnt de zon.","Agora está difícil, mas depois da tempestade vem a bonança.")],
  [("v-na-regen-zonneschijn","na regen komt zonneschijn"),("v-sterkte","sterkte!")],
  [MC("«Achter de wolken schijnt de zon» é semelhante a…", ["*na regen komt zonneschijn","oude liefde roest niet|Não.","wie A zegt…|Não."], "Sinónimo.", ["v-achter-de-wolken"])],
  TR("pt-nl","Dor partilhada é meia dor.", ["Gedeelde smart is halve smart"], "Provérbio.", ["v-gedeelde-smart"]),
  FB("Achter de wolken schijnt de ___.", ["zon"], "Provérbio.", ["v-achter-de-wolken"], choices=["zon","maan","regen"], tr="Por trás das nuvens brilha o sol."),
  FE(["Gedeelde","smart","zijn","halve","smart."], 2, "is", "Singular: is.", ["v-gedeelde-smart"]),
  LI("Kom even praten; gedeelde smart is halve smart.", ["Kom even praten; gedeelde smart is halve smart","Kom even praten, gedeelde smart is halve smart"], "Vem conversar; dor partilhada é meia dor.", "Consolar.", ["v-gedeelde-smart"]))

P(18, "Desconfiança e mentira", "Al is de leugen nog zo snel…",
  ("v-zoals-de-waard","zoals de waard is, vertrouwt hij zijn gasten","cada um julga os outros por si","como o estalajadeiro é, assim confia nos hóspedes",["os hoteleiros são simpáticos|Literal.","confia em toda a gente|Não."]),
  ("v-leugen-snel","al is de leugen nog zo snel, de waarheid achterhaalt haar wel","a mentira tem perna curta","por mais rápida que seja a mentira, a verdade apanha-a",["mentir compensa|Não.","a verdade é lenta|Literal."]),
  [("Hij denkt dat iedereen liegt; zoals de waard is, vertrouwt hij zijn gasten.","Ele acha que toda a gente mente; cada um julga os outros por si."),("Het bedrog kwam uit: al is de leugen nog zo snel, de waarheid achterhaalt haar wel.","A fraude foi descoberta: a mentira tem perna curta.")],
  [("v-door-de-mand-vallen","door de mand vallen"),("v-aap-uit-de-mouw","nu komt de aap uit de mouw")],
  [MC("Alguém desonesto que desconfia de todos é exemplo de…", ["*zoals de waard is, vertrouwt hij zijn gasten","gedeelde smart|Não.","eind goed, al goed|Não."], "Uso.", ["v-zoals-de-waard"])],
  TR("pt-nl","A mentira tem perna curta.", ["Al is de leugen nog zo snel, de waarheid achterhaalt haar wel"], "Provérbio.", ["v-leugen-snel"]),
  FB("Zoals de ___ is, vertrouwt hij zijn gasten.", ["waard"], "Provérbio.", ["v-zoals-de-waard"], choices=["waard","gast","kok"], tr="Cada um julga os outros por si."),
  FE(["De","waarheid","achterhalen","haar","wel."], 2, "achterhaalt", "Singular: achterhaalt.", ["v-leugen-snel"]),
  LI("Uiteindelijk viel hij toch door de mand.", ["Uiteindelijk viel hij toch door de mand"], "No fim acabou desmascarado.", "Revisão.", ["v-door-de-mand-vallen"]))

P(19, "Silêncio e desespero", "Spreken is zilver, zwijgen is goud.",
  ("v-zwijgen-is-goud","spreken is zilver, zwijgen is goud","a palavra é de prata, o silêncio é de ouro","falar é prata, calar é ouro",["fala sempre|É o contrário.","o ouro é caro|Literal."]),
  ("v-kat-in-het-nauw","een kat in het nauw maakt rare sprongen","quem está encurralado faz loucuras","um gato encurralado dá saltos estranhos",["os gatos são ágeis|Literal.","manter a calma sob pressão|Não."]),
  [("Soms kun je beter niets zeggen: spreken is zilver, zwijgen is goud.","Às vezes é melhor não dizer nada: o silêncio é de ouro."),("Uit wanhoop loog hij; een kat in het nauw maakt rare sprongen.","Por desespero mentiu; quem está encurralado faz loucuras.")],
  [("v-tussen-twee-vuren","tussen twee vuren zitten"),("v-met-de-mond-vol-tanden","met de mond vol tanden staan")],
  [MC("Quando aplicar «spreken is zilver, zwijgen is goud»?", ["*quando falar pode piorar a situação","numa apresentação|Não.","num exame oral|Não."], "Uso.", ["v-zwijgen-is-goud"])],
  TR("pt-nl","O silêncio é de ouro.", ["Zwijgen is goud","Spreken is zilver, zwijgen is goud"], "Provérbio.", ["v-zwijgen-is-goud"]),
  FB("Een kat in het ___ maakt rare sprongen.", ["nauw"], "Provérbio.", ["v-kat-in-het-nauw"], choices=["nauw","huis","water"], tr="Quem está encurralado faz loucuras."),
  FE(["Een","kat","in","het","nauw","maken","rare","sprongen."], 5, "maakt", "Singular: maakt.", ["v-kat-in-het-nauw"]),
  LI("Ik zei maar niets: spreken is zilver, zwijgen is goud.", ["Ik zei maar niets: spreken is zilver, zwijgen is goud","Ik zei maar niets, spreken is zilver, zwijgen is goud"], "Não disse nada: o silêncio é de ouro.", "Uso.", ["v-zwijgen-is-goud"]))

L(20, "O terceiro que ganha", "Als twee honden vechten om een been…",
  ["Perceber o provérbio sobre o terceiro beneficiado"],
  vocab=[X("v-twee-honden","als twee honden vechten om een been, gaat de derde ermee heen","entre dois que brigam, o terceiro ganha")],
  ex=[("Twee grote partijen ruzieden, en een kleine partij won: als twee honden vechten om een been, gaat de derde ermee heen.","Dois grandes partidos zangaram-se e um pequeno ganhou: entre dois que brigam, o terceiro ganha.")],
  review=["v-ruzie-maken"],
  cefr=C, exs=[
    EX("als twee honden vechten om een been, gaat de derde ermee heen", "se dois cães lutam por um osso, o terceiro leva-o", "O que significa?", ["*quando dois discutem, um terceiro aproveita","os cães são agressivos|Literal.","dividir é justo|Não."], "Sentido.", ["v-twee-honden"]),
    MC("Contexto típico:", ["*duas empresas guerreiam em preços e uma terceira conquista o mercado","dois amigos fazem as pazes|Não.","um cão encontra um osso|Literal."], "Uso.", ["v-twee-honden"]),
    TR("pt-nl","Os dois partidos zangaram-se.", ["De twee partijen kregen ruzie","De twee partijen maakten ruzie"], "ruzie.", ["v-ruzie-maken"]),
    FB("Als twee honden vechten om een been, gaat de ___ ermee heen.", ["derde"], "Provérbio.", ["v-twee-honden"], choices=["derde","tweede","eerste"], tr="Entre dois que brigam, o terceiro ganha."),
    FE(["Als","twee","honden","vecht","om","een","been…"], 3, "vechten", "Plural: vechten.", ["v-twee-honden"]),
    LI("Terwijl de broers ruzieden, kocht een buurman het huis: als twee honden vechten om een been, gaat de derde ermee heen.", ["Terwijl de broers ruzieden, kocht een buurman het huis: als twee honden vechten om een been, gaat de derde ermee heen"], "Enquanto os irmãos discutiam, um vizinho comprou a casa.", "Uso.", ["v-twee-honden"]),
    SW("Conte em 2–3 frases uma situação (real ou inventada) que ilustre este provérbio.", ["Twee collega's wilden allebei de nieuwe functie en spraken alleen nog maar kwaad over elkaar. Uiteindelijk koos de directeur iemand van buiten. Als twee honden vechten om een been, gaat de derde ermee heen."], ["Situação clara","Ligação ao provérbio"], 30, "Ilustrar.", ["v-twee-honden"]),
  ], diff=4, mins=5)

P(21, "Expressões bíblicas (1)", "Een judaskus en een ongelovige Thomas.",
  ("v-judaskus","een judaskus","um beijo de Judas (traição)","um beijo de Judas",["um beijo de amor|Não.","uma saudação religiosa|Não."]),
  ("v-ongelovige-thomas","een ongelovige Thomas","um São Tomé (quem só acredita vendo)","um Tomé incrédulo",["um ateu|Não exatamente.","um crente|É o contrário."]),
  [("Zijn complimentje voelde als een judaskus.","O elogio dele soube a beijo de Judas."),("Ik ben een ongelovige Thomas: ik moet het eerst zien.","Sou como São Tomé: tenho de ver primeiro.")],
  [("v-zijn-handen-in-onschuld","zijn handen in onschuld wassen"),("v-pyrrusoverwinning","pyrrusoverwinning")],
  [MC("A expressão «zijn handen in onschuld wassen» vem…", ["*da Bíblia (Pilatos)","de um anúncio de sabão|Não.","da Gouden Eeuw|Não."], "Origem.", ["v-zijn-handen-in-onschuld"])],
  TR("pt-nl","Sou como São Tomé: tenho de ver primeiro.", ["Ik ben een ongelovige Thomas: ik moet het eerst zien","Ik ben een ongelovige Thomas, ik moet het eerst zien"], "Expressão.", ["v-ongelovige-thomas"]),
  FB("Dat compliment was een ___ : hij wilde haar baan.", ["judaskus"], "Traição.", ["v-judaskus"], choices=["judaskus","thomas","pyrrusoverwinning"], tr="Esse elogio foi um beijo de Judas: ele queria o emprego dela."),
  FE(["Hij","zijn","een","ongelovige","Thomas."], 1, "is", "Singular: is.", ["v-ongelovige-thomas"]),
  LI("Eerst zien, dan geloven, zei de ongelovige Thomas.", ["Eerst zien, dan geloven, zei de ongelovige Thomas","Eerst zien dan geloven zei de ongelovige Thomas"], "Primeiro ver, depois crer, disse o incrédulo Tomé.", "Origem.", ["v-ongelovige-thomas"]))

P(22, "Expressões bíblicas (2)", "Het gouden kalf en de verloren zoon.",
  ("v-gouden-kalf","het gouden kalf aanbidden","adorar o bezerro de ouro (o dinheiro)","adorar o bezerro de ouro",["criar vacas|Literal.","ser pobre|Não."]),
  ("v-verloren-zoon","de verloren zoon","o filho pródigo","o filho perdido",["um filho desaparecido|Literal parcial.","um órfão|Não."]),
  [("In die bankwereld aanbidden ze het gouden kalf.","Nesse mundo da banca adoram o bezerro de ouro."),("Na tien jaar kwam de verloren zoon terug naar het dorp.","Ao fim de dez anos o filho pródigo voltou à aldeia.")],
  [("v-rijkdom","rijkdom"),("v-gouden-eeuw","Gouden Eeuw")],
  [MC("«Het gouden kalf aanbidden» critica…", ["*a obsessão pelo dinheiro","a agricultura|Não.","a religião|Não exatamente."], "Sentido.", ["v-gouden-kalf"])],
  TR("pt-nl","O filho pródigo voltou.", ["De verloren zoon kwam terug","De verloren zoon is teruggekomen"], "Expressão.", ["v-verloren-zoon"]),
  FB("Ze aanbidden het gouden ___.", ["kalf"], "Expressão.", ["v-gouden-kalf"], choices=["kalf","paard","schaap"], tr="Adoram o bezerro de ouro."),
  FE(["De","verloren","zoon","zijn","thuis."], 3, "is", "Singular: is.", ["v-verloren-zoon"]),
  LI("De speler keerde als de verloren zoon terug naar zijn oude club.", ["De speler keerde als de verloren zoon terug naar zijn oude club"], "O jogador voltou ao antigo clube como o filho pródigo.", "Uso no desporto.", ["v-verloren-zoon"]))

P(23, "Expressões bíblicas (3)", "Het beloofde land en een salomonsoordeel.",
  ("v-beloofde-land","het beloofde land","a terra prometida","a terra prometida",["um país pobre|Não.","um terreno à venda|Literal."]),
  ("v-salomonsoordeel","een salomonsoordeel","uma decisão salomónica","um juízo de Salomão",["uma sentença injusta|Não.","uma decisão aleatória|Não."]),
  [("Voor veel migranten was Nederland het beloofde land.","Para muitos migrantes os Países Baixos eram a terra prometida."),("De leraar velde een salomonsoordeel: beide kinderen kregen de helft.","O professor tomou uma decisão salomónica: cada criança ficou com metade.")],
  [("v-compromis","compromis"),("v-eerlijk-verdelen","eerlijk verdelen")],
  [MC("Uma decisão salomónica é…", ["*sábia e justa num dilema difícil","rápida e injusta|Não.","feita por sorteio|Não."], "Sentido.", ["v-salomonsoordeel"])],
  TR("pt-nl","Era a terra prometida.", ["Het was het beloofde land"], "Expressão.", ["v-beloofde-land"]),
  FB("De rechter velde een ___ .", ["salomonsoordeel"], "Decisão.", ["v-salomonsoordeel"], choices=["salomonsoordeel","judaskus","gouden kalf"], tr="O juiz tomou uma decisão salomónica."),
  FE(["Het","beloofde","landen","bleek","een","illusie."], 2, "land", "Singular: land.", ["v-beloofde-land"]),
  LI("Een salomonsoordeel is niet altijd mogelijk.", ["Een salomonsoordeel is niet altijd mogelijk"], "Uma decisão salomónica nem sempre é possível.", "Reflexão.", ["v-salomonsoordeel"]))

P(24, "Expressões com água (1)", "Het water staat hem tot de lippen.",
  ("v-water-tot-de-lippen","het water staat iemand tot de lippen","estar com a corda na garganta (financeiramente)","a água chega-lhe aos lábios",["ter sede|Literal.","estar de férias|Não."]),
  ("v-zware-dobber","een zware dobber","um osso duro de roer","uma boia pesada",["uma pesca fácil|Não.","um barco|Literal."]),
  [("Met al die schulden staat het water hem tot de lippen.","Com todas essas dívidas está com a corda na garganta."),("Die verbouwing wordt een zware dobber.","Essas obras vão ser um osso duro de roer.")],
  [("v-hoofd-boven-water","het hoofd boven water houden"),("v-op-de-kleintjes-letten","op de kleintjes letten")],
  [MC("«Het water staat hem tot de lippen» refere-se sobretudo a…", ["*problemas financeiros graves","natação|Literal.","um dia de chuva|Não."], "Sentido.", ["v-water-tot-de-lippen"])],
  TR("pt-nl","Vai ser um osso duro de roer.", ["Dat wordt een zware dobber","Het wordt een zware dobber"], "Expressão.", ["v-zware-dobber"]),
  FB("Het water staat de ondernemer tot de ___.", ["lippen"], "Expressão.", ["v-water-tot-de-lippen"], choices=["lippen","knieën","ogen"], tr="O empresário está com a corda na garganta."),
  FE(["Dat","examen","werden","een","zware","dobber."], 2, "werd", "Singular: werd.", ["v-zware-dobber"]),
  LI("Ze probeert het hoofd boven water te houden.", ["Ze probeert het hoofd boven water te houden","Zij probeert het hoofd boven water te houden"], "Ela tenta manter a cabeça fora de água.", "Revisão.", ["v-hoofd-boven-water"]))

P(25, "Expressões com água (2)", "Tegen de stroom in.",
  ("v-tegen-de-stroom-in","tegen de stroom in roeien","remar contra a maré","remar contra a corrente",["praticar remo|Literal.","seguir a maioria|É o contrário."]),
  ("v-met-de-stroom-mee","met de stroom meegaan","ir com a maré|seguir a maioria","ir com a corrente",["nadar bem|Literal.","rebelar-se|É o contrário."]),
  [("Als enige vegetariër in de familie roei je tegen de stroom in.","Como único vegetariano da família, remas contra a maré."),("Hij gaat altijd met de stroom mee; hij heeft geen eigen mening.","Ele vai sempre com a maré; não tem opinião própria.")],
  [("v-polarisatie","polarisatie"),("v-mening","mening")],
  [MC("Os dois são…", ["*antónimos","sinónimos|Não.","sem relação|Não."], "Relação.", ["v-tegen-de-stroom-in","v-met-de-stroom-mee"])],
  TR("pt-nl","Ele vai sempre com a maré.", ["Hij gaat altijd met de stroom mee"], "Separável.", ["v-met-de-stroom-mee"]),
  FB("Zij roeit graag tegen de ___ in.", ["stroom"], "Expressão.", ["v-tegen-de-stroom-in"], choices=["stroom","wind","golf"], tr="Ela gosta de remar contra a maré."),
  FE(["Wij","gaat","met","de","stroom","mee."], 1, "gaan", "Plural: gaan.", ["v-met-de-stroom-mee"]),
  LI("Soms moet je durven tegen de stroom in te roeien.", ["Soms moet je durven tegen de stroom in te roeien"], "Às vezes tens de ter coragem de remar contra a maré.", "Reflexão.", ["v-tegen-de-stroom-in"]))

P(26, "Expressões com água (3)", "De bakens verzetten.",
  ("v-bakens-verzetten","de bakens verzetten","mudar de rumo|adaptar-se aos tempos","mudar as balizas de lugar",["navegar mal|Literal.","manter tudo igual|É o contrário."]),
  ("v-oog-van-de-naald","door het oog van de naald kruipen","escapar por um triz","rastejar pelo buraco da agulha",["costurar|Literal.","falhar|É o contrário."]),
  [("Het bedrijf moest de bakens verzetten en online gaan verkopen.","A empresa teve de mudar de rumo e passar a vender online."),("Bij dat ongeluk is hij door het oog van de naald gekropen.","Nesse acidente escapou por um triz.")],
  [("v-roer-omgooien","het roer omgooien"),("v-nippertje","op het nippertje")],
  [MC("«De bakens verzetten» é semelhante a…", ["*het roer omgooien","met de stroom meegaan|Não.","eind goed, al goed|Não."], "Sinónimo próximo.", ["v-bakens-verzetten"])],
  TR("pt-nl","Escapou por um triz.", ["Hij is door het oog van de naald gekropen","Hij kroop door het oog van de naald"], "Expressão.", ["v-oog-van-de-naald"]),
  FB("Als de tijden veranderen, moet je de ___ verzetten.", ["bakens"], "Expressão.", ["v-bakens-verzetten"], choices=["bakens","stoelen","klokken"], tr="Quando os tempos mudam, tens de mudar de rumo."),
  FE(["Hij","is","door","het","oog","van","de","naald","gekruipt."], 8, "gekropen.", "Particípio forte: gekropen.", ["v-oog-van-de-naald"]),
  LI("Op tijd de bakens verzetten is een teken van wijsheid.", ["Op tijd de bakens verzetten is een teken van wijsheid"], "Mudar de rumo a tempo é sinal de sabedoria.", "Reflexão.", ["v-bakens-verzetten"]))

L(27, "Expressões e história neerlandesa", "De VOC-mentaliteit.",
  ["Perceber expressões ligadas à história e o debate à sua volta"],
  vocab=[X("v-voc-mentaliteit","VOC-mentaliteit","mentalidade VOC (empreendedorismo agressivo)")],
  ex=[("Een premier sprak in 2006 over «die VOC-mentaliteit»; dat leidde tot veel kritiek.","Um primeiro-ministro falou em 2006 dessa «mentalidade VOC»; isso gerou muitas críticas."),("Critici wijzen op de schaduwkanten van de VOC, zoals slavernij en geweld.","Os críticos apontam os lados sombrios da VOC, como a escravatura e a violência.")],
  review=["v-gouden-eeuw","v-polemiek","v-genuanceerd"],
  cefr=C, exs=[
    MA([("VOC-mentaliteit","mentalidade VOC"),("Gouden Eeuw","Século de Ouro"),("polemiek","polémica"),("genuanceerd","matizado")], "História.", ["v-voc-mentaliteit","v-gouden-eeuw","v-polemiek","v-genuanceerd"]),
    MC("Porque é que a expressão «VOC-mentaliteit» é polémica?", ["*Elogia o espírito comercial, mas ignora a violência colonial e a escravatura","Porque é demasiado moderna|Não.","Porque é em inglês|Não."], "Debate histórico.", ["v-voc-mentaliteit"]),
    MC("A VOC era…", ["*a Companhia Holandesa das Índias Orientais (séc. XVII–XVIII)","um partido político|Não.","um clube de futebol|Não."], "Facto histórico.", ["v-voc-mentaliteit"]),
    TR("pt-nl","Os críticos apontam os lados sombrios.", ["Critici wijzen op de schaduwkanten","Critici wijzen op de schaduwzijden"], "wijzen op.", ["v-voc-mentaliteit"]),
    FB("Over de ___ Eeuw wordt tegenwoordig genuanceerder gesproken.", ["Gouden"], "Século de Ouro.", ["v-gouden-eeuw"], choices=["Gouden","Zilveren","Donkere"], tr="Hoje fala-se do Século de Ouro de forma mais matizada."),
    FE(["De","VOC","waren","een","handelsbedrijf."], 2, "was", "Singular: was.", ["v-voc-mentaliteit"]),
    SW("Em 3–4 frases: deve um país orgulhar-se da sua história colonial? Dê uma opinião matizada (pode comparar Portugal e Países Baixos).", ["Ik vind dat je trots kunt zijn op de kunst en wetenschap uit die tijd, maar niet op het geweld en de slavernij. Zowel Portugal als Nederland hebben een koloniaal verleden. Het is belangrijk om beide kanten van het verhaal te vertellen, op school en in musea."], ["Opinião matizada","Duas perspetivas"], 40, "Debate.", ["v-voc-mentaliteit","v-genuanceerd"]),
  ], diff=5, mins=6)

L(28, "Usar expressões com moderação", "Niet te veel clichés!",
  ["Escolher quando uma expressão é adequada"],
  vocab=[X("v-met-mate-gebruiken","met mate gebruiken","usar com moderação","verb")],
  ex=[("Gebruik spreekwoorden met mate.","Usa os provérbios com moderação."),("In een zakelijke mail is «het water staat ons tot de lippen» misschien te dramatisch.","Num e-mail profissional, «estamos com a corda na garganta» talvez seja dramático demais.")],
  review=["v-cliche-vermijden","v-gepast","v-ongepast"],
  cefr=C, exs=[
    MA([("met mate gebruiken","usar com moderação"),("clichés vermijden","evitar clichés"),("gepast","adequado"),("ongepast","inadequado")], "Uso.", ["v-met-mate-gebruiken","v-cliche-vermijden","v-gepast","v-ongepast"]),
    MC("Num funeral, qual expressão é ongepast?", ["*Eind goed, al goed","Gedeelde smart is halve smart|Pode ser adequado.","Sterkte|Adequado."], "Adequação.", ["v-ongepast"]),
    MC("Num e-mail ao cliente, qual é mais gepast?", ["*We hebben een lastige periode achter de rug, maar het gaat weer beter.","Het water stond ons tot de lippen, maar achter de wolken schijnt de zon!|Demasiado figurado.","Haastige spoed, joh!|Informal."], "Adequação.", ["v-gepast"]),
    TR("pt-nl","Usa os provérbios com moderação.", ["Gebruik spreekwoorden met mate"], "met mate.", ["v-met-mate-gebruiken"]),
    FB("Te veel spreekwoorden in één tekst klinkt al snel als een ___.", ["cliché"], "Cliché.", ["v-cliche-vermijden"], choices=["cliché","slogan","vonnis"], tr="Provérbios a mais num só texto soam depressa a cliché."),
    FE(["Dat","grapje","waren","ongepast."], 2, "was", "Singular: was.", ["v-ongepast"]),
    LI("Eén goed gekozen spreekwoord zegt meer dan tien.", ["Eén goed gekozen spreekwoord zegt meer dan tien","Een goed gekozen spreekwoord zegt meer dan tien"], "Um provérbio bem escolhido diz mais do que dez.", "Dica.", ["v-met-mate-gebruiken"]),
    WO("Usa com moderação.", ["Gebruik","het","met","mate"], "Ordem.", ["v-met-mate-gebruiken"]),
  ], diff=4, mins=4)

L(29, "Prática: uma história com provérbios", "Een verhaal vol wijsheid.",
  ["Usar provérbios de forma natural numa narrativa"],
  vocab=[V("v-volkswijsheid","volkswijsheid","sabedoria popular","noun","de")],
  ex=[("Spreekwoorden zijn een vorm van volkswijsheid.","Os provérbios são uma forma de sabedoria popular.")],
  review=["v-hart-op-de-tong","v-wie-a-zegt","v-haastige-spoed","v-achter-de-wolken","v-water-tot-de-lippen","v-bakens-verzetten","v-eind-goed-al-goed","v-goede-buur"],
  cefr=C, exs=[
    CO("text","Het café van Ana","Ana opende een café in Utrecht. Het eerste jaar was een zware dobber: het water stond haar tot de lippen. Haar vrienden zeiden: «Wie A zegt, moet ook B zeggen,» en ze ging door. Ze verzette de bakens en begon ook Portugese lunches te serveren. Haar buurvrouw hielp elke zaterdag gratis mee: beter een goede buur dan een verre vriend. Nu is het café altijd vol. Eind goed, al goed!",
       [("Como foi o primeiro ano?", ["*Muito difícil financeiramente","Fácil","Não abriu"]),("O que mudou ela?", ["*Começou a servir almoços portugueses","Fechou o café","Mudou de cidade"]),("Quem a ajudou?", ["*A vizinha","O banco","Os pais"])],
       "Provérbios em contexto.", ["v-volkswijsheid","v-zware-dobber","v-bakens-verzetten"]),
    MC("No texto, «Wie A zegt, moet ook B zeggen» significa que…", ["*tendo começado, devia continuar","devia desistir|Não.","devia aprender o alfabeto|Literal."], "Revisão.", ["v-wie-a-zegt"]),
    TR("pt-nl","Os provérbios são sabedoria popular.", ["Spreekwoorden zijn volkswijsheid","Spreekwoorden zijn een vorm van volkswijsheid"], "volkswijsheid.", ["v-volkswijsheid"]),
    FE(["Achter","de","wolken","schijnen","de","zon."], 3, "schijnt", "Singular: schijnt.", ["v-achter-de-wolken"]),
    SW("Conte uma história curta (cerca de 100 palavras), real ou inventada, em que use naturalmente pelo menos quatro provérbios ou expressões desta unidade.", ["Toen mijn broer naar Amsterdam verhuisde, had hij geen werk. Het water stond hem tot de lippen, maar hij heeft het hart op de tong en vroeg overal om hulp. Zijn buurman, een gepensioneerde timmerman, leerde hem het vak: beter een goede buur dan een verre vriend. Natuurlijk ging het niet vanzelf; haastige spoed is zelden goed, en hij moest veel oefenen. Maar achter de wolken schijnt de zon: nu heeft hij een eigen werkplaats. Eind goed, al goed!"], ["4+ expressões","Narrativa coerente","Uso natural"], 80, "Narrativa final.", ["v-volkswijsheid"]),
  ], diff=5, mins=7)

W()
