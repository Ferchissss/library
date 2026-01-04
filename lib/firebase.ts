// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfp_V_fSeXDvdIr6bLJkhfvBDH5_aW5cI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "miblog-5157c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "miblog-5157c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "miblog-5157c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "410687363848",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:410687363848:web:dcf85f743f7c72fb81aabd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);