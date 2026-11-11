import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  FileText,
  Download,
  Trash2,
  Sparkles,
  BookOpen,
  Tag,
  ShieldCheck,
  CheckCircle,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { KnowledgeDoc, LanguageCode } from '../types/ammu.js';
import {
  fetchKnowledgeDocs,
  searchKnowledge,
  addKnowledgeDoc,
  summarizeKnowledgeText,
  purgeAllKnowledge
} from '../services/api.js';

interface KnowledgeEngineScreenProps {
  language: LanguageCode;
}

export const KnowledgeEngineScreen: React.FC<KnowledgeEngineScreenProps> = ({ language }) => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'PDF' | 'NOTE' | 'CONVERSATION' | 'RESEARCH'>('NOTE');
  const [newTags, setNewTags] = useState('AI, Notes');
  const [summarizeInput, setSummarizeInput] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const loadDocs = async () => {
    try {
      const data = await fetchKnowledgeDocs();
      setDocs(data);
    } catch (e) {
      console.warn('Load knowledge error:', e);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      loadDocs();
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchKnowledge(q);
      setDocs(results);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const doc = await addKnowledgeDoc({
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: tagsArray
      });
      setDocs(prev => [doc, ...prev]);
      setNewTitle('');
      setNewContent('');
      setShowAddModal(false);
    } catch (e) {
      console.error('Add doc error:', e);
    }
  };

  const handleSummarize = async () => {
    if (!summarizeInput.trim()) return;
    setIsSummarizing(true);
    try {
      const sum = await summarizeKnowledgeText(summarizeInput, language);
      setSummaryOutput(sum);
    } catch (e) {
      console.error('Summarize error:', e);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExport = () => {
    window.open('/api/v1/knowledge/export', '_blank');
  };

  const handlePurge = async () => {
    await purgeAllKnowledge();
    setDocs([]);
    setShowPurgeConfirm(false);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-8 overflow-y-auto bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-950/60">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-white">
                KNOWLEDGE ENGINE
              </h1>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full font-mono">
                LONG-TERM MEMORY
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/80">
              {language === 'ne' ? 'सिमान्टिक खोजी, कागजात विश्लेषण तथा गोपनीयता नियन्त्रण' : 'Semantic Knowledge Base & Privacy Engine'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'ne' ? 'थप्नुहोस्' : 'Add Note'}</span>
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Export Knowledge JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Semantic Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder={language === 'ne' ? 'व्यक्तिगत ज्ञान र कागजातहरूमा सिमान्टिक खोजी गर्नुहोस्...' : 'Semantic search across your documents & notes...'}
          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Quick Summarizer Tool Bar */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ne' ? 'कागजात तथा पाठ संक्षेपीकरण (Document Summarizer)' : 'AI Knowledge Summarizer'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={summarizeInput}
            onChange={e => setSummarizeInput(e.target.value)}
            placeholder={language === 'ne' ? 'कुनै पनि पाठ वा लेख यहाँ टाँस्नुहोस्...' : 'Paste text or article snippet to summarize...'}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !summarizeInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50 transition-colors"
          >
            {isSummarizing ? 'Processing...' : (language === 'ne' ? 'संक्षेप गर्नुहोस्' : 'Summarize')}
          </button>
        </div>

        {summaryOutput && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-800/40 text-xs text-slate-200 leading-relaxed font-sans">
            <span className="font-bold text-indigo-400 text-[10px] block mb-1">AI Executive Summary:</span>
            {summaryOutput}
          </div>
        )}
      </div>

      {/* Knowledge Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            {language === 'ne' ? 'ज्ञान भण्डार सामग्री' : 'Verified Knowledge Documents'} ({docs.length})
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">Encrypted Local Store</span>
        </div>

        {docs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
            {language === 'ne' ? 'कुनै ज्ञान कागजात फेला परेन।' : 'No documents match your query.'}
          </div>
        ) : (
          docs.map(doc => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-slate-100">{doc.title}</h3>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-indigo-300 border border-indigo-800/60">
                  {doc.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {doc.content}
              </p>

              {/* Nepali Summary Pill */}
              {doc.nepaliSummary && (
                <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-800/30 text-[11px] text-indigo-200">
                  <span className="font-semibold text-indigo-400 block text-[10px]">नेपाली सारंश:</span>
                  {doc.nepaliSummary}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {doc.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-indigo-400" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Privacy Safeguard Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div>
            <p className="text-xs font-bold text-slate-200">
              {language === 'ne' ? 'गोपनीयता तथा डेटा संरक्षण' : 'Privacy & Consent Control'}
            </p>
            <p className="text-[10px] text-slate-400">
              {language === 'ne' ? 'तपाईंको स्पष्ट स्वीकृति बिना कुनै पनि व्यक्तिगत डेटा राखिँदैन।' : 'Zero data collection without explicit user authorization.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPurgeConfirm(true)}
          className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 px-2.5 py-1.5 rounded-xl border border-rose-800/60"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Purge All</span>
        </button>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 space-y-3.5 shadow-2xl">
            <h3 className="text-sm font-bold text-white font-mono">
              {language === 'ne' ? 'नयाँ ज्ञान कागजात थप्नुहोस्' : 'Add Knowledge Document'}
            </h3>

            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Title (e.g. Nepal Tourism Guide)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
            />

            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Document content or notes..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-400"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="NOTE">Note</option>
                <option value="RESEARCH">Research</option>
                <option value="PDF">PDF</option>
                <option value="CONVERSATION">Conversation</option>
              </select>

              <input
                type="text"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-bold"
              >
                Save Knowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Confirm Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-rose-500/50 rounded-3xl p-5 space-y-3 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto animate-bounce" />
            <h3 className="text-sm font-bold text-white">Permanently Purge Knowledge?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will expunge all learned facts, personal notes, and semantic memories from this device.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs font-medium"
              >
                Keep Data
              </button>
              <button
                onClick={handlePurge}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-xl text-xs font-bold"
              >
                Yes, Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
