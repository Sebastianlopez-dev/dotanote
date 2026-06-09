import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Square,
  Settings,
  History,
  Copy,
  Trash2,
  Keyboard,
  Check,
  AlertCircle,
  Volume2,
  Cpu,
  Globe,
  ChevronLeft,
  Upload,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TranscriptFeed } from './components/TranscriptFeed';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsWindow } from './components/Settings';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AudioSettings, GeneralSettings, ModelMetadata, MagicFormat, AIConfig } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import {
  createDefaultAIConfig,
  createDefaultGeneralSettings,
  createDefaultMagicFormats,
  loadAIConfig,
  loadGeneralSettings,
  loadMagicFormats,
} from './lib/settings';
import {
  addHistoryEntry,
  deleteHistoryEntry,
  togglePin as togglePinEntry,
  loadHistory,
  saveHistory,
  clearHistory,
} from './lib/history';
import {
  LocalTranscriber,
  TranscriptionResult,
  TranscriptionModel,
} from './services/transcription';
import { AIOrchestrator } from './services/AIOrchestrator';

const LANGUAGES = [
  { id: 'en', label: 'EN', localCode: 'en-US', geminiPrompt: 'inglés' },
  { id: 'es', label: 'ES', localCode: 'es-ES', geminiPrompt: 'español' },
  { id: 'fr', label: 'FR', localCode: 'fr-FR', geminiPrompt: 'francés' },
  { id: 'pt', label: 'PT', localCode: 'pt-BR', geminiPrompt: 'portugués' },
  { id: 'auto', label: 'AUTO', localCode: '', geminiPrompt: 'auto' },
];

export default function App() {
  // State
  const [activeView, setActiveView] = useState<'home' | 'settings'>('home');
  const [isRecording, setIsRecording] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [history, setHistory] = useState<TranscriptionResult[]>(loadHistory);
  const [model, setModel] = useState<TranscriptionModel>('gemini');
  const [hotkey, setHotkey] = useState('r'); // Default Alt + R
  const [autoCopy, setAutoCopy] = useState(true);
  const [langIndex, setLangIndex] = useState(1); // Default ES
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState('General');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem('sidebarOpen') !== 'false'
  );
  const [dashboardOpen, setDashboardOpen] = useState(
    () => localStorage.getItem('dashboardOpen') !== 'false'
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [orchestrator, setOrchestrator] = useState<AIOrchestrator | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [magicFormats, setMagicFormats] = useState<MagicFormat[]>(loadMagicFormats);

  useEffect(() => {
    localStorage.setItem('vnote_formats', JSON.stringify(magicFormats));
  }, [magicFormats]);

  const [aiConfig, setAiConfig] = useState<AIConfig>(loadAIConfig);

  useEffect(() => {
    localStorage.setItem('vnote_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    const config = {
      ...aiConfig,
      geminiKey: aiConfig.useCustomKeys ? aiConfig.geminiKey : import.meta.env.VITE_GEMINI_API_KEY,
      groqKey: aiConfig.useCustomKeys ? aiConfig.groqKey : import.meta.env.VITE_GROQ_API_KEY,
    };

    setOrchestrator(new AIOrchestrator(config));
  }, [aiConfig]);

  const addToast = (
    type: ToastMessage['type'],
    title: string,
    description: string,
    links?: ToastMessage['links']
  ) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, description, links }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    noiseSuppression: true,
    autoGainControl: true,
    vadSensitivity: 50,
    monitoring: false,
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(loadGeneralSettings);

  useEffect(() => {
    localStorage.setItem('vnote_general_settings', JSON.stringify(generalSettings));
  }, [generalSettings]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('dashboardOpen', String(dashboardOpen));
  }, [dashboardOpen]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const localTranscriberRef = useRef<LocalTranscriber | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const capsuleDotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const capsuleContainerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    barsRef.current.forEach((bar) => {
      if (bar) bar.style.transform = 'scaleY(1)';
    });
    capsuleDotsRef.current.forEach((dot) => {
      if (dot) dot.style.height = '4px';
    });
  }, []);

  const setupVisualizer = useCallback((stream: MediaStream) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalizedVol = Math.min(average / 100, 1);

      if (barsRef.current[0]) {
        const val = dataArray[10] / 255;
        barsRef.current[0].style.transform = `scaleY(${1 + val * 2.5})`;
      }
      if (barsRef.current[1]) {
        const val = dataArray[30] / 255;
        barsRef.current[1].style.transform = `scaleY(${1 + val * 3.5})`;
      }
      if (barsRef.current[2]) {
        const val = dataArray[50] / 255;
        barsRef.current[2].style.transform = `scaleY(${1 + val * 2.5})`;
      }

      const bins = [5, 10, 15, 20, 25, 30, 35, 40, 45];
      bins.forEach((bin, i) => {
        if (capsuleDotsRef.current[i]) {
          const val = dataArray[bin] / 255;
          // Los puntos se estiran verticalmente de 3px a 12px
          capsuleDotsRef.current[i].style.height = `${3 + val * 9}px`;
        }
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Detect OS
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Hotkey listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PTT: Alt/Option + Z
      if ((isMac ? e.metaKey : e.altKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (!isRecording) startRecording();
      }
      // Toggle: Ctrl + Space
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        toggleRecording();
      }
      // Sidebar: Cmd/Ctrl + J
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Dashboard: Cmd/Ctrl + L
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setDashboardOpen((prev) => !prev);
      }
      // Focus Mode: Cmd/Ctrl + K
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const isAnyOpen = sidebarOpen || dashboardOpen;
        setSidebarOpen(!isAnyOpen);
        setDashboardOpen(!isAnyOpen);
      }
      // Settings: Cmd/Ctrl + P or Cmd/Ctrl + ,
      if ((isMac ? e.metaKey : e.ctrlKey) && (e.key.toLowerCase() === 'p' || e.key === ',')) {
        e.preventDefault();
        if (activeView === 'settings' && settingsCategory === 'General') {
          setActiveView('home');
        } else {
          setSettingsCategory('General');
          setActiveView('settings');
        }
      }
      // Magic Formats: Cmd/Ctrl + N
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (activeView === 'settings' && settingsCategory === 'Magic Formats') {
          setActiveView('home');
        } else {
          setSettingsCategory('Magic Formats');
          setActiveView('settings');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // PTT: Stop on keyup
      if ((isMac ? e.metaKey : e.altKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (isRecording) stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isMac, sidebarOpen, dashboardOpen, activeView, settingsCategory]);

  const startRecording = async () => {
    if (!orchestrator) {
      setError('Orchestrator no inicializado.');
      return;
    }
    setError(null);
    setCurrentText('');
    const currentLang = LANGUAGES[langIndex];

    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: audioSettings.deviceId ? { exact: audioSettings.deviceId } : undefined,
          noiseSuppression: audioSettings.noiseSuppression,
          echoCancellation: true,
          autoGainControl: audioSettings.autoGainControl,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setupVisualizer(stream);

      // Handle Monitoring
      if (audioSettings.monitoring && audioContextRef.current) {
        const monitorSource = audioContextRef.current.createMediaStreamSource(stream);
        monitorSource.connect(audioContextRef.current.destination);
      }

      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      if (model === 'local') {
        if (!localTranscriberRef.current) {
          localTranscriberRef.current = new LocalTranscriber(
            (text) => setCurrentText(text),
            () => {
              setIsRecording(false);
              stopVisualizer();
            }
          );
        }
        localTranscriberRef.current.setLang(currentLang.localCode);
        localTranscriberRef.current.start();
      } else {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            if (!orchestrator) throw new Error('Orchestrator no inicializado.');
            const { text, metadata } = await orchestrator.transcribe(
              audioBlob,
              currentLang.geminiPrompt
            );
            if (text.trim()) {
              addResult(text, metadata);
            } else {
              setError('No se detectó voz clara.');
            }
          } catch (err: any) {
            console.error('Cloud transcription failed, falling back to local:', err);
            addToast(
              'warning',
              'Cloud Provider Failure',
              'Falling back to Local Transcription. Your tokens may be depleted.',
              [
                { label: 'Claude.ai', url: 'https://claude.ai' },
                { label: 'OpenRouter', url: 'https://openrouter.ai' },
              ]
            );

            // Start Local Fallback
            if (!localTranscriberRef.current) {
              localTranscriberRef.current = new LocalTranscriber(
                (text) => setCurrentText(text),
                () => {
                  setIsRecording(false);
                  stopVisualizer();
                }
              );
            }
            // Since we already have the blob, local transcriber isn't helpful for PAST audio,
            // but we can at least inform the user.
            setError('Cloud failed. Try recording again in Local mode or check your API keys.');
          } finally {
            setIsProcessing(false);
          }
        };

        mediaRecorder.start();
      }
      setIsRecording(true);
    } catch (err: any) {
      setError('No se pudo acceder al micrófono. Por favor, concede los permisos.');
      console.error(err);
    }
  };

  const stopRecording = (discard: boolean = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (!discard) {
      setIsProcessing(true);
    }

    if (model === 'local') {
      localTranscriberRef.current?.stop();
      if (!discard && currentText.trim()) {
        addResult(currentText);
      }
      setIsProcessing(false);
    } else {
      mediaRecorderRef.current?.stop();
      if (discard) {
        // Clear audio chunks
        audioChunksRef.current = [];
        setIsProcessing(false);
      }
    }
    stopVisualizer();
    setIsRecording(false);
    setCurrentText('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const addResult = (text: string, metadata?: ModelMetadata) => {
    const newEntry = addHistoryEntry([], text, metadata)[0];
    setHistory((prev) => [newEntry, ...prev]);
    setCurrentText('');

    if (autoCopy) {
      navigator.clipboard.writeText(text);
      setCopiedId(newEntry.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteResult = (id: string) => {
    setHistory((prev) => deleteHistoryEntry(prev, id));
  };

  const handleTogglePin = (id: string) => {
    setHistory((prev) => togglePinEntry(prev, id));
  };

  const handleEnhance = async (id: string, formatId?: string) => {
    const item = history.find((h) => h.id === id);
    if (!item || item.enhancedText || item.isEnhancing || !orchestrator) return;

    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, isEnhancing: true } : h)));

    try {
      const format = formatId
        ? magicFormats.find((f) => f.id === formatId)
        : magicFormats.find((f) => f.isDefault);
      const customPrompt = format?.prompt;

      const { text, metadata } = await orchestrator.enhance(item.text, customPrompt);
      setHistory((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                enhancedText: text,
                metadata: metadata,
                isEnhancing: false,
              }
            : h
        )
      );

      if (autoCopy) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err: any) {
      console.error('Error enhancing transcription:', err);
      setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, isEnhancing: false } : h)));

      const isQuota =
        err.message?.toLowerCase().includes('quota') || err.message?.toLowerCase().includes('429');

      addToast(
        'error',
        isQuota ? 'Quota Exceeded' : 'Enhancement Failed',
        isQuota ? 'Your provider tokens are depleted.' : 'All cloud enhancers failed to respond.',
        [
          { label: 'Claude.ai', url: 'https://claude.ai' },
          { label: 'Qwen', url: 'https://openrouter.ai/models/qwen/qwen-2.5-72b-instruct' },
        ]
      );
      setError(isQuota ? 'Tokens agotados. Revisa tu cuenta.' : 'Error en el Magic Format.');
    }
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
    setIsClearModalOpen(false);
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB (aprox. 2 minutos).');
      return;
    }

    const validExtensions = [
      '.mp3',
      '.wav',
      '.m4a',
      '.aac',
      '.ogg',
      '.opus',
      '.flac',
      '.webm',
      '.amr',
    ];
    const isAudio =
      file.type.startsWith('audio/') ||
      file.type === 'video/ogg' ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isAudio) {
      setError('Formato no soportado. Por favor, sube solo archivos de audio.');
      return;
    }

    if (!orchestrator) {
      setError('Orchestrator no inicializado.');
      return;
    }

    setIsProcessingFile(true);
    setError(null);

    try {
      const currentLang = LANGUAGES[langIndex];
      const { text, metadata } = await orchestrator.transcribe(file, currentLang.geminiPrompt);
      if (text.trim()) {
        addResult(text, metadata);
      } else {
        setError('No se detectó voz clara en el archivo.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo de audio.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className="h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans flex"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
        accept="audio/*,.ogg,.opus,.m4a,.aac,.mp3,.wav,.webm"
        className="hidden"
      />
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onNavigate={setActiveView}
        aiConfig={aiConfig}
      />

      <main className="flex-1 flex overflow-hidden relative">
        {activeView === 'settings' ? (
          <SettingsWindow
            onClose={() => setActiveView('home')}
            audioSettings={audioSettings}
            setAudioSettings={setAudioSettings}
            generalSettings={generalSettings}
            setGeneralSettings={setGeneralSettings}
            magicFormats={magicFormats}
            setMagicFormats={setMagicFormats}
            aiConfig={aiConfig}
            setAiConfig={setAiConfig}
            initialCategory={settingsCategory}
          />
        ) : (
          <>
            <TranscriptFeed
              history={history}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              onPin={handleTogglePin}
              onDelete={deleteResult}
              onCopy={copyToClipboard}
              onEnhance={handleEnhance}
              copiedId={copiedId}
              onUploadClick={() => fileInputRef.current?.click()}
              isProcessingFile={isProcessingFile}
              magicFormats={magicFormats}
            />
            <AnimatePresence mode="wait">
              {dashboardOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full"
                >
                  <StatsDashboard
                    isOpen={dashboardOpen}
                    setIsOpen={setDashboardOpen}
                    history={history}
                  />
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDashboardOpen(true)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-[#151619] border border-white/5 rounded-l-full text-white/50 hover:text-white z-10 shadow-lg"
                >
                  <ChevronLeft size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-purple-500/10 backdrop-blur-sm border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center m-4 pointer-events-none"
          >
            <div className="bg-[#141414] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-white/10">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Upload size={40} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Suelta tu audio aquí</h2>
              <p className="text-white/50 text-sm text-center max-w-xs">
                Soporta MP3, WAV, M4A, OGG, OPUS (WhatsApp)
                <br />
                Máximo 10MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Capsule Area */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        {/* Recording Capsule */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn(
            'flex items-center justify-center overflow-hidden transition-colors cursor-pointer',
            isRecording || isProcessing
              ? 'bg-[#0a0a0a] rounded-full border border-white/10 h-8 px-1 w-56 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
              : 'bg-transparent h-8 w-16'
          )}
          onClick={() => {
            if (!isRecording && !isProcessing) toggleRecording();
          }}
        >
          <AnimatePresence mode="wait">
            {isRecording || isProcessing ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="flex gap-3 items-center px-1 w-full justify-between"
              >
                {/* Language Selector (Inside Capsule) */}
                <div className="relative group shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isProcessing) setLangIndex((prev) => (prev + 1) % LANGUAGES.length);
                    }}
                    disabled={isProcessing}
                    className={cn(
                      'w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/80 transition-colors border border-white/5',
                      isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                    )}
                  >
                    {LANGUAGES[langIndex].id === 'auto' ? (
                      <Globe size={12} />
                    ) : (
                      <span className="text-[8px] font-mono font-bold">
                        {LANGUAGES[langIndex].label}
                      </span>
                    )}
                  </button>
                  {/* Instant Tooltip */}
                  {!isProcessing && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1a1a1a] border border-white/10 rounded text-[10px] text-white/70 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-75">
                      Cambiar idioma
                    </div>
                  )}
                </div>

                {/* Timer & Live Dot */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <motion.div
                    animate={isProcessing ? { opacity: 0.3 } : { opacity: [1, 0.3, 1] }}
                    transition={isProcessing ? {} : { repeat: Infinity, duration: 1.5 }}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]',
                      isProcessing ? 'bg-red-500/50 shadow-none' : 'bg-red-500'
                    )}
                  />
                  <span
                    className={cn(
                      'font-mono text-xs tracking-wider transition-colors',
                      isProcessing ? 'text-white/50' : 'text-white'
                    )}
                  >
                    {formatTime(recordingTime)}
                  </span>
                </div>

                {/* Visualizer */}
                <div className="flex gap-[2px] items-center h-4 shrink-0">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        capsuleDotsRef.current[i] = el;
                      }}
                      className={cn(
                        'w-[2px] rounded-full transition-all duration-75 ease-out',
                        isProcessing ? 'bg-red-500/30' : 'bg-red-500'
                      )}
                      style={{ height: '3px' }}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 border-l border-white/10 pl-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isProcessing) stopRecording(true);
                    }}
                    disabled={isProcessing}
                    className={cn(
                      'w-6 h-6 flex items-center justify-center rounded-full transition-colors',
                      isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
                    )}
                  >
                    <Trash2
                      size={12}
                      className={cn(
                        isProcessing ? 'text-white/30' : 'text-white/50 hover:text-red-400'
                      )}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isProcessing) stopRecording(false);
                    }}
                    disabled={isProcessing}
                    className="w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    {isProcessing ? (
                      <div className="relative flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.5)]" />
                        <div className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
                      </div>
                    ) : (
                      <Check
                        size={14}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      />
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full shrink-0" />
                <div className="h-1 w-6 bg-white/20 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Notifications */}
      <ToastContainer messages={toasts} onRemove={removeToast} />
    </div>
  );
}
