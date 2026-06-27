import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const snap = await db.collection('botConfig').doc('profile').get();
    if (!snap.exists) return NextResponse.json({ avatar: null, banner: null });
    const data = snap.data()!;
    return NextResponse.json({
      avatarUpdatedAt: data.avatarUpdatedAt?.toDate?.()?.toISOString() || null,
      bannerUpdatedAt: data.bannerUpdatedAt?.toDate?.()?.toISOString() || null,
      hasAvatar: !!data.avatar,
      hasBanner: !!data.banner,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, dataUrl } = await req.json();

    if (!['avatar', 'banner'].includes(type)) {
      return NextResponse.json({ error: 'type must be avatar or banner' }, { status: 400 });
    }
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Rough size check — base64 of 800KB image ≈ 1.1MB string, near Firestore doc limit
    if (dataUrl.length > 900_000) {
      return NextResponse.json({ error: 'Image too large. Please use a smaller image.' }, { status: 400 });
    }

    const db = getDb();
    await db.collection('botConfig').doc('profile').set(
      {
        [type]: dataUrl,
        [`${type}UpdatedAt`]: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
