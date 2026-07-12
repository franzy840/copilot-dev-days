import { useState } from 'react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong. Please try again.');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="page thank-you">
        <div className="thank-you-badge">✓</div>
        <h2>Check your email</h2>
        <p>
          We've sent a login link to <strong>{email}</strong>. It expires in 15 minutes — click it to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Student Login</h2>
        <p className="help">Enter your name and email — we'll send you a one-time login link. No password needed.</p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Full Name *</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email Address *</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="actions">
            <span />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send login link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
