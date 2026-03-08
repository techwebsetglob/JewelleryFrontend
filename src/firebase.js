import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_MpXBFTCb3gR8W2csuq_TGqvEMPQCKu4",
  authDomain: "aurum-wsg.firebaseapp.com",
  projectId: "aurum-wsg",
  storageBucket: "aurum-wsg.firebasestorage.app",
  messagingSenderId: "964399285270",
  appId: "1:964399285270:web:01248b8c81ee9351bbe137"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
