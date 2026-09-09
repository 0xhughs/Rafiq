import { HINT_LABELS, INTERACT_RANGE } from './constants';
import {
  doorHint,
  FURNITURE,
  libraryDoorHint,
  parcelDoorHint,
  portalLetterPos,
  portalsOnMap,
  shopDoorHint,
  WORLD_POS,
} from './maps';
import { clerkVisible, isCompanion, neighborVisible, npcPosition, robotVisible, shopkeeperVisible } from './npc';
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

function shopRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const shop = FURNITURE.shop;
  switch (id) {
    case 'shelf_west': {
      const cells = shop.westShelves;
      if (cells.length === 0) return null;
      const minX = Math.min(...cells.map((c) => c.x));
      const minY = Math.min(...cells.map((c) => c.y));
      const maxX = Math.max(...cells.map((c) => c.x + c.w));
      const maxY = Math.max(...cells.map((c) => c.y + c.h));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'shelf_east': {
      const cells = shop.eastShelves;
      if (cells.length === 0) return null;
      const minX = Math.min(...cells.map((c) => c.x));
      const minY = Math.min(...cells.map((c) => c.y));
      const maxX = Math.max(...cells.map((c) => c.x + c.w));
      const maxY = Math.max(...cells.map((c) => c.y + c.h));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'notice_board':
      return shop.notice;
    case 'price_list':
      return shop.priceList;
    case 'calculator':
      return shop.calculator;
    case 'crate':
      return shop.crate;
    default:
      return null;
  }
}

function parcelRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const office = FURNITURE.parcel;
  switch (id) {
    case 'hold_west': {
      const cells = office.westShelves;
      if (cells.length === 0) return null;
      const minX = Math.min(...cells.map((c) => c.x));
      const minY = Math.min(...cells.map((c) => c.y));
      const maxX = Math.max(...cells.map((c) => c.x + c.w));
      const maxY = Math.max(...cells.map((c) => c.y + c.h));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'hold_east': {
      const cells = office.eastShelves;
      if (cells.length === 0) return null;
      const minX = Math.min(...cells.map((c) => c.x));
      const minY = Math.min(...cells.map((c) => c.y));
      const maxX = Math.max(...cells.map((c) => c.x + c.w));
      const maxY = Math.max(...cells.map((c) => c.y + c.h));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'hold_board':
      return office.board;
    case 'pay_window':
      return office.pay;
    case 'instruction_desk':
      return office.desk;
    default:
      return null;
  }
}

function itemDistance(state: GameState, item: Actionable): number {
  if (item.id === 'dumpster') {
    const box = FURNITURE.street.dumpster;
    return distToRect(state.position.x, state.position.y, box.x, box.y, box.w, box.h);
  }
  const rect = shopRect(item.id) ?? parcelRect(item.id);
  if (rect) {
    return distToRect(state.position.x, state.position.y, rect.x, rect.y, rect.w, rect.h);
  }
  return dist(state.position.x, state.position.y, item.x, item.y);
}

function portalHint(id: InteractableId, map: GameState['map']): string {
  if (id === 'door') return doorHint(map);
  if (id === 'shop_door') return shopDoorHint(map);
  if (id === 'parcel_door') return parcelDoorHint(map);
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

  if (clerkVisible(state)) {
    const clerk = npcPosition(state, 'clerk');
    items.push({
      id: 'clerk',
      label: HINT_LABELS.clerk,
      x: clerk.x,
      y: clerk.y,
    });
  }

  if (state.map === 'shop' && state.encounter === 'help_accepted') {
    items.push(
      { id: 'shelf_west', label: HINT_LABELS.shelfWest, x: WORLD_POS.shelfWest.x, y: WORLD_POS.shelfWest.y },
      { id: 'shelf_east', label: HINT_LABELS.shelfEast, x: WORLD_POS.shelfEast.x, y: WORLD_POS.shelfEast.y },
      { id: 'price_list', label: HINT_LABELS.priceList, x: WORLD_POS.priceList.x, y: WORLD_POS.priceList.y },
      { id: 'notice_board', label: HINT_LABELS.noticeBoard, x: WORLD_POS.noticeBoard.x, y: WORLD_POS.noticeBoard.y },
      { id: 'calculator', label: HINT_LABELS.calculator, x: WORLD_POS.calculator.x, y: WORLD_POS.calculator.y },
      { id: 'crate', label: HINT_LABELS.crate, x: WORLD_POS.crate.x, y: WORLD_POS.crate.y },
    );
  }

  if (state.map === 'library') {
    items.push({
      id: 'library_inner',
      label: HINT_LABELS.libraryInner,
      x: WORLD_POS.libraryInner.x,
      y: WORLD_POS.libraryInner.y,
    });
  }

  if (state.map === 'parcel' && state.shopQuest.phase === 'helped') {
    items.push(
      { id: 'hold_west', label: HINT_LABELS.holdWest, x: WORLD_POS.holdWest.x, y: WORLD_POS.holdWest.y },
      { id: 'hold_east', label: HINT_LABELS.holdEast, x: WORLD_POS.holdEast.x, y: WORLD_POS.holdEast.y },
      { id: 'hold_board', label: HINT_LABELS.holdBoard, x: WORLD_POS.holdBoard.x, y: WORLD_POS.holdBoard.y },
      { id: 'pay_window', label: HINT_LABELS.payWindow, x: WORLD_POS.payWindow.x, y: WORLD_POS.payWindow.y },
      {
        id: 'instruction_desk',
        label: HINT_LABELS.instructionDesk,
        x: WORLD_POS.instructionDesk.x,
        y: WORLD_POS.instructionDesk.y,
      },
    );
  }

  return items;
}

export function getActionable(state: GameState): Actionable | null {
  if (state.mode !== 'playing') return null;
  let best: Actionable | null = null;
  let bestDist = INTERACT_RANGE;
  for (const item of listInteractables(state)) {
    const d = itemDistance(state, item);
    if (d > bestDist) continue;
    if (best && item.id === 'robot' && isCompanion(state) && best.id !== 'robot') continue;
    if (!best || d < bestDist || (best.id === 'robot' && item.id !== 'robot')) {
      best = item;
      bestDist = d;
    }
  }
  return best;
}
