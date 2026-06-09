import { AIConfig, GeneralSettings, MagicFormat } from '../types';

export function createDefaultAIConfig(): AIConfig {
  return { useCustomKeys: false };
}

export function createDefaultGeneralSettings(): GeneralSettings {
  return {
    language: 'es',
    autoExportFormat: 'none',
    showHints: true,
    defaultSidebarVisible: true,
    defaultDashboardVisible: true,
  };
}

export function createDefaultMagicFormats(): MagicFormat[] {
  return [
    {
      id: 'default',
      name: 'Executive',
      prompt:
        'Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada.',
      isDefault: true,
      isPinned: true,
    },
    {
      id: 'formal',
      name: 'Formal',
      prompt: 'Reescribe este texto con un tono altamente profesional, formal y corporativo.',
      isPinned: true,
    },
    {
      id: 'casual',
      name: 'Casual',
      prompt: 'Reescribe este texto con un tono cercano, amigable y conversacional.',
      isPinned: true,
    },
    {
      id: 'puntual',
      name: 'Puntual',
      prompt:
        'Extrae los puntos clave de este texto y preséntalos en una lista de viñetas (bullet points) concisa.',
      isPinned: true,
    },
  ];
}

export function loadAIConfig(): AIConfig {
  const saved = localStorage.getItem('vnote_ai_config');
  if (!saved) return createDefaultAIConfig();
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown>;
    const config = createDefaultAIConfig();
    if (typeof parsed.useCustomKeys === 'boolean') config.useCustomKeys = parsed.useCustomKeys;
    if (typeof parsed.geminiKey === 'string') config.geminiKey = parsed.geminiKey;
    if (typeof parsed.groqKey === 'string') config.groqKey = parsed.groqKey;
    if (typeof parsed.anthropicKey === 'string') config.anthropicKey = parsed.anthropicKey;
    if (typeof parsed.openRouterKey === 'string') config.openRouterKey = parsed.openRouterKey;
    if (typeof parsed.qwenKey === 'string') config.qwenKey = parsed.qwenKey;
    if (typeof parsed.openRouterModel === 'string') config.openRouterModel = parsed.openRouterModel;
    if (typeof parsed.qwenModel === 'string') config.qwenModel = parsed.qwenModel;
    return config;
  } catch {
    return createDefaultAIConfig();
  }
}

export function loadGeneralSettings(): GeneralSettings {
  const saved = localStorage.getItem('vnote_general_settings');
  if (!saved) return createDefaultGeneralSettings();
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown>;
    const settings = createDefaultGeneralSettings();
    if (typeof parsed.language === 'string') settings.language = parsed.language;
    const validFormats = ['none', 'markdown', 'txt', 'pdf'] as const;
    if (validFormats.includes(parsed.autoExportFormat as (typeof validFormats)[number])) {
      settings.autoExportFormat = parsed.autoExportFormat as GeneralSettings['autoExportFormat'];
    }
    if (typeof parsed.showHints === 'boolean') settings.showHints = parsed.showHints;
    if (typeof parsed.defaultSidebarVisible === 'boolean') settings.defaultSidebarVisible = parsed.defaultSidebarVisible;
    if (typeof parsed.defaultDashboardVisible === 'boolean') settings.defaultDashboardVisible = parsed.defaultDashboardVisible;
    return settings;
  } catch {
    return createDefaultGeneralSettings();
  }
}

export function loadMagicFormats(): MagicFormat[] {
  const saved = localStorage.getItem('vnote_formats');
  if (!saved) return createDefaultMagicFormats();
  try {
    const parsed = JSON.parse(saved) as MagicFormat[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return createDefaultMagicFormats();
  } catch {
    return createDefaultMagicFormats();
  }
}
