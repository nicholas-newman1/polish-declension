export type ConsonantType = 'hard' | 'soft';

export interface ConsonantPair {
  hard: string;
  soft: string;
  hasHard: boolean;
}

export interface ConsonantWord {
  word: string;
  translation: string;
  consonantType: ConsonantType;
  consonant: string;
  gender: 'masculine' | 'feminine' | 'neuter';
  number: 'singular' | 'plural';
  /** For hard consonant words: the softened/declined form (e.g., kot → kocie) */
  softenedForm?: string;
  /** Translation/case label for the softened form (e.g., "cat (loc)") */
  softenedTranslation?: string;
  /** For soft consonant words: the base/nominative form (e.g., kocie → kot) */
  hardenedForm?: string;
  /** Translation for the hardened/base form (e.g., "cat") */
  hardenedTranslation?: string;
}

export interface ConsonantCard {
  type: 'consonant' | 'word';
  consonant?: string;
  word?: ConsonantWord;
  correctAnswer: ConsonantType;
  pair: ConsonantPair;
}

export type ConsonantDrillerMode = 'consonant' | 'word';
