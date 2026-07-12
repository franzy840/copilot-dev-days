import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin, hashPassword, generateTempPassword } from '../_lib/auth.js';
import { findUserById, updateUserPassword } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const userId = Number(req.body?.userId);
  if (!Number.isInteger(userId)) {
    res.status(400).json({ error: 'Missing or invalid userId.' });
    return;
  }

  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const tempPassword = generateTempPassword();
  await updateUserPassword(userId, await hashPassword(tempPassword));

  res.status(200).json({ ok: true, tempPassword, name: user.name, email: user.email });
}
