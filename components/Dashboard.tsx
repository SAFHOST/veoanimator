
import React from 'react';
import { store } from '../services/store';
import { Users, DollarSign, Film } from './Icons';

export const Dashboard: React.FC = () => {
  // If user has access to Admin Dashboard (Admin, Editor, Viewer)
  if (store.hasPermission('view_admin_dashboard')) {
    return <AdminDashboard />;
  }
  // Otherwise standard user dashboard
  return <UserDashboard />;
};

const AdminDashboard: React.FC = () => {
  const stats = store.getStats();
  const analytics = store.getAnalytics();
  const transactions = store.getTransactions().slice(0, 5); // Latest 5
  
  // Calculate max values for charts to normalize bars
  const maxActivity = Math.max(...analytics.activity.map(a => a.value));
  const totalGensByPlan = Object.values(analytics.generationsByPlan).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-400 text-sm mt-4 flex items-center">
            <span className="mr-1">↑</span> 12% from last month
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Users</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.activeUsers}</h3>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4">Currently active</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white mt-2">${stats.totalRevenue}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-green-400 text-sm mt-4 flex items-center">
            <span className="mr-1">↑</span> 8% from last month
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Generations</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalGenerations}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Film className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4">Videos created</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Generations by Plan */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
           <h3 className="font-semibold text-white mb-6">Generations by Plan</h3>
           <div className="space-y-4">
              {Object.entries(analytics.generationsByPlan).map(([plan, count]) => {
                 const percentage = totalGensByPlan > 0 ? (count / totalGensByPlan) * 100 : 0;
                 return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 capitalize">{plan}</span>
                      <span className="text-slate-400">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full ${
                           plan === 'enterprise' ? 'bg-purple-500' : 
                           plan === 'pro' ? 'bg-blue-500' : 'bg-slate-500'
                         }`} 
                         style={{ width: `${percentage}%` }}
                       ></div>
                    </div>
                  </div>
                 );
              })}
           </div>
           <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                Enterprise users generate 3x more content on average.
              </p>
           </div>
        </div>

        {/* User Growth Trend (SVG Line Chart) */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-white">Active User Growth</h3>
              <select className="bg-slate-900 border border-slate-700 text-slate-400 text-xs rounded-lg px-2 py-1 outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
           </div>
           
           <div className="h-48 relative flex items-end justify-between gap-2">
              {/* Background Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                 {[100, 75, 50, 25, 0].map(val => (
                   <div key={val} className="border-b border-slate-700/50 w-full h-0 relative">
                     <span className="absolute -top-3 -left-8 text-[10px] text-slate-600 w-6 text-right">{val}%</span>
                   </div>
                 ))}
              </div>

              {/* Line Chart Logic using SVG */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                 <path 
                   d={`M 0,${192 - (analytics.userGrowth[0].count / 150 * 192)} ` + 
                      analytics.userGrowth.map((d, i) => {
                         const x = (i / (analytics.userGrowth.length - 1)) * 100; // Percentage width
                         const y = 192 - (d.count / 150 * 192); // Scale to height (approx max 150)
                         return `L ${x * 8 /* approximate scaling for svg coordinate space, relying on viewbox/width would be better but CSS width handles it */} ${y}`; 
                      }).join(' ')}
                   fill="none" 
                   stroke="#8b5cf6" 
                   strokeWidth="3" 
                   vectorEffect="non-scaling-stroke"
                   className="w-full h-full"
                   // Note: A true responsive SVG path requires calculating exact pixel coordinates or using percent-based coordinates with viewbox 0 0 100 100.
                   // For this specific robust mock, we'll use a simplified HTML-bar approximation below for reliability across resolutions if SVG is tricky without a library.
                 />
                 {/* Gradient Area under line */}
                 <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                 </defs>
              </svg>
              
              {/* Alternative Bar-Line Hybrid for robust rendering without D3/Recharts */}
              <div className="absolute inset-0 flex items-end justify-between pl-2 pr-2">
                {analytics.userGrowth.map((item, index) => (
                    <div key={index} className="flex flex-col items-center group relative w-full">
                        {/* Dot */}
                        <div 
                           className="w-3 h-3 bg-slate-900 border-2 border-purple-500 rounded-full z-10 mb-[-6px]"
                           style={{ marginBottom: `${(item.count / 150) * 192}px` }} 
                        ></div>
                        {/* Tooltip */}
                        <div 
                           className="absolute opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-xs py-1 px-2 rounded -top-8 transition-opacity pointer-events-none whitespace-nowrap z-20"
                           style={{ bottom: `${(item.count / 150) * 192 + 20}px` }}
                        >
                            {item.count} Users
                        </div>
                        {/* X-Axis Label */}
                        <div className="absolute -bottom-6 text-xs text-slate-500">{item.month}</div>
                    </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Recent Activity & Weekly Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="font-semibold text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-slate-300 text-sm">User #{tx.userId}</td>
                    <td className="px-6 py-4 text-white font-medium text-sm">${tx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col">
            <h3 className="text-white font-semibold mb-6">Weekly Generation Volume</h3>
            <div className="w-full flex-1 bg-slate-900/50 rounded-xl flex items-end justify-between p-4 gap-2">
               {analytics.activity.map((item, i) => {
                  const heightPercent = (item.value / maxActivity) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                           className="w-full bg-purple-600/30 hover:bg-purple-500 rounded-t-sm transition-all relative" 
                           style={{ height: `${heightPercent}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                             {item.value}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{item.day}</span>
                    </div>
                  );
               })}
            </div>
        </div>
      </div>
    </div>
  );
};

const UserDashboard: React.FC = () => {
  const user = store.getCurrentUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-purple-900/20">
           <h3 className="text-purple-200 font-medium text-sm uppercase">Credits Remaining</h3>
           <div className="text-5xl font-bold mt-2">{user?.credits}</div>
           <div className="mt-6 flex gap-2">
             <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
               Buy More
             </button>
           </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
           <h3 className="text-slate-400 font-medium text-sm uppercase">Current Plan</h3>
           <div className="text-3xl font-bold mt-2 text-white capitalize">{user?.plan}</div>
           <p className="text-slate-500 text-sm mt-2">Renews on Nov 1, 2024</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
           <h3 className="text-slate-400 font-medium text-sm uppercase">Total Videos</h3>
           <div className="text-3xl font-bold mt-2 text-white">{user?.usedCredits}</div>
           <p className="text-slate-500 text-sm mt-2">Lifetime generations</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Your Recent Creations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* Mock recent videos for user view */}
           {[1, 2, 3].map((i) => (
             <div key={i} className="aspect-video bg-slate-800 rounded-xl border border-slate-700 relative group overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                  <Film className="w-10 h-10 text-slate-600" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-medium">Project Veo #{i}</p>
                  <p className="text-slate-400 text-xs">Generated 2 days ago</p>
                </div>
             </div>
           ))}
           <button className="aspect-video bg-slate-900/50 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 hover:border-purple-500/50 transition-all group">
             <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-purple-500/10 flex items-center justify-center mb-2 transition-colors">
                <span className="text-2xl">+</span>
             </div>
             <span className="font-medium">Create New</span>
           </button>
        </div>
      </div>
    </div>
  );
};
