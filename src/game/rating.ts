import { RATING_CURVE } from './config';

/** XP nécessaire pour passer de `ovr` à `ovr + 1` */
export function costToNext(ovr: number): number {
  const { base, growth, pivot } = RATING_CURVE;
  return Math.round(base * Math.pow(growth, ovr - pivot));
}

export interface RatingProgress {
  ovr: number;
  /** XP accumulée dans le palier actuel */
  xpInto: number;
  /** XP du palier actuel (0 à 99) */
  xpNeeded: number;
  progress: number;
  remaining: number;
  maxed: boolean;
}

/** Note générale à partir de la note de départ et de l'XP totale gagnée */
export function ratingFromXp(startOvr: number, totalXp: number): RatingProgress {
  let ovr = startOvr;
  let xp = totalXp;
  while (ovr < RATING_CURVE.max && xp >= costToNext(ovr)) {
    xp -= costToNext(ovr);
    ovr++;
  }
  if (ovr >= RATING_CURVE.max) return { ovr: RATING_CURVE.max, xpInto: 0, xpNeeded: 0, progress: 1, remaining: 0, maxed: true };
  const need = costToNext(ovr);
  return { ovr, xpInto: xp, xpNeeded: need, progress: xp / need, remaining: need - xp, maxed: false };
}

/** XP totale à cumuler pour aller de `from` à `to` */
export function xpBetween(from: number, to: number): number {
  let sum = 0;
  for (let n = from; n < to; n++) sum += costToNext(n);
  return sum;
}

export interface RatingTier {
  id: string;
  name: string;
  min: number;
  /** dégradé de la carte */
  colors: [string, string];
  /** couleur de texte sur fond clair */
  ink: string;
}

export const RATING_TIERS: RatingTier[] = [
  { id: 'rookie', name: 'Rookie', min: 1, colors: ['#ff9a3c', '#ff5e7e'], ink: '#e2552f' },
  { id: 'regulier', name: 'Régulier', min: 60, colors: ['#1fd1b9', '#2f8cff'], ink: '#0f9e8c' },
  { id: 'confirme', name: 'Confirmé', min: 70, colors: ['#3d7bff', '#6d3aff'], ink: '#3461e8' },
  { id: 'elite', name: 'Élite', min: 80, colors: ['#8b3dff', '#ff4fa3'], ink: '#7a2ff0' },
  { id: 'legende', name: 'Légende', min: 90, colors: ['#ff4fa3', '#ffb21e'], ink: '#e0368a' },
  { id: 'icone', name: 'Icône', min: 99, colors: ['#ffcf3c', '#ff4fa3'], ink: '#c98a00' },
];

export function tierOf(ovr: number): RatingTier {
  let t = RATING_TIERS[0];
  for (const x of RATING_TIERS) if (ovr >= x.min) t = x;
  return t;
}
