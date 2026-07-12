import { useEffect, useState } from 'react';
import StatTile from '../../components/charts/StatTile';
import BarChart from '../../components/charts/BarChart';

interface Analytics {
  totals: { totalUsers: number; day1Completed: number; feedbackCompleted: number };
  quizScoreDistribution: { score: number; count: number }[];
  feedbackAverages: { id: string; text: string; average: number; count: number }[];
  ageBuckets: { label: string; count: number }[];
  genderCounts: { label: string; count: number }[];
  ethnicityCounts: { label: string; count: number }[];
  disabilityCounts: { label: string; count: number }[];
  day1SubmissionsByDate: { date: string; count: number }[];
}

export default function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin?resource=analytics', { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load analytics.');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load analytics.'));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <p className="help">Loading…</p>;

  return (
    <div className="analytics">
      <div className="stat-tile-row">
        <StatTile label="Registered students" value={data.totals.totalUsers} />
        <StatTile label="Completed Day 1" value={data.totals.day1Completed} />
        <StatTile label="Completed Feedback" value={data.totals.feedbackCompleted} />
      </div>

      <BarChart
        title="Quiz score distribution"
        data={data.quizScoreDistribution.map((d) => ({ label: `${d.score}/10`, value: d.count }))}
      />

      <BarChart
        title="Feedback — average rating per statement (1–4)"
        data={data.feedbackAverages.map((d) => ({ label: d.text, value: d.average }))}
        max={4}
        valueFormatter={(v) => v.toFixed(2)}
      />

      <BarChart title="Widening Access — Age" data={data.ageBuckets.map((d) => ({ label: d.label, value: d.count }))} />
      <BarChart title="Widening Access — Gender" data={data.genderCounts.map((d) => ({ label: d.label, value: d.count }))} />
      <BarChart title="Widening Access — Ethnicity" data={data.ethnicityCounts.map((d) => ({ label: d.label, value: d.count }))} />
      <BarChart title="Widening Access — Disabilities" data={data.disabilityCounts.map((d) => ({ label: d.label, value: d.count }))} />

      <BarChart title="Day 1 submissions by date" data={data.day1SubmissionsByDate.map((d) => ({ label: d.date, value: d.count }))} />
    </div>
  );
}
