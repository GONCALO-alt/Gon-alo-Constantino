import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u15")
C = "A2"
# Lições extra (10–15): treino do perfeito — marcadores de tempo, geleden, ooit/nog nooit, hebben ou zijn, separáveis.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "No fim de semana passado", "Afgelopen weekend.",
  ["Usar marcadores de tempo do passado"],
  vocab=[X("v-afgelopen","afgelopen","passado, último (fim de semana, semana)","adjective"), X("v-vorig-jaar","vorig jaar","o ano passado")],
  ex=[("Afgelopen weekend heb ik veel gefietst.","No fim de semana passado andei muito de bicicleta."),("Vorig jaar ben ik naar Nederland verhuisd.","No ano passado mudei-me para os Países Baixos.")],
  review=["v-gisteravond","v-vorige-week","v-gisteren"],
  cefr=C, exs=[
    MA([("afgelopen weekend","o fim de semana passado"),("vorig jaar","o ano passado"),("vorige week","a semana passada"),("gisteravond","ontem à noite")], "Passado.", ["v-afgelopen","v-vorig-jaar","v-vorige-week","v-gisteravond"]),
    MC("«Vorig jaar» vs «vorige week»:", ["*jaar é het → vorig; week é de → vorige","é igual|Muda a terminação.","vorig é futuro|Não."], "Concordância.", ["v-vorig-jaar"]),
    TR("pt-nl","No fim de semana passado trabalhei.", ["Afgelopen weekend heb ik gewerkt(.)","Ik heb afgelopen weekend gewerkt(.)"], "Perfeito.", ["v-afgelopen"]),
    TR("pt-nl","No ano passado mudei-me.", ["Vorig jaar ben ik verhuisd(.)","Ik ben vorig jaar verhuisd(.)"], "verhuizen + zijn.", ["v-vorig-jaar"]),
    FB("Wat heb je ___ weekend gedaan?", ["afgelopen"], "Passado.", ["v-afgelopen"], choices=["afgelopen","vorige","volgend"], tr="O que fizeste no fim de semana passado?"),
    LI("Gisteravond heb ik een film gezien.", ["Gisteravond heb ik een film gezien(.)"], "Ontem à noite vi um filme.", "Ouvir.", ["v-gisteravond","v-gezien"]),
    MC("Qual é a ordem correta?", ["*Vorig jaar heb ik Nederlands geleerd.","Vorig jaar ik heb Nederlands geleerd.|Inversão."], "Inversão.", ["v-vorig-jaar"]),
    WO("Ontem trabalhei.", ["Gisteren","heb","ik","gewerkt."], "Inversão + particípio no fim.", ["v-gisteren"]),
  ], diff=2, mins=4)

L(11, "Há três anos", "Drie jaar geleden.",
  ["Dizer há quanto tempo aconteceu algo"],
  vocab=[X("v-geleden","geleden","há (tempo atrás)","adverb")],
  ex=[("Drie jaar geleden ben ik hier komen wonen.","Há três anos vim morar para cá."),("Ik heb hem lang geleden gezien.","Vi-o há muito tempo.")],
  gram=[G("g-s3u15c-1","Geleden vs sinds","**geleden** = há (ação terminada): *twee jaar **geleden** ben ik verhuisd*. **sinds** = desde/há (ainda dura): *ik woon hier **sinds** twee jaar*. Repara: *geleden* vem **depois** do tempo.")],
  review=["v-sinds","v-gekomen","v-gezien"],
  cefr=C, exs=[
    MC("«Há dois anos mudei-me» =", ["*Twee jaar geleden ben ik verhuisd.","Sinds twee jaar ben ik verhuisd.|Ação acabada: geleden.","Geleden twee jaar ben ik verhuisd.|Ordem: twee jaar geleden."], "geleden.", ["v-geleden"]),
    MC("«Moro aqui há dois anos (ainda moro)» =", ["*Ik woon hier sinds twee jaar.","Ik woon hier twee jaar geleden.|Ainda dura → sinds / al.","Ik heb hier gewoond twee jaar geleden.|Não."], "sinds.", ["v-sinds"]),
    TR("pt-nl","Vi-o há uma semana.", ["Ik heb hem een week geleden gezien(.)","Een week geleden heb ik hem gezien(.)"], "geleden.", ["v-geleden"]),
    TR("pt-nl","Há muito tempo.", ["Lang geleden(.)","Heel lang geleden(.)"], "lang geleden.", ["v-geleden"]),
    FB("Vijf minuten ___ is de trein vertrokken.", ["geleden"], "Há.", ["v-geleden"], choices=["geleden","sinds","later"], tr="O comboio partiu há cinco minutos."),
    LI("Tien jaar geleden woonde ik nog in Coimbra.", ["Tien jaar geleden woonde ik nog in Coimbra(.)"], "Há dez anos ainda morava em Coimbra.", "Ouvir.", ["v-geleden"]),
    MC("Qual é a ordem correta?", ["*Ik heb haar twee weken geleden gezien.","Ik heb haar geleden twee weken gezien.|geleden vem depois do tempo."], "Posição.", ["v-geleden"]),
    WO("Há um ano.", ["Een","jaar","geleden."], "Ordem.", ["v-geleden"]),
  ], diff=2, mins=4)

L(12, "Já alguma vez…?", "Ooit en nog nooit.",
  ["Perguntar sobre experiências"],
  vocab=[X("v-ooit","ooit","alguma vez","adverb"), X("v-nog-nooit","nog nooit","nunca (até agora)","adverb")],
  ex=[("Heb je ooit stamppot gegeten?","Já alguma vez comeste stamppot?"),("Nee, ik ben nog nooit in Groningen geweest.","Não, nunca estive em Groningen.")],
  review=["v-gegeten","v-geweest","v-al"],
  cefr=C, exs=[
    MA([("ooit","alguma vez"),("nog nooit","nunca (até agora)"),("al","já"),("geweest","estado (estar)")], "Experiência.", ["v-ooit","v-nog-nooit","v-al","v-geweest"]),
    TR("pt-nl","Já alguma vez estiveste na Bélgica?", ["Ben je ooit in België geweest?","Ben jij ooit in België geweest?"], "ooit + zijn geweest.", ["v-ooit","v-geweest"]),
    TR("pt-nl","Nunca comi arenque.", ["Ik heb nog nooit haring gegeten(.)"], "nog nooit.", ["v-nog-nooit","v-gegeten"]),
    FB("Heb je ___ in een tent geslapen?", ["ooit"], "Alguma vez.", ["v-ooit"], choices=["ooit","nog nooit","geleden"], tr="Já alguma vez dormiste numa tenda?"),
    DL([("Collega","Ben je ooit in Maastricht geweest?","Já estiveste em Maastricht?"),("Jij","","")], ["*Nee, nog nooit. Is het mooi?","Ja, nog nooit.|Contraditório.","Ik ben ooit.|Não."], "Responder.", ["v-nog-nooit"]),
    LI("Ik heb al twee keer geschaatst.", ["Ik heb al twee keer geschaatst(.)"], "Já patinei duas vezes.", "Ouvir.", ["v-al"]),
    MC("Qual é a ordem correta?", ["*Ik ben nog nooit in Friesland geweest.","Ik ben geweest nog nooit in Friesland.|Particípio no fim."], "Particípio no fim.", ["v-nog-nooit"]),
    WO("Nunca estive lá.", ["Ik","ben","er","nog","nooit","geweest."], "Ordem.", ["v-nog-nooit"]),
  ], diff=2, mins=4)

L(13, "Hebben ou zijn? Treino", "Ik heb gewerkt, ik ben gegaan.",
  ["Escolher o auxiliar certo no perfeito"],
  vocab=[],
  ex=[("Ik heb gewerkt.","Trabalhei."),("Ik ben naar huis gegaan.","Fui para casa."),("Hij is moe geworden.","Ele ficou cansado.")],
  gram=[G("g-s3u15c-2","Zijn com movimento e mudança","A maioria dos verbos usa **hebben**. Usam **zijn**: verbos de **movimento com direção** (*gaan, komen, vertrekken, verhuizen*), de **mudança de estado** (*worden, sterven*), e **zijn, blijven**. *Ik **ben** naar Utrecht gefietst* (direção), mas *Ik **heb** gefietst* (só a atividade).")],
  review=["v-gegaan","v-gekomen","v-geworden","v-gebleven","v-geweest"],
  cefr=C, exs=[
    MC("«Fui para casa» =", ["*Ik ben naar huis gegaan.","Ik heb naar huis gegaan.|Movimento com direção: zijn."], "zijn.", ["v-gegaan"]),
    MC("«Comi uma maçã» =", ["*Ik heb een appel gegeten.","Ik ben een appel gegeten.|eten: hebben."], "hebben.", ["v-gegeten"]),
    MC("«Fiquei em casa» =", ["*Ik ben thuis gebleven.","Ik heb thuis gebleven.|blijven: zijn."], "zijn.", ["v-gebleven"]),
    MC("«Andei de bicicleta (passeio, sem destino)» =", ["*Ik heb gefietst.","Ik ben gefietst.|Sem direção: hebben."], "Sem direção.", ["v-gegaan"]),
    FB("Ze ___ gisteren aangekomen.", ["is"], "aankomen: zijn.", ["v-aangekomen"], choices=["is","heeft","zijn"], tr="Ela chegou ontem."),
    FB("Wij ___ een brief geschreven.", ["hebben"], "schrijven: hebben.", ["v-geschreven"], choices=["hebben","zijn","is"], tr="Escrevemos uma carta."),
    FE(["Hij","heeft","ziek","geworden."], 1, "is", "worden: zijn.", ["v-geworden"]),
    LI("We zijn met de trein naar Gent gegaan.", ["We zijn met de trein naar Gent gegaan(.)","Wij zijn met de trein naar Gent gegaan(.)"], "Fomos de comboio a Gante.", "Ouvir.", ["v-gegaan"]),
  ], diff=3, mins=4)

L(14, "Separáveis no passado", "Ik ben opgestaan, ik heb opgebeld.",
  ["Formar o particípio dos verbos separáveis"],
  vocab=[],
  ex=[("Ik ben om zeven uur opgestaan.","Levantei-me às sete."),("Heb je je moeder opgebeld?","Ligaste à tua mãe?")],
  gram=[G("g-s3u15c-3","Partícula + ge + particípio","Nos separáveis, o **ge-** entra **entre** a partícula e o verbo: *opstaan* → **opgestaan**; *meenemen* → **meegenomen**; *opbellen* → **opgebeld**; *aankomen* → **aangekomen**.")],
  review=["v-opgestaan","v-meegenomen","v-opgebeld","v-aangekomen"],
  cefr=C, exs=[
    MA([("opstaan","opgestaan"),("meenemen","meegenomen"),("opbellen","opgebeld"),("aankomen","aangekomen")], "Particípios.", ["v-opgestaan","v-meegenomen","v-opgebeld","v-aangekomen"]),
    MC("Particípio de «opruimen»:", ["*opgeruimd","geopruimd|ge- entre partícula e verbo.","opruimd|Falta ge-."], "Regra.", ["v-opruimen"]),
    MC("Particípio de «afwassen»:", ["*afgewassen","geafwassen|Não.","afgewast|Não."], "Regra.", ["v-afwassen"]),
    TR("pt-nl","Hoje levantei-me às seis e meia.", ["Vandaag ben ik om half zeven opgestaan(.)","Ik ben vandaag om half zeven opgestaan(.)"], "opgestaan + zijn.", ["v-opgestaan"]),
    TR("pt-nl","Levei o guarda-chuva.", ["Ik heb mijn paraplu meegenomen(.)","Ik heb de paraplu meegenomen(.)"], "meegenomen.", ["v-meegenomen"]),
    FB("Heb je de buurman al ___? (opbellen)", ["opgebeld"], "Particípio.", ["v-opgebeld"], choices=["opgebeld","geopbeld","opbeld"], tr="Já ligaste ao vizinho?"),
    FE(["De","trein","is","om","tien","uur","geaankomen."], 6, "aangekomen.", "ge- entre aan e komen.", ["v-aangekomen"]),
    LI("Ik heb de hele kamer opgeruimd.", ["Ik heb de hele kamer opgeruimd(.)"], "Arrumei o quarto todo.", "Ouvir.", ["v-opruimen"]),
  ], diff=3, mins=4)

L(15, "Prática: contar uma semana", "Wat heb je gedaan?",
  ["Contar no perfeito o que fizeste na semana passada"],
  vocab=[],
  ex=[("(Fictício) Maandag ben ik naar de tandarts gegaan. Woensdag heb ik met Sanne gegeten. Zaterdag zijn we naar het strand gefietst.","Na segunda fui ao dentista…")],
  review=["v-afgelopen","v-geleden","v-ooit","v-nog-nooit","v-gegaan","v-gegeten","v-opgestaan"],
  cefr=C, exs=[
    MC("(Fictício) «Zaterdag zijn we naar het strand gefietst.» Porque é «zijn»?", ["*Movimento com destino (naar het strand)","Porque é sábado|Não.","Erro: devia ser hebben|Está certo."], "Auxiliar.", ["v-gegaan"]),
    MC("(Fictício) «Woensdag heb ik met Sanne gegeten.» O que fez na quarta?", ["*jantou/comeu com a Sanne","foi à praia|Sábado.","foi ao dentista|Segunda."], "Compreensão.", ["v-gegeten"]),
    TR("pt-nl","Na segunda fui ao dentista.", ["Maandag ben ik naar de tandarts gegaan(.)","Op maandag ben ik naar de tandarts gegaan(.)"], "zijn + gegaan.", ["v-gegaan"]),
    TR("pt-nl","Nunca vi este filme.", ["Ik heb deze film nog nooit gezien(.)"], "nog nooit.", ["v-nog-nooit"]),
    LI("Afgelopen vrijdag ben ik vroeg opgestaan.", ["Afgelopen vrijdag ben ik vroeg opgestaan(.)"], "Na sexta passada levantei-me cedo.", "Ouvir.", ["v-afgelopen","v-opgestaan"]),
    BS("Há duas semanas fomos a Gante.", ["Twee","weken","geleden","zijn","we","naar","Gent","gegaan."], ["Twee weken geleden zijn we naar Gent gegaan."], "geleden + inversão.", ["v-geleden"]),
    DL([("Collega","Hoe was je weekend? Wat heb je gedaan?","Como foi o fim de semana? O que fizeste?"),("Jij","","")], ["*Ik heb uitgeslapen en daarna ben ik gaan zwemmen.","Ik doe uitslapen.|Tempo errado.","Volgend weekend.|Não."], "Contar.", ["v-afgelopen"]),
    SW("Escreva 5 frases sobre a sua semana passada (use hebben e zijn).", ["Maandag heb ik gewerkt. Dinsdag ben ik naar de sportschool gegaan. Woensdag heb ik met mijn moeder gebeld. Vrijdag zijn we uit eten gegaan. Zaterdag ben ik thuis gebleven."], ["5 frases","hebben e zijn","Particípios"], 30, "Escrever.", ["v-gegaan"]),
  ], diff=2, mins=5)

W()
