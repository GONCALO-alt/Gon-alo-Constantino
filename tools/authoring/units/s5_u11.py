import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u11")
C = "B1"

L(1, "Exprimir desacordo com calma", "Ik snap je punt, maar… Ik zie dat anders.",
  ["Exprimir desacordo sem escalar o conflito"],
  vocab=[V("v-snappen","snappen","perceber (coloquial)","verb"), V("v-ruzie","ruzie","discussão|zanga","noun","de",note="ruzie hebben/maken"),
         V("v-irritatie","irritatie","irritação","noun","de"), V("v-rustig-blijven","rustig blijven","manter a calma","expression")],
  ex=[("Ik snap je punt, maar ik zie het anders.","Percebo o teu ponto, mas vejo de outra forma."),("Ze hebben ruzie over geld.","Estão zangados por causa de dinheiro."),("Laten we rustig blijven.","Vamos manter a calma."),("Ik merk wat irritatie.","Noto alguma irritação.")],
  gram=[G("g-ik-boodschap","Mensagens na primeira pessoa","Num conflito, fale de **si** em vez de acusar: *Ik merk dat ik me erger als…* (noto que me irrito quando…) em vez de *Jij doet altijd…*. Evite **altijd** e **nooit**: generalizam e aumentam a tensão.",
    [("Ik voel me niet gehoord.","Não me sinto ouvido."),("Ik zou graag willen dat we samen een oplossing zoeken.","Gostava que procurássemos juntos uma solução.")])],
  review=["v-ik-zie-het-anders","v-oneens","v-zich-ergeren"],
  cefr=C, exs=[
    MA([("snappen","perceber"),("ruzie","zanga"),("irritatie","irritação"),("rustig blijven","manter a calma")], "Conflito.", ["v-snappen","v-ruzie","v-irritatie","v-rustig-blijven"]),
    TR("pt-nl","Percebo o teu ponto, mas vejo de outra forma.", ["Ik snap je punt(,) maar ik zie het anders","Ik begrijp je punt(,) maar ik zie het anders"], "snappen.", ["v-snappen"]),
    TR("pt-nl","Vamos manter a calma.", ["Laten we rustig blijven"], "Laten we.", ["v-rustig-blijven"]),
    TR("nl-pt","Ze hebben ruzie over geld.", ["Estão zangados por causa de dinheiro","Estão a discutir por causa de dinheiro","Discutem por causa de dinheiro"], "ruzie over.", ["v-ruzie"]),
    MC("Qual frase acalma o conflito?", ["*Ik voel me niet gehoord als je me onderbreekt.","Jij luistert nooit!|Generaliza e acusa.","Je bent altijd zo!|Generaliza."], "Ik-boodschap.", ["v-rustig-blijven"]),
    AR("ruzie","a zanga","de", "De ruzie.", ["v-ruzie"]),
    FE(["Ze","maken","ruzie","van","het","huishouden."], 3, "over", "ruzie over.", ["v-ruzie"]),
    LI("Ik merk dat ik me erger als je te laat komt.", ["Ik merk dat ik me erger als je te laat komt"], "Noto que me irrito quando chegas atrasado.", "Ik-boodschap.", ["v-zich-ergeren"]),
    FB("Ik ___ wat je bedoelt.", ["snap","begrijp"], "Perceber.", ["v-snappen"], choices=["snap","snapt","snappen"], tr="Percebo o que queres dizer."),
    WO("Não me sinto ouvido.", ["Ik","voel","me","niet","gehoord"], "zich voelen.", ["v-zich-voelen"]),
  ], diff=4, mins=6)

L(2, "Ouvir o outro lado", "Als ik je goed begrijp… Wat heb je nodig?",
  ["Mostrar compreensão e reformular o ponto de vista do outro"],
  vocab=[V("v-begrip","begrip","compreensão","noun","het",note="Ik heb er begrip voor."), V("v-standpunt-ander","jouw kant","o teu lado (da história)","expression"),
         V("v-nodig-hebben","nodig hebben","precisar de","expression")],
  ex=[("Ik heb begrip voor je situatie.","Compreendo a tua situação."),("Vertel eens jouw kant van het verhaal.","Conta lá o teu lado da história."),("Wat heb je van mij nodig?","De que precisas da minha parte?"),("Als ik het even samenvat…","Se eu resumir…")],
  review=["v-samenvatten","v-begrijpen","v-andere-woorden","v-luisteren"],
  cefr=C, exs=[
    MA([("begrip","compreensão"),("jouw kant","o teu lado"),("nodig hebben","precisar de"),("samenvatten","resumir")], "Ouvir.", ["v-begrip","v-standpunt-ander","v-nodig-hebben","v-samenvatten"]),
    TR("pt-nl","Compreendo a tua situação.", ["Ik heb begrip voor je situatie","Ik heb begrip voor jouw situatie","Ik begrijp je situatie"], "begrip hebben voor.", ["v-begrip"]),
    TR("pt-nl","De que precisas da minha parte?", ["Wat heb je van mij nodig","Wat heb jij van mij nodig"], "nodig hebben.", ["v-nodig-hebben"]),
    TR("nl-pt","Vertel eens jouw kant van het verhaal.", ["Conta lá o teu lado da história","Conta-me a tua versão da história"], "jouw kant.", ["v-standpunt-ander"]),
    AR("begrip","a compreensão","het", "Het begrip.", ["v-begrip"]),
    FE(["Ik","heb","begrip","van","je","situatie."], 3, "voor", "begrip hebben voor.", ["v-begrip"]),
    WO("Se percebo bem, estás cansado do barulho.", ["Als","ik","je","goed","begrijp,","ben","je","het","lawaai","zat"], "Verbo, verbo; zat zijn = estar farto.", ["v-begrijpen"]),
    LI("Als ik het even samenvat: je wilt meer rust.", ["Als ik het even samenvat(:) je wilt meer rust","Als ik het even samenvat(,) je wilt meer rust"], "Se eu resumir: queres mais sossego.", "samenvatten.", ["v-samenvatten"]),
    MC("Reformular o ponto do outro serve para…", ["*mostrar que ouviu e evitar mal-entendidos","ganhar a discussão|Não é o objetivo.","mudar de assunto|Não."], "Escuta ativa.", ["v-samenvatten"]),
    DL([("Huisgenoot","Ik vind dat ik altijd alles moet schoonmaken.","Acho que sou sempre eu a limpar tudo."),("Pedro","")], ["*Als ik je goed begrijp, wil je dat we de taken beter verdelen?","Dat is niet mijn probleem.|Fecha o diálogo.","Jij bent altijd moe.|Contra-ataque."], "Reformular.", ["v-samenvatten"]),
  ], diff=4, mins=6)

L(3, "Negociar uma solução", "Wat als we… afspreken? Zullen we het zo doen?",
  ["Propor e aceitar compromissos"],
  vocab=[V("v-akkoord","akkoord","de acordo|combinado","adjective"),
         V("v-afwisselen","afwisselen","alternar","verb"), V("v-eerlijk-verdelen","eerlijk verdelen","dividir de forma justa","expression")],
  ex=[("Ik stel voor dat we het afwisselen.","Proponho que alternemos."),("Akkoord!","Combinado!"),("Laten we de taken eerlijk verdelen.","Vamos dividir as tarefas de forma justa."),("Zullen we het zo doen?","Fazemos assim?")],
  review=["v-voorstellen-idee","v-compromis","v-wat-als","v-afspraak-maken-over"],
  cefr=C, exs=[
    MA([("voorstellen","propor"),("akkoord","combinado"),("afwisselen","alternar"),("eerlijk verdelen","dividir de forma justa")], "Negociar.", ["v-voorstellen-idee","v-akkoord","v-afwisselen","v-eerlijk-verdelen"]),
    WO("Proponho que alternemos.", ["Ik","stel","voor","dat","we","het","afwisselen"], "dat + verbo no fim.", ["v-voorstellen-idee"]),
    TR("pt-nl","Vamos dividir as tarefas de forma justa.", ["Laten we de taken eerlijk verdelen"], "eerlijk verdelen.", ["v-eerlijk-verdelen"]),
    TR("pt-nl","Fazemos assim?", ["Zullen we het zo doen","Doen we het zo"], "Proposta.", []),
    TR("nl-pt","Akkoord!", ["Combinado","De acordo","Está combinado"], "akkoord.", ["v-akkoord"]),
    FE(["Ik","voorstel","dat","we","morgen","praten."], 1, "stel … voor", "Separável: Ik stel voor dat…", ["v-voorstellen-idee"]),
    CO("dialogue","Huisgenoten", "Sara: Ik ergerde me eraan dat de keuken altijd vies is.\nTom: Ik snap het. Ik heb het druk met mijn studie.\nSara: Dat begrijp ik. Wat als we een schema maken?\nTom: Goed idee. Ik stel voor dat we elke week afwisselen.\nSara: Akkoord. En de badkamer doen we samen op zondag.\nTom: Prima, zo doen we het.",
       [("Qual era o problema?", ["*A cozinha estava sempre suja","O barulho","A renda"]),("Qual é a solução?", ["*Alternar todas as semanas e a casa de banho juntos ao domingo","O Tom limpa sempre","Contratar alguém"])],
       "schema = horário/plano.", ["v-voorstellen-idee","v-akkoord","v-afwisselen"]),
    LI("Ik ga akkoord met je voorstel.", ["Ik ga akkoord met je voorstel","Ik ga akkoord met jouw voorstel"], "Concordo com a tua proposta.", "akkoord gaan met.", ["v-akkoord","v-voorstel"]),
    FB("Ik ga ___ met dit plan.", ["akkoord"], "akkoord gaan met.", ["v-akkoord"], choices=["akkoord","voorstel","afwisselen"], tr="Concordo com este plano."),
    SW("Proponha uma solução para dois colegas que querem férias na mesma semana (2–3 frases).", ["Ik stel voor dat jullie het afwisselen: dit jaar neemt Anna die week, volgend jaar Bas. Zo verdelen we het eerlijk."], ["**Ik stel voor dat** + verbo no fim", "Ideia de alternar ou dividir", "Conclusão (**zo… / akkoord?**)"], 20, "Propor compromisso.", ["v-voorstellen-idee","v-eerlijk-verdelen"]),
  ], diff=4, mins=7)

L(4, "Pedir desculpa e fazer as pazes", "Het spijt me echt. Ik had dat niet moeten zeggen.",
  ["Pedir desculpa a sério e aceitar desculpas"],
  vocab=[V("v-excuses-aanbieden","excuses aanbieden","apresentar desculpas","expression"), V("v-vergeven","vergeven","perdoar","verb",note="vergeven (particípio igual)"),
         V("v-goedmaken","goedmaken","compensar|reparar","verb",note="Hoe kan ik het goedmaken?"), V("v-zand-erover","zand erover","esquecer o assunto","expression")],
  ex=[("Het spijt me echt, ik had dat niet moeten zeggen.","Peço mesmo desculpa, não devia ter dito aquilo."),("Hoe kan ik het goedmaken?","Como posso compensar?"),("Ik vergeef je.","Perdoo-te."),("Zand erover!","Não se fala mais nisso!")],
  review=["v-het-spijt-me","v-had-moeten","v-excuses"],
  cefr=C, exs=[
    MA([("excuses aanbieden","apresentar desculpas"),("vergeven","perdoar"),("goedmaken","compensar"),("zand erover","esquecer o assunto")], "Fazer as pazes.", ["v-excuses-aanbieden","v-vergeven","v-goedmaken","v-zand-erover"]),
    TR("pt-nl","Não devia ter dito aquilo.", ["Ik had dat niet moeten zeggen","Dat had ik niet moeten zeggen"], "had … moeten.", ["v-had-moeten"]),
    TR("pt-nl","Como posso compensar?", ["Hoe kan ik het goedmaken"], "goedmaken.", ["v-goedmaken"]),
    TR("nl-pt","Zand erover!", ["Não se fala mais nisso","Esquece","Esquecido","Está esquecido"], "Expressão.", ["v-zand-erover"]),
    MC("Qual é o pedido de desculpa mais sincero?", ["*Het spijt me echt dat ik boos werd. Dat was niet eerlijk tegenover jou.","Sorry, maar jij begon.|Desculpa condicional.","Ja ja, sorry.|Pouco sincero."], "Assumir a responsabilidade.", ["v-het-spijt-me"]),
    CJ("vergeven","ik","Ik heb het je allang ___.", ["vergeven"], "Particípio igual ao infinitivo.", ["v-vergeven"], tense="passado-perfeito"),
    FE(["Ik","bied","mijn","excuses","op."], 4, "aan", "excuses aanbieden.", ["v-excuses-aanbieden"]),
    LI("Ik wil je mijn excuses aanbieden.", ["Ik wil je mijn excuses aanbieden","Ik wil jou mijn excuses aanbieden"], "Quero apresentar-te as minhas desculpas.", "aanbieden.", ["v-excuses-aanbieden"]),
    DL([("Vriend","Sorry van gisteren, ik was echt onaardig.","Desculpa por ontem, fui mesmo antipático."),("Marta","")], ["*Dank je dat je dat zegt. Zand erover!","Ja, je bent altijd onaardig.|Reaviva o conflito.","Gefeliciteerd.|Inadequado."], "Aceitar desculpas.", ["v-zand-erover"]),
    FB("Hoe kan ik het weer ___?", ["goedmaken"], "Compensar.", ["v-goedmaken"], choices=["goedmaken","vergeven","aanbieden"], tr="Como posso voltar a compensar?"),
  ], diff=4, mins=6)

L(5, "Conflitos formais", "Een klacht escaleren, bemiddeling, het Juridisch Loket",
  ["Saber onde procurar ajuda em conflitos com empresas ou senhorios"],
  vocab=[V("v-bemiddeling","bemiddeling","mediação","noun","de"), V("v-juridisch-loket","Juridisch Loket","serviço gratuito de informação jurídica","noun","het"),
         V("v-geschil","geschil","litígio|disputa","noun","het"), V("v-in-gebreke-stellen","in gebreke stellen","notificar formalmente (incumprimento)","expression")],
  ex=[("We hebben een geschil met de verhuurder.","Temos um litígio com o senhorio."),("Het Juridisch Loket geeft gratis advies.","O Juridisch Loket dá aconselhamento gratuito."),("Buurtbemiddeling kan helpen bij burenruzies.","A mediação de bairro pode ajudar em zangas entre vizinhos."),("Ik heb het bedrijf in gebreke gesteld.","Notifiquei formalmente a empresa.")],
  review=["v-klacht","v-verhuurder","v-overlast"],
  cefr=C, exs=[
    MA([("bemiddeling","mediação"),("Juridisch Loket","informação jurídica gratuita"),("geschil","litígio"),("in gebreke stellen","notificar formalmente")], "Conflitos formais.", ["v-bemiddeling","v-juridisch-loket","v-geschil","v-in-gebreke-stellen"]),
    TR("pt-nl","Temos um litígio com o senhorio.", ["We hebben een geschil met de verhuurder","Wij hebben een geschil met de verhuurder","We hebben een geschil met de huisbaas"], "het geschil.", ["v-geschil"]),
    TR("nl-pt","Het Juridisch Loket geeft gratis advies.", ["O Juridisch Loket dá aconselhamento gratuito","O Juridisch Loket dá conselhos grátis"], "advies.", ["v-juridisch-loket"]),
    AR("geschil","o litígio","het", "Het geschil.", ["v-geschil"]),
    MC("Problema persistente com um vizinho barulhento depois de já ter falado com ele. Próximo passo razoável:", ["*buurtbemiddeling (mediação de bairro) via a gemeente","partir-lhe a porta|Ilegal.","mudar de país|Exagerado."], "Mediação.", ["v-bemiddeling"]),
    MC("A Huurcommissie trata de…", ["*litígios entre inquilinos e senhorios (renda, manutenção)","impostos|Não.","escolas|Não."], "Huurcommissie.", ["v-geschil"]),
    CO("text","Stappen bij een conflict met een bedrijf", "1. Neem contact op met de klantenservice en leg het probleem uit.\n2. Lost dat niets op? Dien dan schriftelijk een klacht in.\n3. Reageert het bedrijf niet, stel het dan in gebreke: je geeft een redelijke termijn om het op te lossen.\n4. Daarna kun je naar een geschillencommissie of het Juridisch Loket voor advies.",
       [("Qual é o primeiro passo?", ["*Contactar o apoio ao cliente","Ir a tribunal","Publicar nas redes sociais"]),("O que significa «in gebreke stellen» aqui?", ["*Dar um prazo razoável para resolver","Cancelar logo o contrato","Pagar uma multa"])],
       "termijn = prazo.", ["v-in-gebreke-stellen","v-juridisch-loket"]),
    LI("We kunnen bemiddeling aanvragen bij de gemeente.", ["We kunnen bemiddeling aanvragen bij de gemeente","Wij kunnen bemiddeling aanvragen bij de gemeente"], "Podemos pedir mediação à câmara.", "bemiddeling.", ["v-bemiddeling"]),
    FE(["Ik","heb","het","bedrijf","in","gebreke","gestelt."], 6, "gesteld", "Particípio de stellen: gesteld (l não está em 't kofschip).", ["v-in-gebreke-stellen"]),
    WO("A mediação pode ajudar.", ["Bemiddeling","kan","helpen"], "Modal + inf.", ["v-bemiddeling"]),
  ], diff=4, mins=7)

W()
