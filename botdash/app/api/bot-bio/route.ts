import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const snap = await db.collection('botConfig').doc('profile').get();
    if (!snap.exists) return NextResponse.json({ bio: '' });
    return NextResponse.json({ bio: snap.data()?.bio || '' });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bio } = await req.json();
    if (typeof bio !== 'string') {
      return NextResponse.json({ error: 'bio must be a string' }, { status: 400 });
    }
    if (bio.length > 190) {
      return NextResponse.json({ error: 'Bio must be 190 characters or fewer' }, { status: 400 });
    }
    const db = getDb();
    await db.collection('botConfig').doc('profile').set(
      { bio, bioUpdatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
