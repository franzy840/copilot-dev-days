import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FEEDBACK_STATEMENTS, FEEDBACK_OPEN_FIELDS, HOSPITAL_SUGGESTIONS } from '../../shared/constants';
import LikertQuestion from '../components/LikertQuestion';
import FieldSection from '../components/FieldSection';
import Combobox from '../components/Combobox';
import RequestAccessButton from '../components/RequestAccessButton';
import { useAuth } from '../lib/AuthContext';

interface Rating {
  score?: number;
  comment: string;
}

export default function FeedbackPage() {
  const { user, refresh } = useAuth();
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

  if (!user.grantedSections.includes('feedback')) {
    const pending = user.pendingRequests.includes('feedback');
    return (
      <div className="page">
        <div className="card">
          <h2>Not yet available</h2>
          <p className="help">
            Final Day Feedback has not been unlocked for you yet.{' '}
            {pending ? 'Your request is waiting for admin approval.' : 'You can ask your admin for access below.'}
          </p>
          <div className="actions">
            <Link to="/day1">
              <button type="button" className="secondary">Back to Day 1</button>
            </Link>
            {pending ? (
              <span className="badge badge-pending">Requested</span>
            ) : (
              <RequestAccessButton section="feedback" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.completedSections.includes('feedback') && !done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Already submitted</h2>
        <p>You've already submitted your Final Day feedback. Thank you!</p>
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
      await refresh();
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
