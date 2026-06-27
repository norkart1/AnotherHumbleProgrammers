import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const guildsSnap = await db.collection('guilds').limit(1).get();
    if (guildsSnap.empty) {
      return NextResponse.json({ activity: [] });
    }

    const guildId = guildsSnap.docs[0].id;

    const actSnap = await db
      .collection('guilds')
      .doc(guildId)
      .collection('recentActivity')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const activity = actSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type,
        userId: data.userId,
        username: data.username,
        details: data.details,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ activity });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
