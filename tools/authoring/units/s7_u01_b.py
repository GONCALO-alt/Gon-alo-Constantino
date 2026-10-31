import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u01")
C = "B2"
# Lições de aprofundamento (10–29): falar com fluência — desenvolver, contar, debater, refletir.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Ir direto ao assunto", "Het zit zo…",
  ["Introduzir um tema e chegar ao ponto"],
  vocab=[X("v-ter-zake-komen","ter zake komen","ir direto ao assunto"), X("v-het-zit-zo","het zit zo…","a coisa é a seguinte…"),
         X("v-om-het-kort-te-houden","om het kort te houden","para ser breve")],
  ex=[("Laten we ter zake komen.","Vamos direto ao assunto."),("Het zit zo: ik kan morgen niet komen.","A coisa é a seguinte: amanhã não posso vir."),("Om het kort te houden: we hebben meer tijd nodig.","Para ser breve: precisamos de mais tempo.")],
  review=["v-uitweiden","v-afdwalen"],
  cefr=C, exs=[
    MA([("ter zake komen","ir direto ao assunto"),("het zit zo…","a coisa é a seguinte"),("om het kort te houden","para ser breve"),("uitweiden","divagar")], "Ao ponto.", ["v-ter-zake-komen","v-het-zit-zo","v-om-het-kort-te-houden","v-uitweiden"]),
    MC("Oposto de «ter zake komen»:", ["*uitweiden / afdwalen","kort houden|Semelhante.","het zit zo|Introdução."], "Antónimo.", ["v-uitweiden"]),
    TR("pt-nl","Vamos direto ao assunto.", ["Laten we ter zake komen"], "Expressão.", ["v-ter-zake-komen"]),
    TR("pt-nl","A coisa é a seguinte: não posso vir.", ["Het zit zo: ik kan niet komen","Het zit zo, ik kan niet komen"], "Expressão.", ["v-het-zit-zo"]),
    FB("Om het kort te ___: het project is uitgesteld.", ["houden"], "Expressão.", ["v-om-het-kort-te-houden"], choices=["houden","maken","zeggen"], tr="Para ser breve: o projeto foi adiado."),
    FE(["Laten","we","ter","zaak","komen."], 3, "zake", "Forma antiga fixa: ter zake.", ["v-ter-zake-komen"]),
    DL([("Collega","Ik wilde je even iets vragen, maar eerst… nou ja, gisteren… weet je…","Queria perguntar-te uma coisa, mas primeiro… bem, ontem… sabes…"),("Jij","","")], ["*Vertel maar gewoon, wat zit je dwars? Kom maar ter zake.","Om het kort te houden.|Não encaixa.","Uitweiden!|Rude."], "Ajudar a chegar ao ponto.", ["v-ter-zake-komen"]),
    LI("Het zit zo: de verhuurder wil het huis verkopen.", ["Het zit zo: de verhuurder wil het huis verkopen","Het zit zo, de verhuurder wil het huis verkopen"], "A coisa é a seguinte: o senhorio quer vender a casa.", "Introduzir.", ["v-het-zit-zo"]),
  ], diff=4, mins=5)

L(11, "Geral ou em detalhe", "In grote lijnen of tot in detail?",
  ["Ajustar o nível de detalhe ao contar algo"],
  vocab=[X("v-in-grote-lijnen","in grote lijnen","em linhas gerais"), X("v-tot-in-detail","tot in detail","ao pormenor"),
         X("v-uit-de-doeken-doen","iets uit de doeken doen","explicar algo em pormenor")],
  ex=[("In grote lijnen komt het hierop neer.","Em linhas gerais, resume-se a isto."),("Ze heeft alles tot in detail gepland.","Ela planeou tudo ao pormenor."),("Hij deed het hele plan uit de doeken.","Ele explicou o plano todo em pormenor.")],
  review=["v-komt-erop-neer"],
  cefr=C, exs=[
    MA([("in grote lijnen","em linhas gerais"),("tot in detail","ao pormenor"),("uit de doeken doen","explicar em pormenor"),("het komt erop neer","no fundo…")], "Detalhe.", ["v-in-grote-lijnen","v-tot-in-detail","v-uit-de-doeken-doen","v-komt-erop-neer"]),
    MC("O chefe tem 2 minutos. Começas com…", ["*In grote lijnen: …","Tot in detail: …|Demasiado.","Uitweiden…|Não."], "Ajustar.", ["v-in-grote-lijnen"]),
    TR("pt-nl","Em linhas gerais, é isto.", ["In grote lijnen is het dit","In grote lijnen komt het hierop neer"], "Expressão.", ["v-in-grote-lijnen"]),
    TR("pt-nl","Ela planeou tudo ao pormenor.", ["Ze heeft alles tot in detail gepland","Zij heeft alles tot in detail gepland"], "Expressão.", ["v-tot-in-detail"]),
    FB("De minister deed zijn plannen uitgebreid uit de ___.", ["doeken"], "Expressão.", ["v-uit-de-doeken-doen"], choices=["doeken","lijnen","details"], tr="O ministro explicou em pormenor os seus planos."),
    FE(["In","grote","lijn","is","het","duidelijk."], 2, "lijnen", "Plural: in grote lijnen.", ["v-in-grote-lijnen"]),
    LI("Kun je het in grote lijnen uitleggen?", ["Kun je het in grote lijnen uitleggen","Kun je het in grote lijnen uitleggen?"], "Consegues explicar em linhas gerais?", "Pedido.", ["v-in-grote-lijnen"]),
    SW("Explique «em linhas gerais» (2–3 frases) e depois «ao pormenor» (4–5 frases) como funciona o seu trajeto diário.", ["In grote lijnen: ik fiets naar het station en neem de trein naar Utrecht.\nTot in detail: om 7.30 uur pak ik mijn fiets. Ik fiets tien minuten naar het station, zet mijn fiets in de stalling en check in met mijn ov-kaart. De trein van 7.48 uur brengt me in twintig minuten naar Utrecht Centraal. Daar loop ik nog vijf minuten naar kantoor."], ["Versão geral","Versão detalhada"], 50, "Dois níveis.", ["v-in-grote-lijnen","v-tot-in-detail"]),
  ], diff=4, mins=6)

L(12, "Resumir ao falar", "Om een lang verhaal kort te maken…",
  ["Resumir histórias longas na conversa"],
  vocab=[X("v-lang-verhaal-kort","om een lang verhaal kort te maken","resumindo a história"), X("v-kort-gezegd","kort gezegd","em resumo"),
         X("v-het-hele-verhaal","het hele verhaal","a história toda")],
  ex=[("Om een lang verhaal kort te maken: we hebben de trein gemist.","Resumindo a história: perdemos o comboio."),("Kort gezegd: het was een ramp.","Em resumo: foi um desastre."),("Vertel me het hele verhaal!","Conta-me a história toda!")],
  review=["v-kortom","v-in-het-kort"],
  cefr=C, exs=[
    MA([("om een lang verhaal kort te maken","resumindo"),("kort gezegd","em resumo"),("het hele verhaal","a história toda"),("kortom","em suma")], "Resumir.", ["v-lang-verhaal-kort","v-kort-gezegd","v-het-hele-verhaal","v-kortom"]),
    TR("pt-nl","Conta-me a história toda!", ["Vertel me het hele verhaal","Vertel me het hele verhaal!","Vertel het hele verhaal"], "het hele.", ["v-het-hele-verhaal"]),
    TR("pt-nl","Em resumo: foi um desastre.", ["Kort gezegd: het was een ramp","Kort gezegd, het was een ramp","Kortom: het was een ramp"], "kort gezegd.", ["v-kort-gezegd"]),
    MC("«Om een lang verhaal kort te maken» usa-se…", ["*para saltar pormenores e ir ao fim","para começar uma história longa|Não.","para mudar de assunto|Não."], "Função.", ["v-lang-verhaal-kort"]),
    FB("Om een lang verhaal ___ te maken: ik ben verhuisd.", ["kort"], "Expressão.", ["v-lang-verhaal-kort"], choices=["kort","lang","klein"], tr="Resumindo a história: mudei de casa."),
    FE(["Vertel","me","de","hele","verhaal!"], 2, "het", "het verhaal.", ["v-het-hele-verhaal"]),
    LI("Om een lang verhaal kort te maken: alles is goed gekomen.", ["Om een lang verhaal kort te maken: alles is goed gekomen","Om een lang verhaal kort te maken, alles is goed gekomen"], "Resumindo: correu tudo bem.", "Uso.", ["v-lang-verhaal-kort"]),
    DL([("Vriend","En? Hoe was je verhuizing?","Então? Como foi a mudança?"),("Jij","","")], ["*Pff, om een lang verhaal kort te maken: de bus was te klein, het regende, maar we zijn er!","Kort gezegd.|Incompleto.","Het hele verhaal.|Incompleto."], "Resumir com humor.", ["v-lang-verhaal-kort"]),
  ], diff=4, mins=5)

L(13, "Falar da própria experiência", "Ik spreek uit ervaring.",
  ["Usar a experiência pessoal como argumento"],
  vocab=[X("v-uit-eigen-ervaring","uit eigen ervaring","por experiência própria"), X("v-ik-spreek-uit-ervaring","ik spreek uit ervaring","falo por experiência"),
         N("v-levenservaring","levenservaring","experiência de vida","de")],
  ex=[("Uit eigen ervaring weet ik dat verhuizen zwaar is.","Por experiência própria sei que mudar de casa é duro."),("Geloof me, ik spreek uit ervaring.","Acredita, falo por experiência."),("Met de jaren krijg je meer levenservaring.","Com os anos ganha-se mais experiência de vida.")],
  review=["v-ervaring"],
  cefr=C, exs=[
    MA([("uit eigen ervaring","por experiência própria"),("ik spreek uit ervaring","falo por experiência"),("levenservaring","experiência de vida"),("ervaring","experiência")], "Experiência.", ["v-uit-eigen-ervaring","v-ik-spreek-uit-ervaring","v-levenservaring","v-ervaring"]),
    TR("pt-nl","Falo por experiência.", ["Ik spreek uit ervaring"], "Expressão.", ["v-ik-spreek-uit-ervaring"]),
    TR("pt-nl","Por experiência própria sei que é duro.", ["Uit eigen ervaring weet ik dat het zwaar is","Uit eigen ervaring weet ik dat het moeilijk is"], "Inversão.", ["v-uit-eigen-ervaring"]),
    MC("Num debate, a experiência pessoal…", ["*torna o argumento vivo, mas não prova uma regra geral","prova tudo|Não.","é proibida|Não."], "Nuance.", ["v-uit-eigen-ervaring"]),
    FB("Ze heeft veel ___: ze heeft in vijf landen gewoond.", ["levenservaring"], "Experiência de vida.", ["v-levenservaring"], choices=["levenservaring","ervaring","levensloop"], tr="Ela tem muita experiência de vida: viveu em cinco países."),
    MC("Qual é a ordem correta?", ["*Uit eigen ervaring weet ik het.","Uit eigen ervaring ik weet het.|Inversão: verbo em 2.º lugar."], "Inversão: verbo em 2.º lugar.", ["v-uit-eigen-ervaring"]),
    LI("Ik weet uit eigen ervaring hoe moeilijk een nieuwe taal is.", ["Ik weet uit eigen ervaring hoe moeilijk een nieuwe taal is"], "Sei por experiência própria como é difícil uma língua nova.", "Uso.", ["v-uit-eigen-ervaring"]),
    SW("Dê um conselho a alguém que acaba de chegar aos Países Baixos, apoiado na sua experiência (3–4 frases).", ["Uit eigen ervaring kan ik je aanraden om meteen een fiets te kopen. Ik spreek uit ervaring: de eerste weken nam ik de bus, en dat was duur en traag. Probeer ook zo snel mogelijk Nederlands te spreken, ook al maak je fouten."], ["uit eigen ervaring","Conselho concreto"], 30, "Conselho.", ["v-uit-eigen-ervaring"]),
  ], diff=4, mins=5)

L(14, "Criar suspense", "En toen, tot overmaat van ramp…",
  ["Construir tensão numa narrativa oral"],
  vocab=[X("v-spanning-opbouwen","de spanning opbouwen","criar suspense"), X("v-tot-overmaat-van-ramp","tot overmaat van ramp","para cúmulo do azar")],
  ex=[("Een goede verteller bouwt de spanning op.","Um bom contador de histórias cria suspense."),("Het regende, ik had geen paraplu en tot overmaat van ramp ging mijn fiets kapot.","Chovia, não tinha guarda-chuva e para cúmulo do azar a bicicleta avariou.")],
  review=["v-ineens","v-plotseling","v-spannend"],
  cefr=C, exs=[
    MA([("de spanning opbouwen","criar suspense"),("tot overmaat van ramp","para cúmulo do azar"),("ineens","de repente"),("spannend","emocionante")], "Suspense.", ["v-spanning-opbouwen","v-tot-overmaat-van-ramp","v-ineens","v-spannend"]),
    MC("Qual frase cria mais suspense?", ["*Ik deed de deur open… en ineens stond er iemand in de gang.","Er stond iemand in de gang.|Plano.","Er was iemand.|Plano."], "Técnica: pausa + ineens.", ["v-spanning-opbouwen"]),
    TR("pt-nl","Para cúmulo do azar a bicicleta avariou.", ["Tot overmaat van ramp ging mijn fiets kapot","Tot overmaat van ramp ging de fiets kapot"], "Inversão.", ["v-tot-overmaat-van-ramp"]),
    TR("pt-nl","Um bom contador cria suspense.", ["Een goede verteller bouwt de spanning op"], "opbouwen.", ["v-spanning-opbouwen"]),
    FB("Tot overmaat van ___ begon het ook nog te hagelen.", ["ramp"], "Expressão.", ["v-tot-overmaat-van-ramp"], choices=["ramp","pech","geluk"], tr="Para cúmulo do azar ainda começou a cair granizo."),
    MC("Qual é a ordem correta?", ["*Tot overmaat van ramp reed de trein niet.","Tot overmaat van ramp de trein reed niet.|Inversão: verbo em 2.º lugar."], "Inversão.", ["v-tot-overmaat-van-ramp"]),
    SW("Conte em 4–5 frases um dia em que tudo correu mal, criando suspense e usando «ineens» e «tot overmaat van ramp».", ["Het was een gewone maandag. Ik stond op tijd op, maar ineens merkte ik dat er geen warm water was. Ik fietste naar het station en zag mijn trein net vertrekken. En tot overmaat van ramp had ik mijn laptop thuis laten liggen."], ["Suspense","ineens","tot overmaat van ramp"], 40, "Narrar.", ["v-spanning-opbouwen"]),
    LI("Ineens hoorde ik voetstappen achter me.", ["Ineens hoorde ik voetstappen achter me","Ineens hoorde ik voetstappen achter mij"], "De repente ouvi passos atrás de mim.", "Suspense.", ["v-ineens"]),
  ], diff=4, mins=6)

L(15, "O desfecho", "Het liep met een sisser af.",
  ["Contar o desfecho de uma história com expressões naturais"],
  vocab=[X("v-tot-mijn-grote-verbazing","tot mijn grote verbazing","para meu grande espanto"), X("v-met-een-sisser","met een sisser aflopen","acabar em nada|acabar sem consequências"),
         N("v-clou","clou","remate|ponto alto (de uma piada/história)","de")],
  ex=[("Tot mijn grote verbazing stond mijn oude vriend voor de deur.","Para meu grande espanto, o meu velho amigo estava à porta."),("Gelukkig liep het met een sisser af.","Felizmente acabou sem consequências."),("Wat is de clou van het verhaal?","Qual é o remate da história?")],
  review=["v-uiteindelijk-bleek","v-het-gekke-was"],
  cefr=C, exs=[
    MA([("tot mijn grote verbazing","para meu grande espanto"),("met een sisser aflopen","acabar em nada"),("clou","remate"),("uiteindelijk bleek","afinal revelou-se")], "Desfecho.", ["v-tot-mijn-grote-verbazing","v-met-een-sisser","v-clou","v-uiteindelijk-bleek"]),
    EX("met een sisser aflopen", "acabar com um sibilo (como um foguete que falha)", "O que significa?", ["*acabar sem consequências graves","explodir|Não.","acabar mal|É o contrário."], "Imagem.", ["v-met-een-sisser"]),
    TR("pt-nl","Felizmente acabou sem consequências.", ["Gelukkig liep het met een sisser af"], "Separável.", ["v-met-een-sisser"]),
    TR("pt-nl","Para meu grande espanto, ele estava à porta.", ["Tot mijn grote verbazing stond hij voor de deur"], "Inversão.", ["v-tot-mijn-grote-verbazing"]),
    FB("Ik snapte de ___ van de grap niet.", ["clou"], "Remate.", ["v-clou"], choices=["clou","sisser","ramp"], tr="Não percebi o remate da piada."),
    FE(["Gelukkig","liep","het","met","een","sisser","op."], 6, "af.", "aflopen.", ["v-met-een-sisser"]),
    LI("Uiteindelijk bleek het allemaal een misverstand te zijn.", ["Uiteindelijk bleek het allemaal een misverstand te zijn"], "No fim, afinal era tudo um mal-entendido.", "Desfecho.", ["v-uiteindelijk-bleek"]),
    DL([("Vriendin","En? Kreeg je een boete?","E então? Levaste multa?"),("Jij","","")], ["*Nee! De agent gaf me alleen een waarschuwing. Het liep met een sisser af.","Tot overmaat van ramp.|Não encaixa.","De clou.|Incompleto."], "Desfecho positivo.", ["v-met-een-sisser"]),
  ], diff=5, mins=5)

L(16, "Histórias com humor", "Ik lag in een deuk!",
  ["Contar e reagir a histórias engraçadas"],
  vocab=[X("v-in-een-deuk","in een deuk liggen","partir-se a rir"), X("v-om-je-dood-te-lachen","om je dood te lachen","de morrer a rir")],
  ex=[("Ik lag in een deuk om zijn verhaal.","Parti-me a rir com a história dele."),("Die film is om je dood te lachen.","Esse filme é de morrer a rir.")],
  review=["v-geintje","v-droge-humor"],
  cefr=C, exs=[
    MA([("in een deuk liggen","partir-se a rir"),("om je dood te lachen","de morrer a rir"),("geintje","brincadeira"),("droge humor","humor seco")], "Humor.", ["v-in-een-deuk","v-om-je-dood-te-lachen","v-geintje","v-droge-humor"]),
    EX("in een deuk liggen", "estar deitado numa amolgadela", "O que significa?", ["*rir muito","estar magoado|Literal.","dormir|Não."], "Imagem: dobrado a rir.", ["v-in-een-deuk"]),
    TR("pt-nl","Parti-me a rir.", ["Ik lag in een deuk","Ik lag helemaal in een deuk"], "Expressão.", ["v-in-een-deuk"]),
    TR("pt-nl","É de morrer a rir.", ["Het is om je dood te lachen","Dat is om je dood te lachen"], "Expressão.", ["v-om-je-dood-te-lachen"]),
    FB("We lagen allemaal in een ___.", ["deuk"], "Expressão.", ["v-in-een-deuk"], choices=["deuk","kreuk","hoek"], tr="Estávamos todos a partir-nos a rir."),
    FE(["Die","sketch","is","om","je","dood","lachen."], 6, "te lachen.", "om … te.", ["v-om-je-dood-te-lachen"]),
    LI("Toen mijn oma per ongeluk een filmpje op Facebook zette, lag de hele familie in een deuk.", ["Toen mijn oma per ongeluk een filmpje op Facebook zette, lag de hele familie in een deuk","Toen mijn oma per ongeluk een filmpje op Facebook zette lag de hele familie in een deuk"], "Quando a minha avó pôs sem querer um vídeo no Facebook, a família toda se partiu a rir.", "Uso.", ["v-in-een-deuk"]),
    SW("Conte em 3–4 frases uma situação engraçada que lhe aconteceu ao falar neerlandês (um erro de língua, por exemplo).", ["In mijn eerste week vroeg ik in de bakkerij om «een bruine boterham met een kus» in plaats van «met kaas». De bakker lag in een deuk. Sindsdien noemt hij me «de kus-klant». Het was om je dood te lachen."], ["Situação","Reação","Expressão da lição"], 35, "Humor.", ["v-in-een-deuk"]),
  ], diff=4, mins=5)

L(17, "Reagir a histórias", "Wat een verhaal!",
  ["Mostrar interesse e reagir de forma natural a uma história"],
  vocab=[X("v-wat-een-verhaal","wat een verhaal!","que história!"), X("v-dat-had-ik-nooit-verwacht","dat had ik nooit verwacht","nunca teria esperado isso")],
  ex=[("Wat een verhaal! Is dat echt gebeurd?","Que história! Isso aconteceu mesmo?"),("Echt waar? Dat had ik nooit verwacht!","A sério? Nunca teria esperado isso!")],
  review=["v-echt-waar","v-dat-meen-je-niet","v-nee-toch","v-en-toen"],
  cefr=C, exs=[
    MA([("wat een verhaal!","que história!"),("dat had ik nooit verwacht","nunca esperaria isso"),("echt waar?","a sério?"),("en toen?","e depois?")], "Reagir.", ["v-wat-een-verhaal","v-dat-had-ik-nooit-verwacht","v-echt-waar","v-en-toen"]),
    MC("Para incentivar a pessoa a continuar:", ["*En toen? Wat gebeurde er daarna?","Oké.|Desinteressado.","Saai.|Rude."], "Interesse.", ["v-en-toen"]),
    TR("pt-nl","Que história!", ["Wat een verhaal","Wat een verhaal!"], "Expressão.", ["v-wat-een-verhaal"]),
    TR("pt-nl","Nunca teria esperado isso.", ["Dat had ik nooit verwacht"], "Irreal passado.", ["v-dat-had-ik-nooit-verwacht"]),
    DL([("Collega","…en toen bleek dat de nieuwe directeur mijn oude klasgenoot was!","…e afinal o novo diretor era o meu antigo colega de turma!"),("Jij","","")], ["*Nee toch! Wat een verhaal! Dat had je nooit verwacht, hè?","Oké.|Frio.","En toen?|Já acabou a história."], "Reagir com entusiasmo.", ["v-wat-een-verhaal"]),
    FB("Dat had ik nooit ___!", ["verwacht"], "Particípio.", ["v-dat-had-ik-nooit-verwacht"], choices=["verwacht","verwachten","verwachtte"], tr="Nunca teria esperado isso!"),
    FE(["Dat","had","ik","nooit","verwachten."], 4, "verwacht.", "Particípio: verwacht.", ["v-dat-had-ik-nooit-verwacht"]),
    LI("Echt waar? Vertel!", ["Echt waar? Vertel","Echt waar? Vertel!","Echt waar vertel"], "A sério? Conta!", "Reação.", ["v-echt-waar"]),
  ], diff=3, mins=5)

L(18, "Ritmo na narrativa", "Zo gezegd, zo gedaan.",
  ["Dar ritmo a uma história com expressões de rapidez"],
  vocab=[X("v-zo-gezegd-zo-gedaan","zo gezegd, zo gedaan","dito e feito"), X("v-voor-je-het-weet","voor je het weet","quando dás por ela")],
  ex=[("We wilden een hond. Zo gezegd, zo gedaan: een week later hadden we er een.","Queríamos um cão. Dito e feito: uma semana depois tínhamos um."),("Voor je het weet, is het weer december.","Quando dás por ela, já é outra vez dezembro.")],
  review=["v-in-een-mum-van-tijd"],
  cefr=C, exs=[
    MA([("zo gezegd, zo gedaan","dito e feito"),("voor je het weet","quando dás por ela"),("in een mum van tijd","num instante"),("ineens","de repente")], "Ritmo.", ["v-zo-gezegd-zo-gedaan","v-voor-je-het-weet","v-in-een-mum-van-tijd","v-ineens"]),
    TR("pt-nl","Dito e feito.", ["Zo gezegd, zo gedaan","Zo gezegd zo gedaan"], "Expressão.", ["v-zo-gezegd-zo-gedaan"]),
    TR("pt-nl","Quando dás por ela, é dezembro.", ["Voor je het weet, is het december","Voor je het weet is het december"], "Inversão.", ["v-voor-je-het-weet"]),
    MC("«Zo gezegd, zo gedaan» indica que…", ["*a ação seguiu-se logo à decisão","ninguém fez nada|Não.","foi difícil|Não."], "Sentido.", ["v-zo-gezegd-zo-gedaan"]),
    FB("Voor je het ___, zijn de kinderen groot.", ["weet"], "Expressão.", ["v-voor-je-het-weet"], choices=["weet","ziet","denkt"], tr="Quando dás por ela, os filhos estão crescidos."),
    MC("Qual é a ordem correta?", ["*Voor je het weet, is het weer maandag.","Voor je het weet, het is weer maandag.|Inversão depois da subordinada."], "Inversão depois da subordinada.", ["v-voor-je-het-weet"]),
    LI("Zo gezegd, zo gedaan: de volgende ochtend zaten we in de trein naar Parijs.", ["Zo gezegd, zo gedaan: de volgende ochtend zaten we in de trein naar Parijs","Zo gezegd zo gedaan, de volgende ochtend zaten we in de trein naar Parijs"], "Dito e feito: na manhã seguinte estávamos no comboio para Paris.", "Narrar.", ["v-zo-gezegd-zo-gedaan"]),
    SW("Conte em 3 frases uma decisão rápida que tomou, usando «zo gezegd, zo gedaan».", ["Vorig jaar besloot ik Nederlands te leren. Zo gezegd, zo gedaan: de volgende dag schreef ik me in voor een cursus. Voor ik het wist, sprak ik al met mijn buren."], ["zo gezegd zo gedaan","Narrativa"], 25, "Narrar.", ["v-zo-gezegd-zo-gedaan"]),
  ], diff=4, mins=5)

L(19, "Várias opiniões numa conversa", "Daar valt wat voor te zeggen.",
  ["Reconhecer o valor de outras opiniões"],
  vocab=[X("v-daar-valt-wat-voor","daar valt wat voor te zeggen","isso tem a sua razão de ser"), X("v-daar-kan-ik-me-in-vinden","daar kan ik me in vinden","revejo-me nisso|concordo"),
         X("v-kwestie-van-smaak","dat is een kwestie van smaak","é uma questão de gosto")],
  ex=[("Daar valt wat voor te zeggen.","Isso tem a sua razão de ser."),("Daar kan ik me helemaal in vinden.","Revejo-me completamente nisso."),("Of dat mooi is, is een kwestie van smaak.","Se isso é bonito, é uma questão de gosto.")],
  review=["v-daar-zit-wat-in","v-goed-punt","v-zich-aansluiten"],
  cefr=C, exs=[
    MA([("daar valt wat voor te zeggen","tem a sua razão"),("daar kan ik me in vinden","revejo-me nisso"),("kwestie van smaak","questão de gosto"),("zich aansluiten bij","juntar-se a (opinião)")], "Opiniões.", ["v-daar-valt-wat-voor","v-daar-kan-ik-me-in-vinden","v-kwestie-van-smaak","v-zich-aansluiten"]),
    MC("Qual exprime concordância MAIS forte?", ["*Daar kan ik me helemaal in vinden.","Daar valt wat voor te zeggen.|Concordância parcial.","Dat is een kwestie van smaak.|Neutro."], "Graus.", ["v-daar-kan-ik-me-in-vinden"]),
    TR("pt-nl","Isso tem a sua razão de ser.", ["Daar valt wat voor te zeggen","Daar is wat voor te zeggen"], "Expressão.", ["v-daar-valt-wat-voor"]),
    TR("pt-nl","É uma questão de gosto.", ["Dat is een kwestie van smaak","Het is een kwestie van smaak"], "Expressão.", ["v-kwestie-van-smaak"]),
    FB("Daar kan ik me helemaal ___ vinden.", ["in"], "Expressão.", ["v-daar-kan-ik-me-in-vinden"], choices=["in","op","aan"], tr="Revejo-me completamente nisso."),
    FE(["Daar","valt","wat","voor","zeggen."], 4, "te zeggen.", "te + infinitivo.", ["v-daar-valt-wat-voor"]),
    CO("dialogue","Discussie aan tafel","Sanne: Ik vind dat de stad autovrij moet worden.\nTom: Daar valt wat voor te zeggen, maar hoe komen ouderen dan in het centrum?\nInês: Met elektrische busjes. Daar kan ik me wel in vinden.\nTom: En dat nieuwe stadhuis vinden jullie toch ook lelijk?\nSanne: Ach, dat is een kwestie van smaak.",
       [("O que acha o Tom da ideia?", ["*Tem razão de ser, mas tem uma dúvida","Concorda totalmente","É contra"]),("Que solução propõe a Inês?", ["*Mini-autocarros elétricos","Mais estacionamento","Bicicletas"]),("O que diz a Sanne sobre a câmara?", ["*É questão de gosto","É lindíssima","É horrível"])],
       "Conversa a três.", ["v-daar-valt-wat-voor","v-kwestie-van-smaak"]),
    LI("Ik sluit me aan bij wat Inês zegt.", ["Ik sluit me aan bij wat Inês zegt","Ik sluit mij aan bij wat Inês zegt"], "Concordo com o que diz a Inês.", "Revisão.", ["v-zich-aansluiten"]),
  ], diff=4, mins=6)

L(20, "Discordar com elegância", "Daar wil ik tegenin brengen dat…",
  ["Discordar de forma matizada e educada"],
  vocab=[X("v-tegenin-brengen","daartegenin brengen dat…","contrapor que…"), X("v-gedeeltelijk-eens","daar ben ik het maar gedeeltelijk mee eens","só concordo em parte"),
         X("v-iets-anders-zeggen","ik zou het iets anders zeggen","eu diria de outra forma")],
  ex=[("Daar wil ik tegenin brengen dat het ook veel geld kost.","A isso quero contrapor que também custa muito dinheiro."),("Daar ben ik het maar gedeeltelijk mee eens.","Só concordo em parte."),("Ik zou het iets anders zeggen.","Eu diria de outra forma.")],
  review=["v-ertegenin-gaan","v-gedeeltelijk","v-ik-zie-het-anders"],
  cefr=C, exs=[
    MA([("daartegenin brengen dat…","contrapor que…"),("maar gedeeltelijk mee eens","concordar só em parte"),("ik zou het iets anders zeggen","diria de outra forma"),("ertegenin gaan","opor-se")], "Discordar.", ["v-tegenin-brengen","v-gedeeltelijk-eens","v-iets-anders-zeggen","v-ertegenin-gaan"]),
    MC("Qual é a forma MAIS suave de discordar?", ["*Ik zou het iets anders zeggen.","Dat is onzin.|Rude.","Je hebt het mis.|Direto."], "Suavidade.", ["v-iets-anders-zeggen"]),
    TR("pt-nl","Só concordo em parte.", ["Daar ben ik het maar gedeeltelijk mee eens","Ik ben het er maar gedeeltelijk mee eens"], "gedeeltelijk.", ["v-gedeeltelijk-eens"]),
    TR("pt-nl","Eu diria de outra forma.", ["Ik zou het iets anders zeggen","Ik zou het anders zeggen"], "Expressão.", ["v-iets-anders-zeggen"]),
    FB("Daar wil ik ___ brengen dat het te duur is.", ["tegenin"], "Expressão.", ["v-tegenin-brengen"], choices=["tegenin","tegen","in"], tr="A isso quero contrapor que é demasiado caro."),
    FE(["Daar","ben","ik","het","maar","gedeeltelijk","mee","eenst."], 7, "eens.", "het eens zijn.", ["v-gedeeltelijk-eens"]),
    DL([("Collega","Thuiswerken is gewoon beter voor iedereen.","O teletrabalho é simplesmente melhor para todos."),("Jij","","")], ["*Daar ben ik het maar gedeeltelijk mee eens. Voor nieuwe collega's is op kantoor zijn juist belangrijk.","Nee.|Seco.","Ik zou het zeggen.|Incompleto."], "Discordar com argumento.", ["v-gedeeltelijk-eens"]),
    LI("Daar wil ik toch tegenin brengen dat niet iedereen een rustige werkplek thuis heeft.", ["Daar wil ik toch tegenin brengen dat niet iedereen een rustige werkplek thuis heeft"], "A isso quero contrapor que nem todos têm um espaço de trabalho calmo em casa.", "Contrapor.", ["v-tegenin-brengen"]),
  ], diff=5, mins=5)

L(21, "Dinâmica de grupo", "Bijval krijgen, tegengas geven.",
  ["Descrever reações num debate de grupo"],
  vocab=[X("v-bijval-krijgen","bijval krijgen","receber apoio|aplauso"), X("v-tegengas-geven","tegengas geven","fazer oposição|travar"),
         X("v-in-een-kringetje-draaien","in een kringetje draaien","andar às voltas (sem avançar)")],
  ex=[("Haar voorstel kreeg veel bijval.","A proposta dela recebeu muito apoio."),("De oppositie gaf flink tegengas.","A oposição fez forte oposição."),("We draaien in een kringetje; laten we een besluit nemen.","Estamos a andar às voltas; vamos tomar uma decisão.")],
  review=["v-besluit-nemen"],
  cefr=C, exs=[
    MA([("bijval krijgen","receber apoio"),("tegengas geven","fazer oposição"),("in een kringetje draaien","andar às voltas"),("door elkaar praten","falar todos ao mesmo tempo")], "Grupo.", ["v-bijval-krijgen","v-tegengas-geven","v-in-een-kringetje-draaien"]),
    EX("tegengas geven", "dar contra-gás", "O que significa?", ["*opor-se, travar algo","acelerar|Não.","concordar|Não."], "Imagem: travar.", ["v-tegengas-geven"]),
    TR("pt-nl","A proposta recebeu muito apoio.", ["Het voorstel kreeg veel bijval","Het voorstel kreeg veel steun"], "bijval.", ["v-bijval-krijgen"]),
    TR("pt-nl","Estamos a andar às voltas.", ["We draaien in een kringetje","Wij draaien in een kringetje","We draaien rondjes"], "Expressão.", ["v-in-een-kringetje-draaien"]),
    FB("De bewoners gaven flink ___ tegen de plannen.", ["tegengas"], "Oposição.", ["v-tegengas-geven"], choices=["tegengas","bijval","kringetje"], tr="Os moradores fizeram forte oposição aos planos."),
    FE(["Haar","idee","kregen","veel","bijval."], 2, "kreeg", "Singular: kreeg.", ["v-bijval-krijgen"]),
    LI("We draaien al een uur in een kringetje; tijd om te stemmen.", ["We draaien al een uur in een kringetje; tijd om te stemmen","We draaien al een uur in een kringetje, tijd om te stemmen"], "Andamos há uma hora às voltas; é hora de votar.", "Moderar.", ["v-in-een-kringetje-draaien"]),
    WO("Recebeu muito apoio.", ["Het","kreeg","veel","bijval"], "Ordem.", ["v-bijval-krijgen"]),
  ], diff=5, mins=5)

L(22, "Encerrar um tema", "Laten we het hierbij laten.",
  ["Fechar uma discussão sem conflito"],
  vocab=[X("v-hierbij-laten","laten we het hierbij laten","vamos ficar por aqui"), X("v-een-kant-van-het-verhaal","dat is één kant van het verhaal","isso é só um lado da história")],
  ex=[("We worden het niet eens; laten we het hierbij laten.","Não chegamos a acordo; vamos ficar por aqui."),("Dat is één kant van het verhaal.","Isso é só um lado da história.")],
  review=["v-eens-dat-oneens","v-perspectief"],
  cefr=C, exs=[
    MA([("laten we het hierbij laten","vamos ficar por aqui"),("dat is één kant van het verhaal","é só um lado da história"),("we zijn het erover eens dat we het oneens zijn","concordamos em discordar"),("perspectief","perspetiva")], "Encerrar.", ["v-hierbij-laten","v-een-kant-van-het-verhaal","v-eens-dat-oneens","v-perspectief"]),
    TR("pt-nl","Vamos ficar por aqui.", ["Laten we het hierbij laten","Laten we het daarbij laten"], "Expressão.", ["v-hierbij-laten"]),
    TR("pt-nl","Isso é só um lado da história.", ["Dat is één kant van het verhaal","Dat is maar één kant van het verhaal","Dat is een kant van het verhaal"], "Expressão.", ["v-een-kant-van-het-verhaal"]),
    MC("Quando alguém conta uma briga só do ponto de vista dele, pode responder…", ["*Dat is één kant van het verhaal…","Laten we het hierbij laten.|Fecha o tema.","Zo gezegd, zo gedaan.|Não."], "Uso.", ["v-een-kant-van-het-verhaal"]),
    FB("Laten we het ___ laten; morgen praten we verder.", ["hierbij"], "Expressão.", ["v-hierbij-laten"], choices=["hierbij","hiermee","hierover"], tr="Vamos ficar por aqui; amanhã continuamos."),
    FE(["Dat","is","één","kanten","van","het","verhaal."], 3, "kant", "Singular: één kant.", ["v-een-kant-van-het-verhaal"]),
    DL([("Familielid","Ik blijf erbij dat jij ongelijk hebt!","Continuo a achar que não tens razão!"),("Jij","","")], ["*Prima, we zijn het oneens. Laten we het hierbij laten en gezellig verder eten.","Jij hebt ongelijk!|Escala.","Eén kant.|Incompleto."], "Desescalar.", ["v-hierbij-laten"]),
    LI("Laten we het hierbij laten voordat het uit de hand loopt.", ["Laten we het hierbij laten voordat het uit de hand loopt"], "Vamos ficar por aqui antes que isto descambe.", "Uso.", ["v-hierbij-laten","v-uit-de-hand-lopen"]),
  ], diff=4, mins=5)

L(23, "Experiências marcantes", "Met vallen en opstaan.",
  ["Falar de experiências que marcaram"],
  vocab=[X("v-een-ervaring-rijker","een ervaring rijker","com mais uma experiência"), X("v-met-vallen-en-opstaan","met vallen en opstaan","aos trambolhões|errando e aprendendo"),
         X("v-wijzer-worden","wijzer worden","ficar mais sábio","verb")],
  ex=[("Het was zwaar, maar ik ben een ervaring rijker.","Foi duro, mas fiquei com mais uma experiência."),("Ik heb Nederlands geleerd met vallen en opstaan.","Aprendi neerlandês aos trambolhões."),("Van fouten word je wijzer.","Com os erros ficas mais sábio.")],
  review=["v-keerpunt","v-ervan-leren"],
  cefr=C, exs=[
    MA([("een ervaring rijker","com mais uma experiência"),("met vallen en opstaan","errando e aprendendo"),("wijzer worden","ficar mais sábio"),("keerpunt","ponto de viragem")], "Experiências.", ["v-een-ervaring-rijker","v-met-vallen-en-opstaan","v-wijzer-worden","v-keerpunt"]),
    EX("met vallen en opstaan", "caindo e levantando-se", "O que significa?", ["*aprendendo com erros e dificuldades","sem esforço|Não.","só caindo|Não."], "Imagem.", ["v-met-vallen-en-opstaan"]),
    TR("pt-nl","Fiquei com mais uma experiência.", ["Ik ben een ervaring rijker"], "Expressão.", ["v-een-ervaring-rijker"]),
    TR("pt-nl","Aprendi aos trambolhões.", ["Ik heb het met vallen en opstaan geleerd","Ik leerde het met vallen en opstaan"], "Expressão.", ["v-met-vallen-en-opstaan"]),
    FB("Van je fouten word je ___.", ["wijzer"], "Comparativo.", ["v-wijzer-worden"], choices=["wijzer","wijs","wijst"], tr="Com os erros ficas mais sábio."),
    FE(["Ik","ben","een","ervaring","rijk."], 4, "rijker.", "Expressão: een ervaring rijker.", ["v-een-ervaring-rijker"]),
    LI("Die reis was een keerpunt in mijn leven.", ["Die reis was een keerpunt in mijn leven"], "Essa viagem foi um ponto de viragem na minha vida.", "Revisão.", ["v-keerpunt"]),
    SW("Conte (4–5 frases) uma experiência difícil da qual aprendeu algo. Use pelo menos duas expressões da lição.", ["Mijn eerste baan in Nederland was zwaar. Ik begreep de vergaderingen niet en durfde niets te zeggen. Met vallen en opstaan leerde ik de taal en de gewoontes. Nu kijk ik er positief op terug: ik ben een ervaring rijker en veel zelfverzekerder geworden."], ["2+ expressões","Lição aprendida"], 40, "Narrar.", ["v-met-vallen-en-opstaan"]),
  ], diff=4, mins=5)

L(24, "Lições, orgulho e arrependimento", "Ik heb er geen spijt van.",
  ["Falar de orgulho e arrependimento"],
  vocab=[X("v-een-les-leren","een les leren","aprender uma lição"), X("v-geen-spijt-van","ik heb er geen spijt van","não me arrependo"),
         X("v-trots-dat","ik ben er trots op dat…","tenho orgulho de…")],
  ex=[("Ik heb er een belangrijke les van geleerd.","Aprendi com isso uma lição importante."),("Ik heb er geen spijt van dat ik ben verhuisd.","Não me arrependo de me ter mudado."),("Ik ben er trots op dat ik nu Nederlands spreek.","Tenho orgulho de agora falar neerlandês.")],
  review=["v-spijt","v-trots-zijn-op"],
  cefr=C, exs=[
    MA([("een les leren","aprender uma lição"),("ik heb er geen spijt van","não me arrependo"),("ik ben er trots op dat…","tenho orgulho de…"),("spijt hebben","arrepender-se")], "Sentimentos.", ["v-een-les-leren","v-geen-spijt-van","v-trots-dat","v-spijt"]),
    TR("pt-nl","Não me arrependo de me ter mudado.", ["Ik heb er geen spijt van dat ik ben verhuisd","Ik heb er geen spijt van dat ik verhuisd ben"], "er … van dat.", ["v-geen-spijt-van"]),
    TR("pt-nl","Tenho orgulho de falar neerlandês.", ["Ik ben er trots op dat ik Nederlands spreek","Ik ben trots dat ik Nederlands spreek"], "er … op dat.", ["v-trots-dat"]),
    MC("«Ik ben er trots op» — «er» refere-se a…", ["*a algo dito antes ou à oração com «dat»","um lugar|Não.","nada|Não."], "er + prep.", ["v-trots-dat"]),
    FB("Ik heb er een belangrijke ___ van geleerd.", ["les"], "Lição.", ["v-een-les-leren"], choices=["les","leer","spijt"], tr="Aprendi com isso uma lição importante."),
    FE(["Ik","heb","er","geen","spijt","op."], 5, "van.", "spijt hebben van.", ["v-geen-spijt-van"]),
    LI("Achteraf heb ik er geen seconde spijt van gehad.", ["Achteraf heb ik er geen seconde spijt van gehad"], "Olhando para trás, nunca me arrependi um segundo.", "Uso.", ["v-geen-spijt-van"]),
    SW("Escreva 3 frases: de que tem orgulho, de que não se arrepende e que lição aprendeu.", ["Ik ben er trots op dat ik op mijn veertigste nog een nieuwe taal heb geleerd. Ik heb er geen spijt van dat ik mijn vaste baan heb opgezegd. Ik heb geleerd dat je nooit te oud bent om opnieuw te beginnen."], ["3 estruturas"], 30, "Refletir.", ["v-trots-dat","v-geen-spijt-van"]),
  ], diff=4, mins=5)

L(25, "Sonhos e ambições", "Een droom waarmaken.",
  ["Falar de ambições e planos"],
  vocab=[X("v-droom-waarmaken","een droom waarmaken","realizar um sonho"), N("v-ambitie","ambitie","ambição","de","ambities"),
         X("v-plannen-smeden","plannen smeden","fazer planos|congeminar","verb")],
  ex=[("Ze heeft haar droom waargemaakt: een eigen bakkerij.","Ela realizou o sonho: uma padaria própria."),("Hij heeft veel ambitie.","Ele tem muita ambição."),("We zitten al plannen te smeden voor de zomer.","Já estamos a fazer planos para o verão.")],
  review=["v-drijfveer","v-passie","v-doorzetten"],
  cefr=C, exs=[
    MA([("een droom waarmaken","realizar um sonho"),("ambitie","ambição"),("plannen smeden","fazer planos"),("doorzetten","persistir")], "Ambições.", ["v-droom-waarmaken","v-ambitie","v-plannen-smeden","v-doorzetten"]),
    TR("pt-nl","Ela realizou o sonho.", ["Ze heeft haar droom waargemaakt","Zij heeft haar droom waargemaakt"], "waarmaken (separável).", ["v-droom-waarmaken"]),
    TR("pt-nl","Estamos a fazer planos para o verão.", ["We zitten plannen te smeden voor de zomer","We smeden plannen voor de zomer"], "plannen smeden.", ["v-plannen-smeden"]),
    MC("«Ambitie» em NL pode ser vista como…", ["*positiva, mas exagerar pode parecer «haantje de voorste»","sempre negativa|Não.","um insulto|Não."], "Cultura.", ["v-ambitie"]),
    FB("Met ___ kom je er wel.", ["doorzetten"], "Persistência.", ["v-doorzetten"], choices=["doorzetten","ambitie","dromen"], tr="Com persistência, chegas lá."),
    FE(["Ze","heeft","haar","droom","gewaarmaakt."], 4, "waargemaakt.", "Separável: waar-ge-maakt.", ["v-droom-waarmaken"]),
    LI("Wat is je grootste ambitie?", ["Wat is je grootste ambitie","Wat is je grootste ambitie?","Wat is jouw grootste ambitie"], "Qual é a tua maior ambição?", "Pergunta.", ["v-ambitie"]),
    SW("Fale do seu maior sonho (3–4 frases): o que é, o que já fez e que planos tem.", ["Mijn droom is om ooit een klein restaurant met Portugese gerechten te openen. Ik heb al een kookcursus gedaan en ik spaar elke maand een beetje. Met mijn partner zitten we plannen te smeden voor een eerste pop-up in de zomer."], ["Sonho","Passos","Planos"], 35, "Ambições.", ["v-droom-waarmaken"]),
  ], diff=4, mins=5)

L(26, "Crescer e tornar-se independente", "Op eigen benen staan.",
  ["Falar da infância, formação e independência"],
  vocab=[X("v-opgroeien","opgroeien","crescer (infância)","verb"), X("v-vormend","vormend","formativo","adjective"),
         X("v-op-eigen-benen","op eigen benen staan","ser independente")],
  ex=[("Ik ben opgegroeid in een klein dorp.","Cresci numa pequena aldeia."),("Die jaren in het buitenland waren erg vormend.","Esses anos no estrangeiro foram muito formativos."),("Met achttien stond ik al op eigen benen.","Aos dezoito já era independente.")],
  review=["v-jeugd","v-levensloop"],
  cefr=C, exs=[
    MA([("opgroeien","crescer"),("vormend","formativo"),("op eigen benen staan","ser independente"),("jeugd","juventude")], "Crescer.", ["v-opgroeien","v-vormend","v-op-eigen-benen","v-jeugd"]),
    TR("pt-nl","Cresci numa pequena aldeia.", ["Ik ben opgegroeid in een klein dorp","Ik groeide op in een klein dorp"], "zijn + opgegroeid.", ["v-opgroeien"]),
    TR("pt-nl","Aos dezoito já era independente.", ["Met achttien stond ik al op eigen benen","Op mijn achttiende stond ik al op eigen benen"], "Expressão.", ["v-op-eigen-benen"]),
    MC("«Opgroeien» no perfeito usa…", ["*zijn (ik ben opgegroeid)","hebben|Não: mudança de estado.","worden|Não."], "Auxiliar.", ["v-opgroeien"]),
    FB("Die tijd was erg ___ voor mij.", ["vormend"], "Formativo.", ["v-vormend"], choices=["vormend","vormende","gevormd"], tr="Essa época foi muito formativa para mim."),
    FE(["Ik","heb","in","Braga","opgegroeid."], 1, "ben", "Mudança de estado: zijn.", ["v-opgroeien"]),
    LI("Waar ben je opgegroeid?", ["Waar ben je opgegroeid","Waar ben je opgegroeid?","Waar ben jij opgegroeid"], "Onde cresceste?", "Pergunta.", ["v-opgroeien"]),
    SW("Responda numa entrevista (3–4 frases): «Waar bent u opgegroeid en wat heeft u gevormd?»", ["Ik ben opgegroeid in Viseu, een rustige stad in het binnenland. Mijn grootouders hadden een boerderij, en daar leerde ik hard werken. Mijn studiejaren in Lissabon waren erg vormend: daar leerde ik op eigen benen staan."], ["opgroeien","vormend","op eigen benen"], 35, "Entrevista.", ["v-opgroeien","v-vormend"]),
  ], diff=4, mins=5)

L(27, "Identidade entre culturas", "Tussen twee culturen.",
  ["Falar de identidade, raízes e saudade"],
  vocab=[N("v-roots","roots","raízes","de"), X("v-tussen-twee-culturen","tussen twee culturen","entre duas culturas"),
         N("v-nostalgie","nostalgie","nostalgia","de")],
  ex=[("Mijn roots liggen in Portugal.","As minhas raízes estão em Portugal."),("Ik voel me soms tussen twee culturen.","Às vezes sinto-me entre duas culturas."),("Het woord «saudade» betekent meer dan nostalgie.","A palavra «saudade» significa mais do que nostalgia.")],
  review=["v-heimwee"],
  cefr=C, exs=[
    MA([("roots","raízes"),("tussen twee culturen","entre duas culturas"),("nostalgie","nostalgia"),("heimwee","saudades de casa")], "Identidade.", ["v-roots","v-tussen-twee-culturen","v-nostalgie","v-heimwee"]),
    MC("«Heimwee» é mais específico do que «nostalgie» porque…", ["*é saudade de casa/da terra","é alegria|Não.","é sobre o futuro|Não."], "Nuance.", ["v-heimwee"]),
    TR("pt-nl","Às vezes sinto-me entre duas culturas.", ["Ik voel me soms tussen twee culturen","Soms voel ik me tussen twee culturen"], "Expressão.", ["v-tussen-twee-culturen"]),
    TR("pt-nl","As minhas raízes estão em Portugal.", ["Mijn roots liggen in Portugal","Mijn wortels liggen in Portugal"], "roots / wortels.", ["v-roots"]),
    FB("In december heb ik altijd ___ naar Portugal.", ["heimwee"], "Saudade de casa.", ["v-heimwee"], choices=["heimwee","nostalgie","roots"], tr="Em dezembro tenho sempre saudades de Portugal."),
    FE(["Ik","heb","heimwee","van","Portugal."], 3, "naar", "heimwee naar.", ["v-heimwee"]),
    LI("Je kunt je op twee plekken tegelijk thuis voelen.", ["Je kunt je op twee plekken tegelijk thuis voelen"], "Podes sentir-te em casa em dois sítios ao mesmo tempo.", "Reflexão.", ["v-tussen-twee-culturen"]),
    SW("Explique a um neerlandês, em 4 frases, o que é «saudade» e quando a sente.", ["«Saudade» is een Portugees woord dat moeilijk te vertalen is. Het lijkt op heimwee of nostalgie, maar het is ook een zoet verlangen naar iets of iemand die er niet is. Ik voel het als ik fado hoor of als ik aan de zee bij mijn ouders denk. Het is verdrietig en mooi tegelijk."], ["Explicação","Exemplo pessoal"], 40, "Cultura.", ["v-nostalgie","v-heimwee"]),
  ], diff=5, mins=6)

L(28, "Conversas mais profundas", "Van smalltalk naar een diepgaand gesprek.",
  ["Passar de conversa superficial a conversa profunda"],
  vocab=[X("v-diepgaand","diepgaand","profundo","adjective"), X("v-oppervlakkig","oppervlakkig","superficial","adjective"),
         X("v-uit-je-comfortzone","uit je comfortzone stappen","sair da zona de conforto","verb")],
  ex=[("We hadden een diepgaand gesprek over het leven.","Tivemos uma conversa profunda sobre a vida."),("Smalltalk is soms wat oppervlakkig.","A conversa de circunstância às vezes é um pouco superficial."),("Een taal leren betekent uit je comfortzone stappen.","Aprender uma língua significa sair da zona de conforto.")],
  review=["v-een-praatje-maken","v-nieuwsgierig"],
  cefr=C, exs=[
    MA([("diepgaand","profundo"),("oppervlakkig","superficial"),("uit je comfortzone stappen","sair da zona de conforto"),("een praatje maken","fazer conversa")], "Conversa.", ["v-diepgaand","v-oppervlakkig","v-uit-je-comfortzone","v-een-praatje-maken"]),
    MC("Uma boa pergunta para aprofundar a conversa:", ["*Wat heeft je eigenlijk naar Nederland gebracht?","Mooi weer, hè?|Superficial.","Hoe laat is het?|Não."], "Aprofundar.", ["v-diepgaand"]),
    TR("pt-nl","Tivemos uma conversa profunda.", ["We hadden een diepgaand gesprek","Wij hadden een diepgaand gesprek"], "het gesprek → diepgaand.", ["v-diepgaand"]),
    TR("pt-nl","Aprender uma língua é sair da zona de conforto.", ["Een taal leren betekent uit je comfortzone stappen","Een taal leren is uit je comfortzone stappen"], "Expressão.", ["v-uit-je-comfortzone"]),
    FB("Het gesprek bleef nogal ___: alleen over het weer.", ["oppervlakkig"], "Superficial.", ["v-oppervlakkig"], choices=["oppervlakkig","diepgaand","vormend"], tr="A conversa ficou bastante superficial: só sobre o tempo."),
    FE(["Het","was","een","diepgaande","gesprek."], 3, "diepgaand", "het gesprek → sem -e com «een».", ["v-diepgaand"]),
    LI("Stap eens uit je comfortzone en spreek je buren aan in het Nederlands.", ["Stap eens uit je comfortzone en spreek je buren aan in het Nederlands"], "Sai da zona de conforto e fala com os vizinhos em neerlandês.", "Desafio.", ["v-uit-je-comfortzone"]),
    DL([("Nieuwe collega","Mooi weer vandaag, hè?","Está bom tempo hoje, hein?"),("Jij","","")], ["*Heerlijk! Zeg, hoe bevalt het je hier eigenlijk, na je eerste week?","Ja.|Termina a conversa.","Oppervlakkig!|Rude."], "Aprofundar com tato.", ["v-diepgaand"]),
  ], diff=4, mins=5)

L(29, "Prática: uma entrevista pessoal longa", "Vertel eens over jezelf…",
  ["Manter uma conversa longa e pessoal com fluência"],
  vocab=[X("v-een-nieuwe-start","een nieuwe start","um recomeço")],
  ex=[("Nederland was voor mij een nieuwe start.","Os Países Baixos foram para mim um recomeço.")],
  review=["v-het-zit-zo","v-in-grote-lijnen","v-uit-eigen-ervaring","v-met-vallen-en-opstaan","v-geen-spijt-van","v-droom-waarmaken","v-opgroeien","v-tussen-twee-culturen","v-diepgaand"],
  cefr=C, exs=[
    CO("dialogue","Interview voor de buurtkrant","Interviewer: Vertel eens, waar bent u opgegroeid?\nAna: In Porto. Mijn roots liggen daar, maar ik woon nu al acht jaar hier.\nInterviewer: Wat bracht u naar Nederland?\nAna: Het zit zo: ik kreeg een baan aangeboden in een ziekenhuis. Het was een nieuwe start.\nInterviewer: Was het moeilijk?\nAna: Ik heb het met vallen en opstaan geleerd, vooral de taal. Maar ik heb er geen spijt van.\nInterviewer: Heeft u nog een droom?\nAna: Ja, ooit wil ik een boek schrijven over mensen tussen twee culturen.",
       [("Há quanto tempo vive cá?", ["*Oito anos","Dois anos","Desde criança"]),("Porque veio?", ["*Ofereceram-lhe emprego num hospital","Por amor","Para estudar"]),("Qual é o sonho?", ["*Escrever um livro","Voltar a Porto","Abrir um restaurante"])],
       "Entrevista longa.", ["v-een-nieuwe-start","v-opgroeien","v-met-vallen-en-opstaan"]),
    MA([("het zit zo…","a coisa é…"),("met vallen en opstaan","errando e aprendendo"),("een nieuwe start","um recomeço"),("tussen twee culturen","entre duas culturas")], "Revisão.", ["v-het-zit-zo","v-met-vallen-en-opstaan","v-een-nieuwe-start","v-tussen-twee-culturen"]),
    TR("pt-nl","Foi para mim um recomeço.", ["Het was voor mij een nieuwe start"], "nieuwe start.", ["v-een-nieuwe-start"]),
    MC("Na entrevista, a Ana usa «Het zit zo» para…", ["*introduzir a explicação","terminar a conversa|Não.","mudar de assunto|Não."], "Revisão.", ["v-het-zit-zo"]),
    FE(["Ik","heb","nergens","spijt","op."], 4, "van.", "Revisão: spijt hebben van.", ["v-geen-spijt-van"]),
    SW("Responda por escrito, como numa entrevista longa (cerca de 120 palavras), a: «Vertel eens over jezelf: waar ben je opgegroeid, wat bracht je naar Nederland, wat was moeilijk, waar ben je trots op en wat is je droom?» Use pelo menos cinco expressões desta unidade.", ["Ik ben opgegroeid in een klein dorp bij Coimbra. In grote lijnen was mijn jeugd rustig en gelukkig. Het zit zo: na mijn studie kon ik in Portugal geen werk vinden, dus ik nam een baan aan in Eindhoven. Dat was een echte nieuwe start. Ik heb de taal met vallen en opstaan geleerd; uit eigen ervaring weet ik hoe frustrerend dat kan zijn. Toch heb ik er geen spijt van. Ik ben er trots op dat ik nu vergaderingen in het Nederlands leid. Mijn droom? Ooit een eigen bedrijf beginnen, met een team dat zich ook tussen twee culturen thuis voelt."], ["5+ expressões","Narrativa coerente","Passado e futuro"], 100, "Entrevista final.", ["v-een-nieuwe-start"]),
  ], diff=5, mins=8)

W()
