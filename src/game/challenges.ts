import type { StatMap } from '../types';
import { mulberry32 } from './random';

export type ChallengePeriod = 'daily' | 'weekly' | 'team';

/**
 * Validation :
 * - automatique : calculée à partir des sorties, débriefs, publications… de la période
 * - `declare` : l'utilisateur déclare, un ami présent confirme (jamais de preuve intime)
 * - `team` : progression collective de l'équipe
 */
export type ChallengeRule =
  | { type: 'checkins'; goal: number }
  | { type: 'places'; goal: number }
  | { type: 'newplace'; goal: number }
  | { type: 'event'; goal: number }
  | { type: 'squad'; friends: number }
  | { type: 'samenight'; goal: number }
  | { type: 'debrief'; goal: number }
  | { type: 'post'; goal: number }
  | { type: 'friend'; goal: number }
  | { type: 'referral'; goal: number }
  | { type: 'declare' }
  | { type: 'team-outings'; goal: number }
  | { type: 'team-places'; goal: number };

export interface ChallengeDef {
  id: string;
  period: ChallengePeriod;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  stats: Partial<StatMap>;
  rule: ChallengeRule;
}

export const DAILY_POOL: ChallengeDef[] = [
  { id: 'd-checkin', period: 'daily', title: 'Sortie validée', description: 'Valide une sortie dans un lieu partenaire.', emoji: '📍', xp: 40, stats: { infatigable: 15 }, rule: { type: 'checkins', goal: 1 } },
  { id: 'd-post', period: 'daily', title: 'Le conteur', description: 'Raconte une anecdote de soirée dans la communauté.', emoji: '📝', xp: 30, stats: { social: 10, ambiance: 5 }, rule: { type: 'post', goal: 1 } },
  { id: 'd-friend', period: 'daily', title: 'Nouveau visage', description: 'Ajoute un nouvel ami sur NIGHTRANK.', emoji: '👋', xp: 35, stats: { social: 15 }, rule: { type: 'friend', goal: 1 } },
  { id: 'd-debrief', period: 'daily', title: 'Débriefeur', description: 'Fais le débrief d’une soirée avec tes potes.', emoji: '🗳️', xp: 35, stats: { social: 10 }, rule: { type: 'debrief', goal: 1 } },
  { id: 'd-firstdance', period: 'daily', title: 'Premier sur la piste', description: 'Lance la danse avant tout le monde. Un pote présent confirme.', emoji: '🕺', xp: 60, stats: { piste: 25 }, rule: { type: 'declare' } },
  { id: 'd-hometeam', period: 'daily', title: 'Retour en équipe', description: 'Rentre avec au moins un pote. Il confirme que tout le monde est bien rentré.', emoji: '🧭', xp: 50, stats: { capitaine: 25 }, rule: { type: 'declare' } },
  { id: 'd-compliment', period: 'daily', title: 'Compliment gratuit', description: 'Fais un compliment sincère à quelqu’un. Un pote confirme.', emoji: '💐', xp: 45, stats: { social: 20 }, rule: { type: 'declare' } },
  { id: 'd-dj', period: 'daily', title: 'Négociateur de playlist', description: 'Fais passer un son (poliment) au DJ. Un pote confirme.', emoji: '🎛️', xp: 45, stats: { ambiance: 15, piste: 10 }, rule: { type: 'declare' } },
  { id: 'd-water', period: 'daily', title: 'Hydratation de champion', description: 'Pense à boire de l’eau toute la soirée. Un pote confirme.', emoji: '💧', xp: 40, stats: { endurance: 15 }, rule: { type: 'declare' } },
];

export const WEEKLY_POOL: ChallengeDef[] = [
  { id: 'w-2outings', period: 'weekly', title: 'Double sortie', description: 'Valide 2 sorties cette semaine.', emoji: '✌️', xp: 150, stats: { infatigable: 30 }, rule: { type: 'checkins', goal: 2 } },
  { id: 'w-places', period: 'weekly', title: 'Explorateur', description: 'Sors dans 2 lieux différents cette semaine.', emoji: '🗺️', xp: 160, stats: { explorateur: 35 }, rule: { type: 'places', goal: 2 } },
  { id: 'w-newplace', period: 'weekly', title: 'Terra incognita', description: 'Découvre un lieu où tu n’es jamais allé.', emoji: '🧭', xp: 180, stats: { explorateur: 40 }, rule: { type: 'newplace', goal: 1 } },
  { id: 'w-event', period: 'weekly', title: 'Soirée spéciale', description: 'Participe à un événement spécial dans un lieu partenaire.', emoji: '🎟️', xp: 170, stats: { ambiance: 25 }, rule: { type: 'event', goal: 1 } },
  { id: 'w-squad', period: 'weekly', title: 'Capitaine de soirée', description: 'Sors avec au moins 3 amis qui valident aussi leur sortie.', emoji: '👯', xp: 220, stats: { capitaine: 40 }, rule: { type: 'squad', friends: 3 } },
  { id: 'w-galop', period: 'weekly', title: 'Tour de piste', description: 'Valide 2 lieux différents dans la même nuit.', emoji: '⚡', xp: 180, stats: { galopeur: 40 }, rule: { type: 'samenight', goal: 2 } },
  { id: 'w-closing', period: 'weekly', title: 'Jusqu’au bout', description: 'Reste jusqu’à la fin de la soirée et rentre en sécurité. Un pote confirme.', emoji: '🌅', xp: 160, stats: { endurance: 35 }, rule: { type: 'declare' } },
  { id: 'w-battle', period: 'weekly', title: 'Battle de danse', description: 'Lance une battle de danse (bienveillante). Un pote confirme.', emoji: '🪩', xp: 200, stats: { piste: 40 }, rule: { type: 'declare' } },
  { id: 'w-referral', period: 'weekly', title: 'Ambassadeur', description: 'Fais rejoindre un ami sur NIGHTRANK.', emoji: '🎁', xp: 200, stats: { social: 30 }, rule: { type: 'referral', goal: 1 } },
];

export const TEAM_POOL: ChallengeDef[] = [
  { id: 't-squad', period: 'team', title: 'Squad au complet', description: '4 membres de ton équipe valident une sortie cette semaine.', emoji: '🛡️', xp: 300, stats: { capitaine: 30, social: 15 }, rule: { type: 'team-outings', goal: 4 } },
  { id: 't-tour', period: 'team', title: 'Tour de ville', description: 'Ton équipe visite 4 lieux différents cette semaine.', emoji: '🏙️', xp: 280, stats: { explorateur: 30, galopeur: 15 }, rule: { type: 'team-places', goal: 4 } },
];

export const ALL_CHALLENGES = [...DAILY_POOL, ...WEEKLY_POOL, ...TEAM_POOL];
export const challengeById = (id: string) => ALL_CHALLENGES.find((c) => c.id === id)!;

function pick(pool: ChallengeDef[], n: number, seed: number, requireDeclare: boolean): ChallengeDef[] {
  const rand = mulberry32(seed * 7919 + 13);
  // Fisher-Yates : même rotation sur tous les moteurs JavaScript
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const out = shuffled.slice(0, n);
  if (requireDeclare && !out.some((c) => c.rule.type === 'declare')) {
    const d = shuffled.find((c) => c.rule.type === 'declare');
    if (d) out[n - 1] = d;
  }
  if (!requireDeclare && out.filter((c) => c.rule.type === 'declare').length > 1) {
    const auto = shuffled.find((c) => c.rule.type !== 'declare' && !out.includes(c));
    const idx = out.findIndex((c) => c.rule.type === 'declare');
    if (auto) out[idx] = auto;
  }
  return out;
}

/** Défis actifs pour un jour / une semaine donnés : rotation déterministe */
export function activeChallenges(dayIndex: number, weekIdx: number) {
  return {
    daily: pick(DAILY_POOL, 3, dayIndex, true),
    weekly: pick(WEEKLY_POOL, 4, weekIdx + 1000, true),
    team: TEAM_POOL,
  };
}
