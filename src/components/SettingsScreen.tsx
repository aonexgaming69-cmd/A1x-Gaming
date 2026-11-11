import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  Volume2,
  ShieldCheck,
  Info,
  Smartphone,
  Download,
  Moon,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LanguageCode } from '../types/ammu.js';

interface SettingsScreenProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onOpenApkModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  setLanguage,
  onOpenApkModal,
  onNavigateTab
}) => {
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [personality, setPersonality] = useState<'respectful' | 'concise' | 'creative'>('respectful');

  const testVoiceSample = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = language === 'ne'
        ? 'नमस्ते! म माफिया एआई हुँ। तपाईंको आवाज सेटिङ सफलतापूर्वक परिवर्तन भएको छ।'
        : language === 'hi'
        ? 'नमस्ते! मैं माफिया एआई हूँ। आपकी आवाज़ सेटिंग्स अपडेट हो गई हैं।'
        : 'Hello! I am MAFIA AI NEXUS. Your voice configuration has been updated.';
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US';
      utt.rate = speechRate;
      utt.pitch = speechPitch;
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-950">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-rose-400" />
          <h1 className="text-xs font-bold text-slate-100">
            {language === 'ne' ? 'सेटिङहरू एवं जानकारी (Settings)' : 'Settings & About'}
          </h1>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-2 text-slate-200">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">प्राथमिक भाषा (Language)</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLanguage('ne')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              language === 'ne'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block text-sm">नेपाली</span>
            <span className="text-[10px] opacity-70">Nepali (ne-NP)</span>
          </button>

          <button
            onClick={() => setLanguage('hi')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              language === 'hi'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block text-sm">हिन्दी</span>
            <span className="text-[10px] opacity-70">Hindi (hi-IN)</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              language === 'en'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="block text-sm">English</span>
            <span className="text-[10px] opacity-70">Global (en-US)</span>
          </button>
        </div>
      </div>

      {/* Voice Synthesis Tuning */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <Volume2 className="w-4 h-4 text-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider">आवाज गति र पिच (Voice Tuning)</h2>
          </div>
          <button
            onClick={testVoiceSample}
            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg border border-slate-700"
          >
            आवाज परीक्षण (Sample)
          </button>
        </div>

        <div className="space-y-3 pt-1">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>वाणी गति (Speech Rate):</span>
              <span className="font-mono text-slate-200">{speechRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={e => setSpeechRate(Number(e.target.value))}
              className="w-full accent-rose-600 bg-slate-950"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>आवाज पिच (Pitch):</span>
              <span className="font-mono text-slate-200">{speechPitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={speechPitch}
              onChange={e => setSpeechPitch(Number(e.target.value))}
              className="w-full accent-rose-600 bg-slate-950"
            />
          </div>
        </div>
      </div>

      {/* Personality Tone */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider">सहायक शैली (Assistant Tone)</h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPersonality('respectful')}
            className={`p-2 rounded-xl text-center text-xs border ${
              personality === 'respectful'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            आदरार्थी (Respectful)
          </button>
          <button
            onClick={() => setPersonality('concise')}
            className={`p-2 rounded-xl text-center text-xs border ${
              personality === 'concise'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            संक्षिप्त (Crisp)
          </button>
          <button
            onClick={() => setPersonality('creative')}
            className={`p-2 rounded-xl text-center text-xs border ${
              personality === 'creative'
                ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            सिर्जनशील (Creative)
          </button>
        </div>
      </div>

      {/* Cloud Backend Server Connection (for Android APK & Mobile devices) */}
      <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              {language === 'ne' ? 'क्लाउड सर्भर कनेक्सन (Cloud Backend URL)' : 'Cloud Backend Connection'}
            </h2>
          </div>
          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
            {localStorage.getItem('ammu_custom_backend_url') ? 'CONNECTED' : 'LOCAL / STANDALONE'}
          </span>
        </div>
        <p className="text-[11px] text-zinc-400">
          {language === 'ne'
            ? 'मोबाइल APK बाट प्रत्यक्ष क्लाउड जेमिनाई ३.८ फ्ल्यास र १२ एजेन्टहरूको सेवा पाउन ब्याकइन्ड URL जडान गर्नुहोस्।'
            : 'Configure the AI Studio cloud backend URL to access Gemini 3.8 Flash and server-side processing from the Android APK.'}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            defaultValue={localStorage.getItem('ammu_custom_backend_url') || 'https://ais-dev-n7v43h4odxk3lahirr2f3g-15092862494.asia-southeast1.run.app'}
            id="backend_url_input"
            placeholder="https://..."
            className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={() => {
              const input = document.getElementById('backend_url_input') as HTMLInputElement;
              if (input && input.value) {
                localStorage.setItem('ammu_custom_backend_url', input.value.trim());
                alert(language === 'ne' ? 'ब्याकइन्ड URL सफलतापूर्वक सुरक्षित भयो!' : 'Cloud backend URL saved successfully!');
                window.location.reload();
              }
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-2 rounded-xl text-xs transition-colors font-mono"
          >
            {language === 'ne' ? 'जडान गर' : 'Connect'}
          </button>
        </div>
      </div>

      {/* About & APK Card */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-rose-950/40 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs font-bold text-zinc-100">MAFIA AI v6.0.0 (NEXUS)</p>
              <p className="text-[10px] text-cyan-400 font-mono">Package: np.made.ammu (v600)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dev Dashboard</span>
            </button>
            <button
              onClick={onOpenApkModal}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK विवरण</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 space-y-1 border-t border-zinc-800 pt-2.5">
          <p><span className="text-zinc-300 font-semibold">न्यूनतम SDK:</span> Android 8.0 (API 26)</p>
          <p><span className="text-zinc-300 font-semibold">लक्षित SDK:</span> Android 14/15 (API 34)</p>
          <p><span className="text-zinc-300 font-semibold">स्वायत्त एजेन्टहरू:</span> १२ पूर्ण कार्यात्मक एजेन्टहरू (टास्क अर्केस्ट्रेटर)</p>
          <p><span className="text-zinc-300 font-semibold">आर्किटेक्चर:</span> Kotlin, Jetpack Compose, D8, Gemini 3.8 Flash Engine</p>
          <p><span className="text-zinc-300 font-semibold">विकासकर्ता:</span> MAFIA AI Autonomous Mission (np.made.ammu)</p>
        </div>
      </div>
    </div>
  );
};
