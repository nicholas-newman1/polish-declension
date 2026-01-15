import { Box, ButtonBase, Typography, styled } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AbcIcon from '@mui/icons-material/Abc';
import TranslateIcon from '@mui/icons-material/Translate';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import { useTranslationContext } from '../hooks/useTranslationContext';
import { useCheatSheetContext } from '../hooks/useCheatSheetContext';
import { alpha } from '../lib/theme';

const MenuBarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const MenuButton = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.hover,
  },
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  backgroundColor: isActive
    ? alpha(theme.palette.primary.main, 0.12)
    : theme.palette.grey[100],
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: isActive ? theme.palette.primary.main : 'inherit',
}));

const Label = styled(Typography)({
  fontSize: '0.65rem',
  fontWeight: 500,
});

interface BottomMenuBarProps {
  showTranslator?: boolean;
}

export function BottomMenuBar({ showTranslator = true }: BottomMenuBarProps) {
  const { openTranslator, showTranslator: isTranslatorOpen } =
    useTranslationContext();
  const { openSheet, activeSheet } = useCheatSheetContext();

  return (
    <MenuBarContainer>
      {showTranslator && (
        <MenuButton onClick={openTranslator} aria-label="Open translator">
          <IconWrapper isActive={isTranslatorOpen}>
            <TranslateIcon fontSize="small" />
          </IconWrapper>
          <Label>Translate</Label>
        </MenuButton>
      )}
      <MenuButton
        onClick={() => openSheet('declension')}
        aria-label="Open declension cheat sheet"
      >
        <IconWrapper isActive={activeSheet === 'declension'}>
          <MenuBookIcon fontSize="small" />
        </IconWrapper>
        <Label>Declensions</Label>
      </MenuButton>
      <MenuButton
        onClick={() => openSheet('consonants')}
        aria-label="Open consonants cheat sheet"
      >
        <IconWrapper isActive={activeSheet === 'consonants'}>
          <AbcIcon fontSize="small" />
        </IconWrapper>
        <Label>Consonants</Label>
      </MenuButton>
      <MenuButton
        onClick={() => openSheet('yi-rule')}
        aria-label="Open y/i rule cheat sheet"
      >
        <IconWrapper isActive={activeSheet === 'yi-rule'}>
          <SpellcheckIcon fontSize="small" />
        </IconWrapper>
        <Label>-y/-i Rule</Label>
      </MenuButton>
    </MenuBarContainer>
  );
}
