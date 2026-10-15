import type { NightEvent } from '../types';
import { DAY_MS } from '../game/season';

type Row = [clubId: string, title: string, daysFromNow: number, hour: number, minute: number, special: boolean, lineup: string];

// prettier-ignore
const ROWS: Row[] = [
  ['calanque', 'Sunset Rooftop', 0, 21, 0, true, 'Kalïa · Nemo'],
  ['garonne', 'Bunker Techno', 1, 23, 30, true, 'Rotor · Mila K.'],
  ['docks', 'Open Mic Étudiant', 2, 22, 0, false, 'Micro ouvert'],
  ['chartrons', 'Karaoké Géant', 3, 22, 0, true, 'DJ Sardine'],
  ['bridge', 'Jeudi Étudiant XXL', 0, 23, 0, true, 'DJ Kaori · Max Lenoir'],
  ['grenier', 'Warehouse Session', 0, 23, 30, false, 'Ilyana b2b Rotor'],
  ['fabrique', 'Soirée Inter-Promos', 0, 23, 0, true, 'Collectif Breizh Bass'],
  ['neon76', 'Rap FR Only', 1, 23, 0, true, 'DJ Sékou · Mamba'],
  ['quai59', 'Erasmus Night', 1, 23, 0, true, 'DJ Vanille'],
  ['orbite', 'Orbite 360°', 1, 23, 59, false, 'Kessa · Nøva · Linea'],
  ['cale', 'Karaoké Party', 2, 22, 0, false, 'Micro ouvert toute la nuit'],
  ['velours', 'Velours Gala', 2, 23, 30, true, 'Special guest international'],
  ['phare', 'Disco Sunset', 2, 20, 0, true, 'Les Disquaires'],
  ['aurore', 'Aurore After', 2, 23, 0, true, 'Solène · Oko'],
  ['hangar13', 'Bass Factory', 3, 23, 0, true, 'Hypnotik · Dubzilla · Kaze'],
  ['vertigo', 'Noche Latina', 4, 22, 30, false, 'DJ Luz · cours de bachata à 22h30'],
  ['bridge', 'Bridge Boat Party', 7, 23, 0, false, 'Résidents du Bridge'],
  ['neon76', 'Afro Vibes', 8, 23, 0, false, 'Afrolov Crew'],
  ['grenier', 'Grenier 24h', 9, 22, 0, true, 'Line-up surprise'],
  ['velours', 'Nuit Dorée', 9, 23, 30, false, 'Résidents Velours'],
  ['orbite', 'Laser Night', 8, 23, 59, true, 'Avian · Reka'],
  ['fabrique', 'Pop Party', 7, 23, 0, false, 'DJ Moussaillon'],
  ['quai59', 'Techno Mercredi', 6, 23, 0, false, 'Kraft · Eloa'],
  ['cale', '2000’s Revival', 9, 22, 0, true, 'DJ Nostalgie'],
];

function at(daysFromNow: number, hour: number, minute: number): string {
  const d = new Date(Date.now() + daysFromNow * DAY_MS);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const EVENTS: NightEvent[] = ROWS.map(([clubId, title, days, h, m, special, lineup], i) => ({
  id: `ev-${i}`,
  clubId,
  title,
  date: at(days, h, m),
  special,
  lineup,
})).sort((a, b) => a.date.localeCompare(b.date));

export const eventsForClub = (clubId: string) => EVENTS.filter((e) => e.clubId === clubId);

/** Événement spécial ce soir dans ce lieu (bonus d'XP de participation) */
export function specialTonight(clubId: string, now = Date.now()) {
  const night = (t: number) => new Date(t - 8 * 3600_000).toDateString();
  return EVENTS.find((e) => e.clubId === clubId && e.special && night(new Date(e.date).getTime()) === night(now));
}
