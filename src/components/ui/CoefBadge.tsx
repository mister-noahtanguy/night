import { coefColor } from '../../utils/format';

/** Coefficient d'une boîte, affiché façon multiplicateur de jeu */
export function CoefBadge({ coef, size = 'md' }: { coef: number; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [a, b] = coefColor(coef);
  const cls = { sm: 'text-sm px-2 py-0.5 rounded-lg', md: 'text-xl px-2.5 py-1 rounded-xl', lg: 'text-3xl px-3 py-1.5 rounded-2xl', xl: 'text-5xl px-4 py-2 rounded-3xl' }[size];
  return (
    <span
      className={`font-display inline-flex items-baseline font-black italic leading-none ${cls}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, color: '#0c0519', boxShadow: `0 0 20px ${b}88, inset 0 1px 0 rgba(255,255,255,.6)` }}
    >
      <span className="mr-[1px] text-[0.6em]">x</span>
      {coef}
    </span>
  );
}
