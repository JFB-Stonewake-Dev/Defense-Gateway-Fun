'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginTerminal() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    await signIn('credentials', { username, callbackUrl: '/dashboard' });
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
            Identity verification required. Enter your Roblox username to pull your MoD service record.
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

          <button type="submit" className="btn btn-primary" disabled={loading || !username} style={{ width: '100%', maxWidth: '250px', marginTop: '0.5rem' }}>
            {loading ? 'AUTHENTICATING...' : 'VERIFY IDENTITY'}
          </button>
        </form>
      </div>
    </div>
  )
}
