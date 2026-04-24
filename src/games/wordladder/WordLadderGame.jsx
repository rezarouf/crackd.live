import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useWordLadder } from './useWordLadder.js';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Lightbulb } from 'lucide-react';

export default function WordLadderGame() {
  const navigate = useNavigate();
  const { puzzle, chain, input, setInput, error, won, time, hintWord, hintsUsed, wasSolved, submit, hint, solve } = useWordLadder();
  const [showModal, setShowModal] = useState(false);
  if (won && !showModal) setTimeout(() => setShowModal(true), 400);

  return (
    <GameShell gameId="wordladder" title="Word Ladder" badge={`Steps: ${chain.length - 1}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Show next word" gameOver={won}>
      <div className="w-full max-w-sm px-4">
        {/* Target indicator */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-center">
            <div className="text-xs text-muted mb-1 uppercase tracking-widest">Start</div>
            <div className="font-black text-2xl font-mono text-amber">{puzzle.start}</div>
          </div>
          <div className="text-muted text-2xl">→</div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1 uppercase tracking-widest">Goal</div>
            <div className="font-black text-2xl font-mono text-green">{puzzle.end}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1 uppercase tracking-widest">Par</div>
            <div className="font-black text-xl font-mono text-blue">{puzzle.steps}</div>
          </div>
        </div>

        {/* Chain */}
        <div className="space-y-2 mb-6">
          {chain.map((word, i) => (
            <motion.div
              key={i}
              initial={i === chain.length - 1 && i > 0 ? { opacity: 0, x: -20 } : {}}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-muted w-4 font-mono">{i}</span>
              <div
                className="flex-1 py-3 px-4 rounded-xl font-black text-lg font-mono tracking-widest text-center"
                style={{
                  background: i === 0 ? 'rgba(245,166,35,0.1)' : word === puzzle.end ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === 0 ? 'rgba(245,166,35,0.3)' : word === puzzle.end ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: i === 0 ? '#F5A623' : word === puzzle.end ? '#22C55E' : '#F0F0F0',
                }}
              >
                {word.split('').map((l, li) => {
                  const prev = chain[i - 1];
                  const changed = prev && l !== prev[li];
                  return <span key={li} style={{ color: changed ? '#4A9EFF' : 'inherit' }}>{l}</span>;
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        {hintWord && typeof hintWord === 'string' && (
          <div className="flex items-center justify-center gap-1.5 text-amber text-sm font-bold mt-1 mb-2"><Lightbulb size={13} /> {hintWord}</div>
        )}

        {!won && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase().slice(0, 4))}
                onKeyDown={e => e.key === 'Enter' && submit()}
                maxLength={4}
                placeholder="Type next word..."
                className="flex-1 py-3 px-4 rounded-xl font-black text-lg font-mono tracking-widest text-center bg-transparent outline-none"
                style={{ border: `2px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.15)'}`, color: '#F0F0F0' }}
                autoFocus
              />
              <button
                onClick={submit}
                className="px-5 rounded-xl font-black text-navy"
                style={{ background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)' }}
              >
                →
              </button>
            </div>
            {error && <p className="text-red text-sm text-center font-bold">{error}</p>}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <ArrowUpDown size={28} color="#F5A623" />
          </div>
          <h2 className="text-3xl font-black text-amber tracking-snug mb-2">Ladder climbed!</h2>
          <p className="text-muted mb-6">
            {puzzle.start} → {puzzle.end} in <strong className="text-text">{chain.length - 1} steps</strong> (par: {puzzle.steps}) · {time}
          </p>
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
