"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const profileFromUser = (user, profile = null) => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: profile?.displayName || user.displayName || '',
    photoURL: profile?.photoURL || user.photoURL || '',
    providerId: user.providerData?.[0]?.providerId || 'password',
    createdAt: profile?.createdAt || null,
    updatedAt: profile?.updatedAt || null,
  };
};

const upsertUserProfile = async (user, extra = {}) => {
  if (!db || !user) return null;

  const profileRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(profileRef);
  const existing = snapshot.exists() ? snapshot.data() : {};
  const profile = {
    uid: user.uid,
    email: user.email || '',
    displayName: extra.displayName || user.displayName || existing.displayName || '',
    photoURL: user.photoURL || existing.photoURL || '',
    providerId: user.providerData?.[0]?.providerId || existing.providerId || 'password',
    updatedAt: serverTimestamp(),
    ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  await setDoc(profileRef, profile, { merge: true });
  return { ...existing, ...profile };
};

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthError('');

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const savedProfile = await upsertUserProfile(currentUser);
        setProfile(profileFromUser(currentUser, savedProfile));
      } catch (err) {
        console.error('Error loading user profile:', err);
        setProfile(profileFromUser(currentUser));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const registerWithEmail = useCallback(async ({ name, email, password }) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');

    setAuthError('');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    const savedProfile = await upsertUserProfile(credential.user, { displayName: name });
    setUser(credential.user);
    setProfile(profileFromUser(credential.user, savedProfile));
    return credential.user;
  }, []);

  const signInWithEmail = useCallback(async ({ email, password }) => {
    if (!auth) throw new Error('Firebase Auth is not configured.');

    setAuthError('');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const savedProfile = await upsertUserProfile(credential.user);
    setUser(credential.user);
    setProfile(profileFromUser(credential.user, savedProfile));
    return credential.user;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase Auth is not configured.');

    setAuthError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const savedProfile = await upsertUserProfile(credential.user);
    setUser(credential.user);
    setProfile(profileFromUser(credential.user, savedProfile));
    return credential.user;
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  return useMemo(
    () => ({
      user,
      profile,
      loading,
      authError,
      setAuthError,
      registerWithEmail,
      signInWithEmail,
      signInWithGoogle,
      logout,
    }),
    [authError, loading, logout, profile, registerWithEmail, signInWithEmail, signInWithGoogle, user]
  );
}
