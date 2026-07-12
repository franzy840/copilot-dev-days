import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth.js';
import { fetchTableForAdmin, isAdminTableKey } from '../_lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const table = typeof req.query.table === 'string' ? req.query.table : '';
  if (!isAdminTableKey(table)) {
    res.status(400).json({ error: 'Unknown table.' });
    return;
  }

  const rows = await fetchTableForAdmin(table);
  res.status(200).json({ rows });
}
