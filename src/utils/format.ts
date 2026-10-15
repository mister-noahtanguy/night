export const formatNp = (n: number) => Math.round(n).toLocaleString('fr-FR');

export function formatDistance(m: number) {
  return m < 1000 ? `${m} m` : m < 10_000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m / 1000)} km`;
}

/** Couleurs du multiplicateur d'une boîte selon son coefficient */
export function coefColor(coef: number): [string, string] {
  if (coef >= 9) return ['#ffe17a', '#ff3fb4'];
  if (coef >= 7) return ['#ff9ad8', '#a855f7'];
  if (coef >= 5) return ['#7de9ff', '#7c3aed'];
  if (coef >= 3) return ['#a7f3d0', '#06b6d4'];
  return ['#e2e8f0', '#64748b'];
}

/** XP de base d'une sortie validée dans un lieu, hors bonus */
export { checkInXp } from '../game/xp';
