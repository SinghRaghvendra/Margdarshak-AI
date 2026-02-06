import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let db: Firestore;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Initialize with no arguments.
  // The SDK will automatically detect the service account in the App Hosting environment
  // or from the GOOGLE_APPLICATION_CREDENTIALS environment variable locally.
  return initializeApp();
}

/**
 * Gets the initialized Firestore instance, initializing Firebase Admin if necessary.
 * This "lazy" approach prevents the SDK from initializing during the build process.
 * @returns The Firestore database instance.
 */
export function getDb(): Firestore {
  if (!db) {
    adminApp = initializeFirebaseAdmin();
    db = getFirestore(adminApp);
  }
  return db;
}
