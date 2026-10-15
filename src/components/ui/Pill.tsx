import type { ReactNode } from 'react';

export function Pill({ children, color = '#6d3aff', solid = false, className = '' }: { children: ReactNode; color?: string; solid?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap ${className}`}
      style={solid ? { background: color, color: '#fff' } : { background: `${color}1a`, color }}
    >
      {children}
    </span>
  );
}

export function XpPill({ xp, className = '' }: { xp: number; className?: string }) {
  return (
    <span className={`font-display inline-flex items-center rounded-full bg-gradient-to-r from-yellow to-orange px-2.5 py-1 text-[12px] font-extrabold whitespace-nowrap text-ink ${className}`}>
      +{xp} XP
    </span>
  );
}

export function DemoTag({ className = '' }: { className?: string }) {
  return <span className={`rounded-md bg-ink/[0.07] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-muted uppercase ${className}`}>Démo</span>;
}
