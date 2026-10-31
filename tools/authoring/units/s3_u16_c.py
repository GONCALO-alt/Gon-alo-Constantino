import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s3-u16")
C = "A2"
# Lições extra (10–15): desculpas, pedidos formais, e-mail formal, telefone formal e revisão da Secção 3.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)

L(10, "Pedir desculpa formalmente", "Mijn excuses.",
  ["Pedir desculpa em registo formal"],
  vocab=[V("v-excuses","excuses","desculpas","noun","de")],
  ex=[("Mijn excuses voor de late reactie.","As minhas desculpas pela resposta tardia."),("Excuses voor het ongemak.","Pedimos desculpa pelo incómodo.")],
  review=["v-het-spijt-me","v-sorry","v-pardon"],
  cefr=C, exs=[
    MA([("excuses","desculpas"),("het spijt me","lamento"),("sorry","desculpa"),("pardon","com licença")], "Desculpas.", ["v-excuses","v-het-spijt-me","v-sorry","v-pardon"]),
    MC("Num e-mail ao senhorio, a forma mais formal:", ["*Mijn excuses voor de vertraging.","Sorry joh!|Muito informal.","Pech.|Rude."], "Registo.", ["v-excuses"]),
    TR("pt-nl","As minhas desculpas pela resposta tardia.", ["Mijn excuses voor de late reactie(.)","Excuses voor mijn late reactie(.)"], "excuses voor.", ["v-excuses"]),
    TR("pt-nl","Lamento.", ["Het spijt me(.)"], "het spijt me.", ["v-het-spijt-me"]),
    FB("___ voor het ongemak.", ["Excuses"], "Formal.", ["v-excuses"], choices=["Excuses","Pardon","Doei"], tr="Pedimos desculpa pelo incómodo."),
    LI("Het spijt me dat ik niet eerder heb gereageerd.", ["Het spijt me dat ik niet eerder heb gereageerd(.)"], "Lamento não ter respondido antes.", "Ouvir.", ["v-het-spijt-me"]),
    MC("«Excuses voor het ongemak» costuma aparecer…", ["*em avisos de obras, atrasos e serviços","em cartas de amor|Não.","em receitas|Não."], "Contexto.", ["v-excuses"]),
    WO("As minhas desculpas.", ["Mijn","excuses."], "Ordem.", ["v-excuses"]),
  ], diff=2, mins=4)

L(11, "Gostaria de…", "Graag zou ik…",
  ["Fazer pedidos muito educados"],
  vocab=[X("v-graag-zou-ik","graag zou ik…","gostaria de…")],
  ex=[("Graag zou ik een afspraak maken.","Gostaria de marcar uma consulta."),("Ik zou graag meer informatie ontvangen.","Gostaria de receber mais informação.")],
  review=["v-zou","v-vriendelijk","v-mogen"],
  cefr=C, exs=[
    MA([("graag zou ik","gostaria de"),("zou u…?","poderia…?"),("vriendelijk","amável"),("mogen","poder (permissão)")], "Pedidos.", ["v-graag-zou-ik","v-zou","v-vriendelijk","v-mogen"]),
    MC("Do menos ao mais educado:", ["*Ik wil… → Ik wil graag… → Ik zou graag… willen","Ik zou graag → Ik wil|Ao contrário.","São iguais|Não."], "Graus.", ["v-graag-zou-ik"]),
    TR("pt-nl","Gostaria de marcar uma consulta.", ["Graag zou ik een afspraak maken(.)","Ik zou graag een afspraak maken(.)","Ik zou graag een afspraak willen maken(.)"], "zou graag.", ["v-graag-zou-ik"]),
    TR("pt-nl","Poderia ajudar-me?", ["Zou u mij kunnen helpen?","Zou u me kunnen helpen?"], "zou u … kunnen.", ["v-zou"]),
    FB("___ u mij meer informatie kunnen sturen?", ["Zou"], "Pedido formal.", ["v-zou"], choices=["Zou","Wil","Mag"], tr="Poderia enviar-me mais informação?"),
    LI("Ik zou graag een kamer willen reserveren.", ["Ik zou graag een kamer willen reserveren(.)"], "Gostaria de reservar um quarto.", "Ouvir.", ["v-graag-zou-ik"]),
    MC("Qual é a ordem correta?", ["*Graag zou ik u spreken.","Graag ik zou u spreken.|Inversão."], "Inversão.", ["v-graag-zou-ik"]),
    WO("Gostaria de saber.", ["Ik","zou","het","graag","weten."], "Ordem.", ["v-graag-zou-ik"]),
  ], diff=2, mins=4)

L(12, "Posso perguntar…?", "Mag ik vragen…",
  ["Fazer perguntas indiretas e educadas"],
  vocab=[X("v-mag-ik-vragen","mag ik vragen…?","posso perguntar…?")],
  ex=[("Mag ik vragen wanneer de reparatie klaar is?","Posso perguntar quando fica pronta a reparação?"),("Mag ik vragen hoe uw naam is?","Posso perguntar qual é o seu nome?")],
  gram=[G("g-s3u16c-1","Pergunta indireta","Depois de *Mag ik vragen…* / *Weet u…* a pergunta passa a subordinada: o **verbo vai para o fim**. *Wanneer **is** het klaar?* → *Mag ik vragen wanneer het klaar **is**?*")],
  review=["v-mogen","v-wanneer","v-hoe"],
  cefr=C, exs=[
    MC("Qual é a ordem correta?", ["*Mag ik vragen wanneer u open bent?","Mag ik vragen wanneer bent u open?|Na pergunta indireta o verbo vai para o fim."], "Verbo no fim.", ["v-mag-ik-vragen"]),
    MC("Qual é a ordem correta?", ["*Weet u hoe laat de bus vertrekt?","Weet u hoe laat vertrekt de bus?|Verbo no fim."], "Verbo no fim.", ["v-mag-ik-vragen"]),
    TR("pt-nl","Posso perguntar quanto custa?", ["Mag ik vragen hoeveel het kost?","Mag ik vragen wat het kost?"], "Verbo no fim.", ["v-mag-ik-vragen"]),
    TR("pt-nl","Sabe onde fica a câmara?", ["Weet u waar het gemeentehuis is?","Weet u waar de gemeente is?"], "Verbo no fim.", ["v-mag-ik-vragen"]),
    FB("Mag ik vragen waarom de trein vertraging ___?", ["heeft"], "Verbo no fim.", ["v-mag-ik-vragen"], choices=["heeft","hebben","is"], tr="Posso perguntar porque é que o comboio está atrasado?"),
    LI("Mag ik vragen hoe lang het nog duurt?", ["Mag ik vragen hoe lang het nog duurt(?)"], "Posso perguntar quanto tempo ainda demora?", "Ouvir.", ["v-mag-ik-vragen"]),
    BS("Posso perguntar quando vem?", ["Mag","ik","vragen","wanneer","u","komt?"], ["Mag ik vragen wanneer u komt?"], "Verbo no fim.", ["v-mag-ik-vragen"]),
    DL([("Medewerker","Kan ik u helpen?","Posso ajudar?"),("Jij","","")], ["*Ja, mag ik vragen wanneer mijn pakket komt?","Wanneer komt pakket?|Pouco educado e incompleto.","Mag ik?|Incompleto."], "Perguntar.", ["v-mag-ik-vragen"]),
  ], diff=3, mins=4)

L(13, "O e-mail formal", "Geachte heer, mevrouw…",
  ["Estruturar um e-mail formal"],
  vocab=[],
  ex=[("Geachte heer Jansen,","Exmo. Sr. Jansen,"),("Met vriendelijke groet,","Com os melhores cumprimentos,")],
  gram=[G("g-s3u16c-2","Estrutura","**Aanhef**: *Geachte heer/mevrouw [apelido],* (ou *Geachte heer, mevrouw,* sem nome). **Corpo**: motivo → pormenores → pedido. **Fecho**: *Met vriendelijke groet,* + nome. Informal: *Beste Sanne,* … *Groeten,*")],
  review=["v-geachte","v-met-vriendelijke-groet","v-beste","v-groeten"],
  cefr=C, exs=[
    MA([("Geachte heer/mevrouw","Exmo(a). Sr(a)."),("Met vriendelijke groet","Com os melhores cumprimentos"),("Beste","Caro(a)"),("Groeten","Cumprimentos")], "Fórmulas.", ["v-geachte","v-met-vriendelijke-groet","v-beste","v-groeten"]),
    MC("E-mail à câmara, sem nome de contacto. Começas com:", ["*Geachte heer, mevrouw,","Hoi allemaal!|Informal.","Beste Sanne,|Não sabes o nome."], "Aanhef.", ["v-geachte"]),
    MC("E-mail a uma colega próxima:", ["*Beste Sanne, … Groeten, Rui","Geachte mevrouw Sanne|Demasiado formal.","Hoogachtend|Muito antiquado."], "Registo.", ["v-beste"]),
    TR("pt-nl","Com os melhores cumprimentos, Ana Costa", ["Met vriendelijke groet(,) Ana Costa"], "Fecho formal.", ["v-met-vriendelijke-groet"]),
    FB("___ mevrouw De Vries,", ["Geachte"], "Aanhef formal.", ["v-geachte"], choices=["Geachte","Beste","Hoi"], tr="Exma. Sra. De Vries,"),
    MC("Ordem de um e-mail formal:", ["*saudação → motivo → pormenores → pedido → fecho","fecho → pedido → saudação|Não.","só o pedido|Pouco educado."], "Estrutura.", ["v-geachte"]),
    LI("Met vriendelijke groet, Ana Costa", ["Met vriendelijke groet(,) Ana Costa"], "Com os melhores cumprimentos, Ana Costa", "Fecho.", ["v-met-vriendelijke-groet"]),
    SW("Escreva um e-mail formal curto à escola de línguas a pedir informação sobre um curso (saudação, motivo, pedido, fecho).", ["Geachte heer, mevrouw,\n\nIk heb interesse in de cursus Nederlands op A2-niveau. Graag zou ik weten wanneer de cursus begint en wat hij kost.\n\nMet vriendelijke groet,\nRui Santos"], ["Aanhef","Motivo","Pedido","Fecho"], 30, "E-mail formal.", ["v-geachte","v-met-vriendelijke-groet"]),
  ], diff=2, mins=5)

L(14, "Ao telefone com uma empresa", "Ik verbind u door.",
  ["Lidar com chamadas formais: transferências e mensagens"],
  vocab=[],
  ex=[("Een moment, ik verbind u door.","Um momento, vou transferir a chamada."),("Mevrouw Bakker is niet bereikbaar. Wilt u een bericht achterlaten?","A Sra. Bakker não está disponível. Quer deixar uma mensagem?")],
  review=["v-doorverbinden","v-bereikbaar","v-bericht-achterlaten","v-spreken-met","v-terugbellen"],
  cefr=C, exs=[
    MA([("doorverbinden","transferir (chamada)"),("bereikbaar","contactável"),("een bericht achterlaten","deixar mensagem"),("terugbellen","ligar de volta")], "Telefone.", ["v-doorverbinden","v-bereikbaar","v-bericht-achterlaten","v-terugbellen"]),
    TR("pt-nl","Pode transferir-me para a contabilidade?", ["Kunt u mij doorverbinden met de administratie?","Kunt u me doorverbinden met de boekhouding?"], "doorverbinden met.", ["v-doorverbinden"]),
    TR("pt-nl","Quero deixar uma mensagem.", ["Ik wil graag een bericht achterlaten(.)","Ik wil een bericht achterlaten(.)"], "bericht achterlaten.", ["v-bericht-achterlaten"]),
    FB("Meneer Smit is vandaag niet ___.", ["bereikbaar"], "Contactável.", ["v-bereikbaar"], choices=["bereikbaar","doorverbonden","vriendelijk"], tr="O Sr. Smit hoje não está contactável."),
    DL([("Receptie","Met wie spreek ik?","Com quem estou a falar?"),("Jij","","")], ["*U spreekt met Carla Mendes. Ik bel over mijn factuur.","Met wie spreek ik?|Repetes.","Bereikbaar.|Não."], "Identificar-se.", ["v-spreken-met"]),
    DL([("Receptie","Hij is in gesprek. Zal hij u terugbellen?","Ele está numa chamada. Quer que lhe ligue de volta?"),("Jij","","")], ["*Graag. Mijn nummer is 06 12 34 56 78.","Nee, ik ben gesprek.|Não.","Doorverbinden.|Não."], "Aceitar.", ["v-terugbellen"]),
    LI("Ik verbind u door met de afdeling klantenservice.", ["Ik verbind u door met de afdeling klantenservice(.)"], "Vou transferi-lo para o apoio ao cliente.", "Ouvir.", ["v-doorverbinden"]),
    WO("Transfiro-o para o Sr. Smit.", ["Ik","verbind","u","door","met","meneer","Smit."], "Separável.", ["v-doorverbinden"]),
  ], diff=2, mins=4)

L(15, "Revisão da Secção 3: resolver um problema", "Een probleem oplossen.",
  ["Usar numa situação real o que aprendeste na Secção 3"],
  vocab=[],
  ex=[("(Fictício) Vorige week is mijn verwarming kapotgegaan. Ik heb de verhuurder gebeld en een e-mail gestuurd, maar er is nog niets gebeurd.","Na semana passada o aquecimento avariou…")],
  review=["v-excuses","v-graag-zou-ik","v-mag-ik-vragen","v-geachte","v-geleden","v-verwarming","v-oplossing"],
  cefr=C, exs=[
    MC("(Fictício) «Vorige week is mijn verwarming kapotgegaan.» Quando avariou?", ["*na semana passada","ontem|Não.","no ano passado|Não."], "Compreensão.", ["v-geleden"]),
    TR("pt-nl","Há uma semana que o aquecimento não funciona.", ["De verwarming doet het al een week niet(.)","Sinds een week doet de verwarming het niet(.)"], "al een week.", ["v-verwarming"]),
    TR("pt-nl","Gostaria de uma solução rápida.", ["Graag zou ik een snelle oplossing willen(.)","Ik zou graag een snelle oplossing willen(.)","Ik zou graag snel een oplossing hebben(.)"], "zou graag.", ["v-graag-zou-ik","v-oplossing"]),
    MC("Qual é a ordem correta?", ["*Mag ik vragen wanneer de monteur komt?","Mag ik vragen wanneer komt de monteur?|Verbo no fim."], "Pergunta indireta.", ["v-mag-ik-vragen"]),
    LI("Excuses voor het ongemak; de monteur komt morgen.", ["Excuses voor het ongemak(;) de monteur komt morgen(.)","Excuses voor het ongemak(,) de monteur komt morgen(.)"], "Desculpe o incómodo; o técnico vem amanhã.", "Ouvir.", ["v-excuses"]),
    DL([("Verhuurder","Ik heb uw e-mail nog niet gelezen.","Ainda não li o seu e-mail."),("Jij","","")], ["*Geen probleem. Graag zou ik weten wanneer iemand kan komen.","Dat is uw probleem!|Rude.","Excuses.|Não."], "Insistir com educação.", ["v-graag-zou-ik"]),
    BS("Há uma semana enviei um e-mail.", ["Een","week","geleden","heb","ik","een","e-mail","gestuurd."], ["Een week geleden heb ik een e-mail gestuurd."], "geleden + perfeito.", ["v-geleden"]),
    SW("Escreva um e-mail formal ao senhorio: o aquecimento não funciona há uma semana, já ligou, pede data para a reparação.", ["Geachte heer De Wit,\n\nSinds een week doet de verwarming in mijn appartement het niet. Ik heb u vorige week gebeld, maar er is nog niemand geweest. Mag ik vragen wanneer een monteur kan komen? Graag zou ik dit snel opgelost zien.\n\nMet vriendelijke groet,\nSofia Martins"], ["Aanhef","Problema e datas","Pedido","Fecho"], 40, "E-mail formal (fictício).", ["v-geachte","v-mag-ik-vragen"]),
  ], diff=3, mins=6)

W()
