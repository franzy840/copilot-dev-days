import { useEffect, useState } from 'react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  day1_completed: boolean;
  feedback_completed: boolean;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; email: string; tempPassword: string } | null>(null);

  function loadUsers() {
    setUsers(null);
    fetch('/api/admin/users', { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load users.');
        return res.json();
      })
      .then((body) => setUsers(body.users))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'));
  }

  useEffect(loadUsers, []);

  async function resetPassword(userId: number) {
    setResetFor(userId);
    setError('');
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ userId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to reset password.');
      setResetResult({ name: body.name, email: body.email, tempPassword: body.tempPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setResetFor(null);
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!users) return <p className="help">Loading…</p>;
  if (users.length === 0) return <p className="chart-empty">No students have signed up yet.</p>;

  return (
    <div>
      {resetResult && (
        <div className="reset-result">
          <p>
            New password for <strong>{resetResult.name}</strong> ({resetResult.email}):
          </p>
          <code>{resetResult.tempPassword}</code>
          <p className="field-help">
            Share this with them directly (in person, chat, etc). It won't be shown again — reset again if
            it's lost.
          </p>
          <button type="button" className="secondary" onClick={() => setResetResult(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Day 1</th>
              <th>Feedback</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${u.day1_completed ? 'badge-done' : 'badge-pending'}`}>
                    {u.day1_completed ? 'Complete' : 'Pending'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.feedback_completed ? 'badge-done' : 'badge-pending'}`}>
                    {u.feedback_completed ? 'Complete' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button type="button" className="secondary table-action" onClick={() => resetPassword(u.id)} disabled={resetFor === u.id}>
                    {resetFor === u.id ? 'Resetting…' : 'Reset password'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
