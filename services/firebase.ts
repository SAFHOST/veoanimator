// services/firebase.ts

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
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

// Auth with LOCAL persistence (survives reload)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence:", err);
});

export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);
