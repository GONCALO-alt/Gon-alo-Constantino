import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u11")
C = "A1-A2"
# Lições extra (10–15): aprender na escola de línguas — níveis, erros, notas, trabalho de grupo.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Praticar todos os dias", "Oefenen, oefenen, oefenen.",
  ["Falar de como estudas"],
  vocab=[],
  ex=[("Ik oefen elke dag tien minuten.","Pratico dez minutos todos os dias."),("Ik leer de woorden met een app.","Aprendo as palavras com uma app.")],
  review=["v-oefenen","v-leren","v-studeren","v-woordenboek","v-huiswerk"],
  cefr=C, exs=[
    MA([("oefenen","praticar"),("leren","aprender"),("studeren","estudar (curso)"),("huiswerk","trabalho de casa")], "Estudar.", ["v-oefenen","v-leren","v-studeren","v-huiswerk"]),
    MC("«Ik studeer geneeskunde» significa…", ["*Estudo medicina (na universidade).","Aprendo a palavra «medicina».|Isso seria leren.","Pratico medicina.|Não."], "studeren.", ["v-studeren"]),
    TR("pt-nl","Pratico todos os dias com uma app.", ["Ik oefen elke dag met een app(.)","Elke dag oefen ik met een app(.)"], "oefenen.", ["v-oefenen"]),
    TR("pt-nl","Aprendo neerlandês.", ["Ik leer Nederlands(.)"], "leren.", ["v-leren"]),
    CJ("oefenen","hij","Hij ___ met een app.", ["oefent"], "hij oefent.", ["v-oefenen"]),
    FB("Mijn ___ is af. Ik heb alles gedaan.", ["huiswerk"], "Trabalho de casa.", ["v-huiswerk"], choices=["huiswerk","woordenboek","examen"], tr="O meu trabalho de casa está feito."),
    LI("Ik zoek het woord op in het woordenboek.", ["Ik zoek het woord op in het woordenboek(.)"], "Procuro a palavra no dicionário.", "Ouvir.", ["v-woordenboek"]),
    WO("Praticamos juntos.", ["Wij","oefenen","samen."], "Ordem.", ["v-oefenen"]),
  ], diff=2, mins=4)

L(11, "Na escola de línguas", "Ik ben beginner.",
  ["Dizer o teu nível e inscrever-te num curso"],
  vocab=[N("v-beginner","beginner","principiante","de","beginners"), X("v-gevorderd","gevorderd","avançado","adjective")],
  ex=[("Ik ben beginner, maar ik leer snel.","Sou principiante, mas aprendo depressa."),("Is er ook een cursus voor gevorderden?","Também há um curso para avançados?")],
  review=["v-les","v-klas","v-snel"],
  cefr=C, exs=[
    MA([("beginner","principiante"),("gevorderd","avançado"),("les","aula"),("klas","turma")], "Níveis.", ["v-beginner","v-gevorderd","v-les","v-klas"]),
    TR("pt-nl","Sou principiante.", ["Ik ben beginner(.)","Ik ben een beginner(.)"], "beginner.", ["v-beginner"]),
    TR("pt-nl","A aula é às segundas.", ["De les is op maandag(.)","Op maandag is de les(.)"], "les.", ["v-les"]),
    FB("Na een jaar ben ik niet meer beginner, maar ___.", ["gevorderd"], "Avançado.", ["v-gevorderd"], choices=["gevorderd","beginner","klas"], tr="Depois de um ano já não sou principiante, mas avançado."),
    DL([("Taalschool","Welk niveau heeft u?","Que nível tem?"),("Jij","","")], ["*Ik ben beginner. Ik spreek een beetje Nederlands.","Ik ben klas.|Não.","Op maandag.|Não responde."], "Nível.", ["v-beginner"]),
    LI("Er zijn twaalf studenten in mijn klas.", ["Er zijn twaalf studenten in mijn klas(.)","Er zijn 12 studenten in mijn klas(.)"], "Há doze alunos na minha turma.", "Ouvir.", ["v-klas"]),
    MC("Uma «les» neerlandesa é…", ["*uma aula","um livro|Não.","um exame|Isso é examen/toets."], "Vocabulário.", ["v-les"]),
    WO("Sou principiante.", ["Ik","ben","beginner."], "Ordem.", ["v-beginner"]),
  ], diff=2, mins=4)

L(12, "Errar faz parte", "Fouten maken mag!",
  ["Falar de erros e de melhorar"],
  vocab=[X("v-fouten-maken","fouten maken","dar erros")],
  ex=[("Fouten maken mag; zo leer je.","Pode-se errar; é assim que se aprende."),("Mijn uitspraak wordt steeds beter.","A minha pronúncia está cada vez melhor.")],
  review=["v-fout","v-beter","v-uitspraak","v-oefening"],
  cefr=C, exs=[
    MA([("fout","erro"),("fouten maken","dar erros"),("beter","melhor"),("uitspraak","pronúncia")], "Aprender.", ["v-fout","v-fouten-maken","v-beter","v-uitspraak"]),
    MC("«Fouten maken mag» significa…", ["*É permitido errar.","É proibido errar.|Não.","Faz o exercício.|Não."], "Atitude.", ["v-fouten-maken"]),
    TR("pt-nl","Dou muitos erros.", ["Ik maak veel fouten(.)"], "fouten maken.", ["v-fouten-maken"]),
    TR("pt-nl","A minha pronúncia está melhor.", ["Mijn uitspraak is beter(.)","Mijn uitspraak wordt beter(.)"], "beter.", ["v-uitspraak","v-beter"]),
    FB("In deze oefening zitten drie ___.", ["fouten"], "Plural de fout.", ["v-fout","v-oefening"], choices=["fouten","fout","foutes"], tr="Neste exercício há três erros."),
    DL([("Docent","Geen probleem, dat is een normale fout.","Não há problema, é um erro normal."),("Jij","","")], ["*Dank u. Ik oefen het nog een keer.","Ik ben fout.|Não.","Fouten zijn verboden.|Não."], "Reagir.", ["v-oefenen"]),
    LI("Je Nederlands wordt elke week beter!", ["Je Nederlands wordt elke week beter(!)"], "O teu neerlandês melhora todas as semanas!", "Ouvir.", ["v-beter"]),
    WO("Pode-se errar.", ["Fouten","maken","mag."], "Ordem.", ["v-fouten-maken"]),
  ], diff=2, mins=4)

L(13, "Testes e notas", "Ik heb een zeven!",
  ["Falar de testes e das notas neerlandesas"],
  vocab=[],
  ex=[("Ik heb een zeven voor mijn toets!","Tive sete no teste!"),("Ben je geslaagd? — Ja!","Passaste? — Sim!")],
  review=["v-toets","v-examen","v-cijfer","v-slagen"],
  cefr=C, exs=[
    MC("Nos Países Baixos, as notas vão de…", ["*1 a 10, e um 6 é suficiente","0 a 20, e 10 é suficiente|Isso é Portugal.","A a F|Não."], "Sistema.", ["v-cijfer"]),
    MC("«Een acht» numa escala neerlandesa é…", ["*muito bom","negativa|Não.","o mínimo|O mínimo positivo é 6."], "Interpretar.", ["v-cijfer"]),
    TR("pt-nl","Tive sete no teste.", ["Ik heb een zeven voor mijn toets(.)","Ik heb een zeven voor de toets(.)","Ik had een zeven voor de toets(.)"], "een zeven.", ["v-toets","v-cijfer"]),
    TR("pt-nl","Passei no exame!", ["Ik ben geslaagd voor het examen(!)","Ik ben geslaagd(!)"], "slagen (com zijn).", ["v-slagen","v-examen"]),
    FB("Morgen heb ik een ___ Nederlands.", ["toets"], "Teste.", ["v-toets"], choices=["toets","cijfer","les"], tr="Amanhã tenho um teste de neerlandês."),
    LI("Welk cijfer heb je?", ["Welk cijfer heb je(?)","Welk cijfer heb jij(?)"], "Que nota tiveste?", "Ouvir.", ["v-cijfer"]),
    DL([("Vriendin","Ik ben geslaagd!","Passei!"),("Jij","","")], ["*Gefeliciteerd! Wat knap!","Jammer!|Não.","Welk examen ben ik?|Não."], "Dar os parabéns.", ["v-gefeliciteerd"]),
    WO("Tive um oito.", ["Ik","heb","een","acht."], "Ordem.", ["v-cijfer"]),
  ], diff=2, mins=4)

L(14, "Trabalhar em grupo", "Samenwerken in de les.",
  ["Combinar tarefas com colegas de turma"],
  vocab=[],
  ex=[("We werken in groepjes van drie.","Trabalhamos em grupinhos de três."),("Jij leest de vragen voor en ik schrijf de antwoorden op.","Tu lês as perguntas em voz alta e eu escrevo as respostas.")],
  review=["v-samenwerken","v-vraag","v-antwoord","v-pagina"],
  cefr=C, exs=[
    MA([("samenwerken","trabalhar em conjunto"),("vraag","pergunta"),("antwoord","resposta"),("pagina","página")], "Em grupo.", ["v-samenwerken","v-vraag","v-antwoord","v-pagina"]),
    TR("pt-nl","Trabalhamos juntos.", ["We werken samen(.)","Wij werken samen(.)"], "Separável.", ["v-samenwerken"]),
    TR("pt-nl","Qual é a resposta?", ["Wat is het antwoord?","Wat is het antwoord"], "antwoord.", ["v-antwoord"]),
    FB("Lees de tekst op ___ zeven.", ["pagina"], "Página.", ["v-pagina"], choices=["pagina","vraag","klas"], tr="Lê o texto na página sete."),
    DL([("Klasgenoot","Wie schrijft de antwoorden op?","Quem escreve as respostas?"),("Jij","","")], ["*Ik doe het wel, en jij leest de vragen.","Ik ben antwoord.|Não.","Pagina twaalf.|Não responde."], "Dividir tarefas.", ["v-samenwerken"]),
    LI("Ik heb een vraag over oefening vier.", ["Ik heb een vraag over oefening vier(.)","Ik heb een vraag over oefening 4(.)"], "Tenho uma pergunta sobre o exercício quatro.", "Ouvir.", ["v-vraag","v-oefening"]),
    MC("Qual é a ordem correta?", ["*We werken vandaag samen.","We samenwerken vandaag.|Separável: «samen» vai para o fim."], "Separável.", ["v-samenwerken"]),
    WO("Tenho uma pergunta.", ["Ik","heb","een","vraag."], "Ordem.", ["v-vraag"]),
  ], diff=2, mins=4)

L(15, "Prática: a minha aula de neerlandês", "Mijn taalles.",
  ["Descrever a tua experiência no curso"],
  vocab=[],
  ex=[("(Fictício) Ik zit op de taalschool, in een klas met tien studenten. We hebben twee keer per week les.","Ando numa escola de línguas…")],
  review=["v-les","v-klas","v-beginner","v-oefenen","v-fouten-maken","v-toets","v-samenwerken"],
  cefr=C, exs=[
    MC("(Fictício) «We hebben twee keer per week les.» Quantas aulas por semana?", ["*duas","uma|Não.","dez|É o número de alunos."], "Compreensão.", ["v-les"]),
    MC("(Fictício) «Volgende week hebben we een toets.» O que há na próxima semana?", ["*um teste","férias|Não.","uma festa|Não."], "Compreensão.", ["v-toets"]),
    TR("pt-nl","Tenho aula três vezes por semana.", ["Ik heb drie keer per week les(.)"], "keer per week.", ["v-les"]),
    TR("pt-nl","Na turma há doze alunos.", ["In de klas zitten twaalf studenten(.)","Er zijn twaalf studenten in de klas(.)"], "klas.", ["v-klas"]),
    LI("De docent legt alles heel duidelijk uit.", ["De docent legt alles heel duidelijk uit(.)"], "A professora explica tudo muito claramente.", "Ouvir.", ["v-docent"]),
    BS("Pratico com uma app e dou poucos erros.", ["Ik","oefen","met","een","app","en","ik","maak","weinig","fouten."], ["Ik oefen met een app en ik maak weinig fouten."], "Duas frases.", ["v-oefenen","v-fouten-maken"]),
    DL([("Nieuwe student","Is de cursus moeilijk?","O curso é difícil?"),("Jij","","")], ["*Soms, maar de docent helpt veel.","Ik ben cursus.|Não.","Een zeven.|Não responde."], "Responder.", ["v-docent"]),
    SW("Descreva o seu curso de neerlandês em 4 frases (quando, turma, como pratica, como vai).", ["Ik heb op dinsdag en donderdag les. In mijn klas zitten acht studenten. Ik oefen elke dag met een app. Mijn uitspraak wordt beter."], ["Horário","Turma","Prática","Progresso"], 20, "Escrever.", ["v-les","v-oefenen"]),
  ], diff=2, mins=5)

W()
