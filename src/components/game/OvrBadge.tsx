import { tierOf } from '../../game/rating';

/** Pastille compacte de note générale, utilisée dans les listes et classements */
export function OvrBadge({ ovr, size = 40, label = true }: { ovr: number; size?: number; label?: boolean }) {
  const t = tierOf(ovr);
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-[30%] text-white"
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${t.colors[0]}, ${t.colors[1]})`, boxShadow: `0 6px 14px -8px ${t.colors[1]}` }}
    >
      <div className="flex flex-col items-center leading-none">
        <span className="font-display tabular font-extrabold" style={{ fontSize: size * 0.42 }}>
          {ovr}
        </span>
        {label && size >= 36 && (
          <span className="font-extrabold tracking-wider opacity-85" style={{ fontSize: Math.max(7, size * 0.17) }}>
            GÉN
          </span>
        )}
      </div>
    </div>
  );
}
