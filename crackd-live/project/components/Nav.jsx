
const Nav = ({ currentPage, setPage }) => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'games', label: 'Games' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'brand', label: 'Brand Kit' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(13,15,20,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 32px',
      height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div onClick={() => setPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <LogoMark size={28} />
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 18, color: '#F0F0F0', letterSpacing: '0.08em' }}>
          CRACKD<span style={{ color: '#F5A623' }}>.</span><span style={{ color: '#F5A623' }}>L</span><svg style={{ display: 'inline', verticalAlign: 'middle', marginBottom: 2 }} width="11" height="18" viewBox="0 0 11 18" fill="none"><path d="M7 1L1 10h4.5L4 17l6-9H5.5L7 1z" fill="#F5A623"/></svg><span style={{ color: '#F5A623' }}>VE</span>
        </span>
      </div>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: 4 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            background: currentPage === item.id ? 'rgba(245,166,35,0.1)' : 'transparent',
            border: 'none', color: currentPage === item.id ? '#F5A623' : '#8B95A1',
            fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14,
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (currentPage !== item.id) e.target.style.color = '#F0F0F0'; }}
          onMouseLeave={e => { if (currentPage !== item.id) e.target.style.color = '#8B95A1'; }}
          >{item.label}</button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Streak */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 12px' }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: '#F5A623' }}>23</span>
        </div>
        {/* XP badge */}
        <div style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 20, padding: '6px 12px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#4A9EFF' }}>Lv.12 · Mastermind</span>
        </div>
        <button onClick={() => setPage('profile')} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#F0F0F0', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 14,
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
        }}>Log In</button>
        <button style={{
          background: '#F5A623', border: 'none', color: '#0D0F14',
          fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
        }}>Sign Up</button>
      </div>
    </nav>
  );
};

const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="rgba(245,166,35,0.3)" strokeWidth="1.5" fill="rgba(245,166,35,0.05)"/>
    <path d="M40 4 L70 21 L70 55 L40 72 L10 55 L10 21 Z" stroke="#F5A623" strokeWidth="2" fill="none" strokeDasharray="4 60" strokeDashoffset="0"/>
    <path d="M40 15 L44 32 L52 28 L40 65 L36 45 L28 50 Z" fill="#F5A623" opacity="0.9"/>
    <circle cx="40" cy="40" r="4" fill="#0D0F14"/>
  </svg>
);

Object.assign(window, { Nav, LogoMark });
