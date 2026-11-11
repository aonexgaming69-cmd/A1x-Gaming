import {
  AgentId,
  SpecializedAgent,
  SystemMode,
  SystemModeConfig,
  AutomationWorkflow,
  AgentSkill,
  OwnerProfile
} from '../types/ammu.js';

export const OFFICIAL_OWNER: OwnerProfile = {
  name: 'AMAN',
  username: 'aman_owner',
  ownerId: 'MAFIA-OWNER-AMAN-001',
  role: 'SUPER OWNER',
  country: 'NEPAL',
  isSuperOwner: true,
  securityClearance: 'LEVEL_10_ROOT',
  authenticated: true,
  lastLoginTimestamp: Date.now()
};

export const SPECIALIZED_AGENTS: SpecializedAgent[] = [
  {
    id: 'core_orchestrator',
    name: 'Core Orchestrator',
    nepaliName: 'कोर अर्केस्ट्रेटर एजेन्ट',
    role: 'Multi-Agent Coordination & DAG Planning',
    description: 'Autonomous central brain that decomposes user intent, coordinates 12 specialized sub-agents, and verifies results.',
    icon: 'BrainCircuit',
    status: 'ACTIVE',
    capabilities: ['Task Decomposition', 'DAG Scheduling', 'Agent Routing', 'Deliverable Validation']
  },
  {
    id: 'intelligence_agent',
    name: 'Intelligence Agent',
    nepaliName: 'इन्टेलिजेन्स (रिसर्च) एजेन्ट',
    role: 'Deep Research & Knowledge Retrieval',
    description: 'Executes comprehensive queries, gathers factual intelligence, summarizes articles, and provides citations.',
    icon: 'Search',
    status: 'ACTIVE',
    capabilities: ['Multi-Source Query', 'Citation Verification', 'Fact Checking', 'Trend Analysis']
  },
  {
    id: 'creative_studio',
    name: 'Creative Studio Agent',
    nepaliName: 'रचनात्मक स्टुडियो एजेन्ट',
    role: 'Scriptwriting, Concepts & Storytelling',
    description: 'Writes engaging scripts for YouTube, TikTok, documentaries, crafts story outlines, and generates timed subtitles.',
    icon: 'Clapperboard',
    status: 'ACTIVE',
    capabilities: ['Video Scriptwriting', 'Subtitle Track Generation', 'Plot Structuring', 'Creative Ideation']
  },
  {
    id: 'image_agent',
    name: 'Image Agent',
    nepaliName: 'तस्वीर सिर्जना एजेन्ट',
    role: 'Actual Visual Synthesis & Artwork Generation',
    description: 'Synthesizes high-fidelity visual prompts, generates thumbnails, artistic illustrations, and social media banners.',
    icon: 'Image',
    status: 'ACTIVE',
    capabilities: ['Actual Image Generation', 'YouTube Thumbnails', 'Character Design', 'Devanagari Art']
  },
  {
    id: 'video_agent',
    name: 'Video Agent',
    nepaliName: 'भिडियो सिर्जना एजेन्ट',
    role: 'Video Planning, Storyboarding & Mastering',
    description: 'Plans cinematic sequences, generates camera movement directions, scene descriptions, and renders AI video prompts.',
    icon: 'Video',
    status: 'ACTIVE',
    capabilities: ['Scene-by-Scene Planning', 'Camera Choreography', 'Pacing & Transitions', '4K/8K Profiles']
  },
  {
    id: 'voice_agent',
    name: 'Voice Agent',
    nepaliName: 'आवाज एजेन्ट',
    role: 'Speech Recognition & Devanagari TTS',
    description: 'Multi-lingual real-time speech processing with Devanagari voice synthesis and instant intent parsing.',
    icon: 'Mic',
    status: 'ACTIVE',
    capabilities: ['Devanagari STT', 'Bilingual TTS', 'Voice Command Routing', 'Audio Streaming']
  },
  {
    id: 'android_agent',
    name: 'Android Agent',
    nepaliName: 'एन्ड्रोइड हार्डवेयर एजेन्ट',
    role: 'Permission-Based Native Device Control',
    description: 'Directly executes permission-based Android hardware tasks: torch, battery telemetry, volume, app launchers, and dialer.',
    icon: 'Smartphone',
    status: 'ACTIVE',
    capabilities: ['Torch / Flashlight', 'Battery Diagnostics', 'App Launch Intents', 'Safe Dialer Guard']
  },
  {
    id: 'productivity_agent',
    name: 'Productivity Agent',
    nepaliName: 'उत्पादकत्व एजेन्ट',
    role: 'Task Breakdown, Alarms & Exact Reminders',
    description: 'Schedules exact alarms, tracks recurring reminders, organizes task priority matrices, and maintains focus timelines.',
    icon: 'CheckSquare',
    status: 'ACTIVE',
    capabilities: ['Exact Alarm Dispatch', 'Pomodoro Cycles', 'Priority Categorization', 'Task Decomposition']
  },
  {
    id: 'workflow_agent',
    name: 'Workflow Agent',
    nepaliName: 'वर्कफ्लो अटोमेसन एजेन्ट',
    role: 'Smart Automation Chain Execution',
    description: 'Executes multi-step automated workflows with trigger evaluation, sensitivity gates, and audit trails.',
    icon: 'Zap',
    status: 'ACTIVE',
    capabilities: ['Trigger Matching', 'Sequential Step Execution', 'Sensitivity Confirmations', 'Audit Logging']
  },
  {
    id: 'coding_agent',
    name: 'Coding Agent',
    nepaliName: 'कोडिङ एजेन्ट',
    role: 'Full-Stack Software Architecture & Debugging',
    description: 'Generates robust TypeScript, Kotlin, React, and Python code, inspects runtime logs, and patches software bugs.',
    icon: 'Code',
    status: 'ACTIVE',
    capabilities: ['TypeScript & Kotlin', 'Code Refactoring', 'Algorithm Optimization', 'Bug Fixing']
  },
  {
    id: 'security_agent',
    name: 'Security Agent',
    nepaliName: 'सुरक्षा एजेन्ट',
    role: 'Device Guard, Privacy & Sandbox Audit',
    description: 'Monitors Android app permissions, enforces private incognito mode, protects sensitive data, and audits system integrity.',
    icon: 'ShieldAlert',
    status: 'ACTIVE',
    capabilities: ['Permission Auditing', 'Incognito Data Isolation', 'Dialer Guard Verification', 'Integrity Auditing']
  },
  {
    id: 'personal_assistant',
    name: 'Personal Assistant',
    nepaliName: 'व्यक्तिगत सहायक एजेन्ट',
    role: 'Memory Bank & Personal Productivity',
    description: 'Manages user routines, long-term semantic memories, daily greetings, and personalized briefings.',
    icon: 'UserCheck',
    status: 'ACTIVE',
    capabilities: ['Morning Briefings', 'Context Tracking', 'Voice Synthesis', 'Memory Bank']
  }
];

export const TWELVE_SKILLS: AgentSkill[] = [
  {
    id: 'skill_01_coordination',
    agentId: 'core_orchestrator',
    name: 'Multi-Agent Coordination & DAG Planning',
    category: 'ORCHESTRATION',
    description: 'Decomposes complex requests into sequential DAG execution phases across specialized sub-agents.',
    executableHandler: 'orchestrateMultiAgentDag',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_02_research',
    agentId: 'intelligence_agent',
    name: 'Deep Research & Knowledge Retrieval',
    category: 'RESEARCH',
    description: 'Queries live web sources, validates factual claims, and synthesizes Devanagari reports.',
    executableHandler: 'executeFactualResearch',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_03_content',
    agentId: 'creative_studio',
    name: 'Content Production & Scriptwriting',
    category: 'CONTENT',
    description: 'Generates structured scripts with hook, 3 scenes, call to action, and valid timed .SRT files.',
    executableHandler: 'produceStructuredScriptAndSrt',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_04_image',
    agentId: 'image_agent',
    name: 'Actual Image & Visual Generation',
    category: 'VISUAL',
    description: 'Synthesizes real images via Gemini image API or high-definition vector renders with download and sharing.',
    executableHandler: 'generateActualVisualAsset',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_05_video',
    agentId: 'video_agent',
    name: 'Video Planning, Storyboarding & Mastering',
    category: 'VIDEO',
    description: 'Produces frame-by-frame scene choreography, camera trajectories, transitions, and audio cues.',
    executableHandler: 'generateCinematicStoryboard',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_06_voice',
    agentId: 'voice_agent',
    name: 'Speech Recognition & Devanagari TTS',
    category: 'VOICE',
    description: 'Devanagari Web Speech STT, transcription reference guard, safety timer, and synthesized audio playback.',
    executableHandler: 'synthesizeSpeechResponse',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_07_android',
    agentId: 'android_agent',
    name: 'Permission-Based Android Device Control',
    category: 'HARDWARE',
    description: 'Executes flashlight toggle, battery telemetry, volume adjustments, and safe dialer intents.',
    executableHandler: 'executeDeviceHardwareAction',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_08_productivity',
    agentId: 'productivity_agent',
    name: 'Task Planning & Exact Reminder Scheduling',
    category: 'PRODUCTIVITY',
    description: 'Calculates exact alarm triggers, recurrence cycles, priority rankings, and persists alarms in JSON.',
    executableHandler: 'scheduleExactTaskReminder',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_09_workflow',
    agentId: 'workflow_agent',
    name: 'Automation Workflow Execution & Audit',
    category: 'AUTOMATION',
    description: 'Executes multi-step automated workflows with sensitivity confirmation and audit trail recording.',
    executableHandler: 'executeSmartWorkflowChain',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_10_coding',
    agentId: 'coding_agent',
    name: 'Software Engineering, Code Generation & Bug Fixing',
    category: 'ENGINEERING',
    description: 'Synthesizes clean TypeScript/Kotlin modules, identifies root causes, and executes unit tests.',
    executableHandler: 'generateEngineeredCodeSolution',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_11_security',
    agentId: 'security_agent',
    name: 'Security Audit & Automated Diagnostics',
    category: 'SECURITY',
    description: 'Verifies sandbox boundaries, audits declared Android permissions, and monitors system reliability.',
    executableHandler: 'runSecuritySandboxAudit',
    status: 'ACTIVE',
    testResult: 'PASS'
  },
  {
    id: 'skill_12_memory',
    agentId: 'personal_assistant',
    name: 'Semantic Memory Bank & Personal Productivity',
    category: 'PERSONAL',
    description: 'Stores long-term user preferences, recalls personal context, and coordinates morning briefings.',
    executableHandler: 'manageSemanticMemoryBank',
    status: 'ACTIVE',
    testResult: 'PASS'
  }
];

export const SYSTEM_MODES: Record<SystemMode, SystemModeConfig> = {
  JARVIS: {
    mode: 'JARVIS',
    name: 'JARVIS Mode',
    themeColor: 'cyan',
    accentHex: '#06b6d4',
    bgClass: 'bg-slate-950',
    description: 'Composed, intelligent, voice-first personal companion with animated Arc Reactor core.',
    activeAgents: ['personal_assistant', 'phone_control', 'productivity', 'research'],
    isPrivate: false,
    isOfflineOnly: false
  },
  DANGER: {
    mode: 'DANGER',
    name: 'DANGER Mode',
    themeColor: 'red',
    accentHex: '#ef4444',
    bgClass: 'bg-red-950/20',
    description: 'Tactical high-alert interface. Red alert HUD, strict security verification, emergency shortcuts, battery saver.',
    activeAgents: ['security', 'phone_control', 'personal_assistant'],
    isPrivate: true,
    isOfflineOnly: false
  },
  CREATIVE: {
    mode: 'CREATIVE',
    name: 'Creative Studio Mode',
    themeColor: 'fuchsia',
    accentHex: '#d946ef',
    bgClass: 'bg-fuchsia-950/20',
    description: 'Optimized for content creation: scriptwriting, thumbnail generation, video sequencing, and subtitles.',
    activeAgents: ['creative_studio', 'image_gen', 'video_gen', 'video_enhancement'],
    isPrivate: false,
    isOfflineOnly: false
  },
  RESEARCH: {
    mode: 'RESEARCH',
    name: 'Research Mode',
    themeColor: 'emerald',
    accentHex: '#10b981',
    bgClass: 'bg-emerald-950/20',
    description: 'Academic and scientific focus. Multi-source fact checking, literature synthesis, and citation index.',
    activeAgents: ['research', 'document', 'productivity'],
    isPrivate: false,
    isOfflineOnly: false
  },
  STUDY: {
    mode: 'STUDY',
    name: 'Study & Language Mode',
    themeColor: 'amber',
    accentHex: '#f59e0b',
    bgClass: 'bg-amber-950/20',
    description: 'Focus timer, concept breakdowns, Nepali & Devanagari language learning, and flashcards.',
    activeAgents: ['document', 'productivity', 'personal_assistant'],
    isPrivate: false,
    isOfflineOnly: false
  },
  GAMING: {
    mode: 'GAMING',
    name: 'Gaming & Performance Mode',
    themeColor: 'lime',
    accentHex: '#84cc16',
    bgClass: 'bg-lime-950/20',
    description: 'High-performance low-latency HUD, Do Not Disturb, game booster shortcuts, and ping monitor.',
    activeAgents: ['phone_control', 'security'],
    isPrivate: false,
    isOfflineOnly: false
  },
  DEVELOPER: {
    mode: 'DEVELOPER',
    name: 'Developer Mode',
    themeColor: 'emerald',
    accentHex: '#10b981',
    bgClass: 'bg-slate-950',
    description: 'Terminal console, native bridge inspector, raw JSON endpoints, and debug logging.',
    activeAgents: ['security', 'phone_control', 'document'],
    isPrivate: false,
    isOfflineOnly: false
  },
  PRIVATE: {
    mode: 'PRIVATE',
    name: 'Private Incognito Mode',
    themeColor: 'slate',
    accentHex: '#94a3b8',
    bgClass: 'bg-black',
    description: 'Zero memory retention. All queries remain in ephemeral memory and are immediately expunged.',
    activeAgents: ['security', 'personal_assistant'],
    isPrivate: true,
    isOfflineOnly: false
  },
  OFFLINE: {
    mode: 'OFFLINE',
    name: 'Offline On-Device Mode',
    themeColor: 'orange',
    accentHex: '#f97316',
    bgClass: 'bg-orange-950/20',
    description: 'Completely disconnects external AI calls. Relies purely on Android local rules, alarms, and offline speech.',
    activeAgents: ['phone_control', 'productivity'],
    isPrivate: true,
    isOfflineOnly: true
  }
};

export const PRESET_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'wf_morning',
    name: 'Good Morning Routine',
    nepaliName: 'शुभ प्रभात दिनचर्या',
    triggerPhrase: 'Good morning MAFIA',
    description: 'Executes morning briefing: weather forecast, battery health check, pending reminders schedule, and inspirational quote.',
    icon: 'Sun',
    steps: [
      { id: 's1', action: 'WEATHER_CHECK', description: 'Query Kathmandu / regional weather forecast', requiresConfirmation: false, isExecuted: false },
      { id: 's2', action: 'BATTERY_TELEMETRY', description: 'Inspect device battery level and charging status', requiresConfirmation: false, isExecuted: false },
      { id: 's3', action: 'REMINDERS_AUDIT', description: 'Retrieve pending alarms scheduled for today', requiresConfirmation: false, isExecuted: false },
      { id: 's4', action: 'VOICE_BRIEFING', description: 'Synthesize morning greeting in Nepali & English', requiresConfirmation: false, isExecuted: false }
    ]
  },
  {
    id: 'wf_youtube',
    name: 'Prepare YouTube Video Workflow',
    nepaliName: 'यूट्यूब भिडियो तयारी',
    triggerPhrase: 'MAFIA, prepare my YouTube video',
    description: 'Automates creative pipeline: generates video script, creates thumbnail prompt, formats SRT subtitles, and drafts description.',
    icon: 'Video',
    steps: [
      { id: 's1', action: 'GENERATE_SCRIPT', description: 'Draft 5-minute engaging video script with hook', requiresConfirmation: false, isExecuted: false },
      { id: 's2', action: 'GENERATE_THUMBNAIL_PROMPT', description: 'Synthesize high-CTR thumbnail composition concept', requiresConfirmation: false, isExecuted: false },
      { id: 's3', action: 'GENERATE_SUBTITLES', description: 'Export timed .srt subtitle track file', requiresConfirmation: false, isExecuted: false },
      { id: 's4', action: 'OPEN_YOUTUBE_APP', description: 'Launch YouTube Creator Studio application', requiresConfirmation: true, isExecuted: false }
    ]
  },
  {
    id: 'wf_security',
    name: 'Security Lockdown & Organize',
    nepaliName: 'सुरक्षा लकडाउन तथा फाइल व्यवस्थापन',
    triggerPhrase: 'MAFIA, organize my downloads and secure device',
    description: 'Audits Android app permissions, checks storage availability, enables Private Mode, and verifies dialer safety.',
    icon: 'ShieldCheck',
    steps: [
      { id: 's1', action: 'AUDIT_PERMISSIONS', description: 'Verify camera, mic, and phone permissions', requiresConfirmation: false, isExecuted: false },
      { id: 's2', action: 'CHECK_STORAGE', description: 'Calculate free on-device memory and cache', requiresConfirmation: false, isExecuted: false },
      { id: 's3', action: 'CLEAR_TEMP_CACHE', description: 'Purge transient logs and temp session caches', requiresConfirmation: true, isExecuted: false },
      { id: 's4', action: 'ENABLE_LOCKDOWN', description: 'Switch active subsystem to DANGER/Security Mode', requiresConfirmation: true, isExecuted: false }
    ]
  }
];
