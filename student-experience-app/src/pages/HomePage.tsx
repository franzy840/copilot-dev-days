import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page home-links">
      <p className="home-intro">Pick the form for where you are in your placement.</p>

      <Link to="/day1" className="home-card">
        <span className="home-card-index">01</span>
        <span className="home-card-body">
          <span className="home-card-title">Day 1</span>
          <span className="home-card-desc">Contact info, widening access survey, local induction &amp; safety quiz — about 10 minutes.</span>
        </span>
        <span className="home-card-arrow" aria-hidden="true">→</span>
      </Link>

      <Link to="/feedback" className="home-card">
        <span className="home-card-index">02</span>
        <span className="home-card-body">
          <span className="home-card-title">Final Day</span>
          <span className="home-card-desc">Work experience feedback — help us improve future placements.</span>
        </span>
        <span className="home-card-arrow" aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
