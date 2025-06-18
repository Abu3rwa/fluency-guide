import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUdHOyrv9qHFQiZD8W0EGWTRXU__PJskU",
  authDomain: "mr-abdulhafeez.firebaseapp.com",
  projectId: "mr-abdulhafeez",
  storageBucket: "mr-abdulhafeez.appspot.com",
  messagingSenderId: "280231920119",
  appId: "1:280231920119:web:b2c4683c9978e07148eef2",
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
