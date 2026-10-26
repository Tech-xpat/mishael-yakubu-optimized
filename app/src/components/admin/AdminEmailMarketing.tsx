import { useState, useEffect } from 'react';
import { Mail, Send, Loader2, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { getSubscribers, sendNewsletter, sendProjectAnnouncement, deleteSubscriber } from '../../lib/emailService';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: any;
  receivedWelcome: boolean;
  lastEmailSent: any;
  status: string;
}

export default function AdminEmailMarketing() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'newsletter' | 'announcement'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Newsletter form
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');

  // Announcement form
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('Web Development');

  // Load subscribers on mount
  useEffect(() => {
    loadSubscribers();
    // Refresh subscribers every 30 seconds
    const interval = setInterval(loadSubscribers, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await getSubscribers();
      setSubscribers(data as Subscriber[]);
    } catch (error) {
      setMessage('Error loading subscribers');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setSending(true);
    try {
      const result = await sendNewsletter(newsletterSubject, newsletterContent);
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setNewsletterSubject('');
        setNewsletterContent('');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error sending newsletter');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setMessage('Please enter a project name');
      setMessageType('error');
      return;
    }

    setSending(true);
    try {
      const result = await sendProjectAnnouncement(projectName, category);
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setProjectName('');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error sending announcement');
      setMessageType('error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      await deleteSubscriber(email);
      setSubscribers(subscribers.filter(s => s.email !== email));
      setMessage('Subscriber deleted');
      setMessageType('success');
    } catch (error) {
      setMessage('Error deleting subscriber');
      setMessageType('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Email Marketing</h2>
        </div>
        <p className="text-white/60">Manage subscribers and send campaigns</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'subscribers' as const, label: 'Subscribers', count: subscribers.length },
          { id: 'newsletter' as const, label: 'Newsletter' },
          { id: 'announcement' as const, label: 'Announcements' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-white/60 hover:text-white/80'
            }`}
          >
            {tab.label} {tab.count ? `(${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          messageType === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {messageType === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Subscribers List</h3>
            <button
              onClick={loadSubscribers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Subscribed</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-white/40">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-white/40">
                      No subscribers yet
                    </td>
                  </tr>
                ) : (
                  subscribers.map(sub => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">{sub.email}</td>
                      <td className="py-3 px-4 text-white/60">{sub.name}</td>
                      <td className="py-3 px-4 text-white/60 text-xs">
                        {sub.subscribedAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Newsletter Tab */}
      {activeTab === 'newsletter' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Send Newsletter</h3>
          <form onSubmit={handleSendNewsletter} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject</label>
              <input
                type="text"
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
                placeholder="e.g., New Projects & Updates"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Content</label>
              <textarea
                value={newsletterContent}
                onChange={(e) => setNewsletterContent(e.target.value)}
                placeholder="Enter your newsletter content (HTML supported)"
                rows={10}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-white/40 mt-2">Tip: You can use HTML tags for formatting</p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={sending || subscribers.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {subscribers.length} Subscribers
                  </>
                )}
              </button>
              <p className="text-sm text-white/40 flex items-center">
                {subscribers.length === 0 && 'No active subscribers'}
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Announcement Tab */}
      {activeTab === 'announcement' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Send Project Announcement</h3>
          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., New E-Commerce Platform"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Brand Design">Brand Design</option>
                <option value="AI Automation">AI Automation</option>
              </select>
            </div>

            <div className="bg-white/5 border border-white/10 rounded p-3 text-sm text-white/60">
              <p className="mb-2">Preview:</p>
              <p>Subject: New {category} Project: {projectName || '[Project Name]'}</p>
              <p className="mt-2">An automated email will be sent announcing this new project to all subscribers.</p>
            </div>

            <button
              type="submit"
              disabled={sending || subscribers.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Announcement to {subscribers.length} Subscribers
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
