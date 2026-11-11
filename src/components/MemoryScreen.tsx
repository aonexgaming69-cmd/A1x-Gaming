import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Shield,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Lock,
  X,
  Sparkles
} from 'lucide-react';
import { LanguageCode, MemoryCategory, MemoryFact } from '../types/ammu.js';
import { addMemoryFact, clearAllMemory, deleteMemoryFact } from '../services/api.js';

interface MemoryScreenProps {
  language: LanguageCode;
  memories: MemoryFact[];
  onRefreshMemory: () => void;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({
  language,
  memories,
  onRefreshMemory
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<MemoryCategory>('PREFERENCE');
  const [content, setContent] = useState('');
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addMemoryFact({ category, content: content.trim() });
    setContent('');
    setShowAddModal(false);
    onRefreshMemory();
  };

  const handleDelete = async (id: string) => {
    await deleteMemoryFact(id);
    onRefreshMemory();
  };

  const handleWipeAll = async () => {
    await clearAllMemory();
    setShowWipeConfirm(false);
    onRefreshMemory();
  };

  const categoryBadges: Record<MemoryCategory, { label: string; color: string }> = {
    PREFERENCE: { label: 'प्राथमिकता (Preference)', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    LOCATION: { label: 'स्थान (Location)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    FACT: { label: 'तथ्य (Fact)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    PERSON: { label: 'व्यक्ति (Person)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    TASK: { label: 'कार्य (Task)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-950">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <div>
            <h1 className="text-xs font-bold text-slate-100">
              {language === 'ne' ? 'अम्मु स्मृति प्रणाली (Memory System)' : 'AMMU Memory Engine'}
            </h1>
            <p className="text-[10px] text-slate-400">Contextual Knowledge &amp; Privacy Safeguards</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>नयाँ तथ्य (Add Fact)</span>
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/30 p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>गोपनीयता नियन्त्रण (Privacy Controls)</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          अम्मु एआईले तपाईंको स्वीकृति बिना कुनै पनि संवेदनशील व्यक्तिगत डेटा भण्डारण गर्दैन। तपाईं कुनै पनि समयमा व्यक्तिगत तथ्यहरू सम्पादन गर्न वा सम्पूर्ण स्मृति मेटाउन सक्नुहुन्छ।
        </p>
      </div>

      {/* Memory List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            सक्रिय स्मृति तथ्यहरू ({memories.length}):
          </p>
          {memories.length > 0 && (
            <button
              onClick={() => setShowWipeConfirm(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
            >
              सबै मेटाउनुहोस् (Wipe All)
            </button>
          )}
        </div>

        {memories.length === 0 ? (
          <div className="py-10 text-center text-slate-500 space-y-2">
            <Brain className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs">कुनै स्मृति तथ्य फेला परेन</p>
          </div>
        ) : (
          memories.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                    categoryBadges[item.category]?.color || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {categoryBadges[item.category]?.label || item.category}
                </span>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete memory item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">{item.content}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
                <span>विश्वसनीयता: {(item.confidence * 100).toFixed(0)}%</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100">नयाँ स्मृति तथ्य थप्नुहोस्</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase">श्रेणी (Category):</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="PREFERENCE">प्राथमिकता (Preference)</option>
                  <option value="LOCATION">स्थान (Location)</option>
                  <option value="FACT">तथ्य (Fact)</option>
                  <option value="PERSON">व्यक्ति (Person)</option>
                  <option value="TASK">कार्य (Task)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase">तथ्य सामग्री (Memory Fact):</label>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="उदा: म चियामा चिनी कम खान रुचाउँछु।"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  सेभ गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wipe All Confirmation Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-100">सम्पूर्ण स्मृति खाली गर्ने?</h2>
            </div>
            <p className="text-xs text-slate-300">
              यसले AMMU AI ले सिकेका सबै व्यक्तिगत प्राथमिकताहरू र तथ्यहरू स्थायी रूपमा मेटाउनेछ। यो कार्य उल्टाउन सकिँदैन।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleWipeAll}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                हो, सबै मेटाउनुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
