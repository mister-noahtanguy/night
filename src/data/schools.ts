import type { CityId, School } from '../types';

export const CITIES: Record<CityId, { name: string; emoji: string }> = {
  rouen: { name: 'Rouen', emoji: '⛪' },
  paris: { name: 'Paris', emoji: '🗼' },
  rennes: { name: 'Rennes', emoji: '🌧️' },
  lille: { name: 'Lille', emoji: '🍟' },
  marseille: { name: 'Marseille', emoji: '⛵' },
  bordeaux: { name: 'Bordeaux', emoji: '🍇' },
};

export const CITY_IDS = Object.keys(CITIES) as CityId[];

export const SCHOOLS: School[] = [
  { id: 'neoma-rouen', tag: 'NEOMA', name: 'NEOMA Business School', short: 'NEOMA', city: 'rouen', color: '#e6007e' },
  { id: 'univ-rouen', tag: 'URN', name: 'Université de Rouen Normandie', short: 'Univ. Rouen', city: 'rouen', color: '#2c8cff' },
  { id: 'insa-rouen', tag: 'INSA', name: 'INSA Rouen Normandie', short: 'INSA Rouen', city: 'rouen', color: '#e2001a' },
  { id: 'esigelec', tag: 'ESIG', name: 'ESIGELEC', short: 'ESIGELEC', city: 'rouen', color: '#00a3e0' },
  { id: 'sorbonne', tag: 'SU', name: 'Sorbonne Université', short: 'Sorbonne', city: 'paris', color: '#c9a227' },
  { id: 'sciencespo', tag: 'SCPO', name: 'Sciences Po Paris', short: 'Sciences Po', city: 'paris', color: '#d4003a' },
  { id: 'kedge-marseille', tag: 'KEDGE', name: 'KEDGE Business School', short: 'KEDGE', city: 'marseille', color: '#00b2a9' },
  { id: 'amu', tag: 'AMU', name: 'Aix-Marseille Université', short: 'AMU', city: 'marseille', color: '#0069b4' },
  { id: 'univ-bordeaux', tag: 'UBX', name: 'Université de Bordeaux', short: 'Univ. Bordeaux', city: 'bordeaux', color: '#9b1f5c' },
  { id: 'inseec-bordeaux', tag: 'INSEEC', name: 'INSEEC Bordeaux', short: 'INSEEC', city: 'bordeaux', color: '#ff5a1f' },
  { id: 'skema-lille', tag: 'SKEMA', name: 'SKEMA Business School', short: 'SKEMA', city: 'lille', color: '#7a2cff' },
  { id: 'ieseg', tag: 'IÉSEG', name: 'IÉSEG School of Management', short: 'IÉSEG', city: 'lille', color: '#ff6b00' },
  { id: 'univ-lille', tag: 'ULILLE', name: 'Université de Lille', short: 'Univ. Lille', city: 'lille', color: '#ff3d71' },
  { id: 'rennes-sb', tag: 'RSB', name: 'Rennes School of Business', short: 'Rennes SB', city: 'rennes', color: '#00c389' },
  { id: 'rennes2', tag: 'UR2', name: 'Université Rennes 2', short: 'Rennes 2', city: 'rennes', color: '#ffb800' },
  { id: 'autre', tag: '—', name: 'Autre établissement', short: 'Autre', city: 'paris', color: '#8d88ab' },
];

export const schoolById = (id: string) => SCHOOLS.find((s) => s.id === id) ?? SCHOOLS[SCHOOLS.length - 1];
