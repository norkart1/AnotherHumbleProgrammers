import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'botdash_auth';

async function generateExpectedToken(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode('botdash-auth'));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = ['/login', '/api/login', '/api/logout'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.SESSION_SECRET || process.env.DASHBOARD_PASSWORD || 'fallback';
  const expected = await generateExpectedToken(secret);

  if (!token || token !== expected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
