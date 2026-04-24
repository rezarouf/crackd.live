import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnections } from './useConnections.js';
import { getDailyPuzzle } from './puzzles.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useState, useRef, useEffect } from 'react';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Sparkles, Frown } from 'lucide-react';

const COLOR_STYLES = {
  yellow: { bg: 'bg-yellow-400/15', border: 'border-yellow-400/40', text: 'text-yellow-400', solved: 'bg-yellow-400/20' },
  green:  { bg: 'bg-green/15',      border: 'border-green/40',      text: 'text-green',      solved: 'bg-green/20' },
  blue:   { bg: 'bg-blue/15',       border: 'border-blue/40',       text: 'text-blue',       solved: 'bg-blue/20' },
  purple: { bg: 'bg-purple/15',     border: 'border-purple/40',     text: 'text-purple',     solved: 'bg-purple/20' },
};

export default function ConnectionsGame() {
  const navigate  = useNavigate();
  const puzzle    = getDailyPuzzle();
  const game      = useConnections(puzzle);
  const [showModal, setShowModal] = useState(false);
  const [shuffledWords, setShuffledWords] = useState(() => [...game.unsolvedWords]);
  const htp = useHowToPlay();
  const skipModalRef = useRef(game.isRestored);

  useEffect(() => {
    setShuffledWords(prev => {
      const remaining = game.unsolvedWords;
      const filtered = prev.filter(w => remaining.some(r => r.word === w.word));
      const added = remaining.filter(w => !filtered.some(p => p.word === w.word));
      return [...filtered, ...added];
    });
  }, [game.unsolvedWords]);

  function handleShuffle() {
    setShuffledWords(prev => {
      if (prev.length <= 1) return prev;
      let next;
      let attempts = 0;
      do {
        next = [...prev];
        for (let i = next.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [next[i], next[j]] = [next[j], next[i]];
        }
        attempts++;
      } while (attempts < 20 && next.some((w, i) => w.word === prev[i].word));
      return next;
    });
  }

  if (game.gameOver && !showModal && !skipModalRef.current) {
    setTimeout(() => setShowModal(true), 400);
  }
  if (skipModalRef.current && !game.gameOver) {
    skipModalRef.current = false;
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4">
      {htp.open && <HowToPlay gameId="connections" onClose={htp.hide} />}
      {/* Header */}
      <div className="w-full max-w-xl flex items-center justify-between px-4 pb-4 border-b border-white/[0.06] mb-6">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">← Back</button>
        <span className="font-black text-lg tracking-snug">Connections</span>
        <div className="flex items-center gap-3">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border ${i < game.mistakes ? 'bg-red border-red' : 'bg-white/5 border-white/10'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted mb-6">Group 4 words that share a common theme</p>

      {/* Solved rows */}
      <div className="w-full max-w-xl px-4 flex flex-col gap-2 mb-2">
        <AnimatePresence>
          {game.solved.map(cat => {
            const style = COLOR_STYLES[cat.color];
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${style.solved} border ${style.border} rounded-xl p-4`}
              >
                <p className={`text-xs font-black uppercase tracking-widest mb-1 ${style.text}`}>{cat.name}</p>
                <p className="text-sm font-semibold text-text">{cat.words.join(', ')}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Word grid */}
      <motion.div
        className="w-full max-w-xl px-4 grid grid-cols-4 gap-2 mb-6"
        animate={game.shake ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {shuffledWords.map((wordObj) => {
          const state = game.getWordState(wordObj);
          return (
            <motion.button
              key={wordObj.word}
              onClick={() => game.toggleWord(wordObj)}
              whileTap={{ scale: 0.95 }}
              className={`
                h-16 rounded-xl text-sm font-black uppercase tracking-wide border
                transition-[background-color,border-color,transform] duration-150
                ${state === 'selected'
                  ? 'bg-amber/20 border-amber/50 text-amber'
                  : 'bg-surface border-white/[0.06] text-text hover:bg-white/5 hover:border-white/20'}
              `}
            >
              {wordObj.word}
            </motion.button>
          );
        })}
      </motion.div>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Reveal a group" disabled={game.gameOver} />

      {/* Controls */}
      <div className="flex gap-3">
        <Button variant="secondary" size="md" onClick={handleShuffle}>Shuffle</Button>
        <Button variant="ghost" size="md" onClick={() => game.setSelected?.([])} disabled>Deselect All</Button>
        <Button
          variant="primary"
          size="md"
          onClick={game.submitGuess}
          disabled={game.selected.length !== 4}
        >
          Submit
        </Button>
      </div>

      {/* Result modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: game.won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${game.won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {game.won ? <Sparkles size={28} color="#F5A623" /> : <Frown size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-2xl font-black tracking-snug mb-2 ${game.won ? 'text-amber' : 'text-red'}`}>
            {game.won ? 'Solved!' : 'Not quite!'}
          </h2>
          <p className="text-muted text-sm mb-6">
            {game.won
              ? `Completed with ${game.mistakes} mistake${game.mistakes !== 1 ? 's' : ''}.`
              : 'Better luck tomorrow!'}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>See Board</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
