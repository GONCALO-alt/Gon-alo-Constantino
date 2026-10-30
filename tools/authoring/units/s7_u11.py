import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u11")
C = "B2"

L(1, "Fala rápida e reduções", "'k heb 't niet gezien. Wa's dat? Hoe gaat 't?",
  ["Compreender fala rápida com reduções típicas"],
  vocab=[V("v-k-ik","'k","ik (reduzido)","pronoun"), V("v-ie","ie","hij (reduzido, após verbo)","pronoun",note="Komt-ie ook?"),
         V("v-wa-s","wa's","wat is (reduzido)","expression"), V("v-spreektempo","spreektempo","velocidade de fala","noun","het")],
  ex=[("'k Heb 't niet gezien.","Não vi."),("Komt-ie ook?","Ele também vem?"),("Wa's dat?","O que é isso?"),("Het spreektempo is hoog.","A velocidade de fala é alta.")],
  gram=[G("g-reducties","Reduções frequentes","**ik → 'k**, **het → 't**, **een → 'n**, **hij → -ie** (depois do verbo: *Heeft-ie…?*), **wat is → wa's**, **hebben we → hebbe we**, **mijn/zijn → m'n/z'n**. Ao ouvir, reconstrua a forma completa. Ao escrever, use as formas completas (exceto em mensagens informais).",
    [("Heb-ie 't al gedaan? = Heeft hij het al gedaan?","Ele já o fez?")])],
  review=["v-gezellig-he","v-effe","v-informeel"],
  cefr=C, exs=[
    MA([("'k","ik"),("-ie","hij"),("wa's","wat is"),("spreektempo","velocidade de fala")], "Reduções.", ["v-k-ik","v-ie","v-wa-s","v-spreektempo"]),
    MC("«Komt-ie morgen?» em forma completa:", ["*Komt hij morgen?","Komt ie morgen?|Ainda reduzido.","Komt jij morgen?|Não."], "Reconstruir.", ["v-ie"]),
    MC("«'k Weet 't niet» em forma completa:", ["*Ik weet het niet.","Ik weet niet.|Falta het.","Ken het niet.|Não."], "Reconstruir.", ["v-k-ik"]),
    LI("Ik weet het niet, heeft hij het gezegd?", ["Ik weet het niet(,) heeft hij het gezegd"], "Não sei, ele disse?", "Escreva na forma completa.", ["v-k-ik","v-ie"]),
    LI("Wat is dat voor een ding?", ["Wat is dat voor een ding"], "Que coisa é essa?", "wa's = wat is.", ["v-wa-s"]),
    TR("nl-pt","Het spreektempo is hoog.", ["A velocidade de fala é alta","Fala-se muito depressa"], "spreektempo.", ["v-spreektempo"]),
    TR("nl-pt","Komt-ie ook?", ["Ele também vem","Ele vem também"], "-ie = hij.", ["v-ie"]),
    FE(["Geachte","heer,","'k","stuur","u","hierbij","de","factuur."], 2, "ik", "Por escrito formal use a forma completa: ik.", ["v-k-ik"]),
    AR("spreektempo","a velocidade de fala","het", "Het tempo.", ["v-spreektempo"]),
    MC("Melhor estratégia para fala muito rápida:", ["*Focar nas palavras-chave e no contexto, não em cada palavra","Parar de ouvir|Não.","Traduzir palavra a palavra|Muito lento."], "Estratégia.", ["v-spreektempo"]),
  ], diff=5, mins=7)

L(2, "Sotaques e variedades", "Flemish, Randstad, Limburgs, Gronings",
  ["Reconhecer diferenças entre variedades do neerlandês"],
  vocab=[V("v-accent","accent","sotaque","noun","het"), V("v-dialect","dialect","dialeto","noun","het"),
         V("v-vlaams","Vlaams","flamengo (neerlandês da Bélgica)","noun","het"), V("v-standaardtaal","standaardtaal","língua padrão","noun","de")],
  ex=[("Ze heeft een Limburgs accent.","Ela tem sotaque do Limburgo."),("In Groningen spreken ouderen nog dialect.","Em Groningen os mais velhos ainda falam dialeto."),("In België spreekt men Vlaams.","Na Bélgica fala-se flamengo."),("Het journaal is in de standaardtaal.","O telejornal é em língua padrão.")],
  gram=[G("g-variatie","Variedades","**Standaardnederlands**: o que se aprende e ouve no telejornal. **Vlaams** (Bélgica): outra pronúncia e algumas palavras (*goesting* = zin, *amai* = uau, *gij* = jij). **Sul (Brabante/Limburgo)**: g suave, mais melodia. **Randstad** (Amesterdão, Roterdão, Haia): g forte, sotaques urbanos. Os neerlandeses entendem-se todos — e também o vão entender a si.",
    [("Amai, dat is lekker! (Vlaams) = Wauw, dat is lekker!","Uau, isto é bom!")])],
  review=["v-zachte-g","v-houdoe","v-uitspraak"],
  cefr=C, exs=[
    MA([("accent","sotaque"),("dialect","dialeto"),("Vlaams","flamengo"),("standaardtaal","língua padrão")], "Variedades.", ["v-accent","v-dialect","v-vlaams","v-standaardtaal"]),
    AR("accent","o sotaque","het", "Het accent.", ["v-accent"]),
    AR("dialect","o dialeto","het", "Het dialect.", ["v-dialect"]),
    MC("«Ik heb er geen goesting in» (flamengo) =", ["*Ik heb er geen zin in.","Ik heb geen gast.|Não.","Ik heb geen geld.|Não."], "Vocabulário flamengo.", ["v-vlaams"]),
    MC("«Amai!» é uma interjeição típica…", ["*da Flandres (uau!)","de Amesterdão|Não.","do inglês|Não."], "Flamengo.", ["v-vlaams"]),
    TR("pt-nl","Ela tem sotaque do Limburgo.", ["Ze heeft een Limburgs accent","Zij heeft een Limburgs accent"], "accent.", ["v-accent"]),
    TR("nl-pt","Het journaal is in de standaardtaal.", ["O telejornal é em língua padrão","O noticiário é na língua padrão"], "standaardtaal.", ["v-standaardtaal"]),
    LI("Ik vind het Vlaamse accent heel melodieus.", ["Ik vind het Vlaamse accent heel melodieus"], "Acho o sotaque flamengo muito melodioso.", "accent.", ["v-accent"]),
    FE(["Hij","spreekt","met","een","sterke","accent."], 4, "sterk", "het accent → een sterk accent.", ["v-accent"]),
    MC("Ter sotaque estrangeiro em neerlandês…", ["*é normal; o importante é ser compreendido","é proibido no trabalho|Não.","impede a naturalização|Não."], "Atitude.", ["v-accent"]),
  ], diff=5, mins=7)

L(3, "Ouvir com ruído e várias vozes", "Op het station, in een café, aan de telefoon",
  ["Compreender informação em situações com ruído"],
  vocab=[V("v-omroepbericht","omroepbericht","anúncio (altifalante)","noun","het"), V("v-achtergrondgeluid","achtergrondgeluid","ruído de fundo","noun","het"),
         V("v-verstaanbaar","verstaanbaar","audível|percetível","adjective"), V("v-kernwoorden","kernwoorden","palavras-chave","noun","de")],
  ex=[("Het omroepbericht was slecht verstaanbaar.","O anúncio mal se percebia."),("Er is veel achtergrondgeluid.","Há muito ruído de fundo."),("Let op de kernwoorden: spoor, vertraging, tijd.","Atenção às palavras-chave: linha, atraso, hora."),("Kunt u iets harder praten? Het is hier druk.","Pode falar um pouco mais alto? Há aqui muita gente.")],
  review=["v-verstaan","v-perron","v-vertraging","v-harder"],
  cefr=C, exs=[
    MA([("omroepbericht","anúncio"),("achtergrondgeluid","ruído de fundo"),("verstaanbaar","percetível"),("kernwoorden","palavras-chave")], "Ouvir com ruído.", ["v-omroepbericht","v-achtergrondgeluid","v-verstaanbaar","v-kernwoorden"]),
    LI("De intercity naar Rotterdam vertrekt vandaag van spoor zeven.", ["De intercity naar Rotterdam vertrekt vandaag van spoor zeven","De intercity naar Rotterdam vertrekt vandaag van spoor 7"], "O intercidades para Roterdão parte hoje da linha sete.", "Anúncio de estação.", ["v-omroepbericht"]),
    LI("Wegens een seinstoring rijden er minder treinen tussen Utrecht en Amersfoort.", ["Wegens een seinstoring rijden er minder treinen tussen Utrecht en Amersfoort"], "Devido a uma avaria na sinalização, há menos comboios entre Utrecht e Amersfoort.", "Anúncio de perturbação.", ["v-omroepbericht"]),
    MC("Num anúncio com ruído, as palavras-chave mais importantes são…", ["*destino, linha (spoor), hora e problema","os artigos|Não.","os adjetivos|Não."], "Estratégia.", ["v-kernwoorden"]),
    TR("pt-nl","Há muito ruído de fundo.", ["Er is veel achtergrondgeluid"], "achtergrondgeluid.", ["v-achtergrondgeluid"]),
    TR("nl-pt","Het omroepbericht was slecht verstaanbaar.", ["O anúncio mal se percebia","O anúncio percebia-se mal"], "verstaanbaar.", ["v-verstaanbaar"]),
    AR("omroepbericht","o anúncio","het", "Het bericht.", ["v-omroepbericht"]),
    CO("dialogue","Op het perron", "Omroep: …trein naar Den Haag… vertraging… vijftien minuten… spoor vijf b…\nAna: Sorry, heeft u verstaan wat ze zeiden?\nMeneer: Ja, de trein naar Den Haag heeft een kwartier vertraging en vertrekt nu van spoor vijf b in plaats van vijf a.\nAna: O, dank u! Dan moet ik naar de andere kant van het perron.",
       [("Quanto tempo de atraso?", ["*Quinze minutos","Cinco minutos","Meia hora"]),("O que mudou?", ["*A linha: 5b em vez de 5a","O destino","O comboio foi cancelado"])],
       "Peça ajuda quando não percebe: «Heeft u verstaan wat ze zeiden?»", ["v-omroepbericht","v-verstaanbaar"]),
    FE(["Het","bericht","was","slecht","verstaanbare."], 4, "verstaanbaar", "Predicativo sem -e.", ["v-verstaanbaar"]),
    MC("Não percebeu o anúncio. O que diz a alguém ao lado?", ["*Sorry, heeft u verstaan wat er werd omgeroepen?","Stil!|Rude.","Ik versta alles.|Contraditório."], "Pedir ajuda.", ["v-verstaanbaar"]),
  ], diff=5, mins=7)

L(4, "Ouvir rádio, podcasts e entrevistas", "Hoofdpunten noteren tijdens het luisteren",
  ["Tirar notas dos pontos principais enquanto ouve"],
  vocab=[V("v-aantekeningen","aantekeningen","apontamentos","noun","de"), V("v-terugspoelen","terugspoelen","retroceder (áudio)","verb"),
         V("v-afspelen","afspelen","reproduzir","verb"), V("v-ondertiteling","ondertiteling","legendas","noun","de")],
  ex=[("Maak aantekeningen tijdens het luisteren.","Toma notas enquanto ouves."),("Spoel even terug, ik miste dat.","Recua um pouco, perdi isso."),("Speel het fragment nog een keer af.","Reproduz o excerto mais uma vez."),("Zet de Nederlandse ondertiteling aan.","Liga as legendas em neerlandês.")],
  review=["v-hoofdpunt","v-samenvatting","v-kern"],
  cefr=C, exs=[
    MA([("aantekeningen","apontamentos"),("terugspoelen","retroceder"),("afspelen","reproduzir"),("ondertiteling","legendas")], "Ouvir ativamente.", ["v-aantekeningen","v-terugspoelen","v-afspelen","v-ondertiteling"]),
    TR("pt-nl","Toma notas enquanto ouves.", ["Maak aantekeningen tijdens het luisteren"], "aantekeningen maken.", ["v-aantekeningen"]),
    TR("pt-nl","Liga as legendas em neerlandês.", ["Zet de Nederlandse ondertiteling aan"], "aanzetten.", ["v-ondertiteling"]),
    TR("nl-pt","Spoel even terug, ik miste dat.", ["Recua um pouco, perdi isso","Volta um bocadinho atrás, não apanhei isso"], "terugspoelen.", ["v-terugspoelen"]),
    MC("Para treinar compreensão, legendas em neerlandês (não em português) ajudam porque…", ["*ligam o som à escrita da mesma língua","traduzem tudo|Não traduzem.","são obrigatórias|Não."], "Estratégia.", ["v-ondertiteling"]),
    LI("In deze aflevering praten we over de toekomst van het werk.", ["In deze aflevering praten we over de toekomst van het werk"], "Neste episódio falamos sobre o futuro do trabalho.", "aflevering = episódio.", ["v-afspelen"]),
    LI("Volgens onze gast verdwijnen er banen, maar komen er ook nieuwe bij.", ["Volgens onze gast verdwijnen er banen(,) maar komen er ook nieuwe bij"], "Segundo o nosso convidado, desaparecem empregos, mas também surgem novos.", "Ideia principal.", ["v-hoofdpunt"]),
    FE(["Ik","heb","veel","aantekening","gemaakt."], 3, "aantekeningen", "Plural: aantekeningen.", ["v-aantekeningen"]),
    AR("ondertiteling","as legendas","de", "-ing → de.", ["v-ondertiteling"]),
    SW("Ouviu um podcast sobre teletrabalho. Escreva as suas notas (3 pontos curtos em neerlandês) com as ideias principais que imaginaria ouvir.", ["- Thuiswerken blijft populair, vooral 2–3 dagen per week.\n- Werkgevers willen meer contact op kantoor.\n- Belangrijk: duidelijke afspraken en een goede werkplek thuis."], ["Três pontos", "Frases curtas", "Ideias principais, não pormenores"], 20, "Notas.", ["v-aantekeningen"]),
  ], diff=5, mins=7)

L(5, "Compreensão de uma discussão rápida", "Een discussie met onderbrekingen en ironie.",
  ["Seguir uma discussão rápida com interrupções, ironia e mudanças de tema"],
  vocab=[V("v-door-elkaar-praten","door elkaar praten","falar todos ao mesmo tempo","expression"), V("v-ironie","ironie","ironia","noun","de"),
         V("v-van-onderwerp-veranderen","van onderwerp veranderen","mudar de assunto","expression"), V("v-instemmen","instemmen met","concordar com|aprovar","expression")],
  ex=[("Iedereen praatte door elkaar.","Toda a gente falava ao mesmo tempo."),("Dat was ironie, hoor!","Aquilo era ironia!"),("Hij veranderde snel van onderwerp.","Ele mudou rapidamente de assunto."),("De meeste mensen stemden in met het voorstel.","A maioria concordou com a proposta.")],
  review=["v-ironisch","v-onderbreken","v-afdwalen"],
  cefr=C, exs=[
    MA([("door elkaar praten","falar ao mesmo tempo"),("ironie","ironia"),("van onderwerp veranderen","mudar de assunto"),("instemmen met","concordar com")], "Discussão rápida.", ["v-door-elkaar-praten","v-ironie","v-van-onderwerp-veranderen","v-instemmen"]),
    CO("dialogue","Vergadering van de voetbalclub", "Voorzitter: Dus we verhogen de contributie met tien euro.\nKees: Tien euro? Nou, fantastisch, daar word ik blij van.\nSandra: Kees, laat hem even uitpraten…\nKees: Ja ja.\nVoorzitter: …omdat de kantine een nieuwe keuken nodig heeft. Wie stemt in?\nSandra: Ik. Maar kunnen we het ook over de trainingstijden hebben?\nVoorzitter: Daar komen we straks op.\nKees: Ik stem in, maar ik vind het nog steeds veel.",
       [("Quando o Kees diz «fantastisch, daar word ik blij van», ele…", ["*está a ser irónico","está mesmo contente","não percebeu"]),("Porque sobe a quota?", ["*Para uma cozinha nova no bar","Para novos equipamentos","Para pagar o treinador"]),("O Kees votou a favor?", ["*Sim, mas continua a achar caro","Não","Absteve-se"]),("O que tenta a Sandra fazer?", ["*Mudar para o tema dos horários de treino","Sair da reunião","Baixar a quota"])],
       "contributie = quota; kantine = bar do clube.", ["v-ironie","v-instemmen","v-van-onderwerp-veranderen"]),
    TR("pt-nl","Toda a gente falava ao mesmo tempo.", ["Iedereen praatte door elkaar","Iedereen sprak door elkaar"], "door elkaar.", ["v-door-elkaar-praten"]),
    TR("nl-pt","De meeste mensen stemden in met het voorstel.", ["A maioria concordou com a proposta","A maioria das pessoas aprovou a proposta"], "instemmen met.", ["v-instemmen"]),
    FE(["Ik","stem","in","op","het","voorstel."], 3, "met", "instemmen met.", ["v-instemmen"]),
    AR("ironie","a ironia","de", "De ironie.", ["v-ironie"]),
    LI("Nou, fantastisch, daar word ik blij van.", ["Nou(,) fantastisch(,) daar word ik blij van"], "Bem, fantástico, isso deixa-me contente. (irónico)", "Ironia.", ["v-ironie"]),
    MC("Como se reconhece ironia ao ouvir?", ["*Pelo tom e pelo contraste entre as palavras e a situação","Pelas palavras apenas|Insuficiente.","Não se reconhece|Reconhece-se."], "Ironia.", ["v-ironie"]),
    FB("Hij veranderde snel van ___ toen het over geld ging.", ["onderwerp"], "Mudar de assunto.", ["v-van-onderwerp-veranderen"], choices=["onderwerp","ironie","mening"], tr="Ele mudou rapidamente de assunto quando se falou de dinheiro."),
  ], diff=5, mins=8)

W()
