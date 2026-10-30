import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u10")
C = "B1"

L(1, "Colegas e chefias", "leidinggevende, collega, de baas, een teamuitje",
  ["Falar de relações no local de trabalho"],
  vocab=[V("v-leidinggevende","leidinggevende","chefe|superior","noun","de"), V("v-teamuitje","teamuitje","saída de equipa","noun","het"),
         V("v-samenwerking","samenwerking","colaboração","noun","de"), V("v-hierarchie","hiërarchie","hierarquia","noun","de")],
  ex=[("Mijn leidinggevende is erg toegankelijk.","A minha chefe é muito acessível."),("Vrijdag hebben we een teamuitje.","Sexta temos uma saída de equipa."),("De samenwerking loopt goed.","A colaboração está a correr bem."),("De hiërarchie is hier vrij plat.","Aqui a hierarquia é bastante horizontal.")],
  gram=[G("g-platte-hierarchie","Hierarquia horizontal","Em muitas empresas neerlandesas a hierarquia é **plat**: trata-se o chefe por **je** e pelo primeiro nome, e espera-se que cada um dê a sua opinião em reuniões. Decisões tomam-se muitas vezes por consenso (*polderen*).",
    [("Iedereen mag zijn mening geven.","Todos podem dar a sua opinião.")],
    "Em Portugal há geralmente mais distância formal com a chefia.")],
  review=["v-collega","v-werk","v-team"],
  cefr=C, exs=[
    MA([("leidinggevende","chefe"),("teamuitje","saída de equipa"),("samenwerking","colaboração"),("hiërarchie","hierarquia")], "Trabalho.", ["v-leidinggevende","v-teamuitje","v-samenwerking","v-hierarchie"]),
    TR("pt-nl","A colaboração está a correr bem.", ["De samenwerking loopt goed","De samenwerking gaat goed"], "lopen = correr (bem/mal).", ["v-samenwerking"]),
    TR("nl-pt","De hiërarchie is hier vrij plat.", ["Aqui a hierarquia é bastante horizontal","A hierarquia aqui é bastante plana"], "plat.", ["v-hierarchie"]),
    TR("pt-nl","Sexta temos uma saída de equipa.", ["Vrijdag hebben we een teamuitje","Vrijdag hebben wij een teamuitje","We hebben vrijdag een teamuitje"], "het teamuitje.", ["v-teamuitje"]),
    AR("teamuitje","a saída de equipa","het", "Diminutivo → het.", ["v-teamuitje"]),
    MC("Como trata normalmente a chefe numa empresa neerlandesa?", ["*Pelo primeiro nome e por «je»","Por «Senhora Doutora»|Não se usa.","Por «u» e apelido sempre|Pouco comum hoje."], "Hierarquia plana.", ["v-leidinggevende"]),
    MC("«Polderen» significa…", ["*procurar consenso através de muita discussão","trabalhar num pólder|Sentido literal, aqui não.","despedir|Não."], "Modelo de consenso.", ["v-hierarchie"]),
    FE(["Mijn","leidinggevende","zijn","erg","aardig."], 2, "is", "Sujeito singular: is.", ["v-leidinggevende"]),
    LI("Ik heb een goede band met mijn collega's.", ["Ik heb een goede band met mijn collega's"], "Tenho uma boa relação com os meus colegas.", "band = relação/ligação.", ["v-collega"]),
    FB("De ___ tussen de afdelingen kan beter.", ["samenwerking"], "Colaboração.", ["v-samenwerking"], choices=["samenwerking","hiërarchie","teamuitje"], tr="A colaboração entre os departamentos pode melhorar."),
  ], diff=4, mins=6)

L(2, "Dar feedback", "Tops en tips. Wat ging goed? Wat kan beter?",
  ["Dar feedback construtivo"],
  vocab=[V("v-feedback","feedback","feedback","noun","de"), V("v-compliment","compliment","elogio","noun","het"),
         V("v-verbeterpunt","verbeterpunt","ponto a melhorar","noun","het"), V("v-kan-beter","dat kan beter","isso pode melhorar","expression")],
  ex=[("Mag ik je wat feedback geven?","Posso dar-te algum feedback?"),("Complimenten voor je presentatie!","Parabéns pela tua apresentação!"),("Een verbeterpunt is de tijd.","Um ponto a melhorar é o tempo."),("De inhoud was goed, maar de structuur kan beter.","O conteúdo estava bom, mas a estrutura pode melhorar.")],
  gram=[G("g-feedback","Feedback: tops en tips","Uma forma comum: primeiro o positivo (**top**): *Wat ging goed was…*, depois o ponto a melhorar (**tip**): *Een tip: …* / *Wat beter kan is…* Fale do comportamento, não da pessoa: *De presentatie was te lang* (não *jij bent saai*).",
    [("Wat ik goed vond: je voorbeelden.","O que achei bem: os teus exemplos.")])],
  review=["v-kritiek","v-tip","v-eerlijk-gezegd"],
  cefr=C, exs=[
    MA([("feedback","feedback"),("compliment","elogio"),("verbeterpunt","ponto a melhorar"),("dat kan beter","pode melhorar")], "Feedback.", ["v-feedback","v-compliment","v-verbeterpunt","v-kan-beter"]),
    TR("pt-nl","Posso dar-te algum feedback?", ["Mag ik je wat feedback geven","Mag ik je feedback geven","Mag ik jou wat feedback geven"], "feedback geven.", ["v-feedback"]),
    TR("nl-pt","Complimenten voor je presentatie!", ["Parabéns pela tua apresentação","Os meus parabéns pela tua apresentação","Muito boa a tua apresentação"], "complimenten voor.", ["v-compliment"]),
    TR("pt-nl","O conteúdo estava bom, mas a estrutura pode melhorar.", ["De inhoud was goed(,) maar de structuur kan beter"], "kan beter.", ["v-kan-beter"]),
    AR("compliment","o elogio","het", "Het compliment.", ["v-compliment"]),
    AR("verbeterpunt","o ponto a melhorar","het", "Het punt.", ["v-verbeterpunt"]),
    MC("Feedback construtivo:", ["*Je presentatie was duidelijk. Een tip: spreek wat langzamer.","Je bent een slechte spreker.|Ataque pessoal.","Niks goed.|Vago e negativo."], "Top + tip.", ["v-feedback"]),
    FE(["Ik","geef","jij","een","compliment."], 2, "je", "Objeto indireto: je (não jij).", ["v-compliment"]),
    LI("Wat ging er volgens jou goed?", ["Wat ging er volgens jou goed"], "Na tua opinião, o que correu bem?", "Pedir autoavaliação.", ["v-feedback"]),
    SW("Um colega fez uma apresentação longa mas interessante. Dê-lhe feedback com um «top» e uma «tip».", ["Je presentatie was heel interessant en je voorbeelden waren goed. Een tip: maak hem wat korter, want na twintig minuten verloor ik mijn aandacht."], ["Um elogio concreto", "Uma dica concreta", "Sobre o trabalho, não sobre a pessoa"], 20, "Feedback equilibrado.", ["v-feedback","v-compliment"]),
  ], diff=4, mins=7)

L(3, "Receber feedback", "Dank je voor de feedback. Wat bedoel je precies met…?",
  ["Reagir a feedback de forma profissional"],
  vocab=[V("v-openstaan","openstaan voor","estar aberto a","expression"), V("v-ter-harte-nemen","ter harte nemen","levar a sério|ter em conta","expression"),
         V("v-verdedigen","zich verdedigen","defender-se","verb"), V("v-oppakken","oppakken","pegar em|tratar de","verb",note="Ik pak het op.")],
  ex=[("Ik sta open voor feedback.","Estou aberto a feedback."),("Ik neem het ter harte.","Vou ter isso em conta."),("Je hoeft je niet te verdedigen.","Não precisas de te defender."),("Ik pak het meteen op.","Trato disso já.")],
  review=["v-feedback","v-precies-bedoelen","v-voorbeeld"],
  cefr=C, exs=[
    MA([("openstaan voor","estar aberto a"),("ter harte nemen","ter em conta"),("zich verdedigen","defender-se"),("oppakken","tratar de")], "Receber feedback.", ["v-openstaan","v-ter-harte-nemen","v-verdedigen","v-oppakken"]),
    TR("pt-nl","Estou aberto a feedback.", ["Ik sta open voor feedback"], "openstaan voor.", ["v-openstaan"]),
    TR("nl-pt","Ik neem het ter harte.", ["Vou ter isso em conta","Levo isso a sério","Vou levar isso em conta"], "Expressão fixa.", ["v-ter-harte-nemen"]),
    TR("pt-nl","Trato disso já.", ["Ik pak het meteen op","Ik pak het direct op"], "oppakken.", ["v-oppakken"]),
    MC("O chefe diz que os seus e-mails são longos demais. Boa resposta:", ["*Dank je. Heb je een voorbeeld? Dan kan ik het beter oppakken.","Dat is niet waar!|Defensivo.","Jouw e-mails zijn ook lang.|Contra-ataque."], "Agradecer e pedir exemplo.", ["v-oppakken"]),
    FE(["Ik","sta","open","aan","feedback."], 3, "voor", "openstaan voor.", ["v-openstaan"]),
    WO("Não precisas de te defender.", ["Je","hoeft","je","niet","te","verdedigen"], "niet hoeven te + reflexivo.", ["v-verdedigen"]),
    LI("Bedankt voor je eerlijke feedback, daar heb ik wat aan.", ["Bedankt voor je eerlijke feedback(,) daar heb ik wat aan"], "Obrigado pelo feedback sincero, é-me útil.", "ergens wat aan hebben.", ["v-feedback"]),
    DL([("Leidinggevende","Je komt vaak te laat in vergaderingen.","Chegas muitas vezes atrasado às reuniões."),("Tiago","")], ["*Dat klopt, sorry. Ik neem het ter harte en let er voortaan op.","Iedereen komt te laat!|Defensivo.","Nee hoor.|Nega sem argumento."], "Aceitar e comprometer-se.", ["v-ter-harte-nemen"]),
    FB("Ik zal de opmerkingen meteen ___.", ["oppakken"], "Tratar de.", ["v-oppakken"], choices=["oppakken","verdedigen","openstaan"], tr="Vou tratar das observações de imediato."),
  ], diff=4, mins=6)

L(4, "Pedir algo ao chefe", "Zou ik vrij kunnen krijgen? Ik wil het graag hebben over mijn salaris.",
  ["Fazer pedidos formais no trabalho: folga, aumento, teletrabalho"],
  vocab=[V("v-vrij-vragen","vrij vragen","pedir folga","expression"), V("v-salarisverhoging","salarisverhoging","aumento salarial","noun","de"),
         V("v-het-hebben-over","het hebben over","falar sobre","expression"), V("v-functioneringsgesprek","functioneringsgesprek","entrevista de avaliação","noun","het")],
  ex=[("Zou ik vrijdag vrij kunnen krijgen?","Podia ter folga na sexta?"),("Ik wil het graag hebben over mijn salaris.","Gostaria de falar sobre o meu salário."),("Ik vraag een salarisverhoging aan.","Vou pedir um aumento."),("Volgende week heb ik mijn functioneringsgesprek.","Para a semana tenho a minha entrevista de avaliação.")],
  review=["v-zou","v-salaris","v-thuiswerken"],
  cefr=C, exs=[
    MA([("vrij vragen","pedir folga"),("salarisverhoging","aumento"),("het hebben over","falar sobre"),("functioneringsgesprek","avaliação de desempenho")], "Pedidos.", ["v-vrij-vragen","v-salarisverhoging","v-het-hebben-over","v-functioneringsgesprek"]),
    WO("Podia ter folga na sexta?", ["Zou","ik","vrijdag","vrij","kunnen","krijgen?"], "zou … kunnen krijgen.", ["v-vrij-vragen"]),
    TR("pt-nl","Gostaria de falar sobre o meu salário.", ["Ik wil het graag hebben over mijn salaris","Ik zou het graag willen hebben over mijn salaris"], "het hebben over.", ["v-het-hebben-over"]),
    TR("nl-pt","Volgende week heb ik mijn functioneringsgesprek.", ["Para a semana tenho a minha [entrevista|reunião] de avaliação","Na próxima semana tenho a minha avaliação de desempenho"], "functioneringsgesprek.", ["v-functioneringsgesprek"]),
    AR("functioneringsgesprek","a avaliação de desempenho","het", "Het gesprek.", ["v-functioneringsgesprek"]),
    MC("Melhor forma de pedir um aumento:", ["*Ik wil het graag hebben over mijn salaris. Ik heb dit jaar veel nieuwe taken gekregen.","Ik wil meer geld, nu.|Exigente e sem argumentos.","Iedereen verdient meer dan ik.|Comparação pouco profissional."], "Pedido + argumento.", ["v-salarisverhoging"]),
    FE(["Ik","wil","het","hebben","van","mijn","salaris."], 4, "over", "het hebben over.", ["v-het-hebben-over"]),
    LI("Zou ik volgende week een dag thuis kunnen werken?", ["Zou ik volgende week een dag thuis kunnen werken"], "Podia trabalhar um dia em casa na próxima semana?", "zou … kunnen.", ["v-thuiswerken"]),
    FB("Ik wil graag een dag ___ vragen voor de verhuizing.", ["vrij"], "vrij vragen.", ["v-vrij-vragen"], choices=["vrij","vrije","vrijheid"], tr="Queria pedir um dia de folga para a mudança."),
    SW("Escreva um e-mail curto à chefe a pedir para trabalhar de casa às quartas, com uma razão.", ["Hoi Karin, zou ik voortaan op woensdag thuis kunnen werken? Dan bespaar ik twee uur reistijd en kan ik me beter concentreren. Groet, Ana"], ["Pedido com **zou ik … kunnen**", "Razão concreta", "Registo adequado"], 20, "Pedido ao chefe.", ["v-het-hebben-over"]),
  ], diff=4, mins=7)

L(5, "Small talk no trabalho", "Hoe was je weekend? Lekker weer, hè?",
  ["Fazer conversa de circunstância no trabalho"],
  vocab=[V("v-he-tag","hè?","não é?","expression",note="Lekker weer, hè?"), V("v-druk-gehad","het druk gehad","ter tido muito que fazer","expression"),
         V("v-borrel-vrijdag","vrijdagmiddagborrel","copo de sexta à tarde","noun","de"), V("v-bijpraten","bijpraten","pôr a conversa em dia","verb")],
  ex=[("Lekker weer, hè?","Está um tempo ótimo, não está?"),("Heb je het druk gehad?","Tens tido muito que fazer?"),("Kom je ook naar de vrijdagmiddagborrel?","Também vens ao copo de sexta à tarde?"),("We moeten snel weer eens bijpraten.","Temos de pôr a conversa em dia em breve.")],
  review=["v-o-ja","v-en-jij","v-weekend","v-borrel"],
  cefr=C, exs=[
    MA([("hè?","não é?"),("het druk gehad","ter tido muito que fazer"),("vrijdagmiddagborrel","copo de sexta"),("bijpraten","pôr a conversa em dia")], "Small talk.", ["v-he-tag","v-druk-gehad","v-borrel-vrijdag","v-bijpraten"]),
    TR("pt-nl","Está um tempo ótimo, não está?", ["Lekker weer(,) hè","Mooi weer(,) hè","Lekker weertje(,) hè"], "hè.", ["v-he-tag"]),
    TR("pt-nl","Temos de pôr a conversa em dia em breve.", ["We moeten snel weer eens bijpraten","We moeten binnenkort bijpraten","We moeten gauw eens bijpraten"], "bijpraten.", ["v-bijpraten"]),
    TR("nl-pt","Heb je het druk gehad?", ["Tens tido muito que fazer","Tiveste muito trabalho","Tens andado muito ocupado"], "het druk hebben.", ["v-druk-gehad"]),
    MC("Tema seguro para small talk no trabalho:", ["*o tempo, o fim de semana, as férias","o salário dos colegas|Tabu.","política e religião com desconhecidos|Arriscado."], "Temas neutros.", ["v-he-tag"]),
    LI("Hoe was je vakantie? Ben je nog weggeweest?", ["Hoe was je vakantie(?) Ben je nog weggeweest","Hoe was jouw vakantie(?) Ben je nog weggeweest"], "Como foram as férias? Foste a algum lado?", "weggeweest.", []),
    DL([("Collega","Lekker weer, hè?","Está ótimo, não está?"),("Rui","")], ["*Ja, heerlijk! Ik ga vanavond zeker op een terrasje zitten.","Nee.|Fecha a conversa.","Het weer is een woord.|Não faz sentido."], "Continuar a conversa.", ["v-he-tag"]),
    FE(["Heb","je","het","druk","gehebt?"], 4, "gehad", "Particípio de hebben: gehad.", ["v-druk-gehad"]),
    CO("dialogue","Bij de koffieautomaat", "Lisa: Hé Rui, hoe was je weekend?\nRui: Gezellig, mijn ouders waren op bezoek uit Portugal. En jij?\nLisa: Rustig. Ik heb vooral in de tuin gewerkt. Komen je ouders vaak?\nRui: Twee keer per jaar. Ze vinden de fietsen hier geweldig!\nLisa: Haha. Kom je straks ook naar de borrel?\nRui: Zeker!",
       [("Quem visitou o Rui?", ["*Os pais","Os amigos","A irmã"]),("O que fez a Lisa?", ["*Trabalhou no jardim","Foi a Portugal","Foi a uma festa"]),("Vai o Rui ao copo?", ["*Sim","Não","Talvez"])],
       "op bezoek = de visita.", ["v-en-jij","v-borrel"]),
    FB("Ben je dit weekend nog ___?", ["weggeweest"], "Ir a algum lado.", [], choices=["weggeweest","weggegaan","weg"], tr="Este fim de semana foste a algum lado?"),
  ], diff=4, mins=6)

W()
