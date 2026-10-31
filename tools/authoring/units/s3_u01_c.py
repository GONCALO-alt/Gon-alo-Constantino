import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u01")
C = "A2"
# Lições extra (10–15): planear viagens, OV-fiets, lugares, check-out esquecido, revisor.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Planear a viagem", "De reisplanner.",
  ["Usar um planeador de viagens e perceber o resultado"],
  vocab=[N("v-reisplanner","reisplanner","planeador de viagens (app/site)","de")],
  ex=[("Volgens de reisplanner duurt de reis vijftig minuten.","Segundo o planeador, a viagem demora cinquenta minutos."),("Je moet één keer overstappen in Utrecht.","Tens de mudar uma vez em Utrecht.")],
  review=["v-overstappen","v-vertrekken","v-perron","v-richting"],
  cefr=C, exs=[
    MA([("reisplanner","planeador de viagens"),("overstappen","mudar (de comboio)"),("vertrekken","partir"),("perron","plataforma")], "Viajar.", ["v-reisplanner","v-overstappen","v-vertrekken","v-perron"]),
    MC("(Planeador) «Vertrek 10.14 – spoor 5 – 1x overstappen». Quantas mudanças?", ["*uma","nenhuma|«1x» = uma vez.","cinco|É a linha."], "Ler o resultado.", ["v-overstappen"]),
    TR("pt-nl","Tenho de mudar em Utrecht.", ["Ik moet overstappen in Utrecht(.)","Ik moet in Utrecht overstappen(.)"], "overstappen.", ["v-overstappen"]),
    TR("pt-nl","O comboio parte às dez.", ["De trein vertrekt om tien uur(.)"], "vertrekken.", ["v-vertrekken"]),
    FB("Kijk even in de ___ hoe laat de trein gaat.", ["reisplanner"], "App.", ["v-reisplanner"], choices=["reisplanner","perron","richting"], tr="Vê no planeador a que horas vai o comboio."),
    LI("De trein richting Den Haag vertrekt van perron drie.", ["De trein richting Den Haag vertrekt van perron drie(.)","De trein richting Den Haag vertrekt van perron 3(.)"], "O comboio para Haia parte da plataforma três.", "Ouvir.", ["v-richting","v-perron"]),
    DL([("Vriend","Hoe lang duurt de reis?","Quanto tempo demora a viagem?"),("Jij","","")], ["*Volgens de reisplanner ongeveer een uur.","Op perron vijf.|Não responde.","Ik ben de reis.|Não."], "Responder.", ["v-reisplanner"]),
    WO("Tenho de mudar.", ["Ik","moet","overstappen."], "Modal + infinitivo.", ["v-overstappen"]),
  ], diff=2, mins=4)

L(11, "A bicicleta do comboio", "De OV-fiets.",
  ["Alugar uma bicicleta na estação"],
  vocab=[N("v-ov-fiets","OV-fiets","bicicleta de aluguer nas estações","de")],
  ex=[("Op het station huur ik een OV-fiets.","Na estação alugo uma OV-fiets."),("Je betaalt per rit van 24 uur.","Paga-se por período de 24 horas.")],
  gram=[G("g-s3u01c-1","OV-fiets","A **OV-fiets** é uma bicicleta de aluguer das estações. Usa-se um passe pessoal; o preço e as regras mudam com o tempo — verifica sempre no site oficial (informação aqui apenas geral).")],
  review=["v-ov-chipkaart","v-fiets"],
  cefr=C, exs=[
    MC("A OV-fiets aluga-se…", ["*na estação de comboios","no supermercado|Não.","no hospital|Não."], "Onde.", ["v-ov-fiets"]),
    TR("pt-nl","Alugo uma bicicleta na estação.", ["Ik huur een fiets op het station(.)","Op het station huur ik een OV-fiets(.)","Ik huur een OV-fiets op het station(.)"], "huren.", ["v-ov-fiets"]),
    FB("Ik neem de trein en daarna een ___.", ["OV-fiets"], "Bicicleta da estação.", ["v-ov-fiets"], choices=["OV-fiets","perron","richting"], tr="Apanho o comboio e depois uma OV-fiets."),
    LI("Waar kan ik een OV-fiets huren?", ["Waar kan ik een OV-fiets huren(?)"], "Onde posso alugar uma OV-fiets?", "Ouvir.", ["v-ov-fiets"]),
    DL([("Medewerker","Heeft u een abonnement voor de OV-fiets?","Tem uma assinatura para a OV-fiets?"),("Jij","","")], ["*Ja, het staat op mijn OV-chipkaart.","Ik ben fiets.|Não.","Nee, perron drie.|Não responde."], "Responder.", ["v-ov-chipkaart"]),
    MC("Antes de usar um serviço com preço que muda, deves…", ["*confirmar o preço atual no site oficial","confiar num preço antigo|Pode ter mudado.","não pagar|Não."], "Boa prática.", ["v-ov-fiets"]),
    TR("nl-pt","De OV-fiets staat bij de uitgang.", ["A OV-fiets está junto à saída(.)"], "uitgang.", ["v-ov-fiets"]),
    AR("OV-fiets", "bicicleta da estação", "de", "de fiets.", ["v-ov-fiets"]),
  ], diff=2, mins=4)

L(12, "Comboio cheio", "Is deze plaats vrij?",
  ["Procurar e pedir um lugar no comboio"],
  vocab=[N("v-zitplaats","zitplaats","lugar sentado","de","zitplaatsen")],
  ex=[("Is deze plaats nog vrij?","Este lugar está livre?"),("Er zijn geen zitplaatsen meer; ik moet staan.","Já não há lugares; tenho de ir de pé.")],
  review=["v-vrij","v-staan","v-klas-trein"],
  cefr=C, exs=[
    MA([("zitplaats","lugar sentado"),("vrij","livre"),("staan","estar de pé"),("eerste klas","primeira classe")], "No comboio.", ["v-zitplaats","v-vrij","v-staan","v-klas-trein"]),
    TR("pt-nl","Este lugar está livre?", ["Is deze plaats (nog) vrij?","Is deze stoel vrij?"], "vrij.", ["v-vrij"]),
    TR("pt-nl","Tenho de ir de pé.", ["Ik moet staan(.)"], "staan.", ["v-staan"]),
    FB("In de spits zijn er weinig ___.", ["zitplaatsen"], "Lugares.", ["v-zitplaats"], choices=["zitplaatsen","perrons","kaartjes"], tr="Na hora de ponta há poucos lugares."),
    DL([("Reiziger","Is deze plaats vrij?","Este lugar está livre?"),("Jij","","")], ["*Ja hoor, ga uw gang.","Nee, ik ben vrij.|Confuso.","Eerste klas.|Não responde."], "Responder.", ["v-vrij"]),
    MC("Tens bilhete de 2.ª classe e sentas-te na 1.ª. O que pode acontecer?", ["*O revisor pede para mudares ou pagares a diferença","Nada nunca|Pode haver controlo.","Ganhas um prémio|Não."], "Regras.", ["v-klas-trein"]),
    LI("Mag ik er even langs?", ["Mag ik er even langs(?)"], "Posso passar?", "Frase útil.", ["v-staan"]),
    WO("Está livre?", ["Is","deze","plaats","vrij?"], "Ordem.", ["v-vrij"]),
  ], diff=2, mins=4)

L(13, "Esqueci-me do check-out", "Vergeten uit te checken.",
  ["Resolver o problema de não fazer check-out"],
  vocab=[X("v-vergeten-uitchecken","vergeten uit te checken","esquecer-se de fazer check-out")],
  ex=[("Ik ben vergeten uit te checken.","Esqueci-me de fazer check-out."),("Nu is er te veel van mijn saldo afgeschreven.","Agora foi descontado demasiado do meu saldo.")],
  review=["v-inchecken","v-uitchecken","v-saldo","v-opladen"],
  cefr=C, exs=[
    MA([("inchecken","fazer check-in"),("uitchecken","fazer check-out"),("saldo","saldo"),("opladen","carregar")], "Cartão.", ["v-inchecken","v-uitchecken","v-saldo","v-opladen"]),
    MC("Se te esqueceres do check-out…", ["*pagas uma tarifa mais alta (pode pedir-se reembolso)","viajas grátis|Não.","o cartão é bloqueado para sempre|Não."], "Consequência.", ["v-uitchecken"]),
    TR("pt-nl","Esqueci-me de fazer check-out.", ["Ik ben vergeten uit te checken(.)","Ik vergat uit te checken(.)"], "vergeten + te.", ["v-vergeten-uitchecken"]),
    TR("pt-nl","Tenho de carregar o cartão.", ["Ik moet mijn kaart opladen(.)","Ik moet mijn OV-chipkaart opladen(.)"], "opladen.", ["v-opladen"]),
    FB("Mijn ___ is te laag; ik kan niet inchecken.", ["saldo"], "Saldo.", ["v-saldo"], choices=["saldo","perron","richting"], tr="O meu saldo é baixo demais; não consigo fazer check-in."),
    DL([("Klantenservice","Waarmee kan ik u helpen?","Em que posso ajudar?"),("Jij","","")], ["*Ik ben gisteren vergeten uit te checken. Kan ik mijn geld terugkrijgen?","Ik ben saldo.|Não.","Perron vijf.|Não."], "Pedir reembolso.", ["v-vergeten-uitchecken"]),
    LI("Vergeet niet uit te checken!", ["Vergeet niet uit te checken(!)"], "Não te esqueças de fazer check-out!", "Aviso.", ["v-uitchecken"]),
    WO("Faz check-in.", ["Check","in."], "Imperativo separável.", ["v-inchecken"]),
  ], diff=2, mins=4)

L(14, "O revisor", "Uw kaartje, alstublieft.",
  ["Mostrar o bilhete e perceber o revisor"],
  vocab=[N("v-conducteur","conducteur","revisor (comboio)","de","conducteurs")],
  ex=[("Mag ik uw vervoersbewijs zien?","Posso ver o seu título de transporte?"),("De conducteur controleert de kaartjes.","O revisor verifica os bilhetes.")],
  review=["v-kaartje","v-ov-chipkaart","v-retour","v-enkele-reis"],
  cefr=C, exs=[
    MA([("conducteur","revisor"),("kaartje","bilhete"),("enkele reis","só ida"),("retour","ida e volta")], "Bilhetes.", ["v-conducteur","v-kaartje","v-enkele-reis","v-retour"]),
    MC("«Vervoersbewijs» é…", ["*o título de transporte (bilhete, cartão)","a carta de condução|Não.","o passaporte|Não."], "Vocabulário oficial.", ["v-kaartje"]),
    TR("pt-nl","Aqui está o meu cartão.", ["Hier is mijn kaart(.)","Hier is mijn OV-chipkaart(.)"], "Hier is.", ["v-ov-chipkaart"]),
    TR("pt-nl","Um bilhete de ida e volta para Leiden.", ["Een retour Leiden(,) alstublieft(.)","Een retourtje Leiden(.)","Een retour naar Leiden(.)"], "retour.", ["v-retour"]),
    DL([("Conducteur","Goedemiddag, uw vervoersbewijs alstublieft.","Boa tarde, o seu título de transporte, por favor."),("Jij","","")], ["*Alstublieft, hier is mijn OV-chipkaart.","Ik ben conducteur.|Não.","Enkele reis.|Incompleto."], "Mostrar.", ["v-conducteur"]),
    FB("De ___ loopt door de trein.", ["conducteur"], "Revisor.", ["v-conducteur"], choices=["conducteur","chauffeur","reiziger"], tr="O revisor anda pelo comboio."),
    LI("Een enkele reis Amsterdam, tweede klas.", ["Een enkele reis Amsterdam(,) tweede klas(.)"], "Uma ida para Amesterdão, segunda classe.", "Ouvir.", ["v-enkele-reis"]),
    AR("conducteur", "revisor", "de", "de conducteur.", ["v-conducteur"]),
  ], diff=2, mins=4)

L(15, "Prática: uma viagem com imprevistos", "Een reis met storing.",
  ["Resolver uma viagem com atrasos e mudanças"],
  vocab=[],
  ex=[("(Fictício) Door een storing rijdt er geen trein naar Gouda. Er rijden bussen in plaats van treinen.","Devido a uma avaria não há comboio para Gouda. Há autocarros em vez de comboios.")],
  review=["v-storing","v-uitvallen","v-in-plaats-van","v-overstappen","v-reisplanner","v-wachttijd"],
  cefr=C, exs=[
    MC("(Fictício) «Er rijden bussen in plaats van treinen.» O que significa?", ["*Há autocarros em vez de comboios.","Os autocarros também param.|Não.","Não há transporte.|Há autocarros."], "Compreensão.", ["v-in-plaats-van"]),
    MC("(Fictício) «De trein van 9.12 valt uit.» O comboio das 9h12…", ["*foi cancelado","está atrasado|Isso é vertraging.","parte mais cedo|Não."], "uitvallen.", ["v-uitvallen"]),
    TR("pt-nl","Há uma avaria.", ["Er is een storing(.)"], "storing.", ["v-storing"]),
    TR("pt-nl","O tempo de espera é de vinte minutos.", ["De wachttijd is twintig minuten(.)"], "wachttijd.", ["v-wachttijd"]),
    LI("Reizigers naar Gouda moeten overstappen op de bus.", ["Reizigers naar Gouda moeten overstappen op de bus(.)"], "Os passageiros para Gouda têm de mudar para o autocarro.", "Aviso.", ["v-overstappen"]),
    DL([("Collega","Waar blijf je?","Onde estás?"),("Jij","","")], ["*Mijn trein is uitgevallen. Ik neem de bus en ben er over een half uur.","Ik ben storing.|Não.","Op perron.|Incompleto."], "Explicar.", ["v-uitvallen"]),
    BS("Há autocarros em vez de comboios.", ["Er","rijden","bussen","in","plaats","van","treinen."], ["Er rijden bussen in plaats van treinen."], "in plaats van.", ["v-in-plaats-van"]),
    SW("Escreva uma mensagem ao seu chefe: o comboio foi cancelado, vai chegar atrasado e diz a nova hora.", ["Hoi Mark, mijn trein is uitgevallen door een storing. Ik neem de volgende trein en ben er om half tien. Sorry voor het ongemak!"], ["Problema","Solução","Nova hora"], 20, "Mensagem.", ["v-uitvallen","v-storing"]),
  ], diff=2, mins=5)

W()
