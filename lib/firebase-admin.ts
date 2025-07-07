import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

console.log("🔍 Firebase Admin: Initializing...");

// Check if required environment variables are present
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
};

console.log("🔍 Firebase Admin: Environment variables check:", {
  FIREBASE_PROJECT_ID: !!requiredEnvVars.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: !!requiredEnvVars.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: !!requiredEnvVars.FIREBASE_PRIVATE_KEY
});

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ Firebase Admin: Missing environment variables:", missingVars);
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Inicializar Firebase Admin apenas uma vez
if (!getApps().length) {
  console.log("🔍 Firebase Admin: No existing apps, initializing new app...");
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    console.log("✅ Firebase Admin: Successfully initialized");
  } catch (error) {
    console.error("❌ Firebase Admin: Failed to initialize:", error);
    throw error;
  }
} else {
  console.log("🔍 Firebase Admin: Using existing app");
}

console.log("🔍 Firebase Admin: Getting Firestore instance...");
export const db = getFirestore();
console.log("✅ Firebase Admin: Firestore instance ready");