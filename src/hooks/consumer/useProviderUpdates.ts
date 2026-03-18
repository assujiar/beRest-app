import { useEffect } from "react";
import { supabase } from "@services/supabase";
import { useConnectionsStore } from "@stores/connections.store";
import type { ConsumerConnection } from "@app-types/shared.types";

/**
 * Subscribe to real-time updates for consumer connections and notifications.
 * Listens for INSERT/UPDATE on consumer_connections and notifications tables.
 */
export function useProviderUpdates(userId: string | null) {
  const setConnections = useConnectionsStore((s) => s.setConnections);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to connection changes
    const connectionChannel = supabase
      .channel(`connections:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consumer_connections",
          filter: `consumer_id=eq.${userId}`,
        },
        () => {
          // Refetch connections on any change
          fetchConnections(userId);
        }
      )
      .subscribe();

    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (_payload) => {
          // New notification received - could trigger local notification or badge update
        }
      )
      .subscribe();

    // Initial fetch
    fetchConnections(userId);

    return () => {
      supabase.removeChannel(connectionChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [userId]);

  async function fetchConnections(uid: string) {
    const { data } = await supabase
      .from("consumer_connections")
      .select("*")
      .eq("consumer_id", uid)
      .eq("status", "active")
      .order("connected_at", { ascending: false });

    if (data) {
      setConnections(data as ConsumerConnection[]);
    }
  }
}
