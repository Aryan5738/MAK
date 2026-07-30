import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, onValue, push, remove, update, get, set, child } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDXX72Iz1fFamIkReyhOFpDa2bi4e7NuhE',
  authDomain: 'casio-7b454.firebaseapp.com',
  databaseURL: 'https://casio-7b454-default-rtdb.firebaseio.com',
  projectId: 'casio-7b454',
  storageBucket: 'casio-7b454.firebasestorage.app',
  messagingSenderId: '890207007876',
  appId: '1:890207007876:web:004239de36b7e4eb573ed1',
  measurementId: 'G-9EEK2GVR1M'
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Ensure login persists after refresh until logout - Real system
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);

// Re-export helpers
export { ref, onValue, push, remove, update, get, set, child };
export const registerUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginUser = (email, password) => {
  // Set persistence to local before login for real system
  return setPersistence(auth, browserLocalPersistence).then(() => signInWithEmailAndPassword(auth, email, password));
};
export const logoutUser = () => signOut(auth);
export { onAuthStateChanged, collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp };
