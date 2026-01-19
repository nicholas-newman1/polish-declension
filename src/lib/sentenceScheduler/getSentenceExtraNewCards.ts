import type { Sentence, SentenceReviewDataStore } from '../../types/sentences';
import getOrCreateSentenceCardReviewData from '../storage/getOrCreateSentenceCardReviewData';
import { includesSentenceId } from '../storage/helpers';
import type { SentenceSessionCard } from './types';

export default function getSentenceExtraNewCards(
  allSentences: Sentence[],
  reviewStore: SentenceReviewDataStore,
  count: number
): SentenceSessionCard[] {
  const newCards: SentenceSessionCard[] = [];

  for (const sentence of allSentences) {
    const reviewData = getOrCreateSentenceCardReviewData(
      sentence.id,
      reviewStore
    );
    const isNew = reviewData.fsrsCard.state === 0;

    if (isNew && !includesSentenceId(reviewStore.newCardsToday, sentence.id)) {
      newCards.push({ sentence, reviewData, isNew: true });
      if (newCards.length >= count) break;
    }
  }

  return newCards;
}

