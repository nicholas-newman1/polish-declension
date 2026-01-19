import { auth } from '../firebase';
import type { DeclensionReviewDataStore, DeclensionCardId } from '../../types';
import type {
  VocabularyReviewDataStore,
  VocabularyDirection,
  VocabularyWordId,
} from '../../types/vocabulary';
import type {
  SentenceReviewDataStore,
  SentenceDirection,
} from '../../types/sentences';

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function includesWordId(
  array: VocabularyWordId[],
  id: VocabularyWordId
): boolean {
  const idStr = String(id);
  return array.some((item) => String(item) === idStr);
}

export function includesDeclensionCardId(array: DeclensionCardId[], id: DeclensionCardId): boolean {
  const idStr = String(id);
  return array.some((item) => String(item) === idStr);
}

export function getUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function getDefaultDeclensionReviewStore(): DeclensionReviewDataStore {
  return {
    cards: {},
    reviewedToday: [],
    newCardsToday: [],
    lastReviewDate: getTodayString(),
  };
}

export function getDefaultVocabularyReviewStore(): VocabularyReviewDataStore {
  return {
    cards: {},
    reviewedToday: [],
    newCardsToday: [],
    lastReviewDate: getTodayString(),
  };
}

export function getVocabularyDocPath(direction: VocabularyDirection): string {
  return direction === 'pl-to-en'
    ? 'vocabularyReviewData-pl-en'
    : 'vocabularyReviewData-en-pl';
}

export function includesSentenceId(array: string[], id: string): boolean {
  return array.includes(id);
}

export function getDefaultSentenceReviewStore(): SentenceReviewDataStore {
  return {
    cards: {},
    reviewedToday: [],
    newCardsToday: [],
    lastReviewDate: getTodayString(),
  };
}

export function getSentenceDocPath(direction: SentenceDirection): string {
  return direction === 'pl-to-en'
    ? 'sentenceReviewData-pl-en'
    : 'sentenceReviewData-en-pl';
}

