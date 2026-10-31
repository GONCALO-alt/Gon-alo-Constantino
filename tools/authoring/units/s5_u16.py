import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s5-u16")
C = "B1"

L(1, "Parágrafos: uma ideia de cada vez", "kernzin, uitleg, voorbeeld",
  ["Construir um parágrafo com frase principal, explicação e exemplo"],
  vocab=[V("v-alinea","alinea","parágrafo","noun","de"), V("v-kernzin","kernzin","frase principal","noun","de"),
         V("v-toelichting","toelichting","explicação|esclarecimento","noun","de"), V("v-hoofdgedachte","hoofdgedachte","ideia principal","noun","de")],
  ex=[("Elke alinea heeft één hoofdgedachte.","Cada parágrafo tem uma ideia principal."),("De kernzin staat vaak aan het begin.","A frase principal fica muitas vezes no início."),("Daarna volgt een toelichting.","Depois segue-se uma explicação."),("Geef ook een voorbeeld.","Dá também um exemplo.")],
  gram=[G("g-alinea","Estrutura de um parágrafo","1) **Kernzin**: a ideia principal. 2) **Toelichting**: explique porquê (*want, omdat, dat komt doordat…*). 3) **Voorbeeld**: *Zo… / Bijvoorbeeld…* 4) (Opcional) **Afsluiting**: *Daarom… / Kortom…*",
    [("Fietsen is gezond. Je beweegt elke dag zonder dat je naar de sportschool hoeft. Zo fiets ik zelf elke dag twintig minuten naar mijn werk.","Andar de bicicleta é saudável. Mexemo-nos todos os dias sem ter de ir ao ginásio. Eu, por exemplo, pedalo vinte minutos para o trabalho todos os dias.")])],
  review=["v-bijvoorbeeld","v-kortom","v-voorbeeld"],
  cefr=C, exs=[
    MA([("alinea","parágrafo"),("kernzin","frase principal"),("toelichting","explicação"),("hoofdgedachte","ideia principal")], "Escrita.", ["v-alinea","v-kernzin","v-toelichting","v-hoofdgedachte"]),
    MC("No parágrafo do exemplo, qual é a kernzin?", ["*Fietsen is gezond.","Zo fiets ik zelf…|É o exemplo.","Je beweegt elke dag…|É a explicação."], "Ideia principal.", ["v-kernzin"]),
    MC("Qual frase é um bom exemplo para a kernzin «Nederland is een fietsland»?", ["*Er zijn meer fietsen dan inwoners.","Ik houd van kaas.|Fora do tema.","Het regent vaak.|Fora do tema."], "Coerência.", ["v-hoofdgedachte"]),
    TR("pt-nl","Cada parágrafo tem uma ideia principal.", ["Elke alinea heeft één hoofdgedachte","Elke alinea heeft een hoofdgedachte"], "alinea.", ["v-alinea"]),
    TR("nl-pt","Daarna volgt een toelichting.", ["Depois segue-se uma explicação","A seguir vem uma explicação"], "toelichting.", ["v-toelichting"]),
    AR("alinea","o parágrafo","de", "De alinea.", ["v-alinea"]),
    WO("A frase principal fica muitas vezes no início.", ["De","kernzin","staat","vaak","aan","het","begin"], "aan het begin.", ["v-kernzin"]),
    FE(["Elke","alinea","hebben","één","hoofdgedachte."], 2, "heeft", "Sujeito singular: heeft.", ["v-alinea"]),
    LI("Begin elke alinea met een duidelijke kernzin.", ["Begin elke alinea met een duidelijke kernzin"], "Começa cada parágrafo com uma frase principal clara.", "kernzin.", ["v-kernzin"]),
    SW("Escreva um parágrafo de 3 frases sobre «Wonen in de stad is handig»: kernzin, toelichting, exemplo.", ["Wonen in de stad is handig. Alles is dichtbij, dus je hebt geen auto nodig. Ik loop bijvoorbeeld in vijf minuten naar de supermarkt."], ["Kernzin no início", "Toelichting com conector", "Exemplo concreto"], 25, "Parágrafo estruturado.", ["v-kernzin","v-toelichting"]),
  ], diff=4, mins=8)

L(2, "Ligar ideias entre frases", "Daarnaast, bovendien, echter, daardoor",
  ["Usar conectores para dar coesão ao texto"],
  vocab=[V("v-dat-komt-doordat","dat komt doordat","isso deve-se a","expression")],
  ex=[("Daarnaast is het goedkoper.","Além disso é mais barato."),("Het plan is goed. Het is echter erg duur.","O plano é bom. No entanto, é muito caro."),("Dat komt doordat het vaak regent.","Isso deve-se a chover muitas vezes."),("Ten slotte wil ik iedereen bedanken.","Por último, quero agradecer a todos.")],
  gram=[G("g-cohesie","Conectores de texto","**Adição**: daarnaast, bovendien, ook. **Contraste**: maar, echter, toch, aan de andere kant. **Causa**: want, omdat, doordat, dat komt doordat. **Consequência**: daarom, dus, daardoor. **Fim**: ten slotte, kortom. **echter** pode ir depois do verbo: *Het is **echter** duur.*",
    [("Het huis is mooi. Bovendien ligt het centraal.","A casa é bonita. Além disso, fica numa zona central.")])],
  review=["v-ten-slotte","v-echter","v-daarnaast","v-bovendien","v-daardoor","v-kortom","v-daarom"],
  cefr=C, exs=[
    MA([("daarnaast","além disso"),("echter","no entanto"),("dat komt doordat","isso deve-se a"),("ten slotte","por último")], "Coesão.", ["v-daarnaast","v-echter","v-dat-komt-doordat","v-ten-slotte"]),
    WO("Além disso é mais barato.", ["Daarnaast","is","het","goedkoper"], "Inversão.", ["v-daarnaast"]),
    WO("No entanto, é muito caro.", ["Het","is","echter","erg","duur"], "echter depois do verbo.", ["v-echter"]),
    TR("pt-nl","Isso deve-se a chover muitas vezes.", ["Dat komt doordat het vaak regent"], "doordat + verbo no fim.", ["v-dat-komt-doordat"]),
    TR("nl-pt","Ten slotte wil ik iedereen bedanken.", ["Por último, quero agradecer a todos","Finalmente, quero agradecer a todos"], "ten slotte.", ["v-ten-slotte"]),
    MC("Qual conector expressa contraste?", ["*echter","daarnaast|Adição.","daarom|Consequência."], "Contraste.", ["v-echter"]),
    MC("Qual expressa causa?", ["*doordat","bovendien|Adição.","ten slotte|Fim."], "Causa.", ["v-dat-komt-doordat"]),
    MC("Qual é a ordem correta?", ["*Dat komt doordat het vaak regent.","Dat komt doordat het regent vaak.|doordat → verbo no fim: doordat het vaak regent."], "doordat → verbo no fim: doordat het vaak regent.", ["v-dat-komt-doordat"]),
    FB("Het appartement is klein. ___ ligt het ver van het station.", ["Bovendien","Daarnaast"], "Adição (negativa).", ["v-daarnaast"], choices=["Bovendien","Echter","Daarom"], tr="O apartamento é pequeno. Além disso fica longe da estação."),
    LI("Het is echter niet zo eenvoudig.", ["Het is echter niet zo eenvoudig"], "No entanto, não é assim tão simples.", "echter.", ["v-echter"]),
  ], diff=4, mins=7)

L(3, "Escrever um texto de opinião curto", "Inleiding, middenstuk, slot",
  ["Escrever um texto de opinião com introdução, desenvolvimento e conclusão"],
  vocab=[V("v-inleiding","inleiding","introdução","noun","de"), V("v-middenstuk","middenstuk","desenvolvimento|corpo do texto","noun","het"),
         V("v-slot-tekst","slot","conclusão","noun","het"), V("v-argument","argument","argumento","noun","het")],
  ex=[("In de inleiding noem je het onderwerp.","Na introdução apresentas o tema."),("In het middenstuk geef je argumenten.","No desenvolvimento dás argumentos."),("In het slot vat je samen.","Na conclusão resumes."),("Een sterk argument is…","Um argumento forte é…")],
  review=["v-ten-eerste","v-ten-tweede","v-kortom","v-volgens-mij"],
  cefr=C, exs=[
    MA([("inleiding","introdução"),("middenstuk","desenvolvimento"),("slot","conclusão"),("argument","argumento")], "Texto de opinião.", ["v-inleiding","v-middenstuk","v-slot-tekst","v-argument"]),
    AR("slot","a conclusão","het", "Het slot.", ["v-slot-tekst"]),
    AR("argument","o argumento","het", "Het argument.", ["v-argument"]),
    TR("pt-nl","No desenvolvimento dás argumentos.", ["In het middenstuk geef je argumenten"], "Inversão.", ["v-middenstuk","v-argument"]),
    TR("nl-pt","In het slot vat je samen.", ["Na conclusão resumes","Na conclusão faz-se um resumo"], "samenvatten.", ["v-slot-tekst"]),
    MC("Qual frase é boa para uma inleiding?", ["*Steeds meer mensen werken thuis. Is dat een goede ontwikkeling?","Kortom, thuiswerken is goed.|Conclusão.","Ten tweede bespaar je reistijd.|Desenvolvimento."], "Introdução.", ["v-inleiding"]),
    MC("Qual frase é boa para o slot?", ["*Kortom: thuiswerken heeft meer voordelen dan nadelen.","Steeds meer mensen werken thuis.|Introdução.","Ten eerste bespaar je tijd.|Desenvolvimento."], "Conclusão.", ["v-slot-tekst"]),
    FE(["Een","sterke","argument","is","de","reistijd."], 1, "sterk", "het argument → een sterk argument.", ["v-argument"]),
    LI("Volgens mij heeft thuiswerken meer voordelen dan nadelen.", ["Volgens mij heeft thuiswerken meer voordelen dan nadelen"], "Na minha opinião, o teletrabalho tem mais vantagens do que desvantagens.", "Inversão.", ["v-volgens-mij"]),
    SW("Escreva um texto de opinião curto (5–6 frases) sobre «Moeten winkels op zondag open zijn?» com introdução, dois argumentos e conclusão.", ["Steeds meer winkels zijn op zondag open. Is dat een goed idee? Ten eerste is het handig voor mensen die doordeweeks werken. Ten tweede kunnen studenten extra geld verdienen. Aan de andere kant hebben werknemers minder rust. Kortom: ik vind dat winkels op zondag open mogen zijn, maar niet de hele dag."], ["Inleiding com pergunta", "Dois argumentos com conectores", "Contra-argumento", "Slot com **kortom**"], 50, "Texto de opinião completo.", ["v-inleiding","v-argument","v-slot-tekst"]),
  ], diff=5, mins=8)

L(4, "Rever o próprio texto", "Controleer werkwoorden, woordvolgorde en spelling.",
  ["Encontrar e corrigir erros típicos no próprio texto"],
  vocab=[V("v-spelling","spelling","ortografia","noun","de"),
         V("v-verbeteren","verbeteren","melhorar|corrigir","verb"), V("v-fout-veelvoorkomend","veelvoorkomende fout","erro frequente","expression")],
  ex=[("Kijk je tekst altijd na.","Revê sempre o teu texto."),("Let op de spelling van werkwoorden.","Atenção à ortografia dos verbos."),("Ik heb mijn tekst verbeterd.","Melhorei o meu texto."),("Dit is een veelvoorkomende fout.","Este é um erro frequente.")],
  gram=[G("g-checklist","Lista de verificação","1) **Verbo na 2.ª posição** (inversão depois de advérbios). 2) **Verbo no fim** em subordinadas (dat, omdat, als…). 3) **-d/-t**: *hij wordt, ik word, gebeurd*. 4) **de/het** e o **-e** do adjetivo. 5) **Particípio no fim** e auxiliar certo (hebben/zijn).",
    [("Gisteren heb ik … (não: Gisteren ik heb …)","Ontem eu …")])],
  review=["v-nakijken","v-woordvolgorde","v-fout","v-precies"],
  cefr=C, exs=[
    MA([("nakijken","rever"),("spelling","ortografia"),("verbeteren","melhorar"),("veelvoorkomende fout","erro frequente")], "Revisão.", ["v-nakijken","v-spelling","v-verbeteren","v-fout-veelvoorkomend"]),
    MC("Qual é a ordem correta?", ["*Gisteren heb ik hard gewerkt.","Gisteren ik heb hard gewerkt.|Inversão: Gisteren heb ik…"], "Inversão: Gisteren heb ik…", ["v-woordvolgorde"]),
    MC("Qual é a ordem correta?", ["*Ik denk dat hij morgen komt.","Ik denk dat hij komt morgen.|Subordinada: dat hij morgen komt."], "Subordinada: dat hij morgen komt.", ["v-woordvolgorde"]),
    FE(["Hij","word","volgende","week","dertig."], 1, "wordt", "hij → wordt (stam + t).", ["v-spelling"]),
    FE(["Wat","is","er","gebeurt?"], 3, "gebeurd", "Particípio: gebeurd (com -d).", ["v-spelling"]),
    FE(["Ik","heb","een","nieuwe","huis","gekocht."], 3, "nieuw", "het huis → een nieuw huis.", ["v-fout-veelvoorkomend"]),
    FE(["We","hebben","naar","Gent","gefietst."], 1, "zijn", "Com destino, fietsen usa zijn: We zijn naar Gent gefietst.", ["v-fout-veelvoorkomend"]),
    TR("pt-nl","Revê sempre o teu texto.", ["Kijk je tekst altijd na","Kijk altijd je tekst na","Controleer altijd je tekst"], "nakijken (separável).", ["v-nakijken"]),
    MC("«Ik vind dat het belangrijk is» — está correta?", ["*Sim: depois de dat, o verbo vai para o fim","Não: devia ser «dat is het belangrijk»|Errado.","Não: devia ser «dat het is belangrijk»|Errado."], "Subordinada.", ["v-woordvolgorde"]),
    SW("Corrija este texto e reescreva-o: «Vorige week ik ben naar Amsterdam geweest. Ik denk dat het is een mooie stad. Ik heb een leuk museum bezocht en een nieuwe boek gekocht.»", ["Vorige week ben ik naar Amsterdam geweest. Ik denk dat het een mooie stad is. Ik heb een leuk museum bezocht en een nieuw boek gekocht."], ["**Vorige week ben ik**", "**dat het een mooie stad is**", "**een nieuw boek** (het boek)"], 20, "Revisão.", ["v-nakijken","v-verbeteren"]),
  ], diff=5, mins=8)

L(5, "Revisão da Secção 5", "Conversa, cultura, partículas, tempos e escrita.",
  ["Rever as principais competências da Secção 5"],
  vocab=[V("v-vloeiend","vloeiend","fluente","adjective"), V("v-zelfverzekerd","zelfverzekerd","seguro de si","adjective"),
         V("v-oefening-baart-kunst","oefening baart kunst","a prática faz o mestre","expression")],
  ex=[("Ik spreek steeds vloeiender.","Falo cada vez mais fluentemente."),("Ik voel me zelfverzekerder.","Sinto-me mais seguro de mim."),("Oefening baart kunst!","A prática faz o mestre!"),("Volhouden!","Aguenta! / Não desistas!")],
  review=["v-volhouden","v-meevallen","v-toch-part","v-al-gedaan","v-echter","v-gezellig"],
  cefr=C, exs=[
    MA([("vloeiend","fluente"),("zelfverzekerd","seguro de si"),("oefening baart kunst","a prática faz o mestre"),("volhouden","persistir")], "Balanço.", ["v-vloeiend","v-zelfverzekerd","v-oefening-baart-kunst","v-volhouden"]),
    TR("pt-nl","Falo cada vez mais fluentemente.", ["Ik spreek steeds vloeiender"], "steeds + comparativo.", ["v-vloeiend"]),
    TR("nl-pt","Oefening baart kunst!", ["A prática faz o mestre","É a praticar que se aprende"], "Provérbio.", ["v-oefening-baart-kunst"]),
    MC("O exame correu melhor do que esperava. Diz…", ["*Het viel mee!","Het viel tegen!|Ao contrário.","Nou en?|Inadequado."], "meevallen.", ["v-meevallen"]),
    MC("«Je komt toch ook?» espera…", ["*confirmação («vens, não vens?»)","uma recusa|Não.","nada|Não."], "toch.", ["v-toch-part"]),
    WO("Quando cheguei, eles já tinham comido.", ["Toen","ik","aankwam,","hadden","ze","al","gegeten"], "Plusquamperfectum.", ["v-al-gedaan"]),
    MC("Qual é a ordem correta?", ["*Het plan is goed. Het is echter duur.","Het plan is goed. Het echter is duur.|echter vem depois do verbo: Het is echter duur."], "echter vem depois do verbo: Het is echter duur.", ["v-echter"]),
    CO("text","Een jaar in Nederland", "Toen Pedro vorig jaar naar Nederland kwam, had hij al een cursus Nederlands gedaan. Toch vond hij het in het begin moeilijk: mensen spraken snel en gebruikten veel woordjes als 'even', 'toch' en 'hoor'. Bovendien moest hij wennen aan de directe manier van praten. Inmiddels voelt hij zich veel zelfverzekerder. 'Het viel uiteindelijk mee,' zegt hij. 'Oefening baart kunst!'",
       [("O que achou difícil no início?", ["*A rapidez e as partículas","A comida","O clima apenas"]),("Como se sente agora?", ["*Muito mais seguro de si","Ainda inseguro","Quer voltar"]),("Já tinha estudado neerlandês antes?", ["*Sim, tinha feito um curso","Não","Só sabia inglês"])],
       "Repare nos tempos e nas partículas.", ["v-zelfverzekerd","v-meevallen"]),
    LI("Volhouden, het wordt steeds makkelijker!", ["Volhouden(,) het wordt steeds makkelijker"], "Não desistas, vai ficando cada vez mais fácil!", "volhouden.", ["v-volhouden"]),
    SW("Faça o balanço da Secção 5 (4 frases): o que já consegue fazer, o que ainda acha difícil e um provérbio ou expressão que aprendeu.", ["Ik kan nu een gesprek gaande houden en mijn mening geven. Partikels zoals 'toch' en 'wel' vind ik nog lastig. Toch merk ik dat ik steeds vloeiender spreek. Oefening baart kunst!"], ["Capacidades (**ik kan…**)", "Dificuldade", "Conector com ordem certa (**toch/bovendien**)", "Uma expressão"], 30, "Balanço.", ["v-vloeiend","v-oefening-baart-kunst"]),
  ], diff=5, mins=8)

W()
