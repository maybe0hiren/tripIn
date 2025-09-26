// Import needed Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your Firebase config - replace with your actual project settings
const firebaseConfig = {
  apiKey: "AIzaSyB9R88B-326LDemE30XIayDxdpR1-23IZs",
  authDomain: "skipqueue-6ec8d.firebaseapp.com",
  databaseURL: "https://skipqueue-6ec8d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skipqueue-6ec8d",
  storageBucket: "skipqueue-6ec8d.firebasestorage.app",
  messagingSenderId: "943738852466",
  appId: "1:943738852466:web:7ab875e932707762dbdeeb",
  measurementId: "G-1HTW8EHMH6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Auth and Realtime Database services
export const auth = getAuth(app);
export const database = getDatabase(app);
