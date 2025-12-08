import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialize Firebase Admin SDK for server-side operations
 * This is used in API routes to perform admin operations
 */

// Check if Firebase Admin has already been initialized
if (!getApps().length) {
  try {
    // In production, use service account credentials from environment variable
    // In development, you can use application default credentials or a service account file

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : undefined;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fallback to default credentials (works in Cloud Functions and local emulator)
      initializeApp();
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

export const adminDb = getFirestore();
