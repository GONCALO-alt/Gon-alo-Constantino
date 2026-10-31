import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u01")
C = "A1"
# Lições extra (11–16): mais prática de cumprimentos e despedidas, só com vocabulário desta unidade.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(11, "Até amanhã!", "Tot morgen, tot zo, fijne dag.",
  ["Despedir-se indicando quando nos voltamos a ver"],
  vocab=[X("v-tot-morgen","tot morgen","até amanhã"), X("v-tot-zo","tot zo","até já"),
         X("v-fijne-dag","fijne dag!","bom dia! (ao despedir-se)"), X("v-fijn-weekend","fijn weekend!","bom fim de semana!")],
  ex=[("Doei, tot morgen!","Adeus, até amanhã!"),("Ik ben er zo. Tot zo!","Já volto. Até já!"),("Dank je wel, fijne dag!","Obrigado, bom dia!")],
  review=["v-tot-ziens","v-tot-straks","v-doei"],
  cefr=C, exs=[
    MA([("tot morgen","até amanhã"),("tot zo","até já"),("tot straks","até logo"),("tot ziens","até à vista")], "Despedidas com «tot».", ["v-tot-morgen","v-tot-zo","v-tot-straks","v-tot-ziens"]),
    MC("Sexta-feira à tarde, sais do trabalho. Dizes aos colegas:", ["*Fijn weekend!","Goedemorgen!|É um cumprimento de chegada, de manhã.","Welterusten!|Só antes de dormir."], "Fim de semana.", ["v-fijn-weekend"]),
    MC("Vais buscar um café e voltas daqui a dois minutos:", ["*Tot zo!","Tot morgen!|Só voltas amanhã?","Tot ziens!|Mais formal e sem tempo definido."], "Muito em breve: tot zo.", ["v-tot-zo"]),
    TR("pt-nl","Até amanhã!", ["Tot morgen(!)"], "tot + quando.", ["v-tot-morgen"]),
    TR("nl-pt","Fijne dag!", ["Bom dia(!)","Tem um bom dia(!)","Tenha um bom dia(!)"], "Diz-se ao despedir-se.", ["v-fijne-dag"]),
    FB("Doei, tot ___!", ["morgen"], "Amanhã.", ["v-tot-morgen"], choices=["morgen","goed","prima"], tr="Adeus, até amanhã!"),
    LI("Dank u wel, fijne dag!", ["Dank u wel, fijne dag(!)","Dank u wel fijne dag"], "Muito obrigado, bom dia!", "Na loja.", ["v-fijne-dag","v-dank-u-wel"]),
    DL([("Collega","Doei, fijn weekend!","Adeus, bom fim de semana!"),("Jij","","")], ["*Dank je, fijn weekend!","Goedemorgen!|Não é despedida.","Hoe gaat het?|Não responde."], "Responder.", ["v-fijn-weekend"]),
  ], diff=1, mins=4)

L(12, "Igualmente!", "Jij ook! U ook!",
  ["Responder a votos com «tu também» e «o senhor também»"],
  vocab=[X("v-jij-ook","jij ook!","tu também!"), X("v-u-ook","u ook!","o senhor / a senhora também!")],
  ex=[("Fijne dag! — Dank je, jij ook!","Bom dia! — Obrigado, tu também!"),("Fijn weekend, meneer! — Dank u, u ook!","Bom fim de semana! — Obrigado, o senhor também!")],
  review=["v-fijne-dag","v-fijn-weekend","v-meneer","v-mevrouw"],
  cefr=C, exs=[
    MC("Uma amiga diz «Fijn weekend!». Respondes:", ["*Dank je, jij ook!","Dank u, u ook!|Com uma amiga usa-se «jij».","Tot ziens, mevrouw!|Demasiado formal."], "Informal: jij.", ["v-jij-ook"]),
    MC("A senhora da padaria diz «Fijne dag!». Respondes:", ["*Dank u wel, u ook!","Jij ook, hoi!|Informal demais.","Welterusten!|Não."], "Formal: u.", ["v-u-ook"]),
    TR("pt-nl","Obrigado, tu também!", ["Dank je(, jij ook)!","Dank je wel, jij ook(!)","Bedankt, jij ook(!)"], "jij ook.", ["v-jij-ook"]),
    TR("pt-nl","Obrigado, a senhora também!", ["Dank u(, u ook)!","Dank u wel, u ook(!)"], "u ook.", ["v-u-ook"]),
    FB("Fijne dag, meneer! — Dank u, ___ ook!", ["u"], "Formal.", ["v-u-ook"], choices=["u","jij","je"], tr="Bom dia, senhor! — Obrigado, o senhor também!"),
    DL([("Buurvrouw","Goedenavond! Fijn weekend!","Boa noite! Bom fim de semana!"),("Jij","","")], ["*Dank u wel, u ook!","Goedemorgen!|É de noite.","Sorry!|Não faz sentido."], "Responder com educação.", ["v-u-ook"]),
    LI("Bedankt, jij ook!", ["Bedankt, jij ook(!)","Bedankt jij ook"], "Obrigado, tu também!", "Resposta.", ["v-jij-ook","v-bedankt"]),
    WO("Obrigado, tu também!", ["Dank","je,","jij","ook!"], "Ordem.", ["v-jij-ook"]),
  ], diff=1, mins=4)

L(13, "Não faz mal", "Sorry! — Geeft niet!",
  ["Pedir desculpa e aceitar um pedido de desculpa"],
  vocab=[X("v-geeft-niet","geeft niet","não faz mal"), X("v-geen-probleem","geen probleem","não há problema")],
  ex=[("Sorry! — Geeft niet!","Desculpa! — Não faz mal!"),("Pardon, mevrouw. — Geen probleem.","Perdão, minha senhora. — Não há problema.")],
  review=["v-sorry","v-pardon"],
  cefr=C, exs=[
    MA([("sorry","desculpa"),("pardon","perdão / com licença"),("geeft niet","não faz mal"),("geen probleem","não há problema")], "Desculpas.", ["v-sorry","v-pardon","v-geeft-niet","v-geen-probleem"]),
    MC("Alguém te pisa sem querer e diz «Sorry!». Respondes:", ["*Geeft niet!","Graag gedaan!|É resposta a «obrigado».","Tot zo!|Não."], "Aceitar desculpa.", ["v-geeft-niet"]),
    MC("«Graag gedaan» responde a…", ["*dank je wel","sorry|A «sorry» responde-se «geeft niet».","hoe gaat het?|Não."], "Pares fixos.", ["v-graag-gedaan","v-geeft-niet"]),
    TR("pt-nl","Desculpa! — Não faz mal!", ["Sorry! — Geeft niet!","Sorry, geeft niet(!)","Sorry geeft niet"], "geeft niet.", ["v-geeft-niet"]),
    TR("nl-pt","Geen probleem.", ["Não há problema(.)","Não tem problema(.)","Sem problema(.)"], "geen = nenhum.", ["v-geen-probleem"]),
    FB("Sorry! — ___ niet!", ["Geeft"], "Expressão fixa.", ["v-geeft-niet"], choices=["Geeft","Gaat","Graag"], tr="Desculpa! — Não faz mal!"),
    DL([("Meneer","Pardon, mevrouw, sorry!","Perdão, minha senhora, desculpe!"),("Jij","","")], ["*Geen probleem, meneer.","Dank je wel!|Não há nada a agradecer.","Welterusten!|Não."], "Aceitar com educação.", ["v-geen-probleem"]),
    LI("Sorry! — Geeft niet.", ["Sorry! Geeft niet(.)","Sorry geeft niet","Sorry, geeft niet(.)"], "Desculpa! — Não faz mal.", "Diálogo curto.", ["v-geeft-niet"]),
  ], diff=1, mins=4)

L(14, "Como vai isso?", "Hoe is het? Super!",
  ["Perguntar como está alguém de outra maneira e responder com entusiasmo"],
  vocab=[X("v-hoe-is-het","hoe is het?","como vai? / como está?"), X("v-super","super","ótimo","adjective")],
  ex=[("Hoi! Hoe is het? — Super, en met jou?","Olá! Como vai? — Ótimo, e contigo?"),("Hoe is het met u? — Goed, dank u.","Como está? — Bem, obrigado.")],
  review=["v-hoe-gaat-het","v-goed","v-prima","v-het-gaat-wel","v-niet-zo-goed"],
  cefr=C, exs=[
    MC("«Hoe is het?» significa o mesmo que…", ["*Hoe gaat het?","Hoe heet je?|Isso é «como te chamas?» — ainda vais aprender.","Tot ziens?|Não."], "Sinónimos.", ["v-hoe-is-het","v-hoe-gaat-het"]),
    MC("Do melhor para o pior:", ["*super → goed → het gaat wel → niet zo goed","niet zo goed → super → goed|Não.","het gaat wel → super → niet zo goed|Não."], "Escala.", ["v-super","v-goed","v-het-gaat-wel","v-niet-zo-goed"]),
    TR("pt-nl","Olá! Como vai?", ["Hoi! Hoe is het?","Hallo! Hoe is het?","Hoi, hoe gaat het?","Hallo, hoe gaat het?"], "hoe is het.", ["v-hoe-is-het"]),
    TR("pt-nl","Ótimo, e contigo?", ["Super, en met jou?"], "en met jou.", ["v-super","v-en-met-jou"]),
    FB("Hoe ___ het met u?", ["is"], "hoe is het met u.", ["v-hoe-is-het"], choices=["is","gaat het","ben"], tr="Como está (o senhor)?"),
    DL([("Vriendin","Hoi! Hoe is het?","Olá! Como vai?"),("Jij","","")], ["*Super! En met jou?","Dag mevrouw.|Formal demais com uma amiga.","Graag gedaan.|Não responde."], "Responder e devolver a pergunta.", ["v-super"]),
    LI("Hoe is het met jou?", ["Hoe is het met jou(?)"], "Como vais tu?", "Pergunta.", ["v-hoe-is-het"]),
    WO("Como vai? Ótimo!", ["Hoe","is","het?","Super!"], "Ordem.", ["v-hoe-is-het","v-super"]),
  ], diff=1, mins=4)

L(15, "Cumprimentar sem pensar nas horas", "Goedendag.",
  ["Usar «goedendag» e «dag» em situações formais"],
  vocab=[X("v-goedendag","goedendag","bom dia / boa tarde (formal, a qualquer hora)")],
  ex=[("Goedendag, meneer.","Bom dia, senhor."),("Dag mevrouw, tot ziens!","Adeus, minha senhora, até à vista!")],
  review=["v-dag-groet","v-goedemorgen","v-goedemiddag","v-goedenavond"],
  cefr=C, exs=[
    MC("«Goedendag» é…", ["*um cumprimento formal que serve para o dia todo","só para a noite|Não.","muito informal|É bastante formal."], "Registo.", ["v-goedendag"]),
    MC("São 15h. Qual cumprimento NÃO serve?", ["*Goedemorgen|De manhã, até ao meio-dia.","Goedemiddag|Serve.","Goedendag|Serve a qualquer hora."], "Horas.", ["v-goedemorgen","v-goedemiddag","v-goedendag"]),
    MA([("goedemorgen","bom dia (manhã)"),("goedemiddag","boa tarde"),("goedenavond","boa noite (ao chegar)"),("welterusten","durma bem")], "Revisão.", ["v-goedemorgen","v-goedemiddag","v-goedenavond","v-welterusten"]),
    TR("pt-nl","Bom dia, minha senhora.", ["Goedendag(,) mevrouw(.)","Goedemorgen(,) mevrouw(.)","Dag mevrouw(.)"], "mevrouw.", ["v-goedendag","v-mevrouw"]),
    FB("___, meneer. Hoe gaat het met u?", ["Goedendag"], "Formal.", ["v-goedendag"], choices=["Goedendag","Doei","Welterusten"], tr="Bom dia, senhor. Como está?"),
    LI("Goedendag, mevrouw.", ["Goedendag(,) mevrouw(.)"], "Bom dia, minha senhora.", "Cumprimento formal.", ["v-goedendag"]),
    DL([("Receptionist","Goedendag, meneer!","Bom dia, senhor!"),("Jij","","")], ["*Goedendag! Hoe gaat het met u?","Doei!|É despedida informal.","Welterusten!|Não."], "Formal.", ["v-goedendag"]),
    WO("Bom dia, senhor.", ["Goedendag,","meneer."], "Ordem.", ["v-goedendag"]),
  ], diff=1, mins=4)

L(16, "Prática: um dia de cumprimentos", "Van goedemorgen tot welterusten.",
  ["Escolher o cumprimento certo ao longo de um dia"],
  vocab=[],
  ex=[("Goedemorgen! — Goedemiddag! — Goedenavond! — Welterusten!","Bom dia! — Boa tarde! — Boa noite! — Durma bem!")],
  review=["v-goedemorgen","v-goedemiddag","v-goedenavond","v-welterusten","v-tot-morgen","v-jij-ook","v-geeft-niet","v-hoe-is-het"],
  cefr=C, exs=[
    MC("8h, no café do bairro:", ["*Goedemorgen!","Goedenavond!|É de manhã.","Welterusten!|Não."], "Manhã.", ["v-goedemorgen"]),
    MC("14h, ao chegar a uma reunião:", ["*Goedemiddag!","Goedemorgen!|Já é tarde.","Doei!|Despedida."], "Tarde.", ["v-goedemiddag"]),
    MC("18h, ao sair do trabalho:", ["*Doei, tot morgen!","Goedemorgen!|Não.","Welterusten!|Ainda não vais dormir."], "Despedida.", ["v-tot-morgen"]),
    MC("23h, antes de dormir:", ["*Welterusten!","Goedenavond!|É cumprimento de chegada.","Tot zo!|Não."], "Noite.", ["v-welterusten"]),
    DL([("Ana","Hé, hallo! Hoe is het met je?","Olá! Como estás?"),("Jij","","")], ["*Prima, dank je. En met jou?","Goedendag, mevrouw.|Formal demais.","Geeft niet.|Não responde."], "Conversa informal.", ["v-hoe-is-het","v-prima"]),
    DL([("Meneer De Vries","Goedenavond. Hoe gaat het met u?","Boa noite. Como está?"),("Jij","","")], ["*Goed, dank u. En met u?","Super, en met jou?|Informal com o senhor De Vries.","Doei!|Não."], "Conversa formal.", ["v-en-met-u"]),
    LI("Goedemorgen! Hoe gaat het?", ["Goedemorgen! Hoe gaat het(?)","Goedemorgen hoe gaat het"], "Bom dia! Como estás?", "Ouvir.", ["v-goedemorgen","v-hoe-gaat-het"]),
    SW("Escreva 3 cumprimentos ou despedidas que vai usar hoje (um por linha).", ["Goedemorgen!\nHoi, hoe is het?\nDoei, tot morgen!"], ["3 linhas","Cumprimento certo para a hora"], 3, "Uso real.", ["v-goedemorgen","v-tot-morgen"]),
  ], diff=1, mins=5)

W()
