import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s2-u09")
C = "A1-A2"

L(1, "O adjetivo antes do nome: -e", "de grote stad, een grote stad, grote steden.",
  ["Pôr o -e no adjetivo antes do nome"],
  vocab=[V("v-nieuw","nieuw","novo","adjective"), V("v-snel","snel","rápido","adjective"), V("v-leeg","leeg","vazio","adjective"), V("v-vol","vol","cheio","adjective")],
  ex=[("de nieuwe fiets","a bicicleta nova"),("een snelle trein","um comboio rápido"),("lege flessen","garrafas vazias")],
  gram=[G("g-adjetivo-e","Adjetivo + -e","Antes de um nome, o adjetivo leva normalmente **-e**: *de nieuwe fiets*, *een nieuwe fiets*, *nieuwe fietsen*, *het nieuwe huis*. Depois de **zijn** não leva: *de fiets is nieuw*. Ajustes de ortografia: groot → **grote**, wit → **witte**, snel → **snelle**, leeg → **lege**.",
    [("De stad is groot. — de grote stad","A cidade é grande. — a cidade grande")],
    "Em português o adjetivo concorda em género e número; em neerlandês só existe esta escolha: com ou sem -e.")],
  review=["v-groot","v-klein","v-oud","v-fiets","v-stad"],
  cefr=C, exs=[
    MA([("nieuw","novo"),("snel","rápido"),("leeg","vazio"),("vol","cheio")], "Adjetivos.", ["v-nieuw","v-snel","v-leeg","v-vol"]),
    MC("A bicicleta nova:", ["*de nieuwe fiets","de nieuw fiets|Antes do nome leva -e.","de fiets nieuwe|O adjetivo vem antes do nome."], "de + adj-e + nome.", ["v-nieuw"]),
    MC("Um comboio rápido:", ["*een snelle trein","een snel trein|«trein» é de: snelle.","een snele trein|Vogal curta: dobra-se o l."], "snel → snelle.", ["v-snel"]),
    MC("A cidade é grande:", ["*De stad is groot.","De stad is grote.|Depois de «is» não leva -e.","De grote stad is.|Frase incompleta."], "Depois de zijn: sem -e.", ["v-groot"]),
    TR("pt-nl","a casa velha", ["het oude huis"], "het + adj-e.", ["v-oud","v-huis"]),
    TR("pt-nl","garrafas vazias", ["lege flessen"], "leeg → lege.", ["v-leeg","v-fles"]),
    FE(["Ik","heb","een","nieuw","fiets."], 3, "nieuwe", "een + palavra de → -e: een nieuwe fiets.", ["v-nieuw"]),
    FB("De trein is ___ .", ["vol"], "Depois de «is» sem -e.", ["v-vol"], choices=["vol","volle","volen"], tr="O comboio está cheio."),
    LI("Ik woon in een grote stad.", ["Ik woon in een grote stad"], "Vivo numa cidade grande.", "groot → grote.", ["v-groot"]),
    WO("O copo vazio está em cima da mesa.", ["Het","lege","glas","staat","op","tafel"], "het + adj-e.", ["v-leeg"]),
  ], diff=2, mins=6)

L(2, "A exceção: een groot huis", "Com «een» + palavra «het», o adjetivo não leva -e.",
  ["Aplicar a exceção het + een"],
  vocab=[V("v-mooi-weer","weer","tempo","noun","het",note="Revisão: lekker weer, slecht weer."), V("v-slecht","slecht","mau","adjective"), V("v-belangrijk","belangrijk","importante","adjective")],
  ex=[("een groot huis","uma casa grande","het huis + een → sem -e."),("het grote huis","a casa grande"),("slecht weer","mau tempo","Sem artigo + palavra het → sem -e.")],
  gram=[G("g-adjetivo-sem-e","Quando NÃO se põe -e","Só há uma situação sem -e antes do nome: palavra **het**, no **singular**, com **een** ou sem artigo (também com geen, elk, veel…): *een groot huis*, *geen goed idee*, *lekker weer*. Com **het** (o artigo) volta o -e: *het grote huis*.",
    [("een belangrijk document","um documento importante"),("het belangrijke document","o documento importante")],
    "Truque: «een + het-palavra» = sem -e. Todas as outras combinações levam -e.")],
  review=["v-huis","v-boek","v-land","v-weer","v-goed","v-een"],
  cefr=C, exs=[
    MC("Uma casa grande:", ["*een groot huis","een grote huis|«huis» é het e há «een»: sem -e.","een groten huis|Não existe."], "een + het-palavra → sem -e.", ["v-huis"]),
    MC("A casa grande:", ["*het grote huis","het groot huis|Com o artigo «het» leva -e."], "het + adj-e.", ["v-huis"]),
    MC("Um livro bom:", ["*een goed boek","een goede boek|het boek + een → sem -e."], "een goed boek.", ["v-boek"]),
    MC("Um homem bom:", ["*een goede man","een goed man|«man» é de: leva -e."], "de man → een goede man.", ["v-man"]),
    TR("pt-nl","mau tempo", ["slecht weer"], "het weer, sem artigo → sem -e.", ["v-slecht","v-mooi-weer"]),
    TR("pt-nl","um documento importante", ["een belangrijk document"], "het document + een.", ["v-belangrijk","v-document"]),
    TR("nl-pt","Nederland is een klein land.", ["(Os )Países Baixos são um país pequeno","A Holanda é um país pequeno"], "het land + een → klein.", ["v-land"]),
    FE(["Het","is","een","mooie","land."], 3, "mooi", "het land + een → sem -e: een mooi land.", ["v-land"]),
    FB("Het ___ huis van mijn ouders is in Porto.", ["oude"], "het + adj-e.", ["v-oud"], choices=["oude","oud"], tr="A casa velha dos meus pais é no Porto."),
    AR("idee","a ideia","het", "«Het idee» → een goed idee.", ["v-belangrijk"]),
  ], diff=3, mins=6)

L(3, "Opostos úteis", "nieuw/oud, snel/langzaam, vol/leeg, duur/goedkoop…",
  ["Usar pares de adjetivos opostos"],
  vocab=[V("v-dik","dik","gordo|grosso","adjective"), V("v-dun","dun","magro|fino","adjective"), V("v-sterk","sterk","forte","adjective"),
         V("v-zwak","zwak","fraco","adjective"), V("v-schoon","schoon","limpo","adjective"), V("v-vuil","vuil","sujo","adjective",note="Também «vies» na fala.")],
  ex=[("Het water is schoon.","A água está limpa."),("Een dik boek.","Um livro grosso."),("Sterke koffie.","Café forte.")],
  review=["v-nieuw","v-oud","v-snel","v-langzaam","v-duur","v-goedkoop","v-vol","v-leeg"],
  cefr=C, exs=[
    MA([("dik","grosso"),("dun","fino"),("sterk","forte"),("zwak","fraco"),("schoon","limpo")], "Opostos.", ["v-dik","v-dun","v-sterk","v-zwak","v-schoon"]),
    MA([("nieuw","oud"),("snel","langzaam"),("vol","leeg"),("duur","goedkoop")], "Pares opostos (nl = nl).", ["v-nieuw","v-snel","v-vol","v-duur"]),
    TR("pt-nl","café forte", ["sterke koffie"], "de koffie, sem artigo → -e.", ["v-sterk"]),
    TR("nl-pt","Mijn kamer is niet schoon.", ["O meu quarto não está limpo"], "schoon = limpo.", ["v-schoon"]),
    MC("O contrário de «schoon» é…", ["*vuil","sterk|forte ≠ fraco.","dun|fino ≠ grosso."], "schoon ≠ vuil.", ["v-vuil"]),
    FB("Deze thee is te ___: doe er een theezakje bij.", ["zwak","slap"], "Chá fraco.", ["v-zwak"], choices=["zwak","dik","schoon"], tr="Este chá está fraco demais: põe mais uma saqueta."),
    FE(["Ik","lees","een","dikke","boek."], 3, "dik", "het boek + een → sem -e: een dik boek.", ["v-dik"]),
    LI("De trein is snel, de bus is langzaam.", ["De trein is snel(,) de bus is langzaam"], "O comboio é rápido, o autocarro é lento.", "Opostos.", ["v-snel","v-langzaam"]),
    WO("Tenho um casaco grosso para o inverno.", ["Ik","heb","een","dikke","jas","voor","de","winter"], "de jas → dikke.", ["v-dik","v-jas"]),
    MC("Uma camisola fina:", ["*een dunne trui","een dun trui|«trui» é de: -e.","een dune trui|Vogal curta: dobra-se o n."], "dun → dunne.", ["v-dun"]),
  ], diff=2, mins=5)

L(4, "Que tipo de…? Wat voor…?", "Descrever coisas e pessoas com mais pormenor.",
  ["Perguntar «que tipo de» e responder com adjetivos"],
  vocab=[V("v-wat-voor","wat voor","que tipo de","expression",note="Wat voor auto heb je? = Que carro tens?"), V("v-soort","soort","tipo|género","noun","de",note="Também se diz «het soort»."),
         V("v-rustig","rustig","calmo|sossegado","adjective"), V("v-druk-adj","lawaaierig","barulhento","adjective")],
  ex=[("Wat voor auto heb je? — Een kleine, rode auto.","Que carro tens? — Um carro pequeno e vermelho."),("Ik woon in een rustige straat.","Vivo numa rua sossegada."),("Wat voor muziek vind je leuk?","Que tipo de música gostas?")],
  review=["v-auto","v-straat","v-mooi-vinden","v-groot"],
  cefr=C, exs=[
    MA([("wat voor","que tipo de"),("soort","tipo"),("rustig","sossegado"),("lawaaierig","barulhento")], "Descrições.", ["v-wat-voor","v-soort","v-rustig","v-druk-adj"]),
    TR("pt-nl","Que carro tens?", ["Wat voor auto heb [je|jij]"], "Wat voor + nome.", ["v-wat-voor","v-auto"]),
    TR("nl-pt","Ik woon in een rustige straat.", ["Vivo numa rua sossegada","Moro numa rua calma"], "de straat → rustige.", ["v-rustig"]),
    MC("Duas adjetivos antes do nome: um carro pequeno e vermelho", ["*een kleine, rode auto","een klein, rood auto|«auto» é de: ambos levam -e.","een kleine, rood auto|Ambos levam -e."], "Todos os adjetivos levam -e.", ["v-auto"]),
    FB("___ muziek vind je leuk?", ["Wat voor"], "Wat voor = que tipo de.", ["v-wat-voor"], choices=["Wat voor","Welk","Hoe"], tr="Que tipo de música gostas?"),
    DL([("Sanne","Wat voor huis heb je?","Que casa tens?"),("Pedro","")], ["*Een klein huis met een tuin.","Een kleine huis met een tuin.|het huis + een → klein.","Ik heb rustig.|Incompleto."], "het huis + een → klein.", ["v-wat-voor"]),
    LI("Het is hier heel rustig.", ["Het is hier heel rustig"], "Aqui é muito sossegado.", "rustig = calmo.", ["v-rustig"]),
    FE(["Ik","woon","in","een","lawaaierige","stad","met","een","mooie","park."], 8, "mooi", "het park + een → een mooi park.", ["v-druk-adj"]),
    WO("Que tipo de livros lês?", ["Wat","voor","boeken","lees","je?"], "Wat voor + nome + verbo.", ["v-wat-voor"]),
    SW("Descreva a sua rua ou o seu bairro com dois ou três adjetivos.", ["Ik woon in een [rustige|drukke|mooie] straat(.) Er is een [groot|klein|mooi] park"],
       ["Adjetivos antes de nomes com a terminação certa","Uma frase com «er is»","Pelo menos um adjetivo depois de «is» (sem -e)"], 8, "Modelo: «Ik woon in een rustige straat. Er is een groot park. Mijn buurt is mooi.»", ["v-rustig"]),
  ], diff=3, mins=6)

L(5, "Descrever com precisão", "Revisão: adjetivos com e sem -e.",
  ["Escolher a forma certa do adjetivo em qualquer frase"],
  ex=[("Het oude huis heeft een grote tuin en een klein balkon.","A casa velha tem um jardim grande e uma varanda pequena.")],
  review=["v-nieuw","v-oud","v-groot","v-klein","v-mooi","v-rustig","v-schoon","v-belangrijk"],
  cefr=C, exs=[
    MC("een ___ balkon (klein)", ["*klein","kleine|het balkon + een → sem -e."], "een klein balkon.", ["v-balkon"]),
    MC("de ___ tuin (groot)", ["*grote","groot|de + adj-e."], "de grote tuin.", ["v-tuin"]),
    MC("___ fietsen (nieuw)", ["*nieuwe","nieuw|Plural → -e."], "nieuwe fietsen.", ["v-nieuw"]),
    MC("het ___ station (oud)", ["*oude","oud|het + adj-e."], "het oude station.", ["v-station"]),
    MC("Het station is ___ (oud)", ["*oud","oude|Depois de «is»: sem -e."], "is oud.", ["v-oud"]),
    TR("pt-nl","uma cozinha limpa e um quarto sujo", ["een schone keuken en een vuile kamer"], "Ambas palavras de → -e.", ["v-schoon","v-vuil"]),
    TR("pt-nl","um país bonito", ["een mooi land"], "het land + een.", ["v-mooi","v-land"]),
    FE(["Wij","hebben","een","nieuwe","appartement."], 3, "nieuw", "het appartement + een → nieuw.", ["v-appartement"]),
    CO("text","À procura de casa", "Wij zoeken een nieuw huis. Ons oude huis is te klein: we hebben maar één kleine slaapkamer. We willen een rustige straat, een grote keuken en een mooie tuin.",
       [("Porque procuram casa nova?", ["*A casa velha é pequena demais","A casa é barulhenta","Querem mudar de cidade"]),("O que querem?", ["*Rua sossegada, cozinha grande e jardim bonito","Um apartamento no centro","Uma casa barata"])],
       "Repare: een nieuw huis (het), ons oude huis, een rustige straat.", ["v-nieuw","v-rustig"]),
    SW("Descreva a sua casa ideal com pelo menos três adjetivos antes de nomes.", ["Ik wil een groot huis met een mooie tuin en een moderne keuken","Mijn ideale huis heeft een grote keuken(,) een licht[e|] woonkamer en een rustige tuin"],
       ["Três adjetivos antes de nomes","-e em palavras de, plural e com «het»","Sem -e com een + palavra het (een groot huis)"], 8, "Confirme cada adjetivo com a regra da lição 2.", ["v-groot"]),
  ], diff=3, mins=6)

W()
