/**
 * Dictionary (Custom Vocabulary) Utilities
 * Loads and persists a list of words that the AI should transcribe exactly.
 */

const STORAGE_KEY = 'vnote_dictionary';

export function loadDictionary(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((w) => String(w).toLowerCase().trim()).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveDictionary(words: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function addDictionaryWord(words: string[], word: string): string[] {
  const normalized = word.toLowerCase().trim();
  if (!normalized) return words;
  if (words.includes(normalized)) return words;
  return [...words, normalized];
}

export function removeDictionaryWord(words: string[], word: string): string[] {
  return words.filter((w) => w !== word);
}

export function formatDictionaryPrompt(words: string[]): string {
  if (!words.length) return '';
  const list = words.join(', ');
  return `IMPORTANT: The following words are technical terms that must be transcribed exactly as written: ${list}. Do NOT modify or translate them.`;
}
