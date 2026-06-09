import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Volume2,
  Keyboard,
  ChevronLeft,
  Mic,
  Speaker,
  Edit2,
  Sparkles,
  Pin,
  Cpu,
  ExternalLink,
  ShieldCheck,
  Zap,
  DownloadCloud,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  AudioSettings as AudioSettingsType,
  MagicFormat,
  AIConfig,
  GeneralSettings as GeneralSettingsType,
} from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  onClose: () => void;
  audioSettings: AudioSettingsType;
  setAudioSettings: React.Dispatch<React.SetStateAction<AudioSettingsType>>;
  generalSettings: GeneralSettingsType;
  setGeneralSettings: React.Dispatch<React.SetStateAction<GeneralSettingsType>>;
  magicFormats: MagicFormat[];
  setMagicFormats: React.Dispatch<React.SetStateAction<MagicFormat[]>>;
  aiConfig: AIConfig;
  setAiConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
  initialCategory?: string;
}

export function SettingsWindow({
  onClose,
  audioSettings,
  setAudioSettings,
  generalSettings,
  setGeneralSettings,
  magicFormats,
  setMagicFormats,
  aiConfig,
  setAiConfig,
  initialCategory = 'Audio',
}: SettingsProps) {
  const [activeCategory, setActiveCategory] = React.useState(initialCategory);

  const categories = [
    { name: 'General', icon: <Settings size={18} /> },
    { name: 'Audio', icon: <Volume2 size={18} /> },
    { name: 'Magic Formats', icon: <Sparkles size={18} /> },
    { name: 'AI Providers', icon: <Cpu size={18} /> },
    { name: 'Shortcuts', icon: <Keyboard size={18} /> },
    { name: 'Account', icon: <User size={18} /> },
  ];

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] z-50 flex flex-col">
      <header className="p-8 border-b border-white/5 flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full text-white/70 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-64 border-r border-white/5 p-4 space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                activeCategory === cat.name
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              {cat.icon}
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </nav>

        <main className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">{activeCategory}</h2>
          {activeCategory === 'General' ? (
            <GeneralSettings settings={generalSettings} onUpdate={setGeneralSettings} />
          ) : activeCategory === 'Audio' ? (
            <AudioSettings settings={audioSettings} onUpdate={setAudioSettings} />
          ) : activeCategory === 'Magic Formats' ? (
            <MagicFormatsSettings formats={magicFormats} setFormats={setMagicFormats} />
          ) : activeCategory === 'AI Providers' ? (
            <AIProvidersSettings config={aiConfig} setConfig={setAiConfig} />
          ) : activeCategory === 'Shortcuts' ? (
            <ShortcutSettings />
          ) : activeCategory === 'Account' ? (
            <AccountSettings />
          ) : (
            <div className="text-white/50">{activeCategory} settings content will go here.</div>
          )}
        </main>
      </div>
    </div>
  );
}

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = useState([
    { id: 'rec', label: 'Start/Stop Recording', keys: 'Ctrl + Space' },
    { id: 'side', label: 'Toggle Sidebar', keys: 'Cmd + J' },
    { id: 'dash', label: 'Toggle Dashboard', keys: 'Cmd + L' },
    { id: 'focus', label: 'Focus Mode (Toggle Panels)', keys: 'Cmd + K' },
    { id: 'settings', label: 'Open Settings', keys: 'Cmd + P / Cmd + ,' },
    { id: 'magic', label: 'Open Magic Formats', keys: 'Cmd + N' },
  ]);
  const [capturingId, setCapturingId] = useState<string | null>(null);

  const startCapture = (id: string) => {
    setCapturingId(id);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-4">
        {shortcuts.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-sm text-white">{s.label}</span>
            <button
              onClick={() => startCapture(s.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-colors',
                capturingId === s.id
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              {capturingId === s.id ? 'Press new keys...' : s.keys}
              <Edit2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AudioSettings({
  settings,
  onUpdate,
}: {
  settings: AudioSettingsType;
  onUpdate: React.Dispatch<React.SetStateAction<AudioSettingsType>>;
}) {
  const [devices, setDevices] = useState<{ input: MediaDeviceInfo[]; output: MediaDeviceInfo[] }>({
    input: [],
    output: [],
  });

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setDevices({
        input: devices.filter((d) => d.kind === 'audioinput'),
        output: devices.filter((d) => d.kind === 'audiooutput'),
      });
    });
  }, []);

  const updateSetting = (key: keyof AudioSettingsType, value: any) => {
    onUpdate((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 max-w-xl">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/70">Essential Audio Devices</h3>
        <div className="space-y-3">
          <Select
            label="Input Device (Microphone)"
            value={settings.deviceId || ''}
            onChange={(val) => updateSetting('deviceId', val)}
            options={devices.input.map((d) => ({
              value: d.deviceId,
              label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
            }))}
          />
          <Select
            label="Output Device (Speaker)"
            value={settings.outputId || ''}
            onChange={(val) => updateSetting('outputId', val)}
            options={devices.output.map((d) => ({
              value: d.deviceId,
              label: d.label || `Speaker ${d.deviceId.slice(0, 5)}`,
            }))}
          />
        </div>
      </div>

      <div className="border-b border-white/10" />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/70">Advanced Audio Settings</h3>
        <div className="space-y-4">
          <Toggle
            label="Noise Suppression"
            description="Reduce background noise."
            enabled={settings.noiseSuppression}
            onToggle={() => updateSetting('noiseSuppression', !settings.noiseSuppression)}
          />
          <Toggle
            label="Automatic Gain Control"
            description="Normalize input volume."
            enabled={settings.autoGainControl}
            onToggle={() => updateSetting('autoGainControl', !settings.autoGainControl)}
          />
          <Slider
            label="Voice Detection Sensitivity"
            value={settings.vadSensitivity}
            onChange={(val) => updateSetting('vadSensitivity', val)}
          />
          <Toggle
            label="Audio Monitoring"
            description="Hear your own voice."
            enabled={settings.monitoring}
            onToggle={() => updateSetting('monitoring', !settings.monitoring)}
          />
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/50">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#151619] border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-white/30"
      >
        <option value="">Default Device</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-white">{label}</div>
        {description && <div className="text-xs text-white/40">{description}</div>}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'w-10 h-5 rounded-full relative transition-colors',
          enabled ? 'bg-white' : 'bg-white/10 hover:bg-white/20'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-3 h-3 rounded-full transition-all',
            enabled ? 'left-6 bg-black' : 'left-1 bg-white'
          )}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white">{label}</span>
        <span className="text-white/50">{value}%</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}

function MagicFormatsSettings({
  formats,
  setFormats,
}: {
  formats: MagicFormat[];
  setFormats: React.Dispatch<React.SetStateAction<MagicFormat[]>>;
}) {
  const updateFormat = (id: string, updates: Partial<MagicFormat>) => {
    setFormats((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const togglePin = (id: string) => {
    const format = formats.find((f) => f.id === id);
    if (!format) return;

    if (format.isDefault) return; // Default is always pinned conceptually

    // Check if we are trying to pin and already have 3 pinned (excluding default)
    if (!format.isPinned) {
      const pinnedCount = formats.filter((f) => f.isPinned && !f.isDefault).length;
      if (pinnedCount >= 3) {
        alert('Puedes fijar un máximo de 3 formatos (además del Executive).');
        return;
      }
    }

    updateFormat(id, { isPinned: !format.isPinned });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-8">
        <h3 className="text-purple-400 font-medium flex items-center gap-2 mb-2">
          <Sparkles size={16} />
          ¿Qué es el Magic Format?
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          Son instrucciones personalizadas (prompts) que le dicen a la IA cómo debe reescribir tus
          transcripciones. Puedes fijar hasta 3 formatos para tenerlos accesibles rápidamente en el
          menú desplegable de cada nota.
        </p>
      </div>

      <div className="space-y-4">
        {formats.map((format) => (
          <div
            key={format.id}
            className="bg-[#151619] border border-white/10 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-white">{format.name}</h4>
                {format.isDefault && (
                  <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <button
                onClick={() => togglePin(format.id)}
                disabled={format.isDefault}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  format.isDefault
                    ? 'opacity-50 cursor-not-allowed text-yellow-500'
                    : format.isPinned
                      ? 'text-yellow-500 hover:bg-white/5'
                      : 'text-white/30 hover:text-white hover:bg-white/5'
                )}
                title={
                  format.isDefault
                    ? 'El formato por defecto siempre está activo'
                    : 'Fijar en el menú rápido'
                }
              >
                <Pin size={16} className={format.isPinned ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/50">Prompt (Instrucciones para la IA)</label>
              <textarea
                value={format.prompt}
                onChange={(e) => updateFormat(format.id, { prompt: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-sm text-white/80 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 resize-none h-24 transition-all"
                placeholder="Escribe las instrucciones aquí..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIProvidersSettings({
  config,
  setConfig,
}: {
  config: AIConfig;
  setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
}) {
  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-8 max-w-2xl px-1">
      {/* Mode Selection Card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border transition-all duration-500',
          config.useCustomKeys
            ? 'border-purple-500/50 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
            : 'border-white/10 bg-white/5'
        )}
      >
        <div className="p-6 flex items-start gap-4">
          <div
            className={cn(
              'p-3 rounded-xl transition-colors',
              config.useCustomKeys ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50'
            )}
          >
            {config.useCustomKeys ? <Zap size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-white">
                {config.useCustomKeys ? 'Custom API Mode Active' : 'Standard Mode (Free)'}
              </h3>
              <Toggle
                label=""
                enabled={config.useCustomKeys}
                onToggle={() => updateConfig({ useCustomKeys: !config.useCustomKeys })}
              />
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {config.useCustomKeys
                ? 'You are using your own API keys. Performance and limits depend on your provider level.'
                : 'Using standard developer keys. Great for quick use, but subject to shared rate limits.'}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {config.useCustomKeys && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="space-y-8 overflow-hidden pb-8"
          >
            {/* Primary Providers (Transcription focused) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">
                Primary Providers
              </h4>
              <div className="grid gap-4">
                {/* Groq */}
                <ProviderInput
                  label="Groq Cloud"
                  icon={<Zap size={16} className="text-orange-400" />}
                  placeholder="gsk_..."
                  value={config.groqKey}
                  onChange={(val) => updateConfig({ groqKey: val })}
                  helpUrl="https://console.groq.com/keys"
                />
                {/* Gemini */}
                <ProviderInput
                  label="Google Gemini"
                  icon={
                    <img
                      src="https://www.gstatic.com/lamda/images/favicon_v1_150160d1396b2aa7b663.ico"
                      className="w-4 h-4"
                      alt="Gemini"
                    />
                  }
                  placeholder="AIza..."
                  value={config.geminiKey}
                  onChange={(val) => updateConfig({ geminiKey: val })}
                  helpUrl="https://aistudio.google.com/app/apikey"
                />
              </div>
            </div>

            {/* Advanced Reasoning (Enhancement focused) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">
                Reasoning & Quality
              </h4>
              <div className="grid gap-4">
                {/* Claude */}
                <ProviderInput
                  label="Anthropic Claude"
                  icon={
                    <div className="w-4 h-4 bg-[#D97757] rounded-sm flex items-center justify-center text-[10px] font-bold text-white">
                      C
                    </div>
                  }
                  placeholder="sk-ant-..."
                  value={config.anthropicKey}
                  onChange={(val) => updateConfig({ anthropicKey: val })}
                  helpUrl="https://console.anthropic.com/"
                />
                {/* Qwen */}
                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <ProviderInput
                    label="Qwen (Alibaba)"
                    icon={
                      <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-[10px] font-bold text-white">
                        Q
                      </div>
                    }
                    placeholder="sk-..."
                    value={config.qwenKey}
                    onChange={(val) => updateConfig({ qwenKey: val })}
                    helpUrl="https://dashscope.console.aliyun.com/apiKey"
                    noContainer
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <div className="text-[10px] text-white/30 uppercase font-bold shrink-0">
                      Model
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. qwen-max"
                      value={config.qwenModel || ''}
                      onChange={(e) => updateConfig({ qwenModel: e.target.value })}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* General Purpose */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 px-1">
                Universal Access
              </h4>
              <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ProviderInput
                  label="OpenRouter"
                  icon={
                    <div className="w-4 h-4 bg-black border border-white/20 rounded-sm flex items-center justify-center text-[10px] font-bold text-white">
                      O
                    </div>
                  }
                  placeholder="sk-or-..."
                  value={config.openRouterKey}
                  onChange={(val) => updateConfig({ openRouterKey: val })}
                  helpUrl="https://openrouter.ai/keys"
                  noContainer
                />
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-[10px] text-white/30 uppercase font-bold shrink-0">
                    Model
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. meta-llama/llama-3.1-405b"
                    value={config.openRouterModel || ''}
                    onChange={(e) => updateConfig({ openRouterModel: e.target.value })}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <p className="text-[10px] text-purple-300/80 leading-relaxed uppercase font-bold tracking-wider mb-2">
                Priority Logic
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                Dotanote handles fallbacks automatically. **Groq** is prioritized for instant
                transcription. **Claude** and **Qwen** are favored for formatting and executive
                summaries.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProviderInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  helpUrl,
  noContainer,
}: {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange: (val: string) => void;
  helpUrl: string;
  noContainer?: boolean;
}) {
  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          {icon}
          {label}
        </div>
        <a
          href={helpUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors uppercase font-bold tracking-widest"
        >
          Get Key <ExternalLink size={10} />
        </a>
      </div>
      <input
        type="password"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#151619] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono"
      />
    </div>
  );

  if (noContainer) return content;

  return <div className="p-4 bg-white/5 rounded-2xl border border-white/5">{content}</div>;
}

function GeneralSettings({
  settings,
  onUpdate,
}: {
  settings: GeneralSettingsType;
  onUpdate: React.Dispatch<React.SetStateAction<GeneralSettingsType>>;
}) {
  const updateSetting = (key: keyof GeneralSettingsType, value: any) => {
    onUpdate((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/70">Preferences</h3>
        <div className="space-y-4">
          <Select
            label="Language / Region"
            value={settings.language}
            onChange={(val) => updateSetting('language', val)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' },
              { value: 'pt', label: 'Português' },
              { value: 'auto', label: 'Auto-detect' },
            ]}
          />
          <Select
            label="Auto-Export Format"
            value={settings.autoExportFormat}
            onChange={(val) => updateSetting('autoExportFormat', val)}
            options={[
              { value: 'none', label: 'Disabled' },
              { value: 'markdown', label: 'Markdown (.md)' },
              { value: 'txt', label: 'Plain Text (.txt)' },
              { value: 'pdf', label: 'PDF Document (.pdf)' },
            ]}
          />
        </div>
      </div>

      <div className="border-b border-white/10" />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white/70">Startup & UI</h3>
        <div className="space-y-4">
          <Toggle
            label="Show UI Hints"
            description="Display contextual hints and tooltips."
            enabled={settings.showHints}
            onToggle={() => updateSetting('showHints', !settings.showHints)}
          />
          <Toggle
            label="Sidebar visible by default"
            description="Show the sidebar when opening the app."
            enabled={settings.defaultSidebarVisible}
            onToggle={() => updateSetting('defaultSidebarVisible', !settings.defaultSidebarVisible)}
          />
          <Toggle
            label="Dashboard visible by default"
            description="Show the stats dashboard automatically."
            enabled={settings.defaultDashboardVisible}
            onToggle={() =>
              updateSetting('defaultDashboardVisible', !settings.defaultDashboardVisible)
            }
          />
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile Card */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            LO
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Local User</h3>
            <p className="text-sm text-white/50">dotanote Local Environment</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Edit2 size={14} /> Edit Profile
        </button>
      </div>

      {/* Plan Card */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
        <div className="p-6 flex items-start gap-4 relative">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
            <Cpu size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-white">Hardware Standard</h3>
              <span className="px-2 py-0.5 bg-black/50 border border-purple-500/50 text-purple-400 text-[10px] uppercase font-bold tracking-wider rounded-sm flex items-center gap-1">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>
            <p className="text-sm text-white/60 max-w-lg leading-relaxed">
              You are running the application locally. You have full access to hardware acceleration
              and hybrid AI processing directly on your machine.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70">Workspace Statistics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="text-xs text-white/50 mb-1">Total Notes</div>
            <div className="text-2xl font-mono text-white">12</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="text-xs text-white/50 mb-1">Minutes Transcribed</div>
            <div className="text-2xl font-mono text-white">14.5</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="text-xs text-white/50 mb-1">Magic Formats Used</div>
            <div className="text-2xl font-mono text-white">28</div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10" />

      {/* Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white/70">Data & Privacy</h4>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors">
            <DownloadCloud size={16} /> Export All Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
            <LogOut size={16} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
