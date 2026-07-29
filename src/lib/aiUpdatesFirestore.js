import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from './firebase';

// Server-side reader for the ai_updates feed.
//
// AIUpdatesList used to fetch this in a useEffect, so /ai-updates shipped an empty
// shell (~120 rendered words) to crawlers while being linked from both the header
// nav and the footer. Reading here lets the page pass the feed down as initial
// data, and the client keeps its own fetch only as a fallback.
//
// Mirrors tutorialsFirestore: retry without orderBy when the composite index is
// missing, and fail soft to an empty array rather than throwing during a build.

const AI_UPDATES_COLLECTION = 'ai_updates';

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Firestore Timestamps are class instances and cannot cross the server/client
// boundary, so dates are flattened to ISO strings here.
const normalizeUpdate = (snapshot) => {
  const data = snapshot.data() || {};
  const createdAtMs = toMillis(data.createdAt);
  return {
    ...data,
    id: snapshot.id,
    createdAt: createdAtMs ? new Date(createdAtMs).toISOString() : null,
    date: data.date || null,
  };
};

const sortUpdates = (items) =>
  [...items].sort((a, b) => toMillis(b.createdAt || b.date) - toMillis(a.createdAt || a.date));

export async function getAiUpdatesFromFirestore() {
  if (!db) return [];

  try {
    const updatesQuery = query(
      collection(db, AI_UPDATES_COLLECTION),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    );
    const snapshot = await getDocs(updatesQuery);
    return snapshot.docs.map(normalizeUpdate);
  } catch (err) {
    console.warn('Ordered AI updates query failed; retrying without orderBy.', err);

    try {
      const snapshot = await getDocs(
        query(collection(db, AI_UPDATES_COLLECTION), where('published', '==', true)),
      );
      return sortUpdates(snapshot.docs.map(normalizeUpdate));
    } catch (fallbackErr) {
      console.error('Error fetching AI updates from Firestore:', fallbackErr);
      return [];
    }
  }
}
