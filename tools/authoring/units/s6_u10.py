import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u10")
C = "B1-B2"

L(1, "Ordem dos verbos no fim: o «cacho verbal»", "…dat ik het niet heb kunnen vinden.",
  ["Ordenar vários verbos no fim da subordinada"],
  vocab=[V("v-werkwoordscluster","werkwoordelijke eindgroep","grupo verbal final","noun","de"), V("v-nauwkeurig-volgorde","volgorde","ordem","noun","de"),
         V("v-zou-hebben","zou hebben","teria","expression"), V("v-moeten-worden","moeten worden","ter de ser","expression")],
  ex=[("Hij zegt dat hij het niet heeft kunnen vinden.","Ele diz que não o conseguiu encontrar."),("Ik denk dat het huis verkocht moet worden.","Acho que a casa tem de ser vendida."),("Ze vertelde dat ze graag had willen komen.","Ela contou que teria gostado de vir."),("Let op de volgorde van de werkwoorden.","Atenção à ordem dos verbos.")],
  gram=[G("g-werkwoordcluster","Vários verbos no fim","Na subordinada, todos os verbos vão para o fim. Ordem mais comum: **auxiliar conjugado + modal (infinitivo) + verbo principal**: *…dat hij het niet **heeft kunnen vinden**.* Com particípio, as duas ordens são possíveis: *…dat het **verkocht moet worden** / **moet worden verkocht**.*",
    [("…omdat ik gisteren niet heb kunnen komen.","…porque ontem não pude vir.")])],
  review=["v-heb-kunnen","v-had-moeten","v-dat-conj"],
  cefr=C, exs=[
    MA([("werkwoordelijke eindgroep","grupo verbal final"),("volgorde","ordem"),("zou hebben","teria"),("moeten worden","ter de ser")], "Verbos.", ["v-werkwoordscluster","v-nauwkeurig-volgorde","v-zou-hebben","v-moeten-worden"]),
    WO("Ele diz que não o conseguiu encontrar.", ["Hij","zegt","dat","hij","het","niet","heeft","kunnen","vinden"], "heeft kunnen vinden.", ["v-heb-kunnen"]),
    WO("Acho que a casa tem de ser vendida.", ["Ik","denk","dat","het","huis","verkocht","moet","worden"], "Particípio + modal + worden.", ["v-moeten-worden"], alt=["Ik denk dat het huis moet worden verkocht"]),
    WO("…porque ontem não pude vir.", ["omdat","ik","gisteren","niet","heb","kunnen","komen"], "heb kunnen komen.", ["v-heb-kunnen"]),
    FE(["Ik","weet","dat","hij","heeft","het","niet","kunnen","vinden."], 4, "het niet heeft", "Todos os verbos no fim: dat hij het niet heeft kunnen vinden.", ["v-werkwoordscluster"]),
    FE(["Ze","zei","dat","ze","had","graag","willen","komen."], 4, "graag had", "Advérbio antes do grupo verbal: dat ze graag had willen komen.", ["v-werkwoordscluster"]),
    TR("nl-pt","Ze vertelde dat ze graag had willen komen.", ["Ela contou que teria gostado de vir","Ela disse que gostaria de ter vindo"], "had willen komen.", ["v-zou-hebben"]),
    TR("pt-nl","Acho que ele devia ter ligado.", ["Ik denk dat hij had moeten bellen"], "had moeten bellen.", ["v-had-moeten"]),
    MC("Qual está correta?", ["*…omdat ik het niet heb kunnen afmaken.","…omdat ik heb het niet kunnen afmaken.|Verbo conjugado fora do fim.","…omdat ik het niet afmaken heb gekund.|Ordem e forma erradas."], "Grupo final.", ["v-werkwoordscluster"]),
    LI("Ik had het eerder moeten zeggen.", ["Ik had het eerder moeten zeggen"], "Devia tê-lo dito mais cedo.", "had moeten zeggen.", ["v-had-moeten"]),
  ], diff=5, mins=7)

L(2, "Inversão e posição do sujeito", "Wat ik niet begrijp, is… Daarom heeft de gemeente besloten…",
  ["Aplicar a regra do verbo em 2.ª posição em frases longas"],
  vocab=[V("v-wat-ik-bedoel","wat ik bedoel, is…","o que quero dizer é…","expression")],
  ex=[("Wat ik niet begrijp, is waarom hij weg is.","O que não percebo é porque é que ele se foi embora."),("Daarom heeft de gemeente besloten de weg af te sluiten.","Por isso a câmara decidiu fechar a estrada."),("Desondanks bleef hij optimistisch.","Apesar disso, continuou otimista."),("Vervolgens ging iedereen naar huis.","Em seguida toda a gente foi para casa.")],
  gram=[G("g-v2-lang","V2 em frases longas","A 1.ª posição pode ser **longa** (uma oração inteira, um complemento extenso): *[Wat ik niet begrijp,] **is**…* / *[Na een lange vergadering met alle collega's] **besloot** de directeur…* O verbo conjugado vem logo a seguir, depois o sujeito.",
    [("Na drie jaar hard werken heeft ze eindelijk haar diploma.","Depois de três anos de muito trabalho, ela finalmente tem o diploma.")])],
  review=["v-besluiten","v-vervolgens","v-desondanks","v-daarom","v-daarna","v-woordvolgorde"],
  cefr=C, exs=[
    MA([("besluiten","decidir"),("wat ik bedoel, is…","o que quero dizer é…"),("desondanks","apesar disso"),("vervolgens","em seguida")], "Frases longas.", ["v-besluiten","v-wat-ik-bedoel","v-desondanks","v-vervolgens"]),
    WO("Depois de três anos de muito trabalho, ela finalmente tem o diploma.", ["Na","drie","jaar","hard","werken","heeft","ze","eindelijk","haar","diploma"], "V2 após 1.ª posição longa.", ["v-woordvolgorde"]),
    WO("O que não percebo é porque é que ele se foi embora.", ["Wat","ik","niet","begrijp,","is","waarom","hij","weg","is"], "Oração como 1.ª posição.", ["v-wat-ik-bedoel"]),
    FE(["Desondanks","hij","bleef","optimistisch."], 1, "bleef hij", "Inversão: Desondanks bleef hij…", ["v-desondanks"]),
    FE(["Na","een","lange","vergadering","de","directeur","besloot","te","stoppen."], 4, "besloot de directeur", "V2: Na een lange vergadering besloot de directeur…", ["v-besluiten"]),
    TR("pt-nl","Por isso a câmara decidiu fechar a estrada.", ["Daarom heeft de gemeente besloten de weg af te sluiten","Daarom besloot de gemeente de weg af te sluiten","Daarom heeft de gemeente besloten om de weg af te sluiten"], "Inversão + te.", ["v-besluiten"]),
    TR("nl-pt","Vervolgens ging iedereen naar huis.", ["Em seguida toda a gente foi para casa","Depois foram todos para casa"], "vervolgens.", ["v-vervolgens"]),
    CJ("besluiten","wij","Gisteren hebben we ___ te verhuizen.", ["besloten"], "besluiten → besloten.", ["v-besluiten"], tense="passado-perfeito"),
    LI("Wat ik bedoel, is dat we meer tijd nodig hebben.", ["Wat ik bedoel(,) is dat we meer tijd nodig hebben"], "O que quero dizer é que precisamos de mais tempo.", "wat ik bedoel, is.", ["v-wat-ik-bedoel"]),
    MC("Em «Omdat het regende, bleven we thuis», a 1.ª posição é…", ["*a oração «Omdat het regende»","«we»|O sujeito vem depois do verbo.","«thuis»|Não."], "1.ª posição longa.", ["v-woordvolgorde"]),
  ], diff=5, mins=7)

L(3, "Infinitivo com te e om … te", "Het is belangrijk om… Ik probeer… te… zonder te…",
  ["Usar construções de infinitivo complexas"],
  vocab=[V("v-zonder-te","zonder … te","sem …","expression"), V("v-in-plaats-van-te","in plaats van … te","em vez de …","expression"),
         V("v-het-is-de-bedoeling","het is de bedoeling om … te","a ideia é …","expression")],
  ex=[("Het is de bedoeling om om negen uur te beginnen.","A ideia é começar às nove."),("Hij vertrok zonder iets te zeggen.","Ele saiu sem dizer nada."),("In plaats van te klagen, kun je helpen.","Em vez de te queixares, podes ajudar."),("Om problemen te voorkomen, controleren we alles.","Para evitar problemas, verificamos tudo.")],
  gram=[G("g-om-te-zonder","Om/zonder/in plaats van + te","**om … te** = para (finalidade): *Om problemen te voorkomen…* **zonder … te** = sem: *zonder iets te zeggen*. **in plaats van … te** = em vez de. Separáveis: **te** entre partícula e verbo: *op te bellen, mee te nemen*.",
    [("Ik ga naar huis om uit te rusten.","Vou para casa para descansar.")])],
  review=["v-voorkomen","v-proberen","v-in-plaats-van","v-te"],
  cefr=C, exs=[
    MA([("zonder … te","sem …"),("in plaats van … te","em vez de"),("het is de bedoeling om … te","a ideia é"),("voorkomen","evitar")], "Infinitivo.", ["v-zonder-te","v-in-plaats-van-te","v-het-is-de-bedoeling","v-voorkomen"]),
    WO("Ele saiu sem dizer nada.", ["Hij","vertrok","zonder","iets","te","zeggen"], "zonder … te.", ["v-zonder-te"]),
    WO("Para evitar problemas, verificamos tudo.", ["Om","problemen","te","voorkomen,","controleren","we","alles"], "Verbo, verbo.", ["v-voorkomen"]),
    TR("pt-nl","Vou para casa para descansar.", ["Ik ga naar huis om uit te rusten"], "uit te rusten (separável).", ["v-rusten"]),
    TR("pt-nl","Em vez de te queixares, podes ajudar.", ["In plaats van te klagen(,) kun je helpen","In plaats van te klagen(,) kan je helpen"], "in plaats van te.", ["v-in-plaats-van-te"]),
    TR("nl-pt","Het is de bedoeling om om negen uur te beginnen.", ["A ideia é começar às nove","O objetivo é começar às nove","O plano é começar às nove"], "om om — duas palavras diferentes!", ["v-het-is-de-bedoeling"]),
    FE(["Vergeet","niet","je","paraplu","te","meenemen."], 4, "mee te nemen", "Separável: mee te nemen.", ["v-te"]),
    FE(["Hij","ging","weg","zonder","gedag","zeggen."], 5, "te zeggen", "zonder … te + infinitivo.", ["v-zonder-te"]),
    MC("Em «om om negen uur te beginnen», o primeiro «om» é…", ["*parte de «om … te» (finalidade)","«às» (hora)|Esse é o segundo.","erro|Está certo."], "Dois «om».", ["v-het-is-de-bedoeling"]),
    LI("Hij probeert te stoppen met roken.", ["Hij probeert te stoppen met roken"], "Ele está a tentar deixar de fumar.", "proberen te.", ["v-proberen"]),
  ], diff=5, mins=7)

L(4, "Construções com er", "Er wordt gedanst. Ik heb er drie. Ik denk erover na.",
  ["Reconhecer e usar os vários usos de er"],
  vocab=[V("v-er-existentieel","er is/zijn","há","expression"), V("v-er-aantal","er + número","(substitui o nome) deles","expression",note="Ik heb er drie."),
         V("v-nadenken-over","nadenken over","refletir sobre","expression",note="Ik denk erover na.")],
  ex=[("Er zijn veel toeristen in de stad.","Há muitos turistas na cidade."),("Hoeveel kinderen heb je? — Ik heb er twee.","Quantos filhos tens? — Tenho dois."),("Ik moet erover nadenken.","Tenho de pensar nisso."),("Er wordt hier veel gefietst.","Aqui anda-se muito de bicicleta.")],
  gram=[G("g-er","Quatro usos de er","1) **Existencial**: *Er is een probleem.* 2) **Lugar** (lá): *Ik woon er al jaren.* 3) **Quantidade**: *Ik heb **er** drie* (substitui o nome). 4) **er + preposição** (= isso): *Ik denk **erover** na* / na frase: *Ik denk **er** niet **over** na.* 5) **Passiva impessoal**: *Er wordt gedanst.*",
    [("Ik ben er nooit geweest.","Nunca lá estive."),("Daar heb ik geen zin in.","Não me apetece isso.")])],
  review=["v-er-wordt","v-ervan","v-daarover","v-er-is"],
  cefr=C, exs=[
    MA([("er is/zijn","há"),("er + número","deles"),("nadenken over","refletir sobre"),("er wordt …","passiva impessoal")], "Er.", ["v-er-existentieel","v-er-aantal","v-nadenken-over","v-er-wordt"]),
    TR("pt-nl","Tenho dois. (filhos)", ["Ik heb er twee","Ik heb er 2"], "er + número.", ["v-er-aantal"]),
    TR("pt-nl","Tenho de pensar nisso.", ["Ik moet erover nadenken","Ik moet daarover nadenken","Daar moet ik over nadenken"], "erover nadenken.", ["v-nadenken-over"]),
    TR("nl-pt","Er wordt hier veel gefietst.", ["Aqui anda-se muito de bicicleta","Anda-se muito de bicicleta aqui"], "Passiva impessoal.", ["v-er-wordt"]),
    FE(["Hoeveel","appels","heb","je?","—","Ik","heb","drie."], 7, "er drie", "Com quantidade sem o nome, falta «er»: Ik heb er drie.", ["v-er-aantal"]),
    WO("Não penso nisso.", ["Ik","denk","er","niet","over","na"], "er … over na.", ["v-nadenken-over"]),
    MC("Em «Ik woon er al tien jaar», er significa…", ["*lá (lugar)","há|Não aqui.","deles|Não aqui."], "Er de lugar.", ["v-er-existentieel"]),
    LI("Er wordt op zaterdag op straat gedanst.", ["Er wordt op zaterdag op straat gedanst","Er wordt zaterdag op straat gedanst"], "Ao sábado dança-se na rua.", "Passiva impessoal.", ["v-er-wordt"]),
    FB("Ik heb ___ nog nooit van gehoord.", ["er"], "er … van.", ["v-ervan"], choices=["er","het","dat"], tr="Nunca ouvi falar disso."),
    FB("Ik denk er nog even over ___.", ["na"], "Separável: denk … na.", ["v-nadenken-over"], choices=["na","over","mee"], tr="Vou pensar mais um pouco sobre isso."),
  ], diff=5, mins=8)

L(5, "Frases longas bem construídas", "Juntar subordinadas, infinitivos e inversões.",
  ["Escrever frases complexas corretas e claras"],
  vocab=[V("v-bijzin-in-bijzin","ingebedde bijzin","subordinada encaixada","noun","de"), V("v-overzichtelijk","overzichtelijk","claro|bem organizado","adjective"),
         V("v-ingewikkeld","ingewikkeld","complicado","adjective"), V("v-opsplitsen","opsplitsen","dividir","verb")],
  ex=[("Deze zin is te ingewikkeld.","Esta frase é demasiado complicada."),("Split lange zinnen op.","Divide as frases longas."),("Een overzichtelijke tekst leest prettig.","Um texto claro lê-se bem."),("Ik denk dat hij zei dat hij later zou komen.","Acho que ele disse que viria mais tarde.")],
  review=["v-werkwoordscluster","v-omdat","v-hoewel","v-zonder-te"],
  cefr=C, exs=[
    MA([("ingebedde bijzin","subordinada encaixada"),("overzichtelijk","claro"),("ingewikkeld","complicado"),("opsplitsen","dividir")], "Frases.", ["v-bijzin-in-bijzin","v-overzichtelijk","v-ingewikkeld","v-opsplitsen"]),
    WO("Acho que ele disse que viria mais tarde.", ["Ik","denk","dat","hij","zei","dat","hij","later","zou","komen"], "Subordinada dentro de subordinada.", ["v-bijzin-in-bijzin"]),
    WO("Embora estivesse cansado, foi trabalhar sem se queixar.", ["Hoewel","hij","moe","was,","ging","hij","werken","zonder","te","klagen"], "Verbo, verbo + zonder te.", ["v-hoewel","v-zonder-te"]),
    FE(["Omdat","ik","had","geen","tijd,","ik","heb","niet","gebeld."], 2, "geen tijd had", "Subordinada: omdat ik geen tijd had.", ["v-omdat"]),
    FE(["Omdat","ik","geen","tijd","had,","ik","heb","niet","gebeld."], 5, "heb ik", "Depois da subordinada: heb ik niet gebeld.", ["v-woordvolgorde"]),
    TR("pt-nl","Esta frase é demasiado complicada.", ["Deze zin is te ingewikkeld"], "ingewikkeld.", ["v-ingewikkeld"]),
    TR("nl-pt","Een overzichtelijke tekst leest prettig.", ["Um texto claro lê-se bem","Um texto bem organizado lê-se bem"], "overzichtelijk.", ["v-overzichtelijk"]),
    MC("Uma frase com 40 palavras e 4 subordinadas…", ["*fica melhor se for dividida em duas ou três","é sempre mais elegante|Pode ser difícil de ler.","é proibida em neerlandês|Não."], "Clareza.", ["v-opsplitsen"]),
    LI("Ik hoop dat je begrijpt waarom ik niet heb kunnen komen.", ["Ik hoop dat je begrijpt waarom ik niet heb kunnen komen"], "Espero que percebas porque não pude vir.", "Várias subordinadas.", ["v-werkwoordscluster"]),
    SW("Escreva uma frase longa e correta (pelo menos 20 palavras) com uma subordinada, um «om … te» e um grupo verbal final.", ["Omdat ik volgend jaar in Nederland wil blijven, volg ik een cursus om mijn Nederlands te verbeteren, hoewel ik het eigenlijk niet heb kunnen plannen."], ["Uma subordinada com verbo no fim", "**om … te**", "Inversão ou grupo verbal correto"], 20, "Frase complexa.", ["v-bijzin-in-bijzin"]),
  ], diff=5, mins=8)

W()
