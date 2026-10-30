import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u14")
C = "B2"

L(1, "Teste de leitura (1)", "Twee teksten, vragen van examenniveau. (Não certificado.)",
  ["Praticar leitura ao nível de um exame B2"],
  vocab=[V("v-examenvraag","examenvraag","pergunta de exame","noun","de"),
         V("v-tekstsoort","tekstsoort","tipo de texto","noun","de"), V("v-strekking-tekst","de strekking van de tekst","o sentido geral do texto","expression")],
  ex=[("Dit onderdeel test je leesvaardigheid.","Esta parte testa a tua compreensão de leitura."),("Lees eerst de examenvraag, dan de tekst.","Lê primeiro a pergunta, depois o texto."),("Welke tekstsoort is dit?","Que tipo de texto é este?"),("Wat is de strekking van de tekst?","Qual é o sentido geral do texto?")],
  review=["v-leesvaardigheid","v-kern","v-schrijfdoel","v-impliciet"],
  cefr=C, exs=[
    MA([("leesvaardigheid","compreensão de leitura"),("examenvraag","pergunta de exame"),("tekstsoort","tipo de texto"),("de strekking van de tekst","sentido geral")], "Exame.", ["v-leesvaardigheid","v-examenvraag","v-tekstsoort","v-strekking-tekst"]),
    CO("text","Tekst 1 – De opkomst van de deelfiets", "In steeds meer Nederlandse steden staan deelfietsen: fietsen die je met een app ontgrendelt en per minuut betaalt. Voorstanders wijzen erop dat minder mensen een eigen fiets nodig hebben, wat ruimte bespaart in drukke binnensteden. Gemeenten zijn echter niet onverdeeld positief. Deelfietsen worden vaak slordig neergezet en blokkeren stoepen. Amsterdam besloot daarom in 2019 het aantal aanbieders te beperken. Inmiddels werken veel steden met vaste parkeerzones. Of de deelfiets een blijvertje is, hangt volgens verkeersdeskundigen vooral af van de prijs: zolang een eigen tweedehands fiets goedkoper is, blijft de deelfiets voor de meeste Nederlanders een uitzondering.",
       [("Qual é a vantagem mencionada pelos defensores?", ["*Poupa espaço nos centros das cidades","É mais rápida","É mais segura"]),("Porque não são as câmaras totalmente positivas?", ["*As bicicletas são mal estacionadas e bloqueiam passeios","São caras para a câmara","Poluem"]),("De que depende o futuro das bicicletas partilhadas, segundo os especialistas?", ["*Do preço","Do tempo","Do número de aplicações"]),("Qual é o tipo de texto?", ["*Informativo com alguma análise","Publicidade","Crónica humorística"])],
       "onverdeeld = totalmente; blijvertje = algo que veio para ficar.", ["v-leesvaardigheid","v-tekstsoort"]),
    CO("text","Tekst 2 – Ingezonden brief", "Met verbazing las ik uw artikel over deelfietsen. De schrijver doet alsof ze een oplossing zijn voor de drukte in de stad. Maar wie dagelijks door het centrum loopt, ziet het tegenovergestelde: omgevallen fietsen, geblokkeerde stoepen en gevaarlijke situaties voor mensen met een rollator. Natuurlijk is minder fietsbezit mooi, maar niet ten koste van de veiligheid van voetgangers. Ik pleit voor een volledig verbod in de binnenstad.\n\nH. de Wit, Utrecht",
       [("Qual é a posição de H. de Wit?", ["*Proibir totalmente as bicicletas partilhadas no centro","Mais bicicletas partilhadas","Indiferente"]),("Que grupo menciona como prejudicado?", ["*Peões, sobretudo pessoas com andarilho","Ciclistas profissionais","Turistas"]),("Que concessão faz?", ["*Menos posse de bicicletas é positivo","As bicicletas são baratas","O artigo tem razão em tudo"]),("Qual é o tom?", ["*Crítico","Neutro","Humorístico"])],
       "rollator = andarilho; ten koste van = à custa de.", ["v-strekking-tekst","v-kritisch"]),
    MC("Estratégia de exame: ler primeiro…", ["*as perguntas, depois o texto à procura das respostas","só o título|Insuficiente.","o texto três vezes sem perguntas|Pouco eficiente."], "Estratégia.", ["v-examenvraag"]),
    MC("Em que difere o Texto 2 do Texto 1?", ["*É uma opinião pessoal (carta do leitor), não um texto informativo","São iguais|Não.","O Texto 2 é publicidade|Não."], "Tipos de texto.", ["v-tekstsoort"]),
    TR("nl-pt","Wat is de strekking van de tekst?", ["Qual é o sentido geral do texto","Qual é a ideia geral do texto"], "strekking.", ["v-strekking-tekst"]),
    AR("tekstsoort","o tipo de texto","de", "De soort.", ["v-tekstsoort"]),
    FE(["Wat","is","de","strekking","van","het","tekst?"], 5, "de", "Tekst é de-woord: de tekst.", ["v-strekking-tekst"]),
    LI("Lees eerst de vragen, dan weet je waar je op moet letten.", ["Lees eerst de vragen(,) dan weet je waar je op moet letten"], "Lê primeiro as perguntas, assim sabes a que deves estar atento.", "Estratégia.", ["v-examenvraag"]),
    SW("Resuma os dois textos numa frase cada.", ["Tekst 1 beschrijft de voor- en nadelen van deelfietsen en zegt dat de prijs bepalend is. In tekst 2 pleit een lezer voor een verbod, omdat deelfietsen gevaarlijk zijn voor voetgangers."], ["Uma frase por texto", "Ideia principal", "Palavras próprias"], 30, "Resumo de exame.", ["v-strekking-tekst"]),
  ], diff=5, mins=8)

L(2, "Teste de compreensão oral", "Fragmenten beluisteren en vragen beantwoorden. (Não certificado.)",
  ["Praticar compreensão oral ao nível de exame"],
  vocab=[V("v-luistervaardigheid","luistervaardigheid","compreensão oral","noun","de"), V("v-fragment","fragment","excerto","noun","het"),
         V("v-spreker","spreker","orador|falante","noun","de"), V("v-bedoelen-spreker","wat bedoelt de spreker?","o que quer dizer o falante?","expression")],
  ex=[("Je hoort elk fragment twee keer.","Ouves cada excerto duas vezes."),("De spreker is een huisarts.","O falante é um médico de família."),("Wat bedoelt de spreker met die opmerking?","O que quer dizer o falante com esse comentário?"),("Luistervaardigheid kun je trainen.","A compreensão oral treina-se.")],
  review=["v-kernwoorden","v-aantekeningen","v-ironie"],
  cefr=C, exs=[
    MA([("luistervaardigheid","compreensão oral"),("fragment","excerto"),("spreker","falante"),("wat bedoelt de spreker?","o que quer dizer?")], "Exame oral.", ["v-luistervaardigheid","v-fragment","v-spreker","v-bedoelen-spreker"]),
    LI("Goedemorgen, u luistert naar Radio Eén. Het is acht uur.", ["Goedemorgen(,) u luistert naar Radio Eén(.) Het is acht uur","Goedemorgen(,) u luistert naar Radio 1(.) Het is acht uur"], "Bom dia, está a ouvir a Rádio Um. São oito horas.", "Abertura de rádio.", ["v-fragment"]),
    LI("Uit onderzoek blijkt dat steeds minder jongeren de krant lezen.", ["Uit onderzoek blijkt dat steeds minder jongeren de krant lezen"], "A investigação mostra que cada vez menos jovens leem o jornal.", "Notícia.", ["v-luistervaardigheid"]),
    LI("Als u vragen heeft over uw factuur, druk dan op twee.", ["Als u vragen heeft over uw factuur(,) druk dan op twee","Als u vragen heeft over uw factuur(,) druk dan op 2"], "Se tiver perguntas sobre a fatura, prima dois.", "Menu telefónico.", ["v-fragment"]),
    LI("Ik had het eerlijk gezegd anders verwacht, maar het viel reuze mee.", ["Ik had het eerlijk gezegd anders verwacht(,) maar het viel reuze mee"], "Para ser sincero, esperava outra coisa, mas correu muito melhor do que pensava.", "meevallen.", ["v-bedoelen-spreker"]),
    MC("Ouve: «Nou, dat was weer een geweldige vergadering… drie uur over de kleur van de koffiebekers.» O falante…", ["*está a ser irónico: a reunião foi inútil","adorou a reunião|Ironia.","quer canecas novas|Não é o ponto."], "Ironia.", ["v-ironie"]),
    MC("Ouve: «De dokter zei dat ik het rustig aan moest doen, dus de marathon van zondag laat ik maar schieten.» O falante…", ["*não vai correr a maratona","vai correr a maratona|Não.","é médico|Não."], "Inferência.", ["v-bedoelen-spreker"]),
    TR("nl-pt","Je hoort elk fragment twee keer.", ["Ouves cada excerto duas vezes"], "fragment.", ["v-fragment"]),
    AR("fragment","o excerto","het", "Het fragment.", ["v-fragment"]),
    MC("Antes de ouvir, deve…", ["*ler as perguntas e prever o tema","fechar os olhos e esperar|Pouco eficaz.","traduzir as perguntas para português por escrito|Demora demais."], "Estratégia.", ["v-luistervaardigheid"]),
  ], diff=5, mins=8)

L(3, "Teste de escrita", "Taken: e-mail, betoog, samenvatting. (Não certificado.)",
  ["Praticar tarefas de escrita típicas de exames B2"],
  vocab=[V("v-schrijfvaardigheid","schrijfvaardigheid","expressão escrita","noun","de"), V("v-opdracht","opdracht","tarefa|enunciado","noun","de"),
         V("v-woordenaantal","aantal woorden","número de palavras","expression"), V("v-beoordelingscriteria","beoordelingscriteria","critérios de avaliação","noun","de")],
  ex=[("Lees de opdracht goed.","Lê bem o enunciado."),("Let op het aantal woorden.","Atenção ao número de palavras."),("Wat zijn de beoordelingscriteria?","Quais são os critérios de avaliação?"),("Schrijfvaardigheid wordt apart beoordeeld.","A expressão escrita é avaliada à parte.")],
  gram=[G("g-schrijftaak","Critérios típicos","1) **Taakuitvoering**: respondeu a tudo o que o enunciado pede? 2) **Samenhang**: estrutura e conectores. 3) **Woordenschat**: variado e adequado. 4) **Grammatica en spelling**. 5) **Register**: formal/informal certo. Verifique sempre cada ponto do enunciado.",
    [("Schrijf een e-mail van 100–150 woorden waarin u (1) …, (2) … en (3) …","Escreva um e-mail de 100–150 palavras em que (1)…, (2)… e (3)…")])],
  review=["v-betoog","v-klachtbrief","v-samenvatting"],
  cefr=C, exs=[
    MA([("schrijfvaardigheid","expressão escrita"),("opdracht","enunciado"),("aantal woorden","número de palavras"),("beoordelingscriteria","critérios de avaliação")], "Escrita.", ["v-schrijfvaardigheid","v-opdracht","v-woordenaantal","v-beoordelingscriteria"]),
    MC("O enunciado pede 3 pontos e só respondeu a 2. Isso afeta…", ["*a taakuitvoering (execução da tarefa)","só a ortografia|Não.","nada|Afeta."], "Critérios.", ["v-beoordelingscriteria"]),
    TR("pt-nl","Lê bem o enunciado.", ["Lees de opdracht goed","Lees de opdracht goed door"], "opdracht.", ["v-opdracht"]),
    AR("opdracht","o enunciado","de", "De opdracht.", ["v-opdracht"]),
    FE(["Let","op","het","aantal","woorden","die","je","schrijft."], 5, "dat", "Refere-se a «het aantal»: dat.", ["v-woordenaantal"]),
    SW("TAREFA 1 (e-mail, 100–150 palavras): O seu vizinho faz obras ao domingo de manhã. Escreva-lhe um e-mail em que (1) explica o problema, (2) diz porque é incómodo e (3) propõe uma solução.", ["Beste buurman,\nIk wil u graag iets vragen. De afgelopen drie zondagen bent u al om acht uur 's ochtends aan het boren en zagen. Voor ons is dat erg vervelend, omdat de zondag de enige dag is waarop we kunnen uitslapen. Bovendien heeft onze baby veel last van het lawaai. Ik begrijp natuurlijk dat de verbouwing af moet. Zou u op zondag pas na elf uur willen beginnen, of de lawaaiige klussen op zaterdag willen doen? Dan houden we allebei rekening met elkaar.\nAlvast bedankt voor uw begrip.\nMet vriendelijke groet,\nAna (nr. 14)"], ["(1) Problema", "(2) Porque incomoda", "(3) Proposta", "Registo educado", "100–150 palavras"], 100, "Tarefa de e-mail.", ["v-opdracht"]),
    SW("TAREFA 2 (texto argumentativo, 150–200 palavras): «Moet het Nederlands verplicht zijn voor iedereen die hier langer dan vijf jaar woont?» Dê a sua posição com dois argumentos e um contra-argumento.", ["Steeds meer mensen uit het buitenland wonen en werken in Nederland. Moet het leren van de taal verplicht worden? Ik vind van wel, maar met goede ondersteuning. Ten eerste is de taal de sleutel tot contact met buren, collega's en de school van je kinderen. Ten tweede kun je zonder Nederlands moeilijk meedoen in de samenleving, bijvoorbeeld bij de gemeente of de huisarts. Tegenstanders zeggen dat veel expats alleen Engels nodig hebben en na een paar jaar weer vertrekken. Dat klopt deels, maar wie vijf jaar blijft, is geen tijdelijke bezoeker meer. Kortom: een verplichting is redelijk, mits er betaalbare cursussen zijn."], ["Tese clara", "Dois argumentos", "Contra-argumento + resposta", "Conclusão", "150–200 palavras"], 150, "Tarefa argumentativa.", ["v-betoog"]),
    LI("U heeft voor deze opdracht dertig minuten.", ["U heeft voor deze opdracht dertig minuten","U hebt voor deze opdracht dertig minuten","U heeft voor deze opdracht 30 minuten"], "Tem trinta minutos para esta tarefa.", "Instrução.", ["v-opdracht"]),
    MC("Antes de entregar, deve verificar sobretudo…", ["*se respondeu a todos os pontos e se o registo está certo","só a letra|Não.","se usou palavras difíceis|Não é o essencial."], "Revisão.", ["v-beoordelingscriteria"]),
    WO("Atenção ao número de palavras.", ["Let","op","het","aantal","woorden"], "letten op.", ["v-woordenaantal"]),
  ], diff=5, mins=8)

L(4, "Teste de gramática e vocabulário", "Gemengde opgaven op B2-niveau. (Não certificado.)",
  ["Verificar o domínio de gramática e vocabulário B2"],
  vocab=[V("v-opgave","opgave","exercício (de teste)","noun","de"), V("v-invuloefening","invuloefening","exercício de preenchimento","noun","de"),
         V("v-meerkeuzevraag","meerkeuzevraag","pergunta de escolha múltipla","noun","de"), V("v-score","score","pontuação","noun","de")],
  ex=[("Maak alle opgaven.","Faz todos os exercícios."),("Dit is een invuloefening.","Este é um exercício de preenchimento."),("Bij een meerkeuzevraag is één antwoord goed.","Numa pergunta de escolha múltipla, uma resposta está certa."),("Wat is je score?","Qual é a tua pontuação?")],
  review=["v-werkwoordscluster","v-lijdende-vorm","v-die-rel","v-afhangen-van","v-besluit-nemen"],
  cefr=C, exs=[
    MA([("opgave","exercício"),("invuloefening","preenchimento"),("meerkeuzevraag","escolha múltipla"),("score","pontuação")], "Teste.", ["v-opgave","v-invuloefening","v-meerkeuzevraag","v-score"]),
    FB("Het hangt ervan ___ of het mooi weer wordt.", ["af"], "afhangen van.", ["v-afhangen-van"], choices=["af","op","uit"], tr="Depende de estar bom tempo."),
    FB("Het project ___ volgend jaar afgerond.", ["wordt"], "Passiva.", ["v-lijdende-vorm"], choices=["wordt","is","heeft"], tr="O projeto vai ser concluído no próximo ano."),
    FB("Het boek ___ ik las, was teleurstellend.", ["dat"], "het boek → dat.", ["v-die-rel"], choices=["dat","die","wat"], tr="O livro que li foi dececionante."),
    FB("De directie heeft een besluit ___.", ["genomen"], "een besluit nemen.", ["v-besluit-nemen"], choices=["genomen","gemaakt","gedaan"], tr="A direção tomou uma decisão."),
    FB("Ik vind het jammer dat je niet hebt kunnen ___.", ["komen"], "Grupo verbal.", ["v-werkwoordscluster"], choices=["komen","gekomen","kwam"], tr="Tenho pena que não tenhas podido vir."),
    FE(["Ondanks","het","regende,","gingen","we","fietsen."], 0, "Hoewel", "Com oração → hoewel.", ["v-hoewel"]),
    FE(["Hij","heeft","er","geen","zin","op."], 5, "in", "zin hebben in.", ["v-zin-hebben"]),
    MC("«Hij vroeg ___ ik tijd had.»", ["*of","dat|Pergunta sim/não → of.","wat|Não."], "Pergunta indireta.", ["v-vroeg-vragen"]),
    MC("Sinónimo formal de «krijgen» numa carta:", ["*ontvangen","pakken|Não.","halen|Outro sentido."], "Registo.", ["v-ontvangen"]),
  ], diff=5, mins=7)

L(5, "Autoavaliação e resultados", "Wat kan ik al? Waar moet ik nog aan werken?",
  ["Avaliar o próprio nível com honestidade e planear"],
  vocab=[V("v-zelfevaluatie","zelfevaluatie","autoavaliação","noun","de"), V("v-sterk-punt","sterk punt","ponto forte","noun","het"),
         V("v-aandachtspunt","aandachtspunt","ponto a melhorar","noun","het"), V("v-ik-kan","ik kan…","consigo…","expression")],
  ex=[("Doe een eerlijke zelfevaluatie.","Faz uma autoavaliação honesta."),("Mijn sterke punt is lezen.","O meu ponto forte é a leitura."),("Een aandachtspunt is mijn uitspraak.","Um ponto a melhorar é a minha pronúncia."),("Ik kan een vergadering volgen.","Consigo acompanhar uma reunião.")],
  gram=[G("g-kan-do","«Ik kan…» (descritores B2)","Ao nível B2 consegue, por exemplo: **compreender** as ideias principais de textos complexos; **participar** em conversas com fluência suficiente para interagir com nativos sem esforço excessivo para nenhum dos lados; **escrever** textos claros e pormenorizados e **argumentar**. Nota: esta autoavaliação **não substitui** um exame oficial.",
    [("Ik kan mijn mening geven en onderbouwen.","Consigo dar a minha opinião e fundamentá-la.")])],
  review=["v-taalniveau","v-staatsexamen","v-vooruitgang-boeken"],
  cefr=C, exs=[
    MA([("zelfevaluatie","autoavaliação"),("sterk punt","ponto forte"),("aandachtspunt","ponto a melhorar"),("ik kan…","consigo…")], "Autoavaliação.", ["v-zelfevaluatie","v-sterk-punt","v-aandachtspunt","v-ik-kan"]),
    TR("pt-nl","O meu ponto forte é a leitura.", ["Mijn sterke punt is lezen","Mijn sterkste punt is lezen","Lezen is mijn sterke punt"], "sterk punt.", ["v-sterk-punt"]),
    TR("pt-nl","Um ponto a melhorar é a minha pronúncia.", ["Een aandachtspunt is mijn uitspraak"], "aandachtspunt.", ["v-aandachtspunt"]),
    TR("nl-pt","Ik kan een vergadering volgen.", ["Consigo acompanhar uma reunião","Sou capaz de acompanhar uma reunião"], "ik kan.", ["v-ik-kan"]),
    AR("aandachtspunt","o ponto a melhorar","het", "Het punt.", ["v-aandachtspunt"]),
    MC("Esta aplicação…", ["*ajuda a praticar até B2, mas não dá um certificado oficial","dá o diploma NT2|Não.","substitui um professor em tudo|Não."], "Honestidade.", ["v-staatsexamen"]),
    FE(["Mijn","sterke","punten","is","lezen","en","luisteren."], 3, "zijn", "Sujeito plural (punten): zijn.", ["v-sterk-punt"]),
    LI("Ik kan mijn mening geven en onderbouwen.", ["Ik kan mijn mening geven en onderbouwen"], "Consigo dar a minha opinião e fundamentá-la.", "Descritor B2.", ["v-ik-kan"]),
    FB("Een eerlijke ___ helpt je om gericht te oefenen.", ["zelfevaluatie"], "Autoavaliação.", ["v-zelfevaluatie"], choices=["zelfevaluatie","score","opgave"], tr="Uma autoavaliação honesta ajuda-te a praticar de forma direcionada."),
    SW("Faça a sua autoavaliação (4–5 frases): três coisas que consegue fazer («Ik kan…»), um ponto forte e um ponto a melhorar.", ["Ik kan een krantenartikel begrijpen en de hoofdpunten samenvatten. Ik kan aan een vergadering deelnemen en mijn mening onderbouwen. Ik kan een formele brief schrijven. Mijn sterke punt is lezen. Een aandachtspunt is mijn uitspraak, vooral de g en de ui."], ["Três **Ik kan…**", "**sterk punt**", "**aandachtspunt**", "Honestidade"], 50, "Autoavaliação.", ["v-zelfevaluatie","v-ik-kan"]),
  ], diff=5, mins=7)

W()
