import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u04")
C = "B2"
# Lições de aprofundamento (10–29): entrevistas de emprego e com os media.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "STAR: situação e tarefa", "Een concreet voorbeeld geven.",
  ["Descrever a situação e a tarefa de um exemplo STAR"],
  vocab=[X("v-concreet-voorbeeld","een concreet voorbeeld geven","dar um exemplo concreto"), N("v-succesverhaal","succesverhaal","história de sucesso","het","succesverhalen")],
  ex=[("Kunt u een concreet voorbeeld geven?","Pode dar um exemplo concreto?"),("Bereid drie succesverhalen voor.","Prepara três histórias de sucesso."),("De situatie was als volgt: ons team had te weinig mensen.","A situação era a seguinte: a nossa equipa tinha pouca gente.")],
  review=["v-star-methode","v-situatie","v-taak"],
  cefr=C, exs=[
    MA([("een concreet voorbeeld geven","dar um exemplo concreto"),("succesverhaal","história de sucesso"),("situatie","situação"),("taak","tarefa")], "STAR.", ["v-concreet-voorbeeld","v-succesverhaal","v-situatie","v-taak"]),
    MC("S e T no método STAR são…", ["*Situatie en Taak","Samenwerking en Talent|Não.","Salaris en Tijd|Não."], "Método.", ["v-star-methode"]),
    TR("pt-nl","Pode dar um exemplo concreto?", ["Kunt u een concreet voorbeeld geven","Kunt u een concreet voorbeeld geven?","Kun je een concreet voorbeeld geven"], "Pergunta típica.", ["v-concreet-voorbeeld"]),
    TR("pt-nl","Prepara três histórias de sucesso.", ["Bereid drie succesverhalen voor"], "voorbereiden.", ["v-succesverhaal"]),
    AR("succesverhaal", "história de sucesso", "het", "het verhaal.", ["v-succesverhaal"]),
    FB("Mijn ___ was om binnen een maand een nieuw systeem in te voeren.", ["taak"], "Tarefa.", ["v-taak"], choices=["taak","situatie","resultaat"], tr="A minha tarefa era implementar um sistema novo num mês."),
    FE(["Kunt","u","een","concrete","voorbeeld","geven?"], 3, "concreet", "het voorbeeld + een → sem -e.", ["v-concreet-voorbeeld"]),
    LI("De situatie was als volgt: twee collega's waren tegelijk ziek.", ["De situatie was als volgt: twee collega's waren tegelijk ziek","De situatie was als volgt, twee collega's waren tegelijk ziek"], "A situação era a seguinte: dois colegas estavam doentes ao mesmo tempo.", "Situação.", ["v-situatie"]),
  ], diff=4, mins=5)

L(11, "STAR: ação e resultado", "Ik nam het initiatief.",
  ["Descrever as ações e os resultados com verbos ativos"],
  vocab=[X("v-initiatief-nemen","het initiatief nemen","tomar a iniciativa"), X("v-proactief","proactief","proativo","adjective")],
  ex=[("Ik nam het initiatief om een nieuw rooster te maken.","Tomei a iniciativa de fazer um horário novo."),("Ze is erg proactief.","Ela é muito proativa."),("Het resultaat: de wachttijd halveerde.","O resultado: o tempo de espera caiu para metade.")],
  review=["v-resultaat","v-resultaat-behalen","v-halveren"],
  cefr=C, exs=[
    MA([("het initiatief nemen","tomar a iniciativa"),("proactief","proativo"),("een resultaat behalen","alcançar um resultado"),("halveren","reduzir a metade")], "Ação.", ["v-initiatief-nemen","v-proactief","v-resultaat-behalen","v-halveren"]),
    MC("Na parte «Ação», é melhor dizer…", ["*«ik» e o que TU fizeste","só «wij»|Não mostra o teu papel.","o que o chefe fez|Não."], "Dica.", ["v-initiatief-nemen"]),
    TR("pt-nl","Tomei a iniciativa.", ["Ik nam het initiatief","Ik heb het initiatief genomen"], "Expressão.", ["v-initiatief-nemen"]),
    TR("pt-nl","Ela é muito proativa.", ["Ze is erg proactief","Zij is heel proactief"], "proactief.", ["v-proactief"]),
    FB("Daardoor ___ we ons doel twee weken eerder.", ["behaalden"], "Passado de behalen.", ["v-resultaat-behalen"], choices=["behaalden","behaald","behalen"], tr="Por isso alcançámos o objetivo duas semanas antes."),
    FE(["Ik","maakte","het","initiatief."], 1, "nam", "Colocação: het initiatief nemen.", ["v-initiatief-nemen"]),
    SW("Escreva a parte «Actie» e «Resultaat» (3–4 frases) de um exemplo STAR seu.", ["Ik nam het initiatief om elke ochtend een kort overleg te houden. Ik verdeelde de taken opnieuw en zocht een tijdelijke kracht. Het resultaat: we haalden de deadline en de klant was zeer tevreden."], ["Verbos ativos com «ik»","Resultado concreto"], 35, "STAR.", ["v-initiatief-nemen"]),
    LI("Een proactieve houding wordt erg gewaardeerd.", ["Een proactieve houding wordt erg gewaardeerd"], "Uma atitude proativa é muito valorizada.", "Uso.", ["v-proactief"]),
  ], diff=4, mins=5)

L(12, "Competências", "Klantgericht en resultaatgericht.",
  ["Descrever competências com exemplos"],
  vocab=[X("v-klantgericht","klantgericht","orientado para o cliente","adjective")],
  ex=[("Ik ben klantgericht: ik denk altijd vanuit de klant.","Sou orientado para o cliente: penso sempre a partir do cliente."),("Ze werkt zelfstandig en resultaatgericht.","Ela trabalha de forma autónoma e orientada para resultados.")],
  review=["v-competentie","v-resultaatgericht","v-zelfstandig","v-stressbestendig"],
  cefr=C, exs=[
    MA([("klantgericht","orientado para o cliente"),("resultaatgericht","orientado para resultados"),("zelfstandig","autónomo"),("stressbestendig","resistente ao stress")], "Competências.", ["v-klantgericht","v-resultaatgericht","v-zelfstandig","v-stressbestendig"]),
    MC("Dizer «Ik ben stressbestendig» sem exemplo…", ["*convence pouco; acrescenta uma situação concreta","é perfeito|Não.","é proibido|Não."], "Dica.", ["v-stressbestendig"]),
    TR("pt-nl","Sou orientado para o cliente.", ["Ik ben klantgericht"], "klantgericht.", ["v-klantgericht"]),
    TR("pt-nl","Ela trabalha de forma autónoma.", ["Ze werkt zelfstandig","Zij werkt zelfstandig"], "zelfstandig.", ["v-zelfstandig"]),
    FB("Welke ___ vindt u het belangrijkst voor deze functie?", ["competenties"], "Plural.", ["v-competentie"], choices=["competenties","klanten","resultaten"], tr="Que competências considera mais importantes para esta função?"),
    FE(["Ik","ben","een","klantgerichte","medewerker","en","zelfstandige."], 6, "zelfstandig.", "Predicativo: sem -e.", ["v-zelfstandig"]),
    SW("Escolha duas competências e dê para cada uma um exemplo de uma frase.", ["Ik ben klantgericht: toen een klant boos belde, heb ik hem dezelfde dag nog teruggebeld met een oplossing. Ik ben stressbestendig: tijdens de drukke kerstperiode bleef ik rustig en hielp ik nieuwe collega's."], ["2 competências","Exemplos"], 35, "Competências.", ["v-klantgericht"]),
    LI("In deze functie werk je grotendeels zelfstandig.", ["In deze functie werk je grotendeels zelfstandig"], "Nesta função trabalhas em grande parte de forma autónoma.", "Anúncio.", ["v-zelfstandig"]),
  ], diff=4, mins=5)

L(13, "Qualidades e armadilhas", "Het kernkwadrant.",
  ["Falar de pontos fortes e das suas armadilhas"],
  vocab=[N("v-kernkwadrant","kernkwadrant","quadrante de qualidades (modelo de Ofman)","het")],
  ex=[("Mijn kwaliteit is daadkracht; mijn valkuil is ongeduld.","A minha qualidade é a determinação; a minha armadilha é a impaciência."),("Het kernkwadrant helpt je jezelf beter te begrijpen.","O quadrante de qualidades ajuda-te a perceber-te melhor.")],
  review=["v-valkuil","v-kwaliteit","v-zwakke-punten"],
  cefr=C, exs=[
    MA([("kernkwadrant","quadrante de qualidades"),("valkuil","armadilha"),("kwaliteit","qualidade"),("zwakke punten","pontos fracos")], "Autoconhecimento.", ["v-kernkwadrant","v-valkuil","v-kwaliteit","v-zwakke-punten"]),
    MC("Qualidade «nauwkeurig» (preciso). Uma valkuil típica é…", ["*perfeccionismo","preguiça|Não liga.","rapidez|Não."], "Lógica do modelo.", ["v-valkuil"]),
    TR("pt-nl","A minha armadilha é a impaciência.", ["Mijn valkuil is ongeduld"], "valkuil.", ["v-valkuil"]),
    TR("pt-nl","A minha qualidade é a precisão.", ["Mijn kwaliteit is nauwkeurigheid"], "kwaliteit.", ["v-kwaliteit"]),
    AR("kernkwadrant", "quadrante de qualidades", "het", "het kwadrant.", ["v-kernkwadrant"]),
    FB("Te veel van een goede ___ wordt een valkuil.", ["kwaliteit"], "Qualidade.", ["v-kwaliteit"], choices=["kwaliteit","valkuil","fout"], tr="Demasiado de uma boa qualidade torna-se uma armadilha."),
    FE(["Mijn","valkuilen","is","dat","ik","te","snel","werk."], 1, "valkuil", "Singular: is.", ["v-valkuil"]),
    DL([("Recruiter","Wat is uw grootste valkuil?","Qual é a sua maior armadilha?"),("Jij","","")], ["*Ik ben erg nauwkeurig, en daardoor soms perfectionistisch. Ik heb geleerd om prioriteiten te stellen.","Ik heb geen valkuilen.|Pouco credível.","Ik ben lui.|Imprudente."], "Resposta equilibrada.", ["v-valkuil"]),
  ], diff=5, mins=5)

L(14, "Lidar com críticas", "Opbouwende kritiek.",
  ["Mostrar que sabe receber críticas"],
  vocab=[X("v-omgaan-met-kritiek","omgaan met kritiek","lidar com críticas","verb"), X("v-opbouwende-kritiek","opbouwende kritiek","crítica construtiva")],
  ex=[("Hoe gaat u om met kritiek?","Como lida com críticas?"),("Ik sta open voor opbouwende kritiek.","Estou aberto a crítica construtiva.")],
  review=["v-feedback","v-terugkoppeling"],
  cefr=C, exs=[
    MA([("omgaan met kritiek","lidar com críticas"),("opbouwende kritiek","crítica construtiva"),("feedback","feedback"),("terugkoppeling","retorno")], "Críticas.", ["v-omgaan-met-kritiek","v-opbouwende-kritiek","v-feedback","v-terugkoppeling"]),
    TR("pt-nl","Como lida com críticas?", ["Hoe gaat u om met kritiek","Hoe gaat u om met kritiek?","Hoe ga je om met kritiek"], "omgaan met.", ["v-omgaan-met-kritiek"]),
    TR("pt-nl","Estou aberto a crítica construtiva.", ["Ik sta open voor opbouwende kritiek"], "openstaan voor.", ["v-opbouwende-kritiek"]),
    MC("Uma boa resposta mostra…", ["*um exemplo em que a crítica o fez melhorar","que nunca recebe críticas|Pouco credível.","que discute sempre|Não."], "Estratégia.", ["v-omgaan-met-kritiek"]),
    FB("Ik sta open ___ opbouwende kritiek.", ["voor"], "openstaan voor.", ["v-opbouwende-kritiek"], choices=["voor","op","aan"], tr="Estou aberto a crítica construtiva."),
    FE(["Ik","ga","goed","om","op","kritiek."], 4, "met", "omgaan met.", ["v-omgaan-met-kritiek"]),
    LI("Mijn leidinggevende zei dat mijn rapporten te lang waren; sindsdien schrijf ik eerst een samenvatting.", ["Mijn leidinggevende zei dat mijn rapporten te lang waren; sindsdien schrijf ik eerst een samenvatting","Mijn leidinggevende zei dat mijn rapporten te lang waren, sindsdien schrijf ik eerst een samenvatting"], "A minha chefe disse que os meus relatórios eram longos demais; desde então escrevo primeiro um resumo.", "Exemplo.", ["v-omgaan-met-kritiek"]),
    WO("Estou aberto a críticas.", ["Ik","sta","open","voor","kritiek"], "Ordem.", ["v-opbouwende-kritiek"]),
  ], diff=4, mins=5)

L(15, "Conflitos no trabalho", "De lucht klaren.",
  ["Contar como resolveu um conflito"],
  vocab=[X("v-de-lucht-klaren","de lucht klaren","esclarecer as coisas|desanuviar"), X("v-conflict-oplossen","een conflict oplossen","resolver um conflito","verb")],
  ex=[("We hebben een gesprek gehad om de lucht te klaren.","Tivemos uma conversa para esclarecer as coisas."),("Hoe heeft u dat conflict opgelost?","Como resolveu esse conflito?")],
  review=["v-conflict","v-het-uitpraten","v-actief-luisteren"],
  cefr=C, exs=[
    MA([("de lucht klaren","esclarecer as coisas"),("een conflict oplossen","resolver um conflito"),("het uitpraten","falar sobre isso"),("actief luisteren","escuta ativa")], "Conflitos.", ["v-de-lucht-klaren","v-conflict-oplossen","v-het-uitpraten","v-actief-luisteren"]),
    EX("de lucht klaren", "limpar o ar", "O que significa?", ["*esclarecer uma tensão através de conversa","abrir a janela|Literal.","fazer limpezas|Não."], "Imagem.", ["v-de-lucht-klaren"]),
    TR("pt-nl","Tivemos uma conversa para esclarecer as coisas.", ["We hadden een gesprek om de lucht te klaren","We hebben een gesprek gehad om de lucht te klaren"], "om … te.", ["v-de-lucht-klaren"]),
    TR("pt-nl","Como resolveu o conflito?", ["Hoe heeft u het conflict opgelost","Hoe loste u het conflict op","Hoe heb je het conflict opgelost"], "oplossen.", ["v-conflict-oplossen"]),
    FB("Na een open gesprek was de lucht weer ___.", ["geklaard"], "Particípio.", ["v-de-lucht-klaren"], choices=["geklaard","klaar","geklaart"], tr="Depois de uma conversa franca, o ambiente desanuviou."),
    FE(["We","hebben","het","conflict","samen","opgelossen."], 5, "opgelost.", "Particípio: opgelost.", ["v-conflict-oplossen"]),
    SW("Responda com STAR (4–5 frases): «Vertel over een conflict met een collega.»", ["Een collega nam steeds mijn klanten over (S). Ik wilde de samenwerking verbeteren (T). Ik vroeg om een gesprek, luisterde eerst naar zijn kant en stelde een duidelijke verdeling voor (A). Daarmee klaarden we de lucht, en nu werken we prima samen (R)."], ["Estrutura STAR","Tom construtivo"], 45, "STAR.", ["v-conflict-oplossen"]),
    LI("Het hielp om het meteen uit te praten.", ["Het hielp om het meteen uit te praten"], "Ajudou falar logo sobre isso.", "Uso.", ["v-het-uitpraten"]),
  ], diff=5, mins=5)

L(16, "Explicar um despedimento", "Ik ben ontslagen na een reorganisatie.",
  ["Explicar uma saída ou lacuna no CV de forma positiva"],
  vocab=[X("v-ontslagen-worden","ontslagen worden","ser despedido","verb")],
  ex=[("Ik ben ontslagen na een reorganisatie.","Fui despedido depois de uma reestruturação."),("Die periode heb ik gebruikt om me om te scholen.","Usei esse período para me requalificar.")],
  review=["v-reorganisatie","v-gat-in-cv","v-omscholen"],
  cefr=C, exs=[
    MA([("ontslagen worden","ser despedido"),("reorganisatie","reestruturação"),("gat in je cv","lacuna no CV"),("zich omscholen","requalificar-se")], "Saídas.", ["v-ontslagen-worden","v-reorganisatie","v-gat-in-cv","v-omscholen"]),
    MC("Explicar uma lacuna no CV: a melhor estratégia é…", ["*ser honesto e mostrar o que aprendeu nesse período","esconder|Arriscado.","culpar o antigo chefe|Má impressão."], "Estratégia.", ["v-gat-in-cv"]),
    TR("pt-nl","Fui despedido depois de uma reestruturação.", ["Ik ben ontslagen na een reorganisatie","Ik werd ontslagen na een reorganisatie"], "Passiva.", ["v-ontslagen-worden"]),
    TR("pt-nl","Usei esse período para me requalificar.", ["Die periode heb ik gebruikt om me om te scholen","Ik heb die tijd gebruikt om me om te scholen"], "om … te.", ["v-omscholen"]),
    FB("Door de ___ verdwenen twintig functies.", ["reorganisatie"], "Reestruturação.", ["v-reorganisatie"], choices=["reorganisatie","sollicitatie","omscholing"], tr="Com a reestruturação desapareceram vinte funções."),
    FE(["Ik","heb","ontslagen","na","de","fusie."], 1, "ben", "Passiva: ben ontslagen.", ["v-ontslagen-worden"]),
    DL([("Recruiter","Ik zie een gat van een jaar in uw cv.","Vejo uma lacuna de um ano no seu CV."),("Jij","","")], ["*Klopt. Na een reorganisatie ben ik ontslagen. Dat jaar heb ik gebruikt om een opleiding data-analyse te volgen.","Dat gaat u niets aan.|Rude.","Ik was lui.|Imprudente."], "Honestidade positiva.", ["v-gat-in-cv"]),
    LI("Achteraf was het ontslag een keerpunt.", ["Achteraf was het ontslag een keerpunt"], "Olhando para trás, o despedimento foi um ponto de viragem.", "Perspetiva.", ["v-keerpunt"]),
  ], diff=5, mins=5)

L(17, "Sobrequalificado?", "U bent toch overgekwalificeerd?",
  ["Responder à objeção de sobrequalificação ou mudança de carreira"],
  vocab=[X("v-overgekwalificeerd","overgekwalificeerd","sobrequalificado","adjective")],
  ex=[("Bent u niet overgekwalificeerd voor deze functie?","Não está sobrequalificado para esta função?"),("Ik maak bewust een carrièreswitch.","Faço conscientemente uma mudança de carreira.")],
  review=["v-carriereswitch","v-loopbaan","v-motivatie"],
  cefr=C, exs=[
    MA([("overgekwalificeerd","sobrequalificado"),("carrièreswitch","mudança de carreira"),("loopbaan","carreira"),("motivatie","motivação")], "Carreira.", ["v-overgekwalificeerd","v-carriereswitch","v-loopbaan","v-motivatie"]),
    MC("Por trás da pergunta «Bent u niet overgekwalificeerd?» está muitas vezes o receio de que…", ["*o candidato se aborreça e saia depressa","o candidato seja mau|Não.","o salário seja baixo demais|Às vezes, mas o principal é a permanência."], "Intenção.", ["v-overgekwalificeerd"]),
    TR("pt-nl","Faço uma mudança de carreira consciente.", ["Ik maak bewust een carrièreswitch","Ik maak een bewuste carrièreswitch"], "bewust.", ["v-carriereswitch"]),
    TR("pt-nl","Não está sobrequalificado?", ["Bent u niet overgekwalificeerd","Bent u niet overgekwalificeerd?"], "Pergunta.", ["v-overgekwalificeerd"]),
    FB("Mijn ___ is dat ik meer met mensen wil werken.", ["motivatie"], "Motivação.", ["v-motivatie"], choices=["motivatie","loopbaan","switch"], tr="A minha motivação é querer trabalhar mais com pessoas."),
    FE(["Ik","ben","overgekwalificeerde","voor","deze","baan."], 2, "overgekwalificeerd", "Predicativo: sem -e.", ["v-overgekwalificeerd"]),
    DL([("Recruiter","U was manager in Lissabon. Waarom solliciteert u nu als medewerker?","Era gestor em Lisboa. Porque se candidata agora como funcionário?"),("Jij","","")], ["*Ik wil eerst de Nederlandse werkcultuur goed leren kennen. Ik blijf graag lang en groei van daaruit door.","Omdat ik geen keus heb.|Desmotivador.","Overgekwalificeerd.|Incompleto."], "Responder com motivação.", ["v-overgekwalificeerd"]),
    LI("Mijn ervaring als manager is juist een meerwaarde.", ["Mijn ervaring als manager is juist een meerwaarde"], "A minha experiência como gestor é precisamente uma mais-valia.", "Argumento.", ["v-meerwaarde"]),
  ], diff=5, mins=5)

L(18, "Perguntas ao empregador", "Wat zijn de doorgroeimogelijkheden?",
  ["Fazer perguntas inteligentes no fim da entrevista"],
  vocab=[N("v-doorgroeimogelijkheden","doorgroeimogelijkheden","possibilidades de progressão","de"), N("v-persoonlijkheid","persoonlijkheid","personalidade","de")],
  ex=[("Wat zijn de doorgroeimogelijkheden binnen het bedrijf?","Quais são as possibilidades de progressão na empresa?"),("Wat voor persoonlijkheid past goed in het team?","Que tipo de personalidade encaixa bem na equipa?")],
  review=["v-bedrijfscultuur","v-doorgroeien"],
  cefr=C, exs=[
    MA([("doorgroeimogelijkheden","possibilidades de progressão"),("persoonlijkheid","personalidade"),("bedrijfscultuur","cultura da empresa"),("doorgroeien","progredir")], "Perguntas.", ["v-doorgroeimogelijkheden","v-persoonlijkheid","v-bedrijfscultuur","v-doorgroeien"]),
    MC("Qual é a melhor pergunta para o fim da entrevista?", ["*Hoe ziet een gewone werkdag in dit team eruit?","Hoeveel vakantie krijg ik? (como 1.ª pergunta)|Prematura.","Geen vragen.|Parece desinteresse."], "Estratégia.", ["v-bedrijfscultuur"]),
    TR("pt-nl","Quais são as possibilidades de progressão?", ["Wat zijn de doorgroeimogelijkheden","Wat zijn de doorgroeimogelijkheden?"], "Pergunta.", ["v-doorgroeimogelijkheden"]),
    TR("pt-nl","Que personalidade encaixa na equipa?", ["Wat voor persoonlijkheid past in het team","Wat voor persoonlijkheid past goed in het team?"], "Pergunta.", ["v-persoonlijkheid"]),
    FB("Hoe zou u de ___ omschrijven?", ["bedrijfscultuur"], "Cultura da empresa.", ["v-bedrijfscultuur"], choices=["bedrijfscultuur","persoonlijkheid","loopbaan"], tr="Como descreveria a cultura da empresa?"),
    FE(["Wat","is","de","doorgroeimogelijkheden?"], 1, "zijn", "Plural: zijn.", ["v-doorgroeimogelijkheden"]),
    LI("Wat is voor u het belangrijkste in de eerste drie maanden?", ["Wat is voor u het belangrijkste in de eerste drie maanden","Wat is voor u het belangrijkste in de eerste drie maanden?"], "O que é para si o mais importante nos primeiros três meses?", "Boa pergunta.", ["v-doorgroeimogelijkheden"]),
    SW("Escreva três perguntas inteligentes para o fim de uma entrevista.", ["1. Hoe ziet een gewone werkdag eruit?\n2. Wat zijn de doorgroeimogelijkheden binnen de afdeling?\n3. Wat is voor u de grootste uitdaging voor deze functie in het eerste jaar?"], ["3 perguntas relevantes"], 25, "Perguntas.", ["v-doorgroeimogelijkheden"]),
  ], diff=4, mins=5)

L(19, "Falar de salário", "Een salarisindicatie geven.",
  ["Indicar expectativas salariais"],
  vocab=[N("v-salarisindicatie","salarisindicatie","indicação salarial","de"), X("v-bruto-jaarsalaris","bruto jaarsalaris","salário bruto anual")],
  ex=[("In de vacature staat een salarisindicatie.","No anúncio vem uma indicação salarial."),("Ik denk aan een bruto jaarsalaris van rond de 55.000 euro.","Penso num salário bruto anual de cerca de 55.000 euros.")],
  review=["v-salaris","v-bruto","v-vakantiegeld"],
  cefr=C, exs=[
    MA([("salarisindicatie","indicação salarial"),("bruto jaarsalaris","salário bruto anual"),("vakantiegeld","subsídio de férias"),("bruto","bruto")], "Salário.", ["v-salarisindicatie","v-bruto-jaarsalaris","v-vakantiegeld","v-bruto"]),
    MC("Nos Países Baixos, o subsídio de férias (vakantiegeld) é normalmente…", ["*cerca de 8% do salário bruto anual, pago em maio/junho","um 14.º mês igual ao português|Não exatamente.","inexistente|Não."], "Sistema (regra geral).", ["v-vakantiegeld"]),
    TR("pt-nl","Penso num salário bruto anual de 55.000 euros.", ["Ik denk aan een bruto jaarsalaris van 55.000 euro"], "Expressão.", ["v-bruto-jaarsalaris"]),
    TR("pt-nl","No anúncio vem uma indicação salarial.", ["In de vacature staat een salarisindicatie"], "staan.", ["v-salarisindicatie"]),
    FB("Is dat bedrag ___ of netto?", ["bruto"], "Bruto.", ["v-bruto"], choices=["bruto","totaal","vast"], tr="Esse valor é bruto ou líquido?"),
    FE(["Het","salarisindicatie","is","marktconform."], 0, "De", "de indicatie.", ["v-salarisindicatie"]),
    DL([("Recruiter","Wat zijn uw salariswensen?","Quais são as suas expectativas salariais?"),("Jij","","")], ["*Gezien mijn ervaring denk ik aan een bruto jaarsalaris tussen de 50.000 en 55.000 euro, inclusief vakantiegeld.","Zoveel mogelijk!|Pouco profissional.","Weet ik niet.|Fraco."], "Indicar com intervalo.", ["v-bruto-jaarsalaris"]),
    LI("Is het salaris inclusief vakantiegeld?", ["Is het salaris inclusief vakantiegeld","Is het salaris inclusief vakantiegeld?"], "O salário inclui o subsídio de férias?", "Pergunta.", ["v-vakantiegeld"]),
  ], diff=4, mins=5)

L(20, "O contrato", "Een arbeidsovereenkomst voor onbepaalde tijd.",
  ["Perceber os tipos de contrato"],
  vocab=[N("v-arbeidsovereenkomst","arbeidsovereenkomst","contrato de trabalho","de"), X("v-onbepaalde-tijd","voor onbepaalde tijd","sem termo"),
         X("v-in-dienst-treden","in dienst treden","entrar ao serviço","verb")],
  ex=[("Ik krijg een arbeidsovereenkomst voor onbepaalde tijd.","Vou ter um contrato sem termo."),("U kunt per 1 september in dienst treden.","Pode entrar ao serviço a 1 de setembro.")],
  review=["v-tijdelijk-contract","v-proeftijd","v-ingangsdatum"],
  cefr=C, exs=[
    MA([("arbeidsovereenkomst","contrato de trabalho"),("voor onbepaalde tijd","sem termo"),("in dienst treden","entrar ao serviço"),("tijdelijk contract","contrato a termo")], "Contrato.", ["v-arbeidsovereenkomst","v-onbepaalde-tijd","v-in-dienst-treden","v-tijdelijk-contract"]),
    MC("«Een vast contract» é o mesmo que…", ["*een contract voor onbepaalde tijd","een tijdelijk contract|Não.","een proeftijd|Não."], "Sinónimo.", ["v-onbepaalde-tijd"]),
    TR("pt-nl","Vou ter um contrato sem termo.", ["Ik krijg een contract voor onbepaalde tijd","Ik krijg een arbeidsovereenkomst voor onbepaalde tijd","Ik krijg een vast contract"], "onbepaalde tijd.", ["v-onbepaalde-tijd"]),
    TR("pt-nl","Pode entrar ao serviço a 1 de setembro.", ["U kunt per 1 september in dienst treden","U kunt op 1 september in dienst treden"], "in dienst treden.", ["v-in-dienst-treden"]),
    FB("Ik ben op 1 maart in ___ getreden.", ["dienst"], "Expressão.", ["v-in-dienst-treden"], choices=["dienst","werk","contract"], tr="Entrei ao serviço a 1 de março."),
    FE(["Ik","heb","in","dienst","getreden."], 1, "ben", "treden usa zijn.", ["v-in-dienst-treden"]),
    LI("Lees de arbeidsovereenkomst goed door voordat u tekent.", ["Lees de arbeidsovereenkomst goed door voordat u tekent","Lees de arbeidsovereenkomst goed door voor u tekent"], "Leia bem o contrato antes de assinar.", "Conselho.", ["v-arbeidsovereenkomst"]),
    MC("Proeftijd (período experimental) significa que…", ["*nesse período ambas as partes podem terminar o contrato facilmente","o salário é zero|Não.","não há contrato|Não."], "Conceito.", ["v-proeftijd"]),
  ], diff=4, mins=5)

L(21, "Cláusulas do contrato", "Een concurrentiebeding.",
  ["Perceber cláusulas importantes do contrato"],
  vocab=[N("v-concurrentiebeding","concurrentiebeding","cláusula de não concorrência","het"), N("v-pensioenregeling","pensioenregeling","plano de pensões","de"),
         N("v-vakantiedagen","vakantiedagen","dias de férias","de")],
  ex=[("Er staat een concurrentiebeding in mijn contract.","O meu contrato tem uma cláusula de não concorrência."),("Het bedrijf heeft een goede pensioenregeling.","A empresa tem um bom plano de pensões."),("Ik heb 25 vakantiedagen per jaar.","Tenho 25 dias de férias por ano.")],
  review=["v-opzegtermijn","v-secundaire-voorwaarden"],
  cefr=C, exs=[
    MA([("concurrentiebeding","cláusula de não concorrência"),("pensioenregeling","plano de pensões"),("vakantiedagen","dias de férias"),("opzegtermijn","pré-aviso")], "Cláusulas.", ["v-concurrentiebeding","v-pensioenregeling","v-vakantiedagen","v-opzegtermijn"]),
    AR("concurrentiebeding", "não concorrência", "het", "het beding.", ["v-concurrentiebeding"]),
    MC("Um concurrentiebeding pode impedi-lo de…", ["*trabalhar para um concorrente durante algum tempo após sair","tirar férias|Não.","receber salário|Não."], "Conceito.", ["v-concurrentiebeding"]),
    TR("pt-nl","Tenho 25 dias de férias por ano.", ["Ik heb 25 vakantiedagen per jaar","Ik heb vijfentwintig vakantiedagen per jaar"], "vakantiedagen.", ["v-vakantiedagen"]),
    TR("pt-nl","Qual é o pré-aviso?", ["Wat is de opzegtermijn","Wat is de opzegtermijn?","Hoe lang is de opzegtermijn"], "opzegtermijn.", ["v-opzegtermijn"]),
    FB("Een goede ___ is belangrijk voor later.", ["pensioenregeling"], "Pensões.", ["v-pensioenregeling"], choices=["pensioenregeling","vakantiedagen","concurrentiebeding"], tr="Um bom plano de pensões é importante para mais tarde."),
    FE(["De","concurrentiebeding","geldt","één","jaar."], 0, "Het", "het beding.", ["v-concurrentiebeding"]),
    LI("Laat het contract bij twijfel nakijken door een jurist.", ["Laat het contract bij twijfel nakijken door een jurist"], "Em caso de dúvida, mande o contrato rever por um jurista.", "Conselho geral.", ["v-concurrentiebeding"]),
  ], diff=5, mins=5)

L(22, "Recrutadores e redes", "Een headhunter benaderde me.",
  ["Falar de recrutadores e redes profissionais"],
  vocab=[N("v-headhunter","headhunter","caça-talentos","de","headhunters"), X("v-linkedin-profiel","je LinkedIn-profiel","o teu perfil do LinkedIn")],
  ex=[("Een headhunter benaderde me via LinkedIn.","Um caça-talentos contactou-me pelo LinkedIn."),("Werk je LinkedIn-profiel regelmatig bij.","Atualiza regularmente o teu perfil do LinkedIn.")],
  review=["v-netwerken","v-open-sollicitatie"],
  cefr=C, exs=[
    MA([("headhunter","caça-talentos"),("je LinkedIn-profiel","perfil do LinkedIn"),("netwerken","fazer networking"),("open sollicitatie","candidatura espontânea")], "Redes.", ["v-headhunter","v-linkedin-profiel","v-netwerken","v-open-sollicitatie"]),
    TR("pt-nl","Um caça-talentos contactou-me.", ["Een headhunter benaderde me","Een headhunter heeft me benaderd"], "benaderen.", ["v-headhunter"]),
    TR("pt-nl","Atualiza o teu perfil.", ["Werk je profiel bij","Werk je LinkedIn-profiel bij"], "bijwerken.", ["v-linkedin-profiel"]),
    MC("Nos Países Baixos, muitas vagas são preenchidas…", ["*também através da rede de contactos","só por anúncio|Não.","só por sorteio|Não."], "Cultura (tendência).", ["v-netwerken"]),
    FB("Ik stuur een ___ sollicitatie naar dat bedrijf, ook al is er geen vacature.", ["open"], "Espontânea.", ["v-open-sollicitatie"], choices=["open","vaste","nieuwe"], tr="Vou enviar uma candidatura espontânea, embora não haja vaga."),
    FE(["Een","headhunter","hebben","mij","gebeld."], 2, "heeft", "Singular: heeft.", ["v-headhunter"]),
    LI("Netwerken voelt soms ongemakkelijk, maar het levert veel op.", ["Netwerken voelt soms ongemakkelijk, maar het levert veel op","Netwerken voelt soms ongemakkelijk maar het levert veel op"], "Fazer networking às vezes é desconfortável, mas compensa muito.", "Reflexão.", ["v-netwerken"]),
    WO("Atualiza o teu perfil.", ["Werk","je","profiel","bij"], "Separável.", ["v-linkedin-profiel"]),
  ], diff=4, mins=5)

L(23, "O pitch pessoal", "Een elevator pitch over jezelf.",
  ["Apresentar-se em 30 segundos"],
  vocab=[N("v-elevator-pitch","elevator pitch","apresentação de 30 segundos","de")],
  ex=[("Bereid een elevator pitch van dertig seconden voor.","Prepara uma apresentação de trinta segundos."),("Ik ben een Portugese ingenieur met tien jaar ervaring in waterbeheer.","Sou um engenheiro português com dez anos de experiência em gestão da água.")],
  review=["v-pitch","v-meerwaarde"],
  cefr=C, exs=[
    MA([("elevator pitch","apresentação de 30 s"),("pitch","pitch"),("meerwaarde","mais-valia"),("ervaring","experiência")], "Pitch pessoal.", ["v-elevator-pitch","v-pitch","v-meerwaarde","v-ervaring"]),
    MC("Uma boa elevator pitch pessoal contém…", ["*quem és, o que fazes bem e o que procuras","toda a tua vida|Longo demais.","só o teu nome|Pouco."], "Estrutura.", ["v-elevator-pitch"]),
    TR("pt-nl","Prepara uma apresentação de trinta segundos.", ["Bereid een elevator pitch van dertig seconden voor","Bereid een elevator pitch van 30 seconden voor"], "voorbereiden.", ["v-elevator-pitch"]),
    TR("pt-nl","Procuro uma função em que possa…", ["Ik zoek een functie waarin ik kan","Ik ben op zoek naar een functie waarin ik kan"], "waarin.", ["v-elevator-pitch"]),
    FB("Mijn ___ voor jullie team is mijn internationale ervaring.", ["meerwaarde"], "Mais-valia.", ["v-meerwaarde"], choices=["meerwaarde","pitch","ervaring"], tr="A minha mais-valia para a vossa equipa é a experiência internacional."),
    FE(["Ik","ben","een","ingenieur","met","tien","jaren","ervaring."], 6, "jaar", "Com números: jaar.", ["v-elevator-pitch"]),
    SW("Escreva a sua elevator pitch (3–4 frases): quem é, o que faz bem, o que procura.", ["Ik ben Ana Costa, verpleegkundige uit Porto met acht jaar ervaring op de spoedeisende hulp. Ik blijf rustig onder druk en spreek vier talen. Ik zoek een functie in een Nederlands ziekenhuis waarin ik mijn ervaring kan inzetten en verder kan groeien."], ["Quem","Pontos fortes","Objetivo"], 35, "Pitch.", ["v-elevator-pitch"]),
    LI("Vertel in één minuut wie u bent.", ["Vertel in één minuut wie u bent","Vertel in een minuut wie u bent"], "Diga em um minuto quem é.", "Pedido típico.", ["v-elevator-pitch"]),
  ], diff=4, mins=5)

L(24, "Depois de uma recusa", "Feedback vragen.",
  ["Reagir profissionalmente a uma rejeição"],
  vocab=[X("v-feedback-vragen","om feedback vragen","pedir feedback","verb")],
  ex=[("Helaas bent u niet geselecteerd.","Infelizmente não foi selecionado."),("Mag ik vragen waarom de keuze niet op mij is gevallen?","Posso perguntar porque a escolha não recaiu sobre mim?"),("Ik heb om feedback gevraagd.","Pedi feedback.")],
  review=["v-afwijzing","v-teleurgesteld"],
  cefr=C, exs=[
    MA([("om feedback vragen","pedir feedback"),("afwijzing","rejeição"),("teleurgesteld","desiludido"),("de keuze valt op…","a escolha recai sobre…")], "Rejeição.", ["v-feedback-vragen","v-afwijzing","v-teleurgesteld","v-feedback"]),
    MC("Depois de uma afwijzing, o mais profissional é…", ["*agradecer e pedir feedback","responder zangado|Não.","não responder nunca mais|Fecha portas."], "Atitude.", ["v-feedback-vragen"]),
    TR("pt-nl","Pedi feedback.", ["Ik heb om feedback gevraagd","Ik vroeg om feedback"], "vragen om.", ["v-feedback-vragen"]),
    TR("pt-nl","Porque é que a escolha não recaiu sobre mim?", ["Waarom is de keuze niet op mij gevallen","Waarom viel de keuze niet op mij"], "vallen op.", ["v-afwijzing"]),
    FB("Mag ik ___ feedback vragen?", ["om"], "vragen om.", ["v-feedback-vragen"], choices=["om","naar","voor"], tr="Posso pedir feedback?"),
    FE(["De","keuze","is","niet","aan","mij","gevallen."], 4, "op", "vallen op.", ["v-afwijzing"]),
    SW("Escreva um e-mail curto (3–4 frases) a agradecer após uma rejeição e a pedir feedback.", ["Beste mevrouw De Boer,\n\nDank u voor uw bericht. Natuurlijk ben ik teleurgesteld, maar ik waardeer het gesprek zeer. Zou u mij kort willen laten weten wat ik had kunnen verbeteren? Ik houd uw organisatie graag in de gaten voor toekomstige vacatures.\n\nMet vriendelijke groet,\nRui Costa"], ["Agradecimento","Pedido de feedback","Tom positivo"], 40, "E-mail.", ["v-feedback-vragen"]),
    LI("Elke afwijzing is ook een leerervaring.", ["Elke afwijzing is ook een leerervaring"], "Cada rejeição é também uma experiência de aprendizagem.", "Perspetiva.", ["v-afwijzing"]),
  ], diff=4, mins=5)

L(25, "Falar com os media (1)", "De pers te woord staan.",
  ["Preparar-se para falar com jornalistas"],
  vocab=[X("v-pers-te-woord","de pers te woord staan","falar com a imprensa"), N("v-persbericht","persbericht","comunicado de imprensa","het","persberichten")],
  ex=[("De directeur staat de pers morgen te woord.","O diretor fala amanhã com a imprensa."),("We sturen vanmiddag een persbericht uit.","Enviamos hoje à tarde um comunicado de imprensa.")],
  review=["v-woordvoerder","v-journalist","v-kernboodschap"],
  cefr=C, exs=[
    MA([("de pers te woord staan","falar com a imprensa"),("persbericht","comunicado de imprensa"),("woordvoerder","porta-voz"),("journalist","jornalista")], "Media.", ["v-pers-te-woord","v-persbericht","v-woordvoerder","v-journalist"]),
    AR("persbericht", "comunicado de imprensa", "het", "het bericht.", ["v-persbericht"]),
    TR("pt-nl","O diretor fala com a imprensa.", ["De directeur staat de pers te woord"], "Expressão.", ["v-pers-te-woord"]),
    TR("pt-nl","Enviamos um comunicado de imprensa.", ["We sturen een persbericht uit","Wij sturen een persbericht uit","We versturen een persbericht"], "uitsturen.", ["v-persbericht"]),
    MC("Antes de falar com a imprensa, prepara sobretudo…", ["*a tua mensagem-chave (2–3 frases)","um discurso de 20 minutos|Não.","nada|Não."], "Preparação.", ["v-kernboodschap"]),
    FB("De ___ van de gemeente beantwoordt alle vragen.", ["woordvoerder"], "Porta-voz.", ["v-woordvoerder"], choices=["woordvoerder","journalist","persbericht"], tr="O porta-voz da câmara responde a todas as perguntas."),
    FE(["Het","persbericht","worden","om","15.00","uur","verstuurd."], 2, "wordt", "Singular: wordt.", ["v-persbericht"]),
    LI("Wilt u reageren op de berichtgeving?", ["Wilt u reageren op de berichtgeving","Wilt u reageren op de berichtgeving?"], "Quer reagir às notícias?", "Pergunta de jornalista.", ["v-journalist"]),
  ], diff=4, mins=5)

L(26, "Falar com os media (2)", "Off the record.",
  ["Gerir o que se diz a um jornalista"],
  vocab=[X("v-off-the-record","off the record","em off|confidencialmente"), N("v-quote","quote","citação (na imprensa)","de","quotes")],
  ex=[("Alles wat je zegt, kan als quote in de krant komen.","Tudo o que dizes pode aparecer como citação no jornal."),("Off the record bestaat eigenlijk niet altijd.","O «em off» na verdade nem sempre existe.")],
  review=["v-geen-commentaar","v-citeren"],
  cefr=C, exs=[
    MA([("off the record","em off"),("quote","citação"),("geen commentaar","sem comentários"),("citeren","citar")], "Media.", ["v-off-the-record","v-quote","v-geen-commentaar","v-citeren"]),
    MC("Regra de ouro com jornalistas:", ["*não digas nada que não queiras ver publicado","tudo «off the record» é seguro|Não.","mentir é aceitável|Não."], "Prudência.", ["v-off-the-record"]),
    TR("pt-nl","Posso citá-lo?", ["Mag ik u citeren","Mag ik u citeren?","Mag ik u quoten"], "citeren.", ["v-citeren"]),
    TR("pt-nl","Sem comentários.", ["Geen commentaar","Geen commentaar."], "Expressão.", ["v-geen-commentaar"]),
    FB("Die ___ stond de volgende dag op de voorpagina.", ["quote"], "Citação.", ["v-quote"], choices=["quote","pers","record"], tr="Essa citação estava no dia seguinte na primeira página."),
    MC("«Geen commentaar» pode soar…", ["*evasivo; às vezes melhor: «Daar kan ik op dit moment nog niets over zeggen.»","sempre simpático|Não.","obrigatório|Não."], "Alternativa.", ["v-geen-commentaar"]),
    FE(["Mag","ik","u","citeert?"], 3, "citeren?", "Infinitivo.", ["v-citeren"]),
    LI("Daar kan ik op dit moment nog niets over zeggen.", ["Daar kan ik op dit moment nog niets over zeggen"], "Sobre isso ainda não posso dizer nada neste momento.", "Alternativa elegante.", ["v-geen-commentaar"]),
  ], diff=5, mins=5)

L(27, "Seleção em grupo", "Een groepsopdracht en een rollenspel.",
  ["Participar em provas de grupo e simulações"],
  vocab=[N("v-groepsopdracht","groepsopdracht","tarefa de grupo","de","groepsopdrachten")],
  ex=[("In de tweede ronde krijg je een groepsopdracht.","Na segunda fase tens uma tarefa de grupo."),("In het rollenspel speel je een boze klant.","No jogo de papéis fazes de cliente zangado.")],
  review=["v-rollenspel","v-assessment","v-tweede-ronde"],
  cefr=C, exs=[
    MA([("groepsopdracht","tarefa de grupo"),("rollenspel","jogo de papéis"),("assessment","prova de avaliação"),("tweede ronde","segunda fase")], "Seleção.", ["v-groepsopdracht","v-rollenspel","v-assessment","v-tweede-ronde"]),
    MC("Numa groepsopdracht, os avaliadores observam sobretudo…", ["*como colaboras, ouves e propões","quem fala mais alto|Não.","quem termina primeiro sozinho|Não."], "Critérios.", ["v-groepsopdracht"]),
    TR("pt-nl","Na segunda fase tens uma tarefa de grupo.", ["In de tweede ronde krijg je een groepsopdracht"], "Inversão.", ["v-groepsopdracht"]),
    TR("pt-nl","No jogo de papéis fazes de cliente.", ["In het rollenspel speel je een klant","In het rollenspel ben je de klant"], "rollenspel.", ["v-rollenspel"]),
    FB("Tijdens het ___ wordt ook je rekenvaardigheid getest.", ["assessment"], "Prova.", ["v-assessment"], choices=["assessment","rollenspel","gesprek"], tr="Durante a prova também é testada a tua capacidade de cálculo."),
    FE(["De","groepsopdracht","duren","een","uur."], 2, "duurt", "Singular: duurt.", ["v-groepsopdracht"]),
    LI("Mag ik even samenvatten wat we tot nu toe hebben besloten?", ["Mag ik even samenvatten wat we tot nu toe hebben besloten","Mag ik even samenvatten wat we tot nu toe hebben besloten?"], "Posso resumir o que decidimos até agora?", "Boa frase em grupo.", ["v-groepsopdracht"]),
    WO("Tens uma tarefa de grupo.", ["Je","krijgt","een","groepsopdracht"], "Ordem.", ["v-groepsopdracht"]),
  ], diff=4, mins=5)

L(28, "Aceitar a oferta", "Ik neem het aanbod graag aan.",
  ["Aceitar ou pedir tempo para pensar numa oferta"],
  vocab=[X("v-aanbod-aannemen","een aanbod aannemen","aceitar uma oferta","verb")],
  ex=[("Ik neem het aanbod graag aan.","Aceito a oferta com gosto."),("Mag ik tot vrijdag bedenktijd?","Posso ter até sexta para pensar?")],
  review=["v-aanbod-krijgen","v-bedenktijd","v-ingangsdatum"],
  cefr=C, exs=[
    MA([("een aanbod aannemen","aceitar uma oferta"),("een aanbod krijgen","receber uma oferta"),("bedenktijd","tempo para pensar"),("ingangsdatum","data de início")], "Oferta.", ["v-aanbod-aannemen","v-aanbod-krijgen","v-bedenktijd","v-ingangsdatum"]),
    TR("pt-nl","Aceito a oferta com gosto.", ["Ik neem het aanbod graag aan"], "aannemen.", ["v-aanbod-aannemen"]),
    TR("pt-nl","Posso ter até sexta para pensar?", ["Mag ik tot vrijdag bedenktijd","Mag ik tot vrijdag bedenktijd?","Mag ik er tot vrijdag over nadenken"], "bedenktijd.", ["v-bedenktijd"]),
    MC("Pedir tempo para pensar numa oferta é…", ["*normal e aceitável (com prazo curto)","rude|Não.","proibido|Não."], "Normas.", ["v-bedenktijd"]),
    FB("Ik heb het ___ met beide handen aangenomen.", ["aanbod"], "Oferta.", ["v-aanbod-aannemen"], choices=["aanbod","bedenktijd","contract"], tr="Aceitei a oferta de braços abertos."),
    FE(["Ik","neem","het","aanbod","graag","op."], 5, "aan.", "aannemen.", ["v-aanbod-aannemen"]),
    DL([("Recruiter","We willen u graag aannemen. Wat vindt u ervan?","Gostaríamos de o contratar. O que acha?"),("Jij","","")], ["*Wat fijn! Ik wil het contract nog even rustig lezen; mag ik u donderdag mijn antwoord geven?","Ja, maakt niet uit.|Pouco entusiasmo.","Nee.|Estranho."], "Responder.", ["v-bedenktijd"]),
    LI("Wat is de beoogde ingangsdatum?", ["Wat is de beoogde ingangsdatum","Wat is de beoogde ingangsdatum?"], "Qual é a data de início prevista?", "Pergunta.", ["v-ingangsdatum"]),
  ], diff=4, mins=5)

L(29, "Simulação: uma entrevista B2 completa", "Van kennismaking tot aanbod.",
  ["Preparar e simular uma entrevista completa"],
  vocab=[X("v-sollicitatietraject","sollicitatietraject","processo de recrutamento")],
  ex=[("Het sollicitatietraject duurde zes weken.","O processo de recrutamento durou seis semanas.")],
  review=["v-concreet-voorbeeld","v-initiatief-nemen","v-valkuil","v-omgaan-met-kritiek","v-gat-in-cv","v-doorgroeimogelijkheden","v-bruto-jaarsalaris","v-elevator-pitch"],
  cefr=C, exs=[
    CO("dialogue","Sollicitatiegesprek (fragment)","Interviewer: Vertel eens kort iets over uzelf.\nAna: Ik ben verpleegkundige met acht jaar ervaring op de spoedeisende hulp in Porto.\nInterviewer: Kunt u een concreet voorbeeld geven van een stressvolle situatie?\nAna: Tijdens een grote verkeersramp kwamen er twintig patiënten tegelijk binnen. Ik nam het initiatief om een triageplek in te richten. Uiteindelijk werd iedereen binnen een uur geholpen.\nInterviewer: En wat is uw valkuil?\nAna: Ik wil soms alles zelf doen. Ik heb geleerd om meer te delegeren.\nInterviewer: Heeft u nog vragen?\nAna: Ja: wat zijn de doorgroeimogelijkheden op de afdeling?",
       [("Qual é a profissão da Ana?", ["*Enfermeira","Médica","Gestora"]),("O que fez no exemplo?", ["*Organizou uma zona de triagem","Chamou o chefe","Foi para casa"]),("Qual é a armadilha dela?", ["*Querer fazer tudo sozinha","Ser lenta","Não falar línguas"])],
       "Entrevista simulada.", ["v-sollicitatietraject","v-concreet-voorbeeld","v-valkuil"]),
    MC("No diálogo, a resposta da Ana ao exemplo segue…", ["*o método STAR","nenhuma estrutura|Não.","uma lista|Não."], "Revisão.", ["v-star-methode"]),
    TR("pt-nl","O processo de recrutamento durou seis semanas.", ["Het sollicitatietraject duurde zes weken","Het sollicitatietraject heeft zes weken geduurd"], "sollicitatietraject.", ["v-sollicitatietraject"]),
    FE(["Ik","nam","de","initiatief."], 2, "het", "het initiatief.", ["v-initiatief-nemen"]),
    SW("Prepare por escrito as suas respostas (cerca de 120 palavras no total) a três perguntas: (1) «Vertel iets over uzelf», (2) «Geef een voorbeeld van een succes» (STAR), (3) «Wat is uw valkuil?». Termine com uma pergunta sua ao empregador.", ["1. Ik ben Rui, logistiek medewerker met zes jaar ervaring in Portugal en twee jaar in Rotterdam.\n2. Vorig jaar liepen de leveringen bij ons magazijn steeds vertraging op (S). Ik moest de planning verbeteren (T). Ik nam het initiatief om de routes opnieuw in te delen en een dagelijks kort overleg in te voeren (A). Binnen drie maanden daalde het aantal vertragingen met de helft (R).\n3. Mijn valkuil is dat ik te snel ja zeg. Ik leer nu om eerst mijn agenda te checken.\nMijn vraag: Hoe ziet de inwerkperiode eruit?"], ["Pitch","STAR","Valkuil","Pergunta final"], 100, "Simulação final.", ["v-sollicitatietraject"]),
  ], diff=5, mins=8)

W()
