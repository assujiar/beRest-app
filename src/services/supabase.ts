import "react-native-url-polyfill/auto";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@config/supabase.config";

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

function createSafeClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    console.error(
      "[Apick] Supabase env vars missing! Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
    return createClient(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder",
      {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false, // We handle refresh manually via AppState
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // Manually refresh token when app comes to foreground
  // This prevents unhandled network errors during cold start
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      client.auth.startAutoRefresh();
    } else {
      client.auth.stopAutoRefresh();
    }
  });

  return client;
}

export const supabase = createSafeClient();
