import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setError(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
      setSession(null);
      toast.success('Logged out successfully');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      toast.error('Failed to logout');
    }
  };

  // Any authenticated Supabase user is treated as admin for the portal.
  // Restrict further in Supabase Auth (only create accounts you trust).
  const isAdmin = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
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
