import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame, type Gain } from '../../store/GameProvider';
import { ProgressBar } from '../ui/ProgressBar';
import { Confetti } from '../ui/Confetti';
import { Button } from '../ui/Button';
import { RatingRing, TierPill } from './RatingRing';
import { tierOf } from '../../game/rating';
import { statById } from '../../game/stats';
import type { StatId } from '../../types';

/** Affiche les gains d'XP : récapitulatif discret, ou célébration plein écran quand la note monte */
export function GainOverlay() {
  const { gains, dismissGain } = useGame();
  const gain = gains[0];
  const levelUp = gain && gain.after.ovr > gain.before.ovr;

  return (
    <AnimatePresence mode="wait">
      {gain && (levelUp ? <LevelUp key={gain.id} gain={gain} onClose={dismissGain} /> : <GainCard key={gain.id} gain={gain} onClose={dismissGain} />)}
    </AnimatePresence>
  );
}

function statGains(gain: Gain) {
  const out: Partial<Record<StatId, number>> = {};
  for (const e of gain.events) for (const [k, v] of Object.entries(e.stats ?? {}) as [StatId, number][]) out[k] = (out[k] ?? 0) + v;
  return Object.entries(out) as [StatId, number][];
}

function GainCard({ gain, onClose }: { gain: Gain; onClose: () => void }) {
  const xp = gain.events.reduce((a, e) => a + e.xp, 0);
  useEffect(() => {
    const t = setTimeout(onClose, 3400);
    return () => clearTimeout(t);
  }, [onClose]);
  const stats = statGains(gain);
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      onClick={onClose}
      className="absolute inset-x-3 bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+8px)] z-[90] rounded-3xl bg-night p-4 text-white shadow-[0_20px_50px_-10px_rgba(20,10,70,0.7)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">{gain.title}</p>
          <p className="truncate text-[11px] text-white/60">
            {gain.events
              .filter((e) => e.xp > 0 && e.label !== gain.title)
              .map((e) => e.label)
              .join(' · ') || gain.notes[0]}
          </p>
        </div>
        {xp > 0 && (
          <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="font-display shrink-0 text-2xl font-extrabold text-yellow">
            +{xp} XP
          </motion.span>
        )}
      </div>
      {xp > 0 && (
        <>
          <ProgressBar className="mt-3" value={gain.after.progress} from={gain.before.progress} colors={['#ffc23c', '#ff4fa3']} height={8} track="rgba(255,255,255,0.15)" />
          <p className="mt-1.5 text-[11px] font-semibold text-white/60">
            {gain.after.maxed ? '99 atteint' : `${gain.after.remaining} XP avant ${gain.after.ovr + 1} de général`}
          </p>
        </>
      )}
      {stats.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {stats.map(([id, v]) => (
            <span key={id} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
              {statById(id).emoji} {statById(id).name} +{v}
            </span>
          ))}
        </div>
      )}
      {gain.notes.map((n) => (
        <p key={n} className="mt-2 text-[11px] font-semibold text-orange">⚠️ {n}</p>
      ))}
    </motion.div>
  );
}

function LevelUp({ gain, onClose }: { gain: Gain; onClose: () => void }) {
  const { before, after } = gain;
  const xp = gain.events.reduce((a, e) => a + e.xp, 0);
  const newTier = tierOf(after.ovr).id !== tierOf(before.ovr).id;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card-night absolute inset-0 z-[95] flex flex-col items-center justify-center px-8 text-center">
      <Confetti count={220} />
      <motion.p initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs font-extrabold tracking-[0.35em] text-yellow">
        NOTE EN HAUSSE
      </motion.p>
      <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }} className="mt-6">
        <RatingRing ovr={after.ovr} from={before.ovr} progress={after.progress} size={200} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6">
        <p className="font-display text-3xl font-extrabold">
          {before.ovr} → {after.ovr}
        </p>
        <p className="mt-1 text-sm text-white/70">
          {after.ovr - before.ovr > 1 ? `+${after.ovr - before.ovr} points de général !` : '+1 point de général !'} {gain.title}
        </p>
        {newTier && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, type: 'spring' }} className="mt-4">
            <p className="mb-2 text-xs font-bold text-white/60">Nouveau rang débloqué</p>
            <TierPill ovr={after.ovr} className="px-4 py-1.5 text-sm" />
          </motion.div>
        )}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="glass-dark mt-6 w-full rounded-2xl p-3 text-left">
        {gain.events
          .filter((e) => e.xp > 0)
          .slice(0, 4)
          .map((e) => (
            <div key={e.id} className="flex justify-between py-1 text-xs">
              <span className="truncate text-white/75">{e.label}</span>
              <span className="font-extrabold text-yellow">+{e.xp}</span>
            </div>
          ))}
        <div className="mt-1 flex justify-between border-t border-white/10 pt-2 text-sm font-extrabold">
          <span>Total</span>
          <span className="text-yellow">+{xp} XP</span>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-6 w-full">
        <Button full size="lg" variant="hot" onClick={onClose}>
          Continuer
        </Button>
      </motion.div>
    </motion.div>
  );
}
