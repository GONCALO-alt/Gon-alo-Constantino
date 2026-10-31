import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u12")
C = "A2"
# Lições extra (10–15): poupança, despesas fixas, pedidos de pagamento, burlas, faturas.
# Informação geral, sem conselhos financeiros personalizados.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Poupar", "Een spaarrekening.",
  ["Falar de poupar dinheiro"],
  vocab=[N("v-spaarrekening","spaarrekening","conta poupança","de")],
  ex=[("Elke maand zet ik honderd euro op mijn spaarrekening.","Todos os meses ponho cem euros na conta poupança."),("We sparen voor een vakantie.","Poupamos para umas férias.")],
  review=["v-sparen","v-bankrekening","v-overmaken"],
  cefr=C, exs=[
    MA([("spaarrekening","conta poupança"),("sparen","poupar"),("bankrekening","conta bancária"),("overmaken","transferir")], "Banco.", ["v-spaarrekening","v-sparen","v-bankrekening","v-overmaken"]),
    TR("pt-nl","Poupamos para umas férias.", ["We sparen voor een vakantie(.)","Wij sparen voor een vakantie(.)"], "sparen voor.", ["v-sparen"]),
    TR("pt-nl","Transfiro dinheiro para a conta poupança.", ["Ik maak geld over naar mijn spaarrekening(.)","Ik maak geld over naar de spaarrekening(.)"], "overmaken.", ["v-overmaken","v-spaarrekening"]),
    FB("Ik zet geld opzij op mijn ___.", ["spaarrekening"], "Poupança.", ["v-spaarrekening"], choices=["spaarrekening","pinpas","factuur"], tr="Ponho dinheiro de lado na conta poupança."),
    MC("Qual é a ordem correta?", ["*Ik maak het geld vandaag over.","Ik overmaak het geld vandaag.|Separável."], "Separável.", ["v-overmaken"]),
    LI("We sparen elke maand een beetje.", ["We sparen elke maand een beetje(.)","Wij sparen elke maand een beetje(.)"], "Poupamos um pouco todos os meses.", "Ouvir.", ["v-sparen"]),
    DL([("Bankmedewerker","Wilt u ook een spaarrekening openen?","Quer abrir também uma conta poupança?"),("Jij","","")], ["*Ja, graag. Kan dat online?","Ik ben spaar.|Não.","Overmaken.|Não."], "Responder.", ["v-spaarrekening"]),
    AR("spaarrekening", "conta poupança", "de", "-ing → de.", ["v-spaarrekening"]),
  ], diff=2, mins=4)

L(11, "Despesas fixas", "Vaste lasten en budget.",
  ["Falar das despesas mensais e do orçamento"],
  vocab=[X("v-vaste-lasten","vaste lasten","despesas fixas"), N("v-budget","budget","orçamento","het","budgetten")],
  ex=[("Mijn vaste lasten zijn huur, energie en de zorgverzekering.","As minhas despesas fixas são a renda, a energia e o seguro de saúde."),("Ik maak een budget voor de maand.","Faço um orçamento para o mês.")],
  review=["v-salaris","v-uitgeven","v-huur","v-zorgverzekering"],
  cefr=C, exs=[
    MA([("vaste lasten","despesas fixas"),("budget","orçamento"),("salaris","salário"),("uitgeven","gastar")], "Dinheiro.", ["v-vaste-lasten","v-budget","v-salaris","v-uitgeven"]),
    MC("Qual destas NÃO é normalmente uma despesa fixa?", ["*um jantar fora|Varia.","a renda","o seguro de saúde"], "Lógica.", ["v-vaste-lasten"]),
    TR("pt-nl","Faço um orçamento.", ["Ik maak een budget(.)"], "budget.", ["v-budget"]),
    TR("pt-nl","Gasto demasiado em roupa.", ["Ik geef te veel uit aan kleren(.)","Ik geef te veel geld uit aan kleding(.)"], "uitgeven aan.", ["v-uitgeven"]),
    FB("Na mijn ___ blijft er niet veel over.", ["vaste lasten"], "Despesas fixas.", ["v-vaste-lasten"], choices=["vaste lasten","budget","salaris"], tr="Depois das despesas fixas não sobra muito."),
    LI("Mijn salaris komt op de vijfentwintigste.", ["Mijn salaris komt op de vijfentwintigste(.)","Mijn salaris komt op de 25e(.)"], "O meu salário chega no dia 25.", "Ouvir.", ["v-salaris"]),
    AR("budget", "orçamento", "het", "het budget.", ["v-budget"]),
    WO("Gasto pouco.", ["Ik","geef","weinig","uit."], "Separável.", ["v-uitgeven"]),
  ], diff=2, mins=4)

L(12, "Pedidos de pagamento", "Een betaalverzoek.",
  ["Pedir e pagar pequenas quantias entre amigos"],
  vocab=[N("v-betaalverzoek","betaalverzoek","pedido de pagamento","het")],
  ex=[("Ik stuur je een betaalverzoek van tien euro.","Mando-te um pedido de pagamento de dez euros."),("Ik heb het al betaald.","Já paguei.")],
  review=["v-tikkie","v-bedrag","v-iban"],
  cefr=C, exs=[
    MA([("betaalverzoek","pedido de pagamento"),("bedrag","montante"),("IBAN","número de conta"),("Tikkie","pedido (app)")], "Pagar.", ["v-betaalverzoek","v-bedrag","v-iban","v-tikkie"]),
    TR("pt-nl","Mando-te um pedido de pagamento.", ["Ik stuur je een betaalverzoek(.)","Ik stuur je een Tikkie(.)"], "betaalverzoek.", ["v-betaalverzoek"]),
    TR("pt-nl","Já paguei.", ["Ik heb het al betaald(.)","Ik heb al betaald(.)"], "betaald.", ["v-bedrag"]),
    FB("Wat is het ___? — Twaalf euro vijftig.", ["bedrag"], "Montante.", ["v-bedrag"], choices=["bedrag","budget","IBAN"], tr="Qual é o montante? — Doze euros e cinquenta."),
    MC("Recebes um «betaalverzoek» de alguém que NÃO conheces, de valor estranho. Fazes…", ["*Não pagas e verificas — pode ser burla","Pagas logo|Arriscado.","Mandas o teu código PIN|Nunca."], "Segurança.", ["v-betaalverzoek"]),
    LI("Kun je me je IBAN sturen?", ["Kun je me je IBAN sturen(?)","Kan je me je IBAN sturen(?)"], "Podes mandar-me o teu IBAN?", "Ouvir.", ["v-iban"]),
    DL([("Vriend","Ik heb de kaartjes betaald. Zal ik je een Tikkie sturen?","Paguei os bilhetes. Mando-te um Tikkie?"),("Jij","","")], ["*Ja, prima, dan betaal ik meteen.","Ik ben Tikkie.|Não.","IBAN.|Incompleto."], "Aceitar.", ["v-tikkie"]),
    AR("betaalverzoek", "pedido de pagamento", "het", "het verzoek.", ["v-betaalverzoek"]),
  ], diff=2, mins=4)

L(13, "Burlas por mensagem", "Phishing herkennen.",
  ["Reconhecer mensagens falsas do «banco»"],
  vocab=[N("v-phishing","phishing","phishing (burla online)","de")],
  ex=[("Je bank vraagt nooit om je pincode.","O teu banco nunca pede o teu PIN."),("Dit is phishing: klik niet op de link!","Isto é phishing: não cliques no link!")],
  review=["v-oplichting","v-verdacht","v-pincode","v-blokkeren","v-nooit-delen"],
  cefr=C, exs=[
    MA([("phishing","burla online"),("oplichting","burla"),("verdacht","suspeito"),("blokkeren","bloquear")], "Segurança.", ["v-phishing","v-oplichting","v-verdacht","v-blokkeren"]),
    MC("(SMS fictícia) «Uw pas verloopt! Klik hier en vul uw pincode in.» É…", ["*phishing — o banco nunca pede o PIN","normal|Não.","um presente|Não."], "Reconhecer.", ["v-phishing"]),
    TR("pt-nl","Esta mensagem é suspeita.", ["Dit bericht is verdacht(.)"], "verdacht.", ["v-verdacht"]),
    TR("pt-nl","Nunca partilhes o teu PIN.", ["Deel nooit je pincode(.)","Deel je pincode nooit(.)"], "pincode.", ["v-pincode","v-nooit-delen"]),
    FB("Mijn pas is gestolen; ik laat hem meteen ___.", ["blokkeren"], "Bloquear.", ["v-blokkeren"], choices=["blokkeren","delen","sparen"], tr="Roubaram-me o cartão; mando bloqueá-lo logo."),
    LI("Klik nooit op een link in een verdachte sms.", ["Klik nooit op een link in een verdachte sms(.)"], "Nunca cliques num link de uma SMS suspeita.", "Conselho.", ["v-verdacht"]),
    DL([("«Bank» (telefoon)","Wij zijn van uw bank. Wat is uw pincode?","Somos do seu banco. Qual é o seu PIN?"),("Jij","","")], ["*Dat geef ik nooit door. Ik hang op en bel zelf mijn bank.","1234.|Nunca!","Ik ben bank.|Não."], "Proteger-se.", ["v-oplichting"]),
    AR("phishing", "phishing", "de", "de phishing.", ["v-phishing"]),
  ], diff=2, mins=4)

L(14, "Pagar faturas", "Een factuur betalen.",
  ["Perceber uma fatura e o débito direto"],
  vocab=[],
  ex=[("Betaal de factuur binnen veertien dagen.","Pague a fatura no prazo de catorze dias."),("De huur gaat via automatische incasso.","A renda é paga por débito direto.")],
  review=["v-factuur","v-machtiging","v-bedrag","v-overmaken","v-iban"],
  cefr=C, exs=[
    MA([("factuur","fatura"),("automatische incasso","débito direto"),("bedrag","montante"),("overmaken","transferir")], "Faturas.", ["v-factuur","v-machtiging","v-bedrag","v-overmaken"]),
    MC("(Fatura) «Betaaltermijn: 14 dagen» significa…", ["*tens 14 dias para pagar","há 14 dias de desconto|Não.","pagas em 14 prestações|Não."], "Compreensão.", ["v-factuur"]),
    TR("pt-nl","Tenho de pagar esta fatura.", ["Ik moet deze factuur betalen(.)"], "factuur.", ["v-factuur"]),
    TR("pt-nl","Pago por débito direto.", ["Ik betaal via automatische incasso(.)","Ik betaal met automatische incasso(.)"], "incasso.", ["v-machtiging"]),
    FB("Maak het ___ over naar dit IBAN.", ["bedrag"], "Montante.", ["v-bedrag"], choices=["bedrag","budget","factuur"], tr="Transfira o montante para este IBAN."),
    LI("Vermeld het factuurnummer bij de betaling.", ["Vermeld het factuurnummer bij de betaling(.)"], "Indique o número da fatura no pagamento.", "Ouvir.", ["v-factuur"]),
    MC("Uma fatura de uma empresa que não conheces, com urgência e ameaças…", ["*verificas antes de pagar — pode ser burla","pagas logo|Arriscado.","ignoras sempre todas as faturas|Também não."], "Segurança.", ["v-factuur"]),
    WO("Pago a fatura.", ["Ik","betaal","de","factuur."], "Ordem.", ["v-factuur"]),
  ], diff=2, mins=4)

L(15, "Prática: as finanças do mês", "Mijn maand in euro's.",
  ["Organizar as finanças de um mês"],
  vocab=[],
  ex=[("(Fictício) Salaris: € 2.400. Vaste lasten: € 1.500. Sparen: € 200.","Salário, despesas fixas, poupança.")],
  review=["v-salaris","v-vaste-lasten","v-spaarrekening","v-budget","v-phishing","v-factuur"],
  cefr=C, exs=[
    MC("(Fictício) Salário 2400 €, despesas fixas 1500 €, poupança 200 €. Quanto sobra?", ["*700 €","900 €|Esqueceste a poupança.","1700 €|Não."], "Cálculo.", ["v-budget"]),
    MC("(Fictício) «De huur gaat via automatische incasso op de eerste van de maand.» Quando sai a renda?", ["*no dia 1 de cada mês","no fim do mês|Não.","quando quiseres|É automático."], "Compreensão.", ["v-machtiging"]),
    TR("pt-nl","Poupo duzentos euros por mês.", ["Ik spaar tweehonderd euro per maand(.)","Ik spaar 200 euro per maand(.)"], "sparen.", ["v-sparen"]),
    TR("pt-nl","As despesas fixas são altas.", ["De vaste lasten zijn hoog(.)"], "hoog.", ["v-vaste-lasten"]),
    LI("Ik betaal alle facturen op tijd.", ["Ik betaal alle facturen op tijd(.)"], "Pago todas as faturas a tempo.", "Ouvir.", ["v-factuur"]),
    BS("Faço um orçamento todos os meses.", ["Ik","maak","elke","maand","een","budget."], ["Ik maak elke maand een budget."], "Ordem.", ["v-budget"]),
    DL([("Partner","Hebben we deze maand genoeg geld?","Temos dinheiro suficiente este mês?"),("Jij","","")], ["*Ja, na de vaste lasten blijft er nog vierhonderd euro over.","Ik ben budget.|Não.","Phishing.|Não."], "Responder.", ["v-vaste-lasten"]),
    SW("Escreva o seu orçamento mensal simples (salário, 3 despesas fixas, poupança).", ["Salaris: 2.200 euro. Vaste lasten: huur 950, energie 150, zorgverzekering 140. Sparen: 150 euro per maand."], ["Rendimento","Despesas","Poupança"], 15, "Orçamento (valores fictícios).", ["v-budget"]),
  ], diff=2, mins=5)

W()
