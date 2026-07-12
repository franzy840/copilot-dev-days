import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth.js';
import { fetchTableForAdmin, isAdminTableKey } from '../_lib/db.js';
import { formatQuizAnswers, formatFeedbackRatings } from '../_lib/format.js';

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

  const formatted = rows.map((row) => {
    if (table === 'quiz' && row.answers) {
      return { ...row, answers: formatQuizAnswers(row.answers as Record<string, number>) };
    }
    if (table === 'feedback' && row.ratings) {
      return { ...row, ratings: formatFeedbackRatings(row.ratings as Record<string, { score?: number; comment?: string }>) };
    }
    return row;
  });

  res.status(200).json({ rows: formatted });
}
