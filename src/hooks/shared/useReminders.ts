import { useCallback } from "react";
import {
  scheduleReminder,
  scheduleMonthlyReminder,
  cancelReminder,
  cancelAllReminders,
  getScheduledReminders,
} from "@services/reminder.service";

/**
 * Hook for scheduling local notification reminders.
 */
export function useReminders() {
  const schedule = useCallback(
    async (params: {
      title: string;
      body: string;
      triggerDate: Date;
      data?: Record<string, unknown>;
    }) => {
      return scheduleReminder(params);
    },
    []
  );

  const scheduleMonthly = useCallback(
    async (params: {
      title: string;
      body: string;
      day: number;
      hour?: number;
      minute?: number;
      data?: Record<string, unknown>;
    }) => {
      return scheduleMonthlyReminder(params);
    },
    []
  );

  const cancel = useCallback(async (id: string) => {
    await cancelReminder(id);
  }, []);

  const cancelAll = useCallback(async () => {
    await cancelAllReminders();
  }, []);

  const getScheduled = useCallback(async () => {
    return getScheduledReminders();
  }, []);

  return {
    schedule,
    scheduleMonthly,
    cancel,
    cancelAll,
    getScheduled,
  };
}
