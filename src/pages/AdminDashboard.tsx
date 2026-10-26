import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, BarChart3, Settings, Loader2 } from 'lucide-react';
import { firestore } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import AdminWebDevelopment from '../components/admin/AdminWebDevelopment';
import AdminBrandDesign from '../components/admin/AdminBrandDesign';
import AdminAIAutomation from '../components/admin/AdminAIAutomation';
import AdminEmailMarketing from '../components/admin/AdminEmailMarketing';

type Tab = 'web' | 'brand' | 'ai' | 'email';

interface DashboardMetrics {
  portfolioItems: number;
  subscribers: number;
  emailsSent: number;
  loading: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('web');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    portfolioItems: 0,
    subscribers: 0,
    emailsSent: 0,
    loading: true,
  });

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-white mb-4 mx-auto" />
          <p className="text-white/60">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">You are not authorized to access this page</p>
          <p className="text-white/40 text-sm mb-6">Please sign in with an authorized account</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Fetch live metrics from Firestore
  useEffect(() => {
    let webCount = 0;
    let brandCount = 0;
    let aiCount = 0;
    let loadedCollections = 0;

    const unsubscribes: (() => void)[] = [];

    // Web Development projects count
    const webQuery = query(collection(firestore, 'webDevelopment'));
    const unsubWeb = onSnapshot(webQuery, (snapshot) => {
      webCount = snapshot.size;
      loadedCollections++;
      updatePortfolioItems();
    });
    unsubscribes.push(unsubWeb);

    // Brand Design projects count
    const brandQuery = query(collection(firestore, 'brandDesign'));
    const unsubBrand = onSnapshot(brandQuery, (snapshot) => {
      brandCount = snapshot.size;
      loadedCollections++;
      updatePortfolioItems();
    });
    unsubscribes.push(unsubBrand);

    // AI Automation projects count
    const aiQuery = query(collection(firestore, 'aiAutomation'));
    const unsubAI = onSnapshot(aiQuery, (snapshot) => {
      aiCount = snapshot.size;
      loadedCollections++;
      updatePortfolioItems();
    });
    unsubscribes.push(unsubAI);

    // Subscribers count
    const subscribersQuery = query(collection(firestore, 'subscribers'));
    const unsubSubscribers = onSnapshot(subscribersQuery, (snapshot) => {
      const count = snapshot.docs.filter((doc) => doc.data().status === 'active').length;
      setMetrics((prev) => ({ ...prev, subscribers: count }));
      if (loadedCollections === 3) {
        setMetrics((prev) => ({ ...prev, loading: false }));
      }
    });
    unsubscribes.push(unsubSubscribers);

    const updatePortfolioItems = () => {
      const total = webCount + brandCount + aiCount;
      setMetrics((prev) => ({ ...prev, portfolioItems: total }));
    };

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent sticky top-0 z-40 backdrop-blur-sm">
        <div className="px-6 md:px-12 lg:px-20 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/60 mt-1">{currentUser.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                title="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Portfolio Items</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {metrics.loading ? <Loader2 size={20} className="animate-spin" /> : metrics.portfolioItems}
                  </p>
                </div>
                <BarChart3 size={24} className="text-white/40" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Subscribers</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {metrics.loading ? <Loader2 size={20} className="animate-spin" /> : metrics.subscribers}
                  </p>
                </div>
                <BarChart3 size={24} className="text-white/40" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Emails Sent</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    {metrics.loading ? <Loader2 size={20} className="animate-spin" /> : metrics.emailsSent}
                  </p>
                </div>
                <BarChart3 size={24} className="text-white/40" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-sm font-bold text-white">Just now</p>
                </div>
                <BarChart3 size={24} className="text-white/40" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="border-b border-white/10 bg-white/2.5">
        <div className="px-6 md:px-12 lg:px-20 flex gap-1 overflow-x-auto">
          {[
            { id: 'web', label: 'Web Development', icon: '🌐' },
            { id: 'brand', label: 'Brand Design', icon: '🎨' },
            { id: 'ai', label: 'AI Automation', icon: '⚡' },
            { id: 'email', label: 'Email Marketing', icon: '📧' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-4 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-white text-white bg-white/5'
                  : 'border-transparent text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        <div className="animate-fadeIn">
          {activeTab === 'web' && <AdminWebDevelopment />}
          {activeTab === 'brand' && <AdminBrandDesign />}
          {activeTab === 'ai' && <AdminAIAutomation />}
          {activeTab === 'email' && <AdminEmailMarketing />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
