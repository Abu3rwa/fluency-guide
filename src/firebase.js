import { getAuth } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";

// Firebase configuration from environment variables
// All values MUST be provided via .env file - no hardcoded fallbacks for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,

  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,

  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration - fail fast if missing required values
const validateFirebaseConfig = () => {
  const requiredFields = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field],
  );

  if (missingFields.length > 0) {
    const errorMessage = `Missing required Firebase environment variables: ${missingFields.map((f) => `REACT_APP_FIREBASE_${f.toUpperCase()}`).join(", ")}. Please check your .env file.`;

    // In development, show detailed error
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Firebase Configuration Error:", errorMessage);
    }

    throw new Error(errorMessage);
  }

  return true;
};

// Validate configuration before initialization
validateFirebaseConfig();

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics: only in browser, and only when measurementId is set (avoids 404 when Analytics isn't set up or app ID is wrong)
let analytics = null;
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // getAnalytics may throw if not supported (e.g. some bots)
  }
}

/** Log an event to Google Analytics (Firebase/GA4). Safe to call even if analytics is not ready. */
function logEvent(eventName, params = {}) {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
}

/** Log a page view (e.g. for React Router). */
function logPageView(path, title = document?.title) {
  logEvent("page_view", { page_path: path, page_title: title });
}

export { auth, db, storage, analytics, logEvent, logPageView };
