export interface PlayerStats {
  outings: number;
  places: number;
  cities: number;
  streak: number;
  bestStreak: number;
  referrals: number;
  friends: number;
  debriefs: number;
  posts: number;
  challengesDone: number;
  squadNights: number;
  events: number;
  ovr: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colors: [string, string];
  /** XP accordée au déblocage (0 pour les paliers de note, pour éviter les boucles) */
  xp: number;
  goal: number;
  value: (s: PlayerStats) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'premiere', name: 'Première sortie', description: 'Valide ta première sortie', emoji: '🚪', colors: ['#8b3dff', '#3d7bff'], xp: 100, goal: 1, value: (s) => s.outings },
  { id: 'squad', name: 'Squad goals', description: 'Sors avec au moins 3 amis', emoji: '👯', colors: ['#12c9b5', '#2f8cff'], xp: 120, goal: 1, value: (s) => s.squadNights },
  { id: 'explorer5', name: 'Explorateur', description: 'Visite 5 lieux différents', emoji: '🗺️', colors: ['#12c9b5', '#7bd84a'], xp: 150, goal: 5, value: (s) => s.places },
  { id: 'globe', name: 'Globe-trotter', description: 'Sors dans 2 villes différentes', emoji: '🧳', colors: ['#2f8cff', '#12c9b5'], xp: 150, goal: 2, value: (s) => s.cities },
  { id: 'serie4', name: 'En feu', description: 'Atteins une série de 4 semaines', emoji: '🔥', colors: ['#ff8a2a', '#ff4fa3'], xp: 200, goal: 4, value: (s) => s.bestStreak },
  { id: 'events3', name: 'VIP des événements', description: 'Participe à 3 événements spéciaux', emoji: '🎟️', colors: ['#ffb21e', '#ff8a2a'], xp: 200, goal: 3, value: (s) => s.events },
  { id: 'debrief5', name: 'Débriefeur', description: 'Fais 5 débriefs', emoji: '🗳️', colors: ['#3d7bff', '#8b3dff'], xp: 120, goal: 5, value: (s) => s.debriefs },
  { id: 'conteur', name: 'Conteur', description: 'Publie 5 anecdotes', emoji: '📝', colors: ['#ff4fa3', '#ffb21e'], xp: 100, goal: 5, value: (s) => s.posts },
  { id: 'defis10', name: 'Chasseur de défis', description: 'Relève 10 défis', emoji: '🎯', colors: ['#ff5e5e', '#ff8a2a'], xp: 250, goal: 10, value: (s) => s.challengesDone },
  { id: 'explorer10', name: 'Grand explorateur', description: 'Visite 10 lieux différents', emoji: '🧭', colors: ['#12c9b5', '#3d7bff'], xp: 300, goal: 10, value: (s) => s.places },
  { id: 'recruteur', name: 'Recruteur', description: 'Parraine 5 amis', emoji: '🤝', colors: ['#2f8cff', '#8b3dff'], xp: 300, goal: 5, value: (s) => s.referrals },
  { id: 'serie8', name: 'Inarrêtable', description: 'Atteins une série de 8 semaines', emoji: '☄️', colors: ['#ff4fa3', '#8b3dff'], xp: 400, goal: 8, value: (s) => s.bestStreak },
  { id: 'tour', name: 'Tour de France', description: 'Sors dans 4 villes NIGHTRANK', emoji: '🇫🇷', colors: ['#3d7bff', '#ff5e5e'], xp: 400, goal: 4, value: (s) => s.cities },
  { id: 'marathon', name: 'Marathonien', description: '25 sorties au total', emoji: '🏃', colors: ['#ff8a2a', '#ffb21e'], xp: 400, goal: 25, value: (s) => s.outings },
  { id: 'ovr70', name: 'Palier 70', description: 'Atteins 70 de général', emoji: '🥉', colors: ['#3d7bff', '#6d3aff'], xp: 0, goal: 70, value: (s) => s.ovr },
  { id: 'ovr80', name: 'Palier 80', description: 'Atteins 80 de général', emoji: '🥈', colors: ['#8b3dff', '#ff4fa3'], xp: 0, goal: 80, value: (s) => s.ovr },
  { id: 'ovr90', name: 'Palier 90', description: 'Atteins 90 de général', emoji: '🥇', colors: ['#ff4fa3', '#ffb21e'], xp: 0, goal: 90, value: (s) => s.ovr },
  { id: 'ovr99', name: 'Icône', description: 'Atteins 99 de général', emoji: '👑', colors: ['#ffcf3c', '#ff4fa3'], xp: 0, goal: 99, value: (s) => s.ovr },
];
