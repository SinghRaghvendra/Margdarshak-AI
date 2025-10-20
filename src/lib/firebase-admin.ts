'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

// This flag ensures we initialize only once
let isInitialized = false;

function initializeAdminSDK() {
  // CRITICAL FIX: Skip initialization during the build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (isInitialized) {
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;

  if (!serviceAccountString) {
    // This will now only throw at runtime, not build time
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
    // Throwing here will cause a runtime failure if the key is bad, but the build will pass.
    throw new Error('Failed to initialize Firebase Admin SDK at runtime.');
  }
}

/**
 * Ensures the Admin SDK is initialized and returns the admin namespace.
 * All server-side code must call this function to get access to admin services.
 */
function getFirebaseAdmin() {
  initializeAdminSDK();
  return admin;
}

// Export getters for the services, which internally call the initialization logic.
// This ensures no service is accessed before the app is initialized.
export const auth = () => getFirebaseAdmin().auth();
export const db = () => getFirebaseAdmin().firestore();
