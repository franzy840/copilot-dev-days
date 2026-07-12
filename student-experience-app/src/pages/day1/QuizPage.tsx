import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '../../../shared/constants';
import QuizSection from '../../components/QuizSection';
import { useAuth } from '../../lib/AuthContext';

export default function QuizPage() {
  const { user, refresh } = useAuth();
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  if (!user.grantedSections.includes('quiz')) return <Navigate to="/day1" replace />;

  if (user.completedSections.includes('quiz') && !done) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Already submitted</h2>
        <p>You've already submitted the Induction Quiz.</p>
        <Link to="/day1">
          <button type="button">Back to Day 1</button>
        </Link>
      </div>
    );
  }

  async function submit() {
    if (Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length) {
      setError('Please answer every quiz question.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/day1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ section: 'quiz', quizAnswers }),
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
        <p>Your Induction Quiz has been submitted.</p>
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
        <h2>Induction Quiz</h2>
        <p className="help">Please answer all questions. Each has only one answer.</p>
        <QuizSection answers={quizAnswers} onAnswer={(id, idx) => setQuizAnswers((s) => ({ ...s, [id]: idx }))} />
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
