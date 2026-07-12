import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEEDBACK_STATEMENTS, CONCERN_FIELD_NAME, SECTION_LABELS } from '../shared/constants.js';
import { insertFeedback, isSectionGranted, hasSubmittedSection } from './_lib/db.js';
import { sendAdminNotification, sendUrgentAlert } from './_lib/mailer.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAuth(req, res);
  if (!session) return;
  if (session.role !== 'student') {
    res.status(403).json({ error: 'Log in as a student to submit feedback.' });
    return;
  }

  const granted = await isSectionGranted(session.userId, 'feedback');
  if (!granted) {
    res.status(403).json({ error: `${SECTION_LABELS.feedback} has not been unlocked for you yet. Ask your admin for access.` });
    return;
  }

  const alreadySubmitted = await hasSubmittedSection(session.userId, 'feedback');
  if (alreadySubmitted) {
    res.status(409).json({ error: `You have already submitted ${SECTION_LABELS.feedback}.` });
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

  const concern = typeof body.concern === 'string' ? body.concern.trim() : '';
  const studentName = session.name;
  const userId = session.userId;

  await insertFeedback({
    userId,
    studentName,
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

  try {
    if (concern.length > 0) {
      await sendUrgentAlert(
        '⚠️ URGENT — Work experience concern reported',
        `${studentName} (${session.email}) flagged a concern on the Final Day feedback form (field: "${CONCERN_FIELD_NAME}"):\n\n"${concern}"\n\n` +
          `Review the Feedback tab in the exported workbook for full context.`,
      );
    }

    await sendAdminNotification(
      `New Final Day feedback — ${studentName}`,
      `${studentName} (${session.email}) submitted their Final Day feedback form.\n\nThe full workbook is attached as an Excel file.`,
    );
  } catch (err) {
    console.error('Failed to send admin notification email', err);
  }

  res.status(200).json({ ok: true });
}
