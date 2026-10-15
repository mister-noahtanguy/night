import type { NightEvent, Post, Profile, StatMap, UserState } from '../types';
import { clubById } from './clubs';
import { DAY_MS, startOfWeek, WEEK_MS, type SeasonAnchor } from '../game/season';
import { DEMO_FRIENDS, DEMO_INCOMING } from './users';
import { MY_TEAM_ID } from './teams';
import { applyAchievements, challengeViews, claimChallenge, grantAll, performCheckIn, ratingOf } from '../game/engine';
import { XP_REWARDS } from '../game/config';

type Seed = [weeksBack: number, day: number, hour: number, minute: number, clubId: string, friends: string[], special?: boolean];

// Historique de sorties du profil démo (rejoué par le moteur pour produire une XP cohérente)
// prettier-ignore
const SEEDS: Seed[] = [
  [5, 3, 23, 5, 'bridge', []],
  [5, 4, 23, 20, 'grenier', ['lucas']],
  [5, 5, 23, 40, 'cale', ['jade']],
  [3, 2, 23, 30, 'velours', ['theo'], true],
  [3, 4, 23, 45, 'bridge', ['lucas', 'ines']],
  [3, 5, 23, 30, 'hangar13', ['theo']],
  [2, 2, 23, 15, 'neon76', ['hugo', 'yanis']],
  [2, 3, 23, 10, 'bridge', ['lucas', 'tom', 'jade']],
  [1, 3, 23, 30, 'cale', ['jade', 'tom']],
  [1, 4, 23, 55, 'grenier', ['ines']],
  [1, 5, 23, 30, 'velours', ['theo', 'zoe']],
];

const YESTERDAY = { clubId: 'bridge', friends: ['lucas', 'ines', 'tom'] };

const DEMO_BASE_STATS: StatMap = { ambiance: 58, piste: 47, endurance: 44, social: 55, explorateur: 41, galopeur: 46, capitaine: 51, infatigable: 49 };

export const DEMO_PROFILE: Profile = {
  pseudo: 'nox.lunaire',
  avatar: { emoji: '🌚', bg: 6 },
  schoolId: 'neoma-rouen',
  city: 'rouen',
  teamId: MY_TEAM_ID,
  joinedAt: '2026-08-31T20:00:00.000Z',
  startOvr: 52,
  baseStats: DEMO_BASE_STATS,
  answers: { age: '21', frequency: 'one', partyLevel: 'big', closing: 'close', vibe: 'fire', style: 'all', meeting: 'everyone', spot: 'friends', planning: 'day', move: 'arm', power: 'lyrics' },
};

const DEMO_POSTS: [daysAgo: number, text: string][] = [
  [9, 'Le DJ du Bridge a passé ma demande à 1h47 précise. J’ai lancé la chorégraphie, 40 personnes ont suivi. Je ne m’en remettrai jamais.'],
  [3, 'On a fini la soirée à refaire le monde dans le dernier métro avec la moitié de la promo. Meilleure ligne de la RATP.'],
];

export function buildEmptyUser(profile: Profile): UserState {
  return {
    profile,
    xpLog: [],
    checkIns: [],
    friends: [],
    pendingRequests: [],
    incomingRequests: [],
    referrals: 0,
    challenges: {},
    posts: [],
    myReactions: {},
    joinedChallenges: [],
    votesGiven: {},
    debriefedCheckIns: [],
    bestOvr: profile.startOvr,
  };
}

/**
 * Profil démo : on rejoue l'historique avec plus ou moins de parrainages et d'amis récompensés, et on garde la variante
 * la plus proche de 85 % du point suivant, pour qu'une sortie fasse monter la note pendant la démo.
 */
export function buildDemoUser(now = Date.now()): UserState {
  let best: UserState | null = null;
  let bestGap = Infinity;
  for (let refs = 0; refs <= 3; refs++) {
    for (let friendXp = 0; friendXp <= DEMO_FRIENDS.length; friendXp += 2) {
      const u = simulateDemo(now, refs, friendXp);
      const gap = Math.abs(ratingOf(u).progress - 0.85);
      if (gap < bestGap) {
        best = u;
        bestGap = gap;
      }
    }
  }
  return best!;
}

function simulateDemo(now: number, referrals: number, friendXp: number): UserState {
  const yesterday = new Date(now - DAY_MS);
  yesterday.setHours(23, 40, 0, 0);
  const refWeek = startOfWeek(yesterday.getTime() - 8 * 3600_000);

  const dated = SEEDS.map(([wb, day, h, m, clubId, friends, special]) => {
    const d = new Date(refWeek - wb * WEEK_MS + day * DAY_MS);
    d.setHours(h, m, 0, 0);
    return { t: d.getTime(), clubId, friends, special: !!special };
  });
  dated.push({ t: yesterday.getTime(), ...YESTERDAY, special: true });
  dated.sort((a, b) => a.t - b.t);

  let u: UserState = { ...buildEmptyUser(DEMO_PROFILE), friends: [...DEMO_FRIENDS] };

  // Parrainages de départ
  for (let i = 0; i < referrals; i++) {
    const t = dated[0].t - (10 - i) * DAY_MS;
    u = grantAll(u, [{ key: `ref:${i}`, source: 'referral', label: 'Parrainage accepté', xp: XP_REWARDS.referral, stats: { social: 20 } }], t).user;
  }
  u = { ...u, referrals };
  // Amis ajoutés au fil des semaines (seuls les premiers ont rapporté de l'XP)
  DEMO_FRIENDS.slice(0, friendXp).forEach((id, i) => {
    u = grantAll(u, [{ key: `friend:${id}`, source: 'friend', label: 'Nouvel ami', xp: XP_REWARDS.friendAdded, stats: { social: 10 } }], dated[0].t - (20 - i) * DAY_MS).user;
  });

  dated.forEach(({ t, clubId, friends, special }, i) => {
    const events: NightEvent[] = special ? [{ id: `past-${i}`, clubId, title: 'Soirée spéciale', date: new Date(t).toISOString(), special: true, lineup: '' }] : [];
    u = performCheckIn(u, clubById(clubId), t, friends, events).user;
    const isYesterday = t === yesterday.getTime();
    // Défis relevés pendant la nuit (les défis à déclarer ont été confirmés par un ami)
    const views = challengeViews(u, t + 3600_000);
    for (const v of [...views.daily, ...views.weekly]) {
      const declared = v.def.rule.type === 'declare' && v.def.period === 'daily' && !isYesterday && i % 3 === 0;
      if ((v.status === 'claimable' && v.def.period === 'weekly') || declared) {
        u = claimChallenge(u, v, t + 3600_000).user;
      }
    }
    // Débrief le lendemain
    if (!isYesterday && friends.length > 0) {
      const ci = u.checkIns[0];
      u = grantAll(
        { ...u, debriefedCheckIns: [...u.debriefedCheckIns, ci.id] },
        [
          { key: `debrief:${ci.id}`, source: 'debrief', label: 'Débrief de soirée', xp: XP_REWARDS.debrief },
          { key: `votes:${ci.id}`, source: 'votes', label: 'Votes reçus au débrief', xp: 0, stats: { ambiance: 15 * friends.length } },
        ],
        t + 14 * 3600_000,
      ).user;
    }
  });

  // Anecdotes publiées
  const posts: Post[] = DEMO_POSTS.map(([d, text], i) => ({ id: `my-${i}`, authorId: 'me', kind: 'anecdote', text, date: new Date(now - d * DAY_MS).toISOString(), reactions: { '🔥': 12 + i * 5, '😂': 8 + i * 3 } }));
  for (const p of posts) {
    u = grantAll({ ...u, posts: [p, ...u.posts] }, [{ key: `post:${p.id}`, source: 'post', label: 'Anecdote publiée', xp: XP_REWARDS.post, stats: { social: 6 } }], new Date(p.date).getTime()).user;
  }

  u = applyAchievements(u, now).user;
  return { ...u, incomingRequests: [...DEMO_INCOMING] };
}

export function demoSeasonAnchor(now = Date.now()): SeasonAnchor {
  const yesterday = new Date(now - DAY_MS);
  const refWeek = startOfWeek(yesterday.getTime() - 8 * 3600_000);
  return { start: refWeek - 5 * WEEK_MS, number: 4 };
}
