import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, GraduationCap } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { DemoTag } from '../../components/ui/Pill';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { buildSchoolLeaderboard, buildTeamLeaderboard, type TeamEntry } from '../../game/rankings';
import { schoolById } from '../../data/schools';
import { formatNp } from '../../utils/format';

export function TeamsScreen() {
  const { user, d } = useGame();
  const { push, setTab } = useNav();
  const teams = buildTeamLeaderboard(d.me, user.profile.teamId, user.profile.teamName);
  const mine = teams.find((t) => t.isMine)!;
  const school = buildSchoolLeaderboard(d.me).find((s) => s.isMine);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <StackPage title="Équipes" right={<DemoTag />}>
      <div className="space-y-6 px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-night rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-3xl">{mine.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] font-extrabold tracking-widest text-white/60 uppercase">Mon équipe</p>
              <p className="font-display text-xl font-extrabold">{mine.name}</p>
              <p className="text-xs text-white/60">
                #{mine.position} sur {teams.length} · {formatNp(mine.seasonXp)} XP de saison
              </p>
            </div>
            <OvrBadge ovr={mine.avgOvr} size={48} />
          </div>

          <p className="mt-5 mb-2 text-[11px] font-extrabold tracking-widest text-white/50 uppercase">Contribution à l’XP de saison</p>
          <div className="space-y-3">
            {mine.members.map((m, i) => {
              const share = mine.seasonXp ? m.seasonXp / mine.seasonXp : 0;
              return (
                <button key={m.id} onClick={() => !m.isMe && push({ name: 'user', userId: m.id })} className="flex w-full items-center gap-3 text-left">
                  <Avatar avatar={m.avatar} size={34} ring={m.isMe ? '#ff4fa3' : undefined} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate font-extrabold">{m.isMe ? 'Toi' : m.pseudo}</span>
                      <span className="tabular font-bold text-white/70">
                        {formatNp(m.seasonXp)} XP · {Math.round(share * 100)} %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${share * 100}%` }}
                        transition={{ delay: 0.2 + i * 0.08, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: m.isMe ? 'linear-gradient(90deg,#ffc23c,#ff4fa3)' : '#8fb2ff' }}
                      />
                    </div>
                  </div>
                  <OvrBadge ovr={m.ovr} size={30} label={false} />
                </button>
              );
            })}
          </div>
          {mine.members.length === 1 && <p className="mt-3 text-xs text-white/60">Ajoute des amis pour agrandir ton équipe et relever les défis collectifs.</p>}
          <button onClick={() => setTab('challenges')} className="glass-dark mt-4 w-full rounded-2xl py-2.5 text-xs font-extrabold">
            🛡️ Voir les défis collectifs
          </button>
        </motion.div>

        {school && (
          <div className="card flex items-center gap-3 rounded-3xl p-4">
            <GraduationCap className="h-8 w-8 shrink-0" style={{ color: school.color }} />
            <div className="flex-1">
              <p className="text-sm font-extrabold">Ton XP compte aussi pour {schoolById(school.id).short}</p>
              <p className="text-xs font-semibold text-muted">
                #{school.position} des écoles · moyenne {school.avgOvr} de général
              </p>
            </div>
          </div>
        )}

        <div>
          <SectionTitle sub="Classées par XP gagnée cette saison">Classement des équipes</SectionTitle>
          <div className="space-y-2">
            {teams.map((t, i) => (
              <TeamRow key={t.id} team={t} index={i} open={open === t.id} onToggle={() => setOpen(open === t.id ? null : t.id)} max={teams[0].seasonXp} />
            ))}
          </div>
        </div>
      </div>
    </StackPage>
  );
}

function TeamRow({ team, index, open, onToggle, max }: { team: TeamEntry; index: number; open: boolean; onToggle: () => void; max: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`overflow-hidden rounded-2xl ${team.isMine ? 'bg-night text-white' : 'card'}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left">
        <span className={`font-display w-6 text-center text-sm font-extrabold ${team.isMine ? 'text-white/60' : 'text-muted'}`}>{team.position}</span>
        <span className="grid h-10 w-10 place-items-center rounded-xl text-xl" style={{ background: `${team.color}22` }}>
          {team.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">{team.name}</p>
          <p className={`text-[11px] font-semibold ${team.isMine ? 'text-white/60' : 'text-muted'}`}>
            {schoolById(team.schoolId).short} · {team.members.length} membres · moy. {team.avgOvr}
          </p>
          <div className={`mt-1.5 h-1 overflow-hidden rounded-full ${team.isMine ? 'bg-white/10' : 'bg-ink/5'}`}>
            <div className="h-full rounded-full" style={{ width: `${(team.seasonXp / max) * 100}%`, background: team.color }} />
          </div>
        </div>
        <span className="font-display tabular text-sm font-extrabold">{formatNp(team.seasonXp)}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap gap-2 px-3 pb-3 pl-12">
              {team.members.map((m) => (
                <span key={m.id} className={`flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 text-[11px] font-bold ${team.isMine ? 'bg-white/10' : 'bg-canvas'}`}>
                  <Avatar avatar={m.avatar} size={20} /> {m.isMe ? 'Toi' : m.pseudo} · {m.ovr}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
