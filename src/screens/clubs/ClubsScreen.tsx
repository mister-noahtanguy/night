import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, List, Map as MapIcon, Music } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { ClubCover } from '../../components/ui/ClubCover';
import { CoefBadge } from '../../components/ui/CoefBadge';
import { Pill } from '../../components/ui/Pill';
import { CLUBS } from '../../data/clubs';
import { CITIES, CITY_IDS } from '../../data/schools';
import { eventsForClub } from '../../data/events';
import { formatEventDate } from '../../game/season';
import { checkInXp, coefColor } from '../../utils/format';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import type { CityId, Club } from '../../types';

export function ClubsScreen() {
  const { user } = useGame();
  const { push } = useNav();
  const [city, setCity] = useState<CityId | 'all'>(user.profile.city);
  const [view, setView] = useState<'list' | 'map'>('list');
  const visited = new Set(user.checkIns.map((c) => c.clubId));
  const clubs = CLUBS.filter((c) => city === 'all' || c.city === city).sort((a, b) => b.coefficient - a.coefficient);
  const open = (c: Club) => push({ name: 'club', clubId: c.id });

  return (
    <StackPage
      title="Lieux partenaires"
      right={
        <div className="flex rounded-full bg-white p-1 shadow-[0_4px_14px_-6px_rgba(40,20,120,0.4)]">
          {(['list', 'map'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`grid h-8 w-9 place-items-center rounded-full transition-all ${view === v ? 'bg-night text-white' : 'text-muted'}`} aria-label={v === 'list' ? 'Liste' : 'Carte'}>
              {v === 'list' ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      }
    >
      <p className="mb-3 px-5 text-xs font-semibold text-muted">
        {CLUBS.length} lieux fictifs · {visited.size} découverts · le coefficient (x1 à x10) augmente l’XP d’une sortie
      </p>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto px-4">
        {view === 'list' && <Chip active={city === 'all'} onClick={() => setCity('all')} label="🇫🇷 Toutes" />}
        {CITY_IDS.map((id) => (
          <Chip key={id} active={city === id} onClick={() => setCity(id)} label={`${CITIES[id].emoji} ${CITIES[id].name}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 px-4">
            {clubs.map((c, i) => (
              <ClubCard key={c.id} club={c} index={i} visited={visited.has(c.id)} onClick={() => open(c)} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4">
            <CityMap city={city === 'all' ? user.profile.city : city} visited={visited} onSelect={open} />
          </motion.div>
        )}
      </AnimatePresence>
    </StackPage>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${active ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}>
      {label}
    </button>
  );
}

function ClubCard({ club, index, visited, onClick }: { club: Club; index: number; visited: boolean; onClick: () => void }) {
  const next = eventsForClub(club.id)[0];
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 26 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card block w-full overflow-hidden rounded-3xl text-left"
    >
      <div className="relative">
        <ClubCover club={club} className="h-32" emojiSize={48} />
        <div className="absolute top-3 left-3">
          <CoefBadge coef={club.coefficient} size="md" />
        </div>
        <div className="absolute top-3 right-3">{visited ? <Pill solid color="#19b36b">✓ Découvert</Pill> : <Pill solid color="#ff4fa3">Nouveau lieu · +60 XP</Pill>}</div>
        <div className="absolute bottom-3 left-4 text-white">
          <p className="font-display text-xl font-extrabold drop-shadow">{club.name}</p>
          <p className="text-xs font-semibold opacity-80">
            {CITIES[club.city].name} · {club.district}
          </p>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-2">
          <Music className="h-3.5 w-3.5" /> {club.styles.join(' · ')}
          <span className="ml-auto font-extrabold text-violet">+{checkInXp(club.coefficient)} XP</span>
        </div>
        {next && (
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-pink" />
            <span className="font-extrabold text-pink">{formatEventDate(next.date)}</span>
            <span className="truncate font-semibold text-ink-2">{next.title}</span>
            {next.special && (
              <Pill color="#ff8a2a" className="ml-auto shrink-0">
                🎟️ +50 XP
              </Pill>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/** Carte stylisée (fictive) d'une ville avec les lieux en pins */
function CityMap({ city, visited, onSelect }: { city: CityId; visited: Set<string>; onSelect: (c: Club) => void }) {
  const clubs = CLUBS.filter((c) => c.city === city);
  const [selected, setSelected] = useState<Club | null>(null);
  const sel = selected && selected.city === city ? selected : null;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#e9e5f8] ring-1 ring-line">
        <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <path d="M-5 70 C20 60 35 85 55 72 S85 55 110 66" stroke="#b7e9f2" strokeWidth="7" fill="none" />
          {['M0 30 L100 38', 'M10 0 L30 125', 'M60 0 L48 125', 'M0 100 L100 92', 'M85 0 L72 125', 'M0 15 C40 25 60 5 100 18', 'M0 115 C30 105 70 120 100 108'].map((d) => (
            <path key={d} d={d} stroke="#ffffff" strokeWidth="1.6" fill="none" />
          ))}
          <circle cx="78" cy="22" r="8" fill="#c9f0d8" />
          <circle cx="18" cy="96" r="10" fill="#c9f0d8" />
        </svg>
        <div className="absolute" style={{ left: '48%', top: '52%' }}>
          <span className="absolute -inset-4 animate-ping rounded-full bg-blue/25" />
          <span className="relative block h-4 w-4 rounded-full bg-blue ring-4 ring-white" />
        </div>
        {clubs.map((c, i) => {
          const [, b] = coefColor(c.coefficient);
          const active = sel?.id === c.id;
          return (
            <motion.button
              key={c.id}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: active ? 1.15 : 1, y: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
              onClick={() => setSelected(c)}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${c.map.x}%`, top: `${c.map.y}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="font-display rounded-xl bg-white px-2 py-1 text-xs font-extrabold whitespace-nowrap shadow-lg" style={{ color: b, boxShadow: `0 6px 16px -6px ${b}` }}>
                  {c.emoji} x{c.coefficient} {visited.has(c.id) ? '✓' : ''}
                </span>
                <span className="h-2.5 w-[2px]" style={{ background: b }} />
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: b }} />
              </div>
            </motion.button>
          );
        })}
        <div className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold shadow">
          {CITIES[city].emoji} {CITIES[city].name} · {clubs.length} lieux
        </div>
      </div>
      <AnimatePresence mode="wait">
        {sel ? (
          <motion.div key={sel.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4">
            <ClubCard club={sel} index={0} visited={visited.has(sel.id)} onClick={() => onSelect(sel)} />
          </motion.div>
        ) : (
          <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center text-sm font-semibold text-muted">
            Touche un pin pour voir le lieu 👆
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
