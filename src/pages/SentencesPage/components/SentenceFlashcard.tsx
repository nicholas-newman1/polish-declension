import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Grade } from 'ts-fsrs';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';
import { styled } from '../../../lib/styled';
import { FlashcardShell } from '../../../components/FlashcardShell';
import type { RatingIntervals } from '../../../components/RatingButtons';
import { renderTappableText } from '../../../lib/renderTappableText';
import type { Sentence, CEFRLevel } from '../../../types/sentences';
import type { TranslationDirection } from '../../../types/common';

interface SentenceFlashcardProps {
  sentence: Sentence;
  direction: TranslationDirection;
  practiceMode?: boolean;
  intervals?: RatingIntervals;
  canEdit?: boolean;
  isAdmin?: boolean;
  onRate?: (rating: Grade) => void;
  onNext?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDailyLimitReached?: (resetTime: string) => void;
  onUpdateTranslation?: (word: string, translation: string) => void;
}

const DirectionLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const LevelChip = styled(Chip)<{ $level: CEFRLevel }>(({ theme, $level }) => ({
  backgroundColor: theme.palette.levels[$level],
  color: theme.palette.common.white,
  fontWeight: 600,
  fontSize: '0.7rem',
  height: 22,
}));

const TagChip = styled(Chip)(({ theme }) => ({
  height: 22,
  fontSize: '0.7rem',
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
}));

const SentenceText = styled(Box)(({ theme }) => ({
  fontSize: '1.35rem',
  lineHeight: 1.6,
  fontWeight: 400,
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.15rem',
  },
}));

const AnswerTextBox = styled(Box)(({ theme }) => ({
  fontSize: '1.25rem',
  lineHeight: 1.5,
  fontWeight: 500,
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
  },
}));

export function SentenceFlashcard({
  sentence,
  direction,
  practiceMode = false,
  intervals,
  canEdit = false,
  isAdmin = false,
  onRate,
  onNext,
  onEdit,
  onDelete,
  onDailyLimitReached,
  onUpdateTranslation,
}: SentenceFlashcardProps) {
  const [revealed, setRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoPlayedRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const playAudio = useCallback(() => {
    if (!sentence.audioUrl) return;

    stopAudio();

    const audio = new Audio(sentence.audioUrl);
    audioRef.current = audio;
    setIsPlaying(true);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, [sentence.audioUrl, stopAudio]);

  const toggleAudio = useCallback(() => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, stopAudio, playAudio]);

  // Reset auto-play flag and stop audio when card changes
  useEffect(() => {
    hasAutoPlayedRef.current = false;
    return () => stopAudio();
  }, [sentence.id, stopAudio]);

  const isPolishToEnglish = direction === 'pl-to-en';

  // Auto-play audio when card opens (for pl-to-en) or when revealed (for en-to-pl)
  useEffect(() => {
    if (!sentence.audioUrl || hasAutoPlayedRef.current) return;

    if (isPolishToEnglish) {
      // Polish is the question - play immediately when card opens
      hasAutoPlayedRef.current = true;
      queueMicrotask(playAudio);
    }
  }, [sentence.id, isPolishToEnglish, sentence.audioUrl, playAudio]);

  useEffect(() => {
    if (!sentence.audioUrl || hasAutoPlayedRef.current) return;

    if (!isPolishToEnglish && revealed) {
      // Polish is the answer - play when revealed
      hasAutoPlayedRef.current = true;
      queueMicrotask(playAudio);
    }
  }, [revealed, isPolishToEnglish, sentence.audioUrl, playAudio]);
  const directionLabel = isPolishToEnglish ? 'Polish → English' : 'English → Polish';

  const tappableTextOptions = useMemo(
    () => ({
      translations: sentence.translations,
      sentenceId: sentence.id,
      onDailyLimitReached,
      onUpdateTranslation,
      sentenceContext: sentence.polish,
      isAdmin,
    }),
    [
      sentence.translations,
      sentence.id,
      sentence.polish,
      onDailyLimitReached,
      onUpdateTranslation,
      isAdmin,
    ]
  );

  const questionContent = isPolishToEnglish
    ? renderTappableText(sentence.polish, tappableTextOptions)
    : sentence.english;

  const answerContent = isPolishToEnglish
    ? sentence.english
    : renderTappableText(sentence.polish, tappableTextOptions);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this sentence?')) {
      onDelete?.();
    }
  };

  const header = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1.5,
      }}
    >
      <DirectionLabel>{directionLabel}</DirectionLabel>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LevelChip $level={sentence.level} label={sentence.level} />
        {sentence.audioUrl && (
          <IconButton
            onClick={toggleAudio}
            size="small"
            sx={{
              color: isPlaying ? 'error.main' : 'text.secondary',
              p: 0.5,
            }}
            aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
          >
            <VolumeUp fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  const question = <SentenceText sx={{ mb: 2 }}>{questionContent}</SentenceText>;

  const answer = (
    <>
      <AnswerTextBox sx={{ mb: 2 }}>{answerContent}</AnswerTextBox>

      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {sentence.tags.map((tag) => (
          <TagChip key={tag} label={tag} size="small" />
        ))}
      </Stack>
    </>
  );

  return (
    <FlashcardShell
      revealed={revealed}
      practiceMode={practiceMode}
      intervals={intervals}
      accentColor="primary"
      maxWidth={520}
      canEdit={canEdit}
      onReveal={() => setRevealed(true)}
      onRate={onRate}
      onNext={onNext}
      onEdit={onEdit}
      onDelete={handleDelete}
      header={header}
      question={question}
      answer={answer}
    />
  );
}

// Re-export RatingIntervals for backwards compatibility
export type { RatingIntervals };
