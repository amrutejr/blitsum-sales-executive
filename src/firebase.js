// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmCTzxg2J_4i238YGCfbfw-96U6a8k_Xo",
    authDomain: "blitsum.firebaseapp.com",
    projectId: "blitsum",
    storageBucket: "blitsum.firebasestorage.app",
    messagingSenderId: "1079315089444",
    appId: "1:1079315089444:web:fe08550589dfa508d570b1",
    measurementId: "G-JGN2MXZNR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
