// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyCStBynaC4A9Lg39znl4qIFtePNcKelJjU",

  authDomain: "healthbyte-c33bc.firebaseapp.com",

  projectId: "healthbyte-c33bc",

  storageBucket: "healthbyte-c33bc.firebasestorage.app",

  messagingSenderId: "152334704883",

  appId: "1:152334704883:web:0ec2e7fcc79a361a125786"

};



// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore()