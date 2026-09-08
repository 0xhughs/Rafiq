import { HINT_LABELS, INTERACT_RANGE } from './constants';
import { doorHint, FURNITURE, getMap, WORLD_POS } from './maps';
import type { Actionable, GameState } from './types';

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

export function robotPosition(state: GameState): { x: number; y: number } {
  if (state.encounter === 'help_accepted') {
    return { x: state.position.x - 32, y: state.position.y + 10 };
  }
  return WORLD_POS.robot;
}

function itemDistance(state: GameState, item: Actionable): number {
  if (item.id === 'dumpster') {
    const box = FURNITURE.street.dumpster;
    return distToRect(state.position.x, state.position.y, box.x, box.y, box.w, box.h);
  }
  return dist(state.position.x, state.position.y, item.x, item.y);
}

export function listInteractables(state: GameState): Actionable[] {
  const items: Actionable[] = [];
  const map = getMap(state.map);

  if (state.map === 'apartment' && state.trash === 'home') {
    items.push({
      id: 'trash',
      label: HINT_LABELS.trash,
      x: WORLD_POS.trash.x,
      y: WORLD_POS.trash.y,
    });
  }

  items.push({
    id: 'door',
    label: doorHint(state.map),
    x: map.door.x,
    y: map.door.y,
  });

  if (state.map === 'street' && state.trash === 'carried') {
    items.push({
      id: 'dumpster',
      label: HINT_LABELS.dumpster,
      x: WORLD_POS.dumpster.x,
      y: WORLD_POS.dumpster.y,
    });
  }

  const robotVisible =
    state.encounter !== 'unseen' &&
    (state.map === 'street' || state.encounter === 'help_accepted');
  if (robotVisible) {
    const robot = robotPosition(state);
    items.push({
      id: 'robot',
      label: HINT_LABELS.robot,
      x: robot.x,
      y: robot.y,
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

