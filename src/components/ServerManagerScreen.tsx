import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Globe,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Shield,
  Key,
  HardDrive
} from 'lucide-react';
import { LanguageCode, ServerConfig } from '../types/ammu.js';
import { fetchHealth } from '../services/api.js';

interface ServerManagerScreenProps {
  language: LanguageCode;
}

export const ServerManagerScreen: React.FC<ServerManagerScreenProps> = ({ language }) => {
  const [config, setConfig] = useState<ServerConfig>(() => {
    const saved = localStorage.getItem('ammu_server_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      backendUrl: window.location.origin,
      timeoutMs: 15000,
      enableAutoRetry: true,
      isOfflineMode: false
    };
  });

  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [serverMeta, setServerMeta] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('ammu_server_config', JSON.stringify(config));
  }, [config]);

  const testConnection = async () => {
    setTestStatus('TESTING');
    setTestResult(null);
    const start = performance.now();

    try {
      const health = await fetchHealth();
      const elapsed = Math.round(performance.now() - start);
      setPingMs(elapsed);
      setServerMeta(health);

      if (health.status === 'ONLINE') {
        setTestStatus('SUCCESS');
        setTestResult(`सम्पर्क सफल! लेटेंसी: ${elapsed}ms, AI: ${health.aiDetails || 'Ready'}`);
      } else {
        setTestStatus('ERROR');
        setTestResult('सर्भर अफलाइन वा त्रुटिपूर्ण छ।');
      }
    } catch (err: any) {
      setTestStatus('ERROR');
      setTestResult(`जडान असफल: ${err.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto bg-slate-950">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-sky-400" />
          <div>
            <h1 className="text-xs font-bold text-slate-100">स्मार्ट सर्भर व्यवस्थापक (Server Manager)</h1>
            <p className="text-[10px] text-slate-400">Production REST API &amp; AI Endpoint Engine</p>
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={testStatus === 'TESTING'}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'TESTING' ? 'animate-spin' : ''}`} />
          <span>पिङ जाँच (Ping)</span>
        </button>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950/40 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${testStatus === 'SUCCESS' ? 'bg-emerald-400 animate-pulse' : testStatus === 'TESTING' ? 'bg-amber-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="text-xs font-bold text-slate-200">
              {testStatus === 'SUCCESS' ? 'सर्भर सक्रिय (Online & Verified)' : testStatus === 'TESTING' ? 'परीक्षण गर्दैछ...' : 'जडान असफल (Offline)'}
            </span>
          </div>
          {pingMs !== null && (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-800/60">
              {pingMs} ms
            </span>
          )}
        </div>

        {testResult && (
          <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-mono">
            {testResult}
          </p>
        )}

        {serverMeta && (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
              <span className="block text-slate-500">प्याकेज पहिचान:</span>
              <span className="font-mono text-slate-200">{serverMeta.packageName}</span>
            </div>
            <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
              <span className="block text-slate-500">AI प्रदायक स्थिति:</span>
              <span className="font-semibold text-rose-300">{serverMeta.checks?.aiProviderConnection}</span>
            </div>
          </div>
        )}
      </div>

      {/* Endpoint Configuration */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            ब्याकएन्ड ठेगाना कन्फिगरेसन (Backend Configuration)
          </h2>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
            ✓ केही पनि थप्न पर्दैन (No Setup Needed)
          </span>
        </div>

        {/* Clear No Action Needed Reassurance Banner */}
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-200 leading-relaxed">
            <p className="font-bold text-emerald-300">कुनै पनि सर्भर ठेगाना वा सेटअप आवश्यक छैन!</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              AMMU AI तपाईंको फोनमा १००% आन्तरिक रूपमा चल्छ। आवाज, कल, रिमाइन्डर, र च्याटका सम्पूर्ण सुविधाहरू स्वतः सक्रिय छन्।
            </p>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-medium text-slate-400 uppercase">
            सर्भर मोड / ठेगाना (SERVER STATUS &amp; MODE):
          </label>
          <input
            type="text"
            value={
              config.backendUrl === 'file://' || config.backendUrl === 'file:' || !config.backendUrl
                ? 'On-Device Android Native Engine (Stand-Alone Offline Mode)'
                : config.backendUrl
            }
            onChange={e => setConfig(prev => ({ ...prev, backendUrl: e.target.value }))}
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            placeholder="On-Device Android Native Engine"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            डिफल्ट रूपमा On-Device Native Engine प्रयोग हुन्छ। बाह्य क्लाउड सर्भर जोड्न चाहेमा तलका बटन थिच्न वा URL राख्न सक्नुहुन्छ:
          </p>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const cloudUrl = 'https://ais-dev-n7v43h4odxk3lahirr2f3g-15092862494.asia-southeast1.run.app';
                setConfig(prev => ({ ...prev, backendUrl: cloudUrl }));
                localStorage.setItem('ammu_custom_backend_url', cloudUrl);
                setTimeout(testConnection, 100);
              }}
              className="text-[11px] bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 px-3 py-1.5 rounded-xl font-medium transition-colors"
            >
              🌐 Cloud Run URL स्वतः हाल्नुहोस् (Set Cloud URL)
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig(prev => ({ ...prev, backendUrl: '' }));
                localStorage.removeItem('ammu_custom_backend_url');
                setTimeout(testConnection, 100);
              }}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl font-medium transition-colors"
            >
              📱 अन-डिभाइस स्थानीय मोड (Reset to On-Device)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase">
              समय समाप्ति (Timeout):
            </label>
            <select
              value={config.timeoutMs}
              onChange={e => setConfig(prev => ({ ...prev, timeoutMs: Number(e.target.value) }))}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="5000">५ सेकेन्ड (5s)</option>
              <option value="15000">१५ सेकेन्ड (15s Default)</option>
              <option value="30000">३० सेकेन्ड (30s)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase">
              स्वतः पुनः प्रयास (Auto Retry):
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="autoRetry"
                checked={config.enableAutoRetry}
                onChange={e => setConfig(prev => ({ ...prev, enableAutoRetry: e.target.checked }))}
                className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-slate-950 border-slate-800"
              />
              <label htmlFor="autoRetry" className="text-xs text-slate-300">
                सक्रिय (Exponential Backoff)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Switch */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-slate-200">अफलाइन मोड (Offline Functionality)</p>
              <p className="text-[10px] text-slate-400">इन्टरनेट नहुँदा स्थानीय सुविधाहरू काम गर्छन्</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={config.isOfflineMode}
            onChange={e => setConfig(prev => ({ ...prev, isOfflineMode: e.target.checked }))}
            className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">कुन-कुन फिचर अफलाइन चल्छन्?</p>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>स्थानीय च्याट इतिहास हेर्ने र खोज्ने</li>
            <li>रिमाइन्डरहरू सिर्जना गर्ने र समयमा अलार्म बज्ने (Exact Alarms)</li>
            <li>सम्पर्क सूची हेर्ने र डायलर खोल्ने</li>
            <li>व्यक्तिगत स्मृति (Memory) र सेटिङहरू पहुँच गर्ने</li>
            <li>सिस्टम डायग्नोस्टिक्स जाँच गर्ने</li>
          </ul>
        </div>
      </div>

      {/* Security & Secrets Info */}
      <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>सुरक्षा एवं वातावरणीय कुञ्जीहरू (Secrets Protection)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AMMU AI ले कुनै पनि निजी API कुञ्जी APK भित्र हार्डकोड गर्दैन। सबै AI कलहरू सर्भर-साइड प्रोक्सी मार्फत सुरक्षित तरिकाले व्यवस्थापन गरिन्छ।
        </p>
      </div>
    </div>
  );
};
