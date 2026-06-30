'use client';

import { useState, useEffect } from 'react';
import SecurityHeader from '@/components/SecurityHeader';

export default function ArmouryBoard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [itemName, setItemName] = useState('SA80 A2');
  const [serial, setSerial] = useState('');
  const [action, setAction] = useState('OUT');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    const res = await fetch('/api/armoury');
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
    if (!serial) return;
    await fetch('/api/armoury', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_name: itemName, serial_number: serial, action })
    });
    setSerial('');
    fetchLogs();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <SecurityHeader title="ARMOURY LEDGER // EQUIPMENT LOG" level="RESTRICTED" />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)' }}>
        
        <div className="terminal-box" style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="terminal-header">
            <span>QUARTERMASTER_FORM</span>
          </div>
          <div className="terminal-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>EQUIPMENT TYPE</label>
                <select className="btn" value={itemName} onChange={e => setItemName(e.target.value)} style={{ width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                  <option value="SA80 A2">SA80 A2 (Rifle)</option>
                  <option value="L131A1">L131A1 (Sidearm)</option>
                  <option value="Osprey Body Armour">Osprey Body Armour</option>
                  <option value="PRC-343 Radio">PRC-343 Radio</option>
                  <option value="NVD Goggles">NVD Goggles</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SERIAL NUMBER</label>
                <input 
                  type="text" 
                  value={serial} 
                  onChange={e => setSerial(e.target.value)} 
                  placeholder="e.g. SN-8492"
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ACTION</label>
                <select className="btn" value={action} onChange={e => setAction(e.target.value)} style={{ width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                  <option value="OUT">SIGN OUT</option>
                  <option value="IN">SIGN IN</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={!serial}>
                SUBMIT LEDGER ENTRY
              </button>
            </form>
          </div>
        </div>

        <div className="terminal-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="terminal-header">
            <span>RECENT_ACTIVITY</span>
          </div>
          <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'rgba(0,255,255,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '0.75rem' }}>TIMESTAMP</th>
                  <th style={{ padding: '0.75rem' }}>PERSONNEL</th>
                  <th style={{ padding: '0.75rem' }}>EQUIPMENT</th>
                  <th style={{ padding: '0.75rem' }}>SERIAL</th>
                  <th style={{ padding: '0.75rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>{log.users?.username}</td>
                    <td style={{ padding: '0.75rem' }}>{log.item_name}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{log.serial_number}</td>
                    <td style={{ padding: '0.75rem', color: log.action === 'OUT' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>{log.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
