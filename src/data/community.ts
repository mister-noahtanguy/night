import type { Post, PostKind } from '../types';

type Row = [authorId: string, kind: PostKind, minutesAgo: number, text: string, fire: number, laugh: number, crown: number, participants?: number];

// Publications FICTIVES de démonstration
// prettier-ignore
const ROWS: Row[] = [
  ['lucas', 'anecdote', 25, 'J’ai perdu Tom pendant 45 minutes au Bridge. Il était juste derrière moi, en train de danser avec une plante verte.', 34, 51, 3],
  ['ines', 'achievement', 50, 'Passée à 71 de général 🥳 Le Roi de la piste est à 79, merci à celles et ceux qui ont voté au débrief !', 42, 2, 18],
  ['louis', 'challenge', 90, 'DÉFI MARSEILLE 🌅 : qui fait le plus de lieux différents ce week-end ? Les Calanqueurs prennent les paris.', 27, 4, 9, 38],
  ['zoe', 'anecdote', 140, 'Le DJ de Velours a accepté ma demande de son… puis l’a remixée en version disco. Je suis partagée entre la fierté et la trahison.', 61, 88, 12],
  ['margot', 'achievement', 210, 'Accomplissement « Tour de France » débloqué ! Bordeaux, Paris, Lille, Rennes : la tournée est finie 🇫🇷', 55, 3, 31],
  ['theo', 'challenge', 300, 'Défi de la semaine : Battle de danse bienveillante samedi à L’Orbite. Seule règle : on applaudit tout le monde.', 40, 12, 7, 64],
  ['sacha', 'anecdote', 420, 'Record perso : 3 lieux dans la même nuit, 14 000 pas, et j’ai quand même retrouvé tout le monde au vestiaire. Le Galopeur, c’est moi.', 29, 17, 5],
  ['nour', 'anecdote', 520, 'Le videur des Docks m’a reconnue et a dit « ah, l’Ambianceuse ». J’ai jamais été aussi fière d’un surnom.', 47, 36, 9],
  ['jade', 'challenge', 700, 'Les Insomniaques lancent le défi « Retour en équipe » ce jeudi : personne ne rentre seul, on se confirme tous dans l’app 🧭', 38, 2, 14, 21],
  ['kylian', 'achievement', 900, '99 de général. Je ne sais pas quoi dire. Merci à toutes les personnes croisées sur les pistes cette année 👑', 212, 9, 147],
  ['hugo', 'anecdote', 1300, 'On a fait le débrief au petit-déj et tout le monde a voté pour moi en « Marathonien ». Je dormais à 1h30. Complot.', 18, 64, 2],
  ['eva', 'anecdote', 1700, 'Quelqu’un a lancé « Le pas chassé de mariage » au Quai 59. 200 personnes ont suivi. Lille, je t’aime.', 52, 70, 11],
];

export function buildCommunity(now = Date.now()): Post[] {
  return ROWS.map(([authorId, kind, min, text, fire, laugh, crown, participants], i) => ({
    id: `post-${i}`,
    authorId,
    kind,
    text,
    date: new Date(now - min * 60_000).toISOString(),
    reactions: { '🔥': fire, '😂': laugh, '👑': crown },
    participants,
  }));
}
