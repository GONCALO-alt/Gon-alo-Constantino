import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u10")
C = "B2"
# Lições de aprofundamento (10–29): vocabulário profissional — gestão, finanças, comunicação, técnica.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Estratégia e indicadores", "De strategie en de kpi's.",
  ["Falar de estratégia e indicadores de desempenho"],
  vocab=[N("v-strategie","strategie","estratégia","de","strategieën"), N("v-kpi","kpi (kritieke prestatie-indicator)","indicador-chave de desempenho","de","kpi's")],
  ex=[("Onze strategie richt zich op duurzame groei.","A nossa estratégia foca-se num crescimento sustentável."),("Klanttevredenheid is een van onze kpi's.","A satisfação dos clientes é um dos nossos indicadores-chave.")],
  review=["v-doelstelling","v-klanttevredenheid","v-missie"],
  cefr=C, exs=[
    MA([("strategie","estratégia"),("kpi","indicador-chave"),("doelstelling","objetivo"),("klanttevredenheid","satisfação do cliente")], "Gestão.", ["v-strategie","v-kpi","v-doelstelling","v-klanttevredenheid"]),
    MC("Um exemplo de kpi numa loja online:", ["*percentagem de encomendas entregues a tempo","a cor do logótipo|Não.","o nome do diretor|Não."], "Exemplo.", ["v-kpi"]),
    TR("pt-nl","A nossa estratégia foca-se no crescimento.", ["Onze strategie richt zich op groei","Onze strategie is gericht op groei"], "zich richten op.", ["v-strategie"]),
    TR("pt-nl","A satisfação dos clientes é um indicador-chave.", ["Klanttevredenheid is een kpi","Klanttevredenheid is een van de kpi's"], "kpi.", ["v-kpi"]),
    FB("We meten elk kwartaal of we onze ___ halen.", ["doelstellingen"], "Objetivos.", ["v-doelstelling"], choices=["doelstellingen","strategieën","kpi"], tr="Medimos a cada trimestre se cumprimos os objetivos."),
    FE(["Het","strategie","is","duidelijk."], 0, "De", "de strategie.", ["v-strategie"]),
    LI("Wat is de strategie voor de komende drie jaar?", ["Wat is de strategie voor de komende drie jaar","Wat is de strategie voor de komende drie jaar?"], "Qual é a estratégia para os próximos três anos?", "Pergunta.", ["v-strategie"]),
    WO("É um indicador-chave.", ["Het","is","een","kpi"], "Ordem.", ["v-kpi"]),
  ], diff=5, mins=5)

L(11, "Priorizar e liderar", "Prioriteren en aansturen.",
  ["Falar de prioridades e de liderar uma equipa"],
  vocab=[X("v-prioriteren","prioriteren","definir prioridades","verb"), X("v-aansturen","aansturen","dirigir|coordenar (uma equipa)","verb")],
  ex=[("We moeten prioriteren: niet alles kan tegelijk.","Temos de definir prioridades: não dá tudo ao mesmo tempo."),("Zij stuurt een team van acht mensen aan.","Ela coordena uma equipa de oito pessoas.")],
  review=["v-delegeren","v-leidinggeven","v-prioriteit-geven"],
  cefr=C, exs=[
    MA([("prioriteren","definir prioridades"),("aansturen","coordenar"),("delegeren","delegar"),("leidinggeven","chefiar")], "Liderança.", ["v-prioriteren","v-aansturen","v-delegeren","v-leidinggeven"]),
    TR("pt-nl","Temos de definir prioridades.", ["We moeten prioriteren","Wij moeten prioriteren","We moeten prioriteiten stellen"], "prioriteren.", ["v-prioriteren"]),
    TR("pt-nl","Ela coordena uma equipa de oito.", ["Ze stuurt een team van acht mensen aan","Zij stuurt een team van acht aan"], "Separável.", ["v-aansturen"]),
    MC("Bom líder que «delegeert»…", ["*confia tarefas aos outros e acompanha","faz tudo sozinho|Não.","não dá instruções|Não."], "Conceito.", ["v-delegeren"]),
    FB("Hij ___ het project vanuit Amsterdam aan.", ["stuurt"], "Separável.", ["v-aansturen"], choices=["stuurt","aanstuurt","sturen"], tr="Ele coordena o projeto a partir de Amesterdão."),
    FE(["Wij","moet","beter","prioriteren."], 1, "moeten", "Plural: moeten.", ["v-prioriteren"]),
    LI("Wat heeft nu de hoogste prioriteit?", ["Wat heeft nu de hoogste prioriteit","Wat heeft nu de hoogste prioriteit?"], "O que tem agora a maior prioridade?", "Pergunta.", ["v-prioriteren"]),
    WO("Ela coordena a equipa.", ["Ze","stuurt","het","team","aan"], "Separável.", ["v-aansturen"]),
  ], diff=4, mins=5)

L(12, "Responsabilidade e partes interessadas", "Wie is eindverantwoordelijk?",
  ["Identificar responsáveis e partes interessadas"],
  vocab=[X("v-eindverantwoordelijk","eindverantwoordelijk","responsável final","adjective"), N("v-stakeholder","stakeholder","parte interessada","de","stakeholders")],
  ex=[("De projectleider is eindverantwoordelijk.","O gestor de projeto é o responsável final."),("Betrek alle stakeholders vroeg in het proces.","Envolve todas as partes interessadas cedo no processo.")],
  review=["v-belanghebbende","v-verantwoordelijkheid"],
  cefr=C, exs=[
    MA([("eindverantwoordelijk","responsável final"),("stakeholder","parte interessada"),("belanghebbende","interessado"),("verantwoordelijkheid","responsabilidade")], "Responsabilidade.", ["v-eindverantwoordelijk","v-stakeholder","v-belanghebbende","v-verantwoordelijkheid"]),
    MC("«Stakeholder» e «belanghebbende» são…", ["*sinónimos (um em inglês, outro neerlandês)","opostos|Não.","diferentes|Quase iguais."], "Sinónimos.", ["v-stakeholder"]),
    TR("pt-nl","Quem é o responsável final?", ["Wie is eindverantwoordelijk","Wie is eindverantwoordelijk?"], "eindverantwoordelijk.", ["v-eindverantwoordelijk"]),
    TR("pt-nl","Envolve todas as partes interessadas.", ["Betrek alle stakeholders","Betrek alle belanghebbenden"], "betrekken.", ["v-stakeholder"]),
    FB("Bewoners zijn belangrijke ___ bij dit bouwproject.", ["stakeholders"], "Partes interessadas.", ["v-stakeholder"], choices=["stakeholders","verantwoordelijken","kpi's"], tr="Os moradores são partes interessadas importantes neste projeto."),
    FE(["Zij","zijn","eindverantwoordelijke."], 2, "eindverantwoordelijk.", "Predicativo: sem -e.", ["v-eindverantwoordelijk"]),
    LI("Wie draagt de eindverantwoordelijkheid als het misgaat?", ["Wie draagt de eindverantwoordelijkheid als het misgaat","Wie draagt de eindverantwoordelijkheid als het misgaat?"], "Quem assume a responsabilidade final se correr mal?", "Pergunta.", ["v-eindverantwoordelijk"]),
    WO("É o responsável final.", ["Hij","is","eindverantwoordelijk"], "Ordem.", ["v-eindverantwoordelijk"]),
  ], diff=5, mins=5)

L(13, "Implementar mudanças", "Verandermanagement.",
  ["Falar da introdução de mudanças numa organização"],
  vocab=[X("v-implementeren","implementeren","implementar","verb"), N("v-verandermanagement","verandermanagement","gestão da mudança","het")],
  ex=[("We implementeren het nieuwe systeem in drie fases.","Implementamos o novo sistema em três fases."),("Goed verandermanagement voorkomt veel onrust.","Uma boa gestão da mudança evita muita inquietação.")],
  review=["v-invoeren","v-mijlpaal"],
  cefr=C, exs=[
    MA([("implementeren","implementar"),("verandermanagement","gestão da mudança"),("invoeren","introduzir"),("mijlpaal","marco")], "Mudança.", ["v-implementeren","v-verandermanagement","v-invoeren","v-mijlpaal"]),
    AR("verandermanagement", "gestão da mudança", "het", "het management.", ["v-verandermanagement"]),
    TR("pt-nl","Implementamos o sistema em três fases.", ["We implementeren het systeem in drie fases","We implementeren het systeem in drie fasen"], "fases/fasen.", ["v-implementeren"]),
    TR("pt-nl","Atingimos um marco importante.", ["We hebben een belangrijke mijlpaal bereikt"], "mijlpaal.", ["v-mijlpaal"]),
    FB("Het nieuwe rooster wordt in januari ___.", ["geïmplementeerd"], "Particípio.", ["v-implementeren"], choices=["geïmplementeerd","implementeren","geïmplementeert"], tr="O novo horário é implementado em janeiro."),
    FE(["De","verandermanagement","was","goed","geregeld."], 0, "Het", "het management.", ["v-verandermanagement"]),
    LI("Communicatie is de sleutel tot succesvol verandermanagement.", ["Communicatie is de sleutel tot succesvol verandermanagement"], "A comunicação é a chave de uma gestão da mudança bem-sucedida.", "Princípio.", ["v-verandermanagement"]),
    MC("Fase típica de implementação:", ["*piloto → avaliação → introdução gradual","introduzir tudo num dia sem aviso|Arriscado.","nunca avaliar|Não."], "Processo.", ["v-implementeren"]),
  ], diff=5, mins=5)

L(14, "Resistência à mudança", "Weerstand en draagvlak.",
  ["Lidar com resistência e criar apoio"],
  vocab=[N("v-weerstand","weerstand","resistência","de"), X("v-draagvlak-creeren","draagvlak creëren","criar apoio (consenso)","verb")],
  ex=[("Er is veel weerstand tegen de nieuwe werktijden.","Há muita resistência aos novos horários."),("Door medewerkers te betrekken, creëer je draagvlak.","Envolvendo os funcionários, crias apoio.")],
  review=["v-draagvlak","v-betrekken-bij"],
  cefr=C, exs=[
    MA([("weerstand","resistência"),("draagvlak creëren","criar apoio"),("draagvlak","apoio social"),("betrekken bij","envolver em")], "Apoio.", ["v-weerstand","v-draagvlak-creeren","v-draagvlak","v-betrekken-bij"]),
    MC("A melhor forma de reduzir weerstand:", ["*ouvir as preocupações e envolver as pessoas","impor sem explicar|Aumenta resistência.","ignorar|Não."], "Estratégia.", ["v-weerstand"]),
    TR("pt-nl","Há muita resistência.", ["Er is veel weerstand"], "weerstand.", ["v-weerstand"]),
    TR("pt-nl","Envolvendo as pessoas, crias apoio.", ["Door mensen te betrekken, creëer je draagvlak","Door mensen te betrekken creëer je draagvlak"], "Inversão.", ["v-draagvlak-creeren"]),
    FB("Zonder ___ onder het personeel zal het plan mislukken.", ["draagvlak"], "Apoio.", ["v-draagvlak"], choices=["draagvlak","weerstand","strategie"], tr="Sem apoio do pessoal o plano vai falhar."),
    FE(["Er","is","veel","weerstand","op","het","plan."], 4, "tegen", "weerstand tegen.", ["v-weerstand"]),
    LI("Weerstand is normaal; mensen houden van zekerheid.", ["Weerstand is normaal; mensen houden van zekerheid","Weerstand is normaal, mensen houden van zekerheid"], "A resistência é normal; as pessoas gostam de segurança.", "Perspetiva.", ["v-weerstand"]),
    WO("Há resistência.", ["Er","is","weerstand"], "Ordem.", ["v-weerstand"]),
  ], diff=5, mins=5)

L(15, "Relatórios", "Kwartaalrapportage en jaarverslag.",
  ["Falar de relatórios periódicos"],
  vocab=[N("v-rapportage","rapportage","relatório (periódico)","de"), N("v-kwartaal","kwartaal","trimestre","het","kwartalen"),
         N("v-jaarverslag","jaarverslag","relatório anual","het")],
  ex=[("De rapportage verschijnt elk kwartaal.","O relatório sai todos os trimestres."),("In het jaarverslag staan de resultaten van 2025.","No relatório anual estão os resultados de 2025.")],
  review=["v-resultaat","v-evaluatie"],
  cefr=C, exs=[
    MA([("rapportage","relatório"),("kwartaal","trimestre"),("jaarverslag","relatório anual"),("evaluatie","avaliação")], "Relatórios.", ["v-rapportage","v-kwartaal","v-jaarverslag","v-evaluatie"]),
    AR("kwartaal", "trimestre", "het", "Het kwartaal.", ["v-kwartaal"]),
    AR("jaarverslag", "relatório anual", "het", "het verslag.", ["v-jaarverslag"]),
    TR("pt-nl","O relatório sai todos os trimestres.", ["De rapportage verschijnt elk kwartaal","De rapportage komt elk kwartaal uit"], "verschijnen.", ["v-rapportage"]),
    TR("pt-nl","No relatório anual estão os resultados.", ["In het jaarverslag staan de resultaten"], "Inversão.", ["v-jaarverslag"]),
    FB("In het derde ___ steeg de omzet.", ["kwartaal"], "Trimestre.", ["v-kwartaal"], choices=["kwartaal","jaarverslag","kwartier"], tr="No terceiro trimestre subiu o volume de negócios."),
    FE(["De","jaarverslag","is","online","gepubliceerd."], 0, "Het", "het verslag.", ["v-jaarverslag"]),
    LI("De kwartaalcijfers vallen beter uit dan verwacht.", ["De kwartaalcijfers vallen beter uit dan verwacht"], "Os números trimestrais são melhores do que o esperado.", "Notícia económica.", ["v-kwartaal"]),
  ], diff=4, mins=5)

L(16, "Investir e analisar custos", "Een kosten-batenanalyse.",
  ["Falar de investimentos e análise de custos"],
  vocab=[N("v-investering","investering","investimento","de","investeringen"), N("v-kosten-batenanalyse","kosten-batenanalyse","análise de custo-benefício","de"),
         N("v-liquiditeit","liquiditeit","liquidez","de")],
  ex=[("De investering verdient zich in drie jaar terug.","O investimento recupera-se em três anos."),("Eerst maken we een kosten-batenanalyse.","Primeiro fazemos uma análise de custo-benefício."),("Het bedrijf heeft liquiditeitsproblemen.","A empresa tem problemas de liquidez.")],
  review=["v-investeren","v-rendement","v-begroting"],
  cefr=C, exs=[
    MA([("investering","investimento"),("kosten-batenanalyse","análise custo-benefício"),("liquiditeit","liquidez"),("rendement","retorno")], "Finanças.", ["v-investering","v-kosten-batenanalyse","v-liquiditeit","v-rendement"]),
    MC("«Zich terugverdienen» significa…", ["*recuperar o investimento","perder dinheiro|Não.","pedir emprestado|Não."], "Expressão.", ["v-investering"]),
    TR("pt-nl","O investimento recupera-se em três anos.", ["De investering verdient zich in drie jaar terug"], "zich terugverdienen.", ["v-investering"]),
    TR("pt-nl","Primeiro fazemos uma análise de custo-benefício.", ["Eerst maken we een kosten-batenanalyse","Eerst doen we een kosten-batenanalyse"], "Inversão.", ["v-kosten-batenanalyse"]),
    FB("Door een tekort aan ___ kon het bedrijf zijn leveranciers niet betalen.", ["liquiditeit"], "Liquidez.", ["v-liquiditeit"], choices=["liquiditeit","investering","begroting"], tr="Por falta de liquidez a empresa não pôde pagar aos fornecedores."),
    FE(["De","investeringen","is","te","hoog."], 2, "zijn", "Plural: zijn.", ["v-investering"]),
    LI("Uit de kosten-batenanalyse blijkt dat het project rendabel is.", ["Uit de kosten-batenanalyse blijkt dat het project rendabel is"], "Da análise de custo-benefício resulta que o projeto é rentável.", "Conclusão.", ["v-kosten-batenanalyse"]),
    WO("É um bom investimento.", ["Het","is","een","goede","investering"], "Ordem.", ["v-investering"]),
  ], diff=5, mins=5)

L(17, "Faturação", "Debiteuren en crediteuren.",
  ["Usar vocabulário de faturação"],
  vocab=[X("v-factureren","factureren","faturar","verb"), N("v-debiteuren","debiteuren","clientes devedores (contas a receber)","de"),
         N("v-crediteuren","crediteuren","fornecedores credores (contas a pagar)","de")],
  ex=[("We factureren aan het eind van de maand.","Faturamos no fim do mês."),("Veel debiteuren betalen te laat.","Muitos devedores pagam tarde."),("De crediteuren moeten binnen dertig dagen betaald worden.","Os credores têm de ser pagos no prazo de trinta dias.")],
  review=["v-factuur","v-betalingstermijn","v-aanmaning"],
  cefr=C, exs=[
    MA([("factureren","faturar"),("debiteuren","contas a receber"),("crediteuren","contas a pagar"),("betalingstermijn","prazo de pagamento")], "Faturação.", ["v-factureren","v-debiteuren","v-crediteuren","v-betalingstermijn"]),
    MC("Um cliente que ainda te deve dinheiro é um…", ["*debiteur","crediteur|É o contrário.","accountant|Não."], "Conceito.", ["v-debiteuren"]),
    TR("pt-nl","Faturamos no fim do mês.", ["We factureren aan het eind van de maand","Wij factureren aan het einde van de maand"], "factureren.", ["v-factureren"]),
    TR("pt-nl","Muitos clientes pagam tarde.", ["Veel debiteuren betalen te laat","Veel klanten betalen te laat"], "debiteuren.", ["v-debiteuren"]),
    FB("Stuur de ___ een herinnering als ze niet betalen.", ["debiteuren"], "Devedores.", ["v-debiteuren"], choices=["debiteuren","crediteuren","accountants"], tr="Envia um lembrete aos devedores se não pagarem."),
    FE(["Wij","factureert","maandelijks."], 1, "factureren", "Plural: factureren.", ["v-factureren"]),
    LI("Kunt u de factuur opnieuw sturen met het juiste btw-nummer?", ["Kunt u de factuur opnieuw sturen met het juiste btw-nummer","Kunt u de factuur opnieuw sturen met het juiste btw-nummer?"], "Pode reenviar a fatura com o número de IVA correto?", "Pedido.", ["v-factureren"]),
    WO("Faturamos todos os meses.", ["We","factureren","elke","maand"], "Ordem.", ["v-factureren"]),
  ], diff=5, mins=5)

L(18, "Contabilidade", "De boekhouding en de accountant.",
  ["Falar de contabilidade e obrigações fiscais"],
  vocab=[N("v-boekhouding","boekhouding","contabilidade","de"), N("v-accountant","accountant","contabilista|revisor","de","accountants"),
         N("v-btw-aangifte","btw-aangifte","declaração de IVA","de")],
  ex=[("Ik doe mijn boekhouding zelf.","Faço a minha contabilidade sozinho."),("Onze accountant controleert de jaarcijfers.","O nosso contabilista verifica as contas anuais."),("Als zzp'er doe je elk kwartaal btw-aangifte.","Como independente, fazes a declaração de IVA todos os trimestres.")],
  review=["v-btw","v-zzper"],
  cefr=C, exs=[
    MA([("boekhouding","contabilidade"),("accountant","contabilista"),("btw-aangifte","declaração de IVA"),("btw","IVA")], "Contabilidade.", ["v-boekhouding","v-accountant","v-btw-aangifte","v-btw"]),
    MC("«Accountant» em NL é sobretudo…", ["*contabilista/revisor oficial","gestor de conta bancária|Não.","advogado|Não."], "Falso amigo parcial.", ["v-accountant"]),
    TR("pt-nl","Faço a contabilidade sozinho.", ["Ik doe mijn boekhouding zelf","Ik doe zelf mijn boekhouding"], "boekhouding.", ["v-boekhouding"]),
    TR("pt-nl","Faço a declaração de IVA todos os trimestres.", ["Ik doe elk kwartaal btw-aangifte","Elk kwartaal doe ik btw-aangifte"], "btw-aangifte.", ["v-btw-aangifte"]),
    FB("Onze ___ controleert de jaarcijfers.", ["accountant"], "Contabilista.", ["v-accountant"], choices=["accountant","debiteur","stakeholder"], tr="O nosso contabilista verifica as contas anuais."),
    FE(["De","boekhouding","moeten","kloppen."], 2, "moet", "Singular: moet.", ["v-boekhouding"]),
    LI("Bewaar je bonnetjes; die heb je nodig voor de boekhouding.", ["Bewaar je bonnetjes; die heb je nodig voor de boekhouding","Bewaar je bonnetjes, die heb je nodig voor de boekhouding"], "Guarda os recibos; precisas deles para a contabilidade.", "Dica.", ["v-boekhouding"]),
    WO("O contabilista verifica.", ["De","accountant","controleert"], "Ordem.", ["v-accountant"]),
  ], diff=5, mins=5)

L(19, "Direito do trabalho e baixa", "Ziekteverzuim en de arbodienst.",
  ["Perceber termos ligados a baixa médica"],
  vocab=[N("v-arbeidsrecht","arbeidsrecht","direito do trabalho","het"), N("v-ziekteverzuim","ziekteverzuim","absentismo por doença","het"),
         N("v-arbodienst","arbodienst","serviço de saúde ocupacional","de")],
  ex=[("Het ziekteverzuim is dit jaar gedaald.","O absentismo por doença desceu este ano."),("Na twee weken ziek nam de arbodienst contact op.","Ao fim de duas semanas de baixa, o serviço de saúde ocupacional entrou em contacto."),("Een jurist arbeidsrecht kan je adviseren.","Um jurista de direito do trabalho pode aconselhar-te.")],
  review=["v-re-integratie","v-ziekmelden"],
  cefr=C, exs=[
    MA([("arbeidsrecht","direito do trabalho"),("ziekteverzuim","absentismo por doença"),("arbodienst","saúde ocupacional"),("re-integratie","reintegração")], "Trabalho.", ["v-arbeidsrecht","v-ziekteverzuim","v-arbodienst","v-re-integratie"]),
    AR("ziekteverzuim", "absentismo por doença", "het", "het verzuim.", ["v-ziekteverzuim"]),
    MC("A arbodienst ajuda sobretudo…", ["*no regresso ao trabalho depois de doença","a pagar o salário|Não.","a contratar|Não."], "Função.", ["v-arbodienst"]),
    TR("pt-nl","O absentismo desceu.", ["Het ziekteverzuim is gedaald","Het ziekteverzuim daalde"], "dalen.", ["v-ziekteverzuim"]),
    TR("pt-nl","Um jurista pode aconselhar-te.", ["Een jurist kan je adviseren","Een jurist arbeidsrecht kan je adviseren"], "adviseren.", ["v-arbeidsrecht"]),
    FB("Na langdurige ziekte volgt een ___traject.", ["re-integratie"], "Reintegração.", ["v-re-integratie"], choices=["re-integratie","verzuim","arbo"], tr="Depois de doença prolongada segue-se um percurso de reintegração."),
    FE(["De","ziekteverzuim","is","hoog."], 0, "Het", "het verzuim.", ["v-ziekteverzuim"]),
    LI("Ik meld me vandaag ziek; ik heb koorts.", ["Ik meld me vandaag ziek; ik heb koorts","Ik meld me vandaag ziek, ik heb koorts"], "Hoje fico de baixa; tenho febre.", "Útil.", ["v-ziekmelden"]),
  ], diff=5, mins=5)

L(20, "Comunicação interna", "Nieuwsbrief en intranet.",
  ["Falar de canais de comunicação interna"],
  vocab=[N("v-nieuwsbrief","nieuwsbrief","boletim informativo","de","nieuwsbrieven"), N("v-intranet","intranet","intranet","het"),
         X("v-interne-communicatie","interne communicatie","comunicação interna")],
  ex=[("Het nieuws staat in de interne nieuwsbrief.","A notícia está no boletim interno."),("Alle formulieren vind je op het intranet.","Todos os formulários encontras na intranet."),("De interne communicatie kan beter.","A comunicação interna pode melhorar.")],
  review=["v-informeren"],
  cefr=C, exs=[
    MA([("nieuwsbrief","boletim informativo"),("intranet","intranet"),("interne communicatie","comunicação interna"),("informeren","informar")], "Comunicação.", ["v-nieuwsbrief","v-intranet","v-interne-communicatie","v-informeren"]),
    AR("intranet", "intranet", "het", "Het intranet.", ["v-intranet"]),
    TR("pt-nl","Encontras os formulários na intranet.", ["Je vindt de formulieren op het intranet","De formulieren vind je op het intranet"], "op het intranet.", ["v-intranet"]),
    TR("pt-nl","A comunicação interna pode melhorar.", ["De interne communicatie kan beter"], "kan beter.", ["v-interne-communicatie"]),
    FB("Abonneer je op onze ___ voor het laatste nieuws.", ["nieuwsbrief"], "Boletim.", ["v-nieuwsbrief"], choices=["nieuwsbrief","intranet","jaarverslag"], tr="Subscreve o nosso boletim para as últimas notícias."),
    FE(["De","intranet","is","vandaag","niet","bereikbaar."], 0, "Het", "het intranet.", ["v-intranet"]),
    LI("Ik las het pas in de nieuwsbrief; niemand had het ons verteld.", ["Ik las het pas in de nieuwsbrief; niemand had het ons verteld","Ik las het pas in de nieuwsbrief, niemand had het ons verteld"], "Só o li no boletim; ninguém nos tinha dito.", "Crítica à comunicação.", ["v-interne-communicatie"]),
    WO("Está na intranet.", ["Het","staat","op","het","intranet"], "Ordem.", ["v-intranet"]),
  ], diff=4, mins=5)

L(21, "Comunicação de crise", "Een persconferentie.",
  ["Perceber linguagem de comunicação de crise"],
  vocab=[N("v-persconferentie","persconferentie","conferência de imprensa","de"), N("v-crisiscommunicatie","crisiscommunicatie","comunicação de crise","de")],
  ex=[("De directie geeft vanmiddag een persconferentie.","A direção dá esta tarde uma conferência de imprensa."),("Bij goede crisiscommunicatie ben je snel, eerlijk en duidelijk.","Numa boa comunicação de crise és rápido, honesto e claro.")],
  review=["v-persbericht","v-woordvoerder","v-excuses-ongemak"],
  cefr=C, exs=[
    MA([("persconferentie","conferência de imprensa"),("crisiscommunicatie","comunicação de crise"),("persbericht","comunicado"),("woordvoerder","porta-voz")], "Crise.", ["v-persconferentie","v-crisiscommunicatie","v-persbericht","v-woordvoerder"]),
    MC("Princípio da boa crisiscommunicatie:", ["*informar depressa, admitir o que se sabe e o que não se sabe","esconder até haver certezas|Arriscado.","culpar os outros|Não."], "Princípio.", ["v-crisiscommunicatie"]),
    TR("pt-nl","A direção dá uma conferência de imprensa.", ["De directie geeft een persconferentie"], "geven.", ["v-persconferentie"]),
    TR("pt-nl","Sê rápido, honesto e claro.", ["Wees snel, eerlijk en duidelijk"], "Imperativo.", ["v-crisiscommunicatie"]),
    FB("Tijdens de ___ stelden journalisten kritische vragen.", ["persconferentie"], "Conferência.", ["v-persconferentie"], choices=["persconferentie","nieuwsbrief","kwartaal"], tr="Durante a conferência de imprensa os jornalistas fizeram perguntas críticas."),
    FE(["De","woordvoerder","geven","een","verklaring."], 2, "geeft", "Singular: geeft.", ["v-woordvoerder"]),
    LI("We weten nog niet alles, maar we houden u op de hoogte.", ["We weten nog niet alles, maar we houden u op de hoogte","We weten nog niet alles maar we houden u op de hoogte"], "Ainda não sabemos tudo, mas mantemo-lo informado.", "Frase-tipo de crise.", ["v-crisiscommunicatie"]),
    WO("Dão uma conferência de imprensa.", ["Ze","geven","een","persconferentie"], "Ordem.", ["v-persconferentie"]),
  ], diff=5, mins=5)

L(22, "Identidade da empresa", "Huisstijl, missie en visie.",
  ["Falar da identidade de uma organização"],
  vocab=[N("v-huisstijl","huisstijl","identidade visual","de")],
  ex=[("Alle documenten moeten in de huisstijl.","Todos os documentos têm de seguir a identidade visual."),("Onze missie is betaalbaar wonen voor iedereen.","A nossa missão é habitação acessível para todos.")],
  review=["v-missie","v-visie","v-kernwaarden"],
  cefr=C, exs=[
    MA([("huisstijl","identidade visual"),("missie","missão"),("visie","visão"),("kernwaarden","valores fundamentais")], "Identidade.", ["v-huisstijl","v-missie","v-visie","v-kernwaarden"]),
    MC("Diferença entre missão e visão:", ["*missão = o que fazemos hoje; visão = onde queremos chegar","iguais|Não.","visão = o logótipo|Não."], "Conceitos.", ["v-missie","v-visie"]),
    TR("pt-nl","Os documentos seguem a identidade visual.", ["De documenten zijn in de huisstijl","De documenten moeten in de huisstijl"], "huisstijl.", ["v-huisstijl"]),
    TR("pt-nl","A nossa missão é…", ["Onze missie is"], "missie.", ["v-missie"]),
    FB("Betrouwbaarheid en klantgerichtheid zijn onze ___.", ["kernwaarden"], "Valores.", ["v-kernwaarden"], choices=["kernwaarden","huisstijl","kpi's"], tr="Fiabilidade e orientação ao cliente são os nossos valores."),
    FE(["Het","huisstijl","is","blauw","en","wit."], 0, "De", "de stijl.", ["v-huisstijl"]),
    SW("Escreva a missão (1 frase), a visão (1 frase) e três valores para uma empresa imaginária.", ["Missie: wij brengen verse, lokale groenten bij mensen thuis.\nVisie: in 2030 eet elke stadsbewoner minstens één keer per week lokaal.\nKernwaarden: duurzaam, eerlijk, betrouwbaar."], ["Missão","Visão","Valores"], 30, "Identidade.", ["v-missie","v-visie"]),
    LI("Ons logo is aangepast aan de nieuwe huisstijl.", ["Ons logo is aangepast aan de nieuwe huisstijl"], "O nosso logótipo foi adaptado à nova identidade visual.", "Uso.", ["v-huisstijl"]),
  ], diff=4, mins=5)

L(23, "Tecnologia no trabalho", "Updates en beveiliging.",
  ["Falar de atualizações e segurança informática"],
  vocab=[N("v-update","update","atualização","de","updates"), N("v-beveiliging","beveiliging","segurança (informática)","de")],
  ex=[("Installeer altijd de nieuwste update.","Instala sempre a atualização mais recente."),("De beveiliging van onze systemen is verbeterd.","A segurança dos nossos sistemas foi melhorada."),("Zet tweestapsverificatie aan.","Ativa a verificação em dois passos.")],
  review=["v-wachtwoord","v-tweestapsverificatie","v-datalek"],
  cefr=C, exs=[
    MA([("update","atualização"),("beveiliging","segurança"),("wachtwoord","palavra-passe"),("datalek","fuga de dados")], "TI.", ["v-update","v-beveiliging","v-wachtwoord","v-datalek"]),
    MC("Uma boa prática de beveiliging:", ["*usar palavras-passe diferentes e verificação em dois passos","a mesma palavra-passe em todo o lado|Não.","partilhar a palavra-passe|Não."], "Boas práticas.", ["v-beveiliging"]),
    TR("pt-nl","Instala sempre a atualização mais recente.", ["Installeer altijd de nieuwste update","Installeer altijd de laatste update"], "nieuwste.", ["v-update"]),
    TR("pt-nl","Ativa a verificação em dois passos.", ["Zet tweestapsverificatie aan","Zet de tweestapsverificatie aan"], "aanzetten.", ["v-tweestapsverificatie"]),
    FB("Vanwege de ___ moet je elke drie maanden je wachtwoord wijzigen.", ["beveiliging"], "Segurança.", ["v-beveiliging"], choices=["beveiliging","update","huisstijl"], tr="Por razões de segurança tens de mudar a palavra-passe a cada três meses."),
    FE(["De","update","worden","vannacht","geïnstalleerd."], 2, "wordt", "Singular: wordt.", ["v-update"]),
    LI("Klik nooit op een link in een verdachte e-mail.", ["Klik nooit op een link in een verdachte e-mail","Klik nooit op een link in een verdachte mail"], "Nunca cliques numa ligação de um e-mail suspeito.", "Segurança.", ["v-beveiliging"]),
    WO("Instala a atualização.", ["Installeer","de","update"], "Imperativo.", ["v-update"]),
  ], diff=4, mins=5)

L(24, "Explicar a leigos", "In lekentaal.",
  ["Explicar conceitos técnicos em linguagem de leigo"],
  vocab=[X("v-in-lekentaal","in lekentaal","em linguagem de leigo"), X("v-jargon-vermijden","jargon vermijden","evitar jargão","verb")],
  ex=[("Kun je dat in lekentaal uitleggen?","Consegues explicar isso em linguagem de leigo?"),("Vermijd jargon als je met klanten praat.","Evita jargão quando falas com clientes.")],
  review=["v-vakterm","v-uitleggen-eenvoudig","v-in-gewone-taal"],
  cefr=C, exs=[
    MA([("in lekentaal","em linguagem de leigo"),("jargon vermijden","evitar jargão"),("vakterm","termo técnico"),("eenvoudig uitleggen","explicar de forma simples")], "Simplificar.", ["v-in-lekentaal","v-jargon-vermijden","v-vakterm","v-uitleggen-eenvoudig"]),
    MC("Explicação em lekentaal de «cloudopslag»:", ["*Je bestanden staan niet op je eigen computer, maar op computers van een bedrijf, via internet.","Gedistribueerde redundante opslaginfrastructuur.|Jargão.","Wolk.|Literal."], "Simplificar.", ["v-in-lekentaal"]),
    TR("pt-nl","Consegues explicar isso em linguagem de leigo?", ["Kun je dat in lekentaal uitleggen","Kun je dat in lekentaal uitleggen?"], "lekentaal.", ["v-in-lekentaal"]),
    TR("pt-nl","Evita jargão.", ["Vermijd jargon"], "Imperativo.", ["v-jargon-vermijden"]),
    FB("Een goede arts legt een diagnose uit in ___.", ["lekentaal"], "Linguagem de leigo.", ["v-in-lekentaal"], choices=["lekentaal","vaktaal","jargon"], tr="Um bom médico explica um diagnóstico em linguagem de leigo."),
    FE(["Vermijdt","jargon","in","je","presentatie."], 0, "Vermijd", "Imperativo: sem -t.", ["v-jargon-vermijden"]),
    SW("Explique a um avô em 2–3 frases (lekentaal) o que é uma «app».", ["Een app is een klein programmaatje op je telefoon. Je tikt erop en dan kun je iets doen, bijvoorbeeld het weer bekijken of een bericht sturen. Het is een soort knop voor één taak."], ["Sem jargão","Comparação simples"], 25, "Explicar.", ["v-in-lekentaal"]),
    LI("Als je het niet eenvoudig kunt uitleggen, begrijp je het zelf niet goed genoeg.", ["Als je het niet eenvoudig kunt uitleggen, begrijp je het zelf niet goed genoeg","Als je het niet eenvoudig kunt uitleggen begrijp je het zelf niet goed genoeg"], "Se não o consegues explicar de forma simples, não o percebes bem.", "Citação popular.", ["v-uitleggen-eenvoudig"]),
  ], diff=4, mins=5)

L(25, "Explicar um problema técnico", "Stap voor stap een storing oplossen.",
  ["Dar instruções técnicas passo a passo"],
  vocab=[X("v-storing-oplossen","een storing oplossen","resolver uma avaria","verb")],
  ex=[("Probeer eerst de computer opnieuw op te starten.","Tenta primeiro reiniciar o computador."),("Stap voor stap hebben we de storing opgelost.","Passo a passo resolvemos a avaria.")],
  review=["v-opnieuw-opstarten","v-stap-voor-stap","v-storing","v-uitschakelen"],
  cefr=C, exs=[
    MA([("een storing oplossen","resolver uma avaria"),("opnieuw opstarten","reiniciar"),("stap voor stap","passo a passo"),("uitschakelen","desligar")], "Técnico.", ["v-storing-oplossen","v-opnieuw-opstarten","v-stap-voor-stap","v-uitschakelen"]),
    MC("Primeiro passo clássico do suporte técnico:", ["*Heeft u het apparaat al opnieuw opgestart?","Koop een nieuwe.|Exagero.","Bel morgen terug.|Não."], "Humor de TI.", ["v-opnieuw-opstarten"]),
    TR("pt-nl","Tenta reiniciar o computador.", ["Probeer de computer opnieuw op te starten","Start de computer opnieuw op"], "opnieuw opstarten.", ["v-opnieuw-opstarten"]),
    TR("pt-nl","Resolvemos a avaria passo a passo.", ["We hebben de storing stap voor stap opgelost","Stap voor stap hebben we de storing opgelost"], "oplossen.", ["v-storing-oplossen"]),
    FB("Start de router opnieuw ___ en wacht twee minuten.", ["op"], "Separável.", ["v-opnieuw-opstarten"], choices=["op","aan","uit"], tr="Reinicia o router e espera dois minutos."),
    FE(["De","storing","is","opgelossen."], 3, "opgelost.", "Particípio: opgelost.", ["v-storing-oplossen"]),
    SW("Escreva instruções passo a passo (4 passos) para resolver «a impressora não imprime».", ["1. Controleer of de printer aan staat.\n2. Kijk of er papier in zit.\n3. Start de printer en de computer opnieuw op.\n4. Werkt het nog niet? Bel de servicedesk."], ["4 passos","Imperativo","Claro"], 30, "Instruções.", ["v-storing-oplossen"]),
    LI("Werkt het nog steeds niet? Dan maak ik een melding bij de servicedesk.", ["Werkt het nog steeds niet? Dan maak ik een melding bij de servicedesk","Werkt het nog steeds niet dan maak ik een melding bij de servicedesk"], "Ainda não funciona? Então faço um pedido ao suporte.", "Escalar.", ["v-storing-oplossen"]),
  ], diff=4, mins=5)

L(26, "Mundo académico (1)", "Promoveren op een proefschrift.",
  ["Falar do doutoramento"],
  vocab=[N("v-proefschrift","proefschrift","tese de doutoramento","het","proefschriften"), N("v-promotor","promotor","orientador (de doutoramento)","de","promotoren")],
  ex=[("Ze schrijft een proefschrift over waterbeheer.","Ela escreve uma tese de doutoramento sobre gestão da água."),("Mijn promotor leest elk hoofdstuk kritisch.","O meu orientador lê cada capítulo com espírito crítico.")],
  review=["v-scriptiebegeleider","v-onderzoeksvraag"],
  cefr=C, exs=[
    MA([("proefschrift","tese de doutoramento"),("promotor","orientador"),("scriptiebegeleider","orientador de tese"),("onderzoeksvraag","pergunta de investigação")], "Académico.", ["v-proefschrift","v-promotor","v-scriptiebegeleider","v-onderzoeksvraag"]),
    AR("proefschrift", "tese de doutoramento", "het", "het schrift.", ["v-proefschrift"]),
    MC("«Promoveren» significa…", ["*obter o doutoramento","ser promovido no emprego|Isso é «promotie maken».","fazer publicidade|Não."], "Falso amigo.", ["v-proefschrift"]),
    TR("pt-nl","Ela escreve uma tese de doutoramento.", ["Ze schrijft een proefschrift","Zij schrijft een proefschrift"], "proefschrift.", ["v-proefschrift"]),
    TR("pt-nl","O meu orientador lê cada capítulo.", ["Mijn promotor leest elk hoofdstuk","Mijn promotor leest ieder hoofdstuk"], "promotor.", ["v-promotor"]),
    FB("Volgend jaar ___ hij op een onderzoek naar dijken.", ["promoveert"], "Doutorar-se.", ["v-proefschrift"], choices=["promoveert","promotie","schrijft"], tr="No próximo ano ele doutora-se com uma investigação sobre diques."),
    FE(["De","proefschrift","telt","200","pagina's."], 0, "Het", "het proefschrift.", ["v-proefschrift"]),
    LI("Na vier jaar onderzoek verdedigde ze haar proefschrift.", ["Na vier jaar onderzoek verdedigde ze haar proefschrift"], "Depois de quatro anos de investigação defendeu a tese.", "Uso.", ["v-proefschrift"]),
  ], diff=5, mins=5)

L(27, "Mundo académico (2)", "Colleges en werkgroepen.",
  ["Falar do ensino universitário"],
  vocab=[X("v-college-geven","college geven","dar aulas (na universidade)","verb")],
  ex=[("Zij geeft college over Europees recht.","Ela dá aulas de direito europeu."),("Na het college is er een werkgroep van twintig studenten.","Depois da aula teórica há um seminário de vinte estudantes."),("Voor dit vak krijg je zes studiepunten.","Por esta cadeira recebes seis créditos.")],
  review=["v-werkgroep","v-studiepunten","v-tentamen"],
  cefr=C, exs=[
    MA([("college geven","dar aulas"),("werkgroep","seminário"),("studiepunten","créditos"),("tentamen","exame")], "Universidade.", ["v-college-geven","v-werkgroep","v-studiepunten","v-tentamen"]),
    MC("Na universidade neerlandesa, «college» é…", ["*uma aula teórica","um colégio secundário|Falso amigo.","uma residência|Não."], "Falso amigo.", ["v-college-geven"]),
    TR("pt-nl","Ela dá aulas de direito europeu.", ["Ze geeft college over Europees recht","Zij geeft college in Europees recht"], "college geven.", ["v-college-geven"]),
    TR("pt-nl","Por esta cadeira recebes seis créditos.", ["Voor dit vak krijg je zes studiepunten","Voor dit vak krijg je 6 studiepunten"], "studiepunten.", ["v-studiepunten"]),
    FB("Het ___ is volgende week vrijdag.", ["tentamen"], "Exame.", ["v-tentamen"], choices=["tentamen","college","studiepunt"], tr="O exame é na sexta da próxima semana."),
    FE(["De","professor","geven","college","in","zaal","3."], 2, "geeft", "Singular: geeft.", ["v-college-geven"]),
    LI("In de werkgroep bespreken we de teksten in kleine groepjes.", ["In de werkgroep bespreken we de teksten in kleine groepjes"], "No seminário discutimos os textos em pequenos grupos.", "Uso.", ["v-werkgroep"]),
    WO("Ela dá aulas.", ["Ze","geeft","college"], "Ordem.", ["v-college-geven"]),
  ], diff=4, mins=5)

L(28, "Reunião com cliente", "Verwachtingen managen.",
  ["Gerir expectativas e registar acordos com clientes"],
  vocab=[N("v-verwachtingsmanagement","verwachtingsmanagement","gestão de expectativas","het"), X("v-afspraken-vastleggen","afspraken vastleggen","registar os acordos","verb")],
  ex=[("Goed verwachtingsmanagement voorkomt teleurstelling.","Uma boa gestão de expectativas evita desilusões."),("Laten we de afspraken schriftelijk vastleggen.","Vamos registar os acordos por escrito.")],
  review=["v-verwachtingen","v-op-papier-zetten","v-klantgericht"],
  cefr=C, exs=[
    MA([("verwachtingsmanagement","gestão de expectativas"),("afspraken vastleggen","registar acordos"),("verwachtingen","expectativas"),("op papier zetten","pôr por escrito")], "Clientes.", ["v-verwachtingsmanagement","v-afspraken-vastleggen","v-verwachtingen","v-op-papier-zetten"]),
    MC("Prometer menos e entregar mais é exemplo de…", ["*bom verwachtingsmanagement","mentira|Não.","má gestão|Não."], "Conceito.", ["v-verwachtingsmanagement"]),
    TR("pt-nl","Vamos registar os acordos por escrito.", ["Laten we de afspraken schriftelijk vastleggen","Laten we de afspraken op papier zetten"], "vastleggen.", ["v-afspraken-vastleggen"]),
    TR("pt-nl","Evita desilusões.", ["Het voorkomt teleurstelling","Het voorkomt teleurstellingen"], "voorkómen.", ["v-verwachtingsmanagement"]),
    FB("Wat zijn uw ___ van deze samenwerking?", ["verwachtingen"], "Expectativas.", ["v-verwachtingen"], choices=["verwachtingen","afspraken","kpi's"], tr="Quais são as suas expectativas desta colaboração?"),
    FE(["We","hebben","de","afspraken","vastgelegt."], 4, "vastgelegd.", "g → -d.", ["v-afspraken-vastleggen"]),
    DL([("Klant","Kunnen jullie het binnen een week opleveren?","Conseguem entregar numa semana?"),("Jij","","")], ["*Realistisch gezien wordt het twee weken. Dan weet u zeker dat de kwaliteit goed is.","Ja, geen probleem! (sem certeza)|Mau verwachtingsmanagement.","Nee.|Seco."], "Gerir expectativas.", ["v-verwachtingsmanagement"]),
    LI("Ik stuur u vandaag een samenvatting met de afspraken.", ["Ik stuur u vandaag een samenvatting met de afspraken"], "Envio-lhe hoje um resumo com os acordos.", "Prática.", ["v-afspraken-vastleggen"]),
  ], diff=5, mins=5)

L(29, "Prática: um relatório para a direção", "Van cijfers naar advies.",
  ["Escrever um relatório curto com vocabulário profissional"],
  vocab=[N("v-managementsamenvatting","managementsamenvatting","sumário executivo","de")],
  ex=[("De directie leest vaak alleen de managementsamenvatting.","A direção muitas vezes só lê o sumário executivo.")],
  review=["v-strategie","v-kpi","v-kwartaal","v-investering","v-weerstand","v-draagvlak-creeren","v-in-lekentaal","v-afspraken-vastleggen"],
  cefr=C, exs=[
    MA([("managementsamenvatting","sumário executivo"),("kpi","indicador-chave"),("investering","investimento"),("draagvlak creëren","criar apoio")], "Revisão.", ["v-managementsamenvatting","v-kpi","v-investering","v-draagvlak-creeren"]),
    MC("Um sumário executivo deve…", ["*resumir conclusões e recomendações numa página","contar todos os pormenores|Não.","ter só gráficos|Não."], "Conceito.", ["v-managementsamenvatting"]),
    TR("pt-nl","A direção só lê o sumário executivo.", ["De directie leest alleen de managementsamenvatting"], "Termo.", ["v-managementsamenvatting"]),
    FE(["De","kpi's","is","dit","kwartaal","gehaald."], 2, "zijn", "Plural: zijn.", ["v-kpi"]),
    SW("Escreva um sumário executivo (cerca de 100 palavras) para a direção sobre a introdução de teletrabalho dois dias por semana: situação, números (fictícios), resistência, recomendação.", ["Managementsamenvatting\n\nIn het derde kwartaal hebben we een pilot gedaan met twee thuiswerkdagen per week. De belangrijkste kpi's zijn positief: het ziekteverzuim daalde (fictieve cijfers: van 5% naar 4%) en de klanttevredenheid bleef gelijk. Er was wel weerstand bij teamleiders, die minder overzicht hebben. Door hen bij de evaluatie te betrekken, hebben we draagvlak gecreëerd. De investering in laptops verdient zich binnen twee jaar terug. Advies: thuiswerken vanaf januari structureel invoeren en de afspraken vastleggen in een nieuw beleid."], ["Situação","Números","Resistência","Recomendação"], 90, "Relatório.", ["v-managementsamenvatting"]),
  ], diff=5, mins=8)

W()
