import { create } from "zustand";
import type { ConsumerConnection } from "@app-types/shared.types";

interface ConnectionsState {
  connections: ConsumerConnection[];
  archivedConnections: ConsumerConnection[];
  setConnections: (connections: ConsumerConnection[]) => void;
  setArchivedConnections: (connections: ConsumerConnection[]) => void;
}

export const useConnectionsStore = create<ConnectionsState>((set) => ({
  connections: [],
  archivedConnections: [],
  setConnections: (connections) => set({ connections }),
  setArchivedConnections: (archivedConnections) =>
    set({ archivedConnections }),
}));
