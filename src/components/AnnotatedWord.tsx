import { Typography } from '@mui/material';
import type { WordAnnotation } from '../types/sentences';
import {
  useTooltipInteraction,
  TappableSpan,
  TooltipContentRich,
  WordTooltipPopper,
} from './shared';

interface AnnotatedWordProps {
  annotation: WordAnnotation;
  displayWord?: string;
  mode?: 'pl-to-en' | 'en-to-pl';
}

export function AnnotatedWord({
  annotation,
  displayWord,
  mode = 'pl-to-en',
}: AnnotatedWordProps) {
  const {
    anchorEl,
    popperRef,
    open,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
  } = useTooltipInteraction();

  const wordToDisplay = displayWord ?? annotation.word;
  const showLemma = annotation.lemma !== annotation.word.toLowerCase();

  return (
    <>
      <TappableSpan
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {wordToDisplay}
      </TappableSpan>
      <WordTooltipPopper open={open} anchorEl={anchorEl} popperRef={popperRef}>
        <TooltipContentRich>
          {mode === 'pl-to-en' ? (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                {annotation.english}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'tooltip.muted', display: 'block' }}
              >
                {showLemma && (
                  <span style={{ fontStyle: 'italic' }}>
                    {annotation.lemma}
                  </span>
                )}
                {showLemma && annotation.grammar && ' · '}
                {annotation.grammar}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                {annotation.word}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'tooltip.muted', display: 'block' }}
              >
                {showLemma && (
                  <span style={{ fontStyle: 'italic' }}>
                    {annotation.lemma}
                  </span>
                )}
                {showLemma && annotation.grammar && ' · '}
                {annotation.grammar}
              </Typography>
            </>
          )}
          {annotation.notes && (
            <Typography
              variant="caption"
              sx={{ color: 'tooltip.accent', display: 'block', mt: 0.5 }}
            >
              {annotation.notes}
            </Typography>
          )}
        </TooltipContentRich>
      </WordTooltipPopper>
    </>
  );
}
