import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const progressDocRef = (userId, tutorialId) => {
  if (!db || !userId || !tutorialId) return null;
  return doc(db, 'users', userId, 'tutorialProgress', tutorialId);
};

export async function getTutorialProgress(userId, tutorialId) {
  const ref = progressDocRef(userId, tutorialId);
  if (!ref) return null;

  try {
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (err) {
    console.error('Error loading tutorial progress:', err);
    return null;
  }
}

export async function saveTutorialProgress(userId, tutorialId, payload) {
  const ref = progressDocRef(userId, tutorialId);
  if (!ref) return null;

  const data = {
    ...Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, data, { merge: true });
  return data;
}
