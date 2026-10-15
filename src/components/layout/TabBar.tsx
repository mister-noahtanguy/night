import { motion } from 'framer-motion';
import { MessageCircleHeart, Target, Trophy, UserRound, Users } from 'lucide-react';
import { useNav, type TabId } from '../../store/NavProvider';
import { useGame } from '../../store/GameProvider';

const TABS: { id: TabId; label: string; Icon: typeof Trophy }[] = [
  { id: 'profile', label: 'Profil', Icon: UserRound },
  { id: 'ranking', label: 'Classements', Icon: Trophy },
  { id: 'challenges', label: 'Défis', Icon: Target },
  { id: 'community', label: 'Communauté', Icon: MessageCircleHeart },
  { id: 'friends', label: 'Amis', Icon: Users },
];

export function TabBar() {
  const { tab, setTab } = useNav();
  const { d, user } = useGame();
  const claimable = [...d.challenges.daily, ...d.challenges.weekly, ...d.challenges.team].filter((c) => c.status === 'claimable').length;
  const badges: Partial<Record<TabId, number>> = { challenges: claimable, friends: user.incomingRequests.length };

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,var(--safe-bottom))]">
      <div className="relative flex h-[66px] items-center rounded-[26px] border border-line bg-white/95 px-1 shadow-[0_12px_40px_-12px_rgba(40,20,120,0.35)] backdrop-blur">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          const count = badges[id] ?? 0;
          if (id === 'challenges') {
            return (
              <div key={id} className="relative flex flex-1 justify-center">
                <motion.button aria-label="Défis" onClick={() => setTab(id)} whileTap={{ scale: 0.9 }} className="relative -mt-8 flex flex-col items-center">
                  <span className={`bg-brand relative grid h-[60px] w-[60px] place-items-center rounded-[22px] shadow-[0_12px_24px_-8px_rgba(77,58,255,0.8)] ring-4 ring-canvas ${active ? '' : 'opacity-95'}`}>
                    <Icon className="h-7 w-7 text-white" strokeWidth={2.4} />
                    {count > 0 && <Dot n={count} />}
                  </span>
                  <span className={`mt-1 text-[10px] font-extrabold ${active ? 'text-violet' : 'text-muted'}`}>{label}</span>
                </motion.button>
              </div>
            );
          }
          return (
            <button key={id} onClick={() => setTab(id)} className="relative flex h-full flex-1 flex-col items-center justify-center gap-1">
              {active && <motion.span layoutId="tab-pill" className="absolute inset-x-2 inset-y-2 rounded-2xl bg-violet/10" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="relative">
                <Icon className={`h-[22px] w-[22px] ${active ? 'text-violet' : 'text-muted'}`} strokeWidth={active ? 2.5 : 2} />
                {count > 0 && <Dot n={count} />}
              </span>
              <span className={`relative text-[10px] font-extrabold ${active ? 'text-violet' : 'text-muted'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Dot({ n }: { n: number }) {
  return <span className="absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-pink px-1 text-[10px] font-extrabold text-white ring-2 ring-white">{n}</span>;
}
