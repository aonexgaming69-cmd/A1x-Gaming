import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Video,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  Lock,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  History,
  Layers,
  Smartphone,
  X,
  Check,
  Radio
} from 'lucide-react';
import { AutomationWorkflow, WorkflowStep, WorkflowExecutionLog, LanguageCode } from '../types/ammu.js';
import {
  fetchWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  fetchWorkflowHistory,
  clearWorkflowHistory
} from '../services/api.js';

interface AutomationWorkflowsScreenProps {
  language: LanguageCode;
}

export const AutomationWorkflowsScreen: React.FC<AutomationWorkflowsScreenProps> = ({ language }) => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [history, setHistory] = useState<WorkflowExecutionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'workflows' | 'builder' | 'history'>('workflows');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<AutomationWorkflow | null>(null);
  const [confirmStep, setConfirmStep] = useState<WorkflowStep | null>(null);
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);
  const [executionStepIndex, setExecutionStepIndex] = useState<number>(-1);

  // Workflow Builder State
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNepaliName, setFormNepaliName] = useState('');
  const [formTrigger, setFormTrigger] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Zap');
  const [formSteps, setFormSteps] = useState<Array<{ id: string; action: string; description: string; requiresConfirmation: boolean }>>([
    { id: 's_1', action: 'CHECK_BATTERY', description: 'Query battery & hardware telemetry', requiresConfirmation: false },
    { id: 's_2', action: 'SPEAK_GREETING', description: 'Synthesize morning briefing in Nepali', requiresConfirmation: false }
  ]);

  const loadData = async () => {
    try {
      const [wfList, histList] = await Promise.all([fetchWorkflows(), fetchWorkflowHistory()]);
      setWorkflows(wfList);
      setHistory(histList);
    } catch (e) {
      console.warn('Load workflows error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunWorkflow = async (wf: AutomationWorkflow) => {
    // Check if any step requires sensitive confirmation first
    const sensitive = wf.steps.find(s => s.requiresConfirmation && !s.isExecuted);
    if (sensitive) {
      setActiveWorkflow(wf);
      setConfirmStep(sensitive);
      return;
    }

    setIsExecuting(true);
    setActiveWorkflow(wf);
    setExecutionMessage(null);
    setExecutionStepIndex(0);

    try {
      // Step through animation
      for (let i = 0; i < wf.steps.length; i++) {
        setExecutionStepIndex(i);
        await new Promise(r => setTimeout(r, 600));
      }

      const res = await executeWorkflow(wf.id);
      setWorkflows(prev => prev.map(w => (w.id === wf.id ? res.workflow : w)));
      setActiveWorkflow(res.workflow);
      setExecutionMessage(
        res.message || (language === 'ne' ? `${wf.nepaliName} सफलतापूर्वक सम्पन्न भयो!` : `${wf.name} completed successfully.`)
      );
      // Reload history
      fetchWorkflowHistory().then(setHistory).catch(() => {});
    } catch (e: any) {
      console.error('Workflow run error:', e);
      setExecutionMessage(`Execution Error: ${e.message || 'Routine failed'}`);
    } finally {
      setIsExecuting(false);
      setExecutionStepIndex(-1);
    }
  };

  const handleConfirmAction = async () => {
    if (!activeWorkflow || !confirmStep) return;
    setConfirmStep(null);
    setIsExecuting(true);
    try {
      const res = await executeWorkflow(activeWorkflow.id);
      setWorkflows(prev => prev.map(w => (w.id === activeWorkflow.id ? res.workflow : w)));
      setActiveWorkflow(res.workflow);
      setExecutionMessage(language === 'ne' ? 'स्वीकृत कार्य सुरक्षित रूपमा सम्पन्न भयो।' : 'Authorized action executed safely.');
      fetchWorkflowHistory().then(setHistory).catch(() => {});
    } catch (e) {
      console.error('Execution error:', e);
    } finally {
      setIsExecuting(false);
    }
  };

  const openBuilderForCreate = () => {
    setEditingWorkflowId(null);
    setFormName('');
    setFormNepaliName('');
    setFormTrigger('');
    setFormDesc('');
    setFormIcon('Zap');
    setFormSteps([
      { id: 's_1', action: 'CHECK_STATUS', description: 'Inspect system connectivity and status', requiresConfirmation: false },
      { id: 's_2', action: 'ACTION_EXECUTE', description: 'Execute primary automation action', requiresConfirmation: false }
    ]);
    setActiveTab('builder');
  };

  const openBuilderForEdit = (wf: AutomationWorkflow) => {
    setEditingWorkflowId(wf.id);
    setFormName(wf.name);
    setFormNepaliName(wf.nepaliName);
    setFormTrigger(wf.triggerPhrase);
    setFormDesc(wf.description);
    setFormIcon(wf.icon);
    setFormSteps(
      wf.steps.map(s => ({
        id: s.id,
        action: s.action,
        description: s.description,
        requiresConfirmation: s.requiresConfirmation
      }))
    );
    setActiveTab('builder');
  };

  const handleSaveWorkflow = async () => {
    if (!formName.trim() || !formTrigger.trim()) return;

    try {
      const payload: Partial<AutomationWorkflow> = {
        name: formName,
        nepaliName: formNepaliName || formName,
        triggerPhrase: formTrigger,
        description: formDesc || 'Custom Workflow',
        icon: formIcon,
        steps: formSteps.map((s, idx) => ({
          id: s.id || `s_${idx + 1}`,
          action: s.action,
          description: s.description,
          requiresConfirmation: s.requiresConfirmation,
          isExecuted: false
        }))
      };

      if (editingWorkflowId) {
        const updated = await updateWorkflow(editingWorkflowId, payload);
        setWorkflows(prev => prev.map(w => (w.id === editingWorkflowId ? updated : w)));
      } else {
        const created = await createWorkflow(payload);
        setWorkflows(prev => [...prev, created]);
      }
      setActiveTab('workflows');
    } catch (e) {
      console.error('Failed to save workflow:', e);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (activeWorkflow?.id === id) setActiveWorkflow(null);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearWorkflowHistory();
      setHistory([]);
    } catch (e) {
      console.error('Clear history error:', e);
    }
  };

  const addStepToForm = () => {
    setFormSteps(prev => [
      ...prev,
      {
        id: `s_${prev.length + 1}`,
        action: 'CUSTOM_STEP',
        description: `Action step ${prev.length + 1}`,
        requiresConfirmation: false
      }
    ]);
  };

  const removeStepFromForm = (idx: number) => {
    setFormSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const getWorkflowIcon = (icon: string) => {
    switch (icon) {
      case 'Sun': return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Video': return <Video className="w-5 h-5 text-rose-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-teal-400" />;
      default: return <Zap className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-8 overflow-y-auto bg-black text-slate-100">
      {/* Header Banner - MAFIA NEXUS Styling */}
      <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black border border-rose-500/50 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-950/80">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-zinc-100">
                SMART WORKFLOW ENGINE
              </h1>
              <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-700/60 px-2 py-0.5 rounded-full font-mono">
                AUTONOMOUS ROUTINES
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {language === 'ne'
                ? 'बहु-चरणीय स्वचालित कार्यप्रवाह र सुरक्षा प्रमाणीकरण'
                : 'Multi-Step Event Triggers, Conditional Execution & History'}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'workflows' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Workflows ({workflows.length})
          </button>
          <button
            onClick={openBuilderForCreate}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'builder' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'history' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* Execution Toast / Notice */}
      {executionMessage && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
            <span>{executionMessage}</span>
          </div>
          <button onClick={() => setExecutionMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: WORKFLOWS LIST */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
              {language === 'ne' ? 'उपलब्ध स्वचालित कार्यप्रवाहहरू' : 'Configured Automation Workflows'}
            </h2>
            <button
              onClick={openBuilderForCreate}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Routine</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflows.map(wf => (
              <div
                key={wf.id}
                className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-rose-900/60 transition-all flex flex-col justify-between space-y-3.5 shadow-xl group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center">
                        {getWorkflowIcon(wf.icon)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-zinc-100">{wf.name}</h3>
                        <p className="text-[10px] text-rose-400 font-medium">{wf.nepaliName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {wf.isCustom && (
                        <button
                          onClick={() => openBuilderForEdit(wf)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                          title="Edit Workflow"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {wf.isCustom && (
                        <button
                          onClick={() => handleDeleteWorkflow(wf.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                          title="Delete Workflow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                    {wf.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-black border border-zinc-800/80 space-y-1 mb-2">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Voice Activation Trigger:</span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">"{wf.triggerPhrase}"</span>
                  </div>

                  {/* Steps preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Sequential Steps ({wf.steps.length}):
                    </span>
                    <div className="space-y-1">
                      {wf.steps.map((st, i) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                        >
                          <span className="text-zinc-300">
                            {i + 1}. {st.description}
                          </span>
                          {st.requiresConfirmation ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/80">
                              <Lock className="w-2.5 h-2.5" /> Confirm
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-emerald-400">Auto</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRunWorkflow(wf)}
                  disabled={isExecuting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold py-2.5 rounded-2xl text-xs transition-all shadow-md shadow-rose-950/60 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecuting && activeWorkflow?.id === wf.id ? 'animate-spin' : ''}`} />
                  <span>
                    {isExecuting && activeWorkflow?.id === wf.id
                      ? 'EXECUTING ROUTINE...'
                      : language === 'ne'
                      ? 'वर्कफ्लो चलाउनुहोस् (Run)'
                      : 'Execute Routine'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WORKFLOW BUILDER (CREATE / EDIT) */}
      {activeTab === 'builder' && (
        <div className="p-4 rounded-3xl bg-zinc-950 border border-rose-900/40 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono">
                {editingWorkflowId ? 'EDIT AUTOMATION WORKFLOW' : 'CREATE CUSTOM WORKFLOW'}
              </h2>
              <p className="text-[11px] text-zinc-400">
                Configure custom voice triggers, sequential step logic, and sensitivity permissions.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('workflows')}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Workflow Name (English):</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Deep Work Focus Session"
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Nepali Label (Devanagari):</label>
              <input
                type="text"
                value={formNepaliName}
                onChange={e => setFormNepaliName(e.target.value)}
                placeholder="e.g. गहिरो काम ध्यान सत्र"
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Voice Trigger Phrase:</label>
              <input
                type="text"
                value={formTrigger}
                onChange={e => setFormTrigger(e.target.value)}
                placeholder='e.g. "MAFIA, start deep work"'
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-cyan-300 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Workflow Icon:</label>
              <select
                value={formIcon}
                onChange={e => setFormIcon(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Zap">⚡ Zap (General Energy)</option>
                <option value="Sun">☀️ Sun (Morning Routine)</option>
                <option value="Video">🎬 Video (Creative Workflows)</option>
                <option value="ShieldCheck">🛡️ ShieldCheck (Security &amp; Audit)</option>
                <option value="Sparkles">✨ Sparkles (AI Generation)</option>
                <option value="Smartphone">📱 Smartphone (Hardware Control)</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Description:</label>
              <input
                type="text"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Brief description of what this workflow accomplishes..."
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-rose-500 font-sans"
              />
            </div>
          </div>

          {/* Dynamic Steps Builder */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 font-mono uppercase">
                Sequential Task Steps ({formSteps.length}):
              </span>
              <button
                type="button"
                onClick={addStepToForm}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2">
              {formSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black border border-zinc-800 flex flex-col sm:flex-row items-center gap-2.5"
                >
                  <span className="text-xs font-mono text-zinc-500 shrink-0 font-bold">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.description}
                    onChange={e => {
                      const val = e.target.value;
                      setFormSteps(prev =>
                        prev.map((s, i) => (i === idx ? { ...s, description: val } : s))
                      );
                    }}
                    placeholder={`Action step ${idx + 1} description`}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-zinc-100 focus:outline-none focus:border-rose-500"
                  />
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.requiresConfirmation}
                      onChange={e => {
                        const val = e.target.checked;
                        setFormSteps(prev =>
                          prev.map((s, i) => (i === idx ? { ...s, requiresConfirmation: val } : s))
                        );
                      }}
                      className="rounded accent-rose-600"
                    />
                    <span>Requires Confirmation</span>
                  </label>
                  {formSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStepFromForm(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => setActiveTab('workflows')}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWorkflow}
              disabled={!formName.trim() || !formTrigger.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-rose-950/80 disabled:opacity-50"
            >
              Save Workflow Routine
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTION HISTORY LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">
              Workflow Execution Audit Logs
            </h2>
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 rounded-2xl bg-zinc-950 border border-zinc-800">
              No workflow execution history logged yet. Run a workflow to view execution audit traces.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/90 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-zinc-100">{item.workflowName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(item.completedAt).toLocaleTimeString()} • {item.stepsCount} Steps
                    </span>
                  </div>

                  <div className="pl-6 space-y-1">
                    {item.executedSteps.map((stepDesc, idx) => (
                      <div key={idx} className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span>
                        <span>{stepDesc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sensitive Action Authorization Modal */}
      {confirmStep && activeWorkflow && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-rose-500/50 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 font-mono">
                  SENSITIVE ACTION AUTHORIZATION
                </h3>
                <p className="text-[11px] text-rose-300 font-mono">
                  {activeWorkflow.name} • Step Permission Gate
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black border border-zinc-800 space-y-1.5 text-xs">
              <p className="text-zinc-300 font-medium">
                The workflow requires your explicit confirmation before executing:
              </p>
              <p className="text-rose-400 font-mono font-bold">
                "{confirmStep.description}"
              </p>
              <p className="text-[10px] text-zinc-500">
                Action: {confirmStep.action}. Security boundaries will remain fully active.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmStep(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-950/80"
              >
                Authorize &amp; Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
