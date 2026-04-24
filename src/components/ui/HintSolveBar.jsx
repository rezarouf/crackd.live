import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Bot } from 'lucide-react';

/**
 * Shared hint / solve bar used by every game.
 *
 * Props:
 *   onHint   – () => void  | null to hide Hint button
 *   onSolve  – () => void  | null to hide Solve button
 *   hintsUsed – number
 *   wasSolved – bool
 *   hintLabel – string  (optional override, e.g. "Reveal a letter")
 *   disabled  – bool    (game already over)
 */
export default function HintSolveBar({
  onHint   = null,
  onSolve  = null,
  hintsUsed  = 0,
  wasSolved  = false,
  hintLabel  = 'Hint',
  disabled   = false,
}) {
  const [confirmSolve, setConfirmSolve] = useState(false);

  if (!onHint && !onSolve) return null;

  const hintPenalty = Math.min(75, (hintsUsed + 1) * 25);
  const nextHintXP  = `−${hintPenalty}% XP`;

  function handleSolve() {
    if (!confirmSolve) { setConfirmSolve(true); return; }
    setConfirmSolve(false);
    onSolve?.();
  }

  return (
    <div className="w-full max-w-lg px-4 mt-5">
      {/* Status badges */}
      <AnimatePresence>
        {(hintsUsed > 0 || wasSolved) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex justify-center gap-2 mb-3"
          >
            {wasSolved && (
              <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Bot size={11} /> Auto-solved · −90% XP
              </span>
            )}
            {!wasSolved && hintsUsed > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5" style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.25)' }}>
                <Lightbulb size={11} /> {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used · −{Math.min(75, hintsUsed * 25)}% XP
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 justify-center">
        {/* Hint button */}
        {onHint && (
          <button
            onClick={() => !disabled && onHint()}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-[opacity,background] duration-150"
            style={{
              background: 'rgba(245,166,35,0.08)',
              border: '1px solid rgba(245,166,35,0.2)',
              color: disabled ? '#4A5568' : '#F5A623',
              opacity: disabled ? 0.4 : 1,
            }}
            title={`Use a hint (${nextHintXP} from your XP)`}
          >
            <Lightbulb size={14} /> {hintLabel}
            <span className="text-[10px] font-black opacity-60">{nextHintXP}</span>
          </button>
        )}

        {/* Solve button */}
        {onSolve && (
          <AnimatePresence mode="wait">
            {confirmSolve ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-muted font-bold">−90% XP. Sure?</span>
                <button
                  onClick={handleSolve}
                  className="px-3 py-2 rounded-xl text-xs font-black"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}
                >
                  Yes, solve it
                </button>
                <button
                  onClick={() => setConfirmSolve(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-muted"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="solve"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={handleSolve}
                disabled={disabled}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-[opacity] duration-150"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  color: disabled ? '#4A5568' : '#EF4444',
                  opacity: disabled ? 0.4 : 1,
                }}
                title="Auto-solve this puzzle (−90% XP)"
              >
                <Bot size={14} /> Solve
                <span className="text-[10px] font-black opacity-60">−90% XP</span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
