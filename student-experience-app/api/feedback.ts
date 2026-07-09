import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEEDBACK_STATEMENTS, CONCERN_FIELD_NAME } from '../shared/constants';
import { insertFeedback } from './_lib/db';
import { sendAdminNotification, sendUrgentAlert } from './_lib/mailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body ?? {};
  const ratings = body.ratings ?? {};

  const missingRatings = FEEDBACK_STATEMENTS.filter((s) => {
    const r = ratings[s.id];
    return !r || typeof r.score !== 'number' || r.score < 1 || r.score > 4;
  });
  if (missingRatings.length > 0) {
    res.status(400).json({ error: 'Please rate every statement from 1 to 4.' });
    return;
  }

  const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : undefined;
  const concern = typeof body.concern === 'string' ? body.concern.trim() : '';

  await insertFeedback({
    studentName: studentName || undefined,
    dateFrom: body.dateFrom || undefined,
    dateTo: body.dateTo || undefined,
    hospital: body.hospital || undefined,
    team: body.team || undefined,
    ratings,
    careerInfluence: body.careerInfluence || undefined,
    mostUseful: body.mostUseful || undefined,
    suggestions: body.suggestions || undefined,
    concern: concern || undefined,
    careerPathUse: body.careerPathUse || undefined,
    memorableMention: body.memorableMention || undefined,
    otherComments: body.otherComments || undefined,
  });

  const who = studentName || 'An anonymous student';

  try {
    if (concern.length > 0) {
      await sendUrgentAlert(
        '⚠️ URGENT — Work experience concern reported',
        `${who} flagged a concern on the Final Day feedback form (field: "${CONCERN_FIELD_NAME}"):\n\n"${concern}"\n\n` +
          `Review the Feedback tab in the exported workbook for full context.`,
      );
    }

    await sendAdminNotification(
      `New Final Day feedback — ${who}`,
      `${who} submitted their Final Day feedback form.\n\nThe full workbook is attached as an Excel file.`,
    );
  } catch (err) {
    console.error('Failed to send admin notification email', err);
  }

  res.status(200).json({ ok: true });
}
