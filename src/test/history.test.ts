import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addHistoryEntry,
  deleteHistoryEntry,
  togglePin,
  sortHistory,
  loadHistory,
  saveHistory,
  clearHistory,
} from '../lib/history';
import { TranscriptionResult } from '../services/transcription';
import { ModelMetadata } from '../types';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });
  vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-123',
  });
});

function createEntry(overrides: Partial<TranscriptionResult> = {}): TranscriptionResult {
  return {
    id: 'test-id',
    text: 'Test text',
    timestamp: 1000,
    ...overrides,
  };
}

describe('addHistoryEntry', () => {
  it('prepends a new entry with unique id and timestamp', () => {
    const history: TranscriptionResult[] = [];
    const now = Date.now();
    const result = addHistoryEntry(history, 'Hello world');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-uuid-123');
    expect(result[0].text).toBe('Hello world');
    expect(result[0].timestamp).toBeGreaterThanOrEqual(now);
    expect(result[0].timestamp).toBeLessThanOrEqual(now + 100);
  });

  it('includes metadata when provided', () => {
    const metadata: ModelMetadata = { modelName: 'gemini-3-flash', providerName: 'Gemini' };
    const result = addHistoryEntry([], 'Hello', metadata);
    expect(result[0].metadata).toEqual(metadata);
  });

  it('prepends to existing history', () => {
    const existing = createEntry({ id: 'existing', text: 'Existing' });
    const result = addHistoryEntry([existing], 'New');
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('New');
    expect(result[1].text).toBe('Existing');
  });
});

describe('deleteHistoryEntry', () => {
  it('removes entry by id', () => {
    const a = createEntry({ id: 'a' });
    const b = createEntry({ id: 'b' });
    const result = deleteHistoryEntry([a, b], 'a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('is no-op for non-existent id', () => {
    const a = createEntry({ id: 'a' });
    const result = deleteHistoryEntry([a], 'nonexistent');
    expect(result).toEqual([a]);
  });
});

describe('togglePin', () => {
  it('toggles isPinned from false to true', () => {
    const entry = createEntry({ id: 'a', isPinned: false });
    const result = togglePin([entry], 'a');
    expect(result[0].isPinned).toBe(true);
  });

  it('toggles isPinned from true to false', () => {
    const entry = createEntry({ id: 'a', isPinned: true });
    const result = togglePin([entry], 'a');
    expect(result[0].isPinned).toBe(false);
  });

  it('does not affect other entries', () => {
    const a = createEntry({ id: 'a', isPinned: false });
    const b = createEntry({ id: 'b', isPinned: false });
    const result = togglePin([a, b], 'a');
    expect(result[0].isPinned).toBe(true);
    expect(result[1].isPinned).toBe(false);
  });
});

describe('sortHistory', () => {
  it('sorts pinned first, then by timestamp descending', () => {
    const a = createEntry({ id: 'a', isPinned: true, timestamp: 100 });
    const b = createEntry({ id: 'b', isPinned: false, timestamp: 200 });
    const c = createEntry({ id: 'c', isPinned: false, timestamp: 300 });
    const result = sortHistory([b, a, c]);
    expect(result.map((r) => r.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('localStorage', () => {
  it('roundtrips history array', () => {
    const history = [createEntry({ id: 'a', text: 'First' }), createEntry({ id: 'b', text: 'Second' })];
    saveHistory(history);
    const loaded = loadHistory();
    expect(loaded).toEqual(history);
  });

  it('returns empty array when key is missing', () => {
    const loaded = loadHistory();
    expect(loaded).toEqual([]);
  });

  it('returns empty array when stored JSON is corrupted', () => {
    mockStorage['vozia-history'] = 'invalid json';
    const loaded = loadHistory();
    expect(loaded).toEqual([]);
  });
});

describe('clearHistory', () => {
  it('returns empty array', () => {
    const result = clearHistory();
    expect(result).toEqual([]);
  });
});

describe('edge cases', () => {
  it('handles empty history array', () => {
    expect(sortHistory([])).toEqual([]);
    expect(deleteHistoryEntry([], 'any')).toEqual([]);
    expect(togglePin([], 'any')).toEqual([]);
  });

  it('handles duplicate IDs by toggling all matching entries', () => {
    const a1 = createEntry({ id: 'a', isPinned: false });
    const a2 = createEntry({ id: 'a', isPinned: false });
    const result = togglePin([a1, a2], 'a');
    expect(result[0].isPinned).toBe(true);
    expect(result[1].isPinned).toBe(true);
  });

  it('handles duplicate IDs by deleting all matching entries', () => {
    const a1 = createEntry({ id: 'a' });
    const a2 = createEntry({ id: 'a' });
    const b = createEntry({ id: 'b' });
    const result = deleteHistoryEntry([a1, b, a2], 'a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });
});
