import { create } from "zustand";
import type { UserRole } from "@app-types/shared.types";

type ActiveView = "provider" | "consumer";

interface RoleState {
  role: UserRole;
  activeView: ActiveView;
  setRole: (role: UserRole) => void;
  setActiveView: (view: ActiveView) => void;
  toggleView: () => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: "consumer",
  activeView: "consumer",
  setRole: (role) => set({ role }),
  setActiveView: (activeView) => set({ activeView }),
  toggleView: () =>
    set((state) => ({
      activeView:
        state.activeView === "provider" ? "consumer" : "provider",
    })),
}));
