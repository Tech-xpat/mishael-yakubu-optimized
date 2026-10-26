import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authorized admin emails
  const ADMIN_EMAILS = [
    'empiredigitalsworldwide@gmail.com',
    'letstalk2mishael@gmail.com',
  ];

  useEffect(() => {
    // Enable persistence
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Persistence error:', error);
      setError('Session persistence failed');
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        try {
          if (user) {
            // Check if email is verified or is in admin list
            const isAuthorizedAdmin = ADMIN_EMAILS.includes(user.email || '');
            setCurrentUser(user);
            setIsAdmin(isAuthorizedAdmin);
            setError(null);

            if (!isAuthorizedAdmin) {
              console.warn('User email not in admin list:', user.email);
            }
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
          setLoading(false);
        } catch (err) {
          console.error('Auth state change error:', err);
          setError('Authentication error occurred');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Auth listener error:', error);
        setError('Authentication service error');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
      setError(null);
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Logout failed: ' + err.message);
      toast.error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isAdmin,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
