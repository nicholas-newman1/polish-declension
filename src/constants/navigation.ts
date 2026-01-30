import { Abc, School, Translate, AutoStories } from '@mui/icons-material';
import type { ReviewCounts } from '../contexts/review';

type ColorKey = 'primary' | 'info' | 'success' | 'warning';

export interface FeatureNavItem {
  path: string;
  icon: typeof School;
  label: string;
  description: string;
  fullDescription: string;
  colorKey: ColorKey;
  statsKey: keyof ReviewCounts;
}

/**
 * Shared navigation items for features that appear in both
 * the sidebar navigation and dashboard cards.
 * Order here determines display order in both places.
 */
export const FEATURE_NAV_ITEMS: FeatureNavItem[] = [
  {
    path: '/vocabulary',
    icon: Abc,
    label: 'Vocabulary',
    description: 'Top 1000 Polish words',
    fullDescription: 'Learn the top 1000 most common Polish words with example sentences',
    colorKey: 'info',
    statsKey: 'vocabulary',
  },
  {
    path: '/declension',
    icon: School,
    label: 'Declension',
    description: 'Practice noun declensions',
    fullDescription: 'Practice noun and pronoun declensions with spaced repetition flashcards',
    colorKey: 'primary',
    statsKey: 'declension',
  },
  {
    path: '/conjugation',
    icon: AutoStories,
    label: 'Conjugation',
    description: 'Verb conjugations',
    fullDescription: 'Master Polish verb conjugations across all tenses and persons',
    colorKey: 'warning',
    statsKey: 'conjugation',
  },
  {
    path: '/sentences',
    icon: Translate,
    label: 'Sentences',
    description: 'Translate full sentences',
    fullDescription: 'Translate full sentences and practice with spaced repetition',
    colorKey: 'success',
    statsKey: 'sentences',
  },
];
