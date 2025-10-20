
// This file is for CLIENT-SIDE Firebase SDKs
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'margdarshak-ai',
  appId: '1:736384619713:web:168ddf99726ced7703f040',
  storageBucket: 'margdarshak-ai.firebasestorage.app',
  apiKey: 'AIzaSyBCU_pzGk1Dcvq5g-nJMwUp5FI7JDomvZg',
  authDomain: 'margdarshak-ai.firebaseapp.com',
  measurementId: 'G-K6KC1Q5L8B',
  messagingSenderId: '736384619713',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
