import type { VercelRequest, VercelResponse } from '@vercel/node';
import { consumeLoginToken, findUserById } from '../_lib/db.js';
import { setSessionCookie } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = typeof req.query.token === 'string' ? req.query.token : '';
  const userId = token ? await consumeLoginToken(token) : null;

  if (!userId) {
    res.status(400).send('This login link is invalid or has expired. Go back and request a new one.');
    return;
  }

  const user = await findUserById(userId);
  if (!user) {
    res.status(400).send('Account not found.');
    return;
  }

  setSessionCookie(res, { role: 'student', userId: user.id, name: user.name, email: user.email });
  res.writeHead(302, { Location: '/' });
  res.end();
}
