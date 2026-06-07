import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getDatabase, ref, set, get, onValue, off, push, remove, update } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
export { ref, set, onValue, off, push, remove, update };

export async function signInGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await set(
  ref(db, `users/${result.user.uid}/profile`),
  {
    uid: result.user.uid,
    name: result.user.displayName,
    email: result.user.email,
    photoURL: result.user.photoURL || "",
    friendCode: `SYNC-${result.user.uid.slice(0,8).toUpperCase()}`,
    createdAt: Date.now()
  }
);
    return { user: { name: result.user.displayName, email: result.user.email, uid: result.user.uid }, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}
