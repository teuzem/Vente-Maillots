import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAp24fKC63Gh8eSL0dcK29Pox9Z88chz5c",
  authDomain: "sportwear-1d145.firebaseapp.com",
  projectId: "sportwear-1d145",
  storageBucket: "sportwear-1d145.firebasestorage.app",
  messagingSenderId: "270182332317",
  appId: "1:270182332317:web:6b38135049d310b9a1a174",
  measurementId: "G-N6CJKXPBZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export default app;
