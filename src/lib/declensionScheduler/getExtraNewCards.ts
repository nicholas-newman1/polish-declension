import type { Card, ReviewDataStore } from '../../types';
import getOrCreateCardReviewData from '../storage/getOrCreateCardReviewData';
import { includesCardId } from '../storage/helpers';
import type { Filters, SessionCard } from './types';
import matchesFilters from './matchesFilters';

export default function getExtraNewCards(
  allCards: Card[],
  reviewStore: ReviewDataStore,
  filters: Filters,
  count: number
): SessionCard[] {
  const customNewCards: SessionCard[] = [];
  const systemNewCards: SessionCard[] = [];

  for (const card of allCards) {
    if (!matchesFilters(card, filters)) continue;

    const reviewData = getOrCreateCardReviewData(card.id, reviewStore);
    const isNew = reviewData.fsrsCard.state === 0;

    if (isNew && !includesCardId(reviewStore.newCardsToday, card.id)) {
      const targetCards = card.isCustom ? customNewCards : systemNewCards;
      targetCards.push({ card, reviewData, isNew: true });
      if (customNewCards.length + systemNewCards.length >= count) break;
    }
  }

  return [...customNewCards, ...systemNewCards];
}
