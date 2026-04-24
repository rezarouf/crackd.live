import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { getLevelInfo } from '../../lib/utils.js';
import { useDailyChallenge } from '../../hooks/useDailyChallenge.js';
import { LogoMark } from '../ui/Logo.jsx';
import { Flame, User, Trophy, LogOut } from 'lucide-react';

const NAV_LINKS = [
  { to: '/games',       label: 'Games'       },
  { to: '/leaderboard', label: 'Leaderboard' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const { streaks } = useGameStore();
  const { completedCount, totalGames } = useDailyChallenge();
  const navigate  = useNavigate();
  const location  = useLocation();

  const overallStreak = Math.max(0, ...Object.values(streaks));
  const xp    = profile?.xp || 0;
  const level = getLevelInfo(xp);
  const progressPct = completedCount / totalGames * 100;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location]);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 h-16"
        animate={{
          backgroundColor: scrolled ? 'rgba(13,15,20,0.92)' : 'rgba(13,15,20,0)',
          borderBottomColor: scrolled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0)',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(0px)',
        }}
        transition={{ duration: 0.25 }}
        style={{ borderBottom: '1px solid' }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity duration-150">
            <LogoMark iconSize={34} />
          </Link>

          {/* Center nav — desktop */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            {NAV_LINKS.map(link => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-[color] duration-150
                    ${active ? 'text-navy' : 'text-muted hover:text-text'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-amber rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">

            {/* Daily progress ring */}
            {completedCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <svg className="w-4 h-4 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5"/>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#F5A623" strokeWidth="3.5"
                    strokeDasharray={`${2 * Math.PI * 12}`}
                    strokeDashoffset={`${2 * Math.PI * 12 * (1 - progressPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs font-bold text-amber tabular-nums">{completedCount}/10</span>
              </div>
            )}

            {/* Streak */}
            {overallStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber/8 border border-amber/15">
                <Flame size={14} className="text-amber" />
                <span className="text-xs font-black text-amber tabular-nums">{overallStreak}</span>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-[border-color] duration-150"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-lg font-black text-xs text-navy flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}99)` }}
                  >
                    {(profile?.username || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[12px] font-bold text-text leading-none mb-0.5">
                      {profile?.username || 'Player'}
                    </p>
                    <p className="text-[10px] font-semibold leading-none" style={{ color: level.color }}>
                      {level.title}
                    </p>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute top-12 right-0 w-60 z-50 rounded-2xl overflow-hidden"
                        style={{
                          background: '#161B25',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
                        }}
                      >
                        {/* User info header */}
                        <div className="px-4 py-3.5 border-b border-white/[0.06]">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl font-black text-sm text-navy flex items-center justify-center flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}80)` }}
                            >
                              {(profile?.username || user.email)?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text">{profile?.username || 'Player'}</p>
                              <p className="text-xs text-muted truncate max-w-[140px]">{user.email}</p>
                            </div>
                          </div>
                          {/* XP bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-muted mb-1">
                              <span style={{ color: level.color }}>{level.title}</span>
                              <span className="font-mono">{xp.toLocaleString()} XP</span>
                            </div>
                            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, ((xp - level.min) / (level.max - level.min)) * 100)}%`, backgroundColor: level.color }} />
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1.5">
                          {[
                            { label: 'Profile', Icon: User, to: '/profile' },
                            { label: 'Leaderboard', Icon: Trophy, to: '/leaderboard' },
                          ].map(({ label, Icon, to }) => (
                            <button
                              key={to}
                              onClick={() => navigate(to)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-text hover:bg-white/[0.04] transition-[color,background-color] duration-150"
                            >
                              <Icon size={15} />
                              {label}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-white/[0.06] py-1.5">
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red/80 hover:text-red hover:bg-red/[0.06] transition-[color,background-color] duration-150"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-semibold text-muted hover:text-text transition-colors duration-150 px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold text-navy px-4 py-2 rounded-xl transition-[opacity] duration-150 hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #F5A623, #FFB84D)', boxShadow: '0 0 20px rgba(245,166,35,0.3)' }}
                >
                  Play Free
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"
            >
              <div className="space-y-1.5">
                <span className={`block w-4 h-0.5 bg-text rounded-full transition-transform duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-4 h-0.5 bg-text rounded-full transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-4 h-0.5 bg-text rounded-full transition-transform duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: '#161B25',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-muted hover:text-text hover:bg-white/5 transition-[color,background-color] duration-150">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-2 border-t border-white/[0.06] flex gap-2 mt-2">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-muted">Log in</Link>
                  <Link to="/signup" className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-navy"
                    style={{ background: 'linear-gradient(135deg, #F5A623, #FFB84D)' }}>Play Free</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
