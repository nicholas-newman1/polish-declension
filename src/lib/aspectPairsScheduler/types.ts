import type { AspectPairCard, AspectPairsCardReviewData } from '../../types/aspectPairs';

export interface AspectPairsSessionCard {
  card: AspectPairCard;
  reviewData: AspectPairsCardReviewData;
  isNew: boolean;
}
