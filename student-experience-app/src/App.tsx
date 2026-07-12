import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Day1Page from './pages/Day1Page';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
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
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/day1"
          element={
            <ProtectedRoute role="student">
              <Day1Page />
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
