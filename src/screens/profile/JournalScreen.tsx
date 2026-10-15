import { motion } from 'framer-motion';
import { StackPage } from '../../components/layout/Screen';
import { useGame } from '../../store/GameProvider';
import { timeAgo } from '../../game/season';
import { statById } from '../../game/stats';
import type { StatId, XpSource } from '../../types';

const ICON: Record<XpSource, string> = {
  checkin: '📍',
  newplace: '🧭',
  event: '🎟️',
  squad: '👯',
  challenge: '🎯',
  achievement: '🏅',
  debrief: '🗳️',
  post: '📝',
  friend: '👋',
  referral: '🎁',
  streak: '🔥',
  votes: '💬',
};

export function JournalScreen() {
  const { user, d } = useGame();
  return (
    <StackPage title="Journal d’XP">
      <div className="px-4">
        <div className="card-night mb-4 flex items-center justify-between rounded-3xl p-4">
          <div>
            <p className="text-xs font-bold text-white/60">XP totale</p>
            <p className="font-display text-3xl font-extrabold">{d.totalXp.toLocaleString('fr-FR')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white/60">Cette saison</p>
            <p className="font-display text-xl font-extrabold text-yellow">+{d.seasonXp.toLocaleString('fr-FR')}</p>
          </div>
        </div>
        {user.xpLog.length === 0 && <p className="py-10 text-center text-sm text-muted">Rien pour l’instant. Ton premier défi t’attend 🎯</p>}
        <div className="space-y-2">
          {user.xpLog.slice(0, 80).map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }} className="card flex items-center gap-3 rounded-2xl p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-xl">{ICON[e.source]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{e.label}</p>
                <p className="truncate text-[11px] font-semibold text-muted">
                  {timeAgo(e.date)}
                  {Object.entries(e.stats ?? {})
                    .filter(([, v]) => v)
                    .map(([k, v]) => ` · ${statById(k as StatId).emoji} +${v}`)
                    .join('')}
                </p>
              </div>
              <span className={`font-display shrink-0 text-sm font-extrabold ${e.xp > 0 ? 'text-violet' : 'text-muted'}`}>{e.xp > 0 ? `+${e.xp}` : 'stats'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </StackPage>
  );
}
