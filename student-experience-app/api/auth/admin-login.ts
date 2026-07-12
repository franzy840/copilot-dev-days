import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ADMIN_EMAIL } from '../../shared/constants.js';
import { setSessionCookie, timingSafeEqual } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    res.status(500).json({ error: 'Admin login is not configured (ADMIN_PASSWORD is not set).' });
    return;
  }

  const emailMatches = email.length > 0 && timingSafeEqual(email, ADMIN_EMAIL.toLowerCase());
  const passwordMatches = password.length > 0 && timingSafeEqual(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }

  setSessionCookie(res, { role: 'admin', email: ADMIN_EMAIL });
  res.status(200).json({ ok: true });
}
