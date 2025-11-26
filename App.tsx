import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { VeoGenerator } from './components/VeoGenerator';
import { Dashboard } from './components/Dashboard';
import { UsersList } from './components/Users';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { LandingPage } from './components/LandingPage';
import { View } from './types';
import { store } from './services/store';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [appSettings, setAppSettings] = useState(store.getSettings());

  // Initialize Data Store (Fetch from Firebase)
  useEffect(() => {
    const init = async () => {
      try {
        await store.init();
        const currentUser = store.getCurrentUser();
        if (currentUser) {
            setIsAuthenticated(true);
        }
        setAppSettings(store.getSettings());
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const handleLogin = async () => {
    try {
        await store.loginWithGoogle();
        setIsAuthenticated(true);
        setCurrentView('dashboard');
    } catch (e: any) {
        // Ignore if user simply closed the popup
        if (e.code === 'auth/popup-closed-by-user') return;

        console.error("Login detailed error:", e);
        // Show specific error to user
        let message = "Login failed. ";
        if (e.code === 'auth/unauthorized-domain') {
            message += "This domain is not authorized in Firebase Console. Please add it to Authentication > Settings > Authorized Domains.";
        } else if (e.code === 'auth/configuration-not-found') {
            message += "Firebase configuration is missing. Check your Vercel Environment Variables.";
        } else if (e.message) {
            message += e.message;
        } else {
            message += "Check console for details.";
        }
        alert(message);
    }
  };

  const handleLogout = async () => {
    await store.logout();
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

  if (isInitializing) {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-semibold tracking-wide">Initializing App</h2>
                  <p className="text-slate-500 text-sm mt-2">Connecting to secure database...</p>
              </div>
          </div>
      );
  }

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