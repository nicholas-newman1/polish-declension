import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AspectPairsReviewDataStore } from '../../types/aspectPairs';
import { getUserId, getTodayString, getDefaultAspectPairsReviewStore } from './helpers';

export default async function loadAspectPairsReviewData(): Promise<AspectPairsReviewDataStore> {
  const userId = getUserId();
  if (!userId) return getDefaultAspectPairsReviewStore();

  try {
    const docRef = doc(db, 'users', userId, 'data', 'aspectPairsReviewData');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const parsed = docSnap.data() as AspectPairsReviewDataStore;
      const today = getTodayString();
      if (parsed.lastReviewDate !== today) {
        parsed.reviewedToday = [];
        parsed.newCardsToday = [];
        parsed.lastReviewDate = today;
      }
      Object.keys(parsed.cards).forEach((key) => {
        const card = parsed.cards[key];
        if (!card?.fsrsCard) return;
        if (card.fsrsCard.due) {
          card.fsrsCard.due = new Date(card.fsrsCard.due);
        }
        if (card.fsrsCard.last_review) {
          card.fsrsCard.last_review = new Date(card.fsrsCard.last_review);
        }
      });
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load aspect pairs review data:', e);
  }
  return getDefaultAspectPairsReviewStore();
}
