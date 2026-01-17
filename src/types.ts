import type { Card as FSRSCard, ReviewLog } from 'ts-fsrs';
import type { CustomItemBase } from './types/customItems';

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

export type CardId = number | string;

export interface Card {
  id: CardId;
  front: string;
  back: string;
  declined: string;
  case: Case;
  gender: Gender;
  number: Number;
  hint?: string;
  isCustom?: boolean;
}

export interface CustomDeclensionCard extends CustomItemBase {
  front: string;
  back: string;
  declined: string;
  case: Case;
  gender: Gender;
  number: Number;
  hint?: string;
}

export interface CardReviewData {
  cardId: CardId;
  fsrsCard: FSRSCard;
  log?: ReviewLog;
}

export interface Settings {
  newCardsPerDay: number;
}

export interface ReviewDataStore {
  cards: Record<CardId, CardReviewData>;
  reviewedToday: CardId[];
  newCardsToday: CardId[];
  lastReviewDate: string;
}
