export interface MagicFormat {
  id: string;
  name: string;
  prompt: string;
  isDefault?: boolean;
  isPinned: boolean;
}

export interface AudioSettings {
  noiseSuppression: boolean;
  autoGainControl: boolean;
  vadSensitivity: number;
  monitoring: boolean;
  deviceId?: string;
  outputId?: string;
}

export interface GeneralSettings {
  language: string;
  autoExportFormat: 'none' | 'markdown' | 'txt' | 'pdf';
  showHints: boolean;
  defaultSidebarVisible: boolean;
  defaultDashboardVisible: boolean;
}

export interface ModelMetadata {
  modelName: string;
  providerName: string;
}

export interface AIProvider {
  name: string;
  transcribe(
    audioBlob: Blob,
    languagePrompt: string
  ): Promise<{ text: string; metadata: ModelMetadata }>;
  enhance(text: string, customPrompt?: string): Promise<{ text: string; metadata: ModelMetadata }>;
}

export interface AIConfig {
  useCustomKeys: boolean;
  geminiKey?: string;
  groqKey?: string;
  anthropicKey?: string;
  openRouterKey?: string;
  qwenKey?: string;
  openRouterModel?: string; // e.g. "meta-llama/llama-3.1-405b-instruct"
  qwenModel?: string; // e.g. "qwen-max"
}

export interface AIError {
  message: string;
  provider: string;
  code?: number;
  isQuotaExceeded: boolean;
}
