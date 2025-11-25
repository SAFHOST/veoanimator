
import { User, Transaction, AppSettings, UserRole } from "../types";

const STORAGE_KEY = 'veo_saas_db_v1';

// Permission Configuration
const PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view_admin_dashboard',
    'view_users', 'manage_users', 
    'view_admin_billing', 'manage_admin_billing', 
    'view_admin_settings', 'manage_admin_settings', 
    'generate_videos'
  ],
  editor: [
    'view_admin_dashboard', 
    'view_users', 'manage_users', 
    'generate_videos'
  ],
  viewer: [
    'view_admin_dashboard', 
    'view_users'
  ],
  user: [
    'view_user_dashboard', 
    'generate_videos', 
    'view_own_billing', 
    'view_own_settings'
  ]
};

// Default Mock Data
const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@veosaas.com',
    role: 'admin',
    plan: 'enterprise',
    credits: 9999,
    usedCredits: 12,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  },
  {
    id: '2',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    role: 'user',
    plan: 'pro',
    credits: 45,
    usedCredits: 55,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    plan: 'free',
    credits: 2,
    usedCredits: 3,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    plan: 'free',
    credits: 0,
    usedCredits: 5,
    status: 'suspended',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
  },
  {
    id: '5',
    name: 'Eddie Editor',
    email: 'editor@veosaas.com',
    role: 'editor',
    plan: 'enterprise',
    credits: 500,
    usedCredits: 20,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eddie'
  },
  {
    id: '6',
    name: 'Victor Viewer',
    email: 'viewer@veosaas.com',
    role: 'viewer',
    plan: 'free',
    credits: 0,
    usedCredits: 0,
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Victor'
  }
];

const defaultTransactions: Transaction[] = [
  { id: 'tx_1', userId: '2', amount: 49.00, date: '2023-10-01', status: 'completed', method: 'Stripe' },
  { id: 'tx_2', userId: '3', amount: 0.00, date: '2023-10-02', status: 'completed', method: 'Free Trial' },
  { id: 'tx_3', userId: '2', amount: 49.00, date: '2023-11-01', status: 'completed', method: 'Stripe' },
  { id: 'tx_4', userId: '4', amount: 9.00, date: '2023-11-05', status: 'failed', method: 'PayPal' },
];

const defaultSettings: AppSettings = {
  appName: 'Veo Animator SaaS',
  branding: {
    logo: null,
    favicon: null
  },
  apiKeys: {
    googleGenAI: { key: '', enabled: false },
    veo: { key: '', enabled: false }
  },
  allowRegistrations: true,
  maintenanceMode: false,
  paymentMethods: {
    stripe: { enabled: true, publicKey: 'pk_test_...' },
    paypal: { enabled: false, clientId: '' }
  }
};

// State Variables
let users: User[] = [];
let transactions: Transaction[] = [];
let settings: AppSettings = defaultSettings;

// Helper: Save to LocalStorage
const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      users,
      transactions,
      settings
    }));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

// Helper: Load from LocalStorage
const initializeStore = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      users = data.users || defaultUsers;
      transactions = data.transactions || defaultTransactions;
      // Merge settings to ensure structure integrity if schema changes
      settings = { 
        ...defaultSettings, 
        ...data.settings,
        paymentMethods: { ...defaultSettings.paymentMethods, ...(data.settings?.paymentMethods || {}) },
        branding: { ...defaultSettings.branding, ...(data.settings?.branding || {}) },
        apiKeys: { 
          ...defaultSettings.apiKeys, 
          ...(data.settings?.apiKeys || {}),
          // Deep merge for specific keys to be safe
          googleGenAI: { ...defaultSettings.apiKeys.googleGenAI, ...(data.settings?.apiKeys?.googleGenAI || {}) },
          veo: { ...defaultSettings.apiKeys.veo, ...(data.settings?.apiKeys?.veo || {}) }
        }
      };
    } else {
      users = [...defaultUsers];
      transactions = [...defaultTransactions];
      settings = { ...defaultSettings };
    }
  } catch (e) {
    console.error("Failed to load from localStorage", e);
    users = [...defaultUsers];
    transactions = [...defaultTransactions];
    settings = { ...defaultSettings };
  }
};

// Initialize on module load
initializeStore();

// Session State
let currentUserId: string | null = null;

// Actions
export const store = {
  getUsers: () => [...users],
  
  getUser: (id: string) => users.find(u => u.id === id),
  
  updateUser: (id: string, data: Partial<User>) => {
    users = users.map(u => u.id === id ? { ...u, ...data } : u);
    persist();
    return users.find(u => u.id === id);
  },

  // Auth Methods
  login: (role: UserRole) => {
    // Find first user with matching role
    const user = users.find(u => u.role === role);
    if (user) {
      currentUserId = user.id;
      return user;
    }
    return null;
  },

  logout: () => {
    currentUserId = null;
  },

  getCurrentUser: () => {
    return users.find(u => u.id === currentUserId);
  },

  hasPermission: (permission: string): boolean => {
    if (!currentUserId) return false;
    const user = users.find(u => u.id === currentUserId);
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  },

  deductCredit: (userId: string) => {
    users = users.map(u => {
      if (u.id === userId) {
        return { ...u, credits: u.credits - 1, usedCredits: u.usedCredits + 1 };
      }
      return u;
    });
    persist();
  },

  hasCredits: (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user && user.credits > 0;
  },

  getTransactions: () => [...transactions],

  getSettings: () => ({ ...settings }),

  updateSettings: (newSettings: Partial<AppSettings>) => {
    settings = { 
        ...settings, 
        ...newSettings,
        branding: {
            ...settings.branding,
            ...(newSettings.branding || {})
        },
        paymentMethods: {
            ...settings.paymentMethods,
            ...(newSettings.paymentMethods || {})
        },
        apiKeys: {
          ...settings.apiKeys,
          ...(newSettings.apiKeys || {})
        }
    };
    persist();
    return settings;
  },

  getStats: () => {
    const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
    const totalGenerations = users.reduce((acc, curr) => acc + curr.usedCredits, 0);
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalRevenue,
      totalGenerations
    };
  },

  getAnalytics: () => {
    // Generations by Plan
    const generationsByPlan = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + user.usedCredits;
      return acc;
    }, { free: 0, pro: 0, enterprise: 0 } as Record<string, number>);

    // User Growth Trend (Mock 6 months)
    const userGrowth = [
        { month: 'Jun', count: 12 },
        { month: 'Jul', count: 18 },
        { month: 'Aug', count: 35 },
        { month: 'Sep', count: 50 },
        { month: 'Oct', count: 85 },
        { month: 'Nov', count: 120 }
    ];

    // Weekly Activity
    const activity = [
        { day: 'Mon', value: 45 },
        { day: 'Tue', value: 52 },
        { day: 'Wed', value: 38 },
        { day: 'Thu', value: 65 },
        { day: 'Fri', value: 48 },
        { day: 'Sat', value: 20 },
        { day: 'Sun', value: 15 }
    ];

    return {
        generationsByPlan,
        userGrowth,
        activity
    };
  }
};
