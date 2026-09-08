/// <reference types="vite/client" />

import type { GameAction, MapId, SerializedTestState } from './engine/types';

export interface RafiqTestApi {
  getState: () => SerializedTestState;
  dispatch: (action: GameAction) => void;
  teleport: (map: MapId, x: number, y: number) => void;
}

declare global {
  interface Window {
    __RAFIQ_TEST__?: RafiqTestApi;
  }
}

export {};
