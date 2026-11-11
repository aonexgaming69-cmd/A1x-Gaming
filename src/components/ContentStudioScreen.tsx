import React, { useState, useEffect } from 'react';
import {
  Clapperboard,
  Sparkles,
  FileText,
  Subtitles,
  Image as ImageIcon,
  Video,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  Palette,
  Maximize2
} from 'lucide-react';
import { StudioProject, LanguageCode } from '../types/ammu.js';
import { fetchStudioProjects, generateStudioContent } from '../services/api.js';

interface ContentStudioScreenProps {
  language: LanguageCode;
}

export const ContentStudioScreen: React.FC<ContentStudioScreenProps> = ({ language }) => {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [activeTool, setActiveTool] = useState<'SCRIPT' | 'SUBTITLES' | 'THUMBNAIL' | 'VIDEO_STORYBOARD' | 'IMAGE'>('SCRIPT');
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeProject, setActiveProject] = useState<StudioProject | null>(null);
  const [copied, setCopied] = useState(false);

  const loadProjects = async () => {
    try {
      const data = await fetchStudioProjects();
      setProjects(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
      }
    } catch (e) {
      console.warn('Projects load error:', e);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    try {
      const proj = await generateStudioContent(activeTool, promptInput, language);
      setProjects(prev => [proj, ...prev]);
      setActiveProject(proj);
      setPromptInput('');
    } catch (e) {
      console.error('Generation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSrtFile = (srtContent: string, filename: string = 'subtitles.srt') => {
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 pb-8 overflow-y-auto bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-950 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-400 shadow-lg shadow-fuchsia-950/60">
            <Clapperboard className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-mono tracking-wider text-white">
                CREATIVE STUDIO
              </h1>
              <span className="text-[10px] bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-700/60 px-2 py-0.5 rounded-full font-mono">
                AI STUDIO
              </span>
            </div>
            <p className="text-[11px] text-fuchsia-300/80">
              {language === 'ne' ? 'स्क्रिप्ट, सबटाइटल, थम्बनेल तथा भिडियो योजना' : 'Multi-Format Content Generation & 4K Mastering'}
            </p>
          </div>
        </div>
      </div>

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-[11px] font-mono">
        <button
          onClick={() => setActiveTool('SCRIPT')}
          className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeTool === 'SCRIPT' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Script</span>
        </button>

        <button
          onClick={() => setActiveTool('SUBTITLES')}
          className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeTool === 'SUBTITLES' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold' : 'text-slate-400'
          }`}
        >
          <Subtitles className="w-4 h-4" />
          <span>SRT Subs</span>
        </button>

        <button
          onClick={() => setActiveTool('THUMBNAIL')}
          className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeTool === 'THUMBNAIL' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold' : 'text-slate-400'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Thumb</span>
        </button>

        <button
          onClick={() => setActiveTool('VIDEO_STORYBOARD')}
          className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeTool === 'VIDEO_STORYBOARD' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold' : 'text-slate-400'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video</span>
        </button>

        <button
          onClick={() => setActiveTool('IMAGE')}
          className={`py-2 rounded-xl transition-all flex flex-col items-center gap-1 ${
            activeTool === 'IMAGE' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/50 font-bold' : 'text-slate-400'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>4K Art</span>
        </button>
      </div>

      {/* Generator Input Section */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-fuchsia-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fuchsia-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>{activeTool} Generator</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Nepali / English</span>
        </div>

        <textarea
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder={
            activeTool === 'SCRIPT'
              ? (language === 'ne' ? 'भिडियो विषय लेख्नुहोस् (उदा: काठमाडौंको उत्कृष्ट प्रविधि स्टार्टअपहरू...)' : 'Video topic (e.g. 5 AI inventions that will change 2026...)')
              : activeTool === 'SUBTITLES'
              ? (language === 'ne' ? 'सबटाइटल बनाउन संवाद वा भिडियो विवरण यहाँ लेख्नुहोस्...' : 'Spoken dialogue or voiceover transcript for SRT timestamps...')
              : activeTool === 'THUMBNAIL'
              ? (language === 'ne' ? 'यूट्यूब थम्बनेल विषय र मुख्य पाठ...' : 'High-CTR YouTube thumbnail concept and punchline...')
              : activeTool === 'VIDEO_STORYBOARD'
              ? (language === 'ne' ? 'भिडियो कथा र दृश्य योजना...' : 'Video scene premise, shots and transitions...')
              : 'Prompt for photorealistic 4K cinematic image...'
          }
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400 font-sans"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !promptInput.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-fuchsia-950/80 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'GENERATING CREATIVE ASSETS...' : 'Generate Studio Asset'}</span>
        </button>
      </div>

      {/* Generated Project Inspector */}
      {activeProject && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-fuchsia-400 px-2 py-0.5 rounded bg-fuchsia-950 border border-fuchsia-800">
                {activeProject.type}
              </span>
              <h3 className="text-xs font-bold text-slate-200">{activeProject.title}</h3>
            </div>

            <div className="flex items-center gap-1.5">
              {activeProject.type === 'SUBTITLES' && activeProject.outputData?.srt && (
                <button
                  onClick={() => downloadSrtFile(activeProject.outputData.srt)}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-mono transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export .SRT</span>
                </button>
              )}
              <button
                onClick={() => handleCopyText(JSON.stringify(activeProject.outputData, null, 2))}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* SCRIPT DISPLAY */}
          {activeProject.type === 'SCRIPT' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-mono text-fuchsia-400 text-[10px] block uppercase">Hook (0:00 - 0:05):</span>
                <p className="text-slate-100 font-bold mt-0.5">{activeProject.outputData?.hook}</p>
              </div>

              {activeProject.outputData?.scenes && (
                <div className="space-y-2">
                  <span className="font-mono text-slate-400 text-[10px] block uppercase">Story Beats / Scenes:</span>
                  {activeProject.outputData.scenes.map((s: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-fuchsia-400">
                        <span>Scene {s.sceneNumber || idx + 1}</span>
                        <span>Visual: {s.visualCue}</span>
                      </div>
                      <p className="text-slate-200">{s.spokenDialogue}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-800/40">
                <span className="font-mono text-fuchsia-400 text-[10px] block uppercase">Call to Action (CTA):</span>
                <p className="text-slate-200 font-medium">{activeProject.outputData?.callToAction}</p>
              </div>
            </div>
          )}

          {/* SUBTITLES DISPLAY */}
          {activeProject.type === 'SUBTITLES' && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-slate-400">Valid SubRip (.SRT) Timed Subtitle Track:</p>
              <pre className="p-3 rounded-2xl bg-black/60 border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {activeProject.outputData?.srt}
              </pre>
            </div>
          )}

          {/* THUMBNAIL DISPLAY */}
          {activeProject.type === 'THUMBNAIL' && (
            <div className="space-y-3 text-xs">
              {activeProject.outputData?.assetUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 shadow-xl group">
                  <img
                    src={activeProject.outputData.assetUrl}
                    alt="Generated 4K Thumbnail"
                    className="w-full h-auto object-cover max-h-56 rounded-t-2xl"
                  />
                  <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-rose-300 font-bold">16:9 • 4K ULTRA HD</span>
                    <a
                      href={activeProject.outputData.assetUrl}
                      download={`thumbnail_${activeProject.id}.svg`}
                      className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg text-xs font-mono shadow-md"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Thumbnail</span>
                    </a>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] text-fuchsia-400 uppercase">Text Overlay:</span>
                  <span className="text-[10px] font-mono text-slate-400">{activeProject.outputData?.aspectRatio}</span>
                </div>
                <p className="text-base font-extrabold text-amber-300 font-mono tracking-wide">
                  "{activeProject.outputData?.titleText}"
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-fuchsia-300">Composition:</strong> {activeProject.outputData?.composition}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-fuchsia-300">Focal Point:</strong> {activeProject.outputData?.focalPoint}
                </p>
              </div>
            </div>
          )}

          {/* VIDEO STORYBOARD DISPLAY */}
          {activeProject.type === 'VIDEO_STORYBOARD' && (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>Resolution: {activeProject.outputData?.targetQuality}</span>
                <span>FPS: {activeProject.outputData?.fps}</span>
              </div>
              <div className="space-y-1.5">
                {activeProject.outputData?.scenes?.map((sc: any) => (
                  <div key={sc.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                      <span>Scene {sc.id}</span>
                      <span>{sc.duration}</span>
                    </div>
                    <p className="text-[11px] text-slate-200"><strong>Visual:</strong> {sc.visual}</p>
                    <p className="text-[10px] text-slate-400"><strong>Audio:</strong> {sc.audio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IMAGE DISPLAY */}
          {activeProject.type === 'IMAGE' && (
            <div className="space-y-3 text-xs">
              {activeProject.outputData?.assetUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-fuchsia-500/40 shadow-xl">
                  <img
                    src={activeProject.outputData.assetUrl}
                    alt="Generated 4K Art"
                    className="w-full h-auto object-cover max-h-56 rounded-t-2xl"
                  />
                  <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-fuchsia-300 font-bold">{activeProject.outputData?.resolution || '4K Ultra HD'}</span>
                    <a
                      href={activeProject.outputData.assetUrl}
                      download={`art_${activeProject.id}.svg`}
                      className="flex items-center gap-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-2.5 py-1 rounded-lg text-xs font-mono shadow"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Image Asset</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 rounded-2xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-fuchsia-950 border border-fuchsia-500/30 flex flex-col items-center justify-center p-4 text-center">
                  <ImageIcon className="w-10 h-10 text-fuchsia-400 mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-white font-mono">{activeProject.outputData?.resolution}</p>
                  <p className="text-[11px] text-fuchsia-300 mt-1">{activeProject.outputData?.renderStyle}</p>
                </div>
              )}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span className="font-mono text-[10px] text-fuchsia-400 block mb-0.5">Render Prompt:</span>
                {activeProject.outputData?.prompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project History */}
      {projects.length > 1 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider px-1">
            Studio Project History ({projects.length})
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setActiveProject(p)}
                className={`p-2.5 rounded-xl border text-left whitespace-nowrap text-xs transition-all ${
                  activeProject?.id === p.id
                    ? 'bg-fuchsia-950 border-fuchsia-400 text-fuchsia-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-[9px] font-mono block text-fuchsia-400">{p.type}</span>
                <span className="font-bold">{p.title.slice(0, 20)}...</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
