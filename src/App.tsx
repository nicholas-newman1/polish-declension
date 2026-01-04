import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { Flashcard, type RatingIntervals } from './components/Flashcard';
import cardsData from './data/cards.json';
import type {
  Card as CardType,
  Case,
  Gender,
  Number,
  ReviewDataStore,
  Settings,
} from './types';
import {
  loadReviewData,
  saveReviewData,
  loadSettings,
  saveSettings,
  getOrCreateCardReviewData,
  clearAllData,
} from './lib/storage';
import {
  getSessionCards,
  getPracticeAheadCards,
  getExtraNewCards,
  rateCard,
  getNextIntervals,
  type SessionCard,
} from './lib/scheduler';
import { useAuth } from './lib/useAuth';

const allCards: CardType[] = cardsData as CardType[];

const CASES: Case[] = [
  'Nominative',
  'Genitive',
  'Dative',
  'Accusative',
  'Instrumental',
  'Locative',
  'Vocative',
];
const GENDERS: Gender[] = ['Masculine', 'Feminine', 'Neuter', 'Pronoun'];
const NUMBERS: Number[] = ['Singular', 'Plural'];

const DEFAULT_SETTINGS: Settings = { newCardsPerDay: 10 };

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

const LoadingContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const HeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
}));

function getFirstName(
  displayName: string | null,
  email: string | null
): string {
  if (displayName) {
    return displayName.split(' ')[0];
  }
  if (email) {
    return email.split('@')[0];
  }
  return '';
}

const UserEmail = styled(Typography)(({ theme }) => ({
  maxWidth: 100,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('sm')]: {
    maxWidth: 150,
  },
}));

const SignOutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.disabled,
  textDecoration: 'underline',
}));

const GuestChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(202, 138, 4, 0.1)',
  color: theme.palette.warning.main,
  fontWeight: 500,
}));

const FilterFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  flex: 1,
  [theme.breakpoints.up('sm')]: {
    flex: 'none',
  },
}));

const FilterSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

interface PracticeButtonProps {
  active: boolean;
}

const PracticeButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<PracticeButtonProps>(({ theme, active }) => ({
  minWidth: 100,
  ...(active
    ? {
        backgroundColor: theme.palette.success.main,
        '&:hover': { backgroundColor: theme.palette.success.dark },
      }
    : {
        borderColor: theme.palette.divider,
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
      }),
}));

interface SettingsButtonProps {
  active: boolean;
}

const SettingsButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<SettingsButtonProps>(({ theme, active }) => ({
  width: 40,
  height: 40,
  backgroundColor: active
    ? theme.palette.text.primary
    : theme.palette.background.paper,
  color: active ? theme.palette.background.paper : theme.palette.text.disabled,
  border: '1px solid',
  borderColor: active ? theme.palette.text.primary : theme.palette.divider,
  '&:hover': {
    backgroundColor: active
      ? theme.palette.text.secondary
      : theme.palette.background.default,
  },
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: 420,
  margin: '0 auto',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

const NumberInput = styled(TextField)({
  width: 80,
  '& input': {
    fontFamily: '"JetBrains Mono", monospace',
    textAlign: 'center',
  },
});

const SmallNumberInput = styled(TextField)({
  width: 60,
  '& input': {
    fontFamily: '"JetBrains Mono", monospace',
    textAlign: 'center',
  },
});

const ResetButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(194, 58, 34, 0.1)',
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(194, 58, 34, 0.2)',
  },
}));

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

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

const PrimaryCardGlow = styled(CardGlow)({
  background: 'linear-gradient(135deg, #c23a22, #c9a227, #c23a22)',
});

const SuccessCardGlow = styled(CardGlow)({
  background: 'linear-gradient(135deg, #2d6a4f, #c9a227, #2d6a4f)',
});

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255,255,255,0.95)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const CelebrationAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #2d6a4f, #1b4332)',
  fontSize: '2rem',
  boxShadow: theme.shadows[3],
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.text.secondary,
  },
}));

const SuccessButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

const WarningButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  '&:hover': {
    backgroundColor: theme.palette.warning.dark,
  },
}));

const OptionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
}));

function getDefaultReviewStore(): ReviewDataStore {
  return {
    cards: {},
    reviewedToday: [],
    newCardsToday: [],
    lastReviewDate: new Date().toISOString().split('T')[0],
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reviewStore, setReviewStore] = useState<ReviewDataStore>(
    getDefaultReviewStore
  );
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);

  const [caseFilter, setCaseFilter] = useState<Case | 'All'>('All');
  const [genderFilter, setGenderFilter] = useState<Gender | 'All'>('All');
  const [numberFilter, setNumberFilter] = useState<Number | 'All'>('All');

  const [learningQueue, setLearningQueue] = useState<SessionCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceCards, setPracticeCards] = useState<CardType[]>([]);
  const [sessionQueue, setSessionQueue] = useState<SessionCard[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [ratingCounter, setRatingCounter] = useState(0);
  const [practiceAheadCount, setPracticeAheadCount] = useState(10);
  const [isPracticeAhead, setIsPracticeAhead] = useState(false);
  const [extraNewCardsCount, setExtraNewCardsCount] = useState(5);

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (caseFilter !== 'All' && card.case !== caseFilter) return false;
      if (genderFilter !== 'All' && card.gender !== genderFilter) return false;
      if (numberFilter !== 'All' && card.number !== numberFilter) return false;
      return true;
    });
  }, [caseFilter, genderFilter, numberFilter]);

  const buildSession = useCallback(
    (store: ReviewDataStore, currentSettings: Settings) => {
      const filters = {
        case: caseFilter,
        gender: genderFilter,
        number: numberFilter,
      };
      const { reviewCards, newCards } = getSessionCards(
        allCards,
        store,
        filters,
        currentSettings
      );
      setSessionQueue([...reviewCards, ...newCards]);
      setReviewCount(reviewCards.length);
      setNewCount(newCards.length);
      setLearningQueue([]);
      setCurrentIndex(0);
    },
    [caseFilter, genderFilter, numberFilter]
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [loadedSettings, loadedReviewData] = await Promise.all([
        loadSettings(),
        loadReviewData(),
      ]);
      setSettings(loadedSettings);
      setReviewStore(loadedReviewData);
      buildSession(loadedReviewData, loadedSettings);
      setIsLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resetSession = useCallback(() => {
    buildSession(reviewStore, settings);
  }, [buildSession, reviewStore, settings]);

  const checkForNewCards = useCallback(async () => {
    const freshStore = await loadReviewData();
    setReviewStore(freshStore);
    buildSession(freshStore, settings);
    setIsPracticeAhead(false);
  }, [buildSession, settings]);

  const startPracticeAhead = useCallback(() => {
    const filters = {
      case: caseFilter,
      gender: genderFilter,
      number: numberFilter,
    };
    const aheadCards = getPracticeAheadCards(
      allCards,
      reviewStore,
      filters,
      practiceAheadCount
    );
    setSessionQueue(aheadCards);
    setReviewCount(aheadCards.length);
    setNewCount(0);
    setLearningQueue([]);
    setCurrentIndex(0);
    setIsPracticeAhead(true);
  }, [caseFilter, genderFilter, numberFilter, reviewStore, practiceAheadCount]);

  const startExtraNewCards = useCallback(() => {
    const filters = {
      case: caseFilter,
      gender: genderFilter,
      number: numberFilter,
    };
    const extraCards = getExtraNewCards(
      allCards,
      reviewStore,
      filters,
      extraNewCardsCount
    );
    setSessionQueue(extraCards);
    setReviewCount(0);
    setNewCount(extraCards.length);
    setLearningQueue([]);
    setCurrentIndex(0);
    setIsPracticeAhead(false);
  }, [caseFilter, genderFilter, numberFilter, reviewStore, extraNewCardsCount]);

  const togglePracticeMode = useCallback(() => {
    if (!practiceMode) {
      setPracticeCards(shuffleArray(filteredCards));
      setPracticeIndex(0);
    }
    setPracticeMode(!practiceMode);
  }, [practiceMode, filteredCards]);

  const handlePracticeNext = useCallback(() => {
    setPracticeIndex((prev) => (prev + 1) % practiceCards.length);
  }, [practiceCards.length]);

  const currentSessionCard = sessionQueue[currentIndex] ?? learningQueue[0];
  const isFinished =
    currentIndex >= sessionQueue.length && learningQueue.length === 0;

  const handleRate = async (rating: Grade) => {
    if (!currentSessionCard) return;

    const updatedReviewData = rateCard(currentSessionCard.reviewData, rating);

    const newStore = { ...reviewStore };
    newStore.cards = { ...newStore.cards };
    newStore.cards[currentSessionCard.card.id] = updatedReviewData;

    if (
      currentSessionCard.isNew &&
      !newStore.newCardsToday.includes(currentSessionCard.card.id)
    ) {
      newStore.newCardsToday = [
        ...newStore.newCardsToday,
        currentSessionCard.card.id,
      ];
    }

    if (rating === Rating.Again) {
      if (currentIndex < sessionQueue.length) {
        setLearningQueue((prev) => [
          ...prev,
          { ...currentSessionCard, reviewData: updatedReviewData },
        ]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        const updated = learningQueue.map((item, idx) =>
          idx === 0 ? { ...item, reviewData: updatedReviewData } : item
        );
        setLearningQueue([...updated.slice(1), updated[0]]);
      }
    } else {
      if (!newStore.reviewedToday.includes(currentSessionCard.card.id)) {
        newStore.reviewedToday = [
          ...newStore.reviewedToday,
          currentSessionCard.card.id,
        ];
      }

      if (currentIndex < sessionQueue.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setLearningQueue((prev) => prev.slice(1));
      }
    }

    setReviewStore(newStore);
    await saveReviewData(newStore);
    setRatingCounter((c) => c + 1);
  };

  const handleSettingsChange = async (newCardsPerDay: number) => {
    const newSettings = { ...settings, newCardsPerDay };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleResetAllData = async () => {
    if (
      window.confirm(
        'Are you sure? This will erase all your progress and cannot be undone.'
      )
    ) {
      await clearAllData();
      const freshStore = await loadReviewData();
      setReviewStore(freshStore);
      setSettings(await loadSettings());
      buildSession(freshStore, settings);
      setShowSettings(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const intervals: RatingIntervals = useMemo(() => {
    if (!currentSessionCard) {
      return {
        [Rating.Again]: '',
        [Rating.Hard]: '',
        [Rating.Good]: '',
        [Rating.Easy]: '',
      };
    }
    const allIntervals = getNextIntervals(
      getOrCreateCardReviewData(currentSessionCard.card.id, reviewStore)
        .fsrsCard
    );
    return {
      [Rating.Again]: allIntervals[Rating.Again],
      [Rating.Hard]: allIntervals[Rating.Hard],
      [Rating.Good]: allIntervals[Rating.Good],
      [Rating.Easy]: allIntervals[Rating.Easy],
    };
  }, [currentSessionCard, reviewStore]);

  const totalRemaining =
    sessionQueue.length - currentIndex + learningQueue.length;

  const currentPracticeCard = practiceCards[practiceIndex];

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress sx={{ color: 'text.disabled' }} />
      </LoadingContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">🇵🇱</Typography>
          <HeaderTitle variant="h6" color="text.primary">
            Polish Declension
          </HeaderTitle>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {user ? (
            <>
              <UserEmail variant="body2" color="text.disabled">
                {getFirstName(user.displayName, user.email)}
              </UserEmail>
              <SignOutButton size="small" onClick={handleSignOut}>
                Sign out
              </SignOutButton>
            </>
          ) : (
            <GuestChip label="Guest mode" size="small" />
          )}
        </Stack>
      </Stack>

      {/* Controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <FilterFormControl size="small">
            <InputLabel>Case</InputLabel>
            <FilterSelect
              value={caseFilter}
              label="Case"
              onChange={(e) => {
                setCaseFilter(e.target.value as Case | 'All');
                resetSession();
                if (practiceMode) {
                  setPracticeCards(
                    shuffleArray(
                      allCards.filter((card) => {
                        if (
                          e.target.value !== 'All' &&
                          card.case !== e.target.value
                        )
                          return false;
                        if (
                          genderFilter !== 'All' &&
                          card.gender !== genderFilter
                        )
                          return false;
                        if (
                          numberFilter !== 'All' &&
                          card.number !== numberFilter
                        )
                          return false;
                        return true;
                      })
                    )
                  );
                  setPracticeIndex(0);
                }
              }}
            >
              <MenuItem value="All">All Cases</MenuItem>
              {CASES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </FilterSelect>
          </FilterFormControl>

          <FilterFormControl size="small">
            <InputLabel>Gender</InputLabel>
            <FilterSelect
              value={genderFilter}
              label="Gender"
              onChange={(e) => {
                setGenderFilter(e.target.value as Gender | 'All');
                resetSession();
                if (practiceMode) {
                  setPracticeCards(
                    shuffleArray(
                      allCards.filter((card) => {
                        if (caseFilter !== 'All' && card.case !== caseFilter)
                          return false;
                        if (
                          e.target.value !== 'All' &&
                          card.gender !== e.target.value
                        )
                          return false;
                        if (
                          numberFilter !== 'All' &&
                          card.number !== numberFilter
                        )
                          return false;
                        return true;
                      })
                    )
                  );
                  setPracticeIndex(0);
                }
              }}
            >
              <MenuItem value="All">All Genders</MenuItem>
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </FilterSelect>
          </FilterFormControl>

          <FilterFormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Number</InputLabel>
            <FilterSelect
              value={numberFilter}
              label="Number"
              onChange={(e) => {
                setNumberFilter(e.target.value as Number | 'All');
                resetSession();
                if (practiceMode) {
                  setPracticeCards(
                    shuffleArray(
                      allCards.filter((card) => {
                        if (caseFilter !== 'All' && card.case !== caseFilter)
                          return false;
                        if (
                          genderFilter !== 'All' &&
                          card.gender !== genderFilter
                        )
                          return false;
                        if (
                          e.target.value !== 'All' &&
                          card.number !== e.target.value
                        )
                          return false;
                        return true;
                      })
                    )
                  );
                  setPracticeIndex(0);
                }
              }}
            >
              <MenuItem value="All">Sing./Plural</MenuItem>
              {NUMBERS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </FilterSelect>
          </FilterFormControl>
        </Box>

        <Stack direction="row" spacing={1}>
          <PracticeButton
            variant={practiceMode ? 'contained' : 'outlined'}
            onClick={togglePracticeMode}
            active={practiceMode}
          >
            {practiceMode ? '✓ Practice' : 'Practice'}
          </PracticeButton>

          <SettingsButton
            onClick={() => setShowSettings(!showSettings)}
            size="small"
            active={showSettings}
          >
            <SettingsIcon fontSize="small" />
          </SettingsButton>
        </Stack>
      </Stack>

      {/* Settings panel */}
      {showSettings && !practiceMode && (
        <SettingsCard className="animate-fade-up">
          <Typography variant="h6" sx={{ mb: 2 }}>
            Settings
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" color="text.secondary">
              New cards per day
            </Typography>
            <NumberInput
              type="number"
              size="small"
              value={settings.newCardsPerDay}
              onChange={(e) =>
                handleSettingsChange(Math.max(1, parseInt(e.target.value) || 1))
              }
              inputProps={{ min: 1, max: 100 }}
            />
          </Stack>

          {user && (
            <>
              <Divider sx={{ my: 2 }} />
              <ResetButton
                fullWidth
                variant="contained"
                onClick={handleResetAllData}
              >
                Reset All Progress
              </ResetButton>
            </>
          )}
        </SettingsCard>
      )}

      {/* Main content */}
      <MainContent>
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}
        >
          {practiceMode
            ? `Practice Mode · ${practiceCards.length} cards`
            : isFinished
            ? ''
            : isPracticeAhead
            ? `Practice Ahead · ${totalRemaining} remaining`
            : `${reviewCount} reviews · ${newCount} new · ${totalRemaining} remaining`}
        </Typography>

        {practiceMode ? (
          currentPracticeCard ? (
            <Flashcard
              key={`practice-${currentPracticeCard.id}-${practiceIndex}`}
              card={currentPracticeCard}
              practiceMode
              onNext={handlePracticeNext}
            />
          ) : (
            <EmptyState message="No cards match your filters" />
          )
        ) : isFinished ? (
          <FinishedState
            practiceAheadCount={practiceAheadCount}
            setPracticeAheadCount={setPracticeAheadCount}
            extraNewCardsCount={extraNewCardsCount}
            setExtraNewCardsCount={setExtraNewCardsCount}
            onCheckNewCards={checkForNewCards}
            onPracticeAhead={startPracticeAhead}
            onLearnExtra={startExtraNewCards}
          />
        ) : currentSessionCard ? (
          <Flashcard
            key={`${currentSessionCard.card.id}-${ratingCounter}`}
            card={currentSessionCard.card}
            intervals={intervals}
            onRate={handleRate}
          />
        ) : null}
      </MainContent>
    </PageContainer>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <CardWrapper className="animate-fade-up">
      <Box sx={{ position: 'relative' }}>
        <PrimaryCardGlow />
        <StyledCard sx={{ p: { xs: 4, sm: 5 }, textAlign: 'center' }}>
          <Typography variant="h6" color="text.disabled">
            {message}
          </Typography>
        </StyledCard>
      </Box>
    </CardWrapper>
  );
}

interface FinishedStateProps {
  practiceAheadCount: number;
  setPracticeAheadCount: (count: number) => void;
  extraNewCardsCount: number;
  setExtraNewCardsCount: (count: number) => void;
  onCheckNewCards: () => void;
  onPracticeAhead: () => void;
  onLearnExtra: () => void;
}

function FinishedState({
  practiceAheadCount,
  setPracticeAheadCount,
  extraNewCardsCount,
  setExtraNewCardsCount,
  onCheckNewCards,
  onPracticeAhead,
  onLearnExtra,
}: FinishedStateProps) {
  return (
    <CardWrapper className="animate-fade-up">
      <Box sx={{ position: 'relative' }}>
        <SuccessCardGlow className="card-glow" />
        <StyledCard>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
            <CelebrationAvatar>🎉</CelebrationAvatar>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
              Done for today!
            </Typography>
            <Typography variant="body1" color="text.disabled">
              Come back tomorrow for more practice
            </Typography>
          </Box>

          <PrimaryButton
            fullWidth
            size="large"
            variant="contained"
            onClick={onCheckNewCards}
            sx={{ mb: 3 }}
          >
            Check for new cards
          </PrimaryButton>

          <Stack spacing={2}>
            <OptionPaper elevation={0}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                >
                  Practice ahead
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SmallNumberInput
                    type="number"
                    size="small"
                    value={practiceAheadCount}
                    onChange={(e) =>
                      setPracticeAheadCount(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    inputProps={{ min: 1, max: 100 }}
                  />
                  <Typography variant="body2" color="text.disabled">
                    cards
                  </Typography>
                </Stack>
              </Stack>
              <SuccessButton
                fullWidth
                size="large"
                variant="contained"
                onClick={onPracticeAhead}
              >
                Start Practice Ahead
              </SuccessButton>
            </OptionPaper>

            <OptionPaper elevation={0}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.secondary"
                >
                  Learn extra new
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SmallNumberInput
                    type="number"
                    size="small"
                    value={extraNewCardsCount}
                    onChange={(e) =>
                      setExtraNewCardsCount(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    inputProps={{ min: 1, max: 50 }}
                  />
                  <Typography variant="body2" color="text.disabled">
                    cards
                  </Typography>
                </Stack>
              </Stack>
              <WarningButton
                fullWidth
                size="large"
                variant="contained"
                onClick={onLearnExtra}
              >
                Learn New Cards
              </WarningButton>
            </OptionPaper>
          </Stack>
        </StyledCard>
      </Box>
    </CardWrapper>
  );
}
