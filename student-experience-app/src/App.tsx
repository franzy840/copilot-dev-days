import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Day1Page from './pages/Day1Page';
import FeedbackPage from './pages/FeedbackPage';

export default function App() {
  return (
    <>
      <header className="app-header">
        <p className="app-eyebrow">Epsom and St Helier University Hospitals NHS Trust</p>
        <h1>Work Experience</h1>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/day1" element={<Day1Page />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </>
  );
}
