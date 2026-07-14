// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyCU-mHbBZdRPiXOpFLPO6MxLed8WSNVkXQ",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "chandunghocsinh.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "chandunghocsinh",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "chandunghocsinh.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "293067667131",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:293067667131:web:adc4efeb9ec571d6499b9e",
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

