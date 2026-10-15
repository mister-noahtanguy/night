import type { MockUser, StatId, StatMap } from '../types';
import { schoolById } from './schools';
import { STATS } from '../game/stats';
import { mulberry32 } from '../game/random';

// Profils FICTIFS de démonstration : aucun classement réel n'existe tant qu'il n'y a pas de backend.

type Row = [id: string, name: string, pseudo: string, emoji: string, bg: number, school: string, ovr: number, seasonXp: number, streak: number, team: string | null, fav: string, specialties: StatId[]];

// prettier-ignore
const ROWS: Row[] = [
  // Rouen
  ['lucas', 'Lucas', 'lucas.mrt', '🦊', 2, 'neoma-rouen', 66, 1840, 6, 'insomniaques', 'bridge', ['ambiance', 'social']],
  ['ines', 'Inès', 'ines_lbr', '🦄', 0, 'neoma-rouen', 71, 2210, 8, 'insomniaques', 'grenier', ['piste', 'endurance']],
  ['tom', 'Tom', 'tom.dvl', '🐺', 1, 'neoma-rouen', 58, 1120, 3, 'insomniaques', 'bridge', ['social', 'galopeur']],
  ['jade', 'Jade', 'jade.kr', '🍒', 5, 'neoma-rouen', 64, 1690, 5, 'insomniaques', 'cale', ['capitaine', 'ambiance']],
  ['hugo', 'Hugo', 'hugo.rsn', '🎧', 6, 'univ-rouen', 55, 940, 2, 'hiboux', 'neon76', ['piste', 'galopeur']],
  ['lea', 'Léa', 'lea.bnd', '🌈', 3, 'univ-rouen', 62, 1420, 4, 'hiboux', 'bridge', ['social', 'capitaine']],
  ['yanis', 'Yanis', 'yanis.b', '😎', 4, 'univ-rouen', 52, 610, 1, 'hiboux', 'neon76', ['ambiance', 'piste']],
  ['chloe', 'Chloé', 'chloe.mtx', '🦋', 0, 'univ-rouen', 76, 2930, 9, 'hiboux', 'grenier', ['endurance', 'infatigable']],
  ['sacha', 'Sacha', 'sacha.lfv', '⚡️', 7, 'insa-rouen', 74, 2480, 7, 'crew76', 'grenier', ['galopeur', 'explorateur']],
  ['mael', 'Maël', 'mael_gd', '🐸', 3, 'insa-rouen', 54, 800, 2, 'crew76', 'cale', ['social', 'ambiance']],
  ['lina', 'Lina', 'lina.dcr', '🌚', 6, 'insa-rouen', 61, 1310, 3, 'crew76', 'bridge', ['piste', 'social']],
  ['enzo', 'Enzo', 'enzo.prv', '🔥', 2, 'insa-rouen', 81, 3350, 10, 'crew76', 'grenier', ['infatigable', 'endurance']],
  ['camille', 'Camille', 'camille.fx', '💿', 1, 'esigelec', 49, 450, 1, 'bass', 'neon76', ['explorateur', 'piste']],
  ['nathan', 'Nathan', 'nathan.rgr', '🤖', 4, 'esigelec', 63, 1580, 4, 'bass', 'neon76', ['capitaine', 'galopeur']],
  ['manon', 'Manon', 'manon.bl', '🐼', 5, 'esigelec', 50, 300, 0, 'bass', 'cale', ['social', 'ambiance']],
  ['ambroise', 'Ambroise', 'ambro.zz', '👻', 7, 'neoma-rouen', 60, 1250, 3, null, 'bridge', ['endurance', 'social']],
  ['salome', 'Salomé', 'salome.vt', '🐙', 0, 'neoma-rouen', 56, 720, 2, null, 'cale', ['piste', 'ambiance']],
  ['ilyes', 'Ilyès', 'ilyes.bn', '🦁', 1, 'neoma-rouen', 79, 3010, 6, null, 'grenier', ['ambiance', 'capitaine']],
  ['oceane', 'Océane', 'oceane.lm', '🦉', 3, 'univ-rouen', 47, 180, 1, null, 'cale', ['social', 'explorateur']],
  // Paris
  ['theo', 'Théo', 'theo.mrc', '🐯', 6, 'sorbonne', 78, 2890, 5, 'rivegauche', 'orbite', ['explorateur', 'galopeur']],
  ['zoe', 'Zoé', 'zoe.lm', '🍒', 5, 'sorbonne', 86, 3940, 9, 'rivegauche', 'velours', ['piste', 'ambiance']],
  ['rayan', 'Rayan', 'rayan.kh', '😎', 2, 'sorbonne', 83, 3510, 7, 'rivegauche', 'hangar13', ['endurance', 'piste']],
  ['emma', 'Emma', 'emma.ptt', '🦄', 0, 'sorbonne', 72, 2240, 4, 'rivegauche', 'orbite', ['social', 'capitaine']],
  ['kylian', 'Kylian', 'kylian.mz', '🔥', 2, 'sciencespo', 99, 6120, 10, null, 'velours', ['ambiance', 'social']],
  ['alice', 'Alice', 'alice.gbr', '🦋', 0, 'sciencespo', 94, 5280, 10, null, 'orbite', ['piste', 'infatigable']],
  ['victor', 'Victor', 'victor.hmn', '🦁', 6, 'sciencespo', 91, 4730, 9, null, 'velours', ['capitaine', 'social']],
  ['jeanne', 'Jeanne', 'jeanne.lbl', '🌚', 5, 'sciencespo', 67, 1720, 2, null, 'hangar13', ['explorateur', 'social']],
  // Marseille
  ['louis', 'Louis', 'louis.dbs', '🎧', 1, 'kedge-marseille', 88, 4310, 8, 'calanqueurs', 'calanque', ['ambiance', 'endurance']],
  ['sarah', 'Sarah', 'sarah.bnt', '🌈', 4, 'kedge-marseille', 80, 3120, 6, 'calanqueurs', 'calanque', ['piste', 'social']],
  ['adam', 'Adam', 'adam.lvq', '👽', 7, 'kedge-marseille', 69, 1960, 3, 'calanqueurs', 'docks', ['galopeur', 'ambiance']],
  ['jules', 'Jules', 'jules.crd', '🐺', 3, 'kedge-marseille', 84, 3690, 7, 'calanqueurs', 'calanque', ['capitaine', 'explorateur']],
  ['nour', 'Nour', 'nour.sl', '🌸', 5, 'amu', 77, 2750, 6, null, 'docks', ['social', 'piste']],
  ['mehdi', 'Mehdi', 'mehdi.as', '⚡️', 1, 'amu', 92, 5010, 9, null, 'calanque', ['infatigable', 'galopeur']],
  ['lisa', 'Lisa', 'lisa.cpz', '🐬', 6, 'amu', 59, 980, 2, null, 'docks', ['ambiance', 'social']],
  // Bordeaux
  ['baptiste', 'Baptiste', 'baptiste.lg', '🐼', 3, 'univ-bordeaux', 65, 1650, 3, 'girondins', 'chartrons', ['social', 'capitaine']],
  ['lou', 'Lou', 'lou.bss', '🦊', 0, 'univ-bordeaux', 73, 2390, 5, 'girondins', 'garonne', ['piste', 'endurance']],
  ['malo', 'Malo', 'malo.rtv', '🐻', 2, 'univ-bordeaux', 57, 860, 2, 'girondins', 'chartrons', ['ambiance', 'galopeur']],
  ['ines.b', 'Inès', 'nesss.bdx', '🍇', 5, 'univ-bordeaux', 82, 3420, 8, 'girondins', 'garonne', ['explorateur', 'infatigable']],
  ['hugo.b', 'Hugo', 'hugoo.gironde', '🤠', 4, 'inseec-bordeaux', 70, 2050, 4, null, 'garonne', ['galopeur', 'social']],
  ['margot', 'Margot', 'margot.flx', '🌻', 7, 'inseec-bordeaux', 87, 4160, 9, null, 'garonne', ['ambiance', 'piste']],
  // Lille
  ['clara', 'Clara', 'clara.fnt', '🐙', 3, 'skema-lille', 61, 1390, 4, 'chti', 'quai59', ['social', 'piste']],
  ['matteo', 'Matteo', 'matteo.gsl', '🤖', 6, 'skema-lille', 80, 3260, 8, 'chti', 'aurore', ['endurance', 'galopeur']],
  ['ambre', 'Ambre', 'ambre.rch', '🦊', 5, 'skema-lille', 73, 2300, 5, 'chti', 'vertigo', ['piste', 'ambiance']],
  ['nolan', 'Nolan', 'nolan.dpt', '🐸', 4, 'skema-lille', 57, 990, 2, 'chti', 'quai59', ['social', 'explorateur']],
  ['louise', 'Louise', 'louise.mrl', '🦉', 0, 'ieseg', 85, 3870, 9, 'nord', 'aurore', ['capitaine', 'infatigable']],
  ['ethan', 'Ethan', 'ethan.vrs', '👻', 7, 'ieseg', 75, 2620, 6, 'nord', 'quai59', ['galopeur', 'endurance']],
  ['romane', 'Romane', 'romane.trd', '🍒', 2, 'ieseg', 68, 1830, 3, 'nord', 'vertigo', ['piste', 'social']],
  ['samy', 'Samy', 'samy.kd', '😎', 1, 'univ-lille', 53, 720, 1, null, 'vertigo', ['ambiance', 'galopeur']],
  ['eva', 'Eva', 'eva.mrn', '🌈', 5, 'univ-lille', 82, 3300, 7, null, 'aurore', ['explorateur', 'social']],
  // Rennes
  ['gabin', 'Gabin', 'gabin.lcl', '🐯', 4, 'rennes-sb', 57, 880, 2, 'breizh', 'fabrique', ['capitaine', 'social']],
  ['maya', 'Maya', 'maya.sll', '🦄', 0, 'rennes-sb', 76, 2780, 6, 'breizh', 'phare', ['piste', 'ambiance']],
  ['axel', 'Axel', 'axel.brd', '🔥', 2, 'rennes-sb', 63, 1500, 4, 'breizh', 'fabrique', ['galopeur', 'endurance']],
  ['elise', 'Élise', 'elise.ndr', '🦋', 6, 'rennes-sb', 79, 2990, 7, 'breizh', 'phare', ['explorateur', 'capitaine']],
  ['timeo', 'Timéo', 'timeo.prd', '🎧', 7, 'rennes2', 51, 560, 1, null, 'fabrique', ['ambiance', 'social']],
  ['nina', 'Nina', 'nina.rss', '🐙', 5, 'rennes2', 67, 1770, 3, null, 'phare', ['piste', 'social']],
  ['lena', 'Léna', 'lena.fbr', '🌚', 3, 'rennes2', 89, 4420, 8, null, 'phare', ['infatigable', 'endurance']],
];

const rand = mulberry32(99);

function buildStats(ovr: number, specialties: StatId[]): StatMap {
  const out = {} as StatMap;
  for (const s of STATS) {
    const spec = specialties.indexOf(s.id);
    const v = spec >= 0 ? ovr + 9 - spec * 3 + Math.round(rand() * 4) : ovr - 14 + Math.round(rand() * 16);
    out[s.id] = Math.max(25, Math.min(99, v));
  }
  return out;
}

export const USERS: MockUser[] = ROWS.map(([id, name, pseudo, emoji, bg, school, ovr, seasonXp, streak, team, fav, specialties]) => ({
  id,
  name,
  pseudo,
  avatar: { emoji, bg },
  schoolId: school,
  city: schoolById(school).city,
  ovr,
  seasonXp,
  streak,
  stats: buildStats(ovr, specialties),
  achievements: Math.round(3 + (ovr - 45) / 4 + rand() * 3),
  teamId: team ?? undefined,
  favClubId: fav,
}));

export const userById = (id: string) => USERS.find((u) => u.id === id);

/** Amis de l'utilisateur dans le profil démo */
export const DEMO_FRIENDS = ['lucas', 'ines', 'tom', 'jade', 'hugo', 'lea', 'yanis', 'sacha', 'camille', 'theo', 'clara', 'gabin'];

/** Demandes d'ami reçues (à accepter ou refuser) */
export const DEMO_INCOMING = ['nour', 'malo'];
