export type MapId = 'apartment' | 'street';

export type Mode =
  | 'name_entry'
  | 'confirm_name'
  | 'playing'
  | 'dialogue'
  | 'paused';

export type TrashState = 'home' | 'carried' | 'disposed';

export type EncounterState = 'unseen' | 'available' | 'talking' | 'help_accepted';

export type Facing = 'up' | 'down' | 'left' | 'right';

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
  | 'companion_revisit';

export type InteractableId = 'trash' | 'door' | 'dumpster' | 'robot';

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
}

export type GameAction =
  | { type: 'NAME_DRAFT'; value: string }
  | { type: 'SUBMIT_NAME' }
  | { type: 'REVISE_NAME' }
  | { type: 'CONFIRM_NAME' }
  | { type: 'MOVE'; dx: number; dy: number }
  | { type: 'INTERACT' }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'CHOOSE'; choice: 'agree' | 'postpone' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'OPEN_HELP' }
  | { type: 'CLOSE_OVERLAY' }
  | { type: 'DEBUG_TELEPORT'; map?: MapId; x: number; y: number };

export interface DialogueChoice {
  id: 'agree' | 'postpone';
  label: string;
}

export interface DialogueLine {
  id: DialogueNodeId;
  speaker: 'player' | 'robot';
  speakerLabel: (playerName: string) => string;
  text: (playerName: string) => string;
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
}
