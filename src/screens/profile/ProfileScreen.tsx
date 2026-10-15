import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronRight, Crown, History, Lock, MapPin, RotateCcw, ScanLine, Settings, Share2, Sparkles } from 'lucide-react';
import { Screen } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Sheet } from '../../components/ui/Sheet';
import { XpPill } from '../../components/ui/Pill';
import { Logo } from '../../components/game/Logo';
import { RatingRing, TierPill } from '../../components/game/RatingRing';
import { StatBar } from '../../components/game/StatBar';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { CITIES, schoolById } from '../../data/schools';
import { clubById } from '../../data/clubs';
import { userById } from '../../data/users';
import { STATS, statById } from '../../game/stats';
import { buildLeaderboard } from '../../game/rankings';
import { formatNp } from '../../utils/format';
import type { CityId, StatId } from '../../types';

export function ProfileScreen() {
  const { user, d } = useGame();
  const { push, setTab } = useNav();
  const { profile } = user;
  const [settings, setSettings] = useState(false);
  const [statOpen, setStatOpen] = useState<StatId | null>(null);
  const { rating } = d;

  const sortedStats = [...STATS].sort((a, b) => d.stats[b.id].value - d.stats[a.id].value);
  const signature = sortedStats[0];
  const friendsBoard = buildLeaderboard('friends', 'ovr', d.me);
  const myFriendRank = friendsBoard.find((e) => e.isMe)?.position ?? 1;
  const cityCounts = user.checkIns.reduce<Record<string, number>>((acc, c) => {
    const city = clubById(c.clubId).city;
    acc[city] = (acc[city] ?? 0) + 1;
    return acc;
  }, {});
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as CityId | undefined;
  const nextChallenges = [...d.challenges.daily, ...d.challenges.weekly]
    .filter((c) => c.status !== 'done')
    .sort((a, b) => Number(b.status === 'claimable') - Number(a.status === 'claimable'))
    .slice(0, 3);
  const unlocked = d.achievements.filter((a) => a.unlocked);

  return (
    <>
      <Screen>
        <div className="space-y-6 px-4">
          <div className="flex items-center justify-between px-1">
            <Logo size={18} />
            <div className="flex gap-2">
              <RoundButton label="Partager mon profil" onClick={() => push({ name: 'share' })}>
                <Share2 className="h-[18px] w-[18px]" />
              </RoundButton>
              <RoundButton label="Réglages" onClick={() => setSettings(true)}>
                <Settings className="h-[18px] w-[18px]" />
              </RoundButton>
            </div>
          </div>

          {/* Carte de note générale */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card tone="night" className="p-5">
              <div className="flex items-center gap-3">
                <Avatar avatar={profile.avatar} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-lg leading-tight font-extrabold">{profile.pseudo}</p>
                  <p className="truncate text-xs font-semibold text-white/60">
                    {schoolById(profile.schoolId).short} · {CITIES[profile.city].name}
                  </p>
                </div>
                <TierPill ovr={rating.ovr} />
              </div>

              <div className="mt-4 flex items-center gap-4">
                <RatingRing ovr={rating.ovr} progress={rating.progress} size={140} />
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Fact label="Style signature" value={`${signature.emoji} ${signature.name}`} />
                  <Fact label="Cette semaine" value={`+${formatNp(d.weekXp)} XP`} accent />
                  <Fact label="Chez tes amis" value={`#${myFriendRank} sur ${friendsBoard.length}`} />
                  <Fact label="Meilleure note" value={String(Math.max(user.bestOvr, rating.ovr))} />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-baseline justify-between text-xs font-bold">
                  <span className="text-white/70">
                    XP <span className="font-display tabular text-white">{formatNp(rating.xpInto)}</span> / {formatNp(rating.xpNeeded)}
                  </span>
                  <span className="text-yellow">{rating.maxed ? '99 atteint 👑' : `Encore ${formatNp(rating.remaining)} XP → ${rating.ovr + 1}`}</span>
                </div>
                <ProgressBar value={rating.progress} colors={['#ffc23c', '#ff4fa3']} height={12} track="rgba(255,255,255,0.14)" />
                <p className="mt-2 text-[11px] font-semibold text-white/50">
                  {formatNp(d.totalXp)} XP gagnés depuis ton arrivée · note de départ {profile.startOvr}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => push({ name: 'xpguide' })} className="glass-dark flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-extrabold">
                  <BookOpen className="h-4 w-4" /> Gagner de l’XP
                </button>
                <button onClick={() => push({ name: 'journal' })} className="glass-dark flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-extrabold">
                  <History className="h-4 w-4" /> Journal d’XP
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Débrief en attente */}
          {d.pendingDebrief && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => push({ name: 'debrief', checkInId: d.pendingDebrief!.id })}
              className="bg-hot relative flex w-full items-center gap-3 overflow-hidden rounded-3xl p-4 text-left text-white"
            >
              <span className="text-4xl">🗳️</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold tracking-widest uppercase opacity-80">Débrief d’hier soir</p>
                <p className="font-display text-lg leading-tight font-extrabold">Qui a mis le feu ?</p>
                <p className="truncate text-xs font-semibold opacity-85">
                  {clubById(d.pendingDebrief.clubId).name} · avec {d.pendingDebrief.friendsPresent.map((id) => userById(id)?.name).join(', ')}
                </p>
              </div>
              <XpPill xp={20} />
            </motion.button>
          )}

          {/* Prochaines actions */}
          <div>
            <SectionTitle action="Tous les défis" onAction={() => setTab('challenges')} sub="Ce qui fait monter ta note maintenant">
              Prochain point de général
            </SectionTitle>
            <div className="space-y-2">
              <button onClick={() => push({ name: 'checkin' })} className="bg-brand flex w-full items-center gap-3 rounded-2xl p-3.5 text-left text-white active:scale-[.98]">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <ScanLine className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-extrabold">Valider une sortie</p>
                  <p className="text-[11px] font-semibold opacity-80">QR code ou géolocalisation dans un lieu partenaire</p>
                </div>
                <span className="font-display text-sm font-extrabold whitespace-nowrap">+24 à 60 XP</span>
              </button>
              {nextChallenges.map((c) => (
                <button key={c.key} onClick={() => setTab('challenges')} className="card flex w-full items-center gap-3 rounded-2xl p-3 text-left active:scale-[.98]">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet/10 text-xl">{c.def.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{c.def.title}</p>
                    <p className="truncate text-[11px] font-semibold text-muted">
                      {c.status === 'claimable' ? '✅ Prêt à récupérer' : c.status === 'pending' ? '⏳ En attente de confirmation' : c.def.period === 'daily' ? 'Défi du jour' : 'Défi de la semaine'}
                    </p>
                  </div>
                  <XpPill xp={c.def.xp} />
                </button>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <Card className="p-4">
            <SectionTitle sub="Elles évoluent indépendamment de ta note, selon tes défis et les votes de tes potes.">Statistiques</SectionTitle>
            {sortedStats.map((s, i) => (
              <StatBar key={s.id} id={s.id} value={d.stats[s.id].value} progress={d.stats[s.id].progress} index={i} onClick={() => setStatOpen(s.id)} compact />
            ))}
          </Card>

          {/* Accomplissements */}
          <div>
            <SectionTitle action="Tout voir" onAction={() => push({ name: 'achievements' })}>
              Accomplissements{' '}
              <span className="text-sm text-muted">
                {unlocked.length}/{d.achievements.length}
              </span>
            </SectionTitle>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
              {[...d.achievements]
                .sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
                .slice(0, 10)
                .map(({ def, unlocked: u, current }) => (
                  <button key={def.id} onClick={() => push({ name: 'achievements' })} className="card flex w-[96px] shrink-0 flex-col items-center rounded-2xl px-2 py-3 text-center">
                    <span
                      className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                      style={u ? { background: `linear-gradient(135deg, ${def.colors[0]}, ${def.colors[1]})` } : { background: 'rgba(22,18,58,0.06)' }}
                    >
                      {u ? def.emoji : <Lock className="h-5 w-5 text-muted" />}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-[11px] leading-tight font-extrabold">{def.name}</span>
                    {!u && (
                      <span className="mt-0.5 text-[10px] font-bold text-muted">
                        {current}/{def.goal}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Sorties */}
          <div>
            <SectionTitle action="Explorer les lieux" onAction={() => push({ name: 'clubs' })}>
              Sorties
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <Tile emoji="🚪" value={String(d.player.outings)} label="sorties validées" />
              <Tile emoji="📍" value={String(d.player.places)} label="lieux découverts" />
              <Tile emoji="🏙️" value={topCity ? CITIES[topCity].name : '—'} label="ville la plus fréquentée" />
              <Tile emoji="🔥" value={`${d.streak} sem.`} label={`série · record ${d.player.bestStreak}`} />
            </div>
          </div>

          {/* Club des 99 */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1f78] via-[#6d3aff] to-[#ff4fa3] p-[2px]">
            <div className="rounded-[22px] bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow to-pink">
                  <Crown className="h-6 w-6 text-white" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-lg font-extrabold">Le Club des 99</p>
                  <p className="text-xs font-semibold text-muted">{rating.maxed ? 'Tu en fais partie 👑' : `Encore ${99 - rating.ovr} points de général`}</p>
                </div>
                <Lock className="h-5 w-5 text-muted" />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-2">
                Atteindre 99 est l’accomplissement ultime de NIGHTRANK. Des récompenses de haut niveau sont en préparation pour les membres du club.{' '}
                <b>Aucune récompense réelle n’est disponible pour le moment.</b>
              </p>
            </div>
          </div>
        </div>
      </Screen>

      <AnimatePresence>
        {statOpen && <StatSheet key="stat" id={statOpen} onClose={() => setStatOpen(null)} />}
        {settings && <SettingsSheet key="settings" onClose={() => setSettings(false)} />}
      </AnimatePresence>
    </>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(40,20,120,0.4)] active:scale-90" aria-label={label}>
      {children}
    </button>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold tracking-wider text-white/50 uppercase">{label}</p>
      <p className={`truncate text-sm font-extrabold ${accent ? 'text-yellow' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Tile({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div className="card flex items-center gap-3 rounded-2xl p-3">
      <span className="text-2xl">{emoji}</span>
      <div className="min-w-0">
        <p className="font-display truncate text-lg leading-none font-extrabold">{value}</p>
        <p className="mt-1 truncate text-[11px] font-semibold text-muted">{label}</p>
      </div>
    </div>
  );
}

function StatSheet({ id, onClose }: { id: StatId; onClose: () => void }) {
  const { d } = useGame();
  const { setTab } = useNav();
  const s = statById(id);
  const v = d.stats[id];
  return (
    <Sheet title={`${s.emoji} ${s.name}`} onClose={onClose}>
      <div className="flex items-center gap-4">
        <span className="font-display text-6xl font-extrabold" style={{ color: s.color }}>
          {v.value}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-2">{s.description}</p>
          <ProgressBar className="mt-2" value={v.progress} colors={[s.color, s.color]} height={8} />
          <p className="mt-1 text-[11px] font-bold text-muted">
            {Math.round(v.progress * 100)} % vers {v.value + 1}
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-canvas p-4">
        <p className="text-xs font-extrabold tracking-wider text-muted uppercase">Comment la faire progresser</p>
        <p className="mt-1 text-sm font-semibold">{s.howTo}</p>
      </div>
      <Button
        full
        className="mt-4"
        onClick={() => {
          onClose();
          setTab('challenges');
        }}
      >
        Voir les défis
      </Button>
    </Sheet>
  );
}

function SettingsSheet({ onClose }: { onClose: () => void }) {
  const { resetProfile, loadDemo } = useGame();
  const { reset } = useNav();
  const [confirm, setConfirm] = useState(false);
  return (
    <Sheet title="Réglages" onClose={onClose}>
      <div className="space-y-2">
        {!confirm ? (
          <Button full variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirm(true)}>
            Recréer mon profil (questionnaire)
          </Button>
        ) : (
          <div className="rounded-2xl bg-pink/10 p-3">
            <p className="text-sm font-bold">Ton profil, ta note et ton XP seront effacés de cet appareil.</p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirm(false)}>
                Annuler
              </Button>
              <Button
                variant="hot"
                className="flex-1"
                onClick={() => {
                  reset();
                  resetProfile();
                }}
              >
                Effacer
              </Button>
            </div>
          </div>
        )}
        <Button
          full
          variant="secondary"
          icon={<Sparkles className="h-4 w-4" />}
          onClick={() => {
            reset();
            loadDemo();
            onClose();
          }}
        >
          Charger le profil démo
        </Button>
      </div>
      <div className="mt-5 space-y-2 rounded-2xl bg-canvas p-4 text-xs leading-relaxed text-ink-2">
        <p className="flex gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-violet" /> Version de démonstration : ton profil est enregistré uniquement sur cet appareil.
        </p>
        <p className="flex gap-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-violet" /> Les autres joueurs, classements et publications sont des données fictives tant que NIGHTRANK n’a pas de serveur.
        </p>
        <p className="flex gap-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-violet" /> Aucune XP n’est liée à l’alcool. Fais la fête de façon responsable 💜
        </p>
      </div>
    </Sheet>
  );
}
