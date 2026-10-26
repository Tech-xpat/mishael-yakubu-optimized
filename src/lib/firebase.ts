import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwMt3l5FKjabNDpu8ybVwaAdKi2DqdYQw",
  authDomain: "mishael-port-folio.firebaseapp.com",
  databaseURL: "https://mishael-port-folio-default-rtdb.firebaseio.com",
  projectId: "mishael-port-folio",
  storageBucket: "mishael-port-folio.firebasestorage.app",
  messagingSenderId: "90852999870",
  appId: "1:90852999870:web:1664dcba497c022effd4ef",
  measurementId: "G-W9F0GG8Y6R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;
