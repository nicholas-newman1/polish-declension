import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getUserId } from './helpers';

export default async function clearAspectPairsData(): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  try {
    await deleteDoc(doc(db, 'users', userId, 'data', 'aspectPairsReviewData'));
    await deleteDoc(doc(db, 'users', userId, 'data', 'aspectPairsSettings'));
  } catch (e) {
    console.error('Failed to clear aspect pairs data:', e);
  }
}
