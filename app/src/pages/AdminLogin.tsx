import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, Chrome, Mail, Lock } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'google'>('email');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate('/greatness/dashboard');
      }
      setIsInitializing(false);
    });
  }, [navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Enter email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.session) {
        toast.success('Login successful');
        navigate('/greatness/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/greatness/dashboard`,
        },
      });
      if (error) {
        toast.error(error.message || 'Google sign-in failed');
        setLoading(false);
      }
      // Redirect happens automatically on success
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed');
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
          {mode === 'email' ? (
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
                Or sign in with Google
              </button>
            </form>
          ) : (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 bg-white text-black rounded-xl font-bold text-base hover:bg-white/95 disabled:opacity-50 transition flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Chrome size={22} />
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMode('email')}
                className="w-full text-sm text-white/50 hover:text-white transition"
              >
                ← Back to email & password
              </button>
            </>
          )}

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xs text-white/50 leading-relaxed">
              Secure access via Supabase Auth. Create admin users in your Supabase dashboard only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
