// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
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
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };