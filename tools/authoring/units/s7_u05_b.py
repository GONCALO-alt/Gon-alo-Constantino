import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u05")
C = "B2"
# Lições de aprofundamento (10–29): leitura crítica, fontes e persuasão.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Fontes primárias e secundárias", "Een primaire bron.",
  ["Distinguir fontes primárias e secundárias"],
  vocab=[N("v-primaire-bron","primaire bron","fonte primária","de"), N("v-secundaire-bron","secundaire bron","fonte secundária","de")],
  ex=[("Het originele onderzoek is de primaire bron.","O estudo original é a fonte primária."),("Een krantenartikel over dat onderzoek is een secundaire bron.","Um artigo de jornal sobre esse estudo é uma fonte secundária.")],
  review=["v-afzender","v-bron","v-controleerbaar"],
  cefr=C, exs=[
    MA([("primaire bron","fonte primária"),("secundaire bron","fonte secundária"),("afzender","emissor"),("controleerbaar","verificável")], "Fontes.", ["v-primaire-bron","v-secundaire-bron","v-afzender","v-controleerbaar"]),
    MC("Um diário de uma testemunha da guerra é…", ["*uma fonte primária","uma fonte secundária|Não.","não é fonte|Não."], "Classificar.", ["v-primaire-bron"]),
    MC("Uma Wikipedia sobre a guerra é…", ["*uma fonte secundária (ou terciária)","uma fonte primária|Não.","sempre falsa|Não."], "Classificar.", ["v-secundaire-bron"]),
    TR("pt-nl","O estudo original é a fonte primária.", ["Het originele onderzoek is de primaire bron","Het oorspronkelijke onderzoek is de primaire bron"], "primaire bron.", ["v-primaire-bron"]),
    TR("pt-nl","Verifica sempre a fonte primária.", ["Controleer altijd de primaire bron","Check altijd de primaire bron"], "Imperativo.", ["v-primaire-bron"]),
    FB("Een ___ bron vat het werk van anderen samen.", ["secundaire"], "Secundária.", ["v-secundaire-bron"], choices=["secundaire","primaire","betrouwbare"], tr="Uma fonte secundária resume o trabalho de outros."),
    FE(["Het","primaire","bron","is","een","rapport","uit","2022."], 0, "De", "de bron.", ["v-primaire-bron"]),
    LI("Is deze informatie controleerbaar in een primaire bron?", ["Is deze informatie controleerbaar in een primaire bron","Is deze informatie controleerbaar in een primaire bron?"], "Esta informação é verificável numa fonte primária?", "Pergunta crítica.", ["v-controleerbaar"]),
  ], diff=4, mins=5)

L(11, "Atual ou desatualizado?", "Is de informatie nog actueel?",
  ["Avaliar a atualidade de uma fonte"],
  vocab=[X("v-actueel","actueel","atual","adjective"), N("v-publicatiedatum","publicatiedatum","data de publicação","de")],
  ex=[("Is deze informatie nog actueel?","Esta informação ainda é atual?"),("Kijk altijd naar de publicatiedatum.","Olha sempre para a data de publicação."),("Het rapport is verouderd.","O relatório está desatualizado.")],
  review=["v-verouderd","v-actualiteit"],
  cefr=C, exs=[
    MA([("actueel","atual"),("publicatiedatum","data de publicação"),("verouderd","desatualizado"),("actualiteit","atualidade")], "Tempo.", ["v-actueel","v-publicatiedatum","v-verouderd","v-actualiteit"]),
    MC("«Actueel» em NL significa…", ["*atual, recente","real/efetivo|Falso amigo com «actual» em inglês.","antigo|Não."], "Falso amigo.", ["v-actueel"]),
    TR("pt-nl","Esta informação ainda é atual?", ["Is deze informatie nog actueel","Is deze informatie nog actueel?"], "actueel.", ["v-actueel"]),
    TR("pt-nl","O relatório está desatualizado.", ["Het rapport is verouderd"], "verouderd.", ["v-verouderd"]),
    FB("Kijk eerst naar de ___ van het artikel.", ["publicatiedatum"], "Data.", ["v-publicatiedatum"], choices=["publicatiedatum","actualiteit","afzender"], tr="Olha primeiro para a data de publicação do artigo."),
    FE(["Deze","cijfers","zijn","niet","meer","actuele."], 5, "actueel.", "Predicativo: sem -e.", ["v-actueel"]),
    LI("Cijfers uit 2010 zijn voor dit onderwerp waarschijnlijk verouderd.", ["Cijfers uit 2010 zijn voor dit onderwerp waarschijnlijk verouderd"], "Números de 2010 estão provavelmente desatualizados para este tema.", "Avaliar.", ["v-verouderd"]),
    WO("Ainda é atual?", ["Is","het","nog","actueel?"], "Ordem.", ["v-actueel"]),
  ], diff=4, mins=5)

L(12, "Especialistas e interesses", "Is er sprake van belangenverstrengeling?",
  ["Avaliar a independência de especialistas"],
  vocab=[N("v-deskundige","deskundige","especialista|perito","de","deskundigen"), N("v-belangenverstrengeling","belangenverstrengeling","conflito de interesses","de")],
  ex=[("Volgens deskundigen is het risico klein.","Segundo especialistas, o risco é pequeno."),("De onderzoeker werkt ook voor de fabrikant: dat is belangenverstrengeling.","O investigador também trabalha para o fabricante: isso é conflito de interesses.")],
  review=["v-belang","v-autoriteit","v-belang-hebben-bij"],
  cefr=C, exs=[
    MA([("deskundige","especialista"),("belangenverstrengeling","conflito de interesses"),("belang","interesse"),("autoriteit","autoridade")], "Especialistas.", ["v-deskundige","v-belangenverstrengeling","v-belang","v-autoriteit"]),
    MC("Um médico pago por uma farmacêutica elogia o medicamento dela. Há…", ["*risco de belangenverstrengeling","nenhum problema|Não.","propaganda de Estado|Não."], "Identificar.", ["v-belangenverstrengeling"]),
    TR("pt-nl","Segundo especialistas, o risco é pequeno.", ["Volgens deskundigen is het risico klein","Volgens experts is het risico klein"], "deskundigen.", ["v-deskundige"]),
    TR("pt-nl","Isso é um conflito de interesses.", ["Dat is belangenverstrengeling","Dat is een geval van belangenverstrengeling"], "Termo.", ["v-belangenverstrengeling"]),
    FB("Een ___ op het gebied van klimaat werd geïnterviewd.", ["deskundige"], "Especialista.", ["v-deskundige"], choices=["deskundige","sponsor","afzender"], tr="Foi entrevistado um especialista em clima."),
    FE(["De","deskundigen","is","het","oneens."], 2, "zijn", "Plural: zijn.", ["v-deskundige"]),
    LI("Wie betaalt de deskundige, en heeft die belang bij de uitkomst?", ["Wie betaalt de deskundige, en heeft die belang bij de uitkomst","Wie betaalt de deskundige, en heeft die belang bij de uitkomst?"], "Quem paga ao especialista, e tem ele interesse no resultado?", "Pergunta crítica.", ["v-belang-hebben-bij"]),
    MC("Um especialista numa área fala de outra área. O argumento dele…", ["*perde força (autoridade fora da especialidade)","ganha força|Não.","é sempre válido|Não."], "Autoridade.", ["v-autoriteit"]),
  ], diff=5, mins=5)

L(13, "Transparência e patrocínio", "Wie is de sponsor?",
  ["Detetar conteúdo patrocinado"],
  vocab=[N("v-sponsor","sponsor","patrocinador","de","sponsors"), X("v-transparant","transparant","transparente","adjective")],
  ex=[("Dit artikel is gesponsord door een energiebedrijf.","Este artigo é patrocinado por uma empresa de energia."),("Een goede organisatie is transparant over haar financiering.","Uma boa organização é transparente quanto ao financiamento.")],
  review=["v-reclame","v-opdrachtgever"],
  cefr=C, exs=[
    MA([("sponsor","patrocinador"),("transparant","transparente"),("reclame","publicidade"),("opdrachtgever","cliente|encomendante")], "Patrocínio.", ["v-sponsor","v-transparant","v-reclame","v-opdrachtgever"]),
    MC("Num site vê «In samenwerking met…» por cima de um artigo. Significa provavelmente…", ["*conteúdo patrocinado","notícia independente|Não necessariamente.","erro|Não."], "Detetar.", ["v-sponsor"]),
    TR("pt-nl","O artigo é patrocinado.", ["Het artikel is gesponsord","Dit artikel is gesponsord"], "gesponsord.", ["v-sponsor"]),
    TR("pt-nl","A organização é transparente.", ["De organisatie is transparant"], "transparant.", ["v-transparant"]),
    FB("Wees ___ over wie je onderzoek betaalt.", ["transparant"], "Transparente.", ["v-transparant"], choices=["transparant","gesponsord","verouderd"], tr="Sê transparente sobre quem paga a tua investigação."),
    FE(["De","sponsors","betaalt","het","festival."], 2, "betalen", "Plural: betalen.", ["v-sponsor"]),
    LI("Influencers moeten duidelijk vermelden dat iets reclame is.", ["Influencers moeten duidelijk vermelden dat iets reclame is"], "Os influenciadores têm de indicar claramente que algo é publicidade.", "Regra geral.", ["v-reclame"]),
    WO("É transparente.", ["Het","is","transparant"], "Ordem.", ["v-transparant"]),
  ], diff=4, mins=5)

L(14, "Premissas escondidas", "Een impliciete aanname.",
  ["Identificar premissas implícitas num argumento"],
  vocab=[N("v-premisse","premisse","premissa","de","premissen"), X("v-impliciete-aanname","impliciete aanname","pressuposto implícito")],
  ex=[("«Hij is jong, dus hij kan goed met computers omgaan.» De impliciete aanname: alle jongeren zijn digitaal vaardig.","«É novo, logo sabe lidar com computadores.» O pressuposto implícito: todos os jovens têm competências digitais."),("Als de premisse niet klopt, klopt de conclusie ook niet.","Se a premissa não está certa, a conclusão também não.")],
  review=["v-aanname","v-conclusie-trekken"],
  cefr=C, exs=[
    MA([("premisse","premissa"),("impliciete aanname","pressuposto implícito"),("aanname","pressuposto"),("een conclusie trekken","tirar uma conclusão")], "Lógica.", ["v-premisse","v-impliciete-aanname","v-aanname","v-conclusie-trekken"]),
    MC("«Ze komt uit Portugal, dus ze houdt van voetbal.» A aanname implícita é…", ["*todos os portugueses gostam de futebol","ela vive em Portugal|Não.","futebol é português|Não."], "Identificar.", ["v-impliciete-aanname"]),
    TR("pt-nl","A premissa não está certa.", ["De premisse klopt niet"], "premisse.", ["v-premisse"]),
    TR("pt-nl","É um pressuposto implícito.", ["Het is een impliciete aanname","Dat is een impliciete aanname"], "Expressão.", ["v-impliciete-aanname"]),
    FB("Als de ___ niet klopt, klopt de conclusie ook niet.", ["premisse"], "Premissa.", ["v-premisse"], choices=["premisse","conclusie","bron"], tr="Se a premissa não está certa, a conclusão também não."),
    FE(["Het","premisse","is","onjuist."], 0, "De", "de premisse.", ["v-premisse"]),
    SW("Identifique o pressuposto implícito e diga se concorda (2–3 frases): «Thuiswerkers werken minder hard, dus moeten ze terug naar kantoor.»", ["De impliciete aanname is dat mensen thuis minder hard werken dan op kantoor. Daar ben ik het niet mee eens: dat hangt sterk af van de persoon en het werk."], ["Pressuposto identificado","Posição"], 25, "Analisar.", ["v-impliciete-aanname"]),
    LI("Welke aanname zit er achter deze stelling?", ["Welke aanname zit er achter deze stelling","Welke aanname zit er achter deze stelling?"], "Que pressuposto está por trás desta afirmação?", "Pergunta crítica.", ["v-aanname"]),
  ], diff=5, mins=5)

L(15, "Correlação não é causalidade", "Correlatie of causaliteit?",
  ["Distinguir relação estatística e causa"],
  vocab=[N("v-correlatie","correlatie","correlação","de"), N("v-causaliteit","causaliteit","causalidade","de")],
  ex=[("In de zomer stijgt de ijsverkoop én het aantal verdrinkingen: dat is correlatie, geen causaliteit.","No verão sobem as vendas de gelados e os afogamentos: é correlação, não causalidade."),("De oorzaak is de warmte.","A causa é o calor.")],
  review=["v-oorzaak","v-verband","v-veroorzaken"],
  cefr=C, exs=[
    MA([("correlatie","correlação"),("causaliteit","causalidade"),("oorzaak","causa"),("verband","relação")], "Lógica.", ["v-correlatie","v-causaliteit","v-oorzaak","v-verband"]),
    MC("«Wie veel koffie drinkt, werkt langer. Dus koffie maakt productief.» Problema:", ["*confunde correlação com causalidade","nenhum|Não.","é uma metáfora|Não."], "Identificar.", ["v-causaliteit"]),
    TR("pt-nl","É correlação, não causalidade.", ["Het is correlatie, geen causaliteit","Dat is correlatie en geen causaliteit"], "geen.", ["v-correlatie"]),
    TR("pt-nl","Há uma relação, mas não sabemos a causa.", ["Er is een verband, maar we weten de oorzaak niet","Er is een verband maar we kennen de oorzaak niet"], "verband.", ["v-verband"]),
    FB("Een ___ tussen twee dingen betekent nog niet dat het een het ander veroorzaakt.", ["correlatie"], "Correlação.", ["v-correlatie"], choices=["correlatie","causaliteit","premisse"], tr="Uma correlação entre duas coisas ainda não significa que uma cause a outra."),
    FE(["De","warmte","veroorzaken","beide","stijgingen."], 2, "veroorzaakt", "Singular: veroorzaakt.", ["v-veroorzaken"]),
    LI("Een derde factor kan beide verklaren.", ["Een derde factor kan beide verklaren"], "Um terceiro fator pode explicar ambos.", "Raciocínio.", ["v-oorzaak"]),
    MC("Exemplo clássico de terceiro fator para gelados e afogamentos:", ["*o tempo quente","os gelados causam afogamentos|Não.","as praias fecham|Não."], "Raciocínio.", ["v-causaliteit"]),
  ], diff=5, mins=5)

L(16, "Escolher só o que convém", "Selectief winkelen.",
  ["Reconhecer seleção enviesada de dados e provas anedóticas"],
  vocab=[X("v-selectief-winkelen","selectief winkelen","escolher só o que convém (cherry-picking)"), N("v-anekdotisch-bewijs","anekdotisch bewijs","prova anedótica","het")],
  ex=[("Hij noemt alleen de gunstige cijfers: dat is selectief winkelen.","Ele só refere os números favoráveis: isso é escolher só o que convém."),("«Mijn opa rookte en werd 95» is anekdotisch bewijs.","«O meu avô fumava e chegou aos 95» é prova anedótica.")],
  review=["v-steekproef","v-generalisatie","v-bewijs"],
  cefr=C, exs=[
    MA([("selectief winkelen","escolher o que convém"),("anekdotisch bewijs","prova anedótica"),("steekproef","amostra"),("generalisatie","generalização")], "Enviesamento.", ["v-selectief-winkelen","v-anekdotisch-bewijs","v-steekproef","v-generalisatie"]),
    MC("«Mijn buurvrouw nam dit middel en werd beter, dus het werkt.»", ["*anekdotisch bewijs","peer review|Não.","causaliteit bewezen|Não."], "Identificar.", ["v-anekdotisch-bewijs"]),
    TR("pt-nl","Isso é prova anedótica.", ["Dat is anekdotisch bewijs"], "Termo.", ["v-anekdotisch-bewijs"]),
    TR("pt-nl","Ele só refere os números favoráveis.", ["Hij noemt alleen de gunstige cijfers"], "noemen.", ["v-selectief-winkelen"]),
    FB("Door alleen positieve reviews te tonen, doet het bedrijf aan ___ winkelen.", ["selectief"], "Expressão.", ["v-selectief-winkelen"], choices=["selectief","anekdotisch","primair"], tr="Mostrando só críticas positivas, a empresa escolhe só o que convém."),
    FE(["Het","anekdotische","bewijs","zijn","zwak."], 3, "is", "Singular: is.", ["v-anekdotisch-bewijs"]),
    LI("Eén voorbeeld bewijst nog geen regel.", ["Eén voorbeeld bewijst nog geen regel","Een voorbeeld bewijst nog geen regel"], "Um exemplo ainda não prova uma regra.", "Princípio.", ["v-anekdotisch-bewijs"]),
    WO("É prova anedótica.", ["Het","is","anekdotisch","bewijs"], "Ordem.", ["v-anekdotisch-bewijs"]),
  ], diff=5, mins=5)

L(17, "Viés e visão de túnel", "Vooringenomenheid.",
  ["Reconhecer enviesamentos no próprio raciocínio"],
  vocab=[N("v-vooringenomenheid","vooringenomenheid","parcialidade|enviesamento","de"), N("v-tunnelvisie","tunnelvisie","visão de túnel","de")],
  ex=[("Iedereen heeft een zekere vooringenomenheid.","Toda a gente tem algum enviesamento."),("Door tunnelvisie zag de politie andere verdachten over het hoofd.","Por visão de túnel, a polícia ignorou outros suspeitos.")],
  review=["v-bubbel","v-eenzijdig"],
  cefr=C, exs=[
    MA([("vooringenomenheid","enviesamento"),("tunnelvisie","visão de túnel"),("bubbel","bolha"),("eenzijdig","parcial")], "Viés.", ["v-vooringenomenheid","v-tunnelvisie","v-bubbel","v-eenzijdig"]),
    MC("Procurar só informação que confirma o que já pensa é…", ["*vooringenomenheid (viés de confirmação)","objectiviteit|Não.","peer review|Não."], "Identificar.", ["v-vooringenomenheid"]),
    TR("pt-nl","Toda a gente tem algum enviesamento.", ["Iedereen heeft een zekere vooringenomenheid","Iedereen is een beetje vooringenomen"], "Termo.", ["v-vooringenomenheid"]),
    TR("pt-nl","Foi visão de túnel.", ["Het was tunnelvisie","Dat was tunnelvisie"], "tunnelvisie.", ["v-tunnelvisie"]),
    FB("Door ___ kijk je niet meer naar andere mogelijkheden.", ["tunnelvisie"], "Visão de túnel.", ["v-tunnelvisie"], choices=["tunnelvisie","transparantie","correlatie"], tr="Com visão de túnel já não olhas para outras possibilidades."),
    FE(["Het","tunnelvisie","van","het","team","was","duidelijk."], 0, "De", "de tunnelvisie.", ["v-tunnelvisie"]),
    LI("Lees bewust ook eens een krant waarmee je het niet eens bent.", ["Lees bewust ook eens een krant waarmee je het niet eens bent"], "Lê de propósito também um jornal com o qual não concordas.", "Dica.", ["v-bubbel"]),
    MC("Uma forma de combater a vooringenomenheid é…", ["*procurar ativamente argumentos contrários","ler só fontes que concordam|É o contrário.","não ler nada|Não."], "Estratégia.", ["v-vooringenomenheid"]),
  ], diff=5, mins=5)

L(18, "Palavras carregadas", "Een beladen woord, een eufemisme.",
  ["Reconhecer palavras carregadas e eufemismos"],
  vocab=[X("v-beladen-woord","een beladen woord","uma palavra carregada"), N("v-eufemisme","eufemisme","eufemismo","het","eufemismen")],
  ex=[("«Gelukszoeker» is een beladen woord voor migrant.","«Caçador de fortuna» é uma palavra carregada para migrante."),("«Personeelsoptimalisatie» is een eufemisme voor ontslagen.","«Otimização de pessoal» é um eufemismo para despedimentos.")],
  review=["v-framing","v-toon"],
  cefr=C, exs=[
    MA([("een beladen woord","palavra carregada"),("eufemisme","eufemismo"),("framing","enquadramento"),("toon","tom")], "Linguagem.", ["v-beladen-woord","v-eufemisme","v-framing","v-toon"]),
    MC("«Collateral damage» / «nevenschade» para vítimas civis é…", ["*um eufemismo","um termo neutro|Não.","uma metáfora positiva|Não."], "Identificar.", ["v-eufemisme"]),
    AR("eufemisme", "eufemismo", "het", "-isme → het.", ["v-eufemisme"]),
    TR("pt-nl","É um eufemismo para despedimentos.", ["Het is een eufemisme voor ontslagen","Dat is een eufemisme voor ontslagen"], "voor.", ["v-eufemisme"]),
    TR("pt-nl","É uma palavra carregada.", ["Het is een beladen woord","Dat is een beladen woord"], "beladen.", ["v-beladen-woord"]),
    FB("«Prijsaanpassing» klinkt vriendelijker dan «prijsverhoging»: het is een ___.", ["eufemisme"], "Eufemismo.", ["v-eufemisme"], choices=["eufemisme","framing","beladen woord"], tr="«Ajuste de preço» soa mais simpático do que «aumento de preço»: é um eufemismo."),
    FE(["Dat","is","een","beladene","woord."], 3, "beladen", "Particípio forte terminado em -en: sem -e.", ["v-beladen-woord"]),
    LI("Let op de woordkeuze: die verraadt vaak de mening van de schrijver.", ["Let op de woordkeuze: die verraadt vaak de mening van de schrijver","Let op de woordkeuze, die verraadt vaak de mening van de schrijver"], "Repara na escolha de palavras: muitas vezes revela a opinião do autor.", "Dica.", ["v-framing"]),
  ], diff=5, mins=5)

L(19, "Escolha de palavras e enquadramento", "Woordkeuze en framing.",
  ["Analisar como a escolha de palavras enquadra um tema"],
  vocab=[N("v-woordkeuze","woordkeuze","escolha de palavras","de")],
  ex=[("«Belastingverlaging» of «minder geld voor de zorg»: de woordkeuze bepaalt het frame.","«Descida de impostos» ou «menos dinheiro para a saúde»: a escolha de palavras define o enquadramento."),("Zijn woordkeuze was opvallend negatief.","A escolha de palavras dele foi notoriamente negativa.")],
  review=["v-framing","v-beladen-woord"],
  cefr=C, exs=[
    MA([("woordkeuze","escolha de palavras"),("framing","enquadramento"),("een beladen woord","palavra carregada"),("eufemisme","eufemismo")], "Framing.", ["v-woordkeuze","v-framing","v-beladen-woord","v-eufemisme"]),
    MC("Mesmo facto, outro frame: «Lastenverlichting» (alívio de encargos) vs. «bezuiniging» (corte):", ["*a primeira soa positiva, a segunda negativa","iguais|O tom muda.","ambas negativas|Não."], "Frames.", ["v-framing"]),
    TR("pt-nl","A escolha de palavras define o enquadramento.", ["De woordkeuze bepaalt het frame","De woordkeuze bepaalt de framing"], "bepalen.", ["v-woordkeuze"]),
    TR("pt-nl","Repara na escolha de palavras.", ["Let op de woordkeuze"], "letten op.", ["v-woordkeuze"]),
    FB("Haar ___ was zorgvuldig en neutraal.", ["woordkeuze"], "Escolha de palavras.", ["v-woordkeuze"], choices=["woordkeuze","framing","premisse"], tr="A escolha de palavras dela foi cuidadosa e neutra."),
    FE(["De","woordkeuze","bepalen","hoe","we","denken."], 2, "bepaalt", "Singular: bepaalt.", ["v-woordkeuze"]),
    SW("Escreva duas manchetes sobre o mesmo facto (o preço do bilhete de comboio sobe 5%): uma com frame positivo e outra com frame negativo.", ["Positief: NS investeert in betere treinen; kaartje iets duurder.\nNegatief: Reizigers opnieuw de dupe: treinkaartje 5% duurder."], ["2 manchetes","Frames opostos"], 20, "Framing.", ["v-framing","v-woordkeuze"]),
    LI("Dezelfde feiten kunnen heel anders worden gepresenteerd.", ["Dezelfde feiten kunnen heel anders worden gepresenteerd","Dezelfde feiten kunnen heel anders gepresenteerd worden"], "Os mesmos factos podem ser apresentados de forma muito diferente.", "Princípio.", ["v-framing"]),
  ], diff=5, mins=5)

L(20, "Ethos, pathos, logos", "Overtuigen met karakter, emotie en logica.",
  ["Reconhecer os três modos de persuasão"],
  vocab=[N("v-ethos","ethos","ethos (credibilidade)","het"), N("v-pathos","pathos","pathos (emoção)","het"), N("v-logos","logos","logos (lógica)","de")],
  ex=[("«Als arts met twintig jaar ervaring…» — dat is ethos.","«Como médico com vinte anos de experiência…» — isso é ethos."),("Een foto van een huilend kind speelt in op pathos.","Uma foto de uma criança a chorar apela ao pathos."),("Cijfers en redeneringen horen bij logos.","Números e raciocínios pertencem ao logos.")],
  review=["v-overtuigen","v-inspelen-op"],
  cefr=C, exs=[
    MA([("ethos","credibilidade"),("pathos","emoção"),("logos","lógica"),("overtuigen","convencer")], "Persuasão.", ["v-ethos","v-pathos","v-logos","v-overtuigen"]),
    MC("«Uit onderzoek onder 10.000 mensen blijkt…» apela a…", ["*logos","pathos|Não.","ethos|Não principalmente."], "Classificar.", ["v-logos"]),
    MC("«Denk aan uw kleinkinderen!» apela a…", ["*pathos","logos|Não.","ethos|Não."], "Classificar.", ["v-pathos"]),
    MC("«Ik ben al dertig jaar brandweerman.» apela a…", ["*ethos","pathos|Não.","logos|Não."], "Classificar.", ["v-ethos"]),
    TR("pt-nl","Isso apela à emoção.", ["Dat speelt in op emotie","Dat speelt in op pathos"], "inspelen op.", ["v-inspelen-op"]),
    FB("Een goed betoog combineert ethos, pathos en ___.", ["logos"], "Lógica.", ["v-logos"], choices=["logos","eufemisme","framing"], tr="Um bom texto argumentativo combina ethos, pathos e logos."),
    FE(["De","pathos","van","de","speech","was","sterk."], 0, "Het", "het pathos.", ["v-pathos"]),
    LI("Wie alleen op emotie inspeelt, overtuigt kritische lezers niet.", ["Wie alleen op emotie inspeelt, overtuigt kritische lezers niet","Wie alleen op emotie inspeelt overtuigt kritische lezers niet"], "Quem só apela à emoção não convence leitores críticos.", "Reflexão.", ["v-pathos"]),
  ], diff=5, mins=5)

L(21, "Técnicas de influência", "Schaarste en sociale bewijskracht.",
  ["Reconhecer técnicas de influência em marketing"],
  vocab=[N("v-schaarste","schaarste","escassez","de"), N("v-sociale-bewijskracht","sociale bewijskracht","prova social","de"),
         N("v-wederkerigheid","wederkerigheid","reciprocidade","de")],
  ex=[("«Nog maar twee kamers beschikbaar!» speelt in op schaarste.","«Só restam dois quartos!» apela à escassez."),("«Al 10.000 tevreden klanten» is sociale bewijskracht.","«Já 10.000 clientes satisfeitos» é prova social."),("Een gratis proefje wekt wederkerigheid op.","Uma amostra grátis provoca reciprocidade.")],
  review=["v-reclame","v-te-mooi-om-waar"],
  cefr=C, exs=[
    MA([("schaarste","escassez"),("sociale bewijskracht","prova social"),("wederkerigheid","reciprocidade"),("reclame","publicidade")], "Influência.", ["v-schaarste","v-sociale-bewijskracht","v-wederkerigheid","v-reclame"]),
    MC("«Op = op! Alleen vandaag!» usa…", ["*schaarste","wederkerigheid|Não.","logos|Não."], "Classificar.", ["v-schaarste"]),
    MC("«9 van de 10 tandartsen raden het aan» usa…", ["*sociale bewijskracht / autoriteit","schaarste|Não.","eufemisme|Não."], "Classificar.", ["v-sociale-bewijskracht"]),
    MC("No supermercado dão-te uma prova grátis e sentes que deves comprar:", ["*wederkerigheid","schaarste|Não.","tunnelvisie|Não."], "Classificar.", ["v-wederkerigheid"]),
    TR("pt-nl","Isso apela à escassez.", ["Dat speelt in op schaarste"], "schaarste.", ["v-schaarste"]),
    FB("Reviews van andere klanten zijn een vorm van sociale ___.", ["bewijskracht"], "Prova social.", ["v-sociale-bewijskracht"], choices=["bewijskracht","schaarste","wederkerigheid"], tr="Críticas de outros clientes são uma forma de prova social."),
    FE(["De","schaarste","maken","het","product","aantrekkelijk."], 2, "maakt", "Singular: maakt.", ["v-schaarste"]),
    LI("Laat je niet opjagen door een aftellende klok op een website.", ["Laat je niet opjagen door een aftellende klok op een website"], "Não te deixes pressionar por um relógio em contagem decrescente num site.", "Dica.", ["v-schaarste"]),
  ], diff=5, mins=5)

L(22, "Manipulação e propaganda", "Manipuleren of overtuigen?",
  ["Distinguir persuasão legítima de manipulação"],
  vocab=[X("v-manipuleren","manipuleren","manipular","verb"), N("v-propaganda","propaganda","propaganda","de")],
  ex=[("Overtuigen is eerlijk; manipuleren niet.","Convencer é honesto; manipular não."),("Tijdens de oorlog werd er veel propaganda verspreid.","Durante a guerra foi espalhada muita propaganda.")],
  review=["v-desinformatie","v-misleidend"],
  cefr=C, exs=[
    MA([("manipuleren","manipular"),("propaganda","propaganda"),("desinformatie","desinformação"),("misleidend","enganador")], "Manipulação.", ["v-manipuleren","v-propaganda","v-desinformatie","v-misleidend"]),
    MC("Diferença essencial entre convencer e manipular:", ["*manipular esconde informação ou explora fraquezas","não há diferença|Há.","convencer é sempre mau|Não."], "Ética.", ["v-manipuleren"]),
    TR("pt-nl","Convencer é honesto; manipular não.", ["Overtuigen is eerlijk; manipuleren niet","Overtuigen is eerlijk, manipuleren niet"], "Contraste.", ["v-manipuleren"]),
    TR("pt-nl","Foi espalhada muita propaganda.", ["Er werd veel propaganda verspreid","Er is veel propaganda verspreid"], "Passiva.", ["v-propaganda"]),
    FB("Hij voelde zich ___ door de verkoper.", ["gemanipuleerd"], "Particípio.", ["v-manipuleren"], choices=["gemanipuleerd","manipuleren","gemanipuleert"], tr="Ele sentiu-se manipulado pelo vendedor."),
    FE(["De","propaganda","werden","overal","verspreid."], 2, "werd", "Singular: werd.", ["v-propaganda"]),
    LI("Desinformatie is bewust onjuiste informatie.", ["Desinformatie is bewust onjuiste informatie"], "Desinformação é informação deliberadamente falsa.", "Definição.", ["v-desinformatie"]),
    WO("Não me deixo manipular.", ["Ik","laat","me","niet","manipuleren"], "Ordem.", ["v-manipuleren"]),
  ], diff=5, mins=5)

L(23, "Objetividade", "Is objectiviteit mogelijk?",
  ["Refletir sobre objetividade no jornalismo"],
  vocab=[N("v-objectiviteit","objectiviteit","objetividade","de")],
  ex=[("Volledige objectiviteit bestaat misschien niet.","A objetividade total talvez não exista."),("Een journalist streeft naar objectiviteit.","Um jornalista procura a objetividade.")],
  review=["v-objectief","v-subjectief","v-hoor-en-wederhoor"],
  cefr=C, exs=[
    MA([("objectiviteit","objetividade"),("objectief","objetivo"),("subjectief","subjetivo"),("hoor en wederhoor","ouvir as duas partes")], "Objetividade.", ["v-objectiviteit","v-objectief","v-subjectief","v-hoor-en-wederhoor"]),
    MC("Uma prática que aumenta a objetividade:", ["*hoor en wederhoor e separar factos de opinião","usar adjetivos fortes|Não.","só uma fonte|Não."], "Prática.", ["v-objectiviteit"]),
    TR("pt-nl","A objetividade total talvez não exista.", ["Volledige objectiviteit bestaat misschien niet","Totale objectiviteit bestaat misschien niet"], "objectiviteit.", ["v-objectiviteit"]),
    TR("pt-nl","O jornalista procura a objetividade.", ["De journalist streeft naar objectiviteit"], "streven naar.", ["v-objectiviteit"]),
    FB("Een column is per definitie ___.", ["subjectief"], "Subjetivo.", ["v-subjectief"], choices=["subjectief","objectief","transparant"], tr="Uma crónica é por definição subjetiva."),
    FE(["Het","objectiviteit","van","het","artikel","is","twijfelachtig."], 0, "De", "-iteit → de.", ["v-objectiviteit"]),
    SW("Responda em 3–4 frases: «Kan een journalist echt objectief zijn?»", ["Volgens mij kan een journalist nooit helemaal objectief zijn, want iedereen kiest wat hij belangrijk vindt. Wel kan hij streven naar objectiviteit door feiten te controleren en beide kanten te laten horen. Transparantie over zijn bronnen helpt de lezer ook."], ["Opinião","Nuance","Exemplo de prática"], 35, "Reflexão.", ["v-objectiviteit"]),
    LI("Feiten en meningen moeten duidelijk gescheiden zijn.", ["Feiten en meningen moeten duidelijk gescheiden zijn","Feiten en meningen moeten duidelijk gescheiden worden"], "Factos e opiniões devem estar claramente separados.", "Princípio.", ["v-objectiviteit"]),
  ], diff=5, mins=5)

L(24, "Polémica e direito de resposta", "Een weerwoord schrijven.",
  ["Perceber e participar numa polémica pública"],
  vocab=[N("v-polemiek","polemiek","polémica","de"), N("v-weerwoord","weerwoord","resposta|réplica","het")],
  ex=[("Het artikel leidde tot een felle polemiek.","O artigo levou a uma polémica acesa."),("De minister kreeg de kans op een weerwoord.","O ministro teve oportunidade de resposta.")],
  review=["v-repliek","v-ingezonden-brief"],
  cefr=C, exs=[
    MA([("polemiek","polémica"),("weerwoord","resposta"),("repliek","réplica"),("ingezonden brief","carta do leitor")], "Polémica.", ["v-polemiek","v-weerwoord","v-repliek","v-ingezonden-brief"]),
    AR("weerwoord", "resposta", "het", "het woord.", ["v-weerwoord"]),
    TR("pt-nl","O artigo levou a uma polémica.", ["Het artikel leidde tot een polemiek","Het artikel leidde tot een felle polemiek"], "leiden tot.", ["v-polemiek"]),
    TR("pt-nl","Teve oportunidade de resposta.", ["Hij kreeg de kans op een weerwoord","Hij kreeg de gelegenheid voor een weerwoord"], "weerwoord.", ["v-weerwoord"]),
    FB("De krant gaf de bekritiseerde wethouder ruimte voor een ___.", ["weerwoord"], "Resposta.", ["v-weerwoord"], choices=["weerwoord","polemiek","eufemisme"], tr="O jornal deu espaço de resposta ao vereador criticado."),
    FE(["De","weerwoord","verscheen","een","dag","later."], 0, "Het", "het weerwoord.", ["v-weerwoord"]),
    LI("Een gezonde polemiek kan het debat verdiepen.", ["Een gezonde polemiek kan het debat verdiepen"], "Uma polémica saudável pode aprofundar o debate.", "Reflexão.", ["v-polemiek"]),
    MC("Num weerwoord eficaz, deve-se…", ["*responder aos argumentos, não à pessoa","atacar o autor|Falácia ad hominem.","mudar de assunto|Não."], "Ética.", ["v-weerwoord","v-op-de-persoon"]),
  ], diff=5, mins=5)

L(25, "Generalizações", "Een veralgemening.",
  ["Detetar e corrigir generalizações"],
  vocab=[N("v-veralgemening","veralgemening","generalização","de","veralgemeningen")],
  ex=[("«Alle politici liegen» is een veralgemening.","«Todos os políticos mentem» é uma generalização."),("Gebruik liever «veel» of «sommige» in plaats van «alle».","Usa antes «muitos» ou «alguns» em vez de «todos».")],
  review=["v-generalisatie","v-kort-door-de-bocht","v-nuanceren"],
  cefr=C, exs=[
    MA([("veralgemening","generalização"),("generalisatie","generalização (sinónimo)"),("kort door de bocht","simplista"),("nuanceren","matizar")], "Generalizar.", ["v-veralgemening","v-generalisatie","v-kort-door-de-bocht","v-nuanceren"]),
    MC("Versão matizada de «Nederlanders zijn direct»:", ["*Veel Nederlanders communiceren vrij direct.","Alle Nederlanders zijn direct.|Generaliza.","Geen enkele Nederlander is direct.|Generaliza."], "Matizar.", ["v-nuanceren"]),
    TR("pt-nl","É uma generalização.", ["Het is een veralgemening","Dat is een veralgemening","Dat is een generalisatie"], "veralgemening.", ["v-veralgemening"]),
    TR("pt-nl","Usa «alguns» em vez de «todos».", ["Gebruik «sommige» in plaats van «alle»","Gebruik sommige in plaats van alle"], "in plaats van.", ["v-veralgemening"]),
    FB("Woorden als «altijd» en «nooit» wijzen vaak op een ___.", ["veralgemening"], "Generalização.", ["v-veralgemening"], choices=["veralgemening","premisse","correlatie"], tr="Palavras como «sempre» e «nunca» indicam muitas vezes uma generalização."),
    FE(["Dat","zijn","een","gevaarlijke","veralgemening."], 1, "is", "Singular: is.", ["v-veralgemening"]),
    SW("Reescreva de forma matizada: «Jongeren lezen geen boeken meer en zitten alleen op hun telefoon.»", ["Veel jongeren lezen minder boeken dan vroeger en brengen veel tijd door op hun telefoon, al zijn er ook jongeren die juist veel lezen, soms digitaal."], ["Sem «geen/alleen» absolutos","Nuance"], 20, "Matizar.", ["v-veralgemening","v-nuanceren"]),
    LI("Niet alle, maar wel veel mensen herkennen dit.", ["Niet alle, maar wel veel mensen herkennen dit","Niet alle maar wel veel mensen herkennen dit"], "Nem todos, mas muitas pessoas reconhecem isto.", "Formulação matizada.", ["v-nuanceren"]),
  ], diff=4, mins=5)

L(26, "Analisar um artigo de opinião", "Het hoofdargument.",
  ["Identificar tese, argumento principal e pontos fracos"],
  vocab=[N("v-hoofdargument","hoofdargument","argumento principal","het","hoofdargumenten")],
  ex=[("Wat is het hoofdargument van de schrijver?","Qual é o argumento principal do autor?"),("Het hoofdargument is zwak onderbouwd.","O argumento principal está mal fundamentado.")],
  review=["v-standpunt-auteur","v-onderbouwd","v-zwak-argument"],
  cefr=C, exs=[
    MA([("hoofdargument","argumento principal"),("de auteur vindt dat…","o autor acha que…"),("onderbouwd","fundamentado"),("zwak argument","argumento fraco")], "Análise.", ["v-hoofdargument","v-standpunt-auteur","v-onderbouwd","v-zwak-argument"]),
    CO("text","Opiniestuk (fragment, fictief)","Elke stad zou op zondag autovrij moeten zijn. Ten eerste wordt de lucht schoner. Ten tweede is het gezelliger: overal spelen kinderen op straat. Iedereen die tegen is, denkt alleen aan zijn eigen gemak. Kortom: de autovrije zondag is de toekomst.",
       [("Tese?", ["*As cidades deviam estar sem carros ao domingo","Os carros são baratos","As crianças devem ficar em casa"]),("Qual é a falácia?", ["*Atacar os opositores («só pensam no seu conforto»)","Nenhuma","Uma estatística falsa"]),("O que falta?", ["*Fontes/dados e contra-argumentos","Uma conclusão","Um título"])],
       "Analisar.", ["v-hoofdargument","v-zwak-argument"]),
    TR("pt-nl","Qual é o argumento principal?", ["Wat is het hoofdargument","Wat is het hoofdargument?"], "hoofdargument.", ["v-hoofdargument"]),
    TR("pt-nl","O argumento está mal fundamentado.", ["Het argument is zwak onderbouwd","Het argument is slecht onderbouwd"], "onderbouwd.", ["v-onderbouwd"]),
    AR("hoofdargument", "argumento principal", "het", "het argument.", ["v-hoofdargument"]),
    FB("Het ___ van de schrijver is dat de lucht schoner wordt.", ["hoofdargument"], "Argumento principal.", ["v-hoofdargument"], choices=["hoofdargument","premisse","weerwoord"], tr="O argumento principal do autor é que o ar fica mais limpo."),
    FE(["De","hoofdargument","is","zwak."], 0, "Het", "het hoofdargument.", ["v-hoofdargument"]),
    MC("No texto, «Iedereen die tegen is, denkt alleen aan zijn eigen gemak» é…", ["*uma generalização e um ataque às pessoas","um argumento lógico|Não.","uma fonte|Não."], "Falácia.", ["v-veralgemening","v-op-de-persoon"]),
  ], diff=5, mins=6)

L(27, "Escrever uma reação crítica (1)", "Wat ik mis in het artikel…",
  ["Estruturar uma reação crítica a um texto"],
  vocab=[X("v-wat-ik-mis","wat ik mis in het artikel, is…","o que me falta no artigo é…"), X("v-genuanceerd","genuanceerd","matizado","adjective")],
  ex=[("Wat ik mis in het artikel, is de mening van de bewoners zelf.","O que me falta no artigo é a opinião dos próprios moradores."),("Een genuanceerde reactie wordt serieuzer genomen.","Uma reação matizada é levada mais a sério.")],
  review=["v-reageren-artikel","v-ten-onrechte","v-voorbijgaan-aan"],
  cefr=C, exs=[
    MA([("wat ik mis in het artikel, is…","o que me falta é…"),("genuanceerd","matizado"),("ten onrechte","erradamente"),("voorbijgaan aan","ignorar|passar ao lado de")], "Reação.", ["v-wat-ik-mis","v-genuanceerd","v-ten-onrechte","v-voorbijgaan-aan"]),
    TR("pt-nl","O que me falta no artigo é a opinião dos moradores.", ["Wat ik mis in het artikel, is de mening van de bewoners","Wat ik in het artikel mis, is de mening van de bewoners"], "Construção com wat.", ["v-wat-ik-mis"]),
    TR("pt-nl","O autor ignora este problema.", ["De auteur gaat voorbij aan dit probleem","De schrijver gaat aan dit probleem voorbij"], "voorbijgaan aan.", ["v-voorbijgaan-aan"]),
    MC("Uma reação crítica eficaz começa por…", ["*referir o artigo e resumir a tese","insultar o autor|Não.","falar de outro tema|Não."], "Estrutura.", ["v-reageren-artikel"]),
    FB("De schrijver stelt ten ___ dat niemand de bus gebruikt.", ["onrechte"], "Erradamente.", ["v-ten-onrechte"], choices=["onrechte","rechte","slotte"], tr="O autor afirma erradamente que ninguém usa o autocarro."),
    FE(["Een","genuanceerde","reactie","worden","serieuzer","genomen."], 3, "wordt", "Singular: wordt.", ["v-genuanceerd"]),
    LI("De auteur gaat volledig voorbij aan de kosten.", ["De auteur gaat volledig voorbij aan de kosten"], "O autor ignora completamente os custos.", "Crítica.", ["v-voorbijgaan-aan"]),
    WO("Uma reação matizada.", ["Een","genuanceerde","reactie"], "Ordem.", ["v-genuanceerd"]),
  ], diff=5, mins=5)

L(28, "Escrever uma reação crítica (2)", "Kritisch maar respectvol.",
  ["Manter um tom crítico e respeitoso"],
  vocab=[X("v-respectvol","respectvol","respeitoso","adjective")],
  ex=[("Je kunt kritisch en tegelijk respectvol zijn.","Podes ser crítico e ao mesmo tempo respeitoso."),("Ik waardeer het artikel, maar op één punt ben ik het oneens.","Aprecio o artigo, mas num ponto discordo.")],
  review=["v-genuanceerd","v-weliswaar","v-op-de-persoon"],
  cefr=C, exs=[
    MA([("respectvol","respeitoso"),("genuanceerd","matizado"),("weliswaar … maar","é certo que … mas"),("op de persoon spelen","atacar a pessoa")], "Tom.", ["v-respectvol","v-genuanceerd","v-weliswaar","v-op-de-persoon"]),
    MC("Qual frase é crítica MAS respeitosa?", ["*De auteur maakt een interessant punt, maar vergeet de gevolgen voor ouderen.","De auteur snapt er niks van.|Ofensivo.","Wat een dom stuk.|Ofensivo."], "Tom.", ["v-respectvol"]),
    TR("pt-nl","Podes ser crítico e respeitoso.", ["Je kunt kritisch en respectvol zijn","Je kunt kritisch en tegelijk respectvol zijn"], "respectvol.", ["v-respectvol"]),
    TR("pt-nl","Aprecio o artigo, mas num ponto discordo.", ["Ik waardeer het artikel, maar op één punt ben ik het oneens","Ik waardeer het artikel maar op een punt ben ik het oneens"], "Estrutura.", ["v-respectvol"]),
    FB("Speel niet op de ___, maar op de bal.", ["persoon"], "Expressão.", ["v-op-de-persoon"], choices=["persoon","auteur","argument"], tr="Não ataques a pessoa, mas o argumento."),
    FE(["Zijn","reactie","was","respectvolle."], 3, "respectvol.", "Predicativo: sem -e.", ["v-respectvol"]),
    SW("Escreva o parágrafo central (4–5 frases) de uma reação crítica ao artigo da lição 26 (domingos sem carros): reconheça um ponto, critique outro com argumento e mantenha o respeito.", ["De schrijver heeft weliswaar gelijk dat de lucht op een autovrije zondag schoner is. Toch gaat hij voorbij aan mensen die afhankelijk zijn van de auto, zoals ouderen en mensen met een beperking. Bovendien noemt hij tegenstanders ten onrechte egoïstisch. Een genuanceerder voorstel zou zijn: autovrij, maar met uitzonderingen en goed openbaar vervoer."], ["Concessão","Crítica fundamentada","Tom respeitoso"], 50, "Reação.", ["v-respectvol","v-genuanceerd"]),
    LI("Ik begrijp het standpunt, maar ik zie het anders.", ["Ik begrijp het standpunt, maar ik zie het anders","Ik begrijp het standpunt maar ik zie het anders"], "Compreendo a posição, mas vejo de outra forma.", "Fórmula.", ["v-ik-zie-het-anders"]),
  ], diff=5, mins=6)

L(29, "Prática: leitor crítico", "Kritisch lezen van A tot Z.",
  ["Aplicar todas as ferramentas de leitura crítica a um texto"],
  vocab=[X("v-kritische-lezer","een kritische lezer","um leitor crítico")],
  ex=[("Een kritische lezer stelt vragen bij elke bron.","Um leitor crítico questiona cada fonte.")],
  review=["v-primaire-bron","v-belangenverstrengeling","v-correlatie","v-anekdotisch-bewijs","v-eufemisme","v-pathos","v-schaarste","v-veralgemening","v-hoofdargument"],
  cefr=C, exs=[
    CO("text","Advertorial (fictief)","Nieuw superfood verlaagt stress met 40%! Al 50.000 Nederlanders gingen u voor. Professor Jansen (adviseur van het merk) zegt: «Ik heb nog nooit zoiets gezien.» Mijn buurvrouw slaapt sinds ze het neemt veel beter. Wie stress heeft en dit niet probeert, laat zijn gezin in de steek. Nog maar 100 potten op voorraad!",
       [("Que tipo de texto é?", ["*Publicidade disfarçada","Notícia independente","Estudo científico"]),("Problema com o professor?", ["*Conflito de interesses","É estrangeiro","Não é citado"]),("«Nog maar 100 potten» usa…", ["*Escassez","Logos","Ethos"])],
       "Aplicar todas as ferramentas.", ["v-kritische-lezer","v-belangenverstrengeling","v-schaarste"]),
    MC("«Mijn buurvrouw slaapt beter» é…", ["*anekdotisch bewijs","primaire bron|Não.","peer review|Não."], "Revisão.", ["v-anekdotisch-bewijs"]),
    MC("«Wie dit niet probeert, laat zijn gezin in de steek» apela a…", ["*pathos (culpa)","logos|Não.","objectiviteit|Não."], "Revisão.", ["v-pathos"]),
    MC("«Al 50.000 Nederlanders gingen u voor» é…", ["*sociale bewijskracht","correlatie|Não.","eufemisme|Não."], "Revisão.", ["v-sociale-bewijskracht"]),
    TR("pt-nl","Um leitor crítico questiona cada fonte.", ["Een kritische lezer stelt vragen bij elke bron","Een kritische lezer stelt vragen bij iedere bron"], "vragen stellen bij.", ["v-kritische-lezer"]),
    SW("Escreva uma análise curta (cerca de 80 palavras) do anúncio acima: identifique pelo menos quatro técnicas ou problemas e diga se confia no produto.", ["Dit is geen nieuws maar een advertorial. De claim «40% minder stress» heeft geen primaire bron. De professor is adviseur van het merk, dus er is sprake van belangenverstrengeling. Het verhaal over de buurvrouw is anekdotisch bewijs. «50.000 Nederlanders» speelt in op sociale bewijskracht, en «nog maar 100 potten» op schaarste. De zin over het gezin speelt op schuldgevoel. Ik vertrouw dit product niet."], ["4+ técnicas","Conclusão"], 70, "Análise final.", ["v-kritische-lezer"]),
  ], diff=5, mins=8)

W()
