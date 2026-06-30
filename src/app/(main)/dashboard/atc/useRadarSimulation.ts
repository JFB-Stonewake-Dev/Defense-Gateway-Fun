import { useState, useEffect, useRef } from 'react';

export type Flight = {
  id: string;
  callsign: string;
  x: number; // 0 to 1000
  y: number; // 0 to 1000
  heading: number; // 0 to 360
  speed: number; // knots
  altitude: number; // feet
  squawk: string;
  status: 'CLRD' | 'TWR' | 'APP' | 'CTR' | 'UNKN';
  identity: 'FRIENDLY' | 'HOSTILE' | 'UNKNOWN';
};

const INITIAL_FLIGHTS: Flight[] = [
  { id: '1', callsign: 'HAWK-11', x: 200, y: 800, heading: 45, speed: 250, altitude: 15000, squawk: '1200', status: 'CTR', identity: 'FRIENDLY' },
  { id: '2', callsign: 'VIPER-2', x: 800, y: 150, heading: 220, speed: 320, altitude: 24000, squawk: '7700', status: 'APP', identity: 'FRIENDLY' },
  { id: '3', callsign: 'UNKN-99', x: 100, y: 500, heading: 90, speed: 400, altitude: 35000, squawk: '0000', status: 'UNKN', identity: 'UNKNOWN' },
  { id: '4', callsign: 'GHOST-5', x: 500, y: 900, heading: 330, speed: 210, altitude: 8000, squawk: '1200', status: 'APP', identity: 'FRIENDLY' },
];

export function useRadarSimulation() {
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  const updateFlights = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000; // seconds
      
      setFlights(prevFlights => prevFlights.map(flight => {
        // Simple physics update
        // 1 knot ~ 0.05 units per second on this arbitrary scale for visual speed
        const speedMultiplier = 0.05; 
        const rad = (flight.heading - 90) * (Math.PI / 180);
        
        let newX = flight.x + Math.cos(rad) * flight.speed * speedMultiplier * deltaTime;
        let newY = flight.y + Math.sin(rad) * flight.speed * speedMultiplier * deltaTime;

        // Wrap around logic just to keep them on screen for the simulation
        if (newX > 1100) newX = -100;
        if (newX < -100) newX = 1100;
        if (newY > 1100) newY = -100;
        if (newY < -100) newY = 1100;

        return { ...flight, x: newX, y: newY };
      }));
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateFlights);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateFlights);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const updateFlightCommand = (id: string, updates: Partial<Flight>) => {
    setFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  return { flights, updateFlightCommand };
}
