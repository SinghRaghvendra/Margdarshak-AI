
'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

// A private variable to hold the admin app instance.
let _admin: admin.app.App;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be idempotent (safe to call multiple times).
 */
function initializeAdminApp() {
  // If the app is already initialized, just use it.
  if (admin.apps.length > 0) {
    _admin = admin.app();
    return;
  }

  // Get service account credentials from environment variables.
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;
  if (!serviceAccountString) {
    // During the Next.js build process, env vars might not be available, which is okay.
    // At runtime, however, this would be a critical error.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn("Firebase Admin SDK not initialized during build phase (no credentials). This is expected.");
      return;
    }
    throw new Error('CRITICAL: Firebase service account credentials environment variable is not set at runtime.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    // Initialize the app and store the instance.
    _admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin SDK Initialization Error:', error);
    // This is a fatal error for server-side auth logic.
    throw new Error('Failed to initialize Firebase Admin SDK. The service account JSON might be invalid.');
  }
}

/**
 * Lazily initializes and returns the Firebase Admin App instance.
 * Ensures that initialization only happens once per server instance.
 */
function getFirebaseAdminApp() {
  if (!_admin) {
    initializeAdminApp();
  }
  // If initialization failed (e.g., during build), we return a mock-like object
  // to prevent crashes, though dependent services will fail.
  if (!_admin) {
    // This provides a "safe" object during build but will not function.
    // At runtime, an error would have already been thrown if initialization failed.
    return { auth: () => ({}), firestore: () => ({}) } as unknown as admin.app.App;
  }
  return _admin;
}


// Export async getters for the services.
// These ensure the app is initialized before returning a service instance.
export const auth = async () => getFirebaseAdminApp().auth();
export const db = async () => getFirebaseAdminApp().firestore();
