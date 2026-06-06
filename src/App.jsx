import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';

import Navbar from './components/layout/Navbar.jsx';
import PageWrapper from './components/layout/PageWrapper.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// ─── Pages (lazy — fetched only when the route is visited) ───────────────────
const HomePage        = lazy(() => import('./pages/Home.jsx'));
const GamesPage       = lazy(() => import('./pages/Games.jsx'));
const LoginPage       = lazy(() => import('./pages/Login.jsx'));
const SignupPage      = lazy(() => import('./pages/Signup.jsx'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard.jsx'));
const ProfilePage     = lazy(() => import('./pages/Profile.jsx'));
const AdminPage       = lazy(() => import('./pages/Admin.jsx'));

// ─── Game components (lazy — only fetched when the route is visited) ─────────
const WordleGame      = lazy(() => import('./games/wordle/WordleGame.jsx'));
const ConnectionsGame = lazy(() => import('./games/connections/ConnectionsGame.jsx'));
const NerdleGame      = lazy(() => import('./games/nerdle/NerdleGame.jsx'));
const CryptogramGame  = lazy(() => import('./games/cryptogram/CryptogramGame.jsx'));
const SudokuGame      = lazy(() => import('./games/sudoku/SudokuGame.jsx'));
const ScrewPuzzleGame = lazy(() => import('./games/screw/ScrewPuzzleGame.jsx'));
const PinPullGame     = lazy(() => import('./games/pinpull/PinPullGame.jsx'));
const NutsAndBoltsGame= lazy(() => import('./games/nutsbolts/NutsAndBoltsGame.jsx'));
const RopeUntangleGame= lazy(() => import('./games/rope/RopeUntangleGame.jsx'));
const WoodBlockGame   = lazy(() => import('./games/woodblock/WoodBlockGame.jsx'));
const SpellingBeeGame = lazy(() => import('./games/spellingbee/SpellingBeeGame.jsx'));
const NonogramGame    = lazy(() => import('./games/nonogram/NonogramGame.jsx'));
const WordLadderGame  = lazy(() => import('./games/wordladder/WordLadderGame.jsx'));
const FlowGame        = lazy(() => import('./games/flow/FlowGame.jsx'));
const WaterSortGame   = lazy(() => import('./games/watersort/WaterSortGame.jsx'));
const TileRotationGame= lazy(() => import('./games/tilerotation/TileRotationGame.jsx'));
const MinesweeperGame = lazy(() => import('./games/minesweeper/MinesweeperGame.jsx'));
const MergeGame       = lazy(() => import('./games/merge/MergeGame.jsx'));
const EmojiPhraseGame = lazy(() => import('./games/emojiphrase/EmojiPhraseGame.jsx'));
const Game2048        = lazy(() => import('./games/twentyfortyeight/Game2048.jsx'));
const LogoGuessGame   = lazy(() => import('./games/logoguess/LogoGuessGame.jsx'));
const ZenDriveGame    = lazy(() => import('./games/zendrive/ZenDriveGame.jsx'));

// ─── Loading skeleton shown while a lazy game chunk is fetching ──────────────
function GameSkeleton() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center pt-4 px-4 pb-24">
      {/* Header skeleton */}
      <div className="w-full max-w-lg flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
        <div className="h-4 w-12 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-5 w-28 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="h-8 w-8 rounded-lg bg-white/[0.06] animate-pulse" />
      </div>

      {/* Content skeleton — generic card blocks */}
      <div className="w-full max-w-lg flex flex-col items-center gap-4 mt-4">
        <div className="w-64 h-64 rounded-2xl bg-white/[0.04] animate-pulse"
          style={{ border: '1px solid rgba(255,255,255,0.05)' }} />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-12 h-14 rounded-xl bg-white/[0.04] animate-pulse"
              style={{ border: '1px solid rgba(255,255,255,0.05)', animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
        <div className="h-3 w-48 rounded bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

// ─── Route table ─────────────────────────────────────────────────────────────
const GAME_ROUTES = [
  { path: '/games/wordle',       element: <WordleGame /> },
  { path: '/games/connections',  element: <ConnectionsGame /> },
  { path: '/games/nerdle',       element: <NerdleGame /> },
  { path: '/games/cryptogram',   element: <CryptogramGame /> },
  { path: '/games/sudoku',       element: <SudokuGame /> },
  { path: '/games/screw',        element: <ScrewPuzzleGame /> },
  { path: '/games/pinpull',      element: <PinPullGame /> },
  { path: '/games/nutsbolts',    element: <NutsAndBoltsGame /> },
  { path: '/games/rope',         element: <RopeUntangleGame /> },
  { path: '/games/woodblock',    element: <WoodBlockGame /> },
  { path: '/games/spellingbee',  element: <SpellingBeeGame /> },
  { path: '/games/nonogram',     element: <NonogramGame /> },
  { path: '/games/wordladder',   element: <WordLadderGame /> },
  { path: '/games/flow',         element: <FlowGame /> },
  { path: '/games/watersort',    element: <WaterSortGame /> },
  { path: '/games/tilerotation', element: <TileRotationGame /> },
  { path: '/games/minesweeper',  element: <MinesweeperGame /> },
  { path: '/games/merge',        element: <MergeGame /> },
  { path: '/games/emojiphrase',  element: <EmojiPhraseGame /> },
  { path: '/games/2048',         element: <Game2048 /> },
  { path: '/games/logoguess',    element: <LogoGuessGame /> },
  { path: '/games/zendrive',    element: <ZenDriveGame /> },
];

// ─── App ─────────────────────────────────────────────────────────────────────
function AppInner() {
  const init = useAuthStore(s => s.init);
  const location = useLocation();

  useEffect(() => {
    const TITLES = {
      '/':             'Crackd.live — Daily Puzzles',
      '/games':        'Games — Crackd.live',
      '/leaderboard':  'Leaderboard — Crackd.live',
      '/profile':      'Profile — Crackd.live',
      '/login':        'Login — Crackd.live',
      '/signup':       'Sign Up — Crackd.live',
      '/games/wordle':       'Wordle — Crackd.live',
      '/games/connections':  'Connections — Crackd.live',
      '/games/nerdle':       'Nerdle — Crackd.live',
      '/games/cryptogram':   'Cryptogram — Crackd.live',
      '/games/sudoku':       'Sudoku — Crackd.live',
      '/games/screw':        'Screw Puzzle — Crackd.live',
      '/games/pinpull':      'Pin Pull — Crackd.live',
      '/games/nutsbolts':    'Nuts & Bolts — Crackd.live',
      '/games/rope':         'Rope Untangle — Crackd.live',
      '/games/woodblock':    'Wood Block — Crackd.live',
      '/games/spellingbee':  'Spelling Bee — Crackd.live',
      '/games/nonogram':     'Nonogram — Crackd.live',
      '/games/wordladder':   'Word Ladder — Crackd.live',
      '/games/flow':         'Flow — Crackd.live',
      '/games/watersort':    'Water Sort — Crackd.live',
      '/games/tilerotation': 'Tile Rotation — Crackd.live',
      '/games/minesweeper':  'Minesweeper — Crackd.live',
      '/games/merge':        'Merge — Crackd.live',
      '/games/emojiphrase':  'Emoji Phrase — Crackd.live',
      '/games/2048':         '2048 — Crackd.live',
      '/games/logoguess':    'Logo Rush — Crackd.live',
      '/games/zendrive':     'Zen Drive — Crackd.live',
    };
    document.title = TITLES[location.pathname] ?? 'Crackd.live';
  }, [location.pathname]);

  useEffect(() => {
    init();

    if (import.meta.env.PROD) {
      const handler = (event) => event.preventDefault();
      window.addEventListener('unhandledrejection', handler);
      return () => window.removeEventListener('unhandledrejection', handler);
    }
  }, [init]);

  const globalFallback = (
    <div style={{
      background: '#0E0E14',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <style>{`
        @keyframes loader-crack-draw { from { stroke-dashoffset: 80; opacity: 0; } to { stroke-dashoffset: 0; opacity: 0.9; } }
        @keyframes loader-hex-pulse  { 0%,100% { opacity: 0.6; transform: scale(0.97); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes loader-fade-up    { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loader-dot        { 0%,80%,100% { opacity: 0.2; transform: scale(0.7); } 40% { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Animated logo mark */}
      <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'loader-hex-pulse 2s ease-in-out infinite' }}>
        <defs>
          <filter id="ldr-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="ldr-lime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8F55A" />
            <stop offset="100%" stopColor="#D4FF6B" />
          </linearGradient>
        </defs>
        {/* Hex shell */}
        <polygon points="50,8 91,28 91,72 50,92 9,72 9,28"
          fill="#18181F" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <polygon points="50,15 86,32 86,68 50,85 14,68 14,32"
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        {/* C letter */}
        <path d="M 63,33 A 20,20 0 1 0 63,67"
          stroke="#F0EEE6" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Crack bloom */}
        <line x1="45" y1="27" x2="59" y2="73"
          stroke="#C8F55A" strokeWidth="7" strokeLinecap="round" opacity="0.07" />
        {/* Crack main — animates in */}
        <line x1="45" y1="27" x2="59" y2="73"
          stroke="url(#ldr-lime)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="80" filter="url(#ldr-glow)"
          style={{ animation: 'loader-crack-draw 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both' }} />
        <line x1="45" y1="27" x2="51" y2="37"
          stroke="url(#ldr-lime)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="80" filter="url(#ldr-glow)"
          style={{ animation: 'loader-crack-draw 0.5s cubic-bezier(0.22,1,0.36,1) 0.55s both' }} />
        <line x1="59" y1="63" x2="53" y2="73"
          stroke="url(#ldr-lime)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="80" filter="url(#ldr-glow)"
          style={{ animation: 'loader-crack-draw 0.5s cubic-bezier(0.22,1,0.36,1) 0.7s both' }} />
      </svg>

      {/* Wordmark */}
      <div style={{ animation: 'loader-fade-up 0.5s ease 0.2s both', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          <span style={{ color: '#F0EEE6' }}>CRACKD</span>
          <span style={{ color: '#C8F55A' }}>.LIVE</span>
        </div>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '6px', animation: 'loader-fade-up 0.4s ease 0.4s both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: '#C8F55A',
            animation: `loader-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy text-text font-sans">
      <Suspense fallback={globalFallback}>
      <Routes>
        {/* Pages with navbar — eagerly loaded */}
        <Route path="/"            element={<WithNav><PageWrapper><HomePage /></PageWrapper></WithNav>} />
        <Route path="/games"       element={<WithNav><PageWrapper><GamesPage /></PageWrapper></WithNav>} />
        <Route path="/leaderboard" element={<WithNav><PageWrapper><LeaderboardPage /></PageWrapper></WithNav>} />
        <Route path="/profile"     element={
          <WithNav>
            <ProtectedRoute>
              <PageWrapper><ProfilePage /></PageWrapper>
            </ProtectedRoute>
          </WithNav>
        } />
        <Route path="/admin"       element={
          <WithNav>
            <ProtectedRoute adminOnly>
              <PageWrapper><AdminPage /></PageWrapper>
            </ProtectedRoute>
          </WithNav>
        } />

        {/* Auth pages */}
        <Route path="/login"  element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />

        {/* Game pages — each wrapped in its own Suspense so only that game's
            chunk triggers the skeleton; other in-flight renders are unaffected. */}
        {GAME_ROUTES.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<GameSkeleton />}>
                <PageWrapper>{element}</PageWrapper>
              </Suspense>
            }
          />
        ))}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#161B25',
            color: '#E8EAF0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
          },
          success: { iconTheme: { primary: '#F5A623', secondary: '#0D0F14' } },
        }}
      />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      <div className="text-2xl font-black tracking-snug text-text mb-8">
        CRACKD.L<span className="text-amber">⚡</span>VE
      </div>

      <div className="text-8xl font-black text-white/[0.06] mb-2 leading-none select-none">
        404
      </div>

      <h1 className="text-xl font-black tracking-snug text-text mb-3">
        Page not found
      </h1>
      <p className="text-muted text-sm mb-8 max-w-xs leading-relaxed">
        That URL doesn't exist. Maybe the puzzle already reset?
      </p>

      <a
        href="/"
        className="inline-block bg-amber text-navy font-bold text-sm px-6 py-2.5 rounded-xl"
        style={{ textDecoration: 'none' }}
      >
        ← Back to Home
      </a>
    </div>
  );
}

function WithNav({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default AppInner;
