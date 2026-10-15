import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2, Share2 } from 'lucide-react';
import { StackPage } from '../../components/layout/Screen';
import { Button } from '../../components/ui/Button';
import { useGame } from '../../store/GameProvider';
import { useToast } from '../../store/ToastProvider';
import { topStats } from '../../game/startRating';
import { renderProfileCard } from './profileCard';

export function ShareScreen() {
  const { user, d } = useGame();
  const toast = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const { ovr, progress, maxed } = d.rating;

  useEffect(() => {
    let alive = true;
    renderProfileCard({ profile: user.profile, rating: d.rating, stats: d.statMap, top: topStats(d.statMap, 3), weekXp: d.weekXp }).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
    // la carte est régénérée quand la note ou la progression change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ovr, progress, maxed, user.profile.pseudo]);

  const download = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `nightrank-${user.profile.pseudo}-${ovr}.png`;
    a.click();
    toast({ emoji: '💾', title: 'Carte enregistrée', body: 'Retrouve-la dans tes téléchargements.' });
  };

  const share = async () => {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'nightrank.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'NIGHTRANK', text: `${ovr} de général sur NIGHTRANK. Et toi ?` });
        return;
      }
    } catch {
      return; // partage annulé
    }
    download();
  };

  return (
    <StackPage title="Partager mon profil">
      <div className="flex flex-col items-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="relative aspect-[9/16] w-[70%] overflow-hidden rounded-[28px] bg-night shadow-[0_30px_70px_-20px_rgba(42,31,120,0.8)]"
        >
          {url ? <img src={url} alt="Aperçu de ta carte de profil" className="h-full w-full object-cover" /> : <Loader2 className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-white/50" />}
        </motion.div>
        <p className="mt-4 text-center text-xs font-semibold text-muted">Format story 1080×1920 pour Instagram, Snapchat ou TikTok</p>
        <div className="mt-5 w-full space-y-2">
          <Button full size="lg" variant="hot" disabled={!url} onClick={share} icon={<Share2 className="h-5 w-5" />}>
            Partager ma carte
          </Button>
          <Button full variant="secondary" disabled={!url} onClick={download} icon={<Download className="h-4 w-4" />}>
            Télécharger l’image
          </Button>
        </div>
      </div>
    </StackPage>
  );
}
