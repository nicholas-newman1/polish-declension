import type { Card as FSRSCard, ReviewLog } from 'ts-fsrs';

export type Case =
  | 'Nominative'
  | 'Genitive'
  | 'Dative'
  | 'Accusative'
  | 'Instrumental'
  | 'Locative'
  | 'Vocative';

export type Gender = 'Masculine' | 'Feminine' | 'Neuter' | 'Pronoun';

export type Number = 'Singular' | 'Plural';

export interface Card {
  id: number;
  front: string;
  back: string;
  declined: string;
  case: Case;
  gender: Gender;
  number: Number;
  hint?: string;
}

export interface CardReviewData {
  cardId: number;
  fsrsCard: FSRSCard;
  log?: ReviewLog;
}

export interface Settings {
  newCardsPerDay: number;
}

export interface ReviewDataStore {
  cards: Record<number, CardReviewData>;
  reviewedToday: number[];
  newCardsToday: number[];
  lastReviewDate: string;
}
