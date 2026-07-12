import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  CONTACT_INFO_FIELDS,
  LOCAL_INDUCTION_FIELDS,
  QUIZ_QUESTIONS,
  SECTION_LABELS,
  isSectionKey,
} from '../shared/constants.js';
import {
  insertContactInfo,
  insertLocalInduction,
  insertQuiz,
  insertWideningAccess,
  isSectionGranted,
  hasSubmittedSection,
} from './_lib/db.js';
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
  const section = body.section;
  if (typeof section !== 'string' || !isSectionKey(section) || section === 'feedback') {
    res.status(400).json({ error: 'Unknown or invalid Day 1 section.' });
    return;
  }

  const userId = session.userId;
  const studentName = session.name;

  const granted = await isSectionGranted(userId, section);
  if (!granted) {
    res.status(403).json({ error: `${SECTION_LABELS[section]} has not been unlocked for you yet. Ask your admin for access.` });
    return;
  }

  const alreadySubmitted = await hasSubmittedSection(userId, section);
  if (alreadySubmitted) {
    res.status(409).json({ error: `You have already submitted ${SECTION_LABELS[section]}.` });
    return;
  }

  if (section === 'contactInfo') {
    const contactInfo = body.contactInfo ?? {};
    const errors = missingRequiredFields(CONTACT_INFO_FIELDS, contactInfo);
    if (contactInfo.email && !isValidEmail(contactInfo.email)) {
      errors.push('Email Address is not a valid email.');
    }
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(' ') });
      return;
    }
    await insertContactInfo({ userId, studentName, ...contactInfo });
  } else if (section === 'wideningAccess') {
    const wideningAccess = body.wideningAccess ?? {};
    await insertWideningAccess({ userId, studentName, ...wideningAccess });
  } else if (section === 'localInduction') {
    const localInduction = body.localInduction ?? {};
    const errors = missingRequiredFields(LOCAL_INDUCTION_FIELDS, localInduction);
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(' ') });
      return;
    }
    await insertLocalInduction({ userId, studentName, ...localInduction });
  } else if (section === 'quiz') {
    const quizAnswers = body.quizAnswers ?? {};
    const missingQuizAnswers = QUIZ_QUESTIONS.filter((q) => {
      const answer = quizAnswers[q.id];
      return typeof answer !== 'number' || answer < 0 || answer >= q.options.length;
    });
    if (missingQuizAnswers.length > 0) {
      res.status(400).json({ error: 'Please answer every quiz question.' });
      return;
    }
    let score = 0;
    for (const q of QUIZ_QUESTIONS) {
      if (quizAnswers[q.id] === q.correctIndex) score += 1;
    }
    await insertQuiz({ userId, studentName, answers: quizAnswers, score, total: QUIZ_QUESTIONS.length });
  }

  try {
    await sendAdminNotification(
      `New Day 1 submission — ${studentName} (${SECTION_LABELS[section]})`,
      `${studentName} (${session.email}) submitted the "${SECTION_LABELS[section]}" section of their Day 1 forms.\n\n` +
        `The full workbook is attached as an Excel file.`,
    );
  } catch (err) {
    // Data is already saved; surface the email failure without losing the submission.
    console.error('Failed to send admin notification email', err);
  }

  res.status(200).json({ ok: true });
}
