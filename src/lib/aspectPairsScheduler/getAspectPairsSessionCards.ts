import type {
  AspectPairCard,
  AspectPairsReviewDataStore,
  AspectPairsSettings,
} from '../../types/aspectPairs';
import getOrCreateAspectPairsCardReviewData from '../storage/getOrCreateAspectPairsCardReviewData';
import { includesVerbId } from '../storage/helpers';
import isDue from '../fsrsUtils/isDue';
import sortByDueDate from '../fsrsUtils/sortByDueDate';
import type { AspectPairsSessionCard } from './types';

export default function getAspectPairsSessionCards(
  aspectPairCards: AspectPairCard[],
  reviewStore: AspectPairsReviewDataStore,
  settings: AspectPairsSettings
): { reviewCards: AspectPairsSessionCard[]; newCards: AspectPairsSessionCard[] } {
  const reviewCards: AspectPairsSessionCard[] = [];
  const newCards: AspectPairsSessionCard[] = [];
  const remainingNewCardsToday = settings.newCardsPerDay - reviewStore.newCardsToday.length;

  for (const card of aspectPairCards) {
    const verbId = card.verb.id;
    const reviewData = getOrCreateAspectPairsCardReviewData(verbId, reviewStore);
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      if (
        !includesVerbId(reviewStore.newCardsToday, verbId) &&
        newCards.length < remainingNewCardsToday
      ) {
        newCards.push({ card, reviewData, isNew: true });
      }
    } else if (isLearning) {
      if (!includesVerbId(reviewStore.reviewedToday, verbId)) {
        reviewCards.push({ card, reviewData, isNew: false });
      }
    } else if (isDue(reviewData.fsrsCard)) {
      if (!includesVerbId(reviewStore.reviewedToday, verbId)) {
        reviewCards.push({ card, reviewData, isNew: false });
      }
    }
  }

  reviewCards.sort(sortByDueDate);

  return { reviewCards, newCards };
}
