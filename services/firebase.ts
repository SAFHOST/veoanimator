// services/firebase.ts (or ../firebase.ts depending on location)

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeMjk3b7XszitKjsk6XMqvNLpIqIJfLDE",
  authDomain: "gen-lang-client-0969034974.firebaseapp.com",
  projectId: "gen-lang-client-0969034974",
  storageBucket: "gen-lang-client-0969034974.firebasestorage.app",
  messagingSenderId: "608483629046",
  appId: "1:608483629046:web:28c886f0f00804cc9719d7",
  measurementId: "G-LS7DE42411",
};

const app = initializeApp(firebaseConfig);

// ✅ these three are used in store.ts
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// ✅ this one is used in LandingPage.tsx
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
