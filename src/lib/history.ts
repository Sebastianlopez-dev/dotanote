import { TranscriptionResult } from '../services/transcription';
import { ModelMetadata } from '../types';

const STORAGE_KEY = 'vozia-history';

export function addHistoryEntry(
  history: TranscriptionResult[],
  text: string,
  metadata?: ModelMetadata
): TranscriptionResult[] {
  const newResult: TranscriptionResult = {
    id: crypto.randomUUID(),
    text,
    metadata,
    timestamp: Date.now(),
  };
  return [newResult, ...history];
}

export function deleteHistoryEntry(
  history: TranscriptionResult[],
  id: string
): TranscriptionResult[] {
  return history.filter((item) => item.id !== id);
}

export function togglePin(
  history: TranscriptionResult[],
  id: string
): TranscriptionResult[] {
  return history.map((item) =>
    item.id === id ? { ...item, isPinned: !item.isPinned } : item
  );
}

export function sortHistory(history: TranscriptionResult[]): TranscriptionResult[] {
  return [...history].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });
}

export function loadHistory(): TranscriptionResult[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as TranscriptionResult[];
  } catch {
    return [];
  }
}

export function saveHistory(history: TranscriptionResult[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): TranscriptionResult[] {
  return [];
}
