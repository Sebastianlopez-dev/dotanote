import { GoogleGenAI } from '@google/genai';
import { ModelMetadata } from '../types';

export type TranscriptionModel = 'gemini' | 'local';

export interface TranscriptionResult {
  text: string;
  enhancedText?: string;
  metadata?: ModelMetadata;
  timestamp: number;
  id: string;
  isPinned?: boolean;
  isEnhancing?: boolean;
}

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en el panel de Secretos.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function transcribeWithGemini(
  audioBlob: Blob,
  languagePrompt: string
): Promise<string> {
  const genAI = getAI();

  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(audioBlob);
  });

  const base64Data = await base64Promise;

  const strictRule =
    "REGLA ESTRICTA: Devuelve ÚNICAMENTE el texto transcrito. NO incluyas introducciones, explicaciones, ni frases como 'Aquí tienes la transcripción'. Solo el texto exacto del audio.";
  const promptText =
    languagePrompt === 'auto'
      ? `Transcribe exactamente lo que se dice en este audio en el idioma que detectes. Si no hay voz, devuelve un espacio vacío. ${strictRule}`
      : `Transcribe exactamente lo que se dice en este audio en ${languagePrompt}. Si no hay voz, devuelve un espacio vacío. ${strictRule}`;

  const response = await genAI.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: audioBlob.type,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  return response.text || '';
}

export async function enhanceTranscription(text: string): Promise<string> {
  const genAI = getAI();

  const prompt = `
    Actúa como un asistente ejecutivo experto. 
    Toma la siguiente transcripción de voz (que puede tener errores de puntuación o muletillas) y transfórmala en una nota útil, profesional y estructurada.
    
    REGLAS:
    1. Si es una idea corta, conviértela en un mensaje empresarial claro (estilo Slack/Email).
    2. Si es una explicación larga, crea un resumen ejecutivo con puntos clave (bullet points).
    3. Elimina muletillas ("eh", "este", "bueno") y corrige la gramática.
    4. Mantén el idioma original de la transcripción.
    5. Sé extremadamente conciso y directo.
    
    TRANSCRIPCIÓN:
    "${text}"
    
    RESULTADO OPTIMIZADO:
  `;

  const response = await genAI.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || text;
}

// Web Speech API wrapper for "local" option
export class LocalTranscriber {
  private recognition: any;
  private onResult: (text: string) => void;
  private onEnd: () => void;

  constructor(onResult: (text: string) => void, onEnd: () => void) {
    this.onResult = onResult;
    this.onEnd = onEnd;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.onResult(transcript);
      };

      this.recognition.onend = () => {
        this.onEnd();
      };
    }
  }

  setLang(langCode: string) {
    if (this.recognition) {
      this.recognition.lang = langCode || 'es-ES';
    }
  }

  start() {
    if (this.recognition) {
      this.recognition.start();
    } else {
      throw new Error('Tu navegador no soporta la API de reconocimiento de voz local.');
    }
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
