import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Bell,
  BellRing,
  RotateCcw,
  Calendar,
  AlertCircle,
  Volume2,
  X
} from 'lucide-react';
import { LanguageCode, RecurrenceType, Reminder, ReminderPriority } from '../types/ammu.js';
import { calculateNextTrigger } from '../utils/ammu-logic.js';
import { deleteReminder, saveReminder, updateReminder } from '../services/api.js';

interface ReminderScreenProps {
  language: LanguageCode;
  reminders: Reminder[];
  onRefreshReminders: () => void;
}

export const ReminderScreen: React.FC<ReminderScreenProps> = ({
  language,
  reminders,
  onRefreshReminders
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [dueTimeStr, setDueTimeStr] = useState(() => {
    const d = new Date(Date.now() + 3600000);
    return d.toISOString().slice(0, 16);
  });
  const [recurrence, setRecurrence] = useState<RecurrenceType>('NONE');
  const [priority, setPriority] = useState<ReminderPriority>('NORMAL');
  const [notifState, setNotifState] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  });

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio chime unsupported:', e);
    }
  };

  const requestNotifPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const res = await Notification.requestPermission();
      setNotifState(res);
      if (res === 'granted') {
        new Notification('अम्मु एआई रिमाइन्डर (AMMU Reminder)', {
          body: 'सूचना अलर्ट सक्रिय गरिएको छ। समयमा सूचना पठाइनेछ।'
        });
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const timestamp = new Date(dueTimeStr).getTime();
    await saveReminder({
      title: title.trim(),
      note: note.trim(),
      dueTimestamp: isNaN(timestamp) ? Date.now() + 3600000 : timestamp,
      recurrence,
      priority
    });

    playChime();
    setShowAddModal(false);
    setTitle('');
    setNote('');
    onRefreshReminders();
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    const newStatus = !reminder.isCompleted;
    if (newStatus && reminder.recurrence !== 'NONE') {
      // Calculate next occurrence
      const nextDue = calculateNextTrigger(reminder.dueTimestamp, reminder.recurrence);
      await updateReminder(reminder.id, {
        isCompleted: false,
        dueTimestamp: nextDue
      });
    } else {
      await updateReminder(reminder.id, { isCompleted: newStatus });
    }
    onRefreshReminders();
  };

  const handleSnooze = async (id: string, currentDue: number) => {
    const snoozed = currentDue + 15 * 60 * 1000; // +15 mins
    await updateReminder(id, { dueTimestamp: snoozed });
    playChime();
    onRefreshReminders();
  };

  const handleDelete = async (id: string) => {
    await deleteReminder(id);
    onRefreshReminders();
  };

  const labels = {
    ne: {
      title: 'स्मार्ट रिमाइन्डर प्रणाली',
      activeTab: 'सक्रिय',
      completedTab: 'सम्पन्न',
      newReminder: 'नयाँ रिमाइन्डर',
      noReminders: 'कुनै रिमाइन्डर छैन',
      snooze: '+१५ मिनेट स्नूज',
      alarmActive: 'अलार्म सक्रिय',
      enableNotif: 'सूचना अनुमति दिनुहोस्',
      recurrenceLabels: {
        NONE: 'एक पटक (None)',
        DAILY: 'दैनिक (Daily)',
        WEEKLY: 'साप्ताहिक (Weekly)',
        WEEKDAYS: 'कार्यदिन (Mon-Fri)',
        MONTHLY: 'मासिक (Monthly)'
      }
    },
    hi: {
      title: 'स्मार्ट रिमाइंडर सिस्टम',
      activeTab: 'सक्रिय',
      completedTab: 'पूर्ण',
      newReminder: 'नया रिमाइंडर',
      noReminders: 'कोई रिमाइंडर नहीं है',
      snooze: '+१५ मिनट स्नूज़',
      alarmActive: 'अलार्म सक्रिय',
      enableNotif: 'अधिसूचना सक्षम करें',
      recurrenceLabels: {
        NONE: 'एक बार (None)',
        DAILY: 'दैनिक (Daily)',
        WEEKLY: 'साप्ताहिक (Weekly)',
        WEEKDAYS: 'कार्यदिवस (Mon-Fri)',
        MONTHLY: 'मासिक (Monthly)'
      }
    },
    en: {
      title: 'Smart Reminders Engine',
      activeTab: 'Pending',
      completedTab: 'Done',
      newReminder: 'New Reminder',
      noReminders: 'No reminders found',
      snooze: '+15m Snooze',
      alarmActive: 'Exact Alarm Active',
      enableNotif: 'Enable Notifications',
      recurrenceLabels: {
        NONE: 'Once (None)',
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        WEEKDAYS: 'Weekdays (Mon-Fri)',
        MONTHLY: 'Monthly'
      }
    }
  }[language];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-3.5 overflow-y-auto bg-slate-950">
      {/* Header with Notification State & Add Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400" />
          <h1 className="text-xs font-bold text-slate-100">{labels.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {notifState !== 'granted' && (
            <button
              onClick={requestNotifPermission}
              className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-xl text-[10px] hover:bg-amber-500/20"
              title="Request Notification Permission"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>{labels.enableNotif}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-xl text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{labels.newReminder}</span>
          </button>
        </div>
      </div>

      {/* Audio Bell Test & Exact Alarm Banner */}
      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <BellRing className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-[11px]">{labels.alarmActive} (SCHEDULE_EXACT_ALARM)</span>
        </div>
        <button
          onClick={playChime}
          className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-lg border border-slate-700"
          title="Test Alert Chime Sound"
        >
          <Volume2 className="w-3 h-3 text-amber-400" />
          <span>घण्टी जाँच (Test Chime)</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs">{labels.noReminders}</p>
          </div>
        ) : (
          reminders.map(rem => (
            <div
              key={rem.id}
              className={`p-3 rounded-2xl border transition-all ${
                rem.isCompleted
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => handleToggleComplete(rem)}
                  className="mt-0.5 text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label={rem.isCompleted ? 'Mark pending' : 'Mark completed'}
                >
                  {rem.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-semibold ${rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {rem.title}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      rem.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : rem.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {rem.priority}
                    </span>
                  </div>

                  {rem.note && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{rem.note}</p>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      {new Date(rem.dueTimestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {rem.recurrence !== 'NONE' && (
                      <span className="bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800/50">
                        {rem.recurrence}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!rem.isCompleted && (
                    <button
                      onClick={() => handleSnooze(rem.id, rem.dueTimestamp)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg"
                      title="Snooze 15 minutes"
                    >
                      {labels.snooze}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100">{labels.newReminder}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase">शीर्षक (Title):</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="उदा: डाक्टरको अपोइन्टमेन्ट"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase">नोट / विवरण (Note):</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="अतिरिक्त विवरण..."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-slate-400 uppercase">मिति र समय (Date &amp; Time):</label>
                <input
                  type="datetime-local"
                  required
                  value={dueTimeStr}
                  onChange={e => setDueTimeStr(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase">दोहोरिने (Recurrence):</label>
                  <select
                    value={recurrence}
                    onChange={e => setRecurrence(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="NONE">{labels.recurrenceLabels.NONE}</option>
                    <option value="DAILY">{labels.recurrenceLabels.DAILY}</option>
                    <option value="WEEKLY">{labels.recurrenceLabels.WEEKLY}</option>
                    <option value="WEEKDAYS">{labels.recurrenceLabels.WEEKDAYS}</option>
                    <option value="MONTHLY">{labels.recurrenceLabels.MONTHLY}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-slate-400 uppercase">प्राथमिकता (Priority):</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="NORMAL">सामान्य (Normal)</option>
                    <option value="MEDIUM">मध्यम (Medium)</option>
                    <option value="HIGH">उच्च (High)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  रिमाइन्डर सेभ गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
