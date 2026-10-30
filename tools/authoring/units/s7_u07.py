import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u07")
C = "B2"

L(1, "Recursos retóricos", "drieslag, tegenstelling, herhaling, retorische vraag",
  ["Usar recursos retóricos para tornar um texto convincente"],
  vocab=[V("v-drieslag","drieslag","enumeração em três (tríade)","noun","de"), V("v-tegenstelling","tegenstelling","contraste|antítese","noun","de"),
         V("v-stijlfiguur","stijlfiguur","figura de estilo","noun","de"), V("v-krachtig","krachtig","forte|poderoso","adjective")],
  ex=[("Sneller, goedkoper en schoner: dat is de trein.","Mais rápido, mais barato e mais limpo: é o comboio."),("Niet de auto, maar de fiets is de toekomst.","Não o carro, mas a bicicleta é o futuro."),("Een drieslag blijft goed hangen.","Uma tríade fica bem na memória."),("Dat is een krachtige afsluiting.","É um fecho forte.")],
  gram=[G("g-retorica","Recursos","**Drieslag**: três elementos em série (*veilig, snel en betaalbaar*). **Tegenstelling**: *niet X, maar Y*. **Herhaling**: repetir uma palavra-chave no início de frases. **Retorische vraag**: *Willen we dat echt?* Use com moderação.",
    [("We willen schone lucht, we willen veilige straten, we willen een leefbare stad.","Queremos ar limpo, ruas seguras, uma cidade habitável.")])],
  review=["v-retorische-vraag","v-overtuigen","v-pakkend"],
  cefr=C, exs=[
    MA([("drieslag","tríade"),("tegenstelling","contraste"),("stijlfiguur","figura de estilo"),("krachtig","forte")], "Retórica.", ["v-drieslag","v-tegenstelling","v-stijlfiguur","v-krachtig"]),
    MC("«Sneller, goedkoper en schoner» é um exemplo de…", ["*drieslag","tegenstelling|Não há contraste.","retorische vraag|Não é pergunta."], "Tríade.", ["v-drieslag"]),
    MC("«Niet praten, maar doen!» é um exemplo de…", ["*tegenstelling","drieslag|Só dois elementos.","herhaling|Não."], "Contraste.", ["v-tegenstelling"]),
    TR("pt-nl","Não o carro, mas a bicicleta é o futuro.", ["Niet de auto(,) maar de fiets is de toekomst"], "niet X, maar Y.", ["v-tegenstelling"]),
    TR("nl-pt","Dat is een krachtige afsluiting.", ["É um fecho forte","Isso é uma conclusão poderosa"], "krachtig.", ["v-krachtig"]),
    AR("tegenstelling","o contraste","de", "-ing → de.", ["v-tegenstelling"]),
    FE(["Een","goede","drieslag","blijven","goed","hangen."], 3, "blijft", "Sujeito singular: blijft.", ["v-drieslag"]),
    LI("We willen schone lucht, veilige straten en een leefbare stad.", ["We willen schone lucht(,) veilige straten en een leefbare stad","Wij willen schone lucht(,) veilige straten en een leefbare stad"], "Queremos ar limpo, ruas seguras e uma cidade habitável.", "Drieslag.", ["v-drieslag"]),
    FB("Een goede ___ maakt je tekst levendiger.", ["stijlfiguur"], "Figura de estilo.", ["v-stijlfiguur"], choices=["stijlfiguur","tegenstelling","drieslag"], tr="Uma boa figura de estilo torna o texto mais vivo."),
    SW("Escreva 2 frases para um texto a favor do comboio com uma tríade e um contraste.", ["De trein is sneller, goedkoper en schoner dan het vliegtuig. Niet de prijs van het ticket, maar de prijs voor het klimaat moet ons kompas zijn."], ["Uma tríade", "Um **niet … maar**", "Frases completas"], 25, "Retórica aplicada.", ["v-drieslag","v-tegenstelling"]),
  ], diff=5, mins=8)

L(2, "O artigo de opinião completo", "Titel, aanleiding, stelling, argumenten, slot",
  ["Escrever um artigo de opinião estruturado"],
  vocab=[V("v-aanleiding","aanleiding","motivo|ocasião","noun","de"), V("v-kop-pakkend","pakkende titel","título cativante","expression"),
         V("v-lezerspubliek","lezerspubliek","público leitor","noun","het"), V("v-afsluiter","afsluiter","frase final","noun","de")],
  ex=[("De aanleiding voor dit stuk is het nieuwe plan.","O motivo deste texto é o novo plano."),("Bedenk een pakkende titel.","Inventa um título cativante."),("Wie is je lezerspubliek?","Quem é o teu público leitor?"),("Eindig met een sterke afsluiter.","Termina com uma frase final forte.")],
  gram=[G("g-opiniestuk-opbouw","Estrutura","**Titel** (pakkend). **Aanleiding**: porque escreve agora (notícia, decisão). **Stelling**. **2–3 argumenten** com exemplos. **Tegenargument + weerlegging**. **Afsluiter**: apelo, pergunta ou retoma da tese. 400–700 palavras num jornal.",
    [("Aanleiding: Vorige week besloot de gemeente…","Motivo: Na semana passada a câmara decidiu…")])],
  review=["v-betoog","v-stelling","v-weerlegging","v-oproep"],
  cefr=C, exs=[
    MA([("aanleiding","motivo"),("pakkende titel","título cativante"),("lezerspubliek","público leitor"),("afsluiter","frase final")], "Opinião.", ["v-aanleiding","v-kop-pakkend","v-lezerspubliek","v-afsluiter"]),
    MC("Qual é a melhor «aanleiding»?", ["*Vorige week besloot de gemeente de bibliotheek in onze wijk te sluiten.","Bibliotheken bestaan al lang.|Sem ligação à atualidade.","Ik lees graag.|Pessoal sem contexto."], "Atualidade.", ["v-aanleiding"]),
    MC("Qual é o título mais cativante?", ["*Sluit de bieb niet: hij is de huiskamer van de wijk","Over de bibliotheek|Vago.","Tekst 3|Sem informação."], "Título.", ["v-kop-pakkend"]),
    TR("pt-nl","O motivo deste texto é o novo plano.", ["De aanleiding voor dit stuk is het nieuwe plan","De aanleiding voor deze tekst is het nieuwe plan"], "aanleiding voor.", ["v-aanleiding"]),
    TR("nl-pt","Eindig met een sterke afsluiter.", ["Termina com uma frase final forte","Acaba com um fecho forte"], "afsluiter.", ["v-afsluiter"]),
    AR("lezerspubliek","o público leitor","het", "Het publiek.", ["v-lezerspubliek"]),
    FE(["De","aanleiding","van","dit","stuk","is","het","plan."], 2, "voor", "aanleiding voor.", ["v-aanleiding"]),
    LI("De aanleiding voor dit stuk is het besluit van de gemeenteraad.", ["De aanleiding voor dit stuk is het besluit van de gemeenteraad"], "O motivo deste texto é a decisão da assembleia municipal.", "aanleiding.", ["v-aanleiding"]),
    FB("Pas je toon aan je ___ aan.", ["lezerspubliek"], "Público leitor.", ["v-lezerspubliek"], choices=["lezerspubliek","afsluiter","aanleiding"], tr="Adapta o tom ao teu público leitor."),
    SW("Escreva um artigo de opinião curto (8–10 frases) contra o encerramento da biblioteca do bairro: título, motivo, tese, dois argumentos, contra-argumento e fecho.", ["Sluit de bieb niet: hij is de huiskamer van de wijk\nVorige week besloot de gemeente de bibliotheek in Oost te sluiten om geld te besparen. Dat is een grote fout. Ten eerste is de bibliotheek een ontmoetingsplek voor ouderen die anders alleen thuis zitten. Ten tweede leren kinderen er lezen, ook als hun ouders geen boeken kunnen kopen. Natuurlijk moet de gemeente bezuinigen. Maar wie op de bibliotheek bespaart, betaalt later de prijs in eenzaamheid en laaggeletterdheid. Houd de deuren open!"], ["Título", "Aanleiding", "Tese", "Dois argumentos", "Contra-argumento + resposta", "Afsluiter"], 90, "Artigo de opinião.", ["v-aanleiding","v-afsluiter"]),
  ], diff=5, mins=8)

L(3, "Cartas formais às autoridades", "Bezwaar, zienswijze, verzoek aan de gemeente",
  ["Escrever cartas formais a autoridades com a estrutura certa"],
  vocab=[V("v-zienswijze","zienswijze","parecer (formal sobre um plano)","noun","de"), V("v-kenmerk-brief","kenmerk","referência (da carta)","noun","het"),
         V("v-gemeenteraad","gemeenteraad","assembleia municipal","noun","de"), V("v-indienen","indienen","apresentar|submeter","verb")],
  ex=[("Ik dien een zienswijze in over het bestemmingsplan.","Apresento um parecer sobre o plano de urbanização."),("Vermeld altijd het kenmerk van de brief.","Mencione sempre a referência da carta."),("De gemeenteraad beslist volgende maand.","A assembleia municipal decide no próximo mês."),("U kunt het formulier online indienen.","Pode submeter o formulário online.")],
  review=["v-bezwaar","v-besluit","v-hierbij","v-geachte"],
  cefr=C, exs=[
    MA([("zienswijze","parecer"),("kenmerk","referência"),("gemeenteraad","assembleia municipal"),("indienen","submeter")], "Autoridades.", ["v-zienswijze","v-kenmerk-brief","v-gemeenteraad","v-indienen"]),
    MC("Uma «zienswijze» apresenta-se…", ["*sobre um plano ainda em preparação, para dar a sua opinião","depois de uma decisão final|Aí é bezwaar.","para pedir um passaporte|Não."], "Diferença.", ["v-zienswijze"]),
    TR("pt-nl","Mencione sempre a referência da carta.", ["Vermeld altijd het kenmerk van de brief","Noem altijd het kenmerk van de brief"], "het kenmerk.", ["v-kenmerk-brief"]),
    TR("nl-pt","U kunt het formulier online indienen.", ["Pode submeter o formulário online","Pode entregar o formulário online"], "indienen.", ["v-indienen"]),
    AR("kenmerk","a referência","het", "Het kenmerk.", ["v-kenmerk-brief"]),
    CO("text","Zienswijze", "Aan de gemeenteraad van Haarlem\nBetreft: zienswijze bestemmingsplan Stationsplein (kenmerk 2024/1187)\n\nGeachte leden van de raad,\n\nHierbij dien ik een zienswijze in op het ontwerpbestemmingsplan Stationsplein. Ik ben niet tegen nieuwbouw, maar ik maak mij zorgen over de hoogte van de geplande toren (60 meter). Deze zal veel schaduw veroorzaken op de speeltuin aan de Kerklaan. Ik verzoek u daarom de maximale hoogte te verlagen tot 30 meter.\n\nHoogachtend,\nM. Oliveira",
       [("A M. Oliveira é contra construção nova?", ["*Não, só contra a altura da torre","Sim, contra tudo","Não fala de construção"]),("Qual é a preocupação concreta?", ["*Sombra sobre o parque infantil","Barulho","Trânsito"]),("O que pede?", ["*Baixar a altura máxima para 30 metros","Cancelar o plano","Mais estacionamento"])],
       "betreft = assunto; ontwerp = projeto.", ["v-zienswijze","v-kenmerk-brief"]),
    FE(["Hierbij","dien","ik","een","zienswijze","op."], 5, "in", "indienen: Hierbij dien ik een zienswijze in.", ["v-indienen"]),
    LI("Hierbij dien ik een bezwaar in tegen uw besluit.", ["Hierbij dien ik een bezwaar in tegen uw besluit","Hierbij dien ik bezwaar in tegen uw besluit"], "Venho por este meio apresentar contestação à sua decisão.", "indienen.", ["v-indienen"]),
    FB("Betreft: zienswijze bestemmingsplan, ___ 2024/1187", ["kenmerk"], "Referência.", ["v-kenmerk-brief"], choices=["kenmerk","gemeenteraad","besluit"], tr="Assunto: parecer sobre o plano, referência 2024/1187"),
    SW("Escreva uma carta formal curta (5–6 frases) à câmara a pedir mais estacionamento para bicicletas junto da estação.", ["Aan het college van burgemeester en wethouders\nBetreft: verzoek extra fietsparkeerplaatsen station\n\nGeachte heer/mevrouw,\nDagelijks zie ik dat de fietsenstalling bij het station overvol is. Veel fietsen staan daardoor op de stoep, wat gevaarlijk is voor voetgangers. Hierbij verzoek ik u om extra fietsparkeerplaatsen te realiseren.\n\nHoogachtend,\nJ. Sousa"], ["Destinatário e **betreft**", "Situação", "Pedido (**verzoek u om**)", "Fecho formal"], 60, "Carta à câmara.", ["v-indienen"]),
  ], diff=5, mins=8)

L(4, "Cartas de motivação avançadas", "Concreet, specifiek, resultaatgericht",
  ["Escrever uma carta de motivação de nível B2"],
  vocab=[V("v-bijdragen-aan","bijdragen aan","contribuir para","expression"), V("v-aantoonbaar","aantoonbaar","comprovado|demonstrável","adjective")],
  ex=[("Mijn ervaring sluit goed aan bij uw vacature.","A minha experiência corresponde bem à vossa vaga."),("Ik wil graag bijdragen aan uw duurzaamheidsdoelen.","Gostaria de contribuir para os vossos objetivos de sustentabilidade."),("Ik werk resultaatgericht.","Trabalho orientado para resultados."),("Ik heb aantoonbare ervaring met projectmanagement.","Tenho experiência comprovada em gestão de projetos.")],
  review=["v-aansluiten-bij","v-resultaatgericht","v-sollicitatiebrief","v-gemotiveerd","v-star-methode"],
  cefr=C, exs=[
    MA([("resultaatgericht","orientado para resultados"),("aansluiten bij","corresponder a"),("bijdragen aan","contribuir para"),("aantoonbaar","comprovado")], "Carta avançada.", ["v-resultaatgericht","v-aansluiten-bij","v-bijdragen-aan","v-aantoonbaar"]),
    MC("Qual frase é mais forte numa carta?", ["*In mijn vorige functie verlaagde ik de wachttijd voor klanten met 30 procent.","Ik ben een harde werker.|Vago.","Ik vind uw bedrijf leuk.|Vago."], "Concreto.", ["v-resultaatgericht"]),
    TR("pt-nl","A minha experiência corresponde bem à vossa vaga.", ["Mijn ervaring sluit goed aan bij uw vacature"], "aansluiten bij.", ["v-aansluiten-bij"]),
    TR("pt-nl","Gostaria de contribuir para os vossos objetivos.", ["Ik wil graag bijdragen aan uw doelen","Ik draag graag bij aan uw doelen","Graag draag ik bij aan uw doelen"], "bijdragen aan.", ["v-bijdragen-aan"]),
    TR("nl-pt","Ik heb aantoonbare ervaring met projectmanagement.", ["Tenho experiência comprovada em gestão de projetos","Tenho experiência demonstrável em gestão de projetos"], "aantoonbaar.", ["v-aantoonbaar"]),
    FE(["Mijn","ervaring","sluit","goed","aan","op","uw","vacature."], 5, "bij", "aansluiten bij.", ["v-aansluiten-bij"]),
    FE(["Ik","wil","bijdragen","tot","uw","succes."], 3, "aan", "bijdragen aan.", ["v-bijdragen-aan"]),
    LI("Graag draag ik bij aan de groei van uw organisatie.", ["Graag draag ik bij aan de groei van uw organisatie"], "Gostaria de contribuir para o crescimento da vossa organização.", "bijdragen.", ["v-bijdragen-aan"]),
    MC("Começar a carta com «Mijn naam is…» é…", ["*pouco eficaz: o nome já está no fim e no cv","obrigatório|Não.","muito original|Não."], "Abertura.", ["v-sollicitatiebrief"]),
    SW("Escreva o parágrafo central (4 frases) de uma carta de motivação para «projectcoördinator duurzaamheid», com um resultado concreto.", ["Mijn ervaring sluit goed aan bij uw vacature. Bij mijn huidige werkgever coördineer ik sinds drie jaar projecten op het gebied van energiebesparing. Zo heb ik een project geleid waardoor het energieverbruik van ons kantoor met 25 procent daalde. Graag draag ik met deze ervaring bij aan uw duurzaamheidsdoelen."], ["**aansluiten bij**", "Resultado concreto com número", "**bijdragen aan**"], 50, "Carta B2.", ["v-aansluiten-bij","v-bijdragen-aan","v-resultaatgericht"]),
  ], diff=5, mins=8)

L(5, "Revisão e edição final", "Woordkeus, structuur, toon, fouten",
  ["Rever um texto próprio de forma sistemática"],
  vocab=[V("v-woordkeus","woordkeus","escolha de palavras","noun","de"), V("v-samenhang","samenhang","coerência","noun","de"),
         V("v-redigeren","redigeren","redigir|editar","verb")],
  ex=[("Let op je woordkeus.","Atenção à escolha de palavras."),("De samenhang tussen de alinea's is zwak.","A coerência entre os parágrafos é fraca."),("Ik heb de tekst nog een keer geredigeerd.","Editei o texto mais uma vez."),("Dit is de eindversie.","Esta é a versão final.")],
  review=["v-eindversie","v-nakijken","v-beknopt","v-herhaling","v-variatie"],
  cefr=C, exs=[
    MA([("woordkeus","escolha de palavras"),("samenhang","coerência"),("redigeren","editar"),("eindversie","versão final")], "Edição.", ["v-woordkeus","v-samenhang","v-redigeren","v-eindversie"]),
    MC("Ordem útil de revisão:", ["*inhoud → structuur → zinnen → spelling","spelling → inhoud|Começa pelo pormenor.","alleen spelling|Insuficiente."], "Do geral ao particular.", ["v-redigeren"]),
    TR("pt-nl","Atenção à escolha de palavras.", ["Let op je woordkeus","Let op je woordkeuze"], "woordkeus/woordkeuze.", ["v-woordkeus"]),
    TR("nl-pt","De samenhang tussen de alinea's is zwak.", ["A coerência entre os parágrafos é fraca","A ligação entre os parágrafos é fraca"], "samenhang.", ["v-samenhang"]),
    FE(["Het","beleid","is","slecht.","Bovendien","het","is","duur."], 5, "is het", "Inversão depois de bovendien.", ["v-samenhang"]),
    FE(["De","gemeente","heeft","besloten","de","bieb","te","sluiten,","dat","ik","jammer","vind."], 8, "wat", "Refere-se à frase inteira → wat.", ["v-wat-rel"]),
    FE(["Ik","pleit","daarom","voor","een","andere","oplossing,","omdat","ik","vind","het","beter."], 9, "het beter vind", "Com omdat, o verbo vai para o fim: omdat ik het beter vind.", ["v-woordkeus"]),
    LI("Lees je tekst hardop voor, dan hoor je de fouten beter.", ["Lees je tekst hardop voor(,) dan hoor je de fouten beter"], "Lê o texto em voz alta, assim ouves melhor os erros.", "Dica.", ["v-redigeren"]),
    AR("eindversie","a versão final","de", "De versie.", ["v-eindversie"]),
    SW("Edite este parágrafo (corrija ordem, repetições e registo): «Ik vind dat de gemeente moet meer doen. De gemeente doet nu niks. Dat is echt super slecht en ook heel slecht voor de mensen. Daarom ik schrijf deze brief.»", ["Ik vind dat de gemeente meer moet doen. Op dit moment gebeurt er te weinig, en dat heeft grote gevolgen voor de bewoners. Daarom schrijf ik deze brief."], ["Ordem: **meer moet doen**", "Sem repetição nem coloquialismo", "**Daarom schrijf ik**"], 25, "Edição.", ["v-redigeren","v-woordkeus"]),
  ], diff=5, mins=8)

W()
