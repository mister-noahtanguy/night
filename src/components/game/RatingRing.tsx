import { motion } from 'framer-motion';
import { useId } from 'react';
import { tierOf } from '../../game/rating';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface Props {
  ovr: number;
  progress: number;
  size?: number;
  from?: number;
  animate?: boolean;
  onDark?: boolean;
}

/** Note générale au centre d'un anneau qui montre la progression vers le point suivant */
export function RatingRing({ ovr, progress, size = 148, from, animate = true, onDark = true }: Props) {
  const id = useId().replace(/:/g, '');
  const t = tierOf(ovr);
  const stroke = size * 0.075;
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={`rg${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={t.colors[0]} />
            <stop offset="1" stopColor={t.colors[1]} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={onDark ? 'rgba(255,255,255,0.14)' : 'rgba(22,18,58,0.08)'} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#rg${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: animate ? c : c * (1 - progress) }}
          animate={{ strokeDashoffset: c * (1 - Math.max(0.02, progress)) }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="flex flex-col items-center leading-none">
        <span className={`font-display tabular font-extrabold ${onDark ? 'text-white' : 'text-ink'}`} style={{ fontSize: size * 0.4, letterSpacing: '-0.04em' }}>
          {animate ? <AnimatedNumber value={ovr} from={from ?? Math.max(1, ovr - 8)} duration={1} /> : ovr}
        </span>
        <span className={`mt-1 font-extrabold tracking-[0.25em] ${onDark ? 'text-white/70' : 'text-muted'}`} style={{ fontSize: Math.max(9, size * 0.075) }}>
          GÉNÉRAL
        </span>
      </div>
    </div>
  );
}

export function TierPill({ ovr, className = '' }: { ovr: number; className?: string }) {
  const t = tierOf(ovr);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold text-white ${className}`} style={{ background: `linear-gradient(120deg, ${t.colors[0]}, ${t.colors[1]})` }}>
      {t.name}
    </span>
  );
}
