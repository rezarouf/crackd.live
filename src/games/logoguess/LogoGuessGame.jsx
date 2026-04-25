import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, SkipForward, Trophy, Share2 } from 'lucide-react';
import { useLogoGuess } from './useLogoGuess.js';

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#22C55E', filter: 'blur(3px)',                              desc: 'Logo ~70% visible' },
  medium: { label: 'Medium', color: '#F5A623', filter: 'blur(9px) brightness(0.85)',             desc: 'Logo ~40% visible' },
  hard:   { label: 'Hard',   color: '#EF4444', filter: 'blur(20px) brightness(0.6) saturate(0.3)', desc: 'Logo ~15% visible' },
};

// ── Start Screen ─────────────────────────────────────────────────────────────
function StartScreen({ onSelect, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16"
      style={{ background: '#0D0F14' }}>

      <button onClick={onBack}
        className="self-start ml-2 mb-8 text-sm font-medium flex items-center gap-1.5"
        style={{ color: '#8B95A1' }}>
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)' }}>
          🏷️
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#F0F0F0' }}>
            Logo Rush
          </h1>
          <p className="text-sm font-medium" style={{ color: '#8B95A1' }}>
            How far can your streak go?
          </p>
        </div>
      </div>

      <p className="text-center text-sm mb-10 max-w-xs leading-relaxed" style={{ color: '#8B95A1' }}>
        Identify blurred brand logos as fast as you can. One wrong answer ends your streak.
      </p>

      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#F5A623' }}>
        Choose difficulty
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(key)}
            className="w-full rounded-2xl px-5 py-4 flex items-center justify-between text-left"
            style={{
              background: '#161B25',
              border: `1.5px solid rgba(255,255,255,0.07)`,
              cursor: 'pointer',
              minHeight: '64px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '55'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            <div>
              <div className="font-black text-base" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8B95A1' }}>{cfg.desc}</div>
            </div>
            <span className="text-xl">
              {key === 'easy' ? '😊' : key === 'medium' ? '🤔' : '😤'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Logo Display ─────────────────────────────────────────────────────────────
function LogoDisplay({ logo, filter, flash }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [logo?.logo]);

  const flashBg = flash === 'correct'
    ? 'rgba(34,197,94,0.25)'
    : flash === 'wrong'
    ? 'rgba(239,68,68,0.25)'
    : 'transparent';

  return (
    <div className="relative rounded-3xl overflow-hidden flex items-center justify-center"
      style={{
        width: '100%', maxWidth: 320, aspectRatio: '1 / 1',
        background: '#161B25',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'background 0.2s',
      }}>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '24px',
              background: flashBg, zIndex: 10, pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* White logo pad */}
      <div className="rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ width: '72%', height: '72%', background: '#FFFFFF' }}>
        {imgError ? (
          <div className="flex items-center justify-center w-full h-full"
            style={{ fontSize: 56, fontWeight: 900, color: '#F5A623', fontFamily: 'Inter, sans-serif' }}>
            {logo?.name?.[0] ?? '?'}
          </div>
        ) : (
          <img
            key={logo?.logo}
            src={logo?.logo}
            alt="Brand logo"
            onError={() => setImgError(true)}
            draggable={false}
            style={{
              width: '80%', height: '80%',
              objectFit: 'contain',
              filter,
              transition: 'filter 0.3s ease',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Game Screen ───────────────────────────────────────────────────────────────
function GameScreen({ game, difficulty, onBack }) {
  const inputRef = useRef(null);
  const { color, label, filter } = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    if (!game.gameOver && !game.flash) {
      inputRef.current?.focus();
    }
  }, [game.current, game.gameOver, game.flash]);

  function handleKey(e) {
    if (e.key === 'Enter') game.handleGuess();
  }

  return (
    <div className="min-h-screen flex flex-col items-center pb-24 pt-4 overflow-x-hidden"
      style={{ background: '#0D0F14' }}>

      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between px-4 pb-4 mb-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack}
          className="text-sm font-medium flex items-center gap-1.5"
          style={{ color: '#8B95A1', minHeight: '44px' }}>
          ← Back
        </button>

        <div className="flex items-center gap-2">
          <span className="font-black text-lg" style={{ color: '#F0F0F0' }}>Logo Rush</span>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: color + '18', color, border: `1px solid ${color}40` }}>
            {label}
          </span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)' }}>
          <Flame size={14} color="#F5A623" />
          <span className="font-black text-base" style={{ color: '#F5A623', fontFamily: 'JetBrains Mono, monospace' }}>
            {game.streak}
          </span>
        </div>
      </div>

      {/* Logo */}
      <div className="px-6 mb-8 flex justify-center w-full">
        <LogoDisplay logo={game.current} filter={filter} flash={game.flash} />
      </div>

      {/* Correct / Wrong feedback text */}
      <AnimatePresence mode="wait">
        {game.flash && (
          <motion.p
            key={game.flash}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm font-bold mb-3"
            style={{ color: game.flash === 'correct' ? '#22C55E' : '#EF4444' }}>
            {game.flash === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="w-full max-w-sm px-4 mb-4">
        <input
          ref={inputRef}
          value={game.input}
          onChange={e => game.setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={!!game.flash}
          placeholder="Type the brand name…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full rounded-2xl px-5 py-3.5 text-base font-semibold text-center outline-none"
          style={{
            background: '#161B25',
            border: `1.5px solid ${game.flash === 'correct' ? '#22C55E' : game.flash === 'wrong' ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
            color: '#F0F0F0',
            caretColor: '#F5A623',
            minHeight: '52px',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm px-4 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={game.handleGuess}
          disabled={!!game.flash || !game.input.trim()}
          className="flex-1 rounded-2xl font-black text-sm flex items-center justify-center"
          style={{
            minHeight: '52px',
            background: (!game.flash && game.input.trim())
              ? 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)'
              : 'rgba(245,166,35,0.15)',
            color: (!game.flash && game.input.trim()) ? '#0D0F14' : 'rgba(245,166,35,0.35)',
            boxShadow: (!game.flash && game.input.trim()) ? '0 4px 16px rgba(245,166,35,0.3)' : 'none',
            transition: 'background 150ms, box-shadow 150ms, color 150ms',
            cursor: (!game.flash && game.input.trim()) ? 'pointer' : 'not-allowed',
          }}>
          Submit
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={game.handleSkip}
          disabled={!!game.flash}
          className="rounded-2xl font-bold text-sm flex items-center justify-center gap-1.5 px-4"
          style={{
            minHeight: '52px',
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.1)',
            color: game.flash ? 'rgba(139,149,161,0.3)' : '#8B95A1',
            cursor: game.flash ? 'not-allowed' : 'pointer',
            transition: 'border-color 150ms, color 150ms',
          }}
          onMouseEnter={e => { if (!game.flash) { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = '#EF4444'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = game.flash ? 'rgba(139,149,161,0.3)' : '#8B95A1'; }}>
          <SkipForward size={14} />
          Skip
        </motion.button>
      </div>

      <p className="text-xs mt-6" style={{ color: 'rgba(139,149,161,0.5)' }}>
        Skip ends your streak
      </p>
    </div>
  );
}

// ── Game Over Screen ──────────────────────────────────────────────────────────
function GameOverScreen({ streak, difficulty, onShare, onRestart, onSameDifficulty }) {
  const { color, label } = DIFFICULTY_CONFIG[difficulty];
  const medal = streak >= 20 ? '🥇' : streak >= 10 ? '🥈' : streak >= 5 ? '🥉' : '🏁';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-16"
      style={{ background: '#0D0F14' }}>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center text-center"
        style={{ background: '#161B25', border: '1px solid rgba(255,255,255,0.07)' }}>

        <div className="text-6xl mb-4">{medal}</div>

        <h2 className="text-2xl font-black mb-1" style={{ color: '#F0F0F0' }}>
          {streak === 0 ? 'No streak!' : 'Streak ended!'}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#8B95A1' }}>
          {streak === 0
            ? 'Better luck next time — give it another shot!'
            : `You identified ${streak} logo${streak !== 1 ? 's' : ''} in a row!`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="rounded-2xl p-4" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame size={14} color="#F5A623" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8B95A1' }}>Streak</span>
            </div>
            <div className="text-3xl font-black" style={{ color: '#F5A623', fontFamily: 'JetBrains Mono, monospace' }}>
              {streak}
            </div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Trophy size={14} color={color} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8B95A1' }}>Mode</span>
            </div>
            <div className="text-lg font-black" style={{ color }}>
              {label}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onShare}
            className="w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{
              minHeight: '52px',
              background: 'linear-gradient(135deg, #F5A623 0%, #FFB84D 100%)',
              color: '#0D0F14',
              boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
              cursor: 'pointer',
            }}>
            <Share2 size={15} />
            Share Result
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSameDifficulty}
            className="w-full rounded-2xl font-bold text-sm"
            style={{
              minHeight: '52px',
              background: 'rgba(245,166,35,0.08)',
              border: '1.5px solid rgba(245,166,35,0.2)',
              color: '#F5A623',
              cursor: 'pointer',
            }}>
            Play Again
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onRestart}
            className="w-full rounded-2xl font-bold text-sm"
            style={{
              minHeight: '52px',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.08)',
              color: '#8B95A1',
              cursor: 'pointer',
            }}>
            Change Difficulty
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function LogoGuessGame() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(null);
  const game = useLogoGuess(difficulty ?? 'medium');

  function handleSelectDifficulty(d) {
    game.newGame();
    setDifficulty(d);
  }

  function handleSameDifficulty() {
    game.newGame();
  }

  function handleChangeDifficulty() {
    game.newGame();
    setDifficulty(null);
  }

  if (!difficulty) {
    return <StartScreen onSelect={handleSelectDifficulty} onBack={() => navigate('/games')} />;
  }

  if (game.gameOver) {
    return (
      <GameOverScreen
        streak={game.streak}
        difficulty={difficulty}
        onShare={game.shareResult}
        onRestart={handleChangeDifficulty}
        onSameDifficulty={handleSameDifficulty}
      />
    );
  }

  return (
    <GameScreen
      game={game}
      difficulty={difficulty}
      onBack={() => navigate('/games')}
    />
  );
}
