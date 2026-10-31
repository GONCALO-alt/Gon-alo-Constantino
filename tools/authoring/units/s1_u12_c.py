import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u12")
C = "A1"
# Lições extra (11–16): mais prática de ordem das palavras (verbo em 2.º lugar, inversão, conectores).
# Nota: nos exercícios de ordem usa-se «Qual é a ordem correta?» ou ordenar peças — nunca «encontrar o erro».

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def Q(c, w, e, refs): return MC("Qual é a ordem correta?", ["*"+c, w+"|"+e], e, refs)

L(11, "Onde fica «vaak»?", "Ik drink vaak koffie.",
  ["Colocar advérbios de frequência depois do verbo"],
  vocab=[X("v-elke-dag","elke dag","todos os dias")],
  ex=[("Ik drink vaak koffie.","Bebo café muitas vezes."),("Hij werkt elke dag.","Ele trabalha todos os dias."),("We zijn nooit thuis.","Nunca estamos em casa.")],
  gram=[G("g-s1u12c-1","Frequência depois do verbo","Em frase normal: **sujeito + verbo + advérbio**: *Ik drink **vaak** koffie*. Nunca entre o sujeito e o verbo (*~~Ik vaak drink~~*).")],
  review=["v-vaak","v-soms","v-altijd","v-nooit"],
  cefr=C, exs=[
    MA([("vaak","muitas vezes"),("soms","às vezes"),("altijd","sempre"),("elke dag","todos os dias")], "Frequência.", ["v-vaak","v-soms","v-altijd","v-elke-dag"]),
    Q("Ik drink vaak koffie.", "Ik vaak drink koffie.", "O advérbio vem depois do verbo.", ["v-vaak"]),
    Q("Hij is altijd moe.", "Hij altijd is moe.", "Verbo em 2.º lugar.", ["v-altijd"]),
    TR("pt-nl","Às vezes leio um livro.", ["Ik lees soms een boek(.)","Soms lees ik een boek(.)"], "soms.", ["v-soms","v-lezen"]),
    TR("pt-nl","Ela trabalha todos os dias.", ["Ze werkt elke dag(.)","Zij werkt elke dag(.)","Elke dag werkt ze(.)"], "elke dag.", ["v-elke-dag"]),
    FB("Wij zijn ___ thuis op zaterdag. (nunca)", ["nooit"], "Nunca.", ["v-nooit"], choices=["nooit","vaak","altijd"], tr="Nunca estamos em casa ao sábado."),
    WO("Bebo sempre água.", ["Ik","drink","altijd","water."], "Verbo, depois advérbio.", ["v-altijd"]),
    LI("Mijn zus fietst elke dag naar school.", ["Mijn zus fietst elke dag naar school(.)"], "A minha irmã vai todos os dias de bicicleta para a escola.", "Ouvir.", ["v-elke-dag"]),
  ], diff=2, mins=4)

L(12, "Começar pela hora", "Om acht uur werk ik.",
  ["Começar a frase por uma hora e inverter sujeito e verbo"],
  vocab=[],
  ex=[("Om acht uur werk ik.","Às oito trabalho."),("Vandaag ga ik naar Utrecht.","Hoje vou a Utrecht.")],
  gram=[G("g-s1u12c-2","Inversão","Se a frase começa por outra coisa (hora, dia, lugar), o **verbo continua em 2.º lugar** e o sujeito vem **depois** dele: *Om acht uur **werk ik**.*")],
  review=["v-om","v-uur","v-vandaag","v-morgen"],
  cefr=C, exs=[
    Q("Om negen uur begin ik.", "Om negen uur ik begin.", "Depois de «om negen uur»: verbo, depois sujeito.", ["v-om"]),
    Q("Vandaag werkt zij thuis.", "Vandaag zij werkt thuis.", "Inversão.", ["v-vandaag"]),
    Q("Morgen gaan we naar Gent.", "Morgen we gaan naar Gent.", "Inversão.", ["v-morgen"]),
    TR("pt-nl","Hoje trabalho em casa.", ["Vandaag werk ik thuis(.)","Ik werk vandaag thuis(.)"], "Inversão.", ["v-vandaag"]),
    TR("pt-nl","Às sete como.", ["Om zeven uur eet ik(.)","Ik eet om zeven uur(.)"], "om + hora.", ["v-om","v-uur"]),
    WO("Amanhã vou para Delft.", ["Morgen","ga","ik","naar","Delft."], "Inversão.", ["v-morgen","v-naar"]),
    BS("Às oito ela bebe café.", ["Om","acht","uur","drinkt","ze","koffie."], ["Om acht uur drinkt ze koffie."], "Inversão.", ["v-om","v-drinken"]),
    LI("Om tien uur slaap ik.", ["Om tien uur slaap ik(.)"], "Às dez durmo.", "Ouvir.", ["v-slapen"]),
  ], diff=2, mins=4)

L(13, "Primeiro, depois, então", "Eerst… daarna… dan…",
  ["Contar uma sequência de ações"],
  vocab=[],
  ex=[("Eerst drink ik koffie, daarna lees ik de krant.","Primeiro bebo café, depois leio o jornal."),("Dan ga ik naar mijn werk.","Então vou para o trabalho.")],
  gram=[G("g-s1u12c-3","Palavras de sequência","*Eerst*, *daarna* e *dan* contam como primeira posição: o verbo vem logo a seguir. *Eerst **eet** ik, daarna **lees** ik.*")],
  review=["v-eerst","v-daarna","v-dan"],
  cefr=C, exs=[
    MA([("eerst","primeiro"),("daarna","depois"),("dan","então"),("straks","daqui a pouco")], "Sequência.", ["v-eerst","v-daarna","v-dan","v-nu-straks"]),
    Q("Eerst eet ik, daarna lees ik.", "Eerst ik eet, daarna ik lees.", "Inversão depois de eerst/daarna.", ["v-eerst","v-daarna"]),
    Q("Dan ga ik naar huis.", "Dan ik ga naar huis.", "Inversão depois de dan.", ["v-dan"]),
    TR("pt-nl","Primeiro bebo café.", ["Eerst drink ik koffie(.)"], "eerst.", ["v-eerst"]),
    TR("pt-nl","Depois vou para casa.", ["Daarna ga ik naar huis(.)","Dan ga ik naar huis(.)"], "daarna.", ["v-daarna"]),
    WO("Depois leio o jornal.", ["Daarna","lees","ik","de","krant."], "Inversão.", ["v-daarna"]),
    FB("Eerst werk ik, ___ ga ik naar huis.", ["daarna"], "Depois.", ["v-daarna"], choices=["daarna","eerst","want"], tr="Primeiro trabalho, depois vou para casa."),
    LI("Eerst slaap ik, dan eet ik.", ["Eerst slaap ik(,) dan eet ik(.)"], "Primeiro durmo, depois como.", "Ouvir.", ["v-eerst","v-dan"]),
  ], diff=2, mins=4)

L(14, "Porque e por isso", "Want en dus.",
  ["Dar uma razão com want e uma consequência com dus"],
  vocab=[],
  ex=[("Ik blijf thuis, want ik ben ziek.","Fico em casa, porque estou doente."),("Ik ben ziek, dus ik blijf thuis.","Estou doente, por isso fico em casa.")],
  gram=[G("g-s1u12c-4","Want / dus","**want** (porque) e **dus** (por isso) ligam duas frases normais: depois de *want* a ordem não muda (*want ik **ben** ziek*). Depois de *dus* também se pode inverter: *dus **blijf ik** thuis*.")],
  review=["v-want","v-dus"],
  cefr=C, exs=[
    MC("«…, ___ ik ben moe.» (porque)", ["*want","dus|Isso é «por isso».","of|Isso é «ou»."], "want = porque.", ["v-want"]),
    MC("«Ik ben moe, ___ ik slaap.» (por isso)", ["*dus","want|Isso é «porque».","maar|Isso é «mas»."], "dus = por isso.", ["v-dus"]),
    Q("Ik eet, want ik heb honger.", "Ik eet, want heb ik honger.", "Depois de want não há inversão.", ["v-want"]),
    TR("pt-nl","Fico em casa porque estou doente.", ["Ik blijf thuis(,) want ik ben ziek(.)"], "want.", ["v-want","v-ziek"]),
    TR("pt-nl","Está frio, por isso bebo café.", ["Het is koud(,) dus ik drink koffie(.)","Het is koud(,) dus drink ik koffie(.)"], "dus.", ["v-dus"]),
    FB("Ik leer Nederlands, ___ ik woon in Nederland.", ["want"], "Razão.", ["v-want"], choices=["want","dus","of"], tr="Aprendo neerlandês, porque moro nos Países Baixos."),
    BS("Estou cansado, por isso durmo.", ["Ik","ben","moe,","dus","ik","slaap."], ["Ik ben moe, dus ik slaap."], "dus.", ["v-dus"]),
    LI("Ik werk thuis, want het is druk op kantoor.", ["Ik werk thuis(,) want het is druk op kantoor(.)"], "Trabalho em casa, porque o escritório está movimentado.", "Ouvir.", ["v-want"]),
  ], diff=2, mins=4)

L(15, "Isto ou aquilo?", "Koffie of water?",
  ["Oferecer e escolher entre duas coisas com «of»"],
  vocab=[],
  ex=[("Wil je koffie of water?","Queres café ou água?"),("Ga je met de fiets of met de bus?","Vais de bicicleta ou de autocarro?")],
  review=["v-of","v-met","v-naar"],
  cefr=C, exs=[
    MC("«of» significa…", ["*ou","e|Isso é «en».","mas|Isso é «maar»."], "of.", ["v-of"]),
    TR("pt-nl","Café ou água?", ["Koffie of water?","Koffie of water"], "of.", ["v-of"]),
    TR("pt-nl","Vais de bicicleta ou de autocarro?", ["Ga je met de fiets of met de bus?","Ga jij met de fiets of met de bus?","Ga je met de fiets of de bus?"], "met de fiets.", ["v-met","v-of"]),
    FB("Rood ___ blauw?", ["of"], "ou.", ["v-of"], choices=["of","want","dus"], tr="Vermelho ou azul?"),
    DL([("Collega","Koffie of water?","Café ou água?"),("Jij","","")], ["*Koffie, graag.","Ja.|Pergunta de escolha: «ja» não serve.","Of.|Não."], "Escolher.", ["v-of","v-graag"]),
    Q("Ga je met de trein of met de auto?", "Je gaat met de trein of met de auto ga?", "Pergunta: verbo primeiro.", ["v-of"]),
    LI("Wil je wijn of water?", ["Wil je wijn of water(?)","Wil jij wijn of water(?)"], "Queres vinho ou água?", "Ouvir.", ["v-of"]),
    WO("Café ou água?", ["Koffie","of","water?"], "Ordem.", ["v-of"]),
  ], diff=2, mins=4)

L(16, "Prática: a minha rotina", "Mijn dag in de goede volgorde.",
  ["Escrever a rotina diária com a ordem certa"],
  vocab=[],
  ex=[("(Fictício) Om zeven uur sta ik op. Eerst drink ik koffie, daarna fiets ik naar mijn werk.","Às sete levanto-me…")],
  review=["v-elke-dag","v-eerst","v-daarna","v-om","v-want","v-dus","v-vaak"],
  cefr=C, exs=[
    MC("(Fictício) «Om zeven uur drinkt Tom koffie. Daarna fietst hij naar zijn werk.» O que faz o Tom primeiro?", ["*bebe café","vai de bicicleta|Isso é depois.","dorme|Não."], "Compreensão.", ["v-daarna"]),
    Q("Om half acht fiets ik naar mijn werk.", "Om half acht ik fiets naar mijn werk.", "Inversão.", ["v-om"]),
    Q("Ik ben vaak moe, want ik werk veel.", "Ik ben vaak moe, want werk ik veel.", "Depois de want: ordem normal.", ["v-want"]),
    WO("Todos os dias bebo café.", ["Elke","dag","drink","ik","koffie."], "Inversão.", ["v-elke-dag"]),
    BS("Primeiro trabalho, depois cozinho.", ["Eerst","werk","ik,","daarna","kook","ik."], ["Eerst werk ik, daarna kook ik."], "Inversão duas vezes.", ["v-eerst","v-daarna"]),
    TR("pt-nl","Às dez durmo, porque estou cansado.", ["Om tien uur slaap ik(,) want ik ben moe(.)"], "Inversão + want.", ["v-om","v-want"]),
    LI("Vandaag werk ik niet, dus ik slaap lang.", ["Vandaag werk ik niet(,) dus ik slaap lang(.)"], "Hoje não trabalho, por isso durmo muito.", "Ouvir.", ["v-dus"]),
    SW("Escreva 4 frases sobre a sua manhã (use om … uur, eerst, daarna).", ["Om zeven uur drink ik koffie. Eerst lees ik de krant. Daarna fiets ik naar mijn werk. Om negen uur begin ik."], ["om … uur","eerst / daarna","verbo em 2.º"], 16, "Escrever.", ["v-eerst","v-daarna"]),
  ], diff=2, mins=5)

W()
