
import React from 'react';
import { View, AppSettings } from '../types';
import { LayoutDashboard, Users, CreditCard, Settings, Film } from './Icons';
import { store } from '../services/store';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  settings: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, settings }) => {
  const user = store.getCurrentUser();
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'editor' || user?.role === 'viewer';

  // Define all possible menu items with their required permission
  const allMenuItems = [
    { 
      id: 'dashboard', 
      label: isAdminOrStaff ? 'Admin Dashboard' : 'My Dashboard', 
      icon: LayoutDashboard,
      permission: isAdminOrStaff ? 'view_admin_dashboard' : 'view_user_dashboard' 
    },
    { 
      id: 'generator', 
      label: 'Veo Studio', 
      icon: Film,
      permission: 'generate_videos'
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users,
      permission: 'view_users'
    },
    { 
      id: 'billing', 
      label: isAdminOrStaff ? 'Billing & Plans' : 'My Plan', 
      icon: CreditCard,
      permission: isAdminOrStaff ? 'view_admin_billing' : 'view_own_billing'
    },
    { 
      id: 'settings', 
      label: isAdminOrStaff ? 'App Settings' : 'Settings', 
      icon: Settings,
      permission: isAdminOrStaff ? 'view_admin_settings' : 'view_own_settings'
    },
  ];

  // Filter items based on user permissions
  const menuItems = allMenuItems.filter(item => store.hasPermission(item.permission));

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        {settings.branding.logo ? (
          <img src={settings.branding.logo} alt="Logo" className="w-8 h-8 object-contain mr-3" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
            {settings.appName.charAt(0)}
          </div>
        )}
        <span className="font-bold text-lg tracking-tight text-white truncate">
          {settings.appName}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {isAdminOrStaff ? 'Administration' : 'Creation'}
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as View)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl">
          <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-full" />
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate capitalize">{user?.role}</div>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full py-2 px-4 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
