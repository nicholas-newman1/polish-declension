import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AspectPairsReviewDataStore } from '../../types/aspectPairs';
import { getUserId } from './helpers';

export default async function saveAspectPairsReviewData(
  data: AspectPairsReviewDataStore
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'aspectPairsReviewData');
  const serializable = {
    ...data,
    cards: Object.fromEntries(
      Object.entries(data.cards).map(([key, card]) => [
        key,
        {
          ...card,
          fsrsCard: {
            ...card.fsrsCard,
            due:
              card.fsrsCard.due instanceof Date
                ? card.fsrsCard.due.toISOString()
                : card.fsrsCard.due,
            last_review:
              card.fsrsCard.last_review instanceof Date
                ? card.fsrsCard.last_review.toISOString()
                : card.fsrsCard.last_review,
          },
        },
      ])
    ),
  };
  await setDoc(docRef, serializable);
}
