import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MessageSquare,
  Clock,
  Phone,
  ShieldCheck,
  Server,
  Brain,
  Download,
  Flame,
  CheckCircle2,
  Calendar,
  Settings as SettingsIcon,
  ChevronRight,
  Flashlight,
  BatteryCharging,
  Battery,
  Camera,
  Compass,
  Radio,
  ExternalLink,
  Volume2,
  Share2,
  Crown,
  Users,
  Clapperboard,
  BookOpen,
  Zap,
  Activity
} from 'lucide-react';
import { LanguageCode, Reminder, DeviceTelemetry } from '../types/ammu.js';
import { getDeviceTelemetry, executeDeviceAction } from '../services/api.js';
import { CameraVisionModal } from './CameraVisionModal.js';

interface HomeScreenProps {
  onNavigate: (tab: any) => void;
  language: LanguageCode;
  reminders: Reminder[];
  onOpenApkModal: () => void;
  healthStatus: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  language,
  reminders,
  onOpenApkModal,
  healthStatus
}) => {
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const [telemetry, setTelemetry] = useState<DeviceTelemetry>({
    batteryLevel: 88,
    isCharging: false,
    flashlightOn: false,
    volumeLevel: 75,
    networkStatus: 'ONLINE',
    mode: 'JARVIS_ACTIVE'
  });
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    getDeviceTelemetry().then(setTelemetry).catch(() => {});
    const interval = setInterval(() => {
      getDeviceTelemetry().then(setTelemetry).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFlashlightToggle = async () => {
    const newState = !telemetry.flashlightOn;
    const res = await executeDeviceAction('FLASHLIGHT', { enable: newState });
    setTelemetry(prev => ({ ...prev, flashlightOn: newState }));
    showToast(newState ? (language === 'ne' ? 'टर्च अन गरियो' : 'Torch ON') : (language === 'ne' ? 'टर्च बन्द गरियो' : 'Torch OFF'));
  };

  const handleLaunchApp = async (appName: string, pkg: string, uri: string) => {
    await executeDeviceAction('OPEN_APP', { appName, packageName: pkg, uri });
    showToast(language === 'ne' ? `${appName} खोल्दैछ...` : `Opening ${appName}...`);
  };

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const content = {
    ne: {
      jarvisSubtitle: 'NEXUS EDITION — बहुभाषिक स्वायत्त एआई सहायक',
      voicePrompt: 'माफियालाई केही भन्नुहोस् ("Hey MAFIA" / "Hey AMMU")...',
      quickChat: 'नेक्सस च्याट',
      quickVoice: 'नेपाली आवाज',
      quickReminders: 'रिमाइन्डर',
      quickCalls: 'स्मार्ट कल',
      quickHealth: 'स्वास्थ्य केन्द्र',
      quickServer: 'सर्भर व्यवस्थापन',
      quickMemory: 'मेमोरी बैंक',
      activeRemindersTitle: 'सक्रिय रिमाइन्डरहरू',
      noReminders: 'कुनै सक्रिय रिमाइन्डर छैन',
      viewAll: 'सबै हेर्नुहोस्',
      apkBannerTitle: 'MAFIA AI v6.0.0 NEXUS APK तयार छ',
      apkBannerSub: 'np.made.ammu Android डिभाइसमा इन्स्टल गर्नुहोस्',
      hardwareTitle: 'फोन नियन्त्रण तथा हार्डवेयर (Android Control)',
      torch: 'फ्ल्यासलाइट',
      vision: 'क्यामेरा भिजन',
      maps: 'नक्सा (Maps)',
      battery: 'ब्याट्री',
      allNominal: 'THINK BEYOND. ACT INTELLIGENTLY.',
      superSuiteTitle: 'माफिया स्वायत्त सुपर एजेन्ट प्रणाली',
      mafiaAgentsTitle: '१२ स्वायत्त एजेन्टहरू',
      mafiaAgentsSub: 'अर्केस्ट्रेटर, कोडिङ, खोज र मल्टि-स्टेप कार्यान्वयन',
      creatorStudioTitle: 'कन्टेन्ट क्रिएटर स्टुडियो',
      creatorStudioSub: 'स्क्रिप्ट, उपशीर्षक (.srt), थम्बनेल',
      knowledgeEngineTitle: 'ज्ञान इन्जिन (Knowledge Base)',
      knowledgeEngineSub: 'दीर्घकालीन सिमान्टिक मेमोरी',
      smartWorkflowsTitle: 'स्मार्ट अटोमेसन वर्कफ्लो',
      smartWorkflowsSub: 'कस्टम वर्कफ्लो तथा अडिट लग',
      systemMonitorTitle: 'सिस्टम मनिटर (९ मोडहरू)',
      systemMonitorSub: 'नेक्सस कोर, प्रत्यक्ष टेलिमेट्री'
    },
    hi: {
      jarvisSubtitle: 'NEXUS EDITION — बहुभाषी स्वायत्त एआई सहायक',
      voicePrompt: 'माफिया से कुछ कहें ("Hey MAFIA" / "Hey AMMU")...',
      quickChat: 'नेक्सस चैट',
      quickVoice: 'आवाज़ सहायक',
      quickReminders: 'रिमाइंडर',
      quickCalls: 'स्मार्ट कॉल',
      quickHealth: 'स्वास्थ्य केंद्र',
      quickServer: 'सर्वर प्रबंधक',
      quickMemory: 'मेमोरी बैंक',
      activeRemindersTitle: 'सक्रिय रिमाइंडर',
      noReminders: 'कोई सक्रिय रिमाइंडर नहीं है',
      viewAll: 'सभी देखें',
      apkBannerTitle: 'MAFIA AI v6.0.0 NEXUS APK तैयार है',
      apkBannerSub: 'np.made.ammu Android पर इंस्टॉल करें',
      hardwareTitle: 'फोन नियंत्रण व हार्डवेयर (Android Control)',
      torch: 'टॉर्च',
      vision: 'कैमरा विज़न',
      maps: 'गूगल मैप्स',
      battery: 'बैटरी',
      allNominal: 'THINK BEYOND. ACT INTELLIGENTLY.',
      superSuiteTitle: 'माफिया ऑटोनॉमस सुपर एजेंट प्रणाली',
      mafiaAgentsTitle: '12 ऑटोनॉमस एजेंट',
      mafiaAgentsSub: 'टास्क आर्केस्ट्रेटर, कोडिंग व रिसर्च',
      creatorStudioTitle: 'कंटेंट क्रिएटर स्टूडियो',
      creatorStudioSub: 'स्क्रिप्ट, सबटाइटल (.srt), थंबनेल',
      knowledgeEngineTitle: 'नॉलेज इंजन (Knowledge Base)',
      knowledgeEngineSub: 'दीर्घकालिक सिमेंटिक मेमोरी',
      smartWorkflowsTitle: 'स्मार्ट ऑटोमेशन वर्कफ़्लो',
      smartWorkflowsSub: 'कस्टम वर्कफ़्लो व ऑडिट लॉग',
      systemMonitorTitle: 'सिस्टम मॉनिटर (9 मोड्स)',
      systemMonitorSub: 'नेक्सस कोर व टेलीमेट्री'
    },
    en: {
      jarvisSubtitle: 'NEXUS EDITION — Autonomous Personal AI Assistant',
      voicePrompt: 'Tap to speak ("Hey MAFIA" / "Hey AMMU")...',
      quickChat: 'NEXUS Chat',
      quickVoice: 'Nepali Voice',
      quickReminders: 'Reminders',
      quickCalls: 'Smart Calls',
      quickHealth: 'Health Center',
      quickServer: 'Server Manager',
      quickMemory: 'Memory Bank',
      activeRemindersTitle: 'Active Reminders',
      noReminders: 'No pending reminders scheduled',
      viewAll: 'View All',
      apkBannerTitle: 'MAFIA AI v6.0.0 NEXUS APK Ready',
      apkBannerSub: 'Signed release for np.made.ammu package',
      hardwareTitle: 'Android Hardware & System Control',
      torch: 'Flashlight',
      vision: 'Camera Vision',
      maps: 'Maps',
      battery: 'Battery',
      allNominal: 'THINK BEYOND. ACT INTELLIGENTLY.',
      superSuiteTitle: 'MAFIA Autonomous Agent & Automation Suite',
      mafiaAgentsTitle: '12 Autonomous Agents',
      mafiaAgentsSub: 'Task Planner, Coding, Web Search & Orchestration',
      creatorStudioTitle: 'Content Creator Studio',
      creatorStudioSub: 'AI Scripts, .SRT Subtitles, Art',
      knowledgeEngineTitle: 'Knowledge Engine',
      knowledgeEngineSub: 'Long-term Semantic Memory',
      smartWorkflowsTitle: 'Smart Automation Workflows',
      smartWorkflowsSub: 'Custom Workflow CRUD & Execution Logs',
      systemMonitorTitle: 'System Monitor (9 Modes)',
      systemMonitorSub: 'Nexus Core, Danger, Dev & Telemetry'
    }
  }[language];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-6 overflow-y-auto bg-black text-zinc-100">
      {/* Action Toast Notification */}
      {actionNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 border border-rose-500/80 text-rose-300 px-4 py-2 rounded-full text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-top-2">
          {actionNotice}
        </div>
      )}

      {/* Top Identity & Telemetry Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-rose-950/60 border border-rose-500/50">
            <Radio className="w-5 h-5 text-zinc-100 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-zinc-100 text-base tracking-wider font-mono">
                MAFIA AI
              </span>
              <span className="text-[10px] bg-rose-950/90 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-700/60 shadow-sm">
                NEXUS v6.0.0
              </span>
            </div>
            <p className="text-[11px] text-cyan-400 font-mono">np.made.ammu</p>
          </div>
        </div>

        {/* Telemetry Chips (Battery, Diagnostics, Settings) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900/90 text-cyan-300 px-2.5 py-1 rounded-xl text-[11px] font-mono border border-cyan-900/60">
            {telemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{telemetry.batteryLevel}%</span>
          </div>
          <button
            onClick={() => onNavigate('health')}
            className="flex items-center gap-1 bg-zinc-900/90 hover:bg-zinc-800 text-emerald-400 px-2.5 py-1 rounded-xl text-[11px] font-mono border border-emerald-900/60 transition-colors"
            title="Open Health Center"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PASS</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="p-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 hover:border-rose-500/50 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Futuristic NEXUS Core HUD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-6 border border-rose-500/40 shadow-2xl shadow-rose-950/50">
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{content.allNominal}</span>
          </div>

          {/* Holographic Arc Reactor Pulsing Core */}
          <div
            onClick={() => onNavigate('voice')}
            className="relative cursor-pointer w-32 h-32 my-1 flex items-center justify-center group"
          >
            {/* Outer Rotating Concentric Rings */}
            <div className="absolute inset-0 rounded-full border border-rose-500/40 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-[spin_15s_linear_infinite_reverse]" />
            <div className="absolute inset-4 rounded-full border border-rose-400/30 animate-pulse" />
            
            {/* Center Glowing Energy Orb */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-rose-500/60 group-hover:scale-105 transition-transform">
              <Mic className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>

            {/* Neon Glow Behind */}
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold font-mono tracking-wider text-zinc-100">
              MAFIA AI NEXUS
            </h1>
            <p className="text-xs text-zinc-400 max-w-[280px]">
              {content.jarvisSubtitle}
            </p>
          </div>

          {/* Quick Voice Prompt Trigger Button */}
          <button
            onClick={() => onNavigate('voice')}
            className="w-full flex items-center justify-between bg-gradient-to-r from-rose-700 to-zinc-900 hover:from-rose-600 hover:to-zinc-800 text-white px-4 py-3 rounded-2xl shadow-lg shadow-rose-950/80 border border-rose-500/40 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold">{content.voicePrompt}</p>
                <p className="text-[10px] text-zinc-400">Nepali, Hindi &amp; English Speech</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Ambient neon backdrop grids */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Official Owner Control Center Banner (AMAN - SUPER OWNER) */}
      <div
        onClick={() => onNavigate('owner')}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-rose-950/60 via-zinc-950 to-amber-950/50 p-3.5 border border-rose-500/60 flex items-center justify-between hover:border-rose-400 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border border-rose-400/50">
            <Crown className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100 font-mono">
                {language === 'ne' ? 'मालिक नियन्त्रण केन्द्र (AMAN)' : 'Owner Control Center (AMAN)'}
              </span>
              <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700 font-mono px-1.5 py-0.2 rounded font-bold">
                SUPER OWNER
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {language === 'ne' ? '१२ एजेन्टहरू, १२ सीपहरू, क्युए अडिट तथा सुरक्षा नियन्त्रण' : '12 Agents, 12 Skills, QA Audit, Backup & Root Security'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/80 px-2.5 py-1.5 rounded-lg border border-rose-700/60 font-mono">
          <span>{language === 'ne' ? 'प्रवेश' : 'Open'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Autonomous Dev Dashboard Banner (Phase 1-8 Autonomous System) */}
      <div
        onClick={() => onNavigate('dashboard')}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-cyan-950/40 p-3.5 border border-emerald-500/50 flex items-center justify-between hover:border-emerald-400 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100 font-mono">
                {language === 'ne' ? 'स्वायत्त विकास ड्यासबोर्ड' : 'Autonomous Dev Dashboard'}
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono px-1.5 py-0.2 rounded">
                12/12 PASS
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {language === 'ne' ? '१० KPIs, १२ स्वचालित परीक्षणहरू एवं सेल्फ-रिपेयर लग' : '10 KPIs, 12 Automated Tests, Bug Audit & Self-Repair'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-1.5 rounded-lg border border-emerald-700/60 font-mono">
          <span>{language === 'ne' ? 'हेर्नुहोस्' : 'Open'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* APK & Release Download Card (MAFIA AI NEXUS Edition v6.0.0) */}
      <div
        onClick={onOpenApkModal}
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-zinc-950 via-rose-950/40 to-zinc-950 p-3.5 border border-rose-500/50 flex items-center justify-between hover:border-rose-400 transition-all shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 font-mono">
              {content.apkBannerTitle}
              <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700 font-mono px-1.5 py-0.2 rounded">v6.0.0</span>
            </p>
            <p className="text-[10px] text-zinc-400">{content.apkBannerSub}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/80 px-2.5 py-1.5 rounded-lg border border-rose-700/60 font-mono">
          <span>Get APK</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* MAFIA AI Autonomous Super Agent & Creative Studio Suite */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xs font-bold text-rose-300 font-mono uppercase tracking-wider">
              {content.superSuiteTitle}
            </h2>
          </div>
          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-mono px-2 py-0.5 rounded-full">
            NEXUS v6.0
          </span>
        </div>

        {/* 12 Autonomous Agents Card (Hero) */}
        <button
          onClick={() => onNavigate('agents')}
          className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-zinc-950 via-rose-950/40 to-zinc-950 border border-rose-500/50 hover:border-rose-400 transition-all shadow-md group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                {content.mafiaAgentsTitle}
                <span className="text-[9px] bg-rose-900/80 text-rose-200 font-mono px-1.5 py-0.2 rounded">12 Active</span>
              </p>
              <p className="text-[10px] text-zinc-400">{content.mafiaAgentsSub}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* 4 Super Agent Feature Tiles Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Creator Studio */}
          <button
            onClick={() => onNavigate('studio')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-105 transition-transform">
              <Clapperboard className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.creatorStudioTitle}</span>
            <span className="text-[10px] text-purple-400/80 mt-0.5">{content.creatorStudioSub}</span>
          </button>

          {/* Knowledge Engine */}
          <button
            onClick={() => onNavigate('knowledge')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.knowledgeEngineTitle}</span>
            <span className="text-[10px] text-blue-400/80 mt-0.5">{content.knowledgeEngineSub}</span>
          </button>

          {/* Smart Workflows */}
          <button
            onClick={() => onNavigate('workflows')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.smartWorkflowsTitle}</span>
            <span className="text-[10px] text-amber-400/80 mt-0.5">{content.smartWorkflowsSub}</span>
          </button>

          {/* System Monitor & 9 Modes */}
          <button
            onClick={() => onNavigate('monitor')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.systemMonitorTitle}</span>
            <span className="text-[10px] text-rose-400/80 mt-0.5">{content.systemMonitorSub}</span>
          </button>
        </div>
      </div>

      {/* Android Phone Control & Hardware Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">
            {content.hardwareTitle}
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">Permission-based</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Flashlight toggle */}
          <button
            onClick={handleFlashlightToggle}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              telemetry.flashlightOn
                ? 'bg-amber-950/50 border-amber-400 text-amber-300 shadow-lg shadow-amber-950/50'
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 text-slate-300'
            }`}
          >
            <Flashlight className={`w-5 h-5 mb-1.5 ${telemetry.flashlightOn ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[10px] font-medium">{content.torch}</span>
            <span className="text-[9px] font-mono text-slate-500">{telemetry.flashlightOn ? 'ON' : 'OFF'}</span>
          </button>

          {/* Camera Vision Scanner */}
          <button
            onClick={() => setIsVisionOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all group"
          >
            <Camera className="w-5 h-5 mb-1.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-medium">{content.vision}</span>
            <span className="text-[9px] font-mono text-cyan-500">OCR / AI</span>
          </button>

          {/* YouTube Launcher */}
          <button
            onClick={() => handleLaunchApp('YouTube', 'com.google.android.youtube', 'https://youtube.com')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-red-400 transition-all"
          >
            <div className="w-5 h-5 mb-1.5 rounded-md bg-red-600 flex items-center justify-center text-white text-[9px] font-bold">
              YT
            </div>
            <span className="text-[10px] font-medium">YouTube</span>
            <span className="text-[9px] font-mono text-slate-500">App</span>
          </button>

          {/* Google Maps Launcher */}
          <button
            onClick={() => handleLaunchApp('Maps', 'com.google.android.apps.maps', 'https://maps.google.com')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-all"
          >
            <Compass className="w-5 h-5 mb-1.5 text-emerald-400" />
            <span className="text-[10px] font-medium">{content.maps}</span>
            <span className="text-[9px] font-mono text-slate-500">GPS</span>
          </button>
        </div>
      </div>

      {/* Core AI & Assistant Modules */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            Assistant Modules
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onNavigate('chat')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.quickChat}</span>
            <span className="text-[10px] text-cyan-400/80 mt-0.5">Gemini 3.8 Flash Brain</span>
          </button>

          <button
            onClick={() => onNavigate('voice')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.quickVoice}</span>
            <span className="text-[10px] text-blue-400/80 mt-0.5">Devanagari STT &amp; TTS</span>
          </button>

          <button
            onClick={() => onNavigate('reminders')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.quickReminders}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{activeReminders.length} Active Alarms</span>
          </button>

          <button
            onClick={() => onNavigate('calls')}
            className="flex flex-col items-start p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all text-left shadow-sm group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{content.quickCalls}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Safe Dialer Guard</span>
          </button>
        </div>
      </div>

      {/* System Diagnostics & Storage Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            System Subsystems
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onNavigate('health')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-center flex flex-col items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-medium text-slate-300">{content.quickHealth}</span>
          </button>

          <button
            onClick={() => onNavigate('server')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-center flex flex-col items-center gap-1.5 transition-colors"
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-medium text-slate-300">{content.quickServer}</span>
          </button>

          <button
            onClick={() => onNavigate('memory')}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-center flex flex-col items-center gap-1.5 transition-colors"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] font-medium text-slate-300">{content.quickMemory}</span>
          </button>
        </div>
      </div>

      {/* Active Reminders Overview Preview */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">{content.activeRemindersTitle}</span>
          </div>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
          >
            {content.viewAll}
          </button>
        </div>

        {activeReminders.length === 0 ? (
          <p className="text-xs text-slate-500 py-1 text-center">{content.noReminders}</p>
        ) : (
          <div className="space-y-2">
            {activeReminders.slice(0, 2).map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-200">{r.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {new Date(r.dueTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {r.recurrence}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera Vision Modal */}
      <CameraVisionModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        language={language}
      />
    </div>
  );
};
