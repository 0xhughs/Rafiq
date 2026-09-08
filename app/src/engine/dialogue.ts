import type { DialogueLine, DialogueNodeId } from './types';

export const OBJECTIVES = {
  takeTrash: 'أخرج كيس القمامة إلى الحاوية في الشارع.',
  carryOut: 'احمل الكيس عبر الباب وألقه في الحاوية.',
  inspectRobot: 'اقترب من الروبوت المعطوب وتحدّث إليه.',
  talkRobot: 'أكمل الحديث مع الروبوت بجانب الحاوية.',
  cornerStore: 'لنبدأ بالمتجر عند الزاوية — سيُفتح في بقية المغامرة.',
} as const;

export const SPEAKER = {
  player: (name: string) => name,
  robot: () => 'الروبوت',
};

export const DIALOGUE: Record<DialogueNodeId, DialogueLine> = {
  pickup_leaving: {
    id: 'pickup_leaving',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'سأخرج كيس القمامة، ثم أعود.',
    next: null,
  },
  discover: {
    id: 'discover',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'ما هذا؟ روبوت؟',
    next: 'hello',
  },
  hello: {
    id: 'hello',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'مرحباً… من أنت؟',
    next: 'introduce',
  },
  introduce: {
    id: 'introduce',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: (name) => `اسمي ${name}. هل تحتاج إلى مساعدة؟`,
    next: 'broken',
  },
  broken: {
    id: 'broken',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'أستطيع الكلام، لكن بعض أجزائي لا تعمل. هل تساعدني في العثور عليها؟',
    next: 'wrong_fact',
  },
  wrong_fact: {
    id: 'wrong_fact',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'الجدران في شقتك زرقاء، وعلى الطاولة كتاب ضخم… هذا ما أتخيّله.',
    next: 'fact_admission',
  },
  fact_admission: {
    id: 'fact_admission',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () =>
      'انتظر. لم أدخل الشقة، ولم أرَ الطاولة. الكلام بطلاقة لا يعني أنني أعرف ما لم أره.',
    next: 'ask_help',
  },
  ask_help: {
    id: 'ask_help',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'إذن… هل تساعدني؟',
    next: null,
    choices: [
      { id: 'agree', label: 'سأساعدك. من أين نبدأ؟' },
      { id: 'postpone', label: 'انتظر قليلاً. سأعود.' },
    ],
  },
  agree: {
    id: 'agree',
    speaker: 'player',
    speakerLabel: (name) => name,
    text: () => 'سأساعدك. من أين نبدأ؟',
    next: 'lead',
  },
  lead: {
    id: 'lead',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'لنبدأ بالمتجر عند الزاوية. ربما يعرف صاحبه أين نجد قطعة مناسبة.',
    next: null,
  },
  companion_revisit: {
    id: 'companion_revisit',
    speaker: 'robot',
    speakerLabel: () => SPEAKER.robot(),
    text: () => 'المتجر عند الزاوية ينتظرنا عندما يُفتح.',
    next: null,
  },
};

export function currentLine(node: DialogueNodeId | null): DialogueLine | null {
  if (!node) return null;
  return DIALOGUE[node];
}
