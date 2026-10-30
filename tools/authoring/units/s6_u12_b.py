import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u12")
C = "B1-B2"
# Lições de aprofundamento (10–25): a voz passiva em contexto.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Quem fez? O agente com door", "Hij werd door de politie bekeurd.",
  ["Usar a passiva com agente (door)"],
  vocab=[X("v-bekeuren","bekeuren","multar","verb"), X("v-bekeurd-worden","bekeurd worden","ser multado","verb")],
  ex=[("Hij werd door de politie bekeurd.","Ele foi multado pela polícia."),("Ik ben gisteren bekeurd voor fietsen zonder licht.","Ontem fui multado por andar de bicicleta sem luz."),("Het schilderij werd door Vermeer gemaakt.","O quadro foi feito por Vermeer.")],
  review=["v-door-agent","v-lijdende-vorm","v-werd"],
  cefr=C, exs=[
    MA([("bekeuren","multar"),("bekeurd worden","ser multado"),("door (agente)","por (agente)"),("lijdende vorm","voz passiva")], "Passiva.", ["v-bekeuren","v-bekeurd-worden","v-door-agent","v-lijdende-vorm"]),
    MC("Ativa: «De politie bekeurde hem.» Passiva:", ["*Hij werd door de politie bekeurd.","Hij bekeurde door de politie.|Não é passiva.","Hij is de politie bekeurd.|Falta «door»."], "Transformar.", ["v-door-agent"]),
    TR("pt-nl","Ele foi multado pela polícia.", ["Hij werd door de politie bekeurd","Hij is door de politie bekeurd"], "door.", ["v-bekeurd-worden"]),
    TR("pt-nl","Fui multado por andar sem luz.", ["Ik ben bekeurd voor fietsen zonder licht","Ik werd bekeurd voor fietsen zonder licht","Ik heb een boete gekregen voor fietsen zonder licht"], "bekeurd voor.", ["v-bekeurd-worden"]),
    FB("Het schilderij werd ___ Vermeer gemaakt.", ["door"], "Agente.", ["v-door-agent"], choices=["door","van","met"], tr="O quadro foi feito por Vermeer."),
    FE(["Hij","werd","van","de","politie","bekeurd."], 2, "door", "Agente: door.", ["v-door-agent"]),
    LI("Fietsers worden vaak bekeurd voor door rood rijden.", ["Fietsers worden vaak bekeurd voor door rood rijden"], "Os ciclistas são muitas vezes multados por passarem no vermelho.", "Uso.", ["v-bekeurd-worden"]),
    MC("Na passiva, o agente com «door» é…", ["*opcional: só se diz se for importante","obrigatório|Não.","proibido|Não."], "Regra.", ["v-door-agent"]),
    WO("Ele foi multado.", ["Hij","werd","bekeurd"], "Ordem.", ["v-bekeurd-worden"]),
  ], diff=4, mins=5)

L(11, "Obras e renovações", "Het station wordt verbouwd.",
  ["Falar de obras com a passiva no presente e no perfeito"],
  vocab=[X("v-verbouwen","verbouwen","remodelar|fazer obras em","verb"), X("v-renoveren","renoveren","renovar","verb")],
  ex=[("Het station wordt verbouwd.","A estação está em obras."),("Onze keuken is vorig jaar gerenoveerd.","A nossa cozinha foi renovada no ano passado."),("Het museum werd in 2013 heropend.","O museu foi reaberto em 2013.")],
  review=["v-gebouwd","v-bouwen","v-geopend"],
  cefr=C, exs=[
    MA([("verbouwen","remodelar"),("renoveren","renovar"),("gebouwd","construído"),("geopend","aberto (inaugurado)")], "Obras.", ["v-verbouwen","v-renoveren","v-gebouwd","v-geopend"]),
    MC("«Het station wordt verbouwd» descreve…", ["*algo em curso agora","algo terminado|Isso seria «is verbouwd».","algo futuro|Não."], "Presente = em curso.", ["v-verbouwen"]),
    TR("pt-nl","A estação está em obras.", ["Het station wordt verbouwd"], "wordt + particípio.", ["v-verbouwen"]),
    TR("pt-nl","A cozinha foi renovada no ano passado.", ["De keuken is vorig jaar gerenoveerd","De keuken werd vorig jaar gerenoveerd"], "is/werd + particípio.", ["v-renoveren"]),
    CJ("verbouwen","het huis","Het huis is vorig jaar helemaal ___.", ["verbouwd"], "ver- sem ge-.", ["v-verbouwen"], tense="passado-perfeito"),
    FE(["Het","huis","wordt","geverbouwd."], 3, "verbouwd.", "Verbos com ver- não levam ge-.", ["v-verbouwen"]),
    LI("Tijdens de verbouwing is de ingang aan de achterkant.", ["Tijdens de verbouwing is de ingang aan de achterkant"], "Durante as obras, a entrada é pelas traseiras.", "Aviso.", ["v-verbouwen"]),
    DL([("Buurman","Wat is dat lawaai?","Que barulho é este?"),("Jij","","")], ["*De badkamer van nummer 5 wordt verbouwd. Het duurt nog twee weken.","Ik verbouw.|Não é o caso.","Gerenoveerd.|Incompleto."], "Explicar.", ["v-verbouwen"]),
    WO("A estação está em obras.", ["Het","station","wordt","verbouwd"], "Ordem.", ["v-verbouwen"]),
  ], diff=4, mins=5)

L(12, "Passiva no futuro", "Het park zal feestelijk worden geopend.",
  ["Usar a passiva com zullen e gaan"],
  vocab=[X("v-feestelijk-geopend","feestelijk geopend worden","ser inaugurado (com festa)"), X("v-zal-worden","zal worden + particípio","será …")],
  ex=[("Het nieuwe park zal in mei feestelijk worden geopend.","O novo parque será inaugurado em maio."),("De brug gaat volgend jaar vervangen worden.","A ponte vai ser substituída no próximo ano."),("De winnaar wordt morgen bekendgemaakt.","O vencedor é anunciado amanhã.")],
  review=["v-moet-worden","v-kan-worden"],
  cefr=C, exs=[
    MA([("feestelijk geopend worden","ser inaugurado"),("zal worden + particípio","será…"),("moet … worden","tem de ser…"),("kan … worden","pode ser…")], "Futuro passivo.", ["v-feestelijk-geopend","v-zal-worden","v-moet-worden","v-kan-worden"]),
    TR("pt-nl","O parque será inaugurado em maio.", ["Het park zal in mei worden geopend","Het park wordt in mei geopend","Het park zal in mei geopend worden"], "zal worden.", ["v-zal-worden"]),
    TR("pt-nl","O vencedor é anunciado amanhã.", ["De winnaar wordt morgen bekendgemaakt"], "Presente com sentido futuro.", ["v-zal-worden"]),
    MC("Ordem no fim: «zal worden geopend» ou «zal geopend worden»?", ["*Ambas são corretas","Só a primeira|Não.","Só a segunda|Não."], "Duas ordens.", ["v-zal-worden"]),
    FB("De brug ___ volgend jaar vervangen worden.", ["gaat"], "gaan + passiva.", ["v-zal-worden"], choices=["gaat","wordt","is"], tr="A ponte vai ser substituída no próximo ano."),
    FE(["Het","park","zal","in","mei","geopend","werden."], 6, "worden.", "Infinitivo: worden.", ["v-zal-worden"]),
    LI("Het nieuwe zwembad wordt zaterdag door de burgemeester geopend.", ["Het nieuwe zwembad wordt zaterdag door de burgemeester geopend"], "A nova piscina é inaugurada no sábado pelo presidente da câmara.", "Notícia.", ["v-feestelijk-geopend"]),
    DL([("Collega","Wanneer gaat de nieuwe kantine open?","Quando abre a nova cantina?"),("Jij","","")], ["*Die zal na de zomer feestelijk worden geopend.","Die opent zich.|Errado.","Geopend worden.|Incompleto."], "Informar.", ["v-feestelijk-geopend"]),
    WO("Será inaugurado em maio.", ["Het","wordt","in","mei","geopend"], "Ordem.", ["v-zal-worden"]),
  ], diff=4, mins=5)

L(13, "Passiva em avisos", "Fout geparkeerde fietsen worden verwijderd.",
  ["Perceber avisos públicos na voz passiva"],
  vocab=[X("v-verwijderen","verwijderen","remover","verb"), X("v-worden-weggesleept","worden weggesleept","ser rebocado")],
  ex=[("Fout geparkeerde fietsen worden verwijderd.","As bicicletas mal estacionadas são removidas."),("Auto's zonder vergunning worden weggesleept.","Os carros sem licença são rebocados."),("Hier wordt niet gerookt.","Aqui não se fuma.")],
  review=["v-wegslepen","v-mag-niet-worden","v-er-wordt"],
  cefr=C, exs=[
    MA([("verwijderen","remover"),("worden weggesleept","ser rebocado"),("mag niet … worden","não pode ser…"),("er wordt…","(impessoal)")], "Avisos.", ["v-verwijderen","v-worden-weggesleept","v-mag-niet-worden","v-er-wordt"]),
    MC("Aviso: «Fietsen worden verwijderd» significa…", ["*As bicicletas (aqui) serão retiradas","Bicicletas à venda|Não.","Estacionamento de bicicletas|Não."], "Aviso.", ["v-verwijderen"]),
    TR("pt-nl","Os carros sem licença são rebocados.", ["Auto's zonder vergunning worden weggesleept"], "worden + particípio.", ["v-worden-weggesleept"]),
    TR("pt-nl","As bicicletas mal estacionadas são removidas.", ["Fout geparkeerde fietsen worden verwijderd"], "Aviso.", ["v-verwijderen"]),
    FB("Deze deur mag niet ___ geblokkeerd.", ["worden"], "Modal + passiva.", ["v-mag-niet-worden"], choices=["worden","zijn","werden"], tr="Esta porta não pode ser bloqueada."),
    FE(["Fietsen","wordt","hier","verwijderd."], 1, "worden", "Plural: worden.", ["v-verwijderen"]),
    MC("Aviso num comboio: «Er wordt gecontroleerd.» Significa…", ["*Há revisão de bilhetes","Proibido controlar|Não.","Comboio fora de controlo|Não."], "Impessoal.", ["v-er-wordt"]),
    LI("Achtergelaten bagage wordt verwijderd en kan worden vernietigd.", ["Achtergelaten bagage wordt verwijderd en kan worden vernietigd"], "A bagagem abandonada é removida e pode ser destruída.", "Aviso de estação.", ["v-verwijderen"]),
    WO("As bicicletas são removidas.", ["Fietsen","worden","verwijderd"], "Ordem.", ["v-verwijderen"]),
  ], diff=4, mins=5)

L(14, "Processos e receitas", "Het deeg wordt gekneed.",
  ["Descrever processos com a passiva"],
  vocab=[X("v-kneden","kneden","amassar (massa)","verb"), X("v-verwerken","verwerken","processar|transformar","verb")],
  ex=[("Het deeg wordt tien minuten gekneed.","A massa é amassada durante dez minutos."),("De melk wordt in de fabriek verwerkt tot kaas.","O leite é transformado em queijo na fábrica."),("Daarna worden de kazen gepekeld.","Depois os queijos são postos em salmoura.")],
  review=["v-gemaakt-worden"],
  cefr=C, exs=[
    MA([("kneden","amassar"),("verwerken","processar"),("gemaakt worden","ser feito"),("lijdende vorm","voz passiva")], "Processos.", ["v-kneden","v-verwerken","v-gemaakt-worden","v-lijdende-vorm"]),
    CO("text","Hoe wordt Goudse kaas gemaakt?","Eerst wordt de melk verwarmd en wordt er stremsel toegevoegd. De melk wordt dik en wordt in stukjes gesneden. De wrongel wordt daarna in vormen geperst. Vervolgens worden de kazen een paar dagen in pekel gelegd. Ten slotte rijpen ze weken tot jaren.",
       [("O que se faz primeiro?", ["*Aquece-se o leite","Põe-se em salmoura","Corta-se"]),("Onde se prensa a coalhada?", ["*Em formas","Em sacos","Em barris"]),("Quanto tempo amadurecem?", ["*Semanas a anos","Uma hora","Um dia"])],
       "Processo descrito na passiva.", ["v-verwerken"]),
    TR("pt-nl","A massa é amassada durante dez minutos.", ["Het deeg wordt tien minuten gekneed","Het deeg wordt 10 minuten gekneed"], "kneden → gekneed.", ["v-kneden"]),
    TR("pt-nl","O leite é transformado em queijo.", ["De melk wordt verwerkt tot kaas","De melk wordt tot kaas verwerkt"], "verwerken tot.", ["v-verwerken"]),
    CJ("kneden","het deeg","Het deeg wordt goed ___.", ["gekneed"], "d → -d.", ["v-kneden"], tense="passado-perfeito"),
    FE(["Het","deeg","wordt","geknede."], 3, "gekneed.", "Particípio: gekneed.", ["v-kneden"]),
    SW("Descreva em 4–5 frases na passiva como se faz um prato ou produto que conhece (pão, café, vinho…).", ["Eerst worden de druiven geplukt. Daarna worden ze geperst. Het sap wordt in vaten bewaard. Na een paar maanden wordt de wijn in flessen gedaan."], ["Passiva","Sequência (eerst, daarna…)"], 35, "Processo.", ["v-verwerken"]),
    LI("Daarna worden de kazen in pekel gelegd.", ["Daarna worden de kazen in pekel gelegd"], "Depois os queijos são postos em salmoura.", "Processo.", ["v-verwerken"]),
    WO("O pão é cozido no forno.", ["Het","brood","wordt","in","de","oven","gebakken"], "Ordem.", ["v-gemaakt-worden"]),
  ], diff=4, mins=6)

L(15, "Passiva nas notícias", "Er is een man aangehouden.",
  ["Perceber notícias curtas escritas na passiva"],
  vocab=[X("v-overgebracht","naar het ziekenhuis overgebracht","levado para o hospital"), X("v-gewond-raken-pass","lichtgewond","ferido ligeiro","adjective")],
  ex=[("Bij het ongeluk is een fietser lichtgewond geraakt.","No acidente um ciclista ficou ligeiramente ferido."),("Hij is naar het ziekenhuis overgebracht.","Foi levado para o hospital."),("Er is een verdachte aangehouden.","Foi detido um suspeito.")],
  review=["v-aangehouden","v-gewond-raken","v-verdachte"],
  cefr=C, exs=[
    MA([("naar het ziekenhuis overgebracht","levado para o hospital"),("lichtgewond","ferido ligeiro"),("aangehouden","detido"),("verdachte","suspeito")], "Notícias.", ["v-overgebracht","v-gewond-raken-pass","v-aangehouden","v-verdachte"]),
    CO("text","Nieuwsbericht (fictief)","Gisteravond is op de Croeselaan in Utrecht een fietser aangereden door een bestelbus. De fietser is lichtgewond naar het ziekenhuis overgebracht. De bestuurder van de bus is aangehouden. De politie zoekt getuigen.",
       [("O que aconteceu?", ["*Um ciclista foi atropelado","Um assalto","Um incêndio"]),("Estado do ciclista?", ["*Ferido ligeiro","Grave","Ileso"]),("O que procura a polícia?", ["*Testemunhas","O ciclista","A carrinha"])],
       "Notícia (fictícia).", ["v-overgebracht","v-gewond-raken-pass"]),
    TR("pt-nl","Foi detido um suspeito.", ["Er is een verdachte aangehouden","Een verdachte is aangehouden"], "Er is … aangehouden.", ["v-aangehouden"]),
    TR("pt-nl","Foi levado para o hospital.", ["Hij is naar het ziekenhuis overgebracht","Hij werd naar het ziekenhuis overgebracht","Hij is naar het ziekenhuis gebracht"], "overgebracht.", ["v-overgebracht"]),
    FB("De fietser is ___ naar het ziekenhuis overgebracht.", ["lichtgewond"], "Ferido ligeiro.", ["v-gewond-raken-pass"], choices=["lichtgewond","gewond raken","aangehouden"], tr="O ciclista foi levado para o hospital com ferimentos ligeiros."),
    FE(["Er","zijn","een","verdachte","aangehouden."], 1, "is", "Singular: is.", ["v-aangehouden"]),
    MC("Porque é que as notícias usam tanto a passiva?", ["*O foco está no que aconteceu, não em quem fez","Porque é obrigatório|Não.","Para esconder factos|Não necessariamente."], "Função.", ["v-lijdende-vorm"]),
    LI("Niemand raakte ernstig gewond.", ["Niemand raakte ernstig gewond"], "Ninguém ficou gravemente ferido.", "Notícia.", ["v-gewond-raken"]),
  ], diff=4, mins=6)

L(16, "Passiva com krijgen", "Ik kreeg een boete opgelegd.",
  ["Usar krijgen + particípio como passiva do recetor"],
  vocab=[X("v-krijgen-passief","krijgen + particípio","receber (passiva do recetor)"), X("v-te-horen-krijgen","te horen krijgen","ficar a saber|ouvir (notícia)")],
  ex=[("Ik kreeg een boete opgelegd.","Foi-me aplicada uma multa."),("Ze kreeg een nieuwe laptop toegestuurd.","Enviaram-lhe um portátil novo."),("Gisteren kreeg ik te horen dat ik ben aangenomen.","Ontem soube que fui contratado.")],
  review=["v-vergoed-krijgen","v-lijdende-vorm"],
  cefr=C, exs=[
    MA([("krijgen + particípio","receber (passiva)"),("te horen krijgen","ficar a saber"),("vergoed krijgen","ser reembolsado"),("lijdende vorm","passiva")], "Krijgen.", ["v-krijgen-passief","v-te-horen-krijgen","v-vergoed-krijgen","v-lijdende-vorm"]),
    MC("«Ik kreeg een pakket bezorgd» = …", ["*Er werd een pakket bij mij bezorgd.","Ik bezorgde een pakket.|Ativa, sentido oposto.","Ik krijg een pakket.|Tempo diferente."], "Equivalência.", ["v-krijgen-passief"]),
    TR("pt-nl","Foi-me aplicada uma multa.", ["Ik kreeg een boete opgelegd","Ik heb een boete opgelegd gekregen","Ik kreeg een boete"], "krijgen + opgelegd.", ["v-krijgen-passief"]),
    TR("pt-nl","Ontem soube que fui contratado.", ["Gisteren kreeg ik te horen dat ik ben aangenomen","Gisteren hoorde ik dat ik ben aangenomen"], "te horen krijgen.", ["v-te-horen-krijgen"]),
    FB("Ze ___ een nieuwe laptop toegestuurd.", ["kreeg"], "Passado.", ["v-krijgen-passief"], choices=["kreeg","werd","had"], tr="Enviaram-lhe um portátil novo."),
    FE(["Ik","kreeg","te","hoort","dat","de","cursus","vol","is."], 3, "horen", "te + infinitivo.", ["v-te-horen-krijgen"]),
    LI("Krijg ik de reiskosten vergoed?", ["Krijg ik de reiskosten vergoed","Krijg ik de reiskosten vergoed?"], "As despesas de viagem são-me reembolsadas?", "Pergunta útil.", ["v-vergoed-krijgen"]),
    DL([("Vriendin","Hoe ging je sollicitatie?","Como correu a candidatura?"),("Jij","","")], ["*Ik kreeg vanochtend te horen dat ik ben aangenomen!","Ik werd horen.|Errado.","Te horen.|Incompleto."], "Boa notícia.", ["v-te-horen-krijgen"]),
    WO("Recebi uma multa.", ["Ik","kreeg","een","boete","opgelegd"], "Ordem.", ["v-krijgen-passief"]),
  ], diff=5, mins=5)

L(17, "Ativa ou passiva?", "Bedrijvende en lijdende vorm.",
  ["Decidir quando usar a ativa em vez da passiva"],
  vocab=[X("v-bedrijvende-vorm","bedrijvende vorm","voz ativa")],
  ex=[("In een brief aan een klant klinkt de bedrijvende vorm vaak persoonlijker.","Numa carta a um cliente a voz ativa soa muitas vezes mais pessoal."),("«Uw aanvraag is ontvangen» → «Wij hebben uw aanvraag ontvangen.»","«O seu pedido foi recebido» → «Recebemos o seu pedido.»")],
  review=["v-lijdende-vorm","v-begrijpelijke-taal"],
  cefr=C, exs=[
    MA([("bedrijvende vorm","voz ativa"),("lijdende vorm","voz passiva"),("begrijpelijke taal","linguagem clara"),("door (agente)","por (agente)")], "Vozes.", ["v-bedrijvende-vorm","v-lijdende-vorm","v-begrijpelijke-taal","v-door-agent"]),
    MC("Ativa de «Er wordt door ons contact met u opgenomen.»", ["*Wij nemen contact met u op.","U neemt contact op.|Sujeito errado.","Contact wordt opgenomen.|Ainda passiva."], "Transformar.", ["v-bedrijvende-vorm"]),
    MC("Quando é a passiva a melhor escolha?", ["*Quando não se sabe ou não importa quem fez","Sempre em e-mails pessoais|Não.","Nunca|Não."], "Uso.", ["v-lijdende-vorm"]),
    TR("pt-nl","Recebemos o seu pedido.", ["Wij hebben uw aanvraag ontvangen","We hebben uw aanvraag ontvangen"], "Ativa.", ["v-bedrijvende-vorm"]),
    TR("pt-nl","O seu pedido foi recebido.", ["Uw aanvraag is ontvangen","Uw aanvraag werd ontvangen"], "Passiva.", ["v-lijdende-vorm"]),
    FE(["Uw","factuur","worden","binnen","een","week","betaald."], 2, "wordt", "Singular: wordt.", ["v-lijdende-vorm"]),
    SW("Transforme em voz ativa (sujeito «wij»): «Uw klacht is door ons ontvangen. Er zal binnen vijf dagen door een medewerker contact met u worden opgenomen.»", ["Wij hebben uw klacht ontvangen. Een medewerker neemt binnen vijf dagen contact met u op."], ["Voz ativa","Mais curto","Mesmo sentido"], 15, "Reescrever.", ["v-bedrijvende-vorm"]),
    LI("Actieve zinnen zijn meestal korter en duidelijker.", ["Actieve zinnen zijn meestal korter en duidelijker"], "As frases ativas são geralmente mais curtas e claras.", "Dica.", ["v-bedrijvende-vorm"]),
  ], diff=5, mins=5)

L(18, "Estado ou ação: is gesloten / wordt gesloten", "De winkel is gesloten.",
  ["Distinguir estado (zijn) e ação (worden) com particípios"],
  vocab=[X("v-is-gesloten","is gesloten","está fechado (estado)"), X("v-wordt-gesloten","wordt gesloten","é fechado (ação)")],
  ex=[("De winkel is op zondag gesloten.","A loja está fechada ao domingo."),("De winkel wordt om zes uur gesloten.","A loja é fechada às seis."),("De deur is op slot.","A porta está trancada.")],
  review=["v-gesloten","v-geopend"],
  cefr=C, exs=[
    MA([("is gesloten","está fechado"),("wordt gesloten","é fechado"),("gesloten","fechado"),("geopend","aberto")], "Estado/ação.", ["v-is-gesloten","v-wordt-gesloten","v-gesloten","v-geopend"]),
    MC("Placa na porta às 20h: «Gesloten». Significa…", ["*estado: está fechado","ação: alguém está a fechar|Não.","futuro|Não."], "Estado.", ["v-is-gesloten"]),
    MC("«De brug wordt opengedraaid» descreve…", ["*a ação de abrir a ponte (agora)","o estado da ponte aberta|Isso seria «is opengedraaid».","um plano|Não."], "Ação.", ["v-wordt-gesloten"]),
    TR("pt-nl","A loja está fechada ao domingo.", ["De winkel is op zondag gesloten","De winkel is zondag gesloten","Op zondag is de winkel gesloten"], "Estado.", ["v-is-gesloten"]),
    TR("pt-nl","A loja é fechada às seis.", ["De winkel wordt om zes uur gesloten","De winkel gaat om zes uur dicht"], "Ação.", ["v-wordt-gesloten"]),
    FB("Het museum ___ morgen wegens verbouwing gesloten.", ["is"], "Estado.", ["v-is-gesloten"], choices=["is","wordt","werd"], tr="O museu está fechado amanhã por obras."),
    FE(["Het","raam","wordt","al","de","hele","dag","open."], 2, "is", "Estado durante o dia: is.", ["v-is-gesloten"]),
    LI("De weg wordt vannacht afgesloten en is morgen weer open.", ["De weg wordt vannacht afgesloten en is morgen weer open"], "A estrada é cortada esta noite e amanhã está outra vez aberta.", "Ação e estado.", ["v-wordt-gesloten"]),
    WO("A loja está fechada.", ["De","winkel","is","gesloten"], "Ordem.", ["v-is-gesloten"]),
  ], diff=4, mins=5)

L(19, "Passiva com modal no passado", "Dat had eerder moeten worden gemeld.",
  ["Usar a passiva com modais no passado"],
  vocab=[X("v-had-moeten-worden","had moeten worden + particípio","devia ter sido…"), X("v-kon-worden","kon worden + particípio","podia ser…")],
  ex=[("Dat had eerder moeten worden gemeld.","Isso devia ter sido comunicado mais cedo."),("Het probleem kon snel worden opgelost.","O problema pôde ser resolvido depressa."),("De vergadering moest worden uitgesteld.","A reunião teve de ser adiada.")],
  review=["v-moet-worden","v-had-moeten"],
  cefr=C, exs=[
    MA([("had moeten worden …","devia ter sido…"),("kon worden …","podia ser…"),("moest worden …","teve de ser…"),("moet … worden","tem de ser…")], "Modais.", ["v-had-moeten-worden","v-kon-worden","v-moet-worden","v-had-moeten"]),
    TR("pt-nl","Isso devia ter sido comunicado mais cedo.", ["Dat had eerder moeten worden gemeld","Dat had eerder gemeld moeten worden"], "had moeten worden.", ["v-had-moeten-worden"]),
    TR("pt-nl","A reunião teve de ser adiada.", ["De vergadering moest worden uitgesteld","De vergadering moest uitgesteld worden"], "moest worden.", ["v-kon-worden"]),
    MC("«Het had voorkomen kunnen worden» significa…", ["*podia ter sido evitado","foi evitado|Não aconteceu.","vai ser evitado|Não."], "Irreal passado.", ["v-had-moeten-worden"]),
    FB("Het probleem ___ snel worden opgelost.", ["kon"], "Passado de kunnen.", ["v-kon-worden"], choices=["kon","kan","had"], tr="O problema pôde ser resolvido depressa."),
    FE(["Dat","had","eerder","moeten","geworden","gemeld."], 4, "worden", "Infinitivo: worden.", ["v-had-moeten-worden"]),
    LI("Dit ongeluk had voorkomen kunnen worden.", ["Dit ongeluk had voorkomen kunnen worden"], "Este acidente podia ter sido evitado.", "Crítica.", ["v-had-moeten-worden"]),
    DL([("Klant","Waarom hoor ik pas nu dat mijn bestelling vertraagd is?","Porque só agora sei que a encomenda está atrasada?"),("Jij (medewerker)","","")], ["*U heeft gelijk; dat had eerder moeten worden gemeld. Excuses daarvoor.","Dat werd gemeld.|Contraditório.","Moest worden.|Incompleto."], "Assumir.", ["v-had-moeten-worden"]),
    WO("Teve de ser adiada.", ["Het","moest","worden","uitgesteld"], "Ordem.", ["v-kon-worden"]),
  ], diff=5, mins=5)

L(20, "Passiva na história", "Nederland werd in 1945 bevrijd.",
  ["Falar de acontecimentos históricos com a passiva"],
  vocab=[X("v-bezetten","bezetten","ocupar (militarmente)","verb"), X("v-bevrijden","bevrijden","libertar","verb")],
  ex=[("Nederland werd in mei 1940 bezet.","Os Países Baixos foram ocupados em maio de 1940."),("In 1945 werd het land bevrijd.","Em 1945 o país foi libertado."),("Op 5 mei wordt de bevrijding gevierd.","A 5 de maio celebra-se a libertação.")],
  review=["v-werd","v-gebouwd","v-uitgevonden"],
  cefr=C, exs=[
    MA([("bezetten","ocupar"),("bevrijden","libertar"),("werd / werden","foi / foram"),("uitgevonden","inventado")], "História.", ["v-bezetten","v-bevrijden","v-werd","v-uitgevonden"]),
    CO("text","4 en 5 mei","Op 4 mei worden in Nederland de slachtoffers van oorlog herdacht. Om acht uur 's avonds is het overal twee minuten stil. Op 5 mei wordt de bevrijding gevierd met festivals in het hele land. In 1945 werd Nederland bevrijd na vijf jaar bezetting.",
       [("O que acontece a 4 de maio?", ["*Homenagem às vítimas da guerra","Festa da libertação","Dia do Rei"]),("O que se faz às 20h?", ["*Dois minutos de silêncio","Fogo de artifício","Desfile"]),("Quantos anos durou a ocupação?", ["*Cinco","Dois","Dez"])],
       "Cultura e história.", ["v-bevrijden","v-bezetten"]),
    TR("pt-nl","Em 1945 o país foi libertado.", ["In 1945 werd het land bevrijd","Het land werd in 1945 bevrijd"], "werd + particípio.", ["v-bevrijden"]),
    TR("pt-nl","A libertação é celebrada a 5 de maio.", ["De bevrijding wordt op 5 mei gevierd","Op 5 mei wordt de bevrijding gevierd"], "Passiva.", ["v-bevrijden"]),
    FB("Nederland werd in mei 1940 ___.", ["bezet"], "Particípio de bezetten (sem ge-).", ["v-bezetten"], choices=["bezet","gebezet","bezetten"], tr="Os Países Baixos foram ocupados em maio de 1940."),
    FE(["Het","land","werd","in","1945","gebevrijd."], 5, "bevrijd.", "be- sem ge-.", ["v-bevrijden"]),
    LI("Op 4 mei worden de slachtoffers herdacht.", ["Op 4 mei worden de slachtoffers herdacht","Op vier mei worden de slachtoffers herdacht"], "A 4 de maio as vítimas são homenageadas.", "Cultura.", ["v-bevrijden"]),
    MC("Prefixos sem «ge-» no particípio:", ["*be-, ge-, her-, ont-, ver-, er-","in-, uit-, op-|Esses são separáveis e levam ge-.","todos|Não."], "Regra.", ["v-bezetten"]),
  ], diff=4, mins=6)

L(21, "Instruções técnicas", "Het apparaat moet worden uitgeschakeld.",
  ["Perceber instruções de manuais na passiva"],
  vocab=[X("v-uitschakelen","uitschakelen","desligar (aparelho)","verb"), X("v-worden-aangesloten","worden aangesloten","ser ligado (à corrente/rede)")],
  ex=[("Het apparaat moet na gebruik worden uitgeschakeld.","O aparelho deve ser desligado após utilização."),("De printer moet op het netwerk worden aangesloten.","A impressora deve ser ligada à rede."),("Schakel de stroom uit voordat u begint.","Desligue a corrente antes de começar.")],
  review=["v-inschakelen","v-apparaat"],
  cefr=C, exs=[
    MA([("uitschakelen","desligar"),("inschakelen","ligar"),("worden aangesloten","ser ligado à rede"),("apparaat","aparelho")], "Técnico.", ["v-uitschakelen","v-inschakelen","v-worden-aangesloten","v-apparaat"]),
    MC("«Uitschakelen» é mais formal do que…", ["*uitzetten","inschakelen|É o contrário.","aansluiten|Outro sentido."], "Registo.", ["v-uitschakelen"]),
    TR("pt-nl","O aparelho deve ser desligado após utilização.", ["Het apparaat moet na gebruik worden uitgeschakeld","Het apparaat moet na gebruik uitgeschakeld worden"], "Passiva com modal.", ["v-uitschakelen"]),
    TR("pt-nl","Desligue a corrente antes de começar.", ["Schakel de stroom uit voordat u begint","Schakel de stroom uit voor u begint"], "Imperativo.", ["v-uitschakelen"]),
    FB("De printer moet op het netwerk worden ___.", ["aangesloten"], "Particípio.", ["v-worden-aangesloten"], choices=["aangesloten","aansluiten","geaansloten"], tr="A impressora deve ser ligada à rede."),
    FE(["Het","apparaat","moet","worden","uitgeschakelt."], 4, "uitgeschakeld.", "l → -d.", ["v-uitschakelen"]),
    CO("text","Handleiding (fragment)","Veiligheid: het apparaat mag niet worden gebruikt in de badkamer. Voordat het apparaat wordt schoongemaakt, moet de stekker uit het stopcontact worden gehaald. Het apparaat mag alleen door een erkende monteur worden gerepareerd.",
       [("Onde não se pode usar?", ["*Na casa de banho","Na cozinha","Na sala"]),("Antes de limpar…", ["*Tirar a ficha da tomada","Ligar o aparelho","Molhar"]),("Quem pode reparar?", ["*Um técnico certificado","Qualquer pessoa","O dono"])],
       "Manual na passiva.", ["v-uitschakelen","v-apparaat"]),
    LI("Het apparaat schakelt zichzelf na tien minuten uit.", ["Het apparaat schakelt zichzelf na tien minuten uit","Het apparaat schakelt zichzelf na 10 minuten uit"], "O aparelho desliga-se sozinho ao fim de dez minutos.", "Uso.", ["v-uitschakelen"]),
  ], diff=4, mins=6)

L(22, "Expectativas: er wordt van je verwacht", "Er wordt van je verwacht dat je op tijd bent.",
  ["Falar de regras e expectativas na passiva impessoal"],
  vocab=[X("v-er-wordt-verwacht","er wordt van je verwacht dat…","espera-se de ti que…"), X("v-geacht-worden","geacht worden te","supostamente dever (formal)")],
  ex=[("Er wordt van je verwacht dat je op tijd bent.","Espera-se de ti que sejas pontual."),("Medewerkers worden geacht hun e-mail dagelijks te lezen.","Os funcionários devem ler o e-mail diariamente."),("Wat wordt er van mij verwacht?","O que se espera de mim?")],
  review=["v-verwachtingen","v-er-wordt"],
  cefr=C, exs=[
    MA([("er wordt van je verwacht dat…","espera-se de ti que…"),("geacht worden te","dever (formal)"),("verwachtingen","expectativas"),("er wordt…","impessoal")], "Expectativas.", ["v-er-wordt-verwacht","v-geacht-worden","v-verwachtingen","v-er-wordt"]),
    TR("pt-nl","O que se espera de mim?", ["Wat wordt er van mij verwacht","Wat wordt er van mij verwacht?","Wat wordt er van me verwacht"], "Pergunta útil num emprego novo.", ["v-er-wordt-verwacht"]),
    TR("pt-nl","Espera-se de ti que sejas pontual.", ["Er wordt van je verwacht dat je op tijd bent","Er wordt verwacht dat je op tijd bent"], "Impessoal.", ["v-er-wordt-verwacht"]),
    MC("«U wordt geacht om 9.00 uur aanwezig te zijn» significa…", ["*deve estar presente às 9h","é estimado às 9h|Literal errado.","pode faltar|Não."], "Formal.", ["v-geacht-worden"]),
    FB("Medewerkers worden ___ hun badge altijd te dragen.", ["geacht"], "Formal.", ["v-geacht-worden"], choices=["geacht","verwacht","gedacht"], tr="Os funcionários devem usar sempre o cartão."),
    FE(["Er","worden","van","je","verwacht","dat","je","meedenkt."], 1, "wordt", "Impessoal: wordt.", ["v-er-wordt-verwacht"]),
    DL([("Nieuwe collega","Wat wordt er eigenlijk van mij verwacht in de eerste week?","Afinal, o que se espera de mim na primeira semana?"),("Jij","","")], ["*Vooral kennismaken en meelopen. Er wordt niet verwacht dat je meteen alles weet.","Alles.|Assustador e vago.","Geacht.|Incompleto."], "Acolher.", ["v-er-wordt-verwacht"]),
    LI("In Nederland wordt van je verwacht dat je je mening geeft.", ["In Nederland wordt van je verwacht dat je je mening geeft"], "Nos Países Baixos espera-se que dês a tua opinião.", "Cultura (tendência geral).", ["v-er-wordt-verwacht"]),
  ], diff=5, mins=5)

L(23, "Te + infinitivo com sentido passivo", "Dat is niet te doen!",
  ["Usar zijn + te + infinitivo com sentido passivo"],
  vocab=[X("v-niet-te-doen","dat is niet te doen","não se consegue fazer|é impossível"), X("v-valt-te-bezien","dat valt te bezien","isso está para se ver")],
  ex=[("Al dat werk in één dag? Dat is niet te doen!","Todo esse trabalho num dia? É impossível!"),("Of het lukt, valt nog te bezien.","Se vai resultar, ainda está para se ver."),("Dit huis is te koop.","Esta casa está à venda.")],
  review=["v-te-koop","v-niet-te-geloven"],
  cefr=C, exs=[
    MA([("dat is niet te doen","é impossível"),("dat valt te bezien","está para se ver"),("te koop","à venda"),("niet te geloven","inacreditável")], "Zijn + te.", ["v-niet-te-doen","v-valt-te-bezien","v-te-koop","v-niet-te-geloven"]),
    MC("«Dit is goed te doen» significa…", ["*isto faz-se bem (é exequível)","isto foi feito|Não.","tens de fazer isto|Não."], "Sentido passivo.", ["v-niet-te-doen"]),
    MC("«Het boek is overal te krijgen» = …", ["*O livro arranja-se em todo o lado","O livro tem de ser recebido|Não.","O livro está esgotado|Não."], "Sentido passivo.", ["v-niet-te-doen"]),
    TR("pt-nl","É impossível!", ["Dat is niet te doen","Dat is niet te doen!","Dat is onmogelijk"], "Expressão.", ["v-niet-te-doen"]),
    TR("nl-pt","Of het lukt, valt nog te bezien.", ["Se vai resultar, ainda está para se ver","Ainda não se sabe se resulta"], "Expressão.", ["v-valt-te-bezien"]),
    FB("Of hij komt, valt nog te ___.", ["bezien"], "Expressão.", ["v-valt-te-bezien"], choices=["bezien","zien","doen"], tr="Se ele vem, ainda está para se ver."),
    FE(["Dit","huis","is","te","kopen."], 4, "koop.", "Expressão fixa: te koop.", ["v-te-koop"]),
    LI("Met de fiets is het centrum goed te bereiken.", ["Met de fiets is het centrum goed te bereiken"], "De bicicleta o centro é de fácil acesso.", "Sentido passivo.", ["v-niet-te-doen"]),
    WO("É impossível.", ["Dat","is","niet","te","doen"], "Ordem.", ["v-niet-te-doen"]),
  ], diff=5, mins=5)

L(24, "Particípio ou -end?", "Verbaasd of verbazend?",
  ["Distinguir quem sente (particípio) e o que causa (-end)"],
  vocab=[X("v-verbazend","verbazend","surpreendente","adjective"), X("v-vermoeiend","vermoeiend","cansativo","adjective")],
  ex=[("Ik was verbaasd.","Fiquei surpreendido."),("Het resultaat was verbazend.","O resultado foi surpreendente."),("Een vermoeiende dag maakt je moe.","Um dia cansativo deixa-te cansado.")],
  review=["v-verbaasd","v-teleurstellend","v-teleurgesteld"],
  gram=[G("g-deelwoord-end","Particípio vs. -end","O **particípio** descreve quem **sente**: *Ik ben **verbaasd**/**teleurgesteld**.* O **particípio presente (-end)** descreve **o que causa** o sentimento: *Het nieuws is **verbazend**/**teleurstellend**.* Como em português: *surpreendido* vs. *surpreendente*.",
    [("Ik ben verveeld. / Het is vervelend.","Estou aborrecido. / É aborrecido."),("Ze was geïnteresseerd. / Het was interessant.","Ela estava interessada. / Era interessante.")])],
  cefr=C, exs=[
    MA([("verbaasd","surpreendido"),("verbazend","surpreendente"),("teleurgesteld","desiludido"),("teleurstellend","dececionante")], "Pares.", ["v-verbaasd","v-verbazend","v-teleurgesteld","v-teleurstellend"]),
    MC("«O jogo foi dececionante»:", ["*De wedstrijd was teleurstellend.","De wedstrijd was teleurgesteld.|O jogo não sente.","De wedstrijd teleurstelde.|Não."], "Causa.", ["v-teleurstellend"]),
    MC("«Fiquei surpreendido»:", ["*Ik was verbaasd.","Ik was verbazend.|Significaria «eu era surpreendente».","Ik verbaasde.|Incompleto."], "Pessoa.", ["v-verbaasd"]),
    TR("pt-nl","Foi um dia cansativo.", ["Het was een vermoeiende dag"], "-end + e.", ["v-vermoeiend"]),
    TR("pt-nl","O resultado foi surpreendente.", ["Het resultaat was verbazend","Het resultaat was verrassend"], "verbazend.", ["v-verbazend"]),
    FB("Na die ___ reis was ik doodmoe.", ["vermoeiende"], "de reis → -e.", ["v-vermoeiend"], choices=["vermoeiende","vermoeid","vermoeiend"], tr="Depois daquela viagem cansativa estava morto de cansaço."),
    FE(["Ik","was","erg","verbazend","over","de","prijs."], 3, "verbaasd", "Pessoa que sente: verbaasd.", ["v-verbaasd"]),
    LI("Het was verbazend hoe snel ze Nederlands leerde.", ["Het was verbazend hoe snel ze Nederlands leerde"], "Foi surpreendente a rapidez com que aprendeu neerlandês.", "Uso.", ["v-verbazend"]),
    WO("Fiquei desiludido.", ["Ik","was","teleurgesteld"], "Ordem.", ["v-teleurgesteld"]),
  ], diff=4, mins=5)

L(25, "Prática: escrever uma notícia", "Nieuws in de lijdende vorm.",
  ["Escrever uma notícia curta usando a passiva"],
  vocab=[X("v-kort-bericht","een kort bericht","uma notícia breve")],
  ex=[("Schrijf een kort bericht voor de buurtkrant.","Escreve uma notícia breve para o jornal do bairro.")],
  review=["v-bekeurd-worden","v-verbouwen","v-zal-worden","v-verwijderen","v-overgebracht","v-krijgen-passief","v-is-gesloten","v-bevrijden"],
  cefr=C, exs=[
    MA([("bekeurd worden","ser multado"),("verbouwen","remodelar"),("verwijderen","remover"),("overgebracht","levado")], "Revisão.", ["v-bekeurd-worden","v-verbouwen","v-verwijderen","v-overgebracht"]),
    CO("text","Buurtkrant (fictief)","Het buurthuis in de Lindenstraat wordt deze zomer verbouwd. Tijdens de verbouwing is het gebouw gesloten. De activiteiten worden tijdelijk verplaatst naar de school. Het vernieuwde buurthuis zal in oktober feestelijk worden geopend door de wethouder. Bewoners worden uitgenodigd om ideeën in te sturen.",
       [("O que vai acontecer?", ["*O centro comunitário vai ter obras","Vai fechar para sempre","Vai mudar de rua"]),("Para onde vão as atividades?", ["*Para a escola","Para a igreja","Cancelam-se"]),("Quando reabre?", ["*Em outubro","Em julho","No inverno"])],
       "Notícia na passiva.", ["v-verbouwen","v-zal-worden","v-is-gesloten"]),
    MC("No texto, «Het gebouw is gesloten» descreve…", ["*um estado","uma ação em curso|Não.","um passado distante|Não."], "Revisão.", ["v-is-gesloten"]),
    FE(["Het","buurthuis","word","deze","zomer","verbouwd."], 2, "wordt", "Singular: wordt.", ["v-verbouwen"]),
    TR("pt-nl","Escreve uma notícia breve.", ["Schrijf een kort bericht","Schrijf een kort nieuwsbericht"], "kort bericht.", ["v-kort-bericht"]),
    SW("Escreva uma notícia breve (5–6 frases) para o jornal do seu bairro (real ou inventada). Use pelo menos quatro frases na passiva (presente, passado, futuro, com modal).", ["Afgelopen zaterdag is in het park een nieuwe speeltuin geopend. De speeltuin werd gebouwd met geld van de gemeente. Er werden ook twintig bomen geplant. Volgend jaar zal er een kiosk worden geplaatst. Bewoners worden gevraagd de speeltuin schoon te houden."], ["4+ frases passivas","Tempos variados","Estilo de notícia"], 50, "Notícia.", ["v-kort-bericht"]),
  ], diff=5, mins=7)

W()
