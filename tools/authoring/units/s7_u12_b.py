import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u12")
C = "B2"
# Lições de aprofundamento (10–29): simulações de situações reais (todas as pessoas e números são fictícios).

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Comprar casa (1): a visita", "Bouwjaar en energielabel.",
  ["Fazer perguntas técnicas numa visita a uma casa"],
  vocab=[N("v-bouwjaar","bouwjaar","ano de construção","het"), N("v-energielabel","energielabel","certificado energético","het","energielabels")],
  ex=[("Wat is het bouwjaar van de woning?","Qual é o ano de construção da casa?"),("Het huis heeft energielabel C.","A casa tem certificado energético C.")],
  gram=[G("g-s7u12b-1","O energielabel","Na venda ou arrendamento de uma casa nos Países Baixos indica-se o **energielabel**: quanto mais perto de A, mais eficiente (menos custos de aquecimento). Numa visita é normal perguntar pelo *bouwjaar*, pelo *energielabel* e pelas *servicekosten* (num apartamento).")],
  review=["v-bezichtiging","v-makelaar","v-vraagprijs"],
  cefr=C, exs=[
    MA([("bouwjaar","ano de construção"),("energielabel","certificado energético"),("vraagprijs","preço pedido"),("bezichtiging","visita")], "Comprar casa.", ["v-bouwjaar","v-energielabel","v-vraagprijs","v-bezichtiging"]),
    AR("bouwjaar", "ano de construção", "het", "het jaar.", ["v-bouwjaar"]),
    AR("energielabel", "certificado energético", "het", "het label.", ["v-energielabel"]),
    MC("Energielabel A vs G:", ["*A gasta menos energia que G","G é o mais eficiente|Ao contrário.","são iguais|Não."], "Escala.", ["v-energielabel"]),
    TR("pt-nl","Qual é o ano de construção?", ["Wat is het bouwjaar?","Wat is het bouwjaar"], "het bouwjaar.", ["v-bouwjaar"]),
    FB("De ___ laat ons vanmiddag het appartement zien.", ["makelaar"], "Agente.", ["v-makelaar"], choices=["makelaar","notaris","verhuurder"], tr="O agente mostra-nos o apartamento esta tarde."),
    DL([("Makelaar","Heeft u nog vragen over de woning?","Tem mais perguntas sobre a casa?"),("Jij","","")], ["*Ja: wat is het energielabel, en is het dak ooit vervangen?","Nee, hij is mooi.|Perde a oportunidade de perguntar.","Hoeveel kost u?|Sem sentido."], "Perguntas úteis.", ["v-energielabel"]),
    LI("Het bouwjaar is 1932; de kozijnen zijn in 2015 vervangen.", ["Het bouwjaar is 1932; de kozijnen zijn in 2015 vervangen","Het bouwjaar is 1932, de kozijnen zijn in 2015 vervangen"], "O ano de construção é 1932; as caixilharias foram substituídas em 2015.", "Informação técnica.", ["v-bouwjaar"]),
  ], diff=4, mins=5)

L(11, "Comprar casa (2): a oferta", "Een bod uitbrengen.",
  ["Fazer uma oferta com condições"],
  vocab=[X("v-bod-uitbrengen","een bod uitbrengen","fazer uma oferta (formal)","verb"), X("v-voorbehoud-financiering","onder voorbehoud van financiering","sob condição de obter financiamento")],
  ex=[("We brengen een bod uit van 340.000 euro.","Fazemos uma oferta de 340 000 euros."),("Ons bod is onder voorbehoud van financiering.","A nossa oferta está sujeita a obtermos financiamento.")],
  gram=[G("g-s7u12b-2","Voorbehoud","Uma oferta *onder voorbehoud van financiering* permite desistir sem multa se o banco não der o crédito. Depois de assinar, o comprador de uma casa tem ainda por lei **drie dagen bedenktijd** (três dias para pensar).")],
  review=["v-bod","v-hypotheek","v-bedenktijd"],
  cefr=C, exs=[
    MA([("een bod uitbrengen","fazer uma oferta"),("voorbehoud van financiering","condição de financiamento"),("hypotheek","crédito à habitação"),("bedenktijd","prazo de reflexão")], "Oferta.", ["v-bod-uitbrengen","v-voorbehoud-financiering","v-hypotheek","v-bedenktijd"]),
    MC("Porque se faz uma oferta «onder voorbehoud van financiering»?", ["*Para poder desistir se o banco recusar o crédito","Para pagar menos impostos|Não.","Para comprar mais depressa|Não."], "Função.", ["v-voorbehoud-financiering"]),
    TR("pt-nl","Fazemos uma oferta de 300 000 euros.", ["We brengen een bod uit van 300.000 euro","Wij brengen een bod uit van 300.000 euro","We doen een bod van 300.000 euro"], "bod uitbrengen.", ["v-bod-uitbrengen"]),
    TR("pt-nl","A nossa oferta está sujeita a financiamento.", ["Ons bod is onder voorbehoud van financiering"], "Expressão fixa.", ["v-voorbehoud-financiering"]),
    FB("De verkoper heeft ons ___ geaccepteerd!", ["bod"], "Oferta.", ["v-bod"], choices=["bod","hypotheek","bouwjaar"], tr="O vendedor aceitou a nossa oferta!"),
    FE(["We","brengen","een","bod","op","van","300.000","euro."], 4, "uit", "een bod uitbrengen.", ["v-bod-uitbrengen"]),
    DL([("Makelaar verkoper","De vraagprijs is 360.000. Wat is uw bod?","O preço pedido é 360 000. Qual é a sua oferta?"),("Jij","","")], ["*We bieden 345.000 euro, onder voorbehoud van financiering.","Ik wil hem.|Não faz oferta.","Doe maar de helft.|Irrealista e brusco."], "Oferta.", ["v-bod-uitbrengen"]),
    LI("Wij hebben drie dagen bedenktijd na het tekenen.", ["Wij hebben drie dagen bedenktijd na het tekenen","We hebben drie dagen bedenktijd na het tekenen"], "Temos três dias para pensar depois de assinar.", "Direito do comprador.", ["v-bedenktijd"]),
  ], diff=5, mins=5)

L(12, "Comprar casa (3): o crédito", "De hypotheekadviseur.",
  ["Conversar com um consultor de crédito"],
  vocab=[N("v-hypotheekadviseur","hypotheekadviseur","consultor de crédito à habitação","de"), N("v-maandlasten","maandlasten","encargos mensais","de")],
  ex=[("De hypotheekadviseur berekent hoeveel we kunnen lenen.","O consultor calcula quanto podemos pedir emprestado."),("Wat worden onze maandlasten?","Quais vão ser os nossos encargos mensais?")],
  review=["v-hypotheek","v-notaris","v-koopovereenkomst","v-sleuteloverdracht"],
  cefr=C, exs=[
    MA([("hypotheekadviseur","consultor de crédito"),("maandlasten","encargos mensais"),("notaris","notário"),("koopovereenkomst","contrato-promessa")], "Crédito.", ["v-hypotheekadviseur","v-maandlasten","v-notaris","v-koopovereenkomst"]),
    MC("Ordem habitual:", ["*oferta aceite → koopovereenkomst → hipoteca aprovada → notário → chaves","chaves → oferta → notário|Ao contrário.","notário → visita → oferta|Não."], "Processo.", ["v-koopovereenkomst","v-notaris"]),
    TR("pt-nl","Quais vão ser os nossos encargos mensais?", ["Wat worden onze maandlasten?","Wat zijn onze maandlasten?","Hoe hoog worden onze maandlasten?"], "maandlasten.", ["v-maandlasten"]),
    TR("pt-nl","O consultor calcula quanto podemos pedir emprestado.", ["De hypotheekadviseur berekent hoeveel we kunnen lenen","De adviseur berekent hoeveel we kunnen lenen"], "Subordinada.", ["v-hypotheekadviseur"]),
    FB("Bij de ___ tekenen we de akte en krijgen we de sleutels.", ["notaris"], "Notário.", ["v-notaris"], choices=["notaris","makelaar","hypotheekadviseur"], tr="No notário assinamos a escritura e recebemos as chaves."),
    FE(["Onze","maandlasten","wordt","1.400","euro."], 2, "worden", "Plural: worden.", ["v-maandlasten"]),
    LI("Met dit inkomen kunt u ongeveer 300.000 euro lenen.", ["Met dit inkomen kunt u ongeveer 300.000 euro lenen"], "Com este rendimento pode pedir cerca de 300 000 euros.", "Consultor (valores fictícios).", ["v-hypotheekadviseur"]),
    WO("Quanto podemos pedir?", ["Hoeveel","kunnen","we","lenen"], "Pergunta.", ["v-hypotheekadviseur"]),
  ], diff=5, mins=5)

L(13, "Nas urgências", "Triage en pijnscore.",
  ["Descrever dor e urgência no hospital"],
  vocab=[N("v-triage","triage","triagem","de"), N("v-pijnscore","pijnscore","escala de dor","de")],
  ex=[("Bij de triage bepaalt de verpleegkundige hoe urgent het is.","Na triagem a enfermeira decide a urgência."),("Welk cijfer geeft u de pijn, van nul tot tien?","Que número dá à dor, de zero a dez?")],
  review=["v-spoedeisende-hulp","v-ambulance","v-verpleegkundige"],
  cefr=C, exs=[
    MA([("triage","triagem"),("pijnscore","escala de dor"),("spoedeisende hulp","urgências"),("ambulance","ambulância")], "Urgências.", ["v-triage","v-pijnscore","v-spoedeisende-hulp","v-ambulance"]),
    MC("Porque é que outra pessoa entra antes de ti nas urgências?", ["*A triagem dá prioridade aos casos mais graves","Chegou primeiro sempre|Não necessariamente.","Pagou mais|Não."], "Triagem.", ["v-triage"]),
    TR("pt-nl","Dou uma sete à dor.", ["Ik geef de pijn een zeven","Ik geef mijn pijn een zeven"], "pijnscore.", ["v-pijnscore"]),
    TR("pt-nl","Dói desde ontem à noite.", ["Het doet pijn sinds gisteravond","Het doet sinds gisteravond pijn","Ik heb sinds gisteravond pijn"], "pijn doen.", ["v-pijnscore"]),
    FB("Na de ___ moest ik nog een uur wachten.", ["triage"], "Triagem.", ["v-triage"], choices=["triage","pijnscore","ambulance"], tr="Depois da triagem ainda tive de esperar uma hora."),
    FE(["Het","pijn","is","heel","erg."], 0, "De", "de pijn.", ["v-pijnscore"]),
    DL([("Verpleegkundige","Op een schaal van nul tot tien, hoeveel pijn heeft u?","Numa escala de zero a dez, quanta dor tem?"),("Jij","","")], ["*Een acht. Het is een stekende pijn rechts in mijn buik.","Veel.|Pouco preciso.","Ik weet het niet.|Não ajuda."], "Descrever.", ["v-pijnscore"]),
    LI("Neem plaats in de wachtkamer; u wordt zo geroepen.", ["Neem plaats in de wachtkamer; u wordt zo geroepen","Neem plaats in de wachtkamer, u wordt zo geroepen"], "Sente-se na sala de espera; será chamado em breve.", "Receção.", ["v-triage"]),
  ], diff=4, mins=5)

L(14, "Alta do hospital", "U mag naar huis.",
  ["Compreender instruções de alta e consulta de seguimento"],
  vocab=[X("v-naar-huis-mogen","naar huis mogen","ter alta"), N("v-controleafspraak","controleafspraak","consulta de seguimento","de"),
         N("v-medicatie","medicatie","medicação","de")],
  ex=[("U mag morgen naar huis.","Amanhã tem alta."),("Over twee weken heeft u een controleafspraak.","Daqui a duas semanas tem consulta de seguimento."),("Neem uw medicatie twee keer per dag in.","Tome a medicação duas vezes por dia.")],
  review=["v-opname","v-nazorg","v-uitslag"],
  cefr=C, exs=[
    MA([("naar huis mogen","ter alta"),("controleafspraak","consulta de seguimento"),("medicatie","medicação"),("nazorg","cuidados posteriores")], "Alta.", ["v-naar-huis-mogen","v-controleafspraak","v-medicatie","v-nazorg"]),
    TR("pt-nl","Amanhã tem alta.", ["U mag morgen naar huis","Morgen mag u naar huis"], "naar huis mogen.", ["v-naar-huis-mogen"]),
    TR("pt-nl","Tome a medicação duas vezes por dia.", ["Neem uw medicatie twee keer per dag in","Neem de medicatie twee keer per dag in","Neem uw medicatie tweemaal per dag in"], "innemen.", ["v-medicatie"]),
    FB("De ___ van het bloedonderzoek krijgt u bij de controleafspraak.", ["uitslag"], "Resultado.", ["v-uitslag"], choices=["uitslag","opname","medicatie"], tr="O resultado da análise ao sangue recebe na consulta de seguimento."),
    FE(["Wanneer","mogen","ik","naar","huis?"], 1, "mag", "ik mag.", ["v-naar-huis-mogen"]),
    MC("Antes de sair, uma boa pergunta é:", ["*Waar moet ik op letten thuis, en wanneer moet ik terugbellen?","Mag ik nu gaan?|Pouco útil.","Wat eten jullie vanavond?|Não."], "Perguntar.", ["v-nazorg"]),
    LI("Bij koorts boven de 38,5 graden belt u direct de afdeling.", ["Bij koorts boven de 38,5 graden belt u direct de afdeling","Bij koorts boven de 38,5 graden belt u meteen de afdeling"], "Com febre acima de 38,5 graus, ligue logo para o serviço.", "Instrução.", ["v-nazorg"]),
    WO("Amanhã tenho alta.", ["Ik","mag","morgen","naar","huis"], "Ordem.", ["v-naar-huis-mogen"]),
  ], diff=4, mins=5)

L(15, "Médico fora de horas", "De huisartsenpost.",
  ["Ligar para o serviço de médico de família fora de horas"],
  vocab=[N("v-huisartsenpost","huisartsenpost","serviço de médico de família fora de horas","de"), N("v-wachtkamer","wachtkamer","sala de espera","de")],
  ex=[("'s Avonds en in het weekend bel je de huisartsenpost.","À noite e ao fim de semana ligas para o serviço de médico fora de horas."),("Ga eerst bellen; je kunt niet zomaar langskomen.","Liga primeiro; não podes simplesmente aparecer.")],
  gram=[G("g-s7u12b-3","Quem chamar?","Em perigo de vida: **112**. Problema urgente à noite ou ao fim de semana que não pode esperar: **huisartsenpost** (liga-se sempre antes). Durante o dia: o teu **huisarts**. A ida às urgências do hospital é normalmente por indicação do médico ou da ambulância.")],
  review=["v-bellen-112","v-doorverwijzen","v-huisarts"],
  cefr=C, exs=[
    MC("Sábado à noite, o teu filho tem febre alta há dois dias. Ligas para…", ["*a huisartsenpost","112|Só em perigo de vida.","o teu huisarts na segunda|Não pode esperar."], "Quem chamar.", ["v-huisartsenpost"]),
    MC("Alguém desmaia e não respira. Ligas para…", ["*112","a huisartsenpost|Perigo de vida: 112.","a farmácia|Não."], "Emergência.", ["v-bellen-112"]),
    TR("pt-nl","Ao fim de semana ligas para o serviço de médico fora de horas.", ["In het weekend bel je de huisartsenpost","In het weekend bel je naar de huisartsenpost"], "huisartsenpost.", ["v-huisartsenpost"]),
    TR("pt-nl","Espere na sala de espera.", ["Wacht in de wachtkamer","Wacht u maar in de wachtkamer"], "wachtkamer.", ["v-wachtkamer"]),
    FB("De arts op de post kan je ___ naar het ziekenhuis.", ["doorverwijzen"], "Encaminhar.", ["v-doorverwijzen"], choices=["doorverwijzen","opnemen","ontslaan"], tr="O médico do posto pode encaminhar-te para o hospital."),
    FE(["Het","huisartsenpost","is","'s","nachts","open."], 0, "De", "de post.", ["v-huisartsenpost"]),
    DL([("Huisartsenpost","Huisartsenpost, waarmee kan ik u helpen?","Serviço de médico, em que posso ajudar?"),("Jij","","")], ["*Mijn dochter van vier heeft al twee dagen 39,5 graden koorts en ze drinkt bijna niet.","Ze is ziek.|Pouco informativo.","Kan ik langskomen?|Primeiro descreve o problema."], "Descrever bem.", ["v-huisartsenpost"]),
    LI("Kom over een half uur naar de post; neem uw zorgpas mee.", ["Kom over een half uur naar de post; neem uw zorgpas mee","Kom over een half uur naar de post, neem uw zorgpas mee"], "Venha ao posto daqui a meia hora; traga o cartão de saúde.", "Instrução.", ["v-huisartsenpost"]),
  ], diff=4, mins=5)

L(16, "Senhorio (1): avaria urgente", "De verwarming doet het niet.",
  ["Comunicar uma avaria urgente ao senhorio"],
  vocab=[N("v-contactformulier","contactformulier","formulário de contacto","het")],
  ex=[("Ik heb de storing via het contactformulier gemeld.","Comuniquei a avaria pelo formulário de contacto."),("De verwarming doet het al drie dagen niet.","O aquecimento não funciona há três dias.")],
  review=["v-het-doet-het-niet","v-storingsdienst","v-verhuurder","v-lekkage"],
  cefr=C, exs=[
    MA([("contactformulier","formulário de contacto"),("het doet het niet","não funciona"),("storingsdienst","serviço de avarias"),("lekkage","infiltração")], "Avarias.", ["v-contactformulier","v-het-doet-het-niet","v-storingsdienst","v-lekkage"]),
    AR("contactformulier", "formulário de contacto", "het", "het formulier.", ["v-contactformulier"]),
    TR("pt-nl","O aquecimento não funciona há três dias.", ["De verwarming doet het al drie dagen niet"], "al … niet.", ["v-het-doet-het-niet"]),
    TR("pt-nl","Liguei para o serviço de avarias.", ["Ik heb de storingsdienst gebeld","Ik belde de storingsdienst"], "storingsdienst.", ["v-storingsdienst"]),
    FB("Er is ___ in de badkamer; het plafond is nat.", ["lekkage"], "Infiltração.", ["v-lekkage"], choices=["lekkage","storing","verwarming"], tr="Há uma infiltração na casa de banho; o teto está molhado."),
    FE(["De","verwarming","doet","het","niets."], 4, "niet.", "het doet het niet.", ["v-het-doet-het-niet"]),
    SW("Escreva uma mensagem curta à verhuurder: o aquecimento não funciona há 3 dias, há crianças em casa, pede reparação urgente e diz quando está em casa.", ["Geachte heer De Wit,\n\nSinds maandag doet de verwarming het niet meer. Het is 14 graden in huis en we hebben twee kleine kinderen. Ik heb de storing ook via het contactformulier gemeld. Kunt u zo snel mogelijk een monteur sturen? Ik ben elke dag na 15.00 uur thuis.\n\nMet vriendelijke groet,\nAna Ribeiro"], ["Problema e desde quando","Urgência","Disponibilidade"], 60, "Mensagem formal (fictícia).", ["v-het-doet-het-niet"]),
    LI("Er komt morgen tussen acht en twaalf een monteur.", ["Er komt morgen tussen acht en twaalf een monteur","Er komt morgen tussen 8 en 12 een monteur"], "Amanhã vem um técnico entre as oito e o meio-dia.", "Resposta.", ["v-storingsdienst"]),
  ], diff=4, mins=6)

L(17, "Senhorio (2): sair da casa", "De waarborgsom terugkrijgen.",
  ["Tratar da entrega da casa e da caução"],
  vocab=[N("v-waarborgsom","waarborgsom","caução (depósito)","de"), N("v-eindinspectie","eindinspectie","vistoria final","de")],
  ex=[("Bij de eindinspectie loopt de verhuurder door de woning.","Na vistoria final o senhorio percorre a casa."),("Wanneer krijg ik mijn waarborgsom terug?","Quando recebo a caução de volta?")],
  review=["v-borg","v-opzegtermijn","v-opleveren","v-huurder"],
  cefr=C, exs=[
    MA([("waarborgsom","caução"),("eindinspectie","vistoria final"),("opzegtermijn","pré-aviso"),("opleveren","entregar (a casa)")], "Sair.", ["v-waarborgsom","v-eindinspectie","v-opzegtermijn","v-opleveren"]),
    MC("«Waarborgsom» e «borg» são…", ["*sinónimos","opostos|Não.","coisas diferentes|Não."], "Sinónimos.", ["v-waarborgsom","v-borg"]),
    TR("pt-nl","Quando recebo a caução de volta?", ["Wanneer krijg ik mijn waarborgsom terug?","Wanneer krijg ik mijn borg terug?","Wanneer krijg ik de waarborgsom terug?"], "terugkrijgen.", ["v-waarborgsom"]),
    TR("pt-nl","Temos de entregar a casa vazia e limpa.", ["We moeten de woning leeg en schoon opleveren","Wij moeten het huis leeg en schoon opleveren"], "opleveren.", ["v-opleveren"]),
    FB("De ___ is één maand; ik moet dus vóór 1 mei opzeggen.", ["opzegtermijn"], "Pré-aviso.", ["v-opzegtermijn"], choices=["opzegtermijn","waarborgsom","eindinspectie"], tr="O pré-aviso é de um mês; tenho de rescindir antes de 1 de maio."),
    FE(["De","verhuurder","houdt","een","deel","van","de","borg","in","omdat","de","muur","beschadigd","zijn."], 13, "is.", "de muur … is (singular).", ["v-borg"]),
    DL([("Verhuurder","Ik houd 300 euro in voor de schade aan de vloer.","Vou reter 300 euros pelos danos no chão."),("Jij","","")], ["*Die schade was er al bij het begin van de huur; dat staat in het intakerapport. Kunt u dat nakijken?","Oké.|Aceitas sem verificar.","Dat is diefstal!|Agressivo."], "Defender-se com factos.", ["v-waarborgsom"]),
    LI("Maak foto's bij de sleuteloverdracht, dan heb je bewijs.", ["Maak foto's bij de sleuteloverdracht, dan heb je bewijs","Maak foto's bij de sleuteloverdracht dan heb je bewijs"], "Tira fotos na entrega das chaves; assim tens provas.", "Dica.", ["v-sleuteloverdracht"]),
  ], diff=5, mins=5)

L(18, "Senhorio (3): aumento de renda", "Een huurverhoging aanvechten.",
  ["Contestar um aumento de renda"],
  vocab=[X("v-aanvechten","aanvechten","contestar","verb")],
  ex=[("Je kunt een te hoge huurverhoging aanvechten.","Podes contestar um aumento de renda demasiado alto."),("Ik maak bezwaar tegen de huurverhoging.","Apresento oposição ao aumento de renda.")],
  review=["v-huurverhoging","v-bezwaar-maken","v-huurcommissie"],
  cefr=C, exs=[
    MA([("aanvechten","contestar"),("huurverhoging","aumento de renda"),("bezwaar maken","apresentar objeção"),("Huurcommissie","comissão de arrendamento")], "Renda.", ["v-aanvechten","v-huurverhoging","v-bezwaar-maken","v-huurcommissie"]),
    MC("Se não chegas a acordo com o senhorio sobre a renda, podes recorrer à…", ["*Huurcommissie","polícia|Não é crime.","CJIB|Isso é para multas."], "Instituição.", ["v-huurcommissie"]),
    TR("pt-nl","Podes contestar o aumento.", ["Je kunt de verhoging aanvechten","Je kunt de huurverhoging aanvechten"], "aanvechten.", ["v-aanvechten"]),
    TR("pt-nl","Apresento oposição ao aumento de renda.", ["Ik maak bezwaar tegen de huurverhoging"], "bezwaar maken tegen.", ["v-bezwaar-maken"]),
    FB("Hij heeft de beslissing bij de rechter ___.", ["aangevochten"], "Particípio.", ["v-aanvechten"], choices=["aangevochten","aanvecht","geaanvecht"], tr="Ele contestou a decisão no tribunal."),
    FE(["Ik","maak","bezwaar","op","de","huurverhoging."], 3, "tegen", "bezwaar maken tegen.", ["v-bezwaar-maken"]),
    SW("Escreva 3–4 frases ao senhorio a contestar um aumento de 9% (diz que é mais do que o permitido e pede justificação).", ["Geachte mevrouw Bakker,\n\nIk heb uw brief over de huurverhoging van 9% ontvangen. Volgens mij is deze verhoging hoger dan wettelijk is toegestaan. Daarom maak ik bezwaar. Kunt u de verhoging schriftelijk onderbouwen?\n\nMet vriendelijke groet,\nPedro Lopes"], ["Referência à carta","Objeção","Pedido de justificação"], 50, "Carta (fictícia).", ["v-aanvechten","v-bezwaar-maken"]),
    LI("Ik ga deze huurverhoging aanvechten.", ["Ik ga deze huurverhoging aanvechten"], "Vou contestar este aumento de renda.", "Ouvir.", ["v-aanvechten"]),
  ], diff=5, mins=6)

L(19, "Acidente (1): no local", "Het Europees schadeformulier.",
  ["Preencher a declaração amigável depois de um acidente"],
  vocab=[N("v-europees-schadeformulier","Europees schadeformulier","declaração amigável de acidente","het"), N("v-schuldvraag","schuldvraag","questão da culpa","de")],
  ex=[("We vullen samen het Europees schadeformulier in.","Preenchemos juntos a declaração amigável."),("De verzekeraars beslissen over de schuldvraag.","As seguradoras decidem a questão da culpa.")],
  gram=[G("g-s7u12b-4","A declaração amigável","Depois de um pequeno acidente sem feridos, os condutores preenchem juntos o **Europees schadeformulier** (igual à declaração amigável portuguesa). Assinar não significa admitir culpa: assinas que os factos descritos estão corretos. As seguradoras decidem depois a **schuldvraag**.")],
  review=["v-aanrijding","v-schadeformulier","v-voorrang"],
  cefr=C, exs=[
    MA([("Europees schadeformulier","declaração amigável"),("schuldvraag","questão da culpa"),("aanrijding","colisão"),("voorrang","prioridade")], "Acidente.", ["v-europees-schadeformulier","v-schuldvraag","v-aanrijding","v-voorrang"]),
    MC("Assinar o schadeformulier significa…", ["*confirmar que os factos estão corretos","admitir a culpa|Não.","pagar os danos|Não."], "Facto.", ["v-europees-schadeformulier"]),
    TR("pt-nl","Preenchemos juntos a declaração.", ["We vullen samen het schadeformulier in","We vullen samen het Europees schadeformulier in"], "invullen.", ["v-europees-schadeformulier"]),
    TR("pt-nl","Ele não me deu prioridade.", ["Hij gaf me geen voorrang","Hij heeft me geen voorrang gegeven"], "voorrang geven.", ["v-voorrang"]),
    FB("Wie had er ___? Dat bepaalt wie de schade betaalt.", ["schuld"], "Culpa.", ["v-schuldvraag"], choices=["schuld","voorrang","schade"], tr="Quem teve a culpa? Isso decide quem paga os danos."),
    FE(["Het","schuldvraag","is","nog","niet","duidelijk."], 0, "De", "de vraag.", ["v-schuldvraag"]),
    DL([("Andere bestuurder","Dit is allemaal uw schuld!","Isto é tudo culpa sua!"),("Jij","","")], ["*Laten we rustig het schadeformulier invullen; de verzekeraars bepalen wie schuld heeft.","Nee, uw schuld!|Escala o conflito.","Ik bel de televisie.|Não."], "Manter a calma.", ["v-schuldvraag"]),
    LI("Is er iemand gewond? Nee? Dan vullen we het formulier in.", ["Is er iemand gewond? Nee? Dan vullen we het formulier in","Is er iemand gewond nee dan vullen we het formulier in"], "Há feridos? Não? Então preenchemos o formulário.", "Ouvir.", ["v-europees-schadeformulier"]),
  ], diff=5, mins=5)

L(20, "Acidente (2): a polícia", "Een verklaring afleggen.",
  ["Prestar declarações à polícia"],
  vocab=[X("v-verklaring-afleggen","een verklaring afleggen","prestar declarações","verb"), N("v-proces-verbaal","proces-verbaal","auto (relatório policial)","het")],
  ex=[("De getuige legt een verklaring af bij de politie.","A testemunha presta declarações à polícia."),("De agent maakt een proces-verbaal op.","O agente lavra um auto.")],
  review=["v-getuige","v-aangifte-doen"],
  cefr=C, exs=[
    MA([("een verklaring afleggen","prestar declarações"),("proces-verbaal","auto policial"),("getuige","testemunha"),("aangifte doen","apresentar queixa")], "Polícia.", ["v-verklaring-afleggen","v-proces-verbaal","v-getuige","v-aangifte-doen"]),
    AR("proces-verbaal", "auto policial", "het", "het proces-verbaal.", ["v-proces-verbaal"]),
    TR("pt-nl","A testemunha presta declarações.", ["De getuige legt een verklaring af"], "Separável.", ["v-verklaring-afleggen"]),
    TR("pt-nl","Vi tudo: o carro passou o vermelho.", ["Ik heb alles gezien: de auto reed door rood","Ik heb alles gezien, de auto reed door rood"], "door rood rijden.", ["v-getuige"]),
    FB("Wilt u een verklaring ___?", ["afleggen"], "Infinitivo.", ["v-verklaring-afleggen"], choices=["afleggen","aflegt","leggen af"], tr="Quer prestar declarações?"),
    FE(["Ik","heb","een","verklaring","afgelegt."], 4, "afgelegd.", "Particípio: afgelegd.", ["v-verklaring-afleggen"]),
    DL([("Agent","Kunt u vertellen wat u heeft gezien?","Pode contar o que viu?"),("Jij","","")], ["*Ik stond bij het zebrapad. De fietser kwam van links en de auto reed hem aan zonder te remmen.","Een ongeluk.|Pouco preciso.","Ik weet het niet meer, sorry.|Só se for verdade."], "Descrição clara.", ["v-verklaring-afleggen"]),
    LI("U krijgt een kopie van het proces-verbaal.", ["U krijgt een kopie van het proces-verbaal"], "Recebe uma cópia do auto.", "Ouvir.", ["v-proces-verbaal"]),
  ], diff=5, mins=5)

L(21, "Uma multa", "Een bekeuring van het CJIB.",
  ["Perceber uma multa e como reagir"],
  vocab=[N("v-bekeuring","bekeuring","multa (de trânsito)","de","bekeuringen"), X("v-cjib","CJIB","entidade que cobra multas (Países Baixos)")],
  ex=[("Ik kreeg een bekeuring voor te hard rijden.","Recebi uma multa por excesso de velocidade."),("De acceptgiro komt van het CJIB.","A carta de pagamento vem do CJIB.")],
  review=["v-boete","v-bezwaar-maken"],
  cefr=C, exs=[
    MA([("bekeuring","multa de trânsito"),("CJIB","entidade de cobrança de multas"),("boete","multa"),("bezwaar maken","contestar")], "Multas.", ["v-bekeuring","v-cjib","v-boete","v-bezwaar-maken"]),
    MC("Uma carta do CJIB é normalmente sobre…", ["*uma multa a pagar","o teu salário|Não.","o teu contrato de arrendamento|Não."], "Instituição.", ["v-cjib"]),
    TR("pt-nl","Recebi uma multa por excesso de velocidade.", ["Ik kreeg een bekeuring voor te hard rijden","Ik heb een bekeuring gekregen voor te hard rijden","Ik kreeg een boete voor te hard rijden"], "te hard rijden.", ["v-bekeuring"]),
    TR("pt-nl","Posso contestar esta multa?", ["Kan ik bezwaar maken tegen deze boete?","Kan ik bezwaar maken tegen deze bekeuring?"], "bezwaar maken tegen.", ["v-bezwaar-maken"]),
    FB("Als je niet op tijd betaalt, wordt de ___ hoger.", ["boete"], "Multa.", ["v-boete"], choices=["boete","bekeuring","CJIB"], tr="Se não pagares a tempo, a multa aumenta."),
    FE(["Ik","kreeg","een","bekeuring","door","te","hard","rijden."], 4, "voor", "een bekeuring voor.", ["v-bekeuring"]),
    LI("U heeft zes weken om beroep in te stellen.", ["U heeft zes weken om beroep in te stellen","U heeft 6 weken om beroep in te stellen"], "Tem seis semanas para recorrer.", "Prazo (verifique sempre na carta).", ["v-bezwaar-maken"]),
    WO("Recebi uma multa.", ["Ik","kreeg","een","bekeuring"], "Ordem.", ["v-bekeuring"]),
  ], diff=4, mins=5)

L(22, "Organizar um evento (1)", "Een vergunning aanvragen.",
  ["Pedir autorização à câmara para um evento"],
  vocab=[N("v-evenementenvergunning","evenementenvergunning","licença para evento","de")],
  ex=[("Voor het buurtfeest vragen we een evenementenvergunning aan.","Para a festa do bairro pedimos uma licença de evento."),("De gemeente wil een draaiboek en een plattegrond zien.","A câmara quer ver um plano e uma planta.")],
  review=["v-aanvragen","v-gemeente","v-draaiboek","v-locatie"],
  cefr=C, exs=[
    MA([("evenementenvergunning","licença de evento"),("aanvragen","requerer"),("draaiboek","guião/plano"),("locatie","local")], "Licença.", ["v-evenementenvergunning","v-aanvragen","v-draaiboek","v-locatie"]),
    MC("Onde se pede a evenementenvergunning?", ["*na gemeente (câmara)","na polícia|Não.","no CJIB|Não."], "Instituição.", ["v-evenementenvergunning","v-gemeente"]),
    TR("pt-nl","Pedimos uma licença para a festa.", ["We vragen een vergunning aan voor het feest","We vragen een evenementenvergunning aan voor het feest"], "aanvragen.", ["v-evenementenvergunning"]),
    TR("pt-nl","A câmara quer ver o plano.", ["De gemeente wil het draaiboek zien"], "draaiboek.", ["v-draaiboek"]),
    FB("Vraag de vergunning op tijd ___; dat duurt soms weken.", ["aan"], "Separável.", ["v-aanvragen"], choices=["aan","op","uit"], tr="Pede a licença a tempo; às vezes demora semanas."),
    FE(["Wij","heeft","een","vergunning","aangevraagd."], 1, "hebben", "Plural: hebben.", ["v-aanvragen"]),
    LI("Is er een vergunning nodig als we de straat afsluiten?", ["Is er een vergunning nodig als we de straat afsluiten","Is er een vergunning nodig als we de straat afsluiten?"], "É precisa licença se fecharmos a rua?", "Pergunta.", ["v-evenementenvergunning"]),
    WO("Pedimos uma licença.", ["We","vragen","een","vergunning","aan"], "Separável.", ["v-aanvragen"]),
  ], diff=4, mins=5)

L(23, "Organizar um evento (2)", "Taakverdeling met vrijwilligers.",
  ["Distribuir tarefas por voluntários"],
  vocab=[N("v-taakverdeling","taakverdeling","distribuição de tarefas","de")],
  ex=[("Een duidelijke taakverdeling voorkomt chaos.","Uma distribuição clara de tarefas evita o caos."),("Wie doet de kassa en wie zet de stoelen klaar?","Quem fica na caixa e quem prepara as cadeiras?")],
  review=["v-vrijwilliger","v-catering","v-deelnemer"],
  cefr=C, exs=[
    MA([("taakverdeling","distribuição de tarefas"),("vrijwilliger","voluntário"),("catering","catering"),("deelnemer","participante")], "Equipa.", ["v-taakverdeling","v-vrijwilliger","v-catering","v-deelnemer"]),
    TR("pt-nl","Uma distribuição clara de tarefas evita o caos.", ["Een duidelijke taakverdeling voorkomt chaos"], "voorkómen.", ["v-taakverdeling"]),
    TR("pt-nl","Quem prepara as cadeiras?", ["Wie zet de stoelen klaar?","Wie zet de stoelen klaar"], "klaarzetten.", ["v-taakverdeling"]),
    FB("We zoeken nog drie ___ voor de bar.", ["vrijwilligers"], "Plural.", ["v-vrijwilliger"], choices=["vrijwilligers","deelnemers","taakverdeling"], tr="Ainda procuramos três voluntários para o bar."),
    FE(["Wie","zet","de","stoelen","op?"], 4, "klaar?", "klaarzetten.", ["v-taakverdeling"]),
    DL([("Vrijwilliger","Wat moet ik doen?","O que devo fazer?"),("Jij","","")], ["*Wil jij van twee tot vier bij de ingang staan en de deelnemers verwelkomen?","Iets.|Vago.","Kweenie.|Pouco profissional."], "Tarefa concreta.", ["v-taakverdeling"]),
    SW("Escreva uma mensagem curta aos voluntários com a taakverdeling (3 tarefas com horas).", ["Hoi allemaal!\nTaakverdeling zaterdag:\n- Sanne en Joris: 10.00–12.00 opbouwen\n- Fatima: 12.00–16.00 kassa\n- Pedro: 16.00–17.00 opruimen\nBedankt voor jullie hulp!"], ["3 tarefas","Horas","Agradecimento"], 40, "Mensagem (fictícia).", ["v-taakverdeling"]),
    LI("Iedereen weet nu wat hij moet doen.", ["Iedereen weet nu wat hij moet doen"], "Agora todos sabem o que têm de fazer.", "Ouvir.", ["v-taakverdeling"]),
  ], diff=4, mins=6)

L(24, "Organizar um evento (3): no dia", "Opbouwen en afbreken.",
  ["Coordenar montagem e desmontagem"],
  vocab=[X("v-opbouwen-event","opbouwen","montar (palco, tendas)","verb"), X("v-afbreken","afbreken","desmontar","verb")],
  ex=[("Om acht uur beginnen we met opbouwen.","Às oito começamos a montar."),("Na afloop breken we het podium samen af.","No fim desmontamos o palco juntos.")],
  review=["v-podium","v-draaiboek","v-vrijwilliger"],
  cefr=C, exs=[
    MA([("opbouwen","montar"),("afbreken","desmontar"),("podium","palco"),("draaiboek","guião")], "No dia.", ["v-opbouwen-event","v-afbreken","v-podium","v-draaiboek"]),
    TR("pt-nl","Às oito começamos a montar.", ["Om acht uur beginnen we met opbouwen","We beginnen om acht uur met opbouwen"], "beginnen met.", ["v-opbouwen-event"]),
    TR("pt-nl","Desmontamos o palco juntos.", ["We breken het podium samen af","Wij breken samen het podium af"], "Separável.", ["v-afbreken"]),
    FB("Het podium is gisteren al ___.", ["opgebouwd"], "Particípio.", ["v-opbouwen-event"], choices=["opgebouwd","opgebouwt","geopbouwd"], tr="O palco já foi montado ontem."),
    FE(["Na","afloop","breken","we","alles","op."], 5, "af.", "afbreken.", ["v-afbreken"]),
    MC("Algo corre mal (chuva). Consultas…", ["*o draaiboek (plano B)","o energielabel|Não.","a polis do carro|Não."], "Plano.", ["v-draaiboek"]),
    LI("Wie helpt er na afloop met afbreken?", ["Wie helpt er na afloop met afbreken","Wie helpt er na afloop met afbreken?"], "Quem ajuda a desmontar no fim?", "Pedido.", ["v-afbreken"]),
    WO("Desmontamos tudo.", ["We","breken","alles","af"], "Separável.", ["v-afbreken"]),
  ], diff=4, mins=5)

L(25, "Escola dos filhos", "Het rapportgesprek.",
  ["Conversar com o professor sobre o progresso de um filho"],
  vocab=[N("v-leerkracht","leerkracht","professor(a) (ensino básico)","de","leerkrachten"), N("v-rapportgesprek","rapportgesprek","reunião sobre as notas","het")],
  ex=[("De leerkracht van groep 6 is erg betrokken.","A professora do 6.º grupo é muito dedicada."),("Bij het rapportgesprek bespreken we de cijfers.","Na reunião sobre as notas falamos dos resultados.")],
  review=["v-ouderavond","v-schooladvies","v-basisschool"],
  cefr=C, exs=[
    MA([("leerkracht","professor(a)"),("rapportgesprek","reunião sobre notas"),("ouderavond","reunião de pais"),("schooladvies","recomendação escolar")], "Escola.", ["v-leerkracht","v-rapportgesprek","v-ouderavond","v-schooladvies"]),
    AR("rapportgesprek", "reunião sobre notas", "het", "het gesprek.", ["v-rapportgesprek"]),
    MC("Na escola primária neerlandesa, os anos chamam-se…", ["*groepen (groep 1 a 8)","klassen 1 a 4|Não no primário.","semesters|Não."], "Sistema.", ["v-basisschool"]),
    TR("pt-nl","Como está o meu filho na leitura?", ["Hoe gaat het met mijn zoon met lezen?","Hoe gaat het lezen bij mijn zoon?","Hoe doet mijn zoon het met lezen?"], "Pergunta.", ["v-rapportgesprek"]),
    TR("pt-nl","Em casa falamos português.", ["Thuis spreken we Portugees","Thuis praten we Portugees","We spreken thuis Portugees"], "Inversão.", ["v-leerkracht"]),
    FB("In groep 8 krijgt elk kind een ___ voor de middelbare school.", ["schooladvies"], "Recomendação.", ["v-schooladvies"], choices=["schooladvies","rapportgesprek","leerkracht"], tr="No grupo 8 cada criança recebe uma recomendação para o secundário."),
    FE(["Het","leerkracht","is","ziek."], 0, "De", "de leerkracht.", ["v-leerkracht"]),
    DL([("Leerkracht","Uw dochter is goed in rekenen, maar begrijpend lezen gaat nog moeizaam.","A sua filha é boa a matemática, mas a compreensão de leitura ainda custa."),("Jij","","")], ["*Wat kunnen wij thuis doen om haar te helpen?","Dat is uw probleem.|Não colabora.","Oké, doei.|Abrupto."], "Colaborar.", ["v-rapportgesprek"]),
  ], diff=4, mins=5)

L(26, "Alarme no escritório", "De BHV'er en de verzamelplaats.",
  ["Seguir instruções numa evacuação"],
  vocab=[N("v-bhv-er","BHV'er","socorrista da empresa","de","BHV'ers"), N("v-verzamelplaats","verzamelplaats","ponto de encontro","de")],
  ex=[("Volg de aanwijzingen van de BHV'er.","Segue as instruções do socorrista da empresa."),("De verzamelplaats is op het parkeerterrein.","O ponto de encontro é no parque de estacionamento.")],
  gram=[G("g-s7u12b-5","BHV","**BHV** = *bedrijfshulpverlening*: em empresas neerlandesas há funcionários com formação para primeiros socorros e evacuação (os **BHV'ers**). Numa evacuação: não uses o elevador, deixa as coisas e vai para a **verzamelplaats**.")],
  review=["v-brandalarm","v-ontruimen"],
  cefr=C, exs=[
    MA([("BHV'er","socorrista da empresa"),("verzamelplaats","ponto de encontro"),("brandalarm","alarme de incêndio"),("ontruimen","evacuar")], "Evacuação.", ["v-bhv-er","v-verzamelplaats","v-brandalarm","v-ontruimen"]),
    MC("O alarme toca. O que fazes?", ["*Deixo tudo, uso as escadas e vou para a verzamelplaats","Uso o elevador|Nunca numa evacuação.","Acabo o e-mail primeiro|Não."], "Segurança.", ["v-verzamelplaats"]),
    TR("pt-nl","Segue as instruções do socorrista.", ["Volg de aanwijzingen van de BHV'er","Volg de instructies van de BHV'er"], "aanwijzingen.", ["v-bhv-er"]),
    TR("pt-nl","O edifício está a ser evacuado.", ["Het gebouw wordt ontruimd"], "Passiva.", ["v-ontruimen"]),
    FB("Ga direct naar de ___ en meld je bij de BHV'er.", ["verzamelplaats"], "Ponto de encontro.", ["v-verzamelplaats"], choices=["verzamelplaats","wachtkamer","kantine"], tr="Vai logo para o ponto de encontro e apresenta-te ao socorrista."),
    FE(["Het","gebouw","wordt","ontruimt."], 3, "ontruimd.", "Particípio: ontruimd.", ["v-ontruimen"]),
    LI("Dit is een ontruiming. Verlaat het gebouw via de dichtstbijzijnde uitgang.", ["Dit is een ontruiming. Verlaat het gebouw via de dichtstbijzijnde uitgang","Dit is een ontruiming verlaat het gebouw via de dichtstbijzijnde uitgang"], "Isto é uma evacuação. Saia do edifício pela saída mais próxima.", "Aviso.", ["v-ontruimen"]),
    WO("Vai para o ponto de encontro.", ["Ga","naar","de","verzamelplaats"], "Imperativo.", ["v-verzamelplaats"]),
  ], diff=4, mins=5)

L(27, "Assalto a casa", "Inbraak en verzekeraar.",
  ["Tratar de polícia e seguro depois de um assalto"],
  vocab=[N("v-inbraak","inbraak","assalto (a casa)","de","inbraken"), N("v-verzekeraar","verzekeraar","seguradora","de","verzekeraars")],
  ex=[("Na de inbraak deden we aangifte bij de politie.","Depois do assalto apresentámos queixa à polícia."),("De verzekeraar wil een kopie van de aangifte.","A seguradora quer uma cópia da queixa.")],
  review=["v-aangifte-doen","v-polis","v-schade"],
  cefr=C, exs=[
    MA([("inbraak","assalto"),("verzekeraar","seguradora"),("aangifte doen","apresentar queixa"),("polis","apólice")], "Assalto.", ["v-inbraak","v-verzekeraar","v-aangifte-doen","v-polis"]),
    MC("Primeiros passos depois de um assalto:", ["*Não mexer em nada, ligar à polícia, depois à seguradora","Arrumar tudo primeiro|Destróis pistas.","Esperar uma semana|Não."], "Ordem.", ["v-inbraak"]),
    TR("pt-nl","Apresentámos queixa à polícia.", ["We hebben aangifte gedaan bij de politie","We deden aangifte bij de politie"], "aangifte doen.", ["v-aangifte-doen"]),
    TR("pt-nl","A seguradora quer uma cópia.", ["De verzekeraar wil een kopie"], "verzekeraar.", ["v-verzekeraar"]),
    FB("Valt diefstal onder mijn ___? Even nakijken.", ["polis"], "Apólice.", ["v-polis"], choices=["polis","politie","inbraak"], tr="O roubo está coberto pela minha apólice? Vou verificar."),
    FE(["Het","inbraak","gebeurde","'s","nachts."], 0, "De", "de inbraak.", ["v-inbraak"]),
    DL([("Verzekeraar","Wat is er precies gestolen?","O que foi roubado exatamente?"),("Jij","","")], ["*Een laptop, een fototoestel en wat sieraden. Ik heb de aankoopbonnen van de laptop nog.","Alles.|Pouco preciso.","Weet ik niet.|Não ajuda."], "Lista concreta.", ["v-verzekeraar"]),
    LI("De inbrekers kwamen binnen via een open raam.", ["De inbrekers kwamen binnen via een open raam"], "Os assaltantes entraram por uma janela aberta.", "Relato.", ["v-inbraak"]),
  ], diff=4, mins=5)

L(28, "Mudar de casa", "De adreswijziging doorgeven.",
  ["Comunicar a mudança de morada às entidades"],
  vocab=[N("v-adreswijziging","adreswijziging","mudança de morada","de")],
  ex=[("Geef je adreswijziging binnen vijf dagen na de verhuizing door aan de gemeente.","Comunica a mudança de morada à câmara até cinco dias depois da mudança."),("Vergeet je bank en je zorgverzekeraar niet.","Não te esqueças do banco e do seguro de saúde.")],
  review=["v-verhuizing-doorgeven","v-gemeente","v-verhuisdoos","v-bsn"],
  cefr=C, exs=[
    MA([("adreswijziging","mudança de morada"),("een verhuizing doorgeven","comunicar a mudança"),("verhuisdoos","caixa de mudanças"),("BSN","número de cidadão")], "Mudança.", ["v-adreswijziging","v-verhuizing-doorgeven","v-verhuisdoos","v-bsn"]),
    MC("A quem comunicas primeiro a mudança (oficialmente)?", ["*à gemeente","ao supermercado|Não.","ao CJIB|Não."], "Instituição.", ["v-gemeente"]),
    TR("pt-nl","Comuniquei a mudança de morada.", ["Ik heb mijn adreswijziging doorgegeven","Ik heb de adreswijziging doorgegeven"], "doorgeven.", ["v-adreswijziging"]),
    TR("pt-nl","Não te esqueças do banco.", ["Vergeet je bank niet","Vergeet de bank niet"], "Imperativo.", ["v-adreswijziging"]),
    FB("Voor de inschrijving heb je je ___ en een huurcontract nodig.", ["BSN"], "Número.", ["v-bsn"], choices=["BSN","CJIB","KNMI"], tr="Para o registo precisas do BSN e de um contrato de arrendamento."),
    FE(["Ik","heb","mijn","adreswijziging","doorgegeefd."], 4, "doorgegeven.", "Particípio irregular: doorgegeven.", ["v-adreswijziging"]),
    SW("Faça uma lista (5 itens) de quem deve receber a sua adreswijziging.", ["1. de gemeente\n2. de bank\n3. de zorgverzekeraar\n4. mijn werkgever\n5. de energieleverancier"], ["5 entidades"], 15, "Lista.", ["v-adreswijziging"]),
    LI("Uw verhuizing is verwerkt; u staat nu op het nieuwe adres ingeschreven.", ["Uw verhuizing is verwerkt; u staat nu op het nieuwe adres ingeschreven","Uw verhuizing is verwerkt, u staat nu op het nieuwe adres ingeschreven"], "A sua mudança foi processada; está agora registado na nova morada.", "Confirmação.", ["v-verhuizing-doorgeven"]),
  ], diff=4, mins=5)

L(29, "Prática: um problema do início ao fim", "Van melding tot ingebrekestelling.",
  ["Escalar um problema com o senhorio de forma formal e correta"],
  vocab=[N("v-ingebrekestelling","ingebrekestelling","notificação formal de incumprimento","de")],
  ex=[("Als de verhuurder niets doet, stuur je een ingebrekestelling met een redelijke termijn.","Se o senhorio não fizer nada, envias uma notificação formal com um prazo razoável.")],
  review=["v-lekkage","v-contactformulier","v-verhuurder","v-huurcommissie","v-aanvechten"],
  cefr=C, exs=[
    MC("Ordem lógica para escalar:", ["*telefone/formulário → e-mail escrito → ingebrekestelling → Huurcommissie/jurídico","ingebrekestelling logo no primeiro dia|Primeiro tenta o normal.","nada; esperar|Não resolve."], "Escalar.", ["v-ingebrekestelling"]),
    TR("pt-nl","Envio uma notificação formal com um prazo de duas semanas.", ["Ik stuur een ingebrekestelling met een termijn van twee weken","Ik stuur een ingebrekestelling met een termijn van 2 weken"], "termijn.", ["v-ingebrekestelling"]),
    FB("Ik heb de ___ al drie keer via het contactformulier gemeld.", ["lekkage"], "Problema.", ["v-lekkage"], choices=["lekkage","inbraak","adreswijziging"], tr="Já comuniquei a infiltração três vezes pelo formulário."),
    FE(["Ik","geef","u","twee","weken","de","tijd","om","het","te","repareert."], 10, "repareren.", "om … te + infinitivo.", ["v-ingebrekestelling"]),
    SW("Escreva uma ingebrekestelling curta (80–100 palavras): problema (infiltração), datas em que comunicou, prazo de 14 dias, consequência se nada acontecer.", ["Geachte heer Jansen,\n\nOp 3, 10 en 24 maart heb ik u via het contactformulier gemeld dat er lekkage is in de badkamer. Tot nu toe is er niets gerepareerd en de schimmel wordt erger. Hierbij stel ik u formeel in gebreke. Ik verzoek u de lekkage binnen 14 dagen na dagtekening van deze brief te laten repareren. Gebeurt dat niet, dan zal ik de Huurcommissie inschakelen en juridische stappen overwegen.\n\nMet vriendelijke groet,\nMarta Gomes"], ["Problema","Datas","Prazo","Consequência"], 90, "Carta formal (fictícia).", ["v-ingebrekestelling"]),
  ], diff=5, mins=8)

W()
