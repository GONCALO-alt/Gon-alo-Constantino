// IA da DEMO: respostas preparadas, sem chamar nenhuma API.
// Tem exatamente as mesmas funções que ../ai.js, para a app não notar a diferença.

export class AIError extends Error {}
export const aiEnabled = () => true;
export const langName = lang => lang || 'pt';

const wait = ms => new Promise(r => setTimeout(r, ms));

const BANK = [
  { question: 'Onde se realiza a fotossíntese nas células das plantas?', options: ['Nos cloroplastos', 'Nas mitocôndrias', 'No núcleo', 'Nos vacúolos'], answer: 0, topic: 'Fotossíntese', difficulty: 1 },
  { question: 'Que gás as plantas absorvem do ar para fazer a fotossíntese?', options: ['Oxigénio', 'Dióxido de carbono', 'Azoto', 'Hidrogénio'], answer: 1, topic: 'Fotossíntese', difficulty: 1 },
  { question: 'Qual é o pigmento verde que capta a luz solar?', options: ['Hemoglobina', 'Melanina', 'Clorofila', 'Caroteno'], answer: 2, topic: 'Fotossíntese', difficulty: 1 },
  { question: 'Que substância orgânica é produzida na fotossíntese?', options: ['Proteína', 'Glicose', 'Gordura', 'Sal mineral'], answer: 1, topic: 'Fotossíntese', difficulty: 2 },
  { question: 'Por onde entra a água nas plantas?', options: ['Pelas folhas', 'Pelas flores', 'Pelos estomas', 'Pela raiz'], answer: 3, topic: 'Transporte', difficulty: 2 },
  { question: 'Como se chama a seiva que leva água e sais minerais da raiz às folhas?', options: ['Seiva elaborada', 'Seiva bruta', 'Seiva mista', 'Seiva verde'], answer: 1, topic: 'Transporte', difficulty: 2 },
  { question: 'O que são os estomas?', options: ['Pequenas aberturas nas folhas para trocas gasosas', 'Células da raiz', 'Vasos que transportam a seiva', 'Sementes das plantas'], answer: 0, topic: 'Trocas gasosas', difficulty: 3 },
  { question: 'Qual destas condições NÃO é necessária para a fotossíntese?', options: ['Luz', 'Água', 'Dióxido de carbono', 'Escuridão total'], answer: 3, topic: 'Fotossíntese', difficulty: 3 },
];

const EXPLAIN = {
  'Nos cloroplastos': 'A fotossíntese acontece nos cloroplastos, que têm clorofila para captar a luz. As mitocôndrias fazem a respiração, que é outro processo.',
  'Dióxido de carbono': 'As plantas absorvem dióxido de carbono pelos estomas e libertam oxigénio. É ao contrário do que nós fazemos a respirar.',
  'Clorofila': 'A clorofila é o pigmento verde dos cloroplastos que capta a energia da luz. É por isso que as folhas são verdes.',
  'Glicose': 'Na fotossíntese a planta transforma água e dióxido de carbono em glicose, um açúcar que lhe dá energia, e liberta oxigénio.',
  'Pela raiz': 'A água e os sais minerais entram pelos pelos absorventes da raiz e depois sobem pelo caule até às folhas.',
  'Seiva bruta': 'A seiva bruta é água com sais minerais e sobe da raiz para as folhas. Depois da fotossíntese forma-se a seiva elaborada.',
  'Pequenas aberturas nas folhas para trocas gasosas': 'Os estomas são pequenos "poros" nas folhas que abrem e fecham para deixar entrar CO₂ e sair oxigénio e vapor de água.',
  'Escuridão total': 'Sem luz não há fotossíntese, porque a luz é a fonte de energia. Água, CO₂ e luz são todos necessários.',
};

export async function generateQuestions({ count = 8 }) {
  await wait(1800);
  return { subject: 'Ciências Naturais — Fotossíntese', questions: BANK.slice(0, count).map(q => ({ ...q })) };
}

export async function explainMistake({ options, answer, chosen }) {
  await wait(900);
  const right = options[answer];
  const base = EXPLAIN[right] ?? `A resposta certa é "${right}". Volta a ler esta parte da matéria com calma.`;
  return { explanation: chosen == null ? `O tempo acabou! ${base}` : `Escolheste "${options[chosen]}", mas a certa é "${right}". ${base}` };
}

export async function summarizeNotes(notes) {
  await wait(1600);
  return {
    title: 'Fotossíntese e nutrição das plantas',
    sections: [
      { heading: 'O que é', points: ['Processo em que as plantas produzem o seu alimento (glicose).', 'Acontece nos cloroplastos, graças à clorofila.'] },
      { heading: 'O que é preciso', points: ['Luz solar (energia).', 'Água, que entra pela raiz.', 'Dióxido de carbono, que entra pelos estomas.'] },
      { heading: 'O que se produz', points: ['Glicose, usada como energia e para crescer.', 'Oxigénio, libertado para o ar.'] },
      { heading: 'Transporte', points: ['Seiva bruta: água + sais minerais, da raiz para as folhas.', 'Seiva elaborada: leva os açúcares das folhas ao resto da planta.'] },
    ],
    mustKnow: [
      'Água + dióxido de carbono + luz → glicose + oxigénio',
      'Clorofila = pigmento verde que capta a luz',
      'Estomas = aberturas nas folhas para trocas gasosas',
      `Juntámos ${notes.length} apontamento(s) da turma.`,
    ],
  };
}

export async function predictGrade({ perf, test }) {
  await wait(1500);
  const estimate = Math.round(Math.min(95, Math.max(35, (perf.accuracy ?? 50) * 0.85 + Math.min(10, perf.minutes / 10))));
  const topics = Object.entries(perf.byTopic).sort((a, b) => b[1].right / b[1].total - a[1].right / a[1].total);
  return {
    estimate,
    confidence: perf.answered >= 20 ? 'medium' : 'low',
    message: estimate >= 70 ? 'Estás no bom caminho, continua a treinar!' : 'Com mais umas sessões chegas lá, não desistas!',
    strengths: topics.slice(0, 2).map(([t, v]) => `${t} (${v.right}/${v.total} certas)`),
    toImprove: topics.slice(-2).reverse().filter(([, v]) => v.right < v.total).map(([t]) => t).concat(perf.wrong.length ? [`Rever: "${perf.wrong[0].question}"`] : []),
    plan: [
      `Hoje: 25 min de foco${test ? ` para ${test.subject}` : ''} e um duelo com a sala.`,
      'Amanhã: refaz as perguntas que erraste e lê o resumo da IA.',
      test && test.daysLeft <= 1 ? 'Véspera: revisão leve e dormir bem!' : 'Antes do teste: um duelo de eliminação para testar tudo.',
    ],
  };
}

// Tutor da demo: respostas preparadas conforme as palavras da pergunta, escritas aos bocados.
const TUTOR = [
  [/fotoss[ií]ntese|planta|clorofila|photosynth/i, 'A **fotossíntese** é a forma como as plantas fazem o seu próprio alimento. 🌱\n\n1. As folhas captam **luz** com a clorofila (o pigmento verde).\n2. A raiz absorve **água** e as folhas recebem **dióxido de carbono** pelos estomas.\n3. Com isso, a planta produz **glicose** (energia) e liberta **oxigénio**.\n\nTruque para decorar: *"Luz + água + CO₂ → açúcar + O₂"*.\n\nQueres que te faça 3 perguntas rápidas para testares?'],
  [/fra[cç][aãõo]|fraction|matem[aá]tica|math|\d+\/\d+/i, 'Vamos às **frações**! 🍕\n\nPara somar 1/2 + 1/4, os denominadores (números de baixo) têm de ser iguais:\n- 1/2 = 2/4\n- 2/4 + 1/4 = **3/4**\n\nAgora tenta tu: quanto é 1/3 + 1/6? Diz-me a tua resposta e eu digo-te se está certa. 😉'],
  [/equa[cç]|x\s*=|equation/i, 'Para resolver uma **equação**, o objetivo é deixar o **x sozinho** de um dos lados.\n\nExemplo: 2x + 3 = 11\n1. Tira 3 dos dois lados: 2x = 8\n2. Divide os dois lados por 2: **x = 4**\n\nConfirma sempre: 2 × 4 + 3 = 11 ✅. Queres tentar uma parecida?'],
  [/plano|organiz|prepar|\bplan\b|exame|exam/i, 'Boa ideia preparares-te com tempo! 💪 Um plano simples:\n\n- **Hoje:** lê a matéria e faz um resumo curto (25 min).\n- **Amanhã:** faz exercícios das partes mais difíceis.\n- **Véspera:** um duelo com os amigos e revisão leve. Dorme bem!\n\nVê também o separador **O meu plano**, que já tem os teus blocos da semana.'],
  [/quiz|pergunta|testa-me|quiz me/i, 'Bora! 🎯 Responde a esta:\n\n**Qual é o planeta mais perto do Sol?**\nA) Vénus  B) Mercúrio  C) Marte\n\nEscreve a letra e eu digo-te se acertaste.'],
  [/^\s*b\s*$|merc[uú]rio/i, '✅ **Certo!** Mercúrio é o planeta mais perto do Sol, e também o mais pequeno do sistema solar. Queres outra?'],
];
export async function tutorStream({ messages, onText }) {
  const q = messages.at(-1)?.content ?? '';
  const hit = TUTOR.find(([re]) => re.test(q));
  const text = hit ? hit[1] : 'Boa pergunta! 🤔 Nesta demo só sei responder a alguns temas de exemplo: **fotossíntese**, **frações**, **equações**, **planos de estudo** ou um **quiz**. Experimenta perguntar sobre um deles!\n\nNa app a sério, o tutor usa IA e ajuda-te com qualquer disciplina.';
  await wait(500);
  for (const w of text.split(/(?<=\s)/)) { onText?.(w); await wait(18); }
  return text;
}
