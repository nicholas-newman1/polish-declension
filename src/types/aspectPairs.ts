import type { Card as FSRSCard, ReviewLog } from 'ts-fsrs';
import type { Verb } from './conjugation';

export interface AspectPairCard {
  verb: Verb;
  pairVerb: Verb;
}

export interface AspectPairsCardReviewData {
  verbId: string;
  fsrsCard: FSRSCard;
  log?: ReviewLog;
}

export interface AspectPairsReviewDataStore {
  cards: Record<string, AspectPairsCardReviewData>;
  reviewedToday: string[];
  newCardsToday: string[];
  lastReviewDate: string;
}

export interface AspectPairsSettings {
  newCardsPerDay: number;
}

export const DEFAULT_ASPECT_PAIRS_SETTINGS: AspectPairsSettings = {
  newCardsPerDay: 5,
};
