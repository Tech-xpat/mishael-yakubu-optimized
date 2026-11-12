import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from '../../lib/firebase';

/**
 * The three home-page sections (Web Development, Brand Design, AI Automation) are stored in Firebase,
 * separate from the portfolio library. If saving there is refused, signing in to Firebase here fixes it.
 */
export default function FirebaseGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Signed in to Firebase');
      setOpen(false);
      setPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Firebase sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/70">Firebase: signed in as {user.email}</span>
            <button onClick={() => signOut(auth)} className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20">
              Sign out
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/60">
              If adding or deleting here says "permission denied", sign in to Firebase first.
            </p>
            {!open ? (
              <button onClick={() => setOpen(true)} className="mt-2 rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20">
                Sign in to Firebase
              </button>
            ) : (
              <form onSubmit={signIn} className="mt-3 space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Firebase email"
                  autoComplete="username"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-base text-white outline-none focus:border-white/40"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-base text-white outline-none focus:border-white/40"
                />
                <button
                  type="submit"
                  disabled={busy || !email || !password}
                  className="min-h-[44px] w-full rounded-lg bg-white font-semibold text-black disabled:opacity-50"
                >
                  {busy ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
      {children}
    </div>
  );
}
