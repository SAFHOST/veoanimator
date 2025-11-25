
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Safe environment variable access helper
const getEnv = (key: string) => {
  const meta = import.meta as any;
  // Check if import.meta.env exists (Vite standard)
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  // Check process.env (Fallback if defined via Vite config)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID")
};

// Initialize Firebase
// If apiKey is missing (e.g. env vars not set yet), init a dummy app so import doesn't crash.
const app = firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : initializeApp({ apiKey: "dummy-key", projectId: "dummy-project" }); 

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
