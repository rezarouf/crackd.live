import { motion, AnimatePresence } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import { useSpellingBee } from './useSpellingBee.js';

const HEX_POSITIONS = [
  { cx: 50, cy: 20 },   // top
  { cx: 82, cy: 37 },   // top-right
  { cx: 82, cy: 63 },   // bottom-right
  { cx: 50, cy: 80 },   // bottom
  { cx: 18, cy: 63 },   // bottom-left
  { cx: 18, cy: 37 },   // top-left
];

function HexTile({ letter, isCenter, onClick }) {
  const size = 22;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${Math.cos(a) * size},${Math.sin(a) * size}`;
  }).join(' ');

  return (
    <motion.g
      className="cursor-pointer"
      whileTap={{ scale: 0.93 }}
      onClick={() => onClick(letter)}
      style={{ userSelect: 'none' }}
    >
      <polygon
        points={hex}
        fill={isCenter ? '#F5A623' : 'rgba(255,255,255,0.06)'}
        stroke={isCenter ? '#F5A623' : 'rgba(255,255,255,0.15)'}
        strokeWidth="1"
      />
      <text
        x="0" y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={isCenter ? '13' : '12'}
        fontWeight="900"
        fill={isCenter ? '#0D0F14' : '#F0F0F0'}
        fontFamily="Inter, sans-serif"
      >
        {letter}
      </text>
    </motion.g>
  );
}

export default function SpellingBeeGame() {
  const {
    puzzle, allLetters, found, score, maxScore, input, message, gameOver,
    time, rank, hintsUsed, wasSolved,
    addLetter, deleteLetter, clearInput, submit, hint, solve,
  } = useSpellingBee();

  return (
    <GameShell gameId="spellingbee" title="Spelling Bee" badge={`Score: ${score}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Reveal a word hint" gameOver={gameOver}>
      {/* Rank */}
      <div className="flex flex-col items-center mb-4">
        <span className="text-sm font-bold" style={{ color: rank.color }}>{rank.label}</span>
        <div className="w-48 h-1.5 rounded-full mt-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${Math.min(100, (score / maxScore) * 100)}%`, background: rank.color }}
          />
        </div>
        <span className="text-xs text-muted mt-1">{score} / {maxScore} pts</span>
      </div>

      {/* Input display */}
      <div className="mb-4 h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {message ? (
            <motion.span
              key={message}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="font-bold text-amber text-sm px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(245,166,35,0.12)' }}
            >
              {message}
            </motion.span>
          ) : (
            <span className="font-black text-2xl tracking-widest text-text">
              {input.split('').map((l, i) => (
                <span key={i} style={{ color: l === puzzle.center.toUpperCase() ? '#F5A623' : '#F0F0F0' }}>{l}</span>
              ))}
              <span className="animate-pulse text-amber">|</span>
            </span>
          )}
        </AnimatePresence>
      </div>

      {/* Honeycomb */}
      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 100 100" width="260" height="260">
          {HEX_POSITIONS.map((pos, i) => (
            <g key={i} transform={`translate(${pos.cx}, ${pos.cy})`}>
              <HexTile
                letter={puzzle.letters[i]?.toUpperCase() || ''}
                isCenter={false}
                onClick={addLetter}
              />
            </g>
          ))}
          {/* Center */}
          <g transform="translate(50, 50)">
            <HexTile letter={puzzle.center.toUpperCase()} isCenter onClick={addLetter} />
          </g>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-6">
        <button
          onClick={deleteLetter}
          className="px-5 py-2.5 rounded-xl border text-sm font-bold text-muted hover:text-text transition-[color,border-color] duration-150"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
        >
          ⌫ Delete
        </button>
        <button
          onClick={clearInput}
          className="px-5 py-2.5 rounded-xl border text-sm font-bold text-muted hover:text-text transition-[color,border-color] duration-150"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
        >
          Clear
        </button>
        <button
          onClick={submit}
          className="px-6 py-2.5 rounded-xl font-black text-sm text-navy"
          style={{ background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)', boxShadow: '0 4px 16px rgba(245,166,35,0.35)' }}
        >
          Enter
        </button>
      </div>

      {/* Found words */}
      <div className="w-full max-w-lg px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-muted uppercase tracking-widest">Found</span>
          <span className="text-xs font-black text-amber">{found.length}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...found].sort().map(w => (
            <span
              key={w}
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: w.toUpperCase() === puzzle.pangram?.toUpperCase() ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
                color: w.toUpperCase() === puzzle.pangram?.toUpperCase() ? '#F5A623' : '#F0F0F0',
                border: `1px solid ${w.toUpperCase() === puzzle.pangram?.toUpperCase() ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
