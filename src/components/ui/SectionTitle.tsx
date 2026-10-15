import type { ReactNode } from 'react';

export function SectionTitle({ children, action, onAction, sub }: { children: ReactNode; action?: string; onAction?: () => void; sub?: string }) {
  return (
    <div className="mb-3 px-1">
      <div className="flex items-end justify-between">
        <h2 className="font-display text-[18px] font-extrabold tracking-tight text-ink">{children}</h2>
        {action && (
          <button onClick={onAction} className="text-xs font-extrabold text-violet active:opacity-60">
            {action}
          </button>
        )}
      </div>
      {sub && <p className="mt-0.5 text-xs font-medium text-muted">{sub}</p>}
    </div>
  );
}
