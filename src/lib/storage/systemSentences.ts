import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Sentence } from '../../types/sentences';

export async function updateSentence(
  sentenceId: string,
  updates: Partial<Omit<Sentence, 'id'>>
): Promise<void> {
  const docRef = doc(db, 'sentences', sentenceId);
  await updateDoc(docRef, updates);
}

export async function deleteSentence(sentenceId: string): Promise<void> {
  const docRef = doc(db, 'sentences', sentenceId);
  await deleteDoc(docRef);
}

