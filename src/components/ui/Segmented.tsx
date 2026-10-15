import { motion } from 'framer-motion';
import { useId } from 'react';

interface Props<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

/** Onglets segmentés avec pastille animée */
export function Segmented<T extends string>({ options, value, onChange, className = '' }: Props<T>) {
  const id = useId();
  return (
    <div className={`flex rounded-2xl bg-ink/[0.06] p-1 ${className}`}>
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} className="relative flex-1 rounded-xl px-2 py-2 text-[13px] font-extrabold">
          {value === o.id && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_14px_-6px_rgba(54,30,140,0.45)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span className={`relative ${value === o.id ? 'text-ink' : 'text-muted'}`}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
