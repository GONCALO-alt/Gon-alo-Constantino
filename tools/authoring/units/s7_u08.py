import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u08")
C = "B2"

L(1, "Provérbios clássicos (1)", "Beter een vogel in de hand dan tien in de lucht.",
  ["Compreender provérbios clássicos e os seus equivalentes"],
  vocab=[V("v-vogel-in-de-hand","beter één vogel in de hand dan tien in de lucht","mais vale um pássaro na mão do que dois a voar","expression"), V("v-oost-west-ext","wie niet waagt, die niet wint","quem não arrisca não petisca","expression"),
         V("v-stille-wateren","stille wateren hebben diepe gronden","águas paradas são profundas","expression"), V("v-appel-boom","de appel valt niet ver van de boom","filho de peixe sabe nadar","expression")],
  ex=[("Beter één vogel in de hand dan tien in de lucht.","Mais vale um pássaro na mão do que dois a voar."),("Wie niet waagt, die niet wint.","Quem não arrisca não petisca."),("Stille wateren hebben diepe gronden.","Águas paradas são profundas."),("De appel valt niet ver van de boom.","Filho de peixe sabe nadar.")],
  review=["v-spreekwoord","v-figuurlijk"],
  cefr=C, exs=[
    MA([("beter één vogel in de hand…","mais vale um pássaro na mão…"),("wie niet waagt, die niet wint","quem não arrisca não petisca"),("stille wateren hebben diepe gronden","águas paradas são profundas"),("de appel valt niet ver van de boom","filho de peixe sabe nadar")], "Provérbios.", ["v-vogel-in-de-hand","v-oost-west-ext","v-stille-wateren","v-appel-boom"]),
    EX("de appel valt niet ver van de boom","a maçã não cai longe da árvore","O filho de um chef abre um restaurante. Alguém diz este provérbio porque…", ["*o filho é parecido com o pai","as maçãs são caras|Literal.","o restaurante é perto de um pomar|Literal."], "Hereditariedade.", ["v-appel-boom"]),
    EX("stille wateren hebben diepe gronden","águas paradas têm fundos profundos","A colega calada surpreende todos com ideias brilhantes. Diz-se…", ["*Stille wateren hebben diepe gronden.","Wie niet waagt, die niet wint.|Arriscar.","De appel valt niet ver van de boom.|Hereditariedade."], "Pessoas caladas.", ["v-stille-wateren"]),
    EX("wie niet waagt, die niet wint","quem não arrisca, não ganha","Hesita em candidatar-se a uma vaga difícil. Um amigo diz…", ["*Wie niet waagt, die niet wint!","Beter één vogel in de hand…|Conselho oposto.","Stille wateren…|Não se aplica."], "Arriscar.", ["v-oost-west-ext"]),
    TR("nl-pt","Beter één vogel in de hand dan tien in de lucht.", ["Mais vale um pássaro na mão do que dois a voar"], "Equivalente português (dois, não dez).", ["v-vogel-in-de-hand"]),
    MC("Qual provérbio aconselha prudência?", ["*Beter één vogel in de hand dan tien in de lucht.","Wie niet waagt, die niet wint.|Aconselha risco.","Stille wateren…|Sobre pessoas."], "Prudência vs. risco.", ["v-vogel-in-de-hand"]),
    FE(["De","peer","valt","niet","ver","van","de","boom."], 1, "appel", "O provérbio é com «appel».", ["v-appel-boom"]),
    LI("Wie niet waagt, die niet wint.", ["Wie niet waagt(,) wie niet wint"], "Quem não arrisca não petisca.", "Provérbio.", ["v-oost-west-ext"]),
    FB("Beter één vogel in de hand dan tien in de ___.", ["lucht"], "Provérbio.", ["v-vogel-in-de-hand"], choices=["lucht","boom","zee"], tr="Mais vale um pássaro na mão do que dois a voar."),
    SW("Conte uma pequena situação (2–3 frases) em que se aplique «Wie niet waagt, die niet wint».", ["Mijn vriendin twijfelde of ze in Amsterdam een eigen café zou beginnen. Uiteindelijk deed ze het toch, en nu loopt het geweldig. Wie niet waagt, die niet wint!"], ["Situação coerente", "Provérbio no fim", "Passado bem usado"], 30, "Provérbio em contexto.", ["v-oost-west-ext"]),
  ], diff=5, mins=7)

L(2, "Provérbios clássicos (2)", "Als de kat van huis is, dansen de muizen op tafel.",
  ["Compreender mais provérbios frequentes"],
  vocab=[V("v-kat-van-huis","als de kat van huis is, dansen de muizen op tafel","quando o gato sai, os ratos fazem a festa","expression"), V("v-gedane-zaken","gedane zaken nemen geen keer","o que está feito, feito está","expression"),
         V("v-zachte-heelmeesters","zachte heelmeesters maken stinkende wonden","quem tudo tolera mal acaba (brandura em excesso prejudica)","expression"), V("v-boontje-komt","boontje komt om zijn loontje","cá se fazem, cá se pagam","expression")],
  ex=[("Als de kat van huis is, dansen de muizen op tafel.","Quando o gato sai, os ratos fazem a festa."),("Gedane zaken nemen geen keer.","O que está feito, feito está."),("Boontje komt om zijn loontje.","Cá se fazem, cá se pagam."),("Zachte heelmeesters maken stinkende wonden.","A brandura excessiva só piora as coisas.")],
  review=["v-spreekwoord"],
  cefr=C, exs=[
    MA([("als de kat van huis is…","quando o gato sai…"),("gedane zaken nemen geen keer","o que está feito, feito está"),("boontje komt om zijn loontje","cá se fazem, cá se pagam"),("zachte heelmeesters…","brandura excessiva prejudica")], "Provérbios.", ["v-kat-van-huis","v-gedane-zaken","v-boontje-komt","v-zachte-heelmeesters"]),
    EX("als de kat van huis is, dansen de muizen op tafel","quando o gato está fora, os ratos dançam na mesa","O chefe foi de férias e a equipa chega tarde todos os dias.", ["*Als de kat van huis is, dansen de muizen op tafel.","Gedane zaken nemen geen keer.|Não se aplica.","Boontje komt om zijn loontje.|Não."], "Ausência de autoridade.", ["v-kat-van-huis"]),
    EX("boontje komt om zijn loontje","o feijãozinho vem buscar o seu salariozinho","O vizinho que estacionava sempre no lugar dos outros acabou rebocado.", ["*Boontje komt om zijn loontje.","Stille wateren…|Não.","Wie niet waagt…|Não."], "Castigo merecido.", ["v-boontje-komt"]),
    EX("gedane zaken nemen geen keer","coisas feitas não dão a volta","Depois de um erro irreversível, alguém consola: …", ["*Gedane zaken nemen geen keer — laten we vooruitkijken.","Als de kat van huis is…|Não.","Zachte heelmeesters…|Não."], "Aceitar o passado.", ["v-gedane-zaken"]),
    MC("«Zachte heelmeesters maken stinkende wonden» aconselha…", ["*agir com firmeza a tempo","ser sempre gentil|Ao contrário.","ir ao médico|Literal."], "Firmeza.", ["v-zachte-heelmeesters"]),
    TR("nl-pt","Gedane zaken nemen geen keer.", ["O que está feito, feito está","O que lá vai, lá vai"], "Provérbio.", ["v-gedane-zaken"]),
    FE(["Als","de","hond","van","huis","is,","dansen","de","muizen","op","tafel."], 2, "kat", "O provérbio é com «kat».", ["v-kat-van-huis"]),
    LI("Boontje komt om zijn loontje.", ["Boontje komt om zijn loontje"], "Cá se fazem, cá se pagam.", "Provérbio.", ["v-boontje-komt"]),
    FB("Gedane zaken nemen geen ___.", ["keer"], "Provérbio.", ["v-gedane-zaken"], choices=["keer","tijd","weg"], tr="O que está feito, feito está."),
    MC("Qual provérbio tem equivalente quase exato em português?", ["*Als de kat van huis is, dansen de muizen op tafel.","Zachte heelmeesters maken stinkende wonden.|Sem equivalente direto.","Boontje komt om zijn loontje.|Equivalente diferente."], "Comparação.", ["v-kat-van-huis"]),
  ], diff=5, mins=7)

L(3, "Expressões idiomáticas avançadas", "iets in de doofpot stoppen, de bui zien hangen, boter op je hoofd hebben",
  ["Compreender expressões idiomáticas menos frequentes"],
  vocab=[V("v-doofpot","iets in de doofpot stoppen","abafar algo (escândalo)","expression"), V("v-bui-zien-hangen","de bui al zien hangen","ver a tempestade a chegar (prever problemas)","expression"),
         V("v-boter-op-je-hoofd","boter op je hoofd hebben","ter telhados de vidro","expression"), V("v-uit-de-hoogte","uit de hoogte doen","ser arrogante","expression")],
  ex=[("De zaak werd in de doofpot gestopt.","O caso foi abafado."),("Ik zie de bui al hangen.","Já estou a ver no que isto vai dar."),("Hij heeft boter op zijn hoofd.","Ele tem telhados de vidro."),("Ze doet altijd zo uit de hoogte.","Ela é sempre tão arrogante.")],
  review=["v-gezegde","v-figuurlijk"],
  cefr=C, exs=[
    MA([("in de doofpot stoppen","abafar"),("de bui zien hangen","prever problemas"),("boter op je hoofd hebben","ter telhados de vidro"),("uit de hoogte doen","ser arrogante")], "Expressões.", ["v-doofpot","v-bui-zien-hangen","v-boter-op-je-hoofd","v-uit-de-hoogte"]),
    EX("boter op je hoofd hebben","ter manteiga na cabeça","O político critica outros por fuga ao fisco, mas ele próprio também fugiu.", ["*Hij heeft boter op zijn hoofd.","Hij doet uit de hoogte.|Arrogância.","Hij ziet de bui hangen.|Previsão."], "Hipocrisia.", ["v-boter-op-je-hoofd"]),
    EX("iets in de doofpot stoppen","pôr algo no apagador (abafador)","A empresa escondeu os problemas de segurança dos jornalistas.", ["*Ze stopten het in de doofpot.","Ze zagen de bui hangen.|Não.","Ze deden uit de hoogte.|Não."], "Abafar.", ["v-doofpot"]),
    EX("de bui al zien hangen","ver o aguaceiro já pendurado","O chefe anuncia uma «reorganização». Um colega diz: «Ik zie de bui al hangen.» Ele…", ["*prevê problemas (despedimentos)","vê nuvens no céu|Literal.","está contente|Não."], "Prever problemas.", ["v-bui-zien-hangen"]),
    TR("nl-pt","Ze doet altijd zo uit de hoogte.", ["Ela é sempre tão arrogante","Ela é sempre tão altiva"], "uit de hoogte doen.", ["v-uit-de-hoogte"]),
    TR("pt-nl","O caso foi abafado.", ["De zaak werd in de doofpot gestopt","De zaak is in de doofpot gestopt"], "Passiva.", ["v-doofpot"]),
    FE(["Hij","heeft","kaas","op","zijn","hoofd."], 2, "boter", "A expressão é «boter op je hoofd».", ["v-boter-op-je-hoofd"]),
    LI("Ik zie de bui al hangen.", ["Ik zie de bui al hangen"], "Já estou a ver no que isto vai dar.", "Expressão.", ["v-bui-zien-hangen"]),
    FB("De journalist ontdekte wat er in de ___ was gestopt.", ["doofpot"], "Expressão.", ["v-doofpot"], choices=["doofpot","bui","hoogte"], tr="O jornalista descobriu o que tinha sido abafado."),
    MC("Qual expressão descreve hipocrisia?", ["*boter op je hoofd hebben","uit de hoogte doen|Arrogância.","de bui zien hangen|Previsão."], "Sentido.", ["v-boter-op-je-hoofd"]),
  ], diff=5, mins=7)

L(4, "Expressões bíblicas e históricas", "een Pyrrusoverwinning, de gouden eeuw, van Pontius naar Pilatus",
  ["Reconhecer expressões com origem histórica ou cultural"],
  vocab=[V("v-pontius-pilatus","van het kastje naar de muur","de Herodes para Pilatos","expression"), V("v-pyrrusoverwinning","pyrrusoverwinning","vitória de Pirro","noun","de"), V("v-zijn-handen-in-onschuld","zijn handen in onschuld wassen","lavar as mãos (de responsabilidade)","expression")],
  ex=[("Ik word van het kastje naar de muur gestuurd.","Andam a mandar-me de Herodes para Pilatos."),("In de Gouden Eeuw was Amsterdam heel rijk.","No Século de Ouro Amesterdão era muito rica."),("Het was een pyrrusoverwinning.","Foi uma vitória de Pirro."),("De directeur wast zijn handen in onschuld.","O diretor lava as mãos.")],
  review=["v-gouden-eeuw","v-gezegde","v-figuurlijk"],
  cefr=C, exs=[
    MA([("van het kastje naar de muur","de Herodes para Pilatos"),("Gouden Eeuw","Século de Ouro"),("pyrrusoverwinning","vitória de Pirro"),("zijn handen in onschuld wassen","lavar as mãos")], "Origem histórica.", ["v-pontius-pilatus","v-gouden-eeuw","v-pyrrusoverwinning","v-zijn-handen-in-onschuld"]),
    EX("van het kastje naar de muur gestuurd worden","ser mandado do armário para a parede","Liga para o apoio ao cliente e cada pessoa reencaminha-o para outra.", ["*Ik word van het kastje naar de muur gestuurd.","Het is een pyrrusoverwinning.|Não.","Ik was mijn handen in onschuld.|Não."], "Burocracia.", ["v-pontius-pilatus"]),
    EX("een pyrrusoverwinning","uma vitória de Pirro","Ganhou o processo em tribunal, mas os custos foram maiores do que a indemnização.", ["*Het was een pyrrusoverwinning.","Het was de Gouden Eeuw.|Não.","Het was van het kastje naar de muur.|Não."], "Vitória cara.", ["v-pyrrusoverwinning"]),
    MC("A «Gouden Eeuw» neerlandesa foi…", ["*o século XVII, época de comércio, arte (Rembrandt) e riqueza","o século XXI|Não.","a época romana|Não."], "História.", ["v-gouden-eeuw"]),
    MC("Nota: a expressão «Gouden Eeuw» é hoje discutida porque…", ["*essa riqueza também esteve ligada ao colonialismo e à escravatura","não houve arte|Houve.","foi inventada recentemente|Não."], "Contexto crítico.", ["v-gouden-eeuw"]),
    TR("pt-nl","O diretor lava as mãos.", ["De directeur wast zijn handen in onschuld"], "Expressão.", ["v-zijn-handen-in-onschuld"]),
    TR("nl-pt","Het was een pyrrusoverwinning.", ["Foi uma vitória de Pirro"], "Igual em português.", ["v-pyrrusoverwinning"]),
    FE(["Ik","word","van","de","kast","naar","de","muur","gestuurd."], 4, "het kastje", "Expressão fixa: van het kastje naar de muur.", ["v-pontius-pilatus"]),
    LI("Ik word al weken van het kastje naar de muur gestuurd.", ["Ik word al weken van het kastje naar de muur gestuurd"], "Há semanas que me mandam de Herodes para Pilatos.", "Expressão.", ["v-pontius-pilatus"]),
    AR("Gouden Eeuw","o Século de Ouro","de", "De eeuw.", ["v-gouden-eeuw"]),
  ], diff=5, mins=7)

L(5, "Usar expressões com mestria", "Wanneer werkt een uitdrukking, wanneer niet?",
  ["Integrar expressões avançadas na escrita e na fala com adequação"],
  vocab=[V("v-cliche-vermijden","clichés vermijden","evitar clichés","expression"), V("v-gepast","gepast","adequado","adjective"),
         V("v-ongepast","ongepast","inadequado","adjective")],
  ex=[("Probeer clichés te vermijden.","Tenta evitar clichés."),("Die uitdrukking is hier niet gepast.","Essa expressão não é adequada aqui."),("Een grap op een begrafenis is ongepast.","Uma piada num funeral é inadequada."),("Je Nederlands klinkt heel natuurlijk.","O teu neerlandês soa muito natural.")],
  review=["v-natuurlijk-klinken","v-boter-op-je-hoofd","v-knoop-doorhakken","v-water-bij-de-wijn","v-gezegde"],
  cefr=C, exs=[
    MA([("clichés vermijden","evitar clichés"),("gepast","adequado"),("ongepast","inadequado"),("natuurlijk klinken","soar natural")], "Adequação.", ["v-cliche-vermijden","v-gepast","v-ongepast","v-natuurlijk-klinken"]),
    MC("Num relatório técnico para a direção, é adequado escrever…", ["*Na lang overleg hebben we de knoop doorgehakt.","Boontje komt om zijn loontje, haha.|Inadequado.","Als de kat van huis is…|Inadequado."], "Expressão neutra-profissional.", ["v-gepast"]),
    MC("Num e-mail de condolências, uma expressão humorística é…", ["*ongepast","gepast|Não.","verplicht|Não."], "Contexto.", ["v-ongepast"]),
    MC("Usar cinco provérbios num só parágrafo…", ["*soa forçado — use poucos, bem escolhidos","soa muito natural|Não.","é obrigatório no nível B2|Não."], "Moderação.", ["v-cliche-vermijden"]),
    TR("pt-nl","Essa expressão não é adequada aqui.", ["Die uitdrukking is hier niet gepast","Die uitdrukking is hier ongepast"], "gepast.", ["v-gepast"]),
    TR("nl-pt","Je Nederlands klinkt heel natuurlijk.", ["O teu neerlandês soa muito natural"], "klinken.", ["v-natuurlijk-klinken"]),
    FE(["Dat","was","een","ongepast","opmerking."], 3, "ongepaste", "de opmerking → een ongepaste.", ["v-ongepast"]),
    LI("Wie in een glazen huis woont, moet niet met stenen gooien.", ["Wie in een glazen huis woont(,) moet niet met stenen gooien"], "Quem tem telhados de vidro não atira pedras ao vizinho.", "Provérbio.", ["v-boter-op-je-hoofd"]),
    FB("Een grap was op dat moment echt ___.", ["ongepast"], "Inadequado.", ["v-ongepast"], choices=["ongepast","gepast","natuurlijk"], tr="Uma piada naquele momento era mesmo inadequada."),
    SW("Escreva um parágrafo (4–5 frases) sobre uma situação no trabalho, usando DUAS expressões desta unidade ou da Secção 6 de forma natural.", ["Vorige maand werd ons project op de lange baan geschoven. Ik zag de bui al hangen: er was te weinig budget. Toch hebben we na een lang gesprek de knoop doorgehakt en gaan we in een kleinere versie verder. Gedane zaken nemen geen keer, dus we kijken nu vooruit."], ["Duas expressões adequadas", "Contexto profissional coerente", "Sem excesso de expressões"], 50, "Expressões com mestria.", ["v-natuurlijk-klinken","v-gepast"]),
  ], diff=5, mins=8)

W()
