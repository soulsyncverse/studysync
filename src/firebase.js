// StudySync — Firebase Configuration
// File: src/firebase.js
// Handles: Google login, Phone OTP, user data, streak, presence

import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  RecaptchaVerifier, signInWithPhoneNumber,
  signOut, onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  onSnapshot, collection, serverTimestamp,
} from 'firebase/firestore';

// ── Init ─────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Firestore Schema ─────────────────────────────────────────
/*
  users/{uid}:
    name, email, phone, photoURL
    isPro: boolean
    plan: "trial" | "monthly" | "quarter" | null
    trialStarted: ISO string
    proExpiry: ISO string
    streakRestoreUsed: boolean  (first-time ₹10 offer)
    streak: number
    lastStudied: ISO string
    totalSessions: number
    exam: { key, mode, name, date, color, icon }
    createdAt: Timestamp

  users/{uid}/tasks/{id}: { text, subject, done, time, date }
  users/{uid}/notes/{id}: { content, subject, createdAt }
  users/{uid}/flashcards/{id}: { question, answer, subject, mastery, interval }

  publicCircle/{uid}: { name, streak, studying, subject, city, updatedAt }

  circles/{circleId}: { name, members[], createdBy, code, createdAt }
  circles/{circleId}/presence/{uid}: { studying, subject, onBreak, updatedAt }
  circles/{circleId}/messages/{id}: { from, text, time }
*/

// ── Auth: Google ─────────────────────────────────────────────
export async function signInGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await createOrUpdateUser(result.user);
    return { user: result.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

// ── Auth: Phone OTP Step 1 ───────────────────────────────────
export function setupRecaptcha(elementId) {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, { size: 'invisible' });
  return window.recaptchaVerifier;
}

export async function sendOTP(phoneNumber) {
  try {
    const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = result;
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ── Auth: Phone OTP Step 2 ───────────────────────────────────
export async function verifyOTP(otp) {
  try {
    const result = await window.confirmationResult.confirm(otp);
    await createOrUpdateUser(result.user);
    return { user: result.user, error: null };
  } catch {
    return { user: null, error: 'Invalid OTP. Try again.' };
  }
}

export async function logOut() { await signOut(auth); }
export function onAuthChange(cb) { return onAuthStateChanged(auth, cb); }

// ── Firestore: Create user ───────────────────────────────────
export async function createOrUpdateUser(firebaseUser) {
  const ref  = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:                firebaseUser.uid,
      name:               firebaseUser.displayName || 'Aspirant',
      email:              firebaseUser.email       || null,
      phone:              firebaseUser.phoneNumber || null,
      photoURL:           firebaseUser.photoURL    || null,
      isPro:              false,
      plan:               'trial',
      trialStarted:       new Date().toISOString(),
      proExpiry:          new Date(Date.now() + 7 * 86400000).toISOString(), // 7-day trial
      streakRestoreUsed:  false,
      streak:             0,
      lastStudied:        null,
      totalSessions:      0,
      exam: { key: 'UPSC CSE', mode: 'Prelims', name: 'UPSC CSE Prelims', date: '2026-05-24', color: '#FF6B6B', icon: '🏛️' },
      createdAt:          serverTimestamp(),
    });
  } else {
    await updateDoc(ref, { updatedAt: serverTimestamp() });
  }
}

// ── Firestore: Get / Update user ─────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}

// ── Streak logic ─────────────────────────────────────────────
export async function updateStreak(uid) {
  const ref   = doc(db, 'users', uid);
  const snap  = await getDoc(ref);
  const data  = snap.data();
  const today = new Date().toDateString();
  const last  = data.lastStudied ? new Date(data.lastStudied).toDateString() : null;
  const yest  = new Date(Date.now() - 86400000).toDateString();
  let streak  = data.streak || 0;
  if (last === today) return streak;
  if (last === yest)  streak += 1;
  else                streak  = 1;  // broken
  await updateDoc(ref, { streak, lastStudied: new Date().toISOString(), updatedAt: serverTimestamp() });
  return streak;
}

// ── Public Circle (live presence) ────────────────────────────
export function listenPublicCircle(cb) {
  return onSnapshot(collection(db, 'publicCircle'), snap => {
    cb(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
  });
}

export async function updatePublicPresence(uid, data) {
  await setDoc(doc(db, 'publicCircle', uid), { ...data, updatedAt: serverTimestamp() });
}

// ── Private Circle ────────────────────────────────────────────
export async function createCircle(creatorUid, name) {
  const code = `GRP-${name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ref  = doc(collection(db, 'circles'));
  await setDoc(ref, { name, members: [creatorUid], createdBy: creatorUid, code, createdAt: serverTimestamp() });
  return { id: ref.id, code };
}

export function listenCirclePresence(circleId, cb) {
  return onSnapshot(collection(db, 'circles', circleId, 'presence'), snap => {
    cb(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
  });
}
