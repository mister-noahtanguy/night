import type { QuizAnswers, StatId, StatMap } from '../types';
import { QUESTIONS } from '../data/quiz';
import { START_RATING } from './config';
import { STATS } from './stats';

/** Score festif déclaré, de 0 (très calme) à 1 (très festif). Les questions sans poids (alcool…) n'ont aucun effet. */
export function partyIntensity(answers: QuizAnswers): number {
  let sum = 0;
  let weights = 0;
  for (const q of QUESTIONS) {
    if (!q.weight) continue;
    const opt = q.options.find((o) => o.id === answers[q.id]);
    sum += q.weight * (opt?.intensity ?? 0.5);
    weights += q.weight;
  }
  return weights ? sum / weights : 0.5;
}

/** Fourchette de départ déterminée par les réponses */
export function startRange(answers: QuizAnswers): [number, number] {
  const shift = Math.round(partyIntensity(answers) * START_RATING.maxShift);
  const [lo, hi] = START_RATING.lowRange;
  return [lo + shift, hi + shift];
}

/** Tirage dans la fourchette (distribution en cloche douce : les extrêmes restent possibles mais plus rares) */
export function rollStartRating(answers: QuizAnswers, random = Math.random): number {
  const [lo, hi] = startRange(answers);
  const r = (random() + random()) / 2;
  return lo + Math.round(r * (hi - lo));
}

/** Stats de départ : socle + bonus des réponses + part d'aléatoire */
export function rollBaseStats(answers: QuizAnswers, random = Math.random): StatMap {
  const out = {} as StatMap;
  for (const s of STATS) out[s.id] = 36;
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    for (const [k, v] of Object.entries(opt?.stats ?? {}) as [StatId, number][]) out[k] += v;
  }
  for (const s of STATS) out[s.id] = Math.max(30, Math.min(68, out[s.id] + Math.round((random() - 0.5) * 10)));
  return out;
}

export function topStats(stats: StatMap, n = 3): StatId[] {
  return (Object.keys(stats) as StatId[]).sort((a, b) => stats[b] - stats[a]).slice(0, n);
}
