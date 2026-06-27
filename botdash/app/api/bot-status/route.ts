import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const snap = await db.collection('botConfig').doc('status').get();
    if (!snap.exists) {
      return NextResponse.json({
        type: 'WATCHING',
        text: 'your server 👀',
      });
    }
    return NextResponse.json(snap.data());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, text } = await req.json();

    const validTypes = ['PLAYING', 'WATCHING', 'LISTENING', 'COMPETING'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const db = getDb();
    await db.collection('botConfig').doc('status').set({
      type,
      text: text.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
