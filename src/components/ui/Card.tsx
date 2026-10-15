import { motion, type HTMLMotionProps } from 'framer-motion';

interface Props extends HTMLMotionProps<'div'> {
  tone?: 'light' | 'night';
  interactive?: boolean;
}

/** Carte de base : claire (par défaut) ou « nuit » pour les éléments forts */
export function Card({ tone = 'light', interactive, className = '', children, ...rest }: Props) {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={`relative overflow-hidden rounded-3xl ${tone === 'night' ? 'card-night' : 'card'} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
