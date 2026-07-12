import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { refresh } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Could not create your account.');
      }
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Create Account</h2>
        <p className="help">Set up your login for the Day 1 and Final Day forms.</p>
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
          <div className="field">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <div className="field-help">At least 8 characters.</div>
          </div>
          <div className="actions">
            <Link to="/login" className="text-link">
              Already have an account? Log in
            </Link>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
