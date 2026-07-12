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

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load users.');
        return res.json();
      })
      .then((body) => setUsers(body.users))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users.'));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!users) return <p className="help">Loading…</p>;
  if (users.length === 0) return <p className="chart-empty">No students have logged in yet.</p>;

  return (
    <div className="data-table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Day 1</th>
            <th>Feedback</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
