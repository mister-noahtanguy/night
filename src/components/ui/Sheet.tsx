import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Feuille modale du bas. À placer dans un <AnimatePresence>. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-[70] bg-ink/40 backdrop-blur-[2px]" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="absolute inset-x-0 bottom-0 z-[71] max-h-[85%] overflow-y-auto rounded-t-[32px] bg-white p-5 pb-[calc(var(--safe-bottom)+24px)] no-scrollbar"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/10" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.06]" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </>
  );
}
