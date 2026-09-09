import { HINT_LABELS, TILE } from './constants';
import type { Cardinal, Facing, MapId, PortalId, Vec2 } from './types';

export type CellKind =
  | 'wall'
  | 'floor'
  | 'bed'
  | 'table'
  | 'kitchen'
  | 'rug'
  | 'dumpster'
  | 'shop'
  | 'door'
  | 'spawn'
  | 'trash'
  | 'robot'
  | 'counter'
  | 'shelf'
  | 'library'
  | 'neighbor';

export interface CellRect {
  kind: CellKind;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapDef {
  id: MapId;
  cols: number;
  rows: number;
  legend: string[];
  tiles: string[][];
  solid: boolean[][];
  spawn: Vec2;
  door: Vec2;
  entryFromOther: Vec2;
  pixelWidth: number;
  pixelHeight: number;
}

export interface PortalEnd {
  map: MapId;
  letter: string;
  spawnDir: Cardinal;
  arriveFacing: Facing;
}

export interface PortalDef {
  id: PortalId;
  interactable: 'door' | 'shop_door' | 'library_door';
  requiresHelp: boolean;
  lockedNode: 'locked_shop' | 'locked_library' | null;
  ends: [PortalEnd, PortalEnd];
}

const SOLID_LETTERS = new Set(['#', 'B', 'T', 'K', 'M', 'C', 'H', 'L', 'W']);

const APARTMENT_LEGEND = [
  '################',
  '#BBBB......KKKK#',
  '#BBBB.S....KKKK#',
  '#..............#',
  '#..rrrr..TTTT..#',
  '#..rrrr..TTTT..#',
  '#..............#',
  '#............g.#',
  '#..............#',
  '#..............D',
  '#..............#',
  '################',
];

const STREET_LEGEND = [
  '#'.repeat(28),
  `D${'.'.repeat(26)}#`,
  `#${'.'.repeat(26)}#`,
  `#${'.'.repeat(13)}MMM${'.'.repeat(10)}#`,
  `#${'.'.repeat(13)}MMM${'.'.repeat(10)}#`,
  `#${'.'.repeat(11)}o${'.'.repeat(14)}#`,
  `#${'.'.repeat(3)}CCCCC${'.'.repeat(12)}LLLL${'.'.repeat(2)}#`,
  `#${'.'.repeat(3)}CCCCC${'.'.repeat(12)}LLLL${'.'.repeat(2)}#`,
  `#${'.'.repeat(5)}P${'.'.repeat(15)}I${'.'.repeat(4)}#`,
  `#${'.'.repeat(11)}N${'.'.repeat(14)}#`,
  `#${'.'.repeat(26)}#`,
  '#'.repeat(28),
];

const SHOP_LEGEND = [
  '############',
  '#WW......WW#',
  '#..HHHHHH..#',
  '#WW......WW#',
  '#..........#',
  '#.....d....#',
  '#..........#',
  '############',
];

const LIBRARY_LEGEND = [
  '##############',
  '#............#',
  '#..WWWWWWWW..#',
  '#..WWWWWWWW..#',
  '#.....F......#',
  '#............#',
  '#.....i......#',
  '#............#',
  '#............#',
  '##############',
];

function assertLegend(name: string, rows: string[]): void {
  if (rows.length === 0) {
    throw new Error(`${name} legend is empty`);
  }
  const cols = rows[0].length;
  for (const row of rows) {
    if (row.length !== cols) {
      throw new Error(`${name} legend is ragged`);
    }
  }
}

function isSolidLetter(letter: string): boolean {
  return SOLID_LETTERS.has(letter);
}

export function cellCenter(col: number, row: number): Vec2 {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

function findLetter(tiles: string[][], letter: string): { col: number; row: number } {
  for (let row = 0; row < tiles.length; row += 1) {
    for (let col = 0; col < tiles[row].length; col += 1) {
      if (tiles[row][col] === letter) {
        return { col, row };
      }
    }
  }
  throw new Error(`Missing map letter ${letter}`);
}

function offsetCell(
  col: number,
  row: number,
  dir: Cardinal,
): { col: number; row: number } {
  switch (dir) {
    case 'west':
      return { col: col - 1, row };
    case 'east':
      return { col: col + 1, row };
    case 'north':
      return { col, row: row - 1 };
    case 'south':
      return { col, row: row + 1 };
    default:
      return { col, row };
  }
}

function parseMap(
  id: MapId,
  legend: string[],
  options: { spawnLetter?: string; doorLetter: string; entryDir: Cardinal },
): MapDef {
  assertLegend(id, legend);
  const tiles = legend.map((row) => Array.from(row));
  const rows = tiles.length;
  const cols = tiles[0].length;
  const solid = tiles.map((row) => row.map((letter) => isSolidLetter(letter)));
  const doorCell = findLetter(tiles, options.doorLetter);
  const entryCell = offsetCell(doorCell.col, doorCell.row, options.entryDir);
  const entryFromOther = cellCenter(entryCell.col, entryCell.row);
  const spawn = options.spawnLetter
    ? cellCenter(findLetter(tiles, options.spawnLetter).col, findLetter(tiles, options.spawnLetter).row)
    : entryFromOther;
  return {
    id,
    cols,
    rows,
    legend,
    tiles,
    solid,
    spawn,
    door: cellCenter(doorCell.col, doorCell.row),
    entryFromOther,
    pixelWidth: cols * TILE,
    pixelHeight: rows * TILE,
  };
}

export const APARTMENT = parseMap('apartment', APARTMENT_LEGEND, {
  spawnLetter: 'S',
  doorLetter: 'D',
  entryDir: 'west',
});

export const STREET = parseMap('street', STREET_LEGEND, {
  doorLetter: 'D',
  entryDir: 'east',
});

export const SHOP = parseMap('shop', SHOP_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const LIBRARY = parseMap('library', LIBRARY_LEGEND, {
  doorLetter: 'i',
  entryDir: 'north',
});

export const MAPS: Record<MapId, MapDef> = {
  apartment: APARTMENT,
  street: STREET,
  shop: SHOP,
  library: LIBRARY,
};

export function getMap(id: MapId): MapDef {
  return MAPS[id];
}

function collectKind(map: MapDef, letters: string[]): CellRect[] {
  const rects: CellRect[] = [];
  for (let row = 0; row < map.rows; row += 1) {
    for (let col = 0; col < map.cols; col += 1) {
      const letter = map.tiles[row][col];
      if (!letters.includes(letter)) continue;
      rects.push({
        kind: kindFromLetter(letter),
        col,
        row,
        x: col * TILE,
        y: row * TILE,
        w: TILE,
        h: TILE,
      });
    }
  }
  return rects;
}

function kindFromLetter(letter: string): CellKind {
  switch (letter) {
    case '#':
      return 'wall';
    case 'B':
      return 'bed';
    case 'T':
      return 'table';
    case 'K':
      return 'kitchen';
    case 'r':
      return 'rug';
    case 'M':
      return 'dumpster';
    case 'C':
      return 'shop';
    case 'L':
      return 'library';
    case 'D':
    case 'd':
    case 'P':
    case 'I':
    case 'i':
    case 'F':
      return 'door';
    case 'S':
      return 'spawn';
    case 'g':
      return 'trash';
    case 'o':
      return 'robot';
    case 'H':
      return 'counter';
    case 'W':
      return 'shelf';
    case 'N':
      return 'neighbor';
    default:
      return 'floor';
  }
}

export function mergeRects(cells: CellRect[]): { x: number; y: number; w: number; h: number }[] {
  if (cells.length === 0) return [];
  const minX = Math.min(...cells.map((c) => c.x));
  const minY = Math.min(...cells.map((c) => c.y));
  const maxX = Math.max(...cells.map((c) => c.x + c.w));
  const maxY = Math.max(...cells.map((c) => c.y + c.h));
  return [{ x: minX, y: minY, w: maxX - minX, h: maxY - minY }];
}

export const FURNITURE = {
  apartment: {
    bed: mergeRects(collectKind(APARTMENT, ['B']))[0],
    table: mergeRects(collectKind(APARTMENT, ['T']))[0],
    kitchen: mergeRects(collectKind(APARTMENT, ['K']))[0],
    rug: mergeRects(collectKind(APARTMENT, ['r']))[0],
    walls: collectKind(APARTMENT, ['#']),
  },
  street: {
    dumpster: mergeRects(collectKind(STREET, ['M']))[0],
    shop: mergeRects(collectKind(STREET, ['C']))[0],
    library: mergeRects(collectKind(STREET, ['L']))[0],
    walls: collectKind(STREET, ['#']),
  },
  shop: {
    counter: mergeRects(collectKind(SHOP, ['H']))[0],
    shelves: collectKind(SHOP, ['W']),
    walls: collectKind(SHOP, ['#']),
  },
  library: {
    building: mergeRects(collectKind(LIBRARY, ['W']))[0],
    walls: collectKind(LIBRARY, ['#']),
  },
};

function letterCenter(map: MapDef, letter: string): Vec2 {
  const found = findLetter(map.tiles, letter);
  return cellCenter(found.col, found.row);
}

function letterOffsetCenter(map: MapDef, letter: string, dir: Cardinal): Vec2 {
  const found = findLetter(map.tiles, letter);
  const next = offsetCell(found.col, found.row, dir);
  return cellCenter(next.col, next.row);
}

export const PORTALS: PortalDef[] = [
  {
    id: 'home',
    interactable: 'door',
    requiresHelp: false,
    lockedNode: null,
    ends: [
      { map: 'apartment', letter: 'D', spawnDir: 'west', arriveFacing: 'left' },
      { map: 'street', letter: 'D', spawnDir: 'east', arriveFacing: 'right' },
    ],
  },
  {
    id: 'shop',
    interactable: 'shop_door',
    requiresHelp: true,
    lockedNode: 'locked_shop',
    ends: [
      { map: 'street', letter: 'P', spawnDir: 'south', arriveFacing: 'down' },
      { map: 'shop', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
  {
    id: 'library',
    interactable: 'library_door',
    requiresHelp: true,
    lockedNode: 'locked_library',
    ends: [
      { map: 'street', letter: 'I', spawnDir: 'south', arriveFacing: 'down' },
      { map: 'library', letter: 'i', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
];

export function portalLetterPos(mapId: MapId, letter: string): Vec2 {
  return letterCenter(getMap(mapId), letter);
}

export function portalSpawn(mapId: MapId, letter: string, dir: Cardinal): Vec2 {
  return letterOffsetCenter(getMap(mapId), letter, dir);
}

export function portalsOnMap(mapId: MapId): { portal: PortalDef; end: PortalEnd; other: PortalEnd }[] {
  const found: { portal: PortalDef; end: PortalEnd; other: PortalEnd }[] = [];
  for (const portal of PORTALS) {
    const index = portal.ends.findIndex((end) => end.map === mapId);
    if (index < 0) continue;
    const end = portal.ends[index];
    const other = portal.ends[index === 0 ? 1 : 0];
    found.push({ portal, end, other });
  }
  return found;
}

export function destinationOf(portal: PortalDef, from: MapId): { map: MapId; position: Vec2; facing: Facing } {
  const fromEnd = portal.ends.find((end) => end.map === from);
  const toEnd = portal.ends.find((end) => end.map !== from);
  if (!fromEnd || !toEnd) {
    throw new Error(`Portal ${portal.id} missing end for ${from}`);
  }
  return {
    map: toEnd.map,
    position: portalSpawn(toEnd.map, toEnd.letter, toEnd.spawnDir),
    facing: toEnd.arriveFacing,
  };
}

export const WORLD_POS = {
  trash: letterCenter(APARTMENT, 'g'),
  robot: letterCenter(STREET, 'o'),
  dumpster: (() => {
    const box = FURNITURE.street.dumpster;
    return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
  })(),
  dumpsterApproach: (() => {
    const box = FURNITURE.street.dumpster;
    return { x: box.x - TILE / 2, y: box.y + box.h / 2 };
  })(),
  apartmentDoor: APARTMENT.door,
  streetDoor: STREET.door,
  apartmentSpawn: APARTMENT.spawn,
  westWallInside: cellCenter(1, 6),
  shopDoor: letterCenter(STREET, 'P'),
  libraryDoor: letterCenter(STREET, 'I'),
  shopExit: letterCenter(SHOP, 'd'),
  libraryExit: letterCenter(LIBRARY, 'i'),
  shopSpawn: SHOP.spawn,
  librarySpawn: LIBRARY.spawn,
  neighbor: letterCenter(STREET, 'N'),
  shopkeeper: cellCenter(6, 3),
  libraryInner: letterCenter(LIBRARY, 'F'),
  shopWestWallInside: cellCenter(1, 4),
  libraryWestWallInside: cellCenter(1, 5),
};

export function doorHint(map: MapId): string {
  return map === 'apartment' ? HINT_LABELS.doorExit : HINT_LABELS.doorEnter;
}

export function shopDoorHint(map: MapId): string {
  return map === 'shop' ? HINT_LABELS.shopExit : HINT_LABELS.shopEnter;
}

export function libraryDoorHint(map: MapId): string {
  return map === 'library' ? HINT_LABELS.libraryExit : HINT_LABELS.libraryEnter;
}
