import React, { useState, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { LanguageCode, CameraVisionResult } from '../types/ammu.js';
import { analyzeImageVision } from '../services/api.js';

interface CameraVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
}

export const CameraVisionModal: React.FC<CameraVisionModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CameraVisionResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setSelectedImage(b64);
        setResult(null);
        runAnalysis(b64, customPrompt);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgB64: string, promptText: string) => {
    setAnalyzing(true);
    try {
      const res = await analyzeImageVision(
        imgB64,
        promptText || 'Identify all items, extract visible text via OCR, and explain in detail.',
        language
      );
      setResult(res);
    } catch (e) {
      console.error('Vision analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/60 flex flex-col max-h-[92vh]">
        {/* Futuristic JARVIS Top HUD */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-slate-950 via-cyan-950/20 to-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-cyan-300 font-mono tracking-wider">
                  JARVIS VISION CORE
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-1.5 py-0.5 rounded font-mono">
                  MULTIMODAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {language === 'ne' ? 'क्यामेरा भिजन, ओसीआर तथा तस्विर विश्लेषण' : 'Optical Intelligence & OCR'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Viewfinder / Image Frame */}
          <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-slate-900 border border-cyan-500/30 flex items-center justify-center group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Vision target"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Scan className="w-8 h-8 opacity-70 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {language === 'ne' ? 'फोटो खिच्नुहोस् वा ग्यालरीबाट छान्नुहोस्' : 'Capture photo or select image'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'ne' ? 'वस्तु पहिचान, पाठ (OCR) तथा नेपाली विवरण' : 'Object recognition, OCR transcription & AI summary'}
                  </p>
                </div>
              </div>
            )}

            {/* Futuristic Holographic Reticle Overlay */}
            {selectedImage && (
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/20">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                {analyzing && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400" />
                )}
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Action Triggers */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-cyan-950/50"
            >
              <Camera className="w-4 h-4" />
              <span>{selectedImage ? (language === 'ne' ? 'नयाँ फोटो खिच्नुहोस्' : 'Retake Photo') : (language === 'ne' ? 'फोटो खिच्नुहोस्' : 'Capture Photo')}</span>
            </button>
            {selectedImage && (
              <button
                onClick={() => runAnalysis(selectedImage, customPrompt)}
                disabled={analyzing}
                className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 px-4 py-2.5 rounded-xl text-xs font-mono transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{language === 'ne' ? 'पुनः स्क्यान' : 'Rescan'}</span>
              </button>
            )}
          </div>

          {/* Analysis Status */}
          {analyzing && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-cyan-400 animate-spin" />
              <div>
                <p className="text-xs font-semibold text-cyan-300 font-mono">
                  JARVIS MULTIMODAL INFERENCE IN PROGRESS...
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'ne' ? 'तस्वीरको संरचना र पाठ विश्लेषण गरिँदैछ...' : 'Extracting visual features & OCR stream...'}
                </p>
              </div>
            </div>
          )}

          {/* Results Presentation */}
          {result && !analyzing && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              {/* Nepali Summary Card */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'ne' ? 'नेपाली विवरण (Devanagari Summary)' : 'Analysis Summary'}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {result.nepaliSummary || result.description}
                </p>
              </div>

              {/* Detected Objects Chips */}
              {result.detectedObjects && result.detectedObjects.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{language === 'ne' ? 'पहिचान गरिएका वस्तुहरू' : 'Detected Elements'}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedObjects.map((obj, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-900 border border-cyan-800/60 text-cyan-300 px-2.5 py-1 rounded-lg font-medium"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text transcription if detected */}
              {result.ocrText && (
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'ne' ? 'अप्टिकल पाठ पहिचान (OCR)' : 'Transcribed Text (OCR)'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(result.ocrText || '')}
                      className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto bg-black/40 p-2.5 rounded-xl border border-slate-800">
                    {result.ocrText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
