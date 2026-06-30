import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  // Only return tracks updated in the last 60 seconds
  const thirtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('radar_tracks')
    .select('*')
    .gte('last_updated', thirtySecondsAgo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  // Basic API Key validation
  const authHeader = request.headers.get('authorization');
  const EXPECTED_SECRET = process.env.ROBLOX_API_SECRET || 'jfb-secret-key-123';
  
  if (!authHeader || authHeader !== `Bearer ${EXPECTED_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const tracks = body.tracks;

    if (!Array.isArray(tracks)) {
      return NextResponse.json({ error: "Invalid payload, expected array of tracks" }, { status: 400 });
    }

    const upsertPayload = tracks.map((t: any) => ({
      id: t.trackId,
      callsign: t.callsign || t.name,
      x: t.x,
      z: t.z,
      heading: t.bearing,
      speed: t.speed || 0, // Calculate speed on Lua side or default to 0
      altitude: t.altitude || 0,
      identity: t.class === "Air" ? "FRIENDLY" : "UNKNOWN", // Mock logic
      squawk: t.squawk || "1200",
      status: "APP",
      last_updated: new Date().toISOString()
    }));

    // Upsert all tracks
    const { error } = await supabase
      .from('radar_tracks')
      .upsert(upsertPayload, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: tracks.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
