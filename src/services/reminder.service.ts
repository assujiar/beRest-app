import * as Notifications from "expo-notifications";

/** Schedule a local notification reminder */
export async function scheduleReminder(params: {
  title: string;
  body: string;
  triggerDate: Date;
  data?: Record<string, unknown>;
}): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: params.triggerDate,
    },
  });
  return id;
}

/** Schedule a recurring reminder (e.g., monthly billing) */
export async function scheduleMonthlyReminder(params: {
  title: string;
  body: string;
  day: number; // 1-28
  hour?: number;
  minute?: number;
  data?: Record<string, unknown>;
}): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      data: params.data ?? {},
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: params.day,
      hour: params.hour ?? 8,
      minute: params.minute ?? 0,
    },
  });
  return id;
}

/** Cancel a scheduled reminder */
export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/** Cancel all scheduled reminders */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Get all scheduled reminders */
export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}
