import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextTrigger,
  evaluateDiagnostic,
  formatSafeDialerUri,
  filterContacts,
  getAmmuSystemPrompt
} from './ammu-logic.js';

test('calculateNextTrigger handles DAILY correctly', () => {
  const base = new Date('2026-11-03T10:00:00Z').getTime();
  const next = calculateNextTrigger(base, 'DAILY');
  const nextDate = new Date(next);
  assert.equal(nextDate.toISOString().slice(0, 10), '2026-11-04');
});

test('calculateNextTrigger handles WEEKLY correctly', () => {
  const base = new Date('2026-11-03T10:00:00Z').getTime();
  const next = calculateNextTrigger(base, 'WEEKLY');
  const nextDate = new Date(next);
  assert.equal(nextDate.toISOString().slice(0, 10), '2026-11-10');
});

test('calculateNextTrigger handles WEEKDAYS skipping weekends', () => {
  // Friday 2026-11-06 -> Monday 2026-11-09
  const friday = new Date('2026-11-06T10:00:00Z').getTime();
  const next = calculateNextTrigger(friday, 'WEEKDAYS');
  const nextDate = new Date(next);
  assert.equal(nextDate.toISOString().slice(0, 10), '2026-11-09');
});

test('formatSafeDialerUri validates and cleans phone numbers', () => {
  const nepaliMobile = formatSafeDialerUri('+977 984-1234567');
  assert.equal(nepaliMobile.isValid, true);
  assert.equal(nepaliMobile.sanitizedNumber, '+9779841234567');
  assert.equal(nepaliMobile.telUri, 'tel:+9779841234567');

  const invalidNum = formatSafeDialerUri('abc123');
  assert.equal(invalidNum.isValid, false);
  assert.equal(invalidNum.telUri, '');
});

test('filterContacts matches name and cleaned phone numbers', () => {
  const contacts = [
    { name: 'Ramesh Shrestha', phoneNumber: '+977 9841234567' },
    { name: 'Sita Sharma', phoneNumber: '+977 9851098765' },
    { name: 'Nepal Police', phoneNumber: '100' }
  ];

  const matchedByName = filterContacts(contacts, 'shrestha');
  assert.equal(matchedByName.length, 1);
  assert.equal(matchedByName[0].name, 'Ramesh Shrestha');

  const matchedByPhone = filterContacts(contacts, '98510');
  assert.equal(matchedByPhone.length, 1);
  assert.equal(matchedByPhone[0].name, 'Sita Sharma');
});

test('evaluateDiagnostic returns true statuses without fakes', () => {
  const resultPass = evaluateDiagnostic('internetConnection', {
    isOnline: true,
    hasGeminiKey: true,
    micPermission: 'granted',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: true,
    latencyMs: 12,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(resultPass.status, 'PASS');

  const resultFail = evaluateDiagnostic('internetConnection', {
    isOnline: false,
    hasGeminiKey: true,
    micPermission: 'granted',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: false,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(resultFail.status, 'FAIL');

  const resultBlocked = evaluateDiagnostic('microphonePermission', {
    isOnline: true,
    hasGeminiKey: true,
    micPermission: 'denied',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: true,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(resultBlocked.status, 'BLOCKED');

  const resultNotConfigured = evaluateDiagnostic('aiProviderConnection', {
    isOnline: true,
    hasGeminiKey: false,
    micPermission: 'granted',
    notifPermission: 'granted',
    hasSpeechRecognition: true,
    hasTts: true,
    backendHealthy: true,
    hasContactsApi: true,
    isHttps: true
  });
  assert.equal(resultNotConfigured.status, 'NOT CONFIGURED');
});

test('getAmmuSystemPrompt includes Nepali instructions and memory context', () => {
  const prompt = getAmmuSystemPrompt('ne', [
    { id: '1', category: 'PREFERENCE', content: 'Prefers tea with cardamom', confidence: 1, updatedAt: 0 }
  ]);
  assert.match(prompt, /AMMU AI/);
  assert.match(prompt, /नेपाली/);
  assert.match(prompt, /Prefers tea with cardamom/);
});
