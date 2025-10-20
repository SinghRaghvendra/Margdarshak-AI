
'use server';

import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;

    if (!serviceAccount) {
        // This check is primarily for runtime, as the build process might not have the env var.
        // The logic in dependent files will handle build-time checks.
        console.warn('Firebase service account key not found. Admin SDK will not be initialized.');
    } else {
         // The initialization should only happen when the code is executed at runtime, not build time.
         // Next.js sets NEXT_PHASE during the build process.
        if (process.env.NEXT_PHASE !== 'phase-production-build') {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(serviceAccount)),
                });
            } catch (error: any) {
                console.error('Firebase Admin Initialization Error:', error);
                // We don't throw here to allow the build to pass, but runtime errors will occur.
            }
        }
    }
}


// Export getters that will return the initialized services.
// This ensures that any file importing these will get the live instance.
export const auth = admin.auth();
export const db = admin.firestore();
