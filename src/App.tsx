import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
  Download,
  Languages,
  Globe,
  MessageSquare,
  Mic,
  Clock,
  Phone,
  Server,
  Brain,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
  Users,
  Clapperboard,
  BookOpen,
  Zap,
  Activity
} from 'lucide-react';
import { LanguageCode, MemoryFact, Reminder, NavigationTab } from './types/ammu.js';
import { fetchHealth, fetchMemory, fetchReminders } from './services/api.js';
import { PhoneSimulator } from './components/PhoneSimulator.js';
import { HomeScreen } from './components/HomeScreen.js';
import { ChatScreen } from './components/ChatScreen.js';
import { VoiceAssistantScreen } from './components/VoiceAssistantScreen.js';
import { ReminderScreen } from './components/ReminderScreen.js';
import { CallAssistantScreen } from './components/CallAssistantScreen.js';
import { HealthCenterScreen } from './components/HealthCenterScreen.js';
import { ServerManagerScreen } from './components/ServerManagerScreen.js';
import { MemoryScreen } from './components/MemoryScreen.js';
import { SettingsScreen } from './components/SettingsScreen.js';
import { ApkReleaseModal } from './components/ApkReleaseModal.js';
import { SuperAgentsScreen } from './components/SuperAgentsScreen.js';
import { KnowledgeEngineScreen } from './components/KnowledgeEngineScreen.js';
import { ContentStudioScreen } from './components/ContentStudioScreen.js';
import { AutomationWorkflowsScreen } from './components/AutomationWorkflowsScreen.js';
import { SystemMonitorScreen } from './components/SystemMonitorScreen.js';
import { DevDashboardScreen } from './components/DevDashboardScreen.js';
import { OwnerControlCenterScreen } from './components/OwnerControlCenterScreen.js';
import { Crown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [language, setLanguage] = useState<LanguageCode>('ne');
  
  // Detect if running natively inside Android APK (file:/// or AmmuAndroidBridge) or mobile viewport
  const isNativeApp = typeof window !== 'undefined' && (
    !!(window as any).AmmuAndroidBridge ||
    window.location.protocol === 'file:' ||
    navigator.userAgent.includes('np.made.ammu') ||
    navigator.userAgent.includes('AmmuAI')
  );

  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (
        (window as any).AmmuAndroidBridge ||
        window.location.protocol === 'file:' ||
        window.innerWidth <= 640 ||
        navigator.userAgent.includes('Android')
      ) {
        return false;
      }
    }
    return true;
  });
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('ONLINE');

  const refreshData = async () => {
    try {
      const [rems, mems, health] = await Promise.all([
        fetchReminders(),
        fetchMemory(),
        fetchHealth()
      ]);
      setReminders(rems);
      setMemories(mems);
      setHealthStatus(health.status);
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onNavigate={setActiveTab}
            language={language}
            reminders={reminders}
            onOpenApkModal={() => setShowApkModal(true)}
            healthStatus={healthStatus}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            language={language}
            setLanguage={setLanguage}
            memories={memories}
            onOpenVoice={() => setActiveTab('voice')}
          />
        );
      case 'voice':
        return (
          <VoiceAssistantScreen
            language={language}
            setLanguage={setLanguage}
            memories={memories}
            onNavigateTab={setActiveTab}
          />
        );
      case 'reminders':
        return (
          <ReminderScreen
            language={language}
            reminders={reminders}
            onRefreshReminders={refreshData}
          />
        );
      case 'calls':
        return <CallAssistantScreen language={language} />;
      case 'health':
        return <HealthCenterScreen language={language} />;
      case 'server':
        return <ServerManagerScreen language={language} />;
      case 'memory':
        return (
          <MemoryScreen
            language={language}
            memories={memories}
            onRefreshMemory={refreshData}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            language={language}
            setLanguage={setLanguage}
            onOpenApkModal={() => setShowApkModal(true)}
            onNavigateTab={setActiveTab}
          />
        );
      case 'agents':
        return <SuperAgentsScreen language={language} />;
      case 'studio':
        return <ContentStudioScreen language={language} />;
      case 'knowledge':
        return <KnowledgeEngineScreen language={language} />;
      case 'workflows':
        return <AutomationWorkflowsScreen language={language} />;
      case 'monitor':
        return <SystemMonitorScreen language={language} />;
      case 'dashboard':
        return (
          <DevDashboardScreen
            language={language}
            onOpenApkModal={() => setShowApkModal(true)}
            onNavigateTab={setActiveTab}
          />
        );
      case 'owner':
        return (
          <OwnerControlCenterScreen
            language={language}
            onNavigateTab={setActiveTab}
            onOpenApkModal={() => setShowApkModal(true)}
          />
        );
      default:
        return (
          <HomeScreen
            onNavigate={setActiveTab}
            language={language}
            reminders={reminders}
            onOpenApkModal={() => setShowApkModal(true)}
            healthStatus={healthStatus}
          />
        );
    }
  };

  const navLabels = {
    ne: { home: 'गृह', chat: 'च्याट', voice: 'आवाज', reminders: 'रिमाइन्डर', calls: 'कल' },
    hi: { home: 'होम', chat: 'चैट', voice: 'आवाज़', reminders: 'रिमाइंडर', calls: 'कॉल' },
    en: { home: 'Home', chat: 'Chat', voice: 'Voice', reminders: 'Remind', calls: 'Calls' }
  }[language];

  // If running directly on a phone or inside the Native Android APK
  if (isNativeApp) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white antialiased">
        {/* Native Android Mobile Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-zinc-950/95 backdrop-blur-md border-b border-rose-900/40 px-3 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black flex items-center justify-center text-white shadow border border-rose-500/50">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white font-mono">MAFIA AI</span>
                <span className="text-[9px] bg-rose-950 text-rose-300 font-mono px-1.5 py-0.5 rounded-full border border-rose-700/60">
                  NEXUS v6.0.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">np.made.ammu</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-cyan-900/60">
              <button
                onClick={() => setLanguage('ne')}
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  language === 'ne' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                ने
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  language === 'hi' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                हि
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                  language === 'en' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Health Status Pill */}
            <button
              onClick={() => setActiveTab('health')}
              className="flex items-center gap-1 bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 px-2 py-1 rounded-lg text-[10px] font-bold"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>PASS</span>
            </button>
          </div>
        </header>

        {/* Full Mobile Screen Content */}
        <main className="flex-1 flex flex-col w-full overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Native Android Bottom Navigation Bar */}
        <nav className="sticky bottom-0 z-40 h-16 w-full bg-slate-900/95 backdrop-blur-lg border-t border-cyan-900/60 px-2 flex items-center justify-around select-none">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
              activeTab === 'home'
                ? 'bg-cyan-950/70 text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{navLabels.home}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-950/70 text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{navLabels.chat}</span>
          </button>

          {/* Central Pulsing Voice Mic Button (Arc Reactor) */}
          <button
            onClick={() => setActiveTab('voice')}
            className={`relative -top-2.5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              activeTab === 'voice'
                ? 'bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 text-white ring-4 ring-cyan-500/30 scale-110 shadow-cyan-500/50'
                : 'bg-gradient-to-tr from-cyan-600 to-blue-700 text-white hover:scale-105 shadow-cyan-950/80'
            }`}
            aria-label="Nepali Voice Assistant"
          >
            <Mic className="w-6 h-6 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
              activeTab === 'reminders'
                ? 'bg-cyan-950/70 text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{navLabels.reminders}</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all ${
              activeTab === 'calls'
                ? 'bg-cyan-950/70 text-cyan-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{navLabels.calls}</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Application Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-rose-900/40 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black flex items-center justify-center text-white shadow-md shadow-rose-950/80 border border-rose-500/50">
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">MAFIA AI</span>
              <span className="text-[10px] bg-rose-950 text-rose-300 font-mono px-2 py-0.5 rounded-full border border-rose-700/60">
                NEXUS v6.0.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
              THINK BEYOND. ACT INTELLIGENTLY. • np.made.ammu
            </p>
          </div>
        </div>

        {/* View Mode & System Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Frame View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsSimulatorFrame(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isSimulatorFrame
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Phone Simulator View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Phone Mode</span>
            </button>
            <button
              onClick={() => setIsSimulatorFrame(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                !isSimulatorFrame
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Expanded Studio Dashboard View"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Studio Mode</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => setLanguage('ne')}
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                language === 'ne' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              नेपाली
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                language === 'hi' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                language === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400'
              }`}
            >
              EN
            </button>
          </div>

          {/* Owner Control Center (AMAN) */}
          <button
            onClick={() => setActiveTab('owner')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
              activeTab === 'owner'
                ? 'bg-rose-600 text-white border border-rose-400'
                : 'bg-rose-950/70 border border-rose-600/50 text-rose-300 hover:bg-rose-900/80 hover:text-white'
            }`}
            title="Owner Control Center (AMAN - Super Owner)"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline font-bold">AMAN</span>
            <span className="text-[10px] bg-rose-900/60 px-1 py-0.2 rounded text-rose-200">Owner</span>
          </button>

          {/* Diagnostics Health Status */}
          <button
            onClick={() => setActiveTab('health')}
            className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-2.5 py-1 rounded-xl text-xs font-medium hover:bg-emerald-950/80 transition-colors"
            title="Open 14-Point Health Center"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono">14-Point</span>
            <span className="font-bold">Health Center</span>
          </button>

          {/* Download Official APK Button */}
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-950/50 transition-all hover:scale-105"
            title="Download Installable AMMU AI v5.0.2 APK"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </button>
        </div>
      </header>

      {/* Main Container Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full">
        {isSimulatorFrame ? (
          /* Phone Simulator Shell */
          <PhoneSimulator
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            language={language}
            isSimulatorFrame={isSimulatorFrame}
            setIsSimulatorFrame={setIsSimulatorFrame}
            onOpenApkModal={() => setShowApkModal(true)}
          >
            {renderActiveScreen()}
          </PhoneSimulator>
        ) : (
          /* Expanded Full Studio Mode */
          <div className="w-full flex-1 max-w-6xl mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-3xl p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto shrink-0 shadow-xl">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'home'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>Home Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'voice'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Mic className="w-4 h-4 text-rose-400" />
                <span>Nepali Voice Assistant</span>
              </button>

              <button
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'reminders'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Reminders Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('calls')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'calls'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Call Assistant</span>
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'health'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Health Center (14 Checks)</span>
              </button>

              <button
                onClick={() => setActiveTab('server')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'server'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Server className="w-4 h-4 text-sky-400" />
                <span>Server Manager</span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'memory'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Memory System</span>
              </button>

              <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 border-t border-slate-800/80">
                Super Agent Suite
              </div>

              <button
                onClick={() => setActiveTab('agents')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'agents'
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>MAFIA Super Agents</span>
              </button>

              <button
                onClick={() => setActiveTab('studio')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'studio'
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-500/50 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Clapperboard className="w-4 h-4 text-purple-400" />
                <span>Content Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('knowledge')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'knowledge'
                    ? 'bg-blue-950/70 text-blue-300 border border-blue-500/50 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Knowledge Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('workflows')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'workflows'
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Smart Workflows</span>
              </button>

              <button
                onClick={() => setActiveTab('monitor')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'monitor'
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-500/50 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4 text-rose-400" />
                <span>System Monitor (9 Modes)</span>
              </button>

              <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-t border-slate-800/80">
                System
              </div>

              <button
                onClick={() => setActiveTab('owner')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'owner'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/60 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Owner Center (AMAN)</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 w-full p-2.5 rounded-2xl text-xs font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>Settings &amp; About</span>
              </button>
            </aside>

            {/* Screen Content View */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl min-h-[640px] flex flex-col overflow-hidden shadow-2xl">
              {renderActiveScreen()}
            </div>
          </div>
        )}
      </main>

      {/* APK & Source Code Download Modal */}
      <ApkReleaseModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
}
