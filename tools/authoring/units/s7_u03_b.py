import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u03")
C = "B2"
# Lições de aprofundamento (10–29): apresentações avançadas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Manter a atenção", "Een pauze inlassen.",
  ["Usar pausas e silêncio para prender a atenção"],
  vocab=[X("v-aandacht-vasthouden","de aandacht vasthouden","manter a atenção"), X("v-pauze-inlassen","een pauze inlassen","fazer uma pausa (intencional)")],
  ex=[("Met een verhaal houd je de aandacht vast.","Com uma história manténs a atenção."),("Las na een belangrijke zin een korte pauze in.","Depois de uma frase importante, faz uma pausa curta.")],
  review=["v-boeien","v-publiek"],
  cefr=C, exs=[
    MA([("de aandacht vasthouden","manter a atenção"),("een pauze inlassen","fazer uma pausa"),("boeien","cativar"),("publiek","público")], "Atenção.", ["v-aandacht-vasthouden","v-pauze-inlassen","v-boeien","v-publiek"]),
    MC("Depois de um número surpreendente, o melhor é…", ["*fazer uma pausa curta para o público absorver","falar mais depressa|Não.","mudar logo de diapositivo|Perde o efeito."], "Técnica.", ["v-pauze-inlassen"]),
    TR("pt-nl","Com uma história manténs a atenção.", ["Met een verhaal houd je de aandacht vast","Met een verhaal hou je de aandacht vast"], "vasthouden.", ["v-aandacht-vasthouden"]),
    TR("pt-nl","Faz uma pausa curta.", ["Las een korte pauze in","Neem een korte pauze"], "inlassen.", ["v-pauze-inlassen"]),
    FB("Een goede spreker durft een stilte te laten ___.", ["vallen"], "Expressão: een stilte laten vallen.", ["v-pauze-inlassen"], choices=["vallen","maken","komen"], tr="Um bom orador atreve-se a deixar cair um silêncio."),
    FE(["Hij","hield","de","aandacht","goed","vastgehouden."], 5, "vast.", "Passado separável: hield … vast.", ["v-aandacht-vasthouden"]),
    LI("Na tien minuten neemt de aandacht van het publiek vaak af.", ["Na tien minuten neemt de aandacht van het publiek vaak af","Na 10 minuten neemt de aandacht van het publiek vaak af"], "Ao fim de dez minutos a atenção do público costuma baixar.", "Observação geral.", ["v-aandacht-vasthouden"]),
    WO("Manter a atenção.", ["De","aandacht","vasthouden"], "Expressão.", ["v-aandacht-vasthouden"]),
  ], diff=4, mins=5)

L(11, "A voz", "Intonatie en articulatie.",
  ["Trabalhar a entoação e a articulação"],
  vocab=[N("v-intonatie","intonatie","entoação","de"), X("v-articuleren","articuleren","articular","verb"),
         X("v-monotoon","monotoon","monótono","adjective")],
  ex=[("Met intonatie leg je nadruk.","Com a entoação dás ênfase."),("Articuleer duidelijk, vooral bij lange woorden.","Articula com clareza, sobretudo nas palavras longas."),("Een monotone stem maakt mensen slaperig.","Uma voz monótona dá sono às pessoas.")],
  review=[],
  cefr=C, exs=[
    MA([("intonatie","entoação"),("articuleren","articular"),("monotoon","monótono"),("spreektempo","ritmo de fala")], "Voz.", ["v-intonatie","v-articuleren","v-monotoon"]),
    MC("Quando está nervoso, muita gente…", ["*fala depressa demais","fala lento demais|Menos comum.","fala mais baixo e perfeito|Não."], "Tendência.", []),
    TR("pt-nl","Articula com clareza.", ["Articuleer duidelijk"], "Imperativo.", ["v-articuleren"]),
    TR("pt-nl","Uma voz monótona dá sono.", ["Een monotone stem maakt mensen slaperig","Een monotone stem maakt slaperig"], "-e.", ["v-monotoon"]),
    FB("Varieer je ___, anders klink je monotoon.", ["intonatie"], "Entoação.", ["v-intonatie"], choices=["intonatie","articulatie","tempo"], tr="Varia a entoação, senão soas monótono."),
    FE(["Zijn","stem","was","erg","monotone."], 4, "monotoon.", "Predicativo: sem -e.", ["v-monotoon"]),
    LI("Spreek iets langzamer en articuleer elk woord.", ["Spreek iets langzamer en articuleer elk woord"], "Fala um pouco mais devagar e articula cada palavra.", "Dica.", ["v-articuleren"]),
    MC("Para lusófonos, um desafio típico na articulação neerlandesa é…", ["*o «g» gutural e as vogais longas/curtas","os acentos gráficos|Não.","o «ç»|Não existe."], "Pronúncia.", ["v-articuleren"]),
  ], diff=4, mins=5)

L(12, "O corpo fala", "Gebaren en houding.",
  ["Usar gestos e postura de forma eficaz"],
  vocab=[N("v-gebaren","gebaren","gestos","de"), X("v-zelfverzekerd-overkomen","zelfverzekerd overkomen","parecer seguro de si","verb")],
  ex=[("Gebruik je handen om je punten te ondersteunen.","Usa as mãos para apoiar os teus pontos."),("Met een rechte houding kom je zelfverzekerd over.","Com uma postura direita pareces seguro de ti."),("Te veel gebaren leidt af.","Gestos a mais distraem.")],
  review=["v-lichaamstaal","v-oogcontact","v-overkomen"],
  cefr=C, exs=[
    MA([("gebaren","gestos"),("zelfverzekerd overkomen","parecer seguro"),("lichaamstaal","linguagem corporal"),("oogcontact","contacto visual")], "Corpo.", ["v-gebaren","v-zelfverzekerd-overkomen","v-lichaamstaal","v-oogcontact"]),
    MC("Qual destes passa insegurança?", ["*Met je armen over elkaar naar de grond kijken","Rustig staan en rondkijken|Seguro.","Open gebaren maken|Seguro."], "Linguagem corporal.", ["v-lichaamstaal"]),
    TR("pt-nl","Com uma boa postura pareces seguro.", ["Met een goede houding kom je zelfverzekerd over"], "overkomen.", ["v-zelfverzekerd-overkomen"]),
    TR("pt-nl","Gestos a mais distraem.", ["Te veel gebaren leidt af","Te veel gebaren leiden af"], "afleiden.", ["v-gebaren"]),
    FB("Ze kwam heel ___ over tijdens haar presentatie.", ["zelfverzekerd"], "Seguro.", ["v-zelfverzekerd-overkomen"], choices=["zelfverzekerd","zenuwachtig","monotoon"], tr="Ela pareceu muito segura durante a apresentação."),
    FE(["Hij","komt","zelfverzekerd","op."], 3, "over.", "overkomen.", ["v-zelfverzekerd-overkomen"]),
    LI("Kijk niet alleen naar je dia's, maar ook naar de zaal.", ["Kijk niet alleen naar je dia's, maar ook naar de zaal","Kijk niet alleen naar je dia's maar ook naar de zaal"], "Não olhes só para os diapositivos, olha também para a sala.", "Dica.", ["v-oogcontact"]),
    MC("Em PT gesticula-se muitas vezes mais do que em NL. Numa apresentação neerlandesa…", ["*gestos moderados costumam funcionar melhor","é proibido gesticular|Não.","deve-se gesticular o dobro|Não."], "Intercultural (tendência geral).", ["v-gebaren"]),
  ], diff=4, mins=5)

L(13, "Envolver o público", "Mag ik even handopsteken?",
  ["Fazer o público participar"],
  vocab=[X("v-publiek-betrekken","het publiek betrekken","envolver o público","verb"), X("v-door-handopsteken","door handopsteken","de braço no ar"),
         X("v-interactief","interactief","interativo","adjective")],
  ex=[("Betrek het publiek met een vraag.","Envolve o público com uma pergunta."),("Wie fietst er elke dag? Even door handopsteken.","Quem anda de bicicleta todos os dias? Braço no ar, por favor."),("Een interactieve presentatie blijft beter hangen.","Uma apresentação interativa fica melhor na memória.")],
  review=["v-publiek","v-betrekken-bij"],
  cefr=C, exs=[
    MA([("het publiek betrekken","envolver o público"),("door handopsteken","de braço no ar"),("interactief","interativo"),("betrekken bij","envolver em")], "Público.", ["v-publiek-betrekken","v-door-handopsteken","v-interactief","v-betrekken-bij"]),
    TR("pt-nl","Envolve o público com uma pergunta.", ["Betrek het publiek met een vraag","Betrek het publiek bij je verhaal met een vraag"], "betrekken.", ["v-publiek-betrekken"]),
    TR("pt-nl","Braço no ar, por favor.", ["Even door handopsteken","Door handopsteken, alstublieft"], "Expressão.", ["v-door-handopsteken"]),
    MC("Qual é uma boa forma de envolver o público?", ["*Wie van jullie heeft dit zelf meegemaakt?","Iedereen stil!|Não.","Ik praat, jullie luisteren.|Não."], "Técnica.", ["v-publiek-betrekken"]),
    FB("Een ___ presentatie blijft beter hangen.", ["interactieve"], "de presentatie → -e.", ["v-interactief"], choices=["interactieve","interactief","interactie"], tr="Uma apresentação interativa fica melhor na memória."),
    FE(["Wie","fietst","er","elke","dag?","Door","handopsteken,","alstublieft.","Hoeveel","handen","ziet","we?"], 10, "zien", "we: zien.", ["v-door-handopsteken"]),
    LI("Ik ben benieuwd naar jullie ervaringen.", ["Ik ben benieuwd naar jullie ervaringen"], "Tenho curiosidade em saber das vossas experiências.", "Envolver.", ["v-publiek-betrekken"]),
    WO("Envolve o público.", ["Betrek","het","publiek"], "Imperativo.", ["v-publiek-betrekken"]),
  ], diff=4, mins=5)

L(14, "Contar histórias numa apresentação", "Storytelling en metaforen.",
  ["Usar histórias e metáforas para explicar"],
  vocab=[N("v-storytelling","storytelling","contar histórias (técnica)","de"), N("v-metafoor","metafoor","metáfora","de","metaforen")],
  ex=[("Met storytelling maak je cijfers menselijk.","Com storytelling tornas os números humanos."),("«Ons team is een orkest» is een metafoor.","«A nossa equipa é uma orquestra» é uma metáfora.")],
  review=["v-anekdote","v-stelt-u-zich-voor"],
  cefr=C, exs=[
    MA([("storytelling","contar histórias"),("metafoor","metáfora"),("anekdote","episódio"),("stelt u zich eens voor","imagine")], "Storytelling.", ["v-storytelling","v-metafoor","v-anekdote","v-stelt-u-zich-voor"]),
    MC("Qual é uma metáfora?", ["*Een bedrijf is een schip: de directeur staat aan het roer.","Het bedrijf heeft 50 medewerkers.|Facto.","Het bedrijf is groot.|Descrição."], "Identificar.", ["v-metafoor"]),
    TR("pt-nl","Com histórias tornas os números humanos.", ["Met storytelling maak je cijfers menselijk","Met verhalen maak je cijfers menselijk"], "storytelling.", ["v-storytelling"]),
    TR("pt-nl","Imagine que…", ["Stelt u zich eens voor dat","Stel je eens voor dat"], "Revisão.", ["v-stelt-u-zich-voor"]),
    FB("Een goede ___ maakt een abstract idee concreet.", ["metafoor"], "Metáfora.", ["v-metafoor"], choices=["metafoor","storytelling","dia"], tr="Uma boa metáfora torna uma ideia abstrata concreta."),
    FE(["Een","metafoor","maken","het","concreet."], 2, "maakt", "Singular: maakt.", ["v-metafoor"]),
    SW("Crie uma metáfora (1–2 frases) para explicar «aprender uma língua» numa apresentação.", ["Een taal leren is als een huis bouwen: eerst leg je het fundament met grammatica, daarna bouw je de muren met woorden, en pas aan het eind kun je erin wonen."], ["Metáfora clara","Ligação ao tema"], 15, "Criar.", ["v-metafoor"]),
    LI("Stelt u zich eens voor: het is 1953 en het water staat tot aan het dak.", ["Stelt u zich eens voor: het is 1953 en het water staat tot aan het dak","Stelt u zich eens voor, het is 1953 en het water staat tot aan het dak"], "Imagine: é 1953 e a água chega ao telhado.", "Abertura narrativa (cheias de 1953).", ["v-stelt-u-zich-voor"]),
  ], diff=5, mins=5)

L(15, "Dar vida aos números", "Cijfers tot leven brengen.",
  ["Apresentar números de forma compreensível"],
  vocab=[X("v-cijfers-tot-leven","cijfers tot leven brengen","dar vida aos números"), X("v-visualiseren","visualiseren","visualizar","verb")],
  ex=[("Breng je cijfers tot leven met een vergelijking.","Dá vida aos números com uma comparação."),("Visualiseer de groei met een eenvoudige grafiek.","Visualiza o crescimento com um gráfico simples."),("Dat is zo groot als drie voetbalvelden.","Isso é do tamanho de três campos de futebol.")],
  review=["v-cijfers","v-grafiek","v-ter-vergelijking"],
  cefr=C, exs=[
    MA([("cijfers tot leven brengen","dar vida aos números"),("visualiseren","visualizar"),("ter vergelijking","para comparação"),("grafiek","gráfico")], "Números.", ["v-cijfers-tot-leven","v-visualiseren","v-ter-vergelijking","v-grafiek"]),
    MC("Qual é mais memorável?", ["*De nieuwe parkeergarage is zo groot als drie voetbalvelden.","De garage heeft 21.000 m².|Correto mas abstrato.","De garage is groot.|Vago."], "Comparação concreta.", ["v-cijfers-tot-leven"]),
    TR("pt-nl","Visualiza o crescimento.", ["Visualiseer de groei"], "Imperativo.", ["v-visualiseren"]),
    TR("pt-nl","Dá vida aos números.", ["Breng je cijfers tot leven","Breng de cijfers tot leven"], "Expressão.", ["v-cijfers-tot-leven"]),
    FB("Ter ___: dat is evenveel als een volle stadionzaal.", ["vergelijking"], "Comparação.", ["v-ter-vergelijking"], choices=["vergelijking","illustratie","leven"], tr="Para comparação: é tanto como um estádio cheio."),
    FE(["Breng","je","cijfers","tot","levens."], 4, "leven.", "Expressão fixa: tot leven.", ["v-cijfers-tot-leven"]),
    SW("Transforme este número num exemplo concreto (1–2 frases): «A empresa poupou 12.000 litros de água por mês.»", ["Dat is evenveel water als een gezin van vier in ruim twee maanden gebruikt. (exemplo de comparação — confirme os números reais)"], ["Comparação concreta","Fácil de imaginar"], 15, "Concretizar.", ["v-cijfers-tot-leven"]),
    LI("Eén op de drie fietsen in deze stad is elektrisch, zo blijkt uit onze (fictieve) telling.", ["Eén op de drie fietsen in deze stad is elektrisch, zo blijkt uit onze fictieve telling","Een op de drie fietsen in deze stad is elektrisch, zo blijkt uit onze fictieve telling"], "Uma em cada três bicicletas nesta cidade é elétrica, segundo a nossa contagem (fictícia).", "Proporção.", ["v-cijfers"]),
  ], diff=5, mins=5)

L(16, "A mensagem-chave", "Als u één ding onthoudt…",
  ["Destacar e repetir a mensagem principal"],
  vocab=[X("v-als-u-een-ding-onthoudt","als u één ding onthoudt, dan…","se só se lembrarem de uma coisa…"), X("v-de-rode-draad","de rode draad","o fio condutor")],
  ex=[("Als u vandaag één ding onthoudt, dan is het dit.","Se hoje só se lembrarem de uma coisa, que seja isto."),("Duurzaamheid is de rode draad in mijn verhaal.","A sustentabilidade é o fio condutor da minha história.")],
  review=["v-pakkend"],
  cefr=C, exs=[
    MA([("als u één ding onthoudt…","se só se lembrarem de uma coisa…"),("de rode draad","o fio condutor"),("kernboodschap","mensagem-chave"),("pakkend","cativante")], "Mensagem.", ["v-als-u-een-ding-onthoudt","v-de-rode-draad","v-pakkend"]),
    TR("pt-nl","Se só se lembrarem de uma coisa, é isto.", ["Als u één ding onthoudt, dan is het dit","Als u een ding onthoudt, is het dit"], "Expressão.", ["v-als-u-een-ding-onthoudt"]),
    TR("pt-nl","É o fio condutor da história.", ["Het is de rode draad in het verhaal","Het is de rode draad van het verhaal"], "rode draad.", ["v-de-rode-draad"]),
    MC("«De rode draad» de uma apresentação é…", ["*a ideia que liga todas as partes","a cor dos diapositivos|Literal.","o final|Não."], "Sentido.", ["v-de-rode-draad"]),
    FB("Herhaal je ___ aan het begin en aan het eind.", ["kernboodschap"], "Mensagem-chave.", [], choices=["kernboodschap","rode draad","dia"], tr="Repete a mensagem-chave no início e no fim."),
    FE(["Dat","is","het","rode","draad","van","mijn","verhaal."], 2, "de", "de draad.", ["v-de-rode-draad"]),
    LI("Als u vandaag één ding onthoudt: begin klein, maar begin.", ["Als u vandaag één ding onthoudt: begin klein, maar begin","Als u vandaag een ding onthoudt: begin klein, maar begin"], "Se hoje se lembrarem de uma coisa: comecem pequeno, mas comecem.", "Fecho forte.", ["v-als-u-een-ding-onthoudt"]),
    SW("Escreva a mensagem-chave (1 frase) e a frase de fecho com «Als u één ding onthoudt…» para uma apresentação sobre aprender neerlandês.", ["Kernboodschap: elke dag een beetje Nederlands is beter dan één keer per week veel.\nSlot: Als u één ding onthoudt, dan is het dit: tien minuten per dag maakt het verschil."], ["Mensagem clara","Fecho"], 20, "Mensagem.", []),
  ], diff=4, mins=5)

L(17, "Materiais de apoio", "Een spiekbriefje en de beamer.",
  ["Falar dos materiais de uma apresentação"],
  vocab=[N("v-spiekbriefje","spiekbriefje","cábula|cartão de notas","het"), N("v-beamer","beamer","projetor","de","beamers")],
  ex=[("Ik heb een spiekbriefje met de kernwoorden.","Tenho um cartão com as palavras-chave."),("Werkt de beamer?","O projetor funciona?")],
  review=["v-dia","v-microfoon","v-kernwoord"],
  cefr=C, exs=[
    MA([("spiekbriefje","cartão de notas"),("beamer","projetor"),("microfoon","microfone"),("dia","diapositivo")], "Materiais.", ["v-spiekbriefje","v-beamer","v-microfoon","v-dia"]),
    AR("spiekbriefje", "cartão de notas", "het", "Diminutivo → het.", ["v-spiekbriefje"]),
    MC("«Beamer» em NL é…", ["*o projetor (falso amigo de BMW em inglês!)","um carro|Não.","um ecrã|Não exatamente."], "Falso amigo.", ["v-beamer"]),
    TR("pt-nl","O projetor funciona?", ["Werkt de beamer","Werkt de beamer?","Doet de beamer het"], "beamer.", ["v-beamer"]),
    TR("pt-nl","Tenho um cartão com as palavras-chave.", ["Ik heb een spiekbriefje met de kernwoorden"], "spiekbriefje.", ["v-spiekbriefje"]),
    FB("Op mijn ___ staan alleen kernwoorden, geen hele zinnen.", ["spiekbriefje"], "Cartão.", ["v-spiekbriefje"], choices=["spiekbriefje","beamer","dia"], tr="No meu cartão só estão palavras-chave, não frases inteiras."),
    FE(["De","spiekbriefje","ligt","op","tafel."], 0, "Het", "het spiekbriefje.", ["v-spiekbriefje"]),
    LI("Kunt u de microfoon iets dichter bij uw mond houden?", ["Kunt u de microfoon iets dichter bij uw mond houden","Kunt u de microfoon iets dichter bij uw mond houden?"], "Pode segurar o microfone um pouco mais perto da boca?", "Pedido técnico.", ["v-microfoon"]),
    MC("Melhor prática com notas:", ["*palavras-chave, não o texto todo","ler o texto inteiro|Monótono.","não ter nada|Arriscado."], "Dica.", ["v-spiekbriefje"]),
  ], diff=3, mins=5)

L(18, "Quando a técnica falha", "De beamer doet het niet!",
  ["Reagir com calma a problemas técnicos"],
  vocab=[X("v-improviseren","improviseren","improvisar","verb"), X("v-een-back-up","een back-up","uma cópia de segurança")],
  ex=[("De beamer doet het niet, dus ik ga even improviseren.","O projetor não funciona, por isso vou improvisar."),("Heb je een back-up op een usb-stick?","Tens uma cópia numa pen?")],
  review=["v-storing"],
  cefr=C, exs=[
    MA([("improviseren","improvisar"),("een back-up","cópia de segurança"),("storing","avaria"),("inspelen op","reagir a")], "Imprevistos.", ["v-improviseren","v-een-back-up","v-storing"]),
    MC("O projetor avaria a meio. A melhor reação:", ["*Geen probleem, ik vertel het gewoon zonder dia's.","Paniek en stoppen.|Não.","Wachten tot het werkt, in stilte.|Desconfortável."], "Calma.", ["v-improviseren"]),
    TR("pt-nl","Vou improvisar.", ["Ik ga improviseren","Ik ga even improviseren"], "improviseren.", ["v-improviseren"]),
    TR("pt-nl","Tens uma cópia de segurança?", ["Heb je een back-up","Heb je een back-up?"], "back-up.", ["v-een-back-up"]),
    FB("Zet je presentatie altijd ook op een usb-stick als ___.", ["back-up"], "Cópia.", ["v-een-back-up"], choices=["back-up","beamer","storing"], tr="Põe sempre a apresentação numa pen como cópia."),
    FE(["De","beamer","doen","het","niet."], 2, "doet", "Singular: doet.", ["v-improviseren"]),
    LI("Terwijl de technicus het oplost, stel ik u alvast een vraag.", ["Terwijl de technicus het oplost, stel ik u alvast een vraag","Terwijl de technicus het oplost stel ik u alvast een vraag"], "Enquanto o técnico resolve, faço-vos já uma pergunta.", "Ganhar tempo.", []),
    WO("O projetor não funciona.", ["De","beamer","doet","het","niet"], "Ordem.", ["v-improviseren"]),
  ], diff=4, mins=5)

L(19, "Branca total", "Ik heb even een black-out.",
  ["Recuperar de uma branca durante a apresentação"],
  vocab=[N("v-black-out","black-out","branca|bloqueio","de"), X("v-terugbladeren","even terugbladeren","voltar atrás (nas notas/diapositivos)","verb")],
  ex=[("Sorry, ik heb even een black-out.","Desculpem, tive uma branca."),("Ik blader even terug naar de vorige dia.","Volto um momento ao diapositivo anterior."),("Waar was ik gebleven?","Onde é que eu ia?")],
  review=["v-de-draad-kwijt","v-waar-was-ik"],
  cefr=C, exs=[
    MA([("black-out","branca"),("even terugbladeren","voltar atrás"),("de draad kwijt zijn","perder o fio"),("waar was ik gebleven?","onde é que eu ia?")], "Recuperar.", ["v-black-out","v-terugbladeren","v-de-draad-kwijt","v-waar-was-ik"]),
    MC("Teve uma branca. O mais natural:", ["*Sorry, waar was ik gebleven? Ah ja…","Fingir que nada aconteceu, em silêncio longo.|Desconfortável.","Ir-se embora.|Não."], "Recuperar.", ["v-waar-was-ik"]),
    TR("pt-nl","Tive uma branca.", ["Ik heb even een black-out","Ik had even een black-out"], "black-out.", ["v-black-out"]),
    TR("pt-nl","Volto ao diapositivo anterior.", ["Ik blader even terug naar de vorige dia","Ik ga even terug naar de vorige dia"], "terugbladeren.", ["v-terugbladeren"]),
    FB("Ik ben even de ___ kwijt.", ["draad"], "Expressão.", ["v-de-draad-kwijt"], choices=["draad","weg","tekst"], tr="Perdi o fio à meada."),
    FE(["Waar","ben","ik","gebleven?"], 1, "was", "Expressão: waar was ik gebleven?", ["v-waar-was-ik"]),
    LI("Geen zorgen, dat overkomt iedereen weleens.", ["Geen zorgen, dat overkomt iedereen weleens","Geen zorgen dat overkomt iedereen weleens"], "Não se preocupe, isso acontece a toda a gente.", "Tranquilizar.", ["v-black-out"]),
    MC("Uma técnica preventiva contra brancas:", ["*ter um cartão com a estrutura","decorar o texto palavra a palavra|Aumenta o risco.","não dormir|Não."], "Dica.", ["v-spiekbriefje"]),
  ], diff=4, mins=5)

L(20, "Perguntas hostis", "Een vraag terugkaatsen.",
  ["Lidar com perguntas agressivas com calma"],
  vocab=[X("v-vraag-terugkaatsen","een vraag terugkaatsen","devolver uma pergunta"), X("v-terechte-vraag","dat is een terechte vraag","é uma pergunta pertinente")],
  ex=[("Ze kaatste de vraag terug: «Wat zou u dan doen?»","Ela devolveu a pergunta: «O que faria então?»"),("Dat is een terechte vraag; laat me het uitleggen.","É uma pergunta pertinente; deixe-me explicar.")],
  review=["v-kritische-vraag","v-terecht","v-ontwijken"],
  cefr=C, exs=[
    MA([("een vraag terugkaatsen","devolver uma pergunta"),("dat is een terechte vraag","pergunta pertinente"),("kritische vraag","pergunta crítica"),("ontwijken","fugir a")], "Perguntas.", ["v-vraag-terugkaatsen","v-terechte-vraag","v-kritische-vraag","v-ontwijken"]),
    MC("Pergunta agressiva: «Dit plan is toch gewoon geldverspilling?» Boa resposta:", ["*Dat is een terechte vraag. Laat me uitleggen waarom het zich terugverdient.","Nee!|Seco.","Volgende vraag.|Foge."], "Calma.", ["v-terechte-vraag"]),
    TR("pt-nl","É uma pergunta pertinente.", ["Dat is een terechte vraag"], "Expressão.", ["v-terechte-vraag"]),
    TR("pt-nl","Ela devolveu a pergunta.", ["Ze kaatste de vraag terug","Zij kaatste de vraag terug"], "terugkaatsen.", ["v-vraag-terugkaatsen"]),
    FB("Hij kaatste de vraag ___ naar de journalist.", ["terug"], "Separável.", ["v-vraag-terugkaatsen"], choices=["terug","weg","op"], tr="Ele devolveu a pergunta ao jornalista."),
    FE(["Dat","is","een","terecht","vraag."], 3, "terechte", "de vraag → -e.", ["v-terechte-vraag"]),
    LI("Ik begrijp uw zorg; laten we naar de feiten kijken.", ["Ik begrijp uw zorg; laten we naar de feiten kijken","Ik begrijp uw zorg, laten we naar de feiten kijken"], "Compreendo a sua preocupação; vamos olhar para os factos.", "Desescalar.", ["v-kritische-vraag"]),
    MC("Devolver a pergunta é útil quando…", ["*a pergunta esconde uma opinião que vale a pena explicitar","não sabe a resposta e quer fugir|Pouco honesto.","sempre|Não."], "Uso.", ["v-vraag-terugkaatsen"]),
  ], diff=5, mins=5)

L(21, "Perguntas fora do tema", "Daar kom ik na afloop op terug.",
  ["Adiar perguntas fora do âmbito com cortesia"],
  vocab=[X("v-na-afloop","na afloop","no fim|depois (do evento)"), X("v-buiten-de-scope","dat valt buiten het onderwerp","isso está fora do tema")],
  ex=[("Daar kom ik na afloop graag op terug.","Volto com gosto a isso no fim."),("Die vraag valt een beetje buiten het onderwerp.","Essa pergunta está um pouco fora do tema.")],
  review=["v-buiten-scope","v-terugkomen-op"],
  cefr=C, exs=[
    MA([("na afloop","no fim"),("dat valt buiten het onderwerp","está fora do tema"),("terugkomen op","voltar a"),("dat valt buiten…","isso está fora de…")], "Adiar.", ["v-na-afloop","v-buiten-de-scope","v-terugkomen-op","v-buiten-scope"]),
    TR("pt-nl","Volto a isso no fim.", ["Daar kom ik na afloop op terug","Daar kom ik na afloop graag op terug"], "na afloop.", ["v-na-afloop"]),
    TR("pt-nl","Está fora do tema.", ["Dat valt buiten het onderwerp"], "Expressão.", ["v-buiten-de-scope"]),
    MC("Para adiar com cortesia:", ["*Goede vraag. Mag ik daar na afloop even met u over praten?","Niet relevant.|Rude.","Stil!|Rude."], "Cortesia.", ["v-na-afloop"]),
    FB("Na ___ is er koffie en gelegenheid om na te praten.", ["afloop"], "No fim.", ["v-na-afloop"], choices=["afloop","loop","afsluiting"], tr="No fim há café e oportunidade para conversar."),
    FE(["Die","vraag","vallen","buiten","het","onderwerp."], 2, "valt", "Singular: valt.", ["v-buiten-de-scope"]),
    LI("Dat is een interessant punt, maar het valt buiten het bestek van deze presentatie.", ["Dat is een interessant punt, maar het valt buiten het bestek van deze presentatie","Dat is een interessant punt maar het valt buiten het bestek van deze presentatie"], "É um ponto interessante, mas está fora do âmbito desta apresentação.", "Formal.", ["v-buiten-de-scope"]),
    WO("No fim.", ["Na","afloop"], "Expressão.", ["v-na-afloop"]),
  ], diff=4, mins=5)

L(22, "Pitch: problema e solução", "Het probleem schetsen.",
  ["Estruturar um pitch em problema, solução e apelo"],
  vocab=[X("v-probleem-schetsen","het probleem schetsen","descrever o problema"), X("v-call-to-action","een call to action","um apelo à ação")],
  ex=[("Begin met het probleem te schetsen.","Começa por descrever o problema."),("Eindig met een duidelijke call to action.","Termina com um apelo à ação claro.")],
  review=["v-pitch","v-meerwaarde","v-doelgroep"],
  cefr=C, exs=[
    MA([("het probleem schetsen","descrever o problema"),("een call to action","apelo à ação"),("meerwaarde","valor acrescentado"),("doelgroep","público-alvo")], "Pitch.", ["v-probleem-schetsen","v-call-to-action","v-meerwaarde","v-doelgroep"]),
    MC("Ordem de um pitch eficaz:", ["*problema → solução → meerwaarde → call to action","call to action → nada|Não.","solução → fim|Falta o problema."], "Estrutura.", ["v-probleem-schetsen"]),
    TR("pt-nl","Começa por descrever o problema.", ["Begin met het probleem te schetsen","Begin met het schetsen van het probleem"], "schetsen.", ["v-probleem-schetsen"]),
    TR("pt-nl","Termina com um apelo à ação.", ["Eindig met een call to action","Sluit af met een call to action"], "Expressão.", ["v-call-to-action"]),
    FB("Wat is de ___ van jullie product voor ouderen?", ["meerwaarde"], "Valor acrescentado.", ["v-meerwaarde"], choices=["meerwaarde","doelgroep","pitch"], tr="Qual é o valor acrescentado do vosso produto para idosos?"),
    FE(["Een","goede","call","to","action","zijn","concreet."], 5, "is", "Singular: is.", ["v-call-to-action"]),
    SW("Escreva um pitch de 5 frases para uma app que ajuda imigrantes a aprender o vocabulário da gemeente: problema, solução, público-alvo, valor acrescentado, call to action.", ["Veel nieuwkomers begrijpen de brieven van de gemeente niet. Onze app legt elke brief uit in eenvoudige taal. Onze doelgroep zijn nieuwkomers in hun eerste twee jaar. De meerwaarde: minder stress en minder boetes. Download de app vandaag en probeer het eerste maand gratis!"], ["5 partes","Concreto"], 50, "Pitch.", ["v-probleem-schetsen","v-call-to-action"]),
    LI("In twee minuten moet je investeerders overtuigen.", ["In twee minuten moet je investeerders overtuigen","In 2 minuten moet je investeerders overtuigen"], "Em dois minutos tens de convencer investidores.", "Contexto.", ["v-pitch"]),
  ], diff=5, mins=6)

L(23, "Falar com investidores", "Omzet, rendement, winstgevend.",
  ["Usar vocabulário financeiro básico num pitch"],
  vocab=[N("v-omzet","omzet","volume de negócios|faturação","de"), N("v-rendement","rendement","rendimento|retorno","het"),
         X("v-winstgevend","winstgevend","lucrativo","adjective")],
  ex=[("Onze omzet is dit jaar verdubbeld.","O nosso volume de negócios duplicou este ano."),("Investeerders willen rendement zien.","Os investidores querem ver retorno."),("Over twee jaar zijn we winstgevend.","Daqui a dois anos seremos lucrativos.")],
  review=["v-investeren","v-verdubbelen"],
  cefr=C, exs=[
    MA([("omzet","volume de negócios"),("rendement","retorno"),("winstgevend","lucrativo"),("investeren","investir")], "Finanças.", ["v-omzet","v-rendement","v-winstgevend","v-investeren"]),
    MC("Diferença entre omzet e winst:", ["*omzet = vendas totais; winst = o que sobra depois dos custos","iguais|Não.","winst = vendas|É o contrário."], "Conceitos.", ["v-omzet"]),
    AR("rendement", "retorno", "het", "Het rendement.", ["v-rendement"]),
    TR("pt-nl","O volume de negócios duplicou.", ["De omzet is verdubbeld","Onze omzet is verdubbeld"], "verdubbelen.", ["v-omzet"]),
    TR("pt-nl","Daqui a dois anos seremos lucrativos.", ["Over twee jaar zijn we winstgevend","Over twee jaar zijn wij winstgevend"], "winstgevend.", ["v-winstgevend"]),
    FB("Investeerders willen vooral ___ zien.", ["rendement"], "Retorno.", ["v-rendement"], choices=["rendement","omzet","winstgevend"], tr="Os investidores querem sobretudo ver retorno."),
    FE(["Het","omzet","stijgt","elk","jaar."], 0, "De", "de omzet.", ["v-omzet"]),
    LI("We verwachten volgend jaar winstgevend te zijn.", ["We verwachten volgend jaar winstgevend te zijn","Wij verwachten volgend jaar winstgevend te zijn"], "Esperamos ser lucrativos no próximo ano.", "Previsão.", ["v-winstgevend"]),
    MC("Num pitch, prometer números sem base…", ["*mina a credibilidade","impressiona sempre|Não.","é obrigatório|Não."], "Ética.", ["v-rendement"]),
  ], diff=5, mins=5)

L(24, "Apresentações online", "Camera aan, achtergrond vervagen.",
  ["Apresentar com qualidade em videoconferência"],
  vocab=[X("v-camera-aan","je camera aanzetten","ligar a câmara","verb"), X("v-achtergrond-vervagen","je achtergrond vervagen","desfocar o fundo","verb"),
         N("v-breakout-room","breakout-room","sala de grupo (online)","de")],
  ex=[("Wil iedereen zijn camera aanzetten?","Toda a gente pode ligar a câmara?"),("Ik vervaag even mijn achtergrond.","Vou desfocar o fundo."),("We gaan nu tien minuten in breakout-rooms.","Vamos agora dez minutos para salas de grupo.")],
  review=["v-scherm-delen","v-op-mute","v-chat"],
  cefr=C, exs=[
    MA([("je camera aanzetten","ligar a câmara"),("je achtergrond vervagen","desfocar o fundo"),("breakout-room","sala de grupo"),("je scherm delen","partilhar o ecrã")], "Online.", ["v-camera-aan","v-achtergrond-vervagen","v-breakout-room","v-scherm-delen"]),
    TR("pt-nl","Toda a gente pode ligar a câmara?", ["Wil iedereen zijn camera aanzetten","Wil iedereen de camera aanzetten","Wil iedereen zijn camera aanzetten?"], "aanzetten.", ["v-camera-aan"]),
    TR("pt-nl","Vamos para salas de grupo.", ["We gaan in breakout-rooms","We gaan naar de breakout-rooms"], "breakout-room.", ["v-breakout-room"]),
    MC("Numa apresentação online longa, ajuda…", ["*pedir reações no chat a cada 10 minutos","falar 60 minutos sem parar|Não.","desligar a câmara|Menos contacto."], "Dica.", ["v-chat"]),
    FB("Ik ___ even mijn scherm, zien jullie het?", ["deel"], "Partilhar.", ["v-scherm-delen"], choices=["deel","deelt","geef"], tr="Vou partilhar o ecrã, estão a ver?"),
    FE(["Kun","je","je","camera","aanzet?"], 4, "aanzetten?", "Infinitivo.", ["v-camera-aan"]),
    LI("Typ je vragen gerust in de chat.", ["Typ je vragen gerust in de chat","Typ je vragen gerust in de chat."], "Escrevam à vontade as perguntas no chat.", "Instrução.", ["v-chat"]),
    WO("Desfoca o fundo.", ["Vervaag","je","achtergrond"], "Imperativo.", ["v-achtergrond-vervagen"]),
  ], diff=3, mins=5)

L(25, "Webinars", "Deelnemers en de chat in de gaten houden.",
  ["Moderar um webinar"],
  vocab=[N("v-deelnemers","deelnemers","participantes","de"), X("v-chat-in-de-gaten","de chat in de gaten houden","ficar de olho no chat")],
  ex=[("Er zijn vandaag tachtig deelnemers.","Hoje há oitenta participantes."),("Mijn collega houdt de chat in de gaten.","A minha colega fica de olho no chat.")],
  review=["v-webinar","v-in-de-gaten-houden"],
  cefr=C, exs=[
    MA([("deelnemers","participantes"),("de chat in de gaten houden","acompanhar o chat"),("webinar","webinar"),("in de gaten houden","vigiar")], "Webinar.", ["v-deelnemers","v-chat-in-de-gaten","v-webinar","v-in-de-gaten-houden"]),
    TR("pt-nl","Hoje há oitenta participantes.", ["Er zijn vandaag tachtig deelnemers","Vandaag zijn er tachtig deelnemers","Er zijn vandaag 80 deelnemers"], "deelnemers.", ["v-deelnemers"]),
    TR("pt-nl","A minha colega fica de olho no chat.", ["Mijn collega houdt de chat in de gaten"], "in de gaten houden.", ["v-chat-in-de-gaten"]),
    MC("Num webinar com muitos participantes, é útil…", ["*ter um colega a moderar o chat","responder a tudo ao mesmo tempo sozinho|Difícil.","fechar o chat|Perde interação."], "Organização.", ["v-chat-in-de-gaten"]),
    FB("Alle ___ krijgen na afloop de slides per mail.", ["deelnemers"], "Participantes.", ["v-deelnemers"], choices=["deelnemers","webinars","chats"], tr="Todos os participantes recebem no fim os diapositivos por e-mail."),
    FE(["Er","is","tachtig","deelnemers."], 1, "zijn", "Plural: zijn.", ["v-deelnemers"]),
    LI("Ik zie een vraag in de chat van Mark: hoe lang duurt het traject?", ["Ik zie een vraag in de chat van Mark: hoe lang duurt het traject","Ik zie een vraag in de chat van Mark: hoe lang duurt het traject?"], "Vejo uma pergunta do Mark no chat: quanto tempo dura o percurso?", "Moderar.", ["v-chat-in-de-gaten"]),
    WO("Há oitenta participantes.", ["Er","zijn","tachtig","deelnemers"], "Ordem.", ["v-deelnemers"]),
  ], diff=3, mins=5)

L(26, "Avaliar depois", "Een evaluatieformulier.",
  ["Pedir e analisar feedback depois de apresentar"],
  vocab=[X("v-evalueren","evalueren","avaliar","verb"), N("v-evaluatieformulier","evaluatieformulier","formulário de avaliação","het"),
         N("v-terugkoppeling","terugkoppeling","retorno|feedback","de")],
  ex=[("Na de workshop evalueren we samen.","Depois do workshop avaliamos juntos."),("Wilt u het evaluatieformulier invullen?","Pode preencher o formulário de avaliação?"),("Bedankt voor de terugkoppeling.","Obrigado pelo retorno.")],
  review=["v-feedback","v-tops-en-tips"],
  cefr=C, exs=[
    MA([("evalueren","avaliar"),("evaluatieformulier","formulário de avaliação"),("terugkoppeling","retorno"),("feedback","feedback")], "Avaliação.", ["v-evalueren","v-evaluatieformulier","v-terugkoppeling","v-feedback"]),
    AR("evaluatieformulier", "formulário de avaliação", "het", "het formulier.", ["v-evaluatieformulier"]),
    TR("pt-nl","Pode preencher o formulário?", ["Wilt u het evaluatieformulier invullen","Wilt u het evaluatieformulier invullen?","Kunt u het evaluatieformulier invullen"], "invullen.", ["v-evaluatieformulier"]),
    TR("pt-nl","Obrigado pelo retorno.", ["Bedankt voor de terugkoppeling","Dank voor de terugkoppeling"], "terugkoppeling.", ["v-terugkoppeling"]),
    FB("Na afloop ___ we de sessie samen.", ["evalueren"], "Avaliar.", ["v-evalueren"], choices=["evalueren","evaluatie","geëvalueerd"], tr="No fim avaliamos a sessão juntos."),
    FE(["De","evaluatieformulier","is","anoniem."], 0, "Het", "het formulier.", ["v-evaluatieformulier"]),
    LI("Uit de evaluatie bleek dat de sessie te lang was.", ["Uit de evaluatie bleek dat de sessie te lang was"], "Da avaliação resultou que a sessão foi demasiado longa.", "Analisar.", ["v-evalueren"]),
    MC("Ao receber feedback negativo, a atitude mais profissional é…", ["*agradecer e perguntar por exemplos concretos","defender-se logo|Não.","ignorar|Não."], "Atitude.", ["v-terugkoppeling"]),
  ], diff=4, mins=5)

L(27, "Apresentar em equipa", "Het stokje overdragen.",
  ["Fazer transições entre oradores"],
  vocab=[X("v-stokje-overdragen","het stokje overdragen aan","passar o testemunho a"), X("v-bevlogen","bevlogen","entusiasta|apaixonado","adjective")],
  ex=[("Ik draag nu het stokje over aan mijn collega Mark.","Passo agora o testemunho ao meu colega Mark."),("Ze sprak heel bevlogen over het project.","Ela falou com muito entusiasmo sobre o projeto.")],
  review=["v-dan-kom-ik-bij","v-het-woord-geven"],
  cefr=C, exs=[
    MA([("het stokje overdragen aan","passar o testemunho"),("bevlogen","entusiasta"),("dan kom ik bij…","passo a…"),("het woord geven aan","dar a palavra a")], "Equipa.", ["v-stokje-overdragen","v-bevlogen","v-dan-kom-ik-bij","v-het-woord-geven"]),
    EX("het stokje overdragen", "passar o pauzinho", "De onde vem a imagem?", ["*das corridas de estafetas","de um maestro|Não.","de um jogo de cartas|Não."], "Imagem.", ["v-stokje-overdragen"]),
    TR("pt-nl","Passo o testemunho ao Mark.", ["Ik draag het stokje over aan Mark","Ik draag nu het stokje over aan Mark"], "Separável.", ["v-stokje-overdragen"]),
    TR("pt-nl","Ela falou com muito entusiasmo.", ["Ze sprak heel bevlogen","Zij sprak heel bevlogen"], "bevlogen.", ["v-bevlogen"]),
    FB("Mark gaat u nu meer vertellen over de cijfers; ik draag het ___ aan hem over.", ["stokje"], "Expressão.", ["v-stokje-overdragen"], choices=["stokje","woord","stuur"], tr="O Mark vai agora falar-vos dos números; passo-lhe o testemunho."),
    FE(["Ik","draag","het","stokje","aan","Lisa","op."], 6, "over.", "overdragen.", ["v-stokje-overdragen"]),
    LI("Een bevlogen spreker steekt het publiek aan.", ["Een bevlogen spreker steekt het publiek aan"], "Um orador entusiasta contagia o público.", "Observação.", ["v-bevlogen"]),
    MC("Numa apresentação em equipa, uma boa transição…", ["*resume a parte anterior e apresenta o próximo orador","é um silêncio|Não.","repete tudo|Não."], "Técnica.", ["v-stokje-overdragen"]),
  ], diff=4, mins=5)

L(28, "Um discurso informal", "Het glas heffen op…",
  ["Fazer um pequeno discurso numa festa ou despedida"],
  vocab=[X("v-een-speech-geven","een speech geven","fazer um discurso"), X("v-het-glas-heffen","het glas heffen op","levantar o copo a|brindar a"),
         X("v-toosten","toosten","brindar","verb")],
  ex=[("Op haar afscheid gaf ik een korte speech.","Na despedida dela fiz um pequeno discurso."),("Laten we het glas heffen op Anna!","Vamos brindar à Anna!"),("We toostten op het nieuwe jaar.","Brindámos ao novo ano.")],
  review=["v-proost","v-afscheid-nemen"],
  cefr=C, exs=[
    MA([("een speech geven","fazer um discurso"),("het glas heffen op","brindar a"),("toosten","brindar"),("proost","saúde!")], "Discurso.", ["v-een-speech-geven","v-het-glas-heffen","v-toosten","v-proost"]),
    TR("pt-nl","Vamos brindar à Anna!", ["Laten we het glas heffen op Anna","Laten we het glas heffen op Anna!","Laten we toosten op Anna"], "Expressão.", ["v-het-glas-heffen"]),
    TR("pt-nl","Fiz um pequeno discurso.", ["Ik gaf een korte speech","Ik heb een korte speech gegeven"], "speech geven.", ["v-een-speech-geven"]),
    MC("Estrutura de um discurso de despedida:", ["*agradecer → uma memória engraçada → desejo → brinde","só piadas|Não.","só números|Não."], "Estrutura.", ["v-een-speech-geven"]),
    FB("We ___ op het pensioen van Kees.", ["toostten"], "Passado de toosten.", ["v-toosten"], choices=["toostten","toosten","toostte"], tr="Brindámos à reforma do Kees."),
    FE(["Ik","gaf","een","korte","speech","op","haar","afscheid","gegeven."], 1, "heb", "Com particípio: heb … gegeven.", ["v-een-speech-geven"]),
    SW("Escreva um pequeno discurso (5–6 frases) para a despedida de um colega que se reforma, terminando com um brinde.", ["Beste collega's, vandaag nemen we afscheid van Kees. Dertig jaar lang was hij de vrolijke kracht van onze afdeling. Ik herinner me nog goed hoe hij op mijn eerste dag mijn naam drie keer verkeerd uitsprak. Kees, we gaan je missen, maar we gunnen je een prachtig pensioen. Laten we het glas heffen op Kees: proost!"], ["Agradecimento","Memória","Desejo","Brinde"], 50, "Discurso.", ["v-het-glas-heffen","v-een-speech-geven"]),
    LI("Op de toekomst: proost!", ["Op de toekomst: proost","Op de toekomst: proost!","Op de toekomst, proost"], "Ao futuro: saúde!", "Brinde.", ["v-proost"]),
  ], diff=4, mins=6)

L(29, "Prática: a minha apresentação B2", "Van opening tot applaus.",
  ["Planear e escrever uma apresentação completa de nível B2"],
  vocab=[N("v-applaus","applaus","aplauso","het")],
  ex=[("Na de presentatie volgde een daverend applaus.","Depois da apresentação seguiu-se um aplauso estrondoso.")],
  review=["v-aandacht-vasthouden","v-intonatie","v-publiek-betrekken","v-metafoor","v-cijfers-tot-leven","v-de-rode-draad","v-terechte-vraag","v-na-afloop","v-stokje-overdragen"],
  cefr=C, exs=[
    AR("applaus", "aplauso", "het", "Het applaus.", ["v-applaus"]),
    MA([("de rode draad","fio condutor"),("cijfers tot leven brengen","dar vida aos números"),("het publiek betrekken","envolver o público"),("applaus","aplauso")], "Revisão.", ["v-de-rode-draad","v-cijfers-tot-leven","v-publiek-betrekken","v-applaus"]),
    MC("Qual destas NÃO ajuda a manter a atenção?", ["*Ler todos os diapositivos em voz monótona","Fazer uma pergunta ao público|Ajuda.","Contar uma anedota|Ajuda."], "Revisão.", ["v-aandacht-vasthouden"]),
    TR("pt-nl","Seguiu-se um aplauso estrondoso.", ["Er volgde een daverend applaus","Daarna volgde een daverend applaus"], "applaus.", ["v-applaus"]),
    FE(["Dat","is","een","terecht","vraag."], 3, "terechte", "Revisão: terechte vraag.", ["v-terechte-vraag"]),
    SW("Escreva o guião de uma apresentação de 3 minutos (cerca de 150 palavras) sobre um tema que domina. Inclua: abertura cativante (pergunta, anedota ou «stelt u zich eens voor»), fio condutor, um número tornado concreto, uma metáfora, uma interação com o público, uma frase «Als u één ding onthoudt…» e o agradecimento final.", ["Stelt u zich eens voor: u staat op het perron, de trein is weg, en de volgende gaat pas over een uur. Herkenbaar? Vandaag vertel ik u waarom de fiets de rode draad in mijn leven is geworden. Wie van u fietst dagelijks? Even door handopsteken… Mooi! In Nederland zijn er meer fietsen dan mensen; dat zijn er genoeg om elke inwoner er één te geven en dan nog een paar miljoen over te houden. Voor mij is de fiets als een tweede paar benen: hij brengt me overal, in elk weer. Het bespaart me geld, tijd en een sportschoolabonnement. Als u vandaag één ding onthoudt, dan is het dit: probeer één week lang alles met de fiets te doen. Hartelijk dank voor uw aandacht!"], ["Abertura","Fio condutor","Número concreto","Metáfora","Interação","Mensagem final"], 120, "Apresentação final.", ["v-applaus"]),
  ], diff=5, mins=8)

W()
