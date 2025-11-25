import React from 'react';
import { Button } from './Button';
import { Film, CheckCircle, Users } from './Icons';
import { UserRole, AppSettings } from '../types';

interface LandingPageProps {
  onLogin: (role: UserRole) => void;
  settings: AppSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, settings }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* Navbar */}
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
            <Button onClick={() => onLogin('user')} className="!px-6 !py-2 !text-sm">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
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
            <Button onClick={() => onLogin('user')} className="!text-lg !px-8 !py-4 shadow-xl shadow-purple-500/25">
              Get Started
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative group">
               <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 group-hover:bg-slate-900/40 transition-colors">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                     <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                  </div>
               </div>
               {/* Decorative UI elements inside the mock app */}
               <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/90 border-b border-slate-800 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
               </div>
               <div className="mt-12 p-8 grid grid-cols-2 gap-8 h-full">
                  <div className="space-y-4 opacity-50">
                     <div className="h-40 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700"></div>
                     <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                     <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  </div>
                  <div className="bg-slate-800 rounded-lg h-full opacity-50"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-slate-400">Powerful features for power users.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">High Quality Generation</h3>
              <p className="text-slate-400 leading-relaxed">
                Generate 720p and 1080p videos using Google's latest Veo models. Crystal clear motion and adherence to prompts.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Team Management</h3>
              <p className="text-slate-400 leading-relaxed">
                Set individual credit limits, manage roles, and track usage across your entire organization from one dashboard.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Usage Analytics</h3>
              <p className="text-slate-400 leading-relaxed">
                Detailed insights into generation patterns, costs, and credit consumption to optimize your workflow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            © 2024 {settings.appName}. All rights reserved.
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy</a>
            <button 
                onClick={() => onLogin('admin')}
                className="text-slate-600 hover:text-purple-400 transition-colors text-xs uppercase tracking-wider font-semibold"
            >
                Admin Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};