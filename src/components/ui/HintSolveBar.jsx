import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Bot } from 'lucide-react';

/**
 * Shared hint / solve bar used by every game.
 *
 * Props:
 *   onHint    – () => void  | null to hide Hint button
 *   onSolve   – () => void  | null to hide Solve button
 *   hintsUsed – number
 *   wasSolved – bool
 *   hintLabel – string   (optional override, e.g. "Reveal a letter")
 *   disabled  – bool     (game already over)
 *   solution  – string   (optional — shown during the reveal window so
 *                         the player can read the answer before the overlay)
 */
export default function HintSolveBar({
  onHint    = null,
  onSolve   = null,
  hintsUsed = 0,
  wasSolved = false,
  hintLabel = 'Hint',
  disabled  = false,
  solution  = null,
}) {
  const [confirmSolve, setConfirmSolve] = useState(false);
  const [revealing,    setRevealing]    = useState(false);
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!onHint && !onSolve) return null;

  const hintPenalty = Math.min(75, (hintsUsed + 1) * 25);
  const nextHintXP  = `−${hintPenalty}% XP`;

  function handleConfirmSolve() {
    setConfirmSolve(false);
    setRevealing(true);
    // Give the board 1.5 s to animate the solution before the overlay fires.
    timerRef.current = setTimeout(() => {
      setRevealing(false);
      onSolve?.();
    }, 1500);
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
              <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Bot size={11} />
                Auto-solved · −90% XP
                {solution && (
                  <span style={{ color: '#F0F0F0', marginLeft: 4 }}>· {solution}</span>
                )}
              </span>
            )}
            {!wasSolved && hintsUsed > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.25)' }}>
                <Lightbulb size={11} /> {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} used · −{Math.min(75, hintsUsed * 25)}% XP
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealing banner — shown for 1.5 s while board animates */}
      <AnimatePresence>
        {revealing && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-1 mb-3 py-3 px-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <span className="text-xs text-muted font-semibold tracking-wide uppercase">Solution</span>
            {solution ? (
              <span className="text-xl font-black tracking-widest"
                style={{ color: '#F0F0F0', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
                {solution.toUpperCase()}
              </span>
            ) : (
              <span className="text-sm font-bold" style={{ color: '#EF4444' }}>Revealing…</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons — stack on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">

        {/* Hint button — outlined amber */}
        {onHint && (
          <motion.button
            whileTap={{ scale: (disabled || revealing) ? 1 : 0.97 }}
            onClick={() => !disabled && !revealing && onHint()}
            disabled={disabled || revealing}
            title={`Use a hint (${nextHintXP} from your XP)`}
            style={{
              minHeight: '48px',
              background: 'transparent',
              border: `1.5px solid ${(disabled || revealing) ? 'rgba(245,166,35,0.2)' : 'rgba(245,166,35,0.5)'}`,
              color: (disabled || revealing) ? 'rgba(245,166,35,0.35)' : '#F5A623',
              borderRadius: '14px',
              cursor: (disabled || revealing) ? 'not-allowed' : 'pointer',
              transition: 'background 150ms, border-color 150ms, box-shadow 150ms',
            }}
            onMouseEnter={e => {
              if (!disabled && !revealing) {
                e.currentTarget.style.background = 'rgba(245,166,35,0.08)';
                e.currentTarget.style.borderColor = 'rgba(245,166,35,0.8)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(245,166,35,0.12)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = (disabled || revealing) ? 'rgba(245,166,35,0.2)' : 'rgba(245,166,35,0.5)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseDown={e => { if (!disabled && !revealing) e.currentTarget.style.background = 'rgba(245,166,35,0.14)'; }}
            onMouseUp={e =>   { if (!disabled && !revealing) e.currentTarget.style.background = 'rgba(245,166,35,0.08)'; }}
            className="flex items-center justify-center gap-2.5 px-5 w-full sm:flex-1 font-bold text-sm"
          >
            <Lightbulb size={15} />
            <span>{hintLabel}</span>
            <span style={{ fontSize: '11px', fontWeight: 800, opacity: (disabled || revealing) ? 0.4 : 0.7, fontFamily: 'JetBrains Mono, monospace' }}>
              {nextHintXP}
            </span>
          </motion.button>
        )}

        {/* Solve button — filled amber */}
        {onSolve && (
          <AnimatePresence mode="wait">
            {revealing ? (
              // Locked while board is animating
              <motion.div
                key="revealing-btn"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full sm:flex-1 rounded-2xl font-bold text-sm"
                style={{ minHeight: '48px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              >
                <Bot size={15} className="mr-2" /> Solving…
              </motion.div>
            ) : confirmSolve ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 w-full sm:flex-1"
                style={{ minHeight: '48px' }}
              >
                <span className="text-xs text-muted font-bold whitespace-nowrap">−90% XP. Sure?</span>
                <button
                  onClick={handleConfirmSolve}
                  className="flex-1 rounded-xl text-xs font-black transition-[background] duration-150"
                  style={{ minHeight: '44px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                >
                  Yes, solve it
                </button>
                <button
                  onClick={() => setConfirmSolve(false)}
                  className="flex-1 rounded-xl text-xs font-bold text-muted transition-[background] duration-150"
                  style={{ minHeight: '44px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="solve"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileTap={{ scale: disabled ? 1 : 0.97 }}
                onClick={() => !disabled && setConfirmSolve(true)}
                disabled={disabled}
                title="Auto-solve this puzzle (−90% XP)"
                style={{
                  minHeight: '48px',
                  background: disabled ? 'rgba(245,166,35,0.15)' : 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  color: disabled ? 'rgba(13,15,20,0.4)' : '#0D0F14',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  boxShadow: disabled ? 'none' : '0 4px 16px rgba(245,166,35,0.25)',
                  transition: 'opacity 150ms, box-shadow 150ms',
                  opacity: disabled ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 6px 24px rgba(245,166,35,0.4)'; }}
                onMouseLeave={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,166,35,0.25)'; }}
                onMouseDown={e => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
                onMouseUp={e =>   { if (!disabled) e.currentTarget.style.opacity = '1'; }}
                className="flex items-center justify-center gap-2.5 px-5 w-full sm:flex-1 font-bold text-sm"
              >
                <Bot size={15} />
                <span>Solve</span>
                <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.6, fontFamily: 'JetBrains Mono, monospace' }}>
                  −90% XP
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
