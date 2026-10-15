export function Logo({ size = 20, light = false }: { size?: number; light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size * 1.25} height={size * 1.25} viewBox="0 0 32 32">
        <defs>
          <linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#12c9b5" />
            <stop offset="0.5" stopColor="#6d3aff" />
            <stop offset="1" stopColor="#ff4fa3" />
          </linearGradient>
        </defs>
        <path d="M20 3a13 13 0 1 0 9 22A11 11 0 0 1 20 3z" fill="url(#lg-logo)" />
        <path d="M23 8l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4z" fill="#ffc23c" />
      </svg>
      <span className={`font-display font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`} style={{ fontSize: size }}>
        NIGHT<span className="text-brand">RANK</span>
      </span>
    </div>
  );
}
