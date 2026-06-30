'use client';

import { signIn } from 'next-auth/react';

export default function LoginTerminal() {
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '300px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Identity verification required. Connect via active Roblox personnel profile to proceed.
          </p>
          <button className="btn btn-primary" onClick={() => signIn('roblox', { callbackUrl: '/dashboard' })} style={{ width: '100%', maxWidth: '250px' }}>
            INITIATE OAUTH
          </button>
        </div>
      </div>
    </div>
  )
}
