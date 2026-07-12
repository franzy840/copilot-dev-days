import { useState } from 'react';
import UsersTab from './UsersTab';
import ResponsesTab from './ResponsesTab';
import AnalyticsTab from './AnalyticsTab';

const TABS = ['Analytics', 'Users', 'Responses'] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Analytics');

  return (
    <div className="page page-wide">
      <div className="tab-picker">
        {TABS.map((t) => (
          <button key={t} type="button" className={t === tab ? 'tab-picker-active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'Analytics' && <AnalyticsTab />}
        {tab === 'Users' && <UsersTab />}
        {tab === 'Responses' && <ResponsesTab />}
      </div>
    </div>
  );
}
