import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

type Tab = 'student' | 'admin';

interface Props {
  defaultTab?: Tab;
}

export default function LoginPage({ defaultTab = 'student' }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { refresh } = useAuth();
  const navigate = useNavigate();

  async function submitStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'login', email: studentEmail, password: studentPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Login failed.');
      }
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'admin-login', username: adminUsername, password: adminPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Login failed.');
      }
      await refresh();
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function selectTab(next: Tab) {
    setTab(next);
    setError('');
  }

  return (
    <div className="page">
      <div className="tab-picker">
        <button type="button" className={tab === 'student' ? 'tab-picker-active' : ''} onClick={() => selectTab('student')}>
          Student Login
        </button>
        <button type="button" className={tab === 'admin' ? 'tab-picker-active' : ''} onClick={() => selectTab('admin')}>
          Admin Login
        </button>
      </div>

      <div className="card">
        {error && <div className="error-banner">{error}</div>}

        {tab === 'student' ? (
          <form onSubmit={submitStudent}>
            <h2>Student Login</h2>
            <div className="field">
              <label htmlFor="studentEmail">Email Address *</label>
              <input id="studentEmail" type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="studentPassword">Password *</label>
              <input
                id="studentPassword"
                type="password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                required
              />
            </div>
            <p className="help">
              Forgotten your password? Ask your Undergraduate Team contact to reset it from the admin
              dashboard.
            </p>
            <div className="actions">
              <Link to="/signup" className="text-link">
                New here? Create an account
              </Link>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Log in'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitAdmin}>
            <h2>Admin Login</h2>
            <div className="field">
              <label htmlFor="adminUsername">Username *</label>
              <input id="adminUsername" type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="adminPassword">Password *</label>
              <input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <div className="actions">
              <span />
              <button type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
