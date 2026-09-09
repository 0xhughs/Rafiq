import { facingFrom, tryMove } from './collision';
import {
  DIALOGUE,
  isLockedNode,
  OBJECTIVES,
  recordEvent,
  visitMap,
} from './dialogue';
import { grantItem, removeItem } from './inventory';
import { getActionable, listInteractables } from './interact';
import { APARTMENT, destinationOf, PORTALS } from './maps';
import { validateName } from './names';
import { openNpc } from './npc';
import {
  closeParcelDialogue,
  createParcelQuest,
  inspectParcel,
  isParcelOverlay,
  parcelObjective,
  reduceInstructionSend,
  reduceInstructionSet,
  reduceParcelChoice,
  reduceParcelNl,
  reducePayDecide,
  skipParcelExplain,
} from './parcel';
import { clearRafiqKeys, loadAdventure, persistAdventure, shouldPersist } from './save';
import {
  applyCalculatorKey,
  closeShopDialogue,
  createCalculator,
  createShopQuest,
  emptyEvidence,
  inspectShop,
  isShopOverlay,
  reduceCrateDecide,
  reduceLookupNl,
  reduceNoticeApply,
  reduceNoticePost,
  reduceShopChoice,
  skipExplain,
} from './shop';
import type {
  DialogueChoiceId,
  GameAction,
  GameState,
  KeyValueStore,
  PortalId,
  SerializedTestState,
} from './types';

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
    inventory: [],
    neighbor: 'unmet',
    shopkeeper: 'unmet',
    clerk: 'unmet',
    journalEvents: [],
    evidence: emptyEvidence(),
    shopQuest: createShopQuest(),
    parcelQuest: createParcelQuest(),
    calculator: createCalculator(),
    inspectTarget: null,
    explainTopic: null,
    robotUnderstood: null,
    shopFeedback: null,
    endingState: 'in_progress',
    mapsVisited: [],
    saveStatus: 'absent',
    restoreNotice: false,
  };
}

export function bootState(store: KeyValueStore): GameState {
  const loaded = loadAdventure(store);
  if (loaded.status === 'ok' || loaded.status === 'recovered') {
    return loaded.state;
  }
  const initial = createInitialState();
  if (loaded.status === 'unavailable') {
    return { ...initial, saveStatus: 'unavailable' };
  }
  return initial;
}

function pickup(state: GameState): GameState {
  if (state.trash !== 'home') return state;
  return {
    ...state,
    trash: 'carried',
    inventory: grantItem(state.inventory, 'trash_bag'),
    mode: 'dialogue',
    dialogueNode: 'pickup_leaving',
    storyObjective: OBJECTIVES.carryOut,
    journalEvents: recordEvent(state.journalEvents, 'pickup'),
  };
}

function goThroughPortal(state: GameState, portalId: PortalId): GameState {
  const portal = PORTALS.find((item) => item.id === portalId);
  if (!portal) return state;
  if (portal.requiresShopHelped && state.shopQuest.phase !== 'helped') {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  if (portal.requiresHelp && state.encounter !== 'help_accepted') {
    if (!portal.lockedNode) return state;
    return { ...state, mode: 'dialogue', dialogueNode: portal.lockedNode };
  }
  const dest = destinationOf(portal, state.map);
  let events = state.journalEvents;
  if (dest.map === 'shop') events = recordEvent(events, 'shop_visit');
  if (dest.map === 'library') events = recordEvent(events, 'library_visit');
  if (dest.map === 'parcel') events = recordEvent(events, 'parcel_visit');
  return {
    ...state,
    map: dest.map,
    position: { x: dest.position.x, y: dest.position.y },
    facing: dest.facing,
    mapsVisited: visitMap(state.mapsVisited, dest.map),
    journalEvents: events,
    storyObjective: dest.map === 'parcel' ? parcelObjective(state) : state.storyObjective,
  };
}

function dispose(state: GameState): GameState {
  if (state.trash !== 'carried') return state;
  const encounter = state.encounter === 'unseen' ? 'available' : state.encounter;
  return {
    ...state,
    trash: 'disposed',
    inventory: removeItem(state.inventory, 'trash_bag'),
    encounter,
    storyObjective:
      encounter === 'help_accepted' ? state.storyObjective : OBJECTIVES.inspectRobot,
    journalEvents: recordEvent(state.journalEvents, 'disposal'),
  };
}

function postponeNpc(state: GameState): GameState {
  return {
    ...state,
    mode: 'playing',
    dialogueNode: null,
    neighbor: state.neighbor === 'greeted' ? 'greeted' : 'unmet',
    shopkeeper: state.shopkeeper === 'greeted' ? 'greeted' : 'unmet',
    clerk: state.clerk === 'greeted' ? 'greeted' : 'unmet',
  };
}

function closeDialogue(state: GameState): GameState {
  if (state.dialogueNode === 'pickup_leaving' || isLockedNode(state.dialogueNode)) {
    return { ...state, mode: 'playing', dialogueNode: null };
  }
  const shopClosed = closeShopDialogue(state);
  if (shopClosed) return shopClosed;
  const parcelClosed = closeParcelDialogue(state);
  if (parcelClosed) return parcelClosed;
  if (state.dialogueNode === 'neighbor_thanks') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      neighbor: 'greeted',
      journalEvents: recordEvent(state.journalEvents, 'neighbor_greeting'),
    };
  }
  if (state.dialogueNode?.startsWith('neighbor')) {
    return postponeNpc(state);
  }
  if (state.encounter === 'help_accepted') {
    return {
      ...state,
      mode: 'playing',
      dialogueNode: null,
      checkpointReached: true,
      storyObjective:
        state.parcelQuest.commsRepaired
          ? OBJECTIVES.parcelDone
          : state.shopQuest.phase === 'helped'
            ? OBJECTIVES.repairLead
            : state.storyObjective,
      journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
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
      journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
    };
  }
  return closeDialogue(state);
}

function choose(state: GameState, choice: DialogueChoiceId): GameState {
  if (state.mode !== 'dialogue') return state;
  if (state.dialogueNode === 'ask_help') {
    if (choice === 'postpone' || choice === 'npc_postpone') {
      return {
        ...state,
        mode: 'playing',
        dialogueNode: null,
        encounter: 'available',
        conversationSeen: true,
        storyObjective: OBJECTIVES.talkRobot,
      };
    }
    if (choice === 'agree' && state.encounter === 'talking') {
      return {
        ...state,
        dialogueNode: 'agree',
        encounter: 'help_accepted',
        conversationSeen: true,
        checkpointReached: true,
        storyObjective: OBJECTIVES.cornerStore,
        journalEvents: recordEvent(state.journalEvents, 'help_accepted'),
      };
    }
    return state;
  }
  if (state.dialogueNode === 'neighbor_pointer') {
    if (choice === 'postpone' || choice === 'npc_postpone') {
      return postponeNpc(state);
    }
    if (choice === 'npc_thanks' || choice === 'agree') {
      return {
        ...state,
        dialogueNode: 'neighbor_thanks',
        neighbor: 'greeted',
        journalEvents: recordEvent(state.journalEvents, 'neighbor_greeting'),
      };
    }
  }
  if (state.dialogueNode === 'parcel_delegate_prompt' && (choice === 'postpone' || choice === 'npc_postpone')) {
    return postponeNpc(state);
  }
  const parcelChoice = reduceParcelChoice(state, choice);
  if (parcelChoice) return parcelChoice;
  return reduceShopChoice(state, choice);
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
        inventory: [],
        neighbor: 'unmet',
        shopkeeper: 'unmet',
        clerk: 'unmet',
        journalEvents: [],
        evidence: emptyEvidence(),
        shopQuest: createShopQuest(),
        parcelQuest: createParcelQuest(),
        calculator: createCalculator(),
        inspectTarget: null,
        explainTopic: null,
        robotUnderstood: null,
        shopFeedback: null,
        endingState: 'in_progress',
        mapsVisited: ['apartment'],
        restoreNotice: false,
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
          return goThroughPortal(state, 'home');
        case 'shop_door':
          return goThroughPortal(state, 'shop');
        case 'library_door':
          return goThroughPortal(state, 'library');
        case 'parcel_door':
          return goThroughPortal(state, 'parcel');
        case 'dumpster':
          return dispose(state);
        case 'robot':
          return openNpc(state, 'robot');
        case 'neighbor':
          return openNpc(state, 'neighbor');
        case 'shopkeeper':
          return openNpc(state, 'shopkeeper');
        case 'clerk':
          return openNpc(state, 'clerk');
        case 'library_inner':
          return { ...state, mode: 'dialogue', dialogueNode: 'library_inner_locked' };
        case 'shelf_west':
          return inspectShop(state, 'west');
        case 'shelf_east':
          return inspectShop(state, 'east');
        case 'price_list':
          return inspectShop(state, 'price');
        case 'hold_west':
          return inspectParcel(state, 'hold_west');
        case 'hold_east':
          return inspectParcel(state, 'hold_east');
        case 'hold_board':
          return inspectParcel(state, 'hold_board');
        case 'pay_window':
          return { ...state, mode: 'pay', shopFeedback: null };
        case 'instruction_desk':
          return { ...state, mode: 'instruction', shopFeedback: null };
        case 'notice_board':
          return {
            ...state,
            mode: 'notice',
            shopQuest: { ...state.shopQuest, inspectedNotice: true, heardDraft: true },
            shopFeedback: null,
          };
        case 'calculator':
          return { ...state, mode: 'calculator', shopFeedback: null };
        case 'crate':
          return { ...state, mode: 'crate', shopFeedback: null };
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
      if (isShopOverlay(state.mode)) {
        if (state.mode === 'explain') {
          if (
            state.explainTopic === 'delegate' ||
            state.explainTopic === 'instruction' ||
            state.explainTopic === 'revise'
          ) {
            return skipParcelExplain(state);
          }
          return skipExplain(state);
        }
        return {
          ...state,
          mode: 'playing',
          inspectTarget: null,
          explainTopic: null,
          shopFeedback: null,
        };
      }
      if (isParcelOverlay(state.mode)) {
        return {
          ...state,
          mode: 'playing',
          shopFeedback: null,
        };
      }
      if (state.mode === 'playing') return { ...state, mode: 'paused' };
      return state;
    case 'CALCULATOR_KEY': {
      if (state.mode !== 'calculator') return state;
      const calculator = applyCalculatorKey(state.calculator, action.key);
      const hasExactTotal = calculator.result === 17 ? true : state.shopQuest.hasExactTotal;
      return {
        ...state,
        calculator,
        shopQuest: { ...state.shopQuest, hasExactTotal },
      };
    }
    case 'NOTICE_APPLY':
      if (state.mode !== 'notice') return state;
      return reduceNoticeApply(state, action.field);
    case 'NOTICE_POST':
      if (state.mode !== 'notice') return state;
      return reduceNoticePost(state, action.asDraft);
    case 'CRATE_DECIDE':
      if (state.mode !== 'crate') return state;
      return reduceCrateDecide(state, action.who);
    case 'SKIP_EXPLAIN':
      if (state.mode !== 'explain') return state;
      if (
        state.explainTopic === 'delegate' ||
        state.explainTopic === 'instruction' ||
        state.explainTopic === 'revise'
      ) {
        return skipParcelExplain(state);
      }
      return skipExplain(state);
    case 'SUBMIT_NL':
      if (state.mode === 'instruction') return reduceParcelNl(state, action.text);
      if (state.mode === 'dialogue' && state.dialogueNode === 'parcel_overbroad') {
        return reduceParcelNl(state, action.text);
      }
      if (state.mode === 'dialogue' && state.dialogueNode === 'parcel_delegate_prompt') {
        return reduceParcelNl(state, action.text);
      }
      if (state.mode !== 'dialogue' || state.dialogueNode !== 'shop_lookup_prompt') return state;
      return reduceLookupNl(state, action.text);
    case 'INSTRUCTION_SET':
      if (state.mode !== 'instruction') return state;
      return reduceInstructionSet(state, action.field, action.value);
    case 'INSTRUCTION_SEND':
      if (state.mode !== 'instruction') return state;
      return reduceInstructionSend(state);
    case 'PAY_DECIDE':
      if (state.mode !== 'pay') return state;
      return reducePayDecide(state, action.who);
    case 'CONFIRM_NEW_ADVENTURE':
      return createInitialState();
    case 'DISMISS_RESTORE_NOTICE':
      return { ...state, restoreNotice: false };
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

export function stepGame(store: KeyValueStore, state: GameState, action: GameAction): GameState {
  if (action.type === 'CONFIRM_NEW_ADVENTURE') {
    clearRafiqKeys(store);
    return createInitialState();
  }
  const next = reduce(state, action);
  if (shouldPersist(state, next, action)) {
    return persistAdventure(store, next);
  }
  return next;
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
    inventory: [...state.inventory],
    neighbor: state.neighbor,
    shopkeeper: state.shopkeeper,
    clerk: state.clerk,
    journalEvents: [...state.journalEvents],
    mapsVisited: [...state.mapsVisited],
    saveStatus: state.saveStatus,
    restoreNotice: state.restoreNotice,
    endingState: state.endingState,
    companion: state.encounter === 'help_accepted',
    evidence: { ...state.evidence },
    shopQuest: { ...state.shopQuest },
    parcelQuest: { ...state.parcelQuest },
    inspectTarget: state.inspectTarget,
    explainTopic: state.explainTopic,
    robotUnderstood: state.robotUnderstood,
    calculatorResult: state.calculator.result,
  };
}

export { getActionable, listInteractables };
