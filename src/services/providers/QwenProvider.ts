import { AIProvider, ModelMetadata } from '../../types';

export class QwenProvider implements AIProvider {
  name = 'Qwen';
  private apiKey: string;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'qwen-max') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async transcribe(): Promise<{ text: string; metadata: ModelMetadata }> {
    throw new Error('Direct Qwen API does not support transcription yet. Use Groq/Gemini.');
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const prompt = customPrompt
      ? `${customPrompt}\n\nTRANSCRIPT: "${text}"`
      : `Act as an expert executive assistant. Transform this transcript into a professional, structured note. TRANSCRIPT: "${text}"`;

    // Qwen (Alibaba Dashscope) has an OpenAI compatible endpoint
    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Qwen Enhancement failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || text,
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }
}
