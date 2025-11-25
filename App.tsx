import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { VeoGenerator } from './components/VeoGenerator';
import { Dashboard } from './components/Dashboard';
import { UsersList } from './components/Users';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { View, UserRole } from './types';
import { store } from './services/store';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [appSettings, setAppSettings] = useState(store.getSettings());

  const handleLogin = (role: UserRole) => {
    // Simulate Login
    store.login(role);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    store.logout();
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const refreshSettings = () => {
    setAppSettings(store.getSettings());
  };

  // Update document title and favicon when settings change
  useEffect(() => {
    document.title = appSettings.appName;
    
    if (appSettings.branding.favicon) {
       let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
       if (!link) {
           link = document.createElement('link');
           link.rel = 'icon';
           document.head.appendChild(link);
       }
       link.href = appSettings.branding.favicon;
    }
  }, [appSettings]);

  const renderContent = () => {
    // If not authenticated, safety check
    if (!isAuthenticated) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'generator':
        return <VeoGenerator />;
      case 'users':
        return <UsersList />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings onUpdate={refreshSettings} />;
      default:
        return <Dashboard />;
    }
  };

  // If not authenticated, show Landing Page
  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} settings={appSettings} />;
  }

  // If authenticated, show SaaS Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={handleLogout}
        settings={appSettings}
      />
      
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden ml-64">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 p-8 max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;