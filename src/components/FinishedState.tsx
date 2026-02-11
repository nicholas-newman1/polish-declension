import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { alpha } from '../lib/theme';
import { NumberInput } from './NumberInput';

const CardWrapper = styled(Box)({
  width: '100%',
  maxWidth: 420,
  margin: '0 auto',
});

const CardGlow = styled(Box)({
  position: 'absolute',
  inset: -12,
  borderRadius: 16,
  filter: 'blur(24px)',
  opacity: 0.2,
});

const SuccessCardGlow = styled(CardGlow)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const CelebrationAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  margin: '0 auto',
  marginBottom: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
  fontSize: '1.75rem',
  boxShadow: theme.shadows[3],
}));

const DirectionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const FeatureButton = styled(Button)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const SecondaryActionButton = styled(Button)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.secondary,
  borderColor: alpha(theme.palette.divider, 0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.5),
    borderColor: theme.palette.divider,
  },
}));

const CountBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 20,
  height: 20,
  padding: '0 6px',
  borderRadius: 10,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  marginLeft: theme.spacing(1),
}));

const FeatureCountBadge = styled(CountBadge)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.15),
  color: theme.palette.primary.main,
}));

export type FeatureType = 'vocabulary' | 'sentences' | 'conjugation' | 'declension' | 'aspectPairs';
export type Direction = 'pl-to-en' | 'en-to-pl';

interface OtherFeatureDue {
  feature: FeatureType;
  label: string;
  dueCount: number;
  path: string;
}

interface FinishedStateProps {
  // Current feature context
  currentFeature: FeatureType;
  currentDirection?: Direction;

  // Other direction info (for features with directions)
  otherDirectionDueCount?: number;
  otherDirectionLabel?: string;
  onSwitchDirection?: () => void;

  // Other features with due cards
  otherFeaturesDue: OtherFeatureDue[];
  onNavigateToFeature: (path: string) => void;

  // Existing practice ahead / learn extra functionality
  practiceAheadCount: number;
  setPracticeAheadCount: (count: number) => void;
  extraNewCardsCount: number;
  setExtraNewCardsCount: (count: number) => void;
  onPracticeAhead: () => void;
  onLearnExtra: () => void;
}

export function FinishedState({
  otherDirectionDueCount,
  otherDirectionLabel,
  onSwitchDirection,
  otherFeaturesDue,
  onNavigateToFeature,
  practiceAheadCount,
  setPracticeAheadCount,
  extraNewCardsCount,
  setExtraNewCardsCount,
  onPracticeAhead,
  onLearnExtra,
}: FinishedStateProps) {
  const hasOtherDirection = otherDirectionDueCount !== undefined && otherDirectionDueCount > 0;
  const featuresWithDue = otherFeaturesDue.filter((f) => f.dueCount > 0);
  const hasOtherFeatures = featuresWithDue.length > 0;
  const hasNextActions = hasOtherDirection || hasOtherFeatures;

  return (
    <CardWrapper className="animate-fade-up">
      <Box sx={{ position: 'relative' }}>
        <SuccessCardGlow className="card-glow" />
        <StyledCard>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CelebrationAvatar>🎉</CelebrationAvatar>
            <Typography variant="h5" sx={{ fontWeight: 400, mb: 0.5 }}>
              {hasNextActions ? "What's next?" : 'All done!'}
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {hasNextActions
                ? 'You finished this section'
                : 'Come back tomorrow for more practice'}
            </Typography>
          </Box>

          {/* Primary CTA: Switch direction */}
          {hasOtherDirection && onSwitchDirection && (
            <DirectionButton
              fullWidth
              size="large"
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={onSwitchDirection}
              sx={{ mb: 2 }}
            >
              Switch to {otherDirectionLabel}
              <CountBadge>{otherDirectionDueCount}</CountBadge>
            </DirectionButton>
          )}

          {/* Secondary CTAs: Other features */}
          {hasOtherFeatures && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: hasNextActions ? 2 : 0, flexWrap: 'wrap', gap: 1 }}
            >
              {featuresWithDue.map((feature) => (
                <FeatureButton
                  key={feature.feature}
                  variant="contained"
                  size="medium"
                  onClick={() => onNavigateToFeature(feature.path)}
                  disableElevation
                >
                  {feature.label}
                  <FeatureCountBadge>{feature.dueCount}</FeatureCountBadge>
                </FeatureButton>
              ))}
            </Stack>
          )}

          {/* Divider before tertiary options */}
          {hasNextActions && (
            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" color="text.disabled">
                or stay here
              </Typography>
            </Divider>
          )}

          {/* Tertiary: Condensed add new / review early */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
              <SecondaryActionButton
                variant="outlined"
                size="medium"
                onClick={onLearnExtra}
                disableElevation
              >
                +{extraNewCardsCount} new
              </SecondaryActionButton>
              <Tooltip title="Learn cards you haven't seen yet" arrow placement="top">
                <HelpOutlineIcon
                  sx={{
                    fontSize: 16,
                    color: 'text.disabled',
                    cursor: 'help',
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
              <SecondaryActionButton
                variant="outlined"
                size="medium"
                onClick={onPracticeAhead}
                disableElevation
              >
                Review {practiceAheadCount}
              </SecondaryActionButton>
              <Tooltip title="Review cards before they're due" arrow placement="top">
                <HelpOutlineIcon
                  sx={{
                    fontSize: 16,
                    color: 'text.disabled',
                    cursor: 'help',
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            </Stack>
          </Stack>

          {/* Number inputs row */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.disabled">
                New:
              </Typography>
              <NumberInput
                value={extraNewCardsCount}
                onChange={setExtraNewCardsCount}
                min={1}
                width={56}
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.disabled">
                Early:
              </Typography>
              <NumberInput
                value={practiceAheadCount}
                onChange={setPracticeAheadCount}
                min={1}
                width={56}
              />
            </Stack>
          </Stack>
        </StyledCard>
      </Box>
    </CardWrapper>
  );
}
