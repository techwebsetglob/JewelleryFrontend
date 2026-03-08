import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessionGuard } from '../hooks/useSessionGuard';
import { LogOut, Package, User, MapPin, Shield } from 'lucide-react';

// Tab Components
import OrdersTab from '../components/account/OrdersTab';
import ProfileTab from '../components/account/ProfileTab';
import AddressesTab from '../components/account/AddressesTab';
import SecurityTab from '../components/account/SecurityTab';

const AccountPage = () => {
  const { currentUser, logout, loading: authLoading } = useAuth();

  // Session security — auto-logout after 30 min idle
  useSessionGuard();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'orders';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // Sync state with URL if it changes externally
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && ['orders', 'profile', 'addresses', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/account?tab=${tabId}`, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-dark pt-32 px-6 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'orders': return <OrdersTab currentUser={currentUser} />;
      case 'profile': return <ProfileTab currentUser={currentUser} />;
      case 'addresses': return <AddressesTab currentUser={currentUser} />;
      case 'security': return <SecurityTab currentUser={currentUser} logout={handleLogout} />;
      default: return <OrdersTab currentUser={currentUser} />;
    }
  };

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name[0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return 'U';
  };

  return (
    <div className="min-h-screen bg-background-dark pt-28 pb-20 animate-fade-in">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row h-full">
        
        {/* Mobile Sub-Header (Only visible on mobile) */}
        <div className="lg:hidden px-6 pt-4 pb-6">
          <h1 className="font-serif text-3xl text-primary mb-1">My Account</h1>
          <p className="text-slate-100/60 text-xs">Welcome back, {currentUser?.displayName?.split(' ')[0] || 'Client'}</p>
        </div>

        {/* --- SIDEBAR --- */}
        <div className="w-full lg:w-[280px] lg:border-r border-primary/15 bg-white/[0.02] flex shrink-0 lg:min-h-[calc(100vh-160px)] flex-col">
          
          {/* Avatar Area (Hidden on mobile tab bar, visible on desktop sidebar) */}
          <div className="hidden lg:flex flex-col items-center py-12 border-b border-primary/15 px-6">
            <div className="w-16 h-16 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-white/5 mb-4 shrink-0">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif justify-center text-xl text-primary">{getInitials(currentUser?.displayName, currentUser?.email)}</span>
              )}
            </div>
            <h2 className="font-serif text-lg text-white text-center mb-1 max-w-full truncate">{currentUser?.displayName || 'Client'}</h2>
            <p className="text-primary/60 text-[10px] uppercase tracking-widest text-center max-w-full truncate">{currentUser?.email}</p>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible hide-scrollbar lg:py-6 lg:px-4 border-b lg:border-b-0 border-primary/15 shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 lg:py-3 lg:px-4 lg:mb-2 lg:rounded whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'lg:bg-primary/10 text-primary border-b-2 lg:border-b-0 lg:border-l-4 border-primary' 
                    : 'text-slate-100/60 hover:text-white lg:border-l-4 lg:border-transparent hover:bg-white/5'
                }`}
              >
                <div className={`${activeTab === tab.id ? 'text-primary' : 'text-slate-100/40'}`}>
                  {tab.icon}
                </div>
                <span className="text-xs uppercase tracking-widest font-bold mt-0.5">{tab.label}</span>
              </button>
            ))}
            
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-3 px-4 py-3 mt-auto text-slate-100/60 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded border-l-4 border-transparent"
            >
              <div className="text-slate-100/40 group-hover:text-red-400"><LogOut size={18} /></div>
              <span className="text-xs uppercase tracking-widest font-bold mt-0.5">Sign Out</span>
            </button>
          </nav>
        </div>

        {/* --- MAIN CONTENT PANEL --- */}
        <div className="flex-1 p-6 lg:p-12 lg:pl-16 w-full max-w-full overflow-hidden min-h-[500px]">
          {renderActiveTab()}
          
          {/* Mobile Logout (only shows at bottom of content on mobile) */}
          <div className="lg:hidden border-t border-primary/10 mt-12 pt-8 flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded text-[10px] uppercase tracking-widest font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountPage;
