import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { WIDENING_ACCESS_FIELDS } from '../../../shared/constants';
import FieldSection from '../../components/FieldSection';
import { useAuth } from '../../lib/AuthContext';

export default function WideningAccessPage() {
  const { user, refresh } = useAuth();
  const [wideningAccess, setWideningAccess] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  if (!user.grantedSections.includes('wideningAccess')) return <Navigate to="/day1" replace />;

  if (user.completedSections.includes('wideningAccess') && !done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Already submitted</h2>
        <p>You've already submitted the Widening Access Participation Survey.</p>
        <Link to="/day1">
          <button type="button">Back to Day 1</button>
        </Link>
      </div>
    );
  }

  async function submit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/day1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ section: 'wideningAccess', wideningAccess }),
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
        <h2>Thank you, {user.name}!</h2>
        <p>Your Widening Access Participation Survey has been submitted.</p>
        <Link to="/day1">
          <button type="button">Back to Day 1</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      {error && <div className="error-banner">{error}</div>}
      <div className="card">
        <h2>Widening Access Participation Survey</h2>
        <p className="help">
          These questions have no impact on your placement. NHS England uses this data (with no
          personally identifiable information) to monitor access to work experience. Answering is
          optional — choose "Prefer not to say" for anything you'd rather skip.
        </p>
        <FieldSection
          fields={WIDENING_ACCESS_FIELDS}
          values={wideningAccess}
          onChange={(name, value) => setWideningAccess((s) => ({ ...s, [name]: value }))}
        />
      </div>
      <div className="actions">
        <Link to="/day1">
          <button type="button" className="secondary" disabled={submitting}>
            Back
          </button>
        </Link>
        <button type="button" onClick={submit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
