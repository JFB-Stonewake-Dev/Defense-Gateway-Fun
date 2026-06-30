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
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Defence Gateway</h2>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Island Ops Hub v1.0</div>
      </div>
      
      <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
          Navigation
        </div>
        <SidebarLink href="/dashboard" label="Dashboard" currentPath={pathname} />
        <SidebarLink href="/dashboard/atc" label="Air Traffic Control" currentPath={pathname} />
        <SidebarLink href="/dashboard/ops" label="Operations Map" currentPath={pathname} />
      </nav>

      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        {status === 'authenticated' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img 
                src={session.user?.image || ''} 
                alt="Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }} 
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {session.user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: (session.user as any)?.mainRank > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {(session.user as any)?.mainRole || 'Rank: None'}
                </div>
              </div>
            </div>
            <button className="btn btn-outline" onClick={() => signOut()} style={{ width: '100%' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Authentication Required
            </div>
            <button className="btn btn-primary" onClick={() => signIn('roblox')} style={{ width: '100%' }}>
              Secure Login
            </button>
          </div>
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
        padding: '0.625rem 0.75rem', 
        color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)', 
        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {label}
    </Link>
  )
}
