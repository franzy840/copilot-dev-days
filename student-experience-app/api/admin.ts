import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin, hashPassword, generateTempPassword } from './_lib/auth.js';
import { listUsersForAdmin, fetchTableForAdmin, isAdminTableKey, fetchAnalytics, findUserById, updateUserPassword } from './_lib/db.js';
import { formatQuizAnswers, formatFeedbackRatings } from './_lib/format.js';
import { buildWorkbookBuffer } from './_lib/excel.js';
import { sendAdminNotification } from './_lib/mailer.js';
import { FEEDBACK_STATEMENTS } from '../shared/constants.js';

// Consolidated: users, responses, analytics, export, and reset-password all
// live in one serverless function (Vercel's Hobby plan caps a deployment
// at 12 functions - one file per action would blow past that fast).

const AGE_BUCKETS: [label: string, min: number, max: number][] = [
  ['Under 16', 0, 15],
  ['16-18', 16, 18],
  ['19-24', 19, 24],
  ['25-29', 25, 29],
  ['30-39', 30, 39],
  ['40-49', 40, 49],
  ['50-59', 50, 59],
  ['60+', 60, 200],
];

function tally(values: Array<string | null>): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = raw && raw.trim() ? raw : 'Not answered';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const resource = typeof req.query.resource === 'string' ? req.query.resource : '';
    if (resource === 'users') return handleUsers(res);
    if (resource === 'responses') return handleResponses(req, res);
    if (resource === 'analytics') return handleAnalytics(res);
    if (resource === 'export') return handleExport(res);
    res.status(400).json({ error: 'Unknown resource.' });
    return;
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    if (body.action === 'reset-password') return handleResetPassword(req, res);
    if (body.action === 'send-export') return handleSendExport(res);
    res.status(400).json({ error: 'Unknown action.' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

async function handleUsers(res: VercelResponse) {
  const users = await listUsersForAdmin();
  res.status(200).json({ users });
}

async function handleResponses(req: VercelRequest, res: VercelResponse) {
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

async function handleAnalytics(res: VercelResponse) {
  const data = await fetchAnalytics();

  const totals = {
    totalUsers: Number(data.totals?.total_users ?? 0),
    day1Completed: Number(data.totals?.day1_completed ?? 0),
    feedbackCompleted: Number(data.totals?.feedback_completed ?? 0),
  };

  const quizScoreDistribution = (data.quizScores as { score: number; count: string }[]).map((r) => ({
    score: r.score,
    count: Number(r.count),
  }));

  const feedbackAverages = FEEDBACK_STATEMENTS.map((s) => {
    const scores = (data.feedbackRatingsRaw as { ratings: Record<string, { score: number }> }[])
      .map((r) => r.ratings?.[s.id]?.score)
      .filter((n): n is number => typeof n === 'number');
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { id: s.id, text: s.text, average: Math.round(average * 100) / 100, count: scores.length };
  });

  const ageBuckets = AGE_BUCKETS.map(([label, min, max]) => ({
    label,
    count: (data.wideningAges as number[]).filter((age) => age >= min && age <= max).length,
  }));

  const categorical = data.wideningCategorical as { gender: string | null; ethnicity: string | null; disabilities: string | null }[];
  const genderCounts = tally(categorical.map((r) => r.gender));
  const ethnicityCounts = tally(categorical.map((r) => r.ethnicity));
  const disabilityCounts = tally(categorical.map((r) => r.disabilities));

  const day1SubmissionsByDate = (data.day1ByDate as { day: string; count: string }[]).map((r) => ({
    date: typeof r.day === 'string' ? r.day.slice(0, 10) : new Date(r.day).toISOString().slice(0, 10),
    count: Number(r.count),
  }));

  res.status(200).json({
    totals,
    quizScoreDistribution,
    feedbackAverages,
    ageBuckets,
    genderCounts,
    ethnicityCounts,
    disabilityCounts,
    day1SubmissionsByDate,
  });
}

async function handleExport(res: VercelResponse) {
  const buffer = await buildWorkbookBuffer();
  const date = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="work-experience-records-${date}.xlsx"`);
  res.status(200).send(buffer);
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
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

async function handleSendExport(res: VercelResponse) {
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
