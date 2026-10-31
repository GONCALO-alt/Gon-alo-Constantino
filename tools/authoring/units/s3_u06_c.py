import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u06")
C = "A2"
# Lições extra (10–15): ótica, dentista, cabeleireiro, mudar marcações, lembretes.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Na ótica", "Bij de opticien.",
  ["Marcar um exame à vista"],
  vocab=[N("v-opticien","opticien","oculista (loja de óculos)","de","opticiens"), N("v-lenzen","lenzen","lentes de contacto","de")],
  ex=[("Ik maak een afspraak bij de opticien voor een oogmeting.","Marco uma consulta na ótica para medir a vista."),("Ik draag lenzen, geen bril.","Uso lentes de contacto, não óculos.")],
  review=["v-afspraak-maken","v-bril"],
  cefr=C, exs=[
    MA([("opticien","oculista"),("lenzen","lentes de contacto"),("bril","óculos"),("een afspraak maken","marcar uma consulta")], "Vista.", ["v-opticien","v-lenzen","v-bril","v-afspraak-maken"]),
    TR("pt-nl","Quero marcar uma consulta na ótica.", ["Ik wil een afspraak maken bij de opticien(.)","Ik wil graag een afspraak bij de opticien(.)"], "afspraak maken.", ["v-opticien","v-afspraak-maken"]),
    TR("pt-nl","Uso lentes de contacto.", ["Ik draag lenzen(.)"], "dragen.", ["v-lenzen"]),
    FB("Ik zie slecht; ik heb een nieuwe ___ nodig.", ["bril"], "Óculos.", ["v-bril"], choices=["bril","oog","kapper"], tr="Vejo mal; preciso de óculos novos."),
    DL([("Opticien","Waarmee kan ik u helpen?","Em que posso ajudar?"),("Jij","","")], ["*Ik wil graag mijn ogen laten meten.","Ik ben lenzen.|Não.","Bril.|Incompleto."], "Pedir.", ["v-opticien"]),
    LI("Uw nieuwe bril is volgende week klaar.", ["Uw nieuwe bril is volgende week klaar(.)"], "Os seus óculos novos ficam prontos na próxima semana.", "Ouvir.", ["v-bril"]),
    MC("«Uns óculos» em neerlandês é…", ["*een bril (singular)","twee brillen|Uma peça = een bril.","een brillen|Não."], "Singular.", ["v-bril"]),
    AR("opticien", "oculista", "de", "Pessoa: de.", ["v-opticien"]),
  ], diff=2, mins=4)

L(11, "No dentista", "Een gaatje in mijn kies.",
  ["Descrever um problema nos dentes"],
  vocab=[N("v-kies","kies","dente molar","de","kiezen"), N("v-gaatje","gaatje","cárie (buraquinho)","het","gaatjes")],
  ex=[("Ik heb pijn aan mijn kies.","Tenho dor num molar."),("De tandarts vindt een gaatje.","O dentista encontra uma cárie.")],
  review=["v-tandarts","v-afspraak"],
  cefr=C, exs=[
    MA([("kies","molar"),("gaatje","cárie"),("tandarts","dentista"),("afspraak","consulta")], "Dentes.", ["v-kies","v-gaatje","v-tandarts","v-afspraak"]),
    AR("gaatje", "cárie", "het", "-je → het.", ["v-gaatje"]),
    TR("pt-nl","Tenho dor num dente.", ["Ik heb pijn aan mijn kies(.)","Ik heb kiespijn(.)","Ik heb tandpijn(.)"], "pijn aan.", ["v-kies"]),
    TR("pt-nl","Tenho uma cárie.", ["Ik heb een gaatje(.)"], "gaatje.", ["v-gaatje"]),
    FB("Twee keer per jaar ga ik naar de ___ voor controle.", ["tandarts"], "Dentista.", ["v-tandarts"], choices=["tandarts","kapper","opticien"], tr="Duas vezes por ano vou ao dentista fazer controlo."),
    DL([("Assistente","Tandartspraktijk, goedemorgen.","Consultório dentário, bom dia."),("Jij","","")], ["*Goedemorgen, ik heb veel pijn aan een kies. Kan ik vandaag nog komen?","Ik ben kies.|Não.","Gaatje.|Incompleto."], "Pedir urgência.", ["v-kies"]),
    LI("Doet het pijn als ik hier druk?", ["Doet het pijn als ik hier druk(?)"], "Dói quando carrego aqui?", "Ouvir.", ["v-kies"]),
    MC("Plural de «kies»:", ["*kiezen","kiesen|s → z.","kieses|Não."], "s → z.", ["v-kies"]),
  ], diff=2, mins=4)

L(12, "No cabeleireiro: mais pedidos", "Föhnen en verven.",
  ["Pedir serviços no cabeleireiro"],
  vocab=[X("v-fohnen","föhnen","secar com secador","verb"), X("v-verven","verven","pintar (cabelo, parede)","verb")],
  ex=[("Wilt u het haar föhnen?","Quer que seque o cabelo?"),("Ik wil mijn haar laten verven.","Quero pintar o cabelo.")],
  review=["v-kapper","v-knippen","v-haar-noun","v-korter","v-wassen"],
  cefr=C, exs=[
    MA([("föhnen","secar (com secador)"),("verven","pintar"),("knippen","cortar"),("wassen","lavar")], "Cabeleireiro.", ["v-fohnen","v-verven","v-knippen","v-wassen"]),
    TR("pt-nl","Quero cortar o cabelo mais curto.", ["Ik wil mijn haar korter laten knippen(.)","Ik wil mijn haar korter(.)"], "korter.", ["v-korter","v-knippen"]),
    TR("pt-nl","Lavar e secar, por favor.", ["Wassen en föhnen(,) alstublieft(.)","Wassen en föhnen graag(.)"], "föhnen.", ["v-fohnen"]),
    FB("Ik laat mijn haar bruin ___.", ["verven"], "Pintar.", ["v-verven"], choices=["verven","föhnen","knippen"], tr="Vou pintar o cabelo de castanho."),
    DL([("Kapper","Hoe wilt u het hebben?","Como quer?"),("Jij","","")], ["*Twee centimeter korter, en daarna föhnen graag.","Ik ben haar.|Não.","Verven is leuk.|Não responde."], "Pedir.", ["v-korter"]),
    LI("Hoeveel kost knippen en föhnen?", ["Hoeveel kost knippen en föhnen(?)"], "Quanto custa cortar e secar?", "Ouvir.", ["v-fohnen"]),
    MC("«Ik laat mijn haar knippen» significa…", ["*Vou cortar o cabelo (alguém corta)","Eu próprio corto o cabelo|«laten» = mandar fazer.","Deixo crescer o cabelo|Não."], "laten.", ["v-knippen"]),
    WO("Quero pintar o cabelo.", ["Ik","wil","mijn","haar","verven."], "Ordem.", ["v-verven"]),
  ], diff=2, mins=4)

L(13, "Mudar uma marcação", "Kan ik mijn afspraak verzetten?",
  ["Adiar ou cancelar por telefone"],
  vocab=[],
  ex=[("Kan ik mijn afspraak van dinsdag verzetten?","Posso mudar a minha marcação de terça?"),("Ik moet helaas afzeggen.","Infelizmente tenho de cancelar.")],
  review=["v-verzetten","v-afzeggen","v-uitkomen","v-ander"],
  cefr=C, exs=[
    MA([("verzetten","mudar (data)"),("afzeggen","cancelar"),("uitkomen","dar jeito"),("ander","outro")], "Marcações.", ["v-verzetten","v-afzeggen","v-uitkomen","v-ander"]),
    TR("pt-nl","Posso mudar a minha marcação?", ["Kan ik mijn afspraak verzetten?","Mag ik mijn afspraak verzetten?"], "verzetten.", ["v-verzetten"]),
    TR("pt-nl","Tenho de cancelar.", ["Ik moet afzeggen(.)","Ik moet mijn afspraak afzeggen(.)"], "afzeggen.", ["v-afzeggen"]),
    FB("Komt donderdag om drie uur u beter ___?", ["uit"], "uitkomen.", ["v-uitkomen"], choices=["uit","af","op"], tr="Quinta às três dá-lhe mais jeito?"),
    DL([("Assistente","Wanneer komt het u wel uit?","Quando lhe dá jeito?"),("Jij","","")], ["*Volgende week, op woensdagochtend.","Ik ben uit.|Não.","Afzeggen.|Não responde."], "Propor.", ["v-uitkomen"]),
    MC("Muitos consultórios pedem que canceles…", ["*pelo menos 24 horas antes, senão podem cobrar","nunca|Não.","depois da hora|Tarde demais."], "Regra comum (confirma sempre).", ["v-afzeggen"]),
    LI("Ik zeg mijn afspraak van morgen af.", ["Ik zeg mijn afspraak van morgen af(.)"], "Cancelo a minha marcação de amanhã.", "Ouvir.", ["v-afzeggen"]),
    WO("Cancelo a marcação.", ["Ik","zeg","de","afspraak","af."], "Separável.", ["v-afzeggen"]),
  ], diff=2, mins=4)

L(14, "Lembretes", "Een herinnering per sms.",
  ["Perceber e responder a lembretes de marcações"],
  vocab=[],
  ex=[("Herinnering: u heeft morgen om 10.00 uur een afspraak bij de tandarts.","Lembrete: amanhã às 10h tem consulta no dentista."),("Bevestig met JA of zeg af via de website.","Confirme com SIM ou cancele no site.")],
  review=["v-herinnering","v-bevestigen","v-vergeten","v-op-tijd2"],
  cefr=C, exs=[
    MA([("herinnering","lembrete"),("bevestigen","confirmar"),("vergeten","esquecer"),("uiterlijk","o mais tardar")], "Lembretes.", ["v-herinnering","v-bevestigen","v-vergeten","v-op-tijd2"]),
    MC("(SMS fictícia) «Bevestig met JA». O que fazes para confirmar?", ["*Respondes «JA»","Respondes «NEE»|Isso não confirma.","Ligas para o 112|Não."], "Compreensão.", ["v-bevestigen"]),
    MC("(SMS) «Afzeggen uiterlijk 24 uur van tevoren.» Até quando podes cancelar?", ["*até 24 horas antes","no próprio dia|Não.","depois da consulta|Não."], "uiterlijk.", ["v-op-tijd2"]),
    TR("pt-nl","Confirmo a marcação.", ["Ik bevestig de afspraak(.)","Ik bevestig mijn afspraak(.)"], "bevestigen.", ["v-bevestigen"]),
    TR("pt-nl","Esqueci-me da consulta.", ["Ik ben de afspraak vergeten(.)","Ik ben mijn afspraak vergeten(.)"], "vergeten (com zijn).", ["v-vergeten"]),
    FB("Dank voor de ___! Ik kom morgen.", ["herinnering"], "Lembrete.", ["v-herinnering"], choices=["herinnering","kapper","kies"], tr="Obrigado pelo lembrete! Venho amanhã."),
    LI("Wilt u uw afspraak bevestigen?", ["Wilt u uw afspraak bevestigen(?)"], "Quer confirmar a sua marcação?", "Ouvir.", ["v-bevestigen"]),
    WO("Confirmo.", ["Ik","bevestig","het."], "Ordem.", ["v-bevestigen"]),
  ], diff=2, mins=4)

L(15, "Prática: uma semana de marcações", "Mijn agenda vol afspraken.",
  ["Gerir várias marcações numa semana"],
  vocab=[],
  ex=[("(Fictício) Maandag: tandarts 9.00. Woensdag: kapper 17.30. Vrijdag: opticien 14.00.","Agenda da semana.")],
  review=["v-tandarts","v-kapper","v-opticien","v-verzetten","v-herinnering","v-afzeggen"],
  cefr=C, exs=[
    MC("(Fictício) Agenda: «Woensdag: kapper 17.30». O que há na quarta?", ["*cabeleireiro às 17h30","dentista|É na segunda.","ótica|É na sexta."], "Compreensão.", ["v-kapper"]),
    MC("Tens reunião na segunda às 9h. O que fazes com o dentista?", ["*Ligas para verzetten (mudar)","Vais aos dois ao mesmo tempo|Impossível.","Nada|Não vais e não avisas."], "Decidir.", ["v-verzetten"]),
    TR("pt-nl","Tenho consulta no dentista na segunda.", ["Ik heb maandag een afspraak bij de tandarts(.)","Op maandag heb ik een afspraak bij de tandarts(.)"], "bij de tandarts.", ["v-tandarts"]),
    LI("Ik wil mijn afspraak bij de kapper een uur later.", ["Ik wil mijn afspraak bij de kapper een uur later(.)"], "Quero a marcação no cabeleireiro uma hora mais tarde.", "Ouvir.", ["v-kapper"]),
    BS("Posso mudar a consulta para sexta?", ["Kan","ik","de","afspraak","naar","vrijdag","verzetten?"], ["Kan ik de afspraak naar vrijdag verzetten?"], "verzetten naar.", ["v-verzetten"]),
    DL([("Assistente","Huisartsenpraktijk, met Linda.","Consultório médico, fala a Linda."),("Jij","","")], ["*Goedemorgen, met Pedro Sousa. Ik wil een afspraak maken.","Ik ben Linda.|Não.","Kapper.|Não."], "Telefonar.", ["v-afspraak-maken"]),
    FB("Ik kan maandag niet; ik moet de afspraak ___.", ["afzeggen"], "Cancelar.", ["v-afzeggen"], choices=["afzeggen","bevestigen","knippen"], tr="Não posso na segunda; tenho de cancelar a consulta."),
    SW("Escreva uma mensagem curta ao consultório: não pode ir na terça, pede outra data.", ["Goedemiddag, ik heb dinsdag om 10.00 uur een afspraak, maar ik kan helaas niet komen. Kan ik de afspraak verzetten naar donderdag? Met vriendelijke groet, Rita Lopes"], ["Marcação atual","Motivo","Pedido"], 20, "Escrever.", ["v-verzetten"]),
  ], diff=2, mins=5)

W()
