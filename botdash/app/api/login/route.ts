import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyCredentials, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = generateToken();
  const res = NextResponse.json({ success: true });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
