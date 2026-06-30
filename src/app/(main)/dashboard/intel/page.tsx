'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SecurityHeader from '@/components/SecurityHeader';

export default function IntelBoard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'INTSUM' | 'LOGS'>('INTSUM');
  
  const [intsums, setIntsums] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [classification, setClassification] = useState('TOP SECRET');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isOF4 = (session?.user as any)?.mainRank >= 220;

  const fetchIntsums = async () => {
    const res = await fetch('/api/intel');
    if (res.ok) {
      const json = await res.json();
      setIntsums(json.data || []);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    const res = await fetch('/api/intel/logs');
    if (res.ok) {
      const json = await res.json();
      setLogs(json.data || []);
    }
  };

  useEffect(() => {
    if (isOF4) {
      fetchIntsums();
      fetchLogs();
    }
  }, [isOF4]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    await fetch('/api/intel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classification, title, content })
    });
    setTitle('');
    setContent('');
    fetchIntsums();
  };

  if (session && !isOF4) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)' }}>
        <h1>ACCESS DENIED</h1>
        <p style={{ marginTop: '1rem' }}>OF-4 CLEARANCE REQUIRED TO VIEW INTELLIGENCE SUMMARIES.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '2rem', color: 'var(--text-muted)' }}>THIS INCIDENT HAS BEEN LOGGED.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <SecurityHeader title="G2 INTELLIGENCE // SECURE COMPARTMENTED INFORMATION" level="TOP SECRET" />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'INTSUM' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('INTSUM')}>INTSUM / MISREP</button>
        <button className={`btn ${activeTab === 'LOGS' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('LOGS')}>SECURITY ACCESS LOGS</button>
      </div>

      {activeTab === 'INTSUM' ? (
        <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 180px)' }}>
          
          <div className="terminal-box" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="terminal-header">
              <span>PUBLISH_REPORT</span>
            </div>
            <div className="terminal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CLASSIFICATION</label>
                  <select className="btn" value={classification} onChange={e => setClassification(e.target.value)} style={{ width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                    <option value="SECRET">SECRET</option>
                    <option value="TOP SECRET">TOP SECRET</option>
                    <option value="EYES ONLY">EYES ONLY</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TITLE</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Operation Name or Subject"
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', outline: 'none' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CONTENT</label>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    style={{ width: '100%', height: '200px', padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', outline: 'none', resize: 'none' }} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!title || !content}>
                  ENCRYPT & PUBLISH
                </button>
              </form>
            </div>
          </div>

          <div className="terminal-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
            <div className="terminal-header">
              <span>INTELLIGENCE_REPOSITORY</span>
            </div>
            <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {intsums.map(doc => (
                <div key={doc.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div>
                      <span style={{ color: doc.classification === 'EYES ONLY' ? 'var(--accent-red)' : 'var(--accent-blue)', fontWeight: 'bold' }}>[{doc.classification}]</span>
                      <strong style={{ marginLeft: '0.5rem' }}>{doc.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      AUTHOR: {doc.users?.username} | {new Date(doc.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="terminal-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="terminal-header">
            <span>SECURITY_AUDIT_LOG</span>
          </div>
          <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'rgba(0,255,255,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                  <th style={{ padding: '0.75rem' }}>USER</th>
                  <th style={{ padding: '0.75rem' }}>RESOURCE ACCESSED</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--accent-red)' }}>{log.users?.username}</td>
                    <td style={{ padding: '0.75rem' }}>{log.resource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
