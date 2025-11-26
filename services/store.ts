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
        // Add a timeout to prevent hanging if DB is slow
        const timeout = new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000));
        const fetch = getDoc(doc(db, "config", "appSettings"));
        
        const snap: any = await Promise.race([fetch, timeout]);
        
        if (snap && snap.exists()) {
            const data = snap.data();
            settings = { 
                ...defaultSettings, 
                ...data, 
                // Deep merge objects to prevent overwriting with partial data
                apiKeys: { ...defaultSettings.apiKeys, ...(data.apiKeys || {}) },
                branding: { ...defaultSettings.branding, ...(data.branding || {}) }
            } as AppSettings;
        } else if (snap) {
            // Initialize DB with defaults if doc is missing
            await setDoc(doc(db, "config", "appSettings"), defaultSettings);
        }
    } catch (error) {
        console.warn("Settings fetch skipped or failed (using defaults):", error);
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
    
    // OPTIMIZATION: Run fetchSettings and Auth Check in PARALLEL
    const settingsPromise = fetchSettings();
    
    const authPromise = new Promise<void>((resolveAuth) => {
        // onAuthStateChanged fires immediately with current state
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is logged in, fetch their profile
                const userRef = doc(db, "users", firebaseUser.uid);
                try {
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        currentUser = snap.data() as User;
                        
                        // Optimization: Only fetch ALL users if the logged-in user is Admin/Staff
                        if (['admin', 'editor', 'viewer'].includes(currentUser.role)) {
                            await fetchUsers();
                        } else {
                            users = [currentUser];
                        }
                    }
                } catch (e) {
                    console.error("Error fetching user profile", e);
                }
            } else {
                currentUser = null;
            }
            resolveAuth();
        });
    });

    // Wait for both to finish (or settings to timeout) before rendering app
    Promise.all([settingsPromise, authPromise]).then(() => {
        initialized = true;
        resolve();
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
            if (['admin', 'editor', 'viewer'].includes(currentUser.role)) {
                await fetchUsers();
            }
            return currentUser.role;
        } else {
            // Register new user
            const q = query(collection(db, "users"), limit(1));
            const snapshot = await getDocs(q);
            const isFirstUser = snapshot.empty;
            
            const newUser: User = {
                id: fbUser.uid,
                name: fbUser.displayName || 'Unknown',
                email: fbUser.email || '',
                role: isFirstUser ? 'admin' : 'user', 
                plan: 'free',
                credits: 5,
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
        throw error;
    }
  },

  logout: async () => {
    // Capture role BEFORE setting currentUser to null to avoid TypeScript error
    const role = currentUser?.role;

    await firebaseSignOut(auth);
    currentUser = null;
    
    // Clear sensitive data from memory on logout using captured role
    if (!['admin', 'editor', 'viewer'].includes(role || '')) {
        users = [];
    }
  },

  // --- Data Access ---
  getCurrentUser: () => currentUser,
  getUsers: () => [...users],
  getUser: (id: string) => users.find(u => u.id === id),
  updateUser: async (id: string, data: Partial<User>) => {
    users = users.map(u => u.id === id ? { ...u, ...data } : u);
    if (currentUser?.id === id) {
        currentUser = { ...currentUser, ...data };
    }
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
        users = users.map(u => u.id === userId ? { ...u, ...newData } : u);
        if (currentUser?.id === userId) {
            currentUser = { ...currentUser, ...newData };
        }
        await updateDoc(doc(db, "users", userId), newData);
    }
  },
  getTransactions: () => [...transactions],
  getSettings: () => ({ ...settings }),
  updateSettings: async (newSettings: Partial<AppSettings>) => {
     settings = { 
        ...settings, 
        ...newSettings,
        apiKeys: { ...settings.apiKeys, ...(newSettings.apiKeys || {}) },
        branding: { ...settings.branding, ...(newSettings.branding || {}) },
        paymentMethods: { ...settings.paymentMethods, ...(newSettings.paymentMethods || {}) }
     };
     await setDoc(doc(db, "config", "appSettings"), settings);
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
    const generationsByPlan = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + user.usedCredits;
      return acc;
    }, { free: 0, pro: 0, enterprise: 0 } as Record<string, number>);
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