import { COMPANION_OFFSET } from './constants';
import { shopkeeperNode } from './shop';
import { clerkNode, parcelRobotNode } from './parcel';
import { librarianNode } from './library';
import { editorNode } from './newsroom';
import { officerNode } from './festival';
import { managerNode } from './workshop';
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

export function clerkVisible(state: GameState): boolean {
  return state.map === 'parcel';
}

export function librarianVisible(state: GameState): boolean {
  return state.map === 'archive';
}

export function editorVisible(state: GameState): boolean {
  return state.map === 'newsroom';
}

export function officerVisible(state: GameState): boolean {
  return state.map === 'festival';
}

export function managerVisible(state: GameState): boolean {
  return state.map === 'workshop';
}

export function npcPosition(state: GameState, id: NpcId): { x: number; y: number } {
  if (id === 'robot') return robotPosition(state);
  if (id === 'neighbor') return WORLD_POS.neighbor;
  if (id === 'clerk') return WORLD_POS.clerk;
  if (id === 'librarian') return WORLD_POS.librarian;
  if (id === 'editor') return WORLD_POS.editor;
  if (id === 'officer') return WORLD_POS.officer;
  if (id === 'manager') return WORLD_POS.manager;
  return WORLD_POS.shopkeeper;
}

export function openingNode(state: GameState, id: NpcId): DialogueNodeId | null {
  if (id === 'robot') {
    if (state.encounter === 'unseen') return null;
    if (state.encounter === 'help_accepted') {
      if (state.kioskQuest.kioskReady) return 'companion_after_kiosk';
      if (state.workshopQuest.servicePosted) return 'companion_after_workshop';
      if (state.festivalQuest.workshopMaterials) return 'companion_after_festival';
      if (state.newsroomQuest.workshopLead) return 'companion_after_newsroom';
      if (state.libraryQuest.contextModule) return 'companion_after_archive';
      if (state.parcelQuest.commsRepaired) return 'companion_after_parcel';
      if (state.map === 'parcel') return parcelRobotNode(state);
      return state.shopQuest.phase === 'helped' ? 'companion_after_shop' : 'companion_revisit';
    }
    return state.conversationSeen ? 'ask_help' : 'discover';
  }
  if (id === 'neighbor') {
    return state.neighbor === 'greeted' ? 'neighbor_revisit' : 'neighbor_hello';
  }
  if (id === 'clerk') return clerkNode(state);
  if (id === 'librarian') return librarianNode(state);
  if (id === 'editor') return editorNode(state);
  if (id === 'officer') return officerNode(state);
  if (id === 'manager') return managerNode(state);
  return shopkeeperNode(state);
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
  if (id === 'clerk') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      clerk: state.clerk === 'greeted' ? 'greeted' : 'talking',
    };
  }
  if (id === 'librarian') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      librarian: state.librarian === 'greeted' ? 'greeted' : 'talking',
    };
  }
  if (id === 'editor') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      editor: state.editor === 'greeted' ? 'greeted' : 'talking',
    };
  }
  if (id === 'officer') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      officer: state.officer === 'greeted' ? 'greeted' : 'talking',
    };
  }
  if (id === 'manager') {
    return {
      ...state,
      mode: 'dialogue',
      dialogueNode: node,
      manager: state.manager === 'greeted' ? 'greeted' : 'talking',
    };
  }
  return {
    ...state,
    mode: 'dialogue',
    dialogueNode: node,
    shopkeeper: state.shopkeeper === 'greeted' ? 'greeted' : 'talking',
  };
}
