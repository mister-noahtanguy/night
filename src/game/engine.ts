/**
 * Moteur de progression : fonctions pures qui transforment l'état utilisateur.
 * Toute XP passe par `grant`, qui applique la déduplication et les plafonds anti-triche.
 */
import type { ChallengeStatus, CheckIn, Club, NightEvent, StatId, StatMap, UserState, XpEvent, XpSource } from '../types';
import { LIMITS, XP_REWARDS } from './config';
import { ratingFromXp, type RatingProgress } from './rating';
import { STATS, statFromXp } from './stats';
import { ACHIEVEMENTS, type PlayerStats } from './achievements';
import { activeChallenges, type ChallengeDef } from './challenges';
import { computeStreak, dayIndex, dayWindow, isSameNight, weekIndex, weekWindow } from './season';
import { clubById } from '../data/clubs';
import { teamById } from '../data/teams';

/** Sources soumises au plafond quotidien (les défis et accomplissements n'y sont pas soumis) */
const CAPPED: XpSource[] = ['checkin', 'newplace', 'event', 'squad', 'debrief', 'post', 'friend', 'streak'];

let seq = 0;
const uid = (now: number) => `${now.toString(36)}-${(seq++).toString(36)}`;

export interface GrantDraft {
  key: string;
  source: XpSource;
  label: string;
  xp: number;
  stats?: Partial<StatMap>;
}

export interface GrantResult {
  user: UserState;
  event: XpEvent | null;
  /** raison d'une XP réduite ou refusée */
  note?: string;
}

export function freeXpOnDay(user: UserState, now: number): number {
  const d = dayIndex(now);
  return user.xpLog.filter((e) => CAPPED.includes(e.source) && dayIndex(e.date) === d).reduce((a, e) => a + e.xp, 0);
}

export function grant(user: UserState, draft: GrantDraft, now: number): GrantResult {
  if (user.xpLog.some((e) => e.key === draft.key)) return { user, event: null, note: 'Déjà obtenu' };
  let xp = draft.xp;
  let note: string | undefined;
  if (CAPPED.includes(draft.source)) {
    const left = Math.max(0, LIMITS.dailyFreeXpCap - freeXpOnDay(user, now));
    if (xp > left) {
      xp = left;
      note = `Plafond quotidien de ${LIMITS.dailyFreeXpCap} XP atteint`;
    }
  }
  const event: XpEvent = { ...draft, xp, id: uid(now), date: new Date(now).toISOString() };
  return { user: { ...user, xpLog: [event, ...user.xpLog] }, event, note };
}

export const totalXp = (user: UserState) => user.xpLog.reduce((a, e) => a + e.xp, 0);

export function ratingOf(user: UserState): RatingProgress {
  return ratingFromXp(user.profile.startOvr, totalXp(user));
}

export interface StatValue {
  id: StatId;
  value: number;
  progress: number;
}

export function statsOf(user: UserState): Record<StatId, StatValue> {
  const xp = {} as StatMap;
  for (const s of STATS) xp[s.id] = 0;
  for (const e of user.xpLog) for (const [k, v] of Object.entries(e.stats ?? {}) as [StatId, number][]) xp[k] += v;
  const out = {} as Record<StatId, StatValue>;
  for (const s of STATS) out[s.id] = { id: s.id, ...statFromXp(user.profile.baseStats[s.id], xp[s.id]) };
  return out;
}

export function bestStreakOf(checkIns: CheckIn[]): number {
  const weeks = [...new Set(checkIns.map((c) => weekIndex(c.date)))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  weeks.forEach((w, i) => {
    run = i > 0 && w === weeks[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

export function playerStats(user: UserState, now: number): PlayerStats {
  const streak = computeStreak(user.checkIns.map((c) => c.date), now);
  return {
    outings: user.checkIns.length,
    places: new Set(user.checkIns.map((c) => c.clubId)).size,
    cities: new Set(user.checkIns.map((c) => clubById(c.clubId).city)).size,
    streak,
    bestStreak: Math.max(streak, bestStreakOf(user.checkIns)),
    referrals: user.referrals,
    friends: user.friends.length,
    debriefs: user.xpLog.filter((e) => e.source === 'debrief').length,
    posts: user.posts.length,
    challengesDone: user.xpLog.filter((e) => e.source === 'challenge').length,
    squadNights: user.checkIns.filter((c) => c.friendsPresent.length >= 3).length,
    events: user.checkIns.filter((c) => c.eventId).length,
    ovr: ratingOf(user).ovr,
  };
}

/** Débloque les accomplissements atteints (en boucle : l'XP gagnée peut débloquer un palier de note) */
export function applyAchievements(user: UserState, now: number): { user: UserState; events: XpEvent[] } {
  const events: XpEvent[] = [];
  let u = user;
  for (let guard = 0; guard < 10; guard++) {
    const stats = playerStats(u, now);
    const next = ACHIEVEMENTS.find((a) => a.value(stats) >= a.goal && !u.xpLog.some((e) => e.key === `ach:${a.id}`));
    if (!next) break;
    const r = grant(u, { key: `ach:${next.id}`, source: 'achievement', label: `Accomplissement · ${next.name}`, xp: next.xp }, now);
    u = r.user;
    if (r.event) events.push(r.event);
  }
  const ovr = ratingOf(u).ovr;
  if (ovr > u.bestOvr) u = { ...u, bestOvr: ovr };
  return { user: u, events };
}

/** Applique une série de gains puis les accomplissements */
export function grantAll(user: UserState, drafts: GrantDraft[], now: number) {
  let u = user;
  const events: XpEvent[] = [];
  const notes: string[] = [];
  for (const d of drafts) {
    const r = grant(u, d, now);
    u = r.user;
    if (r.event) events.push(r.event);
    if (r.note && r.note !== 'Déjà obtenu') notes.push(r.note);
  }
  const ach = applyAchievements(u, now);
  return { user: ach.user, events: [...events, ...ach.events], notes: [...new Set(notes)] };
}

// ---------------------------------------------------------------- Check-in

export interface CheckInOutcome {
  user: UserState;
  checkIn?: CheckIn;
  events: XpEvent[];
  notes: string[];
  error?: string;
}

export function performCheckIn(user: UserState, club: Club, now: number, friendsPresent: string[], events: NightEvent[]): CheckInOutcome {
  const date = new Date(now);
  if (user.checkIns.some((c) => c.clubId === club.id && isSameNight(c.date, date))) {
    return { user, events: [], notes: [], error: 'Tu as déjà validé ce lieu cette nuit.' };
  }
  const last = user.checkIns[0];
  if (last && now - new Date(last.date).getTime() < LIMITS.checkInCooldownMin * 60_000) {
    return { user, events: [], notes: [], error: `Attends ${LIMITS.checkInCooldownMin} min entre deux validations : on vérifie que tu as vraiment bougé 😉` };
  }
  const tonight = user.checkIns.filter((c) => isSameNight(c.date, date));
  const ev = events.find((e) => e.clubId === club.id && e.special && isSameNight(e.date, date));
  const checkIn: CheckIn = { id: `ci-${now}`, clubId: club.id, date: date.toISOString(), friendsPresent, eventId: ev?.id };
  let u: UserState = { ...user, checkIns: [checkIn, ...user.checkIns] };

  if (tonight.length >= LIMITS.checkInsPerNight) {
    return { user: u, checkIn, events: [], notes: [`Sortie enregistrée. L'XP est limitée à ${LIMITS.checkInsPerNight} lieux par nuit.`] };
  }

  const firstVisit = !user.checkIns.some((c) => c.clubId === club.id);
  const newCity = !user.checkIns.some((c) => clubById(c.clubId).city === club.city);
  const drafts: GrantDraft[] = [
    {
      key: `ci:${checkIn.id}`,
      source: 'checkin',
      label: `Sortie validée · ${club.name}`,
      xp: XP_REWARDS.checkInBase + XP_REWARDS.checkInPerCoef * club.coefficient,
      stats: { infatigable: 8, ...(tonight.length > 0 ? { galopeur: 15 } : {}) },
    },
  ];
  if (firstVisit) drafts.push({ key: `place:${club.id}`, source: 'newplace', label: newCity ? 'Nouveau lieu et nouvelle ville' : 'Nouveau lieu découvert', xp: XP_REWARDS.newPlace, stats: { explorateur: newCity ? 40 : 25 } });
  if (ev) drafts.push({ key: `ev:${ev.id}`, source: 'event', label: `Événement · ${ev.title}`, xp: XP_REWARDS.event, stats: { ambiance: 10 } });
  if (friendsPresent.length >= 2) drafts.push({ key: `squad:${checkIn.id}`, source: 'squad', label: `Squad · ${friendsPresent.length} amis présents`, xp: XP_REWARDS.squad, stats: { capitaine: 12, social: 6 } });
  const streak = computeStreak(u.checkIns.map((c) => c.date), now);
  if (streak >= 2) drafts.push({ key: `streak:${weekIndex(now)}`, source: 'streak', label: `Série de ${streak} semaines`, xp: XP_REWARDS.streakWeek, stats: { infatigable: 15 } });

  const res = grantAll(u, drafts, now);
  u = res.user;
  return { user: u, checkIn, events: res.events, notes: res.notes };
}

// ---------------------------------------------------------------- Défis

export interface ChallengeView {
  def: ChallengeDef;
  key: string;
  progress: number;
  goal: number;
  status: ChallengeStatus;
  confirmedBy?: string;
  endsAt: number;
  /** membres de l'équipe ayant contribué (défis collectifs) */
  team?: { done: number; members: number };
}

const inWindow = (iso: string, [a, b]: [number, number]) => {
  const t = new Date(iso).getTime();
  return t >= a && t < b;
};

/** Contribution simulée des autres membres de l'équipe (données de démo) */
function teamOthers(user: UserState, w: number) {
  const team = teamById(user.profile.teamId);
  const others = team ? team.members.filter((m) => m !== 'me').length : 0;
  return { others, outings: Math.min(others, 3), places: others ? 2 + (w % 2) : 0 };
}

function progressFor(user: UserState, def: ChallengeDef, win: [number, number], w: number): { progress: number; goal: number; team?: ChallengeView['team'] } {
  const cis = user.checkIns.filter((c) => inWindow(c.date, win));
  const logs = (src: XpSource) => user.xpLog.filter((e) => e.source === src && inWindow(e.date, win)).length;
  const r = def.rule;
  switch (r.type) {
    case 'checkins':
      return { progress: cis.length, goal: r.goal };
    case 'places':
      return { progress: new Set(cis.map((c) => c.clubId)).size, goal: r.goal };
    case 'newplace':
      return { progress: logs('newplace'), goal: r.goal };
    case 'event':
      return { progress: cis.filter((c) => c.eventId).length, goal: r.goal };
    case 'squad':
      return { progress: cis.some((c) => c.friendsPresent.length >= r.friends) ? 1 : 0, goal: 1 };
    case 'samenight': {
      const byNight = new Map<string, Set<string>>();
      for (const c of cis) {
        const k = String(dayIndex(c.date));
        byNight.set(k, (byNight.get(k) ?? new Set()).add(c.clubId));
      }
      return { progress: Math.max(0, ...[...byNight.values()].map((s) => s.size)), goal: r.goal };
    }
    case 'debrief':
      return { progress: logs('debrief'), goal: r.goal };
    case 'post':
      return { progress: user.posts.filter((p) => inWindow(p.date, win)).length, goal: r.goal };
    case 'friend':
      return { progress: logs('friend'), goal: r.goal };
    case 'referral':
      return { progress: logs('referral'), goal: r.goal };
    case 'declare':
      return { progress: 0, goal: 1 };
    case 'team-outings': {
      const t = teamOthers(user, w);
      const mine = cis.length > 0 ? 1 : 0;
      return { progress: t.outings + mine, goal: r.goal, team: { done: t.outings + mine, members: t.others + 1 } };
    }
    case 'team-places': {
      const t = teamOthers(user, w);
      return { progress: t.places + new Set(cis.map((c) => c.clubId)).size, goal: r.goal, team: { done: t.places, members: t.others + 1 } };
    }
  }
}

export function challengeViews(user: UserState, now: number) {
  const d = dayIndex(now);
  const w = weekIndex(now);
  const { daily, weekly, team } = activeChallenges(d, w);
  const view = (def: ChallengeDef, key: string, win: [number, number]): ChallengeView => {
    const p = progressFor(user, def, win, w);
    const state = user.challenges[key];
    let status: ChallengeStatus;
    if (user.xpLog.some((e) => e.key === `ch:${key}`)) status = 'done';
    else if (def.rule.type === 'declare') status = state?.status ?? 'active';
    else status = p.progress >= p.goal ? 'claimable' : 'active';
    const progress = def.rule.type === 'declare' ? (status === 'claimable' || status === 'done' ? 1 : 0) : Math.min(p.progress, p.goal);
    return { def, key, progress, goal: p.goal, status, confirmedBy: state?.confirmedBy, endsAt: win[1], team: p.team };
  };
  return {
    daily: daily.map((c) => view(c, `${c.id}@d${d}`, dayWindow(d))),
    weekly: weekly.map((c) => view(c, `${c.id}@w${w}`, weekWindow(w))),
    team: team.map((c) => view(c, `${c.id}@w${w}`, weekWindow(w))),
  };
}

export function claimChallenge(user: UserState, v: ChallengeView, now: number) {
  return grantAll(user, [{ key: `ch:${v.key}`, source: 'challenge', label: `Défi · ${v.def.title}`, xp: v.def.xp, stats: v.def.stats }], now);
}

// ---------------------------------------------------------------- Divers

export function postsToday(user: UserState, now: number) {
  const d = dayIndex(now);
  return user.posts.filter((p) => dayIndex(p.date) === d).length;
}

export function friendXpToday(user: UserState, now: number) {
  const d = dayIndex(now);
  return user.xpLog.filter((e) => e.source === 'friend' && dayIndex(e.date) === d).length;
}

export function seasonXp(user: UserState, seasonStart: number) {
  return user.xpLog.filter((e) => new Date(e.date).getTime() >= seasonStart).reduce((a, e) => a + e.xp, 0);
}
