import { useEffect, useState } from 'react';
import StatTile from '../../components/charts/StatTile';
import BarChart from '../../components/charts/BarChart';

interface Bucket {
  label: string;
  count: number;
}

interface Analytics {
  totals: {
    totalUsers: number;
    day1Completed: number;
    feedbackCompleted: number;
    averageQuizScore: number;
    feedbackOverallAverage: number;
    concernCount: number;
    day1ConversionRate: number;
    feedbackConversionRate: number;
  };
  quizScoreDistribution: { score: number; count: number }[];
  quizQuestionAccuracy: { label: string; value: number }[];
  feedbackAverages: { id: string; text: string; average: number; count: number }[];
  ageBuckets: Bucket[];
  genderCounts: Bucket[];
  transIdentificationCounts: Bucket[];
  sexualOrientationCounts: Bucket[];
  ethnicityCounts: Bucket[];
  disabilityCounts: Bucket[];
  householdOccupationCounts: Bucket[];
  schoolTypeCounts: Bucket[];
  freeSchoolMealsCounts: Bucket[];
  parentsAttendedUniversityCounts: Bucket[];
  departmentCounts: Bucket[];
  hospitalCounts: Bucket[];
  day1SubmissionsByDate: { date: string; count: number }[];
  feedbackSubmissionsByDate: { date: string; count: number }[];
}

const asBars = (buckets: Bucket[]) => buckets.map((b) => ({ label: b.label, value: b.count }));

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

  const { totals } = data;

  return (
    <div className="analytics">
      <div className="stat-tile-row">
        <StatTile label="Registered students" value={totals.totalUsers} />
        <StatTile label="Completed Day 1" value={`${totals.day1Completed} (${totals.day1ConversionRate}%)`} />
        <StatTile label="Completed Feedback" value={`${totals.feedbackCompleted} (${totals.feedbackConversionRate}%)`} />
        <StatTile label="Average quiz score" value={`${totals.averageQuizScore}/10`} />
        <StatTile label="Average feedback rating" value={totals.feedbackOverallAverage > 0 ? `${totals.feedbackOverallAverage}/4` : '—'} />
        <StatTile label="Concerns flagged" value={totals.concernCount} tone={totals.concernCount > 0 ? 'danger' : 'default'} />
      </div>

      <h3 className="analytics-heading">Completion Funnel</h3>
      <BarChart
        title="Signed up → Day 1 → Feedback"
        data={[
          { label: 'Signed up', value: totals.totalUsers },
          { label: 'Day 1 complete', value: totals.day1Completed },
          { label: 'Feedback complete', value: totals.feedbackCompleted },
        ]}
        max={Math.max(1, totals.totalUsers)}
      />

      <h3 className="analytics-heading">Induction Quiz</h3>
      <BarChart
        title="Score distribution"
        data={data.quizScoreDistribution.map((d) => ({ label: `${d.score}/10`, value: d.count }))}
      />
      <BarChart
        title="Question accuracy (weakest first)"
        data={data.quizQuestionAccuracy}
        max={100}
        valueFormatter={(v) => `${v}%`}
      />

      <h3 className="analytics-heading">Final Day Feedback</h3>
      <BarChart
        title="Average rating per statement (1–4)"
        data={data.feedbackAverages.map((d) => ({ label: d.text, value: d.average }))}
        max={4}
        valueFormatter={(v) => v.toFixed(2)}
      />

      <h3 className="analytics-heading">Widening Access Demographics</h3>
      <div className="chart-grid">
        <BarChart title="Age" data={asBars(data.ageBuckets)} />
        <BarChart title="Gender" data={asBars(data.genderCounts)} />
        <BarChart title="Trans Identification" data={asBars(data.transIdentificationCounts)} />
        <BarChart title="Sexual Orientation" data={asBars(data.sexualOrientationCounts)} />
        <BarChart title="Ethnicity" data={asBars(data.ethnicityCounts)} />
        <BarChart title="Disabilities" data={asBars(data.disabilityCounts)} />
        <BarChart title="Household Occupation at 14" data={asBars(data.householdOccupationCounts)} />
        <BarChart title="School Type (ages 11–15)" data={asBars(data.schoolTypeCounts)} />
        <BarChart title="Free School Meals" data={asBars(data.freeSchoolMealsCounts)} />
        <BarChart title="Parents Attended University" data={asBars(data.parentsAttendedUniversityCounts)} />
      </div>

      <h3 className="analytics-heading">Placement Details</h3>
      <div className="chart-grid">
        <BarChart title="Departments / Wards" data={asBars(data.departmentCounts)} />
        <BarChart title="Hospitals (feedback)" data={asBars(data.hospitalCounts)} />
      </div>

      <h3 className="analytics-heading">Activity Over Time</h3>
      <div className="chart-grid">
        <BarChart title="Day 1 submissions by date" data={data.day1SubmissionsByDate.map((d) => ({ label: d.date, value: d.count }))} />
        <BarChart title="Feedback submissions by date" data={data.feedbackSubmissionsByDate.map((d) => ({ label: d.date, value: d.count }))} />
      </div>
    </div>
  );
}
