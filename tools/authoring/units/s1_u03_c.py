import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u03")
C = "A1"
# Lições extra (13–18): mais treino de pronúncia, com pares de palavras e frases curtas.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(13, "O som «uu»", "Vuur en zuur.",
  ["Pronunciar o «uu» longo, que não existe em português"],
  vocab=[N("v-vuur","vuur","fogo","het"), X("v-zuur","zuur","azedo, ácido","adjective")],
  ex=[("Het vuur is groot.","O fogo é grande."),("De wijn is zuur.","O vinho está azedo.")],
  gram=[G("g-s1u03c-1","Como dizer «uu»","Diz **i** e, sem mexer a língua, arredonda os lábios como para dizer **u**: sai o som de *vuur*, igual ao «u» francês (*tu*). O **u** curto (*bus*) é parecido, mas mais curto e mais aberto.",
    [("vuur","fogo"),("zuur","azedo"),("bus","autocarro")])],
  review=["v-bus"],
  cefr=C, exs=[
    MC("Para dizer «uu», começas com o som…", ["*«i», arredondando os lábios","«u» português, sem mudar nada|Fica «oe», outro som.","«a», abrindo a boca|Não."], "Técnica.", ["v-vuur"]),
    MC("Qual destas palavras tem «uu» longo?", ["*vuur","bus|«u» curto.","boek|«oe» = u português."], "uu.", ["v-vuur","v-bus","v-boek"]),
    MA([("vuur","fogo"),("zuur","azedo"),("bus","autocarro"),("boek","livro")], "Palavras.", ["v-vuur","v-zuur","v-bus","v-boek"]),
    AR("vuur", "fogo", "het", "het vuur.", ["v-vuur"]),
    LI("vuur", ["vuur"], "fogo", "Ouça o «uu».", ["v-vuur"]),
    LI("zuur", ["zuur"], "azedo", "Ouça o «uu».", ["v-zuur"]),
    TR("nl-pt","Het vuur is groot.", ["O fogo é grande(.)","O fogo está grande(.)"], "groot.", ["v-vuur","v-groot"]),
    FB("De wijn is ___.", ["zuur"], "Azedo.", ["v-zuur"], choices=["zuur","vuur","bus"], tr="O vinho está azedo."),
  ], diff=2, mins=4)

L(14, "O som «ui»", "Een uil in de tuin.",
  ["Pronunciar o ditongo «ui» em palavras conhecidas"],
  vocab=[N("v-uil","uil","coruja","de","uilen")],
  ex=[("Er is een uil in de tuin.","Há uma coruja no jardim."),("Het huis is bruin.","A casa é castanha.")],
  review=["v-huis","v-tuin","v-bruin"],
  cefr=C, exs=[
    MC("O «ui» neerlandês soa…", ["*como um «ai» com os lábios arredondados — não como «ui» português","exatamente como «ui» em «muito»|Não.","como «u» longo|Não."], "Falso amigo de grafia.", ["v-uil"]),
    MC("Qual destas NÃO tem o som «ui»?", ["*wijn|Tem «ij».","huis|Tem.","tuin|Tem."], "ui vs ij.", ["v-huis","v-tuin","v-wijn"]),
    MA([("uil","coruja"),("huis","casa"),("tuin","jardim"),("bruin","castanho")], "Palavras com ui.", ["v-uil","v-huis","v-tuin","v-bruin"]),
    LI("huis, tuin, uil", ["huis(,) tuin(,) uil"], "casa, jardim, coruja", "Ouça o «ui».", ["v-huis","v-tuin","v-uil"]),
    TR("nl-pt","Het huis is bruin.", ["A casa é castanha(.)"], "bruin.", ["v-huis","v-bruin"]),
    FB("De ___ zit in de boom.", ["uil"], "Coruja.", ["v-uil"], choices=["uil","huis","tuin"], tr="A coruja está na árvore."),
    LI("Een uil in de tuin.", ["Een uil in de tuin(.)"], "Uma coruja no jardim.", "Frase para treinar.", ["v-uil"]),
    WO("A casa é castanha.", ["Het","huis","is","bruin."], "Ordem.", ["v-huis","v-bruin"]),
  ], diff=2, mins=4)

L(15, "Curto ou longo?", "Man of maan? Zon of zoon?",
  ["Distinguir vogais curtas e longas que mudam o sentido"],
  vocab=[],
  ex=[("De man kijkt naar de maan.","O homem olha para a lua."),("De zon schijnt.","O sol brilha."),("Mijn zoon is zes.","O meu filho tem seis anos.")],
  review=["v-man","v-maan","v-zon","v-zoon","v-bed","v-been"],
  cefr=C, exs=[
    MA([("man","homem"),("maan","lua"),("zon","sol"),("zoon","filho")], "Pares.", ["v-man","v-maan","v-zon","v-zoon"]),
    MC("«aa» escrito duplo indica…", ["*vogal longa","vogal curta|O curto escreve-se com uma letra em sílaba fechada: man.","vogal muda|Não."], "Regra.", ["v-maan"]),
    MC("O sol brilha. Escreves:", ["*De zon schijnt.","De zoon schijnt.|«zoon» é filho.","De zoen schijnt.|Não existe aqui."], "Sentido.", ["v-zon"]),
    LI("maan", ["maan"], "lua", "Longa.", ["v-maan"]),
    LI("man", ["man"], "homem", "Curta.", ["v-man"]),
    LI("zoon", ["zoon"], "filho", "Longa.", ["v-zoon"]),
    TR("nl-pt","Mijn zoon is zes.", ["O meu filho tem seis anos(.)","O meu filho tem seis(.)"], "zoon.", ["v-zoon","v-zes"]),
    FB("Het ___ is groot.", ["bed"], "bed (cama) / been (perna).", ["v-bed"], choices=["bed","been","maan"], tr="A cama é grande."),
  ], diff=2, mins=4)

L(16, "«oe», «g» e «h»", "Goed of hoed?",
  ["Distinguir «g» de «h» e treinar o «oe»"],
  vocab=[N("v-hoed","hoed","chapéu","de","hoeden")],
  ex=[("Mijn hoed is blauw.","O meu chapéu é azul."),("Het boek is goed.","O livro é bom.")],
  gram=[G("g-s1u03c-2","g e h","O **g** neerlandês é áspero, feito no fundo da garganta (*goed*). O **h** é só um sopro, como em inglês *house* (*hoed*). Não confundas: *goed* = bom, *hoed* = chapéu. O **oe** soa como o «u» português: *boek*, *hoed*.")],
  review=["v-goed","v-boek","v-stoel","v-geld","v-graag"],
  cefr=C, exs=[
    MC("O «h» de «hoed» soa…", ["*como um sopro, como no inglês «house»","mudo, como em português|Em neerlandês ouve-se.","igual ao «g»|Não."], "h aspirado.", ["v-hoed"]),
    MC("«oe» em «boek» soa como…", ["*o «u» português","«o» + «e»|Não.","«uu» longo|Não."], "oe.", ["v-boek"]),
    MA([("hoed","chapéu"),("goed","bom"),("boek","livro"),("stoel","cadeira")], "Palavras com oe.", ["v-hoed","v-goed","v-boek","v-stoel"]),
    LI("goed", ["goed"], "bom / bem", "g áspero.", ["v-goed"]),
    LI("hoed", ["hoed"], "chapéu", "h aspirado.", ["v-hoed"]),
    TR("nl-pt","Mijn hoed is blauw.", ["O meu chapéu é azul(.)"], "hoed.", ["v-hoed","v-blauw"]),
    FB("Het boek is ___.", ["goed"], "Bom.", ["v-goed"], choices=["goed","hoed","geld"], tr="O livro é bom."),
    LI("Ik heb graag geld.", ["Ik heb graag geld(.)"], "Gosto de ter dinheiro.", "Treino do g.", ["v-graag","v-geld"]),
  ], diff=2, mins=4)

L(17, "Ler palavras que não conheces", "Lezen zonder woordenboek.",
  ["Aplicar as regras de pronúncia a palavras novas"],
  vocab=[],
  ex=[("boer → «bur» (agricultor)","oe = u"),("zuid → «zœyt» (sul)","ui; d final soa t")],
  review=["v-boek","v-huis","v-wijn","v-vuur","v-hond"],
  cefr=C, exs=[
    MC("«boer» (agricultor) pronuncia-se aproximadamente…", ["*«bur»","«bo-er»|«oe» é um só som.","«buur»|Isso seria uu."], "oe = u.", ["v-boek"]),
    MC("«zuid» (sul): o «d» final soa…", ["*como «t»","como «d»|No fim da palavra, d soa t.","mudo|Não."], "Final -d.", ["v-hond"]),
    MC("«rijk» (rico) tem o mesmo som de…", ["*wijn","vuur|Não.","boek|Não."], "ij.", ["v-wijn"]),
    MC("«reus» (gigante) tem o som…", ["*«eu», como em «deur»","«e» + «u» separados|Não.","«ui»|Não."], "eu.", ["v-deur"]),
    TR("nl-pt","De hond is oud.", ["O cão é velho(.)","O cão está velho(.)"], "Leia em voz alta: d final = t; ou = au.", ["v-hond","v-oud"]),
    LI("hond", ["hond"], "cão", "O d final soa t.", ["v-hond"]),
    LI("wijn en ijs", ["wijn en ijs"], "vinho e gelado", "ij.", ["v-wijn","v-ijs"]),
    FB("Rijk (rico) tem o mesmo som de w___n.", ["ij"], "ij = ei.", ["v-wijn"], choices=["ij","ui","oe"], tr="Rico / vinho."),
  ], diff=2, mins=4)

L(18, "Prática: frases para treinar", "Hardop lezen.",
  ["Ler e ouvir frases curtas com todos os sons difíceis"],
  vocab=[],
  ex=[("De vrouw drinkt koude wijn in de tuin.","A mulher bebe vinho frio no jardim.")],
  review=["v-vrouw","v-wijn","v-tuin","v-huis","v-zee","v-hond","v-kat","v-trein","v-gracht"],
  cefr=C, exs=[
    LI("Het huis is klein.", ["Het huis is klein(.)"], "A casa é pequena.", "ui + ei.", ["v-huis","v-klein"]),
    LI("De hond en de kat.", ["De hond en de kat(.)"], "O cão e o gato.", "d final = t.", ["v-hond","v-kat"]),
    LI("De trein is rood.", ["De trein is rood(.)"], "O comboio é vermelho.", "ei + oo.", ["v-trein","v-rood"]),
    LI("Een fiets bij de gracht.", ["Een fiets bij de gracht(.)"], "Uma bicicleta junto ao canal.", "g + ch.", ["v-fiets","v-gracht"]),
    TR("nl-pt","De zee is blauw en koud.", ["O mar é azul e frio(.)","O mar está azul e frio(.)"], "zee.", ["v-zee","v-blauw","v-koud"]),
    MC("Qual destes sons é igual em «klein» e «wijn»?", ["*ei / ij","ui|Não.","oe|Não."], "Mesmo som.", ["v-klein","v-wijn"]),
    MC("Em «gracht» quantos sons ásperos de garganta há?", ["*dois: g e ch","um|Ouve-se no g e no ch.","nenhum|Não."], "g e ch.", ["v-gracht"]),
    WO("O cão é grande.", ["De","hond","is","groot."], "Ordem.", ["v-hond","v-groot"]),
  ], diff=2, mins=5)

W()
