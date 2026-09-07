// ==========================================
// MYSTROPARYAJ - FIREBASE CONFIGURATION
// ==========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// ------------------------------------------
// Firebase MystroParyaj
// ------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA",
  authDomain: "mystroparyaj.firebaseapp.com",
  projectId: "mystroparyaj",
  storageBucket: "mystroparyaj.firebasestorage.app",
  messagingSenderId: "600616770104",
  appId: "1:600616770104:web:984d5a0a40bce26ab224cd"
};


// ------------------------------------------
// Initialisation
// ------------------------------------------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ------------------------------------------
// reCAPTCHA
// ------------------------------------------

let recaptchaVerifier = null;

export function initRecaptcha(buttonId) {

  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    buttonId,
    {
      size: "invisible"
    }
  );

  return recaptchaVerifier;
}


// ------------------------------------------
// Envoyer le code SMS
// Exemple:
// await sendPhoneCode("+509XXXXXXXX")
// ------------------------------------------

export async function sendPhoneCode(phoneNumber, buttonId) {

  if (!phoneNumber) {
    throw new Error("Numéro de téléphone obligatoire.");
  }

  const verifier = initRecaptcha(buttonId);

  const confirmationResult =
    await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );

  window.mystroConfirmationResult =
    confirmationResult;

  return confirmationResult;
}


// ------------------------------------------
// Vérifier le code SMS
// ------------------------------------------

export async function verifyPhoneCode(code) {

  if (!window.mystroConfirmationResult) {
    throw new Error(
      "Envoyez d'abord le code SMS."
    );
  }

  if (!code) {
    throw new Error(
      "Entrez le code reçu par SMS."
    );
  }

  const result =
    await window.mystroConfirmationResult.confirm(code);

  const user = result.user;

  // Création du profil seulement s'il n'existe pas.
  const userRef = doc(db, "users", user.uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {

    await setDoc(userRef, {
      uid: user.uid,
      phoneNumber: user.phoneNumber || "",
      createdAt: serverTimestamp()
    });

  }

  return user;
}


// ------------------------------------------
// Utilisateur connecté
// ------------------------------------------

export function watchAuth(callback) {

  return onAuthStateChanged(
    auth,
    callback
  );

}


// ------------------------------------------
// Déconnexion
// ------------------------------------------

export async function logoutUser() {

  await signOut(auth);

}


// ------------------------------------------
// Exports
// ------------------------------------------

export {
  app,
  auth,
  db
};
