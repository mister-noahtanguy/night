import { motion } from 'framer-motion';
import type { StatId } from '../../types';
import { statById } from '../../game/stats';

interface Props {
  id: StatId;
  value: number;
  progress?: number;
  compare?: number;
  index?: number;
  onClick?: () => void;
  compact?: boolean;
}

/** Statistique complémentaire (1 à 99) avec sa barre */
export function StatBar({ id, value, progress, compare, index = 0, onClick, compact }: Props) {
  const s = statById(id);
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center gap-3 text-left ${compact ? 'py-1.5' : 'py-2'}`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg" style={{ background: `${s.color}1f` }}>
        {s.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[13px] font-bold text-ink">{s.name}</span>
          <span className="flex items-baseline gap-1.5">
            {compare !== undefined && (
              <span className={`text-[11px] font-extrabold ${compare > value ? 'text-success' : compare < value ? 'text-pink' : 'text-muted'}`}>{compare}</span>
            )}
            <span className="font-display tabular text-base font-extrabold" style={{ color: s.color }}>
              {value}
            </span>
          </span>
        </div>
        <div className="relative mt-1 h-2 rounded-full bg-ink/[0.07]">
          <motion.div
            className="relative h-full overflow-hidden rounded-full"
            style={{ background: `linear-gradient(90deg, ${s.color}aa, ${s.color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ delay: 0.15 + index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          {compare !== undefined && <div className="absolute inset-y-0 z-10 w-[3px] -translate-x-1/2 rounded-full bg-ink" style={{ left: `${compare}%` }} />}
        </div>
        {progress !== undefined && !compact && <p className="mt-0.5 text-[10px] font-semibold text-muted">{Math.round(progress * 100)} % vers {value + 1}</p>}
      </div>
    </motion.button>
  );
}
