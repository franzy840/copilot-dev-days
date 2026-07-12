import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface Props {
  children: ReactNode;
  role: 'student' | 'admin';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page">
        <p className="help">Loading…</p>
      </div>
    );
  }

  if (!user || user.role !== role) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  return <>{children}</>;
}
