import { ModeSelector } from './ModeSelector';
import type { DeckStats } from './ModeSelector';
import type { TranslationDirection } from '../types/conjugation';

interface ConjugationModeSelectorProps {
  stats: Record<TranslationDirection, DeckStats>;
  loading?: boolean;
  onSelectMode: (direction: TranslationDirection) => void;
}

export function ConjugationModeSelector({
  stats,
  loading,
  onSelectMode,
}: ConjugationModeSelectorProps) {
  return <ModeSelector stats={stats} loading={loading} onSelectMode={onSelectMode} />;
}
