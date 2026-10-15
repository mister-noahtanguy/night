import { motion } from 'framer-motion';

interface Props {
  value: number; // 0..1
  from?: number;
  colors?: [string, string];
  height?: number;
  delay?: number;
  duration?: number;
  track?: string;
  className?: string;
}

export function ProgressBar({ value, from, colors = ['#6d3aff', '#2f6bff'], height = 10, delay = 0.15, duration = 0.9, track = 'rgba(22,18,58,0.08)', className = '' }: Props) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v)) * 100;
  return (
    <div className={`relative overflow-hidden rounded-full ${className}`} style={{ height, background: track }}>
      <motion.div
        className="relative h-full overflow-hidden rounded-full"
        style={{ background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }}
        initial={{ width: `${clamp(from ?? 0)}%` }}
        animate={{ width: `${clamp(value)}%` }}
        transition={{ delay, duration, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="animate-shimmer absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </motion.div>
    </div>
  );
}
