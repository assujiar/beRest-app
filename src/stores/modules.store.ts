import { create } from "zustand";
import type { ModuleKey } from "@app-types/shared.types";

interface ModulesState {
  activeModules: ModuleKey[];
  setActiveModules: (modules: ModuleKey[]) => void;
  toggleModule: (module: ModuleKey) => void;
  isModuleActive: (module: ModuleKey) => boolean;
}

export const useModulesStore = create<ModulesState>((set, get) => ({
  activeModules: [],
  setActiveModules: (activeModules) => set({ activeModules }),
  toggleModule: (module) =>
    set((state) => ({
      activeModules: state.activeModules.includes(module)
        ? state.activeModules.filter((m) => m !== module)
        : [...state.activeModules, module],
    })),
  isModuleActive: (module) => get().activeModules.includes(module),
}));
