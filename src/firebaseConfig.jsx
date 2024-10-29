// src/components/Login.js
import React, { useState } from "react";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkfIFaW7T0Fxvnhe9Udc48rZKuIkEBPRY",
  authDomain: "dungeon-master-pro.firebaseapp.com",
  projectId: "dungeon-master-pro",
  storageBucket: "dungeon-master-pro.appspot.com",
  messagingSenderId: "670514258390",
  appId: "1:670514258390:web:4d85ee0d7e44c689400477",
  measurementId: "G-P15F99BHYE",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);

//Set persistence
// setPersistence(auth, browserLocalPersistence).catch((error) => {
//   console.error("error setting persistence:", error);
// });

const login = async (email, setEmail, password, setPassword) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setEmail("");
    setPassword("");
  } catch (error) {
    console.error("Login error:", error.message);
  }
};

const signup = async (email, setEmail, password, setPassword) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    setEmail("");
    setPassword("");
    console.log(userCredential);
  } catch (error) {
    console.error("Signup error", error.message);
  }
};

// const monitorAuthState = async () => {
//   onAuthStateChanged(auth, (user) => {
//     if (!user) {
//       console.log("User loged in");
//       setLoggedIn(true);
//     } else {
//       console.log("User loged out");
//       setLoggedIn(false);
//     }
//   });
// };

const logout = () => {
  setTimeout(async () => {
    await signOut(auth);
  }, 10);
};

export { login, signup, logout, auth };
