import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDfhGOlPBUmLrctdXSY8JYU_2ntM5TiyF0",
  authDomain: "campussphere-ed53b.firebaseapp.com",
  databaseURL: "https://campussphere-ed53b-default-rtdb.firebaseio.com",
  projectId: "campussphere-ed53b",
  storageBucket: "campussphere-ed53b.firebasestorage.app",
  messagingSenderId: "660868438136",
  appId: "1:660868438136:web:b11f1bcef8054c6698358d",
  measurementId: "G-X3JX6B6P2G"
};
export const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const storage = getStorage(app);
