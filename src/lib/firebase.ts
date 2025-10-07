import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2UQOk9joN72VMWW17Rk1C-ebZa5tjsYs",
  authDomain: "vinenovel-245bd.firebaseapp.com",
  projectId: "vinenovel-245bd",
  storageBucket: "vinenovel-245bd.firebasestorage.app",
  messagingSenderId: "106235916171",
  appId: "1:106235916171:web:02c806590742866e83c98e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
