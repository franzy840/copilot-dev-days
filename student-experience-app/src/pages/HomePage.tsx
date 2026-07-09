import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="page home-links">
      <p>Choose the form for your day:</p>
      <Link to="/day1">Day 1 — Contact Info, Widening Access, Local Induction &amp; Quiz</Link>
      <Link to="/feedback">Final Day — Work Experience Feedback</Link>
    </div>
  );
}
