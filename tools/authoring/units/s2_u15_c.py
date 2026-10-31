import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u15")
C = "A1-A2"
# Lições extra (10–15): verbos separáveis em contexto, diálogos do dia a dia e revisão da Secção 2.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Separáveis: sair e voltar", "Weggaan en terugkomen.",
  ["Dizer quando sais e quando voltas"],
  vocab=[X("v-weggaan","weggaan","ir-se embora, sair","verb")],
  ex=[("Ik ga om acht uur weg.","Saio às oito."),("Hoe laat kom je terug?","A que horas voltas?")],
  review=["v-terugkomen","v-aankomen","v-uitgaan"],
  cefr=C, exs=[
    MA([("weggaan","sair, ir-se"),("terugkomen","voltar"),("aankomen","chegar"),("uitgaan","sair (à noite)")], "Separáveis.", ["v-weggaan","v-terugkomen","v-aankomen","v-uitgaan"]),
    MC("Qual é a ordem correta?", ["*Ik ga om acht uur weg.","Ik weggaan om acht uur.|Separável: «weg» no fim."], "Separável.", ["v-weggaan"]),
    MC("Qual é a ordem correta?", ["*Hoe laat kom je terug?","Hoe laat terugkom je?|«terug» vai para o fim."], "Separável.", ["v-terugkomen"]),
    TR("pt-nl","Saio às oito.", ["Ik ga om acht uur weg(.)","Om acht uur ga ik weg(.)"], "weggaan.", ["v-weggaan"]),
    TR("pt-nl","O comboio chega às dez.", ["De trein komt om tien uur aan(.)","Om tien uur komt de trein aan(.)"], "aankomen.", ["v-aankomen"]),
    FB("Ik kom morgen ___.", ["terug"], "Partícula.", ["v-terugkomen"], choices=["terug","weg","aan"], tr="Volto amanhã."),
    LI("We gaan zaterdag uit.", ["We gaan zaterdag uit(.)","Wij gaan zaterdag uit(.)"], "Saímos no sábado.", "Ouvir.", ["v-uitgaan"]),
    WO("A que horas sais?", ["Hoe","laat","ga","je","weg?"], "Separável.", ["v-weggaan"]),
  ], diff=2, mins=4)

L(11, "Separáveis com «willen» e «moeten»", "Ik wil je opbellen.",
  ["Usar separáveis depois de um verbo modal"],
  vocab=[],
  ex=[("Ik wil je morgen opbellen.","Quero ligar-te amanhã."),("Je moet je jas meenemen.","Tens de levar o casaco.")],
  gram=[G("g-s2u15c-1","Modal + separável","Com um verbo modal (*willen, kunnen, moeten*), o verbo separável fica **inteiro no fim**, no infinitivo: *Ik **bel** je **op*** → *Ik wil je **opbellen***.")],
  review=["v-opbellen","v-meenemen","v-willen","v-kunnen"],
  cefr=C, exs=[
    MC("Qual é a ordem correta?", ["*Ik wil je morgen opbellen.","Ik wil je morgen op bellen.|Junto no infinitivo.","Ik wil je op morgen bellen.|Não."], "Modal + infinitivo.", ["v-opbellen"]),
    MC("Qual é a ordem correta?", ["*Kun je brood meenemen?","Kun je brood mee nemen?|Junto.","Kun je mee brood nemen?|Não."], "Modal + infinitivo.", ["v-meenemen"]),
    TR("pt-nl","Quero ligar-te amanhã.", ["Ik wil je morgen opbellen(.)","Morgen wil ik je opbellen(.)"], "Infinitivo no fim.", ["v-opbellen"]),
    TR("pt-nl","Podes trazer pão?", ["Kun je brood meenemen?","Kan je brood meenemen?"], "meenemen.", ["v-meenemen"]),
    FB("Ik moet de kamer ___. (arrumar)", ["opruimen"], "Infinitivo junto.", ["v-opruimen"], choices=["opruimen","ruim op","op ruimen"], tr="Tenho de arrumar o quarto."),
    FB("Ik ___ de kamer op. (arrumo)", ["ruim"], "Presente: separa.", ["v-opruimen"], choices=["ruim","opruim","opruimen"], tr="Arrumo o quarto."),
    LI("Wil je de deur even dichtdoen?", ["Wil je de deur even dichtdoen(?)"], "Podes fechar a porta?", "Ouvir.", ["v-even"]),
    WO("Tenho de levar o casaco.", ["Ik","moet","mijn","jas","meenemen."], "Infinitivo no fim.", ["v-meenemen"]),
  ], diff=3, mins=4)

L(12, "De novo na padaria", "Een volkoren brood, gesneden.",
  ["Comprar pão com todos os pormenores"],
  vocab=[],
  ex=[("Een half volkoren, gesneden graag.","Meio pão integral, fatiado, por favor."),("Anders nog iets? — Nee, dat was het.","Mais alguma coisa? — Não, é tudo.")],
  review=["v-bakker","v-volkoren","v-gesneden","v-verder-nog"],
  cefr=C, exs=[
    MA([("volkoren","integral"),("gesneden","fatiado"),("verder nog iets?","mais alguma coisa?"),("bakker","padeiro")], "Padaria.", ["v-volkoren","v-gesneden","v-verder-nog","v-bakker"]),
    MC("«Dat was het» na loja significa…", ["*É tudo, obrigado.","Foi ontem.|Não.","Está esgotado.|Não."], "Expressão.", ["v-verder-nog"]),
    TR("pt-nl","Um pão integral, fatiado, por favor.", ["Een volkoren brood(,) gesneden(,) alstublieft(.)","Een volkorenbrood(,) gesneden graag(.)"], "volkoren + gesneden.", ["v-volkoren","v-gesneden"]),
    DL([("Bakker","Wie mag ik helpen?","Quem é o próximo?"),("Jij","","")], ["*Ik! Een wit brood, alstublieft.","Ik ben bakker.|Não.","Dat was het.|Ainda não pediste."], "Pedir.", ["v-bakker"]),
    DL([("Bakker","Gesneden?","Fatiado?"),("Jij","","")], ["*Ja, graag.","Nee, volkoren.|Não responde.","Tot morgen.|Não."], "Responder.", ["v-gesneden"]),
    DL([("Bakker","Verder nog iets?","Mais alguma coisa?"),("Jij","","")], ["*Nee, dank u, dat was het.","Ja, dat was het.|Contraditório.","Gesneden.|Não."], "Fechar.", ["v-verder-nog"]),
    LI("Twee krentenbollen en een half wit, alstublieft.", ["Twee krentenbollen en een half wit(,) alstublieft(.)"], "Dois pãezinhos de passas e meio pão branco, por favor.", "Ouvir.", ["v-bakker"]),
    MC("«Een half wit» na padaria é…", ["*meio pão branco","meio litro de leite|Não.","meia hora|Não."], "Contexto.", ["v-bakker"]),
  ], diff=2, mins=4)

L(13, "Com o vizinho", "Mag ik je boor lenen?",
  ["Pedir emprestado e receber uma encomenda de um vizinho"],
  vocab=[],
  ex=[("Mag ik je ladder even lenen?","Emprestas-me o escadote?"),("Ik heb een pakketje voor je aangenomen.","Recebi uma encomenda para ti.")],
  review=["v-lenen","v-pakketje","v-aannemen","v-buurman","v-even"],
  cefr=C, exs=[
    MA([("lenen","pedir/emprestar"),("pakketje","encomenda pequena"),("aannemen","receber (encomenda)"),("even","só um bocadinho")], "Vizinhos.", ["v-lenen","v-pakketje","v-aannemen","v-even"]),
    MC("O vizinho recebeu a tua encomenda. Ele diz:", ["*Ik heb een pakketje voor je aangenomen.","Ik heb je pakketje geleend.|Isso é «emprestei».","Ik ben pakketje.|Não."], "aannemen.", ["v-aannemen"]),
    TR("pt-nl","Emprestas-me a tua bicicleta?", ["Mag ik je fiets lenen?","Mag ik jouw fiets lenen?","Mag ik je fiets even lenen?"], "lenen.", ["v-lenen"]),
    TR("pt-nl","Tenho uma encomenda para ti.", ["Ik heb een pakketje voor je(.)","Ik heb een pakketje voor jou(.)"], "pakketje.", ["v-pakketje"]),
    DL([("Buurman","Hoi! Er is een pakketje voor je bij mij.","Olá! Há uma encomenda tua cá em casa."),("Jij","","")], ["*Wat aardig! Ik kom het zo halen.","Ik ben pakketje.|Não.","Nee, geen zin.|Rude."], "Agradecer.", ["v-pakketje"]),
    FB("Mag ik je pen ___ lenen?", ["even"], "Só um momento.", ["v-even"], choices=["even","heel","graag"], tr="Emprestas-me a caneta um momento?"),
    LI("Natuurlijk, je mag hem lenen.", ["Natuurlijk(,) je mag hem lenen(.)"], "Claro, podes levá-lo emprestado.", "Ouvir.", ["v-lenen"]),
    WO("Emprestas-me a caneta?", ["Mag","ik","je","pen","lenen?"], "Ordem.", ["v-lenen"]),
  ], diff=2, mins=4)

L(14, "Arrumar a casa", "Opruimen en schoonmaken.",
  ["Combinar as tarefas de limpeza"],
  vocab=[],
  ex=[("Ik ruim de woonkamer op en jij maakt de badkamer schoon.","Eu arrumo a sala e tu limpas a casa de banho."),("Na het eten was ik af.","Depois de comer lavo a loiça.")],
  review=["v-opruimen","v-schoonmaken","v-afwassen","v-aandoen","v-uitdoen"],
  cefr=C, exs=[
    MA([("opruimen","arrumar"),("schoonmaken","limpar"),("afwassen","lavar a loiça"),("aandoen","acender, vestir")], "Casa.", ["v-opruimen","v-schoonmaken","v-afwassen","v-aandoen"]),
    MC("Qual é a ordem correta?", ["*Ik maak de badkamer schoon.","Ik schoonmaak de badkamer.|Separável."], "Separável.", ["v-schoonmaken"]),
    TR("pt-nl","Arrumo a sala.", ["Ik ruim de woonkamer op(.)","Ik ruim de kamer op(.)"], "opruimen.", ["v-opruimen"]),
    TR("pt-nl","Acende a luz, por favor.", ["Doe het licht aan(,) alsjeblieft(.)","Doe het licht aan(,) alstublieft(.)"], "aandoen.", ["v-aandoen","v-licht"]),
    FB("Doe het licht ___, ik ga slapen.", ["uit"], "Apagar.", ["v-uitdoen"], choices=["uit","aan","op"], tr="Apaga a luz, vou dormir."),
    FB("Wie ___ vandaag af?", ["wast"], "afwassen → wast … af.", ["v-afwassen"], choices=["wast","afwast","wassen"], tr="Quem lava a loiça hoje?"),
    LI("Op zaterdag maken we het hele huis schoon.", ["Op zaterdag maken we het hele huis schoon(.)"], "Ao sábado limpamos a casa toda.", "Ouvir.", ["v-schoonmaken"]),
    DL([("Huisgenoot","Zullen we de taken verdelen?","Dividimos as tarefas?"),("Jij","","")], ["*Goed idee: ik ruim op en jij maakt schoon.","Ik ben opruimen.|Não.","Doe het licht.|Incompleto."], "Dividir.", ["v-opruimen"]),
  ], diff=2, mins=4)

L(15, "Revisão da Secção 2: um sábado inteiro", "Een hele zaterdag.",
  ["Usar numa história tudo o que aprendeste na Secção 2"],
  vocab=[],
  ex=[("(Fictício) Op zaterdag slaap ik uit. Om tien uur ga ik naar de markt. 's Middags ruim ik op en 's avonds gaan we uit eten. Het weer is mooi!","Ao sábado durmo até tarde…")],
  review=["v-uitslapen","v-s-middags","v-opruimen","v-uit-eten","v-zonnig","v-liever","v-van-tot","v-weggaan"],
  cefr=C, exs=[
    MC("(Fictício) «Om tien uur ga ik naar de markt.» O que faz às dez?", ["*vai ao mercado","dorme|Antes.","janta fora|À noite."], "Compreensão.", ["v-weggaan"]),
    MC("(Fictício) «'s Middags ruim ik op.» O que faz à tarde?", ["*arruma a casa","dança|Não.","dorme|Não."], "Compreensão.", ["v-opruimen"]),
    TR("pt-nl","Ao sábado durmo até tarde.", ["Op zaterdag slaap ik uit(.)","Zaterdag slaap ik uit(.)"], "uitslapen.", ["v-uitslapen"]),
    TR("pt-nl","À noite vamos jantar fora.", ["'s Avonds gaan we uit eten(.)","We gaan 's avonds uit eten(.)"], "uit eten.", ["v-uit-eten"]),
    LI("Het wordt een zonnige dag van twintig graden.", ["Het wordt een zonnige dag van twintig graden(.)","Het wordt een zonnige dag van 20 graden(.)"], "Vai ser um dia de sol com vinte graus.", "Ouvir.", ["v-zonnig","v-graad"]),
    BS("Às dez saio de casa.", ["Om","tien","uur","ga","ik","weg."], ["Om tien uur ga ik weg."], "Inversão + separável.", ["v-weggaan"]),
    DL([("Vriendin","Wat doe je zaterdag?","O que fazes no sábado?"),("Jij","","")], ["*'s Ochtends slaap ik uit en 's avonds ga ik uit eten. Ga je mee?","Zaterdag is een dag.|Não.","Ik ben uit.|Não."], "Contar planos.", ["v-uit-eten"]),
    SW("Escreva o seu sábado ideal em 5–6 frases (horas, comida, tempo, lazer, separáveis).", ["Op zaterdag slaap ik uit. Om tien uur ontbijt ik met brood en kaas. 's Middags ga ik naar de markt en daarna ruim ik op. Het weer is zonnig, dus we fietsen naar het strand. 's Avonds gaan we uit eten."], ["Horas","Comida","Tempo","Separáveis"], 30, "Revisão.", ["v-uitslapen","v-uit-eten"]),
  ], diff=2, mins=6)

W()
