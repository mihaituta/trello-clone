// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
  runTransaction,
  writeBatch,
  limit,
  where,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// Initialize Firebase
const fbApp = initializeApp({
  apiKey: "AIzaSyDsy_hm4R0g8NlYSTYj9_vUNTAXLCMCCro",
  authDomain: "trello-clone-mt.firebaseapp.com",
  projectId: "trello-clone-mt",
  storageBucket: "trello-clone-mt.appspot.com",
  messagingSenderId: "317131672942",
  appId: "1:317131672942:web:a52afbd20c2970903d457f"
})

const fbAuth = getAuth(fbApp)
const fbDB = getFirestore(fbApp)

fbAuth.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(fbAuth, user => {
      unsubscribe();
      resolve(user);
    }, reject);
  })
}

export {
  fbAuth,
  fbDB,
  fbApp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  collection,
  query,
  onSnapshot,
  orderBy,
  runTransaction,
  writeBatch,
  limit,
  where,
  arrayUnion,
  arrayRemove
}
