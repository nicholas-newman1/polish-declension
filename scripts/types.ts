export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface WordAnnotation {
  word: string;
  lemma: string;
  english: string;
  grammar?: string;
  notes?: string;
}

export interface Sentence {
  id: string;
  polish: string;
  english: string;
  level: CEFRLevel;
  tags: string[];
  words: WordAnnotation[];
}

export interface SentenceIndex {
  id: string;
  polish: string;
  level: CEFRLevel;
  tags: string[];
}

export const VALID_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type DeclensionCase =
  | 'Nominative'
  | 'Genitive'
  | 'Dative'
  | 'Accusative'
  | 'Instrumental'
  | 'Locative'
  | 'Vocative';

export type DeclensionGender = 'Masculine' | 'Feminine' | 'Neuter' | 'Pronoun';

export type DeclensionNumber = 'Singular' | 'Plural';

export interface DeclensionCard {
  id: number;
  front: string;
  back: string;
  declined: string;
  case: DeclensionCase;
  gender: DeclensionGender;
  number: DeclensionNumber;
  hint?: string;
}

export interface DeclensionCardIndex {
  id: number;
  front: string;
  case: DeclensionCase;
  gender: DeclensionGender;
  number: DeclensionNumber;
}

export const VALID_CASES: DeclensionCase[] = [
  'Nominative',
  'Genitive',
  'Dative',
  'Accusative',
  'Instrumental',
  'Locative',
  'Vocative',
];

export const VALID_GENDERS: DeclensionGender[] = [
  'Masculine',
  'Feminine',
  'Neuter',
  'Pronoun',
];

export const VALID_NUMBERS: DeclensionNumber[] = ['Singular', 'Plural'];

export function isValidCase(value: string): value is DeclensionCase {
  return VALID_CASES.includes(value as DeclensionCase);
}

export function isValidGender(value: string): value is DeclensionGender {
  return VALID_GENDERS.includes(value as DeclensionGender);
}

export function isValidNumber(value: string): value is DeclensionNumber {
  return VALID_NUMBERS.includes(value as DeclensionNumber);
}

export function validateDeclensionCard(
  card: unknown,
  index: number
): card is DeclensionCard {
  const c = card as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof c.id !== 'number') {
    errors.push('missing or invalid "id" (must be number)');
  }
  if (!c.front || typeof c.front !== 'string') {
    errors.push('missing or invalid "front"');
  }
  if (!c.back || typeof c.back !== 'string') {
    errors.push('missing or invalid "back"');
  }
  if (!c.declined || typeof c.declined !== 'string') {
    errors.push('missing or invalid "declined"');
  }
  if (!c.case || !isValidCase(c.case as string)) {
    errors.push(`invalid "case" (must be one of: ${VALID_CASES.join(', ')})`);
  }
  if (!c.gender || !isValidGender(c.gender as string)) {
    errors.push(
      `invalid "gender" (must be one of: ${VALID_GENDERS.join(', ')})`
    );
  }
  if (!c.number || !isValidNumber(c.number as string)) {
    errors.push(
      `invalid "number" (must be one of: ${VALID_NUMBERS.join(', ')})`
    );
  }
  if (c.hint !== undefined && typeof c.hint !== 'string') {
    errors.push('hint must be a string if provided');
  }

  if (errors.length > 0) {
    console.error(`❌ Card at index ${index} has errors:`);
    errors.forEach((e) => console.error(`   - ${e}`));
    return false;
  }

  return true;
}

export function isValidLevel(level: string): level is CEFRLevel {
  return VALID_LEVELS.includes(level as CEFRLevel);
}

export function validateSentence(
  sentence: unknown,
  index: number
): sentence is Sentence {
  const s = sentence as Record<string, unknown>;
  const errors: string[] = [];

  if (!s.id || typeof s.id !== 'string') {
    errors.push('missing or invalid "id"');
  }
  if (!s.polish || typeof s.polish !== 'string') {
    errors.push('missing or invalid "polish"');
  }
  if (!s.english || typeof s.english !== 'string') {
    errors.push('missing or invalid "english"');
  }
  if (!s.level || !isValidLevel(s.level as string)) {
    errors.push(`invalid "level" (must be one of: ${VALID_LEVELS.join(', ')})`);
  }
  if (!Array.isArray(s.tags)) {
    errors.push('missing or invalid "tags" (must be array)');
  }
  if (!Array.isArray(s.words)) {
    errors.push('missing or invalid "words" (must be array)');
  } else {
    (s.words as unknown[]).forEach((w, i) => {
      const word = w as Record<string, unknown>;
      if (!word.word || !word.lemma || !word.english) {
        errors.push(
          `words[${i}] missing required fields (word, lemma, english)`
        );
      }
    });
  }

  if (errors.length > 0) {
    console.error(`❌ Sentence at index ${index} has errors:`);
    errors.forEach((e) => console.error(`   - ${e}`));
    return false;
  }

  return true;
}
