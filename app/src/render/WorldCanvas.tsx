import { useEffect, useRef } from 'react';
import { getMap } from '../engine/maps';
import type { GameState } from '../engine/types';
import { drawWorld } from './drawWorld';

interface Props {
  state: GameState;
}

export function WorldCanvas({ state }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    let frame = 0;
    const draw = (time: number) => {
      const current = stateRef.current;
      const map = getMap(current.map);
      const dpr = window.devicePixelRatio || 1;
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#241c18';
      ctx.fillRect(0, 0, width, height);
      const scale = Math.min(width / map.pixelWidth, height / map.pixelHeight);
      const ox = (width - map.pixelWidth * scale) / 2;
      const oy = (height - map.pixelHeight * scale) / 2;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);
      drawWorld(ctx, current, time);
      ctx.restore();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="stage" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="world-canvas"
        data-testid="world-canvas"
        aria-label="عالم اللعبة"
      />
    </div>
  );
}

