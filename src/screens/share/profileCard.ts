import type { Profile, StatId, StatMap } from '../../types';
import { tierOf, type RatingProgress } from '../../game/rating';
import { statById } from '../../game/stats';
import { CITIES, schoolById } from '../../data/schools';
import { AVATAR_GRADIENTS } from '../../data/avatars';

const W = 1080;
const H = 1920;

interface Input {
  profile: Profile;
  rating: RatingProgress;
  stats: StatMap;
  top: StatId[];
  weekXp: number;
}

/** Dessine la carte de profil partageable (format story 9:16) et renvoie un dataURL PNG */
export async function renderProfileCard({ profile, rating, stats, top, weekXp }: Input): Promise<string> {
  try {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('800 100px "Bricolage Grotesque"'), document.fonts.load('800 40px Manrope')]);
  } catch {
    // police indisponible : repli système
  }
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  const tier = tierOf(rating.ovr);
  const display = '"Bricolage Grotesque", Manrope, sans-serif';

  // Fond
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#2a1f78');
  bg.addColorStop(1, '#120c3a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = (x: number, y: number, r: number, color: string, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(color, a));
    g.addColorStop(1, hexA(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(900, 250, 800, tier.colors[0], 0.55);
  glow(150, 1700, 900, tier.colors[1], 0.45);
  glow(540, 820, 520, '#2f6bff', 0.35);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 52px ${display}`;
  ctx.fillText('NIGHTRANK', 540, 170);
  ctx.font = '700 30px Manrope, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('MA NOTE DE FÊTARD', 540, 222);

  // Carte centrale
  roundRect(ctx, 110, 300, 860, 1180, 72);
  const cardG = ctx.createLinearGradient(110, 300, 970, 1480);
  cardG.addColorStop(0, tier.colors[0]);
  cardG.addColorStop(1, tier.colors[1]);
  ctx.fillStyle = cardG;
  ctx.fill();
  roundRect(ctx, 118, 308, 844, 1164, 66);
  ctx.fillStyle = '#1d1556';
  ctx.fill();

  // Avatar
  const [a1, a2] = AVATAR_GRADIENTS[profile.avatar.bg % AVATAR_GRADIENTS.length];
  const ag = ctx.createLinearGradient(440, 360, 640, 560);
  ag.addColorStop(0, a1);
  ag.addColorStop(1, a2);
  ctx.beginPath();
  ctx.arc(540, 460, 90, 0, Math.PI * 2);
  ctx.fillStyle = ag;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '110px sans-serif';
  ctx.fillText(profile.avatar.emoji, 540, 500);

  // Anneau + note
  const cx = 540;
  const cy = 790;
  ctx.lineCap = 'round';
  ctx.lineWidth = 26;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.stroke();
  const rg = ctx.createLinearGradient(cx - 200, cy - 200, cx + 200, cy + 200);
  rg.addColorStop(0, tier.colors[0]);
  rg.addColorStop(1, tier.colors[1]);
  ctx.strokeStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.03, rating.progress));
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 220px ${display}`;
  ctx.fillText(String(rating.ovr), cx, cy + 70);
  ctx.font = '800 34px Manrope, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('GÉNÉRAL / 99', cx, cy + 135);

  // Rang
  ctx.font = `800 40px ${display}`;
  const tw = ctx.measureText(tier.name.toUpperCase()).width + 70;
  roundRect(ctx, cx - tw / 2, 1030, tw, 72, 36);
  ctx.fillStyle = rg;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(tier.name.toUpperCase(), cx, 1080);

  // Pseudo
  ctx.font = `800 64px ${display}`;
  ctx.fillText(`@${profile.pseudo}`, cx, 1190);
  ctx.font = '700 32px Manrope, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`${schoolById(profile.schoolId).short} · ${CITIES[profile.city].name}`, cx, 1240);

  // Top stats
  top.forEach((id, i) => {
    const s = statById(id);
    const x = 190 + i * 240;
    roundRect(ctx, x, 1290, 220, 150, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px sans-serif';
    ctx.fillText(s.emoji, x + 110, 1350);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 52px ${display}`;
    ctx.fillText(String(stats[id]), x + 110, 1410);
    ctx.font = '800 22px Manrope, sans-serif';
    ctx.fillStyle = s.color;
    ctx.fillText(s.short, x + 110, 1432);
  });

  // Pied
  ctx.fillStyle = '#ffc23c';
  ctx.font = `800 46px ${display}`;
  ctx.fillText(rating.maxed ? 'Membre du Club des 99 👑' : `+${weekXp.toLocaleString('fr-FR')} XP cette semaine`, 540, 1600);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '700 34px Manrope, sans-serif';
  ctx.fillText(rating.maxed ? '' : `Prochain objectif : ${rating.ovr + 1} de général`, 540, 1660);
  ctx.font = '800 34px Manrope, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Et toi, tu as combien ? → nightrank.app', 540, 1800);

  return c.toDataURL('image/png');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
