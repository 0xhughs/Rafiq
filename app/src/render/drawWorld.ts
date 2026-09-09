import { TILE } from '../engine/constants';
import { robotPosition, robotVisible } from '../engine/npc';
import { APARTMENT, ARCHIVE, FESTIVAL, FURNITURE, LIBRARY, NEWSROOM, PARCEL, SHOP, STREET, WORKSHOP, WORLD_POS, getMap } from '../engine/maps';
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
  shopOpen: '#3d6b4f',
  library: '#4a5d78',
  libraryDoor: '#2c3a4f',
  newsroom: '#6a3d4a',
  newsroomDoor: '#3a1e28',
  newsroomFloor: '#efe4d0',
  newsroomFloorAlt: '#e6d8c4',
  festival: '#3d5a4a',
  festivalDoor: '#1e3a2c',
  festivalFloor: '#efe6d4',
  festivalFloorAlt: '#e6d9c4',
  workshop: '#5a4a3d',
  workshopDoor: '#2c2218',
  parcel: '#3d5a62',
  parcelDoor: '#1e3a40',
  parcelFloor: '#d7e0d8',
  parcelFloorAlt: '#cdd6ce',
  archiveFloor: '#e8dcc4',
  archiveFloorAlt: '#dfd0b4',
  grayBox: '#8b9298',
  counter: '#7a4a2a',
  shelf: '#5c4030',
  plaza: '#cbb896',
  plazaAlt: '#c3af88',
  neighborDress: '#8b3a4a',
  keeperApron: '#3d5c4a',
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

function drawStreet(
  ctx: CanvasRenderingContext2D,
  storeOpen: boolean,
  parcelOpen: boolean,
  newsroomOpen: boolean,
  festivalOpen: boolean,
  workshopOpen: boolean,
): void {
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
  ctx.fillStyle = storeOpen ? PALETTE.shopOpen : '#2a2118';
  ctx.fillText(storeOpen ? 'مفتوح' : 'مغلق', shop.x + shop.w / 2, shop.y + 12);

  const lib = FURNITURE.street.library;
  fillRound(ctx, lib.x, lib.y, lib.w, lib.h, 4, PALETTE.library);
  ctx.fillStyle = '#d7c4a3';
  ctx.fillRect(lib.x + 6, lib.y - 22, lib.w - 12, 20);
  ctx.fillStyle = '#1e2733';
  ctx.font = '12px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.fillText('واجهة المكتبة', lib.x + lib.w / 2, lib.y - 8);
  fillRound(ctx, WORLD_POS.libraryDoor.x - 10, WORLD_POS.libraryDoor.y - 18, 20, 36, 4, PALETTE.libraryDoor);

  fillRound(ctx, WORLD_POS.shopDoor.x - 10, WORLD_POS.shopDoor.y - 18, 20, 36, 4, '#8a4b2a');

  const news = FURNITURE.street.newsroom;
  fillRound(ctx, news.x, news.y, news.w, news.h, 4, PALETTE.newsroom);
  ctx.fillStyle = '#f4e6d4';
  ctx.fillRect(news.x + 4, news.y - 22, news.w - 8, 20);
  ctx.fillStyle = '#3a1e28';
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.fillText('قاعة أخبار الحي', news.x + news.w / 2, news.y - 8);
  fillRound(ctx, WORLD_POS.newsroomDoor.x - 10, WORLD_POS.newsroomDoor.y - 18, 20, 36, 4, PALETTE.newsroomDoor);
  ctx.fillStyle = newsroomOpen ? PALETTE.shopOpen : '#2a2118';
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText(newsroomOpen ? 'مفتوح' : 'مغلق', news.x + news.w / 2, news.y + 14);

  const parcel = FURNITURE.street.parcel;
  fillRound(ctx, parcel.x, parcel.y, parcel.w, parcel.h, 4, PALETTE.parcel);
  ctx.fillStyle = '#e4efe8';
  ctx.fillRect(parcel.x + 4, parcel.y - 22, parcel.w - 8, 20);
  ctx.fillStyle = '#163238';
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.fillText('مكتب طرود الرصيف', parcel.x + parcel.w / 2, parcel.y - 8);
  fillRound(ctx, WORLD_POS.parcelDoor.x - 10, WORLD_POS.parcelDoor.y - 18, 20, 36, 4, PALETTE.parcelDoor);
  ctx.fillStyle = parcelOpen ? PALETTE.shopOpen : '#2a2118';
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText(parcelOpen ? 'مفتوح' : 'مغلق', parcel.x + parcel.w / 2, parcel.y + 14);

  const fest = FURNITURE.street.festival;
  fillRound(ctx, fest.x, fest.y, fest.w, fest.h, 4, PALETTE.festival);
  ctx.fillStyle = '#e4efe8';
  ctx.fillRect(fest.x + 4, fest.y - 22, fest.w - 8, 20);
  ctx.fillStyle = '#163238';
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.fillText('مكتب المهرجان', fest.x + fest.w / 2, fest.y - 8);
  fillRound(ctx, WORLD_POS.festivalDoor.x - 10, WORLD_POS.festivalDoor.y - 18, 20, 36, 4, PALETTE.festivalDoor);
  ctx.fillStyle = festivalOpen ? PALETTE.shopOpen : '#2a2118';
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText(festivalOpen ? 'مفتوح' : 'مغلق', fest.x + fest.w / 2, fest.y + 14);

  const shopWork = FURNITURE.street.workshop;
  fillRound(ctx, shopWork.x, shopWork.y, shopWork.w, shopWork.h, 4, PALETTE.workshop);
  ctx.fillStyle = '#f4e6d4';
  ctx.fillRect(shopWork.x + 4, shopWork.y - 22, shopWork.w - 8, 20);
  ctx.fillStyle = '#2c2218';
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.fillText('ورشة الإصلاح', shopWork.x + shopWork.w / 2, shopWork.y - 8);
  fillRound(
    ctx,
    WORLD_POS.workshopDoor.x - 10,
    WORLD_POS.workshopDoor.y - 18,
    20,
    36,
    4,
    PALETTE.workshopDoor,
  );
  ctx.fillStyle = workshopOpen ? PALETTE.shopOpen : '#2a2118';
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText(workshopOpen ? 'مواد وصلت' : 'مقفل', shopWork.x + shopWork.w / 2, shopWork.y + 14);

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

function drawShopInterior(ctx: CanvasRenderingContext2D): void {
  const map = SHOP;
  drawChecker(ctx, map.cols, map.rows, '#f0e0c8', '#e7d4b6');
  drawWalls(ctx, FURNITURE.shop.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.shop.westShelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, PALETTE.shelf);
    ctx.fillStyle = '#f4e4c4';
    ctx.fillRect(shelf.x + 10, shelf.y + 12, shelf.w - 20, 6);
    ctx.fillRect(shelf.x + 10, shelf.y + 24, shelf.w - 20, 6);
    ctx.fillStyle = '#d9b48c';
    ctx.fillRect(shelf.x + 12, shelf.y + 28, 10, 12);
    ctx.fillStyle = '#e8f0f4';
    ctx.fillRect(shelf.x + 26, shelf.y + 26, 8, 14);
  }
  for (const shelf of FURNITURE.shop.eastShelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#6a3424');
    ctx.fillStyle = '#c47a3a';
    ctx.fillRect(shelf.x + 12, shelf.y + 14, shelf.w - 24, 16);
  }
  const west = FURNITURE.shop.westShelves[0];
  const east = FURNITURE.shop.eastShelves[0];
  ctx.fillStyle = '#f7efe4';
  if (west) ctx.fillText('خبز / لبن / ماء', west.x + 48, west.y - 4);
  if (east) ctx.fillText('تمر الخلاص', east.x + 24, east.y - 4);

  const notice = FURNITURE.shop.notice;
  fillRound(ctx, notice.x + 4, notice.y + 2, notice.w - 8, notice.h - 6, 4, '#efe0b8');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('إعلان', notice.x + notice.w / 2, notice.y + 28);

  const price = FURNITURE.shop.priceList;
  fillRound(ctx, price.x + 4, price.y + 2, price.w - 8, price.h - 6, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('أسعار', price.x + price.w / 2, price.y + 28);

  const counter = FURNITURE.shop.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, PALETTE.counter);
  ctx.fillStyle = '#2a2118';
  ctx.fillText('البقالة', counter.x + counter.w / 2 - 20, counter.y + 22);

  const calc = FURNITURE.shop.calculator;
  fillRound(ctx, calc.x + 6, calc.y + 10, calc.w - 12, calc.h - 18, 3, '#2d3330');
  ctx.fillStyle = '#8fd3c4';
  ctx.fillRect(calc.x + 10, calc.y + 14, calc.w - 20, 10);

  const crate = FURNITURE.shop.crate;
  fillRound(ctx, crate.x + 6, crate.y + 8, crate.w - 12, crate.h - 12, 4, '#8a5a2b');
  ctx.strokeStyle = '#4a3014';
  ctx.strokeRect(crate.x + 10, crate.y + 12, crate.w - 20, crate.h - 20);
  ctx.fillStyle = '#f7efe4';
  ctx.fillText('صندوق', crate.x + crate.w / 2, crate.y + crate.h - 4);

  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, '#8a4b2a');
}

function drawGrayBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tag: string,
): void {
  fillRound(ctx, x + 6, y + 8, w - 12, h - 12, 4, PALETTE.grayBox);
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(x + 10, y + 12, w - 20, 10);
  ctx.fillStyle = '#1c2a2e';
  ctx.font = '10px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillText(tag, x + w / 2, y + 21);
}

function drawParcelOffice(ctx: CanvasRenderingContext2D, westTag: string): void {
  const map = PARCEL;
  drawChecker(ctx, map.cols, map.rows, PALETTE.parcelFloor, PALETTE.parcelFloorAlt);
  drawWalls(ctx, FURNITURE.parcel.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.parcel.westShelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#4a585c');
    drawGrayBox(ctx, shelf.x, shelf.y, shelf.w, shelf.h, westTag);
  }
  for (const shelf of FURNITURE.parcel.eastShelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#4a585c');
    drawGrayBox(ctx, shelf.x, shelf.y, shelf.w, shelf.h, 'ر-٧١');
  }
  const west = FURNITURE.parcel.westShelves[0];
  const east = FURNITURE.parcel.eastShelves[0];
  ctx.fillStyle = '#163238';
  if (west) ctx.fillText('حجز إصلاح', west.x + 48, west.y - 4);
  if (east) ctx.fillText('للبيع ١٢', east.x + 24, east.y - 4);

  const board = FURNITURE.parcel.board;
  fillRound(ctx, board.x + 4, board.y + 2, board.w - 8, board.h - 6, 4, '#efe0b8');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('حجوزات', board.x + board.w / 2, board.y + 28);

  const pay = FURNITURE.parcel.pay;
  fillRound(ctx, pay.x + 4, pay.y + 2, pay.w - 8, pay.h - 6, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('دفع', pay.x + pay.w / 2, pay.y + 28);

  const counter = FURNITURE.parcel.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, '#3d5a62');
  ctx.fillStyle = '#e8f2ef';
  ctx.fillText('المنضدة', counter.x + counter.w / 2, counter.y + 22);

  const desk = FURNITURE.parcel.desk;
  fillRound(ctx, desk.x + 6, desk.y + 8, desk.w - 12, desk.h - 12, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('تعليمات', desk.x + desk.w / 2, desk.y + desk.h - 6);

  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, PALETTE.parcelDoor);
}

function drawLibraryExterior(ctx: CanvasRenderingContext2D, innerOpen: boolean): void {
  const map = LIBRARY;
  drawChecker(ctx, map.cols, map.rows, PALETTE.plaza, PALETTE.plazaAlt);
  drawWalls(ctx, FURNITURE.library.walls);
  const building = FURNITURE.library.building;
  fillRound(ctx, building.x, building.y, building.w, building.h, 6, PALETTE.library);
  ctx.fillStyle = '#ead9c0';
  ctx.fillRect(building.x + 10, building.y - 18, building.w - 20, 18);
  ctx.fillStyle = '#15202c';
  ctx.font = '13px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillText('واجهة المكتبة', building.x + building.w / 2, building.y - 5);
  ctx.fillStyle = '#8fb4c9';
  ctx.fillRect(building.x + 16, building.y + 18, 22, 28);
  ctx.fillRect(building.x + building.w / 2 - 11, building.y + 18, 22, 28);
  ctx.fillRect(building.x + building.w - 38, building.y + 18, 22, 28);
  const inner = WORLD_POS.libraryInner;
  fillRound(ctx, inner.x - 12, inner.y - 20, 24, 40, 4, '#243044');
  ctx.fillStyle = '#d4b56a';
  ctx.beginPath();
  ctx.arc(inner.x + 6, inner.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#15202c';
  ctx.font = '10px "Cairo", sans-serif';
  ctx.fillText(innerOpen ? 'مفتوح' : 'مقفل', inner.x, inner.y + 28);
  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, '#8a4b2a');
}

function drawVillager(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
): void {
  ctx.fillStyle = PALETTE.shadow;
  ctx.beginPath();
  ctx.ellipse(x, y + 16, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  fillRound(ctx, x - 10, y - 2, 20, 18, 6, shirt);
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(x, y - 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3b2418';
  ctx.beginPath();
  ctx.ellipse(x, y - 14, 8, 5, 0, Math.PI, 0);
  ctx.fill();
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

function drawArchiveRoom(ctx: CanvasRenderingContext2D, specOpen: boolean): void {
  const map = ARCHIVE;
  drawChecker(ctx, map.cols, map.rows, PALETTE.archiveFloor, PALETTE.archiveFloorAlt);
  drawWalls(ctx, FURNITURE.archive.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.archive.shelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#4a4e6a');
    ctx.fillStyle = '#ead9c0';
    ctx.fillRect(shelf.x + 10, shelf.y + 12, shelf.w - 20, 6);
    ctx.fillRect(shelf.x + 10, shelf.y + 22, shelf.w - 20, 6);
  }
  const bench = FURNITURE.archive.bench;
  fillRound(ctx, bench.x + 2, bench.y + 4, bench.w - 4, bench.h - 8, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('نافذة', bench.x + bench.w / 2, bench.y + 22);
  ctx.fillStyle = '#c45c26';
  ctx.fillRect(bench.x + 10, bench.y + 26, 12, 10);
  ctx.fillRect(bench.x + 24, bench.y + 26, 12, 10);
  const notes = FURNITURE.archive.notes;
  fillRound(ctx, notes.x + 4, notes.y + 6, notes.w - 8, notes.h - 10, 4, '#f4e4c4');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('أوراق', notes.x + notes.w / 2, notes.y + 28);
  const file = FURNITURE.archive.file;
  fillRound(ctx, file.x + 4, file.y + 6, file.w - 8, file.h - 10, 4, '#efe0b8');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('ملف', file.x + file.w / 2, file.y + 28);
  const pack = FURNITURE.archive.pack;
  fillRound(ctx, pack.x + 4, pack.y + 6, pack.w - 8, pack.h - 10, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('حزمة', pack.x + pack.w / 2, pack.y + 28);
  const spec = FURNITURE.archive.spec;
  fillRound(ctx, spec.x + 4, spec.y + 6, spec.w - 8, spec.h - 10, 4, specOpen ? '#d7efe4' : '#c9b48a');
  ctx.fillStyle = '#163238';
  ctx.fillText(specOpen ? 'مواصفات' : 'غلاف', spec.x + spec.w / 2, spec.y + 28);
  const counter = FURNITURE.archive.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, '#4a5d78');
  ctx.fillStyle = '#ead9c0';
  ctx.fillText('المنضدة', counter.x + counter.w / 2, counter.y + 22);
  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, PALETTE.libraryDoor);
}

function drawNewsroom(ctx: CanvasRenderingContext2D): void {
  const map = NEWSROOM;
  drawChecker(ctx, map.cols, map.rows, PALETTE.newsroomFloor, PALETTE.newsroomFloorAlt);
  drawWalls(ctx, FURNITURE.newsroom.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.newsroom.shelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#5a3a48');
    ctx.fillStyle = '#ead9c0';
    ctx.fillRect(shelf.x + 10, shelf.y + 12, shelf.w - 20, 6);
  }
  const clip = FURNITURE.newsroom.clipping;
  fillRound(ctx, clip.x + 4, clip.y + 2, clip.w - 8, clip.h - 6, 4, '#efe0b8');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('قصاصة', clip.x + clip.w / 2, clip.y + 28);
  const bulletin = FURNITURE.newsroom.bulletin;
  fillRound(ctx, bulletin.x + 4, bulletin.y + 6, bulletin.w - 8, bulletin.h - 10, 4, '#f4e4c4');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('نشرة', bulletin.x + bulletin.w / 2, bulletin.y + 28);
  const poster = FURNITURE.newsroom.poster;
  fillRound(ctx, poster.x + 4, poster.y + 6, poster.w - 8, poster.h - 10, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('ملصق', poster.x + poster.w / 2, poster.y + 28);
  const compare = FURNITURE.newsroom.compare;
  fillRound(ctx, compare.x + 4, compare.y + 6, compare.w - 8, compare.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('مقارنة', compare.x + compare.w / 2, compare.y + 28);
  const original = FURNITURE.newsroom.original;
  fillRound(ctx, original.x + 4, original.y + 6, original.w - 8, original.h - 10, 4, '#d7efe4');
  ctx.fillStyle = '#163238';
  ctx.fillText('أصل', original.x + original.w / 2, original.y + 28);
  const draft = FURNITURE.newsroom.draft;
  fillRound(ctx, draft.x + 4, draft.y + 6, draft.w - 8, draft.h - 10, 4, '#f6d6c8');
  ctx.fillStyle = '#7a241c';
  ctx.fillText('مسودة', draft.x + draft.w / 2, draft.y + 28);
  const voice = FURNITURE.newsroom.voice;
  fillRound(ctx, voice.x + 4, voice.y + 6, voice.w - 8, voice.h - 10, 4, '#e7efd6');
  ctx.fillStyle = '#2a3b1c';
  ctx.fillText('صوت', voice.x + voice.w / 2, voice.y + 28);
  const letter = FURNITURE.newsroom.letter;
  fillRound(ctx, letter.x + 4, letter.y + 6, letter.w - 8, letter.h - 10, 4, '#ead9c0');
  ctx.fillStyle = '#163238';
  ctx.fillText('خطاب', letter.x + letter.w / 2, letter.y + 28);
  const counter = FURNITURE.newsroom.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, PALETTE.newsroom);
  ctx.fillStyle = '#ead9c0';
  ctx.fillText('المنضدة', counter.x + counter.w / 2, counter.y + 22);
  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, PALETTE.newsroomDoor);
}

function drawFestival(ctx: CanvasRenderingContext2D): void {
  const map = FESTIVAL;
  drawChecker(ctx, map.cols, map.rows, PALETTE.festivalFloor, PALETTE.festivalFloorAlt);
  drawWalls(ctx, FURNITURE.festival.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.festival.shelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, '#3d5a4a');
    ctx.fillStyle = '#ead9c0';
    ctx.fillRect(shelf.x + 10, shelf.y + 12, shelf.w - 20, 6);
  }
  const policy = FURNITURE.festival.policy;
  fillRound(ctx, policy.x + 4, policy.y + 2, policy.w - 8, policy.h - 6, 4, '#efe0b8');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('سياسة', policy.x + policy.w / 2, policy.y + 28);
  const table = FURNITURE.festival.table;
  fillRound(ctx, table.x + 4, table.y + 6, table.w - 8, table.h - 10, 4, '#f4e4c4');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('جدول', table.x + table.w / 2, table.y + 28);
  const receipts = FURNITURE.festival.receipts;
  fillRound(ctx, receipts.x + 4, receipts.y + 6, receipts.w - 8, receipts.h - 10, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('إيصالات', receipts.x + receipts.w / 2, receipts.y + 28);
  const reconcile = FURNITURE.festival.reconcile;
  fillRound(ctx, reconcile.x + 4, reconcile.y + 6, reconcile.w - 8, reconcile.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('مطابقة', reconcile.x + reconcile.w / 2, reconcile.y + 28);
  const cover = FURNITURE.festival.cover;
  fillRound(ctx, cover.x + 4, cover.y + 6, cover.w - 8, cover.h - 10, 4, '#f6d6c8');
  ctx.fillStyle = '#7a241c';
  ctx.fillText('غلاف', cover.x + cover.w / 2, cover.y + 28);
  const submit = FURNITURE.festival.submit;
  fillRound(ctx, submit.x + 4, submit.y + 6, submit.w - 8, submit.h - 10, 4, '#ead9c0');
  ctx.fillStyle = '#163238';
  ctx.fillText('بيان', submit.x + submit.w / 2, submit.y + 28);
  const counter = FURNITURE.festival.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, PALETTE.festival);
  ctx.fillStyle = '#ead9c0';
  ctx.fillText('المنضدة', counter.x + counter.w / 2, counter.y + 22);
  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, PALETTE.festivalDoor);
}

function drawWorkshop(ctx: CanvasRenderingContext2D): void {
  const map = WORKSHOP;
  drawChecker(ctx, map.cols, map.rows, '#efe4d4', '#e6d7c4');
  drawWalls(ctx, FURNITURE.workshop.walls);
  ctx.font = '11px "Noto Naskh Arabic", "Cairo", sans-serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  for (const shelf of FURNITURE.workshop.shelves) {
    fillRound(ctx, shelf.x + 4, shelf.y + 4, shelf.w - 8, shelf.h - 8, 4, PALETTE.workshop);
    ctx.fillStyle = '#ead9c0';
    ctx.fillRect(shelf.x + 10, shelf.y + 12, shelf.w - 20, 6);
  }
  const need = FURNITURE.workshop.need;
  fillRound(ctx, need.x + 4, need.y + 6, need.w - 8, need.h - 10, 4, '#f4e4c4');
  ctx.fillStyle = '#5a3218';
  ctx.fillText('حاجة', need.x + need.w / 2, need.y + 28);
  const extras = FURNITURE.workshop.extras;
  fillRound(ctx, extras.x + 4, extras.y + 6, extras.w - 8, extras.h - 10, 4, '#f3d9a4');
  ctx.fillStyle = '#3a2414';
  ctx.fillText('إضافات', extras.x + extras.w / 2, extras.y + 28);
  const brief = FURNITURE.workshop.brief;
  fillRound(ctx, brief.x + 4, brief.y + 6, brief.w - 8, brief.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('وصف', brief.x + brief.w / 2, brief.y + 28);
  const builder = FURNITURE.workshop.builder;
  fillRound(ctx, builder.x + 4, builder.y + 6, builder.w - 8, builder.h - 10, 4, '#f6d6c8');
  ctx.fillStyle = '#7a241c';
  ctx.fillText('بنّاء', builder.x + builder.w / 2, builder.y + 28);
  const result = FURNITURE.workshop.result;
  fillRound(ctx, result.x + 4, result.y + 6, result.w - 8, result.h - 10, 4, '#d7efe4');
  ctx.fillStyle = '#163238';
  ctx.fillText('فحص', result.x + result.w / 2, result.y + 28);
  const board = FURNITURE.workshop.board;
  fillRound(ctx, board.x + 4, board.y + 6, board.w - 8, board.h - 10, 4, '#ead9c0');
  ctx.fillStyle = '#163238';
  ctx.fillText('مواعيد', board.x + board.w / 2, board.y + 28);
  const docs = FURNITURE.workshop.docs;
  fillRound(ctx, docs.x + 4, docs.y + 6, docs.w - 8, docs.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('عقد', docs.x + docs.w / 2, docs.y + 28);
  const vault = FURNITURE.workshop.vault;
  fillRound(ctx, vault.x + 4, vault.y + 6, vault.w - 8, vault.h - 10, 4, '#d7efe4');
  ctx.fillStyle = '#163238';
  ctx.fillText('خزنة', vault.x + vault.w / 2, vault.y + 28);
  const kiosk = FURNITURE.workshop.kiosk;
  fillRound(ctx, kiosk.x + 4, kiosk.y + 6, kiosk.w - 8, kiosk.h - 10, 4, '#f6d6c8');
  ctx.fillStyle = '#7a241c';
  ctx.fillText('كiosk', kiosk.x + kiosk.w / 2, kiosk.y + 28);
  const lab = FURNITURE.workshop.lab;
  fillRound(ctx, lab.x + 4, lab.y + 6, lab.w - 8, lab.h - 10, 4, '#d7efe4');
  ctx.fillStyle = '#163238';
  ctx.fillText('نشر', lab.x + lab.w / 2, lab.y + 28);
  const prod = FURNITURE.workshop.prod;
  fillRound(ctx, prod.x + 4, prod.y + 6, prod.w - 8, prod.h - 10, 4, '#f3d0c4');
  ctx.fillStyle = '#7a241c';
  ctx.fillText('إنتاج', prod.x + prod.w / 2, prod.y + 28);
  const agentConsole = FURNITURE.workshop.console;
  fillRound(ctx, agentConsole.x + 4, agentConsole.y + 6, agentConsole.w - 8, agentConsole.h - 10, 4, '#dce8f4');
  ctx.fillStyle = '#163238';
  ctx.fillText('مشغّل', agentConsole.x + agentConsole.w / 2, agentConsole.y + 28);
  const notice = FURNITURE.workshop.neighborNotice;
  fillRound(ctx, notice.x + 4, notice.y + 6, notice.w - 8, notice.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('حي', notice.x + notice.w / 2, notice.y + 28);
  const connector = FURNITURE.workshop.connector;
  fillRound(ctx, connector.x + 4, connector.y + 6, connector.w - 8, connector.h - 10, 4, '#dce8f4');
  ctx.fillStyle = '#163238';
  ctx.fillText('موصل', connector.x + connector.w / 2, connector.y + 28);
  const civicBrowser = FURNITURE.workshop.civicBrowser;
  fillRound(ctx, civicBrowser.x + 4, civicBrowser.y + 6, civicBrowser.w - 8, civicBrowser.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('سجل', civicBrowser.x + civicBrowser.w / 2, civicBrowser.y + 28);
  const skillDesk = FURNITURE.workshop.skillDesk;
  fillRound(ctx, skillDesk.x + 4, skillDesk.y + 6, skillDesk.w - 8, skillDesk.h - 10, 4, '#dce8f4');
  ctx.fillStyle = '#163238';
  ctx.fillText('مهارة', skillDesk.x + skillDesk.w / 2, skillDesk.y + 28);
  const hallClock = FURNITURE.workshop.hallClock;
  fillRound(ctx, hallClock.x + 4, hallClock.y + 6, hallClock.w - 8, hallClock.h - 10, 4, '#efe6d0');
  ctx.fillStyle = '#2a2118';
  ctx.fillText('ساعة', hallClock.x + hallClock.w / 2, hallClock.y + 28);
  const counter = FURNITURE.workshop.counter;
  fillRound(ctx, counter.x + 2, counter.y + 6, counter.w - 4, counter.h - 10, 6, PALETTE.workshop);
  ctx.fillStyle = '#ead9c0';
  ctx.fillText('المنضدة', counter.x + counter.w / 2, counter.y + 22);
  const door = map.door;
  fillRound(ctx, door.x - 10, door.y - 22, 20, 44, 4, PALETTE.workshopDoor);
}

function drawRobot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  companion: boolean,
  commsRepaired: boolean,
  contextModule: boolean,
  planningCore: boolean,
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
  ctx.fillStyle = commsRepaired ? '#7fdbda' : PALETTE.rust;
  ctx.beginPath();
  ctx.arc(x + 6, y - 22, commsRepaired ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  if (commsRepaired) {
    fillRound(ctx, x - 16, y + 6, 10, 8, 2, '#2f5d62');
  }
  if (contextModule) {
    fillRound(ctx, x - 18, y - 6, 12, 10, 2, '#1c3b40');
    ctx.fillStyle = '#7fdbda';
    ctx.fillRect(x - 16, y - 3, 8, 4);
  }
  if (planningCore) {
    ctx.fillStyle = '#f4e4c4';
    ctx.beginPath();
    ctx.moveTo(x, y - 28);
    ctx.lineTo(x + 6, y - 18);
    ctx.lineTo(x - 6, y - 18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2f5d62';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
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
  } else if (state.map === 'street') {
    drawStreet(
      ctx,
      state.encounter === 'help_accepted',
      state.shopQuest.phase === 'helped',
      state.libraryQuest.contextModule && state.libraryQuest.specReleased,
      state.newsroomQuest.workshopLead,
      state.festivalQuest.workshopDoorOpen,
    );
    drawVillager(ctx, WORLD_POS.neighbor.x, WORLD_POS.neighbor.y, PALETTE.neighborDress);
  } else if (state.map === 'shop') {
    drawShopInterior(ctx);
    drawVillager(ctx, WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y, PALETTE.keeperApron);
  } else if (state.map === 'parcel') {
    drawParcelOffice(ctx, state.parcelQuest.r19Staged ? 'ر-١٩' : 'ر-١٧');
    drawVillager(ctx, WORLD_POS.clerk.x, WORLD_POS.clerk.y, '#2f5d62');
  } else if (state.map === 'archive') {
    drawArchiveRoom(ctx, state.libraryQuest.specReleased);
    drawVillager(ctx, WORLD_POS.librarian.x, WORLD_POS.librarian.y, '#4a5d78');
  } else if (state.map === 'newsroom') {
    drawNewsroom(ctx);
    drawVillager(ctx, WORLD_POS.editor.x, WORLD_POS.editor.y, '#6a3d4a');
  } else if (state.map === 'festival') {
    drawFestival(ctx);
    drawVillager(ctx, WORLD_POS.officer.x, WORLD_POS.officer.y, '#3d5a4a');
  } else if (state.map === 'workshop') {
    drawWorkshop(ctx);
    drawVillager(ctx, WORLD_POS.manager.x, WORLD_POS.manager.y, '#5a4a3d');
  } else {
    drawLibraryExterior(ctx, state.parcelQuest.commsRepaired);
  }
  if (robotVisible(state)) {
    const robot = robotPosition(state);
    drawRobot(
      ctx,
      robot.x,
      robot.y,
      time,
      state.encounter === 'help_accepted',
      state.parcelQuest.commsRepaired,
      state.libraryQuest.contextModule,
      state.agentQuest.agentReady,
    );
  }
  drawPlayer(ctx, state.position.x, state.position.y, state.facing);
}
