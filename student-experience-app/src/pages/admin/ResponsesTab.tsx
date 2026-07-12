import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable';

const TABLES: { key: string; label: string }[] = [
  { key: 'contactInfo', label: 'Contact Info' },
  { key: 'wideningAccess', label: 'Widening Access' },
  { key: 'localInduction', label: 'Local Induction' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'feedback', label: 'Feedback' },
];

export default function ResponsesTab() {
  const [table, setTable] = useState('contactInfo');
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setRows(null);
    setError('');
    fetch(`/api/admin?resource=responses&table=${table}`, { credentials: 'same-origin' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load responses.');
        return res.json();
      })
      .then((body) => setRows(body.rows))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load responses.'));
  }, [table]);

  return (
    <div>
      <div className="tab-picker">
        {TABLES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === table ? 'tab-picker-active' : ''}
            onClick={() => setTable(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && <div className="error-banner">{error}</div>}
      {!error && (rows ? <DataTable rows={rows} /> : <p className="help">Loading…</p>)}
    </div>
  );
}
