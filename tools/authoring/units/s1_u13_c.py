import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u13")
C = "A1"
# Lições extra (11–16): mais perguntas — com quem, qual, porquê, quanto — e uma entrevista.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def Q(c, w, e, refs): return MC("Qual é a ordem correta?", ["*"+c, w+"|"+e], e, refs)

L(11, "Com quem?", "Met wie woon je?",
  ["Perguntar com quem alguém faz algo"],
  vocab=[X("v-met-wie","met wie?","com quem?")],
  ex=[("Met wie woon je? — Met mijn vriendin.","Com quem moras? — Com a minha namorada."),("Met wie ga je naar Gent?","Com quem vais a Gent?")],
  review=["v-met","v-wie"],
  cefr=C, exs=[
    MA([("met wie?","com quem?"),("wie?","quem?"),("met","com"),("hoe?","como?")], "Perguntas.", ["v-met-wie","v-wie","v-met","v-hoe"]),
    TR("pt-nl","Com quem moras?", ["Met wie woon je?","Met wie woon jij?"], "met wie + verbo + sujeito.", ["v-met-wie"]),
    TR("pt-nl","Quem é aquele homem?", ["Wie is die man?"], "wie.", ["v-wie"]),
    Q("Met wie ga je naar huis?", "Met wie je gaat naar huis?", "Palavra interrogativa + verbo + sujeito.", ["v-met-wie"]),
    FB("___ wie werk je? — Met Sanne.", ["Met"], "Com quem.", ["v-met-wie"], choices=["Met","Wie","Naar"], tr="Com quem trabalhas? — Com a Sanne."),
    DL([("Collega","Met wie woon je?","Com quem moras?"),("Jij","","")], ["*Met mijn partner en mijn zoon.","In Utrecht.|Isso responde a «onde».","Om acht uur.|Isso responde a «quando»."], "Responder à pergunta certa.", ["v-met-wie"]),
    LI("Met wie spreek ik?", ["Met wie spreek ik(?)"], "Com quem estou a falar?", "Ao telefone.", ["v-met-wie"]),
    WO("Com quem trabalhas?", ["Met","wie","werk","je?"], "Ordem.", ["v-met-wie"]),
  ], diff=2, mins=4)

L(12, "Quanto e quantos?", "Hoeveel kinderen heb je?",
  ["Perguntar quantidades e preços"],
  vocab=[],
  ex=[("Hoeveel kinderen heb je?","Quantos filhos tens?"),("Hoeveel kost de koffie?","Quanto custa o café?")],
  review=["v-hoeveel","v-veel","v-weinig","v-kosten"],
  cefr=C, exs=[
    MC("«Quanto custa?»", ["*Hoeveel kost het?","Hoe kost het?|Falta «veel».","Wat kost veel?|Não."], "hoeveel.", ["v-hoeveel"]),
    TR("pt-nl","Quantos irmãos tens?", ["Hoeveel broers heb je?","Hoeveel broers en zussen heb je?","Hoeveel broers heb jij?"], "hoeveel + plural.", ["v-hoeveel"]),
    TR("pt-nl","Tenho pouco tempo.", ["Ik heb weinig tijd(.)"], "weinig.", ["v-weinig","v-tijd"]),
    TR("pt-nl","Ela trabalha muito.", ["Ze werkt veel(.)","Zij werkt veel(.)"], "veel.", ["v-veel"]),
    FB("___ talen spreek je? — Drie.", ["Hoeveel"], "Quantas.", ["v-hoeveel"], choices=["Hoeveel","Welk","Wie"], tr="Quantas línguas falas? — Três."),
    Q("Hoeveel kost de fiets?", "Hoeveel de fiets kost?", "Pergunta: verbo depois da palavra interrogativa.", ["v-hoeveel"]),
    LI("Hoeveel kost een kopje koffie?", ["Hoeveel kost een kopje koffie(?)"], "Quanto custa uma chávena de café?", "Ouvir.", ["v-hoeveel"]),
    DL([("Verkoper","Hoeveel appels wilt u?","Quantas maçãs quer?"),("Jij","","")], ["*Vier, alstublieft.","Ja, graag.|Pergunta é «quantas».","Hij is groot.|Não."], "Responder com número.", ["v-hoeveel"]),
  ], diff=2, mins=4)

L(13, "Qual? Welk ou welke?", "Welk boek? Welke tas?",
  ["Escolher entre welk e welke"],
  vocab=[X("v-welke","welke","qual / quais (com palavras de e plural)","determiner")],
  ex=[("Welke tas is van jou?","Qual mala é tua?"),("Welk boek lees je?","Que livro lês?")],
  gram=[G("g-s1u13c-1","Welk / welke","**welk** + palavra **het** no singular: *welk boek*. **welke** + palavra **de** ou plural: *welke tas, welke boeken*. É a mesma lógica de *dit/deze*.")],
  review=["v-welk","v-deze","v-dit-is"],
  cefr=C, exs=[
    MC("«___ huis?» (que casa)", ["*Welk","Welke|«huis» é het.","Wie|Isso é «quem»."], "het → welk.", ["v-welk"]),
    MC("«___ fiets?» (que bicicleta)", ["*Welke","Welk|«fiets» é de.","Wat|Não."], "de → welke.", ["v-welke"]),
    MC("«___ boeken?» (que livros)", ["*Welke","Welk|Plural → welke.","Hoeveel|Isso é «quantos»."], "Plural → welke.", ["v-welke"]),
    TR("pt-nl","Qual mala é tua?", ["Welke tas is van jou?"], "welke tas.", ["v-welke","v-tas"]),
    TR("pt-nl","Que livro lês?", ["Welk boek lees je?","Welk boek lees jij?"], "welk boek.", ["v-welk","v-boek"]),
    FE(["Welk","taal","spreek","je?"], 0, "Welke", "de taal → welke.", ["v-welke","v-taal"]),
    FB("___ dag werk je? (que dia)", ["Welke"], "de dag.", ["v-welke"], choices=["Welke","Welk","Wie"], tr="Que dia trabalhas?"),
    LI("Welke trein gaat naar Utrecht?", ["Welke trein gaat naar Utrecht(?)"], "Que comboio vai para Utrecht?", "Ouvir.", ["v-welke","v-trein"]),
  ], diff=2, mins=4)

L(14, "Porquê? Porque…", "Waarom? Want… / Waarom niet?",
  ["Perguntar e dar razões simples"],
  vocab=[X("v-waarom-niet","waarom niet?","porque não?")],
  ex=[("Waarom leer je Nederlands? — Want ik woon hier.","Porque aprendes neerlandês? — Porque moro cá."),("Zullen we gaan? — Ja, waarom niet?","Vamos? — Sim, porque não?")],
  review=["v-waarom","v-want","v-misschien","v-natuurlijk"],
  cefr=C, exs=[
    MA([("waarom?","porquê?"),("waarom niet?","porque não?"),("misschien","talvez"),("natuurlijk","claro")], "Razões.", ["v-waarom","v-waarom-niet","v-misschien","v-natuurlijk"]),
    TR("pt-nl","Porque aprendes neerlandês?", ["Waarom leer je Nederlands?","Waarom leer jij Nederlands?"], "waarom + verbo + sujeito.", ["v-waarom","v-leren"]),
    TR("pt-nl","Porque não?", ["Waarom niet?","Waarom niet"], "Expressão.", ["v-waarom-niet"]),
    DL([("Vriendin","Je ziet er moe uit. Waarom?","Pareces cansado. Porquê?"),("Jij","","")], ["*Want ik werk veel.","Ja, natuurlijk.|Não dá razão.","Met mijn vriend.|Responde a «com quem»."], "Dar uma razão.", ["v-want"]),
    DL([("Collega","Koffie drinken?","Beber um café?"),("Jij","","")], ["*Ja, waarom niet?","Waarom?|Soa desconfiado.","Nee, natuurlijk niet!|Rude."], "Aceitar.", ["v-waarom-niet"]),
    FB("Misschien ga ik morgen. — ___ niet vandaag?", ["Waarom"], "Porquê.", ["v-waarom"], choices=["Waarom","Wanneer","Wie"], tr="Talvez vá amanhã. — Porque não hoje?"),
    LI("Waarom woon je in Nederland?", ["Waarom woon je in Nederland(?)","Waarom woon jij in Nederland(?)"], "Porque moras nos Países Baixos?", "Ouvir.", ["v-waarom"]),
    WO("Porque estás aqui?", ["Waarom","ben","je","hier?"], "Ordem.", ["v-waarom"]),
  ], diff=2, mins=4)

L(15, "Quando e a que horas?", "Wanneer? Hoe laat?",
  ["Perguntar quando e a que horas acontece algo"],
  vocab=[],
  ex=[("Wanneer werk je? — Op maandag.","Quando trabalhas? — À segunda."),("Hoe laat begint de les? — Om negen uur.","A que horas começa a aula? — Às nove.")],
  review=["v-wanneer","v-hoe-laat","v-om","v-uur","v-tijd"],
  cefr=C, exs=[
    MC("«Wanneer?» pergunta…", ["*quando (dia, momento)","a que horas exatas|Isso é «hoe laat».","onde|Isso é «waar»."], "wanneer.", ["v-wanneer"]),
    MC("Resposta a «Hoe laat is het?»:", ["*Het is drie uur.","Op maandag.|Responde a «wanneer».","Met mijn moeder.|Não."], "hoe laat.", ["v-hoe-laat"]),
    TR("pt-nl","A que horas começas?", ["Hoe laat begin je?","Hoe laat begin jij?"], "hoe laat.", ["v-hoe-laat"]),
    TR("pt-nl","Quando vens?", ["Wanneer kom je?","Wanneer kom jij?"], "wanneer.", ["v-wanneer","v-komen"]),
    FB("___ is het? — Het is acht uur.", ["Hoe laat"], "Horas.", ["v-hoe-laat"], choices=["Hoe laat","Wanneer","Waarom"], tr="Que horas são? — São oito."),
    Q("Hoe laat eet je?", "Hoe laat je eet?", "Verbo antes do sujeito.", ["v-hoe-laat"]),
    LI("Hoe laat gaat de trein?", ["Hoe laat gaat de trein(?)"], "A que horas parte o comboio?", "Ouvir.", ["v-hoe-laat"]),
    DL([("Vriend","Wanneer heb je tijd?","Quando tens tempo?"),("Jij","","")], ["*Morgen, om vier uur.","Ja, veel.|Não diz quando.","Waarom?|Não responde."], "Responder.", ["v-wanneer","v-tijd"]),
  ], diff=2, mins=4)

L(16, "Prática: entrevista a um colega", "Een interview.",
  ["Fazer uma entrevista curta com perguntas variadas"],
  vocab=[],
  ex=[("Hoe heet je? Waar woon je? Met wie? Wat doe je graag?","Como te chamas? Onde moras? Com quem? O que gostas de fazer?")],
  review=["v-wie","v-waar","v-wanneer","v-waarom","v-hoeveel","v-welke","v-met-wie","v-hoe"],
  cefr=C, exs=[
    MA([("waar?","onde?"),("wanneer?","quando?"),("waarom?","porquê?"),("hoeveel?","quanto(s)?")], "Interrogativas.", ["v-waar","v-wanneer","v-waarom","v-hoeveel"]),
    MC("Queres saber a idade. Perguntas:", ["*Hoe oud ben je?","Hoeveel ben je?|Não.","Wanneer ben je?|Não."], "Idade.", ["v-hoe-oud"]),
    MC("Queres saber a língua materna:", ["*Welke taal spreek je thuis?","Welk taal spreek je thuis?|taal é de → welke.","Wie spreek je thuis?|Não."], "welke.", ["v-welke"]),
    TR("pt-nl","Onde trabalhas?", ["Waar werk je?","Waar werk jij?"], "waar.", ["v-waar"]),
    TR("pt-nl","O que gostas de fazer?", ["Wat doe je graag?","Wat doe jij graag?"], "graag.", ["v-wat","v-graag"]),
    LI("Hoeveel uur werk je per week?", ["Hoeveel uur werk je per week(?)"], "Quantas horas trabalhas por semana?", "Ouvir.", ["v-hoeveel"]),
    DL([("Interviewer","Waarom woon je in Rotterdam?","Porque moras em Roterdão?"),("Jij","","")], ["*Want mijn werk is daar.","In Rotterdam.|Repete.","Met mijn kat.|Responde a «com quem»."], "Responder.", ["v-want"]),
    SW("Escreva 4 perguntas para conhecer um colega novo (use 4 palavras interrogativas diferentes).", ["Hoe heet je?\nWaar kom je vandaan?\nMet wie woon je?\nWat doe je graag?"], ["4 perguntas","Verbo antes do sujeito"], 12, "Escrever.", ["v-wie","v-waar"]),
  ], diff=2, mins=5)

W()
