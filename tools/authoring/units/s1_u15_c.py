import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u15")
C = "A1"
# Lições extra (11–16): mais conversas completas — café, telefone, combinar, direções, festa — e revisão da Secção 1.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(11, "No café: pedir e pagar", "Mag ik betalen?",
  ["Pedir bebidas e pagar"],
  vocab=[X("v-mag-ik-betalen","mag ik betalen?","posso pagar? / a conta, por favor")],
  ex=[("Een thee en een bier, alstublieft.","Um chá e uma cerveja, por favor."),("Mag ik betalen? — Natuurlijk. Pinnen?","Posso pagar? — Claro. Com cartão?")],
  review=["v-thee","v-bier","v-willen","v-betalen","v-pinnen"],
  cefr=C, exs=[
    MA([("thee","chá"),("bier","cerveja"),("pinnen","pagar com cartão"),("betalen","pagar")], "No café.", ["v-thee","v-bier","v-pinnen","v-betalen"]),
    MC("Queres a conta:", ["*Mag ik betalen?","Mag ik pinnen bier?|Não.","Ik wil een feest.|Não."], "Pedir a conta.", ["v-mag-ik-betalen"]),
    TR("pt-nl","Um chá, por favor.", ["Een thee(,) alstublieft(.)","Een thee(,) graag(.)","Ik wil graag een thee(.)"], "Pedido.", ["v-thee"]),
    TR("pt-nl","Posso pagar com cartão?", ["Kan ik pinnen?","Mag ik pinnen?"], "pinnen.", ["v-pinnen"]),
    CJ("willen","ik","Ik ___ graag een koffie.", ["wil"], "ik wil.", ["v-willen"]),
    DL([("Ober","Wat wilt u drinken?","O que quer beber?"),("Jij","","")], ["*Een bier, alstublieft.","Ik ben bier.|Não.","Tot ziens.|Não."], "Pedir.", ["v-bier"]),
    DL([("Ober","Dat is dan zeven euro. Pinnen?","São sete euros. Com cartão?"),("Jij","","")], ["*Ja, graag.","Nee, ik heb geen dorst.|Não faz sentido.","Gefeliciteerd!|Não."], "Pagar.", ["v-pinnen"]),
    LI("Mag ik betalen, alstublieft?", ["Mag ik betalen(,) alstublieft(?)"], "Posso pagar, por favor?", "Ouvir.", ["v-mag-ik-betalen"]),
  ], diff=1, mins=4)

L(12, "Combinar um encontro", "Om hoe laat spreken we af?",
  ["Combinar dia, hora e lugar"],
  vocab=[X("v-om-hoe-laat","om hoe laat?","a que horas?")],
  ex=[("Zullen we morgen afspreken? — Prima! Om hoe laat?","Combinamos amanhã? — Ótimo! A que horas?"),("Om drie uur bij het station. — Tot dan!","Às três na estação. — Até lá!")],
  review=["v-afspreken","v-prima-combinado","v-tot-dan","v-samen"],
  cefr=C, exs=[
    MA([("afspreken","combinar"),("prima","ótimo, combinado"),("tot dan","até lá"),("om hoe laat?","a que horas?")], "Combinar.", ["v-afspreken","v-prima-combinado","v-tot-dan","v-om-hoe-laat"]),
    MC("Combinaram tudo. Despedes-te com:", ["*Prima, tot dan!","Om hoe laat?|Já combinaram a hora.","Mag ik betalen?|Não."], "Fechar.", ["v-tot-dan"]),
    TR("pt-nl","A que horas?", ["Om hoe laat?","Hoe laat?"], "om hoe laat.", ["v-om-hoe-laat"]),
    TR("pt-nl","Às três na estação.", ["Om drie uur bij het station(.)"], "om + bij.", ["v-om","v-station"]),
    FB("Zullen we morgen ___?", ["afspreken"], "Combinar.", ["v-afspreken"], choices=["afspreken","betalen","bellen"], tr="Combinamos amanhã?"),
    DL([("Vriendin","Zullen we zaterdag samen koffie drinken?","Bebemos um café juntos no sábado?"),("Jij","","")], ["*Leuk! Om hoe laat?","Nee, niemand.|Não.","Mag ik pinnen?|Não."], "Aceitar e perguntar a hora.", ["v-om-hoe-laat"]),
    LI("Prima, tot zaterdag!", ["Prima(,) tot zaterdag(!)"], "Ótimo, até sábado!", "Ouvir.", ["v-prima-combinado"]),
    WO("A que horas combinamos?", ["Om","hoe","laat","spreken","we","af?"], "Separável: af no fim.", ["v-om-hoe-laat","v-afspreken"]),
  ], diff=2, mins=4)

L(13, "Atender o telefone", "Met Ana!",
  ["Atender e terminar uma chamada"],
  vocab=[X("v-met-naam","met …","fala … (ao atender o telefone)")],
  ex=[("Met Ana. — Hoi Ana, met Joost!","Fala a Ana. — Olá Ana, é o Joost!"),("Ik bel je straks terug.","Ligo-te de volta daqui a pouco.")],
  gram=[G("g-s1u15c-1","Atender com «met»","Nos Países Baixos atende-se o telefone com **met + o nome**: *Met Ana* (fala a Ana), *Met Pieter de Vries*. Quem liga também se apresenta assim: *Hoi, met Joost!*")],
  review=["v-bellen","v-tot-straks","v-iemand"],
  cefr=C, exs=[
    MC("O telefone toca. Atendes:", ["*Met Rui.","Ik ben telefoon.|Não.","Doei!|É despedida."], "met + nome.", ["v-met-naam"]),
    MC("«Met Joost» ao telefone significa…", ["*Fala o Joost.","Estou com o Joost.|Ao telefone, «met» apresenta quem fala.","Liga ao Joost.|Não."], "Uso ao telefone.", ["v-met-naam"]),
    TR("pt-nl","Fala a Marta.", ["Met Marta(.)"], "met + nome.", ["v-met-naam"]),
    TR("pt-nl","Ligo-te mais logo.", ["Ik bel je straks(.)","Ik bel je straks terug(.)"], "bellen.", ["v-bellen","v-nu-straks"]),
    DL([("Telefoon","Met Sanne.","Fala a Sanne."),("Jij","","")], ["*Hoi Sanne, met Pedro! Hoe gaat het?","Met Sanne.|Repete.","Wie ben ik?|Não."], "Apresentar-se.", ["v-met-naam"]),
    FB("Ik ___ je morgen.", ["bel"], "ik bel.", ["v-bellen"], choices=["bel","belt","bellen"], tr="Ligo-te amanhã."),
    LI("Hallo, met Femke. Is Tom thuis?", ["Hallo(,) met Femke(.) Is Tom thuis(?)"], "Olá, fala a Femke. O Tom está em casa?", "Ouvir.", ["v-met-naam"]),
    DL([("Vriend","Ik moet gaan. Doei!","Tenho de ir. Adeus!"),("Jij","","")], ["*Doei, tot straks!","Met Pedro.|Já não é altura.","Mag ik betalen?|Não."], "Terminar.", ["v-tot-straks"]),
  ], diff=2, mins=4)

L(14, "Direções simples", "De eerste straat links.",
  ["Dar e seguir direções curtas"],
  vocab=[X("v-eerste-straat-links","de eerste straat links","a primeira rua à esquerda")],
  ex=[("Ga rechtdoor en dan de eerste straat links.","Siga em frente e depois a primeira rua à esquerda."),("Het station is rechts.","A estação fica à direita.")],
  review=["v-links","v-rechts","v-rechtdoor","v-zoeken","v-eerste","v-tweede"],
  cefr=C, exs=[
    MA([("links","à esquerda"),("rechts","à direita"),("rechtdoor","em frente"),("zoeken","procurar")], "Direções.", ["v-links","v-rechts","v-rechtdoor","v-zoeken"]),
    MC("«De tweede straat rechts» =", ["*a segunda rua à direita","a primeira rua à direita|«tweede» = segunda.","a segunda rua à esquerda|«rechts» = direita."], "Direções.", ["v-tweede","v-rechts"]),
    TR("pt-nl","Siga em frente.", ["Ga rechtdoor(.)"], "rechtdoor.", ["v-rechtdoor"]),
    TR("pt-nl","A primeira rua à esquerda.", ["De eerste straat links(.)"], "Expressão.", ["v-eerste-straat-links"]),
    DL([("Toerist","Pardon, ik zoek het station.","Desculpe, procuro a estação."),("Jij","","")], ["*Ga rechtdoor en dan de eerste straat links.","Ik zoek ook niemand.|Não.","Met Ana.|Não."], "Dar direções.", ["v-zoeken"]),
    FB("Ga ___ en dan rechts.", ["rechtdoor"], "Em frente.", ["v-rechtdoor"], choices=["rechtdoor","links","eerste"], tr="Siga em frente e depois à direita."),
    LI("Het restaurant is links, naast de supermarkt.", ["Het restaurant is links(,) naast de supermarkt(.)"], "O restaurante fica à esquerda, ao lado do supermercado.", "Ouvir.", ["v-links"]),
    WO("Siga em frente.", ["Ga","rechtdoor."], "Ordem.", ["v-rechtdoor"]),
  ], diff=2, mins=4)

L(15, "Numa festa", "Gezellig!",
  ["Conversar numa festa e elogiar o ambiente"],
  vocab=[],
  ex=[("Wat een gezellig feest!","Que festa tão agradável!"),("Ken je iemand hier? — Nee, nog niemand.","Conheces alguém aqui? — Não, ainda ninguém.")],
  review=["v-feest","v-gezellig","v-iemand","v-kennen","v-niemand"],
  cefr=C, exs=[
    MC("«Gezellig» descreve…", ["*um ambiente agradável e acolhedor","algo caro|Não.","algo aborrecido|É o contrário."], "Palavra típica.", ["v-gezellig"]),
    MC("«iemand» é o contrário de…", ["*niemand","niets|«niets» é o contrário de «iets».","samen|Não."], "Opostos.", ["v-iemand","v-niemand"]),
    TR("pt-nl","Que festa tão agradável!", ["Wat een gezellig feest(!)"], "gezellig.", ["v-gezellig","v-feest"]),
    TR("pt-nl","Conheces alguém aqui?", ["Ken je iemand hier?","Ken jij iemand hier?","Ken je hier iemand?"], "iemand.", ["v-iemand","v-kennen"]),
    DL([("Gast","Hoi! Ik ben Lars. Hoe ken jij Sanne?","Olá, sou o Lars. De onde conheces a Sanne?"),("Jij","","")], ["*Hoi Lars! Ze is mijn collega.","Gezellig.|Não responde.","Mag ik betalen?|Não."], "Responder.", ["v-collega"]),
    DL([("Sanne","Wil je iets drinken?","Queres beber alguma coisa?"),("Jij","","")], ["*Ja, graag. Een thee, alsjeblieft.","Nee, niemand.|Não.","Tot dan.|Não."], "Aceitar.", ["v-thee"]),
    LI("Het is heel gezellig hier!", ["Het is heel gezellig hier(!)"], "Está muito agradável aqui!", "Ouvir.", ["v-gezellig"]),
    WO("Que festa agradável!", ["Wat","een","gezellig","feest!"], "Ordem.", ["v-gezellig"]),
  ], diff=2, mins=4)

L(16, "Revisão da Secção 1: uma conversa completa", "Alles samen.",
  ["Usar numa conversa tudo o que aprendeste na Secção 1"],
  vocab=[],
  ex=[("(Fictício) Hoi! Ik ben Rui. Ik kom uit Portugal en ik woon nu in Leiden. Ik ben docent. Ik heb een zus en een broertje.","Olá! Sou o Rui…")],
  review=["v-heten","v-komen-uit","v-wonen","v-docent","v-hebben","v-graag","v-geen","v-om-hoe-laat","v-gezellig"],
  cefr=C, exs=[
    MC("(Fictício) «Ik ben Rui. Ik kom uit Portugal en ik woon nu in Leiden.» Onde mora o Rui?", ["*em Leiden","em Portugal|É de onde vem.","no Porto|Não."], "Compreensão.", ["v-wonen"]),
    DL([("Nieuwe buurvrouw","Hoi! Ik ben Eva. Hoe heet jij?","Olá! Sou a Eva. Como te chamas?"),("Jij","","")], ["*Hoi Eva! Ik heet Rui. Leuk je te ontmoeten.","Hoe heet jij?|Repetes a pergunta sem responder.","Doei!|Não."], "Apresentar-se.", ["v-heten"]),
    DL([("Eva","Waar kom je vandaan?","De onde és?"),("Jij","","")], ["*Uit Portugal, uit Porto.","In Leiden.|É onde moras.","Om drie uur.|Não."], "Origem.", ["v-komen-uit"]),
    DL([("Eva","Wat doe je?","O que fazes?"),("Jij","","")], ["*Ik ben docent. En jij?","Ik ben moe.|Não é a profissão.","Ja, graag.|Não."], "Profissão.", ["v-docent"]),
    DL([("Eva","Zullen we morgen koffie drinken?","Bebemos café amanhã?"),("Jij","","")], ["*Gezellig! Om hoe laat?","Nee, ik ken niemand.|Não.","Ik heb geen broer.|Não."], "Combinar.", ["v-om-hoe-laat"]),
    TR("pt-nl","Moro em Leiden e trabalho muito.", ["Ik woon in Leiden en ik werk veel(.)","Ik woon in Leiden en werk veel(.)"], "Duas frases com en.", ["v-wonen","v-veel"]),
    LI("Ik heb geen tijd vandaag, maar morgen wel.", ["Ik heb geen tijd vandaag(,) maar morgen wel(.)"], "Hoje não tenho tempo, mas amanhã sim.", "Ouvir.", ["v-geen"]),
    SW("Escreva uma apresentação de 5–6 frases: nome, origem, morada, profissão, família e o que gosta de fazer.", ["Hallo! Ik heet Rui. Ik kom uit Porto, maar ik woon nu in Leiden. Ik ben docent. Ik heb een zus en een broertje. Ik lees graag en ik fiets elke dag."], ["Nome e origem","Morada e profissão","Família","Gostos"], 25, "Revisão.", ["v-heten","v-graag"]),
  ], diff=2, mins=6)

W()
