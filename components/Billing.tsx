
import React, { useState } from 'react';
import { store } from '../services/store';
import { Button } from './Button';
import { CheckCircle, XCircle } from './Icons';

export const Billing: React.FC = () => {
  // Use permissions instead of just "isAdmin"
  if (store.hasPermission('view_admin_billing')) {
    return <AdminBilling />;
  }
  return <UserBilling />;
};

const UserBilling: React.FC = () => {
  const user = store.getCurrentUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Subscription & Billing</h1>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
         <div className="flex justify-between items-start">
           <div>
             <h2 className="text-lg font-semibold text-white">Current Plan</h2>
             <div className="text-4xl font-bold text-white mt-2 capitalize">{user?.plan} Plan</div>
             <p className="text-slate-400 mt-2">Your next billing date is November 1, 2024.</p>
           </div>
           <Button variant={user?.plan === 'free' ? 'primary' : 'secondary'}>
             {user?.plan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
           </Button>
         </div>
      </div>

      <h2 className="text-xl font-bold text-white pt-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '$0', credits: '10 credits/mo', current: user?.plan === 'free' },
            { name: 'Pro', price: '$29', credits: '500 credits/mo', current: user?.plan === 'pro' },
            { name: 'Enterprise', price: '$99', credits: 'Unlimited', current: user?.plan === 'enterprise' },
          ].map(plan => (
            <div key={plan.name} className={`border rounded-xl p-5 transition-colors bg-slate-900/30 ${plan.current ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-700'}`}>
              <h3 className="font-bold text-white text-lg">{plan.name}</h3>
              <div className="text-2xl font-bold text-purple-400 my-2">{plan.price}</div>
              <ul className="text-sm text-slate-400 space-y-2 mb-4">
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> {plan.credits}</li>
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 720p Generation</li>
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> No Watermark</li>
              </ul>
              {plan.current ? (
                 <button disabled className="w-full py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium">Current Plan</button>
              ) : (
                 <Button variant="secondary" className="w-full !text-sm">Select Plan</Button>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

const AdminBilling: React.FC = () => {
  const [settings, setSettings] = useState(store.getSettings());
  const canManage = store.hasPermission('manage_admin_billing');

  const togglePaymentMethod = (method: 'stripe' | 'paypal') => {
    if (!canManage) return; 
    
    // Create new payment methods object to avoid direct mutation of the store reference
    const currentMethods = settings.paymentMethods;
    const updatedMethods = {
        ...currentMethods,
        [method]: {
            ...currentMethods[method],
            enabled: !currentMethods[method].enabled
        }
    };

    store.updateSettings({ paymentMethods: updatedMethods });
    setSettings(store.getSettings());
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-white">Billing & Payments</h1>
         {!canManage && <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Read Only</span>}
      </div>

      {/* Payment Gateways */}
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          Payment Gateways
          <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-1 rounded">Mock Configuration</span>
        </h2>
        
        <div className="space-y-6">
          {/* Stripe */}
          <div className="flex items-start justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
              <div>
                <h3 className="font-medium text-white">Stripe</h3>
                <p className="text-sm text-slate-400">Process credit card payments.</p>
                {settings.paymentMethods.stripe.enabled && (
                   <div className="mt-2 space-y-2">
                     <input type="text" value="pk_test_51Mx..." readOnly className="block w-64 bg-slate-800 border border-slate-700 text-xs text-slate-400 rounded px-2 py-1" />
                   </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${settings.paymentMethods.stripe.enabled ? 'text-green-400' : 'text-slate-500'}`}>
                {settings.paymentMethods.stripe.enabled ? 'Active' : 'Disabled'}
              </span>
              <button 
                disabled={!canManage}
                onClick={() => togglePaymentMethod('stripe')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.paymentMethods.stripe.enabled ? 'bg-purple-600' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.paymentMethods.stripe.enabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* PayPal */}
          <div className="flex items-start justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
             <div className="flex gap-4">
              <div className="w-12 h-12 bg-[#003087] rounded-lg flex items-center justify-center text-white font-bold text-xl italic">P</div>
              <div>
                <h3 className="font-medium text-white">PayPal</h3>
                <p className="text-sm text-slate-400">Accept PayPal payments globally.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${settings.paymentMethods.paypal.enabled ? 'text-green-400' : 'text-slate-500'}`}>
                {settings.paymentMethods.paypal.enabled ? 'Active' : 'Disabled'}
              </span>
              <button 
                disabled={!canManage}
                onClick={() => togglePaymentMethod('paypal')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.paymentMethods.paypal.enabled ? 'bg-purple-600' : 'bg-slate-700'} ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.paymentMethods.paypal.enabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Config */}
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-semibold text-white">Subscription Plans</h2>
           {canManage && <Button variant="secondary" className="!py-1.5 !text-sm">Add New Plan</Button>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '$0', credits: '10 credits/mo' },
            { name: 'Pro', price: '$29', credits: '500 credits/mo' },
            { name: 'Enterprise', price: '$99', credits: 'Unlimited' },
          ].map(plan => (
            <div key={plan.name} className="border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 transition-colors bg-slate-900/30">
              <h3 className="font-bold text-white text-lg">{plan.name}</h3>
              <div className="text-2xl font-bold text-purple-400 my-2">{plan.price}</div>
              <ul className="text-sm text-slate-400 space-y-2 mb-4">
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> {plan.credits}</li>
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 720p Generation</li>
                 <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> No Watermark</li>
              </ul>
              {canManage && <Button variant="secondary" className="w-full !text-sm">Edit Plan</Button>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
