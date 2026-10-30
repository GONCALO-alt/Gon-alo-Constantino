import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u05")
C = "B1-B2"

L(1, "Fazer uma proposta", "Wij stellen voor om… Wat zou u ervan vinden als…?",
  ["Apresentar propostas de forma diplomática"],
  vocab=[V("v-onderhandelen","onderhandelen","negociar","verb"), V("v-bod","bod","oferta (licitação)","noun","het"),
         V("v-wat-zou-u-ervan-vinden","wat zou u ervan vinden als…?","o que acharia se…?","expression")],
  ex=[("We moeten nog onderhandelen over de prijs.","Ainda temos de negociar o preço."),("We doen u een bod van 300.000 euro.","Fazemos-lhe uma oferta de 300 000 euros."),("Wat zou u ervan vinden als we de levertijd verkorten?","O que acharia se encurtássemos o prazo de entrega?"),("We willen u graag tegemoetkomen.","Gostaríamos de ir ao seu encontro.")],
  gram=[G("g-hypothetisch-voorstel","Propor com o condicional","Propostas diplomáticas usam o passado/condicional: *Wat zou u ervan vinden als we… **verkortten**?* (passado depois de *als* hipotético) ou *Zou het mogelijk zijn om…?* Mais direto: *Wij stellen voor om…*",
    [("Zou het mogelijk zijn om in termijnen te betalen?","Seria possível pagar em prestações?")])],
  review=["v-tegemoetkomen","v-voorstellen-idee","v-prijs","v-compromis"],
  cefr=C, exs=[
    MA([("onderhandelen","negociar"),("bod","oferta"),("wat zou u ervan vinden als…?","o que acharia se…?"),("tegemoetkomen","ir ao encontro")], "Negociar.", ["v-onderhandelen","v-bod","v-wat-zou-u-ervan-vinden","v-tegemoetkomen"]),
    TR("pt-nl","Ainda temos de negociar o preço.", ["We moeten nog over de prijs onderhandelen","We moeten nog onderhandelen over de prijs","Wij moeten nog over de prijs onderhandelen"], "onderhandelen over.", ["v-onderhandelen"]),
    TR("pt-nl","Seria possível pagar em prestações?", ["Zou het mogelijk zijn om in termijnen te betalen"], "Zou het mogelijk zijn om … te.", []),
    TR("nl-pt","We willen u graag tegemoetkomen.", ["Gostaríamos de ir ao seu encontro","Queremos ir ao seu encontro"], "tegemoetkomen.", ["v-tegemoetkomen"]),
    AR("bod","a oferta","het", "Het bod.", ["v-bod"]),
    WO("O que acharia se encurtássemos o prazo?", ["Wat","zou","u","ervan","vinden","als","we","de","termijn","verkortten?"], "als + passado hipotético.", ["v-wat-zou-u-ervan-vinden"]),
    FE(["We","onderhandelen","van","de","prijs."], 2, "over", "onderhandelen over.", ["v-onderhandelen"]),
    MC("Na compra de casa nos Países Baixos, «een bod doen» é…", ["*fazer uma oferta de compra ao vendedor","pagar logo|Não.","pedir um empréstimo|Não."], "Mercado imobiliário.", ["v-bod"]),
    LI("Wij stellen voor om de prijs met vijf procent te verlagen.", ["Wij stellen voor om de prijs met vijf procent te verlagen","We stellen voor om de prijs met vijf procent te verlagen"], "Propomos baixar o preço em cinco por cento.", "voorstellen om … te.", ["v-voorstellen-idee"]),
    FB("We hebben een ___ gedaan op het huis.", ["bod"], "Oferta.", ["v-bod"], choices=["bod","prijs","bieden"], tr="Fizemos uma oferta pela casa."),
  ], diff=5, mins=7)

L(2, "Ceder e pedir contrapartidas", "Als u… dan… Daar staat tegenover dat…",
  ["Fazer concessões condicionais"],
  vocab=[V("v-concessie","concessie","concessão","noun","de"), V("v-daar-staat-tegenover","daar staat tegenover dat","em contrapartida","expression"),
         V("v-op-voorwaarde-dat","op voorwaarde dat","com a condição de que","expression"), V("v-akkoord-gaan","akkoord gaan met","aceitar|concordar com","expression")],
  ex=[("Als u vandaag tekent, geven we tien procent korting.","Se assinar hoje, damos dez por cento de desconto."),("Daar staat tegenover dat de levering later is.","Em contrapartida, a entrega é mais tarde."),("Op voorwaarde dat u contant betaalt.","Com a condição de que pague em dinheiro."),("We gaan akkoord met dit voorstel.","Aceitamos esta proposta.")],
  review=["v-als-conj","v-korting","v-akkoord"],
  cefr=C, exs=[
    MA([("concessie","concessão"),("daar staat tegenover dat","em contrapartida"),("op voorwaarde dat","com a condição de"),("akkoord gaan met","aceitar")], "Concessões.", ["v-concessie","v-daar-staat-tegenover","v-op-voorwaarde-dat","v-akkoord-gaan"]),
    WO("Se assinar hoje, damos dez por cento de desconto.", ["Als","u","vandaag","tekent,","geven","we","tien","procent","korting"], "Verbo, verbo.", ["v-als-conj"]),
    TR("pt-nl","Aceitamos esta proposta.", ["We gaan akkoord met dit voorstel","Wij gaan akkoord met dit voorstel"], "akkoord gaan met.", ["v-akkoord-gaan"]),
    TR("nl-pt","Daar staat tegenover dat de levering later is.", ["Em contrapartida, a entrega é mais tarde","Em compensação, a entrega é mais tarde"], "daar staat tegenover.", ["v-daar-staat-tegenover"]),
    WO("Com a condição de que pague em dinheiro.", ["Op","voorwaarde","dat","u","contant","betaalt"], "Verbo no fim.", ["v-op-voorwaarde-dat"]),
    FE(["We","gaan","akkoord","van","het","voorstel."], 3, "met", "akkoord gaan met.", ["v-akkoord-gaan"]),
    AR("concessie","a concessão","de", "De concessie.", ["v-concessie"]),
    MC("Uma boa concessão numa negociação é…", ["*condicional: «als u X doet, doen wij Y»","gratuita e imediata|Perde poder.","nunca ceder|Bloqueia."], "Troca.", ["v-concessie"]),
    LI("We kunnen u tegemoetkomen, op voorwaarde dat u een jaar tekent.", ["We kunnen u tegemoetkomen(,) op voorwaarde dat u een jaar tekent"], "Podemos ir ao seu encontro, com a condição de assinar por um ano.", "op voorwaarde dat.", ["v-op-voorwaarde-dat"]),
    DL([("Klant","Kunt u iets aan de prijs doen?","Pode fazer algo quanto ao preço?"),("Verkoper","")], ["*Als u twee jaar tekent, geven we vijf procent korting.","Nee.|Fecha a negociação.","Ja, alles is gratis.|Irrealista."], "Concessão condicional.", ["v-concessie"]),
  ], diff=5, mins=7)

L(3, "Recusar com firmeza e educação", "Daar kunnen we helaas niet mee akkoord gaan.",
  ["Recusar propostas sem fechar a porta"],
  vocab=[V("v-haalbaar","haalbaar","viável","adjective"), V("v-grens-bereikt","onze grens is bereikt","chegámos ao nosso limite","expression"),
         V("v-onacceptabel","onacceptabel","inaceitável","adjective")],
  ex=[("Daar kunnen we helaas niet mee akkoord gaan.","Infelizmente não podemos aceitar isso."),("Dat is voor ons niet haalbaar.","Isso não é viável para nós."),("Hier is onze grens bereikt.","Aqui chegámos ao nosso limite."),("Heeft u een alternatief?","Tem uma alternativa?")],
  review=["v-alternatief","v-helaas","v-jammer","v-oneens"],
  cefr=C, exs=[
    MA([("haalbaar","viável"),("onze grens is bereikt","chegámos ao limite"),("onacceptabel","inaceitável"),("alternatief","alternativa")], "Recusar.", ["v-haalbaar","v-grens-bereikt","v-onacceptabel","v-alternatief"]),
    TR("pt-nl","Isso não é viável para nós.", ["Dat is voor ons niet haalbaar","Dat is niet haalbaar voor ons"], "haalbaar.", ["v-haalbaar"]),
    TR("pt-nl","Tem uma alternativa?", ["Heeft u een alternatief","Hebt u een alternatief"], "het alternatief.", ["v-alternatief"]),
    TR("nl-pt","Daar kunnen we helaas niet mee akkoord gaan.", ["Infelizmente não podemos aceitar isso","Infelizmente não podemos concordar com isso"], "daar … mee.", ["v-akkoord-gaan"]),
    AR("alternatief","a alternativa","het", "Het alternatief.", ["v-alternatief"]),
    MC("Qual recusa mantém a negociação aberta?", ["*Dat is voor ons niet haalbaar, maar misschien hebben we een alternatief.","Dat is belachelijk.|Fecha a porta.","Nee, nooit.|Fecha a porta."], "Recusar + alternativa.", ["v-alternatief"]),
    FE(["Dat","is","voor","ons","niet","haalbare."], 5, "haalbaar", "Predicativo: sem -e.", ["v-haalbaar"]),
    LI("Een prijsverhoging van twintig procent is onacceptabel.", ["Een prijsverhoging van twintig procent is onacceptabel"], "Um aumento de preço de vinte por cento é inaceitável.", "onacceptabel.", ["v-onacceptabel"]),
    WO("Aqui chegámos ao nosso limite.", ["Hier","is","onze","grens","bereikt"], "Passiva de estado.", ["v-grens-bereikt"]),
    FB("Zo'n korte deadline is niet ___.", ["haalbaar"], "Viável.", ["v-haalbaar"], choices=["haalbaar","onacceptabel","alternatief"], tr="Um prazo tão curto não é viável."),
  ], diff=5, mins=6)

L(4, "Chegar a acordo", "Dan hebben we een deal. Laten we het op papier zetten.",
  ["Fechar um acordo e confirmar os termos"],
  vocab=[V("v-overeenkomst","overeenkomst","acordo|contrato","noun","de"), V("v-op-papier-zetten","op papier zetten","pôr por escrito","expression"),
         V("v-bevestigen-schriftelijk","schriftelijk bevestigen","confirmar por escrito","expression"), V("v-deal","deal","negócio fechado","noun","de")],
  ex=[("Dan hebben we een deal.","Então temos negócio."),("Laten we het op papier zetten.","Vamos pôr isto por escrito."),("Ik bevestig het morgen schriftelijk.","Confirmo amanhã por escrito."),("De overeenkomst gaat in op 1 januari.","O acordo entra em vigor a 1 de janeiro.")],
  review=["v-akkoord","v-huurcontract","v-bevestigen"],
  cefr=C, exs=[
    MA([("overeenkomst","acordo"),("op papier zetten","pôr por escrito"),("schriftelijk bevestigen","confirmar por escrito"),("deal","negócio")], "Acordo.", ["v-overeenkomst","v-op-papier-zetten","v-bevestigen-schriftelijk","v-deal"]),
    TR("pt-nl","Vamos pôr isto por escrito.", ["Laten we het op papier zetten"], "op papier zetten.", ["v-op-papier-zetten"]),
    TR("pt-nl","Confirmo amanhã por escrito.", ["Ik bevestig het morgen schriftelijk","Morgen bevestig ik het schriftelijk"], "schriftelijk.", ["v-bevestigen-schriftelijk"]),
    TR("nl-pt","De overeenkomst gaat in op 1 januari.", ["O acordo entra em vigor a 1 de janeiro","O contrato começa a 1 de janeiro"], "ingaan.", ["v-overeenkomst"]),
    AR("overeenkomst","o acordo","de", "De overeenkomst.", ["v-overeenkomst"]),
    FE(["De","overeenkomst","gaat","op","1","januari","aan."], 6, "in", "ingaan = entrar em vigor.", ["v-overeenkomst"]),
    CO("dialogue","Een huurprijs afspreken", "Verhuurder: De huur is 1.400 euro per maand.\nCarlos: Dat is boven ons budget. Zou 1.250 mogelijk zijn als we een contract voor twee jaar tekenen?\nVerhuurder: 1.250 is te laag. Daar staat tegenover dat een lang contract voor mij zekerheid geeft. Ik kan naar 1.325.\nCarlos: Op voorwaarde dat de kosten voor de tuin inbegrepen zijn?\nVerhuurder: Akkoord. Dan hebben we een deal.\nCarlos: Prima. Kunt u het schriftelijk bevestigen?",
       [("Qual foi o preço final?", ["*1325 euros","1250 euros","1400 euros"]),("O que ofereceu o Carlos em troca?", ["*Um contrato de dois anos","Pagar um ano adiantado","Pintar a casa"]),("Que condição extra pediu?", ["*Custos do jardim incluídos","Lugar de garagem","Mobília nova"])],
       "zekerheid = segurança.", ["v-deal","v-op-voorwaarde-dat"]),
    LI("Dan hebben we een deal!", ["Dan hebben we een deal"], "Então temos negócio!", "deal.", ["v-deal"]),
    SW("Escreva um e-mail curto a confirmar o acordo do diálogo (renda, duração, jardim incluído).", ["Geachte heer/mevrouw,\nHierbij bevestig ik onze afspraak: de huur is 1.325 euro per maand, voor een periode van twee jaar, inclusief de kosten voor de tuin.\nMet vriendelijke groet,\nCarlos Mendes"], ["**Hierbij bevestig ik**", "Três termos do acordo", "Registo formal"], 25, "Confirmação escrita.", ["v-bevestigen-schriftelijk","v-overeenkomst"]),
  ], diff=5, mins=8)

L(5, "Negociação no dia a dia", "No mercado, com o senhorio, com colegas.",
  ["Aplicar técnicas de negociação em situações quotidianas"],
  vocab=[V("v-afdingen","afdingen","regatear","verb"), V("v-ruilen-dienst","een dienst ruilen","trocar um turno","expression"),
         V("v-redelijk","redelijk","razoável","adjective"), V("v-in-het-midden","elkaar in het midden treffen","encontrar-se a meio caminho","expression")],
  ex=[("Op de markt kun je soms afdingen.","No mercado às vezes podes regatear."),("Kunnen we een dienst ruilen?","Podemos trocar um turno?"),("Dat lijkt me een redelijke prijs.","Parece-me um preço razoável."),("Laten we elkaar in het midden treffen.","Vamos encontrar-nos a meio caminho.")],
  review=["v-onderhandelen","v-compromis","v-bod"],
  cefr=C, exs=[
    MA([("afdingen","regatear"),("een dienst ruilen","trocar um turno"),("redelijk","razoável"),("elkaar in het midden treffen","meio caminho")], "Dia a dia.", ["v-afdingen","v-ruilen-dienst","v-redelijk","v-in-het-midden"]),
    TR("pt-nl","Podemos trocar um turno?", ["Kunnen we een dienst ruilen","Kunnen wij een dienst ruilen","Zullen we een dienst ruilen"], "dienst ruilen.", ["v-ruilen-dienst"]),
    TR("pt-nl","Parece-me um preço razoável.", ["Dat lijkt me een redelijke prijs","Dat lijkt mij een redelijke prijs"], "redelijke.", ["v-redelijk"]),
    TR("nl-pt","Laten we elkaar in het midden treffen.", ["Vamos encontrar-nos a meio caminho","Vamos dividir a diferença"], "Expressão.", ["v-in-het-midden"]),
    MC("Nos Países Baixos regatear é comum…", ["*em mercados de rua e na compra de usados (Marktplaats)","em supermercados|Não.","na farmácia|Não."], "Contexto.", ["v-afdingen"]),
    DL([("Verkoper (Marktplaats)","De fiets kost 150 euro.","A bicicleta custa 150 euros."),("Koper","")], ["*Ik zie wat roest. Zou 120 redelijk zijn?","Ik betaal 10 euro.|Oferta irrealista.","Oké, ik geef 200.|Paga mais do que o pedido."], "Oferta razoável com argumento.", ["v-afdingen","v-redelijk"]),
    FE(["Dat","is","een","redelijk","prijs."], 3, "redelijke", "de prijs → een redelijke.", ["v-redelijk"]),
    LI("Zullen we elkaar in het midden treffen? Honderddertig euro.", ["Zullen we elkaar in het midden treffen(?) Honderddertig euro","Zullen we elkaar in het midden treffen(?) 130 euro"], "Encontramo-nos a meio caminho? Cento e trinta euros.", "Compromisso.", ["v-in-het-midden"]),
    FB("Kun je met mij van ___ ruilen? Ik moet zaterdag naar een bruiloft.", ["dienst"], "Turno.", ["v-ruilen-dienst"], choices=["dienst","prijs","bod"], tr="Podes trocar de turno comigo? No sábado tenho de ir a um casamento."),
    SW("Peça a um colega para trocar o turno de sábado e ofereça uma contrapartida.", ["Hoi Tom, zou je zaterdag met mij van dienst willen ruilen? Ik moet naar een bruiloft. Als jij zaterdag werkt, neem ik jouw dienst op zondag over."], ["Pedido educado (**zou je … willen**)", "Razão", "Contrapartida com **als … dan/inversão**"], 25, "Negociação informal.", ["v-ruilen-dienst"]),
  ], diff=5, mins=7)

W()
