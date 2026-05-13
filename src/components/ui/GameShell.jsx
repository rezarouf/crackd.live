import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Share2, HelpCircle, Flame } from 'lucide-react';
import { HowToPlay, useHowToPlay } from './HowToPlay.jsx';
import HintSolveBar from './HintSolveBar.jsx';
import { toast } from './Toast.jsx';

// â”€â”€ Share helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATE_EMOJI = { correct: 'ðŸŸ§', present: 'ðŸŸ¦', absent: 'â¬›' };

function buildShareText(gameName, shareData = {}) {
  const { emojiGrid, rows, score, maxScore, guesses, maxGuesses, time, won, extra } = shareData;
  const lines = [`Crackd.live â€” ${gameName}`];
  const grid = emojiGrid ?? (
    rows?.filter(r => r.states?.length)
         .map(r => r.states.map(s => STATE_EMOJI[s] ?? 'â¬›').join(''))
         .join('\n')
  );
  if (grid) { lines.push(grid); }
  else {
    const parts = [];
    if (score    !== undefined) parts.push(maxScore    !== undefined ? `${score}/${maxScore}`       : String(score));
    if (guesses  !== undefined) parts.push(maxGuesses  !== undefined ? `${guesses}/${maxGuesses} guesses` : `${guesses} guesses`);
    if (time     !== undefined) parts.push(`â± ${time}`);
    if (won      !== undefined) parts.push(won ? 'âœ“' : 'âœ—');
    if (parts.length) lines.push(parts.join('  Â·  '));
  }
  if (extra) lines.push(extra);
  lines.push('Play at crackd.live');
  return lines.join('\n');
}

export function useShareResult(gameName) {
  return useCallback((shareData = {}) => {
    const text = buildShareText(gameName, shareData);
    if (navigator.share) {
      navigator.share({ text }).catch(() => copyToClipboard(text));
    } else {
      copyToClipboard(text);
    }
  }, [gameName]);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => toast.success('Copied to clipboard!'))
    .catch(() => toast.error('Could not copy â€” please copy manually'));
}

// â”€â”€ Animated checkmark â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnimatedCheck() {
  return (
    <div className="relative w-20 h-20 mx-auto mb-8">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'rgba(200,245,90,0.08)',
          border: '1px solid rgba(200,245,90,0.22)',
          animation: 'pulseGlow 2.5s ease-in-out infinite',
        }}
      />
      {/* Inner circle */}
      <div
        className="absolute inset-2 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(200,245,90,0.07)', border: '1px solid rgba(200,245,90,0.18)' }}
      >
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <polyline
            points="8,20 17,29 32,11"
            stroke="#C8F55A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="100"
            style={{ animation: 'drawCheck 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}
          />
        </svg>
      </div>
    </div>
  );
}

// â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function GameShellSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center pb-24 pt-4" style={{ background: '#0E0E14' }}>
      <div className="w-full max-w-lg px-4 pb-4 mb-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="skeleton w-32 h-5 rounded" />
        <div className="skeleton w-8 h-8 rounded-lg" />
      </div>
      <div className="w-full max-w-lg px-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}

// â”€â”€ Shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function GameShell({
  gameId, title, right, badge, children, maxWidth = 'max-w-lg',
  onHint = null, onSolve = null,
  hintsUsed = 0, wasSolved = false,
  hintLabel = 'Hint', gameOver = false,
  shareData = null,
  result = null,
  xpEarned = 0,
  isLastGame = false,
  streak = 0,
}) {
  const navigate     = useNavigate();
  const htp          = useHowToPlay();
  const shareResult  = useShareResult(title);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    shareResult(shareData ?? {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareResult, shareData]);

  return (
    <div className="min-h-screen flex flex-col items-center pb-24 pt-4" style={{ background: '#0E0E14' }}>
      {htp.open && <HowToPlay gameId={gameId} onClose={htp.hide} />}

      {/* â”€â”€ Header â”€â”€ */}
      <div
        className={`w-full ${maxWidth} flex items-center justify-between px-4 pb-4 mb-6`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/games')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-[color,background-color] duration-150"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FAFAFA'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <ArrowLeft size={16} />
        </button>

        {/* Center */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-display font-bold text-lg text-text tracking-snug">{title}</span>
          {badge && <span className="text-xs text-muted">{badge}</span>}
          {streak > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Flame size={11} className="text-amber" />
              <span className="text-[11px] font-black text-amber">{streak}d streak</span>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {right}
          {(shareData !== null || gameOver) && (
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-[color,border-color] duration-150"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              title="Share your result"
              onMouseEnter={e => { e.currentTarget.style.color = '#C8F55A'; e.currentTarget.style.borderColor = 'rgba(200,245,90,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <Share2 size={15} />
            </button>
          )}
          <button
            onClick={htp.show}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted transition-[color,border-color] duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FAFAFA'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <HelpCircle size={15} />
          </button>
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

      {/* â”€â”€ Result overlay â”€â”€ */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(8,9,9,0.90)', backdropFilter: 'blur(24px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.06 }}
              className="w-full max-w-sm text-center"
              style={{
                background: '#18181F',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20,
                padding: '36px 28px 28px',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {result === 'win' ? (
                <>
                  <AnimatedCheck />
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="font-display font-bold text-gradient-gold mb-2"
                    style={{ fontSize: 52, letterSpacing: '-0.04em', lineHeight: 1 }}
                  >
                    Sharp.
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-muted text-[15px] mb-6"
                  >
                    {isLastGame ? 'Full set. Come back stronger.' : 'See you tomorrow.'}
                  </motion.p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.18)' }}>
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                      <line x1="10" y1="10" x2="30" y2="30" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
                      <line x1="30" y1="10" x2="10" y2="30" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="font-display font-bold text-text mb-2"
                    style={{ fontSize: 48, letterSpacing: '-0.04em', lineHeight: 1 }}>
                    Not today.
                  </h2>
                  <p className="text-muted text-[15px] mb-6">Tomorrow's another shot.</p>
                </>
              )}

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2.5 mb-7"
              >
                {xpEarned > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(200,245,90,0.07)', border: '1px solid rgba(200,245,90,0.14)' }}>
                    <span className="text-sm text-muted font-medium">Earned today</span>
                    <span className="font-black text-amber text-base">+{xpEarned} XP</span>
                  </div>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-2.5"
              >
                {shareData !== null && (
                  <button
                    onClick={handleShare}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-[border-color,color,background-color] duration-150"
                    style={{
                      background: copied ? 'rgba(200,245,90,0.07)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${copied ? 'rgba(200,245,90,0.22)' : 'rgba(255,255,255,0.10)'}`,
                      color: copied ? '#C8F55A' : '#7A7A8C',
                    }}
                  >
                    {copied ? 'Copied! âœ“' : 'Share your result'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/games')}
                  className="w-full py-3.5 rounded-xl text-sm font-black text-inverse transition-opacity duration-150 hover:opacity-90"
                  style={{
                    background: '#C8F55A',
                    boxShadow: '0 0 0 1px rgba(200,245,90,0.25), 0 4px 20px rgba(200,245,90,0.18)',
                  }}
                >
                  Next challenge â†’
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
