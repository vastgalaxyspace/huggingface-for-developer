import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';

export const TUTORIALS_COLLECTION =
  process.env.NEXT_PUBLIC_TUTORIALS_COLLECTION || 'ai_tutorials';

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeTutorial = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    slug: data.slug || snapshot.id,
    href: data.href || `/ai-tutorials/${data.slug || snapshot.id}`,
    published: data.published !== false,
    order: Number.isFinite(data.order) ? data.order : 999,
    ...data,
  };
};

const sortTutorials = (items) =>
  [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return (toMillis(b.updatedAt || b.lastUpdated) - toMillis(a.updatedAt || a.lastUpdated))
      || (a.title || '').localeCompare(b.title || '');
  });

export async function getTutorialFromFirestore(tutorialId) {
  if (!db || !tutorialId) return null;

  try {
    const snapshot = await getDoc(doc(db, TUTORIALS_COLLECTION, tutorialId));
    return snapshot.exists() ? normalizeTutorial(snapshot) : null;
  } catch (err) {
    console.error(`Error fetching tutorial "${tutorialId}" from Firestore:`, err);
    return null;
  }
}

export async function getTutorialsFromFirestore({ publishedOnly = true } = {}) {
  if (!db) return [];

  try {
    const querySnapshot = await getDocs(query(collection(db, TUTORIALS_COLLECTION), orderBy('order', 'asc')));
    const tutorials = querySnapshot.docs.map(normalizeTutorial);
    return sortTutorials(publishedOnly ? tutorials.filter((tutorial) => tutorial.published) : tutorials);
  } catch (err) {
    console.warn('Ordered tutorial query failed; retrying without orderBy.', err);

    try {
      const querySnapshot = await getDocs(collection(db, TUTORIALS_COLLECTION));
      const tutorials = querySnapshot.docs.map(normalizeTutorial);
      return sortTutorials(publishedOnly ? tutorials.filter((tutorial) => tutorial.published) : tutorials);
    } catch (fallbackErr) {
      console.error('Error fetching tutorials from Firestore:', fallbackErr);
      return [];
    }
  }
}

