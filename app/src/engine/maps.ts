import { HINT_LABELS, TILE } from './constants';
import type { MapId, Vec2 } from './types';

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
  | 'robot';

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

const SOLID_LETTERS = new Set(['#', 'B', 'T', 'K', 'M', 'C']);

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
  '####################',
  'D' + '.'.repeat(18) + '#',
  '#' + '.'.repeat(18) + '#',
  '#' + '.'.repeat(13) + 'MMM' + '.'.repeat(2) + '#',
  '#' + '.'.repeat(13) + 'MMM' + '.'.repeat(2) + '#',
  '#' + '.'.repeat(11) + 'o' + '.'.repeat(6) + '#',
  '#' + '.'.repeat(3) + 'CCCCC' + '.'.repeat(10) + '#',
  '#' + '.'.repeat(3) + 'CCCCC' + '.'.repeat(10) + '#',
  '#' + '.'.repeat(18) + '#',
  '#' + '.'.repeat(18) + '#',
  '#' + '.'.repeat(18) + '#',
  '####################',
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

function cellCenter(col: number, row: number): Vec2 {
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

function parseMap(id: MapId, legend: string[]): MapDef {
  assertLegend(id, legend);
  const tiles = legend.map((row) => Array.from(row));
  const rows = tiles.length;
  const cols = tiles[0].length;
  const solid = tiles.map((row) => row.map((letter) => isSolidLetter(letter)));
  const spawnCell = id === 'apartment' ? findLetter(tiles, 'S') : findLetter(tiles, 'D');
  const doorCell = findLetter(tiles, 'D');
  let entryFromOther: Vec2;
  if (id === 'apartment') {
    entryFromOther = cellCenter(doorCell.col - 1, doorCell.row);
  } else {
    entryFromOther = cellCenter(doorCell.col + 1, doorCell.row);
  }
  const spawn =
    id === 'apartment' ? cellCenter(spawnCell.col, spawnCell.row) : entryFromOther;
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

export const APARTMENT = parseMap('apartment', APARTMENT_LEGEND);
export const STREET = parseMap('street', STREET_LEGEND);

export const MAPS: Record<MapId, MapDef> = {
  apartment: APARTMENT,
  street: STREET,
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
    case 'D':
      return 'door';
    case 'S':
      return 'spawn';
    case 'g':
      return 'trash';
    case 'o':
      return 'robot';
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
    walls: collectKind(STREET, ['#']),
  },
};

export const WORLD_POS = {
  trash: cellCenter(findLetter(APARTMENT.tiles, 'g').col, findLetter(APARTMENT.tiles, 'g').row),
  robot: cellCenter(findLetter(STREET.tiles, 'o').col, findLetter(STREET.tiles, 'o').row),
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
};

export function doorHint(map: MapId): string {
  return map === 'apartment' ? HINT_LABELS.doorExit : HINT_LABELS.doorEnter;
}
