import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u09")
C = "B2"
# Lições de aprofundamento (10–29): revisão gramatical completa, foco em erros frequentes.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)
def Q(c, w, e): return MC("Qual é a ordem correta?", ["*"+c, w+"|"+e], e, REF)

REF=["v-hoofdregel"]

L(10, "Ordem: o verbo em 2.º lugar", "Gisteren ging ik naar huis.",
  ["Rever a regra do verbo em segunda posição"],
  vocab=[N("v-zinsdeel","zinsdeel","constituinte da frase","het","zinsdelen")],
  ex=[("Een zinsdeel kan uit meerdere woorden bestaan: «op de mooie zaterdagochtend».","Um constituinte pode ter várias palavras: «no bonito sábado de manhã»."),("Op de mooie zaterdagochtend gingen we fietsen.","No bonito sábado de manhã fomos andar de bicicleta.")],
  review=["v-hoofdregel","v-plaats-werkwoord","v-zinsbouw"],
  cefr=C, exs=[
    MA([("zinsdeel","constituinte"),("hoofdregel","regra principal"),("plaats van het werkwoord","posição do verbo"),("zinsbouw","construção frásica")], "Termos.", ["v-zinsdeel","v-hoofdregel","v-plaats-werkwoord","v-zinsbouw"]),
    MC("Qual é a ordem correta?", ["*Op de mooie zaterdagochtend gingen we fietsen.","Op de mooie zaterdagochtend we gingen fietsen.|Verbo em 2.º lugar.","Op de mooie gingen zaterdagochtend we fietsen.|O constituinte não se parte."], "V2.", ["v-zinsdeel"]),
    MC("Qual é a ordem correta?", ["*Volgens mijn moeder is het morgen koud.","Volgens mijn moeder het is morgen koud.|Inversão.","Volgens is mijn moeder het morgen koud.|Não."], "V2.", ["v-plaats-werkwoord"]),
    BS("Ontem à noite vi um filme.", ["Gisteravond","heb","ik","een","film","gezien"], ["Gisteravond heb ik een film gezien"], "V2.", ["v-plaats-werkwoord"]),
    BS("No meu trabalho falamos inglês.", ["Op","mijn","werk","spreken","we","Engels"], ["Op mijn werk spreken we Engels"], "V2.", ["v-plaats-werkwoord"]),
    FB("Na de vergadering ___ ik even koffie.", ["haal"], "Verbo em 2.º: haal ik.", ["v-plaats-werkwoord"], choices=["haal","ik haal","halen"], tr="Depois da reunião vou buscar café."),
    FE(["Morgen","gaat","wij","naar","Gent."], 1, "gaan", "Concordância: wij gaan.", ["v-zinsbouw"]),
    LI("Tijdens de lange winteravonden lees ik graag.", ["Tijdens de lange winteravonden lees ik graag"], "Durante as longas noites de inverno gosto de ler.", "V2.", ["v-zinsdeel"]),
  ], diff=4, mins=5)

L(11, "Ordem: três verbos no fim", "…dat hij het had moeten doen.",
  ["Ordenar três verbos no fim de uma subordinada"],
  vocab=[X("v-werkwoordsvolgorde","werkwoordsvolgorde","ordem dos verbos")],
  ex=[("Ik weet dat hij het had moeten doen.","Sei que ele o devia ter feito."),("Ze zei dat ze niet had kunnen komen.","Ela disse que não tinha podido vir.")],
  review=["v-werkwoordscluster","v-had-moeten"],
  gram=[G("g-drie-werkwoorden","Três verbos no fim","Na subordinada, com auxiliar + modal + infinitivo, a ordem habitual é: **auxiliar → modal → infinitivo**: *…dat hij het **had moeten doen***. Com **zou**: *…dat ik **zou kunnen helpen***. Atenção: o modal fica no infinitivo (duplo infinitivo).",
    [("…omdat ze het niet heeft willen zeggen.","…porque ela não o quis dizer."),("…of ik morgen zou moeten werken.","…se eu teria de trabalhar amanhã.")])],
  cefr=C, exs=[
    MA([("werkwoordsvolgorde","ordem dos verbos"),("werkwoordelijke eindgroep","grupo verbal final"),("had moeten","devia ter"),("dubbele infinitief","duplo infinitivo")], "Verbos.", ["v-werkwoordsvolgorde","v-werkwoordscluster","v-had-moeten","v-werkwoordsvolgorde"]),
    MC("Qual é a ordem correta?", ["*…dat hij het had moeten doen.","…dat hij het moeten had doen.|Ordem: had moeten doen.","…dat hij het doen had gemoeten.|Duplo infinitivo."], "Ordem.", ["v-werkwoordsvolgorde"]),
    MC("Qual é a ordem correta?", ["*…omdat ze niet heeft kunnen komen.","…omdat ze niet kunnen heeft komen.|Não.","…omdat ze niet heeft gekund komen.|Duplo infinitivo."], "Ordem.", ["v-werkwoordsvolgorde"]),
    BS("…que eu podia ajudar.", ["dat","ik","zou","kunnen","helpen"], ["dat ik zou kunnen helpen"], "zou + modal + inf.", ["v-werkwoordsvolgorde"]),
    TR("pt-nl","Sei que ele o devia ter feito.", ["Ik weet dat hij het had moeten doen","Ik weet dat hij het zou moeten hebben gedaan"], "Ordem.", ["v-had-moeten"]),
    FB("Ik vraag me af of ik morgen zou ___ werken.", ["moeten"], "Modal no infinitivo.", ["v-werkwoordsvolgorde"], choices=["moeten","gemoeten","moet"], tr="Pergunto-me se teria de trabalhar amanhã."),
    FE(["Hij","zei","dat","hij","niet","had","gekund","komen."], 6, "kunnen", "Duplo infinitivo.", ["v-werkwoordsvolgorde"]),
    LI("Ik had het je eerder willen vertellen, maar ik durfde niet.", ["Ik had het je eerder willen vertellen, maar ik durfde niet","Ik had het je eerder willen vertellen maar ik durfde niet"], "Queria ter-te contado antes, mas não tive coragem.", "Uso.", ["v-had-moeten"]),
  ], diff=5, mins=5)

L(12, "Want, omdat, dus", "Coordenar ou subordinar?",
  ["Distinguir conjunções coordenativas e subordinativas"],
  vocab=[X("v-onderschikkend","onderschikkend voegwoord","conjunção subordinativa")],
  ex=[("Ik blijf thuis, want ik ben ziek.","Fico em casa, porque estou doente."),("Ik blijf thuis, omdat ik ziek ben.","Fico em casa porque estou doente."),("Ik ben ziek, dus ik blijf thuis.","Estou doente, por isso fico em casa.")],
  review=["v-nevenschikkend","v-omdat","v-dus"],
  gram=[G("g-want-omdat","Want vs. omdat","**Want, en, maar, of, dus** (coordenativas) não mudam a ordem: *…, want ik **ben** ziek.* (Nota: depois de *dus* também se pode inverter: *dus **blijf** ik thuis*.) **Omdat, dat, als, hoewel, terwijl…** (subordinativas) mandam o verbo para o fim: *…, omdat ik ziek **ben**.*",
    [("Ik kom niet, want het regent.","Não venho, porque está a chover."),("Ik kom niet, omdat het regent.","Não venho, porque está a chover.")])],
  cefr=C, exs=[
    MA([("onderschikkend voegwoord","conj. subordinativa"),("coördinerend voegwoord","conj. coordenativa"),("omdat","porque (sub.)"),("want","porque (coord.)")], "Conjunções.", ["v-onderschikkend","v-nevenschikkend","v-omdat","v-onderschikkend"]),
    MC("Qual está correta?", ["*Ik bel je later, want ik zit in de trein.","Ik bel je later, want ik in de trein zit.|«want» não manda o verbo para o fim.","Ik bel je later, omdat ik zit in de trein.|«omdat» manda o verbo para o fim."], "Want/omdat.", ["v-nevenschikkend"]),
    MC("Qual está correta?", ["*Ik bel je later, omdat ik in de trein zit.","Ik bel je later, omdat ik zit in de trein.|Verbo no fim.","Ik bel je later, want zit ik in de trein.|Não."], "Omdat.", ["v-onderschikkend"]),
    FB("Ik ga niet mee, ___ ik moet werken.", ["want"], "Ordem normal → want.", ["v-nevenschikkend"], choices=["want","omdat","doordat"], tr="Não vou, porque tenho de trabalhar."),
    FB("Ik ga niet mee, ___ ik morgen vroeg op moet.", ["omdat"], "Verbo no fim → omdat.", ["v-onderschikkend"], choices=["omdat","want","dus"], tr="Não vou, porque amanhã tenho de me levantar cedo."),
    TR("pt-nl","Estou doente, por isso fico em casa.", ["Ik ben ziek, dus ik blijf thuis","Ik ben ziek, dus blijf ik thuis"], "dus: as duas ordens.", ["v-dus"]),
    FE(["Ik","kom","niet,","omdat","ik","moe","zijn."], 6, "ben.", "ik: ben.", ["v-onderschikkend"]),
    LI("Ik neem de fiets, want de bus is te laat.", ["Ik neem de fiets, want de bus is te laat","Ik neem de fiets want de bus is te laat"], "Vou de bicicleta, porque o autocarro está atrasado.", "want.", ["v-nevenschikkend"]),
  ], diff=4, mins=5)

L(13, "Tempos: imperfeito ou perfeito?", "Ik heb gewerkt / ik werkte.",
  ["Escolher entre perfectum e imperfectum ao narrar"],
  vocab=[X("v-verleden-tijd","onvoltooid verleden tijd","pretérito imperfeito (imperfectum)")],
  ex=[("Gisteren heb ik hard gewerkt.","Ontem trabalhei muito."),("Toen ik in Lissabon woonde, werkte ik in een hotel.","Quando vivia em Lisboa, trabalhava num hotel.")],
  review=["v-voltooid","v-onvoltooid","v-tijden"],
  gram=[G("g-perf-imperf","Perfectum vs. imperfectum","Em conversa, para **factos pontuais concluídos**, usa-se sobretudo o **perfectum**: *Ik heb gisteren gewerkt.* Para **narrar uma história** ou **situações habituais/de fundo no passado**, usa-se o **imperfectum**: *Toen ik klein was, speelde ik buiten.* Muitas vezes começa-se no perfectum e continua-se no imperfectum.",
    [("Weet je wat er gebeurd is? Ik fietste naar huis en ineens…","Sabes o que aconteceu? Ia para casa de bicicleta e de repente…"),("Vroeger rookte hij.","Antigamente fumava.")])],
  cefr=C, exs=[
    MA([("onvoltooid verleden tijd","imperfectum"),("voltooid","perfeito"),("onvoltooid","imperfeito"),("werkwoordstijden","tempos verbais")], "Tempos.", ["v-verleden-tijd","v-voltooid","v-onvoltooid","v-tijden"]),
    MC("Hábito passado: «Antigamente ia a pé para a escola.»", ["*Vroeger liep ik naar school.","Vroeger ben ik naar school gelopen.|Menos natural para hábito.","Vroeger loop ik naar school.|Presente."], "Imperfectum.", ["v-verleden-tijd"]),
    MC("Pergunta sobre um facto recente: «Já comeste?»", ["*Heb je al gegeten?","At je al?|Pouco natural.","Eet je al?|Presente."], "Perfectum.", ["v-voltooid"]),
    CJ("wonen","ik","Toen ik klein was, ___ ik in Faro.", ["woonde"], "Imperfectum.", ["v-verleden-tijd"], tense="passado-simples"),
    CJ("vergeten","ik","Sorry, ik ben het ___!", ["vergeten"], "Perfectum com zijn.", ["v-voltooid"], tense="passado-perfeito"),
    FB("Terwijl ik ___, ging de telefoon.", ["kookte"], "Ação de fundo: imperfectum.", ["v-verleden-tijd"], choices=["kookte","heb gekookt","kook"], tr="Enquanto cozinhava, o telefone tocou."),
    FE(["Vroeger","speel","ik","elke","dag","buiten."], 1, "speelde", "Passado habitual: speelde.", ["v-verleden-tijd"]),
    LI("Weet je wat me gisteren is overkomen? Ik stond bij de bushalte en ineens…", ["Weet je wat me gisteren is overkomen? Ik stond bij de bushalte en ineens","Weet je wat me gisteren is overkomen ik stond bij de bushalte en ineens"], "Sabes o que me aconteceu ontem? Estava na paragem e de repente…", "Perfectum → imperfectum.", ["v-verleden-tijd"]),
  ], diff=4, mins=5)

L(14, "Tempos: zijn ou hebben?", "Ik ben gefietst / ik heb gefietst.",
  ["Escolher o auxiliar certo no perfeito"],
  vocab=[N("v-hulpwerkwoord","hulpwerkwoord","verbo auxiliar","het","hulpwerkwoorden")],
  ex=[("Ik heb vandaag veel gefietst.","Hoje andei muito de bicicleta."),("Ik ben naar Utrecht gefietst.","Fui de bicicleta a Utrecht."),("Hij is twintig kilo afgevallen.","Ele emagreceu vinte quilos.")],
  review=["v-voltooid"],
  gram=[G("g-zijn-hebben","Zijn ou hebben?","**Zijn** com verbos de **mudança de estado** (*worden, sterven, verhuizen, afvallen*) e de **movimento com destino**: *Ik **ben** naar huis gefietst.* **Hebben** com a maioria dos verbos e com movimento **sem destino**: *Ik **heb** gefietst* (atividade). Alguns verbos usam sempre zijn: *zijn, blijven, gaan, komen, gebeuren*.",
    [("Ze is naar Spanje gevlogen.","Ela foi de avião para Espanha."),("We hebben de hele dag gewandeld.","Caminhámos o dia todo.")])],
  cefr=C, exs=[
    MA([("hulpwerkwoord","verbo auxiliar"),("voltooid","perfeito"),("ben gefietst","fui de bicicleta (destino)"),("heb gefietst","andei de bicicleta")], "Auxiliares.", ["v-hulpwerkwoord","v-voltooid","v-hulpwerkwoord","v-voltooid"]),
    MC("«Fui a pé até à estação.»", ["*Ik ben naar het station gelopen.","Ik heb naar het station gelopen.|Destino → zijn.","Ik werd gelopen.|Não."], "Zijn.", ["v-hulpwerkwoord"]),
    MC("«Caminhámos três horas.»", ["*We hebben drie uur gelopen.","We zijn drie uur gelopen.|Sem destino → hebben (aceita-se zijn regionalmente).","We lopen drie uur.|Presente."], "Hebben.", ["v-hulpwerkwoord"]),
    FB("Mijn oma ___ vorig jaar overleden.", ["is"], "Mudança de estado: zijn.", ["v-hulpwerkwoord"], choices=["is","heeft","wordt"], tr="A minha avó faleceu no ano passado."),
    FB("Wat ___ er gebeurd?", ["is"], "gebeuren: zijn.", ["v-hulpwerkwoord"], choices=["is","heeft","wordt"], tr="O que aconteceu?"),
    FE(["We","hebben","naar","Amsterdam","verhuisd."], 1, "zijn", "verhuizen: zijn.", ["v-hulpwerkwoord"]),
    FE(["Ik","ben","de","hele","dag","gewerkt."], 1, "heb", "werken: hebben.", ["v-hulpwerkwoord"]),
    LI("Hij is in een jaar twintig kilo afgevallen.", ["Hij is in een jaar twintig kilo afgevallen","Hij is in een jaar 20 kilo afgevallen"], "Ele emagreceu vinte quilos num ano.", "Zijn.", ["v-hulpwerkwoord"]),
  ], diff=4, mins=5)

L(15, "Tempos: falar do futuro", "Ik ga, ik zal, ik doe het morgen.",
  ["Escolher entre presente, gaan e zullen para o futuro"],
  vocab=[X("v-toekomst-uitdrukken","de toekomst uitdrukken","exprimir o futuro","verb")],
  ex=[("Morgen werk ik thuis.","Amanhã trabalho de casa."),("Ik ga volgend jaar verhuizen.","Vou mudar-me no próximo ano."),("Ik zal je helpen, beloofd.","Vou ajudar-te, prometo.")],
  review=["v-toekomende-tijd","v-zal-wel"],
  cefr=C, exs=[
    MA([("de toekomst uitdrukken","exprimir o futuro"),("toekomende tijd","futuro"),("zal wel","deve (suposição)"),("gaan + infinitivo","ir + infinitivo")], "Futuro.", ["v-toekomst-uitdrukken","v-toekomende-tijd","v-zal-wel","v-toekomst-uitdrukken"]),
    MC("Plano com expressão de tempo: o mais natural é…", ["*o presente: «Volgende week ga ik naar Porto.»","sempre zullen|Soa formal.","imperfectum|Não."], "Uso.", ["v-toekomende-tijd"]),
    MC("Promessa solene:", ["*Ik zal het nooit vergeten.","Ik ga het nooit vergeten.|Possível, mas menos solene.","Ik vergat het nooit.|Passado."], "Zullen.", ["v-toekomende-tijd"]),
    MC("Suposição: «Ele deve estar cansado.»", ["*Hij zal wel moe zijn.","Hij gaat moe zijn.|Não é suposição.","Hij is moe geweest.|Passado."], "Zal wel.", ["v-zal-wel"]),
    TR("pt-nl","Vou mudar-me no próximo ano.", ["Ik ga volgend jaar verhuizen","Volgend jaar ga ik verhuizen","Volgend jaar verhuis ik"], "gaan.", ["v-toekomst-uitdrukken"]),
    FB("Ik ___ je morgen bellen, beloofd!", ["zal"], "Promessa.", ["v-toekomende-tijd"], choices=["zal","ga","word"], tr="Ligo-te amanhã, prometo!"),
    FE(["Morgen","zullen","ik","je","helpen."], 1, "zal", "ik: zal.", ["v-toekomende-tijd"]),
    LI("Het gaat vanavond regenen, dus neem een jas mee.", ["Het gaat vanavond regenen, dus neem een jas mee","Het gaat vanavond regenen dus neem een jas mee"], "Vai chover esta noite, por isso leva um casaco.", "gaan + previsão.", ["v-toekomst-uitdrukken"]),
  ], diff=4, mins=5)

L(16, "Condicional irreal", "Als ik het geweten had, was ik gekomen.",
  ["Rever o condicional irreal no presente e no passado"],
  vocab=[X("v-irreeel","irreële voorwaarde","condição irreal")],
  ex=[("Als ik meer tijd had, zou ik vaker sporten.","Se tivesse mais tempo, faria desporto mais vezes."),("Als ik het geweten had, was ik gekomen.","Se eu tivesse sabido, tinha vindo.")],
  review=["v-als-ik-dat-had-geweten","v-zou-hebben","v-als-ik-jou-was"],
  cefr=C, exs=[
    MA([("irreële voorwaarde","condição irreal"),("als ik dat had geweten","se eu tivesse sabido"),("als ik jou was","se eu fosse tu"),("zou hebben","teria")], "Irreal.", ["v-irreeel","v-als-ik-dat-had-geweten","v-als-ik-jou-was","v-zou-hebben"]),
    MC("Presente irreal: «Se eu fosse rico, comprava um barco.»", ["*Als ik rijk was, zou ik een boot kopen.","Als ik rijk ben, koop ik een boot.|Condição real.","Als ik rijk was geweest, kocht ik.|Mistura."], "Irreal presente.", ["v-irreeel"]),
    MC("Passado irreal: «Se tivesses vindo, tinhas-te divertido.»", ["*Als je was gekomen, had je je vermaakt.","Als je kwam, vermaakte je je.|Não irreal.","Als je komt, vermaak je je.|Presente."], "Irreal passado.", ["v-als-ik-dat-had-geweten"]),
    TR("pt-nl","Se tivesse mais tempo, faria mais desporto.", ["Als ik meer tijd had, zou ik meer sporten","Als ik meer tijd had, zou ik vaker sporten"], "zou + inf.", ["v-irreeel"]),
    TR("pt-nl","Se eu fosse tu, ligava-lhe.", ["Als ik jou was, zou ik hem bellen","Als ik jou was, zou ik haar bellen","Als ik jou was, belde ik hem"], "als ik jou was.", ["v-als-ik-jou-was"]),
    FB("Als het mooi weer ___ geweest, waren we naar het strand gegaan.", ["was"], "zijn → was geweest.", ["v-als-ik-dat-had-geweten"], choices=["was","had","zou"], tr="Se tivesse estado bom tempo, tínhamos ido à praia."),
    FE(["Als","ik","rijk","ben,","zou","ik","reizen."], 3, "was,", "Irreal: was.", ["v-irreeel"]),
    LI("Als ik dat eerder had geweten, had ik anders gekozen.", ["Als ik dat eerder had geweten, had ik anders gekozen","Als ik dat eerder had geweten had ik anders gekozen"], "Se tivesse sabido isso antes, tinha escolhido de outra forma.", "Irreal passado.", ["v-als-ik-dat-had-geweten"]),
  ], diff=5, mins=5)

L(17, "De ou het?", "Regras que ajudam.",
  ["Rever regras fiáveis para o artigo"],
  vocab=[X("v-de-woord","de-woord","palavra com «de»")],
  ex=[("Alle verkleinwoorden zijn het-woorden.","Todos os diminutivos são palavras com «het»."),("Woorden op -heid en -ing zijn de-woorden.","As palavras em -heid e -ing levam «de».")],
  review=["v-het-woord","v-lidwoord","v-onzijdig","v-uitzondering"],
  gram=[G("g-de-het-regels","Regras fiáveis de/het","**het**: diminutivos (*het huisje*), infinitivos como nomes (*het lezen*), línguas (*het Nederlands*), metais (*het goud*), palavras com ge- e be-/ver- sem sufixo forte (*het gebouw, het verhaal*), -isme, -ment, -um (*het museum*). **de**: plurais (*de huizen*), -heid, -ing, -ij, -iteit, -schap (quase sempre), profissões e pessoas (*de bakker*). Em compostos conta a **última** palavra.",
    [("het boek → het kookboek","composto: última palavra"),("de kerk → de kerktoren","de toren decide")])],
  cefr=C, exs=[
    MA([("de-woord","palavra com de"),("het-woord","palavra com het"),("onzijdig","neutro"),("uitzondering","exceção")], "Artigos.", ["v-de-woord","v-het-woord","v-onzijdig","v-uitzondering"]),
    AR("vrijheid", "liberdade", "de", "-heid → de.", ["v-de-woord"]),
    AR("museum", "museu", "het", "-um → het.", ["v-het-woord"]),
    AR("tentoonstelling", "exposição", "de", "-ing → de.", ["v-de-woord"]),
    AR("toerisme", "turismo", "het", "-isme → het.", ["v-het-woord"]),
    MC("Artigo de «stadhuistoren» (torre da câmara)?", ["*de (de toren)","het (het stadhuis)|Conta a última palavra.","depende|Não."], "Compostos.", ["v-de-woord"]),
    FE(["Het","huizen","in","deze","straat","zijn","oud."], 0, "De", "Plural: de.", ["v-de-woord"]),
    FE(["De","meisje","speelt","buiten."], 0, "Het", "Diminutivo: het.", ["v-het-woord"]),
  ], diff=4, mins=5)

L(18, "Adjetivos: com ou sem -e?", "Een groot huis, het grote huis.",
  ["Rever a flexão dos adjetivos"],
  vocab=[N("v-bijvoeglijk-naamwoord","bijvoeglijk naamwoord","adjetivo","het")],
  ex=[("Een groot huis, het grote huis, grote huizen.","Uma casa grande, a casa grande, casas grandes."),("Mijn nieuwe fiets is snel.","A minha bicicleta nova é rápida.")],
  review=["v-buigen","v-onzijdig"],
  gram=[G("g-buiging","Quando o adjetivo leva -e","O adjetivo **antes** do nome leva **-e**, **exceto** com uma *het*-palavra singular indefinida (**een / geen / elk / veel / zonder artigo**): *een groot huis, geen warm water*. **Depois** do verbo (predicativo) nunca leva -e: *het huis is groot*. Com possessivos e demonstrativos leva sempre -e: *mijn grote huis, dit mooie boek*.",
    [("een oud boek / het oude boek","um livro velho / o livro velho"),("veel koud water","muita água fria")])],
  cefr=C, exs=[
    MA([("bijvoeglijk naamwoord","adjetivo"),("buigen","flexionar"),("onzijdig","neutro (het)"),("lidwoord","artigo")], "Termos.", ["v-bijvoeglijk-naamwoord","v-buigen","v-onzijdig","v-lidwoord"]),
    MC("een ___ boek (interessant)", ["*interessant","interessante|het + een → sem -e.","interessants|Não."], "Regra.", ["v-buigen"]),
    MC("het ___ boek (interessant)", ["*interessante","interessant|Com «het» definido → -e.","interessants|Não."], "Regra.", ["v-buigen"]),
    MC("mijn ___ telefoon (nieuw)", ["*nieuwe","nieuw|Possessivo → -e.","nieuws|Não."], "Regra.", ["v-buigen"]),
    FB("Er is geen ___ water meer.", ["warm"], "het water + geen → sem -e.", ["v-buigen"], choices=["warm","warme","warmer"], tr="Já não há água quente."),
    FB("De soep is erg ___.", ["heet"], "Predicativo: sem -e.", ["v-buigen"], choices=["heet","hete","heten"], tr="A sopa está muito quente."),
    FE(["We","hebben","een","mooie","huis","gekocht."], 3, "mooi", "het huis + een → sem -e.", ["v-buigen"]),
    FE(["Dit","is","mijn","nieuw","fiets."], 3, "nieuwe", "Possessivo → -e.", ["v-buigen"]),
  ], diff=4, mins=5)

L(19, "Comparativos irregulares", "Goed, beter, best.",
  ["Rever comparativos e superlativos irregulares"],
  vocab=[X("v-trappen-van-vergelijking","trappen van vergelijking","graus de comparação")],
  ex=[("Goed, beter, best.","Bom, melhor, o melhor."),("Veel, meer, meest.","Muito, mais, o mais."),("Weinig, minder, minst.","Pouco, menos, o menos.")],
  review=["v-best"],
  cefr=C, exs=[
    MA([("goed → beter","bom → melhor"),("veel → meer","muito → mais"),("weinig → minder","pouco → menos"),("graag → liever","de bom grado → preferir")], "Irregulares.", ["v-trappen-van-vergelijking","v-best","v-niet-meer","v-trappen-van-vergelijking"]),
    MC("Comparativo de «graag»:", ["*liever","graagder|Não.","meer graag|Não."], "Irregular.", ["v-trappen-van-vergelijking"]),
    MC("Superlativo de «goed»:", ["*het best(e)","het goedst|Não.","het meest goed|Não."], "Irregular.", ["v-best"]),
    TR("pt-nl","Prefiro chá.", ["Ik drink liever thee","Ik heb liever thee"], "liever.", ["v-trappen-van-vergelijking"]),
    FB("Dit restaurant is ___ dan dat andere.", ["beter"], "Comparativo.", ["v-trappen-van-vergelijking"], choices=["beter","goeder","best"], tr="Este restaurante é melhor do que o outro."),
    FB("Ik heb de ___ tijd van iedereen.", ["minste"], "Superlativo de weinig.", ["v-trappen-van-vergelijking"], choices=["minste","weinigste","minder"], tr="Sou quem tem menos tempo de todos."),
    FE(["Zij","spreekt","goeder","Nederlands","dan","ik."], 2, "beter", "Irregular: beter.", ["v-trappen-van-vergelijking"]),
    LI("Hoe meer je oefent, hoe beter het gaat.", ["Hoe meer je oefent, hoe beter het gaat","Hoe meer je oefent hoe beter het gaat"], "Quanto mais praticas, melhor corre.", "Revisão.", ["v-hoe-langer-hoe"]),
  ], diff=4, mins=5)

L(20, "Diminutivos", "-je, -tje, -pje, -etje, -kje.",
  ["Formar diminutivos corretamente"],
  vocab=[X("v-verkleinwoord-vorm","verkleinwoordsuffix","sufixo diminutivo")],
  ex=[("Huis → huisje, boom → boompje, bal → balletje, koning → koninkje.","Casa → casinha, árvore → arvorezinha, bola → bolinha, rei → reizinho.")],
  review=["v-verkleinwoord"],
  gram=[G("g-verkleinwoord","Formar o diminutivo","**-je** depois da maioria das consoantes (*huisje, boekje*). **-tje** depois de vogal longa, ditongo ou -l/-n/-r após vogal longa (*stoeltje, treintje, auto'tje*). **-pje** depois de -m após vogal longa (*boompje*). **-etje** depois de vogal curta + l/m/n/r/ng (*balletje, ringetje*). **-kje** em -ing com sílaba átona (*koninkje*).",
    [("de man → het mannetje","o homenzinho"),("de kam → het kammetje","o pentezinho")])],
  cefr=C, exs=[
    MA([("verkleinwoordsuffix","sufixo diminutivo"),("huis → huisje","-je"),("boom → boompje","-pje"),("bal → balletje","-etje")], "Diminutivos.", ["v-verkleinwoord-vorm","v-verkleinwoord","v-verkleinwoord-vorm","v-verkleinwoord"]),
    MC("Diminutivo de «trein»:", ["*treintje","treinje|Não.","treinetje|Não."], "-tje.", ["v-verkleinwoord-vorm"]),
    MC("Diminutivo de «bal»:", ["*balletje","balje|Não.","baltje|Não."], "-etje.", ["v-verkleinwoord-vorm"]),
    MC("Diminutivo de «boom»:", ["*boompje","boomje|Não.","boomtje|Não."], "-pje.", ["v-verkleinwoord-vorm"]),
    MC("Diminutivo de «koning»:", ["*koninkje","koningje|Não.","koningetje|Não."], "-kje.", ["v-verkleinwoord-vorm"]),
    AR("treintje", "comboiozinho", "het", "Diminutivo → het.", ["v-verkleinwoord"]),
    FB("Mag ik een ___ koffie? (kop)", ["kopje"], "Diminutivo.", ["v-verkleinwoord-vorm"], choices=["kopje","koppie","kopetje"], tr="Pode ser uma chávena de café?"),
    FE(["Hij","heeft","een","klein","huisetje."], 4, "huisje.", "huis → huisje.", ["v-verkleinwoord-vorm"]),
  ], diff=4, mins=5)

L(21, "Preposições de tempo", "Om, op, in, over, sinds, tijdens.",
  ["Usar as preposições de tempo corretas"],
  vocab=[X("v-tijdsvoorzetsel","voorzetsel van tijd","preposição de tempo")],
  ex=[("Om acht uur, op maandag, in mei, over een week.","Às oito, na segunda, em maio, daqui a uma semana."),("Sinds 2020 woon ik hier.","Desde 2020 vivo aqui."),("Tijdens de vakantie las ik veel.","Durante as férias li muito.")],
  review=["v-voorzetsel","v-over-een-jaar","v-sinds"],
  cefr=C, exs=[
    MA([("om acht uur","às oito"),("op maandag","na segunda"),("in mei","em maio"),("over een week","daqui a uma semana")], "Tempo.", ["v-tijdsvoorzetsel","v-voorzetsel","v-tijdsvoorzetsel","v-over-een-jaar"]),
    MC("«Na sexta-feira»:", ["*op vrijdag","in vrijdag|Não.","om vrijdag|Não."], "Dias: op.", ["v-tijdsvoorzetsel"]),
    MC("«Em junho»:", ["*in juni","op juni|Não.","om juni|Não."], "Meses: in.", ["v-tijdsvoorzetsel"]),
    MC("«Daqui a três dias»:", ["*over drie dagen","in drie dagen|Em NL soa «durante três dias»/menos natural.","na drie dagen|«depois de» no passado."], "Futuro: over.", ["v-over-een-jaar"]),
    FB("___ de les mag je niet bellen.", ["Tijdens"], "Durante.", ["v-tijdsvoorzetsel"], choices=["Tijdens","Sinds","Over"], tr="Durante a aula não podes telefonar."),
    FB("Ik woon hier ___ drie jaar.", ["al"], "Duração até agora: al.", ["v-sinds"], choices=["al","sinds","voor"], tr="Vivo aqui há três anos."),
    FE(["De","film","begint","op","acht","uur."], 3, "om", "Horas: om.", ["v-tijdsvoorzetsel"]),
    FE(["Ik","ben","geboren","op","1990."], 3, "in", "Anos: in.", ["v-tijdsvoorzetsel"]),
  ], diff=4, mins=5)

L(22, "Preposições de lugar", "Op, in, aan, bij.",
  ["Usar as preposições de lugar corretas"],
  vocab=[X("v-plaatsvoorzetsel","voorzetsel van plaats","preposição de lugar")],
  ex=[("Ik werk op kantoor, maar woon in Delft.","Trabalho no escritório, mas vivo em Delft."),("Het schilderij hangt aan de muur.","O quadro está pendurado na parede."),("Ik ben bij de tandarts.","Estou no dentista.")],
  review=["v-voorzetsel"],
  cefr=C, exs=[
    MA([("op kantoor","no escritório"),("in Delft","em Delft"),("aan de muur","na parede"),("bij de tandarts","no dentista")], "Lugar.", ["v-plaatsvoorzetsel","v-voorzetsel","v-plaatsvoorzetsel","v-voorzetsel"]),
    MC("«Na escola» (o local):", ["*op school","in school|Menos comum.","aan school|Não."], "Expressão fixa.", ["v-plaatsvoorzetsel"]),
    MC("«Em casa da minha mãe»:", ["*bij mijn moeder","in mijn moeder|Não.","op mijn moeder|Não."], "Pessoas: bij.", ["v-plaatsvoorzetsel"]),
    MC("«No primeiro andar»:", ["*op de eerste verdieping","in de eerste verdieping|Não.","aan de eerste verdieping|Não."], "Andar: op.", ["v-plaatsvoorzetsel"]),
    FB("De lamp hangt ___ het plafond.", ["aan"], "Pendurado: aan.", ["v-plaatsvoorzetsel"], choices=["aan","op","in"], tr="O candeeiro está pendurado no teto."),
    FB("Ik zit ___ de trein.", ["in"], "Dentro: in.", ["v-plaatsvoorzetsel"], choices=["in","op","bij"], tr="Estou no comboio."),
    FE(["Ik","werk","in","een","boerderij."], 2, "op", "Expressão: op een boerderij.", ["v-plaatsvoorzetsel"]),
    LI("We wonen aan de rand van de stad, vlak bij het park.", ["We wonen aan de rand van de stad, vlak bij het park","We wonen aan de rand van de stad vlak bij het park"], "Vivemos à beira da cidade, mesmo perto do parque.", "Várias preposições.", ["v-plaatsvoorzetsel"]),
  ], diff=4, mins=5)

L(23, "Pronomes para coisas", "De tafel → hij, het boek → het.",
  ["Referir coisas com o pronome certo"],
  vocab=[X("v-verwijzend-voornaamwoord","verwijzend voornaamwoord","pronome de referência")],
  ex=[("Waar is de sleutel? — Hij ligt op tafel.","Onde está a chave? — Está em cima da mesa."),("Waar is het boek? — Het ligt op tafel.","Onde está o livro? — Está em cima da mesa."),("Ik heb de fiets gekocht; ik vind hem mooi.","Comprei a bicicleta; acho-a bonita.")],
  review=["v-voornaamwoord","v-verwijzen"],
  cefr=C, exs=[
    MA([("verwijzend voornaamwoord","pronome de referência"),("de sleutel → hij","a chave → hij"),("het boek → het","o livro → het"),("voornaamwoord","pronome")], "Pronomes.", ["v-verwijzend-voornaamwoord","v-voornaamwoord","v-verwijzend-voornaamwoord","v-voornaamwoord"]),
    MC("«Waar is de pen? — ___ ligt daar.»", ["*Hij","Het|«de pen» → hij.","Zij|Possível no norte para alguns nomes, mas hij é o normal."], "de-palavra → hij.", ["v-verwijzend-voornaamwoord"]),
    MC("«Ik heb de jas gekocht. Ik vind ___ mooi.»", ["*hem","het|«de jas» → hem.","zijn|Não."], "Objeto: hem.", ["v-verwijzend-voornaamwoord"]),
    MC("«Waar is het kopje? — ___ staat in de kast.»", ["*Het","Hij|het-palavra → het.","Ze|Não."], "het-palavra.", ["v-verwijzend-voornaamwoord"]),
    FB("De laptop is kapot. Ik breng ___ morgen naar de winkel.", ["hem"], "de laptop → hem.", ["v-verwijzend-voornaamwoord"], choices=["hem","het","haar"], tr="O portátil está avariado. Levo-o amanhã à loja."),
    FE(["De","bank","is","oud,","maar","het","zit","lekker."], 5, "hij", "de bank → hij.", ["v-verwijzend-voornaamwoord"]),
    FE(["Ik","heb","het","huis","gekocht","en","ik","vind","hem","mooi."], 8, "het", "het huis → het.", ["v-verwijzend-voornaamwoord"]),
    LI("Waar is mijn telefoon? Ik kan hem nergens vinden.", ["Waar is mijn telefoon? Ik kan hem nergens vinden","Waar is mijn telefoon ik kan hem nergens vinden"], "Onde está o meu telemóvel? Não o encontro em lado nenhum.", "Uso.", ["v-verwijzend-voornaamwoord"]),
  ], diff=4, mins=5)

L(24, "Possessivos", "Zijn, haar, hun… en die van mij.",
  ["Usar possessivos e «die/dat van mij»"],
  vocab=[X("v-die-van-mij","die/dat van mij","o meu (pronome)"), X("v-bezittelijk","bezittelijk voornaamwoord","pronome possessivo")],
  ex=[("Is dit jouw fiets? — Nee, die van mij is blauw.","Esta é a tua bicicleta? — Não, a minha é azul."),("Hun kinderen spelen met de onze.","Os filhos deles brincam com os nossos."),("Dat boek is van haar.","Esse livro é dela.")],
  review=["v-voornaamwoord"],
  cefr=C, exs=[
    MA([("die van mij","a minha (de-palavra)"),("dat van mij","o meu (het-palavra)"),("bezittelijk voornaamwoord","pronome possessivo"),("van haar","dela")], "Possessivos.", ["v-die-van-mij","v-die-van-mij","v-bezittelijk","v-voornaamwoord"]),
    MC("«O carro deles»:", ["*hun auto","hen auto|«hen» não é possessivo.","zijn auto|«dele»."], "hun.", ["v-bezittelijk"]),
    MC("«Este é o meu livro; onde está o teu?» (het boek)", ["*…waar is dat van jou?","…waar is die van jou?|het boek → dat.","…waar is jouw?|Falta o nome."], "dat van jou.", ["v-die-van-mij"]),
    TR("pt-nl","A minha é azul.", ["Die van mij is blauw","De mijne is blauw"], "die van mij / de mijne.", ["v-die-van-mij"]),
    FB("Is dit ___ jas, Tom? (tua)", ["jouw"], "Possessivo.", ["v-bezittelijk"], choices=["jouw","jou","jij"], tr="Este casaco é teu, Tom?"),
    FE(["Ze","komen","met","hen","kinderen."], 3, "hun", "Possessivo: hun.", ["v-bezittelijk"]),
    FE(["Is","dat","boek","van","zij?"], 4, "haar?", "Depois de preposição: haar.", ["v-bezittelijk"]),
    LI("Mijn fiets is gestolen; mag ik die van jou lenen?", ["Mijn fiets is gestolen; mag ik die van jou lenen","Mijn fiets is gestolen, mag ik die van jou lenen","Mijn fiets is gestolen; mag ik die van jou lenen?"], "Roubaram-me a bicicleta; posso pedir-te a tua emprestada?", "Uso.", ["v-die-van-mij"]),
  ], diff=4, mins=5)

L(25, "Os quatro usos de «er»", "Er is, er + prep, er + número, er + passiva.",
  ["Rever os usos de er"],
  vocab=[X("v-vier-keer-er","de vier functies van «er»","os quatro usos de «er»")],
  ex=[("Er is een probleem.","Há um problema."),("Ik denk er nog over na.","Ainda estou a pensar nisso."),("Ik heb er drie.","Tenho três."),("Er wordt gedanst.","Dança-se.")],
  review=["v-er-existentieel","v-er-aantal","v-er-wordt","v-nadenken-over"],
  cefr=C, exs=[
    MA([("er is…","há…"),("er + preposição","disso/nisso…"),("er + número","deles/delas"),("er + passiva","impessoal")], "Er.", ["v-er-existentieel","v-nadenken-over","v-er-aantal","v-er-wordt"]),
    MC("«Heb je appels? — Ja, ik heb ___ vijf.»", ["*er","het|Não.","ze|Possível mas muda sentido."], "er + número.", ["v-er-aantal"]),
    MC("«Ik heb het plan gelezen. Ik denk ___ nog over na.»", ["*er","het|Com preposição: er.","daar niet|Não."], "er + prep.", ["v-nadenken-over"]),
    MC("«Op het feest ___ gedanst.»", ["*werd er","was het|Não.","dansen ze|Possível, mas não é passiva."], "Passiva impessoal.", ["v-er-wordt"]),
    TR("pt-nl","Há um problema.", ["Er is een probleem"], "er is.", ["v-er-existentieel"]),
    TR("pt-nl","Tenho três.", ["Ik heb er drie"], "er + número.", ["v-er-aantal"]),
    FE(["Hoeveel","kinderen","heb","je?","Ik","heb","het","twee."], 6, "er", "er + número.", ["v-er-aantal"]),
    LI("Er staan nog drie vragen open; daar kom ik zo op terug.", ["Er staan nog drie vragen open; daar kom ik zo op terug","Er staan nog drie vragen open, daar kom ik zo op terug"], "Ainda há três perguntas em aberto; volto a isso já.", "Vários usos.", ["v-er-existentieel"]),
  ], diff=5, mins=5)

L(26, "Separável ou inseparável?", "Óndergaan of ondergáán?",
  ["Distinguir verbos separáveis e inseparáveis pelo acento"],
  vocab=[X("v-scheidbaar","scheidbaar werkwoord","verbo separável"), X("v-onscheidbaar","onscheidbaar werkwoord","verbo inseparável")],
  ex=[("De zon gaat onder. (ÓNDERgaan)","O sol põe-se. (separável)"),("Hij ondergaat een operatie. (onderGÁÁN)","Ele submete-se a uma operação. (inseparável)"),("Wij voorkómen problemen.","Nós prevenimos problemas.")],
  review=["v-voorkomen","v-overkomen"],
  gram=[G("g-scheidbaar-klemtoon","O acento decide","Alguns verbos existem nas duas formas. Com o **acento no prefixo** são **separáveis** e o particípio tem *ge-* no meio: *ÓNDERgaan → ging onder → is ondergegaan* (pôr-se o sol). Com o **acento no verbo** são **inseparáveis**, sem *ge-*: *onderGÁÁN → onderging → heeft ondergaan* (submeter-se). O mesmo com *vóórkomen* (ocorrer) / *voorKÓMEN* (prevenir), *ÓVERkomen* (vir de visita/parecer) / *overKÓMEN* (acontecer a alguém).",
    [("Dat komt vaak voor.","Isso acontece muitas vezes."),("Zo voorkom je fouten.","Assim previnem-se erros.")])],
  cefr=C, exs=[
    MA([("scheidbaar werkwoord","verbo separável"),("onscheidbaar werkwoord","verbo inseparável"),("vóórkomen","ocorrer"),("voorkómen","prevenir")], "Verbos.", ["v-scheidbaar","v-onscheidbaar","v-voorkomen","v-overkomen"]),
    MC("Particípio de «ondergaan» (o sol):", ["*ondergegaan","onderggaan|Não.","ondergaan|Isso é o inseparável."], "Separável.", ["v-scheidbaar"]),
    MC("«Ele submeteu-se a uma operação.»", ["*Hij heeft een operatie ondergaan.","Hij heeft een operatie ondergegaan.|Inseparável, sem ge-.","Hij ging een operatie onder.|Não."], "Inseparável.", ["v-onscheidbaar"]),
    MC("«Isso acontece muitas vezes.»", ["*Dat komt vaak voor.","Dat voorkomt vaak.|Isso seria «previne».","Dat voorgekomen vaak.|Não."], "vóórkomen.", ["v-voorkomen"]),
    FB("Zo ___ je misverstanden. (prevenir)", ["voorkom"], "Inseparável.", ["v-onscheidbaar"], choices=["voorkom","kom voor","voorgekomen"], tr="Assim previnem-se mal-entendidos."),
    FB("Wat is je gisteren ___? (aconteceu-te)", ["overkomen"], "Inseparável: overkomen.", ["v-onscheidbaar"], choices=["overkomen","overgekomen","kwam over"], tr="O que te aconteceu ontem?"),
    FE(["De","zon","is","al","onderggaan."], 4, "ondergegaan.", "Separável: onder-ge-gaan.", ["v-scheidbaar"]),
    LI("Mijn ouders komen volgende week uit Portugal over.", ["Mijn ouders komen volgende week uit Portugal over"], "Os meus pais vêm de Portugal na próxima semana.", "óverkomen separável.", ["v-scheidbaar"]),
  ], diff=5, mins=6)

L(27, "Falsos amigos", "Valse vrienden voor Portugezen.",
  ["Evitar falsos amigos entre português e neerlandês"],
  vocab=[X("v-valse-vriend","valse vriend","falso amigo")],
  ex=[("«Actueel» betekent «atual», niet «real».","«Actueel» significa «atual», não «real»."),("«Eventueel» betekent «possivelmente, se for o caso».","«Eventueel» significa «possivelmente, se for o caso».")],
  review=["v-actueel"],
  cefr=C, exs=[
    MA([("valse vriend","falso amigo"),("eventueel","eventualmente|se necessário"),("actueel","atual"),("pretentieus","pretensioso")], "Falsos amigos.", ["v-valse-vriend","v-valse-vriend","v-actueel","v-valse-vriend"]),
    MC("«Ik bel u eventueel morgen» significa…", ["*talvez lhe ligue amanhã, se for preciso","certamente ligo amanhã|Não.","liguei ontem|Não."], "eventueel.", ["v-valse-vriend"]),
    MC("«Hij is erg sympathiek» significa…", ["*é muito simpático (igual ao PT)","é muito triste|Não.","é muito caro|Não."], "Amigo verdadeiro.", ["v-valse-vriend"]),
    MC("«Ik ben constipé»? Em NL «verstopt» (pelo nariz) é…", ["*ter o nariz entupido (ou prisão de ventre noutro contexto)","ter uma constipação (gripe)|Use «verkouden».","estar cansado|Não."], "Cuidado!", ["v-valse-vriend"]),
    TR("pt-nl","Estou constipado (gripe).", ["Ik ben verkouden"], "verkouden.", ["v-valse-vriend"]),
    FB("Ik heb een ___: mijn neus loopt. (constipação)", ["verkoudheid"], "Constipação.", ["v-valse-vriend"], choices=["verkoudheid","constipatie","griep"], tr="Tenho uma constipação: o nariz está a pingar."),
    FE(["Ik","ben","erg","constipé","en","mijn","neus","loopt."], 3, "verkouden", "Falso amigo: verkouden.", ["v-valse-vriend"]),
    LI("Valse vrienden zijn woorden die op elkaar lijken maar iets anders betekenen.", ["Valse vrienden zijn woorden die op elkaar lijken maar iets anders betekenen","Valse vrienden zijn woorden die op elkaar lijken, maar iets anders betekenen"], "Falsos amigos são palavras parecidas que significam outra coisa.", "Definição.", ["v-valse-vriend"]),
  ], diff=4, mins=5)

L(28, "Erros típicos de lusófonos", "Typische fouten.",
  ["Reconhecer e corrigir erros frequentes de falantes de português"],
  vocab=[N("v-typische-fout","typische fout","erro típico","de","typische fouten")],
  ex=[("Een typische fout is «Ik heb 30 jaren» in plaats van «Ik ben 30 jaar».","Um erro típico é «Ik heb 30 jaren» em vez de «Ik ben 30 jaar»."),("Portugezen zeggen soms «ik ben akkoord» in plaats van «ik ga akkoord».","Os portugueses às vezes dizem «ik ben akkoord» em vez de «ik ga akkoord».")],
  review=["v-verbeterpunt-gram","v-moedertaal"],
  cefr=C, exs=[
    MA([("typische fout","erro típico"),("grammaticale fout","erro gramatical"),("moedertaal","língua materna")], "Erros.", ["v-typische-fout","v-verbeterpunt-gram","v-moedertaal"]),
    FE(["Ik","heb","dertig","jaar."], 1, "ben", "Idade: zijn.", ["v-typische-fout"]),
    FE(["Ik","ben","akkoord","met","je","voorstel."], 1, "ga", "akkoord gaan met.", ["v-typische-fout"]),
    FE(["Ik","heb","zin","van","pizza."], 3, "in", "zin hebben in.", ["v-typische-fout"]),
    FE(["Het","hangt","af","van","de","weer."], 5, "het", "het weer.", ["v-typische-fout"]),
    MC("«Ik ben zeker» (como «estou certo») é…", ["*possível, mas o natural é «Ik weet het zeker»","sempre correto|Nem sempre natural.","um insulto|Não."], "Naturalidade.", ["v-typische-fout"]),
    MC("«Ik heb gelijk» significa…", ["*tenho razão","sou igual|Literal.","tenho direito|Não."], "Expressão.", ["v-typische-fout"]),
    LI("Iedereen maakt fouten; daar leer je van.", ["Iedereen maakt fouten; daar leer je van","Iedereen maakt fouten, daar leer je van"], "Toda a gente comete erros; aprende-se com eles.", "Perspetiva.", ["v-typische-fout"]),
  ], diff=4, mins=5)

L(29, "Teste gramatical integrado", "Alles door elkaar.",
  ["Aplicar toda a gramática num teste misto"],
  vocab=[X("v-grammaticaal-sterk","grammaticaal sterk","gramaticalmente sólido","adjective")],
  ex=[("Je Nederlands is grammaticaal sterk geworden.","O teu neerlandês ficou gramaticalmente sólido.")],
  review=["v-zinsdeel","v-werkwoordsvolgorde","v-hulpwerkwoord","v-buigen","v-tijdsvoorzetsel","v-verwijzend-voornaamwoord","v-scheidbaar","v-typische-fout"],
  cefr=C, exs=[
    MC("Qual é a ordem correta?", ["*Gisteren heb ik mijn fiets laten repareren.","Gisteren ik heb mijn fiets laten repareren.|V2.","Gisteren heb ik mijn fiets repareren gelaten.|Duplo infinitivo."], "V2 + laten.", ["v-zinsdeel"]),
    FB("Ze ___ vorig jaar naar Gent verhuisd.", ["is"], "verhuizen: zijn.", ["v-hulpwerkwoord"], choices=["is","heeft","werd"], tr="Ela mudou-se para Gent no ano passado."),
    FB("Dat is een erg ___ verhaal. (interessant)", ["interessant"], "het verhaal + een → sem -e.", ["v-buigen"], choices=["interessant","interessante","interessants"], tr="É uma história muito interessante."),
    FB("De trein vertrekt ___ tien minuten.", ["over"], "Daqui a: over.", ["v-tijdsvoorzetsel"], choices=["over","in","na"], tr="O comboio parte daqui a dez minutos."),
    FE(["Waar","is","de","sleutel?","Het","ligt","op","tafel."], 4, "Hij", "de sleutel → hij.", ["v-verwijzend-voornaamwoord"]),
    FE(["De","zon","is","om","zeven","uur","ondergaan."], 6, "ondergegaan.", "Separável: ondergegaan.", ["v-scheidbaar"]),
    FE(["Ik","heb","vijfendertig","jaar","en","woon","in","Breda."], 1, "ben", "Idade: zijn.", ["v-typische-fout"]),
    TR("pt-nl","O teu neerlandês ficou gramaticalmente sólido.", ["Je Nederlands is grammaticaal sterk geworden","Jouw Nederlands is grammaticaal sterk geworden"], "worden.", ["v-grammaticaal-sterk"]),
  ], diff=5, mins=7)

W()
