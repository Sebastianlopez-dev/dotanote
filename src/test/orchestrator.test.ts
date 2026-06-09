import { describe, it, expect, vi } from 'vitest';
import { AIOrchestrator } from '../services/AIOrchestrator';
import { AIProvider, AIConfig, ModelMetadata } from '../types';
import { GroqProvider } from '../services/providers/GroqProvider';
import { GeminiProvider } from '../services/providers/GeminiProvider';
import { AnthropicProvider } from '../services/providers/AnthropicProvider';
import { QwenProvider } from '../services/providers/QwenProvider';
import { OpenRouterProvider } from '../services/providers/OpenRouterProvider';

function createMockProvider(
  name: string,
  overrides?: Partial<AIProvider>
): AIProvider {
  return {
    name,
    transcribe: vi
      .fn()
      .mockResolvedValue({
        text: 'mocked',
        metadata: { modelName: 'mock', providerName: name },
      }),
    enhance: vi
      .fn()
      .mockResolvedValue({
        text: 'mocked',
        metadata: { modelName: 'mock', providerName: name },
      }),
    ...overrides,
  };
}

function getTranscribeProviders(orchestrator: AIOrchestrator): AIProvider[] {
  return (orchestrator as any).transcribeProviders;
}

function getEnhanceProviders(orchestrator: AIOrchestrator): AIProvider[] {
  return (orchestrator as any).enhanceProviders;
}

describe('Provider Priority Ordering', () => {
  it('registers Groq then Gemini for transcription when all keys are present', () => {
    const config: AIConfig = {
      useCustomKeys: true,
      groqKey: 'groq-key',
      geminiKey: 'gemini-key',
    };
    const orchestrator = new AIOrchestrator(config);
    const providers = getTranscribeProviders(orchestrator);
    expect(providers).toHaveLength(2);
    expect(providers[0]).toBeInstanceOf(GroqProvider);
    expect(providers[1]).toBeInstanceOf(GeminiProvider);
  });

  it('skips Groq when only Gemini key is present', () => {
    const config: AIConfig = {
      useCustomKeys: true,
      geminiKey: 'gemini-key',
    };
    const orchestrator = new AIOrchestrator(config);
    const providers = getTranscribeProviders(orchestrator);
    expect(providers).toHaveLength(1);
    expect(providers[0]).toBeInstanceOf(GeminiProvider);
  });

  it('registers enhancement providers in correct order when all keys are present', () => {
    const config: AIConfig = {
      useCustomKeys: true,
      anthropicKey: 'anthropic-key',
      qwenKey: 'qwen-key',
      geminiKey: 'gemini-key',
      groqKey: 'groq-key',
      openRouterKey: 'openrouter-key',
    };
    const orchestrator = new AIOrchestrator(config);
    const providers = getEnhanceProviders(orchestrator);
    expect(providers).toHaveLength(5);
    expect(providers[0]).toBeInstanceOf(AnthropicProvider);
    expect(providers[1]).toBeInstanceOf(QwenProvider);
    expect(providers[2]).toBeInstanceOf(GeminiProvider);
    expect(providers[3]).toBeInstanceOf(GroqProvider);
    expect(providers[4]).toBeInstanceOf(OpenRouterProvider);
  });
});

describe('Circuit Breaker Fallback', () => {
  it('returns first provider result when it succeeds', async () => {
    const first = createMockProvider('First');
    const second = createMockProvider('Second');
    const orchestrator = new AIOrchestrator(
      { useCustomKeys: false },
      {
        createTranscribeProviders: () => [first, second],
      }
    );
    const result = await orchestrator.transcribe(new Blob(), 'en');
    expect(result.metadata.providerName).toBe('First');
    expect(first.transcribe).toHaveBeenCalledOnce();
    expect(second.transcribe).not.toHaveBeenCalled();
  });

  it('tries next provider when first fails', async () => {
    const first = createMockProvider('First', {
      transcribe: vi
        .fn()
        .mockRejectedValue(new Error('First failed')),
    });
    const second = createMockProvider('Second');
    const orchestrator = new AIOrchestrator(
      { useCustomKeys: false },
      {
        createTranscribeProviders: () => [first, second],
      }
    );
    const result = await orchestrator.transcribe(new Blob(), 'en');
    expect(result.metadata.providerName).toBe('Second');
    expect(first.transcribe).toHaveBeenCalledOnce();
    expect(second.transcribe).toHaveBeenCalledOnce();
  });

  it('throws last error when all providers fail', async () => {
    const first = createMockProvider('First', {
      transcribe: vi
        .fn()
        .mockRejectedValue(new Error('First failed')),
    });
    const second = createMockProvider('Second', {
      transcribe: vi
        .fn()
        .mockRejectedValue(new Error('Second failed')),
    });
    const orchestrator = new AIOrchestrator(
      { useCustomKeys: false },
      {
        createTranscribeProviders: () => [first, second],
      }
    );
    await expect(
      orchestrator.transcribe(new Blob(), 'en')
    ).rejects.toThrow('Second failed');
  });
});

describe('No Providers Available', () => {
  it('throws descriptive error when no transcription providers configured', async () => {
    const orchestrator = new AIOrchestrator({ useCustomKeys: false });
    await expect(
      orchestrator.transcribe(new Blob(), 'en')
    ).rejects.toThrow('No transcription providers available');
  });

  it('throws descriptive error when no enhancement providers configured', async () => {
    const orchestrator = new AIOrchestrator({ useCustomKeys: false });
    await expect(orchestrator.enhance('test')).rejects.toThrow(
      'No enhancement providers available'
    );
  });

  it('throws descriptive error when empty factory list provided', async () => {
    const orchestrator = new AIOrchestrator(
      { useCustomKeys: false },
      {
        createTranscribeProviders: () => [],
      }
    );
    await expect(
      orchestrator.transcribe(new Blob(), 'en')
    ).rejects.toThrow('No transcription providers available');
  });
});

describe('Error Aggregation', () => {
  it('preserves the last error message when all providers fail', async () => {
    const first = createMockProvider('First', {
      enhance: vi
        .fn()
        .mockRejectedValue(new Error('First error')),
    });
    const second = createMockProvider('Second', {
      enhance: vi
        .fn()
        .mockRejectedValue(new Error('Second error')),
    });
    const orchestrator = new AIOrchestrator(
      { useCustomKeys: false },
      {
        createEnhanceProviders: () => [first, second],
      }
    );
    await expect(orchestrator.enhance('test')).rejects.toThrow(
      'Second error'
    );
  });
});

describe('Config-based Initialization', () => {
  it('produces different provider sets based on config keys', () => {
    const fullConfig: AIConfig = {
      useCustomKeys: true,
      groqKey: 'groq-key',
      geminiKey: 'gemini-key',
    };
    const partialConfig: AIConfig = {
      useCustomKeys: true,
      geminiKey: 'gemini-key',
    };
    const full = new AIOrchestrator(fullConfig);
    const partial = new AIOrchestrator(partialConfig);
    expect(getTranscribeProviders(full)).toHaveLength(2);
    expect(getTranscribeProviders(partial)).toHaveLength(1);
  });

  it('calls factory with provided config', () => {
    const factoryConfig = vi.fn().mockReturnValue([]);
    const config: AIConfig = { useCustomKeys: true, groqKey: 'test' };
    new AIOrchestrator(config, {
      createTranscribeProviders: factoryConfig,
    });
    expect(factoryConfig).toHaveBeenCalledWith(config);
  });
});
