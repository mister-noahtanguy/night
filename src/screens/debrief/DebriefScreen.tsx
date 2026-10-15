import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Lock, SkipForward } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Confetti } from '../../components/ui/Confetti';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { clubById } from '../../data/clubs';
import { userById } from '../../data/users';
import { STATS, statById } from '../../game/stats';
import type { StatId, StatMap } from '../../types';

/** Les catégories votées pendant le débrief : chaque vote fait progresser la stat correspondante de l'ami */
const ROUNDS = STATS.filter((s) => ['ambiance', 'piste', 'endurance', 'social', 'capitaine'].includes(s.id));
const QUESTION: Partial<Record<StatId, string>> = {
  ambiance: 'a mis le feu à la soirée',
  piste: 'n’a pas quitté la piste',
  endurance: 'a tenu jusqu’à la fermeture',
  social: 'a parlé à toute la boîte',
  capitaine: 'a ramené tout le monde à bon port',
};

export function DebriefScreen({ checkInId }: { checkInId: string }) {
  const { user, submitDebrief } = useGame();
  const { pop } = useNav();
  const ci = user.checkIns.find((c) => c.id === checkInId);
  const [round, setRound] = useState(-1);
  const [votes, setVotes] = useState<Partial<Record<StatId, string>>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [received, setReceived] = useState<Partial<StatMap> | null>(null);

  if (!ci) return null;
  const club = clubById(ci.clubId);
  const friends = ci.friendsPresent.map((id) => userById(id)).filter((u): u is NonNullable<typeof u> => !!u);
  const done = round >= ROUNDS.length;
  const cur = ROUNDS[round];

  const next = (vote?: string) => {
    const nextVotes = vote ? { ...votes, [cur.id]: vote } : votes;
    setVotes(nextVotes);
    setPicked(null);
    if (round + 1 >= ROUNDS.length) setReceived(submitDebrief(ci.id, nextVotes));
    setRound(round + 1);
  };

  const pick = (id: string) => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => next(id), 550);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -90) next();
  };

  return (
    <StackPage title="Le Débrief">
      <div className="relative flex min-h-[calc(100%-20px)] flex-col px-5">
        {round >= 0 && !done && (
          <div className="mb-5 flex gap-1.5">
            {ROUNDS.map((r, i) => (
              <div key={r.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                <motion.div className="bg-brand h-full" initial={false} animate={{ width: i < round ? '100%' : i === round ? '50%' : '0%' }} />
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {round === -1 && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-1 flex-col items-center pt-4 text-center">
              <motion.span animate={{ rotate: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 2.4 }} className="text-7xl">
                🗳️
              </motion.span>
              <h2 className="font-display mt-4 text-[28px] font-extrabold">Débrief d’hier soir</h2>
              <p className="mt-1 text-sm font-semibold text-muted">
                {club.emoji} {club.name} · {new Date(ci.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="mt-6 flex -space-x-3">
                {friends.map((f, i) => (
                  <motion.div key={f.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}>
                    <Avatar avatar={f.avatar} size={60} className="ring-4 ring-canvas" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-3 text-sm font-extrabold">{friends.map((f) => f.name).join(', ')} étaient avec toi</p>
              <p className="mt-0.5 text-xs font-semibold text-muted">Présence confirmée par leur propre validation de sortie</p>
              <div className="card mt-6 flex items-start gap-3 rounded-2xl p-4 text-left">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-violet" />
                <p className="text-xs leading-relaxed font-semibold text-ink-2">
                  Tes votes sont anonymes et font progresser les statistiques de tes potes (pas leur note générale). Tu gagnes 20 XP en participant.
                </p>
              </div>
              <div className="mt-auto w-full pt-8">
                <Button full size="lg" onClick={() => setRound(0)}>
                  C’est parti · {ROUNDS.length} questions
                </Button>
              </div>
            </motion.div>
          )}

          {round >= 0 && !done && (
            <motion.div
              key={cur.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={onDragEnd}
              initial={{ opacity: 0, x: 80, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -120, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex flex-1 flex-col"
            >
              <div className="relative overflow-hidden rounded-[32px] px-5 py-6 text-center text-white" style={{ background: `linear-gradient(140deg, ${cur.color}, #2a1f78)` }}>
                <p className="text-[11px] font-extrabold tracking-widest uppercase opacity-80">Hier soir, qui…</p>
                <motion.p initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className="mt-3 text-7xl">
                  {cur.emoji}
                </motion.p>
                <h2 className="font-display mt-3 text-2xl leading-tight font-extrabold">{QUESTION[cur.id]} ?</h2>
                <p className="mt-1 text-sm font-semibold opacity-80">
                  Vote pour « {cur.name} » · +15 en {cur.short}
                </p>
              </div>

              <div className={`mt-6 grid gap-3 ${friends.length > 2 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {friends.map((f) => {
                  const sel = picked === f.id;
                  return (
                    <motion.button
                      key={f.id}
                      whileTap={{ scale: 0.92 }}
                      animate={sel ? { scale: [1, 1.12, 1.05] } : picked ? { opacity: 0.35, scale: 0.95 } : { opacity: 1, scale: 1 }}
                      onClick={() => pick(f.id)}
                      className="card relative flex flex-col items-center rounded-3xl px-2 py-4"
                      style={sel ? { boxShadow: `inset 0 0 0 3px ${cur.color}` } : undefined}
                    >
                      <Avatar avatar={f.avatar} size={58} />
                      <span className="mt-2 text-sm font-extrabold">{f.name}</span>
                      {sel && (
                        <motion.span initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: -6 }} className="absolute -top-3 text-2xl">
                          {cur.emoji}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <button onClick={() => next()} className="mx-auto mt-6 flex items-center gap-1.5 text-sm font-extrabold text-muted active:text-ink">
                <SkipForward className="h-4 w-4" /> Passer (ou glisse vers la gauche)
              </button>
            </motion.div>
          )}

          {done && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col items-center pt-2 text-center">
              <Confetti />
              <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} className="text-7xl">
                🎉
              </motion.div>
              <h2 className="font-display mt-3 text-[28px] font-extrabold">Votes envoyés !</h2>
              <p className="mt-1 text-sm font-semibold text-muted">Ils font progresser les statistiques de tes potes.</p>

              <div className="mt-5 w-full space-y-2">
                {(Object.entries(votes) as [StatId, string][]).map(([s, uid], i) => {
                  const st = statById(s);
                  const f = userById(uid)!;
                  return (
                    <motion.div key={s} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="card flex items-center gap-3 rounded-2xl p-3 text-left">
                      <span className="text-2xl">{st.emoji}</span>
                      <span className="flex-1 text-sm font-extrabold" style={{ color: st.color }}>
                        {st.name}
                      </span>
                      <Avatar avatar={f.avatar} size={30} />
                      <span className="text-sm font-bold">{f.name}</span>
                    </motion.div>
                  );
                })}
                {Object.keys(votes).length === 0 && <p className="text-sm text-muted">Aucun vote cette fois-ci.</p>}
              </div>

              {received && Object.keys(received).length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="card-night mt-5 w-full rounded-3xl p-4">
                  <p className="text-[11px] font-extrabold tracking-widest text-yellow uppercase">Tes potes ont voté pour toi</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {(Object.entries(received) as [StatId, number][]).map(([s, n]) => (
                      <span key={s} className="rounded-full bg-white/12 px-3 py-1.5 text-sm font-extrabold">
                        {statById(s).emoji} {statById(s).name} ×{n}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mt-auto w-full pt-8">
                <Button full size="lg" onClick={pop}>
                  Terminer
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StackPage>
  );
}
