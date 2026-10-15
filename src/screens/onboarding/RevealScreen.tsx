import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Confetti } from '../../components/ui/Confetti';
import { TierPill } from '../../components/game/RatingRing';
import { StatBar } from '../../components/game/StatBar';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { partyIntensity, rollBaseStats, rollStartRating, startRange, topStats } from '../../game/startRating';
import { tierOf } from '../../game/rating';
import { statById } from '../../game/stats';
import { schoolById } from '../../data/schools';
import type { Profile, QuizAnswers } from '../../types';
import type { Identity } from './OnboardingScreen';

const ANALYSIS = ['Analyse de ton move signature…', 'Calibrage de ton endurance de piste…', 'Consultation des videurs (anonymement)…', 'Calcul de ta note générale…'];

export function RevealScreen({ identity, answers }: { identity: Identity; answers: QuizAnswers }) {
  const { createProfile } = useGame();
  const { reset, push } = useNav();
  const [ovr] = useState(() => rollStartRating(answers));
  const [stats] = useState(() => rollBaseStats(answers));
  const [phase, setPhase] = useState<'analyze' | 'roll' | 'done'>('analyze');
  const [checked, setChecked] = useState(0);
  const [shown, setShown] = useState(1);
  const range = startRange(answers);
  const intensity = Math.round(partyIntensity(answers) * 100);
  const tier = tierOf(ovr);
  const top = topStats(stats, 3);

  // Phase 1 : analyse
  useEffect(() => {
    if (phase !== 'analyze') return;
    if (checked >= ANALYSIS.length) {
      const t = setTimeout(() => setPhase('roll'), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setChecked((c) => c + 1), 520);
    return () => clearTimeout(t);
  }, [phase, checked]);

  // Phase 2 : défilement des chiffres qui ralentit jusqu'à la note
  useEffect(() => {
    if (phase !== 'roll') return;
    let i = 0;
    const total = 22;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      if (i >= total) {
        setShown(ovr);
        setPhase('done');
        return;
      }
      setShown(i > total - 4 ? ovr - (total - i) : 30 + Math.floor(Math.random() * 69));
      timer = setTimeout(tick, 40 + i * i * 0.7);
    };
    tick();
    return () => clearTimeout(timer);
  }, [phase, ovr]);

  const finish = (share: boolean) => {
    const profile: Profile = {
      pseudo: identity.pseudo.trim(),
      avatar: identity.avatar,
      schoolId: identity.schoolId,
      city: identity.city,
      teamId: 'custom',
      teamName: `La team de ${identity.pseudo.trim()}`,
      joinedAt: new Date().toISOString(),
      startOvr: ovr,
      baseStats: stats,
      answers,
    };
    reset();
    createProfile(profile);
    if (share) setTimeout(() => push({ name: 'share' }), 50);
  };

  return (
    <div className="card-night relative flex h-full flex-col overflow-hidden">
      {phase === 'done' && <Confetti count={240} />}
      <AnimatePresence mode="wait">
        {phase === 'analyze' && (
          <motion.div key="a" exit={{ opacity: 0, scale: 0.95 }} className="flex flex-1 flex-col justify-center px-8">
            <motion.div className="mx-auto h-16 w-16 rounded-full border-4 border-white/15 border-t-yellow" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
            <p className="font-display mt-6 text-center text-2xl font-extrabold">On calcule ta note…</p>
            <div className="mt-8 space-y-3">
              {ANALYSIS.map((l, i) => (
                <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= checked ? 1 : 0.3, x: 0 }} className="flex items-center gap-3 text-sm font-semibold">
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${i < checked ? 'bg-turquoise' : 'bg-white/10'}`}>{i < checked && <Check className="h-4 w-4" strokeWidth={3} />}</span>
                  {l}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase !== 'analyze' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`no-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-[calc(var(--safe-top)+28px)] pb-[calc(var(--safe-bottom)+24px)] ${phase === 'roll' ? 'justify-center' : ''}`}>
            <p className="text-center text-xs font-extrabold tracking-[0.3em] text-yellow">TA NOTE DE DÉPART</p>

            {/* Carte de profil */}
            <motion.div
              initial={{ rotateY: 90, scale: 0.8 }}
              animate={{ rotateY: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="relative mx-auto mt-5 w-full max-w-[300px] shrink-0 overflow-hidden rounded-[36px] p-[2px]"
              style={{ background: `linear-gradient(140deg, ${tier.colors[0]}, ${tier.colors[1]})` }}
            >
              <div className="relative rounded-[34px] bg-[#1d1556] px-5 pt-5 pb-6 text-center">
                <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-50 blur-3xl" style={{ background: tier.colors[0] }} />
                <div className="relative flex items-center justify-between">
                  <Avatar avatar={identity.avatar} size={44} />
                  {phase === 'done' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                      <TierPill ovr={ovr} />
                    </motion.div>
                  )}
                </div>
                <motion.p
                  key={phase === 'done' ? 'final' : 'rolling'}
                  animate={phase === 'done' ? { scale: [1.35, 1] } : {}}
                  transition={{ type: 'spring', stiffness: 260, damping: 10 }}
                  className="font-display tabular relative mt-2 text-[120px] leading-none font-extrabold tracking-tighter"
                  style={phase === 'done' ? { textShadow: `0 0 40px ${tier.colors[0]}aa` } : { opacity: 0.85 }}
                >
                  {shown}
                </motion.p>
                <p className="relative text-xs font-extrabold tracking-[0.35em] text-white/70">GÉNÉRAL / 99</p>
                <p className="font-display relative mt-3 text-xl font-extrabold">{identity.pseudo}</p>
                <p className="relative text-xs font-semibold text-white/55">{schoolById(identity.schoolId).short}</p>
                {phase === 'done' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative mt-4 grid grid-cols-3 gap-2">
                    {top.map((id) => (
                      <div key={id} className="rounded-2xl bg-white/10 py-2">
                        <p className="text-lg">{statById(id).emoji}</p>
                        <p className="font-display text-lg leading-none font-extrabold">{stats[id]}</p>
                        <p className="mt-0.5 text-[9px] font-extrabold tracking-wider text-white/60">{statById(id).short}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {phase === 'done' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 shrink-0">
                <p className="font-display text-center text-2xl font-extrabold">
                  {ovr >= 57 ? 'Gros potentiel. Les pistes tremblent déjà.' : ovr >= 52 ? 'Solide début. La suite dépend de toi.' : 'Tout le monde commence quelque part. Et toi, tu vas monter.'}
                </p>
                <p className="mt-2 text-center text-sm text-white/65">
                  Profil festif déclaré à {intensity} % : ta fourchette était {range[0]}–{range[1]}, le hasard a fait le reste. Ta note évolue ensuite uniquement avec l’XP.
                </p>

                <div className="mt-5 rounded-3xl bg-white p-4 text-ink">
                  <p className="mb-1 text-xs font-extrabold tracking-wider text-muted uppercase">Tes statistiques de départ</p>
                  {(Object.keys(stats) as (keyof typeof stats)[]).map((id, i) => (
                    <StatBar key={id} id={id} value={stats[id]} index={i} compact />
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <Button full size="lg" variant="hot" onClick={() => finish(false)}>
                    Entrer dans NIGHTRANK
                  </Button>
                  <Button full variant="dark" className="bg-white/10" onClick={() => finish(true)} icon={<Share2 className="h-4 w-4" />}>
                    Partager ma carte
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
