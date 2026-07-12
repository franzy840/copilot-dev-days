import { Fragment, useEffect, useState } from 'react';
import { SECTION_LABELS } from '../../../shared/constants';
import type { SectionKey } from '../../../shared/constants';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  day1_completed: boolean;
  feedback_completed: boolean;
  contact_info_granted: boolean;
  contact_info_done: boolean;
  widening_access_granted: boolean;
  widening_access_done: boolean;
  local_induction_granted: boolean;
  local_induction_done: boolean;
  quiz_granted: boolean;
  quiz_done: boolean;
  feedback_granted: boolean;
  feedback_done: boolean;
}

const SECTION_FIELDS: { key: SectionKey; grantedField: keyof AdminUser; doneField: keyof AdminUser }[] = [
  { key: 'contactInfo', grantedField: 'contact_info_granted', doneField: 'contact_info_done' },
  { key: 'wideningAccess', grantedField: 'widening_access_granted', doneField: 'widening_access_done' },
  { key: 'localInduction', grantedField: 'local_induction_granted', doneField: 'local_induction_done' },
  { key: 'quiz', grantedField: 'quiz_granted', doneField: 'quiz_done' },
  { key: 'feedback', grantedField: 'feedback_granted', doneField: 'feedback_done' },
];

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');
  const [resetFor, setResetFor] = useState<number | null>(null);
  const [resetResult, setResetResult] = useState<{ name: string; email: string; tempPassword: string } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  function loadUsers() {
    setUsers(null);
    fetch('/api/admin?resource=users', { credentials: 'same-origin' })
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
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'reset-password', userId }),
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

  async function toggleSection(userId: number, section: SectionKey, grantedField: keyof AdminUser, nextGranted: boolean) {
    const toggleKey = `${userId}:${section}`;
    setTogglingKey(toggleKey);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'grant-access', userId, section, granted: nextGranted }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to update access.');
      setUsers((prev) => prev && prev.map((u) => (u.id === userId ? { ...u, [grantedField]: nextGranted } : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update access.');
    } finally {
      setTogglingKey(null);
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
              <Fragment key={u.id}>
                <tr>
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
                  <td className="table-action-cell">
                    <button
                      type="button"
                      className="secondary table-action"
                      onClick={() => setExpandedUserId((cur) => (cur === u.id ? null : u.id))}
                    >
                      {expandedUserId === u.id ? 'Hide access' : 'Manage access'}
                    </button>
                    <button type="button" className="secondary table-action" onClick={() => resetPassword(u.id)} disabled={resetFor === u.id}>
                      {resetFor === u.id ? 'Resetting…' : 'Reset password'}
                    </button>
                  </td>
                </tr>
                {expandedUserId === u.id && (
                  <tr className="access-row">
                    <td colSpan={6}>
                      <div className="access-panel">
                        {SECTION_FIELDS.map(({ key, grantedField, doneField }) => {
                          const granted = Boolean(u[grantedField]);
                          const done = Boolean(u[doneField]);
                          const toggleKey = `${u.id}:${key}`;
                          return (
                            <label key={key} className="access-toggle">
                              <span className="access-toggle-label">
                                {SECTION_LABELS[key]}
                                {done && <span className="badge badge-done access-toggle-badge">Submitted</span>}
                              </span>
                              <span className="switch">
                                <input
                                  type="checkbox"
                                  checked={granted}
                                  disabled={togglingKey === toggleKey}
                                  onChange={(e) => toggleSection(u.id, key, grantedField, e.target.checked)}
                                />
                                <span className="switch-track">
                                  <span className="switch-thumb" />
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
