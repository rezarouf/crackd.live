import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HowToPlay, useHowToPlay } from './HowToPlay.jsx';
import HintSolveBar from './HintSolveBar.jsx';
import { toast } from './Toast.jsx';

// ─── Share helpers ────────────────────────────────────────────────────────────

/**
 * Build a share string and copy it to the clipboard.
 *
 * shareData shape (all fields optional):
 *   gameName   {string}   — displayed on first line
 *   emojiGrid  {string}   — pre-built emoji grid (e.g. from Wordle rows)
 *   score      {number}   — numeric score shown when no emojiGrid supplied
 *   maxScore   {number}   — shown alongside score as "score / maxScore"
 *   guesses    {number}   — "X guesses" line
 *   maxGuesses {number}   — shown alongside guesses
 *   time       {string}   — time string (e.g. "1:23")
 *   won        {boolean}  — appends ✓ or ✗ indicator
 *   extra      {string}   — any extra free-form line
 *   rows       {Array}    — Wordle-style row objects { states: string[] }
 *                           auto-converted to emoji grid when emojiGrid absent
 */
const STATE_EMOJI = {
  correct: '🟧',
  present: '🟦',
  absent:  '⬛',
};

function buildShareText(gameName, shareData = {}) {
  const {
    emojiGrid, rows, score, maxScore, guesses, maxGuesses,
    time, won, extra,
  } = shareData;

  const lines = [`Crackd.live — ${gameName}`];

  // Auto-build emoji grid from Wordle-style row objects if no grid supplied
  const grid = emojiGrid ?? (
    rows?.filter(r => r.states?.length)
         .map(r => r.states.map(s => STATE_EMOJI[s] ?? '⬛').join(''))
         .join('\n')
  );

  if (grid) {
    lines.push(grid);
  } else {
    // Fallback: score / guesses / time as text
    const parts = [];
    if (score !== undefined)   parts.push(maxScore !== undefined ? `${score}/${maxScore}` : String(score));
    if (guesses !== undefined) parts.push(maxGuesses !== undefined ? `${guesses}/${maxGuesses} guesses` : `${guesses} guesses`);
    if (time !== undefined)    parts.push(`⏱ ${time}`);
    if (won !== undefined)     parts.push(won ? '✓' : '✗');
    if (parts.length) lines.push(parts.join('  ·  '));
  }

  if (extra) lines.push(extra);
  lines.push('Play at crackd.live');

  return lines.join('\n');
}

export function useShareResult(gameName) {
  return useCallback((shareData = {}) => {
    const text = buildShareText(gameName, shareData);
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        // User cancelled or API unavailable — fall back to clipboard
        copyToClipboard(text);
      });
    } else {
      copyToClipboard(text);
    }
  }, [gameName]);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => toast.success('Copied to clipboard! 📋'))
    .catch(() => toast.error('Could not copy — please copy manually'));
}

// ─── Shell ────────────────────────────────────────────────────────────────────

/**
 * Shared wrapper for all game pages.
 * Handles header, HowToPlay modal, optional Hint/Solve bar, and share button.
 *
 * Extra props:
 *   onHint      – () => void   (omit to hide)
 *   onSolve     – () => void   (omit to hide)
 *   hintsUsed   – number
 *   wasSolved   – bool
 *   hintLabel   – string       (e.g. "Reveal a letter")
 *   gameOver    – bool         (disables hint/solve when true)
 *   shareData   – object       (see useShareResult / buildShareText for shape)
 *                              when provided, a share button appears in the header
 */
export default function GameShell({
  gameId, title, right, badge, children, maxWidth = 'max-w-lg',
  onHint = null, onSolve = null,
  hintsUsed = 0, wasSolved = false,
  hintLabel = 'Hint', gameOver = false,
  shareData = null,
  result = null,
  xpEarned = 0,
  isLastGame = false,
}) {
  const navigate   = useNavigate();
  const htp        = useHowToPlay();
  const shareResult = useShareResult(title);

  const handleShare = useCallback(() => {
    shareResult(shareData ?? {});
  }, [shareResult, shareData]);

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pb-24 pt-4">
      {htp.open && <HowToPlay gameId={gameId} onClose={htp.hide} />}

      {/* Header */}
      <div className={`w-full ${maxWidth} flex items-center justify-between px-4 pb-4 border-b border-white/[0.06] mb-6`}>
        <button
          onClick={() => navigate('/games')}
          className="text-muted hover:text-text text-sm font-medium transition-colors duration-150"
        >
          ← Back
        </button>

        <div className="flex flex-col items-center gap-0.5">
          <span className="font-black text-lg tracking-snug">{title}</span>
          {badge && <span className="text-xs text-muted">{badge}</span>}
        </div>

        <div className="flex items-center gap-2">
          {right}

          {/* Share button — only shown when shareData is provided or game is over */}
          {(shareData !== null || gameOver) && (
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-lg border text-muted hover:text-amber transition-[color,border-color] duration-150 flex items-center justify-center text-base"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
              title="Share your result"
            >
              📤
            </button>
          )}

          <button
            onClick={htp.show}
            className="w-8 h-8 rounded-lg border text-muted hover:text-text text-sm font-bold transition-[color,border-color] duration-150 flex items-center justify-center"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
          >?</button>
        </div>
      </div>

      {children}

      <HintSolveBar
        onHint={onHint}
        onSolve={onSolve}
        hintsUsed={hintsUsed}
        wasSolved={wasSolved}
        hintLabel={hintLabel}
        disabled={gameOver}
      />

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.05 }}
              className="w-full max-w-sm text-center"
              style={{
                background: '#161B25',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '36px 32px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              {result === 'win' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-green/12 border border-green/25 flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-[42px] font-black tracking-[-0.04em] text-text leading-none mb-2">Sharp.</h2>
                  <p className="text-muted text-[15px] mb-7">
                    {isLastGame ? 'Full set. Come back stronger.' : 'See you tomorrow.'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-red/10 border border-red/20 flex items-center justify-center mx-auto mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <h2 className="text-[42px] font-black tracking-[-0.04em] text-text leading-none mb-2">Not today.</h2>
                  <p className="text-muted text-[15px] mb-7">Tomorrow's another shot.</p>
                </>
              )}

              {xpEarned > 0 && (
                <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl mb-6"
                  style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.15)' }}>
                  <span className="text-sm text-muted font-medium">Earned today</span>
                  <span className="text-amber font-black text-base">+{xpEarned} XP</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {shareData !== null && (
                  <button
                    onClick={handleShare}
                    className="w-full py-3 rounded-xl text-sm font-bold border transition-[border-color,color] duration-150 text-muted hover:text-text"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                  >
                    Share your result
                  </button>
                )}
                <button
                  onClick={() => navigate('/games')}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-navy transition-opacity duration-150 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #E8A020, #FFB84D)', boxShadow: '0 0 24px rgba(232,160,32,0.25)' }}
                >
                  Next challenge →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
