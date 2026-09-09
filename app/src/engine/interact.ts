import { HINT_LABELS, INTERACT_RANGE } from './constants';
import {
  doorHint,
  FURNITURE,
  libraryDoorHint,
  portalLetterPos,
  portalsOnMap,
  shopDoorHint,
  WORLD_POS,
} from './maps';
import { neighborVisible, npcPosition, robotVisible, shopkeeperVisible } from './npc';
import type { Actionable, GameState, InteractableId } from './types';

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function distToRect(
  px: number,
  py: number,
  x: number,
  y: number,
  w: number,
  h: number,
): number {
  const cx = Math.max(x, Math.min(px, x + w));
  const cy = Math.max(y, Math.min(py, y + h));
  return Math.hypot(px - cx, py - cy);
}

export { robotPosition, robotVisible, isCompanion } from './npc';

function itemDistance(state: GameState, item: Actionable): number {
  if (item.id === 'dumpster') {
    const box = FURNITURE.street.dumpster;
    return distToRect(state.position.x, state.position.y, box.x, box.y, box.w, box.h);
  }
  return dist(state.position.x, state.position.y, item.x, item.y);
}

function portalHint(id: InteractableId, map: GameState['map']): string {
  if (id === 'door') return doorHint(map);
  if (id === 'shop_door') return shopDoorHint(map);
  return libraryDoorHint(map);
}

export function listInteractables(state: GameState): Actionable[] {
  const items: Actionable[] = [];

  if (state.map === 'apartment' && state.trash === 'home') {
    items.push({
      id: 'trash',
      label: HINT_LABELS.trash,
      x: WORLD_POS.trash.x,
      y: WORLD_POS.trash.y,
    });
  }

  for (const { portal, end } of portalsOnMap(state.map)) {
    const pos = portalLetterPos(end.map, end.letter);
    items.push({
      id: portal.interactable,
      label: portalHint(portal.interactable, state.map),
      x: pos.x,
      y: pos.y,
    });
  }

  if (state.map === 'street' && state.trash === 'carried') {
    items.push({
      id: 'dumpster',
      label: HINT_LABELS.dumpster,
      x: WORLD_POS.dumpster.x,
      y: WORLD_POS.dumpster.y,
    });
  }

  if (robotVisible(state)) {
    const robot = npcPosition(state, 'robot');
    items.push({
      id: 'robot',
      label: HINT_LABELS.robot,
      x: robot.x,
      y: robot.y,
    });
  }

  if (neighborVisible(state)) {
    const neighbor = npcPosition(state, 'neighbor');
    items.push({
      id: 'neighbor',
      label: HINT_LABELS.neighbor,
      x: neighbor.x,
      y: neighbor.y,
    });
  }

  if (shopkeeperVisible(state)) {
    const keeper = npcPosition(state, 'shopkeeper');
    items.push({
      id: 'shopkeeper',
      label: HINT_LABELS.shopkeeper,
      x: keeper.x,
      y: keeper.y,
    });
  }

  if (state.map === 'library') {
    items.push({
      id: 'library_inner',
      label: HINT_LABELS.libraryInner,
      x: WORLD_POS.libraryInner.x,
      y: WORLD_POS.libraryInner.y,
    });
  }

  return items;
}

export function getActionable(state: GameState): Actionable | null {
  if (state.mode !== 'playing') return null;
  let best: Actionable | null = null;
  let bestDist = INTERACT_RANGE;
  for (const item of listInteractables(state)) {
    const d = itemDistance(state, item);
    if (d <= bestDist) {
      best = item;
      bestDist = d;
    }
  }
  return best;
}
