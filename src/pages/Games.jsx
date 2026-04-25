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
  wordle: Type,
  connections: Grid3X3,
  nerdle: Hash,
  cryptogram: Lock,
  sudoku: Grid,
  screw: Settings2,
  pinpull: MapPin,
  rope: GitBranch,
  woodblock: Layers,
  nutsbolts: Wrench,
  spellingbee: AlignLeft,
  nonogram: LayoutGrid,
  wordladder: ArrowUpDown,
  flow: Workflow,
  watersort: Droplets,
  tilerotation: Cpu,
  minesweeper: Bomb,
  merge: GitMerge,
  emojiphrase: MessageCircle,
  twentyfortyeight: Gamepad2,
  logoguess: Tag,
};

const FILTERS = ['All', 'Word & Number', 'Visual'];

export default function GamesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const { isCompletedToday } = useGameStore();

  const wordGames   = GAMES_META.filter(g => g.type === 'word');
  const visualGames = GAMES_META.filter(g => g.type === 'visual');
  const showWord    = filter !== 'Visual';
  const showVisual  = filter !== 'Word & Number';

  const totalDone = GAMES_META.filter(g => isCompletedToday(g.id)).length;

  return (
    <div className="min-h-screen bg-navy pt-16 pb-28 relative overflow-x-hidden">

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse, #F5A623 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* Page header */}
        <div className="pt-12 pb-12">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="label-eyebrow mb-3">10 Games</motion.p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.04 }}
              className="text-[clamp(36px,6vw,60px)] font-black tracking-[-0.04em] leading-none"
            >
              Game Lobby
            </motion.h1>

            {/* Today's progress */}
            {totalDone > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border flex-shrink-0"
                style={{ background: 'rgba(245,166,35,0.06)', borderColor: 'rgba(245,166,35,0.15)' }}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted/60 mb-1">Today</p>
                  <div className="flex gap-1">
                    {GAMES_META.map(g => (
                      <div key={g.id} className={`w-2 h-2 rounded-sm ${isCompletedToday(g.id) ? 'bg-amber' : 'bg-white/10'}`} />
                    ))}
                  </div>
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
          className="flex gap-1 mb-12 p-1 rounded-xl border border-white/[0.06] w-fit"
          style={{ background: 'rgba(22,27,37,0.8)' }}
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`relative px-5 py-2 rounded-lg text-sm font-semibold transition-[color] duration-150
                ${filter === f ? 'text-navy' : 'text-muted hover:text-text'}`}
            >
              {filter === f && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-amber rounded-lg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </motion.div>

        {/* Word & Number */}
        <AnimatePresence mode="wait">
          {showWord && (
            <motion.section
              key="word"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-16"
            >
              <SectionHeader label="Word & Number" count={wordGames.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {wordGames.map((g, i) => (
                  <GameCard key={g.id} game={g} index={i} done={isCompletedToday(g.id)} navigate={navigate} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Visual */}
        <AnimatePresence mode="wait">
          {showVisual && (
            <motion.section
              key="visual"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <SectionHeader label="Visual Puzzles" count={visualGames.length} />
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

function SectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-lg font-black tracking-snug text-text">{label}</h2>
      <div className="flex-1 h-px bg-white/[0.05]" />
      <span className="text-xs text-muted/60 font-semibold tabular-nums">{count} games</span>
    </div>
  );
}

function GameCard({ game, index, done, navigate }) {
  const diffColor = DIFF_COLOR[game.difficulty] || '#8B95A1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(game.route)}
      className="relative group flex flex-col p-6 rounded-2xl border cursor-pointer overflow-hidden"
      style={{
        background: 'rgba(22,27,37,0.9)',
        borderColor: done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = done ? 'rgba(34,197,94,0.35)' : 'rgba(245,166,35,0.3)';
        e.currentTarget.style.boxShadow = done
          ? '0 0 24px rgba(34,197,94,0.1), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 0 24px rgba(245,166,35,0.12), 0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)';
      }}
    >
      {/* Background icon watermark */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.06] pointer-events-none select-none"
        style={{ filter: 'blur(1px)' }}>
        {(() => { const I = GAME_ICONS[game.id]; return I ? <I size={72} /> : null; })()}
      </div>

      {/* Done badge */}
      {done && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green/15 border border-green/30 flex items-center justify-center">
          <span className="text-[11px] text-green font-black">✓</span>
        </div>
      )}

      {/* Visual type accent */}
      {game.type === 'visual' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-40"
          style={{ background: 'linear-gradient(90deg, transparent, #4A9EFF, transparent)' }} />
      )}

      {/* Icon */}
      <div className="mb-5 relative z-10 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.15)' }}>
        {(() => { const I = GAME_ICONS[game.id]; return I ? <I size={20} color="#F5A623" /> : null; })()}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <h3 className="font-black text-[17px] tracking-snug text-text mb-1.5">{game.name}</h3>
        <p className="text-[13px] text-muted leading-relaxed mb-5 flex-1">{game.desc}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{
                color: diffColor,
                background: `${diffColor}14`,
                border: `1px solid ${diffColor}30`,
              }}
            >
              {game.difficulty}
            </span>
            <span className="text-[12px] text-muted/70 font-mono">+{game.xp}</span>
          </div>

          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-navy font-black text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'linear-gradient(135deg, #F5A623, #FFB84D)' }}
          >
            →
          </div>
        </div>
      </div>
    </motion.div>
  );
}
