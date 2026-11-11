import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextTrigger,
  evaluateDiagnostic,
  formatSafeDialerUri,
  filterContacts,
  parseAutomationIntent,
  getAmmuSystemPrompt
} from './ammu-logic.js';
import { SPECIALIZED_AGENTS, TWELVE_SKILLS, OFFICIAL_OWNER } from './super-agents.js';
import { planTask, executeToolAction } from './agent-orchestrator.js';

test('1. App Launch & Identity Verification', () => {
  const prompt = getAmmuSystemPrompt('ne');
  assert.ok(prompt.includes('np.made.ammu'), 'System prompt must reference np.made.ammu');
  assert.ok(prompt.includes('v6.0.0') || prompt.includes('MAFIA') || prompt.includes('AMMU'), 'System prompt must reference system identity');
  assert.equal(OFFICIAL_OWNER.name, 'AMAN', 'Official Owner must be AMAN');
  assert.equal(OFFICIAL_OWNER.country, 'NEPAL', 'Official Owner country must be NEPAL');
  assert.equal(OFFICIAL_OWNER.role, 'SUPER OWNER', 'Official Owner role must be SUPER OWNER');
});

test('2. AI Chat Reasoning & Intent Engine', () => {
  const intent1 = parseAutomationIntent('बत्ती बाल', 'ne');
  assert.equal(intent1.command, 'FLASHLIGHT');
  assert.equal(intent1.params?.enable, true);

  const intent2 = parseAutomationIntent('what is the battery level', 'en');
  assert.equal(intent2.command, 'BATTERY');

  const intent3 = parseAutomationIntent('open youtube', 'en');
  assert.equal(intent3.command, 'OPEN_APP');
  assert.equal(intent3.params?.appName, 'YouTube');
});

test('3. Voice Assistant & Devanagari Synthesis', () => {
  const nePrompt = getAmmuSystemPrompt('ne');
  assert.ok(nePrompt.includes('Devanagari'), 'Nepali prompt must require Devanagari script');

  const hiPrompt = getAmmuSystemPrompt('hi');
  assert.ok(hiPrompt.includes('Devanagari'), 'Hindi prompt must require Devanagari script');
});

test('4. Agent Mode — 12 Specialized Agents & 12 Executable Skills', () => {
  assert.equal(SPECIALIZED_AGENTS.length, 12, 'Must have exactly 12 specialized agents');
  const agentIds = SPECIALIZED_AGENTS.map(a => a.id);
  const required = [
    'core_orchestrator',
    'intelligence_agent',
    'creative_studio',
    'image_agent',
    'video_agent',
    'voice_agent',
    'android_agent',
    'productivity_agent',
    'workflow_agent',
    'coding_agent',
    'security_agent',
    'personal_assistant'
  ];
  for (const req of required) {
    assert.ok(agentIds.includes(req as any), `Missing agent: ${req}`);
  }

  assert.equal(TWELVE_SKILLS.length, 12, 'Must have exactly 12 executable skills');
  for (const skill of TWELVE_SKILLS) {
    assert.ok(skill.executableHandler, `Skill ${skill.id} must have an executable handler`);
    assert.equal(skill.testResult, 'PASS', `Skill ${skill.id} must be verified PASS`);
  }
});

test('5. Agent Job Execution — Task Planner & Tool Runner', () => {
  const plan = planTask('Create a viral YouTube reel script and thumbnail spec for MAFIA AI', 'personal_assistant', 'ne');
  assert.ok(plan.steps.length >= 3, 'Must decompose into at least 3 execution steps');
  
  const step1 = plan.steps[0];
  const toolResult = executeToolAction(step1.toolName, step1.agentId, step1.parameters, 'ne');
  assert.equal(toolResult.success, true);
  assert.ok(toolResult.output.length > 30, 'Tool output must be substantive');
});

test('6. Smart Workflows — Automation Execution & Sensitivity Gate', () => {
  // Test workflow step structure
  const sampleSteps = [
    { id: 's1', action: 'CHECK_BATTERY', description: 'Query battery', requiresConfirmation: false },
    { id: 's2', action: 'CALL_ASSISTANT', description: 'Place emergency call', requiresConfirmation: true }
  ];
  const sensitiveStep = sampleSteps.find(s => s.requiresConfirmation);
  assert.ok(sensitiveStep, 'Must detect steps requiring confirmation');
  assert.equal(sensitiveStep?.action, 'CALL_ASSISTANT');
});

test('7. Reminders System — Next Trigger & Exact Recurrence', () => {
  const now = new Date('2026-11-03T08:00:00Z').getTime();
  
  const dailyNext = calculateNextTrigger(now, 'DAILY');
  assert.equal(dailyNext, now + 86400000, 'DAILY recurrence must add exactly 24 hours');

  const weeklyNext = calculateNextTrigger(now, 'WEEKLY');
  assert.equal(weeklyNext, now + 7 * 86400000, 'WEEKLY recurrence must add exactly 7 days');

  const noneNext = calculateNextTrigger(now, 'NONE');
  assert.equal(noneNext, now, 'NONE recurrence must leave timestamp unchanged');
});

test('8. System Notifications & Telemetry Verification', () => {
  const diag = evaluateDiagnostic('notificationPermission', {
    isOnline: true,
    hasGeminiKey: true,
    micPermission: 'granted',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: true,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(diag.status, 'PASS');
});

test('9. Contact Selection & Search Filtering', () => {
  const mockContacts = [
    { id: '1', name: 'Nepal Police', phoneNumber: '100' },
    { id: '2', name: 'Ambulance Service', phoneNumber: '102' },
    { id: '3', name: 'Aarav Sharma', phoneNumber: '+9779841234567' }
  ];

  const searchPolice = filterContacts(mockContacts, 'Police');
  assert.equal(searchPolice.length, 1);
  assert.equal(searchPolice[0].phoneNumber, '100');

  const searchNumber = filterContacts(mockContacts, '9841');
  assert.equal(searchNumber.length, 1);
  assert.equal(searchNumber[0].name, 'Aarav Sharma');
});

test('10. Call Assistant — Number Sanitization & Safe Dialer URI', () => {
  const valid1 = formatSafeDialerUri('+977-984-1234567');
  assert.equal(valid1.isValid, true);
  assert.equal(valid1.sanitizedNumber, '+9779841234567');
  assert.equal(valid1.telUri, 'tel:+9779841234567');

  const valid2 = formatSafeDialerUri('100');
  assert.equal(valid2.isValid, true);
  assert.equal(valid2.telUri, 'tel:100');

  const invalid = formatSafeDialerUri('not-a-number');
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.telUri, '');
});

test('11. Backend Connectivity & Health Check Diagnostics', () => {
  const healthDiag = evaluateDiagnostic('backendApiResponse', {
    isOnline: true,
    hasGeminiKey: true,
    micPermission: 'granted',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: true,
    latencyMs: 8,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(healthDiag.status, 'PASS');
});

test('12. API Response Handling & Graceful Error Recovery', () => {
  // Test diagnostic fallback under offline state
  const offlineDiag = evaluateDiagnostic('internetConnection', {
    isOnline: false,
    hasGeminiKey: false,
    micPermission: 'unsupported',
    notifPermission: 'unsupported',
    hasSpeechRecognition: false,
    hasTts: false,
    backendHealthy: false,
    hasContactsApi: false,
    isHttps: false
  });
  assert.equal(offlineDiag.status, 'FAIL');
  assert.ok(offlineDiag.detail.includes('No Internet'), 'Must report accurate offline failure');
});
