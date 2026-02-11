import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating, type Grade } from 'ts-fsrs';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { styled } from '../../lib/styled';
import { PracticeModeButton } from '../../components/PracticeModeButton';
import { SettingsButton } from '../../components/SettingsButton';
import { AspectPairsFlashcard, type RatingIntervals } from './components/AspectPairsFlashcard';
import { FinishedState } from '../../components/FinishedState';
import { EmptyState } from '../../components/EmptyState';
import { ReviewCountBadge } from '../../components/ReviewCountBadge';
import { SettingsPanel } from '../../components/SettingsPanel';
import type {
  AspectPairCard,
  AspectPairsReviewDataStore,
  AspectPairsSettings,
} from '../../types/aspectPairs';
import getOrCreateAspectPairsCardReviewData from '../../lib/storage/getOrCreateAspectPairsCardReviewData';
import getAspectPairsSessionCards from '../../lib/aspectPairsScheduler/getAspectPairsSessionCards';
import getAspectPairsPracticeAheadCards from '../../lib/aspectPairsScheduler/getAspectPairsPracticeAheadCards';
import getAspectPairsExtraNewCards from '../../lib/aspectPairsScheduler/getAspectPairsExtraNewCards';
import rateAspectPairsCard from '../../lib/aspectPairsScheduler/rateAspectPairsCard';
import getNextIntervals from '../../lib/fsrsUtils/getNextIntervals';
import type { AspectPairsSessionCard } from '../../lib/aspectPairsScheduler/types';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useAspectPairs } from '../../hooks/useReviewData';
import { useProgressStats } from '../../hooks/useProgressStats';
import shuffleArray from '../../lib/utils/shuffleArray';
import { includesVerbId } from '../../lib/storage/helpers';

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const ControlsRow = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export function AspectPairsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    aspectPairCards,
    aspectPairsReviewStore: reviewStore,
    aspectPairsSettings: settings,
    updateAspectPairsReviewStore,
    updateAspectPairsSettings,
    clearAspectPairsData,
  } = useAspectPairs();

  const [showSettings, setShowSettings] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);

  const [learningQueue, setLearningQueue] = useState<AspectPairsSessionCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceCards, setPracticeCards] = useState<AspectPairCard[]>([]);
  const [sessionQueue, setSessionQueue] = useState<AspectPairsSessionCard[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [ratingCounter, setRatingCounter] = useState(0);
  const [practiceAheadCount, setPracticeAheadCount] = useState(10);
  const [isPracticeAhead, setIsPracticeAhead] = useState(false);
  const [extraNewCardsCount, setExtraNewCardsCount] = useState(5);

  const sessionBuiltRef = useRef(false);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    if (aspectPairCards.length > 0 || reviewStore) {
      setContextLoading(false);
    }
  }, [aspectPairCards, reviewStore]);

  const buildSession = useCallback(
    (
      cards: AspectPairCard[],
      store: AspectPairsReviewDataStore,
      currentSettings: AspectPairsSettings
    ) => {
      const { reviewCards, newCards } = getAspectPairsSessionCards(cards, store, currentSettings);
      setSessionQueue([...reviewCards, ...newCards]);
      setReviewCount(reviewCards.length);
      setNewCount(newCards.length);
      setLearningQueue([]);
      setCurrentIndex(0);
      setIsPracticeAhead(false);
    },
    []
  );

  useEffect(() => {
    if (!contextLoading && !sessionBuiltRef.current && aspectPairCards.length >= 0) {
      sessionBuiltRef.current = true;
      queueMicrotask(() => {
        buildSession(aspectPairCards, reviewStore, settings);
      });
    }
  }, [contextLoading, buildSession, aspectPairCards, reviewStore, settings]);

  const progressStats = useProgressStats();

  const startPracticeAhead = useCallback(() => {
    const aheadCards = getAspectPairsPracticeAheadCards(
      aspectPairCards,
      reviewStore,
      practiceAheadCount
    );
    setSessionQueue(aheadCards);
    setReviewCount(aheadCards.length);
    setNewCount(0);
    setLearningQueue([]);
    setCurrentIndex(0);
    setIsPracticeAhead(true);
  }, [aspectPairCards, reviewStore, practiceAheadCount]);

  const startExtraNewCards = useCallback(() => {
    const extraCards = getAspectPairsExtraNewCards(
      aspectPairCards,
      reviewStore,
      extraNewCardsCount
    );
    setSessionQueue(extraCards);
    setReviewCount(0);
    setNewCount(extraCards.length);
    setLearningQueue([]);
    setCurrentIndex(0);
    setIsPracticeAhead(false);
  }, [aspectPairCards, reviewStore, extraNewCardsCount]);

  const togglePracticeMode = useCallback(() => {
    if (!practiceMode) {
      setPracticeCards(shuffleArray([...aspectPairCards]));
      setPracticeIndex(0);
    }
    setPracticeMode(!practiceMode);
  }, [practiceMode, aspectPairCards]);

  const handlePracticeNext = useCallback(() => {
    setPracticeIndex((prev) => (prev + 1) % practiceCards.length);
  }, [practiceCards.length]);

  const currentSessionCard = sessionQueue[currentIndex] ?? learningQueue[0];
  const isFinished = currentIndex >= sessionQueue.length && learningQueue.length === 0;

  const handleRate = async (rating: Grade) => {
    if (!currentSessionCard) return;

    const verbId = currentSessionCard.card.verb.id;
    const updatedReviewData = rateAspectPairsCard(currentSessionCard.reviewData, rating);

    const newStore = { ...reviewStore };
    newStore.cards = { ...newStore.cards };
    newStore.cards[verbId] = updatedReviewData;

    if (currentSessionCard.isNew && !includesVerbId(newStore.newCardsToday, verbId)) {
      newStore.newCardsToday = [...newStore.newCardsToday, verbId];
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
      if (!includesVerbId(newStore.reviewedToday, verbId)) {
        newStore.reviewedToday = [...newStore.reviewedToday, verbId];
      }

      if (currentIndex < sessionQueue.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setLearningQueue((prev) => prev.slice(1));
      }
    }

    setRatingCounter((c) => c + 1);
    await updateAspectPairsReviewStore(newStore);
  };

  const handleSettingsChange = async (newCardsPerDay: number) => {
    const newSettings = { ...settings, newCardsPerDay };
    await updateAspectPairsSettings(newSettings);
    buildSession(aspectPairCards, reviewStore, newSettings);
  };

  const handleResetAllData = async () => {
    if (
      window.confirm(
        'Are you sure? This will erase all your aspect pairs progress and cannot be undone.'
      )
    ) {
      await clearAspectPairsData();
      sessionBuiltRef.current = false;
      setShowSettings(false);
    }
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
      getOrCreateAspectPairsCardReviewData(currentSessionCard.card.verb.id, reviewStore).fsrsCard
    );
    return {
      [Rating.Again]: allIntervals[Rating.Again],
      [Rating.Hard]: allIntervals[Rating.Hard],
      [Rating.Good]: allIntervals[Rating.Good],
      [Rating.Easy]: allIntervals[Rating.Easy],
    };
  }, [currentSessionCard, reviewStore]);

  const totalRemaining = sessionQueue.length - currentIndex + learningQueue.length;

  const currentPracticeCard = practiceCards[practiceIndex];

  const isLoading = contextLoading;

  if (aspectPairCards.length === 0 && !isLoading) {
    return (
      <MainContent>
        <EmptyState message="No aspect pairs available. Verbs need aspectPair data to practice." />
      </MainContent>
    );
  }

  return (
    <>
      <ControlsRow direction="row" alignItems="center">
        <PracticeModeButton
          active={practiceMode}
          onClick={togglePracticeMode}
          disabled={isLoading}
        />

        <SettingsButton
          active={showSettings}
          onClick={() => setShowSettings(!showSettings)}
          disabled={isLoading}
        />
      </ControlsRow>

      {showSettings && !practiceMode && (
        <SettingsPanel
          newCardsPerDay={settings.newCardsPerDay}
          user={user}
          onSettingsChange={handleSettingsChange}
          onResetAllData={handleResetAllData}
          resetButtonLabel="Reset Aspect Pairs Progress"
        />
      )}

      <MainContent>
        {isLoading ? (
          <CircularProgress sx={{ color: 'text.disabled' }} />
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{
                mb: { xs: 3, sm: 4 },
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {practiceMode ? (
                `Practice Mode · ${practiceCards.length} pairs`
              ) : isFinished ? null : isPracticeAhead ? (
                <>
                  Practice Ahead · <ReviewCountBadge count={totalRemaining} /> remaining
                </>
              ) : (
                <>
                  {reviewCount} reviews · {newCount} new ·{' '}
                  <ReviewCountBadge count={totalRemaining} /> remaining
                </>
              )}
            </Typography>

            {practiceMode ? (
              currentPracticeCard ? (
                <AspectPairsFlashcard
                  key={`practice-${currentPracticeCard.verb.id}-${practiceIndex}`}
                  card={currentPracticeCard}
                  practiceMode
                  onNext={handlePracticeNext}
                />
              ) : (
                <EmptyState message="No aspect pairs available" />
              )
            ) : isFinished ? (
              <FinishedState
                currentFeature="aspectPairs"
                otherFeaturesDue={[
                  {
                    feature: 'vocabulary',
                    label: 'Vocabulary',
                    dueCount: progressStats.vocabulary.due,
                    path: '/vocabulary',
                  },
                  {
                    feature: 'declension',
                    label: 'Declension',
                    dueCount: progressStats.declension.due,
                    path: '/declension',
                  },
                  {
                    feature: 'conjugation',
                    label: 'Conjugation',
                    dueCount: progressStats.conjugation.due,
                    path: '/conjugation',
                  },
                  {
                    feature: 'sentences',
                    label: 'Sentences',
                    dueCount: progressStats.sentences.due,
                    path: '/sentences',
                  },
                ]}
                onNavigateToFeature={(path) => navigate(path)}
                practiceAheadCount={practiceAheadCount}
                setPracticeAheadCount={setPracticeAheadCount}
                extraNewCardsCount={extraNewCardsCount}
                setExtraNewCardsCount={setExtraNewCardsCount}
                onPracticeAhead={startPracticeAhead}
                onLearnExtra={startExtraNewCards}
              />
            ) : currentSessionCard ? (
              <AspectPairsFlashcard
                key={`${currentSessionCard.card.verb.id}-${ratingCounter}`}
                card={currentSessionCard.card}
                intervals={intervals}
                onRate={handleRate}
              />
            ) : null}
          </>
        )}
      </MainContent>
    </>
  );
}
