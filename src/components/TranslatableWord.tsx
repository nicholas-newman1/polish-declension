import { useState, useCallback, useEffect, useRef } from 'react';
import { CircularProgress, Typography, IconButton, TextField, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '../lib/styled';
import {
  translate,
  RateLimitMinuteError,
  RateLimitDailyError,
} from '../lib/translate';
import {
  useTooltipInteraction,
  TappableSpan,
  HighlightedSpan,
  TooltipContent,
  WordTooltipPopper,
} from './shared';

const EditButton = styled(IconButton)(({ theme }) => ({
  padding: 2,
  color: theme.palette.tooltip.muted,
  '&:hover': {
    color: theme.palette.tooltip.text,
    backgroundColor: 'transparent',
  },
}));

const EditInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    color: theme.palette.tooltip.text,
    fontSize: '0.875rem',
    padding: 0,
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.5, 1),
    minWidth: 80,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.tooltip.muted,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.tooltip.text,
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.tooltip.accent,
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  padding: 2,
  color: theme.palette.tooltip.text,
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

export interface TranslatableWordProps {
  word: string;
  sentenceContext?: string;
  isHighlighted?: boolean;
  translations?: Record<string, string>;
  declensionCardId?: number;
  onDailyLimitReached?: (resetTime: string) => void;
  onUpdateTranslation?: (word: string, translation: string) => void;
  isAdmin?: boolean;
}

export function TranslatableWord({
  word,
  sentenceContext,
  isHighlighted,
  translations,
  declensionCardId,
  onDailyLimitReached,
  onUpdateTranslation,
  isAdmin = false,
}: TranslatableWordProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    anchorEl,
    popperRef,
    open,
    isClicked,
    setIsClicked,
    handleMouseEnter: baseHandleMouseEnter,
    handleMouseLeave,
  } = useTooltipInteraction({
    onClose: () => setIsEditing(false),
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const cleanWord = word.replace(/[.,!?;:"""''()]/g, '').toLowerCase();

  const fetchTranslation = useCallback(async () => {
    if (!cleanWord) return;

    const cachedTranslation = translations?.[cleanWord];
    if (cachedTranslation) {
      setTranslation(cachedTranslation);
      return;
    }

    if (translation || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await translate(
        cleanWord,
        'EN',
        sentenceContext,
        declensionCardId
      );
      setTranslation(result.translatedText);
    } catch (err) {
      if (err instanceof RateLimitMinuteError) {
        setError('Too many requests');
      } else if (err instanceof RateLimitDailyError) {
        setIsClicked(false);
        onDailyLimitReached?.(err.resetTime);
      } else {
        setError('Translation failed');
      }
    } finally {
      setLoading(false);
    }
  }, [
    cleanWord,
    sentenceContext,
    translations,
    declensionCardId,
    onDailyLimitReached,
    translation,
    loading,
    setIsClicked,
  ]);

  const handleStartEdit = () => {
    setEditValue(translation || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim() || editValue === translation) {
      handleCancelEdit();
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateTranslation?.(cleanWord, editValue.trim());
      setTranslation(editValue.trim());
      setIsEditing(false);
    } catch {
      setError('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      if (isClicked) {
        setIsClicked(false);
        setIsEditing(false);
      } else {
        setIsClicked(true);
        fetchTranslation();
      }
      // Need to set anchorEl manually since we're not using the base handleClick
      event.currentTarget && baseHandleMouseEnter(event);
    },
    [isClicked, setIsClicked, fetchTranslation, baseHandleMouseEnter]
  );

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      baseHandleMouseEnter(event);
      fetchTranslation();
    },
    [baseHandleMouseEnter, fetchTranslation]
  );

  const WordComponent = isHighlighted ? HighlightedSpan : TappableSpan;

  return (
    <>
      <WordComponent
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {word}
      </WordComponent>
      <WordTooltipPopper
        open={open}
        anchorEl={anchorEl}
        popperRef={popperRef}
        modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
      >
        <TooltipContent>
          {loading || isSaving ? (
            <CircularProgress size={16} sx={{ color: 'tooltip.text' }} />
          ) : error ? (
            <Typography variant="caption" sx={{ color: 'tooltip.error' }}>
              {error}
            </Typography>
          ) : isEditing ? (
            <EditInput
              size="small"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ActionIconButton size="small" onClick={handleSaveEdit}>
                      <CheckIcon sx={{ fontSize: 14 }} />
                    </ActionIconButton>
                    <ActionIconButton size="small" onClick={handleCancelEdit}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </ActionIconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <>
              <Typography variant="body2" fontWeight={500}>
                {translation}
              </Typography>
              {isAdmin && translation && (
                <EditButton size="small" onClick={handleStartEdit}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </EditButton>
              )}
            </>
          )}
        </TooltipContent>
      </WordTooltipPopper>
    </>
  );
}

