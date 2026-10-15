import { animate, useMotionValue, useTransform, motion } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  value: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

import { formatNp } from '../../utils/format';

export function AnimatedNumber({ value, from, duration = 1.2, delay = 0, className, prefix = '', suffix = '' }: Props) {
  const mv = useMotionValue(from ?? value);
  const text = useTransform(mv, (v) => `${prefix}${formatNp(v)}${suffix}`);
  useEffect(() => {
    const c = animate(mv, value, { duration, delay, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [mv, value, duration, delay]);
  return <motion.span className={className}>{text}</motion.span>;
}
