// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxfqwIP7sv2Q0557JKJ6-i_1-4tjM9QKc",
  authDomain: "nstumechatronicsclub.firebaseapp.com",
  projectId: "nstumechatronicsclub",
  storageBucket: "nstumechatronicsclub.firebasestorage.app",
  messagingSenderId: "823201944058",
  appId: "1:823201944058:web:df2e6c2c5d181c8cc39443",
  measurementId: "G-6QN9BWZBE8"
};

// Initialize Firebase (avoid reinitializing in development)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
