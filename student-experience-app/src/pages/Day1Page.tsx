import { Link } from 'react-router-dom';
import { SECTION_LABELS } from '../../shared/constants';
import type { SectionKey } from '../../shared/constants';
import { useAuth } from '../lib/AuthContext';
import RequestAccessButton from '../components/RequestAccessButton';

const DAY1_SECTIONS: { key: SectionKey; path: string; desc: string }[] = [
  { key: 'contactInfo', path: '/day1/contact-info', desc: 'Your contact details and next of kin, for emergency use only.' },
  { key: 'wideningAccess', path: '/day1/widening-access', desc: 'Optional equality monitoring survey — no impact on your placement.' },
  { key: 'localInduction', path: '/day1/local-induction', desc: 'Departmental risks and fire safety information for your ward or area.' },
  { key: 'quiz', path: '/day1/quiz', desc: 'A short safety quiz to complete on your first day.' },
];

export default function Day1Page() {
  const { user } = useAuth();

  if (!user || user.role !== 'student') return null; // ProtectedRoute guarantees this in practice

  return (
    <div className="page home-links">
      <p className="home-intro">
        Welcome, {user.name}. Complete each section below once your admin has unlocked it for you.
      </p>

      {DAY1_SECTIONS.map((s, i) => {
        const label = SECTION_LABELS[s.key];
        const granted = user.grantedSections.includes(s.key);
        const done = user.completedSections.includes(s.key);
        const index = String(i + 1).padStart(2, '0');

        if (done) {
          return (
            <div key={s.key} className="home-card home-card-done">
              <span className="home-card-index">{index}</span>
              <span className="home-card-body">
                <span className="home-card-title">{label} — Completed</span>
                <span className="home-card-desc">{s.desc}</span>
              </span>
              <span className="home-card-check" aria-hidden="true">✓</span>
            </div>
          );
        }

        if (!granted) {
          const pending = user.pendingRequests.includes(s.key);
          return (
            <div key={s.key} className="home-card home-card-locked">
              <span className="home-card-index">{index}</span>
              <span className="home-card-body">
                <span className="home-card-title">{label}</span>
                <span className="home-card-desc">
                  {pending ? 'Requested — waiting for admin approval.' : 'Not yet unlocked.'}
                </span>
              </span>
              {pending ? (
                <span className="badge badge-pending">Requested</span>
              ) : (
                <RequestAccessButton section={s.key} />
              )}
            </div>
          );
        }

        return (
          <Link key={s.key} to={s.path} className="home-card">
            <span className="home-card-index">{index}</span>
            <span className="home-card-body">
              <span className="home-card-title">{label}</span>
              <span className="home-card-desc">{s.desc}</span>
            </span>
            <span className="home-card-arrow" aria-hidden="true">→</span>
          </Link>
        );
      })}
    </div>
  );
}
