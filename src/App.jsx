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
      background: '#0D0F14',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <style>{`@keyframes crackd-pulse{0%,100%{opacity:.7;transform:scale(.97)}50%{opacity:1;transform:scale(1)}}`}</style>
      <div style={{
        fontSize: '2rem',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: '#F5A623',
        animation: 'crackd-pulse 1.4s ease-in-out infinite',
      }}>
        CRACKD.L<span style={{ color: '#F5A623' }}>⚡</span>VE
      </div>
      <span style={{ fontSize: '13px', color: '#8B95A1', fontWeight: 500, letterSpacing: '0.04em' }}>
        Loading...
      </span>
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
