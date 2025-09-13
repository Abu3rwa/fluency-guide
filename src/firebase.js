import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyAUdHOyrv9qHFQiZD8W0EGWTRXU__PJskU",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "mr-abdulhafeez.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mr-abdulhafeez",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "mr-abdulhafeez.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "280231920119",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:280231920119:web:b2c4683c9978e07148eef2",
};

console.log("🔧 Firebase Configuration:", {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  usingEnvironmentVars: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'server',
  environment: process.env.NODE_ENV
});

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    return false;
  }

  return true;
};

// Validate configuration before initialization
if (!validateFirebaseConfig()) {
  throw new Error('Invalid Firebase configuration');
}

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };


// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { initializeApp, getApps, getApp } from "firebase/app";
// import {
//   getFirestore,
//   enableIndexedDbPersistence,
//   connectFirestoreEmulator,
// } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// import { enableMultiTabIndexedDbPersistence } from "firebase/firestore";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey:
//     process.env.REACT_APP_FIREBASE_API_KEY ||
//     "AIzaSyAUdHOyrv9qHFQiZD8W0EGWTRXU__PJskU",
//   authDomain:
//     process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
//     "mr-abdulhafeez.firebaseapp.com",
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mr-abdulhafeez",
//   storageBucket:
//     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
//     "mr-abdulhafeez.appspot.com",
//   messagingSenderId:
//     process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "280231920119",
//   appId:
//     process.env.REACT_APP_FIREBASE_APP_ID ||
//     "1:280231920119:web:b2c4683c9978e07148eef2",
// };

// // Validate Firebase configuration
// const requiredEnvVars = {
//   apiKey: firebaseConfig.apiKey,
//   authDomain: firebaseConfig.authDomain,
//   projectId: firebaseConfig.projectId,
//   storageBucket: firebaseConfig.storageBucket,
//   messagingSenderId: firebaseConfig.messagingSenderId,
//   appId: firebaseConfig.appId,
// };

// const missingVars = Object.entries(requiredEnvVars)
//   .filter(([_, value]) => !value)
//   .map(([key]) => key);

// if (missingVars.length > 0) {
//   console.warn("Using fallback Firebase configuration values.");
// }

// // Initialize Firebase and services
// let app, auth, db, storage;

// // First initialize the Firebase app
// try {
//   if (!getApps().length) {
//     console.log("Initializing new Firebase app...");
//     app = initializeApp(firebaseConfig);
//   } else {
//     console.log("Using existing Firebase app...");
//     app = getApp();
//   }
// } catch (error) {
//   console.error("Firebase initialization error:", error);
//   throw new Error("Failed to initialize Firebase");
// }

// // Then initialize the services
// try {
//   console.log(
//     "Initializing Firebase services with project ID:",
//     firebaseConfig.projectId
//   );
//   auth = getAuth(app);
//   db = getFirestore(app);
//   storage = getStorage(app);

//   // Add network state detection
//   window.addEventListener("online", () => {
//     console.log("Browser is online - Firebase connection should work");
//   });

//   window.addEventListener("offline", () => {
//     console.log("Browser is offline - Firebase operations may fail");
//   });

//   // Verify initialization
//   if (!auth || !db || !storage) {
//     throw new Error("Firebase services not properly initialized");
//   }

//   console.log("Firebase initialized successfully:", {
//     app: !!app,
//     auth: !!auth,
//     db: !!db,
//     storage: !!storage,
//     projectId: firebaseConfig.projectId,
//     networkStatus: navigator.onLine ? "Online" : "Offline",
//   });
// } catch (error) {
//   console.error("Error initializing Firebase services:", error);

//   // Create dummy services to prevent app from crashing
//   console.warn("Using dummy Firebase services due to initialization error");
//   auth = {
//     currentUser: null,
//     onAuthStateChanged: (callback) => callback(null),
//   };
//   db = {
//     collection: () => ({
//       doc: () => ({
//         get: () =>
//           Promise.resolve({
//             exists: false,
//             data: () => ({}),
//           }),
//       }),
//     }),
//   };
//   storage = {};
// }

// // Export the services (either real or dummy)
// export { auth, db, storage };
