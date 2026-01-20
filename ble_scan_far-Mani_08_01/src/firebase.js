import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADMWDFR3qUHMjgAdiYUeqVY9unaxfrB5o",
  authDomain: "blereader-c8f66.firebaseapp.com",
  projectId: "blereader-c8f66",
  storageBucket: "blereader-c8f66.firebasestorage.app",
  messagingSenderId: "253606930574",
  appId: "1:253606930574:web:1762f03e07ebe6afb3c1df",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
