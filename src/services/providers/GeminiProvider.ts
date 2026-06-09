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
      "REGLA ESTRICTA: Devuelve ÚNICAMENTE el texto transcrito. NO incluyas introducciones, explicaciones, ni frases como 'Aquí tienes la transcripción'. Solo el texto exacto del audio.";
    const promptText =
      languagePrompt === 'auto'
        ? `Transcribe exactamente lo que se dice en este audio en el idioma que detectes. ${strictRule}`
        : `Transcribe exactamente lo que se dice en este audio en ${languagePrompt}. ${strictRule}`;

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
      ? `${customPrompt}\n\nTRANSCRIPCIÓN: "${text}"`
      : `Actúa como un asistente ejecutivo experto. Transforma esta transcripción en una nota profesional y estructurada. TRANSCRIPCIÓN: "${text}"`;

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
