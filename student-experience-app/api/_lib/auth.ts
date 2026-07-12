import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Session =
  | { role: 'student'; userId: number; name: string; email: string }
  | { role: 'admin'; email: string };

const COOKIE_NAME = 'wex_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days - a work experience week plus margin

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return secret;
}

export function signSession(session: Session): string {
  return jwt.sign(session, getJwtSecret(), { expiresIn: SESSION_MAX_AGE_SECONDS });
}

export function verifySessionToken(token: string): Session | null {
  try {
    return jwt.verify(token, getJwtSecret()) as Session;
  } catch {
    return null;
  }
}

export function getSession(req: VercelRequest): Session | null {
  const cookies = parseCookie(req.headers.cookie ?? '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(res: VercelResponse, session: Session) {
  const token = signSession(session);
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    }),
  );
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(COOKIE_NAME, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
  );
}

/** Returns the session, or writes a 401 response and returns null. */
export function requireAuth(req: VercelRequest, res: VercelResponse): Session | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Please log in.' });
    return null;
  }
  return session;
}

/** Returns the admin session, or writes a 401/403 response and returns null. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): Session | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Please log in.' });
    return null;
  }
  if (session.role !== 'admin') {
    res.status(403).json({ error: 'Admin access only.' });
    return null;
  }
  return session;
}

export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
