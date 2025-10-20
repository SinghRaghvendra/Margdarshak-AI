
import * as admin from 'firebase-admin';

// This file is for SERVER-SIDE Firebase Admin SDK

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI;

if (!serviceAccount) {
    throw new Error('Firebase service account key not found. Please set the FIREBASE_SERVICE_ACCOUNT_MARGDARSHAK_AI environment variable.');
}

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount)),
        });
    }
} catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error);
    // Throwing an error is important here because the app cannot function without it.
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
}


export const auth = admin.auth();
export const db = admin.firestore();
