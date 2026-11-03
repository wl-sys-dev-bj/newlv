import React, { useState, useEffect } from 'react';
import { ReminderConfig } from '../types';
import { loveDb } from '../utils/db';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendLoveNotification,
} from '../utils/notifications';
import { romanticAudio } from '../utils/audio';
import { Bell, BellRing, Clock, Check, X, Sparkles, Smartphone, ShieldAlert } from 'lucide-react';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReminderConfig;
  onConfigChange: (updated: ReminderConfig) => void;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState<boolean>(true);
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [reminderTime, setReminderTime] = useState<string>(config.reminderTime || '21:00');
  const [customPrompt, setCustomPrompt] = useState<string>(
    config.customPrompt ||
      "A gentle romantic pause: take a moment to write today's shared memory in our eternal love journal."
  );
  const [testSent, setTestSent] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    setEnabled(config.enabled);
    setReminderTime(config.reminderTime);
    setCustomPrompt(config.customPrompt);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleEnablePermission = async () => {
    romanticAudio.playSoftClick();
    const newPerm = await requestNotificationPermission();
    setPermission(newPerm);

    if (newPerm === 'granted') {
      romanticAudio.playJournalSaved();
      showToast('Push notifications enabled for Ambika!');
      // Immediately send a welcome notification
      sendLoveNotification(
        'Ambika Rimal · Love Sanctuary ❤️',
        'Daily love reminders are now active! You will receive a sweet reminder every day at your scheduled time.'
      );
    } else if (newPerm === 'denied') {
      showToast('Notifications are blocked in your browser settings.');
    }
  };

  const handleSendTestNotification = () => {
    romanticAudio.playSoftClick();
    if (permission !== 'granted') {
      showToast('Please enable notifications first!');
      return;
    }

    const sent = sendLoveNotification(
      'Ambika, My Love 🌸',
      customPrompt || "Take a gentle pause together and write today's shared memory in our eternal love journal."
    );

    if (sent) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
      showToast('Test push notification sent! Check your device screen.');
    } else {
      showToast('Could not fire notification. Check browser permissions.');
    }
  };

  const handleSaveSettings = async () => {
    const updated: ReminderConfig = {
      ...config,
      enabled,
      reminderTime,
      customPrompt: customPrompt.trim(),
    };

    await loveDb.saveReminderConfig(updated);
    onConfigChange(updated);
    romanticAudio.playJournalSaved();
    showToast('Reminder schedule updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Toast Notice */}
      {toast && (
        <div className="fixed top-12 right-6 z-60 bg-rose-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-rose-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-rose-950">
                Daily Love Reminders
              </h3>
              <span className="text-[11px] font-sans text-rose-800/80">
                For Ambika Rimal & Her Love
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* PERMISSION STATUS CARD */}
          <div className="bg-[#FCF9F5] border border-rose-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Push Notification Status
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  permission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : permission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {permission === 'granted'
                  ? 'Active & Allowed'
                  : permission === 'denied'
                  ? 'Blocked in Browser'
                  : 'Needs Permission'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Receive a gentle reminder on your phone or desktop every single day so you never miss writing in your journal together.
            </p>

            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnablePermission}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>Allow Push Notifications</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Notifications Ready
                </span>
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="px-3 py-1.5 bg-white border border-rose-200 text-rose-900 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>{testSent ? 'Sent!' : 'Send Test Notification Now'}</span>
                </button>
              </div>
            )}
          </div>

          {/* SCHEDULE TIME */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>Daily Reminder Time</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-rose-200 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended: 9:00 PM (21:00) when settling in for the night.
            </p>
          </div>

          {/* CUSTOM REMINDER MESSAGE */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Custom Reminder Message for Ambika
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Write the sweet message that appears on her screen..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-rose-200 rounded-xl text-slate-800 font-sans focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* Helpful Tips */}
          <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-start gap-2.5 text-xs text-rose-950/80">
            <Smartphone className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Tip for iPhone & Android:</strong> Tap Share / Browser Menu and select <em>"Add to Home Screen"</em> to install Ambika's Love Sanctuary as a full native app icon on your phone!
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2 border-t border-rose-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Save Reminder Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
