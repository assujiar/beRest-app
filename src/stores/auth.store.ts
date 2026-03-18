import { create } from "zustand";
import type { Profile } from "@app-types/shared.types";

interface AuthState {
  session: { access_token: string; user: { id: string } } | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: AuthState["session"]) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, profile: null, isLoading: false }),
}));
