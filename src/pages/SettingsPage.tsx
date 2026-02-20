import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { VolumeUp } from '@mui/icons-material';
import { styled } from '../lib/styled';
import { useAppSettings } from '../contexts/AppSettingsContext';

const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(2),
}));

const SettingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const SettingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
}));

const SettingInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const SettingIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
}));

export function SettingsPage() {
  const { settings, updateSettings } = useAppSettings();

  const handleAutoPlayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ autoPlayAudio: event.target.checked });
  };

  return (
    <PageContainer>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Settings
      </Typography>

      <SettingCard>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Audio
          </Typography>

          <SettingRow>
            <SettingInfo>
              <SettingIcon>
                <VolumeUp />
              </SettingIcon>
              <Box>
                <Typography variant="body1">Auto-play audio</Typography>
                <Typography variant="body2" color="text.secondary">
                  Automatically play audio when a flashcard opens
                </Typography>
              </Box>
            </SettingInfo>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoPlayAudio}
                  onChange={handleAutoPlayChange}
                />
              }
              label=""
            />
          </SettingRow>
        </CardContent>
      </SettingCard>
    </PageContainer>
  );
}
