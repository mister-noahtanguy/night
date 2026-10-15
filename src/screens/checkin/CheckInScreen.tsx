import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import type { Club } from '../../types';
import { StackPage } from '../../components/layout/Screen';
import { Segmented } from '../../components/ui/Segmented';
import { useGame, type CheckInResult } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { useToast } from '../../store/ToastProvider';
import { CLUBS } from '../../data/clubs';
import { ScanView } from './ScanView';
import { NearbyList } from './NearbyList';
import { RewardView } from './RewardView';

type Step = { kind: 'pick' } | { kind: 'validating'; club: Club; via: 'qr' | 'gps' } | { kind: 'reward'; result: CheckInResult };

export function CheckInScreen() {
  const { user, checkIn } = useGame();
  const { pop, push } = useNav();
  const toast = useToast();
  const [mode, setMode] = useState<'qr' | 'gps'>('qr');
  const [step, setStep] = useState<Step>({ kind: 'pick' });

  const cityClubs = [...CLUBS].sort((a, b) => Number(b.city === user.profile.city) - Number(a.city === user.profile.city) || a.distance - b.distance);
  const start = useCallback((club: Club, via: 'qr' | 'gps') => setStep({ kind: 'validating', club, via }), []);

  const finish = useCallback(
    (club: Club) => {
      const res = checkIn(club.id);
      if ('error' in res) {
        toast({ emoji: '⏳', title: 'Validation refusée', body: res.error });
        setStep({ kind: 'pick' });
        return;
      }
      setStep({ kind: 'reward', result: res });
    },
    [checkIn, toast],
  );

  return (
    <StackPage title={step.kind === 'reward' ? 'Sortie validée' : 'Valider une sortie'}>
      <AnimatePresence mode="wait">
        {step.kind === 'pick' && (
          <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
            <div className="mb-4 px-4">
              <Segmented
                value={mode}
                onChange={setMode}
                options={[
                  { id: 'qr', label: '📷 Scanner le QR' },
                  { id: 'gps', label: '📍 À proximité' },
                ]}
              />
            </div>
            {mode === 'qr' ? (
              <div className="h-[600px]">
                <ScanView clubs={cityClubs} onScanned={(c) => start(c, 'qr')} />
              </div>
            ) : (
              <NearbyList homeCity={user.profile.city} onPick={(c) => start(c, 'gps')} />
            )}
          </motion.div>
        )}

        {step.kind === 'validating' && (
          <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Validating club={step.club} via={step.via} onDone={() => finish(step.club)} />
          </motion.div>
        )}

        {step.kind === 'reward' && (
          <motion.div key="reward" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RewardView
              result={step.result}
              onShare={() => {
                pop();
                push({ name: 'share' });
              }}
              onDone={pop}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </StackPage>
  );
}

function Validating({ club, via, onDone }: { club: Club; via: 'qr' | 'gps'; onDone: () => void }) {
  const checks = [via === 'qr' ? 'QR code authentique' : 'Position GPS confirmée', 'Horaires d’ouverture', 'Contrôle anti-triche'];
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (done >= checks.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 520);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div className="flex flex-col items-center px-8 pt-10">
      <div className="relative grid h-36 w-36 place-items-center">
        <motion.div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#12c9b5,#6d3aff,#ff4fa3,transparent)]" animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
        <div className="absolute inset-[6px] rounded-full bg-canvas" />
        <span className="relative text-6xl">{club.emoji}</span>
      </div>
      <p className="font-display mt-6 text-2xl font-extrabold">{club.name}</p>
      <p className="mt-1 text-sm font-semibold text-muted">Vérification de ta présence…</p>
      <div className="mt-8 w-full space-y-3">
        {checks.map((c, i) => (
          <motion.div key={c} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card flex items-center gap-3 rounded-2xl px-4 py-3">
            {i < done ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-6 w-6 place-items-center rounded-full bg-success text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            )}
            <span className={`text-sm font-bold ${i < done ? 'text-ink' : 'text-muted'}`}>{c}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
