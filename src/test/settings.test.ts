import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDefaultAIConfig,
  createDefaultGeneralSettings,
  createDefaultMagicFormats,
  loadAIConfig,
  loadGeneralSettings,
  loadMagicFormats,
} from '../lib/settings';
import { AIConfig, GeneralSettings, MagicFormat } from '../types';

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
});

function saveAIConfig(config: AIConfig) {
  mockStorage['vnote_ai_config'] = JSON.stringify(config);
}

function saveGeneralSettings(settings: GeneralSettings) {
  mockStorage['vnote_general_settings'] = JSON.stringify(settings);
}

function saveMagicFormats(formats: MagicFormat[]) {
  mockStorage['vnote_formats'] = JSON.stringify(formats);
}

function saveUIState(sidebarOpen: boolean, dashboardOpen: boolean) {
  mockStorage['sidebarOpen'] = String(sidebarOpen);
  mockStorage['dashboardOpen'] = String(dashboardOpen);
}

describe('createDefaultAIConfig', () => {
  it('returns the expected default shape', () => {
    const result = createDefaultAIConfig();
    expect(result).toEqual({ useCustomKeys: false });
  });

  it('returns a fresh object each call', () => {
    const a = createDefaultAIConfig();
    const b = createDefaultAIConfig();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe('createDefaultGeneralSettings', () => {
  it('returns the expected default shape', () => {
    const result = createDefaultGeneralSettings();
    expect(result).toEqual({
      language: 'es',
      autoExportFormat: 'none',
      showHints: true,
      defaultSidebarVisible: true,
      defaultDashboardVisible: true,
    });
  });

  it('returns a fresh object each call', () => {
    const a = createDefaultGeneralSettings();
    const b = createDefaultGeneralSettings();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe('createDefaultMagicFormats', () => {
  it('returns exactly 4 formats with Executive as default', () => {
    const result = createDefaultMagicFormats();
    expect(result).toHaveLength(4);
    expect(result[0]).toMatchObject({ id: 'default', name: 'Executive', isDefault: true, isPinned: true });
    expect(result[1]).toMatchObject({ id: 'formal', name: 'Formal', isPinned: true });
    expect(result[2]).toMatchObject({ id: 'casual', name: 'Casual', isPinned: true });
    expect(result[3]).toMatchObject({ id: 'puntual', name: 'Puntual', isPinned: true });
  });

  it('returns a fresh array each call', () => {
    const a = createDefaultMagicFormats();
    const b = createDefaultMagicFormats();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe('loadAIConfig', () => {
  it('roundtrips AIConfig with custom keys', () => {
    const original: AIConfig = {
      useCustomKeys: true,
      geminiKey: 'sk-abc',
      groqKey: 'sk-def',
    };
    saveAIConfig(original);
    const loaded = loadAIConfig();
    expect(loaded).toEqual(original);
  });

  it('returns default when key is missing', () => {
    const loaded = loadAIConfig();
    expect(loaded).toEqual(createDefaultAIConfig());
  });

  it('returns default when stored JSON is malformed', () => {
    mockStorage['vnote_ai_config'] = 'not valid json';
    const loaded = loadAIConfig();
    expect(loaded).toEqual(createDefaultAIConfig());
  });

  it('silently ignores unrecognized keys in stored JSON', () => {
    const raw = { useCustomKeys: true, unknownKey: 'whatever', another: 123 };
    saveAIConfig(raw as unknown as AIConfig);
    const loaded = loadAIConfig();
    expect(loaded.useCustomKeys).toBe(true);
    expect(loaded).not.toHaveProperty('unknownKey');
    expect(loaded).not.toHaveProperty('another');
  });
});

describe('loadGeneralSettings', () => {
  it('roundtrips GeneralSettings', () => {
    const original: GeneralSettings = {
      language: 'en',
      autoExportFormat: 'markdown',
      showHints: false,
      defaultSidebarVisible: false,
      defaultDashboardVisible: false,
    };
    saveGeneralSettings(original);
    const loaded = loadGeneralSettings();
    expect(loaded).toEqual(original);
  });

  it('returns default when key is missing', () => {
    const loaded = loadGeneralSettings();
    expect(loaded).toEqual(createDefaultGeneralSettings());
  });

  it('returns default when stored JSON is malformed', () => {
    mockStorage['vnote_general_settings'] = 'not valid json';
    const loaded = loadGeneralSettings();
    expect(loaded).toEqual(createDefaultGeneralSettings());
  });
});

describe('loadMagicFormats', () => {
  it('roundtrips custom formats', () => {
    const original: MagicFormat[] = [
      { id: 'default', name: 'Executive', prompt: 'exec', isDefault: true, isPinned: true },
      { id: 'custom', name: 'Custom', prompt: 'custom prompt', isPinned: false },
    ];
    saveMagicFormats(original);
    const loaded = loadMagicFormats();
    expect(loaded).toEqual(original);
  });

  it('returns default when key is missing', () => {
    const loaded = loadMagicFormats();
    expect(loaded).toEqual(createDefaultMagicFormats());
  });

  it('returns default when stored JSON is malformed', () => {
    mockStorage['vnote_formats'] = 'not valid json';
    const loaded = loadMagicFormats();
    expect(loaded).toEqual(createDefaultMagicFormats());
  });

  it('returns default when stored JSON is an empty array', () => {
    mockStorage['vnote_formats'] = '[]';
    const loaded = loadMagicFormats();
    expect(loaded).toEqual(createDefaultMagicFormats());
  });
});

describe('UI state persistence', () => {
  it('roundtrips sidebar visibility as boolean string', () => {
    saveUIState(false, true);
    expect(mockStorage['sidebarOpen']).toBe('false');
    expect(mockStorage['dashboardOpen']).toBe('true');
  });
});
