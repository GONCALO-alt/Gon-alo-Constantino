import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u13")
C = "A2"
# Lições extra (10–15): bagagem de mão, voos atrasados, albergues, campismo, check-out e uma viagem.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Bagagem de mão", "Alleen handbagage.",
  ["Falar da bagagem num voo"],
  vocab=[N("v-handbagage","handbagage","bagagem de mão","de")],
  ex=[("Ik reis alleen met handbagage.","Viajo só com bagagem de mão."),("Mijn koffer is te zwaar.","A minha mala é pesada demais.")],
  review=["v-koffer","v-bagage","v-vliegveld"],
  cefr=C, exs=[
    MA([("handbagage","bagagem de mão"),("koffer","mala"),("bagage","bagagem"),("vliegveld","aeroporto")], "Bagagem.", ["v-handbagage","v-koffer","v-bagage","v-vliegveld"]),
    TR("pt-nl","Viajo só com bagagem de mão.", ["Ik reis alleen met handbagage(.)"], "handbagage.", ["v-handbagage"]),
    TR("pt-nl","A minha mala é pesada demais.", ["Mijn koffer is te zwaar(.)"], "te zwaar.", ["v-koffer","v-zwaar"]),
    FB("Vloeistoffen in je ___ mogen maximaal 100 ml zijn.", ["handbagage"], "Regra comum (confirma na companhia).", ["v-handbagage"], choices=["handbagage","koffer","vlucht"], tr="Os líquidos na bagagem de mão podem ter no máximo 100 ml."),
    DL([("Grondstewardess","Heeft u ruimbagage?","Tem bagagem de porão?"),("Jij","","")], ["*Nee, alleen handbagage.","Ja, ik ben koffer.|Não.","Gate.|Não."], "Responder.", ["v-handbagage"]),
    LI("Uw koffer weegt vierentwintig kilo.", ["Uw koffer weegt vierentwintig kilo(.)","Uw koffer weegt 24 kilo(.)"], "A sua mala pesa 24 quilos.", "Ouvir.", ["v-koffer"]),
    MC("As regras de bagagem…", ["*mudam entre companhias aéreas — confirma sempre","são iguais em todo o mundo|Não.","não existem|Existem."], "Verificar.", ["v-handbagage"]),
    AR("handbagage", "bagagem de mão", "de", "de bagage.", ["v-handbagage"]),
  ], diff=2, mins=4)

L(11, "Voo atrasado", "Mijn vlucht is vertraagd.",
  ["Perceber avisos de atraso e mudança de porta"],
  vocab=[X("v-vlucht-vertraagd","vertraagd","atrasado (voo, comboio)","adjective")],
  ex=[("Vlucht KL1693 naar Lissabon is vertraagd.","O voo KL1693 para Lisboa está atrasado."),("De gate is gewijzigd: nu gate D7.","A porta mudou: agora porta D7.")],
  review=["v-vlucht","v-gate","v-instapkaart","v-vertraging"],
  cefr=C, exs=[
    MA([("vertraagd","atrasado"),("vlucht","voo"),("gate","porta de embarque"),("instapkaart","cartão de embarque")], "Aeroporto.", ["v-vlucht-vertraagd","v-vlucht","v-gate","v-instapkaart"]),
    MC("No painel: «Geannuleerd». O voo…", ["*foi cancelado","está a horas|Não.","está a embarcar|Isso é «instappen»."], "Painel.", ["v-vlucht"]),
    TR("pt-nl","O meu voo está atrasado.", ["Mijn vlucht is vertraagd(.)","Mijn vlucht heeft vertraging(.)"], "vertraagd.", ["v-vlucht-vertraagd"]),
    TR("pt-nl","Qual é a porta?", ["Welke gate is het?","Wat is de gate?"], "gate.", ["v-gate"]),
    FB("Toon uw ___ bij de gate.", ["instapkaart"], "Cartão de embarque.", ["v-instapkaart"], choices=["instapkaart","handbagage","koffer"], tr="Mostre o cartão de embarque na porta."),
    LI("Passagiers voor vlucht naar Porto: de gate is gewijzigd.", ["Passagiers voor vlucht naar Porto(:) de gate is gewijzigd(.)","Passagiers voor de vlucht naar Porto(,) de gate is gewijzigd(.)"], "Passageiros do voo para o Porto: a porta mudou.", "Aviso.", ["v-gate"]),
    DL([("Medewerker","Uw vlucht is twee uur vertraagd.","O seu voo está duas horas atrasado."),("Jij","","")], ["*O nee! Krijg ik een voucher voor eten?","Ik ben vertraagd.|Não.","Instapkaart.|Não."], "Reagir.", ["v-vlucht-vertraagd"]),
    WO("O voo está atrasado.", ["De","vlucht","is","vertraagd."], "Ordem.", ["v-vlucht-vertraagd"]),
  ], diff=2, mins=4)

L(12, "Dormir barato", "Een jeugdherberg.",
  ["Reservar um alojamento simples"],
  vocab=[N("v-jeugdherberg","jeugdherberg","albergue da juventude","de")],
  ex=[("We slapen in een jeugdherberg; dat is goedkoop.","Dormimos num albergue; é barato."),("Is het ontbijt inbegrepen?","O pequeno-almoço está incluído?")],
  review=["v-boeken","v-inbegrepen","v-nacht-hotel","v-goedkoop"],
  cefr=C, exs=[
    MA([("jeugdherberg","albergue"),("boeken","reservar"),("inbegrepen","incluído"),("overnachting","noite (estadia)")], "Alojamento.", ["v-jeugdherberg","v-boeken","v-inbegrepen","v-nacht-hotel"]),
    TR("pt-nl","O pequeno-almoço está incluído?", ["Is het ontbijt inbegrepen?","Is ontbijt inbegrepen?"], "inbegrepen.", ["v-inbegrepen"]),
    TR("pt-nl","Reservo duas noites.", ["Ik boek twee nachten(.)","Ik boek twee overnachtingen(.)"], "boeken.", ["v-boeken"]),
    FB("Een ___ is goedkoper dan een hotel.", ["jeugdherberg"], "Albergue.", ["v-jeugdherberg"], choices=["jeugdherberg","gate","koffer"], tr="Um albergue é mais barato do que um hotel."),
    DL([("Receptie","Een bed in een slaapzaal of een eigen kamer?","Uma cama num dormitório ou um quarto só para si?"),("Jij","","")], ["*Een eigen kamer, graag. Wat kost dat per nacht?","Ja.|Pergunta de escolha.","Ik ben bed.|Não."], "Escolher.", ["v-nacht-hotel"]),
    LI("De prijs is per persoon per nacht.", ["De prijs is per persoon per nacht(.)"], "O preço é por pessoa por noite.", "Ouvir.", ["v-nacht-hotel"]),
    MC("«Slaapzaal» é…", ["*um dormitório partilhado","um quarto de casal|Não.","uma sala de jantar|Não."], "Vocabulário.", ["v-jeugdherberg"]),
    AR("jeugdherberg", "albergue", "de", "de herberg.", ["v-jeugdherberg"]),
  ], diff=2, mins=4)

L(13, "Acampar", "Met de tent op de camping.",
  ["Falar de férias no parque de campismo"],
  vocab=[N("v-tent","tent","tenda","de","tenten")],
  ex=[("We zetten de tent op bij het meer.","Montamos a tenda junto ao lago."),("Kamperen is populair in Nederland.","Acampar é popular nos Países Baixos.")],
  review=["v-camping","v-vakantie","v-buitenland"],
  cefr=C, exs=[
    MA([("tent","tenda"),("camping","parque de campismo"),("vakantie","férias"),("buitenland","estrangeiro")], "Campismo.", ["v-tent","v-camping","v-vakantie","v-buitenland"]),
    TR("pt-nl","Montamos a tenda.", ["We zetten de tent op(.)","Wij zetten de tent op(.)"], "opzetten.", ["v-tent"]),
    TR("pt-nl","Vamos de férias para o estrangeiro.", ["We gaan op vakantie naar het buitenland(.)"], "buitenland.", ["v-buitenland"]),
    FB("Op de ___ slapen we in een tent.", ["camping"], "Parque.", ["v-camping"], choices=["camping","gate","receptie"], tr="No parque de campismo dormimos numa tenda."),
    MC("Qual é a ordem correta?", ["*We zetten de tent vandaag op.","We opzetten de tent vandaag.|Separável."], "Separável.", ["v-tent"]),
    LI("Het regent en de tent is nat.", ["Het regent en de tent is nat(.)"], "Está a chover e a tenda está molhada.", "Ouvir.", ["v-tent"]),
    DL([("Campingbeheerder","Heeft u een tent of een caravan?","Tem tenda ou caravana?"),("Jij","","")], ["*Een kleine tent, voor twee personen.","Ja.|Pergunta de escolha.","Ik ben camping.|Não."], "Responder.", ["v-tent"]),
    AR("tent", "tenda", "de", "de tent.", ["v-tent"]),
  ], diff=2, mins=4)

L(14, "Sair do hotel", "Uitchecken.",
  ["Fazer o check-out e resolver pequenos problemas"],
  vocab=[],
  ex=[("Hoe laat moeten we uitchecken?","A que horas temos de fazer check-out?"),("Kunnen we onze koffers hier laten staan?","Podemos deixar as malas aqui?")],
  review=["v-receptie","v-sleutelkaart","v-uitchecken","v-handdoek","v-wifi"],
  cefr=C, exs=[
    MA([("receptie","receção"),("sleutelkaart","cartão-chave"),("handdoek","toalha"),("wifi","wi-fi")], "Hotel.", ["v-receptie","v-sleutelkaart","v-handdoek","v-wifi"]),
    TR("pt-nl","A que horas é o check-out?", ["Hoe laat moeten we uitchecken?","Hoe laat is het uitchecken?"], "uitchecken.", ["v-uitchecken"]),
    TR("pt-nl","Podemos deixar as malas aqui?", ["Kunnen we onze koffers hier laten staan?","Mogen we de koffers hier laten staan?"], "laten staan.", ["v-koffer"]),
    FB("De wifi doet het niet in mijn kamer. Kan de ___ helpen?", ["receptie"], "Receção.", ["v-receptie"], choices=["receptie","handdoek","sleutelkaart"], tr="O wi-fi não funciona no quarto. A receção pode ajudar?"),
    DL([("Receptionist","Bent u tevreden over uw verblijf?","Ficou satisfeito com a estadia?"),("Jij","","")], ["*Heel fijn, dank u! Hier is de sleutelkaart.","Ik ben verblijf.|Não.","Handdoek.|Não."], "Despedir-se.", ["v-sleutelkaart"]),
    LI("Er zijn geen schone handdoeken in de kamer.", ["Er zijn geen schone handdoeken in de kamer(.)"], "Não há toalhas limpas no quarto.", "Queixa.", ["v-handdoek"]),
    MC("«Kamer 214 heeft de minibar gebruikt» na fatura significa…", ["*vais pagar o que tiraste do minibar","ganhas um desconto|Não.","o quarto está fechado|Não."], "Fatura.", ["v-receptie"]),
    WO("Fazemos check-out.", ["We","checken","uit."], "Separável.", ["v-uitchecken"]),
  ], diff=2, mins=4)

L(15, "Prática: uma viagem a Portugal", "Op vakantie naar huis.",
  ["Planear e contar uma viagem"],
  vocab=[],
  ex=[("(Fictício) Vrijdag vlieg ik met alleen handbagage naar Porto. Mijn vlucht vertrekt om 7.05 uur van Schiphol.","Na sexta voo só com bagagem de mão para o Porto…")],
  review=["v-handbagage","v-vlucht-vertraagd","v-jeugdherberg","v-tent","v-bestemming","v-vliegveld"],
  cefr=C, exs=[
    MC("(Fictício) «Mijn vlucht vertrekt om 7.05 uur.» A que horas tens de estar no aeroporto (aprox.)?", ["*cerca de duas horas antes","à hora exata|Não dá.","ao meio-dia|Tarde demais."], "Bom senso.", ["v-vliegveld"]),
    MC("(Fictício) «Mijn bestemming is Faro.» Para onde vai?", ["*Faro","Porto|Não.","Schiphol|É a partida."], "Compreensão.", ["v-bestemming"]),
    TR("pt-nl","O meu destino é Lisboa.", ["Mijn bestemming is Lissabon(.)"], "bestemming.", ["v-bestemming"]),
    TR("pt-nl","O voo parte às sete.", ["De vlucht vertrekt om zeven uur(.)"], "vertrekken.", ["v-vlucht"]),
    LI("Neem je paspoort of identiteitskaart mee!", ["Neem je paspoort of identiteitskaart mee(!)"], "Leva o passaporte ou o cartão de cidadão!", "Ouvir.", ["v-paspoort"]),
    BS("Viajo só com bagagem de mão.", ["Ik","reis","alleen","met","handbagage."], ["Ik reis alleen met handbagage."], "Ordem.", ["v-handbagage"]),
    DL([("Collega","Waar ga je op vakantie?","Para onde vais de férias?"),("Jij","","")], ["*Naar Portugal, naar mijn familie in het noorden.","Gate D7.|Não.","Ik ben vakantie.|Não."], "Responder.", ["v-vakantie"]),
    SW("Escreva o plano de uma viagem (destino, transporte, alojamento, bagagem).", ["Ik ga in augustus naar de Algarve. Ik vlieg vanaf Eindhoven met alleen handbagage. Ik slaap in een jeugdherberg in Lagos. Daarna ga ik twee dagen kamperen."], ["Destino","Transporte","Alojamento"], 25, "Planear.", ["v-bestemming"]),
  ], diff=2, mins=5)

W()
