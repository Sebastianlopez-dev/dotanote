import { AIProvider, ModelMetadata } from '../../types';

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'meta-llama/llama-3.1-70b-instruct:free') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async transcribe(): Promise<{ text: string; metadata: ModelMetadata }> {
    throw new Error('OpenRouter does not support direct audio transcription yet. Use Groq/Gemini.');
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const prompt = customPrompt
      ? `${customPrompt}\n\nTRANSCRIPCIÓN: "${text}"`
      : `Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada. TRANSCRIPCIÓN: "${text}"`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://dotanote.app', // Optional but helps OpenRouter
        'X-Title': 'dotanote',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter Enhancement failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || text,
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }
}
