/*
 * FIREBASE CONFIG - edit this one file (you can do it right on github.com, no rebuild needed).
 * Firebase Console > Project settings (gear) > General > Your apps > Web app (</>) > "firebaseConfig".
 * These values are NOT secrets; your data is protected by firestore.rules + sign-in.
 *
 * Leave apiKey empty to run in local demo mode (data stays in each browser only).
 */
window.BANGASH_FIREBASE = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAobouMoRzLhmBypLGbCpR-PahOsETDTKs",
  authDomain: "bangash-transport-erp.firebaseapp.com",
  projectId: "bangash-transport-erp",
  storageBucket: "bangash-transport-erp.firebasestorage.app",
  messagingSenderId: "131748529261",
  appId: "1:131748529261:web:99e87ceaf0cff78173eb64",
  measurementId: "G-12C32EKQJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
};
