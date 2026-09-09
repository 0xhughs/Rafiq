import { OBJECTIVES, recordEvent } from './dialogue';
import { grantItem } from './inventory';
import type {
  ConstraintPick,
  DialogueChoiceId,
  DialogueNodeId,
  EvidenceMap,
  GameState,
  InstructionDraft,
  LocationPick,
  ParcelOutcome,
  ParcelPick,
  ParcelQuest,
  ParcelUnderstood,
  ReturnPick,
} from './types';
import { PARCEL_PHASES } from './types';

export const PARCEL_LABEL: Record<Exclude<ParcelPick, null>, string> = {
  r17: 'ر-١٧',
  r19: 'ر-١٩',
  r71: 'ر-٧١',
  gray: 'الطرد الرمادي',
};

export const LOCATION_LABEL: Record<Exclude<LocationPick, null>, string> = {
  west: 'الرف الغربي',
  east: 'الرف الشرقي',
  any: 'أي مكان',
};

export const CONSTRAINT_LABEL: Record<Exclude<ConstraintPick, null>, string> = {
  repair_no_pay: 'لا تدفع؛ خذ حجز الإصلاح فقط',
  grab_all_pay: 'خذ كل الطرود الرمادية وادفع ثمنها',
  none: 'بلا قيد',
};

export const RETURN_LABEL: Record<Exclude<ReturnPick, null>, string> = {
  tag_to_desk: 'أعد الطرد مع رقم الحجز إلى المنضدة',
  none: 'بلا صيغة',
};

export const DECOY_PRICE = 12;

export const OVERBROAD_LINE = 'سآخذ كل الطرود الرمادية وأدفع ثمنها';

export const AMBIGUOUS_LINE = 'هات الطرد الرمادي';

export const PARCEL_EXPLAIN = {
  delegate:
    'تفويض الإحضار شيء، والدفع شيء آخر. الروبوت يجلب ما تحدّده، وأنت من يوافق على الشراء إن وُجد شراء.',
  instruction:
    'الأمر الواضح يسمّي الطرد، ومكانه، وما لا يُفعل، وكيف يُعاد الناتج. النقص يُترك للتخمين.',
  revise:
    'الأمر الغامض يفشل أمام صندوقين متشابهين. صحّح الناقص فقط، ثم أرسل أمراً جديداً. المحاولة الفاشلة لا تُقلَب نجاحاً.',
} as const;

export const PARCEL_FEEDBACK = {
  incomplete: 'الأمر ناقص. حدّد الطرد والمكان والقيد وشكل الإعادة.',
  ambiguous: 'لا أميّز أي طرد رمادي: ر-١٧ على الرف الغربي أم ر-٧١ على الرف الشرقي؟ أحضرت المعروض للبيع بالخطأ.',
  decoy: 'هذا ر-٧١، طرد رمادي للبيع باثني عشر. ليس حجز الإصلاح.',
  stale: 'حجز ر-١٧ لم يعد على الرف. المقصود الآن ر-١٩.',
  overbroadSend: 'لا آخذ كل الرمادي ولا أدفع. الحجوزات ليست للبيع، والدفع ليس لي.',
  robotPay: 'الروبوت لا يدفع. نافذة الدفع لك أنت، وحجز الإصلاح ليس للبيع.',
  playerDecoy: 'دفعت اثني عشر لطرد ر-٧١. هذا شراء، لا دليل على أنك أحضرت حجز الإصلاح.',
  notForSale: 'حجز الإصلاح ليس للبيع.',
  clarify: 'لم أفهم هذه الصياغة. استخدم الأزرار، أو سمِّ الرقم والمكان والقيد وشكل الإعادة.',
  missingFlip: 'المحاولة الفاشلة بقيت فاشلة. أرسل تعليماً جديداً بعد تصحيح الناقص.',
} as const;

const PHASES = new Set<string>(PARCEL_PHASES);

export function emptyInstruction(): InstructionDraft {
  return { parcel: null, location: null, constraints: null, returnFormat: null };
}

export function createParcelQuest(): ParcelQuest {
  return {
    phase: 'unstarted',
    briefed: false,
    inspectedWest: false,
    inspectedEast: false,
    inspectedBoard: false,
    delegated: false,
    overbroadOffered: false,
    overbroadStopped: false,
    overbroadAllowed: false,
    failedAttempt: false,
    failedParcelId: null,
    intendedParcelId: 'r17',
    retrievedParcelId: null,
    retrievedWithCompleteSpec: false,
    r19Staged: false,
    sendCount: 0,
    failedSendId: null,
    successSendId: null,
    lastOutcome: 'none',
    instruction: emptyInstruction(),
    understood: null,
    playerPaidDecoy: false,
    robotPayAttempted: false,
    commsRepaired: false,
  };
}

function onFlag(raw: Record<string, unknown>, key: string): boolean {
  return raw[key] === true;
}

function parsePick<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

export function parseParcelQuest(value: unknown): ParcelQuest {
  const fallback = createParcelQuest();
  if (typeof value !== 'object' || value === null) return fallback;
  const raw = value as Record<string, unknown>;
  const phase =
    typeof raw.phase === 'string' && PHASES.has(raw.phase)
      ? (raw.phase as ParcelQuest['phase'])
      : fallback.phase;
  const failedParcelId = parsePick(raw.failedParcelId, ['r17', 'r19', 'r71'] as const);
  const intended =
    raw.intendedParcelId === 'r19' || raw.r19Staged === true ? 'r19' : 'r17';
  const retrievedParcelId = parsePick(raw.retrievedParcelId, ['r17', 'r19', 'r71'] as const);
  const instructionRaw =
    typeof raw.instruction === 'object' && raw.instruction !== null
      ? (raw.instruction as Record<string, unknown>)
      : {};
  const sendCount = typeof raw.sendCount === 'number' && Number.isFinite(raw.sendCount) ? raw.sendCount : 0;
  const failedSendId =
    typeof raw.failedSendId === 'number' && Number.isFinite(raw.failedSendId) ? raw.failedSendId : null;
  const successSendId =
    typeof raw.successSendId === 'number' && Number.isFinite(raw.successSendId) ? raw.successSendId : null;
  const lastOutcome = parsePick(raw.lastOutcome, [
    'none',
    'incomplete',
    'overbroad_allowed',
    'ambiguous_fail',
    'decoy',
    'stale_r17',
    'robot_pay_blocked',
    'retrieved',
  ] as const);
  return {
    phase,
    briefed: onFlag(raw, 'briefed'),
    inspectedWest: onFlag(raw, 'inspectedWest'),
    inspectedEast: onFlag(raw, 'inspectedEast'),
    inspectedBoard: onFlag(raw, 'inspectedBoard'),
    delegated: onFlag(raw, 'delegated'),
    overbroadOffered: onFlag(raw, 'overbroadOffered'),
    overbroadStopped: onFlag(raw, 'overbroadStopped'),
    overbroadAllowed: onFlag(raw, 'overbroadAllowed'),
    failedAttempt: onFlag(raw, 'failedAttempt'),
    failedParcelId,
    intendedParcelId: intended,
    retrievedParcelId,
    retrievedWithCompleteSpec: onFlag(raw, 'retrievedWithCompleteSpec'),
    r19Staged: onFlag(raw, 'r19Staged') || intended === 'r19',
    sendCount,
    failedSendId,
    successSendId,
    lastOutcome: lastOutcome ?? 'none',
    instruction: {
      parcel: parsePick(instructionRaw.parcel, ['r17', 'r19', 'r71', 'gray'] as const),
      location: parsePick(instructionRaw.location, ['west', 'east', 'any'] as const),
      constraints: parsePick(instructionRaw.constraints, [
        'repair_no_pay',
        'grab_all_pay',
        'none',
      ] as const),
      returnFormat: parsePick(instructionRaw.returnFormat, ['tag_to_desk', 'none'] as const),
    },
    understood: parseUnderstood(raw.understood),
    playerPaidDecoy: onFlag(raw, 'playerPaidDecoy'),
    robotPayAttempted: onFlag(raw, 'robotPayAttempted'),
    commsRepaired: onFlag(raw, 'commsRepaired'),
  };
}

function parseUnderstood(value: unknown): ParcelUnderstood | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.parcel !== 'string' ||
    typeof raw.location !== 'string' ||
    typeof raw.constraints !== 'string' ||
    typeof raw.returnFormat !== 'string'
  ) {
    return null;
  }
  return {
    parcel: raw.parcel,
    location: raw.location,
    constraints: raw.constraints,
    returnFormat: raw.returnFormat,
  };
}

export function westHoldId(quest: ParcelQuest): 'r17' | 'r19' {
  return quest.r19Staged || quest.intendedParcelId === 'r19' ? 'r19' : 'r17';
}

export function understoodFromDraft(draft: InstructionDraft): ParcelUnderstood {
  return {
    parcel: draft.parcel ? PARCEL_LABEL[draft.parcel] : 'غير محدد',
    location: draft.location ? LOCATION_LABEL[draft.location] : 'غير محدد',
    constraints: draft.constraints ? CONSTRAINT_LABEL[draft.constraints] : 'غير محدد',
    returnFormat: draft.returnFormat ? RETURN_LABEL[draft.returnFormat] : 'غير محدد',
  };
}

export function formatUnderstood(understood: ParcelUnderstood): string {
  return [
    `الطرد: ${understood.parcel}`,
    `المكان: ${understood.location}`,
    `القيد: ${understood.constraints}`,
    `شكل الإعادة: ${understood.returnFormat}`,
  ].join('\n');
}

export function specCompleteFor(
  draft: InstructionDraft,
  intended: 'r17' | 'r19',
): boolean {
  return (
    draft.parcel === intended &&
    draft.location === 'west' &&
    draft.constraints === 'repair_no_pay' &&
    draft.returnFormat === 'tag_to_desk'
  );
}

export function specIncomplete(draft: InstructionDraft): boolean {
  return (
    draft.parcel === null ||
    draft.location === null ||
    draft.constraints === null ||
    draft.returnFormat === null
  );
}

export function syncParcelPhase(quest: ParcelQuest): ParcelQuest {
  let phase: ParcelQuest['phase'] = 'unstarted';
  if (quest.retrievedParcelId === 'r19' && quest.retrievedWithCompleteSpec && quest.failedAttempt) {
    phase = 'retrieved';
  } else if (quest.retrievedParcelId && quest.retrievedWithCompleteSpec) {
    phase = 'retrieved';
  } else if (quest.failedAttempt) {
    phase = 'failed';
  } else if (quest.overbroadStopped) {
    phase = 'instructing';
  } else if (quest.overbroadOffered || quest.overbroadAllowed) {
    phase = 'overbroad';
  } else if (quest.delegated) {
    phase = 'delegated';
  } else if (quest.briefed) {
    phase = 'briefed';
  }
  return { ...quest, phase };
}

export function parcelObjective(state: GameState): string {
  const quest = state.parcelQuest;
  if (quest.commsRepaired && quest.retrievedParcelId) return OBJECTIVES.parcelDone;
  if (quest.failedAttempt && quest.r19Staged) return OBJECTIVES.reviseParcel;
  if (quest.overbroadStopped) return OBJECTIVES.writeInstruction;
  if (quest.delegated) return OBJECTIVES.stopOverbroad;
  if (quest.briefed) return OBJECTIVES.delegateParcel;
  if (state.shopQuest.phase === 'helped') return OBJECTIVES.repairLead;
  return state.storyObjective;
}

export function awardParcelEvidence(state: GameState): GameState {
  const quest = syncParcelPhase(state.parcelQuest);
  const evidence: EvidenceMap = { ...state.evidence };
  if (quest.delegated && quest.overbroadStopped) {
    evidence['2.1'] = 'demonstrated';
  }
  if (quest.retrievedWithCompleteSpec && quest.understood && understoodHasFour(quest.understood)) {
    const retrievedIntended =
      quest.retrievedParcelId === 'r17' || quest.retrievedParcelId === 'r19';
    if (retrievedIntended) evidence['2.2'] = 'demonstrated';
  }
  if (
    quest.failedAttempt &&
    quest.retrievedParcelId === 'r19' &&
    quest.retrievedWithCompleteSpec &&
    quest.successSendId !== null &&
    quest.failedSendId !== null &&
    quest.successSendId !== quest.failedSendId
  ) {
    evidence['2.4'] = 'demonstrated';
  }
  let events = state.journalEvents;
  if (quest.overbroadStopped) events = recordEvent(events, 'parcel_overbroad_stopped');
  if (quest.failedAttempt) events = recordEvent(events, 'parcel_instruction_failed');
  if (quest.retrievedParcelId && quest.retrievedWithCompleteSpec) {
    events = recordEvent(events, 'parcel_retrieved');
  }
  return {
    ...state,
    evidence,
    parcelQuest: quest,
    journalEvents: events,
    storyObjective: parcelObjective({ ...state, parcelQuest: quest, evidence, journalEvents: events }),
  };
}

export function understoodHasFour(understood: ParcelUnderstood): boolean {
  return (
    understood.parcel !== 'غير محدد' &&
    understood.location !== 'غير محدد' &&
    understood.constraints !== 'غير محدد' &&
    understood.returnFormat !== 'غير محدد'
  );
}

export function clerkNode(state: GameState): DialogueNodeId {
  const quest = state.parcelQuest;
  if (quest.commsRepaired && quest.retrievedWithCompleteSpec) return 'clerk_after_success';
  if (quest.briefed) return 'clerk_revisit';
  return 'clerk_hello';
}

export function parcelRobotNode(state: GameState): DialogueNodeId {
  const quest = state.parcelQuest;
  if (quest.commsRepaired) return 'companion_after_parcel';
  if (!quest.briefed) return 'companion_after_shop';
  if (!quest.delegated) return 'parcel_delegate_prompt';
  if (!quest.overbroadStopped) return 'parcel_overbroad';
  return 'companion_after_shop';
}

function talk(state: GameState, node: DialogueNodeId, quest = state.parcelQuest): GameState {
  const next = { ...state, parcelQuest: quest };
  return {
    ...next,
    mode: 'dialogue',
    dialogueNode: node,
    shopFeedback: null,
    storyObjective: parcelObjective(next),
  };
}

export function finishClerkBrief(state: GameState): GameState {
  const quest = syncParcelPhase({ ...state.parcelQuest, briefed: true });
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    clerk: 'greeted',
    parcelQuest: quest,
    storyObjective: parcelObjective({ ...state, parcelQuest: quest, clerk: 'greeted' }),
  };
}

export function reduceParcelChoice(state: GameState, choice: DialogueChoiceId): GameState | null {
  if (choice === 'delegate_retrieve') {
    const quest = syncParcelPhase({
      ...state.parcelQuest,
      delegated: true,
      overbroadOffered: true,
    });
    return talk({ ...state, robotUnderstood: null }, 'parcel_overbroad', quest);
  }
  if (choice === 'stop_overbroad') {
    if (!state.parcelQuest.delegated) return state;
    const quest = syncParcelPhase({
      ...state.parcelQuest,
      overbroadOffered: true,
      overbroadStopped: true,
    });
    const next = awardParcelEvidence({
      ...state,
      parcelQuest: quest,
      robotUnderstood: null,
    });
    return { ...next, mode: 'dialogue', dialogueNode: 'parcel_overbroad_stopped' };
  }
  if (choice === 'allow_overbroad') {
    const quest = syncParcelPhase({
      ...state.parcelQuest,
      overbroadOffered: true,
      overbroadAllowed: true,
      robotPayAttempted: true,
      lastOutcome: 'overbroad_allowed',
    });
    return talk(
      { ...state, shopFeedback: PARCEL_FEEDBACK.overbroadSend, robotUnderstood: null },
      'parcel_overbroad_allowed',
      quest,
    );
  }
  return null;
}

export function reduceInstructionSet(
  state: GameState,
  field: 'parcel' | 'location' | 'constraints' | 'returnFormat',
  value: string,
): GameState {
  const instruction = { ...state.parcelQuest.instruction };
  if (field === 'parcel') {
    instruction.parcel = parsePick(value, ['r17', 'r19', 'r71', 'gray'] as const);
  } else if (field === 'location') {
    instruction.location = parsePick(value, ['west', 'east', 'any'] as const);
  } else if (field === 'constraints') {
    instruction.constraints = parsePick(value, ['repair_no_pay', 'grab_all_pay', 'none'] as const);
  } else {
    instruction.returnFormat = parsePick(value, ['tag_to_desk', 'none'] as const);
  }
  const understood = understoodFromDraft(instruction);
  return {
    ...state,
    parcelQuest: { ...state.parcelQuest, instruction, understood },
    robotUnderstood: formatUnderstood(understood),
    shopFeedback: null,
  };
}

function stageR19(quest: ParcelQuest): ParcelQuest {
  return {
    ...quest,
    r19Staged: true,
    intendedParcelId: 'r19',
  };
}

function applyRetrieve(state: GameState, parcelId: 'r17' | 'r19', sendId: number): GameState {
  let quest: ParcelQuest = {
    ...state.parcelQuest,
    retrievedParcelId: parcelId,
    retrievedWithCompleteSpec: true,
    successSendId: sendId,
    lastOutcome: 'retrieved',
    commsRepaired: true,
  };
  if (parcelId === 'r17') {
    quest = stageR19(quest);
  }
  quest = syncParcelPhase(quest);
  const inventory = grantItem(state.inventory, 'repair_parcel');
  const next = awardParcelEvidence({
    ...state,
    inventory,
    parcelQuest: quest,
    robotUnderstood: formatUnderstood(quest.understood ?? understoodFromDraft(quest.instruction)),
  });
  return {
    ...next,
    mode: 'dialogue',
    dialogueNode: 'parcel_retrieved_ok',
  };
}

export function reduceInstructionSend(state: GameState): GameState {
  const draft = state.parcelQuest.instruction;
  const understood = understoodFromDraft(draft);
  const sendId = state.parcelQuest.sendCount + 1;
  let quest: ParcelQuest = {
    ...state.parcelQuest,
    sendCount: sendId,
    understood,
  };
  const shown = formatUnderstood(understood);

  if (draft.constraints === 'grab_all_pay') {
    quest = syncParcelPhase({
      ...quest,
      lastOutcome: 'overbroad_allowed',
      robotPayAttempted: true,
    });
    return {
      ...state,
      mode: 'instruction',
      parcelQuest: quest,
      robotUnderstood: shown,
      shopFeedback: PARCEL_FEEDBACK.overbroadSend,
    };
  }

  if (draft.parcel === 'gray') {
    quest = syncParcelPhase(
      stageR19({
        ...quest,
        failedAttempt: true,
        failedParcelId: 'r71',
        failedSendId: sendId,
        lastOutcome: 'ambiguous_fail',
      }),
    );
    const next = awardParcelEvidence({
      ...state,
      parcelQuest: quest,
      robotUnderstood: shown,
      shopFeedback: PARCEL_FEEDBACK.ambiguous,
      mode: 'instruction',
    });
    return { ...next, mode: 'instruction', dialogueNode: null };
  }

  if (specIncomplete(draft)) {
    quest = { ...quest, lastOutcome: 'incomplete' };
    return {
      ...state,
      mode: 'instruction',
      parcelQuest: quest,
      robotUnderstood: shown,
      shopFeedback: PARCEL_FEEDBACK.incomplete,
    };
  }

  if (draft.parcel === 'r71') {
    quest = syncParcelPhase({
      ...quest,
      lastOutcome: 'decoy',
      failedAttempt: true,
      failedParcelId: 'r71',
      failedSendId: quest.failedSendId ?? sendId,
    });
    if (draft.constraints !== 'repair_no_pay') {
      quest = { ...quest, robotPayAttempted: true };
    }
    const next = awardParcelEvidence({
      ...state,
      parcelQuest: stageR19(quest),
      robotUnderstood: shown,
      shopFeedback: PARCEL_FEEDBACK.decoy,
    });
    return { ...next, mode: 'instruction', dialogueNode: null };
  }

  if (draft.parcel === 'r17' && westHoldId(quest) === 'r19') {
    quest = { ...quest, lastOutcome: 'stale_r17' };
    return {
      ...state,
      mode: 'instruction',
      parcelQuest: quest,
      robotUnderstood: shown,
      shopFeedback: PARCEL_FEEDBACK.stale,
    };
  }

  const intended = westHoldId(quest);
  if (specCompleteFor(draft, intended) && understoodHasFour(understood)) {
    if (quest.failedSendId === sendId) {
      return {
        ...state,
        mode: 'instruction',
        parcelQuest: { ...quest, lastOutcome: 'incomplete' },
        shopFeedback: PARCEL_FEEDBACK.missingFlip,
        robotUnderstood: shown,
      };
    }
    return applyRetrieve(
      { ...state, parcelQuest: quest, robotUnderstood: shown },
      intended,
      sendId,
    );
  }

  quest = { ...quest, lastOutcome: 'incomplete' };
  return {
    ...state,
    mode: 'instruction',
    parcelQuest: quest,
    robotUnderstood: shown,
    shopFeedback: PARCEL_FEEDBACK.incomplete,
  };
}

export function matchParcelNl(text: string): InstructionDraft | 'overbroad' | 'unsupported' {
  const t = text.trim();
  if (!t) return 'unsupported';
  if (/كل الطرود الرمادية/.test(t) && /أدفع|ادفع|أدفعها|ثمن/.test(t)) {
    return 'overbroad';
  }
  if (/هات الطرد الرمادي/.test(t) && !/ر-١٧|ر-19|ر-١٩|ر-71|ر-٧١|ر-17/.test(t)) {
    return { parcel: 'gray', location: 'any', constraints: 'none', returnFormat: 'none' };
  }
  const draft = emptyInstruction();
  if (/ر-١٩|ر-19/.test(t)) draft.parcel = 'r19';
  else if (/ر-١٧|ر-17/.test(t)) draft.parcel = 'r17';
  else if (/ر-٧١|ر-71/.test(t)) draft.parcel = 'r71';
  else if (/الطرد الرمادي/.test(t)) draft.parcel = 'gray';
  if (/غرب/.test(t)) draft.location = 'west';
  else if (/شرق/.test(t)) draft.location = 'east';
  if (/لا تدفع|لا تشتر|بدون دفع|لا تدفعوا/.test(t) && /إصلاح|الحجز فقط|حجز/.test(t)) {
    draft.constraints = 'repair_no_pay';
  } else if (/لا تدفع|لا تشتر|بدون دفع/.test(t)) {
    draft.constraints = 'repair_no_pay';
  }
  if (/رقم الحجز|إلى المنضدة|أعد الطرد|شكل/.test(t)) {
    draft.returnFormat = 'tag_to_desk';
  }
  if (draft.parcel || draft.location || draft.constraints || draft.returnFormat) {
    return draft;
  }
  return 'unsupported';
}

export function reduceParcelNl(state: GameState, text: string): GameState {
  const matched = matchParcelNl(text);
  if (matched === 'unsupported') {
    return { ...state, shopFeedback: PARCEL_FEEDBACK.clarify, robotUnderstood: null };
  }
  if (matched === 'overbroad') {
    if (state.mode === 'dialogue' && state.dialogueNode === 'parcel_overbroad') {
      return reduceParcelChoice(state, 'allow_overbroad') ?? state;
    }
    const withDraft = reduceInstructionSet(
      { ...state, mode: 'instruction' },
      'constraints',
      'grab_all_pay',
    );
    return reduceInstructionSend(
      reduceInstructionSet(
        reduceInstructionSet(reduceInstructionSet(withDraft, 'parcel', 'gray'), 'location', 'any'),
        'returnFormat',
        'none',
      ),
    );
  }
  let next: GameState = { ...state, mode: 'instruction', shopFeedback: null };
  const fields: Array<['parcel' | 'location' | 'constraints' | 'returnFormat', string | null]> = [
    ['parcel', matched.parcel],
    ['location', matched.location],
    ['constraints', matched.constraints],
    ['returnFormat', matched.returnFormat],
  ];
  for (const [field, value] of fields) {
    if (value) next = reduceInstructionSet(next, field, value);
  }
  return reduceInstructionSend(next);
}

export function reducePayDecide(state: GameState, who: 'player' | 'robot'): GameState {
  if (who === 'robot') {
    const quest = {
      ...state.parcelQuest,
      robotPayAttempted: true,
      lastOutcome: 'robot_pay_blocked' as ParcelOutcome,
    };
    return {
      ...state,
      mode: 'pay',
      parcelQuest: quest,
      shopFeedback: PARCEL_FEEDBACK.robotPay,
    };
  }
  return {
    ...state,
    mode: 'pay',
    parcelQuest: { ...state.parcelQuest, playerPaidDecoy: true },
    shopFeedback: PARCEL_FEEDBACK.playerDecoy,
  };
}

export function inspectParcel(
  state: GameState,
  target: 'hold_west' | 'hold_east' | 'hold_board',
): GameState {
  const quest = { ...state.parcelQuest };
  if (target === 'hold_west') quest.inspectedWest = true;
  if (target === 'hold_east') quest.inspectedEast = true;
  if (target === 'hold_board') quest.inspectedBoard = true;
  return {
    ...state,
    mode: 'inspect',
    inspectTarget: target,
    parcelQuest: quest,
    shopFeedback: null,
  };
}

export function closeParcelDialogue(state: GameState): GameState | null {
  const node = state.dialogueNode;
  if (!node) return null;
  if (node === 'clerk_brief') return finishClerkBrief(state);
  if (node === 'clerk_hello') {
    return { ...state, mode: 'playing', dialogueNode: null, clerk: 'greeted' };
  }
  if (
    node.startsWith('clerk') ||
    node.startsWith('parcel_') ||
    node === 'companion_after_parcel' ||
    node === 'locked_parcel'
  ) {
    let next = state;
    if (node === 'parcel_overbroad_stopped') {
      next = {
        ...state,
        mode: 'explain',
        explainTopic: 'delegate',
        dialogueNode: null,
        clerk: state.clerk === 'greeted' ? 'greeted' : state.clerk,
      };
      return next;
    }
    if (node === 'parcel_retrieved_ok') {
      const topic = state.evidence['2.4'] === 'demonstrated' ? 'revise' : 'instruction';
      return {
        ...state,
        mode: 'explain',
        explainTopic: topic,
        dialogueNode: null,
      };
    }
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      clerk: node.startsWith('clerk') ? 'greeted' : state.clerk,
    };
  }
  return null;
}

export function isParcelOverlay(mode: GameState['mode']): boolean {
  return mode === 'instruction' || mode === 'pay';
}

export function skipParcelExplain(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    explainTopic: null,
    dialogueNode: null,
    storyObjective: parcelObjective(state),
  };
}
