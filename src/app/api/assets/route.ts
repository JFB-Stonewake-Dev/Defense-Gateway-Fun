import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase
    .from('asset_ledger')
    .select('*')
    .order('asset_type', { ascending: true })
    .order('callsign', { ascending: true });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === 'CREATE') {
    const { data, error } = await supabase
      .from('asset_ledger')
      .insert({
        asset_type: body.asset_type,
        callsign: body.callsign,
        status: 'ACTIVE'
      })
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } 
  
  if (body.action === 'UPDATE_STATUS') {
    const { data, error } = await supabase
      .from('asset_ledger')
      .update({ status: body.status, last_updated: new Date().toISOString() })
      .eq('id', body.id)
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
