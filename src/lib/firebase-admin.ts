
'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

// This flag ensures we initialize only once
let isInitialized = false;

function getFirebaseAdmin() {
  // CRITICAL FIX: Skip initialization during the build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return admin;
  }

  if (!isInitialized) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;

    if (!serviceAccountString) {
      throw new Error('Firebase service account key environment variable is not set at runtime.');
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      isInitialized = true;
    } catch (error) {
      console.error('Firebase Admin SDK Initialization Error at runtime:', error);
      throw new Error('Failed to initialize Firebase Admin SDK at runtime.');
    }
  }
  return admin;
}

// Export async getters for the services, which internally call the initialization logic.
// This ensures no service is accessed before the app is initialized.
export const auth = async () => getFirebaseAdmin().auth();
export const db = async () => getFirebaseAdmin().firestore();
