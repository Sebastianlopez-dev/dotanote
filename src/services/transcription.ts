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
