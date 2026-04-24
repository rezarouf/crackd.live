import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSudoku } from './useSudoku.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Grid } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert', 'Evil'];

function SudokuCell({ row, col, value, notes, isGiven, isSelected, isRelated, isHighlighted, isError, onClick }) {
  const isEmpty = value === 0;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      style={isSelected ? { boxShadow: 'inset 0 0 0 2px rgba(245,166,35,0.9)' } : undefined}
      className={`
        relative w-full aspect-square flex items-center justify-center
        font-mono text-sm sm:text-base font-bold select-none transition-[background-color,border-color] duration-100
        border-r border-b border-white/[0.06]
        ${col % 3 === 2 ? 'border-r-white/20' : ''}
        ${row % 3 === 2 ? 'border-b-white/20' : ''}
        ${isSelected
          ? 'bg-amber/30 text-amber'
          : isError
          ? 'bg-red-500/15 text-red-400'
          : isHighlighted
          ? 'bg-blue/15 text-blue'
          : isRelated
          ? 'bg-white/[0.04] text-text'
          : 'bg-transparent text-text hover:bg-white/[0.04]'
        }
        ${isGiven ? 'opacity-90' : ''}
      `}
    >
      {isEmpty ? (
        notes.size > 0 ? (
          <div className="grid grid-cols-3 w-full h-full p-0.5">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <span
                key={n}
                className={`flex items-center justify-center text-[7px] sm:text-[9px] font-mono leading-none
                  ${notes.has(n) ? 'text-amber/70' : 'text-transparent'}`}
              >
                {n}
              </span>
            ))}
          </div>
        ) : null
      ) : (
        <span className={`text-sm sm:text-lg ${isGiven ? 'font-black' : 'font-semibold'}`}>
          {value}
        </span>
      )}
    </motion.button>
  );
}

export default function SudokuGame({ difficulty: initialDiff = 'Medium' }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(initialDiff);
  const [showModal, setShowModal] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const htp = useHowToPlay();

  const game = useSudoku({ difficulty });

  const emptyNotes = () => Array(81).fill(null).map(() => new Set());
  const [localNotes, setLocalNotes] = useState(emptyNotes);

  const resetNotes = () => setLocalNotes(emptyNotes());

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 600);

  const handleCellClick = (row, col) => {
    game.setSelected([row, col]);
  };

  const handleNumpad = (num) => {
    if (!game.selected) return;
    const [row, col] = game.selected;
    const cellIdx = row * 9 + col;
    if (num === 0) {
      if (!game.isGiven(row, col)) game.setCellValue(row, col, 0);
      return;
    }
    if (game.pencilMode) {
      if (game.isGiven(row, col) || game.board[row][col] !== 0) return;
      setLocalNotes(prev => {
        const next = prev.map(s => new Set(s));
        if (next[cellIdx].has(num)) next[cellIdx].delete(num);
        else next[cellIdx].add(num);
        return next;
      });
    } else {
      if (game.isGiven(row, col)) return;
      game.setCellValue(row, col, num);
      setLocalNotes(prev => {
        const next = prev.map(s => new Set(s));
        next[cellIdx] = new Set();
        return next;
      });
    }
  };

  const changeDifficulty = (diff) => {
    setDifficulty(diff);
    setShowDiff(false);
    game.newGame();
    resetNotes();
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-28 pt-2 px-3 overflow-x-hidden">
      {htp.open && <HowToPlay gameId="sudoku" onClose={htp.hide} />}
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-black text-lg tracking-snug">Sudoku</span>
          <div className="relative">
            <button
              onClick={() => setShowDiff(v => !v)}
              className="text-xs text-muted hover:text-amber transition-colors duration-150 flex items-center gap-1"
            >
              {difficulty} ▾
            </button>
            <AnimatePresence>
              {showDiff && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface border border-white/10 rounded-lg shadow-lg overflow-hidden z-20 w-28"
                >
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => changeDifficulty(d)}
                      className={`w-full px-3 py-2 text-xs font-medium text-left transition-colors duration-100
                        ${d === difficulty ? 'bg-amber/10 text-amber' : 'text-text hover:bg-white/5'}`}
                    >
                      {d}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="font-mono text-sm text-muted tabular-nums">{game.time}</span>
          <button
            onClick={() => game.setPaused(p => !p)}
            className="text-muted hover:text-text text-xs transition-colors duration-150"
          >
            {game.paused ? '▶' : '⏸'}
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div className="w-full max-w-lg flex items-center justify-between mb-2 px-1">
        <button
          onClick={game.undo}
          className="text-xs text-muted hover:text-text transition-colors duration-150 flex items-center gap-1"
        >
          ↩ Undo
        </button>
        <button
          onClick={() => game.setPencil(p => !p)}
          className={`text-xs font-semibold px-3 py-1 rounded-full border transition-[background-color,border-color,color] duration-150
            ${game.pencilMode
              ? 'bg-amber/15 border-amber/40 text-amber'
              : 'bg-white/5 border-white/10 text-muted hover:text-text'
            }`}
        >
          ✏ Pencil
        </button>
        <button
          onClick={() => game.setShowErrors(e => !e)}
          className={`text-xs px-3 py-1 rounded-full border transition-[background-color,border-color,color] duration-150
            ${game.showErrors
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-white/5 border-white/10 text-muted hover:text-text'
            }`}
        >
          {game.showErrors ? '⚠ Errors On' : '⚠ Errors Off'}
        </button>
      </div>

      {/* Board */}
      <div className="w-full max-w-lg mb-2">
        <div
          className="grid grid-cols-9 border-2 border-white/20 rounded-xl overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(245,166,35,0.06), 0 2px 24px rgba(0,0,0,0.4)' }}
        >
          {game.board.map((row, ri) =>
            row.map((val, ci) => (
              <SudokuCell
                key={`${ri}-${ci}`}
                row={ri}
                col={ci}
                value={val}
                notes={localNotes[ri * 9 + ci]}
                isGiven={game.isGiven(ri, ci)}
                isSelected={game.selected?.[0] === ri && game.selected?.[1] === ci}
                isRelated={game.isRelated(ri, ci)}
                isHighlighted={game.isHighlighted(ri, ci)}
                isError={game.isError(ri, ci)}
                onClick={() => handleCellClick(ri, ci)}
              />
            ))
          )}
        </div>
      </div>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Reveal a cell" disabled={game.won} />

      {/* Number pad */}
      <div className="w-full max-w-lg">
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <motion.button
              key={n}
              onClick={() => handleNumpad(n)}
              whileTap={{ scale: 0.88 }}
              disabled={game.gameOver}
              className="h-11 sm:h-14 rounded-xl bg-surface border border-white/10 font-mono font-bold text-lg sm:text-xl text-text
                hover:bg-surface-2 hover:border-amber/30 hover:text-amber
                active:bg-amber/10 transition-[background-color,border-color,color] duration-100 disabled:opacity-40"
            >
              {n}
            </motion.button>
          ))}
          <motion.button
            onClick={() => handleNumpad(0)}
            whileTap={{ scale: 0.88 }}
            disabled={game.gameOver}
            className="h-11 sm:h-14 rounded-xl bg-surface border border-white/10 font-mono font-bold text-lg sm:text-xl text-muted
              hover:bg-surface-2 hover:border-red-500/30 hover:text-red-400
              active:bg-red-500/10 transition-[background-color,border-color,color] duration-100 disabled:opacity-40"
          >
            ⌫
          </motion.button>
        </div>
      </div>

      {/* Paused overlay */}
      <AnimatePresence>
        {game.paused && !game.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-30"
            onClick={() => game.setPaused(false)}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">⏸</div>
              <p className="text-muted text-sm">Tap to resume</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Grid size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">Solved!</h2>
          <p className="text-muted text-sm mb-1">{difficulty} puzzle completed</p>
          <p className="font-mono text-amber text-lg font-bold mb-6">{game.time}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); game.newGame(); resetNotes(); }}>
              New Game
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>
              More Games →
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
