import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from '../../components/ui/GameShell.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { useEmojiPhrase } from './useEmojiPhrase.js';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Frown } from 'lucide-react';

const FEEDBACK_STYLE = {
  correct: { bg: '#F5A623', color: '#0D0F14' },
  present: { bg: '#4A9EFF', color: '#fff' },
  absent:  { bg: '#2A2F3A', color: '#8B95A1' },
};

export default function EmojiPhraseGame() {
  const navigate = useNavigate();
  const { phrase, answer, guesses, input, setInput, won, gameOver, hintsUsed, wasSolved, hintText, MAX_GUESSES, time, submit, hint, solve, getLetterFeedback } = useEmojiPhrase();
  const [showModal, setShowModal] = useState(false);
  if (gameOver && !showModal) setTimeout(() => setShowModal(true), 600);

  return (
    <GameShell gameId="emojiphrase" title="Emoji Phrase" badge={`${guesses.length}/${MAX_GUESSES}`}
      onHint={hint} onSolve={solve} hintsUsed={hintsUsed} wasSolved={wasSolved}
      hintLabel="Get a clue" gameOver={gameOver}>
      <div className="w-full max-w-sm px-4">
        {/* Emoji display */}
        <div className="flex justify-center text-5xl gap-2 mb-2 py-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {phrase.emojis}
        </div>

        {hintText && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-bold text-amber my-3"
          >
            {hintText}
          </motion.div>
        )}

        {/* Answer length display */}
        <div className="flex justify-center gap-1 my-4 flex-wrap">
          {answer.split('').map((ch, i) => (
            <div
              key={i}
              className="w-8 h-8 flex items-center justify-center font-black text-sm font-mono rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0F0F0' }}
            >
              {ch === ' ' ? ' ' : '_'}
            </div>
          ))}
        </div>

        {/* Previous guesses */}
        <div className="space-y-2 mb-4">
          {guesses.map((guess, gi) => {
            const feedback = getLetterFeedback(guess);
            const padded = guess.split('');
            while (padded.length < answer.length) padded.push(' ');
            return (
              <div key={gi} className="flex gap-1 flex-wrap justify-center">
                {padded.map((ch, ci) => {
                  const fb = feedback[ci] || 'absent';
                  const style = FEEDBACK_STYLE[fb];
                  return (
                    <div
                      key={ci}
                      className="w-7 h-7 flex items-center justify-center font-black text-xs rounded-lg"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {ch}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Input */}
        {!gameOver && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="Your answer..."
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-transparent outline-none uppercase"
                style={{ border: '2px solid rgba(255,255,255,0.15)', color: '#F0F0F0' }}
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
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: won ? 'rgba(245,166,35,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${won ? 'rgba(245,166,35,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {won ? <Sparkles size={28} color="#F5A623" /> : <Frown size={28} color="#EF4444" />}
          </div>
          <h2 className={`text-3xl font-black tracking-snug mb-2 ${won ? 'text-amber' : 'text-red'}`}>
            {won ? 'Decoded!' : 'Not quite'}
          </h2>
          <p className="text-muted mb-2">
            {won ? `Solved in ${guesses.length} guess${guesses.length > 1 ? 'es' : ''}!` : `The answer was:`}
          </p>
          {!won && <p className="font-black text-xl text-text mb-4">{answer}</p>}
          <Button variant="primary" onClick={() => navigate('/games')}>More Games →</Button>
        </div>
      </Modal>
    </GameShell>
  );
}
