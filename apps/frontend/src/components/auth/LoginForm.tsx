import { useState } from 'react';
import { api } from '../../lib/api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await api.login(email, password) as any;
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/employee';
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '2px solid rgba(255,180,180,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(236,9,39,0.4), 0 0 40px rgba(236,9,39,0.15), inset 0 0 20px rgba(255,255,255,0.05)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,200,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(236,9,39,0.15)',
          border: '1px solid rgba(236,9,39,0.4)',
          borderRadius: 10,
          padding: '.65rem 1rem',
          marginBottom: '1.2rem',
          color: 'rgba(255,180,180,0.95)',
          fontSize: '.83rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Campo Usuario */}
      <div style={{ marginBottom: '1.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', paddingBottom: '.6rem', borderBottom: '1px solid rgba(255,150,150,0.35)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,160,160,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Usuario"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '.95rem',
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div style={{ marginBottom: '2.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', paddingBottom: '.6rem', borderBottom: '1px solid rgba(255,150,150,0.35)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,160,160,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Contraseña"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '.95rem',
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Botón Entrar — pill centrado */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '.75rem 3.5rem',
            borderRadius: 999,
            border: '1.5px solid rgba(255,180,180,0.4)',
            background: loading
              ? 'rgba(150,150,150,0.2)'
              : 'linear-gradient(135deg, rgba(236,9,39,0.7) 0%, rgba(192,7,30,0.85) 100%)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '1.5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            transition: 'all .2s',
            boxShadow: loading ? 'none' : '0 0 20px rgba(236,9,39,0.45), 0 4px 16px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(236,9,39,0.7), 0 6px 20px rgba(0,0,0,0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(236,9,39,0.45), 0 4px 16px rgba(0,0,0,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {loading ? 'Ingresando...' : 'ENTRAR'}
        </button>
      </div>
    </form>
  );
}
