import { User, Transaction, AppSettings, UserRole } from "../types";
import { db, auth, googleProvider } from "./firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs,
  limit
} from "firebase/firestore";

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

const defaultSettings: AppSettings = {
  appName: 'Veo Animator SaaS',
  branding: { logo: null, favicon: null },
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

// In-Memory Cache
let users: User[] = [];
let transactions: Transaction[] = [];
let settings: AppSettings = defaultSettings;
let currentUser: User | null = null;
let initialized = false;

// Helpers to sync data
const fetchSettings = async () => {
    try {
        const docRef = doc(db, "config", "appSettings");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            settings = { 
                ...defaultSettings, 
                ...data, 
                // Deep merge objects to prevent overwriting with partial data
                apiKeys: { ...defaultSettings.apiKeys, ...(data.apiKeys || {}) },
                branding: { ...defaultSettings.branding, ...(data.branding || {}) }
            } as AppSettings;
        } else {
            // Initialize DB with defaults
            await setDoc(docRef, defaultSettings);
        }
    } catch (error) {
        console.warn("Failed to fetch settings, using defaults", error);
    }
};

const fetchUsers = async () => {
    try {
        const q = query(collection(db, "users"));
        const querySnapshot = await getDocs(q);
        users = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as User);
        });
    } catch (error) {
        console.warn("Failed to fetch users", error);
    }
};

export const store = {
  // --- Initialization ---
  init: () => new Promise<void>((resolve) => {
    if (initialized) return resolve();
    
    // 1. Fetch Settings First (Fast, needed for branding)
    fetchSettings().then(() => {
        // 2. Listen for Auth State
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is logged in, fetch their profile
                const userRef = doc(db, "users", firebaseUser.uid);
                try {
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        currentUser = snap.data() as User;
                        
                        // Optimization: Only fetch ALL users if the logged-in user is Admin/Staff
                        // This prevents downloading the whole DB for standard users
                        if (['admin', 'editor', 'viewer'].includes(currentUser.role)) {
                            await fetchUsers();
                        } else {
                            // For standard users, just populate the cache with themselves so 'getUsers' doesn't crash
                            users = [currentUser];
                        }
                    }
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }
            } else {
                currentUser = null;
            }
            
            initialized = true;
            resolve();
        });
    });
  }),

  // --- Auth ---
  loginWithGoogle: async (): Promise<UserRole | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        
        // Check if user exists in our DB
        const userRef = doc(db, "users", fbUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            currentUser = userSnap.data() as User;
            // If they are admin, fetch the rest of the users now
            if (['admin', 'editor', 'viewer'].includes(currentUser.role)) {
                await fetchUsers();
            }
            return currentUser.role;
        } else {
            // Register new user
            
            // SECURITY FIX: Check DB directly if any users exist.
            // (Memory cache 'users' might be empty if we loaded as guest)
            const q = query(collection(db, "users"), limit(1));
            const snapshot = await getDocs(q);
            const isFirstUser = snapshot.empty;
            
            const newUser: User = {
                id: fbUser.uid,
                name: fbUser.displayName || 'Unknown',
                email: fbUser.email || '',
                role: isFirstUser ? 'admin' : 'user', // First ever user is admin
                plan: 'free',
                credits: 5, // Free trial credits
                usedCredits: 0,
                status: 'active',
                avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fbUser.uid}`
            };
            
            await setDoc(userRef, newUser);
            users.push(newUser);
            currentUser = newUser;
            return newUser.role;
        }
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
  },

  logout: async () => {
    await firebaseSignOut(auth);
    currentUser = null;
    // Clear sensitive data from memory on logout
    if (!['admin', 'editor', 'viewer'].includes(currentUser?.role || '')) {
        users = [];
    }
  },

  // --- Data Access (Sync Reads, Async Writes) ---

  getCurrentUser: () => currentUser,

  getUsers: () => [...users],

  getUser: (id: string) => users.find(u => u.id === id),

  updateUser: async (id: string, data: Partial<User>) => {
    // Optimistic Update
    users = users.map(u => u.id === id ? { ...u, ...data } : u);
    if (currentUser?.id === id) {
        currentUser = { ...currentUser, ...data };
    }
    
    // DB Update
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, data);
  },

  hasPermission: (permission: string): boolean => {
    if (!currentUser) return false;
    return PERMISSIONS[currentUser.role]?.includes(permission) || false;
  },

  deductCredit: async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        const newData = { 
            credits: Math.max(0, user.credits - 1), 
            usedCredits: user.usedCredits + 1 
        };
        // Optimistic
        users = users.map(u => u.id === userId ? { ...u, ...newData } : u);
        if (currentUser?.id === userId) {
            currentUser = { ...currentUser, ...newData };
        }
        // DB
        await updateDoc(doc(db, "users", userId), newData);
    }
  },

  getTransactions: () => [...transactions],

  getSettings: () => ({ ...settings }),

  updateSettings: async (newSettings: Partial<AppSettings>) => {
     // Optimistic
     settings = { 
        ...settings, 
        ...newSettings,
        apiKeys: { ...settings.apiKeys, ...(newSettings.apiKeys || {}) },
        branding: { ...settings.branding, ...(newSettings.branding || {}) },
        paymentMethods: { ...settings.paymentMethods, ...(newSettings.paymentMethods || {}) }
     };

     // DB
     await setDoc(doc(db, "config", "appSettings"), settings);
     return settings;
  },

  getStats: () => {
    // Simple calculations based on memory
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
    const generationsByPlan = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + user.usedCredits;
      return acc;
    }, { free: 0, pro: 0, enterprise: 0 } as Record<string, number>);

    // Mock time-series data
    const userGrowth = [
        { month: 'Jun', count: users.length > 10 ? Math.floor(users.length * 0.2) : 2 },
        { month: 'Jul', count: users.length > 10 ? Math.floor(users.length * 0.4) : 5 },
        { month: 'Aug', count: users.length > 10 ? Math.floor(users.length * 0.6) : 8 },
        { month: 'Sep', count: users.length > 10 ? Math.floor(users.length * 0.8) : 10 },
        { month: 'Oct', count: users.length },
    ];

    return {
        generationsByPlan,
        userGrowth,
        activity: [
            { day: 'Mon', value: 45 }, { day: 'Tue', value: 52 }, { day: 'Wed', value: 38 },
            { day: 'Thu', value: 65 }, { day: 'Fri', value: 48 }, { day: 'Sat', value: 20 },
            { day: 'Sun', value: 15 }
        ]
    };
  }
};