import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s6-u15")
C = "B1-B2"

L(1, "O texto argumentativo", "Stelling, argumenten, tegenargument, conclusie",
  ["Planear um texto argumentativo completo"],
  vocab=[V("v-betoog","betoog","texto argumentativo","noun","het"), V("v-conclusie","conclusie","conclusão","noun","de"),
         V("v-weerlegging","weerlegging","refutação","noun","de"), V("v-schrijfplan","schrijfplan","plano de escrita","noun","het")],
  ex=[("Een betoog heeft een duidelijke stelling.","Um texto argumentativo tem uma tese clara."),("Maak eerst een schrijfplan.","Faz primeiro um plano de escrita."),("Na het tegenargument volgt de weerlegging.","Depois do contra-argumento vem a refutação."),("De conclusie herhaalt de stelling.","A conclusão retoma a tese.")],
  gram=[G("g-betoog","Estrutura de um betoog","**Inleiding**: tema + **stelling**. **Middenstuk**: 2–3 **argumenten** (cada um num parágrafo, com fundamentação), um **tegenargument** + **weerlegging**. **Slot**: **conclusie** que retoma a tese, eventualmente um apelo.",
    [("Ik ben van mening dat… / Dit betoog laat zien dat…","Sou de opinião que… / Este texto mostra que…")])],
  review=["v-stelling","v-argument","v-tegenargument","v-inleiding","v-slot-tekst"],
  cefr=C, exs=[
    MA([("betoog","texto argumentativo"),("conclusie","conclusão"),("weerlegging","refutação"),("schrijfplan","plano de escrita")], "Betoog.", ["v-betoog","v-conclusie","v-weerlegging","v-schrijfplan"]),
    AR("betoog","o texto argumentativo","het", "Het betoog.", ["v-betoog"]),
    AR("conclusie","a conclusão","de", "De conclusie.", ["v-conclusie"]),
    MC("Ordem certa de um betoog:", ["*stelling → argumenten → tegenargument + weerlegging → conclusie","conclusie → stelling → argumenten|Trocado.","argumenten → stelling → titel|Trocado."], "Estrutura.", ["v-betoog"]),
    TR("pt-nl","Faz primeiro um plano de escrita.", ["Maak eerst een schrijfplan"], "het schrijfplan.", ["v-schrijfplan"]),
    TR("nl-pt","De conclusie herhaalt de stelling.", ["A conclusão retoma a tese","A conclusão repete a tese"], "conclusie.", ["v-conclusie"]),
    TR("pt-nl","Sou de opinião que o centro deve ficar sem carros.", ["Ik ben van mening dat het centrum autovrij moet worden","Ik ben van mening dat het centrum autovrij moet zijn"], "van mening zijn dat.", ["v-stelling"]),
    FE(["Ik","ben","van","mening","dat","het","moet","verboden","worden."], 6, "verboden moet", "Verbos no fim: dat het verboden moet worden.", ["v-betoog"]),
    LI("Uit dit betoog blijkt dat de voordelen groter zijn dan de nadelen.", ["Uit dit betoog blijkt dat de voordelen groter zijn dan de nadelen"], "Este texto mostra que as vantagens são maiores do que as desvantagens.", "Conclusão.", ["v-conclusie"]),
    SW("Faça o schrijfplan (tese + 2 argumentos + 1 contra-argumento com refutação) para «Vliegen moet duurder worden». Pode ser em tópicos em neerlandês.", ["Stelling: vliegen moet duurder worden.\nArgument 1: vliegen veroorzaakt veel CO2-uitstoot.\nArgument 2: de trein wordt dan een betere optie.\nTegenargument: mensen met weinig geld kunnen niet meer op vakantie.\nWeerlegging: met een goed treinnetwerk kun je ook goedkoop reizen."], ["Tese clara", "Dois argumentos", "Contra-argumento + refutação"], 30, "Plano de escrita.", ["v-schrijfplan","v-weerlegging"]),
  ], diff=5, mins=8)

L(2, "Introduções e conclusões fortes", "Openen met een vraag, feit of anekdote.",
  ["Escrever introduções e conclusões eficazes"],
  vocab=[V("v-aandacht-trekken","de aandacht trekken","chamar a atenção","expression"), V("v-anekdote","anekdote","episódio|história curta","noun","de"),
         V("v-retorische-vraag","retorische vraag","pergunta retórica","noun","de"), V("v-oproep","oproep","apelo","noun","de")],
  ex=[("Begin met een feit dat de aandacht trekt.","Começa com um facto que chame a atenção."),("Wie heeft er nooit in de file gestaan?","Quem nunca esteve numa fila de trânsito?"),("Eindig met een oproep aan de lezer.","Termina com um apelo ao leitor."),("Een korte anekdote maakt de tekst levendig.","Um episódio curto torna o texto vivo.")],
  review=["v-inleiding","v-conclusie","v-kortom"],
  cefr=C, exs=[
    MA([("de aandacht trekken","chamar a atenção"),("anekdote","episódio"),("retorische vraag","pergunta retórica"),("oproep","apelo")], "Abrir e fechar.", ["v-aandacht-trekken","v-anekdote","v-retorische-vraag","v-oproep"]),
    MC("Qual é uma abertura com pergunta retórica?", ["*Wie wil er nu niet gezonder leven?","Ik schrijf over gezondheid.|Abertura fraca.","Kortom, gezond leven is belangrijk.|É conclusão."], "Retórica.", ["v-retorische-vraag"]),
    MC("Qual é uma abertura com facto?", ["*Elk jaar gooien Nederlanders 34 kilo voedsel per persoon weg.","Voedsel is lekker.|Banal.","Ik vind voedsel belangrijk.|Opinião."], "Facto.", ["v-aandacht-trekken"]),
    MC("Qual é um bom fecho com apelo?", ["*Gooi daarom vanavond niets weg: kook met wat je hebt!","Dat was mijn tekst.|Fraco.","Ten eerste…|Não é fecho."], "Apelo.", ["v-oproep"]),
    TR("pt-nl","Termina com um apelo ao leitor.", ["Eindig met een oproep aan de lezer","Sluit af met een oproep aan de lezer"], "oproep aan.", ["v-oproep"]),
    TR("nl-pt","Een korte anekdote maakt de tekst levendig.", ["Um episódio curto torna o texto vivo","Uma pequena história torna o texto mais vivo"], "anekdote.", ["v-anekdote"]),
    FE(["Begin","met","een","feit","die","de","aandacht","trekt."], 4, "dat", "het feit → dat.", ["v-dat-rel"]),
    AR("oproep","o apelo","de", "De oproep.", ["v-oproep"]),
    LI("Wie heeft er nooit uren in de file gestaan?", ["Wie heeft er nooit uren in de file gestaan"], "Quem nunca passou horas numa fila de trânsito?", "Pergunta retórica.", ["v-retorische-vraag"]),
    SW("Escreva uma introdução (2–3 frases) e uma conclusão (2 frases) para um texto sobre «Minder vlees eten».", ["Inleiding: Wist je dat de productie van een kilo rundvlees vijftien duizend liter water kost? Steeds meer mensen kiezen daarom voor minder vlees. Ik ben van mening dat we allemaal minder vlees moeten eten.\nSlot: Kortom, minder vlees is beter voor het klimaat én voor je gezondheid. Probeer daarom eens één dag per week vegetarisch te eten!"], ["Introdução com facto ou pergunta + tese", "Conclusão com **kortom** + apelo"], 50, "Abrir e fechar.", ["v-aandacht-trekken","v-oproep"]),
  ], diff=5, mins=8)

L(3, "A carta formal de reclamação", "Een klachtbrief schrijven aan een bedrijf of instantie.",
  ["Escrever uma carta formal de reclamação completa"],
  vocab=[V("v-klachtbrief","klachtbrief","carta de reclamação","noun","de"), V("v-ongenoegen","ongenoegen","descontentamento","noun","het"),
         V("v-verzoek-om","verzoek om","pedido de","expression"), V("v-tegemoetzien","tegemoetzien","aguardar","verb",note="Ik zie uw reactie graag tegemoet.")],
  ex=[("Met deze brief wil ik mijn ongenoegen uiten over…","Com esta carta quero manifestar o meu descontentamento com…"),("Ik verzoek u om het bedrag terug te betalen.","Solicito que me reembolse o montante."),("Ik zie uw reactie binnen tien werkdagen tegemoet.","Aguardo a sua resposta dentro de dez dias úteis."),("In de bijlage vindt u een kopie van de factuur.","Em anexo encontra uma cópia da fatura.")],
  review=["v-geachte","v-klacht","v-in-gebreke-stellen","v-hierbij"],
  cefr=C, exs=[
    MA([("klachtbrief","carta de reclamação"),("ongenoegen","descontentamento"),("verzoek om","pedido de"),("tegemoetzien","aguardar")], "Reclamação formal.", ["v-klachtbrief","v-ongenoegen","v-verzoek-om","v-tegemoetzien"]),
    TR("pt-nl","Solicito que me reembolse o montante.", ["Ik verzoek u om het bedrag terug te betalen","Ik verzoek u het bedrag terug te betalen"], "verzoeken om te.", ["v-verzoek-om"]),
    TR("nl-pt","Met deze brief wil ik mijn ongenoegen uiten over de service.", ["Com esta carta quero manifestar o meu descontentamento com o serviço"], "ongenoegen uiten.", ["v-ongenoegen"]),
    TR("pt-nl","Aguardo a sua resposta dentro de dez dias úteis.", ["Ik zie uw reactie binnen tien werkdagen tegemoet"], "tegemoetzien.", ["v-tegemoetzien"]),
    AR("ongenoegen","o descontentamento","het", "Het ongenoegen.", ["v-ongenoegen"]),
    MC("O que NÃO deve estar numa carta de reclamação formal?", ["*Insultos e pontos de exclamação a mais","Data e número de cliente|Deve estar.","O pedido concreto|Deve estar."], "Tom.", ["v-klachtbrief"]),
    FE(["Ik","verzoek","u","om","het","bedrag","terug","betalen."], 7, "te betalen", "om … te: terug te betalen.", ["v-verzoek-om"]),
    CO("text","Klachtbrief", "Geachte heer/mevrouw,\n\nOp 12 maart heb ik bij uw webwinkel een wasmachine besteld (ordernummer 58213). De levering was beloofd op 15 maart, maar de machine is pas op 2 april bezorgd. Bovendien bleek de deur beschadigd.\n\nIk heb hierover al twee keer contact opgenomen met uw klantenservice, helaas zonder resultaat. Daarom verzoek ik u om de machine binnen veertien dagen te vervangen of het aankoopbedrag terug te betalen.\n\nIk zie uw reactie graag tegemoet.\n\nHoogachtend,\nL. Ferreira",
       [("Quais são os dois problemas?", ["*Entrega atrasada e porta danificada","Preço e cor","Falta de manual e barulho"]),("O que pede?", ["*Substituição ou reembolso em 14 dias","Desconto de 10%","Um pedido de desculpas apenas"]),("Já contactou a empresa antes?", ["*Sim, duas vezes","Não","Uma vez por carta"])],
       "Repare: factos com datas → tentativas anteriores → pedido concreto com prazo.", ["v-klachtbrief","v-verzoek-om"]),
    LI("In de bijlage vindt u een kopie van de factuur.", ["In de bijlage vindt u een kopie van de factuur"], "Em anexo encontra uma cópia da fatura.", "bijlage.", ["v-bijlage"]),
    SW("Escreva uma carta de reclamação (5–6 frases) a uma companhia aérea que perdeu a sua mala durante 5 dias.", ["Geachte heer/mevrouw,\nOp 3 juni vloog ik met vlucht HV123 van Lissabon naar Amsterdam. Mijn koffer is pas vijf dagen later bezorgd. In die tijd moest ik kleding en toiletartikelen kopen. Hierbij verzoek ik u om deze kosten (€ 180) te vergoeden. In de bijlage vindt u de bonnetjes.\nIk zie uw reactie graag tegemoet.\nHoogachtend,\nR. Costa"], ["Factos com data e voo", "Consequência", "Pedido concreto (**verzoek u om**)", "Fecho formal"], 60, "Carta formal.", ["v-klachtbrief","v-verzoek-om"]),
  ], diff=5, mins=8)

L(4, "Resumo e paráfrase", "Samenvatten zonder te kopiëren.",
  ["Resumir e parafrasear um texto com as próprias palavras"],
  vocab=[V("v-parafraseren","parafraseren","parafrasear","verb"), V("v-kopieren","kopiëren","copiar","verb"),
         V("v-in-eigen-woorden","in je eigen woorden","por palavras tuas","expression"), V("v-hoofdpunt","hoofdpunt","ponto principal","noun","het")],
  ex=[("Vat de tekst samen in je eigen woorden.","Resume o texto por palavras tuas."),("Kopieer geen hele zinnen.","Não copies frases inteiras."),("Noem alleen de hoofdpunten.","Refere só os pontos principais."),("Probeer de zin te parafraseren.","Tenta parafrasear a frase.")],
  gram=[G("g-samenvatten","Como resumir","1) Leia o texto todo. 2) Sublinhe a **ideia principal** de cada parágrafo. 3) Escreva-as **por palavras suas**, sem exemplos nem pormenores. 4) Use conectores para ligar as ideias. Um resumo tem cerca de **1/4 a 1/3** do original.",
    [("De schrijver stelt dat… / Volgens de auteur… / Het artikel gaat over…","O autor defende que… / Segundo o autor… / O artigo trata de…")])],
  review=["v-samenvatting","v-kern","v-hoofdzaak","v-bijzaak"],
  cefr=C, exs=[
    MA([("parafraseren","parafrasear"),("kopiëren","copiar"),("in je eigen woorden","por palavras tuas"),("hoofdpunt","ponto principal")], "Resumir.", ["v-parafraseren","v-kopieren","v-in-eigen-woorden","v-hoofdpunt"]),
    MC("Paráfrase de «Het aantal fietsers is de afgelopen jaren fors gestegen»:", ["*Er fietsen nu veel meer mensen dan vroeger.","Het aantal fietsers is fors gestegen.|Cópia.","Fietsen is leuk.|Muda o sentido."], "Palavras próprias.", ["v-parafraseren"]),
    MC("Num resumo deve…", ["*incluir só os pontos principais","copiar as melhores frases|Não.","acrescentar a sua opinião|Não, salvo se pedido."], "Resumo.", ["v-hoofdpunt"]),
    TR("pt-nl","Resume o texto por palavras tuas.", ["Vat de tekst samen in je eigen woorden","Vat de tekst in je eigen woorden samen"], "samenvatten.", ["v-in-eigen-woorden"]),
    TR("nl-pt","Kopieer geen hele zinnen.", ["Não copies frases inteiras"], "kopiëren.", ["v-kopieren"]),
    AR("hoofdpunt","o ponto principal","het", "Het punt.", ["v-hoofdpunt"]),
    FE(["De","schrijver","stelt","dat","we","moeten","minder","vliegen."], 5, "minder moeten", "Verbos no fim: dat we minder moeten vliegen.", ["v-parafraseren"]),
    LI("Volgens de auteur moeten we anders gaan denken over werk.", ["Volgens de auteur moeten we anders gaan denken over werk"], "Segundo o autor, temos de começar a pensar de outra forma sobre o trabalho.", "Volgens de auteur.", ["v-hoofdpunt"]),
    FB("Het artikel ___ over de woningnood.", ["gaat"], "Het artikel gaat over…", ["v-hoofdpunt"], choices=["gaat","zegt","stelt"], tr="O artigo trata da crise da habitação."),
    SW("Resuma em 2 frases (palavras próprias): «Steeds meer jongeren kiezen na de middelbare school eerst voor een tussenjaar. Ze reizen, werken of doen vrijwilligerswerk. Volgens onderzoekers maken studenten met een tussenjaar vaker een bewuste studiekeuze en stoppen ze minder vaak met hun studie.»", ["Veel jongeren nemen na school een jaar vrij om te reizen of te werken. Onderzoek laat zien dat ze daarna beter hun studie kiezen en die vaker afmaken."], ["Duas frases", "Sem copiar frases", "Ideia principal + resultado"], 20, "Resumo.", ["v-in-eigen-woorden","v-parafraseren"]),
  ], diff=5, mins=8)

L(5, "Revisão avançada de estilo", "Variatie, beknoptheid, actieve zinnen",
  ["Melhorar o estilo: variar, cortar e preferir a voz ativa"],
  vocab=[V("v-beknopt","beknopt","conciso","adjective"), V("v-herhaling","herhaling","repetição","noun","de"),
         V("v-variatie","variatie","variação","noun","de"), V("v-schrappen","schrappen","cortar|eliminar","verb")],
  ex=[("Schrijf beknopt.","Escreve de forma concisa."),("Vermijd herhaling.","Evita repetições."),("Zorg voor variatie in je zinnen.","Varia as tuas frases."),("Schrap overbodige woorden.","Corta palavras desnecessárias.")],
  gram=[G("g-stijl","Estilo","1) **Corte** palavras vazias: *in principe, eigenlijk, op dit moment in de tijd*. 2) **Varie** o início das frases (nem sempre *Ik…*). 3) Prefira a **ativa** quando o agente importa: *De gemeente heeft besloten…* em vez de *Er is door de gemeente besloten…* 4) Uma ideia por frase.",
    [("Op dit moment in de tijd → Nu","Neste momento no tempo → Agora")])],
  review=["v-lijdende-vorm","v-overzichtelijk","v-opsplitsen"],
  cefr=C, exs=[
    MA([("beknopt","conciso"),("herhaling","repetição"),("variatie","variação"),("schrappen","cortar")], "Estilo.", ["v-beknopt","v-herhaling","v-variatie","v-schrappen"]),
    MC("Versão mais concisa de «Op dit moment in de tijd is het zo dat er veel mensen zijn die thuiswerken.»:", ["*Nu werken veel mensen thuis.","Op dit moment zijn er veel mensen die thuis werken op dit moment.|Repetição.","Het is zo dat thuiswerken.|Incompleto."], "Concisão.", ["v-beknopt"]),
    MC("Versão ativa de «Er werd door de directeur besloten dat het kantoor sluit.»:", ["*De directeur besloot dat het kantoor sluit.","Het kantoor werd besloten.|Muda o sentido.","Er werd besloten.|Perde o agente."], "Ativa.", ["v-lijdende-vorm"]),
    MC("Qual texto tem mais variação?", ["*Ik werk in Utrecht. Elke dag fiets ik naar kantoor. Daar drink ik eerst koffie.","Ik werk in Utrecht. Ik fiets naar kantoor. Ik drink koffie.|Começa sempre com «Ik».","Ik ik ik.|Não."], "Variar o início.", ["v-variatie"]),
    TR("pt-nl","Corta palavras desnecessárias.", ["Schrap overbodige woorden"], "schrappen.", ["v-schrappen"]),
    TR("nl-pt","Vermijd herhaling.", ["Evita repetições","Evita a repetição"], "herhaling.", ["v-herhaling"]),
    FE(["Op","dit","moment","in","de","tijd","werken","veel","mensen","thuis."], 3, "(cortar) Op dit moment / Nu", "«in de tijd» é redundante: Op dit moment (ou Nu) werken veel mensen thuis.", ["v-schrappen"]),
    AR("herhaling","a repetição","de", "-ing → de.", ["v-herhaling"]),
    LI("Schrijf korte, duidelijke zinnen.", ["Schrijf korte(,) duidelijke zinnen"], "Escreve frases curtas e claras.", "Estilo.", ["v-beknopt"]),
    SW("Reescreva de forma mais concisa e variada: «Ik ben naar de markt gegaan. Ik heb groente gekocht. Ik heb ook fruit gekocht. Ik ben toen naar huis gegaan. Ik heb toen gekookt.»", ["Ik ben naar de markt gegaan en heb er groente en fruit gekocht. Daarna ging ik naar huis om te koken."], ["Menos repetição de «Ik»", "Frases ligadas com conectores", "Mesmo conteúdo"], 15, "Reescrita.", ["v-variatie","v-beknopt"]),
  ], diff=5, mins=8)

W()
