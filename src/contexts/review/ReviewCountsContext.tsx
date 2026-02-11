import { createContext, useMemo, type ReactNode, useContext } from 'react';
import type { DeclensionCard, DeclensionReviewDataStore, DeclensionSettings } from '../../types';
import type {
  VocabularyWord,
  VocabularyReviewDataStore,
  VocabularyDirectionSettings,
} from '../../types/vocabulary';
import type {
  Sentence,
  SentenceReviewDataStore,
  SentenceDirectionSettings,
} from '../../types/sentences';
import type {
  Verb,
  ConjugationReviewDataStore,
  ConjugationDirectionSettings,
} from '../../types/conjugation';
import type {
  AspectPairCard,
  AspectPairsReviewDataStore,
  AspectPairsSettings,
} from '../../types/aspectPairs';
import isDue from '../../lib/fsrsUtils/isDue';
import getOrCreateDeclensionCardReviewData from '../../lib/storage/getOrCreateDeclensionCardReviewData';
import getOrCreateVocabularyCardReviewData from '../../lib/storage/getOrCreateVocabularyCardReviewData';
import getOrCreateSentenceCardReviewData from '../../lib/storage/getOrCreateSentenceCardReviewData';
import getOrCreateConjugationFormReviewData from '../../lib/storage/getOrCreateConjugationFormReviewData';
import getOrCreateAspectPairsCardReviewData from '../../lib/storage/getOrCreateAspectPairsCardReviewData';
import {
  getUserId,
  includesDeclensionCardId,
  includesSentenceId,
  includesFormKey,
  includesVerbId,
} from '../../lib/storage/helpers';
import { getDrillableFormsForVerb } from '../../lib/conjugationUtils';
import { DeclensionContext } from './DeclensionContext';
import { VocabularyContext } from './VocabularyContext';
import { SentenceContext } from './SentenceContext';
import { ConjugationContext } from './ConjugationContext';
import { AspectPairsContext } from './AspectPairsContext';

export interface ReviewCounts {
  declension: number;
  vocabulary: number;
  sentences: number;
  conjugation: number;
  aspectPairs: number;
}

export interface ReviewCountsContextType {
  counts: ReviewCounts;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ReviewCountsContext = createContext<ReviewCountsContextType | null>(null);

function computeDeclensionDueCount(
  cards: DeclensionCard[],
  reviewStore: DeclensionReviewDataStore,
  settings: DeclensionSettings
): number {
  let dueReviews = 0;
  let newCards = 0;
  const remainingNewCardsToday = settings.newCardsPerDay - reviewStore.newCardsToday.length;

  for (const card of cards) {
    const reviewData = getOrCreateDeclensionCardReviewData(card.id, reviewStore);
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      if (
        !includesDeclensionCardId(reviewStore.newCardsToday, card.id) &&
        newCards < remainingNewCardsToday
      ) {
        newCards++;
      }
    } else if (isLearning) {
      if (!includesDeclensionCardId(reviewStore.reviewedToday, card.id)) {
        dueReviews++;
      }
    } else if (isDue(reviewData.fsrsCard)) {
      if (!includesDeclensionCardId(reviewStore.reviewedToday, card.id)) {
        dueReviews++;
      }
    }
  }

  return dueReviews + newCards;
}

function computeVocabularyDueCount(
  words: VocabularyWord[],
  reviewStore: VocabularyReviewDataStore,
  settings: VocabularyDirectionSettings
): number {
  let dueReviews = 0;
  let newCards = 0;
  const remainingNewCardsToday = settings.newCardsPerDay - reviewStore.newCardsToday.length;

  for (const word of words) {
    const reviewData = getOrCreateVocabularyCardReviewData(word.id, reviewStore);
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      const isAlreadyNew = reviewStore.newCardsToday.some((id) => String(id) === String(word.id));
      if (!isAlreadyNew && newCards < remainingNewCardsToday) {
        newCards++;
      }
    } else if (isLearning) {
      const isAlreadyReviewed = reviewStore.reviewedToday.some(
        (id) => String(id) === String(word.id)
      );
      if (!isAlreadyReviewed) {
        dueReviews++;
      }
    } else if (isDue(reviewData.fsrsCard)) {
      const isAlreadyReviewed = reviewStore.reviewedToday.some(
        (id) => String(id) === String(word.id)
      );
      if (!isAlreadyReviewed) {
        dueReviews++;
      }
    }
  }

  return dueReviews + newCards;
}

function computeSentenceDueCount(
  sentences: Sentence[],
  reviewStore: SentenceReviewDataStore,
  settings: SentenceDirectionSettings
): number {
  let dueReviews = 0;
  let newCards = 0;
  const remainingNewCardsToday = settings.newCardsPerDay - reviewStore.newCardsToday.length;

  const filteredSentences = sentences.filter((s) => settings.selectedLevels.includes(s.level));

  for (const sentence of filteredSentences) {
    const reviewData = getOrCreateSentenceCardReviewData(sentence.id, reviewStore);
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      if (
        !includesSentenceId(reviewStore.newCardsToday, sentence.id) &&
        newCards < remainingNewCardsToday
      ) {
        newCards++;
      }
    } else if (isLearning) {
      if (!includesSentenceId(reviewStore.reviewedToday, sentence.id)) {
        dueReviews++;
      }
    } else if (isDue(reviewData.fsrsCard)) {
      if (!includesSentenceId(reviewStore.reviewedToday, sentence.id)) {
        dueReviews++;
      }
    }
  }

  return dueReviews + newCards;
}

function computeConjugationDueCount(
  verbs: Verb[],
  reviewStore: ConjugationReviewDataStore,
  settings: ConjugationDirectionSettings
): number {
  let dueReviews = 0;
  let newForms = 0;
  const remainingNewFormsToday = settings.newCardsPerDay - reviewStore.newFormsToday.length;

  for (const verb of verbs) {
    const drillableForms = getDrillableFormsForVerb(verb);

    for (const form of drillableForms) {
      const reviewData = getOrCreateConjugationFormReviewData(form.fullFormKey, reviewStore);
      const state = reviewData.fsrsCard.state;
      const isNew = state === 0;
      const isLearning = state === 1 || state === 3;

      if (isNew) {
        if (
          !includesFormKey(reviewStore.newFormsToday, form.fullFormKey) &&
          newForms < remainingNewFormsToday
        ) {
          newForms++;
        }
      } else if (isLearning) {
        if (!includesFormKey(reviewStore.reviewedToday, form.fullFormKey)) {
          dueReviews++;
        }
      } else if (isDue(reviewData.fsrsCard)) {
        if (!includesFormKey(reviewStore.reviewedToday, form.fullFormKey)) {
          dueReviews++;
        }
      }
    }
  }

  return dueReviews + newForms;
}

function computeAspectPairsDueCount(
  aspectPairCards: AspectPairCard[],
  reviewStore: AspectPairsReviewDataStore,
  settings: AspectPairsSettings
): number {
  let dueReviews = 0;
  let newCards = 0;
  const remainingNewCardsToday = settings.newCardsPerDay - reviewStore.newCardsToday.length;

  for (const card of aspectPairCards) {
    const verbId = card.verb.id;
    const reviewData = getOrCreateAspectPairsCardReviewData(verbId, reviewStore);
    const state = reviewData.fsrsCard.state;
    const isNew = state === 0;
    const isLearning = state === 1 || state === 3;

    if (isNew) {
      if (!includesVerbId(reviewStore.newCardsToday, verbId) && newCards < remainingNewCardsToday) {
        newCards++;
      }
    } else if (isLearning) {
      if (!includesVerbId(reviewStore.reviewedToday, verbId)) {
        dueReviews++;
      }
    } else if (isDue(reviewData.fsrsCard)) {
      if (!includesVerbId(reviewStore.reviewedToday, verbId)) {
        dueReviews++;
      }
    }
  }

  return dueReviews + newCards;
}

interface ReviewCountsProviderProps {
  children: ReactNode;
  loading: boolean;
}

export function ReviewCountsProvider({ children, loading }: ReviewCountsProviderProps) {
  const declensionCtx = useContext(DeclensionContext);
  const vocabularyCtx = useContext(VocabularyContext);
  const sentenceCtx = useContext(SentenceContext);
  const conjugationCtx = useContext(ConjugationContext);
  const aspectPairsCtx = useContext(AspectPairsContext);

  const counts = useMemo<ReviewCounts>(() => {
    const userId = getUserId();
    if (
      !userId ||
      !declensionCtx ||
      !vocabularyCtx ||
      !sentenceCtx ||
      !conjugationCtx ||
      !aspectPairsCtx
    ) {
      return { declension: 0, vocabulary: 0, sentences: 0, conjugation: 0, aspectPairs: 0 };
    }

    const declensionCount = computeDeclensionDueCount(
      declensionCtx.declensionCards,
      declensionCtx.declensionReviewStore,
      declensionCtx.declensionSettings
    );

    const plToEnCount = computeVocabularyDueCount(
      vocabularyCtx.vocabularyWords,
      vocabularyCtx.vocabularyReviewStores['pl-to-en'],
      vocabularyCtx.vocabularySettings['pl-to-en']
    );
    const enToPlCount = computeVocabularyDueCount(
      vocabularyCtx.vocabularyWords,
      vocabularyCtx.vocabularyReviewStores['en-to-pl'],
      vocabularyCtx.vocabularySettings['en-to-pl']
    );

    const sentencePlToEnCount = computeSentenceDueCount(
      sentenceCtx.sentences,
      sentenceCtx.sentenceReviewStores['pl-to-en'],
      sentenceCtx.sentenceSettings['pl-to-en']
    );
    const sentenceEnToPlCount = computeSentenceDueCount(
      sentenceCtx.sentences,
      sentenceCtx.sentenceReviewStores['en-to-pl'],
      sentenceCtx.sentenceSettings['en-to-pl']
    );

    const conjugationPlToEnCount = computeConjugationDueCount(
      conjugationCtx.verbs,
      conjugationCtx.conjugationReviewStores['pl-to-en'],
      conjugationCtx.conjugationSettings['pl-to-en']
    );
    const conjugationEnToPlCount = computeConjugationDueCount(
      conjugationCtx.verbs,
      conjugationCtx.conjugationReviewStores['en-to-pl'],
      conjugationCtx.conjugationSettings['en-to-pl']
    );

    const aspectPairsCount = computeAspectPairsDueCount(
      aspectPairsCtx.aspectPairCards,
      aspectPairsCtx.aspectPairsReviewStore,
      aspectPairsCtx.aspectPairsSettings
    );

    return {
      declension: declensionCount,
      vocabulary: plToEnCount + enToPlCount,
      sentences: sentencePlToEnCount + sentenceEnToPlCount,
      conjugation: conjugationPlToEnCount + conjugationEnToPlCount,
      aspectPairs: aspectPairsCount,
    };
  }, [declensionCtx, vocabularyCtx, sentenceCtx, conjugationCtx, aspectPairsCtx]);

  return (
    <ReviewCountsContext.Provider value={{ counts, loading }}>
      {children}
    </ReviewCountsContext.Provider>
  );
}
