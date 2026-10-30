import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u02")
C = "B1-B2"

L(1, "Graus de certeza na opinião", "Ik ben ervan overtuigd dat… Ik heb het idee dat…",
  ["Exprimir opiniões com diferentes graus de certeza"],
  vocab=[V("v-ervan-overtuigd","ervan overtuigd zijn","estar convencido de","expression"), V("v-het-idee-hebben","het idee hebben dat","ter a impressão de que","expression"),
         V("v-twijfel","twijfel","dúvida","noun","de"), V("v-ongetwijfeld","ongetwijfeld","sem dúvida","adverb")],
  ex=[("Ik ben ervan overtuigd dat dit werkt.","Estou convencido de que isto funciona."),("Ik heb het idee dat hij niet luistert.","Tenho a impressão de que ele não ouve."),("Daar bestaat geen twijfel over.","Não há dúvida sobre isso."),("Dat is ongetwijfeld waar.","Isso é sem dúvida verdade.")],
  gram=[G("g-zekerheid-mening","Escala de certeza","Muito certo: **Ik ben ervan overtuigd dat… / Ongetwijfeld…** — Moderado: **Ik denk dat… / Volgens mij…** — Hesitante: **Ik heb het idee dat… / Het lijkt me dat…** — Dúvida: **Ik twijfel of…** Todas com o verbo no fim na subordinada.",
    [("Het lijkt me dat we te weinig tijd hebben.","Parece-me que temos pouco tempo.")])],
  review=["v-ik-denk-dat","v-volgens-mij","v-twijfelen","v-zeker"],
  cefr=C, exs=[
    MA([("ervan overtuigd zijn","estar convencido"),("het idee hebben dat","ter a impressão"),("twijfel","dúvida"),("ongetwijfeld","sem dúvida")], "Certeza.", ["v-ervan-overtuigd","v-het-idee-hebben","v-twijfel","v-ongetwijfeld"]),
    MC("Ordene do mais certo ao menos certo:", ["*Ik ben ervan overtuigd → Ik denk → Ik heb het idee → Ik twijfel","Ik twijfel → Ik ben ervan overtuigd|Trocado.","Ik heb het idee → Ongetwijfeld → Ik denk|Trocado."], "Escala.", ["v-ervan-overtuigd","v-twijfel"]),
    WO("Estou convencido de que isto funciona.", ["Ik","ben","ervan","overtuigd","dat","dit","werkt"], "ervan + dat.", ["v-ervan-overtuigd"]),
    TR("pt-nl","Tenho a impressão de que ele não ouve.", ["Ik heb het idee dat hij niet luistert"], "het idee hebben dat.", ["v-het-idee-hebben"]),
    TR("nl-pt","Daar bestaat geen twijfel over.", ["Não há dúvida sobre isso","Disso não há dúvida"], "twijfel.", ["v-twijfel"]),
    TR("pt-nl","Parece-me que temos pouco tempo.", ["Het lijkt me dat we te weinig tijd hebben","Het lijkt mij dat we te weinig tijd hebben","Het lijkt me dat we weinig tijd hebben"], "Het lijkt me dat.", ["v-het-idee-hebben"]),
    FE(["Ik","ben","overtuigd","dat","het","werkt."], 2, "ervan overtuigd", "A estrutura é «ervan overtuigd zijn dat».", ["v-ervan-overtuigd"]),
    AR("twijfel","a dúvida","de", "De twijfel.", ["v-twijfel"]),
    LI("Dat is ongetwijfeld de beste oplossing.", ["Dat is ongetwijfeld de beste oplossing"], "Essa é sem dúvida a melhor solução.", "ongetwijfeld.", ["v-ongetwijfeld"]),
    SW("Dê a sua opinião sobre os carros elétricos com dois graus de certeza diferentes.", ["Ik ben ervan overtuigd dat elektrische auto's beter zijn voor de lucht in de stad. Ik heb wel het idee dat ze nog te duur zijn voor veel mensen."], ["Uma frase muito certa", "Uma frase hesitante", "Verbo no fim nas subordinadas"], 25, "Nuance.", ["v-ervan-overtuigd","v-het-idee-hebben"]),
  ], diff=5, mins=7)

L(2, "Usar dados e fontes", "Volgens het CBS… Uit cijfers blijkt… Een op de vijf…",
  ["Referir dados e fontes numa argumentação"],
  vocab=[V("v-cijfers","cijfers","números|dados","noun","de"), V("v-procent","procent","por cento","noun","het"),
         V("v-een-op-de","een op de (vijf)","um em cada (cinco)","expression"), V("v-blijken","blijken","revelar-se|verificar-se","verb",note="Uit … blijkt dat…")],
  ex=[("Volgens het CBS werkt 40 procent parttime.","Segundo o CBS, 40% trabalha a tempo parcial."),("Uit de cijfers blijkt dat het aantal stijgt.","Os números mostram que o número está a subir."),("Een op de vijf jongeren voelt zich eenzaam.","Um em cada cinco jovens sente-se só."),("Onderzoekers van de universiteit concluderen dat…","Investigadores da universidade concluem que…")],
  gram=[G("g-cijfers","Falar de números","**Uit** + fonte + **blijkt dat** + verbo no fim. **een op de vijf** (+ verbo no singular): *Een op de vijf Nederlanders **heeft**…* Percentagens: **40 procent** (sem «de»). O **CBS** é o instituto de estatística neerlandês.",
    [("Bijna de helft van de mensen fietst dagelijks.","Quase metade das pessoas anda de bicicleta diariamente.")])],
  review=["v-onderzoeker","v-onderzoek","v-volgens","v-gemiddeld"],
  cefr=C, exs=[
    MA([("cijfers","dados"),("procent","por cento"),("een op de vijf","um em cada cinco"),("blijken","verificar-se"),("onderzoeker","investigador")], "Dados.", ["v-cijfers","v-procent","v-een-op-de","v-blijken","v-onderzoeker"]),
    TR("pt-nl","Segundo o CBS, 40% trabalha a tempo parcial.", ["Volgens het CBS werkt 40 procent parttime","Volgens het CBS werkt veertig procent parttime"], "volgens + inversão.", ["v-procent"]),
    TR("pt-nl","Um em cada cinco jovens sente-se só.", ["Een op de vijf jongeren voelt zich eenzaam","Eén op de vijf jongeren voelt zich eenzaam"], "Singular.", ["v-een-op-de"]),
    TR("nl-pt","Uit de cijfers blijkt dat het aantal stijgt.", ["Os números mostram que o número está a subir","Os dados mostram que o número aumenta"], "blijken.", ["v-blijken","v-cijfers"]),
    FE(["Een","op","de","vijf","Nederlanders","hebben","een","huisdier."], 5, "heeft", "«Een op de vijf» leva o verbo no singular.", ["v-een-op-de"]),
    FE(["Uit","het","onderzoek","blijkt","dat","mensen","zijn","gelukkiger."], 6, "gelukkiger zijn", "dat → verbo no fim.", ["v-blijken"]),
    MC("O CBS é…", ["*o Centraal Bureau voor de Statistiek (estatística)","um banco|Não.","um partido|Não."], "Fonte oficial.", ["v-cijfers"]),
    LI("Bijna de helft van de mensen fietst dagelijks.", ["Bijna de helft van de mensen fietst dagelijks"], "Quase metade das pessoas anda de bicicleta diariamente.", "de helft.", ["v-helft"]),
    AR("procent","o por cento","het", "Het procent.", ["v-procent"]),
    SW("Use dados (inventados mas plausíveis) para apoiar a tese «Nederlanders sporten veel».", ["Volgens het CBS sport meer dan de helft van de Nederlanders minstens één keer per week. Bovendien blijkt uit onderzoek dat een op de drie mensen lid is van een sportvereniging."], ["**Volgens** + fonte com inversão", "**Uit … blijkt dat**", "Número/percentagem bem formulado"], 25, "Fundamentar com dados.", ["v-blijken","v-cijfers"]),
  ], diff=5, mins=7)

L(3, "Exemplos e comparações", "Neem nou… Vergelijk het met… In tegenstelling tot…",
  ["Ilustrar opiniões com exemplos e comparações"],
  vocab=[V("v-neem-nou","neem nou…","olha por exemplo…","expression"), V("v-vergelijken","vergelijken (met)","comparar (com)","verb"),
         V("v-net-als","net als","tal como","expression"), V("v-ter-vergelijking","ter vergelijking","a título de comparação","expression")],
  ex=[("Neem nou Kopenhagen: daar fietst iedereen.","Olha por exemplo Copenhaga: lá toda a gente anda de bicicleta."),("Vergelijk het met de situatie in Portugal.","Compara com a situação em Portugal."),("Net als in Duitsland zijn de huren hoog.","Tal como na Alemanha, as rendas são altas."),("Ter vergelijking: in 2010 was het de helft.","A título de comparação: em 2010 era metade.")],
  review=["v-bijvoorbeeld","v-in-tegenstelling-tot","v-net-zo"],
  cefr=C, exs=[
    MA([("neem nou…","olha por exemplo…"),("vergelijken met","comparar com"),("net als","tal como"),("ter vergelijking","a título de comparação")], "Exemplos.", ["v-neem-nou","v-vergelijken","v-net-als","v-ter-vergelijking"]),
    TR("pt-nl","Compara com a situação em Portugal.", ["Vergelijk het met de situatie in Portugal"], "vergelijken met.", ["v-vergelijken"]),
    TR("pt-nl","Tal como na Alemanha, as rendas são altas.", ["Net als in Duitsland zijn de huren hoog"], "net als + inversão.", ["v-net-als"]),
    TR("nl-pt","Ter vergelijking: in 2010 was het de helft.", ["A título de comparação: em 2010 era metade","Para comparar: em 2010 era metade"], "ter vergelijking.", ["v-ter-vergelijking"]),
    FE(["Net","als","in","Duitsland","de","huren","zijn","hoog."], 4, "zijn de huren", "Inversão: Net als in Duitsland zijn de huren hoog.", ["v-net-als"]),
    MC("«Neem nou…» introduz…", ["*um exemplo","uma conclusão|Não.","uma pergunta|Não."], "Exemplo coloquial.", ["v-neem-nou"]),
    FB("Je kunt Amsterdam niet ___ met een klein dorp.", ["vergelijken"], "Comparar.", ["v-vergelijken"], choices=["vergelijken","vergeleken","vergelijkt"], tr="Não se pode comparar Amesterdão com uma aldeia."),
    LI("In tegenstelling tot Portugal regent het hier vaak.", ["In tegenstelling tot Portugal regent het hier vaak"], "Ao contrário de Portugal, aqui chove muitas vezes.", "Contraste.", ["v-in-tegenstelling-tot"]),
    WO("Olha por exemplo Copenhaga: lá toda a gente anda de bicicleta.", ["Neem","nou","Kopenhagen:","daar","fietst","iedereen"], "Inversão depois de daar.", ["v-neem-nou"]),
    SW("Compare a habitação em Portugal e nos Países Baixos (3 frases) usando «net als» ou «in tegenstelling tot» e um exemplo.", ["Net als in Nederland zijn de huizen in Lissabon erg duur geworden. In tegenstelling tot Nederland zijn er in Portugal weinig sociale huurwoningen. Neem nou mijn zus: zij betaalt de helft van haar salaris aan huur."], ["Comparação com **net als / in tegenstelling tot**", "Inversão correta", "Exemplo concreto"], 30, "Comparar.", ["v-net-als","v-neem-nou"]),
  ], diff=5, mins=7)

L(4, "Opinião sobre temas sociais", "wonen, werk, integratie",
  ["Exprimir opiniões fundamentadas sobre temas sociais atuais"],
  vocab=[V("v-woningnood","woningnood","crise da habitação","noun","de"), V("v-betaalbaar","betaalbaar","acessível (preço)","adjective"),
         V("v-integratie","integratie","integração","noun","de"), V("v-ongelijkheid","ongelijkheid","desigualdade","noun","de")],
  ex=[("Er is een grote woningnood.","Há uma grande crise da habitação."),("Er zijn te weinig betaalbare woningen.","Há poucas casas a preços acessíveis."),("Taal is de sleutel tot integratie.","A língua é a chave da integração."),("De ongelijkheid groeit.","A desigualdade está a aumentar.")],
  review=["v-huur","v-woning","v-volgens-mij","v-maatregel"],
  cefr=C, exs=[
    MA([("woningnood","crise da habitação"),("betaalbaar","acessível"),("integratie","integração"),("ongelijkheid","desigualdade")], "Sociedade.", ["v-woningnood","v-betaalbaar","v-integratie","v-ongelijkheid"]),
    TR("pt-nl","Há poucas casas a preços acessíveis.", ["Er zijn te weinig betaalbare woningen","Er zijn weinig betaalbare woningen","Er zijn te weinig betaalbare huizen"], "betaalbare.", ["v-betaalbaar"]),
    TR("nl-pt","Taal is de sleutel tot integratie.", ["A língua é a chave da integração","A língua é a chave para a integração"], "sleutel tot.", ["v-integratie"]),
    FE(["Er","zijn","te","weinig","betaalbaar","woningen."], 4, "betaalbare", "Antes de plural: betaalbare.", ["v-betaalbaar"]),
    AR("woningnood","a crise da habitação","de", "De nood.", ["v-woningnood"]),
    CO("text","De woningnood", "In Nederland is er een tekort van ongeveer 400.000 woningen. Vooral jongeren en starters vinden moeilijk een betaalbaar huis. Sommigen blijven daardoor tot hun dertigste bij hun ouders wonen. De regering wil meer bouwen, maar dat gaat langzaam: er is weinig ruimte, bouwen is duur en vergunningen duren lang. Critici zeggen dat er ook meer sociale huurwoningen moeten komen.",
       [("Quem tem mais dificuldade?", ["*Jovens e quem compra a primeira casa","Reformados","Empresas"]),("Porque é a construção lenta?", ["*Pouco espaço, custos altos e licenças demoradas","Falta de vontade","Não há procura"]),("O que pedem os críticos?", ["*Mais habitação social de arrendamento","Menos construção","Rendas mais altas"])],
       "starter = quem compra a primeira casa; vergunning = licença.", ["v-woningnood","v-betaalbaar"]),
    LI("De ongelijkheid tussen arm en rijk groeit.", ["De ongelijkheid tussen arm en rijk groeit"], "A desigualdade entre ricos e pobres está a aumentar.", "ongelijkheid.", ["v-ongelijkheid"]),
    MC("«Starter» no mercado imobiliário é…", ["*quem compra/arrenda a primeira casa","um empresário|Não aqui.","um corredor|Não."], "Starter.", ["v-woningnood"]),
    FB("Een ___ huis vinden in Amsterdam is bijna onmogelijk.", ["betaalbaar"], "het huis → een betaalbaar.", ["v-betaalbaar"], choices=["betaalbaar","betaalbare","betalen"], tr="Encontrar uma casa acessível em Amesterdão é quase impossível."),
    SW("Dê uma opinião fundamentada (4 frases) sobre a crise da habitação: problema, causa, solução e conclusão.", ["Volgens mij is de woningnood het grootste probleem van dit moment. Er worden te weinig betaalbare woningen gebouwd, omdat bouwen duur is. Ik vind dat de overheid meer sociale huurwoningen moet bouwen. Kortom: zonder actie blijft het probleem groeien."], ["Problema", "Causa com **omdat**", "Solução", "Conclusão"], 40, "Opinião social.", ["v-woningnood","v-betaalbaar"]),
  ], diff=5, mins=8)

L(5, "Mudar de opinião e manter a posição", "Je hebt me overtuigd. Ik blijf erbij dat…",
  ["Mostrar que se mudou de ideias ou manter uma posição com firmeza"],
  vocab=[V("v-erbij-blijven","erbij blijven dat","manter que","expression"),
         V("v-nuanceren","nuanceren","matizar","verb"), V("v-heroverwegen","heroverwegen","reconsiderar","verb")],
  ex=[("Je hebt me overtuigd, ik ben van mening veranderd.","Convenceste-me, mudei de opinião."),("Ik blijf erbij dat het een slecht idee is.","Mantenho que é uma má ideia."),("Ik wil mijn standpunt nuanceren.","Quero matizar a minha posição."),("Misschien moeten we het plan heroverwegen.","Talvez devamos reconsiderar o plano.")],
  review=["v-van-mening-veranderen","v-overtuigen","v-standpunt","v-toegeven"],
  cefr=C, exs=[
    MA([("van mening veranderen","mudar de opinião"),("erbij blijven dat","manter que"),("nuanceren","matizar"),("heroverwegen","reconsiderar")], "Posições.", ["v-van-mening-veranderen","v-erbij-blijven","v-nuanceren","v-heroverwegen"]),
    TR("pt-nl","Mudei de opinião.", ["Ik ben van mening veranderd"], "zijn + veranderd.", ["v-van-mening-veranderen"]),
    TR("pt-nl","Mantenho que é uma má ideia.", ["Ik blijf erbij dat het een slecht idee is"], "erbij blijven dat.", ["v-erbij-blijven"]),
    TR("nl-pt","Misschien moeten we het plan heroverwegen.", ["Talvez devamos reconsiderar o plano","Talvez tenhamos de reconsiderar o plano"], "heroverwegen.", ["v-heroverwegen"]),
    FE(["Ik","heb","van","mening","veranderd."], 1, "ben", "veranderen (mudar de estado) → zijn.", ["v-van-mening-veranderen"]),
    MC("«Ik wil mijn standpunt nuanceren» significa que…", ["*quer tornar a posição menos absoluta","muda totalmente de ideia|Não.","se recusa a falar|Não."], "Matizar.", ["v-nuanceren"]),
    LI("Je argumenten hebben me aan het denken gezet.", ["Je argumenten hebben me aan het denken gezet","Jouw argumenten hebben me aan het denken gezet"], "Os teus argumentos fizeram-me pensar.", "aan het denken zetten.", ["v-overtuigen"]),
    WO("Convenceste-me.", ["Je","hebt","me","overtuigd"], "overtuigd.", ["v-overtuigen"]),
    DL([("Collega","Begrijp je nu waarom we die nieuwe software nodig hebben?","Já percebes porque precisamos do software novo?"),("Rita","")], ["*Ja, je hebt me overtuigd. Ik was eerst tegen, maar ik ben van mening veranderd.","Ik ben van mening.|Incompleto.","Nee, ik heroverweeg.|Contraditório."], "Mudar de opinião.", ["v-van-mening-veranderen"]),
    FB("Na het gesprek wil ik mijn besluit ___.", ["heroverwegen"], "Reconsiderar.", ["v-heroverwegen"], choices=["heroverwegen","nuanceren","overtuigen"], tr="Depois da conversa quero reconsiderar a minha decisão."),
  ], diff=5, mins=7)

W()
