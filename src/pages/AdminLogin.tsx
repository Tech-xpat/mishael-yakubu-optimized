import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';
import { Loader2, Chrome } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const ADMIN_EMAILS = [
    'empiredigitalsworldwide@gmail.com',
    'letstalk2mishael@gmail.com',
  ];

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for Firebase to be ready
        const user = auth.currentUser;
        console.log('[Admin Login] Current user:', user);
        console.log('[Admin Login] User email:', user?.email);
        
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
          console.log('[Admin Login] User authorized, redirecting to dashboard');
          setDebugInfo(`Logged in as: ${user.email}`);
          navigate('/admin/dashboard');
        } else if (user) {
          console.log('[Admin Login] User not in admin list:', user.email);
          setDebugInfo(`Not authorized: ${user.email}`);
          // Sign out unauthorized users
          await auth.signOut();
        }
      } catch (error) {
        console.error('[Admin Login] Auth check error:', error);
        setDebugInfo('Auth check failed');
      } finally {
        setIsInitializing(false);
      }
    };

    // Give Firebase a moment to initialize
    const timer = setTimeout(checkAuth, 1000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email || '';

      // Check if email is authorized
      if (!ADMIN_EMAILS.includes(userEmail)) {
        // Sign out if not authorized
        await auth.signOut();
        toast.error('Your email is not authorized to access the admin dashboard');
        setLoading(false);
        return;
      }

      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup was blocked. Please allow popups for this site.');
      } else {
        toast.error('Sign-in failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block p-4 rounded-lg bg-white/10 border border-white/20 mb-6">
            <Loader2 size={40} className="animate-spin text-white" />
          </div>
          <p className="text-white font-semibold mb-2">Initializing Admin Portal</p>
          <p className="text-white/60 text-sm">Setting up Firebase authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/30" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Admin Portal</h1>
          <p className="text-white/70 text-lg">Secure access for authorized administrators</p>
        </div>

        {/* Sign In Card */}
        <div className="space-y-6">
          {/* Main Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-5 px-6 bg-white text-black rounded-xl font-bold text-lg hover:bg-white/95 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Chrome size={24} />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Debug Info */}
          {debugInfo && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm text-center">
              {debugInfo}
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black text-white/50">Only For Mishael Yakubu</span>
            </div>
          </div>

          {/* Info Sections */}
          <div className="space-y-4">
            {/* Authorized Emails */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
              <p className="text-xs text-white/50 mb-4 font-bold tracking-wider uppercase">✓ Authorized Accounts</p>
              <ul className="text-sm text-white/80 space-y-3">
                {ADMIN_EMAILS.map((email) => (
                  <li key={email} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    <code className="text-xs bg-black/40 px-2 py-1 rounded text-white/90 font-mono">{email}</code>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Notice */}
            <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
              <p className="text-xs text-blue-300/70 leading-relaxed">
                🔒 <strong>Secure Authentication:</strong> Only authorized admins have access here.</p> 
            </div>

            {/* Features */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs text-white/50 mb-3 font-bold tracking-wider uppercase">Features</p>
              <ul className="text-xs text-white/70 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-white/40">•</span>
                  <span>Manage Web Development projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white/40">•</span>
                  <span>Handle Brand Design submissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white/40">•</span>
                  <span>Track AI Automation services</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white/40">•</span>
                  <span>Monitor email campaigns</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-white/40 mt-8">
            Having issues? Make sure you're using an authorized Google account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
