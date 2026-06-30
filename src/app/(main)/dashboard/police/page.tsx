'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SecurityHeader from '@/components/SecurityHeader';

export default function PoliceBlotter() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [type, setType] = useState('ROUTINE PATROL');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);

  const isPolice = (session?.user as any)?.policeRank > 0 || (session?.user as any)?.mainRank >= 220;

  const fetchLogs = async () => {
    const res = await fetch('/api/police');
    if (res.ok) {
      const json = await res.json();
      setLogs(json.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return;
    await fetch('/api/police', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_type: type, description: desc })
    });
    setDesc('');
    fetchLogs();
  };

  if (session && !isPolice) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
        <h1>ACCESS DENIED: ROYAL NAVY POLICE CLEARANCE REQUIRED</h1>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <SecurityHeader title="RNP // JOINT SERVICE POLICE WATCH LOG" level="RESTRICTED" />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)' }}>
        
        {/* ADD ENTRY FORM */}
        <div className="terminal-box" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="terminal-header">
            <span>SUBMIT_ENTRY</span>
          </div>
          <div className="terminal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>INCIDENT TYPE</label>
                <select className="btn" value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                  <option value="ROUTINE PATROL">ROUTINE PATROL</option>
                  <option value="WARNING ISSUED">WARNING ISSUED</option>
                  <option value="ARREST">ARREST</option>
                  <option value="SECURITY BREACH">SECURITY BREACH</option>
                  <option value="DISCHARGE OF FIREARM">DISCHARGE OF FIREARM</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DESCRIPTION</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  placeholder="Provide chronological incident details..."
                  style={{ width: '100%', height: '150px', padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', outline: 'none', resize: 'none' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!desc}>
                RECORD INCIDENT
              </button>
            </form>
          </div>
        </div>

        {/* BLOTTER LIST */}
        <div className="terminal-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="terminal-header">
            <span>WATCH_LOG_BLOTTER</span>
          </div>
          <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <span>TIME: {new Date(log.timestamp).toLocaleString()}</span>
                  <span>OFFICER: {log.users?.username}</span>
                </div>
                <div style={{ color: log.incident_type === 'ROUTINE PATROL' ? 'var(--accent-blue)' : 'var(--accent-red)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  [{log.incident_type}]
                </div>
                <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {log.description}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
