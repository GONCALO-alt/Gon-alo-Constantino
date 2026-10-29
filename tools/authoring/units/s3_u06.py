import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u06")
C = "A2"

L(1, "Marcar uma consulta", "Ik wil graag een afspraak maken.",
  ["Marcar uma consulta por telefone"],
  vocab=[V("v-afspraak-maken","een afspraak maken","marcar uma consulta|combinar","expression"), V("v-huisarts","huisarts","médico de família","noun","de",note="Primeiro contacto obrigatório no sistema de saúde neerlandês."),
         V("v-tandarts","tandarts","dentista","noun","de"), V("v-kapper","kapper","cabeleireiro","noun","de"), V("v-uitkomen","uitkomen","dar jeito","verb",note="Komt dinsdag u uit? = Terça dá-lhe jeito?")],
  ex=[("Ik wil graag een afspraak maken bij de huisarts.","Queria marcar uma consulta no médico de família."),("Wanneer komt het u uit?","Quando lhe dá jeito?"),("Dinsdag om tien uur komt mij goed uit.","Terça às dez dá-me jeito.")],
  gram=[G("g-uitkomen","Dar jeito: uitkomen","Para marcar horários: **Komt het u uit?** (dá-lhe jeito?), **Dat komt mij goed uit** (dá-me jeito), **Dat komt niet uit** (não dá jeito). O verbo é separável: uit + komen.",
    [("Komt vrijdag jou uit?","Sexta dá-te jeito?")])],
  review=["v-afspraak","v-passen","v-kunnen","v-wanneer"],
  cefr=C, exs=[
    MA([("huisarts","médico de família"),("tandarts","dentista"),("kapper","cabeleireiro"),("uitkomen","dar jeito")], "Consultas.", ["v-huisarts","v-tandarts","v-kapper","v-uitkomen"]),
    TR("pt-nl","Queria marcar uma consulta.", ["Ik wil graag een afspraak maken"], "een afspraak maken.", ["v-afspraak-maken"]),
    TR("nl-pt","Wanneer komt het u uit?", ["Quando lhe dá jeito","Quando é que lhe dá jeito"], "uitkomen.", ["v-uitkomen"]),
    TR("pt-nl","Terça dá-me jeito.", ["Dinsdag komt mij goed uit","Dinsdag komt me goed uit"], "komt … uit.", ["v-uitkomen"]),
    FE(["Ik","wil","een","afspraak","doen","bij","de","kapper."], 4, "maken", "een afspraak maken.", ["v-afspraak-maken"]),
    MC("Nos Países Baixos, para ir a um especialista, primeiro vai-se…", ["*à huisarts","diretamente ao hospital|Normalmente é preciso referenciação.","à farmácia|Não."], "A huisarts encaminha.", ["v-huisarts"]),
    LI("Dat komt mij niet goed uit.", ["Dat komt mij niet goed uit"], "Isso não me dá jeito.", "uitkomen negativo.", ["v-uitkomen"]),
    DL([("Assistente","Kan het donderdag om drie uur?","Pode ser quinta às três?"),("Paciente","")], ["*Ja, dat komt mij goed uit.","Ja, ik ben drie uur.|Não faz sentido.","Nee, ik ben huisarts.|Não responde."], "Aceitar o horário.", ["v-uitkomen"]),
    AR("tandarts","o dentista","de", "«De tandarts».", ["v-tandarts"]),
    WO("Tenho consulta no dentista amanhã.", ["Ik","heb","morgen","een","afspraak","bij","de","tandarts"], "bij de tandarts.", ["v-tandarts"]),
  ], diff=2, mins=6)

L(2, "Alterar e cancelar", "verzetten, afzeggen, een andere tijd.",
  ["Mudar ou cancelar uma marcação"],
  vocab=[V("v-afzeggen","afzeggen","cancelar","verb",note="Ik zeg de afspraak af."), V("v-verzetten","verzetten","adiar|mudar (marcação)","verb"),
         V("v-ander","ander","outro","adjective",note="een andere dag"), V("v-terugbellen","terugbellen","ligar de volta","verb")],
  ex=[("Ik moet mijn afspraak helaas afzeggen.","Infelizmente tenho de cancelar a minha consulta."),("Kan ik de afspraak verzetten?","Posso mudar a marcação?"),("Heeft u een andere tijd?","Tem outra hora?")],
  review=["v-afspraak","v-helaas","v-kunnen"],
  cefr=C, exs=[
    MA([("afzeggen","cancelar"),("verzetten","mudar (marcação)"),("ander","outro")], "Alterar.", ["v-afzeggen","v-verzetten","v-ander"]),
    TR("pt-nl","Posso mudar a marcação?", ["Kan ik de afspraak verzetten","Kan ik mijn afspraak verzetten"], "verzetten.", ["v-verzetten"]),
    WO("Tenho de cancelar a consulta.", ["Ik","moet","de","afspraak","afzeggen"], "Infinitivo junto no fim.", ["v-afzeggen"]),
    WO("Cancelo a consulta.", ["Ik","zeg","de","afspraak","af"], "Separável no presente.", ["v-afzeggen"]),
    TR("nl-pt","Heeft u een andere tijd?", ["Tem outra hora","Tem outro horário"], "andere.", ["v-ander"]),
    FE(["Ik","afzeg","mijn","afspraak."], 1, "zeg … af", "Separável: ik zeg mijn afspraak af.", ["v-afzeggen"]),
    MC("Uma outra dia:", ["*een andere dag","een ander dag|dag é de → andere.","een anders dag|Não."], "andere.", ["v-ander"]),
    LI("Kunt u mij terugbellen?", ["Kunt u mij terugbellen"], "Pode ligar-me de volta?", "terugbellen.", ["v-verzetten"]),
    FB("Ik ben ziek, dus ik moet de afspraak ___.", ["afzeggen"], "Cancelar.", ["v-afzeggen"], choices=["afzeggen","maken","reserveren"], tr="Estou doente, por isso tenho de cancelar a consulta."),
    DL([("Paciente","Ik kan morgen helaas niet komen.","Infelizmente amanhã não posso ir."),("Assistente","")], ["*Geen probleem. Wilt u een nieuwe afspraak maken?","Gefeliciteerd!|Não faz sentido.","Ik ben morgen.|Não responde."], "Propor nova marcação.", ["v-afspraak-maken"]),
  ], diff=2, mins=5)

L(3, "No cabeleireiro", "knippen, kort, een beetje korter.",
  ["Pedir um corte de cabelo"],
  vocab=[V("v-knippen","knippen","cortar (cabelo|com tesoura)","verb"), V("v-haar-noun","haar","cabelo","noun","het"),
         V("v-kort","kort","curto","adjective"), V("v-korter","korter","mais curto","adjective"), V("v-wassen","wassen","lavar","verb")],
  ex=[("Ik wil mijn haar laten knippen.","Quero cortar o cabelo."),("Een beetje korter, alstublieft.","Um pouco mais curto, por favor."),("Niet te kort!","Não muito curto!")],
  gram=[G("g-laten","Laten + infinitivo","Para dizer que alguém faz algo por nós: **laten** + infinitivo: *Ik **laat** mijn haar **knippen*** (vou cortar o cabelo — o cabeleireiro corta). Também: *Ik laat mijn fiets repareren.*",
    [("Ik laat de auto wassen.","Mando lavar o carro.")],
    "Em português dizemos «vou cortar o cabelo» mesmo sendo outra pessoa a cortar; em neerlandês é «laten knippen».")],
  review=["v-kapper","v-lang","v-te"],
  cefr=C, exs=[
    MA([("knippen","cortar"),("haar","cabelo"),("kort","curto"),("korter","mais curto"),("wassen","lavar")], "Cabeleireiro.", ["v-knippen","v-haar-noun","v-kort","v-korter","v-wassen"]),
    TR("pt-nl","Quero cortar o cabelo.", ["Ik wil mijn haar laten knippen","Ik wil graag mijn haar laten knippen"], "laten knippen.", ["v-knippen"]),
    TR("pt-nl","Um pouco mais curto, por favor.", ["Een beetje korter(,) [alstublieft|graag]"], "korter.", ["v-korter"]),
    TR("nl-pt","Niet te kort!", ["Não muito curto","Não demasiado curto"], "te kort.", ["v-kort"]),
    AR("haar","o cabelo","het", "«Het haar».", ["v-haar-noun"]),
    FE(["Ik","knip","mijn","haar","bij","de","kapper."], 1, "laat … knippen", "Quem corta é o cabeleireiro: ik laat mijn haar knippen.", ["v-knippen"]),
    LI("Wilt u uw haar eerst wassen?", ["Wilt u uw haar eerst wassen"], "Quer lavar o cabelo primeiro?", "wassen.", ["v-wassen"]),
    DL([("Cabeleireira","Wat mag het zijn?","O que vai ser?"),("Cliente","")], ["*Alleen knippen, een beetje korter.","Een kop koffie.|Não estamos num café.","Ik ben kort.|Não faz sentido."], "Pedido de corte.", ["v-knippen"]),
    FB("Mijn haar is te lang; het moet ___.", ["korter","kort"], "Mais curto.", ["v-korter"], choices=["korter","langer","wassen"], tr="O meu cabelo está comprido demais; tem de ficar mais curto."),
    WO("Mando lavar o carro.", ["Ik","laat","de","auto","wassen"], "laten + infinitivo.", ["v-wassen"]),
  ], diff=2, mins=5)

L(4, "Lembretes e confirmações", "herinnering, bevestiging, vergeten.",
  ["Perceber mensagens de confirmação e lembrete"],
  vocab=[V("v-herinnering","herinnering","lembrete|recordação","noun","de"), V("v-bevestigen","bevestigen","confirmar","verb"),
         V("v-vergeten","vergeten","esquecer","verb",note="Vergeet niet… = Não te esqueças de…"), V("v-op-tijd2","uiterlijk","o mais tardar|no máximo","adverb")],
  ex=[("Dit is een herinnering aan uw afspraak.","Isto é um lembrete da sua consulta."),("Wilt u de afspraak bevestigen?","Quer confirmar a consulta?"),("Afzeggen uiterlijk 24 uur van tevoren.","Cancelar no máximo 24 horas antes.")],
  review=["v-afspraak","v-afzeggen","v-op-tijd"],
  cefr=C, exs=[
    MA([("herinnering","lembrete"),("bevestigen","confirmar"),("vergeten","esquecer"),("uiterlijk","o mais tardar")], "Mensagens.", ["v-herinnering","v-bevestigen","v-vergeten","v-op-tijd2"]),
    TR("nl-pt","Wilt u de afspraak bevestigen?", ["Quer confirmar a consulta","Deseja confirmar a marcação"], "bevestigen.", ["v-bevestigen"]),
    TR("pt-nl","Não te esqueças da consulta!", ["Vergeet je afspraak niet","Vergeet de afspraak niet"], "vergeten + niet no fim.", ["v-vergeten"]),
    AR("herinnering","o lembrete","de", "-ing → de.", ["v-herinnering"]),
    MC("«Afzeggen uiterlijk 24 uur van tevoren.» Quer dizer…", ["*Deve cancelar pelo menos 24 horas antes","Pode cancelar até 24 horas depois|Não.","A consulta dura 24 horas|Não."], "uiterlijk = o mais tardar.", ["v-op-tijd2"]),
    FE(["Ik","ben","mijn","afspraak","vergeet."], 4, "vergeten", "Particípio: ik ben … vergeten.", ["v-vergeten"]),
    LI("Uw afspraak is bevestigd.", ["Uw afspraak is bevestigd"], "A sua consulta está confirmada.", "bevestigd = confirmado.", ["v-bevestigen"]),
    CO("text","SMS", "Herinnering: u heeft morgen, dinsdag 14 mei, om 10.30 uur een afspraak bij Tandartspraktijk Smit. Kunt u niet komen? Zeg uw afspraak dan uiterlijk vandaag af. Antwoord JA om te bevestigen.",
       [("Quando é a consulta?", ["*Terça, 14 de maio, às 10h30","Hoje às 10h30","Segunda às 14h"]),("Como se confirma?", ["*Responder JA","Ligar para o dentista","Não é preciso"])],
       "Antwoord JA = responda SIM.", ["v-herinnering","v-bevestigen"]),
    FB("___ niet je paspoort mee te nemen!", ["Vergeet"], "Não te esqueças…", ["v-vergeten"], choices=["Vergeet","Bevestig","Zeg"], tr="Não te esqueças de levar o passaporte!"),
    WO("Confirmo a consulta de quinta.", ["Ik","bevestig","de","afspraak","van","donderdag"], "bevestigen.", ["v-bevestigen"]),
  ], diff=2, mins=5)

L(5, "A minha agenda", "Revisão: marcar, mudar e confirmar.",
  ["Gerir marcações em situações reais"],
  ex=[("Ik heb dinsdag een afspraak bij de tandarts, maar ik wil hem verzetten naar vrijdag.","Tenho consulta no dentista na terça, mas quero mudá-la para sexta.")],
  review=["v-afspraak-maken","v-uitkomen","v-afzeggen","v-verzetten","v-bevestigen","v-huisarts","v-tandarts","v-kapper"],
  cefr=C, exs=[
    DL([("Assistente","Praktijk De Linde, goedemorgen.","Consultório De Linde, bom dia."),("Ana","Goedemorgen, ik wil graag een afspraak maken bij de huisarts.","Bom dia, queria marcar consulta no médico de família."),("Assistente","Kan het morgen om half tien?","Pode ser amanhã às nove e meia?"),("Ana","")], ["*Nee, dat komt niet goed uit. Kan het ook 's middags?","Ja, ik ben half tien.|Não faz sentido.","Ik zeg de huisarts af.|Não faz sentido."], "Recusar e propor alternativa.", ["v-uitkomen"]),
    TR("pt-nl","Quero mudar a consulta para sexta.", ["Ik wil de afspraak verzetten naar vrijdag","Ik wil mijn afspraak naar vrijdag verzetten"], "verzetten naar.", ["v-verzetten"]),
    TR("nl-pt","Ik moet mijn afspraak bij de kapper afzeggen.", ["Tenho de cancelar a (minha )marcação no cabeleireiro"], "afzeggen.", ["v-afzeggen","v-kapper"]),
    FE(["Woensdag","komt","mij","goed","in."], 4, "uit", "uitkomen: dat komt mij goed uit.", ["v-uitkomen"]),
    LI("Ik bel om een afspraak te maken.", ["Ik bel om een afspraak te maken"], "Ligo para marcar uma consulta.", "om … te = para.", ["v-afspraak-maken"]),
    MA([("een afspraak maken","marcar"),("verzetten","mudar"),("afzeggen","cancelar"),("bevestigen","confirmar")], "Ações.", ["v-afspraak-maken","v-verzetten","v-afzeggen","v-bevestigen"]),
    CO("text","Agenda da semana", "Maandag 9.00: tandarts\nWoensdag 17.30: kapper\nVrijdag 11.15: huisarts\nLet op: tandarts verzet naar donderdag 9.00!",
       [("Quando é agora o dentista?", ["*Quinta às 9h","Segunda às 9h","Sexta às 11h15"]),("A que horas é o cabeleireiro?", ["*17h30","9h","11h15"])],
       "Let op = atenção.", ["v-verzetten"]),
    WO("Pode confirmar a minha consulta por e-mail?", ["Kunt","u","mijn","afspraak","per","e-mail","bevestigen?"], "Modal + infinitivo no fim.", ["v-bevestigen"]),
    FB("Ik ben ziek. Ik moet mijn afspraak bij de kapper ___.", ["afzeggen"], "Cancelar.", ["v-afzeggen"], choices=["afzeggen","bevestigen","maken"], tr="Estou doente. Tenho de cancelar a marcação no cabeleireiro."),
    SW("Escreva uma mensagem curta para cancelar uma consulta e pedir outra data.", ["Beste [meneer|mevrouw](,) ik moet mijn afspraak van [dinsdag|maandag] helaas afzeggen(.) Kan ik een nieuwe afspraak maken"],
       ["Cancela com «afzeggen»","Usa «helaas»","Pede nova marcação com «een nieuwe afspraak maken»"], 10, "Modelo: «Beste mevrouw, ik moet mijn afspraak van dinsdag helaas afzeggen. Kan ik een nieuwe afspraak maken voor volgende week?»", ["v-afzeggen"]),
  ], diff=3, mins=7)

W()
