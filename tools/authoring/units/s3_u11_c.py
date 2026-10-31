import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u11")
C = "A2"
# Lições extra (10–15): carteiro, carta registada, seguir encomendas, devoluções e reclamações.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "O carteiro", "De postbode.",
  ["Falar do correio que chega a casa"],
  vocab=[N("v-postbode","postbode","carteiro","de","postbodes")],
  ex=[("De postbode komt meestal om elf uur.","O carteiro vem normalmente às onze."),("Er zit een brief in de brievenbus.","Há uma carta na caixa do correio.")],
  review=["v-brief","v-brievenbus","v-bezorger"],
  cefr=C, exs=[
    MA([("postbode","carteiro"),("brief","carta"),("brievenbus","caixa do correio"),("bezorger","estafeta")], "Correio.", ["v-postbode","v-brief","v-brievenbus","v-bezorger"]),
    TR("pt-nl","O carteiro vem às onze.", ["De postbode komt om elf uur(.)"], "postbode.", ["v-postbode"]),
    TR("pt-nl","Há uma carta na caixa do correio.", ["Er zit een brief in de brievenbus(.)","Er is een brief in de brievenbus(.)"], "er zit.", ["v-brief","v-brievenbus"]),
    FB("De ___ brengt de post.", ["postbode"], "Carteiro.", ["v-postbode"], choices=["postbode","loodgieter","kapper"], tr="O carteiro traz o correio."),
    MC("«Brievenbus» pode ser…", ["*a caixa do correio em casa ou o marco de correio na rua","só um autocarro|Não.","o carteiro|Não."], "Sentidos.", ["v-brievenbus"]),
    LI("Heeft de postbode al geweest?", ["Is de postbode al geweest(?)","Heeft de postbode al geweest(?)"], "O carteiro já passou?", "(Forma correta: «Is … geweest».)", ["v-postbode"]),
    DL([("Huisgenoot","Is er post?","Há correio?"),("Jij","","")], ["*Ja, een brief van de gemeente.","Ik ben post.|Não.","Postbode.|Incompleto."], "Responder.", ["v-brief"]),
    AR("postbode", "carteiro", "de", "Pessoa: de.", ["v-postbode"]),
  ], diff=2, mins=4)

L(11, "Carta registada", "Aangetekend versturen.",
  ["Enviar algo importante com registo"],
  vocab=[X("v-aangetekend","aangetekend","registado (correio)","adjective")],
  ex=[("Ik stuur de opzegging aangetekend.","Envio a rescisão por correio registado."),("Voor een aangetekende brief moet je tekenen.","Para uma carta registada tens de assinar.")],
  review=["v-versturen","v-postzegel","v-ondertekenen"],
  cefr=C, exs=[
    MA([("aangetekend","registado"),("versturen","enviar"),("postzegel","selo"),("ondertekenen","assinar")], "Enviar.", ["v-aangetekend","v-versturen","v-postzegel","v-ondertekenen"]),
    MC("Porque se envia uma rescisão «aangetekend»?", ["*Para ter prova de que foi entregue","Porque é mais rápido|Não é a razão.","Porque é grátis|Não."], "Prova.", ["v-aangetekend"]),
    TR("pt-nl","Quero enviar esta carta registada.", ["Ik wil deze brief aangetekend versturen(.)"], "aangetekend.", ["v-aangetekend","v-versturen"]),
    TR("pt-nl","Preciso de selos.", ["Ik heb postzegels nodig(.)"], "postzegels.", ["v-postzegel"]),
    FB("Een ___ brief moet je bij ontvangst ondertekenen.", ["aangetekende"], "Com -e.", ["v-aangetekend"], choices=["aangetekende","aangetekend","aantekening"], tr="Uma carta registada tem de ser assinada na receção."),
    DL([("Medewerker postpunt","Gewoon of aangetekend?","Normal ou registada?"),("Jij","","")], ["*Aangetekend, graag. Het is belangrijk.","Ja.|Pergunta de escolha.","Postzegel.|Não."], "Escolher.", ["v-aangetekend"]),
    LI("U ontvangt een bewijs van verzending.", ["U ontvangt een bewijs van verzending(.)"], "Recebe um comprovativo de envio.", "Ouvir.", ["v-versturen"]),
    MC("Nos Países Baixos, muitas «postkantoren» foram substituídas por…", ["*pontos de correio em lojas (postpunt)","nada|Existem pontos de serviço.","bancos|Não."], "Contexto.", ["v-versturen"]),
  ], diff=2, mins=4)

L(12, "Onde está a minha encomenda?", "Met de track-and-trace-code.",
  ["Seguir uma encomenda online"],
  vocab=[N("v-track-en-trace","track-and-trace-code","código de seguimento","de")],
  ex=[("Met de track-and-trace-code zie je waar je pakket is.","Com o código de seguimento vês onde está a encomenda."),("Je pakket wordt vandaag tussen 14.00 en 16.00 uur bezorgd.","A encomenda é entregue hoje entre as 14h e as 16h.")],
  review=["v-pakket","v-bezorgen","v-levering","v-online"],
  cefr=C, exs=[
    MA([("track-and-trace-code","código de seguimento"),("pakket","encomenda"),("bezorgen","entregar"),("levering","entrega")], "Encomendas.", ["v-track-en-trace","v-pakket","v-bezorgen","v-levering"]),
    TR("pt-nl","Onde está a minha encomenda?", ["Waar is mijn pakket?","Waar is mijn pakketje?"], "pakket.", ["v-pakket"]),
    TR("pt-nl","A encomenda é entregue hoje.", ["Het pakket wordt vandaag bezorgd(.)"], "Passiva.", ["v-bezorgen"]),
    FB("Via de ___ kun je je pakket volgen.", ["track-and-trace-code"], "Código.", ["v-track-en-trace"], choices=["track-and-trace-code","postzegel","brievenbus"], tr="Com o código de seguimento podes seguir a encomenda."),
    MC("(Mensagem) «Bezorgd bij de buren (nr. 14)» significa…", ["*A encomenda foi entregue ao vizinho do nº 14","Foi devolvida|Não.","Perdeu-se|Não."], "Compreensão.", ["v-bezorgen"]),
    LI("Uw pakket is onderweg.", ["Uw pakket is onderweg(.)"], "A sua encomenda está a caminho.", "Ouvir.", ["v-pakket"]),
    DL([("Klantenservice","Heeft u de track-and-trace-code?","Tem o código de seguimento?"),("Jij","","")], ["*Ja, het is 3S ABC 123.","Ik ben pakket.|Não.","Online.|Não."], "Dar o código (fictício).", ["v-track-en-trace"]),
    AR("pakket", "encomenda", "het", "het pakket.", ["v-pakket"]),
  ], diff=2, mins=4)

L(13, "Devolver uma compra", "Retourneren.",
  ["Devolver uma compra feita online"],
  vocab=[],
  ex=[("Ik wil de schoenen retourneren; ze zijn te klein.","Quero devolver os sapatos; são pequenos demais."),("Plak het retourlabel op de doos.","Cole a etiqueta de devolução na caixa.")],
  review=["v-retourneren","v-retourlabel","v-gratis","v-afgeven","v-terugbetalen"],
  cefr=C, exs=[
    MA([("retourneren","devolver"),("retourlabel","etiqueta de devolução"),("afgeven","entregar"),("terugbetalen","reembolsar")], "Devoluções.", ["v-retourneren","v-retourlabel","v-afgeven","v-terugbetalen"]),
    TR("pt-nl","Quero devolver este casaco.", ["Ik wil deze jas retourneren(.)","Ik wil deze jas terugsturen(.)"], "retourneren.", ["v-retourneren"]),
    TR("pt-nl","A devolução é grátis?", ["Is retourneren gratis?","Is het retourneren gratis?"], "gratis.", ["v-gratis"]),
    FB("Ik geef het pakket ___ bij het postpunt.", ["af"], "afgeven.", ["v-afgeven"], choices=["af","op","uit"], tr="Entrego a encomenda no ponto de correio."),
    MC("Nas compras online na UE, há normalmente…", ["*pelo menos 14 dias para desistir da compra","nunca devolução|Não.","só 1 hora|Não."], "Direito do consumidor (regra geral da UE).", ["v-retourneren"]),
    LI("Het geld wordt binnen veertien dagen terugbetaald.", ["Het geld wordt binnen veertien dagen terugbetaald(.)","Het geld wordt binnen 14 dagen terugbetaald(.)"], "O dinheiro é devolvido no prazo de catorze dias.", "Ouvir.", ["v-terugbetalen"]),
    DL([("Webwinkel (chat)","Waarom wilt u het product retourneren?","Porque quer devolver o produto?"),("Jij","","")], ["*De maat is te klein.","Ik ben retour.|Não.","Gratis.|Não responde."], "Explicar.", ["v-retourneren"]),
    WO("Entrego a encomenda.", ["Ik","geef","het","pakket","af."], "Separável.", ["v-afgeven"]),
  ], diff=2, mins=4)

L(14, "Encomenda estragada", "Het pakket is beschadigd.",
  ["Reclamar de uma encomenda danificada"],
  vocab=[],
  ex=[("Het pakket was beschadigd en de beker is kapot.","A encomenda vinha danificada e a caneca está partida."),("Ik heb foto's gemaakt.","Tirei fotografias.")],
  review=["v-beschadigd","v-kapot","v-klantenservice","v-klagen","v-kwijt"],
  cefr=C, exs=[
    MA([("beschadigd","danificado"),("kapot","partido, avariado"),("klantenservice","apoio ao cliente"),("klagen","reclamar")], "Problemas.", ["v-beschadigd","v-kapot","v-klantenservice","v-klagen"]),
    TR("pt-nl","A encomenda chegou danificada.", ["Het pakket is beschadigd aangekomen(.)","Het pakket was beschadigd(.)"], "beschadigd.", ["v-beschadigd"]),
    TR("pt-nl","A minha encomenda perdeu-se.", ["Mijn pakket is kwijt(.)","Mijn pakketje is kwijt(.)"], "kwijt.", ["v-kwijt"]),
    FB("Ik neem contact op met de ___.", ["klantenservice"], "Apoio.", ["v-klantenservice"], choices=["klantenservice","postbode","glasbak"], tr="Contacto o apoio ao cliente."),
    MC("O que ajuda numa reclamação?", ["*fotografias e o número da encomenda","gritar ao telefone|Não ajuda.","deitar fora a caixa|Perdes provas."], "Estratégia.", ["v-klagen"]),
    LI("Kunt u mij een nieuwe sturen of het geld terugbetalen?", ["Kunt u mij een nieuwe sturen of het geld terugbetalen(?)"], "Pode enviar-me outro ou reembolsar?", "Ouvir.", ["v-terugbetalen"]),
    DL([("Klantenservice","Wat kan ik voor u doen?","O que posso fazer por si?"),("Jij","","")], ["*Mijn bestelling is kapot aangekomen. Ik heb foto's.","Ik ben kapot.|Significa «estou exausto».","Klagen.|Não."], "Reclamar.", ["v-kapot"]),
    WO("A caneca está partida.", ["De","beker","is","kapot."], "Ordem.", ["v-kapot"]),
  ], diff=2, mins=4)

L(15, "Prática: um problema com a entrega", "Bezorgd, maar niet bij mij.",
  ["Resolver um problema de entrega por e-mail"],
  vocab=[],
  ex=[("(Fictício) Volgens de track-and-trace is mijn pakket bezorgd, maar ik heb niets ontvangen.","Segundo o seguimento, a encomenda foi entregue, mas não recebi nada.")],
  review=["v-track-en-trace","v-bezorgen","v-klantenservice","v-postbode","v-aangetekend","v-retourneren"],
  cefr=C, exs=[
    MC("(Fictício) O seguimento diz «bezorgd», mas não tens nada. Primeiro passo razoável:", ["*Perguntar aos vizinhos e ver a caixa do correio","Comprar outra vez|Cedo demais.","Ignorar|Não."], "Estratégia.", ["v-bezorgen"]),
    TR("pt-nl","Não recebi nada.", ["Ik heb niets ontvangen(.)","Ik heb niks ontvangen(.)"], "ontvangen.", ["v-bezorgen"]),
    TR("pt-nl","Segundo o seguimento, foi entregue.", ["Volgens de track-and-trace is het bezorgd(.)","Volgens de track-and-trace-code is het bezorgd(.)"], "volgens.", ["v-track-en-trace"]),
    LI("Heeft u misschien een pakket voor nummer twaalf?", ["Heeft u misschien een pakket voor nummer twaalf(?)","Heeft u misschien een pakket voor nummer 12(?)"], "Tem por acaso uma encomenda para o número doze?", "Aos vizinhos.", ["v-pakket"]),
    BS("Contacto o apoio ao cliente.", ["Ik","neem","contact","op","met","de","klantenservice."], ["Ik neem contact op met de klantenservice."], "contact opnemen.", ["v-klantenservice"]),
    DL([("Buurman","Ja, de postbode heeft het bij mij afgegeven.","Sim, o carteiro deixou-a comigo."),("Jij","","")], ["*Wat fijn, dank je wel!","Ik ben pakket.|Não.","Retourneren.|Não."], "Agradecer.", ["v-postbode"]),
    FB("Ik stuur mijn opzegging ___, dan heb ik bewijs.", ["aangetekend"], "Registado.", ["v-aangetekend"], choices=["aangetekend","gratis","kapot"], tr="Envio a rescisão registada; assim tenho prova."),
    SW("Escreva um e-mail ao apoio ao cliente: encomenda marcada como entregue mas não recebida (número, data, pedido).", ["Geachte klantenservice, volgens de track-and-trace is mijn bestelling (nummer 45821) op 3 mei bezorgd, maar ik heb niets ontvangen. Ook mijn buren hebben het pakket niet. Kunt u dit uitzoeken of het geld terugbetalen? Met vriendelijke groet, Sara Mendes"], ["Número","Problema","Pedido"], 30, "E-mail (fictício).", ["v-klantenservice"]),
  ], diff=2, mins=5)

W()
