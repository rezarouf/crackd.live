import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import { GAMES_META } from '../lib/constants.js';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { getLevelInfo } from '../lib/utils.js';

// ── Animation helpers ──────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.4 },
});

// ── Static data ────────────────────────────────────────────────────────────────
const LEADERBOARD_PREVIEW = [
  { rank: 1, username: 'xCipherKing',  country: '🇺🇸', xp: 9840, streak: 94 },
  { rank: 2, username: 'PuzzlrPro',    country: '🇬🇧', xp: 9210, streak: 67 },
  { rank: 3, username: 'GridMaster9',  country: '🇩🇪', xp: 8755, streak: 51 },
];

const TICKER_ITEMS = [
  '12,847 players active',
  'Top streak: 94 days',
  '21 games daily',
  'New puzzles at midnight UTC',
  'Free forever',
  '500+ XP available today',
  'Global leaderboards',
  '6 rank tiers',
];

const WORD_GAMES   = GAMES_META.filter(g => g.type === 'word');
const VISUAL_GAMES = GAMES_META.filter(g => g.type === 'visual');

// ── Subtitle word-by-word animation ───────────────────────────────────────────
function AnimatedSubtitle() {
  const words = ['Ten', 'challenges.', 'Once', 'each.', 'Every', 'day.'];
  return (
    <p className="text-lg sm:text-xl text-muted leading-relaxed">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.1, duration: 0.35, ease: 'easeOut' }}
          className="inline-block mr-[0.35em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// ── Ticker strip ──────────────────────────────────────────────────────────────
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="ticker-wrap w-full py-3 overflow-hidden"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="ticker-inner">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-6 text-sm text-muted font-medium">
            <span className="w-1 h-1 rounded-full bg-amber flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Mini game card ─────────────────────────────────────────────────────────────
function MiniCard({ game, index, isCompleted, navigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(game.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-center gap-3 p-5 text-center group"
      style={{
        background: isCompleted
          ? 'rgba(200,245,90,0.05)'
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(24,24,31,0.7)',
        border: `1px solid ${isCompleted ? 'rgba(200,245,90,0.22)' : hovered ? 'rgba(200,245,90,0.18)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        boxShadow: hovered && !isCompleted ? '0 0 24px rgba(200,245,90,0.08), 0 4px 20px rgba(0,0,0,0.3)' : 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      {isCompleted && (
        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(200,245,90,0.12)', border: '1px solid rgba(200,245,90,0.25)' }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#C8F55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <span className="text-3xl" style={{ transform: hovered ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.2s ease' }}>
        {game.icon}
      </span>
      <div>
        <p className="text-[13px] font-bold text-text leading-tight">{game.name}</p>
        <p className="text-[11px] text-muted mt-0.5 font-mono">+{game.xp} XP</p>
      </div>
    </motion.button>
  );
}

// ── Section divider ────────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted/60">{label}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

// ── Progress bar with glowing tip ──────────────────────────────────────────────
function ProgressBar({ value, max }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="relative h-1.5 rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'linear-gradient(90deg, #C8F55A, #D4FF6B)' }}
      >
        {pct > 0 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#C8F55A',
              boxShadow: '0 0 8px rgba(200,245,90,0.8), 0 0 16px rgba(200,245,90,0.4)',
              transform: 'translate(50%, -50%)',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { isCompletedToday } = useGameStore();
  const { profile, user, loading } = useAuthStore();
  const [arrowHovered, setArrowHovered] = useState(false);
  const lbRef = useRef(null);
  const lbInView = useInView(lbRef, { once: true });

  const xp    = profile?.xp || 0;
  const level = getLevelInfo(xp);
  const completedCount = GAMES_META.filter(g => isCompletedToday(g.id)).length;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0E0E14' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">

        {/* Drifting ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              top: '-10%', left: '40%', width: 700, height: 500,
              background: 'radial-gradient(ellipse, rgba(200,245,90,0.10) 0%, transparent 65%)',
              animation: 'driftLime 18s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '40%', left: '-5%', width: 500, height: 400,
              background: 'radial-gradient(ellipse, rgba(166,124,255,0.08) 0%, transparent 65%)',
              animation: 'driftViolet 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: '20%', right: '-8%', width: 400, height: 350,
              background: 'radial-gradient(ellipse, rgba(166,124,255,0.06) 0%, transparent 65%)',
              animation: 'driftLime 28s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* 40px grid overlay */}
        <div className="absolute inset-0 grid-bg opacity-[0.35] pointer-events-none" />

        {/* SVG noise grain */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.025 }}>
          <filter id="noise-hero">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise-hero)" />
        </svg>

        {/* Live badge */}
        <motion.div {...fadeIn(0.1)} className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-pill"
            style={{ background: 'rgba(200,245,90,0.06)', border: '1px solid rgba(200,245,90,0.15)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime" />
            </span>
            <span className="text-[13px] font-bold text-lime tracking-wide">12,847 players online now</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-display font-bold leading-[1.02] tracking-tight mb-6 max-w-4xl"
          style={{ fontSize: 'clamp(42px, 8vw, 96px)', letterSpacing: '-0.04em' }}
        >
          <span className="text-text">Your Daily</span>
          <br />
          <span className="text-gradient-gold">Mental Reset.</span>
        </motion.h1>

        {/* Subtitle */}
        <div className="mb-10 max-w-md mx-auto">
          <AnimatedSubtitle />
        </div>

        {/* CTA buttons */}
        <motion.div {...fadeUp(0.5)} className="flex gap-3 flex-wrap justify-center mb-10">
          {/* Primary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/games')}
            onMouseEnter={() => setArrowHovered(true)}
            onMouseLeave={() => setArrowHovered(false)}
            className="flex items-center gap-2.5 font-bold text-inverse px-7 py-3.5 rounded-btn"
            style={{
              background: '#C8F55A',
              boxShadow: '0 0 0 1px rgba(200,245,90,0.35), 0 4px 20px rgba(200,245,90,0.20)',
              fontSize: 15,
            }}
            onMouseEnterCapture={e => { e.currentTarget.style.background = '#D4FF6B'; }}
            onMouseLeaveCapture={e => { e.currentTarget.style.background = '#C8F55A'; }}
          >
            Start Today's Set
            <ArrowRight
              size={16}
              style={{ transform: arrowHovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s ease' }}
            />
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/leaderboard')}
            className="font-semibold text-text px-7 py-3.5 rounded-btn transition-[border-color,background-color] duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: 15,
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            See The Board
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.p {...fadeIn(0.8)} className="text-sm text-muted/60">
          Join 12,847 sharp minds · Top streak: 94 days
        </motion.p>

        {/* Daily progress (logged-in) */}
        {completedCount > 0 && (
          <motion.div
            {...fadeUp(0.9)}
            className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex gap-1">
              {GAMES_META.map(g => (
                <div key={g.id} className="w-2 h-2 rounded-full"
                  style={{ background: isCompletedToday(g.id) ? '#C8F55A' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <span className="text-sm font-semibold text-muted">
              <span className="text-lime font-black">{completedCount}</span> of {GAMES_META.length} completed today
            </span>
          </motion.div>
        )}

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-muted/40 font-medium tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-8"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══ DAILY HUB ════════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse, rgba(166,124,255,0.06) 0%, transparent 65%)' }} />
        </div>
        <div className="max-w-6xl mx-auto relative">

          {/* Section header */}
          <div className="mb-14 text-center">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="label-eyebrow mb-3">
              Today's Set
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-bold text-text"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.03em' }}
            >
              {GAMES_META.length} Puzzles. One Perfect Score.
            </motion.h2>
          </div>

          {/* Progress bar */}
          {completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mb-10 px-2"
            >
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted font-medium">{completedCount} of {GAMES_META.length} complete</span>
                {completedCount === 10 && (
                  <span className="text-lime font-bold text-xs">Full house! Come back tomorrow.</span>
                )}
              </div>
              <ProgressBar value={completedCount} max={10} />
            </motion.div>
          )}

          {/* Mental Agility row */}
          <div className="mb-12">
            <SectionDivider label="Mental Agility" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                : WORD_GAMES.map((g, i) => (
                    <MiniCard key={g.id} game={g} index={i} isCompleted={isCompletedToday(g.id)} navigate={navigate} />
                  ))}
            </div>
          </div>

          {/* Pattern Recognition row */}
          <div>
            <SectionDivider label="Pattern Recognition" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i + 5} />)
                : VISUAL_GAMES.map((g, i) => (
                    <MiniCard key={g.id} game={g} index={i + 5} isCompleted={isCompletedToday(g.id)} navigate={navigate} />
                  ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => navigate('/games')}
              className="text-sm font-semibold text-muted hover:text-lime-hover transition-[color] duration-150">
              View all games →
            </button>
          </div>
        </div>
      </section>

      {/* ══ LEADERBOARD PREVIEW ═══════════════════════════════════════════════ */}
      <section
        ref={lbRef}
        className="py-28 px-4 relative"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse at right top, rgba(200,245,90,0.06) 0%, transparent 60%)' }} />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="label-eyebrow mb-3">Rankings</p>
              <h2 className="font-display font-bold text-text"
                style={{ fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Today's sharpest<br />minds
              </h2>
            </div>
            <button onClick={() => navigate('/leaderboard')}
              className="text-sm font-semibold text-muted hover:text-text transition-[color] duration-150 pb-1">
              Full board →
            </button>
          </div>

          <div className="space-y-2">
            {LEADERBOARD_PREVIEW.map((p, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <motion.div
                  key={p.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={lbInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-[border-color] duration-150"
                  style={{
                    background: 'rgba(24,24,31,0.75)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">{medals[i]}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-lime flex-shrink-0"
                    style={{ background: 'rgba(200,245,90,0.08)', border: '1px solid rgba(200,245,90,0.15)' }}>
                    {p.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-text truncate">{p.username}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      {p.country} · <Flame size={10} /> {p.streak}d
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lime tabular-nums">{p.xp.toLocaleString()}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wide">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ════════════════════════════════════════════════════════ */}
      <section
        className="py-28 px-4 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse, rgba(200,245,90,0.09) 0%, transparent 60%)' }} />
        </div>
        <div className="max-w-xl mx-auto text-center relative">
          {user ? (
            <>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="label-eyebrow mb-4">Daily grind</motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-bold text-text mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em' }}
              >
                {completedCount === 10 ? 'You did it today.' : 'Keep your streak alive.'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="text-muted text-lg mb-10"
              >
                {completedCount === 10
                  ? 'Complete all 10 — prove your consistency.'
                  : `${GAMES_META.length - completedCount} puzzle${GAMES_META.length - completedCount !== 1 ? 's' : ''} remaining. Don't break the chain.`}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/games')}
                className="font-bold text-inverse text-base px-10 py-4 rounded-btn"
                style={{ background: '#C8F55A', boxShadow: '0 0 0 1px rgba(200,245,90,0.3), 0 8px 32px rgba(200,245,90,0.20)' }}
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
                transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-bold text-text mb-5"
                style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-0.03em' }}
              >
                Start today.<br />One game at a time.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="text-muted text-lg mb-10"
              >
                Join thousands of puzzle solvers. No ads, no paywalls.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/signup')}
                className="font-bold text-inverse text-base px-10 py-4 rounded-btn"
                style={{ background: '#C8F55A', boxShadow: '0 0 0 1px rgba(200,245,90,0.3), 0 8px 32px rgba(200,245,90,0.20)' }}
              >
                Join the sharp ones →
              </motion.button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl"
      style={{ background: 'rgba(24,24,31,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex flex-col items-center gap-1.5 w-full">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-2.5 w-10 rounded" />
      </div>
    </div>
  );
}
