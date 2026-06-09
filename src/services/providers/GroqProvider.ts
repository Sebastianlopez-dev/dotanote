import { AIProvider, ModelMetadata } from '../../types';

export class GroqProvider implements AIProvider {
  name = 'Groq';
  private apiKey: string;
  private modelName = 'llama-3.3-70b-versatile'; // High quality for enhancement
  private whisperModel = 'whisper-large-v3'; // For transcription

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(
    audioBlob: Blob,
    languagePrompt: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', this.whisperModel);

    if (languagePrompt !== 'auto') {
      // Note: Groq expects ISO codes or names depending on the model,
      // but let's pass it as a prompt for better results.
      formData.append('prompt', `The audio is in ${languagePrompt}. Transcribe it exactly.`);
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Groq Transcription failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      text: data.text || '',
      metadata: { modelName: this.whisperModel, providerName: this.name },
    };
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const prompt = customPrompt
      ? `${customPrompt}\n\nTRANSCRIPCIÓN: "${text}"`
      : `Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada. TRANSCRIPCIÓN: "${text}"`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente ejecutivo de alto nivel que resume y organiza notas de voz con precisión extrema.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Groq Enhancement failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content || text,
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }
}
