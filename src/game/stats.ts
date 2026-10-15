import type { StatId } from '../types';
import { STAT_CURVE } from './config';

export interface StatDef {
  id: StatId;
  name: string;
  short: string;
  emoji: string;
  color: string;
  description: string;
  /** comment la faire progresser */
  howTo: string;
}

export const STATS: StatDef[] = [
  { id: 'ambiance', name: "L'Ambianceur", short: 'AMB', emoji: '🎉', color: '#ff4fa3', description: 'Met le feu dès son arrivée', howTo: 'Votes « Ambianceur » au débrief, défis d’ambiance' },
  { id: 'piste', name: 'Roi de la piste', short: 'PST', emoji: '🕺', color: '#8b3dff', description: 'Ne quitte jamais le dancefloor', howTo: 'Votes « Roi de la piste », défis danse' },
  { id: 'endurance', name: 'Marathonien', short: 'END', emoji: '🌅', color: '#ff8a2a', description: 'Toujours là à la fermeture', howTo: 'Votes « Marathonien », défi Fermeture' },
  { id: 'social', name: 'Pote de tout le monde', short: 'SOC', emoji: '🤝', color: '#2f8cff', description: 'Connaît tout le monde avant minuit', howTo: 'Nouveaux amis, parrainages, anecdotes' },
  { id: 'explorateur', name: 'Globe-trotter nocturne', short: 'EXP', emoji: '🗺️', color: '#12c9b5', description: 'Toujours partant pour un nouveau spot', howTo: 'Nouveaux lieux, nouvelles villes' },
  { id: 'galopeur', name: 'Le Galopeur', short: 'GAL', emoji: '⚡', color: '#ffb21e', description: 'Toujours en mouvement, jamais au même endroit', howTo: 'Plusieurs lieux dans la même nuit, défis mouvement' },
  { id: 'capitaine', name: 'Le Capitaine', short: 'CAP', emoji: '🧭', color: '#3d7bff', description: 'Organise, rassemble et ramène tout le monde', howTo: 'Sorties en squad, défis Retour en équipe' },
  { id: 'infatigable', name: "L'Infatigable", short: 'INF', emoji: '🔥', color: '#ff5e5e', description: 'Jamais une semaine sans sortir', howTo: 'Séries hebdomadaires, sorties régulières' },
];

export const statById = (id: StatId) => STATS.find((s) => s.id === id)!;

export function statCost(value: number): number {
  return Math.round(STAT_CURVE.base * Math.pow(STAT_CURVE.growth, value - STAT_CURVE.pivot));
}

/** Valeur d'une stat à partir de sa base (questionnaire) et de l'XP de stat accumulée */
export function statFromXp(base: number, xp: number): { value: number; progress: number } {
  let v = base;
  let rest = xp;
  while (v < 99 && rest >= statCost(v)) {
    rest -= statCost(v);
    v++;
  }
  return { value: v, progress: v >= 99 ? 1 : rest / statCost(v) };
}
