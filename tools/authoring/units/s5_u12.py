import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u12")
C = "B1"

L(1, "Expressões com partes do corpo", "iets onder de knie hebben, een oogje in het zeil houden",
  ["Compreender expressões frequentes com partes do corpo"],
  vocab=[V("v-onder-de-knie","iets onder de knie hebben","dominar algo","expression"), V("v-oogje-in-het-zeil","een oogje in het zeil houden","ficar de olho","expression"),
         V("v-hoofd-koel","het hoofd koel houden","manter a cabeça fria","expression"), V("v-met-de-mond-vol-tanden","met de mond vol tanden staan","ficar sem palavras","expression")],
  ex=[("Ik heb de grammatica nu onder de knie.","Agora domino a gramática."),("Kun jij een oogje in het zeil houden?","Podes ficar de olho?"),("Probeer het hoofd koel te houden.","Tenta manter a cabeça fria."),("Ik stond met de mond vol tanden.","Fiquei sem palavras.")],
  gram=[G("g-uitdrukkingen","Como aprender expressões","Aprenda a expressão **inteira**, com o verbo, e o **contexto** em que se usa. A tradução literal (*met de mond vol tanden* = com a boca cheia de dentes) ajuda a memorizar, mas o significado real é outro (ficar sem palavras).",
    [("Hij heeft het Nederlands goed onder de knie.","Ele domina bem o neerlandês.")])],
  review=["v-hoofd","v-oog","v-hand"],
  cefr=C, exs=[
    MA([("onder de knie hebben","dominar"),("een oogje in het zeil houden","ficar de olho"),("het hoofd koel houden","manter a calma"),("met de mond vol tanden staan","ficar sem palavras")], "Expressões.", ["v-onder-de-knie","v-oogje-in-het-zeil","v-hoofd-koel","v-met-de-mond-vol-tanden"]),
    EX("iets onder de knie hebben","ter algo debaixo do joelho","«Na een maand had ze het fietsen in de stad onder de knie.» Isto significa que…", ["*ela já dominava andar de bicicleta na cidade","ela caiu da bicicleta|Sentido literal errado.","ela tinha dores no joelho|Sentido literal errado."], "Dominar.", ["v-onder-de-knie"]),
    EX("een oogje in het zeil houden","manter um olhinho na vela","O vizinho diz: «Ik houd een oogje in het zeil terwijl jullie op vakantie zijn.»", ["*Ele vai vigiar a casa","Ele vai velejar|Literal.","Ele está com um olho doente|Literal."], "Vigiar.", ["v-oogje-in-het-zeil"]),
    EX("met de mond vol tanden staan","estar de boca cheia de dentes","«Toen de baas me iets vroeg, stond ik met de mond vol tanden.»", ["*Não soube o que dizer","Estava a comer|Literal.","Fui ao dentista|Literal."], "Sem palavras.", ["v-met-de-mond-vol-tanden"]),
    TR("pt-nl","Podes ficar de olho?", ["Kun jij een oogje in het zeil houden","Kun je een oogje in het zeil houden","Kan je een oogje in het zeil houden"], "Expressão fixa.", ["v-oogje-in-het-zeil"]),
    TR("nl-pt","Probeer het hoofd koel te houden.", ["Tenta manter a cabeça fria","Tenta manter a calma"], "Expressão.", ["v-hoofd-koel"]),
    FE(["Ik","heb","het","onder","de","been."], 5, "knie", "A expressão é «onder de knie hebben».", ["v-onder-de-knie"]),
    FB("Ik heb de uitspraak nog niet onder de ___.", ["knie"], "Expressão.", ["v-onder-de-knie"], choices=["knie","voet","hand"], tr="Ainda não domino a pronúncia."),
    LI("Ik stond met de mond vol tanden.", ["Ik stond met de mond vol tanden"], "Fiquei sem palavras.", "Expressão.", ["v-met-de-mond-vol-tanden"]),
    MC("Qual expressão usaria antes de um exame difícil?", ["*Het hoofd koel houden.","Een oogje in het zeil houden.|Sentido: vigiar.","Met de mond vol tanden.|Sentido: ficar sem palavras."], "Contexto.", ["v-hoofd-koel"]),
  ], diff=4, mins=7)

L(2, "Expressões com animais", "Als een kip zonder kop, de kat uit de boom kijken, een koe…",
  ["Compreender expressões com animais"],
  vocab=[V("v-kip-zonder-kop","als een kip zonder kop","como uma barata tonta","expression"), V("v-kat-uit-de-boom","de kat uit de boom kijken","esperar para ver","expression"),
         V("v-twee-vliegen","twee vliegen in één klap slaan","matar dois coelhos de uma cajadada","expression"), V("v-haantje-de-voorste","haantje de voorste","o primeiro a avançar","expression")],
  ex=[("Hij rende rond als een kip zonder kop.","Ele andava de um lado para o outro como uma barata tonta."),("Ik kijk eerst de kat uit de boom.","Primeiro vou esperar para ver."),("Zo sla je twee vliegen in één klap.","Assim matas dois coelhos de uma cajadada."),("Bij het eten is hij altijd haantje de voorste.","Na comida é sempre o primeiro.")],
  review=["v-kat","v-hond"],
  cefr=C, exs=[
    MA([("als een kip zonder kop","como uma barata tonta"),("de kat uit de boom kijken","esperar para ver"),("twee vliegen in één klap","dois coelhos de uma cajadada"),("haantje de voorste","o primeiro a avançar")], "Animais.", ["v-kip-zonder-kop","v-kat-uit-de-boom","v-twee-vliegen","v-haantje-de-voorste"]),
    EX("twee vliegen in één klap slaan","matar duas moscas com uma pancada","«Als ik met de fiets naar mijn werk ga, sla ik twee vliegen in één klap: ik beweeg en ik bespaar geld.»", ["*Consegue duas vantagens com uma só ação","Mata moscas no caminho|Literal.","Bate em alguém|Literal."], "Equivalente: matar dois coelhos de uma cajadada.", ["v-twee-vliegen"]),
    EX("de kat uit de boom kijken","ver o gato a sair da árvore","Num grupo novo, o Pedro não diz nada nas primeiras reuniões. Ele está a…", ["*observar primeiro antes de agir","subir a uma árvore|Literal.","procurar um gato|Literal."], "Esperar para ver.", ["v-kat-uit-de-boom"]),
    EX("als een kip zonder kop","como uma galinha sem cabeça","«Ze liep als een kip zonder kop door het huis, want ze was te laat.»", ["*Andava às voltas sem saber o que fazer","Estava a cozinhar uma galinha|Literal.","Estava calma|Ao contrário."], "Barata tonta.", ["v-kip-zonder-kop"]),
    TR("pt-nl","Primeiro vou esperar para ver.", ["Ik kijk eerst de kat uit de boom","Eerst kijk ik de kat uit de boom"], "Expressão fixa.", ["v-kat-uit-de-boom"]),
    TR("nl-pt","Zo sla je twee vliegen in één klap.", ["Assim matas dois coelhos de uma cajadada","Assim matas dois coelhos com uma cajadada só"], "Equivalente português.", ["v-twee-vliegen"]),
    FE(["Hij","is","altijd","kippetje","de","voorste."], 3, "haantje", "A expressão é «haantje de voorste».", ["v-haantje-de-voorste"]),
    FB("Ik sla twee ___ in één klap.", ["vliegen"], "Expressão.", ["v-twee-vliegen"], choices=["vliegen","katten","kippen"], tr="Mato dois coelhos de uma cajadada."),
    LI("Hij is altijd haantje de voorste.", ["Hij is altijd haantje de voorste"], "Ele é sempre o primeiro a avançar.", "Expressão.", ["v-haantje-de-voorste"]),
    MC("Qual destas tem equivalente quase literal em português (com outro animal)?", ["*twee vliegen in één klap slaan","de kat uit de boom kijken|Em português diz-se «esperar para ver».","haantje de voorste|Sem equivalente direto."], "Moscas ↔ coelhos.", ["v-twee-vliegen"]),
  ], diff=4, mins=7)

L(3, "Expressões do dia a dia", "Het maakt niet uit. Dat is een eitje. Daar gaat het om.",
  ["Usar expressões muito frequentes na conversa"],
  vocab=[V("v-eitje","een eitje","canja (muito fácil)","expression"), V("v-daar-gaat-het-om","daar gaat het om","é isso que importa","expression"),
         V("v-het-gaat-om","het gaat om…","trata-se de…","expression"), V("v-over-smaak","over smaak valt niet te twisten","gostos não se discutem","expression")],
  ex=[("Die toets was een eitje.","Aquele teste foi canja."),("Het gaat om je gezondheid.","Trata-se da tua saúde."),("Samen plezier hebben, daar gaat het om.","Divertirmo-nos juntos, é isso que importa."),("Over smaak valt niet te twisten.","Gostos não se discutem.")],
  review=["v-maakt-niet-uit","v-makkelijk"],
  cefr=C, exs=[
    MA([("een eitje","canja"),("daar gaat het om","é isso que importa"),("het gaat om…","trata-se de…"),("over smaak valt niet te twisten","gostos não se discutem")], "Dia a dia.", ["v-eitje","v-daar-gaat-het-om","v-het-gaat-om","v-over-smaak"]),
    EX("een eitje","um ovinho","«Hoe was het examen?» — «Een eitje!»", ["*Foi muito fácil","Comi um ovo|Literal.","Foi muito difícil|Ao contrário."], "Fácil.", ["v-eitje"]),
    TR("pt-nl","Trata-se da tua saúde.", ["Het gaat om je gezondheid","Het gaat om jouw gezondheid"], "het gaat om.", ["v-het-gaat-om"]),
    TR("nl-pt","Over smaak valt niet te twisten.", ["Gostos não se discutem","Gostos e cores não se discutem"], "Provérbio.", ["v-over-smaak"]),
    MC("«Het gaat om…» é diferente de «Hoe gaat het?» porque…", ["*«het gaat om» = trata-se de; «hoe gaat het» = como estás","são iguais|Não.","«het gaat om» = vai embora|Não."], "Dois usos de gaan.", ["v-het-gaat-om"]),
    FE(["Het","gaat","over","je","gezondheid,","niet","om","geld."], 2, "om", "Trata-se de = het gaat om.", ["v-het-gaat-om"]),
    LI("Winnen is niet belangrijk, meedoen, daar gaat het om.", ["Winnen is niet belangrijk(,) meedoen(,) daar gaat het om"], "Ganhar não é importante, participar é que importa.", "daar gaat het om.", ["v-daar-gaat-het-om"]),
    FB("Die klus is een ___, dat doe ik in vijf minuten.", ["eitje"], "Canja.", ["v-eitje"], choices=["eitje","kipje","koetje"], tr="Esse trabalho é canja, faço-o em cinco minutos."),
    DL([("Vriend","Ik vind ananas op pizza lekker!","Eu gosto de ananás na pizza!"),("Inês","")], ["*Nou ja, over smaak valt niet te twisten!","Het gaat om pizza.|Não reage.","Een eitje!|Sem sentido aqui."], "Provérbio adequado.", ["v-over-smaak"]),
    WO("É isso que importa.", ["Daar","gaat","het","om"], "Fórmula.", ["v-daar-gaat-het-om"]),
  ], diff=4, mins=6)

L(4, "Expressões de tempo e dinheiro", "Tijd is geld. Voor een appel en een ei. Op het laatste nippertje.",
  ["Compreender expressões ligadas a tempo e dinheiro"],
  vocab=[V("v-appel-en-ei","voor een appel en een ei","por tuta e meia (muito barato)","expression"), V("v-nippertje","op het nippertje","mesmo à última hora","expression"),
         V("v-geld-over-de-balk","geld over de balk gooien","esbanjar dinheiro","expression"), V("v-tijd-is-geld","tijd is geld","tempo é dinheiro","expression")],
  ex=[("Ik heb deze fiets voor een appel en een ei gekocht.","Comprei esta bicicleta por tuta e meia."),("We haalden de trein op het nippertje.","Apanhámos o comboio mesmo à justa."),("Hij gooit zijn geld over de balk.","Ele esbanja o dinheiro."),("Schiet op, tijd is geld!","Despacha-te, tempo é dinheiro!")],
  review=["v-goedkoop","v-duur","v-geld"],
  cefr=C, exs=[
    MA([("voor een appel en een ei","por tuta e meia"),("op het nippertje","mesmo à justa"),("geld over de balk gooien","esbanjar dinheiro"),("tijd is geld","tempo é dinheiro")], "Tempo e dinheiro.", ["v-appel-en-ei","v-nippertje","v-geld-over-de-balk","v-tijd-is-geld"]),
    EX("voor een appel en een ei","por uma maçã e um ovo","«Op de markt kocht ik een lamp voor een appel en een ei.» A lâmpada foi…", ["*muito barata","trocada por fruta|Literal.","muito cara|Ao contrário."], "Barato.", ["v-appel-en-ei"]),
    EX("geld over de balk gooien","atirar dinheiro por cima da trave","«Hij koopt elke week nieuwe schoenen. Hij gooit zijn geld over de balk.»", ["*Gasta dinheiro sem pensar","Poupa muito|Ao contrário.","Joga basquetebol|Literal."], "Esbanjar.", ["v-geld-over-de-balk"]),
    TR("pt-nl","Apanhámos o comboio mesmo à justa.", ["We haalden de trein op het nippertje","We hebben de trein op het nippertje gehaald","Wij haalden de trein op het nippertje"], "op het nippertje.", ["v-nippertje"]),
    TR("nl-pt","Schiet op, tijd is geld!", ["Despacha-te, tempo é dinheiro","Anda depressa, tempo é dinheiro"], "Provérbio igual.", ["v-tijd-is-geld"]),
    FE(["Ik","kocht","het","voor","een","peer","en","een","ei."], 5, "appel", "A expressão é «voor een appel en een ei».", ["v-appel-en-ei"]),
    FB("Ik was er op het ___, de deur ging net dicht.", ["nippertje"], "À justa.", ["v-nippertje"], choices=["nippertje","eitje","laatste"], tr="Cheguei mesmo à justa, a porta estava mesmo a fechar."),
    LI("Ik heb die jas voor een appel en een ei gekocht.", ["Ik heb die jas voor een appel en een ei gekocht"], "Comprei aquele casaco por tuta e meia.", "Expressão.", ["v-appel-en-ei"]),
    MC("Qual expressão é igual em português e neerlandês?", ["*tijd is geld","voor een appel en een ei|Em PT: por tuta e meia.","op het nippertje|Em PT: à justa."], "Tempo é dinheiro.", ["v-tijd-is-geld"]),
    SW("Use duas expressões desta lição numa pequena história (2–3 frases).", ["Gisteren kocht ik op de markt een fiets voor een appel en een ei. Ik moest snel naar huis en haalde de bus op het nippertje."], ["Duas expressões corretas", "Contexto que faz sentido", "Passado bem formado"], 20, "Usar expressões.", ["v-appel-en-ei","v-nippertje"]),
  ], diff=4, mins=7)

L(5, "Provérbios e falsos amigos", "Wie het eerst komt, het eerst maalt. Oost west, thuis best.",
  ["Conhecer provérbios comuns e os seus equivalentes portugueses"],
  vocab=[V("v-eerst-maalt","wie het eerst komt, het eerst maalt","quem chega primeiro é servido primeiro","expression"), V("v-oost-west","oost west, thuis best","não há lugar como a nossa casa","expression"),
         V("v-spreekwoord","spreekwoord","provérbio","noun","het"), V("v-geen-twee-zonder-drie","geen twee zonder drie","não há duas sem três","expression")],
  ex=[("Wie het eerst komt, het eerst maalt.","Quem chega primeiro é servido primeiro."),("Oost west, thuis best.","Não há lugar como a nossa casa."),("Geen twee zonder drie!","Não há duas sem três!"),("Ken je dit spreekwoord?","Conheces este provérbio?")],
  review=["v-thuis","v-eerst"],
  cefr=C, exs=[
    MA([("wie het eerst komt, het eerst maalt","quem chega primeiro é servido"),("oost west, thuis best","não há lugar como a casa"),("geen twee zonder drie","não há duas sem três"),("spreekwoord","provérbio")], "Provérbios.", ["v-eerst-maalt","v-oost-west","v-geen-twee-zonder-drie","v-spreekwoord"]),
    EX("wie het eerst komt, het eerst maalt","quem chega primeiro, mói primeiro (no moinho)","Num anúncio: «Gratis bank, wie het eerst komt, het eerst maalt.»", ["*O primeiro a aparecer leva o sofá","Tem de pagar|Não, é grátis.","Há um moinho|Literal."], "Origem: moinhos.", ["v-eerst-maalt"]),
    EX("oost west, thuis best","este oeste, em casa é melhor","Depois de três semanas de viagem, a Rita chega a casa e diz: «Oost west, thuis best!» Ela sente…", ["*alívio e alegria por estar em casa","vontade de viajar mais|Ao contrário.","que se perdeu|Não."], "Casa.", ["v-oost-west"]),
    TR("nl-pt","Geen twee zonder drie!", ["Não há duas sem três"], "Igual em português.", ["v-geen-twee-zonder-drie"]),
    TR("pt-nl","Conheces este provérbio?", ["Ken je dit spreekwoord","Ken jij dit spreekwoord"], "het spreekwoord → dit.", ["v-spreekwoord"]),
    AR("spreekwoord","o provérbio","het", "Het woord → het spreekwoord.", ["v-spreekwoord"]),
    MC("Falso amigo: «brutaal» em neerlandês significa…", ["*atrevido/insolente","brutal/violento|Isso é «gewelddadig».","bruto (salário)|Isso é «bruto»."], "brutaal ≠ brutal.", []),
    MC("Falso amigo: «eventueel» significa…", ["*possivelmente, se for o caso","eventualmente (por fim)|Isso é «uiteindelijk».","nunca|Não."], "eventueel = se necessário.", []),
    FE(["Oost","west,","thuis","beste."], 3, "best", "A forma fixa é «thuis best».", ["v-oost-west"]),
    LI("Wie het eerst komt, het eerst maalt.", ["Wie het eerst komt(,) het eerst maalt"], "Quem chega primeiro é servido primeiro.", "Provérbio.", ["v-eerst-maalt"]),
  ], diff=4, mins=7)

W()
