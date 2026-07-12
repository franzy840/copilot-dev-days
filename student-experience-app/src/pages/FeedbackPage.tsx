import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FEEDBACK_STATEMENTS, FEEDBACK_OPEN_FIELDS, HOSPITAL_SUGGESTIONS } from '../../shared/constants';
import LikertQuestion from '../components/LikertQuestion';
import FieldSection from '../components/FieldSection';
import Combobox from '../components/Combobox';
import { useAuth } from '../lib/AuthContext';

interface Rating {
  score?: number;
  comment: string;
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hospital, setHospital] = useState('');
  const [team, setTeam] = useState('');
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [openFields, setOpenFields] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  if (!user.day1Completed) {
    return (
      <div className="page">
        <div className="card">
          <h2>Complete Day 1 first</h2>
          <p className="help">
            You'll need to finish your Day 1 forms (contact info, widening access, local induction and
            the induction quiz) before you can submit Final Day feedback.
          </p>
          <Link to="/day1">
            <button type="button">Go to Day 1 forms</button>
          </Link>
        </div>
      </div>
    );
  }

  function setScore(id: string, score: number) {
    setRatings((s) => ({ ...s, [id]: { ...s[id], score } }));
  }

  function setComment(id: string, comment: string) {
    setRatings((s) => ({ ...s, [id]: { ...s[id], comment } }));
  }

  async function submit() {
    const incomplete = FEEDBACK_STATEMENTS.some((s) => ratings[s.id]?.score === undefined);
    if (incomplete) {
      setError('Please rate every statement from 1 to 4.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          hospital: hospital || undefined,
          team: team || undefined,
          ratings,
          ...openFields,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong submitting the form.');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong submitting the form.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Thank you for your feedback!</h2>
        <p>It really helps us improve future placements.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Work Experience Feedback</h2>
        <p className="help">
          Submitting as <strong>{user.name}</strong> ({user.email}). We like to be able to provide
          valuable experience for all students who join our hospitals and your feedback is extremely
          helpful. Please answer honestly — this will enable us to make any necessary amendments to
          benefit future students.
        </p>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="dateFrom">Dates you attended — from</label>
          <input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dateTo">Dates you attended — to</label>
          <input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hospital">Hospital</label>
          <Combobox id="hospital" value={hospital} suggestions={HOSPITAL_SUGGESTIONS} placeholder="Choose or type…" onChange={setHospital} />
        </div>
        <div className="field">
          <label htmlFor="team">Team</label>
          <input id="team" type="text" value={team} onChange={(e) => setTeam(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {FEEDBACK_STATEMENTS.map((s, i) => (
          <LikertQuestion
            key={s.id}
            index={i + 1}
            text={s.text}
            score={ratings[s.id]?.score}
            comment={ratings[s.id]?.comment ?? ''}
            onScore={(score) => setScore(s.id, score)}
            onComment={(comment) => setComment(s.id, comment)}
          />
        ))}
      </div>

      <div className="card">
        <FieldSection
          fields={FEEDBACK_OPEN_FIELDS}
          values={openFields}
          onChange={(name, value) => setOpenFields((s) => ({ ...s, [name]: value }))}
        />
      </div>

      <div className="actions">
        <span />
        <button type="button" onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
