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
        <p className="home-intro">Log in with your email to get started.</p>
        <Link to="/login" className="home-card">
          <span className="home-card-index">01</span>
          <span className="home-card-body">
            <span className="home-card-title">Student Login</span>
            <span className="home-card-desc">We'll email you a one-time login link — no password needed.</span>
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

  return (
    <div className="page home-links">
      <p className="home-intro">Welcome back, {user.name}. Pick the form for where you are in your placement.</p>

      <Link to="/day1" className="home-card">
        <span className="home-card-index">01</span>
        <span className="home-card-body">
          <span className="home-card-title">Day 1{user.day1Completed ? ' — Completed' : ''}</span>
          <span className="home-card-desc">Contact info, widening access survey, local induction &amp; safety quiz — about 10 minutes.</span>
        </span>
        <span className="home-card-arrow" aria-hidden="true">→</span>
      </Link>

      {user.day1Completed ? (
        <Link to="/feedback" className="home-card">
          <span className="home-card-index">02</span>
          <span className="home-card-body">
            <span className="home-card-title">Final Day{user.feedbackCompleted ? ' — Completed' : ''}</span>
            <span className="home-card-desc">Work experience feedback — help us improve future placements.</span>
          </span>
          <span className="home-card-arrow" aria-hidden="true">→</span>
        </Link>
      ) : (
        <div className="home-card home-card-disabled">
          <span className="home-card-index">02</span>
          <span className="home-card-body">
            <span className="home-card-title">Final Day</span>
            <span className="home-card-desc">Unlocks once you've completed your Day 1 forms.</span>
          </span>
        </div>
      )}
    </div>
  );
}
