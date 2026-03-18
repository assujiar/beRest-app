import { useState, useEffect, useCallback } from "react";
import {
  getConsumerConnections,
  getArchivedConnections,
  connectByCode,
  disconnectConnection,
} from "@services/connection.service";
import { useConnectionsStore } from "@stores/connections.store";
import type { ConsumerConnection } from "@app-types/shared.types";

/**
 * Hook for consumer connection management: list, connect, disconnect, archive.
 */
export function useConnections(consumerId: string | null) {
  const connections = useConnectionsStore((s) => s.connections);
  const setConnections = useConnectionsStore((s) => s.setConnections);
  const archivedConnections = useConnectionsStore((s) => s.archivedConnections);
  const setArchivedConnections = useConnectionsStore(
    (s) => s.setArchivedConnections
  );
  const [loading, setLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    if (!consumerId) return;
    setLoading(true);
    try {
      const [active, archived] = await Promise.all([
        getConsumerConnections(consumerId),
        getArchivedConnections(consumerId),
      ]);
      setConnections(active);
      setArchivedConnections(archived);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [consumerId, setConnections, setArchivedConnections]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const connect = useCallback(
    async (code: string): Promise<ConsumerConnection> => {
      if (!consumerId) throw new Error("User not authenticated");
      const conn = await connectByCode(consumerId, code);
      setConnections([conn, ...connections]);
      return conn;
    },
    [consumerId, connections, setConnections]
  );

  const disconnect = useCallback(
    async (connectionId: string, reason?: string) => {
      await disconnectConnection(connectionId, "consumer", reason);
      await fetchConnections();
    },
    [fetchConnections]
  );

  return {
    connections,
    archivedConnections,
    loading,
    refresh: fetchConnections,
    connect,
    disconnect,
  };
}
