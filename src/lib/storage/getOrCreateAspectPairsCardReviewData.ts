import { createEmptyCard } from 'ts-fsrs';
import type {
  AspectPairsReviewDataStore,
  AspectPairsCardReviewData,
} from '../../types/aspectPairs';

export default function getOrCreateAspectPairsCardReviewData(
  verbId: string,
  store: AspectPairsReviewDataStore
): AspectPairsCardReviewData {
  if (store.cards[verbId]) {
    return store.cards[verbId];
  }
  return {
    verbId,
    fsrsCard: createEmptyCard(),
  };
}
