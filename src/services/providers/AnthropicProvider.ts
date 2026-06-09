import { AIProvider, ModelMetadata } from '../../types';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private apiKey: string;
  private modelName = 'claude-3-5-sonnet-latest';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Anthropic doesn't have a direct speech-to-text API like Groq/Whisper,
  // so it won't be used for transcribing unless we use a third party.
  // We'll focus on Enhancement.
  async transcribe(): Promise<{ text: string; metadata: ModelMetadata }> {
    throw new Error('Anthropic does not support direct transcription. Using as fallback/enhancer.');
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const prompt = customPrompt
      ? `${customPrompt}\n\nTRANSCRIPCIÓN: "${text}"`
      : `Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada. TRANSCRIPCIÓN: "${text}"`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'dangerously-allow-browser': 'true', // Note: This is an internal header for some clients, but we use standard fetch.
      },
      body: JSON.stringify({
        model: this.modelName,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic Enhancement failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      text: data.content[0]?.text || text,
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }
}
