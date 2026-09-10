import { HINT_LABELS, INTERACT_RANGE } from './constants';
import {
  archiveDoorHint,
  doorHint,
  FURNITURE,
  libraryDoorHint,
  newsroomDoorHint,
  festivalDoorHint,
  parcelDoorHint,
  portalLetterPos,
  portalsOnMap,
  shopDoorHint,
  workshopDoorHint,
  WORLD_POS,
} from './maps';
import { clerkVisible, editorVisible, officerVisible, isCompanion, librarianVisible, managerVisible, neighborVisible, npcPosition, robotVisible, shopkeeperVisible } from './npc';
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

function workshopRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const room = FURNITURE.workshop;
  switch (id) {
    case 'need_slip':
      return room.need;
    case 'extras_slip':
      return room.extras;
    case 'brief_desk':
      return room.brief;
    case 'builder_bench':
      return room.builder;
    case 'result_check':
      return room.result;
    case 'appointment_board':
      return room.board;
    case 'kiosk_docs':
      return room.docs;
    case 'kiosk_vault':
      return room.vault;
    case 'kiosk_face':
      return room.kiosk;
    case 'lab_terminal':
      return room.lab;
    case 'lab_prod':
      return room.prod;
    case 'agent_console':
      return room.console;
    case 'agent_board':
      return room.neighborNotice;
    case 'bridge_host':
      return room.connector;
    case 'bridge_browser':
      return room.civicBrowser;
    case 'skill_bench':
      return room.skillDesk;
    case 'skill_clock':
      return room.hallClock;
    case 'approve_desk':
      return room.approvalDesk;
    case 'decision_desk':
      return room.personalCase;
    case 'crew_desk':
      return room.crewTable;
    case 'quality_desk':
      return room.qualityBench;
    case 'path_desk':
      return room.pathTable;
    case 'seal_desk':
      return room.sealBench;
    default:
      return null;
  }
}

function festivalRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const room = FURNITURE.festival;
  switch (id) {
    case 'stock_table':
      return room.table;
    case 'receipts_desk':
      return room.receipts;
    case 'reconcile_desk':
      return room.reconcile;
    case 'policy_board':
      return room.policy;
    case 'robot_cover':
      return room.cover;
    case 'submit_desk':
      return room.submit;
    default:
      return null;
  }
}

function newsroomRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const room = FURNITURE.newsroom;
  switch (id) {
    case 'source_bulletin':
      return room.bulletin;
    case 'source_poster':
      return room.poster;
    case 'compare_desk':
      return room.compare;
    case 'clipping_board':
      return room.clipping;
    case 'original_drawer':
      return room.original;
    case 'draft_table':
      return room.draft;
    case 'voice_desk':
      return room.voice;
    case 'letter_desk':
      return room.letter;
    default:
      return null;
  }
}

function archiveRect(id: InteractableId): { x: number; y: number; w: number; h: number } | null {
  const room = FURNITURE.archive;
  switch (id) {
    case 'context_bench':
      return room.bench;
    case 'notes_crate':
      return room.notes;
    case 'community_file':
      return room.file;
    case 'pack_table':
      return room.pack;
    case 'spec_case':
      return room.spec;
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
  const rect =
    shopRect(item.id) ??
    parcelRect(item.id) ??
    archiveRect(item.id) ??
    newsroomRect(item.id) ??
    festivalRect(item.id) ??
    workshopRect(item.id);
  if (rect) {
    return distToRect(state.position.x, state.position.y, rect.x, rect.y, rect.w, rect.h);
  }
  return dist(state.position.x, state.position.y, item.x, item.y);
}

function portalHint(id: InteractableId, map: GameState['map']): string {
  if (id === 'door') return doorHint(map);
  if (id === 'shop_door') return shopDoorHint(map);
  if (id === 'parcel_door') return parcelDoorHint(map);
  if (id === 'library_inner') return archiveDoorHint(map);
  if (id === 'newsroom_door') return newsroomDoorHint(map);
  if (id === 'festival_door') return festivalDoorHint(map);
  if (id === 'workshop_door') return workshopDoorHint(map);
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
      label:
        state.pathQuest.restored && state.passportQuest.thanksHeard
          ? HINT_LABELS.robotPassport
          : HINT_LABELS.robot,
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

  if (librarianVisible(state)) {
    const librarian = npcPosition(state, 'librarian');
    items.push({
      id: 'librarian',
      label: HINT_LABELS.librarian,
      x: librarian.x,
      y: librarian.y,
    });
  }

  if (editorVisible(state)) {
    const editor = npcPosition(state, 'editor');
    items.push({
      id: 'editor',
      label: HINT_LABELS.editor,
      x: editor.x,
      y: editor.y,
    });
  }

  if (officerVisible(state)) {
    const officer = npcPosition(state, 'officer');
    items.push({
      id: 'officer',
      label: HINT_LABELS.officer,
      x: officer.x,
      y: officer.y,
    });
  }

  if (managerVisible(state)) {
    const manager = npcPosition(state, 'manager');
    items.push({
      id: 'manager',
      label: HINT_LABELS.manager,
      x: manager.x,
      y: manager.y,
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

  if (state.map === 'archive' && state.parcelQuest.commsRepaired) {
    items.push(
      {
        id: 'context_bench',
        label: HINT_LABELS.contextBench,
        x: WORLD_POS.contextBench.x,
        y: WORLD_POS.contextBench.y,
      },
      {
        id: 'notes_crate',
        label: HINT_LABELS.notesCrate,
        x: WORLD_POS.notesCrate.x,
        y: WORLD_POS.notesCrate.y,
      },
      {
        id: 'community_file',
        label: HINT_LABELS.communityFile,
        x: WORLD_POS.communityFile.x,
        y: WORLD_POS.communityFile.y,
      },
      {
        id: 'pack_table',
        label: HINT_LABELS.packTable,
        x: WORLD_POS.packTable.x,
        y: WORLD_POS.packTable.y,
      },
      {
        id: 'spec_case',
        label: HINT_LABELS.specCase,
        x: WORLD_POS.specCase.x,
        y: WORLD_POS.specCase.y,
      },
    );
  }

  if (state.map === 'newsroom') {
    items.push(
      {
        id: 'source_bulletin',
        label: HINT_LABELS.sourceBulletin,
        x: WORLD_POS.sourceBulletin.x,
        y: WORLD_POS.sourceBulletin.y,
      },
      {
        id: 'source_poster',
        label: HINT_LABELS.sourcePoster,
        x: WORLD_POS.sourcePoster.x,
        y: WORLD_POS.sourcePoster.y,
      },
      {
        id: 'compare_desk',
        label: HINT_LABELS.compareDesk,
        x: WORLD_POS.compareDesk.x,
        y: WORLD_POS.compareDesk.y,
      },
      {
        id: 'clipping_board',
        label: HINT_LABELS.clippingBoard,
        x: WORLD_POS.clippingBoard.x,
        y: WORLD_POS.clippingBoard.y,
      },
      {
        id: 'original_drawer',
        label: HINT_LABELS.originalDrawer,
        x: WORLD_POS.originalDrawer.x,
        y: WORLD_POS.originalDrawer.y,
      },
      {
        id: 'draft_table',
        label: HINT_LABELS.draftTable,
        x: WORLD_POS.draftTable.x,
        y: WORLD_POS.draftTable.y,
      },
      {
        id: 'voice_desk',
        label: HINT_LABELS.voiceDesk,
        x: WORLD_POS.voiceDesk.x,
        y: WORLD_POS.voiceDesk.y,
      },
      {
        id: 'letter_desk',
        label: HINT_LABELS.letterDesk,
        x: WORLD_POS.letterDesk.x,
        y: WORLD_POS.letterDesk.y,
      },
    );
  }

  if (state.map === 'festival') {
    items.push(
      {
        id: 'stock_table',
        label: HINT_LABELS.stockTable,
        x: WORLD_POS.stockTable.x,
        y: WORLD_POS.stockTable.y,
      },
      {
        id: 'receipts_desk',
        label: HINT_LABELS.receiptsDesk,
        x: WORLD_POS.receiptsDesk.x,
        y: WORLD_POS.receiptsDesk.y,
      },
      {
        id: 'reconcile_desk',
        label: HINT_LABELS.reconcileDesk,
        x: WORLD_POS.reconcileDesk.x,
        y: WORLD_POS.reconcileDesk.y,
      },
      {
        id: 'policy_board',
        label: HINT_LABELS.policyBoard,
        x: WORLD_POS.policyBoard.x,
        y: WORLD_POS.policyBoard.y,
      },
      {
        id: 'robot_cover',
        label: HINT_LABELS.robotCover,
        x: WORLD_POS.robotCover.x,
        y: WORLD_POS.robotCover.y,
      },
      {
        id: 'submit_desk',
        label: HINT_LABELS.submitDesk,
        x: WORLD_POS.submitDesk.x,
        y: WORLD_POS.submitDesk.y,
      },
    );
  }

  if (state.map === 'workshop') {
    items.push(
      {
        id: 'need_slip',
        label: HINT_LABELS.needSlip,
        x: WORLD_POS.needSlip.x,
        y: WORLD_POS.needSlip.y,
      },
      {
        id: 'extras_slip',
        label: HINT_LABELS.extrasSlip,
        x: WORLD_POS.extrasSlip.x,
        y: WORLD_POS.extrasSlip.y,
      },
      {
        id: 'brief_desk',
        label: HINT_LABELS.briefDesk,
        x: WORLD_POS.briefDesk.x,
        y: WORLD_POS.briefDesk.y,
      },
      {
        id: 'builder_bench',
        label: HINT_LABELS.builderBench,
        x: WORLD_POS.builderBench.x,
        y: WORLD_POS.builderBench.y,
      },
      {
        id: 'result_check',
        label: HINT_LABELS.resultCheck,
        x: WORLD_POS.resultCheck.x,
        y: WORLD_POS.resultCheck.y,
      },
      {
        id: 'appointment_board',
        label: HINT_LABELS.appointmentBoard,
        x: WORLD_POS.appointmentBoard.x,
        y: WORLD_POS.appointmentBoard.y,
      },
    );
  }

  if (state.map === 'workshop' && state.workshopQuest.servicePosted) {
    items.push(
      {
        id: 'kiosk_docs',
        label: HINT_LABELS.kioskDocs,
        x: WORLD_POS.kioskDocs.x,
        y: WORLD_POS.kioskDocs.y,
      },
      {
        id: 'kiosk_vault',
        label: HINT_LABELS.kioskVault,
        x: WORLD_POS.kioskVault.x,
        y: WORLD_POS.kioskVault.y,
      },
      {
        id: 'kiosk_face',
        label: HINT_LABELS.kioskFace,
        x: WORLD_POS.kioskFace.x,
        y: WORLD_POS.kioskFace.y,
      },
    );
  }

  if (state.map === 'workshop' && state.kioskQuest.kioskReady) {
    items.push(
      {
        id: 'lab_terminal',
        label: HINT_LABELS.labTerminal,
        x: WORLD_POS.labTerminal.x,
        y: WORLD_POS.labTerminal.y,
      },
      {
        id: 'lab_prod',
        label: HINT_LABELS.labProd,
        x: WORLD_POS.labProd.x,
        y: WORLD_POS.labProd.y,
      },
    );
  }

  if (state.map === 'workshop' && state.labQuest.labReady) {
    items.push(
      {
        id: 'agent_console',
        label: HINT_LABELS.agentConsole,
        x: WORLD_POS.agentConsole.x,
        y: WORLD_POS.agentConsole.y,
      },
      {
        id: 'agent_board',
        label: HINT_LABELS.agentBoard,
        x: WORLD_POS.agentBoard.x,
        y: WORLD_POS.agentBoard.y,
      },
    );
  }

  if (state.map === 'workshop' && state.agentQuest.agentReady) {
    items.push(
      {
        id: 'bridge_host',
        label: HINT_LABELS.bridgeHost,
        x: WORLD_POS.bridgeHost.x,
        y: WORLD_POS.bridgeHost.y,
      },
      {
        id: 'bridge_browser',
        label: HINT_LABELS.bridgeBrowser,
        x: WORLD_POS.bridgeBrowser.x,
        y: WORLD_POS.bridgeBrowser.y,
      },
    );
  }

  if (state.map === 'workshop' && state.bridgeQuest.bridgeReady) {
    items.push(
      {
        id: 'skill_bench',
        label: HINT_LABELS.skillBench,
        x: WORLD_POS.skillBench.x,
        y: WORLD_POS.skillBench.y,
      },
      {
        id: 'skill_clock',
        label: HINT_LABELS.skillClock,
        x: WORLD_POS.skillClock.x,
        y: WORLD_POS.skillClock.y,
      },
    );
  }

  if (state.map === 'workshop' && state.skillQuest.skillReady) {
    items.push(
      {
        id: 'approve_desk',
        label: HINT_LABELS.approveDesk,
        x: WORLD_POS.approveDesk.x,
        y: WORLD_POS.approveDesk.y,
      },
      {
        id: 'decision_desk',
        label: HINT_LABELS.decisionDesk,
        x: WORLD_POS.decisionDesk.x,
        y: WORLD_POS.decisionDesk.y,
      },
    );
  }

  if (state.map === 'workshop' && state.approvalQuest.approvalReady) {
    items.push(
      {
        id: 'crew_desk',
        label: HINT_LABELS.crewDesk,
        x: WORLD_POS.crewDesk.x,
        y: WORLD_POS.crewDesk.y,
      },
      {
        id: 'quality_desk',
        label: HINT_LABELS.qualityDesk,
        x: WORLD_POS.qualityDesk.x,
        y: WORLD_POS.qualityDesk.y,
      },
    );
  }

  if (state.map === 'workshop' && state.crewQuest.crewReady) {
    items.push(
      {
        id: 'path_desk',
        label: HINT_LABELS.pathDesk,
        x: WORLD_POS.pathDesk.x,
        y: WORLD_POS.pathDesk.y,
      },
      {
        id: 'seal_desk',
        label: HINT_LABELS.sealDesk,
        x: WORLD_POS.sealDesk.x,
        y: WORLD_POS.sealDesk.y,
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
