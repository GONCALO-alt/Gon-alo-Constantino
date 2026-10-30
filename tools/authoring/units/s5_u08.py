import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u08")
C = "B1"

L(1, "Contar uma viagem com detalhe", "We hadden… Het viel tegen / mee.",
  ["Contar uma viagem com avaliações e detalhes"],
  vocab=[V("v-meevallen","meevallen","correr melhor do que esperado","verb",note="Het viel mee."), V("v-tegenvallen","tegenvallen","desiludir|ficar aquém","verb",note="Het hotel viel tegen."),
         V("v-indrukwekkend","indrukwekkend","impressionante","adjective")],
  ex=[("Het weer viel mee.","O tempo afinal foi melhor do que esperávamos."),("Het hotel viel een beetje tegen.","O hotel desiludiu um bocado."),("De bergen waren indrukwekkend.","As montanhas eram impressionantes."),("We hebben een mooi dorpje ontdekt.","Descobrimos uma aldeiazinha bonita.")],
  gram=[G("g-meevallen-tegenvallen","Meevallen / tegenvallen","Verbos muito úteis para avaliar: **meevallen** = ser melhor do que se esperava; **tegenvallen** = ser pior do que se esperava. São separáveis e usam **zijn** no perfectum: *Het is meegevallen.* Muitas vezes com *het*: *Het valt mee!* (Não é assim tão mau!)",
    [("Het examen viel mee.","O exame foi mais fácil do que esperava."),("De prijs viel tegen.","O preço foi uma desilusão.")],
    "Não há equivalente direto em português — usamos «afinal», «não foi tão mau», «desiludiu».")],
  review=["v-ontdekken","v-vakantie","v-reizen","v-uitzicht","v-bezocht"],
  cefr=C, exs=[
    MA([("meevallen","melhor do que esperado"),("tegenvallen","desiludir"),("indrukwekkend","impressionante"),("ontdekken","descobrir")], "Avaliar.", ["v-meevallen","v-tegenvallen","v-indrukwekkend","v-ontdekken"]),
    TR("nl-pt","Het weer viel mee.", ["O tempo afinal foi [bom|melhor do que esperado|melhor do que esperávamos]","Afinal o tempo não foi mau"], "meevallen.", ["v-meevallen"]),
    TR("nl-pt","Het hotel viel een beetje tegen.", ["O hotel desiludiu um bocado","O hotel foi uma pequena desilusão","O hotel ficou um pouco aquém"], "tegenvallen.", ["v-tegenvallen"]),
    MC("Esperava um exame difícil, mas foi fácil. Diz…", ["*Het viel mee!","Het viel tegen!|É o contrário.","Het viel!|Incompleto."], "meevallen.", ["v-meevallen"]),
    MC("O restaurante era caro e mau. Diz…", ["*Het restaurant viel tegen.","Het restaurant viel mee.|É o contrário.","Het restaurant was indrukwekkend.|Positivo."], "tegenvallen.", ["v-tegenvallen"]),
    FE(["Het","examen","heeft","meegevallen."], 2, "is", "meevallen usa zijn: Het is meegevallen.", ["v-meevallen"]),
    TR("pt-nl","Descobrimos uma aldeiazinha bonita.", ["We hebben een mooi dorpje ontdekt","Wij hebben een mooi dorpje ontdekt"], "ontdekken → ontdekt.", ["v-ontdekken"]),
    LI("De bergen in Oostenrijk waren indrukwekkend.", ["De bergen in Oostenrijk waren indrukwekkend"], "As montanhas na Áustria eram impressionantes.", "indrukwekkend.", ["v-indrukwekkend"]),
    FB("Ik dacht dat het druk zou zijn, maar het viel ___.", ["mee"], "Melhor do que esperado.", ["v-meevallen"], choices=["mee","tegen","uit"], tr="Pensei que ia estar cheio, mas afinal não estava assim tanto."),
    SW("Conte uma viagem (3 frases): para onde, algo que «viel mee» e algo que «viel tegen».", ["Vorige zomer zijn we naar Kreta geweest. Het eten viel erg mee, het was heerlijk. Het hotel viel wel tegen: de kamer was klein en lawaaierig."], ["Perfectum para o facto", "**meevallen** e **tegenvallen**", "Pormenor descritivo"], 25, "Relato avaliativo.", ["v-meevallen","v-tegenvallen"]),
  ], diff=4, mins=7)

L(2, "Imprevistos em viagem", "Mijn koffer is zoek. De vlucht is geannuleerd.",
  ["Lidar com problemas em viagem"],
  vocab=[V("v-zoek","zoek","desaparecido","adjective",note="Mijn koffer is zoek."), V("v-geannuleerd","geannuleerd","cancelado","adjective"),
         V("v-omboeken","omboeken","remarcar (viagem)","verb"), V("v-schadevergoeding","schadevergoeding","indemnização","noun","de")],
  ex=[("Mijn koffer is zoek.","A minha mala desapareceu."),("Onze vlucht is geannuleerd.","O nosso voo foi cancelado."),("Kunt u mij omboeken naar de volgende vlucht?","Pode passar-me para o próximo voo?"),("Heb ik recht op schadevergoeding?","Tenho direito a indemnização?")],
  review=["v-vlucht","v-koffer","v-vertraging","v-bagage"],
  cefr=C, exs=[
    MA([("zoek","desaparecido"),("geannuleerd","cancelado"),("omboeken","remarcar"),("schadevergoeding","indemnização")], "Imprevistos.", ["v-zoek","v-geannuleerd","v-omboeken","v-schadevergoeding"]),
    TR("pt-nl","A minha mala desapareceu.", ["Mijn koffer is zoek","Mijn koffer is kwijt","Mijn koffer is weg"], "zoek/kwijt.", ["v-zoek"]),
    TR("pt-nl","O nosso voo foi cancelado.", ["Onze vlucht is geannuleerd"], "geannuleerd.", ["v-geannuleerd"]),
    TR("nl-pt","Heb ik recht op schadevergoeding?", ["Tenho direito a indemnização","Tenho direito a uma indemnização"], "recht op.", ["v-schadevergoeding"]),
    WO("Pode passar-me para o próximo voo?", ["Kunt","u","mij","omboeken","naar","de","volgende","vlucht?"], "omboeken naar.", ["v-omboeken"]),
    FE(["Ik","heb","recht","van","schadevergoeding."], 3, "op", "recht hebben op.", ["v-schadevergoeding"]),
    DL([("Balie","Uw vlucht naar Lissabon is helaas geannuleerd.","Infelizmente o seu voo para Lisboa foi cancelado."),("Pedro","")], ["*Kunt u mij omboeken naar de eerstvolgende vlucht?","Gefeliciteerd!|Inadequado.","Mijn koffer is zoek.|Outro problema."], "Pedir alternativa.", ["v-omboeken"]),
    LI("Uw bagage wordt morgen naar uw hotel gebracht.", ["Uw bagage wordt morgen naar uw hotel gebracht"], "A sua bagagem será levada amanhã para o seu hotel.", "Passiva.", ["v-bagage"]),
    MC("Na UE, com um voo muito atrasado, pode ter direito a…", ["*schadevergoeding (indemnização)","een gratis koffer|Não.","een nieuw paspoort|Não."], "Direitos dos passageiros.", ["v-schadevergoeding"]),
    FB("Mijn ___ is zoek; ik heb alleen mijn handbagage.", ["koffer"], "Mala.", ["v-koffer"], choices=["koffer","vlucht","gate"], tr="A minha mala desapareceu; só tenho a bagagem de mão."),
  ], diff=4, mins=7)

L(3, "Comparar culturas", "Wat me opviel… In Portugal is het gebruikelijk dat…",
  ["Comentar diferenças culturais com tato"],
  vocab=[V("v-opvallen","opvallen","dar nas vistas|chamar a atenção","verb",note="Wat me opviel, was…"), V("v-gebruikelijk","gebruikelijk","habitual","adjective"),
         V("v-verschil","verschil","diferença","noun","het","verschillen"), V("v-wennen","wennen (aan)","habituar-se (a)","verb")],
  ex=[("Wat me opviel, was dat iedereen fietst.","O que me chamou a atenção foi que toda a gente anda de bicicleta."),("In Portugal is het gebruikelijk om laat te eten.","Em Portugal é habitual jantar tarde."),("Het grootste verschil is het eten.","A maior diferença é a comida."),("Ik moest wennen aan het weer.","Tive de me habituar ao tempo.")],
  review=["v-terwijl","v-in-tegenstelling-tot","v-gewoonte"],
  cefr=C, exs=[
    MA([("opvallen","chamar a atenção"),("gebruikelijk","habitual"),("verschil","diferença"),("wennen aan","habituar-se a")], "Culturas.", ["v-opvallen","v-gebruikelijk","v-verschil","v-wennen"]),
    WO("O que me chamou a atenção foi que toda a gente anda de bicicleta.", ["Wat","me","opviel,","was","dat","iedereen","fietst"], "Wat me opviel, was dat…", ["v-opvallen"]),
    TR("pt-nl","Tive de me habituar ao tempo.", ["Ik moest wennen aan het weer","Ik moest aan het weer wennen"], "wennen aan.", ["v-wennen"]),
    TR("nl-pt","In Portugal is het gebruikelijk om laat te eten.", ["Em Portugal é habitual [jantar|comer] tarde"], "gebruikelijk.", ["v-gebruikelijk"]),
    AR("verschil","a diferença","het", "Het verschil.", ["v-verschil"]),
    FB("Ben je al ___ aan het Nederlandse eten?", ["gewend"], "Particípio de wennen (adjetivo).", ["v-wennen"], choices=["gewend","gewent","wennen"], tr="Já te habituaste à comida neerlandesa?"),
    FE(["Ik","ben","nog","niet","gewend","op","het","weer."], 5, "aan", "gewend aan.", ["v-wennen"]),
    LI("Het grootste verschil is de manier van communiceren.", ["Het grootste verschil is de manier van communiceren"], "A maior diferença é a forma de comunicar.", "verschil.", ["v-verschil"]),
    CO("text","Een Portugese in Groningen", "Wat Marta het eerst opviel in Groningen, was dat iedereen om zes uur eet. In Portugal is het gebruikelijk om pas om negen uur te eten. Ze moest ook wennen aan de directheid: haar collega's zeiden gewoon wat ze van haar werk vonden. Nu waardeert ze dat juist. Het grootste verschil vindt ze het weer: 'Ik mis de zon!'",
       [("O que estranhou primeiro?", ["*Jantar às seis","A língua","As bicicletas"]),("O que pensa agora da franqueza?", ["*Até a valoriza","Continua a detestá-la","Não percebe"]),("Do que tem mais saudades?", ["*Do sol","Da família","Do café"])],
       "waarderen = valorizar; missen = ter saudades.", ["v-opvallen","v-wennen","v-verschil"]),
    SW("Escreva 3 frases sobre diferenças entre Portugal e os Países Baixos (use «wat me opviel» e «wennen aan»).", ["Wat me opviel, was dat winkels om zes uur dichtgaan. Ik moest ook wennen aan het brood bij de lunch. Het grootste verschil is het weer."], ["**Wat me opviel, was dat…**", "**wennen aan**", "**verschil** ou comparação"], 25, "Diferenças culturais.", ["v-opvallen","v-wennen"]),
  ], diff=4, mins=8)

L(4, "Alojamento e reservas", "Airbnb, een jeugdherberg, ontbijt inbegrepen, annuleringsvoorwaarden",
  ["Comparar alojamentos e compreender condições de reserva"],
  vocab=[V("v-jeugdherberg","jeugdherberg","pousada de juventude","noun","de"), V("v-annuleringsvoorwaarden","annuleringsvoorwaarden","condições de cancelamento","noun","de"),
         V("v-kosteloos","kosteloos","sem custos|grátis","adjective"), V("v-beoordeling","beoordeling","avaliação (review)","noun","de")],
  ex=[("Annuleren is tot 48 uur van tevoren kosteloos.","Cancelar é grátis até 48 horas antes."),("De jeugdherberg heeft goede beoordelingen.","A pousada de juventude tem boas avaliações."),("Is het ontbijt inbegrepen?","O pequeno-almoço está incluído?"),("Lees eerst de annuleringsvoorwaarden.","Lê primeiro as condições de cancelamento.")],
  review=["v-reserveren","v-inbegrepen","v-hotel","v-tweepersoonskamer"],
  cefr=C, exs=[
    MA([("jeugdherberg","pousada de juventude"),("annuleringsvoorwaarden","condições de cancelamento"),("kosteloos","sem custos"),("beoordeling","avaliação")], "Alojamento.", ["v-jeugdherberg","v-annuleringsvoorwaarden","v-kosteloos","v-beoordeling"]),
    TR("nl-pt","Annuleren is tot 48 uur van tevoren kosteloos.", ["Cancelar é [grátis|gratuito|sem custos] até 48 horas antes"], "van tevoren = antes.", ["v-kosteloos"]),
    TR("pt-nl","O pequeno-almoço está incluído?", ["Is het ontbijt inbegrepen","Is ontbijt inbegrepen"], "inbegrepen.", ["v-inbegrepen"]),
    MC("Reserva «niet-restitueerbaar» significa…", ["*não reembolsável","grátis|Não.","com pequeno-almoço|Não."], "restitueren = reembolsar.", ["v-annuleringsvoorwaarden"]),
    AR("beoordeling","a avaliação","de", "-ing → de.", ["v-beoordeling"]),
    CO("text","Twee opties", "Optie A: Hotel Centrum – € 120 per nacht, ontbijt inbegrepen, gratis annuleren tot 24 uur van tevoren. Beoordeling: 8,1.\nOptie B: Appartement aan zee – € 95 per nacht, zonder ontbijt, niet-restitueerbaar. Beoordeling: 9,0.",
       [("Qual inclui pequeno-almoço?", ["*A","B","Nenhuma"]),("Qual tem melhor avaliação?", ["*B","A","São iguais"]),("Qual pode cancelar sem custos?", ["*A, até 24 horas antes","B","Nenhuma"])],
       "Compare preço, condições e avaliação.", ["v-annuleringsvoorwaarden","v-beoordeling"]),
    FE(["Het","ontbijt","is","niet","inbegrijpen."], 4, "inbegrepen", "Particípio: inbegrepen.", ["v-inbegrepen"]),
    LI("Ik schrijf altijd een beoordeling na mijn verblijf.", ["Ik schrijf altijd een beoordeling na mijn verblijf"], "Escrevo sempre uma avaliação depois da estadia.", "beoordeling.", ["v-beoordeling"]),
    DL([("Vriendin","Hotel of jeugdherberg?","Hotel ou pousada de juventude?"),("Rui","")], ["*De jeugdherberg is goedkoper en heeft goede beoordelingen.","Ja.|Não escolhe.","Ik ben een hotel.|Não faz sentido."], "Escolher e justificar.", ["v-jeugdherberg","v-beoordeling"]),
    WO("Lê primeiro as condições de cancelamento.", ["Lees","eerst","de","annuleringsvoorwaarden"], "Imperativo.", ["v-annuleringsvoorwaarden"]),
  ], diff=4, mins=7)

L(5, "Recomendar um destino", "Je moet echt naar… gaan! Het is de moeite waard.",
  ["Recomendar lugares e dar dicas de viagem"],
  vocab=[V("v-bezienswaardigheid","bezienswaardigheid","ponto de interesse turístico","noun","de"), V("v-tip","tip","dica","noun","de")],
  ex=[("Sintra is echt de moeite waard.","Sintra vale mesmo a pena."),("Ik raad je het Rijksmuseum aan.","Recomendo-te o Rijksmuseum."),("Wat zijn de belangrijkste bezienswaardigheden?","Quais são os principais pontos de interesse?"),("Heb je nog tips?","Tens mais dicas?")],
  review=["v-de-moeite-waard","v-aanraden","v-echt-moeten","v-museum","v-zeker"],
  cefr=C, exs=[
    MA([("de moeite waard","vale a pena"),("aanraden","recomendar"),("bezienswaardigheid","ponto turístico"),("tip","dica")], "Recomendar.", ["v-de-moeite-waard","v-aanraden","v-bezienswaardigheid","v-tip"]),
    TR("pt-nl","Sintra vale mesmo a pena.", ["Sintra is echt de moeite waard","Sintra is zeker de moeite waard"], "de moeite waard.", ["v-de-moeite-waard"]),
    TR("pt-nl","Recomendo-te o Rijksmuseum.", ["Ik raad je het Rijksmuseum aan","Ik raad jou het Rijksmuseum aan"], "Separável: raad … aan.", ["v-aanraden"]),
    TR("nl-pt","Heb je nog tips?", ["Tens mais dicas","Tens mais alguma dica","Tens outras dicas"], "tips.", ["v-tip"]),
    FE(["Ik","aanraad","je","Porto."], 1, "raad … aan", "Separável: Ik raad je Porto aan.", ["v-aanraden"]),
    AR("bezienswaardigheid","o ponto turístico","de", "-heid → de.", ["v-bezienswaardigheid"]),
    LI("Als je naar Lissabon gaat, moet je echt pasteis de nata proeven.", ["Als je naar Lissabon gaat(,) moet je echt pasteis de nata proeven"], "Se fores a Lisboa, tens mesmo de provar pastéis de nata.", "Recomendação.", ["v-echt-moeten"]),
    DL([("Collega","Ik ga in mei naar Portugal. Heb je tips?","Vou a Portugal em maio. Tens dicas?"),("Joana","")], ["*Ga zeker naar de Douro-vallei, dat is echt de moeite waard!","Ja, ik heb tips.|Não dá nenhuma.","Portugal is een land.|Não ajuda."], "Recomendar concretamente.", ["v-de-moeite-waard"]),
    FB("Welk museum kun je ___?", ["aanraden"], "Recomendar (infinitivo no fim).", ["v-aanraden"], choices=["aanraden","raadt aan","aangeraden"], tr="Que museu recomendas?"),
    SW("Recomende um lugar em Portugal a um amigo neerlandês (3 frases, com «de moeite waard» e «aanraden»).", ["Je moet echt naar de Algarve gaan. De stranden zijn prachtig en het eten is heerlijk. Ik raad je vooral Lagos aan, dat is echt de moeite waard!"], ["Recomendação forte (**je moet echt…**)", "**aanraden** com separação correta", "**de moeite waard**"], 25, "Recomendação de viagem.", ["v-aanraden","v-de-moeite-waard"]),
  ], diff=4, mins=7)

W()
