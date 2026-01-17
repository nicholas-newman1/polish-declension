import type { Card, ReviewDataStore } from '../../types';
import getOrCreateCardReviewData from '../storage/getOrCreateCardReviewData';
import { includesCardId } from '../storage/helpers';
import isDue from '../fsrsUtils/isDue';
import sortByDueDate from '../fsrsUtils/sortByDueDate';
import type { Filters, SessionCard } from './types';
import matchesFilters from './matchesFilters';

export default function getPracticeAheadCards(
  allCards: Card[],
  reviewStore: ReviewDataStore,
  filters: Filters,
  count: number
): SessionCard[] {
  const customPracticeCards: SessionCard[] = [];
  const systemPracticeCards: SessionCard[] = [];

  for (const card of allCards) {
    if (!matchesFilters(card, filters)) continue;

    const reviewData = getOrCreateCardReviewData(card.id, reviewStore);
    const isNew = reviewData.fsrsCard.state === 0;

    if (isNew) continue;

    const isDueCard = isDue(reviewData.fsrsCard);
    const reviewedToday = includesCardId(reviewStore.reviewedToday, card.id);

    if (!isDueCard || reviewedToday) {
      const targetCards = card.isCustom
        ? customPracticeCards
        : systemPracticeCards;
      targetCards.push({ card, reviewData, isNew: false });
    }
  }

  customPracticeCards.sort(sortByDueDate);
  systemPracticeCards.sort(sortByDueDate);

  return [...customPracticeCards, ...systemPracticeCards].slice(0, count);
}
