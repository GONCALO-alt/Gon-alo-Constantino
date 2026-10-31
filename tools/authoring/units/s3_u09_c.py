import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u09")
C = "A2"
# Lições extra (10–15): IND, assinar documentos, lixo, senhas de espera, DigiD em segurança.
# Informação administrativa geral; as regras mudam — confirmar sempre nas fontes oficiais.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Autorização de residência", "De IND en de verblijfsvergunning.",
  ["Saber o que é a IND e quem precisa de autorização de residência"],
  vocab=[X("v-ind","IND","Serviço de Imigração e Naturalização"), N("v-verblijfsvergunning","verblijfsvergunning","autorização de residência","de")],
  ex=[("De IND beslist over verblijfsvergunningen.","A IND decide sobre as autorizações de residência."),("Als Portugees heb je geen verblijfsvergunning nodig; je schrijft je in bij de gemeente.","Como português não precisas de autorização de residência; registas-te na câmara.")],
  gram=[G("g-s3u09c-1","Cidadãos da UE","Cidadãos da União Europeia (como os portugueses) **não precisam** de *verblijfsvergunning* para viver e trabalhar nos Países Baixos, mas devem **inscrever-se na gemeente** se ficarem mais de 4 meses. Cidadãos de fora da UE tratam do processo com a **IND**. Confirma sempre as regras atuais em ind.nl e no site da tua câmara.")],
  review=["v-gemeente","v-inschrijven","v-bsn"],
  cefr=C, exs=[
    MA([("IND","serviço de imigração"),("verblijfsvergunning","autorização de residência"),("gemeente","câmara municipal"),("BSN","número de cidadão")], "Instituições.", ["v-ind","v-verblijfsvergunning","v-gemeente","v-bsn"]),
    MC("Uma portuguesa muda-se para Utrecht por um ano. O que tem de fazer?", ["*Inscrever-se na gemeente","Pedir verblijfsvergunning à IND|Cidadãos da UE não precisam.","Nada|Mais de 4 meses: inscrição."], "Regra UE.", ["v-inschrijven"]),
    TR("pt-nl","Preciso de uma autorização de residência?", ["Heb ik een verblijfsvergunning nodig?"], "nodig hebben.", ["v-verblijfsvergunning"]),
    TR("pt-nl","Vou registar-me na câmara.", ["Ik ga me inschrijven bij de gemeente(.)","Ik schrijf me in bij de gemeente(.)"], "zich inschrijven.", ["v-inschrijven"]),
    FB("Na de inschrijving krijg je een ___.", ["BSN"], "Número.", ["v-bsn"], choices=["BSN","IND","loket"], tr="Depois do registo recebes um BSN."),
    LI("Mijn collega uit Brazilië heeft een afspraak bij de IND.", ["Mijn collega uit Brazilië heeft een afspraak bij de IND(.)"], "O meu colega do Brasil tem uma marcação na IND.", "Ouvir.", ["v-ind"]),
    MC("Onde confirmas as regras atuais?", ["*nos sites oficiais (ind.nl, gemeente)","num fórum antigo|Pode estar desatualizado.","em lado nenhum|Não."], "Boa prática.", ["v-ind"]),
    AR("verblijfsvergunning", "autorização de residência", "de", "-ing → de.", ["v-verblijfsvergunning"]),
  ], diff=2, mins=4)

L(11, "Preencher e assinar", "Invullen en ondertekenen.",
  ["Preencher e assinar documentos oficiais"],
  vocab=[X("v-ondertekenen","ondertekenen","assinar","verb")],
  ex=[("Vul het formulier in en onderteken het onderaan.","Preencha o formulário e assine-o no fundo."),("Hier uw handtekening, alstublieft.","Aqui a sua assinatura, por favor.")],
  review=["v-invullen","v-handtekening","v-formulier","v-geboortedatum","v-achternaam"],
  cefr=C, exs=[
    MA([("invullen","preencher"),("ondertekenen","assinar"),("handtekening","assinatura"),("geboortedatum","data de nascimento")], "Formulários.", ["v-invullen","v-ondertekenen","v-handtekening","v-geboortedatum"]),
    MC("Num formulário, «Achternaam» pede…", ["*o apelido","o primeiro nome|Isso é voornaam.","a morada|Não."], "Campos.", ["v-achternaam"]),
    TR("pt-nl","Preencha o formulário.", ["Vul het formulier in(.)"], "invullen.", ["v-invullen"]),
    TR("pt-nl","Onde tenho de assinar?", ["Waar moet ik ondertekenen?","Waar moet ik tekenen?"], "ondertekenen.", ["v-ondertekenen"]),
    FB("Zet hier uw ___.", ["handtekening"], "Assinatura.", ["v-handtekening"], choices=["handtekening","geboortedatum","formulier"], tr="Ponha aqui a sua assinatura."),
    LI("Vergeet niet het formulier te ondertekenen.", ["Vergeet niet het formulier te ondertekenen(.)"], "Não se esqueça de assinar o formulário.", "Ouvir.", ["v-ondertekenen"]),
    DL([("Baliemedewerker","U heeft het formulier niet ondertekend.","Não assinou o formulário."),("Jij","","")], ["*O, sorry! Waar moet ik tekenen?","Ik ben formulier.|Não.","Geboortedatum.|Não."], "Corrigir.", ["v-ondertekenen"]),
    WO("Preencha o formulário.", ["Vul","het","formulier","in."], "Separável.", ["v-invullen"]),
  ], diff=2, mins=4)

L(12, "O lixo", "Afval scheiden.",
  ["Separar o lixo segundo as regras da câmara"],
  vocab=[X("v-afval-scheiden","afval scheiden","separar o lixo","verb"), N("v-glasbak","glasbak","vidrão","de"), N("v-grofvuil","grofvuil","monos (lixo volumoso)","het")],
  ex=[("In Nederland moet je afval scheiden.","Nos Países Baixos tens de separar o lixo."),("Lege flessen gaan in de glasbak.","As garrafas vazias vão para o vidrão.")],
  review=["v-gemeente","v-papier"],
  cefr=C, exs=[
    MA([("afval scheiden","separar o lixo"),("glasbak","vidrão"),("grofvuil","monos"),("papier","papel")], "Lixo.", ["v-afval-scheiden","v-glasbak","v-grofvuil","v-papier"]),
    MC("Uma garrafa de vinho vazia vai para…", ["*de glasbak","het grofvuil|Isso é para móveis grandes.","de gewone vuilnisbak|Separa-se o vidro."], "Lógica.", ["v-glasbak"]),
    MC("Um sofá velho é…", ["*grofvuil (marca recolha com a gemeente)","papier|Não.","glas|Não."], "Lógica.", ["v-grofvuil"]),
    TR("pt-nl","Separo o lixo.", ["Ik scheid het afval(.)","Ik scheid mijn afval(.)"], "scheiden.", ["v-afval-scheiden"]),
    TR("pt-nl","As garrafas vão para o vidrão.", ["De flessen gaan in de glasbak(.)","Flessen gaan in de glasbak(.)"], "glasbak.", ["v-glasbak"]),
    FB("Voor ___ maak je een afspraak met de gemeente.", ["grofvuil"], "Monos.", ["v-grofvuil"], choices=["grofvuil","glasbak","papier"], tr="Para os monos marcas uma recolha com a câmara."),
    LI("Op dinsdag halen ze het papier op.", ["Op dinsdag halen ze het papier op(.)"], "À terça recolhem o papel.", "Ouvir.", ["v-papier"]),
    MC("Os dias de recolha estão…", ["*no site ou na app da tua gemeente","iguais em todo o país|Variam.","escritos nos semáforos|Não."], "Onde ver.", ["v-gemeente"]),
  ], diff=2, mins=4)

L(13, "Tirar senha e esperar", "Een nummertje trekken.",
  ["Orientar-te num balcão público"],
  vocab=[X("v-nummertje-trekken","een nummertje trekken","tirar uma senha")],
  ex=[("Trek eerst een nummertje bij de ingang.","Tire primeiro uma senha à entrada."),("Nummer 45, balie 3.","Número 45, balcão 3.")],
  review=["v-balie","v-loket","v-wachten-op","v-afspraak"],
  cefr=C, exs=[
    MA([("een nummertje trekken","tirar senha"),("balie","balcão"),("loket","guiché"),("wachten op","esperar por")], "Balcão.", ["v-nummertje-trekken","v-balie","v-loket","v-wachten-op"]),
    TR("pt-nl","Tire primeiro uma senha.", ["Trek eerst een nummertje(.)"], "Imperativo.", ["v-nummertje-trekken"]),
    TR("pt-nl","Estou à espera da minha vez.", ["Ik wacht op mijn beurt(.)"], "wachten op.", ["v-wachten-op"]),
    LI("Nummer achtenvijftig, balie twee.", ["Nummer achtenvijftig(,) balie twee(.)","Nummer 58(,) balie 2(.)"], "Número 58, balcão 2.", "Chamada.", ["v-balie"]),
    MC("Muitas câmaras neerlandesas funcionam…", ["*com marcação (online), sem marcação esperas mais ou não és atendido","sempre sem marcação|Muitas exigem marcação.","só por correio|Não."], "Sistema.", ["v-afspraak"]),
    DL([("Medewerker","Heeft u een afspraak?","Tem marcação?"),("Jij","","")], ["*Ja, om tien uur, op naam van Ferreira.","Ik ben nummertje.|Não.","Balie.|Não."], "Responder.", ["v-afspraak"]),
    FB("U kunt naar ___ vier.", ["balie"], "Balcão.", ["v-balie"], choices=["balie","nummer","loket"], tr="Pode dirigir-se ao balcão quatro."),
    WO("Tire uma senha.", ["Trek","een","nummertje."], "Imperativo.", ["v-nummertje-trekken"]),
  ], diff=2, mins=4)

L(14, "DigiD em segurança", "Nooit je DigiD delen.",
  ["Usar o DigiD com segurança"],
  vocab=[],
  ex=[("Deel je DigiD-wachtwoord met niemand.","Não partilhes a palavra-passe do DigiD com ninguém."),("Log in met de DigiD-app.","Entre com a app DigiD.")],
  review=["v-digid","v-inloggen","v-wachtwoord","v-belastingdienst"],
  cefr=C, exs=[
    MA([("DigiD","identidade digital"),("inloggen","entrar (login)"),("wachtwoord","palavra-passe"),("Belastingdienst","Finanças")], "Online.", ["v-digid","v-inloggen","v-wachtwoord","v-belastingdienst"]),
    MC("Alguém liga «da câmara» e pede o teu código DigiD. Fazes o quê?", ["*Não dás; desligas — é burla","Dás, porque é oficial|Nunca se pede por telefone.","Dás metade|Não."], "Segurança.", ["v-wachtwoord"]),
    TR("pt-nl","Entro com o DigiD.", ["Ik log in met DigiD(.)","Ik log in met mijn DigiD(.)"], "inloggen.", ["v-inloggen","v-digid"]),
    TR("pt-nl","Nunca partilhes a palavra-passe.", ["Deel nooit je wachtwoord(.)","Deel je wachtwoord nooit(.)"], "delen.", ["v-wachtwoord","v-wachtwoord"]),
    FB("Met DigiD kun je inloggen bij de ___.", ["Belastingdienst"], "Finanças.", ["v-belastingdienst"], choices=["Belastingdienst","glasbak","kapper"], tr="Com o DigiD podes entrar nas Finanças."),
    LI("Uw DigiD is persoonlijk.", ["Uw DigiD is persoonlijk(.)"], "O seu DigiD é pessoal.", "Ouvir.", ["v-digid"]),
    MC("Qual é a ordem correta?", ["*Ik log in met de app.","Ik inlog met de app.|Separável."], "Separável.", ["v-inloggen"]),
    WO("Não partilhes o DigiD.", ["Deel","je","DigiD","niet."], "Imperativo.", ["v-wachtwoord"]),
  ], diff=2, mins=4)

L(15, "Prática: o primeiro dia na câmara", "Inschrijven bij de gemeente.",
  ["Fazer o registo na câmara do início ao fim"],
  vocab=[],
  ex=[("(Fictício) Ik heb een afspraak om 10.00 uur. Ik neem mijn paspoort en mijn huurcontract mee.","Tenho marcação às 10h. Levo o passaporte e o contrato de arrendamento.")],
  review=["v-inschrijven","v-bsn","v-ondertekenen","v-nummertje-trekken","v-adres","v-paspoort"],
  cefr=C, exs=[
    MC("O que levas para te inscreveres na gemeente?", ["*documento de identificação e prova de morada (por ex. contrato)","só um cartão de biblioteca|Não.","nada|Não."], "Preparar (confirma a lista no site).", ["v-inschrijven"]),
    DL([("Baliemedewerker","Goedemorgen. Waarvoor komt u?","Bom dia. Vem para quê?"),("Jij","","")], ["*Ik wil me inschrijven. Ik woon sinds kort in deze gemeente.","Ik ben gemeente.|Não.","BSN.|Incompleto."], "Explicar.", ["v-inschrijven"]),
    DL([("Baliemedewerker","Mag ik uw paspoort en huurcontract zien?","Posso ver o passaporte e o contrato?"),("Jij","","")], ["*Ja, alstublieft.","Nee, ik ben vergeten.|Incompleto.","Glasbak.|Não."], "Mostrar.", ["v-adres"]),
    TR("pt-nl","Moro aqui há pouco tempo.", ["Ik woon hier sinds kort(.)"], "sinds kort.", ["v-wonen"]),
    LI("Uw BSN krijgt u binnen een paar dagen per post.", ["Uw BSN krijgt u binnen een paar dagen per post(.)"], "Recebe o BSN por correio dentro de poucos dias.", "Ouvir (prazo de exemplo).", ["v-bsn"]),
    BS("Preencha e assine o formulário.", ["Vul","het","formulier","in","en","onderteken","het."], ["Vul het formulier in en onderteken het."], "Dois imperativos.", ["v-invullen","v-ondertekenen"]),
    FB("Bij de ingang moet u een ___ trekken.", ["nummertje"], "Senha.", ["v-nummertje-trekken"], choices=["nummertje","balie","BSN"], tr="À entrada tem de tirar uma senha."),
    SW("Escreva uma lista do que fazer para se registar (4 passos).", ["1. Een afspraak maken bij de gemeente.\n2. Paspoort en huurcontract meenemen.\n3. Het formulier invullen en ondertekenen.\n4. Wachten op mijn BSN."], ["4 passos","Vocabulário oficial"], 20, "Planear.", ["v-inschrijven"]),
  ], diff=2, mins=5)

W()
