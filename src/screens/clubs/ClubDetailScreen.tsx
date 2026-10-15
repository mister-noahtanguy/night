import { motion } from 'framer-motion';
import { Calendar, Crown, MapPin, Music, ScanLine } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { ClubCover } from '../../components/ui/ClubCover';
import { CoefBadge } from '../../components/ui/CoefBadge';
import { Pill } from '../../components/ui/Pill';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { OvrBadge } from '../../components/game/OvrBadge';
import { clubById } from '../../data/clubs';
import { eventsForClub } from '../../data/events';
import { CITIES } from '../../data/schools';
import { clubKings } from '../../game/rankings';
import { formatEventDate } from '../../game/season';
import { XP_REWARDS } from '../../game/config';
import { checkInXp, formatNp } from '../../utils/format';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';

const MEDALS = ['🥇', '🥈', '🥉'];

export function ClubDetailScreen({ clubId }: { clubId: string }) {
  const club = clubById(clubId);
  const { user, d } = useGame();
  const { push } = useNav();
  const events = eventsForClub(club.id);
  const myVisits = user.checkIns.filter((c) => c.clubId === club.id).length;
  const kings = clubKings(club.id, { visits: myVisits, pseudo: user.profile.pseudo, avatar: user.profile.avatar, ovr: d.rating.ovr });

  return (
    <StackPage transparentHeader>
      <div className="relative text-white">
        <ClubCover club={club} className="h-72" emojiSize={96} />
        <div className="absolute right-5 bottom-5 left-5">
          <p className="text-xs font-bold opacity-80">
            <MapPin className="mr-1 inline h-3 w-3" />
            {CITIES[club.city].name} · {club.district}
          </p>
          <h1 className="font-display mt-1 text-[34px] leading-none font-extrabold">{club.name}</h1>
          <p className="mt-1.5 text-sm font-semibold opacity-85">{club.tagline}</p>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-5">
        <div className="card flex items-center gap-4 rounded-3xl p-4">
          <CoefBadge coef={club.coefficient} size="xl" />
          <div className="flex-1">
            <p className="text-[11px] font-extrabold tracking-widest text-muted uppercase">Par sortie validée</p>
            <p className="font-display text-2xl font-extrabold text-violet">+{checkInXp(club.coefficient)} XP</p>
            <p className="text-xs font-semibold text-muted">
              {myVisits === 0 ? `+${XP_REWARDS.newPlace} XP de découverte la première fois` : `Déjà découvert · ${myVisits} visite${myVisits > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Validations saison" value={formatNp(club.seasonCheckIns + myVisits)} />
          <Stat label="Tes visites" value={String(myVisits)} />
          <Stat label="Capacité" value={club.capacity} />
        </div>

        <p className="text-sm leading-relaxed font-medium text-ink-2">{club.description}</p>
        <div className="flex flex-wrap gap-2">
          {club.styles.map((s) => (
            <Pill key={s} color="#6d3aff">
              <Music className="h-3 w-3" /> {s}
            </Pill>
          ))}
        </div>

        <div>
          <SectionTitle sub="Les habitués de la saison (démo)">
            <Crown className="mr-1.5 inline h-4 w-4 text-yellow" />
            Rois du lieu
          </SectionTitle>
          <div className="space-y-2">
            {kings.map((k, i) => (
              <button key={k.id} onClick={() => !k.isMe && push({ name: 'user', userId: k.id })} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ${k.isMe ? 'bg-night text-white' : 'card'}`}>
                <span className="text-2xl">{MEDALS[i]}</span>
                <Avatar avatar={k.avatar} size={40} />
                <div className="flex-1">
                  <p className="text-sm font-extrabold">{k.isMe ? 'Toi' : k.pseudo}</p>
                  <p className={`text-[11px] font-semibold ${k.isMe ? 'text-white/60' : 'text-muted'}`}>{k.visits} visites cette saison</p>
                </div>
                <OvrBadge ovr={k.ovr} size={36} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>
            <Calendar className="mr-1.5 inline h-4 w-4 text-pink" />
            Prochaines soirées
          </SectionTitle>
          <div className="space-y-2">
            {events.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-2xl p-3.5 ${e.special ? 'bg-gradient-to-r from-orange/15 to-yellow/15 ring-1 ring-orange/30' : 'card'}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold text-pink">{formatEventDate(e.date)}</p>
                  {e.special && <Pill color="#ff8a2a">🎟️ Événement spécial · +{XP_REWARDS.event} XP</Pill>}
                </div>
                <p className="font-display mt-1 text-base font-extrabold">{e.title}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">{e.lineup}</p>
              </motion.div>
            ))}
            {events.length === 0 && <p className="text-sm text-muted">Pas de soirée annoncée pour le moment.</p>}
          </div>
        </div>

        <Button full size="lg" onClick={() => push({ name: 'checkin' })} icon={<ScanLine className="h-5 w-5" />}>
          Je suis sur place : valider ma sortie
        </Button>
      </div>
    </StackPage>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card rounded-2xl p-3 text-center">
      <p className="font-display text-[15px] font-extrabold whitespace-nowrap">{value}</p>
      <p className="mt-0.5 text-[10px] leading-tight font-bold text-muted">{label}</p>
    </div>
  );
}
