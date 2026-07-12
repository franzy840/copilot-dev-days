import { useState } from 'react';
import { SECTION_LABELS } from '../../../shared/constants';
import type { SectionKey } from '../../../shared/constants';

export interface AccessRequest {
  id: number;
  section: SectionKey;
  requested_at: string;
  user_id: number;
  name: string;
  email: string;
}

interface Props {
  requests: AccessRequest[] | null;
  error: string;
  onReload: () => void;
}

export default function NotificationsTab({ requests, error, onReload }: Props) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  async function grant(req: AccessRequest) {
    setBusyId(req.id);
    setActionError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'grant-access', userId: req.user_id, section: req.section, granted: true }),
      });
      if (!res.ok) throw new Error();
      onReload();
    } catch {
      setActionError('Failed to grant access. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function dismiss(req: AccessRequest) {
    setBusyId(req.id);
    setActionError('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'resolve-access-request', userId: req.user_id, section: req.section }),
      });
      if (!res.ok) throw new Error();
      onReload();
    } catch {
      setActionError('Failed to dismiss request. Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="error-banner">{error}</div>;
  if (!requests) return <p className="help">Loading…</p>;

  return (
    <div>
      {actionError && <div className="error-banner">{actionError}</div>}
      {requests.length === 0 ? (
        <p className="chart-empty">No pending access requests.</p>
      ) : (
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Section requested</th>
                <th>Requested</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{SECTION_LABELS[r.section]}</td>
                  <td>{new Date(r.requested_at).toLocaleString()}</td>
                  <td className="table-action-cell">
                    <button type="button" className="table-action" onClick={() => grant(r)} disabled={busyId === r.id}>
                      {busyId === r.id ? 'Working…' : 'Grant access'}
                    </button>
                    <button type="button" className="secondary table-action" onClick={() => dismiss(r)} disabled={busyId === r.id}>
                      Dismiss
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
