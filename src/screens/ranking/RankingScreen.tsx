import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, Info, Timer } from 'lucide-react';
import { PageTitle, Screen } from '../../components/layout/Screen';
import { Segmented } from '../../components/ui/Segmented';
import { Avatar } from '../../components/ui/Avatar';
import { RankRow } from '../../components/game/RankRow';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { buildLeaderboard, buildSchoolLeaderboard, type RankEntry, type Scope, type SortKey } from '../../game/rankings';
import { formatCountdown } from '../../game/season';
import { STATS, statById } from '../../game/stats';
import { CITIES, CITY_IDS } from '../../data/schools';
import { USERS } from '../../data/users';
import { formatNp } from '../../utils/format';
import type { CityId, StatId } from '../../types';

type Mode = 'ovr' | 'season' | 'stats' | 'schools';

const SCOPES: { id: Scope; label: string }[] = [
  { id: 'friends', label: '👯 Amis' },
  { id: 'school', label: '🎓 Mon école' },
  { id: 'city', label: '🏙️ Ville' },
  { id: 'world', label: '🌍 Tout le monde' },
];

export function RankingScreen() {
  const { d, user } = useGame();
  const { push } = useNav();
  const [mode, setMode] = useState<Mode>('ovr');
  const [scope, setScope] = useState<Scope>('friends');
  const [city, setCity] = useState<CityId>(user.profile.city);
  const [stat, setStat] = useState<StatId>('ambiance');
  const sort: SortKey = mode === 'stats' ? stat : mode === 'season' ? 'season' : 'ovr';
  const board = buildLeaderboard(scope, sort, d.me, city);
  const myEntry = board.find((e) => e.isMe);
  const ahead = myEntry ? board[myEntry.position - 2] : undefined;
  const open = (e: RankEntry) => (e.isMe ? undefined : push({ name: 'user', userId: e.id }));
  const unit = (e: RankEntry) => (sort === 'season' ? `${formatNp(e.seasonXp)} XP` : sort === 'ovr' ? `${e.ovr}` : `${e.value}`);

  return (
    <>
      <Screen className="pb-[calc(var(--tabbar-h)+var(--safe-bottom)+110px)]">
        <PageTitle title="Classements" subtitle="Compare ta note à tes amis et à des inconnus." />
        <div className="space-y-3 px-4">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { id: 'ovr', label: 'Général' },
              { id: 'season', label: 'Saison' },
              { id: 'stats', label: 'Stats' },
              { id: 'schools', label: 'Écoles' },
            ]}
          />

          {mode !== 'schools' && (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {SCOPES.map((s) => (
                <Chip key={s.id} active={scope === s.id} onClick={() => setScope(s.id)} label={s.label} />
              ))}
            </div>
          )}
          {mode !== 'schools' && scope === 'city' && (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {CITY_IDS.map((c) => (
                <Chip key={c} small active={city === c} onClick={() => setCity(c)} label={`${CITIES[c].emoji} ${CITIES[c].name}`} />
              ))}
            </div>
          )}
          {mode === 'stats' && (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
              {STATS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStat(s.id)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors"
                  style={stat === s.id ? { background: s.color, color: '#fff' } : { background: `${s.color}14`, color: s.color }}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          )}
          {mode === 'season' && (
            <div className="flex items-center gap-2 rounded-2xl bg-violet/10 px-3 py-2 text-xs font-bold text-violet">
              <Timer className="h-4 w-4" /> Saison {d.season.number} · XP gagnée depuis le début de saison · fin dans {formatCountdown(d.season.msLeft)}
            </div>
          )}
          <div className="flex items-center gap-2 px-1 text-[11px] font-semibold text-muted">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>
              Données de démonstration : {USERS.length} profils fictifs. Les vrais classements arriveront avec la mise en ligne.
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'schools' ? (
            <motion.div key="schools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 space-y-2 px-4">
              {buildSchoolLeaderboard(d.me).map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-2xl p-3 ${s.isMine ? 'bg-night text-white' : 'card'}`}
                >
                  <span className={`font-display w-6 text-center text-sm font-extrabold ${s.isMine ? 'text-white/60' : 'text-muted'}`}>{s.position}</span>
                  <span className="font-display grid h-10 w-12 shrink-0 place-items-center rounded-xl text-[10px] font-extrabold" style={{ background: `${s.color}22`, color: s.isMine ? '#fff' : s.color }}>
                    {s.tag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{s.name}</p>
                    <p className={`truncate text-[11px] font-semibold ${s.isMine ? 'text-white/60' : 'text-muted'}`}>
                      {s.isMine && 'TON ÉCOLE · '}
                      {CITIES[s.city].name} · {s.members} profils · {formatNp(s.seasonXp)} XP saison
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <OvrBadge ovr={s.avgOvr} size={40} label={false} />
                    <span className={`mt-0.5 text-[9px] font-extrabold ${s.isMine ? 'text-white/60' : 'text-muted'}`}>MOY.</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key={`${mode}-${scope}-${city}-${stat}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {board.length > 0 && <Podium entries={board.slice(0, 3)} onSelect={open} unit={unit} sort={sort} />}
              <div className="space-y-2 px-4">
                {board.slice(3).map((e, i) => (
                  <RankRow key={e.id} entry={e} sort={sort} index={i} onClick={() => open(e)} />
                ))}
                {board.length <= 1 && <p className="py-6 text-center text-sm font-semibold text-muted">Ajoute des amis pour remplir ce classement 👀</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Screen>

      {mode !== 'schools' && myEntry && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+4px)] z-30 px-4">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pointer-events-auto overflow-hidden rounded-2xl bg-night shadow-[0_-8px_30px_rgba(20,10,70,0.35)]">
            <RankRow entry={myEntry} sort={sort} sticky />
            {ahead && (
              <p className="px-4 pb-2.5 text-[11px] font-semibold text-white/65">
                ⚔️ Prochain à dépasser : <b className="text-white">{ahead.pseudo}</b> ({unit(ahead)})
              </p>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}

function Chip({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full font-extrabold transition-all active:scale-95 ${small ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-2 text-xs'} ${active ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}
    >
      {label}
    </button>
  );
}

function Podium({ entries, onSelect, unit, sort }: { entries: RankEntry[]; onSelect: (e: RankEntry) => void; unit: (e: RankEntry) => string; sort: SortKey }) {
  const order = [entries[1], entries[0], entries[2]].filter(Boolean);
  const heights: Record<number, number> = { 1: 96, 2: 72, 3: 56 };
  const medal: Record<number, string> = { 1: '#ffc23c', 2: '#a9b4c8', 3: '#e0915a' };
  const statColor = sort !== 'ovr' && sort !== 'season' ? statById(sort as StatId).color : undefined;
  return (
    <div className="mt-5 mb-4 flex items-end justify-center gap-3 px-4">
      {order.map((e) => (
        <motion.button
          key={e.id}
          onClick={() => onSelect(e)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: e.position === 1 ? 0.12 : 0.04 * e.position }}
          className="flex w-[30%] flex-col items-center"
        >
          <div className="relative mb-2">
            {e.position === 1 && (
              <motion.div animate={{ y: [0, -3, 0], rotate: [-6, 6, -6] }} transition={{ duration: 2.4, repeat: Infinity }} className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Crown className="h-6 w-6 fill-yellow text-yellow" />
              </motion.div>
            )}
            <Avatar avatar={e.avatar} size={e.position === 1 ? 70 : 56} ring={e.isMe ? '#ff4fa3' : medal[e.position]} />
            <div className="absolute -right-3 -bottom-2">
              <OvrBadge ovr={e.ovr} size={30} label={false} />
            </div>
          </div>
          <p className="w-full truncate text-center text-xs font-extrabold">{e.isMe ? 'Toi' : e.pseudo}</p>
          <p className="font-display tabular text-sm font-extrabold" style={{ color: statColor ?? '#6d3aff' }}>
            {unit(e)}
          </p>
          <div className="mt-2 grid w-full place-items-start justify-center rounded-t-2xl pt-2" style={{ height: heights[e.position], background: `linear-gradient(180deg, ${medal[e.position]}, ${medal[e.position]}33)` }}>
            <span className="font-display text-3xl font-extrabold text-white drop-shadow">{e.position}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
