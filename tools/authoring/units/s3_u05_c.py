import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u05")
C = "A2"
# Lições extra (10–15): esplanada, prato do dia, comida para levar, reclamar, dividir a conta.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Na esplanada", "Op het terras.",
  ["Sentar-te numa esplanada e pedir a ementa"],
  vocab=[N("v-terras","terras","esplanada","het","terrassen"), N("v-menukaart","menukaart","ementa","de","menukaarten")],
  ex=[("Zullen we op het terras gaan zitten?","Sentamo-nos na esplanada?"),("Mag ik de menukaart, alstublieft?","Pode trazer-me a ementa, por favor?")],
  review=["v-buiten","v-ober","v-bestellen"],
  cefr=C, exs=[
    MA([("terras","esplanada"),("menukaart","ementa"),("ober","empregado"),("buiten","lá fora")], "Esplanada.", ["v-terras","v-menukaart","v-ober","v-buiten"]),
    AR("terras", "esplanada", "het", "het terras.", ["v-terras"]),
    TR("pt-nl","Sentamo-nos na esplanada?", ["Zullen we op het terras gaan zitten?","Zullen we op het terras zitten?"], "op het terras.", ["v-terras"]),
    TR("pt-nl","Pode trazer-me a ementa?", ["Mag ik de menukaart?","Mag ik de menukaart(,) alstublieft?","Mag ik de kaart(,) alstublieft?"], "menukaart.", ["v-menukaart"]),
    FB("Het is mooi weer: we zitten ___.", ["buiten"], "Lá fora.", ["v-buiten"], choices=["buiten","binnen","terras"], tr="Está bom tempo: sentamo-nos lá fora."),
    DL([("Ober","Binnen of buiten?","Dentro ou fora?"),("Jij","","")], ["*Buiten graag, op het terras.","Ja.|Pergunta de escolha.","Ik ben terras.|Não."], "Escolher.", ["v-terras"]),
    LI("Is er nog een tafel vrij op het terras?", ["Is er nog een tafel vrij op het terras(?)"], "Ainda há uma mesa livre na esplanada?", "Ouvir.", ["v-terras"]),
    WO("Pode trazer a ementa?", ["Mag","ik","de","menukaart?"], "Ordem.", ["v-menukaart"]),
  ], diff=2, mins=4)

L(11, "O prato do dia", "Wat is de dagschotel?",
  ["Perguntar pelo prato do dia e pedir recomendações"],
  vocab=[N("v-dagschotel","dagschotel","prato do dia","de")],
  ex=[("Wat is de dagschotel vandaag?","Qual é o prato do dia hoje?"),("Wat kunt u aanbevelen?","O que recomenda?")],
  review=["v-hoofdgerecht","v-voorgerecht","v-nagerecht","v-saus"],
  cefr=C, exs=[
    MA([("dagschotel","prato do dia"),("voorgerecht","entrada"),("hoofdgerecht","prato principal"),("nagerecht","sobremesa")], "Pratos.", ["v-dagschotel","v-voorgerecht","v-hoofdgerecht","v-nagerecht"]),
    TR("pt-nl","Qual é o prato do dia?", ["Wat is de dagschotel?","Wat is de dagschotel vandaag?"], "dagschotel.", ["v-dagschotel"]),
    TR("pt-nl","Como prato principal quero peixe.", ["Als hoofdgerecht wil ik vis(.)","Als hoofdgerecht neem ik vis(.)"], "als.", ["v-hoofdgerecht"]),
    FB("Als ___ nemen we soep.", ["voorgerecht"], "Entrada.", ["v-voorgerecht"], choices=["voorgerecht","nagerecht","dagschotel"], tr="De entrada comemos sopa."),
    DL([("Ober","De dagschotel is vandaag kip met rijst.","O prato do dia hoje é frango com arroz."),("Jij","","")], ["*Lekker, die neem ik.","Ik ben dagschotel.|Não.","Nagerecht.|Não responde."], "Pedir.", ["v-dagschotel"]),
    LI("Wat kunt u ons aanbevelen?", ["Wat kunt u ons aanbevelen(?)"], "O que nos recomenda?", "Ouvir.", ["v-bestellen"]),
    MC("«Met saus apart» significa…", ["*com o molho à parte","sem molho|Não.","com dois molhos|Não."], "apart.", ["v-saus","v-apart"]),
    AR("dagschotel", "prato do dia", "de", "de schotel.", ["v-dagschotel"]),
  ], diff=2, mins=4)

L(12, "Comida para levar", "Afhalen of bezorgen?",
  ["Encomendar comida para levar"],
  vocab=[X("v-afhalen","afhalen","levantar (encomenda), take-away","verb")],
  ex=[("Ik wil graag een pizza afhalen.","Queria uma pizza para levar."),("Over twintig minuten kunt u het afhalen.","Pode levantar daqui a vinte minutos.")],
  review=["v-bestellen","v-op-naam-van"],
  cefr=C, exs=[
    MA([("afhalen","levantar / para levar"),("bestellen","encomendar"),("op naam van","em nome de"),("over twintig minuten","daqui a 20 minutos")], "Take-away.", ["v-afhalen","v-bestellen","v-op-naam-van","v-afhalen"]),
    MC("«Afhalen» é…", ["*ires tu buscar a comida","eles levam a tua casa|Isso é bezorgen.","comer no restaurante|Não."], "Diferença.", ["v-afhalen"]),
    TR("pt-nl","Queria uma pizza para levar.", ["Ik wil graag een pizza afhalen(.)","Ik wil een pizza afhalen(.)"], "afhalen.", ["v-afhalen"]),
    TR("pt-nl","Em nome de Silva.", ["Op naam van Silva(.)"], "op naam van.", ["v-op-naam-van"]),
    FB("Ik haal het eten om zeven uur ___.", ["af"], "Separável.", ["v-afhalen"], choices=["af","op","uit"], tr="Vou buscar a comida às sete."),
    DL([("Restaurant","Afhalen of bezorgen?","Para levantar ou entrega?"),("Jij","","")], ["*Afhalen, over een half uur.","Ja.|Pergunta de escolha.","Ik ben pizza.|Não."], "Escolher.", ["v-afhalen"]),
    LI("Uw bestelling staat klaar om af te halen.", ["Uw bestelling staat klaar om af te halen(.)"], "A sua encomenda está pronta para levantar.", "Ouvir.", ["v-afhalen"]),
    WO("Vou buscar a comida.", ["Ik","haal","het","eten","af."], "Separável.", ["v-afhalen"]),
  ], diff=2, mins=4)

L(13, "Reclamar com educação", "De soep is koud.",
  ["Dizer que algo não está bem no restaurante"],
  vocab=[],
  ex=[("Sorry, de soep is koud.","Desculpe, a sopa está fria."),("Dit heb ik niet besteld.","Isto não foi o que pedi.")],
  review=["v-bestellen","v-ober","v-allergisch"],
  cefr=C, exs=[
    MC("A sopa chegou fria. A forma mais educada:", ["*Sorry, mijn soep is helaas koud.","Bah, koud!|Rude.","Ik betaal niet.|Exagerado."], "Reclamar com educação.", ["v-ober"]),
    TR("pt-nl","Isto não foi o que pedi.", ["Dit heb ik niet besteld(.)","Ik heb dit niet besteld(.)"], "besteld.", ["v-bestellen"]),
    TR("pt-nl","A minha filha é alérgica a frutos secos.", ["Mijn dochter is allergisch voor noten(.)"], "allergisch voor.", ["v-allergisch"]),
    DL([("Ober","Is alles naar wens?","Está tudo a seu gosto?"),("Jij","","")], ["*Bijna: het vlees is nog een beetje rauw.","Ik ben wens.|Não.","Ja, slecht.|Contraditório."], "Reclamar.", ["v-ober"]),
    DL([("Ober","Excuses! Ik breng meteen een nieuwe.","Desculpe! Trago já outro."),("Jij","","")], ["*Dank u wel, geen probleem.","Dat is uw probleem.|Rude.","Ik ben nieuw.|Não."], "Aceitar.", ["v-geen-probleem"]),
    FB("Er zit ___ in, maar ik ben allergisch voor gluten.", ["gluten"], "Alergia.", ["v-allergisch"], choices=["gluten","saus","fooi"], tr="Tem glúten, mas sou alérgico ao glúten."),
    LI("Het spijt me, ik breng het terug naar de keuken.", ["Het spijt me(,) ik breng het terug naar de keuken(.)"], "Lamento, levo-o de volta à cozinha.", "Ouvir.", ["v-ober"]),
    MC("«Is alles naar wens?» pergunta…", ["*se está tudo a teu gosto","se queres pagar|Não.","se tens desejos de aniversário|Não."], "Expressão.", ["v-ober"]),
  ], diff=2, mins=4)

L(14, "Dividir a conta", "Apart betalen of een Tikkie?",
  ["Combinar como pagar em grupo"],
  vocab=[],
  ex=[("Mogen we apart betalen?","Podemos pagar separadamente?"),("Ik betaal en ik stuur jullie een Tikkie.","Eu pago e mando-vos um Tikkie.")],
  review=["v-rekening","v-apart","v-fooi","v-tikkie","v-het-klopt-zo"],
  cefr=C, exs=[
    MA([("rekening","conta"),("apart","separadamente"),("fooi","gorjeta"),("Tikkie","pedido de pagamento")], "Pagar.", ["v-rekening","v-apart","v-fooi","v-tikkie"]),
    MC("«Ik stuur je een Tikkie» significa…", ["*Mando-te um pedido de pagamento pela app","Dou-te uma gorjeta|Não.","Pago tudo por ti|Não."], "Cultura.", ["v-tikkie"]),
    TR("pt-nl","Podemos pagar separadamente?", ["Mogen we apart betalen?","Kunnen we apart betalen?"], "apart.", ["v-apart"]),
    TR("pt-nl","A conta, por favor.", ["De rekening(,) alstublieft(.)","Mag ik de rekening(,) alstublieft?"], "rekening.", ["v-rekening"]),
    FB("Hier zijn dertig euro. Het ___ zo.", ["klopt"], "Fique com o troco.", ["v-het-klopt-zo"], choices=["klopt","is","fooi"], tr="Aqui tem trinta euros. Fique com o troco."),
    MC("A gorjeta nos Países Baixos é…", ["*opcional; muitas pessoas arredondam ou deixam 5–10%","obrigatória de 20%|Não.","proibida|Não."], "Cultura.", ["v-fooi"]),
    LI("Zullen we de rekening delen?", ["Zullen we de rekening delen(?)"], "Dividimos a conta?", "Ouvir.", ["v-rekening"]),
    WO("Podemos pagar à parte?", ["Mogen","we","apart","betalen?"], "Ordem.", ["v-apart"]),
  ], diff=2, mins=4)

L(15, "Prática: um jantar no restaurante", "Uit eten.",
  ["Fazer o jantar inteiro: reservar, pedir, reclamar, pagar"],
  vocab=[],
  ex=[("(Fictício) Ik heb gereserveerd op naam van Costa, voor vier personen, om zeven uur.","Reservei em nome de Costa, para quatro pessoas, às sete.")],
  review=["v-reserveren","v-op-naam-van","v-terras","v-dagschotel","v-apart","v-tikkie"],
  cefr=C, exs=[
    DL([("Ober","Goedenavond en welkom! Heeft u een reservering?","Boa noite e bem-vindos! Têm reserva?"),("Jij","","")], ["*Ja, op naam van Costa, voor vier personen.","Nee, ik ben Costa.|Não.","Dagschotel.|Não."], "Chegar.", ["v-op-naam-van"]),
    DL([("Ober","Wat wilt u drinken?","O que quer beber?"),("Jij","","")], ["*Een fles water en twee glazen wijn, alstublieft.","De rekening.|Cedo demais.","Op het terras.|Não."], "Bebidas.", ["v-bestellen"]),
    DL([("Ober","Wat mag het zijn?","O que vai ser?"),("Jij","","")], ["*Voor mij de dagschotel en als voorgerecht de soep.","Apart.|Não.","Buiten.|Não."], "Pedir.", ["v-dagschotel"]),
    DL([("Ober","Heeft het gesmaakt?","Gostaram?"),("Jij","","")], ["*Ja, heerlijk! Mogen we de rekening?","Nee, ik ben vol.|Não responde.","Tikkie.|Incompleto."], "Fechar.", ["v-rekening"]),
    TR("pt-nl","Reservei para quatro pessoas.", ["Ik heb gereserveerd voor vier personen(.)","Ik heb een reservering voor vier personen(.)"], "reserveren.", ["v-reserveren","v-persoon"]),
    LI("Mogen we op het terras zitten?", ["Mogen we op het terras zitten(?)"], "Podemos sentar-nos na esplanada?", "Ouvir.", ["v-terras"]),
    MC("No fim, um amigo diz «Ik betaal, ik stuur straks een Tikkie». O que fazes?", ["*Pagas a tua parte pela app quando receberes o pedido","Nada|Tens de pagar a tua parte.","Dás gorjeta ao amigo|Não."], "Cultura.", ["v-tikkie"]),
    SW("Escreva uma mensagem para reservar mesa (dia, hora, pessoas, nome, pedido especial).", ["Goedemiddag, ik wil graag een tafel reserveren voor zaterdag om 19.00 uur, voor drie personen, op naam van Ribeiro. Eén persoon is vegetarisch. Met vriendelijke groet, Ana Ribeiro"], ["Dia/hora","Pessoas","Nome","Pedido"], 25, "Reservar.", ["v-reserveren"]),
  ], diff=2, mins=5)

W()
