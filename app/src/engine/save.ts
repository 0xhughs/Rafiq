import { playerHitsSolid } from './collision';
import { RESTORE_NOTICE, SAVE_BACKUP_KEY, SAVE_KEY } from './constants';
import { OBJECTIVES } from './dialogue';
import { syncInventory } from './inventory';
import { getMap, MAPS } from './maps';
import { validateName } from './names';
import type {
  EndingState,
  Facing,
  GameAction,
  GameState,
  ItemId,
  JournalEvent,
  JournalEventId,
  KeyValueStore,
  MapId,
  NpcGreeting,
  SaveEnvelope,
  SaveStatus,
  TrashState,
  EncounterState,
  Vec2,
} from './types';
import { ITEM_IDS, MAP_IDS } from './types';

export { SAVE_BACKUP_KEY, SAVE_KEY, RESTORE_NOTICE };

export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

export const browserStore: KeyValueStore = {
  getItem(key: string): string | null {
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string): void {
    window.localStorage.setItem(key, value);
  },
  removeItem(key: string): void {
    window.localStorage.removeItem(key);
  },
};

const FACINGS: readonly Facing[] = ['up', 'down', 'left', 'right'];
const TRASH: readonly TrashState[] = ['home', 'carried', 'disposed'];
const ENCOUNTERS: readonly EncounterState[] = ['unseen', 'available', 'talking', 'help_accepted'];
const GREETINGS: readonly NpcGreeting[] = ['unmet', 'talking', 'greeted'];
const JOURNAL_IDS: readonly JournalEventId[] = [
  'pickup',
  'disposal',
  'help_accepted',
  'neighbor_greeting',
  'shop_visit',
  'library_visit',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isMapId(value: unknown): value is MapId {
  return typeof value === 'string' && (MAP_IDS as readonly string[]).includes(value);
}

function persistableGreeting(flag: NpcGreeting): 'unmet' | 'greeted' {
  return flag === 'greeted' ? 'greeted' : 'unmet';
}

export function snapIfUnsafe(mapId: MapId, position: Vec2): Vec2 {
  if (!playerHitsSolid(mapId, position.x, position.y)) {
    return { x: position.x, y: position.y };
  }
  const spawn = getMap(mapId).spawn;
  return { x: spawn.x, y: spawn.y };
}

export function toEnvelope(state: GameState): SaveEnvelope {
  const companion = state.encounter === 'help_accepted';
  return {
    saveVersion: 1,
    playerName: state.playerName,
    map: state.map,
    position: { x: state.position.x, y: state.position.y },
    facing: state.facing,
    trash: state.trash,
    encounter: companion ? 'help_accepted' : state.encounter === 'talking' ? 'available' : state.encounter,
    conversationSeen: state.conversationSeen,
    checkpointReached: state.checkpointReached || companion,
    storyObjective: state.storyObjective,
    inventory: syncInventory(state.inventory, state.trash),
    neighbor: persistableGreeting(state.neighbor),
    shopkeeper: persistableGreeting(state.shopkeeper),
    journalEvents: state.journalEvents.slice(-12),
    evidence: {},
    robot: { companion },
    endingState: 'in_progress',
    mapsVisited: state.mapsVisited.length > 0 ? [...state.mapsVisited] : [state.map],
  };
}

function parseJournal(value: unknown): JournalEvent[] | null {
  if (!Array.isArray(value)) return null;
  const events: JournalEvent[] = [];
  for (const item of value) {
    if (!isObject(item) || typeof item.id !== 'string' || typeof item.text !== 'string') {
      return null;
    }
    if (!(JOURNAL_IDS as readonly string[]).includes(item.id)) return null;
    if (events.some((event) => event.id === item.id)) continue;
    events.push({ id: item.id as JournalEventId, text: item.text });
  }
  return events.slice(-12);
}

function parseInventory(value: unknown): ItemId[] | null {
  if (!Array.isArray(value)) return null;
  const items: ItemId[] = [];
  for (const item of value) {
    if (typeof item !== 'string' || !(ITEM_IDS as readonly string[]).includes(item)) {
      return null;
    }
    const id = item as ItemId;
    if (!items.includes(id)) items.push(id);
  }
  return items;
}

function parseMapsVisited(value: unknown): MapId[] | null {
  if (!Array.isArray(value)) return null;
  const maps: MapId[] = [];
  for (const item of value) {
    if (!isMapId(item)) return null;
    if (!maps.includes(item)) maps.push(item);
  }
  return maps;
}

export function validateSave(raw: unknown): SaveEnvelope | null {
  let data: unknown = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (!isObject(data)) return null;
  if (data.saveVersion !== 1) return null;
  if (typeof data.playerName !== 'string') return null;
  const name = validateName(data.playerName);
  if (!name.ok) return null;
  if (!isMapId(data.map) || !(data.map in MAPS)) return null;
  if (!isObject(data.position) || !isFiniteNumber(data.position.x) || !isFiniteNumber(data.position.y)) {
    return null;
  }
  if (typeof data.facing !== 'string' || !(FACINGS as readonly string[]).includes(data.facing)) return null;
  if (typeof data.trash !== 'string' || !(TRASH as readonly string[]).includes(data.trash)) return null;
  if (typeof data.encounter !== 'string' || !(ENCOUNTERS as readonly string[]).includes(data.encounter)) {
    return null;
  }
  if (typeof data.conversationSeen !== 'boolean' || typeof data.checkpointReached !== 'boolean') return null;
  if (typeof data.storyObjective !== 'string') return null;
  const inventory = parseInventory(data.inventory);
  if (!inventory) return null;
  if (typeof data.neighbor !== 'string' || !(GREETINGS as readonly string[]).includes(data.neighbor)) {
    return null;
  }
  if (typeof data.shopkeeper !== 'string' || !(GREETINGS as readonly string[]).includes(data.shopkeeper)) {
    return null;
  }
  const journalEvents = parseJournal(data.journalEvents);
  if (!journalEvents) return null;
  if (!isObject(data.evidence)) return null;
  if (!isObject(data.robot) || typeof data.robot.companion !== 'boolean') return null;
  if (data.endingState !== 'in_progress') return null;
  const mapsVisited = parseMapsVisited(data.mapsVisited);
  if (!mapsVisited) return null;
  const companion = data.robot.companion;
  const encounter: EncounterState = companion ? 'help_accepted' : (data.encounter as EncounterState);
  return {
    saveVersion: 1,
    playerName: name.name,
    map: data.map,
    position: { x: data.position.x, y: data.position.y },
    facing: data.facing as Facing,
    trash: data.trash as TrashState,
    encounter,
    conversationSeen: data.conversationSeen,
    checkpointReached: companion ? true : data.checkpointReached,
    storyObjective: data.storyObjective,
    inventory: syncInventory(inventory, data.trash as TrashState),
    neighbor: persistableGreeting(data.neighbor as NpcGreeting),
    shopkeeper: persistableGreeting(data.shopkeeper as NpcGreeting),
    journalEvents,
    evidence: {},
    robot: { companion },
    endingState: 'in_progress' satisfies EndingState,
    mapsVisited: mapsVisited.length > 0 ? mapsVisited : [data.map],
  };
}

export function hydrateSave(
  envelope: SaveEnvelope,
  saveStatus: SaveStatus,
  restoreNotice: boolean,
): GameState {
  const map = envelope.map;
  const position = snapIfUnsafe(map, envelope.position);
  const companion = envelope.robot.companion || envelope.encounter === 'help_accepted';
  return {
    playerName: envelope.playerName,
    nameDraft: envelope.playerName,
    nameError: null,
    map,
    position,
    facing: envelope.facing,
    mode: 'playing',
    trash: envelope.trash,
    encounter: companion ? 'help_accepted' : envelope.encounter === 'talking' ? 'available' : envelope.encounter,
    dialogueNode: null,
    conversationSeen: envelope.conversationSeen,
    storyObjective: envelope.storyObjective || (companion ? OBJECTIVES.cornerStore : OBJECTIVES.takeTrash),
    checkpointReached: companion || envelope.checkpointReached,
    inventory: syncInventory(envelope.inventory, envelope.trash),
    neighbor: persistableGreeting(envelope.neighbor),
    shopkeeper: persistableGreeting(envelope.shopkeeper),
    journalEvents: envelope.journalEvents.slice(-12),
    evidence: {},
    endingState: 'in_progress',
    mapsVisited: envelope.mapsVisited.length > 0 ? envelope.mapsVisited : [map],
    saveStatus,
    restoreNotice,
  };
}

export type LoadResult =
  | { status: 'absent' }
  | { status: 'unavailable' }
  | { status: 'ok' | 'recovered'; state: GameState };

export function clearRafiqKeys(store: KeyValueStore): void {
  store.removeItem(SAVE_KEY);
  store.removeItem(SAVE_BACKUP_KEY);
}

export function loadAdventure(store: KeyValueStore): LoadResult {
  try {
    const primaryRaw = store.getItem(SAVE_KEY);
    const primary = validateSave(primaryRaw);
    if (primary) {
      return { status: 'ok', state: hydrateSave(primary, 'ok', false) };
    }
    const backupRaw = store.getItem(SAVE_BACKUP_KEY);
    const backup = validateSave(backupRaw);
    if (backup) {
      try {
        store.setItem(SAVE_KEY, JSON.stringify(backup));
      } catch {
        // Resume from memory even if rewriting the primary key fails.
      }
      return { status: 'recovered', state: hydrateSave(backup, 'recovered', true) };
    }
    return { status: 'absent' };
  } catch {
    return { status: 'unavailable' };
  }
}

export function persistAdventure(store: KeyValueStore, state: GameState): GameState {
  try {
    const envelope = toEnvelope(state);
    const json = JSON.stringify(envelope);
    const current = store.getItem(SAVE_KEY);
    if (current && validateSave(current)) {
      store.setItem(SAVE_BACKUP_KEY, current);
    }
    store.setItem(SAVE_KEY, json);
    return { ...state, saveStatus: 'ok' };
  } catch {
    return { ...state, saveStatus: 'unavailable' };
  }
}

export function shouldPersist(prev: GameState, next: GameState, action: GameAction): boolean {
  if (
    action.type === 'DEBUG_TELEPORT' ||
    action.type === 'MOVE' ||
    action.type === 'NAME_DRAFT' ||
    action.type === 'SUBMIT_NAME' ||
    action.type === 'REVISE_NAME' ||
    action.type === 'TOGGLE_PAUSE' ||
    action.type === 'OPEN_HELP' ||
    action.type === 'DISMISS_RESTORE_NOTICE'
  ) {
    return false;
  }
  if (action.type === 'CONFIRM_NAME' && next.mode === 'playing') return true;
  if (prev.trash !== next.trash) return true;
  if (prev.map !== next.map) return true;
  if (prev.encounter !== next.encounter) return true;
  if (persistableGreeting(prev.neighbor) !== persistableGreeting(next.neighbor)) return true;
  if (persistableGreeting(prev.shopkeeper) !== persistableGreeting(next.shopkeeper)) return true;
  if (prev.checkpointReached !== next.checkpointReached) return true;
  if (
    (action.type === 'CLOSE_OVERLAY' || action.type === 'CHOOSE' || action.type === 'ADVANCE_DIALOGUE') &&
    prev.mode === 'dialogue' &&
    next.mode === 'playing' &&
    prev.dialogueNode &&
    prev.dialogueNode !== 'pickup_leaving' &&
    prev.dialogueNode !== 'locked_shop' &&
    prev.dialogueNode !== 'locked_library' &&
    prev.dialogueNode !== 'library_inner_locked'
  ) {
    return true;
  }
  return false;
}
