import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, Grid3X3, Hash, Lock, Grid, Settings2, MapPin, GitBranch,
  Layers, Wrench, AlignLeft, LayoutGrid, ArrowUpDown, Workflow,
  Droplets, Cpu, Bomb, GitMerge, MessageCircle, Gamepad2, HelpCircle,
} from 'lucide-react';

const GAME_ICONS = {
  wordle: Type, connections: Grid3X3, nerdle: Hash, cryptogram: Lock,
  sudoku: Grid, screw: Settings2, pinpull: MapPin, rope: GitBranch,
  woodblock: Layers, nutsbolts: Wrench, spellingbee: AlignLeft,
  nonogram: LayoutGrid, wordladder: ArrowUpDown, flow: Workflow,
  watersort: Droplets, tilerotation: Cpu, minesweeper: Bomb,
  merge: GitMerge, emojiphrase: MessageCircle, twentyfortyeight: Gamepad2,
};

// ── Per-game instruction data ────────────────────────────────────────────────

const WORDLE_INSTRUCTIONS = {
  title: 'How to Play Wordle',
  steps: [
    'Guess the hidden 5-letter word in 6 tries.',
    'Each guess must be a valid 5-letter word — press Enter to submit.',
    'After each guess, tiles change color to show how close you are.',
  ],
  legend: [
    { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',    border: 'rgba(34,197,94,0.4)',    label: 'Correct', desc: 'Letter is in the word and in the right spot.' },
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)',   border: 'rgba(245,166,35,0.4)',   label: 'Present', desc: 'Letter is in the word but wrong position.' },
    { color: '#8B95A1', bg: 'rgba(139,149,161,0.1)',   border: 'rgba(139,149,161,0.3)',  label: 'Absent',  desc: 'Letter is not in the word at all.' },
  ],
};

const NERDLE_INSTRUCTIONS = {
  title: 'How to Play Nerdle',
  steps: [
    'Guess the hidden 8-character math equation in 6 tries.',
    'Each guess must be a valid, correct equation (e.g. 12+34=46).',
    'Characters are: 0–9 digits, +, −, ×, ÷, and = (one equals sign required).',
    'After each guess, colors reveal how close you are.',
  ],
  legend: [
    { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.4)',   label: 'Correct', desc: 'Character is in the right position.' },
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)',  border: 'rgba(245,166,35,0.4)',  label: 'Present', desc: 'Character exists but is in the wrong position.' },
    { color: '#8B95A1', bg: 'rgba(139,149,161,0.1)',  border: 'rgba(139,149,161,0.3)', label: 'Absent',  desc: 'Character is not in the equation.' },
  ],
};

const CONNECTIONS_INSTRUCTIONS = {
  title: 'How to Play Connections',
  steps: [
    'Find four groups of four words that share something in common.',
    'Select 4 words, then tap "Submit" to check your group.',
    'Each group has a hidden category — one word per group, no overlaps.',
    'You have 4 mistakes allowed — think carefully before submitting!',
  ],
  legend: [
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)',  border: 'rgba(245,166,35,0.4)',  label: 'Yellow', desc: 'Easiest group.' },
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)',  border: 'rgba(74,158,255,0.4)',  label: 'Blue',   desc: 'Medium difficulty.' },
    { color: '#A855F7', bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.4)',  label: 'Purple', desc: 'Hard group.' },
    { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   label: 'Red',    desc: 'Hardest — tricky connections.' },
  ],
};

const CRYPTOGRAM_INSTRUCTIONS = {
  title: 'How to Play Cryptogram',
  steps: [
    'A famous quote has been encrypted — each letter is swapped with a different letter.',
    'Click on any cipher letter in the puzzle to select it.',
    'Type the real letter you think it represents.',
    'The same cipher letter always maps to the same real letter throughout.',
    'Decode the entire phrase to win!',
  ],
  legend: [],
};

const SUDOKU_INSTRUCTIONS = {
  title: 'How to Play Sudoku',
  steps: [
    'Fill the 9×9 grid so every row, column, and 3×3 box contains digits 1–9.',
    'No digit can repeat in the same row, column, or 3×3 box.',
    'Click a cell to select it, then type a number (1–9) or use the on-screen pad.',
    'Gray cells are pre-filled and cannot be changed.',
  ],
  legend: [],
};

const SCREW_INSTRUCTIONS = {
  title: 'How to Play Screw Sort',
  steps: [
    'Sort colored screws so each tube contains only one color.',
    'You can only move a screw onto a tube whose top screw matches that color, or onto an empty tube.',
    'Plan several moves ahead — get all tubes sorted to win!',
  ],
  legend: [],
};

const PINPULL_INSTRUCTIONS = {
  title: 'How to Play Pin Pull',
  steps: [
    'Pull pins to release balls and guide them into matching colored buckets.',
    'Think before you pull — wrong order blocks the path.',
    'All balls must land in their matching bucket to win.',
  ],
  legend: [],
};

const ROPE_INSTRUCTIONS = {
  title: 'How to Play Rope Untangle',
  steps: [
    'Drag the nodes to rearrange them so no rope segments cross each other.',
    'Green lines mean no intersection — red lines indicate a tangle.',
    'When all lines are untangled (all green), you win!',
  ],
  legend: [],
};

const WOODBLOCK_INSTRUCTIONS = {
  title: 'How to Play Wood Block',
  steps: [
    'Drag wooden blocks from the tray onto the grid.',
    'Complete a full row or column to clear it and score points.',
    'Cleared lines earn bonus points — combos earn even more.',
    'The game ends when no remaining block can fit on the board.',
  ],
  legend: [],
};

const NUTSBOLTS_INSTRUCTIONS = {
  title: 'How to Play Nuts & Bolts',
  steps: [
    'Match each bolt to its correct nut by color.',
    'Drag a bolt onto a nut of the same color to lock them.',
    'Match all pairs to complete the puzzle and earn your XP.',
  ],
  legend: [],
};

const SPELLINGBEE_INSTRUCTIONS = {
  title: 'How to Play Spelling Bee',
  steps: [
    'Make words using the 7 letters in the honeycomb.',
    'Every word must include the center letter (shown in amber).',
    'Words must be at least 4 letters long.',
    'Using all 7 letters earns a Pangram bonus!',
    'Tap letters or type to build words. Hit Enter to submit.',
  ],
  legend: [
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: 'Pangram', desc: 'Uses all 7 letters — bonus points!' },
  ],
};

const NONOGRAM_INSTRUCTIONS = {
  title: 'How to Play Nonogram',
  steps: [
    'Fill in cells to reveal a hidden picture.',
    'Numbers on each row and column tell you how many consecutive filled cells there are.',
    'Tap a cell to fill it. Right-click (or long-press) to mark it with X (empty).',
    'A "3 1" clue means a run of 3 filled, then at least 1 gap, then 1 filled.',
    'Fill all correct cells without mistakes to win!',
  ],
  legend: [],
};

const WORDLADDER_INSTRUCTIONS = {
  title: 'How to Play Word Ladder',
  steps: [
    'Transform the start word into the goal word, one letter at a time.',
    'Each step must change exactly one letter to form a new valid word.',
    'Try to reach the goal in as few steps as possible — par is shown.',
    'Type your next word and press Enter or the → button.',
  ],
  legend: [
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: 'Start',          desc: 'Your starting word.' },
    { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  label: 'Goal',           desc: 'The target word to reach.' },
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', label: 'Changed letter', desc: 'The letter that was changed in each step.' },
  ],
};

const FLOW_INSTRUCTIONS = {
  title: 'How to Play Flow Connect',
  steps: [
    'Connect each pair of matching colored dots with a continuous path.',
    'Click and drag from one dot to draw its path.',
    'All cells on the board must be covered — no empty spaces allowed.',
    'Paths cannot cross each other.',
  ],
  legend: [],
};

const WATERSORT_INSTRUCTIONS = {
  title: 'How to Play Water Sort',
  steps: [
    'Sort the colored liquid so each tube contains only one color.',
    'Tap a tube to select it, then tap another tube to pour.',
    'You can only pour if the top colors match, or the destination is empty.',
    'A tube holds 4 segments maximum.',
    'Sort all colors to win!',
  ],
  legend: [],
};

const TILEROTATION_INSTRUCTIONS = {
  title: 'How to Play Circuit',
  steps: [
    'Rotate the tiles to connect all the wire segments into a complete circuit.',
    'Tap any tile to rotate it 90° clockwise.',
    'Wires must match at every border between adjacent tiles.',
    'All connections must align for the circuit to be complete.',
  ],
  legend: [
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)',  border: 'rgba(245,166,35,0.4)',  label: 'Active wire', desc: 'Connected wire segment.' },
    { color: '#8B95A1', bg: 'rgba(139,149,161,0.1)',  border: 'rgba(139,149,161,0.3)', label: 'Inactive',    desc: 'Disconnected wire (dashed).' },
  ],
};

const MINESWEEPER_INSTRUCTIONS = {
  title: 'How to Play Minesweeper',
  steps: [
    'Clear the board without detonating any hidden mines.',
    'Click a cell to reveal it. Numbers show how many mines are in the 8 adjacent cells.',
    'Right-click (or long-press on mobile) to place a flag on a suspected mine.',
    'Your first click is always safe — guaranteed mine-free zone.',
    'Reveal every non-mine cell to win!',
  ],
  legend: [
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', label: '1',  desc: '1 mine nearby.' },
    { color: '#22C55E', bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  label: '2',  desc: '2 mines nearby.' },
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: '3+', desc: '3 or more mines nearby.' },
  ],
};

const MERGE_INSTRUCTIONS = {
  title: 'How to Play Merge Tiles',
  steps: [
    'Merge adjacent tiles with the same number to double their value.',
    'Tap a tile to select it, then tap an adjacent tile with the same number.',
    'Successful merges earn points — higher values earn more.',
    'Reach 500 points to complete the daily challenge!',
  ],
  legend: [
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', label: 'Tier 1–2', desc: 'Low value tiles.' },
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: 'Tier 3',   desc: 'Medium value tiles.' },
    { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  label: 'Tier 5',   desc: 'Max merge value.' },
  ],
};

const EMOJIPHRASE_INSTRUCTIONS = {
  title: 'How to Play Emoji Phrase',
  steps: [
    'Decode the hidden phrase represented by the emoji sequence.',
    'Type your answer and press Enter to guess.',
    'Color feedback shows how close your guess is (like Wordle).',
    'You have 5 attempts to decode the phrase.',
    "Use the hint button if you're stuck — it costs 50 points.",
  ],
  legend: [
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: 'Correct', desc: 'Right letter, right position.' },
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', label: 'Present', desc: 'Right letter, wrong position.' },
    { color: '#8B95A1', bg: 'rgba(139,149,161,0.1)', border: 'rgba(139,149,161,0.3)', label: 'Absent', desc: 'Letter not in the phrase.' },
  ],
};

const TWENTYFORTYEIGHT_INSTRUCTIONS = {
  title: 'How to Play 2048 Twist',
  steps: [
    'Slide tiles in any direction using arrow keys or swipe.',
    'Tiles with the same number merge when they collide — doubling their value.',
    'Reach the 2048 tile to win!',
    'Twist: every 10 moves, a 🚫 blocker tile appears — it cannot be merged or moved.',
    'The game ends when no more moves are possible.',
  ],
  legend: [
    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', border: 'rgba(74,158,255,0.4)', label: '2–4',      desc: 'Common tiles.' },
    { color: '#F5A623', bg: 'rgba(245,166,35,0.15)', border: 'rgba(245,166,35,0.4)', label: '32–64',    desc: 'Mid-tier tiles.' },
    { color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  label: '512–2048', desc: 'High-value tiles — almost there!' },
  ],
};

// ── Lookup ───────────────────────────────────────────────────────────────────

const GAME_INSTRUCTIONS = {
  wordle:           WORDLE_INSTRUCTIONS,
  nerdle:           NERDLE_INSTRUCTIONS,
  connections:      CONNECTIONS_INSTRUCTIONS,
  cryptogram:       CRYPTOGRAM_INSTRUCTIONS,
  sudoku:           SUDOKU_INSTRUCTIONS,
  screw:            SCREW_INSTRUCTIONS,
  pinpull:          PINPULL_INSTRUCTIONS,
  rope:             ROPE_INSTRUCTIONS,
  woodblock:        WOODBLOCK_INSTRUCTIONS,
  nutsbolts:        NUTSBOLTS_INSTRUCTIONS,
  spellingbee:      SPELLINGBEE_INSTRUCTIONS,
  nonogram:         NONOGRAM_INSTRUCTIONS,
  wordladder:       WORDLADDER_INSTRUCTIONS,
  flow:             FLOW_INSTRUCTIONS,
  watersort:        WATERSORT_INSTRUCTIONS,
  tilerotation:     TILEROTATION_INSTRUCTIONS,
  minesweeper:      MINESWEEPER_INSTRUCTIONS,
  merge:            MERGE_INSTRUCTIONS,
  emojiphrase:      EMOJIPHRASE_INSTRUCTIONS,
  twentyfortyeight: TWENTYFORTYEIGHT_INSTRUCTIONS,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StepList({ steps }) {
  return (
    <div className="space-y-3 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.25)' }}
          >
            {i + 1}
          </span>
          <p className="text-sm text-muted leading-relaxed">{step}</p>
        </div>
      ))}
    </div>
  );
}

function ColorLegend({ legend }) {
  if (!legend.length) return null;
  return (
    <>
      <div className="h-px bg-white/[0.06] mb-5" />
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted/50 mb-3">Color guide</p>
      <div className="space-y-2.5">
        {legend.map((l) => (
          <div key={l.label} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black"
              style={{ background: l.bg, border: `1px solid ${l.border}`, color: l.color }}
            >
              A
            </div>
            <div>
              <span className="text-sm font-bold text-text">{l.label}</span>
              <span className="text-muted text-sm"> — {l.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function HowToPlay({ gameId, onClose }) {
  const info = GAME_INSTRUCTIONS[gameId];
  if (!info) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md rounded-3xl border p-8 relative overflow-y-auto max-h-[90vh]"
          style={{
            background: 'rgba(13,15,20,0.99)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-text transition-[color] duration-150"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
              {(() => { const I = GAME_ICONS[gameId] || HelpCircle; return <I size={20} color="#F5A623" />; })()}
            </div>
            <h2 className="font-black text-xl tracking-[-0.02em]">{info.title}</h2>
          </div>

          <div className="h-px bg-white/[0.06] mb-6" />

          <StepList steps={info.steps} />
          <ColorLegend legend={info.legend} />

          <button
            onClick={onClose}
            className="w-full mt-7 py-3 rounded-xl font-black text-navy text-sm"
            style={{
              background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
              boxShadow: '0 4px 20px rgba(245,166,35,0.3)',
            }}
          >
            Got it — let's play!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useHowToPlay() {
  const [open, setOpen] = useState(false);
  return { open, show: () => setOpen(true), hide: () => setOpen(false) };
}
