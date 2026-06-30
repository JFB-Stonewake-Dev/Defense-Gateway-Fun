'use client';

import { useState, useRef, useEffect } from 'react';
import { useRadarData, Flight } from './useRadarSimulation';

export default function ATCPage() {
  const { flights, updateFlightCommand } = useRadarData();
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedFlight = flights.find(f => f.id === selectedFlightId);

  // Draw the radar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle responsive sizing
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation frame for drawing
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Grid / Radar Sweep background (simple concentric circles)
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxRadius = Math.min(cx, cy) - 20;

      ctx.strokeStyle = 'rgba(77, 124, 15, 0.2)'; // Tactical olive grid
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.66, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.33, 0, Math.PI * 2);
      ctx.stroke();
      
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxRadius);
      ctx.lineTo(cx, cy + maxRadius);
      ctx.moveTo(cx - maxRadius, cy);
      ctx.lineTo(cx + maxRadius, cy);
      ctx.stroke();

      // Transform coordinate system (0-1000) to Canvas (0-width, 0-height)
      const scaleX = canvas.width / 1000;
      const scaleY = canvas.height / 1000;

      // Draw Flights
      flights.forEach(flight => {
        const px = flight.x * scaleX;
        const py = flight.y * scaleY;

        const isSelected = flight.id === selectedFlightId;
        const isFriendly = flight.identity === 'FRIENDLY';

        ctx.fillStyle = isSelected ? '#ffffff' : (isFriendly ? '#84cc16' : '#ef4444');
        ctx.strokeStyle = ctx.fillStyle;

        // Draw blip (Square for friendly, Diamond for unknown/hostile)
        ctx.save();
        ctx.translate(px, py);
        
        ctx.beginPath();
        if (isFriendly) {
          ctx.rect(-3, -3, 6, 6);
        } else {
          ctx.moveTo(0, -4);
          ctx.lineTo(4, 0);
          ctx.lineTo(0, 4);
          ctx.lineTo(-4, 0);
          ctx.closePath();
        }
        ctx.fill();

        // Draw leader line (velocity vector)
        const rad = (flight.heading - 90) * (Math.PI / 180);
        const vectorLen = (flight.speed / 10) * scaleX; // Arbitrary length scaling
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(rad) * vectorLen, Math.sin(rad) * vectorLen);
        ctx.stroke();

        ctx.restore();

        // Draw datablock (Callsign, Alt, Speed)
        ctx.font = '10px "Share Tech Mono", monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : 'var(--text-secondary)';
        ctx.fillText(flight.callsign, px + 8, py - 8);
        ctx.fillText(`${Math.round(flight.altitude / 100).toString().padStart(3, '0')} ${flight.speed}K`, px + 8, py + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [flights, selectedFlightId]);

  // Click handler to select flights
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = canvas.width / 1000;
    const scaleY = canvas.height / 1000;

    // Find nearest flight within 15px radius
    let nearest: string | null = null;
    let minDist = 15;

    flights.forEach(f => {
      const px = f.x * scaleX;
      const py = f.y * scaleY;
      const dist = Math.sqrt(Math.pow(px - clickX, 2) + Math.pow(py - clickY, 2));
      if (dist < minDist) {
        minDist = dist;
        nearest = f.id;
      }
    });

    setSelectedFlightId(nearest);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gridTemplateRows: '1fr 200px', gap: '1rem', height: 'calc(100vh - 4rem)' }}>
      {/* Radar Scope */}
      <div className="panel" style={{ gridColumn: '1 / 2', gridRow: '1 / 3', padding: 0, position: 'relative', overflow: 'hidden' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', cursor: 'crosshair', backgroundColor: '#050505' }}
          onClick={handleCanvasClick}
        />
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontFamily: '"Share Tech Mono", monospace', color: 'rgba(132, 204, 22, 0.7)', pointerEvents: 'none' }}>
          ATC RADAR SYNC: OK<br/>
          ACTIVE TRACKS: {flights.length}
        </div>
      </div>

      {/* Flight Strips */}
      <div className="panel" style={{ gridColumn: '2 / 3', gridRow: '1 / 2', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="panel-header" style={{ marginBottom: '0.5rem' }}>Active Flights</div>
        
        {flights.map(flight => (
          <div 
            key={flight.id} 
            onClick={() => setSelectedFlightId(flight.id)}
            style={{ 
              padding: '0.75rem', 
              backgroundColor: flight.id === selectedFlightId ? 'rgba(132, 204, 22, 0.1)' : 'var(--bg-card)',
              border: `1px solid ${flight.id === selectedFlightId ? '#84cc16' : 'var(--border-color)'}`,
              borderRadius: '0.25rem',
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.25rem',
              fontFamily: '"Share Tech Mono", monospace'
            }}
          >
            <div style={{ fontWeight: 'bold', color: flight.identity === 'FRIENDLY' ? '#84cc16' : '#ef4444' }}>{flight.callsign}</div>
            <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>SQ: {flight.squawk}</div>
            <div style={{ fontSize: '0.875rem' }}>ALT: {flight.altitude}ft</div>
            <div style={{ fontSize: '0.875rem', textAlign: 'right' }}>SPD: {Math.round(flight.speed)}kts</div>
            <div style={{ fontSize: '0.875rem' }}>HDG: {Math.round(flight.heading)}°</div>
            <div style={{ fontSize: '0.875rem', textAlign: 'right' }}>STS: {flight.status}</div>
          </div>
        ))}
      </div>

      {/* Command Console */}
      <div className="panel" style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">Command Console</div>
        
        {!selectedFlight ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Select a flight to issue commands
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Assign Heading</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn" style={{ padding: '0.25rem 0.5rem', flex: 1 }} onClick={() => updateFlightCommand(selectedFlight.id, { heading: (selectedFlight.heading - 10 + 360) % 360 })}>-10</button>
                  <button className="btn" style={{ padding: '0.25rem 0.5rem', flex: 1 }} onClick={() => updateFlightCommand(selectedFlight.id, { heading: (selectedFlight.heading + 10) % 360 })}>+10</button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Assign Alt (ft)</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn" style={{ padding: '0.25rem 0.5rem', flex: 1 }} onClick={() => updateFlightCommand(selectedFlight.id, { altitude: Math.max(0, selectedFlight.altitude - 1000) })}>↓1k</button>
                  <button className="btn" style={{ padding: '0.25rem 0.5rem', flex: 1 }} onClick={() => updateFlightCommand(selectedFlight.id, { altitude: selectedFlight.altitude + 1000 })}>↑1k</button>
                </div>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Quick Comms</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn" style={{ flex: 1, backgroundColor: 'rgba(132, 204, 22, 0.1)', color: '#84cc16', borderColor: '#84cc16' }}>CLR LAND</button>
                <button className="btn" style={{ flex: 1 }}>HANDOVER</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
