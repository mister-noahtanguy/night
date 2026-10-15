import { useState } from 'react';
import { motion } from 'framer-motion';
import { LocateFixed, MapPin } from 'lucide-react';
import type { CityId, Club } from '../../types';
import { CLUBS } from '../../data/clubs';
import { CITIES, CITY_IDS } from '../../data/schools';
import { specialTonight } from '../../data/events';
import { CoefBadge } from '../../components/ui/CoefBadge';
import { ClubCover } from '../../components/ui/ClubCover';
import { Pill } from '../../components/ui/Pill';
import { checkInXp, formatDistance } from '../../utils/format';

const RANGE = 1500;

/** Distance simulée à partir de la ville où l'utilisateur "se trouve" */
function simulatedDistance(club: Club, city: CityId): number {
  if (club.city !== city) return club.distance;
  return club.city === 'rouen' ? club.distance : 200 + (club.distance % 1000);
}

export function NearbyList({ homeCity, onPick }: { homeCity: CityId; onPick: (club: Club) => void }) {
  const [city, setCity] = useState<CityId>(homeCity);
  const clubs = CLUBS.filter((c) => c.city === city)
    .map((c) => ({ club: c, distance: simulatedDistance(c, city) }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="px-4 pb-6">
      <div className="card mb-4 flex items-center gap-3 rounded-2xl p-3">
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-turquoise/15">
          <span className="absolute inset-0 animate-ping rounded-full bg-turquoise/20" />
          <LocateFixed className="h-5 w-5 text-turquoise" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-extrabold">Position GPS simulée</p>
          <p className="text-[11px] font-semibold text-muted">Validation possible à moins de {RANGE / 1000} km d’un lieu</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {CITY_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setCity(id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${city === id ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}
          >
            {CITIES[id].emoji} {CITIES[id].name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {clubs.map(({ club, distance }, i) => {
          const inRange = distance <= RANGE;
          const ev = specialTonight(club.id);
          return (
            <motion.button
              key={club.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={inRange ? { scale: 0.97 } : undefined}
              onClick={() => inRange && onPick(club)}
              className={`card flex w-full items-center gap-3 overflow-hidden rounded-2xl p-2 text-left ${inRange ? '' : 'opacity-50'}`}
            >
              <ClubCover club={club} className="h-16 w-16 shrink-0 rounded-xl" emojiSize={26} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{club.name}</p>
                <p className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                  <MapPin className="h-3 w-3" /> {formatDistance(distance)} · {club.styles[0]}
                </p>
                <div className="mt-1">{ev ? <Pill color="#ff8a2a">🎟️ {ev.title}</Pill> : <span className="text-[10px] font-bold text-muted">{inRange ? 'À portée' : 'Trop loin'}</span>}</div>
              </div>
              <div className="flex flex-col items-end gap-1.5 pr-1">
                <CoefBadge coef={club.coefficient} size="sm" />
                {inRange && <span className="bg-brand rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white">+{checkInXp(club.coefficient)} XP</span>}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
