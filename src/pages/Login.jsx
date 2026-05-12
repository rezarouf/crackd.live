import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore.js';
import { toast } from '../components/ui/Toast.jsx';
import { LogoMark } from '../components/LogoMark.jsx';
import { Zap, Target, Calendar } from 'lucide-react';

const FEATURES = [
  { Icon: Calendar, text: 'Once a day. Build the habit.' },
  { Icon: Target,   text: 'Compete globally. Own your rank.' },
  { Icon: Zap,      text: '10 games. Zero fluff.' },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { signIn, signInWithGoogle } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#080909' }}>

      {/* ── Left brand panel (desktop only) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] flex-shrink-0 p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0F1117 0%, #080909 60%, #0D0810 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Ambient glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(240,180,41,0.10) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 65%)' }} />

        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <LogoMark size={40} showTagline />
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2
            className="font-display font-bold text-text mb-3"
            style={{ fontSize: 38, letterSpacing: '-0.03em', lineHeight: 1.15 }}
          >
            Your daily mental<br />
            <span className="text-gradient-gold">reset awaits.</span>
          </h2>
          <p className="text-muted text-base mb-10 leading-relaxed">
            Ten challenges. Once each. Every day.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(240,180,41,0.10)', border: '1px solid rgba(240,180,41,0.20)' }}>
                  <Icon size={15} className="text-amber" />
                </div>
                <span className="text-sm text-muted font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-tertiary">
          © 2025 Crackd.live · Free forever
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

        {/* Mobile ambient */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] lg:hidden pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(240,180,41,0.09) 0%, transparent 65%)' }} />
        <div className="absolute inset-0 grid-bg opacity-[0.25] pointer-events-none lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[380px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <LogoMark size={36} />
          </div>

          <div className="mb-8">
            <h1 className="font-display font-bold text-text mb-1.5"
              style={{ fontSize: 28, letterSpacing: '-0.03em' }}>
              Welcome back.
            </h1>
            <p className="text-muted text-sm">Your daily set is waiting.</p>
          </div>

          {/* Google */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold text-text mb-6 transition-[border-color,background-color] duration-150"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-muted/50 font-medium">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted/60 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted/60 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="input"
              />
            </div>

            <motion.button
              type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-bold text-inverse text-sm mt-1 transition-opacity duration-150 disabled:opacity-50"
              style={{
                background: '#F0B429',
                boxShadow: '0 0 0 1px rgba(240,180,41,0.3), 0 4px 16px rgba(240,180,41,0.20)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Logging in…
                </span>
              ) : 'Log In'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            No account?{' '}
            <Link to="/signup" className="text-amber font-bold hover:opacity-80 transition-opacity duration-150">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
