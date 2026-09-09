import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA",
  authDomain: "mystroparyaj.firebaseapp.com",
  projectId: "mystroparyaj",
  storageBucket: "mystroparyaj.firebasestorage.app",
  messagingSenderId: "600616770104",
  appId: "1:600616770104:web:984d5a0a40bce26ab224cd"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =========================
   REGISTER
========================= */

async function register(
  email,
  password,
  requestedAccountType = "player"
) {

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  const user =
    credential.user;

  await setDoc(
    doc(
      db,
      "users",
      user.uid
    ),
    {
      uid:
        user.uid,

      email:
        user.email || "",

      accountType:
        "player",

      requestedAccountType:
        requestedAccountType === "agent"
          ? "agent"
          : "player",

      agentRequestStatus:
        requestedAccountType === "agent"
          ? "not_submitted"
          : "none",

      createdAt:
        serverTimestamp()
    },
    {
      merge: true
    }
  );

  return user;
}


/* =========================
   LOGIN
========================= */

async function login(
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


/* =========================
   RESET PASSWORD
========================= */

async function resetPassword(
  email
) {

  return sendPasswordResetEmail(
    auth,
    email
  );
}


/* =========================
   LOGOUT
========================= */

async function logout() {

  return signOut(auth);
}


/* =========================
   AUTH LISTENER
========================= */

function watch(
  callback
) {

  return onAuthStateChanged(
    auth,
    callback
  );
}


/* =========================
   GLOBAL ADAPTER
   USED BY script.js
========================= */

window.MPAuth = {

  login,

  register,

  resetPassword,

  logout,

  onAuthStateChanged:
    watch,

  auth
};


/* =========================
   EXPORTS
========================= */

export {
  app,
  auth,
  db,
  login,
  register,
  resetPassword,
  logout,
  watch
};
