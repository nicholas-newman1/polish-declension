import type { AspectPairsCardReviewData } from '../../types/aspectPairs';
import rateCard from '../fsrsUtils/rateCard';
import type { Grade } from 'ts-fsrs';

export default function rateAspectPairsCard(
  reviewData: AspectPairsCardReviewData,
  rating: Grade,
  now?: Date
): AspectPairsCardReviewData {
  return rateCard(reviewData, rating, now);
}
