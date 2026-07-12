import { useState } from 'react';
import {
  CONTACT_INFO_FIELDS,
  WIDENING_ACCESS_FIELDS,
  LOCAL_INDUCTION_FIELDS,
  QUIZ_QUESTIONS,
} from '../../shared/constants';
import FieldSection from '../components/FieldSection';
import QuizSection from '../components/QuizSection';
import { useAuth } from '../lib/AuthContext';

const STEPS = ['Welcome', 'Contact Info', 'Widening Access', 'Local Induction', 'Quiz'] as const;

export default function Day1Page() {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [todayDate, setTodayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [contactInfo, setContactInfo] = useState<Record<string, string>>({});
  const [wideningAccess, setWideningAccess] = useState<Record<string, string>>({});
  const [localInduction, setLocalInduction] = useState<Record<string, string>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  function next() {
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
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
        body: JSON.stringify({
          contactInfo,
          wideningAccess,
          localInduction: { ...localInduction, inductionDate: localInduction.inductionDate || todayDate },
          quizAnswers,
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
        <h2>Thank you, {user.name}!</h2>
        <p>Your Day 1 forms have been submitted. Enjoy your placement.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <ol className="stepper">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'current' : ''}>
            <span className="stepper-dot">{i < step ? '✓' : i + 1}</span>
            <span className="stepper-label">{s}</span>
          </li>
        ))}
      </ol>

      {error && <div className="error-banner">{error}</div>}

      <div className="step-panel" key={step}>
      {step === 0 && (
        <div className="card">
          <h2>Welcome, {user.name}</h2>
          <p className="help">
            Please complete this on your first day. It covers your contact details, local induction,
            an optional equality monitoring survey, and a short safety quiz. It takes about 10 minutes.
          </p>
          <div className="field">
            <label htmlFor="todayDate">Today&rsquo;s Date *</label>
            <input id="todayDate" type="date" value={todayDate} onChange={(e) => setTodayDate(e.target.value)} required />
          </div>
        </div>
      )}

      {step === 1 && (
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
      )}

      {step === 2 && (
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
      )}

      {step === 3 && (
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
      )}

      {step === 4 && (
        <div className="card">
          <h2>Induction Quiz</h2>
          <p className="help">Please answer all questions. Each has only one answer.</p>
          <QuizSection answers={quizAnswers} onAnswer={(id, idx) => setQuizAnswers((s) => ({ ...s, [id]: idx }))} />
        </div>
      )}
      </div>

      <div className="actions">
        {step > 0 ? (
          <button type="button" className="secondary" onClick={back} disabled={submitting}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next}>
            Next
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Day 1 Forms'}
          </button>
        )}
      </div>
    </div>
  );
}
