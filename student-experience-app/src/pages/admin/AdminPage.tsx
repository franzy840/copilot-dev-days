import { useEffect, useState } from 'react';
import UsersTab from './UsersTab';
import ResponsesTab from './ResponsesTab';
import AnalyticsTab from './AnalyticsTab';
import NotificationsTab from './NotificationsTab';
import type { AccessRequest } from './NotificationsTab';

const TABS = ['Analytics', 'Notifications', 'Users', 'Responses'] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Analytics');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[] | null>(null);
  const [pendingError, setPendingError] = useState('');

  function loadPendingRequests() {
    setPendingError('');
    fetch('/api/admin?resource=access-requests', { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load access requests.');
        return res.json();
      })
      .then((body) => setPendingRequests(body.requests))
      .catch((err) => setPendingError(err instanceof Error ? err.message : 'Failed to load access requests.'));
  }

  useEffect(loadPendingRequests, []);

  async function emailExport() {
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'send-export' }),
      });
      if (!res.ok) throw new Error();
      setEmailStatus('sent');
    } catch {
      setEmailStatus('error');
    } finally {
      setTimeout(() => setEmailStatus('idle'), 4000);
    }
  }

  return (
    <div className="page page-wide">
      <div className="admin-toolbar">
        <a href="/api/admin?resource=export" className="secondary-link-button">
          Download Excel
        </a>
        <button type="button" className="secondary" onClick={emailExport} disabled={emailStatus === 'sending'}>
          {emailStatus === 'sending'
            ? 'Sending…'
            : emailStatus === 'sent'
              ? 'Sent ✓'
              : emailStatus === 'error'
                ? 'Failed — try again'
                : 'Email me this export'}
        </button>
        <button type="button" className="secondary" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className="tab-picker">
        {TABS.map((t) => (
          <button key={t} type="button" className={t === tab ? 'tab-picker-active' : ''} onClick={() => setTab(t)}>
            {t === 'Notifications' && pendingRequests && pendingRequests.length > 0
              ? `${t} (${pendingRequests.length})`
              : t}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'Analytics' && <AnalyticsTab />}
        {tab === 'Notifications' && (
          <NotificationsTab requests={pendingRequests} error={pendingError} onReload={loadPendingRequests} />
        )}
        {tab === 'Users' && <UsersTab />}
        {tab === 'Responses' && <ResponsesTab />}
      </div>
    </div>
  );
}
