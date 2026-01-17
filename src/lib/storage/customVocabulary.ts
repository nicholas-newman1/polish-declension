import { createCustomStorage } from './createCustomStorage';
import type { CustomVocabularyWord } from '../../types/vocabulary';

const storage = createCustomStorage<CustomVocabularyWord>('customVocabulary', {
  documentKey: 'words',
});

export const loadCustomVocabulary = storage.load;
export const saveCustomVocabulary = storage.save;
export const addCustomWord = storage.add;
export const updateCustomWord = storage.update;
export const deleteCustomWord = storage.delete;
