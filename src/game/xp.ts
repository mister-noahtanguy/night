import { XP_REWARDS } from './config';

/** XP de base d'une sortie validée dans un lieu, hors bonus */
export const checkInXp = (coefficient: number) => XP_REWARDS.checkInBase + XP_REWARDS.checkInPerCoef * coefficient;
