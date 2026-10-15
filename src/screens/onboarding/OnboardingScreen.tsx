import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Search, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Logo } from '../../components/game/Logo';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { CITIES, CITY_IDS, SCHOOLS } from '../../data/schools';
import { AVATAR_EMOJIS, AVATAR_GRADIENTS } from '../../data/avatars';
import { CHAPTERS, QUESTIONS, type QuizQuestion } from '../../data/quiz';
import { RevealScreen } from './RevealScreen';
import type { Avatar as AvatarT, CityId, QuizAnswers } from '../../types';

export interface Identity {
  pseudo: string;
  avatar: AvatarT;
  schoolId: string;
  city: CityId;
}

type Step = { kind: 'welcome' } | { kind: 'identity' } | { kind: 'height' } | { kind: 'school' } | { kind: 'question'; q: QuizQuestion } | { kind: 'reveal' };

const AGE = QUESTIONS.find((q) => q.id === 'age')!;
const REST = QUESTIONS.filter((q) => q.id !== 'age');

const STEPS: Step[] = [
  { kind: 'welcome' },
  { kind: 'identity' },
  { kind: 'question', q: AGE },
  { kind: 'height' },
  { kind: 'school' },
  ...REST.map((q) => ({ kind: 'question' as const, q })),
  { kind: 'reveal' },
];

const chapterOf = (s: Step) => (s.kind === 'question' ? s.q.chapter : s.kind === 'identity' || s.kind === 'height' || s.kind === 'school' ? 'Toi' : '');

export function OnboardingScreen() {
  const [i, setI] = useState(0);
  const [identity, setIdentity] = useState<Identity>({ pseudo: '', avatar: { emoji: '😎', bg: 0 }, schoolId: '', city: 'rouen' });
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const step = STEPS[i];
  const next = () => setI((n) => Math.min(STEPS.length - 1, n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));
  const quizSteps = STEPS.length - 2;
  const chapter = chapterOf(step);

  return (
    <div className="app-bg absolute inset-0 overflow-hidden">
      {step.kind !== 'welcome' && step.kind !== 'reveal' && (
        <div className="absolute inset-x-0 top-0 z-10 px-5 pt-[calc(var(--safe-top)+14px)]">
          <div className="flex items-center gap-3">
            <button onClick={back} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white shadow-[0_4px_14px_-6px_rgba(40,20,120,0.4)]" aria-label="Retour">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-extrabold text-muted">
                <span>
                  {chapter} · chapitre {CHAPTERS.indexOf(chapter) + 1}/{CHAPTERS.length}
                </span>
                <span>
                  {i}/{quizSteps}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.07]">
                <motion.div className="bg-brand h-full rounded-full" animate={{ width: `${(i / quizSteps) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 26 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="absolute inset-0"
        >
          {step.kind === 'welcome' && <Welcome onStart={next} />}
          {step.kind === 'identity' && <IdentityStep identity={identity} setIdentity={setIdentity} onNext={next} />}
          {step.kind === 'height' && <HeightStep value={answers.height} onChange={(h) => setAnswers({ ...answers, height: h })} onNext={next} />}
          {step.kind === 'school' && <SchoolStep identity={identity} setIdentity={setIdentity} onNext={next} />}
          {step.kind === 'question' && (
            <QuestionStep
              q={step.q}
              value={answers[step.q.id] as string | undefined}
              onAnswer={(v) => setAnswers({ ...answers, [step.q.id]: v })}
              onNext={next}
            />
          )}
          {step.kind === 'reveal' && <RevealScreen identity={identity} answers={answers} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------ Accueil

function Welcome({ onStart }: { onStart: () => void }) {
  const { loadDemo } = useGame();
  const { reset } = useNav();
  const [n, setN] = useState(52);
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x >= 99 ? 52 : x + (x < 70 ? 3 : x < 90 ? 4 : 1))), 420);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col px-6 pt-[calc(var(--safe-top)+22px)] pb-[calc(var(--safe-bottom)+24px)]">
      <Logo size={18} />
      <div className="relative mt-8 flex flex-1 flex-col items-center justify-center">
        <div className="card-night relative grid h-60 w-60 place-items-center rounded-[48px]">
          <motion.div className="absolute -top-4 -right-6 rotate-6 rounded-2xl bg-yellow px-3 py-1.5 text-sm font-extrabold text-ink shadow-lg" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>
            +120 XP
          </motion.div>
          <motion.div className="absolute -bottom-3 -left-6 -rotate-6 rounded-2xl bg-turquoise px-3 py-1.5 text-sm font-extrabold text-white shadow-lg" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.8 }}>
            🕺 Roi de la piste 74
          </motion.div>
          <div className="text-center">
            <motion.p key={n} initial={{ y: 12, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="font-display tabular text-[96px] leading-none font-extrabold tracking-tight">
              {n}
            </motion.p>
            <p className="mt-1 text-xs font-extrabold tracking-[0.3em] text-white/70">GÉNÉRAL</p>
          </div>
        </div>
        <h1 className="font-display mt-10 text-center text-[34px] leading-[1.05] font-extrabold tracking-tight">
          Ta note de fêtard,
          <br />
          <span className="text-brand">sur 99.</span>
        </h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed font-medium text-ink-2">
          Réponds à un questionnaire (un peu absurde), découvre ta note de départ, puis fais-la grimper avec des défis, des sorties et tes potes.
        </p>
      </div>
      <div className="space-y-2">
        <Button full size="lg" onClick={onStart} icon={<Sparkles className="h-5 w-5" />}>
          Créer mon profil · 2 min
        </Button>
        <Button
          full
          variant="ghost"
          onClick={() => {
            reset();
            loadDemo();
          }}
        >
          Explorer avec un profil démo
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Étapes

function StepShell({ emoji, title, subtitle, children, footer }: { emoji: string; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto px-5 pt-[calc(var(--safe-top)+86px)] pb-[calc(var(--safe-bottom)+24px)]">
      <motion.span initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className="text-5xl">
        {emoji}
      </motion.span>
      <h1 className="font-display mt-3 text-[28px] leading-[1.1] font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm font-medium text-muted">{subtitle}</p>}
      <div className="mt-6 flex-1">{children}</div>
      {footer && <div className="pt-4">{footer}</div>}
    </div>
  );
}

function IdentityStep({ identity, setIdentity, onNext }: { identity: Identity; setIdentity: (i: Identity) => void; onNext: () => void }) {
  const valid = identity.pseudo.trim().length >= 3;
  return (
    <StepShell
      emoji="🪪"
      title="Comment on t’appelle sur la piste ?"
      subtitle="Ton pseudo et ta tête de profil. Promis, personne ne verra ta vraie photo de carte d’identité."
      footer={
        <Button full size="lg" disabled={!valid} onClick={onNext}>
          {valid ? 'C’est moi, on continue' : 'Pseudo de 3 caractères minimum'}
        </Button>
      }
    >
      <div className="flex flex-col items-center">
        <motion.div key={identity.avatar.emoji + identity.avatar.bg} initial={{ scale: 0.85 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
          <Avatar avatar={identity.avatar} size={92} ring="#6d3aff" />
        </motion.div>
        <input
          value={identity.pseudo}
          onChange={(e) => setIdentity({ ...identity, pseudo: e.target.value.replace(/\s/g, '').slice(0, 18) })}
          placeholder="ex. nina.party"
          className="font-display mt-5 w-full rounded-2xl border-2 border-line bg-white px-4 py-3.5 text-center text-xl font-extrabold outline-none placeholder:text-ink/25 focus:border-violet"
        />
        <div className="mt-5 flex gap-2">
          {AVATAR_GRADIENTS.map(([a, b], i) => (
            <button
              key={i}
              onClick={() => setIdentity({ ...identity, avatar: { ...identity.avatar, bg: i } })}
              aria-label={`Couleur ${i + 1}`}
              className={`h-8 w-8 rounded-full transition-transform ${identity.avatar.bg === i ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-canvas' : ''}`}
              style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-10 gap-1">
          {AVATAR_EMOJIS.map((e) => (
            <button key={e} onClick={() => setIdentity({ ...identity, avatar: { ...identity.avatar, emoji: e } })} className={`grid h-8 w-8 place-items-center rounded-lg text-lg ${identity.avatar.emoji === e ? 'bg-violet/15' : ''}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  );
}

function HeightStep({ value, onChange, onNext }: { value?: number; onChange: (h: number | undefined) => void; onNext: () => void }) {
  const h = value ?? 175;
  const comment = h < 160 ? 'Agile, discret, tu passes partout dans la foule.' : h < 175 ? 'Taille parfaite pour le pogo bienveillant.' : h < 190 ? 'Tu vois le DJ par-dessus la foule. Avantage.' : 'Tu es le point de ralliement officiel de ta bande.';
  return (
    <StepShell
      emoji="📏"
      title="Et tu mesures combien ?"
      subtitle="Facultatif, et sans aucun effet sur ta note. C’est juste pour rigoler."
      footer={
        <div className="space-y-2">
          <Button full size="lg" onClick={onNext}>
            Valider {value ? `${(h / 100).toFixed(2).replace('.', ',')} m` : ''}
          </Button>
          <Button
            full
            variant="ghost"
            onClick={() => {
              onChange(undefined);
              onNext();
            }}
          >
            Passer cette question
          </Button>
        </div>
      }
    >
      <div className="card rounded-3xl p-6 text-center">
        <p className="font-display tabular text-6xl font-extrabold">
          {(h / 100).toFixed(2).replace('.', ',')}
          <span className="text-2xl text-muted"> m</span>
        </p>
        <input type="range" min={145} max={215} value={h} onChange={(e) => onChange(Number(e.target.value))} className="mt-6 w-full accent-violet" />
        <p className="mt-4 text-sm font-semibold text-ink-2">{comment}</p>
      </div>
    </StepShell>
  );
}

function SchoolStep({ identity, setIdentity, onNext }: { identity: Identity; setIdentity: (i: Identity) => void; onNext: () => void }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => SCHOOLS.filter((s) => !q || `${s.name} ${s.short} ${CITIES[s.city].name}`.toLowerCase().includes(q.toLowerCase())), [q]);
  const other = identity.schoolId === 'autre';
  return (
    <StepShell
      emoji="🎓"
      title="Tu étudies où ?"
      subtitle="Tes points comptent aussi pour le classement de ton école."
      footer={
        <Button full size="lg" disabled={!identity.schoolId} onClick={onNext}>
          Suivant
        </Button>
      }
    >
      <div className="flex items-center gap-2 rounded-2xl border-2 border-line bg-white px-3">
        <Search className="h-4 w-4 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une école, une ville…" className="h-12 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-muted" />
      </div>
      <div className="mt-3 space-y-2">
        {list.map((s) => {
          const sel = identity.schoolId === s.id;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIdentity({ ...identity, schoolId: s.id, city: s.id === 'autre' ? identity.city : s.city })}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors ${sel ? 'border-violet bg-violet/5' : 'border-transparent bg-white'}`}
            >
              <span className="font-display grid h-10 w-12 shrink-0 place-items-center rounded-xl text-[10px] font-extrabold" style={{ background: `${s.color}1f`, color: s.color }}>
                {s.tag}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">{s.name}</p>
                {s.id !== 'autre' && <p className="text-[11px] font-semibold text-muted">{CITIES[s.city].name}</p>}
              </div>
            </motion.button>
          );
        })}
      </div>
      {other && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-extrabold text-muted">Ta ville</p>
          <div className="grid grid-cols-3 gap-2">
            {CITY_IDS.map((id) => (
              <button key={id} onClick={() => setIdentity({ ...identity, city: id })} className={`rounded-2xl py-2.5 text-xs font-extrabold ${identity.city === id ? 'bg-night text-white' : 'bg-white text-ink'}`}>
                {CITIES[id].emoji} {CITIES[id].name}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  );
}

function QuestionStep({ q, value, onAnswer, onNext }: { q: QuizQuestion; value?: string; onAnswer: (v: string | undefined) => void; onNext: () => void }) {
  const [reaction, setReaction] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const pick = (id: string) => {
    if (locked) return;
    setLocked(true);
    onAnswer(id);
    const r = q.options.find((o) => o.id === id)?.reaction;
    if (r) setReaction(r);
    setTimeout(onNext, r ? 1150 : 380);
  };
  const cols = q.columns ?? 1;

  return (
    <StepShell
      emoji={q.emoji}
      title={q.title}
      subtitle={q.subtitle}
      footer={
        q.optional ? (
          <Button
            full
            variant="ghost"
            onClick={() => {
              onAnswer(undefined);
              onNext();
            }}
          >
            Je préfère ne pas répondre
          </Button>
        ) : undefined
      }
    >
      {q.note && <p className="mb-3 rounded-2xl bg-turquoise/10 p-3 text-xs leading-relaxed font-semibold text-[#0b8c7e]">💡 {q.note}</p>}
      <div className={`grid gap-2.5 ${cols === 3 ? 'grid-cols-3' : cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {q.options.map((o, idx) => {
          const sel = value === o.id;
          return (
            <motion.button
              key={o.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, scale: sel ? 1.02 : 1 }}
              transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 26 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => pick(o.id)}
              className={`relative flex items-center gap-3 rounded-2xl border-2 text-left transition-colors ${cols === 3 ? 'justify-center px-2 py-4' : 'px-4 py-3.5'} ${
                sel ? 'border-violet bg-violet text-white shadow-[0_10px_24px_-10px_rgba(109,58,255,0.9)]' : 'border-transparent bg-white text-ink shadow-[0_6px_18px_-12px_rgba(40,20,120,0.4)]'
              }`}
            >
              {o.emoji && <span className="text-2xl">{o.emoji}</span>}
              <span className={`font-extrabold ${cols === 3 ? 'font-display text-xl' : 'text-[15px]'}`}>{o.label}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {reaction && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-2xl bg-night px-4 py-3 text-sm font-bold text-white">
            {reaction}
          </motion.div>
        )}
      </AnimatePresence>
    </StepShell>
  );
}
