import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: User must replace this with their real Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAT1J2njoqKX_mXEJ-d17rqy703HLmRg34",
    authDomain: "social-app-93d3e.firebaseapp.com",
    projectId: "social-app-93d3e",
    storageBucket: "social-app-93d3e.firebasestorage.app",
    messagingSenderId: "61552326796",
    appId: "1:61552326796:web:88dce822ea43531f4fe3a9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);