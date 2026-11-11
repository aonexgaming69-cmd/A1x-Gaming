import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  MessageSquare,
  Mic,
  Clock,
  Phone,
  Home,
  ShieldCheck,
  Server,
  Settings,
  Sparkles,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import { LanguageCode, NavigationTab } from '../types/ammu.js';

interface PhoneSimulatorProps {
  children: React.ReactNode;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  language: LanguageCode;
  isSimulatorFrame: boolean;
  setIsSimulatorFrame: (val: boolean) => void;
  onOpenApkModal: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  activeTab,
  setActiveTab,
  language,
  isSimulatorFrame,
  setIsSimulatorFrame,
  onOpenApkModal
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLabels = {
    ne: { home: 'गृह', chat: 'च्याट', voice: 'आवाज', reminders: 'रिमाइन्डर', calls: 'कल' },
    hi: { home: 'होम', chat: 'चैट', voice: 'आवाज़', reminders: 'रिमाइंडर', calls: 'कॉल' },
    en: { home: 'Home', chat: 'Chat', voice: 'Voice', reminders: 'Remind', calls: 'Calls' }
  }[language];

  const renderNavBar = () => (
    <div className="relative z-30 h-16 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 flex items-center justify-around select-none">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
          activeTab === 'home'
            ? 'bg-rose-950/60 text-rose-400 scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Home"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{navLabels.home}</span>
      </button>

      <button
        onClick={() => setActiveTab('chat')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
          activeTab === 'chat'
            ? 'bg-rose-950/60 text-rose-400 scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="AI Chat"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{navLabels.chat}</span>
      </button>

      {/* Floating Voice Mic Center Button */}
      <button
        onClick={() => setActiveTab('voice')}
        className={`relative -top-3 w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform ${
          activeTab === 'voice'
            ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 text-white ring-4 ring-rose-500/30 scale-110 shadow-rose-600/50'
            : 'bg-gradient-to-tr from-rose-700 to-indigo-800 text-white hover:scale-105 shadow-indigo-950/80'
        }`}
        aria-label="Nepali Voice Assistant"
      >
        <Mic className="w-6 h-6 animate-pulse" />
      </button>

      <button
        onClick={() => setActiveTab('reminders')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
          activeTab === 'reminders'
            ? 'bg-rose-950/60 text-rose-400 scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Reminders"
      >
        <Clock className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{navLabels.reminders}</span>
      </button>

      <button
        onClick={() => setActiveTab('calls')}
        className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
          activeTab === 'calls'
            ? 'bg-rose-950/60 text-rose-400 scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Call Assistant"
      >
        <Phone className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{navLabels.calls}</span>
      </button>
    </div>
  );

  // If fullscreen edge-to-edge mobile mode (on real Android device or mobile browser)
  if (!isSimulatorFrame) {
    return (
      <div className="w-full flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        {renderNavBar()}
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center py-4 px-2">
      {/* Outer Phone Bezel */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-[5px] border-slate-700/80 shadow-indigo-950/60 flex flex-col overflow-hidden">
        
        {/* Subtle Outer Hardware Buttons */}
        <div className="absolute -left-[9px] top-28 w-[4px] h-12 bg-slate-600 rounded-l-md" title="Volume Up" />
        <div className="absolute -left-[9px] top-44 w-[4px] h-12 bg-slate-600 rounded-l-md" title="Volume Down" />
        <div className="absolute -right-[9px] top-36 w-[4px] h-16 bg-slate-600 rounded-r-md" title="Power Button" />

        {/* Screen Display Container */}
        <div className="relative w-full h-full bg-slate-950 rounded-[42px] overflow-hidden flex flex-col border border-slate-800">
          
          {/* Top Status Bar & Camera Punch Hole */}
          <div className="relative z-30 h-10 w-full px-6 flex items-center justify-between text-xs font-medium text-slate-300 bg-slate-950/90 backdrop-blur-md select-none border-b border-slate-900/60">
            {/* Left: Clock & Carrier */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">{timeStr || '12:00'}</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800/80 text-rose-300 font-mono">NTC 5G</span>
            </div>

            {/* Center: Punch Hole Camera Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-5 bg-black rounded-full flex items-center justify-center gap-2 border border-slate-800/80 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-indigo-900" />
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500/90 animate-pulse" title="MAFIA AI Active" />
            </div>

            {/* Right: Icons & Battery */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5 bg-slate-800 px-1 py-0.5 rounded text-[10px]">
                <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span className="font-mono text-[10px]">98%</span>
              </div>
            </div>
          </div>

          {/* Screen Content Viewport */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col bg-slate-950">
            {children}
          </div>

          {/* Android Bottom Navigation Bar (Material 3 style) */}
          {renderNavBar()}

          {/* Android Home Gesture Pill Bar */}
          <div className="w-full h-3 bg-slate-900/95 flex items-center justify-center">
            <div className="w-28 h-1 bg-slate-500/70 rounded-full" />
          </div>

        </div>
      </div>
    </div>
  );
};
