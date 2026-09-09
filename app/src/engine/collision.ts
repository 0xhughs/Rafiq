import { MAX_STEP, PLAYER_HALF_H, PLAYER_HALF_W, TILE } from './constants';
import { getMap } from './maps';
import type { Facing, MapId, Vec2 } from './types';

function tileSolid(mapId: MapId, col: number, row: number): boolean {
  const map = getMap(mapId);
  if (col < 0 || row < 0 || col >= map.cols || row >= map.rows) {
    return true;
  }
  return map.solid[row][col];
}

export function rectHitsSolid(
  mapId: MapId,
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  const colStart = Math.floor(left / TILE);
  const colEnd = Math.floor((right - 0.001) / TILE);
  const rowStart = Math.floor(top / TILE);
  const rowEnd = Math.floor((bottom - 0.001) / TILE);
  for (let row = rowStart; row <= rowEnd; row += 1) {
    for (let col = colStart; col <= colEnd; col += 1) {
      if (tileSolid(mapId, col, row)) return true;
    }
  }
  return false;
}

export function playerHitsSolid(mapId: MapId, x: number, y: number): boolean {
  return rectHitsSolid(
    mapId,
    x - PLAYER_HALF_W,
    y - PLAYER_HALF_H,
    x + PLAYER_HALF_W,
    y + PLAYER_HALF_H,
  );
}

export function tryMove(mapId: MapId, x: number, y: number, dx: number, dy: number): Vec2 {
  let nextX = x;
  let nextY = y;
  let remainX = dx;
  let remainY = dy;
  while (Math.abs(remainX) > 0.0001) {
    const step = Math.sign(remainX) * Math.min(Math.abs(remainX), MAX_STEP);
    if (playerHitsSolid(mapId, nextX + step, nextY)) break;
    nextX += step;
    remainX -= step;
  }
  while (Math.abs(remainY) > 0.0001) {
    const step = Math.sign(remainY) * Math.min(Math.abs(remainY), MAX_STEP);
    if (playerHitsSolid(mapId, nextX, nextY + step)) break;
    nextY += step;
    remainY -= step;
  }
  return { x: nextX, y: nextY };
}

export function facingFrom(dx: number, dy: number, fallback: Facing): Facing {
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? 'left' : 'right';
  }
  if (dy < -0.0001) return 'up';
  if (dy > 0.0001) return 'down';
  return fallback;
}
