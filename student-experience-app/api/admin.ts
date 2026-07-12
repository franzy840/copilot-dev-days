import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin, hashPassword, generateTempPassword } from './_lib/auth.js';
import {
  listUsersForAdmin,
  fetchTableForAdmin,
  isAdminTableKey,
  fetchAnalytics,
  findUserById,
  updateUserPassword,
  grantSection,
  revokeSection,
} from './_lib/db.js';
import { formatQuizAnswers, formatFeedbackRatings } from './_lib/format.js';
import { buildWorkbookBuffer } from './_lib/excel.js';
import { sendAdminNotification } from './_lib/mailer.js';
import { FEEDBACK_STATEMENTS, QUIZ_QUESTIONS, isSectionKey } from '../shared/constants.js';

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
    if (body.action === 'grant-access') return handleGrantAccess(req, res);
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

function byDate(rows: { day: string; count: string }[]) {
  return rows.map((r) => ({
    date: typeof r.day === 'string' ? r.day.slice(0, 10) : new Date(r.day).toISOString().slice(0, 10),
    count: Number(r.count),
  }));
}

async function handleAnalytics(res: VercelResponse) {
  const data = await fetchAnalytics();

  const totalUsers = Number(data.totals?.total_users ?? 0);
  const day1Completed = Number(data.totals?.day1_completed ?? 0);
  const feedbackCompleted = Number(data.totals?.feedback_completed ?? 0);

  const quizScoreDistribution = (data.quizScores as { score: number; count: string }[]).map((r) => ({
    score: r.score,
    count: Number(r.count),
  }));
  const totalQuizzes = quizScoreDistribution.reduce((sum, r) => sum + r.count, 0);
  const averageQuizScore =
    totalQuizzes > 0 ? quizScoreDistribution.reduce((sum, r) => sum + r.score * r.count, 0) / totalQuizzes : 0;

  const quizQuestionAccuracy = QUIZ_QUESTIONS.map((q, i) => {
    const answered = data.quizAnswers.filter((a) => typeof a[q.id] === 'number');
    const correct = answered.filter((a) => a[q.id] === q.correctIndex);
    const pct = answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : 0;
    return { label: `Q${i + 1}. ${q.question}`, value: pct };
  }).sort((a, b) => a.value - b.value);

  const feedbackAverages = FEEDBACK_STATEMENTS.map((s) => {
    const scores = (data.feedbackRatingsRaw as { ratings: Record<string, { score: number }> }[])
      .map((r) => r.ratings?.[s.id]?.score)
      .filter((n): n is number => typeof n === 'number');
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { id: s.id, text: s.text, average: Math.round(average * 100) / 100, count: scores.length };
  });
  const statementsWithData = feedbackAverages.filter((s) => s.count > 0);
  const feedbackOverallAverage =
    statementsWithData.length > 0
      ? Math.round((statementsWithData.reduce((sum, s) => sum + s.average, 0) / statementsWithData.length) * 100) / 100
      : 0;

  const widening = data.wideningRows as {
    age: string | null;
    gender: string | null;
    trans_identification: string | null;
    sexual_orientation: string | null;
    ethnicity: string | null;
    disabilities: string | null;
    household_occupation_at_14: string | null;
    school_type_11_to_15: string | null;
    free_school_meals: string | null;
    parents_attended_university: string | null;
  }[];

  const ages = widening
    .map((r) => (r.age ? Number(r.age) : NaN))
    .filter((n) => Number.isFinite(n));
  const ageBuckets = AGE_BUCKETS.map(([label, min, max]) => ({
    label,
    count: ages.filter((age) => age >= min && age <= max).length,
  }));

  const genderCounts = tally(widening.map((r) => r.gender));
  const transIdentificationCounts = tally(widening.map((r) => r.trans_identification));
  const sexualOrientationCounts = tally(widening.map((r) => r.sexual_orientation));
  const ethnicityCounts = tally(widening.map((r) => r.ethnicity));
  const disabilityCounts = tally(widening.map((r) => r.disabilities));
  const householdOccupationCounts = tally(widening.map((r) => r.household_occupation_at_14));
  const schoolTypeCounts = tally(widening.map((r) => r.school_type_11_to_15));
  const freeSchoolMealsCounts = tally(widening.map((r) => r.free_school_meals));
  const parentsAttendedUniversityCounts = tally(widening.map((r) => r.parents_attended_university));

  const departmentCounts = tally(data.departments);
  const hospitalCounts = tally(data.hospitals);

  res.status(200).json({
    totals: {
      totalUsers,
      day1Completed,
      feedbackCompleted,
      averageQuizScore: Math.round(averageQuizScore * 10) / 10,
      feedbackOverallAverage,
      concernCount: data.concernCount,
      day1ConversionRate: totalUsers > 0 ? Math.round((day1Completed / totalUsers) * 100) : 0,
      feedbackConversionRate: day1Completed > 0 ? Math.round((feedbackCompleted / day1Completed) * 100) : 0,
    },
    quizScoreDistribution,
    quizQuestionAccuracy,
    feedbackAverages,
    ageBuckets,
    genderCounts,
    transIdentificationCounts,
    sexualOrientationCounts,
    ethnicityCounts,
    disabilityCounts,
    householdOccupationCounts,
    schoolTypeCounts,
    freeSchoolMealsCounts,
    parentsAttendedUniversityCounts,
    departmentCounts,
    hospitalCounts,
    day1SubmissionsByDate: byDate(data.day1ByDate as { day: string; count: string }[]),
    feedbackSubmissionsByDate: byDate(data.feedbackByDate as { day: string; count: string }[]),
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

async function handleGrantAccess(req: VercelRequest, res: VercelResponse) {
  const userId = Number(req.body?.userId);
  const section = req.body?.section;
  const granted = req.body?.granted;

  if (!Number.isInteger(userId)) {
    res.status(400).json({ error: 'Missing or invalid userId.' });
    return;
  }
  if (typeof section !== 'string' || !isSectionKey(section)) {
    res.status(400).json({ error: 'Unknown section.' });
    return;
  }
  if (typeof granted !== 'boolean') {
    res.status(400).json({ error: 'Missing or invalid granted flag.' });
    return;
  }

  const user = await findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (granted) {
    await grantSection(userId, section);
  } else {
    await revokeSection(userId, section);
  }

  res.status(200).json({ ok: true });
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
