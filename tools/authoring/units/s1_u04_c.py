import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u04")
C = "A1"
# Lições extra (11–16): soletrar, pedir para repetir, dados de contacto e frases da aula.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(11, "Como se escreve?", "Hoe spel je dat?",
  ["Pedir a alguém que soletre uma palavra ou um nome"],
  vocab=[X("v-hoe-spel-je-dat","hoe spel je dat?","como se escreve isso? (letra a letra)")],
  ex=[("Ik heet Joost. — Hoe spel je dat?","Chamo-me Joost. — Como se escreve?"),("J-O-O-S-T.","J-O-O-S-T.")],
  review=["v-spellen","v-letter","v-schrijven","v-naam"],
  cefr=C, exs=[
    MA([("spellen","soletrar"),("schrijven","escrever"),("letter","letra"),("woord","palavra")], "Escrita.", ["v-spellen","v-schrijven","v-letter","v-woord"]),
    MC("Não percebes como se escreve um nome. Perguntas:", ["*Hoe spel je dat?","Hoe gaat het?|Pergunta como está.","Wat is dat?|Pergunta o que é."], "Pedir soletração.", ["v-hoe-spel-je-dat"]),
    TR("pt-nl","Como se escreve isso?", ["Hoe spel je dat?","Hoe spel je dat"], "spellen.", ["v-hoe-spel-je-dat"]),
    LI("J, O, O, S, T", ["JOOST","J O O S T","J,O,O,S,T","Joost"], "J-O-O-S-T (Joost)", "Ouça as letras.", ["v-letter"]),
    FB("Hoe ___ je dat?", ["spel"], "spellen → spel.", ["v-spellen"], choices=["spel","spellen","schrijf je"], tr="Como se escreve isso?"),
    DL([("Collega","Ik heet Wouter.","Chamo-me Wouter."),("Jij","","")], ["*Sorry, hoe spel je dat?","Doei Wouter!|Despedida.","Ik begrijp het.|Não ajuda a escrever o nome."], "Pedir para soletrar.", ["v-hoe-spel-je-dat"]),
    MC("Em neerlandês, a letra «w» diz-se…", ["*«wee»","«dâblio»|Isso é inglês.","«vê duplo»|Isso é português."], "Nome da letra.", ["v-alfabet"]),
    WO("Como se escreve o teu nome?", ["Hoe","spel","je","jouw","naam?"], "Ordem.", ["v-hoe-spel-je-dat"]),
  ], diff=1, mins=4)

L(12, "A letra IJ", "De lange ij.",
  ["Saber como se chama e se escreve o «ij»"],
  vocab=[X("v-lange-ij","lange ij","«ij» (letra própria do neerlandês)")],
  ex=[("Wijn schrijf je met een lange ij.","«Wijn» escreve-se com «ij»."),("IJmuiden begint met IJ: twee hoofdletters.","IJmuiden começa com IJ: duas maiúsculas.")],
  gram=[G("g-s1u04c-1","IJ e EI","**ij** e **ei** soam igual. Ao soletrar, diz-se «*lange ij*» para ij e «*korte ei*» para ei. No início de um nome, as duas letras ficam maiúsculas: **IJ**sselmeer, **IJ**muiden. A letra **y** é outra: chama-se «*i-grec*».")],
  review=["v-wijn","v-ijs","v-klein","v-spellen"],
  cefr=C, exs=[
    MC("«ij» e «ei» soam…", ["*igual","diferente: ij é longo|Não.","ij é mudo|Não."], "Mesmo som.", ["v-lange-ij"]),
    MC("Ao soletrar «wijn», dizes:", ["*w – lange ij – n","w – i – j – n|Diz-se «lange ij» como uma letra.","w – korte ei – n|ei curto é outra grafia."], "Soletrar.", ["v-lange-ij","v-wijn"]),
    MC("Como se escreve o nome da cidade?", ["*IJmuiden","Eimuiden|O som é igual, mas o nome escreve-se com IJ.","Ymuiden|«y» é outra letra."], "Maiúscula dupla.", ["v-lange-ij"]),
    MC("«klein» escreve-se com…", ["*ei (korte ei)","ij (lange ij)|Não.","y|Não."], "Grafia.", ["v-klein"]),
    LI("ijs", ["ijs"], "gelado", "ij.", ["v-ijs"]),
    LI("klein", ["klein"], "pequeno", "ei.", ["v-klein"]),
    FB("W___n (vinho)", ["ij"], "Wijn.", ["v-wijn"], choices=["ij","ei","y"], tr="Vinho."),
    FB("Kl___n (pequeno)", ["ei"], "Klein.", ["v-klein"], choices=["ei","ij","y"], tr="Pequeno."),
  ], diff=2, mins=4)

L(13, "Outra vez, por favor", "Nog een keer, alstublieft.",
  ["Pedir para repetir e para falar devagar"],
  vocab=[X("v-nog-een-keer","nog een keer","mais uma vez, outra vez")],
  ex=[("Nog een keer, alstublieft.","Outra vez, por favor."),("Kunt u dat herhalen? Langzaam, alstublieft.","Pode repetir? Devagar, por favor.")],
  review=["v-herhalen","v-langzaam","v-begrijpen","v-alstublieft"],
  cefr=C, exs=[
    MA([("nog een keer","outra vez"),("herhalen","repetir"),("langzaam","devagar"),("begrijpen","perceber")], "Pedidos.", ["v-nog-een-keer","v-herhalen","v-langzaam","v-begrijpen"]),
    MC("Não ouviste bem o número. Dizes:", ["*Nog een keer, alstublieft.","Tot zo!|Despedida.","Geen probleem.|Não pede nada."], "Pedir repetição.", ["v-nog-een-keer"]),
    TR("pt-nl","Outra vez, por favor.", ["Nog een keer(,) alstublieft(.)","Nog een keer(,) alsjeblieft(.)"], "nog een keer.", ["v-nog-een-keer"]),
    TR("pt-nl","Diga isso devagar, por favor.", ["Zeg het langzaam(,) alstublieft(.)","Zeg dat langzaam(,) alstublieft(.)","Zeg het langzaam(,) alsjeblieft(.)"], "langzaam.", ["v-langzaam","v-zeggen"]),
    FB("Ik begrijp het ___.", ["niet"], "Negação.", ["v-niet"], choices=["niet","nog","langzaam"], tr="Não percebo."),
    DL([("Docent","Herhaal het woord: gracht.","Repete a palavra: gracht."),("Jij","","")], ["*Sorry, nog een keer, alstublieft?","Doei!|Não.","Ik ben student.|Não responde."], "Pedir repetição.", ["v-nog-een-keer"]),
    LI("Kunt u dat nog een keer zeggen?", ["Kunt u dat nog een keer zeggen(?)"], "Pode dizer isso outra vez?", "Pedido educado.", ["v-nog-een-keer","v-zeggen"]),
    WO("Desculpe, não percebo.", ["Sorry,","ik","begrijp","het","niet."], "niet no fim.", ["v-begrijpen","v-niet"]),
  ], diff=1, mins=4)

L(14, "Não sei", "Ik weet het niet.",
  ["Dizer que não sabes e perguntar o que significa uma palavra"],
  vocab=[X("v-ik-weet-het-niet","ik weet het niet","não sei")],
  ex=[("Wat betekent «gracht»? — Ik weet het niet.","O que significa «gracht»? — Não sei."),("«Gracht» betekent «canal».","«Gracht» significa «canal».")],
  review=["v-betekenen","v-woord","v-wat"],
  cefr=C, exs=[
    MC("Perguntam-te algo que não sabes. Dizes:", ["*Ik weet het niet.","Ik heet het niet.|«heten» = chamar-se.","Graag gedaan.|Não."], "Não saber.", ["v-ik-weet-het-niet"]),
    TR("pt-nl","Não sei.", ["Ik weet het niet(.)"], "Expressão fixa.", ["v-ik-weet-het-niet"]),
    TR("pt-nl","O que significa esta palavra?", ["Wat betekent dit woord?","Wat betekent dat woord?"], "betekenen.", ["v-betekenen","v-woord"]),
    FB("Wat ___ «boom»?", ["betekent"], "Ele/isso: betekent.", ["v-betekenen"], choices=["betekent","betekenen","zegt"], tr="O que significa «boom»?"),
    FB("«Boom» betekent «___».", ["árvore"], "Vocabulário.", ["v-boom"], choices=["árvore","rua","janela"], tr="«Boom» significa «árvore»."),
    DL([("Docent","Wat betekent «raam»?","O que significa «raam»?"),("Jij","","")], ["*«Raam» betekent «janela».","Ik weet het niet, sorry.|Também é possível — mas tu aprendeste esta palavra!","Hoe gaat het?|Não."], "Responder.", ["v-raam","v-betekenen"]),
    LI("Ik weet het niet.", ["Ik weet het niet(.)"], "Não sei.", "Ouvir.", ["v-ik-weet-het-niet"]),
    WO("Não sei.", ["Ik","weet","het","niet."], "Ordem.", ["v-ik-weet-het-niet"]),
  ], diff=1, mins=4)

L(15, "O meu e-mail", "Mijn e-mailadres.",
  ["Dizer e soletrar um endereço de e-mail e um código postal"],
  vocab=[N("v-e-mailadres","e-mailadres","endereço de e-mail","het"), N("v-apenstaartje","apenstaartje","arroba (@)","het"),
         N("v-postcode","postcode","código postal","de")],
  ex=[("Mijn e-mailadres is ana punt silva apenstaartje mail punt nl.","O meu e-mail é ana.silva@mail.nl."),("Mijn postcode is 3511 AB.","O meu código postal é 3511 AB.")],
  gram=[G("g-s1u04c-2","Ditar um e-mail","**@** = *apenstaartje* (literalmente «rabinho de macaco»), **.** = *punt*, **-** = *streepje*. O código postal neerlandês tem **4 números e 2 letras**: *3511 AB*. (Os dados dos exemplos são fictícios.)")],
  review=["v-spellen","v-letter","v-mijn"],
  cefr=C, exs=[
    MA([("e-mailadres","endereço de e-mail"),("apenstaartje","@"),("postcode","código postal"),("spellen","soletrar")], "Contactos.", ["v-e-mailadres","v-apenstaartje","v-postcode","v-spellen"]),
    MC("«@» diz-se…", ["*apenstaartje","punt|É o ponto.","streepje|É o hífen."], "Símbolo.", ["v-apenstaartje"]),
    MC("Um código postal neerlandês tem o formato…", ["*1234 AB","1234-567|Formato português.","AB 12|Não."], "Formato.", ["v-postcode"]),
    AR("e-mailadres", "endereço de e-mail", "het", "het adres.", ["v-e-mailadres"]),
    TR("pt-nl","Qual é o teu endereço de e-mail?", ["Wat is jouw e-mailadres?","Wat is je e-mailadres?"], "wat is.", ["v-e-mailadres"]),
    LI("Mijn postcode is 3511 AB.", ["Mijn postcode is 3511 AB(.)","Mijn postcode is 3511AB(.)"], "O meu código postal é 3511 AB.", "Dados fictícios.", ["v-postcode"]),
    FB("Mijn ___ is joao@mail.nl.", ["e-mailadres"], "E-mail.", ["v-e-mailadres"], choices=["e-mailadres","postcode","naam"], tr="O meu e-mail é joao@mail.nl."),
    LI("piet apenstaartje mail punt nl", ["piet@mail.nl","piet apenstaartje mail punt nl"], "piet@mail.nl", "Ditado de e-mail (fictício).", ["v-apenstaartje"]),
  ], diff=2, mins=5)

L(16, "Prática: na aula de neerlandês", "In de les.",
  ["Usar todas as frases de sobrevivência numa aula"],
  vocab=[],
  ex=[("Sorry, ik begrijp het niet. Nog een keer, alstublieft.","Desculpe, não percebo. Outra vez, por favor.")],
  review=["v-begrijpen","v-nog-een-keer","v-langzaam","v-hoe-spel-je-dat","v-ik-weet-het-niet","v-betekenen","v-nederlands"],
  cefr=C, exs=[
    MC("O professor fala muito depressa. Dizes:", ["*Langzaam, alstublieft.","Super!|Não.","Tot morgen!|Despedida."], "Pedir devagar.", ["v-langzaam"]),
    MC("Ouves uma palavra nova e não sabes escrevê-la:", ["*Hoe spel je dat?","Wat is jouw naam?|Não.","Ik woon hier.|Não."], "Soletrar.", ["v-hoe-spel-je-dat"]),
    MC("Não conheces a palavra «straat»:", ["*Wat betekent «straat»?","Hoe gaat het met «straat»?|Não.","Ik ben straat.|Não."], "Significado.", ["v-betekenen"]),
    TR("pt-nl","Desculpe, não percebo.", ["Sorry, ik begrijp het niet(.)","Pardon, ik begrijp het niet(.)"], "Frase de sobrevivência.", ["v-begrijpen"]),
    TR("pt-nl","Como se diz «obrigado» em neerlandês?", ["Wat is «obrigado» in het Nederlands?","Hoe zeg je «obrigado» in het Nederlands?"], "in het Nederlands.", ["v-nederlands"]),
    LI("Langzaam, alstublieft. Ik spreek een beetje Nederlands.", ["Langzaam(,) alstublieft(.) Ik spreek een beetje Nederlands(.)"], "Devagar, por favor. Falo um pouco de neerlandês.", "Ouvir.", ["v-langzaam","v-nederlands"]),
    DL([("Docent","Begrijp je het?","Percebes?"),("Jij","","")], ["*Nee, nog een keer, alstublieft.","Ja, tot morgen.|Não.","Mijn postcode is 3511 AB.|Não."], "Pedir ajuda.", ["v-nog-een-keer"]),
    SW("Escreva 3 frases úteis para a aula (pedir para repetir, falar devagar, soletrar).", ["Nog een keer, alstublieft.\nLangzaam, alstublieft.\nHoe spel je dat?"], ["3 frases"], 6, "Frases úteis.", ["v-nog-een-keer","v-langzaam","v-hoe-spel-je-dat"]),
  ], diff=2, mins=5)

W()
