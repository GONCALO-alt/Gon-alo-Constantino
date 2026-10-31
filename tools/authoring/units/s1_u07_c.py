import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u07")
C = "A1"
# Lições extra (13–18): números que faltavam, números compostos, preços, telefone e idades.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(13, "Os números da adolescência", "Zestien, zeventien, negentien.",
  ["Dizer os números 16 a 19"],
  vocab=[X("v-zestien","zestien","dezasseis","numeral"), X("v-negentien","negentien","dezanove","numeral")],
  ex=[("Mijn zus is zestien.","A minha irmã tem dezasseis anos."),("Bus negentien gaat naar het station.","O autocarro dezanove vai para a estação.")],
  gram=[G("g-s1u07c-1","13–19","Os números de 13 a 19 terminam em **-tien**: dertien, veertien, vijftien, **zestien**, zeventien, achttien, **negentien**. Repara: *veertien* (não «viertien») e *dertien* (não «drietien»).")],
  review=["v-dertien","v-veertien","v-vijftien","v-achttien"],
  cefr=C, exs=[
    MA([("zestien","16"),("negentien","19"),("achttien","18"),("veertien","14")], "Números.", ["v-zestien","v-negentien","v-achttien","v-veertien"]),
    MC("«veertien» é…", ["*14","40|Isso é veertig.","4|Isso é vier."], "-tien = 13–19.", ["v-veertien"]),
    MC("Como se escreve 13?", ["*dertien","drietien|Muda para «der».","dertig|Isso é 30."], "Irregular.", ["v-dertien"]),
    LI("zestien", ["zestien","16"], "dezasseis", "Ouvir.", ["v-zestien"]),
    LI("negentien", ["negentien","19"], "dezanove", "Ouvir.", ["v-negentien"]),
    TR("pt-nl","A minha irmã tem dezasseis anos.", ["Mijn zus is zestien(.)","Mijn zus is zestien jaar(.)","Mijn zus is 16(.)"], "Idade com zijn.", ["v-zestien"]),
    FB("Vijftien, ___, zeventien.", ["zestien"], "Sequência.", ["v-zestien"], choices=["zestien","zestig","zes"], tr="Quinze, dezasseis, dezassete."),
    FB("Achttien, ___, twintig.", ["negentien"], "Sequência.", ["v-negentien"], choices=["negentien","negentig","negen"], tr="Dezoito, dezanove, vinte."),
  ], diff=2, mins=4)

L(14, "De 21 a 99: ao contrário", "Eenentwintig = um-e-vinte.",
  ["Dizer números compostos à neerlandesa (unidade primeiro)"],
  vocab=[X("v-zeventig","zeventig","setenta","numeral"), X("v-negentig","negentig","noventa","numeral")],
  ex=[("Eenentwintig.","Vinte e um (literalmente: um-e-vinte)."),("Zevenenzeventig.","Setenta e sete."),("Mijn opa is negentig.","O meu avô tem noventa anos.")],
  gram=[G("g-s1u07c-2","Unidade primeiro","De 21 a 99 diz-se primeiro a **unidade**, depois **en**, depois a dezena, tudo junto: 21 = **eenentwintig**, 35 = **vijfendertig**, 86 = **zesentachtig**. Com *twee*/*drie* + *en* escreve-se com trema: **tweeëntwintig**, **drieëndertig**.",
    [("vierenveertig","44"),("tweeënvijftig","52")])],
  review=["v-twintig","v-dertig","v-veertig","v-vijftig","v-zestig","v-tachtig"],
  cefr=C, exs=[
    MA([("zeventig","70"),("negentig","90"),("tachtig","80"),("zestig","60")], "Dezenas.", ["v-zeventig","v-negentig","v-tachtig","v-zestig"]),
    MC("«vijfendertig» =", ["*35","53|A unidade vem primeiro.","15|Não."], "Unidade primeiro.", ["v-dertig"]),
    MC("Como se diz 47?", ["*zevenenveertig","veertigenzeven|Unidade primeiro.","vierenzeventig|Isso é 74."], "Unidade primeiro.", ["v-veertig"]),
    MC("Como se escreve 32?", ["*tweeëndertig","tweeendertig|Leva trema: ë.","dertigtwee|Não."], "Trema.", ["v-dertig"]),
    LI("eenendertig", ["eenendertig","31"], "trinta e um", "Ouvir.", ["v-dertig"]),
    LI("achtenzestig", ["achtenzestig","68"], "sessenta e oito", "Ouvir.", ["v-zestig"]),
    TR("nl-pt","Mijn opa is negentig.", ["O meu avô tem noventa anos(.)","O meu avô tem 90 anos(.)","O meu avô tem 90(.)"], "negentig.", ["v-negentig"]),
    FB("70 = ___", ["zeventig"], "Dezena.", ["v-zeventig"], choices=["zeventig","zeventien","zevenig"], tr="Setenta."),
  ], diff=2, mins=5)

L(15, "Cem, mil e preços", "Honderd, duizend en euro's.",
  ["Dizer preços e números até milhares"],
  vocab=[X("v-duizend","duizend","mil","numeral")],
  ex=[("Het kost duizend euro.","Custa mil euros."),("Het kost twee euro vijftig.","Custa dois euros e cinquenta.")],
  gram=[G("g-s1u07c-3","Dizer preços","**€2,50** diz-se *twee euro vijftig* (euro no singular, sem «e»). **€1.200** = *twaalfhonderd euro* ou *duizend tweehonderd euro*. Em neerlandês a vírgula separa os cêntimos e o ponto os milhares.")],
  review=["v-honderd","v-euro","v-cent","v-kosten","v-hoeveel"],
  cefr=C, exs=[
    MA([("duizend","mil"),("honderd","cem"),("euro","euro"),("cent","cêntimo")], "Dinheiro.", ["v-duizend","v-honderd","v-euro","v-cent"]),
    MC("«€3,50» diz-se…", ["*drie euro vijftig","drie euro's en vijftig|Euro no singular e sem «en».","vijftig drie euro|Não."], "Preços.", ["v-euro"]),
    TR("pt-nl","Quanto custa este livro?", ["Hoeveel kost dit boek?","Wat kost dit boek?"], "kosten.", ["v-hoeveel","v-kosten"]),
    TR("pt-nl","Custa mil euros.", ["Het kost duizend euro(.)","Het kost 1000 euro(.)"], "duizend.", ["v-duizend"]),
    LI("Het kost vier euro twintig.", ["Het kost vier euro twintig(.)","Het kost €4,20(.)","Het kost 4,20(.)","Het kost 4 euro 20(.)"], "Custa 4,20 €.", "Preço.", ["v-euro"]),
    LI("Dat kost honderd euro.", ["Dat kost honderd euro(.)","Dat kost 100 euro(.)"], "Isso custa cem euros.", "Preço.", ["v-honderd"]),
    FB("De fiets kost ___ euro. (300)", ["driehonderd"], "300.", ["v-honderd"], choices=["driehonderd","dertig","drieduizend"], tr="A bicicleta custa 300 euros."),
    DL([("Verkoper","Dat is dan zes euro tachtig.","São seis euros e oitenta."),("Jij","","")], ["*Alstublieft. (e pagas)","Hoe oud bent u?|Não.","Gefeliciteerd!|Não."], "Pagar.", ["v-alstublieft"]),
  ], diff=2, mins=4)

L(16, "O meu número de telefone", "Nul zes, twaalf…",
  ["Dizer e perceber números de telefone"],
  vocab=[],
  ex=[("Mijn telefoonnummer is 06 12 34 56 78.","O meu número é 06 12 34 56 78 (fictício)."),("Wat is je telefoonnummer?","Qual é o teu número de telefone?")],
  gram=[G("g-s1u07c-4","Números de telemóvel","Os números de telemóvel neerlandeses começam por **06**. Costumam ditar-se aos pares: *nul zes – twaalf – vierendertig…* ou algarismo a algarismo. (Os números dos exemplos são fictícios.)")],
  review=["v-telefoonnummer","v-nul","v-wat"],
  cefr=C, exs=[
    MC("Um número de telemóvel neerlandês começa por…", ["*06","+351|É o indicativo de Portugal.","112|É o número de emergência."], "Formato.", ["v-telefoonnummer"]),
    TR("pt-nl","Qual é o teu número de telefone?", ["Wat is jouw telefoonnummer?","Wat is je telefoonnummer?"], "telefoonnummer.", ["v-telefoonnummer"]),
    LI("nul zes, twaalf, vierendertig", ["06 12 34","0612 34","nul zes twaalf vierendertig","061234"], "06 12 34", "Ditado (fictício).", ["v-nul"]),
    LI("nul zes, achtenvijftig, negentig", ["06 58 90","065890","nul zes achtenvijftig negentig"], "06 58 90", "Ditado (fictício).", ["v-nul"]),
    MC("Ouves «drieënzeventig». Escreves:", ["*73","37|Unidade primeiro: drie-en-zeventig.","703|Não."], "Unidade primeiro.", ["v-zeventig"]),
    FB("Mijn ___ is 06 11 22 33 44.", ["telefoonnummer"], "Número.", ["v-telefoonnummer"], choices=["telefoonnummer","datum","verjaardag"], tr="O meu número é 06 11 22 33 44."),
    DL([("Collega","Mag ik je telefoonnummer?","Dás-me o teu número?"),("Jij","","")], ["*Nul zes, vijftien, negenentwintig, …","Ik ben dertig.|É a idade.","Duizend euro.|Não."], "Dizer número.", ["v-telefoonnummer"]),
    MC("«nul» significa…", ["*zero","nove|Isso é negen.","nulo (documento)|Aqui é o número 0."], "Número.", ["v-nul"]),
  ], diff=2, mins=4)

L(17, "Idades e aniversários", "Ik ben dertig jaar oud.",
  ["Perguntar e dizer idades; dar os parabéns"],
  vocab=[X("v-jaar-oud","… jaar oud","… anos (de idade)")],
  ex=[("Hoe oud ben je? — Ik ben vierendertig jaar oud.","Quantos anos tens? — Tenho trinta e quatro anos."),("Ben je vandaag jarig? Gefeliciteerd!","Fazes anos hoje? Parabéns!")],
  gram=[G("g-s1u07c-5","Idade com «zijn»","Em neerlandês **é-se** a idade: *Ik **ben** dertig* (não «ik heb»). *Jaar oud* é opcional: *Ik ben dertig (jaar oud)*.")],
  review=["v-hoe-oud","v-jarig","v-gefeliciteerd","v-verjaardag","v-vandaag"],
  cefr=C, exs=[
    MC("Como se diz «Tenho 25 anos»?", ["*Ik ben vijfentwintig.","Ik heb vijfentwintig.|Idade com «zijn».","Ik ben twintigvijf.|Unidade primeiro."], "Idade.", ["v-jaar-oud","v-hoe-oud"]),
    TR("pt-nl","Quantos anos tens?", ["Hoe oud ben jij?","Hoe oud ben je?"], "hoe oud.", ["v-hoe-oud"]),
    TR("pt-nl","Tenho trinta e cinco anos.", ["Ik ben vijfendertig(.)","Ik ben vijfendertig jaar(.)","Ik ben vijfendertig jaar oud(.)","Ik ben 35(.)"], "zijn.", ["v-jaar-oud"]),
    TR("pt-nl","Fazes anos hoje? Parabéns!", ["Ben je vandaag jarig? Gefeliciteerd!","Ben jij vandaag jarig? Gefeliciteerd!"], "jarig zijn.", ["v-jarig","v-gefeliciteerd"]),
    FB("Mijn oma is ___ jaar oud. (82)", ["tweeëntachtig"], "82.", ["v-tachtig"], choices=["tweeëntachtig","achtentwintig","tachtigtwee"], tr="A minha avó tem 82 anos."),
    LI("Mijn dochter wordt morgen elf.", ["Mijn dochter wordt morgen elf(.)","Mijn dochter wordt morgen 11(.)"], "A minha filha faz onze anos amanhã.", "worden = fazer (anos).", ["v-elf","v-morgen"]),
    DL([("Vriendin","Raad eens: ik ben vandaag jarig!","Adivinha: faço anos hoje!"),("Jij","","")], ["*Gefeliciteerd! Hoe oud ben je?","Geeft niet.|Não.","Tot morgen.|Não."], "Dar os parabéns.", ["v-gefeliciteerd"]),
    WO("Tenho trinta anos.", ["Ik","ben","dertig","jaar","oud."], "Ordem.", ["v-jaar-oud"]),
  ], diff=2, mins=4)

L(18, "Prática: números no dia a dia", "Getallen overal.",
  ["Perceber números em preços, idades e telefones"],
  vocab=[],
  ex=[("(Fictício) Pieter is drieënveertig. Zijn nummer is 06 23 45 67 89. Zijn fiets kost vierhonderd euro.","O Pieter tem 43 anos…")],
  review=["v-zeventig","v-duizend","v-jaar-oud","v-telefoonnummer","v-kosten","v-eerste"],
  cefr=C, exs=[
    MC("(Fictício) «Pieter is drieënveertig.» Que idade tem?", ["*43","34|Unidade primeiro.","403|Não."], "Idade.", ["v-jaar-oud"]),
    MC("«De fiets kost vierhonderd euro.» Quanto custa?", ["*400 €","40 €|Isso é veertig.","4000 €|Isso é vierduizend."], "Preço.", ["v-honderd"]),
    LI("Ik ben negenenvijftig jaar.", ["Ik ben negenenvijftig jaar(.)","Ik ben 59 jaar(.)"], "Tenho 59 anos.", "Idade.", ["v-jaar-oud"]),
    LI("Dat kost twaalf euro negentig.", ["Dat kost twaalf euro negentig(.)","Dat kost €12,90(.)","Dat kost 12,90(.)"], "Isso custa 12,90 €.", "Preço.", ["v-negentig"]),
    LI("Het is de eerste dag van de maand.", ["Het is de eerste dag van de maand(.)"], "É o primeiro dia do mês.", "Ordinal.", ["v-eerste"]),
    TR("pt-nl","Custa setenta euros.", ["Het kost zeventig euro(.)","Het kost 70 euro(.)"], "zeventig.", ["v-zeventig"]),
    FB("Honderd, tweehonderd, ___. (300)", ["driehonderd"], "Sequência.", ["v-honderd"], choices=["driehonderd","dertig","drieduizend"], tr="Cem, duzentos, trezentos."),
    MC("Qual é maior?", ["*duizend","negentig|90.","honderd|100."], "Comparar.", ["v-duizend"]),
  ], diff=2, mins=5)

W()
