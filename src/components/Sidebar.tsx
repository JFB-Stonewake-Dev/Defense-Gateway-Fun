'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', margin: 0, color: 'var(--text-primary)' }}>DEFENCE GATEWAY</h2>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>ISLAND OPS HUB v1.0</div>
      </div>
      
      <nav style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <SidebarLink href="/dashboard" label="Dashboard" currentPath={pathname} />
        <SidebarLink href="/armoury" label="Armoury Ledger" currentPath={pathname} />
        <SidebarLink href="/ops" label="Operations Board" currentPath={pathname} />
        <SidebarLink href="/police" label="Watch Log (SP)" currentPath={pathname} />
        <SidebarLink href="/logistics" label="Asset Ledger" currentPath={pathname} />
        <SidebarLink href="/intelligence" label="G2 Intelligence" currentPath={pathname} />
        <SidebarLink href="/jpa" label="JPA Profiles" currentPath={pathname} />
      </nav>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {status === 'authenticated' ? 'Logged in as' : 'Authentication'}
        </div>
        
        {status === 'authenticated' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={session.user?.image || ''} 
                alt="Avatar" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} 
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{session.user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: (session.user as any)?.mainRank > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {(session.user as any)?.mainRole || 'Rank: None'}
                </div>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => signOut()} style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => signIn('roblox')} style={{ width: '100%' }}>
            ROBLOX SECURE LOGIN
          </button>
        )}
      </div>
    </aside>
  );
}

function SidebarLink({ href, label, currentPath }: { href: string, label: string, currentPath: string | null }) {
  const isActive = currentPath === href || currentPath?.startsWith(href + '/');
  
  return (
    <Link 
      href={href} 
      style={{ 
        display: 'block', 
        padding: '0.75rem 1.5rem', 
        color: isActive ? 'white' : 'var(--text-secondary)', 
        backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 500,
        transition: 'all 0.15s ease'
      }}
      onMouseOver={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
      }}
      onMouseOut={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {label}
    </Link>
  )
}
