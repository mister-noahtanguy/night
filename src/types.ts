// Types centraux de NIGHTRANK

export type CityId = 'rouen' | 'paris' | 'rennes' | 'lille' | 'marseille' | 'bordeaux';

export type StatId = 'ambiance' | 'piste' | 'endurance' | 'social' | 'explorateur' | 'galopeur' | 'capitaine' | 'infatigable';

export type StatMap = Record<StatId, number>;

export interface School {
  id: string;
  /** sigle court affiché dans les pastilles */
  tag: string;
  name: string;
  short: string;
  city: CityId;
  color: string;
}

export interface Avatar {
  emoji: string;
  /** index dans AVATAR_GRADIENTS */
  bg: number;
}

/** Profil fictif (données de démonstration) */
export interface MockUser {
  id: string;
  name: string;
  pseudo: string;
  avatar: Avatar;
  schoolId: string;
  city: CityId;
  ovr: number;
  seasonXp: number;
  stats: StatMap;
  streak: number;
  achievements: number;
  teamId?: string;
  favClubId: string;
}

export interface Club {
  id: string;
  name: string;
  city: CityId;
  district: string;
  coefficient: number; // 1 à 10
  styles: string[];
  tagline: string;
  description: string;
  palette: [string, string, string];
  emoji: string;
  map: { x: number; y: number };
  /** distance simulée depuis l'utilisateur, en mètres */
  distance: number;
  seasonCheckIns: number;
  capacity: string;
}

export interface NightEvent {
  id: string;
  clubId: string;
  title: string;
  date: string;
  /** événement spécial : bonus d'XP de participation */
  special: boolean;
  lineup: string;
}

export interface CheckIn {
  id: string;
  clubId: string;
  date: string;
  /** amis dont le check-in a été validé dans la même boîte, la même nuit */
  friendsPresent: string[];
  eventId?: string;
}

export type XpSource = 'checkin' | 'newplace' | 'event' | 'squad' | 'challenge' | 'achievement' | 'debrief' | 'post' | 'friend' | 'referral' | 'streak' | 'votes';

export interface XpEvent {
  id: string;
  /** clé de déduplication : une même clé ne rapporte jamais deux fois */
  key: string;
  date: string;
  source: XpSource;
  label: string;
  xp: number;
  stats?: Partial<StatMap>;
}

export interface QuizAnswers {
  age?: string;
  height?: number;
  frequency?: string;
  partyLevel?: string;
  closing?: string;
  vibe?: string;
  style?: string;
  meeting?: string;
  planning?: string;
  spot?: string;
  alcohol?: string;
  move?: string;
  power?: string;
}

export interface Profile {
  pseudo: string;
  avatar: Avatar;
  schoolId: string;
  city: CityId;
  teamId: string;
  teamName?: string;
  joinedAt: string;
  startOvr: number;
  baseStats: StatMap;
  answers: QuizAnswers;
}

export type ChallengeStatus = 'active' | 'pending' | 'claimable' | 'done';

export interface ChallengeState {
  status: ChallengeStatus;
  confirmedBy?: string;
}

export type PostKind = 'anecdote' | 'achievement' | 'challenge';

export interface Post {
  id: string;
  authorId: string;
  kind: PostKind;
  text: string;
  date: string;
  reactions: Record<string, number>;
  participants?: number;
}

export interface UserState {
  profile: Profile;
  xpLog: XpEvent[];
  checkIns: CheckIn[];
  friends: string[];
  pendingRequests: { userId: string; sentAt: string }[];
  incomingRequests: string[];
  referrals: number;
  challenges: Record<string, ChallengeState>;
  posts: Post[];
  myReactions: Record<string, string[]>;
  joinedChallenges: string[];
  votesGiven: Record<string, Partial<StatMap>>;
  debriefedCheckIns: string[];
  bestOvr: number;
}

export interface Team {
  id: string;
  name: string;
  emoji: string;
  color: string;
  members: string[];
  schoolId: string;
}
