import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNav } from '../../store/NavProvider';

/** Conteneur scrollable d'un onglet */
export function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`no-scrollbar absolute inset-0 overflow-x-hidden overflow-y-auto pt-[calc(var(--safe-top)+16px)] pb-[calc(var(--tabbar-h)+var(--safe-bottom)+28px)] ${className}`}>{children}</div>
  );
}

/** Page empilée par-dessus les onglets */
export function StackPage({ title, children, right, transparentHeader = false }: { title?: string; children: ReactNode; right?: ReactNode; transparentHeader?: boolean }) {
  const { pop } = useNav();
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      className="app-bg absolute inset-0 z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.12)]"
    >
      <header className={`absolute inset-x-0 top-0 z-20 flex items-center gap-2 px-3 pt-[calc(var(--safe-top)+10px)] pb-2 ${transparentHeader ? '' : 'bg-canvas/85 backdrop-blur-md'}`}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={pop} aria-label="Retour" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(40,20,120,0.4)]">
          <ChevronLeft className="h-5 w-5 text-ink" />
        </motion.button>
        <h1 className="font-display flex-1 truncate text-lg font-extrabold">{title}</h1>
        {right}
      </header>
      <div className={`no-scrollbar flex-1 overflow-y-auto pb-[calc(var(--safe-bottom)+32px)] ${transparentHeader ? '' : 'pt-[calc(var(--safe-top)+64px)]'}`}>{children}</div>
    </motion.div>
  );
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 px-5">
      <div className="min-w-0">
        <h1 className="font-display text-[30px] leading-none font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13px] font-semibold text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
