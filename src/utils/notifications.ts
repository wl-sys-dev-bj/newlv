import { ReminderConfig } from '../types';

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
};

export const sendLoveNotification = (
  title: string,
  body: string,
  options?: { tag?: string; icon?: string }
): boolean => {
  if (!isNotificationSupported()) return false;

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: options?.icon || 'https://api.iconify.design/lucide:heart.svg?color=%23e11d48',
        tag: options?.tag || 'daily-love-reminder',
        badge: 'https://api.iconify.design/lucide:heart.svg?color=%23e11d48',
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch (err) {
      console.warn('Error firing browser notification:', err);
      return false;
    }
  }
  return false;
};

export const checkAndTriggerDailyReminder = (config: ReminderConfig): boolean => {
  if (!config.enabled) return false;

  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  const todayString = now.toISOString().split('T')[0];

  // If already notified today, do not spam
  if (config.lastNotifiedDate === todayString) {
    return false;
  }

  // Check if current time matches or has passed the scheduled reminder time within 10 minutes
  const [targetH, targetM] = config.reminderTime.split(':').map(Number);
  const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const targetTotalMinutes = targetH * 60 + targetM;

  if (nowTotalMinutes >= targetTotalMinutes && nowTotalMinutes <= targetTotalMinutes + 15) {
    const sent = sendLoveNotification(
      'Ambika, My Love 🌸 Time for Our Daily Journal',
      config.customPrompt || "Take a gentle pause together and write today's shared memory in our eternal love journal.",
      { tag: 'scheduled-daily-love' }
    );
    return sent;
  }

  return false;
};
