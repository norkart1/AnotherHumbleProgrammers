import { createHmac } from 'crypto';

export const COOKIE_NAME = 'botdash_auth';

export function generateToken(): string {
  const secret = process.env.SESSION_SECRET || process.env.DASHBOARD_PASSWORD || 'fallback';
  return createHmac('sha256', secret).update('botdash-auth').digest('hex');
}

export function verifyCredentials(username: string, password: string): boolean {
  return (
    username === process.env.DASHBOARD_USERNAME &&
    password === process.env.DASHBOARD_PASSWORD
  );
}
