import type { Team } from '../types';

export const MY_TEAM_ID = 'insomniaques';

export const TEAMS: Team[] = [
  { id: 'insomniaques', name: 'Les Insomniaques', emoji: '🌙', color: '#a855f7', schoolId: 'neoma-rouen', members: ['me', 'lucas', 'ines', 'tom', 'jade'] },
  { id: 'hiboux', name: 'Les Hiboux', emoji: '🦉', color: '#3b82f6', schoolId: 'univ-rouen', members: ['hugo', 'lea', 'yanis', 'chloe'] },
  { id: 'crew76', name: 'Crew 76', emoji: '⚡️', color: '#22d3ee', schoolId: 'insa-rouen', members: ['sacha', 'mael', 'lina', 'enzo'] },
  { id: 'bass', name: 'Bass Squad', emoji: '🔊', color: '#f97316', schoolId: 'esigelec', members: ['camille', 'nathan', 'manon'] },
  { id: 'rivegauche', name: 'Rive Gauche Gang', emoji: '🗼', color: '#eab308', schoolId: 'sorbonne', members: ['theo', 'zoe', 'rayan', 'emma'] },
  { id: 'calanqueurs', name: 'Les Calanqueurs', emoji: '⛵', color: '#ec4899', schoolId: 'kedge-marseille', members: ['louis', 'sarah', 'adam', 'jules'] },
  { id: 'chti', name: "Ch'ti Party", emoji: '🍟', color: '#10b981', schoolId: 'skema-lille', members: ['clara', 'matteo', 'ambre', 'nolan'] },
  { id: 'nord', name: 'Nord Sound', emoji: '🧭', color: '#f43f5e', schoolId: 'ieseg', members: ['louise', 'ethan', 'romane'] },
  { id: 'girondins', name: 'Les Girondins de la nuit', emoji: '🍇', color: '#9b1f5c', schoolId: 'univ-bordeaux', members: ['baptiste', 'lou', 'malo', 'ines.b'] },
  { id: 'breizh', name: 'Breizh Night', emoji: '🌊', color: '#14b8a6', schoolId: 'rennes-sb', members: ['gabin', 'maya', 'axel', 'elise'] },
];

export const teamById = (id: string) => TEAMS.find((t) => t.id === id);
