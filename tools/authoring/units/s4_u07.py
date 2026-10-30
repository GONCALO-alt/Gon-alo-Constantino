import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s4-u07")
C = "A2-B1"

L(1, "Convidar", "Heb je zin om…? Ik wil je uitnodigen voor…",
  ["Fazer convites informais e formais"],
  vocab=[V("v-uitnodigen","uitnodigen","convidar","verb",note="Ik nodig je uit. (separável)"), V("v-borrel","borrel","copo (encontro informal com bebidas)","noun","de"),
         V("v-etentje","etentje","jantarzinho","noun","het"), V("v-langskomen","langskomen","passar por (visitar)","verb",note="Kom je langs?")],
  ex=[("Ik wil je uitnodigen voor mijn verjaardag.","Quero convidar-te para o meu aniversário."),("Heb je zin om vrijdag te komen eten?","Apetece-te vir jantar na sexta?"),("We hebben vrijdag een borrel op het werk.","Na sexta temos um copo no trabalho."),("Kom gerust langs!","Aparece à vontade!")],
  gram=[G("g-zin-om-te","Heb je zin om … te + infinitivo?","Convite informal muito comum: **Heb je zin om** + complemento + **te** + infinitivo no fim: *Heb je zin om mee **te gaan**?* Mais formal: **Ik wil u graag uitnodigen voor …**",
    [("Heb je zin om koffie te drinken?","Apetece-te tomar um café?")],
    "«Ter vontade de» → «zin hebben om … te».")],
  review=["v-zin-hebben","v-verjaardag","v-zullen-we","v-uitnodiging"],
  cefr=C, exs=[
    MA([("uitnodigen","convidar"),("borrel","copo/encontro"),("etentje","jantarzinho"),("langskomen","passar por")], "Convites.", ["v-uitnodigen","v-borrel","v-etentje","v-langskomen"]),
    WO("Apetece-te vir jantar na sexta?", ["Heb","je","zin","om","vrijdag","te","komen","eten?"], "om … te + infinitivo.", ["v-zin-hebben"]),
    TR("pt-nl","Quero convidar-te para o meu aniversário.", ["Ik wil je uitnodigen voor mijn verjaardag","Ik wil jou uitnodigen voor mijn verjaardag"], "uitnodigen voor.", ["v-uitnodigen"]),
    TR("pt-nl","Convido-vos para um jantar.", ["Ik nodig jullie uit voor een etentje","Ik nodig jullie uit voor een diner"], "Separável: ik nodig … uit.", ["v-uitnodigen"]),
    TR("nl-pt","Kom gerust langs!", ["Aparece à vontade","Passa cá quando quiseres","Aparece quando quiseres"], "langskomen; gerust = à vontade.", ["v-langskomen"]),
    AR("etentje","o jantarzinho","het", "Diminutivos (-tje) são sempre het.", ["v-etentje"]),
    FE(["Heb","je","zin","om","mee","gaan?"], 5, "te gaan", "Falta «te»: Heb je zin om mee te gaan?", ["v-zin-hebben"]),
    LI("We hebben vrijdag een borrel. Kom je ook?", ["We hebben vrijdag een borrel(.) Kom je ook","Wij hebben vrijdag een borrel(.) Kom je ook"], "Na sexta temos um copo. Também vens?", "borrel.", ["v-borrel"]),
    MC("Convite formal a um cliente:", ["*Wij willen u graag uitnodigen voor onze nieuwjaarsreceptie.","Heb je zin, joh?|Muito informal.","Kom!|Seco."], "Formal: u + graag uitnodigen.", ["v-uitnodigen"]),
    FB("Wanneer kom je een keer ___?", ["langs"], "langskomen.", ["v-langskomen"], choices=["langs","uit","mee"], tr="Quando vens cá um dia destes?"),
  ], diff=3, mins=6)

L(2, "Aceitar com entusiasmo", "Leuk! Graag! Daar heb ik zin in!",
  ["Aceitar convites e perguntar detalhes"],
  vocab=[V("v-daar-heb-ik-zin-in","daar heb ik zin in","estou mesmo com vontade","expression"), V("v-gezellig-idee","gezellig!","que bom! (agradável)","expression"),
         V("v-meenemen-iets","iets meenemen","levar alguma coisa","expression",note="Zal ik iets meenemen?"), V("v-hoe-laat-verwacht","hoe laat verwacht je ons?","a que horas nos esperas?","expression")],
  ex=[("Leuk, daar heb ik zin in!","Boa, estou mesmo com vontade!"),("Gezellig! Ik kom graag.","Que bom! Vou com todo o gosto."),("Zal ik iets meenemen?","Queres que leve alguma coisa?"),("Hoe laat verwacht je ons?","A que horas nos esperas?")],
  review=["v-graag","v-leuk","v-gezellig","v-meenemen"],
  cefr=C, exs=[
    MA([("daar heb ik zin in","estou com vontade"),("gezellig!","que bom!"),("zal ik iets meenemen?","levo alguma coisa?"),("hoe laat verwacht je ons?","a que horas nos esperas?")], "Aceitar.", ["v-daar-heb-ik-zin-in","v-gezellig-idee","v-meenemen-iets","v-hoe-laat-verwacht"]),
    TR("pt-nl","Queres que leve alguma coisa?", ["Zal ik iets meenemen"], "Zal ik…? = oferta.", ["v-meenemen-iets"]),
    TR("nl-pt","Leuk, daar heb ik zin in!", ["Boa, estou mesmo com vontade","Que bom, estou com vontade","Fixe, apetece-me muito"], "Expressão fixa.", ["v-daar-heb-ik-zin-in"]),
    DL([("Sem","Ik geef zaterdag een etentje. Kom je ook?","Sábado dou um jantar. Vens também?"),("Carla","")], ["*Gezellig! Ik kom graag. Zal ik een toetje meenemen?","Nee, ik kom.|Contraditório.","Wat is een etentje?|Já devia saber."], "Aceitar e oferecer.", ["v-gezellig-idee","v-meenemen-iets"]),
    FE(["Daar","heb","ik","zin","op!"], 4, "in", "A expressão é «zin hebben in»: Daar heb ik zin in!", ["v-daar-heb-ik-zin-in"]),
    WO("A que horas nos esperas?", ["Hoe","laat","verwacht","je","ons?"], "verwachten.", ["v-hoe-laat-verwacht"]),
    MC("Neerlandeses costumam perguntar «Zal ik iets meenemen?» porque…", ["*é habitual levar algo (bebida, sobremesa, flores) quando se é convidado","é obrigatório pagar a entrada|Não.","nunca há comida nas festas|Não."], "Costume.", ["v-meenemen-iets"]),
    LI("Wat leuk! Ik kom zeker.", ["Wat leuk(!) Ik kom zeker"], "Que giro! Vou de certeza.", "zeker.", ["v-zeker"]),
    FB("Daar heb ik echt zin ___!", ["in"], "zin hebben in.", ["v-daar-heb-ik-zin-in"], choices=["in","op","aan"], tr="Estou mesmo com vontade disso!"),
    TR("pt-nl","Que bom! Vou com todo o gosto.", ["Gezellig(!) Ik kom graag","Leuk(!) Ik kom graag"], "graag.", ["v-gezellig-idee"]),
  ], diff=3, mins=6)

L(3, "Recusar com tato", "Wat jammer, maar ik kan helaas niet. Misschien een andere keer?",
  ["Recusar um convite de forma simpática, com justificação e alternativa"],
  vocab=[V("v-jammer","jammer","que pena","adjective",note="Wat jammer!"), V("v-al-iets-anders","al iets anders hebben","já ter outro compromisso","expression"),
         V("v-een-andere-keer","een andere keer","outra vez|noutra altura","expression"), V("v-afzeggen2","het laten weten","avisar|dar notícias","expression",note="Ik laat het je nog weten.")],
  ex=[("Wat jammer, maar ik kan helaas niet.","Que pena, mas infelizmente não posso."),("Ik heb zaterdag al iets anders.","No sábado já tenho outro compromisso."),("Misschien een andere keer?","Talvez noutra altura?"),("Ik laat het je nog weten.","Depois digo-te qualquer coisa.")],
  gram=[G("g-weigeren","Recusar em 3 passos","1) Agradecer/lamentar: **Wat leuk dat je me uitnodigt! / Wat jammer…** 2) Razão curta: **Ik heb al iets anders.** 3) Alternativa: **Misschien een andere keer? / Kan het ook volgende week?** Os neerlandeses preferem uma recusa clara a um «talvez» vago.",
    [("Bedankt voor de uitnodiging, maar ik kan helaas niet.","Obrigado pelo convite, mas infelizmente não posso.")],
    "Em Portugal muitas vezes dizemos «vamos ver»; nos Países Baixos isso pode ser entendido como um «sim». Seja claro.")],
  review=["v-helaas","v-misschien","v-uitnodiging"],
  cefr=C, exs=[
    MA([("jammer","que pena"),("al iets anders hebben","ter outro compromisso"),("een andere keer","noutra altura"),("het laten weten","avisar")], "Recusar.", ["v-jammer","v-al-iets-anders","v-een-andere-keer","v-afzeggen2"]),
    TR("pt-nl","Que pena, mas infelizmente não posso.", ["Wat jammer(,) maar ik kan helaas niet","Jammer(,) maar ik kan helaas niet"], "helaas antes de niet.", ["v-jammer"]),
    TR("pt-nl","No sábado já tenho outro compromisso.", ["Zaterdag heb ik al iets anders","Ik heb zaterdag al iets anders"], "al iets anders.", ["v-al-iets-anders"]),
    TR("nl-pt","Misschien een andere keer?", ["Talvez noutra altura","Talvez outra vez","Fica para a próxima"], "een andere keer.", ["v-een-andere-keer"]),
    MC("Qual é a recusa mais adequada nos Países Baixos?", ["*Bedankt! Zaterdag kan ik helaas niet, maar volgende week wel.","Misschien, we zien wel.|Vago — pode ser entendido como sim.","Nee.|Seco demais."], "Clara e simpática.", ["v-een-andere-keer"]),
    FE(["Ik","kan","niet","helaas."], 2, "helaas niet", "A ordem é «helaas niet»: Ik kan helaas niet.", []),
    DL([("Joris","Kom je vanavond naar de borrel?","Vens ao copo hoje à noite?"),("Marta","")], ["*Wat jammer, ik heb al iets anders. Veel plezier!","Ja, nee, misschien.|Confuso.","Ik ga niet, doei.|Pouco simpático."], "Recusar com tato.", ["v-jammer","v-al-iets-anders"]),
    LI("Ik laat het je morgen nog weten.", ["Ik laat het je morgen nog weten","Ik laat het jou morgen nog weten"], "Amanhã digo-te qualquer coisa.", "laten weten.", ["v-afzeggen2"]),
    FB("Wat ___ dat je niet kunt!", ["jammer"], "Wat jammer.", ["v-jammer"], choices=["jammer","leuk","gezellig"], tr="Que pena que não possas!"),
    SW("Recuse um convite para um jantar no sábado: agradeça, dê uma razão e proponha outra data.", ["Bedankt voor de uitnodiging! Zaterdag kan ik helaas niet, want ik heb al iets anders. Kan het ook volgende week?"], ["Agradeceu", "Razão curta (**al iets anders**)", "Propôs alternativa", "**helaas niet** na ordem certa"], 15, "Recusa em três passos.", ["v-al-iets-anders","v-een-andere-keer"]),
  ], diff=3, mins=7)

L(4, "Conhecer pessoas novas", "Hoe ken jij de gastvrouw? Wat doe jij in het dagelijks leven?",
  ["Iniciar e manter conversa numa festa"],
  vocab=[V("v-gastvrouw","gastvrouw","anfitriã","noun","de",note="gastheer = anfitrião"), V("v-kennen-via","kennen via","conhecer através de","expression"),
         V("v-dagelijks-leven","in het dagelijks leven","no dia a dia (profissionalmente)","expression")],
  ex=[("Hoe ken jij Sanne?","Como é que conheces a Sanne?"),("Ik ken haar via mijn werk.","Conheço-a do trabalho."),("Wat doe je in het dagelijks leven?","O que fazes no dia a dia?"),("Leuk kennis te maken!","Prazer em conhecer!")],
  review=["v-kennismaken","v-kennen","v-leuk-je-te-ontmoeten","v-collega","v-vriend"],
  cefr=C, exs=[
    MA([("gastvrouw","anfitriã"),("kennen via","conhecer através de"),("in het dagelijks leven","no dia a dia"),("kennismaken","conhecer pela primeira vez")], "Festa.", ["v-gastvrouw","v-kennen-via","v-dagelijks-leven","v-kennismaken"]),
    TR("pt-nl","Como é que conheces a Sanne?", ["Hoe ken je Sanne","Hoe ken jij Sanne"], "kennen.", ["v-kennen-via"]),
    TR("pt-nl","Conheço-a do trabalho.", ["Ik ken haar via mijn werk","Ik ken haar van mijn werk","Ik ken haar van het werk"], "via/van.", ["v-kennen-via"]),
    TR("nl-pt","Wat doe je in het dagelijks leven?", ["O que fazes no dia a dia","O que fazes na vida","O que fazes profissionalmente"], "Pergunta indireta sobre a profissão.", ["v-dagelijks-leven"]),
    MC("Ao chegar a uma festa neerlandesa, é habitual…", ["*apresentar-se a cada pessoa com aperto de mão e dar os parabéns também à família do aniversariante","esperar que a anfitriã apresente toda a gente|Não é obrigatório.","ficar calado até alguém falar|Não."], "Gefeliciteerd met je zus/moeder!", ["v-kennismaken"]),
    FB("Leuk ___ te maken!", ["kennis"], "kennismaken.", ["v-kennismaken"], choices=["kennis","kennen","bekend"], tr="Prazer em conhecer!"),
    AR("gastvrouw","a anfitriã","de", "Pessoa → de.", ["v-gastvrouw"]),
    LI("Ik heb al veel over je gehoord!", ["Ik heb al veel over je gehoord","Ik heb al veel over jou gehoord"], "Já ouvi falar muito de ti!", "gehoord.", []),
    CO("dialogue","Op een verjaardag", "Bram: Hoi, ik ben Bram. Hoe ken jij Lisa?\nCarla: Hoi Bram! Ik ken haar via de taalcursus. En jij?\nBram: Ik ben haar neef. Wat doe jij in het dagelijks leven?\nCarla: Ik ben ontwerper. Ik werk bij een klein bureau in Utrecht.",
       [("Como conhece a Carla a Lisa?", ["*Do curso de línguas","Do trabalho","São primas"]),("Quem é o Bram?", ["*Primo da Lisa","Colega da Carla","Professor"])],
       "neef = primo (ou sobrinho).", ["v-kennen-via","v-dagelijks-leven"]),
    WO("Prazer em conhecer!", ["Leuk","kennis","te","maken!"], "Fórmula.", ["v-kennismaken"]),
  ], diff=3, mins=7)

L(5, "Agradecer e despedir-se", "Bedankt voor de gezellige avond! Het was erg leuk.",
  ["Agradecer depois de um encontro e despedir-se"],
  vocab=[V("v-gastvrijheid","gastvrijheid","hospitalidade","noun","de"), V("v-tot-de-volgende-keer","tot de volgende keer","até à próxima","expression"),
         V("v-genoten","genoten","gostado muito|aproveitado","verb",note="genieten → genoten: Ik heb genoten!"), V("v-thuiskomen","thuiskomen","chegar a casa","verb",note="Kom goed thuis!")],
  ex=[("Bedankt voor de gezellige avond!","Obrigado pela noite agradável!"),("Ik heb echt genoten.","Gostei mesmo muito."),("Kom goed thuis!","Chega bem a casa!"),("Tot de volgende keer!","Até à próxima!")],
  review=["v-bedankt","v-gezellig","v-tot-ziens","v-doei"],
  cefr=C, exs=[
    MA([("gastvrijheid","hospitalidade"),("tot de volgende keer","até à próxima"),("genoten","gostado muito"),("thuiskomen","chegar a casa")], "Despedidas.", ["v-gastvrijheid","v-tot-de-volgende-keer","v-genoten","v-thuiskomen"]),
    TR("pt-nl","Obrigado pela noite agradável!", ["Bedankt voor de gezellige avond","Dank je wel voor de gezellige avond","Dank je voor de gezellige avond"], "gezellige avond.", []),
    TR("nl-pt","Kom goed thuis!", ["Chega bem a casa","Chegue bem a casa","Boa viagem para casa"], "Despedida típica.", ["v-thuiskomen"]),
    TR("pt-nl","Gostei mesmo muito.", ["Ik heb echt genoten","Ik heb erg genoten"], "genieten → genoten.", ["v-genoten"]),
    CJ("genieten","wij","We hebben enorm ___.", ["genoten"], "genieten → genoten (irregular).", ["v-genoten"], tense="passado-perfeito"),
    FE(["Ik","heb","echt","genietd."], 3, "genoten", "genieten é irregular: genoten.", ["v-genoten"]),
    DL([("Gastvrouw","Fijn dat je er was!","Que bom que vieste!"),("Rui","")], ["*Bedankt voor de gastvrijheid, ik heb echt genoten!","Ik was er.|Não agradece.","Graag gedaan!|Isso responde a um agradecimento."], "Agradecer.", ["v-gastvrijheid","v-genoten"]),
    LI("Tot de volgende keer!", ["Tot de volgende keer"], "Até à próxima!", "Despedida.", ["v-tot-de-volgende-keer"]),
    FB("Bedankt voor je ___!", ["gastvrijheid"], "hospitalidade.", ["v-gastvrijheid"], choices=["gastvrijheid","gastvrouw","uitnodigen"], tr="Obrigado pela tua hospitalidade!"),
    SW("Escreva uma mensagem curta (2 frases) a agradecer um jantar em casa de amigos.", ["Bedankt voor het heerlijke etentje gisteren! Ik heb echt genoten, tot de volgende keer!"], ["**Bedankt voor**", "**genoten** ou **gezellig**", "Despedida (**tot de volgende keer**)"], 10, "Mensagem de agradecimento.", ["v-genoten","v-tot-de-volgende-keer"]),
  ], diff=3, mins=6)

W()
