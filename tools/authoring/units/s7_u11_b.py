import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dsl import *
U("s7-u11")
C = "B2"
# Lições de aprofundamento (10–29): fala rápida, reduções, sotaques e compreensão oral.

def X(id, nl, pt, pos="expression"): return V(id, nl, pt, pos)
def N(id, nl, pt, art, pl=None): return V(id, nl, pt, "noun", art, pl)

L(10, "Reduções: 'm e d'r", "Hem → 'm, haar → d'r.",
  ["Reconhecer as formas reduzidas de hem e haar"],
  vocab=[X("v-m-hem","'m","o/ele (forma reduzida de hem)","pronoun"), X("v-d-r","d'r","a/ela, dela (forma reduzida de haar); também = er","pronoun")],
  ex=[("Heb je 'm gezien?","Viste-o?"),("Ik heb d'r gisteren nog gesproken.","Ainda falei com ela ontem."),("Is d'r nog koffie?","Ainda há café?")],
  gram=[G("g-s7u11b-1", "Formas reduzidas na fala", "Na fala rápida, hem soa 'm e haar soa d'r (ou 'r). D'r também substitui er: «Is d'r nog koffie?». Na escrita formal usa-se sempre a forma completa; as reduções aparecem em mensagens informais, banda desenhada e legendas de diálogos.")],
  review=["v-k-ik","v-spreektempo"],
  cefr=C, exs=[
    MC("«Heb je 'm gezien?» — 'm =", ["*hem","mij|Isso é «me».","haar|Isso é «d'r»."], "'m = hem.", ["v-m-hem"]),
    MC("«Ik heb d'r fiets geleend.» — d'r =", ["*haar (dela)","er (lá)|Aqui é possessivo.","daar|Não."], "Possessivo.", ["v-d-r"]),
    MC("«Is d'r nog brood?» — d'r =", ["*er","haar|Aqui não é «ela».","door|Não."], "d'r = er.", ["v-d-r"]),
    TR("nl-pt","Heb je 'm gezien?", ["Viste-o?","Tu viste-o?"], "'m = hem.", ["v-m-hem"]),
    FB("Formeel: «Ik heb ___ gisteren gebeld.» (fala: Ik heb 'm gebeld)", ["hem"], "Forma completa.", ["v-m-hem"], choices=["hem","'m","hij"], tr="Liguei-lhe ontem."),
    FE(["Ik","heb","hij","gisteren","gezien."], 2, "hem", "Complemento: hem ('m).", ["v-m-hem"]),
    LI("Heb je 'm al gebeld?", ["Heb je 'm al gebeld","Heb je hem al gebeld","Heb je hem al gebeld?"], "Já lhe ligaste?", "Ouvir a redução.", ["v-m-hem"]),
    LI("Ik heb d'r gisteren nog gezien.", ["Ik heb d'r gisteren nog gezien","Ik heb haar gisteren nog gezien"], "Ainda a vi ontem.", "Ouvir a redução.", ["v-d-r"]),
  ], diff=4, mins=5)

L(11, "Reduções: m'n e z'n", "Mijn → m'n, zijn → z'n.",
  ["Reconhecer m'n e z'n na fala e em mensagens"],
  vocab=[X("v-m-n","m'n","meu/minha (forma reduzida de mijn)","determiner"), X("v-z-n","z'n","seu/sua (dele) (forma reduzida de zijn)","determiner")],
  ex=[("Ik ben m'n sleutels kwijt.","Perdi as minhas chaves."),("Hij heeft z'n jas vergeten.","Ele esqueceu-se do casaco.")],
  gram=[G("g-s7u11b-2", "m'n e z'n", "Mijn pronuncia-se muitas vezes «mun» e escreve-se m'n em textos informais; zijn (possessivo) fica z'n. Atenção: z'n só substitui o possessivo, nunca o verbo zijn («ser»).")],
  review=["v-m-hem","v-d-r"],
  cefr=C, exs=[
    MA([("m'n","mijn"),("z'n","zijn (dele)"),("'m","hem"),("d'r","haar")], "Formas completas.", ["v-m-n","v-z-n","v-m-hem","v-d-r"]),
    MC("Em qual frase z'n está correto?", ["*Hij is z'n telefoon kwijt.","Ze z'n moe.|Aqui zijn é verbo: «Ze zijn moe».","Wij z'n thuis.|Verbo: zijn."], "Só possessivo.", ["v-z-n"]),
    TR("nl-pt","Ik ben m'n sleutels kwijt.", ["Perdi as minhas chaves","Perdi as chaves"], "kwijt zijn.", ["v-m-n"]),
    TR("pt-nl","Ele esqueceu-se do casaco.", ["Hij heeft z'n jas vergeten","Hij heeft zijn jas vergeten","Hij is z'n jas vergeten","Hij is zijn jas vergeten"], "z'n.", ["v-z-n"]),
    FB("Formeel: «Zij belt ___ moeder.» (fala: d'r moeder)", ["haar"], "Possessivo de ela.", ["v-d-r"], choices=["haar","zijn","z'n"], tr="Ela liga à mãe."),
    FE(["Ze","is","z'n","tas","kwijt."], 2, "d'r", "Dela: d'r (haar).", ["v-z-n","v-d-r"]),
    LI("Ik ben m'n telefoon kwijt.", ["Ik ben m'n telefoon kwijt","Ik ben mijn telefoon kwijt"], "Perdi o telemóvel.", "Ouvir.", ["v-m-n"]),
    WO("Ele perdeu a carteira.", ["Hij","is","z'n","portemonnee","kwijt"], "Ordem.", ["v-z-n"]),
  ], diff=4, mins=5)

L(12, "Reduções: 'ns e da's", "Eens → 'ns, dat is → da's.",
  ["Reconhecer 'ns e da's"],
  vocab=[X("v-ns-eens","'ns","(forma reduzida de eens; suaviza pedidos)","adverb"), X("v-da-s","da's","é (forma reduzida de dat is)")],
  ex=[("Kijk 'ns!","Olha só!"),("Da's mooi!","Isso é bonito!"),("Mag ik 'ns kijken?","Posso dar uma olhadela?")],
  review=["v-wa-s","v-effe"],
  cefr=C, exs=[
    MA([("'ns","eens"),("da's","dat is"),("wa's","wat is"),("effe","even")], "Formas completas.", ["v-ns-eens","v-da-s","v-wa-s","v-effe"]),
    MC("«Kijk 'ns!» soa…", ["*descontraído e amigável","muito formal|Não.","agressivo|Não; 'ns suaviza."], "Tom.", ["v-ns-eens"]),
    TR("nl-pt","Da's mooi!", ["Isso é bonito!","Isso é bonito","Que bonito!","Que bonito"], "da's = dat is.", ["v-da-s"]),
    TR("pt-nl","Olha só!", ["Kijk eens!","Kijk 'ns!","Kijk eens","Kijk 'ns"], "eens.", ["v-ns-eens"]),
    FB("Formeel: «Probeer het ___.» (fala: Probeer 't 'ns)", ["eens"], "Forma completa.", ["v-ns-eens"], choices=["eens","een","ens"], tr="Experimenta."),
    MC("Qual destas é uma escrita formal adequada?", ["*Dat is een goed idee.","Da's een goed idee.|Informal.","Da 's een goed idee.|Informal."], "Registo.", ["v-da-s"]),
    LI("Da's nou jammer!", ["Da's nou jammer","Dat is nou jammer","Da's nou jammer!"], "Que pena!", "Ouvir.", ["v-da-s"]),
    LI("Kom 'ns hier.", ["Kom 'ns hier","Kom eens hier","Kom eens hier."], "Anda cá.", "Ouvir.", ["v-ns-eens"]),
  ], diff=4, mins=5)

L(13, "Palavras fundidas", "Kweenie en weet je wel.",
  ["Reconhecer expressões que na fala se fundem numa só palavra"],
  vocab=[X("v-kweenie","kweenie","sei lá (= ik weet het niet)"), X("v-weet-je-wel","weet je wel","sabes? (bordão)")],
  ex=[("Waar is Tom? — Kweenie.","Onde está o Tom? — Sei lá."),("Het was gewoon raar, weet je wel?","Foi simplesmente estranho, sabes?")],
  gram=[G("g-s7u11b-3", "Fusões na fala rápida", "Em fala muito informal, «ik weet het niet» pode soar como uma só palavra: kweenie. Reconhece-a, mas não a uses em contextos formais. «Weet je wel» é um bordão como o português «sabes?».")],
  review=["v-zeg-maar","v-k-ik"],
  cefr=C, exs=[
    MC("«Kweenie» =", ["*Ik weet het niet.","Ik ken hem niet.|Não.","Kom hier.|Não."], "Fusão.", ["v-kweenie"]),
    MC("Numa entrevista de emprego, em vez de «kweenie» diz…", ["*Dat weet ik niet precies.","Kweenie hoor.|Demasiado informal.","Geen idee, man.|Informal."], "Registo.", ["v-kweenie"]),
    TR("nl-pt","Kweenie.", ["Sei lá","Não sei","Sei lá."], "Fusão.", ["v-kweenie"]),
    TR("nl-pt","Het was gewoon raar, weet je wel?", ["Foi simplesmente estranho, sabes?","Foi mesmo estranho, sabes?"], "Bordão.", ["v-weet-je-wel"]),
    FB("Het was, ___, gewoon een rare dag.", ["zeg maar"], "Enchimento.", ["v-zeg-maar"], choices=["zeg maar","kweenie","da's"], tr="Foi, tipo, só um dia estranho."),
    MA([("kweenie","ik weet het niet"),("weet je wel","sabes?"),("zeg maar","tipo"),("'k","ik")], "Fala informal.", ["v-kweenie","v-weet-je-wel","v-zeg-maar","v-k-ik"]),
    LI("Kweenie, vraag het aan Sanne.", ["Kweenie, vraag het aan Sanne","Ik weet het niet, vraag het aan Sanne"], "Sei lá, pergunta à Sanne.", "Ouvir.", ["v-kweenie"]),
    LI("Het was echt gezellig, weet je wel.", ["Het was echt gezellig, weet je wel","Het was echt gezellig weet je wel"], "Foi mesmo agradável, sabes.", "Ouvir.", ["v-weet-je-wel"]),
  ], diff=4, mins=5)

L(14, "Ouvir flamengo (1)", "Gij en ge.",
  ["Reconhecer os pronomes gij/ge do neerlandês da Flandres"],
  vocab=[X("v-gij-ge","gij / ge","tu/você (Flandres e sul dos Países Baixos)","pronoun"), N("v-vlaming","Vlaming","flamengo (pessoa)","de","Vlamingen")],
  ex=[("Waar gaat ge naartoe?","Para onde vais?"),("Hebt gij dat gezien?","Tu viste isso?"),("Mijn collega is een Vlaming.","O meu colega é flamengo.")],
  gram=[G("g-s7u11b-4", "Gij / ge", "Na Flandres (e em partes do sul dos Países Baixos) usa-se muito gij/ge em vez de jij/je na fala. O verbo leva -t: «ge hebt», «gij komt». Não precisas de o usar; basta reconhecê-lo.")],
  review=["v-vlaams","v-vlaanderen","v-standaardtaal"],
  cefr=C, exs=[
    MC("«Waar gaat ge naartoe?» — ge =", ["*je/jij","hij|Não.","we|Não."], "ge = je.", ["v-gij-ge"]),
    MC("Onde ouves mais «gij/ge»?", ["*na Flandres","em Groningen|Norte: não.","em Amesterdão|Raro."], "Geografia.", ["v-gij-ge","v-vlaanderen"]),
    TR("nl-pt","Hebt gij dat gezien?", ["Tu viste isso?","Viste isso?"], "gij.", ["v-gij-ge"]),
    TR("pt-nl","O meu colega é flamengo.", ["Mijn collega is een Vlaming","Mijn collega is Vlaming"], "Vlaming.", ["v-vlaming"]),
    FB("In standaardtaal: «Waar ga ___ naartoe?» (Vlaams: waar gaat ge naartoe)", ["je"], "Equivalente.", ["v-gij-ge"], choices=["je","ge","gij"], tr="Para onde vais?"),
    FE(["Mijn","buurman","is","een","Vlaams."], 4, "Vlaming.", "Pessoa: Vlaming; língua/adjetivo: Vlaams.", ["v-vlaming","v-vlaams"]),
    LI("Komt ge morgen ook?", ["Komt ge morgen ook","Komt ge morgen ook?"], "Também vens amanhã?", "Ouvir.", ["v-gij-ge"]),
    MA([("Vlaming","flamengo (pessoa)"),("Vlaams","flamengo (língua)"),("gij","tu (sul)"),("standaardtaal","língua padrão")], "Flandres.", ["v-vlaming","v-vlaams","v-gij-ge","v-standaardtaal"]),
  ], diff=4, mins=5)

L(15, "Ouvir flamengo (2)", "Plezant, amai en allez.",
  ["Reconhecer palavras típicas do neerlandês da Flandres"],
  vocab=[X("v-plezant","plezant","giro, agradável (Flandres)","adjective"), X("v-amai","amai","uau! (Flandres)","interjection"),
         X("v-allez","allez","vá lá / bom… (Flandres)","interjection"), N("v-gsm","gsm","telemóvel (Flandres)","de")],
  ex=[("Amai, wat een mooi huis!","Uau, que casa bonita!"),("Het feest was heel plezant.","A festa foi muito gira."),("Allez, we gaan!","Vá, vamos!"),("Mijn gsm is plat.","O meu telemóvel ficou sem bateria.")],
  review=["v-goesting","v-gezellig"],
  cefr=C, exs=[
    MA([("plezant","leuk"),("amai","wauw"),("gsm","mobiel"),("goesting hebben","zin hebben")], "Flandres → Países Baixos.", ["v-plezant","v-amai","v-gsm","v-goesting"]),
    MC("Um neerlandês diria em vez de «gsm»…", ["*mobiel","gsm-toestel|Raro nos Países Baixos.","handy|Isso é alemão."], "Variação.", ["v-gsm"]),
    TR("nl-pt","Amai, wat een mooi huis!", ["Uau, que casa bonita!","Uau, que casa bonita"], "amai.", ["v-amai"]),
    TR("nl-pt","Het feest was heel plezant.", ["A festa foi muito gira","A festa foi muito agradável","A festa foi muito divertida"], "plezant.", ["v-plezant"]),
    FB("In Nederland: «Het was heel ___.» (Vlaams: plezant)", ["leuk"], "Equivalente.", ["v-plezant"], choices=["leuk","plezant","amai"], tr="Foi muito giro."),
    FE(["Het","gsm","ligt","op","tafel."], 0, "De", "de gsm.", ["v-gsm"]),
    LI("Allez, we gaan naar huis.", ["Allez, we gaan naar huis","Allez we gaan naar huis"], "Vá, vamos para casa.", "Ouvir.", ["v-allez"]),
    LI("Amai, dat was plezant!", ["Amai, dat was plezant","Amai dat was plezant","Amai, dat was plezant!"], "Uau, foi giro!", "Ouvir.", ["v-amai","v-plezant"]),
  ], diff=4, mins=5)

L(16, "Sotaques do sul", "Brabants en Limburgs.",
  ["Reconhecer características dos sotaques do sul dos Países Baixos"],
  vocab=[X("v-brabants","Brabants","de Brabante (sotaque/dialeto)","adjective"), X("v-limburgs","Limburgs","limburguês (variedade regional)","adjective")],
  ex=[("Hij praat met een zachte g; hij komt uit Brabant.","Ele fala com g suave; vem de Brabante."),("Limburgs heeft een zangerige melodie.","O limburguês tem uma melodia cantada.")],
  gram=[G("g-s7u11b-5", "O sul", "No sul (Brabante, Limburgo) ouve-se a «zachte g», mais suave que a g do norte. O limburguês é reconhecido oficialmente como língua regional e tem uma entoação cantada. Na rádio e televisão nacionais ouves sobretudo a língua padrão.")],
  review=["v-zachte-g","v-houdoe","v-streektaal"],
  cefr=C, exs=[
    MA([("Brabants","de Brabante"),("Limburgs","limburguês"),("zachte g","g suave"),("houdoe","adeus (Brabante)")], "O sul.", ["v-brabants","v-limburgs","v-zachte-g","v-houdoe"]),
    MC("A «zachte g» ouve-se sobretudo…", ["*no sul (Brabante, Limburgo)","no norte|Lá é mais áspera.","só na Frísia|Não."], "Geografia.", ["v-zachte-g"]),
    MC("O Limburgs é…", ["*uma língua regional reconhecida","a língua oficial do país|Não.","um dialeto de Amesterdão|Não."], "Estatuto.", ["v-limburgs","v-streektaal"]),
    TR("nl-pt","Hij komt uit Brabant en zegt altijd «houdoe».", ["Ele vem de Brabante e diz sempre «houdoe»","Ele é de Brabante e diz sempre houdoe"], "houdoe.", ["v-brabants","v-houdoe"]),
    FB("Hij spreekt met een zachte ___.", ["g"], "Fonética.", ["v-zachte-g"], choices=["g","r","k"], tr="Ele fala com g suave."),
    FE(["Zij","spreek","Limburgs","met","haar","oma."], 1, "spreekt", "Singular: spreekt.", ["v-limburgs"]),
    LI("Houdoe, tot morgen!", ["Houdoe, tot morgen","Houdoe tot morgen","Houdoe, tot morgen!"], "Adeus, até amanhã!", "Ouvir.", ["v-houdoe"]),
    TR("pt-nl","O limburguês tem uma melodia cantada.", ["Limburgs heeft een zangerige melodie","Het Limburgs heeft een zangerige melodie"], "zangerig.", ["v-limburgs"]),
  ], diff=4, mins=5)

L(17, "Sotaques do norte e da Randstad", "Harde g en Gooise r.",
  ["Reconhecer pronúncias típicas do norte e dos media"],
  vocab=[X("v-harde-g","harde g","g áspera (norte)"), X("v-gooise-r","Gooise r","«r» à inglesa (Randstad, media)")],
  ex=[("In het noorden hoor je een harde g.","No norte ouves uma g áspera."),("Veel presentatoren spreken met een Gooise r.","Muitos apresentadores falam com um «r» à inglesa.")],
  gram=[G("g-s7u11b-6", "Harde g e Gooise r", "No norte e oeste a g é mais áspera e gutural (harde g). A «Gooise r» é um r final suave, parecido com o r inglês («maar» soa quase «maaɹ»); ouve-se muito na Randstad e nos media. Ambas são normais — não há uma pronúncia «certa».")],
  review=["v-zachte-g","v-randstad","v-uitspraak"],
  cefr=C, exs=[
    MA([("harde g","g áspera"),("zachte g","g suave"),("Gooise r","r à inglesa"),("uitspraak","pronúncia")], "Pronúncia.", ["v-harde-g","v-zachte-g","v-gooise-r","v-uitspraak"]),
    MC("Onde se ouve muito a Gooise r?", ["*na Randstad e na televisão","só em Limburgo|Não.","só na Flandres|Não."], "Uso.", ["v-gooise-r","v-randstad"]),
    MC("Qual pronúncia da g é a correta?", ["*Ambas; são variantes regionais.","Só a harde g.|Não há só uma correta.","Só a zachte g.|Idem."], "Variação.", ["v-harde-g","v-zachte-g"]),
    TR("pt-nl","No norte ouves uma g áspera.", ["In het noorden hoor je een harde g"], "Inversão.", ["v-harde-g"]),
    FB("Veel presentatoren spreken met een Gooise ___.", ["r"], "Fonética.", ["v-gooise-r"], choices=["r","g","l"], tr="Muitos apresentadores falam com o r à inglesa."),
    FE(["Zij","heeft","een","hard","g."], 3, "harde", "Adjetivo atributivo com «een» antes de palavra de: harde.", ["v-harde-g"]),
    LI("Maar waarom dan?", ["Maar waarom dan","Maar waarom dan?"], "Mas porquê então?", "Ouvir a pronúncia do r.", ["v-gooise-r"]),
    TR("nl-pt","Je uitspraak verraadt waar je vandaan komt.", ["A tua pronúncia denuncia de onde vens","A pronúncia denuncia de onde és"], "verraden.", ["v-uitspraak"]),
  ], diff=4, mins=5)

L(18, "Linguagem informal dos jovens", "Tof, gaaf, chill.",
  ["Reconhecer adjetivos informais de aprovação"],
  vocab=[X("v-tof","tof","fixe (informal)","adjective")],
  ex=[("Wat een toffe jas!","Que casaco tão fixe!"),("Het concert was echt gaaf.","O concerto foi mesmo fixe.")],
  review=["v-gaaf","v-chill","v-vet","v-straattaal"],
  cefr=C, exs=[
    MA([("tof","fixe"),("gaaf","espetacular"),("chill","descontraído"),("vet","brutal")], "Aprovação.", ["v-tof","v-gaaf","v-chill","v-vet"]),
    MC("«Tof» antes de nome de-palavra:", ["*een toffe jas","een tof jas|Falta -e.","een toffen jas|Não."], "Declinação: tof → toffe.", ["v-tof"]),
    TR("nl-pt","Wat een toffe jas!", ["Que casaco tão fixe!","Que casaco fixe!","Que casaco tão fixe"], "toffe.", ["v-tof"]),
    TR("pt-nl","O concerto foi mesmo fixe.", ["Het concert was echt gaaf","Het concert was echt tof","Het concert was echt vet"], "gaaf/tof/vet.", ["v-gaaf"]),
    FB("Num relatório formal, em vez de «vet», escreve-se: «Het resultaat was ___.»", ["uitstekend"], "Registo.", ["v-vet"], choices=["uitstekend","vet","gaaf"], tr="O resultado foi excelente."),
    FE(["Dat","zijn","tof","mensen."], 2, "toffe", "Antes de plural: toffe.", ["v-tof"]),
    LI("Echt tof dat je er bent!", ["Echt tof dat je er bent","Echt tof dat je er bent!"], "Que fixe estares cá!", "Ouvir.", ["v-tof"]),
    MC("Estas palavras são adequadas…", ["*com amigos e em mensagens informais","num e-mail ao senhorio|Demasiado informal.","num requerimento|Não."], "Registo.", ["v-tof","v-chill"]),
  ], diff=3, mins=5)

L(19, "Ouvir avisos na estação", "Deze trein rijdt niet verder dan…",
  ["Compreender avisos de comboio rápidos"],
  vocab=[N("v-spoor","spoor","linha (plataforma)","het"), X("v-rijdt-niet-verder","rijdt niet verder dan…","não segue além de…")],
  ex=[("De trein naar Den Haag vertrekt van spoor 5b.","O comboio para Haia parte da linha 5b."),("Door een seinstoring rijdt deze trein niet verder dan Utrecht.","Devido a uma avaria na sinalização, este comboio não segue além de Utrecht.")],
  review=["v-seinstoring","v-vertraging","v-omroepbericht"],
  cefr=C, exs=[
    MA([("spoor","linha"),("seinstoring","avaria na sinalização"),("vertraging","atraso"),("omroepbericht","aviso sonoro")], "Estação.", ["v-spoor","v-seinstoring","v-vertraging","v-omroepbericht"]),
    MC("«Deze trein rijdt niet verder dan Utrecht.» Vais para Amesterdão (depois de Utrecht). O que fazes?", ["*Saio em Utrecht e procuro outra ligação.","Fico sentado até Amesterdão.|O comboio para em Utrecht.","Saio já.|Não é preciso."], "Compreensão.", ["v-rijdt-niet-verder"]),
    AR("spoor", "linha", "het", "het spoor.", ["v-spoor"]),
    TR("pt-nl","O comboio parte da linha 5.", ["De trein vertrekt van spoor 5","De trein vertrekt van spoor vijf"], "van spoor.", ["v-spoor"]),
    FB("De trein naar Zwolle heeft tien minuten ___.", ["vertraging"], "Atraso.", ["v-vertraging"], choices=["vertraging","spoor","storing"], tr="O comboio para Zwolle tem dez minutos de atraso."),
    FE(["De","trein","vertrekt","op","spoor","3."], 3, "van", "vertrekken van spoor.", ["v-spoor"]),
    LI("De intercity naar Rotterdam vertrekt vandaag van spoor 7.", ["De intercity naar Rotterdam vertrekt vandaag van spoor 7","De intercity naar Rotterdam vertrekt vandaag van spoor zeven"], "O intercidades para Roterdão parte hoje da linha 7.", "Aviso.", ["v-spoor"]),
    LI("Deze trein rijdt niet verder dan Amersfoort.", ["Deze trein rijdt niet verder dan Amersfoort"], "Este comboio não segue além de Amersfoort.", "Aviso.", ["v-rijdt-niet-verder"]),
  ], diff=4, mins=5)

L(20, "Ouvir a meteorologia", "Windkracht en windstoten.",
  ["Compreender a previsão do tempo na rádio"],
  vocab=[N("v-windkracht","windkracht","força do vento (escala de Beaufort)","de"), N("v-windstoten","windstoten","rajadas de vento","de"),
         X("v-knmi","KNMI","Instituto Meteorológico neerlandês")],
  ex=[("Morgen windkracht 6 uit het zuidwesten.","Amanhã vento de força 6 de sudoeste."),("Er worden zware windstoten verwacht.","Esperam-se rajadas fortes."),("Het KNMI heeft code oranje afgegeven.","O KNMI emitiu um aviso laranja.")],
  review=["v-code-oranje","v-opklaringen","v-buien"],
  cefr=C, exs=[
    MA([("windkracht","força do vento"),("windstoten","rajadas"),("opklaringen","abertas"),("bui","aguaceiro")], "Tempo.", ["v-windkracht","v-windstoten","v-opklaringen","v-buien"]),
    MC("«Code oranje» do KNMI significa…", ["*aviso de tempo perigoso: cuidado","bom tempo|Não.","fim do alerta|Não."], "Avisos.", ["v-code-oranje","v-knmi"]),
    TR("nl-pt","Er worden zware windstoten verwacht.", ["Esperam-se rajadas fortes","São esperadas rajadas fortes"], "Passiva.", ["v-windstoten"]),
    TR("pt-nl","Amanhã vento de força 6.", ["Morgen windkracht 6","Morgen windkracht zes"], "windkracht.", ["v-windkracht"]),
    FB("Na een buiige ochtend volgen in de middag ___.", ["opklaringen"], "Abertas.", ["v-opklaringen"], choices=["opklaringen","windstoten","buien"], tr="Depois de uma manhã de aguaceiros seguem-se abertas à tarde."),
    FE(["Het","KNMI","verwachten","zware","regen."], 2, "verwacht", "Singular: verwacht.", ["v-knmi"]),
    LI("Vanavond windkracht 7, aan zee windkracht 8.", ["Vanavond windkracht 7, aan zee windkracht 8","Vanavond windkracht zeven, aan zee windkracht acht"], "Esta noite vento de força 7, junto ao mar força 8.", "Previsão.", ["v-windkracht"]),
    LI("Morgen eerst buien, later opklaringen.", ["Morgen eerst buien, later opklaringen","Morgen eerst buien later opklaringen"], "Amanhã primeiro aguaceiros, depois abertas.", "Previsão.", ["v-opklaringen"]),
  ], diff=4, mins=5)

L(21, "Má ligação telefónica", "Je valt weg.",
  ["Lidar com problemas de ligação ao telefone"],
  vocab=[X("v-je-valt-weg","je valt weg","estás a falhar (a chamada corta)"), X("v-ik-versta-je-slecht","ik versta je slecht","ouço-te mal")],
  ex=[("Sorry, je valt weg. Kun je me terugbellen?","Desculpa, estás a falhar. Podes ligar-me de volta?"),("Ik versta je slecht; ik zit in de trein.","Ouço-te mal; estou no comboio.")],
  review=["v-verbinding","v-terugbellen"],
  cefr=C, exs=[
    MA([("je valt weg","a chamada corta"),("ik versta je slecht","ouço-te mal"),("verbinding","ligação"),("terugbellen","ligar de volta")], "Telefone.", ["v-je-valt-weg","v-ik-versta-je-slecht","v-verbinding","v-terugbellen"]),
    MC("A chamada corta constantemente. Dizes:", ["*Je valt steeds weg, zal ik je zo terugbellen?","Je bent weg.|Soa a «foste-te embora».","Je valt.|Incompleto."], "Expressão.", ["v-je-valt-weg"]),
    TR("pt-nl","Ouço-te mal.", ["Ik versta je slecht","Ik versta je niet goed"], "verstaan.", ["v-ik-versta-je-slecht"]),
    TR("pt-nl","A ligação é má.", ["De verbinding is slecht","Ik heb een slechte verbinding"], "verbinding.", ["v-verbinding"]),
    FB("Ik zit in de tunnel; ik bel je zo ___.", ["terug"], "Separável.", ["v-terugbellen"], choices=["terug","weg","op"], tr="Estou no túnel; já te ligo de volta."),
    FE(["Ik","versta","je","slechte."], 3, "slecht.", "Advérbio: slecht.", ["v-ik-versta-je-slecht"]),
    LI("Hallo? Je valt weg. Hoor je me nog?", ["Hallo? Je valt weg. Hoor je me nog","Hallo je valt weg hoor je me nog","Hallo? Je valt weg. Hoor je me nog?"], "Estou? Estás a falhar. Ainda me ouves?", "Ouvir.", ["v-je-valt-weg"]),
    WO("Ouço-te mal.", ["Ik","versta","je","slecht"], "Ordem.", ["v-ik-versta-je-slecht"]),
  ], diff=3, mins=5)

L(22, "Pedir para repetir", "Ik verstond u niet.",
  ["Pedir educadamente que repitam ou abrandem"],
  vocab=[X("v-ik-verstond-u-niet","ik verstond u niet","não percebi o que disse"), X("v-even-herhalen","kunt u dat even herhalen?","pode repetir, por favor?")],
  ex=[("Sorry, ik verstond u niet. Kunt u dat even herhalen?","Desculpe, não percebi. Pode repetir?"),("Kunt u iets langzamer praten?","Pode falar um pouco mais devagar?")],
  review=["v-iets-langzamer","v-verkeerd-verstaan","v-herhalen"],
  cefr=C, exs=[
    MA([("ik verstond u niet","não percebi"),("kunt u dat even herhalen?","pode repetir?"),("iets langzamer","mais devagar"),("verkeerd verstaan","perceber mal")], "Pedidos.", ["v-ik-verstond-u-niet","v-even-herhalen","v-iets-langzamer","v-verkeerd-verstaan"]),
    MC("«Verstaan» vs «begrijpen»: «Ik verstond u niet» significa…", ["*não ouvi bem as palavras","não entendi o conceito|Isso é «begrijpen».","não concordo|Não."], "verstaan = ouvir/perceber as palavras.", ["v-ik-verstond-u-niet"]),
    TR("pt-nl","Pode repetir, por favor?", ["Kunt u dat even herhalen?","Kunt u dat herhalen?","Kunt u dat even herhalen"], "herhalen.", ["v-even-herhalen"]),
    TR("pt-nl","Desculpe, não percebi.", ["Sorry, ik verstond u niet","Sorry, ik heb u niet verstaan","Pardon, ik verstond u niet"], "verstaan.", ["v-ik-verstond-u-niet"]),
    FB("Kunt u iets ___ praten? Ik leer nog Nederlands.", ["langzamer"], "Comparativo.", ["v-iets-langzamer"], choices=["langzamer","langzaam","langzaamst"], tr="Pode falar mais devagar? Ainda estou a aprender neerlandês."),
    FE(["Kunt","u","dat","even","herhaal?"], 4, "herhalen?", "Depois de kunnen: infinitivo.", ["v-even-herhalen"]),
    DL([("Medewerker","U moet formulier B-twaalf invullen en dat vóór de vijftiende inleveren.","Tem de preencher o formulário B-12 e entregá-lo antes do dia 15."),("Jij","","")], ["*Sorry, dat ging snel. Welk formulier zei u?","Wat?|Brusco.","Ok.|Não confirma."], "Pedir só a parte que faltou.", ["v-ik-verstond-u-niet"]),
    LI("Sorry, ik verstond u niet. Kunt u dat even herhalen?", ["Sorry, ik verstond u niet. Kunt u dat even herhalen","Sorry ik verstond u niet kunt u dat even herhalen","Sorry, ik verstond u niet. Kunt u dat even herhalen?"], "Desculpe, não percebi. Pode repetir?", "Ouvir.", ["v-even-herhalen"]),
  ], diff=3, mins=5)

L(23, "Confirmar que percebeste", "Klopt dat?",
  ["Verificar a compreensão resumindo o que ouviste"],
  vocab=[X("v-klopt-dat","klopt dat?","é isso? / está certo?")],
  ex=[("Dus de vergadering is verplaatst naar donderdag. Klopt dat?","Então a reunião passou para quinta. É isso?"),("Als ik het goed begrijp, moet ik zelf een afspraak maken.","Se percebi bem, tenho de marcar eu uma consulta.")],
  review=["v-als-ik-het-goed-begrijp","v-samenvatten","v-hoe-bedoel-je"],
  cefr=C, exs=[
    MA([("klopt dat?","é isso?"),("als ik het goed begrijp","se percebi bem"),("samenvatten","resumir"),("hoe bedoel je?","como assim?")], "Confirmar.", ["v-klopt-dat","v-als-ik-het-goed-begrijp","v-samenvatten","v-hoe-bedoel-je"]),
    MC("A melhor forma de confirmar uma instrução longa:", ["*Resumir com as tuas palavras e perguntar «Klopt dat?»","Dizer só «ja ja»|Não confirma nada.","Pedir para repetir tudo três vezes|Pouco eficaz."], "Estratégia.", ["v-klopt-dat"]),
    TR("pt-nl","Então a reunião é na quinta. É isso?", ["Dus de vergadering is donderdag. Klopt dat?","Dus de vergadering is op donderdag. Klopt dat?"], "klopt dat.", ["v-klopt-dat"]),
    TR("pt-nl","Se percebi bem, tenho de pagar antes de sexta.", ["Als ik het goed begrijp, moet ik voor vrijdag betalen","Als ik het goed begrijp moet ik vóór vrijdag betalen","Als ik het goed begrijp, moet ik vóór vrijdag betalen"], "Inversão.", ["v-als-ik-het-goed-begrijp"]),
    FB("Mag ik het even ___? U wilt drie offertes, klopt dat?", ["samenvatten"], "Resumir.", ["v-samenvatten"], choices=["samenvatten","herhalen","verstaan"], tr="Posso resumir? Quer três orçamentos, certo?"),
    MC("Qual é a ordem correta?", ["*Als ik het goed begrijp, moet ik morgen komen.","Als ik het goed begrijp, ik moet morgen komen.|Depois da oração subordinada: verbo antes do sujeito."], "Inversão depois da subordinada.", ["v-als-ik-het-goed-begrijp"]),
    LI("Dus u wilt het pakket morgen ophalen, klopt dat?", ["Dus u wilt het pakket morgen ophalen, klopt dat","Dus u wilt het pakket morgen ophalen klopt dat","Dus u wilt het pakket morgen ophalen, klopt dat?"], "Então quer levantar a encomenda amanhã, é isso?", "Ouvir.", ["v-klopt-dat"]),
    WO("É isso?", ["Klopt","dat"], "Pergunta.", ["v-klopt-dat"]),
  ], diff=4, mins=5)

L(24, "Podcasts", "Abonneren op een podcast.",
  ["Falar de podcasts e de os usar para aprender"],
  vocab=[N("v-podcast","podcast","podcast","de","podcasts"), X("v-abonneren","zich abonneren op","subscrever","verb")],
  ex=[("Ik luister elke ochtend een Nederlandse podcast.","Ouço todas as manhãs um podcast neerlandês."),("Abonneer je op de podcast, dan mis je geen aflevering.","Subscreve o podcast e não perdes nenhum episódio.")],
  review=["v-aflevering","v-afspelen","v-terugspoelen"],
  cefr=C, exs=[
    MA([("podcast","podcast"),("zich abonneren op","subscrever"),("aflevering","episódio"),("terugspoelen","andar para trás")], "Podcasts.", ["v-podcast","v-abonneren","v-aflevering","v-terugspoelen"]),
    MC("Dica para ouvir um podcast difícil:", ["*Ouvir, andar para trás nas partes difíceis e anotar palavras-chave","Desistir ao primeiro minuto|Não.","Ouvir só em velocidade 2x|Mais difícil."], "Estratégia.", ["v-terugspoelen","v-kernwoorden"]),
    TR("pt-nl","Ouço todas as manhãs um podcast.", ["Ik luister elke ochtend een podcast","Elke ochtend luister ik een podcast","Ik luister elke ochtend naar een podcast"], "luisteren.", ["v-podcast"]),
    TR("pt-nl","Subscreve o podcast.", ["Abonneer je op de podcast"], "zich abonneren op.", ["v-abonneren"]),
    FB("In de nieuwste ___ praten ze over wonen.", ["aflevering"], "Episódio.", ["v-aflevering"], choices=["aflevering","podcast","abonnement"], tr="No episódio mais recente falam de habitação."),
    FE(["Ik","heb","me","geabonneerd","in","die","podcast."], 4, "op", "zich abonneren op.", ["v-abonneren"]),
    LI("Welkom bij een nieuwe aflevering van onze podcast.", ["Welkom bij een nieuwe aflevering van onze podcast"], "Bem-vindos a um novo episódio do nosso podcast.", "Abertura típica.", ["v-podcast","v-aflevering"]),
    WO("Subscrevi.", ["Ik","heb","me","geabonneerd"], "Ordem.", ["v-abonneren"]),
  ], diff=3, mins=5)

L(25, "Soletrar ao telefone", "A van Anton.",
  ["Soletrar nomes com o alfabeto telefónico neerlandês"],
  vocab=[X("v-a-van-anton","A van Anton","A de Anton (alfabeto telefónico)")],
  ex=[("Mijn naam is Sousa: S van Simon, O van Otto, U van Utrecht, S van Simon, A van Anton.","O meu nome é Sousa: S de Simon, O de Otto, U de Utrecht, S de Simon, A de Anton.")],
  gram=[G("g-s7u11b-7", "Alfabeto telefónico", "Nos Países Baixos soletra-se com nomes e cidades: A van Anton, B van Bernard, D van Dirk, E van Eduard, H van Hendrik, J van Johan, K van Karel, M van Maria, N van Nico, O van Otto, P van Pieter, R van Rudolf, S van Simon, T van Theodoor, U van Utrecht, W van Willem, Z van Zaandam. Atenção a letras que soam parecido em neerlandês: e/i, g/h, ei/ij.")],
  review=["v-spellen","v-kunt-u-dat-spellen","v-ik-zal-het-noteren"],
  cefr=C, exs=[
    MC("Como soletras a letra P?", ["*P van Pieter","P van Paris|Não é o padrão neerlandês.","P van Papa|É o alfabeto internacional."], "Alfabeto NL.", ["v-a-van-anton"]),
    MC("Como soletras a letra W?", ["*W van Willem","W van Whisky|Internacional.","W van Wouter|Não é o padrão."], "Alfabeto NL.", ["v-a-van-anton"]),
    MC("Ouves «S van Simon, I van Izaak, L van Lodewijk, V van Victor, A van Anton». O nome é…", ["*Silva","Sylva|I, não Y.","Silvia|Falta uma letra."], "Compreensão.", ["v-a-van-anton"]),
    TR("pt-nl","Pode soletrar isso?", ["Kunt u dat spellen?","Kunt u dat spellen","Kunt u dat even spellen?"], "spellen.", ["v-kunt-u-dat-spellen"]),
    FB("Mijn naam begint met een D, D van ___.", ["Dirk"], "Alfabeto.", ["v-a-van-anton"], choices=["Dirk","Daan","Dam"], tr="O meu nome começa por D, D de Dirk."),
    FE(["Kunt","u","dat","spelt?"], 3, "spellen?", "Depois de kunnen: infinitivo.", ["v-spellen"]),
    LI("R van Rudolf, O van Otto, S van Simon, A van Anton.", ["R van Rudolf, O van Otto, S van Simon, A van Anton","R van Rudolf O van Otto S van Simon A van Anton"], "R de Rudolf, O de Otto, S de Simon, A de Anton (Rosa).", "Soletrar.", ["v-a-van-anton"]),
    SW("Soletre o seu apelido com o alfabeto telefónico neerlandês.", ["Mijn achternaam is Costa: C van Cornelis, O van Otto, S van Simon, T van Theodoor, A van Anton."], ["Letra + van + nome"], 20, "Soletrar.", ["v-a-van-anton"]),
  ], diff=3, mins=5)

L(26, "Números ditos depressa", "Dertien of dertig?",
  ["Distinguir números que se confundem facilmente ao ouvir"],
  vocab=[X("v-verwarren","verwarren","confundir","verb"), X("v-zeventien","zeventien","dezassete","numeral")],
  ex=[("Ik verwar dertien en dertig nog vaak.","Ainda confundo treze e trinta muitas vezes."),("Het nummer is zesentachtig, dus eerst de zes.","O número é oitenta e seis, por isso primeiro o seis.")],
  gram=[G("g-s7u11b-8", "Ouvir números", "Repara na terminação: -tien (13–19) vs -tig (20, 30…). Nos números compostos, a unidade vem primeiro: 86 = zes-en-tachtig («seis e oitenta»). Ao telefone, confirma repetindo: «Dertien, één-drie?».")],
  review=["v-dertien","v-tachtig","v-ik-zal-het-noteren"],
  cefr=C, exs=[
    MC("«Zeventien» =", ["*17","70|Isso é zeventig.","7|Isso é zeven."], "-tien.", ["v-zeventien"]),
    MC("«Vierenvijftig» =", ["*54","45|A unidade vem primeiro.","40|Não."], "Unidade primeiro.", ["v-dertien"]),
    MC("Ouves «tweeëntachtig». Escreves:", ["*82","28|Inverteste.","80|Não."], "Unidade primeiro.", ["v-tachtig"]),
    TR("pt-nl","Ainda confundo treze e trinta.", ["Ik verwar dertien en dertig nog","Ik verwar nog vaak dertien en dertig","Ik verwar dertien nog met dertig"], "verwarren.", ["v-verwarren"]),
    FB("Ik ___ die twee getallen altijd.", ["verwar"], "Presente.", ["v-verwarren"], choices=["verwar","verwart","verwarren"], tr="Confundo sempre esses dois números."),
    FE(["Zij","verwar","de","namen","van","de","tweeling."], 1, "verwart", "Singular: verwart.", ["v-verwarren"]),
    LI("Mijn huisnummer is zevenenveertig.", ["Mijn huisnummer is zevenenveertig","Mijn huisnummer is 47"], "O número da minha casa é 47.", "Número.", ["v-zeventien"]),
    LI("Bel me op nul zes, dertien, zeventien, achtentachtig.", ["Bel me op nul zes, dertien, zeventien, achtentachtig","Bel me op 06 13 17 88","Bel me op 06-13171788"], "Liga-me para 06 13 17 88.", "Número de telefone (fictício).", ["v-zeventien","v-dertien"]),
  ], diff=4, mins=5)

L(27, "Debate na televisão", "Laat me uitpraten!",
  ["Seguir um debate em que as pessoas se interrompem"],
  vocab=[X("v-in-de-rede-vallen","iemand in de rede vallen","interromper alguém","verb")],
  ex=[("U valt me steeds in de rede!","Está sempre a interromper-me!"),("De presentator geeft het woord aan de minister.","O apresentador dá a palavra ao ministro.")],
  review=["v-laat-me-uitpraten","v-door-elkaar-praten","v-het-woord-geven","v-aan-het-woord"],
  cefr=C, exs=[
    MA([("iemand in de rede vallen","interromper alguém"),("laat me even uitpraten","deixe-me acabar"),("door elkaar praten","falar ao mesmo tempo"),("aan het woord zijn","ter a palavra")], "Debate.", ["v-in-de-rede-vallen","v-laat-me-uitpraten","v-door-elkaar-praten","v-aan-het-woord"]),
    MC("«In de rede vallen» é sinónimo de…", ["*onderbreken","uitpraten|Contrário.","instemmen|Não."], "Sinónimo.", ["v-in-de-rede-vallen","v-onderbreken"]),
    TR("pt-nl","Está sempre a interromper-me!", ["U valt me steeds in de rede!","U valt me steeds in de rede","Je valt me steeds in de rede!"], "in de rede vallen.", ["v-in-de-rede-vallen"]),
    TR("pt-nl","Deixe-me acabar.", ["Laat me even uitpraten","Laat me uitpraten"], "uitpraten.", ["v-laat-me-uitpraten"]),
    FB("Iedereen praat door ___; ik versta er niets van.", ["elkaar"], "Expressão.", ["v-door-elkaar-praten"], choices=["elkaar","mekaar","zich"], tr="Estão todos a falar ao mesmo tempo; não percebo nada."),
    FE(["Hij","valt","haar","steeds","op","de","rede."], 4, "in", "in de rede vallen.", ["v-in-de-rede-vallen"]),
    LI("Mag ik even? U valt me in de rede.", ["Mag ik even? U valt me in de rede","Mag ik even u valt me in de rede","Mag ik even? U valt me in de rede."], "Posso? Está a interromper-me.", "Ouvir.", ["v-in-de-rede-vallen"]),
    LI("Nu is mevrouw De Vries aan het woord.", ["Nu is mevrouw De Vries aan het woord"], "Agora tem a palavra a senhora De Vries.", "Moderador.", ["v-aan-het-woord"]),
  ], diff=4, mins=5)

L(28, "Ironia e sarcasmo", "Lekker weertje, hè?",
  ["Reconhecer sarcasmo pela entoação e pelo contexto"],
  vocab=[N("v-sarcasme","sarcasme","sarcasmo","het")],
  ex=[("Het regent al de hele week. — Lekker weertje, hè!","Chove a semana toda. — Belo tempinho, hã!"),("Dat bedoelde hij sarcastisch.","Ele disse isso com sarcasmo.")],
  gram=[G("g-s7u11b-9", "Reconhecer sarcasmo", "O sarcasmo neerlandês costuma ser seco: elogio exagerado numa situação má, muitas vezes com «lekker», «nou», «ja hoor» ou «hè». O contexto é a pista principal: se o elogio não faz sentido, provavelmente é ironia.")],
  review=["v-sarcastisch","v-ironie","v-ja-hoor","v-droge-humor"],
  cefr=C, exs=[
    MA([("sarcasme","sarcasmo"),("sarcastisch","sarcástico"),("ironie","ironia"),("droge humor","humor seco")], "Humor.", ["v-sarcasme","v-sarcastisch","v-ironie","v-droge-humor"]),
    MC("O comboio vai com uma hora de atraso. Um passageiro diz «Nou, lekker op tijd weer!». Ele está…", ["*a ser sarcástico","contente|O contexto diz o contrário.","a elogiar a NS|Não."], "Contexto.", ["v-sarcasme"]),
    MC("Qual destas frases é provavelmente sarcástica?", ["*(Com o pneu furado na chuva) Wat een heerlijke dag!","(Ao sol na praia) Wat een heerlijke dag!|Sincero.","(Num aniversário) Gefeliciteerd!|Sincero."], "Contexto.", ["v-sarcastisch"]),
    AR("sarcasme", "sarcasmo", "het", "het sarcasme.", ["v-sarcasme"]),
    TR("pt-nl","Ele disse isso com sarcasmo.", ["Dat bedoelde hij sarcastisch","Hij zei dat sarcastisch"], "sarcastisch.", ["v-sarcastisch"]),
    FE(["De","sarcasme","was","duidelijk."], 0, "Het", "het sarcasme.", ["v-sarcasme"]),
    LI("Ja hoor, alweer een vergadering. Gezellig!", ["Ja hoor, alweer een vergadering. Gezellig","Ja hoor alweer een vergadering gezellig","Ja hoor, alweer een vergadering. Gezellig!"], "Pois claro, mais uma reunião. Que giro!", "Ironia.", ["v-ja-hoor"]),
    FB("Het was ___ bedoeld; hij vond het eigenlijk vreselijk.", ["sarcastisch"], "Adjetivo/advérbio.", ["v-sarcastisch"], choices=["sarcastisch","sarcasme","eerlijk"], tr="Era sarcasmo; na verdade ele achou horrível."),
  ], diff=4, mins=5)

L(29, "Prática: ouvir e anotar", "Een dictee.",
  ["Ouvir frases rápidas e escrevê-las por completo"],
  vocab=[N("v-dictee","dictee","ditado","het","dictees")],
  ex=[("Een dictee helpt je om beter te luisteren.","Um ditado ajuda-te a ouvir melhor.")],
  review=["v-m-hem","v-m-n","v-ns-eens","v-kweenie","v-spoor","v-windkracht","v-je-valt-weg","v-klopt-dat"],
  cefr=C, exs=[
    AR("dictee", "ditado", "het", "het dictee.", ["v-dictee"]),
    LI("Heb je 'm al gezien? Hij is z'n fiets kwijt.", ["Heb je 'm al gezien? Hij is z'n fiets kwijt","Heb je hem al gezien? Hij is zijn fiets kwijt","Heb je 'm al gezien hij is z'n fiets kwijt"], "Já o viste? Ele perdeu a bicicleta.", "Ditado.", ["v-m-hem","v-z-n"]),
    LI("Kijk 'ns, da's m'n nieuwe jas.", ["Kijk 'ns, da's m'n nieuwe jas","Kijk eens, dat is mijn nieuwe jas","Kijk 'ns da's m'n nieuwe jas"], "Olha, este é o meu casaco novo.", "Ditado.", ["v-ns-eens","v-da-s","v-m-n"]),
    LI("De sprinter naar Leiden vertrekt van spoor 4a.", ["De sprinter naar Leiden vertrekt van spoor 4a","De sprinter naar Leiden vertrekt van spoor vier a"], "O comboio regional para Leiden parte da linha 4a.", "Ditado.", ["v-spoor"]),
    LI("Morgen windkracht 5, in de middag opklaringen.", ["Morgen windkracht 5, in de middag opklaringen","Morgen windkracht vijf, in de middag opklaringen","Morgen windkracht 5 in de middag opklaringen"], "Amanhã vento força 5, à tarde abertas.", "Ditado.", ["v-windkracht"]),
    LI("Dus we zien elkaar dinsdag om drie uur, klopt dat?", ["Dus we zien elkaar dinsdag om drie uur, klopt dat","Dus we zien elkaar dinsdag om drie uur klopt dat","Dus we zien elkaar dinsdag om drie uur, klopt dat?"], "Então vemo-nos terça às três, é isso?", "Ditado.", ["v-klopt-dat"]),
    MC("Na escrita formal, «Kijk 'ns, da's m'n jas» fica…", ["*Kijk eens, dat is mijn jas.","Kijk ens, das mijn jas.|Erros.","Kijk 'ns, dat is m'n jas.|Ainda informal."], "Registo.", ["v-ns-eens","v-da-s","v-m-n"]),
  ], diff=5, mins=7)

W()
