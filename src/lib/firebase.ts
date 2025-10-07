import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBO-zImB48lCyD0XhUrx4QwgXc_uuyfMgc",
  authDomain: "vinerealms.firebaseapp.com",
  projectId: "vinerealms",
  storageBucket: "vinerealms.firebasestorage.app",
  messagingSenderId: "221195509403",
  appId: "1:221195509403:web:5f576771b4fbffa15c303e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
