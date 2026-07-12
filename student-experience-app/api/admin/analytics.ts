import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/auth.js';
import { fetchAnalytics } from '../_lib/db.js';
import { FEEDBACK_STATEMENTS } from '../../shared/constants.js';

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
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!requireAdmin(req, res)) return;

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
