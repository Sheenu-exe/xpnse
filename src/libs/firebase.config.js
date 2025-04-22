// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC9C1xB12PYok_NhFtYUYCSOFA789ZiwTY",
  authDomain: "ghosted-cded9.firebaseapp.com",
  databaseURL: "https://ghosted-cded9-default-rtdb.firebaseio.com",
  projectId: "ghosted-cded9",
  storageBucket: "ghosted-cded9.appspot.com",
  messagingSenderId: "886947234044",
  appId: "1:886947234044:web:961f7742766a373bd01779"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
