import { createEmptyCard } from 'ts-fsrs';
import type { ReviewDataStore, CardReviewData, CardId } from '../../types';

export default function getOrCreateCardReviewData(
  cardId: CardId,
  store: ReviewDataStore
): CardReviewData {
  if (store.cards[cardId]) {
    return store.cards[cardId];
  }
  return {
    cardId,
    fsrsCard: createEmptyCard(),
  };
}
