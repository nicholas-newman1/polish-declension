import type { DeclensionCard, DeclensionReviewDataStore } from '../../types';
import getOrCreateDeclensionCardReviewData from '../storage/getOrCreateDeclensionCardReviewData';
import { includesDeclensionCardId } from '../storage/helpers';
import shuffleArray from '../utils/shuffleArray';
import type { DeclensionFilters, DeclensionSessionCard } from './types';
import matchesDeclensionFilters from './matchesFilters';

export default function getDeclensionExtraNewCards(
  allCards: DeclensionCard[],
  reviewStore: DeclensionReviewDataStore,
  filters: DeclensionFilters,
  count: number
): DeclensionSessionCard[] {
  const allCustomNewCards: DeclensionSessionCard[] = [];
  const allSystemNewCards: DeclensionSessionCard[] = [];

  for (const card of allCards) {
    if (!matchesDeclensionFilters(card, filters)) continue;

    const reviewData = getOrCreateDeclensionCardReviewData(card.id, reviewStore);
    const isNew = reviewData.fsrsCard.state === 0;

    if (isNew && !includesDeclensionCardId(reviewStore.newCardsToday, card.id)) {
      const targetCards = card.isCustom ? allCustomNewCards : allSystemNewCards;
      targetCards.push({ card, reviewData, isNew: true });
    }
  }

  const shuffledCustom = shuffleArray(allCustomNewCards);
  const shuffledSystem = shuffleArray(allSystemNewCards);
  return [...shuffledCustom, ...shuffledSystem].slice(0, count);
}
