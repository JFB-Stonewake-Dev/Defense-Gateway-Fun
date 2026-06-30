import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mainRank = (session.user as any).mainRank;
  if (mainRank < 220) {
    return NextResponse.json({ error: "Unauthorized: OF-4 Clearance Required" }, { status: 403 });
  }

  // Audit Log
  await supabase.from('intel_access_logs').insert({
    user_id: (session.user as any).dbId,
    resource: 'VIEW_INTSUMS'
  });

  const { data, error } = await supabase
    .from('intsum_posts')
    .select(`
      id, classification, title, content, created_at,
      users ( username )
    `)
    .order('created_at', { ascending: false });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mainRank = (session.user as any).mainRank;
  if (mainRank < 220) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { classification, title, content } = await request.json();

  const { data, error } = await supabase
    .from('intsum_posts')
    .insert({
      author_id: (session.user as any).dbId,
      classification,
      title,
      content
    })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
