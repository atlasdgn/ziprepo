import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFqmpnr7yDTP9FJbijBpTBaGTxTZvll6s",
  authDomain: "fortrxtdev.firebaseapp.com",
  databaseURL: "https://fortrxtdev-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fortrxtdev",
  storageBucket: "fortrxtdev.firebasestorage.app",
  messagingSenderId: "1082275472039",
  appId: "1:1082275472039:web:fdcaafbdbaae3ab62cf182",
  measurementId: "G-STVPFVJVCE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
