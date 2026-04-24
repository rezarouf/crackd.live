import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100dvh', background: '#0D0F14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          {/* Logo */}
          <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#F0F0F0', marginBottom: '32px' }}>
            CRACKD.L<span style={{ color: '#F5A623' }}>⚡</span>VE
          </div>

          {/* Error icon */}
          <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>

          <h2 style={{ fontSize: '1.375rem', fontWeight: 900, color: '#F0F0F0', marginBottom: 8, letterSpacing: '-0.02em' }}>
            This game crashed
          </h2>
          <p style={{ color: '#8B95A1', fontSize: '0.9rem', marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
            Something unexpected happened. Head back and try another puzzle.
          </p>

          {/* Back to Games */}
          <a
            href="/games"
            style={{ display: 'inline-block', background: '#F5A623', color: '#0D0F14', fontWeight: 700, fontSize: '0.9rem', padding: '10px 24px', borderRadius: 12, textDecoration: 'none', marginBottom: 12 }}
          >
            ← Back to Games
          </a>

          {/* Try again */}
          <button
            onClick={() => this.setState({ error: null })}
            style={{ background: 'none', border: 'none', color: '#8B95A1', fontSize: '0.85rem', cursor: 'pointer', padding: '6px 12px' }}
          >
            Try again
          </button>

          {/* Debug message */}
          <details style={{ marginTop: 32, maxWidth: 480, width: '100%', textAlign: 'left' }}>
            <summary style={{ color: '#8B95A1', fontSize: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
              Error details
            </summary>
            <pre style={{ marginTop: 8, padding: '10px 14px', background: '#161B25', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: '#EF4444', fontSize: '0.7rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
              {this.state.error.message}
              {this.state.error.stack ? '\n\n' + this.state.error.stack : ''}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
