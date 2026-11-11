import test from 'node:test';
import assert from 'node:assert/strict';
import { planTask, executeToolAction } from './agent-orchestrator.js';

test('Test 1: General question decomposes into valid multi-agent execution steps', () => {
  const plan = planTask('What is the capital of Nepal and its current timezone?', 'personal_assistant', 'en');
  assert.ok(plan.steps.length >= 2, 'Must have at least 2 steps');
  assert.ok(plan.assignedAgents.length >= 1, 'Must have assigned agents');
  
  const step1 = plan.steps[0];
  const result = executeToolAction(step1.toolName, step1.agentId, step1.parameters, 'en');
  assert.equal(result.success, true);
  assert.ok(result.output.length > 20, 'Output must be substantive');
});

test('Test 2: Document creation task generates structured markdown document with sections', () => {
  const plan = planTask('Create a detailed strategic report on AI safety in Nepal', 'document', 'ne');
  assert.ok(plan.steps.some(s => s.agentId === 'document'), 'Document agent must be assigned');
  
  const docStep = plan.steps.find(s => s.agentId === 'document');
  assert.ok(docStep, 'Must find document step');
  
  const result = executeToolAction(docStep.toolName, docStep.agentId, docStep.parameters, 'ne');
  assert.equal(result.success, true);
  assert.ok(result.output.includes('EXECUTIVE REPORT'), 'Must contain executive report heading');
  assert.ok(result.output.includes('Key Findings'), 'Must contain findings');
});

test('Test 3: Research topic retrieves factual points and sources', () => {
  const plan = planTask('Research quantum computing breakthroughs in 2026', 'research', 'en');
  assert.ok(plan.steps.some(s => s.agentId === 'research' || s.agentId === 'web_search'), 'Research or web search must be included');
  
  const researchStep = plan.steps[0];
  const result = executeToolAction(researchStep.toolName, researchStep.agentId, researchStep.parameters, 'en');
  assert.equal(result.success, true);
  assert.ok(result.output.includes('Target Query') || result.output.includes('Verified'), 'Must verify factual search');
});

test('Test 4: Image generation agent creates prompt engineering and thumbnail specs', () => {
  const plan = planTask('Create an image of an AI superhero in Kathmandu with neon lights', 'image_gen', 'en');
  assert.ok(plan.steps.length >= 2, 'Must decompose image task');
  
  const result = executeToolAction('tool_thumbnail_generator', 'image_gen', { title: 'AI Superhero', style: 'cinematic' }, 'en');
  assert.equal(result.success, true);
  assert.ok(result.output.includes('Prompt for Imagen 3') || result.output.includes('Color Palette'), 'Must have prompt specs');
  assert.ok(result.output.includes('16:9'), 'Must include aspect ratio');
});

test('Test 5: Multi-step task "Create a viral YouTube reel" executes complete 5-phase pipeline', () => {
  const plan = planTask('Create a viral YouTube reel about AI technology', 'creative_studio', 'ne');
  assert.equal(plan.steps.length, 5, 'Must have 5 phases: Trend, Script, Thumbnail, Storyboard, Mastering');
  
  const phases = plan.steps.map(s => s.agentId);
  assert.ok(phases.includes('research'), 'Phase 1: Research');
  assert.ok(phases.includes('creative_studio'), 'Phase 2: Script');
  assert.ok(phases.includes('image_gen'), 'Phase 3: Image / Thumbnail');
  assert.ok(phases.includes('video_gen'), 'Phase 4: Video Storyboard');
  assert.ok(phases.includes('video_enhancement'), 'Phase 5: Video Enhancement / 4K');
  
  // Verify Script contains timed subtitles (.SRT)
  const scriptStep = plan.steps.find(s => s.agentId === 'creative_studio')!;
  const scriptResult = executeToolAction(scriptStep.toolName, scriptStep.agentId, scriptStep.parameters, 'ne');
  assert.equal(scriptResult.success, true);
  assert.ok(scriptResult.output.includes('TIMED SUBTITLES (.SRT)'), 'Must include timed subtitles');
  assert.ok(scriptResult.output.includes('00:00:00,000'), 'Must contain SRT timestamps');
});
