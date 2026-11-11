import React, { useState, useEffect } from 'react';
import {
  Users,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Sparkles,
  Bot,
  Layers,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Search,
  Clapperboard,
  Image as ImageIcon,
  Video,
  Smartphone,
  FileText,
  CheckSquare,
  UserCheck,
  Globe,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { AgentId, SpecializedAgent, AgentJob, LanguageCode } from '../types/ammu.js';
import { fetchAgents, fetchAgentJobs, executeAgentTask, controlAgentJob } from '../services/api.js';
import { SPECIALIZED_AGENTS } from '../utils/super-agents.js';

interface SuperAgentsScreenProps {
  language: LanguageCode;
}

export const SuperAgentsScreen: React.FC<SuperAgentsScreenProps> = ({ language }) => {
  const [agents, setAgents] = useState<SpecializedAgent[]>(SPECIALIZED_AGENTS);
  const [jobs, setJobs] = useState<AgentJob[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('mafia_local_agent_jobs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('personal_assistant');
  const [instructions, setInstructions] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'jobs'>('agents');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  const jobsRef = React.useRef<AgentJob[]>([]);
  jobsRef.current = jobs;

  const loadData = async () => {
    try {
      const [agList, jobList] = await Promise.all([fetchAgents(), fetchAgentJobs()]);
      if (agList && agList.length) setAgents(agList);
      if (jobList) setJobs(jobList);
    } catch (e) {
      console.warn('SuperAgents load error:', e);
    }
  };

  useEffect(() => {
    loadData();
    // Only poll when there is an active running job to preserve Android thread and battery
    const interval = setInterval(() => {
      const hasRunningJobs = jobsRef.current.some(j => j.status === 'RUNNING');
      if (hasRunningJobs) {
        loadData();
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleExecute = async (customPrompt?: string) => {
    const textToRun = (customPrompt || instructions).trim();
    if (!textToRun) return;

    setIsExecuting(true);
    try {
      const job = await executeAgentTask(
        selectedAgent,
        `Mission: ${textToRun.slice(0, 35)}...`,
        textToRun,
        language
      );
      setInstructions('');
      setJobs(prev => [job, ...prev]);
      setActiveTab('jobs');
      // Trigger instant poll
      setTimeout(loadData, 500);
    } catch (e) {
      console.error('Execution error:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleJobAction = async (jobId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      const updated = await controlAgentJob(jobId, action);
      setJobs(prev => prev.map(j => (j.id === jobId ? updated : j)));
    } catch (e) {
      console.error('Job action error:', e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(id);
    setTimeout(() => setCopiedStepId(null), 2000);
  };

  const getAgentIcon = (id: AgentId) => {
    switch (id) {
      case 'core_orchestrator': return <Bot className="w-5 h-5 text-rose-500" />;
      case 'intelligence_agent':
      case 'research': return <Search className="w-5 h-5 text-cyan-400" />;
      case 'web_search': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'creative_studio': return <Clapperboard className="w-5 h-5 text-rose-400" />;
      case 'image_agent':
      case 'image_gen': return <ImageIcon className="w-5 h-5 text-fuchsia-400" />;
      case 'video_agent':
      case 'video_gen':
      case 'video_enhancement': return <Video className="w-5 h-5 text-cyan-300" />;
      case 'voice_agent': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'android_agent':
      case 'phone_control': return <Smartphone className="w-5 h-5 text-teal-400" />;
      case 'document': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'coding_agent':
      case 'coding': return <Code className="w-5 h-5 text-sky-400" />;
      case 'productivity_agent':
      case 'productivity': return <CheckSquare className="w-5 h-5 text-indigo-400" />;
      case 'workflow_agent': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'security_agent':
      case 'security': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'personal_assistant': return <UserCheck className="w-5 h-5 text-rose-500" />;
      default: return <Bot className="w-5 h-5 text-rose-400" />;
    }
  };

  const promptPresets = [
    {
      title: '🎬 Viral YouTube Reel',
      prompt: 'Create a viral YouTube reel about autonomous AI with full script, 3 scenes, and timed subtitles.',
      agent: 'creative_studio' as AgentId
    },
    {
      title: '📄 Strategic Research Document',
      prompt: 'Generate an executive research document on Devanagari voice AI breakthroughs in 2026.',
      agent: 'document' as AgentId
    },
    {
      title: '🔍 Quantum Computing Intelligence',
      prompt: 'Perform deep research and factual investigation on quantum computing architectures.',
      agent: 'research' as AgentId
    },
    {
      title: '🛡️ Mobile Security Audit',
      prompt: 'Audit Android device permissions, sandbox integrity, and verify zero key leakage.',
      agent: 'security' as AgentId
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-8 overflow-y-auto bg-black text-slate-100">
      {/* Header Banner - MAFIA NEXUS Aesthetic */}
      <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black border border-rose-500/50 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-950/80">
            <Users className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-zinc-100">
                MAFIA SUPER AGENTS
              </h1>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full font-mono">
                12 AUTONOMOUS AGENTS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {language === 'ne'
                ? '१२ विशिष्ट स्वायत्त एआई एजेन्टहरूको अर्केस्ट्रेटर'
                : '12 Autonomous Specialized Agents • Multi-Phase Task Planner'}
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'agents' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Agents ({agents.length || 12})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'jobs' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Task Queue</span>
            {jobs.some(j => j.status === 'RUNNING') && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'agents' ? (
        <div className="space-y-4">
          {/* Autonomous Task Planner & Mission Dispatcher */}
          <div className="p-4 rounded-3xl bg-zinc-950/90 border border-rose-900/40 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-rose-500" />
                <span>{language === 'ne' ? 'एजेन्ट अर्केस्ट्रेटरलाई मिशन दिनुहोस्' : 'Autonomous Mission Planner'}</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Lead: {selectedAgent}</span>
            </div>

            {/* Quick Presets Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {promptPresets.map((pr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAgent(pr.agent);
                    setInstructions(pr.prompt);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/50 text-[11px] text-zinc-300 font-medium whitespace-nowrap transition-all"
                >
                  {pr.title}
                </button>
              ))}
            </div>

            {/* Agent Selector Badges */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {agents.map(ag => (
                <button
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    selectedAgent === ag.id
                      ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-md shadow-rose-950/80 scale-105'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {getAgentIcon(ag.id)}
                  <span>{ag.name.replace(' Agent', '')}</span>
                </button>
              ))}
            </div>

            {/* Instruction input */}
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'कुनै पनि जटिल कार्य यहाँ लेख्नुहोस् (उदा: युट्युब रिलको पूर्ण योजना, स्क्रिप्ट, थम्बनेल र उपशीर्षक सिर्जना गर...)'
                  : 'Describe an objective for the 12-agent autonomous swarm (e.g. "Create a viral YouTube reel with script and subtitles")...'
              }
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 font-sans"
            />

            <button
              onClick={() => handleExecute()}
              disabled={isExecuting || !instructions.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-rose-950/80 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>
                {isExecuting
                  ? 'ORCHESTRATING AGENTS...'
                  : language === 'ne'
                  ? 'स्वायत्त कार्य सुरु गर्नुहोस् (Deploy Autonomous Job)'
                  : 'Execute Multi-Agent Mission'}
              </span>
            </button>
          </div>

          {/* 12 Specialized Agents Grid */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider px-1">
              {language === 'ne'
                ? `१२ विशिष्ट एजेन्टहरूको रोस्टर (${agents.length} Active)`
                : `Active Swarm Roster (12 Specialized Autonomous Agents)`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {agents.map(ag => (
                <div
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    selectedAgent === ag.id
                      ? 'bg-zinc-900 border-rose-500 shadow-md shadow-rose-950/60'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-black border border-zinc-800">
                        {getAgentIcon(ag.id)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-100">{ag.name}</p>
                        <p className="text-[10px] text-rose-400 font-medium">{ag.nepaliName}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                      {ag.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed mb-2.5">
                    {ag.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ag.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono bg-black text-zinc-400 px-2 py-0.5 rounded border border-zinc-800"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Jobs & Task Queue View with Live Progress & Expandable Artifacts */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
              {language === 'ne' ? 'कार्य प्रगति तथा इतिहास (Live Pipeline)' : 'Autonomous Multi-Step Execution Pipeline'}
            </h2>
            <span className="text-[10px] text-zinc-400 font-mono">{jobs.length} Active / Completed Jobs</span>
          </div>

          {jobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No jobs dispatched yet. Select an agent or preset above to start.
            </div>
          ) : (
            jobs.map(job => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-black border border-zinc-800">
                      {getAgentIcon(job.primaryAgent)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-100">{job.title}</h3>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Lead: {job.primaryAgent} • {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Status & Controls */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : job.status === 'RUNNING'
                          ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                          : job.status === 'PAUSED'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-red-950 text-red-400 border-red-800'
                      }`}
                    >
                      {job.status}
                    </span>

                    {/* Pause / Resume / Cancel Controls */}
                    {job.status === 'RUNNING' && (
                      <button
                        onClick={() => handleJobAction(job.id, 'pause')}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-400 transition-colors"
                        title="Pause Job"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {job.status === 'PAUSED' && (
                      <button
                        onClick={() => handleJobAction(job.id, 'resume')}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-400 transition-colors"
                        title="Resume Job"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(job.status === 'RUNNING' || job.status === 'PAUSED') && (
                      <button
                        onClick={() => handleJobAction(job.id, 'cancel')}
                        className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-rose-400 transition-colors"
                        title="Cancel Job"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>Task Completion</span>
                    <span className="text-zinc-200 font-bold">{job.overallProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 via-red-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${job.overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* Sub-steps with Expandable Output Artifacts */}
                <div className="space-y-1.5 pt-1">
                  {job.steps.map(step => {
                    const isExpanded = expandedStepId === step.id;
                    return (
                      <div
                        key={step.id}
                        className="rounded-xl bg-black border border-zinc-800/80 overflow-hidden text-[11px]"
                      >
                        <div
                          onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-zinc-900/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {step.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : step.status === 'RUNNING' ? (
                              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            )}
                            <span className="text-zinc-300 font-medium">{step.stepName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-400">
                              {step.status === 'COMPLETED' ? 'Done' : `${step.progress}%`}
                            </span>
                            {step.output && (
                              isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                              )
                            )}
                          </div>
                        </div>

                        {/* Expandable Step Output */}
                        {isExpanded && step.output && (
                          <div className="p-3 bg-zinc-950 border-t border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                Verified Step Artifact ({step.agentId}):
                              </span>
                              <button
                                onClick={() => copyToClipboard(step.output || '', step.id)}
                                className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200"
                              >
                                {copiedStepId === step.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Artifact</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap bg-black p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed overflow-x-auto">
                              {step.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Result Summary */}
                {job.resultSummary && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-zinc-200 leading-relaxed font-sans">
                    <p className="font-bold text-rose-400 text-[10px] uppercase font-mono mb-1">
                      Orchestrator Final Synthesis:
                    </p>
                    <p className="whitespace-pre-wrap text-[11px]">{job.resultSummary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
