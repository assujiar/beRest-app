import { supabase } from "./supabase";
import type { Profile } from "@app-types/shared.types";

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  return { data, error };
}

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  return { data, error };
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  return { data: data as Profile | null, error };
}

export function onAuthStateChange(
  callback: (session: { access_token: string; user: { id: string } } | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      callback({
        access_token: session.access_token,
        user: { id: session.user.id },
      });
    } else {
      callback(null);
    }
  });
}
