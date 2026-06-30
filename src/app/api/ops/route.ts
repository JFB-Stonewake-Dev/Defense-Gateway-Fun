import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only return plots updated in the last 2 hours
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('operations_map_plots')
    .select(`
      id, grid_x, grid_y, identity, asset_type, last_updated,
      users ( username )
    `)
    .gte('last_updated', twoHoursAgo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { grid_x, grid_y, identity, asset_type } = await request.json();

  const { data, error } = await supabase
    .from('operations_map_plots')
    .insert({
      grid_x,
      grid_y,
      identity,
      asset_type,
      created_by: (session.user as any).dbId,
      last_updated: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
