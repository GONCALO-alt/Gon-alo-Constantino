import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u13")
C = "A2"

L(1, "Reservar um hotel", "een kamer boeken, een tweepersoonskamer, het ontbijt inbegrepen.",
  ["Reservar um quarto de hotel"],
  vocab=[V("v-hotel","hotel","hotel","noun","het","hotels"), V("v-boeken","boeken","reservar|marcar","verb",note="een reis boeken = marcar uma viagem"),
         V("v-eenpersoonskamer","eenpersoonskamer","quarto individual","noun","de"), V("v-tweepersoonskamer","tweepersoonskamer","quarto duplo","noun","de"),
         V("v-nacht-hotel","overnachting","noite (estadia)","noun","de"), V("v-inbegrepen","inbegrepen","incluído","adjective")],
  ex=[("Ik wil een tweepersoonskamer boeken voor drie nachten.","Quero reservar um quarto duplo para três noites."),("Is het ontbijt inbegrepen?","O pequeno-almoço está incluído?"),("Een overnachting kost 120 euro.","Uma noite custa 120 euros.")],
  review=["v-reserveren","v-kamer","v-ontbijt","v-kosten"],
  cefr=C, exs=[
    MA([("boeken","reservar"),("eenpersoonskamer","quarto individual"),("tweepersoonskamer","quarto duplo"),("overnachting","noite de estadia"),("inbegrepen","incluído")], "Hotel.", ["v-boeken","v-eenpersoonskamer","v-tweepersoonskamer","v-nacht-hotel","v-inbegrepen"]),
    TR("pt-nl","Quero reservar um quarto duplo.", ["Ik wil een tweepersoonskamer boeken","Ik wil graag een tweepersoonskamer boeken","Ik wil een tweepersoonskamer reserveren"], "boeken.", ["v-boeken","v-tweepersoonskamer"]),
    TR("nl-pt","Is het ontbijt inbegrepen?", ["O pequeno-almoço está incluído"], "inbegrepen.", ["v-inbegrepen"]),
    AR("hotel","o hotel","het", "«Het hotel».", ["v-hotel"]),
    TR("pt-nl","para três noites", ["voor drie nachten"], "nacht → nachten.", ["v-nacht"]),
    FE(["Ik","boek","een","kamer","voor","twee","nacht."], 6, "nachten", "Plural: twee nachten.", ["v-nacht"]),
    LI("Heeft u nog een kamer vrij?", ["Heeft u nog een kamer vrij"], "Ainda tem um quarto livre?", "nog … vrij.", ["v-hotel"]),
    DL([("Receção","Hotel De Zon, goedemiddag.","Hotel De Zon, boa tarde."),("Cliente","")], ["*Goedemiddag, ik wil graag een kamer boeken van 3 tot 5 mei.","Ik ben een kamer.|Não faz sentido.","Ik wil uitchecken.|Ainda não chegou."], "Pedido de reserva.", ["v-boeken"]),
    FB("Een ___ is voor één persoon.", ["eenpersoonskamer"], "quarto individual.", ["v-eenpersoonskamer"], choices=["eenpersoonskamer","tweepersoonskamer","overnachting"], tr="Um quarto individual é para uma pessoa."),
    WO("A noite custa cem euros com pequeno-almoço.", ["De","overnachting","kost","honderd","euro","inclusief","ontbijt"], "inclusief.", ["v-nacht-hotel"]),
  ], diff=2, mins=5)

L(2, "No hotel", "inchecken, uitchecken, de sleutelkaart, de receptie.",
  ["Fazer check-in e check-out e resolver problemas no hotel"],
  vocab=[V("v-receptie","receptie","receção","noun","de"), V("v-sleutelkaart","sleutelkaart","cartão-chave","noun","de"),
         V("v-inchecken-hotel","inchecken","fazer check-in","verb",note="No hotel: Ik wil inchecken."), V("v-handdoek","handdoek","toalha","noun","de","handdoeken"), V("v-wifi","wifi","wi-fi","noun","de",note="Também se diz «het wifi».")],
  ex=[("Ik wil graag inchecken. Ik heb gereserveerd op naam van Silva.","Queria fazer o check-in. Tenho reserva em nome de Silva."),("Hoe laat moet ik uitchecken?","A que horas tenho de fazer o check-out?"),("Wat is het wachtwoord van de wifi?","Qual é a palavra-passe do wi-fi?")],
  review=["v-uitchecken","v-op-naam-van","v-wachtwoord","v-sleutel"],
  cefr=C, exs=[
    MA([("receptie","receção"),("sleutelkaart","cartão-chave"),("handdoek","toalha"),("wifi","wi-fi")], "No hotel.", ["v-receptie","v-sleutelkaart","v-handdoek","v-wifi"]),
    TR("pt-nl","A que horas tenho de fazer o check-out?", ["Hoe laat moet ik uitchecken"], "uitchecken.", ["v-uitchecken"]),
    TR("nl-pt","Wat is het wachtwoord van de wifi?", ["Qual é a palavra-passe do wi-fi"], "wachtwoord.", ["v-wifi"]),
    TR("pt-nl","Preciso de toalhas novas.", ["Ik heb nieuwe handdoeken nodig","Mag ik nieuwe handdoeken"], "handdoek → handdoeken.", ["v-handdoek"]),
    FE(["Mijn","sleutelkaart","doet","het","niet,","ik","ga","naar","de","kassa."], 9, "receptie", "No hotel vai-se à receção.", ["v-receptie"]),
    LI("Ontbijt is van zeven tot tien uur.", ["Ontbijt is van zeven tot tien uur"], "O pequeno-almoço é das sete às dez.", "van … tot.", ["v-ontbijt"]),
    DL([("Receção","Welkom! Heeft u gereserveerd?","Bem-vindo! Tem reserva?"),("Cliente","")], ["*Ja, op naam van Costa.","Ja, ik ben gereserveerd.|Diz «estou reservado».","Nee, ik check uit.|Acabou de chegar."], "Confirmar reserva.", ["v-op-naam-van"]),
    FB("De ___ is 24 uur per dag open.", ["receptie"], "receção.", ["v-receptie"], choices=["receptie","handdoek","sleutelkaart"], tr="A receção está aberta 24 horas por dia."),
    CO("text","Informação do quarto", "Welkom in Hotel Amstelzicht! Inchecken vanaf 15.00 uur, uitchecken vóór 11.00 uur. Ontbijt: 7.00 – 10.30 uur in het restaurant. Wifi: AmstelGast, wachtwoord: tulp2024. Voor vragen kunt u bellen naar de receptie (toets 9).",
       [("Até que horas é o check-out?", ["*Antes das 11h","Às 15h","Às 10h30"]),("Como contacta a receção?", ["*Marca 9","Envia e-mail","Vai à rua"])],
       "toets = tecla.", ["v-receptie","v-uitchecken"]),
    WO("Posso deixar a mala na receção?", ["Mag","ik","mijn","koffer","bij","de","receptie","laten?"], "laten = deixar.", ["v-receptie"]),
  ], diff=2, mins=6)

L(3, "Viajar de avião", "het vliegveld, de vlucht, de koffer, de bagage, de paspoortcontrole.",
  ["Desenrascar-se num aeroporto"],
  vocab=[V("v-vliegveld","vliegveld","aeroporto","noun","het",note="Schiphol é o aeroporto de Amesterdão."), V("v-vlucht","vlucht","voo","noun","de","vluchten"),
         V("v-koffer","koffer","mala (de viagem)","noun","de","koffers"), V("v-bagage","bagage","bagagem","noun","de"), V("v-instapkaart","instapkaart","cartão de embarque","noun","de"), V("v-gate","gate","porta de embarque","noun","de")],
  ex=[("Mijn vlucht vertrekt om 10.15 uur.","O meu voo parte às 10h15."),("Waar kan ik mijn koffer inchecken?","Onde posso despachar a mala?"),("De vlucht heeft vertraging.","O voo está atrasado.")],
  review=["v-vertraging","v-paspoort","v-vertrekken"],
  cefr=C, exs=[
    MA([("vliegveld","aeroporto"),("vlucht","voo"),("koffer","mala"),("instapkaart","cartão de embarque"),("gate","porta de embarque")], "Aeroporto.", ["v-vliegveld","v-vlucht","v-koffer","v-instapkaart","v-gate"]),
    AR("vliegveld","o aeroporto","het", "veld → het.", ["v-vliegveld"]),
    TR("pt-nl","O meu voo parte às dez.", ["Mijn vlucht vertrekt om tien uur"], "vertrekken.", ["v-vlucht"]),
    TR("nl-pt","Waar kan ik mijn koffer inchecken?", ["Onde posso despachar a (minha )mala","Onde posso fazer o check-in da mala"], "inchecken.", ["v-koffer"]),
    FE(["Mijn","vlucht","heb","vertraging."], 2, "heeft", "de vlucht → heeft.", ["v-vlucht"]),
    LI("Uw instapkaart en paspoort, alstublieft.", ["Uw instapkaart en paspoort(,) alstublieft"], "O seu cartão de embarque e passaporte, por favor.", "Controlo.", ["v-instapkaart"]),
    FB("De ___ naar Lissabon vertrekt van gate D7.", ["vlucht"], "voo.", ["v-vlucht"], choices=["vlucht","koffer","bagage"], tr="O voo para Lisboa parte da porta D7."),
    MC("«Handbagage» é…", ["*Bagagem de mão","A mala despachada|Não.","Uma bolsa de mão de senhora|Não exatamente."], "hand + bagage.", ["v-bagage"]),
    DL([("Funcionária","Heeft u bagage om in te checken?","Tem bagagem para despachar?"),("Passageiro","")], ["*Ja, één koffer.","Ja, mijn paspoort.|Não é bagagem.","Nee, ik ben de gate.|Não faz sentido."], "Responder.", ["v-koffer"]),
    WO("Onde é a porta de embarque D12?", ["Waar","is","gate","D12?"], "Pergunta.", ["v-gate"]),
  ], diff=2, mins=5)

L(4, "Férias e planos de viagem", "op vakantie gaan, de bestemming, het strand, de camping.",
  ["Falar de férias e planos de viagem"],
  vocab=[V("v-vakantie","vakantie","férias","noun","de",note="op vakantie gaan = ir de férias"), V("v-bestemming","bestemming","destino","noun","de"),
         V("v-strand","strand","praia","noun","het","stranden"), V("v-camping","camping","parque de campismo","noun","de"), V("v-buitenland","buitenland","estrangeiro","noun","het")],
  ex=[("We gaan in augustus op vakantie.","Vamos de férias em agosto."),("Wat is je favoriete bestemming?","Qual é o teu destino preferido?"),("We gaan kamperen in Frankrijk.","Vamos acampar em França."),("Ik ga vaak naar het buitenland.","Vou muitas vezes ao estrangeiro.")],
  gram=[G("g-vakantie-cultura","Férias neerlandesas","Muitos neerlandeses passam férias de **camping** (com caravana!), em França, Espanha ou Itália. Também é comum **fietsvakantie** (férias de bicicleta). As escolas têm datas de férias por região (noord, midden, zuid).",
    [("Ze gaan met de caravan naar Frankrijk.","Vão de caravana para França.")])],
  review=["v-reizen","v-zomer","v-boeken"],
  cefr=C, exs=[
    MA([("vakantie","férias"),("bestemming","destino"),("strand","praia"),("camping","campismo"),("buitenland","estrangeiro")], "Férias.", ["v-vakantie","v-bestemming","v-strand","v-camping","v-buitenland"]),
    TR("pt-nl","Vamos de férias em agosto.", ["We gaan in augustus op vakantie","In augustus gaan we op vakantie"], "op vakantie gaan.", ["v-vakantie"]),
    TR("nl-pt","Wat is je favoriete bestemming?", ["Qual é o teu destino (preferido|favorito)"], "bestemming.", ["v-bestemming"]),
    AR("strand","a praia","het", "«Het strand».", ["v-strand"]),
    FE(["We","gaan","naar","vakantie","in","juli."], 2, "op", "op vakantie gaan.", ["v-vakantie"]),
    LI("We liggen de hele dag op het strand.", ["We liggen de hele dag op het strand"], "Ficamos o dia todo deitados na praia.", "op het strand.", ["v-strand"]),
    FB("Ik werk in Nederland, maar ik kom uit het ___.", ["buitenland"], "estrangeiro.", ["v-buitenland"], choices=["buitenland","strand","camping"], tr="Trabalho nos Países Baixos, mas venho do estrangeiro."),
    DL([("Colega","Waar ga je deze zomer naartoe?","Para onde vais este verão?"),("Você","")], ["*Naar Portugal, naar het strand in de Algarve.","In augustus.|Responde a «quando».","Met de trein.|Responde a «como»."], "Destino.", ["v-bestemming"]),
    WO("Reservamos um parque de campismo junto ao mar.", ["We","boeken","een","camping","aan","zee"], "aan zee.", ["v-camping"]),
    TR("pt-nl","Viajo muitas vezes para o estrangeiro.", ["Ik reis vaak naar het buitenland","Ik ga vaak naar het buitenland"], "naar het buitenland.", ["v-buitenland"]),
  ], diff=2, mins=5)

L(5, "Uma viagem completa", "Revisão: reservar, viajar e ficar no hotel.",
  ["Planear e contar uma viagem"],
  ex=[("Ik heb een vlucht naar Porto en een hotel aan het strand geboekt.","Marquei um voo para o Porto e um hotel junto à praia.")],
  review=["v-boeken","v-hotel","v-vlucht","v-koffer","v-receptie","v-vakantie","v-bestemming","v-inbegrepen"],
  cefr=C, exs=[
    MA([("boeken","reservar"),("inchecken","fazer check-in"),("uitchecken","fazer check-out"),("vertrekken","partir")], "Verbos de viagem.", ["v-boeken","v-inchecken-hotel","v-uitchecken","v-vertrekken"]),
    TR("pt-nl","Marquei um voo para Lisboa.", ["Ik heb een vlucht naar Lissabon geboekt"], "Particípio: geboekt.", ["v-vlucht","v-boeken"]),
    TR("nl-pt","Is het ontbijt bij de prijs inbegrepen?", ["O pequeno-almoço está incluído no preço"], "inbegrepen.", ["v-inbegrepen"]),
    FE(["Ik","ga","op","vakantie","met","de","vliegtuig."], 5, "het", "het vliegtuig.", ["v-vlucht"]),
    LI("Ik heb mijn koffer al gepakt.", ["Ik heb mijn koffer al gepakt"], "Já fiz a mala.", "koffer pakken = fazer a mala.", ["v-koffer"]),
    CO("text","As férias da família Visser", "De familie Visser gaat in juli twee weken op vakantie naar Spanje. Ze hebben een appartement aan het strand geboekt. Ze vliegen vanaf Eindhoven. Het ontbijt is niet inbegrepen, dus ze doen eerst boodschappen. De kinderen willen elke dag naar het strand.",
       [("Para onde vão?", ["*Espanha","Portugal","França"]),("De onde partem?", ["*Eindhoven","Schiphol","Roterdão"]),("O pequeno-almoço está incluído?", ["*Não","Sim","Só ao fim de semana"])],
       "vliegen vanaf = voar a partir de.", ["v-vakantie","v-inbegrepen"]),
    DL([("Receção","Hoe was uw verblijf?","Como foi a sua estadia?"),("Cliente","")], ["*Heel fijn, dank u wel! Ik wil graag uitchecken.","Ik heb gereserveerd.|Já está no fim da estadia.","Ik ben een overnachting.|Não faz sentido."], "Check-out.", ["v-uitchecken"]),
    WO("No próximo ano quero ir para Itália.", ["Volgend","jaar","wil","ik","naar","Italië"], "Inversão.", ["v-bestemming"]),
    FB("Mijn ___ is te zwaar: meer dan 23 kilo!", ["koffer"], "mala.", ["v-koffer"], choices=["koffer","gate","receptie"], tr="A minha mala é pesada demais: mais de 23 quilos!"),
    SW("Conte os seus planos para as próximas férias (destino, transporte, alojamento).", ["Ik ga in [juli|augustus] op vakantie naar [Portugal|Spanje|Italië](.) Ik ga met het vliegtuig en ik heb een hotel geboekt"],
       ["Destino com «naar»","Transporte («met de trein / het vliegtuig»)","Alojamento («een hotel / een camping»)"], 12, "Modelo: «In augustus ga ik op vakantie naar Portugal. Ik ga met het vliegtuig en ik heb een hotel aan het strand geboekt.»", ["v-vakantie"]),
  ], diff=3, mins=7)

W()
