import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u12")
C = "A2"

L(1, "No banco", "de bank, de rekening, de pinpas, een rekening openen.",
  ["Abrir uma conta bancária"],
  vocab=[V("v-bankrekening","bankrekening","conta bancária","noun","de"), V("v-openen-rekening","een rekening openen","abrir uma conta","expression"),
         V("v-pinpas","pinpas","cartão de débito","noun","de"), V("v-iban","IBAN","IBAN","noun","het"), V("v-pincode","pincode","código PIN","noun","de")],
  ex=[("Ik wil een bankrekening openen.","Quero abrir uma conta bancária."),("Wat is je IBAN?","Qual é o teu IBAN?"),("Ik ben mijn pincode vergeten.","Esqueci-me do PIN.")],
  review=["v-bank","v-bsn","v-paspoort","v-pinnen"],
  cefr=C, exs=[
    MA([("bankrekening","conta bancária"),("pinpas","cartão de débito"),("IBAN","IBAN"),("pincode","PIN")], "Banco.", ["v-bankrekening","v-pinpas","v-iban","v-pincode"]),
    TR("pt-nl","Quero abrir uma conta bancária.", ["Ik wil een bankrekening openen","Ik wil graag een bankrekening openen"], "een rekening openen.", ["v-openen-rekening"]),
    TR("nl-pt","Wat is je IBAN?", ["Qual é o teu IBAN"], "IBAN.", ["v-iban"]),
    TR("pt-nl","Esqueci-me do PIN.", ["Ik ben mijn pincode vergeten"], "vergeten com zijn.", ["v-pincode"]),
    MC("Para abrir uma conta precisa normalmente de…", ["*BSN, passaporte e morada","Só o nome|Não chega.","Um rijbewijs neerlandês|Não é obrigatório."], "BSN é essencial.", ["v-bsn"]),
    AR("pincode","o código PIN","de", "«De pincode».", ["v-pincode"]),
    FE(["Ik","open","een","bankrekening","bij","het","bank."], 5, "de", "de bank.", ["v-bankrekening"]),
    LI("Uw nieuwe pinpas komt per post.", ["Uw nieuwe pinpas komt per post"], "O seu novo cartão chega pelo correio.", "per post.", ["v-pinpas"]),
    FB("Ik kan niet pinnen: mijn ___ is kapot.", ["pinpas"], "cartão.", ["v-pinpas"], choices=["pinpas","IBAN","pincode"], tr="Não consigo pagar com cartão: o meu cartão está avariado."),
    WO("Pode dar-me o seu IBAN?", ["Mag","ik","uw","IBAN?"], "Mag ik…?", ["v-iban"]),
  ], diff=2, mins=5)

L(2, "Pagar e transferir", "overmaken, de rekening betalen, de factuur, Tikkie.",
  ["Fazer transferências e pagar faturas"],
  vocab=[V("v-overmaken","overmaken","transferir (dinheiro)","verb",note="Ik maak het geld over."), V("v-factuur","factuur","fatura","noun","de","facturen"),
         V("v-bedrag","bedrag","montante|quantia","noun","het"), V("v-machtiging","automatische incasso","débito direto","noun","de")],
  ex=[("Ik maak het geld vandaag over.","Transfiro o dinheiro hoje."),("Het bedrag is 50 euro.","O montante é 50 euros."),("De factuur moet binnen 14 dagen betaald worden.","A fatura tem de ser paga em 14 dias.")],
  gram=[G("g-betalen-nl","Pagar nos Países Baixos","Pagamentos comuns: **pinnen** (cartão), **overmaken** (transferência para IBAN), **iDEAL** (pagamento online direto do banco), **Tikkie** (pedido de pagamento por app) e **automatische incasso** (débito direto, p.ex. para renda e seguro).",
    [("Kan ik met iDEAL betalen?","Posso pagar com iDEAL?")])],
  review=["v-betalen","v-tikkie","v-iban","v-geld"],
  cefr=C, exs=[
    MA([("overmaken","transferir"),("factuur","fatura"),("bedrag","montante"),("automatische incasso","débito direto")], "Pagamentos.", ["v-overmaken","v-factuur","v-bedrag","v-machtiging"]),
    WO("Transfiro o dinheiro hoje.", ["Ik","maak","het","geld","vandaag","over"], "Separável.", ["v-overmaken"]),
    TR("nl-pt","Het bedrag is vijftig euro.", ["O montante é (de )cinquenta euros","A quantia é (de )50 euros"], "bedrag.", ["v-bedrag"]),
    TR("pt-nl","Podes transferir-me o dinheiro?", ["Kun je het geld overmaken","Kun je mij het geld overmaken","Kun je het geld naar mij overmaken"], "Modal + infinitivo.", ["v-overmaken"]),
    AR("bedrag","o montante","het", "«Het bedrag».", ["v-bedrag"]),
    FE(["Ik","overmaak","het","bedrag."], 1, "maak … over", "Separável: ik maak het bedrag over.", ["v-overmaken"]),
    LI("Betaal de factuur binnen veertien dagen.", ["Betaal de factuur binnen veertien dagen"], "Pague a fatura em catorze dias.", "binnen = dentro de.", ["v-factuur"]),
    FB("De huur gaat via automatische ___ .", ["incasso"], "débito direto.", ["v-machtiging"], choices=["incasso","factuur","pincode"], tr="A renda é paga por débito direto."),
    MC("Um amigo pagou o jantar e manda-lhe um «Tikkie». O que deve fazer?", ["*Pagar a sua parte pela app","Ignorar|Seria indelicado.","Ir ao banco|Não é preciso."], "Tikkie = pedido de pagamento.", ["v-tikkie"]),
    CO("text","Fatura", "Factuur nr. 2024-118\nBedrag: € 89,50\nTe betalen vóór: 30 juni\nIBAN: NL12 BANK 0123 4567 89\nOmschrijving: vermeld het factuurnummer",
       [("Quanto tem de pagar?", ["*89,50 €","118 €","30 €"]),("O que deve indicar na descrição?", ["*O número da fatura","O seu nome","Nada"])],
       "vermelden = indicar.", ["v-factuur","v-bedrag"]),
  ], diff=3, mins=6)

L(3, "Dinheiro e poupança", "sparen, uitgeven, het salaris, de lening.",
  ["Falar de dinheiro, gastos e poupança"],
  vocab=[V("v-sparen","sparen","poupar","verb"), V("v-uitgeven","uitgeven","gastar","verb",note="Ik geef veel geld uit aan eten."),
         V("v-salaris","salaris","salário","noun","het"), V("v-lening","lening","empréstimo","noun","de"), V("v-schuld","schuld","dívida|culpa","noun","de","schulden")],
  ex=[("Ik spaar voor een nieuwe fiets.","Poupo para uma bicicleta nova."),("Ik geef te veel geld uit.","Gasto dinheiro a mais."),("Mijn salaris komt op de 25e.","O meu salário chega no dia 25.")],
  review=["v-geld","v-duur","v-goedkoop"],
  cefr=C, exs=[
    MA([("sparen","poupar"),("uitgeven","gastar"),("salaris","salário"),("lening","empréstimo"),("schuld","dívida")], "Dinheiro.", ["v-sparen","v-uitgeven","v-salaris","v-lening","v-schuld"]),
    TR("pt-nl","Poupo para uma bicicleta nova.", ["Ik spaar voor een nieuwe fiets"], "sparen voor.", ["v-sparen"]),
    WO("Gasto muito dinheiro em comida.", ["Ik","geef","veel","geld","uit","aan","eten"], "uitgeven aan.", ["v-uitgeven"]),
    TR("nl-pt","Mijn salaris komt op de vijfentwintigste.", ["O meu salário chega no dia vinte e cinco","Recebo o salário no dia 25"], "op de 25e.", ["v-salaris"]),
    AR("salaris","o salário","het", "«Het salaris».", ["v-salaris"]),
    FE(["Ik","uitgeef","te","veel."], 1, "geef … uit", "Separável: ik geef te veel uit.", ["v-uitgeven"]),
    LI("Ik wil geen schulden maken.", ["Ik wil geen schulden maken"], "Não quero contrair dívidas.", "schulden maken.", ["v-schuld"]),
    FB("Voor een huis heb je vaak een ___ nodig.", ["lening","hypotheek"], "empréstimo.", ["v-lening"], choices=["lening","salaris","pincode"], tr="Para uma casa precisas muitas vezes de um empréstimo."),
    MC("O contrário de «sparen» é…", ["*uitgeven","overmaken|= transferir.","verdienen|= ganhar."], "gastar.", ["v-uitgeven"]),
    TR("pt-nl","Quanto gastas por mês?", ["Hoeveel geef [je|jij] per maand uit"], "Separável na pergunta.", ["v-uitgeven"]),
  ], diff=3, mins=5)

L(4, "Segurança e fraude", "oplichting, phishing, blokkeren, verdacht.",
  ["Reconhecer burlas e bloquear um cartão"],
  vocab=[V("v-oplichting","oplichting","burla","noun","de"), V("v-verdacht","verdacht","suspeito","adjective"), V("v-blokkeren","blokkeren","bloquear","verb"),
         V("v-gestolen","gestolen","roubado","adjective"), V("v-nooit-delen","delen","partilhar","verb")],
  ex=[("Mijn pinpas is gestolen. Ik wil hem blokkeren.","Roubaram-me o cartão. Quero bloqueá-lo."),("Deze e-mail is verdacht.","Este e-mail é suspeito."),("Deel nooit je pincode.","Nunca partilhes o teu PIN.")],
  gram=[G("g-fraude","Atenção a burlas","O banco **nunca** pede o PIN ou códigos por telefone, e-mail ou SMS. Mensagens como *«Hoi mam, mijn telefoon is kapot…»* (Olá mãe, o meu telemóvel avariou…) são uma burla conhecida. Em caso de dúvida, ligue para o número oficial do banco.",
    [("Bel nooit terug naar een onbekend nummer.","Nunca ligue de volta para um número desconhecido.")])],
  review=["v-pinpas","v-pincode","v-bank"],
  cefr=C, exs=[
    MA([("oplichting","burla"),("verdacht","suspeito"),("blokkeren","bloquear"),("gestolen","roubado"),("delen","partilhar")], "Segurança.", ["v-oplichting","v-verdacht","v-blokkeren","v-gestolen","v-nooit-delen"]),
    TR("pt-nl","Quero bloquear o meu cartão.", ["Ik wil mijn pinpas blokkeren","Ik wil mijn pas blokkeren"], "blokkeren.", ["v-blokkeren"]),
    TR("nl-pt","Deel nooit je pincode.", ["Nunca partilhes o (teu )PIN","Nunca partilhe o seu código PIN"], "delen.", ["v-nooit-delen"]),
    MC("Recebe um SMS do «banco» a pedir o PIN. É…", ["*Oplichting","Normaal|O banco nunca pede o PIN.","Een cadeau|Não."], "Burla.", ["v-oplichting"]),
    FE(["Mijn","pinpas","is","gestoolen."], 3, "gestolen", "gestolen.", ["v-gestolen"]),
    LI("Deze e-mail lijkt verdacht.", ["Deze e-mail lijkt verdacht"], "Este e-mail parece suspeito.", "lijken = parecer.", ["v-verdacht"]),
    DL([("Banco","Wat is het probleem?","Qual é o problema?"),("Cliente","")], ["*Mijn pas is gestolen, kunt u hem blokkeren?","Ik ben gestolen.|Diz «fui roubado» de forma estranha.","Mijn pincode is 1234.|Nunca diga o PIN!"], "Pedir bloqueio.", ["v-blokkeren"]),
    FB("Klik niet op links in ___ e-mails.", ["verdachte"], "suspeitos (-e antes do nome).", ["v-verdacht"], choices=["verdachte","verdacht","gestolen"], tr="Não cliques em links de e-mails suspeitos."),
    AR("oplichting","a burla","de", "-ing → de.", ["v-oplichting"]),
    WO("O banco nunca pede o seu PIN.", ["De","bank","vraagt","nooit","om","uw","pincode"], "vragen om = pedir.", ["v-pincode"]),
  ], diff=3, mins=6)

L(5, "Finanças do dia a dia", "Revisão: banco, pagamentos e segurança.",
  ["Gerir situações bancárias comuns"],
  ex=[("Ik maak de huur elke maand over via automatische incasso.","Pago a renda todos os meses por débito direto.")],
  review=["v-bankrekening","v-overmaken","v-factuur","v-sparen","v-uitgeven","v-blokkeren","v-pinpas","v-iban","v-oplichting"],
  cefr=C, exs=[
    MA([("overmaken","transferir"),("sparen","poupar"),("uitgeven","gastar"),("blokkeren","bloquear")], "Verbos.", ["v-overmaken","v-sparen","v-uitgeven","v-blokkeren"]),
    TR("pt-nl","Transferi-te o dinheiro.", ["Ik heb het geld overgemaakt","Ik heb je het geld overgemaakt"], "Particípio: overgemaakt.", ["v-overmaken"]),
    TR("nl-pt","Hoeveel spaar je per maand?", ["Quanto poupas por mês"], "sparen.", ["v-sparen"]),
    FE(["Ik","geef","veel","geld","uit","op","kleren."], 5, "aan", "uitgeven aan: geld uitgeven aan kleren.", ["v-uitgeven"]),
    LI("Uw rekening staat rood.", ["Uw rekening staat rood"], "A sua conta está a descoberto.", "rood staan = saldo negativo.", ["v-bankrekening"]),
    CO("dialogue","No banco", "Medewerker: Goedemiddag, waarmee kan ik u helpen?\nAna: Ik heb een verdachte sms gekregen. Ze vragen om mijn pincode.\nMedewerker: Dat is oplichting. Wij vragen nooit om uw pincode. Heeft u iets gedeeld?\nAna: Nee, gelukkig niet.\nMedewerker: Heel goed. Verwijder het bericht.",
       [("O que recebeu a Ana?", ["*Um SMS suspeito a pedir o PIN","O cartão novo","Uma fatura"]),("Partilhou o PIN?", ["*Não","Sim","Não se sabe"])],
       "verwijderen = apagar.", ["v-oplichting","v-verdacht"]),
    WO("Posso pagar a fatura com iDEAL?", ["Kan","ik","de","factuur","met","iDEAL","betalen?"], "Modal + infinitivo.", ["v-factuur"]),
    FB("Mijn pinpas is gestolen! Ik moet hem meteen ___.", ["blokkeren"], "bloquear.", ["v-blokkeren"], choices=["blokkeren","sparen","delen"], tr="Roubaram-me o cartão! Tenho de bloqueá-lo imediatamente."),
    TR("pt-nl","Qual é o teu IBAN? Envio-te um Tikkie.", ["Wat is [je|jouw] IBAN(?) Ik stuur je een Tikkie"], "Revisão.", ["v-iban","v-tikkie"]),
    SW("Escreva 2–3 frases sobre como gere o seu dinheiro (poupar, gastar, pagar).", ["Ik spaar elke maand [honderd|tweehonderd] euro(.) Ik geef veel geld uit aan eten"],
       ["Usa sparen e uitgeven","Partícula de «uitgeven» no lugar certo","Uma frase com «per maand» ou «elke maand»"], 8, "Modelo: «Ik spaar elke maand honderd euro. Ik geef veel geld uit aan eten en reizen.»", ["v-sparen"]),
  ], diff=3, mins=6)

W()
