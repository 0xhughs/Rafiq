export type MapId = 'apartment' | 'street' | 'shop' | 'library';

export const MAP_IDS: readonly MapId[] = ['apartment', 'street', 'shop', 'library'];

export type Mode =
  | 'name_entry'
  | 'confirm_name'
  | 'playing'
  | 'dialogue'
  | 'paused';

export type TrashState = 'home' | 'carried' | 'disposed';

export type EncounterState = 'unseen' | 'available' | 'talking' | 'help_accepted';

export type Facing = 'up' | 'down' | 'left' | 'right';

export type Cardinal = 'north' | 'south' | 'east' | 'west';

export type ItemId = 'trash_bag';

export const ITEM_IDS: readonly ItemId[] = ['trash_bag'];

export type NpcGreeting = 'unmet' | 'talking' | 'greeted';

export type SaveStatus = 'absent' | 'ok' | 'unavailable' | 'recovered';

export type EndingState = 'in_progress';

export type JournalEventId =
  | 'pickup'
  | 'disposal'
  | 'help_accepted'
  | 'neighbor_greeting'
  | 'shop_visit'
  | 'library_visit';

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
  | 'neighbor_hello'
  | 'neighbor_reply'
  | 'neighbor_pointer'
  | 'neighbor_thanks'
  | 'neighbor_revisit'
  | 'shopkeeper_hello'
  | 'shopkeeper_revisit'
  | 'locked_shop'
  | 'locked_library'
  | 'library_inner_locked';

export type DialogueChoiceId = 'agree' | 'postpone' | 'npc_thanks' | 'npc_postpone';

export type InteractableId =
  | 'trash'
  | 'door'
  | 'dumpster'
  | 'robot'
  | 'shop_door'
  | 'library_door'
  | 'neighbor'
  | 'shopkeeper'
  | 'library_inner';

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
  evidence: Record<string, never>;
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
  | { type: 'DEBUG_TELEPORT'; map?: MapId; x: number; y: number };

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
  evidence: Record<string, never>;
  robot: { companion: boolean };
  endingState: EndingState;
  mapsVisited: MapId[];
}

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
