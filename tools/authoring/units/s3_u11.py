import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u11")
C = "A2"

L(1, "Enviar uma carta ou um pacote", "de brief, de postzegel, versturen, het pakket.",
  ["Enviar cartas e pacotes"],
  vocab=[V("v-brief","brief","carta","noun","de","brieven"), V("v-postzegel","postzegel","selo","noun","de","postzegels"),
         V("v-versturen","versturen","enviar","verb"), V("v-pakket","pakket","pacote","noun","het","pakketten"), V("v-brievenbus","brievenbus","marco do correio|caixa do correio","noun","de")],
  ex=[("Ik wil dit pakket naar Portugal versturen.","Quero enviar este pacote para Portugal."),("Hoeveel kost een postzegel?","Quanto custa um selo?"),("Doe de brief in de brievenbus.","Põe a carta no marco do correio.")],
  gram=[G("g-postnl","Correios nos Países Baixos","Já quase não há estações de correio: os serviços estão em **servicepunten** (balcões dentro de supermercados ou livrarias). Os marcos do correio são **laranja e vermelho** e têm duas aberturas: *streekpost* (região) e *overige bestemmingen* (outros destinos).",
    [("Waar is het dichtstbijzijnde PostNL-punt?","Onde é o ponto PostNL mais próximo?")])],
  review=["v-postkantoor","v-kosten","v-adres"],
  cefr=C, exs=[
    MA([("brief","carta"),("postzegel","selo"),("versturen","enviar"),("pakket","pacote"),("brievenbus","marco do correio")], "Correio.", ["v-brief","v-postzegel","v-versturen","v-pakket","v-brievenbus"]),
    AR("pakket","o pacote","het", "«Het pakket».", ["v-pakket"]),
    TR("pt-nl","Quero enviar este pacote para Portugal.", ["Ik wil dit pakket naar Portugal versturen","Ik wil graag dit pakket naar Portugal versturen"], "Infinitivo no fim.", ["v-versturen","v-pakket"]),
    TR("nl-pt","Hoeveel kost een postzegel naar Portugal?", ["Quanto custa um selo para Portugal"], "postzegel.", ["v-postzegel"]),
    WO("Põe a carta no marco do correio.", ["Doe","de","brief","in","de","brievenbus"], "Imperativo.", ["v-brief","v-brievenbus"]),
    FE(["Ik","verstuurt","een","brief."], 1, "verstuur", "ik verstuur.", ["v-versturen"]),
    LI("Ik heb twee postzegels nodig.", ["Ik heb twee postzegels nodig"], "Preciso de dois selos.", "nodig hebben.", ["v-postzegel"]),
    FB("Plak een ___ op de envelop.", ["postzegel"], "selo.", ["v-postzegel"], choices=["postzegel","pakket","brievenbus"], tr="Cola um selo no envelope."),
    MC("De que cor são os marcos do correio neerlandeses?", ["*Laranja e vermelho","Amarelos|São os de Portugal... e da Alemanha.","Azuis|Não."], "PostNL: laranja.", ["v-brievenbus"]),
    DL([("Funcionário","Wat kan ik voor u doen?","Em que posso ajudar?"),("Cliente","")], ["*Ik wil dit pakket aangetekend versturen.","Ik ben een pakket.|Não faz sentido.","Een postzegel eten.|Não faz sentido."], "aangetekend = registado.", ["v-versturen"]),
  ], diff=2, mins=5)

L(2, "Receber encomendas", "bezorgen, de bezorger, bij de buren afgeven, niet thuis.",
  ["Lidar com entregas e encomendas"],
  vocab=[V("v-bezorgen","bezorgen","entregar (ao domicílio)","verb"), V("v-bezorger","bezorger","estafeta|carteiro","noun","de"),
         V("v-afgeven","afgeven","deixar|entregar","verb",note="bij de buren afgeven = deixar nos vizinhos"), V("v-ophalen","ophalen","ir buscar|levantar","verb")],
  ex=[("Mijn pakket wordt morgen bezorgd.","O meu pacote é entregue amanhã."),("De bezorger heeft het bij de buren afgegeven.","O estafeta deixou-o nos vizinhos."),("U kunt het pakket ophalen bij het servicepunt.","Pode levantar o pacote no ponto de recolha.")],
  review=["v-pakketje","v-buurman","v-thuis","v-aannemen"],
  cefr=C, exs=[
    MA([("bezorgen","entregar"),("bezorger","estafeta"),("afgeven","deixar"),("ophalen","ir buscar")], "Entregas.", ["v-bezorgen","v-bezorger","v-afgeven","v-ophalen"]),
    TR("nl-pt","Mijn pakket wordt morgen bezorgd.", ["O meu pacote [é|vai ser] entregue amanhã"], "Passiva: wordt bezorgd.", ["v-bezorgen"]),
    TR("pt-nl","Posso levantar o pacote amanhã?", ["Kan ik het pakket morgen ophalen","Kan ik morgen het pakket ophalen"], "ophalen junto no fim.", ["v-ophalen"]),
    WO("Vou buscar o pacote ao ponto de recolha.", ["Ik","haal","het","pakket","op","bij","het","servicepunt"], "Separável: haal … op.", ["v-ophalen"]),
    FE(["Ik","ophaal","mijn","pakket."], 1, "haal … op", "Separável: ik haal mijn pakket op.", ["v-ophalen"]),
    LI("We hebben u niet thuis getroffen.", ["We hebben u niet thuis getroffen"], "Não o encontrámos em casa.", "Aviso típico de entrega falhada.", ["v-bezorger"]),
    FB("De ___ belt aan om twee uur.", ["bezorger"], "estafeta.", ["v-bezorger"], choices=["bezorger","brievenbus","pakket"], tr="O estafeta toca à campainha às duas."),
    CO("text","Aviso", "Helaas hebben we u niet thuis getroffen. Uw pakket is afgegeven bij uw buren op nummer 14. Was dat niet mogelijk? Dan kunt u het vanaf morgen 12.00 uur ophalen bij het PostNL-punt in de supermarkt.",
       [("Onde está o pacote?", ["*Nos vizinhos do n.º 14","No ponto PostNL","Voltou ao remetente"]),("Se não estiver nos vizinhos, quando pode levantá-lo?", ["*A partir de amanhã às 12h","Hoje","Daqui a uma semana"])],
       "niet thuis getroffen = não encontrado em casa.", ["v-afgeven","v-ophalen"]),
    DL([("Vizinha","Ik heb een pakket voor je aangenomen.","Recebi um pacote para ti."),("Você","")], ["*Wat aardig, dank je wel! Ik haal het zo op.","Ik ben het pakket.|Não faz sentido.","Graag gedaan!|Quem agradece é você."], "Agradecer.", ["v-ophalen"]),
    WO("O estafeta deixa o pacote nos vizinhos.", ["De","bezorger","geeft","het","pakket","bij","de","buren","af"], "Separável.", ["v-afgeven"]),
  ], diff=3, mins=6)

L(3, "Compras online e devoluções", "bestellen, retourneren, de levering, het retourlabel.",
  ["Comprar online e devolver produtos"],
  vocab=[V("v-online","online","online","adverb"), V("v-retourneren","retourneren","devolver","verb",note="Também «terugsturen»."),
         V("v-levering","levering","entrega","noun","de"), V("v-retourlabel","retourlabel","etiqueta de devolução","noun","het"), V("v-gratis","gratis","grátis","adjective")],
  ex=[("Ik bestel veel online.","Encomendo muita coisa online."),("De levering is gratis.","A entrega é grátis."),("Ik wil deze schoenen retourneren.","Quero devolver estes sapatos.")],
  review=["v-bestellen","v-maat","v-te"],
  cefr=C, exs=[
    MA([("online","online"),("retourneren","devolver"),("levering","entrega"),("retourlabel","etiqueta de devolução"),("gratis","grátis")], "Online.", ["v-online","v-retourneren","v-levering","v-retourlabel","v-gratis"]),
    TR("pt-nl","Quero devolver estes sapatos.", ["Ik wil deze schoenen retourneren","Ik wil deze schoenen terugsturen"], "retourneren.", ["v-retourneren"]),
    TR("nl-pt","De levering is gratis.", ["A entrega é grátis","A entrega é gratuita"], "gratis.", ["v-levering","v-gratis"]),
    AR("retourlabel","a etiqueta de devolução","het", "label → het.", ["v-retourlabel"]),
    FE(["Ik","retourneer","de","jas","want","hij","is","te","goed."], 8, "groot", "Devolve-se porque é grande (pequeno) demais, não «bom demais».", ["v-retourneren"]),
    LI("Wanneer wordt mijn bestelling geleverd?", ["Wanneer wordt mijn bestelling geleverd"], "Quando é entregue a minha encomenda?", "bestelling = encomenda.", ["v-levering"]),
    FB("Print het ___ en plak het op de doos.", ["retourlabel"], "etiqueta de devolução.", ["v-retourlabel"], choices=["retourlabel","postzegel","pakket"], tr="Imprime a etiqueta de devolução e cola-a na caixa."),
    MC("Encomendou umas calças tamanho M e são pequenas. O que faz?", ["*Retourneren en maat L bestellen","Ze houden|Não servem.","Ze in de brievenbus doen|Não."], "Devolver e pedir outro tamanho.", ["v-retourneren"]),
    WO("A entrega demora três dias.", ["De","levering","duurt","drie","dagen"], "duren.", ["v-levering"]),
    TR("pt-nl","Encomendo muita coisa online.", ["Ik bestel veel online"], "veel online.", ["v-online","v-bestellen"]),
  ], diff=2, mins=5)

L(4, "Problemas com encomendas", "kwijt, beschadigd, de klantenservice, klagen.",
  ["Reclamar de uma encomenda perdida ou danificada"],
  vocab=[V("v-kwijt","kwijt","perdido","adjective",note="Mijn pakket is kwijt."), V("v-beschadigd","beschadigd","danificado","adjective"),
         V("v-klantenservice","klantenservice","serviço de apoio ao cliente","noun","de"), V("v-klagen","klagen","queixar-se|reclamar","verb"), V("v-terugbetalen","terugbetalen","reembolsar","verb")],
  ex=[("Mijn pakket is kwijt.","O meu pacote perdeu-se."),("De doos was beschadigd.","A caixa estava danificada."),("Ik bel de klantenservice.","Ligo para o apoio ao cliente."),("Kunt u het geld terugbetalen?","Pode reembolsar o dinheiro?")],
  review=["v-pakket","v-levering","v-kapot"],
  cefr=C, exs=[
    MA([("kwijt","perdido"),("beschadigd","danificado"),("klantenservice","apoio ao cliente"),("klagen","reclamar"),("terugbetalen","reembolsar")], "Problemas.", ["v-kwijt","v-beschadigd","v-klantenservice","v-klagen","v-terugbetalen"]),
    TR("pt-nl","O meu pacote perdeu-se.", ["Mijn pakket is kwijt","Mijn pakket is zoek"], "kwijt.", ["v-kwijt"]),
    TR("nl-pt","Kunt u het geld terugbetalen?", ["Pode reembolsar o dinheiro","Pode devolver o dinheiro"], "terugbetalen.", ["v-terugbetalen"]),
    TR("pt-nl","Ligo para o apoio ao cliente.", ["Ik bel de klantenservice","Ik bel naar de klantenservice"], "klantenservice.", ["v-klantenservice"]),
    FE(["Het","pakket","was","beschadig."], 3, "beschadigd", "beschadigd (com -d).", ["v-beschadigd"]),
    LI("Ik heb mijn bestelling nooit ontvangen.", ["Ik heb mijn bestelling nooit ontvangen"], "Nunca recebi a minha encomenda.", "ontvangen = receber.", ["v-kwijt"]),
    DL([("Apoio","Klantenservice, met Lisa. Waarmee kan ik u helpen?","Apoio ao cliente, fala a Lisa. Em que posso ajudar?"),("Cliente","")], ["*Mijn pakket is beschadigd aangekomen.","Ik ben klantenservice.|Não faz sentido.","Graag gedaan.|Não faz sentido."], "Descrever o problema.", ["v-beschadigd"]),
    FB("Ik wil ___ over de levering.", ["klagen"], "reclamar.", ["v-klagen"], choices=["klagen","bezorgen","retourneren"], tr="Quero reclamar da entrega."),
    WO("Recebi o produto errado.", ["Ik","heb","het","verkeerde","product","gekregen"], "verkeerd = errado.", ["v-klagen"]),
    SW("Escreva uma reclamação curta: a encomenda chegou danificada e quer o reembolso.", ["Mijn bestelling is beschadigd aangekomen(.) Kunt u het geld terugbetalen","Het pakket was beschadigd(.) Ik wil graag mijn geld terug"],
       ["Descreve o problema (beschadigd, kwijt…)","Pede uma solução (terugbetalen, nieuw product)","Tom educado"], 8, "Modelo: «Mijn bestelling is beschadigd aangekomen. Kunt u het geld terugbetalen? Met vriendelijke groet.»", ["v-terugbetalen"]),
  ], diff=3, mins=6)

L(5, "Correio e entregas", "Revisão.",
  ["Gerir envios, entregas e devoluções"],
  ex=[("Ik verstuur het pakket aangetekend, dan kan het niet kwijtraken.","Envio o pacote registado; assim não se pode perder.")],
  review=["v-versturen","v-postzegel","v-bezorgen","v-ophalen","v-retourneren","v-kwijt","v-klantenservice","v-gratis"],
  cefr=C, exs=[
    MA([("versturen","enviar"),("bezorgen","entregar"),("ophalen","levantar"),("retourneren","devolver")], "Verbos.", ["v-versturen","v-bezorgen","v-ophalen","v-retourneren"]),
    TR("pt-nl","Vou buscar o pacote amanhã.", ["Ik haal het pakket morgen op","Morgen haal ik het pakket op"], "Separável.", ["v-ophalen"]),
    TR("nl-pt","Retourneren is gratis.", ["Devolver é grátis","A devolução é grátis"], "gratis.", ["v-retourneren","v-gratis"]),
    FE(["Mijn","pakket","is","kwijtt."], 3, "kwijt", "kwijt.", ["v-kwijt"]),
    LI("Uw pakket is onderweg.", ["Uw pakket is onderweg"], "O seu pacote está a caminho.", "onderweg = a caminho.", ["v-bezorgen"]),
    CO("text","Rastreio", "Status van uw bestelling:\n12 mei — Bestelling ontvangen\n13 mei — Verzonden\n14 mei — Onderweg naar het sorteercentrum\n15 mei — Bezorging vandaag tussen 14.00 en 16.00 uur",
       [("Quando foi enviada?", ["*13 de maio","12 de maio","15 de maio"]),("A que horas é a entrega?", ["*Entre as 14h e as 16h","De manhã","Não se sabe"])],
       "verzonden = enviado.", ["v-bezorgen"]),
    DL([("Estafeta","Ik heb een pakket voor de buren. Wilt u het aannemen?","Tenho um pacote para os vizinhos. Quer recebê-lo?"),("Você","")], ["*Ja hoor, geen probleem.","Ja, ik verstuur het.|Não faz sentido.","Ik ben niet thuis.|Está em casa!"], "Aceitar.", ["v-aannemen"]),
    WO("Envio-te o link de rastreio.", ["Ik","stuur","je","de","track-en-tracecode"], "sturen.", ["v-versturen"]),
    FB("Mijn pakket is beschadigd, dus ik bel de ___.", ["klantenservice"], "apoio ao cliente.", ["v-klantenservice"], choices=["klantenservice","bezorger","postzegel"], tr="O meu pacote está danificado, por isso ligo para o apoio ao cliente."),
    TR("pt-nl","Quanto custa enviar uma carta para Portugal?", ["Hoeveel kost het om een brief naar Portugal te versturen","Wat kost een brief naar Portugal"], "om … te.", ["v-brief"]),
  ], diff=3, mins=6)

W()
