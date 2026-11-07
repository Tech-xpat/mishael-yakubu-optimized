import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

/**
 * Everything under /greatness. Loaded on demand so public visitors never
 * download the auth client, the admin dashboard or the email tooling.
 */
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<AdminLogin />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
