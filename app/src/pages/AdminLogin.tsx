import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';
import { Loader2, Chrome, Mail, Lock } from 'lucide-react';

// Keep this list server-side only — never render on the page
const ADMIN_EMAILS = [
  'empiredigitalsworldwide@gmail.com',
  'letstalk2mishael@gmail.com',
];

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'google' | 'email'>('google');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
          navigate('/greatness/dashboard');
        } else if (user) {
          await auth.signOut();
        }
      } catch (error) {
        console.error('[Admin Login] Auth check error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    const timer = setTimeout(checkAuth, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email || '';

      if (!ADMIN_EMAILS.includes(userEmail)) {
        await auth.signOut();
        toast.error('Access denied. This account is not authorized.');
        setLoading(false);
        return;
      }

      toast.success('Login successful');
      navigate('/greatness/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Allow popups for this site.');
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userEmail = result.user.email || '';

      if (!ADMIN_EMAILS.includes(userEmail)) {
        await auth.signOut();
        toast.error('Access denied. This account is not authorized.');
        setLoading(false);
        return;
      }

      toast.success('Login successful');
      navigate('/greatness/dashboard');
    } catch (error: any) {
      console.error('Email Sign-In error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else {
        toast.error('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-white mx-auto mb-4" />
          <p className="text-white font-semibold">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-full bg-white/10 border border-white/20 items-center justify-center mb-6">
            <div className="w-8 h-8 rounded-full bg-white/30" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Portal Access</h1>
          <p className="text-white/60">Authorized administrators only</p>
        </div>

        <div className="space-y-6">
          {mode === 'google' ? (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 bg-white text-black rounded-xl font-bold text-base hover:bg-white/95 disabled:opacity-50 transition flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Chrome size={22} />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <button
                    type="button"
                    onClick={() => setMode('email')}
                    className="px-3 bg-black text-white/50 hover:text-white transition"
                  >
                    Use email & password
                  </button>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/40 outline-none focus:border-white/40"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/40 outline-none focus:border-white/40"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-white text-black rounded-xl font-bold text-base hover:bg-white/95 disabled:opacity-50 transition flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMode('google')}
                className="w-full text-sm text-white/50 hover:text-white transition"
              >
                ← Back to Google sign-in
              </button>
            </form>
          )}

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xs text-white/50 leading-relaxed">
              Secure access. Unauthorized accounts are blocked automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
