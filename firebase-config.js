import {
  initializeApp
} from
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



const firebaseConfig = {
  apiKey: "AIzaSyCV2QFHQVVxk3HZd4G55HEhadO_Eql2ujA",
  authDomain: "mystroparyaj.firebaseapp.com",
  projectId: "mystroparyaj",
  storageBucket: "mystroparyaj.firebasestorage.app",
  messagingSenderId: "600616770104",
  appId: "1:600616770104:web:984d5a0a40bce26ab224cd"
};



const app =
  initializeApp(firebaseConfig);


const auth =
  getAuth(app);


const db =
  getFirestore(app);



export async function registerWithEmail(
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


  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  const snapshot =
    await getDoc(userRef);


  if (!snapshot.exists()) {

    const profile = {

      uid:
        user.uid,

      email:
        user.email || "",

      accountType:
        "player",

      createdAt:
        serverTimestamp()

    };


    if (
      requestedAccountType ===
      "agent"
    ) {

      profile.requestedAccountType =
        "agent";

      profile.agentRequestStatus =
        "pending";

    }


    await setDoc(
      userRef,
      profile
    );

  }


  return user;

}



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



export async function resetPassword(
  email
) {

  await sendPasswordResetEmail(
    auth,
    email
  );

}



export function watchAuth(
  callback
) {

  return onAuthStateChanged(
    auth,
    callback
  );

}



export async function logoutUser() {

  return signOut(auth);

}



export {
  app,
  auth,
  db
};
