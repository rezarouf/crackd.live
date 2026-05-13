import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore.js';
import { useGameStore } from '../../store/gameStore.js';
import { getLevelInfo } from '../../lib/utils.js';
import { useDailyChallenge } from '../../hooks/useDailyChallenge.js';
import { LogoMark } from '../LogoMark.jsx';
import { Flame, User, Trophy, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

const NAV_LINKS = [
  { to: '/games',       label: "Today's Set"  },
  { to: '/leaderboard', label: 'The Board'    },
  { to: '/profile',     label: 'Your Record'  },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [navHeight,   setNavHeight]   = useState(72);
  const { user, profile, signOut }   = useAuthStore();
  const { streaks }                   = useGameStore();
  const { completedCount, totalGames } = useDailyChallenge();
  const navigate  = useNavigate();
  const location  = useLocation();

  const overallStreak = Math.max(0, ...Object.values(streaks));
  const xp    = profile?.xp || 0;
  const level = getLevelInfo(xp);

  async function handleSignOut() {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  }

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      setNavHeight(y > 16 ? 56 : 72);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location]);

  return (
    <>
      {/* ── Main nav bar ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        animate={{ height: navHeight }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: scrolled ? 'rgba(14,14,20,0.88)' : 'rgba(14,14,20,0)',
          backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'blur(0px)',
          borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)'}`,
          transition: 'background 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease',
        }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="hover:opacity-85 transition-opacity duration-150">
            <LogoMark size={scrolled ? 28 : 32} />
          </Link>

          {/* Center nav pills — desktop */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {NAV_LINKS.map(link => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-[color] duration-150"
                  style={{ color: active ? '#0E0E14' : '#7A7A8C' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#F0EEE6'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#7A7A8C'; }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: '#C8F55A' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  {!active && (
                    <span
                      className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-150"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Streak pill */}
            {overallStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-pill"
                style={{ background: 'rgba(200,245,90,0.08)', border: '1px solid rgba(200,245,90,0.18)' }}>
                <Flame size={13} className="text-lime" />
                <span className="text-xs font-black text-lime tabular-nums">{overallStreak}</span>
              </div>
            )}

            {/* XP level pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-pill"
                style={{ background: 'rgba(166,124,255,0.08)', border: '1px solid rgba(166,124,255,0.15)' }}>
                <span className="text-xs font-bold text-violet">{level.title}</span>
              </div>
            )}

            {user ? (
              <div className="relative">
                {/* Avatar button */}
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition-[background-color,border-color] duration-150"
                  style={{
                    background: menuOpen ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${menuOpen ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                  }}
                  onMouseLeave={e => {
                    if (!menuOpen) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }
                  }}
                >
                  {/* Avatar circle */}
                  <div
                    className="w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${level.color}, ${level.color}99)`,
                      color: '#0E0E14',
                    }}
                  >
                    {(profile?.username || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-[12px] font-semibold text-text">
                    {profile?.username || 'Player'}
                  </span>
                  <ChevronDown
                    size={13}
                    className="text-muted transition-transform duration-200"
                    style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                        className="absolute top-11 right-0 w-64 z-50 overflow-hidden"
                        style={{
                          background: '#18181F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 16,
                          boxShadow: '0 20px 56px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.4)',
                        }}
                      >
                        {/* Header */}
                        <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}80)`, color: '#0E0E14' }}
                            >
                              {(profile?.username || user.email)?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text truncate">{profile?.username || 'Player'}</p>
                              <p className="text-xs text-muted truncate">{user.email}</p>
                            </div>
                          </div>

                          {/* XP bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] mb-1.5">
                              <span style={{ color: level.color }} className="font-semibold">{level.title}</span>
                              <span className="font-mono text-muted">{xp.toLocaleString()} XP</span>
                            </div>
                            <div className="xp-bar">
                              <div className="xp-bar-fill"
                                style={{ width: `${Math.min(100, ((xp - level.min) / (level.max - level.min)) * 100)}%` }} />
                            </div>
                          </div>

                          {/* Daily progress dots */}
                          {completedCount > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex gap-0.5 flex-1">
                                {Array.from({ length: totalGames }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 h-1 rounded-full"
                                    style={{ background: i < completedCount ? '#C8F55A' : 'rgba(255,255,255,0.08)' }}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-amber font-bold tabular-nums flex-shrink-0">
                                {completedCount}/{totalGames}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Menu items */}
                        <div className="py-1.5">
                          {[
                            { label: 'Your Record', Icon: User,   to: '/profile'     },
                            { label: 'The Board',   Icon: Trophy, to: '/leaderboard' },
                          ].map(({ label, Icon, to }) => (
                            <button
                              key={to}
                              onClick={() => navigate(to)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted transition-[color,background-color] duration-150"
                              onMouseEnter={e => { e.currentTarget.style.color = '#FAFAFA'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = '#7A7A8C'; e.currentTarget.style.background = 'transparent'; }}
                            >
                              <Icon size={15} />
                              {label}
                            </button>
                          ))}
                        </div>

                        <div className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-[color,background-color] duration-150"
                            style={{ color: 'rgba(244,63,94,0.75)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#F43F5E'; e.currentTarget.style.background = 'rgba(244,63,94,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,63,94,0.75)'; e.currentTarget.style.background = 'transparent'; }}
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
                  className="hidden sm:block text-sm font-semibold text-muted hover:text-text transition-[color] duration-150 px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold px-5 py-2 rounded-btn transition-[opacity,box-shadow] duration-150 hover:opacity-90"
                  style={{
                    background: '#C8F55A',
                    color: '#0E0E14',
                    boxShadow: '0 0 20px rgba(200,245,90,0.20)',
                    borderRadius: 10,
                  }}
                >
                  Play Free
                </Link>
              </div>
            )}

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Toggle menu"
            >
              <div className="w-4 space-y-1.5">
                <span className={`block h-0.5 bg-text rounded-full origin-center transition-transform duration-200 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-text rounded-full transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-text rounded-full origin-center transition-transform duration-200 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed left-0 right-0 z-40 md:hidden"
            style={{
              top: navHeight,
              background: 'rgba(14,14,20,0.96)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => {
                const active = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-[color,background-color] duration-150"
                    style={{
                      color: active ? '#0E0E14' : '#7A7A8C',
                      background: active ? '#C8F55A' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {!user && (
                <div className="pt-3 flex gap-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link to="/login"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-muted"
                    style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                    Log in
                  </Link>
                  <Link to="/signup"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: '#C8F55A', color: '#0E0E14', borderRadius: 10 }}>
                    Play Free
                  </Link>
                </div>
              )}

              {user && (
                <div className="pt-3 flex items-center justify-between px-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${level.color}, ${level.color}80)`, color: '#0E0E14' }}
                    >
                      {(profile?.username || user.email)?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{profile?.username || 'Player'}</p>
                      <p className="text-xs" style={{ color: level.color }}>{level.title}</p>
                    </div>
                  </div>
                  <button onClick={handleSignOut}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ color: '#F43F5E', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
