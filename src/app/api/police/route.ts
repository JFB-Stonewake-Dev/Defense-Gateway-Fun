import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase
    .from('watch_logs')
    .select(`
      id, incident_type, description, timestamp,
      users ( username )
    `)
    .order('timestamp', { ascending: false })
    .limit(100);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify they are police
  if ((session.user as any).policeRank === 0 && (session.user as any).mainRank < 220) {
    return NextResponse.json({ error: "Unauthorized: Police Only" }, { status: 403 });
  }

  const { incident_type, description } = await request.json();

  const { data, error } = await supabase
    .from('watch_logs')
    .insert({
      officer_id: (session.user as any).dbId,
      incident_type,
      description
    })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
