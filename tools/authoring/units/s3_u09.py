import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u09")
C = "A2"

L(1, "A câmara municipal (gemeente)", "inschrijven, het BSN, de balie, het loket.",
  ["Registar-se na câmara e obter o BSN"],
  vocab=[V("v-gemeente","gemeente","município|câmara municipal","noun","de"), V("v-inschrijven","zich inschrijven","registar-se|inscrever-se","verb",note="Ik schrijf me in bij de gemeente."),
         V("v-bsn","BSN","número de identificação fiscal e social","noun","het",note="Burgerservicenummer: necessário para trabalhar, banco, médico."), V("v-balie","balie","balcão","noun","de"), V("v-loket","loket","guiché","noun","het")],
  ex=[("Ik moet me inschrijven bij de gemeente.","Tenho de me registar na câmara municipal."),("Je hebt een BSN nodig om te werken.","Precisas de um BSN para trabalhar."),("Ga naar loket drie.","Vá ao guiché três.")],
  gram=[G("g-gemeente","Inscrição na gemeente","Quem vai viver nos Países Baixos mais de 4 meses tem de se **inschrijven** na **gemeente** (registo de morada). Recebe-se um **BSN**, essencial para trabalhar, abrir conta, ir ao médico. É preciso marcar **afspraak** e levar **paspoort** e contrato de arrendamento.",
    [("Ik heb een afspraak bij de gemeente.","Tenho marcação na câmara.")])],
  review=["v-paspoort","v-afspraak","v-afspraak-maken"],
  cefr=C, exs=[
    MA([("gemeente","câmara municipal"),("inschrijven","registar-se"),("balie","balcão"),("loket","guiché")], "Burocracia.", ["v-gemeente","v-inschrijven","v-balie","v-loket"]),
    TR("pt-nl","Tenho de me registar na câmara.", ["Ik moet me inschrijven bij de gemeente","Ik moet mij inschrijven bij de gemeente"], "zich inschrijven.", ["v-inschrijven","v-gemeente"]),
    TR("nl-pt","Je hebt een BSN nodig om te werken.", ["Precisas de um BSN para trabalhar"], "om … te = para.", ["v-bsn"]),
    AR("loket","o guiché","het", "«Het loket».", ["v-loket"]),
    MC("Para que serve o BSN?", ["*Trabalhar, abrir conta, ir ao médico","Apenas para viajar|Tem muitos mais usos.","Para conduzir|É a carta de condução (rijbewijs)."], "BSN = número essencial.", ["v-bsn"]),
    FE(["Ik","inschrijf","me","bij","de","gemeente."], 1, "schrijf … in", "Separável: ik schrijf me in.", ["v-inschrijven"]),
    LI("Neem uw paspoort en huurcontract mee.", ["Neem uw paspoort en huurcontract mee"], "Traga o passaporte e o contrato de arrendamento.", "meenemen.", ["v-paspoort"]),
    FB("U kunt wachten bij ___ vier.", ["loket","balie"], "guiché/balcão.", ["v-loket"], choices=["loket","gemeente","BSN"], tr="Pode esperar no guiché quatro."),
    WO("Tenho marcação na câmara municipal.", ["Ik","heb","een","afspraak","bij","de","gemeente"], "bij de gemeente.", ["v-gemeente"]),
    DL([("Funcionária","Waarmee kan ik u helpen?","Em que posso ajudar?"),("Ana","")], ["*Ik wil me graag inschrijven. Ik woon hier sinds een week.","Ik wil een BSN eten.|Não faz sentido.","Ik ben een loket.|Não faz sentido."], "Explicar o pedido.", ["v-inschrijven"]),
  ], diff=3, mins=6)

L(2, "Formulários", "invullen, de handtekening, de geboortedatum, het adres.",
  ["Preencher formulários com dados pessoais"],
  vocab=[V("v-formulier","formulier","formulário","noun","het"), V("v-invullen","invullen","preencher","verb"), V("v-handtekening","handtekening","assinatura","noun","de"),
         V("v-geboortedatum","geboortedatum","data de nascimento","noun","de"), V("v-adres","adres","morada","noun","het","adressen"), V("v-achternaam","achternaam","apelido","noun","de",note="voornaam = nome próprio")],
  ex=[("Vul dit formulier in, alstublieft.","Preencha este formulário, por favor."),("Hier uw handtekening.","Aqui a sua assinatura."),("Wat is uw geboortedatum?","Qual é a sua data de nascimento?")],
  review=["v-naam","v-telefoonnummer","v-datum","v-schrijven"],
  cefr=C, exs=[
    MA([("formulier","formulário"),("invullen","preencher"),("handtekening","assinatura"),("adres","morada"),("achternaam","apelido")], "Formulários.", ["v-formulier","v-invullen","v-handtekening","v-adres","v-achternaam"]),
    AR("formulier","o formulário","het", "«Het formulier».", ["v-formulier"]),
    AR("adres","a morada","het", "«Het adres».", ["v-adres"]),
    WO("Preencha este formulário.", ["Vul","dit","formulier","in"], "Imperativo separável.", ["v-invullen"]),
    TR("pt-nl","Qual é a sua data de nascimento?", ["Wat is uw geboortedatum"], "uw (formal).", ["v-geboortedatum"]),
    TR("nl-pt","Hier uw handtekening, alstublieft.", ["Aqui a sua assinatura, por favor","Assine aqui, por favor"], "handtekening.", ["v-handtekening"]),
    MC("No formulário, «achternaam» é…", ["*o apelido","o nome próprio|Esse é «voornaam».","a morada|Essa é «adres»."], "achternaam = apelido.", ["v-achternaam"]),
    FE(["Ik","invul","het","formulier."], 1, "vul … in", "Separável: ik vul het formulier in.", ["v-invullen"]),
    LI("Wat is uw adres?", ["Wat is uw adres"], "Qual é a sua morada?", "uw adres.", ["v-adres"]),
    FB("Mijn ___ is Silva en mijn voornaam is Ana.", ["achternaam"], "apelido.", ["v-achternaam"], choices=["achternaam","adres","handtekening"], tr="O meu apelido é Silva e o meu nome próprio é Ana."),
  ], diff=2, mins=5)

L(3, "Documentos", "het rijbewijs, de verblijfsvergunning, de ID-kaart, verlengen.",
  ["Falar de documentos de identificação e prazos"],
  vocab=[V("v-rijbewijs","rijbewijs","carta de condução","noun","het"), V("v-id-kaart","identiteitskaart","cartão de cidadão|bilhete de identidade","noun","de",note="Abreviado: ID-kaart."),
         V("v-verlopen","verlopen","caducar|expirar","verb",note="Mijn paspoort is verlopen."), V("v-verlengen","verlengen","renovar|prolongar","verb"), V("v-geldig","geldig","válido","adjective")],
  ex=[("Mijn paspoort is verlopen.","O meu passaporte caducou."),("Ik moet mijn rijbewijs verlengen.","Tenho de renovar a carta de condução."),("Is deze kaart nog geldig?","Este cartão ainda é válido?")],
  review=["v-paspoort","v-gemeente","v-afspraak"],
  cefr=C, exs=[
    MA([("rijbewijs","carta de condução"),("identiteitskaart","cartão de cidadão"),("verlopen","caducar"),("verlengen","renovar"),("geldig","válido")], "Documentos.", ["v-rijbewijs","v-id-kaart","v-verlopen","v-verlengen","v-geldig"]),
    AR("rijbewijs","a carta de condução","het", "«Het rijbewijs».", ["v-rijbewijs"]),
    TR("pt-nl","O meu passaporte caducou.", ["Mijn paspoort is verlopen"], "verlopen (com zijn).", ["v-verlopen"]),
    TR("pt-nl","Tenho de renovar a carta de condução.", ["Ik moet mijn rijbewijs verlengen"], "verlengen.", ["v-verlengen"]),
    TR("nl-pt","Is deze kaart nog geldig?", ["Este cartão ainda é válido","Este cartão ainda está válido"], "geldig.", ["v-geldig"]),
    MC("O contrário de «geldig» é…", ["*verlopen","verlengd|= renovado.","verplicht|= obrigatório."], "verlopen = expirado.", ["v-geldig","v-verlopen"]),
    FE(["Mijn","ID-kaart","heeft","verlopen."], 2, "is", "verlopen usa «zijn»: is verlopen.", ["v-verlopen"]),
    LI("Neem een geldig legitimatiebewijs mee.", ["Neem een geldig legitimatiebewijs mee"], "Traga um documento de identificação válido.", "legitimatiebewijs = documento de identificação.", ["v-geldig"]),
    FB("Mijn rijbewijs is tot 2030 ___.", ["geldig"], "válido até.", ["v-geldig"], choices=["geldig","verlopen","verplicht"], tr="A minha carta é válida até 2030."),
    WO("Posso renovar o passaporte na embaixada?", ["Kan","ik","mijn","paspoort","bij","de","ambassade","verlengen?"], "Modal + infinitivo no fim.", ["v-verlengen"]),
  ], diff=3, mins=6)

L(4, "DigiD e serviços online", "inloggen, het wachtwoord, de code, aanvragen.",
  ["Perceber serviços online do governo"],
  vocab=[V("v-digid","DigiD","identidade digital","noun","de",note="Login oficial para serviços do Estado (impostos, gemeente, saúde)."), V("v-inloggen","inloggen","entrar (na conta)|fazer login","verb"),
         V("v-wachtwoord","wachtwoord","palavra-passe","noun","het"), V("v-aanvragen","aanvragen","requerer|pedir (oficialmente)","verb"), V("v-belastingdienst","Belastingdienst","finanças (autoridade tributária)","noun","de")],
  ex=[("Log in met je DigiD.","Entra com o teu DigiD."),("Ik ben mijn wachtwoord vergeten.","Esqueci-me da palavra-passe."),("Je kunt toeslag online aanvragen.","Podes requerer o subsídio online.")],
  review=["v-vergeten","v-formulier"],
  cefr=C, exs=[
    MA([("DigiD","identidade digital"),("inloggen","fazer login"),("wachtwoord","palavra-passe"),("aanvragen","requerer"),("Belastingdienst","finanças")], "Online.", ["v-digid","v-inloggen","v-wachtwoord","v-aanvragen","v-belastingdienst"]),
    WO("Entra com o teu DigiD.", ["Log","in","met","je","DigiD"], "Imperativo separável.", ["v-inloggen"]),
    TR("pt-nl","Esqueci-me da palavra-passe.", ["Ik ben mijn wachtwoord vergeten"], "vergeten com zijn.", ["v-wachtwoord"]),
    TR("nl-pt","Je kunt een DigiD online aanvragen.", ["Podes [requerer|pedir] um DigiD online"], "aanvragen.", ["v-aanvragen"]),
    AR("wachtwoord","a palavra-passe","het", "woord → het.", ["v-wachtwoord"]),
    FE(["Ik","inlog","op","de","website."], 1, "log … in", "Separável: ik log in op de website.", ["v-inloggen"]),
    MC("Com o DigiD pode…", ["*Tratar de impostos e assuntos da câmara online","Pagar no supermercado|Não.","Andar de comboio|Não."], "DigiD = identidade digital oficial.", ["v-digid"]),
    LI("Vul de code in die u per sms ontvangt.", ["Vul de code in die u per sms ontvangt"], "Introduza o código que recebe por SMS.", "die = que.", ["v-invullen"]),
    FB("De ___ stuurt je een brief over je belasting.", ["Belastingdienst"], "finanças.", ["v-belastingdienst"], choices=["Belastingdienst","DigiD","gemeente"], tr="As finanças enviam-te uma carta sobre os teus impostos."),
    CO("text","Instruções", "Log in met uw DigiD. Klik op 'Aanvragen'. Vul het formulier in en controleer uw gegevens. Klik daarna op 'Versturen'. U ontvangt binnen twee weken een brief.",
       [("O que faz primeiro?", ["*Entra com o DigiD","Envia o formulário","Liga para a câmara"]),("Quando recebe a carta?", ["*Dentro de duas semanas","Amanhã","Num mês"])],
       "gegevens = dados; versturen = enviar.", ["v-inloggen","v-aanvragen"]),
  ], diff=3, mins=6)

L(5, "Resolver um assunto oficial", "Revisão: gemeente, formulários e documentos.",
  ["Resolver um assunto burocrático do início ao fim"],
  ex=[("Ik heb een afspraak gemaakt bij de gemeente om me in te schrijven.","Marquei uma consulta na câmara para me registar.")],
  review=["v-gemeente","v-inschrijven","v-bsn","v-formulier","v-invullen","v-handtekening","v-geldig","v-digid","v-verlopen"],
  cefr=C, exs=[
    DL([("Funcionário","Heeft u een geldig paspoort?","Tem passaporte válido?"),("Pedro","")], ["*Ja, alstublieft. En hier is mijn huurcontract.","Ja, mijn paspoort is verlopen.|Contraditório.","Nee, ik ben geldig.|Não faz sentido."], "Entregar documentos.", ["v-geldig"]),
    TR("pt-nl","Preencha o formulário e assine aqui.", ["Vul het formulier in en zet hier uw handtekening","Vul het formulier in en teken hier"], "Dois imperativos.", ["v-invullen","v-handtekening"]),
    TR("nl-pt","Na de inschrijving krijgt u een BSN.", ["Depois do registo recebe um BSN","Após a inscrição recebe um BSN"], "krijgen = receber.", ["v-bsn"]),
    FE(["Ik","moet","mijn","paspoort","verlengt."], 4, "verlengen", "Depois de «moet»: infinitivo.", ["v-verlengen"]),
    LI("U kunt de afspraak online maken met uw DigiD.", ["U kunt de afspraak online maken met uw DigiD"], "Pode marcar online com o seu DigiD.", "Revisão.", ["v-digid"]),
    MA([("BSN","número de identificação"),("DigiD","identidade digital"),("gemeente","câmara"),("loket","guiché")], "Burocracia.", ["v-bsn","v-digid","v-gemeente","v-loket"]),
    CO("text","Os primeiros dias da Marta", "Marta woont sinds twee weken in Groningen. Eerst maakte ze een afspraak bij de gemeente. Ze nam haar paspoort en haar huurcontract mee. Ze vulde een formulier in en zette haar handtekening. Nu heeft ze een BSN. Volgende week vraagt ze haar DigiD aan.",
       [("O que levou Marta à câmara?", ["*Passaporte e contrato de arrendamento","Carta de condução","Nada"]),("O que tem agora?", ["*Um BSN","Um DigiD","Uma casa nova"]),("O que vai fazer na próxima semana?", ["*Pedir o DigiD","Renovar o passaporte","Mudar de casa"])],
       "maakte, nam, vulde = passado (Secção 4).", ["v-bsn","v-aanvragen"]),
    WO("Tenho de requerer o meu DigiD.", ["Ik","moet","mijn","DigiD","aanvragen"], "Modal + infinitivo junto.", ["v-aanvragen"]),
    FB("Mijn ID-kaart is ___, ik moet een nieuwe aanvragen.", ["verlopen"], "caducou.", ["v-verlopen"], choices=["verlopen","geldig","ingevuld"], tr="O meu cartão caducou, tenho de pedir um novo."),
    SW("Escreva um e-mail curto à câmara a pedir uma marcação para se registar.", ["Geachte heer/mevrouw(,) ik wil graag een afspraak maken om me in te schrijven(.) Met vriendelijke groet(,) Ana Silva"],
       ["Abertura formal («Geachte heer/mevrouw»)","Pedido com «ik wil graag een afspraak maken»","Fecho formal («Met vriendelijke groet»)"], 12, "Fórmulas formais de e-mail (aprofundadas na Secção 4).", ["v-inschrijven"]),
  ], diff=3, mins=7)

W()
