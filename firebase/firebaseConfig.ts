import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth"; // <- for the missing types
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB_zT3sd-CJnfdtZgpuziIC14_uIy01rog",
  authDomain: "auxly-c81d5.firebaseapp.com",
  projectId: "auxly-c81d5",
  storageBucket: "auxly-c81d5.firebasestorage.app",
  messagingSenderId: "46442393798",
  appId: "1:46442393798:web:7a034f2b3e02d7950927c7",
  measurementId: "G-TQ95TXC4QK",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const FirebaseDB = getFirestore(app);
export const FirebaseAuth = initializeAuth(app, {
  // TS types don't know about getReactNativePersistence yet, but it's there at runtime.
  persistence: (firebaseAuth as any).getReactNativePersistence(AsyncStorage),
});
