// Saisons de 10 semaines. EPOCH sert de référence pour découper les semaines (un lundi).
const EPOCH = new Date('2026-01-05T00:00:00').getTime();
const DAY = 86_400_000;
const WEEK = 7 * DAY;
export const SEASON_WEEKS = 10;
const SEASON_MS = SEASON_WEEKS * WEEK;

export interface SeasonInfo {
  number: number;
  start: Date;
  end: Date;
  week: number; // 1..10
  msLeft: number;
  daysLeft: number;
  progress: number;
}

/** Ancre de saison : début (lundi) et numéro de la saison qui commence à cette date. */
export interface SeasonAnchor {
  start: number;
  number: number;
}

export function getSeason(anchor: SeasonAnchor, now = Date.now()): SeasonInfo {
  const idx = Math.max(0, Math.floor((now - anchor.start) / SEASON_MS));
  const start = anchor.start + idx * SEASON_MS;
  const end = start + SEASON_MS;
  return {
    number: anchor.number + idx,
    start: new Date(start),
    end: new Date(end),
    week: Math.floor((now - start) / WEEK) + 1,
    msLeft: end - now,
    daysLeft: Math.ceil((end - now) / DAY),
    progress: (now - start) / SEASON_MS,
  };
}

/** Lundi 00:00 de la semaine contenant la date */
export function startOfWeek(date: number): number {
  return EPOCH + Math.floor((date - EPOCH) / WEEK) * WEEK;
}

/** Index de semaine (lundi → dimanche) depuis l'époque. Une nuit qui finit avant 8h compte pour la veille. */
export function weekIndex(date: Date | string | number): number {
  const t = new Date(date).getTime() - 8 * 3600_000;
  return Math.floor((t - EPOCH) / WEEK);
}

/** Nombre de semaines consécutives avec au moins une sortie (la semaine en cours ne casse pas la série). */
export function computeStreak(dates: string[], now = Date.now()): number {
  const weeks = new Set(dates.map(weekIndex));
  let w = weekIndex(now);
  if (!weeks.has(w)) w -= 1;
  let streak = 0;
  while (weeks.has(w)) {
    streak++;
    w--;
  }
  return streak;
}

export function isSameNight(a: Date | string, b: Date | string): boolean {
  const shift = (d: Date | string) => new Date(new Date(d).getTime() - 8 * 3600_000).toDateString();
  return shift(a) === shift(b);
}

export function formatCountdown(ms: number): string {
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / 3600_000);
  if (d > 0) return `${d}j ${h}h`;
  const m = Math.floor((ms % 3600_000) / 60_000);
  return `${h}h ${m}min`;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'hier';
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const WEEKDAYS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];

export function formatEventDate(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  const today = new Date(now);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(today)) / DAY);
  const hour = `${d.getHours()}h${d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : ''}`;
  if (diffDays === 0) return `Ce soir · ${hour}`;
  if (diffDays === 1) return `Demain · ${hour}`;
  if (diffDays < 7) return `${WEEKDAYS[d.getDay()]} · ${hour}`;
  return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · ${hour}`;
}

export const DAY_MS = DAY;
export const WEEK_MS = WEEK;

const NIGHT_SHIFT = 8 * 3600_000;

/** Index de « journée de fête » (de 8h à 8h) depuis l'époque */
export function dayIndex(date: Date | string | number): number {
  return Math.floor((new Date(date).getTime() - NIGHT_SHIFT - EPOCH) / DAY);
}

export function dayWindow(d: number): [number, number] {
  const start = EPOCH + d * DAY + NIGHT_SHIFT;
  return [start, start + DAY];
}

export function weekWindow(w: number): [number, number] {
  const start = EPOCH + w * WEEK + NIGHT_SHIFT;
  return [start, start + WEEK];
}
