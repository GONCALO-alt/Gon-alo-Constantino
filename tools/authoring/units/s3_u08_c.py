import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u08")
C = "A2"
# Lições extra (10–15): constipação, pomadas e gotas, vitaminas, bula, seguro de saúde.
# Nota: conteúdo informativo geral; não substitui conselho médico.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Para a constipação", "Neusspray en hoestdrank.",
  ["Comprar algo para a constipação na drogaria"],
  vocab=[N("v-neusspray","neusspray","spray nasal","de"), N("v-hoestdrank","hoestdrank","xarope para a tosse","de")],
  ex=[("Bij de drogist koop ik neusspray.","Na drogaria compro spray nasal."),("Neem drie keer per dag een lepel hoestdrank.","Tome uma colher de xarope três vezes por dia.")],
  review=["v-drogist","v-verkouden","v-hoesten"],
  cefr=C, exs=[
    MA([("neusspray","spray nasal"),("hoestdrank","xarope"),("verkouden","constipado"),("drogist","drogaria")], "Constipação.", ["v-neusspray","v-hoestdrank","v-verkouden","v-drogist"]),
    MC("A «drogist» vende…", ["*produtos de higiene e medicamentos simples sem receita","só medicamentos com receita|Isso é a apotheek.","comida fresca|Não."], "Lojas.", ["v-drogist"]),
    TR("pt-nl","Estou constipado.", ["Ik ben verkouden(.)"], "verkouden.", ["v-verkouden"]),
    TR("pt-nl","Tem algo para a tosse?", ["Heeft u iets tegen hoesten?","Heeft u iets voor de hoest?","Hebt u iets tegen hoesten?"], "iets tegen.", ["v-hoestdrank","v-hoesten"]),
    FB("Mijn neus zit dicht; ik koop ___.", ["neusspray"], "Spray.", ["v-neusspray"], choices=["neusspray","hoestdrank","tandpasta"], tr="Tenho o nariz entupido; compro spray nasal."),
    DL([("Drogist","Goedemiddag, zoekt u iets?","Boa tarde, procura alguma coisa?"),("Jij","","")], ["*Ja, ik ben verkouden. Heeft u iets voor mijn neus?","Ik ben drogist.|Não.","Hoestdrank is drank.|Não."], "Pedir.", ["v-verkouden"]),
    LI("Gebruik de neusspray niet langer dan een week.", ["Gebruik de neusspray niet langer dan een week(.)"], "Não use o spray nasal mais de uma semana.", "Indicação comum (lê sempre a bula).", ["v-neusspray"]),
    AR("hoestdrank", "xarope", "de", "de drank.", ["v-hoestdrank"]),
  ], diff=2, mins=4)

L(11, "Pomada e gotas", "Zalf en oogdruppels.",
  ["Perceber como se aplicam pomadas e gotas"],
  vocab=[N("v-zalf","zalf","pomada","de","zalven"), N("v-oogdruppels","oogdruppels","gotas para os olhos","de")],
  ex=[("Smeer de zalf twee keer per dag op de huid.","Aplique a pomada na pele duas vezes por dia."),("Doe 's avonds één druppel in elk oog.","À noite ponha uma gota em cada olho.")],
  review=["v-apotheek","v-innemen","v-dosis"],
  cefr=C, exs=[
    MA([("zalf","pomada"),("oogdruppels","gotas para os olhos"),("innemen","tomar (oral)"),("dosis","dose")], "Aplicar.", ["v-zalf","v-oogdruppels","v-innemen","v-dosis"]),
    MC("Uma pomada…", ["*smeer je op de huid","neem je in met water|Isso é um comprimido.","drink je|Não."], "Aplicação.", ["v-zalf"]),
    TR("pt-nl","Aplique a pomada duas vezes por dia.", ["Smeer de zalf twee keer per dag(.)","Smeer twee keer per dag de zalf(.)"], "smeren.", ["v-zalf"]),
    TR("pt-nl","Uma gota em cada olho.", ["Eén druppel in elk oog(.)","Een druppel in ieder oog(.)"], "druppel.", ["v-oogdruppels"]),
    FB("Deze ___ zijn voor droge ogen.", ["oogdruppels"], "Gotas.", ["v-oogdruppels"], choices=["oogdruppels","zalf","pillen"], tr="Estas gotas são para olhos secos."),
    LI("Niet innemen: alleen voor uitwendig gebruik.", ["Niet innemen(:) alleen voor uitwendig gebruik(.)","Niet innemen alleen voor uitwendig gebruik(.)"], "Não ingerir: só para uso externo.", "Aviso na embalagem.", ["v-innemen"]),
    MC("«Uitwendig gebruik» significa…", ["*uso externo (na pele)","tomar por via oral|É o contrário.","guardar no frio|Não."], "Rótulo.", ["v-zalf"]),
    AR("zalf", "pomada", "de", "de zalf.", ["v-zalf"]),
  ], diff=2, mins=4)

L(12, "Vitaminas", "Vitamine D in de winter.",
  ["Falar de vitaminas e suplementos"],
  vocab=[N("v-vitamine","vitamine","vitamina","de","vitamines")],
  ex=[("In de winter slikken veel mensen vitamine D.","No inverno muitas pessoas tomam vitamina D."),("Fruit zit vol vitamines.","A fruta está cheia de vitaminas.")],
  review=["v-pil","v-winter"],
  cefr=C, exs=[
    MA([("vitamine","vitamina"),("pil","comprimido"),("winter","inverno"),("innemen","tomar")], "Saúde.", ["v-vitamine","v-pil","v-winter","v-innemen"]),
    MC("Porque é que tanta gente toma vitamina D nos Países Baixos?", ["*Há pouco sol no inverno","Porque é obrigatório|Não.","Porque é doce|Não."], "Contexto (aconselha-te com o médico).", ["v-vitamine"]),
    TR("pt-nl","Tomo vitamina D.", ["Ik slik vitamine D(.)","Ik neem vitamine D(.)"], "slikken.", ["v-vitamine"]),
    TR("pt-nl","A fruta tem muitas vitaminas.", ["Fruit heeft veel vitamines(.)","In fruit zitten veel vitamines(.)"], "vitamines.", ["v-vitamine"]),
    FB("Sinaasappels zitten vol ___ C.", ["vitamine"], "Vitamina.", ["v-vitamine"], choices=["vitamine","zalf","pleister"], tr="As laranjas estão cheias de vitamina C."),
    LI("Neem één pil per dag bij het ontbijt.", ["Neem één pil per dag bij het ontbijt(.)","Neem een pil per dag bij het ontbijt(.)"], "Tome um comprimido por dia ao pequeno-almoço.", "Ouvir.", ["v-pil"]),
    DL([("Apotheker","Gebruikt u nog andere medicijnen of vitamines?","Toma outros medicamentos ou vitaminas?"),("Jij","","")], ["*Alleen vitamine D in de winter.","Ik ben vitamine.|Não.","Gezond.|Não responde."], "Informar.", ["v-vitamine"]),
    AR("vitamine", "vitamina", "de", "de vitamine.", ["v-vitamine"]),
  ], diff=2, mins=4)

L(13, "Ler a bula", "De bijsluiter lezen.",
  ["Encontrar a informação importante na bula"],
  vocab=[],
  ex=[("Lees voor gebruik de bijsluiter.","Antes de usar leia a bula."),("Mogelijke bijwerkingen: hoofdpijn en misselijkheid.","Efeitos secundários possíveis: dor de cabeça e náuseas.")],
  review=["v-bijsluiter","v-bijwerking","v-dosis","v-nuchter","v-medicijn"],
  cefr=C, exs=[
    MA([("bijsluiter","bula"),("bijwerking","efeito secundário"),("dosis","dose"),("nuchter","em jejum")], "Bula.", ["v-bijsluiter","v-bijwerking","v-dosis","v-nuchter"]),
    MC("(Bula) «Nuchter innemen» significa…", ["*tomar em jejum (sem comer antes)","tomar com álcool|Nunca.","tomar à noite|Não necessariamente."], "Instrução.", ["v-nuchter"]),
    MC("(Bula) «Maximaal 6 tabletten per dag». Quantos podes tomar?", ["*no máximo seis por dia","pelo menos seis|Não.","seis de cada vez|Não."], "Dose.", ["v-dosis"]),
    TR("pt-nl","Leia a bula.", ["Lees de bijsluiter(.)"], "bijsluiter.", ["v-bijsluiter"]),
    TR("pt-nl","Que efeitos secundários tem?", ["Welke bijwerkingen heeft het?","Wat zijn de bijwerkingen?"], "bijwerking.", ["v-bijwerking"]),
    FB("Bij ___ zoals duizeligheid: stop en bel uw arts.", ["bijwerkingen"], "Efeitos.", ["v-bijwerking"], choices=["bijwerkingen","bijsluiters","doses"], tr="Com efeitos secundários como tonturas: pare e ligue ao médico."),
    LI("Niet gebruiken tijdens de zwangerschap.", ["Niet gebruiken tijdens de zwangerschap(.)"], "Não usar durante a gravidez.", "Aviso típico.", ["v-medicijn"]),
    MC("Se não percebes a bula, a melhor coisa é…", ["*perguntar ao farmacêutico (apotheker)","adivinhar a dose|Perigoso.","tomar o dobro|Nunca."], "Segurança.", ["v-apotheek"]),
  ], diff=2, mins=4)

L(14, "O seguro de saúde", "Zorgverzekering en eigen risico.",
  ["Perceber o básico do seguro de saúde neerlandês"],
  vocab=[],
  ex=[("Een zorgverzekering is verplicht in Nederland.","O seguro de saúde é obrigatório nos Países Baixos."),("Het eigen risico betaal je zelf.","A franquia pagas tu.")],
  gram=[G("g-s3u08c-1","Seguro de saúde","Quem vive e trabalha nos Países Baixos tem de ter um **basisverzekering** (seguro básico). Paga-se uma **premie** mensal. O **eigen risico** é um valor anual que pagas tu antes de o seguro cobrir certos custos; a consulta no médico de família não conta para ele. Os valores mudam todos os anos — confirma no site do governo ou da seguradora.")],
  review=["v-zorgverzekering","v-eigen-risico","v-premie","v-vergoeden","v-verplicht"],
  cefr=C, exs=[
    MA([("zorgverzekering","seguro de saúde"),("eigen risico","franquia"),("premie","prémio mensal"),("vergoeden","reembolsar")], "Seguro.", ["v-zorgverzekering","v-eigen-risico","v-premie","v-vergoeden"]),
    MC("O seguro de saúde básico nos Países Baixos é…", ["*obrigatório","opcional|Não.","grátis para todos|Paga-se um prémio."], "Regra.", ["v-verplicht"]),
    TR("pt-nl","O seguro é obrigatório.", ["De zorgverzekering is verplicht(.)","Een zorgverzekering is verplicht(.)"], "verplicht.", ["v-verplicht"]),
    TR("pt-nl","O seguro reembolsa isto?", ["Vergoedt de verzekering dit?","Wordt dit vergoed?"], "vergoeden.", ["v-vergoeden"]),
    FB("Elke maand betaal ik de ___.", ["premie"], "Prémio.", ["v-premie"], choices=["premie","dosis","pleister"], tr="Todos os meses pago o prémio."),
    LI("Een bezoek aan de huisarts valt niet onder het eigen risico.", ["Een bezoek aan de huisarts valt niet onder het eigen risico(.)"], "Uma consulta no médico de família não conta para a franquia.", "Ouvir.", ["v-eigen-risico"]),
    DL([("Apotheker","Dit medicijn wordt niet vergoed.","Este medicamento não é reembolsado."),("Jij","","")], ["*Hoeveel kost het dan?","Ik ben premie.|Não.","Verplicht.|Não."], "Perguntar.", ["v-vergoeden"]),
    MC("Os valores do eigen risico…", ["*podem mudar todos os anos (confirma na fonte oficial)","nunca mudam|Mudam.","são iguais em todos os países|Não."], "Verificar sempre.", ["v-eigen-risico"]),
  ], diff=2, mins=4)

L(15, "Prática: na farmácia", "Bij de apotheek.",
  ["Levantar um medicamento e fazer as perguntas certas"],
  vocab=[],
  ex=[("(Fictício) Ik kom een medicijn ophalen op naam van Santos. De huisarts heeft het recept gestuurd.","Venho levantar um medicamento em nome de Santos…")],
  review=["v-apotheek","v-recept-med","v-bijsluiter","v-innemen","v-zalf","v-vergoeden"],
  cefr=C, exs=[
    DL([("Apotheker","Goedemiddag, zegt u het maar.","Boa tarde, diga."),("Jij","","")], ["*Ik kom een medicijn ophalen. Het recept is van de huisarts.","Ik ben medicijn.|Não.","Zalf.|Incompleto."], "Levantar.", ["v-recept-med"]),
    DL([("Apotheker","Wat is uw geboortedatum?","Qual é a sua data de nascimento?"),("Jij","","")], ["*Twaalf mei negentienzevenentachtig.","In Portugal.|É o local.","Zeven uur.|Não."], "Identificar-se.", ["v-apotheek"]),
    MC("Pergunta útil ao farmacêutico:", ["*Moet ik het met eten innemen?","Wat is uw lievelingskleur?|Não.","Waar is het VVV?|Não."], "Perguntar.", ["v-innemen"]),
    TR("pt-nl","Quantas vezes por dia tenho de tomar?", ["Hoe vaak per dag moet ik het innemen?","Hoeveel keer per dag moet ik het innemen?"], "innemen.", ["v-innemen"]),
    LI("Neem dit medicijn twee keer per dag, na het eten.", ["Neem dit medicijn twee keer per dag(,) na het eten(.)"], "Tome este medicamento duas vezes por dia, depois de comer.", "Ouvir.", ["v-innemen"]),
    BS("Leia primeiro a bula.", ["Lees","eerst","de","bijsluiter."], ["Lees eerst de bijsluiter."], "Imperativo.", ["v-bijsluiter"]),
    FB("Wordt dit door mijn verzekering ___?", ["vergoed"], "Reembolsado.", ["v-vergoeden"], choices=["vergoed","verplicht","ingenomen"], tr="Isto é reembolsado pelo meu seguro?"),
    SW("Escreva 3 perguntas que faria ao farmacêutico sobre um medicamento novo.", ["Hoe vaak moet ik het innemen?\nMoet ik het met eten innemen?\nWelke bijwerkingen kan ik krijgen?"], ["3 perguntas","Vocabulário da unidade"], 12, "Perguntar.", ["v-innemen","v-bijwerking"]),
  ], diff=2, mins=5)

W()
