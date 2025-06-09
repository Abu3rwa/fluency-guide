import { getAuth, onAuthStateChanged } from "firebase/auth";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { db, auth };
