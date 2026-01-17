import { useContext } from 'react';
import { ReviewDataContext } from '../contexts/ReviewDataContext';

export function useReviewData() {
  const context = useContext(ReviewDataContext);
  if (!context) {
    throw new Error('useReviewData must be used within a ReviewDataProvider');
  }
  return context;
}

