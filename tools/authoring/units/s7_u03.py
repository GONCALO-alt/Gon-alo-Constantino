import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u03")
C = "B2"

L(1, "Prender a atenção do público", "Stelt u zich eens voor… Wist u dat…?",
  ["Começar uma apresentação de forma envolvente"],
  vocab=[V("v-stelt-u-zich-voor","stelt u zich eens voor","imagine","expression"), V("v-publiek","publiek","público","noun","het"),
         V("v-boeien","boeien","cativar","verb"), V("v-pakkend","pakkend","cativante","adjective")],
  ex=[("Stelt u zich eens voor: een stad zonder auto's.","Imagine: uma cidade sem carros."),("Wist u dat we 30 procent van ons voedsel weggooien?","Sabia que deitamos fora 30 por cento da nossa comida?"),("Een pakkende opening boeit het publiek.","Uma abertura cativante prende o público."),("Ik begin met een korte anekdote.","Começo com um pequeno episódio.")],
  review=["v-aandacht-trekken","v-anekdote","v-retorische-vraag","v-presentatie"],
  cefr=C, exs=[
    MA([("stelt u zich eens voor","imagine"),("publiek","público"),("boeien","cativar"),("pakkend","cativante")], "Abertura.", ["v-stelt-u-zich-voor","v-publiek","v-boeien","v-pakkend"]),
    TR("pt-nl","Imagine: uma cidade sem carros.", ["Stelt u zich eens voor(:) een stad zonder auto's","Stel je eens voor(:) een stad zonder auto's"], "zich voorstellen.", ["v-stelt-u-zich-voor"]),
    TR("nl-pt","Een pakkende opening boeit het publiek.", ["Uma abertura cativante prende o público","Uma abertura cativante cativa o público"], "pakkend/boeien.", ["v-pakkend","v-boeien"]),
    AR("publiek","o público","het", "Het publiek.", ["v-publiek"]),
    MC("Qual abertura é mais cativante?", ["*Wist u dat een gemiddelde Nederlander 900 kilometer per jaar fietst?","Mijn presentatie gaat over fietsen.|Neutra.","Ik ben een beetje zenuwachtig.|Fraca."], "Facto surpreendente.", ["v-pakkend"]),
    FE(["Stelt","u","zich","eens","op","een","stad","zonder","auto's."], 4, "voor", "zich voorstellen: Stelt u zich eens voor…", ["v-stelt-u-zich-voor"]),
    LI("Stel je eens voor dat je nooit meer in de file staat.", ["Stel je eens voor dat je nooit meer in de file staat"], "Imagina que nunca mais estás numa fila de trânsito.", "zich voorstellen.", ["v-stelt-u-zich-voor"]),
    FB("Een goede spreker weet het publiek te ___.", ["boeien"], "Cativar.", ["v-boeien"], choices=["boeien","geboeid","boeit"], tr="Um bom orador sabe cativar o público."),
    WO("Sabia que deitamos fora 30 por cento da comida?", ["Wist","u","dat","we","30","procent","van","ons","voedsel","weggooien?"], "dat + verbo no fim.", ["v-pakkend"]),
    SW("Escreva a abertura (2–3 frases) de uma apresentação sobre o desperdício alimentar usando «Stelt u zich eens voor» ou «Wist u dat».", ["Wist u dat elke Nederlander per jaar tientallen kilo's eten weggooit? Stelt u zich eens voor hoeveel geld dat is. Vandaag laat ik zien hoe we dat kunnen veranderen."], ["Abertura com pergunta ou imaginação", "Ligação ao tema", "Anúncio do objetivo"], 35, "Abertura cativante.", ["v-stelt-u-zich-voor","v-pakkend"]),
    MC("O que deve evitar na abertura?", ["*Pedir desculpa por estar nervoso ou mal preparado","Uma pergunta ao público|Boa técnica.","Um facto surpreendente|Boa técnica."], "Confiança.", ["v-boeien"]),
  ], diff=5, mins=7)

L(2, "Transições e sinais", "Dan kom ik nu bij… Dit brengt me bij… Samenvattend…",
  ["Usar sinais de transição para guiar o público"],
  vocab=[V("v-dit-brengt-me-bij","dit brengt me bij","isto leva-me a","expression"), V("v-ik-kom-nu-bij","dan kom ik nu bij","passo agora a","expression"),
         V("v-zoals-gezegd","zoals gezegd","como foi dito","expression"), V("v-ter-afsluiting","ter afsluiting","para terminar","expression")],
  ex=[("Dan kom ik nu bij het tweede punt.","Passo agora ao segundo ponto."),("Dit brengt me bij de kosten.","Isto leva-me aos custos."),("Zoals gezegd is de tijd beperkt.","Como foi dito, o tempo é limitado."),("Ter afsluiting nog één opmerking.","Para terminar, mais uma observação.")],
  review=["v-ten-eerste","v-samenvattend","v-afronden"],
  cefr=C, exs=[
    MA([("dit brengt me bij","isto leva-me a"),("dan kom ik nu bij","passo agora a"),("zoals gezegd","como foi dito"),("ter afsluiting","para terminar")], "Transições.", ["v-dit-brengt-me-bij","v-ik-kom-nu-bij","v-zoals-gezegd","v-ter-afsluiting"]),
    TR("pt-nl","Passo agora ao segundo ponto.", ["Dan kom ik nu bij het tweede punt","Ik kom nu bij het tweede punt"], "komen bij.", ["v-ik-kom-nu-bij"]),
    TR("pt-nl","Isto leva-me aos custos.", ["Dit brengt me bij de kosten","Dit brengt mij bij de kosten"], "brengen bij.", ["v-dit-brengt-me-bij"]),
    TR("nl-pt","Zoals gezegd is de tijd beperkt.", ["Como foi dito, o tempo é limitado","Como já disse, o tempo é limitado"], "zoals gezegd + inversão.", ["v-zoals-gezegd"]),
    MC("Qual é a ordem correta?", ["*Zoals gezegd is de tijd beperkt.","Zoals gezegd de tijd is beperkt.|Inversão: Zoals gezegd is de tijd beperkt."], "Inversão: Zoals gezegd is de tijd beperkt.", ["v-zoals-gezegd"]),
    MC("Qual frase anuncia o fim?", ["*Ter afsluiting nog één opmerking.","Dan kom ik nu bij punt twee.|Transição intermédia.","Zoals gezegd…|Retoma."], "Fecho.", ["v-ter-afsluiting"]),
    LI("Dit brengt me bij het laatste punt van vandaag.", ["Dit brengt me bij het laatste punt van vandaag","Dit brengt mij bij het laatste punt van vandaag"], "Isto leva-me ao último ponto de hoje.", "brengen bij.", ["v-dit-brengt-me-bij"]),
    FB("___ afsluiting wil ik iedereen bedanken.", ["Ter"], "Expressão.", ["v-ter-afsluiting"], choices=["Ter","Tot","Voor"], tr="Para terminar quero agradecer a todos."),
    WO("Passo agora ao segundo ponto.", ["Dan","kom","ik","nu","bij","het","tweede","punt"], "Inversão.", ["v-ik-kom-nu-bij"]),
    SW("Escreva três transições para uma apresentação com 3 partes (problema, solução, custos).", ["Laten we beginnen met het probleem. … Dit brengt me bij de oplossing. … Dan kom ik nu bij de kosten. … Ter afsluiting nog een korte samenvatting."], ["Início", "Duas transições", "Fecho"], 25, "Sinalizar a estrutura.", ["v-dit-brengt-me-bij","v-ik-kom-nu-bij"]),
  ], diff=5, mins=7)

L(3, "Perguntas difíceis", "Dat is een terechte vraag. Daar kan ik nu geen antwoord op geven.",
  ["Responder a perguntas difíceis ou críticas com profissionalismo"],
  vocab=[V("v-terecht","terecht","pertinente|justo","adjective"), V("v-kritische-vraag","kritische vraag","pergunta crítica","noun","de"),
         V("v-buiten-scope","dat valt buiten…","isso fica fora de…","expression")],
  ex=[("Dat is een terechte vraag.","É uma pergunta pertinente."),("Daar kan ik nu geen antwoord op geven.","Não lhe consigo responder agora."),("Dat valt buiten het onderwerp van vandaag.","Isso fica fora do tema de hoje."),("Het eerlijke antwoord is: dat weten we nog niet.","A resposta sincera é: ainda não sabemos.")],
  review=["v-eerlijk-antwoord","v-goede-vraag","v-uitzoeken","v-kritisch"],
  cefr=C, exs=[
    MA([("terecht","pertinente"),("kritische vraag","pergunta crítica"),("dat valt buiten…","fica fora de…"),("eerlijk antwoord","resposta sincera")], "Perguntas difíceis.", ["v-terecht","v-kritische-vraag","v-buiten-scope","v-eerlijk-antwoord"]),
    TR("pt-nl","É uma pergunta pertinente.", ["Dat is een terechte vraag","Dat is een goede vraag"], "terechte.", ["v-terecht"]),
    TR("pt-nl","Não lhe consigo responder agora.", ["Daar kan ik nu geen antwoord op geven","Ik kan daar nu geen antwoord op geven"], "antwoord geven op.", ["v-eerlijk-antwoord"]),
    TR("nl-pt","Dat valt buiten het onderwerp van vandaag.", ["Isso fica fora do tema de hoje","Isso está fora do tema de hoje"], "buiten vallen.", ["v-buiten-scope"]),
    MC("Alguém critica: «Uw cijfers kloppen niet.» Melhor resposta:", ["*Dank u voor die kritische vraag. Welke cijfers bedoelt u precies? Dan kijk ik het na.","Jawel, ze kloppen wel!|Defensivo.","Volgende vraag.|Evasivo."], "Profissional.", ["v-kritische-vraag"]),
    FE(["Daar","kan","ik","nu","geen","antwoord","aan","geven."], 6, "op", "antwoord geven op → daar … op.", ["v-eerlijk-antwoord"]),
    DL([("Publiek","Waarom is het project zo veel duurder geworden?","Porque é que o projeto ficou tão mais caro?"),("Spreker","")], ["*Dat is een terechte vraag. De materiaalkosten zijn met 20 procent gestegen; ik laat u straks de details zien.","Dat zeg ik niet.|Evasivo.","Dat is een domme vraag.|Rude."], "Reconhecer e responder.", ["v-terecht"]),
    LI("Het eerlijke antwoord is dat we het nog niet weten.", ["Het eerlijke antwoord is dat we het nog niet weten"], "A resposta sincera é que ainda não sabemos.", "eerlijk.", ["v-eerlijk-antwoord"]),
    FB("Uw kritiek is ___: we hadden u eerder moeten informeren.", ["terecht"], "Justa.", ["v-terecht"], choices=["terecht","onterecht","kritisch"], tr="A sua crítica é justa: devíamos tê-lo informado mais cedo."),
    MC("«Onterecht» significa…", ["*injusto/infundado","pertinente|Ao contrário.","urgente|Não."], "Antónimo.", ["v-terecht"]),
  ], diff=5, mins=7)

L(4, "Pitch: convencer em dois minutos", "Het probleem… Onze oplossing… Waarom nu?",
  ["Fazer um pitch curto e convincente"],
  vocab=[V("v-pitch","pitch","apresentação curta de venda","noun","de"), V("v-doelgroep","doelgroep","público-alvo","noun","de"),
         V("v-meerwaarde","meerwaarde","valor acrescentado","noun","de"), V("v-investeren","investeren","investir","verb")],
  ex=[("Onze doelgroep zijn jonge ouders.","O nosso público-alvo são pais jovens."),("Wat is de meerwaarde van uw product?","Qual é o valor acrescentado do seu produto?"),("We zoeken partners die willen investeren.","Procuramos parceiros que queiram investir."),("Ik heb twee minuten voor mijn pitch.","Tenho dois minutos para o meu pitch.")],
  review=["v-probleem","v-oplossing","v-overtuigen"],
  cefr=C, exs=[
    MA([("pitch","apresentação de venda"),("doelgroep","público-alvo"),("meerwaarde","valor acrescentado"),("investeren","investir")], "Pitch.", ["v-pitch","v-doelgroep","v-meerwaarde","v-investeren"]),
    TR("pt-nl","Qual é o valor acrescentado do seu produto?", ["Wat is de meerwaarde van uw product","Wat is de toegevoegde waarde van uw product"], "meerwaarde.", ["v-meerwaarde"]),
    TR("nl-pt","Onze doelgroep zijn jonge ouders.", ["O nosso público-alvo são pais jovens"], "doelgroep.", ["v-doelgroep"]),
    AR("doelgroep","o público-alvo","de", "De groep.", ["v-doelgroep"]),
    MC("Estrutura típica de um pitch:", ["*probleem → oplossing → meerwaarde → vraag (call to action)","prijs → naam → einde|Incompleto.","eigen leven → hobby's|Fora do tema."], "Estrutura.", ["v-pitch"]),
    CO("text","Pitch: FietsFix", "Elke dag staan duizenden Nederlanders met een lekke band. Een fietsenmaker is vaak dicht of te ver weg. Daarom hebben wij FietsFix bedacht: een app waarmee je binnen een uur een monteur aan huis krijgt. Onze doelgroep zijn forenzen en studenten. De meerwaarde? Je verliest geen tijd en je betaalt een vaste prijs. We zoeken nu partners die willen investeren om naar tien steden uit te breiden.",
       [("Qual é o problema?", ["*Pneus furados e oficinas fechadas ou longe","Bicicletas caras","Falta de ciclovias"]),("O que oferece a app?", ["*Um mecânico em casa dentro de uma hora","Bicicletas novas","Seguros"]),("O que pedem no fim?", ["*Investidores para expandir para dez cidades","Clientes para testar","Um desconto"])],
       "lekke band = pneu furado; forens = quem se desloca para o trabalho.", ["v-pitch","v-doelgroep","v-meerwaarde"]),
    MC("Qual é a ordem correta?", ["*We zoeken partners die in ons willen investeren.","We zoeken partners die investeren willen in ons.|Verbos juntos no fim: die in ons willen investeren."], "Verbos juntos no fim: die in ons willen investeren.", ["v-investeren"]),
    LI("Met uw investering kunnen we naar tien steden uitbreiden.", ["Met uw investering kunnen we naar tien steden uitbreiden"], "Com o seu investimento podemos expandir para dez cidades.", "investering.", ["v-investeren"]),
    FB("Wie is de ___ van jullie product?", ["doelgroep"], "Público-alvo.", ["v-doelgroep"], choices=["doelgroep","meerwaarde","pitch"], tr="Quem é o público-alvo do vosso produto?"),
    SW("Escreva um pitch de 4–5 frases para uma ideia sua (problema, solução, público-alvo, valor acrescentado, pedido).", ["Veel nieuwkomers vinden het moeilijk om Nederlands te oefenen. Onze oplossing is een app die je koppelt aan een buurtgenoot voor een wekelijkse wandeling. Onze doelgroep zijn expats en gepensioneerden. De meerwaarde is dat je niet alleen de taal leert, maar ook mensen leert kennen. We zoeken gemeenten die willen meedoen aan een proef."], ["Problema", "Solução", "**doelgroep**", "**meerwaarde**", "Pedido final"], 60, "Pitch completo.", ["v-pitch","v-doelgroep","v-meerwaarde"]),
  ], diff=5, mins=8)

L(5, "Apresentações online", "Kunnen jullie mijn scherm zien? Je staat op mute.",
  ["Gerir uma apresentação ou reunião online"],
  vocab=[V("v-scherm-delen","je scherm delen","partilhar o ecrã","expression"), V("v-chat","chat","chat","noun","de")],
  ex=[("Kunnen jullie mijn scherm zien?","Conseguem ver o meu ecrã?"),("Je staat nog op mute.","Ainda tens o microfone desligado."),("Je beeld hapert een beetje.","A tua imagem está a falhar um pouco."),("Zet je vragen gerust in de chat.","Ponham as vossas perguntas no chat à vontade.")],
  review=["v-dempen","v-haperen","v-verbinding","v-wegvallen","v-presentatie"],
  cefr=C, exs=[
    MA([("je scherm delen","partilhar o ecrã"),("dempen","silenciar"),("haperen","falhar"),("chat","chat")], "Online.", ["v-scherm-delen","v-dempen","v-haperen","v-chat"]),
    TR("pt-nl","Conseguem ver o meu ecrã?", ["Kunnen jullie mijn scherm zien","Kunnen jullie mijn scherm zien(?)"], "scherm.", ["v-scherm-delen"]),
    TR("pt-nl","Ainda tens o microfone desligado.", ["Je staat nog op mute","Je staat nog op stil","Je microfoon staat nog uit"], "op mute staan.", ["v-dempen"]),
    TR("nl-pt","Je beeld hapert een beetje.", ["A tua imagem está a falhar um pouco","A tua imagem está a engasgar um bocado"], "haperen.", ["v-haperen"]),
    MC("Começa a falar mas ninguém o ouve. Um colega escreve: «Je staat op mute!» Deve…", ["*ligar o microfone","desligar a câmara|Não resolve.","sair da reunião|Não."], "Mute.", ["v-dempen"]),
    FE(["Ik","deel","nu","mijn","scherm","met","jullie,","kunnen","jullie","het","ziet?"], 10, "zien", "Depois de kunnen: infinitivo zien.", ["v-scherm-delen"]),
    LI("Zet je vragen gerust in de chat, dan kom ik er straks op terug.", ["Zet je vragen gerust in de chat(,) dan kom ik er straks op terug"], "Ponham as perguntas no chat, depois volto a elas.", "chat.", ["v-chat"]),
    DL([("Collega","Ik zie alleen een zwart scherm.","Só vejo um ecrã preto."),("Rui","")], ["*O, sorry, ik deel mijn scherm opnieuw. Zien jullie het nu?","Ik zie het wel.|Não resolve.","Je bent zwart.|Sem sentido."], "Resolver o problema.", ["v-scherm-delen"]),
    FB("Je verbinding is slecht, je beeld ___.", ["hapert"], "Falhar.", ["v-haperen"], choices=["hapert","demt","deelt"], tr="A tua ligação está má, a imagem está a falhar."),
    WO("Ponham as perguntas no chat à vontade.", ["Zet","je","vragen","gerust","in","de","chat"], "Imperativo.", ["v-chat"]),
  ], diff=5, mins=7)

W()
