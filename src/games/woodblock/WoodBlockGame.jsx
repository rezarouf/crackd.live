import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWoodBlock } from './useWoodBlock.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Layers, Flame } from 'lucide-react';

const CELL_SIZE = 38;

function PiecePreview({ piece }) {
  if (!piece) return null;
  const maxR = Math.max(...piece.cells.map(([r]) => r));
  const maxC = Math.max(...piece.cells.map(([, c]) => c));
  const pw = (maxC + 1) * 26;
  const ph = (maxR + 1) * 26;

  return (
    <div className="relative" style={{ width: pw, height: ph }}>
      {piece.cells.map(([r, c], i) => (
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: c * 26,
            top: r * 26,
            width: 22,
            height: 22,
            backgroundColor: piece.color,
            boxShadow: `0 2px 6px ${piece.color}50`,
          }}
        />
      ))}
    </div>
  );
}

export default function WoodBlockGame({ difficulty = 'Medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = useWoodBlock({ difficulty });

  if (game.gameOver && !showModal) setTimeout(() => setShowModal(true), 400);

  const handleCellClick = (row, col) => {
    if (game.dragging === null) return;
    game.placePieceOnGrid(game.dragging, row, col);
  };

  const getCellState = (row, col) => {
    if (game.grid[row][col]) return { filled: true, color: game.grid[row][col] };
    if (game.previewCells) {
      const isPreview = game.previewCells.some(([r, c]) => r === row && c === col);
      if (isPreview) return { preview: true, valid: game.canPreview };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4">
      {htp.open && <HowToPlay gameId="woodblock" onClose={htp.hide} />}
      <div className="w-full max-w-lg flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">
          ← Back
        </button>
        <div className="text-center">
          <span className="font-black text-lg tracking-snug block">Wood Block</span>
          {game.combo >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-bold text-amber"
            >
              {game.combo}x COMBO <Flame size={12} className="inline" />
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <div className="text-right">
            <span className="font-mono text-amber font-bold text-lg block">{game.score}</span>
            <span className="text-muted text-xs">score</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted mb-4 text-center max-w-sm">
        Click a piece below, then click the grid to place it. Clear full rows and columns to score.
      </p>

      {/* Grid */}
      <div
        className="border border-white/10 rounded-xl overflow-hidden mb-6"
        style={{ boxShadow: '0 0 40px rgba(245,166,35,0.05), 0 4px 24px rgba(0,0,0,0.5)' }}
      >
        <div
          className="grid bg-surface"
          style={{
            gridTemplateColumns: `repeat(${game.GRID_SIZE}, ${CELL_SIZE}px)`,
            gap: '2px',
            padding: '2px',
          }}
        >
          {Array.from({ length: game.GRID_SIZE }, (_, row) =>
            Array.from({ length: game.GRID_SIZE }, (_, col) => {
              const state = getCellState(row, col);
              return (
                <motion.div
                  key={`${row}-${col}`}
                  onClick={() => handleCellClick(row, col)}
                  onMouseEnter={() => game.dragging !== null && game.setHoverCell({ row, col })}
                  whileTap={game.dragging !== null ? { scale: 0.9 } : {}}
                  className={`rounded-sm transition-[background-color,box-shadow] duration-75
                    ${game.dragging !== null ? 'cursor-pointer' : ''}
                  `}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: state.filled
                      ? state.color
                      : state.preview
                      ? state.valid ? `${game.queue[game.dragging]?.color}60` : 'rgba(239,68,68,0.2)'
                      : 'rgba(255,255,255,0.03)',
                    boxShadow: state.filled ? `0 2px 8px ${state.color}40` : 'none',
                    border: state.preview
                      ? `1px solid ${state.valid ? game.queue[game.dragging]?.color : '#EF4444'}60`
                      : '1px solid rgba(255,255,255,0.04)',
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Piece queue */}
      <div className="flex gap-4 items-center justify-center flex-wrap">
        {game.queue.map((piece, i) => (
          <motion.button
            key={i}
            onClick={() => game.setDragging(game.dragging === i ? null : i)}
            whileTap={{ scale: 0.92 }}
            className={`relative p-3 rounded-xl border-2 transition-[border-color,background-color] duration-150 flex items-center justify-center
              ${game.dragging === i
                ? 'border-amber bg-amber/10'
                : 'border-white/10 bg-surface hover:border-white/20'
              }`}
            style={{ minWidth: 64, minHeight: 64 }}
          >
            <PiecePreview piece={piece} />
            {game.dragging === i && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber" />
            )}
          </motion.button>
        ))}
      </div>

      {game.dragging !== null && (
        <p className="text-xs text-amber mt-3 text-center animate-pulse">
          Click the grid to place this piece
        </p>
      )}

      <button onClick={game.newGame} className="mt-8 text-xs text-muted hover:text-text transition-colors duration-150">
        ↺ New game
      </button>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Best placement" disabled={game.gameOver} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Layers size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">Game Over</h2>
          <p className="text-muted text-sm mb-1">No more moves</p>
          <p className="font-mono text-amber text-2xl font-black mb-6">{game.score}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowModal(false); game.newGame(); }}>Play Again</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
