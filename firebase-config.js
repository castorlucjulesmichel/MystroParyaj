// ==========================================
// MYSTROPARYAJ - FIREBASE CONFIGURATION
// Email/Password + Firestore
// ==========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
// Firebase config
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
// Créer un compte
// ------------------------------------------

export async function registerWithEmail(
  email,
  password
) {

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user =
    credential.user;

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );

  const snapshot =
    await getDoc(
      userRef
    );


  if (!snapshot.exists()) {

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email:
          user.email || "",
        createdAt:
          serverTimestamp()
      }
    );

  }

  return user;
}


// ------------------------------------------
// Connexion
// ------------------------------------------

export async function loginWithEmail(
  email,
  password
) {

  const credential =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return credential.user;
}


// ------------------------------------------
// Réinitialisation mot de passe
// ------------------------------------------

export async function resetPassword(
  email
) {

  if (!email) {

    throw new Error(
      "Entrez votre adresse e-mail."
    );

  }

  await sendPasswordResetEmail(
    auth,
    email
  );
}


// ------------------------------------------
// Suivre l'état de connexion
// ------------------------------------------

export function watchAuth(
  callback
) {

  return onAuthStateChanged(
    auth,
    callback
  );

}


// ------------------------------------------
// Déconnexion
// ------------------------------------------

export async function logoutUser() {

  await signOut(
    auth
  );

}


// ------------------------------------------
// Exports
// ------------------------------------------

export {
  app,
  auth,
  db
};
