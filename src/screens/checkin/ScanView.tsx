import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flashlight, QrCode } from 'lucide-react';
import type { Club } from '../../types';
import { Button } from '../../components/ui/Button';

interface Props {
  clubs: Club[];
  onScanned: (club: Club) => void;
}

const BOKEH = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 100,
  s: 30 + ((i * 17) % 70),
  c: ['#a855f7', '#ff3fb4', '#22e3ff', '#ffc928'][i % 4],
  d: 3 + (i % 5),
}));

/** Écran caméra fictif avec cadre de scan animé */
export function ScanView({ clubs, onScanned }: Props) {
  const [target, setTarget] = useState(clubs[0]);
  const [detected, setDetected] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!detected) return;
    const t = setTimeout(() => onScanned(target), 1100);
    return () => clearTimeout(t);
  }, [detected, target, onScanned]);

  return (
    <div className="flex h-full flex-col">
      {/* "Caméra" */}
      <div className="relative mx-4 flex-1 overflow-hidden rounded-[32px] bg-black">
        <div className={`absolute inset-0 transition-all duration-500 ${torch ? 'brightness-150' : ''}`}>
          {BOKEH.map((b, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-2xl"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, background: b.c }}
              animate={{ opacity: [0.15, 0.6, 0.15], scale: [1, 1.3, 1] }}
              transition={{ duration: b.d, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,.75)_75%)]" />
        </div>

        {/* QR code fictif sur le mur */}
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            className="grid h-36 w-36 place-items-center rounded-xl bg-white/90 p-3"
            animate={{ rotate: [-3, 2, -3], x: [0, 4, 0], y: [0, -5, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'blur(0.6px)' }}
          >
            <FakeQr />
          </motion.div>
        </div>

        {/* Cadre de scan */}
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2">
          {['top-0 left-0 border-t-4 border-l-4 rounded-tl-3xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-3xl', 'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl'].map((c) => (
            <motion.span
              key={c}
              className={`absolute h-12 w-12 ${c} ${detected ? 'border-lime-300' : 'border-cyan-300'}`}
              style={{ filter: `drop-shadow(0 0 8px ${detected ? '#b6ff3b' : '#22e3ff'})` }}
              animate={detected ? { scale: [1, 0.9, 1] } : { scale: [1, 1.04, 1] }}
              transition={{ duration: detected ? 0.4 : 1.6, repeat: detected ? 0 : Infinity }}
            />
          ))}
          {!detected && (
            <div className="animate-scan absolute inset-x-3 h-[3px] rounded-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_20px_4px_rgba(232,121,249,.7)]" />
          )}
          {detected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 grid place-items-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-lime-300 text-black shadow-[0_0_40px_#b6ff3b]">
                <Check className="h-10 w-10" strokeWidth={3.5} />
              </span>
            </motion.div>
          )}
        </div>

        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
          <span className="rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
            {detected ? `✅ QR détecté · ${target.name}` : '📷 Vise le QR code à l’entrée'}
          </span>
          <button onClick={() => setTorch((t) => !t)} className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur ${torch ? 'bg-yellow-300 text-black' : 'bg-black/50'}`}>
            <Flashlight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sélection du QR simulé */}
      <div className="px-4 pt-4">
        <p className="mb-2 px-1 text-[11px] font-extrabold tracking-widest text-muted uppercase">Démo : QR code de quel lieu ?</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-3">
          {clubs.map((c) => (
            <button
              key={c.id}
              onClick={() => setTarget(c)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all ${target.id === c.id ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}
            >
              {c.emoji} {c.name} <span className="opacity-60">x{c.coefficient}</span>
            </button>
          ))}
        </div>
        <Button full size="lg" disabled={detected} onClick={() => setDetected(true)} icon={<QrCode className="h-5 w-5" />}>
          Simuler le scan
        </Button>
      </div>
    </div>
  );
}

function FakeQr() {
  // Motif pseudo-aléatoire stable de 21×21 modules
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < 21 * 21; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [14, 0], [0, 14]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox;
        const dy = y - oy;
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges">
      {cells.map((on, i) => {
        const x = i % 21;
        const y = Math.floor(i / 21);
        const f = finder(x, y);
        const filled = f === -1 ? on : f === 1;
        return filled ? <rect key={i} x={x} y={y} width="1" height="1" fill="#0c0519" /> : null;
      })}
    </svg>
  );
}
