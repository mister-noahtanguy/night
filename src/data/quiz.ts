import type { QuizAnswers, StatMap } from '../types';

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  /** petite réaction affichée après le choix */
  reaction?: string;
  /** 0 → profil calme, 1 → profil très festif (influence la fourchette de départ) */
  intensity?: number;
  /** bonus appliqués aux stats de départ */
  stats?: Partial<StatMap>;
}

export interface QuizQuestion {
  id: Exclude<keyof QuizAnswers, 'height'>;
  chapter: string;
  title: string;
  subtitle?: string;
  emoji: string;
  /** poids dans le calcul de la fourchette de départ (0 = aucune influence) */
  weight: number;
  optional?: boolean;
  note?: string;
  columns?: 1 | 2 | 3;
  options: QuizOption[];
}

export const CHAPTERS = ['Toi', 'Tes habitudes', 'Ton style', 'Le bonus absurde'];

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'age',
    chapter: 'Toi',
    title: 'Quel âge as-tu ?',
    subtitle: 'NIGHTRANK est réservé aux 18 ans et plus.',
    emoji: '🎂',
    weight: 0,
    columns: 3,
    options: ['18', '19', '20', '21', '22', '23', '24', '25', '26+'].map((a) => ({ id: a, label: a, emoji: '' })),
  },
  {
    id: 'frequency',
    chapter: 'Tes habitudes',
    title: 'Tu sors combien de fois par semaine ?',
    emoji: '📅',
    weight: 0.4,
    options: [
      { id: 'rare', label: 'Presque jamais, je découvre', emoji: '🐣', intensity: 0, reaction: 'Tout le monde commence quelque part 🌱' },
      { id: 'month', label: 'Une ou deux fois par mois', emoji: '🗓️', intensity: 0.3, stats: { infatigable: 3 } },
      { id: 'one', label: 'Une fois par semaine', emoji: '✌️', intensity: 0.6, stats: { infatigable: 7 } },
      { id: 'two', label: 'Deux fois, minimum syndical', emoji: '🔥', intensity: 0.85, stats: { infatigable: 11 }, reaction: 'Ton agenda a peur de toi.' },
      { id: 'more', label: '3+ : je connais les videurs par leur prénom', emoji: '👑', intensity: 1, stats: { infatigable: 14 }, reaction: 'Respect. Et pense à dormir un peu 😴' },
    ],
  },
  {
    id: 'partyLevel',
    chapter: 'Tes habitudes',
    title: 'Gros fêtard ou soirée tranquille ?',
    emoji: '🎚️',
    weight: 0.2,
    options: [
      { id: 'chill', label: 'Soirée plaid, série, tisane', emoji: '🫖', intensity: 0 },
      { id: 'calm', label: 'Apéro tranquille entre potes', emoji: '🛋️', intensity: 0.3, stats: { social: 4 } },
      { id: 'mix', label: 'Ça dépend du mood', emoji: '🎲', intensity: 0.55, stats: { galopeur: 4 } },
      { id: 'big', label: 'Gros fêtard assumé', emoji: '🚀', intensity: 0.85, stats: { ambiance: 6, endurance: 4 } },
      { id: 'legend', label: 'Je suis la soirée', emoji: '🌋', intensity: 1, stats: { ambiance: 9, endurance: 5 }, reaction: 'Modeste, en plus.' },
    ],
  },
  {
    id: 'closing',
    chapter: 'Tes habitudes',
    title: 'Tu rentres tôt ou tu fermes la soirée ?',
    emoji: '🕐',
    weight: 0.15,
    options: [
      { id: 'cinderella', label: 'Cendrillon : minuit pile', emoji: '👠', intensity: 0.1 },
      { id: 'two', label: 'Vers 2h, raisonnable', emoji: '🌙', intensity: 0.5, stats: { endurance: 4 } },
      { id: 'close', label: 'Je ferme la boîte', emoji: '🔒', intensity: 0.85, stats: { endurance: 10 } },
      { id: 'sun', label: 'Le soleil me raccompagne', emoji: '🌅', intensity: 1, stats: { endurance: 14 }, reaction: 'Le soleil te dit bonjour. Toi, bonne nuit.' },
    ],
  },
  {
    id: 'planning',
    chapter: 'Tes habitudes',
    title: 'Spontané ou tout prévu ?',
    emoji: '🗺️',
    weight: 0.05,
    options: [
      { id: 'now', label: '« Go dans 10 min ? » Toujours oui', emoji: '⚡', intensity: 0.9, stats: { galopeur: 8 } },
      { id: 'day', label: 'Je préviens la veille', emoji: '📱', intensity: 0.5, stats: { capitaine: 4 } },
      { id: 'excel', label: 'Tableur partagé trois semaines avant', emoji: '📊', intensity: 0.4, stats: { capitaine: 12 }, reaction: 'Les capitaines se reconnaissent entre eux 🧭' },
    ],
  },
  {
    id: 'vibe',
    chapter: 'Ton style',
    title: 'Tu mets l’ambiance ou tu profites ?',
    emoji: '🎉',
    weight: 0.1,
    options: [
      { id: 'fire', label: 'Je mets le feu, point', emoji: '🔥', intensity: 1, stats: { ambiance: 13 }, reaction: 'Ambianceur détecté.' },
      { id: 'follow', label: 'Je suis le feu des autres', emoji: '🙌', intensity: 0.7, stats: { ambiance: 6, social: 3 } },
      { id: 'enjoy', label: 'Je profite tranquille', emoji: '😌', intensity: 0.35 },
      { id: 'bags', label: 'Je garde les sacs (et le moral)', emoji: '🎒', intensity: 0.2, stats: { capitaine: 6 }, reaction: 'Héros méconnu de chaque soirée.' },
    ],
  },
  {
    id: 'style',
    chapter: 'Ton style',
    title: 'Danseur, grand bavard ou toujours en mouvement ?',
    emoji: '🕺',
    weight: 0,
    options: [
      { id: 'dance', label: 'Roi ou reine de la piste', emoji: '💃', stats: { piste: 14 } },
      { id: 'talk', label: 'Grand bavard, même à côté des enceintes', emoji: '🗣️', stats: { social: 12 } },
      { id: 'move', label: 'Toujours en mouvement, 15 000 pas', emoji: '🏃', stats: { galopeur: 14 } },
      { id: 'all', label: 'Un peu des trois', emoji: '🌀', stats: { piste: 5, social: 5, galopeur: 5 } },
    ],
  },
  {
    id: 'meeting',
    chapter: 'Ton style',
    title: 'Tu rencontres facilement de nouvelles personnes ?',
    emoji: '🤝',
    weight: 0.1,
    options: [
      { id: 'everyone', label: 'Je connais tout le monde avant minuit', emoji: '🦋', intensity: 1, stats: { social: 13 } },
      { id: 'ifasked', label: 'Si on vient me parler, oui', emoji: '🙂', intensity: 0.5, stats: { social: 5 } },
      { id: 'team', label: 'Je reste avec ma team', emoji: '🛡️', intensity: 0.3, stats: { capitaine: 5 } },
    ],
  },
  {
    id: 'spot',
    chapter: 'Ton style',
    title: 'Ton spot idéal ?',
    emoji: '📍',
    weight: 0,
    options: [
      { id: 'qg', label: 'Toujours le même QG', emoji: '🏠', stats: { infatigable: 6 } },
      { id: 'new', label: 'Un nouveau lieu à chaque fois', emoji: '🧭', stats: { explorateur: 14 }, reaction: 'Le Globe-trotter nocturne s’éveille.' },
      { id: 'friends', label: 'Là où sont mes potes', emoji: '👯', stats: { social: 7 } },
      { id: 'music', label: 'Là où le son est le meilleur', emoji: '🔊', stats: { piste: 7 } },
    ],
  },
  {
    id: 'alcohol',
    chapter: 'Le bonus absurde',
    title: 'Est-ce que tu tiens bien l’alcool ?',
    emoji: '🧃',
    weight: 0,
    optional: true,
    note: 'Réponse déclarative et facultative, sans aucun effet sur ta note. Ici, on récompense l’ambiance, pas les verres.',
    options: [
      { id: 'very', label: 'Oui, je tiens très bien', emoji: '🪨', reaction: 'Noté. Ça ne change rien à ta note 😉' },
      { id: 'bit', label: 'Oui, un petit peu', emoji: '🤏' },
      { id: 'notreally', label: 'Non, pas vraiment', emoji: '🫠' },
      { id: 'notatall', label: 'Pas du tout', emoji: '🙅' },
      { id: 'nothing', label: 'Ça ne me fait rien', emoji: '🤷' },
      { id: 'sober', label: 'Je ne bois pas, je suis pur jus', emoji: '💧', reaction: 'Team eau pétillante 💧' },
    ],
  },
  {
    id: 'move',
    chapter: 'Le bonus absurde',
    title: 'Ton move signature ?',
    emoji: '🪩',
    weight: 0,
    options: [
      { id: 'robot', label: 'Le robot, version 2007', emoji: '🤖', stats: { piste: 4 } },
      { id: 'arm', label: 'Le bras levé sur le refrain', emoji: '🙋', stats: { ambiance: 4 } },
      { id: 'wedding', label: 'Le pas chassé de mariage', emoji: '💒', stats: { piste: 3, ambiance: 2 }, reaction: 'Tonton serait fier.' },
      { id: 'freestyle', label: 'Aucun, je freestyle', emoji: '🌪️', stats: { galopeur: 4 } },
    ],
  },
  {
    id: 'power',
    chapter: 'Le bonus absurde',
    title: 'Ton super-pouvoir en soirée ?',
    emoji: '🦸',
    weight: 0,
    options: [
      { id: 'find', label: 'Retrouver n’importe qui dans la foule', emoji: '🔎', stats: { capitaine: 7 } },
      { id: 'lyrics', label: 'Connaître toutes les paroles', emoji: '🎤', stats: { ambiance: 7 } },
      { id: 'playlist', label: 'Négocier la playlist avec le DJ', emoji: '🎛️', stats: { piste: 5, social: 3 } },
      { id: 'phone', label: 'Ne jamais perdre mon téléphone', emoji: '📱', stats: { endurance: 4, capitaine: 3 }, reaction: 'Le plus rare de tous les pouvoirs.' },
    ],
  },
];
