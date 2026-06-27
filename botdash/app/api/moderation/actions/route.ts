import { NextResponse } from 'next/server';
import { getDb, getAdmin } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guildId = searchParams.get('guildId');
  if (!guildId) return NextResponse.json({ error: 'guildId required' }, { status: 400 });

  try {
    const db = getDb();
    const snap = await db.collection('modActions')
      .where('guildId', '==', guildId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const actions = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ actions });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guildId, action, targetId, targetTag, reason, duration, moderatorTag } = body;
    if (!guildId || !action) return NextResponse.json({ error: 'guildId and action required' }, { status: 400 });

    const db = getDb();
    const admin = getAdmin();

    const ref = await db.collection('pendingActions').add({
      guildId,
      action,
      targetId: targetId || null,
      targetTag: targetTag || null,
      reason: reason || 'Action from dashboard',
      duration: duration || null,
      moderatorTag: moderatorTag || 'Dashboard',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, actionId: ref.id });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
