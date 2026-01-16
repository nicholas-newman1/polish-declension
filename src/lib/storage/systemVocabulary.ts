import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { VocabularyWord } from '../../types/vocabulary';

export async function updateSystemVocabularyWord(
  wordId: number,
  updates: Partial<Omit<VocabularyWord, 'id'>>
): Promise<void> {
  const docRef = doc(db, 'vocabulary', String(wordId));
  await updateDoc(docRef, updates);
}

export async function deleteSystemVocabularyWord(wordId: number): Promise<void> {
  const docRef = doc(db, 'vocabulary', String(wordId));
  await deleteDoc(docRef);
}

