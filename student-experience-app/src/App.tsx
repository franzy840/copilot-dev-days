import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Day1Page from './pages/Day1Page';
import ContactInfoPage from './pages/day1/ContactInfoPage';
import WideningAccessPage from './pages/day1/WideningAccessPage';
import LocalInductionPage from './pages/day1/LocalInductionPage';
import QuizPage from './pages/day1/QuizPage';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/admin/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './lib/AuthContext';

function UserMenu() {
  const { user, loading, logout } = useAuth();
  if (loading) return null;

  if (!user) {
    return (
      <Link to="/login" className="user-menu-link">
        Student login
      </Link>
    );
  }

  return (
    <div className="user-menu">
      {user.role === 'admin' ? (
        <Link to="/admin" className="user-menu-link">
          Admin dashboard
        </Link>
      ) : (
        <span className="user-menu-name">{user.name}</span>
      )}
      <button type="button" className="user-menu-logout" onClick={() => logout()}>
        Log out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <header className="app-header">
        <p className="app-eyebrow">Epsom and St Helier University Hospitals NHS Trust</p>
        <div className="app-header-row">
          <h1>Work Experience</h1>
          <UserMenu />
        </div>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<LoginPage defaultTab="admin" />} />
        <Route
          path="/day1"
          element={
            <ProtectedRoute role="student">
              <Day1Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day1/contact-info"
          element={
            <ProtectedRoute role="student">
              <ContactInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day1/widening-access"
          element={
            <ProtectedRoute role="student">
              <WideningAccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day1/local-induction"
          element={
            <ProtectedRoute role="student">
              <LocalInductionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/day1/quiz"
          element={
            <ProtectedRoute role="student">
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute role="student">
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
