// Import needed Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your Firebase config - replace with your actual project settings
const firebaseConfig = {
FIREBASE DATA
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Auth and Realtime Database services
export const auth = getAuth(app);
export const database = getDatabase(app);
