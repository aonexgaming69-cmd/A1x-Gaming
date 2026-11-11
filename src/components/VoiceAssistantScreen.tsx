import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  Languages,
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';
import { LanguageCode, MemoryFact } from '../types/ammu.js';
import { sendChatMessage, executeDeviceAction, getDeviceTelemetry } from '../services/api.js';
import { parseAutomationIntent } from '../utils/ammu-logic.js';

interface VoiceAssistantScreenProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  memories: MemoryFact[];
  onNavigateTab: (tab: any) => void;
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({
  language,
  setLanguage,
  memories,
  onNavigateTab
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [ammuResponse, setAmmuResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermission, setMicPermission] = useState<PermissionState | 'unsupported'>('prompt');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptRef = useRef<string>('');

  // Check speech recognition & mic permissions
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then(perm => {
          setMicPermission(perm.state);
          perm.onchange = () => setMicPermission(perm.state);
        })
        .catch(() => setMicPermission('prompt'));
    }
  }, []);

  // Audio wave canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw concentric glowing audio wave rings
      const ringCount = isListening || isSpeaking ? 4 : 2;
      for (let i = 0; i < ringCount; i++) {
        const radius = (isListening || isSpeaking)
          ? 40 + i * 18 + Math.sin(step * 0.08 + i) * 12
          : 45 + i * 10;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isListening
          ? `rgba(6, 182, 212, ${0.8 - i * 0.18})` // Glowing Cyan
          : isSpeaking
          ? `rgba(56, 189, 248, ${0.8 - i * 0.18})` // Sky Blue Energy
          : `rgba(148, 163, 184, 0.25)`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      step++;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isListening, isSpeaking]);

  const speakText = (text: string) => {
    const bridge = typeof window !== 'undefined' ? ((window as any).AndroidBridge || (window as any).AmmuAndroidBridge) : null;
    if (bridge) {
      setIsSpeaking(true);
      if (typeof bridge.speakText === 'function') {
        bridge.speakText(text, language);
      } else if (typeof bridge.speakNepali === 'function') {
        bridge.speakNepali(text);
      }
      setTimeout(() => setIsSpeaking(false), Math.min(Math.max(text.length * 80, 2000), 10000));
      return;
    }

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    const bridge = typeof window !== 'undefined' ? ((window as any).AndroidBridge || (window as any).AmmuAndroidBridge) : null;
    if (bridge && typeof bridge.stopSpeaking === 'function') {
      bridge.stopSpeaking();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    setErrorMsg(null);
    stopSpeaking();
    transcriptRef.current = '';

    const bridge = typeof window !== 'undefined' ? ((window as any).AndroidBridge || (window as any).AmmuAndroidBridge) : null;
    if (bridge && bridge.startNativeSpeechRecognition) {
      (window as any).onNativeSpeechResult = (spokenText: string) => {
        setTranscript(spokenText);
        transcriptRef.current = spokenText;
        setIsListening(false);
        processVoiceQuery(spokenText);
      };
      setIsListening(true);
      bridge.startNativeSpeechRecognition();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('यस डिभाइसमा पूर्वनिर्धारित वाक्यहरू वा च्याट प्रयोग गरी अम्मुसँग कुरा गर्न सक्नुहुन्छ।');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const locale = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.lang = locale;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
      };

      recognition.onresult = (e: any) => {
        const text = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        transcriptRef.current = text;
        setTranscript(text);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech error:', e.error);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setErrorMsg('माइक्रोफोन अनुमति अस्वीकृत भयो। कृपया ब्राउजर सेटिङमा माइक्रोफोन अनुमति दिनुहोस्।');
        } else if (e.error !== 'no-speech') {
          setErrorMsg(`वाणी पहिचान त्रुटि: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const finalSpoken = transcriptRef.current.trim();
        if (finalSpoken) {
          processVoiceQuery(finalSpoken);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setErrorMsg(err.message || 'माइक्रोफोन सुरु गर्न सकिएन');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    // Hard safety timeout: guarantee isProcessing resets even under network drop
    const safetyTimer = setTimeout(() => {
      setIsProcessing(false);
    }, 6500);

    // 1. Check for immediate hardware automation intents (Flashlight, Battery, Apps, Maps)
    const intent = parseAutomationIntent(queryText, language);
    if (intent.command !== 'NONE') {
      clearTimeout(safetyTimer);
      if (intent.command === 'FLASHLIGHT') {
        await executeDeviceAction('FLASHLIGHT', intent.params);
      } else if (intent.command === 'BATTERY') {
        const tele = await getDeviceTelemetry();
        const batteryText = language === 'ne'
          ? `हजुर, डिभाइसको ब्याट्री ${tele.batteryLevel}% छ। ${tele.isCharging ? 'हाल चार्ज भइरहेको छ।' : 'ब्याट्री सामान्य अवस्थामा छ।'}`
          : language === 'hi'
          ? `बैटरी स्तर ${tele.batteryLevel}% है।`
          : `Battery telemetry reads ${tele.batteryLevel}%. All power cells nominal, Sir.`;
        setAmmuResponse(batteryText);
        speakText(batteryText);
        setIsProcessing(false);
        return;
      } else if (intent.command === 'OPEN_APP') {
        await executeDeviceAction('OPEN_APP', intent.params);
      } else if (intent.command === 'MAPS') {
        await executeDeviceAction('MAPS', intent.params);
      } else if (intent.command === 'CAMERA') {
        await executeDeviceAction('CAMERA');
      } else if (intent.command === 'CALL') {
        setTimeout(() => onNavigateTab('calls'), 1200);
      } else if (intent.command === 'REMINDER') {
        setTimeout(() => onNavigateTab('reminders'), 1200);
      }

      setAmmuResponse(intent.confirmationText);
      speakText(intent.confirmationText);
      setIsProcessing(false);
      return;
    }

    try {
      const messages = [{ id: '1', role: 'user' as const, content: queryText, timestamp: Date.now() }];
      const memoryStrings = memories.map(m => m.content);
      const reply = await sendChatMessage(messages, language, memoryStrings);
      setAmmuResponse(reply);
      speakText(reply);
    } catch (e: any) {
      const errReply = language === 'ne'
        ? 'माफ गर्नुहोस्, जार्विस प्रतिक्रिया प्राप्त गर्न सकिएन।'
        : 'Pardon me, Sir. Command could not be completed.';
      setAmmuResponse(errReply);
      speakText(errReply);
    } finally {
      clearTimeout(safetyTimer);
      setIsProcessing(false);
    }
  };

  const voiceShortcuts = {
    ne: [
      'अम्मु, नमस्ते! तिमी कस्तो छौ?',
      'काठमाडौंमा अहिले समय कति भयो?',
      'मेरो रिमाइन्डरहरू देखाउनुहोस्',
      'फोन कल सहायक खोल्नुहोस्'
    ],
    hi: [
      'अम्मू, नमस्ते! आप कैसी हैं?',
      'आज का मौसम कैसा है?',
      'मेरा रिमाइंडर दिखाएं',
      'कॉल सहायक खोलें'
    ],
    en: [
      'Hello AMMU! What can you do?',
      'Check my daily schedule',
      'Open Call Assistant safely',
      'Tell me a motivational thought'
    ]
  }[language];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 items-center justify-between overflow-y-auto bg-slate-950">
      {/* Top Language & Status Pill */}
      <div className="w-full flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-semibold text-slate-200">
            {language === 'ne' ? 'नेपाली आवाज सहायक' : language === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
          </span>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setLanguage('ne'); stopSpeaking(); }}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              language === 'ne' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            नेपाली
          </button>
          <button
            onClick={() => { setLanguage('hi'); stopSpeaking(); }}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              language === 'hi' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => { setLanguage('en'); stopSpeaking(); }}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              language === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Central Visualizer & Orb Container */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        {/* Canvas for animated sound waves */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Central Interactive Voice Orb */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl ${
            isListening
              ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 scale-105 ring-8 ring-rose-500/20 shadow-rose-600/70'
              : isSpeaking
              ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 ring-8 ring-indigo-500/20 shadow-indigo-600/70'
              : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-800 hover:from-rose-900 hover:to-indigo-900 ring-4 ring-slate-700/40 shadow-slate-900/90'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <Mic className="w-10 h-10 text-white animate-bounce" />
          ) : isSpeaking ? (
            <Volume2 className="w-10 h-10 text-white animate-pulse" />
          ) : (
            <Mic className="w-10 h-10 text-rose-400 hover:scale-110 transition-transform" />
          )}
          <span className="text-[10px] text-white font-medium mt-1">
            {isListening ? 'सुन्दैछु...' : isSpeaking ? 'बोल्दैछु...' : 'ट्याप गर्नुहोस्'}
          </span>
        </button>

        {/* State Label */}
        <p className="mt-6 text-xs font-medium text-slate-300 text-center max-w-[240px]">
          {isListening
            ? 'अम्मु तपाईंको आवाज सुन्दैछ... बोल्नुहोस्'
            : isSpeaking
            ? 'अम्मु जवाफ बोल्दैछ (Spoken Audio Output)'
            : isProcessing
            ? 'प्रशोधन गर्दैछ... (Processing Query)'
            : 'माइक्रोफोन बटन थिचेर नेपाली वा अंग्रेजीमा बोल्नुहोस्'}
        </p>

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="mt-2 text-[10px] flex items-center gap-1 bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 hover:bg-slate-700"
          >
            <VolumeX className="w-3 h-3 text-rose-400" />
            <span>बोल्न रोक्नुहोस् (Stop Voice)</span>
          </button>
        )}
      </div>

      {/* Live Transcript / Response Card */}
      {(transcript || ammuResponse) && (
        <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-2 text-xs">
          {transcript && (
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">तपाईंले भन्नुभयो (You said):</p>
              <p className="text-slate-100 font-medium">{transcript}</p>
            </div>
          )}
          {ammuResponse && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] text-rose-400 font-semibold uppercase">अम्मु एआई (AMMU Reply):</p>
              <p className="text-slate-200 whitespace-pre-wrap">{ammuResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* Error / Fallback Banner */}
      {errorMsg && (
        <div className="w-full p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-2 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] leading-tight">{errorMsg}</span>
        </div>
      )}

      {/* Voice Command Shortcuts */}
      <div className="w-full space-y-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          सुझावित आवाज आदेशहरू (Voice Commands):
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {voiceShortcuts.map((cmd, i) => (
            <button
              key={i}
              onClick={() => {
                setTranscript(cmd);
                processVoiceQuery(cmd);
              }}
              className="text-left text-xs bg-slate-900/70 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between group"
            >
              <span>"{cmd}"</span>
              <Send className="w-3 h-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
