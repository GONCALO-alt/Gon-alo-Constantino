import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u10")
C = "A2"
# Lições extra (10–15): mobilar, mudança, conhecer os vizinhos, avarias, rescindir o contrato.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Mobilar a casa", "Meubels kopen.",
  ["Falar de móveis para uma casa nova"],
  vocab=[N("v-meubels","meubels","móveis","de")],
  ex=[("Het appartement is niet gemeubileerd; we moeten meubels kopen.","O apartamento não é mobilado; temos de comprar móveis."),("Tweedehands meubels zijn goedkoper.","Móveis em segunda mão são mais baratos.")],
  review=["v-gemeubileerd","v-kast","v-bank","v-bed"],
  cefr=C, exs=[
    MA([("meubels","móveis"),("gemeubileerd","mobilado"),("kast","armário"),("bank","sofá")], "Móveis.", ["v-meubels","v-gemeubileerd","v-kast","v-bank"]),
    MC("«Ongemeubileerd» significa…", ["*sem móveis","com móveis|Isso é gemeubileerd.","muito barato|Não."], "on- = sem.", ["v-gemeubileerd"]),
    TR("pt-nl","Temos de comprar móveis.", ["We moeten meubels kopen(.)","Wij moeten meubels kopen(.)"], "meubels.", ["v-meubels"]),
    TR("pt-nl","O quarto é mobilado?", ["Is de kamer gemeubileerd?"], "gemeubileerd.", ["v-gemeubileerd"]),
    FB("Tweedehands ___ zijn vaak goedkoper.", ["meubels"], "Móveis.", ["v-meubels"], choices=["meubels","huur","borg"], tr="Móveis em segunda mão são muitas vezes mais baratos."),
    LI("We zoeken nog een kast voor de slaapkamer.", ["We zoeken nog een kast voor de slaapkamer(.)"], "Ainda procuramos um armário para o quarto.", "Ouvir.", ["v-kast"]),
    DL([("Verhuurder","De woning is kaal; er zijn geen meubels.","A casa está vazia; não há móveis."),("Jij","","")], ["*Prima, wij nemen onze eigen meubels mee.","Ik ben meubel.|Não.","Gemeubileerd.|Contraditório."], "Responder.", ["v-meubels"]),
    AR("meubels", "móveis", "de", "Plural: de.", ["v-meubels"]),
  ], diff=2, mins=4)

L(11, "O dia da mudança", "Een verhuisbus huren.",
  ["Organizar a mudança"],
  vocab=[N("v-verhuisbus","verhuisbus","carrinha de mudanças","de")],
  ex=[("Zaterdag huren we een verhuisbus.","No sábado alugamos uma carrinha de mudanças."),("Kun je me helpen met verhuizen?","Podes ajudar-me na mudança?")],
  review=["v-verhuizen","v-verhuisdoos","v-huren","v-helpen"],
  cefr=C, exs=[
    MA([("verhuisbus","carrinha de mudanças"),("verhuisdoos","caixa de mudanças"),("verhuizen","mudar de casa"),("huren","alugar")], "Mudança.", ["v-verhuisbus","v-verhuisdoos","v-verhuizen","v-huren"]),
    TR("pt-nl","No sábado mudo de casa.", ["Zaterdag verhuis ik(.)","Op zaterdag verhuis ik(.)","Ik verhuis op zaterdag(.)"], "verhuizen.", ["v-verhuizen"]),
    TR("pt-nl","Podes ajudar-me na mudança?", ["Kun je me helpen met verhuizen?","Kun je me helpen met de verhuizing?","Kan je me helpen met verhuizen?"], "helpen met.", ["v-helpen"]),
    FB("We hebben twintig ___ vol boeken.", ["verhuisdozen"], "Plural.", ["v-verhuisdoos"], choices=["verhuisdozen","verhuisbussen","meubels"], tr="Temos vinte caixas cheias de livros."),
    DL([("Vriend","Hoe laat moet ik er zijn?","A que horas tenho de estar aí?"),("Jij","","")], ["*Om negen uur; de verhuisbus komt om half tien.","Ik ben verhuisbus.|Não.","Verhuizen.|Não."], "Combinar.", ["v-verhuisbus"]),
    LI("De bank past niet door de deur!", ["De bank past niet door de deur(!)"], "O sofá não passa pela porta!", "Ouvir.", ["v-bank"]),
    MC("Ao mudar de casa, deves comunicar a nova morada…", ["*à gemeente (e a outras entidades)","só aos amigos|Também à câmara.","a ninguém|Não."], "Obrigação.", ["v-verhuizen"]),
    AR("verhuisbus", "carrinha de mudanças", "de", "de bus.", ["v-verhuisbus"]),
  ], diff=2, mins=4)

L(12, "Conhecer os vizinhos", "Kennismaken met de buren.",
  ["Apresentar-te aos novos vizinhos"],
  vocab=[X("v-kennismaken","kennismaken (met)","conhecer (alguém pela primeira vez)","verb")],
  ex=[("Ik wil even kennismaken: ik ben de nieuwe buurvrouw.","Queria apresentar-me: sou a nova vizinha."),("Leuk om kennis te maken!","Prazer em conhecer!")],
  review=["v-buurman","v-buurvrouw","v-verhuizen"],
  cefr=C, exs=[
    MA([("kennismaken","conhecer"),("buurman","vizinho"),("buurvrouw","vizinha"),("verhuizen","mudar de casa")], "Vizinhos.", ["v-kennismaken","v-buurman","v-buurvrouw","v-verhuizen"]),
    TR("pt-nl","Prazer em conhecer!", ["Leuk om kennis te maken(!)","Leuk je te ontmoeten(!)","Aangenaam(!)"], "kennismaken.", ["v-kennismaken"]),
    TR("pt-nl","Sou o novo vizinho.", ["Ik ben de nieuwe buurman(.)"], "nieuwe.", ["v-buurman"]),
    MC("Qual é a ordem correta?", ["*Ik maak kennis met de buren.","Ik kennismaak met de buren.|Separável."], "Separável.", ["v-kennismaken"]),
    DL([("Buurvrouw","Welkom! Wanneer ben je verhuisd?","Bem-vinda! Quando te mudaste?"),("Jij","","")], ["*Vorige week. Leuk om kennis te maken!","Ik ben buurvrouw.|Não.","Kennismaken.|Incompleto."], "Responder.", ["v-kennismaken"]),
    FB("Kom je zaterdag koffie drinken? Dan maken we ___.", ["kennis"], "kennismaken.", ["v-kennismaken"], choices=["kennis","buren","kort"], tr="Vens tomar café no sábado? Assim conhecemo-nos."),
    LI("Als er iets is, kun je altijd aanbellen.", ["Als er iets is(,) kun je altijd aanbellen(.)"], "Se houver alguma coisa, podes sempre tocar à campainha.", "Ouvir.", ["v-buurman"]),
    MC("Ao mudar de casa nos Países Baixos, é comum…", ["*apresentar-se aos vizinhos ou deixar um bilhete","ignorar os vizinhos|Pouco simpático.","fazer festa até tarde sem avisar|Não."], "Cultura.", ["v-kennismaken"]),
  ], diff=2, mins=4)

L(13, "Avarias em casa", "De kraan lekt.",
  ["Comunicar avarias ao senhorio"],
  vocab=[],
  ex=[("De kraan in de keuken lekt.","A torneira da cozinha pinga."),("De verwarming doet het niet.","O aquecimento não funciona.")],
  review=["v-kraan","v-lekken","v-verwarming","v-repareren","v-loodgieter","v-schimmel","v-verhuurder"],
  cefr=C, exs=[
    MA([("kraan","torneira"),("lekken","pingar, verter"),("verwarming","aquecimento"),("schimmel","bolor")], "Avarias.", ["v-kraan","v-lekken","v-verwarming","v-schimmel"]),
    TR("pt-nl","A torneira pinga.", ["De kraan lekt(.)"], "lekken.", ["v-lekken"]),
    TR("pt-nl","Há bolor na casa de banho.", ["Er is schimmel in de badkamer(.)"], "schimmel.", ["v-schimmel"]),
    FB("Kunt u een ___ sturen? Het water stroomt overal!", ["loodgieter"], "Canalizador.", ["v-loodgieter"], choices=["loodgieter","makelaar","huurder"], tr="Pode mandar um canalizador? A água corre por todo o lado!"),
    DL([("Verhuurder","U belt over een storing?","Liga por causa de uma avaria?"),("Jij","","")], ["*De verwarming doet het al twee dagen niet.","Ik ben verwarming.|Não.","Kraan.|Incompleto."], "Explicar.", ["v-verwarming"]),
    LI("Wanneer komt de monteur om het te repareren?", ["Wanneer komt de monteur om het te repareren(?)"], "Quando vem o técnico repará-lo?", "Ouvir.", ["v-repareren"]),
    MC("Quem paga normalmente uma avaria grande no aquecimento numa casa arrendada?", ["*o senhorio (verhuurder)","sempre o inquilino|Reparações grandes são do senhorio.","o vizinho|Não."], "Regra geral (vê o contrato).", ["v-verhuurder"]),
    WO("O aquecimento não funciona.", ["De","verwarming","doet","het","niet."], "Ordem.", ["v-verwarming"]),
  ], diff=2, mins=4)

L(14, "Sair da casa", "De huur opzeggen.",
  ["Rescindir o contrato de arrendamento"],
  vocab=[],
  ex=[("Ik zeg de huur op per 1 juni.","Rescindo o arrendamento a partir de 1 de junho."),("De opzegtermijn is één maand.","O pré-aviso é de um mês.")],
  review=["v-opzeggen","v-opzegtermijn","v-borg","v-huurcontract","v-huurder"],
  cefr=C, exs=[
    MA([("opzeggen","rescindir"),("opzegtermijn","pré-aviso"),("borg","caução"),("huurcontract","contrato")], "Sair.", ["v-opzeggen","v-opzegtermijn","v-borg","v-huurcontract"]),
    TR("pt-nl","Rescindo o arrendamento.", ["Ik zeg de huur op(.)","Ik zeg mijn huurcontract op(.)"], "opzeggen.", ["v-opzeggen"]),
    TR("pt-nl","Quando recebo a caução?", ["Wanneer krijg ik de borg terug?","Wanneer krijg ik mijn borg terug?"], "borg terug.", ["v-borg"]),
    FB("De ___ is één maand.", ["opzegtermijn"], "Pré-aviso.", ["v-opzegtermijn"], choices=["opzegtermijn","borg","huur"], tr="O pré-aviso é de um mês."),
    MC("A forma mais segura de rescindir:", ["*por escrito (carta ou e-mail) e guardar prova","só dizer ao vizinho|Não.","deixar de pagar|Nunca."], "Boa prática.", ["v-opzeggen"]),
    LI("Ik wil mijn huurcontract per 1 augustus opzeggen.", ["Ik wil mijn huurcontract per 1 augustus opzeggen(.)","Ik wil mijn huurcontract per een augustus opzeggen(.)"], "Quero rescindir o contrato a partir de 1 de agosto.", "Ouvir.", ["v-opzeggen"]),
    DL([("Verhuurder","Wanneer wilt u vertrekken?","Quando quer sair?"),("Jij","","")], ["*Per 1 juli. Ik stuur u vandaag een brief.","Ik ben huurder.|Não.","Borg.|Não."], "Responder.", ["v-opzeggen"]),
    WO("Rescindo o contrato.", ["Ik","zeg","het","contract","op."], "Separável.", ["v-opzeggen"]),
  ], diff=2, mins=4)

L(15, "Prática: procurar casa nova", "Op zoek naar een huis.",
  ["Ler um anúncio e fazer perguntas ao senhorio"],
  vocab=[],
  ex=[("(Fictício) Te huur: 2-kamerappartement, 55 m², € 1.100 per maand, exclusief servicekosten, ongemeubileerd.","Arrenda-se: T1, 55 m², 1100 €/mês, sem despesas de condomínio, sem mobília.")],
  review=["v-te-huur","v-servicekosten","v-inclusief","v-gemeubileerd","v-bezichtiging","v-borg","v-meubels"],
  cefr=C, exs=[
    MC("(Anúncio fictício) «exclusief servicekosten» significa…", ["*as despesas de serviço pagam-se à parte","está tudo incluído|Seria inclusief.","grátis|Não."], "Compreensão.", ["v-servicekosten","v-inclusief"]),
    MC("(Anúncio) «2-kamerappartement» tem…", ["*duas divisões (sala + 1 quarto)","dois quartos e uma sala|Conta-se a sala.","duas casas de banho|Não."], "Contagem neerlandesa.", ["v-te-huur"]),
    TR("pt-nl","A renda inclui aquecimento?", ["Is de huur inclusief verwarming?","Is verwarming inbegrepen?"], "inclusief.", ["v-inclusief"]),
    TR("pt-nl","Posso marcar uma visita?", ["Mag ik een bezichtiging plannen?","Kan ik een bezichtiging afspreken?","Kan ik het komen bekijken?"], "bezichtiging.", ["v-bezichtiging"]),
    LI("De borg is twee maanden huur.", ["De borg is twee maanden huur(.)"], "A caução é de duas rendas.", "Ouvir.", ["v-borg"]),
    BS("O apartamento não é mobilado.", ["Het","appartement","is","niet","gemeubileerd."], ["Het appartement is niet gemeubileerd."], "niet antes do adjetivo.", ["v-gemeubileerd"]),
    MC("Um anúncio pede a caução ANTES de veres a casa e só por transferência para o estrangeiro. É provavelmente…", ["*burla — nunca pagues sem ver a casa e o contrato","normal|Não.","um desconto|Não."], "Segurança.", ["v-borg"]),
    SW("Escreva um e-mail curto a pedir informação sobre um apartamento (renda, despesas, visita).", ["Geachte heer/mevrouw, ik heb interesse in het appartement aan de Kerkstraat. Is de huur inclusief servicekosten? Kan ik volgende week een bezichtiging plannen? Met vriendelijke groet, João Pinto"], ["Interesse","Perguntas","Visita"], 25, "Escrever.", ["v-bezichtiging"]),
  ], diff=2, mins=5)

W()
