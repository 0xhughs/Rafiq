export type MapId =
  | 'apartment'
  | 'street'
  | 'shop'
  | 'library'
  | 'parcel'
  | 'archive'
  | 'newsroom'
  | 'festival'
  | 'workshop';

export const MAP_IDS: readonly MapId[] = [
  'apartment',
  'street',
  'shop',
  'library',
  'parcel',
  'archive',
  'newsroom',
  'festival',
  'workshop',
];

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
  | 'explain'
  | 'instruction'
  | 'pay'
  | 'context'
  | 'redact'
  | 'pack'
  | 'compare'
  | 'draft'
  | 'voice'
  | 'letter'
  | 'reconcile'
  | 'submit'
  | 'brief'
  | 'board';

export type TrashState = 'home' | 'carried' | 'disposed';

export type EncounterState = 'unseen' | 'available' | 'talking' | 'help_accepted';

export type Facing = 'up' | 'down' | 'left' | 'right';

export type Cardinal = 'north' | 'south' | 'east' | 'west';

export type ItemId = 'trash_bag' | 'repair_parcel';

export const ITEM_IDS: readonly ItemId[] = ['trash_bag', 'repair_parcel'];

export type NpcGreeting = 'unmet' | 'talking' | 'greeted';

export type SaveStatus = 'absent' | 'ok' | 'unavailable' | 'recovered';

export type EndingState = 'in_progress';

export const EVIDENCE_IDS = [
  '1.1',
  '1.2',
  '1.3',
  '1.4',
  '1.5',
  '1.6',
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '2.5',
  '2.6',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '3.5',
  '4.1',
  '4.2',
] as const;
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

export type InspectTarget =
  | 'west'
  | 'east'
  | 'price'
  | 'hold_west'
  | 'hold_east'
  | 'hold_board'
  | 'notes'
  | 'spec'
  | 'source_a'
  | 'source_b'
  | 'clipping'
  | 'original'
  | 'editor_sample'
  | 'festival_table'
  | 'festival_receipts'
  | 'festival_policy'
  | 'festival_cover'
  | 'workshop_need'
  | 'workshop_extras'
  | 'workshop_builder'
  | 'workshop_result';
export type ExplainTopic =
  | 'lookup'
  | 'notice'
  | 'price'
  | 'tools'
  | 'delegate'
  | 'instruction'
  | 'revise'
  | 'context'
  | 'privacy'
  | 'pack'
  | 'compare'
  | 'verify'
  | 'review'
  | 'voice'
  | 'letter'
  | 'reconcile'
  | 'policy'
  | 'product'
  | 'appointments';
export type ContextNoteId = 'constraint' | 'hold' | 'festival' | 'mango';
export type PackFileId = 'spec' | 'delivery' | 'festival' | 'news_draft';
export type PackStampId = 'rafiq_repair' | 'festival' | 'unnamed';
export type PrivateFieldId = 'name_noura' | 'name_khalid' | 'phone' | 'address';
export type NeededFactId = 'shelf' | 'time' | 'spec_location';

export const LIBRARY_PHASES = ['unstarted', 'briefed', 'working', 'module_ready'] as const;
export type LibraryPhase = (typeof LIBRARY_PHASES)[number];

export interface LibraryQuest {
  phase: LibraryPhase;
  briefed: boolean;
  overflowSeen: boolean;
  constraintRestored: boolean;
  recitedConstraint: boolean;
  windowSlots: ContextNoteId[];
  pinnedNotes: ContextNoteId[];
  lastDroppedNote: ContextNoteId | null;
  lastRecitation: string;
  redacted: Record<PrivateFieldId, boolean>;
  hiddenFacts: Record<NeededFactId, boolean>;
  fileGiven: boolean;
  lastPayload: string;
  packFiles: PackFileId[];
  packStamp: PackStampId;
  packAssembled: boolean;
  specReleased: boolean;
  contextModule: boolean;
  pendingExplain: ExplainTopic | null;
}

export const NEWSROOM_PHASES = ['unstarted', 'briefed', 'working', 'published'] as const;
export type NewsroomPhase = (typeof NEWSROOM_PHASES)[number];

export type MismatchId = 'always_open' | 'midnight_hold' | 'no_written';
export type VoiceStyle = 'editor' | 'slogan' | 'change_facts';
export type LetterRecipient = 'workshop_manager' | 'shopkeeper' | 'robot_manager' | 'circular14' | null;
export type LetterPurpose = 'inspection' | 'midnight_parts' | 'circular14' | null;
export type LetterTone = 'clear_polite' | 'slogan' | 'harsh' | null;
export type LetterSigner = 'player' | 'robot_manager';
export type CompareFlag =
  | 'namedBulletin'
  | 'namedPoster'
  | 'hoursA'
  | 'hoursB'
  | 'accessA'
  | 'accessB';

export interface NewsroomQuest {
  phase: NewsroomPhase;
  briefed: boolean;
  inspectedBulletin: boolean;
  inspectedPoster: boolean;
  namedBulletin: boolean;
  namedPoster: boolean;
  hoursA: boolean;
  hoursB: boolean;
  accessA: boolean;
  accessB: boolean;
  passageA: string;
  passageB: string;
  compared: boolean;
  consensusAttempted: boolean;
  inspectedClipping: boolean;
  followedToOriginal: boolean;
  inspectedOriginal: boolean;
  citedBeforeOriginal: boolean;
  verifiedCite: boolean;
  inspectedDraft: boolean;
  marked: Record<MismatchId, boolean>;
  corrected: Record<MismatchId, boolean>;
  releasedUnchecked: boolean;
  noticeReleased: boolean;
  inspectedSample: boolean;
  voiceStyle: VoiceStyle | null;
  voiceMatched: boolean;
  factsChanged: boolean;
  letterRecipient: LetterRecipient;
  letterPurpose: LetterPurpose;
  letterTone: LetterTone;
  letterBody: string;
  letterReviewed: boolean;
  letterSignedBy: LetterSigner | null;
  letterSent: boolean;
  workshopLead: boolean;
  pendingExplain: ExplainTopic | null;
}

export const FESTIVAL_PHASES = ['unstarted', 'briefed', 'working', 'supplied'] as const;
export type FestivalPhase = (typeof FESTIVAL_PHASES)[number];

export type StockLineId = 'flags' | 'cloth' | 'water' | 'cups';
export type FlagsMark = 'match' | null;
export type ClothMark = 'match' | null;
export type WaterMark = 'receipt' | 'table' | null;
export type CupsMark = 'unknown' | 'table' | 'invent' | null;
export type SubmitFigures = 'human' | 'robot' | null;
export type SubmitSender = 'player' | 'officer_robot';

export interface FestivalQuest {
  phase: FestivalPhase;
  briefed: boolean;
  inspectedTable: boolean;
  inspectedReceipts: boolean;
  inspectedPolicy: boolean;
  inspectedCover: boolean;
  flagsMark: FlagsMark;
  clothMark: ClothMark;
  waterMark: WaterMark;
  cupsMark: CupsMark;
  summedSupported: boolean;
  supportedTotal: number | null;
  usedTableWater: boolean;
  inventedCups: boolean;
  usedRobotTotal: boolean;
  reconciled: boolean;
  figuresChoice: SubmitFigures;
  stamped: boolean;
  sender: SubmitSender | null;
  submitted: boolean;
  submittedWithoutStamp: boolean;
  submittedRobotFigures: boolean;
  workshopMaterials: boolean;
  workshopDoorOpen: boolean;
  pendingExplain: ExplainTopic | null;
}

export const WORKSHOP_PHASES = ['unstarted', 'briefed', 'working', 'posted'] as const;
export type WorkshopPhase = (typeof WORKSHOP_PHASES)[number];

export type BriefScreens = 'board_and_confirm' | 'kiosk_api' | null;
export type BriefConstraints = 'paper_one_no_pay_chat' | 'live_hours' | null;
export type BriefExclusions =
  | 'no_extras'
  | 'include_pay'
  | 'include_chat'
  | 'include_live'
  | 'include_kiosk'
  | null;
export type BriefAcceptance = 'slot_shows_booked' | 'robot_said_done' | 'click_count' | null;
export type AppointmentSlot = 'sunday' | 'monday' | 'tuesday';
export type BoardKind = 'none' | 'slim' | 'bloated';
export type ExtraControl = 'pay' | 'chat' | 'live' | 'kiosk';
export type BriefField = 'screens' | 'constraints' | 'exclusions' | 'acceptance' | 'extra';
export type ResultPart = 'screens' | 'constraints' | 'exclusions' | 'acceptance';

export interface WorkshopQuest {
  phase: WorkshopPhase;
  briefed: boolean;
  inspectedNeed: boolean;
  inspectedExtras: boolean;
  screens: BriefScreens;
  constraints: BriefConstraints;
  exclusions: BriefExclusions;
  acceptance: BriefAcceptance;
  extraPay: boolean;
  extraChat: boolean;
  extraLive: boolean;
  extraKiosk: boolean;
  extrasInBrief: boolean;
  handedOff: boolean;
  builtWithoutBrief: boolean;
  boardKind: BoardKind;
  inspectedResult: boolean;
  resultScreensOk: boolean;
  resultConstraintsOk: boolean;
  resultExclusionsOk: boolean;
  resultAcceptanceOk: boolean;
  bookedSlot: AppointmentSlot | null;
  extraControlUsed: boolean;
  robotSaidDone: boolean;
  servicePosted: boolean;
  pendingExplain: ExplainTopic | null;
}

export type ParcelId = 'r17' | 'r19' | 'r71';
export type ParcelPick = ParcelId | 'gray' | null;
export type LocationPick = 'west' | 'east' | 'any' | null;
export type ConstraintPick = 'repair_no_pay' | 'grab_all_pay' | 'none' | null;
export type ReturnPick = 'tag_to_desk' | 'none' | null;
export type ParcelOutcome =
  | 'none'
  | 'incomplete'
  | 'overbroad_allowed'
  | 'ambiguous_fail'
  | 'decoy'
  | 'stale_r17'
  | 'robot_pay_blocked'
  | 'retrieved';

export const PARCEL_PHASES = [
  'unstarted',
  'briefed',
  'delegated',
  'overbroad',
  'instructing',
  'failed',
  'retrieved',
] as const;
export type ParcelPhase = (typeof PARCEL_PHASES)[number];

export interface InstructionDraft {
  parcel: ParcelPick;
  location: LocationPick;
  constraints: ConstraintPick;
  returnFormat: ReturnPick;
}

export interface ParcelUnderstood {
  parcel: string;
  location: string;
  constraints: string;
  returnFormat: string;
}

export interface ParcelQuest {
  phase: ParcelPhase;
  briefed: boolean;
  inspectedWest: boolean;
  inspectedEast: boolean;
  inspectedBoard: boolean;
  delegated: boolean;
  overbroadOffered: boolean;
  overbroadStopped: boolean;
  overbroadAllowed: boolean;
  failedAttempt: boolean;
  failedParcelId: ParcelId | null;
  intendedParcelId: 'r17' | 'r19';
  retrievedParcelId: ParcelId | null;
  retrievedWithCompleteSpec: boolean;
  r19Staged: boolean;
  sendCount: number;
  failedSendId: number | null;
  successSendId: number | null;
  lastOutcome: ParcelOutcome;
  instruction: InstructionDraft;
  understood: ParcelUnderstood | null;
  playerPaidDecoy: boolean;
  robotPayAttempted: boolean;
  commsRepaired: boolean;
}
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
  | 'shop_helped'
  | 'parcel_visit'
  | 'parcel_overbroad_stopped'
  | 'parcel_instruction_failed'
  | 'parcel_retrieved'
  | 'archive_visit'
  | 'notes_overflow'
  | 'constraint_restored'
  | 'file_redacted'
  | 'pack_assembled'
  | 'spec_released'
  | 'newsroom_visit'
  | 'sources_compared'
  | 'clipping_verified'
  | 'notice_corrected'
  | 'voice_matched'
  | 'letter_reviewed'
  | 'workshop_lead'
  | 'festival_visit'
  | 'stock_reconciled'
  | 'statement_submitted'
  | 'workshop_materials'
  | 'workshop_visit'
  | 'service_posted';

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
  | 'locked_parcel'
  | 'library_inner_locked'
  | 'clerk_hello'
  | 'clerk_brief'
  | 'clerk_revisit'
  | 'clerk_after_success'
  | 'parcel_delegate_prompt'
  | 'parcel_overbroad'
  | 'parcel_overbroad_stopped'
  | 'parcel_overbroad_allowed'
  | 'parcel_retrieved_ok'
  | 'companion_after_parcel'
  | 'librarian_hello'
  | 'librarian_brief'
  | 'librarian_revisit'
  | 'librarian_after_success'
  | 'companion_after_archive'
  | 'locked_newsroom'
  | 'editor_hello'
  | 'editor_brief'
  | 'editor_revisit'
  | 'editor_thanks'
  | 'editor_workshop_lead'
  | 'companion_after_newsroom'
  | 'locked_festival'
  | 'officer_hello'
  | 'officer_brief'
  | 'officer_revisit'
  | 'officer_thanks'
  | 'officer_materials'
  | 'companion_after_festival'
  | 'locked_workshop'
  | 'workshop_door_open'
  | 'manager_hello'
  | 'manager_brief'
  | 'manager_revisit'
  | 'manager_thanks'
  | 'companion_after_workshop';

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
  | 'verify_later'
  | 'delegate_retrieve'
  | 'stop_overbroad'
  | 'allow_overbroad';

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
  | 'crate'
  | 'parcel_door'
  | 'clerk'
  | 'librarian'
  | 'hold_west'
  | 'hold_east'
  | 'hold_board'
  | 'pay_window'
  | 'instruction_desk'
  | 'context_bench'
  | 'community_file'
  | 'pack_table'
  | 'spec_case'
  | 'notes_crate'
  | 'newsroom_door'
  | 'editor'
  | 'source_bulletin'
  | 'source_poster'
  | 'compare_desk'
  | 'clipping_board'
  | 'original_drawer'
  | 'draft_table'
  | 'voice_desk'
  | 'letter_desk'
  | 'festival_door'
  | 'workshop_door'
  | 'officer'
  | 'stock_table'
  | 'receipts_desk'
  | 'reconcile_desk'
  | 'policy_board'
  | 'robot_cover'
  | 'submit_desk'
  | 'manager'
  | 'need_slip'
  | 'extras_slip'
  | 'brief_desk'
  | 'builder_bench'
  | 'result_check'
  | 'appointment_board';

export type PortalId =
  | 'home'
  | 'shop'
  | 'library'
  | 'parcel'
  | 'archive'
  | 'newsroom'
  | 'festival'
  | 'workshop';

export type NpcId =
  | 'robot'
  | 'neighbor'
  | 'shopkeeper'
  | 'clerk'
  | 'librarian'
  | 'editor'
  | 'officer'
  | 'manager';

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
  clerk: NpcGreeting;
  librarian: NpcGreeting;
  editor: NpcGreeting;
  officer: NpcGreeting;
  manager: NpcGreeting;
  journalEvents: JournalEvent[];
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  parcelQuest: ParcelQuest;
  libraryQuest: LibraryQuest;
  newsroomQuest: NewsroomQuest;
  festivalQuest: FestivalQuest;
  workshopQuest: WorkshopQuest;
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
  | { type: 'SUBMIT_NL'; text: string }
  | { type: 'INSTRUCTION_SET'; field: 'parcel' | 'location' | 'constraints' | 'returnFormat'; value: string }
  | { type: 'INSTRUCTION_SEND' }
  | { type: 'PAY_DECIDE'; who: 'player' | 'robot' }
  | { type: 'CONTEXT_LOAD'; note: ContextNoteId }
  | { type: 'CONTEXT_EJECT'; note: ContextNoteId }
  | { type: 'CONTEXT_PIN'; note: ContextNoteId }
  | { type: 'CONTEXT_RECITE' }
  | { type: 'REDACT_TOGGLE'; field: PrivateFieldId }
  | { type: 'FACT_TOGGLE'; field: NeededFactId }
  | { type: 'REDACT_GIVE' }
  | { type: 'PACK_TOGGLE'; file: PackFileId }
  | { type: 'PACK_STAMP'; stamp: PackStampId }
  | { type: 'PACK_ASSEMBLE' }
  | { type: 'COMPARE_TOGGLE'; field: CompareFlag }
  | { type: 'COMPARE_SUBMIT'; style: 'split' | 'consensus' }
  | { type: 'CITE_CLIPPING' }
  | { type: 'VERIFY_ORIGINAL' }
  | { type: 'DRAFT_MARK'; mismatch: MismatchId }
  | { type: 'DRAFT_CORRECT'; mismatch: MismatchId }
  | { type: 'DRAFT_RELEASE' }
  | { type: 'VOICE_APPLY'; style: VoiceStyle }
  | {
      type: 'LETTER_SET';
      field: 'recipient' | 'purpose' | 'tone' | 'body';
      value: string;
    }
  | { type: 'LETTER_REVIEW' }
  | { type: 'LETTER_SEND'; signer: LetterSigner }
  | { type: 'RECONCILE_MARK'; line: StockLineId; mark: string }
  | { type: 'RECONCILE_SUM' }
  | { type: 'RECONCILE_ROBOT' }
  | { type: 'SUBMIT_SET'; field: 'figures' | 'stamp'; value: string }
  | { type: 'SUBMIT_SEND'; sender: SubmitSender }
  | { type: 'BRIEF_SET'; field: BriefField; value: string }
  | { type: 'BUILDER_HAND' }
  | { type: 'BUILDER_BUILD' }
  | { type: 'BUILDER_DONE' }
  | { type: 'RESULT_MATCH'; part: ResultPart }
  | { type: 'BOARD_BOOK'; slot: AppointmentSlot }
  | { type: 'BOARD_EXTRA'; control: ExtraControl };

export interface DialogueChoice {
  id: DialogueChoiceId;
  label: string;
}

export type DialogueSpeaker =
  | 'player'
  | 'robot'
  | 'neighbor'
  | 'shopkeeper'
  | 'clerk'
  | 'librarian'
  | 'editor'
  | 'officer'
  | 'manager'
  | 'notice';

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
  clerk: NpcGreeting;
  librarian: NpcGreeting;
  editor: NpcGreeting;
  officer: NpcGreeting;
  manager: NpcGreeting;
  journalEvents: JournalEvent[];
  mapsVisited: MapId[];
  saveStatus: SaveStatus;
  restoreNotice: boolean;
  endingState: EndingState;
  companion: boolean;
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  parcelQuest: ParcelQuest;
  libraryQuest: LibraryQuest;
  newsroomQuest: NewsroomQuest;
  festivalQuest: FestivalQuest;
  workshopQuest: WorkshopQuest;
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
  clerk: NpcGreeting;
  librarian: NpcGreeting;
  editor: NpcGreeting;
  officer: NpcGreeting;
  manager: NpcGreeting;
  journalEvents: JournalEvent[];
  evidence: EvidenceMap;
  shopQuest: ShopQuest;
  parcelQuest: ParcelQuest;
  libraryQuest: LibraryQuest;
  newsroomQuest: NewsroomQuest;
  festivalQuest: FestivalQuest;
  workshopQuest: WorkshopQuest;
  robot: { companion: boolean };
  endingState: EndingState;
  mapsVisited: MapId[];
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
