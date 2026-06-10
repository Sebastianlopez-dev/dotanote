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
      formData.append('prompt', `The audio is in ${languagePrompt}. Transcribe it exactly.`);
    } else {
      formData.append('prompt', 'Detect the spoken language. Transcribe exactly what is said in the detected language.');
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
      ? `${customPrompt}\n\nTRANSCRIPT: "${text}"`
      : `Act as an expert executive assistant. Transform this transcript into a professional, structured note. TRANSCRIPT: "${text}"`;

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
              'You are a high-level executive assistant who summarizes and organizes voice notes with extreme precision.',
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
