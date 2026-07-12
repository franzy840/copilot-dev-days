import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth.js';
import { sendAdminNotification } from '../_lib/mailer.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAdmin(req, res)) return;

  try {
    await sendAdminNotification(
      'Work experience records export',
      'Requested manually from the admin dashboard. The full workbook is attached as an Excel file.',
    );
  } catch (err) {
    console.error('Failed to send export email', err);
    res.status(502).json({ error: 'Failed to send email. Check GMAIL_USER/GMAIL_APP_PASSWORD are set correctly.' });
    return;
  }

  res.status(200).json({ ok: true });
}
