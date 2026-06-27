import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const snap = await db.collection('guilds').get();
    const guilds = snap.docs.map((doc) => {
      const d = doc.data();
      return { id: d.id, name: d.name, icon: d.icon, memberCount: d.memberCount };
    });
    return NextResponse.json({ guilds });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
