import type { VercelRequest, VercelResponse } from '@vercel/node';
import { upsertUser, createLoginToken } from '../_lib/db.js';
import { generateMagicToken } from '../_lib/auth.js';
import { sendMagicLinkEmail } from '../_lib/mailer.js';

const TOKEN_TTL_MINUTES = 15;

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!name) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const user = await upsertUser(name, email);
  const token = generateMagicToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);
  await createLoginToken(user.id, token, expiresAt);

  const host = req.headers.host ?? '';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const link = `${protocol}://${host}/api/auth/verify?token=${token}`;

  await sendMagicLinkEmail(user.email, link);

  res.status(200).json({ ok: true });
}
