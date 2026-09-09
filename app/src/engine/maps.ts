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
  | 'neighbor'
  | 'notice'
  | 'pricelist'
  | 'calculator'
  | 'crate'
  | 'parcel'
  | 'holdboard'
  | 'paywindow'
  | 'instruction'
  | 'file'
  | 'newsroom'
  | 'festival'
  | 'workshop';

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
  interactable: 'door' | 'shop_door' | 'library_door' | 'parcel_door' | 'library_inner' | 'newsroom_door' | 'festival_door' | 'workshop_door';
  requiresHelp: boolean;
  requiresShopHelped?: boolean;
  requiresCommsRepaired?: boolean;
  requiresArchiveSuccess?: boolean;
  requiresWorkshopLead?: boolean;
  requiresWorkshopMaterials?: boolean;
  lockedNode: 'locked_shop' | 'locked_library' | 'locked_parcel' | 'library_inner_locked' | 'locked_newsroom' | 'locked_festival' | 'locked_workshop' | null;
  ends: [PortalEnd, PortalEnd];
}

const SOLID_LETTERS = new Set(['#', 'B', 'T', 'K', 'M', 'C', 'H', 'L', 'W', 'n', 'p', 'c', 'k', 'Q', 'b', 'y', 's', 'f', 'A', 'u', 'x', 'z', 'm', 'j', 'v', 't', 'U', 'X', 'q', 'a', 'e', 'w', 'l', 'h']);

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

function eastExtend(row: string, east6: string): string {
  if (row.length !== 28) {
    throw new Error(`street row must start at 28, got ${row.length}`);
  }
  if (east6.length !== 6) {
    throw new Error(`east pad must be 6, got ${east6.length}`);
  }
  return `${row.slice(0, 27)}${east6}#`;
}

const STREET_LEGEND = [
  eastExtend('#'.repeat(28), '######'),
  eastExtend(`D${'.'.repeat(26)}#`, '......'),
  eastExtend(`#${'.'.repeat(26)}#`, '......'),
  eastExtend(`#${'.'.repeat(13)}MMM${'.'.repeat(10)}#`, '......'),
  eastExtend(`#${'.'.repeat(13)}MMM${'.'.repeat(10)}#`, '......'),
  eastExtend(`#${'.'.repeat(11)}o${'.'.repeat(14)}#`, '......'),
  eastExtend(`#${'.'.repeat(3)}CCCCC${'.'.repeat(4)}AAAA${'.'.repeat(4)}LLLL${'.'.repeat(2)}#`, 'QQQQ..'),
  eastExtend(`#${'.'.repeat(3)}CCCCC${'.'.repeat(4)}AAAA${'.'.repeat(4)}LLLL${'.'.repeat(2)}#`, 'QQQQ..'),
  eastExtend(`#${'.'.repeat(5)}P${'.'.repeat(7)}E${'.'.repeat(7)}I${'.'.repeat(4)}#`, '..R...'),
  eastExtend(`#${'.'.repeat(11)}N${'.'.repeat(14)}#`, '......'),
  eastExtend(`#${'.'.repeat(26)}#`, '......'),
  eastExtend(`#${'.'.repeat(26)}#`, '......'),
  eastExtend(`#${'.'.repeat(5)}G${'.'.repeat(10)}Y${'.'.repeat(9)}#`, '......'),
  eastExtend(`#${'.'.repeat(3)}UUUUU${'.'.repeat(6)}XXXXX${'.'.repeat(7)}#`, '######'),
  eastExtend(`#${'.'.repeat(3)}UUUUU${'.'.repeat(6)}XXXXX${'.'.repeat(7)}#`, '######'),
  eastExtend('#'.repeat(28), '######'),
];

const SHOP_LEGEND = [
  '################',
  '#WW....n.p...WW#',
  '#WW..........WW#',
  '#..HHHHHHHHc...#',
  '#..............#',
  '#k.............#',
  '#..............#',
  '#.......d......#',
  '#..............#',
  '################',
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

const PARCEL_LEGEND = [
  '################',
  '#WW....b.y...WW#',
  '#WW..........WW#',
  '#..HHHHHHHH....#',
  '#..............#',
  '#s.............#',
  '#..............#',
  '#.......d......#',
  '#..............#',
  '################',
];

const ARCHIVE_LEGEND = [
  '################',
  '#WW....b.....WW#',
  '#WW..........WW#',
  '#..HHHHHHHH....#',
  '#..............#',
  '#n.f......p.s..#',
  '#..............#',
  '#.......d......#',
  '#..............#',
  '################',
];

const NEWSROOM_LEGEND = [
  '################',
  '#WW....x.....WW#',
  '#WW..........WW#',
  '#..HHHHHHHH....#',
  '#..............#',
  '#u.z......m.j..#',
  '#k.v......t....#',
  '#.......d......#',
  '#..............#',
  '################',
];

const FESTIVAL_LEGEND = [
  '################',
  '#WW....x.....WW#',
  '#WW..........WW#',
  '#..HHHHHHHH....#',
  '#..............#',
  '#u.z......m.j..#',
  '#..........t...#',
  '#.......d......#',
  '#..............#',
  '################',
];

const WORKSHOP_LEGEND = [
  '################',
  '#WW..........WW#',
  '#WW..........WW#',
  '#..HHHHHHHH....#',
  '#...........e..#',
  '#u.z...a..m.j..#',
  '#k.q......t....#',
  '#.......d......#',
  '#..w..h...x.l..#',
  '################',
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

export const PARCEL = parseMap('parcel', PARCEL_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const ARCHIVE = parseMap('archive', ARCHIVE_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const NEWSROOM = parseMap('newsroom', NEWSROOM_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const FESTIVAL = parseMap('festival', FESTIVAL_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const WORKSHOP = parseMap('workshop', WORKSHOP_LEGEND, {
  doorLetter: 'd',
  entryDir: 'north',
});

export const MAPS: Record<MapId, MapDef> = {
  apartment: APARTMENT,
  street: STREET,
  shop: SHOP,
  library: LIBRARY,
  parcel: PARCEL,
  archive: ARCHIVE,
  newsroom: NEWSROOM,
  festival: FESTIVAL,
  workshop: WORKSHOP,
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
    case 'Q':
      return 'parcel';
    case 'A':
      return 'newsroom';
    case 'U':
      return 'festival';
    case 'X':
      return 'workshop';
    case 'D':
    case 'd':
    case 'P':
    case 'I':
    case 'i':
    case 'F':
    case 'R':
    case 'E':
    case 'G':
    case 'Y':
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
    case 'n':
      return 'notice';
    case 'p':
      return 'pricelist';
    case 'c':
      return 'calculator';
    case 'k':
      return 'crate';
    case 'b':
      return 'holdboard';
    case 'y':
      return 'paywindow';
    case 's':
      return 'instruction';
    case 'f':
      return 'file';
    case 'u':
    case 'z':
    case 'x':
    case 'm':
    case 'j':
    case 'v':
    case 't':
    case 'a':
    case 'e':
    case 'q':
    case 'w':
    case 'l':
    case 'h':
      return 'file';
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
    parcel: mergeRects(collectKind(STREET, ['Q']))[0],
    newsroom: mergeRects(collectKind(STREET, ['A']))[0],
    festival: mergeRects(collectKind(STREET, ['U']))[0],
    workshop: mergeRects(collectKind(STREET, ['X']))[0],
    walls: collectKind(STREET, ['#']),
  },
  shop: {
    counter: mergeRects(collectKind(SHOP, ['H', 'c']))[0],
    shelves: collectKind(SHOP, ['W']),
    westShelves: collectKind(SHOP, ['W']).filter((cell) => cell.col < 4),
    eastShelves: collectKind(SHOP, ['W']).filter((cell) => cell.col > 8),
    notice: mergeRects(collectKind(SHOP, ['n']))[0],
    priceList: mergeRects(collectKind(SHOP, ['p']))[0],
    calculator: mergeRects(collectKind(SHOP, ['c']))[0],
    crate: mergeRects(collectKind(SHOP, ['k']))[0],
    walls: collectKind(SHOP, ['#']),
  },
  library: {
    building: mergeRects(collectKind(LIBRARY, ['W']))[0],
    walls: collectKind(LIBRARY, ['#']),
  },
  parcel: {
    counter: mergeRects(collectKind(PARCEL, ['H']))[0],
    westShelves: collectKind(PARCEL, ['W']).filter((cell) => cell.col < 4),
    eastShelves: collectKind(PARCEL, ['W']).filter((cell) => cell.col > 8),
    board: mergeRects(collectKind(PARCEL, ['b']))[0],
    pay: mergeRects(collectKind(PARCEL, ['y']))[0],
    desk: mergeRects(collectKind(PARCEL, ['s']))[0],
    walls: collectKind(PARCEL, ['#']),
  },
  archive: {
    shelves: collectKind(ARCHIVE, ['W']),
    westShelves: collectKind(ARCHIVE, ['W']).filter((cell) => cell.col < 4),
    eastShelves: collectKind(ARCHIVE, ['W']).filter((cell) => cell.col > 8),
    counter: mergeRects(collectKind(ARCHIVE, ['H']))[0],
    bench: mergeRects(collectKind(ARCHIVE, ['b']))[0],
    notes: mergeRects(collectKind(ARCHIVE, ['n']))[0],
    file: mergeRects(collectKind(ARCHIVE, ['f']))[0],
    pack: mergeRects(collectKind(ARCHIVE, ['p']))[0],
    spec: mergeRects(collectKind(ARCHIVE, ['s']))[0],
    walls: collectKind(ARCHIVE, ['#']),
  },
  newsroom: {
    shelves: collectKind(NEWSROOM, ['W']),
    counter: mergeRects(collectKind(NEWSROOM, ['H']))[0],
    clipping: mergeRects(collectKind(NEWSROOM, ['x']))[0],
    bulletin: mergeRects(collectKind(NEWSROOM, ['u']))[0],
    poster: mergeRects(collectKind(NEWSROOM, ['z']))[0],
    compare: mergeRects(collectKind(NEWSROOM, ['m']))[0],
    original: mergeRects(collectKind(NEWSROOM, ['j']))[0],
    draft: mergeRects(collectKind(NEWSROOM, ['k']))[0],
    voice: mergeRects(collectKind(NEWSROOM, ['v']))[0],
    letter: mergeRects(collectKind(NEWSROOM, ['t']))[0],
    walls: collectKind(NEWSROOM, ['#']),
  },
  festival: {
    shelves: collectKind(FESTIVAL, ['W']),
    counter: mergeRects(collectKind(FESTIVAL, ['H']))[0],
    policy: mergeRects(collectKind(FESTIVAL, ['x']))[0],
    table: mergeRects(collectKind(FESTIVAL, ['u']))[0],
    receipts: mergeRects(collectKind(FESTIVAL, ['z']))[0],
    reconcile: mergeRects(collectKind(FESTIVAL, ['m']))[0],
    cover: mergeRects(collectKind(FESTIVAL, ['j']))[0],
    submit: mergeRects(collectKind(FESTIVAL, ['t']))[0],
    walls: collectKind(FESTIVAL, ['#']),
  },
  workshop: {
    shelves: collectKind(WORKSHOP, ['W']),
    counter: mergeRects(collectKind(WORKSHOP, ['H']))[0],
    need: mergeRects(collectKind(WORKSHOP, ['u']))[0],
    extras: mergeRects(collectKind(WORKSHOP, ['z']))[0],
    brief: mergeRects(collectKind(WORKSHOP, ['m']))[0],
    builder: mergeRects(collectKind(WORKSHOP, ['j']))[0],
    result: mergeRects(collectKind(WORKSHOP, ['t']))[0],
    board: mergeRects(collectKind(WORKSHOP, ['k']))[0],
    docs: mergeRects(collectKind(WORKSHOP, ['a']))[0],
    vault: mergeRects(collectKind(WORKSHOP, ['e']))[0],
    kiosk: mergeRects(collectKind(WORKSHOP, ['q']))[0],
    lab: mergeRects(collectKind(WORKSHOP, ['w']))[0],
    prod: mergeRects(collectKind(WORKSHOP, ['l']))[0],
    console: mergeRects(collectKind(WORKSHOP, ['h']))[0],
    neighborNotice: mergeRects(collectKind(WORKSHOP, ['x']))[0],
    walls: collectKind(WORKSHOP, ['#']),
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
  {
    id: 'parcel',
    interactable: 'parcel_door',
    requiresHelp: true,
    requiresShopHelped: true,
    lockedNode: 'locked_parcel',
    ends: [
      { map: 'street', letter: 'R', spawnDir: 'south', arriveFacing: 'down' },
      { map: 'parcel', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
  {
    id: 'archive',
    interactable: 'library_inner',
    requiresHelp: true,
    requiresCommsRepaired: true,
    lockedNode: 'library_inner_locked',
    ends: [
      { map: 'library', letter: 'F', spawnDir: 'south', arriveFacing: 'down' },
      { map: 'archive', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
  {
    id: 'newsroom',
    interactable: 'newsroom_door',
    requiresHelp: true,
    requiresArchiveSuccess: true,
    lockedNode: 'locked_newsroom',
    ends: [
      { map: 'street', letter: 'E', spawnDir: 'south', arriveFacing: 'down' },
      { map: 'newsroom', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
  {
    id: 'festival',
    interactable: 'festival_door',
    requiresHelp: true,
    requiresWorkshopLead: true,
    lockedNode: 'locked_festival',
    ends: [
      { map: 'street', letter: 'G', spawnDir: 'north', arriveFacing: 'up' },
      { map: 'festival', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
    ],
  },
  {
    id: 'workshop',
    interactable: 'workshop_door',
    requiresHelp: true,
    requiresWorkshopMaterials: true,
    lockedNode: 'locked_workshop',
    ends: [
      { map: 'street', letter: 'Y', spawnDir: 'north', arriveFacing: 'up' },
      { map: 'workshop', letter: 'd', spawnDir: 'north', arriveFacing: 'up' },
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
  shopkeeper: cellCenter(6, 4),
  libraryInner: letterCenter(LIBRARY, 'F'),
  shopWestWallInside: cellCenter(1, 4),
  libraryWestWallInside: cellCenter(1, 5),
  shelfWest: cellCenter(3, 2),
  shelfEast: cellCenter(12, 2),
  noticeBoard: cellCenter(7, 2),
  priceList: cellCenter(9, 2),
  calculator: cellCenter(11, 4),
  crate: cellCenter(2, 5),
  parcelDoor: letterCenter(STREET, 'R'),
  parcelExit: letterCenter(PARCEL, 'd'),
  parcelSpawn: PARCEL.spawn,
  clerk: cellCenter(6, 4),
  holdWest: cellCenter(3, 2),
  holdEast: cellCenter(12, 2),
  holdBoard: letterCenter(PARCEL, 'b'),
  payWindow: letterCenter(PARCEL, 'y'),
  instructionDesk: letterCenter(PARCEL, 's'),
  parcelTalk: cellCenter(4, 6),
  archiveExit: letterCenter(ARCHIVE, 'd'),
  archiveSpawn: ARCHIVE.spawn,
  librarian: cellCenter(6, 4),
  contextBench: letterCenter(ARCHIVE, 'b'),
  notesCrate: letterCenter(ARCHIVE, 'n'),
  communityFile: letterCenter(ARCHIVE, 'f'),
  packTable: letterCenter(ARCHIVE, 'p'),
  specCase: letterCenter(ARCHIVE, 's'),
  archiveTalk: cellCenter(4, 6),
  archiveWestWallInside: cellCenter(1, 4),
  newsroomDoor: letterCenter(STREET, 'E'),
  newsroomExit: letterCenter(NEWSROOM, 'd'),
  newsroomSpawn: NEWSROOM.spawn,
  editor: cellCenter(6, 4),
  sourceBulletin: letterCenter(NEWSROOM, 'u'),
  sourcePoster: letterCenter(NEWSROOM, 'z'),
  compareDesk: letterCenter(NEWSROOM, 'm'),
  clippingBoard: letterCenter(NEWSROOM, 'x'),
  originalDrawer: letterCenter(NEWSROOM, 'j'),
  draftTable: letterCenter(NEWSROOM, 'k'),
  voiceDesk: letterCenter(NEWSROOM, 'v'),
  letterDesk: letterCenter(NEWSROOM, 't'),
  newsroomTalk: cellCenter(4, 6),
  newsroomWestWallInside: cellCenter(1, 4),
  festivalDoor: letterCenter(STREET, 'G'),
  workshopDoor: letterCenter(STREET, 'Y'),
  festivalExit: letterCenter(FESTIVAL, 'd'),
  festivalSpawn: FESTIVAL.spawn,
  officer: cellCenter(6, 4),
  stockTable: letterCenter(FESTIVAL, 'u'),
  receiptsDesk: letterCenter(FESTIVAL, 'z'),
  reconcileDesk: letterCenter(FESTIVAL, 'm'),
  policyBoard: letterCenter(FESTIVAL, 'x'),
  robotCover: letterCenter(FESTIVAL, 'j'),
  submitDesk: letterCenter(FESTIVAL, 't'),
  festivalTalk: cellCenter(4, 6),
  festivalWestWallInside: cellCenter(1, 4),
  workshopExit: letterCenter(WORKSHOP, 'd'),
  workshopSpawn: WORKSHOP.spawn,
  manager: cellCenter(6, 4),
  needSlip: letterCenter(WORKSHOP, 'u'),
  extrasSlip: letterCenter(WORKSHOP, 'z'),
  briefDesk: letterCenter(WORKSHOP, 'm'),
  builderBench: letterCenter(WORKSHOP, 'j'),
  resultCheck: letterCenter(WORKSHOP, 't'),
  appointmentBoard: letterCenter(WORKSHOP, 'k'),
  kioskDocs: letterCenter(WORKSHOP, 'a'),
  kioskVault: letterCenter(WORKSHOP, 'e'),
  kioskFace: letterCenter(WORKSHOP, 'q'),
  labTerminal: letterCenter(WORKSHOP, 'w'),
  labProd: letterCenter(WORKSHOP, 'l'),
  agentConsole: letterCenter(WORKSHOP, 'h'),
  agentBoard: letterCenter(WORKSHOP, 'x'),
  workshopTalk: cellCenter(4, 6),
  workshopWestWallInside: cellCenter(1, 4),
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

export function parcelDoorHint(map: MapId): string {
  return map === 'parcel' ? HINT_LABELS.parcelExit : HINT_LABELS.parcelEnter;
}

export function archiveDoorHint(map: MapId): string {
  return map === 'archive' ? HINT_LABELS.archiveExit : HINT_LABELS.archiveEnter;
}

export function newsroomDoorHint(map: MapId): string {
  return map === 'newsroom' ? HINT_LABELS.newsroomExit : HINT_LABELS.newsroomEnter;
}

export function festivalDoorHint(map: MapId): string {
  return map === 'festival' ? HINT_LABELS.festivalExit : HINT_LABELS.festivalEnter;
}

export function workshopDoorHint(map: MapId): string {
  return map === 'workshop' ? HINT_LABELS.workshopExit : HINT_LABELS.workshopEnter;
}
