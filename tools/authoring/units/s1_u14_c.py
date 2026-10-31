import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u14")
C = "A1"
# Lições extra (11–16): mais prática de negação — geen/niet, posição de niet, nog niet / niet meer, toch wel.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def Q(c, w, e, refs): return MC("Qual é a ordem correta?", ["*"+c, w+"|"+e], e, refs)

L(11, "Não tenho…", "Geen tijd, geen geld, geen honger.",
  ["Usar geen com substantivos sem artigo definido"],
  vocab=[],
  ex=[("Ik heb geen tijd.","Não tenho tempo."),("Ze heeft geen auto.","Ela não tem carro."),("We hebben geen honger.","Não temos fome.")],
  gram=[G("g-s1u14c-1","Geen = niet + een","**geen** nega um substantivo com *een* ou sem artigo: *een auto* → **geen auto**; *tijd* → **geen tijd**. Com *de/het* ou nomes próprios usa-se **niet**: *Ik heb de auto niet*.")],
  review=["v-geen","v-honger","v-dorst","v-tijd","v-probleem"],
  cefr=C, exs=[
    MC("«Não tenho tempo.»", ["*Ik heb geen tijd.","Ik heb niet tijd.|Substantivo sem artigo → geen.","Ik heb tijd niet.|Não."], "geen.", ["v-geen","v-tijd"]),
    MC("«Ela não tem carro.»", ["*Ze heeft geen auto.","Ze heeft niet een auto.|niet + een → geen.","Ze geen heeft auto.|Não."], "geen.", ["v-geen"]),
    TR("pt-nl","Não temos fome.", ["We hebben geen honger(.)","Wij hebben geen honger(.)"], "geen honger.", ["v-honger"]),
    TR("pt-nl","Não há problema.", ["Geen probleem(.)","Er is geen probleem(.)"], "geen probleem.", ["v-probleem"]),
    FB("Ik heb ___ dorst, dank je.", ["geen"], "geen + substantivo.", ["v-geen","v-dorst"], choices=["geen","niet","nee"], tr="Não tenho sede, obrigado."),
    FE(["Hij","heeft","niet","kinderen."], 2, "geen", "Substantivo sem artigo → geen.", ["v-geen"]),
    LI("Sorry, ik heb geen geld bij me.", ["Sorry(,) ik heb geen geld bij me(.)"], "Desculpa, não tenho dinheiro comigo.", "Ouvir.", ["v-geen","v-geld"]),
    WO("Não tenho tempo.", ["Ik","heb","geen","tijd."], "Ordem.", ["v-geen"]),
  ], diff=2, mins=4)

L(12, "Niet no fim", "Ik ken hem niet.",
  ["Pôr niet no fim da frase quando nega o verbo"],
  vocab=[],
  ex=[("Ik ken hem niet.","Não o conheço."),("Hij komt vandaag niet.","Ele hoje não vem."),("Ik weet het niet.","Não sei.")],
  gram=[G("g-s1u14c-2","Onde fica niet?","Quando nega o verbo, **niet** vai normalmente **para o fim** da frase simples, depois do complemento e do tempo: *Ik ken hem **niet***; *Hij werkt vandaag **niet***. Mas fica **antes** de adjetivos e lugares: *niet moe*, *niet thuis*.")],
  review=["v-niet","v-kennen","v-hem","v-weten"],
  cefr=C, exs=[
    Q("Ik ken hem niet.", "Ik ken niet hem.", "niet depois do complemento.", ["v-niet","v-kennen"]),
    Q("Hij werkt vandaag niet.", "Hij niet werkt vandaag.", "niet no fim.", ["v-niet"]),
    Q("Ik ben niet thuis.", "Ik ben thuis niet.", "Antes de lugar: niet thuis.", ["v-niet","v-thuis"]),
    TR("pt-nl","Não o conheço.", ["Ik ken hem niet(.)"], "niet no fim.", ["v-kennen","v-hem"]),
    TR("pt-nl","Ela hoje não trabalha.", ["Ze werkt vandaag niet(.)","Zij werkt vandaag niet(.)","Vandaag werkt ze niet(.)"], "niet no fim.", ["v-niet"]),
    WO("Não sei mesmo.", ["Ik","weet","het","echt","niet."], "niet no fim.", ["v-weten"]),
    BS("O café não está aberto.", ["Het","café","is","niet","open."], ["Het café is niet open."], "niet antes do adjetivo.", ["v-open"]),
    LI("De deur is niet dicht.", ["De deur is niet dicht(.)"], "A porta não está fechada.", "Ouvir.", ["v-dicht"]),
  ], diff=2, mins=4)

L(13, "Ainda não e já não", "Nog niet, niet meer.",
  ["Distinguir «ainda não» de «já não»"],
  vocab=[X("v-nooit-meer","nooit meer","nunca mais")],
  ex=[("Ik spreek nog niet goed Nederlands.","Ainda não falo bem neerlandês."),("Hij rookt niet meer.","Ele já não fuma."),("Nooit meer!","Nunca mais!")],
  review=["v-nog-niet","v-niet-meer","v-roken","v-nooit"],
  cefr=C, exs=[
    MA([("nog niet","ainda não"),("niet meer","já não"),("nooit meer","nunca mais"),("nooit","nunca")], "Tempo e negação.", ["v-nog-niet","v-niet-meer","v-nooit-meer","v-nooit"]),
    MC("Deixaste de fumar. Dizes:", ["*Ik rook niet meer.","Ik rook nog niet.|«Ainda não» — como se fosses começar.","Ik rook nooit.|Nunca fumaste?"], "niet meer.", ["v-niet-meer"]),
    MC("O comboio ainda não chegou:", ["*De trein is er nog niet.","De trein is er niet meer.|«Já não está» — partiu.","De trein is nooit meer.|Não."], "nog niet.", ["v-nog-niet"]),
    TR("pt-nl","Ainda não falo bem neerlandês.", ["Ik spreek nog niet goed Nederlands(.)"], "nog niet.", ["v-nog-niet"]),
    TR("pt-nl","Ele já não mora aqui.", ["Hij woont hier niet meer(.)"], "niet meer.", ["v-niet-meer"]),
    FB("Ik ben ___ klaar. Nog vijf minuten!", ["nog niet"], "Ainda não.", ["v-nog-niet"], choices=["nog niet","niet meer","nooit meer"], tr="Ainda não estou pronto. Mais cinco minutos!"),
    LI("Ik heb nog niet gegeten.", ["Ik heb nog niet gegeten(.)"], "Ainda não comi.", "Ouvir.", ["v-nog-niet"]),
    LI("Dat doe ik nooit meer!", ["Dat doe ik nooit meer(!)"], "Nunca mais faço isso!", "Ouvir.", ["v-nooit-meer"]),
  ], diff=2, mins=4)

L(14, "Claro que sim!", "Heb je geen tijd? — Toch wel!",
  ["Responder «sim» a uma pergunta negativa"],
  vocab=[X("v-toch-wel","toch wel","sim (contrariando uma negativa)")],
  ex=[("Heb je geen honger? — Toch wel!","Não tens fome? — Tenho, sim!"),("Kom je niet? — Toch wel, ik kom straks.","Não vens? — Venho, sim, daqui a pouco.")],
  gram=[G("g-s1u14c-3","Responder a perguntas negativas","À pergunta *Heb je **geen** tijd?* (Não tens tempo?): **Nee** = confirma (não tenho); **Toch wel** / **jawel** = contraria (tenho, sim). É parecido com o francês «si».")],
  review=["v-geen","v-niet","v-ja","v-nee","v-toch"],
  cefr=C, exs=[
    MC("«Heb je geen tijd?» — Tens tempo. Respondes:", ["*Toch wel!","Nee.|Isso confirma que NÃO tens.","Geen.|Não."], "Contrariar.", ["v-toch-wel"]),
    MC("«Ben je niet moe?» — Não estás cansado. Respondes:", ["*Nee, helemaal niet.","Toch wel.|Isso diria que estás cansado.","Ja, niet.|Não."], "Confirmar a negativa.", ["v-nee"]),
    TR("pt-nl","Não vens? — Venho, sim!", ["Kom je niet? — Toch wel!","Kom je niet? Toch wel(!)","Kom jij niet? Toch wel(!)"], "toch wel.", ["v-toch-wel"]),
    TR("nl-pt","Heb je geen honger? — Toch wel!", ["Não tens fome? — Tenho(, sim)!","Não tens fome? Tenho sim(!)"], "toch wel.", ["v-toch-wel"]),
    DL([("Vriend","Kom je niet naar het feest?","Não vens à festa?"),("Jij","","")], ["*Toch wel, ik kom om negen uur!","Ja, niet.|Confuso.","Geen feest.|Não."], "Contrariar.", ["v-toch-wel"]),
    FB("Spreek je geen Engels? — Toch ___, een beetje.", ["wel"], "toch wel.", ["v-toch-wel"], choices=["wel","niet","geen"], tr="Não falas inglês? — Falo, sim, um pouco."),
    LI("Toch wel, ik heb tijd.", ["Toch wel(,) ik heb tijd(.)"], "Tenho, sim, tenho tempo.", "Ouvir.", ["v-toch-wel"]),
    WO("Tenho, sim!", ["Toch","wel!"], "Ordem.", ["v-toch-wel"]),
  ], diff=2, mins=4)

L(15, "Ninguém, nada, em lado nenhum", "Niemand, niets, nergens.",
  ["Usar palavras negativas sem «niet»"],
  vocab=[X("v-nergens","nergens","em lado nenhum","adverb")],
  ex=[("Ik zie niemand.","Não vejo ninguém."),("Ik weet niets.","Não sei nada."),("Mijn sleutel is nergens.","A minha chave não está em lado nenhum.")],
  gram=[G("g-s1u14c-4","Sem dupla negação","Em neerlandês **não se junta niet** a *niemand, niets, nergens, nooit*: *Ik zie **niemand*** (não «ik zie niet niemand»). Em português dizemos «não… ninguém»; em neerlandês basta uma palavra.")],
  review=["v-niemand","v-niets","v-nooit"],
  cefr=C, exs=[
    MA([("niemand","ninguém"),("niets","nada"),("nergens","em lado nenhum"),("nooit","nunca")], "Palavras negativas.", ["v-niemand","v-niets","v-nergens","v-nooit"]),
    MC("«Não vejo ninguém.»", ["*Ik zie niemand.","Ik zie niet niemand.|Sem dupla negação.","Ik niet zie iemand.|Não."], "Uma só negação.", ["v-niemand"]),
    TR("pt-nl","Não sei nada.", ["Ik weet niets(.)","Ik weet niks(.)"], "niets.", ["v-niets"]),
    TR("pt-nl","A chave não está em lado nenhum.", ["De sleutel is nergens(.)"], "nergens.", ["v-nergens"]),
    FE(["Ik","zie","niet","niemand."], 2, "(retirar)", "Sem dupla negação: Ik zie niemand.", ["v-niemand"]),
    FB("Ik vind mijn bril ___. (em lado nenhum)", ["nergens"], "nergens.", ["v-nergens"], choices=["nergens","niemand","niets"], tr="Não encontro os óculos em lado nenhum."),
    LI("Er is niemand thuis.", ["Er is niemand thuis(.)"], "Não está ninguém em casa.", "Ouvir.", ["v-niemand"]),
    WO("Não sei nada.", ["Ik","weet","niets."], "Ordem.", ["v-niets"]),
  ], diff=2, mins=4)

L(16, "Prática: dizer não com educação", "Nee, dank je.",
  ["Recusar e negar com simpatia"],
  vocab=[],
  ex=[("Wil je koffie? — Nee, dank je, ik heb geen dorst.","Queres café? — Não, obrigado, não tenho sede."),("Sorry, ik kan vandaag niet.","Desculpa, hoje não posso.")],
  review=["v-geen","v-niet","v-nog-niet","v-niet-meer","v-toch-wel","v-nergens","v-helaas"],
  cefr=C, exs=[
    MC("Oferecem-te bolo e não queres. A resposta mais simpática:", ["*Nee, dank je wel. Ik heb geen honger.","Nee.|Seco demais.","Ik eet niets nooit.|Errado e rude."], "Recusar com educação.", ["v-geen"]),
    DL([("Collega","Ga je mee naar het café?","Vens ao café?"),("Jij","","")], ["*Helaas niet, ik heb geen tijd.","Toch wel niet.|Confuso.","Niemand.|Não."], "Recusar.", ["v-helaas","v-geen"]),
    DL([("Buurman","Woont Lisa hier nog?","A Lisa ainda mora aqui?"),("Jij","","")], ["*Nee, ze woont hier niet meer.","Nee, nog niet.|«ainda não» — não faz sentido.","Geen Lisa.|Rude."], "niet meer.", ["v-niet-meer"]),
    TR("pt-nl","Não, obrigado, não tenho fome.", ["Nee(,) dank je(,) ik heb geen honger(.)","Nee(,) dank je wel(,) ik heb geen honger(.)","Nee(,) bedankt(,) ik heb geen honger(.)"], "geen honger.", ["v-geen","v-honger"]),
    TR("pt-nl","Infelizmente ainda não sei.", ["Helaas weet ik het nog niet(.)","Ik weet het helaas nog niet(.)"], "nog niet.", ["v-nog-niet","v-helaas"]),
    FE(["Wij","hebben","niet","honger."], 2, "geen", "Substantivo sem artigo → geen.", ["v-geen"]),
    LI("Nee, dank je. Ik rook niet.", ["Nee(,) dank je(.) Ik rook niet(.)"], "Não, obrigado. Não fumo.", "Ouvir.", ["v-roken"]),
    SW("Escreva 3 frases negativas sobre si (use geen, niet e nog niet).", ["Ik heb geen auto. Ik rook niet. Ik spreek nog niet goed Nederlands."], ["geen","niet","nog niet"], 10, "Escrever.", ["v-geen","v-niet","v-nog-niet"]),
  ], diff=2, mins=5)

W()
