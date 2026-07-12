import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <p className="help">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page home-links">
        <p className="home-intro">Log in to get started.</p>
        <Link to="/login" className="home-card">
          <span className="home-card-index">01</span>
          <span className="home-card-body">
            <span className="home-card-title">Student Login</span>
            <span className="home-card-desc">Already have an account? Log in with your email and password.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/signup" className="home-card">
          <span className="home-card-index">02</span>
          <span className="home-card-body">
            <span className="home-card-title">Create Account</span>
            <span className="home-card-desc">First time here? Set up your name, email and a password.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="page home-links">
        <p className="home-intro">Logged in as admin.</p>
        <Link to="/admin" className="home-card">
          <span className="home-card-index">01</span>
          <span className="home-card-body">
            <span className="home-card-title">Admin Dashboard</span>
            <span className="home-card-desc">Manage users and review submissions and analytics.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

  const day1Keys = ['contactInfo', 'wideningAccess', 'localInduction', 'quiz'] as const;
  const day1AnyGranted = day1Keys.some((k) => user.grantedSections.includes(k));
  const day1AllDone = day1Keys.every((k) => user.completedSections.includes(k));
  const feedbackGranted = user.grantedSections.includes('feedback');
  const feedbackDone = user.completedSections.includes('feedback');

  return (
    <div className="page home-links">
      <p className="home-intro">Welcome back, {user.name}. Pick the form for where you are in your placement.</p>

      {day1AnyGranted ? (
        <Link to="/day1" className="home-card">
          <span className="home-card-index">01</span>
          <span className="home-card-body">
            <span className="home-card-title">Day 1{day1AllDone ? ' — Completed' : ''}</span>
            <span className="home-card-desc">Contact info, widening access survey, local induction &amp; safety quiz — about 10 minutes.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
      ) : (
        <div className="home-card home-card-disabled">
          <span className="home-card-index">01</span>
          <span className="home-card-body">
            <span className="home-card-title">Day 1</span>
            <span className="home-card-desc">Not yet unlocked. Ask your admin for access.</span>
          </span>
        </div>
      )}

      {feedbackGranted ? (
        <Link to="/feedback" className="home-card">
          <span className="home-card-index">02</span>
          <span className="home-card-body">
            <span className="home-card-title">Final Day{feedbackDone ? ' — Completed' : ''}</span>
            <span className="home-card-desc">Work experience feedback — help us improve future placements.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
      ) : (
        <div className="home-card home-card-disabled">
          <span className="home-card-index">02</span>
          <span className="home-card-body">
            <span className="home-card-title">Final Day</span>
            <span className="home-card-desc">Not yet unlocked. Ask your admin for access.</span>
          </span>
        </div>
      )}
    </div>
  );
}
