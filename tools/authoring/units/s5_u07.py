import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u07")
C = "B1"

L(1, "Apps e telemóvel", "downloaden, installeren, bijwerken, de accu",
  ["Falar do uso diário do telemóvel e de aplicações"],
  vocab=[V("v-downloaden","downloaden","descarregar","verb",note="gedownload"), V("v-installeren","installeren","instalar","verb"),
         V("v-bijwerken","bijwerken","atualizar","verb",note="een update / bijwerken"), V("v-accu","accu","bateria","noun","de"),
         V("v-scherm","scherm","ecrã","noun","het")],
  ex=[("Ik heb de app gedownload.","Descarreguei a aplicação."),("Je moet de app bijwerken.","Tens de atualizar a aplicação."),("Mijn accu is bijna leeg.","A minha bateria está quase vazia."),("Het scherm is gebarsten.","O ecrã está rachado.")],
  gram=[G("g-engelse-werkwoorden","Verbos ingleses em neerlandês","Verbos de origem inglesa conjugam-se como verbos neerlandeses: *ik download, jij downloadt*; particípio **gedownload**, **geüpdatet**, **gecheckt**. Seguem 't kofschip pelo som: *gecheckt* (k) mas *gedownload* (d).",
    [("Heb je je mail al gecheckt?","Já viste o teu e-mail?")])],
  review=["v-telefoon","v-opladen","v-wachtwoord","v-inloggen"],
  cefr=C, exs=[
    MA([("downloaden","descarregar"),("installeren","instalar"),("bijwerken","atualizar"),("accu","bateria"),("scherm","ecrã")], "Telemóvel.", ["v-downloaden","v-installeren","v-bijwerken","v-accu","v-scherm"]),
    CJ("downloaden","ik","Ik heb de app al ___.", ["gedownload"], "ge- + download (sem -d extra).", ["v-downloaden"], tense="passado-perfeito"),
    TR("pt-nl","A minha bateria está quase vazia.", ["Mijn accu is bijna leeg","Mijn batterij is bijna leeg"], "de accu.", ["v-accu"]),
    TR("pt-nl","Tens de atualizar a aplicação.", ["Je moet de app bijwerken","Je moet de app updaten","Jij moet de app bijwerken"], "bijwerken/updaten.", ["v-bijwerken"]),
    TR("nl-pt","Het scherm is gebarsten.", ["O ecrã está rachado","O ecrã rachou","O ecrã partiu"], "het scherm.", ["v-scherm"]),
    AR("scherm","o ecrã","het", "Het scherm.", ["v-scherm"]),
    FE(["Ik","heb","de","app","gedownloadt."], 4, "gedownload", "O particípio termina em -d: gedownload.", ["v-downloaden"]),
    LI("Kun je de nieuwe versie installeren?", ["Kun je de nieuwe versie installeren","Kan je de nieuwe versie installeren"], "Podes instalar a versão nova?", "installeren.", ["v-installeren"]),
    FB("Mijn ___ is leeg, mag ik je oplader lenen?", ["accu"], "Bateria.", ["v-accu"], choices=["accu","scherm","app"], tr="Fiquei sem bateria, posso pedir emprestado o teu carregador?"),
    MC("«Heb je je mail al gecheckt?» significa…", ["*Já viste o teu e-mail?","Já mandaste o e-mail?|Isso é «verstuurd».","Já apagaste o e-mail?|Isso é «verwijderd»."], "checken.", []),
  ], diff=4, mins=6)

L(2, "Redes sociais", "posten, delen, volgen, een reactie achterlaten",
  ["Falar do que se faz nas redes sociais"],
  vocab=[V("v-posten","posten","publicar","verb"), V("v-volgen","volgen","seguir","verb"),
         V("v-sociale-media","sociale media","redes sociais","noun","de"), V("v-bericht-post","bericht","publicação|mensagem","noun","het",note="Ook: post"),
         V("v-verslaafd","verslaafd (aan)","viciado (em)","adjective")],
  ex=[("Ik post bijna nooit iets.","Quase nunca publico nada."),("Hoeveel mensen volgen je?","Quantas pessoas te seguem?"),("Ze zit de hele dag op sociale media.","Ela passa o dia nas redes sociais."),("Ik ben een beetje verslaafd aan mijn telefoon.","Sou um bocado viciado no telemóvel.")],
  review=["v-delen","v-foto","v-reactie"],
  cefr=C, exs=[
    MA([("posten","publicar"),("volgen","seguir"),("sociale media","redes sociais"),("verslaafd","viciado")], "Redes sociais.", ["v-posten","v-volgen","v-sociale-media","v-verslaafd"]),
    TR("pt-nl","Quantas pessoas te seguem?", ["Hoeveel mensen volgen je","Hoeveel mensen volgen jou"], "volgen.", ["v-volgen"]),
    TR("pt-nl","Sou um bocado viciado no telemóvel.", ["Ik ben een beetje verslaafd aan mijn telefoon","Ik ben een beetje verslaafd aan mijn mobiel"], "verslaafd aan.", ["v-verslaafd"]),
    TR("nl-pt","Ze zit de hele dag op sociale media.", ["Ela passa o dia (todo) nas redes sociais","Ela está o dia todo nas redes sociais"], "op sociale media zitten.", ["v-sociale-media"]),
    FB("Hij is verslaafd ___ games.", ["aan"], "verslaafd aan.", ["v-verslaafd"], choices=["aan","op","van"], tr="Ele é viciado em jogos."),
    CJ("posten","zij (ela)","Ze heeft een foto van haar hond ___.", ["gepost"], "post → gepost (t).", ["v-posten"], tense="passado-perfeito"),
    AR("bericht","a publicação","het", "Het bericht.", ["v-bericht-post"]),
    LI("Dit bericht is al duizend keer gedeeld.", ["Dit bericht is al duizend keer gedeeld","Dit bericht is al 1000 keer gedeeld"], "Esta publicação já foi partilhada mil vezes.", "gedeeld.", ["v-bericht-post","v-delen"]),
    MC("«Ik volg je op Instagram» significa…", ["*Sigo-te no Instagram","Persigo-te|Não neste contexto.","Copio-te|Não."], "volgen.", ["v-volgen"]),
    SW("Descreva o seu uso das redes sociais em 2–3 frases.", ["Ik zit elke dag ongeveer een uur op sociale media. Ik post niet veel, maar ik volg veel nieuwspagina's."], ["Frequência", "**posten / volgen**", "Um conector (**maar / want**)"], 15, "Hábitos digitais.", ["v-sociale-media"]),
  ], diff=4, mins=6)

L(3, "Privacidade e segurança online", "persoonsgegevens, phishing, tweestapsverificatie",
  ["Compreender avisos de segurança e proteger os dados"],
  vocab=[V("v-persoonsgegevens","persoonsgegevens","dados pessoais","noun","de"), V("v-privacy","privacy","privacidade","noun","de"),
         V("v-nepbericht","nepbericht","mensagem falsa","noun","het"), V("v-tweestapsverificatie","tweestapsverificatie","autenticação em dois passos","noun","de"),
         V("v-hacken","hacken","piratear","verb",note="gehackt")],
  ex=[("Deel nooit je persoonsgegevens via de telefoon.","Nunca partilhes os teus dados pessoais ao telefone."),("Mijn account is gehackt!","A minha conta foi pirateada!"),("Zet tweestapsverificatie aan.","Ativa a autenticação em dois passos."),("Dit is een nepbericht van een oplichter.","Esta é uma mensagem falsa de um burlão.")],
  review=["v-oplichting","v-wachtwoord","v-nooit-delen","v-verdacht"],
  cefr=C, exs=[
    MA([("persoonsgegevens","dados pessoais"),("privacy","privacidade"),("nepbericht","mensagem falsa"),("tweestapsverificatie","dois passos"),("hacken","piratear")], "Segurança.", ["v-persoonsgegevens","v-privacy","v-nepbericht","v-tweestapsverificatie","v-hacken"]),
    TR("pt-nl","A minha conta foi pirateada!", ["Mijn account is gehackt","Mijn account werd gehackt"], "gehackt.", ["v-hacken"]),
    TR("nl-pt","Zet tweestapsverificatie aan.", ["Ativa a autenticação em dois passos","Liga a verificação em dois passos"], "aanzetten.", ["v-tweestapsverificatie"]),
    MC("Recebe: «Uw pakket wacht. Betaal €1,99 via deze link.» É provavelmente…", ["*um nepbericht (phishing)","uma mensagem oficial|Desconfie de links de pagamento inesperados.","um presente|Não."], "Phishing.", ["v-nepbericht"]),
    MC("O banco pede o seu código por telefone. Deve…", ["*desligar: o banco nunca pede códigos","dar o código|Nunca.","enviar por e-mail|Nunca."], "Segurança.", ["v-persoonsgegevens"]),
    AR("nepbericht","a mensagem falsa","het", "Het bericht.", ["v-nepbericht"]),
    FE(["Mijn","account","is","gehackd."], 3, "gehackt", "k está em 't kofschip → gehackt.", ["v-hacken"]),
    LI("Klik nooit op een link in een verdacht bericht.", ["Klik nooit op een link in een verdacht bericht"], "Nunca cliques num link de uma mensagem suspeita.", "verdacht.", ["v-verdacht"]),
    WO("Nunca partilhes os teus dados pessoais.", ["Deel","nooit","je","persoonsgegevens"], "Imperativo.", ["v-persoonsgegevens"]),
    FB("Ik vind ___ heel belangrijk: ik deel weinig online.", ["privacy"], "Privacidade.", ["v-privacy"], choices=["privacy","accu","scherm"], tr="Acho a privacidade muito importante: partilho pouco online."),
  ], diff=4, mins=6)

L(4, "Pedir ajuda técnica", "Het werkt niet. Heb je het al opnieuw opgestart?",
  ["Explicar um problema técnico e seguir instruções"],
  vocab=[V("v-opnieuw-opstarten","opnieuw opstarten","reiniciar","verb"), V("v-instellingen","instellingen","definições","noun","de"),
         V("v-aanzetten","aanzetten","ligar (aparelho)","verb"), V("v-uitzetten","uitzetten","desligar (aparelho)","verb")],
  ex=[("Mijn laptop loopt steeds vast.","O meu portátil está sempre a bloquear."),("Zet hem uit en weer aan.","Desliga-o e volta a ligá-lo."),("Ga naar instellingen.","Vai às definições."),("Heb je hem al opnieuw opgestart?","Já o reiniciaste?")],
  review=["v-vastlopen","v-het-doet-het-niet","v-foutmelding","v-probleem"],
  cefr=C, exs=[
    MA([("opnieuw opstarten","reiniciar"),("instellingen","definições"),("aanzetten","ligar"),("uitzetten","desligar"),("vastlopen","bloquear")], "Técnico.", ["v-opnieuw-opstarten","v-instellingen","v-aanzetten","v-uitzetten","v-vastlopen"]),
    TR("pt-nl","Desliga-o e volta a ligá-lo.", ["Zet hem uit en weer aan","Zet het uit en weer aan"], "uit- en aanzetten.", ["v-uitzetten","v-aanzetten"]),
    TR("pt-nl","O meu portátil está sempre a bloquear.", ["Mijn laptop loopt steeds vast","Mijn laptop loopt telkens vast","Mijn laptop loopt vaak vast"], "vastlopen.", ["v-vastlopen"]),
    TR("nl-pt","Ga naar instellingen.", ["Vai às definições","Vá às definições"], "instellingen.", ["v-instellingen"]),
    CJ("opstarten","jij","Heb je hem al opnieuw ___?", ["opgestart"], "op-ge-start.", ["v-opnieuw-opstarten"], tense="passado-perfeito"),
    FE(["Mijn","computer","vastloopt","steeds."], 2, "loopt … vast", "Separável: Mijn computer loopt steeds vast.", ["v-vastlopen"]),
    DL([("IT","Wat gebeurt er precies?","O que acontece exatamente?"),("Ana","")], ["*Als ik Teams open, loopt mijn laptop vast.","Mijn laptop.|Incompleto.","Ik heb een laptop gekocht.|Não descreve o problema."], "Descrever o que acontece.", ["v-vastlopen"]),
    LI("Zet de wifi uit en weer aan.", ["Zet de wifi uit en weer aan"], "Desliga o wi-fi e volta a ligá-lo.", "uit/aan.", ["v-uitzetten"]),
    MC("O contrário de «aanzetten» é…", ["*uitzetten","opzetten|Isso é montar/pôr.","inzetten|Isso é usar/empregar."], "aan/uit.", ["v-uitzetten"]),
    WO("Já o reiniciaste?", ["Heb","je","hem","al","opnieuw","opgestart?"], "Perfectum.", ["v-opnieuw-opstarten"]),
  ], diff=4, mins=6)

L(5, "Debate: ecrãs e crianças", "schermtijd, digitaal, offline",
  ["Discutir o uso de tecnologia pelas crianças"],
  vocab=[V("v-schermtijd","schermtijd","tempo de ecrã","noun","de"), V("v-digitaal","digitaal","digital","adjective"),
         V("v-offline","offline","desligado|sem internet","adjective"), V("v-beperken","beperken","limitar","verb")],
  ex=[("Kinderen hebben te veel schermtijd.","As crianças passam demasiado tempo em frente a ecrãs."),("We beperken de schermtijd tot een uur per dag.","Limitamos o tempo de ecrã a uma hora por dia."),("In het weekend gaan we offline.","Ao fim de semana desligamo-nos."),("Digitale vaardigheden zijn belangrijk.","As competências digitais são importantes.")],
  review=["v-volgens-mij","v-kind","v-aan-de-ene-kant","v-mening"],
  cefr=C, exs=[
    MA([("schermtijd","tempo de ecrã"),("digitaal","digital"),("offline","desligado"),("beperken","limitar")], "Ecrãs.", ["v-schermtijd","v-digitaal","v-offline","v-beperken"]),
    TR("pt-nl","Limitamos o tempo de ecrã a uma hora por dia.", ["We beperken de schermtijd tot een uur per dag","Wij beperken de schermtijd tot een uur per dag","We beperken de schermtijd tot één uur per dag"], "beperken tot.", ["v-beperken"]),
    TR("nl-pt","In het weekend gaan we offline.", ["Ao fim de semana desligamo-nos","Ao fim de semana ficamos offline"], "offline gaan.", ["v-offline"]),
    FE(["Digitaal","vaardigheden","zijn","belangrijk."], 0, "Digitale", "Antes de plural: digitale.", ["v-digitaal"]),
    FB("Ouders moeten de schermtijd ___.", ["beperken"], "Limitar.", ["v-beperken"], choices=["beperken","downloaden","posten"], tr="Os pais devem limitar o tempo de ecrã."),
    CO("text","Telefoons uit de klas", "Sinds 2024 zijn mobiele telefoons in de meeste Nederlandse klaslokalen niet meer toegestaan. Scholen zeggen dat leerlingen zich beter kunnen concentreren. Leerlingen mogen hun telefoon alleen gebruiken als de leraar dat vraagt, bijvoorbeeld voor een opdracht. Sommige leerlingen vinden het vervelend, maar veel leraren zijn positief.",
       [("O que mudou desde 2024?", ["*Os telemóveis deixaram de ser permitidos na maioria das salas de aula","Todos os alunos receberam tablets","As aulas passaram a ser online"]),("Quando podem usar o telemóvel?", ["*Quando o professor pede, por exemplo para um trabalho","Sempre no intervalo dentro da aula","Nunca, nem na escola toda"])],
       "toegestaan = permitido.", ["v-schermtijd","v-digitaal"]),
    LI("Te veel schermtijd is slecht voor je ogen.", ["Te veel schermtijd is slecht voor je ogen"], "Demasiado tempo de ecrã faz mal aos olhos.", "schermtijd.", ["v-schermtijd"]),
    MC("Qual destas é uma opinião (e não um facto)?", ["*Ik vind dat kinderen geen telefoon nodig hebben.","Scholen hebben telefoons verboden.|Facto.","Een uur heeft zestig minuten.|Facto."], "ik vind dat.", ["v-mening"]),
    WO("Na minha opinião, as crianças precisam de tempo offline.", ["Volgens","mij","hebben","kinderen","offline","tijd","nodig"], "Inversão.", ["v-volgens-mij","v-offline"]),
    SW("Que regras de ecrã acha boas para crianças de 10 anos? (3 frases)", ["Ik vind dat kinderen van tien maximaal een uur schermtijd per dag moeten hebben. Aan de ene kant is digitaal leren nuttig, aan de andere kant moeten ze ook buiten spelen. Daarom zou ik geen telefoon in de slaapkamer toestaan."], ["Regra concreta", "Dois lados", "Conector (**daarom/dus**) com ordem certa"], 25, "Opinião sobre ecrãs.", ["v-schermtijd","v-beperken"]),
  ], diff=4, mins=8)

W()
