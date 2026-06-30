export default function Dashboard() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-mono)', borderBottom: '1px dashed var(--border-highlight)', paddingBottom: '1rem', color: 'var(--accent-blue)' }}>COMMAND DASHBOARD</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="panel">
          <div className="panel-header">Active Shift Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Status</span>
              <span className="badge badge-amber">Awaiting Duty Setup</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Assignment</span>
              <span style={{ color: 'var(--text-muted)' }}>Not Assigned</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location</span>
              <span style={{ color: 'var(--text-muted)' }}>Unknown</span>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ width: '100%' }}>Sign In to Duty Roster</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Recent INTSUMs (G2 Intel)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(14, 165, 233, 0.05)', borderRadius: '0.25rem', borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>08:00 HRS</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Daily Morning Briefing</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderRadius: '0.25rem', borderLeft: '3px solid var(--accent-amber)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Yesterday, 14:30 HRS</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Updated ROE - Checkpoint Alpha</div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="btn btn-primary" style={{ width: '100%', backgroundColor: 'transparent' }}>View All Intel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
