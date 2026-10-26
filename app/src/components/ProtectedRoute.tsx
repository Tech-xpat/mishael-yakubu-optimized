import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, isAdmin, loading, error } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <Loader2 size={32} className="animate-spin text-white" />
        <p className="text-white/60">Authenticating...</p>
      </div>
    );
  }

  // Show error if auth failed
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">Authentication Error</p>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!currentUser) {
    return <Navigate to="/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-white/60 mb-4">You do not have permission to access this page</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
