import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCvBtCj4Rm7TYL2khSsb3q0wijovmkL2wI",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bloodunityapp-d7757",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bloodunityapp-d7757.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "297648206041",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = hasFirebaseConfig ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;

export const db = app ? getFirestore(app) : null;
