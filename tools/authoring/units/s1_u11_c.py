import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s1-u11")
C = "A1"
# Lições extra (11–16): mais verbos no presente, -dt, perguntas, graag e irregulares.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(11, "Cantar e conduzir", "Zingen en rijden.",
  ["Conjugar dois verbos novos do dia a dia"],
  vocab=[X("v-zingen","zingen","cantar","verb"), X("v-rijden","rijden","conduzir; andar (de bicicleta, comboio)","verb")],
  ex=[("Ik zing in de auto.","Canto no carro."),("Mijn vader rijdt naar Utrecht.","O meu pai vai de carro para Utrecht.")],
  review=["v-werken","v-komen","v-auto"],
  cefr=C, exs=[
    MA([("zingen","cantar"),("rijden","conduzir"),("lezen","ler"),("slapen","dormir")], "Verbos.", ["v-zingen","v-rijden","v-lezen","v-slapen"]),
    CJ("zingen","ik","Ik ___ graag.", ["zing"], "ik + radical: zing.", ["v-zingen"]),
    CJ("zingen","zij","Zij ___ in een koor.", ["zingt"], "zij + -t.", ["v-zingen"]),
    CJ("rijden","hij","Hij ___ naar Delft.", ["rijdt"], "rijd + t = rijdt (pronuncia-se «reit»).", ["v-rijden"]),
    CJ("rijden","wij","Wij ___ met de auto.", ["rijden"], "Plural = infinitivo.", ["v-rijden"]),
    TR("pt-nl","Canto no carro.", ["Ik zing in de auto(.)"], "zingen.", ["v-zingen","v-auto"]),
    TR("pt-nl","Ela conduz para o trabalho.", ["Ze rijdt naar het werk(.)","Zij rijdt naar haar werk(.)","Ze rijdt naar haar werk(.)"], "rijdt.", ["v-rijden"]),
    LI("Mijn moeder zingt heel mooi.", ["Mijn moeder zingt heel mooi(.)"], "A minha mãe canta muito bem.", "Ouvir.", ["v-zingen"]),
  ], diff=2, mins=4)

L(12, "Radical em -d: + t", "Hij rijdt, hij wordt, hij vindt.",
  ["Escrever bem os verbos cujo radical acaba em -d"],
  vocab=[],
  ex=[("Hij rijdt naar huis.","Ele vai de carro para casa."),("Rijd jij?","Conduzes tu?")],
  gram=[G("g-s1u11c-1","d + t","Se o radical acaba em **-d**, com hij/zij/het (e jij) junta-se **-t** na mesma: *rijd* → **rijdt**. Soa igual a «rijt», mas escreve-se **dt**. Na pergunta com jij, o -t cai: **rijd jij?**")],
  review=["v-rijden"],
  cefr=C, exs=[
    MC("«Ele conduz» escreve-se…", ["*hij rijdt","hij rijd|Falta o -t.","hij rijt|O radical é rijd."], "-dt.", ["v-rijden"]),
    MC("«Conduzes tu?» escreve-se…", ["*Rijd jij?","Rijdt jij?|Na pergunta com jij o -t cai.","Rijden jij?|Não."], "Inversão.", ["v-rijden"]),
    CJ("rijden","jij","Jij ___ goed.", ["rijdt"], "jij rijdt.", ["v-rijden"]),
    CJ("rijden","ik","Ik ___ elke dag.", ["rijd"], "ik + radical.", ["v-rijden"]),
    FE(["Zij","rijd","naar","Rotterdam."], 1, "rijdt", "zij → rijdt.", ["v-rijden"]),
    FE(["Rijdt","jij","morgen?"], 0, "Rijd", "Pergunta com jij: sem -t.", ["v-rijden"]),
    LI("Hij rijdt naar huis.", ["Hij rijdt naar huis(.)"], "Ele vai de carro para casa.", "Ouve-se «t», escreve-se «dt».", ["v-rijden"]),
    WO("Ele conduz bem.", ["Hij","rijdt","goed."], "Ordem.", ["v-rijden"]),
  ], diff=2, mins=4)

L(13, "Perguntas com verbos", "Werk jij? Woont hij hier?",
  ["Fazer perguntas de sim ou não com o verbo primeiro"],
  vocab=[],
  ex=[("Werk jij vandaag?","Trabalhas hoje?"),("Woont hij in Leiden?","Ele mora em Leiden?")],
  gram=[G("g-s1u11c-2","Pergunta: verbo primeiro","Numa pergunta de sim/não, o **verbo vem primeiro**: *Jij werkt* → **Werk jij?** Com **jij/je** depois do verbo, cai o **-t**. Com outros sujeitos fica: **Werkt hij?**")],
  review=["v-werken","v-wonen","v-lezen","v-drinken"],
  cefr=C, exs=[
    MC("«Trabalhas?»", ["*Werk jij?","Werkt jij?|Com jij depois do verbo, cai o -t.","Jij werkt?|Na escrita a pergunta começa pelo verbo."], "Inversão.", ["v-werken"]),
    MC("«Ele lê?»", ["*Leest hij?","Lees hij?|Com hij fica o -t.","Hij lees?|Não."], "Inversão.", ["v-lezen"]),
    TR("pt-nl","Bebes café?", ["Drink jij koffie?","Drink je koffie?"], "drink jij.", ["v-drinken"]),
    TR("pt-nl","Ela mora aqui?", ["Woont zij hier?","Woont ze hier?"], "woont zij.", ["v-wonen"]),
    FB("___ jij morgen? (werken)", ["Werk"], "Sem -t.", ["v-werken"], choices=["Werk","Werkt","Werken"], tr="Trabalhas amanhã?"),
    FB("___ jullie Nederlands? (leren)", ["Leren"], "Plural.", ["v-leren"], choices=["Leren","Leert","Leer"], tr="Vocês aprendem neerlandês?"),
    LI("Slaap je goed?", ["Slaap je goed(?)","Slaap jij goed(?)"], "Dormes bem?", "Ouvir.", ["v-slapen"]),
    WO("Trabalhas hoje?", ["Werk","jij","vandaag?"], "Verbo primeiro.", ["v-werken","v-vandaag"]),
  ], diff=2, mins=4)

L(14, "Gosto e não gosto", "Ik lees graag. Ik kook niet graag.",
  ["Dizer o que gostas e não gostas de fazer com graag"],
  vocab=[X("v-niet-graag","niet graag","não gostar de (fazer)","adverb")],
  ex=[("Ik lees graag.","Gosto de ler."),("Hij werkt niet graag op zaterdag.","Ele não gosta de trabalhar ao sábado.")],
  gram=[G("g-s1u11c-3","Verbo + graag","«Gostar de fazer» = **verbo + graag**: *Ik zing **graag*** (gosto de cantar). Negativo: **niet graag**: *Ik slaap **niet graag** lang.*")],
  review=["v-graag","v-zingen","v-lezen","v-reizen"],
  cefr=C, exs=[
    MC("«Gosto de viajar» =", ["*Ik reis graag.","Ik graag reis.|graag vem depois do verbo.","Ik heb graag reizen.|Não."], "graag.", ["v-graag","v-reizen"]),
    TR("pt-nl","Gosto de ler.", ["Ik lees graag(.)"], "graag.", ["v-graag","v-lezen"]),
    TR("pt-nl","Não gosto de esperar.", ["Ik wacht niet graag(.)"], "niet graag.", ["v-niet-graag","v-wachten"]),
    TR("nl-pt","Zij zingt graag.", ["Ela gosta de cantar(.)"], "graag.", ["v-zingen"]),
    FB("Ik werk ___ graag op zondag.", ["niet"], "Negação.", ["v-niet-graag"], choices=["niet","geen","nooit graag"], tr="Não gosto de trabalhar ao domingo."),
    DL([("Vriend","Lees je graag?","Gostas de ler?"),("Jij","","")], ["*Ja, heel graag!","Ja, ik ben boek.|Não faz sentido.","Graag gedaan.|É resposta a «obrigado»."], "Responder.", ["v-graag"]),
    LI("Ik reis graag, maar ik wacht niet graag.", ["Ik reis graag(,) maar ik wacht niet graag(.)"], "Gosto de viajar, mas não gosto de esperar.", "Ouvir.", ["v-niet-graag","v-reizen"]),
    WO("Gosto de cantar.", ["Ik","zing","graag."], "Ordem.", ["v-zingen","v-graag"]),
  ], diff=2, mins=4)

L(15, "Os irregulares mais usados", "Gaan, doen, zien, staan, komen.",
  ["Conjugar os verbos curtos irregulares"],
  vocab=[],
  ex=[("Ik ga naar huis.","Vou para casa."),("Wat doe je?","O que fazes?"),("Ik zie je morgen.","Vejo-te amanhã.")],
  gram=[G("g-s1u11c-4","Verbos curtos","**gaan**: ik ga, jij gaat, wij gaan · **doen**: ik doe, hij doet · **zien**: ik zie, hij ziet · **staan**: ik sta, hij staat · **komen**: ik kom, hij komt.")],
  review=["v-gaan","v-doen","v-zien","v-staan","v-komen"],
  cefr=C, exs=[
    CJ("gaan","ik","Ik ___ naar huis.", ["ga"], "ik ga.", ["v-gaan"]),
    CJ("gaan","hij","Hij ___ naar het station.", ["gaat"], "hij gaat.", ["v-gaan"]),
    CJ("doen","jij","Wat ___ jij?", ["doe"], "Pergunta: doe jij.", ["v-doen"]),
    CJ("zien","zij","Zij ___ de zee.", ["ziet"], "zij ziet.", ["v-zien"]),
    CJ("staan","ik","Ik ___ bij de deur.", ["sta"], "ik sta.", ["v-staan"]),
    TR("pt-nl","Vejo-te amanhã.", ["Ik zie je morgen(.)","Ik zie jou morgen(.)"], "zien.", ["v-zien","v-morgen"]),
    TR("pt-nl","O que fazes?", ["Wat doe je?","Wat doe jij?"], "doen.", ["v-doen"]),
    FE(["Hij","doe","zijn","werk."], 1, "doet", "hij doet.", ["v-doen"]),
  ], diff=2, mins=4)

L(16, "Prática: o dia da Inês", "Een gewone dag.",
  ["Compreender e escrever um texto curto no presente"],
  vocab=[],
  ex=[("(Fictício) Inês werkt in een restaurant. Ze rijdt met de fiets naar haar werk. Ze zingt graag.","A Inês trabalha num restaurante…")],
  review=["v-werken","v-rijden","v-zingen","v-slapen","v-lezen","v-niet-graag","v-graag"],
  cefr=C, exs=[
    MC("(Fictício) «Inês werkt in een restaurant. Ze rijdt met de fiets naar haar werk.» Como vai a Inês para o trabalho?", ["*de bicicleta","de carro|Não diz carro.","a pé|Não."], "Compreensão.", ["v-rijden","v-fiets"]),
    MC("(Fictício) «Ze leest graag, maar ze kookt niet graag.» Do que não gosta?", ["*de cozinhar","de ler|Gosta.","de cantar|Não diz."], "Compreensão (koken = cozinhar).", ["v-niet-graag"]),
    TR("pt-nl","Ela trabalha num restaurante.", ["Ze werkt in een restaurant(.)","Zij werkt in een restaurant(.)"], "werkt.", ["v-werken","v-restaurant"]),
    TR("pt-nl","Ela lê um livro.", ["Ze leest een boek(.)","Zij leest een boek(.)"], "leest.", ["v-lezen","v-boek"]),
    LI("Ze slaapt lang op zondag.", ["Ze slaapt lang op zondag(.)","Zij slaapt lang op zondag(.)"], "Ela dorme muito ao domingo.", "Ouvir.", ["v-slapen"]),
    BS("Gosto de ler e de viajar.", ["Ik","lees","en","reis","graag."], ["Ik lees en reis graag."], "graag no fim.", ["v-lezen","v-reizen"]),
    DL([("Collega","Wat doe je in het weekend?","O que fazes ao fim de semana?"),("Jij","","")], ["*Ik slaap lang en ik lees een boek.","Ik ben het weekend.|Não faz sentido.","Ja, graag.|Não responde."], "Responder.", ["v-doen"]),
    SW("Escreva 3–4 frases sobre o seu dia (trabalho, transporte, do que gosta).", ["Ik werk in een kantoor. Ik rijd met de trein naar mijn werk. Ik lees graag, maar ik wacht niet graag."], ["Verbos no presente","graag"], 15, "Escrever.", ["v-graag","v-werken"]),
  ], diff=2, mins=5)

W()
