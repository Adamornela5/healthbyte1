// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestor} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRwovsaRsn7hFHk-PsXpHDjgXx710vPL8",
  authDomain: "healthbyte-c971f.firebaseapp.com",
  projectId: "healthbyte-c971f",
  storageBucket: "healthbyte-c971f.firebasestorage.app",
  messagingSenderId: "882188401502",
  appId: "1:882188401502:web:df08b4e0701775f05b6dcf",
  measurementId: "G-GS0S1NYFLB"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestor()