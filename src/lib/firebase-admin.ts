
'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

let adminInstance: admin.app.App | null = null;

function getFirebaseAdminApp() {
  if (adminInstance) {
    return adminInstance;
  }

  // Do not initialize during the build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a dummy object during build to avoid errors, it won't be used
    return { auth: () => ({}), firestore: () => ({}) } as any;
  }

  if (admin.apps.length > 0) {
    adminInstance = admin.app();
    return adminInstance;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;
  if (!serviceAccountString) {
    throw new Error('Firebase service account key environment variable is not set at runtime.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return adminInstance;
  } catch (error) {
    console.error('Firebase Admin SDK Initialization Error at runtime:', error);
    throw new Error('Failed to initialize Firebase Admin SDK at runtime.');
  }
}

// Export async getters for the services.
// They ensure the app is initialized before returning a service.
export const auth = async () => getFirebaseAdminApp().auth();
export const db = async () => getFirebaseAdminApp().firestore();
