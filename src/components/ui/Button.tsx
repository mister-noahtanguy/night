import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'hot' | 'secondary' | 'dark' | 'ghost';

interface Props extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children?: ReactNode;
  full?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-[0_10px_24px_-10px_rgba(77,58,255,0.8)]',
  hot: 'bg-hot text-white shadow-[0_10px_24px_-10px_rgba(255,79,163,0.8)]',
  secondary: 'card text-ink',
  dark: 'bg-night text-white',
  ghost: 'text-ink-2',
};

const SIZES = { sm: 'h-9 px-3 text-xs rounded-xl', md: 'h-11 px-4 text-sm rounded-2xl', lg: 'h-14 px-6 text-base rounded-2xl' };

export function Button({ variant = 'primary', size = 'md', icon, children, full, className = '', disabled, ...rest }: Props) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden font-extrabold transition-opacity disabled:opacity-40 ${SIZES[size]} ${full ? 'w-full' : ''} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {(variant === 'primary' || variant === 'hot') && !disabled && (
        <span className="animate-shimmer pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      )}
      {icon}
      {children}
    </motion.button>
  );
}
