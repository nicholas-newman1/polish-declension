import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '../../../lib/styled';
import { ModeSelector } from '../../../components/ModeSelector';
import type { CEFRLevel } from '../../../types/sentences';
import type { TranslationDirection } from '../../../types/common';
import { ALL_LEVELS } from '../../../types/sentences';
import type { TranslationDirectionStats } from '../../../hooks/useProgressStats';

interface SentenceModeSelectorProps {
  stats: Record<TranslationDirection, TranslationDirectionStats>;
  loading?: boolean;
  onSelectMode: (direction: TranslationDirection) => void;
}

const LevelStatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  width: '100%',
}));

const LevelRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const LevelLabel = styled(Typography)<{ $level: CEFRLevel }>(({ theme, $level }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  width: 24,
  color: theme.palette.levels[$level],
}));

const LevelProgress = styled(LinearProgress)<{ $level: CEFRLevel }>(({ theme, $level }) => ({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.action.hover,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.levels[$level],
    borderRadius: 3,
  },
}));

const LevelCount = styled(Typography)(({ theme }) => ({
  fontSize: '0.65rem',
  color: theme.palette.text.secondary,
  minWidth: 36,
  textAlign: 'right',
}));

// Adapter to convert TranslationDirectionStats to DeckStats format
function toModeStats(stats: Record<TranslationDirection, TranslationDirectionStats>) {
  return {
    'pl-to-en': {
      dueCount: stats['pl-to-en'].total.due,
      learnedCount: stats['pl-to-en'].total.learned,
      totalCount: stats['pl-to-en'].total.total,
    },
    'en-to-pl': {
      dueCount: stats['en-to-pl'].total.due,
      learnedCount: stats['en-to-pl'].total.learned,
      totalCount: stats['en-to-pl'].total.total,
    },
  };
}

export function SentenceModeSelector({ stats, loading, onSelectMode }: SentenceModeSelectorProps) {
  const renderLevelStats = (direction: TranslationDirection) => {
    const modeStats = stats[direction];
    return (
      <LevelStatsContainer>
        {ALL_LEVELS.map((level) => {
          const levelStats = modeStats.byLevel[level];
          const progress = levelStats.total > 0 ? (levelStats.learned / levelStats.total) * 100 : 0;
          return (
            <LevelRow key={level}>
              <LevelLabel $level={level}>{level}</LevelLabel>
              <LevelProgress variant="determinate" value={progress} $level={level} />
              <LevelCount>
                {levelStats.learned}/{levelStats.total}
              </LevelCount>
            </LevelRow>
          );
        })}
      </LevelStatsContainer>
    );
  };

  return (
    <ModeSelector
      stats={toModeStats(stats)}
      loading={loading}
      onSelectMode={onSelectMode}
      renderStats={(_, __, direction) => renderLevelStats(direction)}
    />
  );
}
