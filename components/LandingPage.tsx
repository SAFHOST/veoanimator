
import React, { useState } from 'react';
import { Button } from './Button';
import { UserRole, AppSettings } from '../types';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
  settings: AppSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, settings }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginClick = async () => {
      setIsLoading(true);
      try {
          // 'user' is a placeholder, logic is handled by auth provider
          await onLogin('user'); 
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      <nav className="border-b border-slate-800/60 backdrop-blur-md fixed w-full z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {settings.branding.logo ? (
                <img src={settings.branding.logo} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <span className="font-bold text-xl text-white">{settings.appName.charAt(0)}</span>
                </div>
              )}
            <span className="font-bold text-xl tracking-tight">{settings.appName}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white font-medium text-sm transition-colors hidden sm:block">Pricing</button>
            <Button onClick={handleLoginClick} isLoading={isLoading} className="!px-6 !py-2 !text-sm">
                Sign In with Google
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            Now supporting Veo 1080p Generation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Bring your images to life <br /> with AI magic.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload any static image and let our advanced Veo models generate cinematic videos in seconds. The complete platform for creators and agencies.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
            <Button onClick={handleLoginClick} isLoading={isLoading} className="!text-lg !px-8 !py-4 shadow-xl shadow-purple-500/25">
              Get Started with Google
            </Button>
          </div>
          
           <div className="mt-20 relative mx-auto max-w-5xl h-64"></div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © 2024 {settings.appName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
