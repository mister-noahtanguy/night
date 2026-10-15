import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Clock, Gift, Search, UserPlus, X } from 'lucide-react';
import { PageTitle, Screen } from '../../components/layout/Screen';
import { Segmented } from '../../components/ui/Segmented';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { USERS, userById } from '../../data/users';
import { CITIES, CITY_IDS, schoolById } from '../../data/schools';
import { buildLeaderboard, buildTeamLeaderboard } from '../../game/rankings';
import { statById } from '../../game/stats';
import { topStats } from '../../game/startRating';
import { XP_REWARDS } from '../../game/config';
import type { CityId, MockUser } from '../../types';

type Tab = 'friends' | 'requests' | 'discover';

export function FriendsScreen() {
  const { user, d, acceptRequest, declineRequest, inviteFriend } = useGame();
  const { push } = useNav();
  const [tab, setTab] = useState<Tab>('friends');
  const board = buildLeaderboard('friends', 'ovr', d.me);
  const teams = buildTeamLeaderboard(d.me, user.profile.teamId, user.profile.teamName);
  const myTeam = teams.find((t) => t.isMine)!;
  const requests = user.incomingRequests.map((id) => userById(id)).filter(Boolean) as MockUser[];

  return (
    <Screen>
      <PageTitle
        title="Amis"
        subtitle={`${user.friends.length} amis · ${user.referrals} parrainages`}
        right={
          <Button size="sm" onClick={inviteFriend} icon={<Gift className="h-3.5 w-3.5" />}>
            Inviter
          </Button>
        }
      />
      <div className="space-y-5 px-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: 'friends', label: 'Mes amis' },
            { id: 'requests', label: `Demandes${requests.length ? ` (${requests.length})` : ''}` },
            { id: 'discover', label: 'Découvrir' },
          ]}
        />

        {tab === 'friends' && (
          <>
            <button onClick={() => push({ name: 'teams' })} className="card flex w-full items-center gap-3 rounded-3xl p-4 text-left active:scale-[.98]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `${myTeam.color}22` }}>
                {myTeam.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-extrabold tracking-wider text-muted uppercase">Mon équipe</p>
                <p className="font-display truncate text-lg leading-tight font-extrabold">{myTeam.name}</p>
                <p className="text-[11px] font-semibold text-muted">
                  #{myTeam.position} des équipes · {myTeam.members.length} membres · moyenne {myTeam.avgOvr}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted" />
            </button>

            <div>
              <SectionTitle sub="Ton classement privé, par note générale">Classement entre amis</SectionTitle>
              {board.length <= 1 ? (
                <EmptyFriends onDiscover={() => setTab('discover')} />
              ) : (
                <div className="space-y-2">
                  {board.map((e, i) => (
                    <motion.button
                      key={e.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.03 }}
                      onClick={() => !e.isMe && push({ name: 'user', userId: e.id })}
                      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${e.isMe ? 'bg-night text-white' : 'card'}`}
                    >
                      <span className={`font-display w-5 text-center text-sm font-extrabold ${e.isMe ? 'text-white/60' : 'text-muted'}`}>{e.position}</span>
                      <Avatar avatar={e.avatar} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold">{e.isMe ? 'Toi' : e.pseudo}</p>
                        <p className={`truncate text-[11px] font-semibold ${e.isMe ? 'text-white/60' : 'text-muted'}`}>
                          {topStats(e.stats, 2)
                            .map((s) => `${statById(s).emoji} ${e.stats[s]}`)
                            .join('  ')}
                        </p>
                      </div>
                      {!e.isMe && <span className="text-[11px] font-extrabold text-violet">Comparer</span>}
                      <OvrBadge ovr={e.ovr} size={40} />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'requests' && (
          <div className="space-y-5">
            <div>
              <SectionTitle sub="Une amitié n’existe que si les deux personnes l’acceptent.">Demandes reçues</SectionTitle>
              {requests.length === 0 && <p className="card rounded-2xl p-4 text-sm font-semibold text-muted">Aucune demande en attente.</p>}
              <div className="space-y-2">
                {requests.map((u) => (
                  <div key={u.id} className="card flex items-center gap-3 rounded-2xl p-3">
                    <button onClick={() => push({ name: 'user', userId: u.id })}>
                      <Avatar avatar={u.avatar} size={44} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold">{u.pseudo}</p>
                      <p className="truncate text-[11px] font-semibold text-muted">
                        {schoolById(u.schoolId).short} · {CITIES[u.city].name}
                      </p>
                    </div>
                    <OvrBadge ovr={u.ovr} size={36} />
                    <button onClick={() => declineRequest(u.id)} className="grid h-9 w-9 place-items-center rounded-full bg-canvas" aria-label="Refuser">
                      <X className="h-4 w-4" />
                    </button>
                    <button onClick={() => acceptRequest(u.id)} className="bg-brand grid h-9 w-9 place-items-center rounded-full text-white" aria-label="Accepter">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {user.pendingRequests.length > 0 && (
              <div>
                <SectionTitle>Demandes envoyées</SectionTitle>
                <div className="space-y-2">
                  {user.pendingRequests.map((r) => {
                    const u = userById(r.userId);
                    return u ? (
                      <div key={r.userId} className="card flex items-center gap-3 rounded-2xl p-3">
                        <Avatar avatar={u.avatar} size={40} />
                        <p className="flex-1 truncate text-sm font-extrabold">{u.pseudo}</p>
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-muted">
                          <Clock className="h-3.5 w-3.5" /> En attente
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'discover' && <Discover />}

        <div className="bg-hot flex items-center gap-3 rounded-3xl p-4 text-white">
          <span className="text-3xl">🎁</span>
          <div className="flex-1">
            <p className="font-display text-base font-extrabold">Parraine tes potes</p>
            <p className="text-[11px] font-semibold opacity-90">+{XP_REWARDS.referral} XP quand un ami crée son profil · défi « Ambassadeur »</p>
          </div>
          <Button size="sm" variant="secondary" onClick={inviteFriend}>
            Inviter
          </Button>
        </div>
      </div>
    </Screen>
  );
}

function EmptyFriends({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="card rounded-3xl p-5 text-center">
      <p className="text-4xl">👀</p>
      <p className="font-display mt-2 text-lg font-extrabold">Pas encore d’amis</p>
      <p className="mt-1 text-sm text-muted">Ajoute des amis pour te comparer, débriefer vos soirées et relever des défis à plusieurs.</p>
      <Button className="mt-4" onClick={onDiscover} icon={<UserPlus className="h-4 w-4" />}>
        Découvrir des profils
      </Button>
    </div>
  );
}

function Discover() {
  const { user, sendFriendRequest } = useGame();
  const { push } = useNav();
  const [q, setQ] = useState('');
  const [city, setCity] = useState<CityId | 'all'>('all');
  const query = q.trim().toLowerCase();
  const list = USERS.filter((u) => !user.friends.includes(u.id))
    .filter((u) => city === 'all' || u.city === city)
    .filter((u) => !query || u.pseudo.toLowerCase().includes(query) || u.name.toLowerCase().includes(query))
    .sort((a, b) => b.ovr - a.ovr);
  const pending = (id: string) => user.pendingRequests.some((r) => r.userId === id);
  const incoming = (id: string) => user.incomingRequests.includes(id);

  return (
    <div className="space-y-3">
      <div className="card flex items-center gap-2 rounded-2xl px-3">
        <Search className="h-4 w-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un pseudo…" className="h-12 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted" />
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {(['all', ...CITY_IDS] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${city === c ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}
          >
            {c === 'all' ? '🇫🇷 Partout' : `${CITIES[c].emoji} ${CITIES[c].name}`}
          </button>
        ))}
      </div>
      <p className="px-1 text-[11px] font-semibold text-muted">Profils fictifs de démonstration.</p>
      {list.map((u, i) => {
        const top = topStats(u.stats, 1)[0];
        return (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 10) * 0.03 }}
            onClick={() => push({ name: 'user', userId: u.id })}
            className="card flex cursor-pointer items-center gap-3 rounded-2xl p-3 active:scale-[.98]"
          >
            <Avatar avatar={u.avatar} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{u.pseudo}</p>
              <p className="truncate text-[11px] font-semibold text-muted">
                {CITIES[u.city].name} · {statById(top).emoji} {statById(top).name} {u.stats[top]}
              </p>
            </div>
            <OvrBadge ovr={u.ovr} size={38} />
            {pending(u.id) ? (
              <Clock className="h-5 w-5 text-muted" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!incoming(u.id)) sendFriendRequest(u.id);
                }}
                className="bg-brand grid h-9 w-9 place-items-center rounded-full text-white"
                aria-label="Ajouter en ami"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        );
      })}
      {list.length === 0 && <p className="py-6 text-center text-sm font-semibold text-muted">Aucun profil trouvé.</p>}
    </div>
  );
}
