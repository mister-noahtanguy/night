import { motion } from 'framer-motion';
import { StackPage } from '../../components/layout/Screen';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { LIMITS, XP_REWARDS } from '../../game/config';
import { costToNext, RATING_TIERS, xpBetween } from '../../game/rating';
import { DAILY_POOL, TEAM_POOL, WEEKLY_POOL } from '../../game/challenges';
import { ACHIEVEMENTS } from '../../game/achievements';
import { formatNp } from '../../utils/format';

const range = (xs: number[]) => `${Math.min(...xs)} à ${Math.max(...xs)}`;

export function XpGuideScreen() {
  const { d } = useGame();
  const ovr = d.rating.ovr;
  const bars = Array.from({ length: 27 }, (_, i) => 46 + i * 2).filter((n) => n < 99);
  const maxCost = costToNext(98);
  const milestones: [number, number][] = [
    [50, 60],
    [60, 70],
    [70, 80],
    [80, 90],
    [90, 99],
  ];
  const achXp = ACHIEVEMENTS.filter((a) => a.xp > 0).map((a) => a.xp);

  const sources: [string, string, string][] = [
    ['📍', 'Sortie validée (QR ou géoloc)', `${XP_REWARDS.checkInBase + XP_REWARDS.checkInPerCoef} à ${XP_REWARDS.checkInBase + XP_REWARDS.checkInPerCoef * 10} XP selon le lieu`],
    ['🧭', 'Nouveau lieu découvert', `+${XP_REWARDS.newPlace} XP, une fois par lieu`],
    ['🎟️', 'Événement spécial', `+${XP_REWARDS.event} XP`],
    ['👯', 'Squad (2 amis ou plus présents)', `+${XP_REWARDS.squad} XP`],
    ['🔥', 'Série hebdomadaire maintenue', `+${XP_REWARDS.streakWeek} XP par semaine`],
    ['☀️', 'Défis du jour', `${range(DAILY_POOL.map((c) => c.xp))} XP`],
    ['📅', 'Défis de la semaine', `${range(WEEKLY_POOL.map((c) => c.xp))} XP`],
    ['🛡️', 'Défis collectifs d’équipe', `${range(TEAM_POOL.map((c) => c.xp))} XP`],
    ['🏅', 'Accomplissements', `${range(achXp)} XP`],
    ['🗳️', 'Débrief de soirée', `+${XP_REWARDS.debrief} XP`],
    ['🎁', 'Parrainage accepté', `+${XP_REWARDS.referral} XP`],
    ['📝', 'Publication dans la communauté', `+${XP_REWARDS.post} XP`],
    ['👋', 'Nouvel ami', `+${XP_REWARDS.friendAdded} XP`],
  ];

  return (
    <StackPage title="Gagner de l’XP">
      <div className="space-y-6 px-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="card rounded-3xl p-4">
            <p className="text-2xl">⚡</p>
            <p className="font-display mt-1 text-lg font-extrabold">XP</p>
            <p className="text-xs leading-relaxed text-ink-2">L’expérience que tu accumules : défis, sorties, accomplissements.</p>
          </div>
          <div className="card-night rounded-3xl p-4">
            <p className="font-display text-2xl leading-none font-extrabold">{ovr}</p>
            <p className="font-display mt-1 text-lg font-extrabold">Général</p>
            <p className="text-xs leading-relaxed text-white/70">Ta note sur 99, le résultat visible de ton XP.</p>
          </div>
        </div>

        <div className="card rounded-3xl p-4">
          <SectionTitle sub="Chaque point coûte un peu plus que le précédent. 99, ça se mérite.">La courbe de progression</SectionTitle>
          <div className="flex h-32 items-end gap-[3px]">
            {bars.map((n, i) => {
              const h = (costToNext(n) / maxCost) * 100;
              const mine = ovr >= n && ovr < n + 2;
              return (
                <motion.div
                  key={n}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, h)}%` }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex-1 rounded-t-md ${mine ? 'bg-pink' : n < ovr ? 'bg-violet/70' : 'bg-violet/20'}`}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold text-muted">
            <span>46</span>
            <span>70</span>
            <span>99</span>
          </div>
          <div className="mt-4 space-y-1.5">
            {milestones.map(([a, b]) => (
              <div key={a} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2 text-sm">
                <span className="font-bold">
                  {a} → {b}
                </span>
                <span className="font-display tabular font-extrabold">{formatNp(xpBetween(a, b))} XP</span>
              </div>
            ))}
            <p className="pt-1 text-[11px] font-semibold text-muted">
              Toi : le point {ovr} → {ovr + 1} coûte {costToNext(ovr)} XP (il t’en manque {d.rating.remaining}). Il reste {formatNp(xpBetween(ovr, 99) - d.rating.xpInto)} XP avant 99.
            </p>
          </div>
        </div>

        <div>
          <SectionTitle>Ce qui rapporte de l’XP</SectionTitle>
          <div className="card divide-y divide-line rounded-3xl px-4">
            {sources.map(([e, l, v]) => (
              <div key={l} className="flex items-center gap-3 py-3">
                <span className="text-xl">{e}</span>
                <span className="flex-1 text-sm font-bold">{l}</span>
                <span className="max-w-[45%] text-right text-xs font-extrabold text-violet">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 px-1 text-[11px] text-muted">Réactions, likes et navigation ne rapportent rien : la note ne bouge que pour des actions qui comptent.</p>
        </div>

        <div className="rounded-3xl bg-turquoise/10 p-4">
          <p className="font-display text-lg font-extrabold text-[#0b8c7e]">🛡️ Garde-fous anti-triche</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-2">
            <li>• Plafond de {LIMITS.dailyFreeXpCap} XP par jour hors défis et accomplissements</li>
            <li>• XP de sortie limitée à {LIMITS.checkInsPerNight} lieux par nuit, un même lieu une seule fois</li>
            <li>• {LIMITS.checkInCooldownMin} min minimum entre deux validations</li>
            <li>• Chaque défi, lieu découvert ou accomplissement ne rapporte qu’une fois</li>
            <li>• Les défis déclaratifs doivent être confirmés par un ami présent</li>
            <li>• {LIMITS.postsPerDay} publication et {LIMITS.friendsPerDay} nouveaux amis récompensés par jour</li>
            <li>• Rien n’est jamais lié à l’alcool, et on ne demande jamais de preuve intime</li>
          </ul>
        </div>

        <div>
          <SectionTitle>Les rangs</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {RATING_TIERS.map((t, i) => (
              <div key={t.id} className="card flex flex-col items-center rounded-2xl p-3">
                <OvrBadge ovr={t.min === 1 ? 46 : t.min} size={44} />
                <p className="mt-1.5 text-sm font-extrabold">{t.name}</p>
                <p className="text-[10px] font-bold text-muted">{t.min === 1 ? '1' : t.min}–{RATING_TIERS[i + 1] ? RATING_TIERS[i + 1].min - 1 : 99}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StackPage>
  );
}
