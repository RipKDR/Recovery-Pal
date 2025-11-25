/**
 * Notification Service
 * Handles scheduling and managing daily check-in reminders
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification identifiers
const DAILY_CHECKIN_NOTIFICATION_ID = 'daily-checkin-reminder';
const MILESTONE_NOTIFICATION_ID = 'milestone-celebration';
const MEETING_REMINDER_NOTIFICATION_ID = 'meeting-reminder';
const TIME_CAPSULE_NOTIFICATION_PREFIX = 'time-capsule-';

/**
 * Request notification permissions
 * @returns true if permissions granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android requires a channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
    });

    await Notifications.setNotificationChannelAsync('milestones', {
      name: 'Milestone Celebrations',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#10b981',
    });
  }

  return true;
}

/**
 * Schedule daily check-in reminder notification
 * @param checkInTime - Time in HH:mm format (e.g., "09:00")
 */
export async function scheduleDailyCheckinReminder(checkInTime: string): Promise<void> {
  // Cancel existing daily reminder first
  await cancelDailyCheckinReminder();

  // Parse the time
  const [hours, minutes] = checkInTime.split(':').map(Number);

  // Create a trigger for daily repeating notification
  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: hours,
    minute: minutes,
  };

  // Motivational messages that rotate
  const messages = [
    { title: '🌅 Time for your check-in', body: 'How are you feeling today? Take a moment to reflect.' },
    { title: '💪 Daily check-in time', body: 'One day at a time. Let\'s see how you\'re doing.' },
    { title: '🌱 Recovery moment', body: 'Your daily check-in is waiting. Every day matters.' },
    { title: '✨ Check in with yourself', body: 'A few minutes of reflection can make a big difference.' },
    { title: '🌟 Time to check in', body: 'You\'re doing great. Let\'s log how today is going.' },
  ];

  // Pick a random message (will rotate naturally since we reschedule)
  const message = messages[Math.floor(Math.random() * messages.length)];

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_CHECKIN_NOTIFICATION_ID,
    content: {
      title: message.title,
      body: message.body,
      data: { screen: 'checkin' },
      sound: true,
      badge: 1,
    },
    trigger,
  });

  console.log(`Daily check-in reminder scheduled for ${checkInTime}`);
}

/**
 * Cancel the daily check-in reminder
 */
export async function cancelDailyCheckinReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_CHECKIN_NOTIFICATION_ID);
}

/**
 * Schedule a milestone celebration notification
 * @param title - Milestone title
 * @param days - Number of days achieved
 */
export async function scheduleMilestoneNotification(
  title: string,
  days: number
): Promise<void> {
  const messages = [
    `🎉 Incredible! You've reached ${title}!`,
    `🏆 ${days} days! You're an inspiration!`,
    `⭐ ${title} achieved! Keep shining!`,
  ];

  await Notifications.scheduleNotificationAsync({
    identifier: `${MILESTONE_NOTIFICATION_ID}-${days}`,
    content: {
      title: `🎊 Milestone Unlocked!`,
      body: messages[Math.floor(Math.random() * messages.length)],
      data: { screen: 'progress', milestone: days },
      sound: true,
      badge: 1,
    },
    trigger: null, // Immediate
  });
}

/**
 * Schedule a gentle meeting reminder notification
 * Triggered when user hasn't logged a meeting in a while
 * @param daysSinceLastMeeting - Number of days since last meeting
 */
export async function scheduleMeetingReminder(
  daysSinceLastMeeting: number
): Promise<void> {
  // Cancel existing meeting reminder first
  await cancelMeetingReminder();

  // Only send reminder if it's been more than 7 days
  if (daysSinceLastMeeting <= 7) return;

  const messages = [
    {
      title: '🤝 Time for a meeting?',
      body: `It's been ${daysSinceLastMeeting} days since your last meeting. Meetings help!`,
    },
    {
      title: '💭 Consider a meeting',
      body: 'Meeting makers make it. When was your last one?',
    },
    {
      title: '📍 Recovery reminder',
      body: 'Connection is key. A meeting might be just what you need.',
    },
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  // Schedule for next day at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    identifier: MEETING_REMINDER_NOTIFICATION_ID,
    content: {
      title: message.title,
      body: message.body,
      data: { screen: 'meetings' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow,
    },
  });

  console.log(`Meeting reminder scheduled for ${tomorrow.toISOString()}`);
}

/**
 * Cancel meeting reminder
 */
export async function cancelMeetingReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(MEETING_REMINDER_NOTIFICATION_ID);
}

/**
 * Send immediate meeting encouragement after logging a meeting
 * @param moodImprovement - The mood change after the meeting
 */
export async function sendMeetingEncouragement(moodImprovement: number): Promise<void> {
  if (moodImprovement > 0) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'meeting-encouragement',
      content: {
        title: '📈 Great job!',
        body: `Your mood improved by ${moodImprovement} points after that meeting. Keep it up!`,
        data: { screen: 'meetings' },
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
      },
    });
  }
}

/**
 * Schedule a time capsule unlock notification
 * @param capsuleId - The capsule ID
 * @param title - The capsule title
 * @param unlockDate - When the capsule should be unlocked
 */
export async function scheduleTimeCapsuleNotification(
  capsuleId: string,
  title: string,
  unlockDate: Date
): Promise<void> {
  // Don't schedule if unlock date is in the past
  if (unlockDate <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `${TIME_CAPSULE_NOTIFICATION_PREFIX}${capsuleId}`,
    content: {
      title: '💌 Time Capsule Ready!',
      body: `Your time capsule "${title}" is ready to be opened.`,
      data: { screen: 'capsule', capsuleId },
      sound: true,
      badge: 1,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: unlockDate,
    },
  });

  console.log(`Time capsule notification scheduled for ${unlockDate.toISOString()}`);
}

/**
 * Cancel a time capsule notification
 */
export async function cancelTimeCapsuleNotification(capsuleId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    `${TIME_CAPSULE_NOTIFICATION_PREFIX}${capsuleId}`
  );
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Clear badge count
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Add notification response listener
 * Call this in app root to handle notification taps
 */
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Add notification received listener
 * Called when notification is received while app is in foreground
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Initialize notifications on app startup
 * Re-schedules notifications if enabled in settings
 */
export async function initializeNotifications(
  enabled: boolean,
  checkInTime: string
): Promise<void> {
  if (enabled) {
    const hasPermission = await requestNotificationPermissions();
    if (hasPermission) {
      await scheduleDailyCheckinReminder(checkInTime);
    }
  } else {
    await cancelDailyCheckinReminder();
  }
  
  // Always clear badge on app open
  await clearBadge();
}

