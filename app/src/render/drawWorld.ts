import { TILE } from '../engine/constants';
import { robotPosition } from '../engine/interact';
import { APARTMENT, FURNITURE, STREET, WORLD_POS, getMap } from '../engine/maps';
import type { Facing, GameState } from '../engine/types';

const PALETTE = {
  night: '#2c241c',
  aptFloorA: '#edd7b8',
  aptFloorB: '#e4ccaa',
  wall: '#c9956c',
  wallDark: '#8f5a38',
  wallInner: '#f0d7c0',
  rug: '#7c3f2e',
  rugLight: '#d7a36a',
  bedFrame: '#2f5d62',
  sheet: '#f3efe4',
  pillow: '#f7f4ec',
  blanket: '#c45c26',
  table: '#6b4423',
  teapot: '#c4a35a',
  cup: '#efe6d6',
  kitchen: '#4d575e',
  sink: '#cfd6db',
  trash: '#2a3329',
  trashHighlight: '#3d4a3c',
  street: '#5a5d62',
  streetAlt: '#51545a',
  dumpster: '#4f6f3e',
  dumpsterLid: '#3d5a30',
  rust: '#b85a2a',
  shop: '#6d4c3d',
  shutter: '#3f3a36',
  playerShirt: '#1f4e5f',
  playerPants: '#d8c3a5',
  skin: '#d4a574',
  hair: '#2c1810',
  robot: '#8fa0ab',
  robotDark: '#5d6b74',
  robotEye: '#7fdbda',
  robotEyeDim: '#44585a',
  shadow: 'rgba(40, 24, 16, 0.28)',
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillRound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
): void {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawChecker(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  a: string,
  b: string,
): void {
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? a : b;
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D, cells: { x: number; y: number; w: number; h: number }[]): void {
  for (const cell of cells) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
    ctx.fillStyle = PALETTE.wallDark;
    ctx.fillRect(cell.x, cell.y + cell.h - 8, cell.w, 8);
  }
}

function drawApartment(ctx: CanvasRenderingContext2D): void {
  const map = APARTMENT;
  drawChecker(ctx, map.cols, map.rows, PALETTE.aptFloorA, PALETTE.aptFloorB);
  drawWalls(ctx, FURNITURE.apartment.walls);

  const rug = FURNITURE.apartment.rug;
  fillRound(ctx, rug.x + 4, rug.y + 4, rug.w - 8, rug.h - 8, 10, PALETTE.rug);
  ctx.fillStyle = PALETTE.rugLight;
  roundRect(ctx, rug.x + 14, rug.y + 14, rug.w - 28, rug.h - 28, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.rug;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(rug.x + 28 + i * 28, rug.y + rug.h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const bed = FURNITURE.apartment.bed;
  fillRound(ctx, bed.x + 4, bed.y + 4, bed.w - 8, bed.h - 8, 8, PALETTE.bedFrame);
  fillRound(ctx, bed.x + 10, bed.y + 14, bed.w - 20, bed.h - 24, 6, PALETTE.sheet);
  fillRound(ctx, bed.x + 14, bed.y + 8, 36, 18, 6, PALETTE.pillow);
  fillRound(ctx, bed.x + 52, bed.y + 22, bed.w - 70, 22, 6, PALETTE.blanket);

  const table = FURNITURE.apartment.table;
  ctx.fillStyle = PALETTE.table;
  ctx.beginPath();
  ctx.ellipse(table.x + table.w / 2, table.y + table.h / 2, table.w / 2 - 6, table.h / 2 - 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a2e16';
  ctx.fillRect(table.x + 18, table.y + table.h - 10, 6, 10);
  ctx.fillRect(table.x + table.w - 24, table.y + table.h - 10, 6, 10);
  ctx.fillStyle = PALETTE.teapot;
  ctx.beginPath();
  ctx.ellipse(table.x + table.w / 2, table.y + table.h / 2 - 2, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(table.x + table.w / 2 + 12, table.y + table.h / 2 - 6, 12, 6);
  ctx.fillStyle = '#8a6a2a';
  ctx.beginPath();
  ctx.arc(table.x + table.w / 2, table.y + table.h / 2 - 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cup;
  ctx.beginPath();
  ctx.arc(table.x + 28, table.y + table.h / 2 + 10, 7, 0, Math.PI * 2);
  ctx.arc(table.x + table.w - 28, table.y + table.h / 2 + 10, 7, 0, Math.PI * 2);
  ctx.fill();

  const kitchen = FURNITURE.apartment.kitchen;
  fillRound(ctx, kitchen.x + 4, kitchen.y + 4, kitchen.w - 8, kitchen.h - 8, 6, PALETTE.kitchen);
  fillRound(ctx, kitchen.x + 12, kitchen.y + 14, 28, 18, 4, PALETTE.sink);
  ctx.fillStyle = PALETTE.rust;
  ctx.fillRect(kitchen.x + kitchen.w - 36, kitchen.y + 16, 18, 14);

  ctx.fillStyle = '#8ec6e8';
  ctx.fillRect(TILE * 6, 6, TILE * 3, 10);
  ctx.fillStyle = '#f2c14e';
  ctx.globalAlpha = 0.35;
  ctx.fillRect(TILE * 6, 16, TILE * 3, 18);
  ctx.globalAlpha = 1;

  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, '#8a4b2a');
  ctx.fillStyle = '#e7c27a';
  ctx.beginPath();
  ctx.arc(door.x - 4, door.y, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawStreet(ctx: CanvasRenderingContext2D): void {
  const map = STREET;
  drawChecker(ctx, map.cols, map.rows, PALETTE.street, PALETTE.streetAlt);
  drawWalls(ctx, FURNITURE.street.walls);

  ctx.fillStyle = '#3a3330';
  ctx.fillRect(0, 0, TILE, map.pixelHeight);

  const shop = FURNITURE.street.shop;
  fillRound(ctx, shop.x, shop.y, shop.w, shop.h, 4, PALETTE.shop);
  fillRound(ctx, shop.x + 8, shop.y + 16, shop.w - 16, shop.h - 24, 2, PALETTE.shutter);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2d2a26' : '#4a433c';
    ctx.fillRect(shop.x + 8, shop.y + 18 + i * 8, shop.w - 16, 6);
  }
  ctx.fillStyle = '#f4e6d4';
  ctx.fillRect(shop.x + 6, shop.y - 22, shop.w - 12, 20);
  ctx.fillStyle = '#2a2118';
  ctx.font = '12px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillText('بقالة الزاوية', shop.x + shop.w / 2, shop.y - 8);
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText('مغلق', shop.x + shop.w / 2, shop.y + 12);

  const dump = FURNITURE.street.dumpster;
  fillRound(ctx, dump.x + 4, dump.y + 10, dump.w - 8, dump.h - 14, 8, PALETTE.dumpster);
  fillRound(ctx, dump.x + 2, dump.y + 2, dump.w - 6, 16, 6, PALETTE.dumpsterLid);
  ctx.fillStyle = PALETTE.rust;
  ctx.fillRect(dump.x + 18, dump.y + 24, 8, 22);
  ctx.fillRect(dump.x + dump.w - 28, dump.y + 20, 6, 18);

  ctx.fillStyle = '#d7b56a';
  ctx.beginPath();
  ctx.arc(TILE * 8.5, TILE * 2.2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d342c';
  ctx.fillRect(TILE * 8.5 - 3, TILE * 2.2, 6, 46);

  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, '#8a4b2a');
}

function drawTrashBag(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.trash;
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.trashHighlight;
  ctx.beginPath();
  ctx.ellipse(x - 5, y - 4, 6, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1b211c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 16);
  ctx.lineTo(x, y - 26);
  ctx.lineTo(x + 7, y - 16);
  ctx.stroke();
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, facing: Facing): void {
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRound(ctx, x - 11, y - 4, 22, 20, 6, PALETTE.playerShirt);
  fillRound(ctx, x - 10, y + 10, 20, 10, 4, PALETTE.playerPants);
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(x, y - 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.hair;
  ctx.beginPath();
  ctx.ellipse(x, y - 14, 9, 6, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  const nose =
    facing === 'left'
      ? { x: x - 8, y: y - 10 }
      : facing === 'right'
        ? { x: x + 8, y: y - 10 }
        : facing === 'up'
          ? { x, y: y - 18 }
          : { x, y: y - 2 };
  ctx.beginPath();
  ctx.arc(nose.x, nose.y, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  companion: boolean,
): void {
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRound(ctx, x - 14, y - 12, 28, 28, 8, PALETTE.robot);
  ctx.strokeStyle = PALETTE.robotDark;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 4);
  ctx.lineTo(x + 2, y + 10);
  ctx.stroke();
  ctx.fillStyle = PALETTE.rust;
  ctx.fillRect(x + 6, y + 2, 6, 8);
  fillRound(ctx, x + 10, y - 2, 8, 14, 3, PALETTE.robotDark);
  ctx.fillStyle = companion ? PALETTE.robotEye : PALETTE.robotEyeDim;
  ctx.beginPath();
  ctx.arc(x - 5, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  const flicker = Math.sin(time / 180) > 0.2;
  ctx.fillStyle = flicker ? PALETTE.robotEye : '#223';
  ctx.beginPath();
  ctx.arc(x + 5, y - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.robotDark;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x + 6, y - 22);
  ctx.stroke();
  ctx.fillStyle = PALETTE.rust;
  ctx.beginPath();
  ctx.arc(x + 6, y - 22, 3, 0, Math.PI * 2);
  ctx.fill();
  if (companion) {
    ctx.strokeStyle = 'rgba(127, 219, 218, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function drawWorld(ctx: CanvasRenderingContext2D, state: GameState, time: number): void {
  const map = getMap(state.map);
  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, map.pixelWidth, map.pixelHeight);
  if (state.map === 'apartment') {
    drawApartment(ctx);
    if (state.trash === 'home') {
      drawTrashBag(ctx, WORLD_POS.trash.x, WORLD_POS.trash.y);
    }
  } else {
    drawStreet(ctx);
  }
  if (state.encounter !== 'unseen') {
    const robot = robotPosition(state);
    drawRobot(ctx, robot.x, robot.y, time, state.encounter === 'help_accepted');
  }
  drawPlayer(ctx, state.position.x, state.position.y, state.facing);
}
