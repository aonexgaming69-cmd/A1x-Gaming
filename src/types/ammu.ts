export type LanguageCode = 'ne' | 'hi' | 'en';

export type NavigationTab =
  | 'home'
  | 'chat'
  | 'voice'
  | 'reminders'
  | 'calls'
  | 'health'
  | 'server'
  | 'memory'
  | 'settings'
  | 'agents'
  | 'studio'
  | 'knowledge'
  | 'workflows'
  | 'monitor'
  | 'dashboard'
  | 'owner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language?: LanguageCode;
  isStreaming?: boolean;
  error?: boolean;
}

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'WEEKDAYS' | 'MONTHLY';
export type ReminderPriority = 'NORMAL' | 'MEDIUM' | 'HIGH';

export interface Reminder {
  id: string;
  title: string;
  note?: string;
  dueTimestamp: number;
  recurrence: RecurrenceType;
  priority: ReminderPriority;
  isCompleted: boolean;
  createdAt: number;
}

export type MemoryCategory = 'PREFERENCE' | 'FACT' | 'PERSON' | 'LOCATION' | 'TASK';

export interface MemoryFact {
  id: string;
  category: MemoryCategory;
  content: string;
  confidence: number;
  updatedAt: number;
}

export type HealthBadgeStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT CONFIGURED';

export interface DiagnosticItem {
  id: string;
  name: string;
  category: 'NETWORK' | 'AI_BACKEND' | 'PERMISSIONS' | 'HARDWARE_SERVICES' | 'STORAGE';
  status: HealthBadgeStatus;
  detail: string;
  latencyMs?: number;
}

export interface ContactItem {
  id: string;
  name: string;
  phoneNumber: string;
  label: string; // Mobile, Work, Emergency
  avatarColor?: string;
}

export interface ServerConfig {
  backendUrl: string;
  timeoutMs: number;
  enableAutoRetry: boolean;
  isOfflineMode: boolean;
  apiToken?: string;
}

export interface ApkReleaseInfo {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  sha256: string;
  signatureScheme: string;
  dexStatus: string;
  downloadUrl: string;
  tmpfilesUrl?: string;
  sourceZipUrl: string;
  permissions: string[];
}

export interface DeviceTelemetry {
  batteryLevel: number;
  isCharging: boolean;
  flashlightOn: boolean;
  volumeLevel: number;
  networkStatus: 'ONLINE' | 'OFFLINE';
  mode: 'JARVIS_ACTIVE' | 'STANDBY';
}

export interface CameraVisionResult {
  description: string;
  ocrText?: string;
  detectedObjects: string[];
  nepaliSummary: string;
  suggestedActions: string[];
  timestamp: number;
}

export interface AutomationCommand {
  id: string;
  type: 'OPEN_APP' | 'FLASHLIGHT' | 'CALL' | 'REMINDER' | 'BATTERY' | 'CAMERA' | 'MAPS' | 'VOLUME' | 'SEARCH' | 'CUSTOM';
  label: string;
  actionText: string;
  requiresConfirmation?: boolean;
  params?: Record<string, any>;
}

// ============================================
// 18. MAFIA AI SUPER AGENTS
// ============================================
export type AgentId =
  | 'core_orchestrator'
  | 'intelligence_agent'
  | 'creative_studio'
  | 'image_agent'
  | 'video_agent'
  | 'voice_agent'
  | 'android_agent'
  | 'productivity_agent'
  | 'workflow_agent'
  | 'coding_agent'
  | 'security_agent'
  | 'personal_assistant'
  // Backward-compatible aliases
  | 'research'
  | 'web_search'
  | 'image_gen'
  | 'video_gen'
  | 'video_enhancement'
  | 'phone_control'
  | 'document'
  | 'coding'
  | 'productivity'
  | 'security';

export interface SpecializedAgent {
  id: AgentId;
  name: string;
  nepaliName: string;
  role: string;
  description: string;
  icon: string;
  status: 'IDLE' | 'ACTIVE' | 'PROCESSING' | 'ERROR';
  capabilities: string[];
}

export type JobStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface JobStep {
  id: string;
  agentId: AgentId;
  stepName: string;
  status: JobStatus;
  progress: number; // 0 to 100
  output?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface AgentJob {
  id: string;
  title: string;
  requestedBy: string;
  primaryAgent: AgentId;
  status: JobStatus;
  overallProgress: number;
  steps: JobStep[];
  createdAt: number;
  updatedAt: number;
  resultSummary?: string;
}

// ============================================
// 19. PERSONAL KNOWLEDGE ENGINE
// ============================================
export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: 'PDF' | 'NOTE' | 'CONVERSATION' | 'RESEARCH' | 'PREFERENCE';
  tags: string[];
  extractedFacts: string[];
  nepaliSummary: string;
  createdAt: number;
  updatedAt: number;
  sizeBytes?: number;
}

// ============================================
// 20. AI CONTENT CREATOR STUDIO
// ============================================
export interface StudioProject {
  id: string;
  title: string;
  type: 'SCRIPT' | 'SUBTITLES' | 'IMAGE' | 'VIDEO_STORYBOARD' | 'THUMBNAIL' | 'MUSIC';
  language: LanguageCode;
  inputPrompt: string;
  outputData: any;
  createdAt: number;
}

export interface SubtitleCue {
  id: number;
  start: string; // "00:00:01,000"
  end: string;
  text: string;
}

// ============================================
// 21. SMART AUTOMATION WORKFLOWS
// ============================================
export interface WorkflowStep {
  id: string;
  action: string;
  description: string;
  requiresConfirmation: boolean;
  isExecuted: boolean;
  output?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  nepaliName: string;
  triggerPhrase: string;
  description: string;
  icon: string;
  steps: WorkflowStep[];
  isCustom?: boolean;
  createdAt?: number;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  startedAt: number;
  completedAt: number;
  stepsCount: number;
  executedSteps: string[];
}

// ============================================
// 22. MULTI-MODE SYSTEM
// ============================================
export type SystemMode =
  | 'JARVIS'
  | 'DANGER'
  | 'CREATIVE'
  | 'RESEARCH'
  | 'STUDY'
  | 'GAMING'
  | 'DEVELOPER'
  | 'PRIVATE'
  | 'OFFLINE';

export interface SystemModeConfig {
  mode: SystemMode;
  name: string;
  themeColor: string;
  accentHex: string;
  bgClass: string;
  description: string;
  activeAgents: AgentId[];
  isPrivate: boolean;
  isOfflineOnly: boolean;
}

// ============================================
// 23 & 24. ADVANCED SYSTEM MONITOR & RELIABILITY
// ============================================
export interface SystemMonitorMetrics {
  backendHealth: 'OPTIMAL' | 'DEGRADED' | 'OFFLINE';
  apiResponseTimeMs: number;
  networkConnectivity: 'ONLINE' | 'OFFLINE';
  aiProviderStatus: 'OPERATIONAL' | 'RATE_LIMITED' | 'UNAVAILABLE';
  activeQueueCount: number;
  storageAvailableMb: number;
  batteryConsumptionPctPerHour: number;
  apiRequestsTotal: number;
  estimatedApiCostUsd: number;
  reliabilityScorePct: number;
  autoRecoveriesCount: number;
  lastErrorLog?: string;
}

// ============================================
// 25. OWNER CONTROL CENTER & 12 AGENT SKILLS
// ============================================
export interface OwnerProfile {
  name: string; // AMAN
  username: string; // aman_owner
  ownerId: string; // MAFIA-OWNER-AMAN-001
  role: 'SUPER OWNER';
  country: string; // NEPAL
  isSuperOwner: boolean;
  securityClearance: string; // LEVEL_10_ROOT
  authenticated: boolean;
  lastLoginTimestamp?: number;
}

export interface AgentSkill {
  id: string;
  agentId: AgentId;
  name: string;
  category: string;
  description: string;
  executableHandler: string;
  status: 'ACTIVE' | 'TESTED' | 'STANDBY';
  lastTestedAt?: number;
  testResult?: 'PASS' | 'FAIL';
}

export type QaStatus = 'PASS' | 'FAIL' | 'NOT CONFIGURED' | 'NOT TESTED';

export interface QaReportItem {
  id: string;
  featureName: string;
  category: string;
  rootCause: string;
  fixApplied: string;
  status: QaStatus;
  remainingDependencies: string;
  verifiedAt: number;
}

export interface MaintenanceLog {
  id: string;
  timestamp: number;
  type: 'API_ERROR' | 'FRONTEND_ERROR' | 'AGENT_FAILURE' | 'WORKFLOW_FAILURE' | 'HEALTH_ANOMALY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  component: string;
  message: string;
  resolved: boolean;
  approvedByOwner?: boolean;
}


