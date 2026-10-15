import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Users } from 'lucide-react';
import type { CheckInResult } from '../../store/GameProvider';
import { clubById } from '../../data/clubs';
import { userById } from '../../data/users';
import { Confetti } from '../../components/ui/Confetti';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
import { Button } from '../../components/ui/Button';
import { CoefBadge } from '../../components/ui/CoefBadge';
import { Avatar } from '../../components/ui/Avatar';
import { RatingRing, TierPill } from '../../components/game/RatingRing';
import { statById } from '../../game/stats';
import { tierOf } from '../../game/rating';
import type { StatId } from '../../types';

const STEP = 0.45;

export function RewardView({ result, onShare, onDone }: { result: CheckInResult; onShare: () => void; onDone: () => void }) {
  const { checkIn, events, notes, before, after } = result;
  const club = clubById(checkIn.clubId);
  const total = events.reduce((a, e) => a + e.xp, 0);
  const lines = events.filter((e) => e.xp > 0);
  const totalAt = 0.5 + lines.length * STEP;
  const levelUp = after.ovr > before.ovr;
  const [phase, setPhase] = useState<'calc' | 'total' | 'rank'>('calc');

  const statGains: Partial<Record<StatId, number>> = {};
  for (const e of events) for (const [k, v] of Object.entries(e.stats ?? {}) as [StatId, number][]) statGains[k] = (statGains[k] ?? 0) + v;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('total'), totalAt * 1000);
    const t2 = setTimeout(() => setPhase('rank'), (totalAt + 0.9) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [totalAt]);

  return (
    <div className="relative px-5">
      {phase !== 'calc' && total > 0 && <Confetti count={levelUp ? 260 : 140} />}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3">
        <span className="text-3xl">{club.emoji}</span>
        <div>
          <p className="text-[11px] font-extrabold tracking-widest text-success uppercase">Présence vérifiée ✓</p>
          <p className="font-display text-xl leading-tight font-extrabold">{club.name}</p>
        </div>
        <CoefBadge coef={club.coefficient} size="sm" />
      </motion.div>

      {/* Détail de l'XP */}
      <div className="card mt-5 rounded-3xl p-4">
        {lines.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * STEP, type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
          >
            <span className="pr-3 text-[13px] font-bold text-ink-2">{e.label}</span>
            <motion.span initial={{ scale: 1.8 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * STEP, type: 'spring', stiffness: 400, damping: 14 }} className="font-display shrink-0 text-base font-extrabold text-violet">
              +{e.xp}
            </motion.span>
          </motion.div>
        ))}
        {lines.length === 0 && <p className="py-2 text-sm font-semibold text-muted">Sortie enregistrée sans XP.</p>}
        <AnimatePresence>
          {phase !== 'calc' && lines.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 flex items-center justify-between border-t-2 border-ink/10 pt-3">
              <span className="text-[13px] font-extrabold tracking-wider uppercase">= Total</span>
              <span className="font-display text-xl font-extrabold text-pink">+{total} XP</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {notes.map((n) => (
        <p key={n} className="mt-2 rounded-2xl bg-orange/10 px-3 py-2 text-xs font-bold text-[#b35a10]">
          ⚠️ {n}
        </p>
      ))}

      {/* Gros total */}
      <div className="relative mt-5 grid h-24 place-items-center">
        <AnimatePresence>
          {phase !== 'calc' && total > 0 && (
            <motion.div initial={{ scale: 0.2, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className="text-center">
              <p className="font-display text-brand px-3 text-[60px] leading-none font-extrabold">
                +<AnimatedNumber value={total} from={0} duration={0.8} />
              </p>
              <p className="text-xs font-extrabold tracking-[0.3em] text-muted">POINTS D’EXPÉRIENCE</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {phase === 'rank' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} className="mt-3 space-y-3 pb-6">
            <div className="card-night flex items-center gap-4 rounded-3xl p-4">
              <RatingRing ovr={after.ovr} from={before.ovr} progress={after.progress} size={104} />
              <div className="flex-1">
                {levelUp ? (
                  <>
                    <motion.p initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.15, 1] }} className="font-display text-2xl font-extrabold text-yellow">
                      {before.ovr} → {after.ovr} !
                    </motion.p>
                    <p className="text-xs font-semibold text-white/70">Ta note générale vient de monter.</p>
                    {tierOf(after.ovr).id !== tierOf(before.ovr).id && <TierPill ovr={after.ovr} className="mt-2" />}
                  </>
                ) : (
                  <>
                    <p className="font-display text-lg font-extrabold">Général {after.ovr}</p>
                    <p className="text-xs font-semibold text-white/70">{after.maxed ? '99 atteint' : `${after.remaining} XP avant ${after.ovr + 1}`}</p>
                  </>
                )}
                <ProgressBar className="mt-2" value={after.progress} from={levelUp ? 0 : before.progress} colors={['#ffc23c', '#ff4fa3']} height={8} track="rgba(255,255,255,0.15)" duration={1.2} />
              </div>
            </div>

            {Object.keys(statGains).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(Object.entries(statGains) as [StatId, number][]).map(([id, v]) => (
                  <span key={id} className="rounded-full px-2.5 py-1 text-[11px] font-extrabold" style={{ background: `${statById(id).color}1a`, color: statById(id).color }}>
                    {statById(id).emoji} {statById(id).name} +{v}
                  </span>
                ))}
              </div>
            )}

            {checkIn.friendsPresent.length > 0 && (
              <div className="card flex items-center gap-3 rounded-3xl p-4">
                <Users className="h-5 w-5 shrink-0 text-turquoise" />
                <div className="flex -space-x-2">
                  {checkIn.friendsPresent.map((id) => {
                    const u = userById(id);
                    return u ? <Avatar key={id} avatar={u.avatar} size={30} className="ring-2 ring-white" /> : null;
                  })}
                </div>
                <p className="text-xs leading-snug font-semibold text-ink-2">
                  {checkIn.friendsPresent.map((id) => userById(id)?.name).join(', ')} {checkIn.friendsPresent.length > 1 ? 'ont' : 'a'} aussi validé leur sortie ici. Débrief demain !
                </p>
              </div>
            )}

            <Button full size="lg" variant="hot" onClick={onShare} icon={<Share2 className="h-5 w-5" />}>
              Partager ma progression
            </Button>
            <Button full variant="secondary" onClick={onDone}>
              Terminer
            </Button>
            <p className="text-center text-[11px] font-semibold text-muted">Les accomplissements débloqués apparaissent dans ton journal d’XP.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
