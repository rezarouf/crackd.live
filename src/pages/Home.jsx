import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { GAMES_META } from '../lib/constants.js';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getLevelInfo } from '../lib/utils.js';

const s = (i, extra = {}) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, type: 'spring', stiffness: 280, damping: 26 },
  ...extra,
});

const LEADERBOARD_PREVIEW = [
  { rank: 1, username: 'xCipherKing',  country: '🇺🇸', xp: 9840, streak: 94 },
  { rank: 2, username: 'PuzzlrPro',    country: '🇬🇧', xp: 9210, streak: 67 },
  { rank: 3, username: 'GridMaster9',  country: '🇩🇪', xp: 8755, streak: 51 },
  { rank: 4, username: 'SolveQueen',   country: '🇫🇷', xp: 8100, streak: 44 },
  { rank: 5, username: 'CrackdDaily',  country: '🇨🇦', xp: 7890, streak: 38 },
];

const WORD_GAMES   = GAMES_META.filter(g => g.type === 'word');
const VISUAL_GAMES = GAMES_META.filter(g => g.type === 'visual');

export default function HomePage() {
  const navigate = useNavigate();
  const { isCompletedToday } = useGameStore();
  const { profile, user, loading } = useAuthStore();

  const xp = profile?.xp || 0;
  const level = getLevelInfo(xp);
  const completedCount = GAMES_META.filter(g => isCompletedToday(g.id)).length;

  return (
    <div className="min-h-screen bg-navy overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">

        {/* Layered ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #F5A623 0%, transparent 65%)' }} />
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #4A9EFF 0%, transparent 70%)' }} />
          <div className="absolute top-[30%] right-[5%] w-[400px] h-[300px] rounded-full opacity-8"
            style={{ background: 'radial-gradient(ellipse, #A855F7 0%, transparent 70%)' }} />
        </div>

        {/* SVG noise grain */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        {/* Live badge */}
        <motion.div {...s(0)} className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border"
            style={{ background: 'rgba(245,166,35,0.06)', borderColor: 'rgba(245,166,35,0.2)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            <span className="text-[13px] font-bold text-amber tracking-wide">3,201 players online now</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...s(1)}
          className="text-[clamp(52px,9vw,92px)] font-black leading-[0.96] tracking-[-0.04em] mb-6 max-w-4xl"
        >
          Crack the Puzzle.
          <br />
          <span className="text-amber" style={{ textShadow: '0 0 80px rgba(245,166,35,0.5)' }}>
            Beat the Clock.
          </span>
          <br />
          Beat the World.
        </motion.h1>

        <motion.p {...s(2)} className="text-[18px] text-muted max-w-lg mx-auto leading-relaxed mb-10">
          10 fresh daily challenges. Real-time global leaderboards.<br />
          XP, streaks, and bragging rights — every single day.
        </motion.p>

        {/* CTA buttons */}
        <motion.div {...s(3)} className="flex gap-3 flex-wrap justify-center mb-12">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/games')}
            className="text-navy font-black text-base px-8 py-3.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
              boxShadow: '0 0 0 1px rgba(245,166,35,0.3), 0 8px 32px rgba(245,166,35,0.35), 0 2px 8px rgba(245,166,35,0.2)',
            }}
          >
            Play Today's Challenges →
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/leaderboard')}
            className="text-text font-semibold text-base px-8 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-[border-color] duration-200"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            Global Rankings
          </motion.button>
        </motion.div>

        {/* Daily progress pill (when logged in) */}
        {completedCount > 0 && (
          <motion.div {...s(4)}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex gap-1">
              {GAMES_META.map((g, i) => (
                <div key={g.id} className={`w-2 h-2 rounded-full ${isCompletedToday(g.id) ? 'bg-amber' : 'bg-white/15'}`} />
              ))}
            </div>
            <span className="text-sm font-semibold text-muted">
              <span className="text-amber font-black">{completedCount}</span>/10 today
            </span>
          </motion.div>
        )}

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted/50 font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-white/[0.05]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { v: '3,201', l: 'Players Today' },
            { v: '10',    l: 'Daily Puzzles' },
            { v: '500+',  l: 'XP Per Day'    },
            { v: '6',     l: 'Rank Tiers'    },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 26 }}
              className="text-center"
            >
              <div className="text-[clamp(28px,4vw,36px)] font-black tracking-tight text-amber mb-1">{s.v}</div>
              <div className="text-sm text-muted font-medium">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Games section ── */}
      <section className="py-28 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10"
            style={{ background: 'radial-gradient(ellipse, #4A9EFF 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="mb-14">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="label-eyebrow mb-3">Today's Lineup</motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
              className="text-[clamp(32px,5vw,52px)] font-black tracking-[-0.04em]"
            >
              10 Puzzles.<br />One Perfect Score.
            </motion.h2>
          </div>

          {/* Word games row */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted/60">Word & Number</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} index={i} />)
                : WORD_GAMES.map((g, i) => <MiniGameCard key={g.id} game={g} index={i} isCompleted={isCompletedToday(g.id)} navigate={navigate} />)}
            </div>
          </div>

          {/* Visual games row */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted/60">Visual Puzzles</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <GameCardSkeleton key={i} index={i + 5} />)
                : VISUAL_GAMES.map((g, i) => <MiniGameCard key={g.id} game={g} index={i + 5} isCompleted={isCompletedToday(g.id)} navigate={navigate} />)}
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => navigate('/games')}
              className="text-sm font-semibold text-muted hover:text-amber transition-[color] duration-150">
              View all games with details →
            </button>
          </div>
        </div>
      </section>

      {/* ── Leaderboard preview ── */}
      <section className="py-28 px-4 border-t border-white/[0.05] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] opacity-8"
            style={{ background: 'radial-gradient(ellipse at right top, #F5A623 0%, transparent 65%)' }} />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-eyebrow mb-3">Rankings</p>
              <h2 className="text-[clamp(32px,5vw,48px)] font-black tracking-[-0.04em]">
                Who's on<br />top today?
              </h2>
            </div>
            <button onClick={() => navigate('/leaderboard')}
              className="text-sm font-semibold text-muted hover:text-text transition-colors duration-150 pb-1">
              Full board →
            </button>
          </div>

          <div className="space-y-2">
            {LEADERBOARD_PREVIEW.map((p, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 28 }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-[border-color] duration-150 group hover:border-white/12"
                  style={{ background: 'rgba(22,27,37,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="text-lg w-8 text-center flex-shrink-0">
                    {medals[i] || <span className="text-muted text-sm font-black">#{p.rank}</span>}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/15 flex items-center justify-center font-black text-sm text-amber flex-shrink-0">
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-text truncate">{p.username}</p>
                    <p className="text-xs text-muted flex items-center gap-0.5">{p.country} · <Flame size={10} /> {p.streak}d</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-amber tabular-nums">{p.xp.toLocaleString()}</p>
                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wide">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-4 border-t border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-15"
            style={{ background: 'radial-gradient(ellipse, #F5A623 0%, transparent 65%)' }} />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          {user ? (
            <>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="label-eyebrow mb-4">Daily grind</motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}
                className="text-[clamp(36px,6vw,60px)] font-black tracking-[-0.04em] mb-5"
              >
                {completedCount === 10 ? "You crushed it today." : "Keep your streak alive."}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="text-muted text-lg mb-10"
              >
                {completedCount === 10
                  ? "All 10 puzzles done. Check back tomorrow for a new set."
                  : `${10 - completedCount} puzzle${10 - completedCount !== 1 ? 's' : ''} remaining today. Don't break the chain.`}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/games')}
                className="font-black text-navy text-lg px-10 py-4 rounded-2xl inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
                  boxShadow: '0 0 0 1px rgba(245,166,35,0.3), 0 12px 40px rgba(245,166,35,0.4), 0 2px 8px rgba(245,166,35,0.2)',
                }}
              >
                {completedCount === 10 ? 'View All Games →' : 'Continue Playing →'}
              </motion.button>
            </>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="label-eyebrow mb-4">Free forever</motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.06 }}
                className="text-[clamp(36px,6vw,60px)] font-black tracking-[-0.04em] mb-5"
              >
                Start your streak<br />today.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="text-muted text-lg mb-10"
              >
                Join thousands of puzzle solvers. No ads, no paywalls.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup')}
                className="font-black text-navy text-lg px-10 py-4 rounded-2xl inline-block"
                style={{
                  background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
                  boxShadow: '0 0 0 1px rgba(245,166,35,0.3), 0 12px 40px rgba(245,166,35,0.4), 0 2px 8px rgba(245,166,35,0.2)',
                }}
              >
                Create Free Account →
              </motion.button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function GameCardSkeleton({ index }) {
  return (
    <div
      className="flex flex-col items-center gap-3 p-5 rounded-2xl border animate-pulse"
      style={{
        background: 'rgba(22,27,37,0.8)',
        borderColor: 'rgba(255,255,255,0.06)',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
        <div className="h-2.5 w-10 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

function MiniGameCard({ game, index, isCompleted, navigate }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => navigate(game.route)}
      className="relative flex flex-col items-center gap-3 p-5 rounded-2xl border text-center group transition-[border-color,box-shadow] duration-200"
      style={{
        background: isCompleted ? 'rgba(34,197,94,0.05)' : 'rgba(22,27,37,0.8)',
        borderColor: isCompleted ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
      }}
      onMouseEnter={e => {
        if (!isCompleted) {
          e.currentTarget.style.borderColor = 'rgba(245,166,35,0.25)';
          e.currentTarget.style.boxShadow = '0 0 24px rgba(245,166,35,0.08), 0 4px 16px rgba(0,0,0,0.3)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isCompleted ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green/20 border border-green/40 flex items-center justify-center">
          <span className="text-[10px] text-green font-black">✓</span>
        </div>
      )}
      <span className="text-3xl">{game.icon}</span>
      <div>
        <p className="text-[13px] font-bold text-text leading-tight">{game.name}</p>
        <p className="text-[11px] text-muted mt-0.5 font-mono">+{game.xp} XP</p>
      </div>
    </motion.button>
  );
}
