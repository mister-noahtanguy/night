import type { Club } from '../../types';

/** "Photo" générée d'une boîte : dégradé, faisceaux lumineux et emoji */
export function ClubCover({ club, className = '', emojiSize = 44 }: { club: Club; className?: string; emojiSize?: number }) {
  const [a, b, c] = club.palette;
  return (
    <div
      className={`grain relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(80% 90% at 80% 0%, ${c}cc, transparent 60%), radial-gradient(90% 90% at 0% 100%, ${b}, transparent 70%), linear-gradient(160deg, ${a}, #05010b)`,
      }}
    >
      {/* faisceaux de lumière */}
      <div className="absolute -top-6 left-1/4 h-[160%] w-6 rotate-[24deg] bg-gradient-to-b from-white/30 to-transparent blur-md" />
      <div className="absolute -top-6 left-2/3 h-[160%] w-4 -rotate-[18deg] bg-gradient-to-b from-white/20 to-transparent blur-md" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <span className="absolute right-3 bottom-2 drop-shadow-[0_4px_12px_rgba(0,0,0,.6)]" style={{ fontSize: emojiSize }}>
        {club.emoji}
      </span>
    </div>
  );
}
