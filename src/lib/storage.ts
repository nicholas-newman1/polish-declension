import { createEmptyCard } from 'ts-fsrs';
import type { Settings, ReviewDataStore, CardReviewData } from '../types';

const REVIEW_DATA_KEY = 'polish-declension-review-data';
const SETTINGS_KEY = 'polish-declension-settings';

const DEFAULT_SETTINGS: Settings = {
  newCardsPerDay: 10,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadReviewData(): ReviewDataStore {
  try {
    const data = localStorage.getItem(REVIEW_DATA_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const today = getTodayString();
      if (parsed.lastReviewDate !== today) {
        parsed.reviewedToday = [];
        parsed.newCardsToday = [];
        parsed.lastReviewDate = today;
      }
      Object.keys(parsed.cards).forEach((key) => {
        const card = parsed.cards[key];
        if (card.fsrsCard.due) {
          card.fsrsCard.due = new Date(card.fsrsCard.due);
        }
        if (card.fsrsCard.last_review) {
          card.fsrsCard.last_review = new Date(card.fsrsCard.last_review);
        }
      });
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load review data:', e);
  }
  return {
    cards: {},
    reviewedToday: [],
    newCardsToday: [],
    lastReviewDate: getTodayString(),
  };
}

export function saveReviewData(data: ReviewDataStore): void {
  try {
    localStorage.setItem(REVIEW_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save review data:', e);
  }
}

export function getOrCreateCardReviewData(
  cardId: number,
  store: ReviewDataStore
): CardReviewData {
  if (store.cards[cardId]) {
    return store.cards[cardId];
  }
  return {
    cardId,
    fsrsCard: createEmptyCard(),
  };
}

export function clearAllData(): void {
  localStorage.removeItem(REVIEW_DATA_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
