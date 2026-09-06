// firebase-config.js
// Configuration Firebase de MystroParyaj
// Remplacez les valeurs VOTRE_... par celles de votre projet Firebase.
//
// IMPORTANT :
// Ne mettez jamais ici votre Client Secret MonCash,
// une clé secrète NatCash ou un autre secret de paiement.

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


const firebaseConfig = {

  apiKey: "VOTRE_FIREBASE_API_KEY",

  authDomain: "VOTRE_PROJET.firebaseapp.com",

  projectId: "VOTRE_PROJET",

  storageBucket: "VOTRE_PROJET.appspot.com",

  messagingSenderId: "VOTRE_SENDER_ID",

  appId: "VOTRE_APP_ID"

};


// Vérifie si la vraie configuration Firebase
// a déjà été ajoutée.
const configured = !Object.values(firebaseConfig)
  .some(value => String(value).startsWith("VOTRE_"));


let auth = null;


// Firebase ne démarre que lorsque
// les vraies informations ont été ajoutées.
if (configured) {

  const app = initializeApp(firebaseConfig);

  auth = getAuth(app);

}


export {
  auth,
  configured,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
};
