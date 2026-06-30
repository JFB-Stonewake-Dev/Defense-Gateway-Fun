'use client';

import { useState, useEffect } from 'react';
import SecurityHeader from '@/components/SecurityHeader';

type Plot = {
  id: string;
  grid_x: number;
  grid_y: number;
  identity: string;
  asset_type: string;
  last_updated: string;
  users: { username: string };
};

export default function OpsBoard() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [gridX, setGridX] = useState<number>(0);
  const [gridY, setGridY] = useState<number>(0);
  const [identity, setIdentity] = useState('FRIENDLY');
  const [assetType, setAssetType] = useState('AIRFRAME');

  const fetchPlots = async () => {
    const res = await fetch('/api/ops');
    if (res.ok) {
      const json = await res.json();
      setPlots(json.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlots();
    const interval = setInterval(fetchPlots, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grid_x: gridX, grid_y: gridY, identity, asset_type: assetType })
    });
    fetchPlots();
  };

  const getIdentityColor = (ident: string) => {
    switch (ident) {
      case 'HOSTILE': return '#ff3333';
      case 'FRIENDLY': return '#33aaff';
      case 'UNKNOWN': return '#ffaa00';
      default: return '#fff';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <SecurityHeader title="OPERATIONS BOARD // RADAR & FLIGHT MAP" level="SECRET" />

      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)' }}>
        
        {/* MAP CONTAINER */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          backgroundColor: '#1a1a24', 
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Map Grid */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            backgroundImage: 'url(/map.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'grid',
            gridTemplateColumns: 'repeat(20, 1fr)',
            gridTemplateRows: 'repeat(20, 1fr)',
          }}>
            {/* Draw Grid Lines & Labels */}
            {Array.from({ length: 400 }).map((_, i) => {
              const x = i % 20;
              const y = Math.floor(i / 20);
              const labelX = String.fromCharCode(65 + x);
              const labelY = y + 1;
              
              return (
                <div 
                  key={i} 
                  onClick={() => { setGridX(x); setGridY(y); }}
                  style={{ 
                    borderRight: '1px solid rgba(0, 255, 255, 0.1)', 
                    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
                    position: 'relative',
                    cursor: 'crosshair',
                    backgroundColor: (gridX === x && gridY === y) ? 'rgba(0, 255, 255, 0.2)' : 'transparent'
                  }}>
                  {y === 0 && <span style={{ position: 'absolute', top: 2, left: 4, fontSize: '0.6rem', color: 'rgba(0, 255, 255, 0.8)', fontWeight: 'bold' }}>{labelX}</span>}
                  {x === 0 && <span style={{ position: 'absolute', bottom: 2, left: 4, fontSize: '0.6rem', color: 'rgba(0, 255, 255, 0.8)', fontWeight: 'bold' }}>{labelY}</span>}
                </div>
              );
            })}

            {/* Render Plots */}
            {plots.map(plot => (
              <div key={plot.id} style={{
                position: 'absolute',
                left: `${(plot.grid_x / 20) * 100}%`,
                top: `${(plot.grid_y / 20) * 100}%`,
                width: '5%',
                height: '5%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: getIdentityColor(plot.identity),
                  borderRadius: plot.asset_type === 'AIRFRAME' ? '50%' : '0%',
                  boxShadow: `0 0 10px ${getIdentityColor(plot.identity)}`,
                  border: '2px solid #000'
                }} title={`${plot.identity} ${plot.asset_type} by ${plot.users?.username}`} />
              </div>
            ))}
          </div>
        </div>

        {/* SIDE PANEL */}
        <div className="terminal-box" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="terminal-header">
            <span>RADAR_CONTROL</span>
          </div>
          <div className="terminal-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <form onSubmit={handlePlot} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                SELECTED GRID: <strong style={{ color: 'var(--text-primary)' }}>{String.fromCharCode(65 + gridX)}-{gridY + 1}</strong>
              </div>
              
              <select className="btn" value={identity} onChange={e => setIdentity(e.target.value)} style={{ textAlign: 'left' }}>
                <option value="FRIENDLY">FRIENDLY</option>
                <option value="HOSTILE">HOSTILE</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>

              <select className="btn" value={assetType} onChange={e => setAssetType(e.target.value)} style={{ textAlign: 'left' }}>
                <option value="AIRFRAME">AIRFRAME</option>
                <option value="VESSEL">VESSEL</option>
                <option value="GROUND">GROUND</option>
              </select>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                PLOT CONTACT
              </button>
            </form>

            <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>ACTIVE CONTACTS</div>
              {loading ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SCANNING...</div>
              ) : plots.map(plot => (
                <div key={plot.id} style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.5rem', 
                  borderBottom: '1px solid var(--border-color)',
                  color: getIdentityColor(plot.identity)
                }}>
                  [{String.fromCharCode(65 + plot.grid_x)}-{plot.grid_y + 1}] {plot.identity} {plot.asset_type}
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Logged by {plot.users?.username}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
