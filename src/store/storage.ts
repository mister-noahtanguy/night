import type { UserState } from '../types';
import type { SeasonAnchor } from '../game/season';

export interface PersistedState {
  version: number;
  onboarded: boolean;
  user: UserState | null;
  anchor: SeasonAnchor;
}

const KEY = 'nightrank:v2';
export const STATE_VERSION = 2;

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    return parsed.version === STATE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible (navigation privée) : l'app fonctionne sans persistance
  }
}
