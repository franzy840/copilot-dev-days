import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findUserByEmail } from '../_lib/db.js';
import { verifyPassword, setSessionCookie } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const genericError = { error: 'Incorrect email or password.' };

  const user = await findUserByEmail(email);
  if (!user || !user.password_hash) {
    res.status(401).json(genericError);
    return;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json(genericError);
    return;
  }

  setSessionCookie(res, { role: 'student', userId: user.id, name: user.name, email: user.email });
  res.status(200).json({ ok: true });
}
