import { IconButton } from '@mui/material';
import { VolumeUp } from '@mui/icons-material';

interface AudioButtonProps {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Callback to toggle audio play/stop */
  onToggle: () => void;
  /** Size of the button */
  size?: 'small' | 'medium';
}

/**
 * A button to play/stop audio. Shows red when audio is playing.
 */
export function AudioButton({ isPlaying, onToggle, size = 'small' }: AudioButtonProps) {
  return (
    <IconButton
      onClick={onToggle}
      size={size}
      sx={{
        color: isPlaying ? 'error.main' : 'text.secondary',
        p: 0.5,
      }}
      aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
    >
      <VolumeUp fontSize={size} />
    </IconButton>
  );
}
