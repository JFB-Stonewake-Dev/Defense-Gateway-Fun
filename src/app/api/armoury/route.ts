import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase
    .from('armoury_ledger')
    .select(`
      id, item_name, serial_number, action, timestamp,
      users ( username )
    `)
    .order('timestamp', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { item_name, serial_number, action } = await request.json();

  const { data, error } = await supabase
    .from('armoury_ledger')
    .insert({
      user_id: (session.user as any).dbId,
      item_name,
      serial_number,
      action
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
