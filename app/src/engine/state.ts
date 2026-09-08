import { facingFrom, tryMove } from './collision';
import { DIALOGUE, OBJECTIVES } from './dialogue';
import { getActionable, listInteractables } from './interact';
import { APARTMENT, STREET } from './maps';
import { validateName } from './names';
import type { GameAction, GameState, SerializedTestState } from './types';

export function createInitialState(): GameState {
  return {
    playerName: '',
    nameDraft: '',
    nameError: null,
    map: 'apartment',
    position: { x: APARTMENT.spawn.x, y: APARTMENT.spawn.y },
    facing: 'down',
    mode: 'name_entry',
    trash: 'home',
    encounter: 'unseen',
    dialogueNode: null,
    conversationSeen: false,
    storyObjective: OBJECTIVES.takeTrash,
    checkpointReached: false,
  };
}

function pickup(state: GameState): GameState {
  if (state.trash !== 'home') return state;
  return {
    ...state,
    trash: 'carried',
    mode: 'dialogue',
    dialogueNode: 'pickup_leaving',
    storyObjective: OBJECTIVES.carryOut,
  };
}

function goThroughDoor(state: GameState): GameState {
  if (state.map === 'apartment') {
    return {
      ...state,
      map: 'street',
      position: { x: STREET.entryFromOther.x, y: STREET.entryFromOther.y },
      facing: 'right',
    };
  }
  return {
    ...state,
    map: 'apartment',
    position: { x: APARTMENT.entryFromOther.x, y: APARTMENT.entryFromOther.y },
    facing: 'left',
  };
}

function dispose(state: GameState): GameState {
  if (state.trash !== 'carried') return state;
  const encounter = state.encounter === 'unseen' ? 'available' : state.encounter;
  return {
    ...state,
    trash: 'disposed',
    encounter,
    storyObjective:
      encounter === 'help_accepted' ? state.storyObjective : OBJECTIVES.inspectRobot,
  };
}

function talkRobot(state: GameState): GameState {
  if (state.encounter === 'unseen') return state;
  if (state.encounter === 'help_accepted') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: 'companion_revisit',
    };
  }
  return {
    ...state,
    encounter: 'talking',
    mode: 'dialogue',
    dialogueNode: state.conversationSeen ? 'ask_help' : 'discover',
  };
}

function closeDialogue(state: GameState): GameState {
  if (state.dialogueNode === 'pickup_leaving') {
    return { ...state, mode: 'playing', dialogueNode: null };
  }
  if (state.encounter === 'help_accepted') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      checkpointReached: true,
      storyObjective: OBJECTIVES.cornerStore,
    };
  }
  if (state.encounter === 'talking') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      encounter: 'available',
      storyObjective: OBJECTIVES.talkRobot,
    };
  }
  return { ...state, mode: 'playing', dialogueNode: null };
}

function advanceDialogue(state: GameState): GameState {
  if (state.mode !== 'dialogue' || !state.dialogueNode) return state;
  const line = DIALOGUE[state.dialogueNode];
  if (line.choices) return state;
  if (line.next) {
    const reachedAsk = line.next === 'ask_help';
    return {
      ...state,
      dialogueNode: line.next,
      conversationSeen: state.conversationSeen || reachedAsk,
    };
  }
  if (state.dialogueNode === 'lead') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      encounter: 'help_accepted',
      checkpointReached: true,
      storyObjective: OBJECTIVES.cornerStore,
    };
  }
  return { ...state, mode: 'playing', dialogueNode: null };
}

function choose(state: GameState, choice: 'agree' | 'postpone'): GameState {
  if (state.mode !== 'dialogue' || state.dialogueNode !== 'ask_help') {
    return state;
  }
  if (choice === 'postpone') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      encounter: 'available',
      conversationSeen: true,
      storyObjective: OBJECTIVES.talkRobot,
    };
  }
  if (state.encounter !== 'talking') return state;
  return {
    ...state,
    dialogueNode: 'agree',
    encounter: 'help_accepted',
    conversationSeen: true,
    checkpointReached: true,
    storyObjective: OBJECTIVES.cornerStore,
  };
}

export function reduce(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NAME_DRAFT':
      return { ...state, nameDraft: action.value, nameError: null };
    case 'SUBMIT_NAME': {
      if (state.mode !== 'name_entry') return state;
      const result = validateName(state.nameDraft);
      if (!result.ok) {
        return { ...state, nameError: result.message };
      }
      return {
        ...state,
        playerName: result.name,
        nameDraft: result.name,
        nameError: null,
        mode: 'confirm_name',
      };
    }
    case 'REVISE_NAME':
      if (state.mode !== 'confirm_name') return state;
      return { ...state, mode: 'name_entry', nameError: null };
    case 'CONFIRM_NAME':
      if (state.mode !== 'confirm_name' || !validateName(state.playerName).ok) {
        return state;
      }
      return {
        ...state,
        mode: 'playing',
        map: 'apartment',
        position: { x: APARTMENT.spawn.x, y: APARTMENT.spawn.y },
        facing: 'down',
        trash: 'home',
        encounter: 'unseen',
        dialogueNode: null,
        conversationSeen: false,
        checkpointReached: false,
        storyObjective: OBJECTIVES.takeTrash,
      };
    case 'MOVE': {
      if (state.mode !== 'playing') return state;
      if (action.dx === 0 && action.dy === 0) return state;
      const position = tryMove(
        state.map,
        state.position.x,
        state.position.y,
        action.dx,
        action.dy,
      );
      return {
        ...state,
        position,
        facing: facingFrom(action.dx, action.dy, state.facing),
      };
    }
    case 'INTERACT': {
      if (state.mode !== 'playing') return state;
      const target = getActionable(state);
      if (!target) return state;
      switch (target.id) {
        case 'trash':
          return pickup(state);
        case 'door':
          return goThroughDoor(state);
        case 'dumpster':
          return dispose(state);
        case 'robot':
          return talkRobot(state);
        default:
          return state;
      }
    }
    case 'ADVANCE_DIALOGUE':
      return advanceDialogue(state);
    case 'CHOOSE':
      return choose(state, action.choice);
    case 'TOGGLE_PAUSE':
      if (state.mode === 'playing') return { ...state, mode: 'paused' };
      if (state.mode === 'paused') return { ...state, mode: 'playing' };
      return state;
    case 'OPEN_HELP':
      if (state.mode === 'playing' || state.mode === 'paused') {
        return { ...state, mode: 'paused' };
      }
      return state;
    case 'CLOSE_OVERLAY':
      if (state.mode === 'dialogue') return closeDialogue(state);
      if (state.mode === 'paused') return { ...state, mode: 'playing' };
      if (state.mode === 'playing') return { ...state, mode: 'paused' };
      return state;
    case 'DEBUG_TELEPORT':
      return {
        ...state,
        map: action.map ?? state.map,
        position: { x: action.x, y: action.y },
      };
    default:
      return state;
  }
}

export function serializeState(state: GameState): SerializedTestState {
  return {
    playerName: state.playerName,
    map: state.map,
    position: { x: state.position.x, y: state.position.y },
    facing: state.facing,
    mode: state.mode,
    trash: state.trash,
    encounter: state.encounter,
    dialogueNode: state.dialogueNode,
    conversationSeen: state.conversationSeen,
    storyObjective: state.storyObjective,
    checkpointReached: state.checkpointReached,
    nearby: getActionable(state),
    interactables: listInteractables(state),
  };
}

export { getActionable, listInteractables };
