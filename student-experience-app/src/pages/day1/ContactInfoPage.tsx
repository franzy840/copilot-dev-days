import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CONTACT_INFO_FIELDS } from '../../../shared/constants';
import FieldSection from '../../components/FieldSection';
import { useAuth } from '../../lib/AuthContext';

export default function ContactInfoPage() {
  const { user, refresh } = useAuth();
  const [contactInfo, setContactInfo] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  if (!user.grantedSections.includes('contactInfo')) return <Navigate to="/day1" replace />;

  if (user.completedSections.includes('contactInfo') && !done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Already submitted</h2>
        <p>You've already submitted your Contact Information.</p>
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
        body: JSON.stringify({ section: 'contactInfo', contactInfo }),
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
        <p>Your Contact Information has been submitted.</p>
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
        <h2>Contact Information</h2>
        <p className="help">
          For emergency use only. This information is kept strictly private and confidential and is
          only ever used when relevant to your placement.
        </p>
        <FieldSection
          fields={CONTACT_INFO_FIELDS}
          values={contactInfo}
          onChange={(name, value) => setContactInfo((s) => ({ ...s, [name]: value }))}
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
