
import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { store } from '../services/store';

interface SettingsProps {
  onUpdate?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdate }) => {
  if (store.hasPermission('view_admin_settings')) {
     return <AdminSettings onUpdate={onUpdate} />;
  }
  return <UserSettings />;
};

const UserSettings: React.FC = () => {
    const user = store.getCurrentUser();
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
               <div className="flex items-center gap-6 mb-8">
                  <img src={user?.avatar} alt="" className="w-20 h-20 rounded-full bg-slate-700" />
                  <div>
                      <Button variant="secondary" className="!py-1.5 !text-sm mb-2">Change Avatar</Button>
                      <p className="text-xs text-slate-500">JPG or PNG. Max 1MB.</p>
                  </div>
               </div>
    
               <div className="grid gap-6 max-w-lg">
                   <div>
                     <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                     <input type="text" defaultValue={user?.name} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                     <input type="email" defaultValue={user?.email} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                   </div>

                   <div className="pt-2">
                       <Button>Update Profile</Button>
                   </div>
               </div>
            </div>
        </div>
    );
}

const AdminSettings: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const [settings, setSettings] = useState(store.getSettings());
  const canManage = store.hasPermission('manage_admin_settings');
  const [appName, setAppName] = useState(settings.appName);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    store.updateSettings({ appName, apiKeys: settings.apiKeys });
    if (onUpdate) onUpdate();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newBranding = { ...settings.branding, [type]: base64 };
        store.updateSettings({ branding: newBranding });
        setSettings(store.getSettings()); // Update local state to show preview
        if (onUpdate) onUpdate(); // Update app state
      };
      reader.readAsDataURL(file);
    }
  };

  const updateApiKey = (service: 'googleGenAI' | 'veo', field: 'key' | 'enabled', value: any) => {
    const newApiKeys = {
        ...settings.apiKeys,
        [service]: {
            ...settings.apiKeys[service],
            [field]: value
        }
    };
    // Update local state immediately for inputs
    setSettings({ ...settings, apiKeys: newApiKeys });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">App Settings</h1>
         {!canManage && <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Read Only</span>}
       </div>
       
       <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-8">
          {/* General Config */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">General Configuration</h3>
            <div className="grid gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Application Name</label>
                 <input 
                    disabled={!canManage} 
                    type="text" 
                    value={appName} 
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-3 text-white disabled:opacity-50" 
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Support Email</label>
                 <input disabled={!canManage} type="email" defaultValue="support@veosaas.com" className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-3 text-white disabled:opacity-50" />
               </div>
            </div>
          </div>

          {/* Branding Config */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">App Logo (Sidebar)</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden">
                            {settings.branding.logo ? (
                                <img src={settings.branding.logo} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-slate-600 text-xs">Default</span>
                            )}
                        </div>
                        {canManage && (
                            <div>
                                <input 
                                    type="file" 
                                    ref={logoInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'logo')}
                                />
                                <Button variant="secondary" className="!py-1.5 !text-sm" onClick={() => logoInputRef.current?.click()}>
                                    Upload Logo
                                </Button>
                                <p className="text-xs text-slate-500 mt-1">Recommended 64x64px PNG</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Favicon Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">Favicon</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden">
                             {settings.branding.favicon ? (
                                <img src={settings.branding.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                            ) : (
                                <span className="text-slate-600 text-xs">Default</span>
                            )}
                        </div>
                        {canManage && (
                            <div>
                                <input 
                                    type="file" 
                                    ref={faviconInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileChange(e, 'favicon')}
                                />
                                <Button variant="secondary" className="!py-1.5 !text-sm" onClick={() => faviconInputRef.current?.click()}>
                                    Upload Favicon
                                </Button>
                                <p className="text-xs text-slate-500 mt-1">Recommended 32x32px ICO/PNG</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* API Keys Config */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">API Configuration</h3>
            <p className="text-sm text-slate-400 mb-6">
                Configure global API keys to sponsor generations for your users. If disabled, users must provide their own keys.
            </p>
            
            <div className="space-y-6 max-w-2xl">
                {/* Google GenAI Key */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <label className="font-medium text-white">Google GenAI API Key</label>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${settings.apiKeys.googleGenAI.enabled ? 'text-green-400' : 'text-slate-500'}`}>
                                {settings.apiKeys.googleGenAI.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <button 
                                disabled={!canManage}
                                onClick={() => updateApiKey('googleGenAI', 'enabled', !settings.apiKeys.googleGenAI.enabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.apiKeys.googleGenAI.enabled ? 'bg-purple-600' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.apiKeys.googleGenAI.enabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                    <input 
                        type="password"
                        placeholder="AIzaSy..."
                        disabled={!canManage}
                        value={settings.apiKeys.googleGenAI.key}
                        onChange={(e) => updateApiKey('googleGenAI', 'key', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                {/* Veo Key */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <label className="font-medium text-white">Veo Model API Key</label>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${settings.apiKeys.veo.enabled ? 'text-green-400' : 'text-slate-500'}`}>
                                {settings.apiKeys.veo.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <button 
                                disabled={!canManage}
                                onClick={() => updateApiKey('veo', 'enabled', !settings.apiKeys.veo.enabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.apiKeys.veo.enabled ? 'bg-purple-600' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.apiKeys.veo.enabled ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                     <input 
                        type="password"
                        placeholder="AIzaSy..."
                        disabled={!canManage}
                        value={settings.apiKeys.veo.key}
                        onChange={(e) => updateApiKey('veo', 'key', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-sm font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-2">Requires Veo model access in Google Cloud Project.</p>
                </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
             <h3 className="text-lg font-medium text-white mb-4">Features</h3>
             <div className="space-y-3">
               <label className="flex items-center space-x-3 cursor-pointer">
                 <input disabled={!canManage} type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500 disabled:opacity-50" />
                 <span className="text-slate-300">Allow New Registrations</span>
               </label>
               <label className="flex items-center space-x-3 cursor-pointer">
                 <input disabled={!canManage} type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-600 focus:ring-purple-500 disabled:opacity-50" />
                 <span className="text-slate-300">Maintenance Mode</span>
               </label>
             </div>
          </div>

          {canManage && (
            <div className="pt-4">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
       </div>
    </div>
  );
};
