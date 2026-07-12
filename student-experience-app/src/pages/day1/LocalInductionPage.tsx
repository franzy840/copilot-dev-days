import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LOCAL_INDUCTION_FIELDS } from '../../../shared/constants';
import FieldSection from '../../components/FieldSection';
import { useAuth } from '../../lib/AuthContext';

export default function LocalInductionPage() {
  const { user, refresh } = useAuth();
  const [localInduction, setLocalInduction] = useState<Record<string, string>>(() => ({
    inductionDate: new Date().toISOString().slice(0, 10),
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  if (!user.grantedSections.includes('localInduction')) return <Navigate to="/day1" replace />;

  if (user.completedSections.includes('localInduction') && !done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Already submitted</h2>
        <p>You've already submitted your Local Induction.</p>
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
        body: JSON.stringify({ section: 'localInduction', localInduction }),
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
        <p>Your Local Induction has been submitted.</p>
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
        <h2>Local Induction</h2>
        <p className="help">
          Confirms departmental risks have been highlighted to you before you start, including fire
          evacuation information and assembly points for your specific ward or area. If any incident
          involves a work experience student, the Undergraduate Team must be told (Ext 5180).
        </p>
        <FieldSection
          fields={LOCAL_INDUCTION_FIELDS}
          values={localInduction}
          onChange={(name, value) => setLocalInduction((s) => ({ ...s, [name]: value }))}
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
