import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordle } from './useWordle.js';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useConfetti } from '../../hooks/useConfetti.js';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Sparkles, Frown } from 'lucide-react';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

const FILLED_BG     = 'rgba(255,255,255,0.08)';
const FILLED_BORDER = 'rgba(255,255,255,0.25)';
const EMPTY_BG      = 'transparent';
const EMPTY_BORDER  = 'rgba(255,255,255,0.1)';
const FILLED_TEXT   = '#F0F0F0';

const TILE_COLORS = {
  empty:   { bg: EMPTY_BG,                 border: EMPTY_BORDER,                text: FILLED_TEXT },
  filled:  { bg: FILLED_BG,                border: FILLED_BORDER,               text: FILLED_TEXT },
  hint:    { bg: 'rgba(245,166,35,0.15)',   border: '#F5A623',                   text: '#F5A623'   },
  correct: { bg: '#22C55E',                border: '#22C55E',                   text: '#0D0F14'   },
  present: { bg: '#F5A623',                border: '#F5A623',                   text: '#0D0F14'   },
  absent:  { bg: '#2A2F3A',                border: '#2A2F3A',                   text: '#8B95A1'   },
};

const KEY_COLORS = {
  correct: { bg: '#22C55E', border: '#22C55E', text: '#0D0F14' },
  present: { bg: '#F5A623', border: '#F5A623', text: '#0D0F14' },
  absent:  { bg: '#1E2535', border: '#1E2535', text: '#8B95A1' },
  default: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.1)', text: '#F0F0F0' },
};

// Tiles are now sized by their CSS grid container — fully responsive.
function Tile({ letter, state, delay = 0 }) {
  const isRevealing = state === 'correct' || state === 'present' || state === 'absent';
  const isHint      = state === 'hint';
  const revColors   = TILE_COLORS[state] || TILE_COLORS.empty;
  const prevLetterRef   = useRef('');
  const letterJustAdded = letter && !prevLetterRef.current;
  useEffect(() => { prevLetterRef.current = letter; });

  return (
    <motion.div
      // w-full + aspect-square lets the CSS grid dictate the tile size
      className="w-full aspect-square rounded-xl flex items-center justify-center font-mono font-black select-none border-2 text-xl sm:text-2xl"
      style={{ color: revColors.text }}
      animate={isRevealing ? {
        rotateX: [0, 90, 90, 0],
        backgroundColor: [FILLED_BG, FILLED_BG, revColors.bg, revColors.bg],
        borderColor:     [FILLED_BORDER, FILLED_BORDER, revColors.border, revColors.border],
        color:           [FILLED_TEXT, FILLED_TEXT, revColors.text, revColors.text],
      } : {
        rotateX: 0,
        backgroundColor: revColors.bg,
        borderColor:     revColors.border,
        scale: (isHint || letterJustAdded) ? [1, 1.12, 1] : 1,
      }}
      transition={isRevealing ? {
        duration: 0.55, times: [0, 0.44, 0.56, 1], delay, ease: 'linear',
      } : {
        duration: (isHint || letterJustAdded) ? 0.12 : 0.05,
      }}
    >
      {letter}
    </motion.div>
  );
}

// Keys use flex-1 so the row fills 100% of the keyboard container width.
function KeyboardKey({ label, state, onPress }) {
  const colors = KEY_COLORS[state] || KEY_COLORS.default;
  const isWide = label === 'ENTER' || label === '⌫';
  return (
    <motion.button
      // onPointerDown gives instant response on touch (no 300 ms delay)
      onPointerDown={(e) => { e.preventDefault(); onPress(label); }}
      whileTap={{ scale: 0.93 }}
      style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
      className={`
        ${isWide ? 'flex-[1.5] text-[10px] sm:text-xs' : 'flex-1 text-sm sm:text-base'}
        h-12 sm:h-14 min-w-0 rounded-lg border font-bold select-none
        flex items-center justify-center
        transition-[background-color,border-color] duration-150
      `}
    >
      {label}
    </motion.button>
  );
}

export default function WordleGame({ mode = 'normal', daily = true }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp       = useHowToPlay();
  const wordle    = useWordle({ mode, daily });
  const {
    rows, currentRow, gameOver, won, shake, time, letterStates, target,
    handleKey, getTileState, getTileLetter, newGame, shareResult,
    wordLen, MAX_GUESSES, hint, solve, hintsUsed, wasSolved, isRestored,
  } = wordle;
  const { fire }       = useConfetti();
  const skipModalRef   = useRef(isRestored);

  // Hidden input: stays focused so hardware/Bluetooth keyboards fire keydown
  // events even on mobile browsers that require a focused element.
  // inputMode="none" prevents the system virtual keyboard from appearing.
  const hiddenInputRef = useRef(null);
  useEffect(() => { hiddenInputRef.current?.focus(); }, []);

  useEffect(() => {
    if (skipModalRef.current) { skipModalRef.current = false; return; }
    if (won) {
      const t = setTimeout(() => { fire(); setShowModal(true); }, wordLen * 150 + 600);
      return () => clearTimeout(t);
    } else if (gameOver && !won) {
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    }
  }, [won, gameOver]);

  return (
    // overflow-x-hidden prevents any child from causing horizontal scroll
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 overflow-x-hidden">
      {htp.open && <HowToPlay gameId="wordle" onClose={htp.hide} />}

      {/* Hidden input — captures hardware keyboard on mobile */}
      <input
        ref={hiddenInputRef}
        aria-hidden="true"
        tabIndex={-1}
        inputMode="none"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{ position: 'fixed', left: '-9999px', top: 0, width: 1, height: 1, opacity: 0 }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          e.preventDefault();
          if (e.key === 'Backspace') handleKey('BACKSPACE');
          else if (e.key === 'Enter') handleKey('ENTER');
          else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
        }}
      />

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between px-4 pb-4 border-b border-white/[0.06] mb-6">
        <button
          onClick={() => navigate('/games')}
          className="text-muted hover:text-text text-sm font-medium transition-colors duration-150 flex items-center gap-1.5"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="font-black text-lg tracking-snug">Wordle</span>
          <Badge variant={mode === 'normal' ? 'amber' : mode === 'hard' ? 'blue' : 'red'}>
            {mode === 'normal' ? 'Normal' : mode === 'hard' ? 'Hard' : 'Expert'}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
          >?</button>
          <div className="text-center">
            <div className="text-[10px] text-muted font-mono tracking-widest">TIME</div>
            <div className="text-base font-bold font-mono text-blue">{time}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-muted tracking-widest">ROW</div>
            <div className="text-base font-bold text-amber">{currentRow}/{MAX_GUESSES}</div>
          </div>
        </div>
      </div>

      {/* Daily badge */}
      {daily && (
        <div className="flex items-center gap-2 bg-amber/8 border border-amber/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-green shadow-[0_0_6px_#22C55E]" />
          <span className="text-xs font-bold text-amber tracking-wider uppercase">Daily Challenge</span>
        </div>
      )}

      {/* Tile grid
          Width is capped so tiles stay readable: at most 60 px each on desktop,
          but on narrow screens the grid fills the available width (minus padding). */}
      <div className="w-full px-4 mb-6" style={{ maxWidth: `min(${wordLen * 68}px, 100%)` }}>
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${wordLen}, 1fr)`,
            gap: '6px',
          }}
          animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: MAX_GUESSES }).map((_, row) =>
            Array.from({ length: wordLen }).map((_, col) => (
              <Tile
                key={`${row}-${col}`}
                letter={getTileLetter(row, col)}
                state={getTileState(row, col)}
                delay={col * 0.15}
              />
            ))
          )}
        </motion.div>
      </div>

      {/* On-screen keyboard — full screen width on mobile */}
      <div className="w-full px-2 flex flex-col gap-1.5 mb-2">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map(key => {
              const letter = key.length === 1 ? key : null;
              const state  = letter ? letterStates[letter] : undefined;
              return (
                <KeyboardKey key={key} label={key} state={state} onPress={handleKey} />
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex gap-3 mt-4">
        {gameOver && (
          <Button variant="secondary" size="md" onClick={shareResult}>📤 Share</Button>
        )}
        {!daily && (
          <Button variant="ghost" size="md" onClick={newGame}>↺ New Word</Button>
        )}
      </div>

      <HintSolveBar
        onHint={hint} onSolve={solve}
        hintsUsed={hintsUsed} wasSolved={wasSolved}
        hintLabel="Reveal a letter" disabled={gameOver}
      />

      {/* Win / Lose modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
            style={{
              background: won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {won ? <Sparkles size={28} color="#F5A623" /> : <Frown size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-3xl font-black tracking-snug mb-2 ${won ? 'text-amber' : 'text-red'}`}>
            {won ? 'Brilliant!' : 'Better luck next time'}
          </h2>
          <p className="text-muted mb-8">
            {won
              ? `You got it in ${currentRow} ${currentRow === 1 ? 'guess' : 'guesses'}!`
              : <span>The word was <strong className="text-text">{target}</strong></span>
            }
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              ['Guesses', won ? `${currentRow}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`],
              ['Time',    time],
              ['XP',      won ? `+${mode === 'normal' ? 100 : mode === 'hard' ? 200 : 300}` : '+0'],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/[0.04] rounded-xl p-4">
                <div className="text-xs text-muted mb-1">{label}</div>
                <div className={`text-xl font-black ${label === 'XP' ? 'text-amber' : 'text-text'}`}>{val}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); shareResult(); }}>
              📤 Share
            </Button>
            {daily ? (
              <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>
                More Games →
              </Button>
            ) : (
              <Button variant="primary" className="flex-1" onClick={() => { setShowModal(false); newGame(); }}>
                Play Again →
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
