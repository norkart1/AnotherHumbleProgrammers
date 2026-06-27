import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get('guildId');
  if (!guildId) {
    return NextResponse.json({ error: 'guildId is required' }, { status: 400 });
  }
  try {
    const db = getDb();
    const snap = await db.collection('guilds').doc(guildId).get();
    if (!snap.exists) return NextResponse.json({ channels: [] });
    const channels = snap.data()?.channels || [];
    return NextResponse.json({ channels });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
