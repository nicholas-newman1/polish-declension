import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '../lib/styled';
import { useBackClose } from '../hooks/useBackClose';
import type { Sentence, CEFRLevel, WordAnnotation } from '../types/sentences';
import { ALL_LEVELS, TAG_CATEGORIES } from '../types/sentences';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 600,
    margin: theme.spacing(2),
    maxHeight: '90vh',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Content = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const Actions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  justifyContent: 'space-between',
}));

const RightActions = styled(Box)({
  display: 'flex',
  gap: 8,
});

const WordCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const WordHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ALL_TAGS = [
  ...TAG_CATEGORIES.topics.tags,
  ...TAG_CATEGORIES.grammar.tags,
  ...TAG_CATEGORIES.style.tags,
];

interface FormData {
  polish: string;
  english: string;
  level: CEFRLevel;
  tags: string[];
  words: WordAnnotation[];
}

interface EditSentenceModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Sentence, 'id'>) => void;
  sentence: Sentence | null;
}

const getDefaultValues = (sentence: Sentence | null): FormData => ({
  polish: sentence?.polish || '',
  english: sentence?.english || '',
  level: sentence?.level || 'A1',
  tags: sentence?.tags || [],
  words: sentence?.words || [],
});

export function EditSentenceModal({
  open,
  onClose,
  onSave,
  sentence,
}: EditSentenceModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    values: getDefaultValues(sentence),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'words',
  });

  const handleClose = () => {
    reset(getDefaultValues(null));
    onClose();
  };

  useBackClose(open, handleClose);

  const onSubmit = (data: FormData) => {
    const cleanedWords = data.words.map((w) => {
      const word: WordAnnotation = {
        word: w.word.trim(),
        lemma: w.lemma.trim(),
        english: w.english.trim(),
      };
      if (w.grammar?.trim()) {
        word.grammar = w.grammar.trim();
      }
      if (w.notes?.trim()) {
        word.notes = w.notes.trim();
      }
      return word;
    });

    onSave({
      polish: data.polish.trim(),
      english: data.english.trim(),
      level: data.level,
      tags: data.tags,
      words: cleanedWords,
    });
    handleClose();
  };

  const handleAddWord = () => {
    append({ word: '', lemma: '', english: '', grammar: '', notes: '' });
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <Header>
        <DialogTitle sx={{ p: 0, fontWeight: 500 }}>Edit Sentence</DialogTitle>
        <IconButton onClick={handleClose} size="small" aria-label="close">
          <CloseIcon />
        </IconButton>
      </Header>
      <Content>
        <Controller
          name="polish"
          control={control}
          rules={{ required: true, validate: (v) => v.trim().length > 0 }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Polish"
              fullWidth
              autoFocus
              required
              multiline
              rows={2}
            />
          )}
        />

        <Controller
          name="english"
          control={control}
          rules={{ required: true, validate: (v) => v.trim().length > 0 }}
          render={({ field }) => (
            <TextField
              {...field}
              label="English"
              fullWidth
              required
              multiline
              rows={2}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="level"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl fullWidth required>
                <InputLabel>Level</InputLabel>
                <Select {...field} label="Level">
                  {ALL_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Tags</InputLabel>
                <Select
                  {...field}
                  label="Tags"
                  multiple
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {ALL_TAGS.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight={500}>
            Word Annotations
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={handleAddWord}>
            Add Word
          </Button>
        </Box>

        {fields.map((field, index) => (
          <WordCard key={field.id}>
            <WordHeader>
              <Typography variant="body2" color="text.secondary">
                Word {index + 1}
              </Typography>
              <IconButton
                size="small"
                onClick={() => remove(index)}
                aria-label="remove word"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </WordHeader>

            <Stack direction="row" spacing={1}>
              <Controller
                name={`words.${index}.word`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Word"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />
              <Controller
                name={`words.${index}.lemma`}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lemma"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />
            </Stack>

            <Controller
              name={`words.${index}.english`}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="English"
                  size="small"
                  fullWidth
                  required
                />
              )}
            />

            <Stack direction="row" spacing={1}>
              <Controller
                name={`words.${index}.grammar`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Grammar (optional)"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name={`words.${index}.notes`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes (optional)"
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Stack>
          </WordCard>
        ))}
      </Content>
      <Actions>
        <Box />
        <RightActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={!isValid}
          >
            Save Changes
          </Button>
        </RightActions>
      </Actions>
    </StyledDialog>
  );
}
