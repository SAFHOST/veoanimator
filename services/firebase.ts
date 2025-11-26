// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBeMjk3b7XszitKjsk6XMqvNLpIqIJfLDE",
  authDomain: "gen-lang-client-0969034974.firebaseapp.com",
  projectId: "gen-lang-client-0969034974",
  storageBucket: "gen-lang-client-0969034974.firebasestorage.app",
  messagingSenderId: "608483629046",
  appId: "1:608483629046:web:28c886f0f00804cc9719d7",
  measurementId: "G-LS7DE42411"
};

// Initialize Firebase
// Use a dummy config if keys are missing during build time to prevent crash
const app = firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : initializeApp({ apiKey: "dummy", projectId: "dummy" }); 

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);