export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type TagCategory = 'topics' | 'grammar' | 'style';

export interface TagCategoryInfo {
  name: string;
  tags: string[];
}

export const TAG_CATEGORIES: Record<TagCategory, TagCategoryInfo> = {
  topics: {
    name: 'Topics',
    tags: [
      'basics',
      'introduction',
      'family',
      'food',
      'restaurant',
      'travel',
      'location',
      'shopping',
      'health',
      'business',
      'communication',
      'social',
      'learning',
      'time',
    ],
  },
  grammar: {
    name: 'Grammar',
    tags: [
      'past tense',
      'future',
      'conditional',
      'questions',
      'requests',
      'polite requests',
      'modal verbs',
      'obligation',
      'subjunctive',
      'subordinate clauses',
      'relative clauses',
      'comparative',
      'correlative',
      'impersonal',
      'concession',
      'temporal clauses',
      'sequence of events',
    ],
  },
  style: {
    name: 'Style',
    tags: [
      'formal',
      'criticism',
      'advice',
      'opinions',
      'predictions',
      'reflection',
      'preferences',
    ],
  },
};

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

export interface SentenceBank {
  sentences: Sentence[];
}

