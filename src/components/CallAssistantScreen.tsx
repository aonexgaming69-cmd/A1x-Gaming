import React, { useState, useEffect } from 'react';
import {
  Phone,
  Search,
  UserCheck,
  ShieldAlert,
  PhoneCall,
  User,
  Users,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  History
} from 'lucide-react';
import { ContactItem, LanguageCode } from '../types/ammu.js';
import { fetchContacts, executeDeviceAction } from '../services/api.js';
import { filterContacts, formatSafeDialerUri } from '../utils/ammu-logic.js';

interface CallAssistantScreenProps {
  language: LanguageCode;
}

export const CallAssistantScreen: React.FC<CallAssistantScreenProps> = ({ language }) => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [callHistory, setCallHistory] = useState<Array<{ name: string; number: string; time: number }>>(() => {
    const saved = localStorage.getItem('ammu_call_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [hasNativePicker, setHasNativePicker] = useState(false);

  useEffect(() => {
    fetchContacts().then(setContacts);
    if ('contacts' in navigator && 'ContactsManager' in window) {
      setHasNativePicker(true);
    }
  }, []);

  const filtered = filterContacts(contacts, searchQuery);

  const handleSelectToCall = (contact: ContactItem) => {
    setSelectedContact(contact);
    setShowConfirmModal(true);
  };

  const handleLaunchDialer = async (contact: ContactItem) => {
    const { telUri, isValid } = formatSafeDialerUri(contact.phoneNumber);
    if (!isValid) {
      setErrorNotice(language === 'ne' ? 'अमान्य फोन नम्बर (Invalid phone number)' : 'Invalid phone number format');
      setTimeout(() => setErrorNotice(null), 3000);
      return;
    }

    // Record call intent history
    const record = { name: contact.name, number: contact.phoneNumber, time: Date.now() };
    const updatedHistory = [record, ...callHistory.slice(0, 9)];
    setCallHistory(updatedHistory);
    localStorage.setItem('ammu_call_history', JSON.stringify(updatedHistory));

    setShowConfirmModal(false);

    // Launch Android dialer safely via native bridge or URI
    await executeDeviceAction('CALL_NUMBER', { phoneNumber: contact.phoneNumber });
    if (typeof window !== 'undefined' && !(window as any).AndroidBridge && !(window as any).AmmuAndroidBridge) {
      window.location.href = telUri;
    }
  };

  const handleNativeContactPick = async () => {
    try {
      const nav: any = navigator;
      if (nav.contacts && nav.contacts.select) {
        const picked = await nav.contacts.select(['name', 'tel'], { multiple: false });
        if (picked && picked.length > 0) {
          const item = picked[0];
          const newContact: ContactItem = {
            id: `picked_${Date.now()}`,
            name: item.name ? item.name[0] : 'Unknown Contact',
            phoneNumber: item.tel ? item.tel[0] : '',
            label: 'Android Contact',
            avatarColor: '#C41230'
          };
          setContacts(prev => [newContact, ...prev]);
          handleSelectToCall(newContact);
        }
      }
    } catch (err) {
      console.warn('Native contact picker cancelled or unsupported:', err);
    }
  };

  const content = {
    ne: {
      title: 'स्मार्ट फोन कल सहायक',
      safetyTitle: 'सुरक्षा ग्यारेन्टी (Safety First)',
      safetyDesc: 'अम्मु एआईले तपाईंको स्पष्ट अनुमति बिना कहिल्यै पनि गोप्य रूपमा कल गर्दैन। सधैं पुष्टि गरेर मात्र एन्ड्रोइड डायलर खोल्छ।',
      searchPlaceholder: 'सम्पर्क खोज्नुहोस् (नाम वा नम्बर)...',
      pickNative: 'एन्ड्रोइड कन्ट्याक्टबाट छान्नुहोस्',
      callButton: 'कल गर्नुहोस्',
      confirmTitle: 'फोन कल पुष्टि गर्नुहोस्',
      confirmBody: 'के तपाईं निम्न व्यक्तिलाई फोन कल गर्न एन्ड्रोइड डायलर खोल्न चाहनुहुन्छ?',
      cancel: 'रद्द गर्नुहोस्',
      confirmCall: 'अहिले कल गर्नुहोस्',
      recentCalls: 'भर्खरका कलहरू'
    },
    hi: {
      title: 'स्मार्ट फ़ोन कॉल सहायक',
      safetyTitle: 'सुरक्षा गारंटी (Safety First)',
      safetyDesc: 'अम्मू एआई आपकी स्पष्ट सहमति के बिना कभी भी गोपनीय कॉल नहीं करता। हमेशा पुष्टि करने के बाद ही डायलर खोलता है।',
      searchPlaceholder: 'संपर्क खोजें (नाम या नंबर)...',
      pickNative: 'एंड्रॉइड संपर्क से चुनें',
      callButton: 'कॉल करें',
      confirmTitle: 'कॉल की पुष्टि करें',
      confirmBody: 'क्या आप इस संपर्क पर कॉल करने के लिए डायलर खोलना चाहते हैं?',
      cancel: 'रद्द करें',
      confirmCall: 'अभी कॉल करें',
      recentCalls: 'हालिया कॉल'
    },
    en: {
      title: 'Smart Phone Call Assistant',
      safetyTitle: 'Safety Guard Active',
      safetyDesc: 'AMMU AI NEVER secretly places calls. Every outgoing call requires explicit user confirmation and routes through the standard Android dialer.',
      searchPlaceholder: 'Search contacts by name or number...',
      pickNative: 'Pick from Android Contacts',
      callButton: 'Call',
      confirmTitle: 'Confirm Outgoing Call',
      confirmBody: 'Do you want to open the Android dialer to call the following contact?',
      cancel: 'Cancel',
      confirmCall: 'Place Call Now',
      recentCalls: 'Recent Call Intents'
    }
  }[language];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto bg-slate-950">
      {/* Error Toast Notification */}
      {errorNotice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-950 border border-rose-500 text-rose-200 px-4 py-2 rounded-full text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-top-2">
          {errorNotice}
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-400" />
          <h1 className="text-xs font-bold text-slate-100">{content.title}</h1>
        </div>
        {hasNativePicker && (
          <button
            onClick={handleNativeContactPick}
            className="flex items-center gap-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-xl text-[10px] font-medium transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{content.pickNative}</span>
          </button>
        )}
      </div>

      {/* Security Banner: Never Secretly Dial */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30 p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>{content.safetyTitle}</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {content.safetyDesc}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={content.searchPlaceholder}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Contact List */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          सम्पर्क सूची (Contacts Directory - {filtered.length}):
        </p>

        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">कुनै सम्पर्क भेटिएन</p>
        ) : (
          filtered.map(contact => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm"
                  style={{ backgroundColor: contact.avatarColor || '#C41230' }}
                >
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-100">{contact.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {contact.phoneNumber} • {contact.label}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSelectToCall(contact)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-md transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{content.callButton}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Recent Call Intents */}
      {callHistory.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-1.5 px-1 text-slate-400">
            <History className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{content.recentCalls}</span>
          </div>

          <div className="space-y-1.5">
            {callHistory.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                <span className="text-slate-200 font-medium">{h.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal */}
      {showConfirmModal && selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">{content.confirmTitle}</h2>
                <p className="text-[10px] text-slate-400">Security Checkpoint</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {content.confirmBody}
            </p>

            {/* Recipient Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: selectedContact.avatarColor || '#C41230' }}
              >
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">{selectedContact.name}</p>
                <p className="text-xs text-rose-400 font-mono font-medium">{selectedContact.phoneNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                {content.cancel}
              </button>
              <button
                onClick={() => handleLaunchDialer(selectedContact)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/60"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{content.confirmCall}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
