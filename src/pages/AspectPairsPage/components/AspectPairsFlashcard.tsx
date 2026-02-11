import { useState } from 'react';
import type { Grade } from 'ts-fsrs';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { styled } from '../../../lib/styled';
import { FlashcardShell } from '../../../components/FlashcardShell';
import type { RatingIntervals } from '../../../components/RatingButtons';
import type { AspectPairCard } from '../../../types/aspectPairs';
import { alpha } from '../../../lib/theme';

interface AspectPairsFlashcardProps {
  card: AspectPairCard;
  practiceMode?: boolean;
  intervals?: RatingIntervals;
  onRate?: (rating: Grade) => void;
  onNext?: () => void;
}

const HeaderLabels = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
}));

const DirectionLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const QuestionText = styled(Typography)({
  fontWeight: 400,
  lineHeight: 1.4,
});

const AnswerText = styled(Typography)({
  fontWeight: 500,
});

const AspectChip = styled(Chip)<{ $aspect: 'Imperfective' | 'Perfective' }>(
  ({ theme, $aspect }) => ({
    backgroundColor:
      $aspect === 'Imperfective'
        ? alpha(theme.palette.info.main, 0.15)
        : alpha(theme.palette.success.main, 0.15),
    color: $aspect === 'Imperfective' ? theme.palette.info.main : theme.palette.success.main,
    fontWeight: 500,
  })
);

const PairBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.text.primary, 0.03),
  borderRadius: theme.spacing(1),
  borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
}));

const EnglishMeaningText = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const BiaspectualNote = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontStyle: 'italic',
  color: theme.palette.warning.main,
  fontSize: '0.875rem',
}));

export function AspectPairsFlashcard({
  card,
  practiceMode = false,
  intervals,
  onRate,
  onNext,
}: AspectPairsFlashcardProps) {
  const [revealed, setRevealed] = useState(false);
  const [showPerfectiveFirst] = useState(() => Math.random() < 0.5);

  const isBiaspectual = card.verb.id === card.pairVerb.id;

  const frontVerb = showPerfectiveFirst ? card.pairVerb : card.verb;
  const backVerb = showPerfectiveFirst ? card.verb : card.pairVerb;

  const header = (
    <HeaderLabels>
      <DirectionLabel>Aspect Pairs</DirectionLabel>
    </HeaderLabels>
  );

  const question = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <QuestionText variant="h4" color="text.primary">
        {frontVerb.infinitive}
      </QuestionText>
    </Box>
  );

  const answer = (
    <>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AspectChip $aspect={frontVerb.aspect} label={frontVerb.aspect} size="small" />
      </Stack>

      {isBiaspectual ? (
        <>
          <AnswerText variant="h5" color="text.primary">
            {frontVerb.infinitive}
          </AnswerText>
          <BiaspectualNote>
            This verb is biaspectual — the same form is used for both perfective and imperfective.
          </BiaspectualNote>
        </>
      ) : (
        <PairBox>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {backVerb.aspect}:
          </Typography>
          <AnswerText variant="h5" color="text.primary">
            {backVerb.infinitive}
          </AnswerText>
        </PairBox>
      )}

      <EnglishMeaningText variant="body1">{frontVerb.infinitiveEn}</EnglishMeaningText>
    </>
  );

  return (
    <FlashcardShell
      revealed={revealed}
      practiceMode={practiceMode}
      intervals={intervals}
      accentColor="secondary"
      onReveal={() => setRevealed(true)}
      onRate={onRate}
      onNext={onNext}
      header={header}
      question={question}
      answer={answer}
    />
  );
}

export type { RatingIntervals };
