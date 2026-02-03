import { useState } from 'react';
import type { Grade } from 'ts-fsrs';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { styled } from '../../../lib/styled';
import { FlashcardShell } from '../../../components/FlashcardShell';
import type { RatingIntervals } from '../../../components/RatingButtons';
import type { DrillableForm, TranslationDirection, Verb } from '../../../types/conjugation';
import {
  getQuestionDisplay,
  getAnswerDisplay,
  getTenseLabel,
  getAspectLabel,
  getVerbClassLabel,
} from '../../../lib/conjugationUtils';
import { alpha } from '../../../lib/theme';

export type ConjugationRatingIntervals = RatingIntervals;

interface ConjugationFlashcardProps {
  form: DrillableForm;
  direction: TranslationDirection;
  aspectPairVerb?: Verb;
  practiceMode?: boolean;
  intervals?: ConjugationRatingIntervals;
  onRate?: (rating: Grade) => void;
  onNext?: () => void;
}

const DirectionLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const HeaderLabels = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
}));

const QuestionText = styled(Typography)({
  fontWeight: 400,
  lineHeight: 1.4,
});

const AnswerText = styled(Typography)({
  fontWeight: 500,
});

const AlternativesText = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const InfinitiveLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginTop: theme.spacing(1),
}));

const MetaChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
}));

const TenseChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.warning.main, 0.15),
  color: theme.palette.warning.main,
  fontWeight: 500,
}));

const PluralChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.15),
  color: theme.palette.success.main,
  fontWeight: 500,
}));

const AspectChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.main, 0.15),
  color: theme.palette.info.main,
  fontWeight: 500,
}));

const GenderChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.15),
  color: theme.palette.primary.main,
}));

const IrregularChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.error.main, 0.15),
  color: theme.palette.error.main,
}));

const AspectPairBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.text.primary, 0.03),
  borderRadius: theme.spacing(1),
  borderLeft: `3px solid ${alpha(theme.palette.info.main, 0.5)}`,
}));

export function ConjugationFlashcard({
  form,
  direction,
  aspectPairVerb,
  practiceMode = false,
  intervals,
  onRate,
  onNext,
}: ConjugationFlashcardProps) {
  const [revealed, setRevealed] = useState(false);

  const isPolishToEnglish = direction === 'pl-to-en';
  const directionLabel = isPolishToEnglish ? 'Polish → English' : 'English → Polish';

  const questionDisplay = getQuestionDisplay(form, direction);
  const answerData = getAnswerDisplay(form, direction);

  const aspectPairForm = aspectPairVerb
    ? getCorrespondingAspectPairForm(form, aspectPairVerb)
    : null;

  const header = (
    <HeaderLabels>
      <DirectionLabel>{directionLabel}</DirectionLabel>
    </HeaderLabels>
  );

  const question = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {!isPolishToEnglish && (
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <TenseChip label={getTenseLabel(form.tense)} size="small" />
          {form.person === '2nd' && form.number === 'Plural' && (
            <PluralChip label="Plural" size="small" />
          )}
          {form.gender && <GenderChip label={form.gender} size="small" />}
        </Stack>
      )}

      <QuestionText variant="h4" color="text.primary">
        {questionDisplay}
      </QuestionText>

      {isPolishToEnglish && <InfinitiveLabel>{form.verb.infinitive}</InfinitiveLabel>}
    </Box>
  );

  const answer = (
    <>
      <AnswerText variant="h4" color="text.primary">
        {answerData.primary}
      </AnswerText>
      {answerData.alternatives && answerData.alternatives.length > 0 && (
        <AlternativesText>Also: {answerData.alternatives.join(', ')}</AlternativesText>
      )}

      {!isPolishToEnglish && <InfinitiveLabel>{form.verb.infinitive}</InfinitiveLabel>}

      <Stack direction="row" spacing={0.75} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.5 }}>
        <AspectChip label={getAspectLabel(form.verb.aspect)} size="small" />
        <IrregularChip label={getVerbClassLabel(form.verb.verbClass)} size="small" />
        {form.verb.isReflexive && <MetaChip label="Reflexive" size="small" />}
      </Stack>

      {aspectPairForm && aspectPairVerb && (
        <AspectPairBox>
          <Typography variant="body2" color="text.secondary">
            {aspectPairVerb.aspect}: <strong>{aspectPairForm}</strong>
          </Typography>
        </AspectPairBox>
      )}
    </>
  );

  return (
    <FlashcardShell
      revealed={revealed}
      practiceMode={practiceMode}
      intervals={intervals}
      accentColor="warning"
      onReveal={() => setRevealed(true)}
      onRate={onRate}
      onNext={onNext}
      header={header}
      question={question}
      answer={answer}
    />
  );
}

function getCorrespondingAspectPairForm(form: DrillableForm, aspectPairVerb: Verb): string | null {
  const { tense, formKey } = form;

  if (tense === 'present') {
    if (aspectPairVerb.aspect === 'Perfective' && aspectPairVerb.conjugations.future) {
      const futureForm =
        aspectPairVerb.conjugations.future[
          formKey as keyof typeof aspectPairVerb.conjugations.future
        ];
      return futureForm?.pl ?? null;
    }
  }

  if (tense === 'future') {
    if (aspectPairVerb.aspect === 'Imperfective' && aspectPairVerb.conjugations.present) {
      const presentForm =
        aspectPairVerb.conjugations.present[
          formKey as keyof typeof aspectPairVerb.conjugations.present
        ];
      return presentForm?.pl ?? null;
    } else if (aspectPairVerb.conjugations.future) {
      const futureForm =
        aspectPairVerb.conjugations.future[
          formKey as keyof typeof aspectPairVerb.conjugations.future
        ];
      return futureForm?.pl ?? null;
    }
  }

  const tenseConjugations = aspectPairVerb.conjugations[tense];
  if (tenseConjugations) {
    const correspondingForm = tenseConjugations[formKey as keyof typeof tenseConjugations];
    if (correspondingForm && typeof correspondingForm === 'object' && 'pl' in correspondingForm) {
      return (correspondingForm as { pl: string }).pl;
    }
  }

  return null;
}
