import { useState } from 'react';
import type { SectionKey } from '../../shared/constants';
import { useAuth } from '../lib/AuthContext';

interface Props {
  section: SectionKey;
}

export default function RequestAccessButton({ section }: Props) {
  const { refresh } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  async function request() {
    setRequesting(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'request-access', section }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to request access.');
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request access.');
      setRequesting(false);
    }
  }

  return (
    <span className="home-card-action">
      <button type="button" className="secondary table-action" onClick={request} disabled={requesting}>
        {requesting ? 'Requesting…' : 'Request Access'}
      </button>
      {error && <span className="request-access-error">{error}</span>}
    </span>
  );
}
