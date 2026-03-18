import * as Notifications from "expo-notifications";
import { supabase } from "./supabase";
import type { Notification } from "@app-types/consumer.types";
import type { ModuleKey } from "@app-types/shared.types";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Register push token with Supabase */
export async function registerPushToken(userId: string): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  const token = await Notifications.getExpoPushTokenAsync();

  await supabase.from("push_tokens").upsert({
    user_id: userId,
    token: token.data,
    updated_at: new Date().toISOString(),
  });
}

/** Get in-app notifications for a user */
export async function getNotifications(
  userId: string,
  limit = 50
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Notification[];
}

/** Mark notification as read */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/** Mark all notifications as read */
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}

/** Get unread count */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

/** Create a notification (called by provider actions) */
export async function createNotification(params: {
  userId: string;
  providerId: string;
  module: ModuleKey;
  type: Notification["type"];
  title: string;
  body?: string;
  referenceType?: string;
  referenceId?: string;
  deepLink?: string;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    provider_id: params.providerId,
    module: params.module,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    reference_type: params.referenceType ?? null,
    reference_id: params.referenceId ?? null,
    deep_link: params.deepLink ?? null,
    is_read: false,
  });

  if (error) throw error;
}
