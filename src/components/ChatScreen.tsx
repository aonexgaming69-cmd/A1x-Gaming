import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Share2,
  RefreshCw,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { ChatMessage, LanguageCode, MemoryFact } from '../types/ammu.js';
import { sendChatMessage } from '../services/api.js';

interface ChatScreenProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  memories: MemoryFact[];
  onOpenVoice: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  language,
  setLanguage,
  memories,
  onOpenVoice
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ammu_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'msg_init',
        role: 'assistant',
        content: 'नमस्ते! म माफिया एआई — नेक्सस संस्करण (MAFIA AI NEXUS v6.0.0)। म तपाईंलाई दैनिक कार्य, १२ स्वायत्त एजेन्ट, रिमाइन्डर, कल, नेपाली भाषा सहयोग तथा कुनै पनि प्रश्नको उत्तर दिन तयार छु। म तपाईंलाई कसरी सहयोग गरूँ?',
        timestamp: Date.now(),
        language: 'ne'
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListeningInput, setIsListeningInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem('ammu_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = {
    ne: [
      'काठमाडौंमा आजको मौसम कस्तो छ?',
      'मलाई आजको दिनको राम्रो योजना बनाउन सहयोग गर्नुहोस्',
      'नेपालको इतिहास बारे रोचक तथ्य बताउनुहोस्',
      'अम्मु एआईका विशेषताहरू के-के हुन्?'
    ],
    hi: [
      'आज का मुख्य समाचार क्या है?',
      'अम्मू एआई की विशेषताएं क्या हैं?',
      'मुझे एक प्रेरक विचार बताएं',
      'मौसम की जानकारी दें'
    ],
    en: [
      'What are the key capabilities of AMMU AI v5.0.0?',
      'Help me plan my schedule for today',
      'Tell me an interesting fact about Nepal',
      'How does the phone call assistant work safely?'
    ]
  }[language];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt !== undefined ? customPrompt : input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: Date.now(),
      language
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = `msg_ammu_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      language,
      isStreaming: true
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    try {
      const memoryStrings = memories.map(m => m.content);
      let streamedResponse = '';

      await sendChatMessage(
        newHistory,
        language,
        memoryStrings,
        (chunk) => {
          streamedResponse = chunk;
          setMessages(prev =>
            prev.map(m => (m.id === assistantMsgId ? { ...m, content: chunk } : m))
          );
        }
      );

      setMessages(prev =>
        prev.map(m => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `माफ गर्नुहोस्, समस्या आयो: ${err.message || 'Error communicating with AI service'}.`,
                isStreaming: false,
                error: true
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (targetMsgId: string) => {
    const idx = messages.findIndex(m => m.id === targetMsgId);
    if (idx === -1) return;
    const historyUpToUser = messages.slice(0, idx);
    setMessages(historyUpToUser);
    const lastUserMsg = historyUpToUser[historyUpToUser.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      setInput(lastUserMsg.content);
      // Re-trigger
      const filtered = historyUpToUser.slice(0, -1);
      setMessages(filtered);
      handleSend(lastUserMsg.content);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AMMU AI Response',
          text
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMicInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onOpenVoice();
      return;
    }

    if (isListeningInput) {
      recognitionRef.current?.stop();
      setIsListeningInput(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ne' ? 'ne-NP' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListeningInput(true);
      recognition.onend = () => setIsListeningInput(false);
      recognition.onerror = () => setIsListeningInput(false);
      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInput(transcript);
      };
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const clearChat = () => {
    if (confirm('के तपाईं च्याट इतिहास मेटाउन निश्चित हुनुहुन्छ? (Clear chat history?)')) {
      const initMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'च्याट इतिहास खाली गरिएको छ। नयाँ संवाद सुरु गर्नुहोस्!',
        timestamp: Date.now(),
        language
      };
      setMessages([initMsg]);
      localStorage.removeItem('ammu_chat_history');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      {/* Top Bar with Language Selector & Clear */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-100">AMMU Chat</span>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setLanguage('ne')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              language === 'ne'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            नेपाली
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              language === 'hi'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              language === 'en'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        <button
          onClick={clearChat}
          className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-br-none'
                  : msg.error
                  ? 'bg-rose-950/70 border border-rose-800/80 text-rose-200 rounded-bl-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.isStreaming && !msg.content ? (
                <div className="flex items-center gap-1.5 py-1 text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] ml-1">अम्मु सोच्दैछ...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>

            {/* Action Bar for Assistant Messages */}
            {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
              <div className="flex items-center gap-2 mt-1 px-1 text-slate-500 text-[10px]">
                <button
                  onClick={() => handleSpeakText(msg.content)}
                  className="hover:text-rose-400 flex items-center gap-1"
                  title="Read Aloud in Nepali / Local Speech"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>सुन्नुहोस्</span>
                </button>
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="hover:text-slate-300 flex items-center gap-0.5"
                  title="Copy"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleShare(msg.content)}
                  className="hover:text-slate-300"
                  title="Share"
                >
                  <Share2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRegenerate(msg.id)}
                  className="hover:text-slate-300"
                  title="Regenerate"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && !messages.some(m => m.isStreaming) && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-1">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>सम्पर्क गर्दैछ... (Connecting to Gemini Engine)</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800 hover:border-slate-700 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-950 rounded-2xl px-3 py-1.5 border border-slate-800 focus-within:border-rose-500/60 shadow-inner"
        >
          <button
            type="button"
            onClick={toggleMicInput}
            className={`p-1.5 rounded-full transition-colors ${
              isListeningInput
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Speech Input (Nepali / English)"
          >
            {isListeningInput ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              language === 'ne'
                ? 'अम्मुलाई सन्देश पठाउनुहोस्...'
                : language === 'hi'
                ? 'अम्मू को संदेश भेजें...'
                : 'Message AMMU AI...'
            }
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-xl bg-rose-600 text-white disabled:opacity-30 disabled:hover:bg-rose-600 hover:bg-rose-500 transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
