import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
              title="Share result"
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
    </div>
  );
}
