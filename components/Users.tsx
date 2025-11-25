
import React, { useState } from 'react';
import { store } from '../services/store';
import { User } from '../types';
import { Button } from './Button';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);

  const canManageUsers = store.hasPermission('manage_users');

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewCredits(user.credits);
  };

  const handleSave = () => {
    if (editingUser) {
      store.updateUser(editingUser.id, { credits: newCredits });
      setUsers(store.getUsers()); // Refresh
      setEditingUser(null);
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    store.updateUser(user.id, { status: newStatus });
    setUsers(store.getUsers());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-white">User Management</h1>
         {canManageUsers && <Button variant="primary">Add User</Button>}
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Credits</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {canManageUsers && <th className="px-6 py-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-700" />
                    <div>
                      <div className="text-white font-medium text-sm">{user.name}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-300 text-sm capitalize bg-slate-700/50 px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs uppercase font-bold rounded-md ${
                    user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    user.plan === 'pro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-white text-sm font-mono">
                  {user.credits}
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {user.usedCredits} videos
                </td>
                <td className="px-6 py-4">
                  {canManageUsers ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                          user.status === 'active' ? 'bg-green-500' : 'bg-slate-600'
                        }`}
                        title={user.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      >
                        <span
                          className={`${
                            user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${user.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                      }`}></span>
                      {user.status}
                    </span>
                  )}
                </td>
                {canManageUsers && (
                  <td className="px-6 py-4 text-right">
                    <Button variant="secondary" className="!py-1 !px-3 text-xs" onClick={() => handleEditClick(user)}>
                      Set Limit
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit Limits for {editingUser.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Credits Remaining</label>
                <input 
                  type="number" 
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-2">Adjusting this value will instantly update the user's generation capability.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
