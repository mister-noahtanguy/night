import { motion } from 'framer-motion';
import { Check, Clock, UserPlus } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { DemoTag } from '../../components/ui/Pill';
import { RatingRing, TierPill } from '../../components/game/RatingRing';
import { StatBar } from '../../components/game/StatBar';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { userById } from '../../data/users';
import { CITIES, schoolById } from '../../data/schools';
import { teamById } from '../../data/teams';
import { clubById } from '../../data/clubs';
import { STATS, statById } from '../../game/stats';
import { topStats } from '../../game/startRating';
import { formatNp } from '../../utils/format';

export function UserScreen({ userId }: { userId: string }) {
  const { user, d, sendFriendRequest, acceptRequest } = useGame();
  const { push } = useNav();
  const u = userById(userId);
  if (!u) return null;
  const isFriend = user.friends.includes(u.id);
  const pending = user.pendingRequests.some((r) => r.userId === u.id);
  const incoming = user.incomingRequests.includes(u.id);
  const team = u.teamId ? teamById(u.teamId) : undefined;
  const fav = clubById(u.favClubId);
  const diff = u.ovr - d.rating.ovr;
  const signature = statById(topStats(u.stats, 1)[0]);
  const sorted = [...STATS].sort((a, b) => u.stats[b.id] - u.stats[a.id]);
  const given = user.votesGiven[u.id];

  return (
    <StackPage title={u.pseudo} right={<DemoTag />}>
      <div className="space-y-5 px-4">
        <Card tone="night" className="p-5">
          <div className="flex items-center gap-3">
            <Avatar avatar={u.avatar} size={52} />
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-xl font-extrabold">{u.pseudo}</p>
              <p className="truncate text-xs font-semibold text-white/60">
                {u.name} · {schoolById(u.schoolId).short} · {CITIES[u.city].name}
              </p>
            </div>
            <TierPill ovr={u.ovr} />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <RatingRing ovr={u.ovr} progress={((u.seasonXp % 500) + 100) / 600} size={124} />
            <div className="min-w-0 flex-1 space-y-2">
              <Info label="Style signature" value={`${signature.emoji} ${signature.name}`} />
              <Info label="XP de la saison" value={`${formatNp(u.seasonXp)} XP`} />
              <Info label="Série" value={`🔥 ${u.streak} semaines`} />
              <Info label="Accomplissements" value={`🏅 ${u.achievements}`} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            {team && (
              <button onClick={() => push({ name: 'teams' })} className="glass-dark rounded-full px-3 py-1.5">
                {team.emoji} {team.name}
              </button>
            )}
            <button onClick={() => push({ name: 'club', clubId: fav.id })} className="glass-dark rounded-full px-3 py-1.5">
              {fav.emoji} QG : {fav.name}
            </button>
          </div>
        </Card>

        {/* Face-à-face */}
        <Card className="p-4">
          <SectionTitle sub="Trait noir et petit chiffre : ta valeur">Face-à-face</SectionTitle>
          <div className="mb-3 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <OvrBadge ovr={d.rating.ovr} size={52} />
              <span className="mt-1 text-xs font-extrabold">Toi</span>
            </div>
            <span className="font-display text-xl font-extrabold text-muted">VS</span>
            <div className="flex flex-col items-center">
              <OvrBadge ovr={u.ovr} size={52} />
              <span className="mt-1 max-w-[90px] truncate text-xs font-extrabold">{u.pseudo}</span>
            </div>
          </div>
          <p className={`mb-2 rounded-2xl px-3 py-2 text-center text-xs font-extrabold ${diff > 0 ? 'bg-pink/10 text-pink' : diff < 0 ? 'bg-success/10 text-success' : 'bg-canvas text-ink-2'}`}>
            {diff > 0 ? `${u.name} a ${diff} point${diff > 1 ? 's' : ''} d’avance sur toi` : diff < 0 ? `Tu as ${-diff} point${diff < -1 ? 's' : ''} d’avance` : 'Égalité parfaite !'}
          </p>
          {sorted.map((s, i) => (
            <StatBar key={s.id} id={s.id} value={u.stats[s.id]} compare={d.statMap[s.id]} index={i} compact />
          ))}
          {given && (
            <p className="mt-2 text-[11px] font-semibold text-muted">
              Tes votes au débrief :{' '}
              {Object.entries(given)
                .map(([k, n]) => `${statById(k as keyof typeof u.stats).emoji} ×${n}`)
                .join('  ')}
            </p>
          )}
        </Card>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {isFriend ? (
            <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-success">
              <Check className="h-4 w-4" /> Vous êtes amis
            </p>
          ) : incoming ? (
            <Button full size="lg" onClick={() => acceptRequest(u.id)} icon={<Check className="h-5 w-5" />}>
              Accepter sa demande d’ami
            </Button>
          ) : pending ? (
            <Button full variant="secondary" disabled icon={<Clock className="h-4 w-4" />}>
              Demande en attente de validation
            </Button>
          ) : (
            <Button full size="lg" onClick={() => sendFriendRequest(u.id)} icon={<UserPlus className="h-5 w-5" />}>
              Ajouter en ami
            </Button>
          )}
        </motion.div>
      </div>
    </StackPage>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold tracking-wider text-white/50 uppercase">{label}</p>
      <p className="truncate text-sm font-extrabold">{value}</p>
    </div>
  );
}
