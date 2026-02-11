import type { AspectPairCard, AspectPairsReviewDataStore } from '../../types/aspectPairs';
import getOrCreateAspectPairsCardReviewData from '../storage/getOrCreateAspectPairsCardReviewData';
import { includesVerbId } from '../storage/helpers';
import type { AspectPairsSessionCard } from './types';

export default function getAspectPairsExtraNewCards(
  aspectPairCards: AspectPairCard[],
  reviewStore: AspectPairsReviewDataStore,
  count: number
): AspectPairsSessionCard[] {
  const newCards: AspectPairsSessionCard[] = [];

  for (const card of aspectPairCards) {
    const verbId = card.verb.id;
    const reviewData = getOrCreateAspectPairsCardReviewData(verbId, reviewStore);
    const isNew = reviewData.fsrsCard.state === 0;

    if (isNew && !includesVerbId(reviewStore.newCardsToday, verbId)) {
      newCards.push({ card, reviewData, isNew: true });
      if (newCards.length >= count) break;
    }
  }

  return newCards;
}
