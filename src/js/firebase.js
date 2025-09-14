import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAncK6PWOIx3iMbtnFEgux1cMYfezPpHWo",
    authDomain: "mister-rice.firebaseapp.com",
    projectId: "mister-rice",
    storageBucket: "mister-rice.firebasestorage.app",
    messagingSenderId: "673926765502",
    appId: "1:673926765502:web:93892992a399c55e3bf7ef",
    measurementId: "G-ZXXCT85CRP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
