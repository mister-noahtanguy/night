import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useGame } from '../../store/GameProvider';

export function AchievementsScreen() {
  const { d } = useGame();
  const list = [...d.achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.current / b.def.goal - a.current / a.def.goal);
  return (
    <StackPage title="Accomplissements">
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {list.map(({ def, unlocked, current }, i) => (
          <motion.div key={def.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="card flex flex-col items-center rounded-3xl p-4 text-center">
            <span
              className="relative grid h-16 w-16 place-items-center rounded-[22px] text-3xl"
              style={unlocked ? { background: `linear-gradient(135deg, ${def.colors[0]}, ${def.colors[1]})`, boxShadow: `0 10px 24px -10px ${def.colors[0]}` } : { background: 'rgba(22,18,58,0.06)' }}
            >
              <span style={unlocked ? undefined : { filter: 'grayscale(1)', opacity: 0.35 }}>{def.emoji}</span>
              {!unlocked && (
                <span className="absolute -right-1 -bottom-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow">
                  <Lock className="h-3.5 w-3.5 text-muted" />
                </span>
              )}
            </span>
            <p className="mt-2 text-sm font-extrabold">{def.name}</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted">{def.description}</p>
            {def.xp > 0 && <p className={`mt-1.5 text-[11px] font-extrabold ${unlocked ? 'text-success' : 'text-violet'}`}>{unlocked ? `✓ +${def.xp} XP obtenus` : `+${def.xp} XP`}</p>}
            {!unlocked && (
              <div className="mt-2 w-full">
                <ProgressBar value={current / def.goal} height={6} />
                <p className="mt-1 text-[10px] font-bold text-muted">
                  {current}/{def.goal}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </StackPage>
  );
}
