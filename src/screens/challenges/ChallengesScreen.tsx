import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, MapPin, ScanLine, ShieldCheck, Users } from 'lucide-react';
import { PageTitle, Screen } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Sheet } from '../../components/ui/Sheet';
import { XpPill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav, type TabId } from '../../store/NavProvider';
import type { ChallengeView } from '../../game/engine';
import { formatCountdown } from '../../game/season';
import { statById } from '../../game/stats';
import { userById } from '../../data/users';
import { teamById } from '../../data/teams';
import type { StatId } from '../../types';

export function ChallengesScreen() {
  const { d, user } = useGame();
  const { push } = useNav();
  const [confirmFor, setConfirmFor] = useState<ChallengeView | null>(null);
  const { daily, weekly, team } = d.challenges;
  const all = [...daily, ...weekly, ...team];
  const done = all.filter((c) => c.status === 'done').length;
  const team0 = teamById(user.profile.teamId);

  return (
    <>
      <Screen>
        <PageTitle title="Défis" subtitle="Relève-les, gagne de l’XP, fais grimper ta note." />
        <div className="space-y-7 px-4">
          {/* Résumé */}
          <div className="card-night flex items-center gap-4 rounded-3xl p-4">
            <OvrBadge ovr={d.rating.ovr} size={56} />
            <div className="flex-1">
              <p className="text-xs font-bold text-white/60">
                {done}/{all.length} défis relevés · +{d.weekXp} XP cette semaine
              </p>
              <ProgressBar className="mt-2" value={d.rating.progress} colors={['#ffc23c', '#ff4fa3']} track="rgba(255,255,255,0.14)" />
              <p className="mt-1.5 text-[11px] font-bold text-yellow">{d.rating.maxed ? '99 atteint' : `${d.rating.remaining} XP avant ${d.rating.ovr + 1} de général`}</p>
            </div>
          </div>

          {/* Actions de sortie */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button onClick={() => push({ name: 'checkin' })} className="bg-brand flex items-center gap-3 rounded-3xl p-4 text-left text-white active:scale-[.98]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
                <ScanLine className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-base leading-tight font-extrabold">Valider une sortie</p>
                <p className="text-[11px] font-semibold opacity-80">Fait avancer plusieurs défis</p>
              </div>
            </button>
            <button onClick={() => push({ name: 'clubs' })} className="card flex flex-col items-center justify-center rounded-3xl px-4 text-center active:scale-[.98]">
              <MapPin className="h-5 w-5 text-violet" />
              <span className="mt-1 text-xs font-extrabold">Lieux</span>
            </button>
          </div>

          <Section title="☀️ Défis du jour" endsAt={daily[0]?.endsAt} items={daily} onConfirm={setConfirmFor} />
          <Section title="📅 Défis de la semaine" endsAt={weekly[0]?.endsAt} items={weekly} onConfirm={setConfirmFor} />

          <div>
            <SectionTitle action="Voir l’équipe" onAction={() => push({ name: 'teams' })} sub={`Avec ${team0?.name ?? user.profile.teamName ?? 'ton équipe'} : tout le monde gagne l’XP`}>
              🛡️ Défis collectifs
            </SectionTitle>
            <div className="space-y-3">
              {team.map((c, i) => (
                <ChallengeCard key={c.key} v={c} index={i} onConfirm={setConfirmFor} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 rounded-3xl bg-turquoise/10 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#0b8c7e]" />
            <p className="text-xs leading-relaxed font-semibold text-ink-2">
              Les défis se valident automatiquement (sorties, publications, débriefs) ou par la confirmation d’un ami présent. Aucune preuve intime, aucun défi lié à l’alcool ou à une prise de risque.
            </p>
          </div>
        </div>
      </Screen>
      <AnimatePresence>{confirmFor && <ConfirmSheet v={confirmFor} onClose={() => setConfirmFor(null)} />}</AnimatePresence>
    </>
  );
}

function Section({ title, endsAt, items, onConfirm }: { title: string; endsAt?: number; items: ChallengeView[]; onConfirm: (v: ChallengeView) => void }) {
  const { now } = useGame();
  return (
    <div>
      <div className="mb-3 flex items-end justify-between px-1">
        <h2 className="font-display text-[18px] font-extrabold">{title}</h2>
        {endsAt && (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-muted">
            <Clock className="h-3.5 w-3.5" /> {formatCountdown(endsAt - now)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {items.map((c, i) => (
          <ChallengeCard key={c.key} v={c} index={i} onConfirm={onConfirm} />
        ))}
      </div>
    </div>
  );
}

const AUTO_ACTION: Partial<Record<string, { label: string; tab?: TabId; route?: 'checkin' | 'clubs' }>> = {
  checkins: { label: 'Valider une sortie', route: 'checkin' },
  places: { label: 'Voir les lieux', route: 'clubs' },
  newplace: { label: 'Trouver un nouveau lieu', route: 'clubs' },
  event: { label: 'Voir les événements', route: 'clubs' },
  squad: { label: 'Valider une sortie', route: 'checkin' },
  samenight: { label: 'Valider une sortie', route: 'checkin' },
  post: { label: 'Écrire une anecdote', tab: 'community' },
  friend: { label: 'Ajouter un ami', tab: 'friends' },
  referral: { label: 'Inviter un ami', tab: 'friends' },
  'team-outings': { label: 'Valider une sortie', route: 'checkin' },
  'team-places': { label: 'Voir les lieux', route: 'clubs' },
};

function ChallengeCard({ v, index, onConfirm }: { v: ChallengeView; index: number; onConfirm: (v: ChallengeView) => void }) {
  const { claim, d } = useGame();
  const { push, setTab } = useNav();
  const { def, status } = v;
  const isDeclare = def.rule.type === 'declare';
  const action = AUTO_ACTION[def.rule.type];
  const done = status === 'done';
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-3xl p-4 ${status === 'claimable' ? 'bg-white ring-2 ring-pink shadow-[0_14px_30px_-16px_rgba(255,79,163,0.9)]' : 'card'} ${done ? 'opacity-60' : ''}`}
    >
      <div className="flex gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet/15 to-blue/10 text-2xl">{def.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-[16px] leading-tight font-extrabold">{def.title}</p>
            <XpPill xp={def.xp} />
          </div>
          <p className="mt-1 text-xs leading-relaxed font-medium text-ink-2">{def.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(Object.entries(def.stats) as [StatId, number][]).map(([s, n]) => (
              <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: `${statById(s).color}1a`, color: statById(s).color }}>
                {statById(s).emoji} {statById(s).short} +{n}
              </span>
            ))}
            {isDeclare && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-extrabold text-ink-2">🤝 Confirmé par un ami</span>}
          </div>
        </div>
      </div>

      {!isDeclare && v.goal > 1 && (
        <div className="mt-3">
          <ProgressBar value={v.progress / v.goal} height={8} colors={['#12c9b5', '#2f6bff']} />
          <p className="mt-1 text-[11px] font-bold text-muted">
            {v.progress}/{v.goal}
            {v.team && ` · contributions de l’équipe incluses`}
          </p>
        </div>
      )}

      <div className="mt-3">
        {done && (
          <p className="flex items-center gap-1.5 text-sm font-extrabold text-success">
            <Check className="h-4 w-4" /> Relevé{v.confirmedBy ? ` · confirmé par ${userById(v.confirmedBy)?.name}` : ''}
          </p>
        )}
        {status === 'claimable' && (
          <Button full variant="hot" onClick={() => claim(v)}>
            Récupérer +{def.xp} XP {v.confirmedBy ? `· confirmé par ${userById(v.confirmedBy)?.name}` : ''}
          </Button>
        )}
        {status === 'pending' && (
          <p className="flex items-center gap-2 rounded-2xl bg-yellow/15 px-3 py-2.5 text-xs font-extrabold text-[#a26b00]">
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
              ⏳
            </motion.span>
            En attente de la confirmation de ton ami…
          </p>
        )}
        {status === 'active' && isDeclare && (
          <Button full variant="secondary" disabled={d.me.friends.length === 0} onClick={() => onConfirm(v)} icon={<Users className="h-4 w-4" />}>
            {d.me.friends.length === 0 ? 'Ajoute un ami pour valider ce défi' : 'Je l’ai fait · faire confirmer'}
          </Button>
        )}
        {status === 'active' && !isDeclare && action && (
          <button
            onClick={() => (action.route ? push({ name: action.route }) : action.tab && setTab(action.tab))}
            className="flex w-full items-center justify-between rounded-2xl bg-canvas px-3 py-2.5 text-xs font-extrabold text-violet"
          >
            <span>⚙️ Validation auto</span>
            <span>{action.label} →</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ConfirmSheet({ v, onClose }: { v: ChallengeView; onClose: () => void }) {
  const { user, requestConfirmation } = useGame();
  const friends = user.friends.map((id) => userById(id)).filter(Boolean);
  return (
    <Sheet title="Qui peut confirmer ?" onClose={onClose}>
      <p className="-mt-2 mb-4 text-sm text-ink-2">
        Choisis un ami présent pour « {v.def.title} ». Il ou elle reçoit une demande et confirme (ou non). Pas de photo, pas de preuve : la parole d’un pote suffit.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {friends.map((f) => (
          <motion.button
            key={f!.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              requestConfirmation(v, f!.id);
              onClose();
            }}
            className="card flex flex-col items-center rounded-2xl p-3"
          >
            <Avatar avatar={f!.avatar} size={48} />
            <span className="mt-1.5 text-xs font-extrabold">{f!.name}</span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}
