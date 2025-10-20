
'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

// A private variable to hold the admin instance.
let _admin: admin.app.App;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is designed to be idempotent, meaning it can be called
 * multiple times without creating new instances.
 */
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    _admin = admin.app();
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;
  if (!serviceAccountString) {
    // During build, this env var might not be available, and we don't need it.
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }
    throw new Error('Firebase service account key environment variable is not set at runtime.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    _admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin SDK Initialization Error at runtime:', error);
    throw new Error('Failed to initialize Firebase Admin SDK at runtime.');
  }
}

/**
 * Lazily initializes and returns the Firebase Admin App instance.
 * Ensures that initialization only happens once.
 */
function getFirebaseAdminApp() {
  if (!_admin) {
    initializeAdminApp();
  }
  // If we are in a build phase where admin couldn't initialize, return a mock
  if (!_admin) {
    return { auth: () => ({}), firestore: () => ({}) } as any;
  }
  return _admin;
}


// Export async getters for the services.
// They ensure the app is initialized before returning a service.
export const auth = async () => getFirebaseAdminApp().auth();
export const db = async () => getFirebaseAdminApp().firestore();
