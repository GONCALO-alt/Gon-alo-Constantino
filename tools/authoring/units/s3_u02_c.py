import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u02")
C = "A2"
# Lições extra (10–15): estacionar e arranjar a bicicleta, sinais, rotundas, estacionar o carro.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Onde deixo a bicicleta?", "De fietsenstalling.",
  ["Estacionar a bicicleta no sítio certo"],
  vocab=[N("v-fietsenstalling","fietsenstalling","parque de bicicletas","de")],
  ex=[("Zet je fiets in de fietsenstalling bij het station.","Põe a bicicleta no parque junto à estação."),("Hier mag je je fiets niet neerzetten.","Aqui não se pode deixar a bicicleta.")],
  review=["v-slot","v-verboden","v-fiets"],
  cefr=C, exs=[
    MA([("fietsenstalling","parque de bicicletas"),("slot","cadeado"),("verboden","proibido"),("stoep","passeio")], "Bicicleta.", ["v-fietsenstalling","v-slot","v-verboden","v-stoep"]),
    MC("Uma placa diz «Fietsen worden verwijderd». O que acontece?", ["*As bicicletas mal estacionadas são retiradas","As bicicletas são lavadas|Não.","Há bicicletas grátis|Não."], "Aviso real.", ["v-verboden"]),
    TR("pt-nl","Onde é o parque de bicicletas?", ["Waar is de fietsenstalling?"], "fietsenstalling.", ["v-fietsenstalling"]),
    TR("pt-nl","Tranca sempre a bicicleta.", ["Zet je fiets altijd op slot(.)","Doe je fiets altijd op slot(.)"], "op slot.", ["v-slot"]),
    FB("Fietsen op de stoep is ___.", ["verboden"], "Proibido.", ["v-verboden","v-stoep"], choices=["verboden","veilig","gratis"], tr="Andar de bicicleta no passeio é proibido."),
    LI("De fietsenstalling is gratis voor de eerste 24 uur.", ["De fietsenstalling is gratis voor de eerste 24 uur(.)","De fietsenstalling is gratis voor de eerste vierentwintig uur(.)"], "O parque é grátis nas primeiras 24 horas.", "Regra de exemplo (varia).", ["v-fietsenstalling"]),
    DL([("Medewerker","Hier mag u uw fiets niet zetten.","Aqui não pode deixar a bicicleta."),("Jij","","")], ["*Sorry, waar is de fietsenstalling?","Ik ben fiets.|Não.","Verboden is leuk.|Não."], "Reagir.", ["v-fietsenstalling"]),
    AR("fietsenstalling", "parque de bicicletas", "de", "-ing → de.", ["v-fietsenstalling"]),
  ], diff=2, mins=4)

L(11, "Furo na roda", "Een lekke band plakken.",
  ["Resolver um furo e ir ao mecânico de bicicletas"],
  vocab=[N("v-fietsenmaker","fietsenmaker","mecânico de bicicletas","de"), X("v-band-plakken","een band plakken","remendar um pneu")],
  ex=[("Ik heb een lekke band.","Tenho um pneu furado."),("De fietsenmaker plakt mijn band.","O mecânico remenda-me o pneu.")],
  review=["v-band","v-lek","v-rem","v-zadel"],
  cefr=C, exs=[
    MA([("fietsenmaker","mecânico de bicicletas"),("band","pneu"),("rem","travão"),("zadel","selim")], "Peças.", ["v-fietsenmaker","v-band","v-rem","v-zadel"]),
    TR("pt-nl","A minha bicicleta tem um pneu furado.", ["Mijn fiets heeft een lekke band(.)"], "lekke band.", ["v-lek","v-band"]),
    TR("pt-nl","Pode remendar o pneu?", ["Kunt u de band plakken?","Kunt u mijn band plakken?"], "band plakken.", ["v-band-plakken"]),
    FB("Mijn ___ doen het niet; ik kan niet stoppen!", ["remmen"], "Travões.", ["v-rem"], choices=["remmen","banden","zadels"], tr="Os meus travões não funcionam; não consigo parar!"),
    DL([("Fietsenmaker","Wat is er met de fiets?","O que tem a bicicleta?"),("Jij","","")], ["*De achterband is lek en het licht doet het niet.","De fiets is mooi.|Não explica.","Ik ben fietsenmaker.|Não."], "Explicar.", ["v-lek","v-fietslicht"]),
    LI("Hij is morgen klaar; dat kost vijftien euro.", ["Hij is morgen klaar(;) dat kost vijftien euro(.)","Hij is morgen klaar(,) dat kost vijftien euro(.)","Hij is morgen klaar(,) dat kost 15 euro(.)"], "Fica pronta amanhã; custa 15 euros.", "Ouvir.", ["v-klaar"]),
    MC("Sem luz na bicicleta à noite…", ["*arriscas uma multa e é perigoso","não há problema|É obrigatório ter luz.","é mais rápido|Não."], "Regra.", ["v-fietslicht"]),
    AR("fietsenmaker", "mecânico", "de", "Pessoa: de.", ["v-fietsenmaker"]),
  ], diff=2, mins=4)

L(12, "Sinais com a mão", "Hand uitsteken.",
  ["Sinalizar mudanças de direção na bicicleta"],
  vocab=[X("v-hand-uitsteken","je hand uitsteken","esticar o braço (sinalizar)")],
  ex=[("Steek je hand uit als je afslaat.","Estica o braço quando viras."),("Ik ga rechtsaf: ik steek mijn rechterhand uit.","Viro à direita: estico a mão direita.")],
  review=["v-rechtsaf","v-linksaf","v-voorrang","v-stoplicht"],
  cefr=C, exs=[
    MA([("rechtsaf","virar à direita"),("linksaf","virar à esquerda"),("voorrang","prioridade"),("stoplicht","semáforo")], "Trânsito.", ["v-rechtsaf","v-linksaf","v-voorrang","v-stoplicht"]),
    MC("Antes de virar à esquerda na bicicleta…", ["*esticas o braço esquerdo","tocas a campainha três vezes|Não é a regra.","páras sempre|Não."], "Regra.", ["v-hand-uitsteken","v-linksaf"]),
    TR("pt-nl","Estica o braço quando viras.", ["Steek je hand uit als je afslaat(.)"], "uitsteken.", ["v-hand-uitsteken"]),
    TR("pt-nl","Ao semáforo, vira à direita.", ["Bij het stoplicht rechtsaf(.)","Ga bij het stoplicht rechtsaf(.)"], "rechtsaf.", ["v-rechtsaf","v-stoplicht"]),
    FB("Hier heeft het verkeer van rechts ___.", ["voorrang"], "Prioridade.", ["v-voorrang"], choices=["voorrang","rechtsaf","stoplicht"], tr="Aqui o trânsito da direita tem prioridade."),
    LI("Bij rood licht moet je stoppen, ook op de fiets.", ["Bij rood licht moet je stoppen(,) ook op de fiets(.)"], "Com sinal vermelho tens de parar, também de bicicleta.", "Ouvir.", ["v-stoplicht"]),
    MC("Qual é a ordem correta?", ["*Ik steek mijn hand uit.","Ik uitsteek mijn hand.|Separável."], "Separável.", ["v-hand-uitsteken"]),
    WO("Vira à esquerda.", ["Ga","linksaf."], "Ordem.", ["v-linksaf"]),
  ], diff=2, mins=4)

L(13, "A rotunda", "Op de rotonde.",
  ["Perceber as regras básicas da rotunda"],
  vocab=[N("v-rotonde","rotonde","rotunda","de","rotondes")],
  ex=[("Neem op de rotonde de tweede afslag.","Na rotunda, apanhe a segunda saída."),("Op veel rotondes hebben fietsers voorrang.","Em muitas rotundas os ciclistas têm prioridade.")],
  review=["v-voorrang","v-stoplicht"],
  cefr=C, exs=[
    MA([("rotonde","rotunda"),("stoplicht","semáforo"),("rechtsaf","à direita"),("voorrang","prioridade")], "Trânsito.", ["v-rotonde","v-stoplicht","v-rechtsaf","v-voorrang"]),
    MC("Nas rotundas nas cidades neerlandesas, os ciclistas na ciclovia à volta…", ["*muitas vezes têm prioridade (vê os sinais e as marcas)","nunca têm prioridade|Depende, mas muitas vezes têm.","não podem passar|Não."], "Regra (confirma sempre a sinalização).", ["v-rotonde"]),
    TR("pt-nl","Na rotunda, a segunda saída.", ["Op de rotonde de tweede afslag(.)","Neem op de rotonde de tweede afslag(.)"], "afslag.", ["v-rotonde"]),
    TR("pt-nl","Os ciclistas têm prioridade.", ["Fietsers hebben voorrang(.)"], "voorrang.", ["v-voorrang"]),
    FB("Bij de ___ ga je rechtdoor.", ["rotonde"], "Rotunda.", ["v-rotonde"], choices=["rotonde","fietsenmaker","zadel"], tr="Na rotunda segue em frente."),
    LI("Let op: fietsers hebben hier voorrang.", ["Let op(:) fietsers hebben hier voorrang(.)","Let op fietsers hebben hier voorrang(.)"], "Atenção: aqui os ciclistas têm prioridade.", "Aviso.", ["v-voorrang"]),
    DL([("Toerist","Hoe kom ik bij het ziekenhuis?","Como chego ao hospital?"),("Jij","","")], ["*Bij de rotonde de derde afslag, dan zie je het.","Ik ben rotonde.|Não.","Voorrang.|Não responde."], "Direções.", ["v-rotonde"]),
    AR("rotonde", "rotunda", "de", "de rotonde.", ["v-rotonde"]),
  ], diff=2, mins=4)

L(14, "De carro na cidade", "Parkeren.",
  ["Falar de estacionar o carro"],
  vocab=[X("v-parkeren","parkeren","estacionar","verb"), N("v-parkeerplaats","parkeerplaats","lugar de estacionamento","de")],
  ex=[("In het centrum is parkeren duur.","No centro estacionar é caro."),("Ik zoek een parkeerplaats.","Procuro um lugar para estacionar.")],
  review=["v-auto","v-duur"],
  cefr=C, exs=[
    MA([("parkeren","estacionar"),("parkeerplaats","lugar"),("auto","carro"),("duur","caro")], "Carro.", ["v-parkeren","v-parkeerplaats","v-auto","v-duur"]),
    MC("Muitas cidades neerlandesas…", ["*preferem que vás de bicicleta ou transportes, e o estacionamento é caro","têm estacionamento grátis no centro|Raro.","proíbem carros totalmente|Não."], "Contexto.", ["v-parkeren"]),
    TR("pt-nl","Onde posso estacionar?", ["Waar kan ik parkeren?","Waar mag ik parkeren?"], "parkeren.", ["v-parkeren"]),
    TR("pt-nl","Procuro um lugar de estacionamento.", ["Ik zoek een parkeerplaats(.)"], "parkeerplaats.", ["v-parkeerplaats"]),
    CJ("parkeren","wij","Wij ___ bij het station.", ["parkeren"], "wij parkeren.", ["v-parkeren"]),
    FB("Parkeren in het centrum is erg ___.", ["duur"], "Caro.", ["v-duur"], choices=["duur","goedkoop","verboden"], tr="Estacionar no centro é muito caro."),
    LI("Hier is het betaald parkeren.", ["Hier is het betaald parkeren(.)"], "Aqui o estacionamento é pago.", "Aviso.", ["v-parkeren"]),
    WO("Procuro um lugar.", ["Ik","zoek","een","parkeerplaats."], "Ordem.", ["v-parkeerplaats"]),
  ], diff=2, mins=4)

L(15, "Prática: de casa ao trabalho em segurança", "Veilig op weg.",
  ["Descrever o percurso e as regras"],
  vocab=[],
  ex=[("(Fictício) Ik fiets naar mijn werk. Bij de rotonde ga ik rechtsaf en steek mijn hand uit. Mijn fiets zet ik in de fietsenstalling.","Vou de bicicleta para o trabalho…")],
  review=["v-fietsenstalling","v-hand-uitsteken","v-rotonde","v-fietsenmaker","v-parkeren","v-tram"],
  cefr=C, exs=[
    MC("(Fictício) «Mijn fiets zet ik in de fietsenstalling.» Onde deixa a bicicleta?", ["*no parque de bicicletas","na rua|Não.","no comboio|Não."], "Compreensão.", ["v-fietsenstalling"]),
    MC("(Fictício) «Als het regent, neem ik de tram.» Quando apanha o elétrico?", ["*quando chove","sempre|Não.","ao domingo|Não."], "Compreensão.", ["v-tram"]),
    TR("pt-nl","Vou de bicicleta para o trabalho.", ["Ik fiets naar mijn werk(.)","Ik ga met de fiets naar mijn werk(.)"], "fietsen.", ["v-fiets"]),
    TR("pt-nl","Na rotunda viro à direita.", ["Bij de rotonde ga ik rechtsaf(.)","Op de rotonde ga ik rechtsaf(.)"], "rechtsaf.", ["v-rotonde","v-rechtsaf"]),
    LI("Mijn band is lek; ik breng de fiets naar de fietsenmaker.", ["Mijn band is lek(;) ik breng de fiets naar de fietsenmaker(.)","Mijn band is lek(,) ik breng de fiets naar de fietsenmaker(.)"], "Tenho o pneu furado; levo a bicicleta ao mecânico.", "Ouvir.", ["v-fietsenmaker"]),
    BS("Estico o braço e viro à esquerda.", ["Ik","steek","mijn","hand","uit","en","ga","linksaf."], ["Ik steek mijn hand uit en ga linksaf."], "Separável + en.", ["v-hand-uitsteken","v-linksaf"]),
    DL([("Nieuwe collega","Hoe kom jij naar je werk?","Como vens para o trabalho?"),("Jij","","")], ["*Met de fiets, twintig minuten. Als het regent, neem ik de tram.","Ik ben rotonde.|Não.","Parkeren.|Não responde."], "Responder.", ["v-fiets"]),
    SW("Descreva o seu percurso diário (4 frases: transporte, direções, onde estaciona).", ["Ik fiets elke dag naar mijn werk. Ik ga rechtdoor en bij de rotonde linksaf. Ik steek altijd mijn hand uit. Mijn fiets zet ik in de fietsenstalling."], ["Transporte","Direções","Estacionar"], 20, "Escrever.", ["v-rotonde","v-fietsenstalling"]),
  ], diff=2, mins=5)

W()
