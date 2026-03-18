import { useState, useEffect, useCallback } from "react";
import { getConsumerConnections } from "@services/connection.service";
import { getUnreadCount } from "@services/notification.service";
import { useConnectionsStore } from "@stores/connections.store";
import type { ConsumerConnection, ModuleKey } from "@app-types/shared.types";

interface DashboardData {
  connections: ConsumerConnection[];
  unreadNotifications: number;
  byModule: Record<ModuleKey, ConsumerConnection[]>;
}

/**
 * Hook that aggregates consumer dashboard data: connections grouped by module + unread count.
 */
export function useConsumerDashboard(consumerId: string | null) {
  const setConnections = useConnectionsStore((s) => s.setConnections);
  const [data, setData] = useState<DashboardData>({
    connections: [],
    unreadNotifications: 0,
    byModule: { lapak: [], sewa: [], warga: [], hajat: [] },
  });
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!consumerId) return;
    setLoading(true);
    try {
      const [conns, unread] = await Promise.all([
        getConsumerConnections(consumerId),
        getUnreadCount(consumerId),
      ]);

      setConnections(conns);

      const byModule: Record<ModuleKey, ConsumerConnection[]> = {
        lapak: [],
        sewa: [],
        warga: [],
        hajat: [],
      };
      for (const c of conns) {
        byModule[c.module].push(c);
      }

      setData({ connections: conns, unreadNotifications: unread, byModule });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [consumerId, setConnections]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, refresh: fetch };
}
