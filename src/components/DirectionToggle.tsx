import { Button, styled } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export type TranslationDirection = 'en-to-pl' | 'pl-to-en';

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  gap: theme.spacing(1),
}));

interface DirectionToggleProps {
  direction: TranslationDirection;
  onToggle: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function DirectionToggle({
  direction,
  onToggle,
  size = 'small',
}: DirectionToggleProps) {
  return (
    <StyledButton variant="outlined" size={size} onClick={onToggle}>
      {direction === 'en-to-pl' ? 'EN' : 'PL'}
      <SwapHorizIcon sx={{ fontSize: size === 'small' ? 18 : 22 }} />
      {direction === 'en-to-pl' ? 'PL' : 'EN'}
    </StyledButton>
  );
}
