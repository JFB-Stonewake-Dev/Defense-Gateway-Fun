'use client';

export default function ATCPage() {
  return (
    <div className="panel" style={{ height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        Air Traffic Control
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <p>ATC UI / Radar Canvas goes here</p>
      </div>
    </div>
  );
}
