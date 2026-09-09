import { COMPANION_OFFSET } from './constants';
import type { DialogueNodeId, GameState, NpcId } from './types';
import { WORLD_POS } from './maps';

export function isCompanion(state: GameState): boolean {
  return state.encounter === 'help_accepted';
}

export function robotPosition(state: GameState): { x: number; y: number } {
  if (isCompanion(state)) {
    return { x: state.position.x + COMPANION_OFFSET.x, y: state.position.y + COMPANION_OFFSET.y };
  }
  return WORLD_POS.robot;
}

export function robotVisible(state: GameState): boolean {
  if (state.encounter === 'unseen') return false;
  if (isCompanion(state)) return true;
  return state.map === 'street';
}

export function neighborVisible(state: GameState): boolean {
  return state.map === 'street';
}

export function shopkeeperVisible(state: GameState): boolean {
  return state.map === 'shop';
}

export function npcPosition(state: GameState, id: NpcId): { x: number; y: number } {
  if (id === 'robot') return robotPosition(state);
  if (id === 'neighbor') return WORLD_POS.neighbor;
  return WORLD_POS.shopkeeper;
}

export function openingNode(state: GameState, id: NpcId): DialogueNodeId | null {
  if (id === 'robot') {
    if (state.encounter === 'unseen') return null;
    if (state.encounter === 'help_accepted') return 'companion_revisit';
    return state.conversationSeen ? 'ask_help' : 'discover';
  }
  if (id === 'neighbor') {
    return state.neighbor === 'greeted' ? 'neighbor_revisit' : 'neighbor_hello';
  }
  return state.shopkeeper === 'greeted' ? 'shopkeeper_revisit' : 'shopkeeper_hello';
}

export function openNpc(state: GameState, id: NpcId): GameState {
  const node = openingNode(state, id);
  if (!node) return state;
  if (id === 'robot') {
    if (state.encounter === 'help_accepted') {
      return { ...state, mode: 'dialogue', dialogueNode: node };
    }
    return {
      ...state,
      encounter: 'talking',
      mode: 'dialogue',
      dialogueNode: node,
    };
  }
  if (id === 'neighbor') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      neighbor: state.neighbor === 'greeted' ? 'greeted' : 'talking',
    };
  }
  return {
    ...state,
    mode: 'dialogue',
    dialogueNode: node,
    shopkeeper: state.shopkeeper === 'greeted' ? 'greeted' : 'talking',
  };
}
