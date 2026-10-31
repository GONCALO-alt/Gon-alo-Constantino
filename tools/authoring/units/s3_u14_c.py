import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u14")
C = "A2"
# Lições extra (10–15): treino de comparativos e superlativos, igual/diferente, comparar cidades e países.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Mais do que, menos do que", "Meer dan, minder dan.",
  ["Comparar quantidades"],
  vocab=[],
  ex=[("Ik werk meer dan veertig uur per week.","Trabalho mais de quarenta horas por semana."),("Hier regent het minder dan in Bergen.","Aqui chove menos do que em Bergen.")],
  review=["v-meer","v-minder","v-dan-comp","v-te-weinig"],
  cefr=C, exs=[
    MA([("meer dan","mais do que"),("minder dan","menos do que"),("te veel","demasiado"),("te weinig","demasiado pouco")], "Quantidades.", ["v-meer","v-minder","v-genoeg2","v-te-weinig"]),
    MC("«Trabalho mais do que tu.»", ["*Ik werk meer dan jij.","Ik werk meer als jij.|Na escrita cuidada: dan.","Ik werk meest jij.|Não."], "dan.", ["v-dan-comp"]),
    TR("pt-nl","Aqui chove menos do que em Portugal?", ["Regent het hier minder dan in Portugal?"], "minder dan.", ["v-minder"]),
    TR("pt-nl","Ela tem mais tempo do que eu.", ["Zij heeft meer tijd dan ik(.)","Ze heeft meer tijd dan ik(.)"], "meer dan.", ["v-meer"]),
    FB("Ik verdien ___ dan mijn collega. (menos)", ["minder"], "Menos.", ["v-minder"], choices=["minder","meer","minst"], tr="Ganho menos do que o meu colega."),
    LI("In de winter fiets ik minder dan in de zomer.", ["In de winter fiets ik minder dan in de zomer(.)"], "No inverno ando menos de bicicleta do que no verão.", "Ouvir.", ["v-minder"]),
    FE(["Hij","is","ouder","als","ik."], 3, "dan", "Comparativo: dan.", ["v-dan-comp"]),
    WO("Mais do que eu.", ["Meer","dan","ik."], "Ordem.", ["v-meer"]),
  ], diff=2, mins=4)

L(11, "Igual ou diferente?", "Hetzelfde of anders?",
  ["Dizer que duas coisas são iguais ou diferentes"],
  vocab=[X("v-hetzelfde","hetzelfde","o mesmo, igual","pronoun"), X("v-anders-dan","anders dan","diferente de")],
  ex=[("Wij hebben hetzelfde telefoonnummer!","Temos o mesmo número de telefone!"),("Het eten hier is anders dan in Portugal.","A comida aqui é diferente da de Portugal.")],
  gram=[G("g-s3u14c-1","Hetzelfde / dezelfde","**hetzelfde** com palavras **het**: *hetzelfde huis*. **dezelfde** com palavras **de** e plural: *dezelfde fiets*, *dezelfde schoenen*. Sozinho: *Dat is hetzelfde* (é igual).")],
  review=["v-net-zo","v-even-adj"],
  cefr=C, exs=[
    MC("«A mesma bicicleta» =", ["*dezelfde fiets","hetzelfde fiets|fiets é de → dezelfde.","de zelfde fiets|Escreve-se junto."], "de-palavra.", ["v-hetzelfde"]),
    MC("«A mesma casa» =", ["*hetzelfde huis","dezelfde huis|huis é het → hetzelfde.","hetzelf huis|Não."], "het-palavra.", ["v-hetzelfde"]),
    TR("pt-nl","É igual.", ["Het is hetzelfde(.)","Dat is hetzelfde(.)"], "hetzelfde.", ["v-hetzelfde"]),
    TR("pt-nl","A comida aqui é diferente.", ["Het eten hier is anders(.)","Het eten is hier anders(.)"], "anders.", ["v-anders-dan"]),
    FB("Het weer hier is ___ dan in Portugal.", ["anders"], "Diferente.", ["v-anders-dan"], choices=["anders","hetzelfde","even"], tr="O tempo aqui é diferente do de Portugal."),
    LI("We dragen dezelfde jas!", ["We dragen dezelfde jas(!)","Wij dragen dezelfde jas(!)"], "Temos o mesmo casaco!", "Ouvir.", ["v-hetzelfde"]),
    MC("«Net zo groot als» significa…", ["*tão grande como","maior do que|Não.","menos grande|Não."], "Igualdade.", ["v-net-zo"]),
    WO("É igual.", ["Het","is","hetzelfde."], "Ordem.", ["v-hetzelfde"]),
  ], diff=2, mins=4)

L(12, "Bom, melhor, o melhor", "Goed, beter, best.",
  ["Usar os comparativos irregulares mais comuns"],
  vocab=[],
  ex=[("Mijn Nederlands wordt beter.","O meu neerlandês está a melhorar."),("Dit is de beste koffie van de stad.","Este é o melhor café da cidade.")],
  gram=[G("g-s3u14c-2","Irregulares","**goed → beter → best** · **veel → meer → meest** · **weinig → minder → minst** · **graag → liever → liefst**. Superlativo antes do nome leva artigo e -e: *de **beste** koffie*; depois de *zijn*: *het **best***.")],
  review=["v-beter-dan","v-best","v-meest","v-erger"],
  cefr=C, exs=[
    MA([("goed","bom"),("beter","melhor"),("best","o melhor"),("erger","pior")], "Irregulares.", ["v-goed","v-beter-dan","v-best","v-erger"]),
    MC("«O melhor restaurante» =", ["*het beste restaurant","het best restaurant|Antes do nome: -e.","het goedste restaurant|Irregular: beste."], "Superlativo.", ["v-best"]),
    TR("pt-nl","O meu neerlandês está melhor.", ["Mijn Nederlands is beter(.)","Mijn Nederlands wordt beter(.)"], "beter.", ["v-beter-dan"]),
    TR("pt-nl","Este é o melhor café.", ["Dit is de beste koffie(.)"], "beste.", ["v-best"]),
    FB("Vandaag is het weer nog ___ dan gisteren. (pior)", ["erger"], "Pior.", ["v-erger"], choices=["erger","slechter","beter"], tr="Hoje o tempo está ainda pior do que ontem."),
    FB("Wie werkt het ___? (mais)", ["meest"], "veel → meest.", ["v-meest"], choices=["meest","meer","veel"], tr="Quem trabalha mais?"),
    LI("Dat was de beste dag van mijn vakantie.", ["Dat was de beste dag van mijn vakantie(.)"], "Esse foi o melhor dia das minhas férias.", "Ouvir.", ["v-best"]),
    FE(["Mijn","uitspraak","is","goeder","dan","vorig","jaar."], 3, "beter", "Irregular: beter.", ["v-beter-dan"]),
  ], diff=2, mins=4)

L(13, "Tão… como", "Even groot als, net zo duur als.",
  ["Comparar com igualdade"],
  vocab=[],
  ex=[("Mijn broer is even groot als ik.","O meu irmão é tão alto como eu."),("De trein is net zo duur als de bus.","O comboio é tão caro como o autocarro.")],
  review=["v-net-zo","v-even-adj","v-groter","v-kleiner"],
  cefr=C, exs=[
    MC("«Tão caro como» =", ["*net zo duur als","net zo duur dan|Igualdade: als.","duurder als|Isso é comparativo."], "als vs dan.", ["v-net-zo"]),
    MC("Qual está correta?", ["*Hij is groter dan ik, maar even oud als ik.","Hij is groter als ik.|Comparativo: dan.","Hij is even oud dan ik.|Igualdade: als."], "dan / als.", ["v-even-adj","v-dan-comp"]),
    TR("pt-nl","O meu irmão é tão alto como eu.", ["Mijn broer is even lang als ik(.)","Mijn broer is net zo lang als ik(.)"], "even … als.", ["v-even-adj"]),
    TR("pt-nl","A casa é tão grande como a nossa.", ["Het huis is net zo groot als het onze(.)","Het huis is even groot als ons huis(.)","Het huis is net zo groot als ons huis(.)"], "net zo … als.", ["v-net-zo"]),
    FB("Amsterdam is niet ___ groot als Lissabon? Eigenlijk wel ongeveer.", ["even"], "Igualdade.", ["v-even-adj"], choices=["even","meer","dan"], tr="Amesterdão não é tão grande como Lisboa? Na verdade é mais ou menos."),
    LI("Het is hier net zo warm als in Portugal!", ["Het is hier net zo warm als in Portugal(!)"], "Aqui está tanto calor como em Portugal!", "Ouvir.", ["v-net-zo"]),
    FE(["Ik","ben","net","zo","moe","dan","jij."], 5, "als", "Igualdade: als.", ["v-net-zo"]),
    WO("Tão alto como eu.", ["Even","lang","als","ik."], "Ordem.", ["v-even-adj"]),
  ], diff=2, mins=4)

L(14, "Comparar cidades", "Rotterdam of Amsterdam?",
  ["Comparar duas cidades"],
  vocab=[],
  ex=[("Rotterdam is moderner dan Amsterdam.","Roterdão é mais moderna do que Amesterdão."),("Amsterdam is de grootste stad van Nederland.","Amesterdão é a maior cidade dos Países Baixos.")],
  review=["v-groter","v-grootst","v-ouder","v-meest"],
  cefr=C, exs=[
    MC("A maior cidade dos Países Baixos é…", ["*Amsterdam","Utrecht|É menor.","Groningen|É menor."], "Facto.", ["v-grootst"]),
    TR("pt-nl","Roterdão é mais moderna do que Amesterdão.", ["Rotterdam is moderner dan Amsterdam(.)"], "moderner dan.", ["v-dan-comp"]),
    TR("pt-nl","Lisboa é mais antiga do que o Porto?", ["Is Lissabon ouder dan Porto?"], "ouder dan.", ["v-ouder"]),
    FB("Den Haag is ___ dan Delft. (maior)", ["groter"], "Comparativo.", ["v-groter"], choices=["groter","grootst","groot"], tr="Haia é maior do que Delft."),
    FB("Welke stad vind jij het ___? (mais bonita)", ["mooist"], "Superlativo depois de «het».", ["v-meest"], choices=["mooist","mooiste","mooier"], tr="Que cidade achas a mais bonita?"),
    LI("Utrecht is kleiner, maar gezelliger.", ["Utrecht is kleiner(,) maar gezelliger(.)"], "Utrecht é mais pequena, mas mais acolhedora.", "Ouvir.", ["v-kleiner"]),
    DL([("Vriend","Wat vind je mooier: Lissabon of Amsterdam?","O que achas mais bonito: Lisboa ou Amesterdão?"),("Jij","","")], ["*Lissabon is zonniger, maar Amsterdam heeft mooiere grachten.","Ik ben mooier.|Não.","Grootst.|Incompleto."], "Comparar.", ["v-groter"]),
    BS("Amesterdão é a cidade mais visitada.", ["Amsterdam","is","de","meest","bezochte","stad."], ["Amsterdam is de meest bezochte stad."], "meest + adjetivo.", ["v-meest"]),
  ], diff=2, mins=4)

L(15, "Prática: Portugal e os Países Baixos", "Twee landen vergelijken.",
  ["Escrever uma comparação entre dois países"],
  vocab=[],
  ex=[("(Exemplo) Portugal is zonniger dan Nederland, maar Nederland is vlakker. Het eten is anders, maar allebei lekker.","Portugal tem mais sol, mas os Países Baixos são mais planos…")],
  review=["v-dan-comp","v-net-zo","v-hetzelfde","v-anders-dan","v-best","v-meer"],
  cefr=C, exs=[
    MC("Os Países Baixos são, comparados com Portugal…", ["*mais planos","mais montanhosos|Não.","mais quentes|Não."], "Geografia.", ["v-dan-comp"]),
    TR("pt-nl","Portugal tem mais sol do que os Países Baixos.", ["Portugal is zonniger dan Nederland(.)","In Portugal schijnt de zon meer dan in Nederland(.)"], "Comparativo.", ["v-dan-comp"]),
    TR("pt-nl","A comida é diferente, mas igualmente boa.", ["Het eten is anders(,) maar net zo lekker(.)","Het eten is anders(,) maar even lekker(.)"], "anders / net zo.", ["v-anders-dan","v-net-zo"]),
    LI("In Nederland fietsen meer mensen dan in Portugal.", ["In Nederland fietsen meer mensen dan in Portugal(.)"], "Nos Países Baixos mais pessoas andam de bicicleta do que em Portugal.", "Ouvir.", ["v-meer"]),
    FE(["Het","leven","hier","is","duurder","als","in","Portugal."], 5, "dan", "Comparativo: dan.", ["v-dan-comp"]),
    BS("O melhor é a bicicleta.", ["Het","beste","is","de","fiets."], ["Het beste is de fiets."], "Superlativo.", ["v-best"]),
    DL([("Collega","Wat vind je het grootste verschil?","Qual achas a maior diferença?"),("Jij","","")], ["*Het weer! Hier regent het veel meer.","Hetzelfde.|Não responde.","Ik ben verschil.|Não."], "Opinião.", ["v-meer"]),
    SW("Compare Portugal e os Países Baixos em 4–5 frases (tempo, comida, transporte, pessoas).", ["Portugal is warmer en zonniger dan Nederland. In Nederland fietsen veel meer mensen. Het eten is anders, maar net zo lekker. De mensen zijn in allebei de landen vriendelijk. Het beste vind ik de Portugese zee."], ["Comparativos","Igualdade","Superlativo"], 30, "Comparar.", ["v-dan-comp","v-net-zo"]),
  ], diff=2, mins=5)

W()
