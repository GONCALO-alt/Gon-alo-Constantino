import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u04")
C = "B2"

L(1, "O método STAR", "Situatie, Taak, Actie, Resultaat",
  ["Responder a perguntas de competências com o método STAR"],
  vocab=[V("v-star-methode","STAR-methode","método STAR","noun","de"), V("v-competentie","competentie","competência","noun","de"),
         V("v-aanpakken","aanpakken","abordar|tratar de","verb"), V("v-resultaat-behalen","een resultaat behalen","alcançar um resultado","expression")],
  ex=[("Geef een voorbeeld van een situatie waarin je een conflict oploste.","Dê um exemplo de uma situação em que resolveu um conflito."),("Hoe heb je dat aangepakt?","Como abordou isso?"),("Uiteindelijk hebben we een goed resultaat behaald.","No fim alcançámos um bom resultado."),("Welke competenties heb je daarbij gebruikt?","Que competências usou nisso?")],
  gram=[G("g-star","STAR","**S**ituatie: *In mijn vorige baan…* **T**aak: *Mijn taak was om…* **A**ctie: *Ik heb toen… / Eerst… daarna…* **R**esultaat: *Uiteindelijk… / Het resultaat was dat…* Use o **passado** e fale na **1.ª pessoa** (*ik*, não *we*, quando foi você).",
    [("Mijn taak was om de klant tevreden te houden.","A minha tarefa era manter o cliente satisfeito.")])],
  review=["v-sollicitatiegesprek","v-taak","v-resultaat"],
  cefr=C, exs=[
    MA([("STAR-methode","método STAR"),("competentie","competência"),("aanpakken","abordar"),("een resultaat behalen","alcançar um resultado")], "STAR.", ["v-star-methode","v-competentie","v-aanpakken","v-resultaat-behalen"]),
    MC("O que significa o «A» de STAR?", ["*Actie — o que VOCÊ fez","Antwoord|Não.","Afdeling|Não."], "STAR.", ["v-star-methode"]),
    MC("Qual frase pertence ao «Resultaat»?", ["*Uiteindelijk waren alle klanten op tijd geholpen.","Ik werkte bij een callcenter.|Situatie.","Mijn taak was de planning.|Taak."], "Resultado.", ["v-resultaat-behalen"]),
    TR("pt-nl","Como abordou isso?", ["Hoe heb je dat aangepakt","Hoe heeft u dat aangepakt","Hoe pakte je dat aan"], "aanpakken.", ["v-aanpakken"]),
    TR("pt-nl","A minha tarefa era manter o cliente satisfeito.", ["Mijn taak was om de klant tevreden te houden","Mijn taak was de klant tevreden te houden"], "om … te.", ["v-taak"]),
    AR("competentie","a competência","de", "De competentie.", ["v-competentie"]),
    FE(["Uiteindelijk","we","hebben","een","goed","resultaat","behaald."], 1, "hebben we", "Inversão: Uiteindelijk hebben we…", ["v-resultaat-behalen"]),
    LI("Geef eens een voorbeeld van een situatie waarin je onder druk werkte.", ["Geef eens een voorbeeld van een situatie waarin je onder druk werkte"], "Dê um exemplo de uma situação em que trabalhou sob pressão.", "waarin.", ["v-star-methode"]),
    CJ("aanpakken","ik","Ik heb het probleem direct ___.", ["aangepakt"], "aan-ge-pakt.", ["v-aanpakken"], tense="passado-perfeito"),
    SW("Responda com STAR (4 frases) a «Vertel over een moment waarop je een fout maakte.»", ["In mijn vorige baan bij een hotel stuurde ik een gast een verkeerde factuur (S). Mijn taak was om dat snel op te lossen (T). Ik heb de gast meteen gebeld, mijn excuses aangeboden en een correcte factuur gestuurd (A). Uiteindelijk was de gast tevreden en heb ik een controlestap ingevoerd (R)."], ["Situatie", "Taak", "Actie na 1.ª pessoa", "Resultaat"], 60, "STAR.", ["v-star-methode"]),
  ], diff=5, mins=8)

L(2, "Perguntas difíceis de entrevista", "Waarom wil je weg bij je huidige werkgever? Wat zijn je salariswensen?",
  ["Responder a perguntas delicadas com diplomacia"],
  vocab=[V("v-huidige-werkgever","huidige werkgever","empregador atual","noun","de"), V("v-gat-in-cv","gat in je cv","interrupção no currículo","expression"),
         V("v-loopbaan","loopbaan","carreira","noun","de"), V("v-doorgroeien","doorgroeien","progredir (na carreira)","verb")],
  ex=[("Waarom wil je weg bij je huidige werkgever?","Porque quer sair do seu empregador atual?"),("Er zit een gat van een jaar in je cv.","Há uma interrupção de um ano no seu currículo."),("Ik wil graag doorgroeien naar een leidinggevende functie.","Gostaria de progredir para uma função de chefia."),("Hoe zie je je loopbaan?","Como vê a sua carreira?")],
  review=["v-uitdaging","v-zich-ontwikkelen","v-salarisverwachting"],
  cefr=C, exs=[
    MA([("huidige werkgever","empregador atual"),("gat in je cv","interrupção no currículo"),("loopbaan","carreira"),("doorgroeien","progredir")], "Perguntas difíceis.", ["v-huidige-werkgever","v-gat-in-cv","v-loopbaan","v-doorgroeien"]),
    MC("«Waarom wil je weg?» — melhor resposta:", ["*Ik heb veel geleerd, maar ik zoek meer verantwoordelijkheid en kan daar niet doorgroeien.","Mijn baas is vreselijk.|Nunca critique o empregador atual.","Voor het geld.|Pouco motivador."], "Positivo.", ["v-doorgroeien"]),
    MC("Explicar uma interrupção no cv por razões familiares:", ["*Ik heb een jaar voor mijn vader gezorgd. Daarnaast heb ik een cursus gevolgd.","Dat gaat u niets aan.|Defensivo.","Ik deed niks.|Pouco estratégico."], "Honesto e positivo.", ["v-gat-in-cv"]),
    TR("pt-nl","Gostaria de progredir para uma função de chefia.", ["Ik wil graag doorgroeien naar een leidinggevende functie"], "doorgroeien naar.", ["v-doorgroeien"]),
    TR("nl-pt","Er zit een gat van een jaar in je cv.", ["Há uma interrupção de um ano no seu currículo","Tem um intervalo de um ano no currículo"], "gat.", ["v-gat-in-cv"]),
    AR("loopbaan","a carreira","de", "De loopbaan.", ["v-loopbaan"]),
    FE(["Ik","wil","doorgroeien","tot","een","leidinggevende","functie."], 3, "naar", "doorgroeien naar.", ["v-doorgroeien"]),
    LI("Waar zie je jezelf over vijf jaar in je loopbaan?", ["Waar zie je jezelf over vijf jaar in je loopbaan"], "Onde se vê daqui a cinco anos na sua carreira?", "loopbaan.", ["v-loopbaan"]),
    FB("Bij mijn ___ werkgever zijn er weinig mogelijkheden.", ["huidige"], "Atual.", ["v-huidige-werkgever"], choices=["huidige","vorige","volgende"], tr="No meu empregador atual há poucas possibilidades."),
    SW("Responda (3 frases) a «Waarom wil je bij ons werken en niet meer bij je huidige werkgever?» sem criticar o empregador atual.", ["Bij mijn huidige werkgever heb ik veel geleerd over klantcontact. Ik zoek nu een functie waarin ik meer verantwoordelijkheid krijg en kan doorgroeien. Uw bedrijf biedt precies die kansen, en de internationale omgeving spreekt me erg aan."], ["Nada negativo sobre o atual", "Motivação para crescer", "Ligação à empresa"], 45, "Resposta diplomática.", ["v-doorgroeien","v-huidige-werkgever"]),
  ], diff=5, mins=8)

L(3, "Entrevista nos media", "Een interview met een journalist.",
  ["Dar uma entrevista a um jornalista com mensagens claras"],
  vocab=[V("v-journalist","journalist","jornalista","noun","de"), V("v-woordvoerder","woordvoerder","porta-voz","noun","de"),
         V("v-kernboodschap","kernboodschap","mensagem principal","noun","de"), V("v-geen-commentaar","geen commentaar","sem comentários","expression")],
  ex=[("Een journalist wil u interviewen.","Um jornalista quer entrevistá-lo."),("De woordvoerder gaf een korte verklaring.","O porta-voz deu uma breve declaração."),("Wat is je kernboodschap?","Qual é a tua mensagem principal?"),("Daar geef ik geen commentaar op.","Sobre isso não faço comentários.")],
  review=["v-citaat","v-bevestigen-rede","v-ontkennen"],
  cefr=C, exs=[
    MA([("journalist","jornalista"),("woordvoerder","porta-voz"),("kernboodschap","mensagem principal"),("geen commentaar","sem comentários")], "Media.", ["v-journalist","v-woordvoerder","v-kernboodschap","v-geen-commentaar"]),
    TR("pt-nl","Qual é a tua mensagem principal?", ["Wat is je kernboodschap","Wat is jouw kernboodschap"], "kernboodschap.", ["v-kernboodschap"]),
    TR("nl-pt","De woordvoerder gaf een korte verklaring.", ["O porta-voz deu uma breve declaração","O porta-voz fez uma declaração curta"], "verklaring.", ["v-woordvoerder"]),
    TR("pt-nl","Sobre isso não faço comentários.", ["Daar geef ik geen commentaar op","Daar wil ik geen commentaar op geven"], "commentaar geven op.", ["v-geen-commentaar"]),
    CO("dialogue","Interview na de opening", "Journalist: Mevrouw Costa, uw bakkerij is net geopend. Waarom juist in deze wijk?\nCosta: De wijk groeit snel en er was nog geen bakker. Onze kernboodschap is: vers, lokaal en betaalbaar.\nJournalist: Er zijn klachten over de lange rijen. Wat doet u daaraan?\nCosta: Dat begrijp ik. Vanaf volgende week kunnen klanten ook online bestellen en ophalen.\nJournalist: Klopt het dat u een tweede vestiging opent?\nCosta: Daar kan ik nu nog niets over zeggen.",
       [("Porque escolheu este bairro?", ["*Cresce depressa e não havia padaria","As rendas são baratas","Mora lá"]),("Qual é a mensagem principal?", ["*Fresco, local e acessível","Barato e rápido","Internacional"]),("Como responde à pergunta sobre a segunda loja?", ["*Não diz nada por agora","Confirma","Nega"])],
       "vestiging = filial.", ["v-kernboodschap","v-geen-commentaar"]),
    MC("Numa entrevista, a «kernboodschap» deve ser…", ["*curta e repetida","longa e técnica|Não.","escondida|Não."], "Mensagem.", ["v-kernboodschap"]),
    FE(["Daar","geef","ik","geen","commentaar","over."], 5, "op", "commentaar geven op.", ["v-geen-commentaar"]),
    LI("Daar kan ik op dit moment nog niets over zeggen.", ["Daar kan ik op dit moment nog niets over zeggen"], "Sobre isso não posso dizer nada neste momento.", "Fórmula de evasão educada.", ["v-geen-commentaar"]),
    AR("woordvoerder","o porta-voz","de", "De woordvoerder.", ["v-woordvoerder"]),
    FB("De ___ van de gemeente beantwoordde vragen van de pers.", ["woordvoerder"], "Porta-voz.", ["v-woordvoerder"], choices=["woordvoerder","journalist","kernboodschap"], tr="O porta-voz da câmara respondeu a perguntas da imprensa."),
  ], diff=5, mins=8)

L(4, "Negociar o contrato", "arbeidsvoorwaarden, secundaire voorwaarden, opleidingsbudget",
  ["Negociar condições de trabalho depois de uma proposta"],
  vocab=[V("v-arbeidsvoorwaarden","arbeidsvoorwaarden","condições de trabalho","noun","de"), V("v-secundaire-voorwaarden","secundaire arbeidsvoorwaarden","benefícios adicionais","noun","de"),
         V("v-opleidingsbudget","opleidingsbudget","orçamento para formação","noun","het"), V("v-ruimte","ruimte (voor)","margem (para)","noun","de")],
  ex=[("De arbeidsvoorwaarden zijn goed.","As condições de trabalho são boas."),("Is er ruimte om over het salaris te praten?","Há margem para falar sobre o salário?"),("Ik heb een opleidingsbudget van 1500 euro per jaar.","Tenho um orçamento de formação de 1500 euros por ano."),("De secundaire voorwaarden zijn uitstekend.","Os benefícios adicionais são excelentes.")],
  review=["v-salarisverwachting","v-onderhandelen","v-vakantiegeld","v-op-voorwaarde-dat"],
  cefr=C, exs=[
    MA([("arbeidsvoorwaarden","condições de trabalho"),("secundaire arbeidsvoorwaarden","benefícios adicionais"),("opleidingsbudget","orçamento de formação"),("ruimte","margem")], "Contrato.", ["v-arbeidsvoorwaarden","v-secundaire-voorwaarden","v-opleidingsbudget","v-ruimte"]),
    TR("pt-nl","Há margem para falar sobre o salário?", ["Is er ruimte om over het salaris te praten","Is er ruimte om over het salaris te onderhandelen"], "ruimte om … te.", ["v-ruimte"]),
    TR("nl-pt","De secundaire voorwaarden zijn uitstekend.", ["Os benefícios adicionais são excelentes"], "secundaire voorwaarden.", ["v-secundaire-voorwaarden"]),
    AR("opleidingsbudget","o orçamento de formação","het", "Het budget.", ["v-opleidingsbudget"]),
    MC("São «secundaire arbeidsvoorwaarden», por exemplo…", ["*pensão, formação, teletrabalho, bicicleta da empresa","o salário base|Isso é primário.","o horário de abertura da loja|Não."], "Benefícios.", ["v-secundaire-voorwaarden"]),
    DL([("HR","We bieden 3.400 euro bruto per maand.","Oferecemos 3400 euros brutos por mês."),("Kandidaat","")], ["*Dank u. Gezien mijn ervaring had ik aan 3.700 gedacht. Is daar ruimte voor, of eventueel in de secundaire voorwaarden?","Prima, alles is goed.|Não negocia.","Dat is belachelijk weinig.|Agressivo."], "Contraproposta educada.", ["v-ruimte"]),
    FE(["Is","er","ruimte","voor","over","het","salaris","te","praten?"], 3, "om", "ruimte om … te.", ["v-ruimte"]),
    LI("Als het salaris niet hoger kan, zou een groter opleidingsbudget ook helpen.", ["Als het salaris niet hoger kan(,) zou een groter opleidingsbudget ook helpen"], "Se o salário não puder subir, um orçamento de formação maior também ajudaria.", "Alternativa.", ["v-opleidingsbudget"]),
    FB("Ik ben tevreden met de ___, vooral met de flexibele werktijden.", ["arbeidsvoorwaarden"], "Condições.", ["v-arbeidsvoorwaarden"], choices=["arbeidsvoorwaarden","ruimte","opleidingsbudget"], tr="Estou satisfeito com as condições, sobretudo com o horário flexível."),
    SW("Escreva um e-mail curto (3–4 frases) a aceitar a proposta, mas a pedir mais um ponto (ex.: um dia de teletrabalho).", ["Beste Karin,\nHartelijk dank voor het aanbod, ik ben er erg blij mee. Ik ga graag akkoord met het salaris. Zou het mogelijk zijn om één dag per week thuis te werken? Dan kan ik ook mijn reistijd beperken.\nMet vriendelijke groet,\nPedro"], ["Agradecimento", "Aceitação", "Pedido com **zou het mogelijk zijn**", "Razão"], 45, "Negociar por escrito.", ["v-arbeidsvoorwaarden"]),
  ], diff=5, mins=8)

L(5, "Simulação: entrevista completa", "Do início ao fim.",
  ["Integrar todas as estratégias numa entrevista completa"],
  vocab=[V("v-kennismakingsgesprek","kennismakingsgesprek","conversa de apresentação","noun","het"), V("v-tweede-ronde","tweede ronde","segunda fase (entrevista)","noun","de"),
         V("v-referentie","referentie","referência","noun","de"), V("v-aanbod-krijgen","een aanbod krijgen","receber uma proposta","expression")],
  ex=[("Het eerste gesprek is een kennismakingsgesprek.","A primeira conversa é de apresentação."),("Je bent door naar de tweede ronde!","Passaste à segunda fase!"),("Mogen we je referenties bellen?","Podemos contactar as tuas referências?"),("Ik heb een aanbod gekregen!","Recebi uma proposta!")],
  review=["v-star-methode","v-doorgroeien","v-arbeidsvoorwaarden","v-vertel-eens"],
  cefr=C, exs=[
    MA([("kennismakingsgesprek","conversa de apresentação"),("tweede ronde","segunda fase"),("referentie","referência"),("een aanbod krijgen","receber proposta")], "Processo.", ["v-kennismakingsgesprek","v-tweede-ronde","v-referentie","v-aanbod-krijgen"]),
    CO("dialogue","Sollicitatiegesprek", "Interviewer: Welkom, Rita. Vertel eens kort iets over jezelf.\nRita: Ik ben logistiek manager en werk sinds vijf jaar bij een distributiecentrum in Venlo.\nInterviewer: Kun je een voorbeeld geven van een moment waarop je onder grote druk moest presteren?\nRita: Tijdens de feestdagen viel ons systeem uit. Mijn taak was om de leveringen toch op tijd te laten vertrekken. Ik heb een handmatig schema gemaakt en extra mensen ingezet. Uiteindelijk ging 98 procent op tijd de deur uit.\nInterviewer: Indrukwekkend. Waarom wil je overstappen?\nRita: Ik wil doorgroeien naar een internationale functie, en jullie werken in twaalf landen.\nInterviewer: Heb je nog vragen voor ons?\nRita: Ja, hoe ziet de inwerkperiode eruit?",
       [("Que método usa a Rita no exemplo?", ["*STAR","Nenhum","Só fala do resultado"]),("Qual foi o resultado?", ["*98% das entregas saiu a horas","O sistema foi reparado","Foi promovida"]),("Porque quer mudar?", ["*Para progredir para uma função internacional","Por causa do salário","Porque foi despedida"]),("Que pergunta faz no fim?", ["*Sobre o período de integração","Sobre férias","Sobre o carro da empresa"])],
       "ingezet = mobilizado; overstappen = mudar (de emprego).", ["v-star-methode","v-doorgroeien"]),
    TR("pt-nl","Passaste à segunda fase!", ["Je bent door naar de tweede ronde","Je bent door naar de volgende ronde"], "door zijn naar.", ["v-tweede-ronde"]),
    TR("pt-nl","Podemos contactar as tuas referências?", ["Mogen we je referenties bellen","Mogen we contact opnemen met je referenties","Mogen wij je referenties bellen"], "referenties.", ["v-referentie"]),
    TR("nl-pt","Ik heb een aanbod gekregen!", ["Recebi uma proposta","Recebi uma oferta de emprego"], "aanbod.", ["v-aanbod-krijgen"]),
    AR("kennismakingsgesprek","a conversa de apresentação","het", "Het gesprek.", ["v-kennismakingsgesprek"]),
    FE(["Ik","ben","door","op","de","tweede","ronde."], 3, "naar", "door zijn naar.", ["v-tweede-ronde"]),
    LI("We willen je graag uitnodigen voor een tweede gesprek.", ["We willen je graag uitnodigen voor een tweede gesprek","Wij willen je graag uitnodigen voor een tweede gesprek"], "Gostaríamos de te convidar para uma segunda entrevista.", "uitnodigen.", ["v-tweede-ronde"]),
    MC("Qual é uma boa pergunta final ao entrevistador?", ["*Hoe ziet het team eruit waarin ik zou werken?","Hoeveel vakantie krijg ik?|Melhor mais tarde.","Mag ik nu naar huis?|Não."], "Interesse.", ["v-kennismakingsgesprek"]),
    SW("Responda a «Waarom moeten we jou aannemen?» em 3–4 frases convincentes.", ["Ik heb vijf jaar ervaring in de logistiek en ik heb laten zien dat ik onder druk resultaten kan behalen. Bovendien spreek ik vier talen, wat handig is voor jullie internationale klanten. Ik ben gemotiveerd om door te groeien en ik pas goed in een team dat snel werkt."], ["Experiência concreta", "Resultado/competência", "Ligação à empresa", "Motivação"], 50, "Convencer.", ["v-aanbod-krijgen"]),
  ], diff=5, mins=8)

W()
