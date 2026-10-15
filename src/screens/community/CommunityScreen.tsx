import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Send } from 'lucide-react';
import { PageTitle, Screen } from '../../components/layout/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { OvrBadge } from '../../components/game/OvrBadge';
import { useGame } from '../../store/GameProvider';
import { useNav } from '../../store/NavProvider';
import { userById } from '../../data/users';
import { CITIES } from '../../data/schools';
import { timeAgo } from '../../game/season';
import { LIMITS, XP_REWARDS } from '../../game/config';
import { postsToday } from '../../game/engine';
import type { Post, PostKind } from '../../types';

const KINDS: { id: PostKind; label: string; emoji: string; color: string; placeholder: string }[] = [
  { id: 'anecdote', label: 'Anecdote', emoji: '📝', color: '#6d3aff', placeholder: 'Raconte ta meilleure anecdote de soirée…' },
  { id: 'achievement', label: 'Accomplissement', emoji: '🏅', color: '#ff8a2a', placeholder: 'Partage un accomplissement dont tu es fier…' },
  { id: 'challenge', label: 'Lancer un défi', emoji: '🎯', color: '#12c9b5', placeholder: 'Lance un défi bienveillant à la communauté…' },
];

const REACTIONS = ['🔥', '😂', '👑'];

export function CommunityScreen() {
  const { user, d, now, publishPost } = useGame();
  const [kind, setKind] = useState<PostKind>('anecdote');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<PostKind | 'all'>('all');
  const k = KINDS.find((x) => x.id === kind)!;
  const canEarn = postsToday(user, now) < LIMITS.postsPerDay;
  const feed = d.feed.filter((p) => filter === 'all' || p.kind === filter);

  const submit = () => {
    publishPost(text.trim(), kind);
    setText('');
  };

  return (
    <Screen>
      <PageTitle title="Communauté" subtitle="Anecdotes, accomplissements et défis lancés." />
      <div className="space-y-5 px-4">
        {/* Composer */}
        <div className="card rounded-3xl p-4">
          <div className="flex gap-3">
            <Avatar avatar={user.profile.avatar} size={40} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder={k.placeholder}
              rows={3}
              className="min-h-[72px] flex-1 resize-none bg-transparent text-sm font-semibold outline-none placeholder:text-muted"
            />
          </div>
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {KINDS.map((x) => (
              <button
                key={x.id}
                onClick={() => setKind(x.id)}
                className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold"
                style={kind === x.id ? { background: x.color, color: '#fff' } : { background: `${x.color}14`, color: x.color }}
              >
                {x.emoji} {x.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <span className="text-[11px] font-bold text-muted">{canEarn ? `+${XP_REWARDS.post} XP pour ta 1re publication du jour` : 'XP du jour déjà obtenue · publie pour le fun'}</span>
            <Button size="sm" disabled={text.trim().length < 10} onClick={submit} icon={<Send className="h-3.5 w-3.5" />}>
              Publier
            </Button>
          </div>
        </div>
        <p className="-mt-2 flex gap-1.5 px-1 text-[11px] leading-relaxed font-semibold text-muted">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" /> Bienveillance obligatoire : pas de nom sans accord, pas de contenu sur l’alcool ni de mise en danger. Les publications des autres sont fictives (démo).
        </p>

        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {[{ id: 'all' as const, label: 'Tout', emoji: '✨' }, ...KINDS].map((x) => (
            <button
              key={x.id}
              onClick={() => setFilter(x.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-extrabold ${filter === x.id ? 'bg-night text-white' : 'bg-white text-ink-2 shadow-[0_4px_12px_-8px_rgba(40,20,120,0.5)]'}`}
            >
              {x.emoji} {x.id === 'challenge' ? 'Défis' : x.id === 'all' ? 'Tout' : x.label + 's'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {feed.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      </div>
    </Screen>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const { user, d, react, joinChallenge } = useGame();
  const { push, setTab } = useNav();
  const isMe = post.authorId === 'me';
  const author = isMe ? null : userById(post.authorId);
  const name = isMe ? user.profile.pseudo : author?.pseudo ?? '?';
  const avatar = isMe ? user.profile.avatar : author!.avatar;
  const ovr = isMe ? d.rating.ovr : author!.ovr;
  const city = isMe ? user.profile.city : author!.city;
  const k = KINDS.find((x) => x.id === post.kind)!;
  const mine = user.myReactions[post.id] ?? [];
  const joined = user.joinedChallenges.includes(post.id);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.04 }} className="card rounded-3xl p-4">
      <button onClick={() => (isMe ? setTab('profile') : push({ name: 'user', userId: post.authorId }))} className="flex w-full items-center gap-3 text-left">
        <Avatar avatar={avatar} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold">
            {name} {isMe && <span className="text-[10px] text-violet">· toi</span>}
          </p>
          <p className="text-[11px] font-semibold text-muted">
            {CITIES[city].name} · {timeAgo(post.date)}
          </p>
        </div>
        <OvrBadge ovr={ovr} size={34} />
      </button>
      <span className="mt-3 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: `${k.color}14`, color: k.color }}>
        {k.emoji} {k.label}
      </span>
      <p className="mt-1.5 text-[14px] leading-relaxed font-medium text-ink">{post.text}</p>
      {post.kind === 'challenge' && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-turquoise/10 p-2.5 pl-3">
          <span className="text-xs font-extrabold text-[#0b8c7e]">{(post.participants ?? 0) + (joined ? 1 : 0)} participants</span>
          <Button size="sm" variant={joined ? 'secondary' : 'primary'} disabled={joined || isMe} onClick={() => joinChallenge(post.id)}>
            {joined ? '✓ Défi rejoint' : isMe ? 'Ton défi' : 'Relever le défi'}
          </Button>
        </div>
      )}
      <div className="mt-3 flex gap-2">
        {REACTIONS.map((e) => {
          const on = mine.includes(e);
          return (
            <motion.button
              key={e}
              whileTap={{ scale: 1.25 }}
              onClick={() => react(post.id, e)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-colors ${on ? 'bg-violet text-white' : 'bg-canvas text-ink-2'}`}
            >
              {e} {post.reactions[e] ?? 0}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
