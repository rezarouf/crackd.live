import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCryptogram } from './useCryptogram.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { HowToPlay, useHowToPlay } from '../../components/ui/HowToPlay.jsx';
import HintSolveBar from '../../components/ui/HintSolveBar.jsx';
import { Lock } from 'lucide-react';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function CryptogramGame({ difficulty = 'Medium' }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const htp = useHowToPlay();
  const game = useCryptogram({ difficulty, hintsAllowed: difficulty === 'Easy' ? 2 : difficulty === 'Hard' ? 0 : 1 });

  if (game.won && !showModal) setTimeout(() => setShowModal(true), 500);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4 px-4">
      {htp.open && <HowToPlay gameId="cryptogram" onClose={htp.hide} />}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <button onClick={() => navigate('/games')} className="text-muted hover:text-text text-sm font-medium transition-colors duration-150">← Back</button>
        <span className="font-black text-lg tracking-snug">Cryptogram</span>
        <div className="flex items-center gap-2">
          <button onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>?</button>
          <span className="text-xs text-muted font-mono">{game.hintsAllowed - game.hintsUsed} hints left</span>
        </div>
      </div>

      <p className="text-xs text-muted mb-8 text-center">
        Click an encoded letter, then type the real letter to decode the quote
      </p>

      {/* Encoded quote display */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex flex-wrap gap-x-4 gap-y-6 justify-center font-mono">
          {game.words.map((word, wi) => (
            <div key={wi} className="flex gap-1">
              {word.split('').map((encodedChar, ci) => {
                const isAlpha = /^[A-Z]$/.test(encodedChar);
                const isSel = game.selectedEncoded === encodedChar;
                const isSolved = isAlpha && game.solved[encodedChar];
                const isCorrect = isAlpha && game.isCorrect(encodedChar);

                return (
                  <div key={ci} className="flex flex-col items-center gap-0.5">
                    {/* Decoded letter box */}
                    <motion.button
                      onClick={() => game.selectLetter(encodedChar)}
                      disabled={!isAlpha}
                      whileTap={{ scale: isAlpha ? 0.92 : 1 }}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold border
                        transition-[background-color,border-color] duration-150
                        ${!isAlpha ? 'bg-transparent border-transparent cursor-default' :
                          isSel ? 'bg-amber/20 border-amber/60 text-amber' :
                          isCorrect ? 'bg-green/10 border-green/30 text-green' :
                          isSolved ? 'bg-blue/10 border-blue/30 text-blue' :
                          'bg-white/5 border-white/15 text-text hover:bg-white/10'
                        }`}
                    >
                      {isAlpha ? (game.getDisplayChar(encodedChar, ci) || '_') : ''}
                    </motion.button>
                    {/* Encoded letter */}
                    <span className={`text-xs font-mono ${!isAlpha ? 'text-muted' : 'text-muted/60'}`}>
                      {encodedChar}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted mt-6">— {game.quote.author}</p>
      </div>

      {/* Alphabet keyboard */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
        {ALPHA.map(letter => (
          <motion.button
            key={letter}
            onClick={() => game.typeLetter(letter)}
            whileTap={{ scale: 0.9 }}
            disabled={!game.selectedEncoded || game.gameOver}
            className={`w-10 h-10 rounded-lg font-mono font-bold text-sm border
              ${!game.selectedEncoded ? 'bg-white/[0.03] border-white/5 text-muted/50 cursor-not-allowed' :
                'bg-white/7 border-white/10 text-text hover:bg-amber/10 hover:border-amber/30 hover:text-amber'}
              transition-[background-color,border-color,color] duration-150`}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      <HintSolveBar onHint={game.hint} onSolve={game.solve} hintsUsed={game.hintsUsed} wasSolved={game.wasSolved} hintLabel="Reveal a letter" disabled={game.gameOver} />

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Lock size={28} color="#F5A623" />
          </div>
          <h2 className="text-2xl font-black tracking-snug mb-2 text-amber">Decoded!</h2>
          <p className="text-muted text-sm italic mb-2">"{game.quote.text}"</p>
          <p className="text-muted text-xs mb-6">— {game.quote.author}</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>View Quote</Button>
            <Button variant="primary" className="flex-1" onClick={() => navigate('/games')}>More Games →</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
