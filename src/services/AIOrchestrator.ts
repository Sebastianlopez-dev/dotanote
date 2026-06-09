import { AIProvider, ModelMetadata, AIConfig } from '../types';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { QwenProvider } from './providers/QwenProvider';

export class AIOrchestrator {
  private transcribeProviders: AIProvider[] = [];
  private enhanceProviders: AIProvider[] = [];

  constructor(
    config: AIConfig,
    factories?: {
      createTranscribeProviders?: (config: AIConfig) => AIProvider[];
      createEnhanceProviders?: (config: AIConfig) => AIProvider[];
    }
  ) {
    if (factories?.createTranscribeProviders) {
      this.transcribeProviders = factories.createTranscribeProviders(config);
    } else {
      // 1. Transcription Priority: Groq (Whisper) -> Gemini
      const groqKey = config.useCustomKeys
        ? config.groqKey
        : (import.meta as any).env.VITE_GROQ_API_KEY;
      const geminiKey = config.useCustomKeys
        ? config.geminiKey
        : (import.meta as any).env.VITE_GEMINI_API_KEY;

      if (groqKey) this.transcribeProviders.push(new GroqProvider(groqKey));
      if (geminiKey) this.transcribeProviders.push(new GeminiProvider(geminiKey));
    }

    if (factories?.createEnhanceProviders) {
      this.enhanceProviders = factories.createEnhanceProviders(config);
    } else {
      // 2. Enhancement Priority: Claude -> Qwen -> Gemini -> Groq -> OpenRouter
      const geminiKey = config.useCustomKeys
        ? config.geminiKey
        : (import.meta as any).env.VITE_GEMINI_API_KEY;
      const groqKey = config.useCustomKeys
        ? config.groqKey
        : (import.meta as any).env.VITE_GROQ_API_KEY;
      const anthropicKey = config.useCustomKeys ? config.anthropicKey : undefined;
      const qwenKey = config.useCustomKeys ? config.qwenKey : undefined;
      const openRouterKey = config.useCustomKeys ? config.openRouterKey : undefined;

      if (anthropicKey) this.enhanceProviders.push(new AnthropicProvider(anthropicKey));
      if (qwenKey) this.enhanceProviders.push(new QwenProvider(qwenKey, config.qwenModel));
      if (geminiKey) this.enhanceProviders.push(new GeminiProvider(geminiKey));
      if (groqKey) this.enhanceProviders.push(new GroqProvider(groqKey));
      if (openRouterKey)
        this.enhanceProviders.push(new OpenRouterProvider(openRouterKey, config.openRouterModel));
    }
  }

  async transcribe(
    audioBlob: Blob,
    languagePrompt: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    let lastError: any;
    for (const provider of this.transcribeProviders) {
      try {
        return await provider.transcribe(audioBlob, languagePrompt);
      } catch (err) {
        console.error(`Provider ${provider.name} failed:`, err);
        lastError = err;
      }
    }
    throw lastError || new Error('No transcription providers available. Check your API keys.');
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    let lastError: any;
    for (const provider of this.enhanceProviders) {
      try {
        return await provider.enhance(text, customPrompt);
      } catch (err) {
        console.error(`Provider ${provider.name} failed:`, err);
        lastError = err;
      }
    }
    throw lastError || new Error('No enhancement providers available. Check your API keys.');
  }
}
