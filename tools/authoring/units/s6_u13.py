import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u13")
C = "B1-B2"

L(1, "Relatar afirmações", "Hij zei: «Ik ben moe.» → Hij zei dat hij moe was.",
  ["Passar afirmações para discurso indireto"],
  vocab=[V("v-indirecte-rede","indirecte rede","discurso indireto","noun","de"), V("v-directe-rede","directe rede","discurso direto","noun","de"),
         V("v-zei","zei / zeiden","disse / disseram","verb",note="zeggen → zei, gezegd"), V("v-vertelde","vertelde","contou","verb")],
  ex=[("Hij zei: «Ik ben moe.»","Ele disse: «Estou cansado.»"),("Hij zei dat hij moe was.","Ele disse que estava cansado."),("Ze vertelde dat ze een nieuwe baan had.","Ela contou que tinha um emprego novo."),("Mijn moeder zei dat ik moest bellen.","A minha mãe disse que eu tinha de ligar.")],
  gram=[G("g-indirecte-rede","Do direto ao indireto","1) **dat** + verbo no fim. 2) **pronomes** mudam conforme quem fala: *ik → hij/zij*. 3) Se o verbo introdutor está no passado (*zei*), o tempo recua normalmente: presente → **imperfectum** (*ben → was*), perfectum → **plusquamperfectum** (*heb gedaan → had gedaan*). Na fala, muitas vezes mantém-se o presente se ainda for verdade.",
    [("«Ik woon in Delft.» → Ze zei dat ze in Delft woonde/woont.","«Moro em Delft.» → Ela disse que morava/mora em Delft.")])],
  review=["v-zeggen","v-dat-conj","v-was"],
  cefr=C, exs=[
    MA([("indirecte rede","discurso indireto"),("directe rede","discurso direto"),("zei","disse"),("vertelde","contou")], "Discurso.", ["v-indirecte-rede","v-directe-rede","v-zei","v-vertelde"]),
    WO("Ele disse que estava cansado.", ["Hij","zei","dat","hij","moe","was"], "zei dat + passado.", ["v-indirecte-rede"]),
    WO("Ela contou que tinha um emprego novo.", ["Ze","vertelde","dat","ze","een","nieuwe","baan","had"], "had no fim.", ["v-vertelde"]),
    TR("pt-nl","A minha mãe disse que eu tinha de ligar.", ["Mijn moeder zei dat ik moest bellen"], "moet → moest.", ["v-zei"]),
    MC("«Ik heb het al gedaan,» zei Tom. → Tom zei dat hij het al…", ["*had gedaan","heb gedaan|Pronome e tempo não adaptados.","doet|Tempo errado."], "Perfectum → plusquamperfectum.", ["v-indirecte-rede"]),
    MC("«Wij komen morgen,» zeiden ze. → Ze zeiden dat…", ["*ze de volgende dag zouden komen","wij morgen komen|Pronome não adaptado.","ze morgen kwamen gisteren|Confuso."], "Pronome + futuro no passado.", ["v-indirecte-rede"]),
    FE(["Hij","zei","dat","ik","ben","moe."], 3, "hij moe was", "Pronome e tempo: dat hij moe was.", ["v-indirecte-rede"]),
    TR("nl-pt","Mijn buurman vertelde dat hij ging verhuizen.", ["O meu vizinho contou que se ia mudar","O meu vizinho disse que ia mudar de casa"], "ging verhuizen.", ["v-vertelde"]),
    LI("Ze zei dat ze het niet wist.", ["Ze zei dat ze het niet wist","Zij zei dat ze het niet wist"], "Ela disse que não sabia.", "wist.", ["v-zei"]),
    CJ("zeggen","hij","Hij heeft ___ dat hij later komt.", ["gezegd"], "zeggen → gezegd.", ["v-zei"], tense="passado-perfeito"),
  ], diff=5, mins=7)

L(2, "Relatar perguntas", "Ze vroeg of… Hij wilde weten waar…",
  ["Passar perguntas para discurso indireto"],
  vocab=[V("v-vroeg-vragen","vroeg / vroegen","perguntou / perguntaram","verb",note="vragen → vroeg, gevraagd"), V("v-wilde-weten","wilde weten","queria saber","expression"),
         V("v-informeren-naar","informeren naar","perguntar por|informar-se sobre","expression"), V("v-zich-afvragen-of","zich afvragen of","perguntar-se se","expression")],
  ex=[("Ze vroeg: «Kom je ook?»","Ela perguntou: «Também vens?»"),("Ze vroeg of ik ook kwam.","Ela perguntou se eu também vinha."),("Hij wilde weten waar het station was.","Ele queria saber onde era a estação."),("De dokter informeerde naar mijn gezondheid.","O médico perguntou pela minha saúde.")],
  gram=[G("g-indirecte-vraag-verleden","Perguntas indiretas","Pergunta sim/não → **of** + verbo no fim: *Ze vroeg **of** ik kwam.* Pergunta com palavra interrogativa → essa palavra + verbo no fim: *Hij vroeg **waar** het station **was**.* Mesmas mudanças de pronome e tempo.",
    [("«Hoe laat is het?» → Ze vroeg hoe laat het was.","«Que horas são?» → Ela perguntou que horas eram.")])],
  review=["v-of-conj","v-zich-afvragen","v-vraag"],
  cefr=C, exs=[
    MA([("vroeg","perguntou"),("wilde weten","queria saber"),("informeren naar","perguntar por"),("zich afvragen of","perguntar-se se")], "Perguntas relatadas.", ["v-vroeg-vragen","v-wilde-weten","v-informeren-naar","v-zich-afvragen-of"]),
    WO("Ela perguntou se eu também vinha.", ["Ze","vroeg","of","ik","ook","kwam"], "of + verbo no fim.", ["v-vroeg-vragen"]),
    WO("Ele queria saber onde era a estação.", ["Hij","wilde","weten","waar","het","station","was"], "waar + verbo no fim.", ["v-wilde-weten"]),
    TR("pt-nl","Ela perguntou que horas eram.", ["Ze vroeg hoe laat het was","Zij vroeg hoe laat het was"], "hoe laat + was.", ["v-vroeg-vragen"]),
    MC("«Heb je honger?» vroeg mama. → Mama vroeg…", ["*of ik honger had","dat ik honger had|Pergunta sim/não → of.","heb je honger|Discurso direto."], "of.", ["v-vroeg-vragen"]),
    FE(["Hij","vroeg","of","ik","kom","morgen."], 4, "morgen kwam", "Verbo no fim (e no passado): of ik morgen kwam.", ["v-vroeg-vragen"]),
    FE(["Ze","vroeg","dat","ik","tijd","had."], 2, "of", "Pergunta sim/não → of.", ["v-of-conj"]),
    TR("nl-pt","De dokter informeerde naar mijn gezondheid.", ["O médico perguntou pela minha saúde","O médico informou-se sobre a minha saúde"], "informeren naar.", ["v-informeren-naar"]),
    LI("Ik vroeg me af of hij de waarheid sprak.", ["Ik vroeg me af of hij de waarheid sprak","Ik vroeg mij af of hij de waarheid sprak"], "Perguntei-me se ele estava a dizer a verdade.", "zich afvragen of.", ["v-zich-afvragen-of"]),
    CJ("vragen","zij (ela)","Ze heeft ___ of je meegaat.", ["gevraagd"], "vragen → gevraagd.", ["v-vroeg-vragen"], tense="passado-perfeito"),
  ], diff=5, mins=7)

L(3, "Relatar ordens e pedidos", "Hij zei dat ik moest… Ze vroeg me om… te…",
  ["Passar ordens e pedidos para discurso indireto"],
  vocab=[V("v-vragen-om-te","vragen om … te","pedir para …","expression"), V("v-opdragen","opdragen","encarregar|mandar","verb"),
         V("v-adviseren","adviseren","aconselhar","verb"), V("v-waarschuwen","waarschuwen","avisar","verb")],
  ex=[("«Bel me morgen!» → Hij zei dat ik hem morgen moest bellen.","«Liga-me amanhã!» → Ele disse que eu tinha de lhe ligar amanhã."),("Ze vroeg me om de deur dicht te doen.","Ela pediu-me para fechar a porta."),("De dokter adviseerde me om meer te bewegen.","O médico aconselhou-me a mexer-me mais."),("Hij waarschuwde ons dat het glad was.","Ele avisou-nos de que estava escorregadio.")],
  gram=[G("g-indirect-bevel","Ordens e pedidos","Imperativo → **dat … moest/moesten** + infinitivo: *«Kom!» → Hij zei dat ik **moest komen**.* Ou → **vragen/adviseren om … te**: *Ze vroeg me **om** de deur dicht **te doen**.*",
    [("«Neem een paraplu mee.» → Ze adviseerde me om een paraplu mee te nemen.","«Leva um guarda-chuva.» → Ela aconselhou-me a levar um guarda-chuva.")])],
  review=["v-moest","v-om","v-zeggen"],
  cefr=C, exs=[
    MA([("vragen om … te","pedir para"),("opdragen","encarregar"),("adviseren","aconselhar"),("waarschuwen","avisar")], "Ordens e pedidos.", ["v-vragen-om-te","v-opdragen","v-adviseren","v-waarschuwen"]),
    WO("Ela pediu-me para fechar a porta.", ["Ze","vroeg","me","om","de","deur","dicht","te","doen"], "om … te.", ["v-vragen-om-te"]),
    WO("Ele disse que eu tinha de lhe ligar amanhã.", ["Hij","zei","dat","ik","hem","morgen","moest","bellen"], "moest + inf.", ["v-moest"]),
    TR("pt-nl","O médico aconselhou-me a mexer-me mais.", ["De dokter adviseerde me om meer te bewegen","De arts adviseerde me om meer te bewegen","De huisarts adviseerde me meer te bewegen"], "adviseren om te.", ["v-adviseren"]),
    TR("nl-pt","Hij waarschuwde ons dat het glad was.", ["Ele avisou-nos de que estava escorregadio","Ele avisou-nos que estava escorregadio"], "waarschuwen.", ["v-waarschuwen"]),
    MC("«Wees stil!» zei de leraar. → De leraar zei dat we…", ["*stil moesten zijn","stil zijn|Falta moesten.","stil wees|Agramatical."], "moesten.", ["v-moest"]),
    FE(["Ze","vroeg","me","om","de","deur","dicht","doen."], 7, "te doen", "om … te + infinitivo.", ["v-vragen-om-te"]),
    LI("De chef heeft me opgedragen het rapport af te maken.", ["De chef heeft me opgedragen het rapport af te maken","De chef heeft mij opgedragen het rapport af te maken"], "O chefe encarregou-me de terminar o relatório.", "opdragen.", ["v-opdragen"]),
    CJ("waarschuwen","hij","Hij heeft ons ___ voor de storm.", ["gewaarschuwd"], "waarschuwen → gewaarschuwd.", ["v-waarschuwen"], tense="passado-perfeito"),
    FB("Mijn moeder adviseerde me ___ een jas mee te nemen.", ["om"], "adviseren om te.", ["v-adviseren"], choices=["om","dat","of"], tr="A minha mãe aconselhou-me a levar um casaco."),
  ], diff=5, mins=7)

L(4, "Verbos introdutores", "beweren, toegeven, ontkennen, benadrukken, beloven",
  ["Escolher verbos introdutores precisos para relatar"],
  vocab=[V("v-ontkennen","ontkennen","negar","verb"), V("v-bevestigen-rede","bevestigen","confirmar","verb"),
         V("v-erkennen-rede","erkennen","reconhecer (admitir)","verb"), V("v-klagen-dat","klagen dat","queixar-se de que","expression")],
  ex=[("De minister ontkende dat hij het wist.","O ministro negou que soubesse."),("De woordvoerder bevestigde het nieuws.","O porta-voz confirmou a notícia."),("Ze erkende dat ze een fout had gemaakt.","Ela reconheceu que tinha cometido um erro."),("Bewoners klagen dat het te druk is.","Os moradores queixam-se de que há demasiado movimento.")],
  review=["v-beweren","v-toegeven","v-benadrukken","v-beloofd"],
  cefr=C, exs=[
    MA([("ontkennen","negar"),("bevestigen","confirmar"),("erkennen","reconhecer"),("klagen dat","queixar-se de que")], "Verbos introdutores.", ["v-ontkennen","v-bevestigen-rede","v-erkennen-rede","v-klagen-dat"]),
    MC("«Ik heb het niet gedaan!» → Hij … dat hij het gedaan had.", ["*ontkende","bevestigde|Ao contrário.","beloofde|Não."], "Negar.", ["v-ontkennen"]),
    MC("«Ja, het klopt, we sluiten de fabriek.» → De directeur … het nieuws.", ["*bevestigde","ontkende|Ao contrário.","vroeg|Não é pergunta."], "Confirmar.", ["v-bevestigen-rede"]),
    MC("«Ik kom zeker op tijd.» → Ze … dat ze op tijd zou komen.", ["*beloofde","ontkende|Não.","klaagde|Não."], "Prometer.", ["v-beloofd"]),
    TR("pt-nl","Ela reconheceu que tinha cometido um erro.", ["Ze erkende dat ze een fout had gemaakt","Zij erkende dat ze een fout had gemaakt","Ze gaf toe dat ze een fout had gemaakt"], "erkennen + plusquamperfectum.", ["v-erkennen-rede"]),
    TR("nl-pt","Bewoners klagen dat het te druk is.", ["Os moradores queixam-se de que há demasiado movimento","Os moradores queixam-se de que está muito movimentado"], "klagen dat.", ["v-klagen-dat"]),
    FE(["De","minister","ontkende","dat","hij","wist","het."], 5, "het wist", "Verbo no fim: dat hij het wist.", ["v-ontkennen"]),
    LI("De woordvoerder wilde het nieuws niet bevestigen.", ["De woordvoerder wilde het nieuws niet bevestigen"], "O porta-voz não quis confirmar a notícia.", "bevestigen.", ["v-bevestigen-rede"]),
    CJ("ontkennen","hij","Hij heeft alles ___.", ["ontkend"], "ont- → sem ge-: ontkend.", ["v-ontkennen"], tense="passado-perfeito"),
    FB("De verdachte ___ dat hij in de buurt was.", ["ontkende"], "Negar.", ["v-ontkennen"], choices=["ontkende","beloofde","adviseerde"], tr="O suspeito negou que estivesse nas imediações."),
  ], diff=5, mins=7)

L(5, "Relatar uma conversa", "Juntar afirmações, perguntas e pedidos.",
  ["Relatar uma conversa completa a outra pessoa"],
  vocab=[V("v-navertellen","navertellen","recontar","verb"), V("v-volgens-haar","volgens haar / hem","segundo ela / ele","expression"),
         V("v-letterlijk-zeggen","letterlijk zeggen","dizer textualmente","expression"), V("v-samengevat","samengevat","em resumo","adverb")],
  ex=[("Kun je het gesprek even navertellen?","Podes contar como foi a conversa?"),("Volgens haar is het project te duur.","Segundo ela, o projeto é demasiado caro."),("Hij zei letterlijk: «Dit is onacceptabel.»","Ele disse textualmente: «Isto é inaceitável.»"),("Samengevat: ze willen meer tijd.","Em resumo: querem mais tempo.")],
  review=["v-zei","v-vroeg-vragen","v-vragen-om-te","v-ontkennen"],
  cefr=C, exs=[
    MA([("navertellen","recontar"),("volgens haar","segundo ela"),("letterlijk zeggen","dizer textualmente"),("samengevat","em resumo")], "Relatar.", ["v-navertellen","v-volgens-haar","v-letterlijk-zeggen","v-samengevat"]),
    CO("dialogue","Gesprek met de huisbaas", "Huisbaas: Ik wil de huur per 1 juli verhogen met vijftig euro.\nAna: Waarom zo veel?\nHuisbaas: De kosten voor onderhoud zijn gestegen.\nAna: Kunt u dan eerst de lekkende kraan repareren?\nHuisbaas: Ik stuur volgende week een loodgieter.",
       [("O que disse o senhorio sobre a renda?", ["*Que a queria aumentar 50 euros a partir de 1 de julho","Que a ia baixar","Que se mantinha"]),("O que pediu a Ana?", ["*Que reparasse primeiro a torneira","Que baixasse a renda","Que lhe devolvesse a caução"]),("O que prometeu o senhorio?", ["*Mandar um canalizador na semana seguinte","Nada","Pintar a casa"])],
       "Agora reconte com discurso indireto.", ["v-navertellen"]),
    MC("Melhor relato da 1.ª frase do senhorio:", ["*Hij zei dat hij de huur per 1 juli met vijftig euro wilde verhogen.","Hij zei: ik wil verhogen.|Direto e incompleto.","Hij zei dat ik de huur verhoog.|Pronome e tempo errados."], "Relato.", ["v-zei"]),
    MC("Relato da pergunta da Ana:", ["*Ana vroeg waarom hij de huur zo veel verhoogde.","Ana vroeg of waarom zo veel.|Agramatical.","Ana zei waarom zo veel.|Use vroeg."], "Pergunta relatada.", ["v-vroeg-vragen"]),
    WO("A Ana pediu-lhe para reparar primeiro a torneira.", ["Ana","vroeg","hem","om","eerst","de","kraan","te","repareren"], "vragen om te.", ["v-vragen-om-te"]),
    TR("pt-nl","Segundo ela, o projeto é demasiado caro.", ["Volgens haar is het project te duur"], "volgens + inversão.", ["v-volgens-haar"]),
    TR("nl-pt","Samengevat: ze willen meer tijd.", ["Em resumo: querem mais tempo","Resumindo: eles querem mais tempo"], "samengevat.", ["v-samengevat"]),
    FE(["Hij","beloofde","dat","hij","stuurt","volgende","week","een","loodgieter."], 4, "volgende week een loodgieter zou sturen", "Promessa no passado: dat hij … zou sturen (no fim).", ["v-beloofd"]),
    LI("Hij zei letterlijk dat het zijn probleem niet was.", ["Hij zei letterlijk dat het zijn probleem niet was"], "Ele disse textualmente que o problema não era dele.", "letterlijk.", ["v-letterlijk-zeggen"]),
    SW("Reconte a conversa entre a Ana e o senhorio em discurso indireto (3–4 frases).", ["De huisbaas zei dat hij de huur per 1 juli met vijftig euro wilde verhogen. Ana vroeg waarom het zo veel was. Hij antwoordde dat de kosten voor onderhoud gestegen waren. Ana vroeg hem om eerst de kraan te repareren en hij beloofde dat hij een loodgieter zou sturen."], ["Afirmação com **zei dat**", "Pergunta com **vroeg waarom/of**", "Pedido com **vroeg om … te**", "Tempos recuados"], 45, "Conversa relatada.", ["v-navertellen","v-zei","v-vroeg-vragen"]),
  ], diff=5, mins=8)

W()
