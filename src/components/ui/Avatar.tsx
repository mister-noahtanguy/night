import { AVATAR_GRADIENTS } from '../../data/avatars';
import type { Avatar as AvatarT } from '../../types';

interface Props {
  avatar: AvatarT;
  size?: number;
  ring?: string;
  className?: string;
}

export function Avatar({ avatar, size = 44, ring, className = '' }: Props) {
  const [a, b] = AVATAR_GRADIENTS[avatar.bg % AVATAR_GRADIENTS.length];
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${a}, ${b})`,
        boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 ${size > 60 ? 4.5 : 4}px ${ring}` : 'inset 0 1px 0 rgba(255,255,255,.35)',
      }}
    >
      <span style={{ fontSize: size * 0.52, lineHeight: 1 }}>{avatar.emoji}</span>
    </div>
  );
}
