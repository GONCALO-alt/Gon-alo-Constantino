import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u13")
C = "B1-B2"
# Lições de aprofundamento (10–25): discurso indireto.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Mudar pronomes e tempos", "«Ik kom morgen» → Hij zei dat hij de volgende dag zou komen.",
  ["Transformar afirmações em discurso indireto"],
  vocab=[X("v-zei-dat","hij zei dat…","ele disse que…"), X("v-de-volgende-dag","de volgende dag","no dia seguinte")],
  ex=[("«Ik ben moe», zegt ze. → Ze zegt dat ze moe is.","«Estou cansada», diz ela. → Ela diz que está cansada."),("«Ik kom morgen», zei hij. → Hij zei dat hij de volgende dag zou komen.","«Venho amanhã», disse ele. → Ele disse que vinha no dia seguinte.")],
  review=["v-indirecte-rede","v-directe-rede","v-zei"],
  gram=[G("g-indirecte-rede-tijd","Pronomes e tempos","No discurso indireto: (1) os **pronomes** mudam (*ik → hij/ze*); (2) com verbo introdutor no **passado**, o tempo costuma recuar: presente → passado (*is → was*), futuro → *zou* (*komt → zou komen*); (3) expressões de tempo mudam: *morgen → de volgende dag*, *gisteren → de dag ervoor*. A oração com *dat* tem o verbo no fim.",
    [("«Ik heb honger.» → Hij zei dat hij honger had.","«Tenho fome.» → Disse que tinha fome."),("«We gaan verhuizen.» → Ze vertelden dat ze gingen verhuizen.","«Vamos mudar-nos.» → Contaram que se iam mudar.")])],
  cefr=C, exs=[
    MA([("hij zei dat…","ele disse que…"),("de volgende dag","no dia seguinte"),("indirecte rede","discurso indireto"),("directe rede","discurso direto")], "Indireto.", ["v-zei-dat","v-de-volgende-dag","v-indirecte-rede","v-directe-rede"]),
    MC("«Ik heb geen tijd», zei Lisa. →", ["*Lisa zei dat ze geen tijd had.","Lisa zei dat ik geen tijd heb.|Pronome errado.","Lisa zei dat ze had geen tijd.|Verbo no fim."], "Transformar.", ["v-zei-dat"]),
    MC("«Ik kom morgen» (dito ontem) → Hij zei dat hij ___ zou komen.", ["*vandaag / de volgende dag","morgen|O «amanhã» dele já passou.","gisteren|Não."], "Tempo.", ["v-de-volgende-dag"]),
    TR("pt-nl","Ela diz que está cansada.", ["Ze zegt dat ze moe is","Zij zegt dat ze moe is"], "Presente.", ["v-zei-dat"]),
    TR("pt-nl","Ele disse que vinha no dia seguinte.", ["Hij zei dat hij de volgende dag zou komen","Hij zei dat hij de volgende dag kwam"], "zou komen.", ["v-de-volgende-dag"]),
    FB("Ze vertelden dat ze ___ verhuizen.", ["gingen"], "Passado.", ["v-zei-dat"], choices=["gingen","gaan","zullen"], tr="Contaram que se iam mudar."),
    FE(["Hij","zei","dat","ik","moe","was."], 3, "hij", "Pronome: ik → hij.", ["v-zei-dat"]),
    LI("Ze zei dat ze de volgende dag zou terugbellen.", ["Ze zei dat ze de volgende dag zou terugbellen"], "Ela disse que ligaria de volta no dia seguinte.", "Indireto.", ["v-de-volgende-dag"]),
    WO("Ela disse que tinha fome.", ["Ze","zei","dat","ze","honger","had"], "Ordem.", ["v-zei-dat"]),
  ], diff=4, mins=6)

L(11, "Relatar perguntas sim/não", "Ze vroeg of ik mee wilde.",
  ["Relatar perguntas fechadas com of"],
  vocab=[X("v-vroeg-of","vroeg of…","perguntou se…"), X("v-wilde-weten-of","wilde weten of…","queria saber se…")],
  ex=[("«Kom je mee?» → Ze vroeg of ik meeging.","«Vens?» → Ela perguntou se eu ia."),("«Heb je mijn sleutels gezien?» → Hij wilde weten of ik zijn sleutels had gezien.","«Viste as minhas chaves?» → Ele queria saber se eu tinha visto as chaves dele.")],
  review=["v-vroeg-vragen","v-wilde-weten"],
  cefr=C, exs=[
    MA([("vroeg of…","perguntou se…"),("wilde weten of…","queria saber se…"),("vroeg / vroegen","perguntou/perguntaram"),("wilde weten","queria saber")], "Perguntas.", ["v-vroeg-of","v-wilde-weten-of","v-vroeg-vragen","v-wilde-weten"]),
    MC("«Ben je ziek?», vroeg de juf. →", ["*De juf vroeg of ik ziek was.","De juf vroeg dat ik ziek was.|Pergunta → of.","De juf vroeg of was ik ziek.|Verbo no fim."], "of.", ["v-vroeg-of"]),
    TR("pt-nl","Ela perguntou se eu ia.", ["Ze vroeg of ik meeging","Ze vroeg of ik mee ging","Ze vroeg of ik meekwam"], "of.", ["v-vroeg-of"]),
    TR("pt-nl","Ele queria saber se eu tinha tempo.", ["Hij wilde weten of ik tijd had"], "wilde weten of.", ["v-wilde-weten-of"]),
    FB("Mijn moeder vroeg ___ ik al gegeten had.", ["of"], "Pergunta sim/não.", ["v-vroeg-of"], choices=["of","dat","als"], tr="A minha mãe perguntou se eu já tinha comido."),
    FE(["Hij","vroeg","dat","ik","mee","wilde."], 2, "of", "Pergunta sim/não: of.", ["v-vroeg-of"]),
    LI("De dokter vroeg of ik medicijnen gebruik.", ["De dokter vroeg of ik medicijnen gebruik","De dokter vroeg of ik medicijnen gebruikte"], "O médico perguntou se tomo medicamentos.", "Contexto real.", ["v-vroeg-of"]),
    MC("Em PT diz-se «perguntou se». Em NL o «se» das perguntas indiretas é…", ["*of","als|«als» é condicional.","dat|Não."], "Falso amigo.", ["v-vroeg-of"]),
    WO("Ela perguntou se eu vinha.", ["Ze","vroeg","of","ik","kwam"], "Ordem.", ["v-vroeg-of"]),
  ], diff=4, mins=5)

L(12, "Relatar perguntas abertas", "Hij vroeg waar het station was.",
  ["Relatar perguntas com waar, wanneer, hoe, waarom"],
  vocab=[X("v-vroeg-waar","vroeg waar…","perguntou onde…"), X("v-vroeg-waarom","vroeg waarom…","perguntou porquê…")],
  ex=[("«Waar is het station?» → Hij vroeg waar het station was.","«Onde é a estação?» → Perguntou onde era a estação."),("«Waarom ben je te laat?» → Ze vroeg waarom ik te laat was.","«Porque chegaste tarde?» → Ela perguntou porque é que eu tinha chegado tarde."),("«Hoe laat begint het?» → Ik vroeg hoe laat het begon.","«A que horas começa?» → Perguntei a que horas começava.")],
  review=["v-vroeg-vragen"],
  cefr=C, exs=[
    MA([("vroeg waar…","perguntou onde…"),("vroeg waarom…","perguntou porquê…"),("vroeg hoe laat…","perguntou a que horas…"),("vroeg of…","perguntou se…")], "Perguntas abertas.", ["v-vroeg-waar","v-vroeg-waarom","v-vroeg-vragen","v-vroeg-of"]),
    MC("«Wanneer vertrekt de trein?» →", ["*Ze vroeg wanneer de trein vertrok.","Ze vroeg wanneer vertrok de trein.|Verbo no fim.","Ze vroeg of wanneer de trein vertrok.|Sem «of»."], "Ordem.", ["v-vroeg-waar"]),
    TR("pt-nl","Perguntou onde era a estação.", ["Hij vroeg waar het station was","Ze vroeg waar het station was"], "waar + verbo no fim.", ["v-vroeg-waar"]),
    TR("pt-nl","Ela perguntou porque é que eu estava atrasado.", ["Ze vroeg waarom ik te laat was","Zij vroeg waarom ik te laat was"], "waarom.", ["v-vroeg-waarom"]),
    FB("Ik vroeg hoe laat de winkel ___.", ["sloot"], "Verbo no fim, passado.", ["v-vroeg-waar"], choices=["sloot","sluit","sluiten"], tr="Perguntei a que horas fechava a loja."),
    MC("Qual é a ordem correta?", ["*Hij vroeg waar ik nu woon.","Hij vroeg waar ik woon nu.|Verbo no fim da subordinada."], "Verbo no fim da subordinada.", ["v-vroeg-waar"]),
    LI("De conducteur vroeg waar ik naartoe ging.", ["De conducteur vroeg waar ik naartoe ging","De conducteur vroeg waar ik heen ging"], "O revisor perguntou para onde eu ia.", "Contexto.", ["v-vroeg-waar"]),
    DL([("Collega","Wat vroeg de klant?","O que perguntou o cliente?"),("Jij","","")], ["*Hij vroeg wanneer zijn bestelling geleverd zou worden.","Hij vroeg wanneer wordt zijn bestelling geleverd.|Ordem.","Wanneer.|Incompleto."], "Relatar.", ["v-vroeg-waar"]),
    WO("Perguntou onde eu morava.", ["Hij","vroeg","waar","ik","woonde"], "Ordem.", ["v-vroeg-waar"]),
  ], diff=4, mins=5)

L(13, "Relatar ordens e pedidos", "Ze zei dat ik moest wachten.",
  ["Relatar imperativos com moeten ou vragen om … te"],
  vocab=[X("v-zei-dat-ik-moest","zei dat ik moest…","disse que eu tinha de…"), X("v-vroeg-me-om","vroeg me om … te","pediu-me para…")],
  ex=[("«Wacht hier!» → Ze zei dat ik moest wachten.","«Espera aqui!» → Ela disse-me para esperar."),("«Kun je me helpen?» → Hij vroeg me om hem te helpen.","«Podes ajudar-me?» → Ele pediu-me para o ajudar."),("«Doe de deur dicht.» → Ze vroeg me de deur dicht te doen.","«Fecha a porta.» → Ela pediu-me para fechar a porta.")],
  review=["v-vragen-om-te","v-opdragen"],
  cefr=C, exs=[
    MA([("zei dat ik moest…","disse que eu tinha de…"),("vroeg me om … te","pediu-me para…"),("vragen om … te","pedir para"),("opdragen","ordenar")], "Ordens.", ["v-zei-dat-ik-moest","v-vroeg-me-om","v-vragen-om-te","v-opdragen"]),
    MC("«Bel me terug!», zei ze. →", ["*Ze zei dat ik haar moest terugbellen.","Ze zei dat ik bel haar terug.|Não.","Ze zei bel me terug.|Discurso direto sem aspas."], "Ordem → moeten.", ["v-zei-dat-ik-moest"]),
    TR("pt-nl","Ela disse-me para esperar.", ["Ze zei dat ik moest wachten","Zij zei dat ik moest wachten"], "moest.", ["v-zei-dat-ik-moest"]),
    TR("pt-nl","Ele pediu-me para o ajudar.", ["Hij vroeg me om hem te helpen","Hij vroeg me hem te helpen","Hij vroeg mij om hem te helpen"], "vragen om … te.", ["v-vroeg-me-om"]),
    FB("De docent vroeg ons ___ onze telefoons weg te leggen.", ["om"], "vragen om … te.", ["v-vroeg-me-om"], choices=["om","of","dat"], tr="O professor pediu-nos para guardarmos os telemóveis."),
    FE(["Ze","zei","dat","ik","moet","wachten."], 4, "moest", "Passado: moest.", ["v-zei-dat-ik-moest"]),
    LI("De agent zei dat we door moesten lopen.", ["De agent zei dat we door moesten lopen","De agent zei dat we moesten doorlopen"], "O polícia disse-nos para continuarmos a andar.", "Ordem relatada.", ["v-zei-dat-ik-moest"]),
    DL([("Huisgenoot","Wat zei de verhuurder?","O que disse o senhorio?"),("Jij","","")], ["*Hij vroeg ons om de fietsen niet meer in de gang te zetten.","Hij zei: zet de fietsen!|Direto e confuso.","Fietsen.|Incompleto."], "Relatar pedido.", ["v-vroeg-me-om"]),
    WO("Pediu-me para esperar.", ["Hij","vroeg","me","om","te","wachten"], "Ordem.", ["v-vroeg-me-om"]),
  ], diff=4, mins=5)

L(14, "Verbos introdutores variados", "Ze legde uit dat… Hij kondigde aan dat…",
  ["Variar os verbos que introduzem o discurso indireto"],
  vocab=[X("v-uitleggen-dat","uitleggen dat…","explicar que…","verb"), X("v-aankondigen","aankondigen","anunciar","verb"),
         X("v-opmerken-dat","opmerken dat…","observar que…","verb")],
  ex=[("Ze legde uit dat het systeem nieuw was.","Ela explicou que o sistema era novo."),("De directeur kondigde aan dat er een nieuwe vestiging komt.","O diretor anunciou que vai abrir uma nova filial."),("Hij merkte op dat het erg stil was.","Ele observou que estava muito silencioso.")],
  review=["v-beweren","v-bevestigen-rede","v-klagen-dat"],
  cefr=C, exs=[
    MA([("uitleggen dat…","explicar que…"),("aankondigen","anunciar"),("opmerken dat…","observar que…"),("beweren","afirmar")], "Verbos.", ["v-uitleggen-dat","v-aankondigen","v-opmerken-dat","v-beweren"]),
    MC("Para mostrar dúvida sobre o que alguém disse, usa-se…", ["*beweren («Hij beweert dat…»)","uitleggen|Neutro.","bevestigen|Confirma."], "Nuance.", ["v-beweren"]),
    TR("pt-nl","O diretor anunciou que vai haver uma nova filial.", ["De directeur kondigde aan dat er een nieuwe vestiging komt","De directeur heeft aangekondigd dat er een nieuwe vestiging komt"], "aankondigen.", ["v-aankondigen"]),
    TR("pt-nl","Ela explicou que o sistema era novo.", ["Ze legde uit dat het systeem nieuw was","Zij legde uit dat het systeem nieuw was"], "uitleggen.", ["v-uitleggen-dat"]),
    FB("Hij ___ op dat het erg stil was.", ["merkte"], "opmerken (separável).", ["v-opmerken-dat"], choices=["merkte","opmerkte","merkt"], tr="Ele observou que estava muito silencioso."),
    FE(["De","minister","kondigt","gisteren","nieuwe","maatregelen","aan."], 2, "kondigde", "gisteren → passado.", ["v-aankondigen"]),
    LI("De woordvoerder bevestigde dat er gesprekken zijn.", ["De woordvoerder bevestigde dat er gesprekken zijn","De woordvoerder bevestigde dat er gesprekken waren"], "O porta-voz confirmou que há conversações.", "Notícia.", ["v-bevestigen-rede"]),
    SW("Relate uma reunião ou aula recente em 3 frases, usando três verbos introdutores diferentes (uitleggen, aankondigen, opmerken, beweren, klagen…).", ["De docent legde uit dat de toets volgende week is. Ze kondigde ook aan dat er een excursie komt. Een student klaagde dat er te veel huiswerk is."], ["3 verbos diferentes","Verbo no fim"], 25, "Relatar.", ["v-uitleggen-dat"]),
    WO("Ela anunciou que…", ["Ze","kondigde","aan","dat"], "Separável.", ["v-aankondigen"]),
  ], diff=4, mins=5)

L(15, "Relatar sugestões", "Hij stelde voor om te gaan wandelen.",
  ["Relatar propostas e conselhos"],
  vocab=[X("v-voorstellen-om","voorstellen om … te","propor|sugerir","verb"), X("v-aanraden-om","aanraden om … te","aconselhar a","verb")],
  ex=[("«Zullen we gaan wandelen?» → Hij stelde voor om te gaan wandelen.","«Vamos passear?» → Ele sugeriu irmos passear."),("«Je moet echt naar de dokter.» → Ze raadde me aan om naar de dokter te gaan.","«Tens mesmo de ir ao médico.» → Ela aconselhou-me a ir ao médico.")],
  review=["v-adviseren","v-een-voorstel-doen"],
  cefr=C, exs=[
    MA([("voorstellen om … te","sugerir"),("aanraden om … te","aconselhar a"),("adviseren","aconselhar"),("een voorstel doen","fazer uma proposta")], "Sugestões.", ["v-voorstellen-om","v-aanraden-om","v-adviseren","v-een-voorstel-doen"]),
    MC("«Laten we pizza bestellen!», zei Tom. →", ["*Tom stelde voor om pizza te bestellen.","Tom vroeg of pizza.|Não.","Tom zei dat ik moest pizza.|Não."], "Sugestão.", ["v-voorstellen-om"]),
    TR("pt-nl","Ele sugeriu irmos passear.", ["Hij stelde voor om te gaan wandelen","Hij stelde voor te gaan wandelen","Hij stelde voor om een wandeling te maken"], "voorstellen om.", ["v-voorstellen-om"]),
    TR("pt-nl","Ela aconselhou-me a ir ao médico.", ["Ze raadde me aan om naar de dokter te gaan","Ze raadde me aan naar de dokter te gaan"], "aanraden.", ["v-aanraden-om"]),
    FB("Mijn collega ___ voor om de vergadering te verzetten.", ["stelde"], "voorstellen (separável).", ["v-voorstellen-om"], choices=["stelde","voorstelde","stelt"], tr="O meu colega sugeriu adiar a reunião."),
    FE(["Ze","raadde","me","aan","om","naar","huis","gaan."], 7, "te gaan.", "om … te.", ["v-aanraden-om"]),
    LI("De huisarts raadde me aan om meer te bewegen.", ["De huisarts raadde me aan om meer te bewegen","De huisarts raadde mij aan om meer te bewegen"], "O médico aconselhou-me a fazer mais exercício.", "Conselho.", ["v-aanraden-om"]),
    DL([("Vriend","Wat zei de fietsenmaker?","O que disse o mecânico?"),("Jij","","")], ["*Hij raadde me aan om nieuwe remmen te nemen.","Hij zei: remmen.|Vago.","Hij stelde voor of remmen.|Errado."], "Relatar conselho.", ["v-aanraden-om"]),
    WO("Ele sugeriu ir passear.", ["Hij","stelde","voor","om","te","wandelen"], "Ordem.", ["v-voorstellen-om"]),
  ], diff=4, mins=5)

L(16, "Promessas e ameaças relatadas", "Hij beloofde dat hij zou helpen.",
  ["Relatar promessas, ameaças e avisos"],
  vocab=[X("v-beloofde-dat","beloofde dat…","prometeu que…"), X("v-dreigde-met","dreigde met…","ameaçou com…")],
  ex=[("«Ik help je morgen.» → Hij beloofde dat hij me de volgende dag zou helpen.","«Ajudo-te amanhã.» → Prometeu que me ajudava no dia seguinte."),("De verhuurder dreigde met een rechtszaak.","O senhorio ameaçou com um processo."),("Ze waarschuwde dat de weg glad was.","Ela avisou que a estrada estava escorregadia.")],
  review=["v-beloven","v-dreigen","v-waarschuwen"],
  cefr=C, exs=[
    MA([("beloofde dat…","prometeu que…"),("dreigde met…","ameaçou com…"),("waarschuwen","avisar"),("beloven","prometer")], "Promessas.", ["v-beloofde-dat","v-dreigde-met","v-waarschuwen","v-beloven"]),
    TR("pt-nl","Prometeu que ajudava.", ["Hij beloofde dat hij zou helpen","Hij beloofde te helpen"], "zou.", ["v-beloofde-dat"]),
    TR("pt-nl","O senhorio ameaçou com um processo.", ["De verhuurder dreigde met een rechtszaak"], "dreigen met.", ["v-dreigde-met"]),
    MC("«Als je niet betaalt, bel ik de politie!» → Hij ___ de politie te bellen.", ["*dreigde","beloofde|Não é promessa simpática.","stelde voor|Não."], "Ameaça.", ["v-dreigde-met"]),
    FB("Ze ___ dat de weg glad was.", ["waarschuwde"], "Avisar.", ["v-waarschuwen"], choices=["waarschuwde","beloofde","dreigde"], tr="Ela avisou que a estrada estava escorregadia."),
    FE(["Hij","beloofde","dat","hij","zal","komen."], 4, "zou", "Passado: zou.", ["v-beloofde-dat"]),
    LI("De vakbond dreigt met een staking.", ["De vakbond dreigt met een staking"], "O sindicato ameaça com uma greve.", "Notícia.", ["v-dreigde-met"]),
    DL([("Huisgenoot","Komt de loodgieter nog?","O canalizador ainda vem?"),("Jij","","")], ["*Hij beloofde dat hij vóór vijf uur zou komen.","Hij beloofde dat hij komt.|Tempo menos natural.","Dreigde.|Errado."], "Relatar promessa.", ["v-beloofde-dat"]),
    WO("Prometeu que vinha.", ["Hij","beloofde","dat","hij","zou","komen"], "Ordem.", ["v-beloofde-dat"]),
  ], diff=4, mins=5)

L(17, "Relatar uma chamada", "Ze belde om te zeggen dat…",
  ["Relatar o conteúdo de um telefonema a outra pessoa"],
  vocab=[X("v-belde-om-te-zeggen","belde om te zeggen dat…","ligou a dizer que…"), X("v-laat-weten","laat weten dat…","manda dizer que…"),
         V("v-boodschap","boodschap","recado|mensagem","noun","de","boodschappen")],
  ex=[("Je moeder belde om te zeggen dat ze later komt.","A tua mãe ligou a dizer que chega mais tarde."),("De garage laat weten dat de auto klaar is.","A oficina manda dizer que o carro está pronto.")],
  review=["v-terugbellen"],
  cefr=C, exs=[
    MA([("belde om te zeggen dat…","ligou a dizer que…"),("laat weten dat…","manda dizer que…"),("terugbellen","ligar de volta"),("boodschap","recado")], "Telefonema.", ["v-belde-om-te-zeggen","v-laat-weten","v-terugbellen","v-boodschap"]),
    TR("pt-nl","A tua mãe ligou a dizer que chega mais tarde.", ["Je moeder belde om te zeggen dat ze later komt","Je moeder belde om te zeggen dat ze later kwam"], "belde om te zeggen.", ["v-belde-om-te-zeggen"]),
    TR("pt-nl","A oficina manda dizer que o carro está pronto.", ["De garage laat weten dat de auto klaar is"], "laat weten.", ["v-laat-weten"]),
    MC("Deixar um recado: «Kunt u een ___ doorgeven?»", ["*boodschap","nieuws|Menos usado assim.","brief|Não."], "Recado.", ["v-boodschap"]),
    FB("De tandarts belde ___ te zeggen dat de afspraak niet doorgaat.", ["om"], "om … te.", ["v-belde-om-te-zeggen"], choices=["om","voor","dat"], tr="O dentista ligou a dizer que a consulta não se realiza."),
    FE(["Hij","belde","om","zeggen","dat","hij","ziek","is."], 3, "te zeggen", "om … te.", ["v-belde-om-te-zeggen"]),
    DL([("Collega","Heeft er iemand voor mij gebeld?","Alguém ligou para mim?"),("Jij","","")], ["*Ja, mevrouw Jansen belde om te zeggen dat ze de offerte heeft ontvangen. Ze vraagt of je haar wilt terugbellen.","Ja.|Sem informação.","Mevrouw Jansen: ‹ik heb›…|Direto confuso."], "Relatar recado.", ["v-belde-om-te-zeggen","v-terugbellen"]),
    LI("Hij laat weten dat hij vandaag thuiswerkt.", ["Hij laat weten dat hij vandaag thuiswerkt"], "Ele manda dizer que hoje trabalha de casa.", "Recado.", ["v-laat-weten"]),
    SW("Recebeu uma chamada para um colega. Escreva-lhe uma mensagem (3 frases) a relatar: quem ligou, o que disse e o que pediu.", ["Hoi Mark, Peter van de drukkerij belde. Hij zei dat de folders pas vrijdag klaar zijn. Hij vroeg of je hem vandaag nog wilt terugbellen."], ["Quem","O que disse","O que pediu"], 25, "Recado.", ["v-belde-om-te-zeggen"]),
  ], diff=4, mins=5)

L(18, "O que diz um aviso ou texto", "Op het bord staat dat…",
  ["Relatar o que está escrito"],
  vocab=[X("v-op-het-bord-staat","op het bord staat dat…","no quadro/placa diz que…"), X("v-volgens-de-website","volgens de website","segundo o site")],
  ex=[("Op het bord staat dat de trein vertraging heeft.","No painel diz que o comboio está atrasado."),("Volgens de website is het museum op maandag dicht.","Segundo o site, o museu está fechado à segunda."),("In de brief staat dat ik moet betalen.","Na carta diz que tenho de pagar.")],
  review=["v-volgens-x"],
  cefr=C, exs=[
    MA([("op het bord staat dat…","na placa diz que…"),("volgens de website","segundo o site"),("volgens …","segundo…"),("in de brief staat…","na carta diz…")], "Escrito.", ["v-op-het-bord-staat","v-volgens-de-website","v-volgens-x","v-op-het-bord-staat"]),
    MC("Para relatar o que está escrito, em NL usa-se…", ["*er staat (dat)…","er zegt…|Não.","het praat…|Não."], "Estrutura.", ["v-op-het-bord-staat"]),
    TR("pt-nl","Na carta diz que tenho de pagar.", ["In de brief staat dat ik moet betalen"], "staan.", ["v-op-het-bord-staat"]),
    TR("pt-nl","Segundo o site, o museu está fechado à segunda.", ["Volgens de website is het museum op maandag dicht","Volgens de website is het museum maandag gesloten"], "Inversão.", ["v-volgens-de-website"]),
    FB("Op het bord ___ dat spoor 5 vervalt.", ["staat"], "Escrito: staat.", ["v-op-het-bord-staat"], choices=["staat","zegt","spreekt"], tr="No painel diz que a linha 5 foi cancelada."),
    FE(["In","de","mail","zegt","dat","de","cursus","vol","is."], 3, "staat", "Escrito: er staat.", ["v-op-het-bord-staat"]),
    LI("Wat staat er in de brief van de belastingdienst?", ["Wat staat er in de brief van de belastingdienst","Wat staat er in de brief van de belastingdienst?"], "O que diz a carta das finanças?", "Pergunta.", ["v-op-het-bord-staat"]),
    DL([("Vriend","Gaat het concert nog door?","O concerto ainda se realiza?"),("Jij","","")], ["*Volgens de website wel, maar er staat dat de deuren een uur later opengaan.","Het bord zegt ja.|Pouco natural.","Website.|Incompleto."], "Relatar.", ["v-volgens-de-website","v-op-het-bord-staat"]),
    WO("No painel diz que…", ["Op","het","bord","staat","dat"], "Ordem.", ["v-op-het-bord-staat"]),
  ], diff=3, mins=5)

L(19, "Expressões de tempo e lugar", "Gisteren → de dag ervoor.",
  ["Ajustar expressões de tempo e lugar no discurso indireto"],
  vocab=[X("v-de-dag-ervoor","de dag ervoor","o dia anterior|na véspera"), X("v-die-week","die week","nessa semana")],
  ex=[("«Ik was gisteren ziek.» → Ze zei dat ze de dag ervoor ziek was geweest.","«Ontem estava doente.» → Disse que tinha estado doente no dia anterior."),("«Ik werk hier deze week.» → Hij zei dat hij daar die week werkte.","«Trabalho aqui esta semana.» → Disse que trabalhava lá nessa semana.")],
  review=["v-de-volgende-dag","v-indirecte-rede"],
  cefr=C, exs=[
    MA([("de dag ervoor","o dia anterior"),("de volgende dag","o dia seguinte"),("die week","nessa semana"),("indirecte rede","discurso indireto")], "Tempo.", ["v-de-dag-ervoor","v-de-volgende-dag","v-die-week","v-indirecte-rede"]),
    MC("Discurso direto «hier» → indireto (noutro sítio):", ["*daar","hier|Depende, mas normalmente muda.","ergens|Não."], "Lugar.", ["v-die-week"]),
    MC("«Gisteren» → indireto (relatado dias depois):", ["*de dag ervoor","morgen|Não.","vandaag|Não."], "Tempo.", ["v-de-dag-ervoor"]),
    TR("pt-nl","Ela disse que tinha estado doente no dia anterior.", ["Ze zei dat ze de dag ervoor ziek was geweest","Ze zei dat ze de dag ervoor ziek was"], "Plusquamperfectum.", ["v-de-dag-ervoor"]),
    TR("pt-nl","Ele disse que trabalhava lá nessa semana.", ["Hij zei dat hij daar die week werkte"], "die week, daar.", ["v-die-week"]),
    FB("Hij zei dat hij ___ week op vakantie was.", ["die"], "deze → die.", ["v-die-week"], choices=["die","deze","dit"], tr="Ele disse que estava de férias nessa semana."),
    FE(["Ze","zei","dat","ze","daar","morgen","zou","zijn."], 5, "de volgende dag", "Relatado no passado: de volgende dag.", ["v-de-volgende-dag"]),
    LI("Hij vertelde dat hij de dag ervoor was aangekomen.", ["Hij vertelde dat hij de dag ervoor was aangekomen","Hij vertelde dat hij de dag ervoor aangekomen was"], "Ele contou que tinha chegado no dia anterior.", "Indireto.", ["v-de-dag-ervoor"]),
    WO("No dia anterior.", ["De","dag","ervoor"], "Expressão.", ["v-de-dag-ervoor"]),
  ], diff=5, mins=5)

L(20, "Citar ou parafrasear?", "Letterlijk of in je eigen woorden?",
  ["Escolher entre citar literalmente e parafrasear"],
  vocab=[X("v-citaat-tussen-aanhalingstekens","tussen aanhalingstekens","entre aspas")],
  ex=[("Kun je dat in je eigen woorden parafraseren?","Consegues parafrasear isso por palavras tuas?"),("Zet een letterlijk citaat altijd tussen aanhalingstekens.","Põe sempre uma citação literal entre aspas.")],
  review=["v-parafraseren","v-letterlijk-zeggen","v-navertellen"],
  cefr=C, exs=[
    MA([("parafraseren","parafrasear"),("tussen aanhalingstekens","entre aspas"),("letterlijk zeggen","dizer textualmente"),("navertellen","recontar")], "Citar.", ["v-parafraseren","v-citaat-tussen-aanhalingstekens","v-letterlijk-zeggen","v-navertellen"]),
    MC("Num texto académico, uma frase copiada de outro autor deve…", ["*ir entre aspas com a fonte","ir sem nada|Plágio.","ir em maiúsculas|Não."], "Ética.", ["v-citaat-tussen-aanhalingstekens"]),
    TR("pt-nl","Consegues parafrasear isso?", ["Kun je dat parafraseren","Kun je dat in je eigen woorden zeggen","Kun je dat parafraseren?"], "parafraseren.", ["v-parafraseren"]),
    TR("pt-nl","Ele disse textualmente: «Nunca mais.»", ["Hij zei letterlijk: «Nooit meer.»","Hij zei letterlijk: Nooit meer","Hij zei letterlijk: \"Nooit meer.\""], "letterlijk.", ["v-letterlijk-zeggen"]),
    FB("Een letterlijk citaat staat tussen ___.", ["aanhalingstekens"], "Aspas.", ["v-citaat-tussen-aanhalingstekens"], choices=["aanhalingstekens","komma's","haakjes"], tr="Uma citação literal fica entre aspas."),
    SW("Parafraseie em discurso indireto: A diretora disse: «We gaan volgend jaar een nieuwe school bouwen, maar eerst moeten we geld vinden.»", ["De directrice zei dat ze het jaar erna een nieuwe school gingen bouwen, maar dat ze eerst geld moesten vinden."], ["Discurso indireto","Pronomes/tempos ajustados"], 20, "Parafrasear.", ["v-parafraseren"]),
    LI("Ik citeer letterlijk wat de minister zei.", ["Ik citeer letterlijk wat de minister zei"], "Cito literalmente o que o ministro disse.", "Uso.", ["v-letterlijk-zeggen"]),
    WO("Entre aspas.", ["Tussen","aanhalingstekens"], "Expressão.", ["v-citaat-tussen-aanhalingstekens"]),
  ], diff=4, mins=5)

L(21, "Mal-entendidos", "Ik dacht dat je zei dat…",
  ["Esclarecer mal-entendidos sobre o que foi dito"],
  vocab=[X("v-ik-dacht-dat-je-zei","ik dacht dat je zei dat…","pensei que tinhas dito que…")],
  ex=[("Ik dacht dat je zei dat de vergadering om tien uur was.","Pensei que tinhas dito que a reunião era às dez."),("Sorry, zo bedoelde ik het niet.","Desculpa, não foi isso que eu quis dizer.")],
  review=["v-zo-bedoelde-ik-het-niet","v-verkeerd-begrijpen","v-hoe-bedoel-je","v-misverstand"],
  cefr=C, exs=[
    MA([("ik dacht dat je zei dat…","pensei que tinhas dito…"),("zo bedoelde ik het niet","não foi isso que quis dizer"),("verkeerd begrijpen","perceber mal"),("misverstand","mal-entendido")], "Mal-entendidos.", ["v-ik-dacht-dat-je-zei","v-zo-bedoelde-ik-het-niet","v-verkeerd-begrijpen","v-misverstand"]),
    TR("pt-nl","Pensei que tinhas dito que era às dez.", ["Ik dacht dat je zei dat het om tien uur was","Ik dacht dat jij zei dat het om tien uur was"], "Indireto.", ["v-ik-dacht-dat-je-zei"]),
    TR("pt-nl","Não foi isso que eu quis dizer.", ["Zo bedoelde ik het niet","Dat bedoelde ik niet"], "Expressão.", ["v-zo-bedoelde-ik-het-niet"]),
    DL([("Collega","Waarom ben je er niet? We beginnen om negen uur!","Porque não estás cá? Começamos às nove!"),("Jij","","")], ["*O nee! Ik dacht dat je zei dat we om tien uur begonnen. Ik kom eraan!","Zo bedoelde ik het niet.|Não encaixa.","Negen uur?|Incompleto."], "Esclarecer.", ["v-ik-dacht-dat-je-zei"]),
    FB("Er is een ___ ontstaan over de datum.", ["misverstand"], "Mal-entendido.", ["v-misverstand"], choices=["misverstand","verkeerd","bedoeling"], tr="Surgiu um mal-entendido sobre a data."),
    FE(["Ik","dacht","dat","je","zegt","dat","het","gratis","was."], 4, "zei", "Passado: zei.", ["v-ik-dacht-dat-je-zei"]),
    LI("Volgens mij hebben we elkaar verkeerd begrepen.", ["Volgens mij hebben we elkaar verkeerd begrepen"], "Acho que nos entendemos mal.", "Esclarecer.", ["v-verkeerd-begrijpen"]),
    MC("Para evitar mal-entendidos numa reunião, é útil…", ["*resumir os acordos por escrito","falar mais alto|Não.","não dizer nada|Não."], "Dica.", ["v-misverstand"]),
  ], diff=4, mins=5)

L(22, "Rumores", "Het verhaal gaat dat…",
  ["Relatar rumores e informações não confirmadas"],
  vocab=[X("v-het-verhaal-gaat","het verhaal gaat dat…","conta-se que…|diz-se que…"), X("v-ik-heb-gehoord-dat","ik heb gehoord dat…","ouvi dizer que…")],
  ex=[("Het verhaal gaat dat er een geest in het kasteel woont.","Conta-se que vive um fantasma no castelo."),("Ik heb gehoord dat de bakker gaat stoppen.","Ouvi dizer que o padeiro vai fechar."),("Naar verluidt is de zanger ziek.","Ao que consta, o cantor está doente.")],
  review=["v-gerucht","v-zou-gerucht","v-er-wordt-gezegd"],
  cefr=C, exs=[
    MA([("het verhaal gaat dat…","conta-se que…"),("ik heb gehoord dat…","ouvi dizer que…"),("gerucht","boato"),("er wordt gezegd dat…","diz-se que…")], "Rumores.", ["v-het-verhaal-gaat","v-ik-heb-gehoord-dat","v-gerucht","v-er-wordt-gezegd"]),
    MC("Qual é o mais informal?", ["*Ik heb gehoord dat…","Naar verluidt…|Formal.","Er wordt beweerd dat…|Formal."], "Registo.", ["v-ik-heb-gehoord-dat"]),
    TR("pt-nl","Ouvi dizer que o padeiro vai fechar.", ["Ik heb gehoord dat de bakker gaat stoppen","Ik heb gehoord dat de bakker stopt","Ik hoorde dat de bakker gaat stoppen"], "gehoord dat.", ["v-ik-heb-gehoord-dat"]),
    TR("pt-nl","Conta-se que vive um fantasma no castelo.", ["Het verhaal gaat dat er een geest in het kasteel woont","Het verhaal gaat dat er een spook in het kasteel woont"], "Lenda.", ["v-het-verhaal-gaat"]),
    FB("Er gaat een ___ dat de fabriek dichtgaat.", ["gerucht"], "Boato.", ["v-gerucht"], choices=["gerucht","verhaal","bericht"], tr="Corre um boato de que a fábrica vai fechar."),
    FE(["Ik","heb","gehoord","dat","hij","gaat","verhuist."], 6, "verhuizen.", "Infinitivo depois de gaat.", ["v-ik-heb-gehoord-dat"]),
    LI("Het verhaal gaat dat de molen ooit door een reus is gebouwd.", ["Het verhaal gaat dat de molen ooit door een reus is gebouwd","Het verhaal gaat dat de molen ooit door een reus gebouwd is"], "Conta-se que o moinho foi construído por um gigante.", "Lenda.", ["v-het-verhaal-gaat"]),
    DL([("Buurvrouw","Weet jij of de supermarkt gaat sluiten?","Sabes se o supermercado vai fechar?"),("Jij","","")], ["*Ik heb gehoord van wel, maar het is nog niet zeker. Het kan ook een gerucht zijn.","Zeker weten!|Afirma sem base.","Het verhaal gaat.|Incompleto."], "Prudência.", ["v-ik-heb-gehoord-dat","v-gerucht"]),
  ], diff=4, mins=5)

L(23, "Recados por escrito", "Hij liet zeggen dat…",
  ["Escrever recados com discurso indireto"],
  vocab=[X("v-liet-zeggen","liet zeggen dat…","mandou dizer que…"), X("v-de-groeten-doen-van","de groeten van…","cumprimentos de…")],
  ex=[("Je broer liet zeggen dat hij later komt.","O teu irmão mandou dizer que chega mais tarde."),("De groeten van Lisa! Ze vroeg of je zaterdag kunt.","Cumprimentos da Lisa! Perguntou se podes no sábado.")],
  review=["v-laat-weten","v-boodschap"],
  cefr=C, exs=[
    MA([("liet zeggen dat…","mandou dizer que…"),("de groeten van…","cumprimentos de…"),("laat weten dat…","manda dizer que…"),("boodschap","recado")], "Recados.", ["v-liet-zeggen","v-de-groeten-doen-van","v-laat-weten","v-boodschap"]),
    TR("pt-nl","O teu irmão mandou dizer que chega mais tarde.", ["Je broer liet zeggen dat hij later komt","Je broer liet weten dat hij later komt"], "liet zeggen.", ["v-liet-zeggen"]),
    TR("pt-nl","Cumprimentos da Lisa!", ["De groeten van Lisa","De groeten van Lisa!"], "Expressão.", ["v-de-groeten-doen-van"]),
    FB("De loodgieter liet ___ dat hij morgen komt.", ["zeggen"], "liet zeggen.", ["v-liet-zeggen"], choices=["zeggen","gezegd","zegt"], tr="O canalizador mandou dizer que vem amanhã."),
    FE(["Ze","liet","zeggen","dat","ze","ziek","zijn."], 6, "is.", "ze (singular) is.", ["v-liet-zeggen"]),
    SW("Escreva um bilhete para um colega de casa (3 frases): o senhorio passou e disse duas coisas e pediu uma coisa.", ["Hoi Sam! De verhuurder kwam langs. Hij zei dat de ramen volgende week worden gewassen en dat er dinsdag geen water is. Hij vroeg of je je fiets uit de gang wilt halen."], ["Relata 2 afirmações","Relata 1 pedido"], 25, "Recado.", ["v-liet-zeggen"]),
    LI("Ik moest je de groeten doen van je oma.", ["Ik moest je de groeten doen van je oma"], "Tenho de te dar cumprimentos da tua avó.", "Fórmula.", ["v-de-groeten-doen-van"]),
    MC("«Doe de groeten aan je moeder» vs. «De groeten van mijn moeder»:", ["*envia cumprimentos vs. traz cumprimentos de alguém","iguais|Não.","ambos significam despedida|Não."], "Direção.", ["v-de-groeten-doen-van"]),
    WO("Mandou dizer que vem.", ["Hij","liet","zeggen","dat","hij","komt"], "Ordem.", ["v-liet-zeggen"]),
  ], diff=4, mins=5)

L(24, "Relatar uma entrevista de emprego", "Ze vroegen waarom ik…",
  ["Contar a alguém como correu uma entrevista"],
  vocab=[X("v-ze-vroegen-naar","ze vroegen naar…","perguntaram sobre…"), X("v-ik-antwoordde-dat","ik antwoordde dat…","respondi que…")],
  ex=[("Ze vroegen naar mijn ervaring.","Perguntaram sobre a minha experiência."),("Ze vroegen waarom ik naar Nederland ben verhuisd.","Perguntaram porque é que me mudei para os Países Baixos."),("Ik antwoordde dat ik nieuwe uitdagingen zocht.","Respondi que procurava novos desafios.")],
  review=["v-sollicitatiegesprek","v-informeren-naar"],
  cefr=C, exs=[
    MA([("ze vroegen naar…","perguntaram sobre…"),("ik antwoordde dat…","respondi que…"),("informeren naar","informar-se sobre"),("sollicitatiegesprek","entrevista de emprego")], "Entrevista.", ["v-ze-vroegen-naar","v-ik-antwoordde-dat","v-informeren-naar","v-sollicitatiegesprek"]),
    TR("pt-nl","Perguntaram sobre a minha experiência.", ["Ze vroegen naar mijn ervaring","Zij vroegen naar mijn ervaring"], "vragen naar.", ["v-ze-vroegen-naar"]),
    TR("pt-nl","Respondi que procurava novos desafios.", ["Ik antwoordde dat ik nieuwe uitdagingen zocht","Ik antwoordde dat ik op zoek was naar nieuwe uitdagingen"], "antwoorden dat.", ["v-ik-antwoordde-dat"]),
    CO("dialogue","Na het sollicitatiegesprek","Vriend: En? Hoe ging het?\nAna: Goed, denk ik! Eerst vroegen ze naar mijn ervaring in Lissabon.\nVriend: En toen?\nAna: Toen wilden ze weten waarom ik in Nederland wil blijven. Ik antwoordde dat ik me hier thuis voel.\nVriend: Mooi antwoord! Zeiden ze wanneer je iets hoort?\nAna: Ze beloofden dat ze vóór vrijdag zouden bellen.",
       [("Primeira pergunta?", ["*A experiência em Lisboa","O salário","Os hobbies"]),("Porque quer ficar?", ["*Sente-se em casa","Pelo clima","Pelo salário"]),("Quando ligam?", ["*Antes de sexta","Amanhã","Daqui a um mês"])],
       "Relatar uma entrevista.", ["v-ze-vroegen-naar","v-ik-antwoordde-dat"]),
    FB("Ze wilden weten ___ ik kon beginnen.", ["wanneer"], "Pergunta aberta.", ["v-ze-vroegen-naar"], choices=["wanneer","of","dat"], tr="Queriam saber quando eu podia começar."),
    MC("Qual é a ordem correta?", ["*Ze vroegen waarom ik hier wil werken.","Ze vroegen waarom ik wil hier werken.|Verbos juntos no fim."], "Verbos juntos no fim.", ["v-ze-vroegen-naar"]),
    SW("Conte a um amigo, em discurso indireto (4–5 frases), uma entrevista (real ou imaginada): 2 perguntas que lhe fizeram, 1 resposta sua e o que prometeram.", ["Ze vroegen eerst naar mijn opleiding. Daarna wilden ze weten of ik in het weekend kan werken. Ik antwoordde dat dat soms kan. Ze beloofden dat ik binnen een week iets zou horen."], ["2 perguntas relatadas","1 resposta","1 promessa"], 35, "Relatar.", ["v-ze-vroegen-naar","v-ik-antwoordde-dat"]),
  ], diff=4, mins=6)

L(25, "Prática: contar uma conversa", "En toen zei ze dat…",
  ["Contar uma conversa inteira em discurso indireto"],
  vocab=[X("v-en-toen-zei","en toen zei hij dat…","e depois ele disse que…")],
  ex=[("En toen zei hij dat hij het niet meer wist.","E depois ele disse que já não sabia.")],
  review=["v-zei-dat","v-vroeg-of","v-vroeg-waar","v-zei-dat-ik-moest","v-voorstellen-om","v-beloofde-dat","v-de-volgende-dag","v-ik-heb-gehoord-dat"],
  cefr=C, exs=[
    CO("dialogue","Bij de huisarts (direct)","Huisarts: Hoe lang heeft u deze klachten al?\nRui: Sinds een week.\nHuisarts: Heeft u koorts gehad?\nRui: Nee.\nHuisarts: Neem twee keer per dag een paracetamol en drink veel water. Als het niet beter wordt, komt u volgende week terug.",
       [("Desde quando?", ["*Há uma semana","Há um mês","Desde ontem"]),("Teve febre?", ["*Não","Sim","Não se sabe"]),("Conselho?", ["*Paracetamol e muita água","Antibiótico","Repouso total"])],
       "Diálogo direto.", ["v-en-toen-zei"]),
    MC("Relato correto da 1.ª pergunta:", ["*De huisarts vroeg hoe lang ik die klachten al had.","De huisarts vroeg hoe lang heeft u klachten.|Direto misturado.","De huisarts vroeg of hoe lang.|Errado."], "Pergunta aberta.", ["v-vroeg-waar"]),
    MC("Relato correto da 2.ª pergunta:", ["*Ze vroeg of ik koorts had gehad.","Ze vroeg dat ik koorts had.|Pergunta → of.","Ze vroeg had ik koorts.|Errado."], "Sim/não.", ["v-vroeg-of"]),
    MC("Relato correto do conselho:", ["*Ze zei dat ik twee keer per dag een paracetamol moest nemen.","Ze zei: neem paracetamol.|Direto.","Ze zei dat ik neem paracetamol.|Errado."], "Ordem → moest.", ["v-zei-dat-ik-moest"]),
    TR("pt-nl","E depois ele disse que já não sabia.", ["En toen zei hij dat hij het niet meer wist"], "en toen.", ["v-en-toen-zei"]),
    FE(["Ze","zei","dat","ik","volgende","week","terug","moet","komen."], 7, "moest", "Passado: moest.", ["v-zei-dat-ik-moest"]),
    SW("Conte a conversa com o médico (acima) a um amigo, toda em discurso indireto (5–6 frases).", ["Ik was vandaag bij de huisarts. Ze vroeg hoe lang ik die klachten al had. Ik zei dat ik ze sinds een week had. Toen vroeg ze of ik koorts had gehad, maar dat was niet zo. Ze zei dat ik twee keer per dag een paracetamol moest nemen en veel water moest drinken. Als het niet beter wordt, moet ik volgende week terugkomen."], ["Perguntas relatadas","Ordens relatadas","Pronomes corretos"], 60, "Relato completo.", ["v-en-toen-zei"]),
  ], diff=5, mins=8)

W()
