'use client';

import { useState, useEffect } from 'react';
import SecurityHeader from '@/components/SecurityHeader';

export default function AssetLedger() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [assetType, setAssetType] = useState('VEHICLE');
  const [callsign, setCallsign] = useState('');

  const fetchAssets = async () => {
    const res = await fetch('/api/assets');
    if (res.ok) {
      const json = await res.json();
      setAssets(json.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callsign) return;
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'CREATE', asset_type: assetType, callsign })
    });
    setCallsign('');
    fetchAssets();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_STATUS', id, status: newStatus })
    });
    fetchAssets();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'var(--accent-blue)';
      case 'MAINTENANCE': return '#ffaa00';
      case 'DESTROYED': return 'var(--accent-red)';
      default: return 'var(--text-primary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <SecurityHeader title="LOGISTICS // ASSET ORBAT" level="OFFICIAL" />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)' }}>
        
        {/* ADD ASSET FORM */}
        <div className="terminal-box" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="terminal-header">
            <span>REGISTER_ASSET</span>
          </div>
          <div className="terminal-body">
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ASSET TYPE</label>
                <select className="btn" value={assetType} onChange={e => setAssetType(e.target.value)} style={{ width: '100%', textAlign: 'left', marginTop: '0.25rem' }}>
                  <option value="VEHICLE">VEHICLE (Ground)</option>
                  <option value="AIRFRAME">AIRFRAME (Aviation)</option>
                  <option value="VESSEL">VESSEL (Maritime)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CALLSIGN / REGISTRATION</label>
                <input 
                  type="text" 
                  value={callsign} 
                  onChange={e => setCallsign(e.target.value.toUpperCase())} 
                  placeholder="e.g. BRAVO-1"
                  style={{ width: '100%', padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', outline: 'none' }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!callsign}>
                COMMISSION ASSET
              </button>
            </form>
          </div>
        </div>

        {/* ASSET LIST */}
        <div className="terminal-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <div className="terminal-header">
            <span>ORBAT_LEDGER</span>
          </div>
          <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: 'rgba(0,255,255,0.1)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '0.75rem' }}>TYPE</th>
                  <th style={{ padding: '0.75rem' }}>CALLSIGN</th>
                  <th style={{ padding: '0.75rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
                    <td style={{ padding: '0.75rem' }}>{asset.asset_type}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{asset.callsign}</td>
                    <td style={{ padding: '0.75rem', color: getStatusColor(asset.status) }}>{asset.status}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <select 
                        value={asset.status} 
                        onChange={e => handleUpdateStatus(asset.id, e.target.value)}
                        style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.25rem', outline: 'none' }}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                        <option value="DESTROYED">DESTROYED</option>
                      </select>
                    </td>
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
