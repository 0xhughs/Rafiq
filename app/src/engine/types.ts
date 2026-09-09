export type MapId = 'apartment' | 'street' | 'shop' | 'library';

export const MAP_IDS: readonly MapId[] = ['apartment', 'street', 'shop', 'library'];

export type Mode =
  | 'name_entry'
  | 'confirm_name'
  | 'playing'
  | 'dialogue'
  | 'paused'
  | 'inspect'
  | 'calculator'
  | 'notice'
  | 'crate'
  | 'explain';

export type TrashState = 'home' | 'carried' | 'disposed';

export type EncounterState = 'unseen' | 'available' | 'talking' | 'help_accepted';

export type Facing = 'up' | 'down' | 'left' | 'right';

export type Cardinal = 'north' | 'south' | 'east' | 'west';

export type ItemId = 'trash_bag';

export const ITEM_IDS: readonly ItemId[] = ['trash_bag'];

export type NpcGreeting = 'unmet' | 'talking' | 'greeted';

export type SaveStatus = 'absent' | 'ok' | 'unavailable' | 'recovered';

export type EndingState = 'in_progress';

export const EVIDENCE_IDS = ['1.1', '1.2', '1.3', '1.6'] as const;
export type EvidenceId = (typeof EVIDENCE_IDS)[number];
export type EvidenceStatus = 'demonstrated';
export type EvidenceMap = Partial<Record<EvidenceId, EvidenceStatus>>;

export const SHOP_PHASES = [
  'unstarted',
  'lookup',
  'notice',
  'transaction',
  'crate',
  'helped',
] as const;
export type ShopPhase = (typeof SHOP_PHASES)[number];

export type InspectTarget = 'west' | 'east' | 'price';
export type ExplainTopic = 'lookup' | 'notice' | 'price' | 'tools';
export type CalcOp = 'add' | 'mul';
export type CalcToken = number | CalcOp;

export interface CalculatorState {
  entry: string;
  tokens: CalcToken[];
  result: number | null;
}

export interface ShopQuest {
  phase: ShopPhase;
  heardMango: boolean;
  inspectedWest: boolean;
  inspectedEast: boolean;
  inspectedPriceList: boolean;
  inspectedNotice: boolean;
  hasExactTotal: boolean;
  toldSourcedLookup: boolean;
  heardDraft: boolean;
  noticeTotalFixed: boolean;
  noticeDatesFixed: boolean;
  noticeWaterFixed: boolean;
  noticePosted: boolean;
  refusedRobotPrice: boolean;
  inspectedDatesAfterRefuse: boolean;
  correctedPrice: boolean;
  heardSecondClaim: boolean;
  inspectedAfterSecondClaim: boolean;
  rejectedSecondClaim: boolean;
  crateShopkeeper: boolean;
  crateRobotAttempted: boolean;
}

export type JournalEventId =
  | 'pickup'
  | 'disposal'
  | 'help_accepted'
  | 'neighbor_greeting'
  | 'shop_visit'
  | 'library_visit'
  | 'shop_shelf_checked'
  | 'shop_notice_posted'
  | 'shop_price_corrected'
  | 'shop_helped';

export interface JournalEvent {
  id: JournalEventId;
  text: string;
}

export type DialogueNodeId =
  | 'pickup_leaving'
  | 'discover'
  | 'hello'
  | 'introduce'
  | 'broken'
  | 'wrong_fact'
  | 'fact_admission'
  | 'ask_help'
  | 'agree'
  | 'lead'
  | 'companion_revisit'
  | 'companion_after_shop'
  | 'neighbor_hello'
  | 'neighbor_reply'
  | 'neighbor_pointer'
  | 'neighbor_thanks'
  | 'neighbor_revisit'
  | 'shopkeeper_hello'
  | 'shop_robot_mango'
  | 'shop_ask_records'
  | 'shop_lookup_prompt'
  | 'shop_lookup_need_source'
  | 'shop_lookup_trust_fail'
  | 'shop_lookup_ok'
  | 'shop_notice_hint'
  | 'shop_transact_intro'
  | 'shop_robot_dates'
  | 'shop_trust_18_fail'
  | 'shop_need_date_source'
  | 'shop_price_ok'
  | 'shop_second_claim'
  | 'shop_second_prompt'
  | 'shop_second_need_check'
  | 'shop_second_trust_fail'
  | 'shop_second_ok'
  | 'shop_crate_hint'
  | 'shop_crate_robot_fail'
  | 'shop_success_thanks'
  | 'shop_repair_lead'
  | 'shop_robot_unsupported'
  | 'shopkeeper_helped_revisit'
  | 'locked_shop'
  | 'locked_library'
  | 'library_inner_locked';

export type DialogueChoiceId =
  | 'agree'
  | 'postpone'
  | 'npc_thanks'
  | 'npc_postpone'
  | 'tell_no_mango'
  | 'trust_mango'
  | 'refuse_dates'
  | 'trust_dates'
  | 'correct_dates'
  | 'reject_water'
  | 'trust_water'
  | 'verify_later';

export type InteractableId =
  | 'trash'
  | 'door'
  | 'dumpster'
  | 'robot'
  | 'shop_door'
  | 'library_door'
  | 'neighbor'
  | 'shopkeeper'
  | 'library_inner'
  | 'shelf_west'
  | 'shelf_east'
  | 'price_list'
  | 'notice_board'
  | 'calculator'
  | 'crate';

export type PortalId = 'home' | 'shop' | 'library';

export type NpcId = 'robot' | 'neighbor' | 'shopkeeper';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Actionable {
  id: InteractableId;
  label: string;
  x: number;
  y: number;
}

export interface GameState {
  playerName: string;
  nameDraft: string;
  nameError: string | null;
  map: MapId;
  position: Vec2;
  facing: Facing;
  mode: Mode;
  trash: TrashState;
  encounter: EncounterState;
  dialogueNode: DialogueNodeId | null;
  conversationSeen: boolean;
  storyObjective: string;
  checkpointReached: boolean;
  inventory: ItemId[];
  neighbor: NpcGreeting;
  shopkeeper: NpcGreeting;
  journalEvents: JournalEvent[];
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  calculator: CalculatorState;
  inspectTarget: InspectTarget | null;
  explainTopic: ExplainTopic | null;
  robotUnderstood: string | null;
  shopFeedback: string | null;
  endingState: EndingState;
  mapsVisited: MapId[];
  saveStatus: SaveStatus;
  restoreNotice: boolean;
}

export type GameAction =
  | { type: 'NAME_DRAFT'; value: string }
  | { type: 'SUBMIT_NAME' }
  | { type: 'REVISE_NAME' }
  | { type: 'CONFIRM_NAME' }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'INTERACT' }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'CHOOSE'; choice: DialogueChoiceId }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'OPEN_HELP' }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'CONFIRM_NEW_ADVENTURE' }
  | { type: 'DISMISS_RESTORE_NOTICE' }
  | { type: 'DEBUG_TELEPORT'; map?: MapId; x: number; y: number }
  | { type: 'CALCULATOR_KEY'; key: string }
  | { type: 'NOTICE_APPLY'; field: 'total' | 'dates' | 'water' }
  | { type: 'NOTICE_POST'; asDraft: boolean }
  | { type: 'CRATE_DECIDE'; who: 'shopkeeper' | 'robot' }
  | { type: 'SKIP_EXPLAIN' }
  | { type: 'SUBMIT_NL'; text: string };

export interface DialogueChoice {
  id: DialogueChoiceId;
  label: string;
}

export type DialogueSpeaker = 'player' | 'robot' | 'neighbor' | 'shopkeeper' | 'notice';

export interface DialogueLine {
  id: DialogueNodeId;
  speaker: DialogueSpeaker;
  speakerLabel: (playerName: string) => string;
  text: (playerName: string, objective?: string) => string;
  next: DialogueNodeId | null;
  choices?: DialogueChoice[];
}

export interface SerializedTestState {
  playerName: string;
  map: MapId;
  position: Vec2;
  facing: Facing;
  mode: Mode;
  trash: TrashState;
  encounter: EncounterState;
  dialogueNode: DialogueNodeId | null;
  conversationSeen: boolean;
  storyObjective: string;
  checkpointReached: boolean;
  nearby: Actionable | null;
  interactables: Actionable[];
  inventory: ItemId[];
  neighbor: NpcGreeting;
  shopkeeper: NpcGreeting;
  journalEvents: JournalEvent[];
  mapsVisited: MapId[];
  saveStatus: SaveStatus;
  restoreNotice: boolean;
  endingState: EndingState;
  companion: boolean;
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  inspectTarget: InspectTarget | null;
  explainTopic: ExplainTopic | null;
  robotUnderstood: string | null;
  calculatorResult: number | null;
}

export interface SaveEnvelope {
  saveVersion: 1;
  playerName: string;
  map: MapId;
  position: Vec2;
  facing: Facing;
  trash: TrashState;
  encounter: EncounterState;
  conversationSeen: boolean;
  checkpointReached: boolean;
  storyObjective: string;
  inventory: ItemId[];
  neighbor: NpcGreeting;
  shopkeeper: NpcGreeting;
  journalEvents: JournalEvent[];
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  robot: { companion: boolean };
  endingState: EndingState;
  mapsVisited: MapId[];
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
