import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createUser, findUserByEmail } from '../_lib/db.js';
import { hashPassword, setSessionCookie } from '../_lib/auth.js';

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
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists. Please log in instead.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(name, email, passwordHash);

  setSessionCookie(res, { role: 'student', userId: user.id, name: user.name, email: user.email });
  res.status(200).json({ ok: true });
}
