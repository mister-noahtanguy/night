/**
 * Réglages du système de progression.
 * Toutes les valeurs d'équilibrage sont ici : récompenses d'XP, plafonds anti-triche, courbes.
 */

/** Courbe de la note générale : coût en XP pour passer de n à n+1 = base × growth^(n − pivot) */
export const RATING_CURVE = {
  min: 1,
  max: 99,
  base: 90,
  growth: 1.075,
  pivot: 46,
};

/** Fourchette de départ après le questionnaire */
export const START_RATING = {
  /** profil le moins festif : 46 → 56 */
  lowRange: [46, 56] as [number, number],
  /** décalage maximal appliqué aux deux bornes pour un profil très festif : 50 → 60 */
  maxShift: 4,
};

/** Courbe des statistiques (même principe, plus rapide) */
export const STAT_CURVE = {
  base: 10,
  growth: 1.05,
  pivot: 30,
};

/** Récompenses d'XP hors défis */
export const XP_REWARDS = {
  checkInBase: 20,
  /** XP supplémentaire par point de coefficient de la boîte (x1 à x10) */
  checkInPerCoef: 4,
  newPlace: 60,
  event: 50,
  squad: 20,
  debrief: 20,
  post: 15,
  friendAdded: 10,
  referral: 100,
  streakWeek: 50,
};

/** Garde-fous contre les répétitions abusives */
export const LIMITS = {
  /** XP maximale par jour hors défis et accomplissements */
  dailyFreeXpCap: 300,
  /** check-ins rapportant de l'XP par nuit */
  checkInsPerNight: 2,
  /** anecdotes rapportant de l'XP par jour */
  postsPerDay: 1,
  /** ajouts d'amis rapportant de l'XP par jour */
  friendsPerDay: 3,
  /** parrainages récompensés au total */
  referralsMax: 10,
  /** délai minimal entre deux check-ins (minutes) */
  checkInCooldownMin: 30,
};
