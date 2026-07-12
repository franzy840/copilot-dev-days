import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CONTACT_INFO_FIELDS,
  LOCAL_INDUCTION_FIELDS,
  QUIZ_QUESTIONS,
} from '../shared/constants.js';
import { insertContactInfo, insertLocalInduction, insertQuiz, insertWideningAccess } from './_lib/db.js';
import { missingRequiredFields, isValidEmail } from './_lib/validate.js';
import { sendAdminNotification } from './_lib/mailer.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = requireAuth(req, res);
  if (!session) return;
  if (session.role !== 'student') {
    res.status(403).json({ error: 'Log in as a student to submit Day 1 forms.' });
    return;
  }

  const body = req.body ?? {};
  const studentName = session.name;
  const contactInfo = body.contactInfo ?? {};
  const wideningAccess = body.wideningAccess ?? {};
  const localInduction = body.localInduction ?? {};
  const quizAnswers = body.quizAnswers ?? {};

  const errors: string[] = [];

  errors.push(...missingRequiredFields(CONTACT_INFO_FIELDS, contactInfo));
  errors.push(...missingRequiredFields(LOCAL_INDUCTION_FIELDS, localInduction));

  if (contactInfo.email && !isValidEmail(contactInfo.email)) {
    errors.push('Email Address is not a valid email.');
  }

  const missingQuizAnswers = QUIZ_QUESTIONS.filter((q) => {
    const answer = quizAnswers[q.id];
    return typeof answer !== 'number' || answer < 0 || answer >= q.options.length;
  });
  if (missingQuizAnswers.length > 0) {
    errors.push('Please answer every quiz question.');
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors.join(' ') });
    return;
  }

  let score = 0;
  for (const q of QUIZ_QUESTIONS) {
    if (quizAnswers[q.id] === q.correctIndex) score += 1;
  }

  const userId = session.userId;

  await Promise.all([
    insertContactInfo({ userId, studentName, ...contactInfo }),
    insertWideningAccess({ userId, studentName, ...wideningAccess }),
    insertLocalInduction({ userId, studentName, ...localInduction }),
    insertQuiz({ userId, studentName, answers: quizAnswers, score, total: QUIZ_QUESTIONS.length }),
  ]);

  try {
    await sendAdminNotification(
      `New Day 1 submission — ${studentName}`,
      `${studentName} (${session.email}) submitted their Day 1 forms (Contact Info, Widening Access, ` +
        `Local Induction, Quiz). Quiz score: ${score}/${QUIZ_QUESTIONS.length}.\n\n` +
        `The full workbook is attached as an Excel file.`,
    );
  } catch (err) {
    // Data is already saved; surface the email failure without losing the submission.
    console.error('Failed to send admin notification email', err);
  }

  res.status(200).json({ ok: true });
}
