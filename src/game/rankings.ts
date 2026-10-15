import type { Avatar, CityId, MockUser, StatId, StatMap } from '../types';
import { USERS } from '../data/users';
import { SCHOOLS } from '../data/schools';
import { TEAMS } from '../data/teams';

export type Scope = 'friends' | 'school' | 'city' | 'world';
export type SortKey = 'ovr' | 'season' | StatId;

export interface RankEntry {
  id: string;
  pseudo: string;
  avatar: Avatar;
  schoolId: string;
  city: CityId;
  ovr: number;
  seasonXp: number;
  stats: StatMap;
  streak: number;
  isMe: boolean;
  position: number;
  /** valeur utilisée pour le tri */
  value: number;
}

export interface Me {
  pseudo: string;
  avatar: Avatar;
  schoolId: string;
  city: CityId;
  ovr: number;
  seasonXp: number;
  stats: StatMap;
  streak: number;
  friends: string[];
}

const valueOf = (e: { ovr: number; seasonXp: number; stats: StatMap }, sort: SortKey) => (sort === 'ovr' ? e.ovr : sort === 'season' ? e.seasonXp : e.stats[sort]);

function toEntry(u: MockUser): Omit<RankEntry, 'position' | 'value'> {
  return { id: u.id, pseudo: u.pseudo, avatar: u.avatar, schoolId: u.schoolId, city: u.city, ovr: u.ovr, seasonXp: u.seasonXp, stats: u.stats, streak: u.streak, isMe: false };
}

export function buildLeaderboard(scope: Scope, sort: SortKey, me: Me, city: CityId = me.city): RankEntry[] {
  const filter: Record<Scope, (u: MockUser) => boolean> = {
    friends: (u) => me.friends.includes(u.id),
    school: (u) => u.schoolId === me.schoolId,
    city: (u) => u.city === city,
    world: () => true,
  };
  const list = USERS.filter(filter[scope]).map(toEntry);
  const includeMe = scope !== 'city' || city === me.city;
  if (includeMe) list.push({ id: 'me', pseudo: me.pseudo, avatar: me.avatar, schoolId: me.schoolId, city: me.city, ovr: me.ovr, seasonXp: me.seasonXp, stats: me.stats, streak: me.streak, isMe: true });
  // à égalité, l'utilisateur passe derrière : il doit dépasser pour prendre la place
  return list
    .map((e) => ({ ...e, value: valueOf(e, sort) }))
    .sort((a, b) => b.value - a.value || Number(a.isMe) - Number(b.isMe))
    .map((e, i) => ({ ...e, position: i + 1 }));
}

export interface SchoolEntry {
  id: string;
  name: string;
  tag: string;
  color: string;
  city: CityId;
  avgOvr: number;
  seasonXp: number;
  members: number;
  position: number;
  isMine: boolean;
}

/** Classement inter-écoles : note moyenne des membres de démo, puis XP de saison cumulée */
export function buildSchoolLeaderboard(me: Me): SchoolEntry[] {
  return SCHOOLS.filter((s) => s.id !== 'autre')
    .map((s) => {
      const users = USERS.filter((u) => u.schoolId === s.id);
      const mine = me.schoolId === s.id;
      const ovrs = [...users.map((u) => u.ovr), ...(mine ? [me.ovr] : [])];
      const xp = users.reduce((a, u) => a + u.seasonXp, 0) + (mine ? me.seasonXp : 0);
      return { id: s.id, name: s.name, tag: s.tag, color: s.color, city: s.city, avgOvr: ovrs.length ? Math.round(ovrs.reduce((a, b) => a + b, 0) / ovrs.length) : 0, seasonXp: xp, members: ovrs.length, isMine: mine, position: 0 };
    })
    .filter((s) => s.members > 0)
    .sort((a, b) => b.avgOvr - a.avgOvr || b.seasonXp - a.seasonXp)
    .map((s, i) => ({ ...s, position: i + 1 }));
}

export interface TeamMemberEntry {
  id: string;
  pseudo: string;
  avatar: Avatar;
  ovr: number;
  seasonXp: number;
  isMe: boolean;
}

export interface TeamEntry {
  id: string;
  name: string;
  emoji: string;
  color: string;
  schoolId: string;
  seasonXp: number;
  avgOvr: number;
  members: TeamMemberEntry[];
  position: number;
  isMine: boolean;
}

export function buildTeamLeaderboard(me: Me, myTeamId: string, customName?: string): TeamEntry[] {
  const meMember: TeamMemberEntry = { id: 'me', pseudo: me.pseudo, avatar: me.avatar, ovr: me.ovr, seasonXp: me.seasonXp, isMe: true };
  const teams = TEAMS.map((t) => {
    const members = t.members
      .map((id) => {
        if (id === 'me') return t.id === myTeamId ? meMember : null;
        const u = USERS.find((x) => x.id === id);
        return u ? { id: u.id, pseudo: u.pseudo, avatar: u.avatar, ovr: u.ovr, seasonXp: u.seasonXp, isMe: false } : null;
      })
      .filter((m): m is TeamMemberEntry => m !== null);
    return { id: t.id, name: t.name, emoji: t.emoji, color: t.color, schoolId: t.schoolId, members, isMine: t.id === myTeamId };
  });
  if (!TEAMS.some((t) => t.id === myTeamId)) {
    teams.push({ id: myTeamId, name: customName ?? 'Mon équipe', emoji: '🌟', color: '#6d3aff', schoolId: me.schoolId, members: [meMember], isMine: true });
  }
  return teams
    .map((t) => ({
      ...t,
      members: [...t.members].sort((a, b) => b.seasonXp - a.seasonXp),
      seasonXp: t.members.reduce((a, m) => a + m.seasonXp, 0),
      avgOvr: Math.round(t.members.reduce((a, m) => a + m.ovr, 0) / Math.max(1, t.members.length)),
      position: 0,
    }))
    .sort((a, b) => b.seasonXp - a.seasonXp)
    .map((t, i) => ({ ...t, position: i + 1 }));
}

/** Habitués d'un lieu : rois de la boîte (données de démo) */
export function clubKings(clubId: string, me?: { visits: number; pseudo: string; avatar: Avatar; ovr: number }) {
  const regulars = USERS.filter((u) => u.favClubId === clubId).map((u) => ({ id: u.id, pseudo: u.pseudo, avatar: u.avatar, ovr: u.ovr, visits: 2 + Math.round(u.seasonXp / 600), isMe: false }));
  if (me && me.visits > 0) regulars.push({ id: 'me', pseudo: me.pseudo, avatar: me.avatar, ovr: me.ovr, visits: me.visits, isMe: true });
  return regulars.sort((a, b) => b.visits - a.visits || Number(a.isMe) - Number(b.isMe)).slice(0, 3);
}
