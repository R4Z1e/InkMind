import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, signInAnonymously, linkWithCredential, linkWithPopup, EmailAuthProvider, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, FieldPath, deleteField } from 'firebase/firestore';
import { install } from './shim.js';

const F = {
  initializeApp,
  getAuth: app => { const a = getAuth(app); try { a.languageCode = 'pt-BR'; setPersistence(a, browserLocalPersistence); } catch {} return a; },
  getFirestore: app => { try { return initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }); } catch { return initializeFirestore(app, { ignoreUndefinedProperties: true }); } },
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail, updateProfile, signInAnonymously, linkWithCredential, linkWithPopup, EmailAuthProvider, deleteUser, reauthenticateWithCredential, reauthenticateWithPopup,
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, FieldPath, deleteField
};
export function start(cfg) { return install(cfg, F); }
