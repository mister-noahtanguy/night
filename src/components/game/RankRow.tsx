import { motion } from 'framer-motion';
import { Avatar } from '../ui/Avatar';
import { OvrBadge } from './OvrBadge';
import { schoolById, CITIES } from '../../data/schools';
import { formatNp } from '../../utils/format';
import type { RankEntry, SortKey } from '../../game/rankings';
import { statById } from '../../game/stats';
import type { StatId } from '../../types';

interface Props {
  entry: RankEntry;
  sort: SortKey;
  index?: number;
  onClick?: () => void;
  sticky?: boolean;
}

export function RankRow({ entry, sort, index = 0, onClick, sticky }: Props) {
  const isStat = sort !== 'ovr' && sort !== 'season';
  return (
    <motion.button
      initial={sticky ? undefined : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.025 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${entry.isMe ? 'bg-night text-white' : sticky ? '' : 'card'}`}
    >
      <span className={`font-display tabular w-7 text-center text-sm font-extrabold ${entry.isMe ? 'text-white/70' : 'text-muted'}`}>{entry.position}</span>
      <Avatar avatar={entry.avatar} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold">
          {entry.pseudo}
          {entry.isMe && <span className="ml-1.5 rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-extrabold">TOI</span>}
        </p>
        <p className={`truncate text-[11px] font-semibold ${entry.isMe ? 'text-white/60' : 'text-muted'}`}>
          {schoolById(entry.schoolId).short} · {CITIES[entry.city].name}
          {entry.streak > 0 && <span className="ml-1.5">🔥{entry.streak}</span>}
        </p>
      </div>
      {sort === 'season' && (
        <span className="font-display tabular text-sm font-extrabold">
          {formatNp(entry.seasonXp)}
          <span className={`ml-0.5 text-[9px] ${entry.isMe ? 'text-white/50' : 'text-muted'}`}>XP</span>
        </span>
      )}
      {isStat && (
        <span className="font-display tabular flex items-center gap-1 text-base font-extrabold" style={{ color: entry.isMe ? '#fff' : statById(sort as StatId).color }}>
          <span className="text-sm">{statById(sort as StatId).emoji}</span>
          {entry.value}
        </span>
      )}
      <OvrBadge ovr={entry.ovr} size={sort === 'ovr' ? 42 : 34} />
    </motion.button>
  );
}
