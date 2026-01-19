import type {
  Sentence,
  SentenceReviewDataStore,
  SentenceDirectionSettings,
} from '../../types/sentences';
import getOrCreateSentenceCardReviewData from '../storage/getOrCreateSentenceCardReviewData';
import { includesSentenceId } from '../storage/helpers';
import isDue from '../fsrsUtils/isDue';
import sortByDueDate from '../fsrsUtils/sortByDueDate';
import type { SentenceSessionCard } from './types';

export default function getSentenceSessionCards(
  allSentences: Sentence[],
  reviewStore: SentenceReviewDataStore,
  settings: SentenceDirectionSettings
): { reviewCards: SentenceSessionCard[]; newCards: SentenceSessionCard[] } {
  const reviewCards: SentenceSessionCard[] = [];
  const newCards: SentenceSessionCard[] = [];
  const remainingNewCardsToday =
    settings.newCardsPerDay - reviewStore.newCardsToday.length;

  for (const sentence of allSentences) {
    const reviewData = getOrCreateSentenceCardReviewData(
      sentence.id,
      reviewStore
    );
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      if (
        !includesSentenceId(reviewStore.newCardsToday, sentence.id) &&
        newCards.length < remainingNewCardsToday
      ) {
        newCards.push({ sentence, reviewData, isNew: true });
      }
    } else if (isLearning) {
      if (!includesSentenceId(reviewStore.reviewedToday, sentence.id)) {
        reviewCards.push({ sentence, reviewData, isNew: false });
      }
    } else if (isDue(reviewData.fsrsCard)) {
      if (!includesSentenceId(reviewStore.reviewedToday, sentence.id)) {
        reviewCards.push({ sentence, reviewData, isNew: false });
      }
    }
  }

  reviewCards.sort(sortByDueDate);

  return { reviewCards, newCards };
}

