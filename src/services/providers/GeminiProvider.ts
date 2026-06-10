import { GoogleGenAI } from '@google/genai';
import { AIProvider, ModelMetadata } from '../../types';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private ai: GoogleGenAI;
  private modelName = 'gemini-3-flash-preview';

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async transcribe(
    audioBlob: Blob,
    languagePrompt: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const reader = new FileReader();
    const base64Data = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(audioBlob);
    });

    const strictRule =
      "STRICT RULE: Return ONLY the transcribed text. Do NOT include introductions, explanations, or phrases like 'Here is the transcription'. Only the exact audio text.";
    const promptText =
      languagePrompt === 'auto'
        ? `Detect the spoken language in this audio. Transcribe exactly what is said, responding in the same language you detect — do NOT translate. ${strictRule}`
        : `Transcribe exactly what is said in this audio in ${languagePrompt}. ${strictRule}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [
        {
          parts: [
            { text: promptText },
            { inlineData: { mimeType: audioBlob.type, data: base64Data } },
          ],
        },
      ],
    });

    return {
      text: response.text || '',
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }

  async enhance(
    text: string,
    customPrompt?: string
  ): Promise<{ text: string; metadata: ModelMetadata }> {
    const prompt = customPrompt
      ? `${customPrompt}\n\nTRANSCRIPT: "${text}"`
      : `Act as an expert executive assistant. Transform this transcript into a professional, structured note. TRANSCRIPT: "${text}"`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return {
      text: response.text || text,
      metadata: { modelName: this.modelName, providerName: this.name },
    };
  }
}
