import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CheckIn, Post, PostKind, Profile, StatId, StatMap, UserState, XpEvent } from '../types';
import { loadState, saveState, STATE_VERSION, type PersistedState } from './storage';
import { buildDemoUser, buildEmptyUser, demoSeasonAnchor } from '../data/demo';
import { buildCommunity } from '../data/community';
import { clubById } from '../data/clubs';
import { EVENTS } from '../data/events';
import { userById } from '../data/users';
import { LIMITS, XP_REWARDS } from '../game/config';
import { ACHIEVEMENTS } from '../game/achievements';
import {
  challengeViews,
  claimChallenge,
  friendXpToday,
  grantAll,
  performCheckIn,
  playerStats,
  postsToday,
  ratingOf,
  seasonXp,
  statsOf,
  totalXp,
  type ChallengeView,
  type StatValue,
} from '../game/engine';
import type { RatingProgress } from '../game/rating';
import { computeStreak, getSeason, isSameNight, weekWindow, weekIndex, type SeasonInfo } from '../game/season';
import type { Me } from '../game/rankings';
import { mulberry32 } from '../game/random';
import { useToast } from './ToastProvider';

/** Gain d'XP à afficher (récapitulatif + éventuelle montée de note) */
export interface Gain {
  id: number;
  title: string;
  events: XpEvent[];
  before: RatingProgress;
  after: RatingProgress;
  notes: string[];
}

export interface CheckInResult {
  checkIn: CheckIn;
  events: XpEvent[];
  notes: string[];
  before: RatingProgress;
  after: RatingProgress;
}

export interface Derived {
  season: SeasonInfo;
  rating: RatingProgress;
  totalXp: number;
  seasonXp: number;
  weekXp: number;
  stats: Record<StatId, StatValue>;
  statMap: StatMap;
  streak: number;
  player: ReturnType<typeof playerStats>;
  achievements: { def: (typeof ACHIEVEMENTS)[number]; current: number; unlocked: boolean }[];
  challenges: ReturnType<typeof challengeViews>;
  pendingDebrief: CheckIn | null;
  me: Me;
  feed: Post[];
}

interface GameContextValue {
  now: number;
  onboarded: boolean;
  user: UserState;
  d: Derived;
  gains: Gain[];
  dismissGain: () => void;
  createProfile: (profile: Profile) => void;
  loadDemo: () => void;
  resetProfile: () => void;
  checkIn: (clubId: string) => CheckInResult | { error: string };
  submitDebrief: (checkInId: string, votes: Partial<Record<StatId, string>>) => Partial<StatMap>;
  requestConfirmation: (v: ChallengeView, friendId: string) => void;
  claim: (v: ChallengeView) => void;
  publishPost: (text: string, kind: PostKind) => void;
  react: (postId: string, emoji: string) => void;
  joinChallenge: (postId: string) => void;
  sendFriendRequest: (userId: string) => void;
  acceptRequest: (userId: string) => void;
  declineRequest: (userId: string) => void;
  inviteFriend: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

const PLACEHOLDER: Profile = {
  pseudo: '',
  avatar: { emoji: '😎', bg: 0 },
  schoolId: 'autre',
  city: 'paris',
  teamId: 'custom',
  joinedAt: '',
  startOvr: 50,
  baseStats: { ambiance: 40, piste: 40, endurance: 40, social: 40, explorateur: 40, galopeur: 40, capitaine: 40, infatigable: 40 },
  answers: {},
};
const PLACEHOLDER_USER = buildEmptyUser(PLACEHOLDER);

function initialState(): PersistedState {
  return loadState() ?? { version: STATE_VERSION, onboarded: false, user: null, anchor: demoSeasonAnchor() };
}

function derive(user: UserState, anchor: PersistedState['anchor'], now: number): Derived {
  const season = getSeason(anchor, now);
  const rating = ratingOf(user);
  const stats = statsOf(user);
  const statMap = Object.fromEntries(Object.values(stats).map((s) => [s.id, s.value])) as StatMap;
  const player = playerStats(user, now);
  const [wStart] = weekWindow(weekIndex(now));
  const sXp = seasonXp(user, season.start.getTime());
  const feed = [...user.posts, ...buildCommunity(now)]
    .map((p) => ({ ...p, reactions: Object.fromEntries(Object.entries(p.reactions).map(([e, n]) => [e, n + ((user.myReactions[p.id] ?? []).includes(e) ? 1 : 0)])) }))
    .sort((a, b) => b.date.localeCompare(a.date));
  return {
    season,
    rating,
    totalXp: totalXp(user),
    seasonXp: sXp,
    weekXp: user.xpLog.filter((e) => new Date(e.date).getTime() >= wStart).reduce((a, e) => a + e.xp, 0),
    stats,
    statMap,
    streak: player.streak,
    player,
    achievements: ACHIEVEMENTS.map((def) => ({ def, current: Math.min(def.goal, def.value(player)), unlocked: user.xpLog.some((e) => e.key === `ach:${def.id}`) })),
    challenges: challengeViews(user, now),
    pendingDebrief:
      user.checkIns.find((c) => c.friendsPresent.length > 0 && !user.debriefedCheckIns.includes(c.id) && !isSameNight(c.date, new Date(now)) && now - new Date(c.date).getTime() < 40 * 3600_000) ?? null,
    me: {
      pseudo: user.profile.pseudo,
      avatar: user.profile.avatar,
      schoolId: user.profile.schoolId,
      city: user.profile.city,
      ovr: rating.ovr,
      seasonXp: sXp,
      stats: statMap,
      streak: computeStreak(user.checkIns.map((c) => c.date), now),
      friends: user.friends,
    },
    feed,
  };
}

/** Amis « présents » simulés : ils ont eux-mêmes validé leur sortie dans le même lieu */
function simulateFriendsPresent(user: UserState, clubId: string): string[] {
  const city = clubById(clubId).city;
  const pool = user.friends.filter((id) => userById(id)?.city === city);
  const rand = mulberry32(Date.now() % 100000);
  const count = Math.min(pool.length, Math.floor(rand() * 4));
  return [...pool].sort(() => rand() - 0.5).slice(0, count);
}

type Producer = (u: UserState, t: number) => { user: UserState; events: XpEvent[]; notes?: string[] };

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [now, setNow] = useState(() => Date.now());
  const [gains, setGains] = useState<Gain[]>([]);
  const toast = useToast();
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
    saveState(state);
  }, [state]);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const user = state.user ?? PLACEHOLDER_USER;
  const d = useMemo(() => derive(user, state.anchor, now), [user, state.anchor, now]);

  const apply = useCallback((next: PersistedState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /** Applique une transformation qui produit de l'XP, puis met en file le récapitulatif de gain */
  const commit = useCallback(
    (title: string, fn: Producer, silent = false) => {
      const cur = stateRef.current.user;
      if (!cur) return null;
      const t = Date.now();
      const before = ratingOf(cur);
      const res = fn(cur, t);
      const after = ratingOf(res.user);
      apply({ ...stateRef.current, user: res.user });
      const xp = res.events.reduce((a, e) => a + e.xp, 0);
      if (!silent && (xp > 0 || (res.notes?.length ?? 0) > 0)) {
        setGains((g) => [...g, { id: t + Math.random(), title, events: res.events, before, after, notes: res.notes ?? [] }]);
      }
      return { before, after, ...res };
    },
    [apply],
  );

  const setUser = useCallback(
    (fn: (u: UserState) => UserState) => {
      const cur = stateRef.current;
      if (cur.user) apply({ ...cur, user: fn(cur.user) });
    },
    [apply],
  );

  const checkIn = useCallback(
    (clubId: string): CheckInResult | { error: string } => {
      const cur = stateRef.current.user;
      if (!cur) return { error: 'Profil introuvable' };
      const outcome = performCheckIn(cur, clubById(clubId), Date.now(), simulateFriendsPresent(cur, clubId), EVENTS);
      if (outcome.error || !outcome.checkIn) return { error: outcome.error ?? 'Erreur' };
      const r = commit('Sortie validée', () => outcome, true)!;
      return { checkIn: outcome.checkIn, events: outcome.events, notes: outcome.notes, before: r.before, after: r.after };
    },
    [commit],
  );

  const createProfile = useCallback((profile: Profile) => apply({ version: STATE_VERSION, onboarded: true, user: buildEmptyUser(profile), anchor: demoSeasonAnchor() }), [apply]);
  const loadDemo = useCallback(() => apply({ version: STATE_VERSION, onboarded: true, user: buildDemoUser(), anchor: demoSeasonAnchor() }), [apply]);
  const resetProfile = useCallback(() => {
    setGains([]);
    apply({ version: STATE_VERSION, onboarded: false, user: null, anchor: demoSeasonAnchor() });
  }, [apply]);

  const submitDebrief = useCallback(
    (checkInId: string, votes: Partial<Record<StatId, string>>) => {
      const ci = stateRef.current.user?.checkIns.find((c) => c.id === checkInId);
      // Votes reçus en retour, simulés à partir des amis présents (+15 d'XP de stat par vote)
      const rand = mulberry32(checkInId.length * 31 + (ci?.friendsPresent.length ?? 0));
      const pool: StatId[] = ['ambiance', 'piste', 'endurance', 'social', 'capitaine'];
      const received: Partial<StatMap> = {};
      (ci?.friendsPresent ?? []).forEach(() => {
        const s = pool[Math.floor(rand() * pool.length)];
        received[s] = (received[s] ?? 0) + 1;
      });
      const statGain = Object.fromEntries(Object.entries(received).map(([k, n]) => [k, (n as number) * 15])) as Partial<StatMap>;
      commit('Débrief envoyé', (u, t) => {
        const votesGiven = { ...u.votesGiven };
        for (const [s, uid] of Object.entries(votes) as [StatId, string][]) votesGiven[uid] = { ...votesGiven[uid], [s]: (votesGiven[uid]?.[s] ?? 0) + 1 };
        return grantAll(
          { ...u, votesGiven, debriefedCheckIns: [...u.debriefedCheckIns, checkInId] },
          [
            { key: `debrief:${checkInId}`, source: 'debrief', label: 'Débrief de soirée', xp: XP_REWARDS.debrief },
            { key: `votes:${checkInId}`, source: 'votes', label: 'Votes reçus de tes potes', xp: 0, stats: statGain },
          ],
          t,
        );
      });
      return received;
    },
    [commit],
  );

  const requestConfirmation = useCallback(
    (v: ChallengeView, friendId: string) => {
      setUser((u) => ({ ...u, challenges: { ...u.challenges, [v.key]: { status: 'pending' } } }));
      const f = userById(friendId);
      toast({ emoji: '📨', title: `Demande envoyée à ${f?.name ?? 'ton ami'}`, body: 'Il ou elle doit confirmer que tu as relevé le défi.' });
      // Simulation : l'ami confirme quelques secondes plus tard
      setTimeout(() => {
        setUser((u) => ({ ...u, challenges: { ...u.challenges, [v.key]: { status: 'claimable', confirmedBy: friendId } } }));
        toast({ emoji: '✅', title: `${f?.name ?? 'Ton ami'} a confirmé ton défi`, body: `« ${v.def.title} » : récupère ton XP !` });
      }, 3500);
    },
    [setUser, toast],
  );

  const claim = useCallback((v: ChallengeView) => void commit(`Défi relevé · ${v.def.title}`, (u, t) => claimChallenge(u, v, t)), [commit]);

  const publishPost = useCallback(
    (text: string, kind: PostKind) => {
      commit('Publication', (u, t) => {
        const post: Post = { id: `me-${t}`, authorId: 'me', kind, text, date: new Date(t).toISOString(), reactions: { '🔥': 0, '😂': 0, '👑': 0 }, participants: kind === 'challenge' ? 1 : undefined };
        const withPost = { ...u, posts: [post, ...u.posts] };
        // XP limitée à une publication par jour
        if (postsToday(u, t) >= LIMITS.postsPerDay) return { user: withPost, events: [] };
        return grantAll(withPost, [{ key: `post:${post.id}`, source: 'post', label: 'Publication dans la communauté', xp: XP_REWARDS.post, stats: { social: 6, ambiance: 3 } }], t);
      });
      toast({ emoji: '📣', title: 'Publié', body: 'Ta publication est visible dans la communauté (démo locale).' });
    },
    [commit, toast],
  );

  const react = useCallback(
    (postId: string, emoji: string) =>
      setUser((u) => {
        const cur = u.myReactions[postId] ?? [];
        const next = cur.includes(emoji) ? cur.filter((e) => e !== emoji) : [...cur, emoji];
        return { ...u, myReactions: { ...u.myReactions, [postId]: next } };
      }),
    [setUser],
  );

  const joinChallenge = useCallback(
    (postId: string) => {
      setUser((u) => (u.joinedChallenges.includes(postId) ? u : { ...u, joinedChallenges: [...u.joinedChallenges, postId] }));
      toast({ emoji: '🎯', title: 'Défi rejoint', body: 'Les défis lancés par la communauté sont pour le fun : ils ne rapportent pas d’XP.' });
    },
    [setUser, toast],
  );

  const addFriend = useCallback(
    (userId: string, title: string) =>
      commit(title, (u, t) => {
        const base: UserState = {
          ...u,
          friends: u.friends.includes(userId) ? u.friends : [...u.friends, userId],
          pendingRequests: u.pendingRequests.filter((r) => r.userId !== userId),
          incomingRequests: u.incomingRequests.filter((id) => id !== userId),
        };
        if (friendXpToday(u, t) >= LIMITS.friendsPerDay) return { user: base, events: [] };
        return grantAll(base, [{ key: `friend:${userId}`, source: 'friend', label: 'Nouvel ami', xp: XP_REWARDS.friendAdded, stats: { social: 10 } }], t);
      }),
    [commit],
  );

  const sendFriendRequest = useCallback(
    (userId: string) => {
      setUser((u) =>
        u.friends.includes(userId) || u.pendingRequests.some((r) => r.userId === userId) ? u : { ...u, pendingRequests: [...u.pendingRequests, { userId, sentAt: new Date().toISOString() }] },
      );
      const f = userById(userId);
      toast({ emoji: '📨', title: 'Demande envoyée', body: `${f?.name ?? 'Cette personne'} doit l’accepter.` });
      setTimeout(() => addFriend(userId, `${f?.name ?? 'Ton ami'} a accepté ta demande`), 3500);
    },
    [setUser, toast, addFriend],
  );

  const acceptRequest = useCallback((userId: string) => void addFriend(userId, 'Nouvel ami'), [addFriend]);
  const declineRequest = useCallback((userId: string) => setUser((u) => ({ ...u, incomingRequests: u.incomingRequests.filter((id) => id !== userId) })), [setUser]);

  const inviteFriend = useCallback(() => {
    try {
      void navigator.clipboard?.writeText('https://nightrank.app/invite/' + encodeURIComponent(stateRef.current.user?.profile.pseudo ?? ''));
    } catch {
      // presse-papiers indisponible
    }
    toast({ emoji: '🔗', title: 'Lien de parrainage copié', body: 'Le parrainage compte quand ton ami crée son profil.' });
    setTimeout(() => {
      commit('Parrainage accepté', (u, t) => {
        const n = u.referrals + 1;
        const base = { ...u, referrals: n };
        if (n > LIMITS.referralsMax) return { user: base, events: [] };
        return grantAll(base, [{ key: `ref:${n}`, source: 'referral', label: 'Un ami a rejoint NIGHTRANK', xp: XP_REWARDS.referral, stats: { social: 20 } }], t);
      });
    }, 5000);
  }, [commit, toast]);

  const dismissGain = useCallback(() => setGains((g) => g.slice(1)), []);

  const value: GameContextValue = {
    now,
    onboarded: state.onboarded && !!state.user,
    user,
    d,
    gains,
    dismissGain,
    createProfile,
    loadDemo,
    resetProfile,
    checkIn,
    submitDebrief,
    requestConfirmation,
    claim,
    publishPost,
    react,
    joinChallenge,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    inviteFriend,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit être utilisé dans <GameProvider>');
  return ctx;
}
