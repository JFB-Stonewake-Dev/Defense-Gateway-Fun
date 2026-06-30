import { useState, useEffect, useRef } from 'react';

export type Flight = {
  id: string;
  callsign: string;
  x: number; 
  y: number; 
  heading: number;
  speed: number;
  altitude: number;
  squawk: string;
  status: 'CLRD' | 'TWR' | 'APP' | 'CTR' | 'UNKN';
  identity: 'FRIENDLY' | 'HOSTILE' | 'UNKNOWN';
};

export function useRadarData() {
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch('/api/radar');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            // Map the Supabase columns to our Flight type
            const mapped = json.data.map((t: any) => ({
              id: t.id,
              callsign: t.callsign,
              // Map Roblox World Coordinates to Canvas coordinates.
              // Assuming Roblox map is centered around 0,0 and spans -5000 to +5000
              // The canvas is 0 to 1000. So we shift by 5000 and divide by 10.
              x: (t.x + 5000) / 10,
              y: (t.z + 5000) / 10,
              heading: t.heading,
              speed: t.speed,
              altitude: t.altitude,
              squawk: t.squawk,
              status: t.status,
              identity: t.identity,
            }));
            setFlights(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch radar data", err);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 2000); // Poll every 2s
    
    return () => clearInterval(interval);
  }, []);

  const updateFlightCommand = (id: string, updates: Partial<Flight>) => {
    // Optimistic UI update, could also send to an API to save
    setFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return { flights, updateFlightCommand };
}
