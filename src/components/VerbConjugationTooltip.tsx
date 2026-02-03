import { Box, Typography } from '@mui/material';
import { styled } from '../lib/styled';
import { alpha } from '../lib/theme';
import type { Verb, Tense, ConjugationForm } from '../types/conjugation';
import {
  PRESENT_FORM_KEYS,
  PAST_FORM_KEYS,
  FUTURE_FORM_KEYS,
  IMPERATIVE_FORM_KEYS,
  CONDITIONAL_FORM_KEYS,
} from '../types/conjugation';
import { useTooltipInteraction, TooltipContentRich, WordTooltipPopper } from './shared';

const VerbSpan = styled('span')(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: 4,
  padding: '2px 4px',
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const TooltipContainer = styled(Box)(({ theme }) => ({
  minWidth: 200,
  maxWidth: 300,
  maxHeight: '60vh',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.tooltip.text, 0.2),
    borderRadius: 3,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${alpha(theme.palette.tooltip.text, 0.15)}`,
}));

const InfinitiveText = styled(Typography)({
  fontWeight: 600,
  fontSize: '1rem',
});

const ConjugationGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '4px 16px',
});

const FormRow = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
});

const PronounLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: alpha(theme.palette.tooltip.text, 0.5),
  minWidth: 44,
  fontFamily: '"JetBrains Mono", monospace',
}));

const FormText = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
});

const PERSON_LABELS: Record<string, string> = {
  '1sg': 'ja',
  '2sg': 'ty',
  '3sg': 'on/ona',
  '1pl': 'my',
  '2pl': 'wy',
  '3pl': 'oni',
  '1sg_m': 'ja (m)',
  '1sg_f': 'ja (f)',
  '2sg_m': 'ty (m)',
  '2sg_f': 'ty (f)',
  '3sg_m': 'on',
  '3sg_f': 'ona',
  '3sg_n': 'ono',
  '1pl_m': 'my (m)',
  '1pl_f': 'my (f)',
  '2pl_m': 'wy (m)',
  '2pl_f': 'wy (f)',
  '3pl_m': 'oni',
  '3pl_f': 'one',
};

function getFormKeysForTense(tense: Tense): string[] {
  switch (tense) {
    case 'present':
      return PRESENT_FORM_KEYS;
    case 'past':
      return PAST_FORM_KEYS;
    case 'future':
      return FUTURE_FORM_KEYS;
    case 'imperative':
      return IMPERATIVE_FORM_KEYS;
    case 'conditional':
      return CONDITIONAL_FORM_KEYS;
    default:
      return [];
  }
}

interface TenseConjugationsProps {
  tense: Tense;
  conjugations: Record<string, ConjugationForm>;
}

function TenseConjugations({ tense, conjugations }: TenseConjugationsProps) {
  const formKeys = getFormKeysForTense(tense);
  const availableForms = formKeys.filter((key) => conjugations[key]);

  if (availableForms.length === 0) return null;

  const displayKeys =
    tense === 'past' || tense === 'conditional'
      ? availableForms.filter((key) => key.endsWith('_m') || key === '3sg_n')
      : availableForms;

  return (
    <ConjugationGrid>
      {displayKeys.map((formKey) => {
        const form = conjugations[formKey];
        if (!form) return null;
        return (
          <FormRow key={formKey}>
            <PronounLabel>{PERSON_LABELS[formKey] || formKey}</PronounLabel>
            <FormText>{form.pl}</FormText>
          </FormRow>
        );
      })}
    </ConjugationGrid>
  );
}

interface VerbConjugationTooltipProps {
  verb: Verb;
  tense: Tense;
  children?: React.ReactNode;
}

export function VerbConjugationTooltip({ verb, tense, children }: VerbConjugationTooltipProps) {
  const { anchorEl, popperRef, open, handleMouseEnter, handleMouseLeave, handleClick } =
    useTooltipInteraction();

  const conjugations = verb.conjugations[tense];

  return (
    <>
      <VerbSpan
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || verb.infinitive}
      </VerbSpan>
      <WordTooltipPopper open={open} anchorEl={anchorEl} popperRef={popperRef}>
        <TooltipContentRich>
          <TooltipContainer>
            <Header>
              <InfinitiveText>{verb.infinitive}</InfinitiveText>
              <Typography variant="caption" sx={{ color: 'tooltip.muted' }}>
                {verb.infinitiveEn}
              </Typography>
            </Header>

            {conjugations && (
              <TenseConjugations
                tense={tense}
                conjugations={conjugations as Record<string, ConjugationForm>}
              />
            )}
          </TooltipContainer>
        </TooltipContentRich>
      </WordTooltipPopper>
    </>
  );
}
