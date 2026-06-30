'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginTerminal() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('USERNAME AND PASSWORD REQUIRED');
      return;
    }
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { username, password, redirect: false });
    
    if (res?.error) {
      setError('ACCESS DENIED: INVALID CREDENTIALS OR ACCOUNT NOT FOUND');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="terminal-box">
      <div className="terminal-header">
        <span>AUTH_NODE_01</span>
        <span>STATUS: LOCKDOWN</span>
      </div>
      <div className="terminal-body" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>DEFENCE GATEWAY</h2>
        <div style={{ color: 'var(--accent-red)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', marginBottom: '2rem', letterSpacing: '0.05em' }}>
          WARNING: RESTRICTED MILITARY NETWORK
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '300px', marginBottom: '0.5rem', lineHeight: '1.6' }}>
            Identify yourself. If this is your first time, the system will register the password you enter.
          </p>
          
          <input 
            type="text" 
            placeholder="Roblox Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--accent-blue)',
              color: 'var(--accent-blue)',
              padding: '0.75rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              maxWidth: '250px',
              textAlign: 'center',
              outline: 'none'
            }}
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--accent-blue)',
              color: 'var(--accent-blue)',
              padding: '0.75rem',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              maxWidth: '250px',
              textAlign: 'center',
              outline: 'none',
              letterSpacing: '0.2em'
            }}
          />

          {error && <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading || !username || !password} style={{ width: '100%', maxWidth: '250px', marginTop: '0.5rem' }}>
            {loading ? 'AUTHENTICATING...' : 'VERIFY IDENTITY'}
          </button>
        </form>
      </div>
    </div>
  )
}
