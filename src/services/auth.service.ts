import { supabase, isSupabaseConfigured } from "./supabase";
import type { Profile, AuthMethod } from "@app-types/shared.types";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

const CONFIG_ERROR = {
  data: null,
  error: {
    message: "Aplikasi belum terhubung ke server. Hubungi developer untuk setup.",
  } as any,
};

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "598472364540-8el2ldsh0lql0qf5js7hlgk3l0s3omjj.apps.googleusercontent.com";

// ─── Google OAuth ───────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) return CONFIG_ERROR;
  try {
    const redirectUri = makeRedirectUri({ native: "apick://auth/callback" });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
        queryParams: {
          client_id: WEB_CLIENT_ID,
        },
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("No OAuth URL returned");

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
    );

    if (result.type === "success") {
      const url = new URL(result.url);
      // Handle fragment (#) params from Supabase OAuth
      const params = new URLSearchParams(
        url.hash ? url.hash.substring(1) : url.search.substring(1),
      );
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        return { data: sessionData, error: sessionError };
      }
    }

    return { data: null, error: { message: "Login Google dibatalkan." } as any };
  } catch (err: any) {
    return {
      data: null,
      error: { message: err.message ?? "Login Google gagal. Coba lagi ya." } as any,
    };
  }
}

// ─── Phone OTP (WhatsApp/SMS) ───────────────────────────────────

export async function signInWithPhone(phone: string) {
  if (!isSupabaseConfigured) return CONFIG_ERROR;
  const { data, error } = await supabase.auth.signInWithOtp({ phone }).catch((err) => ({
    data: null as any,
    error: { message: err?.message ?? "Network request failed" } as any,
  }));
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("network") || msg.includes("fetch")) {
      error.message = "Tidak bisa terhubung ke server. Cek koneksi internet kamu ya.";
    } else if (msg.includes("rate limit") || msg.includes("too many")) {
      error.message = "Terlalu sering kirim OTP. Tunggu beberapa menit ya.";
    } else if (msg.includes("invalid") && msg.includes("phone")) {
      error.message = "Format nomor HP tidak valid. Coba pakai format 08xx.";
    } else if (msg.includes("not authorized") || msg.includes("unverified")) {
      error.message = "Nomor ini belum bisa menerima OTP. Hubungi admin.";
    } else if (msg.includes("whatsapp") || msg.includes("twilio")) {
      error.message = "Gagal kirim OTP via WhatsApp. Pastikan nomor terdaftar di WhatsApp.";
    }
  }
  return { data, error };
}

export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("expired")) {
      error.message = "Kode OTP sudah kedaluwarsa. Kirim ulang ya.";
    } else if (msg.includes("invalid") || msg.includes("token")) {
      error.message = "Kode OTP salah. Cek lagi ya.";
    }
  }
  return { data, error };
}

// ─── Email OTP ──────────────────────────────────────────────────

export async function signInWithEmail(email: string) {
  if (!isSupabaseConfigured) return CONFIG_ERROR;
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "apick://auth/callback",
    },
  }).catch((err) => ({
    data: null as any,
    error: { message: err?.message ?? "Network request failed" } as any,
  }));
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("network") || msg.includes("fetch")) {
      error.message = "Tidak bisa terhubung ke server. Cek koneksi internet kamu ya.";
    } else if (msg.includes("rate limit") || msg.includes("too many")) {
      error.message = "Terlalu sering kirim kode. Tunggu beberapa menit ya.";
    } else if (msg.includes("invalid") && msg.includes("email")) {
      error.message = "Format email tidak valid. Cek lagi ya.";
    }
  }
  return { data, error };
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("expired")) {
      error.message = "Kode OTP sudah kedaluwarsa. Kirim ulang ya.";
    } else if (msg.includes("invalid") || msg.includes("token")) {
      error.message = "Kode OTP salah. Cek lagi ya.";
    }
  }
  return { data, error };
}

// ─── Account Linking ────────────────────────────────────────────

export async function linkPhone(phone: string) {
  const { data, error } = await supabase.auth.updateUser({ phone });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("exists")) {
      error.message = "Nomor HP ini sudah dipakai akun lain.";
    } else {
      error.message = "Gagal menghubungkan nomor HP. Coba lagi ya.";
    }
  }
  return { data, error };
}

export async function verifyPhoneLink(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "phone_change",
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("expired")) {
      error.message = "Kode OTP sudah kedaluwarsa. Kirim ulang ya.";
    } else if (msg.includes("invalid") || msg.includes("token")) {
      error.message = "Kode OTP salah. Cek lagi ya.";
    }
  }
  return { data, error };
}

export async function linkEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("exists")) {
      error.message = "Email ini sudah dipakai akun lain.";
    } else {
      error.message = "Gagal menghubungkan email. Coba lagi ya.";
    }
  }
  return { data, error };
}

export async function verifyEmailLink(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email_change",
  });
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("expired")) {
      error.message = "Kode OTP sudah kedaluwarsa. Kirim ulang ya.";
    } else if (msg.includes("invalid") || msg.includes("token")) {
      error.message = "Kode OTP salah. Cek lagi ya.";
    }
  }
  return { data, error };
}

export async function linkGoogle() {
  // Google linking uses the same OAuth flow, Supabase merges identities
  return signInWithGoogle();
}

export async function getLinkedAuthMethods(_userId: string): Promise<AuthMethod[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const methods: AuthMethod[] = [];

  if (user.phone) methods.push("phone");
  if (user.email) methods.push("email");

  const hasGoogle = user.identities?.some((i) => i.provider === "google");
  if (hasGoogle) methods.push("google");

  return methods;
}

export async function syncLinkedMethods(userId: string) {
  const methods = await getLinkedAuthMethods(userId);
  await upsertProfile(userId, { linked_auth_methods: methods });
  return methods;
}

// ─── Session / Profile ──────────────────────────────────────────

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
