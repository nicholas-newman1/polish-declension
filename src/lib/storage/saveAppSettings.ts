import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppSettings } from '../../types/appSettings';
import { getUserId } from './helpers';

export default async function saveAppSettings(settings: AppSettings): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const docRef = doc(db, 'users', userId, 'data', 'appSettings');
  await setDoc(docRef, settings);
}
