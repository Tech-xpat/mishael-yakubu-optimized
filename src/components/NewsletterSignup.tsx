import { useState } from 'react';
import { Mail, Loader2, Check, AlertCircle } from 'lucide-react';
import { addSubscriber } from '../lib/emailService';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const result = await addSubscriber(email, name);
      
      if (result.success) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
        setName('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error subscribing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
        </div>
        
        <p className="text-white/60 text-sm mb-4">
          Get notified about new projects, updates, and exclusive content
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition-all"
          />
          
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition-all"
          />

          <button
            type="submit"
            disabled={loading || status === 'success'}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md font-medium hover:from-purple-500 hover:to-pink-500 disabled:from-purple-600/50 disabled:to-pink-600/50 transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === 'success' && <Check className="w-4 h-4" />}
            {!loading && status !== 'success' && 'Subscribe'}
            {loading && 'Subscribing...'}
            {status === 'success' && 'Subscribed!'}
          </button>
        </form>

        {status !== 'idle' && (
          <div className={`mt-3 p-3 rounded-md flex items-center gap-2 text-sm ${
            status === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status === 'error' && <AlertCircle className="w-4 h-4" />}
            {status === 'success' && <Check className="w-4 h-4" />}
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
