import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, Grid3X3, Hash, Lock, Grid, Settings2, MapPin, GitBranch,
  Layers, Wrench, AlignLeft, LayoutGrid, ArrowUpDown, Workflow,
  Droplets, Cpu, Bomb, GitMerge, MessageCircle, Gamepad2, Tag,
} from 'lucide-react';
import { GAMES_META, DIFF_COLOR } from '../lib/constants.js';
import { useGameStore } from '../store/gameStore.js';

const GAME_ICONS = {
  wordle: Type, connections: Grid3X3, nerdle: Hash, cryptogram: Lock,
  sudoku: Grid, screw: Settings2, pinpull: MapPin, rope: GitBranch,
  woodblock: Layers, nutsbolts: Wrench, spellingbee: AlignLeft,
  nonogram: LayoutGrid, wordladder: ArrowUpDown, flow: Workflow,
  watersort: Droplets, tilerotation: Cpu, minesweeper: Bomb,
  merge: GitMerge, emojiphrase: MessageCircle, twentyfortyeight: Gamepad2,
  logoguess: Tag,
};

const DIFF_LABELS = { Easy: 'Easy', Medium: 'Med', Hard: 'Hard', Expert: 'Expert' };
const FILTERS = ['All', 'Mental Agility', 'Pattern Recognition'];

function SectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/60">{label}</h2>
      <span className="text-[11px] font-mono text-muted/40">{count}</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

function GameCard({ game, index, done, navigate }) {
  const [hovered, setHovered] = useState(false);
  const diffColor = DIFF_COLOR[game.difficulty] || '#7A7A8C';
  const Icon = GAME_ICONS[game.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(game.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col cursor-pointer overflow-hidden"
      style={{
        background: done
          ? 'rgba(16,185,129,0.04)'
          : hovered
          ? 'rgba(22,27,37,1)'
          : 'rgba(22,27,37,0.85)',
        border: `1px solid ${done ? 'rgba(200,245,90,0.20)' : hovered ? 'rgba(200,245,90,0.18)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16,
        boxShadow: hovered && !done
          ? '0 0 28px rgba(200,245,90,0.08), 0 8px 32px rgba(0,0,0,0.4)'
          : done
          ? '0 0 16px rgba(16,185,129,0.06)'
          : '0 2px 16px rgba(0,0,0,0.25)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      {/* Category indicator line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: game.type === 'word'
            ? `linear-gradient(90deg, transparent, ${diffColor}60, transparent)`
            : `linear-gradient(90deg, transparent, rgba(166,124,255,0.4), transparent)`,
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Large watermark icon */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.05] pointer-events-none">
        {Icon && <Icon size={80} />}
      </div>

      {/* Done pill */}
      {done && (
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-pill"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
            <polyline points="2,6 5,9 10,3" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-bold text-green uppercase tracking-wide">Done</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Icon with glow */}
        <div className="mb-4 relative w-11 h-11">
          <div
            className="absolute inset-0 rounded-xl opacity-40"
            style={{
              background: `radial-gradient(circle, ${diffColor}30 0%, transparent 70%)`,
              filter: 'blur(6px)',
              transform: hovered ? 'scale(1.3)' : 'scale(1)',
              transition: 'transform 0.25s ease',
            }}
          />
          <div
            className="relative w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: `${diffColor}12`,
              border: `1px solid ${diffColor}25`,
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          >
            {Icon && <Icon size={20} color={diffColor} strokeWidth={1.8} />}
          </div>
        </div>

        {/* Content */}
        <h3 className="font-bold text-[16px] text-text mb-1.5 tracking-snug">{game.name}</h3>
        <p className="text-[12px] text-muted leading-relaxed mb-5 flex-1">{game.desc}</p>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {/* Difficulty badge */}
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-pill"
              style={{
                color: diffColor,
                background: `${diffColor}14`,
                border: `1px solid ${diffColor}28`,
              }}
            >
              {DIFF_LABELS[game.difficulty] || game.difficulty}
            </span>
            {/* XP */}
            <span className="text-[11px] text-muted/60 font-mono">+{game.xp}</span>
          </div>

          {/* Status / CTA */}
          {done ? (
            <span className="text-[11px] font-semibold text-muted/40 uppercase tracking-wide">Tomorrow</span>
          ) : (
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 4 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[11px] font-black"
              style={{ background: '#C8F55A', color: '#0E0E14' }}
            >
              Begin
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GamesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const { isCompletedToday } = useGameStore();

  const wordGames   = GAMES_META.filter(g => g.type === 'word');
  const visualGames = GAMES_META.filter(g => g.type === 'visual');
  const showWord    = filter !== 'Pattern Recognition';
  const showVisual  = filter !== 'Mental Agility';
  const totalDone   = GAMES_META.filter(g => isCompletedToday(g.id)).length;

  return (
    <div className="min-h-screen pt-16 pb-28 relative overflow-x-hidden" style={{ background: '#0E0E14' }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(200,245,90,0.06) 0%, transparent 65%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Page header */}
        <div className="pt-12 pb-10">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="label-eyebrow mb-3">
            10 Games
          </motion.p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
              className="font-display font-bold text-text"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              Today's Set
            </motion.h1>

            {/* Progress chip */}
            {totalDone > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-4 px-5 py-3.5 rounded-2xl flex-shrink-0"
                style={{ background: 'rgba(200,245,90,0.06)', border: '1px solid rgba(200,245,90,0.14)' }}
              >
                <div className="flex gap-0.5">
                  {GAMES_META.map(g => (
                    <div key={g.id} className="w-1.5 h-4 rounded-sm"
                      style={{ background: isCompletedToday(g.id) ? '#C8F55A' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber">{totalDone}</span>
                  <span className="text-muted font-bold">/10</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 mb-12 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(22,27,37,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-[color] duration-150"
              style={{ color: filter === f ? '#0E0E14' : '#7A7A8C' }}
              onMouseEnter={e => { if (filter !== f) e.currentTarget.style.color = '#FAFAFA'; }}
              onMouseLeave={e => { if (filter !== f) e.currentTarget.style.color = '#7A7A8C'; }}
            >
              {filter === f && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: '#C8F55A' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </motion.div>

        {/* Mental Agility */}
        <AnimatePresence mode="wait">
          {showWord && (
            <motion.section key="word"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-16">
              <SectionHeader label="Mental Agility" count={wordGames.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {wordGames.map((g, i) => (
                  <GameCard key={g.id} game={g} index={i} done={isCompletedToday(g.id)} navigate={navigate} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Pattern Recognition */}
        <AnimatePresence mode="wait">
          {showVisual && (
            <motion.section key="visual"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SectionHeader label="Pattern Recognition" count={visualGames.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {visualGames.map((g, i) => (
                  <GameCard key={g.id} game={g} index={i} done={isCompletedToday(g.id)} navigate={navigate} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
